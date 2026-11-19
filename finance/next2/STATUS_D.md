# STATUS_D: lane D (everyday spending and psychology), branch finance/n2-d

| slug | style | voice | words | duration | open loop | twist | recipe gates |
|---|---|---|---|---|---|---|---|
| delivery-markup | S2 | Christopher | 72 | 29.5 s (tempo ×1.040) | "But wait till you see a whole year" at 18.2 s (62 %) | "nearly a thousand dollars" at 22.7 s (77 %) | all PASS, 0 clips, caption gate 100 % |
| fake-sale | S2 | Tyler | 78 | 29.5 s (tempo ×1.127) | "But that's not even the sneaky part" at 14.7 s (50 %) | "seventy-six percent" at 24.0 s (81 %) | all PASS, 0 clips, caption gate 100 % |

- Research: `RESEARCH_D.md` (5 candidates; picked delivery-app markup and fake "sale" prices).
- Voice: ElevenLabs eleven_v4 via `finance/tools/eleven_tts.py` (proxy key). Characters used: 412 + 455 = **867**. Whisper small.en (numpy s16le from ffmpeg): hook lines and full files transcribe word-for-word ("Saver" comes out as "Savor", spelling only). `endword_check.py`: both ok (delivery 3.5 dB gap, fake-sale -0.5 dB; limit 6).
- Recipes: `node tools/recipe_build.mjs <slug> --check --shorts ../next2` passes every gate. The only warnings left are the frame-0/loop price tag on Spender's chest, which sits in the caption band (captions start at 1.0 s; same placement as overdraft-35's DECLINED tag).
- Stills: 4 CPU stills (`--gl=swangle`): `stills_check.jpg` in each folder (the same sheet: delivery f0, fake-sale f0, fake-sale twist f740, delivery open loop f560).
- To build on the PC: `node tools/recipe_build.mjs <slug> --shorts ../next2` (or copy the folders to finance/shorts/). The generated `src/shorts/*.recipe.gen.ts` and the registry are NOT committed (lane rule: push only under finance/next2/).

## Open issues for MAIN
1. Both voices hit the 29.5 s fit cap, so the tool time-stretched them (fake-sale ×1.127 is the faster read). A trimmed fake-sale (drop "and grabs it") would land nearer 28 s, but re-voicing would cost about 455 more characters, so I didn't.
2. delivery-markup's open loop starts at 62 %, just past the 45-60 % window.
3. The LendingTree study page itself returned 404 at one URL; the numbers are quoted from the Scripps/KJRH report of it (date ~Nov 2025, inferred from image filenames). The study URL linked from that article wasn't fetched. Please verify it.
4. The "EXAMPLE · …" tag overlaps the top of tall boards on the twist shots (top-right corner). This is cosmetic.
5. The fake-sale store set is the ELECTRONICS store (a jacket in an electronics store). Its sign is partly visible behind the hook. A clothing-rack prop is used only in the open-loop shot.
6. Black Friday timing: fake-sale fits best if it's posted before late November.
