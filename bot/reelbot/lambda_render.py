"""Render on Remotion Lambda (AWS): the same composition the PC renders, split across many cloud machines at once.

Keys (in bot/.env, pasted by the owner, never committed):
  REMOTION_AWS_ACCESS_KEY_ID, REMOTION_AWS_SECRET_ACCESS_KEY, REMOTION_AWS_REGION (default us-east-1)

  python -m reelbot lambda setup        # once: installs @remotion/lambda, checks permissions, deploys the function
  python -m reelbot lambda quotas       # how many machines AWS lets us run at once
  python -m reelbot render <slug> --on lambda

The output is the same muted 30 fps video the PC makes (no motion blur by default; REELBOT_MOTION_BLUR=1 turns it
on), so the mix, loudness, QA and the AI editors work unchanged.
"""
from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import time
from pathlib import Path

from .config import CFG
from .cost import COST

SUB = 4  # sub-frames per output frame in the <Comp>Sub compositions (render.sh does the same)
SITE = os.environ.get("REELBOT_LAMBDA_SITE", "reelbot")
MEMORY = os.environ.get("REELBOT_LAMBDA_MEMORY", "3008")  # 3008 MB is the max on new AWS accounts; more memory = more CPU
REGION_DEFAULT = "us-east-1"


def _npx() -> str:
    return shutil.which("npx") or "npx"


def _env() -> dict:
    missing = [k for k in ("REMOTION_AWS_ACCESS_KEY_ID", "REMOTION_AWS_SECRET_ACCESS_KEY") if not os.environ.get(k)]
    if missing:
        raise SystemExit("Lambda needs " + " and ".join(missing) + " in bot/.env (see bot/aws/SETUP.md).")
    return {**os.environ, "REMOTION_AWS_REGION": os.environ.get("REMOTION_AWS_REGION", REGION_DEFAULT)}


def _run(args: list[str], *, check: bool = True, show: bool = False) -> str:
    cmd = [_npx(), "--no-install", "remotion", "lambda", *args]
    print("  $ npx remotion lambda", " ".join(args[:3]), "...")
    r = subprocess.run(cmd, cwd=CFG.render_root, env=_env(), capture_output=not show, text=True,
                       encoding="utf-8", errors="replace")
    out = "" if show else (r.stdout or "") + (r.stderr or "")
    if check and r.returncode != 0:
        raise SystemExit(f"remotion lambda {args[0]} failed ({r.returncode}):\n{out[-4000:]}")
    return out


def _remotion_version() -> str:
    p = CFG.render_root / "node_modules" / "remotion" / "package.json"
    if not p.exists():
        raise SystemExit(f"{p} not found: run npm ci in the render folder first")
    return json.loads(p.read_text(encoding="utf-8"))["version"]


def _ensure_package() -> None:
    """@remotion/lambda must match the engine's Remotion version exactly. Installed without touching package.json."""
    v = _remotion_version()
    p = CFG.render_root / "node_modules" / "@remotion" / "lambda" / "package.json"
    if p.exists() and json.loads(p.read_text(encoding="utf-8"))["version"] == v:
        return
    print(f"  installing @remotion/lambda@{v} (matches the engine)")
    r = subprocess.run([shutil.which("npm") or "npm", "install", "--no-save", "--no-audit", "--no-fund",
                        f"@remotion/lambda@{v}"], cwd=CFG.render_root, capture_output=True, text=True,
                       encoding="utf-8", errors="replace")
    if r.returncode != 0:
        raise SystemExit(f"npm install @remotion/lambda failed:\n{(r.stdout + r.stderr)[-3000:]}")


def setup() -> None:
    _env()
    _ensure_package()
    print("  checking AWS permissions...")
    print(_run(["policies", "validate"]))
    print(f"  deploying the render function ({MEMORY} MB, 10 GB disk, 15 min timeout)...")
    print(_run(["functions", "deploy", f"--memory={MEMORY}", "--disk=10240", "--timeout=900",
                "--retention-period=7"]))
    quotas()
    print("Lambda is ready. Render with:  python -m reelbot render <slug> --on lambda")


def quotas() -> None:
    _env()
    _ensure_package()
    print(_run(["quotas"], check=False))
    print("If 'concurrency' is low (new accounts often start at 10), run:  python -m reelbot lambda quotas --increase\n"
          "and wait for AWS to approve it (free; usually a day or two). Until then renders still work, just slower.")


def quotas_increase() -> None:
    _env()
    _ensure_package()
    _run(["quotas", "increase"], show=True)


def _deploy_site() -> str:
    """Upload the current bundle (with this Short's generated recipe) and return its serve URL."""
    print("  lambda: uploading the project bundle...")
    out = _run(["sites", "create", "src/index.toolkit.ts", f"--site-name={SITE}", "--enable-folder-expiry"])
    urls = re.findall(r"https://\S+?/sites/\S+?/index\.html", out) or re.findall(r"https://\S+", out)
    if not urls:
        raise SystemExit(f"could not find the serve URL in:\n{out[-2000:]}")
    return urls[-1].rstrip(".,)")


def _cost(out: str) -> float:
    m = re.findall(r"(?i)(?:cost|estimated)[^$\n]*\$\s?([0-9]+(?:\.[0-9]+)?)", out)
    return float(m[-1]) if m else 0.0


def render(comp: str, muted_out: Path, *, blur: bool = False) -> Path:
    """Render <comp>Sub (motion blur) or <comp> (no blur, ~4x cheaper) on Lambda into muted_out (30 fps, no audio)."""
    _ensure_package()
    subprocess.run([_npx(), "--no-install", "tsc", "--noEmit"], cwd=CFG.render_root, check=True)
    url = _deploy_site()
    target = comp + ("Sub" if blur else "")
    raw = muted_out.with_name(muted_out.stem + ("_sub" if blur else "_raw") + ".mp4")
    args = ["render", url, target, str(raw), "--muted", "--codec=h264", "--crf=10", "--pixel-format=yuv420p",
            "--gl=swangle", "--timeout=240000", "--privacy=private", "--delete-after=1-day", "--max-retries=2"]
    if os.environ.get("REELBOT_LAMBDA_FRAMES_PER"):
        args.append(f"--frames-per-lambda={os.environ['REELBOT_LAMBDA_FRAMES_PER']}")
    print(f"  lambda: rendering {target} in the cloud...")
    t0 = time.time()
    out = _run(args)
    cost = _cost(out)
    COST.lambda_usd += cost
    print(f"  lambda: rendered in {time.time() - t0:.0f} s" + (f", cost about ${cost:.3f}" if cost else ""))
    vf = (f"tmix=frames={SUB}:weights='1 1 1 1',select='eq(mod(n\\,{SUB})\\,{SUB - 1})',setpts=N/30/TB" if blur
          else "setpts=N/30/TB")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-vf", vf, "-r", "30", "-c:v", "libx264",
                    "-crf", "16", "-preset", "slow", "-pix_fmt", "yuv420p", "-an", "-map_metadata", "-1",
                    "-movflags", "+faststart", str(muted_out)], check=True)
    (muted_out.parent / (muted_out.stem + "_lambda.txt")).write_text(
        f"comp={target} seconds={time.time() - t0:.0f} cost_usd={cost}\n\n{out[-6000:]}", encoding="utf-8")
    return muted_out
