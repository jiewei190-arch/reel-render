// POSE presets. Each is a pure function of time: (base standing pose, ctx) -> pose + emotion. Rigid Blocky limbs (no
// knees, no elbows): every pose that spreads the legs sets the hip height from legDrop, so the lowest sole corner sits
// on the floor (no sinking, no floating); tools/recipe_build.mjs checks it on every sub-frame.
import { legDrop, lerp, ss } from "../../blocky/motion";
import type { Pose } from "../../blocky/motion";
import { SINK, sit } from "../../library/characters";
import type { Emotion, PoseId } from "./types";

export type PoseCtx = {
  /** time (s) */
  t: number;
  /** when the pose starts (reaction time) */
  t0: number;
  /** 0..1 over the walk (walk/run only) */
  u: number;
  s: number;
  seed: number;
};
export type PoseOut = { pose: Pose; emotion: Emotion; grounded: boolean };
/** hip height that puts the lower leg's lowest corner on the floor for leg swings a, b (rad, relative to the torso) and
 *  torso pitch: the legs hang from the pitched root (Blocky.tsx), so their world swing is leg - pitch */
export const hipFor = (a: number, b: number, s = 1, pitch = 0) => (Math.max(legDrop(Math.abs(a - pitch)), legDrop(Math.abs(b - pitch))) - SINK) * s;
/** the lowest sole corner (world y) of a pose: 0 (minus the 3 mm SINK) when standing on the floor */
export const soleLow = (p: Pose, s = 1) => p.y - Math.max(legDrop(Math.abs(p.legL - p.pitch)), legDrop(Math.abs(p.legR - p.pitch))) * s;

type P = (b: Pose, c: PoseCtx) => PoseOut;
const k01 = (c: PoseCtx, d = 0.18) => ss(c.t0 - 0.06, c.t0 + d, c.t); // the change starts ~2 f before t0
export const POSES: Record<PoseId, P> = {
  idle: (b) => ({ pose: { ...b, armL: 0.3, armR: 0.3 }, emotion: "happy", grounded: true }),
  /** hands on hips, chin up */
  smug: (b, c) => { const k = k01(c); return { pose: { ...b, armL: lerp(0.3, -0.25, k), armR: lerp(0.3, -0.25, k), outL: lerp(0.05, 0.75, k), outR: lerp(0.05, 0.75, k), headPitch: -0.14 * k, headYaw: 0.12 * k }, emotion: "sly", grounded: true }; },
  /** arms flung up, antennae straight, leaning back */
  shock: (b, c) => { const k = k01(c, 0.12); return { pose: { ...b, armL: lerp(0.4, 2.2, k), armR: lerp(0.5, 2.2, k), outL: 0.9 * k, outR: 0.9 * k, pitch: -0.12 * k, headPitch: -0.15 * k + 0.03 * Math.sin(c.t * 31) * k, ant: k }, emotion: k > 0.2 ? "shock" : "curious", grounded: true }; },
  /** slumped: arms hanging, head down, antennae drooped */
  despair: (b, c) => { const k = k01(c, 0.3); return { pose: { ...b, armL: 0.05, armR: 0.05, headPitch: 0.25 + 0.2 * k, ant: -1, pitch: 0.15 * k, bob: -0.08 * k }, emotion: "sad", grounded: true }; },
  /** pushing something in front: arms forward, leaning in, feet apart (hip from legDrop) */
  push: (b, c) => {
    const st = 0.5 + 0.5 * Math.sin(c.t * 14);
    const lL = 0.3, lR = -0.25, pitch = 0.3 + 0.05 * st;
    return { pose: { ...b, y: hipFor(lL, lR, c.s, pitch), armL: 1.55, armR: 1.55, outL: 0.05, outR: 0.05, pitch, legL: lL, legR: lR, bob: -0.03 * st }, emotion: "shock", grounded: true };
  },
  /** one arm reaching forward */
  reach: (b, c) => { const k = k01(c, 0.25); return { pose: { ...b, armR: lerp(0.3, 1.5, k), outR: 0.1, armL: 0.3, pitch: 0.15 * k }, emotion: "curious", grounded: true }; },
  /** a card swipe: the right arm sweeps across at t0 */
  "swipe-card": (b, c) => { const k = ss(c.t0, c.t0 + 0.25, c.t); return { pose: { ...b, armR: lerp(1.1, 1.3, k), outR: lerp(0.2, 0.9, k), armL: 0.3 }, emotion: "sly", grounded: true }; },
  /** down on one knee: legs split front/back (rigid legs), hip lowered by legDrop so the soles stay on the floor */
  kneel: (b, c) => {
    const k = k01(c, 0.3);
    const a = 1.2 * k;
    return { pose: { ...b, y: hipFor(a + 0.08 * k, -a + 0.08 * k, c.s, 0.08 * k), legL: a + 0.08 * k, legR: -a + 0.08 * k, armL: lerp(0.3, 0.7, k), armR: lerp(0.3, 0.7, k), pitch: 0.08 * k, headPitch: 0.2 * k, ant: -k }, emotion: "sad", grounded: true };
  },
  /** sits down hard on the floor, leaning back, arms out */
  collapse: (b, c) => {
    const k = k01(c, 0.2);
    if (k < 0.5) return POSES.shock(b, c);
    const sp = sit(b.x, b.z, b.yaw, { pitch: -0.3, armL: 1.0, armR: 1.0, outL: 0.6, outR: 0.6, headPitch: 0.1, ant: -1 });
    return { pose: { ...sp, y: sp.y * c.s }, emotion: "shock", grounded: false };
  },
  /** pointing forward with the right arm */
  point: (b, c) => { const k = k01(c, 0.15); return { pose: { ...b, armR: lerp(0.3, 1.57, k), outR: 0.05, armL: 0.2, headPitch: -0.05 }, emotion: "curious", grounded: true }; },
  /** both arms up and pumping, a small hop in the torso */
  celebrate: (b, c) => { const ch = 0.5 + 0.5 * Math.sin(c.t * 9); return { pose: { ...b, armL: 2.6 + 0.2 * ch, armR: 2.6 - 0.2 * ch, outL: 0.4, outR: 0.4, bob: -0.04 * Math.abs(Math.sin(c.t * 9)), ant: 1 }, emotion: "joy", grounded: true }; },
  /** a walk cycle (position comes from the compiler: at -> to over the shot) */
  walk: (b, c) => {
    const ph = 2 * Math.PI * 1.1 * c.t;
    const psi = 0.42 * Math.sin(ph);
    return { pose: { ...b, y: hipFor(psi, -psi, c.s), legL: psi, legR: -psi, armL: -0.55 * psi + 0.1, armR: 0.55 * psi + 0.1, bob: -0.015 * (0.5 + 0.5 * Math.cos(2 * ph)), sway: 0.03 * Math.cos(ph) }, emotion: "happy", grounded: true };
  },
  run: (b, c) => {
    const ph = 2 * Math.PI * 1.9 * c.t;
    const psi = 0.7 * Math.sin(ph);
    return { pose: { ...b, y: hipFor(psi + 0.2, -psi + 0.2, c.s, 0.2), legL: psi + 0.2, legR: -psi + 0.2, armL: -0.9 * psi + 0.3, armR: 0.9 * psi + 0.3, pitch: 0.2, bob: -0.03 * (0.5 + 0.5 * Math.cos(2 * ph)) }, emotion: "shock", grounded: true };
  },
};
export const POSE_IDS = Object.keys(POSES) as PoseId[];
