# mortgage-year-ten: render notes (PC)

## v1 (2026-11-19)
- sha256 5d4656400e0e355005c9b3b7e196d8d703111f38a5affeed40320d08b17b55b8; 885 frames, 29.50 s video and audio, about -14 LUFS, TP <= -2.1 dBFS. SUB=4 motion blur and the quality pass. Recipe built with caption-safe framing (lifts listed in the src/shorts/*.recipe.gen.ts header).
- QA: critic SYNC/STATIC pass. Whisper small.en full file matches the script. silencedetect: no gaps over 0.6 s. endword_check ok. 6 fps scrub checked by eye: captions in the bottom band, no caption on eyes or a mouth, 0 clips. I can't hear audio, only measure it.
- Known: the $400,000 LOAN chest board shares the caption band from 1.0 s to the first cut and on the loop; the YEAR 10 ??? cover card sits partly behind the caption.
