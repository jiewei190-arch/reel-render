"""Tone director: makes sure every line's voice emotion (and every sound effect) fits what is actually being said.

Runs after the script is written and before anything is voiced. A separate Claude pass reads each line on its own
merits, decides its mood (sad, serious, tense, hopeful, funny, hype...), and rewrites the audio tags so the delivery
matches: no happy or excited voice on a loss, a death, a disaster, a mistake that hurts someone, or a warning.
The words themselves never change; only the tags do.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

from . import claude

TAG = re.compile(r"\[[^\]]*\]")

SCHEMA = {
    "type": "object", "additionalProperties": False, "required": ["lines"],
    "properties": {"lines": {"type": "array", "items": {
        "type": "object", "additionalProperties": False, "required": ["mood", "voice_line", "why"],
        "properties": {
            "mood": {"type": "string", "enum": ["sad", "serious", "tense", "worried", "neutral", "curious", "hopeful",
                                                "funny", "sarcastic", "surprised", "triumphant", "hype"]},
            "voice_line": {"type": "string", "description": "the line, word for word, with fitting audio tags"},
            "why": {"type": "string"},
        }}}},
}

DIRECTOR = (
    "You are the voice director. For EACH line, judge its mood from what it actually says, in the context of the whole "
    "story, then choose ElevenLabs audio tags that fit that mood. Hard rules:\n"
    "- Sad or serious content (someone dies, gets hurt, loses money they needed, is scammed, a disaster, a warning, "
    "a legal or medical consequence) gets [serious], [sad], [sighs], [disappointed], [softly] or no tag. NEVER "
    "[excited], [laughs], [chuckles], [mischievously] or anything playful there.\n"
    "- Tense setups and secrets get [whispers], [serious], [dramatic], [short pause].\n"
    "- Comedy is only for genuinely light moments (a silly mistake with no real victim, an absurd fact): "
    "[sarcastic], [chuckles], [mischievously].\n"
    "- [excited] / [shocked] / [gasps] are for reveals, big numbers and wins, and only when the news is good or "
    "neutral for the viewer; a shocking LOSS gets [shocked] or [serious], not [excited].\n"
    "- When unsure, use a neutral, confident read (no tag) rather than the wrong emotion.\n"
    "- 0-2 tags per line. Keep every word exactly; only add, move or remove tags."
)


def strip(text: str) -> str:
    return re.sub(r"\s+", " ", TAG.sub("", text)).strip()


def direct(lines: list[str], draft: list[str] | None, topic: str) -> tuple[list[str], list[dict]]:
    """Return voice_lines whose emotion matches each line, plus the per-line mood notes."""
    res = claude.ask_json(
        DIRECTOR,
        f"Topic: {topic}\n\nLines (numbered):\n" + "\n".join(f"{i + 1}. {l}" for i, l in enumerate(lines))
        + ("\n\nThe writer's draft tags (fix any that don't fit):\n" + "\n".join(f"{i + 1}. {l}" for i, l in enumerate(draft))
           if draft else ""),
        SCHEMA, effort="medium")["lines"]
    out = []
    for i, line in enumerate(lines):
        v = res[i]["voice_line"] if i < len(res) else line
        out.append(v if strip(v) == line else line)  # never let the director change the words
    return out, res[: len(lines)]


def apply(folder: Path) -> None:
    sj = folder / "script.json"
    data = json.loads(sj.read_text(encoding="utf-8"))
    print("  claude: voice director checking each line's mood...")
    data["voice_lines"], data["moods"] = direct(data["lines"], data.get("voice_lines"), data.get("topic", ""))
    sj.write_text(json.dumps(data, indent=1, ensure_ascii=False), encoding="utf-8")
    for m, v in zip(data["moods"], data["voice_lines"]):
        print(f"    {m['mood']:<10} {v[:90]}")
