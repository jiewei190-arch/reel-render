# STATUS_B: lane B (hidden fees and subscriptions), branch finance/n2-b

| slug | style | voice | words | duration | gates | clip QA |
|---|---|---|---|---|---|---|
| free-trial-204 | S2 | Christopher | 74 | 29.50 s (tempo x1.097 fit) | 15/15 PASS, 0 warn | 0 clips |
| atm-fee-twenty | S2 | Tyler | 69 | 27.97 s | 15/15 PASS, 0 warn | 0 clips |

Each folder: script.txt, script.md, sources.md, UPLOAD.md, recipe.json, RECIPE_QA.md, voice.wav, vo/timings.json, voice.lines.json, frame0.jpg (CPU still, 0.4 scale).
Build: `node tools/recipe_build.mjs <slug> --shorts ../next2` (from finance/render-pc). Compositions: FreeTrial204Recipe(Sub), AtmFeeTwentyRecipe(Sub).
The generated src/shorts/*.gen.ts and registry were NOT committed (lane rule: only finance/next2/); the PC regenerates them with the command above.

## Voice checks
- ElevenLabs eleven_v4 via finance/tools/eleven_tts.py. Characters: free-trial 426, atm 399 + 46 re-voice = 445. Total 871.
- faster-whisper small.en (numpy s16le from ffmpeg), hook line alone:
  - free-trial: "Your free trial just cost you $200." OK
  - atm: "You paid almost $5 to get your own $20." OK
- Full file: all words match; Whisper hears "Saver" as "Savor" (homophone, captions come from the script, not Whisper).
- endword_check: free-trial 'trial?' gap 3.3 dB ok. atm: original last line ended "...every single time." with a 13.8 dB fade (FLAG);
  rewrote line 6 to "Saver paid nothing. And Spender's next twenty?" and re-voiced that line only (spliced; timings updated): gap 4.5 dB ok.

## Open issues for MAIN
1. atm-fee-twenty is 69 words, 1 under the 70-80 band (after the last-line fix). 28 s, pacing ok; re-voice line 6 with one more word if you want it strict.
2. free-trial-204 was time-stretched x1.097 by eleven_tts to fit 29.5 s; listen for pace.
3. Split-screen race counters (top-level labels at y 1.62, as in overdraft-35) sit at the very top edge of the split after caption-safe framing lifts it; readable but tight. Lower them or raise split `dist` if the PC render cuts them.
4. atm-fee-twenty uses `"extras": false` (street crowd extras clipped the streetlights); free-trial-204 disables extras only on its street shot.
5. Twist label "$505" is 104 x $4.86 = $505.44 with an assumed "twice a week" (stated "in this example" in the VO and description).
6. Hook text frame-0 tags are small (0.36 x 0.22 m) so they stay in frame through the hookZoom push; at ~0.7 s the tag edge touches the right border.
7. No full renders made (PC GPU job). Stills only.
