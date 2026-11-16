STATE: ready

# War of the Bucket: status

**Re-voiced with voice #8 (Dia), Nov 16.** Earlier D2 Chatterbox render replaced.

- voice: dia #8 (Dia-1.6B-0626, Apache-2.0; Kokoro am_puck prompt + the #8 prompt text, cfg 3.0, temp 1.8, top-p 0.9, top-k 45, `--dia-tail " (laughs)"` cut off after the last word). **seed: 7.** One Dia pass over the whole script; median pitch 195 Hz (pyin; the #8 reference reads 199 Hz with the same meter); no "(laughs)" left. Dia left ~3.3 s of low murmur before "Legend" (prompt spill-over); `dia8.py` trims everything before the first word, so the hook still starts at frame 1. Report: `project/input/voice_dia8.json`. (Seed 11 was also rendered while checking a Whisper issue: 164 Hz, out of range, not used.)
- Whisper (small.en) on the final mix, 0 wrong words: "Legend says two cities went to war over a bucket. The truth is pettier. In 1325, Bologna sent about 32,000 soldiers after little Modena. Modena had about 7,000 and one. Then they reportedly marched to Bologna's gates and took a bucket from a well as a trophy. Modena still has the bucket, about 700 years later." ("and one" = "and won": the same homophone as before; with numbers off, Whisper writes "seven thousand and won".)
- length: **20.83 s** (500 frames, 1080x1920, 24 fps, H.264 + AAC). sha256 in `video.sha256`.
- LUFS: **-14.04 integrated, true peak -3.28 dBTP** (`project/qc.json`; ebur128 re-check -14.0 in `project/qa_revoice.json`).
- QA: captions checked against the voice on a 10-frame sheet (in sync); no blank frames (min luma spread 16.7). blackdetect flags 17.75-17.92 s: that is the designed iris transition into the Town Hall shot (s11, `"in": {"type": "iris"}`; the caption stays on screen; the D2 render had the same 0.17 s). Frame 1 = the red army charging at the bucket + top caption "Italy, 1325: / about 39,000 soldiers showed up"; ends on "...about 700 years later." with a hard cut back to the charge (loop). Script unchanged.
- Pacing: Dia reads fast and runs the "..." beats together, so the narration is split per line and at every "..." and re-joined with `lines.json` `"pacing": {"gap": 0.4, "lead": 0.05, "beat": 0.6}` (20-30 s target). No words changed.
- Unchanged from the D2 build: jail-break checklist in `script.md`, the "Legend says" fact fix, `sources.md`. Shot timing is generated from `project/lines.json` + the voice's word timings.

## Re-voice with Dia #8 (what was run)
Dia venv: Python 3.12 + CPU torch + transformers>=4.56 + librosa + scipy + faster-whisper (`~/.venvs/dia`). `VOICE_LINEUP` = `justinclips/voice_lineup/` from origin/justinclips/voice-lineup.

    V=~/.venvs/dia/bin/python
    $V justinclips/tools/revoice/dia8.py render justinclips/shorts/war-of-the-bucket --seed 7          # Dia take, Whisper QA, per-line split
    $V justinclips/tools/build_short.py justinclips/shorts/war-of-the-bucket --kit <toon3d-fx>/whatif/aitrends-2d-studio \
       --voice-cmd "$V justinclips/tools/revoice/dia8.py join {project} {wav}" --whisper-py $V --mix-py $V --chatterbox-py $V
    $V justinclips/tools/revoice/qa_short.py justinclips/shorts/war-of-the-bucket                  # Whisper on the mix, loudness, black frames, sheets

## Swap the voice (one command)
From the repo root, on a machine with an `origin/iawaken/toon3d-fx` checkout (kit) and `origin/voice-test` (`whatif/voice/`):

    python3 justinclips/tools/build_short.py justinclips/shorts/war-of-the-bucket --kit <toon3d-fx>/whatif/aitrends-2d-studio --voice-cmd "python3 my_new_tts.py {script_md} {wav}"

That re-voices from `lines.json`, re-aligns with Whisper, re-times every shot, re-renders, re-mixes to -14 LUFS / TP <= -1 and rewrites `video.mp4`, `video.sha256`, `contact_sheet.png` and `project/qc.json`. `{script_md}` is a numbered script (one line per VO line, the format `chatterbox_d2.py` / `fenrir.py` read); the command only has to write `{wav}`. Other placeholders: `{plain}` (plain text), `{project}`. Leave out `--voice-cmd` to use the current D2 voice (`--voice-dir <voice-test>/whatif/voice`, venv from `setup_chatterbox.sh`). `--stages time,render,mix` re-cuts without re-voicing. Linux needs `CHROMIUM_PATH` (auto-set to /opt/pw-browsers/chromium if present). The project folder is symlinked into the kit as `projects/war-of-the-bucket`.

Not posted or uploaded anywhere.
