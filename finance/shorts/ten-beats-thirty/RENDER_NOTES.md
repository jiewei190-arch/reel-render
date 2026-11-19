STATE: rendered (FORMAT v1 recipe, PC build on the 9e679a1e engine)

# ten-beats-thirty: render notes (PC, style S1 STORY, voice Tyler)

`video.mp4` sha256 `9cb04fc2977e4d3413ef92e79f30e8b8c141d1b1531c381a8b12af48499185a5`. 1080x1920, 30 fps, 885 frames (29.50 s), SUB=4 motion blur with the quality pass, 27.1 MB.

## Build
- **Voice:** ElevenLabs Tyler, voiced in the cloud at e816b53. 456 characters, 29.5 s.
  - Whisper (small.en) on the hook line alone: "Saving more money can still make you lose." Exact.
  - On the full final mix, Whisper matches the script word for word, with the numbers as digits.
- **Recipe:** `recipe.json`, written on the PC by the helper subagent from MAIN's brief, then fixed after GPU stills and three scrub passes. 16 shots, bank set. Composition `TenBeatsThirtyRecipe` / `TenBeatsThirtyRecipeSub`.
  - **Brief items:**
    - hook "SAVED 3X MORE. LOST.";
    - frame 0: a $72K cash stack slamming down beside Spender;
    - two counters racing the whole time (SPENDER SAVED / SAVER SAVED, then AT 65);
    - cliffhanger "Wait till you see sixty-five..." over a covered AGE 65 ? block;
    - payoff: Saver ≈$282,000 vs Spender ≈$245,000, tag "EXAMPLE · 7%/YR".
  - **PC fixes:**
    - **Frame 0:** the stack sat on the floor out of frame. It's now a tall stack (1.15 m) beside him, with the camera swung to show it. His pose change is now despair, not shock, so his arms don't swing into it; the emotion goes joy to sad at 0.77 s.
    - **Counter boards:** they were cropped at the top. They're lowered (y 2.05 to 1.82, age boards 2.6 to 2.3).
    - **The "Wait till you see sixty-five" tease:** the bank counter hid the AGE 65 block, so the shot was a brown wall. The block moved to the open floor.
    - **"Saver put in two hundred a month":** a wide orbit with both actors out of frame (empty counter). It's now a medium shot on Saver.
    - **About 5 s with no faces:** Saver faced his jar (back to the lens) and Spender faced away in the whip. Both now face the lens. Saver's jar moved 0.45 m out, so his hands clear it.
    - **`captionsTop` is OFF:** the top line covered the race counters, which matter more here.
    - **coinPile sizes:** written as [r, h, r]. The guide's [r, h] doesn't type-check.

## Time
- **Build:** recipe_build takes about 1 s per pass. About 30 GPU stills over the fix passes.
- **Render, on the RTX 4060 at SUB=4:**
  - v1 failed before rendering: a type error in the recipe;
  - v2: 171 s render, 208 s total;
  - v3: 163 s, 200 s;
  - v4 (final): 169 s render, 222 s total.

## Pre-post gate (`RECIPE_QA.md`; `frame0.jpg`, `strip_0-2s_6fps.jpg`)
All 13 checks PASS:
- frame 0 is close (the stack, 74 %);
- hook (4 words);
- who + what (Spender, the stack);
- stake at 0.00 s;
- first word "Saving" at 0.09 s;
- impact at 0.00 s;
- no names in the first 2 s;
- tag from 1.0 s;
- 7 moves in the first 3 s;
- music + SFX at 0;
- emotion change at 0.77 s;
- no wide or dark shot in the first 1 s;
- 29.50 s long.

Retention tactics:
- **Eggs and gag:** the `cat` egg and the `catCoin` final gag.
- **Open loop:** a calendar tease from 15.5 s (52 %), then "Wait till you see sixty-five..." at 18.2 s (62 %).
- **Twist:** Saver's $282K slam at 21.1 s (72 %), then Spender's $245K at 24.2 s.
- **Loop seam:** the hook returns on "but". The last shot is the frame-0 lens.

## QA
- **Audio:** story_mix (29 recipe cues) then mux_voice with `LIMIT=0.74 TPMAX=-1.5`: **-14.1 LUFS, true peak -2.2 dBFS**.
- **Recipe clip QA:** 885 frames x 4 sub-frames, **0 clips**.
- **critic.py, against the recipe cuts:** 0 FAIL.
  - SYNC: 15 cuts, max offset 1 frame.
  - STATIC: 0 s.
  - EDGES: 21.1 %.
- **By eye:**
  - 6 fps scrub (`scrub_6fps_0-12s.jpg`, `scrub_6fps_12-24s.jpg`, `scrub_6fps_24-30s.jpg`) and the impact frames plus 2.
  - No prop inside a head or body. Feet on the floor.
  - A faced character or a readable board in every shot.
  - "Time beat money / Nothing's guaranteed" (26.5-28.5 s) is the bank counter with the cat egg and the NOT A PROMISE label. That's intentional for the final gag.

Not uploaded. It waits for MAIN QA and a BM GO.
