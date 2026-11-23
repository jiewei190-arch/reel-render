# four-money-minds: STACKED-LANES STYLE TEST (S8)

Inspired by the FORMAT of a viral "four minds, same situation" reel (4 stacked lanes, one shared event,
each lane reacts differently, "which one are you?" comment bait). Do NOT copy its look: no stick figures,
no MOTIVATION/DISCIPLINE/OBSESSION/ANGER labels. Use our blocky characters, our money story.

## Layout
- 1080x1920, dark background. 4 horizontal lanes stacked top to bottom, each ~380 px tall, each with a glowing
  coloured floor strip and a small label top-left. The hook text (top) and captions (bottom-centre) get their own
  bands, so lanes sit between about y=260 and y=1660.
- Lane order + colour + character (all original blocky avatars, same rig as Spender/Saver):
  1. SPENDER (red floor): Spender.
  2. SAVER (green floor): Saver.
  3. INVESTOR (blue floor): NEW blocky character, blue, cap.
  4. DEBT KILLER (orange floor): NEW blocky character, orange, headband.
- Each lane = one shared camera angle (side view, character on the left third, action to the right), so all four
  read at a glance. One scene with 4 stages stacked + orthographic or matched cameras, or 4 views; your choice.

## Timeline (28.0 s; VO only at 0-3.6 s and 21.5-27.3 s; the middle is music + SFX + lane action)
- 0.0 s: all 4 characters stand still; a "$1,000 BONUS" envelope drops into EVERY lane at once (impact SFX at 0).
  Hook text: "SAME $1,000. 4 MINDS." VO: "Four money minds. Same thousand dollar bonus."
- 1.0 s: first cut/zoom (hook rule): quick push-in on all lanes, envelopes open.
- 3.6-21.5 s: lanes act in a staggered rhythm (one lane "hits" every ~1 s so there is always motion), each lane has
  a $ counter at its right edge (inside frame, 16 px margin):
  - SPENDER: shoes box, gaming headset, food bags fly in; counter 1000 -> 0; ends sitting on the boxes, broke face.
  - SAVER: drops it into a jar labelled SAVINGS; calm; counter stays $1,000 then ticks +4% -> $1,040.
  - INVESTOR: puts it in a box labelled INDEX FUND; a line chart wiggles up AND down (one scary dip mid-way) -> $1,070.
  - DEBT KILLER: hits a red "CREDIT CARD $1,000 22% APR" board with a hammer; board shatters; counter shows
    "INTEREST AVOIDED +$220".
  - ~12 s: a "1 YEAR LATER" calendar flips across ALL lanes at once (whoosh SFX) - open loop beat.
- 21.5 s: final scoreboard per lane (big): SPENDER $0 · SAVER +$40 · INVESTOR +$70* · DEBT KILLER +$220.
  "BORING = WINNER" crown drops on the Debt Killer at "the boring one won" (~23.8 s). VO line 2.
- 26.8-27.3 s "Which one are you?": all 4 look at camera; text "WHICH ONE ARE YOU? 👇" (use an arrow drawn, not an emoji glyph, if the font lacks it).
- Loop: last frame matches the 0.0 s standing pose so it loops cleanly.
- Disclaimer line on screen: "EXAMPLE - 4% APY, 7%/YR (CAN GO DOWN), 22% APR. NOT ADVICE".

## Audio
- voice.wav is final (Tyler; silence in the middle by design). Do not re-voice.
- Music: there is no music library in the repo. Synthesize an ORIGINAL simple beat in Python/numpy (kick on the beat,
  hat offbeats, a 2-chord synth pad, ~100-110 BPM, -24 LUFS under the VO, ducked further under VO). No downloaded music.
- SFX from the existing set: impact at 0, pops/whooshes on each lane hit, cash register for Spender, glass shatter
  for the debt board, ding on the crown.

## Captions
Bottom-centre, only during VO. Lane labels + counters carry the middle section.
