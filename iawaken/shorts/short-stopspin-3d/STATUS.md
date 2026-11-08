STATE: ready-for-gpu-render

# short-stopspin-3d: What If the Earth Stopped Spinning for One Second? (Toon 3D remake)

- Branch: `iawaken/short-stopspin-3d` (on top of `iawaken/toon3d`, which has the kit). Project: `whatif/aitrends-2d-studio/projects/short-stopspin-3d` (9:16, 1080x1920, 24 fps, style `toon`, Toon 3D captions from `kits/toon3d/captions.js`).
- Duration **26.00 s**, 15 shots, same voiceover, word timings and shot timings as the 2D original (`origin/iawaken/short-stopspin`).
- Closer: "Follow for more What Ifs." -> **"Subscribe for more."** Re-voiced with `whatif/voice/fenrir.py` (Kokoro am_fenrir, speed 0.95), level-matched and spliced at 24.06 s (ends 25.20 s). The original narration is kept as `input/voiceover_orig.wav`; the new line alone is `input/closer.wav`. `timeline/words.json`, `sentences.json`, `transcript.txt` and `input/script.txt` updated.
- HOOK 0-2.6 s (the bean HERO in the mustard hoodie sipping coffee on top of a tiny spinning Earth; eyebrow up at the lens on "one second") -> BUILD-UP 2.6-15 s (sunny street, gold EAST arrow, deadpan "can't feel it"; the globe FREEZES on "stops"; giant shocked face on "Instantly"; the hero launched east on "don't", coffee flying; TOMAS hanging off a lamp post in the wind; the ocean surge past an unimpressed BISCUIT; flailing in the sky with a speedometer) -> PAYOFF 15-23.85 s (gold equator, counter, **1,670 km/h** slam on "seventy", overtaking a ~900 km/h jet with a deadpan wave, the street's loose stuff lifting off, ground cutaway: only BEDROCK stays) -> closer (the runaway coffee floats back, one deadpan sip at the lens = loops into frame 1, "Subscribe for more." pill).
- Scenes: `scenes/_lib.js` (sunny street set, globe, tiny planet, coast + wave, jet, cutaway, coffee cup, props, 2D chips/slam/gauge), `street.js` (s002 s003 s005 s006 s007 s013), `space.js` (s001 s004 s010), `sky.js` (s009 s011 s012 s015), `coast.js` (s008 s014). No kit files changed.
- Preview: `preview_short-stopspin-3d.mp4` (540x960, 26.00 s, 624 frames, mixed: -14.2 LUFS, true peak -1.5 dBTP). QC: `contact_short-stopspin-3d.png` (one frame per shot + last frame).
- Facts unchanged (see `sources.md`): "about" 1,670 km/h "at the equator"; jet shown as ~900 km/h; nobody is shown hurt (cartoon physics). Voice is synthetic. Nothing was posted.

## GPU render + mix on the PC (Git Bash, from the repo root)
```
git fetch origin iawaken/short-stopspin-3d && git checkout iawaken/short-stopspin-3d && git pull
cd whatif/aitrends-2d-studio
npm install                                                    # only if node_modules is missing
node render.mjs --project projects/short-stopspin-3d --gl gpu --workers 6
python audio/mix.py --project projects/short-stopspin-3d --out projects/short-stopspin-3d/out/mix.mp4
ffmpeg -y -i projects/short-stopspin-3d/out/mix.mp4 -c:v copy -af "volume=0.9dB,alimiter=limit=0.82:level=false:attack=1:release=50" -ar 48000 -c:a aac -b:a 192k -movflags +faststart projects/short-stopspin-3d/out/short-stopspin-3d.mp4
ffmpeg -i projects/short-stopspin-3d/out/short-stopspin-3d.mp4 -af loudnorm=I=-14:TP=-1:print_format=summary -f null -
```
Expected: `build/video_silent.mp4` 1080x1920, 24 fps, 624 frames, 26.00 s; final about -14 LUFS, true peak <= -1 dBTP (the preview measured -14.2 / -1.5).
If `--gl gpu` gives black frames use `--gl auto`. If the last line reads quieter than -14.5 LUFS, raise `volume=` by the difference and rerun the line before it.
