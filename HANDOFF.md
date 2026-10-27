# HANDOFF: howitreallyworkstudio reel project

Read this first. It replaces the chat history. No passwords, tokens or logins are stored here; the account owner connects those themselves.

## 1. What this is
Instagram `@howitreallyworkstudio` and a YouTube channel with the same name. Vertical animated "how it really works" explainer reels/Shorts, 66-86 s, beginner friendly. One reel is researched, scripted, voiced, rendered, checked, then scheduled (Instagram + YouTube) only after the owner approves it.

## 2. Standing rules (set by the owner)
1. NEVER post to the Facebook Page "Jiesuke". Instagram + YouTube only.
2. Every claim sourced. Write `sources_<name>.md`. Drop or attribute anything you cannot verify (say "according to X"). Keep a list of softened or unverified claims and report it.
3. No realistic photos. Nothing crude or gory. Educational only for health topics (not medical advice).
4. VOICE: female `af_heart` (Kokoro), speed 0.97, music `crayon`, bpm 88, copy `specs/leaf.json` settings and breath list. Already-scheduled older reels keep their male voice; all NEW reels use af_heart.
5. CLOSING LINE: the last spoken phrase AND the on-screen end card of every reel is exactly "Follow for more of how it really works." Total length still <= 86 s.
6. STYLE (strict): each reel is built in ONE of the owner's chosen demo templates (section 4) and must reproduce that demo's actual animation language and formatting, not a lookalike. Only the topic, voiceover and objects are original. Nothing basic. Earlier house templates (pc, qr, micro, spin, fear, anc, candy, oct) were dropped. Say which template and why.
7. Topics are researched with a "this can blow up on YouTube and Instagram" lens. Beginner friendly, a surprising first 3 seconds, a question at the end. Prefer topics nobody on the channel covered yet.
8. Do not ask the owner to fetch websites or send links; do the research yourself (WebSearch/WebFetch).
9. Workers NEVER post, schedule or touch the owner's computer. Build, check, push, stop.
10. Caption format (`caption_<name>.md`): description + blank line + "Sources: ..." + blank line + "Follow for more of how it really works." + 5 hashtags ending `#reels` (no #fyp). YouTube metadata uses #Shorts instead of #reels.

## 3. Pipeline (see reels/ in this repo)
`specs/<n>.json` -> `python3 -I voice2.py <n>` (Kokoro model in ../tts: pip install kokoro-onnx soundfile; kokoro-v1.0.onnx + voices-v1.0.bin from the kokoro-onnx release model-files-v1.0) -> `vo_<n>.wav`, `tl_<n>.js`; `ev_<n>.json` -> `python3 -I mix2.py <n>`; scenes in `t_<n>.js` + `python3 mkhtml.py <n>` -> `t_<n>.html`; `rq.sh <n> <portA> <portB>` -> `out/<n>.mp4`; `enc_hq.sh <n>` -> `up/<n>.mp4` (2-pass ~9.6 MB, crf16 + loudnorm).
Engine: headless Chromium 540x960 @DSF2 -> 1080x1920, deterministic `window.seek(t)`. Scene pattern: per-phrase `V[i](lt,u,t)`, `scene(t)` orchestrator, `window.seek/render/ready`.
Helpers: `newreel.py` (scaffold; refuses to overwrite), `contact.py <name> [cols] [maxframes] [up|out]` (one labelled contact sheet = the cheapest QA), `lib/lib2d.js` primitives, `PRIMITIVES.md`, `USAGE_SAVERS.md`.
Limits: 2 CPUs, ONE render at a time (`flock /tmp/render.lock`), limited disk (delete `frames/<n>` after encode). Each parallel worker uses its own two ports.

## 4. The owner's 19 templates (the only styles to use)
Numbers are the owner's grid positions; the second number is the id in the source repo.
1 paper-lantern (2) | 2 papercut-red (7) | 3 blueprint (8) | 4 crayon-book (20) | 5 impasto (21) | 6 shadow-puppet (22) | 7 silkscreen-poster (23) | 8 urban-sketch (29) | 9 scifi-toon (25) | 10 paper-popup (28) | 11 cel-boil (55) | 12 collage (56) | 13 collage "AI Doom" (78) | 14 explainer "Alchemy Infra" (80) | 15 handdrawn "Distilbook" (83) | 16 cinematic3d "Christmas story" (99) | 17 handdrawn "Playful" (115) | 18 handdrawn "Japan heat wave" (101) | 19 handdrawn "Sketch music" (102).
Sources: clones in `/home/claude/styles-src/` of mg-styles-15, awesome-opus-5-5-video-styles, claude-video-2, animate, awesome-claude-video-skills, awesome-claude-5-5-videos, ClaudeAnimationBase, lemo-opuscar (see README for URLs). Read the demo's source, copy its motion, easing, type and layout. Existing in-house modules in `reels/styles/` (crayon, silkscreen, shadowpuppet, popup, lantern, celboil, handdrawn, neon, cartoon, collage, crt, dataviz, lowpoly...) are starting points, but must be brought up to match the demo.
See TEMPLATES.md for per-template notes. Built and APPROVED by the owner on Oct 27: match (cel-boil), lock (blueprint), ship (paper-popup), skyblue (silkscreen-poster), eclipse (shadow-puppet). They still need scheduling (Instagram/YouTube) once the owner's Chrome is reachable: suggested Instagram slots Nov 6: lock 8 AM, match 1 PM, ship 7 PM; Nov 7: eclipse 8 AM, skyblue 1 PM. Open source URLs once before scheduling; soften 'half of the chemistry is on the box' to 'much of' in the match caption.

## 5. QA checklist (before pushing a reel)
- Contact sheet viewed: first frame not blank, title visible from frame 0, captions not clipped or overlapping, end card clear, "Follow for more of how it really works." present spoken + on screen.
- Duration 66-86 s, 1080x1920, ~9.6 MB.
- Every fact in the script is in `sources_<name>.md` with a source; softened claims listed.
- Audio: voice af_heart, no clipping; a human ear check is still pending unless noted.
- Files: `up/<n>.mp4`, `caption_<n>.md`, `sources_<n>.md`, row in `tracking.csv`, `NOTES.md` (template, why, caveats).

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
Channel id UCiJOc9tuplY-Vo1uT636TJw. Upload dialog: https://studio.youtube.com/channel/UCiJOc9tuplY-Vo1uT636TJw/videos/upload?d=ud (wait 4 s). `find` the file input (button "(file input)") and `file_upload` the mp4. If the dialog says "Daily upload limit reached" (about 10 uploads/day; resets after ~24 h or the owner verifies the account), close it with the X and stop; do NOT try Verify yourself.
Metadata comes from `handoff/yt/meta2.json` (Nov 1-4 reels), `meta3.json` (bats, fog, boot, fridge, vax, hiccup, skyscr) and `meta.json` (older). Each entry: id, file, title (<=100 chars, ends with an emoji), description (hook + sources + "Subscribe for a new explainer every day" + hashtags ending #Shorts), tags, thumb_text, date, time. Thumbnails: `handoff/thumbs/<id>.jpg` (made by thumbs3.py: frame at ~3 s + big yellow Poppins text).
Per video (ASK the owner if anything differs): Details tab -> fill title and description -> upload the custom thumbnail ("Upload file") -> "No, it's not made for kids" -> Next through Video elements/Checks -> Visibility "Schedule" -> set date and time (ET) -> Schedule. Verify in Studio > Content > Shorts (filter by Scheduled) that title and date are right. Update `handoff/yt/yt_schedule.csv`.
Status on Oct 27: 10 Shorts scheduled (gps, snake, leaf, ai, scroll, moon, flamingo, mirror, holes, volcano; Oct 27-29). NOT uploaded yet because of the limit: the Nov 1-4 batch (lightning, chip, scene, sun, cables, polygraph, plane, dna, elec, reactor) and bats, fog, boot, fridge, vax, hiccup, skyscr. A retry was scheduled for Oct 28, 9 AM ET. Halloween first: fog Oct 31 4 PM, bats Oct 31 7 PM.

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
