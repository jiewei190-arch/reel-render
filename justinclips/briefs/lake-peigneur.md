Justin clips Shorts job from the owner (Reel Studio MAIN). The owner asked for more 3D Shorts ("Make more of the 3d videos"): batch 3 of YouTube Shorts in the Toon 3D style WITH the new BEANMEN effects ("Yeah I like it it's nice"). Channel: "Justin clips" (YouTube). Build ONE Short: "Lake Peigneur Disaster: The Drill Hole That Swallowed a Lake" (slug `lake-peigneur`).

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

Per Short, deliver on branch `justinclips/lake-peigneur`:
- Project at `whatif/aitrends-2d-studio/projects/<slug>` (git add -f the voiceover.wav and every .wav the mix needs).
- Folder `justinclips/shorts/<slug>/`: script.md, sources.md, a half-size preview mp4 + contact sheet you checked (frame 1, captions vs UI zones, effects, last frame), UPLOAD.md (title = the claim <= 60 chars + 1 emoji, 1-line description + sources + "Voice is synthetic." + 2-3 hashtags + #shorts, pinned either/or comment, cover frame time), the FULL 1080x1920 `video.mp4` (mix.py to -14 LUFS, TP <= -1; if mix.py trims frames, mux the mix onto the full silent video with -c copy; byte-split parts < 95 MB + reassembly note only if needed) + `video.sha256`, and STATUS.md whose FIRST LINE is exactly `STATE: ready` once that final video is pushed (before that `STATE: scripting` / `STATE: building` / `STATE: rendering`).
- Push each Short as soon as it is ready.

Rules: NEVER post, upload or log in anywhere; never enter passwords/tokens. Don't touch other branches/folders.


=== OWNER'S KIT: "the drill hole that ate a lake" (PDF pages 27-32) ===
Title: Lake Peigneur Disaster: The Drill Hole That Swallowed a Lake 🌀  (if > 60 chars with emoji, drop the emoji)
Frame 1 hook: A DRILLING MISTAKE SWALLOWED AN ENTIRE LAKE
NARRATION (MAIN edit: "Everyone survived" -> "Every person got out alive", because three dogs were reported killed; say "Peigneur" as "pan-YUR" once, then "the lake"; don't assign blame beyond the drill piercing the mine):
1. In 1980, one tiny drilling mistake swallowed an entire lake.
2. A Texaco rig was drilling for oil on Lake Peigneur, Louisiana - right above a salt mine 1,300 feet down.
3. The drill punched through the mine's ceiling. The lake started draining like a bathtub.
4. The whirlpool swallowed the oil rig, eleven barges, a tugboat, and 65 acres of land.
5. Then the canal REVERSED. The Gulf of Mexico flowed in backwards - creating Louisiana's tallest waterfall.
6. Days later, nine of the sunken barges popped back up like bath toys.
7. Every person got out alive. The lake went from 10 feet deep... to 200 feet of salt water.
SHOTS: 1 calm toon lake, little rig, crack spreading under it + hook. 2 cross-section: lake on top, glowing mine tunnels below, drill bit, label "1,300 FEET". 3 drill breaks through, water spirals down like a bathtub drain. 4 whirlpool widening, rig tilts, toon workers sprint off (unharmed). 5 barges + tugboat slurped down one by one, counter 1...5...11. 6 trees and land chunks slide into the vortex, stamp "65 ACRES". 7 canal arrows flip, ocean water pours in, "LOUISIANA'S TALLEST WATERFALL: 164 FT". 8 400-foot geysers from the mine shafts. 9 barges popping back up like rubber ducks. 10 depth gauge "10 FT FRESHWATER" flips to "200 FT SALT WATER", text "no people died."; loop.
CAPTIONS: 1980 > one tiny mistake > swallowed a lake > oil rig > above a salt mine > punched through > bathtub drain > whirlpool > 11 barges > a tugboat > 65 acres > canal REVERSED > ocean flowed in > tallest waterfall > in Louisiana > days later > barges popped up > like bath toys > everyone got out > lake now 200ft > salt water
DESCRIPTION line: In 1980, a Texaco drill accidentally punctured a salt mine under Lake Peigneur - the whirlpool swallowed the lake, 11 barges, and 65 acres of land.
FACTS: Nov 20 1980; Texaco-contracted rig pierced the Diamond Crystal salt mine; platform, 11 barges, tugboat, trees, 65 acres (much of Jefferson Island) swallowed; Delcambre Canal reversed, temporary 164-ft waterfall, 400-ft geysers; all 55 miners, the 7-man rig crew and a fisherman escaped, no human deaths (3 dogs reported killed); 9 of 11 barges resurfaced; lake went from ~10 ft freshwater to ~200 ft brackish. MSHA never officially assigned blame. Sources: Wikipedia, UPI archives, "Engineering Oops: The Maelstrom of Lake Peigneur".

Owner rules: NARRATOR = Chatterbox D2 (copy whatif/voice/chatterbox_d2.py + setup_chatterbox.sh + README from origin/voice-test; use it where fenrir.py was used; it spells numbers for TTS, captions keep digits). Closer "Subscribe for more." (< 1.5 s), hard cut to frame 1 (loop). Length = what the script needs (~30-38 s), no padding. Frame-1 hook text big and readable in 1 s. UPLOAD.md: title as given (<= 60 chars) + description line + Sources + "Voice is synthetic." + 2-3 hashtags + #shorts; pinned either/or comment; cover frame. Verify every claim against the listed sources (WebSearch/WebFetch) and write sources.md with URLs; if something doesn't hold, fix the line to what the source says and note it in STATUS.md. Never post, upload or log in anywhere.
