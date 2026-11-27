# NOTES: sodabubbles (EP 78)

**Template:** #29 particle flock (demo t29, x.com/ajith_io Distilbook showreel). No kit existed, so this is custom code: reels/t_sodabubbles.js.
**Why:** bubbles and dissolved gas are particles by nature.
- The demo's flock of tiny glyphs wheeling over a purple-to-peach sunset becomes CO₂ molecules (O-C-O glyphs) that fly between shapes: the drink, a giant "?", a packed bottle, a cloud escaping the neck, and the end-card ring.
- The demo's glowing orb on a starry night becomes the gas pocket, and its glowing line becomes the bubble trains and the glowing glass outlines.
- Handwritten labels follow the demo's script lettering.

My last reels were hairgray (#27 old-master) and freezerburn (#19 Sketch music); this reel avoids every template used in EPs 69-76.

**Shots:**
- big glowing glass with six bubble lines and "a speck of lint" (frame 0);
- flock forms a "?";
- CO₂ packed in a bottle with pressure arrows;
- cap pops and the flock streams out;
- night: a new bubble crushed;
- the gas-pocket orb, the head start;
- "scratches?", then a lens with the Liger-Belair card and a fiber;
- a hollow cellulose fiber on the wall (towels, paper, dust);
- liquid pours in and the gas pocket stays trapped;
- the 4-step cycle at the fiber's mouth;
- a fast train with a counter to 30 "bubbles a second";
- bubbles growing and spreading as they rise;
- glass bumps vs the pocket needed;
- a laser-etched flute;
- "1 speck = 1 line";
- the yes/no question in a lens;
- end card in a wheeling flock ring.

**Batch N layout:**
- drawings in y 330-1150;
- karaoke caption (Inter 800, peach key words, dark plum pill) centred at y 1300;
- labels kept out of the badge spot (y < 340 on the right);
- the end lines sit on a pill at y 1205-1355.

**Build notes:**
- I added the yes/no question after the first storyboard (GROWTH checklist), which took the reel from 79.4 s to 84.1 s.
- The end-card title got a soft backing because the ring flies through it.
- Scene changes are 0.45 s crossfades; the end dims 40% and loops to the frame-0 glass.

**Voice:** af_heart 0.97, crayon bed at music_gain 0.55, 83.1 s.

**End card:** 2.95 s (80.17-83.12 s; main session asked for 3 s or less). The spec sets `"tail": 0.6`, a new optional key in voice2.py (default 1.6), and the card starts 0.1 s before the closing line.

**Accuracy:** Liger-Belair's work says the sites are mostly fibers and *not* glass scratches (the glass's bumps are far below the ~0.2 µm critical radius). The script therefore says "You'd guess scratches... but", and hedges with "most" and "mostly". Etched glasses appear as the deliberate exception.

**Sources:** sources_sodabubbles.md.

**Code:** reels/t_sodabubbles.js, t_sodabubbles.html, specs/sodabubbles.json, ev_sodabubbles.json, tl_sodabubbles.js.

**Thumbnail:** thumb_sodabubbles.jpg ("Why do soda bubbles / rise in lines?" over the glass).

**Badge:** `brand.py sodabubbles --ep 78` at ("R", 256), no hide needed; checked at 12 points.

## GROWTH checklist
- [x] Topic is a searched question (main-session assignment EP 78)
- [x] Hook passes HOOKS.md (11 words; frame 0 is the big glass with rising lines; search question at 4.3 s)
- [x] 66-86 s (83.1 s); ends on the exact closing line
- [x] One-word-answer question before the closing line ("Next time, will you look for the speck at the bottom of the line? Yes or no?")
- [x] End card: standard main line + "A new 'wait, really?' every day." + handle
- [x] Loop ending (dim 40%, frame 0 is the same glass the reel opens on)
- [x] pinned_sodabubbles.md written (a try-it-yourself prompt)
- [x] sodabubbles_ep.mp4 (EP 78)
- [x] Evergreen

## QA (python3 -I reels/qa.py sodabubbles), final render
```
QA sodabubbles: PASS   (/home/user/reel-render/jobs/sodabubbles/sodabubbles.mp4, 83.0 s)
  PASS  static          longest no-change run 0.00 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.5 s)
  PASS  safe zones      UI zones clear
  PASS  outer 24 px     clear
  PASS  loudness        -15.4 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -2.4 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 12.5 dB above the pauses (15 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          83.0 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 4.1 (min 1.0), contrast 38.5 (min 18.0)
  PASS  blank frames    none
  PASS  9:16 frame      sodabubbles.mp4 1080x1920 SAR 1:1; sodabubbles_ep.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```
