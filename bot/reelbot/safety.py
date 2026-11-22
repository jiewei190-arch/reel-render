"""Voice-safety screen. ElevenLabs' abuse classifier reads only the text it is asked to speak. Out of context, a line
like "You owe five thousand. Pay the minimum..." reads as a debt collector or payment scam (it drew a policy warning on
Nov 22 2026). So every line is screened BEFORE it reaches ElevenLabs, and a flagged line is rewritten as narration
(third person, or a question) with the same facts. A line that still trips the screen is never voiced."""
from __future__ import annotations

import re

from . import claude

# Each pattern is the wording of a scam call, a phishing message or a debt demand spoken TO the listener.
PATTERNS = [
    (r"\byou(?:'ve| have)? (?:still )?owe[sd]?\b", "a debt demand spoken to the listener ('you owe')"),
    (r"(?:^|[.?!]\s+)(?:\[[^\]]*\]\s*)*(?:pay|send|wire|transfer|deposit)\b", "an order to pay or send money"),
    (r"\b(?:pay|send|wire|transfer)\b[^.?!]{0,40}\b(?:now|today|immediately|right away|within \w+ (?:hours|days))\b",
     "urgency to pay"),
    (r"\b(?:verify|confirm|update|unlock)\b[^.?!]{0,20}\byour (?:account|identity|card|password|pin|details|information)\b",
     "a phishing request"),
    (r"\byour (?:account|card)\b[^.?!]{0,25}\b(?:suspended|locked|frozen|closed|compromised|flagged)\b",
     "an account-threat message"),
    (r"(?:^|[.?!:]\s+|\byou\b[^.?!]{0,15})(?:pay|buy|send|get)\b[^.?!]{0,30}\b(?:gift cards?|bitcoin|crypto(?:currency)?)\b",
     "payment by gift card or crypto"),
    (r"\b(?:this is|i'?m calling from|we'?re calling from|calling from)\s+(?:your|the)\s+(?:bank|irs|police|fbi|social security|government)\b",
     "impersonating a bank or agency"),
    (r"\b(?:final notice|final warning|warrant for your arrest|you will be arrested|legal action against you)\b",
     "a threat"),
    (r"\b(?:click|tap) (?:the|this|that) link\b|\bsocial security number\b|\byou(?:'ve| have)? (?:just )?won\b|\bact now\b",
     "a phishing or prize-scam phrase"),
]
_RX = [(re.compile(p, re.I), why) for p, why in PATTERNS]

RULE = ("VOICE SAFETY (hard rule): the voice provider's abuse filter reads lines with no context. Never write a line "
        "that, read alone, sounds like a scam call, a phishing message or a debt collector: no 'you owe', no orders to "
        "pay/send/wire money, no 'verify/confirm your account', no 'your account is locked', no gift-card or crypto "
        "payment requests, no first-person impersonation of a bank, agency or company, no threats or 'act now'. "
        "Talk to the viewer with a question or a situation instead ('What if you only paid the minimum on five "
        "thousand?', 'Spender owes five thousand...'), and tell scam stories as narration ('He called pretending to "
        "be the bank') rather than quoting the scammer's script.")


def flags(line: str) -> list[str]:
    text = re.sub(r"\[[^\]]*\]\s*", "", line)  # audio tags don't change meaning
    return [why for rx, why in _RX if rx.search(text)]


def screen(lines: list[str]) -> dict[int, list[str]]:
    return {i: f for i, l in enumerate(lines) if (f := flags(l))}


REWRITE_SCHEMA = {"type": "object", "additionalProperties": False, "required": ["lines"],
                  "properties": {"lines": {"type": "array", "items": {"type": "string"}}}}


def fix(lines: list[str], voice_lines: list[str] | None, topic: str) -> tuple[list[str], list[str] | None, list[str]]:
    """Rewrite only the flagged lines (same facts and numbers, same length) and drop their audio tags. Returns the new
    lines, the new voice_lines and a log. Raises if a line still trips the screen, so it is never voiced."""
    bad = screen(lines)
    if not bad:
        return lines, voice_lines, []
    log = [f"line {i + 1}: {', '.join(w)}: {lines[i]}" for i, w in bad.items()]
    res = claude.ask_json(
        "You rewrite single narration lines for a short educational video so that, read with no context, they cannot "
        "be mistaken for a scam call, phishing or a debt demand. Keep every fact and number, keep it as short and "
        "punchy, and keep the meaning. " + RULE + " Return exactly one rewritten line per input line, in order.",
        f"Video topic: {topic}\n\nFull script for context:\n" + "\n".join(lines)
        + "\n\nRewrite ONLY these lines:\n" + "\n".join(f"{n + 1}. {lines[i]}  (problem: {', '.join(w)})"
                                                   for n, (i, w) in enumerate(bad.items())),
        REWRITE_SCHEMA, effort="medium")["lines"]
    out, vl = list(lines), (list(voice_lines) if voice_lines else None)
    for (i, _), new in zip(bad.items(), res):
        out[i] = new.strip()
        if vl and i < len(vl):
            vl[i] = out[i]  # a rewritten line is read plainly: no carried-over emotion tag
        log.append(f"  -> {out[i]}")
    still = screen(out)
    if still:
        raise SystemExit("voice safety: these lines still read like a scam or debt demand and will NOT be voiced:\n"
                         + "\n".join(f"  line {i + 1}: {out[i]} ({', '.join(w)})" for i, w in still.items()))
    return out, vl, log
