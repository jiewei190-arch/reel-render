# HANDOFF: "What If You Trained Every Day for 3 Years?" (ep 3)

Script, sources: `whatif/what-if-train/` (script.md, sources.md). Same kit, same `QUALITY_BAR.md` (copied here). Reference level: `projects/see-in-dark/scenes/shots/S_showcase.js` and the ep 2 shots in `projects/jump-double/scenes/shots/`.

## Status
- **Voice:** landed. Fenrir (locked), `input/voiceover.wav`, 409.555 s, 989 words. transcribe.py 97% script match + beats.py; `timeline/words.json` is the word clock.
- **Copied from ep 2 (shared, read-only for workers):** sets/*.js (acting, actors, apartment, street, court, roofs, devices, bp, hud, faces, creatures, ...), QUALITY_BAR.md.
- **Cast (cast.js, lead-owned):** HERO = BIG DARK CURLS (head 'curly', never bald), GREEN hoodie #3f9a4a, WHITE sweatband with a green stripe (drawn in actors.js), grey trousers. MINA red scarf, DEV orange beanie, BISCUIT purple collar: unchanged. The anime nod is ONLY the routine, the hair joke and the pillow punch: no yellow jumpsuit, no cape, no red gloves, no bald hero, no names or catchphrases, ever.
- `scenes/shots/DEMO_cast.js` temporarily binds s001 for a cast check; the lead deletes it when batch A lands.
- `story/shots.json`: being written by the lead (stub right now). Batches and ids will be added below as Stage B.

## Stage A (now): build the new sets
Each worker writes ONLY its own files, follows the ep 1/2 set API (`name(g, t, cam, opts)` returns `{GY, CX, M, rim, pos}`, plus `nameFg(...)`; parallax layers, practical lights, >= 8 props, atmosphere; moods 'dawn'|'day'|'dusk'|'night' where it makes sense) and ships a demo in `scenes/shots/DEMO_<set>.js` with temporary ids `demo_<x>`. To sheet-check a demo, temporarily bind it to a real stub id (e.g. s050) in your local copy only, or add a throwaway time-bound; do not commit stub-id bindings.

| Worker | Files | What |
|---|---|---|
| H1 | sets/train.js | The EXERCISE RIG on top of acting.js/rig2d POSES: `pushUp(t, rate, o)`, `kneePushUp`, `sitUp`, `squat` (deep, slow lowering), `runCycle(t, speed, o)` (jog/walk/limp variants, sweat), each returning a pose for `actor()`; fatigue options (`tremble`, `sag`, `collapse`), sweat drops + breath puffs, `repCounter(g, n, o)` (big gold number that ticks), `stopwatch(g, sec, o)` (e.g. 1:20:00), `backpack(g, ...)` stuffed with textbooks for the hero's back, Biscuit-on-the-back helper (cat sitting on a push-up), `pillow(g, ...)` + `punchPose(t, t0)` (wind-up, punch, follow-through; the pillow squashes "flump" and wobbles) |
| H2 | sets/park.js | The 10 km RUNNING ROUTE: riverside park path with km markers 1-10, bridge, bench, water fountain, lamp posts, trees; SEASONS option 'spring'|'summer'|'autumn'|'winter' (+ rain, snow, puddles, falling leaves) so the time-skips read across 3 years; moods dawn/day/dusk; a finish line made of a toilet-paper ribbon held between two posts; Mina on a small bike; distance sign "10 km (6.2 mi)" |
| H3 | sets/body.js | Science BLUEPRINTS in the bp.js style (cream line on navy, FIG labels): muscle fibres with micro-tears then repair (DOMS, "repeated bout effect"); abs under a fat layer (sit-ups train muscle, not the fat above it); "SAID" panel (light load/many reps vs heavy load builds different things; arrow "add difficulty"); shin bone (tibia) with shin-splint glow and a hairline stress fracture; hair follicle growth cycle (growing/resting/shedding) + a "50-100 hairs a day" counter + a DHT molecule + twin silhouettes; heart pumping with more blood per beat + a BPM monitor (60-100 normal band, ~40 marker for trained athletes) |
| H4 | sets/home3.js | Home sets: BATHROOM (mirror, tiles, shower with a drain + a hair clump, towel); KITCHEN (cereal box hidden on top of the fridge, plate with a "700 kcal" label, table); HERO BEDROOM training corner (wall calendar with X marks, posters, mat, alarm clock at dawn); props: Mina's "HAIR LOG" notebook + tape measure, the TIME-SKIP CARD (`timeSkip(g, t, label)` e.g. "WEEK 1", "MONTH 3", "YEAR 2", "DAY 1,095", flips like a calendar page with a tick hook), Dev's phone filming UI (REC dot, timer) |

Sheet-check every set with `node render.mjs --project projects/train-3yr --stills ... --scale 0.5` against QUALITY_BAR. Push to your own branch; write a short status line to `handoff/outbox/H<n>.md` on your branch when done. The lead integrates into `whatif/see-in-dark`.
