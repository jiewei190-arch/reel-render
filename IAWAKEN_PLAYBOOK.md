# I.Awaken growth playbook (owner decision, Nov 8 2026)

Goal: YouTube Partner Program through long-form watch hours (1,000 subs + 4,000 public watch hours in 12 months;
Shorts views do not count toward watch hours). Shorts are the discovery funnel: every Short links (Related video)
to a long episode. Pace: 1 long episode every few days + 1 Short a day (no spam bursts). Instagram is secondary.

## Retention rules for every long episode (5-7 min, 16:9) — "make it interesting"
1. **Package first.** Before scripting, write the title (a "What If" question, <= 60 chars, NO hashtags in the title)
   and the thumbnail (formula below). The first 30 s must deliver exactly what the thumbnail promised.
2. **Cold open, 0-20 s.** Frame 1 = the most dramatic image of the episode (flash-forward), first line <= 12 words,
   then the promise: what the viewer gets by the end ("...and the last minute is the part nobody expects").
   No logo, no channel intro, no "welcome back", no "in this video".
3. **Open loops.** Plant a question at 0:20 that is only answered in the last minute. Open a new mini-question at
   least every 60-90 s and close the previous one ("but that's not the scary part...").
4. **Escalation.** Each act raises the stakes (day 1 -> week 1 -> year 1, or small -> planet -> universe).
   Never peak early; the biggest reveal is in the last 60 s.
5. **Pattern interrupt every 20-30 s.** New location, a giant-face reaction, a blueprint/diagram, a number slam,
   a sound hit, a camera move change. No shot over 4 s without motion or a new element.
6. **Characters and stakes.** "You" (the hero) plus at least one friend with a personality (Dev, Mina): someone to
   react, argue, and lose something. Emotion beats facts alone.
7. **Numbers on screen** (gold), real sources for every claim (sources.md), softened claims listed.
8. **Ending.** Answer the 0:20 question, then a 1-line twist or question for the comments, then the end screen
   (20 s) pointing to the next episode. Chapters in the description (first at 0:00).
9. **Self-check before render:** read the script aloud and mark every place a bored viewer would leave. Fix each one.

## Thumbnail formula (from the channel's best performer, "See in the Dark", 85 views vs 2-15 for the others)
- One giant face of the episode's hero with a strong emotion (shock, awe, fear), eyes catching light.
- One object that IS the topic (the Moon, a stopwatch, a black hole), big and bright.
- 2-3 words max, huge, outlined (e.g. "NO MOON?", "10 SECONDS", "SPAGHETTI?"). High contrast, readable at phone size.
- Consistent channel look: same hero design per episode, same type style. 1280x720 JPG < 2 MB.
- Make 3 variants per video for YouTube Studio "Test & Compare".

## Titles
Question only, no hashtags (hashtags go at the end of the description, 3 max). Curiosity gap, plain words.

## Shorts from each episode
2-3 vertical clips per episode (20-40 s), each a self-contained hook -> build -> payoff, captions on, ending
on "Full story on the channel." Related video = the episode. Plus original Shorts (SHORTS_BRIEF.md format).

## Jobs started Nov 8 (cloud sessions; final renders on the owner's PC GPU via Creator)
| Job | Branch | What |
|---|---|---|
| EP | `iawaken/ep-blackhole` | Long episode "What If You Fell Into a Black Hole?" (5-7 min, 16:9), built to the retention rules above, hoodie hero + Dev/Mina. Pairs with the Short `short-blackhole` (its Related video). Follow `iawaken/HANDOFF.md` (the loop, STATUS.md states) on top of `iawaken/next-episode`. |
| THUMBS | `iawaken/thumbs` | 3 Test & Compare thumbnails each for: Moon Disappeared, Freeze Time, Jump Doubled, and the new Black Hole episode. |
| CLIPS | `iawaken/clips-stoptime` | 3 vertical Shorts cut from the Freeze Time episode (`iawaken/out/stoptime/video.part-*`, words in `whatif/aitrends-2d-studio/projects/stop-time/timeline/words.json`, tool `whatif/shorts/see-in-dark/make_short.py`). |
