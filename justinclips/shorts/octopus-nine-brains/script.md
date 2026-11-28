# The Octopus Has 9 Brains and Blue Blood — script & shot list

**Style:** the "Immortal Jellyfish" nature-fact style (Toon 3D + BEANMEN effects, sunlit sea + deep-water hook, chips/stamps/inserts).
**Slug:** `octopus-nine-brains` · YouTube Short, 9:16, 1080×1920, 24 fps · **41.98 s** (target 40–48)
**Voice:** Chatterbox "D2" (built-in voice, exaggeration 0.3, cfg 0.3) via `whatif/voice/chatterbox_d2.py` → `input/voiceover_raw.wav`
(line 9 re-taken with "But" added and spliced in), tightened by `projects/octopus-nine-brains/tighten_vo.py` (atempo 1.0, pauses capped 0.32 s,
0.2 s gaps, held beats before lines 3, 5, 7, 10, 11) → 41.76 s of voice + 0.5 s tail.

**LINE 1:** "This animal has 9 brains, 3 hearts, and blue blood." (10 words, the WTF up front)
**TOP CAPTION (frame 1 → 3.5 s, 2 lines, centre-top):** "9 **BRAINS**. 3 **HEARTS**." (BRAINS gold, HEARTS red) / "and **BLUE** blood"
**Frame 1:** the octopus is already mid-swim in deep blue water, arms rippling, sparkle; the caption pops in on frame 1.
**Loop:** s21 ends on frame 1's exact camera and pose in the same deep-water set, so the cut back to s01 loops.

## Narration (exact VO, 122 words; TTS says the digits as words, captions show digits)
1. This animal has 9 brains, 3 hearts, and blue blood.
2. The octopus has around 500 million neurons, about as many as a dog.
3. But two thirds of them aren't in its head. They're in its arms.
4. Each arm has its own mini brain. It can taste, touch and move on its own.
5. But the main brain can still step in and take control.
6. 3 hearts: two pump blood past the gills, one pumps it around the body.
7. But when it swims, that body heart goes quiet.
8. And the blood is blue, because it carries oxygen with copper, not iron.
9. But in cold water with little oxygen, copper actually works better.
10. 9 brains, 3 hearts, blue blood... and zero bones.
11. Subscribe for more.

"But..." turns: lines 3 (8.7 s), 5 (16.9 s), 7 (23.4 s), 9 (30.3 s); payoff line 10 "...and zero bones." lands at ~38.6–40.2 s, then the closer "Subscribe for more." (1.23 s).

## Shots (21; s12, s18 and s19 also hard-cut inside the shot)
| # | t (s) | Narration | Picture | In |
|---|---|---|---|---|
| s01 | 0.00-1.42 | This animal has 9 brains, | FRAME 1: octopus mid-swim in deep water + 2-line top caption | cut |
| s02 | 1.42-3.82 | 3 hearts, and blue blood. | x-ray: 3 hearts pumping, blue glow | flash |
| s03 | 3.82-5.06 | The octopus has around | sunlit reef, OCTOPUS chip | whipBlur |
| s04 | 5.06-6.94 | 500 million neurons, | INSERT 1: counter 500,000,000 neurons (x-ray octopus behind) | cut |
| s05 | 6.94-8.62 | about as many as a dog. | dog in a bubble helmet drifts in, brain icons, the "≈" chip | whipBlur |
| s06 | 8.62-10.78 | But two thirds of them aren't in its head. | x-ray: head neurons dim, NOT HERE | whipBlur |
| s07 | 10.78-12.10 | They're in its arms. | arms light up gold, IN THE ARMS | flash |
| s08 | 12.10-14.12 | Each arm has its own mini brain. | 8 mini brains light up, +8 MINI BRAINS, 1 + 8 = 9 | whipBlur |
| s09 | 14.12-15.60 | It can taste, touch and | arm tastes a clam, another taps a fish | cut |
| s10 | 15.60-16.80 | move on its own. | one arm waves on its own, ??? | whipBlur |
| s11 | 16.80-18.84 | But the main brain can still step in and take control. | crown pops on, arms snap into sync, IN CONTROL | iris |
| s12 | 18.84-21.68 | 3 hearts: two pump blood past the gills, | x-ray mantle: gill hearts pump, GILLS chips | whipBlur |
| s13 | 21.68-23.28 | one pumps it around the body. | body heart pumps, blue blood loops round | cut |
| s14 | 23.28-24.50 | But when it swims, | jet swim across the frame, speed lines | whipBlur |
| s15 | 24.50-25.74 | that body heart goes quiet. | x-ray: the body heart greys and stops, PAUSED, zzz | cut |
| s16 | 25.74-27.38 | And the blood is blue, | test tube of glowing blue blood, BLUE BLOOD | iris |
| s17 | 27.38-30.24 | because it carries oxygen with copper, not iron. | INSERT 2: COPPER (not iron, like ours) | cut |
| s18 | 30.24-33.92 | But in cold water with little oxygen, copper actually works better. | icy deep water: COLD / LITTLE OXYGEN, cut to close-up on "copper", COPPER WINS | whipBlur |
| s19 | 33.92-38.20 | 9 brains, 3 hearts, blue blood... | recap: 9 BRAINS / 3 HEARTS / BLUE BLOOD, hard cut per beat | flash |
| s20 | 38.20-40.42 | and zero bones. | PAYOFF: it squeezes through a tiny hole in a rock, 0 BONES | whipBlur |
| s21 | 40.42-41.98 | Subscribe for more. | closer: back to frame 1 framing (loop) | cut |

Insert cards: s04 counter "500,000,000 NEURONS", s17 bigtext "COPPER — not iron, like ours". Reaction FX after each reveal (sparkle, exclaim, ???, zzz, flash, shake).
Music: kit bed `toon3d:curious` (-21 dB, ducked by mix.py). SFX: kit library, cued on words (story/shots.json).

## Tone check
No gore, nobody hurt (the "severed arm" fact was left out on purpose), no realistic photos, no real logos, no channel name on screen.
