STATE: tool-ready
Owner picked D2 (Chatterbox deadpan: built-in voice, exaggeration 0.3, cfg 0.3).
- Tool: whatif/voice/chatterbox_d2.py: drop-in for fenrir.py (same script.md format, CLI, outputs). Adds "..." held beats, numbers/years spelled for TTS, Whisper QA with up to 3 seeds per part, and <out>.lines.json (per-line times + chosen seed).
- Setup: whatif/voice/setup_chatterbox.sh (Python 3.11 venv, CPU torch, chatterbox-tts, faster-whisper, setuptools<81, weights). Docs: whatif/voice/README.md + whatif/VOICE.md.
- Proof: voice_test/tardigrade_d2.wav (36.6 s, 24 kHz, peak 0.89 like fenrir; mix.py does loudness), voice_test/tardigrade_d2.transcript.txt (tools/transcribe.py output: 92/93 script words aligned), voice_test/tardigrade_d2.lines.json, voice_test/tardigrade/{script.md,plain.txt,qa.log}. All 8 lines passed QA on seed 7; render 184 s on 4 vCPU.
- Re-run with the same script/seeds gives bit-identical audio (checked).
Previous: voice comparison samples + all_samples.mp4 + RESULTS.md (STATE: ready).
