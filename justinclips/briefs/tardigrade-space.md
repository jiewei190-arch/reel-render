Justin clips Shorts job from the owner (Reel Studio MAIN). The owner asked for more 3D Shorts ("Make more of the 3d videos"): batch 3 of YouTube Shorts in the Toon 3D style WITH the new BEANMEN effects ("Yeah I like it it's nice"). Channel: "Justin clips" (YouTube). Build ONE Short: "Tardigrade: The Animal That Survived Space Naked" (slug `tardigrade-space`).

RENDERING: the owner's PC (session "Creator") is currently unreachable, so YOU do the full 1080x1920 render here in the cloud once your preview is checked (render.mjs resolves --out from the kit folder, so pass e.g. `--out projects/<slug>/build/video_silent.mp4`). If MAIN later says the PC is back, stop the cloud render and set `STATE: render-on-pc` with the render + mix commands instead.

Read first (git fetch):
- THE OWNER'S OWN BRIEF for this Short: `justinclips/briefs/tardigrade-space_owner-brief.pdf` (+ the text below) on origin/claude/beautiful-hypatia-0w2o96. Follow it: script, shot list, captions, packaging, fact-check, sources.
- The formula + owner rules: `IAWAKEN_PLAYBOOK.md` on origin/claude/beautiful-hypatia-0w2o96 (top notes, "SHORTS-ONLY FOCUS", rule 8 length, "PC render handoff").
- Kit: start your branch from origin/iawaken/toon3d-fx. Toon 3D kit `whatif/aitrends-2d-studio/kits/toon3d/` + README section "BEANMEN effects" + `demo/fx_sheet.png` + `demo/` project (how the effects are used) + `FX_STATUS.md`. A finished Short project to copy: projects/emu-war (or the rome-sacked-short project). SETUP_NOTES.md: python3, npm install, PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers, never `playwright install`. Kokoro kokoro-v1.0.onnx + voices-v1.0.bin in /home/user/reel-render/tts/ (kokoro-onnx release model-files-v1.0; pip install kokoro-onnx soundfile faster-whisper; if faster-whisper errors on `av`, decode with wave + numpy).

Owner rules for these Shorts:
- LENGTH = whatever the story needs. No padding, no stretching, no filler (owner: "whatever the script is best for the topic"). Typically 30-55 s.
- USE THE NEW EFFECTS: sunny sky preset (or a fitting mood light for darker topics), reaction FX after every reveal (???, !, hearts, sweat, sparkle, stars, shake), 1-3 full-screen INSERT cards for the big numbers/facts (bigtext/counter/versus/timeline/map/chart), whip/iris/flash transitions on punchlines, music mood + sfx on words via the kit's audio. BEANMEN-style beat if it fits: "Wait, how...?" -> "You see," one-line explanation.
- Voice: Kokoro am_fenrir via whatif/voice/fenrir.py (0.95, short gaps), deadpan; a beat of silence before punchlines. YEARS/NUMBERS: spell them out in the TTS script the way people say them ("eighteen-oh-seven", "eight ninety-seven"), but CAPTIONS show digits ("1807", "897"). Check with whisper word timestamps that years are not read as "one thousand eight hundred...".
- Frame 1 = craziest image already moving; Line 1 <= 10 words; twist by 3-5 s; new visual every 1.5-3 s; payoff in the last 3-5 s; loop back to frame 1. 9:16 1080x1920 24 fps; captions 1-3 words lower-middle, clear of the Shorts UI.
- Every claim sourced in sources.md; legends said "according to..."; NO gore, no realistic photos, nobody shown hurt (respect tone guards). Closer < 1.5 s: "Subscribe for more." ("Subscribe to find out." only on a cliffhanger). Never "Full story on the channel"/"Follow for more". No channel name in the video.

Per Short, deliver on branch `justinclips/tardigrade-space`:
- Project at `whatif/aitrends-2d-studio/projects/<slug>` (git add -f the voiceover.wav and every .wav the mix needs).
- Folder `justinclips/shorts/<slug>/`: script.md, sources.md, a half-size preview mp4 + contact sheet you checked (frame 1, captions vs UI zones, effects, last frame), UPLOAD.md (title = the claim <= 60 chars + 1 emoji, 1-line description + sources + "Voice is synthetic." + 2-3 hashtags + #shorts, pinned either/or comment, cover frame time), the FULL 1080x1920 `video.mp4` (mix.py to -14 LUFS, TP <= -1; if mix.py trims frames, mux the mix onto the full silent video with -c copy; byte-split parts < 95 MB + reassembly note only if needed) + `video.sha256`, and STATUS.md whose FIRST LINE is exactly `STATE: ready` once that final video is pushed (before that `STATE: scripting` / `STATE: building` / `STATE: rendering`).
- Push each Short as soon as it is ready.

Rules: NEVER post, upload or log in anywhere; never enter passwords/tokens. Don't touch other branches/folders.


=== THE OWNER'S BRIEF: Kit 1 "the animal that survived space naked" (weird science; PDF next to this file) ===
Frame 1 hook text (huge, bold): THIS ANIMAL SURVIVED SPACE. NAKED.

NARRATION (exact, ~33 s):
1. In 2007, scientists strapped tiny animals to the OUTSIDE of a satellite.
2. No suits. No oxygen. Just open space for ten straight days.
3. The radiation out there is a thousand times stronger than on Earth.
4. When the satellite came home, they checked the bodies... and the animals were alive.
5. Some even laid eggs.
6. They're called tardigrades. Half a millimeter long, lives in moss, looks like a gummy bear with eight legs.
7. And now it's the first animal in history to survive outer space... naked.
8. Which means the toughest astronaut ever... is this guy.
(If long, cut "Some even laid eggs", but it is verified, keep it if it fits.)

SHOT LIST (reset every 2-3 s):
1 Cartoon tardigrade floating in a starfield giving a thumbs up + the hook text.
2 Two scientists in lab coats taping rows of tiny gummy-bear tardigrades to a satellite panel; one shrugs at the camera.
3 Satellite in orbit above Earth; cut to the panel: tardigrades lounging like sunbathers in tiny sunglasses.
4 Radiation meter slams past max, glass cracks, alarm light spins.
5 "DAY 1 > DAY 10" counter flipping fast; tardigrade pose changes every flip (reading a newspaper, doing pushups).
6 Satellite lands; scientist opens the panel with tweezers; extreme zoom on his sweating face.
7 Microscope view: tardigrades strolling around; one lays an egg; scientist faints (comedic) in the background.
8 Split screen: human astronaut in a $12M suit vs naked 0.5 mm gummy bear; "WINNER" arrow points to the bear.
9 Close-up cute tardigrade waving; stat chips: "0.5mm" / "8 legs" / "lives in moss".
10 Tardigrade in a tiny astronaut helmet holding a trophy "TOUGHEST ASTRONAUT EVER"; text "this guy."; loop to frame 1.

CAPTIONS: 2007. > scientists strapped > tiny animals > OUTSIDE a satellite > no suits > no oxygen > open space > ten days > radiation 1000x > stronger than Earth > satellite came home > they checked > the animals > WERE ALIVE > some laid eggs > TARDIGRADES > half a millimeter > lives in moss > 8-legged gummy bear > first animal ever > to survive space > NAKED > toughest astronaut > in history > this guy.

PACKAGING: Title "Tardigrade: The Animal That Survived Space Naked" + emoji. Description line 1: In 2007, scientists exposed tardigrades to open space for 10 days on a satellite - no suits, no oxygen - and they lived. The first animal to ever survive outer space.

FACT-CHECK (verified): Sept 2007, ESA's FOTON-M3 satellite, TARDIS experiment exposed tardigrades to open space (vacuum + solar radiation) for 10 days; vacuum barely affected survival and reproduction; a few Milnesium tardigradum survived even the highest solar radiation doses (over 1,000x surface levels); first recorded animal to survive combined space vacuum + radiation; Current Biology 2008 (Jonsson et al.). Dramatized: taping to the hull (really: dried-out in an exposed experiment box), sunbathing/pushups/fainting/trophy. Note in sources.md that only a few survived the full radiation dose.
SOURCES: CBC News · Current Biology (Jonsson et al. 2008, "Tardigrades survive exposure to space in low Earth orbit") · New Scientist · "Tardigrades in space" (ESA/Wikipedia). Verify exact URLs.

Owner rules that still apply on top of the brief: years spoken naturally in the TTS ("two thousand seven", "nineteen nineteen"), captions show digits; closer "Subscribe for more." (< 1.5 s) right after the last line, then hard cut so the loop lands on frame 1; UPLOAD.md description = the brief's line + a Sources line + "Voice is synthetic." + 2-3 hashtags + #shorts; title <= 60 chars + 1 emoji; pinned either/or comment; cover frame time. Length = what the script needs (~33-40 s), no padding. Frame-1 hook text big and readable in 1 s.
