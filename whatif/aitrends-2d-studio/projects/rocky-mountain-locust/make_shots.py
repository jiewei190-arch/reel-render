"""Build story/shots.json from timeline/words.json: each shot starts LEAD s before its first word (searched in order)."""
import json, re
W = json.load(open('timeline/words.json'))['words']; dur = json.load(open('config.json'))['duration']
norm = lambda x: re.sub(r"[^\w']", "", x.lower())
LEAD = 0.1
plan = [  # (id, first word, transition, sfx)
 ('s01', None, None, [{'at': 0.0, 'name': 'toon3d:wind', 'gain': -14, 'dur': 2.5}, {'at': 0.0, 'name': 'toon3d:rumble', 'gain': -12}, {'word': 'trillion', 'name': 'toon3d:impact', 'gain': -10}]),
 ('s02', 'then', {'type': 'flash', 'dur': 0.15}, [{'at': 0.0, 'name': 'toon3d:whoosh', 'gain': -8}, {'word': 'vanished', 'name': 'toon3d:pop', 'gain': -10}]),
 ('s03', '1875', {'type': 'whipBlur', 'dir': 1}, [{'at': 0.0, 'name': 'toon3d:stamp', 'gain': -6}, {'at': 0.1, 'name': 'toon3d:buzz', 'gain': -16, 'dur': 2.5}, {'word': 'swept', 'name': 'toon3d:whoosh', 'gain': -9}]),
 ('s04', 'one', {'type': 'iris', 'dur': 0.4}, [{'at': 0.0, 'name': 'toon3d:swoosh', 'gain': -10}, {'at': 0.2, 'name': 'toon3d:tick', 'gain': -12}]),
 ('s05', 'bigger', {'type': 'flash', 'dur': 0.15}, [{'at': 0.05, 'name': 'toon3d:drop', 'gain': -9}, {'word': 'california', 'name': 'toon3d:stamp', 'gain': -6, 'offset': 0.25}]),
 ('s06', 'around', {'type': 'whipBlur', 'dir': -1}, [{'at': 0.0, 'name': 'toon3d:buzz', 'gain': -15, 'dur': 2.5}, {'at': 0.1, 'name': 'toon3d:tick', 'gain': -12}, {'word': 'trillion', 'name': 'toon3d:impact', 'gain': -8}]),
 ('s07', 'guinness', {'type': 'iris', 'dur': 0.4}, [{'at': 0.05, 'name': 'toon3d:stamp', 'gain': -7}, {'at': 0.4, 'name': 'toon3d:sparkle', 'gain': -12}, {'word': 'greatest', 'name': 'toon3d:success', 'gain': -12}]),
 ('s08', 'they', {'type': 'whipBlur', 'dir': 1}, [{'at': 0.0, 'name': 'toon3d:scratch', 'gain': -14, 'dur': 2}, {'word': 'crops', 'name': 'toon3d:pop', 'gain': -10}, {'word': 'wood', 'name': 'toon3d:pop', 'gain': -10}, {'word': 'leather', 'name': 'toon3d:pop', 'gain': -10}]),
 ('s09', 'even', {'type': 'flash', 'dur': 0.15}, [{'word': 'clothes', 'name': 'toon3d:stamp', 'gain': -7}, {'at': 1.2, 'name': 'toon3d:squeak', 'gain': -12}]),
 ('s10', 'but', {'type': 'fade', 'dur': 0.3}, [{'at': 0.0, 'name': 'toon3d:clock', 'gain': -10}, {'at': 0.1, 'name': 'toon3d:riser', 'gain': -16}]),
 ('s11', 'they', {'type': 'cut'}, [{'at': 0.0, 'name': 'toon3d:wind', 'gain': -12, 'dur': 2.5}, {'word': 'gone', 'name': 'toon3d:stamp', 'gain': -6}]),
 ('s12', 'the', {'type': 'iris', 'dur': 0.4}, [{'at': 0.05, 'name': 'toon3d:stamp', 'gain': -8}, {'word': '1904', 'name': 'toon3d:stamp', 'gain': -6}]),
 ('s13', 'so', {'type': 'whipBlur', 'dir': 1}, [{'at': 0.1, 'name': 'toon3d:boing', 'gain': -10}, {'word': 'wiped', 'name': 'toon3d:pop', 'gain': -10}]),
 ('s14', 'one', {'type': 'flash', 'dur': 0.15}, [{'at': 0.05, 'name': 'toon3d:stamp', 'gain': -8}, {'word': 'farmers', 'name': 'toon3d:stamp', 'gain': -5}]),
 ('s15', 'their', {'type': 'whipBlur', 'dir': -1}, [{'at': 0.0, 'name': 'toon3d:water', 'gain': -16, 'dur': 2.5}, {'word': 'streams', 'name': 'toon3d:sparkle', 'gain': -12}]),
 ('s16', 'settlers', {'type': 'whipBlur', 'dir': 1}, [{'word': 'plowed', 'name': 'toon3d:scratch', 'gain': -10}, {'word': 'irrigated', 'name': 'toon3d:splash', 'gain': -12}, {'word': 'cattle', 'name': 'toon3d:pop', 'gain': -10}]),
 ('s17', 'and', {'type': 'iris', 'dur': 0.4}, [{'word': 'probably', 'name': 'toon3d:stamp', 'gain': -6}, {'word': 'destroyed', 'name': 'toon3d:crash', 'gain': -14}]),
 ('s18', 'today', {'type': 'fade', 'dur': 0.3}, [{'at': 0.0, 'name': 'toon3d:wind', 'gain': -14, 'dur': 2.5}, {'at': 0.05, 'name': 'toon3d:stamp', 'gain': -9}]),
 ('s19', 'frozen', {'type': 'flash', 'dur': 0.15}, [{'at': 0.0, 'name': 'toon3d:glass', 'gain': -12}, {'word': 'glacier', 'name': 'toon3d:stamp', 'gain': -8}, {'word': 'montana', 'name': 'toon3d:magic', 'gain': -12}]),
]
i, starts = 0, []
for sid, w, tr, sfx in plan:
    if w is None: starts.append(0.0); continue
    if w == 'and':   # the "and" right before "probably"
        while norm(W[i + 1]['word']) != 'probably': i += 1
    while norm(W[i]['word']) != w: i += 1
    starts.append(round(max(0, W[i]['start'] - LEAD), 3)); i += 1
shots = []
for k, (sid, w, tr, sfx) in enumerate(plan):
    s = {'id': sid, 'start': starts[k], 'end': starts[k + 1] if k + 1 < len(plan) else dur, 'sfx': sfx}
    if tr and tr['type'] != 'cut': s['in'] = tr
    shots.append(s)
json.dump({'duration': dur, 'shots': shots}, open('story/shots.json', 'w'), indent=1)
for s in shots: print(s['id'], s['start'], round(s['end'] - s['start'], 2))
