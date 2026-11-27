# HANDOFF: THE RULES #3 "The Alert" (apocalyptic horror short, 9:16 vertical, 66.5 s, Instagram Reels)

Script: `horror/rules-03/script.md` (read the header). Voice landed: `input/voiceover.wav` 66.51 s: Fenrir narrator, [MOM] line 8 (muffled
through the front door, too slow, too calm), [VOICE] line 12 ("Five." a dry close whisper from the dark). Word clock: `timeline/words.json`
(91% match; the planner re-times it from the audio). CAPTIONS ARE ON (config.json, rule 23) at y 1330: keep key action out of y 1270-1400
while words are up, and out of the bottom 480 px / right 180 px.

The owner's PC is OFF for this one: every batch is done by the cloud workers, and the lead renders the final in the cloud.

Same kit and HORROR BAR as `projects/rules-01/HANDOFF.md`. Reuse `sets/horror.js` (grain, vignette, coldGrade, flicker, breathe,
interference, endCard "Follow for the next rule.") and `sets/house.js` from #1 where it fits (stairs, hallway, front door).
APOCALYPSE LOOK: the outside light is the monster. It is never seen directly: a white-warm (#fff3d6 -> #ffd9a0) glow under the door,
blades of light through gaps in the taped cardboard, dust motes in it, the light slowly creeping across the floor. Inside is cold blue dark.
The street is dead quiet: no birds, no cars. Every phone on the street lighting up at once is the opening image.

## Cast (cast.js)
- HERO "you": teen, DARK RED hoodie, short dark hair (faces.js giantFace HERO now draws the hair; actor() draws hair from cast.hair).
- BROTHER: little brother, kid scale, asleep on the couch under a blanket (actor('BROTHER', ...)). Never wakes.
- MOM and DAD: only two closed bedroom doors upstairs. The thing at the door is NEVER shown (a shadow breaking the light under the door,
  the doorknob not turning). The fifth one is NEVER shown: the last shot is "you" counting on your fingers in the dark, the whisper comes
  from the black beside you.

## Stage A (now): new sets/props
| Worker | Files | What |
|---|---|---|
| H1 | sets/home4.js + DEMO_home4.js | The family house, vertical framing: `home4(g,t,cam,{view:'street'|'living'|'door'|'window'|'stairs'|'upstairs', glow:0..1, boarded:0..1})`. Street exterior at 3 a.m. (row of houses, every window lighting up blue from phones at once, a dead streetlight, no cars). Living room (couch with the sleeping brother under a blanket, TV off, coffee table, the front door with light under it, a shoe rack), windows getting taped cardboard (boarded 0..1, tape strips, gaps that leak light), the stairs up to two closed bedroom doors (MOM / DAD by the door decor, never people). The light: `outsideLight(g, t, {under:0..1, gaps:0..1, creep:0..1})` draws the glow under the door/gaps + dust motes; a shadow can break it (`shadow` 0..1). |
| H2 | sets/rules3.js + DEMO_rules3.js | Props + UI: `alertPhone(g,x,y,s,{t, rules:0..3, buzz})` a phone with a full-screen generic EMERGENCY ALERT (red/black banner, the 3 rules appearing one by one; a 2nd alert "Rule 4" style isn't needed), `phonesWindow` (many small phone glows in house windows at once), `tapeRoll` + `cardboard(g,...,{gaps})`, `doorKnob(g,...,{turn})`, `fingerCount(g, t, n)` a hand counting 1-4 on fingers in the dark with soft rim light, `alertSound` timing helper for the scream (sfx cues). Generic alert only: no real agency names or logos. |

Push to your own branch, write a status line to handoff/outbox/H<n>.md. The lead integrates into whatif/see-in-dark. Shot batches next:
A -> H3, B -> H4, C (the knock, the count, "Five.") -> H1 after its set is done.

## Stage B (now): write the shots, batches A-C
`story/shots.json` v1: **30 shots, 0 -> 66.512 s**, contiguous, every cut 0.15 s before a spoken word except the four cuts that land on a
sound (s002 the ALERT SCREAM, 0.68 s before "Every phone..."; s019 KNOCK 1, 0.99 s before [MOM] "Sweetheart?"; s029 the [VOICE] "Five."
whisper onset; s030 hard cut to black). `line` = the exact spoken words (all 106 words covered once). Each shot has a concrete `scene` (set +
options, cast, camera, light, the one unsettling detail, word beats as seconds from shot start), `type`, `sfx` cues (seconds from shot start)
and `amb` (roomtone inside; very low wind on the dead-quiet street). Story-level `music` plan: one `dark` drone: 0.12 dead quiet at 3 a.m. ->
0.5 on the alert scream (1.55) -> 0.28 through the rules (6.95) -> 0.2 taping / brother / 4 a.m. (29.30) -> 0.42 as the light pours in
(37.00) -> 0.03 near-silence for the knocks + the muffled [MOM] voice (42.90-48.08) -> 0.45 (48.08) -> 0.6 for the count (52.99) -> 0.06 the
"Four." hold (61.81) -> 0.02 "Five." + black (63.25 -> end).

**Timing (read this):** `timeline/words.json` has been RE-TIMED from the voice envelope (10 ms RMS bursts in input/voiceover.wav, -28 dB,
the [MOM] pair and the end re-checked with 0.05 s gaps and at -45 dB), every line's words spread across its burst weighted by length, so
captions and `wordTime()` are in sync and safe to use. Big fixes (burst, was): "Three a.m." 0.48-1.34 (0.08-2.24); "Three rules." 7.10-7.89
('Three' 6.10); "Rule one." 9.64-10.31 (to 11.20); "Rule two." 15.84-16.59 (to 17.40); "Rule three." 22.92-23.72 (to 24.48); "You tape
cardboard..." 29.45-31.32 (28.96); "Four a.m." 35.37-36.26 (34.46!); "White and warm, like sunrise." 39.72-41.26 (to 40.88); "So you count."
53.14-53.90 (52.24!); "Four." 61.96-62.42 (60.82!); [VOICE] "Five." 63.28-64.04 (62.28!). [MOM]: "Sweetheart?" 43.89-44.40, "It's Mom."
44.52-45.22, "The sun's up." 45.60-46.24, "Come and see." 46.47-47.11. The rest moved < 0.35 s (edges only). Voice ends 64.04, hold 0.6 s, black at
64.64, end card text from ~64.8. (All bursts are also stored in `wordTimesCorrected`.)

| Batch | Ids | Time | Content | Main sets |
|---|---|---|---|---|
| A -> H3 | s001-s012 | 0.00-29.30 (29.3 s) | Dead street at 3 a.m., EVERY PHONE SCREAMS (cut on the scream: every window lights up blue at once), HERO with the screaming phone, the alert screen "Three rules" (numbers only), Rule 1 + "Stay inside", the uncovered window (phone glows go dark), Rule 2, the false-dawn line on the horizon, "Don't look" face (curtain pulled), Rule 3, the front door (no light yet), the stairs + the two closed bedroom doors | home4 (street, living, window, door, stairs), rules3 (alertPhone rules 0-3, phonesWindow), faces |
| B -> H4 | s013-s018 | 29.30-42.90 (13.6 s) | Taping cardboard over the window, the brother falls asleep on the couch (TV reflection), the phone lock screen 4:00, THE LIGHT POURS IN under the front door, "White and warm, like sunrise" face (the light pulls at her), the wide silence before the knock (motes freeze) | home4 (window, living, door) + outsideLight, rules3 (cardboard, tapeRoll, alertPhone), faces |
| C -> H1 | s019-s030 | 42.90-66.512 (23.6 s) | THE 3 SOFT KNOCKS (cut on knock 1, low on the door) + [MOM] "Sweetheart? It's Mom.", the shadow breaking the light under the door ("The sun's up. Come and see."), the stairs + doors, "almost sure" face, the fist, MOM's door (1 finger), DAD's door (2), the brother (3), "You." (the hero), "Four." the hand + hold, "Five." (cut on the whisper: her eyes slide into the empty black beside her) + 0.6 s hold, hard cut to black + "Follow for the next rule." | home4 (door, stairs, upstairs, living) + outsideLight shadow, rules3 (doorKnob, fingerCount 0-4), house.js knockAt, horror endCard |

All three batches' `scene` texts are self-contained (each starts with its batch kit line: set calls, helpers, look, story so far), since every
batch runs in the cloud. They need sets/home4.js, sets/rules3.js, sets/horror.js, sets/house.js (knockAt), cast.js, acting.js, faces.js and
`DEMO_home4.js` / `DEMO_rules3.js`.

### Rules for shot writers
- Write ONLY your own file: `scenes/shots/<BATCH>_*.js` (e.g. `A_alert.js`, `B_night.js`, `C_count.js`) registering exactly your batch's ids
  from shots.json. Do not edit shots.json, words.json, sets/, cast.js, config, tools, engine or another batch's files. Need a prop (wreath,
  coat hook, family photos)? Draw it locally in your shot file.
- Helper names in the scene texts are the Stage A names: home4.js `home4(g,t,cam,{view:'street'|'living'|'door'|'window'|'stairs'|'upstairs',
  glow, boarded})` + `outsideLight(g,t,{under, gaps, creep, shadow})`; rules3.js `alertPhone(g,x,y,s,{t, rules, buzz})`, `phonesWindow`,
  `tapeRoll`, `cardboard(g,...,{gaps})`, `doorKnob(g,...,{turn})`, `fingerCount(g,t,n)`; horror.js `grain`, `vignette`, `coldGrade`, `flicker`,
  `breathe`, `motes`, `endCard`; house.js `knockAt`. If H1/H2 shipped a different name or option, use theirs and follow the DEMO file.
  `alertSound` is not needed: the scream is in the shots.json sfx cues.
- Canvas 1080x1920 (`V(landscape, vertical)`). CAPTIONS ARE ON at y 1330: faces, hands and key action above y 1270 while words are up
  (caption band y 1270-1400), nothing important below y 1440 or right of x 900. Every scene text repeats this.
- APOCALYPSE LOOK every shot: cold blue dark inside; THE LIGHT (white-warm #fff3d6 -> #ffd9a0) only under the door, through cardboard gaps,
  as dust motes and as warmth on faces/floor, never its source; grain + vignette + cold grade, a slow push or drift, one unsettling detail.
  The thing at the door is NEVER shown (knocks, a soft glint on the knob, two shadow bars in the light). The fifth one is NEVER shown: in s029
  the right half of the frame is empty black and stays empty.
- Continuity: windows boarded 0 in A, taped in s013 (0 -> 0.85), boarded 1 from s014. Outside light: none in A except the false-dawn line
  (s008) and its warmth on her face (s009); under the door from s016 (under 0 -> 1, creep 0.25), creep 0.45 (s018), 0.5-0.55 (s019-s020),
  0.6 (s026, stops at the couch edge). The alert phone: in HERO's hand s003-s010, face-down on the coffee table s014, lock screen 4:00 s015.
  The doors upstairs: MOM left (dried-flower wreath), DAD right (coat hook + jacket), always closed (s012, s021, s024, s025). Finger count:
  fist (s023) -> 1 (s024) -> 2 (s025) -> 3 (s026) -> hand to chest (s027) -> 4 (s028). The brother never wakes.
- HERO is never lip-synced (narrator, [MOM] and [VOICE]). Expression change on a word in every face/med shot (times in the scene texts).
- SFX (kit library names only): alert scream = `blip` pitch 1.0 + 1.13 (dur 0.42) pulsing every 0.5 s, first two at -6/-8, then -16..-22
  under the voice, + `glitch` -12 + `phonebuzz` -16 + `hit` pitch 0.6; rule line appears = `blip` chirp pair; tape = `swish` pitch 0.55-0.65,
  cardboard press = `hit` pitch 1.4; clock = `clock` + `tick` pitch 0.7; the light = `shimmer` (+ a soft `riser`); KNOCK = `hit` pitch 0.5
  at -6/-6/-5, 0.33 s rhythm (matching the #2 final mix); finger count = `tick` pitch 0.6; heartbeat `bpm` 70 -> 84 -> 90 -> 96 -> 100 -> 104;
  "Five." = only a quiet `hit` pitch 0.45 under the whisper; cut to black = `impact` + `hit` pitch 0.45. Adjust `at` only if you change the
  beat (tell the lead).
- Known short shots (< 2 s, keep them punchy): s001 (1.6), s003 (1.9), s007 (1.6), s010 (1.7), s011 (1.0), s015 (1.8), s018 (0.9), s023
  (1.6), s024 (1.9), s025 (1.8), s027 (1.4), s028 (1.4, with a 0.8 s silent hold), s029 (1.4), s030 (1.9, end card). Long holds (dread):
  s002 (3.5), s005 (3.3), s006 (2.9), s008 (3.1), s012 (3.8), s014 (3.2).
- QC loop per shot: `node render.mjs --project projects/rules-03 --stills <ids> --scale 0.5` (start+0.3, mid, end-0.3) and `--sheet
  --scale 0.4` for the batch; tick QUALITY_BAR + HORROR BAR (size, expression on a word, blink, idle, camera, depth, atmosphere, rim, one
  unsettling detail, safe zones incl. the caption band, determinism, no SHOT ERROR / MISSING for your ids). Render cost <= ~1.5 s/shot.
- Push to your own branch; the lead integrates into `whatif/see-in-dark`.
