STATE: ready

# Tulip Mania: status

**Re-voiced with voice #8 (Dia), Nov 16.** Earlier D2 Chatterbox render replaced.

- voice: dia #8 (Dia-1.6B-0626, Apache-2.0; Kokoro am_puck prompt + the #8 prompt text, cfg 3.0, temp 1.8, top-p 0.9, top-k 45, `--dia-tail " (laughs)"` cut off after the last word). **seed: 42**, with `lines.json` `"pronounce": {"dia": {"1630s": "sixteen-thirties", "Holland": "Hollund"}}` (respellings for the TTS only; captions keep the script). One Dia pass over the whole script, median pitch 210 Hz (pyin; the #8 reference reads 199 Hz with the same meter), no "(laughs)" left, voice starts at 0.09 s. Report: `project/input/voice_dia8.json`.
  - Seeds tried (all with the same prompt): 7 = 158 Hz; 23 = 250 Hz and dropped "still in"; 11 = 222 Hz but Whisper slipped on the final mix ("a house" -> "a howl", "tulips" -> "tulip"); 3 = 162 Hz; 5 = 170 Hz, garbled "still in the ground"; 13 = 135 Hz; 17 = 144 Hz; 29 = 170 Hz; 42 = 200 Hz but "Holland, the" came out "Hall in the" (also on 17), so 42 was re-rendered with the "Hollund" respelling: 210 Hz, every word clean.
- Whisper (small.en) on the final mix, word for word (0 wrong words): "A flower once cost more than a house. Holland, the 1630s. Everyone wanted tulips. The rarest ones had wild flame stripes caused by a virus. People traded bulbs still in the ground on paper in taverns. One bulb reportedly sold for 10,000 guilders. A craftsman made about 300 a year. Then in February 1637, the market crashed. But a historian who checked the records couldn't find anyone who went bankrupt." (A second pass, cut sentence by sentence, slips on "on paper" -> "on Patreon" and drops one "a"; very short clips are harder for Whisper.)
- length: **24.88 s** (597 frames, 1080x1920, 24 fps, H.264 + AAC). sha256 in `video.sha256`.
- LUFS: **-14.1 integrated, true peak -2.5 dBTP** (ebur128 on `video.mp4`; `project/qa_revoice.json`).
- QA: captions checked against the voice on a 10-frame sheet (in sync); no blank frames (per-frame luma spread). blackdetect flags 12.67-12.79 s and 21.08-21.21 s: the designed iris transitions into s10 and s14 (`"in": {"type": "iris"}`; the caption stays on screen; the D2 render had the same). Frame 1 = the tulip on the scale outweighing the house + top caption "it was still a bulb / in the dirt"; the last frame (historian + "0 BANKRUPT") hard-cuts back to frame 1. Script unchanged; checklist and tone guards at the top of `script.md`, claims in `sources.md`.
- Pacing: Dia reads fast and runs the "..." beats together, so the narration is split per line and at every "..." (`dia8.py`) and re-joined by `voice.py` with `lines.json` `"pacing": {"gap": 0.35, "lead": 0.05, "beat": 0.6}`. No words changed. Three shots run 0.93-0.99 s (cuts on a word inside a fast line).
- Word timings: `snap_words.py` moves Whisper word edges out of pauses (e.g. "caused" after the "stripes..." beat, and the unheard "Holland,") before the shots are timed, so cuts and captions land on the words.

## Re-voice with Dia #8 (what was run)
Dia venv: Python 3.12 + CPU torch + transformers>=4.56 + librosa + scipy + faster-whisper (`~/.venvs/dia`). `VOICE_LINEUP` = `justinclips/voice_lineup/` from origin/justinclips/voice-lineup.

    V=~/.venvs/dia/bin/python
    $V justinclips/tools/revoice/dia8.py render justinclips/shorts/tulip-mania --seed 42      # Dia take, Whisper QA, per-line split -> project/build/dia8/
    export KIT=<toon3d-fx>/whatif/aitrends-2d-studio CHROMIUM_PATH=/opt/pw-browsers/chromium VPY=$V
    bash justinclips/tools/revoice/rebuild.sh tulip-mania --engine files --dir justinclips/shorts/tulip-mania/project/build/dia8
    $V justinclips/tools/revoice/qa_short.py justinclips/shorts/tulip-mania                  # Whisper on the mix, loudness, black frames, sheets

## Swap the voice (one command)
From the repo root, with a toon3d-fx kit checkout and the Chatterbox venv (`whatif/voice/setup_chatterbox.sh` from origin/voice-test):

    export KIT=/path/to/toon3d-fx/whatif/aitrends-2d-studio CHROMIUM_PATH=/opt/pw-browsers/chromium   # (PC: RENDER_ARGS="--gl gpu", no CHROMIUM_PATH)
    bash justinclips/tools/revoice/rebuild.sh tulip-mania --engine files --dir /path/to/new_voice_lines

`--dir` holds one file per line of `project/lines.json`, named `01.wav … 08.wav` (mp3/flac ok; a line with "..." may be split `03a.wav, 03b.wav`). Any TTS works. The command re-voices, re-aligns words, re-times every shot from the new voice (`retime.py`), renders, mixes to −14 LUFS, muxes, checks loudness/TP, and rewrites `video.mp4`, `video.sha256`, `contact_sheet.png` and the generated files in `project/`. Re-render with the current D2 voice: drop `--engine files --dir …` (default engine `chatterbox_d2`). Preview only: add `--sheet-only`. Details: `justinclips/tools/revoice/README.md`.

Not posted or uploaded anywhere.
