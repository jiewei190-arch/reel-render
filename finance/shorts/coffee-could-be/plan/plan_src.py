"""Plan source for the finance Short "coffee-could-be": shots, accents and tags anchored to WORDS of the voice-over.
Re-run after every VO change; the times move with the words. Writes src/plan.gen.ts and plan/SHOTS.md.

    python plan/plan_src.py vo/timings.json
"""
TITLE = "coffee-could-be"
CAST_NOTE = "SPENDER (red, bag) buys the daily coffee; SAVER (green, glasses) drops the same money into a jar instead; TELLER (violet, apron) runs the coffee bar. Set: the bright hall as a coffee bar + a savings corner (pedestal, a jar that becomes a tall column, a flip calendar, a big clock); no brands on cups."
LOOP_NOTE = "S20 (\"Which is how\") returns to the S01 lens: Spender lifts his cup while the ghost $186,000 column glows behind; the loop lands on \"Your coffee could be worth 186,000 dollars.\""
COUNTER = "a big counter `PUT IN $x` turning into `EXAMPLE VALUE $x` (green), with `YEAR nn` and an `EXAMPLE 7%/YR` badge."
SHOTS = [
    ("S01", (1, "your", 1), "store", "medium two-shot, push-in", "Conflict in frame 1: Spender at the coffee bar lifts a plain cup; behind him a ghost glass column labelled $186,000? glows over Saver's jar; counter $5 A DAY"),
    ("S02", (1, "186,000", 1), "store", "low angle on the ghost column, push-in", "The ghost column towers: $186,000 (EXAMPLE)"),
    ("S03", (2, "five", 1), "store", "medium on the coffee bar, push-in", "Teller hands Spender a cup; a $5 coin goes on the counter"),
    ("S04", (2, "a", 1), "store", "close on the counter, push-in", "One $5 stack per day pops on the counter: day 1, 2, 3..."),
    ("S05", (2, "1,825", 1), "store", "medium wide, push-in", "The stacks fill the bar: tag $1,825 A YEAR"),
    ("S06", (2, "year", 1), "store", "close on the calendar, push-in", "A flip calendar riffles 365 days"),
    ("S07", (3, "monthly", 1), "store", "medium on Saver, push-in", "Saver drops a $152 bundle into his jar instead (EXAMPLE)"),
    ("S08", (3, "thirty", 1), "store", "close on the jar, push-in", "The jar fills month by month; calendar 30 YEARS"),
    ("S09", (4, "54,750", 1), "store", "close on a tag, push-in", "Tag PUT IN $54,750 on the jar"),
    ("S10", (5, "say", 1), "store", "medium on a board, push-in", "A board: EXAMPLE 7%/YR, STEADY (MADE UP)"),
    ("S11", (5, "seven", 1), "store", "medium on the jar, push-in", "The jar starts to grow by itself (growth on growth), green glow"),
    ("S12", (5, "186,000", 1), "ending", "low angle on the column, push-in", "The jar is now a tall glass column: ≈ $186,600"),
    ("S13", (6, "twist", 1), "whisper", "medium on Spender, push-in", "Spender looks at his cup, worried"),
    ("S14", (6, "coffee", 1), "whisper", "close on the cup, push-in", "The cup on the counter, a small tag NOT THE VILLAIN"),
    ("S15", (6, "time", 1), "ending", "medium on a big clock, push-in", "A big clock spins; tag TIME IS"),
    ("S16", (7, "years", 1), "store", "medium on a short column, push-in", "A second, short column: 10 YEARS ≈ $26,500"),
    ("S17", (7, "26,000", 1), "store", "two columns side by side, push-in", "Short column (10 yrs) next to the tall one (30 yrs)"),
    ("S18", (8, "no", 1), "whisper", "medium on the board, push-in", "Stamp on the board: NO GUARANTEES"),
    ("S19", (8, "coffee", 1), "store", "medium on Spender, push-in", "Spender sips, smiling: maybe it's worth it"),
    ("S20", (8, "which", 1), "store", "SAME lens + position as S01 (loop match), push-in", "Back to the start: Spender lifts the cup, the ghost $186,000 column glows behind"),
]
ACCENT = {(1, "186,000"), (2, "1,825"), (4, "54,750"), (5, "made-up"), (6, "time"), (7, "26,000"), (8, "guarantees")}
TAGS = [
    (1, "your", "EXAMPLE: $5/DAY · 7%/YR STEADY · NOT A PREDICTION", "small painted card on the bar from frame 0"),
    (5, "186,000", "≈ $186,600 AFTER 30 YEARS (EXAMPLE)", "on the column"),
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
