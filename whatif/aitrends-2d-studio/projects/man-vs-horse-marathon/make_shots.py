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
    ('s01', None, 1, 0, 'FRAME 1: start line, runner bouncing, smug horse in sunglasses, 2-line top caption', None, [S(0, 'whoosh', -12), S(0.1, 'footsteps', -16), Wd('horses', 'pop', -14)]),
    ('s02', 'people', 1, 0, 'horse lowers its sunglasses at the runner, runner gulps', {'type': 'cut'}, [Wd('horses', 'slide', -14), S(0.6, 'sparkle', -16)]),
    ('s03', 'on', 1, 0, 'low: sneakers next to hooves; runner shrugs; ON FOOT', {'type': 'cut'}, [Wd('foot', 'boing', -12), S(0.3, 'squeak', -18)]),
    ('s04', 'it', 1, 0, 'the pub: two blokes with pints, landlord behind the bar, 1980', {'type': 'iris'}, [S(0, 'whoosh', -12), Wd('1980', 'pop', -12)]),
    ('s05', 'with', 1, 0, 'the two blokes argue, pints raised', {'type': 'cut'}, [Wd('argument', 'ding', -12), S(0.6, 'crowd', -20)]),
    ('s06', 'over', 1, 0, 'one taps his chest, the other shakes his head: HUMAN = HORSE?', {'type': 'cut'}, [Wd('human', 'pop', -12), Wd('horse', 'pop', -12), Wd('horse', 'boing', -16, offset=0.25)]),
    ('s07', 'the', 1, 0, 'the landlord polishing a glass, eyes slide sideways', {'type': 'whipBlur', 'dir': 1}, [S(0, 'swoosh', -13), Wd('overheard', 'magic', -14)]),
    ('s08', 'and', 1, 0, 'the hills: START / FINISH arch drops in, landlord points: RACE!', {'type': 'cut'}, [Wd('race', 'thud', -10), Wd('race', 'stamp', -12, offset=0.1)]),
    ('s09', '22', 1, 0, 'INSERT 1: 22 MILES over the hills', {'type': 'cut'}, [S(0, 'impact', -10), S(0.05, 'whoosh', -12)]),
    ('s10', 'runners', 1, 0, 'the pack streams down the course: RUNNERS vs. HORSES', {'type': 'whipBlur', 'dir': -1}, [S(0, 'swoosh', -12), S(0.1, 'footsteps', -12), S(0.2, 'horn', -22)]),
    ('s11', 'for', 1, 0, 'INSERT 2: counter 0 -> 25 YEARS, HORSES WON', {'type': 'cut'}, [S(0, 'impact', -10), S(0.1, 'tick', -16), S(0.4, 'tick', -16), S(0.7, 'tick', -16)]),
    ('s12', 'every', 1, 0, 'horse on a podium, a trophy drops on each word, punch-ins', {'type': 'cut'}, [Wd('every', 'thud', -10), Wd('single', 'thud', -10), Wd('time', 'thud', -8), Wd('time', 'success', -14)]),
    ('s13', 'but', 1, 0, 'runner stares down the course, horse yawns, zzz', {'type': 'cut'}, [Wd('part', 'riser', -14), S(0.3, 'wind', -18)]),
    ('s14', 'in', 1, 0, '2004: a toon runner sprinting, speed lines', {'type': 'whipBlur', 'dir': 1}, [S(0, 'whoosh', -10), S(0.1, 'footsteps', -12), Wd('huw', 'pop', -14)]),
    ('s15', 'beat', 1, 0, 'finish: runner breaks the tape; horse arrives, jaw drop, sunglasses gone: HUMAN WINS', {'type': 'flash'}, [Wd('all', 'success', -8), Wd('all', 'stamp', -12, offset=0.1), S(0.9, 'gasp', -14)]),
    ('s16', 'by', 1, 0, 'close: horse double take, sweat, ~2 MIN', {'type': 'cut'}, [S(0.3, 'boing', -12), Wd('minutes', 'tick', -14)]),
    ('s17', 'and', 1, 0, 'money bag drops into the runner arms: 25,000 pound chip', {'type': 'cut'}, [Wd('25,000', 'cash', -10), Wd('prize', 'coins', -12)]),
    ('s18', 'since', 1, 0, 'scoreboard: HUMAN WINS 2004 + 2007 2022 2023 2025', {'type': 'whipBlur', 'dir': -1}, [S(0, 'swoosh', -12), Wd('4', 'pop', -12), Wd('4', 'pop', -12, offset=0.28), Wd('4', 'pop', -12, offset=0.56), Wd('4', 'pop', -12, offset=0.84)]),
    ('s19', 'most', 1, 0, '2025 winner, arms up; a horse sulks', {'type': 'cut'}, [Wd('2025', 'ding', -12)]),
    ('s20', 'humans', 1, 0, 'PAYOFF 1: scoreboard HUMANS 5', {'type': 'flash'}, [S(0, 'impact', -10), Wd('5', 'success', -12)]),
    ('s21', 'horses', 1, 0, 'PAYOFF 2: the horse puts its sunglasses back on, trophy pile: THE REST', {'type': 'cut'}, [Wd('rest', 'slide', -12), Wd('rest', 'sparkle', -14, offset=0.1)]),
    ('s22', 'subscribe', 1, 0, 'closer: back to the start line, frame 1 framing (loop)', {'type': 'cut'}, [S(0.05, 'footsteps', -18)]),
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
