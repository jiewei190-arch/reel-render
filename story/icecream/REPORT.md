# icecream: reports for main (send_message to main is blocked from this session: the main session needs a trusted device)

## Oct 29, v1 + v2
- v1 (e840463): H1's own engine, built from the notes before the owner's module arrived. Kept as `reels/styles/storyfable/fable_h1_v1.js` and `reels/t_icecream_v1.js`. Sheet: `compare_v1.jpg`. Gaps: plain sets, thin lines, small characters, no lead line.
- v2 (688acdf): rebuilt on the owner's `fable.js` and grown from `t_storytest` into the full 67 s story with af_heart. Richer sets: beach huts, pier, sailboats, a seaside town, lifeguard towers, dune grass, a painted overhead, a journal prop and a blueprint on a desk. Full render running; `compare_v2.jpg` follows.
- Engine note: on this cloud box (no GPU) the owner's `fable.js` took 112 s per frame, because per-sprite canvas filters run over the whole frame. H1 speed-ups (same look, marked "H1" in `fable.js`): bounding-box sprites, batched DOF/haze layers for consecutive sprites with the same filter, a single-pass rim light, and a cloud layer blurred once. Now about 1.6 s per frame.
- Band measurements (`style_measure.py`, ref 16.6 s vs our wide shot): sky mid ours #cde6f4 vs ref #b4d6f0 (too pale); near horizon ours #b8a380 vs ref #e2dbcd (our horizon is higher in frame, 36% vs about 44%, and lacks the cream haze); ground mid ours #b4884d sat .57 vs ref #b69d5d .49 (too orange/saturated); ground low ours #a87641 .61 vs ref #957541 .56.

## Oct 29, v3 + v4 + v5
- v3 (b9f8df5): ground and colour bands matched to the reference (sand palette, horizon ~44%, cream haze, ruts + grass/flower verges, sharper wide midground, night stars and moon). Sheet `compare_v3.jpg`.
- v4: painted overhead (textured sand, foam, crowds in red/teal formations, glints, tilt-shift), bigger rivals in the side-by-side wides, earthier wood. Sheet `compare_v4.jpg`.
- v5 (rendering): material pass on characters and props (soft lit-to-shaded volume, light grain), narrower boardwalk.
- Every version's notes and remaining gaps: `CHANGELOG.md`. QA has been WARN-only throughout (right-column flags on the end-card question; wide shot touching the frame edges).

## Oct 29, v6-v9 (current best: v9)
- v6: crowds of each side's customers behind each vendor (the reference's armies). v7: far mountains, hills and a lighthouse. v8: night stand-off lit by lanterns; scoops in hand. v9: deeper night.
- Current best render: `story/icecream/icecream_v9.mp4` (67 s, af_heart, 1-2 word captions, loop on the DISTANCE APART sign). Sheet: `compare_v9.jpg`. QA WARN only (listed in CHANGELOG).
- Honest status: much closer than v1/v2 in colour bands, ground, haze, crowds, rim light and the overhead, but still distinguishable from the reference. The reference has more varied, detail-rich sets and stronger lighting moods. Next steps are in CHANGELOG v9.
- Nothing posted or scheduled.
