// BOLT: the "Tech explained" mascot. An original small round low-poly robot: a faceted white shell, ONE screen face
// (emoji-like expressions drawn on a canvas, glowing mint on navy), an orange-tipped antenna, two stubby arms with
// round mitts, and a mint hover thruster instead of legs. It never walks; it hovers and bobs.
// Like the Blocky rig (src/blocky), it is a pure function of t: a pose = arm directions + body offsets, blended
// between poses with anticipation and overshoot; the face swaps hide behind a blink. Nothing is ever static.
import React from "react";
import * as THREE from "three";
import { canvasTexture, geoOf, plastic } from "../blocky/mat";
import type { V3 } from "../blocky/motion";
import type { Viseme } from "../blocky/Blocky";
import { TP } from "./palette";

export type BoltPose = "idle" | "point" | "shrug" | "celebrate" | "shock" | "explain" | "peek";
export type BoltFace = "curious" | "shocked" | "happy" | "thinking" | "worried" | "excited";
export const BOLT_POSES: BoltPose[] = ["idle", "point", "shrug", "celebrate", "shock", "explain", "peek"];
export const BOLT_FACES: BoltFace[] = ["curious", "shocked", "happy", "thinking", "worried", "excited"];
/** the face a pose brings when the recipe gives none */
export const POSE_FACE: Record<BoltPose, BoltFace> = { idle: "happy", point: "excited", shrug: "thinking", celebrate: "excited", shock: "shocked", explain: "happy", peek: "curious" };

/** body radius (m, scale 1); the shell's centre hovers HOVER m above the place given (a floor point) */
export const BOLT_R = 0.3;
export const HOVER = 1.05;
const SHOULDER: V3 = [0.29, -0.07, 0.02]; // right shoulder (x mirrored for the left), body-local, scale 1
const ARM = 0.17; // shoulder to mitt centre

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const ease = (u: number) => { const x = clamp(u); return x * x * (3 - 2 * x); };
const easeOut = (u: number) => 1 - Math.pow(1 - clamp(u), 3);
/** anticipation (dip below 0) then overshoot (above 1) and settle: acting blends */
const anticip = (u: number) => { const x = clamp(u); return x < 0.18 ? -0.08 * Math.sin((x / 0.18) * Math.PI) : 1 + 0.12 * Math.sin(((x - 0.18) / 0.82) * Math.PI) * (1 - x) - (1 - easeOut((x - 0.18) / 0.82)); };
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

/** an arm: elevation from straight down (0 down, PI/2 level, PI up) and azimuth (0 = sideways out, PI/2 = forward) */
type Arm = { e: number; az: number };
/** a solved pose (body-local), before placement */
export type BoltRaw = { dx: number; dy: number; dz: number; yaw: number; pitch: number; roll: number; sq: number; L: Arm; R: Arm; pointAt?: V3 };
export type BoltState = {
  id: string; x: number; y: number; z: number; yaw: number; pitch: number; roll: number; s: number;
  /** squash/stretch along y (1 = none) */ sq: number;
  armL: V3; armR: V3; // unit directions shoulder -> mitt (body-local)
  face: BoltFace; blink: boolean; mouth: Viseme; glow: number; thrust: number; floorY: number;
};

const armDir = (a: Arm, side: 1 | -1): V3 => [side * Math.sin(a.e) * Math.cos(a.az), -Math.cos(a.e), Math.sin(a.e) * Math.sin(a.az)];

/** a pose at local time tau (s since it started), global t, seed */
export const posePrm = (p: BoltPose, tau: number, t: number, seed: number): BoltRaw => {
  const w = (f: number, ph = 0) => Math.sin(t * f + seed * 1.7 + ph);
  const base: BoltRaw = { dx: 0, dy: 0, dz: 0, yaw: 0, pitch: 0, roll: 0, sq: 1, L: { e: 0.38 + 0.06 * w(2.1), az: 0.35 }, R: { e: 0.38 + 0.06 * w(2.1, 1), az: 0.35 } };
  switch (p) {
    case "idle":
      return { ...base, yaw: 0.12 * w(0.7), roll: 0.03 * w(1.3) };
    case "point":
      return { ...base, pitch: 0.06, yaw: 0.05 * w(0.9), R: { e: 1.5 + 0.04 * w(3), az: 1.2 }, L: { e: 0.5 + 0.06 * w(2.4), az: 0.6 } };
    case "shrug": {
      const up = Math.sin(clamp(tau / 0.35) * Math.PI) * 0.06;
      return { ...base, dy: up, roll: 0.12 * Math.sin(tau * 2.2), pitch: -0.08, L: { e: 1.25 + 0.06 * w(4), az: 0.95 }, R: { e: 1.25 + 0.06 * w(4, 1), az: 0.95 } };
    }
    case "celebrate": {
      const spin = 2 * Math.PI * ease(tau / 0.7);
      return { ...base, dy: 0.1 * Math.abs(Math.sin(t * 6.5)), yaw: spin, sq: 1 + 0.05 * Math.sin(t * 13), L: { e: 2.55 + 0.32 * Math.sin(t * 13), az: 0.35 }, R: { e: 2.55 + 0.32 * Math.sin(t * 13 + Math.PI), az: 0.35 } };
    }
    case "shock": {
      const k = easeOut(tau / 0.22), settle = clamp((tau - 0.22) / 0.8);
      const tremble = tau > 0.22 ? 0.012 * Math.sin(t * 55) : 0;
      return { ...base, dz: -0.28 * k * (1 - 0.4 * settle), dy: 0.12 * k * (1 - 0.5 * settle) + tremble, pitch: -0.38 * k * (1 - 0.5 * settle), sq: tau < 0.12 ? 1 + 0.18 * Math.sin((tau / 0.12) * Math.PI) : 1, L: { e: 2.25 + 0.1 * w(9), az: 0.6 }, R: { e: 2.25 + 0.1 * w(9, 1), az: 0.6 } };
    }
    case "explain":
      return { ...base, yaw: 0.16 * Math.sin(t * 1.6 + seed), roll: 0.05 * Math.sin(t * 3.1), L: { e: 1.05 + 0.4 * Math.sin(t * 5.2), az: 1.1 + 0.35 * Math.sin(t * 2.6) }, R: { e: 1.15 + 0.4 * Math.sin(t * 5.2 + 2.3), az: 1.1 + 0.35 * Math.sin(t * 2.6 + 1.7) } };
    case "peek": {
      const lean = 0.5 + 0.5 * Math.sin(t * 1.4 + seed);
      return { ...base, dy: -0.22, dx: 0.05 * lean, roll: -0.42 - 0.12 * lean, pitch: 0.12, L: { e: 1.55, az: 1.45 }, R: { e: 0.6 + 0.1 * w(3), az: 0.8 } };
    }
  }
};
const mixArm = (a: Arm, b: Arm, u: number): Arm => ({ e: lerp(a.e, b.e, u), az: lerp(a.az, b.az, u) });
const mixRaw = (a: BoltRaw, b: BoltRaw, u: number): BoltRaw => ({
  dx: lerp(a.dx, b.dx, u), dy: lerp(a.dy, b.dy, u), dz: lerp(a.dz, b.dz, u), yaw: lerp(a.yaw, b.yaw, clamp(u)), pitch: lerp(a.pitch, b.pitch, u), roll: lerp(a.roll, b.roll, u), sq: lerp(a.sq, b.sq, u),
  L: mixArm(a.L, b.L, u), R: mixArm(a.R, b.R, u),
});

/** one BOLT in a shot: pose segments (each starts at t0), a base place, a facing, optional point target */
export type BoltTrack = {
  id: string; seed: number; s: number;
  /** floor point under BOLT (or a point in the air: y = the floor under it, the shell hovers HOVER*s above) */
  at: (t: number) => V3;
  yaw: (t: number) => number;
  segs: { t0: number; pose: BoltPose; face?: BoltFace }[];
  faces: { t0: number; face: BoltFace }[];
  pointAt?: (t: number) => V3 | null;
  talk?: (t: number) => Viseme | null;
  hover?: number;
};
const BLEND = 0.34;
/** blink: every 2.2-4.6 s by seed, 4 frames; plus forced blinks (face swaps hide behind them) */
const blinkAt = (t: number, seed: number, extra: number[]) => {
  if (extra.some((e) => t >= e - 1 / 30 && t < e + 3 / 30)) return true;
  const per = 2.2 + 2.4 * hash(seed);
  const ph = (t + hash(seed + 3) * per) % per;
  return ph < 0.12;
};

export const boltState = (tr: BoltTrack, t: number): BoltState => {
  let si = 0;
  tr.segs.forEach((s, k) => { if (t >= s.t0) si = k; });
  const seg = tr.segs[si];
  let raw = posePrm(seg.pose, t - seg.t0, t, tr.seed);
  if (si > 0 && t - seg.t0 < BLEND) {
    const prev = tr.segs[si - 1];
    raw = mixRaw(posePrm(prev.pose, t - prev.t0, t, tr.seed), raw, anticip((t - seg.t0) / BLEND));
  }
  // face: the latest explicit face, else the pose's own
  let face = seg.face ?? POSE_FACE[seg.pose];
  for (const f of tr.faces) if (t >= f.t0 && f.t0 >= seg.t0 - 1e-6) face = f.face;
  const swaps = [...tr.segs.slice(1).map((s) => s.t0), ...tr.faces.map((f) => f.t0)];
  const s = tr.s;
  const p = tr.at(t);
  const yaw0 = tr.yaw(t);
  const hov = (tr.hover ?? HOVER) * s;
  // hover bob + a slow drift: never still
  const bob = 0.045 * s * Math.sin(t * 3.4 + tr.seed) + 0.012 * s * Math.sin(t * 7.3 + tr.seed * 2);
  const fw: V3 = [Math.sin(yaw0), 0, Math.cos(yaw0)], rt: V3 = [Math.cos(yaw0), 0, -Math.sin(yaw0)];
  let armR = armDir(raw.R, 1), armL = armDir(raw.L, -1);
  // point: aim the right arm at a world point (body-local), blended in over the pose's first 0.3 s
  const tgt = seg.pose === "point" && tr.pointAt ? tr.pointAt(t) : null;
  if (tgt) {
    const sh: V3 = [p[0], p[1] + hov + raw.dy * s, p[2]];
    const d: V3 = [tgt[0] - sh[0], tgt[1] - sh[1], tgt[2] - sh[2]];
    const yaw = yaw0 + raw.yaw;
    const lx = d[0] * Math.cos(yaw) - d[2] * Math.sin(yaw), lz = d[0] * Math.sin(yaw) + d[2] * Math.cos(yaw);
    const L = Math.hypot(lx, d[1], lz) || 1;
    const want: V3 = [Math.max(0.15, lx / L), d[1] / L, Math.max(-0.2, lz / L)];
    const wl = Math.hypot(...want);
    const u = ease((t - seg.t0) / 0.3);
    armR = [lerp(armR[0], want[0] / wl, u), lerp(armR[1], want[1] / wl, u), lerp(armR[2], want[2] / wl, u)];
  }
  const thrust = 0.75 + 0.25 * Math.sin(t * 31 + tr.seed) * Math.sin(t * 17);
  return {
    id: tr.id, s, sq: raw.sq,
    x: p[0] + (rt[0] * raw.dx + fw[0] * raw.dz) * s, y: p[1] + hov + raw.dy * s + bob, z: p[2] + (rt[2] * raw.dx + fw[2] * raw.dz) * s,
    yaw: yaw0 + raw.yaw, pitch: raw.pitch + 0.03 * Math.sin(t * 2.3 + tr.seed), roll: raw.roll,
    armL, armR, face, blink: blinkAt(t, tr.seed, swaps), mouth: tr.talk?.(t) ?? "rest", glow: 0.5 + 0.5 * Math.sin(t * 4 + tr.seed), thrust, floorY: p[1],
  };
};

// ------------------------------------------------------------------ geometry helpers (shared with the QA)
const rotYv = (v: V3, a: number): V3 => [v[0] * Math.cos(a) + v[2] * Math.sin(a), v[1], -v[0] * Math.sin(a) + v[2] * Math.cos(a)];
/** body-local -> world (yaw only; pitch/roll are small) */
export const boltWorld = (st: BoltState, v: V3): V3 => { const r = rotYv([v[0] * st.s, v[1] * st.s, v[2] * st.s], st.yaw); return [st.x + r[0], st.y + r[1], st.z + r[2]]; };
export const mittOf = (st: BoltState, side: "L" | "R"): V3 => {
  const sx = side === "R" ? 1 : -1, d = side === "R" ? st.armR : st.armL;
  return boltWorld(st, [sx * SHOULDER[0] + d[0] * ARM, SHOULDER[1] + d[1] * ARM, SHOULDER[2] + d[2] * ARM]);
};
/** the screen face centre (world) and its radius: text must stay off it */
export const boltFace = (st: BoltState): { c: V3; r: number } => ({ c: boltWorld(st, [0, 0.03, BOLT_R * 0.92]), r: 0.2 * st.s });
/** QA boxes: the shell, both mitts */
export const boltBoxes = (st: BoltState) => [
  { name: `${st.id}.body`, c: [st.x, st.y, st.z] as V3, h: [BOLT_R * st.s, BOLT_R * st.s * st.sq, BOLT_R * st.s] as V3 },
  ...(["L", "R"] as const).map((k) => ({ name: `${st.id}.mitt${k}`, c: mittOf(st, k), h: [0.07 * st.s, 0.07 * st.s, 0.07 * st.s] as V3 })),
];

// ------------------------------------------------------------------ the screen face
const FACE_W = 512, FACE_H = 384;
/** face textures, held here by key: the key space is bounded (6 faces x blink x 6 visemes x 4 phases = 288), so a long
 *  video never re-draws (and re-uploads) faces after the shared canvas-texture cache (120 entries) is cleared */
const faceTexs = new Map<string, THREE.Texture>();
const faceTex = (face: BoltFace, blink: boolean, mouth: Viseme, ph: number) => {
  const key = `bolt|${face}|${blink ? 1 : 0}|${mouth}|${ph}`;
  let tx = faceTexs.get(key);
  if (!tx) { tx = drawFace(key, face, blink, mouth, ph); faceTexs.set(key, tx); }
  return tx;
};
const drawFace = (key: string, face: BoltFace, blink: boolean, mouth: Viseme, ph: number) =>
  canvasTexture(key, FACE_W, FACE_H, (g, W, H) => {
    // screen: navy with a soft blue vignette and faint scanlines
    const bg = g.createRadialGradient(W / 2, H * 0.45, 20, W / 2, H / 2, W * 0.62);
    bg.addColorStop(0, "#1b3360");
    bg.addColorStop(1, TP.screen);
    g.fillStyle = bg;
    g.fillRect(0, 0, W, H);
    g.fillStyle = "rgba(120,180,255,0.06)";
    for (let y = 0; y < H; y += 8) g.fillRect(0, y, W, 3);
    const ink = TP.mint;
    g.strokeStyle = ink;
    g.fillStyle = ink;
    g.lineCap = "round";
    g.lineJoin = "round";
    g.shadowColor = "rgba(61,220,151,0.9)";
    g.shadowBlur = 18;
    const ex = 118, ey = H * 0.42, cx = W / 2;
    const eye = (x: number, kind: "dot" | "big" | "arc" | "star" | "squint" | "line", r = 34) => {
      g.lineWidth = 20;
      if (blink && kind !== "arc" && kind !== "squint") kind = "line";
      if (kind === "dot") { g.beginPath(); g.ellipse(x, ey, r * 0.85, r * 1.15, 0, 0, Math.PI * 2); g.fill(); }
      if (kind === "big") { g.beginPath(); g.arc(x, ey - 4, r * 1.45, 0, Math.PI * 2); g.lineWidth = 16; g.stroke(); g.beginPath(); g.arc(x, ey - 4, r * 0.55, 0, Math.PI * 2); g.fill(); }
      if (kind === "arc") { g.beginPath(); g.arc(x, ey + 14, r * 1.1, Math.PI * 1.12, Math.PI * 1.88); g.stroke(); }
      if (kind === "squint") { g.beginPath(); g.moveTo(x - r, ey); g.lineTo(x + r, ey - 6); g.stroke(); }
      if (kind === "line") { g.beginPath(); g.moveTo(x - r, ey + 4); g.lineTo(x + r, ey + 4); g.stroke(); }
      if (kind === "star") {
        const R = r * 1.45, rr = r * 0.6, rot = ph * 0.4;
        g.beginPath();
        for (let k = 0; k < 10; k++) { const a = rot - Math.PI / 2 + (k * Math.PI) / 5; const q = k % 2 ? rr : R; g.lineTo(x + q * Math.cos(a), ey + q * Math.sin(a)); }
        g.closePath(); g.fill();
      }
    };
    const brow = (x: number, tilt: number, dy = 0) => { g.lineWidth = 14; g.beginPath(); g.moveTo(x - 38, ey - 72 + dy - tilt * 14); g.lineTo(x + 38, ey - 72 + dy + tilt * 14); g.stroke(); };
    const my = H * 0.76;
    const talkMouth = () => {
      g.lineWidth = 16;
      const open = mouth === "A" ? 46 : mouth === "O" ? 40 : mouth === "E" ? 26 : mouth === "U" ? 30 : 8;
      const wd = mouth === "O" || mouth === "U" ? 44 : mouth === "E" ? 96 : mouth === "M" ? 70 : 80;
      g.beginPath(); g.ellipse(cx, my - 6, wd / 2, Math.max(6, open / 2), 0, 0, Math.PI * 2); g.fill();
    };
    switch (face) {
      case "happy":
        eye(cx - ex, "arc"); eye(cx + ex, "arc");
        if (mouth !== "rest") talkMouth(); else { g.lineWidth = 18; g.beginPath(); g.arc(cx, my - 46, 62, Math.PI * 0.2, Math.PI * 0.8); g.stroke(); }
        break;
      case "excited":
        eye(cx - ex, "star"); eye(cx + ex, "star");
        if (mouth !== "rest") talkMouth(); else { g.beginPath(); g.moveTo(cx - 70, my - 30); g.quadraticCurveTo(cx, my + 50, cx + 70, my - 30); g.closePath(); g.fill(); }
        break;
      case "curious":
        eye(cx - ex, "dot", 30); eye(cx + ex, "dot", 38); brow(cx + ex, -0.6, -12);
        if (mouth !== "rest") talkMouth(); else { g.lineWidth = 16; g.beginPath(); g.arc(cx + 10, my - 4, 18, 0, Math.PI * 2); g.stroke(); }
        break;
      case "shocked":
        eye(cx - ex, "big"); eye(cx + ex, "big"); brow(cx - ex, 0, -18); brow(cx + ex, 0, -18);
        g.lineWidth = 16; g.beginPath(); g.ellipse(cx, my - 2, 34, 42, 0, 0, Math.PI * 2); g.stroke();
        break;
      case "thinking": {
        eye(cx - ex, "squint"); eye(cx + ex, "dot", 32); brow(cx + ex, 0.5, -6);
        g.lineWidth = 16; g.beginPath(); g.moveTo(cx - 54, my); g.lineTo(cx + 40, my - 12); g.stroke();
        // three dots that fill one by one (ph 0..3)
        for (let k = 0; k < 3; k++) { g.globalAlpha = k <= ph % 4 - 1 + 1 && k < (ph % 4) ? 1 : 0.25; g.beginPath(); g.arc(cx + 150 + k * 34, my - 70 - k * 20, 11 + k * 2, 0, Math.PI * 2); g.fill(); }
        g.globalAlpha = 1;
        break;
      }
      case "worried":
        eye(cx - ex, "dot", 30); eye(cx + ex, "dot", 30); brow(cx - ex, -0.8, 4); brow(cx + ex, 0.8, 4);
        if (mouth !== "rest") talkMouth(); else { g.lineWidth = 15; g.beginPath(); for (let k = 0; k <= 4; k++) g.lineTo(cx - 70 + k * 35, my + (k % 2 ? -14 : 8)); g.stroke(); }
        // a sweat drop
        g.fillStyle = "#7cc4ff"; g.shadowColor = "rgba(124,196,255,0.9)";
        g.beginPath(); g.moveTo(cx + 205, ey - 70); g.quadraticCurveTo(cx + 228, ey - 20, cx + 205, ey - 8); g.quadraticCurveTo(cx + 182, ey - 20, cx + 205, ey - 70); g.fill();
        break;
    }
  });

// ------------------------------------------------------------------ rendering
const screenMats = new Map<string, THREE.MeshBasicMaterial>();
const screenMat = (tex: THREE.Texture) => {
  let m = screenMats.get(tex.uuid);
  if (!m) { if (screenMats.size > 400) screenMats.clear(); m = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }); m.color.setRGB(1.25, 1.25, 1.25); screenMats.set(tex.uuid, m); }
  return m;
};
const glowMats = new Map<string, THREE.MeshBasicMaterial>();
const glowMat = (c: string, o: number) => {
  const k = `${c}|${o.toFixed(2)}`;
  let m = glowMats.get(k);
  if (!m) { if (glowMats.size > 200) glowMats.clear(); m = new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, depthWrite: false, toneMapped: false }); glowMats.set(k, m); }
  return m;
};
const blobTex = () => canvasTexture("boltBlob", 128, 128, (g, W) => {
  const gr = g.createRadialGradient(W / 2, W / 2, 0, W / 2, W / 2, W / 2);
  gr.addColorStop(0, "rgba(30,50,90,0.45)"); gr.addColorStop(0.6, "rgba(30,50,90,0.16)"); gr.addColorStop(1, "rgba(30,50,90,0)");
  g.fillStyle = gr; g.fillRect(0, 0, W, W);
});
const blobMats = new Map<string, THREE.MeshBasicMaterial>();
const blobMat = (o: number) => { const k = o.toFixed(2); let m = blobMats.get(k); if (!m) { m = new THREE.MeshBasicMaterial({ map: blobTex(), transparent: true, opacity: o, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }); blobMats.set(k, m); } return m; };

const quatDown = (d: V3) => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), new THREE.Vector3(...d).normalize());

const Arm: React.FC<{ side: 1 | -1; d: V3 }> = ({ side, d }) => {
  const q = quatDown(d);
  return (
    <group position={[side * SHOULDER[0], SHOULDER[1], SHOULDER[2]]} quaternion={q}>
      <mesh geometry={geoOf("boltShoulder", () => new THREE.SphereGeometry(0.06, 10, 8))} material={plastic(TP.blue, { rough: 0.4, flat: true })} />
      <mesh geometry={geoOf("boltArm", () => new THREE.CylinderGeometry(0.045, 0.05, ARM, 8))} material={plastic(TP.grey, { rough: 0.45, flat: true })} position={[0, -ARM / 2, 0]} />
      <mesh geometry={geoOf("boltMitt", () => new THREE.IcosahedronGeometry(0.075, 1))} material={plastic(TP.white, { rough: 0.4, flat: true })} position={[0, -ARM, 0]} />
    </group>
  );
};

export const Bolt: React.FC<{ st: BoltState; t: number; shadow?: boolean }> = ({ st, t, shadow = true }) => {
  const R = BOLT_R;
  const ph = Math.floor(t * 2.5) % 4;
  const tex = faceTex(st.face, st.blink, st.mouth, ph);
  const h = st.y - st.floorY;
  const shade = clamp(1 - (h - 0.6 * st.s) / (3 * st.s), 0, 1);
  return (
    <>
      {shadow && shade > 0.02 ? (
        <mesh geometry={geoOf("boltBlobPlane", () => new THREE.PlaneGeometry(1, 1))} material={blobMat(Math.round(shade * 20) / 20)} rotation={[-Math.PI / 2, 0, 0]} position={[st.x, st.floorY + 0.068, st.z]} scale={[0.85 * st.s * (1.2 - 0.2 * shade), 0.85 * st.s * (1.2 - 0.2 * shade), 1]} />
      ) : null}
      <group position={[st.x, st.y, st.z]} rotation={[st.pitch, st.yaw, st.roll, "YXZ"]} scale={[st.s, st.s * st.sq, st.s]}>
        {/* the shell: a faceted low-poly sphere, slightly squat */}
        <mesh geometry={geoOf("boltShell", () => new THREE.IcosahedronGeometry(R, 2))} material={plastic(TP.white, { rough: 0.38, flat: true })} scale={[1, 0.96, 1]} receiveShadow />
        {/* the blue bezel and the screen face */}
        <mesh geometry={geoOf("boltBezel", () => new THREE.SphereGeometry(R * 1.035, 28, 18, Math.PI / 2 - 0.86, 1.72, Math.PI / 2 - 0.68, 1.3))} material={plastic(TP.blue, { rough: 0.35 })} />
        <mesh geometry={geoOf("boltScreen", () => new THREE.SphereGeometry(R * 1.05, 28, 18, Math.PI / 2 - 0.76, 1.52, Math.PI / 2 - 0.58, 1.1))} material={screenMat(tex)} />
        {/* side "ears" (orange) */}
        {[-1, 1].map((k) => (
          <mesh key={k} geometry={geoOf("boltEar", () => new THREE.CylinderGeometry(0.07, 0.08, 0.06, 10))} material={plastic(TP.orange, { rough: 0.4, flat: true })} position={[k * R * 0.95, 0.13, -0.03]} rotation={[0, 0, Math.PI / 2]} />
        ))}
        {/* antenna with a pulsing orange tip */}
        <group position={[0.04, R * 0.92, -0.04]} rotation={[0.12 * Math.sin(t * 2.7), 0, -0.18 + 0.1 * Math.sin(t * 3.3 + 1)]}>
          <mesh geometry={geoOf("boltStalk", () => new THREE.CylinderGeometry(0.012, 0.016, 0.16, 6))} material={plastic(TP.greyDark, { rough: 0.5 })} position={[0, 0.08, 0]} />
          <mesh geometry={geoOf("boltTip", () => new THREE.IcosahedronGeometry(0.038, 1))} material={plastic(TP.orange, { rough: 0.35, flat: true, emissive: TP.orangeDeep, ei: 0.15 + 0.35 * st.glow })} position={[0, 0.17, 0]} />
        </group>
        {/* mint band and the hover thruster */}
        <mesh geometry={geoOf("boltBand", () => new THREE.TorusGeometry(R * 0.78, 0.022, 6, 24))} material={plastic(TP.mint, { rough: 0.3, emissive: TP.mint, ei: 0.25 })} position={[0, -R * 0.6, 0]} rotation={[Math.PI / 2, 0, 0]} />
        <mesh geometry={geoOf("boltNozzle", () => new THREE.CylinderGeometry(0.12, 0.09, 0.08, 10))} material={plastic(TP.greyDark, { rough: 0.5, flat: true })} position={[0, -R * 0.93, 0]} />
        <mesh geometry={geoOf("boltJetCore", () => new THREE.CylinderGeometry(0.085, 0.085, 0.01, 12))} material={glowMat("#bff7dd", 1)} position={[0, -R * 0.93 - 0.045, 0]} />
        <mesh geometry={geoOf("boltJet", () => new THREE.ConeGeometry(0.075, 0.16, 12, 1, true))} material={glowMat(TP.mint, Math.round((0.22 + 0.18 * st.thrust) * 20) / 20)} position={[0, -R * 0.93 - 0.05 - 0.08 * st.thrust, 0]} rotation={[Math.PI, 0, 0]} scale={[1, st.thrust, 1]} />
        <Arm side={1} d={st.armR} />
        <Arm side={-1} d={st.armL} />
      </group>
    </>
  );
};
