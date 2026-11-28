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
    ('s01', None, 1, 0, 'FRAME 1: the toon sea monster looms in deep water, sound rings pulse, a fish double-takes + top caption', None, [{'at': 0, 'name': 'sfx/sweep_3.wav', 'gain': -5}, S(0.02, 'suspense', -16), S(1.0, 'boing', -14)]),
    ('s02', 'nobody', 1, 0, 'a scientist with headphones shrugs, ???', {'type': 'cut'}, [S(0.15, 'boing', -13)]),
    ('s03', 'underwater', 1, 0, 'the hydrophone on its cable, HYDROPHONE = UNDERWATER MIC', {'type': 'iris'}, [S(0, 'water', -16), Wd('microphones', 'pop', -12)]),
    ('s04', 'volcanoes', 1, 0, 'a tiny undersea volcano burps bubbles, LISTENING FOR VOLCANOES', {'type': 'whipBlur', 'dir': 1}, [S(0, 'swoosh', -13), S(0.2, 'water', -14)]),
    ('s05', 'instead', 1, 0, 'giant rings slam the hydrophone on "this", fish flee', {'type': 'cut'}, [{'word': 'this', 'name': 'sfx/sweep_5.wav', 'gain': -3, 'offset': -0.05}, Wd('this', 'impact', -12)]),
    ('s06', 'ultra', 1, 0, 'INSERT 1: oscilloscope, a slow wave grows huge: ULTRA-LOW / EXTREMELY LOUD', {'type': 'flash'}, [S(0, 'whoosh', -12), Wd('loud', 'boom', -10)]),
    ('s07', 'and', 1, 0, 'clock dial sweeps round: ~1 MINUTE', {'type': 'cut'}, [S(0.1, 'clock', -11), Wd('minute', 'ding', -13)]),
    ('s08', 'sped', 1, 0, 'fast-forward on the tape machine, >> x16', {'type': 'whipBlur', 'dir': -1}, [S(0, 'swoosh', -13), Wd('16', 'zap', -12), S(0.3, 'scratch', -16)]),
    ('s09', 'went', 1, -0.25, 'deadpan scientist; one bubble pops out: BLOOP stamp', {'type': 'cut'}, [{'word': 'bloop', 'name': 'sfx/bloop.wav', 'gain': -4, 'offset': 0.05}, Wd('bloop', 'stamp', -14, offset=0.25)]),
    ('s10', 'sensors', 1, 0, 'INSERT 2: Pacific map, two sensors, ~3,000 MILES', {'type': 'iris'}, [S(0, 'paper', -11), Wd('3,000', 'ding', -12), Wd('apart', 'slide', -14)]),
    ('s11', 'from', 1, 0, 'zoom to the X: REMOTE SOUTH PACIFIC', {'type': 'cut'}, [Wd('remote', 'pop', -11), Wd('pacific', 'stamp', -14)]),
    ('s12', 'reportedly', 1, 0, 'a blue whale sings proudly, REPORTEDLY / BLUE WHALE', {'type': 'whipBlur', 'dir': 1}, [S(0, 'swoosh', -13), S(0.3, 'water', -16), Wd('blue', 'pop', -12)]),
    ('s13', 'loudest', 1, 0, 'giant BLOOP rings dwarf the whale; it sweats: LOUDEST KNOWN ANIMAL', {'type': 'cut'}, [S(0.15, 'rumble', -8), S(0.35, 'squeak', -12)]),
    ('s14', 'so', 1, 0, 'three people think, ??? ??? ???', {'type': 'cut'}, [S(0.1, 'boing', -14), S(0.25, 'boing', -15), S(0.4, 'boing', -15)]),
    ('s15', 'giant', 1, 0, 'THE MONSTER: low angle, flash: GIANT SEA CREATURE?', {'type': 'flash'}, [S(0, 'thunder', -10), Wd('creature', 'suspense', -12)]),
    ('s16', 'but', 1, 0, 'slow push on the monster in the dark (beat)', {'type': 'iris'}, [S(0, 'riser', -16)]),
    ('s17', 'in', 1, 0, 'scientist finds it: 2005 stamp, "!"', {'type': 'cut'}, [Wd('2005', 'stamp', -9), Wd('found', 'success', -11)]),
    ('s18', 'not', 1, 0, 'the monster drops its tentacles: an iceberg: NOT A SEA MONSTER', {'type': 'whipBlur', 'dir': 1}, [S(0, 'swoosh', -13), S(0.35, 'slide', -9), S(0.6, 'boing', -11), Wd('monster', 'stamp', -12)]),
    ('s19', 'an', 1, 0, 'the iceberg shakes, crack runs: ICEQUAKE', {'type': 'cut'}, [{'at': 0.05, 'name': 'sfx/icecrack.wav', 'gain': -6}, Wd('icequake', 'stamp', -11)]),
    ('s20', 'an', 2, 0, 'Antarctica: glacier front, crack runs down, penguins double-take', {'type': 'iris'}, [S(0, 'wind', -16), {'word': 'cracking', 'name': 'sfx/icecrack.wav', 'gain': -7}]),
    ('s21', 'breaking', 1, 0, 'the chunk tips into the sea: CRACK! splash, penguins hop', {'type': 'cut'}, [S(0.2, 'creak', -10), S(1.05, 'crash', -7), S(1.1, 'splash', -7)]),
    ('s22', 'the', 1, 0, 'PAYOFF: underwater, the iceberg sits where the monster was: THE MONSTER = ICE', {'type': 'whipBlur', 'dir': -1}, [S(0, 'swoosh', -13), Wd('ice', 'sparkle', -10), Wd('ice', 'boing', -12, offset=0.2)]),
    ('s23', 'subscribe', 1, 0, 'closer: frame 1 camera, the monster pops back into place -> loop', {'type': 'cut'}, [S(0.8, 'pop', -13), {'at': 0.9, 'name': 'sfx/sweep_3.wav', 'gain': -14}]),
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
