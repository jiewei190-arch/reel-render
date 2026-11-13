"""Rough prosody measure: F0 spread in semitones (flat, robotic delivery = small spread)."""
import sys, numpy as np, librosa
for f in sys.argv[1:]:
    y, sr = librosa.load(f, sr=16000)
    f0, vo, _ = librosa.pyin(y, fmin=60, fmax=300, sr=sr)
    f0 = f0[vo & ~np.isnan(f0)]
    st = 12 * np.log2(f0 / np.median(f0))
    print(f"{f.split('/')[-1]:40s} medF0 {np.median(f0):5.0f} Hz  spread(p5-p95) {np.percentile(st,95)-np.percentile(st,5):4.1f} st  sd {st.std():.2f} st")
