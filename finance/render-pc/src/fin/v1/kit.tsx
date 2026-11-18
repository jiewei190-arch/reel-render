// FORMAT v1 story kit (finance/FORMAT_V1.md): shared helpers for the rebuilt story Shorts. Built on the hook prototype
// helpers in ../hooks.tsx (v1, the owner's pick): slam zooms, shakes, dust, blocky props. Adds: plan/word timing lookups,
// the frame-0 hook text overlay, a tall coin jar, a debt block, burst cubes, a pay-bill box, and the audio cue format
// read by tools/story_mix.py (music bed from 0 s ducked under the voice, SFX on impacts and payoffs).
import React from "react";
import * as THREE from "three";
import { geoOf } from "../../blocky/mat";
import { clamp, hash, lerp } from "../../blocky/motion";
import type { V3 } from "../../blocky/motion";
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
    const l = lens[p.id];
    if (!l) throw new Error(`no lens for ${p.id}`);
    return { id: p.id, a: p.t, b: p.end, ...l };
  });

/** a still-ish lens that creeps in (v1: every shot moves, no cut-spam) */
export const creep = (subj: V3, pos: V3, o: Partial<Shot> = {}): Shot => shot({ subj: () => subj, pos, fov: 50, push: 0.07, roll: [0, 1.2], ...o });

// ------------------------------------------------------------------ frame-0 hook text (one line, <= 8 words)
export const HookText: React.FC<{ text: string; t: number; until: number; top?: number }> = ({ text, t, until, top = 300 }) => {
  if (t > until) return null;
  const out = clamp((until - t) / 0.2);
  const pop = t < 0.12 ? 1 : 1; // on screen and readable at frame 0 (no fade-in)
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top, display: "flex", justifyContent: "center", opacity: out }}>
      <div style={{ transform: `scale(${pop})`, fontFamily: "Poppins", fontWeight: 800, fontSize: 84, lineHeight: 1.05, color: "#ffd23a", textAlign: "center", WebkitTextStroke: "8px #140c1c", paintOrder: "stroke fill", textShadow: "0 6px 18px rgba(8,4,16,0.7)", background: "rgba(20,12,28,0.55)", padding: "10px 26px", borderRadius: 18 }}>
        {text}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ props
/** a tall glass jar of coins with a label; fill 0..1.2 (over 1 = heaped and spilling), glow for a gulp */
export const TallJar: React.FC<{ p: V3; fill: number; label: string; r?: number; h?: number; glow?: number; color?: string }> = ({ p, fill, label, r = 0.42, h = 1.5, glow = 0, color = "#c01818" }) => {
  const glass = React.useMemo(() => new THREE.MeshStandardMaterial({ color: "#bfe4ff", roughness: 0.06, metalness: 0.1, transparent: true, opacity: 0.18, depthWrite: false }), []);
  const f = Math.max(0.02, Math.min(1, fill));
  return (
    <group position={p}>
      <mesh geometry={geoOf(`tj${r}|${h}`, () => new THREE.CylinderGeometry(r, r, h, 40, 1, true))} material={glass} position={[0, h / 2, 0]} renderOrder={3} />
      <mesh position={[0, (h * f) / 2, 0]} castShadow>
        <cylinderGeometry args={[r * 0.95, r * 0.95, h * f, 32]} />
        <meshStandardMaterial color="#f0c040" roughness={0.35} emissive={glow > 0 ? color : "#c88a10"} emissiveIntensity={0.25 + glow} />
      </mesh>
      {fill > 1 ? (
        <mesh position={[0, h + 0.12 * (fill - 1) * 4, 0]} castShadow>
          <coneGeometry args={[r * 1.1, 0.5 * (fill - 1) * 4 + 0.1, 24]} />
          <meshStandardMaterial color="#f0c040" roughness={0.35} emissive="#c88a10" emissiveIntensity={0.3} />
        </mesh>
      ) : null}
      <B s={[r * 2.2, 0.08, r * 2.2]} p={[0, 0.04, 0]} c="#3a3f58" />
      <Label p={[0, h * 0.62, r + 0.02]} text={[label]} w={r * 2.1} h={0.3} bg={color} fg="#ffffff" glow={0.4 + glow} />
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
/** cubes flying out from p (a block bursting), u = 0..1 */
export const Burst: React.FC<{ p: V3; u: number; n?: number; r?: number; c?: string; size?: number }> = ({ p, u, n = 18, r = 1.6, c = PAL.debt, size = 0.32 }) => {
  if (u <= 0 || u >= 1.6) return null;
  return (
    <group position={p}>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 + hash(i) * 0.7;
        const v = r * (0.6 + 0.7 * hash(i + 3));
        const up = 2.6 + 2 * hash(i + 9);
        const tt = Math.min(u, 1.0);
        const y = Math.max(0.12, 0.6 + up * tt - 4.9 * tt * tt);
        const s = size * (0.5 + 0.8 * hash(i + 7));
        return <B key={i} s={[s, s, s]} p={[Math.cos(a) * v * easeOut(tt), y, Math.sin(a) * v * 0.6 * easeOut(tt)]} c={i % 3 ? c : "#fff4c8"} r={[tt * 8 * hash(i), tt * 6, tt * 7 * hash(i + 1)]} />;
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
