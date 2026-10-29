# STYLE_STORY: the "story fable" look (template #30)

Owner's request (Oct 28 2026): make new reels look like the animation in this Short:
https://www.youtube.com/shorts/PLe2Gu3FDuA ("An Unstoppable Spear vs an Unbreakable Shield", @RicksClips3000, 45 s).
This file records how that Short is built and how we build the same *kind* of reel. Copy the techniques, never their story, shots or characters. Write our own stories.

Test reel: `reels/t_storytest.html` + `reels/t_storytest.js` (10 s, 1080x1920, 30 fps, silent), style module `reels/styles/storyfable/fable.js`. Owner feedback (Oct 28): v1 "not close enough"; it must match the reference look, with our own costumes and stories.

## What the reference does (studied frame by frame)

### 1. Character construction (checked at full resolution, Oct 29)
- **Head:** a round disc, slightly wider than tall, flat off-white with only a faint shade at the lower right, thin dark outline. About 30% of the character's height. No neck: it sits straight on the body.
- **Eyes:** not dots. Each eye is an upper-lid stroke with a half pupil tucked under it (a permanently half-lidded, knowing look). **Brows** are separate thick tapered strokes; their angle carries the expression.
- **Mouth** small; facial hair (handlebar moustache, pointed goatee) is a big part of telling characters apart.
- **Body:** a narrow capsule, about as wide as the head. Long robes reach the floor (feet just peek out); short tunics stop at the knees. Flat colour, one darker side, dashed stitch seams on hems and pockets.
- **Arms and legs:** thin dark stick lines with tiny round hands. Not sleeves.
- **Props in hand:** spear, money bags, a candle. One prop per character per beat.
- **Animation:** pose changes on each beat, head turns (the face slides sideways), eye/brow changes, idle bob. The camera does more work than the characters.

### 2. Sets
- Vector illustration with soft gradients and glows, not texture-heavy painting. Big flat cumulus clouds (white tops, blue-grey undersides). Strong lighting moods: sunny courtyard, sunset field, moonlit street, candle-lit interior, forge glow, blueprint blue.
- Real perspective: tiled floors, a track running to the vanishing point, rows of soldiers.
- Always a foreground element (a floor emblem, ivy, grass, an anvil), usually blurred.

### 3. Camera and editing (timeline, 45 s)
| Time | Shot | Camera / device |
|---|---|---|
| 0-6.5 | courtyard: two kings, blacksmith, anvil | one set, the camera **roams**: push in, truck to one king, pull back wide, push to the other (a new framing every 1-1.5 s) |
| 7-9.5 | "YEARS AT WAR" counter sign, blacksmith beside it | digits **flip** 099 -> 100, then pull back to reveal the wall |
| 10.5-11.5 | aerial: bridge between two armies | top-down drone, light-flash VFX |
| 12-12.5 | top-down field: red and teal army formations as arrows | graphic overhead |
| 13-21 | ground level down the track between the armies | dolly along the track; **time-lapse grade sweep** day -> sunset -> night -> day for "a whole week went by", with a bird landing on a crown as the gag |
| 22-23.5 | overhead again at sunset, glints on the two weapons | |
| 24-25.5 | night tent, candle, map | slow push, king turns his head |
| 26-27.5 | night street outside the blacksmith | crane move; a blurred figure passes in the foreground |
| 28.5-32 | blacksmith's shop, symmetrical: red client left, teal client right | slow push; the blacksmith turns his head to each side |
| 33 | blacksmith fades out (dissolve) into... | |
| 34-37 | blueprint on a desk | a glowing pen tip **draws on** the lines, labels pop in, a red stamp slams down |
| 38 | through the forge fire | **light-flash** transition |
| 39-41 | blacksmith at the forge, rusty shield, price tag "$1" | |
| 41-45 | king with a bird's nest on his crown (time passed), back to the counter sign | loop ending |
- Transitions: hard cuts, whip pans, dissolve, light flash through a bright source.
- Captions change every 0.3-0.5 s (1-3 words), timed to the narrator.

### 3b. Lighting, colour and texture (measured from the 16.6 s field frame, Oct 29)
Measured on the frame resized to 540x960: band mean colour, HSV saturation, value.
| Band | Reference | Our v5 wide |
|---|---|---|
| sky (20-30% down) | #b5d7f1, sat 0.25, val 0.95 | #bce0f9, 0.25, 0.98 |
| near horizon (42-48%) | #e3ddce, sat 0.09, val 0.89 (cream haze) | #cdc8ba, 0.09, 0.81 |
| ground mid (62-72%) | #b79f5f, sat 0.48, val 0.72 | #b88c54, 0.54, 0.72 |
| ground low (82-95%) | #967742, sat 0.56, val 0.59 | #a4733c, 0.63, 0.64 |
| whole frame | sat 0.35, luma std 49 | 0.40, 48 |
- **Rim light:** every character has a pale cream halo outside the dark outline (a backlit "sticker" edge). `F.put(..., { rim: true })`.
- **Shadows:** long soft cast shadows falling to the lower right plus a contact shadow at the feet. `{ shadow: true }`.
- **Aerial perspective:** far objects lose contrast and saturation and lift toward cream (`F.hazeK`), plus a cream mist band at the horizon (`F.horizonHaze`).
- **Ground texture:** pebbles and dimples drawn in perspective (bigger and sparser near the camera), ruts, grass tufts, flowers.
- **Clouds:** flat white tops over blue-grey undersides, a few short contour arcs, flat bottoms.
- **Grade:** no warm wash; a light bloom, contrast lift, light grain. Re-measure with `python -I reels/style_measure.py "REF|ref.png|x0,y0,x1,y1" "OURS|frame.jpg"` whenever a new set is built, and tune the palette until the bands match.

### 4. Colour coding tells the story
- Two sides = two colours (there: red vs teal). Used on *everything*: flags, clothes, markers on the ground, map pieces, shop doors, a half-and-half emblem.
- The plot is readable with the sound off.

### 5. Props are the storytelling
- A **counter sign** ("YEARS AT WAR: 100") opens the reel and closes it, so the end loops into the start (rewatch loop).
- A **blueprint/spec sheet** states the paradox in big type.
- Tally marks, a war map, a shop sign. Every key fact is a physical object in the scene, not floating text.

### 6. Story shape (45 s)
1. 0-3 s **hook**: a paradox or a question in one line.
2. **escalation**: the stakes grow (100 years of war, two armies).
3. **reveal**: a scene at night shows what's really going on.
4. **twist**: the hidden mechanism ("You see...").
5. **loop ending**: cut back to the opening prop.

### 7. Sound and captions
- One narrator voice, light music bed under it, small SFX.
- Burned-in captions: **1-2 words at a time**, centred in the lower-middle, bold white rounded font with a dark outline. (The line at the top of the reference is YouTube's own auto-caption, not part of the edit.)

## How we build it (canvas pipeline, `reels/styles/storyfable/fable.js`)
| Piece | API | Notes |
|---|---|---|
| Perspective camera | `F.setCam({x, y, z, hor, focus, dof})`, `F.proj(X, Y, Z)` | world units ~cm, Y up, looks down +Z; `hor` = horizon on screen; dolly = animate `z` |
| Depth of field | automatic in `F.flush()` | blur = `dof` x distance from the `focus` plane; ~1.8 for wide shots (crowds stay readable), 6-8 for medium shots (background melts) |
| Sprites | `F.put(X, Z, size, drawFn, {sharp})`, then `F.flush()` | depth-sorted far to near; `sharp` keeps signs readable |
| Ground | `F.groundQuad(x0, z0, x1, z1, fill)` | planks, tracks, stripes in true perspective |
| Sky | `F.sky(t)`, `F.cloud(x, y, s, seed)` | warm-to-blue gradient, sun bloom, varied shaded cumulus |
| Round-head character | `F.figure({...})` | built to section 1: robe colours, `long` robe / short tunic, `cape`, `stripes`, `apron`, `hat` (paper / visor / bucket), `stache`, `goatee`, `hold` (scoop / cone), `expr` (neutral / sly / smug / glare / worried / shock), `look` (pupils), `turn` (head turn), `tilt`, stick arms (`armF/bendF`, `armB/bendB`, `reach` = both hands forward), `walk` (cycle phase, -1 = standing), `talk` 0-1; idle bob, breathing and blink built in |
| Props | `F.cart({handle, roll})`, `F.umbrella`, `F.counterSign({value, prev, flip})` | cart wheels roll with distance; the counter sign flips its digits (`flip` 0-1 from `prev` to `value`) and is the open/close prop |
| Camera keys (in the reel) | `cam(t, [[time, {x, z, hor, focus, dof}], ...])` | eased moves between keys; roam inside one set like the reference's opening; animate `focus` for rack focus |
| Time-lapse (in the reel) | `dusk(k)` | multiply/screen grade sweep from day to dusk |
| Whip pan | `F.smear(px)` + frame slide | ~0.16 s each side of the cut |
| Finish | `F.post(t)` | bloom, warm soft-light grade, vignette, grain |
| Captions | `F.captions(chunks, t, y)` | Nunito 900, white, thin dark outline + drop shadow, 1-2 words, y about 1340 |

Fonts: Nunito (`styles/fieldbook/fonts`) for captions, Cinzel (`styles/stainedglass/fonts`) for signs.

### Sound (the normal pipeline)
- `specs/<name>.json`: narrator `am_michael` at speed ~1.06 (a male storyteller like the reference), `"music": "popup"` (toy piano, pizzicato bass, woodblock: the closest of our beds to the reference's light playful score), `breath` after lines where a shot needs room.
- `python -I voice2.py <name>` -> `vo_<name>.wav` + `tl_<name>.js`. The reel loads `tl_<name>.js` and **drives every cut, caption chunk and grade change from the line timings** (see `t_storytest.js`: `CUT1 = P[2].start - .2`, etc.), so re-voicing never breaks sync.
- `ev_<name>.json` effects on the visual events: whoosh on whip pans, tick per sign flip, thud when things collide, chime on the closing word. `python -I mix2.py <name>` -> `mix_<name>.wav`, then mux with the frames.

### Framing that matches the reference
- Wide shots: camera at eye height (`y` 140), horizon about 44% down (`hor` 840), characters about a quarter of the frame tall, near the left and right edges, with the path running to the vanishing point between them.
- Medium shots: subject at about a third of the frame width, `focus` on the subject, `dof` 7-8, and a blurred foreground prop at the bottom edge.
- Always something in the foreground (grass, a bucket, a towel), blurred.

### Rules
1. Pick **two sides** for every story and give each a colour. Put the colours on at least 4 props.
2. Every fact the narrator says should also be an **object in the scene** (a sign, a counter, a label, a map).
3. **No still shots.** Minimum: a slow push-in. Cut every 2-4 s; use a whip pan at most every other cut.
4. **Open and close on the same prop** for the loop.
5. Keep faces and key props out of the safe zones in `theme.ts` (top 250, bottom 1440, right column x > 900 from y 840).
6. Captions 1-2 words, never over a face.

## Best-fit topics
Stories with two sides or a hidden reason: economics and game theory (why rival shops sit next to each other, why prices end in .99), history with a twist, "why does everyone do X" behaviour, paradoxes and fables we retell in our own way. Weak for precise mechanisms (use blueprint or Distilbook for those).
