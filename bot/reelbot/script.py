"""Script stage: Gemini researches the topic, Claude writes the script, Gemini fact-checks it, Claude fixes what failed."""
from __future__ import annotations

import json
import re
from pathlib import Path

from . import claude, gemini
from .config import BOT_DIR, CFG

SCRIPT_SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "required": ["slug", "title", "style", "hook_text", "tag_text", "lines", "claims", "description", "sources"],
    "properties": {
        "slug": {"type": "string", "description": "lowercase-kebab-case, 2-5 words, unique to this topic"},
        "title": {"type": "string", "description": "YouTube title, <= 60 characters, no hashtags"},
        "style": {"type": "string", "enum": ["S1", "S2", "S3", "S4", "S5", "S6"]},
        "hook_text": {"type": "string"},
        "tag_text": {"type": "string"},
        "lines": {"type": "array", "items": {"type": "string"}},
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


def system_prompt(seconds: int) -> str:
    tmpl = (BOT_DIR / "prompts" / "blockmoney_script.md").read_text(encoding="utf-8")
    words = int(seconds * 2.45)
    return (tmpl.replace("{seconds}", str(seconds)).replace("{words}", str(words))
            .replace("{format_doc}", _doc("finance/FORMAT_V1.md"))
            .replace("{rules_doc}", _doc("finance/RULES.md")))


def _slugify(s: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
    return "-".join(s.split("-")[:5]) or "short"


def write(topic: str, *, seconds: int = 45, style: str | None = None, notes: str = "") -> dict:
    brief = "Channel: Block Money, finance Shorts with two blocky characters, Spender and Saver. US audience."
    print("  gemini: researching the topic (Google Search grounded)...")
    research, research_sources = gemini.research(topic, brief)

    user = (
        f"Topic: {topic}\n"
        + (f"Style to use: {style}\n" if style else "")
        + (f"Owner's notes: {notes}\n" if notes else "")
        + "\nResearch notes from a grounded web search (verify against these; prefer their figures):\n"
        + research
        + "\n\nResearch sources:\n" + "\n".join(f"- {s['title']}: {s['url']}" for s in research_sources)
        + "\n\nWrite the script. Put only real URLs from the research sources in `sources`."
    )
    print("  claude: writing the script...")
    data = claude.ask_json(system_prompt(seconds), user, SCRIPT_SCHEMA)
    data["slug"] = _slugify(data.get("slug") or topic)

    for rnd in range(CFG.factcheck_rounds):
        claims = [c["claim"] for c in data["claims"]]
        print(f"  gemini: fact-checking {len(claims)} claims (round {rnd + 1})...")
        verdicts, vsources = gemini.verify(claims)
        judge = claude.ask_json(
            "You decide whether a fact-check report clears a script. A claim passes only if its verdict is CORRECT, "
            "or NEEDS-HEDGE and the script already says it as an example/assumption. List each problem precisely.",
            "Script lines:\n" + "\n".join(data["lines"]) + "\n\nClaims:\n"
            + "\n".join(f"- {c['claim']} (basis: {c['basis']})" for c in data["claims"])
            + "\n\nFact-check report:\n" + verdicts,
            FIX_SCHEMA, effort="medium")
        data.setdefault("factcheck", []).append({"round": rnd + 1, "report": verdicts, "sources": vsources,
                                                 "all_pass": judge["all_pass"], "problems": judge["problems"]})
        if judge["all_pass"]:
            print("  fact-check: all claims pass")
            break
        print(f"  fact-check: {len(judge['problems'])} problem(s), revising:")
        for p in judge["problems"]:
            print("    -", p)
        data = {**claude.ask_json(
            system_prompt(seconds),
            "Here is your previous script as JSON:\n" + json.dumps({k: v for k, v in data.items() if k != "factcheck"}, indent=1)
            + "\n\nAn independent fact-check found these problems. Fix every one (correct the number, hedge it as an "
              "example, or remove the claim), keep the hook and structure if you can, and return the full script again:\n"
            + "\n".join(f"- {p}" for p in judge["problems"])
            + "\n\nFact-check report for reference:\n" + verdicts,
            SCRIPT_SCHEMA), "factcheck": data["factcheck"]}
        data["slug"] = _slugify(data["slug"])
    else:
        data["factcheck_unresolved"] = True
    data["topic"] = topic
    data["target_seconds"] = seconds
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
    for line in ("Educational only, not financial advice.", "Voice is synthetic."):
        if line not in desc:
            desc += "\n\n" + line if line.startswith("Educational") else "\n" + line
    (folder / "UPLOAD.md").write_text(
        f"# UPLOAD: {data['slug']}\n\nstyle: {data['style']}\n**Title:** {data['title']}\n\n**Description:**\n{desc}\n\n"
        "No tags or hashtags. Made for kids: No. Altered/AI: No.\n", encoding="utf-8")
