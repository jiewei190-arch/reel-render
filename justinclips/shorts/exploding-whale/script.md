# The Exploding Whale: script & shot list

**EMOTION:** WTF, then laugh
**LINE 1:** "In 1970, Oregon removed a dead whale... with dynamite." (9 words, WTF up front, the reveal held for a beat)
**CAPTION (top, frame 1 → 3.5 s):** "1970: a dead WHALE" / "vs. DYNAMITE" (2 lines, centre-top; WHALE gold, DYNAMITE red)
**Frame 1:** a beached sperm whale, a gull in a napkin bib waiting on its back, and a fuse already fizzing across the sand toward a
DYNAMITE crate, with a clock tick on every half-second. It's already moving.
**Signature gag (the story itself):** the countdown and the BOOM. The fuse and tick start at 0 s. A teaser BOOM pops at ~3.9 s on
"dynamite", and the real BOOM lands after "3... 2... 1...", followed by a comic beat of silence.

**Slug:** `exploding-whale` · YouTube Short, 9:16, 1080×1920, 24 fps · 42.9 s · Toon 3D
**Voice:** Chatterbox "D2" (exaggeration 0.3, cfg 0.3) via `whatif/voice/chatterbox_d2.py`, then `projects/exploding-whale/tighten_vo.py`.
Numbers are digits here and in the captions; the TTS says them ("nineteen seventy", "forty-five-foot", "fifty").
**SFX:** kit library only (`toon3d:*`, generated in code). No recordings of the real event or the 1970 news film.

## Narration (exact VO, 113 words)
1. In 1970, Oregon removed a dead whale... with dynamite.
2. A 45-foot sperm whale had washed up on the beach in Florence, Oregon.
3. 8 tons, rotting, and the state highway department got the job.
4. The plan: blow it to bits, and let the seagulls clean up.
5. So they used half a ton of dynamite. A crowd gathered to watch.
6. 3... 2... 1...
7. But here's the part... the whale came back down.
8. Chunks of blubber rained on the crowd. One crushed a brand-new car.
9. Nobody was seriously hurt. The seagulls? Scared off. And most of the whale... was still there.
10. 50 years later, the town named a park after it: Exploding Whale Memorial Park.
11. Subscribe for more.

The narrator stays deadpan; the visuals carry the jokes. Escalations: 3.9 s teaser BOOM · 8 s "8 TONS" · 11.7 s the plan ·
19.3 s countdown → 21.7 s BOOM + silence · 23 s "But here's the part..." · 28 s the car · 31 s gulls flee · 35.6 s "50 years later" → payoff.

## Shots (timed to the tightened VO, 42.87 s; `story/shots.json`)
| # | time | VO | Scene | Gag (and the fact it shows) |
|---|---|---|---|---|
| s01 | 0.00 | In 1970, Oregon | FRAME 1: whale, fuse fizzing, gull in a bib, "???" | the gull is waiting to eat (the plan: birds would eat the remains) |
| s02 | 1.50 | removed a dead whale... | push in, stink lines, gull licks its beak | "DEAD" chip |
| s03 | 2.46 | with dynamite. | the spark reaches the DYNAMITE crate: teaser BOOM, flash, gull launches | dynamite (fact) |
| s04 | 4.90 | A 45-foot sperm whale had washed up | wide: a yellow ruler along the whale, "45 FT", a beachgoer's "!" | the size as a literal ruler |
| s05 | 6.78 | on the beach in Florence, | FLORENCE, OR sign, beachgoer pinching his nose, sweat | Florence, Oregon; rotting |
| s06 | 8.00 | Oregon. 8 tons, | INSERT 1: "8 TONS" (whale sagging behind) | 8 tons |
| s07 | 8.86 | rotting, | close on the gull in the stink lines, sweat drops, "ROTTING" | rotting |
| s08 | 9.94 | and the state highway department got the job. | a highway worker; road cones pop up around the whale; a ROAD WORK sign; double take on "job" | the highway division really got the job |
| s09 | 11.74 | The plan: blow it to bits, | chalkboard "THE PLAN": whale doodle → "BITS!" | the plan |
| s10 | 13.30 | and let the seagulls clean up. | three gulls in bibs with forks, hearts: "CLEANUP CREW" | birds were expected to eat the remains |
| s11 | 14.90 | So they used half a ton of dynamite. | INSERT 2: "HALF A TON" / "20 cases" over 20 crates | half a ton = 20 cases |
| s12 | 17.46 | A crowd gathered to watch. | the crowd, grinning, sparkles | the onlookers |
| s13 | 19.32 | 3... 2... 1... | hard punch-ins: worker at the plunger (sweat) / gull (sweat) / plunger pushed, speed lines; giant 3 / 2 / 1 | countdown |
| s14 | 21.74 | (beat) | BOOM: puffy cloud swallows the whale, white flash, shake; 1.3 s of no narration | the blast |
| s15 | 23.02 | But here's the part... | the crowd cheers, then slowly looks up; pupils shrink, "???" | |
| s16 | 24.62 | the whale came back down. | low angle: cartoon blobs tumbling out of the smoke, "INCOMING" | chunks came down |
| s17 | 26.14 | Chunks of blubber rained on the crowd. | crowd runs with arms over heads; blobs plop around them (nobody is hit) | blubber rained on onlookers |
| s18 | 27.82 | One crushed a brand-new car. | shiny car with a "NEW!" tag; a blob drops; the car goes pancake: "CRUSHED", dizzy stars | the brand-new car |
| s19 | 29.12 | Nobody was seriously hurt. | crowd peeks out, deadpan shrugs: "NOBODY SERIOUSLY HURT" | no serious injuries |
| s20 | 31.34 | The seagulls? Scared off. | the gulls "???", then flee, bibs flying off, speed lines: "SCARED OFF" | the birds were scared off |
| s21 | 33.38 | And most of the whale... was still there. | the smoke clears: the whale is still on the beach (one dent); the worker shrugs: "STILL THERE" | most of the whale remained |
| s22 | 35.64 | 50 years later, | INSERT 3: "50 YEARS LATER" / "FLORENCE, 2020" | 2020 |
| s22b | 37.48 | the town named a park after it: | a riverside park, a sign under a sheet, locals | residents voted on the name |
| s23 | 39.24 | Exploding Whale Memorial Park. | PAYOFF: the sign is revealed, with a gull in a bib on top: "REAL PARK" | the park's real name |
| s24 | 41.36 | Subscribe for more. | back on the beach; the camera settles into frame 1's exact framing with a fresh fuse fizzing → loop | |

## Tone guard
- No gore: the blubber is drawn as smooth pink-grey cartoon blobs, and the whale is a clean toon with closed eyes. No blob ever hits a person. The car is the only thing squashed.
- Nobody is mocked: the engineer is a generic toon worker, never named, never shown hurt. His shrug is the only joke on him.
- No logos and no real people's likeness. No TV station is named or shown. The park sign is a generic wooden sign with the park's name, not a copy of the real sign.
