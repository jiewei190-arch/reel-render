STATE: ready

# Poyais, the country that didn't exist: status

- `video.mp4`: 1080×1920, 24 fps, 665 frames, 27.7 s, H.264 + AAC. sha256 in `video.sha256`. Rendered fully in the cloud (SwiftShader, 4 workers).
- Audio: `audio/mix.py` (music `toon3d:mystery` −19 dB, word-cued BEANMEN SFX; the "It went very badly" shot has only a rain bed) + a linear loudnorm pass → **−14.1 LUFS integrated, true peak −1.8 dBTP** (`build_report.json`).
- Voice: Chatterbox D2 (exaggeration 0.3, cfg 0.3), 8 lines, all passed Whisper QA (line 3 on seed 11: seed 7 said "his" for "its"; line 8 on seed 64: seeds 7-57 were heard as "McGregor"; the rest seed 7). Per-line timing in `lines.timing.json`. Whisper on the final video reads the script back (it spells Poyais "Pojais").
- Jail-break + vidIQ rules: checklist at the top of `script.md`. Frame 1 = MacGregor mid-sale with banknotes raining, top caption "and London / paid him for it" for 3.2 s, line 1 = the claim. The payoff (ACQUITTED) hard-cuts back to frame 1. No CTA or end card.
- TONE GUARD (brief): the settlers' deaths stay off screen and out of the VO. The VO says only "It went very badly." over an empty, grey, rainy shore, with no people and no gag. Build fix: s11 first came in with a dip that let the previous shot's "NO COUNTRY" stamp fade over that line, so s11 is now a hard cut. Frames 528-563 were re-rendered and spliced into the silent master (re-encoded crf 16); a full re-render gives the same result.
- Facts + hedges: `sources.md` ("about" £200,000, "about" 250 settlers, '"ruler"' in quotes; the deaths are stated once in the description, as the sources give them).
- Cut lengths 1.0-2.7 s (17 shots).

## Re-render / swap the voice (one command)
The narration is `lines.json`; every cut is anchored to the voice in `project/story/shots.tpl.json`, so a new voice re-times the whole Short.
From the repo root, with a toon3d-fx kit checkout (setup in `justinclips/tools/README.md`):

    python3 justinclips/tools/shortbuild.py justinclips/shorts/poyais-fake-country --kit <toon3d-fx>/whatif/aitrends-2d-studio --voice '<engine>'

`--voice` = `chatterbox_d2` (default, current D2), `cmd:<tts command with {text} and {out}>`, or `wavdir:<folder of line_01.wav ...>`.
It rewrites `project/input/voiceover.*`, `lines.timing.json`, `project/story/shots.json`, `contact_sheet.png`, `video.mp4`, `video.sha256`.

Not posted or uploaded anywhere.
