STATE: ready

Sticks After Dark #4 "hall-light", 60-70 s revision (owner: Instagram reels need 60-70 s). Full render done in the cloud.
- video.mp4: 1080x1920, 24 fps, 1597 frames, 66.5 s, H.264 + AAC 192k, 17.6 MB (single file, no split needed). sha256 82ac42a867882e5065878df3108943290a93e40faa7f46c69efca903bb1b08d6 (video.sha256).
- Narration: the extended script from Reel Studio MAIN, verbatim (script.md). Kokoro am_fenrir via kits/sticks/tools/voice.py, [WHISPER] line = af_nicole whisper.
  Word times: Whisper small.en (147/147 words matched); sentence starts taken from the exact Kokoro chunk times.
- 34 shots, a new visual every 1.3-3.1 s: humming bulb close-up, dimmed flashback (dead bulb, brother screaming, Dad on a ladder), clock 11:59 -> 12:00,
  click + hall goes black, dead bulb / switch still UP / line under my door snaps off, hum rings flatten, dark house, waiting in bed, hand on the doorknob,
  the whisper (crack POV + shapes under his door), letting go, blanket over my head, window greying to morning, "Then I remembered", held silent frame,
  calendar "GRANDMA'S ->" reveal (1-frame jitter + sting at 59.97 s), empty bed, two warm dot-eyes in his doorway, hard cut to the end card at 64.0 s.
- Audio: audio/mix.py (hum/roomtone/wind beds, switch ticks, footsteps, heartbeat, stinger, dark drone -24 dB), then +0.45 dB through a 4x-oversampled limiter.
  Final file: -14.0 LUFS integrated, true peak -1.4 dBTP. Mix muxed onto the full silent render with -c:v copy (all 1597 frames kept).
- Captions: story/captions.json, 1-3 words at x470/y1250 (clear of the bottom 20% and right 15%); "Don't." and "click." alone; midnight shown as "12:00".
- Checks: contact_sheet.png (frame 1 ... last frame), contact_sheet_zones.png (--debug safe zones).
