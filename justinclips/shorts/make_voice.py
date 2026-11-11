"""Voice + word timings for a Justin clips Toon 3D Short (Kokoro am_fenrir 0.95, short gaps).
script.md: numbered lines '3. spoken text || caption text' (caption part optional; use it for digits: the voice says
'nineteen sixty-seven', the caption shows '1967'). '## beat' = a beat of silence before the punchline.
Writes <project>/input/voiceover.wav, input/script.txt, timeline/words.json + sentences.json (caption words, timed from
Whisper word timestamps of the real speech), and prints the Whisper transcript per sentence (check years/numbers).
Usage: python3 make_voice.py script.md <project_dir> [--gap 0.3] [--comma 0.15] [--beat 0.75] [--lead 0.12]"""
import re, sys, json, os, difflib
import numpy as np, soundfile as sf
args = sys.argv[1:]
def opt(n, d):
    if n in args: i = args.index(n); v = float(args[i + 1]); del args[i:i + 2]; return v
    return d
GAP, COMMA, BEAT, LEAD = opt('--gap', 0.3), opt('--comma', 0.15), opt('--beat', 0.75), opt('--lead', 0.12)
src, proj = args
from kokoro_onnx import Kokoro
from faster_whisper import WhisperModel
TTS = '/home/user/reel-render/tts/'; SR = 24000
k = Kokoro(TTS + 'kokoro-v1.0.onnx', TTS + 'voices-v1.0.bin')
wm = WhisperModel('small', device='cpu', compute_type='int8')
norm = lambda w: re.sub(r"[^\w%:']", '', w.lower())
items = []; beat = False
for raw in open(src, encoding='utf-8'):
    line = raw.strip()
    if line.startswith('## '): beat = True; continue
    m = re.match(r'^\d+[a-z]?\.\s+(.*)', line)
    if not m: continue
    say, _, cap = m.group(1).partition('||'); say = say.strip(); cap = (cap.strip() or say)
    items.append((say, cap, beat)); beat = False
pieces = [np.zeros(int(SR * LEAD), np.float32)]; cur = LEAD; words = []; sents = []
for say, cap, b in items:
    if b: pieces.append(np.zeros(int(SR * (BEAT - GAP)), np.float32)); cur += BEAT - GAP
    a, _ = k.create(say, voice='am_fenrir', speed=0.95, lang='en-us'); a = a.astype(np.float32)
    # trim leading/trailing near-silence
    nz = np.where(np.abs(a) > 0.01)[0]; a = a[max(0, nz[0] - 240): nz[-1] + 480] if len(nz) else a
    a16 = np.interp(np.arange(0, len(a), SR / 16000), np.arange(len(a)), a).astype(np.float32)   # numpy in: no `av` decode
    segs, _ = wm.transcribe(a16, language='en', word_timestamps=True, beam_size=5)
    ww = [w for s in segs for w in s.words]
    heard = ' '.join(w.word.strip() for w in ww)
    print(f'[{cur:6.2f}] SAY: {say}\n         HEARD: {heard}')
    st = say.split(); ht = [norm(w.word) for w in ww]; sn = [norm(w) for w in st]
    times = [None] * len(st); sm = difflib.SequenceMatcher(None, sn, ht, autojunk=False)
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op == 'equal':
            for d in range(i2 - i1): times[i1 + d] = (ww[j1 + d].start, ww[j1 + d].end)
        elif op == 'replace' and j2 > j1:
            t0, t1 = ww[j1].start, ww[j2 - 1].end; n = i2 - i1
            for d in range(n): times[i1 + d] = (t0 + (t1 - t0) * d / n, t0 + (t1 - t0) * (d + 1) / n)
    dur = len(a) / SR
    for i in range(len(st)):   # fill gaps by interpolation
        if times[i] is None:
            p = next((times[j][1] for j in range(i - 1, -1, -1) if times[j]), 0.0)
            q = next((times[j][0] for j in range(i + 1, len(st)) if times[j]), dur)
            times[i] = (p, max(p + 0.05, q))
    ct = cap.split(); cn = [norm(w) for w in ct]; cm = difflib.SequenceMatcher(None, sn, cn, autojunk=False)
    for op, i1, i2, j1, j2 in cm.get_opcodes():
        if j2 == j1: continue
        if i2 == i1: t0 = t1 = times[min(i1, len(st) - 1)][0]
        else: t0, t1 = times[i1][0], times[i2 - 1][1]
        n = j2 - j1
        for d in range(n): words.append({'word': ct[j1 + d], 'start': round(cur + t0 + (t1 - t0) * d / n, 3), 'end': round(cur + t0 + (t1 - t0) * (d + 1) / n, 3)})
    sents.append({'i': len(sents), 'start': round(cur + times[0][0], 3), 'end': round(cur + times[-1][1], 3), 'text': cap, 'say': say})
    pieces.append(a); cur += dur
    g = GAP if re.search(r'[.!?…]["”]?$', say) else COMMA
    pieces.append(np.zeros(int(SR * g), np.float32)); cur += g
y = np.concatenate(pieces); y = y / np.abs(y).max() * 0.89
os.makedirs(f'{proj}/input', exist_ok=True); os.makedirs(f'{proj}/timeline', exist_ok=True)
sf.write(f'{proj}/input/voiceover.wav', y, SR)
open(f'{proj}/input/script.txt', 'w').write('\n'.join(c for _, c, _ in items) + '\n')
json.dump({'source': 'kokoro am_fenrir 0.95 + faster-whisper small word timestamps', 'words': words}, open(f'{proj}/timeline/words.json', 'w'), indent=1)
json.dump(sents, open(f'{proj}/timeline/sentences.json', 'w'), indent=1)
open(f'{proj}/timeline/transcript.txt', 'w').write(' '.join(c for _, c, _ in items) + '\n')
print(f'{len(y)/SR:.2f} s, {len(words)} caption words')
