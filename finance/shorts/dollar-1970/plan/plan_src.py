"""Plan source (FORMAT v1, style S5 CHARACTER-TALKS) "dollar-1970": shots anchored to WORDS of the dialogue.
    python plan/plan_src.py vo/timings.json      -> src/plan.gen.ts + plan/SHOTS.md
Speakers (vo/speakers.json): SPENDER lines 1, 4, 8; SAVER lines 2, 3, 5, 6, 7, 9. Shot/reverse shot on the speaker.
"""
TITLE = "dollar-1970"
CAST_NOTE = "SPENDER (red) and SAVER (green, glasses) TALK (no narrator) in a blocky corner SNACK SHOP that flips between 1970 (warm retro light, a 1970 sign) and NOW. Props: Spender's $1 bill that shrinks, a price tag that rolls $1.00 -> $8.70, a CPI booklet, a calendar, a coin drip from Spender's bag. No logos, no brands."
LOOP_NOTE = "S16 on \"You only notice the total. Like:\": the S01 lens on Spender, his $1 bill shrinking again; the loop lands on \"Wait. My dollar is worth under twelve cents?!\" at frame 0."
COUNTER = "none (no HUD). Hook text from frame 0: YOUR $1 = UNDER 12 CENTS / (IN 1970 MONEY). Numbers live in the set: the bill (12 CENTS in 1970 money), ALMOST 9x, the price tag $1.00 -> $8.70, ~4% A YEAR, 1970 -> NOW."
SHOTS = [
    ('S01', (1, 'wait', 1), 'store', 'CLOSE on Spender (speaking)', 'FRAME 0 MID-ACTION: Spender (shock) holds up his $1 bill, already shrinking in his hand; hook text YOUR $1 = UNDER 12 CENTS'),
    ('S02', (1, 'dollar', 1), 'store', 'MACRO on the bill', 'The bill shrinks to a sliver: UNDER 12 CENTS (IN 1970 MONEY) stamp; Spender gasps'),
    ('S03', (2, 'in', 1), 'store', 'close on Saver (speaking)', 'Saver, calm, taps a 1970 sign on the wall'),
    ('S04', (2, 'prices', 1), 'store', 'medium on the shelf', 'A price tag on the shelf climbs; ALMOST 9x slams on'),
    ('S05', (3, "that's", 1), 'store', 'medium on Saver', 'Saver holds up a blocky booklet: CONSUMER PRICE INDEX (BLS)'),
    ('S06', (3, 'not', 1), 'store', 'close on the booklet', 'NOT A GUESS stamp'),
    ('S07', (4, 'but', 1), 'store', 'close on Spender (speaking)', 'Spender pats his empty pockets, suspicious'),
    ('S08', (4, 'so', 1), 'store', 'two-shot', 'Spender spins around looking for the thief'),
    ('S09', (5, "it's", 1), 'whisper', 'close on Saver (speaking)', "OPEN LOOP: Saver leans in, sly: the shop lights dim, a soft drip sound"),
    ('S10', (6, 'a', 1), 'home', '1970 shop, medium on the snack', 'Warm retro light, sign 1970: a snack on the shelf, tag $1.00'),
    ('S11', (6, 'costs', 1), 'store', 'SAME framing in the NOW shop (match cut)', 'NOW: the tag rolls $1.00 -> $8.70; Spender (behind) shock'),
    ('S12', (7, 'roughly', 1), 'store', 'medium on Spender', 'Twist: a slow drip of tiny coins leaks from a hole in his bag; tag ~4% A YEAR'),
    ('S13', (7, 'for', 1), 'store', 'wide', 'The wall calendar flips 1970 -> NOW (56 years), the coin trail behind him'),
    ('S14', (8, 'i', 1), 'store', 'close on Spender (speaking)', 'Spender: despair, sees the coin trail'),
    ('S15', (9, 'nobody', 1), 'ending', 'close on Saver (speaking)', 'Saver, kind: nobody does'),
    ('S16', (9, 'you', 1), 'store', 'SAME lens as S01 (loop match)', 'LOOP: Spender holds up his $1 bill, shrinking again -> frame 0'),
]
ACCENT = {(1, 'twelve'), (2, 'nine'), (6, 'seventy'), (7, 'four'), (9, 'total')}
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
TAIL = 0.35  # PC: 29.59 s voice + 0.35 s keeps the Short under 30 s


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
