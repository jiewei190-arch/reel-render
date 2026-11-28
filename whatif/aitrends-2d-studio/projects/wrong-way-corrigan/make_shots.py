"""Build story/shots.json from timeline/words.json: each shot starts at a spoken word (script-aligned Whisper timings).
Usage: python3 make_shots.py   (run after tools/transcribe.py). Prints every shot length (target ~1.0-2.7 s)."""
import json, os, re
D = os.path.dirname(os.path.abspath(__file__))
W = json.load(open(f'{D}/timeline/words.json')); W = W.get('words', W) if isinstance(W, dict) else W
norm = lambda w: re.sub(r"[^\w']", '', w.lower())
TAIL, LEAD = 0.75, 0.06

def t_of(word, nth=1, after=0.0):
    hits = [w for w in W if w['start'] >= after - 0.01 and norm(w['word']) == norm(word)]
    if len(hits) < nth: raise SystemExit(f'word {word!r} #{nth} not found after {after}')
    return hits[nth - 1]['start']

S = lambda at, name, gain=-12, **k: {'at': at, 'name': f'toon3d:{name}', 'gain': gain, **k}
Wd = lambda word, name, gain=-12, **k: {'word': word, 'name': f'toon3d:{name}', 'gain': gain, **k}
# (id, start word, nth, extra offset, scene note, transition, sfx)
SHOTS = [
    ('s01', None, 1, 0, 'FRAME 1: plane rolls to a stop in an Irish field, pilot waving, sheep; spinning compass badge; 2-line top caption', None, [S(0, 'engine', -14), S(0, 'whoosh', -12), Wd('ireland', 'ding', -14)]),
    ('s02', 'and', 1, 0, 'close: pilot in the window, "Hi, California!" bubble; sheep ???', {'type': 'cut'}, [S(0.15, 'pop', -12), Wd('california', 'boing', -12), Wd('california', 'boing', -14, offset=0.15)]),
    ('s03', '1938', 1, 0, 'NY airfield: pilot hands on hips by his plane, 1938 stamp, DOUGLAS CORRIGAN chip', {'type': 'flash'}, [S(0.05, 'stamp', -10), Wd('douglas', 'pop', -14)]),
    ('s04', 'wanted', 1, 0, 'map card: dashed route creeps across the Atlantic', {'type': 'whipBlur', 'dir': 1}, [S(0, 'swoosh', -12), S(0.3, 'slide', -16)]),
    ('s05', 'officials', 1, 0, 'office: both officials shake heads, DENIED', {'type': 'cut'}, [Wd('no', 'stamp', -8), Wd('no', 'fail', -16, offset=0.15)]),
    ('s06', 'his', 1, 0, 'the plane by the hangar creaks, 9 YEARS OLD, 1929 CURTISS ROBIN', {'type': 'whipBlur', 'dir': -1}, [S(0, 'swoosh', -12), Wd('nine', 'creak', -10), Wd('curtiss', 'pop', -14)]),
    ('s07', 'no', 1, 0, 'empty RADIO slot with a cobweb, NO RADIO, pilot shrugs', {'type': 'cut'}, [Wd('radio', 'stamp', -10), S(0.1, 'squeak', -16)]),
    ('s08', 'extra', 1, 0, 'x-ray fuel tank in the windshield; he leans out the side; VIEW AHEAD: TANK', {'type': 'cut'}, [Wd('fuel', 'pop', -12), Wd('view', 'boing', -12), Wd('view', 'stamp', -12, offset=0.1)]),
    ('s09', 'so', 1, 0, 'dawn airfield, JULY 17, 1938 stamp', {'type': 'flash'}, [S(0.05, 'stamp', -10)]),
    ('s10', 'filed', 1, -0.15, 'INSERT document: FLIGHT PLAN, TO: CALIFORNIA; pilot smug behind it', {'type': 'cut'}, [S(0, 'impact', -10), S(0.05, 'paper', -12), Wd('california', 'ding', -14)]),
    ('s11', 'took', 1, -0.15, 'takeoff down the runway at dawn', {'type': 'whipBlur', 'dir': 1}, [S(0, 'engine', -8), S(0.5, 'whoosh', -10)]),
    ('s12', 'california', 1, 0, 'map: green dashed route WEST', {'type': 'cut'}, [S(0, 'slide', -14), S(0.5, 'ding', -14)]),
    ('s13', 'went', 1, -0.15, 'map: red route heads EAST over the Atlantic', {'type': 'cut'}, [S(0.1, 'whoosh', -10), S(0.5, 'boing', -12)]),
    ('s14', '28', 1, 0.25, 'INSERT counter: 28 HOURS LATER over the plane in the clouds', {'type': 'cut'}, [S(0, 'impact', -10), S(0.05, 'clock', -14), S(0, 'engine', -16)]),
    ('s15', 'landed', 1, -0.2, 'Irish field: plane bumps down; officer walks up; sheep look; DUBLIN, IRELAND', {'type': 'whipBlur', 'dir': -1}, [S(0.6, 'thud', -10), Wd('dublin', 'pop', -12)]),
    ('s16', 'said', 1, -0.2, 'thick clouds swallow the plane; pilot squints ???', {'type': 'cut'}, [S(0, 'wind', -12), Wd('lost', 'boing', -12)]),
    ('s17', 'misread', 1, -0.15, 'big compass: needle spins and settles on E', {'type': 'cut'}, [S(0, 'tick', -12), S(0.2, 'tick', -12), S(0.4, 'tick', -12), S(0.6, 'boing', -12)]),
    ('s18', 'but', 1, 0, '"But here\'s the part..." silence; officials read the news, deadpan', {'type': 'iris'}, [S(0, 'suspense', -16)]),
    ('s19', 'license', 1, -0.2, 'licence card + SUSPENDED stamp', {'type': 'cut'}, [S(0, 'paper', -14), Wd('suspended', 'stamp', -8)]),
    ('s20', 'only', 1, 0, 'ocean liner steams home, pilot waves; SUSPENSION ENDS = SHIP ARRIVES: AUG 4', {'type': 'whipBlur', 'dir': 1}, [S(0, 'water', -14), Wd('home', 'horn', -12)]),
    ('s21', 'new', 1, 0, 'ticker-tape parade: confetti, open car, crowds cheering', {'type': 'flash'}, [S(0, 'crowd', -10), Wd('parade', 'success', -14)]),
    ('s22', 'and', 1, 0, 'PAYOFF: close-up, side-eye + smirk, NEVER ADMITTED IT, compass badge', {'type': 'cut'}, [Wd('never', 'stamp', -10), Wd('thing', 'boing', -14)]),
    ('s23', 'subscribe', 1, 0, 'closer: back to frame 1 framing in the Irish field (loop)', {'type': 'cut'}, [S(0, 'engine', -16)]),
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
