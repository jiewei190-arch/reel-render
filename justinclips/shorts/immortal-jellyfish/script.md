# Immortal Jellyfish: The Animal That Never Dies of Old Age (Justin clips, Toon 3D + BEANMEN effects)
Voice: **Chatterbox D2** (owner's pick: built-in voice, exaggeration 0.3, cfg 0.3) via `whatif/voice/chatterbox_d2.py --gap 0.3 --comma 0.15 --lead 0.15`, deadpan.
Voice script: `projects/immortal-jellyfish/input/voice_script.md` = the owner's 8 lines with MAIN's edits ("the immortal jellyfish" spoken, the Latin name only on a chip; no "only animal" claim)
+ "9. Subscribe for more.". **Fact fix:** line 7 "Everything eats it" -> "Fish and turtles eat it" (that is what the NHM says; see STATUS.md).
Held 0.7 s beats ("...") before "lunch" and after "It cheats old age". No years or numbers are spoken. Every part passed Whisper small.en QA (seed 7; "lunch" seed 11).
Captions (1-3 words, y = 0.70) come from `input/script.txt`; gold: OLD AGE, EVER, INJURED, STARVING, RESET BUTTON, BABY, TRANSDIFFERENTIATION, FOREVER, LUNCH, brain.

| # | t (s) | Narration (spoken) | Shot | FX / transition |
|---|---|---|---|---|
| 1 | 0.0 | There's a jellyfish that refuses to die of old age. | s01 FRAME 1: glowing jelly with a halo in dark water, already swimming; hook "THE JELLYFISH THAT CAN'T DIE OF OLD AGE" | sparkle, riser, ding |
| 1 | 3.15 | Ever. | s02 close-up, smug wink | flash; sparkle |
| 2 | 3.9 | When the immortal jellyfish gets injured, | s03 sunny sea, chip "Turritopsis dohrnii"; a pebble bonks it | whipBlur; stars + flash + shake, boing/thud |
| 2 | 5.92 | or starts starving, | s04 empty plate, frown | sweat, ???, stomach rumble |
| 2 | 6.95 | it doesn't die. It hits the reset button. | s05 winks, dives onto a big red RESET button | flash, "!", shake, ripples, impact/zap |
| 3 | 9.5 | It melts into a blob, sinks to the seafloor, | s06 melts into a blob, sinks in slow motion | dissolve; sweat, ripples on landing |
| 3 | 12.3 | and transforms back into a baby. | s07 poof: blob -> polyp with a pacifier | flash + sparkle (magic), hearts |
| 4 | 14.25 | Then it grows up again. And again. And again. | s08 mini jellies bud off one per word (x1 x2 x3) | whipBlur; sparkle + pop per bud |
| 4 | 17.25 | It's called transdifferentiation. | s09 life-cycle wheel (adult > blob > baby) spinning faster; stamp TRANSDIFFERENTIATION | whipBlur; speedlines, stamp |
| 5 | 19.4 | Imagine a butterfly turning back into a caterpillar every time life got hard. | s10 sunny meadow (sunny preset + god rays): party-hat butterfly -> caterpillar, tiny rain cloud | iris; flash + sparkle, sweat, rain |
| 6 | 23.85 | It's smaller than your pinky nail, | s11 giant pinky on the sand, jelly over the nail, chip "≈ 4.5 mm" | whipBlur; ding |
| 6 | 25.65 | and in theory, it can do this forever. | s12 INSERT-style: jellies swimming an infinity loop, "in theory..." -> "FOREVER ∞" | dissolve; sparkle + glow, success |
| 7 | 28.15 | The catch? | s13 content jelly with halo -> ??? | boing |
| 7 | 29.2 | Fish and turtles eat it. | s14 fish + turtle in bibs queue at a LUNCH sign; jelly sweats (nothing is eaten) | whipBlur; hearts on the fish, "!" + sweat + shake |
| 7 | 30.5 | Immortal, but also... | s15 jelly poses with its halo, spotlight, chip "IMMORTAL" | sparkle, bell |
| 7 | 32.65 | lunch. | s16 INSERT bigtext "BUT ALSO... LUNCH. / for fish and turtles" | flash cut on the punchline, impact |
| 8 | 33.7 | It cheats old age... | s17 halo back, sly look, stamp "OLD AGE ✗" | iris; sparkle, stamp |
| 8 | 35.75 | and it doesn't even have a brain. | s18 brain scanner: monitor "NO BRAIN FOUND", it shrugs | whipBlur; flash, ???, fail |
| 9 | 38.25 | Subscribe for more. | s19 back in the dark water, pulls out to the frame-1 framing | hearts; hard cut -> loops to frame 1 |

Insert cards: s12 (FOREVER), s16 (LUNCH, kit `insertShot` bigtext) + the TRANSDIFFERENTIATION stamp. Music: kit bed `toon3d:curious` (-21 dB, ducked by mix.py).
