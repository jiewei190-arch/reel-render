"""Plan source for the finance Short "interest-only": shots, accents and tags anchored to WORDS of the voice-over.
Re-run after every VO change; the times move with the words. Writes src/plan.gen.ts and plan/SHOTS.md.

    python plan/plan_src.py vo/timings.json
"""
TITLE = 'interest-only'
CAST_NOTE = 'SPENDER (red, bag) on the interest-only lane; SAVER (green, glasses) on the full-payment lane; LENDER (navy, hat) at the payment booth. Set: a bright blocky hall, two big OWE blocks, a flip calendar of years, coin piles of what was paid; plain money, no logos.'
LOOP_NOTE = 'S18 ("Interest-only can mean") returns to the S01 lens: Spender beside the untouched OWE $20,000 block after year 5; the loop lands on "five years of payments. Still owe everything."'
COUNTER = '`INTEREST-ONLY $133/MO · PAID $x · OWE $20,000` vs `FULL $406/MO · OWE $y`; end `INTEREST $8,000 vs $4,332` (VO rounding = HUD).'
SHOTS = [
    ('S01', (1, 'five', 1), 'store', 'medium 3/4 on Spender + the debt block, push-in', "Conflict in frame 1: Spender beside a huge red OWE $20,000 block that hasn't shrunk; calendar YEAR 5; a pile of paid coins behind him"),
    ('S02', (1, 'owe', 1), 'store', 'close on the block, push-in', 'The block label: STILL OWE $20,000'),
    ('S03', (2, 'example', 1), 'store', 'medium two-shot at the booth, push-in', 'Lender hands Spender a $20,000 case'),
    ('S04', (2, 'at', 1), 'store', 'close on a rate card, push-in', 'Rate card: 8% (MADE-UP EXAMPLE)'),
    ('S05', (3, 'pay', 1), 'store', 'medium on Spender at the booth, push-in', 'Spender drops a small stack into the booth slot'),
    ('S06', (3, '133', 1), 'store', 'close on the booth display, push-in', 'Booth display: $133/MO INTEREST ONLY'),
    ('S07', (4, 'after', 1), 'store', 'close on the flip calendar, push-in', 'Calendar races YEAR 1 → 5'),
    ('S08', (4, '8,000', 1), 'store', 'medium on the paid pile, push-in', 'Paid pile grows: PAID $8,000'),
    ('S09', (5, 'and', 1), 'store', 'medium on Spender + block, push-in', 'Spender looks up at the unchanged block, shock'),
    ('S10', (5, '20,000', 1), 'store', 'close on the block, push-in', 'OWE $20,000 pulses red'),
    ('S11', (6, 'the', 1), 'ending', 'medium on Saver + his block, push-in', "Saver's lane: his own OWE $20,000 block"),
    ('S12', (6, 'about', 1), 'ending', 'close on the booth display, push-in', 'Booth display: $406/MO FULL PAYMENT'),
    ('S13', (6, 'month', 1), 'ending', 'medium on Saver paying, push-in', 'Saver drops a bigger stack; his block shrinks'),
    ('S14', (6, 'years', 1), 'ending', "medium on Saver's block, push-in", "Calendar YEAR 5; Saver's block shrinks to a sliver"),
    ('S15', (6, 'zero', 1), 'ending', 'medium on Saver, push-in', 'The block is gone: OWE $0; Saver cheers'),
    ('S16', (7, 'twist', 1), 'whisper', 'wide on two piles, push-in', 'Twist: two interest piles side by side: $8,000 (red, and still owing) vs $4,332 (green, owing $0)'),
    ('S19', (7, '4,332', 1), 'whisper', 'close on the green pile, push-in', 'Close on the green pile: $4,332 · OWE $0'),
    ('S17', (8, 'small', 1), 'store', 'medium on Spender, push-in', 'Spender holds up one small coin, unsure'),
    ('S18', (8, 'interest-only', 1), 'store', 'SAME lens + position as S01 (loop match), push-in', 'Back to the start: Spender beside the untouched block'),
]
ACCENT = {(6, 'zero'), (1, 'everything'), (4, '8,000'), (3, '133'), (7, '4,332')}
TAGS = [
    (2, 'example', 'EXAMPLE: $20,000 · 8% · 5 YRS', 'corner'),
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
