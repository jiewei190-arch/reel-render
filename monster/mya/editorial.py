"""Editorial: outline -> narration (display text) per scene, citing claim ids. Deterministic checks decide whether a
draft is usable: length band, no number on screen or in narration that the cited claims don't contain, a real hook.
"""
from __future__ import annotations

import re

from . import llm, speech
from .config import cfg
from .research import numbers

WPS = {"a": 2.55, "b": 2.45}  # measured Kokoro words/second at speed 1.0 is ~2.2; profiles speak at ~1.05-1.12x


def target_words(profile, fmt: str) -> tuple[int, int, int]:
    secs = profile.raw[f"{fmt}_seconds"]
    wps = 2.25 * float(profile.raw.get("speed", 1.0))
    mid = int(secs * wps)
    return int(mid * 0.85), mid, int(mid * 1.12)


SCRIPT_SCHEMA = {
    "type": "object", "additionalProperties": False,
    "required": ["title", "audience_question", "promise", "originality_note", "scenes", "description"],
    "properties": {
        "title": {"type": "string", "minLength": 8, "maxLength": 70},
        "audience_question": {"type": "string"},
        "promise": {"type": "string"},
        "originality_note": {"type": "string"},
        "description": {"type": "string"},
        "scenes": {"type": "array", "minItems": 4, "maxItems": 40, "items": {
            "type": "object", "additionalProperties": False, "required": ["narration", "claim_ids", "visual_intent"],
            "properties": {"narration": {"type": "string", "minLength": 3},
                           "claim_ids": {"type": "array", "items": {"type": "string"}},
                           "visual_intent": {"type": "string"}}}},
    },
}


def _brief(profile, fmt: str, claims: list[dict], lessons: str) -> tuple[str, str]:
    lo, mid, hi = target_words(profile, fmt)
    verified = [c for c in claims if c["status"] == "verified"]
    system = (
        f"You write narration for '{profile.working_name}', a faceless YouTube channel. Niche: {profile.niche}. "
        f"Audience: {profile.audience}. Promise: {profile.promise}. Tone: {profile.tone}. "
        f"Never: {'; '.join(profile.avoid)}.\n"
        "Rules: use ONLY facts from the numbered claims, and cite their ids in each scene's claim_ids. Do not invent "
        "numbers, dates, names or quotes. Scene 1 is the hook: the most surprising fact in one short sentence, no "
        "greeting, no 'today we'. Each scene is 1-2 short sentences a narrator can say naturally. End with a clear payoff."
    )
    shape = ("a Short: 6-10 scenes" if fmt == "short" else
             "a long video: 16-30 scenes with a cold open, 3-5 chapters (start a chapter scene with 'Chapter:' in "
             "visual_intent) and a re-hook every few scenes")
    user = (
        f"Write {shape}, {lo}-{hi} words of narration in total (aim for {mid}).\n{lessons}\n"
        "Verified claims:\n" + "\n".join(f"{c['id']}: {c['statement']}" for c in verified)
        + "\n\nFor each scene, also describe in visual_intent what the viewer should SEE that makes that line clearer "
        "(a number counting up, a comparison, a timeline, a record, a list), not decoration."
    )
    return system, user


def check(script: dict, claims: list[dict], profile, fmt: str) -> list[str]:
    """Problems that make a draft unusable. Empty list = passes."""
    problems = []
    lo, _, hi = target_words(profile, fmt)
    words = sum(speech.word_count(s["narration"]) for s in script["scenes"])
    if words < lo * 0.9 or words > hi * 1.1:
        problems.append(f"length: {words} spoken words, needs {lo}-{hi}")
    by_id = {c["id"]: c for c in claims}
    for i, s in enumerate(script["scenes"], 1):
        cited = [by_id[c] for c in s["claim_ids"] if c in by_id]
        bad = [c for c in s["claim_ids"] if c not in by_id or by_id[c]["status"] != "verified"]
        if bad:
            problems.append(f"scene {i} cites unknown or unverified claims {bad}")
        nums = numbers(s["narration"])
        allowed = set().union(*(numbers(c["passage"]) | numbers(c["statement"]) for c in cited)) if cited else set()
        stray = sorted(n for n in nums if n not in allowed)
        if stray:
            problems.append(f"scene {i} says numbers no cited claim supports: {stray} ('{s['narration'][:60]}')")
    first = script["scenes"][0]["narration"].lower()
    if re.match(r"^(hi|hey|hello|welcome|today|in this video)", first):
        problems.append("scene 1 is a greeting, not a hook")
    return problems


def write(topic: str, profile, fmt: str, claims: list[dict], lessons: str = "", feedback: str = "") -> tuple[dict, list[str]]:
    system, user = _brief(profile, fmt, claims, lessons)
    if feedback:
        user += f"\n\nFix these problems from the last draft:\n{feedback}"
    tries = cfg().runtime.get("max_regenerations_per_stage", 2) + 1
    problems: list[str] = []
    script = {}
    for _ in range(tries):
        script = llm.ask(system, f"Topic: {topic}\n" + user + (
            "\n\nYour last draft had these problems; fix every one:\n- " + "\n- ".join(problems) if problems else ""),
            SCRIPT_SCHEMA, temperature=0.5)
        problems = check(script, claims, profile, fmt)
        if not problems:
            break
    for i, s in enumerate(script["scenes"], 1):
        s["id"] = f"sc{i:02d}"
    return script, problems
