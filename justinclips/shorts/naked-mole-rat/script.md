# The naked mole-rat barely ages — script & shot list (Justin clips, Toon 3D + BEANMEN effects)

**EMOTION:** WTF nature fact, warm and comic (immortal-jellyfish style: one cute hero animal, reveals, reactions, insert cards).
**LINE 1:** "This rodent barely ages... and almost never gets cancer." (9 words, the WTF first)
**TOP CAPTION (frame 1 → 3.5 s, 2 lines, centre-top):** "it barely **AGES**" (gold) / "almost never gets **CANCER**" (red)
**Frame 1:** the mole-rat in a party hat bops behind its "30+" birthday cake in the nest chamber; candles flicker, confetti falls. Already moving.

**Slug:** `naked-mole-rat` · YouTube Short, 9:16, 1080×1920, 24 fps · **42.8 s** (target 40–48)
**Voice:** Chatterbox "D2" (built-in voice, exaggeration 0.3, cfg 0.3) via `whatif/voice/chatterbox_d2.py --gap 0.3 --comma 0.15 --lead 0.15 --beat 0.7`
(raw take 46.67 s, every line passed Whisper small.en QA; seed 7 everywhere, "in us." seed 11) → `projects/naked-mole-rat/tighten_vo.py 1.04`
(pauses capped at 0.32 s, atempo 1.04 with pitch kept, 0.2 s gaps, held beats before lines 4, 6, 8, 10, 11) → 42.58 s of voice + 0.2 s tail.
Numbers are spoken as words ("thirty", "eighteen", by chatterbox_d2.py's speller); captions and cards show digits (30, 18).

## Narration (exact VO, 119 words, 11 lines)
1. This rodent barely ages... and almost never gets cancer.            *(hook, WTF first)*
2. Meet the naked mole-rat: pink, wrinkly, nearly hairless, and all teeth.
3. A house mouse this size lives four years, tops. This one? Over 30.   *(insert card 30+ YEARS)*
4. But here's the crazy part: its risk of dying doesn't go up with age. *("But" 13.4 s; chart card)*
5. And big colonies watched for years? Not a single case of cancer.     *(insert card 0)*
6. But it gets weirder. They live like ants, with one queen in charge. *("But" 21.2 s)*
7. Only the queen has babies. The rest dig tunnels, guard, and babysit.
8. And when the air runs out? It survives 18 minutes with zero oxygen.   *("And..." turn 28.7 s; counter card 0 → 18)*
9. Its body switches to burning fructose, a sugar, instead.
10. Scientists now study it for clues to aging... in us.                *(payoff "in us" at 40.2–41.3 s)*
11. Subscribe for more.                                                  *(1.5 s; loops to frame 1)*

## Shots (21; times from `make_shots.py`, which anchors every cut on a spoken word)
| # | t (s) | Scene | FX / transition |
|---|---|---|---|
| s01 | 0.00–2.28 | Birthday chamber: party hat, "30+" cake, confetti (frame 1) | 2-line top caption, sparkle, riser |
| s02 | 2.28–3.98 | Closer: it blows the candles out | exclaim + sparkle on "cancer" |
| s03 | 3.98–7.62 | It trots up the tunnel → hard cut to a side close-up on "nearly" | chip NAKED MOLE-RAT, stamps PINK / WRINKLY / NEARLY HAIRLESS |
| s04 | 7.62–8.55 | Teeth close-up, teeth chatter | flash cut, shake, stamp ALL TEETH |
| s05 | 8.55–11.32 | A house mouse beside it | chips HOUSE MOUSE, ≈ 4 YEARS MAX; sweat |
| s06 | 11.32–13.36 | **INSERT** over the blurred cake: "30+ YEARS / the longest-lived rodent" | flash, impact, success |
| s07 | 13.36–14.88 | It sprints in a hamster wheel | speedlines, stamp THE CRAZY PART |
| s08 | 14.88–17.16 | **INSERT** chart RISK OF DYING vs AGE: most mammals climb, mole-rat flat | stamp FLAT! |
| s09 | 17.16–19.44 | Lab: scientist with clipboard at a glass colony tank | iris; chip YEAR 1 → 5 |
| s10 | 19.44–21.24 | **INSERT** "CANCER CASES FOUND 0 / in years of watching"; scientist arms up | flash |
| s11 | 21.24–23.74 | One mole-rat "???" → hard cut to the whole colony cross-section (ant farm) | stamp LIKE ANTS |
| s12 | 23.74–25.18 | Push into the nest chamber: the queen with a crown | spotlight, sparkle, stamp THE QUEEN |
| s13 | 25.18–26.66 | The queen with her pups | hearts, chip ONLY SHE BREEDS |
| s14 | 26.66–28.66 | 3 cuts on the words: DIG (dirt flies) / GUARD ("!") / BABYSIT (pups asleep) | chips per beat |
| s15 | 28.66–30.73 | O₂ dial drains to 0 %, red pulse; it looks up | sweat, alarm |
| s16 | 30.73–33.20 | **INSERT** counter 0 → 18 MINUTES "with ZERO oxygen"; it naps calmly | zzz, ticks |
| s17 | 33.20–36.04 | A lever flips from O₂ to FRUCTOSE; it perks up | flash, "!", zap |
| s18 | 36.04–38.20 | Its belly glows warm | chip FRUCTOSE = a sugar, sparkle |
| s19 | 38.20–40.18 | Scientist + magnifier studies a mole-rat on the bench | iris, stamp CLUES TO AGING |
| s20 | 40.18–41.30 | Payoff: both look to camera | flash cut, stamp IN US, sparkle |
| s21 | 41.30–42.80 | Back at the cake, pulls back to frame 1's exact camera | hearts → loops into s01 |

Insert cards: s06 (30+ YEARS), s08 (risk chart), s10 (0 cancer cases), s16 (18 MINUTES). Music: kit bed `toon3d:curious` (-20 dB, ducked by mix.py).
Captions: burned 1–3 word chunks from `input/script.txt` (digits), y = 0.72, gold on the key words.

## TONE GUARD — checked
- No gore, nobody hurt. "Zero oxygen" is shown as a calm nap with a counter (Wikipedia: it loses consciousness), no struggle.
- Nothing realistic: all Toon 3D. No logos, no channel name on screen. The lab scientist is the kit's generic cast bean.
