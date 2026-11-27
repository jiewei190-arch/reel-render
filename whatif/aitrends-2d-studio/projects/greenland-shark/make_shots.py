"""Build story/shots.json from word anchors in timeline/words.json (shot starts at a spoken word; no hand-typed times).
Usage: python3 projects/greenland-shark/make_shots.py"""
import json, os, re
D = os.path.dirname(os.path.abspath(__file__))
W = json.load(open(f'{D}/timeline/words.json')); W = W.get('words', W) if isinstance(W, dict) else W
n = lambda w: re.sub(r"[^\w']", '', w.lower())
def t(word, after=0.0, off=-0.06):
    for w in W:
        if w['start'] >= after and n(w['word']).startswith(word): return round(w['start'] + off, 3)
    raise SystemExit(f'word {word} after {after} not found')
S = lambda name, gain, at=None, word=None, **k: {**({'at': at} if at is not None else {}), **({'word': word} if word else {}), 'name': f'toon3d:{name}', 'gain': gain, **k}
WH = lambda d=1: {'type': 'whipBlur', 'dir': d}
shots = [
 ('s01', 0.0, None, [S('riser', -14, 0.0), S('water', -16, 0.0), S('ding', -13, 0.6)]),
 ('s02', t('years', 1.0, -0.4), {'type': 'flash'}, [S('impact', -10, 0.0), S('sparkle', -12, word='years', offset=0.05)]),
 ('s03', t('meet', 2.4), WH(1), [S('swoosh', -11, 0.0), S('water', -18, 0.2), S('pop', -12, word='greenland')]),
 ('s04', t('cold', 4.0, -0.1), {'type': 'fade', 'dur': 0.25}, [S('wind', -18, 0.0), S('pop', -12, word='cold'), S('pop', -12, word='north')]),
 ('s05', t('but', 6.8), WH(-1), [S('swoosh', -11, 0.0), S('boing', -12, 0.3), S('stamp', -9, word='age')]),
 ('s06', t('you', 8.8), None, [S('whoosh', -11, 0.0), S('zap', -14, word='eyes'), S('magic', -14, word='eyes', offset=0.5)]),
 ('s07', t('a', 10.3), {'type': 'iris'}, [S('stamp', -9, 0.1), S('beep', -14, word='carbon'), S('beep', -14, word='carbon', offset=0.3), S('chime', -14, word='lenses')]),
 ('s08', t('biggest', 14.3, -0.25), WH(1), [S('swoosh', -11, 0.0), S('slide', -13, 0.3), S('stamp', -9, word='five')]),
 ('s09', t('came', 16.5), {'type': 'flash'}, [S('impact', -8, 0.0), S('tick', -15, 0.3), S('tick', -15, 0.6), S('tick', -15, 0.9), S('success', -11, word='392', offset=0.2)]),
 ('s10', t('give', 19.5), WH(-1), [S('swoosh', -11, 0.0), S('stamp', -9, 0.15), S('squeak', -13, 0.5)]),
 ('s11', t('and', 21.6), {'type': 'fade', 'dur': 0.2}, [S('bell', -14, word='longest'), S('success', -12, word='longest', offset=0.1), S('crowd', -20, word='vertebrate')]),
 ('s12', t('grows', 24.8, -0.2), WH(1), [S('swoosh', -11, 0.0), S('tick', -16, 0.3), S('tick', -16, 0.7), S('tick', -16, 1.1), S('stamp', -9, word='less')]),
 ('s13', t('and', 26.6), {'type': 'fade', 'dur': 0.2}, [S('pop', -13, 0.2), S('impact', -9, word='babies'), S('chime', -14, word='150')]),
 ('s14', t('but', 31.0), WH(-1), [S('swoosh', -11, 0.0), S('clock', -15, 0.2), S('stamp', -10, word='stranger')]),
 ('s15', t('cruises', 32.0, -0.15), {'type': 'flash'}, [S('whoosh', -10, 0.0), S('impact', -9, 0.1), S('footsteps', -16, word='walk')]),
 ('s16', t('so', 34.4), {'type': 'iris'}, [S('swoosh', -12, 0.0), S('creak', -15, 0.3)]),
 ('s17', t('likely', 36.0), {'type': 'flash'}, [S('impact', -8, 0.0), S('paper', -12, 0.2), S('impact', -9, word='existed')]),
 ('s18', t('subscribe', 38.9, -0.1), WH(1), [S('swoosh', -12, 0.0), S('pop', -14, 0.3), S('chime', -16, 0.6)]),
]
dur = round(W[-1]['end'] + 0.5, 3)
out = []
for i, (sid, st, tr, sfx) in enumerate(shots):
    en = shots[i + 1][1] if i + 1 < len(shots) else dur
    line = ' '.join(w['word'] for w in W if st - 0.01 <= w['start'] < en - 0.01)
    d = {'id': sid, 'start': st, 'end': en, 'line': line}
    if tr: d['in'] = tr
    d['sfx'] = sfx; out.append(d)
    print(f'{sid} {st:6.2f}-{en:6.2f} {en - st:4.2f}s  {line}')
json.dump({'duration': dur, 'generated_from': 'make_shots.py (word anchors in timeline/words.json)', 'shots': out}, open(f'{D}/story/shots.json', 'w'), indent=1)
c = json.load(open(f'{D}/config.json')); c['duration'] = dur; json.dump(c, open(f'{D}/config.json', 'w'), indent=1)
print('duration', dur)

