STATE: ready

Sticks After Dark #5 "Voicemail": 60-70 s revision (owner's request via Reel Studio MAIN), final video pushed.

- `video.mp4`: 1080x1920, 24 fps, 1480 frames, 61.67 s, H.264 + AAC 192k, 27 MB (single file, no split needed).
  Checksum in `video.sha256`.
- Loudness (measured on video.mp4): -14.1 LUFS integrated, true peak -1.4 dBFS.
- Whisper level: set in tools/voice_vm.py to -3.5 dB vs the narrator (active-frame RMS); measured in the final mix
  at -3.1 dB (was about -7 to -11 dB in the 23 s cut). faster-whisper transcribes it word-for-word:
  "Don't get out of bed. Don't look under it. It's under there."
- Length: speech is about 54 s at the normal speed (0.88). The extra time comes only from longer silent beats
  (2.6 s after "I pressed play", 3.0 s after the whisper, 2.5 s before "I checked the time", 3.2 s held frame before
  the twist, 2.6 s on the eyes) and a 3 s end-card hold (--tail 3.0). The speech speed is unchanged.
- Audio: mix.py output muxed onto the FULL silent render with `-c:v copy` (all 1480 frames kept, audio padded).
- `contact_sheet.png`: 32 frames from the final file (frame 1, every shot, last story frame 57.45 s, last frame 61.6 s);
  red boxes = platform UI zones (bottom 20 %, right 15 %). Captions sit at y≈1250, clear of both.
- 29 shots, 1.5-3.0 s each (end card 4.1 s). Ending kept: "3:11" lock screen (sting + 1-frame jitter at 54.4 s),
  the gap under the bed with two dot-eyes, hard cut to "Follow for more."
- Sound: roomtone bed, soft dark drone (stops at the hard cut), no buzz (the phone is on silent), two taps,
  synthetic phone breathing (tools/make_breath.py, 19.0-28.0 s), ONE stinger on the 3:11 reveal.
- Rebuild (from whatif/aitrends-2d-studio):
  `python3 ../../sticksafterdark/voicemail/tools/voice_vm.py --script ../../sticksafterdark/voicemail/script.md --project ../../sticksafterdark/voicemail/project --tail 3.0`
  `python3 ../../sticksafterdark/voicemail/tools/make_breath.py`
  `node render.mjs --project ../../sticksafterdark/voicemail/project --workers 4`, then `python3 audio/mix.py --project ...`
  and mux mix.wav onto build/video_silent.mp4 with `-c:v copy`.
