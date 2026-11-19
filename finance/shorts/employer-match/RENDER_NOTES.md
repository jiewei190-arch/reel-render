STATE: rendered (FORMAT v1 recipe, PC build on the 9e679a1e engine)

# employer-match: render notes (PC, style S4 WOULD-YOU-RATHER, voice Christopher)

`video.mp4` sha256 `14be14ed3dea1e687159bd40a357641a832a72d96bd05e4ff714a44467c8aebc`. 1080x1920, 30 fps, 885 frames (29.50 s), SUB=4 motion blur with the quality pass, 21.9 MB.
This supersedes the rejected cloud build (CODE_FINAL 763c47a: D2 voice, old engine).

## Build
- **Voice:** ElevenLabs Christopher (`eleven_v4`), voiced in the cloud at e816b53. 447 characters, 29.5 s.
  - Whisper (small.en) on the hook line alone: "Your job might be paying you money you never take." Exact.
- **Recipe:** `recipe.json`, written in the cloud for the 9e679a1e rules and re-timed to the ElevenLabs voice. 15 shots. Composition `EmployerMatchRecipe` / `EmployerMatchRecipeSub`.
- **PC changes:**
  - `captionsTop` is on: the small full-sentence line near the top.
  - **Fixed after the v1 scrub, "Think fast" (7.9-9.8 s):** this was a 4.2 m orbit on the room centre with both actors outside the frame, so the S4 guess-pause showed an EMPTY office for about 1.9 s. It is now a split screen: Spender (curious) on top, the boss holding out the offer below. "TAKE IT? COMMENT" stays as the fixed caption.
- **UPLOAD.md:** style S4, voice Christopher, and MAIN's S4 title "Free $1,500 a Year. Would You Take It?". The description is unchanged.

## Time
- **Build:** recipe_build takes about 1 s; 9 GPU stills (15 s each).
- **Render, on the RTX 4060 at SUB=4:**
  - v1: 114 s render, 141 s total;
  - v2 (final): 144 s render, 174 s total, 180 s wall.

## Pre-post gate (`RECIPE_QA.md`; `frame0.jpg`, `strip_0-2s_6fps.jpg`)
All 13 checks PASS:
- frame 0 is close (Spender 71 %);
- hook "FREE MONEY. YOU SAID NO." (5 words);
- who + what (Spender, the $ bag);
- stake at 0.00 s;
- first word "Your" at 0.09 s;
- thud at 0.00 s;
- no names in the first 2 s;
- tag from 7.91 s;
- 4 moves in the first 3 s;
- music + SFX at 0;
- emotion change at 0.63 s;
- no wide or dark shot in the first 1 s;
- 29.50 s long.

Retention tactics:
- **hookZoom:** yes.
- **Eggs:** `cat` and `sticky`.
- **finalGag:** `catCoin`.
- **Guess pause:** "Would you take it? Think fast." with the TAKE IT? COMMENT caption (7.9 s).
- **Open loop:** "Spender said no... without even knowing it" (14.2-16.5 s, about 50 %).
- **Twist:** "Then the statements arrive": Saver's $4,500 count-up vs Spender's $0 (19.8 s, 67 %).
- **Loop seam:** the hook returns on "Skip". The last shot is the frame-0 close-up on Spender, from sad to sly into frame 0.

## QA
- **Audio:** story_mix (22 recipe cues, `upbeat`) then mux_voice with `LIMIT=0.74 TPMAX=-1.5`: **-14.1 LUFS, true peak -2.6 dBFS**.
- **Recipe clip QA:** 885 frames x 4 sub-frames, **0 clips**, including the extras, eggs and set boxes.
- **critic.py, against the recipe cuts (`tools/recipe_plan_for_critic.py`):** 0 FAIL.
  - SYNC: 14 cuts, max offset 1 frame.
  - STATIC: longest 0.37 s.
  - EDGES: 13.0 %.
- **By eye:**
  - 6 fps scrub (`scrub_6fps_0-12s.jpg`, `scrub_6fps_12-24s.jpg`, `scrub_6fps_24-30s.jpg`) and the impact frames plus 2 (`scrub_impacts.jpg`).
  - No prop inside a head or body. Feet on the floor. No blank or blocked frame after the v2 fix.
  - **Two crops to note:** "$1,500 EVERY YEAR" (3.1-5.8 s) and "PAY $50,000 / SAVE 6% = $3,000" (11 s) are cropped at the frame edges during their slam-zooms, but the numbers stay readable.

Not uploaded. It waits for MAIN QA and a BM GO.
