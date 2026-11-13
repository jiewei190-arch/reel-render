# fingerprints: NOTES (EP 97)

- **Template:** #8 urban-sketch, on the in-house urbansketch engine (as wetdog, EP 62).
  - Sepia fineliner first, then transparent washes; lines boil at 12 fps; the skin wash is the one coloured thing.
  - Handwritten margin note (y ~330) and handwritten caption (y ~1290); page turns between spreads; a slow hand-held camera.
- **Fingerprints:** generated whorl / loop / arch ridges. The seed decides the ridge endings, so the twins' prints share a pattern but differ in the circled details.
- **Pages:**
  - frame 0: a big fingertip with a brass loupe over the whorl; "grip?" gets a wobbly tick, then a red "?";
  - the friction test (Warman & Ennos): a fingertip pressed on a plastic strip being pulled, with a friction dial;
  - the contact patch from below: no ridges vs ridges, "−⅓ contact";
  - a "BUSTED?" stamp, then "not quite.": rough and wet sketches tagged IDEA;
  - "for touch?": a fingertip stroking fabric;
  - the ridged sensor (Scheibert et al.) sliding over a rough surface, a vibration line, a deep touch sensor (Pacinian) pulsing;
  - IDEA: feel fine textures (silk / denim / sandpaper);
  - a curled baby and a 1–9 month line; ridges grow from month 3 to month 6;
  - genes → pattern (whorl, loop, arch); womb → details (ridge endings circled);
  - identical twins "=", their prints "≠";
  - the payoff checklist: "grip on smooth things" crossed out; "grip on rough or wet surfaces" and "a sharper sense of touch" ticked, each marked "idea";
  - the question (yes / no boxes in the margin); the end card.
- **Layout:**
  - drawings y 250–1130; caption y ~1230–1360 (max width 760);
  - margin notes left-aligned at y 330, ending before x 860;
  - nothing written right of x 900 below y 840; nothing below y 1440.
- **Search question:** spoken at 0.35 s. Hook: 5 words. "But" at 2.1 s.
- **Re-hooks:** 17.2 s "Busted? Not quite."; 23.3 s "Here's the twist"; 42.3 s "before you're even born"; 54.9 s identical twins.
- **Payoff:** 58.9 s. Question: "Can you feel the ridges on your fingertip? Yes or no?"
- **Length:** 74.5 s. Voice af_heart 0.93; spec tail 0.6, so the end card is about 2.9 s. Crayon bed 88 bpm; music_gain 0.6, fx_gain 0.35.
- **Loop:** the last 0.5 s blends 30% of frame 0.
- **Sourcing:**
  - grip "busted" only for smooth surfaces;
  - the rough/wet and touch explanations are said as ideas and tagged IDEA on screen;
  - the touch result is from a lab sensor (said in the pinned comment).
- **Badge:** EP 97 at ("R", 260) = (651, 260).
  - v1 put the payoff fingertip and one long margin note under it. Fixed in v2: the finger moved to y 420, the note was shortened, and the BUSTED stamp moved down 40 px.
  - Checked every 3 s: clear of all text.
- **Ear check:** not done by a human yet.

## qa.py
```
QA fingerprints: PASS   (/home/user/reel-render/jobs/fingerprints/fingerprints.mp4, 74.5 s)
  PASS  static          longest no-change run 1.00 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.0 s)
  PASS  safe zones      UI zones clear
  PASS  outer 24 px     clear
  PASS  loudness        -15.6 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -2.1 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 10.9 dB above the pauses (5 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          74.5 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 10.1 (min 1.0), contrast 23.9 (min 18.0)
  PASS  blank frames    none
  PASS  9:16 frame      fingerprints.mp4 1080x1920 SAR 1:1; fingerprints_ep.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```

## GROWTH checklist
- [x] Topic is a searched question ("why do we have fingerprints"); demand signal: main-session assignment
- [x] Hook passes HOOKS.md v2 (5 words = the search question; frame 0 is a big fingertip under a loupe; "but" at 2.1 s)
- [x] 66-86 s (74.5); ends on the exact closing line
- [x] Short one-word question before the closing line
- [x] End card ≤ 3 s: main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (30% frame-0 blend)
- [x] Every claim sourced (sources_fingerprints.md); ideas marked as ideas; numbers in words in the spoken text
- [x] Pinned comment + thumbnail
