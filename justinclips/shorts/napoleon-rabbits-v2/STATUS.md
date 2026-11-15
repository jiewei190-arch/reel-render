STATE: ready

# Justin clips Short: napoleon-rabbits-v2 ("Napoleon Was Attacked by Rabbits (and Lost) 🐰")
- **Final video:** `video.mp4`: 1080x1920, 24 fps, **588 frames, 24.5 s**, H.264 + AAC, **-14.2 LUFS, true peak -1.1 dBFS** (mix.py), 17MB.
- `video.sha256`: `cdabb4e5535fcc56156b99508bf18ecbdf26a5a49aaaa819e933de17dabe11fe  video.mp4`
- **Jail-break checklist:**
  1. TRIPLE HOOK at 0 s: VISUAL = tiny panicking Napoleon (bicorne, sweat drops) swamped by a charging wave of 50 hopping rabbits; VERBAL = "Napoleon once lost a battle. To rabbits." from 0.14 s (heard as "...lost a battle to rabbits" by Whisper base.en, small.en, base and small on the final mix); TEXT = top caption "they thought he had lunch" (0-3.6 s, top ~10 %).
  2. ONE EMOTION: LOL.
  3. NO PADDING: 7 VO lines, 63 words (owner's ~135-word script tightened; "1807" moved to an on-screen tag). Voice sped up 4 % (ffmpeg atempo, pitch kept) to land 24.5 s vs TARGET ~22 s (+2.5 s, inside +-3).
  4. 17 shots (~1.1-2 s each); payoff "He fled to his carriage. Some reportedly hopped in after him." at 20.9-24.1 s (Napoleon deadpan in the carriage window, rabbits popping up around him); no closer; the last 0.4 s replays the opening swarm so the last frame cuts into frame 1.
  5. Facts in sources.md; every hedge kept ("Some accounts say thousands", "reportedly"); the memoir quote "the conqueror of conquerors" on a document card. Nobody hurt, no guns shown.
- **Checked:** `contact_sheet.png` (16 frames from the final file), `frame1.png`.
- **Mix note:** first mix had footsteps/crowd under the hook and Whisper base.en heard "Rabbids"; those SFX were lowered/removed and the voice re-checked (all 4 models OK).
- **Voice:** Chatterbox D2, all lines passed QA on seed 7 (--gap 0.25 --beat 0.45), then atempo 1.04. Captions aligned 63/63 (two words after the "..." beats placed by hand).
- **Project:** `project/`. Re-render from `whatif/aitrends-2d-studio`: `CHROMIUM_PATH=/opt/pw-browsers/chromium node render.mjs --project ../../justinclips/shorts/napoleon-rabbits-v2/project`, `python3 audio/mix.py --project ../../justinclips/shorts/napoleon-rabbits-v2/project`, then `ffmpeg -i build/video_silent.mp4 -i out/Napoleon_Was_Attacked_by_Rabbits.mp4 -map 0:v:0 -map 1:a:0 -c copy -movflags +faststart video.mp4`. Cloud render 7m02s.
- Upload package: `UPLOAD.md`. Nothing was posted, uploaded or scheduled.
