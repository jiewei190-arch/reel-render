"""Plan source for the finance Short "surprise-bill": shots, accents and tags anchored to WORDS of the voice-over.
Re-run after every VO change; the times move with the words. Writes src/plan.gen.ts and plan/SHOTS.md.

    python plan/plan_src.py vo/timings.json
"""
TITLE = "surprise-bill"
CAST_NOTE = "SPENDER (red, bag) with the broken car and the card route; SAVER (green, glasses) with the EMERGENCY FUND jar; LENDER (navy, hat) at the card booth. Set: a sunny blocky street (outdoor ground + road), a toll-booth style card counter, a chart board for the Fed survey; no logos."
LOOP_NOTE = "S19 (\"Because otherwise,\") returns to the S01 lens: the car smokes again and the red $1,000 bill pops up over Spender; the loop lands on \"A surprise bill can last two years.\""
COUNTER = "`$1,000 BILL` with `MONTHS nn` and `INTEREST $x` (red on the card route, green and 0 on the emergency-fund route)."
SHOTS = [
    ("S01", (1, "a", 1), "earth", "medium 3/4 on Spender + car, push-in", "Conflict in frame 1: Spender beside his blocky car, smoke pouring from the bonnet, a red $1,000 bill card popping up over him; counter $1,000 BILL"),
    ("S02", (1, "two", 1), "earth", "close on a flip calendar, push-in", "A flip calendar by the kerb riffles to 26 MONTHS"),
    ("S03", (2, "say", 1), "earth", "medium on Spender, push-in", "The car coughs a big smoke puff; Spender jumps (shock)"),
    ("S04", (2, "due", 1), "earth", "close on the bill, push-in", "A repair bill sheet slides into frame: $1,000 DUE NOW"),
    ("S05", (3, "with", 1), "earth", "medium on Saver, push-in", "Saver by his EMERGENCY FUND jar (full of coins) on a little stand"),
    ("S06", (3, "costs", 1), "earth", "close on the jar, push-in", "Saver scoops $1,000 of coins out; the jar drops a level; counter green: PAID $1,000, INTEREST $0"),
    ("S07", (3, "done", 1), "earth", "medium two-shot, push-in", "Saver dusts his hands; his car beside him is fixed, no smoke; joy"),
    ("S08", (4, "card", 1), "earth", "medium on Spender, push-in", "Spender pulls out a red card (plain, no brand) and holds it up"),
    ("S09", (4, "paying", 1), "earth", "medium on Lender at the booth, push-in", "Lender (hat) at a booth; Spender drops a small $50 coin into the slot"),
    ("S10", (5, "twenty-six", 1), "earth", "close on the calendar, push-in", "The flip calendar races month 1 to 26; counter MONTH n ticks"),
    ("S11", (5, "about", 1), "earth", "wide on the booth, push-in", "Behind the booth a red interest pile grows; tag $257 INTEREST"),
    ("S12", (5, "interest", 1), "whisper", "medium on Spender, push-in", "Spender droops, antennae down, hugging the empty card"),
    ("S13", (6, "and", 1), "store", "medium on a chart board, push-in", "A chart board rolls in: FED SURVEY 2025, $400 SURPRISE"),
    ("S14", (6, "only", 1), "store", "close on the bar, push-in", "One bar rises to 63% (green), the rest of the bar stays empty"),
    ("S15", (6, "adults", 1), "store", "wide on a row of ten blocks, push-in", "Ten little blocks in a row: six and a bit glow green (cash or savings), the rest stay grey; label 63%"),
    ("S16", (6, "surprise", 1), "store", "close on a $400 bill card, push-in", "A $400 SURPRISE card pops; Spender peeks at it"),
    ("S17", (6, "savings", 1), "ending", "medium on Saver's jar, push-in", "Saver taps his EMERGENCY FUND jar; it glows"),
    ("S18", (7, "small", 1), "ending", "medium two-shot, push-in", "Saver hands Spender a small jar with a few coins: CUSHION; Spender smiles"),
    ("S19", (7, "because", 1), "earth", "SAME lens + position as S01 (loop match), push-in", "Back to the start: the car smokes again, the $1,000 bill pops over Spender"),
]
ACCENT = {(1, "two"), (3, "done"), (5, "257"), (6, "63"), (7, "cushion")}
TAGS = [
    (1, "a", "EXAMPLE: $1,000 · 22% APR · $50/MO", "small painted card on the kerb from frame 0"),
    (6, "only", "63% (FED SHED 2025)", "on the chart board"),
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
