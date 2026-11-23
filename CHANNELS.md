# The 5 YouTube channels: how they run (state as of Nov 23, 2026)

Everything decided so far, in one place. Code lives in `bot/` (reelbot: writes, voices, renders), `monster/`
(the automator: schedule, tracking, release) and `finance/render-pc/` (the Remotion + three.js engine and its kits).

## The channels

| Channel | ID | What it is | Voice | Look (engine kit) | Schedule |
|---|---|---|---|---|---|
| **Block Money** | UC9vwlwhchNKGNuLyd5ReXRA | Spender vs Saver personal-finance Shorts | ElevenLabs Tyler / Christopher | Block Money toolkit (own 3D engine) | 2 Shorts/day, 12:00 + 19:00 ET |
| **Justin clips** | UCGrP6kWa753YodKHZ5bCJnw | Weird true history and impossible science/nature facts | ElevenLabs Liam (Shorts), Russ (long) | Toon 3D | 2 Shorts/day, 12:00 + 19:00 ET |
| **Court Of Weird** | UCir_oBtYEpBO3pLv1riPCeA | Weird true court cases, stories only, never legal advice | ElevenLabs Nichalia | `law3d` (Shorts), `doc` (long) | 1 Short/day 17:00 ET + 2 long/week (Tue, Fri 15:00 ET) |
| **BillionDollarBlunders** | UCaLzfoL-LX1PMDx93Xlr03Q | Costly business mistakes and collapses | ElevenLabs Steven | `biz3d` with hero props (Shorts), `doc` (long) | 1 Short/day 17:00 ET + 2 long/week |
| **ScamFilesTV** | UCsGTYs_RLdxx7CRc1gtLwJg | True scams and hacks, story level, never a how-to | Local Kokoro "Onyx" (kept off ElevenLabs) | `cyber3d` with hero props (Shorts), `doc` (long) | 1 Short/day 17:00 ET + 2 long/week (paused 48 h, see below) |

The handle for BillionDollarBlunders is @BillionsDollarsBlunders (typo); change only if the owner says so.
Studio's account-switcher slots shift between sessions: always verify the channel name/ID on the page before an upload.

## Production pipeline

1. **Script** (`reelbot make "<topic>" --channel <id>`): research with live sources, 6 hooks blind-scored, script,
   then a fact-check ledger (confirmed claims stay confirmed; only new/changed claims are re-checked; up to 3 rounds).
   A script whose fact-check does not clear is never voiced.
2. **Voice:** a voice director tags only the 3-5 real emotional beats; a **voice-safety screen** rewrites any line that
   reads like a scam call, phishing or a debt demand (after an ElevenLabs policy warning on Nov 22). Retakes are capped.
3. **Recipe:** the shot designer writes recipe.json for the channel's kit; `recipe_build --check` runs every gate
   (framing QA R1-R6, polish P1-P4, frame-0 opener rules, a real build + `tsc` with rollback). Long videos use the
   `doc` kit and are written one chapter at a time.
4. **Render** on the PC's RTX 4060 (no motion blur), a sparse sound mix (≤ 6 effects per Short), loudness -14 LUFS.
5. **Editor:** an AI editor scores hook/pacing/readability/payoff/structure (Short or long-form mode); one fix round;
   the best-scoring round is kept.
6. **Upload** by the PC session (Creator) in Chrome, scheduled, only with the owner's OK.

Several channels run in parallel (one process per channel); GPU renders take turns.

## Standing rules

- **Every Short goes through the YouTube skill packs** in `.claude/skills/` (`youtube-*`, `yt-*`) before it is voiced: angle, hook and script, title and thumbnail text, pre-publish gate, description. Each keeps a `SKILLS_LOG.md` (owner, Nov 23).
- Shorts on Court Of Weird and BillionDollarBlunders run 20-40 s; long videos 5-8 min, on different topics from the Shorts (owner, Nov 23).

- Never post or upload without the owner's approval. Uploads are scheduled, not published immediately.
- No tags or hashtags. Made for kids: No. Altered/AI content: No (YouTube; on TikTok the AI label would be On).
- Descriptions: the video's text + sources + disclaimers ("Educational only…", "Voice is synthetic.") + the channel pitch.
- Every claim sourced and hedged; on-screen numbers must match the narration; no invented headlines; crime labels only
  on people the sources say were charged or convicted.
- Voices: no whispering; no voice cloning of real people; nothing that reads like a scam/debt demand goes to ElevenLabs.
- No motion blur. No real logos or trademark artwork; hero props carry generic labels only.
- No copying other creators' scripts, characters or footage; references are for technique only.
- API keys only in `bot/.env`, pasted by the owner; never committed or printed. Keys rotate automatically when one runs
  out of credit, then fall back to the Claude plan. ElevenLabs can use one fixed paid account per channel
  (`ELEVENLABS_API_KEY_<CHANNEL>`), never rotated.

## Scheduled right now

- Court Of Weird Shorts: Pearson (Nov 22), Pepsi jet (Nov 23), McDonald's coffee (Nov 24), haunted house (Nov 25).
- BillionDollarBlunders Shorts: Kodak (Nov 23), Quibi (Nov 24), Toys R Us (Nov 25), Pets.com (Nov 26).
- ScamFilesTV Shorts: Bangladesh heist (Nov 22), Twitter hack (Nov 23).
- Long videos, Fri Nov 27 15:00 ET: Court Of Weird "The Judge Who Sued His Dry Cleaner for $67 Million";
  BillionDollarBlunders "New Coke: The 79-Day Blunder…".
- Justin clips: 8 Shorts through Nov 26. Block Money: 13 Shorts through Nov 29.

## What the data says so far

- **Court Of Weird is working:** Pearson 1.2K views, 67% stayed to watch on day one; Pepsi 705 and climbing.
- **Justin clips:** ~1-1.4K per Short; the jellyfish Short hit ~15K. Impossible nature facts and what-ifs beat war/spy
  history (all 4 what-ifs and all 3 animal-fact Shorts above the channel median; all 4 war/military ones below).
  The topic backlog leads with that style.
- **BillionDollarBlunders** is being tested (Kodak: 71% average watched).
- **ScamFilesTV gets no feed traffic** (channel-level). It is paused 48 h; if still dead, start a fresh channel.
- **Block Money stalled from Nov 21** (0-19 views vs ~1.3K before), most likely because recent Shorts repeated
  earlier premises ("$5 coffee", "same car"). Proposed: hold 4 scheduled repeats; no premise reused within 30 days.
- YouTube's Partner Program bar doubles for new applicants on Feb 1, 2027 (8,000 watch hours or 20M Shorts views);
  long videos are the watch-hours route. `python -m mya ypp` tracks the gap.

## Open items

- Court Of Weird: `law3d` hero props (gold statue, hand, pants, coffee cup…) are being built on `engine/law-hero`;
  then the gold-rooster and Hawkins v. McGee Shorts are re-run with their kept voices.
- Block Money: owner OK to hold the 4 repeat Shorts.
- BillionDollarBlunders: phone verification (custom thumbnails are not enabled yet).
- Option: remake the Court Of Weird long video on the `doc` engine before Friday (it has one wrong on-screen number).

## Parked

- **TikTok "My Homie Wildin"** (animated school storytime, low-poly, original cast): episodes 1 and 2 are rendered on
  the PC (`engine/storytime` branch). Account warm-up 2-3 days before posting from the phone app.
- **Clipping toolkit** for a future stream-clipping channel: `tools/clipping_toolkit/` (22 tools pinned; clip only with
  the streamer's permission).
