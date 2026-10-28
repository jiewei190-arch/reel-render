# contrails: NOTES

- **Template:** #7 silkscreen-poster (demo 23), reusing reels/styles/silkscreen-poster (the engine behind skyblue) and H2's Batch N table layout from cranberries.
- **Why this template:** the fact sheet sorts contrails into three kinds, and the template's grammar is a series of posters on one template with a new palette each. So the reel has a banner plus four printed posters: 01 ICE, NOT SMOKE (cold navy); 02 DRY SKY (desert orange); 03 HUMID SKY (blue-grey); 04 the 2016 survey (red). "Paper is a colour": every trail is white ink/paper.
- **Demo moves used:**
  - print table, squeegee pulls with ragged fronts, split-fountain beads;
  - screen frame lift, stepped bands, misregistration and ink sheen, paper mottle;
  - info band with name/number/stat row, slab headline;
  - silhouette wipes (cut as a cloud edge here);
  - wall lockup and an end card printed in two pulls.
- **New for this reel:**
  - **the jet on every poster:** a jet crosses each poster's sky, and its trail is the explanation:
    - 01: clear exhaust, then droplets, then a growing ice band;
    - 02: a short line that shrinks to nothing;
    - 03: a trail that keeps growing and, after the shear beat, smears into a sheet;
  - **01 props:** a -70°F thermometer whose mercury drops; a loupe where droplets become six-armed ice crystals; a kid's breath puffing on a cold day;
  - **02/03 dials:** the same humidity dial re-inked (DRY vs HUMID);
  - **03 props:** a clock running hours, cirrus sheets, corridor trails for "+20%";
  - **04:** a crowd of 77 figures printing one by one, 76 in blue and 1 in gold.
- **Batch N layout:**
  - posters framed in y 250-1150; printed caption strip at y 1170-1410, text inside x 190-890;
  - the wall posters were narrowed to stay left of x 900 (the first render had the third poster's text in the right column);
  - qa WARN is end-card sky bands only (art) above y 150.
- **Search question:** "Why do planes leave white trails in the sky?" is spoken at 0.35 s.
- **Hook:** that question (9 words). "But it isn't smoke" at 3.35 s.
- **Re-hooks:** 22.5 s "vanish in seconds... stay for hours?"; 42.5-47 s shear into cirrus and +20%; 53.6 s "not chemtrails" plus the survey.
- **Payoff:** 64.4 s. Question: "Long or short?"
- **Length:** 75.8 s. Voice af_heart 0.97; mix2.py with fx_gain 0.35 and music_gain 0.6 (pops on pulls, thuds on screen lifts, ticks on the thermometer/clock/crowd; no whoosh).
- **Loop:** end card darkens 30% and the last 0.5 s blends 30% of frame 0 (banner close-up) back in. The code is in t_contrails.js; for this render the same blend was applied to the master in post (ffmpeg blend), so no second full render was needed.
- **Badge:** EP 61 at (44, 260) on the banner and wall/end card; hidden 6.0-64.2 s because every poster's header sits in the top band (OVR in brand.py).
- **Ear check:** not done by a human yet.

## qa.py
```
QA contrails: WARN   (/home/user/reel-render/jobs/contrails/contrails.mp4, 75.8 s)
  PASS  static          longest no-change run 2.00 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.2 s)
  WARN  safe zones      top y<150: content 72.2-75.8s
  PASS  outer 24 px     clear
  PASS  loudness        -15.5 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -1.5 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 13.5 dB above the pauses (10 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          75.8 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 7.9 (min 1.0), contrast 56.7 (min 18.0)
  PASS  9:16 frame      contrails.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```

## GROWTH checklist
- [x] Topic is a searched question ("why do planes leave white trails in the sky"); demand signal: main-session assignment
- [x] Hook passes HOOKS.md v2 (9 words = the search question, frame 0 is the squeegee printing the trail banner, "but" at 3.35 s)
- [x] 66-86 s (75.8); ends on the exact closing line
- [x] Short question before the closing line ("Look up today. Long or short?")
- [x] End card: main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (30% frame-0 blend)
- [x] pinned_contrails.md written; thumb_contrails.jpg made
- [x] contrails_ep.mp4 (EP 61; OVR spot (44, 260), hidden 6.0-64.2 s; checked at 3-74 s)
