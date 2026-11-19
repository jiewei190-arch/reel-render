STATE: rendered (FORMAT v1 recipe, PC build on the 9e679a1e engine)

# start-25-vs-35: render notes (PC, style S2 RICH-VS-POOR, voice Tyler)

`video.mp4` sha256 `0bdc431c5afeac3ecb56e46487b27f636e13ab2a6417b1f708a3c158153a11f2`. 1080x1920, 30 fps, 885 frames (29.50 s), SUB=4 motion blur with the quality pass, 24.3 MB.

## Build
- **Voice:** ElevenLabs Tyler, voiced in the cloud (finance/next, 15e6fd4). 501 characters, 29.5 s.
  - Whisper (small.en) on the full final mix matches script.txt, with numbers as digits.
- **Recipe:** `recipe.json`, written on the PC by a helper subagent from script.md's brief and the lessons from today's scrubs, then fixed after GPU stills.
  - Set: home.
  - Hook "10 YEARS LATE: $280K LESS".
- **Frame 0:** close on Saver (curious), an "AGE 25 / $200/MO" tag landing on his chest (face clear).
- **Race:** AGE 25 vs AGE 35 calendars to 65; PUT IN $96,000 vs $72,000; AT 65 ≈$528,000 vs ≈$245,000.
- **Open loop:** "Spender only missed ten years of deposits... so how bad can it be?" 17.6 s (60 %): covered "AT 65 ?" block.
- **Twist:** "At sixty-five, Saver has about five hundred twenty-eight thousand" 25.1 s (85 %): AGE 65 $??? reveal, SAVER AT 65 counts to ≈$528,000.
- **Eggs:** cat + mug, catCoin final gag.
- **Loop seam:** `hook.again` on the last line. The last shot repeats the frame-0 lens and tag.
- **PC fixes after stills:**
  - The frame-0 tag was cropped by the hookZoom push, or crossed the face mid-drop. It now lands on the chest from a 7 cm drop.
  - Race counters sat above the split lenses. They're now beside each head.
  - Shot-specific framing fixes.
- **Mix:** Standard mix (all recipe cues).

## Time
- **Build:** recipe_build about 1 s per pass. About 20 GPU stills.
- **Render, on the RTX 4060 at SUB=4:** v1, render=159 s  total=194 s.

## QA
- **Gate:** `RECIPE_QA.md` 13/13 PASS.
- **Recipe clip QA:** 885 frames x 4 sub-frames, 0 clips.
- **Audio:** -14.1/-14.2 LUFS, true peak -2.1 to -2.5 dBFS. No dropouts over 0.6 s; audio and video are both 29.5 s.
- **critic.py, against the recipe cuts:** SYNC max 1 frame; STATIC 0-0.17 s.
  - EDGES may flag bright scenery or money sparkles in its 55-80 % band (street windshields and pavement, bank sparkles). These are not captions; the captions sit in the top 35 %.
- **By eye:** 6 fps scrub (`scrub_6fps_*.jpg`) and the impact frames plus 2. A face or a readable board is in every shot, and every loop ending matches frame 0.

Not uploaded. It waits for MAIN QA and a BM GO.
