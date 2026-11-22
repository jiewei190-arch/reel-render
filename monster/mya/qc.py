"""Quality checks. Technical and editorial verdicts are separate; a technical pass is never an editorial pass.
Release eligibility additionally requires every claim used to be verified and every asset to have known rights.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

from . import llm
from .config import cfg
from .util import run

FRAME = 1 / 30


def probe(p: Path) -> dict:
    out = run(["ffprobe", "-v", "error", "-show_entries",
               "format=duration:stream=codec_type,codec_name,width,height,pix_fmt,r_frame_rate,sample_rate,channels",
               "-of", "json", p])
    return json.loads(out[out.index("{"):])


def duration_verdict(seconds: float, fmt_kind: str) -> tuple[bool, str]:
    """Inclusive product bounds, allowing at most one frame of container rounding (reported when used)."""
    f = cfg().formats[fmt_kind]
    lo, hi = f["min_seconds"], f["max_seconds"]
    if lo <= seconds <= hi:
        return True, f"{seconds:.3f}s within {lo}-{hi}s"
    if lo - FRAME <= seconds < lo or hi < seconds <= hi + FRAME:
        return True, f"{seconds:.3f}s within {lo}-{hi}s after one-frame container rounding allowance"
    return False, f"{seconds:.3f}s outside {lo}-{hi}s"


def technical(video: Path, fmt_kind: str, words: list[dict], planned_holds: float = 0.0) -> dict:
    f = cfg().formats[fmt_kind]
    findings, checks = [], {}
    info = probe(video)
    dur = float(info["format"]["duration"])
    v = next((s for s in info["streams"] if s["codec_type"] == "video"), None)
    a = next((s for s in info["streams"] if s["codec_type"] == "audio"), None)
    ok, msg = duration_verdict(dur, fmt_kind)
    checks["duration"] = msg
    if not ok:
        findings.append({"severity": "blocker", "check": "duration", "finding": msg})
    if not v or (v["width"], v["height"]) != (f["width"], f["height"]):
        findings.append({"severity": "blocker", "check": "dimensions", "finding": f"video is {v and (v['width'], v['height'])}, needs {f['width']}x{f['height']}"})
    checks["video"] = v and f"{v['codec_name']} {v['width']}x{v['height']} {v['pix_fmt']} {v['r_frame_rate']}"
    if v and (v["codec_name"] != "h264" or v["pix_fmt"] != "yuv420p"):
        findings.append({"severity": "major", "check": "codec", "finding": f"{v['codec_name']}/{v['pix_fmt']} (want h264/yuv420p)"})
    if not a:
        findings.append({"severity": "blocker", "check": "audio", "finding": "no audio stream"})
    checks["audio"] = a and f"{a['codec_name']} {a['sample_rate']}Hz {a['channels']}ch"
    # decode the whole file: any error means broken frames
    dec = run(["ffmpeg", "-v", "error", "-i", video, "-f", "null", "-"])
    if dec.strip():
        findings.append({"severity": "blocker", "check": "decode", "finding": dec.strip()[:300]})
    det = run(["ffmpeg", "-hide_banner", "-i", video, "-vf", "blackdetect=d=0.5:pix_th=0.06", "-af",
               "silencedetect=n=-45dB:d=1.2", "-f", "null", "-"])
    blacks = re.findall(r"black_start:([\d.]+) black_end:([\d.]+)", det)
    silences = re.findall(r"silence_start: ([\d.]+)[\s\S]*?silence_end: ([\d.]+)", det)
    checks["black_segments"], checks["long_silences"] = len(blacks), len(silences)
    for s, e in blacks:
        findings.append({"severity": "major", "check": "black", "finding": f"black frames {float(s):.2f}-{float(e):.2f}s"})
    from .render import TAIL
    for s, e in silences:
        s, e = float(s), float(e)
        if e >= dur - 0.1 and (e - s) <= TAIL + 1.3:
            checks["planned_end_hold"] = f"{s:.2f}-{e:.2f}s (storyboard tail {TAIL}s after the last word's decay)"
            continue  # the planned ending hold is represented in the timeline, not dead air
        findings.append({"severity": "major", "check": "silence", "finding": f"silence {s:.2f}-{e:.2f}s"})
    lo = run(["ffmpeg", "-hide_banner", "-i", video, "-af", "ebur128=peak=true", "-f", "null", "-"])
    m_i = re.findall(r"I:\s+(-?[\d.]+) LUFS", lo)
    m_p = re.findall(r"Peak:\s+(-?[\d.]+) dBFS", lo)
    checks["loudness_lufs"] = float(m_i[-1]) if m_i else None
    checks["true_peak_dbfs"] = float(m_p[-1]) if m_p else None
    if checks["loudness_lufs"] is not None and not -17 <= checks["loudness_lufs"] <= -12:
        findings.append({"severity": "minor", "check": "loudness", "finding": f"{checks['loudness_lufs']} LUFS (target about -14)"})
    timed = sum(1 for w in words if w["t"] is not None)
    checks["caption_coverage"] = round(timed / max(1, len(words)), 3)
    if checks["caption_coverage"] < 0.97:
        findings.append({"severity": "major", "check": "captions", "finding": f"only {checks['caption_coverage']:.0%} of words are timed"})
    checks["seconds"] = round(dur, 3)
    passed = not any(x["severity"] in ("blocker", "major") for x in findings)
    return {"passed": passed, "checks": checks, "findings": findings}


EDITORIAL_SCHEMA = {
    "type": "object", "additionalProperties": False, "required": ["hook", "explanation", "payoff", "visual_relevance", "findings"],
    "properties": {
        "hook": {"type": "integer", "minimum": 1, "maximum": 10}, "explanation": {"type": "integer", "minimum": 1, "maximum": 10},
        "payoff": {"type": "integer", "minimum": 1, "maximum": 10}, "visual_relevance": {"type": "integer", "minimum": 1, "maximum": 10},
        "findings": {"type": "array", "maxItems": 8, "items": {"type": "object", "additionalProperties": False,
            "required": ["severity", "finding"], "properties": {"severity": {"enum": ["blocker", "major", "minor"]}, "finding": {"type": "string"}}}},
    },
}


def editorial(job: dict, script: dict, board: list[dict], claims: list[dict], profile) -> dict:
    """A separate editorial verdict. With the local model it is a first pass; the human review page is final."""
    rows = "\n".join(f"{i + 1}. [{b['type']}] {s['narration']}" for i, (s, b) in enumerate(zip(script["scenes"], board)))
    res = llm.ask(
        "You are a strict YouTube editor. Judge the script and its planned visuals, not the production polish. "
        "Score 1-10: hook (would a stranger keep watching after the first line?), explanation (is it clear and "
        "logical?), payoff (does the end answer the opening?), visual_relevance (does each visual clarify its line?). "
        "List concrete problems; do not praise.",
        f"Channel promise: {profile.promise}\nTitle: {script['title']}\nPromise: {script['promise']}\nScenes:\n{rows}",
        EDITORIAL_SCHEMA, temperature=0.1, max_tokens=700)
    used = {c for s in script["scenes"] for c in s["claim_ids"]}
    unsupported = [c["id"] for c in claims if c["id"] in used and c["status"] != "verified"]
    if unsupported:
        res["findings"].append({"severity": "blocker", "finding": f"uses unverified claims {unsupported}"})
    low = [k for k in ("hook", "explanation", "payoff", "visual_relevance") if res[k] < 6]
    if low:
        res["findings"].append({"severity": "major", "finding": f"low scores: {', '.join(low)}"})
    res["passed"] = not any(f["severity"] in ("blocker", "major") for f in res["findings"])
    res["reviewer"] = llm.describe()
    return res


def release_eligibility(tech: dict, edit: dict, claims: list[dict], assets: list[dict], extra: list[dict]) -> dict:
    reasons = []
    if not tech["passed"]:
        reasons.append("technical checks failed")
    if not edit.get("passed"):
        reasons.append("editorial review did not pass")
    if any(a.get("license") in (None, "", "unknown") for a in assets):
        reasons.append("an asset has unknown rights")
    if any(f["severity"] in ("blocker", "major") for f in extra):
        reasons.append("open major findings from earlier stages")
    return {"eligible": not reasons, "reasons": reasons}
