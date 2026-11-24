// storytime CLAYMATION toolkit (procedural only, no external assets):
//   clayMat(c)      plasticine: soft matte with a slight wax sheen, colours a little desaturated, a thumbprint / tool-mark
//                   bump map (canvas noise generated in code)
//   feltMat / cardMat / paperMat   the miniature set's felt floors, painted cardboard and paper
//   lumpBox(w,h,d)  a well-rounded box whose surface is gently lumpy (hand-made, slightly uneven)
//   lumpBall / lumpCone / lumpCapsule  the same for spheres, cones and capsules
// Everything is cached by value and is a pure function of its arguments (deterministic noise from fixed seeds).
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { canvasTexture, geoOf } from "../blocky/mat";

const hash3 = (x: number, y: number, z: number) => { const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return s - Math.floor(s); };
/** smooth 3D value noise in [-1, 1] */
const vnoise = (x: number, y: number, z: number) => {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), xf = x - xi, yf = y - yi, zf = z - zi;
  const s = (u: number) => u * u * (3 - 2 * u);
  const u = s(xf), v = s(yf), w = s(zf);
  const L = (a: number, b: number, k: number) => a + (b - a) * k;
  const c = (dx: number, dy: number, dz: number) => hash3(xi + dx, yi + dy, zi + dz);
  return 2 * L(L(L(c(0, 0, 0), c(1, 0, 0), u), L(c(0, 1, 0), c(1, 1, 0), u), v), L(L(c(0, 0, 1), c(1, 0, 1), u), L(c(0, 1, 1), c(1, 1, 1), u), v), w) - 1;
};

/** push every vertex along its normal by a low-frequency lump (amp metres) + a finer wobble; recompute normals */
export const lumpify = (g: THREE.BufferGeometry, amp: number, seed: number, freq = 7) => {
  const p = g.attributes.position as THREE.BufferAttribute, n = g.attributes.normal as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const k = amp * (vnoise(x * freq + seed, y * freq, z * freq) + 0.35 * vnoise(x * freq * 3.1, y * freq * 3.1 + seed, z * freq * 3.1));
    p.setXYZ(i, x + n.getX(i) * k, y + n.getY(i) * k, z + n.getZ(i) * k);
  }
  g.computeVertexNormals();
  return g;
};
/** thumb presses: a few shallow round dents pushed into the surface (deterministic from seed) */
export const dimple = (g: THREE.BufferGeometry, n: number, r: number, depth: number, seed: number) => {
  g.computeBoundingBox();
  const b = g.boundingBox!, p = g.attributes.position as THREE.BufferAttribute, nm = g.attributes.normal as THREE.BufferAttribute;
  const cs: THREE.Vector3[] = [];
  for (let k = 0; k < n; k++) {
    // a random surface vertex as the centre
    const i = Math.floor(hash3(k + seed * 7.3, 2.1, 5.7) * p.count);
    cs.push(new THREE.Vector3(p.getX(i), p.getY(i), p.getZ(i)));
  }
  const rr = r * Math.max(1e-3, Math.min(b.max.x - b.min.x, b.max.y - b.min.y, b.max.z - b.min.z));
  for (let i = 0; i < p.count; i++) {
    let k = 0;
    for (const c of cs) { const d = Math.hypot(p.getX(i) - c.x, p.getY(i) - c.y, p.getZ(i) - c.z) / rr; if (d < 1) k += (1 - d * d) ** 2; }
    if (k > 0) { const dd = -depth * rr * Math.min(k, 1.3); p.setXYZ(i, p.getX(i) + nm.getX(i) * dd, p.getY(i) + nm.getY(i) * dd, p.getZ(i) + nm.getZ(i) * dd); }
  }
  g.computeVertexNormals();
  return g;
};

const r4 = (v: number) => v.toFixed(3);
/** a hand-made clay block: generously rounded, gently lumpy */
export const lumpBox = (w: number, h: number, d: number, r?: number, amp?: number) => {
  const rr = Math.min(r ?? Math.min(w, h, d) * 0.3, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3);
  const a = amp ?? Math.min(0.02, Math.min(w, h, d) * 0.09);
  return geoOf(`clayBox2${r4(w)}|${r4(h)}|${r4(d)}|${r4(rr)}|${r4(a)}`, () => {
    const g = new RoundedBoxGeometry(w, h, d, 5, rr);
    const mg = mergeVerts(g);
    const sd = (w * 13 + h * 7 + d * 3) % 9;
    // uneven hand-rolled silhouette: a slow wobble (freq ~2.5) on top of the fine lumps
    // (an explicit amp = a precise piece, e.g. the head the face pieces sit on: fine lumps only)
    if (amp === undefined) lumpify(mg, a * 1.4, sd + 3, 2.6);
    lumpify(mg, a, sd);
    return amp === undefined && Math.max(w, h, d) < 1.7 ? dimple(mg, 3, 0.35, 0.12, sd) : mg;
  });
};
export const lumpBall = (r: number, sx = 1, sy = 1, sz = 1, amp?: number) => geoOf(`clayBall2${r4(r)}|${r4(sx)}|${r4(sy)}|${r4(sz)}|${r4(amp ?? -1)}`, () => {
  const g = new THREE.SphereGeometry(r, 24, 16); g.scale(sx, sy, sz);
  const a = amp ?? r * 0.09;
  lumpify(g, a, r * 17 % 5, 9); lumpify(g, a * 0.8, r * 7 % 3 + 1, 3 / Math.max(r, 0.05) * 0.3);
  return r > 0.05 ? dimple(g, 2, 0.4, 0.1, r * 31 % 7) : g;
});
export const lumpCone = (r: number, h: number) => geoOf(`clayCone${r4(r)}|${r4(h)}`, () => {
  const g = new THREE.ConeGeometry(r, h, 10, 3); return lumpify(g, r * 0.08, 2, 12);
});
export const lumpCapsule = (r: number, len: number) => geoOf(`clayCap${r4(r)}|${r4(len)}`, () => {
  const g = new THREE.CapsuleGeometry(r, len, 6, 12); return lumpify(g, r * 0.08, 4, 14);
});
/** a hand-rolled clay limb: a tapered, slightly bent sausage (r0 at the top, r1 at the bottom, hanging down from 0 to
 *  -len), squashed front-to-back a little, with an uneven silhouette and a thumb press or two */
export const lumpLimb = (r0: number, r1: number, len: number, seed = 1) => geoOf(`clayLimb2${r4(r0)}|${r4(r1)}|${r4(len)}|${seed}`, () => {
  const pts: THREE.Vector2[] = [], N = 14;
  // a lathe profile with rounded ends: cap (top) -> taper -> cap (bottom)
  for (let i = 0; i <= 5; i++) { const a = (i / 5) * Math.PI / 2; pts.push(new THREE.Vector2(Math.sin(a) * r0, -r0 * (1 - Math.cos(a)) + r0)); }
  for (let i = 1; i < N; i++) { const u = i / N; const r = r0 + (r1 - r0) * u + 0.12 * (r0 + r1) / 2 * Math.sin(u * Math.PI * (1.6 + seed * 0.37)); pts.push(new THREE.Vector2(r, -u * len)); }
  for (let i = 0; i <= 5; i++) { const a = (i / 5) * Math.PI / 2; pts.push(new THREE.Vector2(Math.cos(a) * r1, -len - Math.sin(a) * r1 * 0.9)); }
  pts.reverse();
  const g = new THREE.LatheGeometry(pts, 18);
  g.scale(1, 1, 0.88);
  // a slight bend along the length
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) { const u = -p.getY(i) / len; p.setZ(i, p.getZ(i) + 0.06 * len * Math.sin(u * Math.PI) * (seed % 2 ? 1 : -1)); }
  g.computeVertexNormals();
  const mg = mergeVerts(g);
  lumpify(mg, (r0 + r1) * 0.06, seed + 2, 3.2);
  lumpify(mg, (r0 + r1) * 0.035, seed, 11);
  return dimple(mg, 2, 0.5, 0.1, seed + 4);
});
/** the crease where two clay pieces were pressed together: a thin, slightly darker squashed ring */
export const seamRing = (r: number, tube = 0.008) => geoOf(`claySeam${r4(r)}|${r4(tube)}`, () => {
  const g = new THREE.TorusGeometry(r, tube, 6, 28); g.rotateX(Math.PI / 2); return lumpify(g, tube * 0.5, 3, 20);
});
/** weld duplicate vertices so lumps do not tear seams open */
const mergeVerts = (g0: THREE.BufferGeometry) => {
  const g = g0.index ? g0.toNonIndexed() : g0;
  const p = g.attributes.position as THREE.BufferAttribute;
  const map = new Map<string, number>(), pos: number[] = [], idx: number[] = [];
  for (let i = 0; i < p.count; i++) {
    const k = `${Math.round(p.getX(i) * 1e4)},${Math.round(p.getY(i) * 1e4)},${Math.round(p.getZ(i) * 1e4)}`;
    let j = map.get(k);
    if (j === undefined) { j = pos.length / 3; map.set(k, j); pos.push(p.getX(i), p.getY(i), p.getZ(i)); }
    idx.push(j);
  }
  const o = new THREE.BufferGeometry();
  o.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  // planar-ish UVs for the thumbprint bump (it only has to vary across every face)
  const uv: number[] = [];
  for (let i = 0; i < pos.length; i += 3) uv.push((pos[i] + pos[i + 2] * 0.7) * 2.2, (pos[i + 1] + pos[i + 2] * 0.4) * 2.2);
  o.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  o.setIndex(idx);
  o.computeVertexNormals();
  return o;
};

// ------------------------------------------------------------------ textures (bump)
/** thumbprints, tool marks and pits: a grey bump map */
const thumbTex = () => {
  const t = canvasTexture("clayThumb2", 512, 512, (g, W, H) => {
    g.fillStyle = "#808080"; g.fillRect(0, 0, W, H);
    // fingerprint whorls: sets of concentric arcs
    for (let k = 0; k < 34; k++) {
      const cx = hash3(k, 1, 2) * W, cy = hash3(k, 3, 4) * H, R = 16 + 30 * hash3(k, 5, 6);
      for (let r = 3; r < R; r += 3.2) { g.strokeStyle = `rgba(${r % 6.4 < 3.2 ? "255,255,255" : "0,0,0"},0.24)`; g.lineWidth = 1.6; g.beginPath(); g.ellipse(cx, cy, r * 1.25, r, hash3(k, 7, 8) * 3, 0.2, Math.PI * 1.7); g.stroke(); }
    }
    // soft thumb presses
    for (let k = 0; k < 40; k++) { const x = hash3(k, 9, 1) * W, y = hash3(k, 2, 9) * H, r = 10 + 34 * hash3(k, 4, 4); const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, "rgba(0,0,0,0.34)"); gr.addColorStop(0.75, "rgba(0,0,0,0.12)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
    // tool smears: short soft strokes
    for (let k = 0; k < 60; k++) { const x = hash3(k, 21, 4) * W, y = hash3(k, 22, 8) * H, a = hash3(k, 23, 1) * 6.28, L = 20 + 50 * hash3(k, 24, 2); g.strokeStyle = `rgba(${k % 2 ? "255,255,255" : "0,0,0"},0.16)`; g.lineWidth = 3 + 5 * hash3(k, 25, 3); g.lineCap = "round"; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a + 0.6) * L * 0.6, y + Math.sin(a + 0.6) * L * 0.6, x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke(); }
    // tiny pits + specks
    for (let k = 0; k < 700; k++) { g.fillStyle = k % 2 ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.18)"; g.fillRect(hash3(k, 11, 3) * W, hash3(k, 13, 5) * H, 1.5, 1.5); }
  }, false);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 2);
  return t;
};
const feltTex = (key: string, base: string, rep: number) => {
  const t = canvasTexture(`felt${key}`, 256, 256, (g, W, H) => {
    g.fillStyle = base; g.fillRect(0, 0, W, H);
    for (let k = 0; k < 5000; k++) { const v = hash3(k, 1, 7); g.fillStyle = v > 0.5 ? `rgba(255,255,255,${0.05 + 0.06 * v})` : `rgba(0,0,0,${0.05 + 0.08 * v})`; const a = hash3(k, 3, 3) * 6.28; const x = hash3(k, 5, 1) * W, y = hash3(k, 7, 2) * H; g.fillRect(x, y, 1 + 3 * Math.abs(Math.cos(a)), 1 + 3 * Math.abs(Math.sin(a))); }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep);
  return t;
};
const cardTex = () => {
  const t = canvasTexture("clayCard", 256, 256, (g, W, H) => {
    g.fillStyle = "#ffffff"; g.fillRect(0, 0, W, H);
    for (let y = 0; y < H; y += 8) { g.fillStyle = "rgba(0,0,0,0.05)"; g.fillRect(0, y, W, 3); }
    for (let k = 0; k < 900; k++) { g.fillStyle = `rgba(90,60,30,${0.04 + 0.06 * hash3(k, 2, 2)})`; g.fillRect(hash3(k, 4, 1) * W, hash3(k, 6, 2) * H, 2, 2); }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
};

// ------------------------------------------------------------------ materials
/** modelling-clay colour: 18 % toward its own grey, a touch warmer */
export const claySat = (c: string, k = 0.2) => {
  const col = new THREE.Color(c); const l = col.r * 0.3 + col.g * 0.59 + col.b * 0.11;
  col.r += (l - col.r) * k + 0.01; col.g += (l - col.g) * k; col.b += (l - col.b) * k - 0.01;
  // chalky: a little toward a warm pale grey (sRGB-linear mix)
  const ch = 0.045; col.r += (0.62 - col.r) * ch; col.g += (0.58 - col.g) * ch; col.b += (0.54 - col.b) * ch;
  return `#${col.getHexString()}`;
};
const mats = new Map<string, THREE.Material>();
export const clayMat = (c: string, o: { bump?: number; rough?: number; sat?: boolean } = {}) => {
  const k = `clay|${c}|${o.bump ?? 1}|${o.rough ?? 0.8}|${o.sat ?? true}`;
  let m = mats.get(k);
  if (!m) {
    m = new THREE.MeshPhysicalMaterial({ color: o.sat === false ? c : claySat(c), roughness: o.rough ?? 0.8, metalness: 0, sheen: 0.4, sheenRoughness: 0.45, sheenColor: new THREE.Color("#f6f0ea"), clearcoat: 0.12, clearcoatRoughness: 0.5, bumpMap: thumbTex(), bumpScale: 1.6 * (o.bump ?? 1) });
    mats.set(k, m);
  }
  return m;
};
export const feltMat = (c: string, rep = 6) => {
  const k = `felt|${c}|${rep}`;
  let m = mats.get(k);
  if (!m) { const t = feltTex(`${c}${rep}`, claySat(c, 0.12), rep); m = new THREE.MeshStandardMaterial({ color: "#ffffff", map: t, roughness: 1, metalness: 0, bumpMap: t, bumpScale: 1.5 }); mats.set(k, m); }
  return m;
};
export const cardMat = (c: string) => {
  const k = `card|${c}`;
  let m = mats.get(k);
  if (!m) { m = new THREE.MeshStandardMaterial({ color: claySat(c, 0.15), map: cardTex(), roughness: 0.92, metalness: 0, bumpMap: cardTex(), bumpScale: 0.8 }); mats.set(k, m); }
  return m;
};
/** a canvas picture printed on paper / card (posters, the chalkboard): slightly rough, gently bumpy */
export const printMat = (tex: THREE.Texture) => {
  const k = `print|${tex.uuid}`;
  let m = mats.get(k);
  if (!m) { m = new THREE.MeshStandardMaterial({ color: "#ffffff", map: tex, roughness: 0.9, metalness: 0, bumpMap: cardTex(), bumpScale: 0.5 }); mats.set(k, m); }
  return m;
};
