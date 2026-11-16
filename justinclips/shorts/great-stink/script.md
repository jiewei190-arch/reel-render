# The Great Stink (London, 1858): script & shot list

**EMOTION: LOL**
**LINE 1:** "London stank so bad, Parliament had to act." (8 words; the widest framing, everyone knows a bad smell)
**CAPTION (top, frame 1 → start of s03, ~3.1 s; adds story):** "they literally named it / The Great Stink"

**Slug:** `great-stink` · YouTube Short, 9:16, 1080×1920, 24 fps · **Runtime:** 26.83 s · Toon 3D + BEANMEN FX (kit: origin/iawaken/toon3d-fx)
**Voice:** Chatterbox "D2" deadpan (exaggeration 0.3, cfg 0.3), all 9 lines pass Whisper QA (`project/input/voiceover.lines.json`). Line 5 was re-worded from "...curtains in chemicals" to "...curtains with chemicals" because all three seeds were heard as "curtains and chemicals". Script source = `project/lines.json`. Shot timing is derived from the voice (`project/story/shots.plan.json`), so swapping the voice is one command (see STATUS.md).

## Jail-break checklist (playbook "BREAK THE VIEW JAIL" + "vidIQ ESCAPE EVERY VIEW JAIL")
- [x] Triple hook in the first 2 s: frame 1 = MPs in the green-benched chamber with clothespins on their noses, fanning themselves, stink lines rising, green haze, camera jittering (already moving) · VO line 1 states the claim · top caption "they literally named it The Great Stink" adds story from frame 1 for ~3 s.
- [x] Wide way in: a smell so bad the government had to act. No "Metropolis Local Management Amendment Act" in VO. One premise: weird true history.
- [x] One emotion (LOL), deadpan (brief: "Comedic: stink lines, clothespins on noses"). Cut: cholera/miasma (death and disease would break the emotion), the 1,100 miles of street sewers.
- [x] No padding: 9 lines, 26.8 s, 15 shots, a cut every 1.11–2.68 s.
- [x] Ends abruptly on the payoff ("London still uses them today." + "STILL IN USE" stamp in the same brick tunnel). No CTA, no end card. The last frame hard-cuts back into frame 1 (the stinking chamber).
- [x] Hedges/fact fixes: "about seven weeks" (15 June → 2 Aug 1858, per Wikipedia; NOT the "18 days" some sites repeat) · "82 miles" = main sewers, labelled so on screen · "(it didn't help much)" is on-screen comedy, not a measured claim.
- [x] Tone guards: no illness or bodies, nobody hurt. Sewage is a cartoon brown outflow. No realistic photos or likenesses (the engineer is a generic toon, and the parliament is stylised, not a replica). Original characters, kit music/SFX only.

## Narration (exact VO, times from the current voice)
1. London stank so bad, Parliament had to act.  *(0.05–2.89)*
2. Summer 1858. A heatwave hit the Thames.  *(3.09–6.55)*
3. And the Thames... was full of London's sewage.  *(6.75–10.02)*
4. Parliament sits right on the river.  *(10.22–12.13)*
5. So they soaked the curtains with chemicals.  *(12.33–14.60)*
6. They even talked about moving Parliament out of London.  *(14.80–17.19)*
7. Instead, they passed a new sewer law in about seven weeks.  *(17.39–20.38)*
8. Engineer Joseph Bazalgette built 82 miles of giant sewers.  *(20.58–24.70)*
9. London still uses them today.  *(24.90–26.58)*

## Shots (times from the current voice; source of truth = story/shots.plan.json anchors)
| # | t (s) | VO | in |
|---|---|---|---|
| s01 | 0.00–1.62 | London stank so bad, | cut |
| s02 | 1.62–3.09 | Parliament had to act. | cut |
| s03 | 3.09–4.98 | Summer 1858. | whipBlur |
| s04 | 4.98–6.75 | A heatwave hit the Thames. | cut |
| s05 | 6.75–7.86 | And the Thames... | dip |
| s06 | 7.86–10.22 | was full of London's sewage. | cut |
| s07 | 10.22–12.33 | Parliament sits right on the river. | whipBlur |
| s08 | 12.33–14.01 | So they soaked the curtains with chemicals. | cut |
| s09 | 14.01–15.28 | (it didn't help much) | cut |
| s10 | 15.28–17.39 | They even talked about moving Parliament out of London. | zoom |
| s11 | 17.39–18.98 | Instead, they passed a new sewer law | iris |
| q11 | 18.98–20.58 | in about seven weeks. | cut |
| s12 | 20.58–22.22 | Engineer Joseph Bazalgette | whipBlur |
| s13 | 22.22–24.90 | built 82 miles of giant sewers. | cut |
| s14 | 24.90–26.83 | London still uses them today. | cut |

Runtime 26.83 s, 15 shots, shot lengths 1.11–2.68 s.
