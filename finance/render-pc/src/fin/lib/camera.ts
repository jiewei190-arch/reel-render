// Camera helpers for the recipe system. Adapted (rewritten) from mromidev/claude-animated-shorts
// (templates/bridge/story.ts, commit e3b817b, MIT, (c) 2026 Mr omi; see THIRD_PARTY_NOTICES.md): the impact kick,
// the push-in factor with a punch window, the zoom push and the quintic glide. Changes: seconds instead of frames, our
// Cam type ({pos, look, fov, roll in degrees}), kicks given per call instead of a global table.
import type { V3 } from "../../blocky/motion";

export const FPS = 30;
export type Cam = { pos: V3; look: V3; fov: number; roll?: number };
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

/** quintic smootherstep (attack = release): the reference camera glide */
export const glide = (u: number) => {
  const x = clamp01(u);
  return x * x * x * (x * (6 * x - 15) + 10);
};
/** blend two cameras (glide them with glide(u)) */
export const mixCam = (a: Cam, b: Cam, k: number): Cam => ({
  pos: a.pos.map((v, i) => v + (b.pos[i] - v) * k) as V3,
  look: a.look.map((v, i) => v + (b.look[i] - v) * k) as V3,
  fov: a.fov + (b.fov - a.fov) * k,
  roll: (a.roll ?? 0) + ((b.roll ?? 0) - (a.roll ?? 0)) * k,
});

/** push-in factor since t0: the distance shrinks by ~rate per frame (0.0015-0.0035 = 0.15-0.35 %/f on holds); `punch`
 *  raises the rate (0.006 = 0.6 %/f) for the first n frames with 8-frame soft edges. Multiply the lens distance by it. */
export const pushK = (t: number, t0: number, rate = 0.0025, punch = 0, n = 35) => {
  const x = Math.max(0, (t - t0) * FPS);
  let s = rate * x;
  if (punch > rate) for (let i = 0; i < Math.min(x, n); i++) s += (punch - rate) * Math.max(0, Math.min(1, (i + 0.5) / 8, (n - i - 0.5) / 8));
  return Math.exp(-s);
};
/** zoom push (the lens stays put): the fov whose tan(fov/2) is k times smaller */
export const zoomFov = (fov: number, k: number) => (360 / Math.PI) * Math.atan(Math.tan((fov * Math.PI) / 360) * k);

/** impact kick: 7 frames, the sign flips every frame, decay (1 - n/7)^1.5. hits = [time s, gain] (gain 0.5-1.6). */
export const kickAt = (t: number, hits: readonly (readonly [number, number])[]) => {
  let a = 0;
  for (const [t0, g] of hits) {
    const n = Math.floor((t - t0) * FPS + 1e-6);
    if (n >= 0 && n < 7) a += g * (n % 2 ? -1 : 1) * (1 - n / 7) ** 1.5;
  }
  return a;
};
/** apply a kick of amplitude a to a camera: ~3 px at 720p per unit gain at the look distance (scaled to our 1920 px
 *  height: 8 px), the look moves sideways and 0.6x up, plus a small roll (0.23 deg per unit) */
export const kicked = (c: Cam, a: number): Cam => {
  if (!a) return c;
  const d: V3 = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]];
  const L = Math.hypot(...d), h = Math.hypot(d[0], d[2]) || 1;
  const m = (3 / 640) * Math.tan((c.fov * Math.PI) / 360) * L * a;
  return { ...c, look: [c.look[0] - (d[2] / h) * m, c.look[1] + 0.6 * m, c.look[2] + (d[0] / h) * m], roll: (c.roll ?? 0) + a * 0.23 };
};
/** a whip pan: the look swings from `deg` off to on-target over d s with a fast-in ease (2-3 frame ramps) */
export const whipK = (t: number, t0: number, d = 0.22) => {
  const u = clamp01((t - t0) / d);
  return 1 - glide(u);
};
