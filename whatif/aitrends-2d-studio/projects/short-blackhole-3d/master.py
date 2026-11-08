"""master.py — final loudness pass + mux for short-blackhole-3d (works for the preview and the full-res render).

  python projects/short-blackhole-3d/master.py <silent_video.mp4> <out.mp4>

Takes build/mix.wav (written by audio/mix.py), runs a two-pass loudnorm to -14 LUFS / true peak -1.5 dBTP,
pads/trims it to the exact video duration and puts it on the FULL silent video with -c:v copy
(mix.py's own mux can drop the last frame). Prints frame count, duration, LUFS and true peak of the result.
"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
src, out = sys.argv[1], sys.argv[2]
mix = os.path.join(HERE, "build", "mix.wav")
run = lambda cmd: subprocess.run(cmd, capture_output=True, text=True)

dur = float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", src]).stdout.strip())
LN = "loudnorm=I=-14:TP=-1.5:LRA=11"
p1 = run(["ffmpeg", "-hide_banner", "-i", mix, "-af", LN + ":print_format=json", "-f", "null", "-"]).stderr
m = json.loads(re.findall(r"\{[^{}]*\}", p1)[-1])
af = (f"{LN}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:"
      f"measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,aresample=48000,apad,atrim=0:{dur:.3f}")
r = run(["ffmpeg", "-y", "-hide_banner", "-i", src, "-i", mix, "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy",
         "-af", af, "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out])
if r.returncode: sys.exit(r.stderr[-2000:])

nf = run(["ffprobe", "-v", "error", "-count_frames", "-select_streams", "v", "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", out]).stdout.strip()
nf0 = run(["ffprobe", "-v", "error", "-count_frames", "-select_streams", "v", "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", src]).stdout.strip()
e = run(["ffmpeg", "-hide_banner", "-nostats", "-i", out, "-af", "ebur128=peak=true", "-f", "null", "-"]).stderr
I = re.findall(r"I:\s+(-?[\d.]+) LUFS", e)[-1]; TP = re.findall(r"Peak:\s+(-?[\d.]+) dBFS", e)[-1]
print(f"{out}: frames {nf} (silent {nf0}), duration {dur:.3f} s, {I} LUFS, true peak {TP} dBFS")
