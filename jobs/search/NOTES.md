# NOTES: search

**Template:** #14 explainer "Alchemy Infra Motion Reel" (demo 80, awesome-opus-5-5-video-styles case 147; video fetched with reels/fetch_demos.sh 80).
**Why:** the demo is infrastructure motion graphics: data blocks, a world of connections, a terminal, big stats. A search engine is exactly that (index blocks, crawler links, a query, ranking), so the demo's objects map one to one.

**Copied from the demo:**
- Navy ground with indigo glow and a faint dot lattice.
- HUD: corner brackets, mono caps labels in all four corners, running timecode, cyan "● INDEX ONLINE".
- Point -> line -> diamond -> gridded indigo cube with a dimension line and a leader callout (mono title plus a sub label).
- Isometric block field with lit blocks.
- Dotted globe (Natural Earth land mask, reels/lib/landmask.js) with a glowing rim and cyan/white arcs with dot heads, flanked by big white stats with a rule and spaced mono captions.
- White flash card with a huge Instrument Serif italic word.
- Glass terminal card: traffic lights, "~/index — zsh", green "200 OK" pill, highlighted result row.
- "Every result is weighed by / <serif italic word>." swap over a curved carousel of glass cards (the demo's "One platform to power your / Banking.").
- Indigo disc with white ring and expanding rings.
- Motion-blur tunnel and a motion-blurred big number.
- Full indigo flash frame with kinetic type.
- Lens-flare line, ring and logo reveal.
- Kinetic letters slide in with horizontal smear throughout.

**Changes for 9:16:** stats are stacked above and below the globe instead of left and right. Captions in Inter sit at y≈1700; the demo has none.
**Voice:** af_heart 0.97, music crayon 88 bpm (leaf settings). Ends on the exact closing line, spoken and on the end card.
**Code:** reels/styles/alchemy/alchemy.js (reusable), reels/t_search.js, specs/search.json, ev_search.json.
