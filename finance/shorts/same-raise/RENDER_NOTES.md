STATE: rendered (FORMAT v1 recipe, PC build on the 9e679a1e engine)

# same-raise: render notes (PC, style S2 RICH-VS-POOR, voice Christopher)

`video.mp4` sha256 `14ff55fd5ec2a6cb1817caf2fd1131a84f1f1accb118259b5b3d23874a2c714c`. 1080x1920, 30 fps, 885 frames (29.50 s), SUB=4 motion blur with the quality pass, 22.1 MB.

## Build
- **Voice:** ElevenLabs Christopher, voiced in the cloud (finance/next, 15e6fd4). 429 characters, 29.5 s.
  - Whisper (small.en) on the full final mix matches script.txt, with numbers as digits.
- **Recipe:** `recipe.json`, written on the PC by a helper subagent from script.md's brief and the lessons from today's scrubs, then fixed after GPU stills.
  - Set: office.
  - Hook "SAME RAISE. $100K APART.".
- **Frame 0:** close on Spender (shocked), a green "PAYCHECK +$400/MO RAISE" tag landing on his chest (face clear).
- **Race:** SPENDER INVESTED $0 vs SAVER INVESTED → ≈$35,000 (10 yrs) → ≈$105,000 (20 yrs); CAR PAYMENT +$400/MO board.
- **Open loop:** "Nice, but not life-changing... yet." 16.6 s (56 %): covered "YEAR 20 ?" board over a sly Saver.
- **Twist:** "After twenty years: about a hundred and five thousand" 22.2 s (75 %): YEAR 20 calendar, SAVER AT 20 YRS counts to ≈$105,000.
- **Eggs:** cat + mug, catCoin final gag.
- **Loop seam:** `hook.again` on the last line. The last shot repeats the frame-0 lens and tag.
- **PC fixes after stills:**
  - The frame-0 tag was cropped by the hookZoom push, or crossed the face mid-drop. It now lands on the chest from a 7 cm drop.
  - Race counters sat above the split lenses. They're now beside each head.
  - Shot-specific framing fixes.
- **Mix:** Standard mix (all recipe cues).

## Time
- **Build:** recipe_build about 1 s per pass. About 20 GPU stills.
- **Render, on the RTX 4060 at SUB=4:** v1, render=150 s  total=178 s.

## QA
- **Gate:** `RECIPE_QA.md` 13/13 PASS.
- **Recipe clip QA:** 885 frames x 4 sub-frames, 0 clips.
- **Audio:** -14.1/-14.2 LUFS, true peak -2.1 to -2.5 dBFS. No dropouts over 0.6 s; audio and video are both 29.5 s.
- **critic.py, against the recipe cuts:** SYNC max 1 frame; STATIC 0-0.17 s.
  - EDGES may flag bright scenery or money sparkles in its 55-80 % band (street windshields and pavement, bank sparkles). These are not captions; the captions sit in the top 35 %.
- **By eye:** 6 fps scrub (`scrub_6fps_*.jpg`) and the impact frames plus 2. A face or a readable board is in every shot, and every loop ending matches frame 0.

Not uploaded. It waits for MAIN QA and a BM GO.

## 2026-11-19 re-render v3: bottom-centre captions (owner change via MAIN)
- sha256 3740aa300be9f23265e8c74d41dc34a50f8e907ef82a1bc87e45e0215482078a; 885 frames, 29.50 s video and audio, I about -14 LUFS, TP <= -2.1 dBFS.
- Word captions are now bottom centre (engine default): chunk centre at y 1344, never below 1400, symmetric 170 px margins. The small top line (captionsTop) is removed. The engine nudges the caption per shot off faces (eyes to mouth) and text props, sampled at 5 times per shot. End word "payment." +8 dB (gap 8.3 -> 2.2 dB). voice.orig.wav keeps the original.
- QA: critic SYNC/STATIC pass. Whisper small.en full file matches the script, last word heard. silencedetect: no gaps over 0.6 s. astats flat factor 0. 6 fps scrub checked by eye: no caption covers eyes or a mouth, and text boards stay readable. I can't hear audio, only measure it.
- Known: on the loop ending (frame-0 close-up again with the hook text), the caption sits between the hook box and the head (on the forehead or antennae), because the face and chest board fill the band. Eyes and mouth stay clear.
