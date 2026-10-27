// rl.js: tiny shared helpers for batch reels (timeline, easing, captions). Original code.
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const ramp = (t, a, d) => clamp((t - a) / d);
export const ease = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export const eo = x => 1 - Math.pow(1 - clamp(x), 3);
export const lerp = (a, b, k) => a + (b - a) * k;
export const pop = k => { k = clamp(k); if (k <= 0) return 0; if (k >= 1) return 1; const s = k * 3.2; return 1 - Math.exp(-3.2 * s * .55) * Math.cos(s * 4.1); };
export const rnd = (seed = 1) => { let t = seed; return () => { t = (t * 1664525 + 1013904223) % 4294967296; return t / 4294967296; }; };
export const TL = window.TL, TLp = TL.p;
export const s = i => TLp[i].start, e = i => TLp[i].end;
window.DUR = TL.total;
// caption: **x** -> <i>x</i> (accent), *x* -> <b>x</b>
export function captions(el, o = {}) {
  const html = TLp.map(p => p.cap.replace(/\*\*(.+?)\*\*/g, '<i>$1</i>').replace(/\*(.+?)\*/g, '<b>$1</b>'));
  const tail = o.tail ?? .45;
  return t => {
    let ci = -1; for (let k = 0; k < TLp.length; k++) { if (t >= TLp[k].start - .02) ci = k; else break; }
    if (ci >= 0 && t < TLp[ci].end + tail) {
      const k2 = t - TLp[ci].start; el.innerHTML = html[ci];
      el.style.opacity = clamp((k2 + .02) / .1) * clamp((TLp[ci].end + tail - t) / .2);
      el.style.transform = `translateY(${(1 - eo(k2 / .22)) * 10}px)`;
    } else el.style.opacity = 0;
  };
}
