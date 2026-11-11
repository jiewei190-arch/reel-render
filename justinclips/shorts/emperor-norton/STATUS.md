STATE: ready

- `video.mp4`: 1080x1920, 24 fps, 968 frames, 40.33 s, H.264 + AAC 192k, 27 MB. Loudness -14.4 LUFS, true peak -1.4 dBFS.
  Built as: full silent cloud render (SwiftShader, 4 workers, 18m20s) + `audio/mix.py` mix muxed with `-c:v copy` (no frames trimmed).
- `video.sha256`: checksum of video.mp4.
- `contact_sheet.png`: frames from the FINAL video every 2.5 s + first/last frame (checked: frame 1 already moving, captions at 70 % height
  clear of the Shorts UI, reaction FX, 2 insert cards, iris/whip/flash transitions, last frame = frame-1 image for the loop).
  `contact_sheet_preview.png` + `preview_540x960.mp4`: the half-size preview checked before the final render (its last frame was faded; fadeOut set to 0 for the final).
- Rebuild: `cd whatif/aitrends-2d-studio && CHROMIUM_PATH=/opt/pw-browsers/chromium node render.mjs --project projects/emperor-norton --out projects/emperor-norton/build/video_silent.mp4`
  then `python3 audio/mix.py --project projects/emperor-norton` and
  `ffmpeg -i projects/emperor-norton/build/video_silent.mp4 -i projects/emperor-norton/build/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k video.mp4`
  (on the owner's PC add `--gl gpu`).
- Nothing was posted, uploaded or logged into.
