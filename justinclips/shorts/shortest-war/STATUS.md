STATE: ready

# Justin clips Short: shortest-war ("The Shortest War in History Lasted 38 Minutes ⏱️")
- **Final video:** `video.mp4`: 1080x1920, 24 fps, **636 frames, 26.5 s**, H.264 + AAC, **-14.6 LUFS, true peak -1.5 dBFS** (mix.py), 8.8MB.
- `video.sha256`: `2c62fddd4230612ba20e1ef26f2a609a6019b434a9e6d365cfacccbb62543704  video.mp4`
- **Jail-break checklist:**
  1. TRIPLE HOOK at 0 s: VISUAL = a warship firing at the palace (muzzle flash + smoke) under a giant ticking stopwatch; VERBAL = "The shortest war in history lasted 38 minutes." from 0.15 s (heard word for word by Whisper base.en, small.en, base and small on the final mix); TEXT = top caption "over before breakfast" (0-3.6 s, top ~10 %).
  2. ONE EMOTION: WOW.
  3. NO PADDING: 6 VO lines, 69 words (owner's ~130-word script tightened; the "almost certainly poisoned" detail dropped for length, as the brief allows). 26.5 s vs TARGET ~24 s (+2.5 s, inside +-3).
  4. 13 shots (~1.5-2.7 s each); payoff "Still the shortest war ever recorded." with the record stamp on the 38:00 stopwatch at 23.9-26.0 s; no closer; the last 0.45 s replays the opening shot so the last frame cuts into frame 1.
  5. TONE GUARD: the casualty line ("Around 500 defenders were killed or wounded. Britain had one injured sailor.") is said once, plainly, over two quiet dimmed shots (smoke over the palace, the still harbour) with dissolves, no sound effects, no faces, no scoreboard, no confetti. Comedy only on the stopwatch, the 9:00 deadline card and the empty royal yacht sinking.
  6. Facts in sources.md (HistoryExtra / History Revealed, Historical Association, Atlas Obscura + others); "Around 500" kept; 38 min noted as the standard figure (some sources 38-45).
- **Checked:** `contact_sheet.png` (16 frames from the final file), `frame1.png`.
- **Voice:** Chatterbox D2, all lines on seed 7 (Whisper writes the spoken "nine thirty-eight" as "9.38", the only QA flag). Clock times written as words for the TTS; on-screen clocks show 9:00 / 9:38.
- **Project:** `project/`. Re-render from `whatif/aitrends-2d-studio`: `CHROMIUM_PATH=/opt/pw-browsers/chromium node render.mjs --project ../../justinclips/shorts/shortest-war/project`, `python3 audio/mix.py --project ../../justinclips/shorts/shortest-war/project`, then `ffmpeg -i build/video_silent.mp4 -i out/The_Shortest_War_in_History.mp4 -map 0:v:0 -map 1:a:0 -c copy -movflags +faststart video.mp4`. Cloud render ~9.5 min.
- Upload package: `UPLOAD.md`. Nothing was posted, uploaded or scheduled.
