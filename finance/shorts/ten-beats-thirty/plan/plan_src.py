"""Plan source for the finance Short "ten-beats-thirty": shots, accents and tags anchored to WORDS of the voice-over.
Re-run after every VO change; the times move with the words. Writes src/plan.gen.ts and plan/SHOTS.md.

    python plan/plan_src.py vo/timings.json
"""
TITLE = "ten-beats-thirty"
CAST_NOTE = "SAVER (green, glasses) vs SPENDER (red, bag), side by side the whole film; PENNY (copper kid) as the coin courier. Set: two identical blocky garden plots under one sky, each with a Jar on a Podium and an age sign; no logos."
LOOP_NOTE = "S20 (\"That's how\") returns to the S01 lens: both characters at their empty jars at the start, Saver already dropping the first coin; the loop lands on \"Ten years\"."
SHOTS = [
    ("S01", (1, "ten", 1), "earth", "wide symmetrical two-shot, faces ~38% height, push-in", "Saver (left) and Spender (right) at two identical empty Jars on podiums; signs 10 YRS over Saver, 30 YRS over Spender"),
    ("S02", (1, "beat", 1), "earth", "medium on Saver, push-in", "Saver's jar glows, clearly fuller than Spender's (end state teased)"),
    ("S03", (2, "saver", 1), "earth", "medium on Saver, push-in", "Age sign above Saver reads 25; he drops a coin bundle into his jar"),
    ("S04", (2, "month", 1), "earth", "close on the jar, push-in", "Penny (kid) delivers a $200 coin bundle each beat; monthly rhythm, pop()"),
    ("S05", (2, "thirty-five,", 1), "earth", "medium, push-in", "Age sign flips 35; Saver dusts his hands and steps back"),
    ("S06", (2, "stops", 1), "earth", "wide, push-in", "Saver sits in a deck chair beside his jar, done; tag DEPOSITS: 10 YRS"),
    ("S07", (3, "spender", 1), "earth", "medium on Spender, push-in", "Spender, who was shopping (bag full), sets the bag down; age sign 35"),
    ("S08", (3, "same", 1), "earth", "close on Spender's jar, push-in", "Penny delivers the same $200 bundle into Spender's jar"),
    ("S09", (3, "sixty-five", 1), "earth", "medium wide, push-in", "Age sign flips 65; Spender is still dropping coins, grey antennae"),
    ("S10", (4, "saver", 1), "store", "close on Saver's ledger tag, push-in", "Tag on Saver's podium: PUT IN $24,000"),
    ("S11", (4, "spender,", 1), "store", "close on Spender's ledger tag, push-in", "Tag on Spender's podium: PUT IN $72,000; Spender looks smug"),
    ("S12", (5, "assume", 1), "store", "medium on a board between them, push-in", "A board drops between them: EXAMPLE 7%/YR, STEADY (HYPOTHETICAL)"),
    ("S13", (5, "example", 1), "store", "wide, push-in", "Both jars hum with a soft green glow; small coins appear on their own (growth on growth)"),
    ("S14", (6, "sixty-five,", 1), "ending", "wide symmetrical two-shot, push-in", "Age 65: Saver's jar has grown into a tall glass column of coins, taller than Spender's"),
    ("S15", (6, "eighty", 1), "ending", "close on Saver's tag, push-in", "Tag ≈ $282,600; Saver adjusts his glasses"),
    ("S16", (6, "spender,", 1), "ending", "close on Spender's tag, push-in", "Tag ≈ $245,400; Spender's jaw drops"),
    ("S17", (7, "real", 1), "whisper", "medium on the board, push-in", "The 7% line on the board wobbles up and down; tag NOT GUARANTEED"),
    ("S18", (7, "time", 1), "ending", "medium on Saver, push-in", "A big blocky clock lifts Saver's jar like a crane: TIME"),
    ("S19", (7, "lifting", 1), "ending", "low angle, push-in", "The clock sets the jar down with a thud; coins ring"),
    ("S20", (8, "that's", 1), "earth", "SAME lens + position as S01 (loop match), push-in", "Back to the start: both at empty jars; Saver drops the first coin"),
]
ACCENT = {(1, "ten"), (2, "stops"), (3, "same"), (4, "seventy-two"), (5, "example"), (6, "eighty"), (7, "time")}
TAGS = [
    (1, "ten", "HYPOTHETICAL: $200/MO · 7%/YR STEADY", "small painted card on the fence from frame 0"),
    (6, "eighty", "≈ $282,600 vs ≈ $245,400", "holo tags over the two jars"),
]


# ---- engine (same in every finance Short; from the blocky-shorts template's plan/plan_src.py, extended) -----------
# Changes from the template: a shot carries a full scene line (cast, action, props, on-screen tag, camera); cuts aim at
# ~1.4 s (warn under 1.0 s or over 2.2 s); also writes plan/SHOTS.md (readable shot list with times and captions).
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
        f"export const TAGS = {json.dumps(tags)} as const;\n", encoding="utf8")
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
    md += ["", "## Painted / holo tags", ""] + [f"- {t['t']:.2f} s **{t['text']}**: {t['note']}" for t in tags]
    md += ["", "## Loop", "", LOOP_NOTE, ""] + ([f"## Warnings", ""] + [f"- {w}" for w in warns] if warns else [])
    (root / "plan" / "SHOTS.md").write_text("\n".join(md) + "\n", encoding="utf8")
    print("wrote", out.name, "+ plan/SHOTS.md")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "vo/timings.json")
