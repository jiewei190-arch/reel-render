# The Wood Frog Freezes Solid Every Winter — script & shot list

**Style:** the "Immortal Jellyfish" nature-fact style (Toon 3D + BEANMEN effects: chips, stamps, insert cards, reaction FX).
**Slug:** `wood-frog-freezes` · YouTube Short, 9:16, 1080×1920, 24 fps · **42.18 s** (target 40–48)
**Voice:** Chatterbox "D2" (built-in voice, exaggeration 0.3, cfg 0.3) via `whatif/voice/chatterbox_d2.py` → `input/voiceover_raw.wav` (every line passed Whisper QA on seed 7),
tightened by `projects/wood-frog-freezes/tighten_vo.py` (atempo 1.0, pauses capped 0.32 s, 0.2 s gaps, held beats before lines 3, 5, 7, 9, 11) → 41.78 s of voice + 0.5 s tail.

**LINE 1:** "This frog freezes solid every winter, and its heart stops." (10 words, the WTF up front)
**TOP CAPTION (frame 1 → 3.5 s, 2 lines, centre-top):** "this frog **FREEZES** solid" (FREEZES gold) / "and its **HEART** stops" (HEART red)
**Frame 1:** snow already falling, frost creeping over the shivering frog on the snowy forest floor.
**Loop:** s19 is winter again: the camera, frost level, pose and snowfall land exactly on frame 1's, so the cut back to s01 loops (spring → winter → freeze).

## Narration (exact VO, 124 words; TTS says "218" as words, the caption shows digits)
1. This frog freezes solid every winter, and its heart stops.
2. It's the wood frog, the only North American frog found north of the Arctic Circle.
3. But in winter, up to two thirds of the water in its body turns to ice.
4. No heartbeat. No breathing. No blood flow.
5. But how does it survive? Its liver floods its body with sugar.
6. That sugar works like antifreeze, so ice can't form inside its cells.
7. But in Alaska, it goes further: frozen for up to 218 days.
8. And before winter sets in, it can freeze and thaw again and again.
9. Then spring comes. It thaws out and comes back to life.
10. And it hops off to a pond to breed... like winter never happened.
11. Subscribe for more.

"But..." turns: lines 3 (8.7 s), 5 (16.0 s), 7 (23.9 s); "Then spring comes" (32.6 s); payoff "...like winter never happened." ~38.8–40.0 s; closer "Subscribe for more." (1.23 s).

## Shots (19; s04, s06, s14 also hard-cut inside the shot)
| # | t (s) | Narration | Picture | In |
|---|---|---|---|---|
| s01 | 0.00-2.44 | This frog freezes solid every winter, | FRAME 1: snow falling, frost creeping over the frog + 2-line top caption | cut |
| s02 | 2.44-3.88 | and its heart stops. | x-ray close-up: the heart beats, then stops on "stops" | whipBlur |
| s03 | 3.88-4.93 | It's the wood frog, | autumn forest floor, the frog hops in, WOOD FROG chip | iris |
| s04 | 4.93-8.56 | the only North American frog found north of the Arctic Circle. | Arctic Circle sign: it hops across the line; THE ONLY FROG / THIS FAR NORTH | whipBlur |
| s05 | 8.56-9.62 | But in winter, | heavy snow, the frog hunkers down, WINTER chip | whipBlur |
| s06 | 9.62-12.90 | up to two thirds of the water in its body turns to ice. | x-ray: ice crystals fill up to 2/3, gauge on the left | cut |
| s07 | 12.90-15.88 | No heartbeat. No breathing. No blood flow. | INSERT 1: vitals monitor flatlines; NO HEARTBEAT / NO BREATHING / NO BLOOD FLOW on the words | cut |
| s08 | 15.88-17.36 | But how does it survive? | the frozen frog in its ice shell, camera orbits, ??? | whipBlur |
| s09 | 17.36-19.78 | Its liver floods its body with sugar. | x-ray: the liver lights up, sugar cubes flood the body | cut |
| s10 | 19.78-21.66 | That sugar works like antifreeze, | the frog glows with sugar; NATURAL ANTIFREEZE | whipBlur |
| s11 | 21.66-23.78 | so ice can't form inside its cells. | INSERT 2: cells packed with sugar, ice only in the gaps | cut |
| s12 | 23.78-25.94 | But in Alaska, it goes further: | Alaska at night under the northern lights, ALASKA | iris |
| s13 | 25.94-27.56 | frozen for up to 218 days. | INSERT 3: counter FROZEN FOR UP TO 218 DAYS (about 7 months) | cut |
| s14 | 27.56-32.62 | And before winter sets in, it can freeze and thaw again and again. | day/night flicker: FREEZE / THAW / x2 / x3 (hard cut on the first "again") | whipBlur |
| s15 | 32.62-34.03 | Then spring comes. | spring: sun, flowers; the frog still in its ice shell | iris |
| s16 | 34.03-36.02 | It thaws out and comes back to life. | the ice melts, the heart kicks in, eyes pop open: BACK TO LIFE | cut |
| s17 | 36.02-38.72 | And it hops off to a pond to breed... | hop, hop, hop to a pond with another wood frog; hearts | whipBlur |
| s18 | 38.72-40.39 | like winter never happened. | PAYOFF close-up: grin + wink, WINTER? WHAT WINTER? | cut |
| s19 | 40.39-42.18 | Subscribe for more. | closer: winter again, lands on frame 1 framing (loop) | whipBlur |

Insert cards: s07 vitals monitor (NO HEARTBEAT / NO BREATHING / NO BLOOD FLOW), s11 cell diagram (sugar inside the cells, ice only between them), s13 counter "FROZEN FOR UP TO 218 DAYS".
Music: kit bed `toon3d:curious` (-21 dB, ducked by mix.py). SFX: kit library, cued on words (story/shots.json).

## Tone check
No gore, nothing hurt (the frog is cute, frozen and fine), no realistic photos, no real logos, no channel name on screen.
