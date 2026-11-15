STATE: ready

# Struck by Lightning 7 Times — status

- `video.mp4`: 1080×1920, 24 fps, 594 frames, 24.75 s, H.264 + AAC, 9.8 MB. sha256 in `video.sha256`. Rendered fully in the cloud (SwiftShader, 4 workers, 6m41s).
- Audio: mix.py (music `toon3d:tense`, 39 SFX cues) → −14.4 LUFS integrated, true peak −1.5 dBTP. `build/mix.wav` was muxed onto the full silent render with `-c:v copy`, so all 594 frames are kept.
- Voice: Chatterbox D2 (exaggeration 0.3, cfg 0.3), 8 lines, all seed 7. Whisper QA: 8/8 lines matched word for word.
- Length: 24.75 s is inside the 22 s ±3 target. The first take ran 28.7 s, so line 3 was cut to "From 1942 to 1977.", the gaps were tightened, and "Subscribe for more." was dropped (it ran 1.3 s and hurt the loop).
- Jail-break rules: checklist at the top of `script.md`. Frame 1 shows the six bolts on the calm ranger, the STRUCK 7 TIMES stamp and the top caption (see `contact_sheet.png`, first tile).
- Changes from the brief, for MAIN to note: the VO says "He said a storm **cloud** chased him" (the sources say a cloud seemed to follow him, not a bolt). "1 in 10 septillion" is an extrapolation, not a statistic; the VO keeps "about" and adds "By one estimate" (sources.md gives the range of published figures).

Re-render, from whatif/aitrends-2d-studio (Linux: `export CHROMIUM_PATH=/opt/pw-browsers/chromium`; mix.py needs scipy, e.g. `~/.venvs/chatterbox/bin/python`):
    node render.mjs --project projects/lightning-7-times --out projects/lightning-7-times/build/video_silent.mp4 --workers 4
    python3 audio/mix.py --project projects/lightning-7-times --video projects/lightning-7-times/build/video_silent.mp4 --out projects/lightning-7-times/out/video.mp4
    ffmpeg -i projects/lightning-7-times/build/video_silent.mp4 -i projects/lightning-7-times/build/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -movflags +faststart video.mp4

Not posted anywhere.
