STATE: ready

# The Battle for Castle Itter — status

- `video.mp4`: 1080×1920, 24 fps, 990 frames, 41.25 s (batch-5 target 40-48 s), H.264 + AAC, 20.6 MB. sha256 in `video.sha256`.
  Rendered in full in the cloud (4 workers, SwiftShader, ~11 min).
- Audio: mix.py master **-14.2 LUFS** integrated, true peak **-1.3 dBTP** (ffmpeg ebur128 on the final file). Music toon3d:tense -19 dB, ducked.
- Voice: Chatterbox D2 (built-in voice, exaggeration 0.3, cfg 0.3) via whatif/voice/chatterbox_d2.py, Shorts pacing
  (`--gap 0.3 --comma 0.15 --lead 0.15`). Raw take 44.9 s, kept as input/voiceover_raw.wav. Line 4 was re-voiced as
  "Waffen S.S." (the script lowercases "SS", so the first take said "Waffens") and spliced in with projects/castle-itter/splice_line.py.
  Tightened by projects/castle-itter/tighten_vo.py **1.03** (pauses capped at 0.3 s, atempo with pitch kept, extra beats
  +0.15 s before "But here's…", +0.25 s before the Gangl line, +0.15 s before the payoff) → 41.22 s.
  TTS-QA "fails" on lines 2 and 4 are spelling only (Whisper wrote "5th", "Waffen-SS" vs "S.S."); the audio says the right words.
- **Whisper check (small.en) on the final video.mp4** reads the voiced script word for word:
  "Five days after Hitler died, Americans and Germans fought on the same side. May 5th, 1945. Itter Castle, Austria. Inside,
  famous French prisoners, including two former prime ministers. Outside, Waffen-SS troops coming to attack. Defending the
  castle, a small group of American tank soldiers, German army soldiers who had joined the resistance, and the French
  prisoners themselves picking up rifles. But here's the part that sounds made up. The German commander, Major Sepp Gangl,
  was killed by a sniper while trying to get a former French prime minister out of the line of fire. The castle held until
  help arrived. It's one of only two known times in the war that Americans and Germans fought side by side."

## Source fixes (lines changed before voicing; details + quotes in script.md "Source check")
- L6 "turned against the SS" → "joined the resistance" (Wikipedia: Gangl's men had "thrown in with the local resistance").
- L9 "pulling a former French prime minister to safety" → "trying to get a former French prime minister out of the line of fire"
  (Wikipedia "Josef Gangl", verbatim).
- L11 "Historians often call it the only battle of the war where…" → "It's one of only two known times in the war that…"
  The current Wikipedia article says "one of two known times… the other being Operation Cowboy", so "the only battle" was
  not supported; the tone guard's attribution line went with it. **Flag for MAIN** in case you want different wording.
- L2 "May 5th" → "May fifth" for the TTS only.

## Batch-5 rules
- Hook: line 1 = 13 words incl. "Five days after Hitler died" (the brief says ≤ 12; it is MAIN's exact line, kept). Frame 1 already
  moving (both rifles firing, muzzle flash on frame 0); top caption "on the SAME side" (2 lines, centre-top, SAME gold,
  side red) on screen 0–3.5 s.
- Escalations: "Inside:" 8.2 s → "Outside:" 12.4 s → "Defending the castle?" 15.5 s → "…the prisoners themselves" 21.7 s →
  "But here's the part that sounds made up…" 24.9 s → Gangl 27.2 s → "The castle held" 34.0 s → payoff 36.4 s.
- 15 shots + 3 in-shot punch-ins (s03 stamp swap, s04, s06): cuts every ~1.4–2.6 s. No dead air (max gap 0.39 s).
- Payoff = last 2.55 s ("…fought side by side"): back at the hook window; the two soldiers grin at each other, then snap
  back to aim as the camera settles on frame 1's exact framing → the last frame cuts straight into frame 1 (loop).
- Cover: t ≈ 0.4–0.9 s (see UPLOAD.md).

## Contact sheet (contact_sheet.png, 24 frames every 1.72 s from the final file) — checked
- First pass fixes: smoke puffs covered the window and the hook caption (removed); 9:16 framing cut off people in s02, s04, s06, s07,
  s08, s11 (cameras pulled back, people moved in); SS silhouettes were buried inside the hill (now walk on its surface); battlement
  merlons hid the faces (defenders raised); s04 tags clipped at the frame edges; a pine blocked the castle in s05; memorial text enlarged.
- Final: no dead frames, no clipping, captions readable everywhere (1–3 words at 70 % height, nothing over faces).
  The near-white frame at 27.5 s is the 1-frame "flash" transition into s09, by design.

## TONE GUARD — checked
- No Nazi symbols anywhere: the SS are dark, faceless, generic silhouettes; German army uniforms are plain field grey with no
  insignia; Hitler is only named, never shown.
- Nobody is shown hit. Gangl's death is said plainly: s11 shows him shielding the statesman as they move away from the window
  (cool tint), s12 is a quiet memorial card ("Major Josef Gangl, 1910–1945, killed while moving a French ex-prime minister
  out of the line of fire"). No jokes, no gore.

Nothing was posted, uploaded or logged in anywhere.

Re-render, from whatif/aitrends-2d-studio (Chatterbox venv python for the tools):
    ~/.venvs/chatterbox/bin/python ../voice/chatterbox_d2.py ../../justinclips/shorts/castle-itter/tts_script.md projects/castle-itter/input/voiceover_raw.wav projects/castle-itter/input/script.txt --gap 0.3 --comma 0.15 --lead 0.15
    ~/.venvs/chatterbox/bin/python projects/castle-itter/splice_line.py 4 <retake of "4. Outside: Waffen S.S. troops, coming to attack." .wav>
    ~/.venvs/chatterbox/bin/python projects/castle-itter/tighten_vo.py 1.03
    ~/.venvs/chatterbox/bin/python tools/transcribe.py --project projects/castle-itter --script projects/castle-itter/input/script.txt --lang en --model small
    CHROMIUM_PATH=/opt/pw-browsers/chromium node render.mjs --project projects/castle-itter --workers 4 --out projects/castle-itter/build/video_silent.mp4
    ~/.venvs/chatterbox/bin/python audio/mix.py --project projects/castle-itter --video projects/castle-itter/build/video_silent.mp4   # -> out/Castle_Itter.mp4

Deliverables: script.md, sources.md, tts_script.md, UPLOAD.md, STATUS.md, contact_sheet.png (from the final), video.mp4, video.sha256.
