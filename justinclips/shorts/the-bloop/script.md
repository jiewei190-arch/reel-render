# The Bloop — script & shot list

**EMOTION:** WTF → LOL (deadpan narrator, the jokes are in the pictures)
**Slug:** `the-bloop` · YouTube Short, 9:16, 1080×1920, 24 fps · **43.8 s** (target 40–48) · Toon 3D + BEANMEN FX
**Voice:** Chatterbox "D2" (built-in voice, exaggeration 0.3, cfg 0.3) via `whatif/voice/chatterbox_d2.py` → `input/voiceover_raw.wav`,
tightened by `tighten_vo.py 1.06` (pauses capped 0.3 s, held "..." beats kept at 0.5 s, beats before lines 6/8/9/11) → 43.6 s of voice + tail.
Numbers are spelled out in `input/voice_script.md` for the TTS ("NOAA" respelled "Noah" for pronunciation); captions use `input/script.txt`.
**Signature sound:** an ORIGINAL synthesized low sweep (`make_sfx.py`: a 34→70 Hz rumble with harmonics so phones can play it) from 0.0 s,
and again full-size on "...this." (7.9 s). A short synthesized "bloop" chirp on "bloop" (15.5 s). No recordings of the real sound.

**LINE 1 (10 words, WTF first):** "In 1997, the ocean made a noise nobody could explain."
**TOP CAPTION (frame 1 → 3.5 s, 2 lines, centre-top):** "1997: the **OCEAN** made a" / "noise **NOBODY** could explain" (OCEAN gold, NOBODY red)
**Frame 1 (signature gag):** deep dark water, a toon sea monster looming with glowing eyes and a toothy grin, sound rings pulsing out of it
while the sweep rumbles; a little orange fish does a double take ("!"). Already moving.
**Loop:** s22 dollies back to frame 1's camera over the iceberg; s23 (closer) holds that camera and the monster pops back into the
iceberg's place → cut to s01.

## Recipe (from the Russian Woodpecker)
- WTF true-story hook in ≤ 12 words · signature sound + visual in the first 2 s (the sweep + the monster)
- mystery (where? what? louder than a whale? a monster?) → **"But here's the part..."** (29.2 s) → reveal (an icequake)
- payoff in the last ~2.8 s before the closer: "The monster... was ice." → "Subscribe for more." (1.5 s) → loop

## Narration (exact VO, 113 words)
1. In 1997, the ocean made a noise nobody could explain.
2. Underwater microphones were listening for volcanoes in the Pacific. Instead, they caught... this.
3. Ultra-low, extremely loud, and about a minute long.
4. Sped up 16 times so humans could hear it, it went... bloop.
5. Sensors about 3,000 miles apart picked it up, from the remote South Pacific.
6. Reportedly, it was far louder than a blue whale, the loudest known animal.
7. So people guessed: a giant sea creature nobody had ever seen.
8. But here's the part... in 2005, NOAA found the source.
9. Not a sea monster. An icequake.
10. An iceberg, cracking and breaking away from an Antarctic glacier. The monster... was ice.
11. Subscribe for more.

Escalations: 3.9 s (hydrophones) · 6.8 s (the sound slams the mic) · 12.4 s (×16 → "bloop") · 16.7 s (3,000 miles) · 20.9 s (louder than a
whale) · 26.4 s (the monster) · 29.2 s "But here's the part..." · 33.4 s (the tentacles drop off) · 36.9 s (CRACK!) · 39.5 s (payoff).

## Visual gags (each one shows a real fact)
1. **Monster, then not**: the toon sea monster (what people guessed) drops its tentacles like a costume — underneath is an iceberg with two crack "eyes" (NOAA: it was an icequake).
2. **Hydrophone = underwater mic**: a toon microphone pod on a cable; fish swim past; a tiny volcano burps bubbles (it was listening for volcanic activity).
3. **The sound hits**: giant rings slam the hydrophone, it rattles, the fish flee on "...this."
4. **×16 fast-forward**: the scientist hits fast-forward on a tape machine (►► ×16), then a deadpan beat and one bubble pops out: BLOOP (sped up 16× to be audible, it sounded like "bloop").
5. **The whale gets out-shouted**: a proud blue whale sings a tiny ring; giant BLOOP rings roll over it; it sweats, eyes pop (reportedly far louder than a blue whale).
6. **??? ??? ???**: three scientists thinking at once (people guessed).
7. **Penguins**: a crack runs down the glacier front; three penguins double-take, then hop when the chunk crashes in (an iceberg breaking off an Antarctic glacier).
Silence beats: "it went... bloop." (0.5 s deadpan before the bloop) and "But here's the part..." (slow push on the monster in the dark).

## Insert cards (big numbers)
s06 oscilloscope "ULTRA-LOW / EXTREMELY LOUD" · s10–s11 Pacific map "~3,000 MILES", the X "BLOOP", "REMOTE SOUTH PACIFIC".

## Shots (23; timed by make_shots.py from the word timings)
| # | t (s) | Narration | Picture | In |
|---|---|---|---|---|
| s01 | 0.00-2.48 | In 1997, the ocean made a noise | FRAME 1: the monster looms, rings pulse, fish double take + top caption | – |
| s02 | 2.48-3.90 | nobody could explain. | scientist with headphones shrugs, ??? | cut |
| s03 | 3.90-5.48 | Underwater microphones were listening for | hydrophone on its cable, fish | iris |
| s04 | 5.48-6.82 | volcanoes in the Pacific. | tiny volcano burping bubbles | whipBlur |
| s05 | 6.82-8.66 | Instead, they caught... this. | giant rings slam the hydrophone, fish flee | cut |
| s06 | 8.66-10.94 | Ultra-low, extremely loud, | INSERT: oscilloscope wave grows huge | flash |
| s07 | 10.94-12.42 | and about a minute long. | clock dial sweeps, ~1 MINUTE | cut |
| s08 | 12.42-14.87 | Sped up 16 times so humans could hear it, | tape machine fast-forward, ►► ×16 | whipBlur |
| s09 | 14.87-16.68 | it went... bloop. | deadpan scientist, bubble pops: BLOOP | cut |
| s10 | 16.68-18.98 | Sensors about 3,000 miles apart picked it up, | INSERT: Pacific map, two sensors, ~3,000 MILES | iris |
| s11 | 18.98-20.92 | from the remote South Pacific. | map zooms to the X: REMOTE SOUTH PACIFIC | cut |
| s12 | 20.92-23.36 | Reportedly, it was far louder than a blue whale, the | blue whale sings a small ring | whipBlur |
| s13 | 23.36-24.68 | loudest known animal. | giant rings dwarf it; sweat | cut |
| s14 | 24.68-26.42 | So people guessed: a | three scientists, ??? ??? ??? | cut |
| s15 | 26.42-29.14 | giant sea creature nobody had ever seen. | THE MONSTER, low angle, flash | flash |
| s16 | 29.14-30.80 | But here's the part... | slow push on the monster in the dark (beat) | iris |
| s17 | 30.80-33.40 | in 2005, NOAA found the source. | scientist finds it: 2005, "!" | cut |
| s18 | 33.40-34.46 | Not a sea monster. | the tentacles drop off: an iceberg; NOT A SEA MONSTER | whipBlur |
| s19 | 34.46-35.28 | An icequake. | the iceberg shakes, crack: ICEQUAKE | cut |
| s20 | 35.28-36.90 | An iceberg, cracking and | Antarctica: crack down the glacier, penguins double take | iris |
| s21 | 36.90-39.50 | breaking away from an Antarctic glacier. | the chunk crashes in: CRACK!, splash, penguins hop | cut |
| s22 | 39.50-42.32 | The monster... was ice. | PAYOFF: the iceberg where the monster was: THE MONSTER = ICE | whipBlur |
| s23 | 42.32-43.82 | Subscribe for more. | closer: frame 1's camera, the monster pops back → loop | cut |

## Tone guard
Generic toon people only; no real logos (NOAA is only spoken, never shown as a logo); no channel name. Nobody is hurt; the whale and the
penguins only react. The sea monster is clearly the guess that turned out wrong.
