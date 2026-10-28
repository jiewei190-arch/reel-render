# yawn: NOTES

- **Template:** #13 collage "AI Doom" (demo 78), reusing reels/styles/aidoom and the cast and set pieces from the approved faces reel.
- **Why this template:** this is behaviour and psychology with two competing explanations. AI Doom tells ideas through paper sets and metaphors: two doors (COOLING / SOCIAL), a brain with radiator fins, a chalkboard experiment, a museum of species, a CONTESTED stamp.
- **Demo moves used:** wall + floor + baseboard paper sets (plus floorboards), the kid and the orange box creature as recurring cast, museum frames with velvet rope, plaques, chalkboards with chalk text, blueprint scene, ransom-note cut-out letters (title and end card), karaoke caption, watercolour mottle, hard cuts with a short whip blur.
- **Search question:** "why are yawns contagious?" is spoken at 3.6 s and shown on a plaque.
- **Hook:** "See someone yawn, and you'll probably yawn too." (9 words). Frame 0 shows the kid mid-yawn and the box creature already starting its yawn at t=0 (main-session note), with the caption "YAWNS SPREAD?". The "But" turn is at 3.6 s.
- **Open question:** why are yawns contagious? Answered at 66.2 s: both ideas may play a part, and they're still being tested. Re-hooks: "isn't just a human thing" at 17.2 s; "Here's a clue: in one study..." (cold pack, 9% vs 41%, Gallup & Gallup 2007) at about 43.5 s. Cooling and empathy are both worded as competing hypotheses.
- **Length:** 80.0 s (re-voiced after the storyboard notes). Mix uses fx_gain 0.35, no whooshes, and the new music_gain 0.6 spec key in mix2.py (default 1.0, so other reels are unchanged) because qa.py first failed the voice-over-bed check at 3.1 dB. After the fix it reads 8.4 dB on the final render.
- **Softened claims:**
  - "some chimpanzees" (2 of 6 in Anderson 2004);
  - dogs "later studies were mixed";
  - the empathy link is called "contested" and both ideas are "may play a part";
  - "most people in one study" for Provine;
  - Norscia & Palagi is an observational study (noted in sources).
  - Cut for weak sourcing: "a yawn lasts about six seconds" (secondary sources only).
- **Loop:** the last 0.6 s dissolves back into frame 0 (the kid mid-yawn); the end card already shows the kid starting to yawn.

## qa.py
```
QA yawn: WARN   (/home/user/reel-render/jobs/yawn/yawn.mp4, 80.0 s)
  PASS  static          longest no-change run 0.75 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.0 s)
  WARN  safe zones      right x>900 y900-1650: content 8.2-12.5s, 24.0-28.0s, 43.5-46.8s, 55.5-58.8s ...
  WARN  outer 24 px     content at the frame edge 8.2-12.5s, 12.8-15.5s, 23.8-28.0s, 28.2-31.2s ...
  PASS  loudness        -15.2 LUFS integrated (want -16.0..-14.0)
  WARN  true peak       -0.4 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 8.4 dB above the pauses (8 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          80.0 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 5.4 (min 1.0), contrast 29.7 (min 18.0)
  PASS  9:16 frame      yawn.mp4 1080x1920 SAR 1:1; yawn_ep.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```

## GROWTH checklist
- [x] Topic is a searched question ("why are yawns contagious"); demand signal: Batch N topic list (search-demand research)
- [x] Hook passes HOOKS.md v2 (9 words, frame 0 moving, 2-word ransom caption + plaque, "but" at 3.6 s)
- [x] 66-86 s (80.0); ends on the exact closing line
- [x] One-word-answer question before the closing line ("Did you yawn while watching this? Yes or no?")
- [x] End card: main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (0.6 s dissolve into frame 0)
- [x] pinned_yawn.md written
- [x] yawn_ep.mp4 (EP 34, rebuilt on the final render with the main session's OVR spot)
- **qa.py WARNs:** the right-column safe-zone and edge WARNs are art (floorboards, frames, cork border), not text. True peak is -0.4 dBTP.
