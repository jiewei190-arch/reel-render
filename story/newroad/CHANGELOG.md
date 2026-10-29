# story/newroad CHANGELOG (template #30 story fable; reference: reference/story-fable 23d36ac)

Each version: render → compare_vN.jpg (reference left, ours right, at matching kinds of shot + the 3b band means) → fix the biggest gap → log here → push.

## v1 — baseline on my own engine (built from STYLE_STORY.md before the owner's fable.js was shared)
- Reel: newroad_v1.mp4 (65.5 s). Compare: compare_v1.jpg. QA: qa_v1.txt (all pass except length 65.5 < 66 s).
- Engine and reel archived in v1/ (fable_h3_v1.js, t_newroad.js).
- Biggest gaps vs the reference: sets nearly empty (bare floor, no props or architecture), characters small and
  rarely on screen, no foreground framing, horizon band too dark and saturated (ours #b2b280 s0.28 vs ref #e2dbcd s0.09),
  flat interiors (no warm candle light), wide shot has no characters.
- Next (v2): switch to the owner's fable.js and build rich illustrated sets with large characters in every shot.

## v2: on the owner's fable.js, rich sets, big foreground characters
- Reel: newroad_v2.mp4 (66.2 s). Compare: compare_v2.jpg. QA: qa_v2.txt (all pass; WARN outer 24 px in the square shots, where the duo touches the frame edge).
- Fix for v1's biggest gap: switched to the owner's module and built illustrated sets: a tiled square with houses, a fountain,
  stalls, banners, lamps and a red/teal emblem; a valley with patchwork fields and a windmill; an overhead map; a candle-lit study
  with a bookshelf, a moon window and a blueprint; a timbered street jam (dusk to night); Stuttgart; Seoul.
- Opening and closing: the red and teal commuters stand large in the foreground around the counter sign. The last shot
  returns to frame 0's exact camera for the loop.
- Study: a multiply/screen candle grade (warm centre, purple corners) and the mayor large in the foreground.
- Engine speed (no change in look; frame diffs were within a few percent of the slow version):
  - Sprites work in their screen bounding box on resized scratch canvases.
  - The rim halo and the sprite get one filter pass between them.
  - Blurs use shrink-and-grow; the bloom blur runs at 1/8 size.
  - Net: 10-28 s per frame down to ~0.6 s.
- Remaining gaps for v3:
  - The wide valley shot has no characters; the reference flanks the path with one of each side.
  - The horizon band is too dark and saturated (ours #b5b379 s0.33 vs ref #e2dbcd s0.09); it needs a stronger cream haze.
  - The foreground floor is bare (no blurred near props); the reference frames the bottom with props.
  - Characters cut at the frame edge; the reference keeps them inside and overlapping, holding props.
  - The sign is small next to the reference's big board.

## v3: horizon haze band, characters in the wide shot
- Reel: newroad_v3.mp4 (66.2 s). Compare: compare_v3.jpg. QA: qa_v3.txt (PASS, no warnings).
- Fix for v2's biggest gaps:
  - **Ground haze:** a cream band lies on the ground just below the horizon in all outdoor sets. It goes on after the ground and before the sprites.
    - Horizon band now #ddd4b7 s0.17 v0.87, from #b5b379 s0.33 v0.71 (ref #e2dbcd s0.09 v0.89).
  - **Wide valley shot:** a red and a teal commuter now walk along their roads, flanking the path to the vanishing point as in the reference.
  - **Opening/closing duo:** kept inside the frame (the outer-24 px warning is gone).
  - **Counter sign:** 30% bigger.
  - **End card:** moved above the sign.
- Remaining gaps for v4:
  - The sky is too pale (ours #cee4f4 s0.15 vs ref #b4d6f0 s0.25).
  - Mid ground is too dark (v0.61 vs 0.71).
  - Detail density: the reference packs the foreground with blurred props and gives every character a held prop; ours has bare floor at the bottom and empty hands.
  - The backdrop hills have no illustrated landmark.

## v4: colour bands closer, held props
- Reel: newroad_v4.mp4 (66.2 s). Compare: compare_v4.jpg. QA: qa_v4.txt (pass; WARN outer 24 px 0.8-3.2 s, where the steering wheel nears the left edge on the push-in).
- **Fix for v3's band gap**, wide shot, ours v3 -> v4 (ref):
  - Sky: s0.15 -> 0.20 (ref 0.25), from a bluer skyTop and skyMid.
  - Mid ground: v0.61 -> 0.67 (ref 0.71); low ground v0.60 -> 0.72 (ref 0.59). Warmer ochre fields and a lighter road.
  - Horizon unchanged at #e4d6b9 s0.19 (ref #e2dbcd s0.09).
- **Held props**, like the reference's spears and shields: red commuters grip a steering wheel and teal ones carry a briefcase (a new `hold` callback in fable.js's arm code).
- The floor emblem moved behind the pair so it no longer covers their legs.
- Remaining gaps for v5:
  - **Texture:** the reference's grass and floors are painterly, with mottling and hatching; ours are flat fills, most visibly on the overhead map.
  - **Square foreground:** the lower third is bare tiles and the yellow road.
  - **Edges:** the wheel touches the frame edge on the opening push-in.

## v5: painterly texture
- Reel: newroad_v5.mp4 (66.2 s). Compare: compare_v5.jpg. QA: qa_v5.txt.
  - WARN: the right safe column (60-66 s) and the outer 24 px (opening and close).
  - Both come from the new floor emblem decal, which is too big. This is a regression to fix in v6.
- **Fix for v4's texture gap:**
  - Built a painterly mottle tile once (soft light and dark blotches plus short hatch strokes) and laid it over every
    outdoor ground with soft-light; it drifts with the camera.
  - The overhead map is muted from bright checker greens to olive and gets the same mottle. It now reads much closer to the reference's painted field.
- **Floor emblem** is now a ground decal (drawn under the sprites), so the commuters stand on it the way the reference's figures stand on the round red/teal floor badge.
  - It came out too large: it fills the lower half and crosses the safe column.
- Bands unchanged from v4.
- Next (v6):
  - shrink the decal to clear the safe zones and edges;
  - then work on the remaining look gaps: the backdrop landmark and the denser prop clusters around the characters.

## v6: storybook landmark, framing fixes
- Reel: newroad_v6.mp4 (66.2 s). Compare: compare_v6.jpg. QA: qa_v6.txt (edge warning fixed; WARN right safe column 0-4.8 s and 58.5-66.2 s, from the teal commuter).
- **Landmark:** Hilltown's town hall now stands on its own hill on the skyline: walls, red and teal towers with waving flags, a gold clock tower. This mirrors the reference's far-hill castles with our own building.
- **Floor emblem:** the decal is shrunk to sit under the pair's feet.
- **Camera:** the opening and closing cameras are centred on the duo, so neither is cut on the push-in (outer-24 px warning gone).
- Next (v7): move the duo closer together and shrink the decal again, to clear the right column.

## v7: clean QA
- Reel: newroad_v7.mp4 (66.2 s). Compare: compare_v7.jpg. QA: qa_v7.txt (PASS, no warnings).
- **Duo:** moved closer together (teal x 84 -> 52) and the floor decal shrunk (.3 -> .26). The right safe column is clear in the opening and closing.
- **Still distinguishable from the reference:**
  - Crowding: the reference has three or more characters per frame, overlapping and holding props, with prop clusters (anvil, barrels, banners).
  - Interiors: the reference's are painted with fabric, fire and textured walls; ours are cleaner and flatter.
  - Bands: the sky is still a little pale (s0.18 vs 0.25) and the horizon a little warm (s0.19 vs 0.09).
  - The jam street and Stuttgart sets read sparser than the reference's packed streets.

## Paused after v7 (Oct 29)
- Paused at the main session's request for the priority "What If You Could See in Complete Darkness?" job (batch B).
- v7 (de5fa54) is the current best; resume from the gaps listed under v7.
