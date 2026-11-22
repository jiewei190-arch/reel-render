"""Small shared helpers: hashing, atomic file promotion, guarded network access, subprocess, timing."""
from __future__ import annotations

import hashlib
import json
import os
import shutil
import subprocess
import time
import urllib.parse
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path

import requests

from .config import cfg, home



def now_utc() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def sha256_bytes(b: bytes) -> str:
    return hashlib.sha256(b).hexdigest()


def sha256_file(p: Path) -> str:
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def stable_hash(obj) -> str:
    return hashlib.sha256(json.dumps(obj, sort_keys=True, ensure_ascii=False, default=str).encode()).hexdigest()


def write_json_atomic(path: Path, obj) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(path.name + ".tmp")
    tmp.write_text(json.dumps(obj, indent=1, ensure_ascii=False), encoding="utf-8")
    json.loads(tmp.read_text(encoding="utf-8"))  # validate before promotion
    os.replace(tmp, path)


def promote(tmp: Path, final: Path, check=None) -> None:
    """Validate a finished temp file, then atomically move it into place. A half-written file is never 'done'."""
    if not tmp.exists() or tmp.stat().st_size == 0:
        raise RuntimeError(f"refusing to promote empty or missing {tmp}")
    if check:
        check(tmp)
    final.parent.mkdir(parents=True, exist_ok=True)
    os.replace(tmp, final)


def read_json(path: Path, default=None):
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else default


# ---------------------------------------------------------------- guarded network egress
class EgressBlocked(RuntimeError):
    pass


def _allowed(host: str, release: bool) -> bool:
    rt = cfg().runtime
    allow = set(rt.get("egress_allowlist", [])) | (set(rt.get("release_hosts", [])) if release else set())
    extra = os.environ.get("MYA_EXTRA_HOSTS", "")  # tests point adapters at local fakes
    allow |= {h for h in extra.split(",") if h}
    return host in allow


def http(method: str, url: str, *, job_dir: Path | None = None, release: bool = False, **kw) -> requests.Response:
    """Every outbound request goes through here: hosts outside the allowlist are refused and every call is logged."""
    host = urllib.parse.urlparse(url).hostname or ""
    log = (job_dir or home()) / "egress.log"
    ok = _allowed(host, release)
    with open(log, "a", encoding="utf-8") as f:
        f.write(f"{now_utc()}\t{'ALLOW' if ok else 'BLOCK'}\t{method}\t{host}\t{url[:160]}\n")
    if not ok:
        raise EgressBlocked(f"network egress to {host} is not allowed (not on the allowlist)")
    kw.setdefault("timeout", 30)
    kw.setdefault("headers", {}).setdefault("User-Agent", cfg().runtime.get("http_user_agent", "MonsterYouTubeAutomator/0.1"))
    for attempt in range(4):
        r = requests.request(method, url, **kw)
        if r.status_code not in (429, 503) or release:
            return r
        # polite backoff: honor Retry-After (bounded), never hammer a free API
        wait = min(60.0, float(r.headers.get("Retry-After", "0") or 0) or 5.0 * 2 ** attempt)
        with open(log, "a", encoding="utf-8") as f:
            f.write(f"{now_utc()}\tBACKOFF\t{r.status_code}\t{host}\twaiting {wait:.0f}s\n")
        time.sleep(wait)
    return r


# ---------------------------------------------------------------- processes
def run(cmd: list[str], *, cwd: Path | None = None, env: dict | None = None, timeout: int | None = None) -> str:
    r = subprocess.run([str(c) for c in cmd], cwd=cwd, env={**os.environ, **(env or {})}, capture_output=True,
                       text=True, encoding="utf-8", errors="replace", timeout=timeout)
    if r.returncode != 0:
        raise RuntimeError(f"command failed ({r.returncode}): {' '.join(map(str, cmd))[:300]}\n{(r.stdout + r.stderr)[-3000:]}")
    return r.stdout + r.stderr


def which(name: str) -> str | None:
    return shutil.which(name)


def npx() -> str:
    return shutil.which("npx") or shutil.which("npx.cmd") or "npx"


@contextmanager
def timer():
    t = {"start": time.time()}
    yield t
    t["seconds"] = round(time.time() - t["start"], 2)


def free_disk_gb(p: Path) -> float:
    return shutil.disk_usage(p).free / 1e9


def peak_rss_mb() -> float:
    """Peak resident memory of this process and its finished children (MB). Linux/macOS via resource, Windows via psutil."""
    try:
        import resource
        return round((resource.getrusage(resource.RUSAGE_SELF).ru_maxrss + resource.getrusage(resource.RUSAGE_CHILDREN).ru_maxrss) / 1024, 1)
    except ImportError:
        import psutil
        mi = psutil.Process().memory_info()
        return round(getattr(mi, "peak_wset", mi.rss) / 1e6, 1)
