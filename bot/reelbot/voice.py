"""Voice stage: ElevenLabs text-to-speech with word timestamps, one call per line (port of finance/tools/eleven_tts.py)."""
from __future__ import annotations

import base64
import json
import os
import re
import subprocess
import wave
from pathlib import Path

import numpy as np
import requests

from .config import BOT_DIR, CFG
from .cost import COST

SR = 24000


TAG = re.compile(r"\[[^\]]*\]")


def strip_tags(text: str) -> str:
    return re.sub(r"\s+", " ", TAG.sub("", text)).strip()


# Voice settings per mood. Lower stability = more expressive and more responsive to emotion tags; higher = steady,
# clean narration. Plain explanation lines stay steady so the emotional beats stand out.
MOOD_SETTINGS = {
    "neutral": (0.55, 0.20), "curious": (0.45, 0.30), "hopeful": (0.45, 0.30),
    "serious": (0.50, 0.25), "sad": (0.40, 0.30), "worried": (0.40, 0.30), "tense": (0.40, 0.35),
    "surprised": (0.35, 0.45), "sarcastic": (0.35, 0.45), "funny": (0.30, 0.50),
    "triumphant": (0.35, 0.50), "hype": (0.30, 0.55),
}


def settings_for(mood: str | None) -> tuple[float, float]:
    if os.environ.get("REELBOT_VOICE_STABILITY"):  # manual override for every line
        return float(os.environ["REELBOT_VOICE_STABILITY"]), float(os.environ.get("REELBOT_VOICE_STYLE", "0.35"))
    return MOOD_SETTINGS.get(mood or "neutral", (0.45, 0.30))


LOCAL_SCRIPT = r"""
import json, sys
from pathlib import Path
from mya import voice
text, v, speed, out = sys.argv[1], sys.argv[2], float(sys.argv[3]), Path(sys.argv[4])
print("RESULT " + json.dumps(voice.synth(text, v, speed, out)))
"""


def _local_python() -> str:
    env = os.environ.get("REELBOT_KOKORO_PYTHON")
    if env:
        return env
    mon = BOT_DIR.parent / "monster" / ".venv"
    for p in (mon / "Scripts" / "python.exe", mon / "bin" / "python"):
        if p.exists():
            return str(p)
    raise RuntimeError("local voice: monster's venv not found; run monster/setup_windows.ps1 or set REELBOT_KOKORO_PYTHON")


def _tts_local(text: str, voice: str, speed: float) -> tuple[bytes, dict]:
    """Kokoro-82M through monster's venv (free, on the PC). Returns 24 kHz PCM and an ElevenLabs-style character
    alignment built from Kokoro's word timings, so the rest of the pipeline is unchanged. Audio tags are dropped."""
    import subprocess
    import tempfile
    import wave
    plain = strip_tags(text)
    with tempfile.TemporaryDirectory(prefix="reelbot_kokoro_") as tmp:
        out = Path(tmp) / "line.wav"
        r = subprocess.run([_local_python(), "-c", LOCAL_SCRIPT, plain, voice, str(speed), str(out)],
                           capture_output=True, text=True, encoding="utf-8", errors="replace",
                           cwd=str(BOT_DIR.parent / "monster"), timeout=600)
        line = next((l for l in r.stdout.splitlines() if l.startswith("RESULT ")), None)
        if r.returncode != 0 or not line:
            raise RuntimeError(f"local voice failed: {(r.stderr or r.stdout)[-400:]}")
        meta = json.loads(line[7:])
        with wave.open(str(out)) as w:
            pcm = w.readframes(w.getnframes())
    chars, st, en = [], [], []
    toks = [t for t in meta["tokens"] if t.get("start") is not None and t["text"].strip()]
    for k, t in enumerate(toks):
        w0, w1 = t["start"], t["end"] if t.get("end") is not None else t["start"] + 0.2
        n = len(t["text"])
        for j, ch in enumerate(t["text"]):
            chars.append(ch)
            st.append(w0 + (w1 - w0) * j / n)
            en.append(w0 + (w1 - w0) * (j + 1) / n)
        nxt = toks[k + 1]["start"] if k + 1 < len(toks) else w1
        if k + 1 < len(toks) and not (toks[k + 1]["text"][0] in ".,!?;:'"):
            chars.append(" "); st.append(w1); en.append(nxt)
    return pcm, {"characters": chars, "character_start_times_seconds": st, "character_end_times_seconds": en}


def _tts(text: str, voice_id: str, speed: float, mood: str | None = None) -> tuple[bytes, dict]:
    if voice_id.startswith("kokoro:"):
        return _tts_local(text, voice_id.split(":", 1)[1], speed)
    if os.environ.get("REELBOT_ELEVENLABS_OFF") == "1":
        raise SystemExit("ElevenLabs is switched off for this run (REELBOT_ELEVENLABS_OFF=1): nothing was voiced")
    key = os.environ.get("ELEVENLABS_API_KEY")
    if not key:
        CFG.require_keys("ELEVENLABS_API_KEY")
    stability, style = settings_for(mood)

    def call(stab: float):
        return requests.post(
            f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/with-timestamps",
            params={"output_format": "pcm_24000"},
            headers={"xi-api-key": key, "Content-Type": "application/json"},
            json={"text": text, "model_id": CFG.eleven_model,
                  "voice_settings": {"speed": speed, "stability": stab, "similarity_boost": 0.8, "style": style}},
            timeout=180)

    r = call(stability)
    if r.status_code == 400 and "stability" in r.text.lower():  # some models only take 0 / 0.5 / 1
        r = call(0.5)
    if r.status_code != 200:
        raise RuntimeError(f"ElevenLabs error {r.status_code}: {r.text[:300]}")
    d = r.json()
    COST.eleven_chars += len(text)
    return base64.b64decode(d["audio_base64"]), (d.get("normalized_alignment") or d["alignment"])


LISTEN = os.environ.get("REELBOT_VOICE_CHECK", "1") != "0"
MAX_RETAKES = int(os.environ.get("REELBOT_VOICE_RETAKES", "2"))  # per Short, caps extra ElevenLabs spend
RETAKES_PER_LINE = 1  # never hammer one line: bursts of identical generations look like abuse to the provider
LISTEN_SCHEMA = {
    "type": "object", "additionalProperties": False, "required": ["ok", "score", "heard_emotion", "problem"],
    "properties": {"ok": {"type": "boolean"}, "score": {"type": "number", "description": "1-10"},
                   "heard_emotion": {"type": "string"}, "problem": {"type": "string"}},
}


def _wav_bytes(pcm: bytes) -> bytes:
    import io
    b = io.BytesIO()
    with wave.open(b, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm)
    return b.getvalue()


def _listen(pcm: bytes, line: str, mood: str | None) -> dict:
    """Listens to one take. With Gemini: emotion + clarity + naturalness. Without (default, free): a local
    faster-whisper check that every word was actually said (emotion is not judged)."""
    from . import gemini
    if not gemini.enabled():
        return _listen_local(pcm, line)
    from google.genai import types
    prompt = (
        "You are a voice director checking one narrator take for a YouTube Short.\n"
        f"The line: \"{line}\"\nIntended mood: {mood or 'neutral'}\n"
        "Pass it (ok=true) only if ALL are true: (1) the emotion you hear fits the intended mood and what the words mean "
        "(an upbeat, laughing or playful sound on a sad/serious line is a fail; a flat read on a big reveal is a fail); "
        "(2) every word is clear and correct, including numbers, nothing mispronounced, skipped or added, no audio tag "
        "spoken out loud; (3) it sounds like a natural human narrator: no robotic glitches, odd pauses, weird pitch or "
        "over-acting. Score 1-10 for how good it sounds. In 'problem' say exactly what is wrong (empty if ok).")
    try:
        resp = gemini.client().models.generate_content(
            model=CFG.gemini_model,
            contents=[types.Part.from_bytes(data=_wav_bytes(pcm), mime_type="audio/wav"), prompt],
            config=types.GenerateContentConfig(response_mime_type="application/json", response_json_schema=LISTEN_SCHEMA))
        COST.gemini_calls += 1
        return json.loads(resp.text)
    except Exception as e:  # the listener is a safety net; never let it block voicing
        print(f"    listener unavailable: {e}")
        return {"ok": True, "score": 0, "heard_emotion": "", "problem": f"not checked: {e}"}


_whisper = None


def _listen_local(pcm: bytes, line: str) -> dict:
    global _whisper
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        return {"ok": True, "score": 0, "heard_emotion": "", "problem": "not checked (pip install faster-whisper)"}
    if _whisper is None:
        _whisper = WhisperModel("small.en", device=os.environ.get("REELBOT_WHISPER_DEVICE", "cpu"),
                         compute_type=os.environ.get("REELBOT_WHISPER_COMPUTE", "int8"))  # "auto" picked CUDA without cuBLAS 12 on the PC
    a = np.frombuffer(pcm, dtype=np.int16).astype(np.float32) / 32768.0
    idx = np.linspace(0, len(a) - 1, int(len(a) * 16000 / SR))
    a16 = np.interp(idx, np.arange(len(a)), a).astype(np.float32)
    segs, _ = _whisper.transcribe(a16, language="en")
    norm = lambda s: [w for w in re.sub(r"[^a-z0-9' ]", " ", s.lower()).split() if w]
    heard, want = set(norm(" ".join(x.text for x in segs))), [w for w in norm(line) if not w.isdigit()]
    miss = [w for w in want if w not in heard]
    recall = 1 - len(miss) / max(1, len(want))
    return {"ok": recall >= 0.85, "score": round(recall * 10, 1), "heard_emotion": "(not judged locally)",
            "problem": f"words not heard clearly: {miss[:8]}" if miss and recall < 0.85 else ""}


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
    moods: list = []
    if sj.exists():  # emotion-tagged versions of the same lines, if the writer made them and they match
        sdata = json.loads(sj.read_text(encoding="utf-8"))
        moods = [m.get("mood") for m in (sdata.get("moods") or [])]
        from .tone import unwhisper
        vl = [unwhisper(x) for x in (sdata.get("voice_lines") or [])]
        if len(vl) == len(lines) and all(strip_tags(v) == l for v, l in zip(vl, lines)):
            spoken = vl
        elif vl:
            print("  voice: emotion tags don't match the script lines; using plain lines")
    moods = moods if len(moods) == len(lines) else [None] * len(lines)
    pcm_all = bytearray(b"\0\0" * int(SR * lead))
    t, turns, meta, checks = lead, [], [], []
    retakes_left = MAX_RETAKES
    for i, (line, say, mood) in enumerate(zip(lines, spoken, moods), 1):
        print(f"  elevenlabs: line {i}/{len(lines)} [{mood or '-'}]" + (f"  {say[:60]}" if say != line else ""))
        pcm, al = _tts(say, voice_id, speed, mood)
        if LISTEN:  # an AI listener checks the take; a bad take is re-recorded (best take wins)
            best = (_listen(pcm, line, mood), pcm, al)
            line_retakes = 0
            while (not best[0]["ok"] and retakes_left > 0 and line_retakes < RETAKES_PER_LINE
                   and not voice_id.startswith("kokoro:")):  # the local voice is deterministic: a retake is identical
                retakes_left -= 1
                line_retakes += 1
                print(f"    retake: {best[0]['problem']}")
                p2, a2 = _tts(say, voice_id, speed, mood)
                v2 = _listen(p2, line, mood)
                if v2["score"] > best[0]["score"]:
                    best = (v2, p2, a2)
            verdict, pcm, al = best
            checks.append({"line": i, "mood": mood, **verdict})
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
        {"provider": "kokoro-local" if voice_id.startswith("kokoro:") else "elevenlabs", "voice": voice, "voice_id": voice_id, "model": CFG.eleven_model, "gap": gap,
         "lead": lead, "speed": speed, "tempo": round(tempo, 4), "sr": SR, "duration": round(t, 3),
         "characters": sum(len(l) for l in lines), "lines": meta}, indent=1), encoding="utf-8")
    if checks:
        (folder / "vo" / "voice_check.json").write_text(json.dumps(checks, indent=1), encoding="utf-8")
        bad = [c for c in checks if not c["ok"]]
        if bad:
            print(f"  voice: {len(bad)} line(s) still not ideal after retakes: " + ", ".join(str(c['line']) for c in bad))
    print(f"  voice: {voice}, {t:.1f} s (tempo x{tempo:.3f})")
    return t
