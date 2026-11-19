STATE: rendered

# prices-double: render notes (PC, RTX 4060)
- **Final:** `video.mp4` = render **v1** of the cloud-built composition (`finance/render-pc`, unchanged) with the voice muxed in.
  - 1080x1920, 30 fps, h264 crf 16; AAC 256k 48 kHz.
  - Measured I / true peak: **-14.1 LUFS / -1.5 dBFS**.
  - Voice only.
- **Render:** render=106 s on the GPU, SUB=4 motion blur.
- **critic.py:**
  - SYNC   17 cuts checked (0 after the end of this video skipped), max offset 0 frame(s)
  - STATIC longest near-still run 0 frames = 0.00 s (from frame 0)
  - EDGES  closest white caption pixel to a side edge: 10.7 % of the width
  - SOUND  1 audio stream(s): 1,aac,audio,25.632000 -> the voice only, 0 sound effects
  - 0 FAIL
- **flicker.py:** prices-double_v1.mp4: 772 frames, 9 spikes; stride pattern: None
- **Eye check:** I checked the shot sheet (`contact_sheet.png`), and every shot reads.
- **Known gap:** in S05 and S07 Penny holds the rate card with her back three-quarters to the lens, so her face isn't seen. The card and the counter carry the numbers. Not fixed: this is cloud scene code, so it's left for the cloud author.
