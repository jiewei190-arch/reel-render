"""Transcribe each sample (faster-whisper base.en) to verify the full text is spoken, no skips/garbles."""
import sys
from faster_whisper import WhisperModel
m = WhisperModel("base.en", device="cpu", compute_type="int8")
for f in sys.argv[1:]:
    segs, _ = m.transcribe(f, beam_size=5)
    print(f.split("/")[-1], "|", " ".join(s.text.strip() for s in segs))
