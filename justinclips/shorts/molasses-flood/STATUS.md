STATE: rendering

RE-VOICE in progress (MAIN, Nov 13): the owner picked the Chatterbox D2 narrator; re-voicing, re-timing and re-rendering. The video.mp4 below is the old Fenrir version until this says STATE: ready again.
molasses-flood: "A Molasses Tsunami Killed 21 People in Boston" (Justin clips, YouTube Shorts). Rendered fully in the cloud
(the owner's PC was off). Nothing posted or uploaded.

- `video.mp4`: 1080x1920, 24 fps, 1050 frames, 43.75 s (voice 43.72 s), H.264 + AAC 192k, 27.1 MB (no split needed).
  Measured -14.5 LUFS integrated, true peak -1.3 dBTP. `video.sha256` = 1f5599951bf5425c4de9ee06b6f7b0807b11fae22733cc3d9aaaa9190975bd92
- `preview_540x960.mp4` (half size, made from the final) + `contact_sheet.png` (20 frames, Shorts UI zones shaded red:
  top bar, bottom title area, right action rail). Checked: frame 1 = the wave + hook text in under 1 s; captions sit clear of the
  UI zones; reaction FX after every reveal; 3 insert cards (2.3 MILLION counter, 35 MPH speedometer, 21 DEAD / 150 INJURED);
  the last frame (closer) is the same shot as frame 1, so the loop lands.
- Tone guard: nobody is shown hurt or trapped; the wave hits only empty streets, buildings and the elevated railway; the
  frame-1 horse is calm (before the hit), no horse gag; the aftermath is dimmed, quiet, with sad music and no FX.
- Years/numbers: spoken naturally, captions in digits. Whisper hears "1919" as "nineteen nineteen" (no "one thousand ...").
- Length: 43.7 s at the locked voice pace (Kokoro am_fenrir 0.95) with the brief's own cut applied (the firehouse clause is
  dropped from the narration but still shown on screen). No padding.

Rebuild (from whatif/aitrends-2d-studio, Linux cloud: export CHROMIUM_PATH=/opt/pw-browsers/chromium):
  python3 projects/molasses-flood/make_voice.py   # run from the project folder; then tools/transcribe.py --project ... --model small --lang en
  python3 projects/molasses-flood/make_music.py   # run from the project folder
  node render.mjs --project projects/molasses-flood --out projects/molasses-flood/build/video_silent.mp4   (PC: add --gl gpu)
  python3 audio/mix.py --project projects/molasses-flood --video projects/molasses-flood/build/video_silent.mp4 --out projects/molasses-flood/build/video_mixtool.mp4
  ffmpeg -i projects/molasses-flood/build/video_silent.mp4 -i projects/molasses-flood/build/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -af apad -shortest -movflags +faststart video.mp4
  (mix.py's own mp4 drops ~4 frames, so the mix is muxed onto the full silent video with -c copy.)
