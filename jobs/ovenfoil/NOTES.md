# ovenfoil: NOTES

- **Template:** #3 blueprint (demo 8), reusing reels/styles/blueprint (the engine behind lock).
- **Why this template:** a rolling mill is a precise mechanism with parts (work rolls, nip, strip, passes), which is what blueprint is best for. The title block's STATUS carries the verdict (SIDE MATTERS? → EITHER SIDE → NON-STICK: DULL), and the film's single red stamp is EITHER SIDE.
- **Demo moves used:**
  - white line work on the uneven cyanotype sheet over drafting cloth;
  - draw-on with a glowing nib;
  - centre lines and dash conventions, paper-fill occlusion, hatching;
  - dimension lines, callouts with leaders;
  - FIG numbers struck through and rewritten as transitions;
  - the title block, double-ruled NOTE subtitles lettered on;
  - one red stamp.
- **New for this reel:**
  - isometric foil sheet (shiny streaks with a sweeping glint vs a dull hatched underside), then a push-in on its edge by the but-turn;
  - side-view rolling mill with rotating work rolls, a strip thinning pass after pass and a PASS counter;
  - the tear;
  - double rolling with a zoom on the nip (POLISHED ROLL / SHINY vs SHEET ON SHEET / MATTE), then the sheets peeling apart;
  - speed lines with 2,500 m/min;
  - two baking trays with "=";
  - non-stick coating on the dull side, with steam and a push-in;
  - fingerprint whorl;
  - a foil roll drawn in the bottom band (drawing only).
- **Batch N layout:** the module's sheet furniture is re-laid inside the safe band:
  - header y 280-420;
  - figure window y 440-1000;
  - title block y 1010-1138;
  - NOTE box y 1150-1425 at x 100-900;
  - nothing typed in the top 250 px or the bottom 480 px.
- **Search question:** "why does aluminum foil have a shiny side and a dull side?" is spoken at 4.5 s.
- **Hook:** "Shiny side out? The two sides of your foil aren't a cooking trick." (12 words). "But" at 4.5 s.
- **Re-hooks:** "Here's the catch" at 18.9 s; "So does the side matter when you cook?" at 43.6 s.
- **Motion fix:** the first render failed qa static (hook and non-stick scene). Added the glint and a stronger sheet wave, plus steam and a push-in on the non-stick scene. The non-stick callouts were moved inward so the push-in can't carry them into the right column.
- **Length:** 71.8 s. Voice af_heart 0.97; mix2.py with fx_gain 0.35 and music_gain 0.6.
- **Sources:** GDA factsheet (primary, industry association); Reynolds via TODAY/EatingWell. No university page was found for the foil-rolling detail.
- **Loop:** the last 0.5 s crossfades into frame 0 (same sheet).
- **Ear check:** not done by a human yet.

## qa.py
```
QA ovenfoil: PASS   (/home/user/reel-render/jobs/ovenfoil/ovenfoil.mp4, 71.8 s)
  PASS  static          longest no-change run 3.50 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.0 s)
  PASS  safe zones      UI zones clear
  PASS  outer 24 px     clear
  PASS  loudness        -15.4 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -1.7 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 15.7 dB above the pauses (9 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          71.8 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 14.8 (min 1.0), contrast 31.2 (min 18.0)
  PASS  9:16 frame      ovenfoil.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```

## GROWTH checklist
- [x] Topic is a searched question ("why does aluminum foil have a shiny side and a dull side"); demand signal: Batch N topic list
- [x] Hook passes HOOKS.md v2 (12 words, frame 0 drawn with labels, "but" at 4.5 s)
- [x] 66-86 s (71.8); ends on the exact closing line
- [x] One-word-answer question before the closing line ("Which side do you use? Shiny or dull?")
- [x] End card: main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (crossfade into frame 0)
- [x] pinned_ovenfoil.md written; thumb_ovenfoil.jpg made
- [x] ovenfoil_ep.mp4 (EP 60; OVR spot (651, 400): right of the FIG label above the figure labels; checked at 1-70 s)
