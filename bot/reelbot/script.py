"""Script stage: Gemini researches the topic, Claude writes the script, Gemini fact-checks it, Claude fixes what failed."""
from __future__ import annotations

import json
import re
from pathlib import Path

from . import channels, claude, gemini, hooks, learn
from .config import BOT_DIR, CFG

SCRIPT_SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "required": ["slug", "title", "style", "hook_text", "tag_text", "lines", "voice_lines", "claims", "description", "sources"],
    "properties": {
        "slug": {"type": "string", "description": "lowercase-kebab-case, 2-5 words, unique to this topic"},
        "title": {"type": "string", "description": "YouTube title, <= 60 characters, no hashtags"},
        "style": {"type": "string", "enum": ["S1", "S2", "S3", "S4", "S5", "S6"]},
        "hook_text": {"type": "string"},
        "tag_text": {"type": "string"},
        "lines": {"type": "array", "items": {"type": "string"}},
        "voice_lines": {"type": "array", "items": {"type": "string"},
                        "description": "the SAME lines, word for word, with ElevenLabs audio tags for emotion added"},
        "claims": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "required": ["claim", "basis"],
                "properties": {
                    "claim": {"type": "string", "description": "one checkable statement, with its number"},
                    "basis": {"type": "string", "description": "source name + year, or 'example assumption' + the arithmetic"},
                },
            },
        },
        "description": {"type": "string", "description": "YouTube description: 2-3 sentence summary + sources; NO hashtags"},
        "chapters": {"type": "array", "description": "long-form only (else empty): chapter title + the first words of its opening line",
                     "items": {"type": "object", "additionalProperties": False, "required": ["title", "starts_with"],
                               "properties": {"title": {"type": "string"}, "starts_with": {"type": "string"}}}},
        "thumbnail": {"type": "string", "description": "long-form only (else empty): the thumbnail image + <= 4 words"},
        "sources": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "required": ["title", "url"],
                "properties": {"title": {"type": "string"}, "url": {"type": "string"}},
            },
        },
    },
}

FIX_SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "required": ["all_pass", "problems"],
    "properties": {
        "all_pass": {"type": "boolean"},
        "problems": {"type": "array", "items": {"type": "string"}},
    },
}


def _doc(rel: str) -> str:
    p = CFG.repo_root / rel
    return p.read_text(encoding="utf-8") if p.exists() else "(not available on this machine)"


LONG = 120  # seconds; above this a script is a long-form video (landscape, chapters, mid-roll friendly)


def _length_rules(seconds: int) -> str:
    words = int(seconds * 2.45)
    if seconds <= LONG:
        return (f"- Target **{seconds} seconds** spoken (about {words} words), 8-12 lines.\n"
                "- The **last line leads straight back into line 1** so the Short loops.")
    return (f"- This is a LONG-FORM video: target **{seconds // 60} minutes** spoken (about {words} words), one line per "
            "sentence or two.\n"
            "- Structure: cold open (the most shocking moment, 20-40 s) -> the promise of what they'll learn -> 4-7 "
            "chapters, each with its own mini-cliffhanger -> the payoff -> a one-line takeaway. Fill `chapters` with a "
            "short title and the first words of the line that opens it.\n"
            "- Re-hook every 60-90 seconds (a new question, a reveal, 'but here's what nobody knew').\n"
            "- Give a `thumbnail` idea: one striking image + at most 4 words, that pays off something in the first minute.\n"
            "- Title promise must be delivered in the video; no clickbait the story doesn't back up.")


def system_prompt(seconds: int) -> str:
    ch = channels.active()
    tmpl = (BOT_DIR / "prompts" / ch.prompt).read_text(encoding="utf-8")
    words = int(seconds * 2.45)
    return (tmpl.replace("{seconds}", str(seconds)).replace("{words}", str(words))
            .replace("{format_doc}", _doc("finance/FORMAT_V1.md"))
            .replace("{rules_doc}", _doc("finance/RULES.md"))
            .replace("{channel_name}", ch.name).replace("{channel_doc}", channels.doc(ch))
            .replace("{hook_rules}", ch.hook_rules).replace("{length_rules}", _length_rules(seconds)))


def _schema() -> dict:
    s = json.loads(json.dumps(SCRIPT_SCHEMA))
    s["properties"]["style"]["enum"] = list(channels.active().styles)
    return s


def _slugify(s: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
    return "-".join(s.split("-")[:5]) or "short"


def write(topic: str, *, seconds: int = 45, style: str | None = None, notes: str = "", n_hooks: int = 6) -> dict:
    brief = "Channel: " + channels.active().brief
    print(f"  {gemini.label()}: researching the topic...")
    research, research_sources = gemini.research(topic, brief)

    best, ranked = (hooks.pick(topic, research, n_hooks) if n_hooks > 0 else (None, []))
    data = learn.current()
    user = (
        f"Topic: {topic}\n"
        + (f"Style to use: {style}\n" if style else "")
        + (f"Owner's notes: {notes}\n" if notes else "")
        + (f"\nOPENING (chosen by blind scoring, use it exactly): line 1 = \"{best['line1']}\"; "
           f"hook_text = \"{best['hook_text']}\"; frame 0 shows: {best['frame0']}\n" if best else "")
        + (f"\nOur channel's own retention data (write like the top rows, never like the bottom rows):\n{data}\n" if data else "")
        + "\nResearch notes from a grounded web search (verify against these; prefer their figures):\n"
        + research
        + "\n\nResearch sources:\n" + "\n".join(f"- {s['title']}: {s['url']}" for s in research_sources)
        + "\n\nWrite the script. Put only real URLs from the research sources in `sources`."
    )
    print("  claude: writing the script...")
    data = claude.ask_json(system_prompt(seconds), user, _schema())
    data["slug"] = _slugify(data.get("slug") or topic)

    cleared = False
    ledger: dict = {}  # claim -> verdict/reason; CORRECT verdicts carry over between rounds
    # N revision rounds, then one final check of the last revision (so a fix made in the last round can clear).
    for rnd in range(CFG.factcheck_rounds + 1):
        claims = [c["claim"] for c in data["claims"]]
        fresh = sum(1 for c in claims if ledger.get(gemini._key(c), {}).get("verdict") != "CORRECT")
        print(f"  {gemini.label()}: fact-checking {fresh} of {len(claims)} claims (round {rnd + 1}; "
              f"{len(claims) - fresh} already confirmed)...")
        cur, verdicts, vsources = gemini.verify_ledger(claims, ledger, research_sources)
        if fresh and not vsources:  # a fact-check without live sources can't clear anything
            data.setdefault("factcheck", []).append({"round": rnd + 1, "report": verdicts, "sources": [],
                                                     "all_pass": False, "problems": ["fact-check had no live sources"]})
            print("  fact-check: NO live sources were checked; not clearing this script")
            continue
        open_items = {k: e for k, e in cur.items() if e["verdict"] != "CORRECT"}
        if not open_items:
            judge = {"all_pass": True, "problems": []}
        else:
            judge = claude.ask_json(
                "You decide whether a fact-check report clears a script. A claim passes only if its verdict is CORRECT, "
                "or NEEDS-HEDGE and the script already says it as an example/assumption/'reportedly'. CORRECT verdicts "
                "are final: never list them as problems. List each remaining problem precisely, naming the claim.",
                "Script lines:\n" + "\n".join(data["lines"]) + "\n\nClaims:\n"
                + "\n".join(f"- {c['claim']} (basis: {c['basis']})" for c in data["claims"])
                + "\n\nFact-check report:\n" + verdicts,
                FIX_SCHEMA, effort="medium")
        data.setdefault("factcheck", []).append({"round": rnd + 1, "report": verdicts, "sources": vsources,
                                                 "all_pass": judge["all_pass"], "problems": judge["problems"]})
        if judge["all_pass"]:
            print("  fact-check: all claims pass")
            cleared = True
            break
        if rnd == CFG.factcheck_rounds:  # final check of the last revision: report, don't rewrite again
            print(f"  fact-check: {len(judge['problems'])} problem(s) remain after the final check:")
            for p in judge["problems"]:
                print("    -", p)
            break
        print(f"  fact-check: {len(judge['problems'])} problem(s), revising:")
        for p in judge["problems"]:
            print("    -", p)
        confirmed = [e["claim"] for e in cur.values() if e["verdict"] == "CORRECT"]
        data = {**claude.ask_json(
            system_prompt(seconds),
            "Here is your previous script as JSON:\n" + json.dumps({k: v for k, v in data.items() if k != "factcheck"}, indent=1)
            + "\n\nAn independent fact-check found these problems. Fix every one:\n"
              "- WRONG: correct it to what the source says.\n"
              "- UNSUPPORTED: CUT that specific detail (exact figure, quote, calculation) or replace it with one a "
              "confirmed claim already supports. Do not just add 'reportedly' to something nobody could find.\n"
              "- NEEDS-HEDGE: say it as reported/estimated/an example.\n"
              "Fewer, solid claims beat many shaky ones. Keep the CONFIRMED claims below word for word (same `claim` "
              "text) so they don't need re-checking. Keep line 1 and the hook_text unless a problem is in them, keep "
              "the structure and length, and return the full script again.\n\nProblems:\n"
            + "\n".join(f"- {p}" for p in judge["problems"])
            + "\n\nCONFIRMED claims (keep exactly):\n" + "\n".join(f"- {c}" for c in confirmed)
            + "\n\nFact-check report for reference:\n" + verdicts,
            _schema()), "factcheck": data["factcheck"]}
        data["slug"] = _slugify(data["slug"])
    if not cleared:
        data["factcheck_unresolved"] = True
    data["topic"] = topic
    data["channel"] = channels.active().id
    data["target_seconds"] = seconds
    data["format"] = "landscape" if seconds > LONG else "portrait"
    data["hook_candidates"] = ranked
    return data


def save(data: dict, folder: Path) -> None:
    folder.mkdir(parents=True, exist_ok=True)
    (folder / "script.json").write_text(json.dumps(data, indent=1, ensure_ascii=False), encoding="utf-8")
    (folder / "script.txt").write_text("\n".join(data["lines"]) + "\n", encoding="utf-8")
    src = "\n".join(f"- {s['title']}: {s['url']}" for s in data.get("sources", []))
    claims = "\n".join(f"- {c['claim']}  _(basis: {c['basis']})_" for c in data.get("claims", []))
    last = (data.get("factcheck") or [{}])[-1]
    (folder / "sources.md").write_text(
        f"# Sources and claims: {data['slug']}\n\n## Claims\n{claims}\n\n## Sources\n{src}\n\n"
        f"## Last fact-check ({'PASS' if last.get('all_pass') else 'NOT CLEARED'})\n{last.get('report', '')}\n",
        encoding="utf-8")
    desc = data["description"].rstrip()
    ch = channels.get(data.get("channel"))
    if data.get("chapters"):
        desc += "\n\nChapters: see chapters.txt after the render (YouTube needs real timestamps)."
    for i, line in enumerate(ch.disclaimers):
        if line not in desc:
            desc += ("\n\n" if i == 0 else "\n") + line
    if ch.about and ch.about not in desc:
        desc += "\n\n" + ch.about
    thumb = f"\n**Thumbnail idea:** {data['thumbnail']}\n" if data.get("thumbnail") else ""
    (folder / "UPLOAD.md").write_text(
        f"# UPLOAD: {data['slug']}\n\nchannel: {ch.name}\nstyle: {data['style']}\n**Title:** {data['title']}\n{thumb}\n**Description:**\n{desc}\n\n"
        "No tags or hashtags. Made for kids: No. Altered/AI: No. In Studio, REPLACE the pre-filled default description with the full text above (it already ends with the channel pitch).\n", encoding="utf-8")
