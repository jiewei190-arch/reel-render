STATE: ready

molasses-flood: "A Molasses Tsunami Killed 21 People in Boston" (Justin clips, YouTube Shorts). RE-VOICED (Nov 13) with the
owner's new narrator, Chatterbox D2, as MAIN asked; same script, shots, captions, effects, packaging and tone guard. Rendered
fully in the cloud. Nothing posted or uploaded.

- `video.mp4`: 1080x1920, 24 fps, 1144 frames, 47.67 s, H.264 + AAC 192k, 28.7 MB (no split needed).
  Measured -14.5 LUFS integrated, true peak -1.4 dBTP. `video.sha256` = 813262ec78b8ca7acbf447bd026fcddee5e0754e5f78233caeadd4908d92c322
- Voice QA: chatterbox_d2.py Whisper QA matched every line (`projects/molasses-flood/input/voiceover.lines.json`). Whisper small.en
  on the FINAL video.mp4 also matches the script word for word. "1919" is spoken "nineteen nineteen" (TTS text in lines.json).
  Line 11 is written "Biggest lie, in history." for the TTS only (without the comma every seed was heard as "lion history"); the words are unchanged.
- Re-timed to the new VO (`projects/molasses-flood/retime.py`: every cut is anchored to a word; captions, sfx word cues, the music bed
  and the s17 caption-hide window follow). Edits to the VO: +0.6 s of silence after "150 injured." keeps the quiet aftermath beat (3.1 s
  shot, sad music, no FX); 0.34 s of trailing silence trimmed so the closer "Subscribe for more." is 1.25 s and the loop lands on frame 1.
- `preview_540x960.mp4` (half size, from the final) + `contact_sheet.png` (20 frames, Shorts UI zones shaded red): checked frame 1
  (wave + hook text), captions clear of the UI zones, reaction FX + 3 insert cards, and the last frame = the frame-1 shot (loop).
- Tone guard unchanged: nobody is shown hurt or trapped; no horse gag; the aftermath is a quiet, respectful beat.

Rebuild (from whatif/aitrends-2d-studio; Linux cloud: export CHROMIUM_PATH=/opt/pw-browsers/chromium):
  (voice, from projects/molasses-flood) ~/.venvs/chatterbox/bin/python ../../../voice/chatterbox_d2.py input/voice_script.md input/voiceover.wav input/script.txt --gap 0.3 --comma 0.15 --lead 0.15 --seeds 7,11,23,31,42
     then re-apply the two silence edits above (or reuse the committed voiceover.wav), and restore input/script.txt without the "..." beat marks
  python3 tools/transcribe.py --project projects/molasses-flood --model small --lang en --script projects/molasses-flood/input/script.txt
  (from projects/molasses-flood) python3 retime.py && python3 make_music.py
  node render.mjs --project projects/molasses-flood --out projects/molasses-flood/build/video_silent.mp4   (PC: add --gl gpu)
  python3 audio/mix.py --project projects/molasses-flood --video projects/molasses-flood/build/video_silent.mp4 --out projects/molasses-flood/build/video_mixtool.mp4
  ffmpeg -i projects/molasses-flood/build/video_silent.mp4 -i projects/molasses-flood/build/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -af apad -shortest -movflags +faststart video.mp4
