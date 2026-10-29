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
