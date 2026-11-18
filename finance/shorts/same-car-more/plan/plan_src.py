"""Plan source (FORMAT v1 story Short) "same-car-more": shots anchored to WORDS of the voice-over.
    python plan/plan_src.py vo/timings.json      -> src/plan.gen.ts + plan/SHOTS.md
"""
TITLE = 'same-car-more'
CAST_NOTE = 'SPENDER (red, bag) wants a new car; LENDER (navy, hat) is the grinning car seller; the INTEREST furnace from hook B. Set: a sunny blocky car lot (two identical red cars, a price sign, a shed with a covered sign on its door, the furnace behind it). No logos, no brands.'
LOOP_NOTE = 'S13 on "extra": no closing line: the S01 lens, the boards drop again; loops to frame 0 and "Would you rather pay 926 a month, or just 453?"'
COUNTER = 'none (v1, style S4 WOULD-YOU-RATHER). Hook text from frame 0: $926 OR $453 A MONTH?. In the set: $926/MO and $453/MO boards, x 3 / x 7 YEARS stamps, towers $3,347 vs $8,034, ≈$4,700 EXTRA.'
SHOTS = [
    ('S01', (1, 'would', 1), 'earth', 'wide on both cars (S4 choice)', 'FRAME 0 MID-ACTION: two identical red cars; the $926/MO board has landed, the $453/MO board is mid-drop (bounce, debris); hook text $926 OR $453 A MONTH?'),
    ('S14', (1, 'a', 1), 'earth', 'close on the $926 board', 'The $926/MO board'),
    ('S02', (1, 'just', 1), 'earth', 'close on the $453 board', 'The $453/MO board glows'),
    ('S03', (2, 'same', 1), 'earth', 'wider on both cars', 'SAME CAR · SAME 7% banner'),
    ('S15', (2, 'same', 2), 'earth', 'close on the banner', 'SAME CAR · SAME 7% banner'),
    ('S04', (2, 'pick', 1), 'earth', 'slow push, the 1-s pause', "PICK ONE pulses: the viewer's 1-second guess (clock tick)"),
    ('S05', (3, 'spender', 1), 'earth', 'medium on Spender at car B', 'Spender grabs the $453 car, arms up'),
    ('S16', (3, '453', 1), 'earth', 'close on Spender', 'Spender hugs his pick: joy'),
    ('S06', (3, 'half', 1), 'earth', 'medium on the seller', 'The seller (Lender) rubs his hands, sly'),
    ('S20', (3, 'easy', 1), 'earth', 'medium on Spender and his pick', 'Spender pats the $453 car, smug'),
    ('S07', (4, 'but', 1), 'earth', 'close on both boards', 'x 3 YEARS and x 7 YEARS stamps slam onto the boards'),
    ('S17', (4, 'seven', 1), 'earth', 'slam on Spender', "Shock on 'seven years'"),
    ('S08', (4, 'and', 1), 'whisper', 'slow push on the shed door', "OPEN LOOP: the covered '? ? ?' shed door rattles, orange glow under it"),
    ('S19', (4, 'something', 1), 'whisper', 'close on the door gap', 'OPEN LOOP: orange light pulses under the shaking door'),
    ('S21', (5, 'seven', 1), 'whisper', 'push on the glowing door', 'OPEN LOOP peak: the door bulges, orange light through every crack'),
    ('S09', (5, '8,034', 1), 'whisper', 'wide, the door bursts', 'TWIST: the door blasts open on the INTEREST furnace; towers rise'),
    ('S18', (5, 'interest', 1), 'whisper', 'low on the 7-year tower', 'The $8,034 tower slams up'),
    ('S10', (5, 'three', 1), 'whisper', 'low on the towers', 'The $3,347 (3 yrs) tower beside it: the gap'),
    ('S22', (5, '3,347', 1), 'whisper', 'close on the short tower', 'The $3,347 tower: under half the height'),
    ('S11', (6, 'the', 1), 'whisper', 'medium on Spender at the furnace', 'Spender feeds cash bricks into the fire'),
    ('S12', (6, '4,700', 1), 'whisper', 'close on the furnace', '≈$4,700 EXTRA over the flames'),
    ('S13', (6, 'extra', 1), 'earth', 'SAME lens as S01 (loop match)', 'Back to the two cars and the question; the boards drop again -> frame 0'),
]
ACCENT = {(6, '4,700'), (4, 'seven'), (5, '8,034'), (1, '453'), (2, 'pick'), (3, '453')}
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
