STATE: ready

# The Mantis Shrimp Punch: status

- `video.mp4`: 1080×1920, 24 fps, 1016 frames, 42.3 s (target 40–48), H.264 + AAC 192k, 26 MB. sha256 in `video.sha256`. Rendered in full in the cloud (SwiftShader, 4 workers, 12m25s).
- Audio: final file -14.1 LUFS integrated, true peak -1.7 dBTP (ffmpeg loudnorm measurement on video.mp4).
  mix.py (music `toon3d:tense` at -20 dB, ducked; 66 kit SFX cues) gave -14.27 LUFS / TP -1.49. A measured second pass (+0.27 dB, limiter at 0.8) gave the master; it was muxed with `-c:v copy`.
- Voice: Chatterbox D2 (exaggeration 0.3, cfg 0.3) via `whatif/voice/chatterbox_d2.py --gap 0.2 --lead 0.05 --beat 0.4`. Raw take 44.76 s; every line passed Whisper QA
  (line 2 seed 11, because seed 7 was heard as "manta"; line 10's first part seed 11; all others seed 7). Raw take kept as `input/voiceover_raw.wav`.
  `projects/mantis-shrimp-punch/tighten_vo.py` (from Woolpit): atempo 1.03 (pitch kept), pauses capped at 0.32 s, 0.2 s gaps, beats before lines 5, 8, 10 → 41.98 s of voice + 0.32 s hold.
  One fix to the copied script: the first line's slice start is clamped at 0 (the raw take starts at 0.05 s, so `start - 0.08` went negative and crashed).
- QA: Whisper small.en on the final video.mp4 reads the script word for word ("83 kilometers per hour" as digits, as expected).
- Contact sheet (`contact_sheet.png`): 28 frames from the final file, red boxes = Shorts UI zones (top bar, right action rail, bottom title/description area).
  Checked: frame 1 is already moving (mid-jab, speed lines) with the 2-line top caption; captions sit between the zones on every shot; the inserts read; the last frame (42.29 s) matches frame 1's camera and pose → loop.
  Fixed after the storyboard check: the empty shell was blocking the camera in s01/s02/s13 (cameras moved, shell removed from s13); antennae shortened; the finger in s20/s21 was a shapeless blob in front of the camera (side angle now);
  the crack decal was dropped from the oblique tank shots. Also checked after the render: the speed counter lands on "83 km/h"; the white frame at 40.0 s is the 0.1 s impact flash.
- Rules: hook line 11 words, WTF first; top caption 0–3.5 s, 2 lines, centre-top, PUNCH gold / BOIL red; "But" turns at 13.9 s and 28.1 s, with escalations in between (thousands × 6.2 s, 83 km/h 9.0 s, vapor 19.1 s, second hit 25.7 s, glass 35.9 s);
  22 shots plus 5 internal hard cuts → a cut every ~1.0–2.4 s; reaction FX after every reveal; 3 insert cards (1000s ×, 83 km/h, 2 HITS); payoff "never tap on its tank" 39.2–40.4 s;
  closer "Subscribe for more." 41.1–41.9 s (< 1.5 s); last frame = frame 1's framing.
- Tone: it only hits EMPTY shells (labelled on screen) and the tank glass; no fish, crab or snail shown; the finger is never touched; the bullet is a toy cartridge shape and no gun is shown.

## Changed vs the brief / fact fixes
- The draft line 2 "up to 18 centimeters long" had only one source (Wikipedia). It became "Small, but it hits with thousands of times its body weight" (Wikipedia + Nat Geo + Patek & Caldwell 2005).
- "Briefly boils" is explained on screen and in the VO as cavitation: "Like boiling, but from pressure, not heat." No temperature figure is claimed, because no loaded source gives one for the shrimp (Wikipedia's Cavitation article's "several thousand Kelvin" is general physics).
- The bullet comparison is worded "Scientists compare it to a bullet fired from a handgun", because Wikipedia compares the acceleration and Nat Geo compares the speed.
- Builder: the Woolpit manual pipeline was used (shots.json from `story/make_shots.py` + word timings) instead of `build_short.py`; the same measured two-pass loudness step as `build_short.py` was used.
- Nothing was posted, uploaded or logged in anywhere.

## Re-render, from whatif/aitrends-2d-studio (P=projects/mantis-shrimp-punch)
    ~/.venvs/chatterbox/bin/python ../voice/chatterbox_d2.py $P/input/tts_script.md $P/input/voiceover_raw.wav $P/input/script.txt --gap 0.2 --lead 0.05 --beat 0.4
    ~/.venvs/chatterbox/bin/python $P/tighten_vo.py                       # -> input/voiceover.wav (41.98 s)
    ~/.venvs/chatterbox/bin/python tools/transcribe.py --project $P --script $P/input/script.txt --lang en --model small
    (cd $P && python3 story/make_shots.py)                                # -> story/shots.json
    CHROMIUM_PATH=/opt/pw-browsers/chromium node render.mjs --project $P --out $P/build/video_silent.mp4 --workers 4
    ~/.venvs/chatterbox/bin/python audio/mix.py --project $P --video $P/build/video_silent.mp4
    # measure build/mix.wav, apply volume=(-14 - I) dB + alimiter=limit=0.8 -> build/master.wav, then mux with -c:v copy -c:a aac -b:a 192k

Deliverables: script.md, sources.md, UPLOAD.md, contact_sheet.png (from the final), video.mp4, video.sha256, tts_script.md.
