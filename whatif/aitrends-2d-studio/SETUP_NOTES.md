# aiTrends 2D Studio: local setup notes

Installed 2026-10-29. Source: aitrends-2d-studio.plugin, kit/ from the make-2d-video skill (reviewed copy in the session scratchpad).
Self-test result: PASSED. See selftest_sheet.png (14 frames: cafe, giant faces, 3D orbit, blueprint charts, title card, lab).

## What is installed where
- Kit: this folder. `python tools/verify_kit.py` -> 29/29 files verified.
- Python venv: `.venv\` (numpy, scipy, faster-whisper). System Python 3.14.7 untouched.
- Node 24.19.0 (pre-existing). `npm install` -> three 0.169.0, playwright 1.56.0, 3 @fontsource fonts (versions pinned in package.json).
- Chromium: `npx playwright install chromium` (goes to %LOCALAPPDATA%\ms-playwright).
- ffmpeg: `bin\ffmpeg.exe` is a copy of the imageio-ffmpeg build (7.1) from human-limits\edit\.venv.
- ffprobe: the imageio build has none, and the kit needs it (doctor.py, new_project.py, parse_script.py call it).
  So `winget install --id Gyan.FFmpeg -e` was run (allowed by the brief). This installed FFmpeg 9.0.2 under
  %LOCALAPPDATA%\Microsoft\WinGet\Packages\Gyan.FFmpeg_...\ and modified the USER PATH, so it is not kit-only.
  Only ffprobe.exe was copied into `bin\`. Nothing in the kit needs the winget ffmpeg itself.

## Commands that worked (Git Bash or PowerShell, from this folder)
Activate the kit environment first (puts bin\ and .venv\Scripts on PATH for that shell only):
- cmd/PowerShell: `.\env.cmd` (cmd) or `$env:PATH = "$PWD\bin;$PWD\.venv\Scripts;$env:PATH"`
- Git Bash: `export PATH="$PWD/bin:$PWD/.venv/Scripts:$PATH"`

    python tools/verify_kit.py
    python -m venv .venv ; .venv\Scripts\python -m pip install numpy scipy faster-whisper
    npm install
    npx playwright install chromium
    python tools/doctor.py                      # all OK (with the PATH above)
    node render.mjs --project examples/reaction-time --sheet --scale 0.3   # ~3 s, writes build/sheets/sheet_01.png

Then the example build/ folder was deleted, as the docs say.

## Windows quirks
- doctor.py and the tools call `python`, `ffmpeg`, `ffprobe` by bare name. Always run them from a shell with the PATH above,
  otherwise doctor reports "MISSING ffmpeg + ffprobe" or checks the wrong Python (the venv python is what finds faster-whisper).
- winget's PATH change only reaches NEW terminals; its "Links" folder was empty here, so the real binary is in the package folder.
- doctor.py prints a mangled em dash in the cp1252 console. Harmless.
- Use `python`, not `python3`. Quote paths with spaces.
- 16 threads + NVIDIA GPU: Chromium uses the GPU (--gl auto). Default workers = 6 here.
- Whisper model downloads (~75 MB base, ~500 MB small) from huggingface.co on first transcribe. Not yet triggered.

## Starting a new project
    python tools/new_project.py --name cold-open --voice "C:\path\vo.mp3" [--script script.txt] --aspect 16:9 --resolution 1080p --title "..." [--captions]
Creates projects/<slug>/ with config.json, input/, timeline/, story/, scenes/{sets,shots}/, build/, out/.
Then timing:
- Plain script aligned to audio: `python tools/transcribe.py --project projects/<slug> --script projects/<slug>/input/script.txt --lang en --model small` (needs >= 90% match)
- No script: same without --script. `--model base` is faster.
- Timestamped script (SRT/VTT/JSON/[mm:ss] TXT): `python tools/parse_script.py --project ... --script ...`
- Then `python tools/beats.py --project projects/<slug>` (options --target 3.0 --max 6.5 --min 1.2 --lead 0.15 --tail 1.5, --force overwrites)
  writes the beat sheet and a draft story/shots.json. timeline/ holds words, sentences, transcript.txt.
Narration is never altered; shots.json owns all timing (contiguous shots, last `end` == duration).

## How shots, sets and cast are defined
- scenes/cast.js: plain outfit objects, e.g. `{ top:'hoodie', color:'#d64a33', head:'none' }`
  (top: hoodie|labcoat|trench|jersey|tshirt|suit|dress|tracksuit|none; head: cap|beanie|fedora|hood|ponytail|bun|curly|spiky|...; legs, face: glasses|sunglasses).
- scenes/sets/<place>.js: reusable functions drawing a location (flat shapes, gradients, parallax layers), anchored to GY = E.H*V(0.8,0.68), CX = E.W/2.
- scenes/shots/NN_name.js: `registerShot('s013', { draw(g, t, info){...} })` for 2D, or `{ kind:'3d', init, draw, overlay }` using three-kit.
  Uses drawFigure, POSES, posesAt, bigFace, FX (dust/rain/godRays...), UI (titleCard, dataCard, blueprint, captions...), wordTime() to sync graphics to words.
  Every .js under scenes/ auto-loads (files starting with _ skipped). No Math.random/Date.now (use rng(seed), t).
- story/shots.json: per shot id, start, end, line, scene, set, bars, `in` transition (cut|fade|dip|dipWhite|flash|whip|zoom), sfx, amb, params; plus music sections.
- config.json: title, aspect, resolution, fps, style, captions, bars, music/sfx gain, loudness.
Look at the example: examples/reaction-time/scenes and story/shots.json.
Useful checks: `--sheet --scale 0.5` (contact sheet), `--stills t1,t2`, `--from A --to B --scale 0.5` (build/preview.mp4), `--styles dusk,midnight,... --at t1,t2` (style grid).
Final: `node render.mjs --project projects/<slug>` then `python audio/mix.py --project projects/<slug>` (music+SFX, -14 LUFS, muxes out/<title>.mp4).

## Render speed (measured here)
Test: 10 s of the self-test (12-22 s, includes the 3D orbit shot and blurred cafe shots), 1080p, 24 fps, 6 workers, GPU:
- default PNG capture: 240 frames in 59 s = 4.1 fps  ->  about 6 s of render per second of video
- `--workers 10 --format jpeg`: 40 s = 6.2 fps  ->  about 4 s per second of video
- 720p, first 6 s (mostly 2D): ~15 fps, about 1.6 s per video second (incl. startup).
So a 45 s 1080p cold open is roughly 3-4.5 min per full render. Cheap enough to iterate. 3D and heavy blur shots are the slow ones.

## Custom character ("Sam") and styles
Cast entries only choose clothing/headwear colours for the built-in stick figure. The body is fixed code in engine/rig2d.js:
- Head is always a filled circle in `S().ink` (near-black); eyes/mouth drawn in the light `feature` colour. Sam's off-white disc head is NOT possible via config.
- Limb widths are constants (legs 12.5, arms 11, torso 15, head r 26); the style bible wants thick ink limbs. Sam's thin dark limbs need a width multiplier.
- Eyes available: dot, ring, wide, happy, closed. No half-lidded eyes (closest: 'sleepy' = closed, 'neutral' = dots).
- Hoodie top exists (colour is configurable, so mustard #e1ad01-ish is trivial); trousers via `legs:` colour (dark teal is trivial). Hair: spiky/curly exist, a "messy tuft" would be a new `head` type in drawHeadwear.
Effort to add Sam: moderate, a code change not a config change. Roughly: add outfit fields `headFill`, `limbScale`, `limbColor`, `eyes:'halfLid'`; make face() use dark features on a light head;
add a tuft in drawHeadwear; mirror in bigFace and figure3D if Sam appears in giant close-ups/3D. Estimate half a day to a day, then tuning via --sheet. Because style 'ink' tokens are global, the
rim light/silhouette pass would also need to work with a light head (rim on a pale head may look odd). Doable; the engine is ~800 lines and readable. Not something the kit supports out of the box.
Storybook preset: YES, `storybook` exists in engine/styles.js ("Soft Storybook": pastel, low contrast, lavender shadows, paper grain). Others: dusk, midnight, golden, neon.
It is a colour grade + palette only (not a hand-drawn/illustrated look); flat vector shapes remain. Try: `--styles dusk,storybook --at t1,t2,t3`.

## Toon 3D FX pack (2026-11-09, cloud)
- Linux cloud: `pip install numpy scipy`, `npm install`, `export CHROMIUM_PATH=/opt/pw-browsers/chromium` (PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers; never `playwright install`). Use `python3`.
- Kit audio WAVs are under `kits/toon3d/audio/`; the repo `.gitignore` ignores `*.wav`, so add new ones with `git add -f`.
- FX demo: 16.6 s, 1080x1920 full render with 4 workers (SwiftShader) in the cloud; see kits/toon3d/README.md "BEANMEN effects".
