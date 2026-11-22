# Clipping toolkit (saved for later)

The 22 open-source tools from a "stream clips -> Shorts" workflow post, saved on Nov 22 2026 for a future clipping
channel. The code is **not** copied into this repo (about 1.8 GB, and some files are past GitHub's size limit).
`repos.txt` pins the exact commit of each one that was downloaded and checked, and the scripts below get them back.

```
bash tools/clipping_toolkit/fetch.sh [target-dir]                                   # Linux/macOS/cloud
powershell -ExecutionPolicy Bypass -File tools\clipping_toolkit\fetch.ps1 [target-dir]   # Windows PC
```
Default target: `~/clipping-toolkit`. Add `--latest` (`-Latest` on Windows) to take each repo's newest version instead of the pinned one.

| # | repo | step | license |
|---|---|---|---|
| 1 | [yt-dlp/yt-dlp](https://github.com/yt-dlp/yt-dlp) | grab: download VODs/streams (on the PC already) | unlicense |
| 2 | [obsproject/obs-studio](https://github.com/obsproject/obs-studio) | grab: record gameplay + facecam | GNU GENERAL PUBLIC LICENSE |
| 3 | [Anil-matcha/AI-Youtube-Shorts-Generator](https://github.com/Anil-matcha/AI-Youtube-Shorts-Generator) | find: pick the highlight, crop 9:16 | MIT License |
| 4 | [openai/whisper](https://github.com/openai/whisper) | find: transcribe | MIT License |
| 5 | [ggml-org/whisper.cpp](https://github.com/ggml-org/whisper.cpp) | find: transcribe offline (CPU/GPU) | MIT License |
| 6 | [jianfch/stable-ts](https://github.com/jianfch/stable-ts) | find: word-level timing for pop-up captions | MIT License |
| 7 | [pyannote/pyannote-audio](https://github.com/pyannote/pyannote-audio) | find: who is talking when | MIT License |
| 8 | [opencv/opencv](https://github.com/opencv/opencv) | track: crop/tracking logic | Apache License |
| 9 | [roboflow/supervision](https://github.com/roboflow/supervision) | track: detection overlays | MIT License |
| 10 | [tryolabs/norfair](https://github.com/tryolabs/norfair) | track: keep the face locked in frame | BSD 3-Clause |
| 11 | [Rikorose/DeepFilterNet](https://github.com/Rikorose/DeepFilterNet) | audio: remove mic noise | Apache License |
| 12 | [facebookresearch/demucs](https://github.com/facebookresearch/demucs) | audio: split voice from game music | MIT License |
| 13 | [tkarabela/pysubs2](https://github.com/tkarabela/pysubs2) | captions: batch timing/style | see-repo |
| 14 | [libass/libass](https://github.com/libass/libass) | captions: render styled captions | ISC License |
| 15 | [OpenCut-app/OpenCut](https://github.com/OpenCut-app/OpenCut) | edit: browser timeline editor | see-repo |
| 16 | [mifi/editly](https://github.com/mifi/editly) | edit: edits from code | MIT License |
| 17 | [KDE/kdenlive](https://github.com/KDE/kdenlive) | edit: final cut, keyframes | GNU GENERAL PUBLIC LICENSE |
| 18 | [mltframework/shotcut](https://github.com/mltframework/shotcut) | edit: track mixing, filters | GNU GENERAL PUBLIC LICENSE |
| 19 | [xinntao/Real-ESRGAN](https://github.com/xinntao/Real-ESRGAN) | polish: upscale blurry frames | BSD 3-Clause |
| 20 | [hzwer/ECCV2022-RIFE](https://github.com/hzwer/ECCV2022-RIFE) | polish: frame interpolation (slow-mo) | MIT License |
| 21 | [PyAV-Org/PyAV](https://github.com/PyAV-Org/PyAV) | export: video processing in Python | see-repo |
| 22 | [Vanilagy/mediabunny](https://github.com/Vanilagy/mediabunny) | export: convert/export in the browser | Mozilla Public License |

## Before using it on other people's streams (read this first)
- **Get permission.** Clip streamers who run a clipping program, or who have agreed in writing (many pay clippers per
  view). Keep the proof. Without permission, a channel full of someone else's footage risks copyright strikes and
  is usually refused for monetization under YouTube's **reused content** policy.
- **Add your own value:** commentary, context, editing. A raw re-upload doesn't count.
- **Game footage:** publishers' video policies differ (some allow monetized gameplay, some restrict it). Check the
  game's policy before building a channel on one game.
- **Licenses:** GPL tools (OBS, Kdenlive, Shotcut) are fine to *use*. If you ship modified copies of them, the GPL applies.

## What our current channels already use instead
yt-dlp (on the PC), faster-whisper (voice listen-back), libass (captions in the automator), PyAV (automator),
Remotion + three.js (editing/rendering), ElevenLabs (clean voices), and `clip_short.mjs` (Shorts from our own long videos).
