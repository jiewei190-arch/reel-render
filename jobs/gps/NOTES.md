# NOTES: gps

**Template:** #1 paper-lantern (Paper-cut Lightbox, lemo-opuscar paper-lantern), kit reels/styles/lantern/lantern.js, same as foxfire.
**Why:** a night sky of glowing satellites is the lantern's lit-shadow-box language. Every shot is a lit box with cut-paper layers (the curve of the Earth, a paper town, hills, a blurred front layer), and the light sources are emissive: signals, pulses, the blue dot. The paper strips, tags, vertical title strip and red seal carry the labels.

**Shots:**
- satellites raining signals on a phone;
- the question;
- the constellation over a cut-paper Earth;
- one satellite broadcasting "where I am / what time it is";
- the delay turned into a distance;
- trilateration rings: sphere → circle → two points → one point, "you!";
- the atomic clock with orbiting electrons, the EINSTEIN title strip;
- ground vs satellite clocks: −7 / +45 / +38 µs a day;
- the blue dot drifting off "+10 km", then snapping back "corrected";
- the question, then the end card.

My last two reels were turkeysleepy (crayon-book) and fridge (blueprint).

**Batch N layout:**
- the lamp window is moved to y 270-1130 (BOX override);
- captions sit on the dark room under the lamp at y 1180-1400 (the kit's sat at 1560);
- the bottom band is only the table and the spill light;
- at the end the yes/no tags and the end-card lines lie as paper tags in the room. The first render failed "empty thirds" at 71.8-79 s; this fixed it.

**Voice:** af_heart 0.97, crayon bed at music_gain 0.6, 78.9 s.
**Sources:** see sources_gps.md (GPS.gov + Pogge, Ohio State).
**Code:** reels/t_gps.js, t_gps.html, specs/gps.json, ev_gps.json, tl_gps.js. Thumbnail: thumb_gps.jpg ("HOW GPS FINDS YOU").
**Badge:** `brand.py gps --ep 69` at ("R", 256), on the lamp frame's top-right. OVR line in brand.py; checked at 9 points.

## GROWTH checklist
- [x] Topic is a searched question (main-session assignment EP 69)
- [x] Hook passes HOOKS.md (9 words, frame 0 big moving satellites + phone, search question at 3.6 s)
- [x] 66-86 s (78.9 s); ends on the exact closing line
- [x] One-word-answer question before the closing line ("Did you know your phone needs Einstein? Yes or no?")
- [x] End card: standard main line + "A new 'wait, really?' every day." + handle
- [x] Loop ending (satellites over the Earth at both ends)
- [x] pinned_gps.md written
- [x] gps_ep.mp4 (EP 69)
- [x] Timely window: evergreen

## QA (python3 -I reels/qa.py gps)
```
QA gps: PASS   (/home/user/reel-render/jobs/gps/gps.mp4, 79.0 s)
  PASS  static          longest no-change run 3.50 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 3.2 s)
  PASS  safe zones      UI zones clear
  PASS  outer 24 px     clear
  PASS  loudness        -15.4 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -1.6 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 14.1 dB above the pauses (14 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          79.0 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 4.7 (min 1.0), contrast 39.9 (min 18.0)
  PASS  blank frames    none
  PASS  9:16 frame      gps.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```
