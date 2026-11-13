# flush: How a toilet flushes (the siphon)

- Template: #18 handdrawn "Japan heat wave" (demo101, owner's choice). Duration 79.2 s (v2), 1080x1920, af_heart 0.97, music crayon 88 bpm.
- Why: a field-notebook page of annotated cross-sections and measurement boxes fits a plumbing cutaway, and the demo's "rain gauge" chart fits gallons per flush.
- Code: reels/styles/fieldbook/fieldbook.js (new module), reels/t_flush.js, t_flush.html, specs/flush.json, ev_flush.json.

## Copied from the demo (studied frame by frame with ffmpeg stills)
- Warm cream notebook paper with fibre texture, faint laid lines and a soft vignette; printer's crop marks in the corners and target marks top/bottom centre.
- Mono footer bottom-left ("HOW IT REALLY WORKS 2026 p.0x", page number advances each chapter) and the four hatched swatch chips bottom-right.
- Chapter label typed in a typewriter face, "NO. 0x — TOPIC · fig. x", with a hairline rule drawn under it; the italic handwritten headline then writes on left to right below it.
- Thin graphite line drawings that draw on stroke by stroke with a slight double-pass wobble; red and navy pencil cross-hatching as the only fills (the demo's hatched red sun and navy rain gauge). Grey hatching on the ceramic, like the shaded flank of the demo's Fuji.
- Title page: big title with a red vertical seal (水洗 "suisen" = flush, with a mono gloss, like the demo's 新 seal + "kokushobi" gloss), subtitle line, and a big red hatched circle behind a line drawing (the demo's sun behind Fuji).
- Double-ruled measurement boxes with counters (handles used, pipe status, tank/bowl %), small handwritten annotation notes with leader lines, red emphasis words in the typed body text.
- The demo's measuring-cylinder chart for "gallons per flush" (two cylinders, dashed reference line, axis ticks, handwritten big number above).
- Page change = the ink fades off the sheet, a beat of bare paper, then the next page types in. Ending = centred lines with the red line second, a round red 終 seal, a half disc on a horizon, a mono SOURCES block, and the sheet darkening at the edges.
- Recomposed for 9:16: label + headline at the top, one large drawing in the middle, typed caption (the spoken line) in the lower third, footer at the bottom.

## Deviations (on purpose)
- The demo opens on a dark screen; here the paper is lit from frame 0 and the title is already on the page (QA rule: title visible from frame 0).
- Captions: the demo has no subtitles; the spoken line is typed into the page as body text in the demo's body font style.

## Softened / unverified claims
- "Plumbers say" a bucket poured in fast flushes it (plumbing-company guides + a city disaster guide; attributed).
- "Older ones often used 3.5 or more" (sources: "typically at least 3.5 gallons").
- Rim holes only; many bowls also have a siphon jet at the bottom (left out for simplicity).
- "Outside the Americas most toilets are washdown types" is from Wikipedia ("most common form ... outside the Americas"); not every North American toilet is siphonic.
- Drawing is schematic, not to scale. Audio: human ear check still pending.

## v2 (Oct 27): owner feedback + HOOKS.md
- Hook: "Your toilet doesn't push the water down. It sucks it." (10 words) + "But there's no pump. So how?" by 5 s; "most North American toilets" added to the trapway line. Sourcing for "sucks": Explain That Stuff calls it a "siphon (sucking) effect"; Wikipedia describes the siphonic action.
- Frame 0: the cutaway is already drawn with the siphon running (full pipe, red flow arrows, swirl), the burned-in caption "It sucks, not pushes." replaces the title.
- Clean cream paper (blotches removed, fine grain), English seals (FLUSH, SEAL, AIR, END), a "flush cycle" timeline strip in the bottom margin of pages 2-4, cross-dissolve page turns (no blank frames), end line fully written ~1.3 s into the end card.
- Thumbnail: thumb_flush.jpg ("It sucks, not pushes." + the siphon cutaway on the red sun), checked in the 3:4 grid crop.
- Mix: new mix2.py (effects at half level, ducked under the voice). Encoded size 10.1 MB (slightly above the ~9.6 MB target).
