"""Build story/shots.json from timeline/words.json: each shot starts 0.06 s before a word of the narration."""
import json, re
W = json.load(open('timeline/words.json'))['words']; DUR = 42.3
n = lambda s: re.sub(r"[^\w']", '', s.lower())
def wt(word, nth=1, after=0):
    k = 0
    for w in W:
        if w['start'] >= after and n(w['word']) == word:
            k += 1
            if k == nth: return w['start']
    raise SystemExit(f'no word {word}')
S = lambda name, gain, at=None, word=None, off=0: ({'at': at} if word is None else {'word': word, **({'offset': off} if off else {})}) | {'name': 'toon3d:' + name, 'gain': gain}
SH = [  # id, start word (nth, after), transition, sfx
 ('s01', None, None, [S('whoosh', -9, 0), S('punch', -9, 0.12), S('punch', -12, 0.62), S('punch', -12, 1.12), S('splash', -16, 0.2)]),
 ('s02', ('the', 1, 1), None, [S('punch', -10, 0.05), S('water', -10, word='boils'), S('impact', -8, word='boils'), S('ding', -15, word='boils', off=0.12)]),
 ('s03', ('meet',), {'type': 'whipBlur', 'dir': 1}, [S('swoosh', -11, 0), S('sparkle', -12, word='peacock'), S('magic', -16, word='peacock')]),
 ('s04', ('small',), None, [S('squeak', -14, 0.1), S('punch', -8, word='hits'), S('whoosh', -14, word='hits')]),
 ('s05', ('thousands',), {'type': 'flash'}, [S('impact', -7, 0), S('whoosh', -12, 0.05)]),
 ('s06', ('its', 1, 8), {'type': 'whipBlur', 'dir': -1}, [S('swoosh', -11, 0), S('whoosh', -8, word='fires'), S('punch', -8, word='fires', off=0.05)]),
 ('s07', ('83',), None, [S('impact', -8, 0), S('tick', -14, 0.2), S('ding', -12, 1.0)]),
 ('s08', ('compare',), {'type': 'whipBlur', 'dir': 1}, [S('swoosh', -11, 0), S('whoosh', -6, word='bullet'), S('zap', -14, word='fired'), S('ding', -15, word='handgun')]),
 ('s09', ('but', 1, 13), {'type': 'iris', 'dur': 0.4}, [S('boing', -13, word='weird')]),
 ('s10', ('the', 1, 15), None, [S('suspense', -15, 0), S('riser', -14, 0.3), S('drop', -9, word='crashes')]),
 ('s11', ('the', 1, 18), None, [S('water', -9, 0), S('pop', -12, word='vapor'), S('stamp', -8, word='vapor', off=0.15)]),
 ('s12', ('like',), None, [S('water', -14, 0), S('ding', -13, word='pressure'), S('fail', -14, word='heat')]),
 ('s13', ('then',), {'type': 'fade', 'dur': 0.25}, [S('suspense', -14, 0), S('slide', -13, word='collapse')]),
 ('s14', ('and', 1, 24.5), {'type': 'flash'}, [S('punch', -7, word='hit'), S('impact', -6, word='second'), S('crash', -12, word='second')]),
 ('s15', ('one',), None, [S('impact', -7, 0), S('whoosh', -12, 0.05)]),
 ('s16', ('but', 1, 28), {'type': 'iris', 'dur': 0.4}, [S('suspense', -13, 0), S('sparkle', -13, word='stranger')]),
 ('s17', ('the', 1, 29), None, [S('water', -15, 0), S('zap', -12, word='flash'), S('sparkle', -10, word='flash'), S('chime', -14, word='light')]),
 ('s18', ('snail',), {'type': 'whipBlur', 'dir': -1}, [S('swoosh', -12, 0), S('punch', -7, word='crack'), S('crash', -8, word='crack')]),
 ('s19', ('and', 1, 34), {'type': 'whipBlur', 'dir': 1}, [S('swoosh', -12, 0), S('punch', -7, word='glass'), S('glass', -6, word='glass')]),
 ('s20', ('so', 1, 36.5), None, [S('suspense', -14, 0), S('slide', -14, 0.2), S('heartbeat', -14, word='do')]),
 ('s21', ('never',), None, [S('knock', -10, 0.15), S('punch', -7, word='tank'), S('boing', -10, word='tank', off=0.2), S('stamp', -9, word='never')]),
 ('s22', ('subscribe',), {'type': 'fade', 'dur': 0.2}, [S('pop', -13, 0.1), S('punch', -13, 0.95), S('whoosh', -14, 1.1)]),
]
out = []
for i, (sid, w, tr, sfx) in enumerate(SH):
    st = 0.0 if w is None else round(wt(w[0], *(w[1:] if len(w) > 1 else ())) - 0.06, 3)
    d = {'id': sid, 'start': st}
    if tr: d['in'] = tr
    d['sfx'] = sfx; out.append(d)
for i, d in enumerate(out):
    d['end'] = out[i + 1]['start'] if i + 1 < len(out) else DUR
    d['line'] = ' '.join(w['word'] for w in W if d['start'] - 0.01 <= w['start'] < d['end'] - 0.01)
    if d['id'] in ('s05', 's07', 's15'): d['captions'] = False      # insert cards carry the words
res = {'duration': DUR, 'shots': [{'id': d['id'], 'start': d['start'], 'end': round(d['end'], 3), 'line': d['line'], **{k: v for k, v in d.items() if k not in ('id', 'start', 'end', 'line')}} for d in out]}
json.dump(res, open('story/shots.json', 'w'), indent=1)
for d in res['shots']: print(f"{d['id']} {d['start']:6.2f}-{d['end']:6.2f} {d['end']-d['start']:4.2f}  {d['line']}")
