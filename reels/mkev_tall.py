# sound events for the Distilbook "tall" reels: page turn per board, pencil scribble per stage cue, chime per chapter, sparkle at the end
import json, sys, pathlib
H = pathlib.Path(__file__).resolve().parent; n = sys.argv[1]
spec = json.load(open(H / "specs" / f"{n}.json")); s = (H / f"tl_{n}.js").read_text(); PH = json.loads(s[s.index("=") + 1:].rstrip().rstrip(";"))["p"]
b = spec["boards"]; runs = []
for i, x in enumerate(b):
    if not runs or runs[-1]["b"] != x: runs.append({"b": x, "i0": i, "i1": i})
    else: runs[-1]["i1"] = i
ev = []
for k, r in enumerate(runs):
    st = 0 if k == 0 else PH[r["i0"]]["start"] - .3
    if k: ev.append(["pageturn", round(st, 3)])
    for beat, off in spec["stages"][k]:
        t = PH[min(r["i1"], r["i0"] + beat)]["start"] + off
        if 0 <= t < PH[-1]["end"] and off < 100: ev.append(["scribble", round(t, 3), round(t + .7, 3)]); ev.append(["pop", round(t + .05, 3)])
for i, c in enumerate(spec.get("chapters") or []):
    if c and i: ev.append(["chime", round(PH[i]["start"] - float(spec.get("pause", {}).get(str(i - 1), 0)), 3), 76])
ev.append(["sparkle", round(PH[-1]["start"] + .3, 3)])
json.dump(sorted(ev, key=lambda e: e[1]), open(H / f"ev_{n}.json", "w")); print(n, len(ev), "events")
