// FORMAT v1 story kit (finance/FORMAT_V1.md): shared helpers for the rebuilt story Shorts. Built on the hook prototype
// helpers in ../hooks.tsx (v1, the owner's pick): slam zooms, shakes, dust, blocky props. Adds: plan/word timing lookups,
// the frame-0 hook text overlay, a tall coin jar, a debt block, burst cubes, a pay-bill box, and the audio cue format
// read by tools/story_mix.py (music bed from 0 s ducked under the voice, SFX on impacts and payoffs).
import React from "react";
import * as THREE from "three";
import { geoOf } from "../../blocky/mat";
import { clamp, HAND, hash, lerp, SHOULDER_Y, shoulderXOf } from "../../blocky/motion";
import type { Pose, V3 } from "../../blocky/motion";
import type { FinShot } from "../core";
import { B, easeOut, shot } from "../hooks";
import type { Shot } from "../hooks";
import { Label, PAL } from "../props";

export type PlanShot = { id: string; t: number; end: number };
export type Word = { w: string; turn: number; t: number; end: number };
const clean = (w: string) => w.toLowerCase().replace(/[^a-z0-9'-]/g, "");

/** word and shot time lookups for one Short */
export const timing = (plan: readonly PlanShot[], words: readonly Word[]) => {
  const T = (id: string) => {
    const s = plan.find((p) => p.id === id);
    if (!s) throw new Error(`no shot ${id}`);
    return s.t;
  };
  const E = (id: string) => plan.find((p) => p.id === id)!.end;
  const W = (turn: number, w: string, nth = 1) => {
    let k = 0;
    for (const q of words) if (q.turn === turn && clean(q.w) === w && ++k === nth) return q.t;
    throw new Error(`no word ${turn}:${w}#${nth}`);
  };
  const lineEnd = (turn: number) => Math.max(...words.filter((q) => q.turn === turn).map((q) => q.end));
  return { T, E, W, lineEnd };
};

/** plan shot times + per-id lenses -> FinShots */
export const shotsOf = (plan: readonly PlanShot[], lens: Record<string, Shot>): FinShot[] =>
  plan.map((p) => {
    // a WIP Short must never break the shared bundle: a shot with no lens falls back to a plain wide lens and warns
    const l = lens[p.id] ?? (console.warn(`[v1] no lens for ${p.id}: using a default wide lens`), creep([0, 1.1, 0], [0, 1.6, 5], { fov: 56 }));
    return { id: p.id, a: p.t, b: p.end, ...l };
  });

/** a still-ish lens that creeps in (v1: every shot moves, no cut-spam) */
export const creep = (subj: V3, pos: V3, o: Partial<Shot> = {}): Shot => shot({ subj: () => subj, pos, fov: 50, push: 0.07, roll: [0, 1.2], ...o });

// ------------------------------------------------------------------ frame-0 hook text (one line, <= 8 words)
export const HookText: React.FC<{ text: string; t: number; until: number; top?: number; size?: number }> = ({ text, t, until, top = 300, size = 84 }) => {
  if (t > until) return null;
  const out = clamp((until - t) / 0.2);
  const pop = t < 0.12 ? 1 : 1; // on screen and readable at frame 0 (no fade-in)
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top, display: "flex", justifyContent: "center", opacity: out }}>
      <div style={{ transform: `scale(${pop})`, fontFamily: "Poppins", fontWeight: 800, fontSize: size, lineHeight: 1.05, color: "#ffd23a", textAlign: "center", whiteSpace: "pre-line", WebkitTextStroke: "8px #140c1c", paintOrder: "stroke fill", textShadow: "0 6px 18px rgba(8,4,16,0.7)", background: "rgba(20,12,28,0.55)", padding: "10px 26px", borderRadius: 18 }}>
        {text}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ props
/** a tall glass jar of coins with a label; fill 0..1.2 (over 1 = heaped and spilling), glow for a gulp */
export const TallJar: React.FC<{ p: V3; fill: number; label: string; r?: number; h?: number; glow?: number; color?: string }> = ({ p, fill, label, r = 0.42, h = 1.5, glow = 0, color = "#c01818" }) => {
  const glass = React.useMemo(() => new THREE.MeshStandardMaterial({ color: "#bfe4ff", roughness: 0.06, metalness: 0.1, transparent: true, opacity: 0.32, depthWrite: false }), []);
  const f = Math.max(0.02, Math.min(1, fill));
  return (
    <group position={p}>
      <mesh geometry={geoOf(`tj${r}|${h}`, () => new THREE.CylinderGeometry(r, r, h, 40, 1, true))} material={glass} position={[0, h / 2, 0]} renderOrder={3} />
      <mesh position={[0, (h * f) / 2, 0]} castShadow>
        <cylinderGeometry args={[r * 0.95, r * 0.95, h * f, 32]} />
        <meshStandardMaterial color="#f0c040" roughness={0.35} metalness={0.3} emissive={glow > 0 ? "#ff9a2a" : "#c88a10"} emissiveIntensity={0.2 + 0.4 * glow} />
      </mesh>
      {fill > 1 ? (
        <mesh position={[0, h + 0.12 * (fill - 1) * 4, 0]} castShadow>
          <coneGeometry args={[r * 1.1, 0.5 * (fill - 1) * 4 + 0.1, 24]} />
          <meshStandardMaterial color="#f0c040" roughness={0.35} emissive="#c88a10" emissiveIntensity={0.3} />
        </mesh>
      ) : null}
      <B s={[r * 2.2, 0.08, r * 2.2]} p={[0, 0.04, 0]} c="#3a3f58" />
      {/* a few coins heaped on top so the fill reads as money, and the label outside the glass */}
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} position={[Math.cos(i * 2.4) * r * 0.5 * (i % 2 ? 1 : 0.4), h * f + 0.015 + 0.012 * (i % 3), Math.sin(i * 2.4) * r * 0.5 * (i % 2 ? 1 : 0.4)]} rotation={[0.25 * Math.sin(i), 0, 0.25 * Math.cos(i)]}>
          <cylinderGeometry args={[0.07, 0.07, 0.02, 18]} />
          <meshStandardMaterial color="#f0c040" roughness={0.3} metalness={0.4} emissive="#c88a10" emissiveIntensity={0.3} />
        </mesh>
      ))}
      <Label p={[0, h * 0.78, r + 0.09]} text={[label]} w={r * 2.2} h={0.32} bg={color} fg="#ffffff" glow={0.15} />
    </group>
  );
};
/** a big debt block with a big amount on the front; chip 0..1 knocks a small piece off the top corner */
export const DebtBlock: React.FC<{ p: V3; size?: V3; text: string[]; color?: string; squash?: number; chip?: number; glow?: number }> = ({ p, size = [1.8, 1.8, 1.0], text, color = PAL.debt, squash = 0, chip = 0, glow = 0 }) => {
  const [w, h, d] = size;
  return (
    <group position={p} scale={[1 + 0.08 * squash, 1 - 0.1 * squash, 1 + 0.08 * squash]}>
      <B s={[w, h, d]} p={[0, h / 2, 0]} c={color} e={glow ? [color, glow] : undefined} />
      <Label p={[0, h * 0.55, d / 2 + 0.01]} text={text} w={w * 0.86} h={h * 0.5} bg="#fff4c8" fg={color} />
      {chip > 0 && chip < 1 ? <B s={[0.16, 0.16, 0.16]} p={[w / 2 - 0.1 + 0.5 * chip, h - 0.05 + 0.6 * chip - 2.2 * chip * chip, d / 2]} c={color} r={[chip * 6, chip * 4, 0]} /> : null}
    </group>
  );
};
/** cube k of a burst at p: position at u (0..1.6); arc = [a0, a1] limits the directions (radians in the x-z plane, 0 = +x, pi/2 = +z) */
export const burstPos = (p: V3, u: number, i: number, n: number, r: number, arc: [number, number] = [0, Math.PI * 2]): V3 => {
  const a = arc[0] + ((i + 0.5) / n) * (arc[1] - arc[0]) + (hash(i) - 0.5) * 0.3;
  const v = r * (0.6 + 0.7 * hash(i + 3));
  const up = 2.6 + 2 * hash(i + 9);
  const tt = Math.min(u, 1.0);
  // each cube starts somewhere inside the block's volume (1.4 m wide, 1.4 m tall), not all from one point
  const x0 = (hash(i + 21) - 0.5) * 1.2, y0 = 0.2 + 1.0 * hash(i + 23), z0 = (hash(i + 25) - 0.5) * 0.7;
  const y = Math.max(0.12, y0 + up * tt - 4.9 * tt * tt);
  return [p[0] + x0 + Math.cos(a) * v * easeOut(tt), y, p[2] + z0 + Math.sin(a) * v * 0.6 * easeOut(tt)];
};
/** half size of burst cube i incl. its rotated corner (0.87 = half the cube diagonal), so a spinning cube never dips below the floor */
export const burstHalf = (i: number, size = 0.32) => 0.87 * size * (0.5 + 0.8 * hash(i + 7));
/** cubes flying out from p (a block bursting), u = 0..1; they land and rest on the floor (y >= rotated half size) */
export const Burst: React.FC<{ p: V3; u: number; n?: number; r?: number; c?: string; size?: number; arc?: [number, number] }> = ({ p, u, n = 18, r = 1.6, c = PAL.debt, size = 0.32, arc }) => {
  if (u <= 0 || u >= 1.6) return null;
  return (
    <group>
      {Array.from({ length: n }, (_, i) => {
        const q = burstPos(p, u, i, n, r, arc);
        const s = size * (0.5 + 0.8 * hash(i + 7));
        const tt = Math.min(u, 1.0);
        return <B key={i} s={[s, s, s]} p={[q[0], Math.max(burstHalf(i, size), q[1]), q[2]]} c={i % 3 ? c : "#fff4c8"} r={[tt * 8 * hash(i), tt * 6, tt * 7 * hash(i + 1)]} />;
      })}
    </group>
  );
};
/** a pay-bill box on a post with a coin slot; faces +z */
export const PayBox: React.FC<{ p: V3; yaw?: number; lit?: number; text?: string }> = ({ p, yaw = 0, lit = 0, text = "PAY BILL" }) => (
  <group position={p} rotation={[0, yaw, 0]}>
    <B s={[0.12, 1.0, 0.12]} p={[0, 0.5, 0]} c="#3a3f58" />
    <B s={[0.6, 0.45, 0.42]} p={[0, 1.22, 0]} c="#2a6de1" />
    <B s={[0.26, 0.03, 0.05]} p={[0, 1.4, 0.2]} c="#0a0814" />
    <Label p={[0, 1.18, 0.215]} text={[text]} w={0.52} h={0.16} bg="#fff4c8" fg="#16264a" glow={lit} />
  </group>
);
/** a flying coin / small coin stack */
export const Coin3: React.FC<{ p: V3; r?: V3; s?: number }> = ({ p, r = [0, 0, 0], s = 1 }) => (
  <mesh position={p} rotation={r} scale={s} castShadow>
    <cylinderGeometry args={[0.07, 0.07, 0.02, 20]} />
    <meshStandardMaterial color="#f0c040" roughness={0.3} metalness={0.4} emissive="#c88a10" emissiveIntensity={0.25} />
  </mesh>
);
export const lerpV = (a: V3, b: V3, u: number): V3 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)];

// ------------------------------------------------------------------ audio cues (tools/story_mix.py via tools/story_cues.mjs)
export type Cue = { t: number; sfx: string; db?: number };
export type StoryAudio = { music: string; musicDb?: number; cues: Cue[] };

// ------------------------------------------------------------------ from hooks2.tsx (MAIN: take only these): captions, Squash, Debris
/** 1-3 word captions, upper-middle band, the word being spoken in red; clear of the bottom 420 px and the right rail */
export const WordCaption: React.FC<{ words: readonly Word[]; t: number; hot?: string; centre?: number }> = ({ words, t, hot = "#ff3b30", centre = 0.31 }) => {
  const chunks: Word[][] = [];
  let cur: Word[] = [];
  words.forEach((q, i) => {
    cur.push(q);
    const nx = words[i + 1];
    if (cur.length >= 3 || /[.,!?…:]$/.test(q.w) || (nx && nx.t - q.end > 0.25) || !nx) { chunks.push(cur); cur = []; }
  });
  const ci = chunks.findIndex((c, i) => t >= c[0].t - 0.05 && t < (chunks[i + 1] ? chunks[i + 1][0].t - 0.05 : c[c.length - 1].end + 0.5));
  if (ci < 0) return null;
  const c = chunks[ci];
  const u = clamp((t - c[0].t + 0.05) / 0.15);
  const x = u - 1, s = u >= 1 ? 1 : 0.5 + 0.5 * (1 + 3.4 * x * x * x + 2.4 * x * x);
  return (
    <div style={{ position: "absolute", left: 70, right: 170, top: 1920 * centre - 120, height: 240, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ transform: `scale(${s})`, textAlign: "center", fontFamily: "Poppins", fontWeight: 800, fontSize: 84, lineHeight: 1.05, WebkitTextStroke: "7px #140c1c", paintOrder: "stroke fill", textShadow: "0 6px 16px rgba(8,4,16,0.6)" }}>
        {c.map((q, i) => (
          <span key={i} style={{ color: t >= q.t - 0.03 && t < q.end + 0.05 ? hot : "#ffffff" }}>{(i ? " " : "") + q.w.replace(/[.,!?…:]+$/, "").toUpperCase()}</span>
        ))}
      </div>
    </div>
  );
};
/** an actor squashed about its feet (k > 0 squash, k < 0 stretch); the soles stay on the floor (scale about y = 0) */
export const Squash: React.FC<{ p: V3; k: number; children: React.ReactNode }> = ({ p, k, children }) => (
  <group position={[p[0], 0, p[2]]} scale={[1 + 0.5 * k, 1 - k, 1 + 0.5 * k]}>
    <group position={[-p[0], 0, -p[2]]}>{children}</group>
  </group>
);
/** squash/stretch after hits: squash first, then a stretch, settling in ~0.35 s */
export const sqAt = (t: number, hits: number[]) => hits.reduce((k, h) => (t >= h ? k + 0.22 * Math.exp(-(t - h) * 9) * Math.cos((t - h) * 26) : k), 0);
/** small blocks thrown out from p at t0 that bounce twice on the floor/counter at y0 (never below it) */
export const Debris: React.FC<{ p: V3; t: number; t0: number; n?: number; c?: string[]; y0?: number; size?: number }> = ({ p, t, t0, n = 12, c = ["#d6d0e8", "#ffd23a", "#3a3f58"], y0 = 0, size = 0.07 }) => {
  const tau = t - t0;
  if (tau < 0 || tau > 1.6) return null;
  return (
    <group>
      {Array.from({ length: n }, (_, i) => {
        const a = hash(i + 1) * Math.PI * 2;
        const v = 1.2 + 1.4 * hash(i + 2);
        const vy = 2.0 + 1.6 * hash(i + 3);
        const g = 9.8;
        const T1 = (vy + Math.sqrt(vy * vy + 2 * g * Math.max(0, p[1] - y0))) / g;
        let y: number;
        let tt = tau;
        if (tt < T1) y = p[1] + vy * tt - 0.5 * g * tt * tt;
        else {
          tt -= T1;
          const v2 = vy * 0.45, T2 = (2 * v2) / g;
          if (tt < T2) y = y0 + v2 * tt - 0.5 * g * tt * tt;
          else { tt -= T2; const v3 = v2 * 0.4, T3 = (2 * v3) / g; y = tt < T3 ? y0 + v3 * tt - 0.5 * g * tt * tt : y0; }
        }
        const d = v * Math.min(tau, T1 + 0.5) * (tau > T1 ? 0.8 : 1);
        const s = size * (0.6 + 0.8 * hash(i + 4));
        return <B key={i} s={[s, s, s]} p={[p[0] + Math.cos(a) * d, Math.max(y0, y) + s / 2, p[2] + Math.sin(a) * d * 0.7]} r={[tau * 9 * hash(i), tau * 7, 0]} c={c[i % c.length]} rough={0.6} />;
      })}
    </group>
  );
};

// ------------------------------------------------------------------ QA: prop vs character boxes (tools/story_qa.mjs)
/** an axis-aligned box: centre + half sizes */
export type Box = { name: string; c: V3; h: V3; yaw?: number }; // yaw: an oriented prop box (rad about y); actor boxes are axis-aligned
/** head and torso boxes of a standing blocky actor of scale s at p, from blocky/motion SPEC (U = 0.27 m: head 0.28 x 0.30 x
 *  0.27 m centred at FACE = 1.247 s; torso 0.54 x 0.54 x 0.27 m below it), each padded by 2 cm and rotated-safe (x = z half) */
export const actorBoxes = (name: string, p: V3, s = 1, pose?: Pose): Box[] => [
  { name: `${name}.head`, c: [p[0], 1.247 * s, p[2]], h: [0.16 * s, 0.17 * s, 0.16 * s] },
  { name: `${name}.torso`, c: [p[0], 0.81 * s, p[2]], h: [0.29 * s, 0.29 * s, 0.29 * s] },
  ...(pose ? limbBoxes(name, pose, s) : []),
];
/** world position of a point on an arm: k = 0 at the shoulder pivot, 1 at the hand end. Follows Blocky.tsx: shoulder at
 *  (±shoulderX(out), SHOULDER_Y) in the torso frame, rotate z by ±out, then x by -raise; the torso pitches about the hip
 *  (x), the body yaws (y); scaled by s about the hip pivot (pose.x, pose.y, pose.z). */
export const armPoint = (pose: Pose, side: "L" | "R", k: number, s = 1): V3 => {
  const sx = side === "L" ? 1 : -1;
  const r = side === "L" ? pose.armL : pose.armR;
  const o = sx * (side === "L" ? pose.outL : pose.outR);
  const H = HAND * k;
  // hand offset from the shoulder, after Rx(-raise) then Rz(o)
  let x = H * Math.cos(r) * Math.sin(o), y = -H * Math.cos(r) * Math.cos(o), z = H * Math.sin(r);
  x += sx * shoulderXOf(side === "L" ? pose.outL : pose.outR);
  y += SHOULDER_Y + (pose.bob ?? 0) / Math.max(s, 1e-6);
  // torso pitch about the hip pivot
  const cp = Math.cos(pose.pitch), sp = Math.sin(pose.pitch);
  [y, z] = [y * cp - z * sp, y * sp + z * cp];
  // body yaw
  const ca = Math.cos(pose.yaw), sa = Math.sin(pose.yaw);
  const wx = x * ca + z * sa, wz = -x * sa + z * ca;
  return [pose.x + s * wx, pose.y + s * y, pose.z + s * wz];
};
/** hand and forearm boxes for both arms (MAIN: a push or reach must not enter a prop) */
export const limbBoxes = (name: string, pose: Pose, s = 1): Box[] =>
  (["L", "R"] as const).flatMap((side) => [
    { name: `${name}.hand${side}`, c: armPoint(pose, side, 0.92, s), h: [0.09 * s, 0.09 * s, 0.09 * s] as V3 },
    { name: `${name}.forearm${side}`, c: armPoint(pose, side, 0.6, s), h: [0.08 * s, 0.08 * s, 0.08 * s] as V3 },
  ]);
export const overlaps = (a: Box, b: Box) => [0, 1, 2].every((k) => Math.abs(a.c[k] - b.c[k]) < a.h[k] + b.h[k]);
