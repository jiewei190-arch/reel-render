# hairwet: why does wet hair look darker? (Batch N, worker H4, EP 101)

- Template: **#15 handdrawn "Distilbook"** (styles/distilbook/distilbook.js, the wrinklyfingers/shiver grammar; reserved by the main session). Why: an optics mechanism (scatter -> film -> trapped -> absorbed -> shine) fits Distilbook's page-to-diagram zoom and felt-tip ray diagrams.
- Length 77.2 s (spec tail 0.7, end card about 3 s); af_heart 0.97; music crayon 88 bpm at music_gain 0.7; fx_gain 0.35.
- Code: reels/t_hairwet.js, t_hairwet.html, specs/hairwet.json, tl_hairwet.js, ev_hairwet.json.
- Beats:
  - frame 0: a felt-tip head, half wet (near-black with drops) and half dry, with the stack "Not dye. / Trapped light.";
  - the book page "3.1 Wet surfaces" with the search question highlighted;
  - one strand up close, rough cuticle, scattered rays reaching the eye ("plenty comes back");
  - the water film coating the strand;
  - steep vs shallow rays (TIR "bounces back inside", "shallow: escapes");
  - the bounce counter "chances to be absorbed";
  - air->hair vs water->hair refraction panels;
  - dry/wet eye meters;
  - the navy slide 18% -> 9% "wet sand" (Lekner & Dorf, 1988);
  - the sun glint "tiny mirror";
  - sand/concrete/jeans dry/wet cards;
  - drying with colour returning;
  - the payoff chain "trapped -> absorbed -> darker";
  - YES/NO pills with a sand swatch;
  - the logo end card.
- Chapter strip: scatter / film / trapped / absorbed / shine.
- Batch N layout: titles below the top-right badge strip; content between y 370 and about 1150; karaoke at y 1330; nothing written in the right column below y 840.
- Re-hooks: 27.2 s "Here's the twist: that trapped light gets more chances to be absorbed" (bounce counter), 45.5 s the 18% -> 9% navy slide, 50.5 s "And the shine?".
- Demand signal: "why does wet hair look darker" / "why do things look darker when wet" are evergreen People-Also-Ask questions.

## Softened / not used
See sources_hairwet.md (the "about half" figure stays tied to sand on screen and in the voice).

## QA (python3 -I reels/qa.py hairwet)
```
QA hairwet: PASS   (/home/user/reel-render/jobs/hairwet/hairwet.mp4, 77.2 s)
  PASS  static          longest no-change run 1.50 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 3.5 s)
  PASS  safe zones      UI zones clear
  PASS  outer 24 px     clear
  PASS  loudness        -15.7 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -2.3 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 6.5 dB above the pauses (14 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          77.2 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 6.7 (min 1.0), contrast 42.8 (min 18.0)
  PASS  blank frames    none
  PASS  9:16 frame      hairwet.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```
The encode used enc_hq.sh (with -aac_coder fast).

## Episode badge
`python3 -I reels/brand.py hairwet --ep 101` with OVR spot ("R", 260). The badge strip was checked every 3 s from 0 to 75 s; no content under the badge.

## GROWTH checklist
- [x] Topic is a searched question; demand signal noted
- [x] Hook passes HOOKS.md (9-word first line, frame 0 subject moving, "but" at 3.45 s)
- [x] 66-86 s (77.2 s); ends on the exact closing line; end card about 3 s
- [x] One-word-answer question before the closing line ("Have you noticed it on wet sand too? Yes or no?", YES/NO pills)
- [x] End card: the standard main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] pinned_hairwet.md written
- [x] hairwet_ep.mp4 made with brand.py (EP 101)
- [x] Evergreen

## Peer review
(pending; main session assigns a reviewer)
