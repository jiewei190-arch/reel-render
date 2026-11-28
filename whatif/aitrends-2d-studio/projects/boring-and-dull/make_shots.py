"""Build story/shots.json from timeline/words.json: each shot starts at a spoken word (script-aligned Whisper timings).
Usage: python3 make_shots.py   (run after tools/transcribe.py). Prints every shot length."""
import json, os, re
D = os.path.dirname(os.path.abspath(__file__))
W = json.load(open(f'{D}/timeline/words.json')); W = W.get('words', W) if isinstance(W, dict) else W
norm = lambda w: re.sub(r"[^\w']", '', w.lower())
TAIL, LEAD = 0.5, 0.06
def t_of(word, nth=1, after=0.0):
    hits = [w for w in W if w['start'] >= after - 0.01 and norm(w['word']) == norm(word)]
    if len(hits) < nth: raise SystemExit(f'word {word!r} #{nth} not found after {after}')
    return hits[nth - 1]['start']
S = lambda at, name, gain=-12, **k: {'at': at, 'name': name if '/' in name else f'toon3d:{name}', 'gain': gain, **k}
Wd = lambda word, name, gain=-12, **k: {'word': word, 'name': name if '/' in name else f'toon3d:{name}', 'gain': gain, **k}
WP, FL, CUT, IR = {'type': 'whipBlur', 'dir': 1}, {'type': 'flash'}, {'type': 'cut'}, {'type': 'iris'}
SHOTS = [
    ('s01', None, 0, 'FRAME 1: Boring mid-yawn, Dull catches it; top caption', None, [S(0, 'sfx/yawn_a.wav', -9), S(1.0, 'sfx/yawn_b.wav', -12)]),
    ('s02', 'teamed', 0, 'closer on Dull yawning, TEAMED UP chip', CUT, [Wd('dull', 'pop', -12)]),
    ('s03', 'these', 0, 'INSERT map: BORING, OREGON ... DULL, SCOTLAND', WP, [S(0, 'whoosh', -10), S(0.05, 'impact', -14), Wd('oregon', 'pop', -12)]),
    ('s04', 'its', 0, 'motto banner over the Boring sign; its eyelids sink; chirp chirp', CUT, [Wd('exciting', 'sfx/cricket.wav', -10, offset=0.4)]),
    ('s05', 'dull', 0, 'the village of Dull: hills, cottages, sheep, SCOTLAND', WP, [S(0, 'swoosh', -12), S(0.4, 'wind', -18)]),
    ('s06', 'population', 0, 'INSERT counter: ~84 POPULATION OF DULL', CUT, [S(0, 'impact', -10), S(0.05, 'whoosh', -12), S(0.15, 'tick', -16)]),
    ('s07', 'in', 0, 'cyclist pedals along the Oregon road, 2012 stamp, CYCLING HOLIDAY', WP, [S(0, 'swoosh', -12), Wd('2012', 'stamp', -12), Wd('cycling', 'squeak', -16)]),
    ('s08', 'rode', 0, 'she brakes, looks up at the yawning signs... lightbulb', CUT, [S(0.3, 'squeak', -14), Wd('idea', 'ding', -8)]),
    ('s09', "boring's", 0, 'the planning-group meeting, 38 MEMBERS, one asleep', IR, [S(0, 'sfx/cricket.wav', -18), S(0.3, 'clock', -18)]),
    ('s10', 'unanimous', 0, 'every hand goes up, slowly; UNANIMOUS AYE', CUT, [S(0.3, 'slide', -14), S(0.6, 'stamp', -12)]),
    ('s11', 'boring', 0, 'the "ceremony": signs lean together under A PAIR FOR THE AGES; 3 confetti; limp kazoo', FL, [Wd('pair', 'sfx/kazoo_fanfare.wav', -10, offset=0.25)]),
    ('s12', 'but', 0, 'party: party hats, two balloons sag; PARTY!', WP, [Wd('party', 'pop', -10), Wd('party', 'sfx/yawn_b.wav', -12, offset=0.3)]),
    ('s13', 'boring', 0, 'calendar page AUGUST 9', CUT, [S(0, 'paper', -10), Wd('august', 'stamp', -10)]),
    ('s14', 'yes', 0, 'a bagpiper marches past; the signs wake for a second... then droop', CUT, [S(0.1, 'boing', -12), S(0.3, 'horn', -20)]),
    ('s15', 'then', 0, 'a third sign slides in, 2013', WP, [Wd('third', 'whoosh', -8), Wd('2013', 'stamp', -12)]),
    ('s16', 'bland', 0, 'Bland in the outback, yawning, AUSTRALIA', CUT, [S(0, 'wind', -16), Wd('australia', 'sfx/yawn_a.wav', -12)]),
    ('s17', 'together', 0, 'superhero moment: capes, god rays, LEAGUE OF EXTRAORDINARY COMMUNITIES', FL, [S(0, 'riser', -12), Wd('league', 'impact', -8), Wd('extraordinary', 'sparkle', -12)]),
    ('s18', 'also', 0, 'dramatic beat: capes slow, eyelids sink', CUT, [S(0.2, 'suspense', -16)]),
    ('s19', 'the', 0, 'PAYOFF: all three asleep, snoring, TRINITY OF TEDIUM', CUT, [S(0, 'sfx/snore.wav', -10), Wd('tedium', 'stamp', -10)]),
    ('s20', 'subscribe', 0, 'closer: back to frame 1 framing, Boring starts its yawn -> loop', WP, [S(0, 'swoosh', -14), S(0.6, 'sfx/yawn_a.wav', -14)]),
]
dur = round(W[-1]['end'] + TAIL, 3)
starts, prev = [], 0.0
for sid, word, off, *_ in SHOTS:
    t = 0.0 if word is None else t_of(word, 1, prev) - LEAD + off
    starts.append(round(max(0.0, t), 3)); prev = t + 0.05 + LEAD
out = []
for i, (sid, word, off, scene, tr, sfx) in enumerate(SHOTS):
    st, en = starts[i], (starts[i + 1] if i + 1 < len(SHOTS) else dur)
    line = ' '.join(w['word'] for w in W if st - 0.01 <= w['start'] < en - 0.01)
    sh = {'id': sid, 'start': st, 'end': round(en, 3), 'line': line, 'scene': scene}
    if tr: sh['in'] = tr
    sh['sfx'] = sfx; out.append(sh)
json.dump({'duration': dur, 'generated_from': 'make_shots.py + timeline/words.json', 'shots': out}, open(f'{D}/story/shots.json', 'w'), indent=1)
cfg = json.load(open(f'{D}/config.json')); cfg['duration'] = dur; json.dump(cfg, open(f'{D}/config.json', 'w'), indent=1)
print(f'duration {dur:.2f} s, {len(out)} shots')
for s in out:
    d = s['end'] - s['start']; print(f"  {s['id']}  {s['start']:6.2f}-{s['end']:6.2f}  {d:4.2f}s  {s['line'][:62]}{'   <-- check' if not 0.9 <= d <= 3.2 else ''}")
