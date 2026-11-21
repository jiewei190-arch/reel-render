"""Gemini with Google Search grounding: topic research and independent fact-checking of the script's claims."""
from __future__ import annotations

import os

from google import genai
from google.genai import types

from .config import CFG
from .cost import COST

_client: genai.Client | None = None


def client() -> genai.Client:
    global _client
    if _client is None:
        CFG.require_keys("GEMINI_API_KEY")
        _client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
    return _client


def grounded(prompt: str) -> tuple[str, list[dict]]:
    """Run one Google-Search-grounded Gemini call. Returns (text, [{title, url}])."""
    resp = client().models.generate_content(
        model=CFG.gemini_model,
        contents=prompt,
        config=types.GenerateContentConfig(tools=[types.Tool(google_search=types.GoogleSearch())]),
    )
    COST.gemini_calls += 1
    sources: list[dict] = []
    for cand in resp.candidates or []:
        meta = getattr(cand, "grounding_metadata", None)
        for ch in (getattr(meta, "grounding_chunks", None) or []):
            web = getattr(ch, "web", None)
            if web and getattr(web, "uri", None):
                sources.append({"title": getattr(web, "title", "") or "", "url": web.uri})
    seen, uniq = set(), []
    for s in sources:
        if s["url"] not in seen:
            seen.add(s["url"])
            uniq.append(s)
    return resp.text or "", uniq


def research(topic: str, channel_brief: str) -> tuple[str, list[dict]]:
    prompt = (
        f"You are a careful researcher for a short-video channel. {channel_brief}\n\n"
        f"Topic: {topic}\n\n"
        "Find the most surprising, verifiable facts and numbers for a 45-second Short on this topic. "
        "For every fact give the exact figure, the year it applies to, and which source says it. "
        "Prefer official and primary sources (government agencies, regulators, peer-reviewed or major-outlet reporting). "
        "Flag anything that is disputed, outdated, or only an example/assumption. Do not give financial advice."
    )
    return grounded(prompt)


def verify(claims: list[str]) -> tuple[str, list[dict]]:
    numbered = "\n".join(f"{i + 1}. {c}" for i, c in enumerate(claims))
    prompt = (
        "Fact-check each numbered claim below using current web sources. For EACH claim, answer on its own line in the form\n"
        "  N. VERDICT - short reason - source\n"
        "where VERDICT is one of: CORRECT, WRONG, UNSUPPORTED, NEEDS-HEDGE (true only as an example/assumption or with a caveat).\n"
        "Check the arithmetic of any calculation. Be strict: a claim that is roughly right but uses an outdated figure is WRONG.\n\n"
        f"{numbered}"
    )
    return grounded(prompt)
