STATE: ready
# tardigrade-space: "Tardigrade: The Animal That Survived Space Naked" (Justin clips, Toon 3D + BEANMEN effects)
- **Final:** `video.mp4` 1080x1920, 24 fps, 894 frames, 37.25 s, H.264 + AAC 192k, 17.3 MB. **-14.5 LUFS, true peak -1.4 dBFS.**
  `video.sha256`: `417dd49820583f6f66bc13505f34423ab5f256e3e1739656b6c0189da724ac1b  video.mp4`. No split needed (< 95 MB).
  Built as the full silent render + mix.wav muxed with `-c copy` video (no `-shortest` frame loss).
- Rendered in the cloud (owner's PC off): SwiftShader, 4 workers, 11m06s. Build frames not committed.
- Checked: `contact_sheet.png` (20 frames from the final render, red boxes = Shorts UI zones: frame 1, captions vs UI, FX, last frame)
  and `preview_540x960.mp4` (half-size copy of the final video, with audio).
  Frame 1 = the floating tardigrade + hook "THIS ANIMAL SURVIVED SPACE. NAKED." already moving; last frame returns to the frame-1 framing (loop).
- Voice: Kokoro am_fenrir 0.95. Whisper heard "In 2007," (spoken "two thousand seven"); captions show digits (2007, 1000x, 10, 8).
- Effects: sunny sky preset (landing + moss shots), space look elsewhere; reaction FX after every reveal (??? ! sweat hearts stars zzz sparkle spotlight
  shake flash); 2 INSERT cards (counter 1,000x, versus SUIT + OXYGEN vs NOTHING) + DAY 1>10 counter + stat chips; whipBlur/iris/flash transitions;
  music `toon3d:curious` + 44 kit sfx cues (many on spoken words).
- Fact notes: sources.md. Dramatized parts are named there; it notes that only a few survived the full radiation dose. CBC and New Scientist (listed
  in the brief) could not be verified/opened, so they are not linked; the claims rest on Current Biology 2008, ESA, National Geographic, Space.com, SciAm.
- Project: `whatif/aitrends-2d-studio/projects/tardigrade-space` (voiceover.wav force-added; mix uses only kit sfx/music wavs already in the repo).
  Re-render: `node render.mjs --project projects/tardigrade-space --out projects/tardigrade-space/build/video_silent.mp4` (from the studio folder;
  add `--gl gpu` on the PC), then `python audio/mix.py --project projects/tardigrade-space --out projects/tardigrade-space/build/mixed.mp4` and mux mix.wav onto the silent video with `-c:v copy`.
- Nothing was posted, uploaded or logged into.
