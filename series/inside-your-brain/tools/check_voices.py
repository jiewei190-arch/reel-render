# Transcribe every line with faster-whisper (local) and compare to the script: are the voices understandable?
# Also writes word timings into timeline.json (used for word-synced captions).
import json, pathlib, re, subprocess, sys, difflib, numpy as np
from faster_whisper import WhisperModel
ROOT = pathlib.Path(__file__).resolve().parent.parent
ep = pathlib.Path(sys.argv[1]).resolve(); T = json.load(open(ep / "timeline.json"))
m = WhisperModel("small.en", device="cpu", compute_type="int8")
norm = lambda s: re.sub(r"[^a-z0-9 ]", "", s.lower().replace("-", " ")).split()
bad = 0
for L in T["lines"]:
    a = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", str(ROOT / "public" / T["id"] / f"line_{L['i']:02d}.wav"), "-ar", "16000", "-ac", "1", "-f", "f32le", "-"], capture_output=True, check=True).stdout, np.float32)
    segs, _ = m.transcribe(a, word_timestamps=True, language="en", beam_size=5)
    words = [w for s in segs for w in s.words]
    heard = " ".join(w.word.strip() for w in words)
    r = difflib.SequenceMatcher(None, norm(L["spoken"]), norm(heard)).ratio()
    L["heard"], L["match"] = heard, round(r, 2)
    L["words"] = [{"w": w.word.strip(), "s": round(L["start"] + w.start, 3), "e": round(L["start"] + w.end, 3)} for w in words]
    flag = "  <-- check" if r < .85 else ""; bad += r < .85
    print(f"{L['i']:2d} {L['who']:10s} {r:.2f}  heard: {heard}{flag}")
json.dump(T, open(ep / "timeline.json", "w"))
print("lines below 0.85:", bad)
