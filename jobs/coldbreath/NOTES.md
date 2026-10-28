# coldbreath: why can you see your breath when it's cold? (Batch N, worker H3)

- Template: **#29 Particle flock** (demo t29, x.com/ajith_io; no source code, built from the demo frames). Why: the topic *is* particles. The water in a breath is drawn as the demo's flock: molecules zooming apart, slowing past the dew point, sticking into droplets, gathering into a white cloud and evaporating again. The previous H3 reels were #23 Recipe card (handwarmer) and #11 cel-boil (staticshock).
- Taken from the demo: the violet-pink-peach dusk gradient with a murmuration of tiny dark glyph specks (the "crash into the cold" and dew-point scenes); the starry navy sky; the glowing ringed orb ("your breath", the end card); the thin light streak drawn across the frame (the dew-point line); handwritten notes with curved arrows. The demo's paper/DistilBook sections are not used.
- Added for the topic: a winter kid in silhouette (beanie, pompom, scarf), a snowy ground band, light snowfall, H2O-glyph molecules, droplets drawn as soft white dots.
- Length 78.0 s; af_heart 0.97; music crayon 88 bpm at music_gain 0.7; fx_gain 0.5.
- Code: reels/t_coldbreath.js, t_coldbreath.html, specs/coldbreath.json, ev_coldbreath.json, tl_coldbreath.js. Particles are a pure function of t: each scene is a formation f(i, t), and particles morph from the previous formation with a per-particle stagger.
- Batch N layout: karaoke caption box bottom-anchored at y 1360, inside x 70-890; titles at y 250-460; content inside y 250-1130; the badge strip at y 1366-1440 stays free.
- Loop ending: in the last 0.5 s the frame-0 image (kid + puff + "A LITTLE CLOUD?") dissolves in at most 40%.
- Demand signal: "why can you see your breath when it's cold" is a classic winter People-Also-Ask, and TV weather explainers run it every year in Oct-Dec.
- Open question: why does cold make breath visible? It's built step by step: water vapor in your breath, cold air holding about a tenth as much (re-hook at 28 s), the dew point, droplets, a white cloud (re-hook at 48 s), and real clouds forming the same way (the wow at 52-56 s). Then it vanishes as it mixes and evaporates. The payoff at 67-70 s: "a cloud you made".

## Softened / not used
- "About a tenth" comes from the UW table (6 mb at 0 °C vs 63 mb at 36 °C). It's worded "air as warm as your body", with no exact temperatures spoken.
- "Molecules slow down and stick together" is the kid-level picture of condensation. Condensation nuclei are left out.
- No "below 45 °F" rule of thumb (it's only in secondary sources). The pinned comment says "a cool, damp day" instead.

## GROWTH checklist
- [x] Topic is a searched question; demand signal noted
- [x] Hook passes HOOKS.md (frame 0: kid + white puff already streaming, snow drifting, "A LITTLE / CLOUD?"; "But" at 4.1 s; search question spoken at 4-8 s)
- [x] 66-86 s (78.0 s); ends on the exact closing line
- [x] One-word-answer question before the closing line ("Ever pretended it was dragon smoke? Yes or no?")
- [x] End card: the standard main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (frame-0 image dissolves in, max 40%, in the last 0.5 s)
- [x] pinned_coldbreath.md written
- [x] coldbreath_ep.mp4 (EP 40, brand.py --ep 40, spot (44, 1366))
- [x] Timely window: first cold mornings, late October to February
