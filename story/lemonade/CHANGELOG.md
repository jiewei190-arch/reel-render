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
