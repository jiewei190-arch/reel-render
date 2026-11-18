STATE: rendered (FORMAT v1, PC build)

# rule-of-72: FORMAT v1 render notes (PC build, style S6 COUNTDOWN)

`video.mp4` sha256 `dbab5889cc822fdbea1d266fcba26540f0cac9e27f7027e4ff2603502584b8c7`. 1080x1920, 30 fps, 869 frames (28.97 s), SUB=4 motion blur, 20.4 MB.
Built end to end on the PC:
- voice: Chatterbox D2 on the GPU, exaggeration 0.55, cfg 0.3; 29.0 s, line 2 trimmed to fit under 30 s;
- plan: `plan/plan_src.py`, 16 word-anchored shots;
- scene: `finance/render-pc/src/fin/v1/rule72count.tsx`, composition `RuleOf72V1` / `RuleOf72V1Sub`.

## The Short
A blocky game-show stage: "3 THINGS THAT DOUBLE", with podiums #3 #2 #1. #1 sits behind a red curtain, and the board slams in with "72 ÷ RATE = YEARS TO DOUBLE".
- **0.0 s:** Spender close-up, sly, twirling his card; a big #3 card whips past.
- **1.2 s:** "Number one is the scary one": the #1 sign flashes and Spender goes to shock (squash, slam).
- **3.9 s:** the board SLAMS (impact, shake).
- **6.3 s:** #3, Saver at 6%: board "72 ÷ 6% ≈ 12 YEARS", the jar fills, x2 stamp.
- **10.5 s:** #2 at 8%: "≈ 9 YEARS", "nice and slow".
- **14.5 s, open loop (50 %):** "And number one... wait till you see who's holding it". The stage dims, a spotlight hits the trembling #1 curtain (suspense, heartbeat, riser).
- **18.1 s, reveal:** the curtain flies UP; Spender holds his card at #1 with a 24% tag (boom).
- **19.7 s:** "72 ÷ 24% ≈ 3 YEARS".
- **21.9 s:** on "double", his OWE block doubles in volume (x2 stamp, shake).
- **23.7 s:** Saver's jar x2 vs Spender's OWE x2.
- **25.6 s:** SHORTCUT, NOT A PROMISE stamped on the board.
- **27.4 s:** back to the S01 lens; the loop lands on "Three things that double".

The corner tag reads "EXAMPLE RATES" (S05–S15).

## Pre-post gate (frame 0 and the first 2 s; see `frame0.jpg`, `strip_0-2s_6fps.jpg`)
| check | result |
|---|---|
| close-up >= 50 % of the frame, mid-action | yes: Spender's face and torso fill the frame, mid card-twirl, with a #3 card whipping past |
| hook text readable | yes: "3 THINGS THAT DOUBLE / #1 IS THE SCARY ONE", 74 px, 2 lines, top third |
| stake on screen by 0.5 s | yes, from frame 0 (the hook text) |
| first word by 0.3 s | yes: "Three" at 0.15 s |
| music and SFX at frame 0 | yes: toon3d `upbeat` bed from 0 s; whoosh plus bell at 0.00 s |
| emotion change by 1.5 s | yes: sly to SHOCK at 1.24 s ("Number one"), with squash and slam |
| no dark, empty or wide frame in the first 1 s | yes |

## QA
- **Audio:** -14.2 LUFS, true peak -1.6 dBFS (story_mix, 24 SFX cues, then mux_voice).
- **Whisper (small) on the final mix:** every word of script.txt. "Saver's/Spender's" come out as "savers/spenders", and the numbers as digits.
- **Critic:** 0 FAIL. SYNC 15 cuts within 1 frame; STATIC 0 s; EDGES captions 17.0 % from the side. frac_still 0.127.

## Clipping checks (final v3)
- **story_qa:** 869 frames x 4 sub-frames, **0 clips**. Head, torso and arm/hand boxes for both actors are checked against:
  - the podiums and the curtain (while it's up);
  - the OWE block (including after it doubles);
  - Saver's floor jar, the whipping #3 card and the #1 sign.
- **Fixed in the stills and scrub:**
  - The curtain first DROPPED through Spender's raised hands and the floor (the gate caught it). It now flies UP, and he raises his hands only once it's clear.
  - Saver stood in front of his podium, so the jar on top looked like it sat on his head. He now stands beside the podium.
  - In v1, the doubled OWE block sat right behind Spender's arm on screen (depth-correct, but read as touching). The block moved 0.25 m right, and S13 was re-aimed so both are in frame with a gap (v2 to v3).
- **By eye:**
  - 6 fps scrub (`scrub_6fps_0-12s.jpg`, `scrub_6fps_12-29s.jpg`) and impact frames plus 2 (`scrub_impacts.jpg`).
  - Feet on the floor throughout. No prop inside a head or body. Stamps and labels sit on boards or in front of props, not on faces.

Not uploaded. It waits for MAIN QA and a BM GO.
