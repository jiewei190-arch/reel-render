# Tulip Mania (1630s): script & shot list

**EMOTION: LOL**
**LINE 1:** "A flower once cost more than a house." (7 words, the widest framing: everyone knows what a house costs)
**CAPTION (top, frame 1 → start of s03, ~2.4 s; adds story):** "it was still a bulb / in the dirt"

**Slug:** `tulip-mania` · YouTube Short, 9:16, 1080×1920, 24 fps · **Runtime:** 29.58 s · Toon 3D + BEANMEN FX (kit: origin/iawaken/toon3d-fx)
**Voice:** Chatterbox "D2" deadpan (exaggeration 0.3, cfg 0.3), seed 7, all 8 lines passed Whisper QA (`project/input/voiceover.lines.json`). Script source = `project/lines.json`. Shot timing is derived from the voice (`project/story/shots.plan.json` anchors every cut to a line/word), so swapping the voice is one command (see STATUS.md).

## Jail-break checklist (playbook "BREAK THE VIEW JAIL" + "vidIQ ESCAPE EVERY VIEW JAIL")
- [x] Triple hook in the first 2 s: frame 1 = a flame-striped tulip SLAMMING a giant balance scale down while a whole canal house flies up on the other pan, coins bursting, camera shaking (already moving at frame 0) · VO line 1 states the claim, no setup · top caption "it was still a bulb in the dirt" adds story from frame 1 for ~2.4 s.
- [x] Wide way in: "a flower / a house". No niche terms (no "Semper Augustus" in VO). One premise: weird true history.
- [x] One emotion (LOL), deadpan. Cut: the sailor-eats-a-bulb anecdote (debunked), Mackay, the Haarlem auction details.
- [x] No padding: 8 lines, 29.6 s. A cut every 1.19–2.51 s (18 shots).
- [x] Ends abruptly on the payoff ("...couldn't find anyone who went bankrupt" + "0 BANKRUPT" stamp). No CTA, no subscribe, no end card. Last frame hard-cuts back into frame 1 (the scale), so the loop reads as "...and yet a flower cost more than a house".
- [x] Hedges kept: "reportedly" (VO + on-screen) on the 10,000 guilders. The payoff carries the brief's required hedge (recent historians say the crash was less dramatic) and names the historian (Anne Goldgar) on screen.
- [x] Tone guards: nobody is ruined or hurt on screen. The crash is a falling chart and flying papers. The virus is a cute toon ("harmless to people"). No realistic photos, no likenesses, original characters, kit music/SFX only.

## Narration (exact VO, times from the current voice)
1. A flower once cost more than a house.  *(0.05–2.23)*
2. Holland, the 1630s. Everyone wanted tulips.  *(2.43–6.01)*
3. The rarest ones had wild flame stripes... caused by a virus.  *(6.21–10.36)*
4. People traded bulbs still in the ground... on paper... in taverns.  *(10.56–15.25)*
5. One bulb reportedly sold for 10,000 guilders.  *(15.45–18.25)*
6. A craftsman made about 300 a year.  *(18.45–20.71)*
7. Then, in February 1637... the market crashed.  *(20.91–24.67)*
8. But a historian who checked the records... couldn't find anyone who went bankrupt.  *(24.87–29.33)*

## Shots (times from the current voice; source of truth = story/shots.plan.json anchors)
| # | t (s) | VO | in |
|---|---|---|---|
| s01 | 0.00–1.24 | A flower once cost more than | cut |
| s02 | 1.24–2.43 | a house. | cut |
| s03 | 2.43–4.44 | Holland, the 1630s. | whipBlur |
| s04 | 4.44–6.21 | Everyone wanted tulips. | cut |
| s05 | 6.21–7.60 | The rarest ones had wild flame stripes... | flash |
| q05 | 7.60–9.16 | flame stripes... | cut |
| s06 | 9.16–10.56 | caused by a virus. | cut |
| s07 | 10.56–13.02 | People traded bulbs still in the ground... | whipBlur |
| s08 | 13.02–14.24 | on paper... | zoom |
| s09 | 14.24–15.45 | in taverns. | cut |
| s10 | 15.45–16.75 | One bulb reportedly sold for | iris |
| q10 | 16.75–18.45 | 10,000 guilders. | flash |
| s11 | 18.45–20.91 | A craftsman made about 300 a year. | whipBlur |
| s12 | 20.91–23.42 | Then, in February 1637... | dip |
| s13 | 23.42–24.87 | the market crashed. | flash |
| s14 | 24.87–26.64 | But a historian who checked the records... | iris |
| s15 | 26.64–28.30 | couldn't find anyone who | cut |
| s16 | 28.30–29.58 | went bankrupt. | cut |

Runtime 29.58 s, 18 shots, shot lengths 1.19–2.51 s.
