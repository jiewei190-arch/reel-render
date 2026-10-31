# HANDOFF: "What If You Had Spider Powers?" (What If ep 4, 16:9 1080p24, 389.4 s)

Script + sources: `whatif/what-if-spider/` (script.md, sources.md; 5 RULE cards). Voice landed: Fenrir, `input/voiceover.wav` 389.40 s,
978 words, transcribe 98% match; `timeline/words.json` is the word clock. Same kit and `QUALITY_BAR.md` as ep 3 (train-3yr); ep 3's sets
are copied in (acting, actors, faces, apartment, street, court, roofs, devices, bp, hud ruleCard, creatures incl. Biscuit, home3, park...).

## LEGAL (owner-approved safe version) — every shot
Never name or show the famous web-slinging hero or anything from it: no red-and-blue, no bodysuit, no mask, no web logo/pattern on clothes,
no wrist web-shooters (silk comes from the back end, like a real spider, played for comedy), no swinging between skyscrapers, no upside-down
kiss, no "spider sense" text. Our hero is original (cast.js): messy sandy-brown hair, mustard zip hoodie, oversized purple gardening gloves,
grey cargo trousers, green wellies. PIP is a cute grey-and-cream jumping spider with two huge shiny front eyes (cartoon, friendly, never scary).

## Cast
HERO (above), MINA (red scarf, kid; she names Pip), DEV (orange beanie, films everything on his phone), BISCUIT (purple collar), PIP.

## Stage A (now): new sets
| Worker | Files | What |
|---|---|---|
| H1 | sets/garden.js + DEMO_garden.js | The family GARDEN + SHED: shed interior (dusty shelves, tools, the bike pump, a window cobweb, sunbeam), the back garden (lawn, fence, washing line, an APPLE TREE with a branch Biscuit gets stuck on), the house back wall with a drainpipe and windows (for wall-climbing), a STORM mode (rain, wind gusts bending the tree, dark clouds, lightning flash) and sunny/morning moods. |
| H2 | sets/spider.js + DEMO_spider.js | `pip(g,x,y,s,{t, tilt, hop, wave, look})` the jumping spider (8 legs, 2 huge front eyes + small side eyes, fuzzy), giant-Pip close-up; hero climbing rig on acting.js: `wallCling(t, o)` (hands + socks stuck, slow slide down "like a wet sticker"), `ceilingStick`, `silkLine(g, from, to, {t, sag})` + `silkPuff` (silk from the hero's back end, comedic, never from wrists), `dodge` pose (feels the air, dodges a water balloon without looking), the purple gloves gag. |
| H3 | sets/spiderbp.js + DEMO_spiderbp.js | Science BLUEPRINTS in bp.js style for the 5 rules (facts exactly as sources.md): foot hairs splitting into finer hairs + van der Waals; square-cube law + "40% of your body / size 114 shoes" vs gecko size limit; silk liquid -> solid at the spinneret, weight-for-weight vs steel, tougher than Kevlar; trichobothria hairs feeling air, the 3 m hearing study, eight eyes (telephoto front pair, the rest spotting movement almost all the way around); leg joints straightened by fluid pressure, 6 body lengths vs ~1.5 for humans, "still debated". |
| H4 | sets/spiderprops.js + DEMO_spiderprops.js | Props + scenes: the KITCHEN feast (9 eggs, Dev's sandwiches, the burger vs milkshake digestion gag, kept cute not gross), water balloon + splash, Dev's phone filming UI, the fence jump, the reality-check lab montage (Stanford-style gecko hand pads on a glass wall with a climber, a lab silk sample spool), day/week counter cards. |

Push to your own branch; status line to handoff/outbox/H<n>.md. Lead integrates into whatif/see-in-dark. The owner's PC does batch E + the final render.
