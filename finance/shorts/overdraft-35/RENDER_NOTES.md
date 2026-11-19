STATE: rendered (FORMAT v1 recipe, PC build on the 9e679a1e engine)

# overdraft-35: render notes (PC, style S2 RICH-VS-POOR, voice Tyler)

`video.mp4` sha256 `0feae3c63108dcfa17c9001441879727d4231ee4f8af71afd6d678f1c330684c`. 1080x1920, 30 fps, 885 frames (29.50 s), SUB=4 motion blur with the quality pass, 27.2 MB.

## Build
- **Voice:** ElevenLabs Tyler, voiced in the cloud (finance/next, 15e6fd4). 428 characters, 29.5 s.
  - Whisper (small.en) on the full final mix matches script.txt, with numbers as digits.
- **Recipe:** `recipe.json`, written on the PC by a helper subagent from script.md's brief and the lessons from today's scrubs, then fixed after GPU stills.
  - Set: bank.
  - Hook "$35 FOR A $5 COFFEE?".
- **Frame 0:** close on Spender grinning, a red DECLINED card-reader tag landing on his chest (face clear), sticky-note egg behind.
- **Race:** SPENDER PAID $0 → $5 → $40 → $120 vs SAVER PAID $0 → $5 → $15, beside each head in the split shots.
- **Open loop:** "But the fee isn't even the worst part..." 15.6 s (53 %): two coffees on blocks with covered "$?? FEE" tags.
- **Twist:** three "$35 FEE" stamps in a row at 20.0 s (68 %); SPENDER PAID counts $40 → $120 at 22.1 s.
- **Eggs:** cat + sticky, catCoin final gag.
- **Loop seam:** `hook.again` on the last line. The last shot repeats the frame-0 lens and tag.
- **PC fixes after stills:**
  - The frame-0 tag was cropped by the hookZoom push, or crossed the face mid-drop. It now lands on the chest from a 7 cm drop.
  - Race counters sat above the split lenses. They're now beside each head.
  - Shot-specific framing fixes.
- **Mix:** The final 3 SFX cues (after 28.8 s) were dropped from the mix (out/tmp/overdraft-35.endclear.cues.json): ElevenLabs voices the last word "forty" softly (≈ -26 dB), and the closing whoosh masked it ("$4"). Without them, small and small.en both hear "Spender's cost $40".

## Time
- **Build:** recipe_build about 1 s per pass. About 20 GPU stills.
- **Render, on the RTX 4060 at SUB=4:** v1, render=168 s  total=201 s.

## QA
- **Gate:** `RECIPE_QA.md` 13/13 PASS.
- **Recipe clip QA:** 885 frames x 4 sub-frames, 0 clips.
- **Audio:** -14.1/-14.2 LUFS, true peak -2.1 to -2.5 dBFS. No dropouts over 0.6 s; audio and video are both 29.5 s.
- **critic.py, against the recipe cuts:** SYNC max 1 frame; STATIC 0-0.17 s.
  - EDGES may flag bright scenery or money sparkles in its 55-80 % band (street windshields and pavement, bank sparkles). These are not captions; the captions sit in the top 35 %.
- **By eye:** 6 fps scrub (`scrub_6fps_*.jpg`) and the impact frames plus 2. A face or a readable board is in every shot, and every loop ending matches frame 0.

Not uploaded. It waits for MAIN QA and a BM GO.
