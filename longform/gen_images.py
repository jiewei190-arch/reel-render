# Gemini image generation for a shot list.  needs env GEMINI_API_KEY
# usage: python3 -I gen_images.py <name> [first] [last] [--model M]
# shot 1 becomes the style anchor; every later shot is generated with it as a reference image.
import base64, json, os, pathlib, sys, time, urllib.request, urllib.error
HERE = pathlib.Path(__file__).resolve().parent
args = [a for a in sys.argv[1:] if not a.startswith('--')]
model = next((a.split('=', 1)[1] for a in sys.argv[1:] if a.startswith('--model=')), 'gemini-2.5-flash-image')
name = args[0]; D = HERE / name; img = D / 'images'; img.mkdir(exist_ok=True)
spec = json.load(open(D / 'shots.json')); shots = spec['shots']
a = int(args[1]) if len(args) > 1 else 1; z = int(args[2]) if len(args) > 2 else len(shots)
key = os.environ.get('GEMINI_API_KEY') or sys.exit('GEMINI_API_KEY is not set')
url = f'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent'
def gen(prompt, ref=None):
    parts = [{'text': prompt}]
    if ref: parts.append({'inline_data': {'mime_type': 'image/png', 'data': base64.b64encode(ref.read_bytes()).decode()}})
    body = {'contents': [{'parts': parts}], 'generationConfig': {'responseModalities': ['IMAGE'], 'imageConfig': {'aspectRatio': '16:9'}}}
    req = urllib.request.Request(url, json.dumps(body).encode(), {'Content-Type': 'application/json', 'x-goog-api-key': key})
    for attempt in range(5):
        try:
            r = json.load(urllib.request.urlopen(req, timeout=180))
            for p in r['candidates'][0]['content']['parts']:
                d = p.get('inline_data') or p.get('inlineData')
                if d: return base64.b64decode(d['data'])
            print('  no image in response:', json.dumps(r)[:300])
        except urllib.error.HTTPError as e:
            print('  HTTP', e.code, e.read()[:300].decode(errors='replace'))
            if e.code in (400, 401, 403): sys.exit(1)
        except Exception as e: print('  error', e)
        time.sleep(4 * 2 ** attempt)
    return None
anchor = img / 'img001.png'
for i in range(a, z + 1):
    out = img / f'img{i:03d}.png'
    if out.exists(): continue
    s = shots[i - 1]
    ref = anchor if anchor.exists() and i != 1 else None
    prompt = spec['style'] + ('\nMatch the drawing style, line weight, character design and palette of the attached reference image exactly.' if ref else '') + '\nScene: ' + s['p']
    data = gen(prompt, ref)
    if data: out.write_bytes(data); print(f'{i:3d} ok', flush=True)
    else: print(f'{i:3d} FAILED', flush=True)
