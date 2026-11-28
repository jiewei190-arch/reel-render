STATE: paused (rendering)

# The Exploding Whale: status

Paused at the owner's request (MAIN), partway through the first full 1080x1920 render (about 20% of frames, now stopped). Nothing was posted or uploaded.

Done:
- Facts checked (sources.md: Wikipedia x2, Spokesman-Review/Washington Post, Mental Floss, KATU). Changes vs the card: the park is named for the event, not the official (Wikipedia: "in honor of the incident"); "nobody hurt" -> "Nobody was seriously hurt".
- script.md (11 lines, 113 words), UPLOAD.md.
- Voice: Chatterbox D2, raw 46.6 s; line 6 "3... 2... 1..." re-taken (seeds 31,47,59,71,83 -> QA ok) and spliced in; tighten_vo.py -> 42.6 s (atempo 1.04, +1.3 s BOOM beat before line 7). Whisper alignment 94%; countdown digit times set from the audio envelope.
- Toon 3D scenes (scenes/_lib.js, scenes/whale.js), 25 shots (make_shots.py -> story/shots.json, 42.87 s). Stills checked at 0.35 scale.

To resume (from whatif/aitrends-2d-studio, P=projects/exploding-whale):
    CHROMIUM_PATH=/opt/pw-browsers/chromium node render.mjs --project $P --workers 4 --out $P/build/video_silent.mp4
    ~/.venvs/chatterbox/bin/python audio/mix.py --project $P --video $P/build/video_silent.mp4
    then: loudness check (-14 LUFS, TP <= -1), Whisper QA on the final, contact sheet, video.mp4 + sha256, STATE: ready.
