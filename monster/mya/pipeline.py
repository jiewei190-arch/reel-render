"""The saved-stage job pipeline.

Each stage writes its artifacts atomically into the job folder and records (input_hash, outputs+checksums) in SQLite.
A stage is reused only when its input hash (upstream outputs + profile + config + tool versions + overrides) and
output checksums still match. Leases stop two workers from running the same stage; an expired lease is reclaimed
after checking whether the artifact actually completed. Failures stay inside their job.
"""
from __future__ import annotations

import json
import os
import time
import uuid
from datetime import date, datetime, time as dtime
from pathlib import Path
from zoneinfo import ZoneInfo

import jsonschema

from . import align, assets, db, editorial, lessons, llm, qc, render, research, speech, storyboard, voice
from .config import SCHEMA_DIR, cfg, home
from .util import now_utc, read_json, sha256_file, stable_hash, write_json_atomic

STAGES = ["research", "claims", "draft", "script", "assets", "storyboard", "voice", "align", "preview", "master", "qc"]
DEPS = {
    "research": [], "claims": ["research"], "draft": ["claims"], "script": ["draft"], "assets": ["research"],
    "storyboard": ["script", "claims", "assets"], "voice": ["script"], "align": ["voice", "script"],
    "preview": ["storyboard", "voice", "assets"], "master": ["storyboard", "voice", "align", "assets"],
    "qc": ["master", "script", "storyboard", "claims", "align"],
}
STATE_OF = {"research": "researching", "claims": "researching", "draft": "writing", "script": "writing",
            "assets": "building_visuals", "storyboard": "building_visuals", "voice": "voicing", "align": "aligning",
            "preview": "building_visuals", "master": "rendering", "qc": "rendering"}
CODE_VERSION = "3"  # bump to invalidate every cached stage


class StageFailed(RuntimeError):
    def __init__(self, msg: str, transient: bool = False):
        super().__init__(msg)
        self.transient = transient


class NeedsRevision(RuntimeError):
    pass


def job_dir(job_id: str) -> Path:
    d = home() / "jobs" / job_id
    d.mkdir(parents=True, exist_ok=True)
    return d


# ---------------------------------------------------------------- job creation
def publish_at_utc(local_date: str, hhmm: str, tz: str) -> str:
    """Local publish time -> UTC, correct across daylight-saving changes."""
    d = date.fromisoformat(local_date)
    h, m = map(int, hhmm.split(":"))
    local = datetime.combine(d, dtime(h, m), tzinfo=ZoneInfo(tz))
    return local.astimezone(ZoneInfo("UTC")).strftime("%Y-%m-%dT%H:%M:%SZ")


def create_job(c, channel_key: str, local_date: str, fmt: str, topic: str) -> str:
    p = cfg().profile(channel_key)
    tz = cfg().runtime["timezone"]
    job_id = f"{local_date.replace('-', '')}-{channel_key}-{uuid.uuid4().hex[:6]}"
    c.execute("INSERT INTO jobs (job_id, channel_key, local_publish_date, format_kind, topic, state, fiction, publish_at_utc, "
              "created_utc, updated_utc) VALUES (?,?,?,?,?,?,?,?,?,?)",
              (job_id, channel_key, local_date, fmt, topic, "queued", int(p.raw.get("kind") == "fiction"),
               publish_at_utc(local_date, p.publish_time_local, tz), now_utc(), now_utc()))
    db.event(c, job_id, "created", f"{channel_key} {fmt} '{topic}' for {local_date}")
    contract = {
        "schema_version": "1.1", "job_id": job_id, "channel_key": channel_key, "local_publish_date": local_date,
        "timezone": tz, "format_kind": fmt, "target_duration_seconds": p.raw[f"{fmt}_seconds"], "topic": topic,
        "editorial_status": "research_needed", "fixture_only": False, "claims": [], "scenes": [],
        "budget": {"allow_paid_generators": False, "allow_cloud_inference": False, "allow_remote_voice": False},
    }
    jsonschema.validate(contract, json.loads((SCHEMA_DIR / "job.schema.json").read_text()))
    write_json_atomic(job_dir(job_id) / "job.json", contract)
    return job_id


# ---------------------------------------------------------------- stage bookkeeping
def _outputs(d: Path, names: list[str]) -> list[dict]:
    return [{"path": n, "sha256": sha256_file(d / n)} for n in names]


def _outputs_valid(d: Path, outs: list[dict]) -> bool:
    return all((d / o["path"]).exists() and sha256_file(d / o["path"]) == o["sha256"] for o in outs)


def _versions() -> dict:
    return {"code": CODE_VERSION, "voice": voice.versions(), "renderer": render.renderer_version()}


def input_hash(c, job: dict, stage: str, extra) -> str:
    ups = {}
    for dep in DEPS[stage]:
        r = c.execute("SELECT outputs FROM stage_runs WHERE job_id=? AND stage=? AND status IN ('done','stale')", (job["job_id"], dep)).fetchone()
        if not r:
            raise StageFailed(f"stage {stage} needs {dep} first")
        ups[dep] = [o["sha256"] for o in json.loads(r["outputs"])]
    p = cfg().profile(job["channel_key"])
    return stable_hash({"stage": stage, "ups": ups, "topic": job["topic"], "fmt": job["format_kind"],
                        "profile": p.fingerprint(), "formats": cfg().formats, "versions": _versions(), "extra": extra})[:24]


def _claim(c, job_id: str, stage: str, ih: str) -> str:
    """Returns 'reuse', 'run' or 'busy' (another live worker holds the lease)."""
    d = job_dir(job_id)
    with db.tx(c):
        r = c.execute("SELECT * FROM stage_runs WHERE job_id=? AND stage=?", (job_id, stage)).fetchone()
        if r and r["status"] in ("done", "stale") and r["input_hash"] == ih and _outputs_valid(d, json.loads(r["outputs"] or "[]")):
            return "reuse"
        if (r and r["status"] == "running" and r["lease_owner"] != db.WORKER_ID and (r["lease_expires"] or 0) > time.time()
                and db.owner_alive(r["lease_owner"])):
            return "busy"
        if r and r["status"] == "running":
            db.event(c, job_id, "lease", f"reclaimed expired lease on {stage} from {r['lease_owner']}")
        attempts = (r["attempts"] if r else 0) + 1
        c.execute("INSERT OR REPLACE INTO stage_runs (job_id, stage, status, input_hash, outputs, attempts, lease_owner, "
                  "lease_expires, started_utc, finished_utc, seconds, error, detail) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
                  (job_id, stage, "running", ih, None, attempts, db.WORKER_ID,
                   time.time() + cfg().runtime.get("lease_seconds", 900), now_utc(), None, None, None, None))
    return "run"


def _finish(c, job_id: str, stage: str, outs: list[dict], seconds: float, detail: dict | None = None) -> None:
    c.execute("UPDATE stage_runs SET status='done', outputs=?, lease_owner=NULL, lease_expires=NULL, finished_utc=?, "
              "seconds=?, error=NULL, detail=? WHERE job_id=? AND stage=?",
              (db.jdump(outs), now_utc(), seconds, db.jdump(detail or {}), job_id, stage))
    # only stages that (transitively) depend on this one become stale; independent stages keep their results
    for s in dependents(stage):
        c.execute("UPDATE stage_runs SET status='stale' WHERE job_id=? AND stage=? AND status='done'", (job_id, s))


def dependents(stage: str) -> set[str]:
    out, todo = set(), [stage]
    while todo:
        cur = todo.pop()
        for s, deps in DEPS.items():
            if cur in deps and s not in out:
                out.add(s)
                todo.append(s)
    return out


def _fail(c, job_id: str, stage: str, err: str) -> None:
    c.execute("UPDATE stage_runs SET status='failed', lease_owner=NULL, lease_expires=NULL, finished_utc=?, error=? "
              "WHERE job_id=? AND stage=?", (now_utc(), err[:2000], job_id, stage))


# ---------------------------------------------------------------- stage implementations
def _profile(job):
    return cfg().profile(job["channel_key"])


def st_research(job, d, ctx):
    srcs = research.fetch_sources(job["topic"], d)
    write_json_atomic(d / "research.json", {"topic": job["topic"], "sources": srcs})
    return ["research.json"], {"sources": [s["title"] for s in srcs]}


def st_claims(job, d, ctx):
    srcs = read_json(d / "research.json")["sources"]
    cl = research.build_claims(job["topic"], _profile(job), srcs, lessons.prompt_block(job["channel_key"], "claims", job["topic"]))
    write_json_atomic(d / "claims.json", {"claims": cl, "sources": [{k: v for k, v in s.items() if k != "text"} for s in srcs]})
    return ["claims.json"], {"verified": sum(c["status"] == "verified" for c in cl), "total": len(cl)}


def st_draft(job, d, ctx):
    claims = read_json(d / "claims.json")["claims"]
    fb = ctx["overrides"].get("draft_feedback", "")
    script, problems = editorial.write(job["topic"], _profile(job), job["format_kind"], claims,
                                       lessons.prompt_block(job["channel_key"], "draft", job["topic"]), fb)
    if problems:
        write_json_atomic(d / "draft_rejected.json", {"script": script, "problems": problems})
        raise StageFailed("script draft failed its checks: " + "; ".join(problems[:4]))
    write_json_atomic(d / "draft.json", script)
    return ["draft.json"], {"scenes": len(script["scenes"])}


def st_script(job, d, ctx):
    """The draft plus any human revisions (scene narration overrides). Deterministic."""
    s = read_json(d / "draft.json")
    for sc in s["scenes"]:
        o = ctx["overrides"].get("scenes", {}).get(sc["id"], {})
        if "narration" in o:
            sc["narration"] = o["narration"]
            sc["revised"] = True
    p = _profile(job)
    for sc in s["scenes"]:
        sc["spoken"] = speech.spoken_text(sc["narration"], p.raw.get("pronunciations"))
    write_json_atomic(d / "script.json", s)
    return ["script.json"], {"revised": [x["id"] for x in s["scenes"] if x.get("revised")]}


def st_assets(job, d, ctx):
    p = _profile(job)
    items, findings = assets.owned_assets(), []
    if p.raw.get("reference_images"):
        title = read_json(d / "research.json")["sources"][0]["title"]
        img = assets.reference_image(title, d, job["job_id"])  # raises after bounded retries
        if img and not img.get("rejected"):
            items.append(img)
        elif img:
            findings.append({"severity": "minor", "stage": "assets", "finding": f"reference image not used: {img.get('reason')} ({img.get('license', '')})"})
    assets.prepare_public(d)
    write_json_atomic(d / "assets.json", {"assets": items, "findings": findings})
    return ["assets.json"], {"external": sum(1 for a in items if a["kind"] == "image")}


def st_storyboard(job, d, ctx):
    p = _profile(job)
    script, claims = read_json(d / "script.json"), read_json(d / "claims.json")["claims"]
    imgs = [a for a in read_json(d / "assets.json")["assets"] if a["kind"] == "image"]
    cache = read_json(d / "board_cache.json", {})
    prof = p
    if not imgs:
        prof = type(p)({**p.raw, "scene_types": [t for t in p.scene_types if t != "photo"]})
    todo = [s for s in script["scenes"] if stable_hash([s["narration"], s["claim_ids"], prof.scene_types]) not in cache]
    findings = []
    if todo:
        sub = {**script, "scenes": todo}
        planned, findings = storyboard.plan(sub, claims, prof, job["format_kind"], lessons.prompt_block(job["channel_key"], "storyboard", job["topic"]))
        for s, b in zip(todo, planned):
            if b["type"] == "photo":
                b["params"] = {"file": imgs[0]["id"], "credit": imgs[0]["credit"]}
            cache[stable_hash([s["narration"], s["claim_ids"], prof.scene_types])] = b
    board = []
    for s in script["scenes"]:
        b = dict(cache[stable_hash([s["narration"], s["claim_ids"], prof.scene_types])])
        b["id"] = s["id"]
        o = ctx["overrides"].get("scenes", {}).get(s["id"], {})
        if "type" in o:  # a human revision of the visual
            jsonschema.validate(o["params"], storyboard.schema_for(o["type"]))
            b["type"], b["params"] = o["type"], o["params"]
        board.append(b)
    write_json_atomic(d / "board_cache.json", cache)
    write_json_atomic(d / "storyboard.json", {"scenes": board, "findings": findings})
    return ["storyboard.json"], {"planned_now": [s["id"] for s in todo], "findings": len(findings)}


def st_voice(job, d, ctx):
    p = _profile(job)
    script = read_json(d / "script.json")
    vdir = d / "voice"
    vdir.mkdir(exist_ok=True)
    out, made = [], []
    llm.unload()  # free the text model's memory before synthesis/rendering
    for s in script["scenes"]:
        key = voice.scene_key(s["spoken"], p.voice, float(p.raw.get("speed", 1.0)))
        wav, meta = vdir / f"{s['id']}_{key}.wav", vdir / f"{s['id']}_{key}.json"
        if not (wav.exists() and meta.exists()):
            m = voice.synth(s["spoken"], p.voice, float(p.raw.get("speed", 1.0)), wav)
            write_json_atomic(meta, m)
            made.append(s["id"])
        m = read_json(meta)
        out.append({"id": s["id"], "wav": wav.name, "seconds": m["seconds"], "tokens": m["tokens"], "spoken": s["spoken"]})
    keep = {o["wav"] for o in out} | {o["wav"].replace(".wav", ".json") for o in out}
    for f in vdir.iterdir():
        if f.name not in keep:
            f.unlink()  # no stale audio left behind
    fps = cfg().formats[job["format_kind"]]["fps"]
    tl, total = render.timeline({"scenes": out}, fps)
    v = {"voice": p.voice, "speed": p.raw.get("speed", 1.0), "versions": voice.versions(), "scenes": out, "total_seconds": total}
    write_json_atomic(d / "voice.json", v)
    ok, msg = qc.duration_verdict(total, job["format_kind"])
    if not ok:
        f = cfg().formats[job["format_kind"]]
        need = "shorter" if total > f["max_seconds"] else "longer"
        raise NeedsRevision(f"measured narration is {total:.1f}s ({msg}); rewrite it {need}: target "
                            f"{_profile(job).raw[job['format_kind'] + '_seconds']}s")
    return ["voice.json"], {"seconds": total, "voiced_now": made}


def st_align(job, d, ctx):
    p = _profile(job)
    v, script = read_json(d / "voice.json"), read_json(d / "script.json")
    fps = cfg().formats[job["format_kind"]]["fps"]
    tl, total = render.timeline(v, fps)
    words, findings = [], []
    for s, vs, t in zip(script["scenes"], v["scenes"], tl):
        w, f = align.map_words(s["narration"], vs["tokens"], t["audio_start"], p.raw.get("pronunciations"))
        for x in w:
            x["scene"] = s["id"]
        words += w
        findings += [{"severity": "major", "stage": "align", "scene": s["id"], "finding": m} for m in f]
    groups = align.phrases(words)
    fmt = cfg().formats[job["format_kind"]]
    (d / "captions.srt").write_text(align.srt(groups), encoding="utf-8")
    (d / "captions.ass").write_text(align.ass(groups, fmt["width"], fmt["height"], p.theme["accent"]), encoding="utf-8")
    write_json_atomic(d / "words.json", {"words": words, "findings": findings})
    return ["words.json", "captions.srt", "captions.ass"], {"unaligned": len(findings)}


def _props(job, d):
    p = _profile(job)
    fmt = cfg().formats[job["format_kind"]]
    tl, total = render.timeline(read_json(d / "voice.json"), fmt["fps"])
    return render.props(job, p, read_json(d / "storyboard.json")["scenes"], tl, fmt), tl, total


def st_preview(job, d, ctx):
    pr, tl, total = _props(job, d)
    render.render_preview(pr, assets.prepare_public(d), d / "preview.mp4")
    return ["preview.mp4"], {"seconds": total}


def st_master(job, d, ctx):
    pr, tl, total = _props(job, d)
    pub = assets.prepare_public(d)
    segs, rendered = render.render_segments(pr, pub, d / "segments")
    render.concat(segs, d / "visuals.mp4")
    loud = render.narration(read_json(d / "voice.json"), tl, total, d / "voice", d / "narration.wav")
    burn = d / "captions.ass" if job["format_kind"] == "short" else None
    render.master(d / "visuals.mp4", d / "narration.wav", total, d / "final.mp4", burn, pub / "fonts")
    render.thumbnail(pr, pub, d / "thumb.png", job["format_kind"] == "long")
    render.contact_sheet(d / "final.mp4", tl, pr["fps"], d / "contact.jpg", pr["width"])
    return ["final.mp4", "thumb.png", "contact.jpg", "captions.srt"], {"segments_rendered": rendered, "loudness": loud}


def st_qc(job, d, ctx):
    p = _profile(job)
    words = read_json(d / "words.json")
    tech = qc.technical(d / "final.mp4", job["format_kind"], words["words"])
    script, board, claims = read_json(d / "script.json"), read_json(d / "storyboard.json"), read_json(d / "claims.json")["claims"]
    edit = qc.editorial(job, script, board["scenes"], claims, p)
    asr = align.verify_asr(str(d / "narration.wav"), " ".join(s["spoken"] for s in script["scenes"]).split()) \
        if os.environ.get("MYA_ASR_CHECK", "1") == "1" else {"checked": False}
    extra = board.get("findings", []) + words.get("findings", []) + read_json(d / "assets.json").get("findings", [])
    if asr.get("checked") and asr["recall"] < 0.85:
        extra.append({"severity": "major", "stage": "qc", "finding": f"independent ASR heard only {asr['recall']:.0%} of the words"})
    elig = qc.release_eligibility(tech, edit, claims, read_json(d / "assets.json")["assets"], extra)
    write_json_atomic(d / "qc.json", {"technical": tech, "editorial": edit, "asr": asr, "stage_findings": extra,
                                      "release": elig, "checked_utc": now_utc()})
    return ["qc.json"], {"technical": tech["passed"], "editorial": edit["passed"], "eligible": elig["eligible"]}


FNS = {"research": st_research, "claims": st_claims, "draft": st_draft, "script": st_script, "assets": st_assets,
       "storyboard": st_storyboard, "voice": st_voice, "align": st_align, "preview": st_preview, "master": st_master, "qc": st_qc}


# ---------------------------------------------------------------- driver
def overrides(d: Path) -> dict:
    return read_json(d / "overrides.json", {})


def run_job(job_id: str, until: str = "qc", log=print) -> str:
    """Run (or resume) a job's stages up to `until`. Returns the final state. Exceptions stay inside this job."""
    c = db.connect()
    job = dict(db.job(c, job_id))
    prod = cfg().profile(job["channel_key"]).raw.get("producer", {"kind": "local"})
    if prod.get("kind") == "external":
        raise SystemExit(f"{job['channel_key']} is produced by {prod['name']}, not by the local pipeline")
    d = job_dir(job_id)
    max_rev = cfg().runtime.get("max_regenerations_per_stage", 2)
    revisions = 0
    i = 0
    stages = STAGES[: STAGES.index(until) + 1]
    while i < len(stages):
        stage = stages[i]
        ov = overrides(d)
        extra = {"draft": ov.get("draft_feedback"), "script": ov.get("scenes"), "storyboard": ov.get("scenes")}.get(stage)
        try:
            ih = input_hash(c, job, stage, extra)
        except StageFailed as e:
            db.set_state(c, job_id, "blocked", str(e))
            return "blocked"
        claim = _claim(c, job_id, stage, ih)
        if claim == "busy":
            log(f"  {stage}: another worker holds the lease; leaving it")
            return "busy"
        if claim == "reuse":
            log(f"  {stage}: reused (inputs unchanged)")
            db.event(c, job_id, "reuse", stage)
            i += 1
            continue
        db.set_state(c, job_id, STATE_OF[stage])
        t0 = time.time()
        log(f"  {stage}: running...")
        try:
            names, detail = FNS[stage](job, d, {"overrides": ov})
            _finish(c, job_id, stage, _outputs(d, names), round(time.time() - t0, 2), detail)
            db.event(c, job_id, "stage", f"{stage} done in {time.time() - t0:.1f}s {db.jdump(detail)[:200]}")
            log(f"  {stage}: done in {time.time() - t0:.1f}s {db.jdump(detail)[:160]}")
            if os.environ.get("MYA_CRASH_AFTER") == stage:  # crash-recovery test hook: die right after committing
                os._exit(137)
            i += 1
        except NeedsRevision as e:
            _fail(c, job_id, stage, str(e))
            revisions += 1
            if revisions > max_rev:
                db.set_state(c, job_id, "blocked", f"still out of range after {max_rev} rewrites: {e}")
                return "blocked"
            log(f"  {stage}: needs revision -> {e}")
            ov = overrides(d)
            ov["draft_feedback"] = str(e)
            write_json_atomic(d / "overrides.json", ov)
            db.set_state(c, job_id, "revision_needed", str(e))
            i = stages.index("draft")
        except (llm.Deferred,) as e:
            _fail(c, job_id, stage, str(e))
            db.set_state(c, job_id, "blocked", f"deferred: {e}")
            return "blocked"
        except Exception as e:  # noqa: BLE001
            _fail(c, job_id, stage, f"{type(e).__name__}: {e}")
            db.set_state(c, job_id, "blocked", f"{stage}: {type(e).__name__}: {e}"[:500])
            log(f"  {stage}: FAILED {type(e).__name__}: {str(e)[:300]}")
            return "blocked"
    final = _final_state(d, until)
    db.set_state(c, job_id, final)
    from . import review
    review.page(job_id)
    return final


def _final_state(d: Path, until: str) -> str:
    if until == "script":
        return "script_review"
    if until == "preview":
        return "preview_ready"
    q = read_json(d / "qc.json")
    if not q:
        return "rendering"
    if not q["technical"]["passed"]:
        return "qc_failed"
    return "ready_for_release" if q["release"]["eligible"] else "revision_needed"


def revise(job_id: str, scene_id: str, narration: str | None = None, scene_type: str | None = None,
           params: dict | None = None, note: str = "") -> None:
    d = job_dir(job_id)
    ov = overrides(d)
    sc = ov.setdefault("scenes", {}).setdefault(scene_id, {})
    if narration:
        sc["narration"] = narration
    if scene_type:
        jsonschema.validate(params or {}, storyboard.schema_for(scene_type))
        sc["type"], sc["params"] = scene_type, params
    hist = ov.setdefault("history", [])
    hist.append({"utc": now_utc(), "scene": scene_id, "narration": narration, "type": scene_type, "note": note})
    write_json_atomic(d / "overrides.json", ov)
    c = db.connect()
    db.event(c, job_id, "revision", f"{scene_id}: {note or 'edited'}")
