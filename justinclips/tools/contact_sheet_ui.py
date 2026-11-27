"""Contact sheet for a finished Short: frame 1, one frame per shot (mid-shot), the last frame, and two frames with a
YouTube Shorts UI mock-up (top bar, right action column, bottom title/channel area) drawn on, to check that captions clear it.
Usage: python3 contact_sheet_ui.py video.mp4 shots.json out.png"""
import json, os, subprocess, sys, shutil, tempfile
vid, shots, png = sys.argv[1:4]
S = json.load(open(shots))['shots']; dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', vid], capture_output=True, text=True).stdout)
UI = ("drawbox=x=0:y=0:w=1080:h=150:color=black@0.45:t=fill,drawbox=x=950:y=980:w=120:h=640:color=white@0.35:t=fill,"
      "drawbox=x=0:y=1650:w=900:h=270:color=black@0.45:t=fill,drawtext=text='Shorts UI':x=30:y=60:fontsize=48:fontcolor=white")
tmp = tempfile.mkdtemp(); items = [(0.0, 'FRAME 1', False), (1.0, 'UI @1.0s', True)] + [(round((s['start'] + s['end']) / 2, 2), s['id'], False) for s in S[1:]] + [(round(S[len(S)//2]['start'] + 0.6, 2), 'UI mid', True), (dur - 1 / 24 - 0.001, 'LAST FRAME', False)]
for i, (t, lab, ui) in enumerate(items):
    vf = (UI + ',' if ui else '') + f"drawtext=text='{lab} {t:.2f}s':x=20:y=1860:fontsize=44:fontcolor=yellow:box=1:boxcolor=black@0.6,scale=270:-2"
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-ss', str(t), '-i', vid, '-frames:v', '1', '-vf', vf, f'{tmp}/{i:03d}.png'], check=True)
cols = 6; rows = (len(items) + cols - 1) // cols
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-framerate', '1', '-i', f'{tmp}/%03d.png', '-vf', f'tile={cols}x{rows}:padding=6:margin=6:color=0x141414', '-frames:v', '1', png], check=True)
shutil.rmtree(tmp); print(png, len(items), 'tiles')
