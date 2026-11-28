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
    ('s01', None, 1, 0, 'FRAME 1: orchard, spaghetti tree, farmer on a ladder tugging a noodle, 2-line top caption', None, [S(0, 'boing', -14), S(0.05, 'sparkle', -16), S(0.9, 'boing', -16)]),
    ('s02', 'convinced', 1, 0, '1950s living room, the family on the sofa watching TV, jaws drop', {'type': 'cut'}, [S(0.3, 'pop', -16)]),
    ('s02b', 'spaghetti', 1, 0, 'close on the TV screen: the spaghetti tree, black and white', {'type': 'cut'}, [Wd('trees', 'boing', -12), Wd('trees', 'gasp', -14, offset=0.1)]),
    ('s03', 'april', 1, 0, 'INSERT 1: APRIL 1, 1957', {'type': 'cut'}, [S(0, 'impact', -10), S(0.05, 'whoosh', -12)]),
    ('s04', 'a', 1, 0, 'black-and-white TV presenter at a desk: SERIOUS NEWS SHOW, SWITZERLAND', {'type': 'whipBlur', 'dir': 1}, [S(0, 'swoosh', -12), Wd('switzerland', 'chime', -14)]),
    ('s04b', 'aired', 1, 0, 'wide Ticino: lake, mountains, chalet: SWITZERLAND', {'type': 'whipBlur', 'dir': -1}, [S(0, 'swoosh', -12), Wd('switzerland', 'chime', -14)]),
    ('s05', 'a', 2, 0, 'the orchard: a Swiss family, all smiles', {'type': 'iris'}, [S(0, 'magic', -16), Wd('family', 'pop', -14)]),
    ('s06', 'harvesting', 1, 0, 'close: a noodle stretches... and comes off the tree', {'type': 'cut'}, [Wd('spaghetti', 'squeak', -14), Wd('straight', 'boing', -12), Wd('trees', 'pop', -12)]),
    ('s07', 'report', 1, -0.18, 'wide orchard: THE REPORT SAID...', {'type': 'whipBlur', 'dir': -1}, [S(0, 'swoosh', -12), S(0.1, 'paper', -14)]),
    ('s08', 'the', 1, 0, 'a tiny weevil with a hat and suitcase walks off: GONE', {'type': 'cut'}, [S(0.2, 'footsteps', -18), Wd('weevil', 'pop', -12), Wd('disappeared', 'slide', -12), Wd('disappeared', 'stamp', -12, offset=0.15)]),
    ('s09', 'and', 1, 0, 'B&W presenter, deadpan: TRUSTED', {'type': 'cut'}, [Wd('trusted', 'stamp', -10), Wd('trusted', 'sparkle', -16, offset=0.1)]),
    ('s09b', 'one', 1, 0, 'the family on the sofa nod along, trusting', {'type': 'cut'}, [Wd('trusted', 'stamp', -10), Wd('trusted', 'sparkle', -16, offset=0.1)]),
    ('s10', 'back', 1, 0, 'British family at dinner, staring at a plate of spaghetti; dad dangles one noodle: ???', {'type': 'whipBlur', 'dir': 1}, [S(0, 'swoosh', -12), Wd('unusual', 'boing', -12)]),
    ('s10b', 'unusual', 1, 0, 'close: dad dangles one noodle over the plate, ???', {'type': 'cut'}, [Wd('unusual', 'boing', -12)]),
    ('s11', 'but', 1, 0, 'night, quiet living room, the phone on the side table', {'type': 'dip'}, [S(0.1, 'clock', -16), Wd('part', 'riser', -14)]),
    ('s12', 'the', 2, 0, 'the phone rings and hops: RING! RING!', {'type': 'cut'}, [S(0, 'alarm', -16), S(0.0, 'bell', -10), S(0.6, 'bell', -10), Wd('called', 'bell', -10)]),
    ('s12b', 'viewers', 1, 0, 'more phones ringing in a row: VIEWERS CALLED IN', {'type': 'cut'}, [S(0, 'bell', -10), Wd('called', 'bell', -10)]),
    ('s13', 'some', 1, 0, 'a man in his garden on the phone, heart eyes: HOW DO I GROW ONE?', {'type': 'whipBlur', 'dir': -1}, [S(0, 'swoosh', -12), Wd('grow', 'pop', -12), Wd('tree', 'sparkle', -14)]),
    ('s13b', 'grow', 1, 0, 'close: the man on the phone, heart eyes, spade', {'type': 'cut'}, [Wd('grow', 'pop', -12), Wd('tree', 'sparkle', -14)]),
    ('s14', 'it', 1, 0, 'calendar APRIL 1 + B&W presenter smirks: APRIL FOOLS!', {'type': 'flash'}, [S(0, 'impact', -10), Wd('fools', 'stamp', -10), Wd('fools', 'laugh', -18, offset=0.2)]),
    ('s15', 'the', 1, 0, 'B&W presenter raises a finger: THE ADVICE', {'type': 'cut'}, [S(0.05, 'ding', -14)]),
    ('s16', 'place', 1, 0, 'a man plants a noodle sprig in a tin of tomato sauce, very carefully', {'type': 'whipBlur', 'dir': 1}, [S(0, 'swoosh', -12), Wd('sprig', 'pop', -14), Wd('tomato', 'splash', -16)]),
    ('s16b', 'tin', 1, 0, 'close: the sprig goes into the tomato sauce', {'type': 'cut'}, [Wd('tomato', 'splash', -14)]),
    ('s17', 'and', 1, 0, 'PAYOFF: he sits and waits, zzz; the sprig wiggles: ...AND HOPE', {'type': 'cut'}, [Wd('best', 'stamp', -10), Wd('best', 'clock', -16, offset=0.3)]),
    ('s18', 'subscribe', 1, 0, 'closer: back to frame 1 framing in the orchard (loop)', {'type': 'iris'}, [S(0.05, 'magic', -18)]),
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
