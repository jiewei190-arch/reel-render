"""Build story/shots.json from timeline/words.json: each shot starts at a spoken word (script-aligned Whisper timings).
Usage: python3 make_shots.py   (run after tools/transcribe.py). Prints every shot length (target ~1.0-2.7 s)."""
import json, os, re
D = os.path.dirname(os.path.abspath(__file__))
W = json.load(open(f'{D}/timeline/words.json')); W = W.get('words', W) if isinstance(W, dict) else W
norm = lambda w: re.sub(r"[^\w']", '', w.lower())
# Whisper's VAD can drop the short closer: if the last line's words came back squashed (interpolated, < 0.1 s each),
# re-time them evenly inside that line's window from input/voiceover.lines.json (the TTS knows exactly where it is) and save.
VL = json.load(open(f'{D}/input/voiceover.lines.json'))['lines']; last = VL[-1]; nlast = len(last['text'].split())
tail = W[-nlast:]
if any(w['end'] - w['start'] < 0.1 for w in tail):
    span = (last['end'] - last['start']) / nlast
    for i, w in enumerate(tail): w['start'] = round(last['start'] + i * span, 3); w['end'] = round(last['start'] + (i + 1) * span, 3)
    wj = json.load(open(f'{D}/timeline/words.json')); (wj.__setitem__('words', W) if isinstance(wj, dict) else None)
    json.dump(wj if isinstance(wj, dict) else W, open(f'{D}/timeline/words.json', 'w'), indent=1); print('re-timed the closer from voiceover.lines.json:', [w['word'] for w in tail])
TAIL, LEAD = 0.5, 0.06

def t_of(word, nth=1, after=0.0):
    hits = [w for w in W if w['start'] >= after - 0.01 and norm(w['word']).startswith(norm(word))]
    if len(hits) < nth: raise SystemExit(f'word {word!r} #{nth} not found after {after}')
    return hits[nth - 1]['start']

S = lambda at, name, gain=-12, **k: {'at': at, 'name': f'toon3d:{name}', 'gain': gain, **k}
Wd = lambda word, name, gain=-12, **k: {'word': word, 'name': f'toon3d:{name}', 'gain': gain, **k}
# (id, start word, nth, extra offset, scene note, transition, sfx)
SHOTS = [
    ('s01', None, 1, 0, 'FRAME 1: snow falling, frost creeping over the frog + 2-line top caption', None, [S(0, 'wind', -14), S(0.05, 'sparkle', -14), Wd('freezes', 'glass', -16)]),
    ('s02', 'and', 1, 0, 'x-ray close-up: the heart beats, then stops on "stops"', {'type': 'whipBlur', 'dir': 1}, [S(0, 'heartbeat', -6), Wd('stops', 'stamp', -10), Wd('stops', 'impact', -14)]),
    ('s03', "it's", 1, 0, 'autumn forest floor, the frog hops in, WOOD FROG chip', {'type': 'iris'}, [S(0.1, 'boing', -12), Wd('wood', 'pop', -12)]),
    ('s04', 'only', 1, -0.25, 'Arctic Circle sign: it hops across the line; THE ONLY FROG / THIS FAR NORTH', {'type': 'whipBlur', 'dir': -1}, [S(0, 'swoosh', -12), Wd('only', 'pop', -12), Wd('arctic', 'sparkle', -14), Wd('north', 'boing', -14, nth=2)]),
    ('s05', 'but', 1, 0, 'heavy snow, the frog hunkers down, WINTER chip', {'type': 'whipBlur', 'dir': 1}, [S(0, 'wind', -10), Wd('winter', 'pop', -14)]),
    ('s06', 'up', 1, 0, 'x-ray: ice crystals fill up to 2/3, gauge on the left', {'type': 'cut'}, [Wd('two', 'pop', -12), Wd('ice', 'glass', -12), S(0.3, 'squeak', -18)]),
    ('s07', 'no', 1, 0, 'INSERT 1: vitals monitor flatlines; NO HEARTBEAT / NO BREATHING / NO BLOOD FLOW on the words', {'type': 'cut'}, [S(0, 'beep', -12), Wd('heartbeat', 'stamp', -12), Wd('breathing', 'stamp', -12), Wd('blood', 'stamp', -12), Wd('flow', 'beep', -14, offset=0.25, dur=0.9)]),
    ('s08', 'but', 1, 0, 'the frozen frog in its ice shell, camera orbits, ???', {'type': 'whipBlur', 'dir': 1}, [S(0, 'swoosh', -12), Wd('survive', 'boing', -12)]),
    ('s09', 'liver', 1, -0.3, 'x-ray: the liver lights up, sugar cubes flood the body', {'type': 'cut'}, [Wd('liver', 'magic', -12), Wd('sugar', 'sparkle', -10), Wd('sugar', 'pop', -14)]),
    ('s10', 'that', 1, 0, 'the frog glows with sugar; NATURAL ANTIFREEZE', {'type': 'whipBlur', 'dir': -1}, [S(0, 'swoosh', -12), Wd('antifreeze', 'ding', -12)]),
    ('s11', 'so', 1, 0, 'INSERT 2: cells packed with sugar, ice only in the gaps', {'type': 'cut'}, [S(0, 'impact', -12), S(0.05, 'whoosh', -12), Wd('ice', 'glass', -14), Wd('cells', 'success', -14)]),
    ('s12', 'but', 1, 0, 'Alaska at night under the northern lights, ALASKA', {'type': 'iris'}, [S(0, 'wind', -12), Wd('alaska', 'chime', -10)]),
    ('s13', 'frozen', 1, 0, 'INSERT 3: counter FROZEN FOR UP TO 218 DAYS (about 7 months)', {'type': 'cut'}, [S(0, 'impact', -10), S(0.05, 'whoosh', -12), S(0.15, 'tick', -16), Wd('days', 'ding', -12)]),
    ('s14', 'and', 1, 0, 'day/night flicker: FREEZE / THAW / x2 / x3 (hard cut on the first "again")', {'type': 'whipBlur', 'dir': 1}, [Wd('freeze', 'glass', -12), Wd('thaw', 'water', -14), Wd('again', 'glass', -14), Wd('again', 'water', -14, nth=2)]),
    ('s15', 'then', 1, 0, 'spring: sun, flowers; the frog still in its ice shell', {'type': 'iris'}, [S(0, 'chime', -12), Wd('spring', 'sparkle', -12)]),
    ('s16', 'thaws', 1, -0.25, 'the ice melts, the heart kicks in, eyes pop open: BACK TO LIFE', {'type': 'cut'}, [Wd('thaws', 'water', -12), Wd('life', 'heartbeat', -8, offset=-0.4), Wd('life', 'success', -10)]),
    ('s17', 'hops', 1, -0.7, 'hop, hop, hop to a pond with another wood frog; hearts', {'type': 'whipBlur', 'dir': 1}, [S(0.1, 'boing', -14), S(0.55, 'boing', -14), S(1.0, 'splash', -14), Wd('breed', 'pop', -12)]),
    ('s18', 'like', 1, 0, 'PAYOFF close-up: grin + wink, WINTER? WHAT WINTER?', {'type': 'cut'}, [Wd('never', 'stamp', -10), Wd('never', 'sparkle', -12, offset=0.1)]),
    ('s19', 'subscribe', 1, 0, 'closer: winter again, lands on frame 1 framing (loop)', {'type': 'whipBlur', 'dir': -1}, [S(0, 'wind', -14)]),
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
