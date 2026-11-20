"""Replace one line of input/voiceover_raw.wav with a retake rendered by chatterbox_d2.py (a 1-line script).
Usage (Chatterbox venv): python splice_line.py N retake.wav   (retake.lines.json next to it). Shifts later line times."""
import json, sys, os, numpy as np, soundfile as sf
N, R = int(sys.argv[1]), sys.argv[2]
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'input')
x, sr = sf.read(f'{D}/voiceover_raw.wav'); L = json.load(open(f'{D}/voiceover_raw.lines.json'))
y, sr2 = sf.read(R); RL = json.load(open(R[:-4] + '.lines.json')); assert sr == sr2
rl = RL['lines'][0]; seg = y[int(rl['start'] * sr):int(rl['end'] * sr)]
seg = seg / max(np.abs(seg).max(), 1e-6) * np.abs(x).max()
li = L['lines'][N - 1]; a, b = int(li['start'] * sr), int(li['end'] * sr)
z = np.concatenate([x[:a], seg, x[b:]]); dt = len(seg) / sr - (b - a) / sr
li['end'] = round(li['start'] + len(seg) / sr, 3); li['parts'] = rl['parts']; li['retake'] = os.path.basename(R)
for l in L['lines'][N:]: l['start'] = round(l['start'] + dt, 3); l['end'] = round(l['end'] + dt, 3)
L['duration'] = round(len(z) / sr, 3); L['qa_fail_lines'] = [r['n'] for r in L['lines'] for p in r['parts'] if p['qa'] == 'QA FAIL']
sf.write(f'{D}/voiceover_raw.wav', z, sr); json.dump(L, open(f'{D}/voiceover_raw.lines.json', 'w'), indent=1); print('spliced line', N, 'dt', round(dt, 3), 'dur', L['duration'])
