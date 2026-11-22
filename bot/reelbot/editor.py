"""Editor stage: two AI editors watch every finished render, and the bot fixes what they find before you see it.

1. Gemini watches the whole video (motion + sound + captions), like a viewer scrolling Shorts, and returns a
   timestamped list of problems with a fix for each, plus scores for the hook, pacing, readability, payoff and loop.
2. Claude looks at stills from the critical moments (every 0.5 s of the first 3 s, then every 2 s) for visual problems:
   text covering faces, unreadable boards, empty frames, clipping, a weak first frame.
3. If either finds a blocker/major issue or the hook scores under the bar, Claude rewrites the shot recipe to fix
   exactly those moments, the engine's checker re-validates it, and the Short is re-rendered. Up to N rounds.
Everything is logged in EDIT_REPORT.md next to the video.
"""
from __future__ import annotations

import base64
import json
import subprocess
import tempfile
import time
from pathlib import Path

try:
    from google.genai import types
except ImportError:
    types = None

from . import claude, gemini, learn
from .config import CFG
from .cost import COST

HOOK_BAR = 7.5      # 0-1 s hook score needed to pass
OVERALL_BAR = 7.0   # overall score needed to pass

ISSUE = {
    "type": "object", "additionalProperties": False,
    "required": ["t_start", "t_end", "severity", "category", "problem", "fix"],
    "properties": {
        "t_start": {"type": "number"}, "t_end": {"type": "number"},
        "severity": {"type": "string", "enum": ["blocker", "major", "minor"]},
        "category": {"type": "string", "enum": ["hook", "pacing", "dead_air", "readability", "framing", "audio", "tone",
                                                "accuracy", "payoff", "loop", "other"]},
        "problem": {"type": "string"}, "fix": {"type": "string"},
    },
}
REVIEW_SCHEMA = {
    "type": "object", "additionalProperties": False,
    "required": ["scores", "predicted_stayed_pct", "issues", "verdict"],
    "properties": {
        "scores": {"type": "object", "additionalProperties": False,
                   "required": ["hook", "pacing", "readability", "payoff", "loop", "overall"],
                   "properties": {k: {"type": "number"} for k in ("hook", "pacing", "readability", "payoff", "loop", "overall")}},
        "predicted_stayed_pct": {"type": "number"},
        "issues": {"type": "array", "items": ISSUE},
        "verdict": {"type": "string"},
    },
}
VISUAL_SCHEMA = {
    "type": "object", "additionalProperties": False, "required": ["issues", "first_frame_score"],
    "properties": {"issues": {"type": "array", "items": ISSUE}, "first_frame_score": {"type": "number"}},
}

ACCURACY = (" ACCURACY: compare every number, name and claim shown on screen with the script. A board that contradicts "
            "the narration (a different amount, 'AWARDED' when the voice says he got nothing), a counter caught "
            "mid-count or stopping at the wrong value, or text cut off so it reads as something else, is a blocker.")

EDITOR_BRIEF = (
    "You are a ruthless YouTube Shorts editor whose only goal is viewer retention. Watch this Short exactly as a "
    "stranger scrolling at speed would. Score 1-10: hook (frame 0 to 1 s: would they stop?), pacing (anything slow, "
    "static or repetitive?), readability (can every on-screen number/word be read at phone size in time?), payoff "
    "(does the reveal land and feel worth it?), loop (does the end flow back into the start?), overall. Predict the "
    "stayed-to-watch %. Then list every problem with exact timestamps in seconds, a severity (blocker = would make "
    "people swipe or is wrong; major = clearly hurts retention; minor = polish) and a concrete fix in terms of shots, "
    "camera, boards/text, timing or sound. Be specific; do not praise. "
    "Listen for TONE: if the narrator's emotion or a sound effect doesn't fit what is being said (an upbeat or joking "
    "delivery, or a comedic sound, on a sad/serious moment; flat delivery on the big payoff), that is a 'tone' issue, "
    "severity major or blocker." + ACCURACY
)


LONG_BRIEF = (
    "You are a YouTube editor for LONG-FORM videos (8-12 min, 16:9, chapters). The length is intended: never suggest "
    "cutting it into a Short. Your goal is average view duration. Score 1-10: hook (the first 30 s: a cold open that "
    "shows the most shocking moment and a clear promise of what the viewer will get), pacing (a visual change every "
    "3-6 s, a re-hook every 60-90 s, no dead stretches), readability (every on-screen number/word readable on a phone "
    "in time, nothing clipped), payoff (the promise is delivered and the ending lands), loop (= structure: chapters "
    "clear, each with its own mini-cliffhanger), overall. Predict the % of viewers still watching at the 30-second "
    "mark. Then list every problem with exact timestamps, a severity (blocker = wrong or would make people leave; "
    "major = clearly hurts watch time; minor = polish) and a concrete fix in shots, camera, boards/text, timing or "
    "sound. Be specific; do not praise." + ACCURACY
)


def _is_long(video: Path) -> bool:
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height",
                        "-of", "csv=p=0", str(video)], capture_output=True, text=True)
    try:
        w, h = (int(x) for x in r.stdout.strip().split(",")[:2])
        return w > h or _duration(video) > 120
    except ValueError:
        return _duration(video) > 120


def _frames(video: Path, times: list[float]) -> list[tuple[float, str]]:
    out = []
    with tempfile.TemporaryDirectory() as d:
        for t in times:
            f = Path(d) / f"f_{t:06.2f}.jpg"
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.2f}", "-i", str(video), "-frames:v", "1",
                            "-vf", "scale=540:-1", "-q:v", "4", str(f)], check=False)
            if f.exists():
                out.append((t, base64.b64encode(f.read_bytes()).decode()))
    return out


def _duration(video: Path) -> float:
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(video)],
                       capture_output=True, text=True)
    return float(r.stdout.strip() or 0)


def gemini_review(video: Path, script_lines: list[str]) -> dict:
    print("  editor (gemini): watching the video...")
    f = gemini.client().files.upload(file=str(video))
    for _ in range(60):
        if f.state and f.state.name == "ACTIVE":
            break
        if f.state and f.state.name == "FAILED":
            raise RuntimeError("Gemini could not process the video file")
        time.sleep(3)
        f = gemini.client().files.get(name=f.name)
    data = learn.current()
    prompt = ((LONG_BRIEF if _is_long(video) else EDITOR_BRIEF) + "\n\nThe script (for accuracy):\n" + "\n".join(script_lines)
              + (f"\n\nWhat has held viewers on this channel so far:\n{data}" if data else ""))
    resp = gemini.client().models.generate_content(
        model=CFG.gemini_model, contents=[f, prompt],
        config=types.GenerateContentConfig(response_mime_type="application/json", response_json_schema=REVIEW_SCHEMA))
    COST.gemini_calls += 1
    try:
        gemini.client().files.delete(name=f.name)
    except Exception:
        pass
    return json.loads(resp.text)


def claude_review(video: Path) -> dict:
    dur, long = _duration(video), _is_long(video)
    if long:  # ~90 stills across the whole video (an image cap per request), denser in the first 30 s
        times = [0.0, 1.0, 2.0, 3.0, 5.0, 8.0, 12.0, 16.0, 20.0, 25.0, 30.0] + [float(t) for t in range(36, int(dur), max(6, int(dur / 80)))]
    else:
        times = [0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0] + [t for t in range(5, int(dur), 2)] + [max(0.0, dur - 0.3)]
    frames = _frames(video, times)
    print(f"  editor (claude): checking {len(frames)} stills...")
    content: list = [{"type": "text", "text":
        ("Stills from a 1920x1080 long-form YouTube video (the length is intended)" if long else
         "Stills from a 1080x1920 YouTube Short") + ", labelled with their time. Find visual problems that cost retention: "
        "a weak or unclear first frame, text or boards covering faces, captions overlapping boards, text too small or "
        "cut off at the edge, characters clipping into props or the floor, empty/dark frames, the same shot held too "
        "long. Give exact times, severity and a concrete fix. Score the first frame 1-10 as a scroll-stopper."}]
    for t, b64 in frames:
        content.append({"type": "text", "text": f"t = {t:.1f} s"})
        content.append({"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": b64}})
    return claude.ask_json("You are a meticulous Shorts editor reviewing stills.", content, VISUAL_SCHEMA, effort="medium")


def claude_full_review(video: Path, script_lines: list[str]) -> dict:
    """Without Gemini: Claude scores the Short from dense stills + the script (it can't hear the audio)."""
    dur, long = _duration(video), _is_long(video)
    if long:
        times = [0.0, 1.0, 2.0, 3.0, 5.0, 8.0, 12.0, 16.0, 20.0, 25.0, 30.0] + [float(t) for t in range(36, int(dur), max(6, int(dur / 80)))]
    else:
        times = [0.0, 0.33, 0.66, 1.0, 1.5, 2.0, 3.0] + [float(t) for t in range(4, int(dur), 2)]
    frames = _frames(video, times)
    print(f"  editor (claude): reviewing {len(frames)} stills + script ({'long-form' if long else 'Short'} mode)...")
    content: list = [{"type": "text", "text": (LONG_BRIEF if long else EDITOR_BRIEF) + " You see stills sampled from the video (times given) and "
                      "its script; judge motion and pacing from how much changes between stills. You cannot hear the "
                      "audio, so do not score sound.\n\nScript:\n" + "\n".join(script_lines)}]
    for t, b64 in frames:
        content.append({"type": "text", "text": f"t = {t:.2f} s"})
        content.append({"type": "image", "source": {"type": "base64", "media_type": "image/jpeg", "data": b64}})
    return claude.ask_json("You are a ruthless long-form YouTube editor." if long else "You are a ruthless Shorts editor.",
                           content, REVIEW_SCHEMA, effort="medium")


def review(video: Path, script_lines: list[str]) -> dict:
    g = gemini_review(video, script_lines) if gemini.enabled() else claude_full_review(video, script_lines)
    c = claude_review(video)
    issues = sorted(g["issues"] + c["issues"], key=lambda i: (i["t_start"], i["severity"]))
    hook = min(g["scores"]["hook"], c["first_frame_score"] + 1)  # the still can't show motion; give it a point
    serious = [i for i in issues if i["severity"] in ("blocker", "major")]
    passed = not serious and hook >= HOOK_BAR and g["scores"]["overall"] >= OVERALL_BAR
    return {"passed": passed, "hook": hook, "scores": g["scores"], "predicted_stayed_pct": g["predicted_stayed_pct"],
            "verdict": g["verdict"], "issues": issues, "serious": serious}


def report(dest: Path, rnd: int, r: dict) -> None:
    lines = [f"## Round {rnd}: {'PASS' if r['passed'] else 'NEEDS FIXES'}",
             f"- scores: {r['scores']} (hook used for the gate: {r['hook']})",
             f"- predicted stayed-to-watch: {r['predicted_stayed_pct']}%",
             f"- verdict: {r['verdict']}", "", "| time | severity | category | problem | fix |", "|---|---|---|---|---|"]
    for i in r["issues"]:
        lines.append(f"| {i['t_start']:.1f}-{i['t_end']:.1f}s | {i['severity']} | {i['category']} | {i['problem']} | {i['fix']} |")
    p = dest / "EDIT_REPORT.md"
    prev = p.read_text(encoding="utf-8") if p.exists() and rnd > 1 else "# Edit report\n\n"
    p.write_text(prev + "\n".join(lines) + "\n\n", encoding="utf-8")
