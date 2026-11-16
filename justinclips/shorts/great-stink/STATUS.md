STATE: ready

# The Great Stink: status

- `video.mp4`: 1080×1920, 24 fps, 538 frames, 22.42 s, H.264 + AAC, 13 MB. sha256 in `video.sha256` (a0ecc88bbad9…). Rendered fully in the cloud (SwiftShader, 4 workers).
- Audio: kit `audio/mix.py` (music `toon3d:upbeat` −19 dB, ~40 SFX cues), redone two-pass + linear by `rebuild.sh` (mix.py landed at −13.55) → **−14.0 LUFS integrated (loudnorm: −14.02), true peak −2.9 dBTP**. Muxed with `-c:v copy` (all 538 frames kept).
- Voice: **dia #8** (Dia-1.6B-0626, Apache-2.0; `voice_lineup/tts_any.py --engine dia`, prompt `prompts/dia_prompt_kokoro_am_puck.wav` + its prompt text, `--dia-tail " (laughs)"`, cfg 3.0, temp 1.8, top-p 0.9, top-k 45), **seed 4**, whole script in one pass, via `tools/revoice/dia8.py`. Median pitch 216 Hz (reference 08_dia_puckprompt-seed7.mp3: ~205 Hz). The (laughs) tail is cut 0.12 s after "today" and is not in the audio. `dia8.py --split-dir` cuts the take into one file per line (line 3 as `03a`/`03b` around the "...") at the real pauses (`lines.json` pacing `sil_db` −30, `cut` "nearest"); `rebuild.sh --engine files` then joins them with the usual pacing (0.2 s between lines, 0.4 s beat). Line 5 keeps "with chemicals". Take report: `project/input/dia8_report.json`.
  - Seeds: full takes 7 (164 Hz) and 11 (149 Hz) were rejected; seeds 3-14 were then screened on their first 4 s and 4 was rendered in full and kept.
  - Whisper small.en on the final mix: "London stank so bad, Parliament had to act. Summer 1858, a heat wave hit the Thames. And the Thames was full of London's sewage. Parliament sits right on the river. So they soaked the curtains with chemicals. They even talked about moving Parliament out of London. Instead, they passed a new sewer law in about seven weeks. Engineer Joseph Bazalgette built 82 miles of giant sewers. London still uses them today." Word for word ("heat wave" = "heatwave"). Script alignment 69/70.
  - Timing fix: Whisper stretched "was" back over the inserted 0.4 s beat (start 6.30 s; its audio starts at 6.89 s), which would have cut to s06 and lit the caption early. New `tools/revoice/snap_words.py` (now a step of `rebuild.sh`) moves such word starts to the real part start; s05 is 1.03 s and s06 lands on "was".
  - QA: caption sync checked on 10 word-time frames + frame 1 + last frames; no black/blank frames (the only dark span, 14.58-14.71 s, is the designed iris into "Instead,", caption on screen; the original has the same). s09 "(it didn't help much)" runs 0.95 s.
- Fact fix: the sewer bill took about seven weeks (tabled 15 June, law 2 August 1858, per Wikipedia), not the "18 days" some sites repeat. See `sources.md`.
- Checks: frame 1 = MPs with clothespins in the green-hazed chamber + top caption (see `contact_sheet.png`); the last frame (hi-vis worker, "STILL IN USE") hard-cuts back to frame 1. Checklist and tone guards are at the top of `script.md`.
- Project source (`project/`): `lines.json`, `story/shots.plan.json`, `scenes/`, `config.json`; generated: `input/` (voice), `timeline/`, `story/shots.json`.

## Swap the voice (one command)
From the repo root, with a toon3d-fx kit checkout (`npm install` done) and the Dia venv (Python 3.12, CPU torch, transformers>=4.56, librosa, scipy, faster-whisper; see `voice_lineup/NOTES.md`):

    export KIT=/path/to/toon3d-fx/whatif/aitrends-2d-studio CHROMIUM_PATH=/opt/pw-browsers/chromium VPY=~/.venvs/dia/bin/python   # (PC: RENDER_ARGS="--gl gpu", no CHROMIUM_PATH)
    $VPY justinclips/tools/revoice/dia8.py --project justinclips/shorts/great-stink/project --seed 4 --split-dir /tmp/stink_dia8 \
      && bash justinclips/tools/revoice/rebuild.sh great-stink --engine files --dir /tmp/stink_dia8

`dia8.py` renders dia #8 (about 6.5 min of CPU on 4 vCPU) and writes one file per line; `rebuild.sh` re-voices from them, re-aligns words (plus `snap_words.py`), re-times every shot, renders, mixes to −14 LUFS, muxes, checks, and rewrites `video.mp4`, `video.sha256`, `contact_sheet.png` and the generated files. `--keep DIR` / `--reuse DIR` on `dia8.py` keep a take or re-split one without re-running Dia. Any other voice: `--dir` holds one file per line of `project/lines.json`, named `01.wav … 09.wav` (a line with "..." may be split `03a.wav, 03b.wav`). Current D2 voice: drop `--engine files --dir …` (needs the Chatterbox venv as `VPY`). Preview only: `--sheet-only`. Details: `justinclips/tools/revoice/README.md`.

Not posted or uploaded anywhere.
