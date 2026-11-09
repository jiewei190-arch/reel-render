"""Word timings: Whisper words aligned onto the script's own words (captions use script spelling).
Usage: python3 words.py voiceover.wav segments.json words.json [--caption "eight ninety-seven=897" ...]
Script words get the Whisper start/end when matched; unmatched words are spread inside their TTS sentence segment.
--caption joins spoken words into one caption token (digits on screen)."""
import sys, json, re, difflib
wav, segp, outp = sys.argv[1:4]
caps = [a.split("=") for i, a in enumerate(sys.argv) if i > 0 and sys.argv[i - 1] == "--caption"]
from faster_whisper import WhisperModel
m = WhisperModel("small", device="cpu", compute_type="int8")
import soundfile as sf, numpy as np
_a, _sr = sf.read(wav, dtype="float32")
_a = _a if _a.ndim == 1 else _a.mean(1)
_a = np.interp(np.arange(0, len(_a) / _sr, 1 / 16000), np.arange(len(_a)) / _sr, _a).astype(np.float32)
ws = [w for s in m.transcribe(_a, language="en", word_timestamps=True)[0] for w in s.words]
print("WHISPER:", " ".join(w.word.strip() for w in ws))
norm = lambda s: re.sub(r"[^a-z0-9]", "", s.lower())
segs = json.load(open(segp)); sw = []
for si, s in enumerate(segs):
    for w in s["text"].split(): sw.append({"word": w, "seg": si})
a = [norm(w["word"]) for w in sw]; b = [norm(w.word) for w in ws]
sm = difflib.SequenceMatcher(None, a, b, autojunk=False); hit = 0
for blk in sm.get_matching_blocks():
    for j in range(blk.size):
        x = sw[blk.a + j]; y = ws[blk.b + j]; s = segs[x["seg"]]
        if s["start"] - 0.4 <= y.start <= s["end"] + 0.4: x["start"], x["end"] = y.start, y.end; hit += 1
print(f"matched {hit}/{len(sw)}")
# fill gaps per segment proportionally by characters
for si, s in enumerate(segs):
    idx = [i for i, w in enumerate(sw) if w["seg"] == si]
    i = 0
    while i < len(idx):
        if "start" in sw[idx[i]]: i += 1; continue
        j = i
        while j < len(idx) and "start" not in sw[idx[j]]: j += 1
        t0 = sw[idx[i - 1]]["end"] if i > 0 else s["start"]; t1 = sw[idx[j]]["start"] if j < len(idx) else s["end"]
        L = sum(len(sw[idx[q]]["word"]) for q in range(i, j)); c = t0
        for q in range(i, j):
            d = (t1 - t0) * len(sw[idx[q]]["word"]) / L; sw[idx[q]]["start"], sw[idx[q]]["end"] = round(c, 3), round(c + d, 3); c += d
        i = j
    # first word of a segment starts at the speech onset at the latest
    sw[idx[0]]["start"] = min(sw[idx[0]]["start"], s["start"] + 0.02)
out = [{"word": w["word"], "start": round(w["start"], 3), "end": round(w["end"], 3)} for w in sw]
for spoken, shown in caps:
    n = len(spoken.split())
    for i in range(len(out) - n + 1):
        if [norm(w["word"]) for w in out[i:i + n]] == [norm(x) for x in spoken.split()]:
            out[i:i + n] = [{"word": shown, "start": out[i]["start"], "end": out[i + n - 1]["end"]}]; break
json.dump({"source": "Whisper small word timestamps aligned to the script; years shown as digits", "words": out}, open(outp, "w"), indent=1)
print(" ".join(f"{w['word']}@{w['start']}" for w in out))
