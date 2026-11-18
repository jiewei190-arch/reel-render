STATE: rendered

# surprise-bill: render notes (PC, RTX 4060)
- **Final:** `video.mp4` = render **v2**, from render-pc @ 38339896 (= CODE_FINAL), with the voice muxed in.
  - 1080x1920, 30 fps, h264 crf 16; AAC 256k 48 kHz.
  - Measured I / true peak: **-14.2 LUFS / -1.5 dBFS**.
  - Voice only.
- **Versions:**
  - **v1** (render=120 s): the cloud code as delivered.
  - **v2** (render=121 s): with the PC lens fix below.
- **critic.py (v2):**
  - SYNC   18 cuts checked (0 after the end of this video skipped), max offset 0 frame(s)
  - STATIC longest near-still run 0 frames = 0.00 s (from frame 0)
  - EDGES  closest white caption pixel to a side edge: 2.6 % of the width
  - SOUND  1 audio stream(s): 1,aac,audio,28.288000 -> the voice only, 0 sound effects
  - FAIL EDGES  caption text 2.6 % from the edge (< 6 %)
  - 1 FAIL
- **flicker.py:** surprise-bill_v2.mp4: 849 frames, 13 spikes; stride pattern: None
- **PC fix (v1 → v2):** S14 ("only 63") was an empty light-blue frame. The red car's 2.6 m body overlaps the survey blocks, so the lens was inside the car. The car is now hidden in S14 only, and the shot uses a fitted lens on the 100% / 63% bars and the ten blocks.
- **EDGES FAIL (2.6 %):** I judge it a false positive. Every caption on the sheet is centred; the flagged pixels are scene whites at the frame edge (the EXAMPLE card, clouds, kerbs).
