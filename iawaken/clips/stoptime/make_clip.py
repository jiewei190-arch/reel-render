"""Multi-segment vertical Short cutter (adapted from whatif/shorts/see-in-dark/make_short.py + the jump-double
sentence-aware captions). 1080x1920: blurred fill, 4:3 centre crop, hook title on top, word-timed captions,
segments joined with 30 ms audio fades, then a ~1.5 s freeze-frame end card (END_LINE),
then two-pass loudnorm to -14 LUFS / TP -1 dBFS.

Usage: make_clip.py words.json episode.mp4 "HOOK TITLE" out.mp4 A-B [C-D ...]   (segment times in episode seconds)
End line: env END_LINE (default "Subscribe for more."; use "Subscribe to find out." when the clip ends on an open question).
"""
import json, os, re, subprocess, sys

words_p, src, title, out = sys.argv[1:5]
END_LINE = os.environ.get("END_LINE", "Subscribe for more.")
segs = [tuple(map(float, s.split('-'))) for s in sys.argv[5:]]
END_LEN, FADE = 1.5, 0.03
ALL = json.load(open(words_p))['words']

def ts(t):
    t = max(0.0, t); return f"{int(t//3600)}:{int(t%3600//60):02d}:{t%60:05.2f}"

# words of each segment, remapped to clip time
W, off = [], 0.0
for a, b in segs:
    for w in ALL:
        if w['start'] >= a - 0.05 and w['end'] <= b + 0.05:
            W.append({'word': w['word'], 'start': w['start'] - a + off, 'end': w['end'] - a + off})
    off += b - a
body = off
dur = body + END_LEN

# captions: up to 3 words, never across a sentence end or a segment cut; current word yellow
groups, cur = [], []
for i, w in enumerate(W):
    cur.append(w)
    gap = W[i+1]['start'] - w['end'] if i + 1 < len(W) else 9
    if len(cur) == 3 or w['word'].strip()[-1:] in '.?!"' or gap > 0.6:
        groups.append(cur); cur = []
if cur: groups.append(cur)
lines = []
for gi, g in enumerate(groups):
    nxt = groups[gi+1][0]['start'] if gi + 1 < len(groups) else body
    for j, w in enumerate(g):
        s = w['start']; e = g[j+1]['start'] if j + 1 < len(g) else min(nxt, w['end'] + 0.6, body)
        txt = ' '.join(('{\\c&H00E6FF&}' + x['word'].strip().upper() + '{\\c&HFFFFFF&}') if k == j
                       else x['word'].strip().upper() for k, x in enumerate(g))
        lines.append(f"Dialogue: 0,{ts(s)},{ts(e)},Cap,,0,0,0,,{txt}")

ass = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Inter ExtraBold,78,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,7,2,8,60,60,1395,1
Style: Title,Inter ExtraBold,74,&H00FFFFFF,&H00FFFFFF,&H00000000,&HC0000000,1,0,0,0,100,100,0,0,3,18,0,8,70,70,300,1
Style: End,Inter ExtraBold,84,&H0040C8FF,&H0040C8FF,&H00000000,&HC0000000,1,0,0,0,100,100,0,0,3,22,0,8,80,80,1395,1
[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 1,{ts(0)},{ts(dur)},Title,,0,0,0,,{title}
Dialogue: 1,{ts(body)},{ts(dur + 0.1)},End,,0,0,0,,{{\\fad(120,0)}}{END_LINE}
""" + '\n'.join(lines) + '\n'
ass_p = out + '.ass'
open(ass_p, 'w').write(ass)

# end-card audio: the episode's own room tone / music after the last segment, faded, stopped before the next word
la, lb = segs[-1]
nextw = min([w['start'] for w in ALL if w['start'] > lb + 0.05] or [lb + 10])
tail = max(0.2, min(END_LEN, nextw - lb - 0.06))

inp, fc, cat = [], [], ''
for i, (a, b) in enumerate(segs):
    inp += ['-ss', f'{a:.3f}', '-t', f'{b-a:.3f}', '-i', src]
    fc.append(f"[{i}:v]setpts=PTS-STARTPTS,fps=24[v{i}];[{i}:a]asetpts=PTS-STARTPTS,"
              f"afade=t=in:d={FADE},afade=t=out:st={b-a-FADE:.3f}:d={FADE}[a{i}]")
    cat += f'[v{i}][a{i}]'
k = len(segs)
inp += ['-ss', f'{lb:.3f}', '-t', f'{tail:.3f}', '-i', src]
fc.append(f"{cat}concat=n={k}:v=1:a=1[vc][ac]")
fc.append(f"[{k}:a]asetpts=PTS-STARTPTS,afade=t=out:st=0:d={tail:.3f}[at];[ac][at]concat=n=2:v=0:a=1,apad,atrim=0:{dur:.3f}[aout]")
fc.append(f"[vc]tpad=stop_mode=clone:stop_duration={END_LEN + 0.1},trim=0:{dur:.3f},split[a][b];"
          "[a]scale=-2:1920,crop=1080:1920,gblur=sigma=40,eq=brightness=-0.12[bg];"
          "[b]crop=1280:960:320:60,scale=1080:810[fg];[bg][fg]overlay=0:540,ass=" + ass_p + "[vout]")
tmp = out + '.tmp.mkv'
subprocess.run(['ffmpeg', '-y', '-v', 'error', *inp, '-filter_complex', ';'.join(fc), '-map', '[vout]', '-map', '[aout]',
                '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', '-r', '24',
                '-c:a', 'pcm_s16le', '-ar', '48000', tmp], check=True)

# loudness: gain to -14 LUFS + 4x-oversampled limiter (true peak), re-measured on the encoded AAC and corrected
def meas(f):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', f, '-af', 'ebur128=peak=true', '-f', 'null', '-'],
                       capture_output=True, text=True).stderr
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', r)[-1]), float(re.findall(r'Peak:\s+(-?[\d.]+) dBFS', r)[-1])
I0, _ = meas(tmp)
gain, lim = -14.0 - I0, -2.0
for _ in range(4):
    af = (f"volume={gain:.2f}dB,aresample=192000,alimiter=limit={10**(lim/20):.4f}:attack=1:release=60:level=false,"
          "aresample=48000")
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', tmp, '-af', af, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
                    '-movflags', '+faststart', out], check=True)
    I, TP = meas(out)
    print(f'  loudness pass: I {I} LUFS, TP {TP} dBFS')
    if abs(I + 14) <= 0.3 and TP <= -1.0: break
    gain += -14.0 - I
    if TP > -1.0: lim -= TP + 1.0 + 0.2
os.remove(tmp)
print(f"{out}: {dur:.2f} s, {len(W)} words, tail audio {tail:.2f} s")
