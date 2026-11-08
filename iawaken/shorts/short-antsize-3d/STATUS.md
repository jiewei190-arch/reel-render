STATE: ready-for-gpu-render

# short-antsize-3d: "What If You Shrank to the Size of an Ant?" in Toon 3D
Branch `iawaken/short-antsize-3d` (built on `iawaken/toon3d`, uses `kits/toon3d`). Project: `whatif/aitrends-2d-studio/projects/short-antsize-3d/`.

- **Duration 26.75 s**, 24 fps, 1080x1920 (642 frames), 16 shots, same shot timings as the 2D original for s001-s015 (s015 ends 25.15).
- **Voice:** the original Fenrir voiceover up to "Would you risk it?" (0-25.0 s) + the new closer **"Subscribe for more."**, voiced alone with `whatif/voice/fenrir.py` (am_fenrir, speed 0.95, `--gap 0.3 --comma 0.15 --lead 0.15`), level-matched, spliced at 25.25-26.29 s. Files: `input/voiceover.wav` (used by render/mix), `input/closer_raw.wav`, `input/closer_line.md`. Word timings: the original `timeline/words.json` + 3 words for the closer.
- **Look:** bean HERO (mustard hoodie, hood up) from `cast.js`; DR LIN cameo (s007 blueprint, s008 gauge). New props in `scenes/_lib.js` in the kit style: giant grass blades, red sneaker, glass skyscraper + city below, toon water drop (fresnel rim shader), airflow/wind/rain streaks, pavement, bottle cap, leaf, dust puff, splash, speed gauge, blueprint board. Captions = `kits/toon3d/captions.js` (gold on key words). Chips: ANT-SIZED YOU, FLOOR 100->, ~200 km/h, TINY = SLOW FALL, ~7 km/h, SURFACE TENSION, WATER > GRAVITY, SUBSCRIBE.
- **Preview:** `preview_short-antsize-3d.mp4` (540x960, mixed music + SFX + ambience + voice), -14.7 LUFS integrated, true peak -1.4 dBFS, 642 frames / 26.75 s. **Contact sheet:** `contact_short-antsize-3d.png` (18 frames, first + last).
- Facts unchanged from the 2D version (`sources.md`); same softening (ant fall speed spoken as "walking speed", raindrop line = Haldane's surface-tension argument).

## Full-res GPU render + mix (owner's PC, from `reel-render\whatif\aitrends-2d-studio`)
```
git fetch origin iawaken/short-antsize-3d && git checkout iawaken/short-antsize-3d && git pull
cd whatif/aitrends-2d-studio
npm install                                                         # only if node_modules is missing
node render.mjs --project projects/short-antsize-3d --sheet --scale 0.5         # optional sanity check -> build/sheets/sheet_01.png
node render.mjs --project projects/short-antsize-3d --gl gpu --workers 6        # -> projects/short-antsize-3d/build/video_silent.mp4 (1080x1920, 24 fps, 642 frames)
python audio/mix.py --project projects/short-antsize-3d                         # -> projects/short-antsize-3d/out/What_If_You_Shrank_to_the_Size_of_an_Ant.mp4
ffmpeg -i projects/short-antsize-3d/out/What_If_You_Shrank_to_the_Size_of_an_Ant.mp4 -af ebur128=peak=true -f null -   # check: I ~ -14 LUFS, peak <= -1 dBFS
```
If `--gl gpu` gives black frames, use `--gl auto`. mix.py needs numpy + scipy. Cloud timing for the half-scale preview: 2m36s (4 workers, SwiftShader).

Nothing was posted, uploaded or scheduled.
