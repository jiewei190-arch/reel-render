Justin clips Shorts job from the owner (Reel Studio MAIN). The owner asked for more 3D Shorts ("Make more of the 3d videos"): batch 3 of YouTube Shorts in the Toon 3D style WITH the new BEANMEN effects ("Yeah I like it it's nice"). Channel: "Justin clips" (YouTube). Build ONE Short: "Nvidia CEO Jensen Huang Resigns Over Affair With Suspected Chinese Spy" (slug `nvidia-ceo-scandal`).

RENDERING: the owner's PC (session "Creator") is currently unreachable, so YOU do the full 1080x1920 render here in the cloud once your preview is checked (render.mjs resolves --out from the kit folder, so pass e.g. `--out projects/<slug>/build/video_silent.mp4`). If MAIN later says the PC is back, stop the cloud render and set `STATE: render-on-pc` with the render + mix commands instead.

Read first (git fetch):
- THE OWNER'S OWN BRIEF for this Short: `justinclips/briefs/nvidia-ceo-scandal_owner-brief.pdf` (+ the text below) on origin/claude/beautiful-hypatia-0w2o96. Follow it: script, shot list, captions, packaging, fact-check, sources.
- The formula + owner rules: `IAWAKEN_PLAYBOOK.md` on origin/claude/beautiful-hypatia-0w2o96 (top notes, "SHORTS-ONLY FOCUS", rule 8 length, "PC render handoff").
- Kit: start your branch from origin/iawaken/toon3d-fx. Toon 3D kit `whatif/aitrends-2d-studio/kits/toon3d/` + README section "BEANMEN effects" + `demo/fx_sheet.png` + `demo/` project (how the effects are used) + `FX_STATUS.md`. A finished Short project to copy: projects/emu-war (or the rome-sacked-short project). SETUP_NOTES.md: python3, npm install, PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers, never `playwright install`. Kokoro kokoro-v1.0.onnx + voices-v1.0.bin in /home/user/reel-render/tts/ (kokoro-onnx release model-files-v1.0; pip install kokoro-onnx soundfile faster-whisper; if faster-whisper errors on `av`, decode with wave + numpy).

Owner rules for these Shorts:
- LENGTH = whatever the story needs. No padding, no stretching, no filler (owner: "whatever the script is best for the topic"). Typically 30-55 s.
- USE THE NEW EFFECTS: sunny sky preset (or a fitting mood light for darker topics), reaction FX after every reveal (???, !, hearts, sweat, sparkle, stars, shake), 1-3 full-screen INSERT cards for the big numbers/facts (bigtext/counter/versus/timeline/map/chart), whip/iris/flash transitions on punchlines, music mood + sfx on words via the kit's audio. BEANMEN-style beat if it fits: "Wait, how...?" -> "You see," one-line explanation.
- Voice: Kokoro am_fenrir via whatif/voice/fenrir.py (0.95, short gaps), deadpan; a beat of silence before punchlines. YEARS/NUMBERS: spell them out in the TTS script the way people say them ("eighteen-oh-seven", "eight ninety-seven"), but CAPTIONS show digits ("1807", "897"). Check with whisper word timestamps that years are not read as "one thousand eight hundred...".
- Frame 1 = craziest image already moving; Line 1 <= 10 words; twist by 3-5 s; new visual every 1.5-3 s; payoff in the last 3-5 s; loop back to frame 1. 9:16 1080x1920 24 fps; captions 1-3 words lower-middle, clear of the Shorts UI.
- Every claim sourced in sources.md; legends said "according to..."; NO gore, no realistic photos, nobody shown hurt (respect tone guards). Closer < 1.5 s: "Subscribe for more." ("Subscribe to find out." only on a cliffhanger). Never "Full story on the channel"/"Follow for more". No channel name in the video.

Per Short, deliver on branch `justinclips/nvidia-ceo-scandal`:
- Project at `whatif/aitrends-2d-studio/projects/<slug>` (git add -f the voiceover.wav and every .wav the mix needs).
- Folder `justinclips/shorts/<slug>/`: script.md, sources.md, a half-size preview mp4 + contact sheet you checked (frame 1, captions vs UI zones, effects, last frame), UPLOAD.md (title = the claim <= 60 chars + 1 emoji, 1-line description + sources + "Voice is synthetic." + 2-3 hashtags + #shorts, pinned either/or comment, cover frame time), the FULL 1080x1920 `video.mp4` (mix.py to -14 LUFS, TP <= -1; if mix.py trims frames, mux the mix onto the full silent video with -c copy; byte-split parts < 95 MB + reassembly note only if needed) + `video.sha256`, and STATUS.md whose FIRST LINE is exactly `STATE: ready` once that final video is pushed (before that `STATE: scripting` / `STATE: building` / `STATE: rendering`).
- Push each Short as soon as it is ready.

Rules: NEVER post, upload or log in anywhere; never enter passwords/tokens. Don't touch other branches/folders.


=== THE OWNER'S BRIEF: "the Jensen Huang spy scandal" (breaking news, Nov 2026; PDF next to this file) ===

STEP 0, BEFORE ANY BUILD WORK: VERIFY. This is a fast-moving news story about real, named people. Check EVERY claim below against live reporting (AP, Reuters, NYT, Bloomberg, CNBC, TechCrunch, BBC; use WebSearch/WebFetch). Write sources.md with the exact URL + date for each claim. If any claim is not confirmed by at least one major outlet, or has changed (e.g. he did NOT resign, numbers differ, testimony date moved), STOP: write `STATE: blocked` + what differs as the first lines of justinclips/shorts/nvidia-ceo-scandal/STATUS.md, push, and wait for MAIN. Never add unverified detail.

MAIN'S SAFETY EDITS (these override the PDF):
- "Suspected"/"US officials suspect" stays on EVERY spy claim, in narration, captions, cards and title. She has not been charged. Do NOT say her name in narration or on screen ("a businesswoman US officials suspect of spying for China").
- The 2nd and 3rd affairs are press reports, not admissions: always "the New York Times reported" / "Reuters reported". Do NOT name the VP or anyone else ("a Nvidia executive", "an employee").
- No character depicts the woman/women: the radar shows an anonymous silhouette, no face, no ethnicity cues. No jokes about his wife or family; the 40-years-married frame is shown neutrally.
- Jensen as a toon character is OK (public figure, news commentary): leather jacket, keynote stage. Respectful, not humiliating; no sexual content at all.
- "lost everything" -> "lost his job" (he did not lose everything).
- Comedy only in the market-crash/"couldn't compute" irony, never in the espionage allegation or the affairs.

Frame 1 hook text: NVIDIA CEO'S GIRLFRIEND: SUSPECTED SPY  (if verification shows a better-documented framing, use "NVIDIA CEO'S AFFAIR: SUSPECTED SPY")

NARRATION (owner's script with MAIN's edits; ~27-33 s; D2 voice):
1. The CEO of Nvidia just lost his job - over a suspected Chinese spy.
2. Jensen Huang admitted an affair on November 8th. Her company bought 4.8 billion dollars of his chips - and is suspected of funneling them to China.
3. Then the New York Times reported a second affair. Then Reuters reported a third.
4. Four days later, he resigned. 570 billion dollars in market value, gone in a week.
5. Now Congress wants him to testify before Thanksgiving - and the president was reportedly briefed on the spy concern a year earlier.
6. The king of AI... brought down by the one thing he couldn't compute.
(If verification says "the board forced him out", you may say "the board pushed him out" ONLY if a major outlet reports that; otherwise "he resigned".)

SHOT LIST (owner's, with edits): 1 toon leather-jacket CEO on a keynote stage holding a GPU + hook text. 2 radar pinging on an anonymous silhouette, magnifying glass, stamp "SUSPECTED SPY". 3 a handshake between the toon CEO and a faceless corporate figure, pallet of chips, price tag "$4.8 BILLION". 4 conveyor of chips sliding toward a China map outline, customs officer shrugs, caption "suspected of funneling chips". 5 a company letter "I was unfaithful to my wife." next to a neutral "40 YEARS MARRIED" photo frame. 6 newspaper gag: "NYT REPORTS: AFFAIR #2", "REUTERS REPORTS: #3". 7 boardroom, a paper "RESIGNATION" slides across the table, leather jacket on an empty chair. 8 stock chart cliff dive, counter spinning to "-$570 BILLION". 9 Capitol building, a request letter "TESTIFY BEFORE THANKSGIVING" with a cartoon turkey. 10 a giant supercomputer melting into a puddle, text "the one thing he couldn't compute", loop to frame 1.

CAPTIONS: Nvidia CEO > lost his job > suspected spy > admitted it > November 8th > $4.8 billion > of his chips > suspected funneling > NYT reported > a second > Reuters: a third > 4 days later > resigned > $570 BILLION > gone in a week > Congress wants him > before Thanksgiving > reportedly briefed > a year earlier > king of AI > couldn't compute

PACKAGING: Title (<= 60 chars + emoji) built from "Nvidia CEO Jensen Huang Resigns Over Affair With Suspected Chinese Spy", e.g. "Nvidia's CEO Resigned Over a Suspected Spy" + emoji. Description line 1: Jensen Huang resigned as Nvidia CEO after admitting an affair with a woman US officials suspect of spying for China - and Nvidia lost over $570 billion in a week. + "Facts as reported by <outlets> as of <date>; allegations are unproven." + sources + "Voice is synthetic." + #nvidia #news #shorts. Pinned comment: neutral either/or about the business side (e.g. "Will Nvidia stock recover: yes or no?"), never about the women.

OWNER'S FACT LIST TO VERIFY (from the PDF): Nov 8 2026 Huang admitted infidelity in a letter to employees ("I was unfaithful to my wife"), married 40 years (AP, TechCrunch); a Megaspeed (Singapore) executive is suspected by US officials of spying for China's MSS; Megaspeed bought $4.8B of Nvidia chips over two years and is suspected of funneling chips to China; DOJ took over the investigation (TechCrunch, NYT); Nov 11 NYT reported a 2nd affair (not confirmed by the parties); Nov 12 Reuters reported a 3rd; Nov 12 Huang resigned, CFO Colette Kress interim CEO (AP); Nvidia lost over $570B in market value that week (Bloomberg Law, CNBC); Huang agreed to closed-door testimony before Thanksgiving, Senate Banking Committee request (TechCrunch); the president was reportedly briefed in late 2025 (NYT via TechCrunch).

Owner rules: NARRATOR = Chatterbox D2 (copy whatif/voice/chatterbox_d2.py + setup_chatterbox.sh + README from origin/voice-test; use it where fenrir.py was used). Numbers spelled for TTS, digits in captions. Closer "Subscribe for more." (< 1.5 s), hard cut to frame 1. Length = what the script needs, no padding. Frame-1 hook text big and readable in 1 s. Never post, upload or log in anywhere.
