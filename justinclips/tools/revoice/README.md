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
