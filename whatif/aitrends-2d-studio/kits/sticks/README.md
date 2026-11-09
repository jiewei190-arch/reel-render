# Sticks After Dark: stick-figure horror kit

Original short scares (20-35 s), 9:16 1080x1920, 24 fps. Look: white round-headed stick figures with a hand-drawn line boil,
near-black rooms drawn in thin chalk lines, ONE accent colour per story, film grain + dust + vignette + slow light flicker,
a 1-frame jitter on the scare. The scary thing is never fully shown. No gore, no blood, no injury.

See `DEMO_sheet.png` (every helper on one sheet; source: `demo/scenes/shots/demo.js`).
Reference story: `sticksafterdark/mirror-lag/` (repo root): script.md + project/ + POST.md.

## Setup (cloud container)
```bash
cd whatif/aitrends-2d-studio
npm install                                   # never `npx playwright install`
export CHROMIUM_PATH=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers
pip install kokoro-onnx soundfile faster-whisper
# Kokoro model files -> /home/user/reel-render/tts/ (gitignored):
#   https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
#   https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
```
`render.mjs` honours `CHROMIUM_PATH` (the pinned playwright 1.56 cannot find the preinstalled browser otherwise).

## Make a new story (all commands from `whatif/aitrends-2d-studio`)
1. `S=../../sticksafterdark/<slug>`; write `$S/script.md` with a `## NARRATION` block (copy mirror-lag's).
   Plain lines are spoken. `##` = long beat (1.3 s). `## 2.4` = a beat of exactly 2.4 s (put one before the twist line).
   `[MOM] text`, `[WHISPER] text`, `[CHILD] text`, `[MAN] text`, `[PHONE] text`, `[VOICE] text` = character lines.
   The block ends at the next `# ` heading.
2. Copy `$S/../mirror-lag/project/config.json` into `$S/project/` (change the title). Keep `captions:false`
   (the kit draws its own captions), `fadeIn:0` (frame 1 must already be moving), `fadeOut:0` (hard cut), `style:"dusk"` (identity grade).
3. Voice + timings: `python3 kits/sticks/tools/voice.py --script $S/script.md --project $S/project`
   -> input/voiceover.wav, input/script.txt, timeline/words.json (am_fenrir, speed 0.88, pitched ~1 semitone down, close).
   Word times are syllable estimates inside exactly-known sentence chunks (more reliable at sentence edges than Whisper here).
4. `story/shots.json`: contiguous shots, new visual every 1.5-3 s, last `end` = audio duration. Per shot: `id,start,end,line`,
   optional `sfx` / `amb` (audio/mix.py), `params`, `jitter: [global seconds]`, `captions:false` (end card).
   Top-level `"music": [{"start":0,"end":D,"mood":"dark","intensity":0.25}]` gives a soft drone bed (config music.enabled + gainDb ~ -24).
5. `scenes/shots/*.js`: `import * as K from '/kits/sticks/sticks.js'` and `K.stickShot('s01', (g, t, info) => {...})`.
6. Check: `node render.mjs --project $S/project --sheet --scale 0.5` and `--stills 0,12.3,LAST --debug` (debug shows UI safe zones).
7. Final: `node render.mjs --project $S/project --workers 4` then `python3 audio/mix.py --project $S/project`
   (−14 LUFS, TP −1.5). Final file: `$S/project/out/<title>.mp4` -> copy to `$S/video.mp4`, `sha256sum > video.sha256`, `git add -f`.

## Helpers (`sticks.js`)
| group | functions |
|---|---|
| shot | `stickShot(id, draw, {captions, fx, vignette, jitter:[t], bg})` sets `K.now`/`K.frame`, clears bg, jitter, vignette + dust + captions. `camera(g, z, fx, fy, dx, dy)`, `drift(amt)` |
| accent | `setAccent('yellow'|'red'|'blue'|'green'|'orange'|'#hex')`, `K.K.accent`, `INK` palette (bg, chalk, head, feature, dim) |
| lines | `chalk(g, pts, {w, color, a, wob, seed, closed})` boiling hand-drawn line; `line`, `rect`, `ellipse`, `circleLine`, `blob`, `fillPoly` |
| figure | `stickFigure(g, pose, face, {x, y(floor), s, flip, back, a, anchor:'hip'})` returns joints (`r.hR` = right hand, `r.head`). Poses: stand idle slump brush rubEyes lean leanIn scared freeze reach point handsUp hug phone sit crouch peek + `walk(phase)`; `posesMix(a,b,k)`, `poseAt(t, [[t,'pose'],...])` |
| face | `face(g,cx,cy,r,{eyes:'dot'|'wide'|'pin'|'closed'|'half'|'glow'|'none', look:[x,y], blink:0..1, brows:'worried'|'angry'|'flat'|'raised', mouth:'flat'|'smile'|'grin'|'frown'|'o'|'wide'|'tooWide'| {w,c,o}})`. Mouth width `w` > 2 runs OFF the head (drawn in chalk). `stickHead(g,x,y,r,face,{neck,tilt})` for close-ups |
| rooms | `bathroom(g,t,{mirror,drip})`, `bedroom(g,t,{doorOpen,moon})`, `hallway(g,t,{endOpen,endLit})`, `kitchen`, `livingRoom(g,t,{tv})`, `stairs`, `outside(g,t,{litWindow,doorOpen})`, `roomBox({back})`. Each returns anchors (mirror, door, fridge, couchY, floorY ...) |
| props | `bulb(g,x,y,{len,swing,on})` returns bulb centre, `mirror(g,rect,insideFn)`, `door`, `windowFrame`, `phone`, `bed`, `tv`, `stairsUp` |
| dark FX | `flicker({seed,depth,dips,dies})` 0..1, `darkness(g, amt, [{x,y,r,k}])`, `lightPool(g,x,y,r,color,k)`, `beam`, `vignette`, `specks`, `grain`, `jitterAt(times)`, `onFrames(at,n)`, `lag(t,delay)` |
| the thing | `tallFigure(g,x,y,h,{rim,eyes,lean})` too-tall silhouette, `eyesInDark(g,x,y,{gap,size,blink,k})`, `handOnFrame(g,x,y,{side,curl,len})`, `peek(g,x,y,{side,amount})`. Use `lag()` for the "frame-late" shape |
| captions | automatic 1-3 word groups from timeline/words.json; `E.cfg.stickCaptions` in config.json overrides `{x,y,size,max,punch:['didn\'t']}`; punch words get their own caption. Or `story/captions.json` `[{start,end,text}]`. Default x 470, y 1250 (clear of bottom 20% and right 15%) |
| end | `endCard(g, t, {str:'Follow for more.'})` white on black; give that shot `captions:false, fx:false` |

## Rules of the look
- Frame 1 already unsettling and moving (no fade in). New visual every 1.5-3 s. A held, silent frame before the twist line.
- Twist: 1-frame jitter (`jitter:[t]` in the shot) + one sting (`stinger`) in shots.json `sfx`. Then hard cut to the end card.
- Keep faces/action out of the bottom 20% and right 15% where it matters; captions sit at y≈1250.
- Deterministic only: use `K.rng`, `K.noise`, `t` — never Math.random / Date.now.
- SFX available (audio/sfx.py): roomtone, hum, wind, rain, thunder, heartbeat, footstep, stinger, impact, hit, glitch, flash, buzz, tick, clock, phonebuzz, phonering, whoosh, riser ...
