# What if the Moon vanished tonight? (Justin clips, Toon 3D + BEANMEN effects)

Voice: **Chatterbox D2** (built-in voice, exaggeration 0.3, cfg 0.3) via `whatif/voice/chatterbox_d2.py --gap 0.3 --lead 0.15`, then `tighten_vo.py 1.0` (pauses capped 0.32 s, 0.18 s gaps + held beats).
Format: what-if **thought experiment** (line 2), following NASA Science (Tides) and Popular Science (NASA JPL's Matt Siegler), cross-checked with Wikipedia, Nature and Laskar & Robutel 1993 (sources.md).
TTS text spells "sixty"; captions/script show "60".

## Narration (127 words incl. closer, 11 lines)

1. (0.05-3.21 s) If the Moon vanished tonight, tides would shrink to about a third.
2. (3.40-7.19 s) Relax, it's only a thought experiment. Here's what scientists say would happen.
3. (7.47-11.23 s) First, nights get darker, like a new moon every single night.
4. (11.66-15.14 s) But the tides are the big one. The Moon does most of the pulling.
5. (15.42-18.63 s) The Sun makes tides too, but it pulls less than half as hard.
6. (18.81-21.40 s) So every tide would be roughly a third of today's.
7. (21.83-25.55 s) But animals would get confused. Some dung beetles steer by moonlight.
8. (25.73-28.26 s) They'd have to switch to steering by the Milky Way instead.
9. (28.74-33.78 s) But the strangest part is slow. Over a few hundred thousand years, Earth's tilt could wobble.
10. (34.16-38.45 s) Mars has no big moon... and its tilt swings by up to sixty degrees.
11. (38.93-40.16 s) Subscribe for more.

## Shots

| Shot | t (s) | Line | Picture / FX | Transition |
|---|---|---|---|---|
| s01 | 0.00-1.72 | If the Moon vanished tonight, tides would shrink | FRAME 1: night beach, full Moon going POOF, the tide already sliding back down the TIDE post; kid gasps; top caption "if the MOON / VANISHED tonight" | - |
| s01b | 1.72-3.27 | If the Moon vanished tonight, tides would shrink | hard cut: the striped TIDE post, water dropping, chip TIDES + down arrow; caption holds | cut |
| s02 | 3.27-5.34 | Relax, it's only a thought experiment. Here's wh | pause: moonless beach, kid close-up, stamp THOUGHT EXPERIMENT (hook caption ends 3.5 s) | flash |
| s03 | 5.34-7.35 | Relax, it's only a thought experiment. Here's wh | scientist bean at a telescope on the beach, nodding | whipBlur |
| s04 | 7.35-9.36 | First, nights get darker, like a new moon every  | the beach dims; kid holds a little lantern; stamp DARKER | fade |
| s05 | 9.36-11.54 | First, nights get darker, like a new moon every  | 2D week strip of dark new-moon discs, chips NEW MOON / every night | cut |
| s06 | 11.54-13.60 | But the tides are the big one. The Moon does mos | space: Earth with its ocean bulge, Moon beside it; stamp THE BIG ONE | iris |
| s07 | 13.60-15.30 | But the tides are the big one. The Moon does mos | close on the Moon, pull arrows, chip MOST OF THE PULL | whipBlur |
| s08 | 15.30-16.90 | The Sun makes tides too, but it pulls less than  | the Sun far off at left, a small arrow; ? over Earth | whipBlur |
| s09 | 16.90-18.69 | The Sun makes tides too, but it pulls less than  | INSERT versus "TIDE PULL — MOON: 1 vs SUN: < 1/2" | cut |
| s11 | 18.69-19.72 | So every tide would be roughly a third of today' | the TIDE post at night: OLD HIGH TIDE red line above the new low water, chip NOW: ~1/3 | fade |
| s10 | 19.72-21.71 | So every tide would be roughly a third of today' | INSERT bigtext "TIDES WITHOUT THE MOON ~1/3 of today's size" (Moon gone, small bulge) | cut |
| s12 | 21.71-23.58 | But animals would get confused. Some dung beetle | moonless savanna: the dung beetle stops, ???, stamp CONFUSED | flash |
| s13 | 23.58-25.61 | But animals would get confused. Some dung beetle | flashback with the Moon up: the beetle rolls its ball along a straight dotted line, chip "steers by MOONLIGHT" | iris |
| s14 | 25.61-27.14 | They'd have to switch to steering by the Milky W | no Moon: the beetle looks up, ? | whipBlur |
| s14b | 27.14-28.62 | They'd have to switch to steering by the Milky W | low angle: the Milky Way fades in; the beetle rolls on happily, chip MILKY WAY | cut |
| s15 | 28.62-30.48 | But the strangest part is slow. Over a few hundr | Earth with its spin axis at 23.4°, stamp SLOW... | fade |
| s16 | 30.48-32.44 | But the strangest part is slow. Over a few hundr | time-lapse spin, chip "+300,000 years" counting | cut |
| s16b | 32.44-34.04 | But the strangest part is slow. Over a few hundr | the axis swings wider and wider, chip TILT, sweat + ! | cut |
| s17 | 34.04-35.72 | Mars has no big moon... and its tilt swings by u | red Mars with its axis and two tiny moons, chips MARS / no big moon | whipBlur |
| s18 | 35.72-37.66 | Mars has no big moon... and its tilt swings by u | INSERT counter "MARS TILT SWINGS UP TO 60° — over millions of years" over a wildly tilting Mars (payoff) | cut |
| s18b | 37.66-38.81 | Mars has no big moon... and its tilt swings by u | reaction: Earth with its Moon circling, hearts, chip "thanks, Moon" | cut |
| s20 | 38.81-40.77 | Subscribe for more. | back to frame 1's beach camera, Moon back up, tide high; last 0.12 s the poof starts -> loops into frame 1 | iris |

Insert cards: s09 (MOON 1 vs SUN < 1/2), s10 (~1/3), s18 (60°). Music: kit bed `toon3d:mystery` (-20 dB, ducked). SFX: kit cues in story/shots.json.
