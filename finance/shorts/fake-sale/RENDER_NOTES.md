# fake-sale: render notes (PC)

## v2 (2026-11-19)
- sha256 7eb88727d4443e03d915d21e6123ccb466741096a22f6adcf23de2d5c34799de; 885 frames, 29.50 s video and audio, about -14 LUFS, TP <= -2.1 dBFS. SUB=4 motion blur and the quality pass. Recipe built with caption-safe framing (lifts listed in the src/shorts/*.recipe.gen.ts header).
- QA: critic SYNC/STATIC pass. Whisper small.en full file matches the script. silencedetect: no gaps over 0.6 s. endword_check ok. 6 fps scrub checked by eye: captions in the bottom band, no caption on eyes or a mouth, 0 clips. I can't hear audio, only measure it.
- New 'clothes' set (store shell, CLOTHING sign, NEW COATS / JEANS & TEES posters). Open-loop SALE? tags pulled in and camera widened (v1 cropped both). critic EDGES FAIL is white floor/display at the frame edge, not caption text. Known: the frame-0 SALE $60 chest tag shares the caption band until the first cut (1.65 s) and on the loop; rendered before MAIN's hook rule.
