# quit-cash-out: render notes (PC)

## v1 (2026-11-19)
- sha256 9dcb2e748095c5d82ec9ec980b03ce4650b28da1cd0f69345b1b154c8656bbe6; 885 frames, 29.50 s video and audio, about -14 LUFS, TP <= -2.1 dBFS. SUB=4 motion blur and the quality pass. Recipe built with caption-safe framing (lifts listed in the src/shorts/*.recipe.gen.ts header).
- QA: critic SYNC/STATIC pass. Whisper small.en full file matches the script. silencedetect: no gaps over 0.6 s. endword_check ok. 6 fps scrub checked by eye: captions in the bottom band, no caption on eyes or a mouth, 0 clips. I can't hear audio, only measure it.
- critic EDGES FAIL is white sky/building at the frame edge. extras off (street extras clip lamps). Known: the frame-0 401(k) board shares the caption band until the first cut and on the loop; rendered before MAIN's hook rule.
