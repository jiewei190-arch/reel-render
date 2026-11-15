# EMOTION: WOW
# Immortal Jellyfish v2: "jail break" re-cut (Justin clips, Toon 3D + BEANMEN effects, Chatterbox D2)
Rules: IAWAKEN_PLAYBOOK.md "JUSTIN CLIPS: BREAK THE VIEW JAIL". Target ~22 s; actual 22.25 s. v1 is untouched in `../immortal-jellyfish/`.

**TRIPLE HOOK (0-3.25 s):**
- VISUAL: frame 1 is the jellyfish mid-dive, SMACKING the big red RESET button at 0.25 s (flash, shake, !, ripples), then it starts to melt. No calm float, no title card.
- VERBAL: line 1 is "This jellyfish can't die of old age." (7 words, no setup).
- TEXT: one top caption, "it just turns back / into a BABY", huge, in the top ~10% of the frame, up for 0-3.25 s. It is separate from the word captions at 70 %.

**Cut from v1** (does not build to WOW): "Ever.", "transdifferentiation" (now only a stamp on screen, s07), the butterfly comparison, "the catch?" pause shot, "no brain", "Subscribe for more."
The closer was dropped because Chatterbox says it in ~1.2 s, over the 1 s limit, and it would break the loop.
**Payoff (last 2 s):** "Immortal, but also... LUNCH." The LUNCH card is on screen at 21.45 s. The last frame hard-cuts into frame 1 (the RESET smack), so the loop reads "...lunch." -> SMACK "This jellyfish can't die of old age."

Voice: Chatterbox D2 (exaggeration 0.3, cfg 0.3), `--gap 0.25 --comma 0.15 --lead 0.1`. Every part passed Whisper small.en QA (seed 7; "lunch" seed 11). There is a held beat before "lunch".

| t (s) | Narration (spoken) | Shot | FX / transition |
|---|---|---|---|
| 0.0 | This jellyfish can't die of old age. | s01 FRAME 1: RESET smack + starts melting; top hook caption | flash, shake, !, ripples, impact + zap |
| 2.6 | Injured, | s02 a pebble bonks it | whipBlur; stars, flash, shake |
| 3.25 | or starving? | s03 empty plate, frown | sweat, ???, rumble |
| 4.2 | It doesn't die. It hits reset. | s04 wink, dives onto RESET | whipBlur; flash, !, shake |
| 6.65 | It melts into a blob, sinks, | s05 melts, sinks | dissolve; sweat, ripples |
| 8.8 | and turns back into a baby. | s06 poof -> polyp with a pacifier | flash + sparkle, hearts |
| 10.45 | Then grows up again. And again. | s07 mini jellies bud off (x1 x2 x3); stamp TRANSDIFFERENTIATION | whipBlur; stamp, pops |
| 12.7 | It's smaller than your pinky nail, | s08 giant pinky; chips "≈ 4.5 mm", "Turritopsis dohrnii" | whipBlur; ding |
| 14.45 | and in theory, it can do this forever. | s09 infinity loop of jellies: "in theory..." -> "FOREVER ∞" | dissolve; sparkle, glow |
| 17.05 | The catch? Fish and turtles eat it. | s10 ??? -> fish + turtle in bibs queue at a LUNCH sign (nothing is eaten) | whipBlur; hearts, !, sweat |
| 19.5 | Immortal, but also... | s11 halo pose, spotlight, chip IMMORTAL | sparkle, bell |
| 21.45 | lunch. | s12 INSERT "BUT ALSO... LUNCH. / for fish and turtles" -> hard cut to frame 1 | flash, impact |

Facts and sources: unchanged from v1 (`../immortal-jellyfish/sources.md`). "In theory" is kept; "fish and turtles" is the NHM's wording.
