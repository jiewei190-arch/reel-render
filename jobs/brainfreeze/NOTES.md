# brainfreeze: NOTES

- **Template:** #9 scifi-toon (lemo-opuscar), reusing reels/styles/scifitoon (toon.js engine, Juno + Spud cast from the approved airfryer reel).
- **Why this template:** "your brain isn't freezing" is a myth-bust, and the template's grammar (a lab home world plus one palette per world, portal jumps) turns the mechanism into a trip: the palate world, the lab-study world, the nerve world and the cafeteria-trial world.
- **Demo moves used:** the boiling constant-width ink line on 12 fps, flat fills with hard shadow shapes, big-eyed cast with lip sync from the voice (lip_brainfreeze.js), the glowing portal as the only light source, a portal swirl wipe for every jump, the VT323 world tag typed in, the Bungee atomic-age lockup with an orbit ring (an ice cube orbits), Baloo subtitles with the speaker pill, a reaction close-up for the hook, and a slow push-in on the question.
- **New for this reel:** an ice-cream cone prop, brain-freeze FX (ice shards, zaps, shiver ticks), a brain under a dome ("PAIN SENSORS: 0"), the palate world (rugae, teeth, tongue, two vessels that pinch and then balloon), a Doppler CRT whose trace jumps with the pain, a nerve world (a head in profile with the three trigeminal branches and a zap), the cafeteria (145 cones splitting into two groups, 27% vs 13% bars), and an inset of the tongue-to-palate fix.
- **Own colourway (main-session note; H4's slipperyice is also scifi-toon):** teal Juno suit, peach lab, plum floor.
- **Batch N layout:**
  - Captions at y 1240-1400 (wrap 720 px, centred at x 510, so nothing goes right of x 900).
  - The world tag at y 270.
  - The lockup centred at y 470.
  - In the hook, the jar labels and blackboard text are hidden so the top 250 px carries no text.
- **Search question:** "why do you get brain freeze?" is spoken at 3.9 s.
- **Hook:** "Eat ice cream too fast, and your forehead screams." (9 words). Frame 0: Spud mid brain-freeze with a camera shake and the BRAIN FREEZE lockup. "But" turn at 3.9 s.
- **Open question:** why it hurts. Answered at 45.9-49.5 s (the trigeminal nerve, referred pain) and at 67.7 s ("an alarm from your mouth"). Re-hooks: "Here's the twist: scientists watched it happen" at 23.6 s; "And speed matters" at 50.2 s.
- **Main-session notes applied:**
  - "In a small 2012 study" (Serrador was a conference abstract), with the artery widening worded as "the scans suggest".
  - The BMJ 2002 trial is kept light.
  - The study screen reads "Serrador et al. 2012 · small study".
- **Length:** 79.3 s. Voice af_heart 0.97; mix2.py with fx_gain 0.35 and music_gain 0.6. No whooshes; sparkles on the portal jumps.
- **Softened claims:**
  - "the leading idea" for the constrict-then-dilate mechanism;
  - "a small 2012 study" and "suggest";
  - no 40% prevalence figure;
  - Serrador's skull-pressure idea is not used.
- **Loop:** the last 0.5 s rushes into a portal (the template's own wipe) and comes out on frame 0.
- **Ear check:** not done by a human yet (no audio playback in the cloud session).

## qa.py
```
QA brainfreeze: WARN   (/home/user/reel-render/jobs/brainfreeze/brainfreeze.mp4, 79.2 s)
  PASS  static          longest no-change run 2.25 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.0 s)
  PASS  safe zones      UI zones clear
  WARN  outer 24 px     content at the frame edge 0.0-3.8s, 18.0-23.0s
  PASS  loudness        -15.2 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -1.4 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 16.0 dB above the pauses (8 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          79.2 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 14.9 (min 1.0), contrast 61.9 (min 18.0)
  PASS  9:16 frame      brainfreeze.mp4 1080x1920 SAR 1:1; brainfreeze_ep.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```

## GROWTH checklist
- [x] Topic is a searched question ("why do you get brain freeze"); demand signal: Batch N topic list (search-demand research)
- [x] Hook passes HOOKS.md v2 (9 words, frame 0 moving, lockup caption, "but" at 3.9 s)
- [x] 66-86 s (79.3); ends on the exact closing line
- [x] One-word-answer question before the closing line ("Ever had one? Yes or no?")
- [x] End card: main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (portal wipe back into frame 0)
- [x] pinned_brainfreeze.md written; thumb_brainfreeze.jpg made
- [x] brainfreeze_ep.mp4 (EP 43; OVR spot (651, 260) in the top-right band, hidden 3.7-11.8 s and from 64.4 s, where the lab blackboard text sits; checked at 6, 13, 25, 45, 62, 70 s)
- **qa.py WARN:** outer 24 px only (the hook close-up and the palate world fill the frame edge with art).
