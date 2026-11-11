STATE: ready

# Justin clips Short #22: dagen-h ("A Whole Country Switched Road Sides in a Minute 🚗")
- **Final video:** `video.mp4`: 1080x1920, 24 fps, **898 frames, 37.42 s**, H.264 + AAC, **-14.5 LUFS, true peak -1.3 dBFS**, 25.3 MB (no split needed).
  `video.sha256`: `5075c6eb491e7ec4dca1c27bbb4a269c5a16836f3ed6b6bd51f74ded20b35351  video.mp4`.
  Built as the full silent render + the mix.py audio (`ffmpeg -i build/video_silent.mp4 -i build/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac`), so no frames are trimmed.
- **Rendered in the cloud** (owner's PC unreachable): SwiftShader, 3 workers, ~24 min at 1080x1920.
- **Script / voice:** `script.md` (14 lines, Kokoro am_fenrir 0.95, 0.3 s gaps, 0.75 s beats before "The government switched anyway.", "You see...", "Instead, accidents went down."). Numbers spoken as words, captions show digits: Whisper heard "5 a.m.", "1967", "83 %", "4.50", "350,000" (no "one thousand nine hundred..."). Tool: `../make_voice.py` (TTS per sentence + Whisper word timestamps -> caption words).
- **Sources:** `sources.md` (Wikipedia + Mental Floss; Britannica 403'd, MoneyWeek stub: add a top-tier source before posting if wanted). Accident drop said as temporary ("For a few weeks, anyway.").
- **Upload package:** `UPLOAD.md`.
- **Preview / checks:** `preview/dagen_h_preview_540x960.mp4` (from the final) + `preview/contact_sheet.png` (20 frames from the final; red boxes = Shorts UI zones). Checked:
  frame 1 = every car mid-swerve at the 5:00 clock, already moving (Line 1 at 0.12 s, 9 words); twist "Every driver. Same minute." at 3.1 s; new visual every 1.5-3 s (18 shots);
  reaction FX after each reveal (!, sweat, ???, sparkle, hearts, shake on the stamp); 3 INSERT cards (83% counter, SUNDAY/SEPT 3 bigtext, 350,000 counter); whipBlur / iris / flash transitions;
  captions 1-3 words at 70 % height, clear of the right buttons and bottom title zone; payoff "Instead, accidents went down. For a few weeks, anyway." at 32-35 s; closer "Subscribe for more." 0.9 s; last frame = frame 1's composition (seamless loop).
  Audio: kit music `upbeat` ducked under the voice + 50 kit sfx cues (several on words).
- **Project:** `whatif/aitrends-2d-studio/projects/dagen-h` (voiceover.wav committed). Re-render from `whatif/aitrends-2d-studio`:
  `node render.mjs --project projects/dagen-h --out projects/dagen-h/build/video_silent.mp4` (898 frames, 37.4 s; on the PC add `--gl gpu`), then
  `python audio/mix.py --project projects/dagen-h --out projects/dagen-h/out/mixed.mp4` and mux `build/mix.wav` onto the silent video as above.
- Nothing was posted, uploaded or logged into.
