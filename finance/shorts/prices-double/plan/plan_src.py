"""Plan source for the finance Short "prices-double": shots, accents and tags anchored to WORDS of the voice-over.
Re-run after every VO change; the times move with the words. Writes src/plan.gen.ts and plan/SHOTS.md.

    python plan/plan_src.py vo/timings.json
"""
TITLE = "prices-double"
CAST_NOTE = "PENNY (copper kid, backpack) shops; SAVER (green, glasses) works the Rule of 72; TELLER (violet, apron) relabels prices. Set: the bright hall as a corner shop (shelves, a big price block on a pedestal, a flip calendar, a chart board); no logos."
LOOP_NOTE = "S18 (\"That's how\") returns to the S01 lens: Penny looks up at the $1 price block that starts to double again; the loop lands on \"Prices double faster than you think.\""
COUNTER = "`72 ÷ INFLATION = YEARS` flipping per rate, then `1970 → 2026: ×8.7 (3 DOUBLINGS)`."
SHOTS = [
    ("S01", (1, "prices", 1), "store", "medium on Penny + the price block, push-in", "Conflict in frame 1: Penny in the shop looks up at a big price block $1 on a pedestal, and a ghost $2 block already rising behind it; counter 72 ÷ INFLATION = YEARS"),
    ("S02", (1, "think", 1), "store", "close on the price block, push-in", "The $1 block pops into $2 (pop)"),
    ("S03", (2, "rule", 1), "store", "medium on Saver, push-in", "Saver hoists the green 72 block"),
    ("S04", (2, "point", 1), "store", "medium wide, push-in", "Saver points the 72 block at a red neon sign INFLATION"),
    ("S05", (3, "at", 1), "store", "medium on Penny, push-in", "Penny holds a card 2%"),
    ("S06", (3, "double", 1), "store", "close on the flip calendar, push-in", "The flip calendar riffles to 36 YEARS; the price block grows $1 → $2 slowly"),
    ("S07", (4, "at", 1), "store", "medium on Penny, push-in", "Penny flips the card to 3%"),
    ("S08", (4, "24", 1), "store", "close on the calendar, push-in", "Calendar: 24 YEARS (faster)"),
    ("S09", (5, "at", 1), "store", "medium on Penny, push-in", "Penny flips the card to 4%; her eyes widen"),
    ("S10", (5, "18", 1), "store", "close on the calendar, push-in", "Calendar: 18 YEARS (faster still)"),
    ("S11", (6, "1970", 1), "home", "medium wide, push-in", "Warm retro light: the calendar reads 1970; Teller labels the price block $1"),
    ("S12", (6, "prices", 1), "store", "medium on the chart board, push-in", "A chart board: U.S. CPI-U, a line climbing from 1970 to 2026"),
    ("S13", (6, "percent", 1), "store", "close on the chart, push-in", "Tag ~4% A YEAR (AVG) on the chart"),
    ("S14", (7, "they", 1), "store", "wide on the shelves, push-in", "Three price blocks in a row grow $1 → $2 → $4 → $8: the doublings"),
    ("S15", (7, "three", 1), "store", "medium on the blocks, push-in", "Labels ×2 ×2 ×2 pop over the blocks, then ≈ ×8.7 SINCE 1970"),
    ("S16", (8, "small", 1), "ending", "medium two-shot, push-in", "Penny holds up the tiny 4% card next to the huge $8 block"),
    ("S17", (8, "huge", 1), "ending", "low angle on the big block, push-in", "The big block towers over Penny and Saver"),
    ("S18", (8, "that's", 1), "store", "SAME lens + position as S01 (loop match), push-in", "Back to the start: Penny looks up at the $1 block as the ghost $2 rises"),
]
ACCENT = {(1, "faster"), (3, "36"), (4, "24"), (5, "18"), (7, "eighteen"), (8, "huge")}
TAGS = [
    (1, "prices", "RULE OF 72: AN APPROXIMATION", "small painted card on the pedestal from frame 0"),
    (6, "percent", "~4%/YR · CPI-U 1970-2026", "on the chart board"),
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
