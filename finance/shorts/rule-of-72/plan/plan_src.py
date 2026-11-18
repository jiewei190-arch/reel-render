"""Plan source for the finance Short "rule-of-72": shots, accents and tags anchored to WORDS of the voice-over.
Re-run after every VO change; the times move with the words. Writes src/plan.gen.ts and plan/SHOTS.md.

    python plan/plan_src.py vo/timings.json
"""
TITLE = "rule-of-72"
CAST_NOTE = "SAVER (green, glasses) hero; PENNY (copper kid, backpack) helper; SPENDER (red, bag) + LENDER (navy, hat) in the flip. Set: a bright blocky maths workshop (Podium, Jars, NeonSign 'RATE %', a big chalk-green board), no logos."
LOOP_NOTE = "S18 (\"So remember...\") returns to the S01 lens: Saver lifts the glowing 72 block again; the loop cut lands on \"One number\"."
COUNTER = "a big flip-counter `72 ÷ RATE = YEARS` (e.g. `72 ÷ 6 = 12`), its numbers flipping on each rate; red in the debt half."
SHOTS = [
    ("S01", (1, "one", 1), "store", "medium 3/4 on Saver, face ~38% height, push-in", "Conflict in frame 1: Saver hoists a giant glowing 72 block; behind him a green coin Jar (left) and Spender's red debt stack (right) under one 72 sign"),
    ("S02", (1, "when", 1), "store", "close on a Jar of coins, push-in", "A coin Jar on the podium; a second identical jar pops in beside it (pop()), holo tag ×2"),
    ("S03", (1, "seventy-two", 1), "store", "low angle, push-in", "Saver slams the 72 block onto the podium; dust puff, jars bounce"),
    ("S04", (2, "divide", 1), "store", "medium, push-in", "Saver chops the 72 block with a flat hand; it splits cleanly in two"),
    ("S05", (2, "yearly", 1), "store", "tilt up, push-in", "NeonSign RATE % flickers on above the board"),
    ("S06", (3, "six", 1), "store", "medium two-shot Saver + Penny, push-in", "Penny holds up a card 6%; the board writes 72 ÷ 6 = 12"),
    ("S07", (3, "twelve", 1), "store", "close on jars, push-in", "One jar becomes two; tag 12 YRS"),
    ("S08", (4, "eight", 1), "store", "medium on Penny, push-in", "Penny flips the card to 8%; jars double faster; tag 9 YRS"),
    ("S09", (5, "twelve", 1), "store", "medium on Penny, push-in", "Penny flips the card to 12%, grinning"),
    ("S10", (5, "about", 1), "store", "medium wide, push-in", "Jars pop in quicker still; tag 6 YRS"),
    ("S11", (6, "shortcut", 1), "store", "close on Saver, push-in", "Saver taps a paper Tag on the board: ≈ ESTIMATE"),
    ("S12", (6, "real", 1), "store", "medium wide, push-in", "A wobbly line of green blocks rises and dips across the floor; Saver balances on it, arms out"),
    ("S13", (7, "now", 1), "whisper", "medium, slow push", "Lights dim to the whisper mood; Spender steps in, a red card glowing in his hand"),
    ("S14", (8, "card", 1), "whisper", "macro on the card, push-in", "Plain red Card prop reading 24% APR (no brand, no chip art)"),
    ("S15", (8, "double", 1), "whisper", "medium on Lender, push-in", "Lender (navy, hat) stacks red debt blocks beside Spender; the stack pops to twice its height"),
    ("S16", (8, "three", 1), "whisper", "low angle on Spender, push-in", "The red stack towers over Spender; tag 3 YRS; he hugs his bag"),
    ("S17", (9, "same", 1), "store", "symmetrical wide two-shot, push-in", "Split frame: Saver with green jars left, Spender with red blocks right, same 72 sign over both; Spender looks over, sheepish"),
    ("S18", (9, "so", 1), "store", "SAME lens + position as S01 (loop match), push-in", "Saver lifts the glowing 72 block again, green jar and red debt stack behind him (same as S01)"),
]
ACCENT = {(1, "seventy-two"), (3, "twelve"), (4, "nine"), (5, "six"), (6, "promise"), (8, "three"), (9, "wrong")}
TAGS = [
    (1, "one", "72 ÷ RATE ≈ YEARS TO DOUBLE", "painted on the board from frame 0"),
    (8, "card", "24% APR (EXAMPLE)", "on the red card"),
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
