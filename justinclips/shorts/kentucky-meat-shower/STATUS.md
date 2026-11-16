STATE: ready

# Kentucky Meat Shower: status

**Re-voiced with voice #8 (Dia), Nov 16.** Earlier D2 Chatterbox render replaced.

- voice: dia #8 (Dia-1.6B-0626, Apache-2.0; Kokoro am_puck prompt + the #8 prompt text, cfg 3.0, temp 1.8, top-p 0.9, top-k 45, `--dia-tail " (laughs)"` cut off after the last word). **seed: 23.** Seed 7 garbled "Throwing up" (Whisper: "Thrown up") and seed 11 drifted to 247 Hz, so per the rules the next seed was used. One Dia pass over the whole script, median pitch 213 Hz (pyin; the #8 reference reads 199 Hz with the same meter), take 17.1 s, no "(laughs)" left; the voice starts 0.09 s in. Report: `project/input/voice_dia8.json`.
- Whisper (small.en) on the final mix, word for word (0 wrong words): "In 1876, it rained meat in Kentucky. Chunks fell from a clear blue sky onto a farm. A woman making soap outside watched it land. Two men reportedly tasted it. And guessed mutton, or venison. Lab tests later found lung, muscle, and cartilage. The most popular explanation, vultures. Throwing up mid-flight." (A second pass, sentence by sentence, differs only on "guessed" -> "guest", the same near-homophone the D2 build had.)
- length: **20.58 s** (494 frames, 1080x1920, 24 fps, H.264 + AAC). sha256 in `video.sha256`.
- LUFS: **-14.02 integrated, true peak -2.6 dBTP** (`project/qc.json`; ebur128 re-check in `project/qa_revoice.json`).
- QA: captions checked against the voice on a 10-frame sheet (in sync); no black or blank frames (blackdetect + per-frame luma spread); frame 1 = falling chunks + top caption "Kentucky, 1876: / chunks about 2 inches wide"; last frames = vulture "BLEH!" on "mid-flight." and a hard cut back to frame 1 (loop). Script unchanged.
- Word timings: Whisper stretches a word back into the pause before it ("and" after the "tasted it..." beat), so `snap_words.py` moves word edges out of pauses before the shots are timed; the "and guessed mutton" cut and caption land on the word.
- Pacing: Dia reads fast (17 s of speech), so `lines.json` got `"pacing": {"gap": 0.5, "lead": 0.05, "beat": 0.65, "breaks": [after "Vultures." 0.35 s]}` to land inside 20-30 s and give the "Vultures." shot room. No words changed.
- Unchanged from the D2 build: jail-break checklist in `script.md`, tone guard (cartoon steak chunks only), hedges ("reportedly", "the most popular explanation", "(species: unclear)"), `sources.md`. Shot timing is generated from `project/lines.json` + the voice's word timings.

## Re-voice with Dia #8 (what was run)
Dia venv: Python 3.12 + CPU torch + transformers>=4.56 + librosa + scipy + faster-whisper (`~/.venvs/dia`). `VOICE_LINEUP` = `justinclips/voice_lineup/` from origin/justinclips/voice-lineup.

    V=~/.venvs/dia/bin/python
    $V justinclips/tools/revoice/dia8.py render justinclips/shorts/kentucky-meat-shower --seed 23     # Dia take, Whisper QA, per-line split
    $V justinclips/tools/build_short.py justinclips/shorts/kentucky-meat-shower --kit <toon3d-fx>/whatif/aitrends-2d-studio \
       --voice-cmd "$V justinclips/tools/revoice/dia8.py join {project} {wav}" --whisper-py $V --mix-py $V --chatterbox-py $V
    $V justinclips/tools/revoice/qa_short.py justinclips/shorts/kentucky-meat-shower                 # Whisper on the mix, loudness, black frames, sheets

## Swap the voice (one command)
From the repo root, on a machine with an `origin/iawaken/toon3d-fx` checkout (kit) and `origin/voice-test` (`whatif/voice/`):

    python3 justinclips/tools/build_short.py justinclips/shorts/kentucky-meat-shower --kit <toon3d-fx>/whatif/aitrends-2d-studio --voice-cmd "python3 my_new_tts.py {script_md} {wav}"

That re-voices from `lines.json`, re-aligns with Whisper, re-times every shot, re-renders, re-mixes to -14 LUFS / TP <= -1 and rewrites `video.mp4`, `video.sha256`, `contact_sheet.png` and `project/qc.json`. `{script_md}` is a numbered script (one line per VO line, the format `chatterbox_d2.py` / `fenrir.py` read); the command only has to write `{wav}`. Other placeholders: `{plain}` (plain text), `{project}`. Leave out `--voice-cmd` to use the current D2 voice (`--voice-dir <voice-test>/whatif/voice`, venv from `setup_chatterbox.sh`). `--stages time,render,mix` re-cuts without re-voicing. Linux needs `CHROMIUM_PATH` (auto-set to /opt/pw-browsers/chromium if present). The project folder is symlinked into the kit as `projects/kentucky-meat-shower`.

Not posted or uploaded anywhere.
