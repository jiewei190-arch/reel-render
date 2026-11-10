# NOTES: leafcolor

**Template:** #25 Ink moon (demo t25), the kit reels/styles/inkmoon/inkmoon.js, same as harvestmoon. The main session asked for a different palette and props than H1's goldfishmemory (EP 54, also ink moon): this reel is autumn maple red/gold with an ensō close-up language, not water/fish.
**Why:** a seasons topic told in the demo's world: rice paper, dry-brush ink peaks, a pale moon, a branch (the demo's plum branch, now maple), ensō circles as close-ups and vermilion seals. The leaf's colour is drawn from three real pigment layers over a gold base, so the science and the picture are the same thing. My previous reels were silkscreen-poster and cel-boil; candle is cinematic.

**Copied from the demo:**
- stippled ink ranges over mist;
- moon with halo;
- birds;
- a branch from the top-right with blossoms (now maple leaves);
- ensō insets;
- a vertical title column with a seal;
- italic serif labels;
- a quiet serif subtitle with a vermilion square.

**Changes for 9:16 + safe zones:**
- ranges baked higher (bases at y 1000-1120);
- labels and titles in y 280-1120;
- the subtitle box is centred at y 1262, inside x 150-930;
- a pigment strip (green / gold / red levels across the whole reel) fills y 1392-1438 under the caption (main-session note: no blank bottom third);
- nothing is written in the right column below 840.

**Hook (HOOKS v2):** "That gold in fall leaves was hiding there all summer." (10 words, main-session wording). Frame 0: one big maple leaf filling the width inside an ensō, its green already draining to reveal gold; "gold, all along" at 1.6 s. At the question (3.9 s) the ink landscape, the branch and the "WHY DO LEAVES TURN?" column come in.
**Re-hooks:**
- 24.3 s "the twist: the reds weren't hiding";
- 37-40 s wow (sun + trapped sugar turns the leaf red);
- 50.3 s "tannins";
- 54.7 s "the leaf lets go".

**Payoff:** 58.6 s three ensō (green leaving, gold revealed, red made).
**Loop:** the end card returns to the moon, mountains and branch; dim 30%.
**Voice:** af_heart 0.97, crayon 88 bpm, mix2 (fx 0.5, ducked). 70.2 s.
**Storyboard review (main session), all applied:**
- big-leaf frame 0;
- 10-word hook;
- bottom band filled (the pigment strip);
- faint titles now reach full ink fast;
- the end-card branch is lowered clear of the text.

**Softened claims:** see sources_leafcolor.md ("scientists think" for the sunscreen idea; "most" anthocyanins made in fall).
**Code:** reels/t_leafcolor.js, t_leafcolor.html, specs/leafcolor.json, ev_leafcolor.json, tl_leafcolor.js. Thumbnail: thumb_leafcolor.jpg ("WHY DO LEAVES CHANGE COLOR?").
**Build notes:**
- The first full render had birds over the end card; fixed and re-rendered.
- The second encode's AAC overshot to +1.4 dBTP (QA FAIL). The audio was re-limited from the crf16 master with 4x oversampling (alimiter 0.70, AAC 88k) to −2.2 dBTP, with the file kept under ~10 MB; video untouched.

**Badge:** `brand.py leafcolor --ep 49` at (44, 560), mid-left. The auto spot (44, 400) hit the title column and the "chlorophyll" and "carotenoids" labels. Mid-left crosses only ensō strokes, the sun and seals (art). OVR line in brand.py; checked at 12 points from 2 s to 69 s.

## GROWTH checklist
- [x] Topic is a searched question; demand signal: handoff/topics_next30.md (EP 49); "why do leaves change color" is a classic autocomplete question
- [x] Hook passes HOOKS.md (10 words, frame 0 subject big and moving, search question at 3.9 s)
- [x] 66-86 s (70.2 s); ends on the exact closing line
- [x] One-word-answer question before the closing line ("Which do you love more, red or gold? One word.")
- [x] End card: standard main line + "A new 'wait, really?' every day." + handle
- [x] Loop ending (dim 30%)
- [x] pinned_leafcolor.md written
- [x] leafcolor_ep.mp4 (EP 49)
- [x] Timely window: fall (posts Nov 6)

## QA (python3 -I reels/qa.py leafcolor)
```
QA leafcolor: WARN   (/home/user/reel-render/jobs/leafcolor/leafcolor.mp4, 70.2 s)
  PASS  static          longest no-change run 3.50 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.0 s)
  WARN  safe zones      right x>900 y900-1650: content 50.2-58.0s, 63.5-70.2s
  PASS  outer 24 px     clear
  PASS  loudness        -15.6 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -2.2 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 6.9 dB above the pauses (9 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          70.2 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 6.9 (min 1.0), contrast 38.7 (min 18.0)
  PASS  9:16 frame      leafcolor.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```

The safe-zone WARN is the ink mountains and the maple branch reaching the right column at y 900-1150 (art, no text).
