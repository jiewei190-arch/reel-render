# rainbow: NOTES (EP 85)

- **Template:** #3 blueprint (lemo-opuscar/styles/blueprint grammar), via styles/blueprint, with ovenfoil's Batch N layout. Picked to avoid the families used or reserved in EPs 77-84.
- **Why this template:** "why are rainbows curved" is pure geometry: a drop's ray path, a 42° angle dimension, a cone in elevation, hidden lines for the half of the circle you can't see.
- **Palette:** a white-print sheet (off-white diazo paper, faint blue grid, deep-blue line work), at the main session's request so it reads apart from ovenfoil (cyan) and fridge (sepia), and the spectrum pops. The spectrum is the only colour; the one red stamp, CIRCLE, lands at the payoff.
- **Figures:**
  - FIG 1 THE ARC: a big bow from frame 0 with the camera riding it; the hidden half is drafted dashed; someone else's circle in phantom line.
  - FIG 2 ONE RAINDROP: drop cross-section with centre lines; a white ray in, fanning into six colours, reflecting off the back and out; a 42° angle dimension.
  - FIG 3 THE CONE: elevation with sunlight from behind and the antisolar axis; only drops at 42° light up; the cone; then looking down it, the ellipse opens into a circle around "shadow of your head".
  - FIG 4 THE HORIZON: the ground hides the lower half (hidden-line dashes), "NO RAIN DOWN HERE"; then a plane above a cloud deck with the whole circle and the plane's shadow at its centre.
  - FIG 5 YOUR OWN BOW: you and a friend, each with their own circle; the friend's walks along.
  - FIG 6 THE SECOND BOW: 42° primary (red outside) and a fainter ~50° secondary (red inside).
  - FIG 7 THE ANSWER: a full circle around your shadow, the ground hiding the bottom, the red CIRCLE stamp; YES / NO for the question; end card.
- **Title block:** STATUS reads AN ARC? → PART OF A CIRCLE → CIRCLE · HALF HIDDEN.
- **Bottom band:** a drawing only (no text): a viewer with the low sun behind, a long shadow, rain and a low bow, all kept left of x 880.
- **Layout:**
  - header y 280-420, figure window y 440-1000, title block y 1010-1138;
  - NOTE subtitle box y 1150-1425 (x 100-900).
- **Search question:** spoken at 0.35 s. Hook: 4 words. "But" at 2.0 s.
- **Re-hooks:** 22.6 s "Here's the trick"; 41.8 s plane / whole circle; 46 s "your cone moves with you".
- **Payoff:** 58.2 s. Question: full-circle rainbow, yes or no?
- **Length:** 71.3 s. Voice af_heart 0.95; crayon bed; music_gain 0.6, fx_gain 0.35.
- **Loop:** the last 0.5 s blends at most 40% of frame 0.
- **Badge:** EP 85 at (651, 400), right of the FIG label above the figure window (as ovenfoil). Checked every 3 s across the whole reel: it only sits on the window border line, and callouts start at y >= 480.
- **Ear check:** not done by a human yet.

## qa.py
```
QA rainbow: PASS   (/home/user/reel-render/jobs/rainbow/rainbow.mp4, 71.2 s)
  PASS  static          longest no-change run 2.25 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.0 s)
  PASS  safe zones      UI zones clear
  PASS  outer 24 px     clear
  PASS  loudness        -15.4 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -1.7 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 13.8 dB above the pauses (5 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          71.2 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 13.1 (min 1.0), contrast 61.5 (min 18.0)
  PASS  blank frames    none
  PASS  9:16 frame      rainbow.mp4 1080x1920 SAR 1:1; rainbow_ep.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```

## GROWTH checklist
- [x] Topic is a searched question ("why are rainbows curved"); demand signal: main-session assignment
- [x] Hook passes HOOKS.md v2 (4 words = the search question; frame 0 is a big moving bow; "but" at 2.0 s)
- [x] 66-86 s (71.3); ends on the exact closing line
- [x] Short question before the closing line
- [x] End card: main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (40% frame-0 blend)
- [x] Every claim sourced (sources_rainbow.md); numbers in words in the spoken text
- [x] Pinned comment + thumbnail
