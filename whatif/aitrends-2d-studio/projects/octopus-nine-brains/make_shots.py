"""Build story/shots.json from timeline/words.json: each shot starts at a spoken word (script-aligned Whisper timings).
Usage: python3 make_shots.py   (run after tools/transcribe.py). Prints every shot length (target ~1.0-2.7 s)."""
import json, os, re
D = os.path.dirname(os.path.abspath(__file__))
W = json.load(open(f'{D}/timeline/words.json')); W = W.get('words', W) if isinstance(W, dict) else W
norm = lambda w: re.sub(r"[^\w']", '', w.lower())
TAIL, LEAD = 0.5, 0.06

def t_of(word, nth=1, after=0.0):
    hits = [w for w in W if w['start'] >= after - 0.01 and norm(w['word']).startswith(norm(word))]
    if len(hits) < nth: raise SystemExit(f'word {word!r} #{nth} not found after {after}')
    return hits[nth - 1]['start']

S = lambda at, name, gain=-12, **k: {'at': at, 'name': f'toon3d:{name}', 'gain': gain, **k}
Wd = lambda word, name, gain=-12, **k: {'word': word, 'name': f'toon3d:{name}', 'gain': gain, **k}
# (id, start word, nth, extra offset, scene note, transition, sfx)
SHOTS = [
    ('s01', None, 1, 0, 'FRAME 1: octopus mid-swim in deep water + 2-line top caption', None, [S(0, 'whoosh', -10), S(0.05, 'sparkle', -14), Wd('brains', 'ding', -14)]),
    ('s02', '3', 1, 0, 'x-ray: 3 hearts pumping, blue glow', {'type': 'flash'}, [S(0, 'heartbeat', -8), Wd('blue', 'sparkle', -12)]),
    ('s03', 'the', 1, 0, 'sunlit reef, OCTOPUS chip', {'type': 'whipBlur', 'dir': 1}, [S(0, 'swoosh', -12), Wd('octopus', 'pop', -12)]),
    ('s04', '500', 1, 0, 'INSERT 1: counter 500,000,000 neurons (x-ray octopus behind)', {'type': 'cut'}, [S(0, 'impact', -10), S(0.05, 'whoosh', -12), S(0.15, 'tick', -16)]),
    ('s05', 'about', 1, 0, 'dog in a bubble helmet drifts in, brain icons, the "≈" chip', {'type': 'whipBlur', 'dir': -1}, [S(0, 'swoosh', -12), Wd('dog', 'boing', -12), Wd('dog', 'pop', -14, offset=0.2)]),
    ('s06', 'but', 1, 0, 'x-ray: head neurons dim, NOT HERE', {'type': 'whipBlur', 'dir': 1}, [S(0, 'swoosh', -12), Wd('two', 'pop', -12), Wd('head', 'stamp', -10), Wd('head', 'boing', -16, offset=0.2)]),
    ('s07', "they're", 1, 0, 'arms light up gold, IN THE ARMS', {'type': 'flash'}, [Wd('arms', 'sparkle', -10), Wd('arms', 'stamp', -12)]),
    ('s08', 'each', 1, 0, '8 mini brains light up, +8 MINI BRAINS, 1 + 8 = 9', {'type': 'whipBlur', 'dir': -1}, [S(0, 'swoosh', -12), S(0.3, 'pop', -14), S(0.5, 'pop', -14), S(0.7, 'pop', -14), Wd('mini', 'ding', -12), Wd('brain', 'success', -14)]),
    ('s09', 'can', 1, -0.2, 'arm tastes a clam, another taps a fish', {'type': 'cut'}, [Wd('taste', 'pop', -12), Wd('touch', 'boing', -12)]),
    ('s10', 'move', 1, 0, 'one arm waves on its own, ???', {'type': 'whipBlur', 'dir': 1}, [S(0, 'swoosh', -13), Wd('own', 'boing', -12)]),
    ('s11', 'but', 1, 0, 'crown pops on, arms snap into sync, IN CONTROL', {'type': 'iris'}, [Wd('main', 'magic', -12), Wd('control', 'impact', -10), Wd('control', 'stamp', -14)]),
    ('s12', '3', 1, 0, 'x-ray mantle: gill hearts pump, GILLS chips', {'type': 'whipBlur', 'dir': 1}, [S(0, 'heartbeat', -6), Wd('gills', 'pop', -12)]),
    ('s13', 'one', 1, 0, 'body heart pumps, blue blood loops round', {'type': 'cut'}, [S(0, 'heartbeat', -6), Wd('body', 'sparkle', -14)]),
    ('s14', 'but', 1, 0, 'jet swim across the frame, speed lines', {'type': 'whipBlur', 'dir': 1}, [S(0, 'whoosh', -8), S(0.3, 'water', -16)]),
    ('s15', 'that', 1, 0, 'x-ray: the body heart greys and stops, PAUSED, zzz', {'type': 'cut'}, [S(0, 'heartbeat', -8), Wd('quiet', 'stamp', -12), Wd('quiet', 'squeak', -16, offset=0.2)]),
    ('s16', 'and', 1, 0, 'test tube of glowing blue blood, BLUE BLOOD', {'type': 'iris'}, [S(0.1, 'pop', -14), Wd('blue', 'sparkle', -10)]),
    ('s17', 'because', 1, 0, 'INSERT 2: COPPER (not iron, like ours)', {'type': 'cut'}, [S(0, 'impact', -10), S(0.05, 'whoosh', -12), Wd('iron', 'fail', -16)]),
    ('s18', 'but', 1, 0, 'icy deep water: COLD / LITTLE OXYGEN, cut to close-up on "copper", COPPER WINS', {'type': 'whipBlur', 'dir': -1}, [S(0, 'swoosh', -12), Wd('cold', 'wind', -16), Wd('copper', 'pop', -12), Wd('better', 'success', -10), Wd('better', 'stamp', -12)]),
    ('s19', '9', 1, 0, 'recap: 9 BRAINS / 3 HEARTS / BLUE BLOOD, hard cut per beat', {'type': 'flash'}, [S(0, 'pop', -10), Wd('hearts', 'pop', -10), Wd('blue', 'pop', -10)]),
    ('s20', 'and', 1, 0, 'PAYOFF: it squeezes through a tiny hole in a rock, 0 BONES', {'type': 'whipBlur', 'dir': 1}, [S(0, 'squeak', -12), Wd('zero', 'slide', -10), Wd('bones', 'boing', -8), Wd('bones', 'stamp', -10)]),
    ('s21', 'subscribe', 1, 0, 'closer: back to frame 1 framing (loop)', {'type': 'cut'}, [S(0.05, 'sparkle', -16)]),
]

dur = round(W[-1]['end'] + TAIL, 3)
starts, prev = [], 0.0
for sid, word, nth, off, *_ in SHOTS:
    t = 0.0 if word is None else t_of(word, nth, prev) - LEAD + off
    starts.append(round(max(0.0, t), 3)); prev = t + 0.05
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
