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
    ('s01', None, 0, 'FRAME 1: masked intruder bops before the swiveling metal sheet, VHS look, top caption', None, [S(0, 'sfx/buzz_2.5.wav', -13), S(0, 'sfx/static_0.4.wav', -16)]),
    ('s02', 'in', 0, 'living-room TV shows him; NOV 22, 1987 stamp; TWICE chip', CUT, [S(0, 'stamp', -12), Wd('twice', 'pop', -10)]),
    ('s03', 'the', 0, 'newsroom: sportscaster mid-report, 9 O\'CLOCK NEWS / SPORTS chips', WP, [S(0, 'swoosh', -12), Wd('sports', 'pop', -14)]),
    ('s04', 'and', 0, 'beat... static flash: the picture flips to the intruder, BZZZT', CUT, [Wd('this', 'sfx/static_0.4.wav', -10, offset=-0.15), Wd('this', 'sfx/buzz_1.5.wav', -11, offset=-0.05)]),
    ('s05', 'a', 0, 'close-up: RUBBER MASK + SUNGLASSES callouts', CUT, [Wd('rubber', 'pop', -12), Wd('sunglasses', 'ding', -14)]),
    ('s06', 'dressed', 0, 'viewer double-take, popcorn flies, ??? then !', WP, [S(0, 'swoosh', -13), Wd('character', 'boing', -10), Wd('character', 'pop', -12, offset=0.15)]),
    ('s07', 'behind', 0, 'wide reveal: the background is a swiveling sheet of metal, SHEET METAL callout', CUT, [S(0, 'creak', -14), Wd('metal', 'metal', -12)]),
    ('s08', 'mimicking', 0, 'INSERT versus: FANCY HIGH-TECH vs SHEET OF METAL', CUT, [S(0, 'impact', -10), S(0.05, 'whoosh', -12), Wd('fancy', 'sparkle', -14), Wd('background', 'fail', -14)]),
    ('s09', 'no', 0, 'viewer plugs his ears, BZZZT bursts', WP, [S(0, 'swoosh', -13), Wd('buzz', 'sfx/buzz_1.5.wav', -10, offset=-0.1)]),
    ('s10', 'then', 0, 'control room: engineer slams the FREQUENCY lever, monitors flip back, sweat wipe, GONE', WP, [S(0, 'swoosh', -12), Wd('switched', 'click', -8, offset=0.1), Wd('switched', 'impact', -12, offset=0.2), Wd('vanished', 'sfx/blip.wav', -8), Wd('vanished', 'success', -14, offset=0.25)]),
    ('s11', 'the', 0, 'sportscaster back live; on "so am I": shrug, ???, sweat', FL, [Wd('so', 'boing', -12, offset=0.1)]),
    ('s12', 'but', 0, 'clock whizzes two hours forward, 2 HOURS LATER', IR, [Wd('two', 'clock', -10), Wd('later', 'stamp', -12)]),
    ('s13', 'he', 0, 'late night: sleepy viewer, sci-fi show... then the intruder again, viewer jolts', CUT, [S(0, 'sfx/static_0.4.wav', -14), Wd('doctor', 'sfx/buzz_0.8.wav', -12, offset=0.35), Wd('who', 'gasp', -12, offset=0.25)]),
    ('s14', 'this', 0, 'he is talking now: sound rings, WITH SOUND', CUT, [S(0, 'sfx/buzz_1.5.wav', -16), Wd('sound', 'pop', -12)]),
    ('s15', 'about', 0, 'INSERT counter: ABOUT 90 SEC of bizarre nonsense', CUT, [S(0, 'impact', -10), S(0.05, 'whoosh', -12), S(0.15, 'tick', -16), Wd('nonsense', 'boing', -12)]),
    ('s16', 'and', 0, 'second station staff mash buttons, panic, CAN\'T STOP HIM', WP, [S(0, 'swoosh', -12), S(0.2, 'click', -14), S(0.5, 'click', -14), Wd('stop', 'fail', -12)]),
    ('s17', 'no', 0, 'unattended tower room: empty chair spins, tumbleweed rolls by, NO ENGINEERS ON DUTY', CUT, [S(0, 'wind', -14), Wd('duty', 'stamp', -12)]),
    ('s18', 'fcc', -0.28, 'investigator with a magnifying glass at a corkboard of ? notes', IR, [Wd('fcc', 'paper', -12), Wd('investigated', 'tick', -16)]),
    ('s19', 'to', 0, 'beat of silence: he turns, shrugs, ???, STILL UNSOLVED', CUT, [Wd('day', 'boing', -14, offset=0.4)]),
    ('s20', 'nobody', 0, 'PAYOFF: push in on the mask, WHO?', FL, [S(0, 'sfx/static_0.4.wav', -14), Wd('mask', 'stamp', -10), Wd('mask', 'sfx/buzz_0.8.wav', -15)]),
    ('s21', 'subscribe', 0, 'closer: lands on frame 1 framing (loop)', None, [S(0.0, 'sfx/buzz_1.5.wav', -16)]),
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
