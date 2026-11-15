# longform: 16:9 explainers in the style of @Inkexplainer96

Their style: stick-figure cavemen (round white heads, sleepy heavy-lidded eyes, leopard-print tunics) on painted cartoon backgrounds; 6-11 min "What did ancient humans..." narratives; thumbnails = one big character + 2-3 word yellow/white caps with black outline.

Pipeline (per video folder, e.g. `teeth/`):
1. `script.json`: scenes -> narration lines (every fact sourced in `sources.md`).
2. `python3 -I voice.py teeth` -> `vo.wav` + `tl.json` (Kokoro, line timings).
3. `shots.json`: shared style block + one Gemini image prompt per narration line (+ optional overlay `txt`).
4. `GEMINI_API_KEY=... python3 -I gen_images.py teeth` -> `images/img001.png...` (img001 is the style anchor for the rest).
5. `node render.js teeth video 4 30 --img` -> Ken Burns + crossfades + headline overlays -> `out/video_noaudio.mp4`.
   Without `--img` (or for any missing image) it falls back to the procedural SVG drawings in `scenes.js` + `ink.js`.
6. `python3 -I mix.py teeth` -> music bed ducked under the voice, loudness -14 LUFS -> `out/final.mp4`.
`sh make.sh teeth` runs all of it. Quick checks: `node render.js teeth stills 3 17 45 [--img]`.
