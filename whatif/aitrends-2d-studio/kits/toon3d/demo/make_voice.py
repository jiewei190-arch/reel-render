"""Builds the FX demo narration from three lines of the emu-war Short's own voiceover (no new TTS) and re-times its words.
   python3 kits/toon3d/demo/make_voice.py   (from whatif/aitrends-2d-studio)
   -> kits/toon3d/demo/project/input/voiceover.wav + timeline/words.json"""
import json, os, subprocess
HERE = os.path.dirname(os.path.abspath(__file__))
EMU = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..', '..', 'iawaken', 'shorts', 'emu-war', 'project'))
OUT = os.path.join(HERE, 'project')
# (source start, source end, place at) in seconds
CLIPS = [(10.40, 14.72, 0.25), (17.70, 19.72, 5.15), (29.84, 33.00, 10.35)]
TOTAL = 16.6
words = json.load(open(os.path.join(EMU, 'timeline', 'words.json')))['words']
inputs, filt, out = [], [], []
for i, (a, b, at) in enumerate(CLIPS):
    inputs += ['-ss', f'{a}', '-to', f'{b}', '-i', os.path.join(EMU, 'input', 'voiceover.wav')]
    f = 0.012
    filt.append(f'[{i}:a]afade=t=in:d={f},afade=t=out:st={b - a - f}:d={f},adelay={int(at * 1000)}[v{i}]')
    out += [{'word': w['word'], 'start': round(w['start'] - a + at, 3), 'end': round(min(w['end'], b) - a + at, 3)} for w in words if w['start'] >= a - 0.01 and w['start'] < b]
filt.append(''.join(f'[v{i}]' for i in range(len(CLIPS))) + f'amix=inputs={len(CLIPS)}:normalize=0,apad=whole_dur={TOTAL}[o]')
subprocess.run(['ffmpeg', '-y', '-v', 'error', *inputs, '-filter_complex', ';'.join(filt), '-map', '[o]', '-t', str(TOTAL), '-ar', '24000', '-ac', '1', os.path.join(OUT, 'input', 'voiceover.wav')], check=True)
json.dump({'source': 'three lines sliced from iawaken/shorts/emu-war voiceover (kits/toon3d/demo/make_voice.py)', 'words': out}, open(os.path.join(OUT, 'timeline', 'words.json'), 'w'), indent=1)
open(os.path.join(OUT, 'input', 'script.txt'), 'w').write(' '.join(w['word'] for w in out) + '\n')
print(len(out), 'words;', ' '.join(f"{w['word']}@{w['start']}" for w in out))
