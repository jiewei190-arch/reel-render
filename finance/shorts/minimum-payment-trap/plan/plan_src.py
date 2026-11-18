"""Plan source (FORMAT v1 story Short) "minimum-payment-trap": shots anchored to WORDS of the voice-over.
    python plan/plan_src.py vo/timings.json      -> src/plan.gen.ts + plan/SHOTS.md
"""
TITLE = "minimum-payment-trap"
CAST_NOTE = "SPENDER (red, bag) buys a TV on a card and pays the minimum; SAVER (green, glasses) pays $200 a month. Set: a bright blocky ELECTRONICS store (counter, card reader, PAY BILL box, tall INTEREST jar, giant OWE block, wall calendar). No logos, no brands."
LOOP_NOTE = "S22 on \"you end up like Spender\": a new TV drops onto the counter with the S01 lens; the loop lands on \"Spender just bought a TV.\" at frame 0."
COUNTER = "none (FORMAT v1: no HUD). Hook text from frame 0: 19 YEARS TO PAY OFF A TV. Numbers live in the set: $5,000 tag, 22% stamp, MINIMUM DUE $142, OWE block, +$8,100 EXTRA, $200/MO, UNDER 3 YEARS."
SHOTS = [
    ('S01', (1, 'spender', 1), 'store', 'low 3/4 on the counter, TV mid-fall, slam on the landing', 'FRAME 0 MID-ACTION: a big TV drops onto the store counter (bounce, dust), Spender (red, bag) cheers with both arms up; hook text 19 YEARS TO PAY OFF A TV'),
    ('S02', (1, 'tv', 1), 'store', 'whip to the card reader, close', 'Spender swipes a plain blue card: the reader beeps green'),
    ('S03', (1, "he'll", 1), 'store', 'slam on the counter calendar', 'The little counter calendar EXPLODES into YEAR pages flying at the lens'),
    ('S04', (1, 'nineteen', 1), 'store', "slam-zoom on Spender's face", "Jaw drop on 'nineteen' (shock), YEAR 19 pages raining"),
    ('S05', (2, 'five', 1), 'store', 'medium on Spender + TV', 'A big red price tag $5,000 slams onto the TV (bounce, thud)'),
    ('S06', (2, 'card', 1), 'store', 'close on the card', 'The card: a red 22% stamp slams onto it'),
    ('S07', (3, 'he', 1), 'store', 'medium on Spender at the PAY BILL box', 'Smug: he flips one small coin toward the PAY BILL slot'),
    ('S08', (3, 'only', 1), 'store', 'close on the bill', 'Bill sheet: MINIMUM DUE $142 (EXAMPLE)'),
    ('S09', (3, 'easy', 1), 'store', 'medium on Spender, push-in', 'Smug lean-back, thumbs up; TV glowing behind'),
    ('S10', (4, 'wrong', 1), 'store', 'SLAM wide on the payment', 'Buzz! The coin stack splits: most of it rockets into a tall INTEREST jar'),
    ('S11', (4, 'of', 1), 'store', 'close on the INTEREST jar', 'The jar gulps the coins, glows red'),
    ('S12', (4, 'so', 1), 'store', 'medium on the OWE $5,000 block', 'A tiny chip falls off the giant OWE block: $5,000 -> $4,950'),
    ('S13', (4, 'barely', 1), 'store', 'low wide, Spender pushes the block', "He shoves the block with all his might; it doesn't budge (squash/stretch)"),
    ('S14', (5, 'nineteen', 1), 'whisper', 'medium on the wall calendar, dim', 'Dim: the wall calendar races YEAR 1 -> 19; dust, cobwebs on the TV'),
    ('S15', (5, 'paid', 1), 'whisper', 'wide, crash', 'The INTEREST jar bursts: a coin avalanche crashes down: +$8,100 EXTRA (camera shake)'),
    ('S16', (5, 'extra', 1), 'whisper', 'slam on Spender, despair', 'Despair: Spender sinks, antennae droop, squash'),
    ('S17', (6, 'pay', 1), 'ending', 'medium on Saver (green, glasses) at his own block', 'Bright: Saver slams a $200/MO stack onto his OWE block'),
    ('S18', (6, 'instead', 1), 'ending', "wide on Saver's block", 'His block cracks and bursts into bouncing cubes'),
    ('S19', (6, 'done', 1), 'ending', 'medium on Saver, calendar', 'DONE stamp: UNDER 3 YEARS; Saver cheers'),
    ('S20', (6, 'years', 1), 'store', 'medium on Spender with the TV', 'Back to Spender, hugging his TV, sweating'),
    ('S21', (7, 'you', 1), 'store', 'slam toward the lens', 'He points at the lens: you'),
    ('S22', (7, 'you', 2), 'store', 'SAME lens + position as S01 (loop match)', 'LOOP: a new big TV drops onto the counter again; Spender cheers -> frame 0'),
]
ACCENT = {(1, 'nineteen'), (2, 'twenty-two'), (4, 'wrong'), (5, 'eight'), (6, 'three'), (7, 'you')}
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
