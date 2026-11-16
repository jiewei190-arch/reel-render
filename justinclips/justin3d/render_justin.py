#!/usr/bin/env python3
"""render_justin.py - headless renderer for the Justin 3D host.

Renders Justin from justin.blend with a pose / expression sequence and optional
voice audio (amplitude-driven lip sync) onto a transparent, green or studio
background, so Shorts can composite him over the Toon 3D scenes.

Usage (plain python3; it drives Blender + ffmpeg itself):

  # an animated clip from a sequence file
  python3 render_justin.py --seq seq_test.json --out test.mp4 --bg studio

  # same sequence, green screen / alpha for compositing
  python3 render_justin.py --seq seq_test.json --out justin_green.mp4 --bg green
  python3 render_justin.py --seq seq_test.json --out justin_alpha.mov --bg transparent   # ProRes 4444 + alpha

  # a single still (transparent PNG)
  python3 render_justin.py --pose wave --expr smile --framing full --still wave.png

  # override audio from the command line (lip sync follows its loudness)
  python3 render_justin.py --seq my_seq.json --audio vo.wav --audio-offset 0.4 --out clip.mp4

Sequence JSON (times in seconds):
  {
    "duration": 8.0, "fps": 30, "framing": "medium",            # full | medium | close
    "audio": "line.wav", "audio_offset": 2.0,                   # optional
    "pop_in": 0.0, "pop_out": 7.5,                              # optional: times he pops in / out
    "keys": [                                                   # pose / expression keys
      {"t": 0.0, "pose": "look_away", "expr": "neutral"},
      {"t": 0.9, "pose": "double_take", "expr": "shock", "dur": 0.12, "ease": "snap"},
      {"t": 2.0, "pose": "explain", "dur": 0.3},                # omitted pose/expr = keep current
      {"t": 4.4, "expr": "smirk", "face": {"look_x": 0.1}}      # "face" = extra raw face props
    ]
  }
Pose and expression names live in justin_lib.py (POSES / EXPRESSIONS).
Interpolation: "dur" (default 0.25 s) and "ease": smooth | snap (overshoot) | linear | hold.
Auto layers: breathing, idle sway, blinks every ~2.5-4.5 s, talking head-bob + lip sync.
"""
import argparse, json, math, os, shutil, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
BLEND = os.path.join(HERE, "justin.blend")
FRAMINGS = {  # target z, visible height (m)
    "full": (0.99, 2.18), "medium": (1.18, 2.0), "close": (1.56, 0.95), "bust": (1.50, 1.08),
}


def in_blender():
    try:
        import bpy  # noqa
        return True
    except ImportError:
        return False


# ======================================================================= Blender side
def blender_main(a):
    import bpy, numpy as np
    from mathutils import Quaternion, Vector
    sys.path.insert(0, HERE)
    import justin_lib as JL

    scene = bpy.context.scene
    rig = bpy.data.objects["Justin_rig"]
    seq = a["seq"]
    fps = seq.get("fps", 30)
    dur = seq.get("duration", 0)
    nfr = max(1, int(round(dur * fps)))
    scene.render.fps = fps
    scene.frame_start = 1; scene.frame_end = nfr

    # ---------------- camera
    cam = scene.camera
    zc, hgt = FRAMINGS[seq.get("framing", "medium")]
    lens = 50.0
    cam.data.lens = lens; cam.data.sensor_fit = "VERTICAL"; cam.data.sensor_height = 36.0
    W_, H_ = a["res"]
    fov_v = 2 * math.atan(18.0 / lens)
    dist = hgt / (2 * math.tan(fov_v / 2))
    yaw = math.radians(seq.get("cam_yaw", 0.0))
    cam.location = (dist * math.sin(yaw), -dist * math.cos(yaw), zc + seq.get("cam_dz", 0.0))
    cam.rotation_euler = (math.radians(90), 0, yaw)
    scene.render.resolution_x = W_; scene.render.resolution_y = H_
    scene.render.resolution_percentage = int(a["scale"] * 100)
    scene.eevee.taa_render_samples = a["samples"]
    scene.render.film_transparent = True
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"

    # ---------------- poses
    cache = {}
    def pose(name):
        if name not in cache:
            cache[name] = JL.solve_pose(rig, name)
        return cache[name]
    bone_names = list(pose("rest").keys())

    keys = sorted(seq.get("keys", [{"t": 0, "pose": "idle", "expr": "neutral"}]), key=lambda k: k["t"])
    for k in keys:
        if "pose" in k:
            pose(k["pose"])

    def ease(name, x):
        x = min(max(x, 0.0), 1.0)
        if name == "linear":
            return x
        if name == "hold":
            return 1.0 if x > 0 else 0.0
        if name == "snap":  # ease-out-back (overshoot ~8%)
            c1 = 1.70158; c3 = c1 + 1
            return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2
        return x * x * (3 - 2 * x)

    def qlerp(q0, q1, f):
        if q0.dot(q1) < 0:
            q1 = -q1
        d = q0.rotation_difference(q1)
        ax, ang = d.to_axis_angle()
        return q0 @ Quaternion(ax, ang * f)   # rotation_difference = q0^-1 @ q1

    def expr_of(k):
        e = dict(JL.EXPRESSIONS.get(k.get("expr", ""), {})) if "expr" in k else None
        if "face" in k:
            e = e if e is not None else {}
            e.update(k["face"])
        return e

    # ---------------- audio analysis (lip sync)
    audio = a.get("audio")
    aoff = a.get("audio_offset", 0.0)
    env = None
    if audio:
        import wave
        with wave.open(audio) as w:
            sr = w.getframerate(); n = w.getnframes(); ch = w.getnchannels(); sw = w.getsampwidth()
            raw = w.readframes(n)
        dt = {1: np.int8, 2: np.int16, 4: np.int32}[sw]
        x = np.frombuffer(raw, dtype=dt).astype(np.float32).reshape(-1, ch).mean(1)
        x /= max(1e-9, np.abs(x).max())
        hop = sr / fps; win = int(sr * 0.045)
        nA = int(len(x) / hop) + 2
        rms = np.zeros(nA); cen = np.zeros(nA)
        for i in range(nA):
            c = int(i * hop); seg = x[max(0, c - win // 2): c + win // 2]
            if len(seg) < 16:
                continue
            rms[i] = math.sqrt(float((seg ** 2).mean()))
            sp = np.abs(np.fft.rfft(seg * np.hanning(len(seg))))
            fr = np.fft.rfftfreq(len(seg), 1 / sr)
            cen[i] = float((sp * fr).sum() / max(1e-9, sp.sum()))
        pk = np.percentile(rms[rms > 0], 95) if (rms > 0).any() else 1
        o = np.clip((rms / pk) ** 0.7 * 1.05, 0, 1)
        o[o < 0.12] = 0
        sm = np.zeros_like(o); v = 0
        for i in range(len(o)):  # fast attack, slower release
            v = v + (o[i] - v) * (0.75 if o[i] > v else 0.45); sm[i] = v
        env = (sm, cen)

    def lips(t):
        if env is None:
            return None
        sm, cen = env
        i = int(round((t - aoff) * fps))
        if i < 0 or i >= len(sm):
            return {"open": 0, "wide": 0, "round": 0, "press": 0, "level": 0}
        o = float(sm[i]); c = float(cen[i])
        wide = o * min(max((c - 1600) / 1400, 0), 1)
        rnd = o * min(max((1300 - c) / 700, 0), 1) * 0.9
        prev = float(sm[i - 1]) if i > 0 else 0
        press = 0.6 if (o < 0.05 and prev > 0.2) else 0.0
        return {"open": o * 0.85, "wide": wide * 0.7, "round": rnd, "press": press, "level": o}

    # ---------------- blinks
    rng = np.random.default_rng(seq.get("seed", 7))
    blinks = []; tb = 0.8 + rng.uniform(0, 1.0)
    while tb < dur:
        blinks.append(tb); tb += rng.uniform(2.3, 4.4)
    blinks += seq.get("blinks", [])

    def blink_v(t):
        v = 0
        for b in blinks:
            x = t - b
            if 0 <= x < 0.07: v = max(v, x / 0.07)
            elif 0.07 <= x < 0.11: v = 1
            elif 0.11 <= x < 0.22: v = max(v, 1 - (x - 0.11) / 0.11)
        return v

    # ---------------- bake
    from_pose = dict(pose(keys[0].get("pose", "idle")))
    cur_pose = dict(from_pose)
    tgt_pose = dict(from_pose)
    face0 = {p: 0.0 for p in JL.FACE_PROPS}
    face0.update(JL.EXPRESSIONS.get(keys[0].get("expr", "neutral"), {}))
    cur_face = dict(face0); from_face = dict(face0); tgt_face = dict(face0)
    active = None; ki = 0
    pop = seq.get("pop_in")
    talk_prev = 0.0
    for f in range(1, nfr + 1):
        t = (f - 1) / fps
        while ki < len(keys) and keys[ki]["t"] <= t + 1e-6:
            k = keys[ki]
            from_pose = dict(cur_pose); from_face = dict(cur_face)
            if "pose" in k:
                tgt_pose = dict(pose(k["pose"]))
            e = expr_of(k)
            if e is not None:
                tgt_face = {p: 0.0 for p in JL.FACE_PROPS}
                tgt_face.update(e)
            active = k; ki += 1
        if active is not None:
            x = (t - active["t"]) / max(1e-3, active.get("dur", 0.25))
            fe = ease(active.get("ease", "smooth"), x)
            ff = ease("smooth" if active.get("ease") == "snap" else active.get("ease", "smooth"), x * 1.3)
            cur_pose = {b: qlerp(from_pose[b], tgt_pose[b], fe) for b in bone_names}
            cur_face = {p: from_face[p] + (tgt_face[p] - from_face[p]) * ff for p in JL.FACE_PROPS}
        # additive layers
        out = dict(cur_pose)
        def add(b, xd, yd=0, zd=0):
            from mathutils import Euler
            out[b] = out[b] @ Euler((math.radians(xd), math.radians(yd), math.radians(zd))).to_quaternion()
        br = math.sin(2 * math.pi * t / 3.4)
        add("chest", -0.9 * br); add("spine", 0.4 * br)
        add("head", 0.7 * math.sin(t * 1.3) + 0.4 * math.sin(t * 2.9), 0.9 * math.sin(t * 0.8), 0.6 * math.sin(t * 1.1 + 1))
        lp = lips(t)
        face = dict(cur_face)
        if lp:
            lvl = lp["level"]
            talk = 0.8 * talk_prev + 0.2 * lvl
            add("head", 3.0 * (lvl - talk), 0, 0)
            add("neck", 1.2 * math.sin(t * 5.0) * talk)
            talk_prev = talk
            for p in ("open", "wide", "round", "press"):
                face[p] = max(face[p], lp[p]) if p != "press" else max(face[p], lp[p] * (1 - lvl))
            mute = min(1.0, lvl * 1.5)
            face["shock"] *= (1 - mute)
        bv = blink_v(t)
        face["blink_L"] = max(face["blink_L"], bv); face["blink_R"] = max(face["blink_R"], bv)
        for b in bone_names:
            pb = rig.pose.bones[b]
            pb.rotation_quaternion = out[b]
            pb.keyframe_insert("rotation_quaternion", frame=f)
        for p in JL.FACE_PROPS:
            rig[p] = float(face[p])
            rig.keyframe_insert(f'["{p}"]', frame=f)
        rb = rig.pose.bones["root"]
        s = 1.0; hop = 0.0
        if pop is not None:
            x = (t - pop) / 0.32
            if x < 0:
                s = 0.0001
            elif x < 1:
                s = max(0.0001, ease("snap", x)); hop = 0.10 * math.sin(math.pi * x)
        pout = seq.get("pop_out")
        if pout is not None and t >= pout:
            x = (t - pout) / 0.16
            s = 0.0001 if x >= 1 else s * max(0.0001, 1 + 0.12 * math.sin(math.pi * min(x * 2, 1)) - x ** 2)
        rb.scale = (s * (1 + 0.06 * (1 - s) if s < 1 else s), s, s)
        rb.location = (0, 0, hop)  # root bone local: y is up-ish? see below
        rb.keyframe_insert("scale", frame=f); rb.keyframe_insert("location", frame=f)
    if rig.animation_data and rig.animation_data.action:
        for fc in rig.animation_data.action.fcurves:
            for kp in fc.keyframe_points:
                kp.interpolation = "LINEAR"
    scene.frame_set(1)
    bpy.ops.wm.save_as_mainfile(filepath=a["tmp_blend"], compress=False)
    print("BAKED", nfr)


# ======================================================================= driver side
def run(cmd, **kw):
    print("+", " ".join(cmd[:6]), "..." if len(cmd) > 6 else "")
    subprocess.run(cmd, check=True, **kw)


def studio_bg(path, w, h):
    from PIL import Image, ImageDraw, ImageFilter
    import numpy as np
    y = np.linspace(0, 1, h)[:, None]; x = np.linspace(-1, 1, w)[None, :]
    top = np.array([236, 214, 196]); bot = np.array([214, 184, 160])
    g = top * (1 - y[..., None]) + bot * y[..., None]
    v = 1 - 0.18 * (x[..., None] ** 2) * 0.6 - 0.08 * ((y[..., None] - 0.45) ** 2)
    img = Image.fromarray(np.clip(g * v, 0, 255).astype("uint8"))
    img.save(path)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--seq"); ap.add_argument("--pose"); ap.add_argument("--expr", default="neutral")
    ap.add_argument("--face", help='extra face props as JSON, e.g. \'{"look_x":0.3}\'')
    ap.add_argument("--still"); ap.add_argument("--out")
    ap.add_argument("--bg", default="green", choices=["green", "transparent", "studio"])
    ap.add_argument("--green", default="0x00B140")
    ap.add_argument("--framing"); ap.add_argument("--cam-yaw", type=float)
    ap.add_argument("--audio"); ap.add_argument("--audio-offset", type=float)
    ap.add_argument("--res", default="1080x1920"); ap.add_argument("--scale", type=float, default=1.0,
                    help="render at this fraction of --res and upscale (e.g. 0.67 for speed)")
    ap.add_argument("--samples", type=int, default=24)
    ap.add_argument("--jobs", type=int, default=3, help="parallel Blender render processes")
    ap.add_argument("--blend", default=BLEND)
    ap.add_argument("--keep", help="keep the RGBA frame folder here")
    a = ap.parse_args()

    if a.seq:
        seq = json.load(open(a.seq))
        base = os.path.dirname(os.path.abspath(a.seq))
        if seq.get("audio") and not os.path.isabs(seq["audio"]):
            seq["audio"] = os.path.join(base, seq["audio"])
    else:
        k = {"t": 0, "pose": a.pose or "idle", "expr": a.expr}
        if a.face:
            k["face"] = json.loads(a.face)
        seq = {"duration": 1 / 30, "keys": [k], "blinks": [], "seed": 1, "framing": "full"}
        seq["no_auto"] = True
    if a.framing: seq["framing"] = a.framing
    if a.cam_yaw is not None: seq["cam_yaw"] = a.cam_yaw
    if a.audio: seq["audio"] = os.path.abspath(a.audio)
    if a.audio_offset is not None: seq["audio_offset"] = a.audio_offset
    w, h = map(int, a.res.lower().split("x"))
    tmp = tempfile.mkdtemp(prefix="justin_")
    job = {"seq": seq, "res": [w, h], "scale": a.scale, "samples": a.samples,
           "audio": seq.get("audio"), "audio_offset": seq.get("audio_offset", 0.0),
           "tmp_blend": os.path.join(tmp, "baked.blend")}
    if a.still:
        job["seq"]["duration"] = 1 / 30
        job["seq"]["blinks"] = [-5]
    jp = os.path.join(tmp, "job.json"); json.dump(job, open(jp, "w"))
    run(["blender", "-b", a.blend, "--python", os.path.abspath(__file__), "--", "--job", jp],
        stdout=subprocess.DEVNULL)
    fdir = os.path.join(tmp, "frames"); os.makedirs(fdir)
    nfr = max(1, int(round(seq.get("duration", 0) * seq.get("fps", 30))))
    jobs = max(1, min(a.jobs, nfr))
    chunks = [(1 + i * nfr // jobs, (i + 1) * nfr // jobs) for i in range(jobs)]
    procs = []
    for s, e in chunks:
        cmd = ["xvfb-run", "-a", "-s", "-screen 0 1280x1024x24", "blender", "-b", job["tmp_blend"],
               "-o", os.path.join(fdir, "f_####"), "-F", "PNG", "-s", str(s), "-e", str(e), "-a"]
        procs.append(subprocess.Popen(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT))
    for p in procs:
        if p.wait() != 0:
            sys.exit("render failed")
    if a.still:
        src = os.path.join(fdir, "f_0001.png")
        from PIL import Image
        im = Image.open(src).convert("RGBA")
        if im.size != (w, h):
            im = im.resize((w, h), Image.LANCZOS)
        if a.bg != "transparent":
            bg = Image.new("RGBA", (w, h), (0, 177, 64, 255))
            if a.bg == "studio":
                studio_bg(os.path.join(tmp, "bg.png"), w, h); bg = Image.open(os.path.join(tmp, "bg.png")).convert("RGBA")
            bg.alpha_composite(im); im = bg.convert("RGB")
        im.save(a.still); print("wrote", a.still)
    else:
        out = a.out or "justin.mp4"
        fps = seq.get("fps", 30)
        inp = ["-framerate", str(fps), "-i", os.path.join(fdir, "f_%04d.png")]
        aud = []
        if seq.get("audio"):
            ms = int(seq.get("audio_offset", 0.0) * 1000)
            aud = ["-i", seq["audio"]]
        sc = f"scale={w}:{h}:flags=lanczos"
        if a.bg == "transparent":
            cmd = ["ffmpeg", "-y", *inp, *aud, "-vf", sc, "-c:v", "prores_ks", "-profile:v", "4444",
                   "-pix_fmt", "yuva444p10le"]
            if aud:
                cmd += ["-af", f"adelay={ms}:all=1", "-c:a", "pcm_s16le"]
            cmd += ["-t", str(nfr / fps), out]
        else:
            if a.bg == "green":
                bgin = ["-f", "lavfi", "-i", f"color=c={a.green}:s={w}x{h}:r={fps}"]
            else:
                bgp = os.path.join(tmp, "bg.png"); studio_bg(bgp, w, h)
                bgin = ["-loop", "1", "-framerate", str(fps), "-i", bgp]
            fc = f"[0:v]{sc}[fg];[1:v][fg]overlay=shortest=1:format=auto,format=yuv420p[v]"
            cmd = ["ffmpeg", "-y", *inp, *bgin]
            if aud:
                cmd += aud
                fc += f";[2:a]adelay={ms}:all=1,apad[a]"
            cmd += ["-filter_complex", fc, "-map", "[v]"]
            if aud:
                cmd += ["-map", "[a]", "-c:a", "aac", "-b:a", "160k"]
            cmd += ["-c:v", "libx264", "-crf", "17", "-preset", "slow", "-movflags", "+faststart",
                    "-t", str(nfr / fps), out]
        run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print("wrote", out)
    if a.keep:
        shutil.copytree(fdir, a.keep, dirs_exist_ok=True)
    shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    if in_blender():
        argv = sys.argv[sys.argv.index("--") + 1:]
        job = json.load(open(argv[argv.index("--job") + 1]))
        blender_main(job)
    else:
        main()
