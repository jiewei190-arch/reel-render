# Shot plan: What If You Trained Every Day for 3 Years? (animation directions)

Same kit and quality bar as ep 1 and 2 (aitrends-2d-studio, QUALITY_BAR.md): **nothing static**. Every shot has a moving camera, characters acting on the word beats, atmosphere and parallax. Timing comes from the recorded voice (Fenrir, 409.555 s; `timeline/words.json`). The full shot list is `projects/train-3yr/story/shots.json` v1: **131 shots**, cut 0.15 s before a spoken word, batches A-E (see the project HANDOFF, Stage B).

## Recurring devices (build once, reuse)
- **Time-skip card** (`home3.js timeSkip`): a calendar page that flips with a tick on every Day / Week / Month / Year jump (DAY 1, DAY 2, WEEK 1, MONTH 1, MONTH 3, the "DAY 1?" backwards gag, YEAR 1-3, DAY 1,095). It opens with a riffle to 1,095 in the cold open and ends the video back on DAY 1 (loop).
- **Rep counter and stopwatch** (`train.js`): a big gold number that ticks on every rep beat (23 and the collapse, 100 in 5 sets, 100 in 2 sets, stuck at 1 under the backpack, 109,500); the stopwatch on every timed run (1:20:00, 54:48, the plank).
- **Exercise grammar** (`train.js`): push-up / knee push-up / sit-up / deep slow squat / run cycle (jog, walk, limp), with fatigue (tremble, sag, collapse), sweat drops and breath puffs. Day 1 everything trembles; month 3 everything is crisp and bored.
- **The park route through the seasons** (`park.js`): spring at the start, summer in year 1, autumn rain for the shin splints and walking days, winter snow in years 2-3, a winter-to-spring wipe when the curls come back, and spring dawn again for day 1,095 (full circle).
- **Blueprints** (`body.js`, bp style, cream on navy, gold numbers): one per science explanation (DOMS fibres, abs under fat, SAID / plateau / light vs heavy, progressive overload, shin + stress fracture, follicle cycle + twins + DHT, heart + BPM band, the big responder study).
- **Rule cards:** ruleCard over a dimmed version of the current set, exact titles from the script.
- **Giant faces** on every reaction beat (12 in total, never two in a row).
- **The hair joke:** Mina's HAIR LOG notebook and tape measure recur (month 1, the cereal, "Unchanged.", the family tree). The hero's big dark curls are always full on screen, even during the scare (only the drain clump shows hair loss).

## Scenes
| # | Lines | Set | Animation |
|---|---|---|---|
| 1 | 1 | Bedroom at dawn | Alarm, HERO rolls out of bed, points at the empty calendar on "promise". |
| 2 | 1 | Graphic | The routine checklist fills slot by slot: push-ups, sit-ups, squats (gold 100s), a 10 km run; "3 YEARS" stamp. |
| 3 | 1-2 | Park, spring dawn | Wide on the 10 km (6.2 mi) sign; HERO jogs past; NO DAYS OFF stamp. Giant face: clueless grin, 1,095 empty calendar squares behind. |
| 4 | 3-4 | Bedroom doorway | MINA looks at his curls, then at him; giant face MINA (lip-sync) "your hair falls out". DEV's grave nod, "It's a known thing." |
| 5 | 5 | Giant face, calendar | HERO grabs his curls ("Is it?"), gold "3 YEARS"; calendar riffles DAY 1 -> DAY 1,095. |
| 6 | title | Park bridge at dawn | Title lock-up, HERO silhouetted mid-stride, Biscuit on the rail. |
| 7 | 6-8 | Bedroom corner, park | DAY 1. Push-ups: counter to 23, tremble, face-plant on "stop". Tiny sets, then knees; Biscuit sits on his back. The run: stopwatch 1:20:00, an old man with a dog overtakes him while he walks. |
| 8 | 9 | Bathroom | DAY 2. Arms won't lift the brush; MINA brushes his curls, checks the brush; giant face MINA "Still all there." |
| 9 | Rule 1 | Card | "SORE ISN'T BROKEN." with a DOMS chip. |
| 10 | 10-12 | Blueprint, bedroom, bathroom | Soreness curve peaks at 1-3 days; DEV shows a jump-lunge and HERO wobbles; slow deep squat with a LOWERING arrow; calendar X marks; second time the soreness gauge stays green; "REPEATED BOUT EFFECT" fibres repair. |
| 11 | 13 | Staircase | WEEK 1. Down the stairs without the rail, then the knee buckles: giant face "Mostly." |
| 12 | 14 | Bedroom corner | MONTH 1. 100 push-ups in 5 sets; DEV films (REC UI); MINA measures his hairline and writes it in the HAIR LOG. |
| 13 | 15-16 | Bathroom mirror, blueprint, mat | No abs in the mirror; abs under an unchanged fat layer; sit-ups and a plank for "6 weeks", endurance up, belly fat "= 0"; no spot reduction. |
| 14 | 17-18 | Bedroom corner | MONTH 3. Push-ups get easy, 100 in 2 sets; giant face: bored yawn. |
| 15 | Rule 2 | Card | "YOUR BODY ONLY ANSWERS THE QUESTION YOU ASK." |
| 16 | 19-22 | Blueprint, mat, sofa | SAID panel (question -> answer, "100 push-ups"), clap push-ups, one-handed push-ups while scrolling, the PLATEAU; light vs heavy; trembling to the LIMIT; can't lift the sofa with DEV on it; a coach's plan that climbs; PROGRESSIVE OVERLOAD vs a flat line; the calendar of "100" FOREVER. |
| 17 | 23 | Bedroom | DEV hauls in the textbook backpack ("Wear this."); one trembling push-up; the time-skip card flips backwards to "DAY 1?". |
| 18 | 24-26 | Park summer, blueprint, kitchen | YEAR 1. 10 km in 54:48 (< 55 MIN). 1 kcal x kg x km, the scale at 70 kg, ~700 kcal, a four-seasons swipe on "Every day"; a plate pie > 1/4 of 2,500 kcal; MINA hides the cereal on the fridge ("For your own good."). |
| 19 | Rule 3 | Card | "EVERY STEP ADDS UP. SO DOES THE DAMAGE." |
| 20 | 27-31 | Blueprint, park autumn, bedroom | Shin splints glow on the tibia; a calendar of RUN with the one REST sticker peeling off; pounding with a limp, a stress fracture crack; 10 runners, 4 pull up; damage in the workout, repair while asleep; DAMAGE outruns REPAIR; he writes WALK on the poster and walks 10 km in the rain; Biscuit at the window. |
| 21 | 32-33 | Bathroom, winter | YEAR 2. A hair clump in the drain; DEV gasps; giant face DEV "It's happening." (music turns to worry). |
| 22 | Rule 4 | Card | "YOUR HAIR LISTENS TO YOUR GENES, NOT YOUR PUSH-UPS." with the 50-100 a day counter. |
| 23 | 35-38 | Blueprint, park winter, kitchen | Follicle cycle + DNA; twins ~80%; the family photo wall of curls; DHT nudged up in a 1-year trial (a winter jogging group, 1 hour, 6 days a week); DEV pulls his beanie down; NO STUDY SHOWS IT stamp; shock and fast weight loss push follicles to rest; telogen effluvium; the cobwebbed cereal box. |
| 24 | 39-40 | Kitchen, bathroom, park | He eats properly; the drain is clean (TEMPORARY); winter wipes to spring and his curls bounce back (6-9 months); MINA writes "UNCHANGED." in the HAIR LOG; giant face: DEV disappointed. |
| 25 | 41 | Living room, snow outside | YEAR 3. Pulse check on the sofa; giant face, slow heartbeat (40 bpm SFX). |
| 26 | Rule 5 | Card | "A FIT HEART DOES LESS WORK." |
| 27 | 42-45 | Blueprint, watch, park | BPM band 60-100, trained ~40; the watch reads 41; the heart pumps more per beat; three-shot after a lap (HERO fresh, DEV wrecked); 700+ adults, 20 weeks, some hugely, some barely; giant face proud; Biscuit, zero days, rolls over. |
| 28 | 46 | Park, spring dawn | DAY 1,095. MINA on her bike beside him; DEV with the toilet-paper finish line at km 10. |
| 29 | 47 | Graphics | 109,500 push-ups; 10,950 km as a looping gold path; a gold arc more than a quarter of the way around a blueprint Earth. |
| 30 | 48-51 | Park bench | DEV grabs a pillow (Biscuit asleep on top, unannounced), giant face DEV "One punch."; the wind-up in near-silence; the punch: "Flump"; the pillow wobbles, Biscuit opens one eye; giant face HERO, curls totally still. |
| 31 | 52-55 | Triptych, bathroom, blueprint, park, hallway | 3 years side by side; heart / endurance / a mountain of laundry; 150 min/week target and his bar blowing past; the puddle-jump fail (not superhuman); DEV adds a textbook, MINA points at the bed (rest); he collapses with Biscuit on his back; the family tree of curls. |
| 32 | 56-57 | Lock-ups | "WOULD YOU TAKE THE CHALLENGE?" over the calendar; add/drop slots, comment bubble; end screen with the cast at the finish line and the card back on DAY 1. |

## Sound
Playful for the cold open, a light struggle for days 1-2, calm under the first science, an action-style training montage for months 1-3 and year 1, tension for the shin splints, a dark worried bed for the hair scare, warm calm/wonder when the curls return and the heart slows, triumph for day 1,095, near-silence on the wind-up, a playful sting on "Flump", hopeful for the ending. SFX: tick + swish on every time-skip flip, counter on reps, clock on the stopwatch, heartbeat (with bpm) on the pulse, hit/impact for collapses and the punch, blip boings for the gags.
