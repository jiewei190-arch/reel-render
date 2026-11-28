"""Splice a re-taken line into input/voiceover_raw.wav (+ .lines.json). Usage: python splice_line.py <line no> <take.wav>
The take's own .lines.json gives its line span; text/tts of the take replace the old line's."""
import json, sys, numpy as np, soundfile as sf, os
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'input')
n, take = int(sys.argv[1]), sys.argv[2]
x, sr = sf.read(f'{D}/voiceover_raw.wav'); L = json.load(open(f'{D}/voiceover_raw.lines.json'))
y, sr2 = sf.read(take); assert sr == sr2; T = json.load(open(take.replace('.wav', '.lines.json')))['lines'][0]
seg = y[int(T['start'] * sr):int(T['end'] * sr)]; old = L['lines'][n - 1]
a, b = int(old['start'] * sr), int(old['end'] * sr); z = np.concatenate([x[:a], seg, x[b:]]); d = len(seg) / sr - (old['end'] - old['start'])
for i, l in enumerate(L['lines']):
    if i == n - 1: l.update({k: v for k, v in T.items() if k not in ('start', 'end')}); l['end'] = round(l['start'] + len(seg) / sr, 3)
    elif i > n - 1: l['start'] = round(l['start'] + d, 3); l['end'] = round(l['end'] + d, 3)
L['duration'] = round(len(z) / sr, 3); L.setdefault('spliced', []).append({'line': n, 'from': os.path.basename(take)})
sf.write(f'{D}/voiceover_raw.wav', z, sr); json.dump(L, open(f'{D}/voiceover_raw.lines.json', 'w'), indent=1); print('ok', L['duration'])
