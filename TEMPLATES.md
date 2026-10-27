# TEMPLATES: the owner's 19 chosen styles and what is already built

Rule: a reel must reproduce its demo's actual animation language and formatting. Only topic, voice and objects are new. Source demos live in the cloned style repos (see README). Always read the demo source first.

## Built and approved by the owner (Oct 27 2026)
| Template | Reel | Module / files | What makes it match the demo | Caveats |
|---|---|---|---|---|
| #11 cel-boil (demo 55) | match (84.2 s) | reels/styles/celboil/, t_match.js, specs/match.json | exposure sheet on 1s/2s/3s, a fresh boil per drawing, off-register colour, paper tooth, camera shakes on strike/ignite/flare, boiled Caveat captions | Engine copy came from branch origin/claude/ignore-render-artifacts (also has t_cat.js) |
| #3 blueprint (demo 8) | lock (71.4 s) | reels/styles/blueprint/, t_lock.js | cyanotype sheet, white linework + hatching, NOTE boxes, title block whose status flips LOCKED/UNLOCKED, revision table, red stamp | two small label overlaps near 20 s ("SPRING"/"DRIVER PIN" vs section title; "5 HOLES (OFTEN 5)" clipped) |
| #10 paper-popup (demo 28) | ship (80.9 s) | reels/styles/popup/, t_ship.js | cut-paper cards with white border and cardboard edge, page-turn between acts, signs dropping on strings, back-to-front pop-in, layered paper scenery up top | fill the upper area with scenery (an empty top third was the first mistake) |
| #7 silkscreen-poster (demo 23) | skyblue (66.4 s) | reels/styles/silkscreen-poster/, t_skyblue.js | banner + three vintage posters on a wood wall, slab headlines, halftone, misregistration, tree-silhouette wipe, triptych lockup | posters looked empty in the first preview; end card text must fit width (118 px -> 98 px) |
| #6 shadow-puppet (demo 22) | eclipse (84.2 s) | reels/styles/shadowpuppet/, t_eclipse.js | warm backlit paper stage, articulated cut-out puppets on rods, boxed captions, SAFETY FIRST sign | needs overlapping crossfades; no blank "glow-only" frames; the demo's backstage mirror reveal was not built |

## Not built yet (build in this order of fit)
#1 paper-lantern, #2 papercut-red, #4 crayon-book, #5 impasto, #8 urban-sketch, #9 scifi-toon, #12 collage, #13 collage "AI Doom", #14 explainer "Alchemy Infra", #15 handdrawn "Distilbook", #16 cinematic3d "Christmas", #17 handdrawn "Playful", #18 handdrawn "Japan heat wave", #19 handdrawn "Sketch music".
In-house modules exist for several (crayon, impasto, urbansketch, lantern, collage, handdrawn, cinematic via lowpoly/iso) but must be re-checked against the demo before use.

## Lessons from the first five
1. Ask each build agent for an 8 s preview as soon as scenes render; the owner reviews it while the full render is still queued. Typical preview findings: empty areas, blank transition frames, clipped text.
2. Always view a 12-frame contact sheet AND the last frame before sending.
3. Render queue: one render at a time (flock /tmp/render.lock); a reel waits its turn, so total time is dominated by rendering (about 20-30 min/reel).
4. Unverified wording stays out or is softened ("half of the chemistry is on the box" is the agent's own summary; use "much of").
5. Open the source URLs once before scheduling; they came from research notes.
