# The 1908 New York to Paris Race: status

- `video.mp4`: 1080×1920, 24 fps, 1008 frames, 42.0 s, H.264 + AAC, 25 MB. sha256 in `video.sha256`. Rendered in full in the cloud (SwiftShader, ~11.5 min).
- Audio: mix.py master **-14.1 LUFS** integrated, **true peak -1.4 dBTP** (ffmpeg ebur128 on the final file). config.loudness is -13.5 because
  mix.py's single-pass loudnorm landed at -14.6 with -14; -13.5 lands on target. Music bed toon3d:upbeat at -19 dB (ducked under the voice).
- Voice: Chatterbox D2 (exaggeration 0.3, cfg 0.3, local, free) via whatif/voice/chatterbox_d2.py: all 10 lines passed TTS QA on seed 7
  (raw take 43.9 s, kept as input/voiceover_raw.wav), tightened by projects/ny-paris-1908/tighten_vo.py **1.0** (no speed-up; pauses capped
  at 0.3 s, gaps 0.14 s, +0.2 s beat before line 6 "But here's the part" and line 10, the payoff) = 41.5 s VO + 0.5 s tail.
- QA: Whisper small.en on the final video.mp4 reads the script word for word ("1908", "30-day", "169", "16,700", "26" read naturally); the
  only difference is "planes" for "plains" (a homophone; the audio is right).
- Contact sheet (`contact_sheet.png`, every 42nd frame of the final file) checked: no dead frames (the one black tile is the iris
  transition into s14, the blurred ones are whip transitions), no clipping, captions readable. Fixed after the first full render:
  the 169 / 16,700 / 26 stat cards were counters animating up from 0 (a paused frame read "102 DAYS" or "24 DAYS"); they are now
  pop-in cards that only show the true numbers.
- Batch rules: line 1 = 10 words; top caption "a car race / AROUND THE WORLD" (gold) + "IN 1908 CARS" stamp held 0–3.5 s; frame 1
  already moving (wheels spinning, mud flying, crew hauling); "But here's the part…" turn at line 6 (19.2 s); a stamp or cut every
  ~1.5–2.5 s; payoff in the last ~3 s ("still called the largest in motorsport history"); the last shot ends on frame 1's set and
  camera → loop. No "Subscribe" line.
- Wording changes vs the card: card line 1 shortened to "In 1908, six cars raced around the world to Paris." (≤12 words; the mud,
  snow and Siberia ideas moved to lines 3-5). Penalty reason given in full per the article ("not going through Japan" + rail
  shipment; the card only had the rail part). "Largest in any motorsport event" (article, unsourced) said as "still **called** the
  largest in motorsport history". The card's "covering about 16,700 km" kept as "about 16,700 kilometers". Details in sources.md.
- Brand / tone guard: generic toon cars only (plain brass radiator, text team plates USA/GER/ITA/FRA, race numbers); no logos, no
  flags; nobody hurt.
- Nothing was posted, uploaded or logged in anywhere.

Rebuild, from whatif/aitrends-2d-studio (Chatterbox venv: bash whatif/voice/setup_chatterbox.sh):
    ~/.venvs/chatterbox/bin/python ../voice/chatterbox_d2.py ../../justinclips/shorts/new-york-paris-race-1908/tts_script.md projects/ny-paris-1908/input/voiceover_raw.wav projects/ny-paris-1908/input/plain.txt --gap 0.25 --lead 0.1 --beat 0.45
    (cd projects/ny-paris-1908 && ~/.venvs/chatterbox/bin/python tighten_vo.py 1.0)
    ~/.venvs/chatterbox/bin/python tools/transcribe.py --project projects/ny-paris-1908 --script projects/ny-paris-1908/input/script.txt --lang en --model small
    CHROMIUM_PATH=/opt/pw-browsers/chromium node render.mjs --project projects/ny-paris-1908 --out projects/ny-paris-1908/build/video_silent.mp4
    ~/.venvs/chatterbox/bin/python audio/mix.py --project projects/ny-paris-1908 --video projects/ny-paris-1908/build/video_silent.mp4   # -> out/The_1908_New_York_to_Paris_Race.mp4

Deliverables: script.md, sources.md, tts_script.md, UPLOAD.md, contact_sheet.png (from the final), video.mp4, video.sha256.
