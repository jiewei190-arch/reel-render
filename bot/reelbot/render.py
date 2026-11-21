"""Render stage, on the PC's GPU: build the composition, render with motion blur, mix, set loudness, QA, export."""
from __future__ import annotations

import hashlib
import json
import os
import shutil
import subprocess
import time
from pathlib import Path

from . import lambda_render, sound
from .config import CFG


def _pascal(slug: str) -> str:
    return "".join(w[:1].upper() + w[1:] for w in slug.split("-")) + "Recipe"


def _run(cmd: list[str], *, env: dict | None = None, cwd: Path | None = None) -> str:
    print("  $", " ".join(cmd))
    r = subprocess.run(cmd, cwd=cwd or CFG.render_root, env={**os.environ, **(env or {})},
                       capture_output=True, text=True, encoding="utf-8", errors="replace")
    if r.returncode != 0:
        raise SystemExit(f"command failed ({r.returncode}):\n{(r.stdout + r.stderr)[-4000:]}")
    return r.stdout


def _next_version(name: str) -> int:
    d = CFG.render_root / "out" / "renders"
    n = 1
    while (d / f"{name}{n}.mp4").exists() or (d / f"{name}{n}_sub.mp4").exists():
        n += 1
    return n


def _sha(p: Path) -> str:
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def _loudness(p: Path) -> str:
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(p), "-map", "0:a", "-af", "ebur128=peak=true", "-f", "null", "-"],
                       capture_output=True, text=True, encoding="utf-8", errors="replace")
    lines = [l.strip() for l in r.stderr.splitlines() if l.strip().startswith(("I:", "Peak:"))]
    return " ".join(lines[-2:])


def _whisper_check(video: Path, lines: list[str]) -> str:
    try:
        from faster_whisper import WhisperModel  # optional: pip install faster-whisper
    except ImportError:
        return "skipped (pip install faster-whisper to enable)"
    model = WhisperModel("small.en", device="auto", compute_type="auto")
    segs, _ = model.transcribe(str(video))
    heard = " ".join(s.text.strip() for s in segs).lower()
    norm = lambda s: "".join(c for c in s.lower() if c.isalnum() or c == " ").split()
    want, got = norm(" ".join(lines)), set(norm(heard))
    missing = [w for w in want if not w.isdigit() and w not in got]
    return f"heard {len(norm(heard))} words; {len(missing)} script words not heard" + (f": {missing[:15]}" if missing else "")


def motion_blur() -> bool:
    """Off by default (owner's call, Nov 2026): 4x faster renders and the difference is barely visible."""
    return os.environ.get("REELBOT_MOTION_BLUR", "0") == "1"


def _gpu_lock() -> list[str]:
    """Wrap renders in the engine's gpu_lock.py when it exists, so two renders never fight over the GPU."""
    for d in (os.environ.get("BLOCKY_SCRIPTS"), CFG.render_root / "scripts", CFG.render_root.parent / "scripts"):
        if d and (Path(d) / "gpu_lock.py").exists():
            return [CFG.python, "-I", str(Path(d) / "gpu_lock.py"), "--"]
    return []


def _render_plain(comp: str, muted: Path) -> None:
    """No-blur render: the 30 fps composition straight through Remotion on the GPU, then a clean h264 encode."""
    npx = shutil.which("npx") or "npx"
    print(f"  render: {comp} on the GPU, no motion blur")
    t0 = time.time()
    _run([npx, "--no-install", "tsc", "--noEmit"])
    _run([npx, "--no-install", "remotion", "bundle", "src/index.toolkit.ts", "--out-dir=build"])
    raw = muted.with_name(muted.stem + "_raw.mp4")
    muted.parent.mkdir(parents=True, exist_ok=True)
    _run(_gpu_lock() + [npx, "--no-install", "remotion", "render", "build", comp, str(raw), "--gl=angle",
                        "--timeout=240000", f"--concurrency={os.environ.get('CONC', '8')}", "--codec=h264", "--crf=12",
                        "--pixel-format=yuv420p", "--muted", "--log=error"])
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-r", "30", "-c:v", "libx264", "-crf", "16",
                    "-preset", "slow", "-pix_fmt", "yuv420p", "-an", "-map_metadata", "-1", "-movflags", "+faststart",
                    str(muted)], check=True)
    raw.unlink(missing_ok=True)
    print(f"  render: done in {time.time() - t0:.0f} s")


def render(folder: Path, *, out_dir: Path | None = None, on: str | None = None) -> Path:
    data = json.loads((folder / "script.json").read_text(encoding="utf-8"))
    slug = data["slug"]
    comp = _pascal(slug)
    name = slug.replace("-", "_") + "_v"

    print("  build: recipe -> composition + QA")
    _run([CFG.node, "tools/recipe_build.mjs", slug, "--shorts", str(CFG.shorts_dir)])

    n = _next_version(name)
    muted = CFG.render_root / "out" / "renders" / f"{name}{n}.mp4"
    on = on or os.environ.get("REELBOT_RENDER_ON", "pc")
    blur = motion_blur()
    if on == "lambda":
        muted.parent.mkdir(parents=True, exist_ok=True)
        lambda_render.render(comp, muted, blur=blur)
    elif blur:
        print(f"  render: {comp}Sub on the GPU with motion blur (version {n}); 4x slower")
        _run([CFG.bash, "render.sh", str(n), comp + "Sub"], env={"NAME": name, "ENTRY": "src/index.toolkit.ts"})
    else:
        _render_plain(comp, muted)

    tmp = CFG.render_root / "out" / "tmp"
    tmp.mkdir(parents=True, exist_ok=True)
    if os.environ.get("REELBOT_SOUND_DESIGN", "1") != "0":
        try:
            sound.design(folder, tmp / f"{slug}.cues.json", comp)
        except Exception as e:  # never lose a render over sound design
            print(f"  sound design skipped: {e}")
    premix = tmp / f"{slug}_premix.wav"
    print("  audio: voice + music + sfx mix")
    _run([CFG.python, "tools/story_mix.py", comp, str(folder / "voice.wav"), str(CFG.audio_dir), str(premix)],
         env={"STORY_CUES": str(tmp / f"{slug}.cues.json")})
    voiced = tmp / f"{slug}_v{n}_voiced.mp4"
    if voiced.exists():
        voiced.unlink()
    print("  audio: loudness to -14 LUFS")
    _run([CFG.bash, "tools/mux_voice.sh", str(muted), str(premix), str(voiced)], env={"TPMAX": "-1.5"})

    dest = (out_dir or CFG.output_dir) / slug
    dest.mkdir(parents=True, exist_ok=True)
    final = dest / "video.mp4"
    shutil.copy2(voiced, final)
    for f in ("UPLOAD.md", "sources.md", "script.txt"):
        if (folder / f).exists():
            shutil.copy2(folder / f, dest / f)
    sha = _sha(final)
    (dest / "video.sha256").write_text(f"{sha}  video.mp4\n", encoding="utf-8")

    print("  qa: loudness + whisper")
    qa = (f"# QA: {slug}\n\n- version: {name}{n} ({comp}Sub)\n- sha256: {sha}\n- loudness: {_loudness(final)}\n"
          f"- whisper: {_whisper_check(final, data['lines'])}\n"
          f"- fact-check cleared: {not data.get('factcheck_unresolved', False)}\n"
          f"- recipe QA report: {folder / 'RECIPE_QA.md'}\n")
    (dest / "QA.md").write_text(qa, encoding="utf-8")
    print(qa)
    return final
