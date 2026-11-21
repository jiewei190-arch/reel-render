"""Voice stage: ElevenLabs text-to-speech with word timestamps, one call per line (port of finance/tools/eleven_tts.py)."""
from __future__ import annotations

import base64
import json
import os
import re
import subprocess
import wave
from pathlib import Path

import requests

from .config import CFG
from .cost import COST

SR = 24000


TAG = re.compile(r"\[[^\]]*\]")


def strip_tags(text: str) -> str:
    return re.sub(r"\s+", " ", TAG.sub("", text)).strip()


def _tts(text: str, voice_id: str, speed: float) -> tuple[bytes, dict]:
    key = os.environ.get("ELEVENLABS_API_KEY")
    if not key:
        CFG.require_keys("ELEVENLABS_API_KEY")
    r = requests.post(
        f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/with-timestamps",
        params={"output_format": "pcm_24000"},
        headers={"xi-api-key": key, "Content-Type": "application/json"},
        json={"text": text, "model_id": CFG.eleven_model,
              "voice_settings": {"speed": speed, "stability": float(os.environ.get("REELBOT_VOICE_STABILITY", "0.4")),
                                 "similarity_boost": 0.8, "style": float(os.environ.get("REELBOT_VOICE_STYLE", "0.35"))}},
        timeout=180,
    )
    if r.status_code != 200:
        raise RuntimeError(f"ElevenLabs error {r.status_code}: {r.text[:300]}")
    d = r.json()
    COST.eleven_chars += len(text)
    return base64.b64decode(d["audio_base64"]), (d.get("normalized_alignment") or d["alignment"])


def _words(al: dict, text: str, offset: float) -> list[dict]:
    """Word timings from the character alignment, skipping [audio tags] (they are performed, not spoken)."""
    text = strip_tags(text)
    out, cur, t0, t1, in_tag = [], "", None, None, False
    for c, s, e in zip(al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]):
        if c == "[":
            in_tag = True
        if in_tag:
            if c == "]":
                in_tag = False
            continue
        if c.isspace():
            if cur:
                out.append((cur, t0, t1))
                cur = ""
            continue
        if not cur:
            t0 = s
        cur += c
        t1 = e
    if cur:
        out.append((cur, t0, t1))
    toks = text.split()
    if len(toks) == len(out):
        out = [(tok, a, b) for tok, (_, a, b) in zip(toks, out)]
    return [{"w": w, "t": round(a + offset, 3), "end": round(b + offset, 3)} for w, a, b in out]


def record(folder: Path, voice: str, *, speed: float = 1.15, gap: float = 0.15, lead: float = 0.10,
           fit: float | None = None) -> float:
    """Writes voice.wav, vo/timings.json, voice.lines.json. Returns the duration in seconds."""
    voice_id = CFG.voices[voice]
    lines = [l.strip() for l in (folder / "script.txt").read_text(encoding="utf-8").splitlines() if l.strip()]
    spoken = lines
    sj = folder / "script.json"
    if sj.exists():  # emotion-tagged versions of the same lines, if the writer made them and they match
        vl = json.loads(sj.read_text(encoding="utf-8")).get("voice_lines") or []
        if len(vl) == len(lines) and all(strip_tags(v) == l for v, l in zip(vl, lines)):
            spoken = vl
        elif vl:
            print("  voice: emotion tags don't match the script lines; using plain lines")
    pcm_all = bytearray(b"\0\0" * int(SR * lead))
    t, turns, meta = lead, [], []
    for i, (line, say) in enumerate(zip(lines, spoken), 1):
        print(f"  elevenlabs: line {i}/{len(lines)}" + (f"  {say[:60]}" if say != line else ""))
        pcm, al = _tts(say, voice_id, speed)
        dur = len(pcm) / 2 / SR
        turns.append({"turn": i, "text": line, "words": _words(al, say, t)})
        meta.append({"line": i, "text": line, "start": round(t, 3), "end": round(t + dur, 3)})
        pcm_all += pcm
        t += dur
        if i < len(lines):
            pcm_all += b"\0\0" * int(SR * gap)
            t += gap

    (folder / "vo").mkdir(exist_ok=True)
    out = folder / "voice.wav"
    tempo = min(t / fit, 1.25) if fit and t > fit else 1.0
    raw = folder / "vo" / "_raw.wav" if tempo > 1.0 else out
    with wave.open(str(raw), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(bytes(pcm_all))
    if tempo > 1.0:
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-af", f"atempo={tempo:.4f}",
                        "-ar", str(SR), "-ac", "1", "-c:a", "pcm_s16le", str(out)], check=True)
        raw.unlink()
        for tu in turns:
            for w_ in tu["words"]:
                w_["t"] = round(w_["t"] / tempo, 3)
                w_["end"] = round(w_["end"] / tempo, 3)
        for m in meta:
            m["start"] = round(m["start"] / tempo, 3)
            m["end"] = round(m["end"] / tempo, 3)
        t /= tempo

    # Emotion tags can add a beat of silence before the first word; the frame-0 gate wants speech by 0.2 s.
    first = turns[0]["words"][0]["t"] if turns and turns[0]["words"] else lead
    cut = round(first - lead, 3)
    if cut > 0.03:
        tmp = folder / "vo" / "_untrimmed.wav"
        out.replace(tmp)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(tmp), "-af", f"atrim=start={cut},asetpts=PTS-STARTPTS",
                        "-ar", str(SR), "-ac", "1", "-c:a", "pcm_s16le", str(out)], check=True)
        tmp.unlink()
        for tu in turns:
            for w_ in tu["words"]:
                w_["t"] = round(w_["t"] - cut, 3)
                w_["end"] = round(w_["end"] - cut, 3)
        for m in meta:
            m["start"] = round(max(0.0, m["start"] - cut), 3)
            m["end"] = round(m["end"] - cut, 3)
        t -= cut
        print(f"  voice: trimmed {cut:.2f} s of lead-in silence (first word now at {lead:.2f} s)")

    (folder / "vo" / "timings.json").write_text(json.dumps(
        {"source": {"audio": "voice.wav", "script": "script.txt", "model": f"elevenlabs:{CFG.eleven_model}",
                    "duration": round(t, 3)}, "turns": turns}, indent=1), encoding="utf-8")
    (folder / "voice.lines.json").write_text(json.dumps(
        {"provider": "elevenlabs", "voice": voice, "voice_id": voice_id, "model": CFG.eleven_model, "gap": gap,
         "lead": lead, "speed": speed, "tempo": round(tempo, 4), "sr": SR, "duration": round(t, 3),
         "characters": sum(len(l) for l in lines), "lines": meta}, indent=1), encoding="utf-8")
    print(f"  voice: {voice}, {t:.1f} s (tempo x{tempo:.3f})")
    return t
