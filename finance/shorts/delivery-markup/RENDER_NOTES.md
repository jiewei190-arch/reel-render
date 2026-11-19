# delivery-markup: render notes (PC)

## v1 (2026-11-19)
- sha256 d4117d160acc9d287c93f4482ad333dec8289c090674ac53ae05f31c62fa6fd5; 885 frames, 29.50 s video and audio, about -14 LUFS, TP <= -2.1 dBFS. SUB=4 motion blur and the quality pass. Recipe built with caption-safe framing (lifts listed in the src/shorts/*.recipe.gen.ts header).
- QA: critic SYNC/STATIC pass. Whisper small.en full file matches the script. silencedetect: no gaps over 0.6 s. endword_check ok. 6 fps scrub checked by eye: captions in the bottom band, no caption on eyes or a mouth, 0 clips. I can't hear audio, only measure it.
- critic EDGES FAIL is the white building wall at the frame edge, not caption text. Known: the frame-0 $21 chest tag shares the caption band from 1.0 s to the first cut and on the loop.
