# Mike the Headless Chicken (1945–47): script & shot list

**EMOTION: WTF → LOL**
**LINE 1:** "This chicken lived 18 months without a head."
**CAPTION (top, frame 1 → 3.6 s):** "and went on tour"

**Slug:** `mike-headless-chicken` · YouTube Short, 9:16, 1080×1920, 24 fps · **Runtime:** 26.41 s (target ~24 s ±3) · Toon 3D + BEANMEN FX
**Voice:** Chatterbox "D2" (exaggeration 0.3, cfg 0.3) via `whatif/voice/chatterbox_d2.py --gap 0.2 --lead 0.05 --beat 0.4`; all 7 lines pass Whisper QA (seed 7; seed 11 for "and most of the brainstem." and "and Mike choked."; the festival line is a seed-11 re-take with the TTS-only spelling "Fru-ta" so the F carries in the mix, after seed 7 misheard "joked"/"brain's"). Per-line data in `project/input/voiceover.lines.json`. "brainstem" is written as one word so Whisper QA can match it.

## Jail-break checklist
- [x] Triple hook in the first 2 s: frame 1 = headless Mike strutting confidently across a little stage under a spotlight, crowd gasping (already moving) · VO line 1 word for word (0.00–2.28 s) · top caption from frame 1 for 3.6 s, top ~8–14 % of the frame, separate from the 1–3-word captions at 72 %.
- [x] One emotion (WTF → LOL): every beat is "wait, what?" turning into a laugh. Cut from the owner's 31 s draft: the beer bets, "scientists say he could have lived for years", the "logistics fail" closer.
- [x] No padding: 7 VO lines, 26.4 s.
- [x] New shot every 1.3–2.2 s (15 shots), with the reveal beats split (x-ray ×2, "kept walking" ×2, motel ×2). Payoff "festival every year" in the last 2 s with an EVERY YEAR stamp; "Subscribe for more." dropped so the statue hard-cuts back to Mike on stage (loop).
- [x] NO blood, NO gore, no wound: Mike's neck is a clean, round, feathered stump with a cream bandage collar (and a red bow tie on stage). The farmer only holds the axe up in s02; it never swings or touches anything. The x-ray is a line diagram (no head drawn). "Choked" is said once and never shown: the bedside lamp clicks off.

## Narration (exact VO)
1. This chicken lived 18 months without a head.  *(0.00–2.28)*
2. In 1945, a farmer's axe missed the jugular... and most of the brainstem.  *(2.72–7.52)*
3. So Mike just... kept walking.  *(8.14–10.50)*
4. He toured as Miracle Mike. 25 cents a look. He even made Life magazine.  *(11.06–15.58)*
5. He ate from an eyedropper.  *(16.18–17.16)*
6. Then one night, they misplaced the eyedropper... and Mike choked.  *(17.78–22.90)*
7. Fruita, Colorado still throws him a festival every year.  *(23.17–26.02, PAYOFF)*

## Shots
| # | t (s) | Scene | FX / transition |
|---|---|---|---|
| s01 | 0.00–2.55 | Mike struts across a little stage under a spotlight; the crowd gasps | top caption, sparkle, "!" |
| s02 | 2.55–4.55 | 1945 farmyard: the farmer holds an axe up (never swung); nervous hens | whipBlur, "1945" stamp, sweat |
| s03 | 4.55–6.40 | Cartoon x-ray: the dashed axe line runs above the jugular → "JUGULAR: MISSED ✓" | flash |
| s03b | 6.40–7.95 | Same x-ray, gold ring on the brain stem → "BRAIN STEM: MOSTLY THERE ✓" | zoom |
| s04 | 7.95–9.25 | Mike (bandage collar) stands very still. "?" | cut, held beat |
| s04b | 9.25–10.85 | ...and struts off past the stunned farmer and the DINNER sign | "!", sweat |
| s05 | 10.85–12.55 | On stage under the MIRACLE MIKE banner, Mike bows | iris, stars, hearts |
| s06 | 12.55–14.00 | Sideshow poster "SEE THE HEADLESS CHICKEN!" + "25¢ A LOOK" | whipBlur, flashbulb |
| s07 | 14.00–16.05 | A generic 1945 news-magazine spread (no real logo) slides in; flashbulbs | camera clicks |
| s08 | 16.05–17.65 | Close-up: the eyedropper drips milk into the collar; Mike wiggles happily | dip, hearts |
| s09 | 17.65–19.15 | Motel room at night: the farmer pats his pockets | dip, "?" |
| s09b | 19.15–20.75 | Close on the empty bedside table under the lamp. Big "?" | cut |
| s10 | 20.75–22.95 | The farmer, sad; the lamp clicks off on "choked" (nothing shown) | darken |
| s11 | 22.95–24.85 | Sunny festival: bunting, HEADLESS CHICKEN FEST banner, a toon Mike statue, people in chicken hats, confetti | iris open |
| s12 | 24.85–26.41 | PAYOFF: the statue + green "EVERY YEAR" stamp → hard cut to s01 (loop) | stars |

## Tone guards
Cartoon only. Mike is an original toon. The farmer and the crowds are generic toons, not likenesses of the Olsen family. The magazine is generic (no Life logo or layout copied). The real festival's metal statue isn't copied either: the statue is a grey version of our own toon Mike.
