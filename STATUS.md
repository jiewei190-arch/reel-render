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
4. Set **STATE: ready-for-gpu-render** with the exact GPU commands.
