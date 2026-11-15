# Oregon's Exploding Whale (1970): script & shot list

**EMOTION: LOL**
**LINE 1:** "In 1970, Oregon blew up a whale."
**CAPTION (top, frame 1 → 3.7 s):** "with half a ton of dynamite"

**Slug:** `exploding-whale` · YouTube Short, 9:16, 1080×1920, 24 fps · **Runtime:** 25.81 s (target ~24 s ±3) · Toon 3D + BEANMEN FX
**Voice:** Chatterbox "D2" (exaggeration 0.3, cfg 0.3) via `whatif/voice/chatterbox_d2.py --gap 0.2 --lead 0.05 --beat 0.4`; all 7 lines passed Whisper QA on seed 7 (per-line data in `projects/exploding-whale/input/voiceover.lines.json`). Years/numbers are spelled out for the TTS only; captions keep digits.

## Jail-break checklist
- [x] Triple hook in the first 2 s: frame 1 = the KA-BOOM itself, fireball + blubber chunks already flying (camera shaking) · VO line 1 word for word, no setup (0.00–2.30 s) · top caption from frame 1 for 3.7 s, top ~8–14 % of the frame, separate from the 1–3-word captions at 72 %.
- [x] One emotion (LOL). Cut from the owner's 31 s draft: "eight tons / removed boulders", seagulls line, "blown up everything except the whale". The "already dead" fact moved to on-screen text (s02) to save 3 s of VO.
- [x] No padding: 7 VO lines, 25.8 s.
- [x] New shot every 1.05–2.5 s (15 shots), fastest at the blast/reveal (s10–s11 ≈ 1.1–1.35 s). Payoff "Exploding Whale Memorial Park." in the last 2 s; "Subscribe for more." dropped so the park sign cuts straight back into the KA-BOOM (loop).
- [x] Nobody hurt on screen: the crew and reporter duck and are fine, the car is empty, the whale is already dead (closed cartoon eyes, "(it was already dead)" text). Blubber = pale cream/grey toon blobs, no red, no gore, no realistic photos.

## Narration (exact VO)
1. In 1970, Oregon blew up a whale.  *(0.00–2.30)*
2. An explosives guy said 20 sticks would do it.  *(2.76–5.02)*
3. They used... 20 cases.  *(5.36–7.44, held beat)*
4. The news said the blast blasted blubber beyond all believable bounds.  *(8.00–11.92, the real 1970 KATU line)*
5. One chunk reportedly flew a quarter mile... and crushed a brand new car.  *(12.56–16.94)*
6. Most of the whale... was still there.  *(17.48–19.42)*
7. Oregon now buries whales. And named a park after this one... Exploding Whale Memorial Park.  *(19.88–25.34, PAYOFF)*

## Shots
| # | t (s) | Scene | FX / transition |
|---|---|---|---|
| s01 | 0.00–1.50 | KA-BOOM: fireball, smoke, blubber chunks raining over the beach | flash, camera shake, KA-BOOM burst, "1970" stamp, top caption |
| s02 | 1.50–2.70 | ◀◀ REWIND → the dead whale on the sand, stink lines, gulls circling, two hard-hats holding their noses | "(it was already dead)" |
| s03 | 2.70–5.20 | The explosives veteran holds up a small bundle of sticks | whipBlur, green "20 STICKS" stamp |
| s04 | 5.20–6.70 | The crew, hands on hips, beaming next to one crate (held beat) | cut, sparkle |
| s05 | 6.70–7.95 | 20 DYNAMITE crates rain down into a stack by the whale; the veteran facepalms | flash, red "20 CASES" stamp, "(about half a ton)" |
| s06 | 7.95–9.30 | 1970 TV reporter + tripod news camera | whipBlur, NEWS lower third |
| s07 | 9.30–10.65 | The blast from behind the news camera; chunks rain; the reporter ducks (unhurt) | flash, shake |
| q07 | 10.65–12.45 | Retro TV card: "...the blast blasted blubber beyond all believable bounds." | zoom (word captions hidden) |
| s08 | 12.45–14.95 | One slab sails across the sky; distance counter 0 → 1,320 FT ≈ ¼ MILE | whipBlur, dotted trail |
| s09 | 14.95–17.35 | Shiny NEW! sedan in the lot; the slab lands, the roof caves in (empty car) | flash, CRUNCH!, shake, stars |
| s10 | 17.35–18.40 | Smoke hangs over the beach; the crew peers in | dip |
| s11 | 18.40–19.75 | Smoke gone: the whale, basically intact. Crew turns to camera, deadpan; a hard hat slides off | "?", sweat |
| s12 | 19.75–21.40 | A sand mound with whale flukes sticking out; a crew member pats it with a shovel | iris |
| s13 | 21.40–23.75 | Riverside park: the sign pops up, a family waves | whipBlur, hearts |
| s14 | 23.75–25.81 | PAYOFF: the "EXPLODING WHALE MEMORIAL PARK" sign → hard cut to s01 (loop) | sparkle |

## Tone guards
Comedy only on the plan, the dynamite and the result. No real footage, photos or likenesses (Paul Linnman and the crew are not depicted as likenesses; the reporter is a generic toon). The news card quotes the broadcast's line, attributed as "1970 NEWS".
