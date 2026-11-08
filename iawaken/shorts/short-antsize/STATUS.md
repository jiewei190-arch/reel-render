STATE: ready-for-gpu-render

# short-antsize — "What If You Shrank to the Size of an Ant?"
Branch `iawaken/short-antsize`. Worker W3. Cloud work done; full-resolution render is for the Creator session on the PC GPU.

- **Duration:** 26.30 s (voice 25.24 s, last word ends 24.80, hold to 25.40, end card 25.40-26.30 = 0.9 s). 24 fps, 1080x1920, 631 frames.
- **Shots:** 16 (`story/shots.json`, one file `scenes/shots/A_antsize.js`, set `scenes/sets/micro.js`). HOOK s001 (0-2.31) -> BUILD-UP s002-s008 (2.31-12.65) -> PAYOFF s009-s015 (12.65-25.40) -> end card s016.
- **Voice:** Kokoro am_fenrir, speed 0.95, sentence gaps 0.3 s, section breaks 0 (local patched copy of fenrir.py, shared one untouched). 75 words. Whisper alignment 96 % (72/75).
- **Look:** classic bright I.Awaken (style dusk, golden-hour moods), hero = mustard hoodie, narrator only, captions on (y 1330, gold highlight), `fadeIn: 0` (hook visible on frame 1).
- **Preview:** `preview_short-antsize.mp4` 540x960, mixed (music + SFX + ambience), -14.1 LUFS, true peak -1.3 dBFS (after loudnorm).
- **QC:** `contact_short-antsize.png` (12 frames + last). Frame 1 not blank (hero mid-shrink in the grass), captions never clipped, chips at y ~330, faces above the caption band, nothing important below y 1440 / right of x 900.

## Softened / attributed claims
- Ant terminal velocity: physicist's estimate "no more than ~2 m/s" (Illinois Physics) -> spoken as "walking speed", shown "~7 km/h".
- Human terminal velocity: spoken "around two hundred kilometres an hour" (NASA/Britannica ~55 m/s belly-down skydiver).
- "One raindrop grabs you, and won't let go" / "water is scarier than gravity": Haldane's surface-tension argument (a wetted insect "is likely to remain so"), not a measured survival rate. The raindrop impact itself is not called lethal (PNAS 2012 mosquito study).

## GPU render commands (Creator session, from `whatif/aitrends-2d-studio`, on this branch)
```
git fetch origin iawaken/short-antsize && git checkout iawaken/short-antsize
cd whatif/aitrends-2d-studio
node render.mjs --project projects/short-antsize
python audio/mix.py --project projects/short-antsize
# loudnorm the muxed result to -14 LUFS / TP <= -1 dBFS (two-pass):
ffmpeg -i "projects/short-antsize/out/What If You Shrank to the Size of an Ant_.mp4" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null -
#   -> plug input_i / input_tp / input_lra / input_thresh / target_offset into:
ffmpeg -i "<that mp4>" -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=..:measured_TP=..:measured_LRA=..:measured_thresh=..:offset=..:linear=true -ar 48000 -c:a aac -b:a 192k projects/short-antsize/out/short-antsize_final.mp4
```
(mix.py writes the muxed file to `projects/short-antsize/out/`; use the exact name it prints after `FINAL VIDEO:`. In the cloud the mix alone measured -14.7 LUFS / -1.4 dBTP before loudnorm.)
Expected render cost: ~1 min on the PC GPU (cloud CPU at half scale: 2m18s).

Cloud notes: Playwright here needed the preinstalled 1.63 (node_modules symlink, not committed); `input/voiceover.wav` is force-added (`*.wav` is gitignored).
Nothing was posted, uploaded or scheduled.
