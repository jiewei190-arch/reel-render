"""Plan source (FORMAT v1, style S3 POV-YOU) "employer-match": shots anchored to WORDS of the voice-over.
    python plan/plan_src.py vo/timings.json      -> src/plan.gen.ts + plan/SHOTS.md
"""
TITLE = 'employer-match'
CAST_NOTE = 'THE BOSS (TELLER, purple) across your desk, talking to the lens: you are the camera. SPENDER (red, bag) at the next desk. Set: a bright blocky office, two desks. No logos, no brands.'
LOOP_NOTE = 'S16 on "keep it": the boss leans back into the S01 close-up with the card; loops to frame 0 and "POV: your boss just offered you...".'
COUNTER = 'none (v1, style S3 POV-YOU). Hook text from frame 0: POV: YOUR BOSS OFFERS YOU $1,500. In the set: +$1,500/YR card, $50,000/YR pay label, MATCH 50% UP TO 6% board, YOU $3,000 jar, two STATEMENT envelopes, $3,000 + $1,500 vs $0.'
SHOTS = [
    ('S01', (1, 'your', 1), 'earth', 'CLOSE on the boss, lens = you', "FRAME 0 MID-ACTION: the boss leans in, grinning, pushing a +$1,500/YR card at the lens; winks by 1 s; hook text POV: YOUR BOSS OFFERS YOU $1,500"),
    ('S02', (1, '1,500', 1), 'earth', 'close on the card', 'The +$1,500/YR card fills the lens'),
    ('S17', (1, 'free', 1), 'earth', 'close on the boss', "The boss's grin: FREE MONEY"),
    ('S03', (2, "it's", 1), 'earth', 'down on your desk', 'MATCH: two coin stacks, YOU and BOSS'),
    ('S18', (2, 'save', 1), 'earth', 'close on your stack', 'Your coins stack up: YOU'),
    ('S04', (2, 'they', 1), 'earth', 'close on the stacks', 'The boss drops coins on your stack'),
    ('S05', (3, 'say', 1), 'earth', 'on the pay label', 'EXAMPLE: $50,000/YR pay label'),
    ('S06', (3, 'they', 1), 'earth', 'on the board', 'MATCH 50% UP TO 6% board, the boss points'),
    ('S07', (4, 'you', 1), 'earth', 'close on your jar', 'YOU $3,000 jar fills'),
    ('S19', (4, '3,000', 1), 'earth', 'on the jar label', 'YOU: $3,000 label pops'),
    ('S08', (4, 'spender', 1), 'earth', 'whip right to the next desk', 'Spender tosses the form in the bin, smug'),
    ('S20', (4, 'skips', 1), 'earth', 'close on Spender', 'Spender: nope, smug'),
    ('S09', (5, 'then', 1), 'whisper', 'down on both desks', 'OPEN LOOP: two sealed STATEMENT envelopes thud down, trembling'),
    ('S10', (5, 'statements', 1), 'whisper', 'close on the envelopes', 'OPEN LOOP: the envelopes shake'),
    ('S11', (6, 'yours', 1), 'earth', 'close on your envelope', 'TWIST: it bursts: $3,000'),
    ('S12', (6, 'plus', 1), 'earth', 'slam on the +$1,500', '+$1,500 FROM YOUR BOSS slams beside it'),
    ('S21', (6, 'from', 1), 'earth', 'on both labels', '$3,000 + $1,500 FROM BOSS side by side'),
    ('S13', (6, "spender's", 1), 'earth', 'whip to Spender', "Spender's envelope pops: $0. Shock"),
    ('S14', (7, 'plans', 1), 'earth', 'medium on the boss', 'PLANS DIFFER label, the boss wags a finger'),
    ('S15', (7, 'some', 1), 'earth', 'close on the label', 'SOME MAKE YOU WAIT TO KEEP IT (VESTING)'),
    ('S16', (7, 'keep', 1), 'earth', 'SAME lens as S01 (loop match)', 'LOOP: the boss leans in with the card again -> frame 0'),
]
ACCENT = {(1, '1,500'), (2, 'match'), (3, 'half'), (4, 'skips'), (5, 'statements'), (6, '1,500'), (6, 'zero')}
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
