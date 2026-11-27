"""Master pass after audio/mix.py: limiter (no make-up) -> measured gain to -14 LUFS -> limiter at -2 dBFS -> AAC mux (-c:v copy) + sha256.
Usage (from whatif/aitrends-2d-studio): python3 projects/<slug>/master.py projects/<slug> <short dir>/video.mp4"""
import sys, json, subprocess, hashlib
sys.path.insert(0, '/home/user/reel-render/justinclips/tools'); import build_short as B
proj, out = sys.argv[1], sys.argv[2]
mixw = f"{proj}/build/mix.wav"; I, TP = B.loud(mixw); print("mix.py", I, TP)
# 1) peak limiter (no make-up), 2) measured gain to -14 LUFS, 3) final limiter at -2 dBFS so the AAC encode stays under -1 dBTP
lim = f"{proj}/build/mix_lim.wav"; subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", mixw, "-af", "alimiter=limit=0.5:attack=2:release=60:level=disabled", "-ar", "48000", lim], check=True)
I2, _ = B.loud(lim); g = -14.0 - I2
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", lim, "-af", f"volume={g:.2f}dB,alimiter=limit=0.79:attack=1:release=50:level=disabled", "-ar", "48000", f"{proj}/build/master.wav"], check=True)
print("master", B.loud(f"{proj}/build/master.wav"))
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", f"{proj}/build/video_silent.mp4", "-i", f"{proj}/build/master.wav", "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out], check=True)
I3, TP3 = B.loud(out); print("final", I3, TP3)
h = hashlib.sha256(open(out, "rb").read()).hexdigest(); open(out.rsplit('/', 1)[0] + "/video.sha256", "w").write(f"{h}  video.mp4\n"); print(h)
