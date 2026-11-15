# Cozy 2D kit: hand-drawn pastel reels ("Mango's 2AM Kitchen")

Original cozy-cute 2D look for no-voice cooking-ASMR reels, 9:16 1080x1920, 24 fps.
Look: wobbly warm-brown outlines with a 3-drawing line boil (8 changes/s), flat warm fills (apricot / cream / sage),
deep-teal night with warm string-light / fridge / lamp glows, fine paper speckle + film grain, soft warm vignette.
All characters, rooms and props are original designs drawn in code; all audio is synthesized (no samples, no voice).

See `DEMO_sheet.png` (every helper group on one sheet; source `demo/scenes/shots/demo.js`).
Reference episode: `cozy/ep01-cheesy-fried-rice/` (repo root).

## Setup (cloud container)
```bash
cd whatif/aitrends-2d-studio
npm install                                    # never `npx playwright install`
export CHROMIUM_PATH=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers
pip install numpy scipy pillow
```
`render.mjs` honours `CHROMIUM_PATH` (the pinned playwright cannot find the preinstalled browser otherwise).

## Make an episode (commands from `whatif/aitrends-2d-studio`)
1. `P=../../cozy/<slug>/project`; copy `cozy/ep01-cheesy-fried-rice/project/{config.json,.gitignore}`.
   config: `style:"cozy"`, `captions:false`, `fadeIn:0`, `fadeOut:0`, `cozyCaption: {lines:[...], x, y, size}` = the pinned top caption.
2. `story/shots.json`: contiguous shots (`id,start,end,line`, optional `in:{type:'whip'|'zoom'|'fade'|'dipWhite', dur}`),
   per-shot `sfx: [{at, name, gain, dur, seed}]`, top-level `beds` (looped sizzle etc.) and `lofi` (music plan). Last `end` = duration.
3. `scenes/shots/*.js`: `import * as K from '/kits/cozy/cozy.js'` then `K.cozyShot('s01', (g, t, info) => {...}, {bg})`.
4. Check: `node render.mjs --project $P --sheet --scale 0.5`, `--stills 0,12.3 --debug` (debug shades the IG UI zones: bottom 20 %, right 15 %).
5. Final: `node render.mjs --project $P --workers 4` then `python3 kits/cozy/tools/cozy_audio.py --project $P`
   (lo-fi + SFX, two-pass loudnorm −14 LUFS, TP −1.5) -> `$P/out/<title>.mp4`.

## Helpers
| file | functions |
|---|---|
| base.js | `PAL` palette, `C` (now, boil fps), `shape/oval/dot/rbox/wline/tube/curve/heart/sparkle` (boiling hand-drawn shapes), `at(g,x,y,s,fn,{flip,rot})` local space with constant line weight, `camera(g,{z,fx,fy,dx,dy,r})`, `push`, `popIn`, `bounce`, `float` |
| light | `night(g, amt, lights[{x,y,r,k,color,glow}])` teal multiply with light holes (current camera space), `warmGlow`, `cone` (fridge/lamp beam), `warmVignette`, `paper` |
| text | `topCaption` (Fredoka 700, white, soft brown outline; drawn automatically from `config.cozyCaption`), `label(g,str,x,y,t,t0)` tiny ingredient pill, `pop(g,x,y,k,'!')`, `zzz`, `hearts`, `sparkles`, `sweat`, `squiggle` (tummy growl), `speedLines` |
| critters.js | `critter(g,'mango'|'pebble'|'biscuit',x,y,s,{pose,face,t,flip,armsBehind})` -> anchors `{head,hL,hR,mouth,top,headR}`; `critterHead(g,kind,face,t)` for close-ups; `sleeper(g,kind,x,y,s,{blanket})`; `tiptoe(phase)`; `poseMix` |
| poses | stand idle wave cheer hold offer sneak eat sip pat reach stir shrug loaf (+ fields armL armR lean bob liftL liftR tilt squash) |
| expressions (`EXPR`) | calm sleepy drowsy hungry happy blush spicy sweat heart sparkle beg chew sneaky focus sip shock content (fields eyes mouth blush lines spicy sweat brows look blink cheeks open) |
| room.js | `loft(g,t,{fridgeOpen,futons,cushion,table,lightsOn})` -> anchors + `lights` for night(); `skyWindow`, `stringLights`, `miniFridge` (stickers, opens, items), `fridgeItems`, `plant`, `hangingPlant`, `wallClock` (2:00), `futon`, `cushion`, `rug`, `lowTable`, `hotPlate`, `panSide`, `riceTub`, `milkCarton`, `soyBottle` |
| food.js | `tableTop`, `panTop`, `panClip`, `friedRice(g,cx,cy,R,{butter,melt,rice,spread,egg,scramble,scallion,ham,soy,cheese,cheeseMelt,sesame,stir},t)` (stir = float, grains glide between tosses), `meltSlice`, `steam`, `sizzle`, `spits`, `ribbon`, `cheesePull`, `pour`, `bowl(contents:'rice'|'empty'|fn)`, `spoon(heap)`, `spatula`, `egg({crack,split})`, `board`, `knife`, `scallionStalk(cut)`, `hamSlice`, `cheeseSlice` |
| tools/cozy_audio.py | synthesized SFX: sizzle growl pop bloop tiptoe fridge click plop butter rice crack eggdrop stir chop pour sprinkle ding chime munch slurp gulp sigh(breath) snore uhoh stretch clink scoop whoosh tap; `lofi()` generated Rhodes/bass/swing-drums/vinyl bed with sections `{start,end,level,drums,melody}` |

## Rules of the look
- Frame 1 already moving with the caption on screen (no fade in). New visual every 2-3.5 s; every ingredient = one beat with its own sound.
- Keep faces, food and labels out of the bottom 20 % and right 15 % (IG UI). Caption block sits at y≈215-310, x centre 500.
- Night = `night(g, ~0.85, lights)`; warm moments lower the amount (0.4-0.6) and add a lamp pool.
- Deterministic only: `rng`, `noise`, `t`, `C.now` — never Math.random / Date.now.
- Original art only. Format inspiration is fine; never copy another creator's characters, rooms, logo, music or captions.
