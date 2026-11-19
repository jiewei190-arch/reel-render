// Deterministic springs for secondary motion. Adapted from pmndrs/maath (src/time/spring-core.ts; MIT, (c) 2026
// Isaac Mason): the exact closed-form damped-spring solution, evaluated directly at time t (no frame stepping, so a
// Remotion frame always renders the same) + the critically damped step S(x, w) from Melvynx/video-agent-skills
// (engine/lib/kit.js; MIT, (c) 2026 Melvyn Malherbe). See THIRD_PARTY_NOTICES.md.

/** displacement of a spring released at t = 0 from d0 (velocity 0) toward 0: smoothTime ~ settle time (s),
 *  dampingRatio 1 = critical (no bounce), < 1 bouncy (0.45 ~ react-spring "wobbly") */
export const springFree = (t: number, d0 = 1, smoothTime = 0.25, dampingRatio = 0.45) => {
  if (t <= 0) return d0;
  const omega = 2 / Math.max(1e-4, smoothTime);
  if (Math.abs(dampingRatio - 1) < 1e-4) return d0 * Math.exp(-omega * t) * (1 + omega * t);
  if (dampingRatio < 1) {
    const za = -omega * dampingRatio, wd = omega * Math.sqrt(1 - dampingRatio * dampingRatio);
    return d0 * Math.exp(za * t) * (Math.cos(wd * t) - (za * Math.sin(wd * t)) / wd);
  }
  const r1 = -omega * (dampingRatio - Math.sqrt(dampingRatio * dampingRatio - 1)), r2 = -omega * (dampingRatio + Math.sqrt(dampingRatio * dampingRatio - 1));
  return d0 * ((r2 * Math.exp(r1 * t) - r1 * Math.exp(r2 * t)) / (r2 - r1));
};
/** an impulse wobble: a spring kicked with velocity at each hit (a jolt that rings out), summed over hits */
export const wobbleAt = (t: number, hits: readonly number[], amp = 0.25, smoothTime = 0.3, dampingRatio = 0.35) =>
  hits.reduce((s, h) => {
    const e = t - h;
    if (e <= 0 || e > 3 * smoothTime + 0.6) return s;
    const omega = 2 / smoothTime, wd = omega * Math.sqrt(1 - dampingRatio * dampingRatio);
    return s + amp * Math.exp(-omega * dampingRatio * e) * Math.sin(wd * e);
  }, 0);
/** critically damped step: 0 before x = 0, ~95 % at 4.74 / w s, never overshoots */
export const S = (x: number, w = 14) => (x <= 0 ? 0 : 1 - (1 + w * x) * Math.exp(-w * x));
/** a smoothstep exit over d s (spring exits leave a ghost; this one ends at exactly 0) */
export const leave = (x: number, d = 0.26) => (x <= 0 ? 0 : x >= d ? 1 : ((x /= d), x * x * (3 - 2 * x)));
