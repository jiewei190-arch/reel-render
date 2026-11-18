"""Plan source for the finance Short "credit-score-weights": shots, accents and tags anchored to WORDS of the voice-over.
Re-run after every VO change; the times move with the words. Writes src/plan.gen.ts and plan/SHOTS.md.

    python plan/plan_src.py vo/timings.json
"""
TITLE = 'credit-score-weights'
CAST_NOTE = 'SAVER (green, glasses) paying on time at a calendar; SPENDER (red, bag) with a nearly maxed card; PENNY beside the score tower. Set: a bright blocky hall with a five-segment SCORE TOWER (35/30/15/10/10), a chart board, a card-limit meter; plain cards, no logos or brand names.'
LOOP_NOTE = 'S17 ("But the biggest slice?") returns to the S01 lens: the 35% base of the score tower glows again beside Saver; the loop lands on "One habit makes up 35 percent."'
COUNTER = 'the tower fills as each weight is said: `ON TIME 35%`, `+ OWED 30%`, `+ HISTORY 15%`, `+ NEW 10%`, `+ MIX 10%` = `100%`; twist `LIMIT USED 90%`.'
SHOTS = [
    ('S01', (1, 'one', 1), 'store', 'medium 3/4 on Saver and the tower, push-in', 'Conflict in frame 1: a tall five-segment score tower; the big 35% base glows gold beside Saver, a ? over it'),
    ('S02', (1, '35', 1), 'store', 'close on the 35% segment, push-in', 'The base segment: 35%'),
    ('S03', (2, 'in', 1), 'store', 'medium on a chart board, push-in', 'Chart board: PUBLISHED SCORE BREAKDOWN'),
    ('S04', (2, 'paying', 1), 'store', 'medium on Saver at a calendar, push-in', 'Saver drops a coin into a BILL slot; the calendar shows ON TIME ✓'),
    ('S05', (2, '35', 1), 'store', 'close on the tower base, push-in', '35% ON TIME segment lights'),
    ('S18', (3, 'paid', 1), 'store', 'medium on Saver at the bills box, push-in', 'A red LATE stamp hits the due-date calendar; tag STAYS UP TO 7 YEARS'),
    ('S06', (4, 'how', 1), 'store', 'medium on the tower, push-in', 'The 30% OWED segment stacks on'),
    ('S07', (4, 'how', 2), 'store', 'medium on the tower, push-in', 'The 15% HISTORY segment stacks on'),
    ('S08', (5, 'new', 1), 'store', 'medium on the tower, push-in', '10% NEW stacks on'),
    ('S09', (5, 'mix', 1), 'store', 'wide on the full tower, push-in', '10% MIX tops it: 100%'),
    ('S10', (6, 'twist', 1), 'whisper', 'medium on Spender with a card, push-in', 'Night mood: Spender holds a plain card'),
    ('S11', (6, 'two', 1), 'whisper', 'close on the 30% segment, push-in', 'The 30% OWED segment pulses red'),
    ('S12', (6, 'limit', 1), 'whisper', 'medium on a limit meter, push-in', 'A card-limit meter fills to 90% USED'),
    ('S13', (6, 'even', 1), 'whisper', 'medium on Spender at the calendar, push-in', 'Spender pays on time ✓'),
    ('S14', (6, 'maxed', 1), 'whisper', 'close on the meter, push-in', 'The meter hits 95%, red'),
    ('S15', (6, 'hurt', 1), 'whisper', 'medium on the tower, push-in', 'A heavy block drops on the 30% segment; it squashes'),
    ('S16', (7, 'weights', 1), 'ending', 'wide on three small towers, push-in', 'Three small towers of different mixes: VARIES BY PERSON'),
    ('S17', (7, 'but', 1), 'store', 'SAME lens + position as S01 (loop match), push-in', 'Back to the start: the 35% base glows beside Saver'),
]
ACCENT = {(3, 'seven'), (6, 'limit'), (5, '10'), (4, '30'), (1, '35')}
TAGS = [
    (2, 'in', 'PUBLISHED WEIGHTS', 'on the board'),
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
