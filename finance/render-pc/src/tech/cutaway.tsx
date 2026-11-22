// The CUTAWAY system: an object is a list of low-poly parts (primitives). Every part can be
//   exploded    flies out along its own axis vector `ex` (staggered, overshoot, a little spin in flight),
//   sliced      shell parts are clipped by a cutaway plane that sweeps in along x / y / z (inner parts stay whole),
//               with a translucent blue section sheet at the cut,
//   highlighted an orange glow shell + emissive pulse on one part,
//   labelled    a callout line + a label card (drawn in the HUD, src/tech/hud.tsx; <= 3 words, pops in one at a time).
// The state (explode amount per part, slice position, highlights) is a pure function of t, computed by the compiler
// from word-anchored actions. Objects live in src/tech/objects.ts.
import React from "react";
import * as THREE from "three";
import { canvasTexture, geoOf } from "../blocky/mat";
import type { V3 } from "../blocky/motion";
import { TP } from "./palette";

export type Prim =
  | { k: "box"; s: V3 }
  | { k: "cyl"; r: number; r2?: number; h: number; seg?: number }
  | { k: "sphere"; r: number; seg?: number }
  | { k: "ico"; r: number; detail?: number }
  | { k: "cone"; r: number; h: number; seg?: number }
  | { k: "torus"; r: number; tube: number; seg?: number }
  /** a polygon in the XY plane extruded `depth` along z (centred) */
  | { k: "prism"; pts: [number, number][]; depth: number };

export type Part = {
  id: string;
  prim: Prim;
  /** position and rotation (radians, XYZ) in object space */
  p: V3;
  r?: V3;
  color: string;
  /** explode vector (object space, metres at explode amount 1) */
  ex?: V3;
  /** shell parts are cut by the slice plane; inner parts stay whole (they are what the cut reveals) */
  role?: "shell" | "inner";
  emissive?: string;
  ei?: number;
  rough?: number;
  opacity?: number;
  /** a canvas texture drawn on the part (e.g. a phone screen); "face" decals map onto a box's front */
  tex?: string;
  /** the default label text (<= 3 words) */
  label?: string;
};
export type ObjDef = {
  id: string;
  name: string;
  parts: Part[];
  /** half extents (object space, at scale 1) and the centre, for framing, QA and the slice sweep */
  half: V3;
  centre: V3;
  /** the default cut: axis, the side that is KEPT, and where the plane stops (fraction of the half extent, -1..1) */
  slice: { axis: "x" | "y" | "z"; keep: "neg" | "pos"; stop: number };
  /** when true the object sits on the floor (QA: no part below y 0 when not exploded upward) */
  grounded?: boolean;
};

/** the cutaway state of one object instance at t */
export type CutState = {
  /** explode amount per part (0 = assembled, 1 = fully exploded) */
  ex: (partIndex: number) => number;
  /** slice: 0 = off; the plane position in object space along the axis */
  slice: { on: number; pos: number; axis: "x" | "y" | "z"; keep: "neg" | "pos"; /** section-sheet opacity: bright while the plane sweeps, then a faint trace */ sweep: number } | null;
  /** highlight glow 0..1 per part id */
  glow: Record<string, number>;
};
export const NO_CUT: CutState = { ex: () => 0, slice: null, glow: {} };

// ------------------------------------------------------------------ geometry
const geoKey = (p: Prim) => JSON.stringify(p);
export const primGeo = (p: Prim): THREE.BufferGeometry =>
  geoOf(`cut|${geoKey(p)}`, () => {
    switch (p.k) {
      case "box": return new THREE.BoxGeometry(p.s[0], p.s[1], p.s[2]);
      case "cyl": return new THREE.CylinderGeometry(p.r2 ?? p.r, p.r, p.h, p.seg ?? 10);
      case "sphere": return new THREE.SphereGeometry(p.r, p.seg ?? 10, Math.max(4, Math.round((p.seg ?? 10) * 0.7)));
      case "ico": return new THREE.IcosahedronGeometry(p.r, p.detail ?? 1);
      case "cone": return new THREE.ConeGeometry(p.r, p.h, p.seg ?? 10);
      case "torus": return new THREE.TorusGeometry(p.r, p.tube, 6, p.seg ?? 20);
      case "prism": {
        const sh = new THREE.Shape(p.pts.map(([x, y]) => new THREE.Vector2(x, y)));
        const g = new THREE.ExtrudeGeometry(sh, { depth: p.depth, bevelEnabled: false });
        g.translate(0, 0, -p.depth / 2);
        return g;
      }
    }
  });
/** half extents of a primitive (local, unrotated) */
export const primHalf = (p: Prim): V3 => {
  switch (p.k) {
    case "box": return [p.s[0] / 2, p.s[1] / 2, p.s[2] / 2];
    case "cyl": { const r = Math.max(p.r, p.r2 ?? p.r); return [r, p.h / 2, r]; }
    case "sphere": case "ico": return [p.r, p.r, p.r];
    case "cone": return [p.r, p.h / 2, p.r];
    case "torus": return [p.r + p.tube, p.r + p.tube, p.tube];
    case "prism": {
      const xs = p.pts.map((q) => q[0]), ys = p.pts.map((q) => q[1]);
      return [(Math.max(...xs) - Math.min(...xs)) / 2, (Math.max(...ys) - Math.min(...ys)) / 2, p.depth / 2];
    }
  }
};
/** the centre offset of a prism (its points need not be centred) */
const primCentre = (p: Prim): V3 => {
  if (p.k !== "prism") return [0, 0, 0];
  const xs = p.pts.map((q) => q[0]), ys = p.pts.map((q) => q[1]);
  return [(Math.max(...xs) + Math.min(...xs)) / 2, (Math.max(...ys) + Math.min(...ys)) / 2, 0];
};
const rot = (v: V3, r?: V3): V3 => {
  if (!r) return v;
  const e = new THREE.Euler(r[0], r[1], r[2]);
  const q = new THREE.Vector3(...v).applyEuler(e);
  return [q.x, q.y, q.z];
};
/** an axis-aligned half extent of a rotated box */
const rotHalf = (h: V3, r?: V3): V3 => {
  if (!r) return h;
  const m = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(r[0], r[1], r[2])).elements;
  // column-major: m[0], m[4], m[8] is row 0
  return [0, 1, 2].map((i) => Math.abs(m[i]) * h[0] + Math.abs(m[i + 4]) * h[1] + Math.abs(m[i + 8]) * h[2]) as V3;
};

// ------------------------------------------------------------------ placement
/** an object instance in the world: position (bottom centre of the bounds for grounded objects), yaw, scale, plus
 *  an extra roll/pitch (a plane banking) */
export type Placement = { p: V3; yaw: number; s: number; pitch?: number; roll?: number };
const toWorld = (pl: Placement, v: V3): V3 => {
  const q = new THREE.Vector3(v[0] * pl.s, v[1] * pl.s, v[2] * pl.s).applyEuler(new THREE.Euler(pl.pitch ?? 0, pl.yaw, pl.roll ?? 0, "YXZ"));
  return [pl.p[0] + q.x, pl.p[1] + q.y, pl.p[2] + q.z];
};
/** the in-flight spin of an exploding part (small, settles at both ends) */
const flight = (u: number, i: number): V3 => {
  const k = Math.sin(Math.PI * Math.min(1, Math.max(0, u)));
  const sg = i % 2 ? 1 : -1;
  return [0.22 * k * sg, 0.3 * k * -sg, 0.16 * k];
};
/** a part's object-space centre at explode amount u */
export const partLocal = (def: ObjDef, i: number, u: number): V3 => {
  const pt = def.parts[i], ex = pt.ex ?? [0, 0, 0], c = rot(primCentre(pt.prim), pt.r);
  return [pt.p[0] + c[0] + ex[0] * u, pt.p[1] + c[1] + ex[1] * u, pt.p[2] + c[2] + ex[2] * u];
};
export const partWorld = (def: ObjDef, pl: Placement, st: CutState, id: string): V3 => {
  const i = def.parts.findIndex((p) => p.id === id);
  if (i < 0) throw new Error(`cutaway ${def.id}: no part "${id}" (has: ${def.parts.map((p) => p.id).join(", ")})`);
  return toWorld(pl, partLocal(def, i, st.ex(i)));
};
/** QA boxes (world AABBs) for every visible part */
export const cutBoxes = (key: string, def: ObjDef, pl: Placement, st: CutState) =>
  def.parts.map((pt, i) => {
    const c = toWorld(pl, partLocal(def, i, st.ex(i)));
    const h0 = rotHalf(primHalf(pt.prim), pt.r);
    const h = rotHalf([h0[0] * pl.s, h0[1] * pl.s, h0[2] * pl.s], [pl.pitch ?? 0, pl.yaw, pl.roll ?? 0]);
    return { name: `${key}.${pt.id}`, c, h };
  });
/** the whole object's world box (assembled), for framing and the frame-0 gate */
export const objBox = (def: ObjDef, pl: Placement): { c: V3; h: V3 } => {
  const c = toWorld(pl, def.centre);
  const h = rotHalf([def.half[0] * pl.s, def.half[1] * pl.s, def.half[2] * pl.s], [pl.pitch ?? 0, pl.yaw, pl.roll ?? 0]);
  return { c, h };
};

// ------------------------------------------------------------------ materials (clipping-aware)
const mats = new Map<string, THREE.MeshStandardMaterial>();
const planes = new Map<string, THREE.Plane>();
export const planeOf = (key: string) => { let p = planes.get(key); if (!p) { p = new THREE.Plane(new THREE.Vector3(0, 0, -1), 1e6); planes.set(key, p); } return p; };
const partMat = (pt: Part, clip: string | null, glow: number) => {
  const g = Math.round(glow * 12) / 12;
  const k = [pt.color, pt.rough ?? 0.55, pt.emissive ?? "", pt.ei ?? 0, pt.opacity ?? 1, clip ?? "", g, pt.tex ?? ""].join("|");
  let m = mats.get(k);
  if (!m) {
    if (mats.size > 600) mats.clear();
    const em = g > 0 ? TP.orange : pt.emissive ?? "#000000";
    m = new THREE.MeshStandardMaterial({
      color: pt.color, roughness: pt.rough ?? 0.55, metalness: 0, flatShading: !pt.tex,
      emissive: em, emissiveIntensity: g > 0 ? 0.25 + 0.75 * g : pt.ei ?? 0,
      transparent: (pt.opacity ?? 1) < 1, opacity: pt.opacity ?? 1, depthWrite: (pt.opacity ?? 1) >= 1,
      side: clip ? THREE.DoubleSide : THREE.FrontSide,
      clippingPlanes: clip ? [planeOf(clip)] : [], clipShadows: true,
      map: pt.tex ? TEXTURES[pt.tex]?.() ?? null : null,
    });
    mats.set(k, m);
  }
  return m;
};
const glowMats = new Map<string, THREE.MeshBasicMaterial>();
const glowShell = (o: number) => { const k = o.toFixed(2); let m = glowMats.get(k); if (!m) { m = new THREE.MeshBasicMaterial({ color: TP.orange, transparent: true, opacity: o, side: THREE.BackSide, depthWrite: false, toneMapped: false }); glowMats.set(k, m); } return m; };
const sheetMats = new Map<string, THREE.MeshBasicMaterial>();
const sheetMat = (o: number) => { const k = o.toFixed(2); let m = sheetMats.get(k); if (!m) { m = new THREE.MeshBasicMaterial({ map: sheetTex(), color: "#ffffff", transparent: true, opacity: o, side: THREE.DoubleSide, depthWrite: false, toneMapped: false }); sheetMats.set(k, m); } return m; };
const sheetTex = () => canvasTexture("cutSheet", 256, 256, (g, W, H) => {
  g.fillStyle = "rgba(47,128,237,0.35)"; g.fillRect(0, 0, W, H);
  g.strokeStyle = "rgba(255,255,255,0.55)"; g.lineWidth = 2;
  for (let k = 0; k <= 8; k++) { g.beginPath(); g.moveTo((k * W) / 8, 0); g.lineTo((k * W) / 8, H); g.stroke(); g.beginPath(); g.moveTo(0, (k * H) / 8); g.lineTo(W, (k * H) / 8); g.stroke(); }
  g.strokeStyle = TP.orange; g.lineWidth = 10; g.strokeRect(5, 5, W - 10, H - 10);
});

/** canvas textures parts can use (`tex`) */
export const TEXTURES: Record<string, () => THREE.Texture> = {
  phoneUi: () => canvasTexture("phoneUi", 256, 512, (g, W, H) => {
    const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, "#5aa2ff"); bg.addColorStop(1, "#2F80ED");
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    g.fillStyle = "rgba(255,255,255,0.9)"; g.font = "bold 54px sans-serif"; g.textAlign = "center"; g.fillText("9:41", W / 2, 96);
    const cols = ["#3DDC97", "#FF8A3D", "#ffffff", "#ffd34d"];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
      g.fillStyle = cols[(r + c) % 4]; const x = 22 + c * 58, y = 170 + r * 64;
      g.beginPath(); g.roundRect(x, y, 40, 40, 10); g.fill();
    }
    g.fillStyle = "rgba(255,255,255,0.35)"; g.beginPath(); g.roundRect(20, H - 70, W - 40, 46, 20); g.fill();
  }),
  shipHull: () => canvasTexture("shipHull", 256, 64, (g, W, H) => { g.fillStyle = "#1C5BBF"; g.fillRect(0, 0, W, H); g.fillStyle = "#ffffff"; for (let x = 0; x < W; x += 16) g.fillRect(x, H * 0.2, 2, 2); }),
};

// ------------------------------------------------------------------ rendering
const sliceNormal = (axis: "x" | "y" | "z"): V3 => (axis === "x" ? [1, 0, 0] : axis === "y" ? [0, 1, 0] : [0, 0, 1]);
export const CutawayObject: React.FC<{ k: string; def: ObjDef; pl: Placement; st: CutState; t: number }> = ({ k, def, pl, st, t }) => {
  const sl = st.slice && st.slice.on > 0.001 ? st.slice : null;
  const clipKey = sl ? `${k}|clip` : null;
  if (sl && clipKey) {
    // world plane: keep side has positive distance
    const n0 = sliceNormal(sl.axis), sgn = sl.keep === "neg" ? -1 : 1;
    const nW = new THREE.Vector3(n0[0] * sgn, n0[1] * sgn, n0[2] * sgn).applyEuler(new THREE.Euler(pl.pitch ?? 0, pl.yaw, pl.roll ?? 0, "YXZ")).normalize();
    const local: V3 = [0, 0, 0];
    local[sl.axis === "x" ? 0 : sl.axis === "y" ? 1 : 2] = sl.pos;
    const pW = new THREE.Vector3(...toWorld(pl, local));
    planeOf(clipKey).setFromNormalAndCoplanarPoint(nW, pW);
  }
  // the section sheet: at the cut, sized to the object's cross-section
  const ax = sl ? (sl.axis === "x" ? 0 : sl.axis === "y" ? 1 : 2) : 0;
  const sheetSize: [number, number] = sl ? (ax === 0 ? [def.half[2] * 2.3, def.half[1] * 2.3] : ax === 1 ? [def.half[0] * 2.3, def.half[2] * 2.3] : [def.half[0] * 2.3, def.half[1] * 2.3]) : [1, 1];
  const sheetPos: V3 = [def.centre[0], def.centre[1], def.centre[2]];
  if (sl) sheetPos[ax] = sl.pos;
  const sheetRot: V3 = ax === 0 ? [0, Math.PI / 2, 0] : ax === 1 ? [-Math.PI / 2, 0, 0] : [0, 0, 0];
  return (
    <group position={pl.p} rotation={[pl.pitch ?? 0, pl.yaw, pl.roll ?? 0, "YXZ"]} scale={pl.s}>
      {def.parts.map((pt, i) => {
        const u = st.ex(i);
        const ex = pt.ex ?? [0, 0, 0];
        const fl = flight(u, i);
        const g = st.glow[pt.id] ?? 0;
        const clip = pt.role === "shell" ? clipKey : null;
        const geo = primGeo(pt.prim);
        const pulse = g > 0 ? 0.5 + 0.5 * Math.sin(t * 9) : 0;
        return (
          <group key={pt.id} position={[pt.p[0] + ex[0] * u, pt.p[1] + ex[1] * u, pt.p[2] + ex[2] * u]} rotation={[(pt.r?.[0] ?? 0) + fl[0] * (u > 0 && u < 1 ? 1 : 0), (pt.r?.[1] ?? 0) + fl[1] * (u > 0 && u < 1 ? 1 : 0), (pt.r?.[2] ?? 0) + fl[2] * (u > 0 && u < 1 ? 1 : 0)]} scale={1 + 0.06 * g * pulse}>
            <mesh geometry={geo} material={partMat(pt, clip, g * (0.55 + 0.45 * pulse))} castShadow receiveShadow />
            {g > 0.02 ? <mesh geometry={geo} material={glowShell(Math.round((0.25 + 0.4 * pulse) * g * 20) / 20)} scale={1.12} /> : null}
          </group>
        );
      })}
      {sl && sl.sweep > 0.02 ? <mesh geometry={geoOf("cutSheetPlane", () => new THREE.PlaneGeometry(1, 1))} material={sheetMat(Math.round(sl.sweep * 20) / 20)} position={sheetPos} rotation={sheetRot} scale={[sheetSize[0], sheetSize[1], 1]} /> : null}
    </group>
  );
};
