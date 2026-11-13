"""Re-time story/shots.json (+ caption hide window in config.json) to timeline/words.json after a new voiceover.
Each shot starts a little before an anchor word (k-th occurrence); the last shot ends at the end of the voiceover.
Then run make_music.py (it reads the aftermath/court cut times from shots.json)."""
import json, re, subprocess
W = json.load(open("timeline/words.json"))["words"]
norm = lambda s: re.sub(r"[^a-z0-9.']", "", s.lower()).strip(".")
def t(word, nth=1, lead=0.12):
    k = 0
    for w in W:
        if norm(w["word"]) == norm(word):
            k += 1
            if k == nth: return max(0.0, w["start"] - lead)
    raise SystemExit(f"anchor not found: {word} #{nth}")
dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", "input/voiceover.wav"]).decode())
ANCH = {"s01": None, "s02": ("Nobody",), "s03": ("January",), "s04": ("A", 1, 0.1), "s05": ("2.3", 1, 0.1), "s06": ("rips", 1, 0.12),
        "s07": ("What",), "s08": ("moving", 1, 0.1), "s09": ("That's", 1, 0.25), "s10": ("It",), "s11": ("and", 1, 0.05),
        "s12": ("21", 2, 0.15), "s13": ("The", 4, 0.12), "s14": ("court", 1, 0.2), "s15": ("And", 2), "s16": ("like", 2, 0.1),
        "s17": ("Slow", 2, 0.15), "s18": ("Subscribe", 1, 0.1)}
S = json.load(open("story/shots.json")); shots = S["shots"]
starts = [0.0 if ANCH[s["id"]] is None else t(*ANCH[s["id"]]) for s in shots]
for i, s in enumerate(shots):
    s["start"] = round(starts[i], 3); s["end"] = round(starts[i + 1] if i + 1 < len(shots) else dur, 3)
    assert s["end"] > s["start"] + 0.5, (s["id"], s["start"], s["end"])
S["duration"] = round(dur, 3); json.dump(S, open("story/shots.json", "w"), indent=1)
c = json.load(open("config.json")); s17 = next(s for s in shots if s["id"] == "s17"); c["captionStyle"]["hide"] = [[s17["start"], s17["end"] + 0.01]]; json.dump(c, open("config.json", "w"), indent=1)
for s in shots: print(f'{s["id"]} {s["start"]:6.2f}-{s["end"]:6.2f} ({s["end"]-s["start"]:.2f}s) {s["line"]}')
