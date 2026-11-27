# earwax: NOTES

- **Template:** #21 Storybook paint (demo t21), via styles/storybook (the module behind microwavelight).
  - Re-templated at the main session's request: v1 was #10 paper-popup, but H4's microwavecenter (EP 74, the episode before) is popup.
- **Why this template:** a bedtime anatomy storybook:
  - painted night frames with hatching;
  - the demo's kid under drawn constellations;
  - the wax as a glowing golden hero;
  - the explanation drawn as white constellation-line diagrams (the "?", the conveyor arrows, the shield, the ABCC11 helix with G/A stars).
- **Pages:**
  - night hill with a giant painted ear rising like a moon (frame 0); "dirt?" struck through and "a built-in cleaner" written in gold;
  - the canal as a painted pink tunnel: glands drip glowing wax; dust and germ sprites get trapped; dew sparkles; constellation shield;
  - the conveyor: arrows carry wax outward and it dries and flakes at the opening, with a kid chewing in a moon bubble;
  - a cotton swab shoves the wax back to the eardrum ("ouch!"), with a red constellation X;
  - 12 million figures under the stars;
  - wet vs dry blobs; the ABCC11 helix (AA = dry, G = wet); a painted globe with East Asia lit;
  - the payoff: the hero with a broom under a constellation shield; the Wet/Dry question; the end card on the night hill.
- **Batch N layout:**
  - drawings inside y 250-1150;
  - labels over the pale canal walls are in dark ink;
  - the module's torn subtitle slip sits around y 1320, centred at x 500, max width 700.
- **Search question:** spoken at 0.35 s. Hook: 5 words. "But it isn't dirt" at 2.5 s.
- **Re-hooks:** 16.4 s "conveyor belt"; 32.3-39 s swabs; 44.9 s "Now the weird part".
- **Payoff:** 64.3 s. Question: "Wet or dry?"
- **Audio fix:** the first master failed qa true peak (+1.5 dBTP; the voice peaks near 0 dBFS at 1.1 s and 28.9 s).
  - Switched the bed to the crayon music, the storybook family's bed.
  - Re-muxed with loudnorm I -13 / TP -2 plus an alimiter at 0.66.
  - Result: -15.7 LUFS, -1.6 dBTP. The video frames were not re-rendered.
- **Length:** 75.0 s. Voice af_heart 0.97; mix2.py with fx_gain 0.35 and music_gain 0.6.
- **Loop:** the last 0.5 s blends 30% of frame 0 back in (the end card already shows the ear and the wax hero).
- **Badge:** EP 75 at (44, 260) over the sky band; hidden 0-5.7 s (under the hook title) and on the end card.
  - The (44, 1170) spot was tried first and clipped the three-line subtitle slip.
- **Ear check:** not done by a human yet.

## qa.py
```
QA earwax: PASS   (/home/user/reel-render/jobs/earwax/earwax.mp4, 75.0 s)
  PASS  static          longest no-change run 3.25 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.2 s)
  PASS  safe zones      UI zones clear
  PASS  outer 24 px     clear
  PASS  loudness        -15.7 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -1.6 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 7.2 dB above the pauses (11 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          75.0 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 13.2 (min 1.0), contrast 38.5 (min 18.0)
  PASS  blank frames    none
  PASS  9:16 frame      earwax.mp4 1080x1920 SAR 1:1; earwax_ep.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```

## GROWTH checklist
- [x] Topic is a searched question ("what is earwax for"); demand signal: main-session assignment
- [x] Hook passes HOOKS.md v2 (5 words = the search question, frame 0 is the ear rising like a moon with the glowing wax hero, "but" at 2.5 s)
- [x] 66-86 s (75.0); ends on the exact closing line
- [x] Short question before the closing line ("Wet or dry?")
- [x] End card: main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (30% frame-0 blend)
- [x] pinned_earwax.md written; thumb_earwax.jpg made
- [x] earwax_ep.mp4 (EP 75; OVR spot (44, 260), hidden 0-5.7 s + end card; checked at 6-69 s)
