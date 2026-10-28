# goosebumps: why do we get goosebumps? (Batch N, worker H3)

- Template: **#28 Sand art** (demo t28, x.com/Michaelzsguo; no source code, built from the demo frames). Why: the answer is a story of silhouettes (a cold arm, a goose, a puffed cat, a hairy ancestor, a mouse), and the demo tells history in exactly those sand silhouettes. The previous H3 reels were #4 Crayon picture book and #2 Red paper-cut.
- Taken from the demo:
  - a warm sepia light table with a bright centre, blotchy darker edges and heavy grain that changes every 12 fps step;
  - dark sand silhouettes standing on a dark sand horizon;
  - shapes that form from falling sand (grains rain down and settle, then the solid fills in);
  - hand-sweep smear transitions between scenes;
  - light drawn as sun rays;
  - serif titles top-left with an italic sub-line (LibreBaskerville), like the demo's dated captions;
  - drawings scratched into the dark ground with light sand, with a trickle of grains at the drawing tip.
- Length 73.0 s; af_heart 0.97; music crayon 88 bpm at music_gain 0.7; fx_gain 0.5.
- Code: reels/t_goosebumps.js, t_goosebumps.html, specs/goosebumps.json, ev_goosebumps.json, tl_goosebumps.js.
- Batch N layout: horizon at y 1010; ground drawings at y 1010-1140; cream serif captions bottom-anchored at y 1355 inside x 80-880; titles at y 270-460; badge strip y 1366-1440 free.
- Loop ending: in the last 0.5 s the frame-0 image (the forearm with rising hairs) dissolves in at most 40%.
- Demand signal: "why do we get goosebumps" is an evergreen People-Also-Ask that spikes in cold months.
- Open question: why goosebumps? The muscle (arrector pili, nerve, hair up, bump), then why it exists (the cat's puffed fur traps warm air; hairy ancestors; mostly a leftover on us), then the Harvard twist (the same nerve wires into hair stem cells; in mice a long cold spell grew fur faster; the muscle keeps the nerve plugged in), and the payoff "your body's old fur coat".

## Approval notes applied
- Hook: a frame-wide forearm close-up; hairs stand up and the bumps swell from frame 0; the goose arrives at the 5 s turn.
- The dark ground is no longer empty: the horizon is lifted 110 px and each scene scratches a sand drawing into the ground (wind and a dropping thermometer; the cold → nerve → muscle → hair-up chain; a fur strip that thins from cat to ancestor to us; a nerve line to the stem cells; a days-of-cold strip with fur growing, labelled "(mice)").
- "In mice" is on screen: "In mice / a long cold spell" and "More fur / in mice: grew faster" at the 50 s re-hook, plus "more fur (mice)" on the short-vs-long card.

## Softened / not used
- "Mostly a leftover" (not "useless"); mouse results always said and shown as "in mice"; no claims about human hair regrowth or baldness.

## QA (python3 -I reels/qa.py goosebumps)
```
(filled in after the final render)
```

## GROWTH checklist
- [x] Topic is a searched question; demand signal noted
- [x] Hook passes HOOKS.md (12-word first line; frame 0 a big moving subject, the forearm with hairs rising; "But" at 3.9 s; search question spoken at 4-7 s)
- [x] 66-86 s (73.0 s); ends on the exact closing line
- [x] One-word-answer question before the closing line ("Do you get goosebumps from music too? Yes or no?")
- [x] End card: the standard main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (frame-0 image dissolves in, max 40%, in the last 0.5 s)
- [x] pinned_goosebumps.md written
- [x] goosebumps_ep.mp4 (EP 55, spot (44, 1366))
- [x] Timely window: cold months, November to February (evergreen)
