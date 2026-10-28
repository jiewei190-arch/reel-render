# NOTES: glowdark (EP 92)

**Template:** #16 cinematic3d "Christmas story" (demo99), kit reels/styles/cinefilm/cinefilm.js, the same kit as candle and submarine.
**Why:** light stored by day and given back at night is the demo's language of lit windows in the dark. The sepia grade is daytime charging; the blue-lavender grade is night release. The stickers' green glow is added after the grade, so it stays green, like the demo's warm windows. The demo's lit house windows become the crystal's electron traps: a lit window is a trapped electron, and it goes dark when the electron escapes as a green spark.

**Shots:**
- frame 0: a close, drifting shot of a ceiling full of green glowing stars, "Stored light.", pulling back to the night bedroom on the question;
- day (sepia): a sun beam charges the stickers, and a lens shows light lifting electrons up a level;
- "normally: a flash" energy ladder;
- "traps": the house windows light up as electrons are caught;
- night (blue): the room's warmth releases them one at a time as green sparks, then zoom out to "millions = the glow";
- "Phosphorescence": light in / stored / light out;
- zinc sulfide + copper star fading sooner vs the new one;
- 1990s: Sr Al Eu Dy tiles, europium makes the green, dysprosium holds electrons, glow bars for hours vs old;
- "Not radioactive.";
- "a century ago": radium dial painters as period silhouettes with glowing dials;
- the lamp charging them;
- yes/no;
- end card under the stars.

**Batch N layout:**
- titles and labels in y 300-1140, all below or left of the EP badge;
- the dark rolling band from y 1160 carries the italic caption at y 1180-1400.

**Build notes:**
- I stopped the first render to move every heading below the badge (y 400+).
- A later render moved "electrons" off the energy-level line.
- The ACS/RSC sources the main session asked for were not found; I flagged this to the main session.

**QA:** no FAIL. One WARN, "black bars": that is the projector-gate border, the same as candle and submarine.

**Voice:** af_heart 0.97, jazz bed at music_gain 0.5, 81.8 s; spec `tail` 0.7, so the end card runs 3.0 s. "1990s" is spoken as "nineteen nineties".
**Sources:** sources_glowdark.md.
**Code:** reels/t_glowdark.js, t_glowdark.html, specs/glowdark.json, ev_glowdark.json, tl_glowdark.js.
**Thumbnail:** thumb_glowdark.jpg ("Why do they glow?").
**Badge:** `brand.py glowdark --ep 92` at ("R", 256), no hide needed; checked at 9 points.

## GROWTH checklist
- [x] Topic is a searched question (main-session assignment EP 92)
- [x] Hook passes HOOKS.md (12 words; frame 0 is big glowing stars drifting on the ceiling; search question at 4.8 s)
- [x] 66-86 s (81.8 s); ends on the exact closing line
- [x] One-word-answer question before the closing line ("Do you still have glow stars on a ceiling somewhere? Yes or no?")
- [x] End card: standard main line + "A new 'wait, really?' every day." + handle
- [x] Loop ending (dim 40%; the end and frame 0 are both the glowing ceiling)
- [x] pinned_glowdark.md written (try-it prompt)
- [x] glowdark_ep.mp4 (EP 92)
- [x] Evergreen

## QA (python3 -I reels/qa.py glowdark)
```
QA glowdark: WARN   (/home/user/reel-render/jobs/glowdark/glowdark.mp4, 81.8 s)
  PASS  static          longest no-change run 0.00 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 3.2 s)
  PASS  safe zones      UI zones clear
  PASS  outer 24 px     clear
  PASS  loudness        -15.6 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -2.2 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 11.9 dB above the pauses (14 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          81.8 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 6.6 (min 1.0), contrast 38.5 (min 18.0)
  PASS  blank frames    none
  PASS  9:16 frame      glowdark.mp4 1080x1920 SAR 1:1; glowdark_ep.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  WARN  black bars      bar over 60 px in 100% of samples (median widest bar 142 px); a deliberate film-frame border is OK, letterboxing is not
```
