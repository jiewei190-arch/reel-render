STATE: ready

# What if Earth stopped spinning for one second? — status

- `video.mp4`: 1080x1920, 24 fps, 989 frames, 41.2 s (target 40-48), H.264 + AAC. sha256 in `video.sha256`. Rendered in full in the cloud
  (render.mjs, 4 workers, SwiftShader, ~9 min).
- Audio: master -14.04 LUFS integrated, true peak -1.22 dBTP (ffmpeg loudnorm measure on the final file). mix.py gave -14.15 / -1.49;
  `master.py` adds a measured +0.15 dB gain + alimiter (0.85), then muxes with -c:v copy. Music `toon3d:curious` -20 dB (ducked); 54 kit SFX cues.
- Voice: Chatterbox D2 (built-in voice, exaggeration 0.3, cfg 0.3) via whatif/voice/chatterbox_d2.py `--gap 0.3 --lead 0.15`, all lines seed 7.
  Raw take 42.5 s. QA flagged only line 3, and only for spelling: TTS text "sixteen hundred", Whisper wrote "1,600" (same words).
  `tighten_vo.py 1.0`: no speed-up (1.04 would have gone under 40 s), pauses capped at 0.32 s, 0.18 s gaps, held beats before lines
  3/5/7/9/10/11 -> 40.65 s of voice + 0.55 s loop hold.
- Whisper QA (small.en) on the FINAL video.mp4 reads the script word for word: "...over 1,600 kilometers an hour ... about 2 milliseconds per century.
  Subscribe for more." (digits are Whisper's spelling of the spoken words). Script alignment for captions: 118/120 words (98%).
- Contact sheet (`contact_sheet.png`, from the final file): frame 1, hook at 1.0 s and a caption at 13.6 s under a mock Shorts UI (top bar,
  right rail, bottom title block), the last frame, and one mid-shot frame per shot (22 shots). Checked: frame 1 already moving with the
  2-line caption; captions (y = 0.72) clear of the bottom block and right rail; last frame = frame 1's camera on the farm with the slide
  just starting -> loops. s08 mid-shot is the white flash on the STOP (intended). Known: s01b's fly-by brings the farmer's head close to
  the lens for ~0.5 s (comic, kept).
- Fixed after looking: stars were drawn over the globe (2D overlay) -> moved into the 3D background and re-rendered; farmer left frame
  too fast in s01/s02; chips hidden/clipped in s07/s09/s10; the first wave didn't read as a wave (rebuilt; camera was inside it in s13);
  framing of s03/s06/s19b.
- Rules: line 1 = 11 words, WTF first; top caption 0-3.5 s, 2 lines, centre-top, STOPPED gold / 1 SECOND red; cuts every 1.0-2.5 s
  (22 shots in 41.2 s, internal hard cuts s01b and s19b); "But" turns at 6.0 s, 16.8 s, 24.4 s, 27.9 s, plus "The good news?" at 31.4 s
  (the 6-17 s gap carries the speed reveal + the cow gag instead of a "But"); reaction FX after each reveal; 3 insert cards
  (1,600+ KM/H, MIRACLE, ~2 ms per century); payoff (2 ms/century card + farmer's relief) ends ~2 s before the end; closer
  "Subscribe for more." 1.23 s; s20 returns to frame 1's camera -> loop.
- What-if handling: line 2 says it's a thought experiment; every effect is from NASA Goddard's Q&A pages (Cosmicopia, Stargazers FAQ),
  cross-checked with Wikipedia and Live Science (sources.md). Cartoon chaos only: nobody is shown hurt.
- Changes vs the brief/card: speed said as "over 1,600 km/h" (Wikipedia 1,674.7; NASA "~1000 mph"; Live Science 1,770) — no line changed
  for facts. Left out on purpose: supersonic winds (NASA FAQ #108 says the air moves with you), six-month days (only for a permanent stop).
- Nothing was posted, uploaded or logged in anywhere.

Re-render, from whatif/aitrends-2d-studio (P=projects/earth-stops-spinning):
    ~/.venvs/chatterbox/bin/python /path/to/whatif/voice/chatterbox_d2.py $P/input/tts_script.md $P/input/voiceover_raw.wav --gap 0.3 --comma 0.15 --lead 0.15
    ~/.venvs/chatterbox/bin/python $P/tighten_vo.py 1.0
    ~/.venvs/chatterbox/bin/python tools/transcribe.py --project $P --script $P/input/script.txt --lang en --model small
    python3 $P/make_shots.py                                  # story/shots.json + config duration from line/word timings
    CHROMIUM_PATH=/opt/pw-browsers/chromium node render.mjs --project $P --out $P/build/video_silent.mp4 --workers 4
    ~/.venvs/chatterbox/bin/python $P/master.py earth-stops-spinning ../../justinclips/shorts/earth-stops-spinning
    ~/.venvs/chatterbox/bin/python $P/contact_sheet.py ../../justinclips/shorts/earth-stops-spinning/video.mp4 $P/story/shots.json ../../justinclips/shorts/earth-stops-spinning/contact_sheet.png 1.0 13.6

Deliverables: script.md, sources.md, UPLOAD.md, contact_sheet.png, video.mp4, video.sha256, STATUS.md.
