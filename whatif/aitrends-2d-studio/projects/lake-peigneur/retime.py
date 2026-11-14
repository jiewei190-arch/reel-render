"""Time story/shots.json to timeline/words.json: each shot starts a little before an anchor word (k-th occurrence);
the last shot ends at the end of the voiceover. Then run make_music.py."""
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
ANCH = {"s01": None, "s02": ("swallowed", 1, 0.08), "s03": ("A", 1, 0.15), "s04": ("right",), "s05": ("At",), "s06": ("The", 3),
        "s07": ("like", 1, 0.08), "s08": ("The", 4), "s09": ("eleven", 1, 0.1), "s10": ("and", 1, 0.06), "s11": ("Then",),
        "s12": ("The", 7, 0.1), "s13": ("Days",), "s14": ("Every",), "s15": ("The", 9), "s16": ("Subscribe", 1, 0.1)}
S = json.load(open("story/shots.json")); shots = S["shots"]
starts = [0.0 if ANCH[s["id"]] is None else t(*ANCH[s["id"]]) for s in shots]
for i, s in enumerate(shots):
    s["start"] = round(starts[i], 3); s["end"] = round(starts[i + 1] if i + 1 < len(shots) else dur, 3)
    assert s["end"] > s["start"] + 0.5, (s["id"], s["start"], s["end"])
S["duration"] = round(dur, 3); json.dump(S, open("story/shots.json", "w"), indent=1)
for s in shots: print(f'{s["id"]} {s["start"]:6.2f}-{s["end"]:6.2f} ({s["end"]-s["start"]:.2f}s) {s["line"]}')
