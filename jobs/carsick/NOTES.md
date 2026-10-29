# carsick: NOTES (EP 89)

- **Template:** #11 cel-boil, built on H1's hiccups rig (kit_celboil.js: exposure sheet on ones/twos/threes, a new boil per drawing, camera shakes, off-register colour, paper tooth, boiled caption box).
- **Character:** the kid is EP 89's own design (yellow cap with a teal brim, round glasses), at main's request so it doesn't read as a sequel to hiccups' blue-shirt kid.
- **Scenes (one per phrase):**
  - frame 0: a big red car bouncing on ones, camera shake on every bump, the green swirl-eyed kid reading in the back, "WHY CARSICK?";
  - SENSES ARGUING: the ear's MOVING! vs the eyes' STILL! bubbles;
  - INNER EAR: three fluid loops sloshing, plus the snail;
  - SPIRIT LEVEL with a tilting head;
  - back seat "WE'RE MOVING!"; the eyes over the book "WE'RE SITTING STILL"; MUSCLES + JOINTS;
  - WHO'S RIGHT? (the brain with a "?"); SENSORY CONFLICT (two arrows clash in a star, "most accepted idea");
  - WHY FEEL SICK? (a POISON? lever, stamped THEORY); ANCESTOR SAFETY? (berries, "STILL A THEORY");
  - KIDS GET IT MOST: a qualitative age curve (rare under 2, peaking 7-12, no invented numbers);
  - MAKE THEM AGREE; SIT UP FRONT (horizon line, phone crossed out); LEAN INTO BENDS; GETS USED TO IT (trip cards, green → fine);
  - MISMATCH = PANIC (the brain on a red PANIC button); CARSICK? YES / NO; the end card.
- **Layout:**
  - plaques from y 300; boiled caption box bottom-aligned at y 1430, x 60-900;
  - nothing in the top 250 px, the bottom 480 px or the right column.
- **Search question:** spoken at 0.35 s. Hook: 5 words. "But" at 1.9 s.
- **Re-hooks:** 22.9 s "Here's the twist"; 31.4 s the poison THEORY; 43.4 s "kids get it most"; 47.6 s "The fix".
- **Payoff:** 60.9 s. Question: "Do you get carsick? Yes or no?" (one word).
- **Length:** 71.9 s (four sourced lines were added to reach about 70 s). Voice af_heart 0.94; spec tail 0.6, so the end card is about 2.9 s. Crayon bed; music_gain 0.6, fx_gain 0.35.
- **Loop:** the last 0.6 s blends at most 40% of frame 0.
- **Badge:** EP 89 at (44, 400), as hiccups (same rig).
  - Hidden 14.0-20.7 s and 59.9-66.9 s, where the speech bubbles reach under it, and on the end card (70 s+).
  - Checked every 3 s plus at the window edges: the "knees?" bubble at 21-23 s sits just below it without touching.
- **Ear check:** not done by a human yet.

## qa.py
```
QA carsick: PASS   (/home/user/reel-render/jobs/carsick/carsick.mp4, 71.8 s)
  PASS  static          longest no-change run 0.00 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.5 s)
  PASS  safe zones      UI zones clear
  PASS  outer 24 px     clear
  PASS  loudness        -15.5 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -2.2 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 17.0 dB above the pauses (6 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          71.8 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 14.3 (min 1.0), contrast 64.5 (min 18.0)
  PASS  blank frames    none
  PASS  9:16 frame      carsick.mp4 1080x1920 SAR 1:1; carsick_ep.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```

## GROWTH checklist
- [x] Topic is a searched question ("why do I get carsick"); demand signal: main-session assignment
- [x] Hook passes HOOKS.md v2 (5 words = the search question; frame 0 is a big bouncing car with a sick kid; "but" at 1.9 s)
- [x] 66-86 s (71.9); ends on the exact closing line
- [x] Short one-word question before the closing line
- [x] End card ≤ 3 s: main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (40% frame-0 blend)
- [x] Every claim sourced (sources_carsick.md); poison idea marked THEORY; numbers in words in the spoken text
- [x] Pinned comment + thumbnail
