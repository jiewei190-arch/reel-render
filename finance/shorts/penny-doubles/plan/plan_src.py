"""Plan source (FORMAT v1, style S2 RICH-VS-POOR) "penny-doubles": shots anchored to WORDS of the voice-over.
    python plan/plan_src.py vo/timings.json      -> src/plan.gen.ts + plan/SHOTS.md
Split screen: every shot is TWO lenses on one world: TOP = Spender's million (red vault), BOTTOM = Saver's penny (green
mint). The lens notes below are "TOP | BOTTOM".
"""
TITLE = "penny-doubles"
CAST_NOTE = "SPENDER (red) takes $1,000,000 (cash bricks, a red vault); SAVER (green, glasses) takes 1 penny that doubles daily (a green mint, coin pile). Each half has its own scoreboard. No logos, no brands."
LOOP_NOTE = "S19 on \"you know who took the penny\": both halves return to the S01 lenses (Spender tossing cash, Saver flipping the penny); the loop lands on \"Saver took a penny\" at frame 0."
COUNTER = "none (no HUD). Hook text from frame 0: 1 PENNY vs $1,000,000. Numbers live in the set: each half's scoreboard (Spender $1,000,000 fixed; Saver $0.01 -> $5.12 -> $5,242.88 -> $167,772.16 -> $1,342,177.28 -> $5,368,709.12) and a DAY calendar."
SHOTS = [
    ('S01', (1, 'saver', 1), 'store', 'CLOSE | CLOSE', 'FRAME 0 MID-ACTION: TOP Spender (joy) tosses cash bricks up; BOTTOM Saver (curious) flips the penny, mid-air near the lens; hook text 1 PENNY vs $1,000,000'),
    ('S02', (1, 'doubles', 1), 'store', 'medium TOP | MACRO BOTTOM', "BOTTOM: the penny on Saver's palm POPS into two coins (pop), Saver grins (emotion change); TOP: Spender hugs a cash brick"),
    ('S03', (1, 'spender', 1), 'store', 'slam TOP | push BOTTOM', 'TOP: the $1,000,000 scoreboard slams down behind Spender (impact, dust), he grins; BOTTOM: Saver looks at the lone penny on his palm, scoreboard $0.01'),
    ('S04', (1, 'who', 1), 'store', 'medium | medium', 'Both: a DAY 1 calendar drops in each half; Spender smug, Saver determined'),
    ('S05', (2, 'day', 1), 'store', 'medium | medium', 'Calendars flip to DAY 10; BOTTOM a tiny stack, scoreboard $5.12'),
    ('S06', (2, 'spender', 1), 'store', 'close TOP | medium BOTTOM', 'TOP: Spender laughs (squash), points down at Saver; BOTTOM: Saver unbothered'),
    ('S07', (3, 'day', 1), 'store', 'medium | medium', 'DAY 20: the calendars flip; TOP Spender leans on his brick wall'),
    ('S08', (3, 'about', 1), 'store', 'medium | close', "BOTTOM: Saver's pile grows, scoreboard $5,242.88"),
    ('S09', (3, "spender's", 1), 'store', 'close TOP | medium BOTTOM', 'TOP: smug Spender, feet up on the cash; BOTTOM: Saver keeps stacking'),
    ('S10', (4, 'but', 1), 'whisper', 'push | push', "OPEN LOOP: both halves dim; Saver's scoreboard is covered by a cloth; the calendar starts to flip; Spender curious"),
    ('S11', (5, 'day', 1), 'store', 'medium | medium', 'DAY 25: the calendars flip; Saver tugs the cloth'),
    ('S12', (5, 'over', 1), 'store', 'close | SLAM', "BOTTOM: the cloth flies off, coins ERUPT, scoreboard $167,772.16; TOP Spender's grin drops"),
    ('S13', (5, 'day', 2), 'store', 'close | wide', 'DAY 28: BOTTOM the pile towers'),
    ('S14', (5, 'one', 1), 'store', 'close | medium', 'BOTTOM scoreboard $1,342,177.28 (more than $1,000,000); TOP Spender shock'),
    ('S15', (5, 'saver', 1), 'store', 'close | close', 'Saver pulls ahead: BOTTOM Saver cheers on the pile; TOP Spender jaw drop'),
    ('S16', (6, 'five', 1), 'ending', 'SLAM | SLAM', 'DAY 30 (calendars flip): BOTTOM a coin avalanche, scoreboard $5,368,709.12; TOP: Spender despair, his cash looks tiny'),
    ('S17', (6, 'half', 1), 'ending', 'medium | medium', 'Half on the last day: BOTTOM the top half of the pile glows (DAY 30: +$2,684,354.56); TOP Spender droops'),
    ('S18', (7, 'patience', 1), 'ending', 'close | close', 'Patience paid: BOTTOM Saver smiles; TOP Spender sad'),
    ('S19', (7, 'and', 1), 'store', 'SAME lenses as S01 (loop match)', 'LOOP: Spender tosses cash again, Saver flips the penny again -> frame 0'),
]
ACCENT = {(1, 'million'), (2, 'laughs'), (5, 'ahead'), (6, 'million'), (7, 'penny')}
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
