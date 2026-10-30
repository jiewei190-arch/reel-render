# HANDOFF: What If SHORT "What If You Were in a Zombie Apocalypse With Zero Experience?" (9:16 vertical, 62.7 s, YouTube Shorts)

Script: `whatif/shorts-originals/zombie/script.md` (fiction, comedy; read the header). Voice landed: `input/voiceover.wav` 62.67 s (Fenrir).
Word clock `timeline/words.json` (94% match). CAPTIONS ON (rule 23) at y 1330: keep key action out of y 1270-1400 while words are up
and out of the bottom 480 px / right 180 px (YouTube Shorts UI). Sets copied from ep 2 (apartment, street, roofs, court, devices, faces, jump...).

## Look (HORROR, owner Oct 31: "I want horror, the place needs to be dark")
Same HORROR BAR as `projects/rules-01/HANDOFF.md` (read it): cold dark palette + one practical light (the flashlight beam, moonlight
through the front glass, a freezer-room bulb), grain, vignette, slow pushes, cuts on sound, fear from what you DON'T see.
`sets/horror.js` (FX, endCard) and `sets/house.js` are copied in. HERO = mustard hoodie (ep 1 look); DEV appears only as a muffled voice
through the steel freezer door and a shadow in the light under it. Zombies are SILHOUETTES: dark shapes and hands pressed on the front
glass, a crowd you never see clearly, eyes catching the flashlight at most. No gore, no bites shown, no weapons. Hard cut to black after
"Would you open the door?" with endCard "Full What If stories on the channel." (or "Follow for part two.").

## Stage A (sets/props)
| Worker | Files | What |
|---|---|---|
| H2 | sets/zombies.js + DEMO_zombies.js | Horror zombies: `zombieSil(g, x, y, s, {t, sway, eyes:0..1})` a dark silhouette (torn edges, slumped shoulders, head tilt), `glassHorde(g, t, {n, press:0..1, hits})` silhouettes and palms pressing on a big store front window from outside in moonlight, with thuds (`hits` times) and smears of condensation (no blood), `handsOnGlass`. |
| H1 | sets/store.js + DEMO_store.js (after rules-03 batch C) | The DARK SUPERMARKET: `store(g,t,cam,{view:'front'|'aisle'|'back'|'freezer'|'door', flashlight:{x,y,ang,on}, moon})`: front glass wall with moonlight and the parking lot beyond, empty shelves, a toppled cart, the back corridor, the FREEZER ROOM (frost, hanging plastic strips, a dim cold bulb, breath fog, a steel door with NO inside handle, light and a shadow under the door), a dead phone (`deadPhone` 10% -> 0%). |

## Stage B (now): write the shots, batches A-C
`story/shots.json` v1: **32 shots, 0 -> 65.452 s** (voice re-recorded: 65.45 s, not 62.7), contiguous, every cut 0.15 s before a spoken
word except the cuts that land on a SOUND: s001 (the palm SLAMS on the glass on frame 1), s013 glass hit 1 (on 'hits'), s014 glass hit 2,
s019 the freezer-door SLAM (on the 'shut' onset, 34.76), s027 knock 1 (51.75), s028 knock 3 (54.80, before [DEV]), s032 hard cut to black
(63.95). `line` = the exact spoken words (all 109 covered once). Each shot has a concrete `scene` (batch kit line + set/helper calls with
options, cast, camera, light, word beats as seconds from shot start, one unsettling detail, safe zones), `type`, `sfx` (seconds from shot
start), `amb` (wind outside, roomtone in the store, roomtone -28 + hum in the freezer). Story-level `music`: one `dark` drone: 0.45 hook ->
0.25 -> 0.3 dead city -> 0.2 hiding -> 0.12 MISTAKE 1 / flashlight -> 0.04 the eyes -> 0.55 hits -> 0.8 "a hundred" -> 0.65 MISTAKE 2 / run ->
0.06 SLAM + "Cold. Dark. Silent. Safe." -> 0.3 MISTAKE 3 / no handle -> 0.12 hours / phone -> 0.03 knocks + [DEV] -> 0.2 "It's Dev." -> 0.55
"But Dev didn't..." -> 0.05 "Would you open the door?" hold -> 0.02 black.

**LEAD TODO:** `config.json` `fadeIn` is 0.5 (engine/player.js fades the whole frame up from black). The hook must hit on frame 1: set
`fadeIn: 0` for this Short (not done here: only shots/words/HANDOFF are in this commit).

**Timing (read this):** `timeline/words.json` has been RE-TIMED from the voice envelope (10 ms RMS bursts in input/voiceover.wav, -28 dB rel.
peak, gaps < 0.15 s merged; tails and the muffled [DEV] burst re-checked at -40 dB / 0.05 s gaps and on the 10 ms dB profile), every line's
words spread across its burst weighted by length, so the burned-in captions and `wordTime()` are in sync. Big fixes (burst, was): "The door
only opens from the outside." 43.58-45.58 (43.46-47.64: stretched 2 s over the silence, captions would have hung); "Day one of the zombie
apocalypse." 0.49-2.29 (0.08-2.08); "Cold." 35.87-36.41 (36.22, zero length); "Hours pass." 47.38-48.20 (47.64). "You run to the back," 31.44-
32.40 and "into the freezer room, and pull the door shut." 32.56-35.03 are timed as two bursts ('shut' 34.76 = the slam cut). [DEV] one burst
55.47-56.69 split on its dips: "Hey." 55.47-55.73, "It's me." 55.82-56.18, "Open up." 56.20-56.69. The rest moved < 0.35 s (edges). Voice
ends 63.45, hold 0.5 s, black at 63.95, end card 1.5 s. (All bursts are also stored in `wordTimesCorrected`.)

| Batch | Ids | Time | Content | Main sets |
|---|---|---|---|---|
| A -> H3 | s001-s012 | 0.00-23.22 (23.2 s) | HOOK: a palm slams the glass on frame 1 + 'DAY ONE' scratched on the glass; "No weapons." empty hands, "No plan." lost in the dead street (a far silhouette), "No experience." face hold; the power dies house by house; the whole city dark from above (tiny drag-walkers, one looks up); slipping into the supermarket; AISLE 7, the EXIT sign dies; doors locked; MISTAKE 1 ink card; the flashlight CLICKS on and hits the glass; reverse: the eyes in the lot catch the beam | street (power 1->0), store (front, aisle), zombies (handsOnGlass, zombieSil eyes), horror (ruleTitle copy, flashlight via storeFg), faces |
| B -> H4 | s013-s024 | 23.22-47.23 (24.0 s) | Cut on HIT 1 (the palm in the beam), HIT 2 (another), "a hundred" glassHorde press 0.3->1 with 15 accelerating hits; MISTAKE 2; the run down the aisle; the back corridor + pulling the freezer door shut; the SLAM (cut on 'shut'); "Cold. Dark." wide hold (breath fog, the bulb dies); "Silent. Safe." he slides down the wall; MISTAKE 3; insert on the smooth steel (no handle, 4 empty screw holes, scratches); the realisation face | zombies (handsOnGlass, glassHorde + shake), store (front, aisle, back, freezer, door), breathFog, horror, faces |
| C -> H1 | s025-s032 | 47.23-65.452 (18.2 s) | "Hours pass." time-lapse (frost creeps, the flashlight dies); the phone 10% -> 0% then dark ("Then, a knock." over black); cut on KNOCK 1, knock 2, "Slow. Patient."; cut on KNOCK 3: floor level, the light under the door, [DEV] "Hey. It's me. Open up." + the shadow bars; "It's Dev." hope face; "But Dev didn't make it out on day one." the turn; "Would you open the door?" the handleless door + 0.5 s hold; hard cut to black + endCard 'Full What If stories on the channel.' | store (freezer, door, shadow/under), deadPhone, breathFog, house.js knockAt, faces, horror endCard |

All three batches' `scene` texts are self-contained (each starts with its batch kit line: helpers, look, story so far).

### Rules for shot writers
- Write ONLY your own file: `scenes/shots/<BATCH>_*.js` (e.g. `A_store.js`, `B_freezer.js`, `C_knock.js`) registering exactly your batch's
  ids from shots.json. Do not edit shots.json, words.json, sets/, cast.js, config, tools, engine or another batch's files. Need a prop (the
  sliding-door lock, a car's dome light)? Draw it locally in your shot file.
- Helper names are the INTEGRATED Stage A names (read `sets/store.js`, `sets/zombies.js` headers and `DEMO_store.js` / `DEMO_zombies.js`):
  `store(g,t,cam,{view:'front'|'aisle'|'back'|'freezer'|'door', moon, flicker, shadow, under, frost, strips})` BEFORE characters and
  `storeFg(g,t,cam,{view, flashlight:{x,y,ang,on,len,spread}})` AFTER (flashlight in SCREEN coords at the hero's hand), `breathFog`,
  `deadPhone(g,t,x,y,s,{pct})`; `zombieSil(g,x,y,s,{t,sway,eyes,tilt,rim,arms,step,seed})`, `handsOnGlass(g,t,x,y,s,{press,slide,rot,seed,
  fog})`, `glassHorde(g,t,{x,y,w,h,n,press,hits,moon,seed,back})` (returns {shake}: apply it to the camera), `thudShake`; `street(g,t,cam,
  {power})` for the dead city; horror.js `grain`, `vignette`, `coldGrade`, `breathe`, `flicker`, `flashlight`, `motes`, `interference`,
  `scrawl`, `endCard`; house.js `knockAt`. horror.js `ruleTitle` writes 'RULE ONE': for the MISTAKE cards (s010, s016, s022) copy it locally
  as `mistakeTitle` that writes 'MISTAKE 1/2/3'.
- Canvas 1080x1920 (`V(landscape, vertical)`). CAPTIONS ARE ON at y 1330: faces, hands, eyes and key action above y 1270 while words are up
  (caption band y 1270-1400); YouTube Shorts UI: nothing important below y 1440 (bottom 480 px) or right of x 900 (right 180 px).
- HORROR LOOK every shot: cold blue dark; one practical (moonlight through the glass / the flashlight / the caged freezer bulb / the warm line
  under the door / the dying phone); grain + vignette + cold grade + breathe; a slow push or drift; one unsettling detail. Zombies are
  silhouettes only (eye glints, palms, shapes); no gore, no bites, no weapons. Dev is NEVER shown: voice + two shadow bars under the door.
- Continuity: HERO = mustard hoodie (hood up from s004 on). Flashlight OFF until s011 (clicks on, on 'flashlight'), on through s017-s018 and
  in his lap in s021, used on the door plate in s023, dies on 'pass' in s025. Front glass: eyes s012, hit 1 s013, 2 hands s014, the full horde
  s015. Freezer: door slams s019, bulb dims on 'Dark' s020, strips still on 'Silent' s021 (one keeps swaying), frost 1 from s019 (creeps over
  him in s025). Phone 10% -> 0% in s026 only. Under-door light: always on in the freezer; shadow bars arrive on 'Hey' (s028) and stay
  (s030-s031); the line goes fully dark in the last 0.3 s of s031.
- HERO is never lip-synced (narrator + [DEV] off-screen). Expression change on a word in every face/med shot (times in the scene texts).
- SFX (kit names only, gains that land): glass hits = `hit` pitch 0.65-0.9 at -6 (first ones) -> -8/-10 in the "hundred" flurry, + `impact`
  -12/-14 under the first; freezer slam = `impact` -8 pitch 0.6 + `hit` -6 pitch 0.4; KNOCK = `hit` pitch 0.5 at -6/-6/-5 (as in the RULES
  finals); flashlight click / locks = `tick` -6/-8; MISTAKE card = static burst `rain` -6 (dur 0.4) + `glitch` -12 + `hit` -10 pitch 0.5;
  phone dies = `blip` -20 + `glitch` -12; breath = `whoosh` pitch 0.35-0.4 at -30; heartbeat 72 -> 88 -> 96 (realisation) -> 70 (knocks) ->
  84 ([DEV]) -> 104 (the turn); end = `impact` -8 + `hit` -10 pitch 0.45. Adjust `at` only if you change the beat (tell the lead).
- Known short shots (keep them punchy): s002 (1.7), s003 (1.6), s005 (1.7), s008 (1.6), s009 (1.7), s011 (1.6), s012 (1.1, silent eyes),
  s013 (1.8), s014 (1.6), s017 (1.1), s019 (1.0, the slam), s024 (1.4), s025 (1.7), s029 (1.5), s032 (1.5 end card). Dread holds: s004 (2.8),
  s015 (2.6), s020 (2.8), s021 (2.8), s026 (2.9), s027 (3.05), s028 (2.9), s030 (2.9).
- QC loop per shot: `node render.mjs --project projects/zombie-short --stills <ids> --scale 0.5` (start+0.3, mid, end-0.3) and `--sheet
  --scale 0.4` for the batch; tick QUALITY_BAR + HORROR BAR (expression on a word, blink, idle, camera, depth, atmosphere, rim, one unsettling
  detail, safe zones incl. the caption band, determinism, no SHOT ERROR / MISSING for your ids). Render cost <= ~1.5 s/shot.
- Push to your own branch; the lead integrates into `whatif/see-in-dark`.

