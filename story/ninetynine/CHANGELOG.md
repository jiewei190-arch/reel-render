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

## v2 (Oct 29)
**Fixed: the biggest v1 gap, set density and saturation.** The second gap, ground texture, is also mostly fixed.
- **Far landscape:**
  - pale mountain ridge with snowcaps
  - two layers of green rolling hills with tree clumps and highlights
  - lighter horizon mist
- **Street:**
  - the road is now a saturated dirt-cobble with highlighted stones near the camera and wheel ruts
  - green grass verges with tufts and red/white flowers
  - pavement slabs in varied tones
  - 420 pebbles with highlights
  - a darker band toward the bottom of the frame, like the reference's lower ground
- **Colour coding:**
  - red/teal bunting across the street
  - a half-red/half-teal coin emblem painted in the road
  - far-house roofs alternating red and teal
- **Clouds:** bigger (scale 1.6), deeper blue sky.
- **Grade:** vignette cut from .38 to .16 and bloom from .22 to .14, which had been washing out the colour.
- **Characters:**
  - outlines 4.5 → 5.5 px
  - heads 44 → 48 radius
  - bakers wear team-coloured tunics with cream aprons
  - toque lobes no longer show inner outlines
- **Blueprint (gap 4, started):** now a real set.
  - a desk in perspective under a brick wall with a glowing bread oven and red/teal jars
  - the sheet is laid on the desk in perspective
  - a pen with a glowing tip draws the lines
  - a candle in the foreground
- **Band measurement** (`measure.py`, wide frame: ref 16.6 s vs ours 55 s). Ground mid and low now match on saturation:

  | Band | Reference | v1 | v2 |
  |---|---|---|---|
  | Ground mid | s .51 | s .32 | s .49 |
  | Ground low | s .57 | s .34 | s .56 |
  | Whole frame | s .35, luma SD 49 | s .26, luma SD 43 | s .36, luma SD 48 |

- QA: WARN only. The jar shelf sits in the top 150 px during the blueprint, and props touch the outer 24 px.

**Still off (biggest first)**
1. **Overhead and night-till sets are still flat graphics.** (Rebuilt for v3 but not in this render.)
2. **Hook and end boards.** They sit small in a big empty foreground. The reference's opening prop shares the frame with characters and a foreground emblem.
3. **Near horizon is too dark** (v .69 vs .89). The shops and characters sit in that band; the reference's band is open, cream haze.
4. **Medium shots.** Their foreground blur props are boards and a queue customer, which hide too much of the frame.
5. **Blueprint shelf** sits in the top safe zone.

## v3 (Oct 29)
**Fixed: the biggest v2 gap, flat insert sets.**
- **Overhead:** now a real drone view straight down on the street.
  - grass with mottling, the cobbled street with lit stones, pavement
  - the coin emblem
  - shop roofs from above (tiles, ridge, smoking chimneys, striped awnings)
  - tree crowns with cast shadows
  - villagers seen from above (coloured shoulders, round heads, caps and toques, shadows); the teal queue shuffles in and grows from 3 to 9
  - slow rotate and push
- **Night till:** now a candle-lit interior.
  - panelled plum wall and a moonlit window with twinkling stars
  - a shelf of loaves, and the LEGEND note pinned to the wall, which gets the UNPROVEN stamp
  - a cashier (round head, cap, moustache) behind the counter; the cashier's face changes from sly to shocked when the drawer slides out with coins
  - a blurred basket of loaves in the foreground
  - a warm candle glow
- **Blueprint:** the sheet sits closer and larger on the desk, the push is gentler, and the jar shelf is out of the top safe zone.
- **Hook and loop end:** the camera is higher, so the half-red/half-teal coin emblem fills the lower frame under the boards. The reference's opening has the same layout: prop above, floor emblem below.
- QA: WARN only.
  - Right safe column: the hook emblem's edge, the pushed-in blueprint sheet's edge, and the till's right side.
  - Outer 24 px.

**Still off (biggest first)**
1. **Camera motion.** The reference roams one set for its whole opening, with a new framing every 1-1.5 s. Ours cuts between static-ish slow pushes. (Being built for v4: one continuous move from the boards back past the bakers to the wide shot, plus three-key moves inside each medium and wide shot and a second whip pan.)
2. **Wide shot.** The boards still sit by the shops. The reference has a central object on the track between the two sides.
3. **Right safe-column overlaps** (above).
4. **Near-horizon band is darker than the reference's cream haze.**
