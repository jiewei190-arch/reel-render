"""Build story/shots.json from word anchors in timeline/words.json (shot starts at a spoken word; no hand-typed times).
Usage: python3 projects/naked-mole-rat/make_shots.py"""
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
 ('s01', 0.0, None, [S('riser', -14, 0.0), S('sparkle', -12, 0.05), S('pop', -12, 0.3), S('laugh', -22, 0.6)]),
 ('s02', t('and', 1.0), None, [S('swoosh', -12, 0.0), S('whoosh', -14, 0.3), S('ding', -10, word='cancer'), S('sparkle', -13, word='cancer', offset=0.1)]),
 ('s03', t('meet', 3.0), WH(1), [S('swoosh', -11, 0.0), S('footsteps', -18, 0.2), S('pop', -11, word='pink'), S('pop', -11, word='wrinkly'), S('stamp', -10, word='nearly')]),
 ('s04', t('all', 6.0), {'type': 'flash'}, [S('impact', -9, 0.0), S('boing', -12, 0.15), S('click', -10, 0.4), S('click', -12, 0.6)]),
 ('s05', t('house', 8.0, -0.25), WH(-1), [S('swoosh', -11, 0.0), S('squeak', -12, 0.3), S('ding', -10, word='four'), S('squeak', -14, word='tops')]),
 ('s06', t('one', 11.0, -0.4), {'type': 'flash'}, [S('whoosh', -10, 0.0), S('impact', -8, word='over'), S('success', -12, word='30', offset=0.1)]),
 ('s07', t('but', 13.0), WH(1), [S('swoosh', -11, 0.0), S('whoosh', -12, 0.1), S('stamp', -9, word='crazy')]),
 ('s08', t('risk', 14.0), {'type': 'fade', 'dur': 0.2}, [S('paper', -10, 0.0), S('slide', -13, 0.3), S('stamp', -9, word='age')]),
 ('s09', t('and', 16.9), {'type': 'iris'}, [S('swoosh', -12, 0.0), S('paper', -13, 0.4), S('tick', -16, 0.8), S('tick', -16, 1.3)]),
 ('s10', t('not', 19.0), {'type': 'flash'}, [S('impact', -8, 0.0), S('gasp', -13, 0.15), S('fail', -14, word='cancer')]),
 ('s11', t('but', 21.0), WH(1), [S('swoosh', -11, 0.0), S('boing', -13, 0.3), S('whoosh', -12, word='they'), S('stamp', -10, word='ants')]),
 ('s12', t('with', 23.0), WH(-1), [S('swoosh', -12, 0.0), S('bell', -14, word='queen'), S('sparkle', -12, word='queen', offset=0.1)]),
 ('s13', t('only', 24.8), {'type': 'fade', 'dur': 0.2}, [S('pop', -12, word='babies'), S('chime', -15, word='babies', offset=0.2)]),
 ('s14', t('rest', 26.2, -0.12), WH(1), [S('scratch', -12, 0.0), S('rumble', -18, 0.0), S('whoosh', -12, word='guard'), S('ding', -12, word='guard', offset=0.1), S('whoosh', -12, word='babysit'), S('pop', -14, word='babysit', offset=0.2)]),
 ('s15', t('and', 28.6), WH(-1), [S('swoosh', -12, 0.0), S('alarm', -16, 0.6), S('beep', -13, 1.0)]),
 ('s16', t('survives', 30.5, -0.15), {'type': 'flash'}, [S('impact', -8, 0.0), S('tick', -14, 0.2), S('tick', -14, 0.5), S('tick', -14, 0.8), S('ding', -10, word='minutes'), S('success', -13, word='oxygen')]),
 ('s17', t('body', 33.0, -0.3), WH(1), [S('swoosh', -12, 0.0), S('click', -8, word='switches'), S('zap', -12, word='switches', offset=0.08)]),
 ('s18', t('sugar', 35.0, -0.22), {'type': 'fade', 'dur': 0.2}, [S('sparkle', -11, 0.1), S('magic', -15, 0.3)]),
 ('s19', t('scientists', 37.5), {'type': 'iris'}, [S('swoosh', -12, 0.0), S('paper', -14, 0.3), S('stamp', -9, word='aging')]),
 ('s20', t('in', 39.9, -0.08), {'type': 'flash'}, [S('impact', -8, 0.0), S('sparkle', -12, 0.1)]),
 ('s21', t('subscribe', 40.8, -0.1), WH(-1), [S('swoosh', -12, 0.0), S('pop', -14, 0.3), S('chime', -16, 0.6)]),
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
