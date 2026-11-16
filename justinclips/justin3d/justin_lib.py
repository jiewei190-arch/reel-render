"""Justin pose + expression library (used by render_justin.py, runs inside Blender).

Poses are written in *character space* (metres, +X = his left, -Y = forward, +Z = up)
for the LEFT side; ".R" entries are mirrored automatically.

Arm spec (per side):
    {"up": dir_of_upper_arm, "fore": dir_of_forearm, "palm": palm_normal, "hand": (x, y, z) deg}
  or IK:
    {"ik": wrist_target_position, "pole": elbow_hint_dir, "palm": ..., "hand": ...}
Other bones: local euler degrees, e.g. "spine": (x, y, z).
  spine / chest / neck / head: +x bends forward, +y turns to his left, +z tilts to his right.
  shoulder: +z lifts the shoulder (shrug)  (mirrored for .R).
Fingers: preset name per hand: relaxed, open, spread, fist, point, grip, thumbs_up.
"""
import math
from mathutils import Vector, Matrix, Quaternion, Euler

D = math.radians

L1, L2 = 0.33, 0.31  # upper arm / forearm lengths

# ------------------------------------------------------------------ finger presets
# (curl_01, curl_02, curl_03) degrees toward the palm, per finger; thumb gets (x,z) style tuples
FINGER_SETS = {
    "relaxed": {"index": (14, 20, 12), "middle": (18, 24, 14), "ring": (22, 26, 15), "pinky": (26, 28, 16),
                "thumb": (5, 8, 6)},
    "open":    {"index": (0, 4, 2), "middle": (0, 4, 2), "ring": (2, 5, 3), "pinky": (3, 6, 3), "thumb": (0, 0, 0)},
    "spread":  {"index": (-4, 0, 0, 8), "middle": (-4, 0, 0, 0), "ring": (-3, 0, 0, -8), "pinky": (-2, 0, 0, -16),
                "thumb": (-10, 0, 0)},
    "fist":    {"index": (80, 95, 60), "middle": (85, 95, 60), "ring": (88, 95, 60), "pinky": (90, 95, 60),
                "thumb": (25, 35, 30)},
    "point":   {"index": (0, 2, 0), "middle": (85, 95, 60), "ring": (88, 95, 60), "pinky": (90, 95, 60),
                "thumb": (25, 30, 25)},
    "grip":    {"index": (45, 50, 30), "middle": (50, 55, 30), "ring": (55, 55, 30), "pinky": (55, 55, 30),
                "thumb": (15, 20, 15)},
    "thumbs_up": {"index": (85, 95, 60), "middle": (88, 95, 60), "ring": (90, 95, 60), "pinky": (92, 95, 60),
                  "thumb": (-20, -10, 0)},
}

def fingers(side, preset):
    out = {}
    for fn, vals in FINGER_SETS[preset].items():
        spread = vals[3] if len(vals) > 3 else 0
        for i in range(3):
            # curl = rotation about local X (negative curls toward the palm)
            x = -vals[i]
            z = (spread if i == 0 else 0)
            if side == "R":
                z = -z
            out[f"{fn}_{i + 1:02d}.{side}"] = (x, 0, z)
    return out

# ------------------------------------------------------------------ poses
IDLE_ARM = {"up": (0.33, 0.02, -0.944), "fore": (0.10, -0.16, -0.98), "palm": (-1, 0.15, 0), "hand": (0, 0, -6)}

POSES = {
    "rest": {},
    "idle": {
        "arms": IDLE_ARM, "fingers": "relaxed",
        "spine": (2, 0, 0), "chest": (0, 0, 0), "neck": (-2, 0, 0), "head": (2, 0, 0),
    },
    "idle_b": {  # weight shift variant
        "arms": IDLE_ARM, "fingers": "relaxed", "hips": (0, 0, 2.5),
        "spine": (2, 2, -2), "chest": (0, 0, -1), "head": (2, -4, 3),
    },
    "wave": {
        "arm.L": IDLE_ARM, "fingers.L": "relaxed",
        "arm.R": {"up": (0.62, -0.30, -0.53), "fore": (0.06, -0.22, 0.97), "palm": (0, -1, 0), "hand": (0, 0, 0)},
        "fingers.R": "spread", "head": (0, 6, 6), "chest": (0, 4, 2), "shoulder.R": (0, 0, 6),
    },
    "wave_b": {
        "arm.L": IDLE_ARM, "fingers.L": "relaxed",
        "arm.R": {"up": (0.62, -0.30, -0.53), "fore": (0.40, -0.22, 0.89), "palm": (0, -1, 0), "hand": (0, 0, 8)},
        "fingers.R": "spread", "head": (0, 6, 4), "chest": (0, 4, 2), "shoulder.R": (0, 0, 6),
    },
    "point": {  # points at the viewer with his right hand
        "arm.L": IDLE_ARM, "fingers.L": "relaxed",
        "arm.R": {"up": (0.25, -0.85, -0.46), "fore": (-0.05, -0.99, 0.12), "palm": (-0.75, 0, -0.65), "hand": (0, 0, 4)},
        "fingers.R": "point", "chest": (4, -8, 0), "head": (0, -6, 0), "shoulder.R": (0, 0, 2),
    },
    "point_side": {  # points up to his left (screen right), e.g. at on-screen text
        "arm.R": IDLE_ARM, "fingers.R": "relaxed",
        "arm.L": {"up": (0.93, -0.25, 0.05), "fore": (0.82, -0.32, 0.47), "palm": (0, 0.2, -1), "hand": (0, 0, 0)},
        "fingers.L": "point", "chest": (0, 10, 0), "head": (0, 14, -4),
    },
    "shrug": {
        "arms": {"up": (0.36, -0.15, -0.92), "fore": (0.70, -0.66, 0.22), "palm": (0.15, 0, 1), "hand": (12, 0, 0)},
        "fingers": "open", "shoulder.L": (0, 0, 16), "shoulder.R": (0, 0, 16),
        "head": (-2, 0, 9), "neck": (0, 0, 2), "chest": (-3, 0, 0),
    },
    "facepalm": {
        "arm.L": IDLE_ARM, "fingers.L": "relaxed",
        "arm.R": {"ik": (0.03, -0.40, 1.45), "pole": (0.8, -0.3, -1.0), "palm": (0, 1, 0), "hand": (-25, 0, -10)},
        "fingers.R": "open", "head": (14, 0, -6), "neck": (6, 0, 0), "chest": (6, 0, 0), "spine": (3, 0, 0),
    },
    "cross_arms": {
        "arm.L": {"ik": (-0.10, -0.300, 1.000), "pole": (1.0, 0.4, -0.6), "palm": (0, 1, 0.4), "hand": (0, 0, -10)},
        "arm.R": {"ik": (-0.11, -0.345, 1.060), "pole": (1.0, 0.4, -0.5), "palm": (0, 1, -0.3), "hand": (0, 0, -10)},
        "fingers": "grip", "chest": (-3, 0, 0), "spine": (-2, 0, 0), "head": (-3, 0, 3),
        "shoulder.L": (0, 0, 3), "shoulder.R": (0, 0, 3),
    },
    "look_away": {
        "arms": IDLE_ARM, "fingers": "relaxed",
        "head": (4, 30, 2), "neck": (0, 10, 0), "chest": (0, 6, 0), "spine": (2, 0, 0),
    },
    "double_take": {  # recoil: leans back, hands up in surprise
        "arms": {"up": (0.55, -0.35, -0.76), "fore": (0.25, -0.62, 0.74), "palm": (0, -1, 0.2), "hand": (-10, 0, 0)},
        "fingers": "spread", "spine": (-5, 0, 0), "chest": (-7, 0, 0), "neck": (2, 0, 0), "head": (7, 0, 0),
        "shoulder.L": (0, 0, 10), "shoulder.R": (0, 0, 10),
    },
    "explain": {  # talking gesture: right hand forward, palm up
        "arm.L": IDLE_ARM, "fingers.L": "relaxed",
        "arm.R": {"up": (0.40, -0.40, -0.82), "fore": (0.30, -0.93, 0.18), "palm": (0.25, 0, 1), "hand": (8, 0, 0)},
        "fingers.R": "open", "chest": (2, -4, 0), "head": (0, -3, -3),
    },
    "explain_both": {
        "arms": {"up": (0.42, -0.35, -0.84), "fore": (0.45, -0.85, 0.27), "palm": (0.3, 0, 1), "hand": (8, 0, 0)},
        "fingers": "open", "chest": (2, 0, 0), "head": (2, 0, 0),
    },
    "thumbs_up": {
        "arm.L": IDLE_ARM, "fingers.L": "relaxed",
        "arm.R": {"up": (0.45, -0.55, -0.70), "fore": (0.20, -0.75, 0.62), "palm": (-1, 0, 0), "hand": (0, 0, 0)},
        "fingers.R": "thumbs_up", "head": (0, -4, -4),
    },
}

# ------------------------------------------------------------------ expressions (rig custom props)
EXPRESSIONS = {
    "neutral": {},
    "smile": {"smile": 1.0, "squint": 0.35, "brow_up_L": 0.25, "brow_up_R": 0.25},
    "grin": {"smile": 1.0, "wide": 0.8, "squint": 0.5, "brow_up_L": 0.3, "brow_up_R": 0.3},
    "smirk": {"smirk_L": 1.0, "brow_up_R": 0.0, "brow_up_L": 0.55, "brow_furrow_R": 0.25, "squint": 0.3,
              "look_x": 0.0},
    "shock": {"shock": 1.0, "eyes_wide": 1.0, "brow_up_L": 1.0, "brow_up_R": 1.0},
    "cringe": {"grimace": 1.0, "squint": 0.75, "brow_sad_L": 0.6, "brow_sad_R": 0.6, "brow_furrow_L": 0.4,
               "brow_furrow_R": 0.4, "blink_L": 0.25, "blink_R": 0.25},
    "angry": {"brow_furrow_L": 1.0, "brow_furrow_R": 1.0, "frown": 0.7, "press": 0.4, "squint": 0.35},
    "sad": {"brow_sad_L": 1.0, "brow_sad_R": 1.0, "frown": 0.9, "look_y": -0.35},
    "skeptical": {"brow_up_R": 1.0, "brow_furrow_L": 0.7, "smirk_R": 0.6, "squint": 0.25, "blink_L": 0.2,
                  "look_x": 0.25},
    "laugh": {"smile": 1.0, "open": 0.6, "wide": 0.4, "squint": 0.9, "brow_up_L": 0.5, "brow_up_R": 0.5},
    "thinking": {"press": 0.5, "smirk_R": 0.4, "brow_furrow_L": 0.4, "brow_up_R": 0.6, "look_x": 0.6, "look_y": 0.5},
    "blink": {"blink_L": 1.0, "blink_R": 1.0},
}

FACE_PROPS = ["smile", "smirk_L", "smirk_R", "frown", "open", "wide", "round", "press", "grimace", "shock",
              "brow_up_L", "brow_up_R", "brow_furrow_L", "brow_furrow_R", "brow_sad_L", "brow_sad_R",
              "blink_L", "blink_R", "squint", "eyes_wide", "look_x", "look_y", "cheek_L", "cheek_R"]

# ------------------------------------------------------------------ solver
def _mir(v):
    return Vector((-v[0], v[1], v[2]))

def _arm_space_vec(rig, v):
    return Vector(v).normalized()

def _frame(y, z):
    y = y.normalized(); z = (z - z.dot(y) * y).normalized(); x = y.cross(z)
    m = Matrix((x, y, z)).transposed()
    return m

def _two_bone(S, target, pole):
    d = target - S; dist = min(d.length, (L1 + L2) * 0.999); dn = d.normalized()
    a = math.acos(max(-1, min(1, (L1 * L1 + dist * dist - L2 * L2) / (2 * L1 * dist))))
    p = (pole - pole.dot(dn) * dn).normalized()
    u1 = (math.cos(a) * dn + math.sin(a) * p).normalized()
    E = S + L1 * u1
    u2 = (S + dn * dist - E).normalized()
    return u1, u2

def _set_arm(rig, side, spec):
    import bpy
    pb_u = rig.pose.bones[f"upper_arm.{side}"]; pb_f = rig.pose.bones[f"forearm.{side}"]
    pb_h = rig.pose.bones[f"hand.{side}"]
    mir = (lambda v: _mir(v)) if side == "R" else (lambda v: Vector(v))
    bpy.context.view_layer.update()
    S = pb_u.head.copy()
    if "ik" in spec:
        u1, u2 = _two_bone(S, mir(spec["ik"]), mir(spec["pole"]).normalized())
    else:
        u1 = mir(spec["up"]).normalized(); u2 = mir(spec["fore"]).normalized()
    bend_dir = u2 - u2.dot(u1) * u1
    if bend_dir.length < 1e-3:
        bend_dir = Vector((0, -1, 0))
    mu = _frame(u1, bend_dir)
    m = mu.to_4x4(); m.translation = S
    pb_u.matrix = m
    bpy.context.view_layer.update()
    xu = mu.col[0]
    zf = xu.cross(u2)
    mf = _frame(u2, zf)
    # palm orientation: twist at the WRIST (hidden in the round cuff) instead of the
    # forearm, so the sleeve never candy-wraps.
    p = mir(spec.get("palm", (0, 0, -1))).normalized()
    if side == "R":   # mirrored bone frames: palm normal is -X on the right side
        p = -p
    p = p - p.dot(u2) * u2
    ang = 0.0
    if p.length > 1e-3:
        p.normalize(); xf = mf.col[0]
        ang = math.atan2(xf.cross(p).dot(u2), xf.dot(p))
    E = pb_f.head.copy()
    m = mf.to_4x4(); m.translation = E
    pb_f.matrix = m
    bpy.context.view_layer.update()
    hx, hy, hz = spec.get("hand", (0, 0, 0))
    if side == "R":
        hy, hz = -hy, -hz
    pb_h.rotation_quaternion = (Quaternion((0, 1, 0), ang) @ Euler((D(hx), D(hy), D(hz))).to_quaternion())

def solve_pose(rig, name_or_spec):
    """Return {bone: Quaternion} local rotations for a pose (and leaves the rig posed)."""
    import bpy
    spec = POSES[name_or_spec] if isinstance(name_or_spec, str) else name_or_spec
    for pb in rig.pose.bones:
        pb.rotation_quaternion = Quaternion()
        pb.location = (0, 0, 0)
    bpy.context.view_layer.update()
    for bn in ("hips", "spine", "chest", "neck", "head", "shoulder.L", "shoulder.R"):
        if bn in spec:
            x, y, z = spec[bn]
            if bn.endswith(".R"):
                y, z = -y, -z
            rig.pose.bones[bn].rotation_quaternion = Euler((D(x), D(y), D(z))).to_quaternion()
    bpy.context.view_layer.update()
    for side in ("L", "R"):
        a = spec.get(f"arm.{side}", spec.get("arms"))
        if a:
            _set_arm(rig, side, a)
        f = spec.get(f"fingers.{side}", spec.get("fingers"))
        if f:
            for bn, (x, y, z) in fingers(side, f).items():
                rig.pose.bones[bn].rotation_quaternion = Euler((D(x), D(y), D(z))).to_quaternion()
    bpy.context.view_layer.update()
    return {pb.name: pb.rotation_quaternion.copy() for pb in rig.pose.bones
            if pb.rotation_mode == "QUATERNION"}
