STATE: rendered (FORMAT v1 recipe, PC build on the 9e679a1e engine)

# coffee-could-be: render notes (PC, style S2 RICH-VS-POOR, voice Tyler)

`video.mp4` sha256 `d9bd705dabaf230f56eb27eed068b7312277a54e4718dc28f51143a8d9b3c563`. 1080x1920, 30 fps, 885 frames (29.50 s), SUB=4 motion blur with the quality pass, 29.1 MB.
This supersedes the rejected cloud build (D2 voice, old frame-0 rules, SUB=1).

## Build
- **Voice:** ElevenLabs Tyler (`eleven_v4`, speed 1.15), voiced in the cloud at e816b53. 483 characters, 29.5 s.
  - Whisper (small.en) on the hook line alone: "Your $5 coffee is costing you $186,000 in this made-up example." Correct; the numbers come out as digits.
- **Recipe:** `recipe.json`. 15 shots; `node tools/recipe_build.mjs coffee-could-be` writes `src/shorts/coffee_could_be.recipe.gen.ts`, the composition `CoffeeCouldBeRecipe` / `CoffeeCouldBeRecipeSub` (`src/index.toolkit.ts`) and `RECIPE_QA.md`.
- **PC recipe changes**, in two passes:
  - **Frame 0 (stills):** in the cloud draft the cup slammed onto the counter BEHIND Spender, so frame 0 had no coffee in it. Now: a close-up of Spender grinning, holding his coffee out at the lens, with a "$5 COFFEE" tag slamming in beside his head (who + what in one frame). `captionsTop` is on.
  - **After the v1 scrub:**
    - **1.0-7.0 s:** the opening split ran 6 s without a cut. It now cuts at 2.1 s (close-up gasp on "hundred eighty-six") and 5.3 s (back to the split on line 2).
    - **17.0 s ("the real villain?") and 19.2 s ("Time is"):** Spender stood between the lens and the sign, so the frame was a red wall. He was removed from those two shots.
    - **20.7 s:** in the 30-year split a salmon-coloured bar crossed the coin pile. The bottom lens is now on Saver celebrating, and the next shot slams onto the pile.
- **Engine additions, used here** (finance/render-pc, backward-compatible):
  - recipe `captionsTop`, a small whole-sentence line near the top: research round 2, two-layer captions;
  - a smaller recipe corner tag (22 px at top 440) that no longer covers the word captions;
  - `Recipe.props[].from` is now typed as a time (the cloud recipes' numeric `from` didn't type-check);
  - `render.sh` takes `ENTRY=src/index.toolkit.ts`;
  - `tools/recipe_plan_for_critic.py` makes critic.py check the recipe's real cut times.

## Time
- **Build:** recipe_build takes about 1 s per pass. About 12 GPU still passes (15 s each) for frame 0 and the scrub fixes.
- **Render, on the RTX 4060 at SUB=4:**
  - v1: 196 s render, 233 s total;
  - v2 (final): 165 s render, 196 s total, 202 s wall.

## Pre-post gate (`RECIPE_QA.md`; frame 0 and the 0-2 s strip: `frame0.jpg`, `strip_0-2s_6fps.jpg`)
All 13 checks PASS:
- frame 0 is close (Spender 65 %);
- hook "$5 COFFEE = $186K?" (4 words);
- who + what (Spender, $5 COFFEE tag);
- stake at 0.00 s;
- first word "Your" at 0.08 s;
- impact at 0.00 s;
- no names in the first 2 s;
- no tag before 1.0 s;
- 6 moves in the first 3 s;
- music + SFX at 0;
- emotion change at 0.53 s;
- no wide or dark shot in the first 1 s;
- 29.50 s long.

Retention tactics:
- **hookZoom:** yes.
- **Eggs:** `cat` (on the shelf behind Saver) and `tv19`.
- **finalGag:** `catCoin`.
- **Open loop:** "But the coffee isn't the real villain..." at 17.0 s (58 %), with the covered "THE REAL VILLAIN?" board.
- **Twist:** "Time is." with the TIME slam at 19.2 s (65 %), then the $186,600 count-up.
- **Loop seam:** the hook text returns on "cups" and the last shot is the frame-0 close-up again.

## QA
- **Audio:** story_mix (22 recipe cues, `upbeat`) then mux_voice with `LIMIT=0.74 TPMAX=-1.5`: **-14.2 LUFS, true peak -2.1 dBFS**.
- **story_qa / recipe clip QA:** 885 frames x 4 sub-frames, **0 clips**, including the extras, eggs and set boxes.
- **critic.py, against the recipe cuts:**
  - SYNC: 14 cuts, max offset 1 frame.
  - STATIC: 0 s.
  - EDGES reports 3.7 %. That is a FALSE POSITIVE: the 1-12 white pixels at 21.2 s and 22.8 s are the quality pass's money sparkles on the coin pile, in critic's band at 55-80 % height. The captions sit in the top 35 %.
- **By eye:**
  - 6 fps scrub (`scrub_6fps_0-12s.jpg`, `scrub_6fps_12-24s.jpg`, `scrub_6fps_24-30s.jpg`) and the impact frames plus 2 (`scrub_impacts.jpg`).
  - No prop inside a head or body. Feet on the floor. The cup stays in front of Spender's fist.
  - No blank, blocked or dark frames after the v2 fixes.

Not uploaded. It waits for MAIN QA and a BM GO.
