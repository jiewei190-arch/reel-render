"""Specific, evidence-backed lessons: symptom, root cause, fix, regression check, evidence. A lesson is 'proposed' until
its regression check has passed; only then is it 'verified'. Relevant lessons are retrieved into later prompts."""
from __future__ import annotations

import json
import re

from . import db
from .config import home
from .util import now_utc


def add(channel_key: str | None, stage: str, symptom: str, root_cause: str, fix: str, regression_check: str,
        evidence: str, verified: bool) -> int:
    c = db.connect()
    kw = " ".join(sorted(set(re.findall(r"[a-z]{4,}", f"{symptom} {root_cause} {fix}".lower()))))
    cur = c.execute("INSERT INTO lessons (channel_key, stage, symptom, root_cause, fix, regression_check, evidence, status, "
                    "keywords, created_utc) VALUES (?,?,?,?,?,?,?,?,?,?)",
                    (channel_key, stage, symptom, root_cause, fix, regression_check, evidence,
                     "verified" if verified else "proposed", kw, now_utc()))
    with open(home() / "lessons.jsonl", "a", encoding="utf-8") as f:
        f.write(json.dumps({"id": cur.lastrowid, "channel_key": channel_key, "stage": stage, "symptom": symptom,
                            "root_cause": root_cause, "fix": fix, "regression_check": regression_check,
                            "evidence": evidence, "status": "verified" if verified else "proposed"}) + "\n")
    return cur.lastrowid


def relevant(channel_key: str, stage: str, text: str = "", limit: int = 4) -> list[dict]:
    c = db.connect()
    rows = c.execute("SELECT * FROM lessons WHERE (channel_key IS NULL OR channel_key=?) AND stage=? ORDER BY id DESC",
                     (channel_key, stage)).fetchall()
    words = set(re.findall(r"[a-z]{4,}", text.lower()))
    scored = sorted(rows, key=lambda r: (r["status"] == "verified", len(words & set((r["keywords"] or "").split()))), reverse=True)
    return [dict(r) for r in scored[:limit]]


def prompt_block(channel_key: str, stage: str, text: str = "") -> str:
    ls = relevant(channel_key, stage, text)
    if not ls:
        return ""
    return "Lessons from earlier jobs (apply them):\n" + "\n".join(
        f"- [{l['status']}] {l['symptom']} -> fix: {l['fix']}" for l in ls)
