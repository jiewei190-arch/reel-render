"""One HTML review page per job: preview/final video, script with claims, scene stills, rights, findings, history."""
from __future__ import annotations

import html
import json

from . import db
from .config import cfg
from .pipeline import STAGES, job_dir
from .util import read_json

CSS = """body{font-family:system-ui,Segoe UI,Arial;margin:0;background:#0f1218;color:#e8edf3}main{max-width:1200px;margin:auto;padding:20px}
h1{font-size:22px}h2{font-size:17px;margin-top:28px;border-bottom:1px solid #2a3240;padding-bottom:6px}
table{border-collapse:collapse;width:100%;font-size:14px}td,th{border:1px solid #2a3240;padding:6px;vertical-align:top;text-align:left}
.ok{color:#3ddc97}.bad{color:#ff6b6b}.warn{color:#f4b544}video{max-height:640px;background:#000}img{max-width:100%}
.pill{display:inline-block;padding:2px 8px;border-radius:10px;background:#2a3240;margin-right:6px;font-size:12px}a{color:#7cc4ff}"""


def esc(x) -> str:
    return html.escape(str(x if x is not None else ""))


def page(job_id: str) -> str:
    c = db.connect()
    j = dict(db.job(c, job_id))
    d = job_dir(job_id)
    p = cfg().profile(j["channel_key"])
    script, claims = read_json(d / "script.json", {}), read_json(d / "claims.json", {})
    board, q, a = read_json(d / "storyboard.json", {}), read_json(d / "qc.json", {}), read_json(d / "assets.json", {})
    ov = read_json(d / "overrides.json", {})
    runs = {r["stage"]: dict(r) for r in c.execute("SELECT * FROM stage_runs WHERE job_id=?", (job_id,))}
    video = "final.mp4" if (d / "final.mp4").exists() else ("preview.mp4" if (d / "preview.mp4").exists() else None)
    by = {b["id"]: b for b in board.get("scenes", [])}
    parts = [f"<!doctype html><meta charset=utf-8><title>{esc(j['topic'])}</title><style>{CSS}</style><main>",
             f"<h1>{esc(p.working_name)}: {esc(script.get('title') or j['topic'])}</h1>",
             f"<p><span class=pill>{esc(j['format_kind'])}</span><span class=pill>publish {esc(j['local_publish_date'])} "
             f"{esc(p.publish_time_local)} {esc(cfg().runtime['timezone'])}</span><span class=pill>state: {esc(j['state'])}</span>"
             + (f"<span class='pill bad'>{esc(j['error'])}</span>" if j.get("error") else "") + "</p>"]
    if video:
        parts.append(f"<video controls src='{video}'></video>")
    if q:
        t, e, r = q["technical"], q["editorial"], q["release"]
        parts.append("<h2>Verdicts</h2><table><tr><th>technical</th><th>editorial</th><th>release</th></tr><tr>"
                     f"<td class={'ok' if t['passed'] else 'bad'}>{'PASS' if t['passed'] else 'FAIL'}<br>{esc(json.dumps(t['checks']))}</td>"
                     f"<td class={'ok' if e['passed'] else 'bad'}>{'PASS' if e['passed'] else 'NEEDS WORK'} (hook {e['hook']}, explanation "
                     f"{e['explanation']}, payoff {e['payoff']}, visuals {e['visual_relevance']})<br><small>{esc(e.get('reviewer'))}</small></td>"
                     f"<td class={'ok' if r['eligible'] else 'warn'}>{'eligible' if r['eligible'] else 'not eligible: ' + esc(', '.join(r['reasons']))}</td></tr></table>")
        fs = t["findings"] + e["findings"] + q.get("stage_findings", [])
        if fs:
            parts.append("<h2>Findings</h2><table><tr><th>severity</th><th>finding</th></tr>" + "".join(
                f"<tr><td class={'bad' if f['severity'] != 'minor' else 'warn'}>{esc(f['severity'])}</td><td>{esc(f.get('scene', ''))} "
                f"{esc(f['finding'])}</td></tr>" for f in fs) + "</table>")
        if q.get("asr", {}).get("checked"):
            parts.append(f"<p>Independent speech check ({esc(q['asr']['model'])}): heard {q['asr']['recall']:.0%} of the script words.</p>")
    if script:
        parts.append(f"<h2>Script</h2><p><b>Audience question:</b> {esc(script.get('audience_question'))}<br><b>Promise:</b> "
                     f"{esc(script.get('promise'))}<br><b>Originality:</b> {esc(script.get('originality_note'))}</p>"
                     "<table><tr><th>scene</th><th>narration (display)</th><th>spoken</th><th>visual</th><th>claims</th></tr>")
        for s in script["scenes"]:
            b = by.get(s["id"], {})
            parts.append(f"<tr><td>{esc(s['id'])}{' (revised)' if s.get('revised') else ''}</td><td>{esc(s['narration'])}</td>"
                         f"<td><small>{esc(s.get('spoken'))}</small></td><td>{esc(b.get('type'))}<br><small>{esc(json.dumps(b.get('params', {}))[:220])}</small></td>"
                         f"<td>{esc(', '.join(s['claim_ids']))}</td></tr>")
        parts.append("</table>")
    if claims:
        src = {s["id"]: s for s in claims.get("sources", [])}
        parts.append("<h2>Claim ledger</h2><table><tr><th>id</th><th>status</th><th>claim</th><th>supporting passage</th><th>source</th></tr>")
        for cl in claims["claims"]:
            s = src.get(cl["source_ids"][0], {})
            parts.append(f"<tr><td>{esc(cl['id'])}</td><td class={'ok' if cl['status'] == 'verified' else 'warn'}>{esc(cl['status'])}</td>"
                         f"<td>{esc(cl['statement'])}</td><td><small>{esc(cl['passage'])}</small></td><td><a href='{esc(s.get('url'))}'>"
                         f"{esc(s.get('title'))}</a><br><small>rev {esc(s.get('revision_id'))}, retrieved {esc(s.get('retrieved_utc'))}</small></td></tr>")
        parts.append("</table>")
    if (d / "contact.jpg").exists():
        parts.append("<h2>Scene stills (start / middle / end of every scene)</h2><img src='contact.jpg'>")
    if (d / "thumb.png").exists():
        parts.append("<h2>Thumbnail / cover</h2><img src='thumb.png' style='max-height:360px'>")
    if a:
        parts.append("<h2>Rights</h2><table><tr><th>asset</th><th>source</th><th>author</th><th>license</th><th>checksum</th></tr>" + "".join(
            f"<tr><td>{esc(x['id'])}</td><td>{esc(x.get('source'))}</td><td>{esc(x.get('author'))}</td><td>{esc(x.get('license'))}</td>"
            f"<td><small>{esc((x.get('sha256') or '')[:16])}</small></td></tr>" for x in a["assets"]) + "</table>")
    parts.append("<h2>Stages</h2><table><tr><th>stage</th><th>status</th><th>attempts</th><th>seconds</th><th>detail / error</th></tr>" + "".join(
        f"<tr><td>{s}</td><td>{esc(runs.get(s, {}).get('status', '-'))}</td><td>{esc(runs.get(s, {}).get('attempts', ''))}</td>"
        f"<td>{esc(runs.get(s, {}).get('seconds', ''))}</td><td><small>{esc(runs.get(s, {}).get('error') or runs.get(s, {}).get('detail') or '')}</small></td></tr>"
        for s in STAGES) + "</table>")
    if ov.get("history"):
        parts.append("<h2>Revision history</h2><table>" + "".join(
            f"<tr><td>{esc(h['utc'])}</td><td>{esc(h['scene'])}</td><td>{esc(h.get('note'))}</td><td>{esc(h.get('narration') or h.get('type') or '')}</td></tr>"
            for h in ov["history"]) + "</table>")
    ev = c.execute("SELECT ts_utc, kind, message FROM events WHERE job_id=? ORDER BY id DESC LIMIT 40", (job_id,)).fetchall()
    parts.append("<h2>Recent events</h2><table>" + "".join(f"<tr><td>{esc(e[0])}</td><td>{esc(e[1])}</td><td>{esc(e[2])}</td></tr>" for e in ev) + "</table>")
    up = read_json(d / "UPLOAD.md".replace(".md", ".json"), None)
    parts.append("</main>")
    out = "\n".join(parts)
    (d / "review.html").write_text(out, encoding="utf-8")
    return out
