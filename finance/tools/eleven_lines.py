"""eleven_lines.py <shortdir> <voice: tyler|christopher> [--only 3,5]

ElevenLabs voice for a Short, ONE call per line of vo/narration.md ("1. text" lines), so a failing line can be re-voiced
alone (budget: Starter = 40k characters a month; FORMAT_V1 "Voice"). Uses /v1/text-to-speech/{voice}/with-timestamps
(model eleven_v4) and turns the character alignment into word timings.

The API key is a proxy-injected network secret: the header is literally `xi-api-key: proxy-injected`. No key is read,
printed or stored here.

Writes:
  <shortdir>/takes/eleven/line<N>.mp3 + line<N>.json   (raw audio + alignment per line; cached: --only re-voices lines)
  <shortdir>/voice.wav                                 (lines joined: 0.1 s lead, GAP between lines, mono 44.1 kHz)
  <shortdir>/vo/timings.json                           ({"source", "turns": [{turn, text, words: [{w, t, end}], chars}]})
  <shortdir>/voice.lines.json                          (per-line start/end, characters billed)
"""
import base64, json, os, re, subprocess, sys, urllib.request
from pathlib import Path

VOICES = {"tyler": "rPMkKgdwgIwqv4fXgR6N", "christopher": "RolvCZ4e0AkAR2dzyTx0"}
MODEL = "eleven_v4"
SR = 44100
LEAD, GAP = 0.1, 0.18  # no pause over ~1 s (research round 2): short gaps between lines

d = Path(sys.argv[1]); voice = sys.argv[2].lower(); vid = VOICES[voice]
only = set(int(x) for x in sys.argv[sys.argv.index("--only") + 1].split(",")) if "--only" in sys.argv else None
lines = [(int(m.group(1)), m.group(2).strip()) for m in re.finditer(r"^(\d+)\.\s+(.+)$", (d / "vo" / "narration.md").read_text(), re.M)]
out = d / "takes" / "eleven"; out.mkdir(parents=True, exist_ok=True)
billed = 0
for n, text in lines:
    mp3, js = out / f"line{n}.mp3", out / f"line{n}.json"
    if mp3.exists() and js.exists() and (only is None or n not in only):
        continue
    body = json.dumps({"text": text, "model_id": MODEL}).encode()
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{vid}/with-timestamps?output_format=mp3_44100_128",
                                 data=body, headers={"xi-api-key": "proxy-injected", "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            res = json.loads(r.read())
    except urllib.error.HTTPError as e:
        sys.exit(f"line {n}: HTTP {e.code}: {e.read()[:300]!r}")
    mp3.write_bytes(base64.b64decode(res["audio_base64"]))
    al = res.get("normalized_alignment") or res["alignment"]
    js.write_text(json.dumps({"text": text, "voice": voice, "voice_id": vid, "model": MODEL, "alignment": al}, indent=1))
    billed += len(text)
    print(f"voiced line {n} ({len(text)} chars)")

# join: decode each mp3 to mono 44.1 kHz float, place on a timeline
import numpy as np


def pcm(p):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(p), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)


def trim_tail(a, al):
    """cut after the last character end + 0.12 s (ElevenLabs adds a little trailing silence)"""
    end = al["character_end_times_seconds"][-1] + 0.12
    return a[: int(min(len(a), end * SR))]


t = LEAD; parts = [np.zeros(int(LEAD * SR), np.float32)]; turns = []; meta = []
for n, text in lines:
    info = json.loads((out / f"line{n}.json").read_text()); al = info["alignment"]
    a = trim_tail(pcm(out / f"line{n}.mp3"), al)
    ch, cs, ce = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
    words, cur = [], None
    for c, s, e in zip(ch, cs, ce):
        if c.isspace():
            if cur: words.append(cur); cur = None
            continue
        if cur is None: cur = {"w": c, "t": round(t + s, 3), "end": round(t + e, 3)}
        else: cur["w"] += c; cur["end"] = round(t + e, 3)
    if cur: words.append(cur)
    chars = [{"c": c, "t": round(t + s, 3), "end": round(t + e, 3)} for c, s, e in zip(ch, cs, ce)]
    turns.append({"turn": n, "text": text, "words": words, "chars": chars})
    meta.append({"n": n, "text": text, "start": round(t, 3), "end": round(t + len(a) / SR, 3), "chars": len(text)})
    parts += [a, np.zeros(int(GAP * SR), np.float32)]
    t += len(a) / SR + GAP
audio = np.concatenate(parts[:-1])
wav = d / "voice.wav"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-", "-c:a", "pcm_s16le", str(wav)], input=audio.tobytes(), check=True)
(d / "vo" / "timings.json").write_text(json.dumps({"source": f"elevenlabs {MODEL} {voice} /with-timestamps", "turns": turns}, indent=1))
(d / "voice.lines.json").write_text(json.dumps({"voice": voice, "voice_id": vid, "model": MODEL, "lead": LEAD, "gap": GAP, "duration": round(len(audio) / SR, 3),
                                                 "chars_total": sum(m["chars"] for m in meta), "lines": meta}, indent=1))
print(f"{d.name}: {len(audio) / SR:.2f} s, {sum(len(x['words']) for x in turns)} words, billed this run {billed} chars")
