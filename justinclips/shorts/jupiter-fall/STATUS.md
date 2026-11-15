STATE: ready

# Justin clips Short A: jupiter-fall ("You Fall Into Jupiter. You Never Land 🪐")
- **Final video:** `video.mp4`: 1080x1920, 24 fps, **585 frames, 24.375 s**, H.264 + AAC, **-14.5 LUFS, true peak -1.4 dBFS** (mix.py), 12M.
- `video.sha256`: `5ed8a06cb0b720e4b5fb0cef34a3a1e4f5e2b0c888b7f816446c47d195c64d41  video.mp4`
- **Jail-break checklist:**
  1. TRIPLE HOOK at 0 s: VISUAL = the hero already free-falling (spread-eagle, streaks, clouds rushing up) over Jupiter's bands and the Great Red Spot; VERBAL = "You jump into Jupiter. You never land." starts at 0.15 s; TEXT = top caption "Jupiter has no ground. At all." (top ~10 %, 0-3.6 s, separate from the 1-3-word captions at 64 %).
  2. ONE EMOTION: WOW (top of script.md).
  3. NO PADDING: 6 VO lines, 52 words, 24.4 s (target ~25 s).
  4. 16 shots (a new one every ~0.4-2.6 s, faster at the reveal); payoff "the hydrogen acts like liquid metal" at 21.1-23.2 s; no closer (it would break the loop); the hero is beamed out, then the last 0.42 s replays the opening fall so the last frame cuts straight into frame 1.
  5. Facts in sources.md ("about an hour", "about 150 km" hedges kept); nobody hurt (bubble helmet, beam-out; only the robot probe goes silent).
- **Checked:** `contact_sheet.png` (16 frames from the final file) and `frame1.png` (frame 1: top caption + falling hero).
- **Voice:** Chatterbox D2 (whatif/voice/chatterbox_d2.py, --gap 0.3 --lead 0.15 --beat 0.5); all 6 lines passed Whisper QA on seed 7; "1995" / "150" spelled for the TTS, digits kept in captions. Captions aligned 52/52 words.
- **Project:** `project/` (Toon 3D kit). Re-render from `whatif/aitrends-2d-studio`: `CHROMIUM_PATH=/opt/pw-browsers/chromium node render.mjs --project ../../justinclips/shorts/jupiter-fall/project` then `python3 audio/mix.py --project ../../justinclips/shorts/jupiter-fall/project`, then `ffmpeg -i build/video_silent.mp4 -i out/What_If_You_Fell_Into_Jupiter.mp4 -map 0:v:0 -map 1:a:0 -c copy -movflags +faststart video.mp4`. Cloud render: 7m18s (4 workers, SwiftShader).
- Upload package: `UPLOAD.md`. Nothing was posted, uploaded or scheduled.
