# atm-fee-twenty: render notes (PC)

## v1 (2026-11-19)
- sha256 ea19cd05aad6524800e8cfd102d1fad8b576ab132b2058e22e62dafb7704442c; 885 frames, 29.50 s video and audio, about -14 LUFS, TP <= -2.1 dBFS. SUB=4 motion blur and the quality pass. Recipe built with caption-safe framing (lifts listed in the src/shorts/*.recipe.gen.ts header).
- QA: critic SYNC/STATIC pass. Whisper small.en full file matches the script. silencedetect: no gaps over 0.6 s. endword_check ok. 6 fps scrub checked by eye: captions in the bottom band, no caption on eyes or a mouth, 0 clips. I can't hear audio, only measure it.
- 29.27 s (the voice is shorter; video and audio match). Hook rule applied. critic EDGES FAIL is scenery. Minor: the frame-0 FEE $4.86 tag is slightly cropped at the right edge.
