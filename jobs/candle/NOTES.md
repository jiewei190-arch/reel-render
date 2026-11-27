# NOTES: candle

**Template:** #16 cinematic3d "Christmas story" (demo99), the kit reels/styles/cinefilm/cinefilm.js, same as the approved submarine reel.
**Why:** a candle is the definition of "things with lit interiors, moody night": every light (flame, melt pool, glowing carbon, the fire running down the smoke) is added after the sepia grade, so it stays warm, exactly like the demo's windows and lamps. Faraday's 1860 Christmas lectures make it a period piece. My previous reels were ink moon (leafcolor) and cel-boil/silkscreen before that.

**Copied from the demo:**
- flat ink silhouettes on old film graded sepia;
- warm glows composited after the grade;
- gate weave, flicker, grain, dust and hairs, and the rounded film gate;
- dips through black between shots;
- a burned-in italic hook line;
- the dark rolling foreground band carrying an italic caption written in word by word;
- a starry window and drifting specks.

**Changes for 9:16 + safe zones:**
- the band starts at y 1160 and the caption sits on it at y 1180-1400, x 130-890;
- labels in y 300-1060;
- a rim-lit lecture-audience row fills the table front (main-session note: no empty band under the table);
- nothing is written in the right column below 840.

**Hook (HOOKS v2):** "The wick isn't the fuel. The wax is, as a gas." (10 words, main-session wording; the wick does char at its tip). Frame 0: a big flame close-up with vapour specks rising and the burned-in "The wick isn't the fuel." At the question (3.8 s) the camera pulls back to the candle by a night window; at 6.3 s comes Faraday at his lecture desk, 1860.
**Re-hooks:**
- 25.6 s "this is what burns";
- 37.6-45 s the wow as a big close-up, opened by "Now watch this." (blow it out, light the smoke, fire runs down the vapour and relights the wick);
- 51.7 s Faraday's cold flask catching water.

**Payoff:** 57 s, the tiny fuel pump.
**Loop:** the end card holds a big flame (main-session note) so it matches the frame-0 close-up; dim 40%.
**Voice:** af_heart 0.97, jazz bed at music_gain 0.5, mix2. 70.8 s. The year is shown as 1860 in the caption and spoken from words in the spec, because qa.py fails on 4-digit years in the spoken text.
**Softened claims:** see sources_candle.md.
**Code:** reels/t_candle.js, t_candle.html, specs/candle.json, ev_candle.json, tl_candle.js. Thumbnail: thumb_candle.jpg ("What really burns?").
**Build notes:**
- The first full render failed "voice over bed" (2.8 dB), because the jazz bed was too loud. I remixed at music_gain 0.5 and remuxed the audio only (loudnorm, then alimiter 0.70 with 4x oversampling, AAC 88k), giving 7.3 dB and −2.2 dBTP. The video is untouched.
- The black-bars WARN is the demo's rounded film gate (deliberate border, as on submarine).

**Badge:** `brand.py candle --ep 50` at (44, 1060), low-left on the rim-lit audience row (art). The auto spot (651, 330) hit the 1860 labels, the pump labels, "Through the smoke?" and the end card. It is hidden 25.4-28.4 s under "this is what burns". OVR line in brand.py; checked at 15 points from 2 s to 69.5 s.

## GROWTH checklist
- [x] Topic is a searched question; demand signal: handoff/topics_next30.md (EP 50); "how does a candle burn" is a classic autocomplete question
- [x] Hook passes HOOKS.md (10 words, frame 0 flame moving, burned-in line, search question at 3.8 s)
- [x] 66-86 s (70.8 s); ends on the exact closing line
- [x] One-word-answer question before the closing line ("Have you ever relit a candle through its smoke? Yes or no?")
- [x] End card: standard main line + "A new 'wait, really?' every day." + handle
- [x] Loop ending (big flame both ends; dim 40%)
- [x] pinned_candle.md written
- [x] candle_ep.mp4 (EP 50)
- [x] Timely window: evergreen; candle season (Nov 7)

## QA (python3 -I reels/qa.py candle, after the remix)
```
QA candle: WARN   (/home/user/reel-render/jobs/candle/candle.mp4, 70.8 s)
  PASS  static          longest no-change run 0.00 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 4.0 s)
  PASS  safe zones      UI zones clear
  PASS  outer 24 px     clear
  PASS  loudness        -15.7 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -2.2 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 7.3 dB above the pauses (10 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          70.8 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 6.4 (min 1.0), contrast 42.9 (min 18.0)
  PASS  9:16 frame      candle.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  WARN  black bars      bar over 60 px in 100% of samples (median widest bar 144 px); a deliberate film-frame border is OK, letterboxing is not
```
