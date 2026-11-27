# The Greenland shark may live around 400 years — script & shot list (Justin clips, Toon 3D + BEANMEN effects)

**EMOTION:** WTF nature fact, calm and comic (immortal-jellyfish style: one cute hero animal, reveals, reactions, insert cards).
**LINE 1:** "This shark may live around 400 years." (7 words, the WTF first; "may" = it is an estimate)
**TOP CAPTION (frame 1 → 3.5 s, 2 lines, centre-top):** "this **SHARK** may live" (gold) / "around **400 YEARS**" (red)
**Frame 1:** the big, slow Greenland shark glides toward us under the Arctic ice, light shafts and drifting specks. Already moving.

**Slug:** `greenland-shark` · YouTube Short, 9:16, 1080×1920, 24 fps · **40.8 s** (target 40–48)
**Voice:** Chatterbox "D2" (built-in voice, exaggeration 0.3, cfg 0.3) via `whatif/voice/chatterbox_d2.py --gap 0.3 --comma 0.15 --lead 0.15 --beat 0.7`
(raw take 41.45 s, every line passed Whisper small.en QA, seed 7) → `projects/greenland-shark/tighten_vo.py 1.0`
(no speed-up: the raw take was already short; pauses capped at 0.32 s, 0.2 s gaps, held beats before lines 2–6 and 8–11) → 40.58 s of voice.
Numbers are spoken as words ("four hundred", "twenty sixteen", "three hundred ninety-two", "one hundred twenty", "one hundred fifty"); captions and cards show digits.

## Narration (exact VO, 112 words, 11 lines)
1. This shark may live around 400 years.                                   *(hook)*
2. Meet the Greenland shark, cruising the cold, dark North Atlantic and Arctic.
3. But how do you find out a shark's age? You look inside its eyes.         *("But" 7.0 s)*
4. A 2016 study carbon-dated the lenses in sharks' eyes.
5. The biggest one, five meters long, came out at about 392 years.         *(counter card 0 → 392)*
6. Give or take 120 years... and it's still the longest-living vertebrate known.
7. It grows less than one centimeter a year.
8. And it isn't ready to have babies until it's about 150.                 *("And" turn 26.7 s; card 150 YEARS)*
9. But it gets stranger: it cruises slower than you walk.                  *("But" 31.2 s; versus card)*
10. So the oldest one they found was likely born before the United States existed.   *(payoff, timeline card, 36.7–38.7 s)*
11. Subscribe for more.                                                     *(1.5 s; loops to frame 1)*

## Shots (18; times from `make_shots.py`, which anchors every cut on a spoken word)
| # | t (s) | Scene | FX / transition |
|---|---|---|---|
| s01 | 0.00–1.20 | The shark glides at us under the ice (frame 1) | 2-line top caption, ice light shafts |
| s02 | 1.20–2.62 | Close on its face: a slow smug blink | flash cut, sparkle on "years" |
| s03 | 2.62–4.32 | Side-on glide | whipBlur, chip GREENLAND SHARK |
| s04 | 4.32–7.00 | Deeper, darker water | chips COLD + DARK, N. ATLANTIC + ARCTIC |
| s05 | 7.00–8.98 | "???" over the shark | stamp AGE = ? |
| s06 | 8.98–10.52 | Push into its eye → cartoon eye card, lens ringed | THE LENS |
| s07 | 10.52–14.49 | Lab: a scientist holds up a glowing lens, the ¹⁴C machine → hard cut to the lens | iris, stamp 2016, chip CARBON DATING, glow |
| s08 | 14.49–16.96 | The shark lies along a measuring tape on the sea floor | stamp 5 METERS |
| s09 | 16.96–19.72 | **INSERT** counter ESTIMATED AGE 0 → 392 YEARS | flash, ticks, success |
| s10 | 19.72–21.90 | The shark wobbles | stamp ± 120 YEARS, sweat |
| s11 | 21.90–24.90 | Winner's podium, crown → hard cut closer on "vertebrate" | spotlight, sparkle, stamp #1 LONGEST-LIVING / VERTEBRATE KNOWN |
| s12 | 24.90–26.68 | A growth ruler by its nose; YEAR counter ticks, the bar barely moves | stamp < 1 cm A YEAR |
| s13 | 26.68–31.22 | Chip READY FOR BABIES AT... → **INSERT** "GROWN-UP AT ABOUT 150 YEARS" | impact, chime |
| s14 | 31.22–32.63 | It drifts so slowly it nods off | zzz, stamp STRANGER... |
| s15 | 32.63–34.54 | **INSERT** versus: SHARK ≈ 1.2 km/h vs YOU WALKING ≈ 4–6 km/h | flash |
| s16 | 34.54–36.74 | The old-timer in reading glasses | iris, chip THE OLDEST ONE |
| s17 | 36.74–39.24 | **INSERT** timeline: born 1500s–1700s · 1776 USA founded · 2016 age estimated | flash on "existed" |
| s18 | 39.24–40.78 | Back in open water, pulls back to frame 1's exact camera and pose | hearts → loops into s01 |

Insert cards: s09 (392), s13 (150 YEARS), s15 (speeds), s17 (timeline) + the eye card (s06). Music: kit bed `toon3d:mystery` (-20 dB, ducked by mix.py).
Captions: burned 1–3 word chunks from `input/script.txt` (digits), y = 0.72, gold on the key words.

## TONE GUARD — checked
- Nothing hurt or eaten. The eye parasite and the toxic-meat facts were left out on purpose.
- All Toon 3D, no realistic images, no logos, no flags, no channel name. The lab scientist is the kit's generic cast bean.
