"""Storyboard: each narrated scene gets one scene type from the channel's visual family and validated params.

The model never writes code: it picks a component and fills its JSON params, which must pass
schemas/scene_params.schema.json. Numbers shown on screen must come from the scene's cited claims. If a scene cannot
be planned validly, it falls back to a plain text card AND the job gets a major finding, so a weak visual is never
silently accepted.
"""
from __future__ import annotations

import json

import jsonschema

from . import llm
from .config import SCHEMA_DIR
from .research import numbers

DEFS = json.loads((SCHEMA_DIR / "scene_params.schema.json").read_text(encoding="utf-8"))["$defs"]

GUIDE = {
    "title": "a bold headline card (use sparingly)", "question": "a big question for a hook or open loop",
    "counter": "one important number counting up", "comparison": "two values side by side as bars",
    "bars": "3-6 values compared as horizontal bars", "timeline": "2-5 dated events in order",
    "steps": "2-4 short list items (how to spot it, what happened next)", "flow": "a cause -> effect chain of 2-4 boxes",
    "document": "a record/headline/email card with 1-4 lines (court record, headline, email, report)",
    "stamp": "one stamped word like VERDICT, SCAM, BANKRUPT, REJECTED with a short sub line",
    "code": "a few lines of code (only for software topics)", "duel": "the two Block Money characters side by side",
}


def schema_for(t: str) -> dict:
    return {"$defs": DEFS, **DEFS[t]}


def _onscreen_numbers(params) -> set[str]:
    return numbers(json.dumps(params))


def plan(script: dict, claims: list[dict], profile, fmt: str, lessons: str = "") -> tuple[list[dict], list[dict]]:
    types = [t for t in profile.scene_types if t in DEFS]
    by_id = {c["id"]: c for c in claims}
    listing = "\n".join(f"{i}. \"{s['narration']}\"  (intent: {s['visual_intent']})" for i, s in enumerate(script["scenes"]))
    choice = llm.ask(
        "You are a motion-graphics director. For each narrated line, choose the ONE scene type that makes that line "
        "clearer to a viewer. Vary the types; never use the same type more than twice in a row. "
        "Types: " + "; ".join(f"{t} = {GUIDE[t]}" for t in types),
        f"Channel: {profile.working_name}. {lessons}\nLines:\n{listing}",
        {"type": "object", "additionalProperties": False, "required": ["types"],
         "properties": {"types": {"type": "array", "minItems": len(script["scenes"]), "maxItems": len(script["scenes"]),
                                  "items": {"enum": types}}}}, temperature=0.3)["types"]
    scenes, findings = [], []
    for i, (s, t) in enumerate(zip(script["scenes"], choice)):
        cited = [by_id[c] for c in s["claim_ids"] if c in by_id]
        facts = "\n".join(f"- {c['statement']}" for c in cited) or "- (no claim: use words from the line only)"
        allowed = set().union(*(numbers(c["passage"]) | numbers(c["statement"]) for c in cited)) if cited else set()
        allowed |= numbers(s["narration"]) & allowed if allowed else set()
        params, why = None, ""
        for attempt in range(3):
            try:
                cand = llm.ask(
                    f"Fill the params for a '{t}' scene ({GUIDE[t]}). Short, readable text: labels of 1-4 words, "
                    "headlines under 8 words. Use ONLY numbers that appear in the facts. Values are plain numbers "
                    "(54000000 not '54 million'; put $ in prefix).",
                    f"Narration: \"{s['narration']}\"\nWhat the viewer should see: {s['visual_intent']}\nFacts:\n{facts}"
                    + (f"\nLast attempt was rejected: {why}" if why else ""),
                    schema_for(t), temperature=0.3)
                jsonschema.validate(cand, schema_for(t))
                stray = sorted(n for n in _onscreen_numbers(cand) if n not in allowed and n not in ("0", "1", "2", "3", "4"))
                if stray:
                    why = f"numbers {stray} are not in the facts"
                    continue
                params = cand
                break
            except Exception as e:  # noqa: BLE001
                why = str(e)[:200]
        if params is None:
            t, params = "title", {"headline": s["narration"][:88]}
            findings.append({"severity": "major", "stage": "storyboard", "scene": s["id"],
                             "finding": f"no valid visual could be planned ({why}); used a plain text card"})
        scenes.append({"id": s["id"], "type": t, "params": params, "claim_ids": s["claim_ids"]})
    return scenes, findings
