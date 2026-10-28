# NOTES: freezerburn

**Template:** #19 handdrawn "Sketch music" (demo 102), kit reels/styles/sketchmusic/sketchmusic.js, same as zombieant.
**Why:** a quiet kitchen myth-bust suits a pencil drawing that builds itself line by line, with soft pastel washes. The demo's glassy drops become the reel's key image: ice leaving the food as vapour.

**Shots:**
- the inside of a freezer drawn in perspective with a patchy steak and drops rising off it;
- the magnifier full of ice crystals, then "dry air";
- the surface close-up where crystals lift away as drops ("ice → vapor", "no melting", "sublimation");
- the patches spread, then air creeps in;
- "safe" with a check mark, "quality ↓";
- ice cream growing crystals;
- the fix: a bag squeezed flat, small containers, the 0°F thermometer, wrap on the ice cream before the lid;
- "no air, no sublimation, no freezer burn";
- the question and the end card.

My last two reels were gps (paper-lantern) and turkeysleepy (crayon-book).

**Batch N layout:**
- drawings sit in y 300-1150, and the camera adds a 200 px offset, which I accounted for;
- the kit's karaoke caption is re-set at y 1240-1400 (the kit drew it at 1715);
- pencil lines are drawn 1.5× heavier so they read at phone size.

**Build notes:**
- The first full render passed QA. I rebuilt the 0°F shot (the freezer drawn behind the thermometer, plus a steak) and the "safe" shot (a bigger steak) so neither leaves near-empty paper mid-frame (main-session check).
- Scene changes use a soft paper dissolve, capped at 50%, so there are no blank frames.

**Voice:** af_heart 0.97, crayon bed at music_gain 0.6, 68.3 s.
**Sources:** see sources_freezerburn.md (Tennessee, Texas A&M AgriLife, NDSU citing FSIS; I couldn't open the FSIS page).
**Code:** reels/t_freezerburn.js, t_freezerburn.html, specs/freezerburn.json, ev_freezerburn.json, tl_freezerburn.js. Thumbnail: thumb_freezerburn.jpg ("freezer burn / isn't a burn").
**Badge:** `brand.py freezerburn --ep 70` at ("R", 256), hidden 5.7-11.8 s under the "tiny ice crystals" title. OVR line in brand.py; checked at 9 points.

## GROWTH checklist
- [x] Topic is a searched question (main-session assignment EP 70)
- [x] Hook passes HOOKS.md (10 words, frame 0 the full freezer drawing with drops rising, search question at 4.1 s)
- [x] 66-86 s (68.3 s); ends on the exact closing line
- [x] One-word-answer question before the closing line ("Have you found freezer burn in your freezer? Yes or no?")
- [x] End card: standard main line + "A new 'wait, really?' every day." + handle
- [x] Loop ending (the steak with drops rising at both ends; dim ending)
- [x] pinned_freezerburn.md written
- [x] freezerburn_ep.mp4 (EP 70)
- [x] Timely window: holiday leftovers season

## QA (python3 -I reels/qa.py freezerburn)
```
QA freezerburn: PASS   (/home/user/reel-render/jobs/freezerburn/freezerburn.mp4, 68.2 s)
  PASS  static          longest no-change run 0.25 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.0 s)
  PASS  safe zones      UI zones clear
  PASS  outer 24 px     clear
  PASS  loudness        -15.7 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -2.2 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 8.0 dB above the pauses (16 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          68.2 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 6.5 (min 1.0), contrast 22.6 (min 18.0)
  PASS  blank frames    none
  PASS  9:16 frame      freezerburn.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```
