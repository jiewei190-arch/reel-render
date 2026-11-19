# wedding-or-keys: render notes (PC)

## v1 (2026-11-19)
- sha256 65c45a6735b7ef36cf43ce13fdd63f5ea83e04816cd00d67aa79c74618b5d5e4; 885 frames, 29.50 s video and audio, about -14 LUFS, TP <= -2.1 dBFS. SUB=4 motion blur and the quality pass. Recipe built with caption-safe framing (lifts listed in the src/shorts/*.recipe.gen.ts header).
- QA: critic SYNC/STATIC pass. Whisper small.en full file matches the script. silencedetect: no gaps over 0.6 s. endword_check ok. 6 fps scrub checked by eye: captions in the bottom band, no caption on eyes or a mouth, 0 clips. I can't hear audio, only measure it.
- critic EDGES FAIL is white pavement at the frame edge. Content check: the DOWN PAYMENT banner says $37,500 while the voice says thirty-seven thousand. Known: the $34,200 chest board shares the caption band from 1.0 s to the first cut and on the loop. Fixed 2 coinPile sizes ([r,h] -> [r,h,r]) so the type check passes.
