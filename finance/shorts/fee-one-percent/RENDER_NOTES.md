# fee-one-percent: render notes (PC)

## v2 (2026-11-19)
- sha256 4d97d452cc4694d76eef564312afb375148b725d5b3a54619035da71e0517098; 885 frames, 29.50 s video and audio, about -14 LUFS, TP <= -2.1 dBFS. SUB=4 motion blur and the quality pass. Recipe built with caption-safe framing (lifts listed in the src/shorts/*.recipe.gen.ts header).
- QA: critic SYNC/STATIC pass. Whisper small.en full file matches the script. silencedetect: no gaps over 0.6 s. endword_check ok. 6 fps scrub checked by eye: captions in the bottom band, no caption on eyes or a mouth, 0 clips. I can't hear audio, only measure it.
- Open-loop YEAR 40 covers apart and whole (v1 overlapped); hook rule applied. Whisper as v1 (same voice and mix). Minor: the frame-0 1% tag sits at the right edge.
