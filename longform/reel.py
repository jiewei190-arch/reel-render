# Stone Age Stories REEL: 16:9 slideshow -> vertical 1080x1920 with blurred fill, centre 4:3 crop, hook title on top, burned-in captions (rule 23).
# usage: python3 -I reel.py <name> "TITLE ON TOP"   ->  <name>/out/reel_vertical.mp4
import json, pathlib, subprocess, sys
HERE = pathlib.Path(__file__).resolve().parent; name, title = sys.argv[1], sys.argv[2]; D = HERE / name
subprocess.run([sys.executable, '-I', str(HERE / 'slideshow.py'), name], check=True)
subprocess.run([sys.executable, '-I', str(HERE / 'mix.py'), name], check=True)
tl = json.load(open(D / 'tl.json')); W = []
for sc in tl['scenes']:
    for l in sc['lines']:
        ws = l['text'].split(); tot = sum(len(w) + 2 for w in ws); t = l['start']; d = l['end'] - l['start']
        for w in ws: dd = d * (len(w) + 2) / tot; W.append({'word': w, 'start': round(t, 3), 'end': round(t + dd * .92, 3)}); t += dd
json.dump({'words': W}, open(D / 'out' / 'words.json', 'w'))
subprocess.run([sys.executable, str(HERE / 'reel_vertical.py'), str(D / 'out' / 'words.json'), str(D / 'out' / 'final.mp4'), '0', str(tl['total']), title, str(D / 'out' / 'reel_vertical.mp4')], check=True)
print('reel ->', D / 'out' / 'reel_vertical.mp4')
