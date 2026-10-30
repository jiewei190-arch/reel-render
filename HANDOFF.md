# HANDOFF: howitreallyworkstudio reel project

Read this first. It replaces the chat history. No passwords, tokens or logins are stored here; the account owner connects those themselves.

## 1. What this is
Instagram `@howitreallyworkstudio` and a YouTube channel with the same name. Vertical animated "how it really works" explainer reels/Shorts, 66-86 s, beginner friendly. One reel is researched, scripted, voiced, rendered, checked, then scheduled (Instagram + YouTube) only after the owner approves it.

## 2. Standing rules (set by the owner)
1. NEVER post to the Facebook Page "Jiesuke". Instagram + YouTube, plus TikTok (owner, Oct 28: "post everything to TikTok") once the owner has created the account and connected it themselves.
2. Every claim sourced. Write `sources_<name>.md`. Drop or attribute anything you cannot verify (say "according to X"). Keep a list of softened or unverified claims and report it.
3. No realistic photos. Nothing crude or gory. Educational only for health topics (not medical advice).
4. VOICE: female `af_heart` (Kokoro), speed 0.97, music `crayon`, bpm 88, copy `specs/leaf.json` settings and breath list. Already-scheduled older reels keep their male voice; all NEW reels use af_heart.
5. CLOSING LINE: the last spoken phrase AND the on-screen end card of every reel is exactly "Follow for more of how it really works." Total length still <= 86 s.
6. STYLE (strict): each reel is built in ONE of the owner's 29 approved styles (section 4 + TEMPLATES.md: the 19 grid templates, #20 crayon, #21-#29 added Oct 28) and must reproduce that demo's actual animation language and formatting, not a lookalike. Only the topic, voiceover and objects are original. Nothing basic. Earlier house templates (pc, qr, micro, spin, fear, anc, candy, oct) were dropped. Say which template and why.
7. Topics are researched with a "this can blow up on YouTube and Instagram" lens. Beginner friendly, a surprising first 3 seconds, a question at the end. Prefer topics nobody on the channel covered yet.
8. Do not ask the owner to fetch websites or send links; do the research yourself (WebSearch/WebFetch).
9. Workers NEVER post, schedule or touch the owner's computer. Build, check, push, stop.
11. THUMBNAIL (owner, Oct 27): every reel gets `jobs/<n>/thumb_<n>.jpg`, 1080x1920, designed in the reel's own template (same type, palette, HUD, a key visual). Big 2-4 word text that matches the hook, inside y 300-1620 so it survives the Instagram 3:4 grid crop (y 240-1680). Make it with `window.thumb()` in t_<n>.js and `PORT=9321 python3 -I reels/thumb.py <n>`. Use it as the YouTube custom thumbnail and the Instagram cover.
12. SOUND MIX (owner, Oct 27): sound effects must never overpower the voice-over. reels/mix2.py now plays effects at 0.5 of their old level and ducks them a further 40% while the voice speaks (spec key "fx_gain" can lower it further; never raise it above 0.5). Do an ear check on the first 10 s of every mix.
13. STYLE FIT (owner, Oct 27): keep STYLE_FIT.md up to date. Read it before choosing a template, add a row after every reel, record owner feedback and later the performance numbers, and refine the template profiles. Choose the template whose storytelling engine *is* the explanation (example: magnet + Distilbook).
14. YEARS (owner, Oct 28): years are spoken the way people say them: "nineteen ninety-nine", "eighteen fifty-three", "twenty twelve", "the seventeen seventies" (2000-2009 = "two thousand five"). reels/voice2.py now does this automatically for any standalone 1100-2099 number (and decades like 1770s). Write `1,853` with a comma when it is a quantity, not a year. Kokoro alone says "one thousand eight hundred fifty-three", so re-voice any reel built before this fix.
15. EPISODES (owner, Oct 28): TikTok and YouTube get episode numbers. Numbers follow posting order in handoff/episodes.csv (EP 01 = glowstick, Oct 28 11 AM). Upload `jobs/<n>/<n>_ep.mp4` (same reel plus an "EP nn · HOW IT REALLY WORKS" badge that fades in at 5 s, made by `python3 -I reels/brand.py <n>`) to TikTok and YouTube; Instagram keeps the plain `<n>.mp4`. YouTube titles end with " | Ep. nn" (handoff/yt/*.json); TikTok captions start with "Ep. nn · ". New reels: add the next number to episodes.csv when they are scheduled, then run brand.py.
16. GROWTH (owner, Oct 28): every reel follows the six growth rules in GROWTH.md (one show: badge, standard end card with "A new 'wait, really?' every day."; keep people watching: hooks, loop ending, 66-86 s; searched/myth-busting/timely topics; one-word question + pinned_<n>.md; profiles in handoff/PROFILE.md; posting pace from Nov 1: 5 TikToks + 5 Shorts + 2-3 Instagram Reels a day, plan in handoff/schedule_nov.csv; weekly metrics in handoff/metrics.csv). Tick the GROWTH checklist in each NOTES.md.
17. WORKFLOW (owner, Oct 28): every new reel goes through these gates, in order:
   a. **Storyboard first.** Before any full render, push `jobs/<n>/storyboard_<n>.jpg` (6 key frames rendered as stills: hook, but-turn, 25 s re-hook, wow moment, 50 s re-hook, end card) plus `jobs/<n>/hooks_<n>.md` (3 opening-line options) and message the main session. The main session sends them to the owner; the full build waits for the owner's pick, unless the owner says "go" for a whole batch.
   b. **Build**, following LESSONS.md, HOOKS.md, GROWTH.md and STYLE_FIT.md.
   c. **Automatic QA**: `python3 -I reels/qa.py <n>` must PASS (static stretches, empty areas, safe zones, loudness, voice over music, length, closing line, spoken years, frame 0). Paste its summary into NOTES.md.
   d. **Peer review**: a different worker (assigned by the main session) checks the sources and watches the contact sheet before the reel goes to the owner. Findings go in NOTES.md.
   e. **Owner review** in Reel Dailies (https://claude.ai/artifact/4i1CintFhB3ZJLqswwSnQA): scores, verdict and note. The main session adds the reel there when it's ready, and copies the notes into LESSONS.md.
   f. **Weekly review** (main session, with the owner's analytics): top 3 and bottom 3 by % watched, where each one drops, then one rule change at a time in LESSONS.md / GROWTH.md, logged in handoff/metrics.csv.
18. AUTHORITY (owner, Oct 28): "whatever you think will help us grow, DO IT. Don't ask me unless it's legal stuff or deleting stuff." The main session decides creative, technical, scheduling-plan and growth questions on its own and reports what it did. It still asks the owner before anything with legal risk (copyright, licences, policy gray areas, claims about people or brands) and before deleting or unpublishing anything. Rules 1, 9 and the no-passwords rule still apply (never Jiesuke; accounts are touched only through the owner's PC session). Approving reels for posting is now the main session's call; the owner's Reel Dailies scores still steer quality.
19. SAVE EVERYTHING TO THE REPO (owner, Oct 28, after a session cut-off): nothing that matters lives only in a session or a scratchpad. Every session (main and workers) commits and pushes after every meaningful step: a storyboard, a script/spec change, a render, a QA pass, a badge, a note. Never leave work uncommitted between turns; a session can be cut off or its container reclaimed at any time. Workers push their own branch (claude/halloween-hN); the main session pushes the handoff branch. The main session also keeps its running state in the repo: handoff/STATE.md (who is doing what, open items, scheduled check-ins), handoff/topics_next30.md (EP tracker + template reservations) and handoff/dailies/ (the Reel Dailies page source and thumbnails), so a fresh session can pick up exactly where the last one stopped.
20. PACE AND STUDY (owner, Oct 28): "grow together as a team, not just keep working non stop, we all need a break" and "study it and learn what we're doing good and bad." Keep a 2-3 week buffer, never more; workers rest when it's full. Every week the accounts' numbers are read (handoff/ANALYTICS_PULL.md, through the owner's PC session, read-only) and studied (handoff/STUDY.md, results in handoff/STUDY_LOG.md), and what we learn changes the next week's topics, hooks, templates and lengths.
21. WHAT IF VOICE (owner, Oct 29): "I like this voiceover, it's smooth and human-like, keep it like this." The What If channel keeps the calm, natural narration of whatif/see-in-dark v2 (projects/see-in-dark/input/voiceover.wav, made on the owner's PC). Every What If episode uses that same voice and delivery. The exact voice/settings are recorded in whatif/VOICE.md once the PC session fills them in. This doesn't change the How It Really Works reels (af_heart).
22. TIME ZONE (owner, Oct 29): give all times to the owner in Eastern Time (ET: EDT until Nov 1, then EST), never UTC.
23. CAPTIONS (owner, Oct 30): EVERY reel / Short (Instagram, TikTok, YouTube Shorts, horror THE RULES, What If Shorts) gets burned-in word-by-word captions, kept above the bottom UI. Long-form YouTube episodes get NO burned-in captions.
10. Caption format (`caption_<name>.md`): description + blank line + "Sources: ..." + blank line + "Follow for more of how it really works." + 5 hashtags ending `#reels` (no #fyp). YouTube metadata uses #Shorts instead of #reels.

## 3. Pipeline (see reels/ in this repo)
`specs/<n>.json` -> `python3 -I voice2.py <n>` (Kokoro model in ../tts: pip install kokoro-onnx soundfile; kokoro-v1.0.onnx + voices-v1.0.bin from the kokoro-onnx release model-files-v1.0) -> `vo_<n>.wav`, `tl_<n>.js`; `ev_<n>.json` -> `python3 -I mix2.py <n>`; scenes in `t_<n>.js` + `python3 mkhtml.py <n>` -> `t_<n>.html`; `rq.sh <n> <portA> <portB>` -> `out/<n>.mp4`; `enc_hq.sh <n>` -> `up/<n>.mp4` (2-pass ~9.6 MB, crf16 + loudnorm).
Engine: headless Chromium 540x960 @DSF2 -> 1080x1920, deterministic `window.seek(t)`. Scene pattern: per-phrase `V[i](lt,u,t)`, `scene(t)` orchestrator, `window.seek/render/ready`.
Helpers: `newreel.py` (scaffold; refuses to overwrite), `contact.py <name> [cols] [maxframes] [up|out]` (one labelled contact sheet = the cheapest QA), `lib/lib2d.js` primitives, `PRIMITIVES.md`, `USAGE_SAVERS.md`.
Limits: 2 CPUs, ONE render at a time (`flock /tmp/render.lock`), limited disk (delete `frames/<n>` after encode). Each parallel worker uses its own two ports.

## 4. The owner's approved templates (the only styles to use): 19 below + #20 crayon + #21-#29 in TEMPLATES.md
Numbers are the owner's grid positions; the second number is the id in the source repo.
1 paper-lantern (2) | 2 papercut-red (7) | 3 blueprint (8) | 4 crayon-book (20) | 5 impasto (21) | 6 shadow-puppet (22) | 7 silkscreen-poster (23) | 8 urban-sketch (29) | 9 scifi-toon (25) | 10 paper-popup (28) | 11 cel-boil (55) | 12 collage (56) | 13 collage "AI Doom" (78) | 14 explainer "Alchemy Infra" (80) | 15 handdrawn "Distilbook" (83) | 16 cinematic3d "Christmas story" (99) | 17 handdrawn "Playful" (115) | 18 handdrawn "Japan heat wave" (101) | 19 handdrawn "Sketch music" (102).
Sources: clones in `/home/claude/styles-src/` of mg-styles-15, awesome-opus-5-5-video-styles, claude-video-2, animate, awesome-claude-video-skills, awesome-claude-5-5-videos, ClaudeAnimationBase, lemo-opuscar (see README for URLs). Read the demo's source, copy its motion, easing, type and layout. Existing in-house modules in `reels/styles/` (crayon, silkscreen, shadowpuppet, popup, lantern, celboil, handdrawn, neon, cartoon, collage, crt, dataviz, lowpoly...) are starting points, but must be brought up to match the demo.
See TEMPLATES.md for per-template notes. Built and APPROVED by the owner on Oct 27: match (cel-boil), lock (blueprint), ship (paper-popup), skyblue (silkscreen-poster), eclipse (shadow-puppet). They still need scheduling (Instagram/YouTube) once the owner's Chrome is reachable: suggested Instagram slots Nov 6: lock 8 AM, match 1 PM, ship 7 PM; Nov 7: eclipse 8 AM, skyblue 1 PM. Open source URLs once before scheduling; soften 'half of the chemistry is on the box' to 'much of' in the match caption.

## 5. QA checklist (before pushing a reel)
- Contact sheet viewed: first frame not blank, title visible from frame 0, captions not clipped or overlapping, end card clear, "Follow for more of how it really works." present spoken + on screen.
- Duration 66-86 s, 1080x1920, ~9.6 MB.
- Every fact in the script is in `sources_<name>.md` with a source; softened claims listed.
- Audio: voice af_heart, no clipping; a human ear check is still pending unless noted.
- Files: `up/<n>.mp4`, `thumb_<n>.jpg` (template-styled cover, checked in the 3:4 crop), `caption_<n>.md`, `sources_<n>.md`, row in `tracking.csv`, `NOTES.md` (template, why, caveats).

## 6. Lessons already paid for
- Never run newreel.py (or any generator) on an existing `t_<name>.js`; it overwrites. Use `--force` knowingly.
- Parallel workers must use different render ports.
- Reels missing the closing line had to be re-voiced; check it at script stage.
- Unverified sources: Wikipedia-only numbers get softened; unreadable pages are not used.
- "remote" isolation agents run in the SAME container (no extra CPUs). Real parallelism = separate cloud sessions, each with its own machine, via this repo.
- Stop hooks ask to commit untracked files: model files and renders are in `.gitignore`.
- Usage: contact-sheet QA beats frame-by-frame; reuse style code; do not re-read big files.

## 7. Worker flow
Owner pastes a one-line prompt into a cloud session -> worker reads this file + README + its BATCH file -> builds reels one at a time -> pushes each to `jobs/<name>/` (mp4, caption, sources, NOTES) -> stops. Main session fetches, fact-checks, shows the owner, and schedules only after approval.

## 8. Scheduling (main session only; needs the owner's Chrome open and signed in)
Use the Claude in Chrome tools (open a NEW tab; call tabs_context first). Browser viewport used so far: ~929x883. Never press Escape in Studio. Never trigger JS dialogs. If a click is blocked by the auto-mode classifier, STOP and ask the owner (it happened once on "Move to Drafts").

### 8a. Instagram (Meta Business Suite bulk composer)
URL: https://business.facebook.com/latest/bulk_post_composer/?asset_id=108790327676933&business_id=3337333239677534 (wait ~4 s after load).
1. The page ships with 3 empty rows. For each row: patch the click hook once per page load:
   `const o=HTMLInputElement.prototype.click;HTMLInputElement.prototype.click=function(){if(this.type==='file'&&!this.isConnected)document.body.appendChild(this);return o.apply(this,arguments)};document.querySelectorAll('input[type=file]').forEach(e=>e.remove())`
   (via javascript_tool). Then `find` "Add photo/video" -> click the ref -> `find` "file input" -> `file_upload` ONE mp4 (absolute path, e.g. .../reels/up/<n>.mp4) -> wait ~6 s -> remove stale `input[type=file]` before the next row.
2. "Post to" dropdown (left column, first row at about (205,173)): it defaults to BOTH Jiesuke (Facebook) and howitreallyworkstudio (Instagram). UNTICK Jiesuke (checkbox ~ (117,223)/(117,228)), click empty space to close. Verify with get_page_text that "Post to" shows only howitreallyworkstudio.
3. Caption box (~ (765,175/320/465)): click and type the caption from `handoff/captions/caption_<n>.md` normalised to: description, blank line, "Sources: ...", blank line, "Follow for more of how it really works.", then a newline and the 5 hashtags ending `#reels` followed by a space. Verify the LAST hashtag survived (it was dropped once).
4. Scroll right 10 ticks at (500,300). "Publish now" dropdown at (753, row y) -> "Schedule" tab -> `find` the popup fields: date textbox (triple_click, type mm/dd/yyyy), hours spinbutton (click, type 2 digits), minutes spinbutton (type 00), meridiem spinbutton (type A or P). Click Update. The row shows "Schedule / <date>, <time>".
5. Delete unused empty rows with their trash buttons (the composer refuses empty rows).
6. get_page_text and check: only howitreallyworkstudio, correct date/time, caption, hashtags. Then `find` "bottom Schedule submit button" and click it, wait ~8 s, click Done (~(707,412)).
7. Verify at https://business.facebook.com/latest/posts/scheduled_posts?asset_id=108790327676933&business_id=3337333239677534 . The search box finds a post by caption word. The list is lazy loaded; the Planner calendar (content_calendar) is fragile (clicking empty cells opens a new composer: Cancel it).
Time slots (US Eastern): 8:00 AM, 1:00 PM, 7:00 PM daily (3 reels/day). Special: Halloween Oct 31 extra slots. Check the Scheduled list for the date first; do not double-book.

### 8b. YouTube Studio (Shorts)
**Oct 28 update (research/YT_SHORTS.md):** custom Shorts thumbnail upload is YouTube Partner Program first (desktop only). If the Studio upload dialog has no thumbnail upload for Shorts, don't force it: pick the best of the suggested frames (the hook frame) and carry on. The Shorts feed shows no thumbnail anyway. The "Related video" link needs advanced features (account verification by the owner, one time); once on, link each Short to a related episode.
Channel id UCiJOc9tuplY-Vo1uT636TJw. Upload dialog: https://studio.youtube.com/channel/UCiJOc9tuplY-Vo1uT636TJw/videos/upload?d=ud (wait 4 s). `find` the file input (button "(file input)") and `file_upload` the mp4. If the dialog says "Daily upload limit reached" (about 10 uploads/day; resets after ~24 h or the owner verifies the account), close it with the X and stop; do NOT try Verify yourself.
Metadata comes from `handoff/yt/meta2.json` (Nov 1-4 reels), `meta3.json` (bats, fog, boot, fridge, vax, hiccup, skyscr) and `meta.json` (older). Each entry: id, file, title (<=100 chars, ends with an emoji), description (hook + sources + "Subscribe for a new explainer every day" + hashtags ending #Shorts), tags, thumb_text, date, time. Thumbnails: `handoff/thumbs/<id>.jpg` (made by thumbs3.py: frame at ~3 s + big yellow Poppins text).
Per video (ASK the owner if anything differs): Details tab -> fill title and description -> upload the custom thumbnail ("Upload file") -> "No, it's not made for kids" -> Next through Video elements/Checks -> Visibility "Schedule" -> set date and time (ET) -> Schedule. Verify in Studio > Content > Shorts (filter by Scheduled) that title and date are right. Update `handoff/yt/yt_schedule.csv`.
Status on Oct 27: 10 Shorts scheduled (gps, snake, leaf, ai, scroll, moon, flamingo, mirror, holes, volcano; Oct 27-29). NOT uploaded yet because of the limit: the Nov 1-4 batch (lightning, chip, scene, sun, cables, polygraph, plane, dna, elec, reactor) and bats, fog, boot, fridge, vax, hiccup, skyscr. A retry was scheduled for Oct 28, 9 AM ET. Halloween first: fog Oct 31 4 PM, bats Oct 31 7 PM.

### 8d. TikTok (owner created the account Oct 28)
Owner's rule: post everything to TikTok too. Use TikTok Studio in the owner's Chrome (https://www.tiktok.com/tiktokstudio/upload), where the owner is signed in themselves; never type a password. Per reel: upload the mp4, caption = the first sentence of caption_<n>.md + "Follow for more of how it really works." + the 5 hashtags, cover = thumb_<n>.jpg if the cover editor allows an upload (otherwise choose the frame with the hook title), turn ON "AI-generated content" (the reels are AI-made), then Schedule at the plan's ET time. TikTok limits how far ahead you can schedule (it has been 10 days; check the date picker). Same slots as Instagram/YouTube in handoff/schedule_plan.csv (column "tiktok").

### 8e. Order of work (updated Oct 28, owner: TikTok + YouTube 5 a day at peak times; Instagram is lower priority because it doesn't pay)
1. **TikTok and YouTube: handoff/schedule_tt_yt.csv.** All 32 reels (Halloween EP 01-12 first), 5 a day Oct 28-Nov 3, `_ep.mp4` files. TikTok slots 09:00, 13:00, 16:00, 19:00, 21:30 ET; YouTube 12:00, 15:00, 18:00, 20:00, 21:30 ET. TikTok captions start "Ep. nn · "; YouTube titles end "| Ep. nn" (handoff/yt/*.json). YouTube allows only about 10-15 uploads a day: upload today's and tomorrow's first, then continue the next day.
2. **Instagram: lower priority.** Halloween rows in handoff/schedule_plan.csv (Oct 28-31), then handoff/schedule_nov.csv (2-3 a day, Nov 1-8), plain `<n>.mp4`.
3. Mark each row "scheduled <date>" in its CSV and in tracking.csv as you go, and push.

### 8e-2. New reels (Batch N, from Nov 3): handoff/schedule_batchN.csv
The main session adds each newly approved reel here (TikTok and YouTube rows, `_ep.mp4`, episode number). The scheduling session schedules these rows too, and marks their status in THIS file. The main session doesn't edit schedule_tt_yt.csv any more, so there are no merge conflicts. Instagram for new reels: post the strongest 2-3 per day from this file at 11:00/17:00/20:00 with the plain `<n>.mp4`.

### 8e-3. Long-form videos: handoff/schedule_longform.csv
A normal YouTube upload (16:9, not a Short). Rebuild the file from its parts first (command in the CSV). Add chapters from chapters.txt to the description, and replace the [link] placeholders with the six Shorts' URLs. Custom thumbnail: long-form videos can take one; if Studio refuses (unverified account), pick a frame and tell the owner to verify. Afterwards, set each tech Short's "Related video" to this video (needs advanced features).

### 8f. Playlists and series (Oct 28)
handoff/series.csv groups the reels into series. On YouTube, create one public playlist per series (title, description from the CSV) and add each Short to its series playlist; with advanced features on, set each Short's "Related video" to the next episode in the same series. On TikTok, create the same playlists when the account has the Playlists feature (Profile -> Create playlist), otherwise skip. Every new reel gets a series in series.csv before it's scheduled.

### 8g. Carousels (Oct 28)
handoff/carousels.csv: one carousel a day at 12:30 ET, posted after that reel's own post. Instagram: upload the slides in order (01-07) as one carousel post, caption from carousel_caption.md, Instagram account only (never Jiesuke). TikTok: Photo mode, the same slides and caption. Photo posts don't earn Creator Rewards; they're for reach. Lowest priority after TikTok/YouTube reels.

### 8c. After scheduling
Update `tracking.csv` (scheduled column) and `yt/yt_schedule.csv`, and tell the owner what is scheduled where.

## 9. Status snapshot (Oct 27 2026)
Scheduled on Instagram through Nov 5 and Oct 31 (bats 7 PM, fog 4 PM). YouTube has 10 Shorts scheduled (Oct 27-29); the rest wait for the upload limit to reset. 15 worker reels (batches A/B) were built and await fact-check and approval; hurricane has two versions (keep hurricanewc, the watercolor one). First five template reels: match, eclipse, lock, ship, skyblue (in progress). See `tracking.csv`.

## 10. Pending work at handoff (Oct 27)
1. Remove the dropped male-voice noise-cancelling reel ("anc") from Instagram: scheduled Oct 31 1:00 PM. Content > Scheduled > search "noise" > ... > Manage post > Move to Drafts (was blocked once; the owner must approve or do it). Also check the unlabelled Oct 31 8 AM and 10 AM posts.
2. YouTube uploads (section 8b) after the daily limit resets.
3. Fact-check and review the 15 worker reels (barcode, caffeine, faceid, hurricane/hurricanewc, onion, orbit, quake, sleep, tap, tickle, touch, wifi, window, zipper) on branches origin/claude/affectionate-feynman-sbqoqd, blissful-planck-8lojos, watercolor-hurricane (mp4s in jobs/<name>/). Keep hurricanewc, drop hurricane. Show the owner, schedule only the approved ones.
4. The five template reels (match cel-boil, eclipse shadow-puppet, lock blueprint, ship paper-popup, skyblue silkscreen-poster) are being built; previews are sent to the owner as they exist.
5. Remaining topic ideas: magnet, search engine, recommendation algorithm, toilet flush, air fryer, submarine, plus new researched topics. More worker batches (BATCH_C...) should use the 19 templates.
6. Owner wants: previews (~8 s) of reels while they build; push finished style code to this repo so cloud sessions reuse it; save session notes to the Obsidian vault "blender practice" (C:\\Users\\jiewe\\blender practice).
7. Optional idea: an Instagram skills guide for YouTube scripts was offered via "comment YOUTUBE" funnel; the owner declined. Not needed.

## 11. Where things are
- handoff/captions, handoff/sources: caption and sources files for the finished reels.
- handoff/yt: YouTube metadata json, schedule csv, thumbnail script. handoff/thumbs: thumbnails.
- handoff/tracking.csv: one row per reel (date, slot, topic, title, duration, scheduled, style, voice).
- reels/: render kit. jobs/: worker outputs (on worker branches). Finished mp4s are NOT in git (large); worker mp4s are in jobs/ on their branches.
