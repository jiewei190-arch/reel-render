STATE: rendered

# coffee-could-be: render notes (PC, RTX 4060)
- **Final:** `video.mp4` = render **v2**, from render-pc @ 38339896 (= CODE_FINAL), with the voice muxed in.
  - 1080x1920, 30 fps, h264 crf 16; AAC 256k 48 kHz.
  - Measured I / true peak: **-14.2 LUFS / -1.5 dBFS**.
  - Voice only.
- **Versions:**
  - **v1** (render=125 s): the cloud code as delivered.
  - **v2** (render=125 s): with the PC lens fix below.
- **critic.py (v2):**
  - SYNC   19 cuts checked (0 after the end of this video skipped), max offset 0 frame(s)
  - STATIC longest near-still run 0 frames = 0.00 s (from frame 0)
  - EDGES  closest white caption pixel to a side edge: 10.7 % of the width
  - SOUND  1 audio stream(s): 1,aac,audio,30.503917 -> the voice only, 0 sound effects
  - 0 FAIL
- **flicker.py:** coffee-could-be_v2.mp4: 917 frames, 33 spikes; stride pattern: None
- **PC fix (v1 → v2):** in S04, the lens sat beside Spender's shoulder, so half the frame was his red bag and body. The lens yaw went from 8 to -25: the cup now reads with the Teller behind it.
- **Flicker spikes (33):** they all sit in two intended fast-motion beats: the S06 calendar riffle (frames 224–256) and the S15 spinning clock hands (frames 663–705). There's no tab stride.
