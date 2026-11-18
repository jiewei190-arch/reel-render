"""Plan source for the finance Short "minimum-payment-trap": shots, accents and tags anchored to WORDS of the voice-over.
Re-run after every VO change; the times move with the words. Writes src/plan.gen.ts and plan/SHOTS.md.

    python plan/plan_src.py vo/timings.json
"""
TITLE = "minimum-payment-trap"
CAST_NOTE = "SPENDER (red, bag) hero; LENDER (navy, hat) collects; TELLER (violet, apron) shows the statement; SAVER (green, glasses) in the flat-payment contrast. Set: a long blocky suburb road with a 'PAID OFF' gate far away + a small statement counter, no logos."
LOOP_NOTE = "S19 (\"Because otherwise...\") cuts back to the S01 lens: Spender picks up the red $5,000 block again at the start of the long road; the loop lands on \"A five thousand dollar...\"."
COUNTER = "two counters on a toll-booth display, above the caption band: `BALANCE $5,000 ↓` and `INTEREST PAID $0 ↑` (to $8,099 on the minimum route), plus a `YEAR nn` clock; the flat-$200 lane gets its own green counter."
SHOTS = [
    ("S01", (1, "a", 1), "earth", "medium 3/4 on Spender, face ~38% height, push-in", "Spender lifts a heavy red block painted $5,000 at the start of a very long road; far away a tiny gate PAID OFF"),
    ("S02", (1, "nineteen", 1), "earth", "over-shoulder down the road, push-in", "The road stretches to the horizon, the PAID OFF gate a speck; a roadside Sign reads 19 YEARS →"),
    ("S03", (2, "say", 1), "store", "medium on Lender at a booth, push-in", "Lender (hat) at a toll booth stamps a red tag onto the $5,000 block"),
    ("S04", (2, "percent", 1), "store", "close on the tag, push-in", "Tag 22% APR glows; small text EXAMPLE"),
    ("S05", (2, "u.s", 1), "store", "medium wide, push-in", "A chart board behind Lender: a flat red line hovering near 22%, tag U.S. AVERAGE ≈ 22% (FED G.19)"),
    ("S06", (3, "you", 1), "earth", "medium on Spender, push-in", "Spender drops a small coin into Lender's slot, smiling: MINIMUM"),
    ("S07", (3, "interest", 1), "earth", "close on the slot, push-in", "The coin splits: most of it glows red INTEREST and vanishes into the booth; a sliver chips the block"),
    ("S08", (3, "one", 1), "earth", "macro on the block, push-in", "A thin 1% slice falls off the $5,000 block"),
    ("S09", (4, "as", 1), "earth", "medium tracking, push-in", "Spender walks; the block shrinks a hair; his coin shrinks too"),
    ("S10", (4, "payment", 1), "earth", "close on his hand, push-in", "The coin in his hand gets smaller with each step"),
    ("S11", (4, "crawls", 1), "whisper", "low wide, push-in", "Spender crawls on hands and knees along the endless road, block on his back; a snail passes him"),
    ("S12", (5, "nineteen", 1), "whisper", "medium, push-in", "Spender's antennae droop grey; calendar pages blow past"),
    ("S13", (5, "eight", 1), "whisper", "wide on the booth, push-in", "Behind Lender, a red pile of coins grows taller than the booth; tag $8,099 INTEREST"),
    ("S14", (6, "pay", 1), "ending", "medium on Saver, push-in", "Contrast lane: Saver drops a bigger coin $200 into the slot each month"),
    ("S15", (6, "month", 1), "ending", "tracking, push-in", "Saver's block shrinks fast with each step"),
    ("S16", (6, "three", 1), "ending", "wide, push-in", "Saver walks through the PAID OFF gate under three calendar pages; tag ~3 YEARS"),
    ("S17", (7, "statement", 1), "store", "medium on Teller at the counter, push-in", "Teller (apron) slides a paper statement across the counter to Spender"),
    ("S18", (7, "warning", 1), "store", "macro on the statement, push-in", "A boxed panel on the statement lights up: MINIMUM PAYMENT WARNING (plain text, no issuer name)"),
    ("S19", (8, "because", 1), "earth", "SAME lens + position as S01 (loop match), push-in", "Spender, ignoring the paper, lifts the red $5,000 block again at the start of the road"),
]
ACCENT = {(1, "nineteen"), (2, "twenty-two"), (3, "minimum"), (4, "crawls"), (5, "eight"), (6, "three"), (7, "warning")}
TAGS = [
    (1, "a", "EXAMPLE: $5,000 · 22% APR · MIN = INTEREST + 1%", "small painted card at the road start from frame 0"),
    (5, "eight", "$8,099 INTEREST", "holo tag over Lender's pile"),
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
