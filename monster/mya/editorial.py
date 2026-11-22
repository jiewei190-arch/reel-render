"""Editorial: outline -> narration (display text) per scene, citing claim ids. Deterministic checks decide whether a
draft is usable: length band, no number on screen or in narration that the cited claims don't contain, a real hook.
"""
from __future__ import annotations

import json
import re

from . import llm, speech
from .config import cfg
from .research import numbers



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
        "Rules: every scene must restate ONLY what its cited claims say, and cite their ids in claim_ids. Do not invent "
        "numbers, dates, names, quotes or outcomes; if the claims don't say who won or what happened, don't say it. Scene 1 is the hook: the most surprising fact in one short sentence, no "
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
    if fmt != "_line":
        lo, _, hi = target_words(profile, fmt)
        words = sum(speech.word_count(s["narration"]) for s in script["scenes"])
        # floor = enough words for the format's minimum duration (+15%); the measured narration enforces the real range
        f = cfg().formats[fmt]
        floor = int(f["min_seconds"] * 2.25 * float(profile.raw.get("speed", 1.0)) * 1.15)
        if words < floor or words > hi * 1.1:
            problems.append(f"length: {words} spoken words, needs {floor}-{int(hi * 1.1)}")
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
    first = script["scenes"][0]["narration"].lower() if script["scenes"] else ""
    if re.match(r"^(hi|hey|hello|welcome|today|in this video)", first):
        problems.append("scene 1 is a greeting, not a hook")
    return problems


ROLE_ORDER = {"hook": 0, "context": 1, "number": 2, "twist": 3, "outcome": 4, "aftermath": 5}
LINE_SCHEMA = {
    "type": "object", "additionalProperties": False, "required": ["narration", "visual_intent"],
    "properties": {"narration": {"type": "string", "minLength": 8, "maxLength": 200},
                   "visual_intent": {"type": "string", "maxLength": 160}},
}
META_SCHEMA = {
    "type": "object", "additionalProperties": False,
    "required": ["title", "audience_question", "promise", "originality_note", "description"],
    "properties": {k: {"type": "string", "minLength": 5, "maxLength": 300} for k in
                   ("title", "audience_question", "promise", "originality_note", "description")},
}


def _line(profile, claim: dict, position: str, prev: str, lessons: str, fix: str = "") -> dict:
    return llm.ask(
        f"You write one line of narration for '{profile.working_name}' ({profile.niche}). Tone: {profile.tone}. "
        "Restate ONLY what the SOURCE sentence says, in plain spoken English, at most 24 words. Keep its names, "
        "numbers and dates exactly. Never add who won, what happened next, or anything else not in the sentence."
        + (" This is the HOOK: open with the most surprising part, no greeting." if position == "hook" else ""),
        f"SOURCE: {claim['passage']}\nPrevious line: {prev or '(none, this is the first line)'}\n{lessons}"
        + (f"\nYour last version was rejected: {fix}" if fix else ""),
        LINE_SCHEMA, temperature=0.3, max_tokens=160)


def write(topic: str, profile, fmt: str, claims: list[dict], lessons: str = "", feedback: str = "") -> tuple[dict, list[str]]:
    """One scene per source sentence (hook first, outcome last). A narrow task per call keeps small local models
    from drifting; every line is then fact-checked against its own sentence and rewritten (bounded) if it fails."""
    ordered = sorted([c for c in claims if c["status"] == "verified"], key=lambda c: (ROLE_ORDER.get(c.get("role"), 2), c["id"]))
    if fmt == "short":
        ordered = ordered[:11]
    scenes, prev = [], ""
    for k, cl in enumerate(ordered):
        # the first line that passes becomes the hook, even if an earlier candidate failed its check
        pos = "hook" if not scenes else "end" if k == len(ordered) - 1 else "middle"
        line, fix = None, ""
        for _ in range(cfg().runtime.get("max_regenerations_per_stage", 2) + 1):
            cand = _line(profile, cl, pos, prev, lessons, fix)
            sc = {"narration": cand["narration"].strip(), "claim_ids": [cl["id"]], "visual_intent": cand["visual_intent"]}
            probs = check({"scenes": [sc]}, claims, profile, "_line") + support_check({"scenes": [sc]}, claims)
            if not probs:
                line = sc
                break
            fix = "; ".join(probs)
        if line:
            scenes.append(line)
            prev = line["narration"]
    script = {"scenes": scenes}
    if len(scenes) >= 3:
        meta = llm.ask(
            f"Write the YouTube metadata for this '{profile.working_name}' video. Title: under 60 characters, specific, "
            "no clickbait the script doesn't deliver, no hashtags. Description: 2 sentences.",
            "Script:\n" + "\n".join(s["narration"] for s in scenes), META_SCHEMA, temperature=0.4, max_tokens=400)
        script.update(meta)
    script = tighten(script, profile, fmt)
    problems = check(script, claims, profile, fmt) if len(scenes) >= 3 else ["fewer than 3 lines passed the fact check"]
    for i, s in enumerate(script["scenes"], 1):
        s["id"] = f"sc{i:02d}"
    return script, problems

def tighten(script: dict, profile, fmt: str) -> dict:
    """Small models are poor at hitting a word count but good at choosing. If a draft is long, the model picks which
    scenes to keep (hook and payoff always stay); nothing is rewritten or cut mid-sentence."""
    lo, mid, hi = target_words(profile, fmt)
    sc = script["scenes"]
    words = [speech.word_count(s["narration"]) for s in sc]
    if sum(words) <= hi:
        return script
    listing = "\n".join(f"[{i}] ({w} words) {s['narration']}" for i, (s, w) in enumerate(zip(sc, words)))
    res = llm.ask(
        "You are an editor cutting a video script to length. Keep the hook (first scene), the payoff (last scene) and "
        "the scenes the story needs to make sense. Drop repetition and side details.",
        f"Total must be at most {hi} words (aim for {mid}). Scenes:\n{listing}\n\nReturn the indices to KEEP, in order.",
        {"type": "object", "additionalProperties": False, "required": ["keep"],
         "properties": {"keep": {"type": "array", "minItems": 3, "maxItems": len(sc),
                                 "items": {"type": "integer", "minimum": 0, "maximum": len(sc) - 1}}}},
        temperature=0.1, max_tokens=120)
    keep = sorted(set(res["keep"]) | {0, len(sc) - 1})
    # if still long, drop the lowest-information middle scenes deterministically (longest first) until it fits
    while sum(words[i] for i in keep) > hi and len(keep) > 3:
        mids = [i for i in keep if i not in (0, len(sc) - 1)]
        keep.remove(max(mids, key=lambda i: words[i]))
    return {**script, "scenes": [sc[i] for i in keep], "tightened": True}


SUPPORT_SCHEMA = {
    "type": "object", "additionalProperties": False, "required": ["verdict", "evidence"],
    "properties": {"verdict": {"enum": ["supported", "contradicted", "not_in_sources"]},
                   "evidence": {"type": "string", "description": "the exact words from the sources that support the line"}},
}


def _norm(t: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9$%. ]", " ", t.lower())).strip()


FUNC = set("""a an the of to in on at for and or but is was were be been being by with as it its this that these those from
his her their they he she him them we you your our than then so not no had has have do did does into over after before about
also later initially which who whom what when where while there here very one can could would will said says""".split())


def _stem(w: str) -> str:
    for suf in ("ings", "ing", "ied", "ies", "ed", "es", "s", "ly"):
        if w.endswith(suf) and len(w) - len(suf) >= 3:
            return w[: -len(suf)]
    return w


def novel_words(line: str, passages: list[str]) -> list[str]:
    """Content words in the line that don't appear (by stem) in its cited passages."""
    src = {_stem(w) for w in re.findall(r"[a-z]+", " ".join(passages).lower())}
    out = []
    for w in re.findall(r"[a-z]+", line.lower()):
        if w in FUNC or len(w) < 3:
            continue
        if _stem(w) not in src and w not in src:
            out.append(w)
    return out


def support_check(script: dict, claims: list[dict], judge: bool = True) -> list[str]:
    """Rule first: a line may only use words from its cited source sentences (at most 2 new content words) and the
    same numbers (checked in check()). Then a model may veto a clear contradiction; its 'not in sources' opinion is
    ignored because small local models flag true paraphrases."""
    by_id = {c["id"]: c for c in claims}
    problems = []
    for i, s in enumerate(script["scenes"], 1):
        cited = [by_id[c]["passage"] for c in s["claim_ids"] if c in by_id]
        if not cited:
            if re.search(r"\d", s["narration"]):
                problems.append(f"scene {i} states facts but cites no claim")
            continue
        new = novel_words(s["narration"], cited)
        if len(new) > 2:
            problems.append(f"scene {i} adds words its source doesn't support {sorted(set(new))[:6]}: '{s['narration'][:80]}'")
            continue
        if judge:
            src = "\n".join(f"- {p}" for p in cited)
            res = llm.ask(
                "You are a strict fact-checker. Answer 'contradicted' only if the LINE conflicts with the SOURCES (wrong "
                "winner, wrong amount, wrong outcome, wrong date); otherwise 'supported'. Quote the supporting words.",
                f"SOURCES:\n{src}\n\nLINE: {s['narration']}", SUPPORT_SCHEMA, temperature=0.0, max_tokens=200)
            if res["verdict"] == "contradicted":
                problems.append(f"scene {i} contradicts its source: '{s['narration'][:90]}'")
    return problems
