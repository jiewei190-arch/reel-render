Justin clips Shorts job from the owner (Reel Studio MAIN). The owner asked for more 3D Shorts ("Make more of the 3d videos"): batch 3 of YouTube Shorts in the Toon 3D style WITH the new BEANMEN effects ("Yeah I like it it's nice"). Channel: "Justin clips" (YouTube). Build ONE Short: "Immortal Jellyfish: The Animal That Never Dies of Old Age" (slug `immortal-jellyfish`).

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

Per Short, deliver on branch `justinclips/immortal-jellyfish`:
- Project at `whatif/aitrends-2d-studio/projects/<slug>` (git add -f the voiceover.wav and every .wav the mix needs).
- Folder `justinclips/shorts/<slug>/`: script.md, sources.md, a half-size preview mp4 + contact sheet you checked (frame 1, captions vs UI zones, effects, last frame), UPLOAD.md (title = the claim <= 60 chars + 1 emoji, 1-line description + sources + "Voice is synthetic." + 2-3 hashtags + #shorts, pinned either/or comment, cover frame time), the FULL 1080x1920 `video.mp4` (mix.py to -14 LUFS, TP <= -1; if mix.py trims frames, mux the mix onto the full silent video with -c copy; byte-split parts < 95 MB + reassembly note only if needed) + `video.sha256`, and STATUS.md whose FIRST LINE is exactly `STATE: ready` once that final video is pushed (before that `STATE: scripting` / `STATE: building` / `STATE: rendering`).
- Push each Short as soon as it is ready.

Rules: NEVER post, upload or log in anywhere; never enter passwords/tokens. Don't touch other branches/folders.


=== OWNER'S KIT: "the immortal jellyfish" (PDF justinclips/briefs/shorts-kits-nov13-14_owner.pdf, pages 21-26) ===
Title: Immortal Jellyfish: The Animal That Never Dies of Old Age 🪼
Frame 1 hook: THE JELLYFISH THAT CAN'T DIE OF OLD AGE
NARRATION (MAIN edits: say "the immortal jellyfish" instead of the Latin; Latin name "Turritopsis dohrnii" in a caption/card; last line no longer claims it's "the only" animal):
1. There's a jellyfish that refuses to die of old age. Ever.
2. When the immortal jellyfish gets injured or starts starving, it doesn't die. It hits the reset button.
3. It melts into a blob, sinks to the seafloor, and transforms back into a baby.
4. Then it grows up again. And again. And again. It's called transdifferentiation.
5. Imagine a butterfly turning back into a caterpillar every time life got hard.
6. It's smaller than your pinky nail, and in theory, it can do this forever.
7. The catch? Everything eats it. Immortal, but also... lunch.
8. It cheats old age - and it doesn't even have a brain.
SHOTS: 1 glowing toon jellyfish with a tiny halo in dark water + hook. 2 a wave bonks it, it winks, smacks a literal red RESET BUTTON. 3 melts into a blob, sinks in slow motion. 4 blob morphs into a polyp, mini jellyfish buds pop off. 5 circular arrow loop adult > blob > baby > adult spinning faster, "TRANSDIFFERENTIATION" stamp. 6 split screen butterfly/caterpillar in party hats, two-way arrow. 7 pinky-nail comparison, label "4.5mm". 8 infinity symbol of jellyfish, "in theory... FOREVER". 9 fish and turtles queue at a "LUNCH" sign, jellyfish nervous (no eating shown). 10 brain-scan machine "NO BRAIN FOUND", it shrugs; loop.
CAPTIONS: this jellyfish > never dies > of old age > injured? > starving? > reset button > melts into blob > sinks down > becomes a baby > grows up again > and again > forever > butterfly > caterpillar > smaller than > your pinky nail > in theory > immortal > the catch? > everything eats it > cheats old age > no brain
DESCRIPTION line: Turritopsis dohrnii can reverse its life cycle and become a baby again when it is hurt or starving - making it, in theory, biologically immortal.
FACTS: ~4.5 mm (NHM London); damaged/stressed/starving medusa shrinks to a cyst, settles, reverts to polyp via transdifferentiation, matures again (NHM); repeatable, may never die of old age in perfect conditions (NHM, BBC); still eaten by fish/turtles (NHM); no brain, a nerve net. Sources: Natural History Museum, BBC Future, The Conversation.

Owner rules: NARRATOR = Chatterbox D2 (copy whatif/voice/chatterbox_d2.py + setup_chatterbox.sh + README from origin/voice-test; use it where fenrir.py was used; it spells numbers for TTS, captions keep digits). Closer "Subscribe for more." (< 1.5 s), hard cut to frame 1 (loop). Length = what the script needs (~30-38 s), no padding. Frame-1 hook text big and readable in 1 s. UPLOAD.md: title as given (<= 60 chars) + description line + Sources + "Voice is synthetic." + 2-3 hashtags + #shorts; pinned either/or comment; cover frame. Verify every claim against the listed sources (WebSearch/WebFetch) and write sources.md with URLs; if something doesn't hold, fix the line to what the source says and note it in STATUS.md. Never post, upload or log in anywhere.
