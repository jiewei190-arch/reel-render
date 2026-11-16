STATE: ready

# Lord Byron's college bear: status

- `video.mp4`: 1080×1920, 24 fps, 542 frames, 22.58 s, H.264 + AAC. sha256 in `video.sha256`. Rendered fully in the cloud (SwiftShader, 4 workers).
- Audio: `audio/mix.py` (music `toon3d:upbeat` −19 dB, word-cued BEANMEN SFX) + a linear loudnorm pass → **−14.2 LUFS integrated, true peak −1.8 dBTP** (`build_report.json`).
- Voice: Chatterbox D2 (exaggeration 0.3, cfg 0.3), 7 lines, all passed Whisper QA (line 1 needed seed 57: seeds 7-42 were heard as "band dogs"; the rest seed 7). Per-line timing in `lines.timing.json`. Whisper on the final video reads the script back word for word (it hears "the rule said" for "the rules said").
- Jail-break + vidIQ rules: checklist at the top of `script.md`. Frame 1 = the bear in a gown + mortarboard already strolling through the quad on a ribbon lead, top caption "and the college / couldn't stop him" up for 3.2 s, line 1 = the claim. No CTA/end card: the payoff (FELLOW badge at the high table) hard-cuts back into frame 1.
- Facts + hedges: `sources.md` ("reportedly" on the no-dogs rule, "around 1807"; the 1807 letter is quoted word for word on screen).
- Build fix: the payoff shot's iris transition held black ~0.3 s on "sit for", so s13 now enters with a flash; that range (frames 504-541) was re-rendered and spliced into the silent master (re-encoded crf 16). A full re-render gives the same result.
- Cut lengths 0.9-2.4 s (14 shots); the 0.9-1.2 s ones are hook/punch cuts.

## Re-render / swap the voice (one command)
The narration is `lines.json`; every cut is anchored to the voice in `project/story/shots.tpl.json`, so a new voice re-times the whole Short.
From the repo root, with a toon3d-fx kit checkout (setup in `justinclips/tools/README.md`):

    python3 justinclips/tools/shortbuild.py justinclips/shorts/byron-pet-bear --kit <toon3d-fx>/whatif/aitrends-2d-studio --voice '<engine>'

`--voice` = `chatterbox_d2` (default, current D2), `cmd:<tts command with {text} and {out}>`, or `wavdir:<folder of line_01.wav ...>`.
It rewrites `project/input/voiceover.*`, `lines.timing.json`, `project/story/shots.json`, `contact_sheet.png`, `video.mp4`, `video.sha256`.

Not posted or uploaded anywhere.
