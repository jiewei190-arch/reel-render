#!/usr/bin/env python3
"""Voice a Block Money Short with ElevenLabs, line by line, with word timings.

usage: eleven_tts.py <short_dir> <Tyler|Christopher> [--gap 0.25] [--lead 0.10] [--model eleven_v4]
Reads <short_dir>/script.txt (one spoken line per row) and writes:
  voice.wav (24 kHz mono s16), vo/timings.json (same shape as transcribe.py: source + turns[words{w,t,end}]),
  voice.lines.json (provider, voice, model, per-line timing, characters used).
The API key is injected by the cloud proxy: the header value 'proxy-injected' is replaced in transit.
"""
import argparse, base64, io, json, os, subprocess, sys, urllib.request, wave
VOICES = {"Tyler": "rPMkKgdwgIwqv4fXgR6N", "Christopher": "RolvCZ4e0AkAR2dzyTx0"}
SR = 24000

def tts(text, voice_id, model, speed=1.0):
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/with-timestamps?output_format=pcm_24000",
        data=json.dumps({"text": text, "model_id": model, "voice_settings": {"speed": speed}}).encode(),
        headers={"xi-api-key": "proxy-injected", "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=120) as r:
        d = json.load(r)
    pcm = base64.b64decode(d["audio_base64"])
    al = d.get("normalized_alignment") or d["alignment"]
    return pcm, al

def words_from(al, text, offset):
    ch, st, en = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
    out, cur, t0, t1 = [], "", None, None
    for c, s, e in zip(ch, st, en):
        if c.isspace():
            if cur: out.append((cur, t0, t1)); cur = ""
            continue
        if not cur: t0 = s
        cur += c; t1 = e
    if cur: out.append((cur, t0, t1))
    # map back to the script's own tokens (keeps punctuation/casing of script.txt)
    toks = text.split()
    if len(toks) == len(out):
        out = [(tok, a, b) for tok, (_, a, b) in zip(toks, out)]
    return [{"w": w, "t": round(a + offset, 3), "end": round(b + offset, 3)} for w, a, b in out]

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("dir"); ap.add_argument("voice", choices=VOICES)
    ap.add_argument("--gap", type=float, default=0.15); ap.add_argument("--lead", type=float, default=0.10)
    ap.add_argument("--model", default="eleven_v4"); ap.add_argument("--speed", type=float, default=1.15); ap.add_argument("--fit", type=float, default=29.5)
    a = ap.parse_args()
    lines = [l.strip() for l in open(os.path.join(a.dir, "script.txt"), encoding="utf-8") if l.strip()]
    pcm_all = bytearray(b"\0\0" * int(SR * a.lead)); t = a.lead; turns = []; meta = []; chars = 0
    for i, line in enumerate(lines, 1):
        pcm, al = tts(line, VOICES[a.voice], a.model, a.speed); chars += len(line)
        dur = len(pcm) / 2 / SR
        turns.append({"turn": i, "text": line, "words": words_from(al, line, t)})
        meta.append({"line": i, "text": line, "start": round(t, 3), "end": round(t + dur, 3)})
        pcm_all += pcm; t += dur
        if i < len(lines):
            pcm_all += b"\0\0" * int(SR * a.gap); t += a.gap
    os.makedirs(os.path.join(a.dir, "vo"), exist_ok=True)
    out = os.path.join(a.dir, "voice.wav"); tempo = 1.0
    if t > a.fit:
        tempo = min(t / a.fit, 1.25)  # pitch-preserving time-stretch, capped so delivery stays natural
    raw = os.path.join(a.dir, "vo", "_raw.wav")
    with wave.open(raw if tempo > 1.0 else out, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(bytes(pcm_all))
    if tempo > 1.0:
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", f"atempo={tempo:.4f}", "-ar", str(SR), "-ac", "1", "-c:a", "pcm_s16le", out], check=True)
        os.remove(raw)
        for tu in turns:
            for w_ in tu["words"]: w_["t"] = round(w_["t"] / tempo, 3); w_["end"] = round(w_["end"] / tempo, 3)
        for m in meta: m["start"] = round(m["start"] / tempo, 3); m["end"] = round(m["end"] / tempo, 3)
        t = t / tempo
    json.dump({"source": {"audio": "voice.wav", "script": "script.txt", "model": f"elevenlabs:{a.model}", "duration": round(t, 3)},
               "turns": turns}, open(os.path.join(a.dir, "vo", "timings.json"), "w"), indent=1)
    json.dump({"provider": "elevenlabs", "voice": a.voice, "voice_id": VOICES[a.voice], "model": a.model,
               "gap": a.gap, "lead": a.lead, "speed": a.speed, "tempo": round(tempo, 4), "sr": SR, "duration": round(t, 3), "characters": chars, "lines": meta},
              open(os.path.join(a.dir, "voice.lines.json"), "w"), indent=1)
    print(f"{a.dir}: {a.voice} {round(t,2)} s (tempo x{tempo:.3f}), {chars} chars")

if __name__ == "__main__":
    main()
