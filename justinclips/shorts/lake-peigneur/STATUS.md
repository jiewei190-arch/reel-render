STATE: ready

lake-peigneur: "Lake Peigneur Disaster: The Drill Hole That Swallowed a Lake" (Justin clips, YouTube Shorts). Toon 3D + BEANMEN FX,
narrated with Chatterbox D2. Rendered fully in the cloud (owner's PC unreachable). Nothing posted, uploaded or logged into.

- `video.mp4`: 1080x1920, 24 fps, 991 frames, 41.29 s, H.264 + AAC 192k, 31.8 MB (no split needed). Full silent render + mix.wav muxed
  with -c copy (all 991 frames kept). Measured -14.5 LUFS integrated, true peak -1.3 dBFS.
  `video.sha256` = 45abae5f18f29d387b0e2057bc3db1129ac51615e17a70a07a58805afff4514e
- Voice QA: chatterbox_d2.py Whisper QA ok on 8 of 10 lines. The 2 flagged lines are expected: line 2 "Pan-yur" (the TTS spelling of
  Peigneur, heard as "Pannier"/"Paneur" = pan-YUR) and line 9 "salt water" heard as one word "saltwater". Whisper small.en on the FINAL video
  matches the script word for word ("Lake Paneur" = the intended pronunciation); "1980" is said "nineteen eighty".
  The four "..." held beats were trimmed from 0.7 s to 0.45 s, and the trailing silence was trimmed so the closer "Subscribe for more." is 1.33 s
  and hard-cuts to frame 1 (loop). The raw take is reproducible with the same seeds.
- `preview_540x960.mp4` (half size, from the final) + `contact_sheet.png` (20 frames, Shorts UI zones shaded red): checked frame 1
  (whirlpool + hook text readable in 1 s), captions (1-3 words, y 0.70) clear of the UI zones, reaction FX (!, ???, sweat, sparkle, hearts,
  stars, shake, flash), insert/flip cards (164 FT waterfall bigtext, 10 FT -> 200 FT depth card) + stamps (65 ACRES, NO ONE DIED), transitions
  (flash, whipBlur, iris), and that the last frame = the frame-1 shot (loop).

FACT-CHECK CHANGES vs the owner's kit (see sources.md):
- "right above a salt mine 1,300 feet down" -> "right above a salt mine." + "At about 1,230 feet down, the drill punched into the mine."
  Wikipedia gives the drill as stuck at 1,228 ft, and Damn Interesting gives about 1,230 ft. 1,300 ft is "the mine's 1,300-foot level" (UPI), not the drill depth.
  "punched through the mine's ceiling" became "punched into the mine" to keep to what the sources say.
- MAIN's edit is applied: "Every person got out alive." The 3 dogs are not mentioned. No blame beyond the drill piercing the mine (MSHA never named a cause).
- 164 ft waterfall: Wikipedia ("for a few days the tallest waterfall in Louisiana"). Some sources say ~150 ft. The card says "(for a few days)".
- Kept but supported only by Wikipedia: 400-ft geysers (shown, not narrated). The owner's "Engineering Oops" article was not found online.
- The owner's script was split into 10 spoken lines (same words, plus the depth fix). "Peigneur" is said once, then "the lake".

Rebuild (from whatif/aitrends-2d-studio; Linux cloud: export CHROMIUM_PATH=/opt/pw-browsers/chromium):
  (voice, from projects/lake-peigneur) ~/.venvs/chatterbox/bin/python ../../../voice/chatterbox_d2.py input/voice_script.md input/voiceover.wav input/script.txt --gap 0.3 --comma 0.15 --lead 0.15 --seeds 7,11,23,31,42
     then trim the beats/tail as above (or reuse the committed voiceover.wav) and restore input/script.txt ("Peigneur", no "..." marks)
  python3 tools/transcribe.py --project projects/lake-peigneur --model small --lang en --script projects/lake-peigneur/input/script.txt
  (from projects/lake-peigneur) python3 retime.py && python3 make_music.py
  node render.mjs --project projects/lake-peigneur --out projects/lake-peigneur/build/video_silent.mp4   (PC: add --gl gpu)   [cloud: 13m29s, 4 workers]
  python3 audio/mix.py --project projects/lake-peigneur --video projects/lake-peigneur/build/video_silent.mp4 --out projects/lake-peigneur/build/video_mixtool.mp4
  ffmpeg -i projects/lake-peigneur/build/video_silent.mp4 -i projects/lake-peigneur/build/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -af apad -shortest -movflags +faststart video.mp4
