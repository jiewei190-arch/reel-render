# Story bible: What If You Could See in Complete Darkness?

**Logline.** A blackout hits and "you" keep walking, because everything warm is glowing in your eyes. Five rules of heat vision (eyes quit first, dark isn't empty, heat has no colour, light is the enemy, cold hides) pay off when your little sister goes missing in a rainy forest and the only thing you can find is one tiny white spark.

**Tone.** Warm, curious, cinematic, dry humour. Wonder in the rules, comedy in Dev's reactions and the window gag, real tension and tenderness in Rule 5. Science stays honest (the ending says "not close, not yet").

**Style.** `dusk` (chosen from a dusk / midnight / storybook grid: dusk keeps the mustard hoodie true, gives the warmest lamps and the strongest thermal contrast; midnight desaturates the hero, storybook is too flat). 16:9, 1080p, 24 fps, no burned-in captions, `scope` bars for titles, freezes and climaxes, `none` for blueprint boards.

## Cast (signature item fixed for the whole video; code in scenes/cast.js)
| Id | Role | Outfit | Notes / expressions |
|---|---|---|---|
| HERO ("you") | the viewer | mustard hoodie `#E1AD01`, dark-teal trousers `#1f5f66`, no headwear | calm smirk, awe, determined, squint; never talks (narrator is the voice) |
| MINA | little sister | child scale, RED scarf `#d4262e`, dark top, hair bun | cheeky, worried, sleepy-smile; she has the twin hand warmer |
| DEV | best friend | ORANGE beanie `#f08a24`, blue-grey tee | confused, suspicious, laughing, cheering |
| DR LIN | scientist | white lab coat, round glasses, GREEN lanyard `#2fb85a` | thrilled, whispering, grinning in the dark |
| RANGER TOMAS | camp ranger | BLUE cap `#2f6fd0`, olive tracksuit | shouts, swings torch, wipes his eyes |
| BISCUIT | cat | near-black fur, PURPLE collar `#9a5ad6`, green eyeshine | blinks, "offended" half-lids, eyeshine (drawn by `cat()` in sets/actors.js) |
Other creatures: mouse, pit viper, deer, fox, kitten (all in actors.js). Volunteers: plain ink figures, no colour item.

## Locations (scenes/sets/)
| Set | Mood | Key light | View / props |
|---|---|---|---|
| apartment | night | cold moonlight through the big window; warm lamp when `power` > 0 | city skyline in window, sofa, coffee table, one shoe, door that "eats your knee", fridge (Biscuit's perch), counter with toast, bin, charger on the side table |
| street | night | sodium lamps + lit windows (die house by house with `power`) | terrace facades, corner shop with a flat glass window, parked car (kitten), kerb, road |
| cinema | interiorCool | the projection screen (flicker blue); daylight doorway | seat rows, aisle step lights, row F sign, EXIT, projector beam; `view:'lobby'` has the blank menu board |
| lab | interiorCool | ceiling strips (die with `lights`) then the blueprint wall glow | blueprint wall, bench, thermal-camera tripod, monitor, EXIT |
| forest | storm | pale moon, optional torch | camp view (tents, dead fire, pines, rain), cave view (cave mouth + rock ledge), wet trunks |
| blueprint | void | none (navy grid) | helpers in sets/bp.js: eye, retina rods/cones, wavelength chart, labels |

## Motifs
- **Thermal view** (sets/thermal.js): false-colour black > purple > red > orange > yellow > white, with HUD brackets and a palette bar. Used for everything the hero sees in the dark. Light hitting it = whiteOut.
- **The white spark**: the hand warmer. Planted in s058-s060 (tucked in the pocket, burns like a coal), paid off in s099-s101 (the tiny white spark, Mina's twin), echoed at s118.
- **Gold fact chips** (6 words or fewer) and **RULE cards** (big numeral, cream title).
- **Blackout / lights**: the power parameter on street, apartment and lab: lights die in sequence.
- **Cat eyeshine**, Dev popcorn, "Ten out of ten" stamp (comic beats).

## Music plan (story/shots.json `music`, v2 timings)
0-27.7 mystery .35 (cold open) · 27.7-95.4 wonder .5 (title, Rule 1) · 95.4-166.4 wonder .65 (Rule 2, thermal discovery) · 166.4-213.7 playful .45 (Rule 3 gags) · 213.7-252.7 tension .6 (Rule 4, flash, blindness) · 252.7-295.6 tension .8 (forest search, torch whiteout, the choice) · 295.6-309.3 dark .3 (lights out, sixty seconds) · 309.3-338.0 triumph .6 (the spark, reunion) · 338.0-359.7 mystery .35 (is it real) · 359.7-373.6 hopeful .4 (outro, end screen). SFX and ambience beds are per shot in shots.json.
