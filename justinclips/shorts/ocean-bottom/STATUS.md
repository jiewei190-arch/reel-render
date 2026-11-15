STATE: ready

# Justin clips Short B: ocean-bottom ("The Bottom of the Ocean Weighs Tons 🌊")
- **Final video:** `video.mp4`: 1080x1920, 24 fps, **534 frames, 22.25 s**, H.264 + AAC, **-14.1 LUFS, true peak -1.3 dBFS** (mix.py), 6.9 MB.
- `video.sha256`: `9606a8de761a8648910a2f7dd1389c463adc95ea1fd684db788cadf863f84982  video.mp4`
- **Jail-break checklist:**
  1. TRIPLE HOOK at 0 s: VISUAL = the hero's toon sub already plunging nose-down into black water, headlights on, bubbles, depth counter spinning (146 m at frame 1); VERBAL = "At the bottom of the ocean, the water weighs tons." from 0.15 s; TEXT = top caption "Everest would fit inside with room to spare" (top ~10 %, 0-3.6 s, separate from the 1-3-word captions at 64 %).
  2. ONE EMOTION: WOW (top of script.md).
  3. NO PADDING: 6 VO lines, 62 words, 22.25 s (target ~25 s +-3).
  4. 13 shots (new one every ~1.1-2.7 s); payoff "Only a handful of people have ever been down there." at 18.4-20.7 s with the sub landing at 10,935 m; no closer; the last 0.45 s replays the plunge so the last frame cuts into frame 1.
  5. Facts in sources.md, NOAA Ocean Exploration added as the depth source; "over 8 tons on every square inch" rounded as TOPICS says; "like stacking cars" is flagged as a computed comparison. Nobody hurt.
- **Checked:** `contact_sheet.png` (16 frames from the final file) and `frame1.png`.
- **Line 1 re-take (Main, Nov 15):** seed 7 was heard as "the water waste tons" (Whisper base.en) / "waterways" (base). Re-took LINE 1 word for word (no pause or spelling change); seed 42 is heard as "the water weighs tons" by base.en, small.en, base and small, also on the final mixed video. Spliced in (+0.10 s), everything after moved +0.10 s, captions re-aligned 62/62, full re-render (6m26s) + re-mix.
- **Voice:** Chatterbox D2, lines 2-6 on seed 7, line 1 on seed 42; "11" / "8" spelled for the TTS, digits kept in captions. Captions aligned 62/62 words.
- **Project:** `project/`. Re-render from `whatif/aitrends-2d-studio`: `CHROMIUM_PATH=/opt/pw-browsers/chromium node render.mjs --project ../../justinclips/shorts/ocean-bottom/project`, `python3 audio/mix.py --project ../../justinclips/shorts/ocean-bottom/project`, then `ffmpeg -i build/video_silent.mp4 -i out/What_If_You_Dove_to_the_Bottom_of_the_Ocean.mp4 -map 0:v:0 -map 1:a:0 -c copy -movflags +faststart video.mp4`. Cloud render 5m52s.
- Upload package: `UPLOAD.md`. Nothing was posted, uploaded or scheduled.
