// storytime LOW-POLY toolkit (procedural only, no external assets): every surface is plain matte diffuse, ONE solid colour
// per part, FLAT-shaded so the polygon facets read (heads, limbs, props), no toon ramp, no outline, no texture noise.
//   polyMat(c)          matte flat-shaded MeshStandardMaterial (cached by colour)
//   polyBox(w,h,d,b)    a box with a single chamfer (bevel b): faceted corners
//   polyBall(r,...)     a low-segment sphere (8 x 6): clearly faceted
//   polyLimb(r0,r1,len) a 6-sided straight blocky limb hanging from 0 to -len
//   printMat(tex)       a printed surface (whiteboard, posters, lockers): flat colour texture, matte
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { geoOf } from "../blocky/mat";

const r4 = (v: number) => v.toFixed(3);
/** a chamfered box: one bevel segment, so its corners are flat facets */
export const polyBox = (w: number, h: number, d: number, b?: number) => {
  const bb = Math.min(b ?? Math.min(w, h, d) * 0.18, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3);
  return geoOf(`polyBox${r4(w)}|${r4(h)}|${r4(d)}|${r4(bb)}`, () => (bb > 0.002 ? new RoundedBoxGeometry(w, h, d, 1, bb) : new THREE.BoxGeometry(w, h, d)));
};
export const polyBall = (r: number, sx = 1, sy = 1, sz = 1, seg = 8) => geoOf(`polyBall${r4(r)}|${r4(sx)}|${r4(sy)}|${r4(sz)}|${seg}`, () => {
  const g = new THREE.SphereGeometry(r, seg, Math.max(4, Math.round(seg * 0.75))); g.scale(sx, sy, sz); return g;
});
export const polyIco = (r: number, sx = 1, sy = 1, sz = 1) => geoOf(`polyIco${r4(r)}|${r4(sx)}|${r4(sy)}|${r4(sz)}`, () => {
  const g = new THREE.IcosahedronGeometry(r, 0); g.scale(sx, sy, sz); return g;
});
/** a straight blocky limb: a 6-sided prism, r0 at the top, r1 at the bottom, from y 0 down to -len */
export const polyLimb = (r0: number, r1: number, len: number, sides = 6) => geoOf(`polyLimb${r4(r0)}|${r4(r1)}|${r4(len)}|${sides}`, () => {
  const g = new THREE.CylinderGeometry(r0, r1, len, sides, 1); g.rotateY(Math.PI / sides); g.translate(0, -len / 2, 0); return g;
});
export const polyCone = (r: number, h: number, sides = 6) => geoOf(`polyCone${r4(r)}|${r4(h)}|${sides}`, () => new THREE.ConeGeometry(r, h, sides, 1));
export const polyTorus = (r: number, tube: number, rad = 5, tub = 12) => geoOf(`polyTorus${r4(r)}|${r4(tube)}|${rad}|${tub}`, () => new THREE.TorusGeometry(r, tube, rad, tub));

const mats = new Map<string, THREE.Material>();
/** plain matte diffuse, flat shaded (the facets read), no texture */
export const polyMat = (c: string, o: { rough?: number; emissive?: string; ei?: number } = {}) => {
  const k = `poly|${c}|${o.rough ?? 0.92}|${o.emissive ?? ""}|${o.ei ?? 0}`;
  let m = mats.get(k);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color: c, roughness: o.rough ?? 0.92, metalness: 0, flatShading: true, emissive: o.emissive ?? "#000000", emissiveIntensity: o.ei ?? 0 });
    mats.set(k, m);
  }
  return m;
};
/** a face decal (eyes, brows, nose, mouth): matte, drawn on top of the head surface (polygon offset, no z-fight) */
export const decalMat = (c: string) => {
  const k = `decal|${c}`;
  let m = mats.get(k);
  if (!m) { m = new THREE.MeshStandardMaterial({ color: c, roughness: 0.95, metalness: 0, flatShading: true, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }); mats.set(k, m); }
  return m;
};
/** a printed surface (whiteboard, posters, lockers, menus): the texture's colours, matte */
export const printMat = (tex: THREE.Texture) => {
  const k = `print|${tex.uuid}`;
  let m = mats.get(k);
  if (!m) { m = new THREE.MeshStandardMaterial({ color: "#ffffff", map: tex, roughness: 0.95, metalness: 0 }); mats.set(k, m); }
  return m;
};
/** warm sunlight stripes laid on a wall or floor (the window-shadow pattern): additive, unlit */
export const sunMat = (strength: number) => {
  const k = `sun|${strength}`;
  let m = mats.get(k);
  if (!m) { m = new THREE.MeshBasicMaterial({ color: new THREE.Color("#ffc98a").multiplyScalar(strength), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: true, fog: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }); mats.set(k, m); }
  return m;
};
