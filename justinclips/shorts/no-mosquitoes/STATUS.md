STATE: ready

# Justin clips Short #30: no-mosquitoes ("What If Every Mosquito Disappeared? 🦟")
- **video.mp4**: 1080x1920, 24 fps, 600 frames, 25.0 s (audio 24.99 s), H.264 + AAC, **-14.4 LUFS, true peak -1.4 dBFS** (audio/mix.py). Checksum in `video.sha256`.
- **Jail-break checks:** frame 1 = a giant swarm already swirling around a camper, blinking out mosquito by mosquito (0.45-1.8 s). Line 1 "Every mosquito on Earth just vanished." starts at 0.15 s. Two-line top caption "scientists can't agree / if that's bad" (red box, top ~10%) is fully on from frame 1 to 3.7 s. EMOTION: WTF (debate). 7 VO lines, 14 shots (1.1-2.4 s each). Payoff: the CDC entomologist's Nature quote (21.2-25.0 s), as ONE mosquito flies back and lands on the camper's nose; straight cut back to the swarm (loop, no closer). Target ~25 s: 25.0 s.
- **Cut to hit the target:** the 282 million WHO line became an on-screen card only (the first take ran 29.7 s).
- **Contact sheet:** `contact_sheet.png` (16 frames, checked: frame 0 shows the top caption plus the swarm in motion).
- **Voice:** Chatterbox D2 (`--gap 0.3 --lead 0.15`), Whisper QA ok on all lines (line 5 seed 23, line 6 seed 11, others seed 7).
- **Facts:** `sources.md`. Second sources added: WHO malaria fact sheet + Smithsonian (cacao midges). **Open item:** the Nature article is paywalled and could not be opened here; the quote wording comes from the topic bank, backed by search summaries. Confirm it word for word before posting (see sources.md).
- **Project:** `whatif/aitrends-2d-studio/projects/no-mosquitoes`. Re-render from `whatif/aitrends-2d-studio`: `CHROMIUM_PATH=/opt/pw-browsers/chromium node render.mjs --project projects/no-mosquitoes` then `python3 audio/mix.py --project projects/no-mosquitoes`, then mux: `ffmpeg -i build/video_silent.mp4 -i out/What_If_Every_Mosquito_Disappeared.mp4 -map 0:v:0 -map 1:a:0 -c copy -movflags +faststart video.mp4`. Rendered in the cloud: 8m53s at about 1.1 fps, 4 workers.
- Nothing was posted, uploaded or scheduled.
