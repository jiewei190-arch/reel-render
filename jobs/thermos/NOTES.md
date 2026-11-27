# NOTES: thermos

**Template:** #18 handdrawn "Japan heat wave" (demo 101), module reels/styles/fieldbook/fieldbook.js (unchanged; same as the approved flush reel).
**Why:** a heat topic with a cross-section, measurement boxes and a date: the demo is literally a heat field notebook (thermometer, measuring cylinder, day boxes, red hatched sun). STYLE_FIT rule 3: measurable mechanisms and cross-sections → field notebook. My previous reel was #15 Distilbook, so no repeat.

**Copied from the demo:** warm notebook paper with crop marks and centre targets; typed chapter label "NO. 0x — TOPIC · fig. x" with a hairline rule; handwritten headline written on; thin graphite drawings that draw on; red/navy/ochre pencil hatching as the only fills; the big red hatched sun behind the title drawing (demo's sun behind Fuji); red seals ("VACUUM", "NO PATENT", round "END"); double-ruled measurement boxes (CONTENTS HOT/COLD, neck narrow, stopper thick); the demo's row of day boxes (21-25 → 25 Dec 1892 circled in red); heat squiggles; typed body text with red key words; mono footer + swatch chips; page change = ink fades off then the next page types in; ending = centred lines with the red line second, a round seal and a half disc on the horizon.
**Changes for 9:16 + safe zones:** label/headline from y 270, drawing y 430-1130, typed caption at y 1230, a "HEAT ROUTES BLOCKED" strip (conduction ✗ · convection ✗ · radiation ✗) at y 1560 as the progress device, nothing in the right column below 840; a slow camera "breath" over the page so nothing holds still > 4 s.

**Hook (HOOKS v2):** "Your thermos has no idea if your drink is hot or cold." (12 words, pattern 2). Frame 0: the flask cross-section in front of the red hatched sun, contents flipping HOT/COLD (measurement box), headline "Hot? Cold? It has no idea." "But" + exact search question at 4.3 s: "But then, how does a thermos keep drinks hot and cold?"
**Open question:** "How can one bottle do both?" Answered at 61.7-66.7 s ("hot stays hot and cold stays cold for the same reason: heat can't get across"), with the mechanism built up from 17 s.
**Re-hooks:** 22.2 s "Here's the trick"; 31-34 s wow (infrared bounced back by the silvered wall); 35.5 s "So where does heat still sneak out? The top."; 46 s Christmas Day, 1892.
**Loop:** the end page returns to the opening's red half-sun on the horizon; final dim 30%.
**Voice:** af_heart 0.97, crayon 88 bpm, mix2 (fx 0.5, ducked). Years written in words (rule 14). 74.1 s.
**Softened claims:** see sources_thermos.md (partial vacuum; neck/base exceptions; silvering was a later refinement; no company year spoken; no temperatures or hours).
**Code:** reels/t_thermos.js, t_thermos.html, specs/thermos.json, ev_thermos.json, tl_thermos.js. Thumbnail: thumb_thermos.jpg ("Hot AND cold?").
**Build note:** first QA run failed "static" (4.75 s at 22.8-27.5 and 47.5-52.0 s): the notebook pages held still; fixed with a slow camera breath + steam squiggles on the Dewar page, re-rendered.

## GROWTH checklist
- [x] Topic is a searched question; demand signal: assigned from handoff/topics_next30.md (main session's search research); "how does a thermos keep things hot and cold" is a classic autocomplete question
- [x] Hook passes HOOKS.md (12 words, frame 0 subject moving, caption "Hot? Cold? It has no idea.", "but" at 4.3 s)
- [x] 66-86 s (74.1 s); ends on the exact closing line
- [x] One-word-answer question before the closing line ("Coffee or ice water in yours? One word.")
- [x] End card: standard main line + "A new 'wait, really?' every day." + handle
- [x] Loop ending (red half-sun returns; dim ≤ 30%)
- [x] pinned_thermos.md written
- [ ] `thermos_ep.mp4` (main session, after the episode number is assigned)
- [x] Timely window: winter / cold mornings (Nov-Jan) suit it best

## QA (python3 -I reels/qa.py thermos)
```
QA thermos: WARN   (/home/user/reel-render/jobs/thermos/thermos.mp4, 74.2 s)
  PASS  static          longest no-change run 0.75 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.0 s)
  PASS  safe zones      UI zones clear
  PASS  outer 24 px     clear
  PASS  loudness        -15.5 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -1.9 dBTP (WARN above -1.0, FAIL above 0.0)
  WARN  voice over bed  speech 5.8 dB above the pauses (11 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          74.2 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 7.6 (min 1.0), contrast 20.2 (min 18.0)
  PASS  9:16 frame      thermos.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```

Audio note: the AAC encode overshot to -0.8 dBTP, so the audio was re-limited once from the crf16 master (alimiter 0.72, AAC 96k); video untouched. The voice-over-bed WARN (5.8 dB) is inside the range of approved reels (ship 4.0 dB).
