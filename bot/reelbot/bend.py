"""Niche bending: take a video format that is already winning, keep WHY people watch it, and aim it at our channel.

  python -m reelbot bend "<reference: a video/channel title, URL, or a description of the format>" --channel law

1. Gemini (Google Search grounded) studies the reference: who watches it, what keeps them, title and thumbnail logic.
2. Claude extracts the mechanism and proposes adaptations for the channel: original stories, not name swaps.
3. Gemini (grounded) checks demand and competition for each idea with real, cited examples.
4. Claude ranks them and marks anything unproven as UNVALIDATED. Nothing invented: no made-up views or income.
Writes work/bend/<date>_<channel>.md and appends the best topics to work/topics_<channel>.txt for `batch`.
"""
from __future__ import annotations

import json
import re
import time

from . import channels, claude, gemini
from .config import BOT_DIR

IDEAS_SCHEMA = {
    "type": "object", "additionalProperties": False, "required": ["mechanism", "ideas"],
    "properties": {
        "mechanism": {"type": "string", "description": "why the reference works: audience, curiosity, promise, title/thumbnail logic"},
        "ideas": {"type": "array", "items": {
            "type": "object", "additionalProperties": False,
            "required": ["topic", "title", "hook", "angle", "why_it_keeps_the_appeal", "research_needed"],
            "properties": {
                "topic": {"type": "string", "description": "one specific true story or case, named"},
                "title": {"type": "string"}, "hook": {"type": "string", "description": "spoken line 1"},
                "angle": {"type": "string"}, "why_it_keeps_the_appeal": {"type": "string"},
                "research_needed": {"type": "string"},
            }}},
    },
}

RANK_SCHEMA = {
    "type": "object", "additionalProperties": False, "required": ["ranked"],
    "properties": {"ranked": {"type": "array", "items": {
        "type": "object", "additionalProperties": False,
        "required": ["topic", "title", "verdict", "evidence", "risk", "format"],
        "properties": {
            "topic": {"type": "string"}, "title": {"type": "string"},
            "verdict": {"type": "string", "enum": ["STRONG", "PROMISING", "UNVALIDATED", "SKIP"]},
            "evidence": {"type": "string", "description": "cited demand/competition evidence from the check, or 'none found'"},
            "risk": {"type": "string"},
            "format": {"type": "string", "enum": ["short", "long", "both"]},
        }}}},
}


def run(reference: str, n: int = 10) -> str:
    ch = channels.active()
    print(f"  gemini: studying the reference for {ch.name}...")
    study, s1 = gemini.grounded(
        f"Study this YouTube reference: {reference}\n\nFind the actual video(s)/channel if you can. Report: the audience, "
        "what makes people click (title and thumbnail pattern), what keeps them watching (structure, curiosity, pacing), "
        "typical length, and real view counts with dates for several of its videos (cite them; say 'not found' rather "
        "than guess). Also note what is weak or missing in it.")
    print("  claude: extracting the mechanism and bending it to our channel...")
    ideas = claude.ask_json(
        "You adapt proven YouTube formats to a new audience. Keep the reason viewers care; change the audience or subject "
        "so each video needs ORIGINAL research and storytelling. Swapping names alone is a weak idea: reject it. "
        "Every idea must be a specific, real, documentable story.",
        f"Our channel: {ch.brief}\n\nResearch on the reference:\n{study}\n\nPropose {n} adaptations for our channel.",
        IDEAS_SCHEMA, effort="medium")
    print(f"  gemini: checking demand and competition for {len(ideas['ideas'])} ideas...")
    check, s2 = gemini.grounded(
        "For each topic below, search YouTube-related results and the web. Report: existing videos on the same story "
        "(title, channel, approximate views, upload year), whether recent uploads still get views, and whether people "
        "are searching or talking about it now. Cite sources; write 'none found' instead of guessing numbers.\n\n"
        + "\n".join(f"{i + 1}. {x['topic']} ({x['title']})" for i, x in enumerate(ideas["ideas"])))
    ranked = claude.ask_json(
        "Rank these video ideas for a NEW channel that needs subscribers and watch hours fast. STRONG = clear evidence "
        "of demand and room to stand out; PROMISING = some evidence; UNVALIDATED = not enough evidence; SKIP = saturated, "
        "weak, or risky. Never invent numbers; use only the evidence given.",
        f"Channel: {ch.brief}\n\nIdeas:\n{json.dumps(ideas['ideas'], indent=1)}\n\nDemand/competition check:\n{check}",
        RANK_SCHEMA, effort="medium")["ranked"]

    day = time.strftime("%Y-%m-%d")
    out = BOT_DIR / "work" / "bend" / f"{day}_{ch.id}.md"
    out.parent.mkdir(parents=True, exist_ok=True)
    src = "\n".join(f"- {s['title']}: {s['url']}" for s in s1 + s2)
    rows = "\n".join(f"| {r['verdict']} | {r['format']} | {r['title']} | {r['topic']} | {r['evidence']} | {r['risk']} |"
                     for r in ranked)
    text = (f"# Bend: {ch.name} ({day})\n\nReference: {reference}\n\n## Why the reference works\n{ideas['mechanism']}\n\n"
            "## Ideas, ranked\n| verdict | format | title | topic | evidence | risk |\n|---|---|---|---|---|---|\n"
            f"{rows}\n\n## Reference research\n{study}\n\n## Demand check\n{check}\n\n## Sources\n{src}\n")
    out.write_text(text, encoding="utf-8")
    keep = [r["topic"] for r in ranked if r["verdict"] in ("STRONG", "PROMISING")]
    if keep:
        tf = BOT_DIR / "work" / f"topics_{ch.id}.txt"
        old = tf.read_text(encoding="utf-8") if tf.exists() else ""
        new = [t for t in keep if t not in old]
        tf.write_text(old + "".join(re.sub(r"\s+", " ", t).strip() + "\n" for t in new), encoding="utf-8")
        print(f"  {len(new)} topic(s) added to {tf.name} (review it, then: python -m reelbot batch {tf} --channel {ch.id})")
    for r in ranked:
        print(f"  {r['verdict']:<11} {r['format']:<5} {r['title']}")
    print(f"\nFull report: {out}")
    return text
