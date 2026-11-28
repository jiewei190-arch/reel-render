STATE: ready

# Man versus Horse Marathon: status

Replaces **exploding-whale**: MAIN swapped the topic because that one was already published on Justin clips (Nov 20).
The paused exploding-whale draft is still on origin/justinclips/exploding-whale (pushed before the swap arrived). It is not deleted; that is the owner's call.

- `video.mp4`: 1080×1920, 24 fps, 1046 frames, 43.58 s (target 40–48), H.264 + AAC. sha256 in `video.sha256`. Rendered in full in the cloud
  (whatif/aitrends-2d-studio, Toon 3D, swiftshader, 4 workers, 14m28s). s03 was then re-rendered (frames 48–107: the top caption is now held to
  3.5 s and the low "on foot" camera pulled back) and spliced in, frame-exact.
- Audio: mix.py master **-14.5 LUFS integrated, true peak -1.2 dBTP** (ffmpeg ebur128 on the final file). Music: kit "upbeat" at -21 dB; 54 kit SFX cues (all `toon3d:*`, generated in code).
- Voice: Chatterbox D2 (exaggeration 0.3, cfg 0.3) via whatif/voice/chatterbox_d2.py. Raw take 46.2 s; QA ok on every line. The QA flag on line 7 is
  spelling only: Whisper writes "Huw" as "Hugh", and they are pronounced the same. Tightened by tighten_vo.py: atempo 1.0, pauses capped at
  0.32 s (0.4 s on the "..." beats), +0.3 s before "But here's the part", +0.35 s after "beat them all", +0.25 s before the payoff → 43.3 s of voice.
- **Whisper QA** (small.en, beam 5) on the final mp4: every script word is heard. The 6 "differences" are formatting only (22/2/4/5 written as
  words, Huw → Hugh, "25,000 pound" → "£25,000").
- Contact sheet (contact_sheet.png, from the final file): frame 1 + 1.5 s + 3.3 s with the Shorts UI zones, last frame vs frame 1, one frame per shot.
  Checked: the top caption sits below the Shorts top bar and clear of the right-hand buttons; burned captions at 72% height stay above the
  bottom title zone; no dead frames. The last frame is frame 1's framing (start line, runner + smug horse) → loop. Fixed after the first look: s03 (above).
  Small things left in: the horse's sunglasses read as dark blobs in the s12 close-ups, and the s11 counter is caught mid-count (24) on the sheet.
- Brief rules: line 1 = 9 words, WTF first; frame 1 already moving (runner bouncing, horse shifting) with the 2-line top caption "HUMANS vs. HORSES /
  a 22-mile race in Wales" (HUMANS gold, HORSES red) held 0–3.5 s; "But here's the part..." at 22.9 s; escalations about every 6–7 s (pub argument 4.9,
  RACE! 11.3, 22 MILES 13.5, 25 YEARS 18.2, the turn 22.9, HUMAN WINS 26.9, £25,000 29.0, scoreboard 32.3, payoff 37.6); cuts every ~0.9–3.2 s; reaction FX
  after the reveals; insert cards 22 MILES, 25 YEARS and the HUMANS 5 scoreboard; payoff "Horses: pretty much all the rest." then "Subscribe for more." (1.2 s).
- Facts: see sources.md (Wikipedia + organiser + Athletics Weekly + Brecon & Radnor Express). The card's "a handful of times" is stated exactly as
  **5 human wins: 2004, 2007, 2022, 2023, 2025**. The card's "22 miles" is kept (W history, AW, BR); W's lead says 21 and the course has varied.
- Shot times: s01 0.00–1.14 · s02 1.14–1.98 · s03 1.98–3.28 · s04 3.28–4.90 · s05 4.90–6.88 · s06 6.88–10.06 · s07 10.06–11.30 · s08 11.30–13.46 · s09 13.46–16.22 · s10 16.22–18.18 · s11 18.18–20.28 · s12 20.28–22.88 · s13 22.88–24.46 · s14 24.46–26.90 · s15 26.90–28.12 · s16 28.12–29.00 · s17 29.00–32.26 · s18 32.26–35.30 · s19 35.30–37.56 · s20 37.56–39.58 · s21 39.58–42.36 · s22 42.36–43.59
- Nothing was posted, uploaded or logged in anywhere.

## Rebuild (from whatif/aitrends-2d-studio; P=projects/man-vs-horse-marathon; Python tools in ~/.venvs/chatterbox from whatif/voice/setup_chatterbox.sh)
    ~/.venvs/chatterbox/bin/python ../voice/chatterbox_d2.py $P/input/voice_script.md $P/input/voiceover_raw.wav $P/input/script.txt --gap 0.3 --comma 0.15 --lead 0.15
    ~/.venvs/chatterbox/bin/python $P/tighten_vo.py                      # -> input/voiceover.wav (43.3 s)
    ~/.venvs/chatterbox/bin/python tools/transcribe.py --project $P --script $P/input/script.txt --lang en --model small
    python3 $P/make_shots.py                                            # -> story/shots.json (22 shots, 43.59 s)
    CHROMIUM_PATH=/opt/pw-browsers/chromium node render.mjs --project $P --workers 4 --out $P/build/video_silent.mp4
    ~/.venvs/chatterbox/bin/python audio/mix.py --project $P --video $P/build/video_silent.mp4   # -> out/Man_versus_Horse_Marathon.mp4
    python3 ../../justinclips/tools/contact_sheet.py $P/out/Man_versus_Horse_Marathon.mp4 $P/story/shots.json ../../justinclips/shorts/man-vs-horse-marathon/contact_sheet.png
