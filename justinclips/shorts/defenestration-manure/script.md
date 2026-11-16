# The Defenestration of Prague (1618): script & shot list

**EMOTION: LOL**
**LINE 1:** "Three men got thrown out of a castle window." (9 words, but the brief's own hook; wide framing, no "defenestration" jargon)
**CAPTION (top, frame 1 → start of s03, ~2.5 s; adds story, opens the loop the payoff closes):** "and one of them got / a noble title for it"

**Slug:** `defenestration-manure` · YouTube Short, 9:16, 1080×1920, 24 fps · **Runtime:** 28.04 s · Toon 3D + BEANMEN FX (kit: origin/iawaken/toon3d-fx)
**Voice:** Chatterbox "D2" deadpan (exaggeration 0.3, cfg 0.3), seed 7 (line 7a seed 11). 9 of 10 lines pass Whisper QA. Line 10 is a false alarm (Whisper writes "Barron" for "Baron"; the final-mix transcript reads "Baron of High Fall"). Script source = `project/lines.json`. Shot timing is derived from the voice (`project/story/shots.plan.json`), so swapping the voice is one command (see STATUS.md).

## Jail-break checklist (playbook "BREAK THE VIEW JAIL" + "vidIQ ESCAPE EVERY VIEW JAIL")
- [x] Triple hook in the first 2 s: frame 1 = three officials already tumbling through the air past the castle wall, papers flying, speed lines · VO line 1 states the claim · top caption "and one of them got a noble title for it" adds story from frame 1 for ~2.5 s.
- [x] Wide way in: "thrown out of a castle window" (no "defenestration", no "Bohemian estates"). One premise: weird true history.
- [x] One emotion (LOL), deadpan. Cut: the Thirty Years' War (true, but it breaks the emotion and the tone guard), the names of the regents.
- [x] No padding: 10 lines, 28.0 s, 16 shots, a cut every 1.12–2.76 s.
- [x] Ends abruptly on the payoff ("Baron of High Fall."). No CTA, no subscribe, no end card. The last frame hard-cuts back into frame 1 (the fall that earned him the title).
- [x] Hedges kept: "About 70 feet" (sources say 16–21 m) · "Catholics said..." · "Later pamphlets said..." + "Historians think that part was probably made up" (the dung-heap account is hedged twice, on screen too: "PAMPHLET VERSION", "(printed later)", "PROBABLY MADE UP").
- [x] Tone guards: nobody is shown hurt. The fall cuts away mid-air, the landings are soft (angels, a squashy cartoon heap), and the survivors sit up dazed but fine. No gore, no realistic photos, no likenesses, original characters, kit music/SFX only.

## Narration (exact VO, times from the current voice)
1. Three men got thrown out of a castle window.  *(0.05–2.34)*
2. Prague, 1618. Angry nobles stormed the castle.  *(2.54–6.52)*
3. They grabbed two royal governors and their secretary... and out they went.  *(6.72–11.00)*
4. About 70 feet down.  *(11.20–12.92)*
5. All three survived.  *(13.12–14.38)*
6. Catholics said angels caught them.  *(14.59–16.30)*
7. Later pamphlets said... they landed in a pile of manure.  *(16.50–19.84)*
8. Historians think that part was probably made up.  *(20.04–22.59)*
9. But the secretary got a noble title... Baron von Hohenfall.  *(22.79–26.27)*
10. Baron of High Fall.  *(26.47–27.79)*

## Shots (times from the current voice; source of truth = story/shots.plan.json anchors)
| # | t (s) | VO | in |
|---|---|---|---|
| s01 | 0.00–1.12 | Three men got thrown out | cut |
| s02 | 1.12–2.54 | of a castle window. | cut |
| s03 | 2.54–4.72 | Prague, 1618. | whipBlur |
| s04 | 4.72–6.72 | Angry nobles stormed the castle. | cut |
| s05 | 6.72–8.08 | They grabbed two royal governors | cut |
| q05 | 8.08–9.84 | and their secretary... | cut |
| s06 | 9.84–11.20 | and out they went. | flash |
| s07 | 11.20–13.12 | About 70 feet down. | cut |
| s08 | 13.12–14.59 | All three survived. | dip |
| s09 | 14.59–16.50 | Catholics said angels caught them. | flash |
| s10 | 16.50–17.96 | Later pamphlets said... | zoom |
| s11 | 17.96–20.04 | they landed in a pile of manure. | cut |
| s12 | 20.04–22.79 | Historians think that part was probably made up. | iris |
| s13 | 22.79–25.25 | But the secretary got a noble title... | whipBlur |
| s14 | 25.25–26.47 | Baron von Hohenfall. | cut |
| s15 | 26.47–28.04 | Baron of High Fall. | cut |

Runtime 28.04 s, 16 shots, shot lengths 1.12–2.76 s.
