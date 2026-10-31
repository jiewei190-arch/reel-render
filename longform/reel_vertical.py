"""Vertical cut for Stone Age Stories reels (from whatif make_short.py; 16:9 source, 4:3 centre crop 1440x1080 at x 240). Usage: reel_vertical.py words.json video.mp4 start end "TITLE" out.mp4"""
import json, subprocess, sys
words_p, src, t0, t1, title, out = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4]), sys.argv[5], sys.argv[6]
W = [w for w in json.load(open(words_p))['words'] if w['start'] >= t0 - 0.05 and w['end'] <= t1 + 0.3]
def ts(t):
    t = max(0.0, t); return f"{int(t//3600)}:{int(t%3600//60):02d}:{t%60:05.2f}"
# group 3 words per caption, current word highlighted yellow
lines = []
for i in range(0, len(W), 3):
    g = W[i:i+3]
    for j, w in enumerate(g):
        s = w['start'] - t0; e = (g[j+1]['start'] if j+1 < len(g) else (W[i+3]['start'] if i+3 < len(W) else w['end'] + 0.4)) - t0
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
      "[b]crop=1440:1080:240:0,scale=1080:810[fg];[bg][fg]overlay=0:540,ass=" + out + ".ass[v]")
subprocess.run(['ffmpeg','-y','-v','error','-ss',str(t0),'-t',str(dur),'-i',src,'-filter_complex',fc,'-map','[v]','-map','0:a',
  '-af','afade=t=out:st=%.2f:d=0.4' % (dur-0.4),'-c:v','libx264','-preset','medium','-crf','19','-pix_fmt','yuv420p','-r','24',
  '-c:a','aac','-b:a','192k','-movflags','+faststart',out], check=True)
