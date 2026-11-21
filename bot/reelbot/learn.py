"""Learn from our own numbers: join YouTube Studio metrics with each Short's opening, rank them, and write
work/learnings.md. The script and hook stages read that file, so every new Short is steered by what actually held
viewers on this channel.

Metrics come from the CSVs Creator pulls from Studio (analytics/raw/<date>/block_money/metrics.csv, plus
retention_curves.csv when Studio has them). Point REELBOT_ANALYTICS_DIR at that folder.
"""
from __future__ import annotations

import csv
import json
import os
from pathlib import Path

from .config import BOT_DIR, CFG

LEARNINGS = BOT_DIR / "work" / "learnings.md"
MIN_VIEWS = 300  # below this the swipe rate is noise


def _analytics_dir() -> Path:
    return Path(os.environ.get("REELBOT_ANALYTICS_DIR", str(CFG.repo_root / "analytics" / "raw"))).expanduser()


def _num(v: str) -> float | None:
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def _latest_rows(channel: str) -> dict[str, dict]:
    """Newest metrics row per video, across all dated pulls."""
    rows: dict[str, dict] = {}
    base = _analytics_dir()
    for f in sorted(base.glob(f"*/{channel}/metrics.csv")):
        date = f.parent.parent.name
        curves = {}
        cf = f.parent / "retention_curves.csv"
        if cf.exists():
            curves = {r["video_id"]: r for r in csv.DictReader(cf.open(encoding="utf-8"))}
        for r in csv.DictReader(f.open(encoding="utf-8")):
            r["_date"] = date
            r["_curve"] = curves.get(r["video_id"], {})
            rows[r["video_id"]] = r
    return rows


def _opening(slug: str) -> tuple[str, str]:
    """(first spoken line, frame-0 hook text) for a slug, from wherever its folder lives."""
    for base in (CFG.shorts_dir, CFG.render_root.parent / "shorts", CFG.repo_root / "finance" / "shorts"):
        d = base / slug
        if not d.exists():
            continue
        line1 = ""
        if (d / "script.txt").exists():
            line1 = next((l.strip() for l in (d / "script.txt").read_text(encoding="utf-8").splitlines() if l.strip()), "")
        hook = ""
        if (d / "recipe.json").exists():
            try:
                hook = (json.loads((d / "recipe.json").read_text(encoding="utf-8")).get("hook") or {}).get("text", "")
            except json.JSONDecodeError:
                pass
        return line1, hook
    return "", ""


def build(channel: str = "block_money") -> str:
    rows = [r for r in _latest_rows(channel).values()
            if (_num(r.get("views")) or 0) >= MIN_VIEWS and _num(r.get("stayed_to_watch_pct")) is not None]
    if not rows:
        return ""
    rows.sort(key=lambda r: _num(r["stayed_to_watch_pct"]), reverse=True)
    lines = [f"# What held viewers on {channel} (from Studio pulls up to {max(r['_date'] for r in rows)})", "",
             "Ranked by stayed-to-watch % (the share who did not swipe away in the first seconds). "
             "Copy what the top ones share; avoid what the bottom ones share.", "",
             "| stayed % | avg % viewed | views | subs | length | title | frame-0 hook | first spoken line | retention t1/t3/t10 |",
             "|---|---|---|---|---|---|---|---|---|"]
    for r in rows:
        line1, hook = _opening(r["slug"])
        c = r["_curve"]
        curve = "/".join(c.get(k) or "-" for k in ("t1", "t3", "t10")) if c else "-"
        lines.append(f"| {r['stayed_to_watch_pct']} | {r.get('avg_pct_viewed', '')} | {r['views']} | {r.get('subs_gained', '')} | "
                     f"{r.get('length_s', '')}s | {r['title']} | {hook} | {line1} | {curve} |")
    top, bottom = rows[: max(1, len(rows) // 3)], rows[-max(1, len(rows) // 3):]
    avg = lambda rs: sum(_num(r["stayed_to_watch_pct"]) for r in rs) / len(rs)
    lines += ["", f"Top third averages {avg(top):.1f}% stayed; bottom third {avg(bottom):.1f}%. "
              "Goal: 70%+ stayed (that is when YouTube keeps pushing a Short past ~1K views)."]
    text = "\n".join(lines) + "\n"
    LEARNINGS.parent.mkdir(parents=True, exist_ok=True)
    LEARNINGS.write_text(text, encoding="utf-8")
    return text


def current() -> str:
    return LEARNINGS.read_text(encoding="utf-8") if LEARNINGS.exists() else ""
