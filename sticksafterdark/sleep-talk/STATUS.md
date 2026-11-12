STATE: ready

Sticks After Dark #8 "Sleep Talk": 60-70 s Instagram cut, final video pushed (full render done in the cloud).

- `video.mp4`: 1080x1920, 24 fps, 1495 frames, 62.29 s (end card included), H.264 + AAC 192k, 22 MB (single file,
  no split needed). Checksum in `video.sha256`.
- Loudness (measured on video.mp4): -14.4 LUFS integrated, true peak -1.4 dBFS.
- Voice: tools/voice_st.py (a project-local copy of the kit voice tool; the kit is untouched). Narrator am_fenrir at 0.88.
  [WHISPER] = the narrator's own voice whispered (soft, calm, light "recording" colour).
  [OTHER] = a different voice (am_onyx, slower, ~5 semitones down, half-whispered). Whispers sit at -3.5 dB vs the narrator.
  faster-whisper (small) on the voice track: "Yes, the second door on the left." / "She's a heavy sleeper." / "Thank you."
- Length: speech at normal speed is 57.0 s. To reach 60-70 s only held beats were added: 2.2 s after "Long ones.",
  1.8 s after "Yes.", 1.5 s after "The second door on the left.", 2.2 s after "She's a heavy sleeper.", 1.3 s after
  "I went back to the recording.", plus a 3 s end-card tail. Every narration line is the brief's text, unchanged.
- Twist: held silent frame 52.9-55.1 (the 2.4 s pause after "It isn't mine."). On "Thank you." (55.1) the same frame
  shows a tall dark head bent down close at the edge of the violet glow, with two dot-eyes. 1-frame jitter + the one
  stinger at 56.5 (just after the voice, so it doesn't cover it). Hard cut to "Follow for more." at 57.9, held to 62.3.
- Captions: story/captions.json, 1-3 words. Digits on screen ("41 minutes", "41:07 recorded"); the voice says the words.
  Caption y≈1250, clear of the bottom 20 % and right 15 %. The phone UI sits above the caption line.
- Sound: roomtone bed, a soft dark drone (stops at the hard cut), 3 footsteps (39.2 s), one tick (44.3 s), ONE stinger.
- `contact_sheet.png`: 33 frames from the final file (frame 1, every shot, the jitter frame 56.5, last story frame
  57.85, last frame 62.25). Red = platform UI zones.
- Safety: the sister is only shown asleep and safe; nobody is touched or harmed. The thing is never fully shown.
- Rebuild (from whatif/aitrends-2d-studio):
  `python3 ../../sticksafterdark/sleep-talk/tools/voice_st.py --script ../../sticksafterdark/sleep-talk/script.md --project ../../sticksafterdark/sleep-talk/project --tail 3.0`
  (overwrites words.json; story/captions.json is hand-grouped from it)
  `node render.mjs --project ../../sticksafterdark/sleep-talk/project --workers 4`, then `python3 audio/mix.py --project ...`,
  then mux build/mix.wav onto build/video_silent.mp4 with `-c:v copy -af apad -t 62.2917` (all 1495 frames kept).
