# Main-session state (rule 19: kept in the repo so a fresh session can resume)

Updated: 2026-10-28 afternoon UTC. Update this file whenever something below changes.

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

## Open items (Oct 28 afternoon)
- Merged through EP 97 fingerprints (except below). Buffer reaches Nov 16.
- EP 63 auroras (H3): long WebGL render; trim end card to <=3 s in post, re-badge --ep 63, merge (Nov 9 19:00).
- EP 84 catfeet (H3): rendering (Nov 13 21:30).
- EP 91 butterflies v2, EP 92 glowdark v2 (H2): swap in when delivered.
- EP 98 darknight (H1): rendering (Nov 16 19:00/20:00).
- EP 99 mirrorflip, 100 tidesmoon (H2); 101 hairwet, 102 sleeptalk (H4): template picks pending -> record on the reservations line.
- Thanksgiving reels (unbadged until slotted ~Nov 22-26): popuptimer, cranberries, turkeysleepy.
- Optional: barcode/faceid one-frame flashes (owner may re-upload).
- Owner-only: YouTube phone verification (lifts the daily upload limit, enables custom thumbnails).

## Scheduled check-ins
- Hourly self check-in via send_later (re-arm each run). Weekly review: trigger trig_01E7MHWPVzXj9wPm1rAKtG8X (Mondays 13:23 ET).
