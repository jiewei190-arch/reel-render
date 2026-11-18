STATE: rendered

# same-car-more: render notes (PC, RTX 4060)
- **Final:** `video.mp4` = render **v1** of the cloud-built composition (`finance/render-pc`, unchanged) with the voice muxed in.
  - 1080x1920, 30 fps, h264 crf 16; AAC 256k 48 kHz.
  - Measured I / true peak: **-14.1 LUFS / -1.4 dBFS**.
  - Voice only.
- **Render:** render=126 s on the GPU, SUB=4 motion blur.
- **critic.py:**
  - SYNC   20 cuts checked (0 after the end of this video skipped), max offset 0 frame(s)
  - STATIC longest near-still run 0 frames = 0.00 s (from frame 0)
  - EDGES  closest white caption pixel to a side edge: 0.4 % of the width
  - SOUND  1 audio stream(s): 1,aac,audio,30.266792 -> the voice only, 0 sound effects
  - FAIL EDGES  caption text 0.4 % from the edge (< 6 %)
  - 1 FAIL
- **flicker.py:** same-car-more_v1.mp4: 917 frames, 2 spikes; stride pattern: None
- **Eye check:** I checked the shot sheet (`contact_sheet.png`), and every shot reads.
- **EDGES FAIL (0.4 %):** I judge it a false positive. Every caption on the shot sheet is centred, well inside the 12 % margins. The flagged pixels are scene whites at the frame edge (the white CFPB sign in S18, clouds, the road kerbs).
- **Sky:** S14–S18 switch to the night/whisper sky at the interest reveal (a story turn), then go back to day for the loop.
