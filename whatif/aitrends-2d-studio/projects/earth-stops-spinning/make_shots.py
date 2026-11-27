"""Build story/shots.json from voiceover.lines.json + timeline/words.json. Shots start at a line start or at a word (- lead)."""
import json, re, os
D = os.path.dirname(os.path.abspath(__file__))
L = json.load(open(f'{D}/input/voiceover.lines.json'))['lines']
W = json.load(open(f'{D}/timeline/words.json')); W = W.get('words', W) if isinstance(W, dict) else W
HOLD = 0.65
DUR = round(L[-1]['end'] + HOLD, 3)
norm = lambda w: re.sub(r"[^\w']", '', w.lower())
def wt(word, after):
    for w in W:
        if w['start'] >= after - 0.05 and norm(w['word']) == word: return w['start']
    raise SystemExit(f'word {word} not found after {after}')
S = lambda n, **k: dict(k)
# (id, line, word or None, transition, sfx)
WH = lambda d=1: {'type': 'whipBlur', 'dir': d}
SH = [
 ('s01', 1, None, None, [{'at': 0.0, 'name': 'toon3d:whoosh', 'gain': -8}, {'at': 0.1, 'name': 'toon3d:ding', 'gain': -14}, {'at': 0.3, 'name': 'toon3d:boing', 'gain': -14}, {'word': 'sideways', 'name': 'toon3d:swoosh', 'gain': -10}]),
 ('s01b', 1, 'everything', {'type': 'cut'}, [{'at': 0.0, 'name': 'toon3d:boing', 'gain': -13}, {'at': 0.3, 'name': 'toon3d:pop', 'gain': -13}]),
 ('s02', 2, None, {'type': 'flash'}, [{'at': 0.0, 'name': 'toon3d:scratch', 'gain': -10}, {'word': 'thought', 'name': 'toon3d:stamp', 'gain': -8}]),
 ('s03', 2, 'scientists', WH(1), [{'at': 0.0, 'name': 'toon3d:swoosh', 'gain': -12}, {'word': 'worked', 'name': 'toon3d:ding', 'gain': -14}]),
 ('s04', 3, None, {'type': 'iris'}, [{'at': 0.0, 'name': 'toon3d:whoosh', 'gain': -11}, {'word': 'east', 'name': 'toon3d:swoosh', 'gain': -10}]),
 ('s05', 3, 'over', WH(1), [{'at': 0.0, 'name': 'toon3d:impact', 'gain': -9}, {'at': 0.1, 'name': 'toon3d:tick', 'gain': -14}, {'at': 1.3, 'name': 'toon3d:ding', 'gain': -12}]),
 ('s06', 4, None, WH(-1), [{'at': 0.0, 'name': 'toon3d:swoosh', 'gain': -12}, {'word': 'you', 'name': 'toon3d:pop', 'gain': -12}, {'word': 'air', 'name': 'toon3d:pop', 'gain': -12}, {'word': 'oceans', 'name': 'toon3d:pop', 'gain': -12}]),
 ('s07', 4, 'cow', {'type': 'cut'}, [{'at': 0.35, 'name': 'toon3d:pop', 'gain': -11}, {'at': 0.55, 'name': 'toon3d:boing', 'gain': -14}]),
 ('s08', 5, None, WH(1), [{'at': 0.0, 'name': 'toon3d:whoosh', 'gain': -10}, {'word': 'brakes', 'name': 'toon3d:scratch', 'gain': -6}, {'word': 'brakes', 'offset': 0.3, 'name': 'toon3d:impact', 'gain': -6}]),
 ('s09', 5, 'only', {'type': 'cut'}, [{'at': 0.2, 'name': 'toon3d:boing', 'gain': -14}, {'word': 'ground', 'name': 'toon3d:thud', 'gain': -9}]),
 ('s10', 6, None, {'type': 'cut'}, [{'at': 0.0, 'name': 'toon3d:whoosh', 'gain': -7}, {'at': 0.05, 'name': 'toon3d:crash', 'gain': -16}, {'at': 0.2, 'name': 'toon3d:ding', 'gain': -14}, {'word': 'bolted', 'name': 'toon3d:metal', 'gain': -13}]),
 ('s11', 6, 'sliding', WH(1), [{'at': 0.0, 'name': 'toon3d:swoosh', 'gain': -9}, {'word': 'full', 'name': 'toon3d:stamp', 'gain': -8}]),
 ('s12', 7, None, {'type': 'flash'}, [{'at': 0.0, 'name': 'toon3d:rumble', 'gain': -9}, {'at': 0.15, 'name': 'toon3d:stamp', 'gain': -9}, {'at': 0.5, 'name': 'toon3d:ding', 'gain': -14}]),
 ('s13', 7, 'the', WH(1), [{'at': 0.0, 'name': 'toon3d:water', 'gain': -8}, {'word': 'slosh', 'name': 'toon3d:splash', 'gain': -6}, {'word': 'land', 'name': 'toon3d:pop', 'gain': -13}]),
 ('s14', 8, None, {'type': 'iris'}, [{'at': 0.0, 'name': 'toon3d:wind', 'gain': -14}, {'at': 0.1, 'name': 'toon3d:pop', 'gain': -12}, {'at': 0.4, 'name': 'toon3d:sparkle', 'gain': -14}]),
 ('s15', 8, 'barely', {'type': 'cut'}, [{'at': 0.0, 'name': 'toon3d:pop', 'gain': -12}, {'at': 0.6, 'name': 'toon3d:sparkle', 'gain': -14}]),
 ('s16', 9, None, WH(-1), [{'at': 0.0, 'name': 'toon3d:swoosh', 'gain': -11}, {'at': 0.1, 'name': 'toon3d:success', 'gain': -12}]),
 ('s17', 9, 'nasa', {'type': 'cut'}, [{'at': 0.0, 'name': 'toon3d:impact', 'gain': -8}, {'word': 'miracle', 'name': 'toon3d:magic', 'gain': -9}]),
 ('s18', 10, None, {'type': 'fade'}, [{'at': 0.0, 'name': 'toon3d:clock', 'gain': -11}]),
 ('s19', 10, 'by', WH(1), [{'at': 0.0, 'name': 'toon3d:impact', 'gain': -8}, {'at': 0.1, 'name': 'toon3d:tick', 'gain': -13}, {'at': 1.2, 'name': 'toon3d:sparkle', 'gain': -12}]),
 ('s19b', 10, 'per', {'type': 'cut'}, [{'at': 0.0, 'name': 'toon3d:pop', 'gain': -12}, {'at': 0.25, 'name': 'toon3d:success', 'gain': -12}]),
 ('s20', 11, None, {'type': 'iris', 'mode': 'open'}, [{'at': 0.0, 'name': 'toon3d:pop', 'gain': -12}]),
]
starts = []
for sid, ln, word, tr, sfx in SH:
    l = L[ln - 1]; t = 0.0 if sid == 's01' else (l['start'] - 0.12 if word is None else wt(word, l['start']) - 0.12)
    starts.append(round(t, 3))
shots = []
for i, (sid, ln, word, tr, sfx) in enumerate(SH):
    end = starts[i + 1] if i + 1 < len(SH) else DUR
    s = {'id': sid, 'start': starts[i], 'end': round(end, 3), 'line': L[ln - 1]['text']}
    if tr: s['in'] = tr
    s['sfx'] = sfx; shots.append(s)
json.dump({'duration': DUR, 'shots': shots}, open(f'{D}/story/shots.json', 'w'), indent=1)
c = json.load(open(f'{D}/config.json')); c['duration'] = DUR; json.dump(c, open(f'{D}/config.json', 'w'), indent=1)
for s in shots: print(s['id'], s['start'], s['end'], round(s['end'] - s['start'], 2))
print('duration', DUR)
