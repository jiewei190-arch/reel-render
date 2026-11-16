#!/bin/bash
# Voice #8 (Dia-1.6B-0626, Kokoro am_puck prompt) for a Justin clips Short, split into per-line wavs for shortbuild.py.
#   bash justinclips/tools/dia/dia_voice.sh justinclips/shorts/<slug> <seed>
# Writes <short>/voice_dia/line_NN.wav + split_report.json (Whisper text, median pitch). Then re-render with:
#   python3 justinclips/tools/shortbuild.py justinclips/shorts/<slug> --kit <kit> --venv ~/.venvs/dia --voice wavdir:justinclips/shorts/<slug>/voice_dia
# Needs ~/.venvs/dia: Python 3.12, CPU torch, transformers>=4.56, librosa, scipy, soundfile, faster-whisper (see voice_lineup/NOTES.md).
# Dia runs ~18x real time on 4 vCPU (about 6-7 min per 20 s take).
set -e
H=$(cd "$(dirname "$0")" && pwd); SHORT=$1; SEED=${2:-7}; TMP=$(mktemp -d)
~/.venvs/dia/bin/python "$H/tts_any.py" "$SHORT/lines.json" "$TMP/take.wav" --engine dia --seed "$SEED" \
  --prompt-audio "$H/dia_prompt_kokoro_am_puck.wav" \
  --prompt-text "Okay, so you're not gonna believe this one, but it's totally true. I looked it up like three times, because I honestly thought it was a joke." \
  --dia-tail " (laughs)"
rm -rf "$SHORT/voice_dia"
~/.venvs/dia/bin/python "$H/split_lines.py" "$SHORT/lines.json" "$TMP/take.wav" "$SHORT/voice_dia"
cp "$TMP/take.json" "$SHORT/voice_dia/dia_take.json"
