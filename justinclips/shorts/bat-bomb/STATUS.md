STATE: ready

# The Bat Bomb — status

- `video.mp4`: 1080×1920, 24 fps, 594 frames, 24.75 s, H.264 + AAC, 10 MB. sha256 in `video.sha256`. Rendered in full in the cloud.
- Audio: mix.py master -14.3 LUFS integrated, true peak -1.4 dBTP (ffmpeg ebur128 on the final file).
- Voice: Chatterbox D2 (exaggeration 0.3, cfg 0.3) via whatif/voice/chatterbox_d2.py (raw take 30.7 s, kept as
  input/voiceover_raw.wav), tightened by projects/bat-bomb/tighten_vo.py 1.17 (pauses capped, atempo with pitch kept,
  +0.3 s beat before "and set their own air base on fire"). TTS-QA "fails" on lines 1, 2, 8 are spelling only
  (Whisper wrote "US", "II", "cancelled"); the audio says the right words.
- QA: Whisper small.en on the final file reads the script word for word ("1943", "1944", "two million" read naturally).
- Jail rules: triple hook at frame 1 (bat with bomb already landing + LINE 1 + top caption "it burned down their own base"
  held 0–3.6 s); one emotion (WTF); 24.75 s (target ~22 ±3); cuts every ~1.6–2.5 s (punch-ins inside s05/s06/s09);
  payoff = last 1.85 s; "Subscribe for more." dropped; the payoff bat hops off the crate in frame 1's framing → loop.
- TONE GUARD: no mushroom cloud / atomic imagery or jokes; cancellation said plainly; "a million" said as the plan;
  fire only on empty buildings, nobody hurt.
- Nothing was posted, uploaded or logged in anywhere.

Re-render, from whatif/aitrends-2d-studio:
    CHROMIUM_PATH=/opt/pw-browsers/chromium node render.mjs --project projects/bat-bomb --out projects/bat-bomb/build/video_silent.mp4
    python3 audio/mix.py --project projects/bat-bomb --video projects/bat-bomb/build/video_silent.mp4   # -> out/The_Bat_Bomb.mp4 (594 frames)

Deliverables: script.md, sources.md, UPLOAD.md, contact_sheet.png (from the final), video.mp4, video.sha256.
