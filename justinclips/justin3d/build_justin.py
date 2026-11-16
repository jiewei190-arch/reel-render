"""Build Justin (Justin clips host) as a rigged 3D character -> justin.blend

Everything here is generated procedurally (signed-distance-field sculpting +
marching cubes), so there are no third-party mesh assets to license.

Run (headless):
    blender -b --factory-startup --python build_justin.py -- [out.blend]

Units are metres, he faces -Y, his left is +X (Blender convention: .L = +X).
"""
import sys, math, os
import numpy as np
import bpy, bmesh
from mathutils import Vector, Matrix
from mathutils.bvhtree import BVHTree
from skimage import measure

HERE = os.path.dirname(os.path.abspath(__file__))
argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = argv[0] if argv else os.path.join(HERE, "justin.blend")

F32 = np.float32

# ----------------------------------------------------------------- SDF kit
def _n(*a):
    return np.array(a, dtype=F32)

def length3(x, y, z):
    return np.sqrt(x * x + y * y + z * z)

def sph(X, Y, Z, c, r):
    return length3(X - c[0], Y - c[1], Z - c[2]) - r

def ell(X, Y, Z, c, r):
    x = (X - c[0]) / r[0]; y = (Y - c[1]) / r[1]; z = (Z - c[2]) / r[2]
    k0 = length3(x, y, z)
    k1 = length3(x / r[0], y / r[1], z / r[2])
    return k0 * (k0 - 1.0) / np.maximum(k1, 1e-9)

def rcone(X, Y, Z, a, b, r1, r2):
    """iq's exact round cone between spheres (a,r1) and (b,r2)."""
    a = np.asarray(a, F32); b = np.asarray(b, F32)
    ba = b - a; l2 = float(ba @ ba); rr = r1 - r2; a2 = l2 - rr * rr; il2 = 1.0 / l2
    px = X - a[0]; py = Y - a[1]; pz = Z - a[2]
    y = px * ba[0] + py * ba[1] + pz * ba[2]
    z = y - l2
    qx = px * l2 - ba[0] * y; qy = py * l2 - ba[1] * y; qz = pz * l2 - ba[2] * y
    x2 = qx * qx + qy * qy + qz * qz
    y2 = y * y * l2; z2 = z * z * l2
    k = math.copysign(1, rr) * rr * rr * x2
    d3 = (np.sqrt(x2 * a2 * il2) + y * rr) * il2 - r1
    d1 = np.sqrt(x2 + z2) * il2 - r2
    d2 = np.sqrt(x2 + y2) * il2 - r1
    out = np.where(np.sign(y) * a2 * y2 < k, d2, d3)
    out = np.where(np.sign(z) * a2 * z2 > k, d1, out)
    return out

def chain(X, Y, Z, pts, rads, k=0.0):
    d = None
    for i in range(len(pts) - 1):
        e = rcone(X, Y, Z, pts[i], pts[i + 1], rads[i], rads[i + 1])
        d = e if d is None else (smin(d, e, k) if k > 0 else np.minimum(d, e))
    return d

def rbox(X, Y, Z, c, half, rad, R=None):
    x = X - c[0]; y = Y - c[1]; z = Z - c[2]
    if R is not None:  # R columns = local axes in world
        x, y, z = (x * R[0][0] + y * R[1][0] + z * R[2][0],
                   x * R[0][1] + y * R[1][1] + z * R[2][1],
                   x * R[0][2] + y * R[1][2] + z * R[2][2])
    qx = np.abs(x) - half[0] + rad; qy = np.abs(y) - half[1] + rad; qz = np.abs(z) - half[2] + rad
    return (length3(np.maximum(qx, 0), np.maximum(qy, 0), np.maximum(qz, 0))
            + np.minimum(np.maximum(qx, np.maximum(qy, qz)), 0) - rad)

def smin(a, b, k):
    h = np.clip(0.5 + 0.5 * (b - a) / k, 0, 1)
    return b * (1 - h) + a * h - k * h * (1 - h)

def smax(a, b, k):
    return -smin(-a, -b, k)

def sstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)

def sdf_to_mesh(fn, lo, hi, res):
    xs = np.arange(lo[0], hi[0] + res, res, dtype=F32)
    ys = np.arange(lo[1], hi[1] + res, res, dtype=F32)
    zs = np.arange(lo[2], hi[2] + res, res, dtype=F32)
    X, Y, Z = np.meshgrid(xs, ys, zs, indexing="ij")
    V = fn(X, Y, Z).astype(F32)
    del X, Y, Z
    v, f, _, _ = measure.marching_cubes(V, 0.0, spacing=(res, res, res))
    v = v + np.array([xs[0], ys[0], zs[0]], dtype=v.dtype)
    return v.astype(np.float64), f.astype(np.int64)

def mirror_mesh(v, f):
    v2 = v.copy(); v2[:, 0] *= -1
    return v2, f[:, ::-1].copy()

def merge(*parts):
    vs, fs, off = [], [], 0
    for v, f in parts:
        vs.append(v); fs.append(f + off); off += len(v)
    return np.concatenate(vs), np.concatenate(fs)

# ------------------------------------------------------------ scene reset
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
COL = bpy.data.collections.new("Justin"); scene.collection.children.link(COL)

def make_obj(name, v, f, mats=(), smooth=True, decimate=None):
    me = bpy.data.meshes.new(name)
    me.from_pydata([tuple(p) for p in v], [], [tuple(t) for t in f])
    me.validate()
    bm = bmesh.new(); bm.from_mesh(me)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me); bm.free()
    if smooth:
        me.polygons.foreach_set("use_smooth", [True] * len(me.polygons))
    ob = bpy.data.objects.new(name, me)
    COL.objects.link(ob)
    for m in mats:
        me.materials.append(m)
    if decimate and decimate < 1:
        md = ob.modifiers.new("dec", "DECIMATE"); md.ratio = decimate
        bpy.context.view_layer.objects.active = ob
        bpy.ops.object.modifier_apply(modifier=md.name)
    return ob

def verts_np(ob):
    a = np.empty(len(ob.data.vertices) * 3); ob.data.vertices.foreach_get("co", a)
    return a.reshape(-1, 3)

def face_centers(ob):
    a = np.empty(len(ob.data.polygons) * 3); ob.data.polygons.foreach_get("center", a)
    return a.reshape(-1, 3)

def face_normals(ob):
    a = np.empty(len(ob.data.polygons) * 3); ob.data.polygons.foreach_get("normal", a)
    return a.reshape(-1, 3)

def set_face_mats(ob, idx):
    ob.data.polygons.foreach_set("material_index", np.asarray(idx, dtype=np.int32))

def vcol(ob, name, cols):
    a = ob.data.color_attributes.new(name, "FLOAT_COLOR", "POINT")
    c = np.ones((len(cols), 4), dtype=np.float32); c[:, :3] = cols
    a.data.foreach_set("color", c.ravel())

# ---------------------------------------------------------------- materials
def new_mat(name):
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; bs = nt.nodes["Principled BSDF"]
    return m, nt, bs

def principled(name, col, rough=0.5, metal=0.0, sss=0.0, sss_r=(1, .4, .2), sss_s=0.01,
               coat=0.0, sheen=0.0, spec=0.5, attr=None, bump=None):
    m, nt, bs = new_mat(name)
    bs.inputs["Base Color"].default_value = (*col, 1)
    bs.inputs["Roughness"].default_value = rough
    bs.inputs["Metallic"].default_value = metal
    bs.inputs["Specular IOR Level"].default_value = spec
    if sss:
        bs.inputs["Subsurface Weight"].default_value = sss
        bs.inputs["Subsurface Radius"].default_value = sss_r
        bs.inputs["Subsurface Scale"].default_value = sss_s
    if coat:
        bs.inputs["Coat Weight"].default_value = coat
        bs.inputs["Coat Roughness"].default_value = 0.05
    if sheen:
        bs.inputs["Sheen Weight"].default_value = sheen
    if attr:
        an = nt.nodes.new("ShaderNodeAttribute"); an.attribute_name = attr
        nt.links.new(an.outputs["Color"], bs.inputs["Base Color"])
    if bump:
        kind, scale, strength = bump
        tc = nt.nodes.new("ShaderNodeTexCoord")
        if kind == "rib":
            tx = nt.nodes.new("ShaderNodeTexWave"); tx.wave_type = "BANDS"; tx.bands_direction = "Z"
            tx.inputs["Scale"].default_value = scale
            # ribs run around the band: use generated coords
            nt.links.new(tc.outputs["Object"], tx.inputs["Vector"])
            out = tx.outputs["Fac"]
        elif kind == "ribx":
            tx = nt.nodes.new("ShaderNodeTexWave"); tx.wave_type = "BANDS"; tx.bands_direction = "X"
            tx.inputs["Scale"].default_value = scale
            nt.links.new(tc.outputs["Object"], tx.inputs["Vector"])
            out = tx.outputs["Fac"]
        else:
            tx = nt.nodes.new("ShaderNodeTexNoise"); tx.inputs["Scale"].default_value = scale
            tx.inputs["Detail"].default_value = 4
            nt.links.new(tc.outputs["Object"], tx.inputs["Vector"])
            out = tx.outputs["Fac"]
        bn = nt.nodes.new("ShaderNodeBump"); bn.inputs["Strength"].default_value = strength
        bn.inputs["Distance"].default_value = 0.002
        nt.links.new(out, bn.inputs["Height"]); nt.links.new(bn.outputs["Normal"], bs.inputs["Normal"])
    return m

def srgb(r, g, b):
    def c(x):
        x /= 255.0
        return x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4
    return (c(r), c(g), c(b))

SKIN = srgb(230, 150, 108)
M = {}
M["skin"] = principled("skin", SKIN, rough=0.55, sss=0.3, sss_r=(1.0, 0.35, 0.2), sss_s=0.01,
                       spec=0.22, attr="skin_col")
def _skin_fade(m):
    nt = m.node_tree; bs = nt.nodes["Principled BSDF"]
    an = nt.nodes.new("ShaderNodeAttribute"); an.attribute_name = "fade"
    sp = nt.nodes.new("ShaderNodeMapRange"); sp.inputs[3].default_value = 0.22; sp.inputs[4].default_value = 0.02
    nt.links.new(an.outputs["Fac"], sp.inputs[0]); nt.links.new(sp.outputs[0], bs.inputs["Specular IOR Level"])
    rg = nt.nodes.new("ShaderNodeMapRange"); rg.inputs[3].default_value = 0.55; rg.inputs[4].default_value = 0.95
    nt.links.new(an.outputs["Fac"], rg.inputs[0]); nt.links.new(rg.outputs[0], bs.inputs["Roughness"])
_skin_fade(M["skin"])
M["hair"] = principled("hair", srgb(74, 46, 32), rough=0.5, spec=0.3, bump=("noise", 200, 0.05))
M["brow"] = principled("brow", srgb(52, 34, 26), rough=0.7, spec=0.3)
M["lash"] = principled("lash", srgb(40, 24, 20), rough=0.6, spec=0.3)
M["jacket"] = principled("jacket", srgb(98, 112, 72), rough=0.8, sheen=0.6, spec=0.3, bump=("noise", 90, 0.08))
M["rib"] = principled("rib", srgb(80, 92, 58), rough=0.85, sheen=0.5, spec=0.3, bump=("rib", 160, 0.5))
M["ribc"] = principled("ribc", srgb(80, 92, 58), rough=0.85, sheen=0.5, spec=0.3, bump=("ribx", 160, 0.5))
M["lining"] = principled("lining", srgb(255, 112, 24), rough=0.45, sheen=0.3, spec=0.5)
M["pantsrib"] = principled("pantsrib", srgb(56, 47, 45), rough=0.9, sheen=0.5, spec=0.3, bump=("rib", 160, 0.5))
M["tee"] = principled("tee", srgb(240, 236, 226), rough=0.9, sheen=0.4, spec=0.3)
M["pants"] = principled("pants", srgb(60, 50, 48), rough=0.85, sheen=0.5, spec=0.3, bump=("noise", 120, 0.06))
M["shoe"] = principled("shoe", srgb(40, 44, 46), rough=0.62, spec=0.3)
M["sole"] = principled("sole", srgb(245, 243, 238), rough=0.6, spec=0.3)
M["lace"] = principled("lace", srgb(205, 205, 200), rough=0.8, spec=0.3)
M["zip"] = principled("zip", srgb(200, 200, 205), rough=0.28, metal=1.0)
M["gold"] = principled("gold", srgb(255, 196, 92), rough=0.22, metal=1.0, coat=0.3)
M["patch"] = principled("patch", srgb(30, 30, 26), rough=0.9, spec=0.2)
M["mouth"] = principled("mouth", srgb(70, 22, 22), rough=0.6, spec=0.2)
M["teeth"] = principled("teeth", srgb(250, 248, 240), rough=0.3, spec=0.5)
M["tongue"] = principled("tongue", srgb(220, 100, 96), rough=0.5, spec=0.4, sss=0.2)

def eye_material():
    m, nt, bs = new_mat("eye")
    N = nt.nodes; L = nt.links
    tc = N.new("ShaderNodeTexCoord")
    nrm = N.new("ShaderNodeVectorMath"); nrm.operation = "NORMALIZE"
    L.new(tc.outputs["Object"], nrm.inputs[0])
    sep = N.new("ShaderNodeSeparateXYZ"); L.new(nrm.outputs[0], sep.inputs[0])
    neg = N.new("ShaderNodeMath"); neg.operation = "MULTIPLY"; neg.inputs[1].default_value = -1
    L.new(sep.outputs["Y"], neg.inputs[0])            # cos(angle from forward axis)
    ramp = N.new("ShaderNodeValToRGB"); L.new(neg.outputs[0], ramp.inputs[0])
    cr = ramp.color_ramp; cr.interpolation = "LINEAR"
    pts = [  # cos(angle) -> colour; iris ~40 deg, pupil ~19 deg
        (0.00, srgb(236, 232, 226)), (0.745, srgb(252, 250, 247)),
        (0.762, srgb(34, 18, 12)), (0.780, srgb(78, 42, 22)), (0.86, srgb(112, 64, 32)),
        (0.935, srgb(150, 94, 48)), (0.942, srgb(12, 7, 5)), (1.0, srgb(5, 3, 3))]
    cr.elements[0].position = pts[0][0]; cr.elements[0].color = (*pts[0][1], 1)
    cr.elements[1].position = pts[-1][0]; cr.elements[1].color = (*pts[-1][1], 1)
    for p, c in pts[1:-1]:
        e = cr.elements.new(p); e.color = (*c, 1)
    L.new(ramp.outputs["Color"], bs.inputs["Base Color"])
    bs.inputs["Roughness"].default_value = 0.08
    bs.inputs["Coat Weight"].default_value = 1.0
    bs.inputs["Coat Roughness"].default_value = 0.02
    bs.inputs["Specular IOR Level"].default_value = 0.6
    bs.inputs["Subsurface Weight"].default_value = 0.0
    return m
M["eye"] = eye_material()

# ------------------------------------------------------------ skeleton (rest = A-pose)
D2R = math.pi / 180
ARM_ANG = 45 * D2R
S = np.array([0.23, 0.0, 1.28])
dA = np.array([math.sin(ARM_ANG), 0, -math.cos(ARM_ANG)])
E = S + 0.33 * dA
W = E + 0.31 * dA
U = dA                                           # hand: along fingers
NP_ = np.array([-math.cos(ARM_ANG), 0, -math.sin(ARM_ANG)])  # palm normal
T_ = np.array([0.0, -1.0, 0.0])                   # thumb side

def hp(a, b, c):
    return W + a * U + b * T_ + c * NP_

def unit(v):
    v = np.asarray(v, float); return v / np.linalg.norm(v)

def rot_toward(d, axis_to, ang):
    """rotate unit d toward axis_to by ang degrees (in their plane)."""
    d = unit(d); o = axis_to - (axis_to @ d) * d
    if np.linalg.norm(o) < 1e-9:
        return d
    o = unit(o); a = ang * D2R
    return math.cos(a) * d + math.sin(a) * o

HC = np.array([0.0, 0.0, 1.58])  # head centre (eyes at z 1.60)

BONES = {}   # name -> (head, tail, parent, zaxis_hint)
def bone(name, h, t, parent, z=(0, -1, 0)):
    BONES[name] = (np.array(h, float), np.array(t, float), parent, np.array(z, float))

bone("root", (0, 0, 0), (0, 0.25, 0), None, z=(0, 0, 1))
bone("hips", (0, 0, 0.80), (0, 0, 0.95), "root")
bone("spine", (0, 0, 0.95), (0, 0, 1.12), "hips")
bone("chest", (0, 0, 1.12), (0, 0, 1.32), "spine")
bone("neck", (0, 0.01, 1.32), (0, 0.01, 1.44), "chest")
bone("head", (0, 0.01, 1.44), (0, 0.01, 1.75), "neck")
# hand / finger definitions (left side)
FINGERS = {  # b offset, spread deg, lengths, base radius
    "index": (0.0310, 6, (0.034, 0.024, 0.021), 0.0102),
    "middle": (0.0102, 1, (0.037, 0.026, 0.022), 0.0106),
    "ring": (-0.0108, -4, (0.034, 0.024, 0.021), 0.0102),
    "pinky": (-0.0310, -9, (0.027, 0.019, 0.017), 0.0092),
}
FINGER_PTS = {}
for fn_, (b0, spread, lens, r0) in FINGERS.items():
    p = hp(0.084, b0, 0.0)
    d = unit(math.cos(spread * D2R) * U + math.sin(spread * D2R) * T_)
    pts = [p]
    for i, ln in enumerate(lens):
        d = rot_toward(d, NP_, 6)
        p = p + ln * d; pts.append(p)
    FINGER_PTS[fn_] = (pts, [r0, r0 * 0.97, r0 * 0.93, r0 * 0.9])
tb = hp(0.014, 0.026, 0.006)
tdirs = [unit(0.55 * U + 0.75 * T_ + 0.40 * NP_), unit(0.80 * U + 0.50 * T_ + 0.32 * NP_),
         unit(0.90 * U + 0.35 * T_ + 0.25 * NP_)]
tl = [0.040, 0.030, 0.025]
tpts = [tb]
for d, l in zip(tdirs, tl):
    tpts.append(tpts[-1] + l * d)
FINGER_PTS["thumb"] = (tpts, [0.0140, 0.0112, 0.0103, 0.0094])

# legs
HIP = np.array([0.11, 0.0, 0.70]); KNEE = np.array([0.13, -0.012, 0.39]); ANK = np.array([0.14, 0.0, 0.11])
TOE = np.array([0.14, -0.15, 0.035])

for side, sx in (("L", 1), ("R", -1)):
    def m(p):
        p = np.array(p, float).copy(); p[0] *= sx; return p
    zh = m(-NP_) if True else None  # back of hand
    bone(f"shoulder.{side}", m((0.04, 0.0, 1.29)), m(S), "chest", z=(0, 0, 1))
    bone(f"upper_arm.{side}", m(S), m(E), f"shoulder.{side}", z=(0, -1, 0))
    bone(f"forearm.{side}", m(E), m(W), f"upper_arm.{side}", z=(0, -1, 0))
    bone(f"hand.{side}", m(W), m(hp(0.084, 0, 0)), f"forearm.{side}", z=m(-NP_))
    for fn_, (pts, _) in FINGER_PTS.items():
        par = f"hand.{side}"
        for i in range(3):
            nm = f"{fn_}_{i + 1:02d}.{side}"
            bone(nm, m(pts[i]), m(pts[i + 1]), par, z=m(-NP_) if fn_ != "thumb" else m(unit(-NP_ + 0.6 * T_)))
            par = nm
    bone(f"thigh.{side}", m(HIP), m(KNEE), "hips", z=(0, -1, 0))
    bone(f"shin.{side}", m(KNEE), m(ANK), f"thigh.{side}", z=(0, -1, 0))
    bone(f"foot.{side}", m(ANK), m(TOE), f"shin.{side}", z=(0, 0, 1))

EYE_R = 0.040
EYE_C = {"L": HC + np.array([0.070, -0.104, 0.022]), "R": HC + np.array([-0.070, -0.104, 0.022])}
for side in ("L", "R"):
    c = EYE_C[side]
    bone(f"eye.{side}", c, c + np.array([0, -0.06, 0]), "head", z=(0, 0, 1))
    bone(f"lid_up.{side}", c, c + np.array([0, -0.05, 0]), "head", z=(0, 0, 1))
    bone(f"lid_lo.{side}", c, c + np.array([0, -0.04, 0]), "head", z=(0, 0, 1))

# --------------------------------------------------------------- weights
def seg_dist(P, a, b):
    ab = b - a; t = np.clip(((P - a) @ ab) / (ab @ ab), 0, 1)
    return np.linalg.norm(P - (a + t[:, None] * ab), axis=1)

def weights_soft(P, cands, power=6, floor=0.02):
    names = list(cands)
    D = np.stack([seg_dist(P, BONES[n][0], BONES[n][1]) * cands[n] + 0.004 for n in names], 1)
    Wt = D ** -power; Wt /= Wt.sum(1, keepdims=True)
    Wt = np.maximum(Wt - floor * 0.5, 0); Wt /= Wt.sum(1, keepdims=True)   # continuous taper (no creases)
    return {n: Wt[:, i] for i, n in enumerate(names)}

def weights_chains(P, shared, chains, power=6):
    """hard-assign each vertex to its nearest chain, soft blend inside it."""
    cd = []
    for ch in chains:
        cd.append(np.min(np.stack([seg_dist(P, BONES[n][0], BONES[n][1]) * s for n, s in ch.items()], 1), 1))
    win = np.argmin(np.stack(cd, 1), 1)
    out = {}
    for ci, ch in enumerate(chains):
        sel = win == ci
        if not sel.any():
            continue
        cand = dict(shared); cand.update(ch)
        w = weights_soft(P[sel], cand, power)
        for n, arr in w.items():
            full = out.setdefault(n, np.zeros(len(P)))
            full[sel] += arr
    return out

def apply_weights(ob, wdict):
    for n, w in wdict.items():
        idx = np.nonzero(w > 1e-4)[0]
        if len(idx) == 0:
            continue
        vg = ob.vertex_groups.get(n) or ob.vertex_groups.new(name=n)
        for i in idx:
            vg.add([int(i)], float(w[i]), "REPLACE")

def mirror_cands(c):
    out = {}
    for n, s in c.items():
        out[n] = s
        if n.endswith(".L"):
            out[n[:-2] + ".R"] = s
    return out

# ================================================================ HEAD
def head_sdf(X, Y, Z):
    x = X; y = Y; z = Z - HC[2]
    ax = np.abs(x)
    cran = ell(ax, y, z, (0, 0.012, 0.055), (0.138, 0.150, 0.158))
    jaw = ell(ax, y, z, (0, -0.012, -0.062), (0.138, 0.126, 0.122))
    d = smin(cran, jaw, 0.06)
    cheek = ell(ax, y, z, (0.066, -0.080, -0.058), (0.052, 0.050, 0.046))
    d = smin(d, cheek, 0.03)
    chin = ell(ax, y, z, (0.0, -0.075, -0.150), (0.075, 0.06, 0.045))
    d = smin(d, chin, 0.03)
    nose = ell(ax, y, z, (0.0, -0.152, -0.045), (0.040, 0.034, 0.030))
    d = smin(d, nose, 0.014)
    # ears (slightly cupped)
    ear = ell(ax, y, z, (0.150, 0.018, -0.030), (0.030, 0.042, 0.062))
    cup = ell(ax, y, z, (0.170, 0.004, -0.030), (0.013, 0.028, 0.044))
    ear = smax(ear, -cup, 0.006)
    d = smin(d, ear, 0.012)
    # neck
    neck = rcone(X, Y, Z, (0, 0.018, 1.27), (0, 0.012, 1.47), 0.058, 0.055)
    d = smin(d, neck, 0.03)
    # eye sockets
    for c in EYE_C.values():
        d = smax(d, -sph(X, Y, Z, c, EYE_R + 0.0045), 0.006)
    return d

print("head sdf...")
hv, hf = sdf_to_mesh(head_sdf, (-0.20, -0.215, 1.25), (0.20, 0.19, 1.80), 0.0022)
head = make_obj("Justin_head", hv, hf, [M["skin"]], decimate=0.45)
hv = verts_np(head)

def g3(P, c, r):
    return np.exp(-np.sum((P - c) ** 2, 1) / (r * r))

def skin_colours(P, with_head=True):
    col = np.tile(np.array(SKIN), (len(P), 1))
    def mix(w, c):
        w = np.clip(w, 0, 1)[:, None]; col[:] = col * (1 - w) + np.array(c) * w
    if with_head:
        mix(0.85 * g3(P, HC + [0, -0.17, -0.045], 0.045), srgb(244, 128, 104))  # rosy nose
        for sx in (1, -1):
            mix(0.38 * g3(P, HC + [0.085 * sx, -0.10, -0.075], 0.040), srgb(240, 128, 108))  # blush
            mix(0.45 * g3(P, HC + [0.16 * sx, 0.02, -0.04], 0.04), srgb(236, 140, 110))      # ears
        # faded sides / back of the short haircut
        y = P[:, 1]; z = P[:, 2] - HC[2]; x = P[:, 0]
        hl = np.interp(y, [-0.20, -0.075, -0.045, 0.0, 0.05, 0.12, 0.2], [0.17, 0.17, 0.02, -0.005, 0.0, -0.09, -0.12])
        m = sstep(hl, hl + 0.012, z) * sstep(-0.11, -0.06, y + 0.0 * x)
        m = np.maximum(m, sstep(hl, hl + 0.012, z) * (np.abs(x) > 0.11))
        dens = 0.55 + 0.4 * sstep(hl, hl + 0.07, z)
        fm = np.clip(m * dens * 1.15, 0, 1)
        mix(fm, srgb(58, 46, 42))
        return col, fm
    return col

_hc, _fm = skin_colours(hv)
vcol(head, "skin_col", _hc)
vcol(head, "fade", np.stack([_fm] * 3, 1))

# ================================================================ HAIR
HAIR_CLUMPS = [  # local head coords (front = -Y): swept-up quiff + short clean flicks
    ([(0.000, -0.135, 0.180), (0.000, -0.162, 0.258), (0.020, -0.122, 0.312), (0.050, -0.060, 0.334)], [0.050, 0.054, 0.040, 0.014]),
    ([(-0.060, -0.125, 0.180), (-0.085, -0.140, 0.250), (-0.120, -0.100, 0.292), (-0.158, -0.058, 0.305)], [0.044, 0.040, 0.028, 0.012]),
    ([(0.060, -0.125, 0.180), (0.085, -0.135, 0.255), (0.120, -0.090, 0.300), (0.152, -0.050, 0.308)], [0.044, 0.040, 0.026, 0.012]),
    ([(-0.030, -0.070, 0.262), (-0.060, -0.010, 0.318), (-0.080, 0.050, 0.322)], [0.042, 0.030, 0.014]),
    ([(-0.100, -0.080, 0.175), (-0.150, -0.070, 0.212), (-0.192, -0.048, 0.238)], [0.036, 0.026, 0.011]),
    ([(-0.100, -0.030, 0.215), (-0.150, 0.000, 0.250), (-0.182, 0.030, 0.268)], [0.034, 0.024, 0.010]),
    ([(0.100, -0.080, 0.175), (0.150, -0.065, 0.212), (0.182, -0.040, 0.232)], [0.036, 0.025, 0.011]),
    ([(0.100, -0.020, 0.220), (0.145, 0.010, 0.255), (0.172, 0.040, 0.262)], [0.032, 0.022, 0.010]),
    ([(0.0, 0.02, 0.24), (0.0, 0.10, 0.23), (0.0, 0.15, 0.17), (0.0, 0.17, 0.11)], [0.06, 0.05, 0.035, 0.014]),
    ([(-0.06, 0.05, 0.22), (-0.10, 0.11, 0.18), (-0.115, 0.14, 0.13)], [0.05, 0.034, 0.012]),
    ([(0.06, 0.05, 0.22), (0.10, 0.11, 0.18), (0.115, 0.14, 0.13)], [0.05, 0.034, 0.012]),
]

def hair_sdf(X, Y, Z):
    x = X; y = Y; z = Z - HC[2]
    cap = ell(x, y, z, (0, 0.010, 0.080), (0.128, 0.160, 0.152))
    cut = 0.135 + 0.25 * np.clip(-y - 0.05, 0, 1) - np.clip(y, 0, 1) * 0.7   # lower toward the back
    cap = smax(cap, (cut - z), 0.02)
    mass = ell(x, y, z, (0.0, -0.05, 0.255), (0.138, 0.125, 0.09))
    d = smin(cap, mass, 0.03)
    for pts, rads in HAIR_CLUMPS:
        d = smin(d, chain(x, y, z, pts, rads), 0.028)
    return d

print("hair sdf...")
rv, rf = sdf_to_mesh(hair_sdf, (-0.27, -0.23, 1.62), (0.25, 0.22, 1.94), 0.002)
hair = make_obj("Justin_hair", rv, rf, [M["hair"]], decimate=0.25)

# ================================================================ EYES + LIDS
def uv_sphere(r, nu=48, nv=32):
    v = []; f = []
    for i in range(nv + 1):
        th = math.pi * i / nv
        for j in range(nu):
            ph = 2 * math.pi * j / nu
            v.append((r * math.sin(th) * math.cos(ph), r * math.sin(th) * math.sin(ph), r * math.cos(th)))
    for i in range(nv):
        for j in range(nu):
            a = i * nu + j; b = i * nu + (j + 1) % nu
            f.append((a, b, b + nu, a + nu))
    return np.array(v), np.array(f)

def lid_mesh(r_in, r_out, a0, a1, n_a=18, n_b=40, bmax=78, lash_side=None):
    """spherical shell patch; alpha measured around X axis from +Z toward -Y."""
    v = []; f = []; mats = []
    A = np.linspace(a0, a1, n_a) * D2R; B = np.linspace(-bmax, bmax, n_b) * D2R
    def pt(r, a, b):
        return (r * math.sin(b), -r * math.cos(b) * math.sin(a), r * math.cos(b) * math.cos(a))
    for r in (r_out, r_in):
        for a in A:
            for b in B:
                v.append(pt(r, a, b))
    no = n_a * n_b
    for layer in (0, 1):
        o = layer * no
        for i in range(n_a - 1):
            for j in range(n_b - 1):
                q = (o + i * n_b + j, o + i * n_b + j + 1, o + (i + 1) * n_b + j + 1, o + (i + 1) * n_b + j)
                f.append(q if layer == 0 else q[::-1])
                lash = (lash_side == "end" and i >= n_a - 3) or (lash_side == "start" and i <= 1)
                mats.append(1 if (lash and layer == 0) else 0)
    for i in (0, n_a - 1):   # rims
        for j in range(n_b - 1):
            f.append((i * n_b + j, no + i * n_b + j, no + i * n_b + j + 1, i * n_b + j + 1))
            mats.append(1 if ((lash_side == "end" and i == n_a - 1) or (lash_side == "start" and i == 0)) else 0)
    for j in (0, n_b - 1):
        for i in range(n_a - 1):
            f.append((i * n_b + j, (i + 1) * n_b + j, no + (i + 1) * n_b + j, no + i * n_b + j))
            mats.append(0)
    return np.array(v), np.array(f), mats

LID_UP_EDGE = 44.0   # degrees from top: rest opening
LID_LO_EDGE = 150.0
eye_objs = {}
for side in ("L", "R"):
    c = EYE_C[side]
    ev, ef = uv_sphere(EYE_R)
    eo = make_obj(f"Justin_eye.{side}", ev, ef, [M["eye"]])
    eo.location = Vector(c)
    # rotate mesh so the iris axis is -Y (sphere poles are on Z; shader uses -Y)
    eye_objs[side] = eo
    for nm, a0, a1, lash in ((f"Justin_lidup.{side}", -70, LID_UP_EDGE, "end"),
                             (f"Justin_lidlo.{side}", LID_LO_EDGE, 235, "start")):
        lv, lf, lm = lid_mesh(EYE_R + 0.0010, EYE_R + 0.0042, a0, a1, lash_side=lash if "up" in nm else None)
        lo = make_obj(nm, lv, lf, [M["skin"], M["lash"]])
        set_face_mats(lo, lm)
        lo.location = Vector(c)
        vcol(lo, "skin_col", np.tile(np.array(SKIN) * np.array([0.97, 0.93, 0.92]), (len(lv), 1)))

# ---------------------------------------------------------------- head BVH (for face projection)
HFACES = [tuple(p.vertices) for p in head.data.polygons]
hbvh = BVHTree.FromPolygons([tuple(p) for p in hv], HFACES)

def jaw_weight(P):
    mz = HC[2] - 0.088
    return (sstep(mz + 0.002, mz - 0.03, P[:, 2]) * sstep(0.03, -0.06, P[:, 1]) * sstep(1.33, 1.40, P[:, 2])
            * (1 - sstep(0.07, 0.14, np.abs(P[:, 0])) * 0.7))

JAW_MAX = {"open": -0.030, "shock": -0.044}
def jaw_deform(P, amt):
    co = P.copy(); w = jaw_weight(P)
    co[:, 2] += amt * w; co[:, 1] -= 0.08 * amt * w
    return co
_bvh_cache = {}
def head_bvh(amt):
    if abs(amt) < 1e-6:
        return hbvh
    k = round(amt, 5)
    if k not in _bvh_cache:
        _bvh_cache[k] = BVHTree.FromPolygons([tuple(p) for p in jaw_deform(hv, amt)], HFACES)
    return _bvh_cache[k]

def project(x, z, off=0.0012, y0=-0.5, bvh=None):
    hit = (bvh or hbvh).ray_cast(Vector((x, y0, z)), Vector((0, 1, 0)))
    if hit[0] is None:
        raise RuntimeError(f"no face hit at {x},{z}")
    return np.array(hit[0]) + off * np.array(hit[1]), np.array(hit[1])

# ================================================================ MOUTH (shape-keyed decal mesh)
MOUTH_C = (0.004, HC[2] - 0.088)
NS = 28
ROWS = 9

def mouth_shape(w=0.040, cl=0.006, cr=0.003, up=0.0, lo=0.0, th=0.0028, teeth=0.0, tongue=0.0,
                round_=0.0, dx=0.0, curve=0.0):
    s = np.linspace(-1, 1, NS)
    sgn = np.where(s > 0, cl, cr)
    corner = sgn * s * s + curve * s * s
    xs = MOUTH_C[0] + dx + w * (np.sin(s * math.pi / 2) * round_ + s * (1 - round_))
    prof_u = (1 - s * s) ** (0.6 + 0.6 * round_)
    prof_l = (1 - s * s) ** (0.5 + 0.5 * round_)
    zu = up * prof_u + corner
    zl = corner - th * (1 - s ** 4) + lo * prof_l
    h = np.maximum(zu - zl, 1e-6)
    tb = np.minimum(teeth, 0.42 * h); tg = np.minimum(tongue, 0.38 * h)
    fr = [0, None, None, None, None, None, None, None, 1]
    rows = []
    for r in range(ROWS):
        if r == 0: z = zu
        elif r == 1: z = zu - tb * 0.55
        elif r == 2: z = zu - tb
        elif r == 6: z = zl + tg
        elif r == 7: z = zl + tg * 0.45
        elif r == 8: z = zl
        else:
            f = (r - 2) / 4.0
            z = (zu - tb) * (1 - f) + (zl + tg) * f
        rows.append(z)
    return xs, np.array(rows) + MOUTH_C[1]

JAW_FOR_KEY = {"open": JAW_MAX["open"], "round": 0.55 * JAW_MAX["open"], "wide": 0.25 * JAW_MAX["open"],
               "shock": JAW_MAX["shock"]}
def mouth_points(params, key=None):
    xs, rows = mouth_shape(**params)
    bvh = head_bvh(JAW_FOR_KEY.get(key, 0.0))
    P = []
    for r in range(ROWS):
        for j in range(NS):
            p, n = project(xs[j], rows[r][j], off=0.0020 - 0.0008 * (r in (3, 4, 5)), bvh=bvh)
            P.append(p)
    return np.array(P)

MOUTH_KEYS = {
    "smile": dict(w=0.062, cl=0.024, cr=0.024, up=-0.002, lo=-0.005, th=0.0045),
    "smirk_L": dict(w=0.056, cl=0.024, cr=-0.002, dx=0.007, th=0.0045),
    "smirk_R": dict(w=0.056, cl=0.004, cr=0.021, dx=-0.006, th=0.0045),
    "frown": dict(w=0.044, cl=-0.016, cr=-0.016, up=0.004, th=0.004),
    "open": dict(w=0.040, up=0.007, lo=-0.032, teeth=0.006, tongue=0.009),
    "wide": dict(w=0.050, cl=0.006, cr=0.004, up=0.003, lo=-0.011, teeth=0.0055, tongue=0.002),
    "round": dict(w=0.018, up=0.007, lo=-0.020, round_=1.0, teeth=0.002, tongue=0.005, cl=0.0, cr=0.0),
    "press": dict(w=0.036, up=-0.0015, th=0.0016, cl=0.003, cr=0.002),
    "grimace": dict(w=0.062, cl=-0.008, cr=-0.004, up=0.004, lo=-0.010, teeth=0.0085, tongue=0.0, th=0.003),
    "shock": dict(w=0.030, up=0.012, lo=-0.050, round_=0.85, teeth=0.005, tongue=0.012, cl=0.0, cr=0.0),
}
BASE_MOUTH = dict(w=0.052, cl=0.012, cr=0.002, th=0.0048, dx=0.004)
mp0 = mouth_points(BASE_MOUTH)
mf = []; mm = []
for r in range(ROWS - 1):
    for j in range(NS - 1):
        a = r * NS + j
        mf.append((a, a + 1, a + NS + 1, a + NS))
        mm.append(1 if r < 2 else (2 if r >= 6 else 0))
mouth = make_obj("Justin_mouth", mp0, np.array(mf), [M["mouth"], M["teeth"], M["tongue"]])
set_face_mats(mouth, mm)
mouth.shape_key_add(name="Basis")
for k, p in MOUTH_KEYS.items():
    full = dict(BASE_MOUTH); full.update(p)
    sk = mouth.shape_key_add(name=k, from_mix=False)
    sk.data.foreach_set("co", mouth_points(full, k).ravel())
    sk.slider_min = -0.5; sk.slider_max = 1.5

# ================================================================ BROWS
NB = 22
def brow_points(side, raise_=0.0, inner=0.0, outer=0.0, inx=0.0, arch=0.0):
    sx = 1 if side == "L" else -1
    s = np.linspace(0, 1, NB)
    x = 0.022 + inx + (0.112 - 0.022 - inx) * s
    z = HC[2] + 0.090 + raise_ + 0.012 * np.sin(math.pi * s ** 0.9) * (1 + arch) - 0.004 * s \
        + inner * (1 - s) ** 1.5 + outer * s ** 1.5
    th = 0.0135 + 0.0075 * np.sin(math.pi * (0.15 + 0.8 * s)) ** 0.7
    th = th * (1 - 0.35 * s ** 3)
    verts = []
    centers = []
    for i in range(NB):
        p, n = project(sx * x[i], z[i], off=0.0058)
        centers.append((p, n))
    for i in range(NB):
        p, n = centers[i]
        t = centers[min(i + 1, NB - 1)][0] - centers[max(i - 1, 0)][0]; t = unit(t)
        up = unit(np.cross(n, t)) * (1 if sx > 0 else -1)
        if up[2] < 0: up = -up
        for k in range(10):
            a = 2 * math.pi * k / 10
            verts.append(p + up * math.cos(a) * th[i] * 0.5 + n * math.sin(a) * 0.0055)
    verts.append(centers[0][0]); verts.append(centers[-1][0])
    return np.array(verts)

def brow_faces(off):
    f = []
    for i in range(NB - 1):
        for k in range(10):
            a = off + i * 10 + k; b = off + i * 10 + (k + 1) % 10
            f.append((a, b, b + 10, a + 10))
    c0 = off + NB * 10; c1 = c0 + 1
    for k in range(10):
        f.append((off + (k + 1) % 10, off + k, c0))
        a = off + (NB - 1) * 10
        f.append((a + k, a + (k + 1) % 10, c1))
    return f

BROW_KEYS = {"up": dict(raise_=0.024, inner=0.004, arch=0.3),
             "furrow": dict(raise_=-0.005, inner=-0.017, outer=0.005, inx=0.006, arch=-0.5),
             "sad": dict(inner=0.022, outer=-0.006, arch=-0.7)}
bl = brow_points("L"); br = brow_points("R"); nbv = len(bl)
bf = brow_faces(0) + brow_faces(nbv)
me = bpy.data.meshes.new("Justin_brows")
me.from_pydata([tuple(p) for p in np.concatenate([bl, br])], [], bf); me.validate()
me.polygons.foreach_set("use_smooth", [True] * len(me.polygons))
brows = bpy.data.objects.new("Justin_brows", me); COL.objects.link(brows); me.materials.append(M["brow"])
bm_ = bmesh.new(); bm_.from_mesh(me); bmesh.ops.recalc_face_normals(bm_, faces=bm_.faces); bm_.to_mesh(me); bm_.free()
brows.shape_key_add(name="Basis")
for side in ("L", "R"):
    for k, p in BROW_KEYS.items():
        sk = brows.shape_key_add(name=f"{k}_{side}", from_mix=False)
        co = np.concatenate([bl, br])
        if side == "L": co[:nbv] = brow_points("L", **p)
        else: co[nbv:] = brow_points("R", **p)
        sk.data.foreach_set("co", co.ravel()); sk.slider_min = -0.5; sk.slider_max = 1.5

# ---------------------------------------------------------------- head shape keys (jaw, cheeks)
head.shape_key_add(name="Basis")
P = hv; z = P[:, 2]; y = P[:, 1]; x = P[:, 0]
mz = MOUTH_C[1]
for nm, amt in (("jaw_open", JAW_MAX["open"]), ("jaw_shock", JAW_MAX["shock"])):
    co = jaw_deform(P, amt)
    sk = head.shape_key_add(name=nm, from_mix=False); sk.data.foreach_set("co", co.ravel())
for side, sx in (("L", 1), ("R", -1)):
    c = HC + np.array([0.075 * sx, -0.10, -0.06])
    w = g3(P, c, 0.032) * (y < -0.02)
    co = P.copy(); co[:, 2] += 0.007 * w; co[:, 1] -= 0.004 * w; co[:, 0] += 0.002 * sx * w
    sk = head.shape_key_add(name=f"cheek_{side}", from_mix=False); sk.data.foreach_set("co", co.ravel())

# ================================================================ BODY: jacket / tee / pants / shoes / hands
T_JK = 0.013
def gap(Z):
    return 0.066 + 0.024 * sstep(1.12, 1.33, Z)

WC = W - 0.075 * dA      # sleeve end (cuff takes over)
def torso_solid(X, Y, Z):
    ax = np.abs(X)
    chest = ell(ax, Y, Z, (0, 0.0, 1.10), (0.25, 0.152, 0.245))
    belly = ell(ax, Y, Z, (0, 0.0, 0.84), (0.238, 0.155, 0.26))
    d = smin(chest, belly, 0.09)
    sh = ell(ax, Y, Z, (0.205, 0.0, 1.245), (0.11, 0.13, 0.10))
    return smin(d, sh, 0.05)

def sleeve_solid(X, Y, Z):
    return chain(np.abs(X), Y, Z, [S - 0.02 * dA, E, WC], [0.090, 0.080, 0.071])

def jacket_solid(X, Y, Z):
    return smin(torso_solid(X, Y, Z), sleeve_solid(X, Y, Z), 0.05)

def jacket_sdf(X, Y, Z):
    J = jacket_solid(X, Y, Z)
    d = smax(J, -(J + T_JK), 0.003)
    d = smax(d, 0.605 - Z, 0.004)                                     # hem open
    d = smax(d, -(np.sqrt(X * X + (Y - 0.012) ** 2) - 0.088), 0.01)  # neck hole
    ax = np.abs(X)
    cut = (ax - WC[0]) * dA[0] + (Z - WC[2]) * dA[2]                 # sleeve ends
    d = smax(d, cut, 0.004)
    front = np.maximum(np.abs(X) - gap(Z), Y + 0.04)                 # open front
    d = smax(d, -front, 0.004)
    return d

print("jacket sdf...")
jv, jf = sdf_to_mesh(jacket_sdf, (-0.70, -0.20, 0.58), (0.70, 0.20, 1.40), 0.0035)
jacket = make_obj("Justin_jacket", jv, jf, [M["jacket"], M["lining"], M["rib"]], decimate=1.0)
fc = face_centers(jacket)
Jv = jacket_solid(fc[:, 0], fc[:, 1], fc[:, 2])
mi = np.where(Jv < -T_JK * 0.5, 1, 0)
mi = np.where((mi == 0) & (fc[:, 2] < 0.655), 2, mi)
set_face_mats(jacket, mi)

# -- jacket outer BVH for decorations
jverts = verts_np(jacket)
jbvh = BVHTree.FromPolygons([tuple(p) for p in jverts], [tuple(p.vertices) for p in jacket.data.polygons])

def jcast(origin, direction):
    hit = jbvh.ray_cast(Vector(origin), Vector(direction))
    return np.array(hit[0]), np.array(hit[1])

# tee
def tee_sdf(X, Y, Z):
    ax = np.abs(X)
    a = ell(ax, Y, Z, (0, 0.0, 1.08), (0.205, 0.128, 0.27))
    b = ell(ax, Y, Z, (0, 0.0, 0.80), (0.205, 0.135, 0.24))
    d = smin(a, b, 0.06)
    return smax(d, 0.70 - Z, 0.004)
print("tee sdf...")
tv, tf = sdf_to_mesh(tee_sdf, (-0.23, -0.16, 0.6), (0.23, 0.16, 1.36), 0.004)
tee = make_obj("Justin_tee", tv, tf, [M["tee"]], decimate=0.4)

# collars: jacket rib collar (olive out / orange in) + tee crew neck
def collar_sdf(X, Y, Z):
    # tilted ring around the neck, open at the front
    yy = Y - 0.018; zz = Z - (1.352 + 0.10 * np.clip(Y, -0.2, 0.2) * -0.0 + 0.12 * Y * 0 )
    zz = Z - (1.345 + 0.16 * (Y - 0.0) * -0.25 * 0 + (-0.0))
    tilt = 0.28  # front lower
    zz = Z - 1.355 - tilt * yy
    rad = np.sqrt((X / 1.10) ** 2 + yy ** 2)
    q = np.sqrt((rad - 0.096) ** 2 + (zz / 1.5) ** 2) - 0.019
    d = smax(q, -np.maximum(np.abs(X) - 0.05, Y + 0.03), 0.004)
    return d
print("collar sdf...")
cv, cf = sdf_to_mesh(collar_sdf, (-0.15, -0.16, 1.28), (0.15, 0.14, 1.43), 0.0025)
collar = make_obj("Justin_collar", cv, cf, [M["ribc"], M["lining"]], decimate=0.5)
fc = face_centers(collar); fn = face_normals(collar)
radial = np.stack([fc[:, 0], fc[:, 1] - 0.018, np.zeros(len(fc))], 1)
inward = np.einsum("ij,ij->i", fn, radial) < 0
up = fn[:, 2] > 0.55
set_face_mats(collar, np.where(inward | up, 1, 0))

def crew_sdf(X, Y, Z):
    yy = Y - 0.012; zz = Z - 1.335 - 0.2 * yy
    rad = np.sqrt((X / 1.05) ** 2 + yy ** 2)
    return np.sqrt((rad - 0.066) ** 2 + (zz / 1.6) ** 2) - 0.010
crv, crf = sdf_to_mesh(crew_sdf, (-0.1, -0.1, 1.29), (0.1, 0.1, 1.38), 0.002)
crew = make_obj("Justin_crew", crv, crf, [M["tee"]], decimate=0.5)

# cuffs (left mesh, mirrored)
def cuff_sdf(X, Y, Z):
    a = WC - 0.012 * dA; b = W - 0.006 * dA
    o = rcone(X, Y, Z, a, b, 0.064, 0.058)
    i = rcone(X, Y, Z, a - 0.02 * dA, b + 0.02 * dA, 0.050, 0.046)
    return smax(o, -i, 0.003)
lo_ = np.minimum(WC, W) - 0.09; hi_ = np.maximum(WC, W) + 0.09
cuv, cuf = sdf_to_mesh(cuff_sdf, lo_, hi_, 0.002)
cuff = make_obj("Justin_cuffs", *merge((cuv, cuf), mirror_mesh(cuv, cuf)), [M["ribc"], M["lining"]], decimate=0.5)
fc = face_centers(cuff); fn = face_normals(cuff)
# lining on the inside of the cuffs
inside = []
for c_, n_ in zip(fc, fn):
    sx = 1 if c_[0] > 0 else -1
    axis_d = dA * np.array([sx, 1, 1]); a0 = WC * np.array([sx, 1, 1])
    v = c_ - a0; radial = v - (v @ axis_d) * axis_d
    inside.append(1 if radial @ n_ < 0 else 0)
set_face_mats(cuff, inside)

# hem welt pockets + zipper + J patch + sleeve pocket (decorations)
def tube(points, r, nseg=10, flat=1.0, normals=None):
    v = []; f = []
    pts = np.array(points)
    for i, p in enumerate(pts):
        t = unit(pts[min(i + 1, len(pts) - 1)] - pts[max(i - 1, 0)])
        a = normals[i] if normals is not None else np.array([0, -1, 0])
        a = unit(a - (a @ t) * t); b = np.cross(t, a)
        for k in range(nseg):
            ang = 2 * math.pi * k / nseg
            v.append(p + r * (math.cos(ang) * a * flat + math.sin(ang) * b))
    n = len(pts)
    for i in range(n - 1):
        for k in range(nseg):
            q = (i * nseg + k, i * nseg + (k + 1) % nseg, (i + 1) * nseg + (k + 1) % nseg, (i + 1) * nseg + k)
            f.append((q[0], q[1], q[2])); f.append((q[0], q[2], q[3]))
    v.append(pts[0]); v.append(pts[-1]); c0 = len(v) - 2; c1 = len(v) - 1
    for k in range(nseg):
        f.append(((k + 1) % nseg, k, c0)); f.append(((n - 1) * nseg + k, (n - 1) * nseg + (k + 1) % nseg, c1))
    return np.array(v), np.array(f)

zip_parts = []
for sx in (1, -1):
    pts = []; nrm = []
    for zz in np.linspace(0.612, 1.325, 70):
        p, n = jcast((sx * (gap(zz) + 0.006), -0.5, zz), (0, 1, 0))
        pts.append(p + n * 0.002); nrm.append(n)
    zip_parts.append(tube(pts, 0.0048, 8, flat=0.5, normals=nrm))
# zip pull (hangs at the hem on his left edge)
pz, nz = jcast((gap(0.64) + 0.006, -0.5, 0.64), (0, 1, 0))
def pull_sdf(X, Y, Z):
    return rbox(X, Y, Z, pz + nz * 0.006 + np.array([0, 0, -0.012]), (0.007, 0.003, 0.016), 0.0025)
pv, pf = sdf_to_mesh(pull_sdf, pz - 0.05, pz + 0.05, 0.0012)
zip_parts.append((pv, pf))
zipper = make_obj("Justin_zipper", *merge(*zip_parts), [M["zip"]])

# welt pockets (dark slits)
welts = []
for sx in (1, -1):
    pts = []
    for t in np.linspace(0, 1, 12):
        xx = sx * (0.150 + 0.045 * t); zz = 0.74 + 0.11 * t
        p, n = jcast((xx, -0.5, zz), (0, 1, 0)); pts.append(p + 0.001 * n)
    welts.append(tube(pts, 0.0032, 8, flat=0.6))
welt = make_obj("Justin_welts", *merge(*welts), [M["rib"]])

# J patch on his left chest
pc, pn = jcast((0.150, -0.5, 1.135), (0, 1, 0))
zax = unit(pn); xax = unit(np.cross(np.array([0, 0, 1.0]), zax)); xax = -xax if xax[0] < 0 else xax
yax = np.cross(zax, xax)
RJ = np.stack([xax, yax, zax], 1)   # columns
def patch_local_to_world(v):
    return pc + v @ RJ.T

def J_sdf_local(X, Y, Z):
    d = rcone(X, Y, Z, (-0.012, 0.022, 0), (0.016, 0.022, 0), 0.0042, 0.0042)
    d = np.minimum(d, rcone(X, Y, Z, (0.007, 0.022, 0), (0.007, -0.010, 0), 0.0050, 0.0050))
    arc = [(-0.004 + 0.011 * math.cos(a), -0.010 + 0.011 * math.sin(a), 0) for a in np.linspace(0, -math.pi * 1.0, 9)]
    d = np.minimum(d, chain(X, Y, Z, arc, [0.0050] * 9))
    d = np.minimum(d, sph(X, Y, Z, arc[-1], 0.0058))
    return smax(d, np.abs(Z - 0.0035) - 0.0028, 0.0015)
def P_sdf_local(X, Y, Z):
    return rbox(X, Y, Z, (0, 0.004, 0.0005), (0.026, 0.032, 0.0022), 0.0021)
jv_, jf_ = sdf_to_mesh(J_sdf_local, (-0.03, -0.035, -0.005), (0.03, 0.04, 0.012), 0.0006)
pv_, pf_ = sdf_to_mesh(P_sdf_local, (-0.03, -0.035, -0.005), (0.03, 0.045, 0.005), 0.0008)
# backing curved slightly to the chest
Jmesh = make_obj("Justin_Jletter", patch_local_to_world(jv_ + [0, 0, 0.0012]), jf_, [M["gold"]], decimate=0.5)
Pmesh = make_obj("Justin_Jpatch", patch_local_to_world(pv_), pf_, [M["patch"]], decimate=0.5)

# sleeve pocket on his left upper arm (outer side)
o_dir = unit(np.array([math.cos(ARM_ANG), -0.55, math.sin(ARM_ANG)]))
ax0 = S + 0.17 * dA
hitp, hitn = jcast(ax0 + 0.4 * o_dir, -o_dir)
pz_ = unit(hitn); py_ = unit(-dA - ((-dA) @ pz_) * pz_); px_ = np.cross(py_, pz_)
RP = np.stack([px_, py_, pz_], 1)
def pocket_sdf_local(X, Y, Z):
    return rbox(X, Y, Z, (0, 0, -0.002), (0.024, 0.048, 0.008), 0.006)
pkv, pkf = sdf_to_mesh(pocket_sdf_local, (-0.04, -0.06, -0.02), (0.04, 0.06, 0.02), 0.0015)
pocket = make_obj("Justin_sleevepocket", hitp + pkv @ RP.T, pkf, [M["jacket"]], decimate=0.6)
zp = [hitp + RP @ np.array([0.019, yy, 0.0075]) for yy in np.linspace(0.04, -0.042, 12)]
zpv, zpf = tube(zp, 0.0022, 6)
def pullp_sdf(X, Y, Z):
    return rbox(X, Y, Z, (0.019, 0.050, 0.008), (0.0035, 0.009, 0.0018), 0.0012)
ppv, ppf = sdf_to_mesh(pullp_sdf, (0.0, 0.03, -0.005), (0.04, 0.07, 0.02), 0.0007)
pzip = make_obj("Justin_pocketzip", *merge((zpv, zpf), (hitp + ppv @ RP.T, ppf)), [M["zip"]])

# pants
def pants_sdf(X, Y, Z):
    ax = np.abs(X)
    pel = ell(ax, Y, Z, (0, 0.005, 0.78), (0.21, 0.142, 0.20))
    leg = chain(ax, Y, Z, [HIP - [0, 0, 0.02], KNEE, ANK + [0, 0, 0.09]], [0.096, 0.080, 0.070])
    d = smin(pel, leg, 0.04)
    cuff = rcone(ax, Y, Z, ANK + [0, 0, 0.065], ANK + [0, 0, 0.012], 0.060, 0.057)
    d = smin(d, cuff, 0.018)
    return smax(d, 0.115 - Z, 0.004)
print("pants sdf...")
pav, paf = sdf_to_mesh(pants_sdf, (-0.27, -0.2, 0.10), (0.27, 0.19, 0.95), 0.0035)
pants = make_obj("Justin_pants", pav, paf, [M["pants"], M["pantsrib"]], decimate=0.35)
fc = face_centers(pants)
set_face_mats(pants, np.where(fc[:, 2] < 0.175, 1, 0))

# shoes
def shoe_sdf(X, Y, Z):
    sole = rbox(X, Y, Z, (0.14, -0.045, 0.024), (0.064, 0.145, 0.024), 0.022)
    upper = ell(X, Y, Z, (0.14, -0.06, 0.052), (0.060, 0.135, 0.062))
    collar_ = rcone(X, Y, Z, (0.14, 0.02, 0.05), (0.14, 0.015, 0.125), 0.058, 0.052)
    u = smin(upper, collar_, 0.035)
    u = smax(u, 0.03 - Z, 0.01)
    u = smax(u, -(np.sqrt((X - 0.14) ** 2 + (Y - 0.012) ** 2) - 0.046) * (Z > 0.10), 0.005)
    return smin(sole, u, 0.008)
print("shoe sdf...")
sv, sf = sdf_to_mesh(shoe_sdf, (0.05, -0.22, -0.01), (0.23, 0.13, 0.15), 0.0022)
shoes = make_obj("Justin_shoes", *merge((sv, sf), mirror_mesh(sv, sf)), [M["shoe"], M["sole"]], decimate=0.7)
fc = face_centers(shoes)
toe = (fc[:, 1] < -0.145) & (fc[:, 2] < 0.065)
set_face_mats(shoes, np.where((fc[:, 2] < 0.046) | toe, 1, 0))
sbvh = BVHTree.FromPolygons([tuple(p) for p in verts_np(shoes)], [tuple(p.vertices) for p in shoes.data.polygons])
laces = []
for sx in (1, -1):
    for yy in np.linspace(-0.10, -0.025, 4):
        pts = []
        for xx in np.linspace(-0.026, 0.026, 7):
            h = sbvh.ray_cast(Vector((sx * 0.14 + xx, yy, 0.3)), Vector((0, 0, -1)))
            pts.append(np.array(h[0]) + np.array([0, 0, 0.002]))
        laces.append(tube(pts, 0.0035, 6, flat=1.0, normals=[np.array([0, 0, 1.0])] * len(pts)))
lace = make_obj("Justin_laces", *merge(*laces), [M["lace"]])

# hands
def hand_sdf(X, Y, Z):
    # into hand frame coords (a,b,c)
    px = X - W[0]; py = Y - W[1]; pz = Z - W[2]
    a = px * U[0] + py * U[1] + pz * U[2]
    b = px * T_[0] + py * T_[1] + pz * T_[2]
    c = px * NP_[0] + py * NP_[1] + pz * NP_[2]
    zero = np.zeros(3)
    palm = rbox(a, b, c, (0.050, 0.0, 0.0), (0.042, 0.042, 0.0145), 0.012)
    pad = ell(a, b, c, (0.045, -0.006, 0.006), (0.036, 0.030, 0.012))
    d = smin(palm, pad, 0.01)
    wrist = rcone(a, b, c, (-0.045, 0, 0), (0.02, 0, 0), 0.027, 0.029)
    d = smin(d, wrist, 0.015)
    def to_l(p):
        q = p - W; return (q @ U, q @ T_, q @ NP_)
    for fn_, (pts, rads) in FINGER_PTS.items():
        lp = [to_l(p) for p in pts]
        rr = list(rads)
        if fn_ != "thumb":
            lp = [(lp[0][0] - 0.012, lp[0][1], lp[0][2])] + lp
            rr = [rads[0]] + rr
        e = chain(a, b, c, lp, rr)
        d = smin(d, e, 0.0065 if fn_ != "thumb" else 0.012)
    return d
print("hand sdf...")
corners = np.array([hp(a, b, c) for a in (-0.06, 0.20) for b in (-0.08, 0.11) for c in (-0.05, 0.08)])
hdv, hdf = sdf_to_mesh(hand_sdf, corners.min(0), corners.max(0), 0.0009)
hands = make_obj("Justin_hands", *merge((hdv, hdf), mirror_mesh(hdv, hdf)), [M["skin"]], decimate=0.3)
hverts = verts_np(hands)
vcol(hands, "skin_col", skin_colours(hverts, with_head=False))

# ================================================================ proportion tweaks
HEAD_SCALE = 1.10   # stylised: bigger head
HAND_SCALE = 1.15   # chunky cartoon hands
def scale_mesh(ob, fn):
    co = verts_np(ob)
    ob.data.vertices.foreach_set("co", fn(co).ravel())
    if ob.data.shape_keys:
        for kb in ob.data.shape_keys.key_blocks:
            a = np.empty(len(kb.data) * 3); kb.data.foreach_get("co", a)
            kb.data.foreach_set("co", fn(a.reshape(-1, 3)).ravel())
    ob.data.update()
HPIV = np.array([0.0, 0.01, 1.40])
hs = lambda P: HPIV + (P - HPIV) * HEAD_SCALE
for ob in (head, hair, mouth, brows):
    scale_mesh(ob, hs)
for side in ("L", "R"):
    for ob in (eye_objs[side], bpy.data.objects[f"Justin_lidup.{side}"], bpy.data.objects[f"Justin_lidlo.{side}"]):
        ob.location = Vector(hs(np.array(ob.location)))
        ob.scale = (HEAD_SCALE,) * 3
for n, (h, t, par, zh) in list(BONES.items()):
    if n == "head" or n.startswith(("eye.", "lid_")):
        BONES[n] = (hs(h), hs(t), par, zh)
WL = W.copy(); WR = W * np.array([-1, 1, 1])
def hand_scale(P):
    P = P.copy(); l = P[:, 0] > 0
    P[l] = WL + (P[l] - WL) * HAND_SCALE
    P[~l] = WR + (P[~l] - WR) * HAND_SCALE
    return P
scale_mesh(hands, hand_scale)
for n, (h, t, par, zh) in list(BONES.items()):
    if n.startswith(("hand.",)) or any(n.startswith(f) for f in FINGER_PTS):
        BONES[n] = (hand_scale(h[None])[0], hand_scale(t[None])[0], par, zh)

# ================================================================ ARMATURE
arm_data = bpy.data.armatures.new("Justin_rig")
rig = bpy.data.objects.new("Justin_rig", arm_data)
COL.objects.link(rig)
bpy.context.view_layer.objects.active = rig
bpy.ops.object.mode_set(mode="EDIT")
eb = arm_data.edit_bones
for name, (h, t, par, zh) in BONES.items():
    b = eb.new(name); b.head = Vector(h); b.tail = Vector(t)
    b.align_roll(Vector(zh))
for name, (h, t, par, zh) in BONES.items():
    if par:
        eb[name].parent = eb[par]
        if np.linalg.norm(BONES[par][1] - h) < 1e-5:
            eb[name].use_connect = False
    if name.startswith(("eye", "lid", "root")):
        eb[name].use_deform = False
bpy.ops.object.mode_set(mode="OBJECT")
for pb in rig.pose.bones:
    pb.rotation_mode = "XYZ" if pb.name.startswith(("eye", "lid")) else "QUATERNION"

# ---- weights
def skin_to(ob, wd):
    apply_weights(ob, wd)
    md = ob.modifiers.new("rig", "ARMATURE"); md.object = rig
    ob.parent = rig

TORSO = {"hips": 1.0, "spine": 1.0, "chest": 1.0}
ARML = {"shoulder.L": 1.1, "upper_arm.L": 1.0, "forearm.L": 1.0}
def to_surface(P_, fn, it=3):
    """project points onto the zero level of fn (so both shell faces share weights)."""
    q = P_.copy(); e = 1e-3
    for _ in range(it):
        d = fn(q[:, 0], q[:, 1], q[:, 2])
        g = np.stack([(fn(q[:, 0] + e, q[:, 1], q[:, 2]) - d) / e, (fn(q[:, 0], q[:, 1] + e, q[:, 2]) - d) / e,
                      (fn(q[:, 0], q[:, 1], q[:, 2] + e) - d) / e], 1)
        g /= np.maximum(np.linalg.norm(g, axis=1, keepdims=True), 1e-6)
        q = q - g * d[:, None]
    return q

def jacket_weights(P_, force_sleeve=None):
    P_ = to_surface(P_, jacket_solid)
    wt = weights_soft(P_, {"hips": 1.0, "spine": 1.0, "chest": 1.0, "shoulder.L": 1.5, "shoulder.R": 1.5,
                           "neck": 1.8}, power=6)
    dt = torso_solid(P_[:, 0], P_[:, 1], P_[:, 2]); ds = sleeve_solid(P_[:, 0], P_[:, 1], P_[:, 2])
    sl = sstep(-0.035, 0.035, dt - ds)
    if force_sleeve is not None:
        sl = np.full(len(P_), force_sleeve)
    out = {n: w * (1 - sl) for n, w in wt.items()}
    for side, sel in (("L", P_[:, 0] > 0), ("R", P_[:, 0] <= 0)):
        wa = weights_soft(P_, {f"shoulder.{side}": 1.0, f"upper_arm.{side}": 1.0, f"forearm.{side}": 1.0}, power=6)
        for n, w in wa.items():
            out[n] = out.get(n, 0) + w * sl * sel
    return out
for ob in (jacket, welt, zipper, Pmesh, Jmesh):
    skin_to(ob, jacket_weights(verts_np(ob)))
for ob in (pocket, pzip):
    skin_to(ob, jacket_weights(verts_np(ob), force_sleeve=1.0))
skin_to(tee, weights_soft(verts_np(tee), {"hips": 1.0, "spine": 1.0, "chest": 1.0, "shoulder.L": 1.3,
                                          "shoulder.R": 1.3, "neck": 1.4}, power=6))
for ob in (collar, crew):
    P_ = verts_np(ob)
    skin_to(ob, weights_soft(P_, {"chest": 1.0, "neck": 1.25, "shoulder.L": 1.3, "shoulder.R": 1.3}, power=4))
P_ = verts_np(cuff)
skin_to(cuff, {"forearm.L": (P_[:, 0] > 0).astype(float), "forearm.R": (P_[:, 0] <= 0).astype(float)})
# pants: chain per leg
P_ = verts_np(pants)
skin_to(pants, weights_chains(P_, {"hips": 1.0},
                              [{"thigh.L": 1.0, "shin.L": 1.0}, {"thigh.R": 1.0, "shin.R": 1.0}], power=6))
P_ = verts_np(shoes)
skin_to(shoes, {"foot.L": (P_[:, 0] > 0).astype(float), "foot.R": (P_[:, 0] <= 0).astype(float)})
P_ = verts_np(lace)
skin_to(lace, {"foot.L": (P_[:, 0] > 0).astype(float), "foot.R": (P_[:, 0] <= 0).astype(float)})
# hands: winner chain per finger, shared hand+forearm
P_ = verts_np(hands)
wh = {}
for side, sel in (("L", P_[:, 0] > 0), ("R", P_[:, 0] <= 0)):
    chains_ = [{f"{fn_}_{i:02d}.{side}": 1.0 for i in (1, 2, 3)} for fn_ in FINGER_PTS]
    sub = weights_chains(P_[sel], {f"hand.{side}": 1.35, f"forearm.{side}": 1.6}, chains_, power=6)
    for n, arr in sub.items():
        full = wh.setdefault(n, np.zeros(len(P_))); full[sel] = arr
skin_to(hands, wh)
# head + neck: explicit z blend
for ob in (head,):
    P_ = verts_np(ob); z = P_[:, 2]
    wh_ = sstep(1.375, 1.445, z)
    wc_ = 1 - sstep(1.27, 1.345, z)
    wn_ = 1 - wh_ - wc_
    skin_to(ob, {"head": wh_, "neck": np.clip(wn_, 0, 1), "chest": wc_})
for ob in (hair, mouth, brows):
    skin_to(ob, {"head": np.ones(len(ob.data.vertices))})

def bone_parent(ob, bname):
    mw = ob.matrix_world.copy()
    ob.parent = rig; ob.parent_type = "BONE"; ob.parent_bone = bname
    bpy.context.view_layer.update()
    ob.matrix_world = mw
for side in ("L", "R"):
    bone_parent(eye_objs[side], f"eye.{side}")
    bone_parent(bpy.data.objects[f"Justin_lidup.{side}"], f"lid_up.{side}")
    bone_parent(bpy.data.objects[f"Justin_lidlo.{side}"], f"lid_lo.{side}")

# ---- face controls: custom props on the rig drive shape keys + lid / eye bones
FACE_PROPS = ["smile", "smirk_L", "smirk_R", "frown", "open", "wide", "round", "press", "grimace", "shock",
              "brow_up_L", "brow_up_R", "brow_furrow_L", "brow_furrow_R", "brow_sad_L", "brow_sad_R",
              "blink_L", "blink_R", "squint", "eyes_wide", "look_x", "look_y", "cheek_L", "cheek_R"]
for p in FACE_PROPS:
    rig[p] = 0.0
    ui = rig.id_properties_ui(p); ui.update(min=-1.0, max=1.5, soft_min=-1.0, soft_max=1.0)

def add_var(drv, name, prop):
    v = drv.variables.new(); v.name = name; v.type = "SINGLE_PROP"
    v.targets[0].id_type = "OBJECT"; v.targets[0].id = rig; v.targets[0].data_path = f'["{prop}"]'

def drive_key(ob, key, expr_props, expr):
    kb = ob.data.shape_keys.key_blocks[key]
    fc_ = kb.driver_add("value"); d = fc_.driver; d.type = "SCRIPTED"
    for nm, pr in expr_props.items():
        add_var(d, nm, pr)
    d.expression = expr

for k in MOUTH_KEYS:
    drive_key(mouth, k, {"v": k}, "v")
drive_key(head, "jaw_open", {"o": "open", "r": "round", "w": "wide"}, "o + 0.55*r + 0.25*w")
drive_key(head, "jaw_shock", {"s": "shock"}, "s")
for side in ("L", "R"):
    drive_key(head, f"cheek_{side}", {"s": "smile", "m": f"smirk_{side}", "c": f"cheek_{side}", "q": "squint"},
              "0.8*s + m + c + 0.3*q")
    drive_key(brows, f"up_{side}", {"v": f"brow_up_{side}"}, "v")
    drive_key(brows, f"furrow_{side}", {"v": f"brow_furrow_{side}"}, "v")
    drive_key(brows, f"sad_{side}", {"v": f"brow_sad_{side}"}, "v")

def drive_bone(bname, idx, props, expr):
    pb = rig.pose.bones[bname]
    fc_ = pb.driver_add("rotation_euler", idx); d = fc_.driver; d.type = "SCRIPTED"
    for nm, pr in props.items():
        add_var(d, nm, pr)
    d.expression = expr
for side in ("L", "R"):
    # lid_up: +X rot opens (edge goes up), so blink is negative. units: radians
    drive_bone(f"lid_up.{side}", 0, {"b": f"blink_{side}", "w": "eyes_wide", "y": "look_y", "q": "squint",
                                      "s": "shock"},
               "-1.30*b + 0.30*w + 0.30*s + 0.30*y - 0.10*q")
    drive_bone(f"lid_lo.{side}", 0, {"b": f"blink_{side}", "q": "squint", "s": "smile", "y": "look_y"},
               "0.32*b + 0.50*q + 0.12*s + 0.12*y")
    drive_bone(f"eye.{side}", 0, {"y": "look_y"}, "0.45*y")
    drive_bone(f"eye.{side}", 2, {"x": "look_x"}, "0.55*x")

# ================================================================ camera, lights, render settings
cam_data = bpy.data.cameras.new("cam"); cam = bpy.data.objects.new("Camera", cam_data)
scene.collection.objects.link(cam); scene.camera = cam
cam_data.lens = 85
cam.location = (0, -6.0, 1.0); cam.rotation_euler = (math.radians(90), 0, 0)

def area(name, loc, rot, size, energy, color):
    ld = bpy.data.lights.new(name, "AREA"); ld.shape = "DISK"; ld.size = size; ld.energy = energy
    ld.color = color
    ob = bpy.data.objects.new(name, ld); scene.collection.objects.link(ob)
    ob.location = loc
    # aim at chest
    d = Vector((0, 0, 1.25)) - Vector(loc)
    ob.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    ld.use_shadow = True
    return ob
area("Key", (-2.2, -3.2, 3.0), None, 2.5, 520, (1.0, 0.94, 0.86))
area("Fill", (2.8, -2.6, 1.6), None, 3.0, 150, (0.9, 0.94, 1.0))
area("RimL", (-2.0, 2.4, 2.6), None, 1.5, 450, (1.0, 0.92, 0.85))
area("RimR", (2.2, 2.2, 2.4), None, 1.5, 380, (0.95, 0.97, 1.0))
area("Face", (0.0, -3.0, 1.75), None, 1.2, 60, (1.0, 0.96, 0.92))
world = bpy.data.worlds.new("world"); scene.world = world; world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.42, 0.36, 0.32, 1)
world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.35

scene.render.engine = "BLENDER_EEVEE"
ee = scene.eevee
ee.taa_render_samples = 64
ee.use_gtao = True; ee.gtao_distance = 0.25; ee.gtao_factor = 1.0
ee.use_soft_shadows = True
ee.shadow_cube_size = "2048"; ee.shadow_cascade_size = "2048"
ee.use_ssr = True
ee.sss_samples = 9
ee.use_bloom = False
scene.render.film_transparent = True
scene.view_settings.view_transform = "AgX"
scene.view_settings.look = "AgX - Punchy"
scene.render.resolution_x = 1080; scene.render.resolution_y = 1920
scene.render.fps = 30

rig["justin_version"] = 1
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=OUT, compress=True)
print("SAVED", OUT, {o.name: len(o.data.polygons) for o in COL.objects if o.type == "MESH"})
