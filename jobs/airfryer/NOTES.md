# airfryer: How an air fryer cooks (a small convection oven, not frying)

- Template: #9 scifi-toon (lemo-opuscar/styles/scifi-toon). Duration 74.9 s (v2), 1080x1920, af_heart 0.97, music crayon 88 bpm.
- Why: the template's grammar ("a tiny, mundane goal pursued with absurdly large sci-fi means", one palette per world, parallel worlds) turns "what is an air fryer really" into a trip through worlds: the oil world, inside the fryer, the boundary-layer blanket, browning, and a suspiciously normal oven.
- Code: reels/styles/scifitoon/ (toon.js + lib.js copied from lemo-opuscar, MIT; cast_af.js is new), reels/t_airfryer.js, t_airfryer.html, lip_airfryer.js (lip-sync envelope from the voice), specs/airfryer.json, ev_airfryer.json.

## Copied from the template (STYLE.md, DEMO.md, demo source and styleframes)
- The demo's own engine (toon.js): uniform thick purple-black ink line that boils (3 drawings cycled at 12 fps, screen-space resample + noise), constant line width at every zoom, flat fills with hard-edged shadow shapes, no gradients.
- Faces: big white eyes with tiny pupils, heavy lids for the deadpan lead, an elastic mouth lip-synced to the voice on twos (12 fps), nervous jitter + sweat drops on the sidekick.
- Sage-green lab home world (#a7c3b1 wall with panel lines, fluorescent tube, wall clock, blackboard with VT323 chalk text, shelf with jars, counter with an appliance on it), then one new palette per world: magenta/lime (oil world), orange/teal (inside the fryer), ultraviolet/gold (the blanket), mint/coral (browning), and the deliberately bland beige/brown "suspiciously normal" world.
- The portal is the only thing that glows (lumpy green rim, rotating spiral arms on ones, pale core, sparks, back-ease overshoot); every jump between worlds is a rush into a full-screen portal swirl wipe; hard cuts otherwise, no dissolves.
- Retro-terminal world tag (VT323) typed in top-left, coloured per world. Subtitles: Baloo 2 ExtraBold, white with a thick ink outline, speaker pill in the lead's colour.
- Title: 1950s atomic-age TV lockup (Bungee cream letters, hard magenta offset, cyan orbit ring with an orbiting object, twinkling four-point stars), popped in on 12 fps steps. End card: dark purple with a dimmed portal and the title.
- Reaction close-ups after absurd images (Spud over the oil pot, Spud in the hurricane of hot air), a cold slow push-in on the question.
- Recomposed for 9:16: title and world tag at the top, characters in the middle third, subtitles in the bottom band.

## Original (not from the demo)
- New cast: Juno (deadpan inventor, mustard jumpsuit, never takes off her oven mitts, wooden spoon in her bun) and Spud (a nervous potato who expects to be deep-fried); the air fryer prop; all worlds and props are new. No LemoLab credit on the end card.
- Single narrator: the voice is af_heart for everything (owner rule), so the template's two-voice dialogue became narration by Juno with Spud acting silently.
- Music is the house "crayon" bed (owner rule), not the template's theremin score.

## Softened / unverified claims
- Heater + fan "up top": layout varies by model; the cutaway is schematic.
- The boundary layer is explained as a "blanket" analogy (Wikipedia, Convection oven); no speed-up number is given because how much faster an air fryer is than an oven is disputed.
- "Some reviewers say air frying is basically convection baking" is attributed opinion.
- No health or fat claims. "Fred van der Weij" is spoken "van der Vey" (TTS approximation of the Dutch).
- Audio: human ear check still pending.

## v2 (Oct 27): HOOKS.md
- Line 1 kept ("Your air fryer has never fried anything.", 7 words, passes the checklist). Added the "but" line by 5 s: "But the fries still come out crispy. How?" (the gap is answered by the boundary layer + Maillard section at ~27-50 s).
- Frame 0 rebuilt: an insert close-up with fries already tumbling in the basket and hot-air arrows; a pot of oil slides in and gets stamped NOT THIS. The title lockup stays as the burned-in caption ("NOT A FRYER").
- Thumbnail: thumb_airfryer.jpg (lockup "IT DOESN'T FRY" over the inside-the-fryer world with a golden Spud), checked in the 3:4 grid crop.
- Mix: new mix2.py (effects at half level, ducked under the voice).
