# HANDOFF: THE RULES #2 "The Night Shift" (horror short, 9:16 vertical, 69.9 s, Instagram Reels)

Script: `horror/rules-02/script.md`. Voice landed: `input/voiceover.wav` 69.86 s: Fenrir narrator, [MAN] (line 7, low/slow/pitched down)
and [PHONE] (line 10, landline). Word clock: `timeline/words.json` (88% match; check the filtered character lines against sentences.json /
the audio). CAPTIONS ARE ON (config.json, owner rule 23): burned-in at y 1330, so keep important action out of y 1270-1400 when a caption
is up, and out of the bottom 480 px / right 180 px (IG UI).

Same kit, same HORROR BAR as `projects/rules-01/HANDOFF.md` (read it): cold palette + one warm practical, grain, vignette, slow pushes,
fear from what you DON'T see, cuts on sound, hard cut to black at the end. `sets/horror.js` from #1 is here (grain, vignette, coldGrade,
flicker, breathe, interference, ruleTitle, endCard): REUSE it. End card text: "Follow for the next rule."

## Cast (cast.js)
- HERO "you": the new night clerk, DARK GREEN work polo with a white name tag, short hair. Never lip-synced.
- STRANGER: tall thin figure in a long dark coat (outfit STRANGER, draw ~1.15x), face never lit; only a too-wide pale smile catching the
  light; never blinks. Never fully shown in the final shot: the thing behind "you" on camera four is just a tall dark shape + that smile.
- Biscuit doesn't appear (different location).

## Stage A (now): new sets
| Worker | Files | What |
|---|---|---|
| H1 | sets/gas.js + DEMO_gas.js | The QUIK STOP gas station at night, vertical framing: `gas(g,t,cam,{view:'exterior'|'counter'|'window'|'door'|'aisle'|'behind', lights, flicker})`. Exterior: canopy with buzzing lights, 2 pumps, an empty highway into pitch black, a tall price sign, moths. Interior: the counter with a register (the sticky note on it), the night pay window with a pass-through drawer and a speaker grille, the front door with a deadbolt + "OPEN 24 HRS" sign, snack aisles, a coffee machine, fluorescent tubes (one flickering), a wall clock (2:00 / 2:40 / 3:00), the wall phone. 'behind' = the counter seen from behind the clerk (for camera four's angle). |
| H2 | sets/rules2.js + DEMO_rules2.js | Props + UI: `stickyNote(g,x,y,s,{rules:n})` (yellow note, 3 handwritten rules appear one by one), `cctv(g,x,y,w,h,{cams:4, focus:0..4, static, time:'03:00:12'})` (a 2x2 grid of grainy green-grey feeds labelled CAM 1-4 with a REC dot + timestamp; CAM 4 can fill the screen), `wallPhone(g,x,y,s,{ring:0..1, offHook})` (ringing shake + coiled cord), `stranger(g,x,y,s,{smile:0..1, lit:0..1, tap:0..1})` (the coat silhouette, the too-wide smile, a knuckle tap on glass), glass reflections/condensation for the pay window. |

Push to your own branch, write a status line to handoff/outbox/H<n>.md. The lead integrates into whatif/see-in-dark. Shot batches next.

## Stage B (now): write the shots, batches A-C
`story/shots.json` v1: **30 shots, 0 -> 69.864 s**, contiguous, every cut 0.15 s before a spoken word except the five cuts that land on a
sound (s014 knuckle tap 1, s020 phone ring, s027 CCTV static, s029 CCTV static + low hit, s030 hard cut to black; each sits 0.6-0.7 s before
its line). `line` = the exact spoken words (all 136 words covered once). Each shot has a concrete `scene` (set + options, cast, camera,
light, the one unsettling detail, word beats as seconds from shot start), `type`, `sfx` cues (seconds from shot start) and `amb` (roomtone;
wind on the exterior). Story-level `music` plan: one `dark` drone: 0.25 through the rules -> 0.35 at 2 a.m. (27.06) -> 0.5 on the taps
(31.70) -> 0.04 near-silence under [MAN] "The usual." (36.34-38.44) -> 0.45 (38.44) -> 0.3 on the ring (45.30) -> 0.05 under the [PHONE] call
(49.44-56.38: a cheerful voice in dead quiet) -> 0.6 for the look down + slow head turn (56.38) -> 0.04 on CAM 4 (61.40) -> 0.02 on black (68.45).

**Timing (read this):** `timeline/words.json` has been RE-TIMED from the voice envelope (10 ms RMS bursts in input/voiceover.wav), each
corrected line's words spread across its burst weighted by length, so captions and `wordTime()` are now in sync and safe to use. Fixed lines
(burst, was): "Your first night shift..." 0.45-2.54 (0.05); "Three rules." 6.49-7.27 ('Three' 5.51); "Rule one." 9.03-9.67 (8.69-10.29);
"At two a.m., lock the door." 10.58-12.13; "Serve customers..." 13.04-14.63; "Rule two." 16.42-17.17 (to 18.01); "Rule three." 22.39-23.19
(to 24.13); "Never look at camera four." 24.08-25.41; "Two a.m." 27.21-28.02 (25.82!); "You lock the door." 28.93-29.86 (27.64!); "Two forty."
30.74-31.48 (29.75-32.47); "A man taps on the glass." 32.37-33.78; "He doesn't blink." 34.67-35.53; [MAN] "The usual." 36.49-37.11 (reverb
tail to 37.38); "Three a.m." 44.24-45.10 (43.23!); "The phone rings." 45.98-46.86; "It's your manager." 47.69-48.62; "You look down at the
note." 56.53-57.72 (56.07); "Then, without meaning to," 58.59-59.82 + "you look at camera four." 59.98-61.13 ('four.' to 61.95); "It shows the
counter." 62.05-63.16. [PHONE] line 10 matched within 0.07 s and is unchanged (Hey! 49.59, Sorry... 49.91-51.51, Easy night 52.01-52.43,
Nothing... 52.97-54.53). Voice ends 67.85, hold 0.6 s, black at 68.45, end card text from ~68.6. (Also stored in `wordTimesCorrected`.)

| Batch | Ids | Time | Content | Main sets |
|---|---|---|---|---|
| A | s001-s010 | 0.00-27.06 (27.1 s) | Exterior QUIK STOP (canopy, empty highway), the sticky note on the register, "Three rules" (numbers only), Rule 1 ink-on, the door + deadbolt (high handprint), the pay window hold, Rule 2 ink-on, "the usual" hold (TALK light on by itself), Rule 3 ink-on (double underline, tear), the CCTV grid + CAM 4 tile | gas (exterior, counter, door, window), rules2 (stickyNote rules 0-3, cctv), horror FX |
| B | s011-s024 | 27.06-56.38 (29.3 s) | Clock 2:00, the deadbolt locked, clock 2:40, THE KNUCKLE TAPS (cut on tap 1), he doesn't blink, [MAN] "The usual." at the grille, "We're out" face, the too-wide smile + walking backwards into the dark, clock 3:00, THE PHONE RINGS (cut on ring), receiver up, [PHONE] call -> freeze on "note", "Easy night" shock insert, high wide hold (two figures in the reflection for 2 frames) | gas (counter, door, window, aisle), rules2 (stranger, wallPhone, stickyNote), faces |
| C | s025-s030 | 56.38-69.864 (13.5 s) | Look down at the note, THE SLOW HEAD TURN to the monitor, CAM 4 fills the screen (the counter from behind her, empty aisle), "From behind you" face (doesn't turn), CAM 4 again: the tall dark shape right behind her + the too-wide smile over her shoulder + 0.6 s hold, hard cut to black + "Follow for the next rule." | gas (counter, 'behind' inside the CCTV feed), rules2 (cctv focus 4, stranger), horror (interference, endCard) |

**Batch C is done by the owner's PC session**, so its `scene` texts are self-contained (every one starts with the kit line: set calls,
helpers, look, story so far). It needs sets/gas.js, sets/rules2.js, sets/horror.js, cast.js, acting.js, faces.js and `DEMO_gas.js` / `DEMO_rules2.js`.

### Rules for shot writers
- Write ONLY your own file: `scenes/shots/<BATCH>_*.js` (e.g. `A_open.js`, `B_night.js`, `C_cam4.js`) registering exactly your batch's ids
  from shots.json. Do not edit shots.json, words.json, sets/, cast.js, config, tools, engine or another batch's files. Need a prop (coffee cup,
  wall clock, handset)? Draw it locally in your shot file.
- Helper names in the scene texts are the Stage A names: gas.js `gas(g,t,cam,{view:'exterior'|'counter'|'window'|'door'|'aisle'|'behind',
  lights, flicker})` (+ its clock option); rules2.js `stickyNote(g,x,y,s,{rules})`, `cctv(g,x,y,w,h,{cams, focus, static, time})`,
  `wallPhone(g,x,y,s,{ring, offHook})`, `stranger(g,x,y,s,{smile, lit, tap})`; horror.js `grain`, `vignette`, `coldGrade`, `flicker`,
  `breathe`, `interference`, `endCard`. If H1/H2 shipped a different name or option, use theirs and follow the DEMO file. `ruleTitle` is
  not used: the sticky note is the hero prop (like #1's note).
- Canvas 1080x1920 (`V(landscape, vertical)`). CAPTIONS ARE ON at y 1330: faces, hands and key action above y 1270 while words are up
  (caption band y 1270-1400), nothing important below y 1440 or right of x 900. Every scene text repeats this.
- HORROR BAR every shot: cold fluorescent / blue-black night + ONE warm practical (register amber, coffee machine), grain + vignette + cold
  grade, a slow push or drift, one unsettling detail (named in each scene text). The stranger's face is never lit (`lit` <= 0.25), he never
  blinks; only the too-wide smile catches light. In the last shot he is just a tall dark shape + the smile.
- The sticky note: s002 found (unreadable), s003 numbers only, s004 rule 1, s007 rule 2, s009 rule 3 (double underline + tear), s023 all three.
- Clock: 2:00 (s011), 2:40 (s013), 3:00 (s019). CCTV timestamps: 01:58:40 (s010), 03:02:38 / :41 / :44 (s026, s027, s029).
- Continuity: the handprint on the door glass high (s005) -> face height (s012); the pump-2 canopy tube flickers (s001) -> dark (s012);
  the pay-window drawer opens an inch in s016 and is still open in s021; HERO holds the note from s002, it is back on the register in s023;
  the receiver is in her hand s021-s025.
- The HERO is never lip-synced (narrator, [MAN] and [PHONE] voices). Expression change on a word in every shot (times in the scene texts).
- SFX (kit library names only): knuckle tap on glass = `hit` pitch 1.7 + `tick` pitch 0.9 x3 at 0.35 s rhythm; deadbolt = `hit` pitch 0.8 +
  `tick` pitch 0.5; fluorescent / canopy buzz = `buzz`; coolers = `hum`; clock = `clock` + `tick` pitch 0.7 on the minute; pen/marker =
  `swish` pitch 1.2-1.4; speaker crackle / CCTV static = `rain` dur 0.2-0.6 + `glitch`; phone = `phonering`; receiver = `hit` pitch 1.2;
  TALK light = `blip`; heartbeat `bpm` 76 -> 84 -> 96 -> 104 -> 110; shock / reveal = `hit` pitch 0.45-0.5; cut to black = `impact` + `hit`
  pitch 0.5. Adjust `at` only if you change the beat (tell the lead).
- Known short shots (< 2 s, keep them punchy): s004 (1.6), s007 (1.6), s009 (1.7), s011 (1.7), s012 (1.8), s013 (1.1), s015 (1.8),
  s017 (1.9), s019 (1.2), s021 (1.9), s023 (0.9), s028 (1.4), s030 (1.4, end card). Long holds (dread): s001 (3.3), s006 (3.4), s008 (4.4),
  s010 (3.1), s018 (3.7), s024 (3.6), s026 (3.0), s029 (3.2).
- QC loop per shot: `node render.mjs --project projects/rules-02 --stills <ids> --scale 0.5` (start+0.3, mid, end-0.3) and `--sheet
  --scale 0.4` for the batch; tick QUALITY_BAR + HORROR BAR (size, expression on a word, blink, idle, camera, depth, atmosphere, rim, one
  unsettling detail, safe zones incl. the caption band, determinism, no SHOT ERROR / MISSING for your ids). Render cost <= ~1.5 s/shot.
- Push to your own branch; the lead integrates into `whatif/see-in-dark`.
