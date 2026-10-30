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
