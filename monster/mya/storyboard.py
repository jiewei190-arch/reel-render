"""Storyboard: each narrated scene gets one scene type from the channel's visual family and validated params.

The model never writes code: it picks a component and fills its JSON params, which must pass
schemas/scene_params.schema.json. Numbers shown on screen must come from the scene's cited claims. If a scene cannot
be planned validly, it falls back to a plain text card AND the job gets a major finding, so a weak visual is never
silently accepted.
"""
from __future__ import annotations

import json
import re

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


def _loose(o):
    """Same schema with string length caps removed: constrained decoding would cut text mid-word at the cap.
    The real caps are enforced afterwards, and an over-long answer is rejected and retried instead."""
    if isinstance(o, dict):
        return {k: _loose(v) for k, v in o.items() if k != "maxLength"}
    if isinstance(o, list):
        return [_loose(v) for v in o]
    return o


def _clean(o):
    if isinstance(o, dict):
        return {k: _clean(v) for k, v in o.items()}
    if isinstance(o, list):
        return [_clean(v) for v in o]
    if isinstance(o, str):
        return re.sub(r"\s+", " ", re.sub(r"[*_`#]+", "", o)).strip()  # no markdown on screen
    return o


MONTHS = "January|February|March|April|May|June|July|August|September|October|November|December"
VERDICT_WORDS = {"guilty": "GUILTY", "acquitted": "ACQUITTED", "favor": "VERDICT", "dismissed": "DISMISSED",
                 "settled": "SETTLED", "sued": "SUED", "bankrupt": "BANKRUPT", "bankruptcy": "BANKRUPT",
                 "closed": "CLOSED", "arrested": "ARRESTED", "convicted": "CONVICTED", "sentenced": "SENTENCED",
                 "settlement": "SETTLED", "scam": "SCAM", "hacked": "HACKED", "stolen": "STOLEN", "refused": "REFUSED", "lost": "LOST"}


def fallback(narration: str, types: list[str]) -> tuple[str, dict] | None:
    """Build a visual from the line's own facts, without the model. None = nothing concrete to show."""
    low = narration.lower()
    money = re.search(r"\$([\d,.]+)\s*(million|billion|thousand)?", narration)
    if money and "counter" in types:
        v = float(money.group(1).replace(",", ""))
        mult = {"million": 1e6, "billion": 1e9, "thousand": 1e3}.get((money.group(2) or "").lower(), 1)
        val, suffix = (v, {"million": "M", "billion": "B", "thousand": "K"}[money.group(2).lower()]) if money.group(2) else (v, "")
        words = [w for w in re.findall(r"[A-Za-z']+", narration) if len(w) > 3][:4]
        return "counter", {"label": " ".join(words)[:60] or "Amount", "value": val, "prefix": "$", "suffix": suffix,
                           "decimals": 1 if val != int(val) else 0}
    date = re.search(rf"(?:({MONTHS})\s+\d{{1,2}},\s*)?(1[0-9]{{3}}|20[0-9]{{2}})", narration)
    for w, stamp in VERDICT_WORDS.items():
        if re.search(rf"\b{w}\b", low) and "stamp" in types:
            sub = (date.group(0) if date else "")
            return "stamp", ({"text": stamp, "sub": sub} if sub else {"text": stamp})
    if date and "document" in types:
        kw = [w.strip("-,.") for w in re.findall(r"[A-Za-z0-9'-]+", narration) if len(w) > 3 and w.lower() not in STOP
              and w != date.group(2)
              and not re.fullmatch(MONTHS, w)][:6]
        return "document", {"kind": "Record", "title": date.group(0), "lines": [" ".join(kw[:3]), " ".join(kw[3:6])][: 2 if kw[3:] else 1]}
    num = re.search(r"\b(\d[\d,]*)\b", narration)
    if num and "counter" in types:
        n = float(num.group(1).replace(",", ""))
        words = [w for w in re.findall(r"[A-Za-z']+", narration[num.end():]) if len(w) > 2][:3]
        return "counter", {"label": " ".join(words)[:60] or "Number", "value": n}
    return None


def _onscreen_numbers(params) -> set[str]:
    return numbers(json.dumps(params))


STOP = set("the a an of to in on at for and or but is was were be by with as it its this that from his her their they he she "
           "we you your our than then so not no".split())
SKIP_KEYS = {"file", "credit", "tone", "color", "mood", "prefix", "suffix", "kind", "decimals", "highlight", "value", "from"}


def _texts(obj, key=""):
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k not in SKIP_KEYS:
                yield from _texts(v, k)
    elif isinstance(obj, list):
        for v in obj:
            yield from _texts(v, key)
    elif isinstance(obj, str):
        yield obj


def invented_words(params, allowed_text: str) -> list[str]:
    """On-screen words must come from the narration or its cited sources (a few generic labels are allowed)."""
    toks = re.findall(r"[a-z0-9']+", allowed_text.lower().replace("\u2019", "'"))
    allowed = set(toks) | {t[:-2] for t in toks if t.endswith("'s")} | {v.lower() for v in VERDICT_WORDS.values()} | {"verdict", "case", "file", "record", "court", "timeline",
              "total", "before", "after", "then", "now", "vs", "versus", "what", "happened", "how", "why", "who", "step", "result"}
    bad = []
    for t in _texts(params):
        for w in re.findall(r"[a-z']+", t.lower().replace("\u2019", "'")):
            w = w[:-2] if w.endswith("'s") else w
            w2 = w.rstrip("s")
            if w not in STOP and len(w) > 2 and w not in allowed and w2 not in allowed and w + "s" not in allowed:
                bad.append(w)
    return bad


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
                                  "items": {"enum": types}}}}, temperature=0.3, max_tokens=30 + 12 * len(script["scenes"]))["types"]
    scenes, findings = [], []
    for i, (s, t) in enumerate(zip(script["scenes"], choice)):
        cited = [by_id[c] for c in s["claim_ids"] if c in by_id]
        facts = "\n".join(f"- {c['statement']}" for c in cited) or "- (no claim: use words from the line only)"
        allowed = set().union(*(numbers(c["passage"]) | numbers(c["statement"]) for c in cited)) if cited else set()
        params, why = None, ""
        for attempt in range(3):
            try:
                cand = llm.ask(
                    f"Fill the params for a '{t}' scene ({GUIDE[t]}). Short, readable text: labels of 1-4 words, "
                    "headlines under 8 words, using words from the narration or facts. Text is what the viewer READS, "
                    "never a description of a picture. Use ONLY numbers that appear in the facts. Values are plain numbers "
                    "(54000000 not '54 million'; put $ in prefix).",
                    f"Narration: \"{s['narration']}\"\nWhat the viewer should see: {s['visual_intent']}\nFacts:\n{facts}"
                    + (f"\nLast attempt was rejected: {why}" if why else ""),
                    _loose(schema_for(t)), temperature=0.3, max_tokens=350)
                cand = _clean(cand)
                jsonschema.validate(cand, schema_for(t))
                stray = sorted(n for n in _onscreen_numbers(cand) if n not in allowed and n not in ("0", "1", "2", "3", "4"))
                if stray:
                    why = f"numbers {stray} are not in the facts"
                    continue
                made_up = invented_words(cand, s["narration"] + " " + " ".join(c["passage"] for c in cited))
                if len(made_up) > 1:
                    why = f"on-screen words {sorted(set(made_up))[:6]} are not in the narration or sources; use their words"
                    continue
                params = cand
                break
            except Exception as e:  # noqa: BLE001
                why = str(e)[:200]
        if params is None:
            fb = fallback(s["narration"], types)
            if fb:
                t, params = fb
                findings.append({"severity": "minor", "stage": "storyboard", "scene": s["id"],
                                 "finding": f"model visual rejected ({why[:120]}); built a {t} from the line's own facts"})
            else:
                kw = [w for w in re.findall(r"[A-Za-z']+", s["narration"]) if len(w) > 3 and w.lower() not in STOP][:4]
                t, params = "title", {"headline": " ".join(kw)[:60] or "..."}
                findings.append({"severity": "major", "stage": "storyboard", "scene": s["id"],
                                 "finding": f"no valid visual could be planned ({why[:120]}); used a keyword card"})
        scenes.append({"id": s["id"], "type": t, "params": params, "claim_ids": s["claim_ids"]})
    return scenes, findings
