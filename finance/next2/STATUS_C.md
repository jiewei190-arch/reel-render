# STATUS_C: lane C (investing fees and myths), branch finance/n2-c

| slug | style | voice | words | duration | Whisper (small.en) | endword | recipe gates |
|---|---|---|---|---|---|---|---|
| fee-one-percent | S2 | Tyler | 80 | 29.5 s (tempo x1.165) | hook + full: exact | 'small:' was 6.5 dB under its line → `--fix 5` → 1.8 dB, ok | clip QA 0; all gates PASS; caption gate 100 %; no warnings |
| quit-cash-out | S2 | Christopher | 80 | 29.5 s (tempo x1.151) | hook + full: exact ("401k" for 401(k)) | 'day...' 2.7 dB, ok | clip QA 0; all gates PASS; caption gate 100 %; 1 soft warn (below) |

ElevenLabs characters used: 448 + 481 = 929 (eleven_v4, voiced once each, no re-voices).
Checks run: `recipe_build.mjs <slug> --check --shorts ../next2`, then a build to render CPU stills (`--gl=swangle`) of frame 0 and the jar shots. I reverted the generated `src/shorts/*.recipe.gen.ts` and `registry.gen.ts` so the branch changes only `finance/next2/`. **To build on the PC:** copy or move each folder to `finance/shorts/<slug>/`, or pass `--shorts ../next2`.

## Open issues for MAIN
1. **Both voices hit the 29.5 s fit cap** and were time-stretched by about x1.15-1.17 (the overdraft-35 reference was x1.07). Whisper is exact on both, but listen for rush. If it's too fast, trim one line each (e.g. fee line 7 "In this example," → keep the tag only) and re-voice that line.
2. **quit-cash-out open loop at about 61 %** ("But here's the part nobody shows you" at 18.0 s), just past the 45-60 % window. The Saver line that sets it up starts at 52 %.
3. **quit-cash-out soft warn:** "text board in the caption band" on the two jar shots (S02 at 1.1 s, S08 at 15.3 s). I widened both shots (dist 4.6/4.8) and the stills read fine; the jar labels sit above the captions. The jar kit only shows the first text line ("401(K)", "ROLLED"), so "$10,000"/"OVER" don't show.
4. quit-cash-out uses `"extras": false`: on the street set, the background passers-by clipped the streetlights (22 CLIPs). That's an engine issue worth fixing for every street recipe.
5. Engagement evidence in RESEARCH_C.md comes from web coverage, not measured view counts: the vidIQ connector had no credits.
6. Tax example: a 12 % federal rate with no state tax; the description says taxes vary. "Rolls it over" is the character's choice, not advice to the viewer. MAIN: confirm the wording is OK.
7. Runner-up topic for a later slot: missing the 10 best days (J.P. Morgan 2025 Guide to Retirement: $71,750 vs $32,871). See RESEARCH_C.md.
