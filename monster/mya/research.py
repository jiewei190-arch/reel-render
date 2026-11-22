"""Research + claim ledger.

Sources: the Wikipedia API (free, no key) as a first, dated reference, with the article's revision id so the exact
text can be rechecked. The model may only SELECT sentences from the fetched text; the supporting passage stored in the
ledger is that sentence verbatim, and every number in a claim must appear in its passage, or the claim is 'uncertain'.
Another AI response is never treated as evidence.
"""
from __future__ import annotations

import re
from pathlib import Path

from . import llm
from .util import http, now_utc, sha256_bytes

API = "https://en.wikipedia.org/w/api.php"


class ResearchError(RuntimeError):
    pass


def _get(params: dict, job_dir: Path) -> dict:
    last = None
    for attempt in range(3):  # bounded retries with backoff for transient network errors
        try:
            r = http("GET", API, job_dir=job_dir, params={**params, "format": "json", "formatversion": 2})
            if r.status_code == 200:
                return r.json()
            last = f"HTTP {r.status_code}"
        except Exception as e:  # noqa: BLE001
            if "not allowed" in str(e):
                raise
            last = str(e)
        import time
        time.sleep(1.5 * (attempt + 1))
    raise ResearchError(f"Wikipedia API failed after 3 attempts: {last}")


def fetch_sources(topic: str, job_dir: Path, n: int = 2) -> list[dict]:
    hits = _get({"action": "query", "list": "search", "srsearch": topic, "srlimit": n}, job_dir)["query"]["search"]
    if not hits:
        raise ResearchError(f"no Wikipedia article found for '{topic}'")
    out = []
    for i, h in enumerate(hits[:n]):
        q = _get({"action": "query", "prop": "extracts|info|revisions", "explaintext": 1, "inprop": "url",
                  "rvprop": "ids|timestamp", "titles": h["title"]}, job_dir)["query"]["pages"][0]
        text = q.get("extract", "")
        if len(text) < 400:
            continue
        rev = (q.get("revisions") or [{}])[0]
        out.append({"id": f"S{i + 1}", "publisher": "Wikipedia", "title": q["title"], "url": q.get("fullurl"),
                    "revision_id": rev.get("revid"), "revision_time": rev.get("timestamp"), "retrieved_utc": now_utc(),
                    "text": text, "text_sha256": sha256_bytes(text.encode())})
    if not out:
        raise ResearchError(f"sources for '{topic}' were too short to support a script")
    return out


ABBREV = re.compile(r"(?:\b(?:v|vs|Mr|Mrs|Ms|Dr|St|Jr|Sr|Inc|Co|Corp|Ltd|No|Gen|Gov|Sen|Rep|Mt|Ft|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)|\b(?:[A-Z]\.){1,3}[A-Z])\.$")


def sentences(text: str) -> list[str]:
    """Split into sentences without breaking at abbreviations ("Pearson v. Chung", "D.C.", "Inc.")."""
    text = re.sub(r"\n+==+[^=]+==+\n+", "\n", text)
    raw = re.split(r"(?<=[.!?])\s+(?=[A-Z0-9\"'(])", text.replace("\n", " "))
    out, cur = [], ""
    for part in raw:
        cur = f"{cur} {part}".strip() if cur else part
        if ABBREV.search(cur):
            continue  # the "sentence end" was an abbreviation: keep joining
        out.append(cur)
        cur = ""
    if cur:
        out.append(cur)
    return [p.strip() for p in out if 40 <= len(p.strip()) <= 400]


OUTCOME = re.compile(r"\b(ruled|rules|ruling|verdict|in favor of|in favour of|dismiss\w*|judgment|acquitt\w*|convict\w*|"
                     r"sentenced|found (?:him|her|them|it) |awarded|settled|settlement|overturned|upheld|appeal\w* (?:was|were) |"
                     r"bankrupt\w*|liquidat\w*|shut down|closed|ceased|collapsed|sold to|acquired|was arrested|pleaded|"
                     r"died|killed|ended|lost|won)\b", re.I)
NUM = re.compile(r"\d[\d,]*(?:\.\d+)?")


def numbers(s: str) -> set[str]:
    return {n.replace(",", "").rstrip(".") for n in NUM.findall(s)}


CLAIMS_SCHEMA = {
    "type": "object", "additionalProperties": False, "required": ["picks"],
    "properties": {"picks": {"type": "array", "minItems": 4, "maxItems": 14, "items": {
        "type": "object", "additionalProperties": False, "required": ["sentence", "role"],
        "properties": {"sentence": {"type": "integer", "minimum": 0},
                       "role": {"enum": ["hook", "context", "number", "twist", "outcome", "aftermath"]}}}}},
}


def build_claims(topic: str, profile, sources: list[dict], lessons: str = "") -> list[dict]:
    """The model only SELECTS sentences. Each claim IS its source sentence, verbatim, so it cannot drift from the
    evidence; the script stage is then checked against these passages."""
    pool = []
    for s in sources:
        for sent in sentences(s["text"]):
            pool.append((s["id"], sent))
    pool = pool[:160]
    listing = "\n".join(f"[{i}] {sent}" for i, (_, sent) in enumerate(pool))
    res = llm.ask(
        "You are a careful researcher for a YouTube channel. Pick the source sentences that tell the story best: the "
        "most surprising fact (hook), key numbers, the twist and the outcome. Return sentence numbers only.",
        f"Channel: {profile.working_name}: {profile.niche}.\nTopic: {topic}\n{lessons}\n"
        f"Numbered sentences from the sources:\n{listing}\n\nPick 6-12 sentence numbers about {topic}.",
        CLAIMS_SCHEMA, temperature=0.1, max_tokens=500)
    claims, seen = [], set()
    for p in res["picks"]:
        i = p["sentence"]
        if i in seen or not 0 <= i < len(pool):
            continue
        seen.add(i)
        sid, sent = pool[i]
        claims.append({"id": f"C{len(claims) + 1}", "statement": sent, "role": p["role"], "status": "verified",
                       "source_ids": [sid], "passage": sent, "note": "verbatim source sentence"})
    if True:
        # every story needs a sourced ending, or a writer will invent one: always ask for it explicitly
        for c in claims:
            if c["role"] in ("outcome", "aftermath"):
                c["role"] = "twist"  # the picker's guess is demoted; the dedicated pick below is the ending
        # narrow the choice for small models: only sentences that read like an ending, from the main source first
        cands = [i for i, (sid, sent) in enumerate(pool) if OUTCOME.search(sent)]
        cands = sorted(cands, key=lambda i: (pool[i][0] != "S1", i))[:25] or list(range(len(pool)))
        short = "\n".join(f"[{i}] {pool[i][1]}" for i in cands)
        end = llm.ask("Pick the ONE sentence that states how the MAIN story finally ended: the court's verdict or ruling, "
                      "the final result, or what happened to the main people or company. Not a side story, not the start "
                      "of a trial, not a lawsuit being filed.",
                      f"Topic: {topic}\n{short}", {"type": "object", "additionalProperties": False, "required": ["sentence"],
                      "properties": {"sentence": {"enum": cands}}},
                      temperature=0.0, max_tokens=20)["sentence"]
        if end in seen:
            for c in claims:
                if c["passage"] == pool[end][1]:
                    c["role"] = "outcome"
        else:
            sid, sent = pool[end]
            claims.append({"id": f"C{len(claims) + 1}", "statement": sent, "role": "outcome", "status": "verified",
                           "source_ids": [sid], "passage": sent, "note": "verbatim source sentence (outcome)"})
    if len(claims) < 3:
        raise ResearchError("fewer than 3 usable source sentences were selected")
    return claims
