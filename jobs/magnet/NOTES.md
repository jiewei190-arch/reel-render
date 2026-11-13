# NOTES: magnet

**Template:** #15 handdrawn "Distilbook" (demo 83, awesome-opus-5-5-video-styles case 12; video fetched with reels/fetch_demos.sh 83).
**Why:** the demo turns a page of book text into a hand-drawn labelled diagram, then a video-player card. Magnetism is a layered explanation (pole -> electron -> domain -> nail), so the page-to-diagram move fits exactly.

**Copied from the demo:**
- Cool off-white ground with a vignette.
- HUD: three-bar logo with a caps label top-left; "BAR nn/nn 88 BPM" with a beat box top-right; frame counter and SMPTE timecode bottom-right; corner brackets.
- Tilted serif book page (Libre Baskerville, blue section number) with depth-of-field blur and green / pink / blue marker sweeps.
- Highlighted words lift off the page and fly into the diagram.
- Black felt-tip ink with draw-on, crayon-grain fills, hatching, a circle callout, wavy arrows, and handwritten labels with one blue word.
- Bold stacked lines with the last line in blue ("Pages. / and pages.").
- The diagram shrinks into a white video-player card with a blue progress bar, time and logo chip.
- Karaoke subtitle: spoken words ink, current word blue, coming words grey.
- Dark navy rolling stack with blurred neighbours and a big pink counter.
- White editor card with a blue pill chip.
- Dark dot-grid slide with a huge white number.
- Logo end card with grey tagline and blue pill.

**Changes for 9:16:** content sits between the HUD and the karaoke line at y≈1665. The demo is 16:9.
**Voice:** af_heart 0.97, music crayon 88 bpm (leaf settings). Ends on the exact closing line, spoken and on the end card.
**Code:** reels/styles/distilbook/distilbook.js (reusable for any Distilbook reel), reels/t_magnet.js, specs/magnet.json, ev_magnet.json.
