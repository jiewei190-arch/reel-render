STATE: ready

# The Rain of Fish (Yoro, Honduras) — status

- `video.mp4`: 1080×1920, 24 fps, 1009 frames, 42.06 s, H.264 + AAC, 24 MB. sha256 in `video.sha256`. Rendered in full in the cloud
  (4 SwiftShader workers, 11m21s).
- Audio: mix.py master **-14.1 LUFS** integrated, true peak **-1.3 dBTP** (ffmpeg ebur128 on the final file). Music `toon3d:curious`, ducked.
- Voice: Chatterbox D2 (exaggeration 0.3, cfg 0.3) via whatif/voice/chatterbox_d2.py on `tts_script.md` (raw take 44.5 s, kept as
  input/voiceover_raw.wav), tightened by projects/rain-of-fish-honduras/tighten_vo.py 1.03 (pauses capped at 0.3 s, atempo pitch kept,
  beats +0.15 s before line 3, +0.3 s before line 7 "But…", +0.2 s before line 11; 0.5 s tail). Local and free; no paid voice API.
  TTS-QA "fail" on line 2 is the Spanish name only (Whisper hears "uvia de peses" / "Joro" for Lluvia de Peces / Yoro).
- QA: Whisper small.en on the final video.mp4 reads the script word for word, apart from the Spanish phrase ("uvia de peses") and
  "water spouts" written as two words. "1998" and "45" read naturally.
- Contact sheet (`contact_sheet.png`, one frame every 1.75 s) checked: no dead/black frames, nothing clipped, all captions and cards
  readable. Fixes made after the first sheets: cameras pulled back in s01/s04/s05/s06/s11 (heads and the "!" were cut off, the
  s01/s04 punch-ins were inside the legs/a fish), parade fish turned side-on, parade carriers' arms raised to the poles, the
  waterspout moved off the map title. White frames at ~9.5 s and ~41 s are the intended lightning flashes.
- Rules: hook line 11 words, frame 1 moving, 2-line top caption 0–3.9 s ("EVERY YEAR" gold); one emotion (WTF); 42.06 s (40–48);
  cuts/punch-ins/card pops every ~1.6–2.6 s; "But here's the strange part" turn at line 7; payoff last line, s12 lands on frame 1's
  framing → loop. No hashtags/tags in UPLOAD.md; "Voice is synthetic."
- Framing guard: all "residents say"/"locals"/"theory"/"legend"/"nobody has confirmed" (card framing kept). Fish only ever on the
  ground in present-day shots; falling fish appear only inside the labelled LEGEND storybook card. Residents in everyday clothes,
  varied looks, no caricature; the priest is a respectful kneeling figure.
- Nothing was posted, uploaded or logged in anywhere.

## Wording changes vs the card
- Card first line ("Residents of this town in Honduras say fish have been turning up on the ground after storms for over a hundred
  years.") shortened to line 1 "Residents of this Honduran town say it rains fish. Every year." (the card's "every year" caption idea);
  "over a hundred years" moved to line 5, still "Residents say".
- Card "town" kept; Wikipedia says the festival is held by "locals of the department of Yoro", so line 6 doesn't say "the town".
- Line 9 was first "river fish in underground water get washed up by the floods"; Chatterbox kept saying "and" for "in", so it was
  re-voiced as "fish from a nearby river live underground, and heavy rains wash them up" (closer to Wikipedia's wording anyway).

Re-build, from whatif/aitrends-2d-studio (P=projects/rain-of-fish-honduras):
    ~/.venvs/chatterbox/bin/python ../voice/chatterbox_d2.py ../../justinclips/shorts/rain-of-fish-honduras/tts_script.md $P/input/voiceover_raw.wav $P/input/plain_tts.txt --gap 0.25 --lead 0.1 --beat 0.45
    ~/.venvs/chatterbox/bin/python $P/tighten_vo.py 1.03                      # -> input/voiceover.wav (42.06 s)
    ~/.venvs/chatterbox/bin/python tools/transcribe.py --project $P --script $P/input/script.txt --lang en --model small.en
    python3 $P/gen_shots.py                                                   # -> story/shots.json + config duration
    CHROMIUM_PATH=/opt/pw-browsers/chromium node render.mjs --project $P --workers 4 --out $P/build/video_silent.mp4
    python3 audio/mix.py --project $P --video $P/build/video_silent.mp4       # -> out/The_Rain_of_Fish.mp4 (1009 frames)

Deliverables: script.md, sources.md, tts_script.md, UPLOAD.md, contact_sheet.png (from the final), video.mp4, video.sha256.
