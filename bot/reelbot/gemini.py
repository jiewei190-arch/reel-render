"""Gemini with Google Search grounding: topic research and independent fact-checking of the script's claims."""
from __future__ import annotations

import re

import os

try:
    from google import genai
    from google.genai import types
except ImportError:  # optional dependency
    genai = types = None

from .config import CFG
from .cost import COST

_client = None


def enabled() -> bool:
    """Gemini is optional and OFF by default (owner decision, Nov 2026: free only). Turn on with REELBOT_USE_GEMINI=1."""
    return os.environ.get("REELBOT_USE_GEMINI") == "1" and bool(os.environ.get("GEMINI_API_KEY"))


def label() -> str:
    """Who is actually doing grounded research right now, for log lines."""
    return "gemini" if enabled() else "claude (web search)"


def client():
    global _client
    if _client is None:
        CFG.require_keys("GEMINI_API_KEY")
        _client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
    return _client


def grounded(prompt: str) -> tuple[str, list[dict]]:
    """Grounded research. Returns (text, [{title, url}]). Uses Claude's web search unless Gemini is enabled."""
    if not enabled():
        from . import claude
        return claude.ask_web(prompt)
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


def verify(claims: list[str], hint_sources: list[dict] | None = None) -> tuple[str, list[dict]]:
    numbered = "\n".join(f"{i + 1}. {c}" for i, c in enumerate(claims))
    hints = "".join(f"- {h.get('title', '')}: {h['url']}\n" for h in (hint_sources or [])[:8] if h.get("url"))
    prompt = (
        "Fact-check each numbered claim below using current web sources. For EACH claim, answer on its own line in the form\n"
        "  N. VERDICT - short reason - source URL - exact supporting quote (if any)\n"
        "where VERDICT is one of: CORRECT, WRONG, UNSUPPORTED, NEEDS-HEDGE (true only as an example/assumption or with a caveat).\n"
        "Check the arithmetic of any calculation. Be strict: a claim that is roughly right but uses an outdated figure is WRONG. "
        "Answer every number exactly once, in order.\n"
        + (f"\nThese sources were already found for this story; fetch the most relevant ones FIRST and check the claims "
           f"against them before searching more:\n{hints}" if hints else "")
        + f"\n{numbered}"
    )
    return grounded(prompt)


VERDICT_LINE = re.compile(r"^\W*(\d+)\W+\s*(CORRECT|WRONG|UNSUPPORTED|NEEDS[- ]HEDGE)\b\W*(.*)$", re.I | re.M)
BATCH = 8  # claims per check: each check gets its own search budget, so long scripts are not starved


def _key(claim: str) -> str:
    return re.sub(r"\W+", " ", claim.lower()).strip()


def verify_ledger(claims: list[str], ledger: dict, hint_sources: list[dict] | None = None) -> tuple[dict, str, list[dict]]:
    """Check only the claims that are new or not yet CORRECT; CORRECT verdicts from earlier rounds are kept (with
    their source), so a claim can't flip from confirmed to 'no source found' just because a later search missed it.
    Returns (ledger for exactly these claims, a numbered report for the judge, the sources used this round)."""
    todo = [c for c in claims if ledger.get(_key(c), {}).get("verdict") != "CORRECT"]
    used: list[dict] = []
    for i in range(0, len(todo), BATCH):
        part = todo[i:i + BATCH]
        text, srcs = verify(part, hint_sources)
        used += srcs
        got = {int(m.group(1)): (m.group(2).upper().replace(" ", "-"), m.group(3).strip()) for m in VERDICT_LINE.finditer(text)}
        for j, c in enumerate(part, 1):
            v, why = got.get(j, ("UNSUPPORTED", "the checker gave no verdict for this claim"))
            ledger[_key(c)] = {"claim": c, "verdict": v, "reason": why, "checked_sources": bool(srcs)}
    out = {_key(c): ledger[_key(c)] for c in claims}
    report = "\n".join(f"{n}. {e['verdict']} - {e['reason']}" + ("" if c in todo else " (confirmed in an earlier round)")
                       for n, (c, e) in enumerate(zip(claims, out.values()), 1))
    return out, report, used
