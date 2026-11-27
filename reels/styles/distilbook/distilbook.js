// distilbook.js: vertical 1080x1920 renderer for template #15 "Distilbook Motion Graphics Showreel" (demo 83, awesome-opus-5-5-video-styles case 12,
// x.com/itisRazak/status/2103517930424332386). Grammar copied from the demo frames (reels/fetch_demos.sh 83):
//  - cool off-white studio ground (#f4f5f8 -> pale blue-grey vignette), HUD: three-bar logo + caps label top-left, "BAR nn/nn  88 BPM" top-right,
//    frame counter + SMPTE timecode bottom-right, thin corner brackets.
//  - book serif page (Libre Baskerville) tilted in depth with depth-of-field blur, marker highlights (green / blue / pink) sweeping behind words.
//  - words lift off the page and fly into a hand-drawn diagram: black felt-tip ink (slight wobble), crayon-textured fills (yellow, blue), hatched
//    fills, circle callouts, wavy arrows, handwritten labels (Patrick Hand) with one blue word.
//  - the finished diagram shrinks into a white video-player card (rounded, soft shadow, blue progress bar + knob, "0:17 / 0:54", logo chip)
//    with a karaoke subtitle under it: Inter ExtraBold, spoken words ink, current word blue, coming words grey.
//  - dark navy slides: centred stack of lines rolling upward with blur above/below, big pink counter "06 / 19 ...".
//  - dark dot-grid slide with a huge white number and a pink "+". End card: logo bars + wordmark + grey tagline + blue pill.
// Original code. Fonts: Libre Baskerville, Inter, JetBrains Mono, Patrick Hand (all SIL OFL).
export const W = 1080, H = 1920, TAU = Math.PI * 2;
export const C = { bg: '#f4f5f8', ink: '#1d1f24', grey: '#b9bdc6', mid: '#7b808c', blue: '#3d5fd9', blueL: '#7f9cf0', water: '#6f95e8', sun: '#f7df4a',
  pink: '#f06fa0', pinkL: '#f9b3cf', green: '#86e39a', greenL: '#bff3c9', hlBlue: '#a9c3fb', navy: '#121a2e', navy2: '#1b2440', red: '#ef5b6e' };
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const ramp = (t, t0, d) => clamp((t - t0) / d);
export const ss = u => { u = clamp(u); return u * u * (3 - 2 * u); };
export const eo = u => 1 - Math.pow(1 - clamp(u), 3);
export const ex = u => { u = clamp(u); return u >= 1 ? 1 : 1 - Math.pow(2, -10 * u); };      // expo-out: the demo's snappy moves
export const bo = u => { u = clamp(u); const c = 1.6; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
export const hash = n => { const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };
export const FONTS = ['400 60px "Baskerville"', 'italic 400 60px "BaskervilleI"', '800 60px "Inter"', '600 40px "Inter"', '500 20px "Mono"', '400 40px "Hand"'];

export function createDB(canvas) {
  canvas.width = W; canvas.height = H; const g = canvas.getContext('2d');
  const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
  const L = mk(), lg = L.getContext('2d');                       // scene layer
  const T = mk(), tg = T.getContext('2d');                       // temp
  // ---------- cached grounds ----------
  const light = mk(), l = light.getContext('2d');
  l.fillStyle = C.bg; l.fillRect(0, 0, W, H);
  let rg = l.createRadialGradient(W / 2, H * .42, 200, W / 2, H * .5, 1250); rg.addColorStop(0, 'rgba(255,255,255,.9)'); rg.addColorStop(1, 'rgba(196,204,222,.55)'); l.fillStyle = rg; l.fillRect(0, 0, W, H);
  const dark = mk(), d = dark.getContext('2d');
  d.fillStyle = C.navy; d.fillRect(0, 0, W, H);
  rg = d.createRadialGradient(W / 2, H * .45, 100, W / 2, H * .5, 1200); rg.addColorStop(0, 'rgba(48,62,104,.55)'); rg.addColorStop(1, 'rgba(6,9,20,.7)'); d.fillStyle = rg; d.fillRect(0, 0, W, H);
  const grain = mk(), gr = grain.getContext('2d');                // crayon grain tile used inside fills
  for (let i = 0; i < 26000; i++) { const x = hash(i * 1.37) * W, y = hash(i * 2.11) * H, a = hash(i * 3.3) * .5 + .2; gr.fillStyle = `rgba(255,255,255,${a * .5})`; gr.fillRect(x, y, 2 + hash(i) * 5, 1.4); }

  const D = { g, lg, L, T, tg, C };
  let ctx = lg;                                                   // drawing target for helpers
  D.use = c => { ctx = c; };
  D.ctx = () => ctx;
  D.clearLayer = () => { lg.setTransform(1, 0, 0, 1, 0, 0); lg.clearRect(0, 0, W, H); lg.globalAlpha = 1; lg.filter = 'none'; ctx = lg; };
  D.ground = (k) => { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.filter = 'none'; g.drawImage(light, 0, 0); if (k > 0) { g.globalAlpha = k; g.drawImage(dark, 0, 0); g.globalAlpha = 1; } };

  // ---------- text ----------
  const fam = { serif: 'Baskerville', serifI: 'BaskervilleI', sans: 'Inter', mono: 'Mono', hand: 'Hand' };
  D.font = (f, size, wt = 400) => `${wt} ${size}px "${fam[f] || f}"`;
  D.measure = (s, f, size, wt) => { ctx.font = D.font(f, size, wt); return ctx.measureText(s).width; };
  D.text = (s, x, y, o = {}) => {                                 // o: f,size,wt,col,align,a,track,write(0..1 letters)
    const c = ctx; c.save(); c.font = D.font(o.f || 'sans', o.size || 40, o.wt || 400); c.fillStyle = o.col || C.ink; c.globalAlpha *= (o.a ?? 1);
    c.textAlign = o.align || 'left'; c.textBaseline = o.base || 'alphabetic'; if (o.track) c.letterSpacing = o.track + 'px';
    const n = o.write == null ? s.length : Math.floor(s.length * clamp(o.write)); c.fillText(s.slice(0, n), x, y); c.restore();
  };
  // rich line: segments [{s, col, f, wt}] drawn left to right (used for labels with one blue word)
  D.rich = (segs, x, y, o = {}) => {
    const c = ctx; let tw = 0; for (const sg of segs) tw += D.measure(sg.s, sg.f || o.f || 'hand', o.size || 40, sg.wt || o.wt || 400);
    let cx = o.align === 'center' ? x - tw / 2 : o.align === 'right' ? x - tw : x; let left = o.write == null ? 1e9 : Math.floor(segs.reduce((a, s) => a + s.s.length, 0) * clamp(o.write));
    for (const sg of segs) { const n = Math.min(sg.s.length, Math.max(0, left)); left -= sg.s.length; const f = sg.f || o.f || 'hand', w = D.measure(sg.s, f, o.size || 40, sg.wt || o.wt || 400);
      if (n > 0) D.text(sg.s.slice(0, n), cx, y, { f, size: o.size || 40, wt: sg.wt || o.wt || 400, col: sg.col || o.col || C.ink, a: o.a }); cx += w; }
    return tw;
  };
  // marker highlight behind a word box (sweeps left->right like the demo)
  D.marker = (x, y, w, h, col, k, a = .85) => { if (k <= 0) return; const c = ctx; c.save(); c.globalAlpha *= a; c.fillStyle = col; const ww = w * eo(k);
    c.beginPath(); c.moveTo(x - 6, y + 3); c.lineTo(x + ww + 6, y); c.lineTo(x + ww + 4, y + h - 2); c.lineTo(x - 4, y + h + 1); c.closePath(); c.fill(); c.restore(); };

  // ---------- ink (felt tip with slight wobble) ----------
  const smooth = pts => { if (pts.length < 3) return pts; const o = []; for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < 6; k++) { const t = k / 6, t2 = t * t, t3 = t2 * t; o.push([.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
      .5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)]); } } o.push(pts[pts.length - 1]); return o; };
  D.wob = (pts, seed = 1, amt = 2.2) => pts.map(([x, y], i) => [x + (hash(seed * 31 + i * 1.7) - .5) * amt * 2, y + (hash(seed * 17 + i * 2.3) - .5) * amt * 2]);
  D.ink = (pts, o = {}) => {                                     // o: w,col,prog,seed,wob,smooth,a,dash,cap
    const k = o.prog ?? 1; if (k <= 0 || pts.length < 2) return; let p = o.wob === 0 ? pts : D.wob(pts, o.seed || 1, o.wob ?? 1.6); if (o.smooth !== false) p = smooth(p);
    let tot = 0; const seg = []; for (let i = 1; i < p.length; i++) { const l = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); seg.push(l); tot += l; }
    let lim = tot * clamp(k); const c = ctx; c.save(); c.globalAlpha *= (o.a ?? 1); c.strokeStyle = o.col || C.ink; c.lineWidth = o.w || 5; c.lineCap = 'round'; c.lineJoin = 'round'; if (o.dash) c.setLineDash(o.dash);
    c.beginPath(); c.moveTo(p[0][0], p[0][1]); for (let i = 1; i < p.length; i++) { if (lim <= 0) break; const l = seg[i - 1]; if (lim >= l) c.lineTo(p[i][0], p[i][1]); else { const u = lim / l; c.lineTo(lerp(p[i - 1][0], p[i][0], u), lerp(p[i - 1][1], p[i][1], u)); } lim -= l; }
    c.stroke(); c.restore();
  };
  D.circ = (cx, cy, r, n = 40, sq = 1) => Array.from({ length: n + 1 }, (_, i) => { const a = -Math.PI / 2 + i / n * TAU * 1.02; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r * sq]; });
  D.rect = (x, y, w, h) => { const o = [], n = 8; [[x, y, x + w, y], [x + w, y, x + w, y + h], [x + w, y + h, x, y + h], [x, y + h, x, y]].forEach(([a, b, c2, d2]) => { for (let i = 0; i < n; i++) o.push([lerp(a, c2, i / n), lerp(b, d2, i / n)]); }); o.push([x, y]); return o; };
  D.seg = (x0, y0, x1, y1, n = 6) => Array.from({ length: n + 1 }, (_, i) => [lerp(x0, x1, i / n), lerp(y0, y1, i / n)]);
  D.wave = (x0, y0, x1, y1, amp = 14, waves = 3) => { const n = 40, dx = x1 - x0, dy = y1 - y0, L0 = Math.hypot(dx, dy), nx = -dy / L0, ny = dx / L0;
    return Array.from({ length: n + 1 }, (_, i) => { const u = i / n, s = Math.sin(u * TAU * waves) * amp * Math.sin(u * Math.PI); return [x0 + dx * u + nx * s, y0 + dy * u + ny * s]; }); };
  D.head = (pts, o = {}) => { const n = pts.length, a = pts[n - 1], b = pts[Math.max(0, n - 3)], an = Math.atan2(a[1] - b[1], a[0] - b[0]), L0 = o.len || 26;
    for (const s of [-1, 1]) D.ink([[a[0], a[1]], [a[0] - Math.cos(an + s * .55) * L0, a[1] - Math.sin(an + s * .55) * L0]], { w: o.w || 5, col: o.col, wob: 0, smooth: false, a: o.a }); };
  D.arrow = (pts, o = {}) => { const k = o.prog ?? 1; if (k <= 0) return; D.ink(pts, o); if (k >= .97) D.head(o.wob === 0 ? pts : smooth(D.wob(pts, o.seed || 1, o.wob ?? 1.6)), o); };
  D.path = (pts) => { const c = ctx; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); };
  // crayon fill: flat colour + streaky grain + darker scribble strokes (demo's sun / water)
  D.crayon = (pts, col, o = {}) => { const k = o.prog ?? 1; if (k <= 0) return; const c = ctx; c.save(); c.globalAlpha *= (o.a ?? 1) * clamp(k * 1.6); D.path(pts); c.clip();
    c.fillStyle = col; c.fill(); c.globalAlpha *= .55; c.globalCompositeOperation = 'source-atop'; c.drawImage(grain, (o.seed || 0) * 37 % 300, 0); c.globalCompositeOperation = 'source-over'; c.restore();
    if (o.scribble !== false) { const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
      c.save(); D.path(pts); c.clip(); c.globalAlpha *= .22 * clamp(k * 1.6); c.strokeStyle = o.dark || 'rgba(30,50,140,1)'; c.lineWidth = 2;
      for (let i = 0; i < 24; i++) { const yy = y0 + (y1 - y0) * (i + .5) / 24; c.beginPath(); c.moveTo(x0, yy + hash(i * 3 + (o.seed || 0)) * 6); for (let x = x0; x <= x1; x += 60) c.lineTo(x, yy + Math.sin(x * .05 + i) * 4); c.stroke(); }
      c.restore(); } };
  D.hatch = (pts, col, o = {}) => { const c = ctx; const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    c.save(); D.path(pts); c.clip(); c.globalAlpha *= (o.a ?? 1) * clamp((o.prog ?? 1) * 1.4); c.fillStyle = o.fill || 'rgba(255,255,255,0)'; c.fill(); c.strokeStyle = col; c.lineWidth = o.w || 2.4; const sp = o.sp || 16;
    for (let x = x0 - (y1 - y0); x < x1; x += sp) { c.beginPath(); c.moveTo(x, y1); c.lineTo(x + (y1 - y0), y0); c.stroke(); } c.restore(); };
  D.dot = (x, y, r, col, a = 1) => { const c = ctx; c.save(); c.globalAlpha *= a; c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.restore(); };

  // ---------- HUD (always on top, over the composited frame) ----------
  D.logo = (x, y, s = 1, a = 1, c = g) => { const cols = [C.green, C.blueL, C.pinkL]; c.save(); c.globalAlpha = a;
    cols.forEach((col, i) => { c.fillStyle = col; c.strokeStyle = 'rgba(20,24,40,.35)'; c.lineWidth = 1.5 * s; const bx = x + i * 13 * s, h = (i === 1 ? 46 : 40) * s; c.beginPath(); c.roundRect(bx, y - h, 11 * s, h, 4 * s); c.fill(); c.stroke(); }); c.restore(); };
  D.hud = (t, total, dk, bpm = 88) => { const c = g; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.filter = 'none'; const ink = dk > .5 ? 'rgba(226,232,248,' : 'rgba(30,34,46,';
    const a = 1; c.globalAlpha = a; c.strokeStyle = ink + '.55)'; c.lineWidth = 2.5; const m = 44, q = 34;
    [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]].forEach(([x, y, sx, sy]) => { c.beginPath(); c.moveTo(x, y + sy * q); c.lineTo(x, y); c.lineTo(x + sx * q, y); c.stroke(); });
    D.logo(78, 104, .55, 1, c); c.font = D.font('sans', 22, 800); c.fillStyle = ink + '.92)'; c.letterSpacing = '3px'; c.fillText('HOWITREALLYWORKS', 112, 101);
    c.font = D.font('mono', 20, 500); c.fillStyle = ink + '.45)'; c.letterSpacing = '3px'; c.fillText('STUDIO 2026', 112, 130);
    const beat = 60 / bpm, bar = Math.floor(t / (4 * beat)) + 1, bars = Math.ceil(total / (4 * beat));
    c.textAlign = 'right'; c.font = D.font('mono', 20, 500); c.fillStyle = ink + '.5)'; c.fillText(`BAR ${String(bar).padStart(2, '0')}/${bars}`, W - 196, 101);
    c.font = D.font('mono', 20, 700); c.fillStyle = ink + '.9)'; c.fillText(`${bpm} BPM`, W - 80, 101);
    c.strokeStyle = ink + '.45)'; c.lineWidth = 1.6; for (let i = 0; i < 3; i++) { c.strokeRect(W - 382 + i * 12, 86, 8, 16); if (Math.floor(t / beat) % 3 === i) { c.fillStyle = ink + '.7)'; c.fillRect(W - 382 + i * 12, 86, 8, 16); } }
    const f = Math.floor(t * 30), ss_ = Math.floor(t) % 60, mm = Math.floor(t / 60); c.font = D.font('mono', 20, 500); c.fillStyle = ink + '.4)'; c.fillText(`F${String(f).padStart(4, '0')}`, W - 268, H - 92);
    c.fillStyle = ink + '.85)'; c.font = D.font('mono', 20, 700); c.fillText(`00:${String(mm).padStart(2, '0')}:${String(ss_).padStart(2, '0')}:${String(f % 30).padStart(2, '0')}`, W - 80, H - 92);
    c.restore(); };

  // ---------- karaoke subtitle (demo: spoken = ink, current = blue, coming = grey) ----------
  D.words = (cap) => { const ws = []; let hl = false; cap.split(/(\*\*)/).forEach(p => { if (p === '**') { hl = !hl; return; } p.split(/\s+/).filter(Boolean).forEach(w => ws.push({ w, hl })); }); return ws; };
  D.karaoke = (ph, t, y, o = {}) => { if (!ph) return; const ws = D.words(ph.cap), tot = ws.reduce((a, w) => a + w.w.length + 1, 0), dur = ph.end - ph.start; const c = g;
    const size = o.size || 52, maxW = o.maxW || 900; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.filter = 'none'; c.font = D.font('sans', size, 800); c.letterSpacing = '-1px';
    const lines = [[]]; let lw = 0; const sp = c.measureText(' ').width; ws.forEach(w => { const ww = c.measureText(w.w).width; if (lw + ww > maxW && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push(Object.assign(w, { ww })); lw += ww + sp; });
    let acc = 0; ws.forEach(w => { w.t0 = ph.start + dur * acc / tot; acc += w.w.length + 1; w.t1 = ph.start + dur * acc / tot; });
    const lh = size * 1.18, y0 = y - (lines.length - 1) * lh / 2, fade = clamp((t - ph.start + .25) / .25) * (o.out != null ? clamp((o.out - t) / .25) : 1);
    lines.forEach((ln, li) => { const w = ln.reduce((a, x) => a + x.ww, 0) + sp * (ln.length - 1); let x = W / 2 - w / 2;
      ln.forEach(wd => { const st = t >= wd.t1 ? 2 : t >= wd.t0 ? 1 : 0; c.globalAlpha = fade * (st ? 1 : .9); c.fillStyle = st === 1 || (wd.hl && st === 2) ? (o.dark ? '#8fb0ff' : C.blue) : st === 2 ? (o.dark ? '#f2f4fa' : C.ink) : (o.dark ? 'rgba(200,208,230,.32)' : 'rgba(150,156,170,.5)');
        c.fillText(wd.w, x, y0 + li * lh); x += wd.ww + sp; }); });
    c.restore(); };

  // ---------- composite helpers ----------
  // draw the scene layer full frame with zoom/offset/blur/alpha
  D.blit = (o = {}) => { const c = g; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = o.a ?? 1; if (o.blur) c.filter = `blur(${o.blur}px)`;
    const z = o.z || 1, cx = o.cx ?? W / 2, cy = o.cy ?? H / 2; c.translate(W / 2 + (o.dx || 0), H / 2 + (o.dy || 0)); if (o.rot) c.rotate(o.rot); c.scale(z, z); c.translate(-cx, -cy); c.drawImage(L, 0, 0); c.restore(); };
  // demo signature: the diagram shrinks into a white video-player card with progress bar; k = 0 full frame .. 1 card
  D.card = (k, prog, tcur, ttot, o = {}) => { const c = g, u = ex(k); const cw = lerp(W, 940, u), ch = lerp(H, o.h || 1180, u), cx = W / 2, cy = lerp(H / 2, o.cy || 820, u), r = lerp(0, 34, u);
    const x = cx - cw / 2, y = cy - ch / 2; c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
    c.shadowColor = `rgba(40,50,80,${.22 * u})`; c.shadowBlur = 60 * u; c.shadowOffsetY = 24 * u; c.fillStyle = '#fff'; c.beginPath(); c.roundRect(x, y, cw, ch, r); c.fill(); c.shadowColor = 'transparent';
    c.save(); c.beginPath(); c.roundRect(x, y, cw, ch, r); c.clip(); const src = o.src || [70, 330, 940, 1070], ih = ch - 110 * u;   // crop of the layer that ends up inside the card
    const sx = lerp(0, src[0], u), sy = lerp(0, src[1], u), sw = lerp(W, src[2], u), sh = lerp(H, src[3], u); c.drawImage(L, sx, sy, sw, sh, x, y, cw, ih); c.restore();
    if (u > .02) { c.globalAlpha = clamp(u * 2); const by = y + ch - 62; c.fillStyle = C.ink; c.fillRect(x + 46, by - 14, 7, 28); c.fillRect(x + 60, by - 14, 7, 28);
      c.fillStyle = '#dfe3ec'; c.beginPath(); c.roundRect(x + 100, by - 4, cw - 400, 8, 4); c.fill(); c.fillStyle = C.blue; c.beginPath(); c.roundRect(x + 100, by - 4, (cw - 400) * prog, 8, 4); c.fill();
      c.beginPath(); c.arc(x + 100 + (cw - 400) * prog, by, 13, 0, TAU); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(x + 100 + (cw - 400) * prog, by, 6, 0, TAU); c.fill();
      const fm = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`; c.font = D.font('sans', 30, 600); c.textAlign = 'right'; c.fillStyle = C.ink; c.fillText(fm(tcur), x + cw - 170, by + 10);
      c.fillStyle = C.mid; c.fillText(' / ' + fm(ttot), x + cw - 86, by + 10); D.logo(x + cw - 66, by + 22, .5, clamp(u * 2), c); }
    c.restore(); };
  return D;
}
