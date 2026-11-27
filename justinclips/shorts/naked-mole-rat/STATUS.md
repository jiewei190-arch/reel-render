STATE: ready

# The naked mole-rat barely ages — status

- `video.mp4`: 1080×1920, 24 fps, 1028 frames, **42.83 s** (target 40–48), H.264 + AAC. sha256 in `video.sha256`. Rendered in full in the cloud (4 workers, 13m25s).
- Audio: master **-14.13 LUFS** integrated, true peak **-1.27 dBTP** (ffmpeg loudnorm measurement on the final file).
  `audio/mix.py` (music `toon3d:curious` -20 dB, ducked; 74 kit SFX cues) landed at -14.54 LUFS / TP -1.49, then `projects/naked-mole-rat/master.py`
  (the same measured second pass as `justinclips/tools/build_short.py`: +0.54 dB, limiter at -1.7 dBFS) and a `-c:v copy` remux.
- Voice: Chatterbox D2 (exaggeration 0.3, cfg 0.3) via `whatif/voice/chatterbox_d2.py --gap 0.3 --comma 0.15 --lead 0.15 --beat 0.7`.
  Raw take 46.67 s, every line passed the built-in Whisper QA (line 10's "in us." needed seed 11). Tightened by `tighten_vo.py 1.04`
  (atempo 1.04, pitch kept; pauses capped at 0.32 s; 0.2 s gaps; held beats before lines 4, 6, 8, 10, 11) → 42.58 s of voice.
  Numbers are spoken as words ("thirty", "eighteen"); captions and cards show digits.
- QA: Whisper small.en on the **final video.mp4** reads the script word for word ("This rodent barely ages, and almost never gets cancer. ...
  It survives 18 minutes with zero oxygen. ... Scientists now study it for clues to aging in us. Subscribe for more."); only punctuation and
  "mole rat" (no hyphen) differ.
- Contact sheet (`contact_sheet.png`, from the final file, made with `justinclips/tools/contact_sheet_ui.py`): frame 1, one frame per shot,
  two frames with a Shorts UI mock-up (top bar, right action column, bottom title area) and the last frame. Checked: frame 1 is already moving
  (confetti, bopping, flickering candles) with the 2-line top caption; burned captions (y = 0.72) and the top caption clear the Shorts UI;
  insert cards readable; the last frame is frame 1's exact camera on the same set → loops.
  Fixed after looking at stills: top caption line 2 overflowed (84 → 72 px), teeth were hidden, then too long; s02/s04/s07/s14/s18 were too tight;
  the scientist was out of frame in s09/s19/s20; the FRUCTOSE label was clipped by the lever.
- Rules: line 1 = 9 words, WTF first; top caption 0–3.5 s, centre-top, AGES gold / CANCER red; "But"/"And" turns at 13.4, 17.2, 21.2, 28.7 s;
  21 shots, cuts every ~1–2.8 s plus hard cuts inside s03, s11 and s14 (3 beats); reaction FX after each reveal (sparkle, exclaim, sweat,
  spotlight, hearts, zzz, flash); insert cards for the big numbers (30+ YEARS, risk chart, 0 cancer cases, 18 MINUTES); payoff "in us" at
  40.2–41.3 s; closer "Subscribe for more." 1.5 s, then loop.
- Tone: nobody hurt; the zero-oxygen beat is a calm nap. No realistic images, logos or channel name on screen.

## Changes vs the brief / facts fixed (details in sources.md)
- "lives ~30+ years" → "Over 30" (Tian 2013, Ruby 2018, Smithsonian). Wikipedia's 37-year figure is not used.
- "almost never gets cancer" kept as "almost never": Wikipedia notes two cases found in zoo animals in 2016, so the video never says "never";
  the 0-cases card is tied to "years of watching" (Tian 2013's multi-year colony observations).
- "can survive minutes without oxygen" → the exact figure from Park et al. 2017 + Wikipedia: 18 minutes.
- The press line "lives like plants" was not used; the script says only that it burns fructose (Park 2017).
- Mouse comparison added: "four years, tops" = Tian 2013's maximum lifespan for a similarly sized house mouse.
- Nothing was posted, uploaded or logged in anywhere.

## Re-render (from whatif/aitrends-2d-studio, P=projects/naked-mole-rat)
    ~/.venvs/chatterbox/bin/python ../voice/chatterbox_d2.py $P/input/tts_script.md $P/input/voiceover_raw.wav $P/input/voice_plain.txt --gap 0.3 --comma 0.15 --lead 0.15 --beat 0.7
    ~/.venvs/chatterbox/bin/python $P/tighten_vo.py 1.04
    ~/.venvs/chatterbox/bin/python tools/transcribe.py --project $P --script $P/input/script.txt --lang en --model small
    python3 $P/make_shots.py                       # shots.json from word anchors
    CHROMIUM_PATH=/opt/pw-browsers/chromium node render.mjs --project $P --out $P/build/video_silent.mp4 --workers 4
    ~/.venvs/chatterbox/bin/python audio/mix.py --project $P --video $P/build/video_silent.mp4 --out $P/out/video_mixpy.mp4
    python3 $P/master.py                           # -> justinclips/shorts/naked-mole-rat/video.mp4 + video.sha256

Deliverables: script.md, sources.md, UPLOAD.md, contact_sheet.png, video.mp4, video.sha256, STATUS.md.
