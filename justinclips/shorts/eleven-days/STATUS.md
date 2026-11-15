STATE: ready

# Britain Deleted 11 Days — status

- `video.mp4`: 1080×1920, 24 fps, 538 frames, 22.42 s, H.264 + AAC, 12 MB. sha256 in `video.sha256`. Rendered fully in the cloud (SwiftShader, 4 workers, 11m07s).
- Audio: mix.py (music `toon3d:mystery`, SFX per shot) → −14.2 LUFS integrated, true peak −1.3 dBTP; `build/mix.wav` muxed onto the full silent render with `-c:v copy` (all 538 frames kept).
- Voice: Chatterbox D2 (exag 0.3, cfg 0.3), 9 lines. Whisper QA flagged only line 4, because Whisper writes "second" as "2nd"; the audio is correct. Line 8 uses the seed-11 take. Per-line times are in `projects/eleven-days/input/voiceover.lines.json`.
- Jail-break rules: checklist at the top of `script.md`. Frame 1 = calendar pages blasting past the confused sleeper, with the top caption (see `contact_sheet.png`, first tile).

Re-render, from whatif/aitrends-2d-studio (Linux: `export CHROMIUM_PATH=/opt/pw-browsers/chromium`):
    node render.mjs --project projects/eleven-days --out projects/eleven-days/build/video_silent.mp4 --workers 4
    python3 audio/mix.py --project projects/eleven-days --video projects/eleven-days/build/video_silent.mp4 --out projects/eleven-days/out/video.mp4
    ffmpeg -i projects/eleven-days/build/video_silent.mp4 -i projects/eleven-days/build/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -movflags +faststart video.mp4

Not posted anywhere.
