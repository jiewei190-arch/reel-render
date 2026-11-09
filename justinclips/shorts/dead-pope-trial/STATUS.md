STATE: ready

# Justin clips Short #10: dead-pope-trial ("A Pope Put a Dead Pope on Trial ⚖️")
Branch `justinclips/batch2-b`, commit fdf1edb (project + this folder). Project: `whatif/aitrends-2d-studio/projects/dead-pope-trial` (Toon 3D kit + BEANMEN FX, 15 shots).

## Full render (Creator, from `whatif/aitrends-2d-studio`)
```
node render.mjs --project projects/dead-pope-trial --gl gpu --out projects/dead-pope-trial/build/video_silent.mp4
```
-> `projects/dead-pope-trial/build/video_silent.mp4`. **Expected: 1080x1920, 24 fps, 841 frames, 35.04 s.**

## Mix + final mux
```
python audio/mix.py --project projects/dead-pope-trial --out projects/dead-pope-trial/out/dead-pope-trial_mixed.mp4
ffmpeg -y -i projects/dead-pope-trial/build/video_silent.mp4 -i projects/dead-pope-trial/build/mix.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -movflags +faststart ../../justinclips/shorts/dead-pope-trial/video.mp4
```
mix.py writes `build/mix.wav` (-14 LUFS target, TP -1.5) and its own mp4, which `-shortest` trims by 4 frames (837).
So the final `video.mp4` = the full silent render (video stream copied, all 841 frames) + `mix.wav`. Check: 841 frames /
35.04 s, about -14.4 LUFS, true peak <= -1 dBFS (the preview measured -14.4 LUFS / -1.3 dBFS).
Then `sha256sum video.mp4 > video.sha256` and set `STATE: ready`.

## What's here
- `script.md` (13 lines, 35.04 s), `sources.md` (every claim quoted; NatGeo, JSTOR Daily, Wikipedia), `UPLOAD.md`.
- Voice: Kokoro am_fenrir, speed 0.95, `--gap 0.3 --comma 0.15 --section 0.85 --lead 0.15` (`justinclips/tools/voice_timed.py`,
  same settings as `whatif/voice/fenrir.py` plus sentence timings). "897" is voiced as "eight ninety-seven" (Kokoro reads the
  digits as "eight hundred ninety-seven"); Whisper heard "Rome 897", not "eight hundred...". Captions show "897." and "Stephen VI".
- Word timings: `timeline/words.json` = Whisper small word timestamps aligned to the script (85/92 matched, rest filled inside
  the TTS sentence segments) via `justinclips/tools/words.py`.
- Preview: `preview_dead-pope-trial_540x960.mp4` (841 frames, mixed). QC sheet: `contact_dead-pope-trial.png` (18 frames with the
  Shorts UI zones outlined in red: top bar, right buttons, bottom title area).
- After the preview, one small change: s08's camera was pulled back so the cardinal's head isn't cropped (checked on stills).

## Checklist
- Frame 1 = Stephen VI jabbing at the slumped dead pope on the throne, already moving (push-in, "!" + sweat). Line 1 = 9 words.
- Twist "The dead pope lost." at 3.0 s. New visual every 1.1-3.6 s (15 shots). Reaction FX after each reveal
  (! ? ??? sweat sparkle stars ripples + shake + flash).
- Inserts: ROME / 897, DEAD FOR 9 MONTHS (counter), VERDICT: GUILTY. Transitions: flash, whipBlur, iris (open + close), fade.
- BEANMEN beat: "Wait. How does a dead man defend himself?" -> "You see, a deacon stands next to him and answers for him." -> "Badly."
- Payoff 31.2-33.1 s ("...and banned putting dead people on trial", sign drops). Closer "Subscribe for more." 33.5-34.6 s (1.1 s).
- Loop: the last shot eases back to frame 1's framing on the EMPTY throne; frame 1 has him on it.
- Light: warm interior + window light shafts (darker topic) and the sunny sky for the churchyard. Music: `toon3d:mystery`; 39 sfx cues.
- Captions 1-3 words at 66 % height: clear of the bottom title area and the right-hand buttons on every checked frame.
- Tone guard: no corpse, bones, decay or injury. The dead pope is a robed bean with closed eyes; the tomb stays closed on screen.
- Nothing was posted, uploaded or logged into.

## Rendered on PC (Creator, RTX 4060, `--gl gpu`)
- `video.mp4`: 1080x1920, 24 fps, **841 frames, 35.04 s**, 23.5 MB; audio 48 kHz AAC 192k, 35.04 s.
- Loudness measured on the final file: **-14.5 LUFS, true peak -1.34 dBTP**.
- Render 56 s. Render, mix and mux run exactly as listed above (full silent video, `-c:v copy`, all frames kept).
- Contact sheet checked (inserts, captions, sign, empty-throne loop ending OK). Nothing posted, uploaded or scheduled.
