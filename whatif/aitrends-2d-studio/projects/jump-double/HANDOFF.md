# HANDOFF: "What If Every Day, Your Jump Doubled?" (ep 2)

Script, sources and the animated shot plan: `whatif/what-if-jump/` (script.md, sources.md, shot_plan.md). Same kit and same quality bar as ep 1 (`QUALITY_BAR.md` here, copied from see-in-dark; `S_showcase.js` in see-in-dark is the reference level).

## Status
- **Voice:** waiting on the owner's PC (same locked voice as ep 1), to land at `input/voiceover.wav` + `input/script.txt`. Until it does, there's NO timing, so don't write shots.json-bound shots.
- **Copied from ep 1 (shared, read-only for workers):** cast.js, sets/acting.js, actors.js, bp.js, creatures.js, faces.js, hud.js, apartment.js (bedroom/home scenes) and street.js (neighbourhood).

## Stage A (now, no voice needed): build the new sets and devices
Each worker writes ONLY its own files. Every set follows the ep 1 set API: `name(g, t, cam, opts)` returns `{GY, CX, M, rim, pos}`, plus `nameFg(...)` for the foreground, with parallax layers, practical lights, >= 8 props, and atmosphere. Each set ships with a demo shot in `scenes/shots/DEMO_<set>.js` (registerShot on a temporary id like 'demo_court') so it can be sheet-checked.

| Worker | Files | What |
|---|---|---|
| H2 | sets/court.js, sets/stadium.js, sets/roofs.js | Outdoor basketball court (adjustable hoop 10-12 ft, net/rim physics props, bench, fence, phone-crowd); athletics stadium (high-jump bar 2.45 m with a sign, pole-vault area with a 6.31 m marker, track, stands); neighbourhood rooftops (2-storey houses, a ladder, a kite tree, Niagara-style cliff/falls backdrop option, town pond with ducks) |
| H3 | sets/skyline.js, sets/peaks.js, sets/sky.js, sets/orbit.js | City skyline with a Burj-style supertall (828 m label) + lake; cloud layer and Himalaya with Everest's summit flag (8,849 m); stratosphere gradient (blue to black by altitude, a jet passing, a balloon marker 41 km, breath-fog fading); edge of space (Earth curve, a 100 km dashed line, stars, silence) + low orbit with an ISS and astronauts waving through a window |
| H4 | sets/jump.js, sets/devices.js | The JUMP rig on top of acting.js: `jumpPose(t, t0, height)` with crouch, launch (squash, dust ring), rise (motion trail), apex hang (hoodie flutter), fall (speed lines), landing (impact frame, shake, dust/splash/boing variants); the DAY counter (split-flap, flips with a tick hook); the height meter (side gauge with landmark ticks and a gold readout); gauges (speedometer "90 km/h", terminal velocity ~200 km/h, escape 11.2 km/s); phone UI (views counter, "FAKE" comments); TV news lower-third; the doubling bar graph |

Sheet-check every set with `node render.mjs --project projects/jump-double --stills ... --scale 0.5` against QUALITY_BAR. Push to your own branch; the lead integrates into `whatif/see-in-dark`.

## Stage B (after the voice lands): the lead re-times
transcribe.py + beats.py, writes story/shots.json from shot_plan.md, splits it into A/B/C, then the same shot-writing loop as ep 1.
