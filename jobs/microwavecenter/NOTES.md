# microwavecenter: why is food cold in the middle after microwaving? (Batch N, worker H4, EP 74) — v2

- Template: **#10 paper-popup** (styles/popup/popup.js, the ship grammar). Why: a physical, kitchen-scale mechanism shown as a cut-paper pop-up book: the hero is a paper cutaway of a bowl whose heat map changes on cue (hot coral rim band about an inch deep, cold blue core, an ice core with crystals, a warm conduction ring, stirring and standing time evening it out). Last used for ship (EP 15); not in the last ~8 EPs.
- Length 76.0 s; af_heart 0.97; music crayon 88 bpm at music_gain 0.7; fx_gain 0.35.
- Code: reels/t_microwavecenter.js, t_microwavecenter.html, specs/microwavecenter.json, tl_microwavecenter.js, ev_microwavecenter.json.
- Copied from the demo/ship: cut-paper cards with white border, cardboard edge, grain and cut-out shadows; the standing back board on the fold (kitchen tiles + shelf, freezer frost, recipe card, lilac kitchen); back-to-front pop-ins; four acts with page turns; cardboard signs dropping on strings (Inside out?, Frozen?, 3 tricks, YES/NO, the follow sign); cream tags; flip slats (the three tricks); flat props lying on the lower page (tea towel, fork, oven mitt).
- Batch N layout: the scene is zoomed 1.08 about y 760 so the book fills the frame; subtitles on a cream paper strip centred at y 1290 (1160-1420); a hot/warm/cold legend strip at y 1075 fills the gap under the bowl; only art below y 1440.
- Hook: frame 0 is the kitchen with the oven humming and the cutaway bowl already showing a hot rim and a cold core (steam only at the edges); the "Inside out?" sign drops and gets a NOPE stamp at 1.4 s; "but" at 3.8 s.
- Re-hooks: 22.5 s "Here's the twist: frozen food is even worse" (page turn to the freezer; waves pass the ice as dashes), 45.0 s / 47.6 s "So how do you fix it? Three tricks" (slats flip; spoon, power dial, timer). Payoff 7.6-21.8 s and 63.1-68.2 s.
- microwavelight's (EP 53) mesh/standing-wave story is not used.
- Loop ending: the last 0.6 s dissolves back into frame 0 (the same bowl and oven).
- Demand signal: "why is my food cold in the middle microwave" / "do microwaves cook from the inside out" are evergreen searches.

## v2 (main session review: "the same front-on bowl in ~12 of 15 samples")
One composition and camera per beat; the front-on bowl only opens (p0-p1) and pays off (p13):
- p2 a pop-up cross-section page slicing the food, a paper ruler marking 1" against the hot band, waves stopping about an inch in (camera 1.3);
- p3 inside the oven: cavity glow, the turntable and plate rotating, a magnifier on jiggling water molecules;
- p4 a conduction chain of food cubes, edge to center, heat passed cube by cube (slow);
- p5-p6 a frozen block close-up: waves slip past the ice as blue dashes; then the edges thaw red-hot with drips while the middle stays icy;
- p7 the bowl from above: bubbling ring, icy center; p8 a big thermometer card with the 165 °F line beside the cold spot and its germs (USDA tag);
- p9 the 3-tricks sign and slats; p10 a paper hand stirring the top-down bowl (swirl, colors mixing); p11 a power-dial close-up; p12 a kitchen-timer close-up with the bowl evening out (USDA tag);
- per-beat camera (zoom 1.08-1.35, eased at each cut, slow push inside the beat); page turns now 0.6 s and the next spread pops in while the old page lifts (no empty page mid-turn); a second row of flat props fills the lower page under the subtitles.

## Softened / not used
See sources_microwavecenter.md (depth varies by food; no percentages or times; no mesh story).

## QA (python3 -I reels/qa.py microwavecenter, handoff qa.py with the blank-frames check)
```
QA microwavecenter: WARN   (/home/user/reel-render/jobs/microwavecenter/microwavecenter.mp4, 76.0 s)
  PASS  static          longest no-change run 0.00 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.0 s)
  WARN  safe zones      right x>900 y900-1650: content 0.0-38.0s, 38.2-75.5s; bottom y>1700: content 7.5-21.0s, 22.0-45.2s, 57.8-63.0s; top y<150: content 0.0-7.8s, 62.8-76.0s
  WARN  outer 24 px     content at the frame edge 7.5-45.0s, 51.2-53.8s, 54.8-63.0s
  PASS  loudness        -15.6 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -1.4 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 8.0 dB above the pauses (15 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          76.0 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 17.2 (min 1.0), contrast 58.5 (min 18.0)
  PASS  blank frames    none
  PASS  9:16 frame      microwavecenter.mp4 1080x1920 SAR 1:1; microwavecenter_ep.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```
The WARNs are art only: the book's cover edge, the oven mitt and the sign strings reach the right strip and the top band; no text sits there.
Fix history: the slats first flipped in over the "3 tricks" sign and under the dial (slats now 540 wide at x 350, after the sign rises); the lower page was empty (camera zoom 1.08, the heat legend and a fork added); the auto badge spot (651,330) sat on signs and tags.

## Episode badge
`python3 -I reels/brand.py microwavecenter --ep 74` with OVR spot ("R", 260), hidden under the Frozen? sign (21.8-24.6 s), the 3-tricks sign (44.4-47.8 s) and from the YES/NO signs to the end (68.7 s on); the power dial and timer moved down to clear it. Frames checked at 6, 10, 16, 21, 26, 36, 42, 46, 50, 55, 61, 66, 70 s.

## GROWTH checklist
- [x] Topic is a searched question; demand signal noted
- [x] Hook passes HOOKS.md (9-word first line, frame 0 subject moving (oven, steam, bubbles), the NOPE stamp at 1.4 s, "but" at 3.8 s)
- [x] 66-86 s (76.0 s); ends on the exact closing line
- [x] One-word-answer question before the closing line ("Do you stir your leftovers halfway? Yes or no?", YES/NO signs)
- [x] End card: the standard main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending
- [x] pinned_microwavecenter.md written
- [x] microwavecenter_ep.mp4 made with brand.py (EP 74)
- [x] Timely: holiday leftovers (late Nov - Dec), otherwise evergreen

## Peer review
(pending; main session assigns a reviewer)
