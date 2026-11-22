import os
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))


@pytest.fixture()
def home(tmp_path, monkeypatch):
    """A fresh data dir per test (its own SQLite db and job folders)."""
    monkeypatch.setenv("MYA_HOME", str(tmp_path / "home"))
    from mya import config
    config.reset()
    yield tmp_path / "home"
    config.reset()
