# wetdog: NOTES

- **Template:** #23 Recipe card (demo t23), reusing reels/styles/recipe (the engine behind H3's handwarmer).
- **Why this template:** wet dog smell really is a recipe: a dog, its microbes, their smelly molecules, a splash of water, time to dry. The demo's grammar carries it all:
  - the checklist card ticks each ingredient on its word;
  - the step header and big counter show 1 dog, 1 splash, 22 compounds, 32×;
  - the % scale beside the glass becomes a STINK scale beside the dog;
  - the progress bar runs RECIPE / DOG / SMELLS / WATER / DRY / THE MIX;
  - "Good drink." becomes "Good stink.".
- **New for this reel:**
  - a hand-drawn sitting dog (shakes at frame 0, tail wags, fur flattens and drips when wet, stink lines scale with the STINK level);
  - a fur loupe with drifting hairs, bacteria rods and budding yeast, purple molecules that stick and then get knocked loose;
  - a bucket pour; evaporation carrying molecules to a nose that goes "!!";
  - 22 vs 16 molecule rows; mushroom / cherry / flower / poop icons;
  - a 32× bar; everything stirred into a bowl "= wet dog"; a bath tub.
- **Batch N layout:** card x 560-1020 above y 830; handwritten captions centred at y 1290; content inside y 250-1130; nothing typed right of x 900 below y 840.
- **Search question:** "Why do wet dogs smell so bad?" is spoken at 0.35 s and typed in the search bar.
- **Hook:** that question (7 words). "But the smell isn't really the dog" at 2.7 s.
- **Re-hooks:** 28.4-37.7 s add water / up to your nose; 38.4 s "how many smells?"; 47-52 s mushrooms... poop.
- **Payoff:** 64.8 s. Question: "Yes or no?"
- **Motion fix:** the first render failed qa static at 13.8-20.0 s ("That's normal..."). Added hair drift inside the loupe, a loupe zoom-in and more microbes popping in; still diffs 0.75+ per 0.25 s.
- **Length:** 76.5 s. Voice af_heart 0.97; mix2.py with fx_gain 0.35 and music_gain 0.6 (ticks on each recipe line, bubbles on the water, chime at the nose; no whoosh).
- **Loop:** the last 0.5 s blends 30% of frame 0 back in (same as handwarmer).
- **Badge:** EP 62 at (44, 760), in the free band between the step header and the STINK scale; hidden on the end card from 72.4 s.
- **Ear check:** not done by a human yet.

## qa.py
```
QA wetdog: PASS   (/home/user/reel-render/jobs/wetdog/wetdog.mp4, 76.5 s)
  PASS  static          longest no-change run 3.50 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 4.0 s)
  PASS  safe zones      UI zones clear
  PASS  outer 24 px     clear
  PASS  loudness        -15.4 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -2.3 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 17.1 dB above the pauses (12 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          76.5 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 4.8 (min 1.0), contrast 27.9 (min 18.0)
  PASS  9:16 frame      wetdog.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```

## GROWTH checklist
- [x] Topic is a searched question ("why do wet dogs smell so bad"); demand signal: main-session assignment
- [x] Hook passes HOOKS.md v2 (7 words = the search question, frame 0 is a dog mid-shake with droplets, "but" at 2.7 s)
- [x] 66-86 s (76.5); ends on the exact closing line
- [x] Yes/no question before the closing line
- [x] End card: main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (30% frame-0 blend)
- [x] pinned_wetdog.md written; thumb_wetdog.jpg made
- [x] wetdog_ep.mp4 (EP 62; OVR spot (44, 760), hidden from 72.4 s; checked at 3-74 s)
