"""Build story/shots.json from voiceover.lines.json + timeline/words.json. Shots start at a line start or at a word (- lead)."""
import json, re, os
D = os.path.dirname(os.path.abspath(__file__))
L = json.load(open(f'{D}/input/voiceover.lines.json'))['lines']
W = json.load(open(f'{D}/timeline/words.json')); W = W.get('words', W) if isinstance(W, dict) else W
HOLD = 0.6
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
 ('s01', 1, None, None, [{'at': 0.0, 'name': 'toon3d:magic', 'gain': -9}, {'at': 0.12, 'name': 'toon3d:pop', 'gain': -8}, {'at': 0.3, 'name': 'toon3d:ding', 'gain': -14}]),
 ('s01b', 1, 'tides', {'type': 'cut'}, [{'at': 0.0, 'name': 'toon3d:water', 'gain': -10}, {'word': 'shrink', 'name': 'toon3d:slide', 'gain': -10}]),
 ('s02', 2, None, {'type': 'flash'}, [{'at': 0.0, 'name': 'toon3d:scratch', 'gain': -11}, {'word': 'thought', 'name': 'toon3d:stamp', 'gain': -8}]),
 ('s03', 2, "here's", WH(1), [{'at': 0.0, 'name': 'toon3d:swoosh', 'gain': -12}, {'word': 'scientists', 'name': 'toon3d:ding', 'gain': -14}]),
 ('s04', 3, None, {'type': 'fade'}, [{'at': 0.0, 'name': 'toon3d:wind', 'gain': -14}, {'word': 'darker', 'name': 'toon3d:stamp', 'gain': -9}]),
 ('s05', 3, 'like', {'type': 'cut'}, [{'at': 0.05, 'name': 'toon3d:pop', 'gain': -12}, {'at': 0.4, 'name': 'toon3d:tick', 'gain': -14}, {'word': 'every', 'name': 'toon3d:pop', 'gain': -12}]),
 ('s06', 4, None, {'type': 'iris'}, [{'at': 0.0, 'name': 'toon3d:whoosh', 'gain': -11}, {'word': 'big', 'name': 'toon3d:stamp', 'gain': -8}]),
 ('s07', 4, 'moon', WH(1), [{'at': 0.0, 'name': 'toon3d:swoosh', 'gain': -11}, {'at': 0.25, 'name': 'toon3d:riser', 'gain': -14}, {'word': 'most', 'name': 'toon3d:pop', 'gain': -12}]),
 ('s08', 5, None, WH(-1), [{'at': 0.0, 'name': 'toon3d:swoosh', 'gain': -11}, {'at': 0.2, 'name': 'toon3d:chime', 'gain': -14}, {'at': 0.5, 'name': 'toon3d:boing', 'gain': -15}]),
 ('s09', 5, 'but', {'type': 'cut'}, [{'at': 0.0, 'name': 'toon3d:impact', 'gain': -8}, {'at': 0.3, 'name': 'toon3d:whoosh', 'gain': -12}]),
 ('s11', 6, None, {'type': 'fade'}, [{'at': 0.0, 'name': 'toon3d:water', 'gain': -11}, {'at': 0.2, 'name': 'toon3d:paper', 'gain': -14}, {'at': 0.6, 'name': 'toon3d:pop', 'gain': -13}]),
 ('s10', 6, 'roughly', {'type': 'cut'}, [{'at': 0.0, 'name': 'toon3d:impact', 'gain': -8}, {'word': 'third', 'name': 'toon3d:ding', 'gain': -11}]),
 ('s12', 7, None, {'type': 'flash'}, [{'at': 0.0, 'name': 'toon3d:whoosh', 'gain': -11}, {'at': 0.4, 'name': 'toon3d:boing', 'gain': -13}, {'word': 'confused', 'name': 'toon3d:stamp', 'gain': -9}]),
 ('s13', 7, 'some', {'type': 'iris'}, [{'at': 0.0, 'name': 'toon3d:magic', 'gain': -13}, {'at': 0.2, 'name': 'toon3d:sparkle', 'gain': -14}, {'word': 'moonlight', 'name': 'toon3d:chime', 'gain': -13}]),
 ('s14', 8, None, WH(1), [{'at': 0.0, 'name': 'toon3d:swoosh', 'gain': -12}, {'at': 0.2, 'name': 'toon3d:boing', 'gain': -14}]),
 ('s14b', 8, 'milky', {'type': 'cut'}, [{'at': 0.0, 'name': 'toon3d:sparkle', 'gain': -9}, {'word': 'instead', 'name': 'toon3d:success', 'gain': -13}]),
 ('s15', 9, None, {'type': 'fade'}, [{'at': 0.0, 'name': 'toon3d:clock', 'gain': -11}, {'word': 'slow', 'name': 'toon3d:stamp', 'gain': -9}]),
 ('s16', 9, 'over', {'type': 'cut'}, [{'at': 0.0, 'name': 'toon3d:clock', 'gain': -12}, {'at': 0.1, 'name': 'toon3d:whoosh', 'gain': -12}]),
 ('s16b', 9, "earth's", {'type': 'cut'}, [{'at': 0.0, 'name': 'toon3d:rumble', 'gain': -12}, {'word': 'tilt', 'name': 'toon3d:boing', 'gain': -12}, {'word': 'wobble', 'name': 'toon3d:ding', 'gain': -14}]),
 ('s17', 10, None, WH(1), [{'at': 0.0, 'name': 'toon3d:whoosh', 'gain': -11}, {'at': 0.1, 'name': 'toon3d:pop', 'gain': -12}, {'word': 'big', 'name': 'toon3d:pop', 'gain': -13}]),
 ('s18', 10, 'and', {'type': 'cut'}, [{'at': 0.0, 'name': 'toon3d:impact', 'gain': -8}, {'at': 0.1, 'name': 'toon3d:tick', 'gain': -14}, {'word': 'degrees', 'name': 'toon3d:ding', 'gain': -11}]),
 ('s18b', 10, 'degrees', {'type': 'cut'}, [{'at': 0.1, 'name': 'toon3d:pop', 'gain': -12}, {'at': 0.3, 'name': 'toon3d:success', 'gain': -13}]),
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
