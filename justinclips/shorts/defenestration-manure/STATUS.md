STATE: ready

# The Defenestration of Prague: status

- **Re-voiced Nov 16 with voice #8 (Dia).** `video.mp4`: 1080×1920, 24 fps, 573 frames, **23.88 s**, H.264 + AAC. sha256 in `video.sha256`. Rendered fully in the cloud (SwiftShader, 4 workers, 9m21s).
- **Voice: dia #8.** Dia-1.6B-0626 (Apache-2.0) via `tts_any.py` from `justinclips/voice_lineup/`, prompt `prompts/dia_prompt_kokoro_am_puck.wav` + the lineup prompt text, `--dia-tail " (laughs)"` (cut off after "Fall"; no laugh in the audio), cfg 3.0, temp 1.8, top-p 0.9, top-k 45. **Seed 11.** Median pitch **178.8 Hz** (reference #8: 204 Hz on the same meter; window roughly 180-230). One pass over the whole script, cut into `01.wav … 10.wav` with `justinclips/tools/dia_split.py`, then `rebuild.sh --engine files`. Exact settings and cut points: `voice_dia8.json`.
  - Seeds tried: 7 → 139 Hz and 42 → 133 Hz (Dia's lower voice, not the #8 guy), 23 → 271 Hz (too high), 11 → 178.8 Hz with every word right: **kept**. It is the closest to the #8 voice of the four, at the bottom edge of the window. A respelling "Prahg" (seed 11) made it worse (135 Hz, "Prog") and was dropped, so `lines.json` has no `pronounce` entries.
  - Pacing: gap between lines 0.3 s (`project/lines.json` `pacing.gap`, was 0.2 for D2); "..." = 0.4 s beat. Words unchanged.
- **Whisper (small.en, on the final video):** "Three men got thrown out of a castle window. Prague 1618, angry nobles stormed the castle. They grabbed two royal governors and their secretary and out they went. About 70 feet down, all three survived. Catholic said angels caught them. Later pamphlets said they landed in a pile of manure. Historians think that part was probably made up, but the secretary got a noble title. Baron von Hohenfall. Baron of Highfall." Every word is there. "Catholic said" is Whisper merging the two s sounds of "Catholics said" (on the voice track alone it reads "Catholics said"), and "Highfall" is how it spells "High Fall".
- **Scene/mix edits for the new voice** (in `project/story/shots.plan.json`):
  - s03's whip swoosh now starts 0.4 s before the cut. Dia says "Prague" right at the cut, and the swoosh on top of it made Whisper hear "Frogs" (the voice alone read "Prague").
  - s08 (dip) and s12 (iris, 0.4 s) now enter with a 0.12 s flash. They held 1 and 3 near-black frames (the D2 cut had the same two). Same fix byron-pet-bear got.
- **Audio:** kit `audio/mix.py` (music `toon3d:upbeat`, ~40 SFX cues) + two-pass linear loudnorm (rebuild.sh now redoes it when the mix is > 0.1 LU off; it used to skip ≤ 0.3 LU, which left this mix at −14.3 after AAC, so this pass was run by hand with the same command) → **−14.0 LUFS integrated, true peak −1.4 dBTP** (ebur128 on `video.mp4`). Muxed with `-c:v copy`.
- **QA (Nov 16):** captions in sync on a 10-frame sheet (e.g. 7.94 s "secretary…" / spoken 7.5-7.9 s, 13.24 s "angels caught" / 13.0-13.3 s, 21.18 s "Baron von" / 21.0-21.2 s); 0 black frames (blackdetect), 0 frames with mean luma < 16; frame 1 = the three officials mid-fall + top caption; the last frame ("BARON OF HIGH FALL") hard-cuts back to frame 1. Shot lengths 0.74-2.46 s (s01 0.98 s, s10 0.74 s are punch cuts).
- Checklist and tone guards are at the top of `script.md`, and every claim and hedge is in `sources.md`.
- Project source (`project/`): `lines.json`, `story/shots.plan.json`, `scenes/`, `config.json`; generated: `input/` (voice), `timeline/`, `story/shots.json`.
- Previous voice: Chatterbox D2 (28.04 s). Replaced.

## Swap the voice (one command)
From the repo root, with a toon3d-fx kit checkout and the Chatterbox venv (`whatif/voice/setup_chatterbox.sh` from origin/voice-test):

    export KIT=/path/to/toon3d-fx/whatif/aitrends-2d-studio CHROMIUM_PATH=/opt/pw-browsers/chromium   # (PC: RENDER_ARGS="--gl gpu", no CHROMIUM_PATH)
    bash justinclips/tools/revoice/rebuild.sh defenestration-manure --engine files --dir /path/to/new_voice_lines

`--dir` holds one file per line of `project/lines.json`, named `01.wav … 10.wav` (mp3/flac ok; a line with "..." may be split `03a.wav, 03b.wav`). The command re-voices, re-aligns words, re-times every shot from the new voice, renders, mixes to −14 LUFS, muxes, checks, and rewrites `video.mp4`, `video.sha256`, `contact_sheet.png` and the generated files. Old D2 voice: drop `--engine files --dir …`. Current voice (#8 Dia, seed 11): render the take with `tts_any.py` (settings in `voice_dia8.json`, add `--wav`), split it with `python justinclips/tools/dia_split.py take.raw.wav justinclips/shorts/defenestration-manure/project/lines.json LINES/ "{n:02d}.wav"` (Dia venv), then `--engine files --dir LINES/`, using `VPY=~/.venvs/dia/bin/python`. Preview only: `--sheet-only`. Details: `justinclips/tools/revoice/README.md`.

Not posted or uploaded anywhere.
