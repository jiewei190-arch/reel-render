"""Cross-process lock so several reelbot runs (one per channel) can work in parallel on one PC. Engine steps that write
or read the shared source tree (recipe_build, tsc, remotion bundle) take this lock for a few seconds each; the GPU
render itself is serialized by the engine's gpu_lock.py. A lock left by a crashed run is taken over after STALE_S."""
from __future__ import annotations

import contextlib
import json
import os
import time
from pathlib import Path

STALE_S = 15 * 60


@contextlib.contextmanager
def held(path: Path, label: str = ""):
    path.parent.mkdir(parents=True, exist_ok=True)
    waited = 0.0
    while True:
        try:
            fd = os.open(path, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
            os.write(fd, json.dumps({"pid": os.getpid(), "t": time.time(), "label": label}).encode())
            os.close(fd)
            break
        except FileExistsError:
            try:
                if time.time() - path.stat().st_mtime > STALE_S:
                    path.unlink(missing_ok=True)
                    continue
            except FileNotFoundError:
                continue
            if waited == 0:
                print(f"  waiting for the engine lock ({label})...")
            time.sleep(2)
            waited += 2
    try:
        yield
    finally:
        path.unlink(missing_ok=True)
