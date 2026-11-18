# F2 status: 5 more finance Shorts, built and ready for the PC render

Branch `finance/f2` (branched from `finance/f1`, with `finance/f1` merged in at a35bdc3 for the PC engine). Each Short is
in `finance/shorts/<slug>/`:
- `script.md`: 5 hook candidates and the pick, loop sentence, twist, counter, and the word-anchored shot plan;
- `sources.md`, `UPLOAD.md` (title and description only, no hashtags);
- `voice.wav` (force-added) + `script.txt`;
- `vo/timings.json` + `vo/whisper_check.md`;
- `plan/plan_src.py` → `src/plan.gen.ts` + `plan/SHOTS.md`;
- `stills_sheet.png` (cloud CPU stills of the built scene).

The scenes are built in the PC project `finance/render-pc/`. Render commands are in `finance/F2_RENDER.md`.

| slug | first line (hook) | words | voice (s) | last word ends (s) | frames @30 | shots | median cut (s) | Whisper word check |
|---|---|---|---|---|---|---|---|---|
| coffee-could-be | Your coffee could be worth 186,000 dollars. | 59 | 30.50 | 29.96 | 917 | 20 | 1.49 | PASS |
| same-car-more | Same car, 4,700 dollars more. | 62 | 30.27 | 29.96 | 917 | 21 | 1.38 | PASS |
| surprise-bill | A surprise bill can last two years. | 71 | 28.55 | 27.70 | 849 | 19 | 1.42 | PASS |
| employer-match | Some jobs pay you to save. | 77 | 30.50 | 29.88 | 914 | 20 | 1.56 | PASS |
| prices-double | Prices double faster than you think. | 64 | 25.63 | 25.14 | 772 | 18 | 1.34 | PASS |

The bar for all five:
- 20–30 s spoken (each last word ends by 30.0 s);
- a hook of 7 words or fewer, with 5 candidates in `script.md`;
- a twist at about 70 %;
- a last line that runs grammatically into the first;
- the regular D2 voice (Chatterbox, exaggeration 0.3, cfg 0.3);
- the cast reused: SAVER, SPENDER, PENNY, TELLER, LENDER;
- no brands, real people, stocks or crypto, and no promises.

Every number is sourced, with the maths shown, in `sources.md`:
- **coffee-could-be:** $5/day = $1,825/yr; $152.08 a month at a made-up steady 7 %: 30 yrs ≈ $186,620, 10 yrs ≈ $26,477. Investor.gov calculator.
- **same-car-more:** $30,000 at an example 7 % APR: 36 months $926/mo and $3,347 interest; 84 months $453/mo and $8,034 interest (+$4,686). CFPB auto-loan pages.
- **surprise-bill:** $1,000 on a 22 % card at $50/mo: 26 months, $257 interest. Fed G.19 (≈22 %), Fed SHED 2025 (63 % would cover $400 with cash or its equivalent).
- **employer-match:** a 50 % match up to 6 % of $50,000: you $3,000, match $1,500. IRS 2026 employee limit $24,500 (Notice 2025-67, the IRS page). DOL on vesting.
- **prices-double:** Rule of 72 (Investor.gov): 2 % → 36 yrs, 3 % → 24, 4 % → 18. CPI-U 1970 avg 38.8 → Oct 2026 337.511 = ×8.70, about 3.9 %/yr, 3.12 doublings, one every ~18 years.

## Scenes (built in the cloud, verified with CPU stills)
- **Engine:** Creator's `finance/render-pc/` (`src/fin/core.tsx`, `props.tsx`, `hud.tsx`; `penny.tsx` and `rule72.tsx` as references).
- **F2 compositions:** `coffee.tsx` (CoffeeCouldBe), `samecar.tsx` (SameCarMore), `surprise.tsx` (SurpriseBill), `match.tsx` (EmployerMatch), `doubling.tsx` (PricesDouble). All are registered in `src/Root.tsx` with `<Id>` + `<Id>Sub`, and `tsc` reports 0 errors.
- **`src/fin/f2kit.tsx`:**
  - numeric lens fitting: a lens is solved so its subjects stay inside the frame, below the counter, until the end of the push-in, with 6–10 % margins;
  - new props: car, smoke, cup, payslip sheet, coffee bar.
- **Stills:** 2–4 rounds of 6 per Short with `tools/cloud_stills.sh` (`--gl=swangle`). Rounds per Short: surprise-bill 2, prices-double 3, coffee-could-be 3, employer-match 4, same-car-more 4. The final sheet is in each `stills_sheet.png`. Faults fixed along the way:
  - lens inside objects (a booth, a car);
  - characters facing away, and blocked subjects;
  - signs over signs (the calendar behind the CPI board, the clock over the board);
  - too-tight prop close-ups, and hook wides with an empty floor;
  - a character in front of the sign shot.

## Open issues
- **Not rendered or listened to:** no full renders in the cloud (as asked). Motion, sync and flicker are for the PC's `render.sh` + `critic.py`. Nobody has listened to the F2 voices by ear; Whisper confirms the words only.
- **Tight timings:** coffee-could-be, same-car-more and employer-match end at 29.9–30.0 s (last word). coffee-could-be has two shots of about 2.3–2.5 s, during the long spoken numbers ("1,825", "54,750").
- **Chatterbox's built-in QA prints "QA FAIL"** on lines with money (it can't match "$186,000" to the spelled words). `finance/tools/verify_words.py` passes all five, and it now also handles initialisms (C.F.P.B., I.R.S.).
- **Wording changes:**
  - same-car-more: the CFPB line is "a longer loan means more interest", which is confirmed on the CFPB pages. "Five years or less" was dropped as unconfirmed.
  - coffee-could-be: line 5 now starts "Say a made-up…", because Whisper heard "At" as "add".
- **One BNPL topic was skipped:** it needs CFPB late-fee figures I couldn't verify in time.
- **Counter style:** the F2 compositions use Creator's holo counter and corner tag. The counter values come from the same simulations as `sources.md`.
- **F1 UPLOAD.md files** keep their old format (pinned comment and hashtags). The new "title and description only" rule is applied to F2.
