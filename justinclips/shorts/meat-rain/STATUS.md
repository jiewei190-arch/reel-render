STATE: ready

# Justin clips Short #12: meat-rain ("The Day It Rained Meat in Kentucky 🥩")
Branch `justinclips/batch2-c` (project commit c09bb4f; `--out` made explicit per Creator). Project: `whatif/aitrends-2d-studio/projects/meat-rain` (Toon 3D kit + BEANMEN FX, 16 shots).
Cloud built everything up to a checked half-size preview; **Creator renders the full 1080x1920 final.**

## Full render (Creator, from `whatif/aitrends-2d-studio`)
```
node render.mjs --project projects/meat-rain --gl gpu --out projects/meat-rain/build/video_silent.mp4
```
-> `projects/meat-rain/build/video_silent.mp4`. **Expected: 926 frames, 38.58 s** (24 fps, 1080x1920).

## Mix (explicit --out) + mux onto the full silent video
```
python audio/mix.py --project projects/meat-rain --video projects/meat-rain/build/video_silent.mp4 --out projects/meat-rain/build/mixed.mp4
ffmpeg -y -i projects/meat-rain/build/video_silent.mp4 -i projects/meat-rain/build/mixed.mp4 -map 0:v:0 -map 1:a:0 -c copy -movflags +faststart ../../justinclips/shorts/meat-rain/video.mp4
```
mix.py masters to -14 LUFS / TP <= -1.5 (preview measured **-14.5 LUFS, true peak -1.3 dBFS**). In the preview mix.py's own mp4 had
923 frames (it trims 3), so the final is the full silent render (926 frames) with the mixed audio stream copied in (38.58 s).
Check: `ffprobe -v error -count_frames -show_entries stream=nb_read_frames -of csv=p=0 video.mp4` -> 926.
Then `sha256sum video.mp4 > video.sha256` and set `STATE: ready`.

Inputs committed: `input/voiceover.wav` (git add -f), `timeline/words.json`, `story/shots.json`, scenes. Music/sfx are the kit's
committed `kits/toon3d/audio` wavs (`toon3d:curious` bed + 46 cues). Python needs numpy + scipy for mix.py.

## What was checked (preview `preview/meat_rain_preview_540x960.mp4`, sheet `preview/contact_sheet.png`)
- **Frame 1** = the farm wife staring up while cartoon meat chunks are already falling (moving at t=0). Line 1 "In 1876, it rained meat in Kentucky." (7 words) from 0.10 s.
- **Twist** "Out of a clear blue sky." at 4.0 s. New visual every 1-3 s (16 shots). Escalations: 4-inch pieces -> two men tasted it -> NYT + lab results -> vultures.
- **BEANMEN beat:** "Wait, how does meat fall out of a clear sky?" -> "You see, the best guess is vultures."
- **Effects:** sunny sky preset + god rays; reactions after every reveal (!, ???, sweat, hearts, sparkle, stars, shake, flash);
  3 INSERT cards (bigtext "4 INCHES", versus "MUTTON vs VENISON", document "FLESH DESCENDING IN A SHOWER"); whipBlur / iris / flash / dissolve transitions;
  music bed `toon3d:curious` + 46 sfx cues (most on spoken words).
- **Captions** 1-3 words at 66 % height: clear of the bottom title zone and the right button column (red zones drawn on panels 1 and 9). Hidden under the newspaper card (19.25-20.95 s) so they don't overlap it.
- **Year:** TTS says "eighteen seventy-six" (whisper heard "In 1876, it rained meat"; no "one thousand eight hundred"); caption shows "1876". "4" likewise.
- **Payoff** "So that clear blue sky... wasn't empty." at 34.5-36.9 s; closer "Subscribe for more." 1.1 s; **last frame == frame 1** (s16 plays the opening shot up to its t=0, seamless loop).
- Tone: cartoon pink steak chunks, nobody hurt, vultures turn green for a second and fly off fine.
- Preview render in the cloud: 540x960, 5m20s (SwiftShader, 4 workers). Build frames are gitignored.

Nothing was posted, uploaded or logged into.

## Rendered on PC (Creator, RTX 4060, `--gl gpu`)
- `video.mp4`: 1080x1920, 24 fps, **926 frames (counted), 38.58 s**, 23.3 MB; audio 48 kHz, 38.58 s.
- Loudness measured on the final file: **-14.55 LUFS, true peak -1.42 dBTP** (same as the preview's -14.5).
- Render 62 s. Render, mix and mux run exactly as listed above.
- Contact sheet checked (cards, captions, vultures, loop ending matches frame 1). Nothing posted, uploaded or scheduled.
