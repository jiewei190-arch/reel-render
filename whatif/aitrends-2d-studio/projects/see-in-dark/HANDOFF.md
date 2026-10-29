# HANDOFF: shot writers for "What If You Could See in Complete Darkness?"

Project: `C:\Users\jiewe\Howitreallyworks\reel-render\longform\aitrends-2d-studio\projects\see-in-dark\` (all paths below are relative to it). 16:9, 1080p, 24 fps, style `dusk`, 414.56 s, 120 shots. Voiceover and timings are final; `story/shots.json` owns timing. Read first: `story/bible.md`, this file, `scenes/shots/S_stage1_examples.js` (4 finished shots = the working pattern), and the kit docs (`..\..\SETUP_NOTES.md`, style-bible/engine-api in the plugin skills).

## Batches (each shot has `batch`, `type`, `view` ("thermal" or "normal"), `scene` in shots.json; implement what `scene` says)
| Batch | Ids | Time | Write only |
|---|---|---|---|
| A | s001-s039 | 0:00-2:22 | `scenes/shots/A_*.js` |
| B | s040-s081 | 2:22-4:41 | `scenes/shots/B_*.js` |
| C | s082-s120 | 4:41-end | `scenes/shots/C_*.js` |
DONE in stage 1 (do NOT redefine): **s001** blackout street, **s008** thermal view, **s011** RULE 1 card, **s012** blueprint eye. Name files like `B_s040_s044_viper.js` (several `registerShot` per file is fine; one file per scene cluster).

## Rules
- Write ONLY your own `X_*.js`. `scenes/cast.js`, everything in `scenes/sets/`, `story/*`, `config.json` and the kit (`engine/`, `tools/`) are SHARED and READ-ONLY. Need a new prop/set tweak? Draw it inside your own shot file (a local helper) and tell the coordinator.
- No `Math.random` / `Date.now` (use `rng(seed)`, `t`). Colours from `mood()` / `S()` / the set returns (`A.rim`, `A.M`). `V(h, v)` for aspect-dependent numbers. Imports use absolute `/engine/...` and relative `../sets/...`.
- Every shot: moving camera (cam z/x/y over the shot with `ease.inOut`), atmosphere (`FX.dust`, rain, glows), rim light on every lit figure (`rim: A.rim`), figures grounded at `GY` with `breathe(...)`, expression changes on word beats using `wordTime('word', info.shot.start)` (returns global seconds; subtract `info.shot.start` for shot-local t).
- Graphics (chips <= 6 words, titles) pop with the spoken word; remove before the cut. No sentences on screen except titles/end screen. Narrator is never lip-synced (only quoted lines: Mina, Dev, Dr Lin, Tomas may use `talk: talkAmount(info.globalT, from, to)`).
- Don't edit `shots.json` timing. You may add `sfx`/`amb` tweaks only if the coordinator allows.

## Core API cheat sheet
```js
import { E, V, registerShot, mood, layer, blurLayer, veil, ease, prog, key, clamp, lerp, wordTime, alpha, glow, shake } from '/engine/core.js';
import { POSES, posesAt, breathe, walkPose, bigFace, headPos } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';  import * as UI from '/engine/ui2d.js';
import { actor, cat, mouse, snake, deer, fox } from '../sets/actors.js';
```
- **actor(g, 'HERO'|'MINA'|'DEV'|'LIN'|'TOMAS', {x, y, s, facing, pose, expr, talk, blink, look, rim, prop, t})**: drawFigure + scarf + lanyard. Wide shots `s` 0.9-1.2, mediums 1.4-1.7. Mina is child scale automatically. `bigFace(g, cx, cy, r, {outfit: HERO, expr, ...})` for giant faces (import outfits from `../cast.js`; for Mina/Lin the scarf/lanyard are not drawn in bigFace, fine).
- **cat(g, {x, y, s, facing, pose:'sit'|'loaf'|'stand'|'arch', eyes:'open'|'blink'|'offended'|'glint'|'wide', t, rim, collar:null for a kitten})**; Biscuit giant close-up = `cat` at s 4-6 with `pose:'sit'` cropped by the frame.
- **Sets** (call BEFORE characters; each returns `{GY, CX, M, rim, pos}`):
  - `apartment(g,t,cam,{power:0..1})` + `apartmentFg(g,t,cam)` after characters. `pos`: doorX, sofaX, tableX/tableTop, fridgeX/fridgeTop (cat perch), binX, counterX, plateX, lampX, chargerX, shoeX, windowX.
  - `street(g,t,cam,{power, rain})` + `streetFg`. `pos`: carX (kitten under), shopX/shopW/shopTop (window gag), kerbY, binX, lampXs; `roadY` for cyclists/cars. Animate `power: key(t,[[1,1],[3,0]], ease.linear)` for house-by-house blackout.
  - `cinema(g,t,cam,{view:'hall'|'lobby', screen:0..1, door:0..1, content(g,x,y,w,h)})` + `cinemaFg`. `pos.rowFX` (row F sign), screenX/Y/W/H, menuX/Y.
  - `lab(g,t,cam,{lights:0..1, wall(g,x,y,w,h,wt), wallT})` + `labFg`. `pos`: wallX/Y/W/H (blueprint wall panel: draw extra art with the `wall` callback), benchX, tripodX, monitorX.
  - `forest(g,t,cam,{view:'camp'|'cave', torch:0..1, torchX, torchAngle, rain})` + `forestFg`. `pos`: tentX, tent2X (the empty one), fireX, caveX/W/H, ledgeX/ledgeY.
- Figures live inside `layer(g, cam, 1, g => ...)`; for a blurred over-the-shoulder foreground use `blurLayer(g, 12, g => actor(...), cam, 1.6)`.

## THERMAL VIEW (`../sets/thermal.js`): the hero's heat vision
```js
import { thermalView, heatActor, heatCat, heatMouse, heatSnake, heatDeer, heatFox, heatBlob, heatRect, heat, whiteOut } from '../sets/thermal.js';
thermalView(g, t, {
  cold: (c) => apartment(c, t, cam, { power: 0 }),          // the normal lit set; it gets squashed into dark purple
  hot: (c) => layer(c, cam, 1, (c) => {                     // heat sources, greyscale: white = hottest
    heatActor(c, 'HERO', { x: 800, y: GY, s: 1.4, pose: POSES.stand, t });          // o.heat scales body temp (Mina in rain: heat 0.4)
    heatCat(c, { x, y, s: 1.3, pose: 'loaf', t }); heatMouse(c, {...}); heatBlob(c, x, y, rx, ry, 0.7);
    heatRect(c, x, y, w, h, 0.9);                           // hand warmer: heat 1.0 = white-hot spark; cold objects: draw nothing
  }),
  hud: { label: 'THERMAL', temp: '34 C', track: [sx, sy] }, // optional; track = screen position of the crosshair
});
whiteOut(g, k);   // light hits the sensor (Rule 4 and 5 flashes): k 0..1
```
Notes: heat values: skin 0.8-0.9, clothes ~0.4, warm object 0.6-0.8, cooling toast 0.9 -> 0.4, cold objects/glass = nothing (they stay purple-black). `c` is the same logical-unit context, so `layer(c, cam, ...)` works inside. Keep `cold` cheap (set functions are fine). Rain/fog in thermal: draw it in `cold` or on `g` after `thermalView`. World to screen for the HUD track (depth 1): `x' = (X - E.W/2 - cam.x) * cam.z + E.W/2`, same for y with cam.y.

## BLUEPRINT (`../sets/bp.js`): science explainers (+ `UI.blueprint`, `UI.lineFigure`, `UI.dataCard`)
```js
import * as BP from '../sets/bp.js';  import { chip } from '../sets/hud.js';
BP.board(g, t, { title: 'THE HUMAN EYE', fig: 'FIG 1 - RETINA' });          // navy grid + sheet frame (use bars: "none")
BP.eye(g, t, { x, y, r: 230, k, glowK });                                    // k = draw-on 0..1; glowK = eye's own heat (line 19)
BP.retina(g, t, { x, y, w: 760, h: 420, rods: true, cones: false, flood: 0, dim: 0 });   // flood=1: rods flooded (line 36); cones fade with dim (line 8)
BP.wavelength(g, t, { k, peak: 9.5 });  BP.photon(g, t, { from, to, k });
BP.draw(g, pts, k, { w, color });  BP.label(g, t, { at, to, str, start });    // start from wordTime(...) - shot start
chip(g, t, { str: 'About 120 million rods', at: tWord, x, y, tone: 'gold'|'blue'|'coral' });   // <= 6 words
```
Gold = key numbers/labels, light blue = line art. Draw-on diagrams over ~1.5 s, then hold with a slow camera scale (see s012).

## RULE title cards and other helpers (`../sets/hud.js`)
`ruleCard(g, t, info, { n: 2, title: "DARK ISN'T EMPTY", accent, bg: (g,t) => {...a set drawn dim...} })` (see s011; use `bars:"scope"`, `in: dip` is already set). `darkness(g, k, {x,y,r})` pitch-black overlay with an optional clear spot. Also use `UI.titleCard / bigLine / dataCard / endScreen(cast: [HERO, MINA, DEV, LIN, TOMAS])` from the kit for s010 (title), s116, s109, s120.

## QC loop (run from `C:\Users\jiewe\Howitreallyworks\reel-render\longform\aitrends-2d-studio`, in a shell with the kit PATH: Git Bash `export PATH="$PWD/bin:$PWD/.venv/Scripts:$PATH"`; PowerShell `$env:PATH = "$PWD\bin;$PWD\.venv\Scripts;$env:PATH"`)
```
node render.mjs --project projects/see-in-dark --sheet --scale 0.4                 # one still per shot -> projects/see-in-dark/build/sheets/sheet_XX.png (open and LOOK; MISSING = not written yet; red ERROR = fix)
node render.mjs --project projects/see-in-dark --stills 40.5,43,47 --scale 0.6      # exact times (global seconds) -> build/stills
node render.mjs --project projects/see-in-dark --from 142 --to 160 --scale 0.5      # motion preview -> build/preview.mp4
```
Checks per shot: matches its `line`/`scene`; camera moves; rim light; mostly dark with 1-3 bright accents; figures grounded and not cropped; chips <= 6 words and in the safe area; no console `SHOT ERROR`. Parallel writers: use `--stills` for your own times (the full sheet renders all 120 shots and other batches will show MISSING). Keep shots under ~1.5 s of render cost each: avoid stacking many `blurLayer`s; thermal shots are the heaviest (about 3x a normal shot).
