# HANDOFF: "What If You Had Spider Powers?" (What If ep 4, 16:9 1080p24, 389.4 s)

Script + sources: `whatif/what-if-spider/` (script.md, sources.md; 5 RULE cards). Voice landed: Fenrir, `input/voiceover.wav` 389.40 s,
978 words, transcribe 98% match; `timeline/words.json` is the word clock. Same kit and `QUALITY_BAR.md` as ep 3 (train-3yr); ep 3's sets
are copied in (acting, actors, faces, apartment, street, court, roofs, devices, bp, hud ruleCard, creatures incl. Biscuit, home3, park...).

## LEGAL (owner-approved safe version) — every shot
Never name or show the famous web-slinging hero or anything from it: no red-and-blue, no bodysuit, no mask, no web logo/pattern on clothes,
no wrist web-shooters (silk comes from the back end, like a real spider, played for comedy), no swinging between skyscrapers, no upside-down
kiss, no "spider sense" text. Our hero is original (cast.js): messy sandy-brown hair, mustard zip hoodie, oversized purple gardening gloves,
grey cargo trousers, green wellies. PIP is a cute grey-and-cream jumping spider with two huge shiny front eyes (cartoon, friendly, never scary).

## Cast
HERO (above), MINA (red scarf, kid; she names Pip), DEV (orange beanie, films everything on his phone), BISCUIT (purple collar), PIP.

## Stage A (done: integrated in 6af1148): new sets
| Worker | Files | What |
|---|---|---|
| H1 | sets/garden.js + DEMO_garden.js | The family GARDEN + SHED: shed interior (dusty shelves, tools, the bike pump, a window cobweb, sunbeam), the back garden (lawn, fence, washing line, an APPLE TREE with a branch Biscuit gets stuck on), the house back wall with a drainpipe and windows (for wall-climbing), a STORM mode (rain, wind gusts bending the tree, dark clouds, lightning flash) and sunny/morning moods. |
| H2 | sets/spider.js + DEMO_spider.js | `pip(g,x,y,s,{t, tilt, hop, wave, look})` the jumping spider (8 legs, 2 huge front eyes + small side eyes, fuzzy), giant-Pip close-up; hero climbing rig on acting.js: `wallCling(t, o)` (hands + socks stuck, slow slide down "like a wet sticker"), `ceilingStick`, `silkLine(g, from, to, {t, sag})` + `silkPuff` (silk from the hero's back end, comedic, never from wrists), `dodge` pose (feels the air, dodges a water balloon without looking), the purple gloves gag. |
| H3 | sets/spiderbp.js + DEMO_spiderbp.js | Science BLUEPRINTS in bp.js style for the 5 rules (facts exactly as sources.md): foot hairs splitting into finer hairs + van der Waals; square-cube law + "40% of your body / size 114 shoes" vs gecko size limit; silk liquid -> solid at the spinneret, weight-for-weight vs steel, tougher than Kevlar; trichobothria hairs feeling air, the 3 m hearing study, eight eyes (telephoto front pair, the rest spotting movement almost all the way around); leg joints straightened by fluid pressure, 6 body lengths vs ~1.5 for humans, "still debated". |
| H4 | sets/spiderprops.js + DEMO_spiderprops.js | Props + scenes: the KITCHEN feast (9 eggs, Dev's sandwiches, the burger vs milkshake digestion gag, kept cute not gross), water balloon + splash, Dev's phone filming UI, the fence jump, the reality-check lab montage (Stanford-style gecko hand pads on a glass wall with a climber, a lab silk sample spool), day/week counter cards. |

Push to your own branch; status line to handoff/outbox/H<n>.md. Lead integrates into whatif/see-in-dark. The owner's PC does batch E + the final render.

## Stage B (now): write the shots, batches A-E
`story/shots.json` v1: **121 shots, 0 -> 389.399 s** (config duration), contiguous, every cut 0.15 s before a spoken word (one sound cut:
s030 Rule 2 card at 94.20, in the pause after "enormous"), `line` = the exact spoken words (all 978 words covered once). Cut points use
audio-envelope onsets where they are earlier than words.json, and five words.json drift points are fixed (`wordTimesCorrected`: "It's also
why" 106.53, "Their verdict" 133.47, "Forty percent," 140.88, "Labs spin" 368.68, "Tell us" 385.54). Each shot has a concrete `scene`
(set + Stage A helpers, cast scale, word beats with times from shot start, camera), `type`, `sfx` cues (seconds from shot start, already on
the word) and `amb`; every scene text ends with the LEGAL line. Animation directions: `whatif/what-if-spider/shot_plan.md`. Generator:
`gen_shots_ep4.py` (lead's scratchpad).

Music plan (`music` in shots.json): playful 0.4 (cold open + title) -> wonder 0.35 = curious (day 1-2, rules 1-2, s013-s045) -> playful
0.45-0.5 = comedy (days 3-6, dipping to 0.35 under each science block) -> tension 0.55 (the storm, s099-s104) -> triumph 0.7 (silk line,
soggy cat, the landing, s105-s107) -> calm 0.35 = warm (next morning, Pip waves, s108-s109) -> hopeful 0.4 (reality check + ending, s110-end).

| Batch | Worker | Ids | Time | Content | Main sets |
|---|---|---|---|---|---|
| A | H1 | s001-s026 | 0.00-85.64 (85.6 s) | Cold open (Saturday, the shed, Pip's eyes, the tilt, the hop "No bite", the staring contest, Mina names Pip), stuck to the ceiling + 2 seconds + the drop (Biscuit launched), "Nobody knows" corkboard, "Not even Pip" (pipFace shrug), TITLE; DAY 1 THE WALL (hands + socks stick, climb, wet-sticker slide, Dev drops his cereal, magnifying glass, MINA "No glue."); Rule 1 card + FIG 1 (foot tuft -> hair -> setules, van der Waals, one tip, hundreds of thousands, >170x estimate, geckos peel like tape) | garden (garden, shed), spider (pip, pipFace, drawCeiling, wallCling, stickMarks, gloves), local hallway (as demo_wall), home3 bedroom, spiderprops dayCard, spiderbp footHairs/vdw/tipTally, creatures gecko, faces, hud |
| B | H2 | s027-s052 | 85.64-163.66 (78.0 s) | DAY 2 THE SLIDE (drainpipe, still sticky, glove falls, "Because you're enormous" face with Pip on his nose); Rule 2 card + FIG 2 (square-cube x2/x8/x4, the law stamp, tiny-and-strong ant, scale-up flop, 225 species, mites to geckos, ~200-fold, the human, 40% pads, US size 114 shoes gag, SIZE LIMIT verdict); sticky notes, MINA "Forty percent,", "It does not help"; DAY 3 THE SILK (palms do nothing, spinnerets blueprint, the back-end puff, Dev films the backwards walk, the shiny line, Dev never happier) | garden (wall, garden), spider (wallCling, silkPuff, silkLine, silkAnchor, gloves), spiderbp squareCube/padShare/silkGland, spiderprops devPhone/dayCard, faces, hud |
| C | H3 | s053-s076 | 163.66-241.98 (78.3 s) | Rule 3 card + FIG 3 (liquid -> solid at the nozzles, Pip's dragline, rivals steel, tougher than Kevlar, density: steel wins thread for thread, protein from food, web recycling), the feast (9 eggs, Dev's sandwiches); DAY 4 THE HAIRS (Mina's water balloon, the dodge, "You felt the air move" face); Rule 4 card + FIG 4 (trichobothria, near the physical limit, 2016 Cornell, 3 m, ~600 body lengths, no ears just hairs (pipFace), the low hum, MOST FROZE, eight eyes (pipFace), telephoto pair, motion all round) | spiderbp silkGland/silkVsSteel/trichobothria/hearing/eyes8, spider pip/pipFace/dodge/airHairs, spiderprops feast/waterBalloon/balloonArc/splash/dayCard, home3 kitchen, garden, faces, hud |
| D | H4 | s077-s098 | 241.98-314.91 (72.9 s) | Biscuit's failed ambush + "She takes it personally"; DAY 5 THE JUMP (fence jump, "Clean.", water-balloon knees); Rule 5 card + FIG 5 (flexor only, 2 joints, fluid pressure, hydraulic digger, Pip's 6x leap, 6 vs ~1.5, STILL DEBATED, the Manchester spider, muscle alone?), Dev's tape: 1 BODY LENGTH, Pip's '6' sign; DAY 6 LUNCH (the burger, "your body has an idea" face, FIG 6 no chewing / soup / slurp, the burger looks back, milkshake instead) | spiderprops fence/fenceJump/bodyLength/burger/milkshake/waterBalloon/lab/dayCard, spiderbp legPump/jumpBars, spider pip, home3 kitchen, garden, creatures cat, faces, hud |
| E | H1 again, or the owner's PC | s099-s121 | 314.91-389.399 (74.5 s) | DAY 7 THE STORM (scarf into the apple tree, Biscuit stuck, climb the normal way + RULE 2 chip, feel the gust and hug the trunk, can't hold both, the silk line + scarf burrito + lowering, "One soggy cat is easy" face, Biscuit lands furious), next morning in bed (mirror of the ceiling shot), Pip waves; ENDING (real-life staring contest: PIP 1 - YOU 0, the lab, Stanford hand pads, 70 kg up 3.7 m of glass, lab silk weaker so far, size reprise, raisin vs you, WHICH POWER WOULD YOU KEEP?, three powers, end screen) | garden (garden, tree storm, shed, wall), spider, spiderprops lab/glassWall/handPad/silkSpool/dayCard, spiderbp squareCube, home3 bedroom, faces, hud, UI.endScreen |

**Batch E's `scene` texts are self-contained** (each starts with an `[E is self-contained]` kit block: the set calls and options, helper
signatures, the DEMO files to follow and the cast looks), so it can run on the owner's PC or on H1 without this HANDOFF. The storm rescue
(s099-s107) is deliberately slower-cut (s102 4.2 s, s103 5.2 s, s105 4.9 s): keep each move readable.

### Rules for shot writers
- Write ONLY your own file: `scenes/shots/<BATCH>_*.js` (e.g. `A_cold_open.js`, `E_storm.js`) registering exactly your batch's ids from
  shots.json. Do not edit shots.json, sets/, cast.js, config, tools, engine or another batch's files. Need a prop (hallway wall, corkboard,
  magnifying glass, raisin, giant shoes, sticky notes, the digger arm, scarf ribbon)? Draw it locally in your shot file. Leave the DEMO_*.js
  files alone (the lead removes them at integration).
- LEGAL in every shot (it is appended to every scene text): never anything from the famous web-slinging hero: no red-and-blue, no
  mask/bodysuit, no web logo or web pattern on anything, no wrist web-shooters or wrist-flick poses (silk only ever comes from the back end,
  via `silkAnchor`/`silkPuff`, played for comedy), no swinging between buildings (garden-fence height only), no upside-down kiss, no
  "spider sense" text or tingle-line graphic (`airHairs` is the only "sensing" visual). Titles and chips: cream/gold, never red+blue.
- Helper names in the texts are the integrated Stage A names: garden.js `garden(g,t,cam,{view:'shed'|'garden'|'wall'|'tree', mood,
  storm, flash, scarf, door})` + `gardenFg` + `lightningAt`; spider.js `pip`, `pipFace`, `wallCling`, `stickMarks`, `ceilingPose`/
  `drawCeiling`, `silkLine`, `silkPuff`, `silkAnchor`, `dodge`, `airHairs`, `gloves`; spiderbp.js `footHairs`, `vdw`, `tipTally`,
  `squareCube`, `padShare`, `silkGland`, `silkVsSteel`, `trichobothria`, `hearing`, `eyes8`, `legPump`, `jumpBars` (on bp.js `board`, with
  bp.js `label`); spiderprops.js `eggs`/`sandwiches`/`feast`, `burger`, `milkshake`, `waterBalloon`/`balloonArc`/`splash`, `devPhone`,
  `fence`/`fenceJump`/`bodyLength`, `lab`/`glassWall`/`handPad`/`silkSpool`, `dayCard`/`weekStrip`. There is no hallway set: build it
  locally like `hallWall` in DEMO_spider.js. The ceiling shots follow DEMO_spider `demo_ceiling`. In home3 kitchen pass `cereal: 0` (the box
  on the fridge is the ep 3 gag).
- **Hero look in every shot:** messy sandy-brown hair (head 'spiky'), mustard zip hoodie, oversized purple gardening gloves, grey cargo
  trousers, green wellies (socks indoors in the day 1 hallway). The rig draws the gloves as purple hand circles; use spider.js `gloves()`
  for the oversized gloves and their slip gag (they never help: s013, s028, s047, s118).
- **giantFace caveat:** `faces.js giantFace({who:'HERO'})` takes the hoodie colour from cast.js but has NO 'spiky'/sandy-hair branch (it
  draws a bald ink head) and no gloves. Until the lead adds a `HERO_FIT.head === 'spiky'` branch to faces.js, shot writers draw a local
  sandy-brown spiky hair tuft (HERO.hair `#c8a46a`) over the top of the head, and the purple gloves if a hand enters frame (every HERO face
  text says so: s006, s029, s064, s094, s106, s111).
- Devices: `dayCard` pops (tick + swish + pop) on every day: s013 DAY 1 THE WALL, s027 DAY 2 THE SLIDE, s046 DAY 3 THE SILK, s062 DAY 4
  THE HAIRS, s079 DAY 5 THE JUMP, s093 DAY 6 LUNCH, s099 DAY 7 THE STORM. Rule cards (hud ruleCard, exact titles from script.md): s019
  'STICKY ISN'T GLUE.', s030 'BIG THINGS CAN'T STICK.', s053 'SILK STARTS OUT AS A LIQUID.', s065 'YOU CAN HEAR WITH HAIR.', s082 'SPIDER
  LEGS RUN ON PRESSURE.' A blueprint for every science explanation (numbers exactly as sources.md: >170x estimate, x2/x8/x4, 225 species,
  ~200-fold, 40%, US size 114, 7.8 vs 1.3 g/cm3, 2-3x Kevlar toughness, 2016, 3 m, ~600 body lengths, 90 Hz, 8 eyes, 2 joints, 6 vs ~1.5,
  70 kg, 3.7 m) and gold numbers for every spoken number (QUALITY_BAR 36).
- Giant faces on the reaction beats (never two in a row, checked): HERO s006 (staring contest), s029, s064, s094, s106, s111; MINA s018,
  s044; DEV s052. Pip's giant `pipFace` beats: s011, s071, s074.
- Lip-sync only the quoted lines: MINA s018 ("No glue.") and s044 ("Forty percent," only; audio 140.88-141.5). The narrator, the HERO,
  DEV and everyone else are never lip-synced.
- PIP is the recurring cute gag (never scary, no fangs): the cold open, the shrug, the title, peeking over the Rule 1 card, hanging upside
  down, on HERO's nose, on the daisy, riding the giant shoe, covering its eyes, riding the silk line, the dragline drop, the shoulder, the
  juice glass, ears-vs-hairs, frozen mid-wave, its 6x leap and the '6' sign, the milkshake straw, the wave, PIP 1 - YOU 0, the lab, the
  raisin, the three powers, the end screen. A second jumping spider (the Manchester one, s089) must look different and is never named.
- SFX (kit library names only): thud = `hit` pitch 0.75 (big = `impact`), splash = `rain` dur 0.4-0.6 + low `hit`, boing = `blip` pitch
  0.35, dayCard = `tick` + `swish` + `pop`, silk puff "pfft" = `whoosh` pitch 1.8 dur 0.3 + `pop` pitch 1.5, sticking = `blip` pitch 1.6,
  the wet-sticker slide = `swish` pitch 0.4-0.45 dur 0.6-0.8, slurp = three `blip` pitch 0.5-0.55, lightning = `flash` + `thunder`,
  gust = `wind` + `impact` pitch 0.6, MOST FROZE = `freeze`, low hum = `hum`, counting = `counter`, staring tension = `clock`, phone REC =
  `blip`, hearts = `pop` pitch 1.6-1.8, pencil/sticky note = `swish` pitch 1.4, rule card = `stinger`, title = `stinger` minor:false +
  `shimmer`. Ambiences: shed/house `roomtone` -32, garden `wind` -34, storm `rain` -22, lab `hum` -36. Adjust `at` only if you change the
  beat (tell the lead).
- Known short shots (< 2 s, keep them punchy): s008 (1.9), s011 (1.5), s029 (1.6), s039 (1.9), s044 (1.9), s073 (1.6), s074 (1.9),
  s096 (2.0), s119 (1.8). Known long (> 4.5 s): s020 (5.0, one continuous zoom), s026 (4.7), s042 (4.8), s061 (4.6), s067 (4.7), s087 (4.8),
  s095 (4.6), s103 (5.2), s105 (4.9), s114 (4.9).
- QC loop per shot: `node render.mjs --project projects/spider-powers --stills <ids> --scale 0.5` (start+0.3, mid, end-0.3) and
  `--sheet --scale 0.4` for the batch; tick QUALITY_BAR (size, expression change on a word, blink, idle, camera, parallax, atmosphere, rim,
  props, text, determinism, no SHOT ERROR / MISSING for your ids) and the LEGAL list. Render cost <= ~1.5 s/shot.
- Push to your own branch; status line to `handoff/outbox/H<n>.md`; the lead integrates into `whatif/see-in-dark`.
