# The Mantis Shrimp Punch — script & shot list

**EMOTION:** WTF nature fact (same lane as "Immortal Jellyfish")
**LINE 1:** "This shrimp punches so fast, the water around it briefly boils." (11 words, WTF first)
**CAPTION (top, frame 1 → 3.5 s, 2 lines, centre-top):** "this shrimp's **PUNCH**" (gold) / "makes water **BOIL**" (red)
**Frame 1:** the peacock mantis shrimp is already jabbing an empty spiral shell, vapour bubbles fizzing on its club, speed lines.

**Slug:** `mantis-shrimp-punch` · YouTube Short, 9:16, 1080×1920, 24 fps · **42.3 s** (target 40–48) · Toon 3D + BEANMEN effects
**Voice:** Chatterbox "D2" (exaggeration 0.3, cfg 0.3) via `whatif/voice/chatterbox_d2.py --gap 0.2 --lead 0.05 --beat 0.4`
(raw 44.76 s, all 11 lines Whisper-QA OK; kept as `input/voiceover_raw.wav`) → `tighten_vo.py` (atempo 1.03, pauses ≤ 0.32 s,
0.2 s gaps, held beats before lines 5, 8, 10) → 41.98 s of voice + 0.32 s end hold.
Numbers are digits in the script/captions ("83") and spelled out by the TTS ("eighty-three").

## Narration (exact VO, 128 words)
1. This shrimp punches so fast, the water around it briefly boils.                    *(hook)*
2. Meet the peacock mantis shrimp. Small, but it hits with thousands of times its body weight.
3. Its club fires at 83 kilometers per hour.
4. Scientists compare it to a bullet fired from a handgun.
5. But here's the weird part. The strike is so fast, the pressure around it crashes.   *("But..." ~13.9 s)*
6. The water turns into vapor bubbles. Like boiling, but from pressure, not heat.
7. Then the bubbles collapse... and hit the target a second time. One punch, two hits.
8. But it gets stranger. The collapsing bubbles give off a tiny flash of light.        *("But..." ~28.1 s)*
9. Snail shells crack like eggs. And the biggest ones can even break aquarium glass.
10. So whatever you do... never tap on its tank.                                        *(payoff, 39.1–40.4 s)*
11. Subscribe for more.                                                                  *(closer 41.1–41.9 s, < 1.5 s)*

Escalations: hook 0 s → "thousands of times" 6.2 s → "83 km/h" 9.0 s → "But" 13.9 s → "vapor" 19.1 s → "second time" 25.7 s → "But" 28.1 s → "glass" 35.9 s → payoff 39.2 s.
Loop: s22 pulls back to exactly frame 1's camera with the shrimp jabbing the same shell, so the hard cut back to s01 loops.

## Shots (22; hard camera cuts inside s08, s10, s12, s17, s19 → a cut every ~1.0–2.4 s)
| # | t (s) | Scene | FX / transition |
|---|---|---|---|
| s01 | 0.00–1.74 | FRAME 1: shrimp jabbing an empty shell, bubbles on each jab | top caption, speed lines, flash, shake |
| s02 | 1.74–3.56 | Close on the club: fizzing bubbles, big puff on "boils" | caption held to 3.5 s, flash, "!" |
| s03 | 3.56–5.16 | Beauty orbit | whipBlur; chips PEACOCK / mantis shrimp, sparkle + glow |
| s04 | 5.16–6.18 | Small shrimp, club flexes on "hits" | "small..." chip, flash |
| s05 | 6.18–8.02 | **INSERT 1** IMPACT FORCE "1000s ×" its own body weight | flash in, impact |
| s06 | 8.02–8.98 | Side close-up, club snaps out | whipBlur; speed lines, shake |
| s07 | 8.98–11.00 | **INSERT 2** counter CLUB SPEED "83 km/h" | impact, tick |
| s08 | 11.00–13.82 | A toy cartridge (no gun) races the club → cut to a low front angle | "≈ like a bullet", speed lines, "!" |
| s09 | 13.82–15.12 | Stalk eyes swivel to us | iris; "???" |
| s10 | 15.12–18.16 | Slow-mo strike → cut; pressure gauge needle drops on "crashes" | SLOW-MO tag, riser, drop |
| s11 | 18.16–20.08 | The bubble cloud blooms around the club | CAVITATION stamp, sparkle |
| s12 | 20.08–22.86 | Bubble cloud → cut closer | "like boiling..." / PRESSURE ✓ / heat ✗ |
| s13 | 22.86–24.74 | Slow-mo: the cloud collapses | dissolve; sweat |
| s14 | 24.74–26.48 | Empty shell: HIT 1 (club) then HIT 2 (bubble collapse) | flash ×2, shake ×2, stars |
| s15 | 26.48–28.04 | **INSERT 3** ONE PUNCH "2 HITS" club + collapsing bubbles | impact |
| s16 | 28.04–29.28 | Dark water, spotlight, sly look | iris; sparkle |
| s17 | 29.28–32.40 | Dark water → cut close: a tiny bright flash where the bubbles die | glow, sparkle, "LIGHT!" |
| s18 | 32.40–34.08 | An EMPTY shell shatters | whipBlur; "(empty shell)", flash, stars |
| s19 | 34.08–36.90 | Through the tank glass → cut; it punches the glass, a crack spreads | whipBlur; flash, "!", glass sfx |
| s20 | 36.90–39.14 | A giant finger moves toward the tank; the shrimp narrows its eyes | "???" |
| s21 | 39.14–41.04 | "DON'T TAP!" — it punches, the finger snaps back (untouched) | stamp, "!", flash |
| s22 | 41.04–42.30 | Back on the reef, pull out to frame 1's camera | dissolve; hearts → loops to s01 |

Insert cards: s05 (1000s ×), s07 (83 km/h), s15 (2 HITS); captions are hidden on those three shots.
Captions (burned, 1–3 words, from the VO); gold words: punches, boils, peacock, thousands, 83, bullet, weird, vapor, boiling, pressure, second, two, light, stranger, crack, glass, never, tank.

## TONE GUARD — checked
- Nothing alive is hit: it smashes empty spiral shells (labelled "(empty shell)") and the tank glass. No fish, crab or snail on screen.
- The finger is never hit: it pulls back before the strike lands on the glass.
- The bullet is a toy cartridge shape racing the club; no gun is shown.
