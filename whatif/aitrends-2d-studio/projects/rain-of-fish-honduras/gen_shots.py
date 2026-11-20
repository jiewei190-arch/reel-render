"""Build story/shots.json from the tightened VO (input/voiceover.lines.json) + timeline/words.json.
One shot per narration line (line 11 split at "So"); each cut lands 0.1 s before the line starts. Run after transcribe.py."""
import json, os
D = os.path.dirname(os.path.abspath(__file__))
L = json.load(open(f'{D}/input/voiceover.lines.json'))
W = json.load(open(f'{D}/timeline/words.json'))['words']
dur = L['duration']
starts = [l['start'] for l in L['lines']]
so = next(w['start'] for w in W if w['word'].lower().startswith('so') and w['start'] > starts[10])
cuts = [0] + [round(s - 0.1, 2) for s in starts[1:]] + [round(so - 0.08, 2), dur]
lines = [x.strip() for x in open(f'{D}/input/script.txt') if x.strip()]
text = lines[:10] + ['Nobody has confirmed how they get there.', 'So Yoro waits for the next storm.']
SFX = {
  's01': [{'at': 0.0, 'name': 'toon3d:rain', 'gain': -14}, {'at': 0.45, 'name': 'toon3d:ding', 'gain': -14}, {'word': 'fish.', 'name': 'toon3d:splash', 'gain': -12}, {'word': 'Every', 'name': 'toon3d:impact', 'gain': -12}],
  's02': [{'at': 0.0, 'name': 'toon3d:whoosh', 'gain': -11}, {'at': 0.05, 'name': 'toon3d:stamp', 'gain': -9}, {'word': 'Locals', 'name': 'toon3d:impact', 'gain': -10}, {'word': 'rain', 'name': 'toon3d:pop', 'gain': -12}],
  's03': [{'at': 0.0, 'name': 'toon3d:wind', 'gain': -12}, {'word': 'rainy', 'name': 'toon3d:stamp', 'gain': -10}, {'word': 'storm', 'name': 'toon3d:thunder', 'gain': -7}, {'word': 'storm', 'offset': 0.3, 'name': 'toon3d:rain', 'gain': -12}],
  's04': [{'at': 0.0, 'name': 'toon3d:chime', 'gain': -14}, {'word': 'fish', 'name': 'toon3d:splash', 'gain': -11}, {'word': 'ground.', 'name': 'toon3d:stamp', 'gain': -10}],
  's05': [{'at': 0.0, 'name': 'toon3d:swoosh', 'gain': -12}, {'word': 'over', 'name': 'toon3d:impact', 'gain': -10}, {'word': 'years.', 'name': 'toon3d:ding', 'gain': -13}],
  's06': [{'at': 0.0, 'name': 'toon3d:crowd', 'gain': -14}, {'at': 0.05, 'name': 'toon3d:stamp', 'gain': -9}, {'word': 'festival', 'name': 'toon3d:stamp', 'gain': -9}, {'word': 'parade.', 'name': 'toon3d:horn', 'gain': -15}],
  's07': [{'at': 0.0, 'name': 'toon3d:rain', 'gain': -14}, {'at': 0.05, 'name': 'toon3d:suspense', 'gain': -12}, {'word': 'appear', 'name': 'toon3d:boing', 'gain': -13}, {'word': 'fall', 'name': 'toon3d:whoosh', 'gain': -11}],
  's08': [{'at': 0.0, 'name': 'toon3d:paper', 'gain': -10}, {'word': 'waterspouts.', 'name': 'toon3d:wind', 'gain': -12}, {'word': 'miles', 'name': 'toon3d:stamp', 'gain': -9}],
  's09': [{'at': 0.0, 'name': 'toon3d:paper', 'gain': -10}, {'word': 'underground,', 'name': 'toon3d:water', 'gain': -12}, {'word': 'wash', 'name': 'toon3d:splash', 'gain': -11}],
  's10': [{'at': 0.0, 'name': 'toon3d:magic', 'gain': -13}, {'at': 0.1, 'name': 'toon3d:stamp', 'gain': -10}, {'word': 'prayed', 'name': 'toon3d:rumble', 'gain': -13}, {'word': 'fell.', 'name': 'toon3d:sparkle', 'gain': -11}],
  's11': [{'at': 0.0, 'name': 'toon3d:swoosh', 'gain': -12}, {'word': 'confirmed', 'name': 'toon3d:stamp', 'gain': -8}],
  's12': [{'at': 0.0, 'name': 'toon3d:wind', 'gain': -13}, {'word': 'storm.', 'name': 'toon3d:thunder', 'gain': -8}, {'word': 'storm.', 'offset': 0.2, 'name': 'toon3d:rain', 'gain': -12}],
}
IN = {'s02': {'type': 'whipBlur', 'dir': 1}, 's03': {'type': 'fade', 'dur': 0.2}, 's04': {'type': 'flash', 'dur': 0.2}, 's05': {'type': 'whipBlur', 'dir': -1},
      's06': {'type': 'whipBlur', 'dir': 1}, 's07': {'type': 'cut'}, 's08': {'type': 'whipBlur', 'dir': 1}, 's09': {'type': 'whipBlur', 'dir': -1},
      's10': {'type': 'fade', 'dur': 0.25}, 's11': {'type': 'whipBlur', 'dir': 1}, 's12': {'type': 'cut'}}
shots = []
for i in range(12):
    sid = f's{i + 1:02d}'; s = {'id': sid, 'start': cuts[i], 'end': cuts[i + 1], 'line': text[i]}
    if sid in IN: s['in'] = IN[sid]
    s['sfx'] = SFX[sid]; shots.append(s)
json.dump({'duration': dur, 'shots': shots}, open(f'{D}/story/shots.json', 'w'), indent=1)
cfg = json.load(open(f'{D}/config.json')); cfg['duration'] = dur; json.dump(cfg, open(f'{D}/config.json', 'w'), indent=1)
for s in shots: print(s['id'], s['start'], s['end'], round(s['end'] - s['start'], 2), s['line'])
