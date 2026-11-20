# free-trial-204: render notes (PC)

## v1 (2026-11-19)
- sha256 9578576d40488b0a2480ac93ecf64139d738731a5e4dc6e719a4e81a7544a047; 885 frames, 29.50 s video and audio, about -14 LUFS, TP <= -2.1 dBFS. SUB=4 motion blur and the quality pass. Recipe built with caption-safe framing (lifts listed in the src/shorts/*.recipe.gen.ts header).
- QA: critic SYNC/STATIC pass. Whisper small.en full file matches the script. silencedetect: no gaps over 0.6 s. endword_check ok. 6 fps scrub checked by eye: captions in the bottom band, no caption on eyes or a mouth, 0 clips. I can't hear audio, only measure it.
- Hook rule applied. critic EDGES FAIL is scenery. Minor: the frame-0 FREE TRIAL $0 tag sits small at the top right.
