# Peter the Great's Beard Tax — script & shot list

**EMOTION: LOL**
**LINE 1:** "Russia once made you pay to keep your beard."
**CAPTION (top, frame 1 → 3.6 s):** "and carry a beard token as proof"

**Slug:** `beard-tax` · YouTube Short, 9:16, 1080×1920, 24 fps · **Runtime:** 21.03 s (target ~22 s) · Toon 3D + BEANMEN FX
**Voice:** Chatterbox "D2" (exaggeration 0.3, cfg 0.3) via `whatif/voice/chatterbox_d2.py --gap 0.25 --lead 0.1 --beat 0.45`; all 8 lines passed Whisper QA on seed 7.
Years are spelled out for the TTS only; captions keep digits ("1698").

## Jail-break checklist
- [x] Triple hook in the first 2 s: frame 1 = giant barber scissors snapping at a terrified bearded man, mid-chase (already moving) · VO line 1 word for word, no setup (0.00–1.86 s) · top caption from frame 1 for 3.6 s, top ~9–14 % of the frame, separate from the 1–3-word captions at 72 %.
- [x] One emotion (LOL): every line is a joke beat or the setup for one. Cut: Catherine the Great repeal, rates by class, the Henry VIII story.
- [x] No padding: 8 VO lines, 21.0 s.
- [x] New shot every 0.9–2.7 s (12 shots), faster cuts at the reveal (s08–s11 ≈ 1 s each). Payoff in the last 2 s before the closer; "Subscribe for more." = 0.94 s, over the barber creeping back in with the scissors → hard cut to frame 1 (loop).
- [x] No tax amounts on screen. Nobody hurt: the scissors snap at air.

## Narration (exact VO)
1. Russia once made you pay to keep your beard.  *(0.00–1.86)*
2. In 1698, Peter the Great wanted Russia to look modern.  *(2.40–5.46)*
3. So beards got taxed.  *(6.06–8.08)*
4. Pay up, and you got a beard token.  *(8.36–10.54)*
5. Patrols checked faces in the street.  *(11.34–12.74)*
6. One token even says... "The beard is a useless burden."  *(13.32–16.50, held beat before the quote)*
7. The British Museum still has the tokens.  *(17.02–18.86, PAYOFF)*
8. Subscribe for more.  *(19.60–20.54)*

## Shots
| # | t (s) | Scene | FX / transition |
|---|---|---|---|
| s01 | 0.00–2.30 | Old-Moscow street: a barber chases a terrified bearded man, giant scissors snapping behind his head | top caption, speed lines, sweat, "!", camera shake |
| s02 | 2.30–3.62 | Low angle: Peter the Great strides in | whipBlur, red "1698" stamp |
| s03 | 3.62–5.90 | Peter points at two bearded men; they freeze | cut, "!", sweat |
| s04 | 5.90–8.28 | Three bearded men smug → red "BEARD TAX" stamp slams on "taxed" | flash, shake |
| s05 | 8.28–10.95 | Coins rain into an official's chest; a token flies into the man's hand, he beams | iris, sparkle, stars |
| s06 | 10.95–13.15 | A patrol halts a bearded man mid-step; he flashes the token | whipBlur, "!", "?" |
| s07 | 13.15–14.95 | The later diamond token ("БОРОДА ЛИШНЯЯ ТЯГОТА") spins into a close-up | zoom, glow, sparkle |
| s08 | 14.95–15.98 | Card: the later diamond token, "THE BEARD IS / A USELESS / BURDEN" | flash (word captions hidden) |
| s09 | 15.98–16.95 | Reaction: a hugely bearded man, deadpan → offended, hugs his beard | cut, sweat |
| s10 | 16.95–17.95 | A grand columned museum front | whipBlur |
| s11 | 17.95–19.45 | The token in a lit glass case; a bearded visitor with heart eyes | cut, sparkle, heart eyes |
| s12 | 19.45–21.03 | The visitor turns, smug; the barber leans in, scissors snap | "!", hard cut → s01 (loop) |

## Tone guards
Comedy only. The scissors never touch anyone; nobody is shaved or hurt on screen. No tax amounts shown. Peter the Great and the Russians are original toon characters, not likenesses.
