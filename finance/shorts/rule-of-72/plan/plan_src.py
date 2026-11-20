"""Plan source (FORMAT v1, style S6 COUNTDOWN) "rule-of-72": shots anchored to WORDS of the voice-over.
    python plan/plan_src.py vo/timings.json      -> src/plan.gen.ts + plan/SHOTS.md
"""
TITLE = "rule-of-72"
CAST_NOTE = "A blocky GAME-SHOW stage: three podiums #3 #2 #1 (#1 behind a red curtain), a big board (72 / RATE = YEARS TO DOUBLE). SAVER (green, glasses) with a SAVINGS jar at #3 and #2; SPENDER (red) with his card, revealed at #1 next to an OWE block that doubles. No logos, no brands."
LOOP_NOTE = "S16 on \"That's why you should know these\": the S01 lens on Spender with his card again; the loop lands on \"Three things that double.\" at frame 0."
COUNTER = "none (no HUD). Hook text from frame 0: 3 THINGS THAT DOUBLE / #1 IS THE SCARY ONE. Numbers live in the set: the board (72 / 6 = 12, 72 / 8 = 9, 72 / 24 = 3), podium rate tags 6% 8% 24%, x2 stamps."
SHOTS = [
    ('S01', (1, 'three', 1), 'store', 'CLOSE on Spender, card in hand', 'FRAME 0 MID-ACTION: Spender (sly) twirls his card, a big #3 countdown card whips past the lens; hook text 3 THINGS THAT DOUBLE / #1 IS THE SCARY ONE'),
    ('S02', (1, 'number', 1), 'store', 'slam close', 'The #1 sign behind him flashes red: Spender SHOCK (squash)'),
    ('S03', (2, 'the', 1), 'store', 'wide stage', 'The game-show stage: podiums #3 #2 #1, #1 behind a red curtain'),
    ('S04', (2, 'divide', 1), 'store', 'close on the board, slam', 'The board SLAMS: 72 / RATE = YEARS TO DOUBLE'),
    ('S05', (3, 'number', 1), 'store', 'medium on podium #3', '#3 lights up: Saver with a SAVINGS jar, tag 6%'),
    ('S06', (3, 'about', 1), 'store', 'medium, push', 'Board: 72 / 6 = ABOUT 12 YEARS; the jar fills to x2'),
    ('S07', (4, 'number', 1), 'store', 'medium on podium #2', '#2 lights up: Saver at 8%'),
    ('S08', (4, 'about', 1), 'store', 'medium, push', 'Board: 72 / 8 = ABOUT 9 YEARS; Saver relaxed'),
    ('S09', (5, 'and', 1), 'whisper', 'push on the curtain', 'OPEN LOOP: the stage dims, a spotlight on the #1 curtain, it trembles; suspense'),
    ('S10', (5, 'wait', 1), 'whisper', 'close on the curtain', 'The curtain bulges: someone is behind it'),
    ('S11', (6, "spender's", 1), 'store', 'SLAM wide on #1', 'The curtain DROPS: Spender with his card at #1, tag 24% slams; shock'),
    ('S12', (6, 'if', 1), 'store', 'close on the board', 'Board: 72 / 24 = ABOUT 3 YEARS'),
    ('S13', (6, 'what', 1), 'store', 'medium, slam', 'His OWE block DOUBLES (x2 stamp, squash), shoving Spender back'),
    ('S14', (7, 'same', 1), 'ending', 'wide on both', 'Same maths, wrong side: Saver\'s jar x2 (green) vs Spender\'s OWE x2 (red)'),
    ('S15', (7, "it's", 1), 'ending', 'close on the board', 'SHORTCUT, NOT A PROMISE stamped on the board'),
    ('S16', (7, "that's", 1), 'store', 'SAME lens as S01 (loop match)', 'LOOP: Spender twirls his card again -> frame 0'),
]
ACCENT = {(1, 'scary'), (3, 'twelve'), (4, 'nine'), (6, 'three'), (7, 'you')}
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
