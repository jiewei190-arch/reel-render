STATE: ready

Sticks After Dark #9 "baby-monitor", Instagram 60-70 s cut, full render done in the cloud.

- `video.mp4`: 1080x1920, 24 fps, 1557 frames, 64.875 s (end card included), H.264 + AAC 192k, 22.3 MB (single file, no split needed).
  Checksum in `video.sha256` (de1c448617ca609666ccb32cdbcd65118cd61627fefe26a1386a07b7067ef6ce).
- Loudness (measured on video.mp4): -14.3 LUFS integrated, true peak -1.4 dBFS.
- Narration: the brief's lines, verbatim (script.md). Kokoro am_fenrir via kits/sticks/tools/voice.py (speed 0.88).
  [CHILD] line = the kit's CHILD voice (af_nicole, pitched up); tools/child_level.py brings it to ~1.5 dB under the narrator
  (the kit renders it ~5 dB hot). Word times: the kit's syllable estimates inside exact Kokoro sentence chunks (faster-whisper not installed: its `av` wheel stalled on download).
- Length: the first voice pass was 57.3 s. Only held beats were added (no words changed): 1.8 s after "A lullaby." (the hum alone),
  2.0 s on the black corner after "She pointed...", 1.6 s after the child's line, 2.6 / 2.4 s quiet beats, the exact 2.4 s held frame before the twist,
  2.4 s on the final frame, and a 3.0 s end-card tail.
- 31 shots, 1.4-3.0 s each (end card 4.2 s). Frame 1: the green monitor on the nightstand, LEDs bouncing, glow on two sleepers (clock 3:00).
  3:00 clock, crackle + static, sound rings, LED bar, shaking my wife awake, the hall run, the door, the nursery (crib, mobile, my daughter sitting up, wide dot-eyes),
  the locked window latch, "Who was singing to you?", she points, the ceiling corner held pure black, her calm face, the corner again with only a faint hint of something long folded in it,
  carrying her down the hall, three of us in bed (child safe between us), me awake, the dark hall, the monitor flat, the empty nursery, the 2.4 s held frame,
  lights bounce again + faint hum, final frame: the empty crib, a long stick arm reaching down out of the black ceiling corner rocking the mobile (never a face).
  1-frame jitter at 58.9 s + one stinger at 58.5 s, hard cut to "Follow for more." at 60.7 s.
- Captions: story/captions.json, 1-3 words at x470/y1250, clear of the bottom 20 % and right 15 %; numbers as digits ("2", "3:00"); punch words alone ("lady.", "locked.", "empty.", "again.").
  Note: in the wide bed shots the monitor's antenna edge touches the right 15 % zone; its LEDs/clock stay left of it.
- Sound: roomtone bed, soft dark drone (-24 dB, stops at the hard cut), procedural monitor crackle, an original hummed lullaby through a small-speaker band
  (tools/make_hum.py -> project/sfx/hum_monitor.wav, hum_again.wav), tick, footsteps, a soft heartbeat, ONE stinger on the final frame.
  audio/mix.py -> build/mix.wav, muxed onto the FULL silent render with `-c:v copy` (all 1557 frames kept, audio padded).
- `contact_sheet.png`: 35 frames from the final file (frame 1, the middle of every shot, the jitter 58.9 s, last story frame 60.65 s, last frame 64.83 s); red = platform UI zones.
- Rebuild (from whatif/aitrends-2d-studio):
  `python3 kits/sticks/tools/voice.py --script ../../sticksafterdark/baby-monitor/script.md --project ../../sticksafterdark/baby-monitor/project --tail 3.0`
  `python3 ../../sticksafterdark/baby-monitor/tools/child_level.py && python3 ../../sticksafterdark/baby-monitor/tools/make_hum.py`
  `node render.mjs --project ../../sticksafterdark/baby-monitor/project --workers 4`, `python3 audio/mix.py --project ../../sticksafterdark/baby-monitor/project`,
  then `ffmpeg -i project/build/video_silent.mp4 -i project/build/mix.wav -map 0:v -map 1:a -c:v copy -af apad -c:a aac -b:a 192k -t 64.875 video.mp4`.
