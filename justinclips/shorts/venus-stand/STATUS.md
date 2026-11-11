STATE: ready

# Justin clips Short #21: venus-stand ("What If You Stood on Venus? 🌋")
Branch `justinclips/batch3-c`. Project: `whatif/aitrends-2d-studio/projects/venus-stand` (13 shots, Toon 3D + BEANMEN FX, Venus mood light).
Rendered in the cloud (the owner's PC was unreachable): SwiftShader, 4 workers, 10m35s.

## Final file
- `video.mp4`: 1080x1920, 24 fps, **855 frames, 35.63 s**, H.264 + AAC 192k 48 kHz, 17.4 MB. `video.sha256` alongside.
- Loudness measured on the final file: **-14.2 LUFS, true peak -1.5 dBTP**.
- Preview checked first: `preview_venus-stand.mp4` (540x960, mixed). `contact_venus-stand.png` = 18 frames of the FINAL video (Shorts UI zones tinted red).
  One fix after the preview: the "(Mercury is closer to the Sun)" note was moved up under the versus title (it overlapped the captions).

## How it was made (from `whatif/aitrends-2d-studio`)
```
node render.mjs --project projects/venus-stand --workers 4 --out projects/venus-stand/build/video_silent.mp4
python3 audio/mix.py --project projects/venus-stand --video projects/venus-stand/build/video_silent.mp4 --out projects/venus-stand/build/mix_check.mp4
ffmpeg -y -i projects/venus-stand/build/mix.wav -af "volume=0.5dB,alimiter=limit=0.82:level=false" -ar 48000 projects/venus-stand/build/mix_final.wav
ffmpeg -y -i projects/venus-stand/build/video_silent.mp4 -i projects/venus-stand/build/mix_final.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -movflags +faststart ../../justinclips/shorts/venus-stand/video.mp4
```
mix.py alone: -14.5 LUFS / TP -1.5. The mux uses the full silent render with `-c:v copy` and no `-shortest` (all 855 frames kept).

## Checks done
- Line 1 "On Venus, you'd be crushed, cooked and dissolved." (8 words), frame 1 = the suited HERO already steaming on Venus; twist "No. All at once." at 4.6 s; "Wait, how?" (TOMAS) -> "You see," beat; escalations 90+ x pressure (soda can crumples) / 3,000 ft underwater / 464 °C + melting lead / acid clouds; 3 insert cards (464°C counter, Venus vs Mercury versus, 127 MIN counter); payoff "127 minutes" 31.9-33.5 s; closer "Subscribe for more." 34.14-35.0 s (<1.5 s); the beam drops the HERO back and the last frame is the frame-1 framing (loop).
- Numbers voiced "ninety / three thousand / four hundred and sixty-four / one hundred and twenty-seven" (whisper: "90", "3,000", "464", "127"); captions show 90, 3,000, 464, 127.
- Captions 1-3 words at 66 % height, clear of the Shorts bottom bar and right-side buttons. Reaction FX after every reveal (!, ???, sweat, stars, sparkle, hearts, shake, flash); whipBlur / iris / flash transitions; music `toon3d:tense` + kit sfx cues on words.
- Tone guard: the HERO is never hurt (the suit steams and drips; he is beamed out). Sources in `sources.md` (NASA x3, Guinness).
- Nothing posted, uploaded or logged into.
