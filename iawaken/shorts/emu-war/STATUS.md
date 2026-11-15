STATE: ready

# I.Awaken Short: emu-war ("Australia Lost a War to Birds 🐦")
- **Final video:** `video.mp4`: 1080x1920, 24 fps, **834 frames, 34.75 s** (audio 34.72 s), H.264 + AAC, **-14.6 LUFS, true peak -1.0 dBFS**, 23.5 MB (no split needed).
- `video.sha256`: `e70e417999af485b1ef43b28a1ca94f0e37d7713ff29fc038ff252bd292e922e  video.mp4` (Git Bash: `sha256sum -c video.sha256`).
- **Year fix (owner, Nov 8):** the voice now says "It's nineteen thirty-two" (Kokoro had read "1932" as "nineteen hundred thirty-two"; checked with Kokoro's phonemes and Whisper). Only that line was re-voiced (same fenrir settings) and spliced; everything after it moved by -0.18 s. The caption still shows the digits "It's 1932." (one chunk across the spoken year). The preview in `preview/` is from before this fix.
- **Upload package:** `UPLOAD.md` (title, description + sources + "Voice is synthetic." + hashtags, pinned either/or question, cover frame 6.9 s, suggested post time).
- **Script / sources:** `script.md`, `sources.md` (all claims checked against National Geographic, BBC Discover Wildlife and Wikipedia/Johnson 2006; Britannica returned 403; 986 said as "the commander reported").
- **Preview:** `preview/emu_war_preview_540x960.mp4` + `preview/contact_sheet.png`. Checked: frame 1 = the emu general already charging (Line 1 at 0.18 s), twist at 3-8 s, a new visual every 1-3 s (17 shots), reaction faces after each reveal, captions 1-3 words at 66 % height (clear of the bottom title zone and the right-hand buttons), payoff "Emus, one. Army, zero." at 30-33 s, closer "Subscribe for more." 1.0 s, last frame == frame 1 (seamless loop).
- **Formula:** Line 1 "Australia declared war on birds." (5 words) + "And lost."; escalations: 20,000 emus -> the gun on a truck can't catch them -> 986 out of 20,000; 34.9 s.
- **Voice:** Kokoro am_fenrir, speed 0.95, short gaps (0.3 s) with 0.75 s beats before punchlines. Word timings from the TTS sentence segments (Whisper alignment was 87 %, so captions are timed to the real speech onsets).
- **Project:** `project/` (Toon 3D kit, 17 shots). Re-render from `whatif/aitrends-2d-studio`: `node render.mjs --project ../../iawaken/shorts/emu-war/project` then `python audio/mix.py --project ../../iawaken/shorts/emu-war/project`. mix.py trimmed frames, so the final file is the full silent render with the mixed audio stream copied in (`ffmpeg -i build/video_silent.mp4 -i out/Australia_Lost_a_War_to_Birds.mp4 -map 0:v:0 -map 1:a:0 -c copy -movflags +faststart video.mp4`).
- **Kit additions** (reusable): `kits/toon3d/animals.js` (emu), 1930s/outback props, `SETS.outbackFarm`, slouch hat, moustache.
- Rendered in the cloud (SwiftShader, 4 workers): full res 10m33s. Build frames deleted.
- **Branch:** iawaken/toon3d (this session may only push to its own branch; the job allowed this fallback).
- Nothing was posted, uploaded or scheduled.
