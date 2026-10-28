# GROWTH: the six growth rules (owner, Oct 28 2026; apply to EVERY reel from now on)

The owner's words: "follow this every time we make a reel from now on". Read this next to HOOKS.md and STYLE_FIT.md before scripting a reel. Main session: check every item at QA, and don't send a reel to the owner until it passes.

## 1. Look like one show
- **Episode badge**: "EP nn · HOW IT REALLY WORKS" on the TikTok and YouTube copy (`reels/brand.py`, rule 15). It fades in at 5 s, so frame 0 stays the hook image (HOOKS.md beats a frame-0 ident).
- **Same end card on every reel, whatever the template**: the spoken line and the card's main line stay exactly "Follow for more of how it really works." (rule 5). Under it, a small second line: **"A new 'wait, really?' every day."** That's the reason to follow. Use the template's own type and colours, but always the same words and layout: main line, then the second line, then @howitreallyworkstudio.
- **Same logo corner**: the episode badge is the logo corner; don't add other watermarks.

## 2. Keep people watching
- **Openings**: HOOKS.md rules: first line of 12 words or fewer, frame 0 shows the subject large and moving, a 3-6 word caption, a "but" turn by 5 s.
- **Length stays 66-86 s.** TikTok's Creator Rewards only pays for videos over 1 minute, so no short cuts.
- **Loop the ending**: the last frame (after the end card) dissolves back toward the frame-0 image, and/or the question before the closing line echoes the hook, so a replay feels seamless. Note how in NOTES.md.

## 3. Pick topics people already want answered
- Each topic is a **question people actually search** ("why do...", "how does..."). Record the demand signal in NOTES.md (people-also-ask, autocomplete, seasonal).
- Prefer a **myth-busting twist** ("it's not X, it's Y") where the sources support it.
- **Timely topics**: match the season or calendar (daylight saving, Thanksgiving, first snow, holidays, New Year) and post them in that window.

## 4. Get people talking
- **End on a one-word-answer question** just before the closing line ("Did you know this? Yes or no?", "Which one surprised you?").
- **Pinned comment**: write `jobs/<n>/pinned_<n>.md`: the answer or a bonus fact, plus the same question again. One or two lines.
- **Reply in the first hour**: when the owner is at the PC after a post goes live, the scheduling session drafts replies to new comments for the owner to OK. Good questions become "Part 2: you asked..." topics in handoff/topics_backlog.md.

## 5. Fix the profiles (one-off; text in handoff/PROFILE.md)
- The same one-line bio on Instagram, TikTok and YouTube.
- Pin the three best reels on Instagram and TikTok; update them when the stats show new winners.
- Instagram Trial Reels (if the account has it): test two openings of the same reel on non-followers.

## 6. Posting pace and measurement (owner, Oct 28: "5 TikToks and 5 Shorts a day minimum and 2-3 reels a day on the gram")
- **From Nov 1: at least 5 TikToks and 5 YouTube Shorts a day** (the same 5 reels, episode-badged `_ep.mp4`), and **2-3 Instagram Reels a day** (the strongest of them, plain `<n>.mp4`). Slots (ET, peak-time research Oct 28: Buffer 2026 TikTok study, Shorts guides): TikTok 09:00, 13:00, 16:00, 19:00, 21:30; YouTube 12:00, 15:00, 18:00, 20:00, 21:30; Instagram 11:00, 17:00 (+ 20:00). Plan files: handoff/schedule_tt_yt.csv (TikTok/YouTube), schedule_nov.csv (Instagram). Re-tune the slots from our own analytics after 2 weeks.
- That needs about **5 new approved reels a day** on average, but keep the buffer at **2-3 weeks, never more** (owner, Oct 28: the team needs breaks too). When the buffer is full, workers rest. Study before building more (handoff/STUDY.md). Quality bar unchanged; never post filler to hit the count. If the buffer runs out, tell the owner rather than lowering the bar.
- **Weekly check**: swipe-away rate, average % watched, shares, saves and follows per reel (YouTube Studio, Instagram Insights, TikTok Analytics, read on the owner's PC with their OK). Log them in STYLE_FIT.md's Performance column and in handoff/metrics.csv. If views per post fall as volume rises, flag it to the owner with the numbers.

## 7. Standing growth practices (main session decides; owner's rule 18)
- **Series**: every reel belongs to a series in handoff/series.csv; YouTube (and TikTok, when available) playlists per series; each Short's related-video link points to the next episode in its series or to a long-form compilation.
- **Long-form compilations** (YouTube, 16:9): one per finished series of 6-8 reels, with new narration (cold open, bridges, outro) so it's not reused content. First one: "6 Everyday Tech Secrets" (jobs/long_tech).
- **Carousels**: a 6-7 slide 4:5 carousel for the strongest reels, for Instagram and TikTok photo mode (jobs/<n>/carousel/).
- **Trend reels**: when a news event fits "how it really works" (eclipses, storms, launches, viral gadgets), one worker builds a reel within 24-48 h, under the same QA and sourcing rules.
- **Comment replies**: every week, pick the best viewer questions; answer them as TikTok video replies or "Part 2" reels (handoff/topics_backlog.md).
- **Spanish edition** (next): re-voice and re-caption our best reels with a Spanish Kokoro voice for a Spanish-language account. This needs the owner to create the accounts.

## Per-reel checklist (copy into NOTES.md, tick each)
- [ ] Topic is a searched question; demand signal noted
- [ ] Hook passes HOOKS.md (first line of 12 words or fewer, frame 0 subject moving, 3-6 word caption, "but" by 5 s)
- [ ] 66-86 s; ends on the exact closing line
- [ ] One-word-answer question before the closing line
- [ ] End card: the standard main line + "A new 'wait, really?' every day." + handle
- [ ] Loop ending (how: ...)
- [ ] pinned_<n>.md written
- [ ] `<n>_ep.mp4` made with brand.py after the episode number is assigned
- [ ] Timely window noted (if seasonal)
