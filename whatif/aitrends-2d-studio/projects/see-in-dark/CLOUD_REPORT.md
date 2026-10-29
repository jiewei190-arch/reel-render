# CLOUD_REPORT: "What If You Could See in Complete Darkness?" (cloud job v2)

Status: **all 119 shots written and rendering.** The contact sheet renders 119/119 stills with no MISSING and no ERROR (`node render.mjs --project projects/see-in-dark --sheet --scale 0.4`). Final render and audio mix are left for the owner's PC, as briefed. Nothing was posted.

## What was done
- **Re-timed to the new voice (main session, lead).**
  - faster-whisper small: 1012/1047 script words matched (97%); duration 373.594 s.
  - `beats.py --force --tail 0.7`. config.json duration was still 414.56 and was corrected to 373.594.
- **New story/shots.json:** 119 contiguous shots, avg 3.14 s.
  - Rule cards: s010, s030, s053, s069, s082.
  - 13 giant faces, 27 thermal shots, 21 blueprint shots; the forest climax has slower cuts.
  - sfx/amb per shot and 10 music sections.
- **Showcase shots** re-bound to s001, s003, s005, s010, s011, s029.
- **Lead fixes:**
  - s002 now flips to thermal (the hero sees in the dark).
  - The hero lip-syncs only his two quoted lines (s095, s104). bible, QUALITY_BAR and HANDOFF were updated to allow this.
  - The rule card's "RULE" word was hidden behind the numeral and the scope bars; fixed in sets/hud.js, affecting all 5 cards.
- **Shots:**
  - Batch A (s002-s039 minus showcase): worker H2, files `A_s002_s009_open.js`, `A_s012_s021_rule1.js`, `A_s022_s039_rule2.js`.
  - Batch B (s040-s081): worker H3, `B_lib.js` + 5 files.
  - Batch C (s082-s119): worker H4, `C_lib.js` + 4 files.
  - Each worker ran the sheet and stills QC loop against QUALITY_BAR.md on its own branch (claude/halloween-h2/h3/h4). The lead copied only the A_/B_/C_ files here; the obsolete `_old_*` files from the v1 timing were left out.
- **Sheets:** `build/sheets/sheet_01..05.png` (one mid-shot still per shot, committed for review).

## Weak or watch-list shots (from the lead's sheet review; single mid-shot frames, so check them in motion)
- **s089, s098, s099:** thermal frames that are mostly flat violet with little or no hot subject. Story-wise this is "cold things hide" and the thermal reboot, but QUALITY_BAR rules 25-27 want something readable. Consider faint cold forms, the crosshair hunting, or rain streaks.
- **s074, s081, s092:** white-out flashes for the blinding beats. Intended, but keep them short and make sure the frame recovers inside the shot.
- **s025:** a dark, sparse frame (a shoe and a toy on the floor), close to an empty third. It could use more apartment set or a foreground piece.
- **s041:** a blueprint with a lot of empty space; fine if the draw-on fills it in motion.
- **s117:** the "WHAT WOULD YOU DO?" text sits on the hoodie at the bottom; check legibility in motion.

## Known issues
- story-breakdown.md (from the kit plugin) wasn't available in the cloud; the shot plan follows QUALITY_BAR, HANDOFF and the bible.
- Render speed on cloud CPU (SwiftShader) is slow; the per-shot cost on the GPU PC should be fine.
- HANDOFF.md still gives the owner's Windows project path.
