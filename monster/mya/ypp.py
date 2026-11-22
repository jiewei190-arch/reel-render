"""YouTube Partner Program deadline tracker. The entry bar doubles for NEW applicants on Feb 1, 2027 (YouTube blog,
"New opportunities to earn and changes to the YouTube Partner Program"). Channels already in YPP are unaffected.
Numbers come only from config/ypp_status.json (copied from each channel's Studio Earn tab); unknown stays unknown."""
from __future__ import annotations

import json
from datetime import date

from .config import APP_DIR

DEADLINE = date(2027, 2, 1)
NOW_RULES = {"subs": 1000, "watch_hours_12mo": 4000, "shorts_views_90d": 10_000_000}
NEW_RULES = {"subs": 1000, "watch_hours_365d": 8000, "shorts_views_90d": 20_000_000}
STATUS = APP_DIR / "config" / "ypp_status.json"


def _need(have, goal, days):
    if have is None:
        return "unknown"
    gap = max(0, goal - have)
    return "met" if gap == 0 else f"{gap:,.0f} to go ({gap / max(days, 1):,.0f}/day)"


def report(today: date | None = None) -> str:
    today = today or date.today()
    days = (DEADLINE - today).days
    data = json.loads(STATUS.read_text(encoding="utf-8")) if STATUS.exists() else {"channels": {}}
    out = [f"YPP: {days} day(s) until {DEADLINE} (after that, new applicants need 1,000 subs + 8,000 watch hours/365 d "
           f"or 20M Shorts views/90 d). Current bar: 1,000 subs + 4,000 watch hours/12 mo or 10M Shorts views/90 d."]
    for key, ch in data["channels"].items():
        out.append(f"\n{ch.get('name', key)} (as of {ch.get('as_of') or 'never'}):")
        if ch.get("in_ypp"):
            out.append("  already in YPP: unaffected by the Feb 1 change")
            continue
        subs, hrs, sv = ch.get("subs"), ch.get("watch_hours_12mo"), ch.get("shorts_views_90d")
        out.append(f"  subscribers: {subs if subs is not None else 'unknown'} -> {_need(subs, NOW_RULES['subs'], days)}")
        out.append(f"  long-form route: {hrs if hrs is not None else 'unknown'} h -> {_need(hrs, NOW_RULES['watch_hours_12mo'], days)}")
        out.append(f"  Shorts route: {sv if sv is not None else 'unknown'} views/90 d -> {_need(sv, NOW_RULES['shorts_views_90d'], days)}")
        if hrs is not None and hrs < NOW_RULES["watch_hours_12mo"]:
            gap = NOW_RULES["watch_hours_12mo"] - hrs
            out.append(f"  at about 4 min watched per long view, {gap:,.0f} h is ~{gap * 15:,.0f} long-form views")
        if None not in (subs, hrs, sv) and days > 0:
            ok = subs >= 1000 and (hrs >= 4000 or sv >= 10_000_000)
            out.append("  ELIGIBLE NOW: apply before Feb 1" if ok else "  not eligible yet")
    out.append("\nUpdate config/ypp_status.json from each channel's Studio Earn tab (subs, public watch hours last 12 "
               "months, Shorts views last 90 days). Shorts-feed watch hours do not count toward the long-form route.")
    return "\n".join(out)
