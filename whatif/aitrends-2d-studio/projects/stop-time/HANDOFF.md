# HANDOFF: I.Awaken — "What If You Could Freeze Time for 10 Seconds?" (16:9 1080p24, ~6.5 min)

Script + sources: `whatif/what-if-stoptime/` (65 lines, 5 RULE cards). Classic What If style (eps see-in-dark / spider / train / level-up):
black round heads, rig2d actors, giantFace, hud ruleCard, bp blueprints. Cast in `scenes/cast.js` (HERO: shaggy black hair with one
cowlick, round tortoiseshell glasses, teal/cream striped long-sleeve tee, navy star pyjamas, mismatched socks; MINA red scarf + stopwatch;
DEV orange beanie + phone; BISCUIT). The VOICE is recorded on the owner's PC (Leo) — timings/shots.json come after it lands.
Stage A (now) doesn't need the voice. Each worker: own files only, DEMO_<set>.js with demo_* ids, 3 stills in the outbox, push to your branch.

| Worker | Files | What |
|---|---|---|
| H1 | sets/freeze.js | FREEZE FX: the snap (finger-snap pose + a ring ripple that freezes the frame), `freezeGrade(g, k)` (cool desaturated still world, dust motes hanging), FROZEN liquids (juice/milk arcs and droplets hanging in air with highlights), frozen-mid-action pose helper (people/cat with tiny "still" sparkle), the BLACK view (snap 1: total darkness, only a faint outline once light returns), the WALL OF AIR view (snap 2: visible air-molecule speckle field, the hero squashed against it, cheeks puffed, can't breathe), unfreeze whoosh. |
| H2 | sets/stopprops.js | Props + kitchen beats on home3's kitchen: Mina's stopwatch (big readable digits, 0-10 s), the KITCHEN CLOCK with a second hand that can "stick" (chronostasis gag), the oven clock vs the hero's chunky black watch (40 s apart), juice glass + orange-sock splash, the milk jug, Mina's school project (a cardboard volcano or solar-system model), a bowl, the bin, butter dish, toast; Dev filming UI (reuse devices.js phone if it fits). |
| H3 | sets/timebp.js | Science BLUEPRINTS (bp.js style, numbers exactly as sources.md): light speed + photons arriving at the eye/retina (no arriving light = black), sunlight 8 min 20 s to Earth, air molecules ~2.5×10^19 per cm³ at ~500 m/s, the kitchen's ~48 kg of air, Newton's first law/momentum (frozen cat keeps its leap), the stopped-clock illusion (eyes jump ~3×/s, the brain backfills — Yarrow 2001), GPS satellite clocks +45/-7 = +38 µs/day, Lene Hau's Harvard lab "trapped a pulse of light" (2001). |
| H4 | sets/morning.js | Sets: the family kitchen at breakfast in a fresh layout (or a richer home3 kitchen variant: window light, fridge, table, cereal, juice), the hallway/living room for the evening watch beat, Mina's desk/table with the school project on Wednesday morning, a doorway gag. Moods: morning, day, evening. |

Stage B (shot list + batches A-D for H1-H4) follows once the PC pushes the voice. LEGAL: original story; nothing from any film/show/anime.
