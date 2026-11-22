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
