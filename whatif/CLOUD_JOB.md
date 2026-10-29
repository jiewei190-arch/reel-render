# Cloud job v2: animate "What If You Could See in Complete Darkness?" (re-time + all shots)

Owner posts by hand: never post or schedule anything anywhere. The owner's PC does the FINAL render + sound mix
tonight on its GPU. Your job: re-time the project to the NEW voice, rebuild the shot list for the NEW script, and write
+ QC every shot to the quality bar. This replaces v1 entirely (the old shots.json/timing are obsolete).

## What changed since v1
- NEW script (43 lines, warmer, flows better): `whatif/what-if-dark/v2/wid2.md` (spoken lines) and the same text in
  `whatif/what-if-dark/script.md`. Sources: `whatif/what-if-dark/sources.md` (line numbers match the new script).
- NEW voice (final, 373.6 s, calm and natural): `projects/see-in-dark/input/voiceover.wav`; plain script for alignment:
  `projects/see-in-dark/input/script.txt`. Per-line timings (from our pipeline) for reference: `whatif/voice/wid2_timeline.json`.
- UPGRADED foundation in `projects/see-in-dark/scenes/`: acting.js (poses, blinks, talk gestures, walkAlong, camMove),
  faces.js (giantFace with expression presets), creatures.js (cat, mouse, snake, deer, fox, gecko, owl + thermal modes),
  richer sets, brighter thermal view, clean blueprint eye/retina, new RULE card. Showcase shots: `scenes/shots/S_showcase.js`.
- QUALITY BAR: `projects/see-in-dark/QUALITY_BAR.md` (39 checkable rules). Every shot must pass it. Read it first,
  then HANDOFF.md, then study S_showcase.js as the reference level.

## Setup (Linux cloud box, no GPU is fine)
    cd whatif/aitrends-2d-studio
    npm install && npx playwright install --with-deps chromium   # without --with-deps if that fails
    sudo apt-get install -y ffmpeg || true
    python3 -m pip install numpy scipy faster-whisper
    python3 tools/verify_kit.py && python3 tools/doctor.py

## Step 1 (lead only): re-time + new shot list
    python3 tools/transcribe.py --project projects/see-in-dark --script projects/see-in-dark/input/script.txt --lang en --model small
    python3 tools/beats.py --project projects/see-in-dark --force
- Need >= 90% match. Then rewrite `story/shots.json` for the NEW script following story-breakdown.md + QUALITY_BAR.md:
  shots ~2.5-4.5 s, contiguous, last end == duration, concrete `scene` per shot, the five RULE title cards, giant-face
  reaction on every reaction beat, thermal view whenever the hero "sees", blueprint for science, the forest climax given
  room (slower cuts), sfx/amb/music sections. `what-if-dark/shot_plan.md` is from the OLD script: use it only as ideas.
- Re-bind the showcase shots in S_showcase.js to the new shot ids/word cues (or fold them into the batch files).
- Split into 3 batches by time (A/B/C), update HANDOFF.md with the new id ranges, commit + push before workers start.

## Step 2 (3 workers in parallel): write every shot
Each worker owns one batch and writes ONLY `scenes/shots/A_*.js` / `B_*.js` / `C_*.js`. Shared files (sets/*, cast.js,
shots.json, config.json, QUALITY_BAR.md) are read-only for workers; set fixes go through the lead.
QC loop per 8-12 shots:
    node render.mjs --project projects/see-in-dark --sheet --scale 0.4       # open EVERY sheet png; no MISSING/ERROR
    node render.mjs --project projects/see-in-dark --stills t1,t2,t3 --scale 0.5
Check each shot against QUALITY_BAR.md's self-check list. Fix and repeat. Fully animated, never static; expressions and
gestures change on the word beats (wordTime()); camera always moves; deterministic (no Math.random/Date.now).

## Deliver
- Push to this branch (`whatif/see-in-dark`) after every ~10 shots ("see-in-dark: B s041-s052").
- When all shots pass: commit `projects/see-in-dark/build/sheets/*.png` (contact sheets only) and write
  `projects/see-in-dark/CLOUD_REPORT.md` (done, weak shots, known issues). No full render, no audio mix, no node_modules/build.
