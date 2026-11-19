"""s8_mix.py <voice.wav> <music.wav> <sfx_dir> <out_premix.wav>

Premix for S8 four-money-minds: the final VO (untouched, only resampled), the ORIGINAL synthesized beat
(tools/s8_music.py) and the SFX cues from src/fin/s8/fourminds.tsx (S8_CUES, read through tools/s8_cues.mjs).
Levels before the final loudness pass (tools/mux_voice.sh-style, -14 LUFS integrated, TP <= -1.5 dBFS):
  - VO normalised to -14 LUFS (its own integrated loudness);
  - the beat at -24 LUFS under the VO, ducked a further 5 dB while the VO speaks (0-3.75 s, 21.4-27.35 s),
    and lifted to -20 LUFS in the no-VO middle (music + SFX carry 3.6-21.5 s);
  - SFX at their cue gains (dB) minus 6 dB.
sfx_dir holds <name>.wav (the toon3d library: procedurally generated, no third-party audio).
"""
import json
import os
import re
import subprocess
import sys
import wave

import numpy as np

voice, music, sdir, out = sys.argv[1:5]
here = os.path.dirname(os.path.abspath(__file__))
SR = 48000
info = json.loads(subprocess.check_output(["node", os.path.join(here, "s8_cues.mjs")], cwd=os.path.dirname(here)))
DUR = float(info["duration"])
N = int(round(DUR * SR))


def load(path):
    """any wav -> float32 stereo 48 kHz via ffmpeg"""
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"])
    return np.frombuffer(raw, dtype="<f4").reshape(-1, 2).astype(np.float64)


def lufs(x):
    p = "/tmp/_s8_meas.wav"
    write(p, x)
    o = subprocess.run(["ffmpeg", "-hide_banner", "-i", p, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", o)[-1])


def write(path, x):
    y = np.clip(x, -1, 1)
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((y * 32767).astype("<i2").tobytes())


def fit(x):
    y = np.zeros((N, 2))
    n = min(N, len(x))
    y[:n] = x[:n]
    return y


db = lambda d: 10 ** (d / 20)
vo = fit(load(voice))
vo *= db(-14.0 - lufs(vo))
mus = fit(load(music))
mus *= db(-24.0 - lufs(mus))
# music envelope: -24 under the VO with a further 5 dB duck while speaking, +4 dB in the no-VO middle
t = np.arange(N) / SR
VO_SEGS = [(0.0, 3.75), (21.4, 27.35)]
speak = np.zeros(N)
for a, b in VO_SEGS:
    speak = np.maximum(speak, np.clip(np.minimum((t - a + 0.12) / 0.12, (b + 0.25 - t) / 0.25), 0, 1))
gain_db = -5.0 * speak + 4.0 * (1 - speak)
mus *= db(gain_db)[:, None]
sfx = np.zeros((N, 2))
for c in info["cues"]:
    f = os.path.join(sdir, c["sfx"] + ".wav")
    if not os.path.exists(f):
        sys.exit(f"missing sfx {f}")
    s = load(f) * db(c.get("db", 0) - 6)
    i0 = int(round(c["t"] * SR))
    n = min(len(s), N - i0)
    if n > 0:
        sfx[i0 : i0 + n] += s[:n]
mix = vo + mus + sfx
write(out, mix)
print(f"premix: {DUR:.2f} s, {len(info['cues'])} sfx cues, VO {lufs(vo):.1f} LUFS, music bed (pre-duck) -24 LUFS -> {out} ({lufs(mix):.1f} LUFS)")
