# runnynose: why does your nose run when it's cold? (Batch N, worker H3)

- Template: **#4 Crayon picture book** (lemo-opuscar crayon-book). The demo's engine (crayon.js, gl.js, rig.js, pal.js) is copied into reels/styles/crayonbook/ and changed from 1920x1080 to portrait 1080x1920; lib.js replaces the demo's /core/lib.js. Why: a winter morning is a picture-book page, and the nose diagrams read best as a child's drawings. The previous H3 reel was #2 Red paper-cut (snowflake).
- Copied from the demo:
  - wax-crayon strokes that draw on and boil on twos (12 fps);
  - zig-zag colouring with overshoot past the outline;
  - the WebGL compositor: wax sticks only to the paper tooth's peaks by pressure, an emboss pass and a warm vignette;
  - character parts that knock the paper clear behind them (rig.js part());
  - a dozen-crayon box with indigo outlines (never black);
  - one watercolour only: a cold, pale ultramarine sky wash that the white-wax snow resists;
  - hand-lettered titles (Gaegu Bold) written letter by letter;
  - subtitles as the book's printed words (Patrick Hand) on a ragged knock-out patch of blank paper.
- Added for the topic and the notes: a crayon kid (beanie, pompom, striped scarf, mittens) with a dripping nose; a child-drawn profile of the nose and airway, framed per scene by the camera (whole head, nose, vessels, glands); a crayon snow ground on every page; and the book's doodles at the bottom right (a sled and two pines), right of the badge strip.
- Length 71.5 s; af_heart 0.97; music crayon 88 bpm at music_gain 0.7; fx_gain 0.5.
- Code: reels/t_runnynose.js, t_runnynose.html, specs/runnynose.json, ev_runnynose.json, tl_runnynose.js, reels/styles/crayonbook/.
- Batch N layout: subtitle patch bottom-anchored at y 1355 inside x 80-880; titles at y 260-470; drawings inside y 250-1150; badge strip y 1366-1440 free (the sled doodle sits to its right).
- Loop ending: in the last 0.5 s the frame-0 page dissolves in at most 40%.
- Demand signal: "why does my nose run when it's cold" is a top winter People-Also-Ask.
- Open question, answered as two drips: (1) the nose is the lungs' air conditioner; cold air is dry, nerves raise the alarm, the body sends extra blood (the vessels widen), glands make more mucus and water, more than it needs, and it drips. (2) Warm, wet breath condenses at the cold tip, like a foggy window. Then the name, "5 to 9 out of 10", and the payoff "not a germ, your nose working overtime".

## Approval notes applied
- "So your body sends extra blood": UQ says nerves signal the brain, which raises blood flow; "body" covers both readings. The picture shows the nose's vessels widening, with no brain.
- "WHY THE DRIP?" is on screen from frame 0.
- Fillers above y 1440: a crayon snow ground on every page, plus the sled and pines doodle.

## Softened / not used
- "Somewhere between half and nine out of ten" (UQ: 50-90%).
- "Isn't a germ": said as a reflex (Grayson: a nervous-system response). No claim that cold weather can't come with a cold.
- Left out: "the drip flushes germs" and "slowed cilia" (one physician's view in secondary coverage).

## QA (python3 -I reels/qa.py runnynose)
```
QA runnynose: WARN   (/home/user/reel-render/jobs/runnynose/runnynose.mp4, 71.5 s)
  PASS  static          longest no-change run 0.00 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.0 s)
  PASS  safe zones      UI zones clear
  WARN  outer 24 px     content at the frame edge 19.8-22.8s, 27.8-30.5s
  PASS  loudness        -15.2 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -1.4 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 10.7 dB above the pauses (13 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          71.5 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 16.5 (min 1.0), contrast 34.7 (min 18.0)
  PASS  9:16 frame      runnynose.mp4 1080x1920 SAR 1:1; runnynose_ep.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```
- Outer 24 px WARN: art only. The zoomed nose and vessel scenes (19.8-22.8 s, 27.8-30.5 s) let the drawn head touch the left edge, on purpose (camera push). There is no text at the edge.

## GROWTH checklist
- [x] Topic is a searched question; demand signal noted
- [x] Hook passes HOOKS.md (12-word first line; frame 0 the kid with a drop on the nose under the cold wash with white-wax snow, "WHY THE DRIP?"; "But" at 4.0 s; search question spoken at 4-8 s)
- [x] 66-86 s (71.5 s); ends on the exact closing line
- [x] One-word-answer question before the closing line ("Does your nose run in the cold? Yes or no?")
- [x] End card: the standard main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (frame-0 page dissolves in, max 40%, in the last 0.5 s)
- [x] pinned_runnynose.md written
- [x] runnynose_ep.mp4 (EP 45, spot (44, 1366); frames at 6/25/45/68 s checked, clear of all text)
- [x] Timely window: first cold mornings, November to February
