# Inside Your Brain: per-line TTS with Kokoro (local, Apache-2.0 model).
# Usage: python3 tools/voice.py episodes/ep01
# Writes public/<ep>/line_NN.wav, and episodes/<ep>/timeline.json (line timing + mouth envelope per frame).
import json, pathlib, re, subprocess, sys, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
ROOT = pathlib.Path(__file__).resolve().parent.parent
MODELS = ROOT.parent.parent / "tts"          # reel-render/tts (kokoro-v1.0.onnx, voices-v1.0.bin)
SR, FPS = 24000, 30
ep = pathlib.Path(sys.argv[1]).resolve(); S = json.load(open(ep / "script.json")); eid = S["id"]
out = ROOT / "public" / eid; out.mkdir(parents=True, exist_ok=True)
k = Kokoro(str(MODELS / "kokoro-v1.0.onnx"), str(MODELS / "voices-v1.0.bin"))
ONES = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen".split()
TENS = "_ _ twenty thirty forty fifty sixty seventy eighty ninety".split()
def two(n): return ONES[n] if n < 20 else TENS[n // 10] + ("-" + ONES[n % 10] if n % 10 else "")
def say(t):  # years spoken the natural way: 2022 -> "twenty twenty-two"
    return re.sub(r"\b(19|20)(\d\d)\b", lambda m: two(int(m.group(1))) + " " + (two(int(m.group(2))) if int(m.group(2)) >= 10 else "oh " + ONES[int(m.group(2))]), t)
t, lines = 0.0, []
for i, L in enumerate(S["lines"]):
    c = S["cast"][L["who"]]
    s, _ = k.create(say(L["text"]), voice=c["voice"], speed=c["speed"], lang="en-us"); s = s.astype(np.float32)
    idx = np.where(np.abs(s) > .01)[0]; s = s[max(idx[0] - 120, 0):idx[-1] + 240]
    if c.get("pitch", 1.0) != 1.0:  # character pitch: resample (changes pitch + pace together, like a tape)
        tmp = out / f"_tmp{i}.wav"; sf.write(tmp, s, SR)
        r = subprocess.run(["ffmpeg", "-v", "error", "-i", str(tmp), "-af", f"asetrate={int(SR * c['pitch'])},aresample={SR}", "-f", "f32le", "-ac", "1", "-"], capture_output=True, check=True)
        s = np.frombuffer(r.stdout, np.float32).copy(); tmp.unlink()
    s *= 0.85 / max(np.abs(s).max(), 1e-6)  # peak-normalise every line
    n = int(.008 * SR); s[:n] *= np.linspace(0, 1, n); s[-n:] *= np.linspace(1, 0, n)
    t += L.get("pre", 0.28); d = len(s) / SR
    sf.write(out / f"line_{i:02d}.wav", s, SR, subtype="PCM_16")
    hop = SR // FPS; env = [float(np.sqrt(np.mean(s[j:j + hop] ** 2))) for j in range(0, len(s), hop)]
    m = max(env) or 1; env = [round(min(1, (e / m) ** .6 * 1.15), 2) for e in env]  # mouth openness 0..1 per frame
    lines.append({**L, "i": i, "start": round(t, 3), "end": round(t + d, 3), "spoken": say(L["text"]), "mouth": env})
    t += d
total = round(t + S.get("tail", 2.0), 3)
json.dump({"id": eid, "fps": FPS, "total": total, "lines": lines}, open(ep / "timeline.json", "w"))
for L in lines: print(f'{L["i"]:2d} {L["who"]:10s} {L["start"]:6.2f}-{L["end"]:6.2f}  {L["text"]}')
print("TOTAL", total, "s")
