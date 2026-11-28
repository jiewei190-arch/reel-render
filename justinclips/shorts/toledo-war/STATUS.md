STATE: paused (rendering)

# The Toledo War — status (paused by MAIN before the full render)

Done:
- Facts checked: Wikipedia "Toledo War" + "Upper Peninsula of Michigan", plus Library of Congress blog, Toledo's Attic, Michigan Tech MHUGL, WorldAtlas (sources.md still to be written from these).
- Voice: Chatterbox D2, input/voiceover_raw.wav (line 5 re-taken as "hurt with a penknife" and spliced by splice_vo.py), tightened by
  tighten_vo.py 1.08 -> input/voiceover.wav 45.4 s. Whisper alignment 120/124 words.
- 23 shots in scenes/toledo.js + scenes/_lib.js, story/shots.json from make_shots.py (45.68 s). Synthesized SFX: make_sfx.py -> sfx/stare.wav.
- Preview sheet checked at 0.4 scale; chips moved clear of captions.

Not done: full 1080x1920 render, mix, master, Whisper QA on the final, contact sheet, script.md / sources.md / UPLOAD.md.

Resume (from whatif/aitrends-2d-studio, P=projects/toledo-war):
    CHROMIUM_PATH=/opt/pw-browsers/chromium node render.mjs --project $P --out $P/build/video_silent.mp4 --workers 4
    ~/.venvs/chatterbox/bin/python audio/mix.py --project $P   # then master to -14 LUFS / TP -1.5 as in octopus-nine-brains
