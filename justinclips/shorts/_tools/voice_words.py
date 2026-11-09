"""Fenrir voice + caption word timings for a Justin clips Short.
Usage: python3 voice_words.py script.md project_dir [--gap 0.3 --comma 0.15 --beat 0.75 --lead 0.15]
script.md: numbered lines are spoken; a '## beat' line adds a beat of silence (BEAT instead of GAP) before the next line.
Inline {spoken|caption} pairs: spoken text goes to TTS, caption text goes to words.json (e.g. {eighteen seventy-six|1876}).
Writes project/input/voiceover.wav, input/script.txt (caption text), timeline/words.json, timeline/segments.json.
Word timings: faster-whisper word timestamps (base.en) matched to the script words; unmatched words are interpolated
inside their TTS sentence segment."""
import re, sys, json, os, difflib
import numpy as np, soundfile as sf
args = sys.argv[1:]
def opt(n, d):
    if n in args: i = args.index(n); v = float(args[i + 1]); del args[i:i + 2]; return v
    return d
GAP, COMMA, BEAT, LEAD = opt('--gap', 0.3), opt('--comma', 0.15), opt('--beat', 0.75), opt('--lead', 0.15)
src, proj = args[0], args[1]
from kokoro_onnx import Kokoro
TTS = '/home/user/reel-render/tts/'
k = Kokoro(TTS + 'kokoro-v1.0.onnx', TTS + 'voices-v1.0.bin'); SR = 24000
PAIR = re.compile(r'\{([^|}]+)\|([^}]+)\}')
pieces, segs, cur, pend_beat = [np.zeros(int(SR * LEAD), np.float32)], [], LEAD, False
def add(a):
    global cur; pieces.append(a); cur += len(a) / SR
for raw in open(src, encoding='utf-8'):
    line = raw.strip()
    if line.startswith('## beat'):
        pend_beat = True; continue
    m = re.match(r'^\d+[a-z]?\.\s+(.*)', line)
    if not m: continue
    text = m.group(1).replace('**', '')
    if pend_beat and segs: add(np.zeros(int(SR * (BEAT - GAP)), np.float32))
    pend_beat = False
    for sent in re.split(r'(?<=[.!?…])\s+(?=[A-Z{])', text):
        if not sent.strip(): continue
        spoken = PAIR.sub(lambda m: m.group(1), sent); cap = PAIR.sub(lambda m: m.group(2), sent)
        a, _ = k.create(spoken, voice='am_fenrir', speed=0.95, lang='en-us'); a = a.astype(np.float32)
        # trim leading/trailing near-silence so segment bounds are real speech
        e = np.abs(a) > 0.01; i0 = max(0, np.argmax(e) - int(0.02 * SR)); i1 = min(len(a), len(a) - np.argmax(e[::-1]) + int(0.04 * SR)); a = a[i0:i1]
        segs.append({'start': round(cur, 3), 'end': round(cur + len(a) / SR, 3), 'spoken': spoken, 'caption': cap}); add(a)
        add(np.zeros(int(SR * (GAP if re.search(r'[.!?…]["”]?$', sent) else COMMA)), np.float32))
y = np.concatenate(pieces); y = y / np.abs(y).max() * 0.89
os.makedirs(proj + '/input', exist_ok=True); os.makedirs(proj + '/timeline', exist_ok=True)
sf.write(proj + '/input/voiceover.wav', y, SR, subtype='PCM_16')
open(proj + '/input/script.txt', 'w').write('\n'.join(s['caption'] for s in segs) + '\n')
# whisper
from faster_whisper import WhisperModel
wm = WhisperModel('base.en', device='cpu', compute_type='int8')
res, _ = wm.transcribe(y.astype(np.float32) if SR == 16000 else np.interp(np.arange(0, len(y), SR / 16000), np.arange(len(y)), y).astype(np.float32), word_timestamps=True, language='en')
ww = [w for s in res for w in s.words]
norm = lambda s: re.sub(r'[^a-z0-9]', '', s.lower())
toks = []
for raw in open(src, encoding='utf-8'):
    m = re.match(r'^\d+[a-z]?\.\s+(.*)', raw.strip())
    if not m: continue
    for sent in re.split(r'(?<=[.!?…])\s+(?=[A-Z{])', m.group(1).replace('**', '')):
        if not sent.strip(): continue
        tk = []
        for mm in re.finditer(r'\{([^|}]+)\|([^}]+)\}(\S*)|(\S+)', sent):
            if mm.group(4): tk.append((mm.group(4), [mm.group(4)]))
            else: tk.append((mm.group(2) + mm.group(3), mm.group(1).split()[:-1] + [mm.group(1).split()[-1] + mm.group(3)]))
        toks.append(tk)
assert len(toks) == len(segs)
flat = [(si, ti, sw) for si, tk in enumerate(toks) for ti, (c, sws) in enumerate(tk) for sw in sws]
A = [norm(f[2]) for f in flat]; B = [norm(w.word) for w in ww]
sm = difflib.SequenceMatcher(a=A, b=B, autojunk=False); hit = {}
for blk in sm.get_matching_blocks():
    for j in range(blk.size): hit[blk.a + j] = ww[blk.b + j]
print(f'whisper matched {len(hit)}/{len(A)} spoken words')
st = [None] * len(flat); en = [None] * len(flat)
for i in range(len(flat)):
    if i in hit: st[i], en[i] = hit[i].start, hit[i].end
# interpolate unmatched inside their segment
for si, s in enumerate(segs):
    idx = [i for i, f in enumerate(flat) if f[0] == si]
    known = [(i, st[i], en[i]) for i in idx if st[i] is not None and s['start'] - 0.15 <= st[i] <= s['end'] + 0.15]
    for i in idx:
        if st[i] is not None and any(i == q[0] for q in known): continue
        prev = [q for q in known if q[0] < i]; nxt = [q for q in known if q[0] > i]
        a = prev[-1][2] if prev else s['start']; b = nxt[0][1] if nxt else s['end']
        lo = prev[-1][0] if prev else idx[0] - 1; hi = nxt[0][0] if nxt else idx[-1] + 1
        n = hi - lo - 1; kk = i - lo - 1
        st[i] = a + (b - a) * kk / max(n, 1); en[i] = a + (b - a) * (kk + 1) / max(n, 1)
    for i in idx: st[i] = max(st[i], s['start'] - 0.05); en[i] = min(max(en[i], st[i] + 0.05), s['end'] + 0.05)
out = []
for si, tk in enumerate(toks):
    for ti, (c, sws) in enumerate(tk):
        ii = [i for i, f in enumerate(flat) if f[0] == si and f[1] == ti]
        out.append({'word': c, 'start': round(st[ii[0]], 3), 'end': round(en[ii[-1]], 3), 'spoken': ' '.join(sws)})
for a, b in zip(out, out[1:]):
    if b['start'] < a['start'] + 0.04: b['start'] = round(a['start'] + 0.04, 3)
json.dump({'source': 'Kokoro am_fenrir 0.95 TTS sentence segments + faster-whisper base.en word timestamps (voice_words.py)', 'words': out}, open(proj + '/timeline/words.json', 'w'), indent=1)
json.dump({'segments': [{k: v for k, v in s.items() if k != 'tok'} for s in segs], 'whisper': [{'w': w.word, 's': round(w.start, 2), 'e': round(w.end, 2)} for w in ww]}, open(proj + '/timeline/segments.json', 'w'), indent=1)
print(f'{len(y)/SR:.2f} s, {len(out)} caption words')
print('WHISPER:', ' '.join(w.word.strip() for w in ww))
