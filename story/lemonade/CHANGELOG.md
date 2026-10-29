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
