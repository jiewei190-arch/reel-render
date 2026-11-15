STATE: ready

# Oregon's Exploding Whale: status

- `video.mp4`: 1080×1920, 24 fps, 620 frames, 25.81 s, H.264 + AAC, 17 MB. sha256 in `video.sha256`. Rendered fully in the cloud (SwiftShader, 4 workers, 9m46s).
- Audio: `audio/mix.py` (music `toon3d:upbeat` −19 dB, 40 SFX cues) → **−14.1 LUFS integrated, true peak −1.4 dBTP**. mix.py's own mux dropped 1 frame, so `build/mix.wav` was muxed onto the full silent render with `-c:v copy` (620 frames kept).
- Voice: Chatterbox D2 (exaggeration 0.3, cfg 0.3), 7 lines, all passed Whisper QA on seed 7 (`project/input/voiceover.lines.json`). Word alignment 66/66.
- Jail-break rules: checklist at the top of `script.md`. Frame 1 = the KA-BOOM with chunks flying + top caption "with half a ton of dynamite" + caption "In 1970," (see `contact_sheet.png`, first tile). Loop: the park sign hard-cuts back to the KA-BOOM.
- Frame-1 fix: the opening white flash washed out frame 1, so it was cut to 18 %, and frames 0–5 were re-rendered at full res and spliced into the silent master (re-encoded crf 16).
- Fact fix during the build: Wikipedia gives no distance for the car (it says flesh flew "up to 800 feet"), so the VO says "**reportedly** flew a quarter mile" (other accounts put the car a quarter mile away). See `sources.md`.
- Project source (scenes, shots, config, voice + timeline) is in `project/`. It runs inside the Toon 3D kit from `origin/iawaken/toon3d-fx` as `whatif/aitrends-2d-studio/projects/exploding-whale`.

Re-render, from whatif/aitrends-2d-studio on a toon3d-fx checkout with `project/` copied to projects/exploding-whale (Linux: `export CHROMIUM_PATH=/opt/pw-browsers/chromium`):
    node render.mjs --project projects/exploding-whale --out projects/exploding-whale/build/video_silent.mp4 --workers 4
    python3 audio/mix.py --project projects/exploding-whale --video projects/exploding-whale/build/video_silent.mp4 --out projects/exploding-whale/out/video_mixpy.mp4
    ffmpeg -i projects/exploding-whale/build/video_silent.mp4 -i projects/exploding-whale/build/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -movflags +faststart video.mp4

Not posted or uploaded anywhere.
