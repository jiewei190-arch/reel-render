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

const r4 = (v: number) => v.toFixed(3);
/** a hand-made clay block: generously rounded, gently lumpy */
export const lumpBox = (w: number, h: number, d: number, r?: number, amp?: number) => {
  const rr = Math.min(r ?? Math.min(w, h, d) * 0.3, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3);
  const a = amp ?? Math.min(0.012, Math.min(w, h, d) * 0.06);
  return geoOf(`clayBox${r4(w)}|${r4(h)}|${r4(d)}|${r4(rr)}|${r4(a)}`, () => {
    const g = new RoundedBoxGeometry(w, h, d, 4, rr);
    const mg = mergeVerts(g);
    return lumpify(mg, a, (w * 13 + h * 7 + d * 3) % 9);
  });
};
export const lumpBall = (r: number, sx = 1, sy = 1, sz = 1, amp?: number) => geoOf(`clayBall${r4(r)}|${r4(sx)}|${r4(sy)}|${r4(sz)}|${r4(amp ?? -1)}`, () => {
  const g = new THREE.SphereGeometry(r, 20, 14); g.scale(sx, sy, sz);
  return lumpify(g, amp ?? r * 0.06, r * 17 % 5, 9);
});
export const lumpCone = (r: number, h: number) => geoOf(`clayCone${r4(r)}|${r4(h)}`, () => {
  const g = new THREE.ConeGeometry(r, h, 10, 3); return lumpify(g, r * 0.08, 2, 12);
});
export const lumpCapsule = (r: number, len: number) => geoOf(`clayCap${r4(r)}|${r4(len)}`, () => {
  const g = new THREE.CapsuleGeometry(r, len, 6, 12); return lumpify(g, r * 0.08, 4, 14);
});
/** weld duplicate vertices so lumps do not tear seams open */
const mergeVerts = (g: THREE.BufferGeometry) => {
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
  const t = canvasTexture("clayThumb", 512, 512, (g, W, H) => {
    g.fillStyle = "#808080"; g.fillRect(0, 0, W, H);
    // fingerprint whorls: sets of concentric arcs
    for (let k = 0; k < 26; k++) {
      const cx = hash3(k, 1, 2) * W, cy = hash3(k, 3, 4) * H, R = 16 + 30 * hash3(k, 5, 6);
      for (let r = 3; r < R; r += 3.2) { g.strokeStyle = `rgba(${r % 6.4 < 3.2 ? "255,255,255" : "0,0,0"},0.10)`; g.lineWidth = 1.4; g.beginPath(); g.ellipse(cx, cy, r * 1.25, r, hash3(k, 7, 8) * 3, 0.2, Math.PI * 1.7); g.stroke(); }
    }
    // soft thumb presses
    for (let k = 0; k < 40; k++) { const x = hash3(k, 9, 1) * W, y = hash3(k, 2, 9) * H, r = 10 + 34 * hash3(k, 4, 4); const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, "rgba(0,0,0,0.16)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
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
export const claySat = (c: string, k = 0.1) => {
  const col = new THREE.Color(c); const l = col.r * 0.3 + col.g * 0.59 + col.b * 0.11;
  col.r += (l - col.r) * k + 0.01; col.g += (l - col.g) * k; col.b += (l - col.b) * k - 0.01;
  return `#${col.getHexString()}`;
};
const mats = new Map<string, THREE.Material>();
export const clayMat = (c: string, o: { bump?: number; rough?: number; sat?: boolean } = {}) => {
  const k = `clay|${c}|${o.bump ?? 1}|${o.rough ?? 0.62}|${o.sat ?? true}`;
  let m = mats.get(k);
  if (!m) {
    m = new THREE.MeshPhysicalMaterial({ color: o.sat === false ? c : claySat(c), roughness: o.rough ?? 0.62, metalness: 0, sheen: 0.35, sheenRoughness: 0.6, sheenColor: new THREE.Color("#fff3e0"), clearcoat: 0.06, clearcoatRoughness: 0.7, bumpMap: thumbTex(), bumpScale: 0.6 * (o.bump ?? 1) });
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
