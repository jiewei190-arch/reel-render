// Motion timing helpers for the recipe system. The timing rules are adapted from mromidev/claude-animated-shorts
// (templates/bridge/cast.ts LEAD, references/reports/motion.md; MIT, (c) 2026 Mr omi) and the easing curves from
// hassancs91/claude-faceless-shorts-creator (remotion/src/lib/shorts.tsx, collage.tsx; MIT, (c) 2026 Hasan Aboul Hasan).
// Rewritten as plain functions of time (s); see THIRD_PARTY_NOTICES.md.
import { FPS } from "./camera";

/** visual reactions land 0-3 frames BEFORE their word: use t(word) - LEAD as the reaction time */
export const LEAD = 2 / FPS;
/** 0..1 progress of t through [a, b] */
export const prog = (t: number, a: number, b: number) => Math.max(0, Math.min(1, (t - a) / Math.max(1e-4, b - a)));
/** cubic bezier easing (CSS-style control points), solved by bisection: pure and deterministic */
export const bezier = (x1: number, y1: number, x2: number, y2: number) => (x: number) => {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bx = (u: number) => 3 * x1 * u * (1 - u) ** 2 + 3 * x2 * u * u * (1 - u) + u ** 3;
  const by = (u: number) => 3 * y1 * u * (1 - u) ** 2 + 3 * y2 * u * u * (1 - u) + u ** 3;
  let lo = 0, hi = 1;
  for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (bx(m) < x) lo = m; else hi = m; }
  return by((lo + hi) / 2);
};
export const EASE_OUT = bezier(0.33, 1, 0.68, 1);
export const EASE_INOUT = bezier(0.37, 0, 0.63, 1);
/** settles with a soft overshoot (a placed sign, a landing label) */
export const EASE_PLACE = bezier(0.22, 1.2, 0.36, 1);
export const OVERSHOOT = bezier(0.34, 1.56, 0.64, 1);
/** a stamp slam: scale 1.7 -> 1 over 9 frames from `at` */
export const stampScale = (t: number, at: number) => 1.7 - 0.7 * EASE_OUT(prog(t, at, at + 9 / FPS));
/** a strike with anticipation: 4-frame wind-up, held 7 frames, contact on `hit` (0 = wound up, 1 = rest/struck) */
export const windUp = (t: number, hit: number) => {
  const n = (t - hit) * FPS;
  if (n >= -11 && n < -7) { const u = (n + 11) / 4; return 1 - u * u * (3 - 2 * u); }
  if (n >= -7 && n < 0) return 0;
  return 1;
};
/** loop punch: frame 0 starts 1.06 and settles to 1 over 28 f; from `loop` it grows back to 1.06 at `end` */
export const loopPunch = (t: number, loop: number, end: number, k = 0.06) =>
  t < loop ? 1 + k - k * EASE_INOUT(prog(t, 0, 28 / FPS)) : 1 + k * EASE_INOUT(prog(t, loop, end));
