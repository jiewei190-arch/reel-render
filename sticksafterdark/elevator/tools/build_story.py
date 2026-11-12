"""Builds story/shots.json + story/captions.json for 'Elevator' from timeline/words.json.
Captions: 1-3 words, punch words alone, numbers shown as digits (the voice says them in words)."""
import json, os, re, sys
P = os.path.join(os.path.dirname(__file__), '..', 'project')
W = json.load(open(os.path.join(P, 'timeline/words.json')))['words']
import wave
with wave.open(os.path.join(P, 'input/voiceover.wav')) as w: DUR = round(w.getnframes() / w.getframerate(), 3)

# ---------- captions
DIG = {'ninth': '9th', 'eight,': '8,', 'seven,': '7,', 'six.': '6.', 'five.': '5.', 'four.': '4.'}
# explicit group sizes per sentence start word index (otherwise: break on punctuation / 3 words)
words = [dict(w, word=DIG.get(w['word'].lower(), w['word'])) for w in W]
def norm(s): return re.sub(r"[^\w']", '', s.lower())
SPLITS = {  # sentence first words -> group sizes
    'last night i got': [2, 3, 2, 2, 2, 2, 1],        # ... | 9th floor | and pressed | lobby.
    'someone had gotten': [1, 3, 3],                   # Someone | had gotten on | at every floor.
    'the cable groaned': [3, 3, 2, 3],
    'i stared at my': [2, 3, 3, 2, 3],
    'i glanced back at': [3, 3, 2, 2],
    'the doors opened and': [3, 4],
    'nobody there': [2],
    'the elevator got': [2, 2],
    'i figured it': [2, 3],
}
PUNCH = {'heavier', 'nobody', 'lobby'}
groups, i = [], 0
while i < len(words):
    # sentence = until word ending with .?!
    j = i
    while j < len(words) and not re.search(r'[.?!]$', words[j]['word']): j += 1
    sent = words[i:j + 1]; key = ' '.join(norm(w['word']) for w in sent[:4])
    sizes = next((v for k, v in SPLITS.items() if key.startswith(k)), None)
    if sizes:
        k = 0
        for n in sizes:
            if k >= len(sent): break
            groups.append(sent[k:k + n]); k += n
        if k < len(sent): groups.append(sent[k:])
    else:
        cur = []
        for idx, w in enumerate(sent):
            if norm(w['word']) in PUNCH and len(sent) > 1:
                if cur: groups.append(cur); cur = []
                groups.append([w]); continue
            cur.append(w)
            if re.search(r'[,;:]$', w['word']) or len(cur) >= 3: groups.append(cur); cur = []
        if cur: groups.append(cur)
    i = j + 1
caps = []
for gi, gw in enumerate(groups):
    nxt = groups[gi + 1][0]['start'] if gi + 1 < len(groups) else 1e9
    end = min(nxt - 0.02, gw[-1]['end'] + 0.35)
    txt = ' '.join(w['word'] for w in gw)
    if txt.lower().startswith('follow'): continue      # end card carries it
    caps.append({'start': round(gw[0]['start'] - 0.04, 3), 'end': round(end, 3), 'text': txt})
json.dump(caps, open(os.path.join(P, 'story/captions.json'), 'w'), indent=1)

# ---------- shots
def wt(word, after=0):
    for w in W:
        if w['start'] >= after - 0.05 and norm(w['word']).startswith(norm(word)): return w['start']
    raise SystemExit('word not found: ' + word)
A = 'roomtone'
cuts = [  # id, start, line, sfx
 ('s01', 0.0, 'I work late.', [{'at': 0.0, 'name': 'hum', 'gain': -24, 'dur': 2.0}, {'at': 0.2, 'name': 'whoosh', 'gain': -30, 'pitch': 0.5}]),
 ('s02', 1.90, "Most nights, I'm the last one out.", []),
 ('s03', 4.55, 'Last night, I got in the elevator', [{'at': 0.6, 'name': 'footstep', 'gain': -26}, {'at': 1.1, 'name': 'footstep', 'gain': -27}]),
 ('s04', 6.70, 'on the ninth floor', [{'at': 0.15, 'name': 'tick', 'gain': -24, 'pitch': 0.6}]),
 ('s05', 7.80, 'and pressed lobby.', [{'at': 0.35, 'name': 'tick', 'gain': -18, 'pitch': 0.9}]),
 ('s06', 9.40, 'On eight, it stopped.', [{'at': 0.25, 'name': 'tick', 'gain': -22, 'pitch': 0.6}, {'at': 0.6, 'name': 'impact', 'gain': -18, 'pitch': 0.5}]),
 ('s07', 11.05, 'The doors opened.', [{'at': 0.1, 'name': 'whoosh', 'gain': -24, 'pitch': 0.45}]),
 ('s08', 12.90, 'Nobody there.', []),
 ('s09', 14.40, 'Just a dark hallway.', [{'at': 0.2, 'name': 'wind', 'gain': -30, 'dur': 1.8}]),
 ('s10', 16.45, 'The doors closed.', [{'at': 0.1, 'name': 'whoosh', 'gain': -24, 'pitch': 0.4}, {'at': 1.4, 'name': 'impact', 'gain': -22, 'pitch': 0.6}]),
 ('s11', 18.30, 'On seven, it stopped again.', [{'at': 0.25, 'name': 'tick', 'gain': -22, 'pitch': 0.6}, {'at': 0.6, 'name': 'impact', 'gain': -18, 'pitch': 0.5}, {'at': 0.9, 'name': 'whoosh', 'gain': -26, 'pitch': 0.45}]),
 ('s12', 20.35, 'Nobody.', []),
 ('s13', 21.95, 'Six.', [{'at': 0.0, 'name': 'whoosh', 'gain': -26, 'pitch': 0.45}]),
 ('s14', 23.10, 'Five.', [{'at': 0.0, 'name': 'whoosh', 'gain': -26, 'pitch': 0.42}]),
 ('s15', 24.30, 'Four.', [{'at': 0.0, 'name': 'whoosh', 'gain': -26, 'pitch': 0.4}]),
 ('s16', 25.65, 'Every floor, the doors opened.', [{'at': 0.3, 'name': 'whoosh', 'gain': -26, 'pitch': 0.42}]),
 ('s17', 27.90, 'Every floor, nobody got on.', []),
 ('s18', 30.35, 'I figured it was broken.', []),
 ('s19', 32.55, 'I stared at my phone', []),
 ('s20', 34.25, 'and tried not to look into the hallways.', [{'at': 0.0, 'name': 'whoosh', 'gain': -28, 'pitch': 0.4}]),
 ('s21', 36.80, 'The light flickered.', [{'at': 0.0, 'name': 'buzz', 'gain': -20, 'dur': 1.8}]),
 ('s22', 38.60, 'The elevator got slower.', []),
 ('s23', 40.65, 'Heavier.', [{'at': 0.05, 'name': 'impact', 'gain': -14, 'pitch': 0.35}, {'at': 0.1, 'name': 'buzz', 'gain': -22, 'dur': 1.0}]),
 ('s24', 42.10, 'The cable groaned,', [{'at': 0.5, 'name': 'riser', 'gain': -26, 'pitch': 0.3, 'dur': 1.6}]),
 ('s25', 43.95, 'like it was carrying more than just me.', [{'at': 1.6, 'name': 'heartbeat', 'gain': -24, 'dur': 1.0}]),
 ('s26', 46.75, 'Lobby.', [{'at': 0.1, 'name': 'clock', 'gain': -16, 'pitch': 1.6}]),
 ('s27', 47.95, 'The doors opened, and I stepped out.', [{'at': 0.05, 'name': 'whoosh', 'gain': -26, 'pitch': 0.45}, {'at': 1.2, 'name': 'footstep', 'gain': -24}, {'at': 1.7, 'name': 'footstep', 'gain': -25}]),
 ('s28', 50.05, '(held beat on my back)', [{'at': 0.2, 'name': 'footstep', 'gain': -26}, {'at': 0.75, 'name': 'footstep', 'gain': -27}]),
 ('s29', 51.15, 'Behind me, the doors started to close.', [{'at': 0.6, 'name': 'whoosh', 'gain': -26, 'pitch': 0.35}]),
 ('s30', 54.15, 'I glanced back', []),
 ('s31', 55.15, 'at the mirror on the elevator wall.', []),
 ('s32', 56.95, '(held silent beat, 2.4 s)', [{'at': 0.6, 'name': 'heartbeat', 'gain': -22, 'dur': 1.0}, {'at': 1.5, 'name': 'heartbeat', 'gain': -23, 'dur': 1.0}]),
 ('s33', 59.25, 'Someone had gotten on at every floor.', 'TWIST'),
 ('s34', 0, 'Follow for more.', []),
]
T_SOME = wt('Someone', 58)
T_FOLLOW = wt('Follow', 62)
END = round(T_FOLLOW - 0.2, 2)
cuts[-1] = ('s34', END, 'Follow for more.', [])
cuts[-2] = ('s33', round(T_SOME - 0.03, 2), cuts[-2][2], [
    {'at': 0.1, 'name': 'stinger', 'gain': -4, 'dur': 3.0},
    {'at': 2.4, 'name': 'impact', 'gain': -12, 'pitch': 0.5},
    {'at': 3.05, 'name': 'clock', 'gain': -22, 'pitch': 1.6}])
cuts[-3] = ('s32', cuts[-3][1], cuts[-3][2], cuts[-3][3])
shots = []
for i, (sid, st, line, sfx) in enumerate(cuts):
    en = cuts[i + 1][1] if i + 1 < len(cuts) else DUR
    s = {'id': sid, 'start': round(st, 2), 'end': round(en, 2), 'in': {'type': 'cut'}, 'line': line}
    if sid != 's34':
        quiet = sid in ('s32', 's33')
        s['amb'] = {'name': A, 'gain': -26 if quiet else -22}
    if sfx: s['sfx'] = sfx
    if sid == 's33': s['jitter'] = [round(T_SOME + 0.1, 3)]
    if sid == 's34': s['captions'] = False
    shots.append(s)
for a, b in zip(shots, shots[1:]): assert a['end'] == b['start'] and a['end'] > a['start'], (a, b)
story = {'title': 'Sticks After Dark 6 Elevator', 'duration': DUR, 'shots': shots,
         'music': [{'start': 0, 'end': END, 'mood': 'dark', 'intensity': 0.22}]}
json.dump(story, open(os.path.join(P, 'story/shots.json'), 'w'), indent=1)
print('duration', DUR, 'shots', len(shots), 'end card at', END)
for s in shots: print(s['id'], s['start'], s['end'], round(s['end'] - s['start'], 2), s['line'])
print(len(caps), 'captions'); [print(c) for c in caps]
