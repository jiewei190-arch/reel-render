# One-week test: do the downloaded YouTube skills make better Shorts?

Owner's ask (Nov 23, 2026): run a week where some Shorts are made with the two skill packs in `.claude/skills/`
(`youtube-*` and `yt-*`) and some without, and see where each stands.

## FINAL design (owner, Nov 23): one channel with the skills, one without
- **Court Of Weird: every Short uses the skill packs.** **BillionDollarBlunders: no Short uses them** (the standard
  writing rules in `bot/prompts/` only).
- This replaces the alternating-day design below; the days and topics in the schedule stay, only the arm changes
  (every Court Of Weird row is "skills", every BillionDollarBlunders row is "plain").
- The two channels differ in topic and audience, so a straight channel-against-channel result cannot be put down
  to the skills. Judge each channel against **its own earlier Shorts** on the two measures below, then compare the
  size of the change. The blind A/B of the two cloud-made Court Of Weird Shorts is the one like-for-like comparison.
- Production: cloud sessions on branches `claude/skills-shorts-queue` (Court Of Weird) and `claude/biz-shorts-queue`
  (BillionDollarBlunders, started from a commit without the skill packs).

## Design
- Two channels: **Court Of Weird** and **BillionDollarBlunders**. One Short a day each, 17:00 ET, Fri Nov 27 to Thu Dec 3.
- Inside each channel the arm alternates by day, so every channel is compared with itself. On any day one channel
  posts a skills Short and the other a plain one. Totals: 7 skills, 7 plain.
- Topics were dealt to days with a seeded shuffle (seed 20261127), so neither arm got the picked-over topics.
- **Plain arm:** the current pipeline exactly as it is (reelbot script, hook factory, fact-check, voice, recipe, editor).
- **Skills arm:** the same pipeline, plus a skills pass before voicing: angle and format (`youtube-shorts`,
  `yt-viral`, `youtube-outliers`), hook and script (`yt-script` with `hookscore.py`, `youtube-script`), title and
  thumbnail text (`yt-package` with `title.py`, `youtube-packaging`), gate (`youtube-virality-gate`), description
  (`youtube-description`, `yt-seo`). Each skills Short keeps a `SKILLS_LOG.md` of what each skill changed.
- **Held equal in both arms:** channel voice, render kit, 20-40 s length, fact-check standard, every engine gate,
  posting time, no hashtags, the owner's approval before anything is scheduled.

## Schedule
| Day | Court Of Weird arm | Court Of Weird topic | BillionDollarBlunders arm | BillionDollarBlunders topic |
|---|---|---|---|---|
| Fri Nov 27 | skills | (already made) the Short built in the second cloud session | plain | Google Glass |
| Sat Nov 28 | plain | (already made) United States v. $124,700 in U.S. Currency | skills | Blockbuster LLC |
| Sun Nov 29 | skills | Katko v. Briney | plain | Friendster |
| Mon Nov 30 | plain | Kelo v. City of New London | skills | Crystal Pepsi |
| Tue Dec 01 | skills | Hamer v. Sidway | plain | Segway |
| Wed Dec 02 | plain | Carlill v Carbolic Smoke Ball Co | skills | Webvan |
| Thu Dec 03 | skills | Lucy v. Zehmer | plain | Juicero |

Spares if a topic fails its fact-check or cannot be told with the kit's props: Moore v. Regents of the University of
California (law), Microsoft Zune (biz). A spare takes the failed topic's slot and arm.

## What to record (YouTube Studio, 48 hours after each Short goes live)
| Short | Channel | Arm | Views | Viewed vs swiped away % | Average % viewed | Subscribers gained |
|---|---|---|---|---|---|---|
| | | | | | | |

"Viewed vs swiped away" and "average % viewed" are the measures that count; views alone are too noisy at this size.

## Reading the result
- Compare skills against plain **inside each channel**, on the median of each measure.
- Call it for the skills only if they lead on "viewed vs swiped away" by 5 points or more on **both** channels.
  The same lead for plain means the skills hurt. Anything else is "no clear difference": seven Shorts a side can show a
  large effect, not a small one.
- The first two Court Of Weird Shorts were made in cloud sessions before this plan existed; the rest should come
  from the PC pipeline. If they look different in kind, read the result with and without them.

## Who does what
- Writing, fact-checking and the skills pass: cloud sessions or the PC bot.
- Rendering: the PC (a Short takes about 1.5 hours on a cloud CPU, minutes on the RTX 4060).
- Uploading and scheduling: the PC session, only with the owner's OK.
- Numbers: pasted from Studio, or pulled with `youtube-connect` once it is set up on the PC.
