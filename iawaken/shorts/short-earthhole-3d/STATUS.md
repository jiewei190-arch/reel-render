STATE: ready-for-gpu-render
# short-earthhole-3d: "What If You Jumped Into a Hole Through the Earth?" (Toon 3D remake)

- Duration: **29.75 s** = 714 frames at 24 fps, 1080x1920 (9:16), style `toon`, Toon 3D captions (kits/toon3d/captions.js, y 0.70, gold numbers/key words).
- Shots: **19**. s001-s017 keep the 2D original's exact shot timings; s018 "Would you jump?" now ends at 28.05 (the old 28.50 hold is trimmed); new s019 closer 28.05-29.75.
- Voice: the original voiceover (Kokoro am_fenrir, 0.95) unchanged to 28.05 s + closer **"Subscribe for more."** voiced alone with
  `python whatif/voice/fenrir.py iawaken/shorts/short-earthhole-3d/voice/closer.md closer.wav --gap 0 --comma 0 --lead 0` (1.19 s),
  spliced at 28.10 s (speech 28.13-29.19), 0.56 s hold to the hard cut. words.json gets 3 new words (energy-aligned: 28.14 / 28.68 / 28.80-29.18).
- Story: hook (frame 1 = HERO mid-jump over the hole at the NORTH POLE) -> build-up (fall, glowing rock, gauges, core vs Sun) -> payoff (weightless at the centre, 8 km/s, 38 min, pops out at the SOUTH POLE among penguins, falls back, forever) -> "Would you jump?" -> "Subscribe for more." (he hops back in: the last frame loops into frame 1).
- Props/cast: kit `hero` (mustard hoodie), MINA cameo with her stopwatch (s013), new local props in `scenes/_lib.js`: hole-in-the-snow set, NORTH/SOUTH POLE markers, penguins, cutaway globe, pressure gauge, thermometer, Sun, rock-strata shaft with heat glow.
- Preview: `preview_short-earthhole-3d.mp4` (540x960, 714 frames, 29.75 s, mixed): **-14.4 LUFS integrated, -1.3 dBFS true peak**. Cloud SwiftShader render took 2m27s (4 workers).
- QC: `contact_short-earthhole-3d.png` (one frame per shot at its midpoint + the last frame). Facts and chips unchanged from the 2D version; new chips "+35 km/h EVERY SECOND" and "ABOUT 28,800 km/h" are sourced in sources.md.
- Files: project `whatif/aitrends-2d-studio/projects/short-earthhole-3d/` (config.json, input/voiceover.wav [committed with -f], input/script.txt, timeline/, story/shots.json, scenes/{kit,_lib,polar,shaft,globe,core}.js); here: script.md, sources.md, UPLOAD.md, voice/closer.md + voice/closer_fenrir.wav.
- NOT posted, uploaded or scheduled. The full-resolution render was NOT done in the cloud.

## PC GPU render + mix (Creator session). Git Bash, from the repo root, kit PATH set as in whatif/aitrends-2d-studio/SETUP_NOTES.md
    git fetch origin iawaken/short-earthhole-3d && git checkout iawaken/short-earthhole-3d
    cd whatif/aitrends-2d-studio
    export PATH="$PWD/bin:$PWD/.venv/Scripts:$PATH"
    node render.mjs --project projects/short-earthhole-3d --gl gpu --workers 10
    python audio/mix.py --project projects/short-earthhole-3d --video projects/short-earthhole-3d/build/video_silent.mp4 --out projects/short-earthhole-3d/out/short-earthhole-3d.mp4
    # verify: 714 frames, 1080x1920, 29.75 s; I = -14 ±0.5 LUFS; true peak <= -1 dBFS
    ffprobe -v error -show_entries stream=codec_type,width,height,nb_frames,duration -of compact projects/short-earthhole-3d/out/short-earthhole-3d.mp4
    ffmpeg -hide_banner -i projects/short-earthhole-3d/out/short-earthhole-3d.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -E "I:|Peak:"
    # only if loudness is off: re-normalise the audio, keep the video stream
    ffmpeg -y -i projects/short-earthhole-3d/out/short-earthhole-3d.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:a aac -b:a 192k projects/short-earthhole-3d/out/short-earthhole-3d_ln.mp4
(cmd/PowerShell: run `.\env.cmd` instead of the export and use `findstr /C:"I:" /C:"Peak:"` instead of grep.)

## Cloud notes
- Linux cloud: kit playwright 1.56 vs container chromium -> `node_modules/playwright(-core)` symlinked to the global playwright (node_modules is gitignored); `CHROMIUM_PATH=/opt/pw-browsers/chromium`. Not needed on the PC.
- Preview render: `node render.mjs --project projects/short-earthhole-3d --scale 0.5 --workers 4 --out projects/short-earthhole-3d/build/preview_silent.mp4`, then mix.py with `--video` that file.
