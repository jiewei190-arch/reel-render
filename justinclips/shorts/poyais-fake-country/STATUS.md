STATE: ready

# Poyais, the country that didn't exist: status

- `video.mp4`: 1080×1920, 24 fps, 531 frames, **22.1 s**, H.264 + AAC. sha256 in `video.sha256`. Re-voiced (rv3) and re-rendered fully in the cloud (SwiftShader, 3 workers).
- Audio: `audio/mix.py` (music `toon3d:mystery` −19 dB, word-cued BEANMEN SFX; the "It went very badly" shot has only a rain bed) → **−14.2 LUFS integrated, true peak −2.7 dBTP** on the final mp4 (`build_report.json`).
- Voice: **dia #8**: Dia-1.6B-0626 (Apache-2.0) via `justinclips/tools/dia/tts_any.py`, prompt `dia_prompt_kokoro_am_puck.wav` + the lineup prompt text, `--dia-tail " (laughs)"` (cut after the last word; no laugh in the final audio), cfg 3.0, temp 1.8, top-p 0.9, top-k 45, **seed 11**. Seed 7 was tried first: without a respelling Whisper heard "Poyais" as "Poitiers", so `lines.json` now has `"pronounce": {"dia": {"Poyais": "Poy-eye-iss"}}` (captions keep "Poyais"); with it, seed 7 came out at a median pitch of 158 Hz (outside 180-230), so seed 11 was used: **median pitch 223.5 Hz** (reference 08 = 197 Hz on the same pyin measure, 205 Hz in NOTES). Dia reads the script in one pass; `tools/dia/split_lines.py` cut it into `voice_dia/line_NN.wav` at the silences (Whisper word times) for `--voice wavdir:`. Per-line timing in `lines.timing.json`.
- Whisper small.en on the final video: "A man sold a country that didn't exist. In 1822, Gregor MacGregor told London he ruled a land called Poyais. He printed a guidebook, its own money, and sold its government bonds. Investors bought in about 200,000 pounds of them. Then about 250 settlers sailed there. They found jungle, no towns, no capital, no country. It went very badly. MacGregor was later tried for fraud in France and acquitted." Every script word is there. The extra "in" comes from the coin SFX that opens that line (s07): Whisper on the clean voice track reads "Investors bought about 200,000 pounds". Dia runs through the "..." beats instead of holding them.
- Jail-break + vidIQ rules: checklist at the top of `script.md`. Frame 1 = MacGregor mid-sale with banknotes raining, top caption "and London / paid him for it" for 3.2 s, line 1 = the claim. The payoff (ACQUITTED) hard-cuts back to frame 1. No CTA or end card.
- TONE GUARD (brief): the settlers' deaths stay off screen and out of the VO. The VO says only "It went very badly." over an empty, grey, rainy shore, with no people and no gag. Build fix: s11 first came in with a dip that let the previous shot's "NO COUNTRY" stamp fade over that line, so s11 is now a hard cut. Frames 528-563 were re-rendered and spliced into the silent master (re-encoded crf 16); a full re-render gives the same result.
- Facts + hedges: `sources.md` ("about" £200,000, "about" 250 settlers, '"ruler"' in quotes; the deaths are stated once in the description, as the sources give them).
- Cut lengths 0.56-2.43 s (17 shots): Dia is faster than D2, so the voice-anchored cuts got shorter (s05b banknotes 0.56 s, s01 hook shot 0.84 s; the top caption still holds 3.2 s). Captions checked against Whisper on a 10-frame contact sheet and the end frames: in sync. The one dark frame (19.42 s) is the template's dip into s12, caption still on screen; no black or blank frames otherwise.

## Re-render / swap the voice (one command)
The narration is `lines.json`; every cut is anchored to the voice in `project/story/shots.tpl.json`, so a new voice re-times the whole Short.
From the repo root, with a toon3d-fx kit checkout (setup in `justinclips/tools/README.md`):

    python3 justinclips/tools/shortbuild.py justinclips/shorts/poyais-fake-country --kit <toon3d-fx>/whatif/aitrends-2d-studio --venv ~/.venvs/dia --voice wavdir:justinclips/shorts/poyais-fake-country/voice_dia

That is the current voice (dia #8, seed 11, takes in `voice_dia/`). To re-voice with Dia first: `bash justinclips/tools/dia/dia_voice.sh justinclips/shorts/poyais-fake-country 11`.
`--voice` also takes `chatterbox_d2` (old D2), `cmd:<tts command with {text} and {out}>`, or `wavdir:<folder of line_01.wav ...>`.
It rewrites `project/input/voiceover.*`, `lines.timing.json`, `project/story/shots.json`, `contact_sheet.png`, `video.mp4`, `video.sha256`.

Not posted or uploaded anywhere.
