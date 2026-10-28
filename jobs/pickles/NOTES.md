# NOTES: pickles (EP 88)

**Template:** #23 Recipe card (demo t23), kit reels/styles/recipe/recipe.js, the same kit as handwarmer and coldtaste.
**Why:** fermented dills really are a recipe. The demo's step header, big counter, checklist card with rust ticks, segmented progress bar and measuring scale beside the vessel carry the explanation directly: the vessel is a pickle jar and the scale reads "sour".

**Shots:**
- frame 0: "The sour? / Made by bacteria." over a bubbling jar, with bacteria popping in and the sour scale climbing;
- the search pill;
- "3 basics / the sour grows" with the card ticked (cucumbers, water, salt, dill, ~3 weeks);
- close-up panel: lactic acid bacteria on the cucumber skin;
- into the brine: bacteria eat the sugars;
- close-up: a bacterium turns sugar into lactic acid drops and CO₂ bubbles;
- a day counter to 21 while the jar turns olive and cloudy and the scale rises;
- "why all the salt?";
- salt picks a side: rot microbes held back, acid-makers fine;
- salt pulls water and sugar into the brine;
- once sour enough, spoilers are crossed out;
- "never cut the salt", with the salt row circled on the card;
- a second "Quick pickles" card slides in and vinegar is poured (the demo's liqueur pour);
- both jars over the "enough acid" line;
- yes/no;
- end card over the jar.

**Main-session changes:**
- No "Good ___." sign-off, since coldtaste used one. The reel ends on yes/no, then the standard end card.
- Spec `tail` 0.7 keeps the end card at 3.0 s.

**Accuracy:** NCHFP's tested fermented dill recipe includes 1/4 cup vinegar per gallon. The script therefore says "Most of the sour isn't poured in. It's grown." rather than "no vinegar", and the card's rows are cucumbers, water, salt, dill and ~3 weeks.

**Build notes:**
- The first render failed QA "static" (two 5-6 s stills on the jar). The cucumbers now bob gently in the brine and bubbles rise in the early jar shots, which gave a PASS.
- The "never cut the salt" circle was re-aimed at the salt row after the card title became one line.
- The cucumbers are now clipped inside the jar.
- Progress labels were shortened to START / SKIN / ACID / SALT / QUICK / DONE so they don't collide.

**Batch N layout:**
- progress bar at y 290 (ends at x 620 for the badge);
- header and card in y 360-830;
- jar in y 690-1160;
- scale at x 770;
- captions centred at y 1290.

**Voice:** af_heart 0.97, crayon bed at music_gain 0.55, 78.2 s.
**Sources:** sources_pickles.md.
**Code:** reels/t_pickles.js, t_pickles.html, specs/pickles.json, ev_pickles.json, tl_pickles.js.
**Thumbnail:** thumb_pickles.jpg ("Cucumber → pickle?").
**Badge:** `brand.py pickles --ep 88` at ("R", 256), no hide needed; checked at 4 points.

## GROWTH checklist
- [x] Topic is a searched question (main-session assignment EP 88)
- [x] Hook passes HOOKS.md (10 words; frame 0 is a big jar with bubbles, bacteria and the moving sour scale; search question at 3.9 s)
- [x] 66-86 s (78.2 s); ends on the exact closing line
- [x] One-word-answer question before the closing line ("Have you ever made your own pickles? Yes or no?")
- [x] End card: standard main line + "A new 'wait, really?' every day." + handle (no sign-off gimmick)
- [x] Loop ending (dim 30%; frame 0 is the same jar)
- [x] pinned_pickles.md written (includes the tested-recipe safety note)
- [x] pickles_ep.mp4 (EP 88)
- [x] Evergreen

## QA (python3 -I reels/qa.py pickles)
```
QA pickles: PASS   (/home/user/reel-render/jobs/pickles/pickles.mp4, 78.2 s)
  PASS  static          longest no-change run 4.00 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 3.0 s)
  PASS  safe zones      UI zones clear
  PASS  outer 24 px     clear
  PASS  loudness        -15.7 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -2.4 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 9.4 dB above the pauses (15 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          78.2 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 5.7 (min 1.0), contrast 29.3 (min 18.0)
  PASS  blank frames    none
  PASS  9:16 frame      pickles.mp4 1080x1920 SAR 1:1; pickles_ep.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```
