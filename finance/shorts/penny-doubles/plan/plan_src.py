"""Plan source for the finance Short "penny-doubles": shots, accents and tags anchored to WORDS of the voice-over.
Re-run after every VO change; the times move with the words. Writes src/plan.gen.ts and plan/SHOTS.md.

    python plan/plan_src.py vo/timings.json
"""
TITLE = "penny-doubles"
CAST_NOTE = "PENNY (copper kid, rocket backpack), SPENDER (red, shoulder bag), TELLER (violet, apron), SAVER (green, glasses). Set: a bright blocky 'coin counter' hall (Counter + ShelfUnit + Podium + a giant wall calendar), no logos."
LOOP_NOTE = "S21 (\"…every single time,\") re-frames the S01 offer from the same lens and position (Teller slides the single penny forward, counter back at DAY 1 · $0.01); the cut to frame 0 lands on \"This penny beats a million dollars.\""
COUNTER = "a big holo counter over the set, above the caption band: `DAY nn · $x` ticking up with the doubling (DAY 1 · $0.01 → DAY 30 · $5,368,709.12), red while it is behind $1,000,000, green once it passes."
SHOTS = [
    # id, anchor (turn, word, nth), mood, camera, scene
    ("S01", (1, "this", 1), "store", "medium 3/4 on Penny, face ~38% height, slow push-in", "Conflict in frame 1: Teller behind the counter offers a glowing case tagged $1,000,000 and ONE copper penny on a podium; Penny (kid) points at the penny, Spender (bag) eyes the case; counter DAY 1 · $0.01 (red)"),
    ("S02", (1, "million", 1), "store", "medium on Spender, push-in", "Spender grabs the $1,000,000 case and hugs it, smug grin; Penny in soft focus behind"),
    ("S03", (2, "double", 1), "store", "macro on the podium, push-in", "The penny pops and splits into two coins (pop() 0.7 s); holo tag ×2 EVERY DAY; counter DAY 2 · $0.02"),
    ("S04", (2, "30", 1), "store", "low angle up at the wall, push-in", "Giant wall calendar: DAY 1 OF 30 with 30 empty boxes; Penny looks up at it"),
    ("S05", (3, "day", 1), "store", "medium wide, calendar + podium in frame, push-in", "Calendar flips to DAY 10; a tiny stack of coins on Penny's podium; counter DAY 10 · $5.12"),
    ("S06", (3, "twelve", 1), "store", "close on the small stack, Spender laughing behind (rack focus)", "Penny shrugs at the tiny stack; Spender points and laughs, hugging his case"),
    ("S07", (4, "day", 1), "store", "medium, Jar centre frame, push-in", "Calendar flips to DAY 20: coins now fill a glass Jar on the podium; counter DAY 20 · $5,242.88"),
    ("S08", (4, "about", 1), "store", "close on the jar + Penny's face, push-in", "Penny taps the glass, hopeful; the jar is only half full"),
    ("S09", (4, "still", 1), "store", "two-shot, Spender foreground left, Penny right, push-in", "Spender lounges on the big case, fanning plain green bills (no markings); counter still red: STILL LOSING"),
    ("S10", (5, "then", 1), "whisper", "close-up on the jar + Penny's eyes, slow push", "The jar starts to glow from inside; Penny's big eyes reflect it"),
    ("S11", (5, "over", 1), "whisper", "medium, push-in", "Coins burst over the jar rim and pour onto the counter (pop()); the counter digits blur upward"),
    ("S12", (6, "twenty-five", 1), "store", "wide on the ShelfUnit, push-in", "DAY 25: coin stacks fill three shelf boards; counter DAY 25 · $167,772.16"),
    ("S13", (6, "hundred", 1), "store", "close on Spender + his case, push-in", "Spender's grin drops; he peeks over the case at the shelves"),
    ("S14", (7, "day", 1), "store", "wide low angle, push-in", "DAY 28: a coin pile taller than the counter, Penny on top waving; the counter turns GREEN as it passes $1,000,000"),
    ("S15", (7, "point", 1), "store", "medium on Teller, push-in", "Teller runs a paper receipt that keeps unrolling off the counter; counter DAY 28 · $1,342,177.28"),
    ("S16", (8, "day", 1), "ending", "very wide, crane down, push-in", "DAY 30: a golden coin mountain fills the hall; Penny on the summit"),
    ("S17", (8, "five", 1), "ending", "medium on the summit, push-in", "Counter slams to DAY 30 · $5,368,709.12, gold"),
    ("S18", (8, "million", 1), "ending", "close on Spender, push-in", "Spender's jaw drops; the $1,000,000 case slips out of his hands and looks tiny"),
    ("S19", (9, "half", 1), "ending", "medium wide, push-in", "Saver (glasses) slides a glowing line down the middle of the mountain: one half lights up, tag DAY 30 ALONE = ½"),
    ("S20", (9, "very", 1), "ending", "close on the calendar, push-in", "The last calendar page (30) tears off and flutters toward the lens"),
    ("S21", (10, "every", 1), "store", "SAME lens + position as S01 (loop match), push-in", "Back at the counter, the offer again (counter reset to DAY 1 · $0.01): Teller slides ONE penny forward; this time Spender reaches for the penny"),
]
# ONE accent word per sentence or moment, never more (yellow; everything else white).
ACCENT = {(1, "million"), (3, "five"), (4, "losing"), (5, "doubling"), (6, "thousand"), (7, "million"), (8, "million"), (9, "last")}
# Painted tags: only the story's key facts.
TAGS = [
    (1, "this", "THOUGHT EXPERIMENT", "small corner tag on frame 0 (honest framing: nothing real doubles daily)"),
    (8, "thirty", "$5,368,709", "holo tag over the coin mountain"),
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
