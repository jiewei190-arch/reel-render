# Job: story-fable look (template #30), owner's request relayed Oct 29 by the PC session

Owner: "make a reel that will have the same exact look as the mp4 provided. each one should work harder and harder and keep refining until the quality of the video is met."

- **Reference:** branch `reference/story-fable` (commit 23d36ac): `reference/spear_vs_shield_reference.mp4` (45 s) and `reference/STYLE_STORY.md`, the full frame-by-frame notes. Read them first.
- **Code:** the canvas module those notes describe (`reels/styles/storyfable/fable.js`, `t_storytest`) is NOT on GitHub; it only exists on the owner's PC. Build your own from the notes.
- **Rule:** copy the look and techniques only. Use our own stories and characters, never their story, shots or characters.

## Per worker
| Worker | Branch | Folder | Story (two sides, red vs teal) |
|---|---|---|---|
| H1 | claude/halloween-h1 | story/icecream | Why two rival ice-cream carts end up parked side by side in the middle of the beach (Hotelling's law) |
| H2 | claude/halloween-h2 | story/ninetynine | Why prices end in .99: two rival bakeries |
| H3 | claude/halloween-h3 | story/newroad | The town that built a new road and traffic got worse (Braess's paradox) |
| H4 | claude/halloween-h4 | story/lemonade | Two lemonade stands in a price war until neither earns anything (prisoner's dilemma) |

## Loop (every version)
1. Extract reference frames: every frame around shot changes, about every 0.5 s elsewhere.
2. Render your version.
3. Make a side-by-side sheet (`story/<name>/compare_vN.jpg`): reference frames left, yours right, at matching kinds of shot. Compare colour (use the band measurements in STYLE_STORY 3b), line weight, texture, lighting (rim light, haze, cast shadows), character proportions (round off-white head about 30% of height, half-lidded eyes, stick limbs, capsule body with stitch seams) and motion.
4. Fix the biggest gap, re-render, and log it in `story/<name>/CHANGELOG.md` (version, what changed, what's still off).
5. Commit and push every version. Keep going until the side-by-side is hard to tell apart in style; at least 4 versions.

## Specs
- 1080x1920, 30 fps, H.264 + AAC, 60-75 s (owner rule: over 60 s).
- Narrator: af_heart (owner's standing voice rule), light music bed, small SFX at the reduced level.
- Captions: 1-2 words, Nunito-style bold white with a dark outline.
- End on the same prop it opens on (loop).
- Safe zones: top 250, bottom 1440, right column x > 900 from y 840.
- Every claim sourced (sources file).
- Run qa.py.
- Do not post or schedule anything.
