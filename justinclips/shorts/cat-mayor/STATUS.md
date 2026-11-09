STATE: ready

# Justin clips Short #8: cat-mayor ("This Town's Mayor Was a Cat for Almost 20 Years 🐱")
Branch `justinclips/batch2-a`, project commit `f7c87b3`. Project: `whatif/aitrends-2d-studio/projects/cat-mayor` (17 shots, Toon 3D + BEANMEN FX).
Expected: **1015 frames, 42.29 s** (voice 42.27 s), 1080x1920, 24 fps. Preview checked: `preview_cat-mayor.mp4` (540x960, mixed) + `contact_cat-mayor.png`.

## Creator: full render (from `whatif/aitrends-2d-studio`)
```
node render.mjs --project projects/cat-mayor --gl gpu --out build/video_silent.mp4
```
-> `projects/cat-mayor/build/video_silent.mp4` (check: 1015 frames).

## Creator: mix + master + mux (from `whatif/aitrends-2d-studio`)
```
python audio/mix.py --project projects/cat-mayor --video projects/cat-mayor/build/video_silent.mp4 --out projects/cat-mayor/build/mix_check.mp4
ffmpeg -y -i projects/cat-mayor/build/mix.wav -af "volume=0.7dB,alimiter=limit=0.85:level=false" -ar 48000 projects/cat-mayor/build/mix_final.wav
ffmpeg -y -i projects/cat-mayor/build/video_silent.mp4 -i projects/cat-mayor/build/mix_final.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -movflags +faststart ../../justinclips/shorts/cat-mayor/video.mp4
```
mix.py alone lands at -14.7 LUFS / TP -1.5 (it muxes with -shortest; `mix_check.mp4` is only a check). The 2nd line brings it to
**-14.1 LUFS, true peak -1.3 dBFS** (measured on the cloud mix). The 3rd line muxes onto the full silent video with `-c:v copy` and
no `-shortest`, so no frames are dropped. Then: `video.sha256`, `STATE: ready`.

## Checks done in the cloud
- Line 1 "This town's mayor was a cat." (6 words); twist "according to legend, he beat the humans" at 3.5 s; "Wait, how?" -> "You see," beat; 3 insert cards (bigtext POP ~900, document, timeline); payoff quote 36.6-40.1 s; closer "Subscribe for more." 40.74-41.7 s (<1.5 s); last shot ends on the frame-1 porch framing (loop).
- Years voiced "nineteen-ninety-eight / twenty-fourteen / twenty-seventeen" (whisper: 0.70 s / 0.80 s / 0.86 s each, not "one thousand nine hundred..."); captions show 1998, 2014, 2017, 20, 900.
- Captions 1-3 words at 66 % height, clear of the Shorts bottom bar and right-side buttons (contact sheet has the zones tinted red).
- Sources: `sources.md` (Smithsonian + CBS/AP). Fact fix vs the topic bank: 1998-2017 = ~19 years, so "almost 20".
- Nothing posted, uploaded or logged into.

## Rendered on PC (Creator, RTX 4060, `--gl gpu`)
- `video.mp4`: 1080x1920, 24 fps, **1015 frames, 42.29 s**, 22.9 MB; audio 48 kHz AAC 192k, 42.27 s.
- Loudness measured on the final file: **-14.2 LUFS, true peak -1.26 dBTP**.
- Render took ~66 s. Note: `--out build/video_silent.mp4` resolves from the kit folder, not the project, so the concat step failed;
  the 8 parts were joined with the same concat into `projects/cat-mayor/build/video_silent.mp4` (1015 frames). Next time use
  `--out projects/<slug>/build/video_silent.mp4`.
- Mix, master and mux run exactly as listed above. Contact sheet checked (cards, captions, loop ending OK).
- Nothing posted, uploaded or scheduled.
