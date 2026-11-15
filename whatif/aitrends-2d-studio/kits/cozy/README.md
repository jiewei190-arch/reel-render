# Cozy 2D kit: the owner's bear (cream bear cub, blue nightcap)

No-voice cooking-ASMR reels, 9:16 1080x1920, 24 fps, in the owner's own look: thick warm-brown outline, soft watercolour
cream fill, dusky violet night + warm amber lamp, fine grain. The hero and the three rooms are the OWNER'S art
(`cozy/owner_character/` on the MAIN branch), cut into layers by `tools/prep_owner.py` and animated in code.
Everything else (food, props, FX, audio) is drawn / synthesized here. No name on screen yet (placeholder "the bear").

See `DEMO_sheet.png` (every helper group) and `MOTION_TEST.mp4` (idle breathing + blinks, waddle walk, stirring, eating with spoon + cheese pull).

## Setup (cloud container)
```bash
cd whatif/aitrends-2d-studio
npm install                                    # never `npx playwright install`
export CHROMIUM_PATH=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers
pip install numpy scipy pillow
# only if the owner's art changes: re-cut the layers
python3 kits/cozy/tools/prep_owner.py --src <dir with main_pose.png, turnaround.png, backgrounds_bedroom_kitchen_table.png> --out kits/cozy/owner
```

## Make an episode (commands from `whatif/aitrends-2d-studio`)
1. `P=../../cozy/<slug>/project`: `config.json` with `style:"cozy"`, `captions:false`, `fadeIn:0`, `fadeOut:0`,
   `cozyCaption:{lines:["When the 2AM","hunger hits..."]}` (pinned top caption, drawn by `cozyShot`).
2. `story/shots.json`: contiguous shots (`id,start,end,line`, optional `in:{type,dur}`), per-shot `sfx:[{at,name,gain,dur,seed}]`,
   top-level `beds` (looped sizzle) and `lofi` (music plan: bpm, sections `{start,end,level,drums,melody}`, gainDb).
3. `scenes/shots/*.js`: `import * as K from '/kits/cozy/cozy.js'`; `K.cozyShot('s01', (g, t, info) => {...}, {bg})`.
4. Check: `node render.mjs --project $P --sheet --scale 0.5`, `--stills 0,12.3 --debug` (debug shades IG UI zones: bottom 20 %, right 15 %).
5. Final: `node render.mjs --project $P --workers 4` then `python3 kits/cozy/tools/cozy_audio.py --project $P`
   (lo-fi + ASMR, two-pass loudnorm −14 LUFS, TP −1.5) -> `$P/out/<title>.mp4`.

## The bear (`bear.js`)
`bear(g, x, y, s, o)` — x,y = floor under the feet, s = 1 ≈ 450 units tall. Returns anchors `{head, mouth, pawL, pawR, top, hatTip}`.
| option | meaning |
|---|---|
| `view` | `'front'` (layered rig: body / head / nightcap + code face & arms), `'q'` (3/4), `'side'` (profile, faces left; `flip:-1` faces right), `'back'` |
| `face` | `FACES`: smile happy grumpy o alarm bliss chew yawn sleep drowsy sip love sweat focus — or `{eyes, mouth, blush, cheeks, sweat, open}` |
| `arms` | `ARMS`: rest up chest hold spoon sip stir wave pat reach doze — or `{L:[angle,len], R:[angle,len]}` (angle from straight down toward the outside; negative = across the body) |
| motion | `breathe` (auto chest/head bob), `blink` (auto every ~3 s, or a number), `look:[x,y]`, `tilt`, `bob`, `squash` (squash & stretch from the floor), `headSquash` (chew), `walk: phase` (side view waddle with stepping feet) |
| `hat` | `{tilt, slide (0..1 slides the nightcap down over the eyes), sway (pom-pom swing, default 1), off}` |
Rooms: `bgImage(g, 'bedroom'|'kitchen'|'table'|'table_empty', {lamp})` (lamp < 1 = lamp clicked off), `bgOver(g, name, poly)` re-draws part of the
room on top (bear under the quilt: `ROOM.bedroom.quilt`; behind the table: `ROOM.table.front`), `ROOM` anchors (pillow, burner, bowl, fridge...),
`kitchenFridge(g, open)` = the sage under-counter unit as the fridge, lit, with leftovers.

## Other helpers
| file | functions |
|---|---|
| base.js | `PAL` (owner palette: line, violet, amber, lilac, potSage, hatBlue ...), `shape/oval/dot/rbox/wline/tube/curve/heart/sparkle`, `at`, `camera`, `push`, `popIn`, `float`, `night(g, amt, lights)` (violet night multiply with light holes), `warmGlow`, `cone`, `topCaption`, `label` (ingredient pill), `pop` ("!"), `zzz`, `hearts`, `sparkles`, `sweat`, `squiggle`, `cozyShot` |
| food.js | `tableTop`, `panTop` (sage pan, top-down), `panClip`, `friedRice(g,cx,cy,R,{butter,melt,rice,spread,egg,scramble,scallion,ham,soy,cheese,cheeseMelt,sesame,stir},t)`, `meltSlice`, `steam`, `sizzle`, `spits`, `cheesePull`, `pour`, `bowl` (lilac), `spoon`, `spatula`, `stirTool`, `egg`, `board`, `knife`, `scallionStalk`, `hamSlice`, `cheeseSlice` |
| room.js | extra props: `panSide` (sage, 3/4), `hotPlate`, `lowTable`, `miniFridge`, `milkCarton`, `soyBottle`, `riceTub`, `plant`, `stringLights`, `skyWindow` |
| tools/cozy_audio.py | synthesized SFX: sizzle growl pop bloop tiptoe fridge click plop butter rice crack eggdrop stir chop pour sprinkle ding chime munch slurp gulp sigh snore uhoh stretch clink scoop whoosh tap; generated lo-fi bed |

## Rules of the look
- Owner's art only for the hero and rooms; new poses are drawn in the same style. Never copy another creator's characters/rooms/music/captions.
- Frame 1 already moving with the caption on screen. New visual every 2-3.5 s; every ingredient = one beat with its own sound.
- Keep the face, food and labels out of the bottom 20 % and right 15 %. Caption block at y≈215-310.
- Deterministic only (`rng`, `noise`, `t`), never Math.random / Date.now.
