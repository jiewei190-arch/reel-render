STATE: ready

# Tulip Mania: status

- `video.mp4`: 1080×1920, 24 fps, 710 frames, 29.58 s, H.264 + AAC, 15.9 MB. sha256 in `video.sha256`. Rendered fully in the cloud (SwiftShader, 3 workers, 13m56s).
- Audio: kit `audio/mix.py` (music `toon3d:upbeat` −19 dB, ~45 SFX cues) → **−14.3 LUFS integrated, true peak −1.4 dBTP**. Muxed with `-c:v copy` and no `-shortest` (all 710 frames kept).
- Voice: Chatterbox D2 (exaggeration 0.3, cfg 0.3), 8 lines, all passed Whisper QA on seed 7. Script alignment 69/70 words. Whisper on the final mix reads the script word for word.
- Checks: frame 1 = the tulip slamming the scale + top caption (see `contact_sheet.png`); the last frame (historian + "0 BANKRUPT") hard-cuts back to frame 1. Checklist and tone guards are at the top of `script.md`, and every claim is in `sources.md`.
- Project source (`project/`): `lines.json` (the per-line script), `story/shots.plan.json` (every cut anchored to a line/word of the voice), `scenes/` (Toon 3D scene code), `config.json`; generated: `input/` (voice), `timeline/` (word timings), `story/shots.json` (absolute times).

## Swap the voice (one command)
From the repo root, with a toon3d-fx kit checkout and the Chatterbox venv (`whatif/voice/setup_chatterbox.sh` from origin/voice-test):

    export KIT=/path/to/toon3d-fx/whatif/aitrends-2d-studio CHROMIUM_PATH=/opt/pw-browsers/chromium   # (PC: RENDER_ARGS="--gl gpu", no CHROMIUM_PATH)
    bash justinclips/tools/revoice/rebuild.sh tulip-mania --engine files --dir /path/to/new_voice_lines

`--dir` holds one file per line of `project/lines.json`, named `01.wav … 08.wav` (mp3/flac ok; a line with "..." may be split `03a.wav, 03b.wav`). Any TTS works. The command re-voices, re-aligns words, re-times every shot from the new voice (`retime.py`), renders, mixes to −14 LUFS, muxes, checks loudness/TP, and rewrites `video.mp4`, `video.sha256`, `contact_sheet.png` and the generated files in `project/`. Re-render with the current D2 voice: drop `--engine files --dir …` (default engine `chatterbox_d2`). Preview only: add `--sheet-only`. Details: `justinclips/tools/revoice/README.md`.

Not posted or uploaded anywhere.
