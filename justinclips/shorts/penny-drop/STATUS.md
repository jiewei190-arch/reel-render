STATE: ready

# Justin clips Short #20: penny-drop ("Could a Penny From a Skyscraper Kill You? 🪙")
Branch `justinclips/batch3-c`. Project: `whatif/aitrends-2d-studio/projects/penny-drop` (13 shots, Toon 3D + BEANMEN FX).
Rendered in the cloud (the owner's PC was unreachable): SwiftShader, 4 workers, 9m44s.

## Final file
- `video.mp4`: 1080x1920, 24 fps, **787 frames, 32.79 s**, H.264 + AAC 192k 48 kHz, 24.5 MB. `video.sha256` alongside.
- Loudness measured on the final file: **-14.2 LUFS, true peak -1.6 dBTP**.
- Preview checked first: `preview_penny-drop.mp4` (540x960, mixed) + `contact_penny-drop.png` (Shorts UI zones tinted red).

## How it was made (from `whatif/aitrends-2d-studio`)
```
node render.mjs --project projects/penny-drop --workers 4 --out projects/penny-drop/build/video_silent.mp4
python3 audio/mix.py --project projects/penny-drop --video projects/penny-drop/build/video_silent.mp4 --out projects/penny-drop/build/mix_check.mp4
ffmpeg -y -i projects/penny-drop/build/mix.wav -af "volume=0.5dB,alimiter=limit=0.82:level=false" -ar 48000 projects/penny-drop/build/mix_final.wav
ffmpeg -y -i projects/penny-drop/build/video_silent.mp4 -i projects/penny-drop/build/mix_final.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -movflags +faststart ../../justinclips/shorts/penny-drop/video.mp4
```
mix.py alone: -14.5 LUFS / TP -1.5. The mux uses the full silent render with `-c:v copy` and no `-shortest` (all 787 frames kept).

## Checks done
- Line 1 "You drop a penny off the Empire State Building." (9 words), frame 1 = the penny already leaving the HERO's hand over the parapet; twist "It won't." at 5.4 s; "Wait, how?" -> "You see," beat; escalations 50 ft / 25 mph / 208 mph-without-air; 2 insert cards (counter ~25 MPH, versus 208 vs 25); payoff "flick on the forehead... not even a hard one" 23.6-28.7 s; closer "Subscribe for more." 31.31-32.2 s (<1.5 s); last frame = the frame-1 deck framing with a new penny in hand (loop).
- Numbers voiced "fifty / twenty-five / two hundred and eight" (whisper: "50", "25", "208"); captions show 50, 25, 208.
- Captions 1-3 words at 66 % height, clear of the Shorts bottom bar and right-side buttons. Reaction FX after every reveal (!, ???, sweat, sparkle, stars, hearts, shake, flash); whipBlur / iris / flash transitions; music `toon3d:curious` + 32 sfx cues.
- Sources: `sources.md` (Scientific American, quoting physicist Louis Bloomfield). Nobody hurt: the penny bounces off TOMAS's forehead with cartoon stars.
- Nothing posted, uploaded or logged into.
