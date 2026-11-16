STATE: ready

# The rats who got a lawyer: status

- `video.mp4`: 1080×1920, 24 fps, 658 frames, 27.4 s, H.264 + AAC. sha256 in `video.sha256`. Rendered fully in the cloud (SwiftShader, 4 workers).
- Audio: `audio/mix.py` (music `toon3d:curious` −19 dB, word-cued BEANMEN SFX) + a linear loudnorm pass → **−14.1 LUFS integrated, true peak −1.8 dBTP** (`build_report.json`).
- Voice: Chatterbox D2 (exaggeration 0.3, cfg 0.3), 8 lines, all passed Whisper QA (line 2 on seed 23: seeds 7/11 said "autumn" for "Autun"; line 7 on seed 11: seed 7 said "owner"; the rest seed 7). Per-line timing in `lines.timing.json`. Whisper on the final video reads the script back (it spells Autun "Auton").
- Jail-break + vidIQ rules: checklist at the top of `script.md`. Frame 1 = rats in tiny hats in the dock, the official shocked, top caption "and he took the case / very seriously" for 3.2 s, line 1 = the claim. The payoff (CASE THROWN OUT + "(reportedly)") hard-cuts back to frame 1. No CTA or end card.
- Facts + hedges: `sources.md`. The brief's suggested line "and their lawyer won" was not used, because the outcome isn't firmly recorded (one source says dismissed, others say the record ends). The VO says "reportedly thrown out".
- Cut lengths 1.6-2.5 s (13 shots).

## Re-render / swap the voice (one command)
The narration is `lines.json`; every cut is anchored to the voice in `project/story/shots.tpl.json`, so a new voice re-times the whole Short.
From the repo root, with a toon3d-fx kit checkout (setup in `justinclips/tools/README.md`):

    python3 justinclips/tools/shortbuild.py justinclips/shorts/rats-sued-in-court --kit <toon3d-fx>/whatif/aitrends-2d-studio --voice '<engine>'

`--voice` = `chatterbox_d2` (default, current D2), `cmd:<tts command with {text} and {out}>`, or `wavdir:<folder of line_01.wav ...>`.
It rewrites `project/input/voiceover.*`, `lines.timing.json`, `project/story/shots.json`, `contact_sheet.png`, `video.mp4`, `video.sha256`.

Not posted or uploaded anywhere.
