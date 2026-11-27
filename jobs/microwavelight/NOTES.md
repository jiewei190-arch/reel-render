# microwavelight: NOTES

- **Template:** #21 Storybook paint (demo t21), via reels/styles/storybook (the module behind catseyes).
- **Why this template:** a kitchen-at-night story with a kid, a glowing microwave and starry-sky "constellation" line diagrams. The demo's white constellation lines are the waves, and its glow halos are the oven light and the hot spots. The sketchbook page on the desk bookends the reel.
- **Demo moves used:**
  - the sketchbook on the wooden desk with the yellow pencil;
  - coloured-pencil paintings (flat fill + diagonal hatching + wobbly ink outline);
  - banded night sky, stars and pale moon;
  - the round-headed kid with dot eyes and rosy cheeks;
  - glow halos and soft rays;
  - white constellation-line diagrams;
  - Caveat handwriting;
  - the torn paper subtitle slip.
- **New for this reel:**
  - the night kitchen (window with the moon, shelf, tiles, counter, cabinets);
  - a microwave with a dotted door mesh, popcorn popping and a panel countdown;
  - a mesh-plate loupe;
  - side-view mesh wall with a big wave bouncing back and tiny light waves slipping through;
  - a top-down oven with a hot/cold standing-wave grid and the turntable;
  - the chocolate test with the sum on a slip;
  - ground props in every night scene (a ruler with the 12 cm wave, a light wiggle, a chocolate bar with melt marks).
- **Main-session storyboard notes applied:**
  - 11-word hook;
  - a push-in on the door plus a big loupe by the but-turn;
  - bottom-band ground props;
  - a per-number sources table.
- **Batch N layout:**
  - subtitle slip centred at x 500, max width 700, around y 1320;
  - the page title fades during the push-in, so nothing is typed in the top 250 px;
  - nothing typed in the bottom 480 px (props only).
- **Search question:** "why does a microwave have a metal mesh on the door?" is spoken at 4.2 s.
- **Hook:** "You can see through this door, but microwaves can't get out." (11 words). Frame 0 is the living painting; "but" at about 2 s.
- **Open question:** answered at 21-32 s (holes far smaller than the 12 cm wave; the metal bounces them back). Re-hooks: "Here's the trick" at about 21 s; "do something sneaky" at about 40 s; payoff with the chocolate speed-of-light test at 54-63 s.
- **Length:** 75.8 s. Voice af_heart 0.97; mix2.py with fx_gain 0.35 and music_gain 0.6 (no whooshes).
- **Softened claims:**
  - "a few millimeters" for the holes (only secondary sources give 1-2 mm);
  - "the idea behind a Faraday cage";
  - "roughly the speed of light".
- **Loop:** the last 0.5 s crossfades the end page into frame 0 (the same sketchbook page).
- **Ear check:** not done by a human yet.

## qa.py
```
QA microwavelight: WARN   (/home/user/reel-render/jobs/microwavelight/microwavelight.mp4, 75.8 s)
  PASS  static          longest no-change run 0.75 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.0 s)
  WARN  safe zones      right x>900 y900-1650: content 0.0-4.2s, 4.8-9.5s, 64.8-75.8s
  PASS  outer 24 px     clear
  PASS  loudness        -15.4 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -2.4 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 16.3 dB above the pauses (5 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          75.8 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 9.9 (min 1.0), contrast 53.8 (min 18.0)
  PASS  9:16 frame      microwavelight.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```

## GROWTH checklist
- [x] Topic is a searched question ("why does a microwave have a metal mesh on the door"); demand signal: Batch N topic list
- [x] Hook passes HOOKS.md v2 (11 words, frame 0 moving, handwritten title, "but" in line 1)
- [x] 66-86 s (75.8); ends on the exact closing line
- [x] One-word-answer question before the closing line ("Did you know your microwave could do that? Yes or no?")
- [x] End card: main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (crossfade into frame 0)
- [x] pinned_microwavelight.md written; thumb_microwavelight.jpg made
- [x] microwavelight_ep.mp4 (EP 53; OVR spot (651, 400), hidden from 63.7 s when the sketchbook page with the title and end card returns; checked at 6, 15, 30, 37, 47, 61, 67, 74 s)
- **qa.py WARN:** right-column safe zone on the sketchbook pages (the yellow pencil and page edge: art, not text).
