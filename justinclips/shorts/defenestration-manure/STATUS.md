STATE: ready

# The Defenestration of Prague: status

- `video.mp4`: 1080×1920, 24 fps, 673 frames, 28.04 s, H.264 + AAC, 17 MB. sha256 in `video.sha256`. Rendered fully in the cloud (SwiftShader, 3 workers, 11m30s).
- Audio: kit `audio/mix.py` (music `toon3d:upbeat` −19 dB, ~40 SFX cues). The single-pass master came out at −14.6 LUFS, so a two-pass linear loudnorm was applied to `build/mix.wav` → **−14.0 LUFS integrated, true peak −1.3 dBTP** (rebuild.sh now does this automatically). Muxed with `-c:v copy` (all 673 frames kept).
- Voice: Chatterbox D2 (exaggeration 0.3, cfg 0.3), 10 lines. Whisper QA passes 9. Line 10 is flagged only for the spelling "Barron"; the audio is right, and Whisper on the final mix reads every word of the script, including "Baron of High Fall". Script alignment 72/72 words.
- Checks: frame 1 = the three officials mid-fall + top caption (see `contact_sheet.png`); the last frame ("BARON OF HIGH FALL") hard-cuts back to frame 1. Checklist and tone guards are at the top of `script.md`, and every claim and hedge is in `sources.md`.
- Build note: this Short's render finished, then the tail of `rebuild.sh` (which I was editing at the time) failed. Mix, mux, checks, checksum and copy-back were run by hand with the same commands.
- Project source (`project/`): `lines.json`, `story/shots.plan.json`, `scenes/`, `config.json`; generated: `input/` (voice), `timeline/`, `story/shots.json`.

## Swap the voice (one command)
From the repo root, with a toon3d-fx kit checkout and the Chatterbox venv (`whatif/voice/setup_chatterbox.sh` from origin/voice-test):

    export KIT=/path/to/toon3d-fx/whatif/aitrends-2d-studio CHROMIUM_PATH=/opt/pw-browsers/chromium   # (PC: RENDER_ARGS="--gl gpu", no CHROMIUM_PATH)
    bash justinclips/tools/revoice/rebuild.sh defenestration-manure --engine files --dir /path/to/new_voice_lines

`--dir` holds one file per line of `project/lines.json`, named `01.wav … 10.wav` (mp3/flac ok; a line with "..." may be split `03a.wav, 03b.wav`). The command re-voices, re-aligns words, re-times every shot from the new voice, renders, mixes to −14 LUFS, muxes, checks, and rewrites `video.mp4`, `video.sha256`, `contact_sheet.png` and the generated files. Current D2 voice: drop `--engine files --dir …`. Preview only: `--sheet-only`. Details: `justinclips/tools/revoice/README.md`.

Not posted or uploaded anywhere.
