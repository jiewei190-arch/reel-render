STATE: rendered

# employer-match: render notes (PC, RTX 4060)
- **Final:** `video.mp4` = render **v2**, from render-pc @ 38339896 (= CODE_FINAL), with the voice muxed in.
  - 1080x1920, 30 fps; AAC 256k 48 kHz.
  - Measured **-14.2 LUFS / -1.5 dBFS**.
  - Voice only.
- **Why v2:** v1 was rendered from scene code before the cloud's round-3/4 fixes landed. v1 was superseded and must not be used.
- **Render:** render=126 s, SUB=4.
- **critic.py (v2):**
  - SYNC   19 cuts checked (0 after the end of this video skipped), max offset 0 frame(s)
  - STATIC longest near-still run 0 frames = 0.00 s (from frame 0)
  - EDGES  closest white caption pixel to a side edge: 15.2 % of the width
  - SOUND  1 audio stream(s): 1,aac,audio,30.464000 -> the voice only, 0 sound effects
  - 0 FAIL
- **flicker.py:** employer-match_v2.mp4: 914 frames, 0 spikes; stride pattern: None
- **Eye check:** I checked the shot sheet (`contact_sheet.png`), and every shot reads.
- **Known gap:** S18 ("24,500 for") is a weak frame, mostly wall with the limit calendar at the edge. The counter carries the $24,500 limit. Left as is.
