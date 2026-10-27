// inkwash.js: vertical (1080x1920) xieyi ink-painting kit. Our own 2D-canvas implementation of the ink-wash grammar
// (five ink tones, loaded strokes, wet bleed, flying white, blank paper, one vermilion seal). No Lemo code or assets.
export const W = 1080, H = 1920;
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, u) => a + (b - a) * u;
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export const ss = u => { u = clamp(u); return u * u * (3 - 2 * u); };
export const eo = u => 1 - Math.pow(1 - clamp(u), 3);
export const eio = u => { u = clamp(u); return u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; };
export const backOut = u => { u = clamp(u); const c = 1.70158; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
export function ih(n) { n = Math.imul((n | 0) ^ 61, 0x45d9f3b); n = Math.imul(n ^ (n >>> 15), 0x45d9f3b); n = n ^ (n >>> 16); return (n >>> 0) / 4294967296; }
export const hash = n => ih(Math.floor(n * 977) + 13);
export function vn(x, s = 0) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(ih(i * 7919 + s * 131), ih((i + 1) * 7919 + s * 131), u); }
export const TONE = { jiao: .96, nong: .82, zhong: .6, dan: .34, qing: .16 };
export const INK = [38, 34, 33], PAPER = '#f2ecde', VERM = '#b02e22';
const ink = a => `rgba(38,34,33,${clamp(a, 0, 1).toFixed(3)})`;

export function ellipsePoly(cx, cy, rx, ry, n = 18, jit = .08, seed = 1) { const o = []; for (let i = 0; i < n; i++) { const a = i / n * 6.2832, k = 1 + (hash(seed * 3.7 + i * 1.3) - .5) * jit * 2; o.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); } return o; }
function catmull(pts, step = 7) { if (pts.length < 3) return pts.slice(); const o = []; for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)]; const d = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]), n = Math.max(2, Math.ceil(d / step)); for (let k = 0; k < n; k++) { const u = k / n, u2 = u * u, u3 = u2 * u; o.push([.5 * (2 * p1[0] + (-p0[0] + p2[0]) * u + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * u2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * u3), .5 * (2 * p1[1] + (-p0[1] + p2[1]) * u + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * u2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * u3)]); } } o.push(pts[pts.length - 1]); return o; }

export function createInk(canvas) {
  canvas.width = W; canvas.height = H; canvas.style.width = '540px'; canvas.style.height = '960px';
  const main = canvas.getContext('2d', { willReadFrequently: false });
  const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
  const paper = mk(), wetC = mk(), dryC = mk(), tmp = mk();
  const wet = wetC.getContext('2d'), dry = dryC.getContext('2d'), tg = tmp.getContext('2d');
  // ---- rice paper (procedural, once) ----
  (function () {
    const p = paper.getContext('2d'); p.fillStyle = PAPER; p.fillRect(0, 0, W, H);
    const lo = document.createElement('canvas'); lo.width = 54; lo.height = 96; const lg = lo.getContext('2d'), id = lg.createImageData(54, 96);
    for (let i = 0; i < 54 * 96; i++) { const v = 238 + (ih(i * 3 + 1) - .5) * 14; id.data[i * 4] = v; id.data[i * 4 + 1] = v - 4; id.data[i * 4 + 2] = v - 14; id.data[i * 4 + 3] = 255; }
    lg.putImageData(id, 0, 0); p.globalAlpha = .2; p.globalCompositeOperation = 'multiply'; p.imageSmoothingEnabled = true; p.drawImage(lo, 0, 0, W, H);
    p.globalAlpha = 1; p.lineCap = 'round';
    for (let i = 0; i < 1100; i++) { const x = ih(i * 5 + 1) * W, y = ih(i * 5 + 2) * H, a = ih(i * 5 + 3) * 6.28, l = 20 + ih(i * 5 + 4) * 70; p.strokeStyle = `rgba(150,130,100,${.03 + ih(i * 11) * .05})`; p.lineWidth = .8 + ih(i * 13) * .9; p.beginPath(); p.moveTo(x, y); p.quadraticCurveTo(x + Math.cos(a + .5) * l * .5, y + Math.sin(a + .5) * l * .5, x + Math.cos(a) * l, y + Math.sin(a) * l); p.stroke(); }
    for (let i = 0; i < 260; i++) { p.fillStyle = `rgba(120,100,80,${.05 + ih(i * 17) * .08})`; p.beginPath(); p.arc(ih(i * 3 + 5) * W, ih(i * 3 + 6) * H, .8 + ih(i * 19) * 1.8, 0, 6.3); p.fill(); }
    p.globalCompositeOperation = 'source-over'; const v = p.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * .75); v.addColorStop(0, 'rgba(120,90,50,0)'); v.addColorStop(1, 'rgba(120,90,50,.16)'); p.fillStyle = v; p.fillRect(0, 0, W, H);
  })();
  const R = { W, H, g: main, wet, dry, paper };
  let cam = { s: 1, cx: W / 2, cy: H / 2 };
  R.begin = (t, c) => {
    cam = c || { s: 1, cx: W / 2, cy: H / 2 };
    for (const g of [wet, dry]) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, W, H); g.setTransform(cam.s, 0, 0, cam.s, W / 2 - cam.s * cam.cx, H / 2 - cam.s * cam.cy); g.lineCap = 'round'; g.lineJoin = 'round'; }
    main.setTransform(1, 0, 0, 1, 0, 0); main.globalCompositeOperation = 'source-over'; main.globalAlpha = 1; main.filter = 'none'; main.drawImage(paper, 0, 0);
  };
  R.finish = () => { // wet bleeds (blur + edge accumulation), dry stays sharp; both multiplied onto paper
    main.globalCompositeOperation = 'multiply';
    main.filter = 'blur(7px)'; main.globalAlpha = .62; main.drawImage(wetC, 0, 0);
    main.filter = 'blur(1.6px)'; main.globalAlpha = .55; main.drawImage(wetC, 0, 0);
    main.filter = 'blur(.6px)'; main.globalAlpha = 1; main.drawImage(dryC, 0, 0);
    main.filter = 'none'; main.globalCompositeOperation = 'source-over'; main.globalAlpha = 1;
  };
  // ---- brush stroke: ribbon + bristles with flying white ----
  // pts world coords; w width; tone alpha; dry 0 solid .. 1 flying white; prog draws along its length; prof pressure profile
  R.stroke = (L, pts, o = {}) => {
    const { w = 24, tone = TONE.nong, dry: dr = .25, seed = 1, prog = 1, prof, load = true } = o; if (prog <= 0) return;
    const cl = catmull(pts, 6), n = cl.length; if (n < 2) return; const len = [0]; for (let i = 1; i < n; i++) len.push(len[i - 1] + Math.hypot(cl[i][0] - cl[i - 1][0], cl[i][1] - cl[i - 1][1])); const tot = len[n - 1], endI = Math.max(2, Math.floor(n * clamp(prog)));
    const pr = u => prof ? prof(u) : Math.sin(Math.PI * Math.min(1, u * 1.15 + .02)) ** .55 * (1 - .25 * u);
    const nrm = i => { const a = cl[Math.max(0, i - 1)], b = cl[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1; return [-dy / d, dx / d]; };
    const col = ink(tone);
    if (dr < .85) { // solid body
      L.save(); L.fillStyle = ink(tone * (1 - dr) * .78); L.beginPath(); const L1 = [], L2 = [];
      for (let i = 0; i < endI; i++) { const u = len[i] / tot, ww = w * pr(u) * .5 * (.88 + .24 * vn(len[i] / 60, seed)), [nx, ny] = nrm(i); L1.push([cl[i][0] + nx * ww, cl[i][1] + ny * ww]); L2.push([cl[i][0] - nx * ww, cl[i][1] - ny * ww]); }
      L1.forEach((p, i) => i ? L.lineTo(p[0], p[1]) : L.moveTo(p[0], p[1])); for (let i = L2.length - 1; i >= 0; i--) L.lineTo(L2[i][0], L2[i][1]); L.closePath(); L.fill(); L.restore();
    }
    const nb = Math.max(5, Math.round(w / 2.6)); L.save(); L.lineCap = 'round';
    for (let b = 0; b < nb; b++) { const off = (b / (nb - 1) - .5) * 2, side = load ? (.55 + .45 * Math.max(0, off)) : 1, bs = seed * 101 + b * 17;
      let on = false; L.beginPath();
      for (let i = 0; i < endI; i++) { const u = len[i] / tot, ww = w * pr(u) * .5, [nx, ny] = nrm(i), x = cl[i][0] + nx * ww * off, y = cl[i][1] + ny * ww * off;
        const loadU = 1 - .55 * u * (.5 + dr), gap = vn(len[i] / (14 + 20 * ih(bs)) + bs, 3) > (1 - .14 - .62 * dr) ? false : true; // flying-white breaks
        const a = tone * side * loadU * (.5 + .5 * ih(bs + 3)); if (gap && a > .02) { if (!on) { L.moveTo(x, y); on = true; } else L.lineTo(x, y); } else if (on) { L.strokeStyle = ink(tone * side * .9); L.lineWidth = 1.2 + 2.1 * ih(bs + 1); L.stroke(); L.beginPath(); on = false; } }
      if (on) { L.strokeStyle = ink(tone * side * .85); L.lineWidth = 1.2 + 2.1 * ih(bs + 1); L.stroke(); } }
    L.restore();
  };
  // ---- wet wash (soft polygon, jittered passes, blooms, pooled edge) ----
  R.wash = (L, poly, o = {}) => {
    const { tone = TONE.dan, seed = 1, blooms = 4, alpha = 1, grad } = o; if (alpha <= 0) return;
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; poly.forEach(p => { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); });
    const path = (dx = 0, dy = 0) => { L.beginPath(); poly.forEach((p, i) => i ? L.lineTo(p[0] + dx, p[1] + dy) : L.moveTo(p[0] + dx, p[1] + dy)); L.closePath(); };
    L.save(); L.globalAlpha = alpha;
    for (let k = 0; k < 3; k++) { path((hash(seed + k) - .5) * 8, (hash(seed + k + 9) - .5) * 8); if (grad) { const g = L.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, ink(tone * grad[0] * .42)); g.addColorStop(1, ink(tone * grad[1] * .42)); L.fillStyle = g; } else L.fillStyle = ink(tone * .42); L.fill(); }
    L.save(); path(); L.clip(); for (let b = 0; b < blooms; b++) { const bx = lerp(x0, x1, hash(seed * 7 + b)), by = lerp(y0, y1, hash(seed * 7 + b + 40)), br = (x1 - x0) * (.12 + .22 * hash(seed + b * 3)); const g = L.createRadialGradient(bx, by, 0, bx, by, br); const dk = hash(seed + b * 5) > .5; g.addColorStop(0, ink(tone * (dk ? .30 : -0) * 1)); g.addColorStop(1, ink(0)); if (dk) { L.fillStyle = g; L.fillRect(bx - br, by - br, br * 2, br * 2); } }
    L.restore(); path(); L.strokeStyle = ink(tone * .55); L.lineWidth = 3.5; L.stroke(); L.restore();
  };
  R.dot = (L, x, y, r, tone = TONE.nong) => { L.fillStyle = ink(tone); L.beginPath(); L.arc(x, y, r, 0, 6.3); L.fill(); };
  R.ring = (L, x, y, r, tone = TONE.zhong, lw = 3, a0 = 0, a1 = 6.2832) => { L.strokeStyle = ink(tone); L.lineWidth = lw; L.beginPath(); L.arc(x, y, r, a0, a1); L.stroke(); };
  // soft mist band (blank-paper atmosphere): overlapping wide ellipses, pale
  R.mist = (L, y, h, o = {}) => { const { tone = TONE.qing, seed = 1, a = 1, x0 = -100, x1 = W + 100 } = o; L.save(); L.globalAlpha = a; for (let i = 0; i < 6; i++) { const cx = lerp(x0, x1, (i + hash(seed + i) * .6) / 6), rx = (x1 - x0) / 4 * (.8 + hash(seed + i * 3) * .6); const g = L.createRadialGradient(cx, y, 0, cx, y, rx); g.addColorStop(0, ink(tone * .55)); g.addColorStop(.45, ink(tone * .3)); g.addColorStop(.8, ink(tone * .06)); g.addColorStop(1, ink(0)); L.fillStyle = g; L.save(); L.translate(cx, y); L.scale(1, h / rx); L.translate(-cx, -y); L.fillRect(cx - rx, y - rx, rx * 2, rx * 2); L.restore(); } L.restore(); };
  // distant mountains that dissolve into mist
  R.mountain = (L, x0, x1, base, peak, o = {}) => { const { tone = TONE.dan, seed = 1, moss = false, alpha = 1, edge = true } = o; const pts = [[x0, base]]; const n = 9; for (let i = 0; i <= n; i++) { const u = i / n, hh = Math.sin(Math.PI * u) ** 1.3 * (1 + (hash(seed + i) - .5) * .45); pts.push([lerp(x0, x1, u), base - (base - peak) * hh]); } pts.push([x1, base]); R.wash(L, catmull(pts, 18), { tone, seed, blooms: 3, alpha, grad: [1, .02] });
    if (edge) R.stroke(L, pts.slice(1, -1).map((p, i) => [p[0], p[1] + (hash(seed + i * 2) - .5) * 6]), { w: 12, tone: tone * .9 * alpha, dry: .55, seed: seed + 9, prof: () => 1, load: false });
    if (moss) for (let i = 0; i < 26; i++) { const u = hash(seed + i * 5), ym = peak + (base - peak) * (.25 + .4 * hash(seed + i * 7)); R.dot(L, lerp(x0, x1, u), ym + 20, 2.4, TONE.nong * alpha); } };
  // parallel wave lines (Song-dynasty water), animated phase
  R.waves = (L, y0, rows, o = {}) => { const { x0 = -40, x1 = W + 40, t = 0, tone = TONE.zhong, amp = 14, seed = 1, gap = 34, a = 1 } = o; for (let r = 0; r < rows; r++) { const y = y0 + r * gap * (1 + r * .05), pts = []; for (let x = x0; x <= x1; x += 60) pts.push([x, y + Math.sin(x / 90 + r * 1.3 + t * 1.2) * amp * (1 - r * .06) + (hash(seed + r) - .5) * 4]); R.stroke(L, pts, { w: 5 + r * .5, tone: tone * a * (1 - r * .07), dry: .7, seed: seed + r, prof: () => 1, load: false }); } };
  // ---- the cute little ink raindrop "Drip" (character) ----
  R.drop = (L, x, y, s, o = {}) => { const { mood = 'smile', t = 0, tone = TONE.dan, look = 0, blink = true, tilt = 0, sq = 1 } = o; if (s <= 0) return;
    L.save(); L.translate(x, y); L.rotate(tilt); L.scale(s * (2 - sq) ** .35, s * sq); const r = 60;
    const bodyP = []; for (let i = 0; i <= 36; i++) { const a = i / 36 * 6.2832; const ca = Math.cos(a), sa = Math.sin(a); const tipk = sa < 0 ? 1 + 1.35 * Math.pow(Math.max(0, -sa), 2.4) * (1 - Math.abs(ca)) ** .5 : 1; bodyP.push([ca * r * (sa < 0 ? 1 - .72 * Math.pow(-sa, 3) : 1), sa < 0 ? sa * r * (1 + .62 * -sa) * 1.18 : sa * r]); }
    L.save(); L.setTransform(L.getTransform()); L.restore();
    R._poly(L, bodyP, tone, 7);
    // loaded left edge + highlight (paper left)
    L.strokeStyle = ink(TONE.nong); L.lineWidth = 5; L.lineCap = 'round'; L.beginPath(); for (let i = 18; i <= 31; i++) { const p = bodyP[i % 37]; i === 18 ? L.moveTo(p[0] * .96, p[1] * .96) : L.lineTo(p[0] * .96, p[1] * .96); } L.stroke();
    // face
    const bl = blink && (Math.floor(t * 1.3) % 5 === 3) && (t * 1.3 % 1 < .12);
    if (mood === 'awe') { R.dot(L, -20 + look * 5, 12, 8.5, TONE.jiao); R.dot(L, 20 + look * 5, 12, 8.5, TONE.jiao); L.fillStyle = 'rgba(255,255,255,.0)'; L.strokeStyle = ink(TONE.jiao); L.lineWidth = 4; L.beginPath(); L.ellipse(0, 36, 8, 10, 0, 0, 6.3); L.stroke(); }
    else { if (bl) { L.strokeStyle = ink(TONE.jiao); L.lineWidth = 4.5; L.beginPath(); L.moveTo(-28, 14); L.lineTo(-12, 14); L.moveTo(12, 14); L.lineTo(28, 14); L.stroke(); } else { R.dot(L, -20 + look * 5, 12, 7.5, TONE.jiao); R.dot(L, 20 + look * 5, 12, 7.5, TONE.jiao); }
      L.strokeStyle = ink(TONE.jiao); L.lineWidth = 4.5; L.beginPath(); if (mood === 'worry') { L.arc(0, 44, 11, 3.5, 5.9); } else if (mood === 'smile') L.arc(0, 28, 15, .35, 2.8); else L.arc(0, 30, 11, .5, 2.6); L.stroke(); }
    L.fillStyle = ink(TONE.qing * 1.5); L.beginPath(); L.ellipse(-36, 30, 9, 6, 0, 0, 6.3); L.ellipse(36, 30, 9, 6, 0, 0, 6.3); L.fill();
    L.restore(); };
  R._poly = (L, poly, tone, lw = 4) => { L.save(); L.beginPath(); poly.forEach((p, i) => i ? L.lineTo(p[0], p[1]) : L.moveTo(p[0], p[1])); L.closePath(); L.fillStyle = ink(tone * .55); L.fill(); L.fillStyle = ink(tone * .3); L.translate(3, 3); L.fill(); L.translate(-3, -3); L.strokeStyle = ink(TONE.zhong); L.lineWidth = lw * .5; L.stroke(); L.restore(); };
  // ---- overlay text (screen space, drawn after finish on the main canvas) ----
  R.measure = (s, size, bold) => { main.font = `italic ${bold ? 700 : 500} ${size}px "Cormorant Garamond"`; return main.measureText(s).width; };
  R.inscribe = (s, x, y, o = {}) => { const { size = 64, reveal = 1, a = 1, bold = true, rot = 0, tone = .9, align = 'center' } = o; if (reveal <= 0 || a <= 0) return; const w = R.measure(s, size, bold); main.save(); main.globalAlpha = clamp(a); main.translate(x, y); main.rotate(rot); main.beginPath(); main.rect(-w / 2 - 40, -size * 1.3, (w + 90) * clamp(reveal), size * 2); main.clip(); main.font = `italic ${bold ? 700 : 500} ${size}px "Cormorant Garamond"`; main.textAlign = 'center'; main.fillStyle = ink(tone); main.fillText(s, 0, 0); main.restore(); };
  R.seal = (x, y, s, a = 1) => { if (a <= 0 || s <= 0) return; main.save(); main.globalAlpha = clamp(a); main.translate(x, y); main.rotate(-.05); main.scale(s, s);
    main.fillStyle = VERM; main.beginPath(); for (let i = 0; i < 28; i++) { const q = i / 28 * 4, e = Math.floor(q), u = q - e, c = [[-50, -50], [50, -50], [50, 50], [-50, 50]], p = c[e], n = c[(e + 1) % 4]; const j = (hash(i + 3) - .5) * 4; const px = lerp(p[0], n[0], u) + j, py = lerp(p[1], n[1], u) + j; i ? main.lineTo(px, py) : main.moveTo(px, py); } main.closePath(); main.fill();
    main.fillStyle = PAPER; main.beginPath(); main.moveTo(0, -30); main.bezierCurveTo(26, 2, 24, 30, 0, 30); main.bezierCurveTo(-24, 30, -26, 2, 0, -30); main.fill(); // negative-space raindrop
    main.fillStyle = VERM; main.beginPath(); main.arc(-8, 12, 4, 0, 6.3); main.arc(8, 12, 4, 0, 6.3); main.fill(); main.restore(); };
  // subtitle as an inscription (题跋): italic serif, ink only, tiny vermilion square starts each caption; bold = heavier ink
  R.subtitle = (cap, reveal, y = 1585) => { if (reveal <= 0) return; const toks = []; cap.split('**').forEach((s, k) => s.split(' ').filter(Boolean).forEach(wd => toks.push({ w: wd, b: k % 2 === 1 })));
    const SZ = 54, wv = tk => R.measure(tk.w + ' ', SZ, tk.b); let tot = 0; toks.forEach(tk => tot += wv(tk)); let lines = [toks];
    if (tot > 900) { let acc = 0, bi = 1, bd = 1e9; for (let k = 0; k < toks.length - 1; k++) { acc += wv(toks[k]); const d = Math.abs(acc - (tot - acc)); if (d < bd) { bd = d; bi = k + 1; } } lines = [toks.slice(0, bi), toks.slice(bi)]; }
    const widths = lines.map(l => l.reduce((a, tk) => a + wv(tk), 0)), maxW = Math.max(...widths);
    main.save(); main.beginPath(); main.rect(W / 2 - maxW / 2 - 60, y - 70, (maxW + 120) * clamp(reveal), 260); main.clip();
    main.fillStyle = VERM; main.fillRect(W / 2 - maxW / 2 - 34, y - 28, 14, 14);
    lines.forEach((l, li) => { let x = W / 2 - widths[li] / 2; const yy = y + li * 60; l.forEach(tk => { main.font = `italic ${tk.b ? 700 : 500} ${SZ}px "Cormorant Garamond"`; main.textAlign = 'left'; main.lineJoin = 'round'; main.strokeStyle = 'rgba(242,236,222,.92)'; main.lineWidth = 10; main.strokeText(tk.w, x, yy); main.fillStyle = ink(tk.b ? .97 : .74); main.fillText(tk.w, x, yy); x += wv(tk); }); });
    main.restore(); };
  return R;
}
