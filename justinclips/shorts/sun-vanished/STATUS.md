STATE: render-on-pc

# Justin clips Short #13: sun-vanished ("What If the Sun Vanished? You'd Have 8 Minutes ☀️")
Branch `justinclips/batch2-c`. Project: `whatif/aitrends-2d-studio/projects/sun-vanished` (Toon 3D kit + BEANMEN FX, 17 shots).
Cloud built everything up to a checked half-size preview; **Creator renders the full 1080x1920 final.**

## Full render (Creator, from `whatif/aitrends-2d-studio`)
```
node render.mjs --project projects/sun-vanished --gl gpu --out projects/sun-vanished/build/video_silent.mp4
```
**Expected: 864 frames, 36.00 s** (24 fps, 1080x1920; voice 35.98 s).

## Mix (explicit --out) + mux onto the full silent video
```
python audio/mix.py --project projects/sun-vanished --video projects/sun-vanished/build/video_silent.mp4 --out projects/sun-vanished/build/mixed.mp4
ffmpeg -y -i projects/sun-vanished/build/video_silent.mp4 -i projects/sun-vanished/build/mixed.mp4 -map 0:v:0 -map 1:a:0 -c copy -movflags +faststart ../../justinclips/shorts/sun-vanished/video.mp4
```
mix.py masters to -14 LUFS / TP <= -1.5 (preview measured **-14.7 LUFS, true peak -1.2 dBFS**). In the preview mix.py's own mp4 had 863
frames (it trims 1), so the final is the full silent render (864 frames) with the mixed audio stream copied in.
Check: `ffprobe -v error -count_frames -show_entries stream=nb_read_frames -of csv=p=0 video.mp4` -> 864.
Then `sha256sum video.mp4 > video.sha256` and set `STATE: ready`.

Inputs committed: `input/voiceover.wav` (git add -f), `timeline/words.json`, `story/shots.json`, scenes. Music/sfx: the kit's committed
`kits/toon3d/audio` wavs (`toon3d:mystery` bed + sfx cues on words). Python needs numpy + scipy for mix.py.

## What was checked (preview `preview/sun_vanished_preview_540x960.mp4`, sheet `preview/contact_sheet.png`)
- **Frame 1** = the toon Sun already pulsing in space, with a smug little Earth below it. It pops out of existence on "vanished" (sparkle + flash).
  Line 1 "Imagine the Sun just vanished." (5 words), then "You wouldn't know for 8 minutes." (the claim within 3.4 s).
- **Twist** "Even gravity takes 8 minutes to get the news." at 4.1 s (a ripple and a little envelope race to Earth).
- New visual every 1-3 s (17 shots). Escalations: sky still normal -> Earth circles nothing -> lights out -> the Moon goes dark -> Earth flies off -> the planet freezes.
- **BEANMEN beat:** HERO "Wait, how?" (???) -> Dr Lin: "You see, gravity is not instant either." (chalkboard).
- **Effects:** sunny sky preset + god rays for the picnic, a starry night look for the dark shots, a blue tint + snow for the freeze; reactions after every reveal
  (???, !, sweat, hearts, sparkle, stars, shake, flash, speed lines, spotlight, glow); 1 INSERT card (bigtext "8 MIN 20 S"); whipBlur / iris / flash / dissolve
  transitions; music bed `toon3d:mystery` + sfx on words (pop on "vanished", ding on "news", bell on "8", boom on "lights out", glass on "freezes").
- **Captions** 1-3 words at 66 % height, clear of the bottom title zone and the right button column (red zones on panels 1 and 10). They show "8"; the voice says "eight" (whisper: "eight minutes" every time).
- **Payoff** "So that last bit of sunshine you saw... was already 8 minutes old." at 30.1-33.9 s (Mina holds up 8:20). Closer "Subscribe for more." 1.1 s.
  **Last frame == frame 1** (b17 replays the opening space shot up to its t=0: seamless loop).
- Softened: "Imagine" (the Sun can't vanish); 8 min 20 s on the card is labelled "average"; cooling said as "a few weeks" (IFLScience: ~20 days to freezing).
- Preview render in the cloud: 540x960, 3m18s (SwiftShader, 4 workers).

Nothing was posted, uploaded or logged into.
