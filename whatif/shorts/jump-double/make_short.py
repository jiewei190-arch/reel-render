"""(whatif/shorts/see-in-dark/make_short.py + captions break at sentence ends.) Cut a vertical 1080x1920 Short from a 16:9 What If episode: blurred fill, 4:3 centre crop,
hook title on top, word-timed captions below. Usage: make_short.py words.json episode.mp4 start end "TITLE" out.mp4"""
import json, subprocess, sys
words_p, src, t0, t1, title, out = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4]), sys.argv[5], sys.argv[6]
W = [w for w in json.load(open(words_p))['words'] if w['start'] >= t0 - 0.05 and w['end'] <= t1 + 0.3]
def ts(t):
    t = max(0.0, t); return f"{int(t//3600)}:{int(t%3600//60):02d}:{t%60:05.2f}"
# group up to 3 words per caption, never across a sentence end; current word highlighted yellow
groups, cur = [], []
for w in W:
    cur.append(w)
    if len(cur) == 3 or w['word'].strip()[-1:] in '.?!"':
        groups.append(cur); cur = []
if cur: groups.append(cur)
lines = []
for gi, g in enumerate(groups):
    nxt = groups[gi+1][0]['start'] if gi+1 < len(groups) else None
    for j, w in enumerate(g):
        s = w['start'] - t0; e = (g[j+1]['start'] if j+1 < len(g) else min(nxt, w['end'] + 0.6) if nxt is not None else w['end'] + 0.4) - t0
        txt = ' '.join(('{\\c&H00E6FF&}' + x['word'].strip().upper() + '{\\c&HFFFFFF&}') if k == j else x['word'].strip().upper() for k, x in enumerate(g))
        lines.append(f"Dialogue: 0,{ts(s)},{ts(e)},Cap,,0,0,0,,{txt}")
dur = t1 - t0
ass = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Inter ExtraBold,78,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,7,2,8,60,60,1395,1
Style: Title,Inter ExtraBold,74,&H00FFFFFF,&H00FFFFFF,&H00000000,&HC0000000,1,0,0,0,100,100,0,0,3,18,0,8,70,70,300,1
[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 1,{ts(0)},{ts(dur)},Title,,0,0,0,,{title}
""" + '\n'.join(lines) + '\n'
open(out + '.ass', 'w').write(ass)
fc = ("[0:v]split[a][b];[a]scale=-2:1920,crop=1080:1920,gblur=sigma=40,eq=brightness=-0.12[bg];"
      "[b]crop=1280:960:320:60,scale=1080:810[fg];[bg][fg]overlay=0:540,ass=" + out + ".ass[v]")
subprocess.run(['ffmpeg','-y','-v','error','-ss',str(t0),'-t',str(dur),'-i',src,'-filter_complex',fc,'-map','[v]','-map','0:a',
  '-af','afade=t=out:st=%.2f:d=0.4' % (dur-0.4),'-c:v','libx264','-preset','medium','-crf','19','-pix_fmt','yuv420p','-r','24',
  '-c:a','aac','-b:a','192k','-movflags','+faststart',out], check=True)
