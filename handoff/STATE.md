# Main-session state (rule 19: kept in the repo so a fresh session can resume)

Updated: 2026-10-28 ~14:10 UTC. Update this file whenever something below changes.

## Where things are
- **EP tracker + template reservations:** handoff/topics_next30.md (status per EP; reservations line at the bottom).
- **TikTok/YouTube plan:** handoff/schedule_batchN.csv (main session owns rows/dates/EPs; PC session owns the status column). Push with `sh handoff/push.sh`, which merges and auto-resolves the PC session's status edits.
- **Episode numbers:** handoff/episodes.csv (EP order = posting order).
- **Merging a worker final:** `python3 -I handoff/merge_reel.py <reel> origin/claude/halloween-hN <ep> <date> <tt> <yt> "<title>" "<template>"`, then look at work/merge/<reel>_sheet.jpg, check the badge against every long title, copy the worker's OVR line into reels/brand.py by hand, commit, push.
- **Reel Dailies page** (https://claude.ai/artifact/4i1CintFhB3ZJLqswwSnQA): source in handoff/dailies/ (dailies.html, thumbs/, seed). To add a reel: copy jobs/<n>/thumb_<n>.jpg to thumbs/<n>.jpg (270x480), republish with files {"thumbs/<n>.jpg": ...}, then ArtifactData set reels/<n> {ep, length, posts, template, thumb, title}. Owner scores are in the db collection scores/<reel>.
- **PC session (owner's computer, Claude in Chrome):** schedules posts from the CSVs; prompt in handoff/SCHEDULE_NOW.md; remaining captions in handoff/REMAINING_POSTS.md.

## Workers (Claude Code Remote sessions; message with send_message)
| Worker | Session | Branch |
|---|---|---|
| H1 | session_01BPYB3p1FWoUGpnGH5tCKNK | claude/halloween-h1 |
| H2 | session_01BPYB3kfiSbE99jg4BSb2LU | claude/halloween-h2 |
| H3 | session_01BPYB3nfqh6HEjZ42pf9qga | claude/halloween-h3 |
| H4 | session_01BPYB3mgmDyVer9ppY4RmuX | claude/halloween-h4 |

## Pace (owner, Oct 28 afternoon; HANDOFF rule 20)
Production is pausing. Workers finish what's in flight, then rest. The buffer is full through Nov 17. Next: study the accounts (handoff/STUDY.md) before building more.

## Open items
- In flight, merge when final: EP 63 auroras + 84 catfeet (H3), 99 mirrorflip + 100 tidesmoon (H2), 102 sleeptalk (H4), 103 honey + 104 fog (H1).
- Parked: compass, helium (were EP 105-106).
- First analytics read: owner pastes handoff/ANALYTICS_PULL.md into the PC session before Mon Nov 2; the weekly review on Nov 2 does the first study (handoff/STUDY_LOG.md).
- Thanksgiving reels (unbadged until slotted ~Nov 22-26): popuptimer, cranberries, turkeysleepy.
- Optional: barcode/faceid one-frame flashes (owner may re-upload).
- Owner-only: YouTube phone verification (lifts the daily upload limit, enables custom thumbnails).

## Scheduled check-ins
- No hourly check-in any more (deleted Oct 28); worker messages wake the main session. Weekly review + study: trigger trig_01E7MHWPVzXj9wPm1rAKtG8X (Mondays 13:23 ET).
