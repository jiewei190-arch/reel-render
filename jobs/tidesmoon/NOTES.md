# NOTES: tidesmoon (EP 100, milestone showpiece)

**Template:** #25 Ink moon (demo t25), kit reels/styles/inkmoon/inkmoon.js, the same kit as harvestmoon. Its demo topic is literally "moon, tides, seasons".
**Why:** the demo's brush ensō becomes the Earth, a pale ink wash becomes the ocean stretched into two bulges, the kit's moon is the Moon, and a vermilion sun joins for spring and neap tides. The stippled ink landscape gives the human scale: the water climbing a shore with a small house and a lantern traveller. The plum blossoms (spring!) carry the beat that spring tides have nothing to do with spring.

**Shots:**
- frame 0: the two bulges, big, with the Earth slowly turning and the Moon in its haze; at 1 s a vermilion arrow marks the far bulge, "here too";
- the landscape with the vertical "Moon & tide" column and the EP 100 seal;
- uneven pull arrows (hardest near, weakest far);
- one bulge, then the second;
- a coast marker turning through high and low tides;
- the Moon moving on (~50 min later each day);
- the Sun about half as strong;
- in a line, spring tide;
- "not the season": plum blossoms crossed out, the tide springs forth up the shore;
- right angles, neap tide;
- bay vs headland ensō insets;
- the night shore with the lantern traveller as the water climbs;
- yes/no;
- end card on the landscape with the EP 100 seal.

**Batch N layout:**
- drawings in y 300-1150;
- the kit's subtitle centred at y 1300;
- the plum branch kept below the badge;
- nothing written in the right column below y 840 (the "Moon" label sits above it).

**Build notes:**
- The first render failed QA "blank frames": the scenes dipped to paper between shots (fade out, then fade in). They now crossfade.
- It also failed "frame 0" contrast (16.7 against a minimum of 18). The ocean wash and its outline are darker now, and a "two bulges" column was added.
- The re-render is a full PASS.

**Voice:** af_heart 0.97, jazz bed at music_gain 0.5, 79.9 s; spec `tail` 0.7, so the end card runs 3.0 s.
**Sources:** sources_tidesmoon.md (NOAA tides tutorial and spring-tide page, NASA Tides, NOAA SciJinks).
**Code:** reels/t_tidesmoon.js, t_tidesmoon.html, specs/tidesmoon.json, ev_tidesmoon.json, tl_tidesmoon.js.
**Thumbnail:** thumb_tidesmoon.jpg ("Why TWO high tides?", EP 100 seal).
**Badge:** `brand.py tidesmoon --ep 100` at ("R", 256), no hide needed.

## GROWTH checklist
- [x] Topic is a searched question (main-session assignment EP 100)
- [x] Hook passes HOOKS.md (12 words; frame 0 is the big two-bulge diagram, moving; search question at 4.5 s)
- [x] 66-86 s (79.9 s); ends on the exact closing line
- [x] One-word-answer question before the closing line ("Have you ever seen a spring tide? Yes or no?")
- [x] End card: standard main line + "A new 'wait, really?' every day." + handle
- [x] Loop ending (dim 35%)
- [x] pinned_tidesmoon.md written (EP 100 note + tide-table tip)
- [x] tidesmoon_ep.mp4 (EP 100)
- [x] Evergreen

## QA (python3 -I reels/qa.py tidesmoon)
```
QA tidesmoon: PASS   (/home/user/reel-render/jobs/tidesmoon/tidesmoon.mp4, 80.0 s)
  PASS  static          longest no-change run 2.75 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.0 s)
  PASS  safe zones      UI zones clear
  PASS  outer 24 px     clear
  PASS  loudness        -15.5 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -2.8 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 7.2 dB above the pauses (14 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          80.0 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 4.7 (min 1.0), contrast 21.7 (min 18.0)
  PASS  blank frames    none
  PASS  9:16 frame      tidesmoon.mp4 1080x1920 SAR 1:1; tidesmoon_ep.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```
