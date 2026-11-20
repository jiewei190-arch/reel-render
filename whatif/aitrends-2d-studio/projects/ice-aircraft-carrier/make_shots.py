"""Write story/shots.json from input/voiceover.lines.json: one shot per narration line (s01..s11), cut ~0.12 s before each
line starts; transitions + SFX per shot. Usage: python make_shots.py"""
import json, os
D = os.path.dirname(os.path.abspath(__file__))
L = json.load(open(f'{D}/input/voiceover.lines.json')); lines = L['lines']; dur = round(L['duration'] + 0.35, 2)
IN = {2: {'type': 'whipBlur', 'dir': 1}, 3: {'type': 'iris', 'dur': 0.45}, 5: {'type': 'whipBlur', 'dir': -1}, 6: {'type': 'iris', 'dur': 0.4},
      8: {'type': 'whipBlur', 'dir': 1}, 9: {'type': 'whipBlur', 'dir': -1}, 10: {'type': 'whipBlur', 'dir': 1}, 11: {'type': 'iris', 'dur': 0.45}}
SFX = {
 1: [{'at': 0.0, 'name': 'toon3d:engine', 'gain': -14, 'dur': 2.0}, {'at': 0.05, 'name': 'toon3d:sparkle', 'gain': -13}, {'word': 'ice.', 'name': 'toon3d:glass', 'gain': -14}, {'at': 2.1, 'name': 'toon3d:boing', 'gain': -14}],
 2: [{'at': 0.0, 'name': 'toon3d:swoosh', 'gain': -10}, {'at': 0.05, 'name': 'toon3d:stamp', 'gain': -8}, {'word': 'U-boats', 'name': 'toon3d:splash', 'gain': -12}, {'word': 'planes', 'name': 'toon3d:paper', 'gain': -10}, {'word': 'reach.', 'name': 'toon3d:buzz', 'gain': -16}],
 3: [{'at': 0.1, 'name': 'toon3d:stamp', 'gain': -8}, {'word': 'fix:', 'name': 'toon3d:ding', 'gain': -10}, {'word': 'floating', 'name': 'toon3d:pop', 'gain': -11}],
 4: [{'at': 0.1, 'name': 'toon3d:fail', 'gain': -13}, {'word': 'Pykrete:', 'name': 'toon3d:stamp', 'gain': -8}, {'word': 'wood', 'name': 'toon3d:pop', 'gain': -12}, {'word': 'frozen.', 'name': 'toon3d:glass', 'gain': -12}],
 5: [{'at': 0.05, 'name': 'toon3d:stamp', 'gain': -8}, {'word': '600', 'name': 'toon3d:slide', 'gain': -12}, {'word': 'biggest', 'name': 'toon3d:horn', 'gain': -14}],
 6: [{'word': "here's", 'name': 'toon3d:suspense', 'gain': -16}, {'word': '1943', 'name': 'toon3d:stamp', 'gain': -8}, {'word': 'reportedly', 'name': 'toon3d:click', 'gain': -10}, {'word': 'block', 'name': 'toon3d:gunshot', 'gain': -17}],
 7: [{'at': 0.1, 'name': 'toon3d:zap', 'gain': -12}, {'word': 'ricocheted', 'name': 'toon3d:zap', 'gain': -12}, {'word': 'around', 'name': 'toon3d:zap', 'gain': -13}, {'word': 'room.', 'name': 'toon3d:crash', 'gain': -16}],
 8: [{'at': 0.0, 'name': 'toon3d:wind', 'gain': -20, 'dur': 2}, {'word': 'Patricia', 'name': 'toon3d:stamp', 'gain': -9}, {'word': 'one-horsepower', 'name': 'toon3d:engine', 'gain': -16, 'dur': 1.5}],
 9: [{'word': 'ballooned,', 'name': 'toon3d:cash', 'gain': -11}, {'word': 'longer-range', 'name': 'toon3d:whoosh', 'gain': -10}, {'word': 'closed', 'name': 'toon3d:stamp', 'gain': -8}],
 10: [{'at': 0.0, 'name': 'toon3d:paper', 'gain': -11}, {'word': 'shelved.', 'name': 'toon3d:stamp', 'gain': -6}],
 11: [{'word': 'never', 'name': 'toon3d:stamp', 'gain': -8}, {'word': 'prototype', 'name': 'toon3d:tick', 'gain': -14}, {'word': 'melt.', 'name': 'toon3d:water', 'gain': -14}],
}
shots = []
for i, l in enumerate(lines):
    n = i + 1; st = 0.0 if i == 0 else round(l['start'] - 0.12, 2); en = dur if n == len(lines) else round(lines[i + 1]['start'] - 0.12, 2)
    s = {'id': f's{n:02d}', 'start': st, 'end': en, 'line': l['text']}
    if n in IN: s['in'] = IN[n]
    s['sfx'] = SFX.get(n, []); shots.append(s)
json.dump({'duration': dur, 'shots': shots}, open(f'{D}/story/shots.json', 'w'), indent=1)
cfg = json.load(open(f'{D}/config.json')); cfg['duration'] = dur; json.dump(cfg, open(f'{D}/config.json', 'w'), indent=1)
print(dur, [(s['id'], s['start'], round(s['end'] - s['start'], 2)) for s in shots])
