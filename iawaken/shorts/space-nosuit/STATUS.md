STATE: animating
# space-nosuit: "What If You Went to Space Without a Suit? 🚀" (I.Awaken Short, Toon 3D)
- **Re-voice in progress (owner fix):** the year is now spoken "nineteen sixty-six" (Kokoro read "1966" as "nineteen hundred sixty-six"). The full re-render is running; video.mp4 below is the old cut until this flips back to ready.

- **Final: `video.mp4`** (1080x1920, 24 fps, 855 frames, 35.6 s, H.264 + AAC 192k, 16.9 MB, no split needed). Checksum in `video.sha256`.
  Rendered in the cloud (SwiftShader, 4 workers, 9m31s). Audio: `audio/mix.py` (Fenrir VO + procedural music playful -> tension -> hopeful + 26 SFX cues),
  then a two-pass loudnorm on mix.py's raw mix (mix.py's single pass landed at -14.7). Measured on video.mp4: **-14.3 LUFS integrated, -1.3 dBFS true peak**.
  The mixed audio was muxed onto the full silent render with `-c:v copy` (no `-shortest`): all 855 frames are kept.
- Preview: `preview_space-nosuit.mp4` (540x960 downscale of the final). QC: `contact_space-nosuit.png` (one frame per shot + the closer + the last frame).
- Script: `script.md` (12 lines, Kokoro am_fenrir 0.95, gaps 0.3/0.15, beats 0.75 s). Sources: `sources.md` (Guinness, BBC Sky at Night, NASA SP-3006 via G. A. Landis, Wikipedia).
  Fact-check change vs the topic bank: "your blood doesn't boil" was dropped (NASA SP-3006 says vapour also forms in venous blood) and replaced by "you don't freeze solid either" (vacuum = insulator).
- Timing: faster-whisper small, 87/87 script words aligned; 21 shots in `project/story/shots.json`.
- Formula check: frame 1 = HERO tumbling out of the airlock above the Earth, "10" stopwatch already ticking. Line 1 = 7 words. Twist at 5.8 s ("But you don't explode.").
  New visual every 1.2-2.7 s, reactions after each reveal (DEV disappointed, HERO shocked, DR LIN slams the button). Escalations: no freeze -> spit boils (1966) -> lights out at ~10 s.
  Payoff: repressurised in 87 s, "He woke up fine." Closer "Subscribe for more." = 0.96 s. Last frame = frame 1 (loop). Captions 1-3 words at 66 % height; chips at 14 %, stopwatch at 16.5 %: clear of the Shorts top bar and bottom title/description zone.
- No gore: no swelling or injury is shown; cartoon fizz bubbles, eyes closing, a rescue and a thumbs-up.
- Known nit: in s18/s19 the "VACUUM CHAMBER" sign is cropped at the frame edges (the chamber, gauge and porthole read fine).
- Files: project `project/` (config.json, input/voiceover.wav [git add -f], input/script.txt, timeline/, story/shots.json, scenes/{kit,_lib,space,lab}.js).
  Render from `whatif/aitrends-2d-studio`: `node render.mjs --project ../../iawaken/shorts/space-nosuit/project` (cloud: `CHROMIUM_PATH=/opt/pw-browsers/chromium`, playwright symlinked to the global one; PC: `--gl gpu`).
- NOT posted, uploaded or scheduled.
