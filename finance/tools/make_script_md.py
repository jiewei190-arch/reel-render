"""Build <slug>/script.md from the narration, the word timings and the generated shot list.
    python finance/tools/make_script_md.py finance/shorts/<slug> [...]
Header facts (words, duration) are measured, not typed. The shot plan is plan/SHOTS.md's table (word-anchored)."""
import json, re, sys
from pathlib import Path


def main(d):
    d = Path(d)
    lines = (d / "script.txt").read_text(encoding="utf8").splitlines()
    words = sum(len(l.split()) for l in lines)
    tm = json.loads((d / "vo" / "timings.json").read_text(encoding="utf8"))
    dur = tm["source"]["duration"]
    shots = (d / "plan" / "SHOTS.md").read_text(encoding="utf8").splitlines()
    table = [l for l in shots if l.startswith("|")]
    cast = next(l for l in shots if "Cast:" in l)
    loop = shots[shots.index("## Loop") + 2]
    tags = shots[shots.index("## Painted / holo tags") + 2: shots.index("## Loop") - 1]
    turn_t = [f"{t['words'][0]['t']:.2f}–{t['words'][-1]['end']:.2f}" for t in tm["turns"]]
    out = [f"# {d.name}", "",
           f"- **Spoken:** {words} words, voice {dur:.2f} s (D2 Chatterbox, exaggeration 0.3, cfg 0.3).",
           f"- **Hook:** line 1, spoken from 0.0 s, no intro.",
           f"- **Ending:** stops mid-thought, no call to action; the last line runs straight into line 1 when the Short loops.",
           f"- **Loop:** {loop}", "",
           "## Voice-over (exact spoken text = script.txt)", "",
           "| # | time (s) | line |", "|---|---|---|"]
    out += [f"| {i+1} | {turn_t[i]} | {l} |" for i, l in enumerate(lines)]
    out += ["", f"Loop read-through: \"…{lines[-1]} / {lines[0]}\"", "",
            "## Shot plan (one cut every ~1.4 s, each on its word)", "", cast, "",
            "Every shot: the camera never rests (constant push-in), captions in the safe zone (1–2 lowercase words, "
            "one yellow accent per sentence), original blocky cast only, no logos or brands, plain bills/cards with no "
            "real currency art.", ""] + table + ["", "### On-screen tags", ""] + tags
    (d / "script.md").write_text("\n".join(out) + "\n", encoding="utf8")
    print(d.name, words, "words", f"{dur:.2f} s")


for x in sys.argv[1:]:
    main(x)
