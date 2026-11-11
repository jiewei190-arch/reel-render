# Shot plan: What If You Had Spider Powers? (animation directions)

Same kit and quality bar as eps 1-3 (aitrends-2d-studio, QUALITY_BAR.md): **nothing static**. Every shot has a moving camera, characters acting on the word beats, atmosphere and parallax. Timing comes from the recorded voice (Fenrir, 389.40 s; `timeline/words.json`). The full shot list is `projects/spider-powers/story/shots.json` v1: **121 shots**, cut 0.15 s before a spoken word, batches A-E (see the project HANDOFF, Stage B).

**Legal (every shot):** our hero is original. Never anything from the famous web-slinging hero: no red-and-blue, no mask or bodysuit, no web logo or web pattern, no wrist shooters (silk only from the back end, for comedy), no swinging between buildings (garden-fence height only), no "spider sense" text.

## Recurring devices (build once, reuse)
- **Day card** (`spiderprops.js dayCard`): a chunky paper card with a 7-dot week strip that pops in on every "Day ..." line: DAY 1 THE WALL, DAY 2 THE SLIDE, DAY 3 THE SILK, DAY 4 THE HAIRS, DAY 5 THE JUMP, DAY 6 LUNCH, DAY 7 THE STORM.
- **Pip** (`spider.js pip` / `pipFace`): the cute jumping spider is in almost every chapter as the silent comic partner: tilting, hopping, shrugging, riding the silk line, covering its eyes, holding up a '6' after its own jump, waving at the end. Always fuzzy and glossy-eyed, never scary.
- **The gloves gag** (`spider.js gloves`): the oversized purple gardening gloves slip off every time they might help (the wall, the drainpipe, the silk attempt, the raisin split screen).
- **Back-end silk** (`silkPuff`, `silkLine`, `silkAnchor`): a comic "pfft" puff, then a glinting dragline; it trails across the lawn on day 3 and lowers Biscuit in the storm.
- **Blueprints** (`spiderbp.js` on `bp.js board`, cream on navy, gold numbers): one per science explanation (hairy feet + van der Waals + >170x; square-cube + 225 species + 40% + size 114 + size limit; silk gland + steel/Kevlar/density + recycling; trichobothria + 3 m / 600 body lengths + the hum + 8 eyes; the hydraulic leg + 6 vs 1.5 + still debated; a local FIG 6 for digestion; lab silk; the size reprise).
- **Rule cards:** hud ruleCard over a dimmed version of the current set, exact titles from the script.
- **Giant faces** on the reaction beats (9 giantFace + 3 pipFace, never two in a row). The HERO face needs a local sandy hair tuft (faces.js has no 'spiky' branch).

## Scenes
| # | Lines | Set | Animation |
|---|---|---|---|
| 1 | 1 | Garden morning -> shed | 'SATURDAY'; HERO heads to the shed, Mina's flat tyre; in the dusty sunbeam two glossy eyes glint in the cobweb corner. |
| 2 | 2-3 | Shed macro | Pip steps out; the tilt / you tilt yours; the hop onto the bare thumb, 'NO BITE'; the unblinking staring contest; Mina pops in and names it PIP. |
| 3 | 4 | Bedroom, dawn | Camera tilts from the bed (Biscuit asleep) to HERO stuck flat on the ceiling; 0:01, 0:02; peel, drop, bounce; Biscuit launched off the bed. |
| 4 | 5 + title | Corkboard, shed, garden | 'STARE -> ??? -> POWERS'; Pip shrugs (pipFace); title on the back garden at sunrise, Pip waving on HERO's shoulder, gold '1 WEEK'. |
| 5 | 6-8 | Hallway | DAY 1. Gloves slip off, bare palms stick (suction rings), socks stretch; the climb and the wet-sticker slide; Dev drops his cereal; the magnifying glass; giant face MINA "No glue." |
| 6 | Rule 1, 9-12 | Card, blueprint | 'STICKY ISN'T GLUE.' Foot tuft -> one hair -> setules; van der Waals; one tip barely grips, hundreds of thousands lock on; Pip upside down on the window ('ESTIMATE'); >170x; a gecko peels its toes like tape. |
| 7 | 13-14 | House wall | DAY 2. Sliding down the drainpipe though the hands still stick; a glove tumbles; giant face with Pip on his nose ("enormous"). |
| 8 | Rule 2, 15-19 | Card, blueprint, garden | 'BIG THINGS CAN'T STICK.' The cube doubles (x2 / x8 / x4), SQUARE-CUBE LAW; an ant with a giant crumb vs HERO and a watering can; the ant scaled up flops; 225 species, mites to geckos, ~200-fold; a human off the chart; 40% pads overlay; US size 114 shoes; the SIZE LIMIT line at the gecko. |
| 9 | 20 | Back step, wall | Mina covers the hoodie in sticky notes; giant face MINA "Forty percent,"; he slides off the pipe shedding notes, Pip covers its eyes. |
| 10 | 21-23 | Garden | DAY 3. A dew thread, 'SILK'; open palms do nothing (no wrist flick), glove flops off; SPINNERETS blueprint; the look over the shoulder and the "pfft"; Dev films the backwards walk; the shiny line through his phone, Pip ziplining; giant face DEV, hearts. |
| 11 | Rule 3, 24-28 | Card, blueprint, shed, kitchen | 'SILK STARTS OUT AS A LIQUID.' Liquid -> solid at the nozzles; Pip's dragline drop; rivals steel, tougher than Kevlar, steel wins thread for thread (7.8 vs 1.3); the fridge; web recycling; the feast: 9 eggs and every sandwich. |
| 12 | 29-30 | Garden | DAY 4. Mina tiptoes up with a water balloon; he steps aside eyes closed, splash; giant face, calm smirk, air swirls (no text). |
| 13 | Rule 4, 31-34 | Card, blueprint, pipFace | 'YOU CAN HEAR WITH HAIR.' Trichobothria bend in a puff; the sensitivity gauge at the physical limit; 2016 Cornell, 3 m, ~600 body lengths; no ears, just hairs; the low hum and a cartoon wasp; MOST FROZE; eight eyes light up; telephoto pair; motion almost all round. |
| 14 | 35 | Kitchen | Biscuit's pounce fails (he turns first); she turns her back, offended. |
| 15 | 36-37 | Garden fence | DAY 5. Fence jump, 'CLEAN'; knees wobble like water balloons. |
| 16 | Rule 5, 38-42 | Card, blueprint, fence, lab | 'SPIDER LEGS RUN ON PRESSURE.' Flexor only at 2 joints; fluid pressure, a hydraulic digger in sync; Pip leaps 6x; 6 vs ~1.5; STILL DEBATED; the trained Manchester spider (unnamed, not Pip); muscle alone?; Dev's tape: 1 BODY LENGTH, Pip's '6' sign. |
| 17 | 43-45 | Kitchen, blueprint | DAY 6. The burger; giant face, hungry-spider pupils; FIG 6 no chewing -> juices -> soup -> slurp (cute, no real bugs); the burger's googly eyes stare back; milkshake instead. |
| 18 | 46-51 | Garden storm, apple tree | DAY 7 (slower cuts). The scarf flies into the tree, Biscuit goes after it and sticks; the normal climb with a RULE 2 chip; the arm hairs feel the gust, he hugs the trunk as it hits; can't hold on and hold a cat; the back-end puff, the silk tied off, the scarf burrito lowered on a glinting line; giant face triumphant in the rain; Biscuit lands in Mina's arms, furious. |
| 19 | 52 | Bedroom, shed | Next morning in bed (the ceiling empty, Biscuit forgiven on his chest); Pip waves one leg. |
| 20 | 53-56 | Shed, lab, blueprint, split screen | REAL LIFE: the staring contest, he blinks, PIP 1 - YOU 0; the lab; Stanford hand pads; a 70 kg climber up 3.7 m of glass ('NEARLY 4 m'); lab silk on a spool, weaker so far; the size reprise; raisin vs you. |
| 21 | 57-58 | Lock-ups | 'WHICH POWER WOULD YOU KEEP?'; sticky hands / the silk / the hairs that hear; comment bubble; end screen with the whole cast in the garden. |

## Sound
Playful for the cold open and title, curious (wonder) for days 1-2 and the first two rules, comedy (playful) for days 3-6 dipping under each science block, tension for the storm climb, triumph from the silk line to Biscuit's landing, warm calm for the next morning and Pip's wave, hopeful for the reality check and the ending. SFX: tick + swish + pop on every day card, stinger on each rule card, blip squeaks for sticking, low swishes for the wet-sticker slides, whoosh + pop for the silk "pfft", rain + hit for splashes, flash + thunder for lightning, freeze on MOST FROZE, hum under the 90 Hz test, counter on every count.
