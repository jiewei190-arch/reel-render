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

## v2 (Oct 29): the owner's fable.js, full story, richer beach set
- Rebuilt on `reels/styles/storyfable/fable.js` (owner, 6b5e283), grown from `t_storytest.js` into the full 67 s reel (`reels/t_icecream.js`), af_heart. Render: `icecream_v2.mp4`. Sheet: `compare_v2.jpg`.
- Set: seaside town with red/teal roofs and a lighthouse on the headland, sailboats, a pier, beach huts, lifeguard towers, dune grass, palms, umbrellas coloured by side, bunting and distance posts along the boardwalk to the vanishing point, a beach ball and bucket in the foreground. Overhead: a painted plan view (sea, foam, sand, dunes, umbrellas, carts). Props: the 1929 journal on a towel with a stamp; a blueprint on a desk with a glowing pen and a "STUCK" stamp.
- Engine speed-ups marked "H1" in fable.js (same look): bounding-box sprites, batched DOF/haze layers, single-pass rim, one blur for the cloud layer. 112 s -> 1.6 s per frame on this CPU-only box.
- QA: WARN only. Blueprint reaches the right UI column (52.8-60.5 s); wide shot touches the frame edge (13.5-16 s).
- Biggest gaps against the reference (sheet):
  1. **Ground and colour bands:** our lower half is a flat orange boardwalk and plain sand. The reference has a varied ground: ruts, grass verges and flowers along the path, muted yellow-green earth. Measured: ground mid ours #b4884d (sat .57) vs ref #b69d5d (.49); ground low #a87641 (.61) vs #957541 (.56); the near-horizon band is umbrellas/sand (#b8a380) instead of a cream haze (#e2dbcd), because our horizon sits at 36% down vs about 44%.
  2. **Midground reads as noise:** the umbrella rows melt into a blurred stripe; the reference midground (soldiers, trees, castle) stays readable but hazed.
  3. The overhead looks like candy icons rather than a painted field. The time-lapse night is too weak (no stars or moon).

## v3 (Oct 29): ground and colour bands
- Fixed v2's biggest gap, the ground and colour bands:
  - sand palette matched to the reference's measured bands;
  - horizon moved to about 44% in two-shots and close shots;
  - a stronger cream horizon haze;
  - cart-wheel ruts and sea-grass / flower verges along the boardwalk (like the reference's track verges);
  - a sharper wide-shot midground (DOF 2.2 -> 1.2);
  - stars and a crescent moon in the time-lapse night;
  - the blueprint shrunk to clear the right UI column.
- Measured (wide shot vs ref 16.6 s): near horizon #d5d1c3 (ref #e2dbcd), ground mid #a38d4f -> brightened to the ref's value, ground low #977f41 (ref #957541), mean saturation .376 (ref .352).
- Render `icecream_v3.mp4`, sheet `compare_v3.jpg`. QA WARN only: the end-card question flags in the right column (60.8-66.8 s); the wide shot touches the edges (13.5-16 s).
- Biggest gaps now:
  1. **The overhead** still reads as candy icons on flat sand. The reference's is a painted field: grass texture, dense crowd formations shaped like arrows, glints, a tilt-shift blur at the top and bottom.
  2. **Character scale in the side-by-side wides:** the reference's rivals are about 1.6x bigger in frame.
  3. **The boardwalk** is too orange and too wide compared with the reference's earthy track.

## v4 (Oct 29): the overhead, character scale, earthier wood
- Painted overhead like the reference's field:
  - textured sand with ripples and speckle, sea depth bands, wave crests, foam lace, glints;
  - dune grass;
  - 150 small umbrellas and 520 beachgoers that turn red/teal by nearest cart and stream toward it in formation;
  - cart glints, and a tilt-shift blur at the top and bottom of the frame.
- Rivals about 1.24x bigger in the side-by-side wides (f 760 -> 940).
- Earthier boardwalk wood.
- Render `icecream_v4.mp4`, sheet `compare_v4.jpg`. QA WARN only (end-card question pennants in the right column; wide shot touching the edges).
- Biggest gaps now:
  1. **Material shading.** In a character close-up crop (ref 1.5 s vs ours 44 s), the reference's robes, props and carts have soft painterly volume: a lit upper-left to shaded lower-right gradient and fine grain. Ours are flat vector fills.
  2. **The boardwalk** still dominates the bottom third of the wides; the reference's track is narrower, with the ground showing on both sides.

## v5 (Oct 29): material shading on characters and props
- Material pass in `fable.js` (H1, `fancy()`), on every rim-lit sprite (characters, carts): a soft lit upper-left to shaded lower-right gradient kept inside the sprite's alpha, plus very light grain. The vector fills now have the reference's painterly volume. The first try had grain at .07, which read as speckle; settled at .022.
- Narrower boardwalk (72 -> 54 cm), so more ground shows on both sides, like the reference's track.
- Render `icecream_v5.mp4`, sheet `compare_v5.jpg`. QA WARN only (as v4).
- Biggest gaps now:
  1. **Midground density behind the rivals:** the reference stacks each side's people (the armies) right behind its king, so every wide shot is full of red and teal. Ours has small blurred umbrellas there.
  2. **Single-character close shots** are framed looser than the reference's (head about a third of the frame width).

## v6 (Oct 29): crowds behind the rivals, tighter close shots
- Each side's customers (18 per side, round-head figures in red- or teal-side costumes with bucket hats, stripes, moustaches; some holding cones) queue behind their vendor in every wide and two-shot, filling the midground like the reference's armies behind the kings. The nearest four per side get the rim light and cast shadow.
- Single-character close shots moved in (camera distance 225 -> 170), closer to the reference's framing. The hook's sign drops out once the camera pushes past it.
- Render `icecream_v6.mp4`, sheet `compare_v6.jpg`. QA WARN only (as before).
- Biggest gaps now:
  1. **Distant scenery:** the reference's far layer (snowy mountains, a castle on green hills, tree clumps) rises well above the horizon and reads clearly through the haze. Our headland and town are low and small, so the sky dominates the upper half.
  2. **Sky depth:** the reference layers clouds at several distances, the far ones smaller and hazed. Ours has four similar clouds.

## v7 (Oct 29): the far layer
- Far scenery like the reference's mountains and castle hills: blue-grey peaks with snow caps, green coastal hills with tree clumps, a cliff lighthouse with red bands, small hazed far clouds. Drawn as one offscreen layer, blurred once, then lifted toward the cream horizon haze.
- Render `icecream_v7.mp4`, sheet `compare_v7.jpg`. QA WARN only (as before).
- Biggest gaps now:
  1. **Lighting moods:** the reference cuts to night and candle-lit scenes (tent, street, blacksmith) for its dramatic beats. Ours is daylight except the time-lapse.
  2. **Props in hand:** the reference's characters always hold something (spear, shield, money bags, candle); ours mostly stand empty-handed.

## v8 (Oct 29): a night beat with warm light
- "Neither cart can leave" is now a night stand-off (like the reference's night street and candle-lit shop): deep blue night grade, stars, and a lantern on each cart glowing warm. Both vendors hold their scoops (props in hand, like the reference's characters).
- Vendors keep to the outer side of their cart until the carts are far apart (fixes vendors crossing over when the carts edge away).
- Render `icecream_v8.mp4`, sheet `compare_v8.jpg` (the time-lapse pair is swapped for a night pair: ref 26.5 s vs ours 49.5 s). QA WARN only: right-column content 35.5-38.8 s and 60.8-66.5 s; wide shot at the edges 13.5-16 s.
- Biggest gap now: **night contrast.** Ours is hazy and washed out (the bloom and haze lift the blacks). The reference's night is deep, saturated blue with crisp warm highlights.

## v9 (Oct 29): deeper night
- Night stand-off: a contrast/saturation pass (contrast 1.35, saturate 1.3, brightness .92) before a stronger blue wash, so the blacks stay darker and the lamps read crisper.
- Render `icecream_v9.mp4` (current best), sheet `compare_v9.jpg`. QA WARN only: right-column content 35.5-38.8 s and 60.8-64.5 s; wide shot at the frame edges 13.5-16 s.
- Still off (next candidates):
  1. The night keeps a cream haze band at the horizon (the day horizon haze isn't switched off at night); the reference's night has crisp, saturated blues there.
  2. The reference's settings are more varied (courtyard, interiors, a forge, a moonlit street); ours is one beach plus two prop shots. That's a story choice, but it limits how many lighting moods we show.
  3. Fine painterly texture in the far scenery (the reference's castle and trees carry more small detail).
  4. QA warnings: the YES/NO pennants on the question shot reach the right column; the quarter-position wide shot touches the frame edges.
