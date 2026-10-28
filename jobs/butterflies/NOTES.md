# NOTES: butterflies (EP 91)

**Template:** #21 Storybook paint (demo t21), kit reels/styles/storybook/storybook.js, the same kit as catseyes.
**Why:** a feeling explained to a child works best as a picture book. The demo's round-headed kid, warm glow halos with rays, night skies and white "constellation" line diagrams carry it: adrenaline is a glow, blood flow is red pencil arrows, and the gut's nerves and the vagus nerve are constellation lines over a night-sky body. The sketchbook page on the desk frames the question and the end, as in the demo.

**Shots:**
- frame 0: the kid in a costume in the wings by a red curtain, a glow and butterflies at the tummy, then red arrows "to the muscles";
- the question written on the sketchbook page;
- the stage: curtains open on the audience, the brain bubble says "big deal!";
- fight-or-flight: the adrenaline glow spreads through the constellation body;
- heart beats faster, blood goes to the muscles;
- blood is shunted from the gut, "digestion slows" (a snail);
- close-up: the stomach's nerves twinkle, "the flutter";
- the gut's web of nerves, the "second brain" (enteric nervous system);
- the vagus nerve with pulses in both directions;
- "immense crosstalk" (Braden Kuo, Harvard), with messages each way;
- nausea / cramps / butterflies triptych;
- "ready for action!" in the spotlight;
- rest-and-digest under the moon as the butterflies drift off;
- yes/no;
- end card on the sketchbook page (no sign-off gimmick).

**Batch N layout:**
- paintings and diagrams in y 300-1150;
- the kit's torn-paper subtitle centred at y 1300;
- headings at (330, 330), left of the EP badge.

**Build notes:**
1. The first render failed QA "static" in the crosstalk shot. Bobbing and a slow push-in fixed it.
2. The second render showed the badge covering the centred headings at y 330. Moving them to y 405 hit the drawings, so they now sit left of the badge.
3. The third render had a static FAIL in the vagus shot. A push-in fixed it.
4. Main-session request: the hedge "Physiologists think" now sits in the hook itself (0 s), so the strong opener doesn't read as settled fact. The diagram shots got a slow push-in after another static FAIL.
5. Script: "Harvard doctors" became "A Harvard gut doctor", because only Braden Kuo is quoted.

**QA:** no FAIL. One WARN: during the crosstalk push-in, stars move into the right column; no text is there.

**Voice:** af_heart 0.97, crayon bed at music_gain 0.55, 73.8 s; spec `tail` 0.7, so the end card runs 3.0 s.
**Sources:** sources_butterflies.md (the "stomach nerves notice" mechanism is hedged as "physiologists think").
**Code:** reels/t_butterflies.js, t_butterflies.html, specs/butterflies.json, ev_butterflies.json, tl_butterflies.js.
**Thumbnail:** thumb_butterflies.jpg ("WHY THE BUTTERFLIES?").
**Badge:** `brand.py butterflies --ep 91` at ("R", 256); no hide needed after the heading move.

## GROWTH checklist
- [x] Topic is a searched question (main-session assignment EP 91)
- [x] Hook passes HOOKS.md (12 words, hedged: "Those butterflies? Physiologists think it's your gut losing blood to your muscles."; frame 0 is a big painted kid backstage with glowing butterflies at the tummy; search question at 4.5 s)
- [x] 66-86 s (73.8 s); ends on the exact closing line
- [x] One-word-answer question before the closing line ("Do you get butterflies before big moments? Yes or no?")
- [x] End card: standard main line + "A new 'wait, really?' every day." + handle
- [x] Loop ending (dim 40%; the end and the hook are both the kid)
- [x] pinned_butterflies.md written
- [x] butterflies_ep.mp4 (EP 91)
- [x] Evergreen

## QA (python3 -I reels/qa.py butterflies), final render
```
QA butterflies: WARN   (/home/user/reel-render/jobs/butterflies/butterflies.mp4, 73.8 s)
  PASS  static          longest no-change run 3.25 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.2 s)
  WARN  safe zones      right x>900 y900-1650: content 45.8-53.2s
  PASS  outer 24 px     clear
  PASS  loudness        -15.5 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -2.9 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 9.0 dB above the pauses (14 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          73.8 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 10.1 (min 1.0), contrast 35.6 (min 18.0)
  PASS  blank frames    none
  PASS  9:16 frame      butterflies.mp4 1080x1920 SAR 1:1; butterflies_ep.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```
