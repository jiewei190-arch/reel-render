"""Second, measured mastering pass (same as build_short.py stage_mix): exact gain to -14 LUFS, true-peak limiter if needed,
then mux with the silent render -> justinclips/shorts/<slug>/video.mp4 + video.sha256.  Usage: python3 master.py"""
import json, subprocess, hashlib, os, sys
D = os.path.dirname(os.path.abspath(__file__)); slug = os.path.basename(D); SH = os.path.join(D, '..', '..', '..', '..', 'justinclips', 'shorts', slug)
def loud(p):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', p, '-af', 'loudnorm=print_format=json', '-f', 'null', '-'], capture_output=True, text=True)
    j = json.loads(r.stderr[r.stderr.rindex('{'):r.stderr.rindex('}') + 1]); return float(j['input_i']), float(j['input_tp'])
mix = f'{D}/build/mix.wav'; I, TP = loud(mix); print(f'mix.py: {I:.2f} LUFS, TP {TP:.2f}')
g = -14.0 - I; af = f'volume={g:.2f}dB' + (',alimiter=limit=0.82:attack=1:release=60:level=disabled' if TP + g > -1.3 else '')
fin = f'{D}/build/master.wav'; subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', mix, '-af', af, '-ar', '48000', fin], check=True)
out = os.path.normpath(f'{SH}/video.mp4'); subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', f'{D}/build/video_silent.mp4', '-i', fin, '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out], check=True)
I3, TP3 = loud(out); h = hashlib.sha256(open(out, 'rb').read()).hexdigest(); open(os.path.normpath(f'{SH}/video.sha256'), 'w').write(f'{h}  video.mp4\n')
print(f'final {out}: {I3:.2f} LUFS, TP {TP3:.2f} dBTP, sha256 {h}')
