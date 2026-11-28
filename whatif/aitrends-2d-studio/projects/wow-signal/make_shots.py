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
    ('s01', None, 1, 0, 'FRAME 1: printout chattering out of the printer, red circle already drawing + top caption', None, [S(0, 'type', -10), S(0.02, 'suspense', -15), S(0.3, 'scratch', -14)]),
    ('s02', 'signal', 1, 0, 'astronomer leans in, double take', {'type': 'cut'}, [S(0.1, 'boing', -14), S(0.55, 'gasp', -10)]),
    ('s03', 'wrote', 1, 0, 'close paper: "Wow!" is written on the word', {'type': 'whipBlur', 'dir': 1}, [S(0, 'swoosh', -13), Wd('wow', 'scratch', -9), Wd('wow', 'ding', -12, offset=0.15)]),
    ('s04', "ohio's", 1, 0, 'Big Ear field at night; a giant cartoon ear pops up on "Ear"', {'type': 'iris'}, [S(0, 'wind', -18), Wd('big', 'pop', -12), Wd('ear', 'boing', -8, offset=0.25)]),
    ('s05', 'listening', 1, 0, 'tiny astronomer cups his ear at the sky, ???', {'type': 'whipBlur', 'dir': -1}, [S(0, 'swoosh', -14), S(0.2, 'boing', -14), Wd('alien', 'magic', -14)]),
    ('s06', 'its', 1, 0, 'printer chattering, THE CODE', {'type': 'cut'}, [S(0, 'type', -9), Wd('code', 'pop', -12)]),
    ('s07', 'numbers', 1, 0, 'quiet column of 1s, zzz, 1-9 = WEAK', {'type': 'cut'}, [Wd('weak', 'slide', -14)]),
    ('s08', 'letters', 1, 0, 'the alphabet bounces in, A-Z = STRONG', {'type': 'flash'}, [S(0, 'impact', -11), Wd('strong', 'punch', -10)]),
    ('s09', 'then', 1, 0, 'printer jolts, CHK!, AUG 15, 1977 stamp', {'type': 'whipBlur', 'dir': 1}, [S(0, 'type', -6), S(0.05, 'alarm', -18), Wd('august', 'stamp', -9)]),
    ('s10', 'printed', 1, 0, 'INSERT 1: 6EQUJ5 as bars, one per spoken character', {'type': 'cut'}, [S(0, 'whoosh', -12), Wd('6', 'pop', -12), Wd('e', 'pop', -12), Wd('q', 'pop', -11), Wd('u', 'impact', -9), Wd('j', 'pop', -12), Wd('5', 'pop', -13)]),
    ('s11', 'that', 1, 0, 'the U bar busts out of the card on "30", CRACK!', {'type': 'cut'}, [Wd('30', 'crash', -10), Wd('30', 'glass', -14, offset=0.05)]),
    ('s11b', 'standard', 1, 0, 'astronomer reaction: eyes pop, sweat, WAY ABOVE THE NOISE', {'type': 'whipBlur', 'dir': -1}, [S(0, 'swoosh', -13), S(0.15, 'gasp', -10)]),
    ('s12', 'days', 1, 0, 'at the desk, stack of printouts, DAYS LATER', {'type': 'iris'}, [S(0.05, 'clock', -14), S(0.1, 'paper', -12)]),
    ('s13', 'circled', 1, 0, 'SIGNATURE: the circle draws on, "Wow!" + flash + stars', {'type': 'cut'}, [S(0.05, 'scratch', -9), Wd('wow', 'scratch', -9), Wd('wow', 'success', -10, offset=0.1)]),
    ('s14', 'it', 2, 0, 'INSERT 2: counter 72 s over the blurred field', {'type': 'flash'}, [S(0, 'impact', -10), S(0.05, 'whoosh', -12), S(0.15, 'clock', -12)]),
    ('s15', 'exactly', 1, 0, 'the sky slides past the fixed beam; the glowing spot crosses it', {'type': 'whipBlur', 'dir': 1}, [S(0, 'swoosh', -13), S(0.3, 'riser', -16)]),
    ('s16', 'they', 1, 0, 'headphones at the desk; decades flip; cobwebs; beard grows', {'type': 'cut'}, [S(0.1, 'paper', -12), S(0.5, 'paper', -13), S(0.9, 'paper', -13), S(1.3, 'paper', -13), S(1.7, 'paper', -13)]),
    ('s17', 'nothing', 1, 0, 'bearded astronomer, deadpan shrug; SIGNALS FOUND: 0', {'type': 'cut'}, [S(0.4, 'tick', -16)]),
    ('s18', 'comets', 1, 0, 'two toon comets with faces, red arrows point, sweat', {'type': 'whipBlur', 'dir': -1}, [S(0, 'swoosh', -12), Wd('blamed', 'buzz', -12)]),
    ('s19', 'astronomers', 1, 0, 'two astronomers shake heads; NOPE. stamp', {'type': 'cut'}, [Wd('nope', 'stamp', -8), Wd('nope', 'fail', -14, offset=0.1)]),
    ('s20', 'but', 1, 0, 'slow push into deep space, silence beat', {'type': 'iris'}, [S(0, 'suspense', -12)]),
    ('s21', 'a', 1, 0, 'wide: the cloud far off; 2024 STUDY stamp', {'type': 'cut'}, [Wd('2024', 'stamp', -9)]),
    ('s21b', 'cold', 1, 0, 'close: the cloud shivers, COLD HYDROGEN CLOUD, brrr', {'type': 'cut'}, [S(0.05, 'wind', -13), S(0.25, 'pop', -14)]),
    ('s22', 'suddenly', 1, 0, 'a star flares, the cloud lights up, shocked; MAYBE?', {'type': 'flash'}, [S(0, 'zap', -10), S(0.05, 'boom', -12), Wd('flared', 'impact', -10)]),
    ('s23', 'still', 1, 0, 'astronomer shrug at the printout, ???, UNCONFIRMED', {'type': 'whipBlur', 'dir': 1}, [S(0, 'swoosh', -13), Wd('unconfirmed', 'stamp', -10)]),
    ('s24', 'but', 1, 0, 'big dish in a valley at dusk; beam goes up; 2012 stamp', {'type': 'iris'}, [Wd('2012', 'stamp', -9), Wd('replied', 'riser', -12)]),
    ('s25', 'with', 1, 0, 'PAYOFF: speech bubbles stream up out of the dish; 10,000+ TWEETS', {'type': 'cut'}, [S(0, 'pop', -12), S(0.3, 'pop', -13), S(0.6, 'pop', -13), Wd('tweets', 'impact', -9), Wd('tweets', 'success', -12, offset=0.1)]),
    ('s26', 'subscribe', 1, 0, 'closer: back to frame 1 framing, fresh sheet, pen arrives (loop)', {'type': 'cut'}, [S(0, 'type', -12)]),
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
