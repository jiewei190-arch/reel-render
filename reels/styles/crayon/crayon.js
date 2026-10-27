// crayon.js: a vertical (1080×1920) crayon-picture-book renderer for our reel engine.
// Technique learned from Lemo-Opuscar "crayon-book" (MIT). This is a re-implementation for Canvas2D plus a CPU compositor,
// which is cheap under swiftshader.
//
// Model: each frame is redrawn from scratch.
//   bg / fg  wax layers (Canvas2D): RGB = crayon colour, A = pressure (overlapping strokes accumulate pressure).
//   wash     watercolour density (A). One watercolour per film, resisted by bg wax.
//   knock    mask (A>0.5) that restores bare paper under it: subtitle patches and character silhouettes.
// Composite per pixel: paper → bg wax (adhesion: tooth > 1 − 1.22·pressure) → wash (edge pooling, bloom, wax resist)
//                      → fg wax (characters stay crisp above the wash) → emboss + warm vignette.
// Timing: drawn things step at 12 fps (td = floor(t·12)/12); the boil seed is BOIL.step = floor(t·12).

export const W = 1080, H = 1920;
export const BOIL = { step: 0, amp: 1 };
export const CLOCK = { t: 0, td: 0 };

// ── math ─────────────────────────────────────────────
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, u) => a + (b - a) * u;
export const ss = (a, b, x) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };
export const hash = n => { const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };
export function vnoise(x) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u); }
const n1 = (seed, x) => vnoise(x + seed * 17.31) * 2 - 1;
export const easeOut = u => 1 - Math.pow(1 - clamp(u), 3);
export const backOut = u => { u = clamp(u); const c = 1.70158; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
// draw progress from a start time and a duration, on the 12 fps drawing clock
export const prog = (t0, dur) => dur <= 0 ? (CLOCK.td >= t0 ? 1 : 0) : clamp((CLOCK.td - t0) / dur);

function hexRGB(h) { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }

// ── layers ───────────────────────────────────────────
function mk() { const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d', { willReadFrequently: true }); g.lineCap = 'round'; g.lineJoin = 'round'; return { c, g }; }

export function createCrayon(out, opt = {}) {
  out.width = W; out.height = H;
  const og = out.getContext('2d');
  const R = {
    bg: mk(), fg: mk(), wash: mk(), knock: mk(), blur: mk(),
    paper: hexRGB(opt.paper || '#f4efe3'),
    washT: (opt.wash || [0.42, 0.70, 0.86]),      // watercolour transmission (multiply colour)
    emb: opt.emboss ?? 0.9, vig: opt.vignette ?? 0.22,
  };
  // ── precompute paper: tooth height, paper colour, emboss/vignette multiplier, bloom noise ──
  const N = W * H;
  const tooth = new Float32Array(N), lit = new Float32Array(N * 3), base = new Float32Array(N * 3), bloom = new Float32Array(N);
  const h21 = (x, y) => { let px = x * 123.34, py = y * 456.21; px -= Math.floor(px); py -= Math.floor(py); const d = px * (px + 45.32) + py * (py + 45.32); px += d; py += d; const v = px * py; return v - Math.floor(v); };
  const vn = (x, y) => { const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy, ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
    return lerp(lerp(h21(ix, iy), h21(ix + 1, iy), ux), lerp(h21(ix, iy + 1), h21(ix + 1, iy + 1), ux), uy); };
  const ts = opt.toothScale ?? 1.25;
  const raw = new Float32Array(N);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const px = x / ts, py = y / ts;
    let n = vn(px / 1.35, py / 1.35) * .34 + vn(px / 2.9 + 17, py / 2.9 + 17) * .33 + vn(px / 6.3 + 41, py / 6.3 + 41) * .21;
    n += (vn(px / 10 + 7, py / 1.9 + 7) - .5) * .22 + (vn(px / 2.1 + 71, py / 13 + 71) - .5) * .08;
    raw[y * W + x] = n;
  }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x, t0 = raw[i];
    tooth[i] = ss(.16, .86, t0 + .06);
    const gx = (x < W - 1 ? raw[i + 1] : t0) - t0, gy = (y > 0 ? raw[i - W] : t0) - t0;
    const l = 1 + (gx * -.9 + gy * .9) * R.emb - (1 - t0) * .035;
    const m = vn(x / 180, y / 180) * .6 + vn(x / 60 + 9, y / 60 + 9) * .4;
    const qx = (x / W - .5) * (W / H), qy = y / H - .5, v = 1 - R.vig * (qx * qx + qy * qy) * 2.2;
    const warm = clamp((1 - v) * 1.4);
    const pm = 0.975 + 0.035 * m;
    base[i * 3] = R.paper[0] * pm; base[i * 3 + 1] = R.paper[1] * pm; base[i * 3 + 2] = R.paper[2] * pm;
    lit[i * 3] = l * v; lit[i * 3 + 1] = l * v * lerp(1, .965, warm); lit[i * 3 + 2] = l * v * lerp(1, .9, warm);
    bloom[i] = vn(x / 160, y / 160) * .5 + vn(x / 55 + 3, y / 55 + 3) * .3 + vn(x / 19 + 8, y / 19 + 8) * .2;
  }
  const img = og.createImageData(W, H), D = img.data;

  R.begin = (t) => {
    CLOCK.t = t; CLOCK.td = Math.floor(t * 12 + 1e-6) / 12; BOIL.step = Math.floor(t * 12 + 1e-6);
    for (const L of [R.bg, R.fg, R.wash, R.knock]) { L.g.setTransform(1, 0, 0, 1, 0, 0); L.g.globalAlpha = 1; L.g.clearRect(0, 0, W, H); }
  };

  R.compose = () => {
    const B = R.bg.g.getImageData(0, 0, W, H).data, F = R.fg.g.getImageData(0, 0, W, H).data;
    const K = R.knock.g.getImageData(0, 0, W, H).data, Wd = R.wash.g.getImageData(0, 0, W, H).data;
    const bg = R.blur.g; bg.setTransform(1, 0, 0, 1, 0, 0); bg.clearRect(0, 0, W, H); bg.filter = 'blur(10px)'; bg.drawImage(R.wash.c, 0, 0); bg.filter = 'none';
    const Bl = bg.getImageData(0, 0, W, H).data;
    const [tr, tg, tb] = R.washT;
    for (let i = 0, j = 0; i < N; i++, j += 4) {
      let r = base[i * 3], g = base[i * 3 + 1], b = base[i * 3 + 2];
      const th = tooth[i]; let cov = 0;
      if (K[j + 3] < 128) {
        const a = B[j + 3] / 255;
        if (a > .003) {
          const thr = 1 - a * 1.22; cov = ss(thr - .1, thr + .1, th) * ss(0, .18, a);
          const k = 1 - .1 * a * a;
          r = lerp(r, B[j] * k, cov); g = lerp(g, B[j + 1] * k, cov); b = lerp(b, B[j + 2] * k, cov);
        }
        const d = Wd[j + 3] / 255;
        if (d > .002) {
          const edge = Math.max(0, d - Bl[j + 3] / 255) * 1.6;
          const gran = ss(.35, .05, th);
          let dd = d * (.82 + .3 * bloom[i]) * (1 + .4 * gran) + edge;
          dd *= 1 - .9 * ss(.12, .55, cov);
          dd = clamp(dd, 0, 1.25); const u = Math.min(dd, 1), dk = dd > 1 ? lerp(1, .82, Math.min(1, (dd - 1) * 4)) : 1;
          r *= lerp(1, tr, u) * dk; g *= lerp(1, tg, u) * dk; b *= lerp(1, tb, u) * dk;
        }
      }
      const a2 = F[j + 3] / 255;
      if (a2 > .003) {
        const thr = 1 - a2 * 1.22, c2 = ss(thr - .1, thr + .1, th) * ss(0, .18, a2), k = 1 - .1 * a2 * a2;
        r = lerp(r, F[j] * k, c2); g = lerp(g, F[j + 1] * k, c2); b = lerp(b, F[j + 2] * k, c2); cov = Math.max(cov, c2);
      }
      const ws = 1 - .55 * cov;
      const l0 = lit[i * 3], v = l0; // l0 already includes vignette
      D[j] = r * (1 + (lit[i * 3] - 1) * ws) + cov * 4.5;
      D[j + 1] = g * (1 + (lit[i * 3 + 1] - 1) * ws) + cov * 4.5;
      D[j + 2] = b * (1 + (lit[i * 3 + 2] - 1) * ws) + cov * 4.5;
      D[j + 3] = 255;
    }
    og.putImageData(img, 0, 0);
  };
  return R;
}

// ── geometry helpers ─────────────────────────────────
function resample(sp, step = 3, closed = false) {
  const q = closed ? [...sp, sp[0]] : sp; const out = [q[0].slice()]; const L = [0]; let acc = 0, total = 0;
  for (let i = 1; i < q.length; i++) {
    const [ax, ay] = q[i - 1], [bx, by] = q[i]; const d = Math.hypot(bx - ax, by - ay); if (d < 1e-6) continue;
    let pos = step - acc;
    while (pos <= d) { const u = pos / d; out.push([ax + (bx - ax) * u, ay + (by - ay) * u]); total += step; L.push(total); pos += step; }
    acc = d - (pos - step);
  }
  const last = q[q.length - 1], lp = out[out.length - 1], rem = Math.hypot(last[0] - lp[0], last[1] - lp[1]);
  if (rem > .3) { out.push(last.slice()); total += rem; L.push(total); }
  return { p: out, L, total };
}
function ribbon(g, P, Wd, k) {
  g.beginPath();
  for (let i = 0; i < P.length; i++) { const q = P[i], d = Wd[i] * .5 * k; i ? g.lineTo(q[0] + q[2] * d, q[1] + q[3] * d) : g.moveTo(q[0] + q[2] * d, q[1] + q[3] * d); }
  for (let i = P.length - 1; i >= 0; i--) { const q = P[i], d = Wd[i] * .5 * k; g.lineTo(q[0] - q[2] * d, q[1] - q[3] * d); }
  g.closePath();
}
// option aliases: color→col, pressure→p, t0/dur→draw
const C = o => o.col || o.color;
const Pp = (o, d) => o.p ?? o.pressure ?? d;
const Dr = o => o.draw ?? (o.t0 !== undefined ? prog(o.t0, o.dur ?? .6) : 1);

// ── crayon line: tapered ribbon, hand wobble, boil, streaks ──
export function line(L, pts, o = {}) {
  const g = L.g, col = C(o) || '#4a2f5c', w = o.w ?? 7, p = Pp(o, .85), seed = o.seed ?? 1, wob = o.wob ?? 1, ba = BOIL.amp * (o.boil ?? 1);
  const draw = Dr(o); if (draw <= 0) return;
  const R = resample(pts, 3, o.closed); const n = R.p.length; if (n < 2) return;
  const lim = R.total * draw, st = BOIL.step;
  const jx = (hash(seed * 3.1 + st * 7.7) - .5) * 1.6 * ba, jy = (hash(seed * 5.3 + st * 3.9) - .5) * 1.6 * ba;
  const P = [], Wd = [], taper = o.taper ?? .25, tl = Math.min(R.total * taper, 30);
  for (let i = 0; i < n; i++) {
    const s = R.L[i]; if (s > lim) break;
    const a = R.p[Math.max(0, i - 1)], b = R.p[Math.min(n - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1]; const tn = Math.hypot(tx, ty) || 1; tx /= tn; ty /= tn;
    const off = n1(seed, s / 85) * 1.8 * wob + n1(seed + st * 1.37 + 11, s / 38) * .9 * ba;
    P.push([R.p[i][0] - ty * off + jx, R.p[i][1] + tx * off + jy, -ty, tx]);
    const e0 = o.closed ? 1 : clamp(s / (tl + 1e-3)), e1 = o.closed ? 1 : clamp((Math.min(lim, R.total) - s) / (tl + 1e-3));
    Wd.push(w * (.82 + .3 * n1(seed + 3, s / 55)) * (.45 + .55 * Math.min(e0, e1)));
  }
  if (P.length < 2) return;
  g.fillStyle = col; g.strokeStyle = col;
  ribbon(g, P, Wd, 1); g.globalAlpha = p * .55; g.fill();
  ribbon(g, P, Wd, .5); g.globalAlpha = p * .38; g.fill();
  for (let k = 0; k < (o.streak ?? 2); k++) {
    const side = (hash(seed + k * 9.1) - .5) * .9; g.beginPath();
    for (let i = 0; i < P.length; i++) { const q = P[i], d = side * Wd[i]; i ? g.lineTo(q[0] + q[2] * d, q[1] + q[3] * d) : g.moveTo(q[0] + q[2] * d, q[1] + q[3] * d); }
    g.lineWidth = Math.max(1, w * .22); g.globalAlpha = p * .3; g.stroke();
  }
  g.globalAlpha = 1;
}

// ── fill: back-and-forth zig-zag hatching that overshoots the outline ──
// o: col, p, ang, gap, w, over, seed, draw|t0/dur, cross, rev (fill from the other side)
export function fill(L, poly, o = {}) {
  const g = L.g, col = C(o) || '#f6c945', p = Pp(o, .7), seed = o.seed ?? 1, ba = BOIL.amp * (o.boil ?? 1), st = BOIL.step;
  const ang = (o.ang ?? .62) + (o.rev ? Math.PI : 0) + (hash(seed + st * 1.9) - .5) * .035 * ba;
  const gap = o.gap ?? 9, w = o.w ?? 11, over = o.over ?? 6;
  const draw = Dr(o); if (draw <= 0) return;
  const ca = Math.cos(ang), sa = Math.sin(ang);
  const rp = poly.map(([x, y]) => [x * ca + y * sa, -x * sa + y * ca]);
  let y0 = Infinity, y1 = -Infinity; for (const q of rp) { y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); }
  const rows = []; let y = y0 + gap * (.35 + .3 * hash(seed + st * .7 * ba)), r = 0;
  while (y < y1) {
    const xs = [];
    for (let i = 0; i < rp.length; i++) { const a = rp[i], b = rp[(i + 1) % rp.length]; if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) xs.push(a[0] + (y - a[1]) / (b[1] - a[1]) * (b[0] - a[0])); }
    xs.sort((a, b) => a - b); const spans = []; for (let i = 0; i + 1 < xs.length; i += 2) spans.push([xs[i], xs[i + 1]]);
    rows.push({ y, spans, r }); r++; y += gap * (.8 + .4 * hash(seed * 1.3 + r * 3.7));
  }
  const strokes = []; let cur = null, prev = null;
  for (const row of rows) {
    if (row.spans.length !== 1) { cur = null; prev = null; for (const s of row.spans) strokes.push([[s, row.y, row.r]]); continue; }
    const s = row.spans[0];
    if (cur && prev && s[0] < prev[1] && s[1] > prev[0]) cur.push([s, row.y, row.r]); else { cur = [[s, row.y, row.r]]; strokes.push(cur); }
    prev = s;
  }
  const paths = strokes.map((S, si) => {
    const pts = [];
    S.forEach(([s, yy, rr], k) => {
      const oA = over * (hash(seed + rr * 5.1 + .3) * 1.1 - .15), oB = over * (hash(seed + rr * 2.3 + .7) * 1.1 - .15);
      const yj = (hash(seed + rr * 1.7 + st * .31 * ba) - .5) * gap * .35 * Math.max(ba, .3);
      const a = [s[0] - oA, yy + yj], b = [s[1] + oB, yy + yj + (hash(seed + rr) - .5) * gap * .6];
      if ((k + si) % 2 === 0) pts.push(a, b); else pts.push(b, a);
    });
    return pts.map(([x, y]) => [x * ca - y * sa, x * sa + y * ca]);
  });
  let total = 0; const lens = paths.map(pp => { let l = 0; for (let i = 1; i < pp.length; i++) l += Math.hypot(pp[i][0] - pp[i - 1][0], pp[i][1] - pp[i - 1][1]); total += l; return l; });
  let budget = total * draw; g.strokeStyle = col;
  for (let k = 0; k < paths.length && budget > 0; k++) {
    const cut = cutPath(paths[k], budget); budget -= lens[k];
    for (let i = 1; i < cut.length; i++) {
      const pr = p * (.72 + .42 * hash(seed * .37 + k * 13.1 + i * .71));
      g.beginPath(); g.moveTo(cut[i - 1][0], cut[i - 1][1]); g.lineTo(cut[i][0], cut[i][1]);
      g.globalAlpha = pr * .62; g.lineWidth = w; g.stroke(); g.globalAlpha = pr * .3; g.lineWidth = w * .42; g.stroke();
    }
  }
  g.globalAlpha = 1;
  if (o.cross) fill(L, poly, { ...o, cross: false, ang: (o.ang ?? .62) + 1.25, seed: seed + 101, p: p * .7, draw });
}
function cutPath(pp, len) {
  const out = [pp[0]]; let acc = 0;
  for (let i = 1; i < pp.length; i++) {
    const d = Math.hypot(pp[i][0] - pp[i - 1][0], pp[i][1] - pp[i - 1][1]);
    if (acc + d >= len) { const u = (len - acc) / d; out.push([lerp(pp[i - 1][0], pp[i][0], u), lerp(pp[i - 1][1], pp[i][1], u)]); return out; }
    acc += d; out.push(pp[i]);
  }
  return out;
}
// solid small dab (cheeks, pupils)
export function dab(L, x, y, r, o = {}) {
  fill(L, handCircle(x, y, r, o.seed ?? 1, 0, 24), { col: C(o) || '#ff8fb1', p: Pp(o, .85), gap: o.gap ?? 4, w: o.w ?? Math.max(4, r * .35), over: o.over ?? 1.5, seed: o.seed ?? 1, ang: o.ang ?? .5, draw: o.draw, t0: o.t0, dur: o.dur });
}
// knock-out: restore bare paper (bg wax + wash) under a polygon
export function knock(L, poly) { const g = L.g; g.globalAlpha = 1; g.fillStyle = '#000'; g.beginPath(); poly.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill(); }
// watercolour: wide brush band(s) of density p over a polygon; draw sweeps left→right
export function wash(L, poly, o = {}) {
  const g = L.g, draw = Dr(o); if (draw <= 0) return;
  let x0 = Infinity, x1 = -Infinity; for (const [x] of poly) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); }
  g.save(); g.beginPath(); poly.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.clip();
  g.fillStyle = '#000'; g.globalAlpha = Pp(o, .55);
  const xe = lerp(x0 - 20, x1 + 20, draw);
  g.beginPath(); g.rect(x0 - 40, -10, xe - x0 + 40, H + 20); g.fill();
  // bristle streaks
  g.globalAlpha = .08; g.lineWidth = 3;
  for (let k = 0; k < 40; k++) { const yy = lerp(0, H, hash(k * 3.3 + (o.seed ?? 0))); g.beginPath(); g.moveTo(x0, yy); g.lineTo(xe, yy + 6 * Math.sin(k)); g.stroke(); }
  g.restore();
}
// handwritten text, written letter by letter, boiling
export function text(L, str, x, y, o = {}) {
  const g = L.g, st = BOIL.step, seed = o.seed ?? 7, ba = BOIL.amp * (o.boil ?? 1), size = o.size ?? 56, font = o.font ?? 'Patrick Hand';
  g.save(); g.font = `${o.weight ?? 400} ${size}px "${font}"`; g.textBaseline = 'alphabetic';
  const chars = [...str], widths = chars.map(c => g.measureText(c).width), tw = widths.reduce((a, b) => a + b, 0) + (o.track ?? 0) * (chars.length - 1);
  if (o.measure) { g.restore(); return tw; }
  let cx = o.align === 'left' ? x : o.align === 'right' ? x - tw : x - tw / 2;
  const reveal = o.reveal ?? (o.t0 !== undefined ? prog(o.t0, o.dur ?? Math.max(.35, chars.length * .03)) : 1), nShow = reveal * chars.length;
  chars.forEach((ch, i) => {
    const vis = clamp(nShow - i); if (vis <= 0) { cx += widths[i] + (o.track ?? 0); return; }
    const col = (o.colors && o.colors[i]) || C(o) || '#4a2f5c';
    const jx = (hash(seed + i * 3.3 + st * 1.1) - .5) * 1.4 * ba, jy = (hash(seed + i * 7.1 + st * 2.3) - .5) * 1.4 * ba;
    const rot = (hash(seed + i * 1.9) - .5) * .07 + (hash(seed + i + st * .7) - .5) * .02 * ba, by = (hash(seed + i * 5.5) - .5) * size * .05;
    g.save(); g.translate(cx + widths[i] / 2 + jx, y + by + jy); g.rotate(rot); g.globalAlpha = Pp(o, 1) * vis; g.fillStyle = col;
    g.fillText(ch, -widths[i] / 2, 0);
    if (o.stroke) { g.lineWidth = o.stroke; g.strokeStyle = col; g.strokeText(ch, -widths[i] / 2, 0); }
    g.restore(); cx += widths[i] + (o.track ?? 0);
  });
  g.restore(); return tw;
}
// subtitle = the book's printed words on a ragged paper knock-out patch (never a dark box). Wraps to maxW.
export function subtitle(R, str, y, o = {}) {
  const size = o.size ?? 54, maxW = o.maxW ?? 900, lh = size * 1.12;
  const words = str.split(' '), lines = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (text(R.fg, t, 0, 0, { size, measure: true }) > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  lines.push(cur);
  const h = lines.length * lh, wmax = Math.max(...lines.map(l => text(R.fg, l, 0, 0, { size, measure: true })));
  knock(R.knock, raggedRect(W / 2, y + h / 2 - size * .35, wmax + 70, h + 40, o.seed ?? 3));
  const rv = o.reveal ?? 1, per = 1 / lines.length;
  lines.forEach((l, i) => text(R.fg, l, W / 2, y + i * lh + size * .35, { size, col: o.col, seed: (o.seed ?? 3) + i * 11, reveal: clamp((rv - i * per) / per) }));
}
export function raggedRect(cx, cy, w, h, seed = 1) {
  const pts = [], n = 60;
  for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
    const k = 1 / Math.max(Math.abs(c) / (w / 2), Math.abs(s) / (h / 2));  // superellipse-ish box
    const rr = Math.min(k, Math.hypot(w / 2, h / 2)) * (1 + (hash(seed + i * 1.7) - .5) * .05);
    pts.push([cx + c * rr, cy + s * rr]);
  }
  return smooth(pts, 3);
}
// ── shapes ──
export function ellipse(cx, cy, rx, ry, n = 48, a0 = 0, a1 = Math.PI * 2, rot = 0) {
  const out = [], c = Math.cos(rot), s = Math.sin(rot);
  for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n, x = Math.cos(a) * rx, y = Math.sin(a) * ry; out.push([cx + x * c - y * s, cy + x * s + y * c]); }
  return out;
}
export function handCircle(cx, cy, r, seed = 1, over = .12, n = 56) {
  const out = [], a0 = hash(seed) * 6.28;
  for (let i = 0; i <= n; i++) { const u = i / n, a = a0 + u * Math.PI * 2 * (1 + over); const rr = r * (1 + .035 * Math.sin(a * 2 + seed) + (u > 1 - over ? .04 * (u - (1 - over)) / over : 0)); out.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
  return out;
}
// fluffy outline (down feathers): bumps around an ellipse
export function fluff(cx, cy, rx, ry, bumps = 14, amp = .07, seed = 1) {
  const out = [];
  for (let i = 0; i <= 120; i++) { const a = i / 120 * Math.PI * 2; const b = Math.abs(Math.sin(a * bumps / 2 + seed)); const k = 1 + amp * (b - .5) + (hash(seed + Math.floor(a * bumps / 6.283)) - .5) * amp * .6; out.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); }
  return out;
}
export function bez(c, n = 16) {
  const out = [c[0]];
  for (let i = 0; i + 3 < c.length; i += 3) { const [a, b, d, e] = [c[i], c[i + 1], c[i + 2], c[i + 3]];
    for (let k = 1; k <= n; k++) { const t = k / n, u = 1 - t; out.push([u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * d[0] + t * t * t * e[0], u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * d[1] + t * t * t * e[1]]); } }
  return out;
}
export function smooth(pts, n = 8, closed = true) {
  const out = [], m = pts.length, N = closed ? m : m - 1;
  for (let i = 0; i < N; i++) {
    const p0 = pts[(i - 1 + m) % m], p1 = pts[i], p2 = pts[(i + 1) % m], p3 = pts[(i + 2) % m];
    const P0 = closed || i > 0 ? p0 : p1, P3 = closed || i + 2 < m ? p3 : p2;
    for (let k = 0; k < n; k++) { const t = k / n, t2 = t * t, t3 = t2 * t;
      out.push([.5 * (2 * p1[0] + (-P0[0] + p2[0]) * t + (2 * P0[0] - 5 * p1[0] + 4 * p2[0] - P3[0]) * t2 + (-P0[0] + 3 * p1[0] - 3 * p2[0] + P3[0]) * t3),
                .5 * (2 * p1[1] + (-P0[1] + p2[1]) * t + (2 * P0[1] - 5 * p1[1] + 4 * p2[1] - P3[1]) * t2 + (-P0[1] + 3 * p1[1] - 3 * p2[1] + P3[1]) * t3)]); }
  }
  if (!closed) out.push(pts[m - 1]); else out.push(out[0]);
  return out;
}
// offset a centreline into a closed tube polygon (necks, legs, beaks) with per-point half-width
export function tube(pts, wFn) {
  const L = [], Rr = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1]; const n = Math.hypot(tx, ty) || 1; tx /= n; ty /= n;
    const w = typeof wFn === 'function' ? wFn(i / (pts.length - 1)) : wFn;
    L.push([pts[i][0] - ty * w, pts[i][1] + tx * w]); Rr.push([pts[i][0] + ty * w, pts[i][1] - tx * w]);
  }
  return [...L, ...Rr.reverse()];
}
export function xf(pts, { x = 0, y = 0, r = 0, s = 1, ox = 0, oy = 0, fx = 1 } = {}) {
  const c = Math.cos(r), sn = Math.sin(r);
  return pts.map(([px, py]) => { const X = (px - ox) * s * fx, Y = (py - oy) * s; return [x + ox + X * c - Y * sn, y + oy + X * sn + Y * c]; });
}
