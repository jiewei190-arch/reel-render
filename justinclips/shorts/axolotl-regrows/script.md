# The Axolotl Regrows — script & shot list

**EMOTION:** WTF nature fact → bittersweet twist (same lane as "Immortal Jellyfish")
**LINE 1:** "This salamander regrows its legs, its heart, even parts of its brain." (12 words, WTF first)
**CAPTION (top, frame 1 → 3.5 s, 2 lines, centre-top):** "it regrows its **HEART**" (gold) / "and parts of its **BRAIN**" (red)
**Frame 1:** a pink axolotl smiling at us while its front leg is already regrowing (sparkles, a dotted outline fading as the leg fills in).

**Slug:** `axolotl-regrows` · YouTube Short, 9:16, 1080×1920, 24 fps · **41.55 s** (target 40–48) · Toon 3D + BEANMEN effects
**Voice:** Chatterbox "D2" (exaggeration 0.3, cfg 0.3) via `whatif/voice/chatterbox_d2.py --gap 0.2 --lead 0.05 --beat 0.4`
(raw 41.89 s, all 11 lines Whisper-QA OK) → `tighten_vo.py` (no speed-up, pauses ≤ 0.32 s, 0.2 s gaps, held beats before lines 5, 6, 8, 10)
→ 41.20 s of voice + 0.35 s end hold. Numbers are digits in captions ("50", "1,000") and spelled out by the TTS.

## Narration (exact VO, 123 words)
1. This salamander regrows its legs, its heart, even parts of its brain.            *(hook)*
2. Meet the axolotl, the salamander that never grows up.
3. It keeps its larval body for life, frilly gills and all.
4. Lose a leg? A new one grows back within months.
5. But that's just the start. Its tail, its spinal cord, even parts of its heart grow back, without scars.   *("But" 14.4 s)*
6. But here's the wild part. It can rebuild parts of its brain.                         *("But" 20.7 s)*
7. Scientists study it, hoping humans could one day heal like this.
8. But in the wild, the axolotl is critically endangered.                              *("But" 27.3 s)*
9. It's down to a few canals near Mexico City, with maybe 50 to 1,000 adults left.
10. It can regrow parts of its brain... but not its home.                              *(payoff, 36.6–39.6 s)*
11. Subscribe for more.                                                                 *(closer 39.98–41.1 s, < 1.5 s)*

Escalations: hook 0 s → leg gone 11.5 s → "But" 14.4 s → "But" 20.7 s → "But" 27.3 s → 50–1,000 33.7 s → payoff 38.8 s.
Loop: s23 pulls back to frame 1's exact camera and the front leg goes "poof" just before the end, so the cut to frame 1 (the leg regrowing) loops.

## Shots (24; one hard camera cut inside s12 and s19)
| # | t (s) | Scene | FX / transition |
|---|---|---|---|
| s01 | 0.00–2.38 | FRAME 1: leg regrowing, smiling at us | top caption, sparkles, dotted outline fades |
| s02 | 2.38–3.28 | X-ray side view: the heart fills and beats | flash in; x-ray tint, heartbeat |
| s03 | 3.28–4.88 | X-ray: the brain fills in | sparkle, "!" |
| s04 | 4.88–6.36 | Beauty orbit | whipBlur; AXOLOTL + "ACK-suh-LAH-tuhl" chips |
| s05 | 6.36–8.06 | A pacifier pops in on "never grows up" | flash, hearts |
| s06 | 8.06–10.00 | Swims by in profile | dissolve; LARVAL FOR LIFE stamp |
| s07 | 10.00–11.14 | The frilly gills | EXTERNAL GILLS chip |
| s08 | 11.14–12.00 | "Lose a leg?" — poof, a dotted outline | whipBlur; "???" |
| s09 | 12.00–14.38 | A calendar flips months; the leg regrows | sparkle, success |
| s10 | 14.38–15.92 | Smug look | iris; spotlight |
| s11 | 15.92–17.96 | Top view: the tail regrows, the spinal cord lights up head → tail | whipBlur; x-ray, zap |
| s12 | 17.96–20.68 | Heart x-ray → cut to the front | NO SCARS ✓ |
| s13 | 20.68–22.00 | Dark water, spotlight | iris; "!" |
| s14 | 22.00–24.20 | **INSERT 1** IT CAN REBUILD "ITS BRAIN" (parts of it) | flash, impact |
| s15 | 24.20–25.16 | A giant magnifying glass sweeps over it | whipBlur; STUDIED IN LABS |
| s16 | 25.16–27.24 | A human finger beside it (unhurt) | "one day... humans?", sparkle, "?" |
| s17 | 27.24–28.52 | Above water: a canal between green banks | iris; IN THE WILD |
| s18 | 28.52–30.64 | **INSERT 2** IN THE WILD: CRITICALLY "ENDANGERED" (IUCN Red List) | flash, impact |
| s19 | 30.64–33.10 | Canal from above → cut low along the water | XOCHIMILCO canals / near MEXICO CITY |
| s20 | 33.10–35.10 | **INSERT 3** LEFT IN THE WILD "50 – 1,000" adults | flash, impact |
| s20b | 35.10–36.54 | One lone axolotl in murky water | sweat |
| s21 | 36.54–38.74 | Back under water, a little brain icon above it | dissolve; sparkle |
| s22 | 38.74–39.92 | PAYOFF: the canal's water strip shrinks and dulls | "...but not its home" |
| s23 | 39.92–41.55 | Pull back to frame 1's camera; the leg goes poof | dissolve; hearts → loops to s01 |

Captions are hidden on the three insert cards. Gold words: regrows, heart, brain, axolotl, larval, gills, leg, months, tail, spinal, scars, wild, scientists, heal, critically, endangered, 50, 1000, home.

## TONE GUARD — checked
- No injury shown: the leg simply goes "poof" to a dotted outline and regrows. No blood, no wound, no bandage.
- The human finger is just there beside it; nothing happens to it.
- The endangered part is said plainly; no dead animals shown (s20b: one axolotl alone, alive).
