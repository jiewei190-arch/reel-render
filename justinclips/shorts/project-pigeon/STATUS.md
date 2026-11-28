STATE: paused (rendering)

# Project Pigeon — status

Paused on MAIN's instruction (owner asked all workers to stop) while the full 1080x1920 render was ~22% done (240/1089 frames).
The render was stopped; nothing of it is kept. Resume = re-run the render + mix below.

Done:
- script.md, sources.md (Wikipedia + Smithsonian Magazine + army.mil + MIT Technology Review, quoted), UPLOAD.md.
- Voice: Chatterbox D2 raw take (input/voiceover_raw.wav, 49.9 s) → tighten_vo.py 1.04 → input/voiceover.wav (45.1 s).
  QA: all lines word-for-word except spelling-only differences (Whisper writes "World War II", "$25,000", "canceled").
- Whisper word timings (112/116 script words aligned), story/shots.json (23 shots, 45.36 s) from make_shots.py.
- Toon 3D scenes (scenes/_lib.js, scenes/pigeon.js), checked on two stills sheets at 0.35 scale (fixes applied: cockpit
  proportions, over-the-shoulder camera, office/demo/Navy framing, the "Committed" stare).
- Original peck SFX (make_pecks.py → sfx/*.wav).

Wording changes vs the brief:
- "pecked 10,000 times in 45 minutes" and "eccentric and impractical" are Wikipedia-only → said as "reportedly".
- The demo "reportedly worked" (Smithsonian: "successful demonstration"; MIT TR notes doubts about the test conditions).

Remaining (on resume), from whatif/aitrends-2d-studio (P=projects/project-pigeon):
    CHROMIUM_PATH=/opt/pw-browsers/chromium node render.mjs --project $P --workers 4 --out $P/build/video_silent.mp4
    ~/.venvs/chatterbox/bin/python audio/mix.py --project $P --video $P/build/video_silent.mp4
    ffmpeg -i $P/build/mix.wav -af "alimiter=limit=0.6:attack=3:release=60:level=false,loudnorm=I=-14:TP=-1.5:LRA=11" -ar 48000 $P/build/mix_master.wav
    ffmpeg -i $P/build/video_silent.mp4 -i $P/build/mix_master.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest ../../justinclips/shorts/project-pigeon/video.mp4
  then sha256, contact sheet (justinclips/tools/contact_sheet.py), Whisper QA on the final file, STATE: ready.
Nothing was posted, uploaded or logged in anywhere.
