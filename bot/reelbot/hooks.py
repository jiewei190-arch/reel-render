"""Hook factory: write several openings for a topic, have two different models score them blind, keep the best.

The first second decides whether a Short gets pushed, so the opening is chosen before the rest of the script exists.
Claude writes N candidates (different angles), then Claude and Gemini each score every candidate independently
(1-10, "would a stranger scrolling Shorts stop?"), using our own retention data as the yardstick. The average wins.
"""
from __future__ import annotations

import json
import os

from google.genai import types

from . import claude, gemini, learn
from .config import CFG

CANDIDATES_SCHEMA = {
    "type": "object", "additionalProperties": False, "required": ["hooks"],
    "properties": {"hooks": {"type": "array", "items": {
        "type": "object", "additionalProperties": False, "required": ["line1", "hook_text", "frame0", "angle"],
        "properties": {
            "line1": {"type": "string", "description": "first spoken sentence, <= 12 words, numbers in words"},
            "hook_text": {"type": "string", "description": "on-screen text at frame 0, <= 5 words, CAPS, *one* red word"},
            "frame0": {"type": "string", "description": "what the viewer SEES in the first second"},
            "angle": {"type": "string", "description": "the psychological lever: myth, loss, comparison, POV, number shock..."},
        }}}},
}

SCORES_SCHEMA = {
    "type": "object", "additionalProperties": False, "required": ["scores"],
    "properties": {"scores": {"type": "array", "items": {
        "type": "object", "additionalProperties": False, "required": ["index", "score", "why"],
        "properties": {"index": {"type": "integer"}, "score": {"type": "number"}, "why": {"type": "string"}}}}},
}

JUDGE_BRIEF = (
    "You judge YouTube Shorts openings. Picture a stranger thumbing through Shorts at speed. For each candidate, score "
    "1-10 how likely they are to STOP and keep watching past 3 seconds. Reward: a concrete dollar figure or a "
    "surprising claim in the first sentence, talking to 'you', an instantly clear situation, tension or a myth to bust, "
    "a strong visual at frame 0. Punish: vague setups, character names before the stake, jargon, slow scene-setting, "
    "anything that needs context. Be harsh and spread the scores out. Use the channel's own data below as ground truth "
    "for what works with THIS audience."
)


def _candidates_prompt(topic: str, research: str, n: int, data: str) -> str:
    return (f"Topic: {topic}\n\nResearch:\n{research[:6000]}\n\nOur channel's numbers:\n{data or '(no data yet)'}\n\n"
            f"Write {n} DIFFERENT openings for a Spender vs Saver Short on this topic. Each must use a different angle "
            "(number shock, myth bust, 'you' accusation, POV, loss, comparison, question...). Every number must be "
            "supported by the research or labelled as an example later in the script.")


def _listing(cands: list[dict]) -> str:
    return "\n".join(f"{i}. SAYS: {c['line1']} | SCREEN: {c['hook_text']} | SEES: {c['frame0']}" for i, c in enumerate(cands))


def _gemini_scores(cands: list[dict], data: str) -> dict[int, float]:
    resp = gemini.client().models.generate_content(
        model=CFG.gemini_model,
        contents=f"{JUDGE_BRIEF}\n\nChannel data:\n{data or '(none yet)'}\n\nCandidates:\n{_listing(cands)}",
        config=types.GenerateContentConfig(response_mime_type="application/json", response_json_schema=SCORES_SCHEMA),
    )
    from .cost import COST
    COST.gemini_calls += 1
    try:
        return {s["index"]: float(s["score"]) for s in json.loads(resp.text)["scores"]}
    except (json.JSONDecodeError, KeyError, TypeError):
        return {}


def pick(topic: str, research: str, n: int = 6) -> tuple[dict, list[dict]]:
    data = learn.current()
    print(f"  claude: writing {n} hook candidates...")
    cands = claude.ask_json(
        "You write the first second of viral YouTube Shorts for Block Money (Spender vs Saver money stories). "
        "No financial advice or picks. Hooks: <= 12 spoken words, a dollar figure or myth up front, 'you' framing.",
        _candidates_prompt(topic, research, n, data), CANDIDATES_SCHEMA)["hooks"][:n]

    print("  claude + gemini: scoring hooks blind...")
    c_scores = {s["index"]: float(s["score"]) for s in claude.ask_json(
        JUDGE_BRIEF, f"Channel data:\n{data or '(none yet)'}\n\nCandidates:\n{_listing(cands)}",
        SCORES_SCHEMA, effort="medium")["scores"]}
    g_scores = _gemini_scores(cands, data) if os.environ.get("GEMINI_API_KEY") else {}

    for i, c in enumerate(cands):
        both = [s for s in (c_scores.get(i), g_scores.get(i)) if s is not None]
        c["claude_score"], c["gemini_score"] = c_scores.get(i), g_scores.get(i)
        c["score"] = round(sum(both) / len(both), 2) if both else 0.0
    ranked = sorted(cands, key=lambda c: c["score"], reverse=True)
    for c in ranked:
        print(f"    {c['score']:>4}  {c['line1']}  [{c['hook_text']}]")
    return ranked[0], ranked
