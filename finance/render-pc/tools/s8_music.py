"""s8_music.py <out.wav> [seconds] [variant]

variant "b" (S8b thousand-four-ways): 98 BPM, a 4-chord loop Dm / Bb / F / C, seed 2016, same drum kit and mix.
Without a variant the output is the original S8 beat, unchanged:

An ORIGINAL beat for S8 four-money-minds, synthesized from scratch with numpy (no samples, no downloaded music):
104 BPM, A minor / F major (a 2-chord pad, one chord per bar), kick on every beat, a closed hat on the offbeats, a soft
clap on beats 2 and 4, an eighth-note sub bass on the chord root, and a gentle sidechain pump on the pad from the kick.
Starts on a kick at 0.00 s (no silent intro) and fades over the last 0.3 s. 48 kHz stereo 16-bit.
"""
import sys
import wave

import numpy as np

SR = 48000
VARIANT = sys.argv[3] if len(sys.argv) > 3 else ""
BPM = 98.0 if VARIANT == "b" else 104.0
BEAT = 60.0 / BPM
out = sys.argv[1]
DUR = float(sys.argv[2]) if len(sys.argv) > 2 else 28.0
N = int(DUR * SR)
t = np.arange(N) / SR
rng = np.random.default_rng(2016 if VARIANT == "b" else 1234)

mtof = lambda m: 440.0 * 2 ** ((m - 69) / 12.0)
CHORDS = [[57, 60, 64], [53, 57, 60]]  # A minor (A3 C4 E4), F major (F3 A3 C4)
ROOTS = [45, 41]  # A2, F2
if VARIANT == "b":
    CHORDS = [[50, 53, 57], [46, 50, 53], [53, 57, 60], [48, 52, 55]]  # Dm, Bb, F, C
    ROOTS = [38, 34, 41, 36]
NCH = len(CHORDS)


def lp_fast(x, fc):
    """one-pole low-pass in 64-sample blocks (closed form inside a block, state carried between blocks)"""
    a = np.exp(-2 * np.pi * fc / SR)
    B = 64
    k = np.arange(B)
    ak = a ** k
    y = np.empty_like(x)
    acc = 0.0
    for s in range(0, len(x), B):
        seg = x[s : s + B]
        n = len(seg)
        c = np.cumsum(seg[:n] * (1 - a) / ak[:n])
        yy = ak[:n] * (c + acc * a)
        y[s : s + n] = yy
        acc = yy[-1]
    return y


def saw(f, ph=0.0):
    return 2.0 * ((t * f + ph) % 1.0) - 1.0


# ---------------- the pad: detuned saws per chord, low-passed, slow swell per bar
bar = 4 * BEAT
pad = np.zeros(N)
for b in range(int(DUR / bar) + 1):
    a0 = b * bar
    i0, i1 = int(a0 * SR), min(N, int((a0 + bar) * SR) + int(0.25 * SR))
    if i0 >= N:
        break
    tt = t[i0:i1] - a0
    env = np.minimum(1, tt / 0.25) * np.exp(-np.maximum(0, tt - bar) / 0.12)
    s = np.zeros(i1 - i0)
    for m in CHORDS[b % NCH]:
        for det in (-0.08, 0.0, 0.08):
            f = mtof(m + det)
            s += 2.0 * ((tt * f + rng.random()) % 1.0) - 1.0
    pad[i0:i1] += s * env
pad = lp_fast(pad, 1400.0)
pad = lp_fast(pad, 2200.0)
pad /= np.max(np.abs(pad)) + 1e-9

# ---------------- drums
kick = np.zeros(N)
hat = np.zeros(N)
clap = np.zeros(N)
bass = np.zeros(N)
pump = np.ones(N)
nb = int(DUR / BEAT) + 1
for k in range(nb):
    a0 = k * BEAT
    i0 = int(a0 * SR)
    if i0 >= N:
        break
    L = min(N - i0, int(0.45 * SR))
    tt = np.arange(L) / SR
    f = 45 + 85 * np.exp(-tt * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    kick[i0 : i0 + L] += np.sin(ph) * np.exp(-tt * 7.5) + 0.25 * np.exp(-tt * 300) * rng.standard_normal(L)
    # pad pump: dips under each kick
    pump[i0 : i0 + L] = np.minimum(pump[i0 : i0 + L], 0.55 + 0.45 * (1 - np.exp(-tt * 9)))
    # offbeat hat
    j0 = int((a0 + BEAT / 2) * SR)
    if j0 < N:
        Lh = min(N - j0, int(0.09 * SR))
        n = rng.standard_normal(Lh)
        n = np.diff(np.concatenate([[0], n]))  # crude high-pass
        hat[j0 : j0 + Lh] += n * np.exp(-np.arange(Lh) / SR * 55)
    # clap on 2 and 4
    if k % 2 == 1:
        Lc = min(N - i0, int(0.18 * SR))
        n = rng.standard_normal(Lc)
        tc = np.arange(Lc) / SR
        envc = np.exp(-tc * 22) * (1 + 0.6 * (np.sin(2 * np.pi * 90 * tc) > 0))
        clap[i0 : i0 + Lc] += n * envc
    # bass: two eighth notes per beat on the bar's chord root
    root = ROOTS[int(a0 // bar) % NCH]
    for e in range(2):
        b0 = int((a0 + e * BEAT / 2) * SR)
        if b0 >= N:
            continue
        Lb = min(N - b0, int(BEAT / 2 * SR * 0.9))
        tb = np.arange(Lb) / SR
        fb = mtof(root)
        sb = 0.6 * np.sin(2 * np.pi * fb * tb) + 0.4 * (2 * ((tb * fb) % 1) - 1)
        bass[b0 : b0 + Lb] += sb * np.minimum(1, tb / 0.005) * np.exp(-tb * 5)
clap = lp_fast(clap, 3500.0) - lp_fast(clap, 700.0)
bass = lp_fast(bass, 380.0)

norm = lambda x: x / (np.max(np.abs(x)) + 1e-9)
mix_mono = 0.9 * norm(kick) + 0.16 * norm(hat) + 0.22 * norm(clap) + 0.45 * norm(bass)
padL = pad * pump
padR = np.roll(pad, int(0.011 * SR)) * pump  # a little width
L = mix_mono + 0.32 * padL
R = mix_mono + 0.32 * padR
# hats slightly right, clap slightly left
L += 0.03 * norm(clap)
R += 0.03 * norm(hat)
fade = np.minimum(1, (DUR - t) / 0.3)
L *= fade
R *= fade
st = np.stack([L, R], axis=1)
st /= np.max(np.abs(st)) / 0.89
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((st * 32767).astype("<i2").tobytes())
print(f"music: {DUR:.2f} s, {BPM:.0f} BPM, {'Dm/Bb/F/C' if VARIANT == 'b' else 'Am/F'} pad, kick/hat/clap/bass -> {out}")
