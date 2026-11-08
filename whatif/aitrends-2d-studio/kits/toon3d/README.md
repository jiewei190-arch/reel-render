# toon3d: the "Toon 3D" style kit (I.Awaken)

Stylised 3D "bean" people in small furnished 3D rooms: big round head on a pill body, thin stick limbs, ball hands and
feet, soft matte toon shading, dark outline, faces that act with heavy lids and thick brows. Warm soft light with real
shadows. 1-3 word white captions with a dark outline in the lower middle.

![style sheet](style_sheet.png)

Matches the reference *look* only (IAWAKEN_PLAYBOOK.md, "NEW ANIMATION STYLE"). All characters, names and sets here are original.

Runs inside the aiTrends 2D Studio engine as `kind: '3d'` shots (Three.js 0.169, shadows). Proof of use:
`projects/rome-sacked-short/` (9:16 Short, 15 shots).

## Files
| File | What |
|---|---|
| `toon.js` | `toonStage`, `toon()` material, `outline()` (inverted hull, constant on-screen width), primitives (`rbox`, `cyl`, `ball`, `lathe`, `floor`, `blob`), `LIGHT` presets, `camMove`, `drift` |
| `rig.js` | `bean(opts)` character factory, `POSE`, `EXPR`, `walk`, `run`, `point`, `shrug`, `idle`, `nod`, `shake`, `tremble`, `mixPose`, `addPose`, `mixExpr`, `CAST` presets |
| `cast.js` | the I.Awaken main cast as beans: `castMember(id, opts)`, `CAST3D`, `cat()` (BISCUIT), `phone()`, `stopwatch()` |
| `props.js` | furniture + Roman props (`column`, `templeFront`, `facade`, `gate`, `tower`, `table`, `couch`, `throne`, `shelf`, `amphora`, `sack`, `shield`, `spear`, `torch`, `banner`, `stall`, `cart`, `chicken`, ...), textures `TEX.*` |
| `sets.js` | `SETS.romanStreet`, `SETS.romanHouse` (with `palace: true` for a throne room), `SETS.cityGate`, `applyLight` |
| `fx.js` | toon `fire`, puffy `smoke`, `embers`, additive `glow`, `skyGlow` (no gore: danger reads as fire, smoke, silhouettes) |
| `captions.js` | `useToonCaptions(opts)`, `drawToonCaption`, `chunkWords` (1-3 word chunks timed from `timeline/words.json`) |
| `sheet/` + `tools/make_sheet.py` | the style-sheet project and the script that composes `style_sheet.png` and `avatar_hero_800.png` |

Engine hooks this kit relies on (added with the kit, backward compatible): `engine/player.js` uses `E.captionFn` when a kit
sets it; `engine/styles.js` has a `toon` style (no grain, light vignette); `render.mjs` honours `CHROMIUM_PATH`.

## Quick start (one shot)
```js
// projects/<slug>/scenes/shots/03_guard.js
import { registerShot, ease, prog } from '/engine/core.js';
import { toonStage, camMove } from '/kits/toon3d/toon.js';
import { bean, CAST, POSE, EXPR, addPose, idle, mixExpr } from '/kits/toon3d/rig.js';
import { SETS } from '/kits/toon3d/sets.js';

registerShot('s03', { kind: '3d',
  init(T) {                                    // T = engine three-kit (renderer); build once per shot
    const st = toonStage(T, { light: 'night', fov: 40, target: [0, 0, 1] });
    const set = SETS.cityGate(st, { night: true, fireBeyond: true });
    const guard = bean(CAST.guard); guard.position.set(-2.4, 0, 1.6); st.add(guard);
    return { stage: st, set, guard };           // the player calls (st.stage || st).render()
  },
  draw(s, t, info) {                            // t = seconds into the shot
    s.set.update(t);                            // animates fire/smoke
    s.guard.pose(addPose(POSE.lean, idle(t)));
    s.guard.face(mixExpr(EXPR.bored, EXPR.asleep, ease.inOut(prog(t, 0.5, 1.5))), t);   // pass t for blinks
    camMove(s.stage, t, [[0, { pos: [-1.5, 2.4, 6.5], look: [-2.3, 2.0, 1.6], fov: 28 }], [info.dur, { pos: [-1.6, 2.35, 5.8], look: [-2.3, 2.0, 1.6], fov: 27 }]]);
  },
  overlay(g, t, info, s) { /* optional 2D drawing on top, logical units */ },
});
```
Captions: `scenes/kit.js` = `import { useToonCaptions } from '/kits/toon3d/captions.js'; useToonCaptions();` plus
`"captions": true, "style": "toon"` in config.json. Optional `"captionStyle": { "y": 0.70, "gold": ["410", "pepper"] }`.

## Units and axes
1 unit ~ 0.75 m. A bean stands ~2.55 units tall (head top), head centre ~2.1, eyes ~2.15, hands ~1.2. Doors ~2.3-4.6,
columns ~5-6. Characters face **+Z**; their LEFT is **+X**. Sets are built so the default camera sits at +Z looking toward -Z.
`rotation.y = Math.PI` turns a character away from camera; `Math.PI / 2` faces +X (screen right).

## `toonStage(T, opts)`
`{ light: 'warm'|'day'|'dusk'|'night'|'fire', fov: 30, bg: colour | [top, ..., bottom], fog: [near, far, colour], target: [x,y,z], shadowSize: 9, shadowMap: 2048, samples: 4, shadow: true, key: [colour, intensity, [dx,dy,dz]], fill: [...], ambient, exposure }`
Returns `{ scene, camera, key, fill, hemi, add(...objs), cam(pos, look, fov), render(), exposure }`. `target` centres the
shadow camera (keep it near the action; `shadowSize` is the half-width of the shadowed area). `applyLight(st, 'fire')`
swaps the mood in place. Neutral tone mapping, MSAA x4, PCF soft shadows. `camMove(st, t, keys, ease)` keyframes
`{pos, look, fov}`; `drift(t, amp, seed)` adds a hand-held wobble.

## Materials and outline
- `toon(colour, { map, emissive, ... })`: shared `MeshToonMaterial` with a soft 6-step ramp (lifted shadows, never black).
- `outline(object, { px: 3, color: INK })`: adds a back-face hull to every mesh under `object`. Width is constant on screen
  (px of the 1080-wide frame), capped at 0.035 units. Skip a mesh with `mesh.userData.noOutline = true`; per-mesh width
  with `mesh.userData.outlinePx`. Call it **after** the object is built. Characters use 3.2 px, props 2.6, big architecture 2.2.
- Hard-edged boxes split their hull at the corners: use `rbox()` (rounded) for props that should be outlined; flat walls and
  floors use `plane`/`floor`/`box` without outline, like the reference.
- `blob(r, opacity)`: soft contact shadow under feet and furniture (fake AO).

## Characters: `bean(opts)`
```
bean({ name, outfit: 'tunic'|'toga'|'armour'|'uniform'|'striped'|'rags'|'robe',
       colors: { main, trim, stripe, belt, metal, sash, legsTop, sleeveColor, gloves },
       skin: 'light'|'fair'|'olive'|'tan'|'brown'|'dark'|'#hex',
       hair: 'bald'|'bowl'|'curly'|'swoop'|'spiky'|'bun'|'horseshoe'|'long', hairColor, browColor, beard: bool, beardColor,
       head: 'none'|'helmet'|'laurel'|'cap'|'cone'|'hood', headColor, crestColor, helmetTrim,
       scale: 1, seed (blink timing + hair variation), silhouette: bool, silhouetteColor, outlinePx, shadowBlob: true,
       noPads, noDrape })
```
Outfits: `tunic` (belt, V neck, optional `stripe` = clavi), `toga` (sash with coloured trim + shoulder drape), `armour`
(lorica bands + pteruges skirt + shoulder pads), `uniform` (buttons, pockets, belt), `striped` (prisoner shirt + dark trousers),
`rags` (patched), `robe` (imperial, gold band). Legs are bare skin for Roman outfits. `silhouette: true` paints everything
near-black except the eyes: use it for enemies/crowds in fire scenes (no faces of violence).

Presets in `CAST`: `guard` (Gaius), `senator` (Pomponius), `emperor`, `goth`, `citizen`, `prisoner`. Spread and override:
`bean({ ...CAST.citizen, colors: { main: '#3f6fa8' }, seed: 33 })`.

Returned object is a `THREE.Group` with:
- `.pose(p)`: joints. `p` merges over `POSE_DEFAULT`:
  `armL/armR: [fwd, out, twist]`, `elbowL/elbowR` (bend), `legL/legR: [fwd, out]`, `kneeL/kneeR`, `lean` (+ forward),
  `side` (+ tilt to its left), `twist` (upper body), `bob` (y), `shrugY`, `headTurn` (+ its left), `headTilt`, `headNod` (+ down). Radians.
- `.face(expr, t?, { blink: true })`: see EXPR below. Passing `t` enables auto-blinks (deterministic per `seed`) and `talk`.
- `.hand.L / .hand.R`: groups at the hands; `.hold('R', obj)` parents a prop to a hand. For long props (spears) it is often
  easier to read `hand.R.getWorldPosition(v)` each frame and place the prop in world space (see `_lib.js holdSpear`).
- `.parts`: `{ rig, upper, body, head, eyes, brows, mouth, legs, arms, hairG }` for custom tweaks.

### Poses and motion helpers
`POSE.stand | relaxed | attention | handsHips | armsUp | panic | facepalm | thinking | sit | holdFront | spearRest | lean | sleepy`
- `mixPose(a, b, k)`, `addPose(base, delta)` (adds numbers, for layering).
- `idle(t, seed, amp)` breathing + sway (a delta: `addPose(POSE.stand, idle(t))`).
- `walk(t, { speed: 1.6 cycles/s, amp, base })` full pose; move the root yourself at `speed * WALK_STRIDE` units/s.
- `run(t)`, `point(base, 'R'|'L', k, { up, across })`, `shrug(base, k)`, `nod(t)`, `shake(t)`, `tremble(t, amp)` (deltas).
- Sitting: `POSE.sit` and lift the root to the seat (`root.position.y` ~ seatTop - 0.8).

### Expressions (`EXPR`)
Fields (all mixable): `lid` 0 wide .. 1 shut, `lidAngle` (+ angry inner corners down, - sad), `lower` (lower lid up, smile
squint), `brow` -1..1, `browAngle` (+ angry, - worried), `browL`/`browR` (one raised), `lidL`/`lidR`, `pupil: [x, y]`
(-1..1, x + = its left = screen right when facing camera), `pupilSize`, `mouth` (`line smile frown smirk o open grin wavy teeth scream`),
`mouthW`, `talk` 0..1 (needs `t`).
Presets: `neutral bored smug shocked panic angry sad happy grin worried suspicious asleep deadpan`.
`mixExpr(a, b, k)` blends; shapes switch at k = 0.5. Comedy timing: hold a deadpan (`lid ~0.5`), snap to `shocked` on the word,
then ease into a stare at the lens (`pupil: [0, 0]`).

## The I.Awaken cast (`cast.js`, playbook "CAST REDESIGN")
| id | Signature (kept) | Look |
|---|---|---|
| `hero` | mustard hoodie, `hood: 'up'` (default) or `'down'` | round head, messy brown hair, olive skin |
| `dev` | orange beanie, phone in right hand (`.prop`) | wide head, dark skin, teal tee |
| `mina` | red scarf, stopwatch in right hand (`.prop.tick(t)`) | scale 0.78 with a bigger head, pigtails, olive skin |
| `lin` | lab coat, green lanyard + badge, glasses | tall egg head, black bob, light skin |
| `tomas` | blue cap | squarish wide head, tan skin, grey tee |
| `cat()` BISCUIT | purple collar, green slit eyes, heavy lids | ginger toon cat; `.update(t, { lid, look:[x,y], tail, earsBack, headTurn, headTilt })` |
| `heroRoman` / `heroLegionary` | mustard tunic / armour over mustard with a mustard crest | the HERO in history episodes |

`castMember('dev', { prop: false, colors: { main: '#c0392b' } })` takes any `bean()` override. Rig options added for the
cast and usable by anyone: outfits `hoodie`, `labcoat` (`colors.lanyard`), `tee` (`colors.print`); headgear `beanie`, `ballcap`,
`hoodDown: true`; `scarf: '#hex'`, `glasses: true`; hair `bob`, `pigtails` (`tieColor`), `messy`; `headScale: [x, y, z]`.
Channel avatar: `avatar_hero_800.png` (HERO face, centred, 800x800, from the `avatar` shot of `sheet/`).

## Sets
Each `SETS.x(stage, opts)` adds itself to the stage and returns `{ group, spots, cams, update(t), fx }` (+ extras).
- `romanStreet(st, { fire, smoke, seed })`: cobbled street running into -Z, portico of columns left, shop fronts + market stall right,
  temple at the end. Spots: `center left right stall far portico`. Fire adds flames, sky glow, smoke columns, embers.
- `romanHouse(st, { palace, papers, mess, window: '#bfe0ff', seed })`: fresco walls, mosaic floor, couch, table + fruit + lamp,
  scroll shelf, bust, amphorae, back doorway, barred window with light shaft. `palace: true` = throne, purple curtains, SPQR banners.
  `mess: true` = papers and scrolls on the floor + a toppled amphora (aftermath). `window: '#ff8a3a'` for a city burning outside.
  Spots: `center left right couch throne door table`.
- `cityGate(st, { night, fireBeyond, torches, open })`: crenellated wall with an arched gate, two towers, wall torches (with fire
  light), barrel/crates/shield/stool. Extras: `setDoors(k)` (0 closed .. 1 wide open, the doors swing toward camera),
  `doors`, `beyond` (everything outside the wall; hide it while the doors are closed). Spots: `guard gate left right beyond`.
Every set's `cams` gives `wide / medium / close|low` starting points for 16:9; in 9:16 pull the camera back ~20 % or raise fov.

## Props (`props.js`)
All return outlined groups with `.at(x, y, z, rotY)` and `.s(scale)`. Architecture: `column(h, {r, color})`, `templeFront`,
`facade({ w, h, d, color, trim, shop, windows })`, `gate`, `tower`. Furniture: `table`, `stool`, `couch`, `throne`, `shelf`,
`rug`, `curtain`. Small: `amphora`, `vase`, `bowlFruit`, `lamp`, `lampStand` (`.flameAt`), `scroll`, `papers`, `sack({ label })`,
`crate`, `barrel`, `spear`, `shield` (scutum), `torch` (`.flameAt`), `banner({ txt })`, `plant`, `cart`, `stall`, `bust`,
`chicken()` (`.update(t, { peck, flap, look, panic })`). Textures: `TEX.stone cobble mosaic plaster fresco planks roof label`.

## FX (`fx.js`)
`fire({ size, tongues, seed, light, lightRange, spread })`, `smoke({ count, size, rise, life, spread, drift, color, seed })`,
`embers({ count, area })`, `glow(size, colour, opacity)`, `skyGlow({ w, h, color, opacity })`. Call `.update(t)` every frame.
Point lights are expensive in software GL; keep 1-3 per shot (`light: 0` on decorative fires).

## Captions (`captions.js`)
`useToonCaptions({ y: 0.70, size, max: 3, maxChars: 16, gold: [...], upper: false, hide: [[t0, t1]] })`. Chunks break after
punctuation, before pauses > 0.28 s, at 3 words or 16 characters; each chunk pops in (outBack) and stays until the next one.
White Fredoka 700, ~0.2 em dark outline, soft drop shadow, centred at 70 % of the frame height.

## Rendering
- Style sheet: `node render.mjs --project kits/toon3d/sheet --stills 0.5,1.5,2.5,3.5,4.5 && python3 kits/toon3d/tools/make_sheet.py`
- Linux cloud (no GPU): `export CHROMIUM_PATH=/opt/pw-browsers/chromium` (never `playwright install`); SwiftShader is the default GL there.
  Measured: 540x960 preview, 4 workers on 4 vCPUs = **3.4 fps** (38.75 s Short in ~5.8 min). Full 1080x1920 is ~4x the pixels, so
  plan on ~0.9 fps (~22 min) in the cloud; on the owner's GPU use `--gl gpu` (the default `auto` on Windows also uses the GPU).
- Per-shot cost: init builds the set once per shot per worker (~0.3-0.8 s); keep sets in one shot file reusable via a helper (see
  `projects/rome-sacked-short/scenes/_lib.js`).

## Rules of the style
Medium shots of 1-3 characters at eye level, slow push-ins, quick cuts on punchlines, an occasional low angle. A beat of
stillness before the punchline and a reaction face after it. Warm, clean, never gritty. No gore: fire, smoke, silhouettes
and sound only.
