# STATUS lane A (DEBT TRAPS): branch finance/n2-a

| slug | style | words | duration | voice | chars | Whisper (small.en) | endword | recipe --check |
|---|---|---|---|---|---|---|---|---|
| payday-rollover | S2 | 79 | 29.50 s | Tyler | 453 | hook exact; full OK except "can't pay **it** all" heard as "can't pay **at** all" (see issues) | 'because' was -12.6 dB → fixed (+13 dB on that word; original kept as voice.orig.wav) → ok 2.9 dB | PASS all gates, 0 clips, captions 100 % in band |
| zero-percent-couch | S2 | 80 | 29.50 s | Christopher | 475 | hook exact; full exact | 'sticker' 4.7 dB ok | PASS all gates, 0 clips, captions in band |

Total ElevenLabs characters used: 928.
Files per Short: script.txt, script.md, sources.md, UPLOAD.md, recipe.json, RECIPE_QA.md, voice.wav, vo/timings.json, voice.lines.json, stills/ (CPU swangle stills at 0.4 scale).
Build: `cd finance/render-pc && node tools/recipe_build.mjs <slug> --shorts ../next2`. The generated src/shorts/*.gen.ts and registry were NOT committed, because this lane pushes only under finance/next2/. To render on the PC, either move the folders to finance/shorts/ or keep `--shorts ../next2`.

## Gate results (both)
Frame 0 subject ≥ 50 % (65 %), hook ≤ 5 words (4), stake by 0.5 s (0.00 s), first word ≤ 0.2 s (0.08 / 0.09 s), sound punch at 0, no names in first 2 s, no tag before 1.0 s, ≥ 2-3 moves in the first 3 s, music + SFX at 0, emotion change by 1.5 s (0.63 s), no wide/dark in 1 s, captions ≥ 65 % on ≥ 90 % of caption time: all PASS.

## Open issues for MAIN
1. **Both voices hit the 29.5 s fit cap:** time-stretched ×1.19 (Tyler) and ×1.13 (Christopher). The brief asks for 25-29 s. If the stretch sounds rushed, trim ~6-8 words and re-voice (about 450 chars each). Candidate cuts, payday: drop "Again." or "Saver pays from savings." (S2 needs the foil, so prefer the first); couch: drop "Close enough?".
2. **payday line 3 "can't pay it all"**: Whisper heard "at all". It reads fine in context, but if MAIN hears it too, re-voice line 3 as "can't repay it" (~70 chars).
3. **Warn only (not a gate):** text boards in the caption band at frame 0 and the loop shot: the "$400 LOAN" / "0% FOR 1 YEAR" chest sign, the same placement as overdraft-35's DECLINED tag. Captions start at 1.0 s, so frame 0 is clean; on the loop shot the caption overlaps the sign. Couch S10 (the INTEREST jar) also overlaps the caption. Check this in the PC render.
4. Split-screen counters: the bottom-view board (Saver) sits right under the seam (face2 0.12) and is slightly cropped at the top, but readable. A larger `dist` would help if MAIN wants more of the Saver character.
5. Payday rollover uses Pew 2012 for "about five months" (still the standard citation); the fee figures are CFPB.
6. NOT done: full video renders (by design: PC GPU).
