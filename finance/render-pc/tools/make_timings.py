"""make_timings.py <script.txt> <out timings.json> [words_per_s=2.8]
Synthetic vo/timings.json (one line = one turn, ~2.8 words/s, 0.35 s between lines) for drafting a recipe before the
voice exists. Replace it with the real Whisper timings before rendering: recipes anchor to words, so nothing else changes."""
import json, sys
src, out = sys.argv[1], sys.argv[2]
wps = float(sys.argv[3]) if len(sys.argv) > 3 else 2.8
t, turns = 0.0, []
for n, line in enumerate([l.strip() for l in open(src, encoding="utf-8") if l.strip()], 1):
    ws = []
    for w in line.split():
        d = (0.12 + 0.045 * len(w.strip(".,!?"))) * 2.8 / wps
        ws.append({"w": w, "t": round(t, 3), "end": round(t + d, 3)})
        t += d
    turns.append({"turn": n, "text": line, "words": ws})
    t += 0.35
json.dump({"source": {"synthetic": True, "duration": round(t + 0.3, 3)}, "turns": turns}, open(out, "w"), indent=1)
print(f"{out}: {len(turns)} lines, {t:.2f} s")
