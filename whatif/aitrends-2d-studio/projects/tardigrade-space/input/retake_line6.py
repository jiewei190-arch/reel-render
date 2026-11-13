"""Re-take of "They're called tardigrades." (line 6, first sentence) with the D2 settings of whatif/voice/chatterbox_d2.py
(built-in voice, exaggeration 0.3, cfg 0.3, same trim). Writes one wav per (text, seed) to the out dir.
Usage: ~/.venvs/chatterbox/bin/python input/retake_line6.py OUTDIR"""
import sys, os, numpy as np, soundfile as sf, torch
from chatterbox.tts import ChatterboxTTS
tts = ChatterboxTTS.from_pretrained(device="cpu"); SR = tts.sr
def trim(a, thr=0.02, pad_in=0.04, pad_out=0.12):
    idx = np.where(np.abs(a) > thr * max(np.abs(a).max(), 1e-6))[0]
    return a if not len(idx) else a[max(idx[0] - int(SR * pad_in), 0): idx[-1] + int(SR * pad_out)]
for i, text in enumerate(["They're called tardigrades.", "They are called tardigrades."]):
    for seed in (11, 23, 5, 42):
        torch.manual_seed(seed); w = trim(tts.generate(text, exaggeration=0.3, cfg_weight=0.3).squeeze(0).numpy().astype(np.float32))
        sf.write(os.path.join(sys.argv[1], f"t{i}_s{seed}.wav"), w, SR); print(i, seed, round(len(w) / SR, 2), flush=True)
