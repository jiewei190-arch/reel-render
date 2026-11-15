Justin clips Shorts job from the owner (Reel Studio MAIN). The owner asked for more 3D Shorts ("Make more of the 3d videos"): batch 3 of YouTube Shorts in the Toon 3D style WITH the new BEANMEN effects ("Yeah I like it it's nice"). Channel: "Justin clips" (YouTube). Build ONE Short: "The Crow Grudge" (slug `crow-grudge`).

RENDERING: the owner's PC (session "Creator") is currently unreachable, so YOU do the full 1080x1920 render here in the cloud once your preview is checked (render.mjs resolves --out from the kit folder, so pass e.g. `--out projects/<slug>/build/video_silent.mp4`). If MAIN later says the PC is back, stop the cloud render and set `STATE: render-on-pc` with the render + mix commands instead.

Read first (git fetch):
- THE OWNER'S OWN BRIEF for this Short: `justinclips/briefs/crow-grudge_owner-brief.pdf` (+ the text below) on origin/claude/beautiful-hypatia-0w2o96. Follow it: script, shot list, captions, packaging, fact-check, sources.
- The formula + owner rules: `IAWAKEN_PLAYBOOK.md` on origin/claude/beautiful-hypatia-0w2o96 (top notes, "SHORTS-ONLY FOCUS", rule 8 length, "PC render handoff").
- Kit: start your branch from origin/iawaken/toon3d-fx. Toon 3D kit `whatif/aitrends-2d-studio/kits/toon3d/` + README section "BEANMEN effects" + `demo/fx_sheet.png` + `demo/` project (how the effects are used) + `FX_STATUS.md`. A finished Short project to copy: projects/emu-war (or the rome-sacked-short project). SETUP_NOTES.md: python3, npm install, PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers, never `playwright install`. Kokoro kokoro-v1.0.onnx + voices-v1.0.bin in /home/user/reel-render/tts/ (kokoro-onnx release model-files-v1.0; pip install kokoro-onnx soundfile faster-whisper; if faster-whisper errors on `av`, decode with wave + numpy).

Owner rules for these Shorts:
- LENGTH = whatever the story needs. No padding, no stretching, no filler (owner: "whatever the script is best for the topic"). Typically 30-55 s.
- USE THE NEW EFFECTS: sunny sky preset (or a fitting mood light for darker topics), reaction FX after every reveal (???, !, hearts, sweat, sparkle, stars, shake), 1-3 full-screen INSERT cards for the big numbers/facts (bigtext/counter/versus/timeline/map/chart), whip/iris/flash transitions on punchlines, music mood + sfx on words via the kit's audio. BEANMEN-style beat if it fits: "Wait, how...?" -> "You see," one-line explanation.
- Voice: Kokoro am_fenrir via whatif/voice/fenrir.py (0.95, short gaps), deadpan; a beat of silence before punchlines. YEARS/NUMBERS: spell them out in the TTS script the way people say them ("eighteen-oh-seven", "eight ninety-seven"), but CAPTIONS show digits ("1807", "897"). Check with whisper word timestamps that years are not read as "one thousand eight hundred...".
- Frame 1 = craziest image already moving; Line 1 <= 10 words; twist by 3-5 s; new visual every 1.5-3 s; payoff in the last 3-5 s; loop back to frame 1. 9:16 1080x1920 24 fps; captions 1-3 words lower-middle, clear of the Shorts UI.
- Every claim sourced in sources.md; legends said "according to..."; NO gore, no realistic photos, nobody shown hurt (respect tone guards). Closer < 1.5 s: "Subscribe for more." ("Subscribe to find out." only on a cliffhanger). Never "Full story on the channel"/"Follow for more". No channel name in the video.

Per Short, deliver on branch `justinclips/crow-grudge`:
- Project at `whatif/aitrends-2d-studio/projects/<slug>` (git add -f the voiceover.wav and every .wav the mix needs).
- Folder `justinclips/shorts/<slug>/`: script.md, sources.md, a half-size preview mp4 + contact sheet you checked (frame 1, captions vs UI zones, effects, last frame), UPLOAD.md (title = the claim <= 60 chars + 1 emoji, 1-line description + sources + "Voice is synthetic." + 2-3 hashtags + #shorts, pinned either/or comment, cover frame time), the FULL 1080x1920 `video.mp4` (mix.py to -14 LUFS, TP <= -1; if mix.py trims frames, mux the mix onto the full silent video with -c copy; byte-split parts < 95 MB + reassembly note only if needed) + `video.sha256`, and STATUS.md whose FIRST LINE is exactly `STATE: ready` once that final video is pushed (before that `STATE: scripting` / `STATE: building` / `STATE: rendering`).
- Push each Short as soon as it is ready.

Rules: NEVER post, upload or log in anywhere; never enter passwords/tokens. Don't touch other branches/folders.

=== THE OWNER'S BRIEF (from the PDF; follow it, these owner-rule adjustments take priority) ===
Concept: comedy-first, a 17-year feud between one mask and a whole crow population; real University of Washington study (2006-2023). Target ~33-35 s, loops.
Frame 1 hook text (kinetic, over shot 1, two lines, readable in 1 s): "In 2006, a scientist wore a caveman mask. The crows never forgave him."

NARRATION (exact; TTS years spoken naturally "two thousand six", "twenty twenty-three", captions show digits):
1. In 2006, scientists trapped a few crows for a study.  (0:00-0:04, flat, let the text hook work)
2. One of them wore a caveman mask. Big mistake.  (half-beat pause after "mask")
3. For the next 17 years, anyone in that mask got screamed at and dive-bombed on sight.  (pace picks up)
4. It gets worse. Crows that were never trapped joined in - they learned the hate by watching.
5. Then they taught it to their babies. A generational grudge.  (comedy beat, let it breathe)
6. The scientists tested a second mask to compare. They picked Dick Cheney.  (straight face)
7. The crows were completely fine with Dick Cheney.  (deadpan; the line comments will quote)
8. The feud only ended in 2023, after the last crow from 2006 died.  (slow, almost serious)
9. So if a crow is staring at you right now... what did you do in 2006?  (loop line)
Owner closer rule still applies: a short "Subscribe for more." (< 1.5 s) right after line 9, then hard cut so the loop lands on frame 1.

SHOT LIST (one scene per 2-4 s; use the toon3d kit + BEANMEN effects):
1 University campus 2006: scientist in lab coat + rubber caveman mask drops a net on a cartoon crow; snap-zoom onto the mask as the net falls; frame-1 hook text over it.
2 Extreme close-up: the trapped crow's eye with the mask reflected in it; camera-shutter sfx; one black-and-white flash frame.
3 Montage: masked scientist crosses the quad, crows pour in screaming, one dive-bombs his head (comedic, nobody hurt); "2006" stamp in the corner; whip-pan between angles.
4 A crow on a branch briefs three others; speech bubble with the mask icon; listeners' eyes narrow one by one (comic pop-ins).
5 Crow family: parent points a wing at a crayon "WANTED" sketch of the mask, three baby crows take notes; hold a beat on the babies.
6 Time-lapse: year counter spins 2008, 2012, 2016, 2020; the scientist gets grayer; the crows never stop.
7 Lab: a lineup of rubber masks on a table; a scientist lifts the Dick Cheney mask (a neutral, recognisable-but-cartoon rubber mask; respectful caricature, no politics, no mockery of the person beyond the study's own joke).
8 Split screen: caveman-mask side = chaos; Cheney-mask side = a peaceful walk, one crow sharing the bench (split-screen wipe).
9 2023: quiet campus; the masked scientist walks by; crows glance up, shrug, go back to eating; a tiny gravestone on the branch reads "2006" (keep it cute, not sad); sudden silence after the chaos.
10 POV: a crow on a wire stares dead into the camera, slow zoom; final line; hard cut back to shot 1.

CAPTIONS (1-3 words; ALL CAPS only on "17 YEARS" and the final line): 2006 / Scientists trapped crows / Caveman mask / Big mistake / 17 YEARS / Screamed at / Dive-bombed / It spread / Never trapped / Taught their babies / Generational beef / Second mask / Dick Cheney / Crows were fine / 2023 / The feud ended / WHAT DID YOU DO?

PACKAGING for UPLOAD.md:
Title: Crows Hated This Mask for 17 Years (Real Study) + 1 emoji (alt: Why Crows Never Forget a Face: The 17-Year Grudge Experiment)
Description: In 2006, University of Washington scientists trapped crows while wearing a caveman mask - and the crows dive-bombed anyone in that mask for the next 17 years. + sources line + "Voice is synthetic." + #shorts #crows #animalfacts #truestory
Pinned comment: either/or, e.g. "Would you wear the mask: yes or no?"

FACT-CHECK (verified; keep sources.md to these): 2006, UW Seattle, John Marzluff's team trapped and banded 7 crows wearing a caveman mask; crows then scolded/mobbed/dive-bombed anyone in that mask; the neutral control mask was Dick Cheney and crows largely ignored it; never-trapped crows learned it by watching, and parents taught their young; scolding spread at least 1.2 km over 5 years (one walk: 47 of 53 crows scolded); by September 2023 no crow scolded the mask anymore, about a year after the last 2006 crow died. Dramatized (fine): all characters, WANTED poster, note-taking babies, bench gag, "generational beef".
SOURCES: Urban@UW "Crows hold grudges against individual humans for up to 17 years" · John Marzluff (Yale University Press) "Crows Remember a Face... for a Long Time" · Cornell, Marzluff & Pecoraro, Proc. R. Soc. B, "Social learning spreads knowledge about dangerous humans among American crows" · Science, "Is That a Caveman or Dick Cheney? Crows Know the Difference" · New York Times, "Friend or Foe? Crows Never Forget a Face, It Seems". Verify the exact URLs yourself.
