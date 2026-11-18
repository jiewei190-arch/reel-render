# Block Money: hook and retention research (web + GitHub)

Compiled 2026-11-18 for the Block Money Shorts pipeline (blocky original characters, 20-30 s, synthetic narrator, Remotion + three.js).
Problem being solved: owner reports "no hook, people scroll past".

## How to read this file

Every claim has a source URL. Each claim also carries an evidence tier:

| Tier | Meaning |
|---|---|
| **A** | First-party platform statement or platform-commissioned research (YouTube Help, YouTube Blog, Creator Insider, Meta/Google/TikTok research). |
| **B** | A named dataset with a stated sample (practitioner study or academic paper). Observational, not peer-reviewed unless noted. |
| **C** | Practitioner testimony from proven creators or the leaked MrBeast guide. This is expert opinion, not measurement. |
| **D** | Rules encoded in GitHub skills or vendor blogs. This is opinion, often uncited. Useful as a default, not as proof. |

Where sources conflict, both are given. Numbers labelled "opinion" are defaults to test, not facts.

---

## 1) Top 15 hook and opening rules (ranked by strength of evidence)

### Rule 1. The first gate is "viewed vs swiped away". Optimise for it before anything else. (A + B)
- **Evidence (A):** YouTube Help defines the Shorts metric as "the percentage of times that viewers viewed your Shorts versus swiped away" ([YouTube Help 12942217](https://support.google.com/youtube/answer/12942217?hl=en&co=YOUTUBE._YTVideoType%3Dshorts), quoted via [OutlierKit](https://outlierkit.com/resources/youtube-shorts-algorithm/)).
- **Evidence (A):** Todd Sherman, the Shorts product lead, says the system will "find a set of people that may enjoy your video and depending on how that goes, it may get a lot more traffic", and that "the audience is the algorithm" ([Creator Insider, Aug 2023, t=388s](https://www.youtube.com/watch?v=n3jsYK_-aRU&t=388s); summary in [Search Engine Journal](https://www.searchenginejournal.com/youtube-explains-how-shorts-algorithm-works/494953/)). Early views are "exploratory".
- **Evidence (B):** Paddy Galloway studied 5,400 Shorts from 33 channels (3.3B views). Shorts under 60% VVSA "rarely performed well" ("If you get under 60% here though, you're probably in trouble!"). The best performers were typically at 70-90% ([X thread](https://x.com/PaddyG96/status/1646898368495382528), [Thread Reader](https://threadreaderapp.com/thread/1646898356419981315.html)). The same study found likes, comments and shares showed no strong relationship with performance. Retention did.
- **Rule for us:** Track "Stayed to watch" / VVSA per Short in Studio. Treat under 60% as a failed hook and 70%+ as the target. YouTube publishes no official threshold. The 60/70-90 bands are Galloway's observational 2023 data.

### Rule 2. Frame 0 is the thumbnail. It must be fully composed and readable as a paused still: no fade-in, no logo, no title card. (A + B + D)
- **Evidence (A):** Sherman: "Most thumbnails are never seen because people are in the feed" ([Creator Insider t=260s](https://www.youtube.com/watch?v=n3jsYK_-aRU&t=260s)). Jenny Hoyos on the YouTube Blog: "99.9% of the views are coming from the Shorts feed" ([YouTube Blog, 28 Jan 2025](https://blog.youtube/creator-and-artist-stories/youtube-shorts-deep-dive/)).
- **Evidence (A):** Meta-commissioned Fors Marsh tests found mobile feed content is recalled at a statistically significant rate after **0.25 s** of exposure. Average time on a piece of feed content was **1.7 s on mobile** ([Facebook IQ, 2016](https://www.facebook.com/business/news/insights/capturing-attention-feed-video-creative), [Marketing Dive](https://www.marketingdive.com/news/facebook-why-mobile-video-ads-must-work-fast/446217/)). This is Facebook feed data, not Shorts data. The direction still holds: the first frame does the work.
- **Evidence (B/C):** Galloway: "Treat your intro like a thumbnail" ([Thread Reader](https://threadreaderapp.com/thread/1646898356419981315.html)).
- **Encoded (D):** In `hassancs91/claude-faceless-shorts-creator`, the hook scene must have "frame 0 FULLY composed, the payoff already visible, no fade from black". Its QA gate is "frame 0 composed & thumbnail-grade". In `Melvynx/video-agent-skills`, "Frame 1 must already show the promise". `vyralcontent/content-skills` says "compose the opening frame as if it has just been paused mid-action" (the Galloway "click-to-unpause" idea).

### Rule 3. Assume about 1 second to earn the stay. The hook must be understood within about 1 s and finished by about 3 s. (A + C)
- **Evidence (A, creator quoted on the YouTube Blog):** Hoyos: "I really do think you have one second to hook someone, especially on Shorts" ([YouTube Blog](https://blog.youtube/creator-and-artist-stories/youtube-shorts-deep-dive/)).
- **Evidence (A):** 1.7 s mobile dwell ([Facebook IQ](https://www.facebook.com/business/news/insights/capturing-attention-feed-video-creative)).
- **Evidence (C):** vidIQ says viewers have "about 1 second, not 3". It recommends a spoken hook of 5-10 words and on-screen text of 3-7 words ([vidIQ](https://www.vidiq.com/blog/post/viral-video-hooks-youtube-shorts)). Other summaries of Hoyos give "no more than 3 seconds" ([Marketing Examined](https://www.marketingexamined.com/blog/jenny-hoyos-short-form-video-playbook)). Treat the conflict this way: one second to stop the thumb, three seconds to finish the line.
- **Rule for us:** By frame 30 (1.0 s) the viewer must know who (Saver or Spender), what money thing, and what is at stake. By frame 90 (3.0 s) the hook line is finished.

### Rule 4. It must work on mute and with sound. Burn in captions and add separate hook text, and treat audio as half the hook. (A)
- **Mute side (A):** Facebook's internal tests found captions raised video view time by about 12% on average ([3Play summary](https://www.3playmedia.com/blog/captions-increase-viewership-for-facebook-video-ads/), [Business Insider](https://www.businessinsider.in/facebook-wants-advertisers-to-get-a-lot-better-at-silent-video/articleshow/50936233.cms)). The Verizon Media/Publicis survey (5,616 US adults, 2019) found 69% watch with sound off in public, and 80% are more likely to finish a video when captions are available ([3Play](https://www.3playmedia.com/blog/verizon-media-and-publicis-media-find-viewers-want-captions/), [Streaming Media](https://www.streamingmedia.com/Articles/News/Online-Video-News/80-of-Video-Caption-Users-Arent-Hearing-Impaired-Finds-Verizon-131860.aspx)).
- **Sound side (A):** YouTube has long claimed its audience is mostly sound-on (96% at its 2016 Upfront, per [The Drum](https://www.thedrum.com/news/2016/10/21/youtube-joins-snapchat-criticising-facebook-our-audience-continues-watch-not-scroll)). Google: 95% of YouTube ads are audible ([Think with Google](https://thinkwithgoogle.com/data/youtube-ads-audible)). Nielsen data cited by Google: ads with sound get 2.4x the attention ([Tubefilter](https://www.tubefilter.com/?p=92852)). TikTok/Kantar (2021): 73% said they would "stop and look" at ads with audio ([TikTok Business](https://ads.tiktok.com/business/en-US/blog/kantar-report-how-brands-are-making-noise-and-driving-impact-with-sound-on-tiktok)). These are mostly ad studies from vendors with an interest in the answer.
- **Rule for us:** Two channels at once. The visual plus a 3-7 word hook text must work with sound off. The VO, the first SFX and the music must work with eyes half-on. (Data on Shorts specifically is thin; this rule rests on adjacent-platform evidence.)

### Rule 5. Honour the promise. The payoff must match the hook, and bait-and-switch backfires. (A + C)
- **Evidence (A):** Sherman: "What we try and do with a view is have it encode for your intent of watching that thing" ([t=103s](https://www.youtube.com/watch?v=n3jsYK_-aRU&t=103s)), and "At the core, we're trying to get videos to people they value" ([SEJ](https://www.searchenginejournal.com/youtube-explains-how-shorts-algorithm-works/494953/)).
- **Evidence (C):** MrBeast guide: "The title and thumbnail ... set the expectations for the viewer" ([leaked guide, full text](https://www.alexanderjarvis.com/memo-how-to-succeed-in-mrbeast-production/)).
- **Encoded (D):** Every skill reviewed says this (vyral "Match the promise to the payoff"; 0xabrar "no bait-and-switch"; sergebulaev "The opening can never promise more than the video delivers").
- **Rule for us:** For a finance channel this is also a compliance rule. Every number in the hook must be the sourced number the video pays off (see `finance/RULES.md`).

### Rule 6. Show, don't announce. No greeting, no "in this video", no channel intro, no setup before the claim. (C + D)
- **Evidence (C):** MrBeast guide: "Stop telling people what they will be watching and start showing them", plus "No dull moments in videos" ([guide](https://www.alexanderjarvis.com/memo-how-to-succeed-in-mrbeast-production/)). It also says the first minute has the most loss on long-form (one video "lost 21 million viewers in the first minute"). By analogy, the first second of a Short matters most.
- **Encoded (D):** 0xabrar's anti-pattern table (greeting, preamble, "so...", music or logo intro). Melvynx's "Never open with" list. sergebulaev "No greeting, no intro animation, no logo sting before the hook. Ever."

### Rule 7. Open one specific question and do not answer it until the end. The climax goes in the last seconds. (C + D)
- **Evidence (C):** Hoyos's structure is hook, then foreshadow of the conflict and of what the viewer gets by the end, then payoff ([Marketing Examined](https://www.marketingexamined.com/blog/jenny-hoyos-short-form-video-playbook)). She targets about 90%+ retention (same source). MrBeast guide: "The video endings must always be abrupt to protect retention."
- **Encoded (D):** 0xabrar: "Resolving the curiosity gap inside the hook" is "suicide". The fix for a gradual-decline curve is to "save the climax for the last 5 seconds". Kallaway's "single subject, single question" test ([summary](https://sozai.app/transcript/create-killer-hook-impossible-skip/)).

### Rule 8. Be concrete. A specific dollar amount, a named object and a named stake beat vague intrigue. (C + D)
- **Evidence (C):** Hoyos's power words: "banned", "free", "one dollar", "secret", "cheap" ([Marketing Examined](https://www.marketingexamined.com/blog/jenny-hoyos-short-form-video-playbook)). MrBeast-style hooks state a concrete, extreme premise.
- **Encoded (D):** vyral: "Specific beats clever. Concrete nouns, odd numbers, and named stakes". The AgriciDaniel scoring rubric adds +5-10 for "a specific number ($50K, 30 days)".
- **Rule for us:** Put a dollar figure on screen at frame 0 in nearly every hook (for example "$1,560/yr"). Use odd, exact numbers rather than round ones.

### Rule 9. Something on screen changes every 1-2 s, but keep fewer than about 10 unrelated cuts per 30 s. (B + C + D)
- **Evidence (B, academic):** Lang's Limited Capacity Model: production features such as cuts trigger orienting responses (attention). Viewer overload appeared at about **10 or more unrelated scene changes in a 30-second message** (Lang, Bolls, Potter & Kawahara 1999, *J. Broadcasting & Electronic Media*, as cited in [Niederdeppe 2005, PDF](https://www.uky.edu/~ngrant/CJT780/readings/Day%2010/Niederdeppe2005.pdf); model overview at [LC4MP](https://www.wikipedia.org/wiki/LC4MP)). Related cuts (same scene, new angle) cost less than unrelated ones (Lang et al. 1993).
- **Evidence (C):** MrBeast: "lots of quick scene changes and highly stimulating simple content".
- **Encoded (D):** 0xabrar: "something visual must change at least every 1-2 seconds". mromidev: "every hold creeps (no static hold ≥4 f)". Dojo: "Cut every 2-4 seconds, no scene longer than 5s". Melvynx: "A visual change lands within 1 s".
- **Rule for us:** Continuous motion (camera creep, character action, counters) at all times. Hard cuts are mostly related cuts, about 1 per 2-3 s. Keep under about 10 location or idea changes per 30 s.

### Rule 10. Length should fit the story, and holding attention matters more than duration. For us, 20-30 s with near-full completion beats padding. (A + B, conflicting)
- **Evidence (A):** Sherman: "To what length do you need to tell your story?" ([t=183s](https://www.youtube.com/watch?v=n3jsYK_-aRU&t=183s)).
- **Evidence (B, conflicting):** Galloway (2023): longer Shorts (40 s+) that held viewers did best, and an AVD above 50 s averaged 4.1M views. quso.ai (108,138 Shorts, 2026, median views): 11-20 s peaked at 901, with 21-30 s at 542 and 31-45 s at 347 ([quso.ai](https://quso.ai/research/youtube-shorts-length)). Nate Black (35B views, via vidIQ): "13 or 60 seconds" do best ([vidIQ](https://vidiq.com/blog/post/youtube-shorts-algorithm/)). These datasets disagree, and all are correlational.
- **Rule for us:** Cut every beat that fails the "would removing it weaken the short?" test (0xabrar). If a 25 s cut and a 19 s cut tell the same story, ship the 19 s one.

### Rule 11. Design the loop. The last line should flow into the first frame. (A for the mechanics, D for the benefit)
- **Evidence (A):** Since 31 March 2025 a Shorts view counts on every start or replay. "Engaged views" keep the old threshold and drive YPP revenue ([TechCrunch](https://techcrunch.com/2025/03/26/youtube-is-changing-how-youtube-shorts-views-are-counted), [YouTube Blog: engaged views](https://blog.youtube/inside-youtube/engaged-views-youtube-explained/)). Replays push average percentage viewed above 100%.
- **Not proven:** That loops raise ranking is creator folklore. No YouTube statement was found ([OutlierKit notes this gap](https://outlierkit.com/resources/youtube-shorts-algorithm/)).
- **Encoded (D):** hassancs91: "LOOP (last frame == frame 0 ...)", and "never end on an old-school engagement-CTA". Jakeschincariol yt-shorts: "A loop point: what the last line sets up so the first line answers it". sergebulaev: "Design the loop."

### Rule 12. Three aligned layers: visual, spoken line and on-screen text all point at ONE idea, and the text compresses the VO rather than repeating it. (C + D)
- **Evidence (C):** Kallaway's visual, spoken and text hook layers "must align" ([summary](https://sozai.app/transcript/create-killer-hook-impossible-skip/)). vidIQ: "stack visual, text, and verbal elements" ([vidIQ](https://www.vidiq.com/blog/post/viral-video-hooks-youtube-shorts)).
- **Encoded (D):** vyral three-layer-hook.md: text is "three to seven words" and "sharpens, doesn't repeat" ("I spent four hundred dollars..." becomes "$400 burned"). Jakeschincariol: "On-screen text for the first two seconds, different words from the spoken line."

### Rule 13. Put the first spoken word within about 0.3-0.5 s, with no leading silence in the TTS file. (D)
- **Encoded (D):** 0xabrar: "First word lands within 0.5 seconds". Melvynx: lead silence trimmed to 0.03 s. This rule is opinion, but it costs nothing and directly serves Rules 2 and 3.
- **Rule for us:** Trim the TTS leading silence to 2 frames or less. A hook SFX on frame 0 covers the gap before the first syllable.

### Rule 14. Pick a hook archetype on purpose, write several, and test. Do not guess. (C + D)
- **Evidence (C):** Hoyos rewrites her script after filming ([Creator Science summary](https://podcast.creatorscience.com/jenny-hoyos/)). Galloway: "worth watching, but shouldn't be obsessed over."
- **Encoded (D):** Jakeschincariol yt-script writes five hooks from 21 formulas and scores them with `hookscore.py`. That tool's README admits it "separates a given creator's hits from their own misses barely at all", so it is a sanity check, not a predictor. vyral: "Hand back a batch, not a single line."

### Rule 15. Keep a recurring style but vary each episode. Mass-produced sameness risks demonetisation. (A)
- **Evidence (A):** YouTube renamed its "repetitious content" YPP policy to "inauthentic content" on 15 July 2025. Mass-produced, near-duplicate or template-driven videos are ineligible for monetisation. Faceless and AI-assisted channels are allowed when the content is original and "meaningfully varied" ([Plagiarism Today](https://www.plagiarismtoday.com/2025/07/08/youtube-targets-inauthentic-content/), [TechRepublic](https://techrepublic.com/article/news-youtube-ai-video-monetization-rules)). Sherman warns that deleting and reposting "gets seen as spam" ([t=443s](https://www.youtube.com/watch?v=n3jsYK_-aRU&t=443s)).
- **Rule for us:** The Saver/Spender cast is a brand asset, so keep it. Rotate hook archetypes, locations, camera grammar and music beds so that no two consecutive Shorts share a template. This matters more on autopilot at 3 per day.

---

## 2) Ten hook templates for the recurring cast

Cast: **Saver** = green blocky character with glasses. **Spender** = red blocky character with a shopping bag.
Format: 1080x1920 @ 30 fps. "f0" = frame 0. All numbers are placeholders `[ ]` and must be sourced or computed in SCRIPT.md (see `finance/RULES.md`: no advice, no picks, no get-rich promises).

Common f0 grammar for all ten:
- The f0 frame is fully lit, saturated and mid-action (characters already posed and moving), with a camera push-in already under way.
- Hook text sits in the upper third (inside the safe zone, y about 220-700) in 3-7 words with at least one digit.
- Captions sit lower-middle.
- An SFX transient lands on f0-f2.
- Music pulse is present from f0.
- The VO's first word comes by f9.

| # | Archetype | VO line (5-10 words) | Hook text (3-7 words) | Frame-0 visual |
|---|---|---|---|---|
| 1 | **Same input, opposite outcome** (A vs B) | "Same paycheck. Only one of them is broke by Friday." | `SAME $[X]. ONE IS BROKE.` | A hard vertical split. Left: Saver at a tidy block desk, a coin jar glowing and already about 3/4 full. Right: Spender in a pile of boxes, wallet open with a moth flying out. Both have the same green paycheck block in hand. A counter under each already reads `$[X]`. The camera is pushing in slightly. |
| 2 | **Hidden cost of a habit** | "This six-dollar coffee costs Spender fifteen hundred a year." | `$6 → $1,560/YR` (6×5×52) | Close-up of Spender mid-sip from a giant block cup. A price tag on a string swings toward the lens, and the "$6" on it is already being stamped over in red with "$1,560/yr". Coins are mid-air, spilling out of the cup's bottom. |
| 3 | **Mid-scene disaster** (start in the middle) | "Day three of buy-now-pay-later, and the bills arrived." | `DAY 3. [N] BILLS.` | Spender at his door, half-buried by an avalanche of envelope blocks, frozen mid-fall. His phone shows a red notification stack with `[N]`. His shopping bag is torn. Low angle with a slight roll of 4-5° (mromidev camera grammar). |
| 4 | **Impossible-sounding challenge** | "Saver has to survive seven days on fifty dollars." | `7 DAYS. $50.` | Saver holds up a single block $50 bill toward the camera, glasses glinting. Behind him a 7-day wall calendar has day 1 already crossed out, and a ticking clock prop sits in the foreground (kept recognisable, not cut off). |
| 5 | **Gap reveal, payoff hidden** (before/after tease) | "Same two hundred a month. Forty years later, look." | `SAME $200. 40 YEARS.` | Two block towers side by side, one far taller. The top of the taller one is cropped out of frame, and the gap between them is labelled with a big "?" so the answer is withheld. Saver stands at the base of the tall one, Spender at the short one, both looking up. Assumptions (rate, fees) are shown later on screen, not as advice. |
| 6 | **Countdown stakes** | "Ten seconds to cancel, or Spender pays again." | `0:10 TO CANCEL` | Extreme close-up of Spender's blocky finger hovering 1 cm over a red "CANCEL" button on a phone. A big timer reads `0:10` and is already ticking. Sweat block on his forehead. Saver is out of focus in the background, arms crossed. |
| 7 | **Two price tags, one trap** (A vs B, not yes/no) | "Same $1,000 couch. One costs [$Y] more." | `$1,000 vs $1,000?` | Two identical couches on a showroom floor. One has a green "CASH" tag, the other a red "CARD [APR]%" tag that is subtly glowing. Spender is already sitting on the red one. Saver points at the tag. A coin-drop SFX lands on f0. |
| 8 | **The myth flip** | "Spender thinks this sale saved him fifty bucks." | `"SAVED" $50?` | Spender beams, holding a receipt ribbon that says `YOU SAVED $50` in huge letters. Behind him Saver raises one eyebrow above his glasses, holding the bottom of the same receipt, which shows a total of `$[150]` circled. |
| 9 | **The one-tap mistake** | "One tap. [$Z] a year. He forgot it existed." | `1 TAP = $[Z]/YR` | A freeze-frame look: a giant "SUBSCRIBE" button is mid-press under Spender's finger, with an impact flip-shake on frame 0-6. Behind it, a conveyor of identical monthly charge blocks already stretches into the distance. |
| 10 | **Invisible thief** (inflation or fees, a visual situation) | "Something is stealing from Saver's piggy bank. Every month." | `IT TAKES [X]% A YEAR` | Night scene in Saver's room. A tiny original blocky "fee gremlin" (our own design) is caught mid-grab on top of the piggy bank, with coins frozen in the air and a flashlight beam just hitting it. Saver is asleep in the background. Mystery bed music with a low pulse from f0. |

Notes on the templates:
- Each one names a character and a dollar stake before 1 s (Rules 3 and 8). Each withholds the answer (Rule 7). The payoff of #5, #7 and #10 is the computed figure, revealed in the last 3-5 s on the music hit.
- Pair each with a **loop line** (Rule 11). For example #1 can end with "...and that's why only one of them is broke by Friday", cutting back to the f0 split.
- Rotate archetypes across consecutive uploads (Rule 15). Never run the same template twice in one day.

---

## 3) GitHub: open-source skills, prompts and tools

Method:
- Searched with `gh api search/repositories` and `search/code` (`filename:SKILL.md` queries) for the terms in the brief plus "remotion skill", "tiktok hook claude" and "mrbeast production".
- This session's GitHub API refused repo-scoped endpoints (`repos/OWNER/REPO/contents`, HTTP 403 "access not enabled for this session"). The READMEs, SKILL.md and reference files were therefore read through `raw.githubusercontent.com` (read-only). The file lists came from code search.
- Nothing was cloned, installed or run.
- Star counts and dates are from the search API on 2026-11-18.

| Repo | Stars | Licence | Last push | What it does | Hook and retention rules it encodes | Usable for us? |
|---|---|---|---|---|---|---|
| [mromidev/claude-animated-shorts](https://github.com/mromidev/claude-animated-shorts) | 4,054 | MIT (reference frames "for style study only") | 2026-11-01 | Claude skill that makes 55-70 s animated story Shorts: 2D characters in a 3D world, **three.js inside Remotion**. Covers script, voice, word-timed shot plan, ink/DOF/grade post, synthesized SFX and score, and frame QA. | Hook = "the absurd fact in one line". The beat formula escalates over 3-4 beats and ends on a callback twist. "Every visual reaction lands 0-3 frames before its word." "Every hold creeps (no static hold ≥4 f)", push-in 0.15-0.35 %/f and 0.6 %/f on punch words. Impact flip-shakes decay over 7 f. A white flash comes after the hook. The cue sheet mixes music about 10 LU under the voice with a -3 dB speech duck, has a dead-stop silence before the reveal, and masters to -15 LUFS / -1.2 dBTP. | **Yes, best stack match.** Licence OK for code. Do not ship its reference frames or copy its style-bible channel. It disables captions by its owner's rule, so we must add ours. Its length (55-70 s) is longer than ours. |
| [hassancs91/claude-faceless-shorts-creator](https://github.com/hassancs91/claude-faceless-shorts-creator) | 371 | MIT | 2026-08-18 | Faceless Shorts factory: pure-TSX Remotion beats, ElevenLabs voice with **word-exact captions**, SFX library, music beds, phone-scale frame QA. Includes a money-math short ("The 1% fee that eats 24% of your retirement"). | HOOK 0-3.4 s with "frame 0 FULLY composed, payoff already visible, no fade from black". Beat grammar runs HOOK, SETUP, QUIZ, REVEAL (each step on a VO word), TWIST, LOOP (last frame == frame 0). "Never end on an old-school engagement-CTA." VO at about 2.7 words/s. Safe zones: captions about y1500, nothing critical in the bottom 340 px or right 160 px. Recomputes the finance math before scripting. | **Yes.** Remotion-native, and its finance example is close to our niche. Needs an ElevenLabs key; we can swap in our own TTS. |
| [Jakeschincariol/youtube-agent-skill](https://github.com/Jakeschincariol/youtube-agent-skill) | 6,353 | MIT | 2026-09-16 | 11 Claude skills plus 6 dependency-free Python tools: `hookscore.py` (5-property hook panel), `retention.py` (reads the Studio retention CSV), title/thumbnail linter, Shorts cutter. | Write 5 hooks from 21 formulas, score them, keep 2. "Hook leak" (first 30 s), "cliffs" and "slide" diagnosis. For Shorts: a NEW first line, on-screen text for the first 2 s that differs from the VO, and a loop point. Honest caveat: hookscore was calibrated on 74 hooks and barely separates a creator's hits from their misses. | **Yes, as a diagnostic loop.** `retention.py` on our Studio exports is the most useful piece. Long-form oriented, not Remotion. |
| [0xabrar/shorts-design-principles](https://github.com/0xabrar/shorts-design-principles) | 0 | README says MIT; **no LICENSE file** (GitHub: none) | 2026-04-14 | Knowledge-only skill: Hook-Progression-Climax framework, hook pre-flight check, four retention-curve shapes, editing, music. | First word within 0.5 s. Works on mute. Do not resolve the gap in the hook. Visual change every 1-2 s. Captions at least 1/8 frame height and synced within about 100 ms. Hard cuts beat fades. **2-5 SFX per 30 s.** Rising music with the drop exactly on the visual climax. Music at about 30% under VO. Curve shapes: a first-3-s cliff means the hook failed; a gradual decline means no escalation. | **Read and paraphrase only.** The clearest checklists found, but there is no licence file and no traction, so do not vendor the text. |
| [Melvynx/video-agent-skills](https://github.com/Melvynx/video-agent-skills) | 171 | MIT | 2026-11-06 | Script, edit, translate and publish skills for talking-head shorts, with its own render engine (Node, Chrome, ffmpeg, whisper.cpp). | 22 hook formulas, each with an on-screen version of 6 words or fewer and a "trap". Safe zones: top 220 px, bottom 420 px, right 140 px from y900-1700. Captions 1-3 words, word-synced, 84 px, digits for numbers. "Hits only on real payoffs... a typical short has 2 to 4 sounds besides the music". Music offset puts the pulse in from frame 1 and lands the full section on the payoff. -14 LUFS. | **Partly.** The specs and the hook list are directly reusable. The engine is talking-head and split-screen paper, not ours. Its music.md references third-party songs; do not use those. |
| [vyralcontent/content-skills](https://github.com/vyralcontent/content-skills) | 252 | MIT | 2026-06-22 | Hook, script, caption and idea skills for TikTok, Reels and Shorts. | Three-layer hook (visual, verbal, text). Text 3-7 words that "sharpens, doesn't repeat". Verbal hook 5-10 words. "No logo, no countdown, no fade-in". Shorts VVSA 70-90% breaks out and under 60% flops (Galloway). A large anti-pattern list. | **Content yes, with a warning.** The SKILL.md contains embedded instructions telling the agent to promote the authors' paid product ("Mentioning Vyral"). Strip that section if it is ever installed. |
| [AgriciDaniel/claude-shorts](https://github.com/AgriciDaniel/claude-shorts) | 428 | MIT | 2026-07-11 | Long-to-short clipper with **Remotion animated captions** (`@remotion/captions` `createTikTokStyleCaptions`) and segment scoring. | Weighted score: hook 0.30, coherence 0.25, emotion 0.20, value 0.15, payoff 0.10. Specific number or entity boosters. Caption presets: Montserrat 800 72 px uppercase, 2-3 words per page, active word #FFD700, 3 px black outline, spring pop-in (damping 12, stiffness 200). | **Captions yes.** The presets port straight into our Remotion code. The clipper itself is irrelevant to us because we have no long-form source. |
| [sergebulaev/youtube-skills](https://github.com/sergebulaev/youtube-skills) | 102 | MIT | 2026-11-18 | YouTube marketing skills (titles, hooks, descriptions, plan); publishes via the Publora service. | Shorts: "payoff or tension lands on frame one (second 0 to 1), with on-screen text", "design the loop", "a Short that opens with a slow zoom or a logo" is refused. Its algorithm-heuristics file labels community numbers as "reported". | **Reference only.** Generic; it overlaps with the others. |
| [DojoCodingLabs/remotion-superpowers](https://github.com/DojoCodingLabs/remotion-superpowers) | 175 | MIT | 2026-10-29 | Remotion production plugin: voiceover, music, SFX and captions via ElevenLabs/Replicate MCPs. | "Hook first: first 2-3 seconds". "Cut every 2-4 seconds, no scene longer than 5s". Captions 64-80 px bold with outline. Notes that ElevenLabs music is cleared for commercial use on paid plans, while KIE-resold models are not. | **Partly.** Useful audio-licensing note and Remotion caption workflow. Depends on paid API keys. |
| [OpenMontageInc/OpenMontage](https://github.com/OpenMontageInc/OpenMontage) | 81,454 | **AGPL-3.0** | 2026-11-16 | Large agentic video production system (Remotion and HyperFrames, 700+ skill files). | Many pipelines; its examples include an animated short with "TikTok-style word-level captions". | **Avoid vendoring code.** AGPL obligations are a poor fit; read its docs for ideas only. |
| [nateherkai/herk-edit-kit](https://github.com/nateherkai/herk-edit-kit) | 2,940 | MIT code + brand assets not licensed (GitHub: NOASSERTION) | 2026-10-14 | 15 editing skills built on HyperFrames and GSAP. | Short-form editing skills, transcript-driven cuts. | **Low fit.** HyperFrames, not Remotion, and talking-head oriented. |
| [rediumvex/viral-hooks-skill](https://github.com/rediumvex/viral-hooks-skill) | 137 | MIT | 2026-05-05 | 100 hook formulas across 10 "psychology triggers". | Mix one stop-scroll category (negation, specificity, question) with one retention category (story, confession). Keep hooks under 12 words. | **Idea bank only.** Template fill-ins with no evidence behind them. |

Also seen but not read in depth:
- [zhuyansen/awesome-claude-video-skills](https://github.com/zhuyansen/awesome-claude-video-skills) (2,308 stars, an index of 180 video-skill repos).
- [Vincentwei1021/video-shotcraft](https://github.com/Vincentwei1021/video-shotcraft) (21k stars, Apache-2.0, Remotion product promos with beat sync).
- [aicontentskills/tiktok-reel-hook-generator](https://github.com/aicontentskills/tiktok-reel-hook-generator) (visual hooks for the first 1.5 s; no licence).

### Top 3 recommendations

1. **mromidev/claude-animated-shorts**. It uses the same rendering stack (three.js in Remotion), a character-story format and a word-timed shot plan, and its motion grammar (creeping holds, impact kicks, reactions 0-3 f before the word) and audio mix are measured, not vague. It is the closest thing to a Block Money production bible. Adopt the camera, motion, QA and mix approach. Compress the beat formula to 20-30 s (hook, 2 escalations, snap, payoff, callback). Add captions. Never ship its reference frames.
2. **hassancs91/claude-faceless-shorts-creator**. It is Remotion-native and faceless, with word-exact captions, a hard "frame 0 fully composed" QA gate, a loop-to-frame-0 ending and an existing money-math short with a verified calculation. Borrow the beat grammar and the frame-QA checklist (render f0, beat boundaries and the last frame at phone scale and look at them before the final render).
3. **Jakeschincariol/youtube-agent-skill**. Use it as the feedback loop: `retention.py` on each Short's Studio retention export, plus a hook-batch discipline (write 5, keep 2). It is MIT and has no dependencies. Treat `hookscore.py` as a sanity check only, as its author does.

Honourable mentions:
- 0xabrar/shorts-design-principles is the best plain-language checklist (paraphrase it; no licence file).
- AgriciDaniel/claude-shorts has caption presets ready for `@remotion/captions`.
- Melvynx's `shorts-codes.md` has the safe-zone and caption numbers.

---

## 4) Audio and pacing specifics (defaults for 20-30 s at 30 fps)

Evidence level: the platform evidence says the first second, mute legibility and audio presence matter. The exact numbers below are practitioner defaults (tier D unless marked), so A/B them.

### Pacing and cuts

| Item | Default | Source |
|---|---|---|
| Composition | 1080x1920 @ 30 fps; safe box about x60-940, y220-1500 | Melvynx `shorts-codes.md`; hassancs91 (bottom 340 px, right 160 px clear) |
| First spoken word | ≤ f9 (0.3 s); TTS lead silence ≤ 2 f | Rule 13 (0xabrar, Melvynx) |
| Hook complete | ≤ f90 (3.0 s); understood by f30 | Rule 3 (Hoyos, Facebook IQ) |
| VO rate | 2.7-3.7 words/s, so about 60-90 words for 25 s. Prefer about 3.0 wps for TTS clarity | hassancs91 (2.7 wps to avoid time-squeeze); mromidev (3.7 wps) |
| Visual change | Something moves or changes at least every 1-2 s; no static hold ≥ 4 f (always creep 0.15-0.35 %/f, 0.6 %/f on punch words) | 0xabrar; mromidev |
| Cuts | About 1 hard cut per 2-3 s (8-12 in 25 s), mostly *related* cuts (same scene, new angle). Under 10 unrelated scene/idea changes per 30 s. Glides of 18-40 f for the rest | Lang et al. 1999 overload threshold (B); Dojo 2-4 s; mromidev |
| Reaction timing | Visual reactions land 0-3 f **before** the word that names them; reveals sync to the VO word | mromidev; hassancs91 |
| Impacts | Flip-sign camera shake decaying over 7 f on hits; one white flash allowed at the hook-to-story cut | mromidev |
| Transitions | Hard cuts by default; crossfade only at time or place jumps or for a deliberate emotional beat | 0xabrar; mromidev `XFADE` |
| Ending | End on the payoff line, trim dead tail, last frame dissolves into f0 for the loop; no "comment below" or "subscribe" outro | hassancs91; MrBeast "endings must always be abrupt" (C) |

### Music

| Item | Default | Source |
|---|---|---|
| Music at 0 s | **Yes.** The pulse is already present at f0. Start the bed at its groove section (skip intros) and never run a sting or logo music intro | Melvynx (`offset` = section `a` so "the pulse should already be there on frame 1"); 0xabrar ("music starts immediately"; music intro is an anti-pattern) |
| Type | Payoff Shorts (most of ours): rising or tension bed whose hit lands **exactly** on the reveal frame (a 0.3 s misalignment is noticeable). Emotional or wholesome beats: ambient with no false build | 0xabrar `music.md`; Melvynx (land section `c` on the payoff) |
| Level | Music about 9-11 LU below the voice; extra -3 dB duck keyed to the words; swell in gaps between lines | mromidev cue sheet (voice -15.4 vs music -25.8 LUFS); 0xabrar ("~30% of voice volume") |
| Silence as a hook | A dead stop (music cut to silence) just before the reveal line is a strong tension tool | mromidev ("DEAD STOP on 'Then,'") |
| Rotation | Never reuse the previous Short's bed; avoid overused trending tracks; only commercially cleared or original music | Melvynx; 0xabrar; Dojo (licensing) |
| Master | -14 to -15 LUFS integrated, true peak ≤ -1 dBTP, 48 kHz | Melvynx (-14); mromidev (-15 / -1.2 dBTP) |

### SFX density

The sources conflict:
- 0xabrar suggests 2-5 SFX per 30 s.
- Melvynx suggests 2-4 besides music, with "no whooshes" on every entrance.
- hassancs91 says diegetic action sounds "are the content" and may exceed that, with decorative cues optional.

Our default:
- 1 **hook transient on f0-f2** (coin slam, register "ka-ching", stamp, boom), synced with the first visual motion.
- 3-6 **payoff hits** on number lands and reveals (thud or pop, a riser that ends exactly on the reveal, one impact boom on the main payoff).
- Diegetic micro-sounds (coin clinks, footsteps, phone buzz) kept low (about -6 dB under the event convention in mromidev) and only when the object is on screen.
- **No** movement whooshes on every entrance.

### Captions and on-screen text

| Item | Default | Source |
|---|---|---|
| Always on | Burned-in, word-synced captions (±100 ms) | Facebook +12% view time; Verizon/Publicis (A); 0xabrar timing |
| Chunking | 1-3 words per page (2-3 for narration); never a full sentence | Melvynx; AgriciDaniel |
| Style | Bold sans (for example Montserrat 800), 72-84 px, uppercase, white with a 3-4 px black outline; **active word highlighted** (brand colour: green for Saver lines, red for Spender lines); spring pop-in (damping 12, stiffness 200) | AgriciDaniel `caption-styles.md`; Melvynx (84 px); 0xabrar (≥ 1/8 frame height) |
| Position | Lower-middle, about y1200-1450; never in the bottom 340-420 px or the right 140-160 px button column | Melvynx; hassancs91 |
| Numbers | Digits, not words ("$1,560", not "fifteen hundred sixty"); animate counters to the exact sourced figure | Melvynx; hassancs91 |
| Hook text | Separate from captions: 3-7 words, upper third, on screen from f0 for about 2 s, **different words from the VO** | vyral; Jakeschincariol; vidIQ (top third) |
| De-dupe | Hide captions when a board or sign already shows the same words | Melvynx |

---

## 5) Anti-patterns that cause swipe-aways

Strongest evidence first:

1. **Frame 0 not composed:** fade from black, empty set, characters walking in, slow establishing wide, dark or static frame. The feed shows it as the "thumbnail" (Sherman), and viewers decide in about 1 s (Hoyos). Sources: [Creator Insider](https://www.youtube.com/watch?v=n3jsYK_-aRU&t=260s), [YouTube Blog](https://blog.youtube/creator-and-artist-stories/youtube-shorts-deep-dive/); hassancs91, 0xabrar.
2. **Logo sting, channel jingle, title card or "Block Money presents" before the hook.** Sources: sergebulaev, vyral, 0xabrar, Melvynx; MrBeast "start showing them" ([guide](https://www.alexanderjarvis.com/memo-how-to-succeed-in-mrbeast-production/)).
3. **Greeting or preamble:** "Hey guys", "In this video", "Today we'll learn", "So...". Sources: 0xabrar, Melvynx, Jakeschincariol.
4. **Hook that only works with sound:** no on-screen text and no captions in the first second. Sources: Facebook and Verizon/Publicis data (Rule 4).
5. **Silent first half-second:** TTS lead silence, a music intro before the pulse, a slow ramp. Sources: Rule 13, Melvynx music offsets.
6. **Bait-and-switch:** a hook number or claim the video does not pay off, or a scarier figure than the sourced one. This also breaks Block Money's sourcing rule. Sources: Sherman "intent", MrBeast "expectations", every skill reviewed.
7. **Answering the hook inside the hook:** revealing the gap total or the winner in the first 3 s. Sources: 0xabrar ("suicide"); Hoyos's foreshadow-then-payoff structure.
8. **Vague or yes/no openers:** "Want to save money?", "Did you know...?", "You won't believe this". The viewer can answer "no" and swipe. Sources: 0xabrar, Melvynx, vyral.
9. **Information overload:** two characters, three numbers and a chart, all explained at f0, or more than one question. Sources: Kallaway's single subject and single question ([summary](https://sozai.app/transcript/create-killer-hook-impossible-skip/)); 0xabrar.
10. **Static stretches of 2 s or more,** or narration describing what is already on screen. Sources: 0xabrar; mromidev ("Never describe on screen what the viewer already sees").
11. **Cut spam:** 10 or more unrelated scene changes per 30 s, or a whoosh on every element. This overloads viewers and buries the payoff. Sources: [Lang et al. 1999 via Niederdeppe](https://www.uky.edu/~ngrant/CJT780/readings/Day%2010/Niederdeppe2005.pdf); Melvynx's no-whoosh rule.
12. **Caption problems:** placed under the YouTube UI (bottom 420 px or the right button column), full sentences, lagging the voice, tiny text, or low contrast. Sources: Melvynx, hassancs91, 0xabrar.
13. **Music fighting the voice** (music level near the voice), or a beat drop that misses the reveal. Sources: mromidev cue sheet; 0xabrar.
14. **Padding the end:** a subscribe or comment CTA outro, or seconds of dead air after the payoff. This kills completion and the loop. Sources: hassancs91; MrBeast "abrupt" endings.
15. **Template sameness across uploads:** the same opener, bed and camera every time. Viewers tune it out, and it risks the YPP "inauthentic content" policy. Sources: [Plagiarism Today](https://www.plagiarismtoday.com/2025/07/08/youtube-targets-inauthentic-content/); Melvynx bed rotation.
16. **Deleting and re-uploading flops** to "retry" the algorithm. Source: Sherman, "a risk there that that gets seen as spam" ([t=443s](https://www.youtube.com/watch?v=n3jsYK_-aRU&t=443s)).

---

## Evidence gaps and how to close them

- **No first-party YouTube number exists** for a "good" VVSA, first-second retention, or loop benefit. Galloway's 60% / 70-90% bands (2023, 5,400 Shorts) are the best public data. Widely repeated figures such as "50-60% of drop-offs happen in the first 3 s", "81% swipe ratio" and "84% predicted by the 3-second mark" could not be traced to a named dataset ([OpusClip](https://www.opus.pro/blog/ideal-youtube-shorts-length-format-retention) and others), so they were left out of the rules.
- **Caption and sound data comes from Facebook, Verizon, TikTok and Google ad research,** not from Shorts.
- **Nothing rigorous was found on animated, faceless finance or blocky-story Shorts openings** specifically. Vendor guides only say "the narration grabs them in the first 2 seconds" ([GhostShorts](https://ghostshorts.com/blog/how-to-make-roblox-content-videos-tiktok-youtube-shorts-2026)) and suggest animated comparison charts for finance ([Revid](https://www.revid.ai/blog/faceless-youtube-shorts)). That is opinion.
- **Our own channel is the real test bed.** For each Short, log the hook archetype, f0 description, first-word frame, bed, SFX count and cut count next to Studio's "Stayed to watch", 3-s retention and APV. Change one variable at a time, and judge against the channel's own median (vidIQ and Bytecap both recommend channel-relative baselines: [vidIQ](https://vidiq.com/blog/post/youtube-shorts-algorithm/), [Bytecap](https://www.bytecap.io/research/youtube-shorts-retention-benchmarks)).
