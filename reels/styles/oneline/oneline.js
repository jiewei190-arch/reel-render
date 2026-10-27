// oneline.js: a vertical (1080x1920) ONE-LINE ink engine. Our own implementation of the grammar in Lemo-Opuscar's one-line STYLE.md (MIT):
// one continuous pen path, ink drawn as a pressure-varying polygon on warm paper, a soft pen shadow, handwritten labels that are written on.
// Deterministic: everything is a pure function of t.
export const W = 1080, H = 1920;
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, u) => a + (b - a) * u;
export const ss = (a, b, x) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };
export const eo = u => 1 - Math.pow(1 - clamp(u), 3);
export const backOut = u => { u = clamp(u); const c = 1.70158; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
export const hash = n => { const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };
export function vnoise(x) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u); }
export const INK = '#1D1A17', BLOOD = '#E2524B', PAPER = '#F4EFE4';

// ---------- Path: one polyline, built from segments, pinned to times ----------
export class Path {
  constructor() { this.x = []; this.y = []; this.kind = []; this.ch = []; this.pins = []; this.marks = {}; this.k = 0; this.c = 0; this.step = 7; }
  get n() { return this.x.length; }
  get cx() { return this.x[this.x.length - 1]; }
  get cy() { return this.y[this.y.length - 1]; }
  _push(x, y) { this.x.push(x); this.y.push(y); this.kind.push(this.k); this.ch.push(this.c); }
  start(x, y) { this._push(x, y); return this; }
  line(x, y) { const x0 = this.cx, y0 = this.cy, d = Math.hypot(x - x0, y - y0), n = Math.max(1, Math.ceil(d / this.step)); for (let i = 1; i <= n; i++) this._push(x0 + (x - x0) * i / n, y0 + (y - y0) * i / n); return this; }
  poly(pts) { for (const [x, y] of pts) this.line(x, y); return this; }
  cubic(x1, y1, x2, y2, x, y) {
    const x0 = this.cx, y0 = this.cy;
    const len = Math.hypot(x1 - x0, y1 - y0) + Math.hypot(x2 - x1, y2 - y1) + Math.hypot(x - x2, y - y2), n = Math.max(2, Math.ceil(len / this.step));
    for (let i = 1; i <= n; i++) { const u = i / n, v = 1 - u; this._push(v * v * v * x0 + 3 * v * v * u * x1 + 3 * v * u * u * x2 + u * u * u * x, v * v * v * y0 + 3 * v * v * u * y1 + 3 * v * u * u * y2 + u * u * u * y); }
    return this;
  }
  // arc around (cx,cy), radius r, from angle a0 to a1 (radians, screen coords: +angle = clockwise). Starts at the cursor only if it already sits on the arc.
  arc(cx, cy, r, a0, a1, r1 = r) {
    const len = Math.abs(a1 - a0) * Math.max(r, r1), n = Math.max(3, Math.ceil(len / this.step));
    for (let i = 0; i <= n; i++) { const u = i / n, a = lerp(a0, a1, u), rr = lerp(r, r1, u); const px = cx + Math.cos(a) * rr, py = cy + Math.sin(a) * rr; if (i === 0 && this.n && Math.hypot(px - this.cx, py - this.cy) < 1e-6) continue; if (i === 0 && this.n) this.line(px, py); else this._push(px, py); }
    return this;
  }
  mark(name) { this.marks[name] = this.n - 1; return this; }
  pin(t, o = {}) { this.pins.push({ i: this.n - 1, t, uniform: !!o.uniform }); return this; }
  hold(t0, t1) { this.pin(t0); this.pin(t1); return this; }
  finalize() {
    const n = this.n, X = this.X = Float64Array.from(this.x), Y = this.Y = Float64Array.from(this.y);
    this.KIND = Int8Array.from(this.kind); this.CH = Int8Array.from(this.ch);
    if (!this.pins.length || this.pins[0].i !== 0) throw new Error('first pin must be at index 0');
    if (this.pins[this.pins.length - 1].i !== n - 1) throw new Error('last pin must be at the last point (have ' + this.pins[this.pins.length - 1].i + ' of ' + (n - 1) + ')');
    const turn = new Float64Array(n);
    for (let i = 1; i < n - 1; i++) { const a1 = Math.atan2(Y[i] - Y[i - 1], X[i] - X[i - 1]), a2 = Math.atan2(Y[i + 1] - Y[i], X[i + 1] - X[i]); let d = a2 - a1; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; turn[i] = Math.abs(d); }
    const tz = new Float64Array(n); for (let i = 0; i < n; i++) { let s = 0, c = 0; for (let j = -3; j <= 3; j++) { const k = i + j; if (k >= 0 && k < n) { s += turn[k]; c++; } } tz[i] = s / c; }
    const T = this.T = new Float64Array(n);
    for (let p = 0; p < this.pins.length - 1; p++) {
      const A = this.pins[p], B = this.pins[p + 1]; if (B.t < A.t - 1e-9) throw new Error('pins go back in time at ' + B.i + ': ' + A.t + ' > ' + B.t);
      const Wc = new Float64Array(B.i - A.i + 1); let acc = 0;
      for (let i = A.i + 1; i <= B.i; i++) { const d = Math.hypot(X[i] - X[i - 1], Y[i] - Y[i - 1]); const f = B.uniform ? 1 : 1 + Math.min(2.2, (tz[i] / Math.max(d, 1e-6)) * 45); acc += d * f; Wc[i - A.i] = acc; }
      for (let i = A.i; i <= B.i; i++) T[i] = acc > 0 ? A.t + (B.t - A.t) * Wc[i - A.i] / acc : A.t;
    }
    // speed (units/s) and pen pressure
    const V = this.V = new Float64Array(n), PR = this.PR = new Float64Array(n);
    for (let i = 1; i < n; i++) { const dt = T[i] - T[i - 1], d = Math.hypot(X[i] - X[i - 1], Y[i] - Y[i - 1]); V[i] = dt > 1e-6 ? d / dt : 0; }
    V[0] = V[1] || 0; const Vs = new Float64Array(n); for (let i = 0; i < n; i++) { let s = 0, c = 0; for (let j = -6; j <= 6; j++) { const k = i + j; if (k >= 0 && k < n) { s += V[k]; c++; } } Vs[i] = s / c; }
    for (let i = 0; i < n; i++) PR[i] = .66 + .8 * Math.exp(-Math.min(Vs[i], 3000) / 300);
    this.holds = []; for (let p = 0; p < this.pins.length - 1; p++) { const A = this.pins[p], B = this.pins[p + 1]; if (A.i === B.i && B.t - A.t > .3) this.holds.push({ i: A.i, t0: A.t, t1: B.t }); }
    return this;
  }
  head(t) { // index h (T[h] <= t) and the interpolated nib position
    const T = this.T, n = this.n; if (t < T[0]) return { h: -1, x: this.X[0], y: this.Y[0], f: 0 };
    if (t >= T[n - 1]) return { h: n - 1, x: this.X[n - 1], y: this.Y[n - 1], f: 0 };
    let lo = 0, hi = n - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (T[m] <= t) lo = m; else hi = m; }
    const f = (t - T[lo]) / Math.max(1e-9, T[lo + 1] - T[lo]); return { h: lo, f, x: lerp(this.X[lo], this.X[lo + 1], f), y: lerp(this.Y[lo], this.Y[lo + 1], f) };
  }
  nibAt(t) { const q = this.head(t); return [q.x, q.y]; }
}

// ---------- paper ----------
function makePaper() {
  const S = 1024, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d');
  g.fillStyle = PAPER; g.fillRect(0, 0, S, S);
  const wrap = (fn) => { for (const dx of [-S, 0, S]) for (const dy of [-S, 0, S]) fn(dx, dy); };
  for (let i = 0; i < 70; i++) { const x = hash(i * 3.1) * S, y = hash(i * 7.7 + 1) * S, r = 90 + hash(i * 5.3) * 220, dark = hash(i * 2.2) > .5; wrap((dx, dy) => { const gr = g.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, r); gr.addColorStop(0, dark ? 'rgba(150,125,85,.022)' : 'rgba(255,252,240,.06)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x + dx - r, y + dy - r, 2 * r, 2 * r); }); }
  g.lineCap = 'round';
  for (let i = 0; i < 520; i++) { const x = hash(i * 1.7 + 9) * S, y = hash(i * 4.1 + 3) * S, a = hash(i * 6.3) * 6.28, l = 25 + hash(i * 8.9) * 90, bend = (hash(i * 3.3) - .5) * 40; g.strokeStyle = hash(i * 9.1) > .5 ? 'rgba(120,100,70,.05)' : 'rgba(255,255,250,.10)'; g.lineWidth = .8 + hash(i * 2.9); wrap((dx, dy) => { g.beginPath(); g.moveTo(x + dx, y + dy); g.quadraticCurveTo(x + dx + Math.cos(a) * l / 2 - Math.sin(a) * bend, y + dy + Math.sin(a) * l / 2 + Math.cos(a) * bend, x + dx + Math.cos(a) * l, y + dy + Math.sin(a) * l); g.stroke(); }); }
  for (let i = 0; i < 2600; i++) { g.fillStyle = hash(i * 5.7) > .5 ? 'rgba(110,90,60,.07)' : 'rgba(255,255,255,.12)'; g.fillRect(hash(i * 1.3 + 2) * S, hash(i * 2.9 + 5) * S, 1 + hash(i) * 1.4, 1 + hash(i + 4) * 1.4); }
  return c;
}

// ---------- renderer ----------
export function createRenderer(canvas) {
  canvas.width = W; canvas.height = H; canvas.style.width = W / 2 + 'px'; canvas.style.height = H / 2 + 'px';
  const g = canvas.getContext('2d'); const paper = makePaper(); const pat = g.createPattern(paper, 'repeat');
  const R = { g, cam: { cx: W / 2, cy: H / 2, z: 1 } };
  R.begin = (cam) => {
    R.cam = cam; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
    const m = new DOMMatrix([cam.z, 0, 0, cam.z, W / 2 - cam.cx * cam.z, H / 2 - cam.cy * cam.z]); pat.setTransform(m); g.fillStyle = pat; g.fillRect(0, 0, W, H);
    R.world();
  };
  R.world = () => { const c = R.cam; g.setTransform(c.z, 0, 0, c.z, W / 2 - c.cx * c.z, H / 2 - c.cy * c.z); };
  R.screen = () => g.setTransform(1, 0, 0, 1, 0, 0);
  R.vignette = () => { R.screen(); const gr = g.createRadialGradient(W / 2, H / 2, H * .30, W / 2, H / 2, H * .78); gr.addColorStop(0, 'rgba(120,95,60,0)'); gr.addColorStop(1, 'rgba(120,95,60,.13)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); };

  // ink: draws the path up to time t. opts: { warp(ch,x,y,out), warped:Set|null, base, colors, upto }
  const WX = new Float64Array(60000), WY = new Float64Array(60000), tmp = [0, 0];
  R.ink = (P, t, o = {}) => {
    const q = P.head(t); if (q.h < 0) return q; const h = q.h, last = h >= P.n - 1;
    const z = R.cam.z, wscale = Math.max(z, .62) / z, base = (o.base || 8.2) * wscale;
    const i1 = last ? P.n - 1 : h + 1, X = P.X, Y = P.Y;
    for (let i = 0; i <= i1; i++) { let x = X[i], y = Y[i]; if (o.warp) { o.warp(x, y, tmp); x = tmp[0]; y = tmp[1]; } WX[i] = x; WY[i] = y; }
    if (!last) { WX[i1] = lerp(WX[h], WX[h + 1], q.f); WY[i1] = lerp(WY[h], WY[h + 1], q.f); }
    const colors = o.colors || [INK, BLOOD];
    let a = 0;
    while (a < i1) { // runs of equal kind
      let b = a; const k = P.KIND[a]; while (b < i1 && P.KIND[b + 1] === k) b++;
      const ka = o.alphas ? o.alphas[k] : 1; if (ka > .01) R.run(P, WX, WY, Math.max(0, a - 1), Math.min(i1, b + (b < i1 ? 1 : 0)), base, colors[k], 1, ka, i1);
      a = b + 1;
    }
    // pooling at slow points + stop blots
    g.fillStyle = INK; for (let i = 4; i < i1 - 2; i += 3) { if (P.V[i] < 25 && P.V[i] > 0 && (!o.alphas || o.alphas[P.KIND[i]] > .99)) { g.beginPath(); g.fillStyle = colors[P.KIND[i]]; g.arc(WX[i], WY[i], base * P.PR[i] * .62, 0, 6.3); g.fill(); } }
    for (const hd of P.holds) { if (t < hd.t0 || hd.i > i1 || (o.alphas && o.alphas[P.KIND[hd.i]] < .99)) continue; const k = ss(hd.t0, hd.t0 + .7, t), x = WX[hd.i], y = WY[hd.i]; g.fillStyle = colors[P.KIND[hd.i]]; g.beginPath(); g.ellipse(x, y + 5 * k, 8 * k * wscale, 10 * k * wscale, 0, 0, 6.3); g.fill(); g.globalAlpha = .35; g.beginPath(); g.ellipse(x, y + 5 * k, 12 * k * wscale, 14 * k * wscale, 0, 0, 6.3); g.fill(); g.globalAlpha = 1; }
    return q;
  };
  // draw one run of points [i0..i1] as a ribbon polygon
  R.run = (P, X, Y, i0, i1, base, color, wmul, alpha, headIdx, bleed = true) => {
    const n = i1 - i0 + 1; if (n < 2) return;
    const Lx = [], Ly = [], Rx = [], Ry = [];
    for (let i = i0; i <= i1; i++) {
      const ip = Math.max(0, i - 1), inx = Math.min(headIdx, i + 1); let dx = X[inx] - X[ip], dy = Y[inx] - Y[ip]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
      let w = base * P.PR[Math.min(i, P.n - 1)] * wmul * (.93 + .14 * vnoise(i * .27 + 3));
      if (i < 4) w *= .55 + .11 * i; // first touch
      const hw = w / 2; Lx.push(X[i] - dy * hw); Ly.push(Y[i] + dx * hw); Rx.push(X[i] + dy * hw); Ry.push(Y[i] - dx * hw);
    }
    const path = (grow) => { g.beginPath(); for (let i = 0; i < n; i++) { const cx = (Lx[i] + Rx[i]) / 2, cy = (Ly[i] + Ry[i]) / 2; const x = cx + (Lx[i] - cx) * grow, y = cy + (Ly[i] - cy) * grow; if (i) g.lineTo(x, y); else g.moveTo(x, y); } for (let i = n - 1; i >= 0; i--) { const cx = (Lx[i] + Rx[i]) / 2, cy = (Ly[i] + Ry[i]) / 2; g.lineTo(cx + (Rx[i] - cx) * grow, cy + (Ry[i] - cy) * grow); } g.closePath(); };
    g.fillStyle = color;
    if (bleed) { g.globalAlpha = .13 * (alpha == null ? 1 : alpha); path(1.9); g.fill(); }
    g.globalAlpha = .93 * (alpha == null ? 1 : alpha); path(1); g.fill(); g.globalAlpha = 1;
  };
  // pen shadow + contact dot at the nib
  R.pen = (x, y, k, t) => {
    if (k <= 0) return; g.save(); g.translate(x, y); g.scale(1 / R.cam.z, 1 / R.cam.z); g.globalAlpha = k;
    const gr = g.createRadialGradient(70, 62, 0, 70, 62, 120); gr.addColorStop(0, 'rgba(55,45,35,.13)'); gr.addColorStop(1, 'rgba(55,45,35,0)');
    g.save(); g.rotate(.35); g.scale(1.9, .55); g.fillStyle = gr; g.beginPath(); g.arc(70, 62, 120, 0, 6.3); g.fill(); g.restore();
    g.fillStyle = 'rgba(29,26,23,.75)'; g.beginPath(); g.arc(0, 0, 4.2, 0, 6.3); g.fill(); g.restore();
  };
  R.measure = (str, size) => { let w = 0; const re = /\*\*(.+?)\*\*/g; let last = 0, m; const add = (s, wt) => { g.font = `${wt} ${size}px Caveat`; w += g.measureText(s).width; }; while ((m = re.exec(str))) { if (m.index > last) add(str.slice(last, m.index), 500); add(m[1], 700); last = re.lastIndex; } if (last < str.length) add(str.slice(last), 500); return w; };
  // handwriting written on, in world space. segs: [[text,bold],...] or string. returns width.
  R.write = (str, x, y, o = {}) => {
    const t = o.t, t0 = o.t0 ?? 0, dur = o.dur ?? Math.max(.4, str.length * .05), a = o.alpha ?? 1, size = o.size ?? 64;
    const k = clamp((t - t0) / dur); if (k <= 0 || a <= 0) return 0;
    const runs = []; const re = /\*\*(.+?)\*\*/g; let last = 0, m; while ((m = re.exec(str))) { if (m.index > last) runs.push([str.slice(last, m.index), 500]); runs.push([m[1], 700]); last = re.lastIndex; } if (last < str.length) runs.push([str.slice(last), 500]);
    let wTot = 0; const ws = runs.map(([s, wt]) => { g.font = `${wt} ${size}px Caveat`; const w = g.measureText(s).width; wTot += w; return w; });
    const x0 = o.align === 'left' ? x : x - wTot / 2; const reveal = x0 + wTot * k;
    g.save(); g.globalAlpha = a; g.beginPath(); g.rect(x0 - size * .3, y - size * 1.1, wTot * k + size * .3 + (k >= 1 ? size : 0), size * 1.7); g.clip();
    let cx = x0; g.textBaseline = 'alphabetic'; g.lineJoin = 'round';
    runs.forEach(([s, wt], i) => { g.font = `${wt} ${size}px Caveat`; g.strokeStyle = PAPER; g.lineWidth = size * .26; g.strokeText(s, cx, y); cx += ws[i]; });
    cx = x0; runs.forEach(([s, wt], i) => { g.font = `${wt} ${size}px Caveat`; g.fillStyle = o.color || 'rgba(29,26,23,.86)'; g.fillText(s, cx, y); cx += ws[i]; });
    g.restore(); return wTot;
  };
  return R;
}
