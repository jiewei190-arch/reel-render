# icecream (story-fable job, template #30): CHANGELOG

Story: why two rival ice-cream carts end up parked side by side in the middle of the beach (Hotelling's law). Red cart vs teal cart.
Compare sheets: `compare_vN.jpg`, reference frame left, ours right, matched by kind of shot (`compare.py`).

## v1 (Oct 29): own engine, built from the notes before the owner's module arrived
- Files: `reels/styles/storyfable/fable_h1_v1.js`, `reels/t_icecream_v1.js`. Full 67 s story, af_heart narration (`specs/icecream.json`), 1-2 word captions, loop on the "STEPS APART" sign.
- Sheet: `compare_v1.jpg` (from stills; the full v1 render was stopped when main sent the owner's `fable.js`: no point finishing a render of an engine we are replacing).
- Biggest gaps against the reference:
  1. **Sets far too plain:** flat sand and a thin sea band vs the reference's illustrated, detailed sets (castles, hills, trees, tiled floors, rows of soldiers, ruts and grass in perspective).
  2. **Characters too small and thin-lined:** outlines about 2-3 px vs the reference's 5-6 px; heads too small in the wide shots.
  3. **No real perspective lead line:** the reference always has a track/path/floor to the vanishing point between the rivals.
  4. **Top-down shot reads as a diagram,** not a painted overhead like the reference's armies on a field.
  5. **The time-lapse grade is too weak;** the blueprint is too empty (no desk, candle or perspective).
- Decision: switch to the owner's `fable.js` (commit 6b5e283) as main asked, and grow the owner's 10 s ice-cream test into the full reel.
