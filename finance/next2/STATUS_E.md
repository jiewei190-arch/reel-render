# STATUS lane E: BIG LIFE MONEY (finance/n2-e)

Research: `finance/next2/RESEARCH_E.md`. Branched from origin/finance/v1rebuild (ff4588e). Everything is under finance/next2/; no src/ files are committed (the generated `src/shorts/*.recipe.gen.ts` + registry were built locally for stills, then reverted).

| slug | style | voice | words | duration | hook (frame 0) | chars used |
|---|---|---|---|---|---|---|
| mortgage-year-ten | S2 | Tyler | 79 | 29.50 s (tempo ×1.189 by eleven_tts --fit 29.5) | $400K HOUSE. REAL PRICE? | 503 |
| wedding-or-keys | S2 | Christopher | 78 | 29.50 s (tempo ×1.067) | $34,000 IN ONE NIGHT | 485 |

ElevenLabs total: 988 characters (one pass each, no re-voice).

## Gates
- **Whisper (faster-whisper small.en, numpy s16le from ffmpeg):**
  - hook lines alone: "You borrow $400,000 for a house." / "You could spend $34,000 in one night." Both exact.
  - full files: word-for-word matches of script.txt for both.
- **First word:** 0.08 s / 0.09 s.
- **endword_check:** mortgage 'dollars.' gap 4.3 dB, ok; wedding 'midnight.' gap 4.3 dB, ok (limit 6).
- **recipe_build --check (`--shorts ../next2`):** both **0 clips** and **all 15 gates PASS**, including caption centre ≥ 65 % on 100 % of caption time. Auto caption-safe lifts: mortgage S03/S09 face2; wedding S04/S07/S10.
  - Warning only, the same pattern as overdraft-35: the frame-0 and loop money boards sit under the chin, in the caption band. Captions start at 1.0 s, so frame 0 is clean; on the loop shot the board shares the band for the last ~1 s. The mortgage S06 "YEAR 10 ???" cover card also warns.
- **CPU stills (swangle):** `stills_cpu.jpg` in each folder shows frame 0, the open loop, the twist and the race. All the boards read after the fixes.

## To run on the PC
```
cd finance/render-pc && node tools/recipe_build.mjs mortgage-year-ten --shorts ../next2   # → MortgageYearTenRecipe(Sub)
node tools/recipe_build.mjs wedding-or-keys --shorts ../next2                            # → WeddingOrKeysRecipe(Sub)
```
(Or copy the folders into finance/shorts/ first, then drop `--shorts`.)

## Open issues for MAIN
1. **The Knot $34,200 / $292-per-guest** came from search excerpts: theknot.com returned 403 to the cloud fetch. Please open the page once to confirm. Zola's $36,000 (fetched) backs "about thirty-four thousand" as conservative.
2. **Tyler's track is ~10 dB quieter** than Christopher's at the line level (-25 vs -15 dB). The mix's loudness pass should handle it; flag it if it doesn't.
3. **Mortgage tempo ×1.189** (eleven_tts fitted 35 s raw to 29.5 s). Whisper is word-perfect, but listen for rushing on line 5. If it's too fast, cut "about" in line 2 or "monthly" in line 6 and re-voice that line only.
4. **Mortgage open-loop shot:** the EXAMPLE tag overlaps the top-right corner of the "MORTGAGE YEAR n" board for ~2 s. That's cosmetic; nudge the board left 0.1 if it bothers you.
5. **"Saver takes fifteen"** shows a fair trade-off (+$783 a month on screen, and in the description), so it's a comparison, not advice. Please check that the tone meets the no-advice rule.
6. The wedding open loop sits at ~58-65 % (the brief's window is 45-60 %); the twist is at 67-83 %.
