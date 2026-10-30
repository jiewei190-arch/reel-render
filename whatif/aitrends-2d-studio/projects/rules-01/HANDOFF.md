# HANDOFF: THE RULES #1 "The Babysitting Job" (horror short, 9:16 vertical, 65.6 s, Instagram Reels)

Script: `horror/rules-01/script.md` (read the header notes). Voice landed: `input/voiceover.wav` 65.64 s (Fenrir narrator + a whispered,
pitched-up, static-y BABY MONITOR voice on lines 9 and 12). Word clock: `timeline/words.json` (89% match; the monitor lines are filtered, so use
sentences.json / your ears for those two). Kit: same as What If; `QUALITY_BAR.md` applies, plus the HORROR BAR below. Canvas is 1080x1920
(`E.vertical` true, use `V(landscape, vertical)`); keep faces/text out of the bottom 480 px and right 180 px (Instagram UI).

## HORROR BAR (on top of QUALITY_BAR)
- Dark, cold palette: blue moonlight + ONE warm practical (lamp / hallway bulb / phone light). Deep blacks, film grain, vignette, slow drift.
- Fear comes from what you DON'T see: the thing upstairs is never shown clearly (a shape at the top of the stairs, a door that is open
  wider than before, a small hand on the banister in the last shot). No gore, no jump-scare face.
- Slow camera pushes; hold on stillness; cuts land on sound (knocks, static, light click). Every shot has one unsettling detail.
- The note is the hero prop: handwritten rules, revealed one rule at a time; Rule 4 is on the BACK of the note (flip reveal).
- The baby monitor: small white unit with a row of sound-level LEDs that light up green -> red when the voice comes through, plus static.
- Ending: line 12 lands, hold 0.6 s, hard cut to black, small white text "Follow for Rule 5." (end card in the last ~1.2 s).

## Cast (cast.js)
- HERO ("you"): teen babysitter, GREY hoodie, dark ponytail. Never lip-synced (narrator). Use acting.js poses; scared expressions.
- Biscuit can cameo (the Hales' cat) staring at the stairs.

## Stage A (now): new sets
| Worker | Files | What |
|---|---|---|
| H1 | sets/house.js + DEMO_house.js | The HALE HOUSE at night, built for vertical framing: `house(g,t,cam,{room:'kitchen'|'basement'|'hallway'|'stairs'|'upstairs', lights:{hall:0..1, lamp:0..1}, flicker})`. Kitchen (fridge with the note under a magnet, clock 11:10/11:40, window with moonlight), the BASEMENT DOOR (old wood, gap of darkness underneath, a slide bolt, can rattle with `knock` 0..1), the HALLWAY (ceiling bulb + wall switch, can go fully dark), the STAIRS from the bottom looking up (banister, a dark landing, a door at the top ajar `doorAjar` 0..1, `shape` 0..1 = a barely-visible silhouette at the top, `hand` 0..1 = small pale hand on the banister). Exterior wide: the house on a quiet street, one window lit. |
| H2 | sets/horror.js + DEMO_horror.js | Horror props + FX: `note(g, x, y, s, {rules:n, flip:0..1, back:bool})` (handwritten paper, rules appear one by one, flips to show "4. There are no kids in this house." on the back), `babyMonitor(g, x, y, s, {level:0..1, static:0..1})`, `hfx` helpers: grain, vignette, cold grade, light flicker, flashlight cone, dust motes, a slow "breathing" darkness, a static/interference overlay, the hard-cut-to-black end card `endCard(g, t, 'Follow for Rule 5.')`, and a creepy RULE title card `ruleTitle(g, t, n, text)` in a handwritten/ink style (not the gold What If card). |

Push to your own branch, write a status line to handoff/outbox/H<n>.md. The lead integrates into whatif/see-in-dark. Shot batches come next.

## Stage B (now): write the shots, batches A-C
`story/shots.json` v1: **27 shots, 0 -> 65.644 s**, contiguous, every cut 0.15 s before a spoken word except the four cuts that land on a
sound (s016 knock 1, s020 light click back on, s022 static key-up, s027 hard cut to black). `line` = the exact spoken words (all 117 words
covered once). Each shot has a concrete `scene` (set + options, cast, camera, lighting, the one unsettling detail, word beats as seconds
from shot start), `type`, `sfx` cues (seconds from shot start) and `amb` (roomtone; wind on the exterior). Story-level `music` plan: one
`dark` drone the whole way: 0.25 -> 0.4 from line 6 (31.59) -> 0.55 in the hallway blackout (41.28) -> near-silence 0.04 for the monitor
crackle + whisper (46.94-52.26) -> 0.6 on the stairs and the flip (52.26) -> 0.04 under "I can see you on the stairs" (60.75) -> 0.02 on
black; the low hit on the cut to black is an SFX (s027 `impact` + `hit` pitch 0.5).

**Timing (read this):** words.json drifts on a few lines, so shots.json uses times measured from the voice envelope (also stored in
`wordTimesCorrected` in shots.json): "Mrs." 0.44; "Rule three." 25.32-26.16 (not 24.15); [MONITOR] "Can you come tuck me in?" 49.26-51.47;
"You're halfway ... over." 52.41-55.23; "Rule four." 56.98-57.74; "There are no kids in this house." 58.61-60.12; [MONITOR] "I can see you
on the stairs." 60.90-63.55 (words.json crushes it into 59.99-60.04). For these lines use the times written in the scene texts, not
`wordTime()`. Voice ends 63.55, hold 0.6 s, black at 64.15, end card text from ~64.44.

| Batch | Ids | Time | Content | Main sets |
|---|---|---|---|---|
| A | s001-s010 | 0.00-25.17 (25.2 s) | Exterior (car leaves, one window lit), $50 in the kitchen, the fridge note, "Four rules", Rule 1 ink-on, the basement door push, "Whatever you hear" face, Rule 2 ink-on, the hallway switch, "Just wait" hold | house (exterior, kitchen, basement, hallway), horror (note rules 0-2, hfx) |
| B | s011-s020 | 25.17-46.94 (21.8 s) | Rule 3 ink-on, monitor switched on (LED twitch), "All night" + Biscuit staring off toward the stairs, clock 11:10, "Something knocks" (bolt now unlocked), THE 3 KNOCKS (low on the door), "You don't move" face, clock 11:40, hallway click to dark + wait, click back on (switch flipped by itself) | house (kitchen, basement, hallway), horror (note rule 3, babyMonitor, hfx), cat |
| C | s021-s027 | 46.94-65.644 (18.7 s) | Monitor crackles, the whisper macro (static key-up, LEDs on the voice), halfway up the stairs (doorAjar 0.15, Biscuit on the bottom step), the FLIP + Rule 4 on the back, "no kids" face (door 0.3), "I can see you on the stairs" (door 0.45, shape, small hand on the banister) + 0.6 s hold, hard cut to black + "Follow for Rule 5." | house (hallway, stairs), horror (babyMonitor, note flip/back, hfx, endCard), cat |

**Batch C is done by the owner's PC session**, so its `scene` texts are self-contained (every one starts with the kit line: set calls,
helpers, look). It needs sets/house.js, sets/horror.js, cast.js, acting.js, faces.js, creatures.js and `DEMO_house.js` / `DEMO_horror.js`.

### Rules for shot writers
- Write ONLY your own file: `scenes/shots/<BATCH>_*.js` (e.g. `A_open.js`, `B_night.js`, `C_stairs.js`) registering exactly your batch's
  ids from shots.json. Do not edit shots.json, sets/, cast.js, config, tools, engine or another batch's files. Need a prop ($50 bill, keys,
  mug, clock chip)? Draw it locally in your shot file.
- Helper names in the scene texts are the Stage A names: house.js `house(g,t,cam,{room:'kitchen'|'basement'|'hallway'|'stairs'|'upstairs'
  (+ exterior), lights:{hall,lamp}, flicker, knock, doorAjar, shape, hand})`; horror.js `note(g,x,y,s,{rules,flip,back})`,
  `babyMonitor(g,x,y,s,{level,static})`, `hfx` (grain, vignette, cold grade, flicker, flashlight cone, dust, breathing darkness, static
  overlay), `endCard`, `ruleTitle`. If H1/H2 shipped a different name or option, use theirs and follow the DEMO file.
- Canvas 1080x1920 (`V(landscape, vertical)`): faces and text above y 1440 and left of x 900 (Instagram UI). Every scene text repeats this.
- HORROR BAR every shot: cold blue moonlight + ONE warm practical, film grain + vignette, a slow push or drift (never static), one
  unsettling detail (named in each scene text). The thing upstairs is never shown clearly: max `shape` 0.3, the hand is low contrast.
- The note is revealed one rule at a time: s004 numbers only, s005 rule 1, s008 rule 2, s011 rule 3, s024 flip -> rule 4 on the back.
- Continuity: basement bolt locked (s006) -> unlocked (s015); lamp on until s013, off from s018; the top door `doorAjar` 0.15 (s023) ->
  0.3 (s025) -> 0.45 (s026); the monitor is with the HERO from s019 on (left hand); the note goes into her hoodie pocket in s013 and comes out
  in s023. Biscuit (purple collar, green eyes) always stares toward/up the stairs: s013, s019 (eyes in the dark), s020, s023.
- The HERO is never lip-synced (narrator + monitor voice). Expression change on a word in every shot (times are in the scene texts).
- SFX (kit library names only): knock = `hit` pitch 0.5 x3 at 0.45 s rhythm; light switch click = `tick` pitch 0.6 + `hit` pitch 1.8;
  bulb buzz = `buzz`; monitor static / key-up = `rain` dur 0.3-0.7 + `glitch`; fridge hum = `hum` (shot length); clock = `clock` + `tick`
  pitch 0.7 on the minute; pen/paper = `swish` pitch 1.2-1.4; note flip = `swish` + `whoosh` pitch 1.3; heartbeat = `heartbeat` with `bpm`
  (58 -> 70 -> 96 -> 110 across the film); stairs = `footstep`; cut to black = `impact` + `hit` pitch 0.5. Adjust `at` only if you change the
  beat (tell the lead).
- Known short shots (< 2 s, keep them punchy): s001 (1.8), s005 (1.5), s008 (1.6), s011 (1.7), s014 (1.9), s015 (2.0), s017 (1.7),
  s018 (1.7), s021 (1.6), s027 (1.5, end card). Known long holds (dread): s002 (3.9), s009 (3.7), s019 (3.5), s022 (3.7), s026 (3.4).
- QC loop per shot: `node render.mjs --project projects/rules-01 --stills <ids> --scale 0.5` (start+0.3, mid, end-0.3) and `--sheet
  --scale 0.4` for the batch; tick QUALITY_BAR + HORROR BAR (size, expression on a word, blink, idle, camera, depth, atmosphere, rim, one
  unsettling detail, safe zones, determinism, no SHOT ERROR / MISSING for your ids). Render cost <= ~1.5 s/shot.
- Push to your own branch; the lead integrates into `whatif/see-in-dark`.
