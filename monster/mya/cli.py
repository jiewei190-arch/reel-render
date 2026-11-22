"""Monster YouTube Automator command line.

  python -m mya doctor                                   # this machine's real tools, GPU/VRAM, models, what's missing
  python -m mya audition --channel law                   # synthesize each candidate voice for a channel
  python -m mya plan --channel law --format short [--topic "..."] [--date YYYY-MM-DD]   # sourced draft -> script review
  python -m mya produce --job ID                         # run the remaining local stages to a review-ready video
  python -m mya revise --job ID --scene sc03 [--narration "..."] [--type stamp --params '{...}'] --note "..."
  python -m mya daily [--date YYYY-MM-DD] [--no-produce] [--catchup] [--format law=long]
  python -m mya review [--port 8765]                     # local dashboard
  python -m mya release --job ID                         # upload, only with an enabled policy + authorized channel
  python -m mya stats --channel block_money              # real performance only
  python -m mya stats --channel justin_clips --cohorts   # each video vs the channel median at 48h / 7d / 28d
  python -m mya ypp                                      # days left + gaps before the YPP bar doubles (Feb 1 2027)
  python -m mya lessons add|list ...
"""
from __future__ import annotations

import argparse
import json
import sys

from . import db, doctor, pipeline, scheduler
from .config import cfg


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(prog="mya", description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("doctor")
    p = sub.add_parser("audition"); p.add_argument("--channel", required=True)
    p = sub.add_parser("plan"); p.add_argument("--channel", required=True); p.add_argument("--format", choices=["short", "long"])
    p.add_argument("--topic"); p.add_argument("--date")
    p = sub.add_parser("produce"); p.add_argument("--job", required=True); p.add_argument("--until", default="qc")
    p = sub.add_parser("revise"); p.add_argument("--job", required=True); p.add_argument("--scene", required=True)
    p.add_argument("--narration"); p.add_argument("--type"); p.add_argument("--params"); p.add_argument("--note", default="")
    p.add_argument("--run", action="store_true", help="rebuild affected work right away")
    p = sub.add_parser("daily"); p.add_argument("--date"); p.add_argument("--no-produce", action="store_true")
    p.add_argument("--catchup", action="store_true"); p.add_argument("--format", action="append", default=[], help="channel=short|long")
    p.add_argument("--until", default="qc")
    p = sub.add_parser("review"); p.add_argument("--port", type=int, default=8765)
    p = sub.add_parser("release"); p.add_argument("--job", required=True)
    p = sub.add_parser("stats"); p.add_argument("--channel", required=True)
    p.add_argument("--cohorts", action="store_true", help="48h / 7d / 28d same-age comparison")
    p = sub.add_parser("ypp", help="days left and gaps to the Partner Program bar before it doubles on Feb 1 2027")
    p = sub.add_parser("status")
    p = sub.add_parser("lessons"); p.add_argument("action", choices=["list", "add"]); p.add_argument("--channel")
    p.add_argument("--stage"); p.add_argument("--symptom"); p.add_argument("--cause"); p.add_argument("--fix")
    p.add_argument("--check"); p.add_argument("--evidence"); p.add_argument("--verified", action="store_true")
    a = ap.parse_args(argv)

    if a.cmd == "doctor":
        rep = doctor.run()
        print(json.dumps(rep, indent=1))
        return 1 if rep["missing"] else 0
    if a.cmd == "audition":
        from . import voice
        from .config import home
        prof = cfg().profile(a.channel)
        out = home() / "auditions" / a.channel
        out.mkdir(parents=True, exist_ok=True)
        line = f"{prof.promise} This is a voice test for {prof.working_name}."
        for v in prof.raw.get("voice_candidates", [prof.voice]):
            m = voice.synth(line, v, float(prof.raw.get("speed", 1.0)), out / f"{v}.wav")
            print(f"{v}: {m['seconds']}s -> {out / (v + '.wav')}")
        return 0
    if a.cmd == "plan":
        c = db.connect()
        prof = cfg().profile(a.channel)
        date = a.date or scheduler.today_local()
        with db.tx(c):
            jid = pipeline.create_job(c, a.channel, date, a.format or prof.raw.get("default_format", "short"),
                                      a.topic or scheduler.next_topic(c, a.channel))
        print(f"job {jid}")
        st = pipeline.run_job(jid, until="script")
        print(f"state: {st}  review: {pipeline.job_dir(jid) / 'review.html'}")
        return 0 if st == "script_review" else 2
    if a.cmd == "produce":
        st = pipeline.run_job(a.job, until=a.until)
        print(f"state: {st}  review: {pipeline.job_dir(a.job) / 'review.html'}")
        return 0 if st in ("ready_for_release", "preview_ready", "script_review", "revision_needed") else 2
    if a.cmd == "revise":
        pipeline.revise(a.job, a.scene, a.narration, a.type, json.loads(a.params) if a.params else None, a.note)
        print("revision recorded; affected stages will rebuild" + (" now" if a.run else " on the next produce"))
        if a.run:
            print("state:", pipeline.run_job(a.job))
        return 0
    if a.cmd == "daily":
        fo = dict(x.split("=", 1) for x in a.format)
        res = scheduler.daily(a.date, produce=not a.no_produce, until=a.until, catchup=a.catchup, fmt_overrides=fo)
        print(json.dumps(res, indent=1))
        return 0
    if a.cmd == "review":
        from . import dashboard
        dashboard.serve(a.port)
        return 0
    if a.cmd == "release":
        from . import release
        try:
            print(json.dumps(release.upload(a.job), indent=1))
        except release.ReleaseBlocked as e:
            print(f"not released: {e}")
            return 3
        return 0
    if a.cmd == "stats":
        from . import stats
        print(stats.cohorts(a.channel) if a.cohorts else stats.report(a.channel))
        return 0
    if a.cmd == "ypp":
        from . import ypp
        print(ypp.report())
        return 0
    if a.cmd == "status":
        c = db.connect()
        for r in c.execute("SELECT job_id, channel_key, local_publish_date, format_kind, state, error FROM jobs ORDER BY created_utc"):
            print(f"{r['job_id']:<40} {r['format_kind']:<5} {r['state']:<18} {(r['error'] or '')[:80]}")
        return 0
    if a.cmd == "lessons":
        from . import lessons
        if a.action == "add":
            i = lessons.add(a.channel, a.stage, a.symptom, a.cause, a.fix, a.check, a.evidence, a.verified)
            print(f"lesson {i} saved ({'verified' if a.verified else 'proposed'})")
        else:
            c = db.connect()
            for r in c.execute("SELECT * FROM lessons ORDER BY id"):
                print(f"#{r['id']} [{r['status']}] {r['channel_key'] or '*'}/{r['stage']}: {r['symptom']} -> {r['fix']} (check: {r['regression_check']})")
        return 0
    return 1


if __name__ == "__main__":
    sys.exit(main())
