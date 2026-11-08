STATE: paused

# I.Awaken History Hook ep 1 — status (slug: history-rome, branch iawaken/ep-rome)
Paused by the owner on Nov 8 ("skip the long video today"). Nothing was rendered, posted, uploaded or scheduled.

## Done
- **Title (39 chars):** How Did the Roman Empire Get Destroyed?
- **Words, all pushed:**
  - `whatif/history-rome/`: package.md, script.md v2 (Toon 3D deadpan tone, 66 lines, 1,245 words), sources.md, narrate.py, gen_shots.py.
  - `iawaken/out/history-rome/UPLOAD.md` draft: chapters start at 0:00 and it includes "Voice is synthetic."
- **Voice and timing:** `whatif/aitrends-2d-studio/projects/history-rome/`
  - `input/voiceover.wav`: 523.91 s, Kokoro am_fenrir.
  - `timeline/words.json`: snapped to the exact TTS clock.
  - `story/shots.json` v2: 149 shots, 44 sets, cast table, music plan, scenes written for Toon 3D.
  - `config.json`: style toon, captions on, gold caption words.
  - `scenes/kit.js`: captions.
  - `HANDOFF.md`.
- **Toon 3D kit:** merged from `iawaken/toon3d` (`kits/toon3d/`, approved by the owner). In `render.mjs` the browser path can come from `CHROMIUM_PATH` or `CHROME_PATH`, and there are new QC options: `--ids`, `--outdir`, `--story`.

## Left (when resumed)
1. **Extra sets, Stage A:** the city (walls, gate, skyline, Forum, storeroom, market, basilica), the rooms (throne room, Ravenna, Constantinople hall, library, bakery, mint, Jerome's cell, villa), the outdoor sets (legion camp, Danube, battlefield, the Frigidus pass, Gothic camp, Constantinople and its walls) and an episode cast/graphics layer (cast builders, war table, coin macro, year counter, name chips, chapter cards).
2. **Shot batches A-D** (Stage B), with QC sheets.
3. A **half-scale preview**.
4. Set **STATE: ready-for-gpu-render**. The owner's PC is off, so the full-res render will run in the cloud, split across 4 parallel sessions (main session's plan). STATUS.md will then list:
   - 4 roughly equal ranges, cut on shot boundaries, each with its exact command: `export CHROMIUM_PATH=/opt/pw-browsers/chromium; cd whatif/aitrends-2d-studio && node render.mjs --project projects/history-rome --shots sXXX-sYYY` (writes `build/silent_sXXX-sYYY.mp4`).
   - one join + mix command for a single machine: ffmpeg concat of the 4 silent parts, then `python3 audio/mix.py --project projects/history-rome --video <joined>`.
   - Frame rate stays 24 fps (already the project rate).

## Render tooling (ready now)
- `node render.mjs --project P --shots s001-s040` renders exactly that shot range at full res. It is frame-exact: adjacent ranges share their boundary frame index, so the parts concat with no gap or overlap. Output: `build/silent_s001-s040.mp4`, with a per-range parts folder. It is backward compatible (`--from/--to` still work).
- Smoke-tested on the stop-time project (s004-s005 at scale 0.2: 5.21 s out for a 5.24 s range, i.e. whole frames). The test file was deleted.
