"""Plan source for the finance Short "same-car-more": shots, accents and tags anchored to WORDS of the voice-over.
Re-run after every VO change; the times move with the words. Writes src/plan.gen.ts and plan/SHOTS.md.

    python plan/plan_src.py vo/timings.json
"""
TITLE = "same-car-more"
CAST_NOTE = "SPENDER (red, bag) chooses a loan; LENDER (navy, hat) at the loan booth; SAVER (green, glasses) takes the 3-year loan. Set: the sunny blocky street (outdoor ground + road) with two identical red cars side by side (3-YEAR LOAN, 7-YEAR LOAN), a loan booth, two coin piles (interest); no brands, no badges on the cars."
LOOP_NOTE = "S21 (\"…you've paid for the\") returns to the S01 lens: the two identical cars side by side, the 7-year one glowing +$4,700; the loop lands on \"Same car, 4,700 dollars more.\""
COUNTER = "two dashboards on a car: `MONTHLY $x` and `INTEREST $x`, flipping between the 3-year (green) and 7-year (red) loans."
SHOTS = [
    ("S01", (1, "same", 1), "earth", "wide two-car shot, push-in", "Conflict in frame 1: two identical red cars side by side, tags 3-YEAR LOAN and 7-YEAR LOAN; Spender between them, scratching his head"),
    ("S02", (1, "4,700", 1), "earth", "medium on the 7-year car, push-in", "A big tag pops over the 7-year car: +$4,700"),
    ("S03", (1, "more", 1), "earth", "medium on Spender, push-in", "Spender does a double take"),
    ("S04", (2, "borrow", 1), "earth", "medium on Lender at the booth, push-in", "Lender at the loan booth hands over a block: $30,000"),
    ("S05", (2, "seven", 1), "earth", "close on a tag, push-in", "Tag 7% APR on the booth"),
    ("S06", (2, "example", 1), "earth", "close on a card, push-in", "A small card: EXAMPLE RATE"),
    ("S07", (3, "three", 1), "earth", "medium on the 3-year car + Saver, push-in", "Saver by the 3-year car, sign 3 YEARS"),
    ("S08", (3, "926", 1), "earth", "close on the dashboard sign, push-in", "Dash sign on the 3-year car: $926/MONTH"),
    ("S09", (3, "3,347", 1), "earth", "medium on a small pile, push-in", "A small green-tagged coin pile: $3,347 INTEREST"),
    ("S10", (3, "interest", 1), "earth", "wide, push-in", "Saver drives the 3-year car off; small pile behind"),
    ("S11", (4, "seven", 1), "earth", "medium on the 7-year car + Spender, push-in", "Spender by the 7-year car, sign 7 YEARS"),
    ("S12", (4, "453", 1), "earth", "close on the dashboard sign, push-in", "Dash sign on the 7-year car: $453/MONTH"),
    ("S13", (4, "feels", 1), "earth", "medium on Spender, push-in", "Spender grins and dusts his hands: cheaper!"),
    ("S14", (5, "but", 1), "whisper", "wide on the booth, push-in", "Behind the booth a red pile starts to rise"),
    ("S15", (5, "8,034", 1), "whisper", "low angle on the big pile, push-in", "The red pile towers: $8,034 INTEREST"),
    ("S16", (6, "lower", 1), "store", "two piles side by side, push-in", "Small $3,347 pile next to the big $8,034 pile"),
    ("S17", (6, "bigger", 1), "store", "close on the difference tag, push-in", "Tag between them: +$4,686 (≈ $4,700)"),
    ("S18", (7, "c.f.p.b", 1), "store", "medium on a sign, push-in", "A plain sign: CFPB: A LONGER LOAN MEANS MORE INTEREST"),
    ("S19", (7, "longer", 1), "whisper", "medium on Spender, push-in", "Spender looks at his 7-year car, drooping"),
    ("S20", (8, "stretch", 1), "earth", "medium on the 7-year car, push-in", "A loan timeline bar stretches from 3 to 7 years along the kerb"),
    ("S21", (8, "you've", 1), "earth", "SAME lens + position as S01 (loop match), push-in", "Back to the start: the two identical cars, the 7-year one glowing +$4,700"),
]
ACCENT = {(1, "4,700"), (2, "example"), (3, "3,347"), (4, "453"), (5, "8,034"), (6, "bigger"), (7, "more"), (8, "seven")}
TAGS = [
    (1, "same", "EXAMPLE: $30,000 · 7% APR", "small painted card on the kerb from frame 0"),
    (5, "8,034", "$8,034 INTEREST (7 YRS)", "holo tag over the big pile"),
]


# ---- engine (same in every finance Short; from the blocky-shorts template's plan/plan_src.py, extended) -----------
# Changes from the template: a shot carries a full scene line (cast, action, props, on-screen tag, camera); cuts aim at
# ~1.4 s (warn under 1.0 s or over 2.2 s); a COUNTER (big on-screen number, every shot) is exported too; also writes
# plan/SHOTS.md (readable shot list with times and captions).
import json, sys
from pathlib import Path

FPS = 30
LEAD = 2  # captions appear 2 frames before the word
CHUNK_WORDS = 2  # 1-2 lowercase words per caption chunk
TAIL = 0.6  # picture keeps running after the last word (the loop cut lands here)


def clean(w):
    return w.lower().strip(".,!?;:\"'…")


def load(p):
    words = []
    for tr in json.loads(Path(p).read_text(encoding="utf8"))["turns"]:
        for w in tr["words"]:
            words.append({"turn": tr["turn"], "w": w["w"], "t": w["t"], "end": w["end"]})
    return words


def find(words, turn, word, nth=1):
    k = 0
    for w in words:
        if w["turn"] == turn and clean(w["w"]) == word.lower():
            k += 1
            if k == nth:
                return w
    raise SystemExit(f"anchor not found: turn {turn} word {word!r} #{nth}")


def main(p):
    root = Path(__file__).resolve().parent.parent
    words = load(p)
    total = words[-1]["end"] + TAIL
    shots = []
    for i, (sid, (tn, wd, nth), mood, cam, scene) in enumerate(SHOTS):
        t0 = 0.0 if i == 0 else find(words, tn, wd, nth)["t"]
        shots.append({"id": sid, "t": round(t0, 3), "mood": mood, "note": cam, "scene": scene, "anchor": wd})
    warns = []
    for a, b in zip(shots, shots[1:] + [{"t": total}]):
        a["end"] = round(b["t"], 3)
        d = a["end"] - a["t"]
        if d < 1.0 or d > 2.2:
            warns.append(f"WARN {a['id']} is {d:.2f} s (aim ~1.4 s)")
    caps, chunk = [], []
    for w in words:
        chunk.append(w)
        if len(chunk) == CHUNK_WORDS or w["w"][-1:] in ".,!?;:…":
            caps.append(chunk)
            chunk = []
    if chunk:
        caps.append(chunk)
    captions = [{
        "text": " ".join(c["w"].lower() for c in ch),
        "cased": " ".join(c["w"] for c in ch),  # script.txt casing (on-screen captions)
        "accent": [c["w"].lower() for c in ch if (c["turn"], clean(c["w"])) in ACCENT],
        "frame": max(0, round(ch[0]["t"] * FPS) - LEAD),
    } for ch in caps]
    tags = [{"text": tx, "t": round(find(words, tn, wd)["t"], 3), "note": nt} for tn, wd, tx, nt in TAGS]
    n_acc = sum(1 for c in captions if c["accent"])
    print(f"{len(shots)} shots, {len(captions)} caption chunks, {n_acc} accented, {len(tags)} tags, {total:.2f} s")
    for w in warns:
        print(w)
    if n_acc > max(1, total / 3):
        print("WARN too many accents: about one per sentence")
    out = root / "src" / "plan.gen.ts"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(
        "// generated by plan/plan_src.py; do not edit\n"
        f"export const FPS = {FPS};\nexport const DURATION = {round(total * FPS)};\n"
        f"export const SHOTS = {json.dumps(shots)} as const;\n"
        f"export const CAPTIONS = {json.dumps(captions)} as const;\n"
        f"export const TAGS = {json.dumps(tags)} as const;\n"
        f"export const COUNTER = {json.dumps(COUNTER)} as const;\n", encoding="utf8")
    # readable shot list
    md = [f"# {TITLE}: shot list (generated by plan/plan_src.py from vo/timings.json; do not edit)", "",
          f"{len(shots)} shots, {total:.2f} s ({round(total * FPS)} frames at {FPS} fps), median cut "
          f"{sorted(s['end'] - s['t'] for s in shots)[len(shots) // 2]:.2f} s. Cast: {CAST_NOTE}", "",
          "| shot | time (s) | dur | anchor word | mood | scene (cast, action, props, on-screen tag) | camera | captions in shot |",
          "|---|---|---|---|---|---|---|---|"]
    for s in shots:
        cs = [c["text"] for c in captions if s["t"] * FPS - LEAD <= c["frame"] < s["end"] * FPS - LEAD]
        md.append(f"| {s['id']} | {s['t']:.2f}–{s['end']:.2f} | {s['end'] - s['t']:.2f} | {s['anchor']} | {s['mood']} | "
                  f"{s['scene']} | {s['note']} | {' / '.join(cs)} |")
    md += ["", "## On-screen counter (every shot, above the caption band)", "", COUNTER]
    md += ["", "## Painted / holo tags", ""] + [f"- {t['t']:.2f} s **{t['text']}**: {t['note']}" for t in tags]
    md += ["", "## Loop", "", LOOP_NOTE, ""] + ([f"## Warnings", ""] + [f"- {w}" for w in warns] if warns else [])
    (root / "plan" / "SHOTS.md").write_text("\n".join(md) + "\n", encoding="utf8")
    print("wrote", out.name, "+ plan/SHOTS.md")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "vo/timings.json")
