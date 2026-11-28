STATE: paused (rendering)

# A Masked Stranger Hijacked Chicago TV (1987) — status

Paused on MAIN's request while the full 1080x1920 render was ~65% done (720/1111 frames). That render was stopped and
nothing from it is kept; on resume, re-run the render step below.

Done:
- Facts checked: Wikipedia + Damn Interesting + Wikisource transcript (sources.md quotes every line). Lines changed vs the card:
  no duration for the first intrusion (Wikipedia gives both ~17 s and ~30 s), "two hours later" instead of a clock time
  (11:15 vs ~11:20 p.m. differ), real character's name kept off screen and out of the VO ("an 80s TV character").
  Sunglasses are in Wikipedia only.
- script.md, sources.md, UPLOAD.md written. Voice: Chatterbox D2 raw take 53.4 s (Whisper QA OK on every line; the 3 "QA FAIL"
  flags are only TV/80s/FCC spelling normalisation), tightened by tighten_vo.py 1.08 to 46.0 s (+0.5 s tail = 46.26 s).
  transcribe.py: 124/126 words aligned. story/shots.json: 21 shots (make_shots.py).
- Scenes (scenes/_lib.js, scenes/hijack.js) and original SFX (make_buzz.py -> sfx/) done; preview sheet checked and framing fixed
  (TV shots, chip/caption overlaps, s16 crew).

To do on resume: full render, mix to -14 LUFS / TP <= -1, Whisper QA on the final mp4, contact sheet, video.mp4 + sha256, STATE: ready.

Rebuild, from whatif/aitrends-2d-studio (P=projects/tv-signal-hijack-1987):
    CHROMIUM_PATH=/opt/pw-browsers/chromium node render.mjs --project $P --workers 4 --out $P/build/video_silent.mp4
    ~/.venvs/chatterbox/bin/python audio/mix.py --project $P --video $P/build/video_silent.mp4
