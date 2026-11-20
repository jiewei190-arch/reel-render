"""Tighten the raw Chatterbox D2 take for the Short: trim each line, cap internal pauses, atempo (pitch kept), short gaps.
Usage (Chatterbox venv): python tighten_vo.py [speed]   reads input/voiceover_raw.wav + .lines.json -> input/voiceover.wav + .lines.json"""
import json, sys, subprocess, tempfile, os, numpy as np, soundfile as sf
SPEED = float(sys.argv[1]) if len(sys.argv) > 1 else 1.17
GAP, MAXQ, THR = 0.14, 0.30, 0.012
BEATS = {6: 0.2, 10: 0.25}   # extra held beat before line n (the "But" turn, the payoff line)
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'input')
x, sr = sf.read(f'{D}/voiceover_raw.wav'); L = json.load(open(f'{D}/voiceover_raw.lines.json'))
env = lambda a, w=int(0.02 * sr): np.sqrt(np.convolve(a ** 2, np.ones(w) / w, 'same'))
out, times, tmp = [np.zeros(int(0.05 * sr))], [], tempfile.mkdtemp()
for i, l in enumerate(L['lines']):
    a = x[int((l['start'] - 0.08) * sr):int((l['end'] + 0.15) * sr)]
    on = np.where(env(a) > THR)[0]; a = a[max(0, on[0] - int(0.03 * sr)):on[-1] + int(0.06 * sr)]
    q = env(a) < THR; keep, j, n = [], 0, len(a)
    while j < n:
        k = j
        while k < n and q[k] == q[j]: k += 1
        keep.append(a[j:j + min(k - j, int(MAXQ * sr))] if q[j] else a[j:k]); j = k
    sf.write(f'{tmp}/a.wav', np.concatenate(keep), sr)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f'{tmp}/a.wav', '-af', f'atempo={SPEED}', f'{tmp}/b.wav'], check=True)
    b, _ = sf.read(f'{tmp}/b.wav'); st = sum(len(o) for o in out) / sr
    out.append(b); times.append({'start': round(st, 3), 'end': round(st + len(b) / sr, 3)})
    if i < len(L['lines']) - 1: out.append(np.zeros(int((GAP + BEATS.get(i + 2, 0)) * sr)))
out.append(np.zeros(int(0.1 * sr))); y = np.concatenate(out); y = y / np.max(np.abs(y)) * 0.89
sf.write(f'{D}/voiceover.wav', y, sr)
meta = dict(L); meta['post'] = {'from': 'voiceover_raw.wav', 'atempo': SPEED, 'gap': GAP, 'max_internal_silence': MAXQ}
meta['lines'] = [{**a, **b} for a, b in zip(L['lines'], times)]; meta['duration'] = round(len(y) / sr, 3)
json.dump(meta, open(f'{D}/voiceover.lines.json', 'w'), indent=1); print(round(len(y) / sr, 3))
