"""Mix + master + mux for the Short (same as justinclips/tools/build_short.py stage_mix): audio/mix.py (music, SFX cues, ducking),
then a measured gain pass to -14 LUFS with a true-peak limiter, muxed with -c:v copy, sha256, QC json.
Usage (from whatif/aitrends-2d-studio, Chatterbox venv python): python projects/<slug>/master.py <slug> <shorts_dir>"""
import json, subprocess, sys, os, hashlib
slug, short = sys.argv[1], os.path.abspath(sys.argv[2]); P = f'projects/{slug}'
run = lambda c: (print('$', ' '.join(c)), subprocess.run(c, check=True))
def loud(p):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', p, '-af', 'loudnorm=print_format=json', '-f', 'null', '-'], capture_output=True, text=True)
    j = json.loads(r.stderr[r.stderr.rindex('{'):r.stderr.rindex('}') + 1]); return float(j['input_i']), float(j['input_tp'])
run([sys.executable, 'audio/mix.py', '--project', P, '--video', f'{P}/build/video_silent.mp4', '--out', f'{P}/out/video_mixpy.mp4'])
I, TP = loud(f'{P}/build/mix.wav'); print(f'mix.py: {I:.2f} LUFS, TP {TP:.2f}')
g = -14.0 - I; fin = f'{P}/build/master.wav'
for lim in (0.85, 0.75, 0.65):
    af = f'volume={g:.2f}dB,alimiter=limit={lim}:attack=1:release=60:level=disabled'
    run(['ffmpeg', '-y', '-v', 'error', '-i', f'{P}/build/mix.wav', '-af', af, '-ar', '48000', fin])
    I2, TP2 = loud(fin); print(f'master: {I2:.2f} LUFS, TP {TP2:.2f}')
    if TP2 <= -1.0 and abs(I2 + 14) <= 0.5: break
out = os.path.join(short, 'video.mp4')
run(['ffmpeg', '-y', '-v', 'error', '-i', f'{P}/build/video_silent.mp4', '-i', fin, '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out])
I3, TP3 = loud(out); h = hashlib.sha256(open(out, 'rb').read()).hexdigest()
open(os.path.join(short, 'video.sha256'), 'w').write(f'{h}  video.mp4\n')
pr = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_frames,width,height,r_frame_rate', '-show_entries', 'format=duration,size', '-of', 'json', out], capture_output=True, text=True).stdout)
qc = {'lufs_i': round(I3, 2), 'true_peak_dbtp': round(TP3, 2), 'sha256': h, **pr['streams'][0], **pr['format']}
json.dump(qc, open(f'{P}/qc.json', 'w'), indent=1); print('QC', json.dumps(qc))
