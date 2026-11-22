"""Real channel performance only. Sources: (1) YouTube Studio CSV exports already pulled into analytics/raw/<date>/<
folder>/metrics.csv, (2) the YouTube Analytics API once the channel is authorized. Nothing is estimated or invented;
Shorts and long videos are kept apart, and a channel needs enough videos before any pattern is reported.
"""
from __future__ import annotations

import csv
import os
from pathlib import Path

from . import db
from .config import APP_DIR, cfg
from .util import now_utc

FOLDERS = {"block_money": ["block_money", "block-money"], "justin_clips": ["justin", "justin-clips", "justin_clips"],
           "law": ["law"], "biz": ["biz"], "cyber": ["cyber"]}
MIN_VIDEOS = 8
# Compare a video only with the channel's own videos of the same format at the same age (playbook rule).
AGES = {"48h": (1, 3), "7d": (5, 10), "28d": (21, 35)}   # label -> accepted age window in days
MIN_COHORT = 3   # fewer comparable videos at an age = "insufficient data", no verdict


def raw_dir() -> Path:
    return Path(os.environ.get("MYA_ANALYTICS_DIR", APP_DIR.parent / "analytics" / "raw"))


def import_csv(channel_key: str) -> int:
    c = db.connect()
    n = 0
    for folder in FOLDERS.get(channel_key, [channel_key]):
        for f in sorted(raw_dir().glob(f"*/{folder}/metrics.csv")):
            for row in csv.DictReader(open(f, encoding="utf-8")):
                ref = row.get("video_id") or row.get("slug") or row.get("title")
                if not ref:
                    continue
                length = float(row.get("length_s") or 0)
                fmt = "short" if 0 < length <= 60 else ("long" if length > 60 else "unknown")
                c.execute("INSERT OR REPLACE INTO analytics (channel_key, video_ref, metric_date, format_kind, metrics, source) "
                          "VALUES (?,?,?,?,?,?)", (channel_key, ref, f.parent.parent.name, fmt, db.jdump(row), f"studio csv {f.parent.parent.name}"))
                n += 1
    return n


def report(channel_key: str) -> str:
    import json
    cfg().profile(channel_key)
    imported = import_csv(channel_key)
    c = db.connect()
    rows = c.execute("SELECT * FROM analytics WHERE channel_key=? ORDER BY metric_date", (channel_key,)).fetchall()
    latest = {}
    for r in rows:
        latest[r["video_ref"]] = r
    if not latest:
        return (f"{channel_key}: no performance data yet. Nothing is estimated. Data arrives from Studio CSV pulls "
                f"(analytics/raw/<date>/<channel>/metrics.csv) or the YouTube Analytics API once this channel is authorized.")
    lines = [f"{channel_key}: {len(latest)} video(s) with real data ({imported} rows read {now_utc()})"]
    for fmt in ("short", "long", "unknown"):
        vids = [json.loads(r["metrics"]) | {"_date": r["metric_date"]} for r in latest.values() if r["format_kind"] == fmt]
        if not vids:
            continue
        key = "stayed_to_watch_pct" if fmt == "short" else "avg_pct_viewed"
        vids.sort(key=lambda m: float(m.get(key) or 0), reverse=True)
        lines.append(f"\n{fmt}: {len(vids)} video(s), ranked by {key}")
        for m in vids:
            lines.append(f"  {m.get(key, '-'):>6}  views {m.get('views', '-'):>6}  {m.get('title', '')[:60]}  ({m['_date']})")
        if len(vids) < MIN_VIDEOS:
            lines.append(f"  (fewer than {MIN_VIDEOS} videos: no pattern is drawn yet)")
    return "\n".join(lines)


def _age_days(m: dict, metric_date: str) -> int | None:
    from datetime import date
    try:
        return (date.fromisoformat(metric_date[:10]) - date.fromisoformat(str(m.get("published", ""))[:10])).days
    except ValueError:
        return None


def _median(xs: list[float]) -> float:
    xs = sorted(xs)
    n = len(xs)
    return xs[n // 2] if n % 2 else (xs[n // 2 - 1] + xs[n // 2]) / 2


def cohorts(channel_key: str) -> str:
    """Each video at 48 h / 7 d / 28 d against the channel's median at the same age and format.
    Shorts: stayed-to-watch %, avg % viewed, views. Long: avg % viewed, watch hours, views."""
    import json
    cfg().profile(channel_key)
    import_csv(channel_key)
    c = db.connect()
    rows = c.execute("SELECT * FROM analytics WHERE channel_key=?", (channel_key,)).fetchall()
    out = [f"{channel_key}: same-age comparison (each video vs this channel's own median at that age)"]
    any_data = False
    for fmt, keys in (("short", ("stayed_to_watch_pct", "avg_pct_viewed", "views")),
                      ("long", ("avg_pct_viewed", "watch_time_h", "views"))):
        for label, (lo, hi) in AGES.items():
            mid = (lo + hi) / 2
            best: dict = {}  # video -> (distance from the target age, metrics)
            for r in rows:
                if r["format_kind"] != fmt:
                    continue
                m = json.loads(r["metrics"])
                age = _age_days(m, r["metric_date"])
                if age is None or not lo <= age <= hi:
                    continue
                d = abs(age - mid)
                if r["video_ref"] not in best or d < best[r["video_ref"]][0]:
                    best[r["video_ref"]] = (d, m)
            if not best:
                continue
            any_data = True
            vids = [m for _, m in best.values()]
            out.append(f"\n{fmt} at {label} ({len(vids)} video(s) pulled at {lo}-{hi} days old)")
            if len(vids) < MIN_COHORT:
                out.append(f"  insufficient data: fewer than {MIN_COHORT} comparable videos at this age")
                continue
            for k in keys:
                vals = [float(m[k]) for m in vids if str(m.get(k, "")).strip() not in ("", "-")]
                if len(vals) < MIN_COHORT:
                    continue
                med = _median(vals)
                above = [m for m in vids if str(m.get(k, "")).strip() not in ("", "-") and float(m[k]) > med]
                out.append(f"  {k}: median {med:g}; above median: "
                           + (", ".join(f"{m.get('slug') or m.get('title', '')[:30]} ({float(m[k]):g})" for m in above) or "none"))
    if not any_data:
        out.append("  no pulls at 1-3, 5-10 or 21-35 days old yet. Pull Studio metrics at 48 h, 7 d and 28 d after publishing.")
    out.append("\nRule: expand a style only after 3+ comparable videos in it, 2+ of them beating the median on the main "
               "metric (Shorts: stayed-to-watch; long: avg % viewed), and the next-step signal (subs, returning viewers) holds.")
    return "\n".join(out)
