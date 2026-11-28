"""Build story/shots.json from timeline/words.json: each shot starts at a spoken word (script-aligned Whisper timings).
Usage: python3 make_shots.py   (run after tools/transcribe.py). Prints every shot length (target ~1.0-2.7 s)."""
import json, os, re
D = os.path.dirname(os.path.abspath(__file__))
W = json.load(open(f'{D}/timeline/words.json')); W = W.get('words', W) if isinstance(W, dict) else W
norm = lambda w: re.sub(r"[^\w'%]", '', w.lower())
TAIL, LEAD = 0.5, 0.06

def t_of(word, nth=1, after=0.0):
    hits = [w for w in W if w['start'] >= after - 0.01 and (norm(w['word']) == norm(word[1:]) if word.startswith('=') else norm(w['word']).startswith(norm(word)))]
    if len(hits) < nth: raise SystemExit(f'word {word!r} #{nth} not found after {after}')
    return hits[nth - 1]['start']

S = lambda at, name, gain=-12, **k: {'at': at, 'name': f'toon3d:{name}', 'gain': gain, **k}
Wd = lambda word, name, gain=-12, **k: {'word': word, 'name': f'toon3d:{name}', 'gain': gain, **k}
L = lambda at, name, gain=-12, **k: {'at': at, 'name': name, 'gain': gain, **k}   # project-local sfx (sfx/*.wav, synthesized by make_sfx.py)
# (id, start word, nth, extra offset, scene note, transition, sfx)
SHOTS = [
    ('s01', None, 1, 0, 'FRAME 1: staring contest over the tiny TOLEDO strip + 2-line top caption', None, [L(0, 'sfx/stare.wav', -10), Wd('war', 'impact', -14)]),
    ('s02', 'over', 1, 0, 'punch-in on the tiny TOLEDO sign', {'type': 'cut'}, [S(0, 'swoosh', -14), Wd('toledo', 'ding', -12)]),
    ('s03', 'blame', 1, 0, 'bad map: Lake Michigan slides the wrong way, BAD MAP, ?', {'type': 'whipBlur', 'dir': 1}, [S(0, 'paper', -10), Wd('bad', 'fail', -16), Wd('bad', 'stamp', -12, offset=0.4)]),
    ('s04', 'both', 1, 0, 'survey lines draw, the strip lights up, 5-8 MILES WIDE', {'type': 'cut'}, [S(0.2, 'scratch', -14), S(0.6, 'stamp', -12), Wd('miles', 'pop', -12)]),
    ('s05', 'in', 1, 0, 'river wide: two militia lines face off, 1835', {'type': 'whipBlur', 'dir': -1}, [S(0, 'whoosh', -10), S(0.05, 'stamp', -12), Wd('militias', 'crowd', -16)]),
    ('s06', 'to', 1, 0, 'low along the Maumee, MAUMEE RIVER chip, ???', {'type': 'cut'}, [S(0, 'water', -16), Wd('maumee', 'pop', -12)]),
    ('s07', 'and', 1, 0, 'both banks jump and yell: NYAH! bubbles, hard cut between banks', {'type': 'flash'}, [S(0, 'crowd', -12), S(0.1, 'boing', -14), S(0.5, 'pop', -14), S(0.8, 'boing', -14)]),
    ('s08', 'the', 1, 0, 'one militiaman fires straight up: POP puffs, everyone looks up ???', {'type': 'whipBlur', 'dir': 1}, [S(0, 'swoosh', -14), Wd('shots', 'pop', -6), Wd('shots', 'pop', -8, offset=0.18), Wd('shots', 'pop', -9, offset=0.36), Wd('air', 'boing', -14)]),
    ('s09', 'nobody', 1, 0, 'INSERT 1: scoreboard BATTLES 1 / HITS 0', {'type': 'cut'}, [S(0, 'impact', -12), S(0.35, 'tick', -12), S(0.7, 'tick', -12), Wd('hit', 'ding', -12)]),
    ('s10', 'but', 1, 0, 'BUT... beat: the Michigan governor slowly turns to the lens', {'type': 'iris'}, [S(0, 'suspense', -14), S(0.05, 'stamp', -14)]),
    ('s11', '=the', 2, 0, 'INSERT 2: scoreboard INJURIES 1 + a penknife icon, NOT SERIOUS', {'type': 'cut'}, [S(0, 'impact', -12), Wd('injury', 'tick', -10), Wd('penknife', 'click', -8), Wd('penknife', 'stamp', -14, offset=0.5)]),
    ('s12', 'by', 1, 0, 'Two Stickney holds up a big 2', {'type': 'whipBlur', 'dir': -1}, [S(0, 'swoosh', -14), Wd('two', 'pop', -10), Wd('stickney', 'ding', -14)]),
    ('s13', 'his', 1, 0, 'pull-out: his brother holds up a 1, ???', {'type': 'cut'}, [Wd('one', 'pop', -10), Wd('one', 'boing', -12, offset=0.3)]),
    ('s14', 'congress', 1, 0, 'domed hall, CONGRESS stamp, BANG', {'type': 'whipBlur', 'dir': 1}, [S(0, 'whoosh', -12), S(0.1, 'stamp', -12), Wd('stepped', 'thud', -8)]),
    ('s15', 'ohio', 1, 0, 'Ohio governor hugs the sign, heart eyes; Michigan shocked', {'type': 'cut'}, [Wd('toledo', 'pop', -12), Wd('toledo', 'chime', -14, offset=0.1)]),
    ('s16', 'michigan', 1, 0, 'STATEHOOD star, then a blue ribbon pinned on: UP', {'type': 'whipBlur', 'dir': -1}, [S(0, 'swoosh', -14), Wd('statehood', 'success', -14), Wd('upper', 'pop', -10)]),
    ('s17', '=a', 1, 0, 'close-up: the ribbon, deadpan; CONSOLATION PRIZE', {'type': 'cut'}, [Wd('consolation', 'stamp', -12), Wd('prize', 'fail', -16)]),
    ('s18', 'almost', 1, 0, 'alone in the snowy pines, shivering, WORTHLESS?', {'type': 'whipBlur', 'dir': 1}, [S(0, 'wind', -10), Wd('worthless', 'stamp', -12)]),
    ('s19', 'but', 1, 0, 'pickaxe cracks a rock: glowing COPPER + IRON, 1840s', {'type': 'flash'}, [S(0.05, 'stamp', -14), Wd('found', 'metal', -8), Wd('found', 'impact', -12), Wd('copper', 'sparkle', -10), Wd('iron', 'pop', -12)]),
    ('s20', 'by', 1, 0, "INSERT 3: counter 90% OF AMERICA'S COPPER by the 1860s", {'type': 'cut'}, [S(0, 'impact', -10), S(0.05, 'whoosh', -12), S(0.2, 'coins', -12)]),
    ('s21', 'michigan', 1, 0, 'Ohio hugs his sign, smug; Michigan wears the ribbon: LOST TOLEDO', {'type': 'whipBlur', 'dir': -1}, [S(0, 'swoosh', -14), Wd('lost', 'fail', -14)]),
    ('s22', '=and', 1, 0, 'PAYOFF: pull out: Michigan sits on a copper mountain; Ohio double-takes; JACKPOT', {'type': 'cut'}, [S(0, 'whoosh', -12), Wd('jackpot', 'cash', -8), Wd('jackpot', 'stamp', -12), Wd('jackpot', 'boing', -14, offset=0.25)]),
    ('s23', 'subscribe', 1, 0, 'closer: back to the staring contest, frame 1 framing (loop)', {'type': 'cut'}, [L(0, 'sfx/stare.wav', -14)]),
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
