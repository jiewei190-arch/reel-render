"""Plan source for the finance Short "dollar-1970": shots, accents and tags anchored to WORDS of the voice-over.
Re-run after every VO change; the times move with the words. Writes src/plan.gen.ts and plan/SHOTS.md.

    python plan/plan_src.py vo/timings.json
"""
TITLE = "dollar-1970"
CAST_NOTE = "SPENDER (red, bag) hero with a plain dollar bill; TELLER (violet, apron) runs the shop; SAVER (green, glasses) explains the index. Two versions of one blocky corner shop: '1970' (warm orange/brown retro palette, film grain) and 'NOW' (bright), no logos."
LOOP_NOTE = "S17 (\"That's exactly why\") returns to the S01 lens: Spender holds up the bill, which starts to shrink again; the loop lands on \"Your dollar is worth under twelve cents.\""
COUNTER = "a big price-tag counter `$1 (1970) = $x.xx NOW` rolling from $1.00 to $8.70, and in the NOW shots `YOUR $1 = xx¢` falling from 100¢ to 11.5¢."
SHOTS = [
    ("S01", (1, "your", 1), "store", "medium 3/4 on Spender, face ~38% height, push-in", "Conflict in frame 1: in the NOW shop, Spender holds up a plain green bill (no portrait, no seal) that visibly shrinks; counter YOUR $1 = 100¢ dropping"),
    ("S02", (1, "under", 1), "store", "close on the sliver, push-in", "The bill is a sliver on his palm; counter lands on YOUR $1 = 11.5¢; holo tag UNDER 12¢"),
    ("S03", (2, "1970", 1), "home", "wide, push-in through a doorway", "A door marked 1970 swings open onto the same shop in warm retro colours, film grain; the counter flips to 1970 PRICES"),
    ("S04", (2, "prices", 1), "store", "medium wide on the shelves, push-in", "Back in NOW: price Tags on the ShelfUnit flip upward one after another"),
    ("S05", (2, "times", 1), "store", "low angle, push-in", "A stack of 9 bill-blocks rises beside a single 1970 bill-block while a wall calendar riffles 1970 → 2026; tag ≈ 8.7×"),
    ("S06", (3, "government's", 1), "store", "medium on Saver, push-in", "Saver (glasses) at a board pointing at a plain chart line climbing steadily; tag CPI-U (BLS)"),
    ("S07", (3, "not", 1), "store", "close on the chart, push-in", "Saver stamps the chart: NOT A GUESS"),
    ("S08", (4, "something", 1), "home", "medium in the 1970 shop, push-in", "1970 shop: Teller hands Spender a basket of groceries for ONE bill; counter $1 (1970)"),
    ("S09", (4, "1970", 1), "home", "close on the price tag, push-in", "Painted price tag $1.00, retro font"),
    ("S10", (4, "eight", 1), "store", "SAME framing in the NOW shop (match cut), push-in", "Same basket in the NOW shop: the price-tag counter rolls $1.00 → $8.70; Spender's eyes widen"),
    ("S11", (5, "inflation", 1), "whisper", "medium, push-in", "Whisper mood: a slow drip of tiny coins leaks from a hole in Spender's bag"),
    ("S12", (5, "once", 1), "whisper", "close on the bag, push-in", "One coin drips at a time, almost unnoticed; counter ticks down 1¢ at a time"),
    ("S13", (6, "four", 1), "whisper", "medium wide, push-in", "A wall calendar flicks through years; each page drops one coin; tag ~4%/YR (AVG)"),
    ("S14", (6, "quietly", 1), "whisper", "medium on Spender + the leak, push-in", "Spender whistles, not noticing the growing coin trail behind him"),
    ("S15", (6, "fifty", 1), "ending", "very wide, push-in", "The bag is now flat; a small mountain of dripped coins behind him; tag 56 YEARS"),
    ("S16", (7, "nobody", 1), "store", "medium on Spender, push-in", "Spender shrugs at the empty bag; the shelf prices behind him tick up one by one"),
    ("S17", (7, "that's", 1), "store", "SAME lens + position as S01 (loop match), push-in", "Spender holds up the bill again; it starts to shrink (counter back at 100¢)"),
]
ACCENT = {(1, "twelve"), (2, "nine"), (3, "index"), (4, "seventy"), (5, "once"), (6, "four"), (7, "single")}
TAGS = [
    (1, "your", "CPI-U, 1970 AVG vs OCT 2026", "small painted card on the counter from frame 0"),
    (4, "seventy", "$8.70", "flip-tag on the basket"),
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
