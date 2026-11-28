"""Splice re-taken lines into input/voiceover_raw.wav (+ .lines.json). Usage: python splice_vo.py N fixN.wav [N2 fix2.wav ...]"""
import json, sys, os, numpy as np, soundfile as sf
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'input')
x, sr = sf.read(f'{D}/voiceover_raw.wav'); L = json.load(open(f'{D}/voiceover_raw.lines.json'))
for n, f in zip(sys.argv[1::2], sys.argv[2::2]):
    i = int(n) - 1; l = L['lines'][i]; y, sr2 = sf.read(f'{D}/{f}'); assert sr2 == sr
    F = json.load(open(f'{D}/' + f.replace('.wav', '.lines.json')))['lines'][0]; y = y[int(F['start'] * sr):int(F['end'] * sr)]
    a, b = int(l['start'] * sr), int(l['end'] * sr); d = len(y) / sr - (l['end'] - l['start'])
    x = np.concatenate([x[:a], y * (np.abs(x[a:b]).max() / max(np.abs(y).max(), 1e-6)), x[b:]])
    l.update({k: F[k] for k in ('text', 'parts')}); l['end'] = round(l['start'] + len(y) / sr, 3); l['spliced_from'] = f
    for m in L['lines'][i + 1:]: m['start'] = round(m['start'] + d, 3); m['end'] = round(m['end'] + d, 3)
L['duration'] = round(len(x) / sr, 3); L['qa_fail_lines'] = [r['n'] for r in L['lines'] for p in r['parts'] if p['qa'] == 'QA FAIL']
sf.write(f'{D}/voiceover_raw.wav', x, sr); json.dump(L, open(f'{D}/voiceover_raw.lines.json', 'w'), indent=1); print(L['duration'], 'QA fail:', L['qa_fail_lines'])
