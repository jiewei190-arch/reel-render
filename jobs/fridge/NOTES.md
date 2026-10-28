# NOTES: fridge

**Template:** #3 blueprint (lemo-opuscar/styles/blueprint grammar), kit reels/styles/blueprint/blueprint.js, same as lock and spidersilk.
**Why:** a precise mechanism with four named parts, which is the blueprint template's strength. Beats:
- the elevation with heat pouring out of the back, "MAKES COLD" struck through;
- "cold = less heat" with heat dots leaving the box;
- FIG. 3, the refrigeration loop drafted with balloons 1-4;
- camera close-ups FIG. 3A-3D (evaporator, compressor, condenser coils, valve) with refrigerant dots circulating;
- the full loop with HEAT IN / HEAT OUT and the one red stamp "MOVES HEAT";
- the rear view (warm coils), door open (the heat goes round), same trick (air conditioner);
- the spec question and the end card.

The STATUS field tells the story (MAKES COLD? → MOVES HEAT → PUMPING HEAT → HEAT OUT BACK). My last two reels were Distilbook (voicerecording) and the recipe card (coldtaste).

**v2 (main-session note: H1's ovenfoil, EP 60, is also blueprint and posts a day earlier):**
- a sepia diazo sheet (brown ink on cream stock) replaces the cyanotype;
- a new ruled two-row title block: DWG FR-66 / HOW IT REALLY WORKS, then FIG + STATUS (status in red);
- the refrigerant loop is colour-coded and always flowing: cold blue through the evaporator and suction line, hot red out of the compressor, amber as it cools up the back coils, with dashes and dots moving round;
- heat arrows are red;
- the door-open sheet draws the kitchen (window, counter, cabinets) straight away, the door swings open, and red heat dots circle the room (this also fixed a static FAIL at 52.8-57.5 s).

The kit's Poppins→Inter fix is noted in reels/styles/blueprint/README.md.

**Batch N layout:** the kit's header (y 104-232), NOTE box (y 1372-1690) and title block (y 1722) sit in the UI bands, so this reel draws its own furniture:
- header text at y 284-342;
- figure viewport at y 360-1140 (VP override);
- a centred double-ruled NOTE box at y 1158-1414 (text x 146-866);
- no title block; the top-right is left for the badge.

**Fonts:** the kit asks for Poppins, which isn't in the repo (lock and spidersilk fell back to a serif). t_fridge.html maps "Poppins" to the repo's Inter.
**Voice:** af_heart 0.97, crayon bed at music_gain 0.6, 68.7 s.
**Sources:** see sources_fridge.md (Penn State + EPA; I couldn't find a DOE page).
**Code:** reels/t_fridge.js, t_fridge.html, specs/fridge.json (replaces the kit's unused draft), ev_fridge.json, tl_fridge.js. Thumbnail: thumb_fridge.jpg ("YOUR FRIDGE MOVES HEAT").
**Badge:** `brand.py fridge --ep 66` at ("R", 256), above the STATUS field (moved to y 342). OVR line in brand.py; checked at 12 points.

## GROWTH checklist
- [x] Topic is a searched question (main-session assignment EP 66)
- [x] Hook passes HOOKS.md (8 words, frame 0 heat arrows moving, search question at 3.6 s)
- [x] 66-86 s (68.7 s); ends on the exact closing line
- [x] One-word-answer question before the closing line ("Have you felt the warm air behind your fridge? Yes or no?")
- [x] End card: standard main line + "A new 'wait, really?' every day." + handle
- [x] Loop ending (small fridge under the end card; dim 40%)
- [x] pinned_fridge.md written
- [x] fridge_ep.mp4 (EP 66)
- [x] Timely window: evergreen

## QA (python3 -I reels/qa.py fridge)
```
QA fridge: PASS   (/home/user/reel-render/jobs/fridge/fridge.mp4, 68.8 s)
  PASS  static          longest no-change run 2.25 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.0 s)
  PASS  safe zones      UI zones clear
  PASS  outer 24 px     clear
  PASS  loudness        -15.7 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -2.6 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 10.7 dB above the pauses (12 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          68.8 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 9.8 (min 1.0), contrast 53.8 (min 18.0)
  PASS  9:16 frame      fridge.mp4 1080x1920 SAR 1:1; fridge_ep.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```
