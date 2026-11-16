# Justin clips build tools (batch 4)

`shortbuild.py` builds a Toon 3D Short from `justinclips/shorts/<slug>/` in one command, and makes **swapping the narrator voice one re-render command**:

- The narration is `justinclips/shorts/<slug>/lines.json` (one entry per spoken line; `...` = a held beat).
- Shot timing is never hard-coded. Each shot in `project/story/shots.tpl.json` starts at a voice anchor
  (`{"line": 3}` = line 3's start, `{"line": 5, "word": "his"}` = that word, `{"line": 3, "end": true}` = line end, plus `offset`).
  The tool turns that into `project/story/shots.json` from the new voice's line and word times, and the top caption stays up
  until line 1 has ended (never under 3.2 s). Inside each shot, graphics sync to words with `at(info, word)`.
- `scenes_common/_jc.js` = shared overlay helpers (top caption, stamps, badges, cards), copied into each project's `scenes/`.

## Setup (once, Linux cloud or PC)
1. A checkout of `origin/iawaken/toon3d-fx` (the kit: `whatif/aitrends-2d-studio`), `npm install` there (PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 in the cloud), `pip install numpy scipy soundfile`.
2. For the current D2 voice: `whatif/voice/chatterbox_d2.py` + `setup_chatterbox.sh` from `origin/voice-test` copied to `<kit checkout>/whatif/voice/`, then `bash whatif/voice/setup_chatterbox.sh` (creates `~/.venvs/chatterbox`; also provides faster-whisper for timing).
3. Linux: `export CHROMIUM_PATH=/opt/pw-browsers/chromium`.

## Commands
    KIT=<toon3d-fx checkout>/whatif/aitrends-2d-studio
    # full build with the current D2 voice (voice -> timing -> render -> mix/master -> video.mp4 + video.sha256)
    python3 justinclips/tools/shortbuild.py justinclips/shorts/<slug> --kit $KIT
    # SWAP THE VOICE: same command with another engine; every cut re-times itself
    python3 justinclips/tools/shortbuild.py justinclips/shorts/<slug> --kit $KIT --voice 'cmd:piper --model en_US-ryan-high.onnx --output_file {out} <<< {text}'
    python3 justinclips/tools/shortbuild.py justinclips/shorts/<slug> --kit $KIT --voice wavdir:/path/to/recordings   # line_01.wav, line_02.wav, ...
    # partial: --stages voice | timing | render | mix (comma list), --workers N, --seeds 7,11,23,... (D2 Whisper-QA retries)

`cmd:` runs the template once per spoken part (`{text}` shell-quoted, `{out}` a .wav). Parts split at `...`, are trimmed and joined
with the D2 pacing (lead 0.05 s, gap 0.2 s, beat 0.4 s), or the Short's own `"pacing": {"gap", "lead", "beat"}` in `lines.json`. Master: −14 LUFS integrated, true peak ≤ −1 dBTP (two-pass loudnorm to TP −2,
because AAC adds ~0.5 dB). Nothing is ever uploaded or posted.
