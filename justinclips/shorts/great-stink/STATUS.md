STATE: ready

# The Great Stink: status

- `video.mp4`: 1080×1920, 24 fps, 644 frames, 26.83 s, H.264 + AAC, 15 MB. sha256 in `video.sha256`. Rendered fully in the cloud (SwiftShader, 4 workers, 9m23s).
- Audio: kit `audio/mix.py` (music `toon3d:upbeat` −19 dB, ~40 SFX cues) → **−14.1 LUFS integrated, true peak −1.2 dBTP**. Muxed with `-c:v copy` (all 644 frames kept).
- Voice: Chatterbox D2 (exaggeration 0.3, cfg 0.3), 9 lines, all pass Whisper QA. Line 5 now reads "soaked the curtains **with** chemicals": with "in", all three seeds were heard as "curtains and chemicals". Whisper on the final mix reads the script word for word.
- Fact fix: the sewer bill took about seven weeks (tabled 15 June, law 2 August 1858, per Wikipedia), not the "18 days" some sites repeat. See `sources.md`.
- Checks: frame 1 = MPs with clothespins in the green-hazed chamber + top caption (see `contact_sheet.png`); the last frame (hi-vis worker, "STILL IN USE") hard-cuts back to frame 1. Checklist and tone guards are at the top of `script.md`.
- Project source (`project/`): `lines.json`, `story/shots.plan.json`, `scenes/`, `config.json`; generated: `input/` (voice), `timeline/`, `story/shots.json`.

## Swap the voice (one command)
From the repo root, with a toon3d-fx kit checkout and the Chatterbox venv (`whatif/voice/setup_chatterbox.sh` from origin/voice-test):

    export KIT=/path/to/toon3d-fx/whatif/aitrends-2d-studio CHROMIUM_PATH=/opt/pw-browsers/chromium   # (PC: RENDER_ARGS="--gl gpu", no CHROMIUM_PATH)
    bash justinclips/tools/revoice/rebuild.sh great-stink --engine files --dir /path/to/new_voice_lines

`--dir` holds one file per line of `project/lines.json`, named `01.wav … 09.wav` (mp3/flac ok; a line with "..." may be split `03a.wav, 03b.wav`). The command re-voices, re-aligns words, re-times every shot from the new voice, renders, mixes to −14 LUFS, muxes, checks, and rewrites `video.mp4`, `video.sha256`, `contact_sheet.png` and the generated files. Current D2 voice: drop `--engine files --dir …`. Preview only: `--sheet-only`. Details: `justinclips/tools/revoice/README.md`.

Not posted or uploaded anywhere.
