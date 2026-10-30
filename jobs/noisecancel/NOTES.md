# NOTES: noisecancel

**Template:** #14 explainer "Alchemy Infra" (demo 80), kit reels/styles/alchemy/alchemy.js, same as search.
**Why:** it's a signal-processing story, and the template's dark infra look (glowing lines, iso cubes, big motion-blur stats, flash cards) draws waves, a DSP chip and "thousands of times a second" natively. My last two reels were inkmoon (leafcolor) and cinefilm (candle), and coldtaste uses the recipe card.

**Beats:**
- 0 s: hook "Fight sound / with sound.", the noise wave and its upside-down twin flattening to a cyan "quiet" line.
- 4 s: the question over the headphones.
- 7 s: the pressure wave with squeeze/stretch dots.
- 12.6 s: mics on the earcups.
- 16.4 s: the iso "DSP" cube flips the wave.
- 20.8 s: the speaker plays the anti-noise with the music.
- 24.2 s: a deliberate white flash on "they cancel" (the silence beat).
- 29 s: "keep up", 1,000s.
- 33-43 s: wave comparison (main-session note, replacing the terminal prop). Noise + anti-noise sit on top and "what you hear" below: the long hum is nearly flat.
- 43-49 s: the same view for a voice or bark: a jagged leftover gets through.
- 49 s: earcup padding blocks the highs.
- 53 s: 1936, first patent.
- 57.7 s: the fan test.
- 63.9 s: an indigo flash on "they play its opposite".
- 67.5 s: yes/no question.
- 70.7 s: the standard end card with the lens ring.

**Safe zones:** HUD text at y 286; titles from y 360; captions centred at y 1290; the live "net sound" scope at y 1395-1440. Nothing is written in the right column below 840, and the top-right HUD corner is left empty for the badge.
**Voice:** af_heart 0.97, crayon bed, 74.5 s. The year 1936 is spelled out in words in the spoken column.
**Build notes:**
- The first render failed "static" (5.0 s at 33.8-38.8, the old terminal beat). The wave comparison with chips and staged waves fixed it (3.25 s).
- The black-bars WARN is the template's dark ground below the caption scope (not letterboxing), the same as search.
**Sources:** sources_noisecancel.md cites Elliott & Nelson's ISVR Southampton review as the university source, including the low-hum claim; Sennheiser is secondary only.
**Code:** reels/t_noisecancel.js, t_noisecancel.html, specs/noisecancel.json, ev_noisecancel.json, tl_noisecancel.js. Thumbnail: thumb_noisecancel.jpg ("Fight sound / with sound.").
**Badge:** `brand.py noisecancel --ep 57` at ("R", 256), in the top-right HUD corner (the timecode and bracket were removed for it). The auto spot (651, 400) hit the titles. The OVR line is in brand.py; I checked 10 points from 1 s to 73.5 s.

## GROWTH checklist
- [x] Topic is a searched question (main-session assignment EP 57)
- [x] Hook passes HOOKS.md (8 words, frame 0 waves moving, search question at 4.1 s)
- [x] 66-86 s (74.5 s); ends on the exact closing line
- [x] One-word-answer question before the closing line ("Do you use noise cancelling on flights? Yes or no?")
- [x] End card: standard main line + "A new 'wait, really?' every day." + handle
- [x] Loop ending (dim, cyan line echoes the frame-0 "quiet" line)
- [x] pinned_noisecancel.md written
- [x] noisecancel_ep.mp4 (EP 57)
- [x] Timely window: holiday travel season

## QA (python3 -I reels/qa.py noisecancel)
```
QA noisecancel: WARN   (/home/user/reel-render/jobs/noisecancel/noisecancel.mp4, 74.5 s)
  PASS  static          longest no-change run 3.25 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 3.2 s)
  PASS  safe zones      UI zones clear
  PASS  outer 24 px     clear
  PASS  loudness        -15.6 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -2.6 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 7.6 dB above the pauses (10 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          74.5 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 9.5 (min 1.0), contrast 36.5 (min 18.0)
  PASS  9:16 frame      noisecancel.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  WARN  black bars      bar over 60 px in 88% of samples (median widest bar 368 px); a deliberate film-frame border is OK, letterboxing is not
```
