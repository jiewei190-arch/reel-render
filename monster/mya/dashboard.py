"""Local review dashboard: five channel columns, job progress, links to each job's review page, revision requests.
Run: python -m mya review   (http://127.0.0.1:8765). Serves only on localhost."""
from __future__ import annotations

import html
import http.server
import json
import urllib.parse

from . import db, pipeline
from .config import cfg, home

CSS = """body{font-family:system-ui,Segoe UI,Arial;margin:0;background:#0f1218;color:#e8edf3}header{padding:14px 20px;background:#151a22}
.cols{display:grid;grid-template-columns:repeat(5,minmax(220px,1fr));gap:12px;padding:16px;overflow-x:auto}
.col{background:#151a22;border-radius:10px;padding:10px}.card{background:#1d2430;border-radius:8px;padding:8px;margin:8px 0;font-size:13px}
.st{font-weight:700}.ok{color:#3ddc97}.bad{color:#ff6b6b}.mid{color:#f4b544}a{color:#7cc4ff}small{color:#9fb3c8}
form{margin-top:6px}input,textarea,button{font-size:12px;width:100%;box-sizing:border-box;margin-top:3px}"""

GOOD = {"ready_for_release", "scheduled", "published"}
BAD = {"blocked", "qc_failed", "upload_unknown"}


def board() -> str:
    c = db.connect()
    cols = []
    for key, p in cfg().profiles.items():
        jobs = c.execute("SELECT * FROM jobs WHERE channel_key=? AND state!='cancelled' ORDER BY local_publish_date DESC, created_utc DESC LIMIT 12",
                         (key,)).fetchall()
        cards = []
        for j in jobs:
            cls = "ok" if j["state"] in GOOD else "bad" if j["state"] in BAD else "mid"
            done = c.execute("SELECT COUNT(*) FROM stage_runs WHERE job_id=? AND status='done'", (j["job_id"],)).fetchone()[0]
            cards.append(
                f"<div class=card><div><a href='/jobs/{j['job_id']}/review.html'>{html.escape(j['topic'])}</a></div>"
                f"<small>{j['local_publish_date']} · {j['format_kind']} · {done}/{len(pipeline.STAGES)} stages</small>"
                f"<div class='st {cls}'>{j['state']}</div>" + (f"<small class=bad>{html.escape((j['error'] or '')[:160])}</small>" if j["error"] else "")
                + f"<form method=post action='/revise'><input type=hidden name=job value='{j['job_id']}'>"
                  "<input name=scene placeholder='scene id, e.g. sc03'><textarea name=narration rows=2 placeholder='new narration (optional)'></textarea>"
                  "<input name=note placeholder='what is wrong'><button>request revision</button></form></div>")
        cols.append(f"<div class=col><b>{html.escape(p.working_name)}</b><br><small>{html.escape(p.niche)}</small>{''.join(cards) or '<p><small>no jobs yet</small></p>'}</div>")
    return (f"<!doctype html><meta charset=utf-8><title>Monster YouTube Automator</title><style>{CSS}</style>"
            "<header><b>Monster YouTube Automator</b> <small>local review dashboard · nothing here uploads</small></header>"
            f"<div class=cols>{''.join(cols)}</div>")


class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=str(home()), **k)

    def do_GET(self):  # noqa: N802
        if self.path in ("/", "/index.html"):
            body = board().encode()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            self.wfile.write(body)
            return
        if not self.path.startswith("/jobs/"):
            self.send_error(404)
            return
        super().do_GET()

    def do_POST(self):  # noqa: N802
        n = int(self.headers.get("Content-Length", 0))
        f = {k: v[0] for k, v in urllib.parse.parse_qs(self.rfile.read(n).decode()).items()}
        if self.path == "/revise" and f.get("job") and f.get("scene"):
            pipeline.revise(f["job"], f["scene"], narration=f.get("narration") or None, note=f.get("note", ""))
        self.send_response(303)
        self.send_header("Location", "/")
        self.end_headers()


def serve(port: int = 8765) -> None:
    print(f"dashboard: http://127.0.0.1:{port}  (Ctrl+C to stop)")
    http.server.ThreadingHTTPServer(("127.0.0.1", port), H).serve_forever()
