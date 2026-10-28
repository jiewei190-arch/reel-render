# staticshock: why do you get more static shocks in winter? (Batch N, worker H3)

- Template: **#11 cel-boil** (kit_celboil.js: boiled ink lines, off-register cel paint, paper tooth, boiled glyph titles, sparks, star bursts, speed lines, screen shake). Why: the topic is one punchy action (finger, knob, ZAP), and the boil + shake + star burst sells a spark better than any flat template. The previous H3 reels were #15 Distilbook (snowwhite) and #23 Recipe card (handwarmer).
- Length 72.8 s; af_heart 0.97; music crayon 88 bpm at music_gain 0.7; fx_gain 0.5.
- Code: reels/t_staticshock.js, t_staticshock.html (copied from t_match.html), specs/staticshock.json, ev_staticshock.json, tl_staticshock.js.
- Batch N layout: captions in the boxed cel strip at y about 1165-1300; drawings inside y 250-1130; titles at y 300-460; the search question is spoken in line 2 at 2.7 s.
- Loop ending: in the last 0.5 s the frame-0 image (hand, door, "ZAP?") blends back in at most 40%.
- Demand signal: "why do I get shocked so much in winter" / "why more static in winter" are People-Also-Ask staples every cold season.
- Open question: why are winter shocks worse? Built in two halves: where the charge comes from (10-31 s, re-hooked by the SPARK at 29 s) and why winter changes it (32-55 s: the water film, cold air holds little water, "same water, drier air" at 48 s). The answer is spoken at 55-60 s.

## Softened / not used
- "Thousands of volts" without an exact number (UKY gives about 10,000 V per cm of spark).
- The key tip is a tip, sourced to the UAF Geophysical Institute and a Northeastern physicist. It says the spark hits the key rather than your finger, and makes no claim that the shock disappears.
- The humidifier tip went to the pinned comment, not the voice-over.
- No talk of which materials charge positive or negative (the triboelectric series), to keep the middle simple.

## QA (python3 -I reels/qa.py staticshock)
```
QA staticshock: WARN   (/home/user/reel-render/jobs/staticshock/staticshock.mp4, 72.8 s)
  PASS  static          longest no-change run 0.00 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.0 s)
  WARN  safe zones      right x>900 y900-1650: content 10.2-15.0s, 55.5-60.2s
  PASS  outer 24 px     clear
  PASS  loudness        -15.0 LUFS integrated (want -16.0..-14.0)
  WARN  true peak       -0.6 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 14.5 dB above the pauses (11 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          72.8 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 13.0 (min 1.0), contrast 33.6 (min 18.0)
  PASS  9:16 frame      staticshock.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```
- Safe-zone WARN: art only. It's the right end of the purple carpet (10-15 s) and the star-burst lines at the payoff door (55-60 s). There is no text in the zone; the caption boxes stay inside it.

## GROWTH checklist
- [x] Topic is a searched question; demand signal noted
- [x] Hook passes HOOKS.md (7-word first line, frame 0 a hand moving to a doorknob under "ZAP?", the zap at 1.95 s, "But" at 2.7 s)
- [x] 66-86 s (72.8 s); ends on the exact closing line
- [x] One-word-answer question before the closing line ("Do you get zapped a lot? Yes or no?")
- [x] End card: the standard main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (frame-0 image blends back, max 40%, in the last 0.5 s)
- [x] pinned_staticshock.md written
- [ ] staticshock_ep.mp4 (main session runs brand.py after the episode number is assigned)
- [x] Timely window: winter, November to February (peaks in the first cold, dry weeks)
