STATE: ready-for-gpu-render

# I.Awaken Short: short-blackhole-3d — "What If You Fell Into a Black Hole?" (Toon 3D remake)

- Branch: `iawaken/short-blackhole-3d` (cut from `iawaken/toon3d`, which has the kit). Project: `whatif/aitrends-2d-studio/projects/short-blackhole-3d/`.
- 9:16, 1080x1920, 24 fps, **25.70 s (617 frames)**, 15 shots, captions on (kits/toon3d/captions.js, y 0.70, gold words). `fadeIn 0`, `fadeOut 0` (hard cut = loop).
- Same voiceover take, word timings and shot timings as the 2D `short-blackhole` (s001-s013 unchanged; s014 ends at 23.95 instead of 24.318).
- **Closer (new):** "Subscribe for more." voiced alone with `whatif/voice/fenrir.py --gap 0 --lead 0` (am_fenrir, speed 0.95), level-matched to the
  main take and spliced at 24.00 s (spoken 24.03-25.08) -> `input/voiceover.wav`. Pieces kept: `input/voiceover_main.wav` (the original 24.318 s take),
  `input/closer.wav`, `input/closer_script.md`. Words for the closer added to `timeline/words.json` by hand from the envelope (Subscribe 24.03, for 24.61, more 24.76).
  On screen: the caption + a gold "SUBSCRIBE FOR MORE" pill (s015).
- Structure: HOOK 0-2.0 s (hero already tumbling toward the hole on frame 0) -> BUILD-UP 2.0-15.4 s (nothing / feet vs head / worse /
  small hole stretch / Dr Lin "spaghettification") -> PAYOFF 15.4-22.8 s (giant one, 4,300,000 suns, event horizon, felt nothing... yet)
  -> "Which one would you pick?" -> "Subscribe for more." (the hole yanks him away, loops to frame 1).
- Cast: HERO (bean, mustard hoodie, hood up; hood down in the lab), DR LIN (lab coat, green lanyard, glasses). New for this project
  (`scenes/_lib.js`): space stage (stars, dust), toon black hole (black core, banded spinning accretion disk, lensed halo ring, glow),
  `floater()` (hero pivot with a volume-keeping cartoon `stretch()`), cartoon suns, the event-horizon dash line, Dr Lin's classroom with a
  chalkboard that writes SPAGHETTIFICATION letter by letter.
- Preview: `preview_short-blackhole-3d.mp4` 540x960, full length, mixed: **-14.1 LUFS integrated, true peak -1.1 dBFS**, 617 frames = silent render.
- QC: `contact_short-blackhole-3d.png` (frame 0, one frame per shot, last frame). Frame 0 not blank, hook visible from frame 0, captions
  never clipped, faces above the caption band, numbers in gold, no SHOT ERROR / MISSING.

## Softened / attributed claims (unchanged from the 2D version, see sources.md)
- "you'd cross the point of no return without even noticing" follows "may cross the event horizon without noticing any significant tidal forces";
  not "you survive" (NASA SVS: destroyed 12.8 s after crossing). On screen: "FELT NOTHING... (YET)".
- "SMALL: ~10 SUNS" = an example inside the stellar-mass range (5-20 Suns). "4,300,000 SUNS / LIKE OUR GALAXY'S CENTRE" = the NASA SVS mass (Sgr A*);
  narration only says "millions of suns". The chalkboard "TIDAL ∝ M / r³" is the standard scaling, shown as a doodle.

## GPU render + mix on the owner's PC (from `reel-render\whatif\aitrends-2d-studio`, kit PATH from SETUP_NOTES.md)
```
git fetch origin iawaken/short-blackhole-3d && git checkout iawaken/short-blackhole-3d && git pull
cd whatif/aitrends-2d-studio
npm install                                                                   # only if node_modules is missing
pip install numpy scipy soundfile                                             # only if the venv lacks them (mix.py needs scipy)
node render.mjs --project projects/short-blackhole-3d --sheet --scale 0.5     # optional sanity check -> build/sheets/sheet_01.png
node render.mjs --project projects/short-blackhole-3d --gl gpu --workers 6    # -> projects/short-blackhole-3d/build/video_silent.mp4 (1080x1920, 24 fps, 617 frames)
python audio/mix.py --project projects/short-blackhole-3d --video projects/short-blackhole-3d/build/video_silent.mp4   # -> build/mix.wav (+ out/*.mp4, ignore it)
python projects/short-blackhole-3d/master.py projects/short-blackhole-3d/build/video_silent.mp4 ../../iawaken/shorts/short-blackhole-3d/video.mp4
```
`master.py` = two-pass loudnorm of build/mix.wav to -14 LUFS / TP -1.5 dBTP, audio put on the FULL silent video with `-c:v copy`
(mix.py's own mux dropped the last frame here), then it prints frames, duration, LUFS and true peak. Expect 617 frames, 25.708 s, ~-14 LUFS, TP <= -1 dBFS.
If `--gl gpu` gives black frames, use `--gl auto`. (Linux: `python3`.)

## Cloud notes
- Rendered with the preinstalled Chromium (`CHROMIUM_PATH=/opt/pw-browsers/chromium`, SwiftShader). 540x960 with 4 workers: 4.9 fps (617 frames in 2m06s).
- Installed in this container only: `kokoro-onnx`, `soundfile`, `scipy` (pip) and the Kokoro model files in `tts/` (git-ignored).
- Nothing was posted, uploaded or scheduled.
