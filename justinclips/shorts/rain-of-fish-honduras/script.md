# The Rain of Fish (Yoro, Honduras) — script & shot list

**EMOTION:** WTF
**LINE 1:** "Residents of this Honduran town say it rains fish. Every year." (11 words; the card's long first line, shortened, same idea + "say" framing)
**CAPTION (top, frame 1 → s01 end ~3.9 s):** "THEY SAY IT RAINS FISH" / "EVERY YEAR" (2 lines, "EVERY YEAR" gold)
**Frame 1:** residents under umbrellas on a flooded street, rain falling, fish scattered on the ground (card's frame 1). Already moving.

**Slug:** `rain-of-fish-honduras` · YouTube Short, 9:16, 1080×1920, 24 fps · **42.06 s** (target 40–48) · Toon 3D + BEANMEN effects
**Voice:** Chatterbox "D2" (built-in voice, exaggeration 0.3, cfg 0.3) via `whatif/voice/chatterbox_d2.py` (`tts_script.md`),
then `projects/rain-of-fish-honduras/tighten_vo.py 1.03` (pauses capped at 0.3 s, atempo 1.03 pitch kept, +0.15 s beat before
line 3, +0.3 s before line 7 "But…", +0.2 s before line 11). Raw 44.5 s take kept as `input/voiceover_raw.wav`.
TTS respelling: "Yuvia de Pesses" for *Lluvia de Peces* (Chatterbox otherwise read the Spanish as English). Captions keep the real spelling and digits.

## Narration (exact VO, 136 words)
1. Residents of this Honduran town say it rains fish. Every year.            *(hook)*
2. It's Yoro. Locals call it the Lluvia de Peces, the rain of fish.
3. In the mid-year rainy season, a big storm rolls in...
4. and when it clears, there are fish lying on the ground.
5. Residents say it's happened for over a hundred years.
6. Since 1998, there's even a yearly festival for it, with a parade.
7. But here's the strange part. The fish don't appear to fall from the sky.   *("But…" turn, line 7)*
8. One theory is waterspouts. But the nearest ocean is about 45 miles away.
9. Another: fish from a nearby river live underground, and heavy rains wash them up.
10. And a local legend says a priest prayed to feed the poor... and fish fell.  *(clearly labelled LEGEND)*
11. Nobody has confirmed how they get there. So Yoro waits for the next storm.  *(payoff → loops to frame 1)*

Loop: s12 is the same street, crowd and umbrellas as s01; the storm rolls in and the camera ends on frame 1's opening framing.

## Shots (cuts every ~2–4 s; s01/s04/s06/s07 have a hard camera punch-in inside the shot; s02/s05/s08/s09/s10 pop a card mid-shot)
| # | t (s) | Scene | FX |
|---|---|---|---|
| s01 | 0.00–3.89 | Flooded street, rain, 5 residents under umbrellas, fish on the ground; punch-in at "Every" | top caption, "!", rain |
| s02 | 3.89–7.69 | High wide of the town street + white church | "YORO, HONDURAS" stamp → card "LOCALS CALL IT / LLUVIA DE PECES / the rain of fish" |
| s03 | 7.69–10.61 | Low angle: three residents look up as the sky darkens | "RAINY SEASON" stamp, lightning flash, rain starts |
| s04 | 10.61–13.47 | Sun back, wet street: a woman crouches, a kid points at the fish; punch-in on a fish | "!", "ON THE GROUND" stamp |
| s05 | 13.47–16.03 | An older resident by his porch nods, a neighbour smiles | card "RESIDENTS SAY / 100+ YEARS" |
| s06 | 16.03–20.32 | Festival parade: bunting, a big paper fish carried on poles, kids cheering; punch-in | "SINCE 1998", "FESTIVAL", confetti |
| s07 | 20.32–23.78 | Same crowd as s01 looks up into the rain; low punch-in at the sky (only rain) | "THE STRANGE PART", "?", "NO FISH UP THERE?" |
| s08 | 23.78–28.24 | Map card: waterspout over the Atlantic, dashed route to YORO | "~45 MILES" |
| s09 | 28.24–32.55 | Cross-section card: river → underground water → rains push fish up | rain, yellow arrow |
| s10 | 32.55–37.56 | Storybook "THE LEGEND" card: a priest kneeling in prayer, dark cloud, fish fall (legend only) | "LEGEND" stamp, sepia |
| s11 | 37.56–39.68 | Two residents shrug over the fish | "UNCONFIRMED" stamp, sweat |
| s12 | 39.68–42.06 | PAYOFF: same umbrellas crowd as frame 1 looks up; storm arrives; camera lands on frame 1's framing | "NEXT STORM...", thunder flash |

## Captions (burned, 1–3 words, from the VO; gold on fish / Yoro / Peces / storm / ground / hundred / 1998 / festival / sky / waterspouts / 45 / underground / legend / confirmed)

## TONE / FRAMING GUARD — checked
- Every claim is "residents say", "locals", "one theory", "another", "a legend", "nobody has confirmed" (card framing kept).
- In present-day shots the fish are only ever on the ground; the only fish falling from the sky are inside the labelled LEGEND card.
- Residents are drawn in everyday clothes with varied skin tones and hair, no costume or caricature; the priest is a respectful
  kneeling silhouette. No flags, no logos.
