# dollar-1970: render notes (helper worker)

Composition: `src/fin/dollar1970.tsx` (Remotion + three.js, blocky-render-2 copy), comp id `Dollar1970Sub` (SUB=4, tmix blur). One corner shop in two looks: NOW (bright purple/white) and 1970 (warm orange/brown, warm gold mood, door marked 1970).
Final: **v1** (`video.mp4` = v1 + voice). 1080x1920, 30 fps, 736 frames, 24.53 s. Full render 107 s (CONC=6, SUB=4), 129 s with ffmpeg tmix + QA.
Look-dev: 3 still rounds (first all-shots pass, then S02/S05/S09/S12 framing fixes) before the single full render.

## Audio
tools/mux_voice.sh (MAIN's script: gain + true-peak limiter): **-14.2 LUFS integrated, true peak -1.6 dBFS**, AAC 256k/48k, voice only, no music.

## Critic (tools/critic.py)
0 FAIL. SYNC 16/16 cuts exact (0 frames off), longest still run 0.03 s, caption edge distance 10 % (full-res check 9.6 %), voice only.
flicker.py: 17 "spikes", all in S05 (calendar riffling 1970->2026 and the bill stack rising, intended) plus the S08 and S11 cuts. Pacing: see _qa.

## Story numbers (self-consistent)
cents(y) = 100 / 8.7^(y/56): 100 c in 1970 -> 11.5 c in 2026 (S01/S02 show the fall, YEAR label floored; S11-S15 retell it year by year; S17 resets to 100 c / YEAR 1970 = S01 start for the loop). Price counter rolls $1.00 -> $8.70 (S04/S05, basket tag in S10). Shelf tags: 9 goods, 1970 price x 8.7.

## Known gaps
- No film grain on the 1970 shots (FinFilm has no grain layer); the 1970 look is palette + golden mood only.
- S12 macro on the bag shows the leak only as falling coins; the bag itself is not flattened in S15 (the Blocky bag accessory can't deflate).
- S02 close-up: the bill sliver is small next to the arm.
- Whisper shots (S11-S14) use the library whisper mood: darker, pinkish floor.
