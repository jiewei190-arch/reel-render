STATE: rendering

Sticks After Dark #4 "hall-light", full render done in the cloud.
- video.mp4: 1080x1920, 24 fps, 662 frames, 27.58 s, H.264 + AAC 192k, 7.3 MB (single file, no split needed). Checksum: video.sha256.
- Audio: Kokoro am_fenrir via kits/sticks/tools/voice.py ([WHISPER] line = af_nicole whisper). Word times: Whisper small.en (58/58 words matched); sentence starts taken from the exact Kokoro chunk times.
  Mix: audio/mix.py (hum/roomtone/wind beds, light-switch tick on "clicked", footsteps, heartbeat, stinger on "Grandma's", dark drone at -24 dB),
  then +0.75 dB through a 4x-oversampled limiter, measured at -14.1 LUFS integrated, true peak -1.2 dBTP (final AAC file).
  mix.py's muxed output was 3 frames short (659 frames), so the mastered mix was muxed onto the full silent render with -c:v copy (662 frames).
- Look: kit rooms plus project-only sets in project/scenes/shots/hall.js (his door + crayon drawing + calendar, me in bed, his empty room). Accent: warm yellow #f2c45a.
  Held silent frame 17.7-20.2 s before the twist; 1-frame jitter + sting at 21.03 s; hard cut to the end card at 24.88 s.
- Captions: story/captions.json, 1-3 words at x470/y1250 (clear of the bottom 20% and right 15%), "Don't." / "off." alone, midnight shown as "12:00".
- Checks: contact_sheet.png (frame 1, beats, last frame), contact_sheet_zones.png (--debug safe zones).
- Rebuild: see the kit README; render `node render.mjs --project ../../sticksafterdark/hall-light/project --workers 4`.
