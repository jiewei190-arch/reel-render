"""Plan source for the finance Short "employer-match": shots, accents and tags anchored to WORDS of the voice-over.
Re-run after every VO change; the times move with the words. Writes src/plan.gen.ts and plan/SHOTS.md.

    python plan/plan_src.py vo/timings.json
"""
TITLE = "employer-match"
CAST_NOTE = "SAVER (green, glasses) saves; TELLER (violet, apron) plays the employer at the payroll counter; SPENDER (red, bag) skips it. Set: the bright hall as a payroll office (counter, a RETIREMENT PLAN jar on a pedestal, a board, a big clock); no logos, no plan provider names."
LOOP_NOTE = "S20 (\"And yes, it's true:\") returns to the S01 lens: Teller holds out the match bundle again as Saver drops his; the loop lands on \"Some jobs pay you to save.\""
COUNTER = "`YOU $3,000 + MATCH $1,500`, filling as the example plays; small `2026 LIMIT $24,500` badge."
SHOTS = [
    ("S01", (1, "some", 1), "store", "medium wide two-shot, push-in", "Conflict in frame 1: at the payroll counter Saver drops a coin bundle into a RETIREMENT PLAN jar while Teller (employer) adds a second bundle; Spender walks past ignoring it; counter YOU $0 + MATCH $0"),
    ("S02", (1, "save", 1), "store", "close on the jar, push-in", "Both bundles land in the jar; it glows; label RETIREMENT PLAN"),
    ("S03", (2, "employer", 1), "store", "medium on Teller, push-in", "Teller (employer) points at a sign on the counter: EMPLOYER MATCH"),
    ("S04", (3, "say", 1), "store", "close on a payslip, push-in", "Saver holds up a payslip: $50,000 / YEAR (EXAMPLE)"),
    ("S05", (3, "and", 1), "store", "medium on the board, push-in", "A board: MATCH 50% UP TO 6% OF PAY"),
    ("S06", (3, "half", 1), "store", "close on the counter, push-in", "One coin bundle, then a half-height bundle pops beside it (½)"),
    ("S07", (3, "up", 1), "store", "medium on Teller, push-in", "Teller raises a 6% card like a cap"),
    ("S08", (4, "save", 1), "store", "medium on Saver, push-in", "Saver drops a $3,000 stack into the jar"),
    ("S09", (4, "they", 1), "store", "close on the jar, push-in", "Teller adds a $1,500 stack; the jar pops; counter YOU $3,000 + MATCH $1,500"),
    ("S10", (5, "that's", 1), "store", "macro on two coins, push-in", "A big coin labelled $1 and a half coin labelled 50¢ side by side"),
    ("S11", (5, "before", 1), "store", "medium on the jar, push-in", "The jar hums green (no growth shown, just the match)"),
    ("S12", (6, "skip", 1), "whisper", "medium on Spender, push-in", "Spender strolls past the counter, hands in the air: skip"),
    ("S13", (6, "that", 1), "whisper", "close on the counter, push-in", "Teller's $1,500 stack slides back off the counter, away from Spender's empty jar"),
    ("S14", (6, "isn't", 1), "whisper", "medium on Spender, push-in", "Spender shrugs at his empty jar"),
    ("S15", (7, "plans", 1), "store", "wide on three jars, push-in", "Three jars with different labels: 50% UP TO 6% / 100% UP TO 3% / NO MATCH; tag PLANS DIFFER"),
    ("S16", (7, "wait", 1), "store", "medium on the big clock, push-in", "A big clock over the jar: VESTING: SOME PLANS MAKE YOU WAIT"),
    ("S17", (7, "i.r.s", 1), "store", "medium on Teller with a sign, push-in", "Teller holds a sign: I.R.S. LIMIT"),
    ("S18", (7, "24,500", 1), "store", "close on the sign, push-in", "The sign flips to $24,500 YOUR PART · 2026"),
    ("S19", (7, "2026", 1), "store", "close on a flip calendar, push-in", "A flip calendar shows 2026"),
    ("S20", (8, "yes", 1), "store", "SAME lens + position as S01 (loop match), push-in", "Back to the start: Teller holds out the match bundle as Saver drops his"),
]
ACCENT = {(1, "save"), (3, "half"), (4, "1,500"), (6, "isn't"), (7, "24,500")}
TAGS = [
    (1, "some", "EXAMPLE: $50,000 · 50% MATCH UP TO 6%", "small painted card on the counter from frame 0"),
    (7, "24,500", "$24,500 · 2026 EMPLOYEE LIMIT (IRS)", "on Teller's sign"),
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
