# Project Pigeon — script & shot list

**EMOTION:** WTF + funny (deadpan narrator, the jokes are the visuals)
**LINE 1:** "Pigeons steering missiles: a real World War 2 plan." (9 words, WTF first)
**CAPTION (top, frame 1 → 3.5 s):** "PIGEON pilots" / "steering MISSILES" (2 lines; PIGEON gold, MISSILES red)
**Frame 1:** inside the missile's nose cone, three pigeons in leather flight caps and goggles peck their glowing target screens;
clouds rush past a porthole; original synthesized peck sounds from frame 1. Already moving.
**Signature gag (the story itself):** the peck. Heard in the first second, fills the "sounded like... this." beat, and is the payoff
("still pecking") that loops back to frame 1.

**Slug:** `project-pigeon` · YouTube Short, 9:16, 1080×1920, 24 fps · target 40–48 s · Toon 3D
**Voice:** Chatterbox "D2" (built-in voice, exaggeration 0.3, cfg 0.3) via `whatif/voice/chatterbox_d2.py`, then
`projects/project-pigeon/tighten_vo.py 1.04`. Numbers are digits here (captions keep digits); the TTS says them.
**Peck SFX:** original, synthesized in code (`make_pecks.py`): short beak-on-glass clicks, three birds at ~4–5 pecks/s. No recordings.

## Narration (exact VO, 11 lines, 116 words)
1. Pigeons steering missiles: a real World War 2 plan.
2. 1943. Psychologist Skinner's plan sounded like... this.
3. Three pigeons in tiny cockpits watched a screen of the ground ahead, and pecked at the target to steer.
4. Show them two targets, and at least two birds would agree. Majority rules.
5. One bird reportedly pecked more than 10,000 times in 45 minutes. Committed.
6. Officials reportedly called it eccentric and impractical... then chipped in 25,000 dollars anyway.
7. But here's the part... the pigeon demo reportedly worked.
8. Officials stayed skeptical anyway. In 1944, they cancelled it.
9. The Navy revived it as Project Orcon, until electronic guidance won in 1953.
10. And six years later, Skinner's pigeons were still pecking.
11. Subscribe for more.

Escalations: ~3.9 s (1943, the peck beat), ~12.7 s (two targets / majority vote), ~17.6 s (10,000 pecks), ~21.9 s (officials),
~27.2 s "But here's the part...", ~32.9 s (cancelled), ~34.7 s (Navy revival), ~40.4 s (six years later) → payoff.

## Shots (timed to the tightened VO, 45.4 s; exact times in STATUS.md)
| # | VO | Scene | Gag / FX |
|---|---|---|---|
| s01 | 1 | HOOK: nose cone interior, 3 capped pigeons pecking screens | top caption, PECK! bursts, peck SFX |
| s02 | 1 | Outside: the glide bomb in the clouds | WORLD WAR 2 chip |
| s03 | 2 | Lab: a generic toon scientist points proudly at a chalk doodle (pigeon → missile) | 1943 stamp |
| s04 | 2 | The "..." beat: close-up pigeon hammering its screen | the beat is filled by pecks |
| s05 | 3 | Front: the three cockpits, numbered 1-2-3; bird 2 salutes | TINY COCKPITS |
| s06 | 3 | Side view: the screen shows the sea and a target ship | LIVE VIEW chip |
| s07 | 3 | Peck → LOCKED ON; hard cut on "steer": the bomb banks | PECK = STEER |
| s08 | 4 | Two ships on every screen; birds look around | ??? ×3 |
| s09 | 4 | LEFT / LEFT / RIGHT: birds 1+2 slowly turn and stare at bird 3 | sweat drop |
| s10 | 4 | Bird 3 sheepishly switches | 2 : 1, MAJORITY RULES |
| s11 | 5 | INSERT: counter 10,000 PECKS, "in 45 minutes (reportedly)" | |
| s12 | 5 | The pigeon stops dead, stares into the lens | COMMITTED |
| s13 | 6 | Office: two generic officials stamp the proposal | ECCENTRIC, IMPRACTICAL, pigeon sweats |
| s14 | 6 | Both shrug; a money bag thumps on the desk | $25,000, pigeon heart eyes |
| s15 | 7 | "But here's the part..." — silence, the demo is set, everyone waits | slow push |
| s16 | 7 | One peck: ON TARGET; officials double-take | exclaim |
| s17 | 8 | Officials cross arms, side-eye | pigeon ??? |
| s18 | 8 | CANCELLED slams down; jaw drop; one feather floats down in silence | 1944 stamp |
| s19 | 9 | A Navy officer leans in; the pigeons flap with joy | PROJECT ORCON, U.S. NAVY · 1948 |
| s20 | 9 | A beeping electronic box rolls in and bumps cockpit 3; hard cut | ELECTRONIC GUIDANCE, 1953, sweat |
| s21 | 10 | Calendar card flips +1 … +6 | YEARS LATER |
| s22 | 10 | PAYOFF: back in the cockpits, all three still pecking | STILL PECKING |
| s23 | 11 | Closer; camera settles onto frame 1's exact framing → loop | |

## Tone guard
- Nobody is hurt: no explosions, no impacts, the birds are never shown in danger (the bomb only glides and banks).
- Generic toon people only (the scientist is not a likeness of Skinner); no real logos, flags or insignia; no channel name.
