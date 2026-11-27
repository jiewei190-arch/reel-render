# darknight: NOTES (EP 98)

- **Template:** #6 shadow-puppet (Lemo shadow-puppet grammar), on the in-house shadowpuppet kit. Layout and placard as catpurr (EP 42, Batch N).
  - Lamp behind cloth, dyed hide puppets on rods with rivets, carved lace (evenodd holes glow), cut-letter plaques that snap in from large and blurred, the storyteller's placard.
- **The night sky:** a dark hide sheet pricked with star holes, so every star is the lamp shining through. Labels on the dark sheet are glowing cut-letter boards (paper tags would vanish in multiply). Diagrams play on the open, lit screen.
- **Scenes:**
  - frame 0: a jointed watcher on a hill under the star sheet; plaque "WHY IS THE NIGHT SKY DARK?";
  - "if space went on forever": the holes multiply, and sight lines from the watcher's eye each end on a star;
  - the sheet opens, the screen glows like the Sun, and the watcher shields their eyes: "OLBERS' PARADOX";
  - the dust guess: a dust-cloud puppet drifts over the stars, soaks up light, heats up and glows orange;
  - the age: an hourglass puppet, "THE UNIVERSE HAS AN AGE" → "13.8 BILLION YEARS", light arrows at a fixed speed;
  - a map: Earth inside a growing bubble ("light had time to get here"); gold stars inside, ink stars outside with light arrows "still on its way";
  - expansion: galaxies spreading apart; a wave from a far galaxy to an eye stretches, reddens and weakens ("STRETCHED" → "REDDER, WEAKER");
  - the Big Bang glow: a glowing ring cools from orange to dark blue with long waves → "NOW: MICROWAVES", an eye with a slash ("invisible to our eyes");
  - payoff back under the sheet: "THE UNIVERSE HAD A BEGINNING", "most starlight: not here yet", "the rest: stretched";
  - the question ("A CLUE?" yes / no); the end card.
- **Layout:**
  - every top plaque sits 70 px lower than catpurr's (tops at y ≥ 345), so the badge fits the top-right band;
  - placard caption at y ~1290 (x 150-930); pictures inside y 250-1130; no text right of x 900 below y 840.
- **Search question:** spoken at 0.35 s. Hook: 12 words. "But" at 3.5 s.
- **Re-hooks:** 15.4 s the dust guess; 21.8 s "Here's the real answer"; 38.2 s "a second reason: space is expanding"; 49.2 s the Big Bang glow.
- **Payoff:** 55.8 s. Question: "Did you know the dark sky is a clue the universe had a beginning? Yes or no?"
- **Length:** 72.4 s. Voice af_heart 0.93; spec tail 0.6, so the end card is about 2.9 s. Crayon bed 88 bpm; music_gain 0.6, fx_gain 0.35.
- **Loop:** the last 0.5 s blends 30% of frame 0.
- **Sourcing:**
  - finite age = the main reason; expansion "partly explains" it (U. Oregon), hence "a second reason";
  - the question says "a clue", not "proof";
  - 13.77 billion years (NASA WMAP), spoken as "about thirteen point eight".
- **Badge:** EP 98 at ("R", 260) = (651, 260), no hide windows. Checked every 3 s: clear above every plaque. On the night scenes it sits over star holes only.
- **QA note:** "black bars 47%" is the dark night sheet at the edges, not letterboxing (median widest bar 0 px), so it passes.
- **Ear check:** not done by a human yet.

## qa.py
```
QA darknight: PASS   (/home/user/reel-render/jobs/darknight/darknight.mp4, 72.2 s)
  PASS  static          longest no-change run 2.25 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 2.5 s)
  PASS  safe zones      UI zones clear
  PASS  outer 24 px     clear
  PASS  loudness        -15.4 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -2.5 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 17.0 dB above the pauses (7 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          72.2 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 6.5 (min 1.0), contrast 23.0 (min 18.0)
  PASS  blank frames    none
  PASS  9:16 frame      darknight.mp4 1080x1920 SAR 1:1; darknight_ep.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 47% of samples (median widest bar 0 px)
```

## GROWTH checklist
- [x] Topic is a searched question ("why is the night sky dark if there are so many stars"); demand signal: main-session assignment
- [x] Hook passes HOOKS.md v2 (12 words = the search question; frame 0 is a star-hole night sky over a watcher; "but" at 3.5 s)
- [x] 66-86 s (72.4); ends on the exact closing line
- [x] Short one-word question before the closing line
- [x] End card ≤ 3 s: main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (30% frame-0 blend)
- [x] Every claim sourced (sources_darknight.md); numbers in words in the spoken text
- [x] Pinned comment + thumbnail
