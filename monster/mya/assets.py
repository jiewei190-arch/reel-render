"""Assets with item-level rights. Owned assets (our components, the bundled OFL font) are recorded with checksums.
External images come only from Wikimedia Commons, and only when the file's own metadata says public domain, CC0,
CC BY or CC BY-SA (no NC/ND, no unknown). Each accepted item stores author, license, URL, credit line and checksum.
"""
from __future__ import annotations

import html
import json
import re
import shutil
import time
from pathlib import Path

from .config import RENDERER_DIR, home
from .util import http, sha256_bytes, sha256_file

WIKI = "https://en.wikipedia.org/w/api.php"
COMMONS = "https://commons.wikimedia.org/w/api.php"
OK_LICENSE = re.compile(r"^(public domain|pd\b|pd-|cc0|cc[ -]by(-sa)?[ -]?\d)", re.I)
BAD_LICENSE = re.compile(r"\b(nc|nd|non[- ]?commercial|no[- ]?deriv)", re.I)


class AssetError(RuntimeError):
    pass


def _faults() -> dict:
    p = home() / "faults.json"
    return json.loads(p.read_text()) if p.exists() else {}


def owned_assets() -> list[dict]:
    out = []
    for f in sorted((RENDERER_DIR / "public" / "fonts").glob("*.ttf")):
        out.append({"id": "font:" + f.name, "kind": "font", "source": "Liberation fonts (Red Hat)", "author": "Red Hat / Ascender",
                    "license": "SIL OFL 1.1", "license_file": "renderer/public/fonts/LIBERATION_LICENSE.txt",
                    "credit_required": False, "sha256": sha256_file(f), "use": "on-screen text and captions"})
    out.append({"id": "components:scene-library", "kind": "graphics", "source": "renderer/src/scenes.tsx (original)",
                "author": "this project", "license": "owned", "credit_required": False, "use": "all motion graphics"})
    return out


def _get(url: str, params: dict, job_dir: Path, job_id: str) -> dict:
    if job_id in _faults().get("asset_fetch", []):
        raise AssetError("asset fetch failed (fault injected for testing)")
    r = http("GET", url, job_dir=job_dir, params={**params, "format": "json", "formatversion": 2})
    if r.status_code != 200:
        raise AssetError(f"HTTP {r.status_code} from {url}")
    return r.json()


def _with_retries(fn, attempts: int = 3):
    last = None
    for i in range(attempts):
        try:
            return fn()
        except Exception as e:  # noqa: BLE001
            if "not allowed" in str(e):
                raise
            last = e
            time.sleep(min(8, 1.5 * 2 ** i))
    raise AssetError(f"asset fetch failed after {attempts} attempts: {last}")


def reference_image(article_title: str, job_dir: Path, job_id: str) -> dict | None:
    """The source article's lead image, if its license allows commercial reuse. None if there is none or it isn't allowed."""
    def go():
        pages = _get(WIKI, {"action": "query", "prop": "pageimages", "piprop": "name", "titles": article_title}, job_dir, job_id)
        name = (pages["query"]["pages"][0] or {}).get("pageimage")
        if not name:
            return None
        info = _get(COMMONS, {"action": "query", "titles": "File:" + name, "prop": "imageinfo",
                              "iiprop": "url|extmetadata|size|mime", "iiurlwidth": 1600}, job_dir, job_id)
        page = info["query"]["pages"][0]
        if page.get("missing") or not page.get("imageinfo"):
            return {"rejected": True, "file": name, "reason": "not on Commons (may be local fair-use)"}
        ii = page["imageinfo"][0]
        meta = {k: re.sub(r"<[^>]+>", "", html.unescape(str(v.get("value", "")))).strip() for k, v in ii.get("extmetadata", {}).items()}
        lic = meta.get("LicenseShortName", "")
        if not lic or BAD_LICENSE.search(lic) or not OK_LICENSE.search(lic):
            return {"rejected": True, "file": name, "license": lic or "unknown", "reason": "license not allowed for monetized use"}
        if ii.get("mime") not in ("image/jpeg", "image/png"):
            return {"rejected": True, "file": name, "reason": f"unsupported type {ii.get('mime')}"}
        r = http("GET", ii.get("thumburl") or ii["url"], job_dir=job_dir)
        if r.status_code != 200 or len(r.content) < 5000:
            raise AssetError(f"image download failed ({r.status_code})")
        digest = sha256_bytes(r.content)
        ext = "png" if ii["mime"] == "image/png" else "jpg"
        rel = f"assets/{digest[:16]}.{ext}"
        dest = job_dir / "public" / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(r.content)
        author = meta.get("Artist", "unknown")[:120]
        return {"id": rel, "kind": "image", "source": ii.get("descriptionurl"), "file": name, "author": author,
                "license": lic, "license_url": meta.get("LicenseUrl", ""), "credit_required": meta.get("AttributionRequired", "") == "true",
                "credit": f"{author}, {lic}, via Wikimedia Commons"[:160], "sha256": digest,
                "width": ii.get("thumbwidth") or ii.get("width"), "height": ii.get("thumbheight") or ii.get("height"),
                "use": "illustration of the story subject"}
    return _with_retries(go)


def prepare_public(job_dir: Path) -> Path:
    """Per-job public dir for the renderer: the bundled fonts + this job's approved assets."""
    pub = job_dir / "public"
    (pub / "fonts").mkdir(parents=True, exist_ok=True)
    for f in (RENDERER_DIR / "public" / "fonts").iterdir():
        dst = pub / "fonts" / f.name
        if not dst.exists():
            shutil.copy2(f, dst)
    return pub
