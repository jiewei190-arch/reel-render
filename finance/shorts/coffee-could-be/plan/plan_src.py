"""Plan source (FORMAT v1, style S2 RICH-VS-POOR, split screen) "coffee-could-be": shots anchored to WORDS of the VO.
    python plan/plan_src.py vo/timings.json      -> src/plan.gen.ts + plan/SHOTS.md
Each shot is a PAIR: the TOP half (Spender's red cafe) and the BOTTOM half (Saver's green vault), the same moment.
"""
TITLE = 'coffee-could-be'
CAST_NOTE = 'SPLIT: TOP = SPENDER (red, bag) at a blocky coffee counter, a tower of cups; BOTTOM = SAVER (green, glasses) with a coin jar, a coin pile and a scoreboard. Two counters race at the seam: SPENT vs SAVER. No logos, no brands.'
LOOP_NOTE = 'S18 on "doing" (So what\'s your five dollars doing?": both halves back on the S01 close-ups; loops to frame 0 and "Same five dollars a day."'
COUNTER = 'two racing counters at the seam: SPENDER SPENT ($1,825 a year) vs SAVER ($1,825/yr invested at a made-up 7 %: $1,885 / $26,323 / $185,537). Hook text from frame 0: $5 A DAY: COFFEE OR $186,000?'
SHOTS = [
    ('S01', (1, 'same', 1), 'earth', 'SPLIT close-ups', "FRAME 0 MID-ACTION: TOP Spender mid-sip, cup at his face, joy; BOTTOM Saver mid-drop of a $5 coin into his jar; hook text $5 A DAY: COFFEE OR $186,000?"),
    ('S02', (1, 'spender', 1), 'earth', 'split mediums', 'TOP Spender grabs a cup from the machine; BOTTOM Saver drops $5 in the jar'),
    ('S19', (1, 'saver', 1), 'earth', 'BOTTOM close on the jar', 'BOTTOM the $5 coin clinks into the jar; TOP Spender sips'),
    ('S03', (2, 'saver', 1), 'earth', 'split', 'BOTTOM the jar glows: 7% A YEAR (EXAMPLE); TOP Spender sips, happy'),
    ('S20', (2, 'seven', 1), 'earth', 'BOTTOM close on the 7% tag', 'BOTTOM the 7% A YEAR (EXAMPLE) tag pops on the jar; TOP Spender orders another'),
    ('S04', (3, 'one', 1), 'earth', 'split wides', 'YEAR 1: TOP a tower of cups (365 CUPS); BOTTOM board $1,825'),
    ('S21', (3, '365', 1), 'earth', 'TOP close on the cup tower', 'TOP 365 CUPS tower wobbles; BOTTOM the board ticks up'),
    ('S05', (3, 'saver', 1), 'earth', 'split, close on the boards', 'TOP 365 CUPS label; BOTTOM SAVED $1,825'),
    ('S22', (3, '1,825', 1), 'earth', 'BOTTOM slam on $1,825', 'BOTTOM SAVED $1,825 slams; TOP Spender sips'),
    ('S06', (4, 'but', 1), 'whisper', 'split, slow push', 'OPEN LOOP: BOTTOM a covered YEAR 30 board trembles under a cloth; TOP Spender peers at it'),
    ('S15', (4, 'see', 1), 'whisper', 'BOTTOM close on the cloth', 'OPEN LOOP: the cloth over YEAR 30 bulges, light leaks; TOP Spender leans in'),
    ('S07', (5, 'ten', 1), 'earth', 'split', 'YEAR 10: BOTTOM board $26,000, the pile grows; TOP more cups'),
    ('S16', (5, 'saver', 1), 'earth', 'BOTTOM close on the board', 'BOTTOM $26,000 on the board; TOP Spender squints'),
    ('S08', (5, 'spender', 1), 'earth', 'split, TOP on Spender', 'TOP Spender shrugs, smug; BOTTOM Saver calm'),
    ('S14', (5, "that's", 1), 'earth', 'TOP close on Spender', "TOP THAT'S IT? Spender laughs; BOTTOM the cloth twitches"),
    ('S09', (6, 'thirty', 1), 'earth', 'split, BOTTOM wide', 'TWIST: the cloth flies off: YEAR 30; the pile erupts; TOP Spender shock'),
    ('S10', (6, '186,000', 1), 'earth', 'slam on the board', 'BOTTOM $186,000 slams; TOP Spender drops his cup'),
    ('S11', (7, 'he', 1), 'ending', 'split', 'BOTTOM PUT IN $54,750 beside $186,000; TOP Spender: SPENT $54,750'),
    ('S17', (7, '54,750', 1), 'ending', 'BOTTOM close on the labels', 'BOTTOM PUT IN $54,750 vs WORTH $186,000; TOP SPENT $54,750'),
    ('S12', (7, 'time', 1), 'ending', 'split', 'BOTTOM a clock spins: TIME DID THE REST; TOP Spender sad among cups'),
    ('S13', (7, 'so', 1), 'earth', 'split, both to the lens', "BOTTOM Saver points at the lens (you); TOP Spender holds up his cup"),
    ('S18', (7, 'doing', 1), 'earth', 'SAME lenses as S01 (loop match)', 'LOOP: TOP Spender lifts a fresh cup, BOTTOM Saver lifts a coin -> frame 0'),
]
ACCENT = {(1, 'five'), (2, 'seven'), (3, '1,825'), (4, 'thirty'), (5, '26,000'), (6, '186,000'), (7, 'time')}
TAGS = []

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
        if d < 0.7 or d > 1.7:
            warns.append(f"WARN {a['id']} is {d:.2f} s (v1 aim 0.8-1.5 s)")
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
        f"export const COUNTER = {json.dumps(COUNTER)} as const;\n"
        f"export const WORDS = {json.dumps([{'w': w['w'], 'turn': w['turn'], 't': round(w['t'], 3), 'end': round(w['end'], 3)} for w in words])} as const;\n", encoding="utf8")
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
