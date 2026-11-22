"""Pipeline, scheduler, release and safety tests. These exercise the real SQLite state machine, real scheduling and
real HTTP against a local fake YouTube server. Media quality is verified separately by real renders (see REPORT.md)."""
from __future__ import annotations

import http.server
import json
import multiprocessing as mp
import os
import threading
import time
from pathlib import Path

import pytest




def _local(*keys):
    """Let these channels use the Monster local pipeline in a test (production hands them to reelbot)."""
    from mya.config import cfg
    for k in keys:
        cfg().profiles[k].raw["producer"] = {"kind": "local"}


def _job(c, jobs, channel):
    return next(j for j in jobs if c.execute("SELECT channel_key FROM jobs WHERE job_id=?", (j,)).fetchone()[0] == channel)


# ---------------------------------------------------------------- duration boundaries (acceptance 6)
@pytest.mark.parametrize("secs,fmt,ok", [(19, "short", False), (20, "short", True), (60, "short", True), (61, "short", False),
                                        (179, "long", False), (180, "long", True), (480, "long", True), (481, "long", False),
                                        (19.98, "short", True), (60.02, "short", True), (60.05, "short", False)])
def test_duration_bounds(home, secs, fmt, ok):
    from mya import qc
    good, msg = qc.duration_verdict(secs, fmt)
    assert good is ok, msg
    if secs in (19.98, 60.02):
        assert "rounding" in msg  # container rounding is allowed explicitly and reported


# ---------------------------------------------------------------- spoken/display mapping (acceptance 8)
def test_spoken_display_mapping():
    from mya import speech
    m = {w["display"]: " ".join(w["spoken"]) for w in speech.normalize("In 2007, Pearson v. Chung sought $54 million; 1,919 people; 24.5% in the 1990s.", {"v.": "versus"})}
    assert m["2007,"] == "two thousand seven,"
    assert m["v."] == "versus"
    assert m["$54 million;"] == "fifty-four million dollars;"
    assert m["1,919"] == "one thousand nine hundred nineteen"
    assert m["24.5%"] == "twenty-four point five percent"
    assert m["1990s."] == "nineteen nineties."
    assert speech.spoken_text("[excited] Wow.") == "Wow."  # other providers' emotion tags are never spoken


def test_unalignable_words_get_findings_not_fake_timestamps():
    from mya import align
    toks = [{"text": "Pearson", "start": 0.1, "end": 0.5}, {"text": "sued", "start": 0.5, "end": 0.8}]
    words, findings = align.map_words("Pearson sued Xyzzqk", toks, 0.0)
    assert words[2]["t"] is None and words[2]["end"] is None
    assert any("Xyzzqk" in f for f in findings)


# ---------------------------------------------------------------- slots: duplicates, simultaneous starts, format switch
def _fill(home_dir, date, q):
    os.environ["MYA_HOME"] = home_dir
    from mya import config, scheduler
    config.reset()
    try:
        q.put(scheduler.fill_slots(date))
    except Exception as e:  # noqa: BLE001
        q.put(repr(e))


def test_simultaneous_daily_starts_do_not_duplicate(home):
    q = mp.Queue()
    ps = [mp.Process(target=_fill, args=(str(home), "2026-11-25", q)) for _ in range(4)]
    [p.start() for p in ps]
    [p.join(60) for p in ps]
    results = [q.get(timeout=5) for _ in ps]
    from mya import db, scheduler
    c = db.connect()
    n = scheduler.expected_total("2026-11-25")  # a Wednesday: 2+2 Shorts + 3x1 Short = 7
    assert n == 7
    assert c.execute("SELECT COUNT(*) FROM slots WHERE local_publish_date='2026-11-25'").fetchone()[0] == n
    assert c.execute("SELECT COUNT(*) FROM jobs WHERE local_publish_date='2026-11-25'").fetchone()[0] == n
    assert all(isinstance(r, list) and sorted(r) == sorted(results[0]) for r in results)  # every run sees the same jobs


def test_schedule_long_days_and_two_short_channels(home):
    from mya import db, scheduler
    assert scheduler.expected_total("2026-11-27") == 10  # Friday: +1 long video for each of law, biz, cyber
    jobs = scheduler.fill_slots("2026-11-27")
    c = db.connect()
    fmts = {}
    for j in jobs:
        ck, fk = c.execute("SELECT channel_key, format_kind FROM jobs WHERE job_id=?", (j,)).fetchone()
        fmts.setdefault(ck, []).append(fk)
    assert sorted(fmts["block_money"]) == ["short", "short"] and sorted(fmts["justin_clips"]) == ["short", "short"]
    assert all(sorted(fmts[k]) == ["long", "short"] for k in ("law", "biz", "cyber"))
    times = {r[0] for r in c.execute("SELECT publish_at_utc FROM jobs WHERE channel_key='block_money'")}
    assert times == {"2026-11-27T17:00:00Z", "2026-11-28T00:00:00Z"}  # 12:00 and 19:00 EST


def test_switching_format_never_adds_a_sixth(home):
    from mya import db, scheduler
    first = scheduler.fill_slots("2026-11-26")
    second = scheduler.fill_slots("2026-11-26", {"law": "long"})
    c = db.connect()
    assert c.execute("SELECT COUNT(*) FROM slots WHERE local_publish_date='2026-11-26'").fetchone()[0] == 7
    live = c.execute("SELECT COUNT(*) FROM jobs WHERE local_publish_date='2026-11-26' AND state!='cancelled'").fetchone()[0]
    assert live == 7
    assert c.execute("SELECT format_kind FROM slots WHERE channel_key='law' AND local_publish_date='2026-11-26'").fetchone()[0] == "long"
    assert len(set(first) & set(second)) == 6


def test_scheduler_lock_blocks_overlap(home):
    from mya import db, scheduler
    c = db.connect()
    assert db.acquire(c, "scheduler", 60, owner="other-host:1")
    assert scheduler.daily("2026-11-27", produce=False) == {"locked": True}


def test_catchup_is_bounded(home):
    from mya import db, scheduler
    scheduler.fill_slots("2026-11-01")
    c = db.connect()
    # a week offline: only `catchup_days` (1) missed day is filled, never a flood
    assert scheduler.missed_dates(c, "2026-11-08") == ["2026-11-07"]


def test_publish_time_across_dst(home):
    from mya import pipeline
    # America/New_York: EDT (UTC-4) until Nov 1 2026, EST (UTC-5) after; DST starts Mar 8 2026
    assert pipeline.publish_at_utc("2026-10-31", "18:00", "America/New_York") == "2026-10-31T22:00:00Z"
    assert pipeline.publish_at_utc("2026-11-01", "18:00", "America/New_York") == "2026-11-01T23:00:00Z"
    assert pipeline.publish_at_utc("2026-03-08", "12:00", "America/New_York") == "2026-03-08T16:00:00Z"


# ---------------------------------------------------------------- stage cache, crash recovery, isolation (13, 14)
def _fake_stages(monkeypatch, calls, fail_job=None):
    """Replace stage bodies with tiny deterministic writers so the state machine can be tested quickly."""
    from mya import pipeline
    from mya.util import write_json_atomic

    def mk(name):
        def fn(job, d, ctx):
            calls.append((job["job_id"], name))
            if name == "assets" and job["job_id"] == fail_job:
                from mya.assets import AssetError
                raise AssetError("asset fetch failed after 3 attempts: injected")
            write_json_atomic(d / f"{name}.json", {"stage": name, "ov": ctx["overrides"].get("scenes")})
            return [f"{name}.json"], {}
        return fn
    for s in pipeline.STAGES:
        monkeypatch.setitem(pipeline.FNS, s, mk(s))
    monkeypatch.setattr(pipeline, "_final_state", lambda d, until: "ready_for_release")
    import mya.review
    monkeypatch.setattr(mya.review, "page", lambda j: "")


def test_resume_reuses_completed_stages_and_rebuilds_invalidated(home, monkeypatch):
    from mya import db, pipeline, scheduler
    calls = []
    _fake_stages(monkeypatch, calls)
    _local("law")
    jid = _job(db.connect(), scheduler.fill_slots("2026-11-28"), "law")
    assert pipeline.run_job(jid, log=lambda *a: None) == "ready_for_release"
    first = [s for j, s in calls]
    calls.clear()
    assert pipeline.run_job(jid, log=lambda *a: None) == "ready_for_release"
    assert calls == []  # everything reused
    pipeline.revise(jid, "sc01", narration="A new first line.", note="test")
    pipeline.run_job(jid, log=lambda *a: None)
    rerun = [s for j, s in calls]
    # a narration change rebuilds the script and everything after it, but not research/claims/draft/assets
    assert "research" not in rerun and "claims" not in rerun and "draft" not in rerun and "assets" not in rerun
    assert {"script", "storyboard", "voice", "align", "master", "qc"} <= set(rerun)
    assert len(first) == len(pipeline.STAGES)


def test_failed_asset_fetch_is_isolated(home, monkeypatch):
    from mya import db, scheduler
    _local("law", "biz")
    jobs = scheduler.fill_slots("2026-11-29")
    c = db.connect()
    bad = _job(c, jobs, "law")
    calls = []
    _fake_stages(monkeypatch, calls, fail_job=bad)
    res = scheduler.daily("2026-11-29", log=lambda *a: None)
    states = res["results"]
    assert states[bad] == "blocked"
    local = {j for j in jobs if c.execute("SELECT channel_key FROM jobs WHERE job_id=?", (j,)).fetchone()[0] in ("law", "biz")}
    assert all(states[j] == "external_production" for j in jobs if j not in local)  # reelbot channels are handed off
    assert all(states[j] == "ready_for_release" for j in local if j != bad)
    row = c.execute("SELECT * FROM stage_runs WHERE job_id=? AND stage='assets'", (bad,)).fetchone()
    assert row["status"] == "failed" and "asset fetch failed" in row["error"]
    assert "asset fetch failed" in c.execute("SELECT error FROM jobs WHERE job_id=?", (bad,)).fetchone()[0]


def test_expired_lease_is_reclaimed_live_lease_is_respected(home, monkeypatch):
    from mya import db, pipeline, scheduler
    calls = []
    _fake_stages(monkeypatch, calls)
    _local("law")
    jid = _job(db.connect(), scheduler.fill_slots("2026-11-30"), "law")
    c = db.connect()
    c.execute("INSERT INTO stage_runs (job_id, stage, status, lease_owner, lease_expires) VALUES (?,?,?,?,?)",
              (jid, "research", "running", "other:1", time.time() + 600))
    assert pipeline.run_job(jid, log=lambda *a: None) == "busy"
    c.execute("UPDATE stage_runs SET lease_expires=? WHERE job_id=?", (time.time() - 1, jid))
    assert pipeline.run_job(jid, log=lambda *a: None) == "ready_for_release"


def test_lease_of_dead_local_worker_is_reclaimed_immediately(home, monkeypatch):
    import socket
    from mya import db, pipeline, scheduler
    calls = []
    _fake_stages(monkeypatch, calls)
    _local("law")
    jid = _job(db.connect(), scheduler.fill_slots("2026-12-03"), "law")
    c = db.connect()
    dead = f"{socket.gethostname()}:999999:abc123"  # no such pid
    c.execute("INSERT INTO stage_runs (job_id, stage, status, lease_owner, lease_expires) VALUES (?,?,?,?,?)",
              (jid, "research", "running", dead, time.time() + 600))
    assert pipeline.run_job(jid, log=lambda *a: None) == "ready_for_release"


# ---------------------------------------------------------------- strict local / no paid fallback (3, 4)
def test_config_refuses_paid_or_remote(tmp_path):
    from mya.config import Config, ConfigError
    src = json.loads((Path(__file__).resolve().parent.parent / "config" / "channel_profiles.json").read_text())
    for k in ("allow_paid_generators", "allow_cloud_inference", "allow_remote_voice", "cloud_fallback"):
        bad = json.loads(json.dumps(src))
        bad["runtime"][k] = True
        p = tmp_path / "p.json"
        p.write_text(json.dumps(bad))
        with pytest.raises(ConfigError):
            Config(p)
    bad = json.loads(json.dumps(src))
    bad["runtime"]["tts_backend"] = "elevenlabs"
    p.write_text(json.dumps(bad))
    with pytest.raises(ConfigError):
        Config(p)


def test_egress_blocks_unlisted_hosts(home):
    from mya.util import EgressBlocked, http
    for url in ("https://api.elevenlabs.io/v1/text-to-speech/x", "https://api.openai.com/v1/audio/speech",
                "https://api.anthropic.com/v1/messages", "https://speech.platform.bing.com/x"):
        with pytest.raises(EgressBlocked):
            http("POST", url)
    log = (home / "egress.log").read_text()
    assert log.count("BLOCK") == 4


def test_ollama_must_be_local_and_not_cloud(home, monkeypatch):
    from mya import llm
    with pytest.raises(llm.LLMError):
        llm._check_local("http://10.0.0.5:11434", "qwen2.5:7b")
    with pytest.raises(llm.LLMError):
        llm._check_local("http://127.0.0.1:11434", "gpt-oss:120b-cloud")
    llm._check_local("http://127.0.0.1:11434", "qwen2.5:7b")


def test_forced_tts_failure_stops_without_fallback(home, monkeypatch):
    from mya import voice
    monkeypatch.setenv("MYA_FORCE_TTS_FAIL", "1")
    with pytest.raises(voice.VoiceError, match="no fallback"):
        voice.synth("hello there", "am_michael", 1.0, home / "x.wav")
    assert not (home / "egress.log").exists() or "elevenlabs" not in (home / "egress.log").read_text()


# ---------------------------------------------------------------- release: no auth = no upload; upload_unknown (17, 19)
def test_no_policy_or_auth_means_no_upload(home):
    from mya import db, release, scheduler
    jid = scheduler.fill_slots("2026-12-01")[0]
    with pytest.raises(release.ReleaseBlocked, match="disabled"):
        release.upload(jid)
    assert not (home / "egress.log").exists()  # not a single request was made


class FakeYT(http.server.BaseHTTPRequestHandler):
    state = {"uploads": 0, "stall": True, "received": False}

    def log_message(self, *a):
        pass

    def _json(self, code, obj, headers=None):
        b = json.dumps(obj).encode()
        self.send_response(code)
        for k, v in (headers or {}).items():
            self.send_header(k, v)
        self.send_header("Content-Length", str(len(b)))
        self.end_headers()
        self.wfile.write(b)

    def do_POST(self):  # noqa: N802
        n = int(self.headers.get("Content-Length", 0))
        self.rfile.read(n)
        if self.path.startswith("/token"):
            return self._json(200, {"access_token": "test-token"})
        if self.path.startswith("/upload/youtube/v3/videos"):
            return self._json(200, {}, {"Location": f"http://127.0.0.1:{self.server.server_port}/session/1"})

    def do_GET(self):  # noqa: N802
        if self.path.startswith("/youtube/v3/channels"):
            return self._json(200, {"items": [{"id": "UC_TEST"}]})

    def do_PUT(self):  # noqa: N802
        if self.headers.get("Content-Range", "").startswith("bytes */"):
            # status query: the earlier PUT was fully received
            return self._json(200, {"id": "VIDEO123", "status": {"privacyStatus": "private"}}) if FakeYT.state["received"] \
                else self._json(308, {}, {"Range": "bytes=0-9"})
        n = int(self.headers.get("Content-Length", 0))
        self.rfile.read(n)
        FakeYT.state["uploads"] += 1
        FakeYT.state["received"] = True
        if FakeYT.state["stall"]:
            time.sleep(3)  # server accepted the bytes but the client times out before the response
        return self._json(200, {"id": "VIDEO123", "status": {"privacyStatus": "private"}})


def test_ambiguous_timeout_goes_upload_unknown_then_reconciles(home, monkeypatch, tmp_path):
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), FakeYT)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = f"http://127.0.0.1:{srv.server_port}"
    monkeypatch.setenv("MYA_EXTRA_HOSTS", "127.0.0.1")
    import importlib
    from mya import config, db, pipeline, release, scheduler
    monkeypatch.setattr(release, "TOKEN_URL", base + "/token")
    monkeypatch.setattr(release, "API", base)
    # an explicitly configured TEST channel with an enabled private-release policy
    prof = json.loads(config.CONFIG_FILE.read_text())
    prof["runtime"]["upload_enabled"] = True
    for ch in prof["channels"]:
        ch["release_policy"] = {"enabled": True, "privacy": "private", "require_editorial_pass": True}
        ch["channel_id"] = "UC_TEST"
    pf = tmp_path / "profiles.json"
    pf.write_text(json.dumps(prof))
    monkeypatch.setattr(config, "CONFIG_FILE", pf)
    config.reset()
    auth = tmp_path / "auth"
    auth.mkdir()
    monkeypatch.setenv("MYA_AUTH_DIR", str(auth))
    jid = scheduler.fill_slots("2026-12-02")[0]
    ck = db.connect().execute("SELECT channel_key FROM jobs WHERE job_id=?", (jid,)).fetchone()[0]
    (auth / f"{ck}.json").write_text(json.dumps({"client_id": "x", "client_secret": "y", "refresh_token": "z"}))
    d = pipeline.job_dir(jid)
    (d / "final.mp4").write_bytes(b"0" * 2048)
    for name, obj in {"qc.json": {"technical": {"passed": True}, "editorial": {"passed": True}, "release": {"eligible": True, "reasons": []}},
                      "script.json": {"title": "Test", "description": "Desc", "scenes": []},
                      "claims.json": {"claims": [], "sources": [{"title": "T", "publisher": "P", "url": "u"}]},
                      "assets.json": {"assets": []}}.items():
        (d / name).write_text(json.dumps(obj))
    monkeypatch.setenv("MYA_UPLOAD_TIMEOUT", "1")
    out = release.upload(jid, log=lambda *a: None)
    assert out == {"state": "upload_unknown"}
    c = db.connect()
    assert c.execute("SELECT state FROM jobs WHERE job_id=?", (jid,)).fetchone()[0] == "upload_unknown"
    assert FakeYT.state["uploads"] == 1
    FakeYT.state["stall"] = False
    out2 = release.upload(jid, log=lambda *a: None)
    assert out2 == {"state": "uploaded", "video_id": "VIDEO123"}
    assert FakeYT.state["uploads"] == 1  # reconciled: the second call did NOT upload again
    rel = c.execute("SELECT * FROM releases WHERE job_id=?", (jid,)).fetchone()
    assert rel["remote_video_id"] == "VIDEO123" and rel["privacy"] == "private"
    assert json.loads(rel["request"])["status"]["privacyStatus"] == "private"
    srv.shutdown()


def test_wrong_authorized_channel_is_refused(home, monkeypatch, tmp_path):
    from mya import release
    monkeypatch.setattr(release, "_token", lambda k, d: "t")
    monkeypatch.setattr(release, "_verified_channel", lambda t, d: "UC_SOMEONE_ELSE")
    monkeypatch.setattr(release, "preflight", lambda j: {"job": {"job_id": j}, "profile": type("P", (), {"key": "law", "raw": {"channel_id": "UC_TEST"}})(),
                                                          "body": {}, "privacy": "private", "file": tmp_path / "f.mp4"})
    from mya import db
    db.connect()
    with pytest.raises(release.ReleaseBlocked, match="refusing"):
        release.upload("job-x")


# ---------------------------------------------------------------- lessons (21)
def test_lessons_are_retrieved_for_relevant_jobs(home):
    from mya import lessons
    lessons.add("law", "draft", "case names with 'v.' were read as 'vee' with a pause", "the abbreviation was voiced literally",
                "pronunciation entry v. -> versus in the law profile", "tests/test_reliability.py::test_spoken_display_mapping",
                "job audio before/after", verified=True)
    lessons.add("biz", "draft", "unrelated lesson", "x", "y", "z", "e", verified=False)
    got = lessons.relevant("law", "draft", "Pearson v. Chung case")
    assert len(got) == 1 and got[0]["status"] == "verified"
    assert "versus" in lessons.prompt_block("law", "draft", "case")


def test_sentence_split_keeps_abbreviations_and_lines_are_unique():
    from mya import research
    t = ("Pearson v. Chung, also known as the pants case, was decided in Washington, D.C. by Judge Bartnoff in 2007. "
         "The judge ruled in favor of the dry cleaners and awarded them their court costs in full.")
    got = research.sentences(t)
    assert got[0].startswith("Pearson v. Chung, also known") and len(got) == 2


def test_onscreen_text_must_come_from_narration_or_sources():
    from mya import storyboard as sb
    narr = "The Chungs refused to pay Pearson 1,000 dollars for the gray pants."
    assert sb.invented_words({"title": "Compensation", "nodes": ["Man Holding Receipt", "Gray Pants"]}, narr)
    assert not sb.invented_words({"title": "Chungs refused", "nodes": ["Pearson's demand", "Gray pants"]}, narr + " demand")


def test_rule_based_support_rejects_invented_outcomes_and_allows_paraphrase():
    from mya import editorial
    src = ["On June 25, 2007, the trial ended with Judge Judith Bartnoff ruling in favor of the dry cleaners."]
    assert len(editorial.novel_words("Pearson won and the jury awarded him millions.", src)) > 2
    assert len(editorial.novel_words("In June 2007 the judge ruled in favor of the dry cleaners.", src)) <= 2


def test_dropping_a_qualifier_is_caught():
    from mya import editorial
    src = ["Liebeck sought to settle with McDonald's for $20,000 to cover her medical expenses."]
    assert editorial.dropped_qualifiers("Liebeck settled with McDonald's for $20,000 to cover her medical expenses.", src)
    assert not editorial.dropped_qualifiers("Liebeck asked McDonald's for $20,000 to cover her medical bills.", src)


def test_handoff_passes_long_flag(home):
    from mya import db, scheduler
    from mya.util import read_json
    jobs = scheduler.fill_slots("2026-12-04")  # a Friday: law has a long slot
    c = db.connect()
    long_job = next(j for j in jobs if c.execute("SELECT channel_key, format_kind FROM jobs WHERE job_id=?", (j,)).fetchone()[:] == ("law", "long"))
    scheduler.handoff(c, long_job, "Pearson v. Chung", scheduler.cfg().profile("law").raw["producer"], log=lambda *a: None)
    cmd = read_json(scheduler.pipeline.job_dir(long_job) / "handoff.json")["command"]
    assert "--channel law" in cmd and cmd.endswith("--long")


def test_old_one_slot_database_is_upgraded(home):
    import sqlite3
    from mya import db
    p = db.path()
    p.parent.mkdir(parents=True, exist_ok=True)
    old = sqlite3.connect(p)
    old.execute("CREATE TABLE slots (channel_key TEXT NOT NULL, local_publish_date TEXT NOT NULL, format_kind TEXT NOT NULL, "
                "job_id TEXT NOT NULL, created_utc TEXT NOT NULL, PRIMARY KEY (channel_key, local_publish_date))")
    old.execute("INSERT INTO slots VALUES ('law','2026-11-20','short','j1','t')")
    old.commit(); old.close()
    c = db.connect()
    assert c.execute("SELECT slot_no, job_id FROM slots").fetchall()[0][:] == (0, "j1")
