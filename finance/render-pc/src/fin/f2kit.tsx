// F2 helpers on top of the shared engine (core/props/hud): numeric lens fitting (so a lens frames what it must, under the
// counter, until the end of its push-in), body points of a standing actor, and a few new props (a blocky car, a coffee
// cup, a payslip, a smoke puff). Pure functions; no clocks, seeded only.
import React from "react";
import * as THREE from "three";
import { geoOf, plastic, rbox } from "../blocky/mat";
import { hash } from "../blocky/motion";
import type { V3 } from "../blocky/motion";
import { aim } from "../engine/core/rig";
import type { FinShot, MoodKey } from "./core";
import { PUSH } from "./core";
import { Label, PAL } from "./props";

// ------------------------------------------------------------------ lens fitting
/** face centre height of a standing actor of scale s (same constant as penny.tsx) */
export const FACE_Y = 1.247;
/** frame points of a standing actor at p (scale s): full body, or head and shoulders (bust) */
export const body = (p: V3, s: number, bust = false, lift = 0): V3[] => {
  const top = FACE_Y * s + 0.2 * s + lift;
  const low = bust ? FACE_Y * s - 0.42 * s + lift : lift;
  const r = 0.3 * s;
  return [[p[0] - r, top, p[2]], [p[0] + r, top, p[2]], [p[0] - r, low, p[2]], [p[0] + r, low, p[2]], [p[0], top, p[2] - r], [p[0], low, p[2] + r]];
};
const cam = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.02, 600);
/** min margin of points in the frame (fx in [m, 1-m], fy in [top, 1-m]); < 0 = something is out */
const marginOf = (pos: V3, subj: V3, fov: number, face: number, pts: V3[], m: number, top: number) => {
  const c = aim(pos, subj, fov, face);
  cam.fov = c.fov;
  cam.position.set(...c.pos);
  cam.up.set(0, 1, 0);
  cam.lookAt(...c.look);
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld();
  let worst = 9;
  for (const q of pts) {
    const v = new THREE.Vector3(...q);
    if (v.clone().applyMatrix4(cam.matrixWorldInverse).z > -0.05) return -1;
    v.project(cam);
    const fx = (v.x + 1) / 2, fy = (1 - v.y) / 2;
    worst = Math.min(worst, fx - m, 1 - m - fx, fy - top, 1 - m - fy);
  }
  return worst;
};
/** solve the lens distance along dir (from subj) so pts fit from the shot start to the end of its push-in */
export const fitOff = (pts: V3[], subj: V3, dir: V3, fov: number, face: number, dur: number, push = PUSH, m = 0.05, top = 0.24): V3 => {
  const n = Math.hypot(...dir) || 1;
  const u: V3 = [dir[0] / n, dir[1] / n, dir[2] / n];
  const ok = (d: number) =>
    [1, 1 - push * dur].every((k) => marginOf([subj[0] + u[0] * d * k, subj[1] + u[1] * d * k, subj[2] + u[2] * d * k], subj, fov, face, pts, m, top) >= 0);
  let lo = 0.3, hi = 40;
  if (ok(hi)) for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; if (ok(mid)) hi = mid; else lo = mid; }
  return [u[0] * hi, u[1] * hi, u[2] * hi];
};
/** the centre of a set of points (the natural subject of a fitted lens) */
export const centre = (pts: V3[]): V3 => {
  const lo = [0, 1, 2].map((k) => Math.min(...pts.map((p) => p[k])));
  const hi = [0, 1, 2].map((k) => Math.max(...pts.map((p) => p[k])));
  return [(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2];
};
/** direction from a yaw (deg, 0 = lens on +z) and an elevation ratio */
export const dirOf = (yawDeg: number, up: number): V3 => {
  const a = (yawDeg * Math.PI) / 180;
  return [Math.sin(a), up, Math.cos(a)];
};
type LensOpts = { fov?: number; face?: number; mood: MoodKey; roll?: [number, number]; blur?: number; push?: number; shutter?: number; sky?: boolean; subj?: V3; m?: number };
/** a fitted lens for a plan shot of duration dur: frames pts from direction (yaw, up) */
export const fitted = (pts: V3[], yaw: number, up: number, dur: number, o: LensOpts): Omit<FinShot, "id" | "a" | "b"> => {
  const subj = o.subj ?? centre(pts);
  const fov = o.fov ?? 52, face = o.face ?? 0.55;
  const off = fitOff(pts, subj, dirOf(yaw, up), fov, face, dur, o.push ?? PUSH, o.m ?? 0.1);
  return { subj: () => subj, off, fov, face, mood: o.mood, roll: o.roll ?? [0, 1.2], blur: o.blur ?? 1.0, push: o.push, shutter: o.shutter, sky: o.sky };
};
/** a manual lens on a prop: subj + yaw/dist/up */
export const manual = (subj: V3, yaw: number, dist: number, up: number, o: LensOpts): Omit<FinShot, "id" | "a" | "b"> => {
  const d = dirOf(yaw, up), n = Math.hypot(...d);
  return { subj: () => subj, off: [(d[0] / n) * dist, (d[1] / n) * dist, (d[2] / n) * dist], fov: o.fov ?? 48, face: o.face ?? 0.5, mood: o.mood, roll: o.roll ?? [0, -1.2], blur: o.blur ?? 1.8, push: o.push, shutter: o.shutter, sky: o.sky };
};

// ------------------------------------------------------------------ new props
const B: React.FC<{ s: V3; p: V3; c: string; r?: V3; e?: [string, number]; rough?: number }> = ({ s, p, c, r = [0, 0, 0], e, rough = 0.45 }) => (
  <mesh geometry={rbox(s[0], s[1], s[2], Math.min(s[0], s[1], s[2]) * 0.14)} material={plastic(c, { rough, emissive: e?.[0], ei: e?.[1] })} position={p} rotation={r} castShadow receiveShadow />
);
/** a chunky blocky car (no brand): body, cabin, windows, 4 wheels; faces +z; plate = a label on the back (or none) */
export const Car: React.FC<{ p: V3; yaw?: number; color?: string; plate?: string; smoke?: number; t?: number; s?: number }> = ({ p, yaw = 0, color = "#2a7de1", plate, smoke = 0, t = 0, s = 1 }) => (
  <group position={p} rotation={[0, yaw, 0]} scale={s}>
    <B s={[1.5, 0.45, 2.6]} p={[0, 0.48, 0]} c={color} />
    <B s={[1.3, 0.45, 1.4]} p={[0, 0.92, -0.15]} c={color} />
    <mesh geometry={geoOf("carWinF", () => new THREE.PlaneGeometry(1.16, 0.34))} material={plastic("#9fd8ff", { rough: 0.1, emissive: "#3a6aa0", ei: 0.25 })} position={[0, 0.94, 0.556]} rotation={[-0.08, 0, 0]} />
    {[-1, 1].map((k) => (
      <mesh key={k} geometry={geoOf("carWinS", () => new THREE.PlaneGeometry(1.2, 0.32))} material={plastic("#9fd8ff", { rough: 0.1, emissive: "#3a6aa0", ei: 0.2 })} position={[k * 0.653, 0.94, -0.15]} rotation={[0, k * Math.PI / 2, 0]} />
    ))}
    {[-1, 1].map((x) => [-1, 1].map((z) => (
      <mesh key={`${x}${z}`} geometry={geoOf("carWheel", () => new THREE.CylinderGeometry(0.27, 0.27, 0.24, 20))} material={plastic("#1a1a22", { rough: 0.7 })} position={[x * 0.72, 0.27, z * 0.85]} rotation={[0, 0, Math.PI / 2]} castShadow />
    )))}
    <B s={[0.3, 0.12, 0.04]} p={[-0.5, 0.55, 1.31]} c="#fff4c8" e={["#fff4c8", 0.8]} />
    <B s={[0.3, 0.12, 0.04]} p={[0.5, 0.55, 1.31]} c="#fff4c8" e={["#fff4c8", 0.8]} />
    {plate ? <Label p={[0, 0.5, -1.32]} r={[0, Math.PI, 0]} text={[plate]} w={0.62} h={0.2} bg="#fff4c8" fg={PAL.ink} /> : null}
    {smoke > 0 ? <Smoke p={[0, 1.0, 1.1]} t={t} k={smoke} /> : null}
  </group>
);
/** a few grey puffs rising (k = amount 0..1), seeded and periodic in t */
export const Smoke: React.FC<{ p: V3; t: number; k: number }> = ({ p, t, k }) => (
  <group position={p}>
    {Array.from({ length: 6 }, (_, i) => {
      const u = (t * 0.6 + hash(i * 3.1)) % 1;
      return (
        <mesh key={i} position={[(hash(i) - 0.5) * 0.5 + u * 0.2, u * 1.4, (hash(i * 7) - 0.5) * 0.4]} scale={(0.12 + 0.3 * u) * k}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color="#c8c8d4" roughness={1} transparent opacity={0.85 * (1 - u)} flatShading />
        </mesh>
      );
    })}
  </group>
);
/** a coffee cup with a lid (no brand) */
export const Cup: React.FC<{ p?: V3; s?: number; color?: string }> = ({ p = [0, 0, 0], s = 1, color = "#f4ecff" }) => (
  <group position={p} scale={s}>
    <mesh geometry={geoOf("cupBody", () => new THREE.CylinderGeometry(0.055, 0.042, 0.14, 20))} material={plastic(color, { rough: 0.5 })} position={[0, 0.07, 0]} castShadow />
    <mesh geometry={geoOf("cupSleeve", () => new THREE.CylinderGeometry(0.052, 0.047, 0.05, 20))} material={plastic("#b07a4a", { rough: 0.7 })} position={[0, 0.07, 0]} />
    <mesh geometry={geoOf("cupLid", () => new THREE.CylinderGeometry(0.058, 0.058, 0.02, 20))} material={plastic("#3a2a2a", { rough: 0.5 })} position={[0, 0.15, 0]} castShadow />
  </group>
);
/** a payslip / statement sheet held flat (front faces +z) */
export const Sheet: React.FC<{ lines: string[]; w?: number; h?: number; accent?: string }> = ({ lines, w = 0.32, h = 0.42, accent = PAL.cash }) => (
  <group>
    <mesh geometry={rbox(w, h, 0.006, 0.004)} material={plastic("#fffaf0", { rough: 0.8 })} castShadow />
    <Label p={[0, 0, 0.004]} text={lines} w={w * 0.92} h={h * 0.9} bg="#fffaf0" fg={accent} />
  </group>
);
/** a counter-height coffee bar (front faces +z) */
export const CoffeeBar: React.FC<{ p: V3; w?: number }> = ({ p, w = 2.4 }) => (
  <group position={p}>
    <B s={[w, 0.95, 0.65]} p={[0, 0.475, 0]} c="#7a4a2a" />
    <B s={[w + 0.1, 0.06, 0.75]} p={[0, 0.98, 0]} c="#f4ecff" />
    <B s={[0.5, 0.5, 0.4]} p={[-w / 2 + 0.45, 1.26, -0.1]} c="#3a3f58" />
    <B s={[0.3, 0.06, 0.25]} p={[-w / 2 + 0.45, 1.04, 0.1]} c="#1a1a22" />
  </group>
);
