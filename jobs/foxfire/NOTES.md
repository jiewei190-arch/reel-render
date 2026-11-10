# foxfire: why some mushrooms glow (Halloween batch H, worker H3)

- Template: **#1 paper-lantern** (lemo-opuscar `styles/paper-lantern`, "Paper-cut Lightbox"). Why: STYLE_FIT rule 3, a night/glow phenomenon suits an atmospheric lit template, and the template's signature (light burning through cut paper inside a dark box) *is* the topic: the mushrooms are the box's emissive "windows".
- Length 68.8 s, af_heart 0.97, music crayon 88 bpm, mix2.py with fx_gain 0.5 (ducked).
- Code: `reels/t_foxfire.js`, `reels/t_foxfire.html`, `reels/specs/foxfire.json`, `reels/ev_foxfire.json` (dumped from window.CUES by the new `reels/cues.py`), style module `reels/styles/lantern/lantern.js` (v2 additions: `layer()` baked sheets with backlight + pulp mottle + baked cast shadow + DoF blur, `put()` depth parallax, `lampFrame()`, `strip()`, `vstrip()`, `sealMark()`, `bloom()`, `flick()`).

## Copied from the demo (STYLE.md / DEMO.md / styleframe)
- The frame is the box: a wooden lamp frame with black lining in a dark room, spill light on the table below in the scene's light colour; the subtitle sits under the box (serif italic, warm off-white).
- Every shot is a stack of flat cut sheets, one flat colour each, value ladder light/translucent at the back to almost black at the front; fibre grain, warm top rim, dark bottom band, soft cast shadows; the front layer is blurred (shallow DoF); pulp mottle where the backlight shines through; vignette.
- The demo's rounded paper mountains with carved contour lines, round tree crowns, a full moon with glow, stars, one temperature per stack (cool night forest, warm Greek dusk, teal sea, violet "inside the cap", teal palm forest).
- Emissive windows = the glowing caps and foxfire streaks, with bloom and the demo's flicker `1 + .06 sin(7.3t) sin(3.1t)`.
- Paper text: strips that grow from their left edge, a red seal, the vertical title strip with a seal ("FOXFIRE"), handwritten paper tags.
- Motion like paper on a stick: cards rise on sticks, jointed figure (Aristotle's arm rotates at the shoulder), insects with flapping wings, short dollies, lateral travel with parallax, hand-held micro drift; dissolves between shots and the near-plane curtain wipe whose halves meet at the centre; a "locked frame, only the light changes" shot (dusk to night) and the ending "lights go out one by one, the last window last".

## Hook (HOOKS.md)
- Line 1: "Some mushrooms glow in the dark, all on their own." (10 words, done by 2.9 s). Frame 0: big glowing cluster already flickering, camera dollying. Caption "WHY MUSHROOMS GLOW" from frame 0. "But" turn at 3.2 s. Question "why would a mushroom make light?" answered at 43-64 s (insects, spores, night-time sign).

## Softened / dropped claims
- Insect counts from the 2015 trap test (42 vs 12 over 5 nights, seen only in a search snippet) could not be confirmed on a readable page: **dropped**; the script says "far more insects" (Sci.News: "many more"; The Conversation: "fewer were attracted to non-illuminated controls"). The on-screen tally slips are illustrative, not counts.
- "Insects may carry its spores" and "the glow is probably a night-time sign": the study's authors' hypothesis, so worded "may" / "probably" / "likely saving energy".
- "Over two thousand years ago" instead of Wikipedia's exact "382 B.C." date for Aristotle (his birth year is usually given as 384 BC).
- "Fuel" for luciferin and "recycled into new fuel" simplify the caffeic-acid cycle described by Kaskova et al. 2017.
- The fakes in the study were acrylic resin mushrooms lit by green LEDs (sticky traps); the reel draws them as stylised caps.
- Species count (about 100-130 known glowing fungi; reviews vary) left out of the script.
