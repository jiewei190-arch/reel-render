# Main-session state (rule 19: kept in the repo so a fresh session can resume)

Updated: 2026-10-28 ~14:40 UTC. Update this file whenever something below changes.

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

## Open items (Oct 29)
- **CANCELLED for the cloud (Oct 29, Creator): the What If job.** The owner's PC animates it locally with a new script and voice. The partial shots on H2-H4's branches are left in place, not deleted (deleting needs the owner's OK). Previously **PAUSED:** The owner is rewriting the script and voice, so shots.json timing will change. Nothing is integrated into whatif/see-in-dark. Wait for a new brief. H2-H4 pushed their partial shots to their own branches and went back to story-fable.
- (was) **What If "See in Complete Darkness" (owner's new channel, job from the PC "Creator" session):** branch `whatif/see-in-dark` (base 4f77e31), brief at `whatif/CLOUD_JOB.md`.
  - Batch A (s001-s039) = H2, batch B (s040-s081) = H3, batch C (s082-s120) = H4. Workers merge that branch into their own and push there.
  - The main session copies their `scenes/shots/{A,B,C}_*.js` into `whatif/see-in-dark` and pushes. When all 120 pass: sheets + CLOUD_REPORT.md. No final render or mix (the PC does that).
- **Story-fable look (handoff/STORYFABLE_JOB.md):** H1 continues the ice-cream reel from the owner's t_storytest/fable.js (branch `reference/story-fable` 6b5e283). H2-H4 resumed their story-fable reels after the What If pause.
- Inside Your Brain (Remotion): in progress, see series/inside-your-brain/HANDOFF.md; the owner moved it to Claude Code on the PC.
- Posting: the owner posts by hand, 1 every 1-2 days (handoff/LAUNCH_ORDER.md). YouTube moved to the owner's aged account; TikTok to the owner's 3k-follower account.

## Messaging (Oct 29)
- Since the owner approved trusted-device access for the main session, workers CANNOT message the main session (account-wide; no approval card is offered). Main -> workers still works.
- **Mailbox:** each worker appends dated lines to `handoff/outbox/H<n>.md` on its own branch (claude/halloween-h<n>) and pushes; the main session reads the outboxes on every check-in.
- Scheduled tasks that resume THIS session are refused (ACCESS_DENIED). Use fresh-session tasks instead: weekly study = trig_013E4SmpdqkaEopeKUrDxV95 (Mondays 13:23 ET, fresh session); the old trig_01E7MHWPVzXj9wPm1rAKtG8X is disabled.

## What If channel
- Episode 1 "What If You Could See in Complete Darkness?" FINISHED Oct 29 in the cloud: 6:13.6, 1080p24, -14 LUFS. Sent to the owner; the file is too big for git (175 MB). Branch whatif/see-in-dark has all shots, sheets, CLOUD_REPORT.md and VOICE.md (the owner locked this voice).

## Scheduled check-ins
- No hourly check-in any more (deleted Oct 28); worker messages wake the main session. Weekly review + study: trigger trig_01E7MHWPVzXj9wPm1rAKtG8X (Mondays 13:23 ET).
