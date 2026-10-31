# HANDOFF: "How Did Ancient Humans Actually Sleep?" (ink-style explainer, 16:9, 398.7 s, CLOUD ONLY, CODE-DRAWN)

Owner: "draw it with code completely but make it nice". No AI images: every frame is drawn by ink.js + sleep/sc_*.js (SVG) in the
style the owner loves (reference: a painted cartoon of a stick-figure caveman with a big round WHITE head, dot eyes with expressive brows,
messy black hair, a teal striped hide tunic with a tooth necklace, black stick limbs, thick ink outlines, bright warm painterly backgrounds
with depth: thatched huts, mountains, trees, firelight). Our own look, not a copy of another channel.

Read: longform/README.md, ink.js, teeth/scenes.js (the pattern), player.html, sleep/script.json (43 scenes / 95 lines), sleep/tl.json
(Fenrir voice timings), sleep/shots.json (one picture prompt per line: USE THESE as the art direction for each beat), sleep/sources.md.
Render stills: `node render.js sleep stills 3 20 60 ...` (node_modules symlink is in longform/). Video: `node render.js sleep video 4 30`.

## H1: ink.js LOOK UPGRADE (everyone depends on it; keep every existing function name + signature working)
- person(): new default look = big round white head (slight paper texture), black dot eyes with bold expressive brows (faces: happy, sleepy,
  tired, worried, shocked, grumpy, asleep with Zzz), messy spiky black hair, thicker black stick limbs with round hands/feet, TEAL striped
  hide tunic with a jagged hem + a TOOTH NECKLACE; option {hairclip:'bone'} for MOSS (the main character), kid/elder variants, lying-down
  and curled-asleep poses, a blanket/hide cover.
- PAINTERLY backgrounds: replace flat fills with gradients, soft shading and texture (SVG feTurbulence grain, hand-painted blotches),
  atmospheric depth (far mountains hazy), warm sunlight / cool moonlight, a firelight glow that flickers and lights nearby figures (rim),
  starry night sky, savanna dusk, cave interiors with rock texture, thatched grass huts, trees with layered foliage, grass bedding,
  leafy mats, ash layer, smoke. Thicker, slightly wobbly ink outlines (hand-drawn feel).
- New props: grass bundle bed, leaf mat, ash layer cross-section, camphor sprig, chimp + leafy tree nest, lion/leopard/hyena silhouettes
  with glowing eyes, hearth, grass hut, sleep-tracker wristband, Zzz, clock/moon, a "science card" (paper card with a big number).
Ship DEMO stills (3) in your outbox, push early and often so the scene writers pick it up.

## H2 / H3 / H4: scenes (write ONLY your part file; Object.assign(SC, {...}) with the exact scene ids from script.json)
| Worker | File | Scenes (index: id) |
|---|---|---|
| H2 | sleep/sc_A.js | 0-14: hook_watch ... ash_why (the hook: the 18-minute fact must look striking from frame 1) |
| H3 | sleep/sc_B.js | 15-28: camphor ... yetish |
| H4 | sleep/sc_C.js | 29-42: duration ... follow (end card: "Follow for more of how ancient humans really lived") |
Rules: one strong composition per line (use on(i) reveals and gentle camera push/pan), a big readable headline() for key numbers
(18 MINUTES, 200,000 YEARS, 77,000 YEARS, 5.7-7.1 HOURS...), MOSS appears in most scenes, faces change on words, never two near-identical
frames in a row. Facts on screen must match sources.md. QC: stills at 3 points per scene, no PAGEERROR. Push to your branch + outbox.
The lead integrates into whatif/see-in-dark and renders in the cloud.
