# lemonade (story-fable look, template #30): CHANGELOG

Story: two lemonade stands (red vs teal) cut prices until neither earns anything, the prisoner's dilemma; the split PRICE WAR board opens and closes the reel (loop).
Code: reels/t_lemonade.js + reels/t_lemonade.html, our own module reels/styles/storyfable/fable.js (built from reference/STYLE_STORY.md; the PC module is not on GitHub), specs/lemonade.json (af_heart 0.97, popup bed), ev_lemonade.json.
Compare sheets: story/lemonade/compare_vN.jpg (reference left, ours right, matched by kind of shot; band measurements at the bottom) made with story/lemonade/compare.py.

## v1 (Oct 29)
- Built fable.js:
  - perspective camera (world cm, eased camera keys);
  - three depth-of-field layers (far blur, sharp focus plane, near blur), blurred at quarter resolution;
  - gradient sky with flat-bottomed cumulus (white tops, blue-grey undersides, contour arcs), hazy hills with a tiny town and a cream horizon mist;
  - a dirt track in true perspective (ruts, pale edges, a grass centre strip, perspective pebbles), grass tufts and round vector trees;
  - round-head characters (off-white disc about 30% of the height, half-lidded eyes with tapered brows, capsule body with a darker side and dashed stitch seams, stick limbs with round hands, caps and bucket hats, moustache/goatee, walk cycle, idle bob, blink, talk);
  - cream rim light by dilation; soft cast shadows to the lower right plus contact shadows;
  - props: lemonade stands with striped team-colour awnings and flip-price cards, the split PRICE WAR board with split-flap digits;
  - time-of-day grade (day -> sunset -> night), bloom, vignette, grain, whip-pan smear, light flash;
  - 1-2 word Nunito 900 captions with a dark outline, timed inside each line.
- Reel: about 20 shots driven from the voice timeline:
  - the board hook and a roaming camera, Red/Teal mediums with whip pans, price-card close-ups with flips;
  - the customers walking over; the time-lapse summer with a bird landing on Red's cap; the board flipping 60/50/40/30;
  - the candle-lit blueprint desk: the cost of a cup drawn on with a glowing pen tip, then the 2x2 payoff table (OK/WIN/0 cells, arrows, a BOTH LOSE stamp), then THE PRISONER'S DILEMMA;
  - pink lemonade, the shady tree, and the board flipping back to $1.00 for the loop.
- Speed: the first version used canvas `filter` blur/drop-shadow for rim, shadows and DOF; that cost 12 s a frame, and replacing them with dilation, gradients and quarter-resolution blur brought it to 0.9 s.
- QA: WARN (right-column content, content at the frame edge). Loudness -15.8 LUFS, true peak -2.1 dBTP, length 70.8 s, closing line OK.
- Still off (from compare_v1.jpg):
  1. **Wide framing.** The customer queues fill the middle of the track, so the wide shot reads as a crowd medium. The reference keeps the track clear and puts the armies outside the two characters. This also skews the bands: our horizon band is #ad9f86 vs the reference's cream haze #e1dbcc.
  2. **Sky:** greyer (#c6cfd5) than the reference blue #b3d5ef.
  3. **Medium shots** are too loose. The reference's mediums fill the frame with a big head and a strongly lit, detailed background.
  4. **Lighting moods:** we only have day + the desk. The reference uses night street, candle interior and forge glow with characters in them.
  5. **Props:** no prop detail like the reference's anvil, spears and barrels (texture, highlights, rivets).

## v2 (Oct 29)
- Fixed the biggest v1 gap, the wide framing:
  - the customer queues now stand outside the two owners and run back along the track, like the reference's two armies, so the track is clear to the vanishing point;
  - the PRICE WAR board moved behind them into the distance; the board close-ups move the camera to it.
- Mediums: camera at head height, head at about 40% of the frame, body to the bottom edge, background at dof 7 (closer to the reference's king/blacksmith mediums).
- Night mood: "You see, neither one was being silly" is now a night street shot. Both owners hold lanterns (new lantern prop) with warm light pools, under a moon and a navy sky with dark-blue clouds. The candle desk follows.
- Palette: bluer sky (#6eaee6/#a7d0f3), lighter cloud undersides, a stronger cream horizon mist, warmer and brighter dirt/grass.
- QA: WARN (right-column content, frame-edge content); otherwise PASS (-15.8 LUFS, -2.1 dBTP).
- Bands (wide frame), ref vs ours:

  | Band | Reference | Ours |
  |---|---|---|
  | sky | #b3d5ef sat .25 | #cce2f4 sat .16 (too pale: the clouds dominate the band) |
  | horizon | #e1dbcc | #ada892 (our owners stand in that band) |
  | ground mid | #b49d5c sat .51 | #a89668 sat .41 |
  | ground low | #937540 | #a39354 |
- Still off (compare_v2.jpg):
  1. **Characters** are the biggest gap now. The reference's heads are larger with an irregular brown outline (not black), warm soft shading, bigger and wider-set eyes, a bold moustache and a lit/shaded body. Our outlines scale up with the camera, so they are too thick in close-ups.
  2. **Sky saturation and ground saturation** are low.
  3. **Wide:** the owners stand too close to the camera; the reference's two characters are smaller, with more track and sky.
  4. **Sets are emptier** than the reference (no detailed props or textures).

## v3 (Oct 29)
- Fixed the biggest v2 gap, the characters (STYLE_STORY section 1 against the reference's close-ups):
  - brown outline (#33211a) instead of near-black, with screen-normalised line weight (3-6.5 px at 1080 wide, so close-ups no longer get heavy outlines);
  - a bigger head (radius 19.5) with a slightly irregular hand-drawn outline;
  - warm soft shading on the head (a light upper left, a warm shade at the lower right);
  - face features 1.22x larger and set wider;
  - a lit left side and shaded right side on the capsule body, plus a shoulder shade.
- Rim light: thinner (1.8-4.2 px), a backlit sticker edge like the reference instead of a thick glow.
- Palette: more saturated sky (#5aa0e0/#94c5f0); warmer, more saturated dirt and grass.
- Wide camera pulled back slightly (more track and sky).
- Soft diagonal sun rays on day shots.
- QA: WARN (right column, frame edge); rest PASS.
- Bands, ref vs ours:

  | Band | Reference | Ours |
  |---|---|---|
  | sky | #b3d5ef sat .25 | #c5def3 sat .19 |
  | horizon | #e1dbcc | #b4ad95 |
  | ground mid | #b49d5c sat .51 | #a99358 sat .49 (close) |
  | ground low | #937540 | #a18f4b |
  | whole frame | sat .36, luma std 49 | sat .37, luma std 46 (matched) |
- Note: the code in this commit already contains the v4 set dressing being worked on (bunting, fields, crates, flowers, camera drift); lemonade_v3.mp4 was rendered before those edits.
- Still off (compare_v3.jpg):
  1. **Sets are empty** next to the reference, which is dense with props (anvil, barrels, spear racks, flags, crop patchwork, castles).
  2. **The camera holds** two-key eases; the reference roams constantly.
  3. **The time-lapse sunset is weak**; the reference shifts strongly to purple dusk with stars.
  4. **No warm interior with characters** (the reference's shop and forge).

## v4 (Oct 29)
- Fixed the biggest v3 gap, the empty sets:
  - red/teal/cream bunting strung across the street on wooden poles at two depths (more team-colour props, like the reference's flags);
  - patchwork crop fields with furrows on both sides beyond the trees;
  - crates of lemons beside each stand (rim-lit, shadowed);
  - flower clumps on the verges.
- Camera: a constant small roaming drift (x/y sway) on every shot on top of the eased keys, so no frame is locked off.
- Fix: sprites within 90 cm of the camera are skipped (a bunting pole smeared across the board close-up).
- QA: WARN (right column, frame edge); rest PASS. Bands about the same as v3 (frame sat .37 / std 47 vs ref .36 / 49).
- Note: the code in this commit already contains the v5 grocer's shop interior being worked on; lemonade_v4.mp4 was rendered before it.
- Still off (compare_v4.jpg):
  1. **No warm interior with characters** (the reference's symmetrical shop, red client left, teal right, candles) is the biggest remaining scene-type gap.
  2. **Sky band** is paler (sat .19 vs .25) and the **horizon band** greener/darker (#b1aa92 vs the cream #e1dbcc) because our owners and stands stand in it.
  3. **Medium shots:** the reference heads fill more of the frame, with strong side light.

## v5 (Oct 29)
- Fixed the biggest v4 gap, the missing warm interior with characters. "Exactly what the lemons and sugar cost" is now a lantern-lit grocer's shop:
  - a symmetrical layout like the reference's blacksmith shop: Red at the left end of the counter, Teal at the right, the grocer between them on a step, turning his head side to side;
  - a timber-framed back wall with red and teal banners and shelves of lemons and sugar sacks;
  - a plank floor in perspective; two hanging lanterns with warm light pools under a warm multiply grade;
  - the costs as physical tags popping onto the counter: LEMONS 20¢, SUGAR 10¢, = 30¢ (STYLE_STORY rule 2: every fact is an object).
  - It replaces v4's blueprint cost sheet; the blueprint desk stays for the payoff table and the name.
- compare.py: the "symmetric two-sided" pair now uses the shop (30.4 s).
- QA: WARN (right column, frame edge); rest PASS. Bands unchanged from v4.
- Still off (compare_v5.jpg):
  1. **Detail density:** reference sets carry many more textured props (weapons, barrels, shields with rivets and highlights, castles on hills, crop patchwork with rows of soldiers).
  2. **Medium shots:** the reference heads fill more of the frame, with stronger side light and coloured light spill (orange forge, candle). Ours stay evenly lit by day.
  3. **Sky band** is paler (sat .19 vs .25) and the **horizon band** darker/greener than the reference's cream haze (our owners and stands sit in that band in the wide).
  4. **QA:** content in the right column (x>900, y 900-1650) during wides and the shop. It is a WARN, not a FAIL, but the teal side would need to move inward for a clean pass.

## v6 (Oct 29): after the owner's module landed (reference/story-fable 6b5e283)
- The main session asked us to start from the owner's fable.js and put the effort into rich sets. That message was queued at 05:15, before v1-v5 were built here.
- Decision: keep our module (it already covers the reel: interiors, desk, flip props, night grade, 70 s of shots) and port the owner's distinctive techniques into it, rather than rewrite the reel on the owner's API.
  - The owner's per-sprite full-frame compositing would also cost several seconds a frame on this CPU-only container.
  - Ported:
    1. **Sheared-silhouette cast shadow:** the sprite's own silhouette, tinted, sheared onto the ground to the lower right, plus a contact shadow. It replaces our polygon shadow.
    2. **Aerial perspective:** the far layer is composited with saturate(.9) contrast(.93) brightness(1.04), so the background lifts toward cream.
    3. **Finish:** contrast(1.1) saturate(1.03) instead of a neutral soft-light pass.
  - Added the owner's reels/style_measure.py and used it alongside compare.py.
- Rich sets (the main session's named gap):
  - **Village street:** illustrated timber-framed houses line both sides into the distance. They have tiled roofs with a highlight, chimneys, windows with shutters and flower boxes, doors, and red/teal striped awnings on every third house.
  - Lamp posts along the street, which light up at night (warm pools on the night shot).
  - A turning windmill on the far hill.
  - Trees moved behind the houses.
  - **Desk:** a ruler, a pencil, two lemons and a coin stack around the blueprint.
- Render: 4 workers instead of 2 (about 20 minutes a full render).
- QA: WARN (right column, frame edge); rest PASS.
- style_measure.py, wide field frame, ref vs ours:

  | Band | Reference | Ours v6 |
  |---|---|---|
  | sky mid | #b4d6f0 .25 | #cde4fa .18 |
  | near horizon | #e2dbcd .09 | #b3a594 .18 |
  | ground mid | #b69d5d .49 | #ab945c .46 |
  | ground low | #957541 .56 | #a89453 .50 |
  | saturation | .352 | .361 |
  | contrast (L std) | 49.3 | 48.2 |
  | detail | 19.2 | 24.2 (busier now) |
- Still off (compare_v6.jpg):
  1. **Sky band** too light and pale.
  2. **Horizon band** has our owners and stands instead of cream haze.
  3. **Detail energy** is now above the reference; the far houses could be hazier and blurrier.
  4. **Medium shots** lack the reference's coloured side light.
  5. **QA:** right-column WARN.

## Paused (Oct 29)
Paused at v6 (6ad11e3) for the owner's priority job (whatif "See in Complete Darkness", batch C). Next steps when resumed:
- sky band saturation;
- cream horizon haze in the wide;
- haze/blur on the far houses (detail energy is above the reference);
- coloured side light in the mediums;
- move the teal side inward for a clean right-column QA.

## v7 (Oct 29): resumed after the whatif batch C job
- Main session: the What If shots are paused (new script and voice coming), so back to this reel from our fable.js.
- Fixed the biggest v6 gap, seen side by side with the reference's 16.6 s field frame. Our wide was soft and hazy (far-layer blur plus bloom) where the reference is crisp from front to back.
  - Wide camera: depth of field 2.6 -> 1.0 (sharp to the vanishing point), camera a bit farther back and higher (z -20, y 172, horizon 870).
  - Bloom .16 -> .09.
  - Track: a narrower green centre strip (22 cm); darker, wider ruts with a pale edge; more like the reference's rutted path.
- Colour:
  - the owner's sky palette (#4f97dc / #84baea);
  - a wider, denser cream horizon mist;
  - stronger aerial perspective on the far layer (saturate .86, contrast .9, brightness 1.06).
- Mediums: a new F.sideLight (a warm key screened in from the left, a cool multiply fill from the right) on every street medium, toward the reference's side-lit mediums.
- QA: WARN (right column, frame edge); rest PASS (-15.8 LUFS).
- style_measure, wide frame, ref vs ours:

  | Band | Reference | Ours v7 |
  |---|---|---|
  | sky mid | #b4d6f0 .25 | #c6dff5 .19 |
  | near horizon | #e2dbcd | #aea090 |
  | ground mid | #b69d5d .49 | #a38a5b .44 |
  | ground low | #957541 .56 | #997f4b .51 (close) |
  | saturation | .352 | .367 |
  | contrast | 49.3 | 52.7 |
  | detail | 19.2 | 24.8 |
- Still off (compare_v7.jpg):
  1. **Sky mid band:** still pale because our big clouds sit in it.
  2. **Horizon band:** houses and stands instead of cream haze.
  3. **Detail energy:** above the reference (the village is busier than its fields).
  4. **Interiors:** the shop could use the reference's strong orange glow and darker corners.
  5. **Right-column QA:** WARN.
