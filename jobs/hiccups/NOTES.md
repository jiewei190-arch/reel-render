# hiccups: NOTES

- **Template:** #11 cel-boil (demo 55), reusing reels/kit_celboil.js + reels/styles/celboil (the engine behind match, glowstick and popcorn).
- **Why this template:** a hiccup is a short, punchy action beat repeated, which is cel-boil's ones/shakes/star-burst engine. Every "hic" is a jolt, a camera shake and a HIC! star on ones.
- **Demo moves used:**
  - exposure sheet (ones for hics and snaps, twos for diagrams, threes for the end card);
  - a fresh boil per drawing, off-register flat colour, paper tooth and graphite dust;
  - decaying camera shakes, star bursts, puffs;
  - boiled Caveat plaques and the boiled caption box.
- **New for this reel:**
  - the hiccuping kid (with a cutaway torso: windpipe, lungs, a red diaphragm dome that jerks down);
  - a vocal-cord "door" close-up;
  - the reflex loop (brainstem, nerve wire, a spark running round);
  - the hiccuping baby in a crib, and the bottle/burp puff;
  - a tadpole with pumping gills;
  - NOT PROVEN / NO PROOF stamps;
  - cure props;
  - a 2-day calendar and a stethoscope.
- **Batch N layout:**
  - plaques from y 300;
  - the caption box at x 60-900, y 1160-1430;
  - the bottom band holds the floor boards only.
- **Search question:** "why do we get hiccups?" is spoken at 3.7 s.
- **Hook:** "Hic! That sound is your throat slamming shut mid-breath." Frame 0 is mid-hic.
- **Theories marked:** the burp idea is "one idea" (Howes 2012) and the gill idea is "scientists suspect" (Straus 2003), followed by "Neither idea is proven yet". Cures: "no proof they work for everyone" (NHS). See a doctor after 2 days (NHS 48 h).
- **Re-hooks:** "Here's the weird part" at 23.6 s; "Another idea is stranger" at 40.7 s.
- **Length:** 72.2 s. Voice af_heart 0.97; mix2.py with fx_gain 0.35 and music_gain 0.6 (a pop + thud on each hic).
- **Loop:** the last 0.6 s dissolves into frame 0 (mid-hic).
- **Ear check:** not done by a human yet.

## qa.py
```
QA hiccups: PASS   (/home/user/reel-render/jobs/hiccups/hiccups.mp4, 72.2 s)
  PASS  static          longest no-change run 0.00 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 2.0 s)
  PASS  safe zones      UI zones clear
  PASS  outer 24 px     clear
  PASS  loudness        -15.5 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -2.1 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 15.4 dB above the pauses (8 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          72.2 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 17.4 (min 1.0), contrast 38.5 (min 18.0)
  PASS  9:16 frame      hiccups.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```

## GROWTH checklist
- [x] Topic is a searched question ("why do we get hiccups"); demand signal: Batch N topic list
- [x] Hook passes HOOKS.md v2 (10 words incl. "Hic!", frame 0 mid-hic with shake + burst, "but" at 3.7 s)
- [x] 66-86 s (72.2); ends on the exact closing line
- [x] One-word-answer question before the closing line ("What's your hiccup cure? One word.")
- [x] End card: main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (dissolve into frame 0)
- [x] pinned_hiccups.md written; thumb_hiccups.jpg made
- [x] hiccups_ep.mp4 (EP 59; OVR spot (44, 400), hidden from 67.7 s for the end card; checked at 1-70 s)
