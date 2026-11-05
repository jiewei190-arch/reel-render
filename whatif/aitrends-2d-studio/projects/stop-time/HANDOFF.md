# HANDOFF: I.Awaken — "What If You Could Freeze Time for 10 Seconds?" (16:9 1080p24, ~6.5 min)

Script + sources: `whatif/what-if-stoptime/` (65 lines, 5 RULE cards). Classic What If style (eps see-in-dark / spider / train / level-up):
black round heads, rig2d actors, giantFace, hud ruleCard, bp blueprints. Cast in `scenes/cast.js` (HERO: shaggy black hair with one
cowlick, round tortoiseshell glasses, teal/cream striped long-sleeve tee, navy star pyjamas, mismatched socks; MINA red scarf + stopwatch;
DEV orange beanie + phone; BISCUIT). The VOICE is recorded on the owner's PC (Leo) — timings/shots.json come after it lands.
Stage A (now) doesn't need the voice. Each worker: own files only, DEMO_<set>.js with demo_* ids, 3 stills in the outbox, push to your branch.

| Worker | Files | What |
|---|---|---|
| H1 | sets/freeze.js | FREEZE FX: the snap (finger-snap pose + a ring ripple that freezes the frame), `freezeGrade(g, k)` (cool desaturated still world, dust motes hanging), FROZEN liquids (juice/milk arcs and droplets hanging in air with highlights), frozen-mid-action pose helper (people/cat with tiny "still" sparkle), the BLACK view (snap 1: total darkness, only a faint outline once light returns), the WALL OF AIR view (snap 2: visible air-molecule speckle field, the hero squashed against it, cheeks puffed, can't breathe), unfreeze whoosh. |
| H2 | sets/stopprops.js | Props + kitchen beats on home3's kitchen: Mina's stopwatch (big readable digits, 0-10 s), the KITCHEN CLOCK with a second hand that can "stick" (chronostasis gag), the oven clock vs the hero's chunky black watch (40 s apart), juice glass + orange-sock splash, the milk jug, Mina's school project (a cardboard volcano or solar-system model), a bowl, the bin, butter dish, toast; Dev filming UI (reuse devices.js phone if it fits). |
| H3 | sets/timebp.js | Science BLUEPRINTS (bp.js style, numbers exactly as sources.md): light speed + photons arriving at the eye/retina (no arriving light = black), sunlight 8 min 20 s to Earth, air molecules ~2.5×10^19 per cm³ at ~500 m/s, the kitchen's ~48 kg of air, Newton's first law/momentum (frozen cat keeps its leap), the stopped-clock illusion (eyes jump ~3×/s, the brain backfills — Yarrow 2001), GPS satellite clocks +45/-7 = +38 µs/day, Lene Hau's Harvard lab "trapped a pulse of light" (2001). |
| H4 | sets/morning.js | Sets: the family kitchen at breakfast in a fresh layout (or a richer home3 kitchen variant: window light, fridge, table, cereal, juice), the hallway/living room for the evening watch beat, Mina's desk/table with the school project on Wednesday morning, a doorway gag. Moods: morning, day, evening. |

LEGAL: original story; nothing from any film/show/anime.

## Stage B (now): write the shots, batches A-D (classic style)
Voice landed: `input/voiceover.wav` 405.964 s (config duration), 1,002 words; `timeline/words.json` is the word clock.
`story/shots.json` v1: **133 shots, 0 -> 405.964 s**, contiguous, every cut 0.15 s before a spoken word (no sound cuts), `line` = the
exact spoken words (all 1,002 words covered once; the title and the rule-card titles are NOT spoken). The voice has DIGITAL SILENCE between
phrases, so every cut word and sentence start uses its audio onset (end of the silence run) where words.json is off by >= 0.1 s
(`wordTimesCorrected`; the big ones: "Silent." 10.44, "So nothing" 129.78, "You'd be" 142.89, "Third snap." 152.29, "Ten quiet"
210.98, "That has" 227.17, "Ten seconds" 267.69, "and put" 329.56, "Zero point" 343.33, "and walked" 353.19). Word placeholders in the
scene texts and all `sfx` times already use the corrected clock. Each shot has a concrete `scene` (set + helper calls, cast scale, word
beats with times from shot start, camera), `type`, `sfx` (seconds from shot start) and `amb`; every scene text ends with the LEGAL line.
Generator: `gen_shots_stoptime.py` (lead's scratchpad, adapted from gen_shots_ep5.py).

**Stage A sets are referenced by their HANDOFF names** (they were still being built when the list was written): freeze.js (H1) THE SNAP
(snap pose + ring ripple), `freezeGrade(g, k)`, FROZEN LIQUIDS, the FROZEN-MID-ACTION pose helper, the BLACK view (+ faint outline), the
WALL OF AIR view, UNFREEZE whoosh; stopprops.js (H2) STOPWATCH, KITCHEN CLOCK (second hand 'stick'), OVEN CLOCK vs WATCH, JUICE GLASS +
orange-sock splash, MILK JUG, SCHOOL PROJECT, (mixing) BOWL, BIN, BUTTER DISH, TOAST, Dev filming UI; timebp.js (H3) LIGHT SPEED/photons,
SUNLIGHT 8 min 20 s, AIR MOLECULES, KITCHEN AIR ~48 kg, NEWTON/MOMENTUM, STOPPED-CLOCK (saccades), GPS clocks, HAU STOPPED LIGHT;
morning.js (H4) breakfast kitchen (mood 'morning'), the evening kitchen/hallway, Mina's table + project, the doorway gag. **When the
sets land, use the real exported names and follow their DEMO_<set>.js call patterns** (DEMO_freeze, DEMO_stopprops, DEMO_timebp,
DEMO_morning); if a name differs from the scene text, the DEMO wins. If a set is late, draw the piece LOCALLY from the scene description.

Music plan (`music` in shots.json; the kit has no eerie/comedy/curious/heroic/twist/warm moods, so they map onto audio/music.py moods):
playful 0.4 (cold open) -> dark 0.3 = eerie (s004-s006 the black, count to ten) -> playful 0.45 (orange socks, title, Dev's clip) ->
dark 0.35 = eerie (why was it dark? + rule 1, s016-s026) -> wonder 0.35 (snap 2: the beautiful frozen kitchen, s027-s031) -> tension 0.45
(the air wall, rule 2, the held breath, s032-s053) -> playful 0.5 = comedy (snap 3: the cat, the hockey puck, the bin, rule 3, s054-s069)
-> mystery 0.35 = curious (snap 4, the stuck clock, rule 4, s070-s087) -> wonder 0.35 = curious (the watch + rule 5 GPS, s088-s101) ->
tension 0.45 (Wednesday, the jug tips, s102-s104) -> epic 0.45 = heroic (the frozen rescue, s105-s110) -> triumph 0.6 (splash, every
drop, "Zero point zero seconds.", s111-s115) -> mystery 0.45 = twist (Biscuit moved, the snap is gone, the toast, s116-s123) -> hopeful
0.4 = warm (real life, stopped light, recap, s124-s131) -> calm 0.45 = warm (question + end screen, s132-s133).

| Batch | Worker | Ids | Time | Content | Main sets |
|---|---|---|---|---|---|
| A | H1 | s001-s035 | 0.00-99.12 (99.1 s) | COLD OPEN (Tuesday breakfast, the juice goes over, SNAP 1 s003, everything goes BLACK s004, silent/can't see your hand s005, count to ten read-out s006, light back + juice lands s007, orange socks s008, nobody knows + giant face HERO s010, TITLE s011); Dev films / Mina's stopwatch / "to them nothing happened" / Dev's jump-cut clip s012-s015; why was it dark, lights on + sun out; RULE 1 card s018 + FIG 1-3 (~300,000 km/s, it has to travel, 8 min 20 s, the eye + retina), frozen light hanging s023, none arrives s024, "wouldn't look frozen" split s025, nothing at all s026; SNAP 2 s027 (the snap learned), the light keeps moving, juice beads, Dev mid-sneeze, Biscuit mid-leap, the WALL OF AIR s032-s033, giant face HERO gasp s034, nothing comes in s035 | morning.js kitchen (+ home3 fallback), freeze.js (snap, freezeGrade, black view, frozen liquids, frozen pose, wall of air, unfreeze), stopprops.js (juice glass, sock splash, stopwatch, Dev filming UI, butter), timebp.js light/sun, bp eye/retina/photon, hud ruleCard/chip, faces |
| B | H2 | s036-s068 | 99.12-204.57 (105.5 s) | RULE 2 card s036 + FIG 4-6 (1 cm³ ~ a fingertip, ~25 BILLION BILLION / 2.5 × 10¹⁹, never sit still, ~500 m/s vs a jet ~250 m/s, air pressure, the diaphragm, outside air pushes in, frozen molecules can't push, nothing flows, air is heavy, the kitchen's air 4 × 4 × 2.5 m = 40 m³ × 1.2 kg/m³ ~48 kg = about you), stuck molecules / can't open a door / statue gag, ten seconds is fine, giant face HERO cheeks puffed + UNFREEZE s053; SNAP 3 s054 (the moving-air bubble), breathe + walk, Biscuit inches from the butter, lift her out of the air, butter saved + time restarts s058, the furry hockey puck s059, into the bin s060; RULE 3 card s061 + FIG 7 (Newton's 1st law, momentum p = m × v, heavier/faster harder to stop, her speed stays, "in our story" saved for later, push against motion, goalkeeper gloves) | timebp.js air/kitchen air/Newton, bp board/label/draw, freeze.js (wall of air, grade, snap, unfreeze, frozen pose), stopprops.js (stopwatch, butter, bin), morning.js kitchen + doorway gag, hud ruleCard/chip, faces |
| C | H3 | s069-s101 | 204.57-305.62 (101.1 s) | Biscuit's long cold look s069; SNAP 4 s070 (ten quiet seconds, time-lapse read-out), time restarts, the KITCHEN CLOCK sticks s073, giant face HERO heart jumps s074, it ticks / ticks again / normal; RULE 4 card s077 (+ chip 'STOPPED CLOCK ILLUSION') + FIG 8 (eyes don't glide, ~3 jumps / s, the blur hidden, fills the gap, the first tick too long, 2001 / UCL London / backwards in time to just before the eyes moved), giant face DEV s086, split second s087; THE WATCH (that evening, watch vs oven clock 18:30:40 vs 18:30:00, MINA lip-sync "Yours is forty seconds fast," s089, 4 × 10 = 40 s, giant face HERO '+40 s' s091); RULE 5 card s092 + FIG 9 (much smaller, GPS satellites + atomic clocks, +45 µs/day, −7 µs/day, +38 µs every day, vs ground clocks, EINSTEIN text card, the correction off, the map off by kilometres) | stopprops.js (bin, kitchen clock, oven clock + watch, stopwatch), freeze.js (snap, grade, unfreeze), timebp.js stopped-clock + GPS, morning.js kitchen + evening kitchen/hallway, hud ruleCard/chip, faces |
| D | H4 | s102-s133 | 305.62-405.964 (100.3 s) | THE RESCUE (Wednesday breakfast + Mina's project, Biscuit hits the milk jug, it tips toward the project, SNAP 5 s105 'LIGHT: MOVING' / 'AIR: MOVING', RULE 3 chip, it would still be falling, slide the project away, the big mixing bowl under the frozen milk arc, time restarts + SPLASH s111, every drop in the bowl, Mina's dry project, giant face MINA s114, MINA lip-sync "Zero point zero seconds." s115); THE TWIST (something moved, Biscuit blinked + stretched + walked through the frozen kitchen, cats in impossible places, next morning the snap fizzles s120, giant face HERO s121, tail flick, already eating your toast); ENDING (nobody can stop time, dark + no air recap, stopped light: 2001 / Harvard / Lene Hau's team / super-cold atoms / ~1/1,000 s / let go, brain stretches moments + '+38 µs/day' recap, the QUESTION lock-up s132, end screen s133) | morning.js kitchen + Mina's table, stopprops.js (milk jug, project, bowl, stopwatch, butter, toast), freeze.js (snap, frozen liquids, grade, unfreeze, black view, wall of air), timebp.js Hau stopped light + GPS, hud chip, faces, UI.endScreen |

### Rules for shot writers
- Write ONLY your own file: `scenes/shots/<BATCH>_*.js` (e.g. `A_cold_open.js`, `D_rescue.js`) registering exactly your batch's ids from
  shots.json. Do not edit shots.json, sets/, cast.js, config, tools, engine or another batch's files (Stage A set owners: fix your set in
  your own Stage A branch, not inside a shot file). Need a prop no set has (the ghost mattress, the statue plinth, the magnifier lens, the
  orange, goalkeeper gloves, the generic jet, the generic map phone, cats-in-impossible-places montage)? Draw it LOCALLY in your shot file.
  Leave the DEMO_*.js files alone (the lead removes them at integration).
- **Hero look in every shot (cast.js + LOCAL):** `actor('HERO')` (teal tee #2f8f8a, black 'spiky' hair #16141c, navy legs #24305e) + LOCAL:
  one black cowlick tuft straight up, round tortoiseshell glasses #8a5a2b, cream #efe3c8 stripes and long sleeves on the tee, tiny cream
  stars on the pyjama legs, mismatched socks green #3aa05a / yellow #ffd23c, the chunky black digital watch (left wrist; it matters in
  s088-s091). **giantFace HERO** draws a teal HOOD behind the head (faces.js `body()`, from ep 3): paint over it LOCALLY with a striped
  teal/cream crew-neck and add the cowlick + glasses (or the lead patches faces.js with a hood-off option at integration). MINA red scarf +
  stopwatch, DEV orange beanie + phone (always filming), BISCUIT purple collar. The hero carries no gadget: the power is only the snap.
- **Every SNAP** (s003, s027, s054, s070, s105) = freeze.js THE SNAP (pose + ring ripple from the fingertips) on the 'snap' word +
  `freezeGrade(g,k)` ramping 0->1 (s003: the frame then goes BLACK) + the **10-second read-out** (stopprops.js STOPWATCH as a small HUD
  dial, gold digits) running the hero's frozen time, continued shot to shot: snap 1 s003-s006 00.0 -> 10.0 (lands on 'ten' s006); snap 2
  s027-s035 00.0 -> 08.0, held through the Rule 2 science, s052-s053 08.0 -> 10.0 + UNFREEZE on 'starts'; snap 3 s054-s058 00.0 -> 10.0 +
  UNFREEZE on 'Time'; snap 4 s070 00.0 -> 10.0 time-lapse, UNFREEZE s071; snap 5 s105-s110 00.0 -> 10.0, UNFREEZE + splash s111. s120 is
  the snap that FAILS: the ripple fizzles like a soap bubble, NO grade, the dial shows 00.0 and only blinks. The exact from -> to values
  are in each scene text. Frozen shots: `freezeGrade` LAST, only the HERO keeps warm colour and moves (Biscuit too in the twist flashback
  s117-s118), frozen figures never idle/blink; normal time = warm colour. Frozen shots have NO ambience (`amb` omitted on purpose).
- Rule cards (hud ruleCard, exact titles from script.md, not spoken; the card plays over the section's first line): s018 'YOU ONLY SEE
  LIGHT THAT ARRIVES.', s036 'AIR IS STUFF.', s061 "MOTION DOESN'T PAUSE." (+ chip 'NEWTON'S 1ST LAW'), s077 'YOUR BRAIN CAN STOP A
  CLOCK.' (+ chip 'STOPPED CLOCK ILLUSION'), s092 'CLOCKS REALLY CAN DISAGREE.'.
- Blueprints (bp board, cream on navy, GOLD numbers) for every science beat, numbers exactly as sources.md: ~300,000 km/s, 8 min 20 s
  (~150 million km), retina, 1 cm³ ~ a fingertip, ~25 billion billion = 2.5 × 10¹⁹ per cm³, ~500 m/s vs airliner ~250 m/s, diaphragm,
  4 × 4 × 2.5 m = 40 m³ × 1.2 kg/m³ ~48 kg, Newton's 1st law, p = m × v, ~3 jumps/s, NATURE 2001 / UCL London (Yarrow et al. as small
  text), GPS +45 / −7 = +38 µs/day, 'kilometres off' (no number), 2001 / Harvard / Lene Hau's team / ~1/1,000 s. The thought-experiment
  conclusions stay framed as such ("IN OUR STORY" chip on s066). Gold numbers for every spoken number (QUALITY_BAR 36), including the
  '10' on every "ten seconds", '+40 s' / '4 × 10 = 40 s', '0.0' on Mina's stopwatch.
- Giant faces on reaction beats (never two in a row, checked): HERO s010, s034, s053, s074, s091, s121; DEV s086; MINA s114.
- Lip-sync ONLY the two quoted lines, both MINA: s089 "Yours is forty seconds fast," (not "she says.") and s115 "Zero point zero
  seconds.". The narrator and the HERO are never lip-synced (s012 explains with gestures only).
- Real people only as plain text (Einstein s099, Lene Hau s128, the 2001 London team s084): no photo, no likeness, no figure.
- SFX (kit library names only): finger snap = `pop` pitch 2.2 dur 0.08 + `hit` pitch 1.9 + `freeze` (the time-freeze swell);
  unfreeze = `whoosh` pitch 0.7 + `swish` pitch 0.6; read-out = `tick` / `counter` + `ding` on 10.0; the black = `heartbeat`; wall of air
  = soft `hit` pitch 0.6; juice/milk splash = `rain` dur 0.5 + `hit` pitch 0.7; the bin = `hit` + `impact` pitch 1.3; kitchen clock =
  `tick` (silence when it sticks); rule card = `stinger`; title/question = `stinger` minor:false (+ `shimmer`); GPS = `hum`; stopped
  light = `slowmo`. Ambience: kitchen/evening `roomtone` -32; frozen, black and blueprint shots none. Adjust `at` only if you change the
  beat (tell the lead).
- Known short shots (< 2 s, keep them punchy): s004, s006, s010 (1.5), s014, s016, s034, s039, s047, s049, s051, s068, s071, s074, s078,
  s083, s093, s100, s108, s121, s122, s127. Known long (> 4.5 s): s021 (one sun-to-earth trip), s022 (one eye diagram), s040, s066 (two
  linked beats on one frame), s069 (one stare), s096, s125 (two recap panels), s128.
- QUALITY_BAR 18 exception: s004-s006 are meant to be (near) pitch black; the gold read-out dial and the faint cream hand outline are the
  accents. Everything else keeps the bar.
- QC loop per shot: `node render.mjs --project projects/stop-time --stills <ids> --scale 0.5` (start+0.3, mid, end-0.3) and `--sheet
  --scale 0.4` for the batch; tick QUALITY_BAR (size, expression change on a word, blink, idle, camera, parallax, atmosphere, rim, props,
  text, determinism, no SHOT ERROR / MISSING for your ids) and the LEGAL list. Render cost <= ~1.5 s/shot.
- Push to your own branch; status line to `handoff/outbox/H<n>.md`; the lead integrates.
