Justin clips Shorts job from the owner (Reel Studio MAIN). The owner asked for more 3D Shorts ("Make more of the 3d videos"): batch 3 of YouTube Shorts in the Toon 3D style WITH the new BEANMEN effects ("Yeah I like it it's nice"). Channel: "Justin clips" (YouTube). Build ONE Short: "Molasses Flood 1919: The Boston Tsunami That Killed 21 People" (slug `molasses-flood`).

RENDERING: the owner's PC (session "Creator") is currently unreachable, so YOU do the full 1080x1920 render here in the cloud once your preview is checked (render.mjs resolves --out from the kit folder, so pass e.g. `--out projects/<slug>/build/video_silent.mp4`). If MAIN later says the PC is back, stop the cloud render and set `STATE: render-on-pc` with the render + mix commands instead.

Read first (git fetch):
- THE OWNER'S OWN BRIEF for this Short: `justinclips/briefs/molasses-flood_owner-brief.pdf` (+ the text below) on origin/claude/beautiful-hypatia-0w2o96. Follow it: script, shot list, captions, packaging, fact-check, sources.
- The formula + owner rules: `IAWAKEN_PLAYBOOK.md` on origin/claude/beautiful-hypatia-0w2o96 (top notes, "SHORTS-ONLY FOCUS", rule 8 length, "PC render handoff").
- Kit: start your branch from origin/iawaken/toon3d-fx. Toon 3D kit `whatif/aitrends-2d-studio/kits/toon3d/` + README section "BEANMEN effects" + `demo/fx_sheet.png` + `demo/` project (how the effects are used) + `FX_STATUS.md`. A finished Short project to copy: projects/emu-war (or the rome-sacked-short project). SETUP_NOTES.md: python3, npm install, PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers, never `playwright install`. Kokoro kokoro-v1.0.onnx + voices-v1.0.bin in /home/user/reel-render/tts/ (kokoro-onnx release model-files-v1.0; pip install kokoro-onnx soundfile faster-whisper; if faster-whisper errors on `av`, decode with wave + numpy).

Owner rules for these Shorts:
- LENGTH = whatever the story needs. No padding, no stretching, no filler (owner: "whatever the script is best for the topic"). Typically 30-55 s.
- USE THE NEW EFFECTS: sunny sky preset (or a fitting mood light for darker topics), reaction FX after every reveal (???, !, hearts, sweat, sparkle, stars, shake), 1-3 full-screen INSERT cards for the big numbers/facts (bigtext/counter/versus/timeline/map/chart), whip/iris/flash transitions on punchlines, music mood + sfx on words via the kit's audio. BEANMEN-style beat if it fits: "Wait, how...?" -> "You see," one-line explanation.
- Voice: Kokoro am_fenrir via whatif/voice/fenrir.py (0.95, short gaps), deadpan; a beat of silence before punchlines. YEARS/NUMBERS: spell them out in the TTS script the way people say them ("eighteen-oh-seven", "eight ninety-seven"), but CAPTIONS show digits ("1807", "897"). Check with whisper word timestamps that years are not read as "one thousand eight hundred...".
- Frame 1 = craziest image already moving; Line 1 <= 10 words; twist by 3-5 s; new visual every 1.5-3 s; payoff in the last 3-5 s; loop back to frame 1. 9:16 1080x1920 24 fps; captions 1-3 words lower-middle, clear of the Shorts UI.
- Every claim sourced in sources.md; legends said "according to..."; NO gore, no realistic photos, nobody shown hurt (respect tone guards). Closer < 1.5 s: "Subscribe for more." ("Subscribe to find out." only on a cliffhanger). Never "Full story on the channel"/"Follow for more". No channel name in the video.

Per Short, deliver on branch `justinclips/molasses-flood`:
- Project at `whatif/aitrends-2d-studio/projects/<slug>` (git add -f the voiceover.wav and every .wav the mix needs).
- Folder `justinclips/shorts/<slug>/`: script.md, sources.md, a half-size preview mp4 + contact sheet you checked (frame 1, captions vs UI zones, effects, last frame), UPLOAD.md (title = the claim <= 60 chars + 1 emoji, 1-line description + sources + "Voice is synthetic." + 2-3 hashtags + #shorts, pinned either/or comment, cover frame time), the FULL 1080x1920 `video.mp4` (mix.py to -14 LUFS, TP <= -1; if mix.py trims frames, mux the mix onto the full silent video with -c copy; byte-split parts < 95 MB + reassembly note only if needed) + `video.sha256`, and STATUS.md whose FIRST LINE is exactly `STATE: ready` once that final video is pushed (before that `STATE: scripting` / `STATE: building` / `STATE: rendering`).
- Push each Short as soon as it is ready.

Rules: NEVER post, upload or log in anywhere; never enter passwords/tokens. Don't touch other branches/folders.


=== THE OWNER'S BRIEF: Kit 2 "the molasses tsunami" (absurd history; PDF next to this file) ===
TONE GUARD (MAIN, like our Beer Flood Short): 21 people really died. Keep the comedy on the phrase, the tank, the speed and the company's excuse, NEVER on the victims. Nobody is shown hurt or trapped; no "stuck horse" gag (horses really died): the aftermath shot is an empty sticky brown street + wreckage + the 21/150 text card, quiet music. The sprinter in shot 6 is a generic cartoon sprinter (no real person's likeness); the narration can still name Usain Bolt as the speed comparison.
Frame 1 hook text: A MOLASSES TSUNAMI KILLED 21 PEOPLE

NARRATION (exact, ~35 s):
1. You've heard the phrase 'slow as molasses.'
2. Nobody mentions the time molasses killed 21 people.
3. January 15th, 1919, Boston. A 50-foot steel tank holding 2.3 million gallons of molasses rips open.
4. What comes out is a 15-foot wave moving 35 miles per hour.
5. That's faster than Usain Bolt.
6. It flattens buildings, knocks a firehouse off its foundation, and twists the elevated train tracks like spaghetti.
7. 21 people dead, 150 injured.
8. The company blamed anarchist bombers. The court said: no, you just built a garbage tank.
9. And on hot days, locals swore the neighborhood smelled like molasses for decades. Slow as molasses? Biggest lie in history.
(If over length, cut "knocks a firehouse off its foundation".)

SHOT LIST:
1 Giant brown wave towering over a 1919 Boston street, horse cart in the foreground (before the hit, nobody hurt) + hook text.
2 Cozy grandma knitting: "slow as molasses, sweetie." Record scratch, freeze frame.
3 1919 Commercial Street: giant steel tank groaning, rivets popping like popcorn.
4 Tank rips open, brown wave erupts; stamp "2.3 MILLION GALLONS".
5 Wave barreling down the empty street, speedometer climbing to 35 MPH.
6 Cartoon sprinter running flat out on a track; the wave casually overtakes; double take (comedic, unharmed).
7 Firehouse sliding off its foundation; elevated train tracks bending like a noodle (no people).
8 Courtroom: company lawyer points at a cartoon anarchist with a round black bomb; judge slams gavel; stamp "GARBAGE TANK".
9 Aftermath: quiet brown street, wreckage, text "21 dead / 150 injured" (respectful beat, no gag).
10 Modern Bostonian on a hot day stops, sniffs, whispers "...molasses."; text "slow as molasses?" with a big red X; loop to frame 1.

CAPTIONS: slow as molasses > a lie > January 15th > 1919, Boston > 50-foot tank > 2.3 MILLION gallons > RIPS OPEN > 15-foot wave > 35 MPH > faster than > Usain Bolt > buildings flattened > firehouse MOVED > train tracks > like spaghetti > 21 dead > 150 injured > company blamed > anarchist bombers > court said no > garbage tank > hot days > smelled sweet > for decades > slow as molasses? > biggest lie

PACKAGING: Title "Molasses Flood 1919: The Boston Tsunami That Killed 21 People" (shorten to <= 60 chars + emoji if needed). Description line 1: In 1919, a 2.3-million-gallon molasses tank burst in Boston and sent a 35-mph wave through the streets. 21 people died. This actually happened. Pinned comment about the tank/company, never jokes about victims.

FACT-CHECK (verified): Jan 15 1919, Boston North End; ~50-ft steel tank owned by United States Industrial Alcohol, ~2.3 million gallons; wave ~15 ft (sources say 15-25), ~35 mph (Bolt top speed ~27 mph); 21 dead, ~150 injured; a firehouse knocked off its foundation, elevated railway damaged; company blamed anarchist bombers; 1925 the court-appointed auditor ruled the company at fault, ~$628,000 damages. "Smelled for decades" = locals' accounts (framed "locals swore").
SOURCES: History.com · NBC News · AP · Boston.gov. Verify exact URLs.

Owner rules that still apply on top of the brief: years spoken naturally in the TTS ("two thousand seven", "nineteen nineteen"), captions show digits; closer "Subscribe for more." (< 1.5 s) right after the last line, then hard cut so the loop lands on frame 1; UPLOAD.md description = the brief's line + a Sources line + "Voice is synthetic." + 2-3 hashtags + #shorts; title <= 60 chars + 1 emoji; pinned either/or comment; cover frame time. Length = what the script needs (~33-40 s), no padding. Frame-1 hook text big and readable in 1 s.
