"""Daily scheduler: fill each channel's scheduled slots for a local date exactly once, then produce the jobs with failure
isolation. A single scheduler lock prevents overlapping runs; the slots table's primary key (channel, local date, slot number)
makes duplicate slots impossible even if two schedulers start at the same instant.
"""
from __future__ import annotations

import json
import re
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


WEEKDAY = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]


def slots_for(profile, local_date: str) -> list[tuple[int, dict]]:
    """The channel's schedule slots that apply on this date: [(slot_no, slot)]."""
    wd = WEEKDAY[date.fromisoformat(local_date).weekday()]
    return [(i, s) for i, s in enumerate(profile.raw["schedule"]["slots"]) if not s.get("weekdays") or wd in s["weekdays"]]


def expected_total(local_date: str) -> int:
    return sum(len(slots_for(p, local_date)) for p in cfg().profiles.values())


def fill_slots(local_date: str, fmt_overrides: dict | None = None) -> list[str]:
    """Create (or reuse) one job per scheduled slot for the date. Returns job ids. Safe to call any number of times,
    from any number of processes: (channel, date, slot_no) is the primary key. fmt_overrides: {"law": "long"} or
    {"law#1": "short"} switches a slot's format without adding an upload."""
    c = db.connect()
    ids = []
    for key, p in cfg().profiles.items():
        for slot_no, sl in slots_for(p, local_date):
            fmt = (fmt_overrides or {}).get(f"{key}#{slot_no}") or ((fmt_overrides or {}).get(key) if slot_no == 0 else None) or sl["format"]
            with db.tx(c):
                row = c.execute("SELECT * FROM slots WHERE channel_key=? AND local_publish_date=? AND slot_no=?",
                                (key, local_date, slot_no)).fetchone()
                if row:
                    if row["format_kind"] != fmt:
                        old = row["job_id"]
                        st = c.execute("SELECT state FROM jobs WHERE job_id=?", (old,)).fetchone()["state"]
                        if st in ("uploading", "upload_unknown", "scheduled", "published"):
                            raise RuntimeError(f"{key} {local_date} slot {slot_no}: already {st}; can't switch format")
                        topic = c.execute("SELECT topic FROM jobs WHERE job_id=?", (old,)).fetchone()["topic"]
                        db.set_state(c, old, "cancelled", f"format switched to {fmt}")
                        new = pipeline.create_job(c, key, local_date, fmt, topic, sl["time"])
                        c.execute("UPDATE slots SET format_kind=?, job_id=? WHERE channel_key=? AND local_publish_date=? AND slot_no=?",
                                  (fmt, new, key, local_date, slot_no))
                        ids.append(new)
                    else:
                        ids.append(row["job_id"])
                    continue
                topic = next_topic(c, key)
                jid = pipeline.create_job(c, key, local_date, fmt, topic, sl["time"])
                c.execute("INSERT INTO slots (channel_key, local_publish_date, slot_no, format_kind, job_id, publish_time_local, "
                          "created_utc) VALUES (?,?,?,?,?,?,?)", (key, local_date, slot_no, fmt, jid, sl["time"], now_utc()))
                ids.append(jid)
    n = c.execute("SELECT COUNT(*) FROM slots WHERE local_publish_date=?", (local_date,)).fetchone()[0]
    limit = expected_total(local_date)
    if n > limit:
        raise RuntimeError(f"{n} slots for {local_date} exceeds the schedule's {limit} uploads that day")
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
                ch = c.execute("SELECT channel_key, topic FROM jobs WHERE job_id=?", (jid,)).fetchone()
                prod = cfg().profile(ch["channel_key"]).raw.get("producer", {"kind": "local"})
                if prod.get("kind") == "external":
                    results[jid] = handoff(c, jid, ch["topic"], prod, log)
                    continue
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


def handoff(c, job_id: str, topic: str, prod: dict, log=print) -> str:
    """Channels produced by reelbot (3D engines, Claude writing, ElevenLabs voices). The automator records the exact
    command, and when runtime.run_handoffs is true it runs reelbot itself and tracks the result. That spends the
    owner's API and ElevenLabs credits, so it is off until the owner turns it on."""
    import subprocess
    import sys
    from .config import APP_DIR
    from .util import write_json_atomic
    fmt = c.execute("SELECT format_kind FROM jobs WHERE job_id=?", (job_id,)).fetchone()[0]
    cmd = prod["command"].replace("{topic}", topic.replace('"', "'")).replace("{long_flag}", " --long" if fmt == "long" else "")
    d = pipeline.job_dir(job_id)
    rec = {"producer": prod["name"], "command": cmd, "workdir": prod.get("workdir"), "utc": now_utc()}
    write_json_atomic(d / "handoff.json", rec)
    rt = cfg().runtime
    if not rt.get("run_handoffs"):
        db.set_state(c, job_id, "external_production", f"produced by {prod['name']}: {cmd}")
        log(f"  handed off to {prod['name']} (not run: runtime.run_handoffs is false)")
        return "external_production"
    workdir = APP_DIR.parent / (prod.get("workdir") or "bot")
    py = rt.get("reelbot_python") or next((str(p) for p in (workdir / ".venv" / "Scripts" / "python.exe", workdir / ".venv" / "bin" / "python")
                                           if p.exists()), sys.executable)
    argv = [py, "-m", "reelbot", "make", topic, "--channel", prod.get("reelbot_channel", ""), "--auto"] + (["--long"] if fmt == "long" else [])
    db.set_state(c, job_id, "external_production", f"running reelbot: {' '.join(argv[2:])}")
    log(f"  running reelbot for {job_id}...")
    env = {k: v for k, v in __import__("os").environ.items() if not k.startswith("MYA_")}
    try:
        r = subprocess.run(argv, cwd=workdir, capture_output=True, text=True, encoding="utf-8", errors="replace", env=env,
                           timeout=int(float(rt.get("handoff_timeout_hours", 4)) * 3600))
        out = (r.stdout or "") + (r.stderr or "")
    except subprocess.TimeoutExpired as e:
        r, out = None, f"timed out after {rt.get('handoff_timeout_hours', 4)} h: {e}"
    (d / "handoff.log").write_text(out, encoding="utf-8")
    done = re.findall(r"DONE:\s*(.+?\.mp4)", out)
    cost = re.findall(r"cost so far: (.+)", out)
    rec.update({"exit": None if r is None else r.returncode, "video": done[-1].strip() if done else None,
                "cost": cost[-1] if cost else None, "finished_utc": now_utc()})
    write_json_atomic(d / "handoff.json", rec)
    if r is not None and r.returncode == 0 and done:
        db.set_state(c, job_id, "ready_for_review", f"reelbot made {rec['video']}")
        log(f"  reelbot done: {rec['video']}  ({rec['cost']})")
        return "ready_for_review"
    tail = out.strip().splitlines()[-3:] if out.strip() else ["no output"]
    db.set_state(c, job_id, "blocked", "reelbot failed: " + " | ".join(tail)[:400])
    log(f"  reelbot FAILED (see {d / 'handoff.log'})")
    return "blocked"
