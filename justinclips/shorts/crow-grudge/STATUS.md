STATE: ready

# The Crow Grudge — status

Re-voiced with the owner's new narrator, Chatterbox "D2", and fully re-rendered in the cloud.

- `video.mp4`: 1080×1920, 24 fps, 983 frames, 40.96 s, H.264 + AAC, 21 MB (no split needed). sha256 in `video.sha256`.
- Voice: Chatterbox D2 (built-in voice, exaggeration 0.3, cfg 0.3) via whatif/voice/chatterbox_d2.py; per-line times in
  projects/crow-grudge/input/voiceover.lines.json. +0.45 s held beat before "The crows were completely fine with Dick Cheney."
  "Subscribe for more." runs ~1.0 s, then a hard cut back to frame 1.
- Audio: mix.py master −14.6 LUFS, true peak −1.3 dBTP. mix.py trimmed 4 frames, so the mix was muxed onto the full silent
  render with -c copy (983 frames kept).
- QA: Whisper transcript of the final matches the script; "2006", "17 years" and "2023" are read naturally (never
  "one thousand…"). The only TTS-QA flag is a homophone on line 3 ("on sight" written "on-site"); the audio is correct.
- Captions: re-timed to the new voice, digits for years, ALL CAPS only on "17 YEARS" and the loop line. All 13 shot cuts
  moved to the new word timings; effects, transitions and packaging unchanged (cover frame times updated in UPLOAD.md).

Re-render, from whatif/aitrends-2d-studio:
    node render.mjs --project projects/crow-grudge --out projects/crow-grudge/build/video_silent.mp4
    python3 audio/mix.py --project projects/crow-grudge --video projects/crow-grudge/build/video_silent.mp4

Deliverables: script.md, sources.md, UPLOAD.md, preview_540x960.mp4 + contact_sheet.png (from the final), video.mp4, video.sha256.
