STATE: ready

# One man hiccuped for 68 years — status

- `video.mp4`: 1080×1920, 24 fps, 1080 frames, **45.00 s** (target 40–48), H.264 + AAC, 21 MB. sha256 in `video.sha256`. Rendered in full in the
  cloud (Toon 3D, SwiftShader, 4 workers, 9m07s). Muxed with `-t` = the video length (no frame loss).
- Audio: **-14.1 LUFS integrated, true peak -3.3 dBTP** (ffmpeg ebur128 on the final file). audio/mix.py (music `toon3d:curious` -22 dB, kit SFX on
  words, and **15 original synthesized hics**, `sfx/hic.wav` / `sfx/hic2.wav` from make_sfx.py, -4 dB), then the octopus-nine-brains master step
  (`alimiter=limit=0.6` + `loudnorm=I=-14:TP=-1.5`).
- The hic gag: one hic on frame 1 (0.05 s, before the narrator starts: the VO has a 0.32 s lead), then make_shots.py drops a hic into every silent
  gap ≥ 0.34 s between words, at least 1.5 s apart, up to line 9 (hics at 0.05 / 2.24 / 9.0 / 11.98 / 14.1 / 15.92 / 17.86 / 20.32 / 23.36 /
  25.22 / 26.78 / 29.5 / 33.56 / 36.27 / 38.3 s). Each one jolts the farmer in the 3D shots (the times are shared via scenes/_hics.js). From
  "Then, in 1990..." on there are none: the payoff is the silence, then "they just stopped" and his grin.
- Voice: Chatterbox D2 (exaggeration 0.3, cfg 0.3) via whatif/voice/chatterbox_d2.py, raw take 50.9 s. Every line passed Whisper QA on seed 7
  except "stop." (line 3, seed 11). Line 3 was re-taken as "Then he started hiccuping. And he did not... stop." because Whisper heard
  "hiccups" as "hiccup" on all 3 seeds. Spliced in with splice_vo.py. Tightened by tighten_vo.py at atempo 1.08: line gaps 0.36 s (room for a hic),
  "..." beats kept at 0.45–0.6 s, held beats before lines 6/9/10 → 44.7 s of voice + 0.3 s tail.
- **Whisper QA** (small.en, beam 5) on the final video.mp4 reads all 109 words of the script word for word. Whisper drops the closer on the full-file pass,
  but the last 2.2 s transcribed on their own read "Subscribe for more."; digits in captions, spoken as words.
- Contact sheet (contact_sheet.png, from the final file via justinclips/tools/contact_sheet.py): frame 1 / 1.5 s / 3.3 s with the Shorts UI zones,
  the last frame next to frame 1, one frame per shot. Checked: frame 1 is moving (hic jolt, hat pop, "HIC!" burst at 0.05 s) with the 2-line
  caption centre-top below the top bar; captions (y 0.72) and chips clear of the right buttons and bottom area; the last frame = frame 1's camera
  + pose (loop: the hics then start again on frame 1). Fixed after the preview sheets: a JS load error (duplicate helper), the hat brim and
  moustache casting a dark shadow across his face, a ring print on his shirt that read like a logo (removed), frame 1 too tight, the "HIC!"
  burst over the top caption, a chip under "???". Known small things left: the stopwatch (s10) and the BUT stamp (s11) overlap the hat brim.
- Rules: line 1 = 7 words, WTF first; top caption 0–3.5 s "HICCUPS for / 68 YEARS straight" (HICCUPS gold, 68 YEARS red); escalations at
  ~3.6 (1922 + hog) / 7.1 (the fall) / 13.1 (Guinness rate) / 18.4 (doctors) / 23.9 ("But here's the part...") / 27.9 (8 kids) / 34.2 (record) /
  38.8 (1990) / 41.8 (stopped); 21 shots + 2 internal hard cuts (avg ~1.9 s); reaction FX after the reveals; 2 insert cards (20–40 a minute;
  400,000,000+ counter); payoff "they just stopped" 41.9–43.2 s; closer "Subscribe for more." ~1.0 s; s21 lands on frame 1's framing → loop.
- Shot times: s01 0.00–2.44 · s02 2.44–3.60 · s03 3.60–7.08 · s04 7.08–9.28 · s05 9.28–10.72 · s06 10.72–13.14 · s07 13.14–16.26 · s08 16.26–18.44 ·
  s09 18.44–20.62 · s10 20.62–23.92 · s11 23.92–25.44 · s12 25.44–27.18 · s13 27.18–27.86 · s14 27.86–29.94 · s15 29.94–31.12 · s16 31.12–34.20 ·
  s17 34.20–36.46 · s18 36.46–38.84 · s19 38.84–41.82 · s20 41.82–43.38 · s21 43.38–44.96
- Nothing was posted, uploaded or logged in anywhere.

## Wording changes vs the brief
- "it reportedly started while lifting a hog": Wikipedia says a 350-pound hog "collapsed on top of him"; Guinness says he fell while trying to weigh it.
  Line 2 covers both: "reportedly went down... under a 350-pound hog". The 350-pound figure is Wikipedia's only.
- "he estimated hundreds of millions of hiccups": Wikipedia says over 430 million, Guinness more than 420 million → "Over 400 million hiccups"
  (true under both); the counter card shows 400,000,000+.
- Guinness-only facts are attributed: the rate ("According to Guinness, 20 to 40 times a minute"), the 50-hour break and the eight kids ("reportedly").
- His death is not mentioned (the brief: keep it to "they stopped in 1990"); nothing sad is shown.

## Rebuild (from whatif/aitrends-2d-studio; P=projects/hiccups-68-years; Python tools in ~/.venvs/chatterbox)
    ~/.venvs/chatterbox/bin/python ../voice/chatterbox_d2.py $P/input/voice_script.md $P/input/voiceover_raw.wav $P/input/voice_plain.txt --gap 0.3 --comma 0.15 --lead 0.15
    #   (voice_script.md has the line-3 fix; the shipped raw take = the original take + fix3.wav spliced by splice_vo.py 3 fix3.wav)
    ~/.venvs/chatterbox/bin/python $P/tighten_vo.py 1.08                      # -> input/voiceover.wav (44.7 s)
    ~/.venvs/chatterbox/bin/python tools/transcribe.py --project $P --script $P/input/script.txt --lang en --model small
    python3 $P/make_shots.py && ~/.venvs/chatterbox/bin/python $P/make_sfx.py   # shots.json + scenes/_hics.js; sfx/hic*.wav
    CHROMIUM_PATH=/opt/pw-browsers/chromium node render.mjs --project $P --out $P/build/video_silent.mp4 --workers 4
    ~/.venvs/chatterbox/bin/python audio/mix.py --project $P
    ffmpeg -i $P/build/mix.wav -af "alimiter=limit=0.6:attack=3:release=60:level=false,loudnorm=I=-14:TP=-1.5:LRA=11" -ar 48000 $P/build/mix_master.wav
    ffmpeg -i $P/build/video_silent.mp4 -i $P/build/mix_master.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -t 45.0 ../../justinclips/shorts/hiccups-68-years/video.mp4

Deliverables: script.md, sources.md, UPLOAD.md, STATUS.md, contact_sheet.png (from the final), video.mp4, video.sha256.
