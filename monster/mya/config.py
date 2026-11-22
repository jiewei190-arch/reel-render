"""Profiles, runtime settings and paths. Everything is read from config/channel_profiles.json (editable)."""
from __future__ import annotations

import hashlib
import re
import json
import os
from dataclasses import dataclass
from pathlib import Path

APP_DIR = Path(__file__).resolve().parent.parent            # .../monster
CONFIG_FILE = Path(os.environ.get("MYA_PROFILES", APP_DIR / "config" / "channel_profiles.json"))
RENDERER_DIR = Path(os.environ.get("MYA_RENDERER", APP_DIR / "renderer"))
SCHEMA_DIR = APP_DIR / "schemas"


def home() -> Path:
    """Where the database, jobs and outputs live (MYA_HOME, default monster/data)."""
    p = Path(os.environ.get("MYA_HOME", APP_DIR / "data")).expanduser()
    p.mkdir(parents=True, exist_ok=True)
    return p


class ConfigError(SystemExit):
    pass


@dataclass(frozen=True)
class Profile:
    raw: dict

    def __getattr__(self, k):
        try:
            return self.raw[k]
        except KeyError as e:
            raise AttributeError(k) from e

    @property
    def lang(self) -> str:
        # Kokoro language comes from the voice id: a = American English, b = British English.
        return self.raw["voice"][0]

    def fingerprint(self) -> str:
        return hashlib.sha256(json.dumps(self.raw, sort_keys=True).encode()).hexdigest()[:16]


class Config:
    def __init__(self, path: Path | None = None):
        self.path = Path(path or CONFIG_FILE)
        self.data = json.loads(self.path.read_text(encoding="utf-8"))
        self.runtime: dict = self.data["runtime"]
        self.formats: dict = self.data["formats"]
        self.profiles: dict[str, Profile] = {c["key"]: Profile(c) for c in self.data["channels"]}
        self.validate()

    def validate(self) -> None:
        rt = self.runtime
        # The money rules are not preferences: refuse to run with them switched on.
        for k in ("allow_paid_generators", "allow_cloud_inference", "cloud_fallback", "allow_remote_voice"):
            if rt.get(k):
                raise ConfigError(f"config: runtime.{k} must be false; this app never uses paid or remote generators")
        if rt.get("tts_backend") != "kokoro_local":
            raise ConfigError("config: tts_backend must be kokoro_local (no remote voice providers are implemented)")
        keys = list(self.profiles)
        if len(keys) != len(set(keys)):
            raise ConfigError("config: channel keys must be unique")
        for p in self.profiles.values():
            for f in ("key", "voice", "theme", "scene_types", "short_seconds", "long_seconds", "schedule"):
                if f not in p.raw:
                    raise ConfigError(f"config: channel {p.raw.get('key')} is missing '{f}'")
            days = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"}
            for sl in p.raw["schedule"].get("slots", []):
                if sl.get("format") not in ("short", "long") or not re.fullmatch(r"\d{2}:\d{2}", sl.get("time", "")):
                    raise ConfigError(f"config: {p.key} has an invalid schedule slot {sl}")
                if set(sl.get("weekdays", [])) - days:
                    raise ConfigError(f"config: {p.key} slot weekdays must be among {sorted(days)}")
            for fmt in ("short", "long"):
                lo, hi = self.formats[fmt]["min_seconds"], self.formats[fmt]["max_seconds"]
                t = p.raw[f"{fmt}_seconds"]
                if not lo <= t <= hi:
                    raise ConfigError(f"config: {p.key}.{fmt}_seconds={t} is outside {lo}-{hi}")

    def profile(self, key: str) -> Profile:
        if key not in self.profiles:
            raise ConfigError(f"unknown channel '{key}'; known: {', '.join(self.profiles)}")
        return self.profiles[key]

    def version(self) -> str:
        return hashlib.sha256(self.path.read_bytes()).hexdigest()[:16]


_cfg: Config | None = None


def cfg() -> Config:
    global _cfg
    if _cfg is None:
        _cfg = Config()
    return _cfg


def reset() -> None:
    global _cfg
    _cfg = None
