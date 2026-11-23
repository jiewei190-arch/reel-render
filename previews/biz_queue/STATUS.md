# BillionDollarBlunders Shorts queue (cloud build, 2026-11-23)

Nothing here is uploaded or scheduled. Each Short's folder is `finance/shorts/<slug>/` (script, sources.md, recipe,
RECIPE_QA.md, voice, UPLOAD.md); the finished video is `previews/biz_queue/<NN>_<slug>.mp4`.

Written with the repo's own rules only (`bot/prompts/story_script.md`, `bot/prompts/channels/biz.md`, the `biz` hook
rule): six candidate openers, the strongest picked, script around it. No external YouTube skill or prompt packs.
One ElevenLabs recording pass per Short (voice Steven), no retakes.

| # | Topic | Slug | Status | Length | Title | Could not verify / notes |
|---|---|---|---|---|---|---|
| 1 | Google Glass | google-glass | **done** | 35.6 s | Google's $1,500 Glasses Lasted Under 2 Years | No figure exists for what Google spent or how many it sold (never disclosed), so the Short uses the price, not a loss. The TIME list rests on secondary reports. The kit has no glasses prop: the hero prop is a generic camera. Voice sped up x1.16 to fit. |
| 2 | Blockbuster (turning down Netflix) | blockbuster-netflix-offer | **done** | 35.6 s | Netflix Offered Itself to Blockbuster for $50 Million | New script and shots (not the demo's). Voice sped up x1.25 to fit (script ran long). Netflix's market value ("about $240 billion") is as of 23 Nov 2026: re-check before upload. Blockbuster's ex-CEO disputes the founders' account (attributed in the voice). |
| 3 | Friendster | friendster-google-offer | **done** | 35.6 s | The Social Network That Turned Down $30 Million From Google | The NYT article was read through a reprint (nytimes.com blocked here): check quotes against the original. The "$1 billion" is one unnamed insider's 2006 estimate, kept conditional. The 2015 shutdown date is medium confidence. Sale price to MOL not used (sources disagree). |
| 4 | Crystal Pepsi | crystal-pepsi | **done** | 35.4 s | Pepsi's $40 Million Clear Cola Was Gone in a Year | $40M is the reported marketing budget. End date differs by source (late 1993 / early 1994), hence "about a year". The creator's quote was reached via Wikipedia's citation of Fast Company: check the original. Sales and market-share figures not used (sources disagree). In the finished video the first caption ("forty-million-dollar") wraps to four cramped lines for about a second. |
| 5 | Segway | segway-replace-cars | **paused, not rendered**: script, voice and shots are ready and pushed; rendering stopped on the parent session's message (owner review of quality) | 34.0 s | The $100 Million Scooter That Was Supposed to Replace Cars | "$100 million" rests on TIME (2001) alone. The kit has no scooter prop: opens on the stake board. The owner's fatal accident is deliberately left out. |
| 6 | Webvan | webvan | **paused, not rendered**: script, voice and shots are ready and pushed; rendering stopped on the parent session's message (owner review of quality) | 35.6 s | Webvan Burned $800 Million Delivering Groceries | "About $800 million": AP copies say $830M and $700M, NBC "more than $800M". The day-one value (about $8 billion) rests on one newspaper timeline. |
| 7 | Juicero | juicero | **paused, not rendered**: script, voice and shots are ready and pushed; rendering stopped on the parent session's message (owner review of quality) | 35.6 s | The $120 Million Juicer Your Hands Could Beat | Bloomberg's article could not be opened here; its finding is taken from CBS News and Fortune reports of it. Units sold not used (no figure exists). |
| spare | Microsoft Zune | | not needed | | | All seven topics passed the fact check and could be told with the kit's props. |

## Notes for the owner
- **ElevenLabs:** the balance read 13,381 characters before the first recording and 11,844 after the seventh
  (the seven scripts total about 3,800 characters; the balance fell by 1,537). Never near the 2,000 floor.
- **Renders** are CPU only here (about 5 s per frame, roughly 90 minutes per Short), one at a time.
- **Kit observations:** the `worth` card's title is fixed ("WHAT IT'S WORTH TODAY"), so it was not used where the
  comparison is an old estimate (Friendster). The `box` hero prop always prints "FAMILY SIZE" and a "NEW" burst, so a
  plain `block` stands in for the Juicero machine. Camera angles `az` near 0 on a figure standing at `foot` look at
  the back wall: use `az` about 190-205.
