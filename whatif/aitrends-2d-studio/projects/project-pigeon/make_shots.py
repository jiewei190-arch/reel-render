"""Build story/shots.json from timeline/words.json: each shot starts at a spoken word (script-aligned Whisper timings).
Usage: python3 make_shots.py   (run after tools/transcribe.py). Prints every shot length (target ~1.0-2.7 s)."""
import json, os, re
D = os.path.dirname(os.path.abspath(__file__))
W = json.load(open(f'{D}/timeline/words.json')); W = W.get('words', W) if isinstance(W, dict) else W
norm = lambda w: re.sub(r"[^\w']", '', w.lower())
TAIL, LEAD = 0.5, 0.06

def t_of(word, nth=1, after=0.0):
    hits = [w for w in W if w['start'] >= after - 0.01 and norm(w['word']) == norm(word)]
    if len(hits) < nth: raise SystemExit(f'word {word!r} #{nth} not found after {after}')
    return hits[nth - 1]['start']

S = lambda at, name, gain=-12, **k: {'at': at, 'name': f'toon3d:{name}', 'gain': gain, **k}
Wd = lambda word, name, gain=-12, **k: {'word': word, 'name': f'toon3d:{name}', 'gain': gain, **k}
# (id, start word, nth, extra offset, scene note, transition, sfx)
P = lambda at, f, gain=-10, **k: {'at': at, 'name': f'sfx/{f}.wav', 'gain': gain, **k}     # original synthesized pecks (make_pecks.py)
SHOTS = [
    ('s01', None, 1, 0, 'FRAME 1: 3 helmeted pigeons pecking screens in the nose cone + 2-line top caption', None, [P(0, 'pecks_2', -8), S(0, 'whoosh', -12), Wd('missiles', 'ding', -14)]),
    ('s02', 'a', 1, 0, 'outside: the glide bomb in the clouds, WORLD WAR 2 chip', {'type': 'whipBlur', 'dir': 1}, [S(0, 'wind', -14), S(0, 'swoosh', -12), Wd('world', 'pop', -12)]),
    ('s03', '1943', 1, 0, 'lab: scientist points at his chalk doodle, 1943 stamp', {'type': 'flash'}, [S(0.05, 'stamp', -10), Wd('psychologist', 'pop', -14), Wd('plan', 'chime', -16)]),
    ('s04', 'this', 1, -0.75, 'the beat: close-up pigeon hammering its screen, PECK! bursts', {'type': 'cut'}, [P(0, 'peck1_2', -6)]),
    ('s05', 'three', 1, 0, 'front view: the 3 cockpits, TINY COCKPITS, bird 2 salutes', {'type': 'whipBlur', 'dir': -1}, [S(0, 'swoosh', -12), Wd('three', 'pop', -14), Wd('tiny', 'boing', -14), Wd('cockpits', 'pop', -14)]),
    ('s06', 'watched', 1, 0, 'over the shoulder: the screen shows the sea + a target ship', {'type': 'cut'}, [S(0, 'beep', -16), Wd('ground', 'click', -14)]),
    ('s07', 'and', 1, 0, 'bird 3 pecks, crosshair LOCKED ON; hard cut on "steer": the bomb banks', {'type': 'cut'}, [P(0, 'peck1_1', -8), S(0.7, 'beep', -12), Wd('steer', 'whoosh', -8)]),
    ('s08', 'show', 1, 0, 'two ships on every screen; birds look around, ??? x3', {'type': 'whipBlur', 'dir': 1}, [S(0, 'swoosh', -12), S(0.3, 'boing', -14), S(0.5, 'boing', -15), S(0.7, 'boing', -16)]),
    ('s09', 'at', 1, 0, 'LEFT LEFT RIGHT; birds 1+2 slowly turn and stare at bird 3, sweat', {'type': 'cut'}, [P(0, 'pecks_2', -10), Wd('agree', 'suspense', -14), Wd('agree', 'squeak', -16, offset=0.4)]),
    ('s10', 'majority', 1, 0, 'bird 3 sheepishly switches; 2 : 1, MAJORITY RULES', {'type': 'cut'}, [S(0.3, 'slide', -14), Wd('majority', 'stamp', -10), Wd('rules', 'stamp', -10)]),
    ('s11', 'one', 1, 0.3, 'INSERT: counter 10,000 PECKS in 45 minutes', {'type': 'cut'}, [S(0, 'impact', -10), S(0.05, 'whoosh', -12), P(0, 'peck1_3', -12)]),
    ('s12', 'committed', 1, 0, 'pigeon stops dead, stares into the lens; COMMITTED', {'type': 'cut'}, [Wd('committed', 'stamp', -10, offset=0.15)]),
    ('s13', 'officials', 1, 0.25, 'office: ECCENTRIC stamp, IMPRACTICAL stamp, pigeon sweats', {'type': 'whipBlur', 'dir': -1}, [S(0, 'swoosh', -12), Wd('eccentric', 'stamp', -8), Wd('impractical', 'stamp', -8), Wd('impractical', 'squeak', -16, offset=0.3)]),
    ('s14', 'then', 1, 0, 'officials shrug, $25,000 bag thumps on the desk, pigeon heart eyes', {'type': 'cut'}, [Wd('25,000', 'thud', -8, offset=0.1), Wd('25,000', 'cash', -12, offset=0.15), Wd('anyway', 'pop', -14)]),
    ('s15', 'but', 1, 0, '"But here\'s the part..." silence; the demo is set, everyone waits', {'type': 'iris'}, [S(0, 'suspense', -16)]),
    ('s16', 'the', 2, 0, 'peck: ON TARGET; officials double-take', {'type': 'cut'}, [P(0, 'peck1_1', -10), S(0.88, 'success', -10), Wd('worked', 'gasp', -14)]),
    ('s17', 'officials', 1, 0, 'office: arms crossed, side-eye; pigeon ???', {'type': 'whipBlur', 'dir': 1}, [S(0, 'swoosh', -12), Wd('skeptical', 'boing', -12)]),
    ('s18', 'in', 1, 0, '1944, CANCELLED slams, jaw drop, a feather floats down in silence', {'type': 'cut'}, [Wd('1944', 'stamp', -12), Wd('cancelled', 'impact', -8), Wd('cancelled', 'stamp', -8)]),
    ('s19', 'the', 1, 0, 'Navy officer leans in, PROJECT ORCON, pigeons flap with joy', {'type': 'iris'}, [S(0, 'swoosh', -12), Wd('orcon', 'stamp', -10), Wd('orcon', 'success', -14, offset=0.2)]),
    ('s20', 'until', 1, 0, 'a beeping electronic box rolls in, bumps cockpit 3; 1953', {'type': 'cut'}, [Wd('electronic', 'beep', -12), Wd('electronic', 'beep', -14, offset=0.35), Wd('won', 'thud', -10), Wd('1953', 'stamp', -12)]),
    ('s21', 'and', 1, 0, 'calendar card: +6 YEARS LATER', {'type': 'flash'}, [S(0, 'whoosh', -12), S(0.3, 'paper', -14), S(0.6, 'paper', -14), S(0.9, 'paper', -14)]),
    ('s22', "skinner's", 1, 0, 'PAYOFF: back in the cockpits, all 3 still pecking, STILL PECKING', {'type': 'cut'}, [P(0, 'pecks_3', -9), Wd('still', 'stamp', -12)]),
    ('s23', 'subscribe', 1, 0, 'closer: settles onto frame 1 framing (loop)', {'type': 'cut'}, [P(0, 'pecks_2', -12)]),
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
