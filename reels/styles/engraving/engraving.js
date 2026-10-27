// engraving.js: vertical 1080x1920 copperplate-engraving module (original implementation; technique from the Lemo-Opuscar engraving
// style notes, MIT, grammar only). 2D canvas, deterministic. Tone is made of swelling lines only; colour is a transparent wash laid after.
export const W = 1080, H = 1920;
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export const ss = u => { u = clamp(u); return u * u * (3 - 2 * u); };
export const eo = u => 1 - Math.pow(1 - clamp(u), 3);
export const backOut = u => { u = clamp(u); const c = 1.70158; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
export const hash = n => { const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };
export const INK = '#1c1510', PAPER = '#f1e8d2';
export const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
export const PAL = { amber: '#e3992a', honey: '#e8a41f', rose: '#d98a8a', sage: '#8fae86', sky: '#9db8c9', wax: '#efd9a0', brown: '#8a5a2b', blue: '#6f8fb0' };

// ---------- geometry ----------
export function ell(cx, cy, rx, ry, rot = 0, n = 56) { const o = [], c = Math.cos(rot), s = Math.sin(rot); for (let i = 0; i < n; i++) { const a = i / n * 6.28318, x = Math.cos(a) * rx, y = Math.sin(a) * ry; o.push([cx + x * c - y * s, cy + x * s + y * c]); } return o; }
export function hex(cx, cy, r, rot = 0) { const o = []; for (let i = 0; i < 6; i++) { const a = rot + i * 1.0472; o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return o; }
export function rect(x, y, w, h, r = 0, n = 5) { if (!r) return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]; const o = []; for (const [cx, cy, a0] of [[x + w - r, y + r, -1.5708], [x + w - r, y + h - r, 0], [x + r, y + h - r, 1.5708], [x + r, y + r, 3.1416]]) for (let i = 0; i <= n; i++) { const a = a0 + i / n * 1.5708; o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return o; }
export function bez(p0, p1, p2, p3, n = 22) { const o = []; for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; o.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]); } return o; }
export function xf(poly, dx, dy, s = 1, rot = 0) { const c = Math.cos(rot), q = Math.sin(rot); return poly.map(([x, y]) => [dx + (x * c - y * q) * s, dy + (x * q + y * c) * s]); }
const area = p => { let a = 0; for (let i = 0; i < p.length; i++) { const [x1, y1] = p[i], [x2, y2] = p[(i + 1) % p.length]; a += x1 * y2 - x2 * y1; } return a / 2; };
const bboxOf = pts => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } return [x0, y0, x1, y1]; };
// light from the upper left, for the whole film
const LX = -.52, LY = -.62, LZ = .59;
/** spherical tone field for an ellipse: 0 = lit paper, 1 = deep shadow. base/gain shift it; bands() can add stripes. */
export function sph(cx, cy, rx, ry, rot = 0, o = {}) {
  const { base = .0, gain = 1, bands = null, rim = .15 } = o, c = Math.cos(rot), s = Math.sin(rot);
  return (x, y) => {
    const dx = x - cx, dy = y - cy, u = (dx * c + dy * s) / rx, v = (-dx * s + dy * c) / ry, r2 = u * u + v * v;
    if (r2 > 1) return 0; const z = Math.sqrt(1 - r2);
    // normal in screen space (rotate back)
    const nx = u * c - v * s, ny = u * s + v * c, d = nx * LX + ny * LY + z * LZ;
    let t = base + gain * (1 - clamp(d * 1.05 + .08)) * .95 + rim * Math.pow(r2, 3);
    if (bands) t += bands(u, v);
    return clamp(t);
  };
}
export const flat = k => () => k;

// ---------- paper (world-anchored pattern) ----------
function makePaperTile() {
  const N = 512, c = document.createElement('canvas'); c.width = c.height = N; const g = c.getContext('2d');
  g.fillStyle = PAPER; g.fillRect(0, 0, N, N);
  const id = g.getImageData(0, 0, N, N), d = id.data;
  for (let i = 0; i < N * N; i++) { const n = (hash(i * .713) - .5) * 7, y = (i / N) | 0, lp = (y % 7 === 0 ? -4 : 0); d[i * 4] += n + lp; d[i * 4 + 1] += n + lp; d[i * 4 + 2] += n * 1.1 + lp; }
  g.putImageData(id, 0, 0);
  g.strokeStyle = 'rgba(120,90,50,.07)'; g.lineWidth = 1;
  for (let i = 0; i < 260; i++) { const x = hash(i * 3.1) * N, y = hash(i * 5.7) * N, l = 6 + hash(i * 9.3) * 16, a = hash(i * 1.9) * 6.28; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * .5 + 3, y + Math.sin(a) * l * .5 - 3, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  for (let i = 0; i < 26; i++) { g.fillStyle = `rgba(150,105,55,${.05 + hash(i) * .06})`; g.beginPath(); g.arc(hash(i * 7.7) * N, hash(i * 2.3) * N, .8 + hash(i * 4.1) * 1.8, 0, 6.3); g.fill(); }
  return c;
}

// ---------- ribbons (swelling lines) ----------
function mkStroke(p, w) { const len = [0]; for (let i = 1; i < p.length; i++) len.push(len[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1])); return { p, w, len, L: len[len.length - 1] }; }
function addRibbon(g, st, q) {
  if (q <= 0 || st.p.length < 2 || st.L < .5) return;
  let p = st.p, w = st.w;
  if (q < 1) { const tg = q * st.L; let k = 1; while (k < st.len.length - 1 && st.len[k] < tg) k++; const a = st.len[k - 1], b = st.len[k], u = b > a ? (tg - a) / (b - a) : 1; p = st.p.slice(0, k); w = st.w.slice(0, k); p.push([lerp(st.p[k - 1][0], st.p[k][0], u), lerp(st.p[k - 1][1], st.p[k][1], u)]); w.push(lerp(st.w[k - 1], st.w[k], u) * .6); }
  const n = p.length, Lp = new Array(n), Rp = new Array(n);
  for (let i = 0; i < n; i++) { const a = p[Math.max(0, i - 1)], b = p[Math.min(n - 1, i + 1)]; let tx = b[0] - a[0], ty = b[1] - a[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l; const h = w[i] * .5; Lp[i] = [p[i][0] - ty * h, p[i][1] + tx * h]; Rp[i] = [p[i][0] + ty * h, p[i][1] - tx * h]; }
  g.moveTo(Lp[0][0], Lp[0][1]); for (let i = 1; i < n; i++) g.lineTo(Lp[i][0], Lp[i][1]); for (let i = n - 1; i >= 0; i--) g.lineTo(Rp[i][0], Rp[i][1]); g.closePath();
}
const swell = u => .22 + .78 * Math.pow(Math.sin(Math.PI * clamp(u)), .7);

/** a free line (stalk, whisker, leader): points + base width, swelling and tapering. */
export function lineStroke(pts, w = 3, o = {}) { const n = pts.length, ws = pts.map((_, i) => w * (o.prof ? o.prof(i / (n - 1)) : swell(i / (n - 1)))); return mkStroke(pts, ws); }

// ---------- hatching ----------
const FAM_THR = [.1, .42, .7], FAM_W = [.4, .3, .22];
function hatchFamily(poly, tone, ang, sp, fam, wscale) {
  const d = [Math.cos(ang), Math.sin(ang)], nrm = [-d[1], d[0]], out = [];
  let lo = 1e9, hi = -1e9; for (const [x, y] of poly) { const c = x * nrm[0] + y * nrm[1]; lo = Math.min(lo, c); hi = Math.max(hi, c); }
  const thr = FAM_THR[fam], wmax = sp * FAM_W[fam] * wscale;
  for (let c = lo + sp * (.35 + .2 * fam); c < hi; c += sp) {
    const ts = [];
    for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length], ca = a[0] * nrm[0] + a[1] * nrm[1] - c, cb = b[0] * nrm[0] + b[1] * nrm[1] - c; if ((ca < 0) !== (cb < 0)) { const u = ca / (ca - cb), x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u); ts.push(x * d[0] + y * d[1]); } }
    ts.sort((a, b) => a - b);
    for (let k = 0; k + 1 < ts.length; k += 2) {
      const t0 = ts[k] + 1.2, t1 = ts[k + 1] - 1.2; if (t1 - t0 < 3) continue;
      const step = 4, m = Math.max(2, Math.ceil((t1 - t0) / step)), pts = [], ws = [];
      for (let i = 0; i <= m; i++) { const t = lerp(t0, t1, i / m), x = c * nrm[0] + t * d[0], y = c * nrm[1] + t * d[1], tn = tone(x, y); pts.push([x, y]); ws.push(wmax * Math.pow(clamp((tn - thr) / (1 - thr)), .75)); }
      let s0 = -1;
      for (let i = 0; i <= m + 1; i++) {
        const on = i <= m && ws[i] > .22;
        if (on && s0 < 0) s0 = i;
        if (!on && s0 >= 0) { if (i - s0 >= 2) { const pp = pts.slice(s0, i), n = pp.length, ww = ws.slice(s0, i).map((w, j) => w * (.3 + .7 * Math.pow(Math.sin(Math.PI * (j + .5) / n), .6))); out.push(mkStroke(pp, ww)); } s0 = -1; }
      }
    }
  }
  return out;
}

/** a part: polygon + tone field -> outline runs + up to 3 hatch families. */
export function part(o) {
  const poly = o.poly, sp = o.sp ?? 7, tone = o.tone ?? flat(.4), ang = o.ang ?? -.6, nf = o.fam ?? 2, ow = o.ow ?? 1;
  const P = { poly, knock: o.knock !== false, outline: [], fam: [], win: o.win ?? [0, 1], fw: o.fw ?? [[.15, .6], [.45, .85], [.7, 1]], oa: o.oa ?? .3, fillDelay: o.fillDelay ?? 0 };
  if (o.outline !== false) {
    const sgn = area(poly) > 0 ? 1 : -1, n = poly.length, runs = o.runs ?? 3, per = Math.ceil(n / runs);
    for (let r = 0; r < runs; r++) {
      const pts = [], ws = [];
      for (let i = 0; i <= per + 2; i++) {
        const k = (r * per + i - 1 + n) % n, a = poly[(k - 1 + n) % n], b = poly[(k + 1) % n], p = poly[k];
        let tx = b[0] - a[0], ty = b[1] - a[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l; const nx = ty * sgn, ny = -tx * sgn; // outward
        const shade = clamp((nx * -LX + ny * -LY) * .5 + .5);
        pts.push(p); ws.push((o.w ?? 3.2) * ow * (.55 + .95 * shade) * swell((i) / (per + 2)));
      }
      P.outline.push(mkStroke(pts, ws));
    }
  }
  const angs = [ang, ang + 1.05, ang - .55];
  for (let f = 0; f < nf; f++) P.fam.push(hatchFamily(poly, tone, angs[f], sp * (1 + .12 * f), f, o.wscale ?? 1));
  if (o.extra) P.extra = o.extra; // free strokes (veins etc.) drawn with the outline
  P.bb = bboxOf(poly);
  return P;
}
/** free-line part (no polygon): strokes only, e.g. legs, antennae, veins. */
export function linesPart(strokes, o = {}) { const all = bboxOf(strokes.flatMap(s => s.p)); return { poly: null, knock: false, outline: strokes, fam: [], win: o.win ?? [0, 1], fw: [], oa: 1, bb: all }; }

export function figure(parts, o = {}) { return { parts, bb: parts.reduce((b, p) => { const q = p.bb; return b ? [Math.min(b[0], q[0]), Math.min(b[1], q[1]), Math.max(b[2], q[2]), Math.max(b[3], q[3])] : q.slice(); }, null), cache: null, x: 0, y: 0, ...o }; }

// ---------- engine ----------
export function createEngraver(canvas) {
  canvas.width = W; canvas.height = H; canvas.style.width = '540px'; canvas.style.height = '960px';
  const g = canvas.getContext('2d'), tile = makePaperTile(), pat = g.createPattern(tile, 'repeat');
  const E = { g, W, H, t: 0, cam: { s: 1, cx: 540, cy: 960 } };
  const anchor = () => { try { pat.setTransform(g.getTransform().inverse()); } catch (e) {} };
  E.begin = t => { E.t = t; pat.setTransform(new DOMMatrix()); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.fillStyle = pat; g.fillRect(0, 0, W, H); };
  E.setCam = c => { E.cam = c; g.setTransform(c.s, 0, 0, c.s, 540 - c.s * c.cx, 960 - c.s * c.cy); };
  E.screen = () => g.setTransform(1, 0, 0, 1, 0, 0);
  E.pattern = pat;
  E.vignette = () => { E.screen(); const gr = g.createRadialGradient(540, 960, 520, 540, 960, 1250); gr.addColorStop(0, 'rgba(120,80,30,0)'); gr.addColorStop(1, 'rgba(120,80,30,.16)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); };

  function drawPartLive(P, p) {
    if (p <= 0) return;
    if (P.knock && P.poly) { anchor(); g.fillStyle = pat; g.beginPath(); P.poly.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill(); }
    g.fillStyle = INK; g.beginPath();
    const oq = clamp(p / P.oa); for (const s of P.outline) addRibbon(g, s, eo(oq));
    for (let f = 0; f < P.fam.length; f++) {
      const [a, b] = P.fw[f], strokes = P.fam[f], n = strokes.length, dur = .32 * (b - a);
      for (let i = 0; i < n; i++) { const s0 = a + (b - a) * .68 * (i / Math.max(1, n - 1)); addRibbon(g, strokes[i], clamp((p - s0) / dur)); }
    }
    g.fill();
  }
  function cacheOf(F) {
    if (F.cache) return F.cache; const CS = 2, [x0, y0, x1, y1] = F.bb, pad = 14, w = Math.ceil((x1 - x0 + pad * 2) * CS), h = Math.ceil((y1 - y0 + pad * 2) * CS);
    const c = document.createElement('canvas'); c.width = w; c.height = h; const cg = c.getContext('2d'); cg.scale(CS, CS); cg.translate(-x0 + pad, -y0 + pad);
    for (const P of F.parts) {
      if (P.knock && P.poly) { cg.globalCompositeOperation = 'destination-out'; cg.beginPath(); P.poly.forEach(([x, y], i) => i ? cg.lineTo(x, y) : cg.moveTo(x, y)); cg.closePath(); cg.fill(); }
      cg.globalCompositeOperation = 'source-over'; cg.fillStyle = INK; cg.beginPath();
      for (const s of P.outline) addRibbon(cg, s, 1); for (const fam of P.fam) for (const s of fam) addRibbon(cg, s, 1); cg.fill();
    }
    F.cache = { c, x: x0 - pad, y: y0 - pad, w: w / CS, h: h / CS }; return F.cache;
  }
  /** draw a figure at progress p (0..1). opts: alpha, dx, dy, s (scale about its bbox centre) */
  E.fig = (F, p, o = {}) => {
    if (p <= 0) return;
    g.save(); const [x0, y0, x1, y1] = F.bb, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    if (o.dx || o.dy) g.translate(o.dx || 0, o.dy || 0);
    if (o.s && o.s !== 1) { g.translate(cx, cy); g.scale(o.s, o.s); g.translate(-cx, -cy); }
    if (o.rot) { g.translate(cx, cy); g.rotate(o.rot); g.translate(-cx, -cy); }
    if (o.alpha !== undefined) g.globalAlpha = o.alpha;
    if (p >= 1) {
      // knock-out of everything beneath, then the baked ink
      anchor(); g.fillStyle = pat; g.beginPath(); for (const P of F.parts) if (P.knock && P.poly) { P.poly.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); } g.fill();
      const C = cacheOf(F); g.drawImage(C.c, C.x, C.y, C.w, C.h);
    } else {
      const n = F.parts.length; for (let i = 0; i < n; i++) { const P = F.parts[i], [a, b] = P.win; drawPartLive(P, seg(p, a, b)); }
    }
    g.restore();
  };

  // ---------- wash (hand colour laid after, multiply, blooming from a point) ----------
  E.wash = (poly, col, prog, o = {}) => {
    if (prog <= 0) return;
    const [x0, y0, x1, y1] = bboxOf(poly), ox = o.ox ?? (x0 + x1) / 2, oy = o.oy ?? (y0 + y1) / 2, R = Math.hypot(Math.max(ox - x0, x1 - ox), Math.max(oy - y0, y1 - oy)) * 1.15;
    g.save(); g.globalCompositeOperation = 'multiply'; g.translate(o.mx ?? 2.5, o.my ?? 1.8);
    g.beginPath(); poly.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.clip();
    const r = R * eo(prog), a = o.a ?? .5, gr = g.createRadialGradient(ox, oy, r * .1, ox, oy, r * 1.02);
    gr.addColorStop(0, rgba(col, a * .8)); gr.addColorStop(.8, rgba(col, a)); gr.addColorStop(1, rgba(col, a * .55));
    g.fillStyle = gr; g.fillRect(x0 - 40, y0 - 40, x1 - x0 + 80, y1 - y0 + 80);
    g.strokeStyle = rgba(col, .38 * (o.rim ?? 1)); g.lineWidth = 7; g.lineJoin = 'round'; g.beginPath(); poly.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.stroke();
    g.restore();
  };

  // ---------- text ----------
  E.text = (s, x, y, o = {}) => {
    const { size = 44, weight = 600, style = 'normal', family = 'Bodoni Moda', col = INK, reveal = 1, track = 0, align = 'center', a = 1, spans = null } = o;
    if (reveal <= 0) return; g.save(); g.font = `${style} ${weight} ${size}px "${family}"`; g.textBaseline = 'alphabetic'; g.fillStyle = col; g.globalAlpha = a;
    const ws = [...s].map(ch => g.measureText(ch).width + track), tot = ws.reduce((p, c) => p + c, 0); let cx = align === 'center' ? x - tot / 2 : x; const nshow = reveal * s.length;
    for (let i = 0; i < s.length; i++) { if (i >= nshow) break; const f = clamp(nshow - i); g.save(); if (f < 1) { g.beginPath(); g.rect(cx - 2, y - size * 1.1, ws[i] * f + 2, size * 1.5); g.clip(); } if (spans && spans[i]) g.fillStyle = spans[i]; g.fillText(s[i], cx, y); g.restore(); cx += ws[i]; }
    g.restore(); return tot;
  };
  /** script written left to right in one stroke */
  E.script = (s, x, y, o = {}) => {
    const { size = 46, col = INK, reveal = 1, align = 'center', a = 1, rot = 0 } = o; if (reveal <= 0) return;
    g.save(); g.font = `${size}px "Pinyon Script"`; const w = g.measureText(s).width, x0 = align === 'center' ? x - w / 2 : x;
    g.translate(x, y); g.rotate(rot); g.translate(-x, -y); g.beginPath(); g.rect(x0 - 6, y - size * 1.2, (w + 12) * eo(reveal), size * 1.8); g.clip(); g.fillStyle = col; g.globalAlpha = a; g.fillText(s, x0, y); g.restore(); return w;
  };
  E.measure = (s, size, family = 'Bodoni Moda', weight = 600, style = 'normal') => { g.save(); g.font = `${style} ${weight} ${size}px "${family}"`; const w = g.measureText(s).width; g.restore(); return w; };

  // ---------- plate furniture ----------
  E.plate = (prog, box = [56, 70, 1024, 1540]) => {
    if (prog <= 0) return; const [x0, y0, x1, y1] = box, rr = rect(x0, y0, x1 - x0, y1 - y0, 10);
    g.save();
    // pressed bevel: soft shadow inside, light outside
    g.strokeStyle = 'rgba(90,60,25,.20)'; g.lineWidth = 8; g.strokeRect(x0 - 5, y0 - 5, x1 - x0 + 10, y1 - y0 + 10);
    g.strokeStyle = 'rgba(255,252,240,.7)'; g.lineWidth = 3; g.strokeRect(x0 - 9, y0 - 9, x1 - x0 + 18, y1 - y0 + 18);
    g.fillStyle = 'rgba(255,250,235,.22)'; g.fillRect(x0, y0, x1 - x0, y1 - y0);
    g.fillStyle = INK; g.beginPath();
    const ins = (d, w, q) => { const A = [x0 + d, y0 + d, x1 - d, y1 - d], per = 2 * (A[2] - A[0] + A[3] - A[1]), lim = per * q; const pts = [[A[0], A[1]], [A[2], A[1]], [A[2], A[3]], [A[0], A[3]], [A[0], A[1]]]; let acc = 0; const sub = [pts[0]]; for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (acc + l <= lim) { sub.push(pts[i]); acc += l; } else { const u = (lim - acc) / l; sub.push([lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)]); break; } } if (sub.length > 1) addRibbon(g, mkStroke(sub, sub.map(() => w)), 1); };
    ins(16, 3.6, eo(prog)); ins(26, 1.3, eo(seg(prog, .1, 1))); g.fill(); g.restore();
  };
  // double-ruled roundel: ring sweeps, ruled ground, halo; content drawn by fn(g) afterwards
  E.roundel = (cx, cy, r, prog, content, o = {}) => {
    if (prog <= 0) return; g.save(); const k = o.k ?? 1; g.translate(cx, cy); g.scale(k, k); g.translate(-cx, -cy);
    const ring = clamp(prog / .5);
    anchor(); g.fillStyle = pat; g.beginPath(); g.arc(cx, cy, r + 14, 0, 6.3); g.fill();
    g.strokeStyle = INK; g.lineCap = 'round'; g.lineWidth = 4.2; g.beginPath(); g.arc(cx, cy, r, -1.57, -1.57 + 6.283 * eo(ring)); g.stroke();
    g.lineWidth = 1.4; g.beginPath(); g.arc(cx, cy, r - 9, -1.57, -1.57 + 6.283 * eo(ring)); g.stroke();
    const gp = seg(prog, .35, 1);
    if (gp > 0) {
      g.save(); g.beginPath(); g.arc(cx, cy, r - 12, 0, 6.3); g.clip(); g.globalAlpha = .85 * gp; g.strokeStyle = 'rgba(28,21,16,.5)'; g.lineWidth = 1;
      for (let y = cy - r; y < cy + r; y += 5.2) { g.beginPath(); g.moveTo(cx - r, y); g.lineTo(cx + r, y); g.stroke(); }
      g.globalAlpha = gp; anchor(); g.fillStyle = pat; g.beginPath(); g.arc(cx, cy, (r - 12) * .78, 0, 6.3); g.fill();
      g.strokeStyle = 'rgba(28,21,16,.0)'; if (content) content(g, gp); g.restore();
    }
    g.restore();
  };
  // leader: hairline from a dot on the part to a label point, with a small figure number
  E.leader = (pts, prog, o = {}) => {
    if (prog <= 0) return; g.save(); g.strokeStyle = INK; g.fillStyle = INK; g.lineWidth = o.w ?? 1.8; g.lineJoin = 'round'; g.lineCap = 'round';
    const st = mkStroke(pts, pts.map(() => 1)), tg = st.L * eo(prog); g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); let acc = 0;
    for (let i = 1; i < pts.length; i++) { const l = st.len[i] - st.len[i - 1]; if (acc + l <= tg) { g.lineTo(pts[i][0], pts[i][1]); acc += l; } else { const u = (tg - acc) / l; g.lineTo(lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)); break; } }
    g.stroke(); g.beginPath(); g.arc(pts[0][0], pts[0][1], 5 * backOut(seg(prog, 0, .15)), 0, 6.3); g.fillStyle = PAPER; g.fill(); g.lineWidth = 2; g.stroke(); g.beginPath(); g.arc(pts[0][0], pts[0][1], 1.8, 0, 6.3); g.fillStyle = INK; g.fill(); g.restore();
  };
  // a small cut-lettered label with a ruled underline
  E.label = (s, x, y, prog, o = {}) => {
    if (prog <= 0) return; const size = o.size ?? 30; E.text(s, x, y, { size, weight: 600, track: 2.2, reveal: seg(prog, 0, .9), align: o.align ?? 'center', col: o.col ?? INK });
    const w = E.measure(s, size) + s.length * 2.2; const ax = (o.align ?? 'center') === 'center' ? x - w / 2 : x; g.save(); g.strokeStyle = INK; g.lineWidth = 1.4; g.beginPath(); g.moveTo(ax, y + 9); g.lineTo(ax + w * eo(seg(prog, .3, 1)), y + 9); g.stroke(); g.restore();
  };
  // deckled subtitle slip, screen space. line: string with **bold** spans.
  E.slip = (line, reveal = 1) => {
    if (!line) return; E.screen(); const parts = []; line.split('**').forEach((s, i) => { if (s) parts.push([s, i % 2 === 1]); });
    const plain = parts.map(p => p[0]).join(''), size = 41; g.save(); g.font = `italic 500 ${size}px "Bodoni Moda"`;
    // wrap to <= 880px
    const words = []; parts.forEach(([s, b]) => s.split(/(\s+)/).forEach(w => { if (w) words.push([w, b]); }));
    const lines = [[]]; let lw = 0; for (const [w, b] of words) { g.font = `${b ? 'italic 700' : 'italic 500'} ${size}px "Bodoni Moda"`; const ww = g.measureText(w).width; if (lw + ww > 860 && !/^\s+$/.test(w) && lines[lines.length - 1].length) { lines.push([]); lw = 0; } if (!(lines[lines.length - 1].length === 0 && /^\s+$/.test(w))) { lines[lines.length - 1].push([w, b, ww]); lw += ww; } }
    const hh = lines.length * 56 + 44, cy = 1632, y0 = cy - hh / 2, x0 = 88, x1 = W - 88;
    g.shadowColor = 'rgba(70,45,15,.28)'; g.shadowBlur = 14; g.shadowOffsetY = 5; g.fillStyle = '#f8f0dd'; g.beginPath(); const n = 40;
    for (let i = 0; i <= n; i++) g.lineTo(lerp(x0, x1, i / n), y0 + (hash(i * 3.3 + 1) - .5) * 5); for (let i = 0; i <= 6; i++) g.lineTo(x1 + (hash(i * 7.1) - .5) * 5, lerp(y0, y0 + hh, i / 6));
    for (let i = n; i >= 0; i--) g.lineTo(lerp(x0, x1, i / n), y0 + hh + (hash(i * 5.9 + 9) - .5) * 5); for (let i = 6; i >= 0; i--) g.lineTo(x0 + (hash(i * 2.9 + 4) - .5) * 5, lerp(y0, y0 + hh, i / 6));
    g.closePath(); g.fill(); g.shadowColor = 'transparent'; g.strokeStyle = 'rgba(90,60,25,.25)'; g.lineWidth = 1.5; g.stroke();
    let shown = reveal * plain.length; g.textBaseline = 'alphabetic';
    lines.forEach((ln, li) => { const tw = ln.reduce((p, c) => p + c[2], 0); let x = W / 2 - tw / 2; const y = y0 + 22 + 42 + li * 56 - 8; for (const [w, b, ww] of ln) { if (shown <= 0) break; g.font = `${b ? 'italic 700' : 'italic 500'} ${size}px "Bodoni Moda"`; g.fillStyle = b ? '#8a4a10' : INK; const f = clamp(shown / w.length); g.save(); if (f < 1) { g.beginPath(); g.rect(x - 2, y - size, ww * f + 3, size * 1.5); g.clip(); } g.fillText(w, x, y); g.restore(); shown -= w.length; x += ww; } });
    g.restore();
  };
  return E;
}
