# vo.wav + soft pad/pluck music bed (ducked under the voice) -> mix.wav ; then mux with video_noaudio.mp4 -> final.mp4
import json, pathlib, sys, subprocess, numpy as np, soundfile as sf
HERE = pathlib.Path(__file__).resolve().parent; D = HERE / sys.argv[1]; SR = 24000
v, _ = sf.read(D / 'vo.wav'); v = v.astype(np.float32); N = len(v); t = np.arange(N) / SR
mtf = lambda m: 440 * 2 ** ((m - 69) / 12); bpm = 76; bar = 4 * 60 / bpm
chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]
mus = np.zeros(N, np.float32); rng = np.random.default_rng(3)
def pluck(f, d=1.6):
    n = int(d * SR); p = max(2, int(SR / f)); buf = rng.uniform(-1, 1, p).astype(np.float32); o = np.zeros(n, np.float32)
    for i in range(n): o[i] = buf[i % p]; buf[i % p] = .5 * (buf[i % p] + buf[(i + 1) % p]) * .997
    return o
cache = {}
for b in range(int(N / SR / bar) + 1):
    ch = chords[b % 4]; t0 = b * bar
    a, z = int(t0 * SR), min(N, int((t0 + bar + .5) * SR))
    if a >= N: break
    x = np.arange(z - a) / SR; env = np.minimum(1, x / .8) * np.minimum(1, (bar + .5 - x) / .8).clip(0)
    for m in ch: mus[a:z] += .05 * env * (np.sin(2 * np.pi * mtf(m) * x) + .3 * np.sin(2 * np.pi * mtf(m) * 2 * x))
    for k, m in enumerate([ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[1] + 12]):
        st = int((t0 + k * bar / 4) * SR)
        if m not in cache: cache[m] = pluck(mtf(m))
        w = cache[m][:max(0, N - st)]; mus[st:st + len(w)] += .09 * w
env = np.convolve(np.abs(v), np.ones(int(.3 * SR)) / int(.3 * SR), 'same'); duck = 1 - .55 * np.clip(env / (env.max() * .25), 0, 1)
fade = np.minimum(1, t / 2) * np.minimum(1, (t[-1] - t) / 2)
mix = v + mus * duck * fade * .9; mix *= .95 / np.abs(mix).max()
sf.write(D / 'mix.wav', mix, SR)
o = D / 'out'
if (o / 'video_noaudio.mp4').exists():
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', str(o / 'video_noaudio.mp4'), '-i', str(D / 'mix.wav'), '-c:v', 'copy', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', str(o / 'final.mp4')], check=True)
    print('final.mp4 written')
