# raise-tax-myth: render notes (PC GPU, S2 Spender vs Saver, voice Tyler, first 54 s long test)

## v4 (2026-11-19), the delivered cut
- sha256 3e92bf0b6e23118bfb5bb2bb772d3fdcbc24d72293d80fc02e2e462651178fa8; 1080x1920, 30 fps, 1620 frames, 54.00 s video and audio, 41.6 MB.
- Rendered as `RaiseTaxMythRecipeSub` (SUB=4 motion blur plus the quality pass) on the RTX 4060.
- Loudness: I -14.2 LUFS, true peak -2.4 dBFS (mux_voice.sh with LIMIT=0.74 TPMAX=-1.5).
- **Voice:** voice.wav and vo/timings.json as delivered (Tyler). Not re-voiced.
- **Mix:** story_mix.py with an end-clear cue file (`out/tmp/raise-tax-myth.endclear.cues.json`). After 53.0 s the impact, whoosh and coins cues are dropped and the thud lowered to -12 dB, so the last word "word..." stays clear.

## Recipe
`recipe.json`: 22 shots, all in the office set. Cast is SPENDER and SAVER only. Eggs: cat and mug; final gag catCoin.

- **Hook:** two lines, "TURNED DOWN $10K / FOR *TAXES*?", with TAXES in red.
  - The FORMAT v1 gate allows 5 words at most. The brief's "TURNED DOWN $10K / BECAUSE OF TAXES?" is 6 words, so "BECAUSE OF" became "FOR".
  - The red word uses new `*word*` markup in `src/fin/v1/kit.tsx` HookText. It's additive: hook texts without `*` render exactly as before.
  - The hook text returns with the loop board.
- **Frame 0:** Spender close-up, smug, holding an OFFER +$10,000 RAISE letter. A red DECLINED stamp slams onto it at 0.72 s.
  - Planned change: the brief's "tearing up" was first built as a burst, but the burst cubes clipped through Spender (clip QA), so a stamp replaced it.
  - First cut at 1.00 s.
- **Shots 2-8:**
  - +$10,000 RAISE board on "ten", then a red TAXES? board on "taxes".
  - Spender points at a TAX BRACKET sign; then a TAKE HOME LESS? board.
  - Saver: a SIGNED +$10,000 board slams in.
  - Split screen for "same job, same city".
  - 2025 FEDERAL / SINGLE FILER board.
  - Spender's TAXABLE counter runs 0 to $100,000.
- **The bracket staircase (19.9-29.7 s):** four stacked steps, 10% / 12% / 22% in green.
  - The top step lands as a green $110K block on "ten". A "$103,350" marker flies in on "three", level with the top of the 22% step.
  - On "twenty-four" the top step becomes a red 24% block, with a flash and shake. Everything below stays green.
  - A green BELOW = SAME board drops on "same", and Saver points at the stack.
  - Still: `still_staircase_26s.jpg`.
- **Open loop at 29.7 s (55 %):** a covered PAYCHECK ? block.
- **Ticker:**
  - EXTRA +$10,000;
  - -$2,333 FEDERAL on "twenty-three";
  - -$765 PAYROLL on "seven";
  - OLD PAY SAFE stamp on "never".
- **Twist:** a big KEPT +$6,902 board over Saver on "sixty-nine", with coin rain and a flash. Then Spender KEPT $0.
- **Five years:** Saver's 5 YEARS counter runs 0 to $34,510. Spender's 5 YEARS $0 board lands on "no".
- **Loop:** back to the frame-0 close-up. The red TAXES? board drops from above the frame and lands on the last word "word..." (53.50 s; the word starts at 53.48 s).
- **Disclaimer tag:** "EXAMPLE · 2025 FEDERAL · SINGLE · NOT ADVICE", from 1.0 s to the loop.

## QA
- **Recipe gate** (RECIPE_QA.md): every frame-0 rule passes. One warn is expected and remains: length 54 s, outside the 20-30 s range, because this is the long test.
  - Hook rule: first cut 1.00 s; loop board on the last word.
  - Caption centre >= 65 % on 100 % of caption time. Caption-safe framing lifted 8 shots.
  - Frame-edge check is clean.
  - Clip QA: 0 clips over 1620 frames x 4 sub-frames.
- **Critic:** SYNC passes on 21 cuts (max offset 1 frame). STATIC: no near-still run. Caption edge margin 16.3 % of the width.
- **Whisper** (small.en, full file): matches the script word for word.
- **endword_check:** "word..." is 4.0 dB under its line (limit 6). ok.
- **silencedetect** (-40 dB, 0.6 s): no gaps.
- **By eye** (6 fps scrubs `scrub_6fps_*.jpg`, `strip_0-2s_6fps.jpg`, `frame0.jpg`, impact frames `scrub_impacts.jpg`):
  - Captions stay in the bottom band and don't cover faces.
  - The boards sit above the heads.
  - Characters stand on the floor.
  - In the BELOW = SAME shot (27-29.7 s), Saver is partly cut at the left edge (left arm and shoulder).
- **Earlier versions:**
  - v1: the staircase was too small to read, and the split-screen payoff boards were too small.
  - v2: the staircase was small while the slam-zoom was wide; boards covered faces.
  - v3: the BELOW = SAME outline stamp overlapped the 12% label.
  - All fixed in v4.
- I can't hear audio, only measure it.

Not uploaded. It waits for MAIN QA and a BM GO (planned slot Nov 29 12:00).
