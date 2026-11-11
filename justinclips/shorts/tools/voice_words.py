"""Voice a Justin clips Short with the locked Fenrir settings (whatif/voice/fenrir.py: Kokoro am_fenrir, speed 0.95)
and write kit timing files (timeline/words.json + sentences.json + transcript.txt) for the Toon 3D project.

script.md: numbered lines are spoken; '## beat' = a beat of silence before the next line (punchline).
Inline {CAPTION|spoken words} = the caption shows CAPTION (digits), the voice says the spoken words.
Word times: Whisper (small) word timestamps inside each TTS sentence when the word count matches, otherwise
the sentence span split by character length. Prints Whisper's transcript so years can be checked by ear/text.
Usage: python3 voice_words.py script.md <project_dir> [--gap 0.3] [--comma 0.15] [--beat 0.75] [--lead 0.15]"""
import re, sys, json, os
import numpy as np, soundfile as sf
args = sys.argv[1:]
def opt(n, d):
    if n in args: i = args.index(n); v = float(args[i + 1]); del args[i:i + 2]; return v
    return d
GAP, COMMA, BEAT, LEAD = opt('--gap', 0.3), opt('--comma', 0.15), opt('--beat', 0.75), opt('--lead', 0.15)
script, proj = args[0], args[1]
from kokoro_onnx import Kokoro
TTS = '/home/user/reel-render/tts/'
k = Kokoro(TTS + 'kokoro-v1.0.onnx', TTS + 'voices-v1.0.bin'); SR = 24000
TOK = re.compile(r'\{([^|}]*)\|([^}]*)\}(\S*)|(\S+)')
def parse(text):
    """-> spoken string, list of (caption_token, n_spoken_words)"""
    spoken, caps = [], []
    for m in TOK.finditer(text):
        if m.group(4) is not None:
            spoken.append(m.group(4)); caps.append((m.group(4), 1))
        else:
            sw = m.group(2).split(); sw[-1] += m.group(3); spoken += sw; caps.append((m.group(1) + m.group(3), len(sw)))
    return ' '.join(spoken), caps
pieces, t, sents, beat = [np.zeros(int(SR * LEAD), np.float32)], LEAD, [], False
for raw in open(script, encoding='utf-8'):
    line = raw.strip()
    if line.startswith('## '):
        pieces.append(np.zeros(int(SR * (BEAT - GAP)), np.float32)); t += BEAT - GAP; continue
    m = re.match(r'^\d+[a-z]?\.\s+(.*)', line)
    if not m: continue
    # split sentences on the CAPTION-marked text (keeps {..|..} groups intact)
    for sent in re.split(r'(?<=[.!?…])\s+(?![^{]*\})', m.group(1)):
        if not sent.strip(): continue
        sp, caps = parse(sent)
        a, _ = k.create(sp, voice='am_fenrir', speed=0.95, lang='en-us'); a = a.astype(np.float32)
        env = np.abs(a); thr = env.max() * 0.04; idx = np.where(env > thr)[0]
        s0, s1 = (idx[0] / SR, idx[-1] / SR) if len(idx) else (0, len(a) / SR)
        sents.append({'spoken': sp, 'caps': caps, 'start': t + s0, 'end': t + s1})
        pieces.append(a); t += len(a) / SR
        g = GAP if re.search(r'[.!?…]["”]?$', sp) else COMMA
        pieces.append(np.zeros(int(SR * g), np.float32)); t += g
y = np.concatenate(pieces); y = y / np.abs(y).max() * 0.89
os.makedirs(f'{proj}/input', exist_ok=True); os.makedirs(f'{proj}/timeline', exist_ok=True)
sf.write(f'{proj}/input/voiceover.wav', y, SR)
from faster_whisper import WhisperModel
wm = WhisperModel('small', device='cpu', compute_type='int8')
from scipy.signal import resample_poly
a16 = resample_poly(y, 2, 3).astype(np.float32)
segs, _ = wm.transcribe(a16, language='en', word_timestamps=True)
ww = [w for s in segs for w in s.words]
print('WHISPER:', ''.join(w.word for w in ww).strip())
words, out_s = [], []
for i, s in enumerate(sents):
    n = sum(c[1] for c in s['caps'])
    inside = [w for w in ww if s['start'] - 0.3 <= (w.start + w.end) / 2 <= s['end'] + 0.3]
    if len(inside) == len(s['caps']) and n != len(s['caps']):   # whisper wrote each number group as one token
        st = [max(w.start, s['start'] - 0.05) for w in inside]; en = [min(w.end, s['end'] + 0.1) for w in inside]; src = 'whisper (caption tokens)'
        s['caps'] = [(c, 1) for c, _ in s['caps']]
    elif len(inside) == n:
        st = [max(w.start, s['start'] - 0.05) for w in inside]; en = [min(w.end, s['end'] + 0.1) for w in inside]; src = 'whisper'
    else:
        sw = s['spoken'].split(); L = [len(x) + 1 for x in sw]; tot = sum(L); acc = 0; st, en = [], []
        for l in L: st.append(s['start'] + (s['end'] - s['start']) * acc / tot); acc += l; en.append(s['start'] + (s['end'] - s['start']) * acc / tot)
        src = f'proportional (whisper {len(inside)} vs {n})'
    j = 0
    for cap, cnt in s['caps']:
        words.append({'word': cap, 'start': round(st[j], 3), 'end': round(en[j + cnt - 1], 3)}); j += cnt
    text = ' '.join(c[0] for c in s['caps'])
    out_s.append({'i': i, 'start': round(s['start'], 3), 'end': round(s['end'], 3), 'text': text})
    print(f"{s['start']:6.2f}-{s['end']:6.2f} [{src}] {text}")
dur = len(y) / SR
json.dump({'source': 'Kokoro am_fenrir 0.95 sentence segments + faster-whisper small word timestamps', 'words': words}, open(f'{proj}/timeline/words.json', 'w'), indent=1)
json.dump(out_s, open(f'{proj}/timeline/sentences.json', 'w'), indent=1)
open(f'{proj}/timeline/transcript.txt', 'w').write('\n'.join(x['text'] for x in out_s) + '\n')
open(f'{proj}/input/script.txt', 'w').write('\n'.join(x['text'] for x in out_s) + '\n')
print(f'duration {dur:.2f} s')
