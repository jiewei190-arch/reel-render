# PC setup (Reel creator: the GPU worker for render-pc)

What's installed on the owner's Windows 11 PC, so it can be rebuilt. Everything here is free and open source, with no paid licences.

## Hardware
- NVIDIA GeForce RTX 4060 (8 GB), driver 610.88, 16 threads.

## Toolchain (user installs, no admin)
| tool | version | used for |
|---|---|---|
| Node.js | 24.19.0 (npm 11.17.0) | Remotion bundling, rendering, tools/*.mjs |
| Remotion / @remotion/three / three | 4.0.540 / 4.0.540 / 0.186.1 | from `package-lock.json` via `npm ci` |
| ffmpeg / ffprobe | 9.0.2 full build (gyan.dev) | tmix motion blur, mux, loudness (ebur128), sheets |
| Python (system) | 3.14.7 + numpy, faster-whisper 1.2.1 (CPU int8) | critic.py, shot_sheet.py, flicker.py, analyze_pacing.py, Whisper word checks |
| uv | 0.12.15 | fetches Python 3.11 and makes the Chatterbox venv |
| git | 2.55 | worktrees: `rr-v1` (finance/v1rebuild), `rr-f2`, `rr-hooks`, ... |

## Chatterbox voice (D2 narrator) on the GPU
`C:\Users\jiewe\.venvs\chatterbox` is a Python 3.11.16 venv (made by uv) with **torch 2.6.0+cu124** (CUDA), **chatterbox-tts 0.1.7** (Resemble AI, MIT) and **faster-whisper 1.2.1**. Weights come from Hugging Face ResembleAI/chatterbox (MIT) and are cached in `~/.cache/huggingface`.

Rebuild:
```bash
uv python install 3.11
uv venv -p 3.11 ~/.venvs/chatterbox
VIRTUAL_ENV=~/.venvs/chatterbox uv pip install --index-strategy unsafe-best-match \
  --extra-index-url https://download.pytorch.org/whl/cu124 chatterbox-tts faster-whisper "setuptools<81"
```
`finance/voice/chatterbox_d2.py` hard-codes `device="cpu"`. On the PC we run a copy with only the TTS device switched to `cuda` (same model, same seeds), at about 25 it/s and roughly 110 s per 30 s Short with 3-seed QA:
```bash
sed 's/ChatterboxTTS.from_pretrained(device="cpu")/ChatterboxTTS.from_pretrained(device="cuda")/' \
  finance/voice/chatterbox_d2.py > /tmp/chatterbox_d2_pc.py
cd finance/shorts/<slug> && PYTHONIOENCODING=utf-8 ~/.venvs/chatterbox/Scripts/python.exe /tmp/chatterbox_d2_pc.py \
  vo/narration.md voice.wav script.txt --gap 0.3 --comma 0.15 --lead 0.15 --exag 0.55 --cfg 0.3
```
After the voice: `finance/tools/verify_words.py`, `skills/blocky-shorts/template/vo/transcribe.py` (gives vo/timings.json), `plan/plan_src.py` (gives src/plan.gen.ts), `finance/tools/sync_v1.sh <slug>`, `finance/tools/make_script_md.py`. Run the Python steps with the venv's python; the system python also has faster-whisper.

## Render-pc specifics
- `node_modules` in each worktree is an NTFS **junction** to one install (`rr-f2/finance/render-pc/node_modules`); `npm ci` once.
- 3D rendering uses `--gl=angle` (`render.sh` and `remotion still`). The GPU lock (`scripts/gpu_lock.py`, machine-wide in %TEMP%) serialises renders.
- `render.sh` needs an empty `build/` folder (the Remotion bundle). Keep QA/cue bundles in `out/tmp/` (fixed in story_qa/story_cues @ 5bac02c9).
- Uploads: the browser upload tool caps files at about 10 MB, so the upload copy is a two-pass libx264 re-encode (same frames, audio copied). The Git copy stays the sha256-verified master.
- Toon3d audio library (music beds plus SFX) is extracted from `origin/iawaken/toon3d-fx:whatif/aitrends-2d-studio/kits/toon3d/audio` into the scratchpad. It is procedural (numpy), licence-clean per finance/hooks/AUDIO.md.

## Not installed (on purpose)
No admin installers, no paid tools, no browser extensions beyond what the owner set up.
