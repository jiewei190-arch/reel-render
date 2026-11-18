"""Plan source for the finance Short "rent-thirty-rule": shots, accents and tags anchored to WORDS of the voice-over.
Re-run after every VO change; the times move with the words. Writes src/plan.gen.ts and plan/SHOTS.md.

    python plan/plan_src.py vo/timings.json
"""
TITLE = 'rent-thirty-rule'
CAST_NOTE = 'SAVER (green, glasses) the tenant with an INCOME bar; TELLER as the clerk with the LAW stamp; SPENDER and PENNY as more tenants. Set: a sunny blocky street with a PUBLIC HOUSING block, a flip calendar of years, a big income bar with a cap line; no logos, no real people.'
LOOP_NOTE = 'S18 ("So ask:") returns to the S01 lens: the 30% slice slams onto Saver\'s income bar again; the loop lands on "Who decided rent should be 30 percent?"'
COUNTER = '`RENT CAP 25%` (1969) → `30%` (1981) → `$4,000/MO × 30% = $1,200`; hook `30% = RENT?`.'
SHOTS = [
    ('S01', (1, 'who', 1), 'earth', 'medium 3/4 on Saver and his income bar, push-in', "Conflict in frame 1: a big red 30% slice slams onto Saver's income bar; a ? sign pops over him"),
    ('S02', (1, 'rent', 1), 'earth', 'close on the slice, push-in', 'The red slice: RENT 30%? WHO SAID?'),
    ('S03', (2, 'it', 1), 'earth', 'close on the flip calendar, push-in', 'Flip calendar: YEAR 1969'),
    ('S04', (2, 'law', 1), 'earth', 'medium on Teller, push-in', 'Teller stamps LAW on a sheet'),
    ('S05', (2, 'public', 1), 'earth', 'wide on the housing block, push-in', 'A blocky apartment block: PUBLIC HOUSING'),
    ('S06', (3, 'capped', 1), 'earth', 'medium on the income bar, push-in', 'The income bar with a cap line at 25%'),
    ('S07', (3, "tenant's", 1), 'earth', 'medium on Saver at the bar, push-in', 'Saver (tenant) points at the 25% MAX line'),
    ('S08', (4, 'limit', 1), 'earth', 'close on the cap line, push-in', 'The cap line glows: MAX, a little barrier'),
    ('S09', (4, 'not', 1), 'earth', 'close on a target sign, push-in', 'A SPEND THIS target sign gets struck through'),
    ('S10', (5, 'in', 1), 'earth', 'close on the calendar, push-in', 'Calendar flips 1969 → 1981'),
    ('S11', (5, 'raised', 1), 'earth', 'medium on the bar, push-in', 'The cap line slides up 25% → 30%'),
    ('S15', (6, 'on', 1), 'earth', 'medium on a $4,000 stack, push-in', 'Saver beside a $4,000 / MONTH coin stack'),
    ('S16', (6, '1,200', 1), 'earth', 'close on the split, push-in', 'The top 30% of the stack lifts out: $1,200 RENT'),
    ('S12', (7, 'twist', 1), 'whisper', 'wide on the street, push-in', 'Dusk: the 30% line leaps off the public housing block'),
    ('S13', (7, "everyone's", 1), 'whisper', 'wide on a row of tenants, push-in', 'Saver, Spender and Penny in a row, each with a 30% tag'),
    ('S14', (7, 'thumb', 1), 'whisper', 'close on a sign, push-in', 'Sign: RULE OF THUMB'),
    ('S17', (8, 'rough', 1), 'ending', 'medium on Saver, push-in', 'Saver shrugs with a ROUGH GUIDE sign'),
    ('S18', (8, 'so', 1), 'earth', 'SAME lens + position as S01 (loop match), push-in', 'Back to the start: the red 30% slice slams onto the income bar'),
]
ACCENT = {(7, 'thumb'), (2, '1969'), (6, '1,200'), (5, '1981'), (1, '30'), (3, '25')}
TAGS = [
    (2, 'it', 'NLIHC · HARVARD JCHS', 'corner'),
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
