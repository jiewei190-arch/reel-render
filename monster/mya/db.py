"""SQLite state: jobs, daily slots, stage runs (with input hashes and leases), assets, lessons, releases, metrics."""
from __future__ import annotations

import json
import os
import socket
import sqlite3
import time
import uuid
from contextlib import contextmanager
from pathlib import Path

from .config import home
from .util import now_utc

SCHEMA = """
CREATE TABLE IF NOT EXISTS jobs (
  job_id TEXT PRIMARY KEY, channel_key TEXT NOT NULL, local_publish_date TEXT NOT NULL, format_kind TEXT NOT NULL,
  topic TEXT NOT NULL, state TEXT NOT NULL, fiction INTEGER DEFAULT 0, publish_at_utc TEXT, error TEXT,
  created_utc TEXT NOT NULL, updated_utc TEXT NOT NULL, remote_video_id TEXT
);
-- One output per channel per local day; the format is a column, so switching Short <-> long never adds a sixth job.
CREATE TABLE IF NOT EXISTS slots (
  channel_key TEXT NOT NULL, local_publish_date TEXT NOT NULL, format_kind TEXT NOT NULL, job_id TEXT NOT NULL,
  created_utc TEXT NOT NULL, PRIMARY KEY (channel_key, local_publish_date)
);
CREATE TABLE IF NOT EXISTS stage_runs (
  job_id TEXT NOT NULL, stage TEXT NOT NULL, status TEXT NOT NULL, input_hash TEXT, outputs TEXT, attempts INTEGER DEFAULT 0,
  lease_owner TEXT, lease_expires REAL, started_utc TEXT, finished_utc TEXT, seconds REAL, error TEXT, detail TEXT,
  PRIMARY KEY (job_id, stage)
);
CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, job_id TEXT, ts_utc TEXT, kind TEXT, message TEXT);
CREATE TABLE IF NOT EXISTS locks (name TEXT PRIMARY KEY, owner TEXT, expires REAL);
CREATE TABLE IF NOT EXISTS lessons (
  id INTEGER PRIMARY KEY AUTOINCREMENT, channel_key TEXT, stage TEXT, symptom TEXT, root_cause TEXT, fix TEXT,
  regression_check TEXT, evidence TEXT, status TEXT, keywords TEXT, created_utc TEXT
);
CREATE TABLE IF NOT EXISTS releases (
  job_id TEXT PRIMARY KEY, channel_key TEXT, state TEXT, session_url TEXT, remote_video_id TEXT, privacy TEXT,
  request TEXT, response TEXT, updated_utc TEXT
);
CREATE TABLE IF NOT EXISTS batch_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT, local_date TEXT, started_utc TEXT, seconds REAL, peak_rss_mb REAL,
  jobs TEXT, results TEXT
);
CREATE TABLE IF NOT EXISTS analytics (
  channel_key TEXT, video_ref TEXT, metric_date TEXT, format_kind TEXT, metrics TEXT, source TEXT,
  PRIMARY KEY (channel_key, video_ref, metric_date)
);
"""

WORKER_ID = f"{socket.gethostname()}:{os.getpid()}:{uuid.uuid4().hex[:6]}"


def path() -> Path:
    return home() / "mya.db"


def connect() -> sqlite3.Connection:
    c = sqlite3.connect(path(), timeout=30, isolation_level=None)
    c.row_factory = sqlite3.Row
    c.execute("PRAGMA journal_mode=WAL")
    c.execute("PRAGMA busy_timeout=30000")
    c.executescript(SCHEMA)
    return c


@contextmanager
def tx(c: sqlite3.Connection):
    """BEGIN IMMEDIATE: one writer at a time, so slot creation and lease claims are atomic across processes."""
    c.execute("BEGIN IMMEDIATE")
    try:
        yield c
        c.execute("COMMIT")
    except BaseException:
        c.execute("ROLLBACK")
        raise


def event(c, job_id: str | None, kind: str, message: str) -> None:
    c.execute("INSERT INTO events (job_id, ts_utc, kind, message) VALUES (?,?,?,?)", (job_id, now_utc(), kind, message))


def set_state(c, job_id: str, state: str, error: str | None = None) -> None:
    c.execute("UPDATE jobs SET state=?, error=?, updated_utc=? WHERE job_id=?", (state, error, now_utc(), job_id))
    event(c, job_id, "state", state + (f": {error}" if error else ""))


def job(c, job_id: str) -> sqlite3.Row:
    r = c.execute("SELECT * FROM jobs WHERE job_id=?", (job_id,)).fetchone()
    if not r:
        raise SystemExit(f"no job {job_id}")
    return r


# ---------------------------------------------------------------- named locks with expiry (scheduler lock)
def acquire(c, name: str, ttl: float, owner: str = WORKER_ID) -> bool:
    with tx(c):
        r = c.execute("SELECT owner, expires FROM locks WHERE name=?", (name,)).fetchone()
        if r and r["owner"] != owner and r["expires"] > time.time():
            return False
        c.execute("INSERT OR REPLACE INTO locks (name, owner, expires) VALUES (?,?,?)", (name, owner, time.time() + ttl))
        return True


def release(c, name: str, owner: str = WORKER_ID) -> None:
    c.execute("DELETE FROM locks WHERE name=? AND owner=?", (name, owner))


def jdump(o) -> str:
    return json.dumps(o, ensure_ascii=False, default=str)
