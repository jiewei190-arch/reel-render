# Cloud job: animate "What If You Could See in Complete Darkness?" (shots only)

Owner: the channel owner (posts by hand; never post or schedule anything anywhere).
Local session will do the FINAL render + sound mix on the owner's PC (GPU). Your job is the shot code + QC.

## What is already done (don't redo)
- Script, sources, shot plan: `whatif/what-if-dark/` (script.md, sources.md, shot_plan.md, title_package.md). Final, don't edit.
- Narration (final, 413.8 s): `whatif/aitrends-2d-studio/projects/see-in-dark/input/voiceover.wav`; word timings in `.../timeline/`.
- Stage 1 foundation in `whatif/aitrends-2d-studio/projects/see-in-dark/`: config.json, story/bible.md, story/shots.json
  (120 shots, contiguous, 414.56 s), scenes/cast.js, scenes/sets/*.js (apartment, street, cinema, lab, forest, actors,
  thermal, bp, hud), and 4 proof shots in scenes/shots/S_stage1_examples.js (s001, s008, s011, s012).
- READ FIRST: `projects/see-in-dark/HANDOFF.md` (batch ranges, helper APIs, naming rules, QC loop), then the kit docs:
  `whatif/aitrends-2d-studio/SETUP_NOTES.md` and the engine/style references. The kit's examples/reaction-time/ shows working shot code.

## Setup on a Linux cloud box (no GPU is fine)
    cd whatif/aitrends-2d-studio
    npm install && npx playwright install --with-deps chromium     # if --with-deps fails, try without it
    sudo apt-get install -y ffmpeg || true                          # needed only for previews; the final render happens on the PC
    python3 tools/verify_kit.py && python3 tools/doctor.py
Chromium uses SwiftShader automatically on Linux (`--gl swiftshader`), slower but correct.
Do NOT re-run new_project.py, transcribe.py or beats.py (they would overwrite timing and shots.json).

## The work: write every MISSING shot (116 of 120)
Split by HANDOFF.md batches: A = s001-s039, B = s040-s081, C = s082-s120. Parallel workers each own one batch and write ONLY
`scenes/shots/A_*.js` / `B_*.js` / `C_*.js`. Shared files (sets/*, cast.js, shots.json, config.json) are read-only for
batch workers; if a set needs a fix, one person (the lead) makes it and tells the others.
Rules (from the style bible): fully animated, never a static frame; characters gesture, walk, blink and change expression on the
word beats (use wordTime()); the camera always moves; use the thermal view whenever the hero "sees" in the dark; blueprint style
for science; fact chips max 6 words, exact to the narration; no Math.random / Date.now (use rng(seed), t).

QC loop per batch (8-12 shots at a time):
    node render.mjs --project projects/see-in-dark --sheet --scale 0.4      # open EVERY sheet png; no MISSING / ERROR
    node render.mjs --project projects/see-in-dark --stills t1,t2,t3 --scale 0.5   # check motion within a shot
Check against references/render-qc.md. Fix and repeat until every shot in your batch passes.

## Deliver
- Commit and push to THIS branch (`whatif/see-in-dark`) often (at least after each batch of ~10 shots), message like
  "see-in-dark: A s013-s024 shots". Never push build/ or node_modules/.
- When all 120 shots pass on the sheet, also commit `projects/see-in-dark/build/sheets/*.png` (contact sheets only, small)
  so the owner can see the result, and write `projects/see-in-dark/CLOUD_REPORT.md`: what's done, any weak shots, known issues.
- Don't render the full final video and don't run audio/mix.py; the local PC does that.
