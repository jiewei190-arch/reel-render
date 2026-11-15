#!/usr/bin/env bash
# One-time setup for justin_tts.py (Justin clips only). Identical to whatif/voice/setup_chatterbox.sh on origin/voice-test (D2 setup).
# Creates a Python 3.11 venv (chatterbox-tts does not install on 3.13), CPU torch, chatterbox-tts, faster-whisper (QA),
# then pre-downloads the Chatterbox weights (Hugging Face ResembleAI/chatterbox, MIT) and Whisper small.en.
# Usage: bash justinclips/voice_justin/setup_chatterbox.sh [venv_dir]   (default ~/.venvs/chatterbox)
set -euo pipefail
VENV=${1:-$HOME/.venvs/chatterbox}
PY=$(command -v python3.11 || true)
[ -z "$PY" ] && { echo "python3.11 not found (apt-get install python3.11 python3.11-venv, or uv python install 3.11)"; exit 1; }
if command -v uv >/dev/null; then
  uv venv -q -p "$PY" "$VENV"
  VIRTUAL_ENV="$VENV" uv pip install -q --index-strategy unsafe-best-match \
    --extra-index-url https://download.pytorch.org/whl/cpu chatterbox-tts faster-whisper "setuptools<81"
else
  "$PY" -m venv "$VENV"
  "$VENV/bin/pip" install -q --extra-index-url https://download.pytorch.org/whl/cpu chatterbox-tts faster-whisper "setuptools<81"
fi
# setuptools<81: the Perth watermarker that Chatterbox loads still imports pkg_resources.
"$VENV/bin/python" - <<'PY'
from chatterbox.tts import ChatterboxTTS
from faster_whisper import WhisperModel
ChatterboxTTS.from_pretrained(device="cpu")
WhisperModel("small.en", device="cpu", compute_type="int8")
print("chatterbox + whisper weights ready")
PY
echo "OK. Run: $VENV/bin/python justinclips/voice_justin/justin_tts.py script.md voiceover.wav plain.txt --mp3"
