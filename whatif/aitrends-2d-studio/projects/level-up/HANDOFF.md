# HANDOFF: "What If You Could Level Up Your Strength Every Day?" (What If ep 5, 16:9 1080p24, 419.0 s)

Script + sources + STYLE: `whatif/what-if-levelup/` (script.md, sources.md, **STYLE.md: read it first, its DO/DON'T list is mandatory**).
Voice landed: Fenrir, `input/voiceover.wav` 418.97 s, 1,003 words, transcribe 95%; `timeline/words.json` is the word clock.

## OWNER DECISION (Oct 31): ep 5 uses the SAME CLASSIC STYLE as eps 1-4 (aitrends kit: black round heads, rig2d actors, giantFace, ruleCard, bp blueprints).
The rig5/town5 look-dev below is SHELVED (kept on the worker branches, not used). KEEP from Stage 0: sets/statcard.js (H2: The Zip + Stat Card + LEVEL UP pop) and sets/fx5.js (H3: steam aura, bloom, slow-mo, ground crack...), both integrated here, plus all the ep 1-4 sets (home3 kitchen/bedroom, apartment living room, garden driveway/lawn/patio, park at night, street). HERO = cast.js (navy jacket, chestnut spiky hair via faces.js; draw the cyan zip/cuff trim locally).

## (shelved) WHY THIS EPISODE WAS GOING TO BE DIFFERENT: an ART UPGRADE (owner: "the art looks off, the next one we make better")
The owner wants a leveling-anime FEEL (dark ink-navy night, cyan holographic stat card, gold LEVEL UP pop, bloom, rim light, steam aura,
low angles, smash cuts, hype level-ups) with ORIGINAL designs (STYLE.md DON'T list: nothing copied from the series that inspired it).
The old flat black-round-head look is NOT good enough for this one. Stage 0 builds NEW, sharper models and look-dev frames that the OWNER
APPROVES before any shot is animated. Quality target: think a polished modern 2D animated YouTube channel: clean silhouettes, readable
faces with real eyes/brows/mouth on skin-toned faces, hair with shape and highlights, layered clothing with folds and shading (2-3 tones +
rim light), proper proportions (hero ~7 heads tall, lean), smooth arcs.

## Stage 0: look-dev (now). Each worker writes ONLY its own files; each ships DEMO_<name>.js with demo_* ids + 3 stills to the outbox.
| Who | Files | What |
|---|---|---|
| H1 | engine-free `sets/rig5.js` + DEMO_rig5.js | NEW CHARACTER RIG for ep 5 (do not modify engine/rig2d.js): `hero5(g, x, y, s, {pose, face, look, blink, talk, t, glow})` with the STYLE.md hero (lean, short dark chestnut hair with one stubborn front swoop, warm brown eyes that never glow, navy hip-length bomber with cyan zip pull + cyan cuff stripes, white tee, charcoal joggers, white trainers), skin-toned face with expressive eyes/brows/mouth, 3-tone cel shading + rim light, poses: stand, idle breathe, shock, grin, deadlift (setup/pull/lockout), overhead lift, push (feet planted), sink (ankles in ground), run, sleep, eat cereal. Plus `mina5`, `dev5` (same style: Mina red scarf, Dev orange beanie + phone) and `biscuit5`. A big close-up `face5(g, cx, cy, r, {who, expr, look, blink, glowReflect})` with the HUD's cyan reflecting on the cheeks. |
| H2 | `sets/statcard.js` + DEMO_statcard.js | Our ORIGINAL HUD per STYLE.md: "The Zip" rift (a small zipper-edged tear in the air with gold sparks) that the "Stat Card" unfolds from (rounded translucent glass #123A5E ~55%, thin cyan #3FE0FF frame, gold level badge, STR in kg with a dumbbell icon, chevron XP bar, extra red/coral warning line support like "Bones: not included."), the gold "LEVEL UP!" pop (flash #FFF3C4, scale snap, sparks), number roll-ups, open/close animations, a tiny version for Biscuit's head. NO words from the DON'T list ("System", "Quest", "Player"...). |
| H3 | `sets/fx5.js` + DEMO_fx5.js | Effects + grade: bloom/glow pass, cyan/violet rim-light helper, STEAM AURA (rising wisps from the body at night, it's body heat), slow-mo helper (time remap + motion streaks), smash-cut flash, impact frame, ground crack + soil sink + tile crack, dust, speed lines, low-angle camera helper, night colour grade per STYLE.md palette (ink-navy, never pure black). |
| H4 | `sets/town5.js` + DEMO_town5.js | Sets in the new style: home kitchen at breakfast (cereal bowl where The Zip opens), living room with the sofa (Biscuit asleep on it), driveway + family car + lawn + Mum's patio tiles, the night park on a hill road with sodium streetlights (#FF9F43) and a town view, a muddy field road with a truck full of festival pumpkins stuck (planks, gravel, sand props). Layered parallax, practical lights, atmosphere. |
| PC | look-dev frames (after H1-H4 push) | `scenes/shots/LOOKDEV.js`: compose 4 hero frames from the new pieces: (1) breakfast: The Zip opens over the cereal, Stat Card "LEVEL UP!", Dev reading it; (2) the sofa lift with Biscuit asleep; (3) night park, steam aura, low angle, bloom; (4) the car lift sinking into the lawn. Render each at full 1080p and send them to the owner for approval. |

Push to your own branch; status line to handoff/outbox/H<n>.md. The lead integrates into whatif/see-in-dark. Shot list + batches only after the owner approves the look.

## Stage B (now): write the shots, batches A-E (classic style)
`story/shots.json` v1: **135 shots, 0 -> 418.965 s** (config duration), contiguous, every cut 0.15 s before a spoken word (no sound cuts),
`line` = the exact spoken words (all 1,003 words covered once). The voice has DIGITAL SILENCE between phrases, so every cut word and every
sentence start uses its audio onset (end of the silence run) where words.json is off by >= 0.1 s (`wordTimesCorrected`; the big glued
ones: "And the words" 16.17, "Hafþór Björnsson" 96.76, "Level-eleven" 137.89, "Mina's football" 152.44, "You lift." 159.36, "Crack."
167.45, "Mum's tiles." 168.56, "Mina fetches" 200.10, "Push-ups" 209.07, "Mina times." 213.05, "Hafþór has" 251.69, "Four extra" 366.73,
"In real" 380.91). Word placeholders in the scene texts and all `sfx` times already use the corrected clock. Each shot has a concrete
`scene` (set + helper calls, cast scale, word beats with times from shot start, camera), `type`, `sfx` (seconds from shot start) and
`amb`; every scene text ends with the LEGAL line. Animation directions: `whatif/what-if-levelup/shot_plan.md`. Generator:
`gen_shots_ep5.py` (lead's scratchpad). Stage 0 rig5/town5 are SHELVED: never import them.

Music plan (`music` in shots.json): playful 0.45/0.35 (cold open, the rule on the card, title, level 1) -> wonder 0.35 (rule 1) ->
action 0.5-0.55 = hype (level 6 sofa, level 11 record) -> tension 0.45 (Bones: not included + rule 2) -> playful 0.4 (Bones: upgraded) ->
action 0.55 (level 16, the car goes up) -> tension 0.5 (sinking, the cracked tiles) -> wonder 0.35 (rule 3, Mina's planks) -> action 0.5
(level 19) -> epic 0.4 -> 0.6 = night (training montage, then the steam aura from s068) -> wonder 0.35 (rule 4) -> playful 0.45 (fridge,
Biscuit's bowl) -> action 0.55 (level 23) -> tension 0.45 (the stuck truck, the slip) -> hopeful 0.4 (rule 5 + the rescue build) ->
triumph 0.7 (the truck crawls out, the pumpkin on one finger, s109-s111) -> action 0.6 (day 30, level 30, the biggest pop) -> calm 0.3
(trial over, back to 40 kg) -> hopeful 0.45 -> 0.4 = warm twist + ending (44 kg, Biscuit's level one, real life, question, end screen).

| Batch | Worker | Ids | Time | Content | Main sets |
|---|---|---|---|---|---|
| A | H1 | s001-s026 | 0.00-85.80 (85.8 s) | Cold open (Monday breakfast, the Zip unzips over the cereal, the card floats out, gold '1', dumbbell, first LEVEL UP!, DEV lip-sync "Strength, fifty kilos.", Dev's phone + every-morning strip, the rule on the card x1.26 / x2 bp, nobody knows + Biscuit chomps the card), TITLE (low angle, '30 DAYS'); LEVEL 1 THE BAGS (every bag on one hand, DEV lip-sync "They look exactly the same.", giant face HERO); Rule 1 card + FIG 1 (muscle barely grows, the wiring, more fibres at once, Moritani & deVries 1979, mostly nerves, muscle takes over after weeks 3-5); LEVEL 6 THE SOFA (morning pop LV 5->6, 127->160 kg; remote under the sofa; low-angle one-hand lift; Biscuit asleep on top) | home3 kitchen, statcard (zip, statCard, levelUp, levelFlash, morningPop), street (dusk), hud ruleCard + chip, bp board/label/draw, apartment (sofa), fx5 lowAngle/speedLines5, faces, creatures cat |
| B | H2 | s027-s051 | 85.80-170.74 (84.9 s) | LEVEL 11 THE RECORD (pop LV 10->11, 403->508 kg, DEV lip-sync "Five hundred and eight kilos,", giant face DEV goes quiet), FIG 2 501 kg + the name card (Iceland, 2020, no likeness), you beat it at breakfast, the coral line "Bones: not included." (dutch); Rule 2 card + FIG 3 (tendon pulls, bone takes the load, 1 cm2 of thigh bone ~190 MPa ~1.9 t AROUND 2 TONNES, pull/bend/twist qualitative, the muscle-tendon-bone race, teen athletes Mersmann 2017, THE GAP + MAY RAISE INJURY RISK, the record took years, level-11 muscles on level-0 bones comic x-ray), next morning "Bones: upgraded." (LV 12, 640 kg), giant face HERO "no update"; LEVEL 16 THE CAR (pop LV 15->16, 1,280->1,613 kg, Mina's football under the LOCAL car on the lawn, ~1.5 t, slow-mo lift, soilSink ankle deep, tileCrack on "Crack.", giant face MINA "Mum's tiles.") | statcard, home3 kitchen (day + dawn), bp, hud ruleCard, garden view 'garden' + LOCAL car, fx5 lowAngle/slowMo/trail/soilSink/soilLip/groundCrack/dustBurst/tileCrack/impactFrame/hitShake, faces |
| C | H3 | s052-s081 | 170.74-258.79 (88.1 s) | Rule 3 card + FIG 4 (Newton 3, the car pushes down, 1,500 + 50 kg ~15,200 N, P = F / A, soles ~0.03 m2, x1..x5, ~380-510 kPa vs ~75 kPa MORE THAN 5x 'rated to hold', planks ~7.6 kPa, snowshoes), MINA drags two planks; LEVEL 19 NIGHT TRAINING (pop LV 18->19, 2,560->3,225 kg, spoon folds); night park: walk-in, push-ups, bench squats, MINA times / DEV films, the STEAM AURA (s068 start, s069 low-angle hero frame), DEV leans closer, giant face DEV lip-sync "Wait. Is that steam?"; Rule 4 card + FIG 5 (~25% movement, ~75% heat, warm skin -> dew point -> cloud, "Your aura is steam", 1,500 kg x 9.81 x 0.5 m ~7,360 J / 25% ~29,400 J ~7 kcal = 1 bite of a ~95 kcal apple, all night adds up, ~10,000 kcal "has said", ~2,000 kcal) | hud ruleCard, bp, garden, statcard + home3 kitchen, park (autumn, night, bench) + parkFg, fx5 steamAura/rimLight/heatHaze/lowAngle/bloom/nightGrade, faces |
| D | H4 | s082-s111 | 258.79-343.95 (85.2 s) | The fridge emptied at night, Biscuit guards her bowl; LEVEL 23 THE TRUCK (pop LV 22->23, 6,451->8,127 kg, pumpkin lantern), nearly Halloween (Biscuit's witch hat), the LOCAL pumpkin truck slid off the park path, wheel sunk in mud, the '7.5 t' sticker, "Easy. You push.", trainers spin + squeak squeak, doesn't move, the puddle slide; Rule 5 card + FIG 6 (feet push back, friction, MAX GRIP = WEIGHT x μ, rubber/dry concrete μ ≈ 1, wet mud much lower (no number), 50 kg, ~490 N = about your own weight, mud far less however strong), STR LV 23 card, giant face HERO coral 'GRIP: LV 1'; THE RESCUE (lift instead, bp inset down not sideways, Mina's planks + RULE 3 chip, the slow low-angle lift, Dev's gravel, Mina's sand 'GRIP', the truck crawls out + not one pumpkin falls, the biggest pumpkin, carried home on one finger at dusk) | home3 kitchen (night), statcard, park (autumn, dusk, puddles) + LOCAL truck/mud/planks/gravel/sand, spiderprops splash, bp, hud ruleCard + chip, fx5 lowAngle/speedLines5, faces, street (dusk) |
| E | H1 again, or the owner's PC | s112-s135 | 343.95-418.965 (75.0 s) | LEVEL 30 THE LAST MORNING (day 30 breakfast hush, the Zip, LV 29->30, 32,508->40,960 kg 'OVER 40 t', the biggest LEVEL UP!, the card flips: "Trial over. Levels returned.", giant face HERO back to 40 kg, Dev stops filming, the blink, STR 40->44 '+4 kg', the memory of the night park, RULE 1 chip, the card zips away, the tiny Zip over Biscuit + miniCard LV 1), ENDING (no screen in real life, real training, FIG 7 fast nerves then slow years, nobody doubles, bigger isn't a shortcut, FIG 8 square-cube x2/x4/x8, AAP 2020 kids + teens safely, coaching + technique, the question lock-up, end screen) | home3 kitchen (dawn), statcard (zip, statCard, levelUp, miniCard), park night, garden morning, bp, faces, UI.endScreen |

**Batch E's `scene` texts are self-contained** (each starts with an `[E is self-contained]` kit block: the set calls and options, the
statcard/fx5 helper signatures, the DEMO files to follow, the cast looks and the palette), so it can run on the owner's PC or on H1
without this HANDOFF.

### Rules for shot writers
- Write ONLY your own file: `scenes/shots/<BATCH>_*.js` (e.g. `A_cold_open.js`, `D_truck.js`) registering exactly your batch's ids from
  shots.json. Do not edit shots.json, sets/, cast.js, config, tools, engine or another batch's files. Stage 0's rig5.js / town5.js are
  SHELVED: do not import or copy them. Need a prop no set has (the cereal bowl, the family car, the pumpkin truck + mud + puddle, planks,
  gravel, sand bucket, shopping bags, the TV remote, the stopwatch, Dev's ring light, the fridge contents, Biscuit's bowl + witch hat, the
  pumpkin lantern, the card's back face)? Draw it LOCALLY in your shot file (concrete descriptions are in each scene text). Leave the
  DEMO_*.js files alone (the lead removes them at integration).
- LEGAL in every shot (appended to every scene text, from STYLE.md's DON'T list): no series/character/place names or catchphrases; never
  the words "System", "Player", "Quest", "Daily Quest", "Arise", "Hunter", "Rank" or letter ranks on screen; no gates/portals/doorways (the
  Zip is a small zipper tear that only ever releases the Stat Card, never on the ground or in the sky), no hunters, statues or shadow army;
  the hero's eyes NEVER glow (HUD light shows as two small cyan rectangles on the cheeks/eyes); no copied blue window frame, title bar or
  square brackets (only our rounded Stat Card); no long dark coat, hood up, gloves, daggers or armour; no sound-alike music. The only
  on-card words: the level, STR + kg, "LEVEL UP!", and the script's one-liners ("Bones: not included.", "Bones: upgraded.", "Trial over.
  Levels returned.", plus the STYLE.md example 'GRIP: LV 1').
- Helper names are the integrated ones: statcard.js `zip`, `zipOpen`, `statCard`, `roll`, `levelSpin`, `xpFill`, `levelUp`,
  `levelFlash`, `levelShake`, `freeze`, `sparks`, `morningPop`, `miniCard`, `dumbbell`, `PAL`; fx5.js `bloom`, `nightGrade`, `heatHaze`,
  `glowDraw`, `rimLight`, `trail`, `slowMo`, `freeze`, `hitShake`, `smashFlash`, `impactFrame`, `groundCrack`, `soilSink`, `soilLip`,
  `tileCrack`, `dustBurst`, `steamAura`, `speedLines5`, `lowAngle`, `lowAngleWrap`, `P5`; home3 `home3`/`home3Fg`/`filmPhone`/`filmFrame`;
  apartment `apartment`/`apartmentFg`; garden `garden`/`gardenFg`; park `park`/`parkFg`; street `street`/`streetFg`; hud `chip`/`ruleCard`;
  bp `board`/`label`/`draw`; faces `giantFace`/`faceAt`; actors `actor` + creatures `cat`; spiderprops `splash`/`devPhone`; acting
  `camMove`/`idle`/`poseAt`/`exprAt`/`blinkFlag`/`blinkAmt`/`lookToward`/`pointAndLook`/`walkAlong`/`reaction`/`atmos`. Rig poses that exist:
  stand relaxed talk explain point pointUp wave cheer handsOnHead crossArms think shrug holdFront phone reach sad facepalm ready crouch sit
  sitBack kneel lie dive kick jump fall + acting EXTRA shock delight wince lookUp sheepish handsUp phoneLow reachHigh (overhead lifts =
  reachHigh/handsUp; squats = stand <-> crouch; push-ups = 'lie' rotated to a plank, LOCAL arm bend). Follow DEMO_statcard
  (demo_sc_morning, demo_sc_night, demo_sc_pop, demo_sc_roll, demo_sc_biscuit) and DEMO_fx5 (demo_fx_aura, demo_fx_lift,
  demo_fx_levelup) for the call patterns; the DEMO_fx5 placeholder figure is NOT the hero: use actor('HERO').
- **Hero look in every shot:** classic rig `actor('HERO')` (cast.js: navy 'hoodie' top #1f2d52, head 'spiky' chestnut hair #6b3f23,
  charcoal joggers) + a LOCAL cyan #3FE0FF zip pull and cuff stripes (2-3 px) on the jacket; white trainers. giantFace HERO already draws
  the chestnut spiky hair + fringe (faces.js spiky branch reads cast.js), add the cyan zip pull at the collar if visible. MINA red scarf,
  DEV orange beanie (always filming), BISCUIT purple collar. The hero carries no red/orange.
- **Morning level-ups** (every one): the shot's chapter chip (hud chip, gold) + `morningPop` at 0.05 s (Zip on the cut, LEVEL UP! at
  1.2 s, STR lands ~1.9 s, freeze + levelShake + levelFlash LAST) with STR = 40 x 2^(level/3): s001-s006 LV 0->1 40->50 kg (the cold
  open builds it from parts: zip s002, card s004, badge s005, pop s006), s023 LV 5->6 127->160, s027 LV 10->11 403->508, s043 LV 12 640
  "Bones: upgraded." (no pop, gold/coral line), s045 LV 15->16 1,280->1,613, s063 LV 18->19 2,560->3,225, s084 LV 22->23 6,451->8,127,
  s112-s115 LV 29->30 32,508->40,960 (the biggest pop, s115). The coral line "Bones: not included." is s032 (warn/warnAt); 'GRIP: LV 1'
  coral on s102; the card's back "Trial over. Levels returned." s116; STR 40->44 s119; Biscuit's miniCard LV 1 s122-s123.
- Rule cards (hud ruleCard, exact titles from script.md): s016 'STRONGER STARTS IN YOUR BRAIN.', s033 'MUSCLES PULL. BONES HAVE TO
  HOLD.', s052 'PUSH DOWN, AND THE GROUND PUSHES BACK.', s072 'MUSCLES RUN ON FOOD, AND THEY GET HOT.', s093 'NO GRIP, NO PUSH.'
  Blueprints (bp board, cream on navy, gold numbers) for every science explanation, numbers exactly as sources.md: x1.26 / x2 per 3 levels
  (story rule), 1979, weeks 3-5, 501 kg / 2020 / Iceland, 1 cm2 ~190 MPa ~1.9 t 'around 2 tonnes', pull/bend/twist qualitative, Mersmann
  2017 'may', ~1.5 t, ~15,200 N, ~0.03 m2, ~380-510 kPa vs < 75 kPa (MORE THAN 5x), ~7.6 kPa on planks, ~25% / ~75%, ~7,360 J, ~29,400 J
  ~7 kcal, ~95 kcal apple, ~10,000 kcal (has said), ~2,000 kcal, μ ≈ 1 (mud: no number), 50 kg, ~490 N, x2 / x4 / x8, AAP 2020. Gold
  numbers for every spoken number (QUALITY_BAR 36).
- Giant faces on reaction beats (never two in a row, checked): HERO s015, s044, s102, s117; DEV s028, s071; MINA s051.
- Lip-sync ONLY the quoted lines Dev says: s007 "Strength, fifty kilos.", s014 "They look exactly the same.", s027 "Five hundred and eight
  kilos,", s071 "Wait. Is that steam?". The other quotes ("LEVEL UP!", "Bones: ...", "Trial over...", "Strength, forty-four.", "Level
  one.") are card text, never lip-synced; the narrator and the HERO are never lip-synced.
- Real people: Hafþór Björnsson appears only as plain text on a record plate (s030) and a chip (s080): no photo, no likeness, no figure.
- SFX (kit library names only): the Zip "zzzip" = `swish` pitch 1.7 dur 0.35 + `blip` pitch 1.8; level-up = `hit` pitch 0.9 (ka-chunk as
  the card lands) + three `blip` pitch 1.0 / 1.26 / 1.5 (rising arpeggio, never a single ding) + `powerup` + `flash`; rule card =
  `stinger`; title = `stinger` minor:false + `shimmer`; heavy lift = `whoosh` pitch 0.6 + `slowmo` / `riser`; thud = `hit` pitch 0.6-0.8;
  sinking = `hit` pitch 0.6 + `swish` pitch 0.4; tile crack = `hit` pitch 1.4 + `impact` pitch 1.3; shoe squeak = `blip` pitch 2.0
  dur 0.15; splash = `rain` dur 0.5 + low `hit`; steam = `wind` + `shimmer`; counting = `counter`; card warning = `glitch` / `buzz`
  (quiet); stopwatch = `tick`; truck engine = `hum`; cheer = `cheer` -24. Ambiences: kitchen/living room `roomtone` -32, garden `wind` -34,
  night park `wind` -30, day park `wind` -32, street `city` -34. Adjust `at` only if you change the beat (tell the lead).
- Known short shots (< 2 s, keep them punchy): s006 (1.9 the first pop), s028 (1.65), s041 (1.9), s061 (1.9), s066 (1.95), s070 (1.7),
  s079 (1.9), s082 (2.0), s085 (1.9), s091 (1.8), s125 (1.9). Known long (> 4.5 s): s021 (4.5), s029 (4.7), s038 (5.0 one race), s080
  (4.7), s127 (5.3 one curve), s131 (4.7).
- QC loop per shot: `node render.mjs --project projects/level-up --stills <ids> --scale 0.5` (start+0.3, mid, end-0.3) and `--sheet
  --scale 0.4` for the batch; tick QUALITY_BAR (size, expression change on a word, blink, idle, camera, parallax, atmosphere, rim, props,
  text, determinism, no SHOT ERROR / MISSING for your ids) and the LEGAL list. Render cost <= ~1.5 s/shot (bloom/nightGrade read the
  canvas: one pass each per frame).
- Push to your own branch; status line to `handoff/outbox/H<n>.md`; the lead integrates into `whatif/see-in-dark`.
