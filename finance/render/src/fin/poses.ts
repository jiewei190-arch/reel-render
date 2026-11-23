// Pose helpers for the finance cast (pure functions; all motion is a function of t). Gestures use pop() (anticipation +
// overshoot, >= 0.7 s for a big arm move) so nothing snaps; arms raise forward (arm*) or sideways (out*).
import type { Pose } from "../blocky/motion";
import { faceH, popT, base, SINK } from "../library/characters";
void popT;
import { clamp } from "../blocky/motion";

export { faceH };
export const stand = (x: number, z: number, yaw: number, s: number, o: Partial<Pose> = {}) => base(x, z, yaw, s, o, SINK);
/** lift a standing pose by h metres (standing on a hidden box or a coin pile) */
export const lift = (p: Pose, h: number): Pose => ({ ...p, y: p.y + h });
const mixP = (a: Pose, b: Partial<Pose>, k: number): Pose => {
  const o: Pose = { ...a };
  for (const key of Object.keys(b) as (keyof Pose)[]) {
    const va = a[key], vb = b[key];
    if (typeof va === "number" && typeof vb === "number") (o as Record<string, unknown>)[key] = va + (vb - va) * k;
  }
  return o;
};
/** gesture: blend from p toward the target joint values between t0 and t0+dur (and back from `back`). Speed-limited:
 * a smooth ease whose peak is 1.5 x the mean speed, and dur grows with the move so no joint exceeds ~3.6 rad/s
 * (pitfalls.md: faster arms ghost under the 4-sample motion blur). Anticipation lives in the small settle at the end. */
export const gesture = (p: Pose, target: Partial<Pose>, t: number, t0: number, dur = 0.7, back?: number): Pose => {
  let big = 0;
  for (const key of Object.keys(target) as (keyof Pose)[]) {
    const va = p[key], vb = target[key];
    if (typeof va === "number" && typeof vb === "number" && key !== "ant") big = Math.max(big, Math.abs(vb - va));
  }
  const d = Math.max(dur, (1.5 * big) / 3.6);
  const u = clamp((t - t0) / d);
  let k = u * u * (3 - 2 * u);
  if (back !== undefined) {
    const v = clamp((t - back) / d);
    k *= 1 - v * v * (3 - 2 * v);
  }
  return mixP(p, target, k);
};
export const POINT_R: Partial<Pose> = { armR: 1.45, outR: 0.12 };
export const POINT_L: Partial<Pose> = { armL: 1.45, outL: 0.12 };
export const HOLD_R: Partial<Pose> = { armR: 0.95, outR: -0.05 };
export const HOLD_L: Partial<Pose> = { armL: 0.95, outL: -0.05 };
export const CHEER: Partial<Pose> = { armL: 2.7, armR: 2.7, outL: 0.25, outR: 0.25, ant: 1 };
export const SHRUG: Partial<Pose> = { armL: 0.35, armR: 0.35, outL: 0.7, outR: 0.7, headPitch: -0.08 };
export const SHOCK: Partial<Pose> = { armL: 0.6, armR: 0.6, outL: 0.55, outR: 0.55, ant: 1, headPitch: -0.12 };
export const DROOP: Partial<Pose> = { armL: 0.02, armR: 0.02, outL: 0.0, outR: 0.0, headPitch: 0.22, ant: -1 };
export const LOOK_UP: Partial<Pose> = { headPitch: -0.38 };
/** a slow wave of the right arm (pointing up, waggling) */
export const wave = (p: Pose, t: number, t0: number): Pose => {
  const u = clamp((t - t0) / Math.max(0.7, (1.5 * Math.abs(2.6 - p.armR)) / 3.6));
  const k = u * u * (3 - 2 * u);
  return { ...p, armR: p.armR + (2.6 - p.armR) * k, outR: p.outR + (0.35 + 0.18 * Math.sin((t - t0) * 7)) * k };
};
