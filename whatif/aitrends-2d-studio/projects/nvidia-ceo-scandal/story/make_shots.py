"""Builds story/shots.json from timeline/words.json and rewrites caption display words (digits, $) — run after transcribe.py."""
import json, os, re, wave
P = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
wj = json.load(open(f"{P}/timeline/words.json")); words = wj.get("words", wj) if isinstance(wj, dict) else wj
# --- caption display: digits for numbers, "$" amounts, "AI" ---
out = []
for i, w in enumerate(words):
    k = re.sub(r"[^\w'-]", "", w["word"]).lower()
    if k == "dollars" and out and re.sub(r"[^\w]", "", out[-1]["word"]).lower() == "billion":
        out[-1]["word"] = out[-1]["word"] + w["word"][len("dollars"):]; out[-1]["end"] = w["end"]; continue   # "5 billion dollars," -> "~$5 billion,"
    w = dict(w)
    if k == "eighth": w["word"] = "8th" + w["word"][6:]
    if k == "5": w["word"] = "~$5"
    if k == "500": w["word"] = "$500"
    if k in ("a-i", "ai"): w["word"] = "AI" + w["word"][3 if k == "a-i" else 2:]
    if k == "nvidia": w["word"] = w["word"].replace("NVIDIA", "Nvidia")
    out.append(w)
if isinstance(wj, dict): wj["words"] = out
else: wj = out
json.dump(wj, open(f"{P}/timeline/words.json", "w"), indent=1)
words = out
with wave.open(f"{P}/input/voiceover.wav") as f: DUR = round(f.getnframes() / f.getframerate(), 3)
norm = lambda s: re.sub(r"[^\w]", "", s).lower()
def find(word, after=0.0):
    for w in words:
        if norm(w["word"]) == word and w["start"] >= after - 1e-6: return w["start"]
    raise SystemExit(f"word not found: {word} after {after}")
b = [0.0]
b.append(find("over")); b.append(find("jensen")); b.append(find("her")); b.append(find("and", b[-1]))
b.append(find("then")); b.append(find("four")); b.append(find("and", b[-1])); b.append(find("now")); b.append(find("and", b[-1]))
b.append(find("the", b[-1] + 1.0)); b.append(find("subscribe"))
b = [0.0] + [round(max(0, x - 0.08), 3) for x in b[1:]] + [DUR]
S = lambda n, **k: {"name": f"toon3d:{n}", **k}
plan = [
 ("s01", "The CEO of Nvidia just lost his job...", "keynote stage + hook", None, [S("riser", at=0, gain=-16), S("thud", word="job", gain=-6), S("ding", word="job", offset=0.05, gain=-12)]),
 ("s02", "over a suspected Chinese spy.", "radar + stamp", {"type": "flash", "dur": 0.25}, [S("impact", at=0, gain=-10), S("beep", at=0.3, gain=-18), S("beep", at=1.1, gain=-18), S("stamp", word="spy", gain=-5)]),
 ("s03", "Jensen Huang admitted an affair on November eighth.", "letter + 40 years frame", {"type": "whipBlur", "dir": 1}, [S("whoosh", at=0, gain=-10), S("paper", at=0.15, gain=-10), S("pop", at=1.3, gain=-12)]),
 ("s04", "Her company reportedly bought nearly 5 billion dollars of his chips,", "handshake + pallet + price tag", {"type": "fade", "dur": 0.25}, [S("swoosh", at=0, gain=-12), S("cash", word="billion", gain=-8), S("sparkle", word="billion", offset=0.1, gain=-12)]),
 ("s05", "and is suspected of funneling them to China.", "insert: suspected route map", {"type": "cut"}, [S("impact", at=0, gain=-10), S("paper", at=0.1, gain=-10), S("boing", at=0.9, gain=-12)]),
 ("s06", "Then the New York Times reported a second affair. Then Reuters reported a third.", "newspapers + sweat", {"type": "whipBlur", "dir": -1}, [S("whoosh", at=0, gain=-10), S("paper", word="york", gain=-8), S("swoosh", word="york", gain=-12), S("paper", word="reuters", gain=-8), S("ding", word="reuters", offset=0.15, gain=-10)]),
 ("s07", "Four days later, he resigned.", "boardroom, empty chair, resignation slides", {"type": "iris", "dur": 0.5}, [S("swoosh", at=0, gain=-12), S("slide", word="resigned", offset=-0.4, gain=-10), S("thud", word="resigned", gain=-8)]),
 ("s08", "And Nvidia lost about 500 billion dollars in value that week.", "chart cliff dive + counter -$500B", {"type": "flash", "dur": 0.25}, [S("whoosh", at=0, gain=-10), S("drop", at=0.3, gain=-10), S("crash", word="billion", offset=0.2, gain=-10), S("fail", word="billion", offset=0.3, gain=-12)]),
 ("s09", "Now Congress wants him to testify before Thanksgiving.", "sunny capitol + letter + turkey", {"type": "whipBlur", "dir": 1}, [S("whoosh", at=0, gain=-10), S("paper", at=0.35, gain=-10), S("pop", word="thanksgiving", gain=-8), S("boing", word="thanksgiving", offset=0.2, gain=-12)]),
 ("s10", "And the president was reportedly briefed on the spy concern a year earlier.", "insert: reported timeline", {"type": "fade", "dur": 0.25}, [S("swoosh", at=0, gain=-10), S("pop", at=0.6, gain=-12), S("pop", at=1.0, gain=-12), S("ding", word="year", gain=-8)]),
 ("s11", "The king of AI... brought down by the one thing he couldn't compute.", "supercomputer melts", {"type": "iris", "dur": 0.5}, [S("swoosh", at=0, gain=-12), S("rumble", word="brought", gain=-10), S("splash", word="compute", offset=-0.6, gain=-10), S("boing", word="compute", offset=0.1, gain=-12)]),
 ("s12", "Subscribe for more.", "puddle + ERROR, hard cut to frame 1", {"type": "cut"}, [S("buzz", at=0.1, gain=-16)]),
]
shots = []
for i, (sid, line, scene, tr, sfx) in enumerate(plan):
    s = {"id": sid, "start": b[i], "end": b[i + 1], "line": line, "scene": scene, "sfx": sfx}
    if tr: s["in"] = tr
    shots.append(s)
json.dump({"duration": DUR, "shots": shots}, open(f"{P}/story/shots.json", "w"), indent=1)
for s in shots: print(s["id"], s["start"], s["end"], round(s["end"] - s["start"], 2))
