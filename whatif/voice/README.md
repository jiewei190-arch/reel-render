# Narrator voices

| Tool | Voice | Used for | Speed (4 vCPU) |
|---|---|---|---|
| `fenrir.py` | Kokoro am_fenrir, 0.95 (Apache-2.0) | What If long-form (VOICE.md) | ~3 s per 10 s audio |
| `chatterbox_d2.py` | Chatterbox default built-in voice, exaggeration 0.3, cfg 0.3 (MIT) — the owner's pick "D2" from `voice_test/` (Nov 13) | Justin clips Shorts | ~35-40 s per 10 s audio per take; ~50 s per 10 s incl. Whisper QA (Tardigrade 36.6 s VO: 184 s) |

## chatterbox_d2.py (Justin clips Shorts narrator)
Drop-in for `fenrir.py`: same `script.md` format (numbered lines are spoken, `## ` headers add a section break), same CLI, same outputs.

```bash
bash whatif/voice/setup_chatterbox.sh                 # once: ~/.venvs/chatterbox (Python 3.11, CPU torch, chatterbox-tts, faster-whisper, weights)
~/.venvs/chatterbox/bin/python whatif/voice/chatterbox_d2.py script.md projects/<slug>/input/voiceover.wav projects/<slug>/input/script.txt \
    --gap 0.3 --comma 0.15 --lead 0.15                 # Shorts pacing, same flags as fenrir.py
python tools/transcribe.py --project projects/<slug> --script projects/<slug>/input/script.txt   # unchanged downstream
```

- `...` inside a line is a held beat (`--beat`, default 0.7 s) before the punchline.
- Write years/numbers as digits in the script (captions keep digits): the TTS text says them ("2007" → "two thousand seven", "1807" → "eighteen oh-seven", "1,000" → "one thousand", "0.5" → "zero point five"). Write the words yourself for anything else ("half a millimeter", "eight ninety-seven").
- ALL-CAPS emphasis words are lowercased for the TTS so they aren't spelled out.
- QA: each part is rendered with seeds 7, 11, 23 (`--seeds`). The first take whose Whisper small.en transcript matches word for word is kept. If none match, the closest take is kept and the run prints `QA FAIL on lines [...]`. Listen to those lines, or reword them and re-run. `--no-qa` takes seed 7 only.
- `voiceover.lines.json` lists, per line, the start/end time, the TTS text, the chosen seed and what Whisper heard. Same script + same seeds = same audio.
- `--comma` is accepted but ignored (Chatterbox phrases commas itself).
- Output: 24 kHz mono, peak 0.89 (as fenrir.py). It carries Resemble's inaudible Perth watermark.
- No voice cloning: never pass a reference clip of a real person.
