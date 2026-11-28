# Man versus Horse Marathon: script & shot list

**EMOTION:** WTF, then cheer
**LINE 1:** "Every year in Wales, people race horses... on foot." (9 words, WTF up front, "on foot" held for a beat)
**CAPTION (top, frame 1 → 3.5 s):** "HUMANS vs. HORSES" / "a 22-mile race in Wales" (2 lines, centre-top; HUMANS gold, HORSES red)
**Frame 1:** the start line on a green Welsh hill course. A toon runner with a race bib bounces nervously next to a chestnut horse
in sunglasses, with a rider; the horse looks down at him through heavy, smug lids. It's already moving.
**Signature gag (the story itself):** the smug horse vs the nervous runner, side by side. It returns at the finish: the runner
breaks the tape, the horse's jaw drops and its sunglasses vanish. In the payoff it puts them back on.

**Slug:** `man-vs-horse-marathon` · YouTube Short, 9:16, 1080×1920, 24 fps · Toon 3D
**Voice:** Chatterbox "D2" (exaggeration 0.3, cfg 0.3) via `whatif/voice/chatterbox_d2.py`, then `projects/man-vs-horse-marathon/tighten_vo.py`.
Numbers are digits here and in the captions; the TTS says them. **SFX:** kit library only (`toon3d:*`).

## Narration (exact VO, 113 words)
1. Every year in Wales, people race horses... on foot.
2. It started in 1980, with an argument in a Welsh pub.
3. Over a long distance, could a human keep up with a horse?
4. The landlord overheard... and set up a race to find out.
5. 22 miles over the Welsh hills: runners versus horses and riders.
6. For 25 years, the horses won. Every. Single. Time.
7. But here's the part... in 2004, a runner named Huw Lobb beat them all.
8. By about 2 minutes. And he took home a 25,000 pound prize.
9. Since then, humans have won just 4 more times, most recently in 2025.
10. Humans: 5 wins. Horses: pretty much all the rest.
11. Subscribe for more.

The narrator stays deadpan; the visuals carry the jokes.

## Shots (`story/shots.json`; final times in STATUS.md)
| # | VO | Scene | Gag (and the fact it shows) |
|---|---|---|---|
| s01 | Every year in Wales, | FRAME 1: start line, nervous runner (sweat) + smug horse in sunglasses with a rider | humans race horses |
| s02 | people race horses... | the horse lowers its sunglasses at the runner, who gulps | |
| s03 | on foot. | low: sneakers next to hooves; the runner shrugs, the horse "???" | on foot |
| s04 | It started in 1980, | a 1980 pub: two blokes with pints, the landlord behind the bar | 1980, a pub |
| s05 | with an argument in a Welsh pub. | the two argue, a finger in the air, a head shaking | the debate |
| s06 | Over a long distance, could a human keep up with a horse? | one points at himself, the other shakes his head: "HUMAN = HORSE?" | the question |
| s07 | The landlord overheard... | the landlord polishing a glass, eyes sliding sideways; idea sparkle | he overheard |
| s08 | and set up a race to find out. | the hills: a START / FINISH arch slams down; the landlord points: "RACE!" | he set up the race |
| s09 | 22 miles over the Welsh hills: | INSERT 1: "22 MILES" | 22 miles |
| s10 | runners versus horses and riders. | the pack streams down the course: RUNNERS vs. HORSES | |
| s11 | For 25 years, the horses won. | INSERT 2: counter 0 → "25 YEARS" / HORSES WON | 25 years |
| s12 | Every. Single. Time. | the horse on a podium; a trophy drops on each word; hard punch-ins | |
| s13 | But here's the part... | the runner stops bouncing and stares down the course; the horse yawns (zzz) | |
| s14 | in 2004, a runner named Huw Lobb | a generic toon runner sprinting downhill, speed lines: "2004" | 2004 |
| s15 | beat them all. | the runner breaks the tape; the horse arrives behind, jaw drop, sunglasses gone: "HUMAN WINS" | first human win |
| s16 | By about 2 minutes. | close on the horse: double take, sweat: "~2 MIN" | about 2 minutes |
| s17 | And he took home a 25,000 pound prize. | a money bag drops into his arms, heart eyes: "£25,000" | £25,000 |
| s18 | Since then, humans have won just 4 more times, | scoreboard: HUMAN WINS 2004, then 2007 · 2022 · 2023 · 2025 pop on | the exact years |
| s19 | most recently in 2025. | a 2025 runner with arms up; a horse sulks in the back | 2025 |
| s20 | Humans: 5 wins. | PAYOFF: scoreboard HUMANS 5 | 5 wins |
| s21 | Horses: pretty much all the rest. | the horse puts its sunglasses back on in front of a pile of trophies: "THE REST" | |
| s22 | Subscribe for more. | back to the start line; the camera settles on frame 1's exact framing → loop | |

INSERT cards: 22 MILES, 25 YEARS, and the HUMANS 5 scoreboard.

## Tone guard
- Generic toon runners and riders only. No likeness of Huw Lobb or any real winner, no real sponsor or event logos, no real pub sign.
- The horse is smug, never hurt. Nobody falls.
