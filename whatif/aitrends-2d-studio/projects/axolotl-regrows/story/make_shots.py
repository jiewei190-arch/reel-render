"""Build story/shots.json from timeline/words.json: each shot starts 0.06 s before a word of the narration."""
import json, re
W = json.load(open('timeline/words.json'))['words']; DUR = 41.55
n = lambda s: re.sub(r"[^\w']", '', s.lower())
def wt(word, nth=1, after=0):
    k = 0
    for w in W:
        if w['start'] >= after and n(w['word']) == word:
            k += 1
            if k == nth: return w['start']
    raise SystemExit(f'no word {word}')
S = lambda name, gain, at=None, word=None, off=0: ({'at': at} if word is None else {'word': word, **({'offset': off} if off else {})}) | {'name': 'toon3d:' + name, 'gain': gain}
SH = [  # id, start word (word, nth, after), transition, sfx
 ('s01', None, None, [S('sparkle', -10, 0.0), S('magic', -14, 0.1), S('pop', -12, word='legs')]),
 ('s02', ('its', 1, 2.3), {'type': 'flash'}, [S('heartbeat', -8, 0.1), S('zap', -15, 0.0)]),
 ('s03', ('even', 1, 3), None, [S('magic', -12, 0.1), S('ding', -12, word='brain'), S('sparkle', -12, word='brain')]),
 ('s04', ('meet',), {'type': 'whipBlur', 'dir': 1}, [S('swoosh', -11, 0), S('sparkle', -12, word='axolotl')]),
 ('s05', ('the', 1, 6.3), None, [S('squeak', -12, word='never'), S('pop', -10, word='never', off=0.05)]),
 ('s06', ('it', 1, 8)), 
 ('s07', ('frilly',), None, [S('water', -14, 0), S('sparkle', -13, word='gills')]),
 ('s08', ('lose',), {'type': 'whipBlur', 'dir': -1}, [S('swoosh', -12, 0), S('pop', -7, word='leg'), S('boing', -12, word='leg', off=0.15)]),
 ('s09', ('a', 1, 12)), 
 ('s10', ('but', 1, 14)),
 ('s11', ('its', 1, 15.8)),
 ('s12', ('even', 1, 17.8)),
 ('s13', ('but', 1, 20.5)),
 ('s14', ('it', 1, 21.9)),
 ('s15', ('scientists',)),
 ('s16', ('humans',)),
 ('s17', ('but', 1, 27)),
 ('s18', ('the', 1, 28.4)),
 ('s19', ("it's", 1, 30.5)),
 ('s20', ('with', 1, 33)),
 ('s20b', ('adults',)),
 ('s21', ('it', 1, 36.4)),
 ('s22', ('but', 1, 38.6)),
 ('s23', ('subscribe',)),
]
DEF = {
 's06': ({'type': 'fade', 'dur': 0.2}, [S('whoosh', -13, 0), S('stamp', -8, word='larval', off=0.05)]),
 's09': (None, [S('paper', -10, 0.1), S('tick', -14, 0.6), S('tick', -14, 1.0), S('magic', -10, word='months'), S('success', -14, word='months', off=0.3)]),
 's10': ({'type': 'iris', 'dur': 0.4}, [S('click', -12, 0), S('sparkle', -13, word='start')]),
 's11': ({'type': 'whipBlur', 'dir': 1}, [S('swoosh', -12, 0), S('magic', -12, 0.3), S('zap', -12, word='spinal')]),
 's12': (None, [S('heartbeat', -8, 0.2), S('success', -12, word='scars'), S('ding', -13, word='scars')]),
 's13': ({'type': 'iris', 'dur': 0.4}, [S('suspense', -13, 0), S('ding', -12, word='wild')]),
 's14': ({'type': 'flash'}, [S('impact', -7, 0), S('whoosh', -12, 0.05)]),
 's15': ({'type': 'whipBlur', 'dir': -1}, [S('swoosh', -12, 0), S('slide', -14, 0.3)]),
 's16': (None, [S('sparkle', -12, word='heal'), S('boing', -14, word='heal', off=0.2)]),
 's17': ({'type': 'iris', 'dur': 0.45}, [S('wind', -12, 0), S('suspense', -14, 0.1)]),
 's18': ({'type': 'flash'}, [S('impact', -7, 0), S('alarm', -18, 0.1)]),
 's19': ({'type': 'whipBlur', 'dir': 1}, [S('swoosh', -12, 0), S('wind', -15, 0.2)]),
 's20': ({'type': 'flash'}, [S('impact', -7, 0), S('tick', -14, 0.4)]),
 's20b': (None, [S('water', -15, 0), S('heartbeat', -14, 0.2)]),
 's21': ({'type': 'fade', 'dur': 0.3}, [S('water', -14, 0), S('sparkle', -14, word='brain')]),
 's22': (None, [S('slide', -12, 0.1), S('fail', -14, word='home')]),
 's23': ({'type': 'fade', 'dur': 0.2}, [S('pop', -13, 0.1), S('pop', -10, 1.2)]),
}
SH = [x if len(x) == 4 else (x[0], x[1], *DEF[x[0]]) for x in SH]
out = []
for i, (sid, w, tr, sfx) in enumerate(SH):
    st = 0.0 if w is None else round(wt(w[0], *(w[1:] if len(w) > 1 else ())) - 0.06, 3)
    d = {'id': sid, 'start': st}
    if tr: d['in'] = tr
    d['sfx'] = sfx; out.append(d)
for i, d in enumerate(out):
    d['end'] = out[i + 1]['start'] if i + 1 < len(out) else DUR
    d['line'] = ' '.join(w['word'] for w in W if d['start'] - 0.01 <= w['start'] < d['end'] - 0.01)
    if d['id'] in ('s14', 's18', 's20'): d['captions'] = False      # insert cards carry the words
res = {'duration': DUR, 'shots': [{'id': d['id'], 'start': d['start'], 'end': round(d['end'], 3), 'line': d['line'], **{k: v for k, v in d.items() if k not in ('id', 'start', 'end', 'line')}} for d in out]}
json.dump(res, open('story/shots.json', 'w'), indent=1)
for d in res['shots']: print(f"{d['id']} {d['start']:6.2f}-{d['end']:6.2f} {d['end']-d['start']:4.2f}  {d['line']}")
