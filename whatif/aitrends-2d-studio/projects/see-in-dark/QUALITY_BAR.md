# QUALITY BAR: "What If You Could See in Complete Darkness?"

Target: sit next to IFinity ("What If You Could Turn Invisible") and Awaken frames without looking amateur. Every shot is checked against this list before it is called done. "Checkable" means you can verify it from the code or from a still / preview frame. Reference implementation: `scenes/shots/S_showcase.js` (v2 ids: s001, s003, s005, s010, s011, s029).

## 1. Framing and scale (the biggest gap in stage 1)
1. **Hero (or any speaking character) >= 25% of frame height in every non-establishing shot.** Rig height is 240 units at `s = 1`; frame is 1080. So `actor` `s >= 1.6` for a figure that is standing in a medium shot (s 1.85-2.0 is the sweet spot; Mina is x0.72 so use 2.0+). Giant face shots use `giantFace` radius 300-360 (hood included about 75% of frame height).
2. **At most 1 establishing wide per scene** (`scene` in shots.json), and it must be <= 3 s. Wides still need a hero >= 12% of frame height, never "tiny person in an empty street".
3. **Every reaction beat gets a giant face** (`giantFace`, `scenes/sets/faces.js`): shock, realisation, delight, doubt, any "you" moment. Aim for one giant face per ~8 shots, never 3 in a row.
4. Shot mix over a scene: medium (~35%), two/three-shot (~25%), giant face (~12%), insert/macro (~10%), over-the-shoulder (~8%), wide (<= 10%), graphics/blueprint (rest). No more than 3 consecutive shots of the same framing.
5. Compose in thirds, hero on the side of the light, eye line about 1/3 from the top. The face close-up is the only centred composition.
6. Crowds and groups: each background person gets ONE signature colour (hoodie/beanie/cap) from a varied palette (`#d4262e #2f6fd0 #f08a24 #3aa05a #9a5ad6 #e08aa8 #e0e0d0`); never reuse a cast signature colour for extras next to that cast member (mustard, red scarf, orange beanie, green lanyard, blue cap are reserved).

## 2. Acting (use `scenes/sets/acting.js`)
7. **>= 1 expression change per shot, synced to a spoken word** (`exprAt(t, [[0,'neutral'],[tWord,'surprised']])`, with `tWord = wordTime(...) - info.shot.start`). Giant faces use `faceAt` with 3+ keys.
8. **Blink every 2.5-4 s** with a different period/seed per character: `blink: blinkFlag(t, 3.4, seed)`; creatures and giant faces use `blinkAmt` (cat auto-blinks).
9. **Nobody stands frozen**: wrap every standing/sitting pose in `idle(pose, t, seed)` (breathing + weight shift). Gestures: `poseAt` / `reaction('shock'|'delight'|'wince'|'lookUp'|'sheepish', t, t0)` for snaps with overshoot, `talkGesture(t, seed)` for quoted lines only, `pointAndLook` (eyes first, arm 0.25 s later).
10. Walking: `walkAlong(x, s, {kid})` locks the foot phase to world x so feet never slide; move x with a smooth function (about 150-170 units/s at s 1.9). Do NOT drive `walkPose` by time at a different speed.
11. Eyes lead, bodies follow: give `look:` to every figure that notices something (`lookToward(dx,dy)`), 0.15-0.3 s before the body reaction.
12. Only quoted lines (Mina, Dev, Dr Lin, Tomas) get `talk:`; the narrator is never lip-synced. The hero never talks.
13. Props in hands (phone, torch, cup) must actually be at `handWorld` of the pose; torches cast a `FX.lightCone` + `glow` from that hand.

## 3. Camera, depth, atmosphere
14. **Camera never static**: `camMove(t, dur, {z:[a,b], x:[a,b]})` (ease.inOut + deterministic handheld drift) or a follow cam (s001). Impacts: punch zoom + `shake`.
15. **>= 2 depth layers at different parallax speeds** on every shot that is not a flat graphic: sets already give sky .12 / skyline .3 / facade .55-.6 / floor .9 / characters 1.0; add `*Fg(...)` blurred foreground (1.6-1.7) on mediums and wides.
16. **Atmosphere on every shot**: `atmos(g, t, cam)` (dust at two depths) or rain/embers/god rays. Glows around every practical light.
17. One key light per shot, shown and spilled (window, torch, screen, lamp, heat-glow). Rim light on every lit figure (`rim: A.rim` or `rimColor` in `giantFace`). Stage figures against the brightest area.
18. Value structure: 60-75% dark midtones, 1-3 bright accents. Blackout shots must still show the hero's silhouette (rim + moon/torch). Never a black frame with a tiny accent.

## 4. Sets and props (what makes a frame look "designed")
19. Every set has: >= 8 distinct props or signage on the character plane, lit windows or screens, floor items, wall art, and 1 foreground element (blurred leaves, railing, seat heads). The shared sets already provide these; do not strip them. Need more? Draw it in your own shot file with a local helper (read-only sets).
20. Apartment: bookcase, plant, coat hooks + shoe rack, fridge with art, counter clutter, fairy lights, pendant lamp, sofa blanket/cushions. Street: awning + neon OPEN, produce crates, hydrant, bike, stoop with numbered red door, window mullions + curtains + silhouettes, car. Cinema: audience heads in varied colours, EXIT, row letters, projector beam. Lab: blueprint wall, whiteboard, jar shelf, clock, plant, stool, coffee machine, tripod + camera. Forest: tents, log seats, backpack, lantern, mushrooms, ferns, puddles, rain.
21. No empty thirds: if the left or right third of a medium is just wall, add a prop, a person, a light shaft or a blurred foreground piece.

## 5. Creatures (use `sets/creatures.js` through `actors.js`)
22. Creature height >= 12% of frame height in inserts (cat `s` >= 1.8, mouse `s` >= 4.5, snake `len` 200 at `s` >= 2), and a close-up creature must show: eye with highlight, ears, nose/mouth, whiskers or scales, and one idle animation (tail flick, ear twitch, tongue flick, blink).
23. Cat (Biscuit): purple collar always, green eyes with slit pupils, auto blink ~3.4 s, tail flick ~every 6 s, `eyes:'offended'` for the half-lidded stare, `eyes:'glint'` when a light hits her. Mouse: big round ear, whiskers, nose twitch. Snake: diamond pattern, heat pit, slit eye, tongue. Deer: antlers optional, hock joints, ear flick, `graze` to lower the head. Fox: black socks, white tail tip. Gecko and owl exist for the forest/cave beats.
24. Creatures need the same rim light and a contact shadow as characters (automatic unless `rim:false`).

## 6. Thermal view (use `thermalView` + `heatActor/heatCat/...`)
25. **Background must read: cool but not black.** The cold set is remapped to violet-magenta (floor 0.15, cap 0.38). A frame whose darkest 50% is pure black fails.
26. **Hot subjects must pop**: skin ~0.9 (white-yellow), clothes ~0.6 (red-orange), creatures 0.55-0.7 with spots (eyes/ears/nose) +0.3. A pure white blob silhouette fails: if a creature is a flat white shape, lower its `heat` (0.55-0.65) or drop extra `heatBlob`s.
27. Hot subject >= 12% of frame height; the one subject the line talks about is the brightest thing in frame (toast cooling = white -> orange).
28. HUD: bracket corners, palette bar, one `track` crosshair following the subject with a temperature readout; chips <= 6 words.
29. Glass and cold objects stay purple (draw nothing in `hot`); snakes are cold (0.3) with hot pit organs.

## 7. Blueprint and diagrams (use `sets/bp.js`)
30. Clean line art only: 4-6 px strokes, light blue + cream, **gold for every label and number**. Draw-on over about 1.5 s then hold with a slow scale (<= 4%).
31. Eye diagram must show cornea, iris, lens, retina, fovea, optic nerve (`BP.eye` returns anchors for labels), light rays that bend and converge, and a dashed zoom into the `BP.retina` inset (rods with disc stripes, cones tapered, nerve cells, pigment layer).
32. <= 3 labels on screen at once, labels pop on their word (`start`), leader line grows. Chips <= 6 words, bottom third.
33. Blueprint shots use `bars: "none"`.

## 8. On-screen text and title lock-ups
34. No sentences on screen except the title, the question and the end screen. Chips <= 6 words, safe area, legible at phone size (>= 36 px at 1080p), pop with `outBack` on the spoken word, gone before the cut.
35. Rule cards use `ruleCard` (extruded numeral, outlined cream title on a dark banner, sun-rays, sparkles). Title text outline >= 10 px plus glow; never plain text on a busy background.
36. Every number the narrator says appears on screen (gold), synced with `wordTime`.

## 9. Determinism and tech
37. No `Math.random`, `Date.now`, `performance.now`. Use `rng(seed)`, `t`, `info.globalT`.
38. No console `SHOT ERROR`, no `MISSING` on the sheet for your ids. Render cost <= ~1.5 s/shot (one `blurLayer` per shot where possible; thermal is the heaviest).
39. Colours come from `mood()`/`S()`/set returns; only cast signature colours and creature skins are literal.

## 10. Good / bad examples (by shot id; all in S_showcase.js unless noted)
GOOD
- **s001**: medium tracking shot, hero 42% of frame, 5 bystanders each with their own colour, phones -> torches on the beat of "Blackout", locked walk, camera follows, three parallax depths, hero smirks on "walking".
- **s029**: giant face, shocked -> delighted: blink, double-take, sweat drop, punch zoom + shake, orange glow and eye glint on delight, sparkles.
- **s003**: three characters, torch beam sweeps from Mina over Hero to the cat (eyeshine, then offended), pan reveals the fridge, lived-in apartment, blurred foreground plants.
- **s005**: bright violet world, white-yellow mouse and cat with hot ears/eyes, toast fading white to orange, crosshair + temp.
- **s010**: lock-up with extruded numeral and banner over the audience hall.
- **s011**: clean eye with labelled cornea/lens/retina, converging rays, dashed zoom into rods.

BAD (what stage 1 did, do not repeat)
- old **s001**: wide street, hero ~12% of frame height, 5 s with no one else in frame, lights die and the frame is a dark empty street.
- old **s008**: purple-black thermal where the apartment is unreadable, mouse a tiny white speck, toast a smudge.
- old **s012**: eye as open polylines with a floating gold arc, rods drawn as plain grey bars with no context.
- old creatures: single-colour blobs with two dots for eyes.
- any shot where a character stands in a perfect T-pose for the whole shot, any figure that slides while walking, any thermal frame where everything is the same two colours.

## 11. Self-check before you say "done"
Render `--stills` for 3 times per shot (start+0.3 s, mid, end-0.3 s) and tick: size (1-3), expression change (7), blink (8), idle (9), camera (14), parallax (15), atmosphere (16), rim (17), props/no empty thirds (19, 21), text (34-36), determinism (37), no errors (38).
