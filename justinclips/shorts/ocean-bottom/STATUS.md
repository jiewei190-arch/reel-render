STATE: ready

# Justin clips Short B: ocean-bottom ("The Bottom of the Ocean Weighs Tons 🌊")
- **Final video:** `video.mp4`: 1080x1920, 24 fps, **531 frames, 22.125 s**, H.264 + AAC, **-14.1 LUFS, true peak -1.4 dBFS** (mix.py), 6.8M.
- `video.sha256`: `7de3916de02af58b4cb044a2b097b324449fe7f18b9cc99e5c31390ef3677b92  video.mp4`
- **Jail-break checklist:**
  1. TRIPLE HOOK at 0 s: VISUAL = the hero's toon sub already plunging nose-down into black water, headlights on, bubbles, depth counter spinning (146 m at frame 1); VERBAL = "At the bottom of the ocean, the water weighs tons." from 0.15 s; TEXT = top caption "Everest would fit inside with room to spare" (top ~10 %, 0-3.6 s, separate from the 1-3-word captions at 64 %).
  2. ONE EMOTION: WOW (top of script.md).
  3. NO PADDING: 6 VO lines, 62 words, 22.1 s (target ~25 s +-3).
  4. 13 shots (new one every ~1.1-2.7 s); payoff "Only a handful of people have ever been down there." at 18.3-20.6 s with the sub landing at 10,935 m; no closer; the last 0.43 s replays the plunge so the last frame cuts into frame 1.
  5. Facts in sources.md, NOAA Ocean Exploration added as the depth source; "over 8 tons on every square inch" rounded as TOPICS says; "like stacking cars" is flagged as a computed comparison. Nobody hurt.
- **Checked:** `contact_sheet.png` (16 frames from the final file) and `frame1.png`.
- **Voice:** Chatterbox D2, all 6 lines passed Whisper QA on seed 7; "11" / "8" spelled for the TTS, digits kept in captions. Captions aligned 61/62 words.
- **Project:** `project/`. Re-render from `whatif/aitrends-2d-studio`: `CHROMIUM_PATH=/opt/pw-browsers/chromium node render.mjs --project ../../justinclips/shorts/ocean-bottom/project`, `python3 audio/mix.py --project ../../justinclips/shorts/ocean-bottom/project`, then `ffmpeg -i build/video_silent.mp4 -i out/What_If_You_Dove_to_the_Bottom_of_the_Ocean.mp4 -map 0:v:0 -map 1:a:0 -c copy -movflags +faststart video.mp4`. Cloud render 5m52s.
- Upload package: `UPLOAD.md`. Nothing was posted, uploaded or scheduled.
