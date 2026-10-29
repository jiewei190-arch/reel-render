# ninetynine: CHANGELOG

Story-fable reel, "Why do prices end in .99?" Two rival bakeries, Red and Teal. The reference look is from `reference/STYLE_STORY.md` (branch reference/story-fable). Only the look and techniques are copied; the story, shots and characters are our own.

- Files: `reels/t_ninetynine.js`, `reels/t_ninetynine.html` and `reels/specs/ninetynine.json`. The style module is `reels/styles/storyfable/fable.js`, which we built ourselves from the notes.
- Output: `jobs/ninetynine/ninetynine.mp4`.
- Compare sheets: `compare_vN.jpg`. Reference frames are on the left, ours on the right. Build them with `python3 -I story/ninetynine/compare.py REF.mp4 OURS.mp4 OUT.jpg vN`.

## v1 (Oct 29)
**What it has**
- Perspective street set:
  - cobbled road to the vanishing point, pavement, kerbs and pebbles
  - two bakeries in red and teal
  - flip-digit price boards, which open and close the loop
  - lamps and queues
  - a blurred flower barrel in the foreground
- Round-head characters:
  - half-lidded eyes and tapered brows
  - capsule bodies with a dark side and stitch seams
  - stick limbs, a cream rim light and long cast shadows
- Depth of field: a single blur pass per depth layer, which brought rendering from about 8 s to under 2 s per frame. Medium shots use dof 6-7 and focus on the baker.
- Camera and transitions: the camera roams within each shot, with one whip pan and a light flash into the night till.
- Captions: 1-2 words, Nunito 900.
- Sound: af_heart narrator, popup music bed, SFX.
- Facts: hedged and sourced in `sources.md`. I added a round-price twist line (Wadhwa & Zhang 2015) to reach 67.8 s, because qa.py wants at least 66 s.
- QA: PASS apart from one WARN (props touch the outer 24 px in the board shots).

**Still off (biggest first)**
1. **Set density and saturation.** The reference packs every frame with props, banners, a castle, mountains, green hills and a half-red/half-teal floor emblem. Ours is sparse and pale, with an empty tan ground, pale far houses and no green.
2. **Ground texture.** The reference ground has ruts, pebbles, grass edges and flowers in perspective. Ours is a flat gradient with faint slab lines.
3. **Clouds.** The reference clouds are bigger and puffier, with blue-grey undersides and contour arcs. Ours are small and greyish.
4. **Flat insert sets.** Our blueprint, overhead and night-till shots are flat graphics. The reference builds these in perspective too: the blueprint lies on a desk with a forge behind it, and the overhead is textured terrain.
5. **Line weight.** The reference outlines are a little heavier, and its heads slightly bigger relative to the body.
