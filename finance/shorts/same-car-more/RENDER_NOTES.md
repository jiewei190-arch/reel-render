STATE: rendered

# same-car-more: render notes (PC, RTX 4060)
- **Final:** `video.mp4` = render **v2**, from render-pc @ 38339896 (= CODE_FINAL), with the voice muxed in.
  - 1080x1920, 30 fps; AAC 256k 48 kHz.
  - Measured **-14.1 LUFS / -1.4 dBFS**.
  - Voice only.
- **Why v2:** v1 was rendered from scene code before the cloud's round-3/4 fixes landed. v1 was superseded and must not be used.
- **Render:** render=127 s, SUB=4.
- **critic.py (v2):**
  - SYNC   20 cuts checked (0 after the end of this video skipped), max offset 0 frame(s)
  - STATIC longest near-still run 12 frames = 0.40 s (from frame 630)
  - EDGES  closest white caption pixel to a side edge: 0.4 % of the width
  - SOUND  1 audio stream(s): 1,aac,audio,30.266792 -> the voice only, 0 sound effects
  - FAIL EDGES  caption text 0.4 % from the edge (< 6 %)
  - 1 FAIL
- **flicker.py:** same-car-more_v2.mp4: 917 frames, 3 spikes; stride pattern: None
- **Eye check:** I checked the shot sheet (`contact_sheet.png`), and every shot reads.
- **EDGES FAIL (0.4 %):** I judge it a false positive. Every caption on the shot sheet is centred, well inside the 12 % margins. The flagged pixels are scene whites at the frame edge (the white CFPB sign in S18, clouds, the road kerbs).
- **Sky:** S14–S18 switch to the night/whisper sky at the interest reveal (a story turn), then go back to day for the loop.
