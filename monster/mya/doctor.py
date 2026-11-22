"""`doctor`: what this machine actually has. Nothing is assumed: GPU/VRAM, RAM, disk, tool versions, fonts, models."""
from __future__ import annotations

import json
import os
import platform
import re
import shutil
import subprocess
import sys

import requests

from .config import RENDERER_DIR, cfg, home
from .util import free_disk_gb, npx


def _cmd(args: list[str]) -> str:
    try:
        r = subprocess.run(args, capture_output=True, text=True, timeout=60)
        return (r.stdout or r.stderr).strip()
    except Exception as e:  # noqa: BLE001
        return f"unavailable ({type(e).__name__})"


def ram_gb() -> float | None:
    try:
        import psutil
        return round(psutil.virtual_memory().total / 1e9, 1)
    except ImportError:
        if os.path.exists("/proc/meminfo"):
            kb = int(re.search(r"MemTotal:\s+(\d+)", open("/proc/meminfo").read()).group(1))
            return round(kb / 1e6, 1)
    return None


def gpu() -> dict:
    if not shutil.which("nvidia-smi"):
        return {"found": False, "note": "no NVIDIA GPU / driver visible (nvidia-smi not found)"}
    out = _cmd(["nvidia-smi", "--query-gpu=name,memory.total,driver_version", "--format=csv,noheader,nounits"])
    try:
        name, mem, drv = [x.strip() for x in out.splitlines()[0].split(",")]
        return {"found": True, "name": name, "vram_gb": round(int(mem) / 1024, 1), "driver": drv}
    except Exception:  # noqa: BLE001
        return {"found": False, "note": out[:200]}


def recommend_model(g: dict) -> str:
    """Local text model sized to the real VRAM (Q4 weights + context headroom). Labelled a recommendation."""
    v = g.get("vram_gb") or 0
    if v >= 11:
        return "qwen2.5:14b"
    if v >= 7:
        return "qwen2.5:7b"
    return "qwen2.5:3b"


def nvenc_works() -> bool:
    if not shutil.which("ffmpeg"):
        return False
    r = subprocess.run(["ffmpeg", "-v", "error", "-f", "lavfi", "-i", "color=c=black:s=256x256:d=0.2", "-c:v", "h264_nvenc",
                        "-f", "null", "-"], capture_output=True, text=True)
    return r.returncode == 0


def run() -> dict:
    rt = cfg().runtime
    g = gpu()
    rep = {
        "os": f"{platform.system()} {platform.release()}", "python": sys.version.split()[0], "cpu_count": os.cpu_count(),
        "ram_gb": ram_gb(), "gpu": g, "free_disk_gb": round(free_disk_gb(home()), 1), "data_dir": str(home()),
        "node": _cmd(["node", "--version"]), "ffmpeg": _cmd(["ffmpeg", "-version"]).splitlines()[0][:80] if shutil.which("ffmpeg") else "MISSING",
        "libass": "ass" in _cmd(["ffmpeg", "-hide_banner", "-filters"]) if shutil.which("ffmpeg") else False,
        "hardware_h264_encoder": nvenc_works(),
        "remotion": json.loads((RENDERER_DIR / "package.json").read_text())["dependencies"]["remotion"],
        "renderer_installed": (RENDERER_DIR / "node_modules" / "remotion").exists(),
        "fonts": sorted(f.name for f in (RENDERER_DIR / "public" / "fonts").glob("*.ttf")),
    }
    try:
        import kokoro
        rep["kokoro"] = getattr(kokoro, "__version__", "installed")
    except ImportError:
        rep["kokoro"] = "MISSING (pip install -r requirements.txt)"
    try:
        tags = requests.get(rt["ollama_endpoint"].rstrip("/") + "/api/tags", timeout=5).json()
        rep["ollama_models"] = [m["name"] for m in tags.get("models", [])]
    except Exception as e:  # noqa: BLE001
        rep["ollama_models"] = f"Ollama not reachable at {rt['ollama_endpoint']} ({type(e).__name__})"
    rep["ollama_model_configured"] = os.environ.get("MYA_OLLAMA_MODEL") or rt.get("ollama_model")
    rep["ollama_model_recommended"] = recommend_model(g) + " (recommendation from measured VRAM; benchmark before relying on it)"
    rep["llm_backend"] = os.environ.get("MYA_LLM", rt["primary_llm_backend"])
    rep["paid_providers"] = "disabled (config validated: no paid or remote voice/image/video/inference adapters exist)"
    rep["release"] = "uploads disabled" if not rt.get("upload_enabled") else "uploads enabled per channel policy"
    missing = []
    if not rep["renderer_installed"]:
        missing.append("renderer: run `npm ci` in monster/renderer")
    if str(rep["kokoro"]).startswith("MISSING"):
        missing.append("Kokoro TTS")
    if isinstance(rep["ollama_models"], str):
        missing.append("Ollama server")
    elif not rep["ollama_model_configured"]:
        missing.append("runtime.ollama_model is not set")
    if rep["free_disk_gb"] < rt.get("min_free_disk_gb", 2):
        missing.append(f"free disk below {rt.get('min_free_disk_gb', 2)} GB")
    rep["missing"] = missing
    return rep
