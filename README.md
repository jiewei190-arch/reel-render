# reel-render: shared kit for howitreallyworkstudio reel workers

Private repo used to hand work between the main Claude session and cloud worker agents.
Workers build ONE reel each, push the finished mp4 + caption + sources to `jobs/<name>/`, and stop.

## Rules (set by the account owner; follow exactly)
- Account: Instagram + YouTube "howitreallyworkstudio". Vertical animated "how it really works" explainers, 66-86 s, beginner friendly.
- Every claim must be sourced (write `sources_<name>.md`); drop or attribute anything you cannot verify. No realistic photos, nothing crude or gory.
- VOICE: female voice `af_heart`, speed 0.97, music 'crayon', bpm 88 (copy specs/leaf.json settings and its breath list).
- ART STYLE: pick ONE style from the downloaded style repos (list below) that best suits the topic. Do NOT use any earlier house template. Read the style's STYLE.md / styles/*.md recipe and match its look (palette, type, motion). Say which style you picked and why in `jobs/<name>/NOTES.md`.
- NEVER post anywhere. No Facebook, Instagram or YouTube. Only build and push the video.
- Encode: `reels/enc_hq.sh <name>` (2-pass, about 9.6 MB) after `reels/rq.sh <name> 9301 9302` renders to out/<name>.mp4. Delete frames/<name> when done (disk is limited). Only 2 CPUs: one render at a time.
- Caption file `caption_<name>.md`: description + "Sources: ..." + "Follow for more of how it really works." + 5 hashtags ending #reels (no #fyp).

- CLOSING LINE (required): the LAST spoken phrase and on-screen end card of every reel must be exactly "Follow for more of **how it really works.**" (see specs/leaf.json, specs/boot.json). The total must still be 86 s or less including it.

- USAGE: read reels/USAGE_SAVERS.md and reels/PRIMITIVES.md first. Scaffold with newreel.py, QA with contact.py (one image per review), reuse lib/lib2d.js primitives.

## Style repos (clone each shallow into /home/claude/styles-src/ yourself; all public)
- https://github.com/Vincentwei1021/mg-styles-15
- https://github.com/ItsssssJack/claude-video-2
- https://github.com/cth9191/animate
- https://github.com/HiAPIAI/awesome-opus-5-5-video-styles
- https://github.com/zhuyansen/awesome-claude-video-skills
- https://github.com/lemomo-ai/lemo-opuscar , https://github.com/JohnHeibel/ClaudeAnimationBase , https://github.com/athemeroy/awesome-claude-5-5-videos

## Pipeline
specs/<n>.json -> `python3 -I voice2.py <n>` (needs Kokoro model in ../tts: pip install kokoro-onnx soundfile; get kokoro-v1.0.onnx and voices-v1.0.bin from the kokoro-onnx GitHub release model-files-v1.0) -> vo_<n>.wav + tl_<n>.js; ev_<n>.json -> `python3 -I mix2.py <n>`; t_<n>.js scenes + `python3 mkhtml.py <n>` -> t_<n>.html; render with rq.sh; encode with enc_hq.sh. Look at an existing style module in reels/styles/ (and kit.js/kit.css) for how scenes are written. Engine: headless Chromium 540x960 @DSF2, deterministic window.seek(t).

## Batches
BATCH_A.md and BATCH_B.md list the reels for two worker sessions. The main session keeps the rest (magnet, search, recommend, flush, airfryer, submarine) and finishes the vax, hiccup and skyscr reels.
