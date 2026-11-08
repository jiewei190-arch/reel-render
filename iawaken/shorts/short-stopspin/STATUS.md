STATE: ready-for-gpu-render

# short-stopspin: What If the Earth Stopped Spinning for One Second?

- Branch: `iawaken/short-stopspin`. Project: `whatif/aitrends-2d-studio/projects/short-stopspin` (9:16, 1080x1920, 24 fps, style dusk, captions on at y 1330).
- Duration: **26.00 s** (narration 25.18 s + 0.8 s with the end card, then a hard cut). 71 words, Kokoro am_fenrir at 0.95 (sentence gaps 0.3 s, no section breaks).
- Shots: **15** (1.15-2.6 s each), all in `scenes/shots/A_stopspin.js`; custom set `scenes/sets/spin.js` (globe, tiny planet, sunny street, coast surge, wind, debris, gold number).
- Word clock: `tools/transcribe.py --model small`, 67/71 = 94 % match.
- HOOK 0-2.6 s (title question, hero already on a spinning planet, frame 1 not blank) -> BUILD-UP 2.6-13.05 s (racing east / it stops / you, the air and the oceans keep going / how fast?) -> PAYOFF 15.05-23.85 s (1,670 km/h at the equator, faster than a jet, only bedrock stays) -> closer "Follow for more What Ifs." + 0.75 s end card.
- Preview: `iawaken/shorts/short-stopspin/preview_short-stopspin.mp4` (540x960, full length, mixed: -14.1 LUFS, true peak -1.5 dBTP). QC sheet: `contact_short-stopspin.png` (12 frames + last frame).

## Softened / attributed claims
- "about sixteen hundred seventy kilometers an hour" is said with "about" and "at the equator" (sources give 1,670-1,674 km/h; it is slower at higher latitudes).
- "Everything not bolted to bedrock flies east": the bedrock wording is popularly attributed to NASA's Ask an Astrophysicist; sources.md cites Space.com / BBC Sky at Night / Science Notes and does not quote NASA directly.
- "Faster than a jet": compared with airliner cruise (~900 km/h, shown on screen as "~900 km/h").
- No death tolls, earthquakes or survival odds are claimed. Nobody is shown hurt.

## GPU render (Creator session on the PC), from `whatif/aitrends-2d-studio`
```
git fetch origin iawaken/short-stopspin && git checkout iawaken/short-stopspin
cd whatif/aitrends-2d-studio
node render.mjs --project projects/short-stopspin --workers 10 --format jpeg
python audio/mix.py --project projects/short-stopspin --out projects/short-stopspin/out/short-stopspin_mix.mp4
ffmpeg -y -i projects/short-stopspin/out/short-stopspin_mix.mp4 -c:v copy -af "volume=1.0dB,alimiter=limit=0.82:level=false:attack=1:release=50" -ar 48000 -c:a aac -b:a 192k -movflags +faststart projects/short-stopspin/out/short-stopspin.mp4
ffmpeg -i projects/short-stopspin/out/short-stopspin.mp4 -af loudnorm=I=-14:TP=-1:print_format=summary -f null -
```
The last line only measures: expect about -14 LUFS integrated and true peak <= -1 dBTP (the cloud preview measured -14.1 / -1.5).
If it reads quieter than -14.5, raise `volume=` by the difference and run the limiter line again.
The render takes about 2 minutes on the PC GPU. (In the cloud, Playwright 1.56 needed a browser-path shim; that is not needed on the PC.)
Output: `projects/short-stopspin/out/short-stopspin.mp4` (1080x1920, 24 fps, 26.0 s).
