# snowflake: why do snowflakes have six sides? (Batch N, worker H3)

- Template: **#2 Red paper-cut** (lemo-opuscar papercut-red; the engine files paper.js, motifs.js, rig.js and hud.js are copied from the demo into reels/styles/papercut/, Fraunces OFL font from jsDelivr). Why: a paper snowflake is folded and cut, the template's own fold-cut-unfold move, and the window-flower rosette is literally a snowflake. The previous H3 reels used Recipe card, cel-boil and particle flock.
- Taken from the demo: red paper as the hero on a night-indigo paper ground (different paper families); every shape is cut, with hand-cut wobble, soft-light paper grain, a cut-edge rim and a tight paper shadow; yin-cut holes and slits (the honeycomb, the flake's core hexagon, the dotted hydrogen bonds); 12 fps stepped pieces with a one-step 1.15x pop; cut-out titles popping in letter by letter; the subtitle as a dark-red paper banner with sawtooth edges, swallowtails and gold flecks, dropping in on two steps; the folded stack and scissors; gold foil kept for one late moment (the "diary" payoff).
- **Demo elements copied after the storyboard notes** (compared with the demo poster and style frame):
  1. layered paper depth: night-indigo paper ground, two sawtooth-crest hill layers (#1f2a55, #29356e), a village row, a front snow layer; every piece casts a tight paper shadow on the one below;
  2. the village row from the demo's town: houses with tiled roofs cut as sawtooth rows, inset double-outline walls, doors and windows cut out, warm-lit windows with tiny red rosettes, and pines; the lit windows change from scene to scene;
  3. snow paper with crescent "smile" cuts, as on the demo's snowfield;
  4. paper fibre texture at full strength (the demo's soft-light paperGrain with fibres) on every piece;
  5. cut-out negative space: the yin-cut honeycomb, the flake's hexagon core and dot cuts, roof tiles, window and door holes;
  6. inset contours (the demo's double outline) on the wide red pieces: molecules, the honeycomb disc, the mitten, walls, snow;
  7. parallax: the far hills, mid hills, village, crescents and three depths of paper flakes all pan at different rates (0.3 / 0.55 / 0.7 / 1.0 / flakes 0.45-1.2), so something moves in every frame;
  8. kept from before: 12 fps stepped pieces with the one-step 1.15x pop, letter-by-letter cut titles, the swallowtail banner subtitle with gold flecks, the folded stack and scissors, gold foil saved for the "diary" payoff.
- Hook accuracy: "Never five. Never eight." over-claimed (Libbrecht notes rare three-fold crystals). The line is now "Every snowflake has six arms. Almost always six.", with two more six-armed flakes popping in and no crossed-out five- or eight-armed flakes.
- New for the topic: a procedural six-fold snowflake (spine, side branches, tip; one arm rotated n times), which grows from the prism in the "branches sprout" scene; cut-paper water molecules; the paper thermometer strip; cloud pieces; a paper mitten.
- Length 78.2 s; af_heart 0.97; music crayon 88 bpm at music_gain 0.7; fx_gain 0.5.
- Code: reels/t_snowflake.js, t_snowflake.html, specs/snowflake.json, ev_snowflake.json, tl_snowflake.js, reels/styles/papercut/ (demo engine + all.js re-export).
- Batch N layout: banner bottom at y 1355 inside x 70-890; titles at y 250-460; content inside y 250-1130; badge strip y 1366-1440 free.
- Loop ending: in the last 0.5 s the frame-0 image (the big red flake under "SIX ARMS.") dissolves in at most 40%.
- Demand signal: "why do snowflakes have six sides" / "why are snowflakes hexagonal" is a perennial winter People-Also-Ask.
- Open question: why six? Answered bottom-up (molecule > hydrogen-bond ring > honeycomb > prism > six corners > six arms). Re-hooks: the honeycomb at 25 s and "all six at once" at 48 s. Wow: "a diary of its fall, written six times" (gold).

## Softened / not used
- No "104.5° makes the hexagon" (see sources_snowflake.md): "bent, like a V" plus the hydrogen-bond ring.
- Temperatures are shown as Caltech gives them (-2 / -5 / -15 °C); the Nakaya name and date are left out.
- "Branches sprout from the six corners" (Libbrecht's wording), not "the corners grow fastest".

## QA (python3 -I reels/qa.py snowflake)
```
QA snowflake: PASS   (/home/user/reel-render/jobs/snowflake/snowflake.mp4, 78.2 s)
  PASS  static          longest no-change run 0.50 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.0 s)
  PASS  safe zones      UI zones clear
  PASS  outer 24 px     clear
  PASS  loudness        -15.3 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -1.2 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 9.4 dB above the pauses (12 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          78.2 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 7.5 (min 1.0), contrast 49.4 (min 18.0)
  PASS  9:16 frame      snowflake.mp4 1080x1920 SAR 1:1; snowflake_ep.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```

## GROWTH checklist
- [x] Topic is a searched question; demand signal noted
- [x] Hook passes HOOKS.md (9-word first line, "Every snowflake has six arms. Almost always six."; frame 0 a big red flake turning on 12 fps steps with paper snow falling; "But" at 4.3 s; search question spoken at 4-8 s)
- [x] 66-86 s (78.2 s); ends on the exact closing line
- [x] One-word-answer question before the closing line ("Ever caught one on your mitten? Yes or no?")
- [x] End card: the standard main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (frame-0 image dissolves in, max 40%, in the last 0.5 s)
- [x] pinned_snowflake.md written
- [x] snowflake_ep.mp4 (EP 47, spot (44, 1366); frames at 6/25/45/74 s re-checked on the final, clear of all text)
- [x] Timely window: first snow, November to February
