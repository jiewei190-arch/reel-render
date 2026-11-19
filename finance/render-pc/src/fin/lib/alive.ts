// "Always alive" + acting helpers for the recipe system's quality pass (all pure functions of t):
// varied blinks (every 2-5 s), slow weight shifts, head/eye look-at, pose blends with anticipation + overshoot, and a
// gesture library (point, count, palms-up, facepalm, clutch-head, shrug) triggered by recipe tags.
import { hash } from "../../blocky/motion";
import type { Pose, V3 } from "../../blocky/motion";

const FPS = 30;
/** blink 4 frames, every 2-5 s (seeded, so every actor blinks on its own rhythm); extra blinks at given times
 *  (an expression change hides behind a blink) */
export const blinkVar = (t: number, seed: number, extra: number[] = []) => {
  for (const e of extra) if (t >= e && t < e + 4 / FPS) return true;
  let at = 0.6 + 1.5 * hash(seed * 7.1);
  for (let k = 0; k < 400 && at <= t + 0.2; k++) {
    if (t >= at && t < at + 4 / FPS) return true;
    at += 2 + 3 * hash(seed * 13.7 + k * 3.3);
  }
  return false;
};
/** weight shift: the hips drift side to side every ~4 s with a small counter-sway of the upper body */
export const weightShift = (t: number, seed: number): { dx: number; sway: number; twist: number } => {
  const ph = (t * 2 * Math.PI) / (3.6 + 1.4 * hash(seed + 5)) + seed;
  const k = Math.sin(ph);
  return { dx: 0.018 * k, sway: -0.025 * k, twist: 0.03 * Math.sin(ph * 0.5 + 1) };
};
/** turn the head toward a world point (yaw relative to the body, clamped to +-0.7 rad), tilt toward its height */
export const lookAt = (pose: Pose, head: V3, target: V3, k = 0.8): { headYaw: number; headPitch: number } => {
  const yawW = Math.atan2(target[0] - head[0], target[2] - head[2]);
  let d = yawW - pose.yaw;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  const dist = Math.hypot(target[0] - head[0], target[2] - head[2]);
  const pitch = -Math.atan2(target[1] - head[1], Math.max(0.3, dist));
  return { headYaw: Math.max(-0.7, Math.min(0.7, d)) * k, headPitch: Math.max(-0.35, Math.min(0.35, pitch)) * k * 0.6 };
};
/** anticipation + overshoot: a small dip back (first 18 %), a fast move that overshoots ~8 %, settle by u = 1 */
export const anticip = (u: number) => {
  if (u <= 0) return 0;
  if (u >= 1) return 1;
  if (u < 0.18) return -0.12 * Math.sin((Math.PI * u) / 0.18);
  const v = (u - 0.18) / 0.82;
  return 1 - Math.cos(v * Math.PI * 1.5) * Math.exp(-v * 4.2) * (1 - v * 0.1);
};
const NUM: (keyof Pose)[] = ["x", "y", "z", "yaw", "pitch", "legL", "legR", "armL", "armR", "outL", "outR", "headPitch", "headYaw", "sway", "twist", "bob", "ant"];
/** a pose between a and b (w may overshoot past 1 or dip below 0) */
export const mixPose = (a: Pose, b: Pose, w: number): Pose => {
  const o = { ...b } as Record<string, unknown>;
  for (const k of NUM) {
    const x = (a[k] as number | undefined) ?? 0, y = (b[k] as number | undefined) ?? 0;
    o[k] = x + (y - x) * w;
  }
  return o as Pose;
};

export type GestureId = "point" | "count" | "palmsUp" | "facepalm" | "clutchHead" | "shrug";
/** gesture targets (arm/head channels) + duration; blended in over 0.12 s, held, out over 0.2 s */
export const GESTURES: Record<GestureId, { hold: number; f: (p: Pose, u: number, t: number) => Partial<Pose> }> = {
  point: { hold: 0.55, f: () => ({ armR: 1.57, outR: 0.05, headPitch: -0.05 }) },
  count: { hold: 0.7, f: (_p, _u, t) => ({ armR: 1.25 + 0.12 * Math.max(0, Math.sin(t * 13)), outR: 0.35, armL: 0.5, outL: 0.2 }) },
  palmsUp: { hold: 0.6, f: () => ({ armL: 0.95, armR: 0.95, outL: 0.55, outR: 0.55, headPitch: -0.06, sway: 0.04 }) },
  facepalm: { hold: 0.7, f: () => ({ armR: 2.05, outR: -0.32, headPitch: 0.22, armL: 0.25 }) },
  clutchHead: { hold: 0.7, f: () => ({ armL: 2.75, armR: 2.75, outL: 0.28, outR: 0.28, headPitch: 0.12, ant: 1 }) },
  shrug: { hold: 0.55, f: () => ({ armL: 0.45, armR: 0.45, outL: 0.75, outR: 0.75, headYaw: 0.15, bob: 0.02 }) },
};
export const GESTURE_IDS = Object.keys(GESTURES) as GestureId[];
/** apply the gestures active at t (times already resolved) */
export const gestureAt = (p: Pose, gs: { t0: number; g: GestureId }[], t: number): Pose => {
  let out = p;
  for (const { t0, g } of gs) {
    const G = GESTURES[g];
    const e = t - t0;
    if (e < -0.12 || e > G.hold + 0.2) continue;
    const w = e < 0 ? anticip((e + 0.12) / 0.12 * 0.5) : e < G.hold ? 1 : 1 - (e - G.hold) / 0.2;
    out = mixPose(out, { ...out, ...G.f(out, e, t) } as Pose, Math.max(0, Math.min(1.08, w)));
  }
  return out;
};
