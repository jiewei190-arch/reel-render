# How the YouTube Shorts game works (research for @howitreallyworkstudio)

H1 research, Oct 28 2026. Every claim is tagged:
- **[OFFICIAL]**: YouTube Help, YouTube Official Blog, How YouTube Works, or a YouTube employee on the record.
- **[PRESS]**: reporting of an official announcement (TechCrunch, Search Engine Journal, PPC Land).
- **[UNOFFICIAL]**: analysts and creator guides. These are rules of thumb, not YouTube facts.

No number here is invented. Where nobody has published a number, that's said too. Sources are in section 4.

---

## 1. How it works, in plain words

1. **The Shorts feed is the main stage.** Most Shorts views come from the swipe feed, not from search or channel pages. A viewer gets your Short without choosing it, and decides in the first moment whether to stay or swipe [PRESS, PPC Land on the Jul 2026 thumbnail launch; Sherman 2023 via SEJ].
2. **A new Short is tested, then widened or dropped.** YouTube's Shorts product lead Todd Sherman (2023) described Shorts getting a few hundred to a few thousand early views while the system looks for an audience. Reach then grows or tapers depending on how those viewers react [OFFICIAL, Sherman interview as reported by SEJ]. Exact test sizes are not public. Blog claims like "200-500 viewers in the first hours" are [UNOFFICIAL] and unverified.
3. **"The audience is the algorithm."** The system follows what viewers do. It does not follow tricks [OFFICIAL, Sherman].
   - YouTube's general recommendation page lists viewing behaviour, likes, dislikes, subscriptions, feedback and **satisfaction surveys** as inputs. It also says it weighs **channel reputation and quality** [OFFICIAL, How YouTube Works].
   - Shorts and long-form are recommended by separate systems [OFFICIAL per Sherman, via The Leap: UNOFFICIAL summary].
4. **The first signal is "Stayed to watch"** (formerly "viewed vs. swiped away"). It is the share of feed impressions where people chose to keep watching. YouTube added it to Analytics so creators can see how often a Short is watched rather than swiped [OFFICIAL, Sherman via SEJ]. After that come watch time and percentage viewed, replays, likes, comments, shares and subscribes. YouTube does not publish the weights [OFFICIAL: "view threshold" details are kept private and change over time].
5. **Views were redefined on Mar 31 2025.**
   - A Shorts "view" now counts every start or replay, with no minimum time.
   - The old, stricter count is now called **"engaged views"** (Analytics, Advanced mode).
   - **Money and Partner Program eligibility still use engaged views** [PRESS, TechCrunch, Mar 26 2025].
   - Practical meaning: public view counts look bigger. Judge quality with engaged views, Stayed to watch and percentage viewed.
6. **Loops count.** Every replay is now a view [PRESS, TechCrunch]. Whether replays are *weighted* extra for distribution is not published. Average-viewed-over-100% read as "people rewatched" is an [UNOFFICIAL] community reading.
7. **Shorts can be up to 3 minutes** (square or vertical) since Oct 15 2024 [OFFICIAL, YouTube Help "Understand three-minute Shorts"].
   - Catch for our 66-86 s reels: **a Short over 1 minute with an active Content ID claim is blocked worldwide** until the claim is resolved [OFFICIAL, same page].
   - Our music is generated in mix2.py, so we're safe. Never add licensed songs.
8. **Search and titles matter less in the feed, more in search.** The feed runs on reactions; titles and descriptions help Shorts search and surfaces outside the feed [UNOFFICIAL, creator guides].
   - Hashtags: up to 3 show by the title; more than 60 hashtags and all of them are ignored; unrelated hashtags are not allowed [OFFICIAL, YouTube Help "Hashtags"].
   - Sherman: hashtags are optional [OFFICIAL via SEJ].
9. **Thumbnails barely matter for Shorts reach.**
   - The Shorts feed shows no thumbnail. Thumbnails appear on Home and the channel's Home/Shorts tabs [PRESS, PPC Land].
   - Custom Shorts thumbnail *upload* launched Jul 24 2026, **for YouTube Partner Program channels first**, desktop only, with no A/B testing [OFFICIAL, YouTube Blog; PRESS, PPC Land].
   - Everyone else can pick a frame (any frame on mobile; one of three suggestions on desktop) [OFFICIAL, YouTube Blog].
10. **Related video link.** Each Short can carry one clickable link to another video on the same channel. It sits under the handle in the Shorts player [OFFICIAL, YouTube Help 14075157].
    - It needs **advanced feature access** (account verification).
    - The linked video must be public or unlisted.
    - Clickable links in Shorts descriptions and comments were switched off in Aug 2023 [PRESS, SEJ/Tubefilter].
11. **Remix.** Viewers can remix our Shorts (Sound, Collab, Green Screen, Cut 1-5 s). The original is credited on the remix's pages and player metadata, and our Shorts are opted in by default [OFFICIAL, YouTube Help 10623810]. That's free distribution for clear, quotable moments.
12. **Volume.** Sherman: posting more doesn't by itself expand or cut reach, but many low-quality posts can hurt. Make better videos rather than more weak ones [OFFICIAL via SEJ]. There is no magic number.
13. **Posting time.** YouTube's position as reported: publish time doesn't change long-term performance, but early views can help early recommendations [UNOFFICIAL, Shopify summary of YouTube guidance; I couldn't open the YouTube original]. The published "best Shorts times" lists conflict with each other [UNOFFICIAL].
14. **What kills reach (or money).**
    - **Spam policy** [OFFICIAL, YouTube Help "Spam, deceptive practices"]:
      - no flooding with repetitive content (though "posting a few variations of a video is ok");
      - no mass production;
      - no re-posting material from other platforms "without adding anything of your own".
    - **Monetization ("inauthentic content")** [OFFICIAL, YouTube channel monetization policies; renamed Jul 15 2025, a "minor update"]:
      - no "content that looks like it's made with a template";
      - nothing that "may feel repetitive to viewers after watching several videos in a row";
      - no "similar or repetitive content with low educational value";
      - no "AI-generated content made with generic or unoriginal templates giving the impression of mass production".
      - A shared intro and outro is fine if the bulk of each video is different.
    - **Reuploads.** Sherman advised against re-uploading to boost reach; it can be read as spam [OFFICIAL via secondary summaries].
    - **Watermarks.** Other-platform watermarks aren't mentioned in YouTube's policy text. The "compiled from other social media" and "copied without modification" rules are what bite [OFFICIAL]. Creator guides say TikTok-watermarked uploads underperform [UNOFFICIAL].
15. **Partner Program on Shorts:** 1,000 subscribers **plus** either 10 million qualified Shorts views (public Shorts that appear in the Shorts feed) in 90 days, or 4,000 long-form watch hours in 12 months [OFFICIAL, YouTube Help 72851]. Several Shorts features are YPP-first, custom thumbnails included.

---

## 2. The 10 most important actions for OUR channel

We make animated 66-86 s explainers, 5 a day. Each action below is tied to a pipeline file.

| # | Action | Why (section 1) | Concrete change in our pipeline |
|---|---|---|---|
| 1 | **Win "Stayed to watch" in frame 0.** The subject is large and already moving at 0.0 s; there's no ident, no badge and no fade-in before 5 s. | The feed decision happens before any title is seen (1, 4). | **HOOKS.md**: already rules 1-5. Add a QA line: "frame 0 still = would you stop scrolling for this?" **brand.py** keeps T0 = 5 s. **GROWTH.md §1** already agrees. |
| 2 | **Earn the full 66-86 s:** re-hook every ~20 s, and no padded endings. | Longer Shorts only win if they're held; percentage viewed and engaged views are the quality read (4, 5). Galloway's study found long Shorts did best only when average view duration was above 50 s [UNOFFICIAL, secondary summary]. | **HOOKS.md rule 6** (re-hooks at ~25 s and ~50 s): make it a QA check. Add to NOTES.md: "where would a viewer leave?" If a reel's percentage viewed is in our bottom quartile after a week, the next script on that template targets 66-70 s, not 80+. |
| 3 | **Design the loop.** The last image hands back to frame 0, and the question before the closing line echoes the hook. | Every replay is now a view (5, 6). | **GROWTH.md §2** "Loop the ending" exists. Make it a hard checklist item and note in NOTES.md *how* it loops. |
| 4 | **Titles are the searched question, keyword first:** "Why do owls fly silently? 🦉", not only a clever line. Keep them at 100 characters or fewer and put the topic noun in the first 40 characters. | Titles drive Shorts search and non-feed surfaces (8). | **handoff/yt/meta*.json** `title`: format `<searched question> <hook twist> <emoji>`, e.g. "Why does a jack-o'-lantern rot so fast? It's the knife 🎃". Use the demand signal already recorded under GROWTH.md §3. |
| 5 | **The first line of the description is the answer, in plain search words.** Then sources, then 3 relevant hashtags plus #Shorts. Never more than ~5 hashtags and never unrelated ones. | Only 3 hashtags show; over 60 are all ignored; misleading tags break policy (8). | **handoff/yt/*.json** `description`: keep the current shape (hook, sources, subscribe line, hashtags). Check the first sentence contains the topic keywords, and keep the hashtags topic-specific. |
| 6 | **Don't rely on custom Shorts thumbnails. Pick the best frame** (mobile app, or one of Studio's 3 suggestions). Keep thumb_<n>.jpg for Instagram covers and for when we join YPP. | The feed shows no thumbnail. Custom upload is YPP-first, desktop-only, untestable (9). | **HANDOFF.md §8b**: change "upload the custom thumbnail" to "if Studio offers custom upload, use handoff/thumbs/<id>.jpg; otherwise pick the strongest frame". The frame-0 image doubles as the Shorts cover, which is another reason for action 1. |
| 7 | **Link every Short to a related episode** (same topic family or a "Part 2"). That's the only clickable link a Short gets. | The related-video link sits under the handle (10). | Add `"related": "<video id or reel name>"` to each **handoff/yt/meta*.json** entry and set it in Studio > Details at upload. One-off: the owner verifies the account for advanced features. |
| 8 | **Stay clearly "authentic", not a template farm:** rotate templates, vary story shape, keep every script original and sourced. A shared intro/outro is fine, so our end card and EP badge are OK. | The inauthentic-content and spam policies target templated, repetitive, mass-produced uploads. That risk grows at 5 a day with one voice (14). | **STYLE_FIT.md rule 4** (no repeated template within 3 posts) becomes a scheduling check in **handoff/schedule_tt_yt.csv**. **GROWTH.md §6**: never post filler (already there). Add to the NOTES.md checklist: "materially different from the last 3 posts?" |
| 9 | **Never reupload, delete-and-repost or cross-post watermarked files.** Upload the clean `<n>_ep.mp4` (our own badge only). | Reuploads can read as spam. Copied or compiled content is a reused-content violation (14). | **HANDOFF.md §8b**: upload only `jobs/<n>/<n>_ep.mp4` to YouTube, never a TikTok download. If a Short flops, leave it up and make a *new* reel with a new hook on the same topic, not a repost. |
| 10 | **Engagement prompts that fit an explainer:** a one-word-answer question, a pinned comment with a bonus fact, and replies in the first hour. Clear, quotable moments also invite remixes. | Likes, comments, shares, subscriptions and satisfaction feed recommendations (3). Remix credits link back (11). | **GROWTH.md §4** already covers the question, `pinned_<n>.md` and replies. Add: put one 3-5 s "wow" visual near the middle that works on its own (remix-friendly). |

Also, kept short:
- **Music:** Shorts over 1 min with a Content ID claim are blocked, so keep generated music only (**reels/mix2.py**). Never drop in a licensed track.
- **Pace:** the 5-a-day pace is fine only while quality holds (Sherman: weak volume can hurt). GROWTH.md §6 already tells us to flag falling views per post.
- **Posting times:** keep GROWTH.md's slots as a starting point, but treat them as a hypothesis. After 2 weeks, compare engaged views by slot in **handoff/metrics.csv** and move the weakest slot.

---

## 3. Metrics to watch and what good or bad looks like

YouTube publishes **no official thresholds** for any of these. The "good/bad" bands below are labelled rules of thumb. Our real benchmark is our own channel median after ~30 Shorts. Log weekly per reel in **handoff/metrics.csv** and STYLE_FIT.md's Performance column.

| Metric (Studio) | What it tells us | Good / bad (source) |
|---|---|---|
| **Stayed to watch** (viewed vs swiped away; Analytics > Content > Shorts, or the Short's Reach tab) | Hook / frame-0 strength | Good at about 70-90%. Below about 60% rarely did well [UNOFFICIAL: Galloway's 33-channel study, secondary summary]. Creator guides aim at 75-80% [UNOFFICIAL]. Below our channel median means rework the opening style on that template. |
| **Average percentage viewed** / retention curve | Whether the 66-86 s body holds | No official bar. For long Shorts, a flat curve after the first seconds is the goal. A cliff at a timestamp means fix that beat. Over 100% means rewatches [UNOFFICIAL]. Flag reels in our bottom quartile. |
| **Average view duration** (from engaged views) | Absolute hold | Above ~50 s was the band where long Shorts averaged the most views in Galloway's data [UNOFFICIAL, secondary]. |
| **Engaged views vs views** | Real watching vs flicks and loops | Use engaged views for any comparison across time (TechCrunch: YouTube's own advice for pre-Mar-2025 comparisons). A falling engaged/views ratio means more instant swipes. |
| **Subscribers gained per Short** (and per 1k engaged views) | Is it building a show? | No official bar. Compare across reels: high views with low subs means a one-off curiosity; high subs means a "series" topic worth a Part 2. |
| **Likes, comments, shares** per 1k engaged views | Satisfaction and spread | No official bar. Shares are the strongest "show a friend" signal. Rank our reels by it and feed the winners into topic choice (GROWTH.md §3). |
| **Traffic source: Shorts feed share** | Is the feed testing us widely? | The feed should dominate. If search grows, titles (action 4) are working. |
| **Views per post over time, at 5/day** | Volume is not hurting | If the weekly median engaged views per post falls two weeks in a row as volume rises, tell the owner (GROWTH.md §6, Sherman's warning). |
| **YPP progress:** subs and qualified Shorts views over the last 90 days | Unlocks custom thumbnails, money, more tools | Target: 1,000 subs plus 10M qualified Shorts views in 90 days [OFFICIAL]. |

---

## 4. Sources

**Official (YouTube)**
- YouTube Help: Add a related video to your YouTube Shorts. https://support.google.com/youtube/answer/14075157
- YouTube Help: Understand three-minute YouTube Shorts (length, the Content ID block over 1 min, music limits). https://support.google.com/youtube/answer/15424877
- YouTube Help: YouTube channel monetization policies (Generic or Repetitive Content, renamed "inauthentic content" Jul 15 2025; Reused content). https://support.google.com/youtube/answer/1311392
- YouTube Help: Spam, deceptive practices and scams policies (repetitive content, re-posting from other platforms). https://support.google.com/youtube/answer/2801973
- YouTube Help: Hashtags (3 shown by the title, more than 60 ignored, no unrelated hashtags). https://support.google.com/youtube/answer/6390658
- YouTube Help: YouTube Partner Program overview and eligibility (1,000 subs plus 10M qualified Shorts views in 90 days). https://support.google.com/youtube/answer/72851
- YouTube Help: Create YouTube Shorts with remixed content. https://support.google.com/youtube/answer/10623810
- YouTube Official Blog: YouTube Studio custom thumbnail updates (Jul 24 2026; Shorts custom thumbnails for YPP creators first). https://blog.youtube/news-and-events/youtube-studio-custom-thumbnail-updates/
- How YouTube Works: Recommendations (signals including satisfaction surveys and channel reputation). https://www.youtube.com/howyoutubeworks/product-features/recommendations/

**Press reports of official statements**
- TechCrunch: "YouTube is changing how YouTube Shorts views are counted" (Mar 26 2025; engaged views; monetization unaffected). https://techcrunch.com/2025/03/26/youtube-is-changing-how-youtube-shorts-views-are-counted
- Search Engine Journal: "YouTube explains how Shorts algorithm works" (Aug 28 2023; Todd Sherman interview; I did not watch the video itself). https://www.searchenginejournal.com/youtube-explains-how-shorts-algorithm-works/494953/
- PPC Land: "YouTube ends 2-year wait for Shorts thumbnails but blocks A/B testing" (Jul 2026; where Shorts thumbnails appear). https://ppc.land/youtube-ends-2-year-wait-for-shorts-thumbnails-but-blocks-a-b-testing/
- Search Engine Journal / Tubefilter: related links and unclickable description links (Aug-Sep 2023). https://www.searchenginejournal.com/youtube-adds-shorts-links-limits-links-elsewhere/495463 , https://tubefilter.com/2023/09/01/youtube-related-links-multi-format-creators-shorts-live-long-form/
- 9to5Google: Shorts up to 3 minutes (Oct 2024). https://9to5google.com/2024/10/03/youtube-shorts-3-minutes/

**Unofficial (analysts and creator guides; rules of thumb only)**
- Paddy Galloway Shorts study (33 channels, ~5,400 Shorts). Secondary summaries only; I couldn't open the original thread: https://nowbam.com/tag/paddy-galloway/ , https://videogen.io/blog/decoding-the-youtube-shorts-algorithm-a-deep-dive-into-3-3-billion-views
- The Leap, best time to post Shorts (Sherman on separate Shorts/long-form systems; timing advice). https://www.theleap.co/blog/best-time-to-post-on-youtube-shorts/
- Shopify, best time to post Shorts (their summary of YouTube's stance on publish time). https://www.shopify.com/blog/best-time-to-post-youtube-shorts
- ContentStudio, Shorts analytics guide ("Stayed to watch" naming, where it lives in Studio). https://contentstudio.io/blog/youtube-shorts-analytics-guide
- Subscribr, Shorts analytics and SEO guides (75-80% viewed target; feed vs search). https://subscribr.ai/youtube-strategy/youtube-shorts-analytics-metrics-growth , https://subscribr.ai/youtube-strategy/youtube-shorts-seo-guide

**Open gaps (not found from an official source):**
- the size of the first test audience;
- whether replays are weighted extra;
- whether subscribers are shown a Short first;
- an official "good" Stayed-to-watch or percentage-viewed number;
- YouTube's own statement on other-platform watermarks.
