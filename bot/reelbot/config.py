"""Settings, read from environment variables (or a .env file next to the bot).

Keys are never stored in this repo. Set them in the shell or in bot/.env (git-ignored):
  ANTHROPIC_API_KEY, GEMINI_API_KEY, ELEVENLABS_API_KEY
"""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

BOT_DIR = Path(__file__).resolve().parent.parent


def _load_dotenv() -> None:
    env = BOT_DIR / ".env"
    if not env.exists():
        return
    for raw in env.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


_load_dotenv()


def _path(name: str, default: str) -> Path:
    return Path(os.environ.get(name, default)).expanduser()


@dataclass
class Config:
    # Models
    claude_model: str = os.environ.get("REELBOT_CLAUDE_MODEL", "claude-opus-5-5")
    claude_effort: str = os.environ.get("REELBOT_CLAUDE_EFFORT", "high")
    gemini_model: str = os.environ.get("REELBOT_GEMINI_MODEL", "gemini-2.5-pro")

    # ElevenLabs
    eleven_model: str = os.environ.get("REELBOT_ELEVEN_MODEL", "eleven_v4")
    voices: dict = field(default_factory=lambda: {
        "Tyler": "rPMkKgdwgIwqv4fXgR6N",
        "Christopher": "RolvCZ4e0AkAR2dzyTx0",
        # new channels (library voices: the owner adds each to My Voices in ElevenLabs first)
        "Steven": "VMCgCMbBs53ElBxVD4VB",    # Business
        "Todd": "g14YnDYCsy3k7XLlcKlO",      # Scams & Hacks
        "Nichalia": "XfNU2rGpBa01ckF309OY",  # Law
        "Liam": "VCgLBmBjldJmfphyB8sZ",      # Justin clips Shorts
        "Russ": "t0eCaS57KWbQQc1wRkah",      # Justin clips long videos
    })

    # Paths on the PC
    # render_root = the Remotion project (finance/render-pc on the PC: C:\Users\jiewe\blocky-render)
    render_root: Path = _path("REELBOT_RENDER_ROOT", str(Path.home() / "blocky-render"))
    # shorts_dir = where each Short's folder lives (recipe_build reads <shorts>/<slug>/recipe.json)
    shorts_dir: Path = _path("REELBOT_SHORTS_DIR", str(BOT_DIR / "work" / "shorts"))
    # audio_dir = toon3d library with music/*.wav and sfx/*.wav (story_mix.py)
    audio_dir: Path = _path("REELBOT_AUDIO_DIR", str(Path.home() / "blocky-render" / "public" / "audio"))
    # output_dir = finished videos + UPLOAD.md (nothing is uploaded anywhere)
    output_dir: Path = _path("REELBOT_OUTPUT_DIR", str(Path.home() / "Videos" / "BlockMoney"))
    # docs: FORMAT_V1.md / RULES.md / RECIPE_GUIDE.md and recipe examples are read from here if present
    repo_root: Path = _path("REELBOT_REPO_ROOT", str(BOT_DIR.parent))

    bash: str = os.environ.get("REELBOT_BASH", "bash")
    python: str = os.environ.get("REELBOT_PYTHON", "python")
    node: str = os.environ.get("REELBOT_NODE", "node")

    # Limits
    recipe_attempts: int = int(os.environ.get("REELBOT_RECIPE_ATTEMPTS", "5"))
    factcheck_rounds: int = int(os.environ.get("REELBOT_FACTCHECK_ROUNDS", "2"))

    def require_keys(self, *names: str) -> None:
        missing = [n for n in names if not os.environ.get(n)]
        if missing:
            raise SystemExit(
                "Missing API key(s): " + ", ".join(missing)
                + "\nSet them in your shell or in bot/.env (see bot/.env.example). Never paste keys into chat.")


CFG = Config()
