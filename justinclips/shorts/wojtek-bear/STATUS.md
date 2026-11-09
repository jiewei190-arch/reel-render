STATE: ready

# Justin clips Short #9: wojtek-bear ("A Bear Served in WW2 With a Real Rank 🐻")
Branch `justinclips/batch2-a`, project commit `9d906a9`. Project: `whatif/aitrends-2d-studio/projects/wojtek-bear` (15 shots, Toon 3D + BEANMEN FX).
Expected: **977 frames, 40.71 s** (voice 40.71 s), 1080x1920, 24 fps. Preview checked: `preview_wojtek-bear.mp4` (540x960, mixed) + `contact_wojtek-bear.png`.

## Creator: full render (from `whatif/aitrends-2d-studio`)
```
node render.mjs --project projects/wojtek-bear --gl gpu --out projects/wojtek-bear/build/video_silent.mp4
```
(`--out` is resolved from the current folder, so keep the full path.) Check: 977 frames.

## Creator: mix + master + mux (from `whatif/aitrends-2d-studio`)
```
python audio/mix.py --project projects/wojtek-bear --video projects/wojtek-bear/build/video_silent.mp4 --out projects/wojtek-bear/build/mix_check.mp4
ffmpeg -y -i projects/wojtek-bear/build/mix.wav -af "volume=0.7dB,alimiter=limit=0.85:level=false" -ar 48000 projects/wojtek-bear/build/mix_final.wav
ffmpeg -y -i projects/wojtek-bear/build/video_silent.mp4 -i projects/wojtek-bear/build/mix_final.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -movflags +faststart ../../justinclips/shorts/wojtek-bear/video.mp4
```
Cloud measurement of `mix_final.wav`: **-13.8 LUFS, true peak -1.3 dBFS**. The last line muxes onto the full silent video with
`-c:v copy` and no `-shortest` (no frames dropped; `mix_check.mp4` is only a check). Then: `video.sha256`, `STATE: ready`.

## Checks done in the cloud
- Line 1 "A bear served in the Polish army in World War II." (10 words); twist "He had a rank. And a serial number." at 3.3 s; "Wait, how...?" -> "You see," beat -> "He was a private." punchline after a beat; 3 cards (service record, route map, unit badge); payoff badge + corporal + Edinburgh Zoo in the last 8 s; closer "Subscribe for more." 39.2-40.1 s (<1.5 s); last shot = the frame-1 parade (loop).
- Years voiced "nineteen-forty-two / nineteen-forty-four" (whisper: 0.66 s / 0.72 s, not "one thousand nine hundred..."); captions show 1942, 1944, "World War II", "Wojtek" (TTS spelled "Voytek" for the pronunciation).
- No combat, weapons or injuries shown; Monte Cassino = far hills at dusk + crates. Ammunition-carrying said as "reported" (+ on-screen "(reported by his unit)").
- Sources: `sources.md` (IWM memorial record + Wikipedia; Britannica/iwm.org.uk returned 403 from the cloud).
- Nothing posted, uploaded or logged into.

## Rendered on PC (Creator, RTX 4060, `--gl gpu`)
- `video.mp4`: 1080x1920, 24 fps, **977 frames (counted), 40.71 s**, 20.6 MB; audio 48 kHz.
- Loudness measured on the final file: **-13.87 LUFS, true peak -1.09 dBTP**.
- Render 50 s. Commands run exactly as listed above. Contact sheet checked (cards animate in, captions, parade loop ending OK).
- Nothing posted, uploaded or scheduled.
