# saltyocean: NOTES (EP 79)

- **Template:** #25 Ink moon (demo t25), via styles/inkmoon (the module behind goldfishmemory). Picked to avoid the EP 71-78 families.
- **Why this template:** the ocean salt story is a landscape water cycle: mountains in mist, rain as brush streaks, a river to the sea, the sun lifting water. Ink moon draws exactly that. Ions are the one accent: sodium as deep sea-blue beads, chloride as salt-white beads. The palette is sea blue + salt white (no vermilion or plum) so it reads apart from goldfish (EP 54, same template), per the main session; warm colour stays only in the sun and magma.
- **Scenes:**
  - frame 0: a huge Hokusai-like breaking wave with salt crystals in the spray; a "fresh" river spills in;
  - rain over big stippled mountains, CO₂ bubbles; an ensō close-up of a rock cracking and letting go of ions; a river carrying ions to the sea;
  - open sea under a warm sun: vapour rises into a cloud, one sodium bead jumps and falls back ("salt stays"), rain on the hills, fish nibbling, a salt meter filling;
  - a dive to the sea floor: cracks, seeping water, magma glow, a vent breathing an ink plume of ions, then an underwater volcano;
  - "spread over land": a white salt layer buries a house and a figure, with a more-than-500-feet rule;
  - the payoff: an ensō drop with a 100-square grid (3.5 vermilion), then sodium and chloride; the cycle (rain brings it in, the sun leaves it);
  - the question over the wave; the end card; the loop blends 40% of frame 0 over the last 0.5 s.
- **Batch N layout:**
  - serif subtitle centred at x 500 at y ~1310 (max width 720);
  - titles at y >= 400; nothing typed in the top 250 px or bottom 480 px, or right of x 900 below y 840.
- **Search question:** spoken at 0.35 s. Hook: 10 words. "But" at 4.0 s.
- **Re-hooks:** 22.1 s "Here's the catch"; 35.9 s "salted from below"; 49.8 s "more than 500 feet".
- **Payoff:** 54.7 s. Question: "Did you know the sea's salt came from rocks? Yes or no?"
- **Length:** 71.9 s. Voice af_heart 0.97; crayon bed 88 bpm; music_gain 0.6, fx_gain 0.35.
- **Badge:** EP 79 at (44, 260). It sits only over clouds, the sun halo and ions; it never touches text (frames checked at 10-70 s).
- **QA WARN (art only):** "outer 24 px" at 19-22 s, where the rain clouds touch the top edge during the pan down to the river. No text there.
- **Ear check:** not done by a human yet.

## qa.py
```
QA saltyocean: WARN   (/home/user/reel-render/jobs/saltyocean/saltyocean.mp4, 71.8 s)
  PASS  static          longest no-change run 3.00 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.5 s)
  PASS  safe zones      UI zones clear
  WARN  outer 24 px     content at the frame edge 19.0-21.8s
  PASS  loudness        -15.5 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -1.9 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 15.1 dB above the pauses (5 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          71.8 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 5.5 (min 1.0), contrast 29.2 (min 18.0)
  PASS  blank frames    none
  PASS  9:16 frame      saltyocean.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```

## GROWTH checklist
- [x] Topic is a searched question ("why is the ocean salty"); demand signal: main-session assignment
- [x] Hook passes HOOKS.md v2 (10 words = the search question + the fresh-water paradox; frame 0 is a big moving wave; "but" at 4.0 s)
- [x] 66-86 s (71.9); ends on the exact closing line
- [x] Short question before the closing line
- [x] End card: main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (40% frame-0 blend)
- [x] Every claim sourced (sources_saltyocean.md); numbers in words in the spoken text
- [x] Pinned comment + thumbnail
