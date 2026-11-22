"""Renderer adapter (Remotion) + assembly (FFmpeg).

- Scene timing comes from the MEASURED narration: each scene's visuals span its own audio; nothing is padded or cut.
- Master video = one cached segment per scene (Remotion --frames range), so a revision to one scene re-renders only
  that segment (a timing change re-renders the scenes it shifts).
- Narration: per-scene WAVs placed on the timeline, two-pass loudness normalization to about -14 LUFS / -1.5 dBTP.
- Shorts get burned-in ASS captions; every format gets an SRT sidecar.
"""
from __future__ import annotations

import json
import os
import re
from pathlib import Path

import numpy as np

from .config import RENDERER_DIR, cfg
from .util import npx, promote, run, sha256_file, stable_hash

LEAD, GAP, TAIL = 0.15, 0.30, 0.7


def timeline(voice: dict, fps: int) -> tuple[list[dict], float]:
    """[{id, audio_start, audio_seconds, start_f, end_f}] and total seconds."""
    t, out = LEAD, []
    for s in voice["scenes"]:
        out.append({"id": s["id"], "audio_start": round(t, 3), "audio_seconds": s["seconds"]})
        t += s["seconds"] + GAP
    total = t - GAP + TAIL
    for i, s in enumerate(out):
        start = 0.0 if i == 0 else s["audio_start"] - GAP / 2
        end = total if i == len(out) - 1 else out[i + 1]["audio_start"] - GAP / 2
        s["start_f"], s["end_f"] = int(round(start * fps)), int(round(end * fps))
    return out, round(total, 3)


def props(job: dict, profile, board: list[dict], tl: list[dict], fmt: dict) -> dict:
    scenes = []
    for b, t in zip(board, tl):
        scenes.append({"id": b["id"], "type": b["type"], "start": t["start_f"], "end": t["end_f"], "params": b["params"]})
    return {"width": fmt["width"], "height": fmt["height"], "fps": fmt["fps"], "durationInFrames": tl[-1]["end_f"],
            "theme": profile.theme, "title": job["topic"], "scenes": scenes}


def renderer_version() -> str:
    files = sorted((RENDERER_DIR / "src").glob("*.ts*"))
    return stable_hash([sha256_file(f) for f in files] + [json.loads((RENDERER_DIR / "package.json").read_text())["dependencies"]])[:12]


def _remotion(args: list[str], public: Path) -> None:
    conc = str(os.environ.get("MYA_RENDER_CONCURRENCY", max(1, (os.cpu_count() or 2) - 1)))
    run([npx(), "--no-install", "remotion", *args, f"--public-dir={public}", f"--concurrency={conc}", "--log=error",
         "--timeout=120000"], cwd=RENDERER_DIR, timeout=7200)


def render_preview(p: dict, public: Path, out: Path) -> None:
    pj = out.with_suffix(".props.json")
    pj.write_text(json.dumps(p), encoding="utf-8")
    tmp = out.with_name(out.stem + ".tmp.mp4")
    _remotion(["render", "src/index.ts", "Main", str(tmp), f"--props={pj}", "--scale=0.5", "--crf=28", "--muted"], public)
    promote(tmp, out)


def render_segments(p: dict, public: Path, seg_dir: Path) -> tuple[list[Path], list[str]]:
    """Returns (segment files in order, ids of scenes actually rendered this time)."""
    seg_dir.mkdir(parents=True, exist_ok=True)
    pj = seg_dir / "props.json"
    pj.write_text(json.dumps(p), encoding="utf-8")
    rv = renderer_version()
    files, rendered = [], []
    for s in p["scenes"]:
        key = stable_hash({"scene": s, "theme": p["theme"], "w": p["width"], "h": p["height"], "fps": p["fps"], "r": rv,
                           "assets": [sha256_file(public / s["params"]["file"])] if s["type"] == "photo" else []})[:16]
        f = seg_dir / f"{s['id']}_{key}.mp4"
        if not f.exists():
            tmp = f.with_name(f.stem + ".tmp.mp4")
            _remotion(["render", "src/index.ts", "Main", str(tmp), f"--props={pj}", f"--frames={s['start']}-{s['end'] - 1}",
                       "--codec=h264", "--crf=16", "--pixel-format=yuv420p", "--muted"], public)
            promote(tmp, f)
            rendered.append(s["id"])
        files.append(f)
    keep = {f.name for f in files}
    for old in seg_dir.glob("*.mp4"):
        if old.name not in keep:
            old.unlink()
    return files, rendered


def concat(files: list[Path], out: Path) -> None:
    lst = out.with_suffix(".txt")
    lst.write_text("".join(f"file '{f.resolve().as_posix()}'\n" for f in files), encoding="utf-8")
    tmp = out.with_name(out.stem + ".tmp.mp4")
    run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", tmp])
    promote(tmp, out)


def narration(voice: dict, tl: list[dict], total: float, scene_dir: Path, out: Path) -> dict:
    import soundfile as sf
    sr = 24000
    buf = np.zeros(int(total * sr) + sr, dtype=np.float32)
    for s, t in zip(voice["scenes"], tl):
        a, r = sf.read(scene_dir / s["wav"], dtype="float32")
        i = int(t["audio_start"] * sr)
        buf[i:i + len(a)] += a
    buf = buf[: int(total * sr)]
    raw = out.with_name("narration_raw.wav")
    sf.write(raw, buf, sr, subtype="PCM_16")
    # two-pass loudness normalization (measured, then applied)
    m = run(["ffmpeg", "-hide_banner", "-i", raw, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"])
    js = json.loads(m[m.rindex("{"): m.rindex("}") + 1])
    af = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:"
          f"measured_LRA={js['input_lra']}:measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true,"
          "aresample=48000")
    tmp = out.with_name(out.stem + ".tmp.wav")
    run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", af, "-ar", "48000", "-ac", "2", tmp])
    promote(tmp, out)
    return {"input_i": js["input_i"], "target": -14, "true_peak_target": -1.5}


def master(visuals: Path, audio: Path, total: float, out: Path, ass_file: Path | None, fonts: Path) -> None:
    chain = []
    if ass_file:
        a = ass_file.resolve().as_posix().replace(":", "\\:")
        fd = fonts.resolve().as_posix().replace(":", "\\:")
        chain.append(f"ass='{a}':fontsdir='{fd}'")
    chain.append("scale=in_range=auto:out_range=tv,format=yuv420p")  # limited-range yuv420p on every FFmpeg (9 picks yuvj otherwise)
    vf = ["-vf", ",".join(chain)]
    tmp = out.with_name(out.stem + ".tmp.mp4")
    run(["ffmpeg", "-v", "error", "-y", "-i", visuals, "-i", audio, *vf, "-map", "0:v:0", "-map", "1:a:0",
         "-t", f"{total:.3f}", "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p",
         "-color_range", "tv", "-r", "30",
         "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", tmp], timeout=7200)
    promote(tmp, out)


def thumbnail(p: dict, public: Path, out: Path, long_form: bool) -> None:
    pj = out.with_suffix(".props.json")
    pj.write_text(json.dumps(p), encoding="utf-8")
    tmp = out.with_name(out.stem + ".tmp.png")
    run([npx(), "--no-install", "remotion", "still", "src/index.ts", "Thumb", str(tmp), f"--props={pj}",
         f"--public-dir={public}", "--log=error"], cwd=RENDERER_DIR, timeout=600)
    if long_form:  # YouTube thumbnails are 1280x720
        t2 = out.with_name(out.stem + ".tmp2.png")
        run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-vf", "scale=1280:720", t2])
        tmp.unlink()
        tmp = t2
    promote(tmp, out)


def contact_sheet(video: Path, tl: list[dict], fps: int, out: Path, width: int) -> list[float]:
    """Stills at each scene's start, middle and end (the review page and QC look at these)."""
    frames = []
    for s in tl:  # exact frame numbers: one still at each scene's start, middle and end
        a, b = s["start_f"], s["end_f"]
        frames += [min(b - 1, a + 10), (a + b) // 2, max(a, b - 9)]
    times = [f / fps for f in frames]
    sel = "+".join(f"eq(n\\,{f})" for f in frames)
    cols = 6 if width < 1500 else 4
    rows = -(-len(times) // cols)
    run(["ffmpeg", "-v", "error", "-y", "-i", video, "-vf",
         f"select='{sel}',scale={360 if width < 1500 else 480}:-1,tile={cols}x{rows}:padding=6:color=white",
         "-frames:v", "1", "-fps_mode", "vfr", out])  # -vsync was removed in FFmpeg 9
    return times
