// The FIGURE: a generic hooded person at a keyboard. No face (the hood opening is a black void), no identity, no
// likeness of anyone real. Low-poly fabric, lit only by the monitors and the rim light. A pure function of t: it
// breathes, types, leans in, turns its hood toward the lens, or stands. Nothing is ever static.
import React from "react";
import * as THREE from "three";
import { geoOf, plastic } from "../blocky/mat";
import type { V3 } from "../blocky/motion";
import { CP } from "./palette";

export type FigurePose = "type" | "idle" | "lean" | "turn" | "stand";
export const FIGURE_POSES: FigurePose[] = ["type", "idle", "lean", "turn", "stand"];

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const ease = (u: number) => { const x = clamp(u); return x * x * (3 - 2 * x); };

/** body-local joint positions (front = +z, y up, metres at scale 1) */
export type FigureRig = { hip: V3; neck: V3; head: V3; headYaw: number; headPitch: number; sh: [V3, V3]; el: [V3, V3]; hand: [V3, V3]; knee: [V3, V3]; foot: [V3, V3]; seated: boolean };

const rigOf = (pose: FigurePose, tau: number, t: number, seed: number): FigureRig => {
  const br = 0.008 * Math.sin(t * 1.9 + seed); // breathing
  const seated = pose !== "stand";
  const hipY = seated ? 0.56 : 0.95;
  let lean = 0.12, headYaw = 0.06 * Math.sin(t * 0.6 + seed), headPitch = 0.12;
  if (pose === "lean") { lean = 0.32 + 0.03 * Math.sin(t * 1.3); headPitch = 0.22; }
  if (pose === "turn") { headYaw = lerp(0, 0.9, ease(tau / 0.9)) + 0.04 * Math.sin(t * 0.8); headPitch = 0.05; }
  if (pose === "stand") { lean = 0.04; headPitch = 0.18; }
  const torso = 0.58;
  const neck: V3 = [0, hipY + torso * Math.cos(lean) + br, torso * Math.sin(lean)];
  const head: V3 = [neck[0], neck[1] + 0.17, neck[2] + 0.04 + 0.05 * Math.sin(lean)];
  const sh: [V3, V3] = [[-0.21, neck[1] - 0.06, neck[2] - 0.02], [0.21, neck[1] - 0.06, neck[2] - 0.02]];
  let hand: [V3, V3], el: [V3, V3];
  if (pose === "type" || pose === "lean") {
    const tp = (k: number) => 0.012 * Math.max(0, Math.sin(t * 13 + k * 2.1 + seed)) + 0.006 * Math.sin(t * 7 + k);
    hand = [[-0.17, 0.79 + tp(0), 0.47], [0.17, 0.79 + tp(1), 0.47]];
    el = [[-0.27, 0.86, 0.22], [0.27, 0.86, 0.22]];
  } else if (pose === "stand") {
    hand = [[-0.27, 0.92 + br, 0.08], [0.27, 0.92 + br, 0.08]];
    el = [[-0.26, 1.17, 0.02], [0.26, 1.17, 0.02]];
  } else {
    hand = [[-0.2, 0.66, 0.32], [0.2, 0.66 + 0.005 * Math.sin(t * 2), 0.32]];
    el = [[-0.28, 0.82, 0.12], [0.28, 0.82, 0.12]];
  }
  const knee: [V3, V3] = seated ? [[-0.12, 0.55, 0.42], [0.12, 0.55, 0.42]] : [[-0.11, 0.5, 0.03], [0.11, 0.5, 0.03]];
  const foot: [V3, V3] = seated ? [[-0.13, 0.06, 0.5], [0.13, 0.06, 0.5]] : [[-0.12, 0.06, 0.06], [0.12, 0.06, 0.06]];
  return { hip: [0, hipY, 0], neck, head, headYaw, headPitch, sh, el, hand, knee, foot, seated };
};
const mixV = (a: V3, b: V3, u: number): V3 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];
const mixRig = (a: FigureRig, b: FigureRig, u: number): FigureRig => ({
  hip: mixV(a.hip, b.hip, u), neck: mixV(a.neck, b.neck, u), head: mixV(a.head, b.head, u), headYaw: lerp(a.headYaw, b.headYaw, u), headPitch: lerp(a.headPitch, b.headPitch, u),
  sh: [mixV(a.sh[0], b.sh[0], u), mixV(a.sh[1], b.sh[1], u)], el: [mixV(a.el[0], b.el[0], u), mixV(a.el[1], b.el[1], u)], hand: [mixV(a.hand[0], b.hand[0], u), mixV(a.hand[1], b.hand[1], u)],
  knee: [mixV(a.knee[0], b.knee[0], u), mixV(a.knee[1], b.knee[1], u)], foot: [mixV(a.foot[0], b.foot[0], u), mixV(a.foot[1], b.foot[1], u)], seated: u < 0.5 ? a.seated : b.seated,
});

export type FigureTrack = { segs: { t0: number; pose: FigurePose }[]; seed: number };
/** the rig at t: pose segments blend over 0.45 s */
export const figureRig = (tr: FigureTrack, t: number): FigureRig => {
  let si = 0;
  tr.segs.forEach((s, k) => { if (t >= s.t0) si = k; });
  const seg = tr.segs[si];
  const r = rigOf(seg.pose, t - seg.t0, t, tr.seed);
  if (si > 0 && t - seg.t0 < 0.45) { const p = tr.segs[si - 1]; return mixRig(rigOf(p.pose, t - p.t0, t, tr.seed), r, ease((t - seg.t0) / 0.45)); }
  return r;
};

const rotY = (v: V3, a: number): V3 => [v[0] * Math.cos(a) + v[2] * Math.sin(a), v[1], -v[0] * Math.sin(a) + v[2] * Math.cos(a)];
/** body-local -> world */
export const figWorld = (p: V3, yaw: number, s: number, v: V3): V3 => { const r = rotY([v[0] * s, v[1] * s, v[2] * s], yaw); return [p[0] + r[0], p[1] + r[1], p[2] + r[2]]; };
/** QA / framing boxes: the whole figure (+ chair) and the head */
export const figureBoxes = (key: string, p: V3, yaw: number, s: number, rig: FigureRig) => {
  const hc = figWorld(p, yaw, s, rig.head);
  const top = rig.head[1] + 0.2;
  return [
    { name: `${key}.body`, c: figWorld(p, yaw, s, [0, top / 2, 0.15]) as V3, h: [0.32 * s, (top / 2) * s, 0.4 * s] as V3 },
    { name: `${key}.head`, c: hc, h: [0.17 * s, 0.19 * s, 0.17 * s] as V3 },
  ];
};

const FABRIC = () => plastic("#141B2B", { rough: 0.92, flat: true });
const FABRIC2 = () => plastic("#0F1522", { rough: 0.95, flat: true });
const VOID = (() => { let m: THREE.MeshBasicMaterial | null = null; return () => (m ??= new THREE.MeshBasicMaterial({ color: "#000000" })); })();
const up = new THREE.Vector3(0, 1, 0);
/** a capsule-ish limb between two body-local points */
const Limb: React.FC<{ a: V3; b: V3; r: number; mat?: THREE.Material }> = ({ a, b, r, mat }) => {
  const d = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
  const L = d.length() || 1e-3;
  const q = new THREE.Quaternion().setFromUnitVectors(up, d.clone().normalize());
  return (
    <group position={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]} quaternion={q}>
      <mesh geometry={geoOf("figLimb", () => new THREE.CylinderGeometry(1, 0.85, 1, 7))} material={mat ?? FABRIC()} scale={[r, L, r]} castShadow />
    </group>
  );
};
const Joint: React.FC<{ p: V3; r: number; mat?: THREE.Material }> = ({ p, r, mat }) => <mesh geometry={geoOf("figJoint", () => new THREE.IcosahedronGeometry(1, 1))} material={mat ?? FABRIC()} position={p} scale={r} castShadow />;

export const Figure: React.FC<{ p: V3; yaw: number; s: number; rig: FigureRig; chair?: boolean; t: number }> = ({ p, yaw, s, rig, chair = true }) => {
  const R = rig;
  return (
    <group position={p} rotation={[0, yaw, 0]} scale={s}>
      {/* the chair */}
      {chair && R.seated ? (
        <group>
          <mesh geometry={geoOf("figSeat", () => new THREE.BoxGeometry(0.56, 0.08, 0.52))} material={plastic(CP.steel, { rough: 0.6, flat: true })} position={[0, 0.48, 0.08]} castShadow receiveShadow />
          <mesh geometry={geoOf("figBack", () => new THREE.BoxGeometry(0.52, 0.66, 0.07))} material={plastic(CP.steel, { rough: 0.6, flat: true })} position={[0, 0.86, -0.2]} rotation={[-0.12, 0, 0]} castShadow />
          <mesh geometry={geoOf("figPole", () => new THREE.CylinderGeometry(0.035, 0.035, 0.42, 6))} material={plastic(CP.steelHi)} position={[0, 0.24, 0.06]} />
          <mesh geometry={geoOf("figStar", () => new THREE.CylinderGeometry(0.3, 0.3, 0.04, 5))} material={plastic(CP.steelHi, { flat: true })} position={[0, 0.04, 0.06]} />
        </group>
      ) : null}
      {/* legs */}
      {[0, 1].map((k) => (
        <React.Fragment key={k}>
          <Limb a={[R.hip[0] + (k ? 0.11 : -0.11), R.hip[1], R.hip[2] + 0.02]} b={R.knee[k]} r={0.085} mat={FABRIC2()} />
          <Limb a={R.knee[k]} b={R.foot[k]} r={0.07} mat={FABRIC2()} />
          <mesh geometry={geoOf("figShoe", () => new THREE.BoxGeometry(0.12, 0.08, 0.24))} material={plastic("#090c14", { flat: true })} position={[R.foot[k][0], 0.04, R.foot[k][2] + 0.05]} />
        </React.Fragment>
      ))}
      {/* torso: a tapered hoodie body */}
      <Limb a={[0, R.hip[1] - 0.04, R.hip[2]]} b={[R.neck[0], R.neck[1] - 0.04, R.neck[2]]} r={0.22} />
      <Joint p={[0, R.hip[1], R.hip[2]]} r={0.2} mat={FABRIC2()} />
      {/* arms */}
      {[0, 1].map((k) => (
        <React.Fragment key={`a${k}`}>
          <Joint p={R.sh[k]} r={0.085} />
          <Limb a={R.sh[k]} b={R.el[k]} r={0.07} />
          <Limb a={R.el[k]} b={R.hand[k]} r={0.06} />
          <Joint p={R.hand[k]} r={0.045} mat={plastic("#0b0f18", { flat: true })} />
        </React.Fragment>
      ))}
      {/* the hood: a faceted shell, a pointed back drape, and a black void where a face would be */}
      <group position={R.head} rotation={[R.headPitch, R.headYaw, 0]}>
        <mesh geometry={geoOf("figHood", () => new THREE.IcosahedronGeometry(1, 1))} material={FABRIC()} scale={[0.17, 0.19, 0.18]} castShadow />
        <mesh geometry={geoOf("figDrape", () => new THREE.ConeGeometry(1, 1, 6))} material={FABRIC()} position={[0, -0.02, -0.11]} rotation={[-1.9, 0, 0]} scale={[0.13, 0.2, 0.1]} castShadow />
        <mesh geometry={geoOf("figVoid", () => new THREE.SphereGeometry(1, 12, 8))} material={VOID()} position={[0, -0.015, 0.1]} scale={[0.105, 0.13, 0.08]} />
        <mesh geometry={geoOf("figRim", () => new THREE.TorusGeometry(1, 0.18, 5, 14))} material={FABRIC2()} position={[0, -0.015, 0.125]} scale={[0.115, 0.14, 0.1]} />
      </group>
    </group>
  );
};
