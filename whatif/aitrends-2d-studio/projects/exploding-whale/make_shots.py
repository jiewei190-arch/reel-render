"""Build story/shots.json from timeline/words.json: each shot starts at a spoken word (script-aligned Whisper timings).
Usage: python3 make_shots.py   (run after tools/transcribe.py). Prints every shot length (target ~1.0-2.7 s)."""
import json, os, re
D = os.path.dirname(os.path.abspath(__file__))
W = json.load(open(f'{D}/timeline/words.json')); W = W.get('words', W) if isinstance(W, dict) else W
norm = lambda w: re.sub(r"[^\w']", '', w.lower())
TAIL, LEAD = 0.55, 0.06

def t_of(word, nth=1, after=0.0, end=False):
    hits = [w for w in W if w['start'] >= after - 0.01 and norm(w['word']) == norm(word)]
    if len(hits) < nth: raise SystemExit(f'word {word!r} #{nth} not found after {after}')
    return hits[nth - 1]['end' if end else 'start']

S = lambda at, name, gain=-12, **k: {'at': at, 'name': f'toon3d:{name}', 'gain': gain, **k}
Wd = lambda word, name, gain=-12, **k: {'word': word, 'name': f'toon3d:{name}', 'gain': gain, **k}
# (id, start word, nth, extra offset, scene note, transition, sfx)
SHOTS = [
    ('s01', None, 1, 0, 'FRAME 1: fuse fizzing toward the whale, gull in a bib, 2-line top caption', None, [S(0, 'tick', -12), S(0.5, 'tick', -12), S(1.0, 'tick', -12), S(0.0, 'fire', -22)]),
    ('s02', 'removed', 1, 0, 'push in on the dead whale, stink lines, gull licks its beak', {'type': 'cut'}, [S(0, 'tick', -12), S(0.5, 'tick', -12), Wd('dead', 'boing', -16)]),
    ('s03', 'with', 1, 0, 'spark reaches the crate: teaser BOOM + flash', {'type': 'cut'}, [S(0, 'tick', -10), Wd('dynamite', 'boom', -6, offset=0.4), Wd('dynamite', 'impact', -10, offset=0.4)]),
    ('s04', 'a', 1, 0, 'wide beach, ruler: 45 FT, SPERM WHALE chip', {'type': 'whipBlur', 'dir': 1}, [S(0, 'swoosh', -12), Wd('45', 'slide', -12), Wd('sperm', 'pop', -14)]),
    ('s05', 'on', 1, 0, 'FLORENCE, OR sign, beachgoer pinching his nose', {'type': 'cut'}, [Wd('florence', 'pop', -12), S(0.3, 'squeak', -18)]),
    ('s06', '8', 1, 0, 'INSERT 1: 8 TONS', {'type': 'cut'}, [S(0, 'impact', -10), S(0.05, 'whoosh', -12), S(0.3, 'thud', -12)]),
    ('s07', 'rotting', 1, 0, 'stink close-up, gull sweats', {'type': 'whipBlur', 'dir': -1}, [S(0, 'swoosh', -13), S(0.15, 'squeak', -16)]),
    ('s08', 'and', 1, 0, 'highway worker, road cones pop up, ROAD WORK sign, double take', {'type': 'cut'}, [Wd('highway', 'pop', -14), Wd('highway', 'pop', -14, offset=0.12), Wd('highway', 'pop', -14, offset=0.24), Wd('job', 'ding', -12)]),
    ('s09', 'plan', 1, -0.12, 'THE PLAN chalkboard: whale -> bits', {'type': 'whipBlur', 'dir': 1}, [S(0, 'swoosh', -12), Wd('plan', 'paper', -12), Wd('bits', 'pop', -10)]),
    ('s10', 'and', 1, 0, 'gulls in bibs with forks: CLEANUP CREW', {'type': 'cut'}, [Wd('seagulls', 'pop', -12), Wd('clean', 'sparkle', -14)]),
    ('s11', 'so', 1, 0, 'INSERT 2: HALF A TON of dynamite, 20 crates', {'type': 'cut'}, [S(0, 'impact', -10), S(0.05, 'whoosh', -12), Wd('dynamite', 'thud', -12)]),
    ('s12', 'a', 2, 0, 'the crowd gathers, grinning', {'type': 'whipBlur', 'dir': -1}, [S(0, 'swoosh', -12), S(0.1, 'crowd', -16)]),
    ('s13', '3', 1, 0, 'countdown 3/2/1, hard punch-ins: plunger, gull, plunger', {'type': 'cut'}, [Wd('3', 'tick', -8), Wd('2', 'tick', -8), Wd('1', 'tick', -8), Wd('1', 'suspense', -14)]),
    ('s14', '1', 1, 0.62, 'BOOM: cloud, flash, shake, then a beat of silence', {'type': 'flash'}, [S(0, 'boom', -2), S(0.02, 'impact', -6), S(0.1, 'rumble', -10)]),
    ('s15', 'but', 1, 0, 'crowd cheering, then looking up', {'type': 'cut'}, [Wd('part', 'riser', -14)]),
    ('s16', 'the', 2, 0, 'low angle: blobs tumbling out of the sky, INCOMING', {'type': 'cut'}, [S(0, 'whoosh', -10), Wd('down', 'slide', -12)]),
    ('s17', 'chunks', 1, 0, 'crowd scatters, blobs plop around them, BLUBBER', {'type': 'cut'}, [S(0.35, 'splash', -12), S(0.7, 'splash', -14), S(1.0, 'splash', -12), S(0.2, 'gasp', -14)]),
    ('s18', 'one', 1, 0, 'brand-new car, big blob, pancake: CRUSHED', {'type': 'whipBlur', 'dir': 1}, [S(0, 'swoosh', -12), Wd('brand', 'sparkle', -14), Wd('crushed', 'crash', -8), Wd('crushed', 'boing', -12, offset=0.2)]),
    ('s19', 'nobody', 1, 0, 'crowd peeks out, shrugs: NOBODY SERIOUSLY HURT', {'type': 'cut'}, [Wd('hurt', 'stamp', -12)]),
    ('s20', 'the', 1, 0, 'gulls flee, bibs off: SCARED OFF', {'type': 'whipBlur', 'dir': -1}, [S(0, 'swoosh', -12), Wd('seagulls', 'boing', -12), Wd('scared', 'whoosh', -8), Wd('scared', 'stamp', -12, offset=0.1)]),
    ('s21', 'and', 1, 0, 'smoke clears: the whale is mostly still there; worker shrugs', {'type': 'cut'}, [S(0, 'wind', -16), Wd('still', 'stamp', -10), Wd('still', 'fail', -16, offset=0.2)]),
    ('s22', '50', 1, 0, 'INSERT 3: 50 YEARS LATER over the beach', {'type': 'iris'}, [S(0, 'magic', -14), S(0.05, 'whoosh', -12)]),
    ('s22b', 'the', 1, 0, 'riverside park, sign under a sheet, happy locals', {'type': 'cut'}, [S(0.1, 'chime', -14), Wd('park', 'pop', -14)]),
    ('s23', 'exploding', 1, 0, 'PAYOFF: EXPLODING WHALE MEMORIAL PARK sign, gull in bib on top', {'type': 'flash'}, [S(0, 'success', -10), S(0.05, 'sparkle', -12), Wd('park', 'stamp', -12)]),
    ('s24', 'subscribe', 1, 0, 'closer: back to frame 1 framing, fresh fuse fizzing (loop)', {'type': 'cut'}, [S(0.05, 'tick', -12), S(0.55, 'tick', -12), S(1.05, 'tick', -12)]),
]

dur = round(W[-1]['end'] + TAIL, 3)
starts, prev = [], 0.0
for sid, word, nth, off, *_ in SHOTS:
    t = 0.0 if word is None else t_of(word, nth, prev) - LEAD + off
    starts.append(round(max(0.0, t), 3)); prev = t + 0.05 - off
out = []
for i, (sid, word, nth, off, scene, tr, sfx) in enumerate(SHOTS):
    st, en = starts[i], (starts[i + 1] if i + 1 < len(SHOTS) else dur)
    line = ' '.join(w['word'] for w in W if st - 0.01 <= w['start'] < en - 0.01)
    sh = {'id': sid, 'start': st, 'end': round(en, 3), 'line': line, 'scene': scene}
    if tr: sh['in'] = tr
    sh['sfx'] = sfx; out.append(sh)
json.dump({'duration': dur, 'generated_from': 'make_shots.py + timeline/words.json', 'shots': out}, open(f'{D}/story/shots.json', 'w'), indent=1)
cfg = json.load(open(f'{D}/config.json')); cfg['duration'] = dur; json.dump(cfg, open(f'{D}/config.json', 'w'), indent=1)
print(f'duration {dur:.2f} s, {len(out)} shots')
for s in out:
    d = s['end'] - s['start']; print(f"  {s['id']}  {s['start']:6.2f}-{s['end']:6.2f}  {d:4.2f}s  {s['line'][:62]}{'   <-- check' if not 0.9 <= d <= 2.8 else ''}")
