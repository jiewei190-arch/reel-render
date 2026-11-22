"""Release adapter: the official YouTube Data API (videos.insert, resumable upload).

Nothing is uploaded unless ALL of these hold: the channel's release_policy is enabled, a per-channel authorization
record exists (config/auth/<channel>.json, created by the owner), the authorized channel's real id (channels.list
mine=true) equals the profile's channel_id, and the job is release-eligible. Privacy is always set explicitly.

If an upload request times out after the server may have accepted it, the job goes to `upload_unknown`; the next
attempt first asks the resumable session for its status and never starts a second upload blindly.
"""
from __future__ import annotations

import json
import os
from pathlib import Path

import requests

from . import db
from .config import APP_DIR, cfg
from .pipeline import job_dir
from .util import http, now_utc, read_json, write_json_atomic

TOKEN_URL = os.environ.get("MYA_OAUTH_TOKEN_URL", "https://oauth2.googleapis.com/token")
API = os.environ.get("MYA_YT_API", "https://www.googleapis.com")


class ReleaseBlocked(RuntimeError):
    pass


def auth_file(channel_key: str) -> Path:
    return Path(os.environ.get("MYA_AUTH_DIR", APP_DIR / "config" / "auth")) / f"{channel_key}.json"


def _token(channel_key: str, d: Path) -> str:
    a = json.loads(auth_file(channel_key).read_text(encoding="utf-8"))
    r = http("POST", TOKEN_URL, job_dir=d, release=True, data={
        "client_id": a["client_id"], "client_secret": a["client_secret"], "refresh_token": a["refresh_token"],
        "grant_type": "refresh_token"})
    if r.status_code != 200:
        raise ReleaseBlocked(f"OAuth refresh failed ({r.status_code}); re-authorize {channel_key}")
    return r.json()["access_token"]


def _verified_channel(tok: str, d: Path) -> str:
    r = http("GET", f"{API}/youtube/v3/channels", job_dir=d, release=True, params={"part": "id", "mine": "true"},
             headers={"Authorization": f"Bearer {tok}"})
    items = r.json().get("items", []) if r.status_code == 200 else []
    if len(items) != 1:
        raise ReleaseBlocked(f"could not identify exactly one authorized channel (HTTP {r.status_code}, {len(items)} items)")
    return items[0]["id"]


def preflight(job_id: str) -> dict:
    """Everything that must be true before any upload request. Raises ReleaseBlocked with the reason."""
    c = db.connect()
    j = dict(db.job(c, job_id))
    p = cfg().profile(j["channel_key"])
    pol = p.raw.get("release_policy", {})
    d = job_dir(job_id)
    if not cfg().runtime.get("upload_enabled"):
        raise ReleaseBlocked("uploads are disabled globally (runtime.upload_enabled=false); local exports only")
    if not pol.get("enabled"):
        raise ReleaseBlocked(f"{p.key}: release_policy.enabled is false; local exports only")
    if not auth_file(p.key).exists():
        raise ReleaseBlocked(f"{p.key}: no authorization record at {auth_file(p.key)}; the owner must authorize this channel")
    if not p.raw.get("channel_id"):
        raise ReleaseBlocked(f"{p.key}: profile has no channel_id to verify the authorization against")
    q = read_json(d / "qc.json")
    if not q or not q["release"]["eligible"]:
        raise ReleaseBlocked("job is not release-eligible: " + ", ".join((q or {}).get("release", {}).get("reasons", ["no QC yet"])))
    if pol.get("require_editorial_pass", True) and not q["editorial"]["passed"]:
        raise ReleaseBlocked("editorial review has not passed")
    privacy = pol.get("privacy") or cfg().runtime.get("default_privacy", "private")
    if privacy not in ("private", "unlisted", "public"):
        raise ReleaseBlocked(f"invalid privacy '{privacy}'")
    script = read_json(d / "script.json")
    desc = script["description"].rstrip() + "\n\n" + "\n".join(p.raw.get("disclaimers", []))
    srcs = read_json(d / "claims.json")["sources"]
    desc += "\n\nSources:\n" + "\n".join(f"- {s['title']} ({s['publisher']}): {s['url']}" for s in srcs)
    imgs = [a for a in read_json(d / "assets.json")["assets"] if a["kind"] == "image"]
    if imgs:
        desc += "\n\nImage credits:\n" + "\n".join(f"- {a['credit']}" for a in imgs)
    body = {
        "snippet": {"title": script["title"][:100], "description": desc[:4900], "categoryId": "27"},
        "status": {"privacyStatus": privacy, "selfDeclaredMadeForKids": bool(p.raw.get("made_for_kids", False)),
                   # realistic synthetic media disclosure follows the actual video: these are stylized motion graphics
                   # with a synthetic narrator, not realistic depictions of real events or people.
                   "containsSyntheticMedia": bool(p.raw.get("realistic_synthetic_media", False))},
    }
    if privacy == "private" and j.get("publish_at_utc") and pol.get("schedule_publish"):
        body["status"]["publishAt"] = j["publish_at_utc"]
    return {"job": j, "profile": p, "body": body, "privacy": privacy, "file": d / "final.mp4"}


def upload(job_id: str, log=print) -> dict:
    c = db.connect()
    pf = preflight(job_id)
    j, p, d = pf["job"], pf["profile"], job_dir(job_id)
    rel = c.execute("SELECT * FROM releases WHERE job_id=?", (job_id,)).fetchone()
    if rel and rel["remote_video_id"]:
        return {"state": "already_uploaded", "video_id": rel["remote_video_id"]}
    tok = _token(p.key, d)
    real = _verified_channel(tok, d)
    if real != p.raw["channel_id"]:
        raise ReleaseBlocked(f"authorized channel is {real}, but the profile expects {p.raw['channel_id']}; refusing")
    size = pf["file"].stat().st_size
    hdr = {"Authorization": f"Bearer {tok}"}
    if rel and rel["state"] == "upload_unknown" and rel["session_url"]:
        log("  previous upload outcome unknown: reconciling with the resumable session first")
        out = _reconcile(c, job_id, rel["session_url"], size, hdr, d)
        if out:
            return out
    if not (rel and rel["session_url"]):
        init = http("POST", f"{API}/upload/youtube/v3/videos", job_dir=d, release=True,
                    params={"uploadType": "resumable", "part": "snippet,status"},
                    headers={**hdr, "Content-Type": "application/json; charset=UTF-8",
                             "X-Upload-Content-Type": "video/mp4", "X-Upload-Content-Length": str(size)},
                    json=pf["body"])
        if init.status_code != 200 or "Location" not in init.headers:
            raise ReleaseBlocked(f"could not start an upload session (HTTP {init.status_code}): {init.text[:200]}")
        session = init.headers["Location"]
        c.execute("INSERT OR REPLACE INTO releases (job_id, channel_key, state, session_url, privacy, request, updated_utc) "
                  "VALUES (?,?,?,?,?,?,?)", (job_id, p.key, "uploading", session, pf["privacy"], db.jdump(pf["body"]), now_utc()))
    else:
        session = rel["session_url"]
    db.set_state(c, job_id, "uploading")
    try:
        with open(pf["file"], "rb") as f:
            r = http("PUT", session, job_dir=d, release=True, data=f, timeout=float(os.environ.get("MYA_UPLOAD_TIMEOUT", 600)),
                     headers={**hdr, "Content-Type": "video/mp4", "Content-Length": str(size)})
    except requests.Timeout:
        c.execute("UPDATE releases SET state='upload_unknown', updated_utc=? WHERE job_id=?", (now_utc(), job_id))
        db.set_state(c, job_id, "upload_unknown", "upload timed out; the server may have accepted it. Reconcile before retrying.")
        return {"state": "upload_unknown"}
    return _done(c, job_id, r)


def _done(c, job_id: str, r) -> dict:
    if r.status_code not in (200, 201):
        raise ReleaseBlocked(f"upload failed (HTTP {r.status_code}): {r.text[:200]}")
    vid = r.json()["id"]
    c.execute("UPDATE releases SET state='uploaded', remote_video_id=?, response=?, updated_utc=? WHERE job_id=?",
              (vid, r.text[:2000], now_utc(), job_id))
    c.execute("UPDATE jobs SET remote_video_id=? WHERE job_id=?", (vid, job_id))
    st = json.loads(r.text).get("status", {})
    db.set_state(c, job_id, "scheduled" if st.get("publishAt") else "published" if st.get("privacyStatus") == "public" else "scheduled")
    write_json_atomic(job_dir(job_id) / "upload.json", {"video_id": vid, "status": st, "utc": now_utc()})
    return {"state": "uploaded", "video_id": vid}


def _reconcile(c, job_id: str, session: str, size: int, hdr: dict, d: Path) -> dict | None:
    """Ask the resumable session what it received (PUT with Content-Range: bytes */size)."""
    r = http("PUT", session, job_dir=d, release=True, headers={**hdr, "Content-Length": "0", "Content-Range": f"bytes */{size}"})
    if r.status_code in (200, 201):
        return _done(c, job_id, r)  # the earlier request DID complete: record it, upload nothing
    if r.status_code == 308:
        rng = r.headers.get("Range", "")  # e.g. "bytes=0-1048575": resume after the last received byte
        nxt = int(rng.split("-")[-1]) + 1 if rng else 0
        c.execute("UPDATE releases SET state='resuming', updated_utc=? WHERE job_id=?", (now_utc(), job_id))
        with open(job_dir(job_id) / "final.mp4", "rb") as f:
            f.seek(nxt)
            r2 = http("PUT", session, job_dir=d, release=True, data=f.read(),
                      headers={**hdr, "Content-Length": str(size - nxt), "Content-Range": f"bytes {nxt}-{size - 1}/{size}"})
        return _done(c, job_id, r2)  # same session resumed; never a second upload
    if r.status_code == 404:
        c.execute("UPDATE releases SET session_url=NULL, state='session_expired', updated_utc=? WHERE job_id=?", (now_utc(), job_id))
        raise ReleaseBlocked("upload session expired with unknown outcome; check the channel's uploads before re-uploading")
    raise ReleaseBlocked(f"could not reconcile the upload session (HTTP {r.status_code})")
