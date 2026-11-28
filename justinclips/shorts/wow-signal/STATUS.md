STATE: paused (rendering)

# The Wow! Signal — status

Paused on MAIN's request (owner asked all workers to stop) while the full 1080×1920 render was ~25 % done; the render was stopped.

Done:
- Facts checked (Wikipedia + bigear.org / arXiv / Space.com); see sources.md. Wording changes: "over 10,000 tweets" (Wikipedia "approximately 10,000", Space.com "more than 10,000"); no "red ink" claim; golf-course gag dropped (sources disagree on the demolition year).
- Voice: Chatterbox D2 raw take (QA: lines 4 and 6 flagged only for spelling: Whisper writes "6EQUJ5" as one token and "Ehman" as "Eman/Eamon"); line 10 re-taken with "over" and spliced (splice_line.py); tighten_vo.py 1.08 → 45.3 s voice.
- Whisper timing (tools/transcribe.py, 112/120 words aligned), make_shots.py → story/shots.json (28 shots, 45.54 s).
- Scenes (scenes/_lib.js, scenes/wow.js) checked on a 28-still sheet and fixes applied.

To resume (from whatif/aitrends-2d-studio, P=projects/wow-signal):
    CHROMIUM_PATH=/opt/pw-browsers/chromium node render.mjs --project $P --out $P/build/video_silent.mp4 --workers 4
    ~/.venvs/chatterbox/bin/python audio/mix.py --project $P   # then the -14 LUFS master step (as octopus-nine-brains), contact sheet, sha256

Not posted or uploaded anywhere.
