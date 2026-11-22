// The EXECUTIVE: biz3d's generic cast figure. A stylised miniature figure in a suit: rounded jacket, white shirt
// V and a tie, trousers, shoes, and a smooth FACELESS head (hair cap and ears only; no eyes, no mouth, no likeness of
// anyone). Every story colours its own cast (suit / tie / skin / hair), so the two sides of a story read at a glance.
// Like BOLT (src/tech/bolt.tsx) it is a pure function of t: a pose = joint angles, blended between poses with
// anticipation and overshoot; every pose keeps breathing and swaying, so nothing is ever static.
import React from "react";
import * as THREE from "three";
import { geoOf, plastic, rbox } from "../blocky/mat";
import type { V3 } from "../blocky/motion";

export type ExecPose = "idle" | "talk" | "point" | "fold" | "laugh" | "slam" | "despair" | "shrug" | "celebrate" | "walk" | "phone";
export const EXEC_POSES: ExecPose[] = ["idle", "talk", "point", "fold", "laugh", "slam", "despair", "shrug", "celebrate", "walk", "phone"];
export type ExecLook = { suit: string; tie: string; shirt?: string; skin?: string; hair?: string; hairStyle?: "short" | "bald" | "long" | "bun"; build?: number; height?: number };

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const ease = (u: number) => { const x = clamp(u); return x * x * (3 - 2 * x); };
const easeOut = (u: number) => 1 - Math.pow(1 - clamp(u), 3);
/** anticipation (a dip below 0) then overshoot (above 1) and settle */
const anticip = (u: number) => { const x = clamp(u); return x < 0.18 ? -0.08 * Math.sin((x / 0.18) * Math.PI) : 1 + 0.1 * Math.sin(((x - 0.18) / 0.82) * Math.PI) * (1 - x) - (1 - easeOut((x - 0.18) / 0.82)); };

/** body dimensions (m, scale 1). The hips sit HIP_Y above the floor when standing; SEAT_Y when seated */
export const HIP_Y = 0.93, SEAT_Y = 0.5, HEAD_UP = 0.83, HEAD_R = 0.125;
const SH: V3 = [0.27, 0.52, 0]; // left shoulder, hip-local (x mirrored for the right)
const UPPER = 0.29, FORE = 0.26, THIGH = 0.45, SHIN = 0.43;

type Arm = { f: number; o: number; e: number; w?: number };
/** joint angles (radians): lean forward, twist, roll; head pitch (down +) / yaw / roll; arms (f forward raise,
 *  o out, e elbow bend); legs (h forward raise, k knee bend); dy = extra hip height */
export type Joints = { dy: number; lean: number; twist: number; roll: number; hp: number; hy: number; hr: number; L: Arm; R: Arm; hL: number; hR: number; kL: number; kR: number };
export type ExecState = { id: string; x: number; y: number; z: number; yaw: number; s: number; j: Joints; seated: boolean; look: ExecLook; pose: ExecPose; hit: number };
export type ExecTrack = {
  id: string; seed: number; s: number; look: ExecLook; seated: boolean;
  at: (t: number) => V3; yaw: (t: number) => number;
  segs: { t0: number; pose: ExecPose }[];
  /** is the voice speaking (and the camera on this exec)? adds a talking nod + hand beat */
  talk?: (t: number) => number;
};

const arm = (f: number, o: number, e: number, w = 0): Arm => ({ f, o, e, w });
/** a pose at local time tau (s since it started), global t, seed; `hit` = 0..1 impact envelope (slam) */
export const posePrm = (p: ExecPose, tau: number, t: number, seed: number): Joints & { hit?: number } => {
  const w = (f: number, ph = 0) => Math.sin(t * f + seed * 1.7 + ph);
  const breathe = 0.006 * w(2.2);
  const base: Joints = { dy: breathe, lean: 0.02 + 0.01 * w(0.9), twist: 0.05 * w(0.6), roll: 0.015 * w(0.8), hp: 0.03 * w(0.7, 1), hy: 0.08 * w(0.45, 2), hr: 0.02 * w(0.5), L: arm(0.08 + 0.03 * w(1.1), 0.1, 0.22), R: arm(0.08 + 0.03 * w(1.1, 1), 0.1, 0.22), hL: 0, hR: 0, kL: 0, kR: 0 };
  switch (p) {
    case "idle":
      return { ...base, hL: 0.03 * w(0.7), hR: -0.03 * w(0.7) };
    case "talk":
      return { ...base, twist: 0.1 * Math.sin(t * 1.4 + seed), hp: 0.05 + 0.07 * Math.sin(t * 5.1), hy: 0.12 * Math.sin(t * 1.7), L: arm(0.55 + 0.22 * Math.sin(t * 4.6), 0.18, 1.25 + 0.3 * Math.sin(t * 4.6 + 0.8)), R: arm(0.6 + 0.25 * Math.sin(t * 4.1 + 2), 0.2, 1.3 + 0.3 * Math.sin(t * 4.1 + 2.6)) };
    case "point":
      return { ...base, lean: 0.07, twist: -0.12, hp: -0.02, R: arm(1.5 + 0.03 * w(3), 0.12, 0.05), L: arm(0.12, 0.08, 0.35) };
    case "fold": // arms crossed: the "no" (forearms bent and swung inward across the chest)
      return { ...base, lean: -0.05, hp: -0.1 + 0.03 * w(1.3), hy: 0.25 * Math.sin(t * 2.4) * clamp(1 - tau / 1.2), L: arm(0.3, 0.12, 1.45, 1.25), R: arm(0.36, 0.12, 1.5, 1.2) };
    case "laugh": {
      const shake = Math.sin(t * 21) * clamp(tau / 0.2);
      return { ...base, dy: breathe + 0.012 * shake, lean: -0.16 + 0.04 * shake, hp: -0.38 + 0.08 * Math.sin(t * 17), hy: 0.1 * w(1.2), L: arm(0.42, -0.22, 1.55 + 0.1 * shake), R: arm(0.38, -0.2, 1.5 + 0.1 * shake) };
    }
    case "slam": {
      // the fist goes up (0-0.25 s), comes down hard at 0.3 s (the hit), then the body leans on it
      const up = ease(tau / 0.25), down = easeOut((tau - 0.25) / 0.06);
      const f = tau < 0.25 ? lerp(0.1, 2.2, up) : lerp(2.2, 0.72, down);
      const hit = tau >= 0.31 ? Math.exp(-(tau - 0.31) * 6) : 0;
      return { ...base, hit, lean: tau < 0.25 ? -0.08 * up : lerp(-0.08, 0.28, down), dy: breathe - 0.04 * hit, hp: tau < 0.25 ? -0.15 * up : 0.18, R: arm(f, 0.16, tau < 0.25 ? 1.2 : lerp(1.2, 0.35, down)), L: arm(0.25, 0.15, 0.4) };
    }
    case "despair": // head in hands
      return { ...base, lean: 0.34 + 0.02 * w(1.1), dy: breathe - 0.02, hp: 0.5 + 0.03 * w(0.8), hy: 0.14 * Math.sin(t * 1.6), L: arm(1.2, 0.2, 2.3, 0.5), R: arm(1.25, 0.2, 2.3, 0.5) };
    case "shrug": {
      const up = Math.sin(clamp(tau / 0.4) * Math.PI) * 0.035;
      return { ...base, dy: breathe + up, hr: 0.14 * Math.sin(tau * 2), hp: -0.05, L: arm(0.25, 0.55, 1.45), R: arm(0.25, 0.55, 1.45) };
    }
    case "celebrate": {
      const pump = Math.sin(t * 9);
      return { ...base, dy: breathe + 0.04 * Math.abs(Math.sin(t * 6)), lean: -0.06, hp: -0.25, L: arm(2.75 + 0.2 * pump, 0.3, 0.25 + 0.2 * pump), R: arm(2.75 - 0.2 * pump, 0.3, 0.25 - 0.2 * pump) };
    }
    case "walk": {
      const g = Math.sin(t * 7.2 + seed);
      return { ...base, dy: 0.02 * Math.abs(Math.cos(t * 7.2 + seed)), lean: 0.06, L: arm(-0.35 * g, 0.08, 0.35), R: arm(0.35 * g, 0.08, 0.35), hL: 0.42 * g, hR: -0.42 * g, kL: 0.5 * clamp(-g), kR: 0.5 * clamp(g) };
    }
    case "phone": // on the phone, pacing in place
      return { ...base, hp: 0.12 + 0.05 * w(1.6), hy: 0.2 * Math.sin(t * 0.9), R: arm(0.55, 0.3, 2.35, 0.9), L: arm(0.2, 0.1, 1.5 + 0.2 * w(2), 0.6) };
  }
};
const mixArm = (a: Arm, b: Arm, u: number): Arm => ({ f: lerp(a.f, b.f, u), o: lerp(a.o, b.o, u), e: lerp(a.e, b.e, u), w: lerp(a.w ?? 0, b.w ?? 0, u) });
const mix = (a: Joints, b: Joints, u: number): Joints => ({
  dy: lerp(a.dy, b.dy, u), lean: lerp(a.lean, b.lean, u), twist: lerp(a.twist, b.twist, u), roll: lerp(a.roll, b.roll, u), hp: lerp(a.hp, b.hp, u), hy: lerp(a.hy, b.hy, u), hr: lerp(a.hr, b.hr, u),
  L: mixArm(a.L, b.L, u), R: mixArm(a.R, b.R, u), hL: lerp(a.hL, b.hL, u), hR: lerp(a.hR, b.hR, u), kL: lerp(a.kL, b.kL, u), kR: lerp(a.kR, b.kR, u),
});
const BLEND = 0.34;

export const execState = (tr: ExecTrack, t: number): ExecState => {
  let k = 0;
  while (k < tr.segs.length - 1 && t >= tr.segs[k + 1].t0) k++;
  const sg = tr.segs[k];
  let j: Joints & { hit?: number } = posePrm(sg.pose, Math.max(0, t - sg.t0), t, tr.seed);
  if (k > 0 && t - sg.t0 < BLEND) j = { ...mix(posePrm(tr.segs[k - 1].pose, t - tr.segs[k - 1].t0, t, tr.seed), j, anticip((t - sg.t0) / BLEND)), hit: j.hit };
  const tk = tr.talk ? tr.talk(t) : 0;
  if (tk > 0 && sg.pose !== "laugh" && sg.pose !== "despair") j = { ...j, hp: j.hp + 0.06 * tk * Math.sin(t * 9.3), R: { ...j.R, e: j.R.e + 0.25 * tk * Math.sin(t * 6.1) } };
  if (tr.seated) j = { ...j, dy: j.dy + (SEAT_Y - HIP_Y), hL: 1.5, hR: 1.5, kL: 1.5 + 0.04 * Math.sin(t * 1.3), kR: 1.48, lean: Math.max(j.lean, -0.12) };
  const p = tr.at(t);
  return { id: tr.id, x: p[0], y: p[1], z: p[2], yaw: tr.yaw(t), s: tr.s * (tr.look.height ?? 1), j, seated: tr.seated, look: tr.look, pose: sg.pose, hit: j.hit ?? 0 };
};

const rotY = (v: V3, a: number): V3 => [v[0] * Math.cos(a) + v[2] * Math.sin(a), v[1], -v[0] * Math.sin(a) + v[2] * Math.cos(a)];
/** the head centre in world space (camera target "<id>.head", the caption-band gate) */
export const execHead = (st: ExecState): { c: V3; r: number } => {
  const up = HEAD_UP + 0.13;
  const loc: V3 = [0, HIP_Y + st.j.dy + up * Math.cos(st.j.lean), up * Math.sin(st.j.lean)];
  const w = rotY([loc[0] * st.s, loc[1] * st.s, loc[2] * st.s], st.yaw);
  return { c: [st.x + w[0], st.y + w[1], st.z + w[2]], r: HEAD_R * 1.15 * st.s };
};
/** the chest (camera target "<id>") */
export const execChest = (st: ExecState): V3 => {
  const loc: V3 = [0, HIP_Y + st.j.dy + 0.4 * Math.cos(st.j.lean), 0.4 * Math.sin(st.j.lean)];
  const w = rotY([loc[0] * st.s, loc[1] * st.s, loc[2] * st.s], st.yaw);
  return [st.x + w[0], st.y + w[1], st.z + w[2]];
};
/** QA boxes (axis-aligned, world): torso and head (limbs may touch tables and chairs: that is acting, not a clip) */
export const execBoxes = (st: ExecState): { name: string; c: V3; h: V3 }[] => {
  const s = st.s, cy = Math.abs(Math.cos(st.yaw)), sy = Math.abs(Math.sin(st.yaw));
  const torsoLoc: V3 = [0, HIP_Y + st.j.dy + 0.33 * Math.cos(st.j.lean), 0.33 * Math.sin(st.j.lean)];
  const tw = rotY([0, torsoLoc[1] * s, torsoLoc[2] * s], st.yaw);
  const hx = 0.2 * s, hz = 0.12 * s;
  const hd = execHead(st);
  return [
    { name: `${st.id}.body`, c: [st.x + tw[0], st.y + tw[1], st.z + tw[2]], h: [cy * hx + sy * hz, 0.27 * s, sy * hx + cy * hz] },
    { name: `${st.id}.head`, c: hd.c, h: [HEAD_R * s, HEAD_R * 1.1 * s, HEAD_R * s] },
  ];
};

// ------------------------------------------------------------------ the mesh
const cyl = (r: number, h: number) => geoOf(`exCyl${r}|${h}`, () => { const g = new THREE.CylinderGeometry(r, r * 0.94, h, 14); g.translate(0, -h / 2, 0); return g; });
const sph = (r: number) => geoOf(`exSph${r}`, () => new THREE.SphereGeometry(r, 20, 14));
const cap = (r: number, k = 0.5) => geoOf(`exCap${r}|${k}`, () => new THREE.SphereGeometry(r, 20, 10, 0, Math.PI * 2, 0, Math.PI * k));
const vee = (w: number, h: number) => geoOf(`exVee${w}|${h}`, () => { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, -h); s.closePath(); return new THREE.ShapeGeometry(s); });
const tieG = () => geoOf("exTie", () => { const s = new THREE.Shape(); s.moveTo(-0.022, 0); s.lineTo(0.022, 0); s.lineTo(0.034, -0.2); s.lineTo(0, -0.25); s.lineTo(-0.034, -0.2); s.closePath(); return new THREE.ShapeGeometry(s); });
const darker = (hex: string, k: number) => { const c = new THREE.Color(hex); c.multiplyScalar(k); return `#${c.getHexString()}`; };

const ArmMesh: React.FC<{ a: Arm; side: 1 | -1; lk: ExecLook; skin: string }> = ({ a, side, lk, skin }) => (
  <group position={[side * SH[0], SH[1], SH[2]]} rotation={[-a.f, 0, 0]}>
    <group rotation={[0, 0, side * a.o]}>
      <mesh geometry={sph(0.068)} material={plastic(lk.suit, { rough: 0.6 })} castShadow />
      <mesh geometry={cyl(0.058, UPPER)} material={plastic(lk.suit, { rough: 0.62 })} castShadow />
      <group position={[0, -UPPER, 0]} rotation={[-a.e, -side * (a.w ?? 0), 0, "YXZ"]}>
        <mesh geometry={sph(0.056)} material={plastic(lk.suit, { rough: 0.62 })} castShadow />
        <mesh geometry={cyl(0.052, FORE)} material={plastic(lk.suit, { rough: 0.62 })} castShadow />
        <mesh geometry={cyl(0.047, 0.03)} material={plastic(lk.shirt ?? "#ffffff", { rough: 0.5 })} position={[0, -FORE + 0.01, 0]} />
        <mesh geometry={sph(0.055)} material={plastic(skin, { rough: 0.55 })} position={[0, -FORE - 0.05, 0]} scale={[0.85, 1.05, 0.7]} castShadow />
      </group>
    </group>
  </group>
);
const LegMesh: React.FC<{ h: number; k: number; side: 1 | -1; trousers: string }> = ({ h, k, side, trousers }) => (
  <group position={[side * 0.1, -0.04, 0]} rotation={[-h, 0, 0]}>
    <mesh geometry={cyl(0.078, THIGH)} material={plastic(trousers, { rough: 0.65 })} castShadow />
    <group position={[0, -THIGH, 0]} rotation={[k, 0, 0]}>
      <mesh geometry={sph(0.07)} material={plastic(trousers, { rough: 0.65 })} />
      <mesh geometry={cyl(0.068, SHIN)} material={plastic(trousers, { rough: 0.65 })} castShadow />
      <group position={[0, -SHIN - 0.02, 0.045]}>
        <mesh geometry={rbox(0.11, 0.07, 0.25, 0.03)} material={plastic("#1a1410", { rough: 0.3 })} castShadow />
      </group>
    </group>
  </group>
);

export const Exec: React.FC<{ st: ExecState }> = ({ st }) => {
  const { j, look: lk } = st;
  const skin = lk.skin ?? "#D9A47E", hair = lk.hair ?? "#2B1D14", trousers = darker(lk.suit, 0.85), build = lk.build ?? 1;
  return (
    <group position={[st.x, st.y, st.z]} rotation={[0, st.yaw, 0]} scale={st.s}>
      <group position={[0, HIP_Y + j.dy, 0]}>
        <LegMesh h={j.hL} k={j.kL} side={1} trousers={trousers} />
        <LegMesh h={j.hR} k={j.kR} side={-1} trousers={trousers} />
        <mesh geometry={rbox(0.36 * build, 0.2, 0.24, 0.07)} material={plastic(trousers, { rough: 0.65 })} castShadow />
        <group rotation={[j.lean, j.twist, j.roll]}>
          {/* the jacket, the shirt V, the tie, two buttons */}
          <mesh geometry={rbox(0.46 * build, 0.6, 0.27, 0.09)} material={plastic(lk.suit, { rough: 0.6 })} position={[0, 0.33, 0]} castShadow />
          <mesh geometry={vee(0.2, 0.27)} material={plastic(lk.shirt ?? "#ffffff", { rough: 0.5 })} position={[0, 0.625, 0.137]} />
          <mesh geometry={tieG()} material={plastic(lk.tie, { rough: 0.4 })} position={[0, 0.62, 0.139]} />
          {[0.3, 0.2].map((y) => <mesh key={y} geometry={sph(0.014)} material={plastic("#111111", { rough: 0.3 })} position={[0, y, 0.137]} />)}
          <ArmMesh a={j.L} side={1} lk={lk} skin={skin} />
          <ArmMesh a={j.R} side={-1} lk={lk} skin={skin} />
          <mesh geometry={cyl(0.055, 0.1)} material={plastic(skin, { rough: 0.55 })} position={[0, 0.7, 0]} />
          {/* the faceless head: smooth, ears, a hair cap (no eyes / mouth: generic, no likeness) */}
          <group position={[0, HEAD_UP - 0.13, 0]} rotation={[j.hp, j.hy, j.hr]}>
            <mesh geometry={sph(HEAD_R)} material={plastic(skin, { rough: 0.5 })} position={[0, 0.13, 0]} scale={[0.95, 1.1, 1]} castShadow />
            {[1, -1].map((s) => <mesh key={s} geometry={sph(0.03)} material={plastic(skin, { rough: 0.5 })} position={[s * 0.118, 0.12, -0.005]} scale={[0.5, 1, 0.8]} />)}
            {lk.hairStyle !== "bald" ? <mesh geometry={cap(HEAD_R * 1.06, 0.5)} material={plastic(hair, { rough: 0.75 })} position={[0, 0.15, -0.012]} rotation={[-0.35, 0, 0]} scale={[0.97, 1.12, 1.04]} /> : null}
            {lk.hairStyle === "long" ? <mesh geometry={rbox(0.25, 0.22, 0.08, 0.04)} material={plastic(hair, { rough: 0.75 })} position={[0, 0.07, -0.1]} /> : null}
            {lk.hairStyle === "bun" ? <mesh geometry={sph(0.055)} material={plastic(hair, { rough: 0.75 })} position={[0, 0.25, -0.09]} /> : null}
          </group>
        </group>
      </group>
    </group>
  );
};
