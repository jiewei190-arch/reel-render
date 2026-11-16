STATE: ready

# The rats who got a lawyer: status

- `video.mp4`: 1080×1920, 24 fps, 494 frames, **20.6 s**, H.264 + AAC. sha256 in `video.sha256`. Re-voiced (rv3) and re-rendered fully in the cloud (SwiftShader, 4 workers).
- Audio: `audio/mix.py` (music `toon3d:curious` −19 dB, word-cued BEANMEN SFX) → **−14.0 LUFS integrated, true peak −3.0 dBTP** on the final mp4 (`build_report.json`).
- Voice: **dia #8**: Dia-1.6B-0626 (Apache-2.0) via `justinclips/tools/dia/tts_any.py`, prompt `dia_prompt_kokoro_am_puck.wav` + the lineup prompt text, `--dia-tail " (laughs)"` (cut after the last word; no laugh in the final audio), cfg 3.0, temp 1.8, top-p 0.9, top-k 45, **seed 3**, **median pitch 223.5 Hz** (reference 08 = 197 Hz on the same pyin measure, 205 Hz in NOTES). Seeds tried: 7 (142 Hz, flat), 11 (234 Hz), 23 (255 Hz); on every seed Whisper heard "The owners said" as "The owner said" (the two s sounds merge), so `lines.json` has the Dia-only respelling `"pronounce": {"dia": {"owners": "owners,"}}` (a tiny pause, no word change; captions unchanged). With it, seed 3 says every word. A second respelling, "Autun" → "Oh-tun", was tried and dropped (Whisper heard "a ton", pitch 238 Hz). Dia reads the script in one pass; `tools/dia/split_lines.py` cut it into `voice_dia/line_NN.wav` at the silences (Whisper word times) for `--voice wavdir:`. Per-line timing in `lines.timing.json`.
- Whisper small.en on the clean voice track: "Rats once got sued, and they got a lawyer, France, the early 1500s. Rats reportedly ate the barley around Auton, so a court summoned the Rats. The Rats did not show up. Their lawyer said that was unfair. His clients lived in lots of villages. Then he said they couldn't come safely because of the town's cats. He wanted the cats kept indoors. The owners said no, so the case was reportedly thrown out." On the final video (with music and SFX) it reads the same words but writes Autun as "autumn". **Listen to "around Autun" (Autun at about 5.3-6.1 s).** Dia runs through the "..." beats instead of holding them.
- Jail-break + vidIQ rules: checklist at the top of `script.md`. Frame 1 = rats in tiny hats in the dock, the official shocked, top caption "and he took the case / very seriously" for 3.2 s, line 1 = the claim. The payoff (CASE THROWN OUT + "(reportedly)") hard-cuts back to frame 1. No CTA or end card.
- Facts + hedges: `sources.md`. The brief's suggested line "and their lawyer won" was not used, because the outcome isn't firmly recorded (one source says dismissed, others say the record ends). The VO says "reportedly thrown out".
- Cut lengths 0.86-2.02 s (13 shots): Dia is faster than D2, so the voice-anchored cuts got shorter (s01 hook shot 0.86 s; the top caption still holds 3.2 s). Length 20.6 s is near the 20 s floor because Dia reads quickly. Captions checked against Whisper on a 10-frame contact sheet and the end frames: in sync, ending on CASE THROWN OUT. The one dark frame (8.0 s) is the template's dip into s06, caption still on screen; no black or blank frames otherwise.

## Re-render / swap the voice (one command)
The narration is `lines.json`; every cut is anchored to the voice in `project/story/shots.tpl.json`, so a new voice re-times the whole Short.
From the repo root, with a toon3d-fx kit checkout (setup in `justinclips/tools/README.md`):

    python3 justinclips/tools/shortbuild.py justinclips/shorts/rats-sued-in-court --kit <toon3d-fx>/whatif/aitrends-2d-studio --venv ~/.venvs/dia --voice wavdir:justinclips/shorts/rats-sued-in-court/voice_dia

That is the current voice (dia #8, seed 3, takes in `voice_dia/`). To re-voice with Dia first: `bash justinclips/tools/dia/dia_voice.sh justinclips/shorts/rats-sued-in-court 3`.
`--voice` also takes `chatterbox_d2` (old D2), `cmd:<tts command with {text} and {out}>`, or `wavdir:<folder of line_01.wav ...>`.
It rewrites `project/input/voiceover.*`, `lines.timing.json`, `project/story/shots.json`, `contact_sheet.png`, `video.mp4`, `video.sha256`.

Not posted or uploaded anywhere.
