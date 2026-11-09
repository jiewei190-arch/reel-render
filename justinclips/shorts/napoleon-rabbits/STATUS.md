STATE: render-on-pc

# Justin clips Short #11: napoleon-rabbits ("Napoleon Was Defeated by Rabbits 🐇")
Branch `justinclips/batch2-b`, commit 710c9ea (project + this folder). Project: `whatif/aitrends-2d-studio/projects/napoleon-rabbits` (Toon 3D kit + BEANMEN FX, 18 shots).

## Full render (Creator, from `whatif/aitrends-2d-studio`)
```
node render.mjs --project projects/napoleon-rabbits --gl gpu --out projects/napoleon-rabbits/build/video_silent.mp4
```
**Expected: 1080x1920, 24 fps, 1022 frames, 42.58 s.**

## Mix + final mux
```
python audio/mix.py --project projects/napoleon-rabbits --out projects/napoleon-rabbits/out/napoleon-rabbits_mixed.mp4
ffmpeg -y -i projects/napoleon-rabbits/build/video_silent.mp4 -i projects/napoleon-rabbits/build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -movflags +faststart ../../justinclips/shorts/napoleon-rabbits/video.mp4
```
mix.py writes `build/mix.wav` (-14 LUFS target, TP -1.5). Its own mp4 is cut by `-shortest`, so the final `video.mp4` = the full
silent render (video copied, all 1022 frames) + `mix.wav`. Check: 1022 frames / 42.58 s, about -14.6 LUFS, true peak <= -1 dBFS
(the preview measured -14.6 LUFS / -1.3 dBFS). Then `sha256sum video.mp4 > video.sha256` and set `STATE: ready`.

## What's here
- `script.md` (15 lines, 42.58 s: the story needs the riding crop, whips and carriage beats; no padding), `sources.md`, `UPLOAD.md`.
- **Legend flag:** the story rests on General Thiébault's memoir. Line 1 = "According to one general, rabbits attacked Napoleon." (7 words);
  the carriage detail is "Reportedly"; the 3,000 figure is "Some say".
- Voice: Kokoro am_fenrir, speed 0.95, `--gap 0.3 --comma 0.15 --section 0.85 --lead 0.15` (`justinclips/tools/voice_timed.py`).
  "1807" is voiced as "eighteen-oh-seven"; Whisper heard "It's 1807" (not "one thousand eight hundred..."). Captions show "1807." and "3,000.".
- Word timings: Whisper small aligned to the script (98/103 matched), `timeline/words.json`.
- Preview: `preview_napoleon-rabbits_540x960.mp4` (1022 frames, mixed). QC: `contact_napoleon-rabbits.png` (20 frames, Shorts UI zones in red).
- After the preview, two small changes (checked on stills): s16's camera raised (Napoleon's head was cropped on the carriage roof)
  and the swat pose moved to the side (the riding crop crossed his face).

## Checklist
- Frame 1 = Napoleon already swatting inside a hopping rabbit swarm (sweat, then "!" on "Napoleon"). Twist "Hundreds of them. And they won." 3.5-6.2 s.
- New visual every 1.1-4.7 s (18 shots); reaction FX after each reveal (! ??? sweat sparkle stars hearts heart-eyes speedlines + shake + flash).
- Inserts: JULY 1807 / Treaties of Tilsit, RABBITS 3,000 (some say) counter, FINAL SCORE versus (BUNNIES 1 / NAPOLEON 0).
- BEANMEN beat: "Wait, why would rabbits charge?" -> "You see, they were tame farm rabbits. They thought he was bringing dinner."
- Payoff "The man who conquered Europe... defeated by bunnies." 37.7-40.7 s. Closer "Subscribe for more." 41.0-42.2 s (1.1 s).
- Loop: the closer pulls back from the hat-wearing bunny into the swarm, which leads into frame 1's swarm.
- Sunny sky preset + god rays everywhere. Music `toon3d:upbeat`; 42 sfx cues, several on spoken words.
- Captions 1-3 words at 66 % height, clear of the bottom title area and the right-hand buttons on every checked frame.
- Nobody hurt: no guns, the crop and whip swing in the air, rabbits only swarm. Original bean designs, not portraits.
- Nothing was posted, uploaded or logged into.
