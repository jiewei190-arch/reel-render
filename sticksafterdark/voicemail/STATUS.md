STATE: ready

Sticks After Dark #5 "Voicemail" — final video pushed.

- `video.mp4`: 1080x1920, 24 fps, 551 frames, 22.96 s, H.264 + AAC 192k, 8.5 MB (single file, no split needed).
  Checksum in `video.sha256`.
- Loudness (measured on video.mp4): -14.6 LUFS integrated, true peak -1.5 dBFS.
- Audio: mix.py output (build/mix.wav) muxed onto the FULL silent render with `-c:v copy` (audio padded, no frames trimmed).
- `contact_sheet.png`: 16 frames from the final file (frame 1, every shot, last story frame 20.04 s, last frame);
  red boxes = platform UI zones (bottom 20 %, right 15 %). Captions sit at y≈1250, clear of both.
- Voice: kit voice (am_fenrir 0.88, -1 semitone). The [WHISPER] line uses the narrator's OWN voice, whisperised and
  phone-filtered by the project-local `tools/voice_vm.py` (a copy of the kit's voice.py; kit untouched).
  Whisper check (faster-whisper base): "Don't get out of bed, it's under there." — intelligible.
- Timings: syllable estimates inside exact Kokoro sentence chunks (kit default). tools/transcribe.py was tried but
  only aligned 29/41 words (it lost the whisper line), so the kit's chunk timings were kept.
- Captions: manual `story/captions.json` so numbers show as digits ("3:12 a.m.", "3:11") while the voice says words.
- Sound: roomtone bed, soft dark drone (ends at the hard cut), phone buzz on frame 1, a tap tick, synthetic phone-breathing
  (`tools/make_breath.py` -> project/sfx/breath.wav), ONE stinger on the 3:11 reveal (17.85 s) + 1-frame jitter at 17.92 s.
- Rebuild: see script.md / kit README; from whatif/aitrends-2d-studio:
  `python3 ../../sticksafterdark/voicemail/tools/voice_vm.py --script ../../sticksafterdark/voicemail/script.md --project ../../sticksafterdark/voicemail/project`
  then `node render.mjs --project ../../sticksafterdark/voicemail/project --workers 4`, `python3 audio/mix.py --project ...`.
