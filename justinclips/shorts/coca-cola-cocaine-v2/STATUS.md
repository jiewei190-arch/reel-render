STATE: ready

# Justin clips Short: coca-cola-cocaine-v2 ("jail break" re-cut of coca-cola-cocaine; v1 untouched in ../coca-cola-cocaine/)
- **Final video:** `video.mp4`, 1080x1920, 24 fps, **538 frames, 22.42 s** (audio 22.41 s), H.264 + AAC, **-14.0 LUFS, true peak -1.3 dBFS**, 10.6 MB.
- `video.sha256`: `baef7738995e9a955bf0404d6df675478c223d4bdfa42affd39d7428b59a4f49  video.mp4`.
- **Checked:** `contact_sheet.png` (20 frames from the final file, 0 s to the last frame).
- **Playbook "BREAK THE VIEW JAIL", rule by rule:**
  1. **Triple hook in the first 2 s.**
     - VISUAL: frame 1 is the cola glass with the coca leaf, bubbles already rising, the glass turning, and a quick push-in over 2.3 s.
     - VERBAL: "Coca-Cola had cocaine in it." (5 words, starting at 0.10 s).
     - TEXT: one top caption, "and it still uses THE LEAF", at the top ~5-17 % of the frame. It is full size from frame 1, holds to 3.5 s and fades out by 3.8 s. It is separate from the 1-3 word captions at 66 %.
  2. **One emotion: WOW** (written at the top of script.md). Cut from v1: "That's not a rumor", "morphine-addicted", "temperance drink", the Pope cameo, and the cocaine-panic newspapers.
  3. **No padding:** 22.4 s against the ~25 s target (within ±3 s), 56 words, 9 shots, a new visual every 1-3 s.
  4. **Payoff and loop:**
     - The can winks on "the legal part." at 19.8-20.3 s, and the can stays on screen to the end.
     - "Subscribe for more." is spoken in 1.0 s (20.92-21.92).
     - The last frame is the can; the video then cuts straight back into frame 1 (the glass).
     - The payoff ends 2.1 s before the end, because the 1.0 s closer and its tail come after it.
- **Kept facts (sourced, `sources.md`):**
  - 1886, pharmacist John Pemberton, coca leaves, sold as medicine.
  - "around 1903".
  - "Coke reportedly still uses the leaf", with "(cocaine-free)" on screen.
  - The New Jersey company strips the cocaine out and Coke keeps the flavor.
  - "Just... the legal part."
- **Voice:** Chatterbox D2 as in v1 (gap 0.25, lead 0.1). All 7 lines passed Whisper QA against the new script (seed 7). Years are spoken as "eighteen eighty-six" and "nineteen oh-three"; captions show 1886 and 1903.
- **Project:** `whatif/aitrends-2d-studio/projects/coca-cola-cocaine-v2`. It reuses v1's Toon 3D scenes with a new hook, new word cues and the top caption. Re-render from `whatif/aitrends-2d-studio`:
  `node render.mjs --project projects/coca-cola-cocaine-v2 --out projects/coca-cola-cocaine-v2/build/video_silent.mp4` (538 frames)
  `python audio/mix.py --project projects/coca-cola-cocaine-v2 --video projects/coca-cola-cocaine-v2/build/video_silent.mp4 --out projects/coca-cola-cocaine-v2/build/mixed.mp4`
  The mix came out at -14.8 LUFS. The final used `build/mix.wav` with +0.8 dB under a limiter (-14.0 / -1.3), muxed onto the full silent render with `-c:v copy`.
- Rendered in the cloud (SwiftShader, 4 workers). Build frames deleted.
- **UPLOAD.md:** same title and description as v1. If v1 is already live, don't delete it; post v2 in a later slot.
- Nothing was posted, uploaded or logged into.
