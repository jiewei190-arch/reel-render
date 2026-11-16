STATE: ready

# Lord Byron's college bear: status

- **Re-voiced Nov 16 with voice #8 (Dia).** `video.mp4`: 1080×1920, 24 fps, 492 frames, **20.50 s**, H.264 + AAC. sha256 in `video.sha256`. Rendered fully in the cloud (SwiftShader, 3 workers, 9m36s).
- **Voice: dia #8.** Dia-1.6B-0626 (Apache-2.0) via `tts_any.py` from `justinclips/voice_lineup/`, prompt `prompts/dia_prompt_kokoro_am_puck.wav` + the lineup prompt text, `--dia-tail " (laughs)"` (cut off after "fellowship"; no laugh in the audio), cfg 3.0, temp 1.8, top-p 0.9, top-k 45. **Seed 7.** Median pitch **188 Hz** (reference #8: 204 Hz on the same meter; window 180-230). One pass over the whole script, cut into per-line files at Whisper word times, and re-timed with `shortbuild.py --voice wavdir:`. Exact settings and per-line cut points: `voice_dia8.json`.
  - Seed 11 was also rendered and rejected: 229 Hz (edge of the window), only 16.4 s, and line 3 heard as "had to rule". On seed 7 the "..." beat in line 7 originally carried a breath that Whisper read as "for it"; the cut now ends 20 ms after "for", and the line reads clean.
  - Pacing: Dia reads faster than D2, so the gap between lines is 0.35 s (`"pacing"` in `lines.json`; D2 used 0.2 s). Words unchanged. Each "..." is a 0.4 s held beat.
- **Whisper (small.en, on the final video):** "College banned dogs, so he brought a bear. This is Lord Byron, the poet, at Cambridge around 1807. His college reportedly had a rule, no dogs. But the rule said nothing about bears, so he got a tame bear. He wrote to a friend that it was the finest in the world. Asked what the bear was for, he said it should sit for a fellowship." Word for word, except Whisper writes "the rule said" for "the rules said" (the same habit as on D2; line 4 on its own reads "rules").
- **Audio:** `audio/mix.py` (music `toon3d:upbeat` −19 dB, 24 word-cued SFX) + linear loudnorm → **−14.0 LUFS integrated, true peak −2.0 dBTP** (ebur128 on `video.mp4`; `build_report.json`).
- **QA (Nov 16):** captions in sync on a 10-frame sheet (e.g. 9.09 s "no dogs." / spoken 8.6 s, 11.36 s "about bears." in the beat, 18.18 s "bear was for…" in the beat); 0 black frames (blackdetect), 0 frames with mean luma < 16; frame 1 = the hook (bear on the ribbon lead + top caption); the last frame is the FELLOW high-table payoff and hard-cuts back to frame 1. Shot lengths 0.77-2.1 s (14 shots; s05b 0.77 s, s09 0.91 s and s12 0.96 s are hook/punch cuts).
- Jail-break + vidIQ rules: checklist at the top of `script.md`. No CTA/end card.
- Facts + hedges: `sources.md` ("reportedly" on the no-dogs rule, "around 1807"; the 1807 letter is quoted word for word on screen).
- Previous voice: Chatterbox D2 (22.58 s). Replaced.

## Re-render / swap the voice (one command)
The narration is `lines.json`; every cut is anchored to the voice in `project/story/shots.tpl.json`, so a new voice re-times the whole Short.
From the repo root, with a toon3d-fx kit checkout (setup in `justinclips/tools/README.md`):

    python3 justinclips/tools/shortbuild.py justinclips/shorts/byron-pet-bear --kit <toon3d-fx>/whatif/aitrends-2d-studio --voice '<engine>'

`--voice` = `chatterbox_d2` (default; the old D2 voice), `cmd:<tts command with {text} and {out}>`, or `wavdir:<folder of line_01.wav ...>`.
Current voice (#8 Dia, seed 7), as rendered: run `tts_any.py` (settings in `voice_dia8.json`) with `--wav`, then
`DIA_SPLIT_LINES=mid python justinclips/tools/dia_split.py take.raw.wav justinclips/shorts/byron-pet-bear/lines.json LINES/ "line_{n:02d}.wav"` (Dia venv), then the command above with `--voice wavdir:LINES/`.
It rewrites `project/input/voiceover.*`, `lines.timing.json`, `project/story/shots.json`, `contact_sheet.png`, `video.mp4`, `video.sha256`.

Not posted or uploaded anywhere.
