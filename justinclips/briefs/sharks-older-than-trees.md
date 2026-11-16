Justin clips Shorts job from the owner (Reel Studio MAIN). The owner asked for more 3D Shorts ("Make more of the 3d videos"): batch 3 of YouTube Shorts in the Toon 3D style WITH the new BEANMEN effects ("Yeah I like it it's nice"). Channel: "Justin clips" (YouTube). Build ONE Short: "Sharks Are Older Than Trees. Seriously." (slug `sharks-older-than-trees`).

RENDERING: the owner's PC (session "Creator") is currently unreachable, so YOU do the full 1080x1920 render here in the cloud once your preview is checked (render.mjs resolves --out from the kit folder, so pass e.g. `--out projects/<slug>/build/video_silent.mp4`). If MAIN later says the PC is back, stop the cloud render and set `STATE: render-on-pc` with the render + mix commands instead.

Read first (git fetch):
- THE OWNER'S OWN BRIEF for this Short: `justinclips/briefs/shorts-kits-nov13-14_owner.pdf` (+ the text below) on origin/claude/beautiful-hypatia-0w2o96. Follow it: script, shot list, captions, packaging, fact-check, sources.
- The formula + owner rules: `IAWAKEN_PLAYBOOK.md` on origin/claude/beautiful-hypatia-0w2o96 (top notes, "SHORTS-ONLY FOCUS", rule 8 length, "PC render handoff").
- Kit: start your branch from origin/iawaken/toon3d-fx. Toon 3D kit `whatif/aitrends-2d-studio/kits/toon3d/` + README section "BEANMEN effects" + `demo/fx_sheet.png` + `demo/` project (how the effects are used) + `FX_STATUS.md`. A finished Short project to copy: projects/emu-war (or the rome-sacked-short project). SETUP_NOTES.md: python3, npm install, PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers, never `playwright install`. Kokoro kokoro-v1.0.onnx + voices-v1.0.bin in /home/user/reel-render/tts/ (kokoro-onnx release model-files-v1.0; pip install kokoro-onnx soundfile faster-whisper; if faster-whisper errors on `av`, decode with wave + numpy).

Owner rules for these Shorts:
- LENGTH = whatever the story needs. No padding, no stretching, no filler (owner: "whatever the script is best for the topic"). Typically 30-55 s.
- USE THE NEW EFFECTS: sunny sky preset (or a fitting mood light for darker topics), reaction FX after every reveal (???, !, hearts, sweat, sparkle, stars, shake), 1-3 full-screen INSERT cards for the big numbers/facts (bigtext/counter/versus/timeline/map/chart), whip/iris/flash transitions on punchlines, music mood + sfx on words via the kit's audio. BEANMEN-style beat if it fits: "Wait, how...?" -> "You see," one-line explanation.
- Voice: Kokoro am_fenrir via whatif/voice/fenrir.py (0.95, short gaps), deadpan; a beat of silence before punchlines. YEARS/NUMBERS: spell them out in the TTS script the way people say them ("eighteen-oh-seven", "eight ninety-seven"), but CAPTIONS show digits ("1807", "897"). Check with whisper word timestamps that years are not read as "one thousand eight hundred...".
- Frame 1 = craziest image already moving; Line 1 <= 10 words; twist by 3-5 s; new visual every 1.5-3 s; payoff in the last 3-5 s; loop back to frame 1. 9:16 1080x1920 24 fps; captions 1-3 words lower-middle, clear of the Shorts UI.
- Every claim sourced in sources.md; legends said "according to..."; NO gore, no realistic photos, nobody shown hurt (respect tone guards). Closer < 1.5 s: "Subscribe for more." ("Subscribe to find out." only on a cliffhanger). Never "Full story on the channel"/"Follow for more". No channel name in the video.

Per Short, deliver on branch `justinclips/sharks-older-than-trees`:
- Project at `whatif/aitrends-2d-studio/projects/<slug>` (git add -f the voiceover.wav and every .wav the mix needs).
- Folder `justinclips/shorts/<slug>/`: script.md, sources.md, a half-size preview mp4 + contact sheet you checked (frame 1, captions vs UI zones, effects, last frame), UPLOAD.md (title = the claim <= 60 chars + 1 emoji, 1-line description + sources + "Voice is synthetic." + 2-3 hashtags + #shorts, pinned either/or comment, cover frame time), the FULL 1080x1920 `video.mp4` (mix.py to -14 LUFS, TP <= -1; if mix.py trims frames, mux the mix onto the full silent video with -c copy; byte-split parts < 95 MB + reassembly note only if needed) + `video.sha256`, and STATUS.md whose FIRST LINE is exactly `STATE: ready` once that final video is pushed (before that `STATE: scripting` / `STATE: building` / `STATE: rendering`).
- Push each Short as soon as it is ready.

Rules: NEVER post, upload or log in anywhere; never enter passwords/tokens. Don't touch other branches/folders.


=== OWNER'S KIT: "sharks are older than trees" (PDF pages 39-44) ===
Title: Sharks Are Older Than Trees. Seriously. 🦈  (vidIQ 83/100 vs 82 for "Sharks Are Older Than Trees (and Dinosaurs)")
Frame 1 hook: SHARKS ARE OLDER THAN TREES
NARRATION:
1. Sharks are older than trees. Let that sink in.
2. Sharks have been around for about 450 million years. Trees? Only 350 to 390 million.
3. Sharks were swimming for 60 million years before the first tree grew on land.
4. They're older than dinosaurs by about 200 million years. Older than the Atlantic Ocean.
5. They've survived all FIVE mass extinctions - including the one that killed the dinosaurs.  (pause on this beat)
6. Meaning the scariest thing in the ocean is also the most experienced thing on Earth.
7. Trees are the new kids. Sharks just let them stay.
SHOTS: 1 toon shark next to a tiny sapling + hook. 2 timeline bars: shark 450 MILLION vs tree 350-390 MILLION. 3 shark swims past a barren treeless landscape, "60 MILLION YEARS BEFORE TREES". 4 a dinosaur stomps by, shark photobombs, "OLDER THAN DINOSAURS: ~200M YEARS". 5 Atlantic forming as Pangaea splits, shark with popcorn. 6 video-game screen "MASS EXTINCTION 1/5... SURVIVED", 2/5, 3/5, shark dodges meteors. 7 cartoon asteroid falls in the distance, the shark floats past unbothered, "5/5 SURVIVED" (no dinosaur shown getting hit). 8 birthday party: tree cake 3 candles, shark cake 450 sets off the smoke alarm. 9 shark in reading glasses with newspaper + briefcase, "most experienced". 10 tiny tree salutes the shark's giant shadow, "new kids."; loop.
CAPTIONS: sharks are > OLDER > than trees > 450 million years > trees: 350 > 60M years > before trees > older than > dinosaurs too > 200M years > older than the > Atlantic Ocean > survived ALL > 5 mass extinctions > including that one > scariest thing > most experienced > trees are new > sharks allow it
DESCRIPTION line: Sharks have existed for about 450 million years - longer than trees, dinosaurs, and the Atlantic Ocean. They've survived all five mass extinctions.
FACTS: sharks ~450 Myr (NHM); first true trees ~350-390 Myr ago (Live Science, IFLScience); dinosaurs ~240 Myr ago; survived all five mass extinctions incl. 66 Myr asteroid (NHM); Atlantic began forming ~150 Myr ago. Do NOT add "older than Saturn's rings". Sources: Natural History Museum, Live Science, IFLScience.

Owner rules: NARRATOR = Chatterbox D2 (copy whatif/voice/chatterbox_d2.py + setup_chatterbox.sh + README from origin/voice-test; use it where fenrir.py was used; it spells numbers for TTS, captions keep digits). Closer "Subscribe for more." (< 1.5 s), hard cut to frame 1 (loop). Length = what the script needs (~30-38 s), no padding. Frame-1 hook text big and readable in 1 s. UPLOAD.md: title as given (<= 60 chars) + description line + Sources + "Voice is synthetic." + 2-3 hashtags + #shorts; pinned either/or comment; cover frame. Verify every claim against the listed sources (WebSearch/WebFetch) and write sources.md with URLs; if something doesn't hold, fix the line to what the source says and note it in STATUS.md. Never post, upload or log in anywhere.
