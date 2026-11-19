# payday-rollover: render notes (PC)

## v1 (2026-11-19)
- sha256 58c08f6fe536d6f3f164bfc8377ada53972097dc3e7ad60be8220e01f618a7e6; 885 frames, 29.50 s video and audio, about -14 LUFS, TP <= -2.1 dBFS. SUB=4 motion blur and the quality pass. Recipe built with caption-safe framing (lifts listed in the src/shorts/*.recipe.gen.ts header).
- QA: critic SYNC/STATIC pass. Whisper small.en full file matches the script. silencedetect: no gaps over 0.6 s. endword_check ok. 6 fps scrub checked by eye: captions in the bottom band, no caption on eyes or a mouth, 0 clips. I can't hear audio, only measure it.
- Whisper hears 'can't pay at all' for 'can't pay it all' (builder's open issue 2). Known: the $400 LOAN chest board shares the caption band from 1.0 s to the first cut and on the loop.
# payday-rollover: render notes (PC)

## v2 (2026-11-19)
- sha256 c42c319aac2d0e962c43d78db3b7ff39d30da6068234944dddeac9825019e9b5; 885 frames, 29.50 s video and audio, about -14 LUFS, TP <= -2.1 dBFS. SUB=4 motion blur and the quality pass. Recipe built with caption-safe framing (lifts listed in the src/shorts/*.recipe.gen.ts header).
- QA: critic SYNC/STATIC pass. Whisper small.en full file matches the script. silencedetect: no gaps over 0.6 s. endword_check ok. 6 fps scrub checked by eye: captions in the bottom band, no caption on eyes or a mouth, 0 clips. I can't hear audio, only measure it.
- MAIN's re-voice (line 3 'can't repay it'); end word 'because' +11 dB (gap 12.7 -> 4.3 dB). Hook rule applied: first cut 1.0 s, loop board lands on the last word.
