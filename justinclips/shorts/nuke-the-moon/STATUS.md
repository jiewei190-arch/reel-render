STATE: ready

# Nuke the Moon (Project A119) — status

- `video.mp4`: 1080×1920, 24 fps, 1020 frames, 42.50 s, H.264 + AAC, 12 MB. sha256 in `video.sha256`. Rendered in full in the cloud (4 workers, ~7 min).
- Audio: mix.py master -14.3 LUFS integrated, true peak -1.4 dBTP (ffmpeg ebur128 on the final file). Music `toon3d:tense` at -19 dB, 54 SFX cues.
- Voice: Chatterbox D2 (exaggeration 0.3, cfg 0.3) via whatif/voice/chatterbox_d2.py from `tts_script.md` (raw take 46.6 s, kept as
  input/voiceover_raw.wav), tightened by projects/nuke-the-moon/tighten_vo.py 1.0 (pauses capped at 0.3 s, no speed-up; +0.25 s beat
  before the "But..." line 7, +0.2 s before the payoff line 11) → 42.27 s. TTS-QA "fail" on line 2 is spelling only: Whisper wrote
  "A-119" for the spoken "A one-nineteen".
- QA: Whisper small.en on the final video.mp4 reads the script word for word ("A-119", "cancelled", "unnuked" are spelling only).
- Contact sheet (`contact_sheet.png`, one frame per 1.5 s of the final file) checked: no dead frames, no clipping, captions readable;
  fixed before the final render: general cut off in frame 1, stamps colliding with captions, porch staging, cropped board/crate/shredder,
  smoke hiding the rocket, a "?" clipped at the edge. Gold caption words fixed (list had punctuation).
- Batch 6 rules: line 1 = 11 words; top caption 2 lines centre-top (gold "PROJECT A119" / red "NUKE THE MOON") held 0–4.4 s;
  frame 1 already moving; "But here's the wild part..." at 22 s; payoff in the last 2.35 s; s16 = frame-1 set and framing, the
  general raises the pointer again → loop. 42.5 s (target 40–48). 16 shots + punch-ins in s03, s04, s09.
- TONE: the only blast is a 2D cartoon starburst on the Moon; no mushroom cloud anywhere; nothing over Earth; nobody hurt; no flags/logos.

## Wording changes vs the card
- Card line 1 ("In 1958 the U.S. Air Force had a real plan to detonate a nuclear bomb on the Moon, just to show off.") shortened to
  "In 1958, the U.S. Air Force planned to nuke the Moon." (≤ 12 words); "show off" said as "a show of force" (the article's words).
- Card caption "project A119" kept, as the top caption's first line; second line "NUKE THE MOON" added (brief: 2 lines).
- Card frame 1 "mushroom cloud on the Moon" drawn as a cartoon starburst flash on the Moon (tone: no mushroom cloud).
- "Visible with the naked eye" kept conditional: "would have been faintly visible".
- Payoff "the Moon remains unnuked" kept (spoken "un-nuked").

Re-render, from whatif/aitrends-2d-studio:
    ~/.venvs/chatterbox/bin/python ../voice/chatterbox_d2.py projects/nuke-the-moon/input/tts_script.md projects/nuke-the-moon/input/voiceover_raw.wav projects/nuke-the-moon/input/plain_tts.txt --gap 0.3 --comma 0.15 --lead 0.15
    (cd projects/nuke-the-moon && ~/.venvs/chatterbox/bin/python tighten_vo.py 1.0)
    python3 tools/transcribe.py --project projects/nuke-the-moon --script projects/nuke-the-moon/input/script.txt --lang en --model small
    CHROMIUM_PATH=/opt/pw-browsers/chromium node render.mjs --project projects/nuke-the-moon --workers 4 --out projects/nuke-the-moon/build/video_silent.mp4
    python3 audio/mix.py --project projects/nuke-the-moon --video projects/nuke-the-moon/build/video_silent.mp4   # -> out/Nuke_the_Moon.mp4

- Nothing was posted, uploaded or scheduled anywhere.
