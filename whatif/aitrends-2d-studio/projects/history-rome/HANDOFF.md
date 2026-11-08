# HANDOFF: I.Awaken History Hook ep 1 — "How Did the Roman Empire Get Destroyed?" — TOON 3D (16:9 1080p24, 538.12 s)

STATE: waiting-style-kit. Direction change (owner, Nov 8): this episode is animated in the NEW **Toon 3D** style
(IAWAKEN_PLAYBOOK "NEW ANIMATION STYLE: Toon 3D" on claude/beautiful-hypatia-0w2o96, reference frame docs/style_ref_toon3d.jpg),
with the Toon 3D kit being built on branch `iawaken/toon3d` (kits/toon3d/: rig.js, sets.js, captions.js). No 2D sets or shots were
built for this episode (the 2D Stage A was stopped before any files landed). Animation starts when the kit is approved.

## What is ready (this folder + whatif/history-rome/)
- Script v2 (Toon 3D deadpan tone): `whatif/history-rome/script.md` (66 lines, 1,245 words); sources `sources.md`; package `package.md`.
- Voice: `input/voiceover.wav` 523.91 s (Kokoro am_fenrir via `whatif/history-rome/narrate.py`: clip 0.90, story 0.97, return/twist
  0.90). Plain text `input/script.txt`. Video duration 538.12 s (a ~15 s end-screen tail after the last word at 522.62 s).
- Word clock: `timeline/words.json` (faster-whisper small, 98% script match, onsets snapped to the exact TTS sentence clock in
  `timeline/narration.json`), `sentences.json`, `transcript.txt`. Captions (1-3 words) come from words.json.
- Shot list: `story/shots.json` v2 (generator `whatif/history-rome/gen_shots.py`): **149 shots**, 0 -> 538.12 s, contiguous, each cut
  0.15 s before its anchor word; `style: "toon3d"`, a `sets` list (44 sets), a `cast` table, music plan. Each shot: `line` (exact spoken
  words), `scene` (SET, CAST + signature items, ACTION, FACES on the words, CAMERA, ON SCREEN gold numbers/name chips, WORD BEATS in
  seconds from shot start, STYLE + LEGAL/NO-GORE line), `set`, `cast` ids, `type`, `batch` (A s001-s040, B s041-s067, C s068-s101,
  D s102-s149), `in`, `sfx` (kit library names, seconds from shot start), `amb`.

## Cast (Toon 3D bean designs; one signature item each)
LIVIA (moss-green palla, family coin) · GAIUS (bored legionary, ridiculously tall red crest) · FELIX (HERO cameo: mustard tunic,
moss-green apron) · FELIX2 (his son: beard, squint) · THE NERVOUS EMPEROR (one sweaty bean for every emperor; NAME CHIP changes) ·
HONORIUS / ROMULUS (mini nervous emperor, wreath too big) · ALARIC (braid, fur, red-sun shield) · ODOACER (huge calm bean, big beard)
· the GOTHIC FAMILY (dad, mum, boy with a wooden horse) · BISCUIT cameo (judgemental street cat, purple collar).

## Most-used sets (build these first)
war_table (the recurring map device: a painted Mediterranean map on a palace table with wooden pieces, cloth territories, gold string
for the West/East split) · throne_room · ravenna_hall · walls_night + gate_inside (frame 1 + the return) · storeroom (Livia) ·
bakery · library · coin_macro · rome_skyline_fire / rome_skyline_day · legion_camp · market · constantinople. Full list in shots.json `sets`.

## When the kit is approved (next steps, same branch iawaken/ep-rome)
Animate batches A-D with the kit, QC sheets per batch, a half-scale full-length preview, then STATUS.md -> ready-for-gpu-render with the
exact GPU render + mix commands. The audio mix (`python3 audio/mix.py --project projects/history-rome`) already works with this
shots.json (music plan, sfx, amb).
