STATE: ready

# Peter the Great's Beard Tax — status

- `video.mp4`: 1080×1920, 24 fps, 505 frames, 21.04 s, H.264 + AAC, 14 MB. sha256 in `video.sha256`. Rendered fully in the cloud (SwiftShader, 4 workers, 9m40s).
- Audio: mix.py (music `toon3d:upbeat`, 26 SFX cues) → −14.5 LUFS integrated, true peak −1.4 dBTP. mix.py's own mux dropped 2 frames, so `build/mix.wav` was muxed onto the full silent render with `-c:v copy` (505 frames kept).
- Voice: Chatterbox D2 (exag 0.3, cfg 0.3), 8 lines, all passed Whisper QA on seed 7; per-line times in `projects/beard-tax/input/voiceover.lines.json`. Word alignment 57/57.
- Jail-break rules: checklist at the top of `script.md`. Frame 1 = scissors snapping mid-chase + the top caption (see `contact_sheet.png`, first tile).
- Fact fix during the build: the "useless burden" inscription is on the later rhomboid token (1724/25), so s08 shows a diamond-shaped token, labelled "A LATER TOKEN SAYS:" (see sources.md).

Re-render, from whatif/aitrends-2d-studio (Linux: `export CHROMIUM_PATH=/opt/pw-browsers/chromium`):
    node render.mjs --project projects/beard-tax --out projects/beard-tax/build/video_silent.mp4 --workers 4
    python3 audio/mix.py --project projects/beard-tax --video projects/beard-tax/build/video_silent.mp4 --out projects/beard-tax/out/video.mp4
    ffmpeg -i projects/beard-tax/build/video_silent.mp4 -i projects/beard-tax/build/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -movflags +faststart video.mp4

Not posted anywhere.
