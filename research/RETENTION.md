# RETENTION: keeping viewers to the end of a 66-86 s reel

Written by worker H4 (Oct 28 2026) for howitreallyworkstudio. This file is the follow-up to HOOKS.md. HOOKS.md covers the first 3 s; this one covers 3 s to the last frame.

## Read first: how solid is each claim?

| Label | Meaning |
|---|---|
| **[official]** | From YouTube or TikTok help pages. |
| **[published]** | From a named study, leaked handbook or thesis, read through a secondary write-up where noted. |
| **[secondary]** | A blog or press summary of someone else's data. I could not open the original. |
| **[opinion]** | Creator advice or my own reasoning. It is not data. |

There are no invented statistics in this file. Where a commonly repeated number could not be traced to its source, it is marked or left out.

---

## 1. The 10 strongest retention techniques, mapped onto our reel structure

### Second-by-second template for a 66-86 s reel

The times are for a ~72 s reel; scale them if a reel runs longer. "Phrase" means one line in `specs/<n>.json`, one visual beat in `t_<n>.js`.

| Time | Beat | What the viewer gets | Technique |
|---|---|---|---|
| 0-3 s | **Hook** (HOOKS.md) | The subject, large and already moving, plus a 3-6 word caption and the first line (≤ 12 words). | 1 |
| 3-6 s | **"But" turn = open loop** | A specific question the viewer can't answer yet ("…so how?"). | 2 |
| 6-12 s | **Promise / preview** | A glimpse of the payoff visual, or a plain promise of what they'll understand. | 3 |
| 12-25 s | **Mechanism, part 1** | A new visual action every phrase (about every 3-5 s). The simplest correct picture first. | 4, 5 |
| ~25 s | **Re-hook 1** | A mini-reveal or a flipped expectation ("Here's the trick…", "Most people think X. It's Y."). | 6 |
| 25-45 s | **Mechanism, part 2 + escalation** | Each beat raises the stakes or zooms in: bigger, closer, faster, more surprising. | 7 |
| ~45-50 s | **Re-hook 2** | "Here's the catch…", "Here's the proof…", a counter-example or a number that sounds wrong. | 6 |
| 50-65 s | **Payoff** | The opening question answered explicitly, with the strongest visual of the reel. | 8 |
| 62-68 s | **Viewer question** | One concrete question to comment on ("Puller or pusher?"). | 9 |
| last 2-3 s | **Closing line + end card** | "Follow for more of how it really works." (owner rule), short. The final frame flows back into the first. | 10 |

### The 10 techniques

**1. Frame 0 decides the swipe.**
- Paddy Galloway's 2023 study of about 33 channels and 5,400 Shorts **[secondary: nowbam.com, Digital Information World write-ups]**:
  - Shorts with 70-90% "viewed vs swiped away" did best; under ~60% rarely did well.
  - His advice: "treat your video like a thumbnail."
- TikTok's ads guide **[official]**: "Prioritize your hook in the first 6 seconds" and "Introduce your content proposition in the first 3 seconds."
- *In our reels:* HOOKS.md rules 1-3. No title card, no fade from black, subject moving at frame 0.

**2. Open a curiosity gap and say it will close.**
- Curiosity as an "information gap" is Loewenstein's account (1994) **[published, not re-read here]**.
- vidIQ **[opinion/creator guide]**:
  - "Tease the most useful part early" so "viewers stay for the resolution";
  - the cycle "hook, then pay it off, then plant the next hook".
- *In our reels:* the "but" line by 5 s ends in a real question, and that same question is answered at 50-65 s. Don't answer it at 15 s.

**3. Show, don't announce.**
- MrBeast production handbook **[published, leaked memo]**:
  - "Stop telling people what they will be watching and start showing them";
  - "The title and thumbnail … set the expectations"; the opening must meet them.
- *In our reels:* the preview at 6-12 s is a visual (the flooding tank, the swirling siphon), not a sentence like "in this video…".

**4. Constant visual change.**
- The MrBeast handbook describes "lots of quick scene changes and highly stimulating simple content that reflects the story" and "no dull moments" **[published]**.
- TikTok recommends "transitions, stickers, and graphics … to retain engagement and view time" **[official]**.
- One creator guide suggests a new element every 8-12 s **[secondary, small correlational sample: treat as opinion]**.
- The owner's REJECTED list (STYLE_FIT.md) shows what happens without it: the same diagram on screen for 20+ s failed.
- *In our reels:* every phrase starts a new visual action (a draw-on, a zoom, a scene change, a stamp, a counter). See rule A.

**5. Captions as a second channel.**
- **[published, survey]** In the 2019 Verizon Media/Publicis survey, up to 80% of viewers *said* they're more likely to finish a video with captions. That is self-reported intent, not measured watch time.
- **[secondary]** Facebook's internal study is reported as about a 12% average lift in view time with captions.
- **[official]** TikTok suggests 5-10 words per second for text overlays.
- *In our reels:* burned-in captions from frame 1, with the key word in the accent colour. Our TTS speaks about 2.5-3.5 words/s, so word-by-word reveals stay well inside that limit.

**6. Re-hooks at fixed points.**
- MrBeast's handbook re-engages at set marks in long videos ("Usually at the 6 minute mark we will include another re-engagement") **[published]**.
- Galloway's data, as reported **[secondary]**: Shorts averaging more than 50 s view duration averaged about 4.1M views, against about 1.8M at 40-50 s. Long Shorts only win when they are *held*.
- *In our reels:* a re-hook line at about 25 s and about 45-50 s: a mini-question, a "catch", a myth flip or a surprising number. Examples so far:
  - "Here's the trick" (airfryer);
  - "Here's the catch: one bright flash…" (darkeyes);
  - "Here's the proof: fish owls…" (owl).

**7. Escalate; don't plateau.**
- MrBeast handbook: "As you get deeper in the video the stakes get higher" **[published]**.
- *In our reels* **[opinion]**: order the facts from familiar to surprising.
  - Each section zooms in (the toilet → the pipe → the siphon) or scales up (one rod → a hundred million).
  - The biggest number or the strangest image goes in the second half, not first.

**8. Put the payoff late, and make it explicit.**
- MrBeast handbook: "Strong payoffs at the end of videos boost retention" **[published]**.
- vidIQ also says to state that a payoff is coming **[opinion]**.
- Derek Muller's thesis (Veritasium, University of Sydney 2008) found explanations that state and then correct the viewer's misconception taught better than clear expository ones **[published, via secondary coverage]**. A "myth then truth" payoff is good for learning as well as for retention.
- *In our reels:* the payoff answers the hook in plain words, at 50-65 s, with the reel's strongest visual (the siphon breaking, the sub rising, the owl wing's tricks named).

**9. Ask a concrete question just before the end.**
- **[opinion]** A specific, easy question ("Puller or pusher?", "Could you sit in the dark for 20 minutes?") gives the viewer a reason to stay to the last line and to comment.
- TikTok recommends ending "with a clear call-to-action" **[official]**.
- *In our reels:* the question goes 2-5 s before the closing line, never earlier, so it doesn't feel like the end.

**10. No slow outro; end on a loop.**
- MrBeast handbook: "Don't ever signal the end of the video…" and "The video endings must always be abrupt to protect retention" **[published]**.
- Since March 31 2025, YouTube counts a Shorts view each time a Short starts or replays, with no minimum watch time; the old definition lives on as "engaged views" **[secondary: TechCrunch, eMarketer, Sprout Social coverage of YouTube's announcement]**.
- *In our reels:*
  - the closing line is mandatory, but keep the end card at 2-3 s, with no logo sting and no long fade;
  - make the last frame echo the first (same subject or palette), so the auto-loop feels seamless **[opinion]**.

---

## 2. Rules for our scene code (t_<n>.js)

**A. A visual change at least every 4 s; nothing static longer than 6 s.**
- Each phrase must start a new action: a new scene, a zoom, a draw-on, a counter, a stamp or a label.
- The same diagram may stay for at most 2 phrases. After that, cut to a close-up, a new angle or a new page.
- QA check: in a 1 frame/s strip, no two frames 6 s apart should look the same.

**B. Re-hook lines** at roughly 22-28 s and 42-50 s. Each should open a new mini-question or flip an expectation, and the script must contain them; check at the spec stage.

**C. Payoff window.**
- The answer to the line-1 question lands between 50 s and the closing line.
- The spec's NOTES.md names the second where it lands.

**D. Escalation order.** Familiar → surprising, and small → big:
- the biggest number or most striking visual is never in the first third;
- the hook is the exception: it is a striking *moment*, not the biggest *fact*.

**E. Captions:**
- burned in from frame 1;
- at most 2 lines, with the accent colour on the key word;
- the caption changes with every phrase;
- no caption covers the subject.

**F. Sound** **[opinion]**:
- a light sound accent (tick, pop, whoosh) on each visual change, under the voice (new mix2.py ducking);
- a brief music dip ("silence") before the payoff line to make it land;
- never a sound cue that sounds like an ending before the end.

**G. End card:**
- at most 3 s after the closing line starts;
- the final 0.4 s fades or holds, no longer;
- the last frame matches the first frame's subject or palette, for the loop.

**H. No dead air:**
- the gap between phrases stays as voice2.py makes it (about 0.14-0.7 s);
- no silent visual-only pause longer than about 1.5 s, except one deliberate "cold pause" per reel at most.

**I. Progress devices help a long Short feel shorter** **[opinion]**. A visible counter or strip (day boxes, the flush-cycle strip, "1 2 3" tricks) tells the viewer how far along they are and that more is coming.

---

## 3. Diagnosing a weak reel from its retention graph

YouTube Studio → the Short → Analytics → Engagement. Read it together with "Stayed to watch" / "Viewed vs swiped away".

| What you see | Likely meaning | What to fix |
|---|---|---|
| **Low "stayed to watch"** (Galloway's band: < 60% weak, 70-90% strong) **[secondary]** | Frame 0 and the hook don't stop the scroll, or they don't match the title and thumbnail. | Frame 0 subject, hook line, caption (HOOKS.md). |
| **Steep drop in 0-3 s** | Same as above, seen on the curve. | Same. |
| **Drop around 3-8 s** | The "but" turn or the open loop is weak, or the reel starts explaining before the viewer cares. | Sharpen the question; move the explanation later. |
| **Steady slope** (gradual decline) | YouTube: viewers "losing interest over time" **[official]**. Pacing is too even, or there's no escalation. | Add re-hooks at 25/50 s; more visual change; reorder facts. |
| **Sharp dip at one second** | YouTube: "Dips mean that viewers are abandoning or skipping at that specific part" **[official]**. | Look at that exact second: a static frame, jargon, a slow sentence, a blank or dark frame, an ending-like sound. |
| **Spike** | YouTube: "more viewers are watching, rewatching, or sharing" that part, or the content was unclear enough to replay **[official]**. | Great moment: open with something like it next time. Confusing moment: simplify it. |
| **Flat line** | YouTube: viewers watch that part from start to finish **[official]**. | Keep doing that. Note which visual or line was on screen. |
| **Drop at the end card** | The reel signalled "it's over" too early. | Shorten the end card; move the viewer question closer to the end. |
| **Curve above 100% near the start** | Replays / loops: people rewatch. | Good. Keep the loop-friendly ending. |

Comparison tips:
- YouTube's "typical retention" compares a video with "the last 10 of your videos of a similar length" **[official]**. Judge a reel against our own recent reels, not against outside benchmarks.
- Numbers since March 2025 count replays as views. Use **engaged views** and the retention curve, not raw views, when comparing reels across the change.

---

## 4. Sources

Official:
- YouTube Help, "Measure key moments for audience retention": https://support.google.com/youtube/answer/9314415
- YouTube Help, audience retention: typical retention, intro, top moments: https://support.google.com/youtube/answer/12942217
- TikTok Ads Help, "Creative best practices for performance ads" (hook in 6 s, proposition in 3 s, 5-10 words/s text, transitions, CTA): https://ads.tiktok.com/help/article/creative-best-practices

Published / primary-ish:
- MrBeast production handbook (leaked 2024), full text: https://www.alexanderjarvis.com/memo-how-to-succeed-in-mrbeast-production/
- Loewenstein, G. (1994). "The psychology of curiosity: A review and reinterpretation." *Psychological Bulletin*, 116(1), 75-98 (information-gap theory; cited from memory, not re-read for this file).
- Derek Muller, *Designing Effective Multimedia for Physics Education* (PhD thesis, University of Sydney, 2008), via THE Journal: https://thejournal.com/articles/2015/05/05/watching-videos-does-not-necessarily-lead-to-learning.aspx

Secondary (summaries of others' data; numbers not independently checked):
- Paddy Galloway Shorts study (2023), write-ups: https://nowbam.com/decoding-the-youtube-shorts-algorithm/ and https://www.digitalinformationworld.com/2023/04/paddy-galloway-decoded-youtube-shorts.html
- YouTube Shorts view-count change (Mar 31 2025): https://techcrunch.com/2025/03/26/youtube-is-changing-how-youtube-shorts-views-are-counted , https://emarketer.com/content/youtube-shorts-changes-view-count-rules-match-tiktok--instagram , https://support.sproutsocial.com/hc/en-us/articles/35874991211533-YouTube-Shorts-View-Count-Update-March-2025
- Captions (Verizon Media/Publicis 2019 survey; Facebook view-time study): https://www.3playmedia.com/blog/studies-find-captions-improve-engagement
- vidIQ, "YouTube Audience Retention: What's a Good Rate and How to Improve It?": https://vidiq.com/blog/post/increase-audience-retention-youtube/
- Pattern interrupt guidance (creator blog, correlational): https://www.gofaceless.ai/blog/optimize-video-engagement-pattern-breaks

Not used (couldn't verify): "70-85% retention at 3 s = 2.2x views", "only 25% watch beyond 5 s", "question hooks +22% retention at 5 s". These circulate in blogs with no traceable source.
