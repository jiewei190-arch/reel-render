"""Plan source (FORMAT v1 story Short) "same-car-more": shots anchored to WORDS of the voice-over.
    python plan/plan_src.py vo/timings.json      -> src/plan.gen.ts + plan/SHOTS.md
"""
TITLE = 'same-car-more'
CAST_NOTE = 'SPENDER (red, bag) wants a new car; LENDER (navy, hat) is the grinning car seller; the INTEREST furnace from hook B. Set: a sunny blocky car lot (two identical red cars, a price sign, a shed with a covered sign on its door, the furnace behind it). No logos, no brands.'
LOOP_NOTE = 'S17 on "Just like this guy": Spender at the furnace with a cash brick mid-swing, the S01 lens; loops to frame 0 (the brick mid-air) and "This guy is about to pay...".'
COUNTER = 'none (v1). Hook text from frame 0: $4,700 FOR NOTHING. Numbers in the set: $30,000 sign, 7% EXAMPLE tag, 3 YRS $926/MO and 7 YRS $453/MO sheets, interest towers $3,347 vs $8,034, ≈$4,700 EXTRA.'
SHOTS = [
    ('S01', (1, 'this', 1), 'earth', 'side-track on the furnace, brick mid-air', 'FRAME 0 MID-ACTION (flash-forward): Spender tosses a cash brick into the roaring INTEREST furnace behind the shed; hook text $4,700 FOR NOTHING'),
    ('S02', (1, 'for', 1), 'earth', "slam on Spender's face", 'He freezes, realises: shock, squash'),
    ('S03', (2, 'spender', 1), 'earth', 'wide on the car lot', 'Story start: a shiny red car, $30,000 sign; Spender walks up, love eyes'),
    ('S04', (2, 'seven', 1), 'earth', 'close on the windshield', 'A 7% EXAMPLE tag slaps onto the windshield'),
    ('S05', (3, 'three', 1), 'earth', 'medium on the seller', 'Lender (the seller, hat) holds up a sheet: 3 YEARS $926/MO'),
    ('S06', (3, 'ouch', 1), 'earth', 'slam on Spender', 'Spender recoils, shock'),
    ('S07', (4, 'then', 1), 'earth', 'medium on the seller', 'The seller grins and flips the sheet: 7 YEARS $453/MO!'),
    ('S08', (4, 'just', 1), 'earth', 'medium on Spender', 'Spender: joy, arms up'),
    ('S09', (5, 'half', 1), 'earth', 'two payment stacks', 'Two coin stacks: $926 vs $453 (the small one glows)'),
    ('S10', (5, 'easy', 1), 'earth', 'medium two-shot', 'Spender stamps SIGNED on the 7-year sheet; the seller rubs his hands'),
    ('S11', (5, 'but', 1), 'earth', 'slow push on the shed door', 'OPEN LOOP: the shed door with a covered sign rattles; orange glow leaks under it'),
    ('S12', (6, 'seven', 1), 'whisper', 'wide, the door bursts open', 'TWIST: the door blasts open: the INTEREST furnace roars; two towers rise: $3,347 (3 yrs) vs $8,034 (7 yrs)'),
    ('S13', (6, 'not', 1), 'whisper', 'low on the towers', 'The $8,034 tower slams up past the $3,347 one'),
    ('S14', (7, 'same', 1), 'whisper', 'wide on two identical cars', 'Same car twice: 3 YRS and 7 YRS tags'),
    ('S15', (7, 'about', 1), 'whisper', 'medium on Spender at the furnace', 'Spender feeds cash bricks into the fire: ≈$4,700 EXTRA'),
    ('S16', (8, 'stretch', 1), 'ending', 'close on a calendar', 'A calendar stretches 3 -> 7 YEARS; a coin pile grows beside it'),
    ('S17', (8, 'just', 1), 'earth', 'SAME lens as S01 (loop match)', 'LOOP: Spender at the furnace, brick mid-swing -> frame 0'),
]
ACCENT = {(5, 'door'), (2, 'seven'), (7, '4,700'), (6, '8,034'), (4, '453'), (3, '926'), (1, 'nothing')}
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
