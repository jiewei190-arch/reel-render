#!/usr/bin/env python3
"""qa_short.py <short dir> [out dir]: QA a finished Short's video.mp4.

- Whisper small.en on the final mix (decoded to a numpy array) vs the lines.json script: wrong-word count.
- Loudness (ebur128 integrated + true peak), length, frame count.
- Black / blank frames: ffmpeg blackdetect (0.04 s) + per-frame luma spread (a frame with near-zero spread = blank).
- qa_sheet.png: 10 frames spread over the video (with the time and the words being spoken at that moment, to check
  caption sync by eye) and qa_end.png: the last 3 frames next to frame 1 (abrupt ending + loop).
"""
import difflib, json, os, re, subprocess, sys
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
short = os.path.abspath(sys.argv[1]); out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(short, "project", "build", "qa")
os.makedirs(out, exist_ok=True)
video = os.path.join(short, "video.mp4")
L = json.load(open(os.path.join(short, "project", "lines.json"), encoding="utf-8"))
script = " ".join(l["text"] for l in L["lines"])
src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "dia8.py")).read().split("if __name__")[0]
g = {}; exec(src, g); norm_words = g["norm_words"]


def run(*a):
    return subprocess.run(a, capture_output=True, text=True)


SR = 16000
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", video, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
audio = np.frombuffer(pcm, np.float32).copy()
from faster_whisper import WhisperModel
segs, _ = WhisperModel("small.en", device="cpu", compute_type="int8").transcribe(audio, beam_size=5, language="en", word_timestamps=True)
segs = list(segs)
heard = " ".join(s.text.strip() for s in segs)
words = [(w.word.strip(), w.start, w.end) for s in segs for w in s.words]
a, b = norm_words(script), norm_words(heard)
diffs = [(" ".join(a[i1:i2]), " ".join(b[j1:j2])) for op, i1, i2, j1, j2 in difflib.SequenceMatcher(a=a, b=b, autojunk=False).get_opcodes() if op != "equal"]
wrong = sum(max(len(x.split()), len(y.split())) for x, y in diffs)

r = run("ffmpeg", "-nostats", "-i", video, "-af", "ebur128=peak=true", "-f", "null", "-")
summ = r.stderr[r.stderr.rindex("Summary:"):]
lufs = float(re.search(r"I:\s+(-?[\d.]+) LUFS", summ).group(1)); tp = float(re.search(r"Peak:\s+(-?[\d.]+) dBFS", summ).group(1))
dur = float(run("ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", video).stdout)
nfr = int(run("ffprobe", "-v", "error", "-count_frames", "-select_streams", "v:0", "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", video).stdout)
bd = run("ffmpeg", "-nostats", "-i", video, "-vf", "blackdetect=d=0.04:pix_th=0.10", "-an", "-f", "null", "-").stderr
blacks = re.findall(r"black_start:\S+ black_end:\S+", bd)
# luma spread per frame (64x114 grey)
W, H = 64, 114
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", video, "-vf", f"scale={W}:{H},format=gray", "-f", "rawvideo", "-"], capture_output=True, check=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
spread = fr.std(axis=(1, 2)); blank = [int(i) for i in np.where(spread < 6)[0]]


def said(t):
    return " ".join(w for w, s, e in words if s <= t + 0.35 and e >= t - 0.35)


ts = [round(0.04 + i * (dur - 0.3) / 9, 2) for i in range(10)]
tiles = []
for i, t in enumerate(ts):
    f = os.path.join(out, f"t{i:02d}.png")
    lab = f"{t:.2f}s  VO: {said(t)}".replace(":", "\\:").replace("'", "").replace(",", "\\,")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", str(t), "-i", video, "-frames:v", "1", "-vf",
                    f"scale=360:-2,pad=360:700:0:0:black,drawtext=text='{lab}':x=6:y=650:fontsize=15:fontcolor=white", f], check=True)
    tiles.append(f)
subprocess.run(["ffmpeg", "-y", "-v", "error", "-framerate", "1", "-i", os.path.join(out, "t%02d.png"), "-vf", "tile=5x2:padding=4:color=0x202020",
                "-frames:v", "1", os.path.join(out, "qa_sheet.png")], check=True)
ends = [0, nfr - 3, nfr - 2, nfr - 1]
for k, n in enumerate(ends):
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", video, "-vf", f"select=eq(n\\,{n}),scale=300:-2,drawtext=text='frame {n + 1}':x=6:y=6:fontsize=18:fontcolor=yellow",
                    "-frames:v", "1", os.path.join(out, f"e{k}.png")], check=True)
subprocess.run(["ffmpeg", "-y", "-v", "error", "-framerate", "1", "-i", os.path.join(out, "e%d.png"), "-vf", "tile=4x1:padding=4:color=0x202020",
                "-frames:v", "1", os.path.join(out, "qa_end.png")], check=True)
for f in os.listdir(out):
    if re.fullmatch(r"[te]\d+\.png", f): os.remove(os.path.join(out, f))
# second pass: VAD-chunked (Whisper decodes phrase by phrase; a whole-clip pass can drift on SFX hits)
segs2, _ = WhisperModel("small.en", device="cpu", compute_type="int8").transcribe(audio, beam_size=5, language="en", vad_filter=True,
                                                                                    vad_parameters={"min_silence_duration_ms": 250})
heard2 = " ".join(s.text.strip() for s in segs2)
b2 = norm_words(heard2)
diffs2 = [(" ".join(a[i1:i2]), " ".join(b2[j1:j2])) for op, i1, i2, j1, j2 in difflib.SequenceMatcher(a=a, b=b2, autojunk=False).get_opcodes() if op != "equal"]
wrong2 = sum(max(len(x.split()), len(y.split())) for x, y in diffs2)
# third pass: the final mix cut per sentence (timeline/sentences.json, +-0.15 s), one decode per sentence
sents = json.load(open(os.path.join(short, "project", "timeline", "sentences.json")))
asr3 = WhisperModel("small.en", device="cpu", compute_type="int8"); parts3 = []
for st in sents:
    seg = audio[max(0, int((st["start"] - 0.15) * SR)): int((st["end"] + 0.15) * SR)]
    sg, _ = asr3.transcribe(seg, beam_size=5, language="en"); parts3.append(" ".join(x.text.strip() for x in sg))
heard3 = " ".join(parts3); b3 = norm_words(heard3)
diffs3 = [(" ".join(a[i1:i2]), " ".join(b3[j1:j2])) for op, i1, i2, j1, j2 in difflib.SequenceMatcher(a=a, b=b3, autojunk=False).get_opcodes() if op != "equal"]
wrong3 = sum(max(len(x.split()), len(y.split())) for x, y in diffs3)
rep = {"whisper_per_sentence": heard3, "wrong_words_per_sentence": wrong3, "diffs_per_sentence": diffs3,
       "whisper_vad": heard2, "wrong_words_vad": wrong2, "diffs_vad": diffs2, "duration_s": round(dur, 2), "frames": nfr, "lufs": lufs, "true_peak_dbtp": tp, "whisper": heard, "wrong_words": wrong, "diffs": diffs,
       "blackdetect": blacks, "blank_frames": blank, "min_luma_spread": round(float(spread.min()), 1),
       "pass": {"length_20_30": 20 <= dur <= 30, "lufs": abs(lufs + 14) <= 0.5, "tp": tp <= -1.0, "no_black": not blacks and not blank}}
json.dump(rep, open(os.path.join(out, "qa.json"), "w"), indent=1)
print(json.dumps(rep, indent=1))
