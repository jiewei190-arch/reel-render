"""Daily scheduler: fill each channel's one slot for a local date exactly once, then produce the jobs with failure
isolation. A single scheduler lock prevents overlapping runs; the slots table's primary key (channel, local date)
makes duplicate slots impossible even if two schedulers start at the same instant.
"""
from __future__ import annotations

import json
import sqlite3
import time
from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

from . import db, pipeline
from .config import APP_DIR, cfg
from .util import now_utc, peak_rss_mb


def today_local() -> str:
    return datetime.now(ZoneInfo(cfg().runtime["timezone"])).date().isoformat()


def backlog() -> dict:
    p = APP_DIR / "config" / "backlog.json"
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else {}


def next_topic(c, channel_key: str) -> str:
    used = {r[0] for r in c.execute("SELECT topic FROM jobs WHERE channel_key=?", (channel_key,))}
    for t in backlog().get(channel_key, []):
        if t not in used:
            return t
    raise RuntimeError(f"backlog for {channel_key} is empty: add topics to config/backlog.json")


def fill_slots(local_date: str, fmt_overrides: dict | None = None) -> list[str]:
    """Create (or reuse) one job per channel for the date. Returns job ids. Safe to call any number of times."""
    c = db.connect()
    ids = []
    for key, p in cfg().profiles.items():
        fmt = (fmt_overrides or {}).get(key, p.raw.get("default_format", "short"))
        with db.tx(c):
            row = c.execute("SELECT * FROM slots WHERE channel_key=? AND local_publish_date=?", (key, local_date)).fetchone()
            if row:
                if row["format_kind"] != fmt:
                    # switching format replaces the slot's job instead of adding a sixth output for the day
                    old = row["job_id"]
                    st = c.execute("SELECT state FROM jobs WHERE job_id=?", (old,)).fetchone()["state"]
                    if st in ("uploading", "upload_unknown", "scheduled", "published"):
                        raise RuntimeError(f"{key} {local_date}: already {st}; can't switch format")
                    topic = c.execute("SELECT topic FROM jobs WHERE job_id=?", (old,)).fetchone()["topic"]
                    db.set_state(c, old, "cancelled", f"format switched to {fmt}")
                    new = pipeline.create_job(c, key, local_date, fmt, topic)
                    c.execute("UPDATE slots SET format_kind=?, job_id=? WHERE channel_key=? AND local_publish_date=?",
                              (fmt, new, key, local_date))
                    ids.append(new)
                else:
                    ids.append(row["job_id"])
                continue
            topic = next_topic(c, key)
            jid = pipeline.create_job(c, key, local_date, fmt, topic)
            try:
                c.execute("INSERT INTO slots (channel_key, local_publish_date, format_kind, job_id, created_utc) VALUES (?,?,?,?,?)",
                          (key, local_date, fmt, jid, now_utc()))
            except sqlite3.IntegrityError:
                raise  # cannot happen inside BEGIN IMMEDIATE; kept explicit
            ids.append(jid)
    n = c.execute("SELECT COUNT(*) FROM slots WHERE local_publish_date=?", (local_date,)).fetchone()[0]
    limit = cfg().data["production_target"]["total_daily_uploads"]
    if n > limit:
        raise RuntimeError(f"{n} slots for {local_date} exceeds the daily total of {limit}")
    return ids


def missed_dates(c, local_date: str) -> list[str]:
    """Catch up at most `catchup_days` missed days (never a flood after a week offline)."""
    n = int(cfg().runtime.get("catchup_days", 1))
    d = date.fromisoformat(local_date)
    out = []
    for k in range(n, 0, -1):
        prev = (d - timedelta(days=k)).isoformat()
        if not c.execute("SELECT 1 FROM slots WHERE local_publish_date=? LIMIT 1", (prev,)).fetchone():
            out.append(prev)
    return out


def daily(local_date: str | None = None, produce: bool = True, until: str = "qc", catchup: bool = False,
          fmt_overrides: dict | None = None, log=print) -> dict:
    c = db.connect()
    local_date = local_date or today_local()
    if not db.acquire(c, "scheduler", ttl=6 * 3600):
        log("another scheduler run holds the lock; nothing to do")
        return {"locked": True}
    try:
        dates = (missed_dates(c, local_date) if catchup else []) + [local_date]
        jobs = []
        for dte in dates:
            jobs += fill_slots(dte, fmt_overrides)
        log(f"slots for {', '.join(dates)}: {len(jobs)} job(s)")
        results = {}
        t0 = time.time()
        if produce:
            for jid in jobs:
                st = c.execute("SELECT state FROM jobs WHERE job_id=?", (jid,)).fetchone()["state"]
                if st in ("ready_for_release", "scheduled", "published", "cancelled"):
                    results[jid] = st
                    continue
                log(f"\n== {jid}")
                try:
                    results[jid] = pipeline.run_job(jid, until=until, log=log)
                except Exception as e:  # noqa: BLE001  (one channel's failure never stops the others)
                    db.set_state(c, jid, "blocked", f"{type(e).__name__}: {e}")
                    results[jid] = "blocked"
        peak = peak_rss_mb()
        secs = round(time.time() - t0, 1)
        c.execute("INSERT INTO batch_metrics (local_date, started_utc, seconds, peak_rss_mb, jobs, results) VALUES (?,?,?,?,?,?)",
                  (local_date, now_utc(), secs, round(peak, 1), db.jdump(jobs), db.jdump(results)))
        return {"date": local_date, "jobs": jobs, "results": results, "seconds": secs, "peak_rss_mb": round(peak, 1)}
    finally:
        db.release(c, "scheduler")
