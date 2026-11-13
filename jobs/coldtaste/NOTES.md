# NOTES: coldtaste

**Template:** #23 Recipe card (demo t23), kit reels/styles/recipe/recipe.js, same as handwarmer.
**Why:** flavor really is a recipe: a few basic tastes, lots of smell, one open nose. The demo's grammar carries it: checklist card with ticks, a step header with a big counter, a segmented progress bar, a measuring scale (here "flavor"), and the handwritten sign-off ("Good drink." becomes "Good nose."). My last two reels were inkmoon (leafcolor) and cinefilm (candle).

**Shots (main-session note: no repeated composition):**
- 0-7 s: big strawberry, flavor meter draining full to none; "Tongue: fine. / Nose: off."; the search question typed in at 4.3 s.
- 7-12.6 s: tongue close-up in a paper panel; the five tastes land one by one while the counter runs 1 to 5.
- 12.6-17 s: wide cut-away, the recipe card slides in; strawberry, coffee, garlic.
- 17-26 s: retronasal zoom: the camera follows the smell dots up the back channel to the smell cells, which light up.
- 26-31 s: wide, "taste + smell", flavor sparkle, the back channel traced.
- 31-37.7 s: close on the nose: the lining swells, mucus plugs the channel, the cells get crossed out.
- 37.7-42 s: wide, "stuffy nose" struck on the card, meter drops to bland.
- 42-52 s: full frame: a big jellybean, a profile and a finger pinching the nostril; "just sweet", "let go!", cherry burst.
- 52-65 s: wide payoff with a slow push-in as the nose clears.
- 65-72 s: yes/no question (head shrunk underneath), then the clean centred end card with a small strawberry that loops to frame 0.

**Safe zones:** captions centred at y 1290 (auto-shrink to 50 px for the 4-line twist line), taste+smell=flavor strip at y 1384-1440; nothing written in the right column below 840. The progress bar ends at x 620 so the badge has the top-right.
**Voice:** af_heart 0.97, crayon bed at music_gain 0.6 (first render was 5.7 dB voice over bed), 72.2 s. Twist line re-voiced with the main-session wording "swelling and mucus stop smells reaching the smell cells high in your nose".
**Build notes:** first render failed "static" (5.75 s); fixed with beats, then the full shot rework above. The safe-zone WARN is the close-up panel's right edge (a drawing, no text) at x 900-1020.
**Softened claims:** see sources_coldtaste.md.
**Code:** reels/t_coldtaste.js, t_coldtaste.html, specs/coldtaste.json, ev_coldtaste.json, tl_coldtaste.js. Thumbnail: thumb_coldtaste.jpg ("Cold? It's your nose.").
**Badge:** `brand.py coldtaste --ep 58` at ("R", 260), top-right above the recipe card; the auto spot (651, 330) hit the step labels and the card. OVR line in brand.py; checked at 10 points from 1 s to 71 s.

## GROWTH checklist
- [x] Topic is a searched question (main-session assignment EP 58); "why can't you taste food when you have a cold" is a classic autocomplete question
- [x] Hook passes HOOKS.md (12 words, frame 0 strawberry with the meter moving, search question at 4.3 s)
- [x] 66-86 s (72.2 s); ends on the exact closing line
- [x] One-word-answer question before the closing line ("Have you tried the nose-pinch test? Yes or no?")
- [x] End card: standard main line + "A new 'wait, really?' every day." + handle
- [x] Loop ending (strawberry both ends; dim 30%)
- [x] pinned_coldtaste.md written
- [x] coldtaste_ep.mp4 (EP 58)
- [x] Timely window: cold and flu season

## QA (python3 -I reels/qa.py coldtaste)
```
QA coldtaste: WARN   (/home/user/reel-render/jobs/coldtaste/coldtaste.mp4, 72.2 s)
  PASS  static          longest no-change run 3.75 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.5 s)
  WARN  safe zones      right x>900 y900-1650: content 17.2-20.5s, 21.5-26.2s, 30.5-37.8s
  PASS  outer 24 px     clear
  PASS  loudness        -15.7 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -2.5 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 10.5 dB above the pauses (10 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          72.2 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 5.6 (min 1.0), contrast 27.1 (min 18.0)
  PASS  9:16 frame      coldtaste.mp4 1080x1920 SAR 1:1; coldtaste_ep.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```
