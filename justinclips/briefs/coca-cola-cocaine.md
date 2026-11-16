Justin clips Shorts job from the owner (Reel Studio MAIN). The owner asked for more 3D Shorts ("Make more of the 3d videos"): batch 3 of YouTube Shorts in the Toon 3D style WITH the new BEANMEN effects ("Yeah I like it it's nice"). Channel: "Justin clips" (YouTube). Build ONE Short: "Did Coca-Cola Have Cocaine? Yes - Here's the Full Story" (slug `coca-cola-cocaine`).

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

Per Short, deliver on branch `justinclips/coca-cola-cocaine`:
- Project at `whatif/aitrends-2d-studio/projects/<slug>` (git add -f the voiceover.wav and every .wav the mix needs).
- Folder `justinclips/shorts/<slug>/`: script.md, sources.md, a half-size preview mp4 + contact sheet you checked (frame 1, captions vs UI zones, effects, last frame), UPLOAD.md (title = the claim <= 60 chars + 1 emoji, 1-line description + sources + "Voice is synthetic." + 2-3 hashtags + #shorts, pinned either/or comment, cover frame time), the FULL 1080x1920 `video.mp4` (mix.py to -14 LUFS, TP <= -1; if mix.py trims frames, mux the mix onto the full silent video with -c copy; byte-split parts < 95 MB + reassembly note only if needed) + `video.sha256`, and STATUS.md whose FIRST LINE is exactly `STATE: ready` once that final video is pushed (before that `STATE: scripting` / `STATE: building` / `STATE: rendering`).
- Push each Short as soon as it is ready.

Rules: NEVER post, upload or log in anywhere; never enter passwords/tokens. Don't touch other branches/folders.


=== OWNER'S KIT: "Coca-Cola really had cocaine" (PDF pages 33-38) ===
Title: Did Coca-Cola Have Cocaine? Yes - Here's the Full Story  (vidIQ title score 88/100: keep it exactly)
Frame 1 hook: COCA-COLA REALLY HAD COCAINE IN IT
MAIN rules: educational tone, no drug glamorizing (the soda-fountain customer gets cartoon sparkles of "energy", nothing more). Do NOT reproduce Coca-Cola's script logo or real ad artwork: draw a generic toon cola bottle/glass, "COCA-COLA" may appear in plain block letters on signs as a factual reference. Pope Leo XIII cameo is fine (historical).
NARRATION:
1. Coca-Cola really had cocaine in it. That's not a rumor.
2. In 1886, a morphine-addicted pharmacist named John Pemberton invented it - with coca leaves, the plant cocaine comes from.
3. It was sold as medicine. A "temperance drink" that supposedly fixed everything.
4. Then America panicked about cocaine, and by 1903, the cocaine was out.
5. But here's the part nobody knows: Coca-Cola STILL uses coca leaves today.
6. One company in New Jersey legally imports coca leaves, strips the cocaine out, and Coke uses what's left for flavor.
7. Coca-Cola: still made with coca. Just... the legal part.
SHOTS: 1 vintage glass with a green coca leaf floating in it + hook. 2 1886 Atlanta pharmacy, Pemberton stirring a pot, a medicine bottle in his pocket. 3 old-timey poster "THE TEMPERANCE DRINK" with a comically long list of "cures". 4 soda fountain, customer with cartoon sparkle eyes, clerk: "it's medicine!". 5 newspapers "COCAINE PANIC", 1903 calendar stamps "COCAINE REMOVED". 6 Pope Leo XIII cameo with a flask of coca wine and a medal ("even the Pope loved coca wine"). 7 modern bottle under a magnifying glass, "STILL CONTAINS COCA LEAVES". 8 guarded New Jersey facility, crates "MERCHANDISE NO. 5". 9 extraction machine: leaves in, flavor syrup one pipe, a box stamped "REMOVED" the other. 10 a can winking, "the legal part."; loop.
CAPTIONS: Coca-Cola > really had > COCAINE > 1886 > Pemberton > morphine addict > coca leaves > sold as medicine > temperance drink > fixed everything > 1903 > cocaine removed > BUT > still uses > coca leaves > TODAY > one facility > New Jersey > strips cocaine out > keeps the flavor > the legal part
DESCRIPTION line: Coca-Cola's original 1886 formula contained cocaine from coca leaves. It was removed by 1903 - but Coke still uses coca leaves for flavor today.
FACTS: Pemberton, Atlanta pharmacist and Civil War veteran addicted to morphine, created Coca-Cola in 1886 after his French Wine Coca hit local prohibition; marketed as a temperance drink; cocaine removed by 1903 under Asa Candler amid a narcotics panic; trace coca elements until extraction was perfected in 1929; Coke still uses decocainized coca leaf extract, processed by the Stepan Company in New Jersey ("Merchandise No. 5"); Pope Leo XIII reportedly carried Vin Mariani and gave its maker a medal. Sources: The Atlantic, Snopes, JSTOR Daily.

Owner rules: NARRATOR = Chatterbox D2 (copy whatif/voice/chatterbox_d2.py + setup_chatterbox.sh + README from origin/voice-test; use it where fenrir.py was used; it spells numbers for TTS, captions keep digits). Closer "Subscribe for more." (< 1.5 s), hard cut to frame 1 (loop). Length = what the script needs (~30-38 s), no padding. Frame-1 hook text big and readable in 1 s. UPLOAD.md: title as given (<= 60 chars) + description line + Sources + "Voice is synthetic." + 2-3 hashtags + #shorts; pinned either/or comment; cover frame. Verify every claim against the listed sources (WebSearch/WebFetch) and write sources.md with URLs; if something doesn't hold, fix the line to what the source says and note it in STATUS.md. Never post, upload or log in anywhere.
