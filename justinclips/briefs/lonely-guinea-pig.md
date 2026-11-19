Justin clips Shorts job from the owner (Reel Studio MAIN). The owner asked for more 3D Shorts ("Make more of the 3d videos"): batch 3 of YouTube Shorts in the Toon 3D style WITH the new BEANMEN effects ("Yeah I like it it's nice"). Channel: "Justin clips" (YouTube). Build ONE Short: "Switzerland Made Owning One Guinea Pig Illegal" (slug `lonely-guinea-pig`).

RENDERING: the owner's PC (session "Creator") is currently unreachable, so YOU do the full 1080x1920 render here in the cloud once your preview is checked (render.mjs resolves --out from the kit folder, so pass e.g. `--out projects/<slug>/build/video_silent.mp4`). If MAIN later says the PC is back, stop the cloud render and set `STATE: render-on-pc` with the render + mix commands instead.

Read first (git fetch):
- THE OWNER'S OWN BRIEF for this Short: `justinclips/briefs/lonely-guinea-pig_owner-brief.pdf` (+ the text below) on origin/claude/beautiful-hypatia-0w2o96. Follow it: script, shot list, captions, packaging, fact-check, sources.
- The formula + owner rules: `IAWAKEN_PLAYBOOK.md` on origin/claude/beautiful-hypatia-0w2o96 (top notes, "SHORTS-ONLY FOCUS", rule 8 length, "PC render handoff").
- Kit: start your branch from origin/iawaken/toon3d-fx. Toon 3D kit `whatif/aitrends-2d-studio/kits/toon3d/` + README section "BEANMEN effects" + `demo/fx_sheet.png` + `demo/` project (how the effects are used) + `FX_STATUS.md`. A finished Short project to copy: projects/emu-war (or the rome-sacked-short project). SETUP_NOTES.md: python3, npm install, PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers, never `playwright install`. Kokoro kokoro-v1.0.onnx + voices-v1.0.bin in /home/user/reel-render/tts/ (kokoro-onnx release model-files-v1.0; pip install kokoro-onnx soundfile faster-whisper; if faster-whisper errors on `av`, decode with wave + numpy).

Owner rules for these Shorts:
- LENGTH = whatever the story needs. No padding, no stretching, no filler (owner: "whatever the script is best for the topic"). Typically 30-55 s.
- USE THE NEW EFFECTS: sunny sky preset (or a fitting mood light for darker topics), reaction FX after every reveal (???, !, hearts, sweat, sparkle, stars, shake), 1-3 full-screen INSERT cards for the big numbers/facts (bigtext/counter/versus/timeline/map/chart), whip/iris/flash transitions on punchlines, music mood + sfx on words via the kit's audio. BEANMEN-style beat if it fits: "Wait, how...?" -> "You see," one-line explanation.
- Voice: Kokoro am_fenrir via whatif/voice/fenrir.py (0.95, short gaps), deadpan; a beat of silence before punchlines. YEARS/NUMBERS: spell them out in the TTS script the way people say them ("eighteen-oh-seven", "eight ninety-seven"), but CAPTIONS show digits ("1807", "897"). Check with whisper word timestamps that years are not read as "one thousand eight hundred...".
- Frame 1 = craziest image already moving; Line 1 <= 10 words; twist by 3-5 s; new visual every 1.5-3 s; payoff in the last 3-5 s; loop back to frame 1. 9:16 1080x1920 24 fps; captions 1-3 words lower-middle, clear of the Shorts UI.
- Every claim sourced in sources.md; legends said "according to..."; NO gore, no realistic photos, nobody shown hurt (respect tone guards). Closer < 1.5 s: "Subscribe for more." ("Subscribe to find out." only on a cliffhanger). Never "Full story on the channel"/"Follow for more". No channel name in the video.

Per Short, deliver on branch `justinclips/lonely-guinea-pig`:
- Project at `whatif/aitrends-2d-studio/projects/<slug>` (git add -f the voiceover.wav and every .wav the mix needs).
- Folder `justinclips/shorts/<slug>/`: script.md, sources.md, a half-size preview mp4 + contact sheet you checked (frame 1, captions vs UI zones, effects, last frame), UPLOAD.md (title = the claim <= 60 chars + 1 emoji, 1-line description + sources + "Voice is synthetic." + 2-3 hashtags + #shorts, pinned either/or comment, cover frame time), the FULL 1080x1920 `video.mp4` (mix.py to -14 LUFS, TP <= -1; if mix.py trims frames, mux the mix onto the full silent video with -c copy; byte-split parts < 95 MB + reassembly note only if needed) + `video.sha256`, and STATUS.md whose FIRST LINE is exactly `STATE: ready` once that final video is pushed (before that `STATE: scripting` / `STATE: building` / `STATE: rendering`).
- Push each Short as soon as it is ready.

Rules: NEVER post, upload or log in anywhere; never enter passwords/tokens. Don't touch other branches/folders.


=== THE OWNER'S BRIEF: Kit 3 "illegal lonely guinea pigs" (strange laws; PDF next to this file) ===
Frame 1 hook text: OWNING ONE GUINEA PIG IS ILLEGAL HERE

NARRATION (exact, ~35 s):
1. In Switzerland, owning ONE guinea pig is basically illegal.
2. Not because they're loud. Because guinea pigs get lonely...
3. ...and Switzerland decided loneliness is animal cruelty.
4. The law says social pets must live in pairs. Guinea pigs, parrots, even lovebirds.
5. If it needs a friend, you are legally required to provide one.
6. But what happens when one of your pair dies? Congrats - you're now a criminal with a grieving rodent.
7. Enter the most Swiss solution ever: rent-a-guinea-pig services. You lease a temporary companion for your widowed pet.
8. Somewhere in Zurich right now, a guinea pig is on a blind date... arranged by the government.
(If long, trim "Guinea pigs, parrots, even lovebirds" to "parrots, even lovebirds".)

SHOT LIST:
1 Sad cartoon guinea pig alone in a cage behind tiny jail bars, Swiss flag waving + hook text.
2 Swiss courtroom: judge slams a gavel at a nervous pet owner; the guinea pig sits in the witness box.
3 Cartoon law book slams open: "2008 ANIMAL PROTECTION ORDINANCE"; stamp "LONELINESS = CRUELTY".
4 Police lineup of social animals (guinea pig, parrot, lovebird, rat) holding signs "WE NEED FRIENDS".
5 Two happy guinea pigs splitting a piece of lettuce, hearts floating.
6 Tiny funeral: a guinea pig in a black veil beside a matchbox coffin (cute, not sad), thunder crack.
7 Door explodes open: "SWISS PET POLICE - WHERE'S THE SECOND ONE?"
8 Storefront "RENT-A-PIG"; a guinea pig in a tie with a briefcase and a name tag steps out.
9 Speed dating: two guinea pigs at a tiny table with a candle; one slides over a business card.
10 Wide: guinea pig couple watching a sunset over Zurich; text "arranged by the government."; loop to frame 1.

CAPTIONS: Switzerland > ONE guinea pig > ILLEGAL > not loud > they get LONELY > loneliness = cruelty > animal welfare law > social pets > need PAIRS > parrots too > lovebirds too > one dies? > you're a criminal > grieving rodent > rent-a-guinea-pig > REAL business > lease a friend > widowed pet > blind date > arranged by > the government

PACKAGING: Title "Switzerland Made Owning One Guinea Pig Illegal" + emoji. Description line 1: Swiss animal welfare law requires guinea pigs to live in pairs because they get lonely - and yes, rent-a-guinea-pig services really exist.

FACT-CHECK (verified): Switzerland's Animal Protection Ordinance (in force Sept 2008) requires social species (guinea pigs, mice, rats, gerbils, degus, chinchillas, parrots, lovebirds and more) to be kept in groups of at least two; the Federal Food Safety and Veterinary Office: "guinea pigs are very social animals and may not be kept on their own"; rent-a-guinea-pig services exist for owners whose pig loses its partner (swissinfo). Dramatized: "illegal" (buying one is legal; keeping it alone violates the ordinance; enforcement is per canton, hence "basically illegal"), pet police raid, blind dates, business cards, tiny coffin, and "arranged by the government" (the services are private; it's the punchline, keep it as the obvious joke).
SOURCES: swissinfo fact check · swissinfo (2008) · The Local Switzerland. Verify exact URLs.

Owner rules that still apply on top of the brief: years spoken naturally in the TTS ("two thousand seven", "nineteen nineteen"), captions show digits; closer "Subscribe for more." (< 1.5 s) right after the last line, then hard cut so the loop lands on frame 1; UPLOAD.md description = the brief's line + a Sources line + "Voice is synthetic." + 2-3 hashtags + #shorts; title <= 60 chars + 1 emoji; pinned either/or comment; cover frame time. Length = what the script needs (~33-40 s), no padding. Frame-1 hook text big and readable in 1 s.
