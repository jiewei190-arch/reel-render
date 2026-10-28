# hotsauce: NOTES (EP 86)

- **Template:** #9 scifi-toon (lemo-opuscar/styles/scifi-toon), built on H1's brainfreeze rig (toon.js engine, Juno + Spud cast, portal wipes, VT323 world tags, Baloo subtitles with a speaker pill, Bungee lockup with an orbit ring).
- **Colourway:** chili-orange suit + navy boots, so it reads apart from brainfreeze and slipperyice.
- **Shots:**
  - hook (frame 0): Spud mid chili-burn, fire from his mouth, steam and sweat, camera shake, "SPICY = HOT?" lockup;
  - lab two-shot: Juno's thermometer reads CHILI: 21°C, NOT HOT; the portal opens;
  - U-1 THE TONGUE: capsaicin keys tumble onto the tongue; a nerve ending with its TRPV1 gate; real heat (> 43°C, a flame) opens it, OUCH!;
  - U-2 THE NERVE: a capsaicin key turns the gate with NO HEAT; the zap runs the wire to the brain; siren, FIRE!, then FALSE ALARM;
  - U-3 THE PRIZE: Nobel 2021 medal, the chili, and a plaque "DAVID JULIUS · TRPV1, shared with Ardem Patapoutian (touch)";
  - U-4 THE KITCHEN: don't grab water (red X); oil + water don't mix (drops slide off the oily capsaicin); casein grabbers wrap the keys and carry them off, EVEN SKIM;
  - lab payoff (board: SPICY = FALSE FIRE ALARM); the question (board MILK OR WATER?, two glasses and a "?");
  - end card in a dim portal.
- **Layout:**
  - subtitles at y ~1180-1400 centred at x 510 (max width 720);
  - world tags top-left from y 270; nothing typed in the top 250 px, the bottom 480 px or the right column.
- **Search question:** spoken at 0.35 s. Hook: 6 words. "But" at 2.5 s.
- **Re-hooks:** 19.9 s "Here's the trick"; 34.7 s the Nobel Prize; 41.7 s "Now the fix. Don't grab water."
- **Payoff:** 57.0 s.
- **Question:** "Milk or water: which do you grab? One word." Changed from "spiciest thing you've ever eaten?" at main's request (GROWTH rule 4, a one-word answer).
- **Length:** 69.0 s. Voice af_heart 0.92 with extra breaths. Spec "tail" 0.4, so the end card is 2.96 s (≤ 3 s).
- **Audio:** popup bed 96 bpm; music_gain 0.6, fx_gain 0.35. The first master failed true peak (+0.8 dBTP), so it was re-muxed with loudnorm I -13 / TP -2 plus an alimiter at 0.66: -15.3 LUFS, -2.8 dBTP.
- **Static fix:** the first render held still for 4.5 s in the nerve world (25.8-30.2 s); a slow camera drift and zoom were added there.
- **Loop:** the last 0.5 s rushes into a portal and comes out on frame 0 (template wipe).
- **Badge:** EP 86 at ("R", 260) = (651, 260); hidden for the first few seconds by brand.py's default fade-in. Checked every 3 s across the whole reel: it sits over teeth, the siren and wall art. The nearest text is the lab blackboard (58-66 s), about 25 px below it, and the end-card lockup below it.
- **QA WARNs (art only, no text):**
  - right column 49.5-56.5 s: kitchen tiles and floor, with casein swimming off to the right above y 900;
  - outer 24 px: hook camera shake (0-2.5 s) and the kitchen tile wall reaching the frame edge.
- **Ear check:** not done by a human yet.

## qa.py
```
QA hotsauce: WARN   (/home/user/reel-render/jobs/hotsauce/hotsauce.mp4, 69.0 s)
  PASS  static          longest no-change run 1.75 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.2 s)
  WARN  safe zones      right x>900 y900-1650: content 49.5-56.5s
  WARN  outer 24 px     content at the frame edge 0.0-2.5s, 41.5-56.5s
  PASS  loudness        -15.3 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -2.8 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 15.6 dB above the pauses (7 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          69.0 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 13.5 (min 1.0), contrast 61.8 (min 18.0)
  PASS  blank frames    none
  PASS  9:16 frame      hotsauce.mp4 1080x1920 SAR 1:1; hotsauce_ep.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```

## GROWTH checklist
- [x] Topic is a searched question ("why does spicy food feel hot"); demand signal: main-session assignment
- [x] Hook passes HOOKS.md v2 (6 words = the search question; frame 0 is Spud on fire, big and moving; "but" at 2.5 s)
- [x] 66-86 s (69.0); ends on the exact closing line
- [x] Short one-word question before the closing line
- [x] End card ≤ 3 s: main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (portal back to frame 0)
- [x] Every claim sourced (sources_hotsauce.md); the year and numbers in words in the spoken text
- [x] Pinned comment + thumbnail
