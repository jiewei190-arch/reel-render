STATE: ready

# The Greenland shark may live around 400 years — status

- `video.mp4`: 1080×1920, 24 fps, 979 frames, **40.79 s** (target 40–48), H.264 + AAC. sha256 in `video.sha256`. Rendered in full in the cloud (4 workers, 8m12s).
- Audio: master **-14.08 LUFS** integrated, true peak **-1.61 dBTP** (ffmpeg loudnorm measurement on the final file).
  `audio/mix.py` (music `toon3d:mystery` -20 dB, ducked; kit SFX cues per shot) landed at -14.31 LUFS / TP -1.50, then `projects/greenland-shark/master.py`
  (measured second pass, same as `justinclips/tools/build_short.py`: +0.31 dB, limiter at -1.7 dBFS) and a `-c:v copy` remux.
- Voice: Chatterbox D2 (exaggeration 0.3, cfg 0.3) via `whatif/voice/chatterbox_d2.py --gap 0.3 --comma 0.15 --lead 0.15 --beat 0.7`.
  Raw take 41.45 s; every line passed the built-in Whisper QA with seed 7. Tightened by `tighten_vo.py 1.0` (**no speed-up**: at 1.04 the
  Short would have been ~38.8 s, under 40) — pauses capped at 0.32 s, 0.2 s gaps, held beats before lines 2–6 and 8–11 → 40.58 s of voice.
  Numbers are spoken as words; captions and cards show digits (400, 2016, 392, 120, 150).
- QA: Whisper small.en on the **final video.mp4** reads the script word for word ("This shark may live around 400 years. ... A 2016 study
  carbon dated the lenses in sharks' eyes. The biggest one, five meters long, came out at about 392 years. Give or take 120 years ...
  So, the oldest one they found was likely born before the United States existed. Subscribe for more."); only punctuation/hyphens differ.
- Contact sheet (`contact_sheet.png`, from the final file, `justinclips/tools/contact_sheet_ui.py`): frame 1, one frame per shot, two frames
  with a Shorts UI mock-up and the last frame. Checked: frame 1 is already moving (the shark gliding, light shafts, specks) with the 2-line
  top caption; captions (y = 0.72) and the top caption clear the Shorts UI; the last frame is frame 1's camera and pose → loops.
  Fixed after looking at stills: shark eyes too small (0.075 → 0.105); scientist cut off in s07; lens close-up inside the scientist's face;
  shark too small on the podium (s11); speeds on the versus card unreadable (moved into big stamps).
- Rules: line 1 = 7 words, WTF first; top caption 0–3.5 s, centre-top, SHARK gold / 400 YEARS red; "But"/"And" turns at 7.0, 26.7, 31.2 s
  plus the "Give or take" twist at 19.7 s; 18 shots, cuts every ~1.2–2.8 s plus hard cuts inside s07 and s11 (s13's card lands mid-shot);
  reaction FX after reveals (sparkle, ???, glow, spotlight, sweat, zzz, flash); insert cards for the big numbers (392, 150 YEARS, speeds,
  timeline) + the eye card; payoff "born before the United States existed" at 36.7–38.7 s; closer "Subscribe for more." 1.5 s, then loop.
- Tone: nothing hurt or eaten; no realistic images, logos, flags or channel name on screen.

## Changes vs the brief / facts fixed (details in sources.md)
- "can live around 400 years" → "**may** live around 400 years" (an estimate: the biggest shark was 392 ± 120; "give or take 120" is said aloud).
- "grows ~1 cm a year" → "**less than** one centimeter a year" (Devine 2018: "<1 cm yr−1"; Wikipedia: 0.5–1 cm per year).
- "matures ~150 years old" → kept as "about 150" (Wikipedia + 2026 Aging Cell paper "~150"; the 2016 paper says at least 156 ± 22).
- "eye-lens radiocarbon dating study 2016" → kept. The sample size (28 females) is only in the paper, so it is not said.
- Added payoff: born before the United States existed. Arithmetic on the paper's 392 ± 120 (even the 272-year low end means born before 1776).
- Speed comparison uses Wikipedia's 0.34 m/s (≈1.2 km/h) vs typical walking 1.10–1.65 m/s (≈4–6 km/h). The walking speed has only Wikipedia as a source.
- Wikipedia gives the range as 272–510; the paper's 392 ± 120 gives 272–512. The video uses only 392 and ± 120, so the difference does not show.
- Nothing was posted, uploaded or logged in anywhere.

## Re-render (from whatif/aitrends-2d-studio, P=projects/greenland-shark)
    ~/.venvs/chatterbox/bin/python ../voice/chatterbox_d2.py $P/input/tts_script.md $P/input/voiceover_raw.wav $P/input/voice_plain.txt --gap 0.3 --comma 0.15 --lead 0.15 --beat 0.7
    ~/.venvs/chatterbox/bin/python $P/tighten_vo.py 1.0
    ~/.venvs/chatterbox/bin/python tools/transcribe.py --project $P --script $P/input/script.txt --lang en --model small
    python3 $P/make_shots.py
    CHROMIUM_PATH=/opt/pw-browsers/chromium node render.mjs --project $P --out $P/build/video_silent.mp4 --workers 4
    ~/.venvs/chatterbox/bin/python audio/mix.py --project $P --video $P/build/video_silent.mp4 --out $P/out/video_mixpy.mp4
    python3 $P/master.py

Deliverables: script.md, sources.md, UPLOAD.md, contact_sheet.png, video.mp4, video.sha256, STATUS.md.
