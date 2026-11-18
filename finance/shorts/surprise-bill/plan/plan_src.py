"""Plan source (FORMAT v1 story Short) "surprise-bill": shots anchored to WORDS of the voice-over.
    python plan/plan_src.py vo/timings.json      -> src/plan.gen.ts + plan/SHOTS.md
"""
TITLE = 'surprise-bill'
CAST_NOTE = 'SPENDER (red, bag) and his smoking car; SAVER (green, glasses) with an EMERGENCY FUND jar; a card booth with LENDER (navy, hat). Set: a sunny blocky roadside garage. No logos, no brands.'
LOOP_NOTE = 'S18 on "Could you?": the car smokes and the bill flies at Spender again, the S01 lens; loops to frame 0 and "Spender\'s car just broke...".'
COUNTER = 'none (v1). Hook text from frame 0: A $1,000 BILL FOR 2 YEARS. Numbers in the set: $1,000 DUE NOW bill, 22% card, $50/MO, month calendar 6/12/26, $257 INTEREST, 63% chart.'
SHOTS = [
    ('S01', (1, "spender's", 1), 'earth', 'low 3/4 on the car, mid-explosion', "FRAME 0 MID-ACTION: the car bonnet BANGS open in smoke, a $1,000 bill flies at Spender's face-side (stops outside his head box), he flinches; hook text A $1,000 BILL FOR 2 YEARS"),
    ('S02', (1, 'bill', 1), 'earth', 'close on the bill', 'The bill sticks to the car door: $1,000 DUE NOW'),
    ('S03', (1, 'two', 1), 'earth', 'slam on Spender', 'Shock: two years?!'),
    ('S04', (2, 'one', 1), 'earth', 'medium on Spender, empty wallet', 'He turns out an empty bag: NO SAVINGS (a moth flies out)'),
    ('S05', (3, 'so', 1), 'earth', 'medium at the card booth', 'The card booth: Lender swipes; 22% sign flips up'),
    ('S06', (3, 'fifty', 1), 'earth', 'close on the slot', 'Spender drops a $50 coin in the slot'),
    ('S07', (4, 'month', 1), 'earth', 'close on the calendar', 'Calendar flips MONTH 6'),
    ('S08', (4, 'twelve', 1), 'earth', 'wide, rain cloud', 'MONTH 12: a little rain cloud over Spender, still paying'),
    ('S09', (4, 'and', 1), 'whisper', 'slow push on a covered envelope', 'OPEN LOOP: a sealed red envelope FINAL TOTAL trembles on the booth counter'),
    ('S10', (5, 'twenty-six', 1), 'whisper', 'close on the calendar racing', 'Calendar races to MONTH 26'),
    ('S11', (5, 'plus', 1), 'whisper', 'envelope bursts open', 'TWIST: the envelope pops open: +$257 INTEREST (slam)'),
    ('S12', (5, 'interest', 1), 'whisper', 'slam on Spender', 'Despair: Spender sinks'),
    ('S13', (6, 'saver', 1), 'ending', 'medium on Saver at his car', 'Saver, same smoking car, same $1,000 bill'),
    ('S14', (6, 'emergency', 1), 'ending', 'close on the EMERGENCY FUND jar', 'He scoops coins from his EMERGENCY FUND jar'),
    ('S15', (6, 'done', 1), 'ending', 'medium on Saver', 'PAID stamp; his car is fixed, he dusts his hands'),
    ('S16', (7, 'in', 1), 'earth', 'medium on a chart board', 'Chart board: FED SURVEY: 63% COULD PAY $400 IN CASH; bar rises'),
    ('S17', (7, 'could', 2), 'earth', 'slam toward the lens', 'Saver points at the lens: could you?'),
    ('S18', (7, 'you', 1), 'earth', 'SAME lens as S01 (loop match)', "LOOP: Spender's car smokes, the bonnet is about to bang -> frame 0"),
]
ACCENT = {(3, 'twenty-two'), (6, 'done'), (7, '63'), (5, '257'), (2, 'thousand'), (1, 'two'), (4, 'worst')}
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
