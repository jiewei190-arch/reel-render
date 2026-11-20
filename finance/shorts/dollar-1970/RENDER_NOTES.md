STATE: rendered (FORMAT v1, PC build)

# dollar-1970: FORMAT v1 render notes (PC build, style S5 CHARACTER-TALKS)

`video.mp4` sha256 `07bea18aee6094a9795569adbb9c756c21c71450167bb49f583ddf9a4b2edb95`. 1080x1920, 30 fps, 897 frames (29.90 s), SUB=4 motion blur, 22.0 MB.
Built end to end on the PC:
- **Voice:** Chatterbox D2 dialogue on the GPU (`finance/tools/voice_dialogue_pc.py`, `vo/speakers.json`), 29.59 s:
  - Spender: exaggeration 0.65, seeds 11, 7, 23.
  - Saver: exaggeration 0.45, seeds 7, 11, 23.
  - Both use cfg 0.3.
- **Plan:** `plan/plan_src.py`, word-anchored shots, TAIL 0.35.
- **Scene:** `finance/render-pc/src/fin/v1/dollar70talk.tsx`, composition `Dollar1970V1` / `Dollar1970V1Sub`.
- **Script:** the narration diff (cloud narrator to PC dialogue, numbers unchanged) is in `script.md`.

## The Short
A blocky corner shop. Spender (red) and Saver (green, glasses) talk it through.
- **0.0 s:** close on Spender holding up a $1 bill that shrinks. Hook text "YOUR $1 = UNDER 12¢ / (IN 1970 MONEY)". He says "Wait. My dollar is worth under twelve cents?!".
- **1.2 s:** macro on the bill floating over his fist next to the $1.00 snack; the UNDER 12¢ (1970 MONEY) stamp slams.
- **Saver explains:** "In 1970 money, yes". The $1.00 tag gets an ALMOST 9× stamp, then the CPI-U booklet: "Not a guess".
- **Open loop (about 47 %):** Spender asks "So where did it go?", and Saver answers "It's hiding in plain sight. Watch..." in a dim whisper mood.
- **1970 match cut:** the sepia shop with a $1.00 snack, then NOW: the tag rolls $1.00 → $8.70.
- **Twist:** "Roughly four percent a year, quietly". Coins drip from Spender and leave a trail while a calendar riffles 1970 → 2026.
- **Spender (sad):** "I never noticed a single year!" Saver: "Nobody does. You only notice the total. Like:".
- **S16** goes back to the S01 lens, and the loop lands on "Wait. My dollar...".

The corner tag reads "CPI-U AVERAGE".

## Pre-post gate (see `frame0.jpg`, `strip_0-2s_6fps.jpg`)
| check | result |
|---|---|
| close-up >= 50 % of the frame, mid-action | yes: Spender's face and torso fill the right side, holding up the $1 bill mid-shrink |
| hook text readable | yes: "YOUR $1 = UNDER 12¢ / (IN 1970 MONEY)", 2 lines, top third |
| stake on screen by 0.5 s | yes, from frame 0 |
| first word by 0.3 s | yes: "Wait" at 0.15 s |
| music and SFX at frame 0 | yes: toon3d `curious` bed from 0 s, whoosh at 0 |
| emotion change by 1.5 s | yes: curious to shock at 0.95 s |
| no dark, empty or wide frame in the first 1 s | yes |

## QA
- **Audio:** story_mix (22 SFX cues) then mux_voice: **-14.2 LUFS, true peak -1.6 dBFS**.
- **Whisper (small) on the final mix:** every line in order. Two context slips:
  - "You only notice the total" is written as "You never noticed the total" in the whole-file pass. On its own, the mix's last 3 s transcribes correctly with both `small` and `small.en`, and so does the line-9 audio alone.
  - "twelve cents" comes out as "12 cents" (digits).
- **Critic:** 0 FAIL. SYNC 15 cuts within 0 frames; STATIC longest 0.50 s (the $8.70 tag holding at 18 s); EDGES 16.3 %.

## Clipping checks (final v2)
- **story_qa:** 897 frames x 4 sub-frames, **0 clips**.
- **Fixed in the stills and scrub:**
  - Drip coins sank below the floor; they now land at y 0.07.
  - The frame-0 bill was hidden behind the forearm. In S01/S16 it's now held forward (hand + 0.12 up, + 0.14 toward the lens), and the lens is centred between face and hand.
  - In v1, S02's macro framed the fist with the bill flat on it like a sticker. The bill now floats just above the fist in world space, toward the lens. The stamp is narrower and sits above it.
- **By eye:**
  - 6 fps scrub (`scrub_6fps_0-12s.jpg`, `scrub_6fps_12-24s.jpg`, `scrub_6fps_24-30s.jpg`) and the impact frames plus 2 (`scrub_impacts.jpg`).
  - Feet on the floor throughout. The CPI booklet is in Saver's hand, not in his body. The drip coins sit on the floor.

Not uploaded. It waits for MAIN QA and a BM GO.
