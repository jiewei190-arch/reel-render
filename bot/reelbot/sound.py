"""Sound design stage: Claude plans custom sound effects for the Short's key moments, ElevenLabs generates each one
from a text description, and they are added to the mix cues next to the engine's stock SFX.

Generated sounds are cached in <audio_dir>/sfx/gen_<hash>.wav, so a sound described the same way is only paid for once.
"""
from __future__ import annotations

import hashlib
import json
import os
import re
import subprocess
from pathlib import Path

import requests

from . import claude
from .config import CFG
from .cost import COST

MAX_NEW = 12  # fresh sounds per Short (cached ones are free)

PLAN_SCHEMA = {
    "type": "object", "additionalProperties": False, "required": ["cues"],
    "properties": {"cues": {"type": "array", "items": {
        "type": "object", "additionalProperties": False,
        "required": ["word", "offset", "description", "duration", "db"],
        "properties": {
            "word": {"type": "string", "description": "the spoken word it lands on, as in the timings; 'word#2' for the 2nd time"},
            "offset": {"type": "number", "description": "seconds relative to that word's start (-0.3 to 0.5)"},
            "description": {"type": "string", "description": "what the sound is, for a sound-effect generator: concrete, short"},
            "duration": {"type": "number", "description": "0.4 to 3 seconds"},
            "db": {"type": "number", "description": "mix level, -14 (subtle) to -2 (punch); the voice must stay clear"},
        }}}},
}

DESIGNER = (
    "You are the sound designer for short animated YouTube videos. Great Shorts feel alive: every visual beat has a "
    "sound, and the sounds are specific and a little funny, never the same generic whoosh over and over. Plan 8-14 custom "
    "sound effects that land on the key words and visual moments: reveals, numbers, reactions, transitions, the twist, "
    "the payoff and the loop. Be concrete and varied (e.g. 'cartoon cash register cha-ching with coins spilling', "
    "'record scratch', 'sad trombone wah-wah', 'paper stamp thunk', 'crowd gasp', 'tense heartbeat thump', "
    "'sparkly magic chime', 'rubber squeak'). Keep them short and never under the hook's first words unless it is a "
    "punchy impact. The engine already plays basic impacts/whooshes on cuts; add character on top, don't duplicate.\n"
    "MATCH THE MOOD of each moment (the line moods are given). Sad or serious beats (a death, an injury, a real loss, "
    "a scam victim, a disaster, a warning) get subtle, respectful sounds (low drone, soft heartbeat, a single "
    "piano note, wind) or none at all: NEVER comedic sounds (trombones, boings, squeaks, laughs, cartoon slips) there. "
    "Comedic sounds only on genuinely light moments; triumphant sounds only on good news."
)


def _time_of(word: str, timings: dict) -> float | None:
    m = re.match(r"^(.*?)(?:#(\d+))?$", word.strip())
    target, nth = m.group(1).lower().strip(".,!?\"'"), int(m.group(2) or 1)
    seen = 0
    for tn in timings["turns"]:
        for w in tn["words"]:
            if re.sub(r"[^\w']", "", w["w"].lower()) == re.sub(r"[^\w']", "", target):
                seen += 1
                if seen == nth:
                    return float(w["t"])
    return None


def _generate(desc: str, dur: float, out: Path) -> None:
    if os.environ.get("REELBOT_ELEVENLABS_OFF") == "1" or os.environ.get("REELBOT_SFX_REPLAN") == "0":
        raise RuntimeError("ElevenLabs is switched off for this run (REELBOT_ELEVENLABS_OFF/REELBOT_SFX_REPLAN=0); cue skipped")
    from . import channels
    from .config import eleven_key
    key = eleven_key(channels.active().id)
    if not key:
        CFG.require_keys("ELEVENLABS_API_KEY")
    r = requests.post("https://api.elevenlabs.io/v1/sound-generation",
                      headers={"xi-api-key": key, "Content-Type": "application/json"},
                      json={"text": desc, "duration_seconds": max(0.5, min(dur, 5.0)), "prompt_influence": 0.5},
                      timeout=120)
    if r.status_code != 200:
        raise RuntimeError(f"ElevenLabs sound error {r.status_code}: {r.text[:200]}")
    COST.sfx_generated += 1
    mp3 = out.with_suffix(".mp3")
    mp3.write_bytes(r.content)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(mp3), "-ar", "48000", "-ac", "2", str(out)], check=True)
    mp3.unlink()


def design(folder: Path, cues_file: Path, comp: str) -> int:
    """Plan + generate custom SFX and append them to the engine's cue file. Returns the number of cues added."""
    data = json.loads((folder / "script.json").read_text(encoding="utf-8"))
    timings = json.loads((folder / "vo" / "timings.json").read_text(encoding="utf-8"))
    recipe = (folder / "recipe.json").read_text(encoding="utf-8") if (folder / "recipe.json").exists() else ""
    cues_all = json.loads(cues_file.read_text(encoding="utf-8"))
    info = cues_all[comp]
    saved = folder / "sound_design.json"
    if saved.exists() and os.environ.get("REELBOT_SFX_REPLAN") != "1":
        # The words and their timings don't change between editor rounds, so the sound plan doesn't either:
        # reuse it (no Claude call) and the already-generated files (no ElevenLabs spend).
        plan = json.loads(saved.read_text(encoding="utf-8"))
        print(f"  sound: reusing the sound plan ({len(plan)} cues; set REELBOT_SFX_REPLAN=1 to redo it)")
        return _apply(plan, timings, info, cues_all, cues_file, folder, comp)
    print("  claude: planning sound design...")
    plan = claude.ask_json(DESIGNER,
                           "Script lines with their moods:\n" + "\n".join(
                               f"[{m.get('mood', '?')}] {l}" for l, m in zip(data["lines"], data.get("moods") or [{}] * len(data["lines"])))
                           + "\n\nWord timings:\n" + json.dumps(timings)[:20000]
                           + "\n\nShot recipe (what is on screen when):\n" + recipe[:20000]
                           + "\n\nStock cues the engine already plays:\n" + json.dumps(info["cues"]),
                           PLAN_SCHEMA, effort="medium")["cues"]
    return _apply(plan, timings, info, cues_all, cues_file, folder, comp)


def _apply(plan: list, timings: dict, info: dict, cues_all: dict, cues_file: Path, folder: Path, comp: str) -> int:
    sfx_dir = CFG.audio_dir / "sfx"
    sfx_dir.mkdir(parents=True, exist_ok=True)
    added, fresh = 0, 0
    for c in plan:
        t = _time_of(c["word"], timings)
        if t is None:
            continue
        desc = c["description"].strip()
        name = "gen_" + hashlib.sha1(desc.lower().encode()).hexdigest()[:10]
        wav = sfx_dir / f"{name}.wav"
        if not wav.exists():
            if fresh >= MAX_NEW:
                continue
            print(f"  elevenlabs sfx: {desc}")
            try:
                _generate(desc, float(c["duration"]), wav)
            except Exception as e:  # one bad sound shouldn't sink the Short
                print(f"    skipped: {e}")
                continue
            fresh += 1
        info["cues"].append({"t": round(max(0.0, t + float(c["offset"])), 3), "sfx": name,
                             "db": max(-18.0, min(float(c["db"]), -1.0)), "desc": desc})
        added += 1
    cues_file.write_text(json.dumps(cues_all, indent=1), encoding="utf-8")
    (folder / "sound_design.json").write_text(json.dumps(plan, indent=1), encoding="utf-8")
    print(f"  sound: {added} custom cues ({fresh} newly generated)")
    return added
