# Fast "slideshow" render (owner, Oct 31): one still per narration line + slow Ken Burns + short crossfades, like the reference channel.
# Stills come from images/imgNNN.png when present (AI images), else from the code-drawn scene at the end of that line (node render.js stills).
# usage: python3 -I slideshow.py <name> [fps]   ->  <name>/out/video_noaudio.mp4   (then: python3 -I mix.py <name>)
import json, pathlib, subprocess, sys
HERE = pathlib.Path(__file__).resolve().parent; name = sys.argv[1]; FPS = int(sys.argv[2]) if len(sys.argv) > 2 else 30
D = HERE / name; OUT = D / 'out'; ST = OUT / 'slides'; ST.mkdir(parents=True, exist_ok=True)
tl = json.load(open(D / 'tl.json')); lines = [l for s in tl['scenes'] for l in s['lines']]; total = tl['total']
starts = [0.0] + [l['start'] - .2 for l in lines[1:]]; ends = starts[1:] + [total]
need = [i for i in range(len(lines)) if not (D / 'images' / f'img{i + 1:03d}.png').exists()]
if need:   # grab the code-drawn frame near the end of each line (everything revealed), in one browser session
    ts = [f'{max(starts[i] + .3, min(lines[i]["end"] + .1, ends[i] - .15)):.2f}' for i in need]
    subprocess.run(['node', str(HERE / 'render.js'), name, 'stills', *ts], check=True, cwd=HERE)
    for i, t in zip(need, ts): (OUT / f's_{float(t):07.2f}.jpg').replace(ST / f'{i + 1:03d}.jpg')
XF = .35; parts = []
for i in range(len(lines)):
    src = D / 'images' / f'img{i + 1:03d}.png'; src = src if src.exists() else ST / f'{i + 1:03d}.jpg'
    dur = ends[i] - starts[i] + (XF if i < len(lines) - 1 else 0); n = max(2, round(dur * FPS))
    zin = i % 2 == 0   # alternate slow push-in / pull-out, drifting toward centre-left / centre-right
    z = f"if(eq(on,0),{1.0 if zin else 1.08},{'zoom+0.0009' if zin else 'max(zoom-0.0009,1.0)'})"
    x = f"iw/2-(iw/zoom/2){'-' if i % 4 < 2 else '+'}on*0.15"
    p = ST / f'p{i + 1:03d}.mp4'; parts.append((p, dur))
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-loop', '1', '-i', str(src), '-vf',
                    f"scale=2880:1620,zoompan=z='{z}':x='{x}':y='ih/2-(ih/zoom/2)':d={n}:s=1920x1080:fps={FPS},format=yuv420p",
                    '-frames:v', str(n), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', str(p)], check=True)
# one pass: chain all crossfades in a single filter graph (one encode)
ins, fc, prev, off = [], [], '[0:v]', parts[0][1] - XF
for p, _ in parts: ins += ['-i', str(p)]
for k, (p, dur) in enumerate(parts[1:], 1):
    lab = f'[v{k}]'; fc.append(f'{prev}[{k}:v]xfade=transition=fade:duration={XF}:offset={off:.3f}{lab}'); prev, off = lab, off + dur - XF
cur = ST / 'all.mp4'
subprocess.run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', ';'.join(fc), '-map', prev, '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', str(cur)], check=True)
cur.replace(OUT / 'video_noaudio.mp4'); print('slideshow ->', OUT / 'video_noaudio.mp4', len(parts), 'slides')
