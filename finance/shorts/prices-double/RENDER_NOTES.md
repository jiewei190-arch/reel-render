STATE: rendered (FORMAT v1 recipe, PC build on the 9e679a1e engine)

# prices-double: render notes (PC, style S3 POV-YOU, voice Christopher)

`video.mp4` sha256 `0d75e5ae9e17e9fd9cf7dcf904ef1e9fff3ce57d9b7f6e0f5b4be47292f45248` (v3; v2 a8e9b475 was NOT GO). 1080x1920, 30 fps, 885 frames (29.50 s), SUB=4 motion blur with the quality pass, 22.0 MB.
This supersedes the old cloud render (contact_sheet.png and stills_sheet.png were removed).

## Build
- **Voice:** ElevenLabs Christopher, voiced in the cloud at e816b53. 384 characters, 29.5 s.
  - Whisper (small.en) on the hook alone: "P.O.V. Everything you buy just doubled." Correct.
  - On the full mix it matches the script word for word, with "doublings" heard as "doublins" and the numbers as digits.
- **Recipe:** `recipe.json`, written on the PC by the helper subagent from MAIN's brief, then fixed after GPU stills and two scrub passes. 16 shots, home set, POV camera. Composition `PricesDoubleRecipe` / `PricesDoubleRecipeSub`.
  - **Brief items:**
    - hook "EVERYTHING COSTS 2X";
    - frame 0: your hands holding a receipt that rips longer (three receipt segments drop in over 0.6 s);
    - price tags doubling ($1 to $2 to $4 to $8 to $8.7);
    - cliffhanger "And it's already happened three times..." over a covered "? ? ?" block;
    - payoff ×8.7 since 1970, about 3 doublings.
  - **PC fixes:**
    - **POV labels:** the receipt and labels sat 0.65 m from the lens and 0.5-1.0 m wide, so the text overflowed the frame ("MILK $4 / BREAD $" cut, "ICE 19"). They are now 0.32-0.6 m, 1.0-1.2 m from the lens, and readable.
    - **Frame 0:** the POV aimed at the top receipt segment while it was still dropping, so the lens tilted to the ceiling and the clerk was cut off. Now aimed at the clerk: 89 % coverage, with the receipt in front.
    - **sfx0 "rip":** not in the toon3d library. Now "paper", which the gate counts as a punch.
    - `"mood": "normal"` isn't a valid mood and failed tsc. Removed (it's the default).
    - **Tightened after the v1 scrub, where four shots read as an empty room:**
      - "Coffee" is now a slam on the friend's shocked face;
      - "about four percent" is a push-in on the 4%/YR board;
      - "double" (PRICE $4) is closer;
      - "about three doublings" pushes in on the $2/$4/$9 tags.

## Time
- **Build:** recipe_build takes about 1 s per pass. About 35 GPU stills.
- **Render, on the RTX 4060 at SUB=4:**
  - v1: 147 s render, 182 s total;
  - v2 (final): 157 s render, 191 s total, 197 s wall.

## Pre-post gate (`RECIPE_QA.md`; `frame0.jpg`, `strip_0-2s_6fps.jpg`)
All 13 checks PASS:
- frame 0 is close (the clerk, 89 %);
- hook (3 words);
- who + what (the clerk, the receipt);
- stake at 0.00 s;
- first word "POV:" at 0.09 s;
- paper at 0.00 s;
- no names in the first 2 s;
- tag from 1.0 s;
- 7 moves in the first 3 s;
- music + SFX at 0;
- emotion change at 0.63 s;
- no wide or dark shot in the first 1 s;
- 29.50 s long.

Retention tactics:
- **POV hook:** the receipt drop.
- **Eggs and gag:** the `cat` egg and the `catCoin` final gag.
- **Open loop:** "And it's already happened three times..." at 16.1 s (54 %), on the covered "? ? ?" block.
- **Twist:** the ×8.7 SINCE 1970 slam at 21.7 s (73 %).
- **Loop seam:** the hook returns on "So one day, it's just". The last shot is the frame-0 POV with the full receipt.

## QA
- **Audio:**
  - story_mix (51 recipe cues: 17 thuds, 12 impacts, 12 whooshes…) then mux_voice with `LIMIT=0.74 TPMAX=-1.5`: **-14.1 LUFS, true peak -2.5 dBFS**.
  - The full-mix Whisper shows the dense SFX don't mask the voice.
  - No dropouts over 0.6 s, no clipped samples.
- **Recipe clip QA:** 885 frames x 4 sub-frames, **0 clips**.
- **critic.py, against the recipe cuts:** 0 FAIL.
  - SYNC: 15 cuts, max offset 1 frame.
  - STATIC: 0 s.
  - EDGES: 21.5 %.
- **By eye:**
  - 6 fps scrub (`scrub_6fps_*.jpg`) and the impact frames plus 2. No prop inside a head or body.
  - **Two plainer stretches remain:**
    - "about four percent a year" (12-14 s): the 4%/YR board is readable but seen from a high angle in the room;
    - "about three doublings" (23-25 s): the $2/$4/$9 tags sit over open floor.

Not uploaded. It waits for MAIN QA and a BM GO.

## v3 (MAIN's NOT-GO on v2): changes
1. **Frame 0:**
   - The POV now aims at the clerk's FACE, so his face sits clear, below the hook band. It's fully readable.
   - The receipt segments drop LOW (y 0.98, 0.80 and 0.62, in front of his hands), and the drop is shortened to 0.12 m so they never cross his face.
   - The hook sits over the clean wall.
   - The loop shot matches.
2. **11.7-14 s, 4%/YR:** now a split screen. Top: the 4%/YR / 72 ÷ 4 = 18 board, close (it drops in). Bottom: the friend's face, shocked, then curious. No empty room.
3. **23-25 s, doublings:** also a split. Top: the $1 / $2 / $4 tags dropping in. Bottom: the friend reacting.
4. **Accuracy:**
   - The recipe count-up formatter rounded to whole numbers, which made "PRICE NOW $8.7" show as "$9".
   - Added an optional `count.decimals` (engine: types.ts, compile.tsx; the default of 0 is unchanged), so PRICE NOW lands on **$8.70**.
   - The last doubling tag reads **$8.70** (was "$8").

v3 QA:
- render 157 s wall;
- -14.1 LUFS, true peak -2.5;
- critic 0 FAIL (SYNC max 1 frame, STATIC 0 s, EDGES 20.0 %);
- clip QA 0;
- gate 13/13 (frame 0: the clerk, 71 %);
- no dropouts or clipping.
The voice and SFX cues are the same as in v2, which Whisper checked.
