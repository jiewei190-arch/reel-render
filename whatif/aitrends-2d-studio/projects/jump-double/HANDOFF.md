# HANDOFF: "What If Every Day, Your Jump Doubled?" (ep 2)

Script, sources and the animated shot plan: `whatif/what-if-jump/` (script.md, sources.md, shot_plan.md). Same kit and same quality bar as ep 1 (`QUALITY_BAR.md` here, copied from see-in-dark; `S_showcase.js` in see-in-dark is the reference level).

## Status
- **Voice:** landed (Fenrir, the locked What If voice): `input/voiceover.wav`, 358.690 s. Re-timed with transcribe.py (small.en, 88% script-word match) + beats.py; `timeline/words.json` is the word clock (`wordTime`). `story/shots.json` v1 is written: 112 shots, split A-E (see Stage B).
- **Copied from ep 1 (shared, read-only for workers):** cast.js, sets/acting.js, actors.js, bp.js, creatures.js, faces.js, hud.js, apartment.js (bedroom/home scenes) and street.js (neighbourhood).

## Stage A (now, no voice needed): build the new sets and devices
Each worker writes ONLY its own files. Every set follows the ep 1 set API: `name(g, t, cam, opts)` returns `{GY, CX, M, rim, pos}`, plus `nameFg(...)` for the foreground, with parallax layers, practical lights, >= 8 props, and atmosphere. Each set ships with a demo shot in `scenes/shots/DEMO_<set>.js` (registerShot on a temporary id like 'demo_court') so it can be sheet-checked.

| Worker | Files | What |
|---|---|---|
| H2 | sets/court.js, sets/stadium.js, sets/roofs.js | Outdoor basketball court (adjustable hoop 10-12 ft, net/rim physics props, bench, fence, phone-crowd); athletics stadium (high-jump bar 2.45 m with a sign, pole-vault area with a 6.31 m marker, track, stands); neighbourhood rooftops (2-storey houses, a ladder, a kite tree, Niagara-style cliff/falls backdrop option, town pond with ducks) |
| H3 | sets/skyline.js, sets/peaks.js, sets/sky.js, sets/orbit.js | City skyline with a Burj-style supertall (828 m label) + lake; cloud layer and Himalaya with Everest's summit flag (8,849 m); stratosphere gradient (blue to black by altitude, a jet passing, a balloon marker 41 km, breath-fog fading); edge of space (Earth curve, a 100 km dashed line, stars, silence) + low orbit with an ISS and astronauts waving through a window |
| H4 | sets/jump.js, sets/devices.js | The JUMP rig on top of acting.js: `jumpPose(t, t0, height)` with crouch, launch (squash, dust ring), rise (motion trail), apex hang (hoodie flutter), fall (speed lines), landing (impact frame, shake, dust/splash/boing variants); the DAY counter (split-flap, flips with a tick hook); the height meter (side gauge with landmark ticks and a gold readout); gauges (speedometer "90 km/h", terminal velocity ~200 km/h, escape 11.2 km/s); phone UI (views counter, "FAKE" comments); TV news lower-third; the doubling bar graph |

Sheet-check every set with `node render.mjs --project projects/jump-double --stills ... --scale 0.5` against QUALITY_BAR. Push to your own branch; the lead integrates into `whatif/see-in-dark`.

## Stage B (now): write the shots, batches A-E
`story/shots.json` v1: **112 shots, 0 -> 358.69 s**, contiguous, every cut 0.15 s before a spoken word, `line` = the exact spoken words. Each shot has a concrete `scene` (sets + helpers to use), `type`, `sfx` cues (seconds from shot start) and `amb`; the story-level `music` plan is: playful (cold open, days 1-5) -> tension building (day 6 on, 0.45 -> 0.75) -> near-silence at the edge of space (calm 0.05, s076-s082) -> sad (Mina at night) -> wonder (orbit) -> dark heartbeat (until day 25) -> epic swell (the last jump) -> hopeful (ending).

| Batch | Ids | Time | Content | Main sets |
|---|---|---|---|---|
| A | s001-s020 | 0.00-68.99 (69.0 s) | Cold open (ceiling bonk, DAY counter born, doubling graph), title, court days 1-3 (miss, slow-mo dunk, "Do that again", 12 ft crank, record card), viral phone, Mina's kite | apartment (bedroom, day), devices (dayCounter, doublingGraph, phone, heightMeter), court, roofs (title moon, kite tree), jump, bp |
| B | s021-s044 | 68.99-140.43 (71.4 s) | Rule 1, stadium day 4 (2.45 m bar, crunch, "ow"), day 5 pole-vault mark + roof + ladder + Biscuit, day 6 five-storey block, Rule 2, fall stats, landing gadgets, day 7 90 km/h launch + hoodie, day 8 Niagara shoes gag | hud ruleCard, stadium, roofs (houses, falls), street (+ local 5-storey block, traffic light), jump (landings), devices (gauge launch), bp |
| C | s045-s066 | 140.43-216.61 (76.2 s) | Day 9 pond + ducks, day 10 TV news, day 11 traffic lights, Rule 3, terminal velocity (gauge, blueprint, crash-test dummy), day 12 Burj, days 13-14 clouds, day 15 Everest "so close" | roofs (pond, houses), devices (tv, newsLowerThird, gauge terminal), street, hud, sky, bp, skyline, peaks (+ cloudLayer) |
| D | s067-s088 | 216.61-281.85 (65.2 s) | Day 16 jets, Rule 4, pass-out face, tank + DEV helmet gags, days 17-18 balloon 41 km, blue to black, day 19 edge of space (100 km line, silence, fall, re-entry glow), Mina at night + the notebook | sky (stratosphere, breathFog, vision), hud, roofs (backyard, night town), orbit (spaceEdge), apartment (night) |
| E | s089-s112 | 281.85-358.69 (76.8 s) | Day 21 ISS + waving astronauts, orbit blueprint, Rule 5, days 22-24 + snacks, day 25 at dawn, escape velocity, Mina/Dev/Biscuit, the crouch + cut to black, reality check, montages, question, end screen | orbit (orbit, iss), bp, hud, devices (dayCounter, gauge escape, heightMeter), roofs (backyard at dawn), faces, UI.endScreen |

**Batch E is done by the owner's PC session**, so its `scene` texts are self-contained (set call, options, cast scale, helpers, word beats). Everything it needs is in this folder: sets/orbit.js, devices.js, roofs.js, bp.js, hud.js, faces.js, jump.js and `DEMO_orbit.js` / `DEMO_devices.js` / `DEMO_roofs.js` as references.

### Rules for shot writers
- Write ONLY your own file: `scenes/shots/<BATCH>_*.js` (e.g. `A_cold_open.js`, `E_orbit.js`) registering exactly your batch's ids from shots.json. Do not edit shots.json, sets/, cast.js, config, tools, engine or another batch's files: shared files are read-only. Need a prop or helper? Draw it locally in your shot file (e.g. the bed, the 5-storey block, the traffic light, the moon-rock sign).
- `DEMO_*.js` shots are set references (temporary `demo_*` ids). They are NOT part of shots.json; copy their patterns, don't register their ids.
- Scale: H2 sets use **1 m = 260 units** (`M2U`, figures at s 1.9 = 1.75 m). heightMeter takes metres; jumpPose takes world units.
- Devices on every beat: DAY counter flips (tick SFX) on each "Day ___" word, heightMeter on every jump shot, gold numbers for every spoken number (QUALITY_BAR 36). Jump grammar = jumpPose/jumper/jumpFX/jumpCam/impactFrame.
- Lip-sync only the quoted lines: DEV s013 ("Do that again"), MINA s019 (kite), s085 ("What happens..."), s103 ("Don't" / "Please"). The narrator is never lip-synced.
- SFX: the kit library has no thud/splash/boing, so shots.json already maps them: thud = `hit` pitch 0.75 (big = `impact`), splash = `rain` dur 0.9 + low `hit`, boing = `blip` pitch 0.35, puff = low `whoosh`, launch = `whoosh`, rim rattle = `hit` pitch 1.6, counter flip = `tick`, dunk = `swish`. Adjust `at` only if you change the beat (tell the lead).
- QC loop per shot: `node render.mjs --project projects/jump-double --stills <ids> --scale 0.5` (3 times per shot: start+0.3, mid, end-0.3) and `--sheet --scale 0.4` for the batch; tick QUALITY_BAR section 11 (size, expression change on a word, blink, idle, camera, parallax, atmosphere, rim, props, text, determinism, no SHOT ERROR / MISSING for your ids). Render cost <= ~1.5 s/shot.
- Known short shots (< 2 s, keep them punchy): s026 (1.9), s030 (1.8), s083 (2.0), s105 (1.7).
- Push to your own branch; the lead integrates into `whatif/see-in-dark`.
