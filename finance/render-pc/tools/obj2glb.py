"""obj2glb.py <in.obj> <out.glb> [--tex palette.png]

A small OBJ (+MTL) -> binary glTF 2.0 converter (no dependencies beyond the Python standard library). Written for the
Block Money CC0 library (tools/cc0_build.py): older Kenney / Quaternius packs ship OBJ only, and the library is glTF-only.
- one primitive per `usemtl` material; polygons are fan-triangulated; vertices are de-duplicated per (v, vt, vn);
- missing normals are filled with flat face normals;
- material colour from the MTL `Kd` (and `d` for opacity); `--tex` (or an MTL `map_Kd`) embeds a PNG and keeps the UVs
  (Quaternius palette textures), in which case the base colour is white so the texture shows as authored.
Read-only on its inputs. Original code (MIT, this repository).
"""
import json
import math
import os
import struct
import sys


def parse_mtl(path):
    mats, cur = {}, None
    if not os.path.exists(path):
        return mats
    for line in open(path, encoding="utf-8", errors="replace"):
        p = line.split()
        if not p:
            continue
        if p[0] == "newmtl":
            cur = " ".join(p[1:])
            mats[cur] = {"Kd": [0.8, 0.8, 0.8], "d": 1.0, "map": None}
        elif cur and p[0] == "Kd":
            mats[cur]["Kd"] = [float(x) for x in p[1:4]]
        elif cur and p[0] == "d":
            mats[cur]["d"] = float(p[1])
        elif cur and p[0] == "map_Kd":
            mats[cur]["map"] = " ".join(p[1:])
    return mats


def convert(obj_path, out_path, tex=None):
    base = os.path.dirname(obj_path)
    V, VT, VN = [], [], []
    groups = {}  # material -> list of corner triples (polygon lists)
    order = []
    mtl = {}
    cur = "_default"
    for line in open(obj_path, encoding="utf-8", errors="replace"):
        p = line.split()
        if not p:
            continue
        k = p[0]
        if k == "v":
            V.append([float(x) for x in p[1:4]])
        elif k == "vt":
            VT.append([float(x) for x in p[1:3]])
        elif k == "vn":
            VN.append([float(x) for x in p[1:4]])
        elif k == "mtllib":
            mtl.update(parse_mtl(os.path.join(base, " ".join(p[1:]))))
        elif k == "usemtl":
            cur = " ".join(p[1:])
        elif k == "f":
            poly = []
            for c in p[1:]:
                ix = c.split("/")
                vi = int(ix[0])
                ti = int(ix[1]) if len(ix) > 1 and ix[1] else 0
                ni = int(ix[2]) if len(ix) > 2 and ix[2] else 0
                fix = lambda i, n: (i - 1) if i > 0 else (n + i) if i < 0 else -1
                poly.append((fix(vi, len(V)), fix(ti, len(VT)), fix(ni, len(VN))))
            if cur not in groups:
                groups[cur] = []
                order.append(cur)
            groups[cur].append(poly)
    tex_path = tex
    if not tex_path:
        for m in mtl.values():
            if m["map"]:
                tex_path = os.path.join(base, m["map"])
                break
    use_uv = bool(tex_path) and len(VT) > 0
    bin_parts = []
    views, accs, meshes_prims, materials = [], [], [], []

    def add_view(data, target=None):
        off = sum(len(b) for b in bin_parts)
        pad = (-off) % 4
        if pad:
            bin_parts.append(b"\0" * pad)
            off += pad
        bin_parts.append(data)
        v = {"buffer": 0, "byteOffset": off, "byteLength": len(data)}
        if target:
            v["target"] = target
        views.append(v)
        return len(views) - 1

    def add_acc(view, ctype, count, typ, mn=None, mx=None):
        a = {"bufferView": view, "componentType": ctype, "count": count, "type": typ}
        if mn is not None:
            a["min"], a["max"] = mn, mx
        accs.append(a)
        return len(accs) - 1

    for mi, name in enumerate(order):
        polys = groups[name]
        verts, index, idx = [], {}, []
        for poly in polys:
            # flat normal of the polygon (for corners without vn)
            a, b, c = V[poly[0][0]], V[poly[1][0]], V[poly[2][0]]
            u = [b[i] - a[i] for i in range(3)]
            w = [c[i] - a[i] for i in range(3)]
            n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]]
            ln = math.sqrt(sum(x * x for x in n)) or 1.0
            fn = tuple(x / ln for x in n)
            ids = []
            for (vi, ti, ni) in poly:
                key = (vi, ti if use_uv else -1, ni if ni >= 0 else fn)
                if key not in index:
                    index[key] = len(verts)
                    nn = VN[ni] if ni >= 0 else fn
                    tt = VT[ti] if (use_uv and ti >= 0) else [0.0, 0.0]
                    verts.append((V[vi], nn, tt))
                ids.append(index[key])
            for j in range(1, len(ids) - 1):
                idx += [ids[0], ids[j], ids[j + 1]]
        pos = b"".join(struct.pack("<3f", *v[0]) for v in verts)
        nor = b"".join(struct.pack("<3f", *v[1]) for v in verts)
        mn = [min(v[0][i] for v in verts) for i in range(3)]
        mx = [max(v[0][i] for v in verts) for i in range(3)]
        attrs = {
            "POSITION": add_acc(add_view(pos, 34962), 5126, len(verts), "VEC3", mn, mx),
            "NORMAL": add_acc(add_view(nor, 34962), 5126, len(verts), "VEC3"),
        }
        if use_uv:
            uvb = b"".join(struct.pack("<2f", v[2][0], 1.0 - v[2][1]) for v in verts)
            attrs["TEXCOORD_0"] = add_acc(add_view(uvb, 34962), 5126, len(verts), "VEC2")
        ib = struct.pack(f"<{len(idx)}I", *idx)
        ia = add_acc(add_view(ib, 34963), 5125, len(idx), "SCALAR")
        m = mtl.get(name, {"Kd": [0.8, 0.8, 0.8], "d": 1.0})
        mat = {"name": name, "pbrMetallicRoughness": {"baseColorFactor": ([1, 1, 1] if use_uv else [max(0.0, min(1.0, x)) for x in m["Kd"]]) + [m["d"]], "metallicFactor": 0.0, "roughnessFactor": 0.8}}
        if m["d"] < 1:
            mat["alphaMode"] = "BLEND"
        if use_uv:
            mat["pbrMetallicRoughness"]["baseColorTexture"] = {"index": 0}
        materials.append(mat)
        meshes_prims.append({"attributes": attrs, "indices": ia, "material": mi})
    gl = {
        "asset": {"version": "2.0", "generator": "block-money obj2glb.py"},
        "scene": 0,
        "scenes": [{"nodes": [0]}],
        "nodes": [{"mesh": 0, "name": os.path.splitext(os.path.basename(obj_path))[0]}],
        "meshes": [{"primitives": meshes_prims}],
        "materials": materials,
        "accessors": accs,
        "bufferViews": views,
    }
    if use_uv:
        png = open(tex_path, "rb").read()
        iv = add_view(png)
        gl["images"] = [{"bufferView": iv, "mimeType": "image/png"}]
        gl["samplers"] = [{"magFilter": 9728, "minFilter": 9728}]  # nearest: palette textures stay crisp
        gl["textures"] = [{"source": 0, "sampler": 0}]
    blob = b"".join(bin_parts)
    blob += b"\0" * ((-len(blob)) % 4)
    gl["buffers"] = [{"byteLength": len(blob)}]
    js = json.dumps(gl, separators=(",", ":")).encode()
    js += b" " * ((-len(js)) % 4)
    total = 12 + 8 + len(js) + 8 + len(blob)
    with open(out_path, "wb") as f:
        f.write(struct.pack("<III", 0x46546C67, 2, total))
        f.write(struct.pack("<II", len(js), 0x4E4F534A) + js)
        f.write(struct.pack("<II", len(blob), 0x004E4942) + blob)


if __name__ == "__main__":
    a = sys.argv[1:]
    tex = None
    if "--tex" in a:
        i = a.index("--tex")
        tex = a[i + 1]
        del a[i : i + 2]
    convert(a[0], a[1], tex)
