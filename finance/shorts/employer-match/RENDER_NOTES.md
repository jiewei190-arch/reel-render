STATE: rendered

# employer-match: render notes (PC, RTX 4060)
- **Final:** `video.mp4` = render **v1** of the cloud-built composition (`finance/render-pc`, unchanged) with the voice muxed in.
  - 1080x1920, 30 fps, h264 crf 16; AAC 256k 48 kHz.
  - Measured I / true peak: **-14.2 LUFS / -1.5 dBFS**.
  - Voice only.
- **Render:** render=124 s on the GPU, SUB=4 motion blur.
- **critic.py:**
  - SYNC   19 cuts checked (0 after the end of this video skipped), max offset 0 frame(s)
  - STATIC longest near-still run 0 frames = 0.00 s (from frame 0)
  - EDGES  closest white caption pixel to a side edge: 14.8 % of the width
  - SOUND  1 audio stream(s): 1,aac,audio,30.464000 -> the voice only, 0 sound effects
  - 0 FAIL
- **flicker.py:** employer-match_v1.mp4: 914 frames, 0 spikes; stride pattern: None
- **Eye check:** I checked the shot sheet (`contact_sheet.png`), and every shot reads.
- **Known gap:** S18 ("24,500 for") is a weak frame, mostly wall with the limit calendar at the edge. The counter carries the $24,500 limit. Left as is.
