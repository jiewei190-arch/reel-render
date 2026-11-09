"""Captions show numbers/times as digits while the voice says them in words.
   python3 tools/digits.py   (run after kits/sticks/tools/voice.py; rewrites timeline/words.json in place)"""
import json, os
P = os.path.join(os.path.dirname(__file__), '..', 'timeline', 'words.json')
d = json.load(open(P)); W = d['words'] if isinstance(d, dict) else d
out, i = [], 0
while i < len(W):
    w = W[i]
    if w['word'].lower() == 'eleven' and i + 1 < len(W) and W[i + 1]['word'].lower().startswith('fifty'):
        out.append({'word': '11:50' + W[i + 1]['word'][5:], 'start': w['start'], 'end': W[i + 1]['end']}); i += 2; continue
    if w['word'] == 'Three': w = {**w, 'word': '3'}
    out.append(w); i += 1
if isinstance(d, dict): d['words'] = out
else: d = out
json.dump(d, open(P, 'w'), indent=1); print('words:', len(out))
