"""Plan source for the finance Short "overdraft-fee": shots, accents and tags anchored to WORDS of the voice-over.
Re-run after every VO change; the times move with the words. Writes src/plan.gen.ts and plan/SHOTS.md.

    python plan/plan_src.py vo/timings.json
"""
TITLE = 'overdraft-fee'
CAST_NOTE = 'SPENDER (red, bag) at a card terminal with a $24 sandwich; TELLER behind the bank counter with the fee stamp; LENDER (navy, hat) for the loan view; SAVER at the opt-in switch. Set: a bright blocky bank hall (Hall), a counter, a chart board, a flip calendar; plain cards, no logos.'
LOOP_NOTE = 'S19 ("You can still") returns to the S01 lens: Spender swipes again at the terminal, the $24 sandwich tag and the red $58 receipt pop; the loop lands on "Swipe 24 dollars, pay 58."'
COUNTER = '`$24 SWIPE` → `+ $34 FEE` → `= $58`; on the loan view `BORROW $24 · 3 DAYS · PAY $34`, then `APR ≈17,000%` (VO: "about 17,000").'
SHOTS = [
    ('S01', (1, 'swipe', 1), 'store', 'medium 3/4 on Spender at the terminal, push-in', 'Conflict in frame 1: Spender swipes a plain card at a terminal holding a $24 sandwich; a red receipt pops: $24 + $34 FEE = $58'),
    ('S02', (1, 'pay', 1), 'store', 'close on the receipt, push-in', 'The receipt label slams: $58 (the $34 FEE line in red)'),
    ('S03', (2, 'in', 1), 'store', 'medium on a chart board, push-in', 'A chart board: CFPB STUDY (2014 DATA): DEBIT OVERDRAFTS'),
    ('S04', (2, 'typical', 1), 'store', 'medium on Spender, push-in', 'Spender at the terminal; the terminal screen shows BALANCE -$24 in red'),
    ('S05', (2, 'just', 1), 'store', 'close on the sandwich tag, push-in', 'The $24 sandwich with its price tag, a big MEDIAN $24 label'),
    ('S06', (3, 'the', 1), 'store', 'medium on Teller at the counter, push-in', 'Teller behind the bank counter lifts a big red stamp'),
    ('S07', (3, '34', 1), 'store', 'close on the sheet, push-in', 'The stamp slams FEE $34 on a statement sheet'),
    ('S08', (4, 'and', 1), 'store', 'medium on Spender at the counter, push-in', 'Spender pays back: drops a coin stack on the counter'),
    ('S09', (4, 'half', 1), 'store', 'wide on ten blocks, push-in', 'Ten little blocks: more than half light up green (paid back within 3 days)'),
    ('S10', (4, 'three', 1), 'store', 'close on the flip calendar, push-in', 'Flip calendar DAY 1 → 3'),
    ('S11', (5, 'so', 1), 'whisper', 'medium on Lender, push-in', 'Night mood: Lender (hat) steps in with a LOAN sign'),
    ('S12', (5, 'borrow', 1), 'whisper', 'medium two-shot, push-in', 'Lender hands Spender a small $24 coin stack'),
    ('S13', (5, 'three', 1), 'whisper', 'close on the calendar, push-in', 'The calendar: 3 DAYS'),
    ('S14', (5, 'pay', 1), 'whisper', 'medium two-shot, push-in', 'Spender hands back a bigger $34 stack; Lender grins'),
    ('S15', (6, 'twist', 1), 'whisper', 'low wide on a rising tower, push-in', 'Twist: a red APR tower shoots up past the ceiling'),
    ('S16', (6, '17,000', 1), 'whisper', 'medium on Spender under the tower, push-in', 'Spender shocked under the big ≈17,000% APR label'),
    ('S17', (7, 'by', 1), 'ending', 'medium on Saver at a switch, push-in', 'Saver beside a big switch board: DEBIT OVERDRAFT: OPT-IN'),
    ('S18', (7, 'choice', 1), 'ending', 'close on the switch, push-in', 'The switch flips between ON and OFF; label OPT-IN BY LAW'),
    ('S19', (7, 'you', 1), 'store', 'SAME lens + position as S01 (loop match), push-in', 'Back to the start: Spender swipes again, the $58 receipt pops'),
]
ACCENT = {(6, '17,000'), (1, '58'), (7, 'choice'), (2, '24'), (3, '34')}
TAGS = [
    (1, 'swipe', 'CFPB 2014 DATA', 'corner'),
    (6, 'twist', "CFPB'S OWN COMPARISON", 'on the loan view'),
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
