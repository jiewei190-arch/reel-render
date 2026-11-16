# revoice: Justin clips Shorts whose voice can be swapped with one command

Built for batch 4 (brief `justinclips/briefs/batch4-nov16.md`: "swapping the voice is one re-render command").

## The idea
A Short's timing must never be hard-coded to one voice. So each Short keeps:
- `project/lines.json`: the per-line script (the only source of the words). `"..."` in a line = a held beat.
- `project/story/shots.plan.json`: every cut anchored to the narration (`{"line": 3}`, `{"line": 3, "word": "cases"}`, `{"line": 3, "end": true}`, `{"line": 3, "frac": 0.5}`, + `offset`), never to seconds.
- `project/scenes/*.js`: word-synced effects use `at(info, 'word')` (timeline/words.json) and `shotStart(id)`, never absolute times.

Everything with seconds in it (`input/voiceover.*`, `timeline/*`, `story/shots.json`, `config.json` duration) is generated.

## One command
    export KIT=/path/to/toon3d-fx/whatif/aitrends-2d-studio      # origin/iawaken/toon3d-fx, `npm install` done
    export CHROMIUM_PATH=/opt/pw-browsers/chromium              # Linux cloud only. Owner's PC: RENDER_ARGS="--gl gpu"
    bash justinclips/tools/revoice/rebuild.sh <slug>                                   # current D2 Chatterbox voice
    bash justinclips/tools/revoice/rebuild.sh <slug> --engine files --dir NEW_VOICE/   # any other voice
Options: `--no-voice` (keep the current voice, e.g. after a scene edit), `--sheet-only` (stop after timing + contact sheet), `--workers N`.
`VPY` = the Python with faster-whisper (default `~/.venvs/chatterbox/bin/python`, made by `whatif/voice/setup_chatterbox.sh` on origin/voice-test).

Steps: copy `project/` into `$KIT/projects/<slug>` → `voice.py` → kit `tools/transcribe.py` (word timings, script-aligned)
→ `retime.py` (plan → shots.json; prints every shot length and warns outside 1.0–2.8 s) → `render.mjs` → kit `audio/mix.py`
(music + SFX, −14 LUFS, TP −1.5; redone two-pass + linear if it lands > 0.3 LU off) → mux (`-c:v copy`, every frame kept) → ebur128 check → `video.mp4`, `video.sha256`,
`contact_sheet.png`, and the generated files copied back into `project/`. Commit with `git add -f project/input/voiceover.wav` (*.wav is gitignored).

## Voice engines (`voice.py`)
- `chatterbox_d2` (default): the owner's current D2 deadpan (`chatterbox_d2.py`, copied unchanged from origin/voice-test: built-in voice, exaggeration 0.3, cfg 0.3, up to 3 seeds per part with Whisper QA).
- `files`: any new voice. Put one audio file per line in a folder: `01.wav`, `02.wav`, … (wav/mp3/flac/m4a/ogg). For a line with "...", either one file with the pause baked in, or parts `03a.wav`, `03b.wav` (the beat is inserted). Silence is trimmed and the lines are joined with the pacing in `lines.json`.
Adding another engine = write `input/voiceover.wav` + `input/voiceover.lines.json` (per line `n`, `start`, `end`) + `input/script.txt`. Nothing else changes.

`tables.py <short dir>` prints the narration and shot tables for `script.md` from the current timings.

## Tested
Nov 16: `rebuild.sh tulip-mania`-style swap with `--engine files` on a stand-in voice (the D2 lines slowed 12%, one file per line):
alignment 99%, all 18 shots re-timed (29.6 s → 33.1 s, every shot 1.27–2.80 s), word-synced stamps/counters landed on their words.
`retime.py` resolves word anchors by token index within the line (words.json has one entry per script token), so a weaker
alignment can't drag a cut into the wrong line. Re-running it on the three batch-4 Shorts gives byte-identical shots.json.

## Voice #8 (Dia), added for revoice rv1 (Nov 16)
`dia8.py` voices any Short with the owner's chosen voice #8: `voice_lineup/tts_any.py --engine dia` with the exact lineup
settings (prompt `prompts/dia_prompt_kokoro_am_puck.wav` + its text, `--dia-tail " (laughs)"`, cfg 3.0, temp 1.8,
top-p 0.9, top-k 45), one pass over the whole script, Whisper small.en QA, tail cut after the last word.
- build_short.py Shorts (pig-war, wojtek-bear-soldier): `--voice-cmd "~/.venvs/dia/bin/python justinclips/tools/revoice/dia8.py --project {project} --wav {wav} --seed N"`.
  Dia's own phrasing is kept; `lines.json` `"pacing": {"gap": .., "beat": ..}` only adds silence where Dia's pause at a
  line end / "..." is shorter.
- rebuild.sh Shorts (great-stink): `dia8.py --project <short>/project --seed N --split-dir DIR`, then `rebuild.sh <slug> --engine files --dir DIR`.
- Cut points are found from Whisper word timings and refined to the real pause (`pacing.sil_db`, default −40 dB under the
  loudest frame; `pacing.cut: "nearest"` picks the pause nearest Whisper's boundary instead of the longest). Every piece
  is re-transcribed and printed (very short pieces, e.g. "and the Thames", can mis-transcribe on their own; check the joined result).
- Respellings for Dia only: `lines.json` `"pronounce": {"dia": {"Wojtek": "Voytek"}}`.
- `--keep DIR` keeps the take (`dia8_master.wav`, `dia8_report.json` with seed and median pitch); `--reuse DIR` re-paces/re-splits it without Dia.
- Seeds: Dia's voice drifts a lot per seed (149–391 Hz median seen for the same prompt). The same seed always gives the
  same take, and the first seconds of a take don't depend on its length, so screening seeds on the first ~4 s (about 70 s
  of CPU each) and rendering only the ones near the #8 reference (~205 Hz) saves most of the 6–7 min per full take.

`snap_words.py` (run by rebuild.sh after the word timings): Whisper tends to stretch a word back over a pause the voice
step inserted. It moves such starts to the real onset (digital silence, or the part start voice.py now records in
`voiceover.lines.json`). Without it, great-stink's "was" (after the "..." beat) started 0.6 s early and so did shot s06.
