// law3d cast: simple stylized low-poly people (judge, plaintiff, defendant, lawyer, witness, bailiff, juror silhouettes).
// Generic by design: no real person's likeness. Outfit colours, hair, glasses, build and the nameplate text come from
// the recipe's cast entry, so every case dresses its own people. Like BOLT (src/tech/bolt.tsx) a figure is a pure
// function of t: a pose = arm directions + body offsets, blended between poses with anticipation and overshoot;
// face swaps hide behind a blink; everyone breathes and sways, so no one is ever frozen.
import React from "react";
import * as THREE from "three";
import { canvasTexture, geoOf, plastic, rbox } from "../blocky/mat";
import type { V3 } from "../blocky/motion";
import type { Viseme } from "../blocky/Blocky";
import { LP } from "./palette";

export type Role = "judge" | "plaintiff" | "defendant" | "lawyer" | "witness" | "bailiff" | "juror";
export type FigPose = "idle" | "talk" | "point" | "shock" | "slump" | "cheer" | "gavel" | "present" | "cross" | "cry" | "smug";
export type FigFace = "neutral" | "stern" | "angry" | "smug" | "shocked" | "sad" | "happy" | "worried" | "crying";
export const FIG_POSES: FigPose[] = ["idle", "talk", "point", "shock", "slump", "cheer", "gavel", "present", "cross", "cry", "smug"];
export const FIG_FACES: FigFace[] = ["neutral", "stern", "angry", "smug", "shocked", "sad", "happy", "worried", "crying"];
export const ROLES: Role[] = ["judge", "plaintiff", "defendant", "lawyer", "witness", "bailiff", "juror"];
export const POSE_FACE: Record<FigPose, FigFace> = { idle: "neutral", talk: "neutral", point: "angry", shock: "shocked", slump: "sad", cheer: "happy", gavel: "stern", present: "neutral", cross: "stern", cry: "crying", smug: "smug" };

export type HairStyle = "short" | "bald" | "long" | "bun" | "curly" | "side" | "none";
/** one cast entry in recipe.cast: everything optional except the role */
export type CastSpec = {
  role: Role;
  skin?: string; suit?: string; pants?: string; shirt?: string; tie?: string;
  hair?: string; hairStyle?: HairStyle; glasses?: boolean; beard?: boolean;
  /** an apron over the outfit (a shop owner, a cook) */
  apron?: string;
  build?: "slim" | "avg" | "broad";
  /** height multiplier (default 1 = 1.78 m) */
  height?: number;
  /** text for a nameplate prop that says {"kit": "nameplate", "of": "<cast id>"} */
  plate?: string;
};
const ROLE_DEFAULT: Record<Role, Required<Pick<CastSpec, "suit" | "pants" | "shirt" | "tie" | "hairStyle">>> = {
  judge: { suit: "#15151c", pants: "#15151c", shirt: "#f4f1ea", tie: "#15151c", hairStyle: "short" },
  plaintiff: { suit: "#3a4a6e", pants: "#2c3956", shirt: "#e9edf4", tie: "#8a2a2a", hairStyle: "short" },
  defendant: { suit: "#6e6a62", pants: "#4c4a46", shirt: "#f1ede4", tie: "#2b4f7a", hairStyle: "short" },
  lawyer: { suit: "#22242c", pants: "#22242c", shirt: "#f2f2f2", tie: "#B9862A", hairStyle: "side" },
  witness: { suit: "#5b4a3a", pants: "#3e3328", shirt: "#ece4d6", tie: "#3a5a3a", hairStyle: "short" },
  bailiff: { suit: "#3d4a3a", pants: "#2e382c", shirt: "#3d4a3a", tie: "#1a1a1a", hairStyle: "short" },
  juror: { suit: LP.silhouette, pants: LP.silhouette, shirt: LP.silhouette, tie: LP.silhouette, hairStyle: "short" },
};

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const ease = (u: number) => { const x = clamp(u); return x * x * (3 - 2 * x); };
const easeOut = (u: number) => 1 - Math.pow(1 - clamp(u), 3);
const anticip = (u: number) => { const x = clamp(u); return x < 0.18 ? -0.08 * Math.sin((x / 0.18) * Math.PI) : 1 + 0.12 * Math.sin(((x - 0.18) / 0.82) * Math.PI) * (1 - x) - (1 - easeOut((x - 0.18) / 0.82)); };
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// ------------------------------------------------------------------ proportions (scale 1, metres)
const HIP_STAND = 0.92, HIP_SIT = 0.5;
const SH: V3 = [0.25, 0.52, 0]; // shoulder above the hip (x mirrored)
const UPPER = 0.29, FORE = 0.27;
const HEAD_Y = 0.79; // head centre above the hip
export const FIG_HEIGHT = 1.78;

/** an arm: elevation from straight down (0 down, PI/2 level, PI up), azimuth (0 sideways, PI/2 forward), elbow bend */
type Arm = { e: number; az: number; bend: number };
export type FigRaw = { lean: number; twist: number; roll: number; dy: number; dz: number; headP: number; headY: number; L: Arm; R: Arm };
export type FigState = {
  id: string; spec: CastSpec; x: number; y: number; z: number; yaw: number; s: number; sit: boolean;
  lean: number; twist: number; roll: number; headP: number; headY: number;
  /** body-local unit directions: shoulder -> elbow, elbow -> hand */
  armL: [V3, V3]; armR: [V3, V3];
  face: FigFace; blink: boolean; mouth: Viseme; gavel: boolean; floorY: number; breathe: number;
  /** walking: leg swing angle (rad) */ stride: number;
};
const armDir = (e: number, az: number, side: 1 | -1): V3 => [side * Math.sin(e) * Math.cos(az), -Math.cos(e), Math.sin(e) * Math.sin(az)];
const armDirs = (a: Arm, side: 1 | -1): [V3, V3] => {
  const e2 = a.e + a.bend, az2 = a.az + (Math.PI / 2 - a.az) * clamp(a.bend);
  return [armDir(a.e, a.az, side), armDir(e2, az2, side)];
};

/** a pose at local time tau, global t; `hits` are gavel strike times (gavel pose) */
export const posePrm = (p: FigPose, tau: number, t: number, seed: number, hits: number[]): FigRaw => {
  const w = (f: number, ph = 0) => Math.sin(t * f + seed * 1.7 + ph);
  const base: FigRaw = { lean: 0.02 * w(0.8), twist: 0.05 * w(0.5), roll: 0.015 * w(0.9, 1), dy: 0, dz: 0, headP: 0.03 * w(0.7, 2), headY: 0.08 * w(0.45, 1),
    L: { e: 0.12 + 0.03 * w(1.3), az: 0.4, bend: 0.25 }, R: { e: 0.12 + 0.03 * w(1.3, 1), az: 0.4, bend: 0.25 } };
  switch (p) {
    case "idle": return base;
    case "talk":
      return { ...base, twist: 0.12 * Math.sin(t * 1.5 + seed), headY: 0.1 * Math.sin(t * 1.9 + seed), headP: 0.05 * Math.sin(t * 4.1),
        L: { e: 0.75 + 0.3 * Math.sin(t * 4.6), az: 1.0 + 0.3 * Math.sin(t * 2.3), bend: 0.8 + 0.25 * Math.sin(t * 3.1) }, R: { e: 0.85 + 0.3 * Math.sin(t * 4.6 + 2.2), az: 1.05 + 0.3 * Math.sin(t * 2.6 + 1.4), bend: 0.8 + 0.25 * Math.sin(t * 3.3 + 1) } };
    case "point":
      return { ...base, lean: 0.08, headP: -0.04, R: { e: 1.55 + 0.03 * w(3), az: 1.25, bend: 0.05 }, L: { e: 0.2, az: 0.5, bend: 0.4 } };
    case "shock": {
      const k = easeOut(tau / 0.2), settle = clamp((tau - 0.2) / 0.9);
      const tr = tau > 0.2 ? 0.01 * Math.sin(t * 50) : 0;
      return { ...base, lean: -0.2 * k * (1 - 0.4 * settle), dz: -0.12 * k, dy: 0.04 * k * (1 - settle) + tr, headP: -0.18 * k,
        L: { e: 1.9 + 0.08 * w(8), az: 1.1, bend: 1.0 }, R: { e: 1.9 + 0.08 * w(8, 1), az: 1.1, bend: 1.0 } };
    }
    case "slump":
      return { ...base, lean: 0.26 + 0.02 * w(1.1), dy: -0.03, headP: 0.38, headY: 0.05 * w(0.4), L: { e: 0.08, az: 0.9, bend: 0.1 }, R: { e: 0.08, az: 0.9, bend: 0.1 } };
    case "cheer":
      return { ...base, dy: 0.05 * Math.abs(Math.sin(t * 6)), lean: -0.06, headP: -0.12, L: { e: 2.7 + 0.25 * Math.sin(t * 12), az: 0.4, bend: 0.2 }, R: { e: 2.7 + 0.25 * Math.sin(t * 12 + Math.PI), az: 0.4, bend: 0.2 } };
    case "present":
      return { ...base, twist: 0.15, lean: 0.06, R: { e: 1.25 + 0.05 * w(2), az: 1.0, bend: 0.25 }, L: { e: 0.2, az: 0.5, bend: 0.5 } };
    case "cross":
      return { ...base, lean: -0.04, headP: -0.06, L: { e: 0.55, az: 1.35, bend: 1.55 }, R: { e: 0.62, az: 1.35, bend: 1.5 } };
    case "cry": {
      const sob = 0.03 * Math.abs(Math.sin(t * 7));
      return { ...base, lean: 0.18, dy: -sob, headP: 0.3, L: { e: 1.05, az: 1.45, bend: 1.75 }, R: { e: 1.05, az: 1.45, bend: 1.75 } };
    }
    case "smug":
      return { ...base, lean: -0.08, headP: -0.12, headY: 0.18 + 0.05 * w(0.6), roll: 0.05, L: { e: 0.55, az: 1.35, bend: 1.55 }, R: { e: 0.62, az: 1.35, bend: 1.5 } };
    case "gavel": {
      // raise from h-0.55 to h-0.14, strike down at h, rest after (forearm on the bench)
      let e = 1.0, bend = 0.7;
      const next = hits.find((h) => t < h + 0.25);
      if (next !== undefined) {
        const up = ease((t - (next - 0.55)) / 0.41);
        const down = clamp((t - (next - 0.14)) / 0.14);
        e = t < next - 0.14 ? lerp(1.0, 2.55, up) : t < next ? lerp(2.55, 1.05, down * down) : 1.05 + 0.08 * Math.exp(-(t - next) * 12) * Math.sin((t - next) * 40);
        bend = t < next - 0.14 ? lerp(0.7, 0.25, up) : lerp(0.25, 0.75, clamp((t - next + 0.14) / 0.14));
      }
      return { ...base, lean: 0.06, headP: 0.05, R: { e, az: 1.15, bend }, L: { e: 0.95, az: 1.3, bend: 0.9 } };
    }
  }
};
const mixArm = (a: Arm, b: Arm, u: number): Arm => ({ e: lerp(a.e, b.e, u), az: lerp(a.az, b.az, u), bend: lerp(a.bend, b.bend, u) });
const mixRaw = (a: FigRaw, b: FigRaw, u: number): FigRaw => ({
  lean: lerp(a.lean, b.lean, u), twist: lerp(a.twist, b.twist, u), roll: lerp(a.roll, b.roll, u), dy: lerp(a.dy, b.dy, u), dz: lerp(a.dz, b.dz, u),
  headP: lerp(a.headP, b.headP, u), headY: lerp(a.headY, b.headY, u), L: mixArm(a.L, b.L, u), R: mixArm(a.R, b.R, u),
});

/** one figure in a shot */
export type FigTrack = {
  id: string; spec: CastSpec; seed: number; s: number; sit: boolean;
  /** the floor point under the figure (or a platform point: y = the platform top) */
  at: (t: number) => V3;
  yaw: (t: number) => number;
  segs: { t0: number; pose: FigPose; face?: FigFace }[];
  faces: { t0: number; face: FigFace }[];
  pointAt?: (t: number) => V3 | null;
  talk?: (t: number) => Viseme | null;
  hits: number[];
  gavel: boolean;
};
const BLEND = 0.34;
const blinkAt = (t: number, seed: number, extra: number[]) => {
  if (extra.some((e) => t >= e - 1 / 30 && t < e + 3 / 30)) return true;
  const per = 2.4 + 2.2 * hash(seed);
  return (t + hash(seed + 3) * per) % per < 0.12;
};

export const figState = (tr: FigTrack, t: number): FigState => {
  let si = 0;
  tr.segs.forEach((s, k) => { if (t >= s.t0) si = k; });
  const seg = tr.segs[si];
  let raw = posePrm(seg.pose, t - seg.t0, t, tr.seed, tr.hits);
  if (si > 0 && t - seg.t0 < BLEND) { const prev = tr.segs[si - 1]; raw = mixRaw(posePrm(prev.pose, t - prev.t0, t, tr.seed, tr.hits), raw, anticip((t - seg.t0) / BLEND)); }
  let face = seg.face ?? POSE_FACE[seg.pose];
  for (const f of tr.faces) if (t >= f.t0 && f.t0 >= seg.t0 - 1e-6) face = f.face;
  const swaps = [...tr.segs.slice(1).map((s) => s.t0), ...tr.faces.map((f) => f.t0)];
  const s = tr.s * (tr.spec.height ?? 1);
  const p = tr.at(t);
  const yaw = tr.yaw(t);
  const fw: V3 = [Math.sin(yaw), 0, Math.cos(yaw)];
  let armR = armDirs(raw.R, 1);
  const armL = armDirs(raw.L, -1);
  const tgt = seg.pose === "point" && tr.pointAt ? tr.pointAt(t) : null;
  if (tgt) {
    const hip = (tr.sit ? HIP_SIT : HIP_STAND) * s;
    const sh: V3 = [p[0], p[1] + hip + SH[1] * s, p[2]];
    const d: V3 = [tgt[0] - sh[0], tgt[1] - sh[1], tgt[2] - sh[2]];
    const yw = yaw + raw.twist;
    const lx = d[0] * Math.cos(yw) - d[2] * Math.sin(yw), lz = d[0] * Math.sin(yw) + d[2] * Math.cos(yw);
    const L = Math.hypot(lx, d[1], lz) || 1;
    const want: V3 = [Math.max(0.1, lx / L), d[1] / L, Math.max(-0.1, lz / L)];
    const wl = Math.hypot(...want);
    const u = ease((t - seg.t0) / 0.3);
    const mix = (v: V3): V3 => [lerp(v[0], want[0] / wl, u), lerp(v[1], want[1] / wl, u), lerp(v[2], want[2] / wl, u)];
    armR = [mix(armR[0]), mix(armR[1])];
  }
  const breathe = Math.sin(t * 1.9 + tr.seed);
  // walking: the legs swing while the place moves (speed from a short look-ahead)
  const q = tr.at(t + 0.05);
  const speed = Math.hypot(q[0] - p[0], q[2] - p[2]) / 0.05;
  const stride = tr.sit ? 0 : 0.45 * clamp(speed / 0.6) * Math.sin(t * 9);
  return {
    id: tr.id, spec: tr.spec, s, sit: tr.sit,
    x: p[0] + fw[0] * raw.dz * s, y: p[1] + raw.dy * s, z: p[2] + fw[2] * raw.dz * s, yaw,
    lean: raw.lean + 0.012 * breathe, twist: raw.twist, roll: raw.roll, headP: raw.headP, headY: raw.headY,
    armL, armR, face, blink: blinkAt(t, tr.seed, swaps), mouth: tr.talk?.(t) ?? "rest", gavel: tr.gavel, floorY: p[1], breathe, stride,
  };
};

// ------------------------------------------------------------------ geometry helpers (shared with the QA and the gate)
const rotYv = (v: V3, a: number): V3 => [v[0] * Math.cos(a) + v[2] * Math.sin(a), v[1], -v[0] * Math.sin(a) + v[2] * Math.cos(a)];
const rotXv = (v: V3, a: number): V3 => [v[0], v[1] * Math.cos(a) - v[2] * Math.sin(a), v[1] * Math.sin(a) + v[2] * Math.cos(a)];
const hipY = (st: FigState) => (st.sit ? HIP_SIT : HIP_STAND) * st.s;
/** a point given in upper-body space (above the hip) -> world */
const upperWorld = (st: FigState, v: V3): V3 => {
  const a = rotYv(rotXv([v[0] * st.s, v[1] * st.s, v[2] * st.s], st.lean), st.yaw + st.twist);
  return [st.x + a[0], st.y + hipY(st) + a[1], st.z + a[2]];
};
/** the face centre (world) and its radius: text must stay off it */
/** a point in the head group's space -> upper-body space: the head group turns by [headP, headY] (Euler XYZ) about the
 *  hip, as FigureView draws it, so a nod or a slump moves the head (slump: ~0.29 m forward). Before 2026-11-22 the face
 *  and head points ignored this and could sit up to 0.29 m off the drawn head. */
const headLocal = (st: FigState, v: V3): V3 => rotXv(rotYv(v, st.headY), st.headP);
export const figFace = (st: FigState): { c: V3; r: number } => ({ c: upperWorld(st, headLocal(st, [0, HEAD_Y, 0.11])), r: 0.15 * st.s });
export const figHead = (st: FigState): V3 => upperWorld(st, headLocal(st, [0, HEAD_Y, 0]));
export const figHand = (st: FigState, side: "L" | "R"): V3 => {
  const sx = side === "R" ? 1 : -1, [d1, d2] = side === "R" ? st.armR : st.armL;
  return upperWorld(st, [sx * SH[0] + d1[0] * UPPER + d2[0] * FORE, SH[1] + d1[1] * UPPER + d2[1] * FORE, d1[2] * UPPER + d2[2] * FORE]);
};
/** QA boxes: torso and head (hands rest on tables and benches, so they are not checked) */
export const figBoxes = (st: FigState) => {
  const w = st.spec.build === "broad" ? 0.24 : st.spec.build === "slim" ? 0.18 : 0.21;
  const hy = hipY(st);
  const torsoC = upperWorld(st, [0, 0.26, 0]);
  return [
    { name: `${st.id}.body`, c: [torsoC[0], (st.y + 0.05 * st.s + torsoC[1] + 0.3 * st.s) / 2, torsoC[2]] as V3, h: [w * st.s, (torsoC[1] + 0.3 * st.s - st.y - 0.05 * st.s) / 2, 0.13 * st.s] as V3 },
    { name: `${st.id}.head`, c: figHead(st), h: [0.12 * st.s, 0.15 * st.s, 0.12 * st.s] as V3 },
    ...(st.sit ? [] : [{ name: `${st.id}.legs`, c: [st.x, st.y + hy / 2, st.z] as V3, h: [0.16 * st.s, hy / 2 - 0.02, 0.1 * st.s] as V3 }]),
  ];
};

// ------------------------------------------------------------------ the face (drawn on a transparent canvas)
const faceTex = (face: FigFace, blink: boolean, mouth: Viseme, ink: string, tearPh: number) =>
  canvasTexture(`fig|${face}|${blink ? 1 : 0}|${mouth}|${ink}|${tearPh}`, 256, 256, (g, W, H) => {
    g.clearRect(0, 0, W, H);
    g.strokeStyle = ink; g.fillStyle = ink; g.lineCap = "round"; g.lineJoin = "round";
    const cx = W / 2, ey = H * 0.42, ex = 52, my = H * 0.78;
    const eye = (x: number, kind: "dot" | "wide" | "line" | "arc" | "narrow") => {
      if (blink && kind !== "arc") kind = "line";
      g.lineWidth = 12;
      if (kind === "dot") { g.beginPath(); g.ellipse(x, ey, 13, 17, 0, 0, Math.PI * 2); g.fill(); }
      if (kind === "wide") { g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(x, ey, 24, 28, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = ink; g.beginPath(); g.arc(x, ey + 2, 11, 0, Math.PI * 2); g.fill(); }
      if (kind === "line") { g.beginPath(); g.moveTo(x - 18, ey + 2); g.lineTo(x + 18, ey + 2); g.stroke(); }
      if (kind === "narrow") { g.beginPath(); g.ellipse(x, ey + 3, 15, 7, 0, 0, Math.PI * 2); g.fill(); }
      if (kind === "arc") { g.beginPath(); g.arc(x, ey + 10, 18, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); }
    };
    const brow = (x: number, tilt: number, dy = 0, side = 1) => { g.lineWidth = 11; g.beginPath(); g.moveTo(x - 24, ey - 42 + dy + side * tilt * 10); g.lineTo(x + 24, ey - 42 + dy - side * tilt * 10); g.stroke(); };
    const talk = () => {
      const open = mouth === "A" ? 30 : mouth === "O" ? 26 : mouth === "E" ? 16 : mouth === "U" ? 18 : mouth === "M" ? 4 : 8;
      const wd = mouth === "O" || mouth === "U" ? 26 : mouth === "E" ? 58 : 46;
      g.fillStyle = "#3a1414"; g.beginPath(); g.ellipse(cx, my - 6, wd / 2, Math.max(4, open / 2), 0, 0, Math.PI * 2); g.fill(); g.fillStyle = ink;
    };
    const line = (x0: number, y0: number, x1: number, y1: number, q?: number) => { g.lineWidth = 10; g.beginPath(); g.moveTo(x0, y0); if (q !== undefined) g.quadraticCurveTo((x0 + x1) / 2, q, x1, y1); else g.lineTo(x1, y1); g.stroke(); };
    const talking = mouth !== "rest";
    switch (face) {
      case "neutral": eye(cx - ex, "dot"); eye(cx + ex, "dot"); brow(cx - ex, 0, 0, -1); brow(cx + ex, 0); if (talking) talk(); else line(cx - 28, my - 6, cx + 28, my - 6); break;
      case "stern": eye(cx - ex, "narrow"); eye(cx + ex, "narrow"); brow(cx - ex, 0.6, 6, -1); brow(cx + ex, 0.6, 6); if (talking) talk(); else line(cx - 30, my - 2, cx + 30, my - 2); break;
      case "angry": eye(cx - ex, "dot"); eye(cx + ex, "dot"); brow(cx - ex, 1.3, 10, -1); brow(cx + ex, 1.3, 10); if (talking) talk(); else { g.fillStyle = "#3a1414"; g.beginPath(); g.ellipse(cx, my - 4, 26, 10, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = ink; } break;
      case "smug": eye(cx - ex, "narrow"); eye(cx + ex, "dot"); brow(cx - ex, -0.3, 4, -1); brow(cx + ex, -0.9, -6); if (talking) talk(); else line(cx - 30, my - 2, cx + 32, my - 18, my + 6); break;
      case "shocked": eye(cx - ex, "wide"); eye(cx + ex, "wide"); brow(cx - ex, -0.4, -14, -1); brow(cx + ex, -0.4, -14); g.fillStyle = "#3a1414"; g.beginPath(); g.ellipse(cx, my - 2, 18, 26, 0, 0, Math.PI * 2); g.fill(); break;
      case "sad": eye(cx - ex, "dot"); eye(cx + ex, "dot"); brow(cx - ex, -1.0, 0, -1); brow(cx + ex, -1.0, 0); if (talking) talk(); else line(cx - 28, my + 4, cx + 28, my + 4, my - 22); break;
      case "happy": eye(cx - ex, "arc"); eye(cx + ex, "arc"); brow(cx - ex, -0.3, -6, -1); brow(cx + ex, -0.3, -6); if (talking) talk(); else { g.fillStyle = "#3a1414"; g.beginPath(); g.moveTo(cx - 34, my - 14); g.quadraticCurveTo(cx, my + 34, cx + 34, my - 14); g.closePath(); g.fill(); } break;
      case "worried": eye(cx - ex, "dot"); eye(cx + ex, "dot"); brow(cx - ex, -1.1, -8, -1); brow(cx + ex, -1.1, -8); if (talking) talk(); else { g.lineWidth = 9; g.beginPath(); for (let k = 0; k <= 4; k++) g.lineTo(cx - 32 + k * 16, my + (k % 2 ? -8 : 4)); g.stroke(); } break;
      case "crying": {
        eye(cx - ex, "arc"); eye(cx + ex, "arc"); brow(cx - ex, -1.2, -4, -1); brow(cx + ex, -1.2, -4);
        g.fillStyle = "#3a1414"; g.beginPath(); g.ellipse(cx, my, 24, 14, 0, Math.PI, 0); g.fill();
        g.fillStyle = "#7cc4ff";
        for (const x of [cx - ex, cx + ex]) { const y = ey + 22 + ((tearPh * 14) % 56); g.beginPath(); g.ellipse(x, y, 7, 11, 0, 0, Math.PI * 2); g.fill(); }
        break;
      }
    }
  });

// ------------------------------------------------------------------ rendering
const faceMats = new Map<string, THREE.MeshBasicMaterial>();
const faceMat = (tex: THREE.Texture) => {
  let m = faceMats.get(tex.uuid);
  if (!m) { if (faceMats.size > 300) faceMats.clear(); m = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }); faceMats.set(tex.uuid, m); }
  return m;
};
const quatDown = (d: V3) => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), new THREE.Vector3(...d).normalize());

const ArmView: React.FC<{ side: 1 | -1; d: [V3, V3]; sleeve: string; skin: string; gavel?: boolean; wide?: boolean }> = ({ side, d, sleeve, skin, gavel, wide }) => {
  const sh: V3 = [side * SH[0], SH[1], 0];
  const el: V3 = [sh[0] + d[0][0] * UPPER, sh[1] + d[0][1] * UPPER, sh[2] + d[0][2] * UPPER];
  const hd: V3 = [el[0] + d[1][0] * FORE, el[1] + d[1][1] * FORE, el[2] + d[1][2] * FORE];
  const q1 = quatDown(d[0]), q2 = quatDown(d[1]);
  const sm = plastic(sleeve, { rough: 0.8, flat: true });
  return (
    <>
      <group position={sh} quaternion={q1}>
        <mesh geometry={geoOf(wide ? "figUpperW" : "figUpper", () => new THREE.CylinderGeometry(wide ? 0.075 : 0.062, wide ? 0.07 : 0.055, UPPER, 6))} material={sm} position={[0, -UPPER / 2, 0]} castShadow />
      </group>
      <mesh geometry={geoOf("figElbow", () => new THREE.IcosahedronGeometry(0.056, 0))} material={sm} position={el} />
      <group position={el} quaternion={q2}>
        <mesh geometry={geoOf(wide ? "figForeW" : "figFore", () => new THREE.CylinderGeometry(wide ? 0.085 : 0.054, wide ? 0.06 : 0.048, FORE, 6))} material={sm} position={[0, -FORE / 2, 0]} castShadow />
      </group>
      <mesh geometry={geoOf("figHand", () => new THREE.IcosahedronGeometry(0.052, 1))} material={plastic(skin, { rough: 0.7, flat: true })} position={hd} />
      {gavel ? (
        <group position={hd} quaternion={q2}>
          {/* handle continues along the forearm a little, the head sits across it */}
          <mesh geometry={geoOf("figGavelH", () => new THREE.CylinderGeometry(0.016, 0.02, 0.3, 6))} material={plastic(LP.woodLight, { rough: 0.5 })} position={[0, -0.12, 0]} />
          <mesh geometry={geoOf("figGavelHd", () => new THREE.CylinderGeometry(0.045, 0.045, 0.17, 10))} material={plastic(LP.woodDark, { rough: 0.4 })} position={[0, -0.26, 0]} rotation={[0, 0, Math.PI / 2]} />
          <mesh geometry={geoOf("figGavelBand", () => new THREE.CylinderGeometry(0.047, 0.047, 0.03, 10))} material={plastic(LP.gold, { rough: 0.3, emissive: LP.goldDeep, ei: 0.2 })} position={[0, -0.26, 0]} rotation={[0, 0, Math.PI / 2]} />
        </group>
      ) : null}
    </>
  );
};

const Hair: React.FC<{ style: HairStyle; color: string }> = ({ style, color }) => {
  const m = plastic(color, { rough: 0.85, flat: true });
  const y = HEAD_Y;
  switch (style) {
    case "short": return <><mesh geometry={rbox(0.27, 0.09, 0.27, 0.03)} material={m} position={[0, y + 0.13, -0.01]} /><mesh geometry={rbox(0.27, 0.2, 0.06, 0.02)} material={m} position={[0, y + 0.04, -0.115]} /></>;
    case "side": return <><mesh geometry={rbox(0.27, 0.1, 0.27, 0.03)} material={m} position={[0, y + 0.135, -0.01]} rotation={[0, 0, 0.08]} /><mesh geometry={rbox(0.27, 0.22, 0.06, 0.02)} material={m} position={[0, y + 0.03, -0.115]} /><mesh geometry={rbox(0.1, 0.06, 0.2, 0.02)} material={m} position={[0.07, y + 0.17, 0.03]} rotation={[0, 0, -0.25]} /></>;
    case "bald": return <><mesh geometry={rbox(0.27, 0.1, 0.08, 0.02)} material={m} position={[0, y + 0.0, -0.11]} />{[-1, 1].map((k) => <mesh key={k} geometry={rbox(0.03, 0.08, 0.12, 0.01)} material={m} position={[k * 0.128, y + 0.02, -0.04]} />)}</>;
    case "long": return <><mesh geometry={rbox(0.28, 0.1, 0.28, 0.03)} material={m} position={[0, y + 0.13, -0.01]} /><mesh geometry={rbox(0.3, 0.42, 0.08, 0.03)} material={m} position={[0, y - 0.06, -0.11]} />{[-1, 1].map((k) => <mesh key={k} geometry={rbox(0.04, 0.3, 0.16, 0.015)} material={m} position={[k * 0.135, y - 0.02, -0.03]} />)}</>;
    case "bun": return <><mesh geometry={rbox(0.27, 0.09, 0.27, 0.03)} material={m} position={[0, y + 0.13, -0.01]} /><mesh geometry={rbox(0.27, 0.2, 0.06, 0.02)} material={m} position={[0, y + 0.04, -0.115]} /><mesh geometry={geoOf("figBun", () => new THREE.IcosahedronGeometry(0.075, 1))} material={m} position={[0, y + 0.17, -0.11]} /></>;
    case "curly": return <>{[[-0.08, 0.14, 0], [0.08, 0.14, 0], [0, 0.16, -0.06], [-0.1, 0.08, -0.08], [0.1, 0.08, -0.08], [0, 0.1, 0.06], [0, 0.04, -0.12]].map(([x, yy, z], k) => <mesh key={k} geometry={geoOf("figCurl", () => new THREE.IcosahedronGeometry(0.075, 0))} material={m} position={[x, y + yy, z]} />)}</>;
    default: return null;
  }
};

/** a stylized low-poly person; `silhouette` (jurors) draws one dark flat colour with no face */
export const Figure: React.FC<{ st: FigState; t: number }> = ({ st, t }) => {
  const sp = st.spec;
  const def = ROLE_DEFAULT[sp.role];
  const sil = sp.role === "juror";
  const skin = sil ? LP.silhouette : sp.skin ?? "#d9a07a";
  const suit = sil ? LP.silhouette : sp.suit ?? def.suit;
  const pants = sil ? LP.silhouette : sp.pants ?? def.pants;
  const shirt = sil ? LP.silhouette : sp.shirt ?? def.shirt;
  const tie = sil ? LP.silhouette : sp.tie ?? def.tie;
  const hair = sil ? "#0c111c" : sp.hair ?? "#2a1d16";
  const judge = sp.role === "judge";
  const bw = sp.build === "broad" ? 1.14 : sp.build === "slim" ? 0.9 : 1;
  const hy = st.sit ? HIP_SIT : HIP_STAND;
  const sm = (c: string) => plastic(c, { rough: 0.8, flat: true });
  const tex = sil ? null : faceTex(st.face, st.blink, st.mouth, "#1a1210", Math.floor(t * 8) % 4);
  const breath = 1 + 0.012 * st.breathe;
  const legs = st.sit
    ? [-1, 1].map((k) => (
      <group key={k}>
        <mesh geometry={geoOf("figThighS", () => new THREE.BoxGeometry(0.15, 0.15, 0.46))} material={sm(pants)} position={[k * 0.11, hy, 0.2]} castShadow />
        <mesh geometry={geoOf("figShinS", () => new THREE.BoxGeometry(0.14, 0.46, 0.15))} material={sm(pants)} position={[k * 0.11, 0.25, 0.42]} castShadow />
        <mesh geometry={geoOf("figShoe", () => new THREE.BoxGeometry(0.13, 0.08, 0.26))} material={sm("#14110f")} position={[k * 0.11, 0.04, 0.47]} />
      </group>
    ))
    : [-1, 1].map((k) => (
      <group key={k} position={[k * 0.105, HIP_STAND, 0]} rotation={[k * st.stride, 0, 0]}>
        <mesh geometry={geoOf("figLeg", () => new THREE.BoxGeometry(0.155, HIP_STAND - 0.08, 0.17))} material={sm(pants)} position={[0, 0.08 + (HIP_STAND - 0.08) / 2 - HIP_STAND, 0]} castShadow />
        <mesh geometry={geoOf("figShoe", () => new THREE.BoxGeometry(0.13, 0.08, 0.26))} material={sm("#14110f")} position={[0, 0.04 - HIP_STAND, 0.04]} castShadow />
      </group>
    ));
  return (
    <group position={[st.x, st.y, st.z]} rotation={[0, st.yaw, 0]} scale={st.s}>
      {judge && !st.sit ? (
        <mesh geometry={geoOf("figRobeLow", () => new THREE.CylinderGeometry(0.27, 0.36, HIP_STAND, 8))} material={sm(suit)} position={[0, HIP_STAND / 2 + 0.02, 0]} castShadow />
      ) : legs}
      <group position={[0, hy, 0]} rotation={[st.lean, st.twist, st.roll, "YXZ"]}>
        {/* torso: a tapered four-sided block (flat shaded), robe for the judge */}
        <mesh geometry={geoOf(judge ? "figRobe" : "figTorso", () => { const g = new THREE.CylinderGeometry(judge ? 0.33 : 0.3, judge ? 0.3 : 0.23, 0.6, 4, 1); g.rotateY(Math.PI / 4); return g; })} material={sm(suit)} position={[0, 0.3, 0]} scale={[bw * breath, 1, 0.56 * bw * breath]} castShadow receiveShadow />
        {!sil ? (
          <>
            {/* shirt V and tie (judge: a white collar) */}
            <mesh geometry={geoOf("figShirtV", () => { const g = new THREE.CircleGeometry(0.1, 3); g.rotateZ(-Math.PI / 2); return g; })} material={plastic(shirt, { rough: 0.7, side: THREE.DoubleSide })} position={[0, 0.52, 0.12 * bw + 0.006]} scale={[0.8, 1.2, 1]} />
            {!judge ? <mesh geometry={geoOf("figTie", () => new THREE.BoxGeometry(0.05, 0.26, 0.015))} material={plastic(tie, { rough: 0.5 })} position={[0, 0.4, 0.125 * bw + 0.01]} rotation={[0.08, 0, 0]} /> : null}
            {sp.apron ? <mesh geometry={geoOf("figApron", () => new THREE.BoxGeometry(0.4, 0.62, 0.02))} material={plastic(sp.apron, { rough: 0.9 })} position={[0, 0.06, 0.13 * bw + 0.012]} /> : null}
          </>
        ) : null}
        <mesh geometry={geoOf("figNeck", () => new THREE.CylinderGeometry(0.055, 0.06, 0.12, 6))} material={sm(skin)} position={[0, 0.64, 0]} />
        <group position={[0, 0, 0]} rotation={[st.headP, st.headY, 0]}>
          <mesh geometry={rbox(0.24, 0.28, 0.25, 0.05)} material={sm(skin)} position={[0, HEAD_Y, 0]} castShadow />
          {!sil ? (
            <>
              <mesh geometry={geoOf("figNose", () => new THREE.BoxGeometry(0.045, 0.06, 0.05))} material={sm(skin)} position={[0, HEAD_Y - 0.01, 0.135]} />
              {[-1, 1].map((k) => <mesh key={k} geometry={geoOf("figEar", () => new THREE.BoxGeometry(0.03, 0.07, 0.05))} material={sm(skin)} position={[k * 0.125, HEAD_Y, 0]} />)}
              <mesh geometry={geoOf("figFace", () => new THREE.PlaneGeometry(0.22, 0.22))} material={faceMat(tex!)} position={[0, HEAD_Y, 0.1265]} />
              {sp.glasses ? [-1, 1].map((k) => <mesh key={k} geometry={geoOf("figGlass", () => new THREE.TorusGeometry(0.032, 0.008, 4, 10))} material={plastic("#16120e", { rough: 0.3 })} position={[k * 0.045, HEAD_Y + 0.022, 0.135]} />) : null}
              {sp.beard ? <mesh geometry={rbox(0.24, 0.1, 0.06, 0.02)} material={sm(hair)} position={[0, HEAD_Y - 0.115, 0.1]} /> : null}
            </>
          ) : null}
          <Hair style={sp.hairStyle ?? def.hairStyle} color={hair} />
        </group>
        <ArmView side={1} d={st.armR} sleeve={suit} skin={skin} gavel={st.gavel} wide={judge} />
        <ArmView side={-1} d={st.armL} sleeve={suit} skin={skin} wide={judge} />
      </group>
      {/* soft contact shadow so standing figures sit on the floor even outside the key's shadow */}
      <mesh geometry={geoOf("figBlob", () => new THREE.CircleGeometry(0.32, 16))} material={blobMat()} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, st.sit ? 0.2 : 0]} />
    </group>
  );
};
let blob: THREE.MeshBasicMaterial | null = null;
const blobMat = () => {
  if (!blob) {
    const tx = canvasTexture("figBlobTex", 64, 64, (g, W) => { const gr = g.createRadialGradient(W / 2, W / 2, 0, W / 2, W / 2, W / 2); gr.addColorStop(0, "rgba(0,0,0,0.55)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, W, W); });
    blob = new THREE.MeshBasicMaterial({ map: tx, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  }
  return blob;
};
