STATE: ready

# Mike the Headless Chicken: status

- `video.mp4`: 1080×1920, 24 fps, 634 frames, 26.41 s, H.264 + AAC, 12 MB. sha256 in `video.sha256`. Rendered fully in the cloud (SwiftShader, 4 workers, 7m47s).
- Audio: `audio/mix.py` (music `toon3d:curious` −19 dB, 34 SFX cues) → **−14.4 LUFS integrated, true peak −1.3 dBTP**. `build/mix.wav` was muxed onto the full silent render with `-c:v copy` (634 frames kept), as for the earlier jail-break Shorts.
- Voice: Chatterbox D2 (exaggeration 0.3, cfg 0.3), 7 lines, all pass Whisper QA (seed 7, with seed 11 on three parts; see `project/input/voiceover.lines.json`). Word alignment 63/64; Whisper smeared "choked"/"Fruita", so those two word times in `project/timeline/words.json` were set by hand from the per-line VO timings.
- Jail-break rules: checklist at the top of `script.md`. Frame 1 = Mike strutting on stage under the spotlight + top caption "and went on tour" + caption "This chicken" (see `contact_sheet.png`, first tile). Loop: the festival statue hard-cuts back to the stage.
- Tone guard check (contact sheet + stills): no blood, no gore, no wound. The stump is a clean feathered dome with a bandage collar, the axe is only ever held up, the x-ray is a line diagram with no head drawn, and the death is a lamp clicking off.
- Fact note: Wikipedia/BBC say the *syringes* were left at the sideshow. The VO keeps the brief's "misplaced the eyedropper" (see `sources.md`).
- Project source in `project/` (runs as `whatif/aitrends-2d-studio/projects/mike-headless-chicken` in the Toon 3D kit from `origin/iawaken/toon3d-fx`).

Re-render, from whatif/aitrends-2d-studio (Linux: `export CHROMIUM_PATH=/opt/pw-browsers/chromium`):
    node render.mjs --project projects/mike-headless-chicken --out projects/mike-headless-chicken/build/video_silent.mp4 --workers 4
    python3 audio/mix.py --project projects/mike-headless-chicken --video projects/mike-headless-chicken/build/video_silent.mp4 --out projects/mike-headless-chicken/out/video_mixpy.mp4
    ffmpeg -i projects/mike-headless-chicken/build/video_silent.mp4 -i projects/mike-headless-chicken/build/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -movflags +faststart video.mp4

Not posted or uploaded anywhere.
