"""Word timing + captions. Kokoro's token timings are mapped back to display words via the spoken/display mapping.
A display word whose spoken words can't be matched gets NO timestamp and a visible finding; nothing is fabricated.
Captions: short phrases (max 2 lines), active word highlighted, burned from an ASS file; SRT sidecar exported.
"""
from __future__ import annotations

import re

from .speech import bare, normalize


def map_words(display: str, tokens: list[dict], offset: float, pron: dict | None = None) -> tuple[list[dict], list[str]]:
    """[{w, t, end}] in display words; findings for words that could not be aligned."""
    norm = normalize(display, pron)
    toks = [t for t in tokens if bare(t["text"]) and t["start"] is not None]
    out, findings, j = [], [], 0
    for w in norm:
        spoken = [bare(s) for s in w["spoken"] if bare(s)]
        t0 = t1 = None
        k = j
        matched = 0
        for sw in spoken:
            # tokens may split hyphenated words ("fifty-four") or join them; accept prefix matches within a short window
            for look in range(k, min(k + 4, len(toks))):
                tb = bare(toks[look]["text"])
                if tb == sw or sw.startswith(tb) or tb.startswith(sw) or tb.replace("-", "") == sw.replace("-", ""):
                    if t0 is None:
                        t0 = toks[look]["start"]
                    t1 = toks[look]["end"]
                    k = look + 1
                    matched += 1
                    break
        if t0 is None or matched < max(1, len(spoken) // 2):
            out.append({"w": w["display"], "t": None, "end": None})
            findings.append(f"could not align '{w['display']}' (spoken as '{' '.join(w['spoken'])}')")
        else:
            out.append({"w": w["display"], "t": round(offset + t0, 3), "end": round(offset + t1, 3)})
            j = k
    return out, findings


def phrases(words: list[dict], max_chars: int = 26, max_words: int = 5) -> list[list[dict]]:
    groups, cur = [], []
    for w in words:
        if w["t"] is None:
            continue
        text = " ".join(x["w"] for x in cur + [w])
        if cur and (len(text) > max_chars * 2 or len(cur) >= max_words):
            groups.append(cur)
            cur = []
        cur.append(w)
        if re.search(r"[.!?]$", w["w"]):
            groups.append(cur)
            cur = []
    if cur:
        groups.append(cur)
    return groups


def _ts_srt(t: float) -> str:
    h, rem = divmod(t, 3600)
    m, s = divmod(rem, 60)
    return f"{int(h):02d}:{int(m):02d}:{int(s):02d},{int(round((s % 1) * 1000)) % 1000:03d}"


def _ts_ass(t: float) -> str:
    h, rem = divmod(t, 3600)
    m, s = divmod(rem, 60)
    return f"{int(h)}:{int(m):02d}:{s:05.2f}"


def srt(groups: list[list[dict]]) -> str:
    out = []
    for i, g in enumerate(groups, 1):
        out.append(f"{i}\n{_ts_srt(g[0]['t'])} --> {_ts_srt(g[-1]['end'] + 0.05)}\n{' '.join(w['w'] for w in g)}\n")
    return "\n".join(out)


def _ass_color(hex_: str) -> str:
    h = hex_.lstrip("#")
    return f"&H00{h[4:6]}{h[2:4]}{h[0:2]}".upper()


def ass(groups: list[list[dict]], width: int, height: int, accent: str, font: str = "Liberation Sans") -> str:
    portrait = height > width
    size = int((84 if portrait else 58) * min(width, height) / 1080)
    margin_v = int(height * (0.27 if portrait else 0.06))   # portrait: caption band below the visuals, above Shorts UI
    margin_h = int(width * 0.08)
    head = (
        "[Script Info]\nScriptType: v4.00+\nWrapStyle: 0\nScaledBorderAndShadow: yes\n"
        f"PlayResX: {width}\nPlayResY: {height}\n\n[V4+ Styles]\n"
        "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, "
        "Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n"
        f"Style: Cap,{font},{size},&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,-1,0,0,0,100,100,0,0,1,"
        f"{max(3, size // 14)},2,2,{margin_h},{margin_h},{margin_v},1\n\n[Events]\n"
        "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n")
    col = _ass_color(accent)
    lines = []
    for g in groups:
        for k, w in enumerate(g):
            start = w["t"]
            end = g[k + 1]["t"] if k + 1 < len(g) else g[-1]["end"] + 0.05
            txt = " ".join(("{\\c" + col + "&}" + x["w"] + "{\\c&H00FFFFFF&}") if i == k else x["w"] for i, x in enumerate(g))
            lines.append(f"Dialogue: 0,{_ts_ass(start)},{_ts_ass(max(end, start + 0.05))},Cap,,0,0,0,,{txt}")
    return head + "\n".join(lines) + "\n"


def verify_asr(wav: str, expected_words: list[str]) -> dict:
    """Optional independent check: transcribe with a local faster-whisper model and measure word recall."""
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        return {"checked": False, "reason": "faster-whisper not installed"}
    try:
        import numpy as np
        import soundfile as sf
        a, sr = sf.read(wav, dtype="float32")
        if a.ndim > 1:
            a = a.mean(axis=1)
        if sr != 16000:  # resample in numpy (avoids the av/ffmpeg binding mismatch when passing a path)
            idx = np.linspace(0, len(a) - 1, int(len(a) * 16000 / sr))
            a = np.interp(idx, np.arange(len(a)), a).astype(np.float32)
        m = WhisperModel("tiny.en", device="cpu", compute_type="int8")
        segs, _ = m.transcribe(a, language="en")
        from .speech import spoken_text
        heard = {bare(x) for s in segs for x in spoken_text(s.text).split()}  # "2005" -> "two thousand five"
    except Exception as e:  # noqa: BLE001
        return {"checked": False, "reason": str(e)[:200]}
    exp = [bare(w) for w in expected_words if bare(w) and not bare(w).isdigit()]
    hit = sum(1 for w in exp if w in heard)
    missing = [w for w in exp if w not in heard]
    return {"checked": True, "model": "faster-whisper tiny.en", "recall": round(hit / max(1, len(exp)), 3),
            "missing_sample": missing[:20]}
