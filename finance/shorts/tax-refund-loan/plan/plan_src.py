"""Plan source for the finance Short "tax-refund-loan": shots, accents and tags anchored to WORDS of the voice-over.
Re-run after every VO change; the times move with the words. Writes src/plan.gen.ts and plan/SHOTS.md.

    python plan/plan_src.py vo/timings.json
"""
TITLE = 'tax-refund-loan'
CAST_NOTE = 'SAVER (green, glasses) the earner with a payslip, a WITHHELD jar and the refund case; TELLER behind a tax-office counter; SPENDER for the two-shot. Set: a bright blocky hall (Hall) with a counter, a flip calendar, a chart board; plain forms, no logos.'
LOOP_NOTE = 'S19 ("But every spring,") returns to the S01 lens: Teller slides the REFUND $3,366 case to Saver again; the loop lands on "your tax refund is a free loan."'
COUNTER = '`AVG REFUND $3,366` → `÷ 12 ≈ $280/MO` → `INTEREST $0` (VO: "3,366", "About 280").'
SHOTS = [
    ('S01', (1, 'your', 1), 'store', 'medium 3/4 on Saver at the counter, push-in', 'Conflict in frame 1: Teller slides a REFUND $3,366 case to a delighted Saver; a red tag over it: LOAN? INTEREST $0'),
    ('S02', (1, 'free', 1), 'store', 'close on the case, push-in', 'The case with a red INTEREST $0 stamp'),
    ('S03', (2, 'the', 1), 'store', 'medium on a chart board, push-in', 'Chart board: IRS 2026 SEASON (TO OCT 16): AVERAGE REFUND'),
    ('S04', (2, 'average', 1), 'store', 'low medium on a rising block, push-in', 'A green block rises: $3,366'),
    ('S05', (3, 'that', 1), 'store', 'medium on Saver with a payslip, push-in', 'Saver holds a payslip sheet: PAY / WITHHELD'),
    ('S06', (3, 'paychecks', 1), 'store', 'close on the jar, push-in', 'Coins slide off the payslip into a jar labelled WITHHELD behind the counter'),
    ('S07', (3, 'all', 1), 'store', 'close on the flip calendar, push-in', 'Flip calendar races the months JAN → DEC'),
    ('S08', (4, 'about', 1), 'store', 'wide on twelve coin stacks, push-in', 'Twelve coin stacks, one per month, each $280'),
    ('S09', (4, 'held', 1), 'store', 'medium on Teller with the jar, push-in', 'Teller pats the WITHHELD jar (locked)'),
    ('S10', (4, 'zero', 1), 'store', 'close on a 0% label, push-in', 'Big 0% INTEREST label pops'),
    ('S14', (5, 'your', 1), 'store', 'medium on Saver with a form, push-in', 'Saver holds a FORM W-4 sheet'),
    ('S15', (5, 'withholding', 1), 'store', 'close on the form, push-in', 'The W-4 sheet: WITHHOLDING line glows'),
    ('S16', (5, 'free', 1), 'store', 'medium on a board, push-in', 'Board: IRS WITHHOLDING ESTIMATOR (FREE)'),
    ('S17', (5, 'check', 1), 'store', 'medium on Saver, push-in', 'Saver stamps CHECK on the form; happy'),
    ('S11', (6, 'twist', 1), 'whisper', 'medium on Saver with the case, push-in', 'Night mood: Saver holds the case; a BONUS sign gets struck through'),
    ('S12', (6, 'own', 1), 'whisper', 'close on the open case, push-in', 'The case opens: green coins with YOUR PAY tags'),
    ('S13', (6, 'late', 1), 'whisper', 'medium on a big clock, push-in', 'A big clock spins; SENT BACK LATE'),
    ('S18', (7, 'a', 1), 'ending', 'medium two-shot, push-in', 'Saver and Spender side by side, Saver shrugs, calm: A FINE CHOICE TOO'),
    ('S19', (7, 'but', 1), 'store', 'SAME lens + position as S01 (loop match), push-in', 'Back to the start: the REFUND case slides to Saver again'),
]
ACCENT = {(7, 'fine'), (2, '3,366'), (1, 'free'), (6, 'bonus'), (4, 'zero')}
TAGS = [
    (2, 'the', 'IRS 2026 SEASON', 'on the board'),
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
