"""retime.py: build story/shots.json from story/shots.plan.json + the voice timings, so a new voice re-times every cut.

  python retime.py --project <kit>/projects/<slug>

Each plan shot says WHERE in the narration it starts, never an absolute time:
  "at": { "line": 3 }                          start of line 3 (the first shot always starts at 0)
  "at": { "line": 3, "word": "cases" }         start of the first spoken "cases" at/after line 3 starts (timeline/words.json)
  "at": { "line": 3, "word": "the", "nth": 2 } the 2nd "the" from there
  "at": { "line": 3, "end": true }             end of line 3
  "at": { "line": 3, "frac": 0.5 }             halfway through line 3
  + optional "offset": seconds (word anchors default to -0.08 so the cut lands just before the word)
Each shot ends where the next starts; the last ends at the last line's end + plan "tail" (default 0.25 s).
Everything else in a plan shot (line, in, sfx, captions, ...) is copied to shots.json unchanged.
Also writes config.json "duration". Prints every shot length and warns outside plan "minShot".."maxShot" (1.0..2.6 s).
"""
import argparse, json, os, re, sys

ap = argparse.ArgumentParser(); ap.add_argument("--project", required=True); a = ap.parse_args()
P = os.path.abspath(a.project)
plan = json.load(open(os.path.join(P, "story", "shots.plan.json"), encoding="utf-8"))
vl = json.load(open(os.path.join(P, "input", "voiceover.lines.json")))
words = json.load(open(os.path.join(P, "timeline", "words.json")))
words = words["words"] if isinstance(words, dict) else words
L = {r["n"]: r for r in vl["lines"]}
norm = lambda w: re.sub(r"[^\w']", "", w.lower())

def anchor(sh):
    at = sh["at"]; r = L[at["line"]]
    if "word" in at:
        n, after = at.get("nth", 1), r["start"] - 0.15
        for w in words:
            if w["start"] >= after and norm(w["word"]) == norm(at["word"]):
                n -= 1
                if n == 0: return w["start"] + at.get("offset", -0.08)
        sys.exit(f"{sh['id']}: word {at['word']!r} (nth {at.get('nth', 1)}) not found from line {at['line']}")
    if at.get("end"): t = r["end"]
    elif "frac" in at: t = r["start"] + (r["end"] - r["start"]) * at["frac"]
    else: t = r["start"]
    return t + at.get("offset", 0)

shots = plan["shots"]
starts = [0.0] + [round(anchor(s), 3) for s in shots[1:]]
dur = round(max(r["end"] for r in vl["lines"]) + plan.get("tail", 0.25), 3)
out, bad = [], []
lo, hi = plan.get("minShot", 1.0), plan.get("maxShot", 2.6)
for i, s in enumerate(shots):
    st, en = starts[i], (starts[i + 1] if i + 1 < len(shots) else dur)
    if en - st <= 0.15: sys.exit(f"{s['id']}: non-positive length ({st:.2f}-{en:.2f}); check the plan anchors")
    o = {k: v for k, v in s.items() if k != "at"}; o.update({"start": st, "end": en}); out.append(o)
    flag = "" if lo <= en - st <= hi else "  <-- outside %.1f-%.1f s" % (lo, hi)
    if flag: bad.append(s["id"])
    print(f"{s['id']:>5} {st:6.2f}-{en:6.2f}  {en - st:4.2f}s  {s.get('line', '')[:60]}{flag}")
story = {"duration": dur, "shots": out}
for k in ("music",):
    if k in plan: story[k] = plan[k]
json.dump(story, open(os.path.join(P, "story", "shots.json"), "w"), indent=1)
cfgp = os.path.join(P, "config.json"); cfg = json.load(open(cfgp)); cfg["duration"] = dur
json.dump(cfg, open(cfgp, "w"), indent=1)
print(f"duration {dur:.2f} s, {len(out)} shots" + (f", check pacing of {bad}" if bad else ""))
