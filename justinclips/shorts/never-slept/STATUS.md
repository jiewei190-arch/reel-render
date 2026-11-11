STATE: ready

- `video.mp4`: 1080x1920, 24 fps, 956 frames, 39.83 s, H.264 + AAC 192k, 18M. Loudness -14.1 LUFS, true peak -1.7 dBFS.
  Built as: full silent cloud render (SwiftShader, 4 workers, 13m54s) + `audio/mix.py` mix muxed with `-c:v copy` (no frames trimmed).
  The first mux measured TP -0.6 dBFS after AAC, so the mix got one limiter pass before muxing:
  `ffmpeg -i build/mix.wav -af "aresample=192000,volume=0.6dB,alimiter=limit=0.80:attack=1:release=50:level=false,aresample=44100" build/mix_lim.wav`.
- `video.sha256`: checksum of video.mp4.
- `contact_sheet.png`: frames from the FINAL video every 2.5 s + first/last frame (checked: frame 1 already moving, captions at 70 % height
  clear of the Shorts UI, reaction FX, 3 insert cards, iris/whip/flash transitions, last frame = the frame-1 room on DAY 1 for the loop).
  `contact_sheet_preview.png` + `preview_540x960.mp4`: the half-size preview checked before the final render.
- Rebuild: `cd whatif/aitrends-2d-studio && CHROMIUM_PATH=/opt/pw-browsers/chromium node render.mjs --project projects/never-slept --out projects/never-slept/build/video_silent.mp4`,
  `python3 audio/mix.py --project projects/never-slept`, the limiter line above, then
  `ffmpeg -i projects/never-slept/build/video_silent.mp4 -i projects/never-slept/build/mix_lim.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k video.mp4`
  (on the owner's PC add `--gl gpu`).
- Nothing was posted, uploaded or logged into.
