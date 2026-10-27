// t_magnet.js: "How a magnet really works" in template #15 Distilbook (demo 83). Canvas2D 1080x1920, pure function of t.
// Demo moves reused: tilted book page with depth blur + marker sweeps (A) -> highlighted words fly into a hand-drawn diagram (B) ->
// bold stacked lines "Pages. / and pages." (C) -> circle callouts, crayon fills, wavy arrows, handwritten labels (D-I) -> diagram shrinks into the
// white video-player card with progress bar (I) -> dark navy rolling stack with big pink counter (J) -> editor-style white card (K) ->
// dark dot grid with a huge number (L) -> logo end card with blue pill (M). Karaoke subtitle and HUD throughout.
import { createDB, W, H, TAU, C, clamp, lerp, ramp, ss, eo, ex, bo, hash, FONTS } from './styles/distilbook/distilbook.js';
await Promise.all(FONTS.map(f => document.fonts.load(f)));
const TL = window.TL, PH = TL.p, s = i => PH[i].start, e = i => PH[i].end, TOT = TL.total;
const D = createDB(document.getElementById('c')), g = D.g, lg = D.lg;
const R = ramp, K = 1;
const mixc = (a, b, u) => { const p = x => [1, 3, 5].map(i => parseInt(x.slice(i, i + 2), 16)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], u))).join(',')})`; };
const NCOL = '#f27a9b', SCOL = '#7fa2ee';

// ---------- small reusable drawings ----------
function barMagnet(x, y, w, h, k, o = {}) {                       // pink N half | blue S half, ink outline drawn on
  if (k <= 0) return; const segs = o.segs || [[NCOL, NCOL], [SCOL, SCOL]], n = segs.length, sw = w / n;
  segs.forEach((sg, j) => D.crayon(D.rect(x + j * sw, y, sw, h), mixc(sg[0], sg[1], o.u ?? 1), { prog: R(k, .35, .5), seed: j + (o.seed || 0), dark: j % 2 ? 'rgba(20,40,120,1)' : 'rgba(140,20,60,1)' }));
  D.ink(D.rect(x, y, w, h), { w: 5, prog: R(k, 0, .5), seed: o.seed || 3, smooth: false, wob: 1.2 });
  if (o.letters !== false && k > .6) { const fs = Math.min(h * .55, sw * .62); for (let j = 0; j < n; j++) D.text(j % 2 ? 'S' : 'N', x + j * sw + sw / 2, y + h / 2 + fs * .36, { f: 'hand', size: fs, align: 'center', a: R(k, .6, .3) * (o.la ?? 1) }); }
}
function spinArrow(x, y, ang, len, k, o = {}) { const dx = Math.cos(ang) * len / 2, dy = Math.sin(ang) * len / 2; D.arrow(D.seg(x - dx, y - dy, x + dx, y + dy, 4), { w: o.w || 6, prog: k, len: o.hl || 18, col: o.col, seed: o.seed || 1, wob: .6 }); }
function electron(x, y, r, ang, k, seed = 1) { D.crayon(D.circ(x, y, r, 30), C.water, { prog: k, seed }); D.ink(D.circ(x, y, r, 30), { w: 4.5, prog: k, seed }); if (k > .5) spinArrow(x, y, ang, r * 2.7, R(k, .5, .5), { seed: seed + 9, w: 6 }); }
function wavyArrow(x0, y0, x1, y1, k, seed = 1, amp = 12) { D.arrow(D.wave(x0, y0, x1, y1, amp, 2), { w: 4.5, prog: k, seed, len: 22 }); }
const label = (segs, x, y, k, o = {}) => D.rich(segs.map(z => typeof z === 'string' ? { s: z } : z), x, y, { f: 'hand', size: o.size || 48, align: o.align || 'center', write: k, a: o.a });
// jittered-grid patchwork (domains): shared corners so cells tile
function patch(x0, y0, w, h, nx, ny, seed) { const P = []; for (let j = 0; j <= ny; j++) { P.push([]); for (let i = 0; i <= nx; i++) { const ed = i === 0 || j === 0 || i === nx || j === ny; P[j].push([x0 + w * i / nx + (ed && (i === 0 || i === nx) ? 0 : (hash(seed + i * 7 + j * 13) - .5) * w / nx * .55), y0 + h * j / ny + (ed && (j === 0 || j === ny) ? 0 : (hash(seed + i * 3 + j * 29) - .5) * h / ny * .55)]); } }
  const cells = []; for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) cells.push({ pts: [P[j][i], P[j][i + 1], P[j + 1][i + 1], P[j + 1][i]], cx: (P[j][i][0] + P[j][i + 1][0] + P[j + 1][i + 1][0] + P[j + 1][i][0]) / 4, cy: (P[j][i][1] + P[j][i + 1][1] + P[j + 1][i + 1][1] + P[j + 1][i][1]) / 4, ang: hash(seed * 5 + i * 11 + j * 17) * TAU, i, j }); return cells; }
function drawCells(cells, k, angOf, o = {}) { const c = D.ctx();
  cells.forEach((cl, n) => { const kk = R(k, n * .03, .5); if (kk <= 0) return; const tint = ['rgba(127,162,238,.16)', 'rgba(242,122,155,.13)', 'rgba(134,227,154,.16)'][n % 3];
    c.save(); D.path(cl.pts); c.fillStyle = tint; c.globalAlpha = kk; c.fill(); c.restore(); D.ink([...cl.pts, cl.pts[0]], { w: o.w || 3.4, prog: kk, seed: n + 5, smooth: false, col: o.col || 'rgba(29,31,36,.8)' });
    const a = angOf(cl, n), sp = o.sp || 46; if (kk > .4) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const px = cl.cx + dx * sp, py = cl.cy + dy * sp; c.save(); D.path(cl.pts); c.clip(); spinArrow(px, py, a, o.al || 34, R(kk, .4, .5), { w: 3.6, hl: 11, seed: n * 9 + dx + dy * 3 }); c.restore(); } }); }

// ---------- A: tilted book page ----------
const P = document.createElement('canvas'); P.width = 1500; P.height = 1000; const pg = P.getContext('2d');
const LINES = ['Cut a magnet in half, and you', "don't get a north piece and a", 'south piece. You get two magnets.', 'Cut again, and every piece still', 'has both poles. A magnet was never', 'one big magnet. It is built from', 'billions of tiny ones.'];
const HL = []; {
  pg.fillStyle = C.blue; pg.font = D.font('serif', 104, 700); pg.fillText('4.1', 40, 130); const w41 = pg.measureText('4.1 ').width; pg.fillStyle = C.ink; pg.fillText('Magnets', 40 + w41, 130);
  pg.font = D.font('serif', 60, 400); LINES.forEach((ln, i) => pg.fillText(ln, 40, 300 + i * 100));
  const find = (li, w, col, t0) => { const x = pg.measureText(LINES[li].slice(0, LINES[li].indexOf(w))).width + 40; HL.push({ x, y: 300 + li * 100 - 52, w: pg.measureText(w).width, h: 68, col, t0, word: w }); };
  find(1, 'north piece', C.greenL, s(0) + 2.2); find(2, 'south piece', C.pinkL, s(0) + 3.0); find(2, 'two magnets', C.hlBlue, s(1) + .25); find(4, 'both poles', C.greenL, s(1) + 2.7);
}
const pageM = t => { const z = 1.12 + .1 * ss(R(t, 0, 5)); return { tx: 70 - 30 * ss(R(t, 0, 5)), ty: 520, z, rot: -.075 }; };
const pagePt = (t, x, y) => { const m = pageM(t), c = Math.cos(m.rot), sn = Math.sin(m.rot); return [m.tx + (x * c - y * sn) * m.z, m.ty + (x * sn + y * c) * m.z]; };
function sceneA(t) { const T = D.T, tg = D.tg; tg.setTransform(1, 0, 0, 1, 0, 0); tg.clearRect(0, 0, W, H); const m = pageM(t);
  tg.translate(m.tx, m.ty); tg.rotate(m.rot); tg.scale(m.z, m.z); D.use(tg); HL.forEach(h => D.marker(h.x, h.y, h.w, h.h, h.col, R(t, h.t0, .45))); tg.drawImage(P, 0, 0); D.use(lg);
  // depth of field: sharp band in the middle, blur grows above and below (demo frame 1)
  const band = (y0, y1, b) => { lg.save(); lg.beginPath(); lg.rect(0, y0, W, y1 - y0); lg.clip(); if (b) lg.filter = `blur(${b}px)`; lg.drawImage(T, 0, 0); lg.restore(); };
  band(0, 520, 7); band(520, 640, 3); band(640, 1080, 0); band(1080, 1190, 3); band(1190, H, 8); }

// ---------- B: cut the magnet ----------
const MX = 180, MY = 780, MW = 720, MH = 190;
function cutLevel(t) { const c1 = s(1) + .45, c2 = s(1) + 1.75; if (t < c1) return [0, 1, 0]; if (t < c2) return [1, ex(R(t, c1 + .25, .8)), R(t, c1, .35)]; return [2, ex(R(t, c2 + .25, .8)), R(t, c2, .35)]; }
function sceneB(t) {
  const [lv, sep, cutk] = cutLevel(t), k0 = R(t, s(1) - .2, .8);
  if (lv === 0) barMagnet(MX, MY, MW, MH, k0, { seed: 2 });
  else { const n = 2 ** lv, pw = MW / n, gap = 70 / lv * 1.3; if (sep < .02) for (let i = 1; i < n; i++) if (lv === 1 || i % 2) D.ink(D.seg(MX + i * pw, MY - 50, MX + i * pw, MY + MH + 50, 8), { w: 4, dash: [16, 12], prog: cutk, wob: 0 });
    for (let i = 0; i < n; i++) { const x = MX + i * pw + (i - (n - 1) / 2) * gap * sep - (lv === 2 ? 0 : 0); const segs = [0, 1].map(hh => { const j = i * 2 + hh, own = j % 2 ? SCOL : NCOL, par = Math.floor(j / 2) % 2 ? SCOL : NCOL; return [par, own]; });
      barMagnet(x, MY + (lv === 2 ? (i % 2 ? 26 : -26) * sep : 0), pw, MH * (lv === 2 ? .82 : 1), 1, { segs, u: sep, seed: i + lv * 4, la: clamp(sep * 2) }); } }
  // flown words -> labels with strike scribble
  const fly = R(t, s(1) - .35, .7);
  [[HL[0], 300], [HL[1], 780]].forEach(([h, lx], n) => { const [px, py] = pagePt(s(1) - .35, h.x, h.y + 50); const u = ex(fly), x = lerp(px, lx, u), y = lerp(py, MY - 90, u);
    if (u < .98) D.text(h.word, x, y, { f: 'serif', size: lerp(60 * 1.2, 46, u), align: u > .5 ? 'center' : 'left', a: 1 - u * .3 }); else label([h.word], lx, y, 1, { size: 50, a: 1 - R(t, s(1) + 1.9, .4) });
    const st = R(t, s(1) + .35 + n * .12, .35); if (st > 0 && t < s(1) + 2.3) D.ink(D.seg(lx - 120, MY - 104, lx + 120, MY - 100, 6), { w: 6, col: C.red, prog: st, seed: 40 + n, a: 1 - R(t, s(1) + 1.9, .4) }); });
  const k1 = R(t, s(1) + .9, .6); if (k1 > 0 && t < s(1) + 1.9) label(['two ', { s: 'magnets!', col: C.blue }], 540, 1170, k1, { size: 58, a: 1 - R(t, s(1) + 1.7, .3) });
  const k2 = R(t, s(1) + 2.6, .7); if (k2 > 0) { label(['every piece: ', { s: 'N', col: NCOL }, ' + ', { s: 'S', col: C.blue }], 540, 1230, k2, { size: 62 }); wavyArrow(540, 1150, 540, 1060, R(t, s(1) + 3.0, .4), 7); }
}

// ---------- C: never one big magnet ----------
function sceneC(t) {
  const L0 = [['Never one', C.ink, s(2)], ['big magnet.', C.ink, s(2) + .9], ['Billions', C.ink, s(2) + 2.6], ['of tiny ones.', C.blue, s(2) + 3.4]];
  L0.forEach(([w, col, t0], i) => { const u = ex(R(t, t0, .5)); if (u > 0) D.text(w, 90 - (1 - u) * 60, 400 + i * 132, { f: 'sans', size: 118, wt: 800, col, a: u, track: -3 }); });
  // zoom into the magnet: tiny magnets appear
  const z = lerp(1, 2.6, ss(R(t, s(2) + 2.3, 2.6))), bx = 140, by = 1000, bw = 800, bh = 330, c = lg;
  c.save(); c.beginPath(); c.roundRect(bx - 6, by - 6, bw + 12, bh + 12, 10); c.clip(); c.translate(540, by + bh / 2); c.scale(z, z); c.translate(-540, -(by + bh / 2));
  barMagnet(bx, by, bw, bh, R(t, s(2) - .2, .8), { seed: 8, la: 1 - R(t, s(2) + 2.3, .5) });
  const kk = R(t, s(2) + 2.4, 1.2); if (kk > 0) { c.globalAlpha = kk; for (let y = by + 20; y < by + bh; y += 34) for (let x = bx + 14; x < bx + bw - 30; x += 52) { const xx = x + (Math.floor((y - by) / 34) % 2) * 26; c.fillStyle = NCOL; c.fillRect(xx, y, 20, 12); c.fillStyle = SCOL; c.fillRect(xx + 20, y, 20, 12); c.strokeStyle = 'rgba(29,31,36,.7)'; c.lineWidth = 1.4; c.strokeRect(xx, y, 40, 12); } }
  c.restore(); D.ink(D.rect(bx - 6, by - 6, bw + 12, bh + 12), { w: 3, prog: R(t, s(2), .5), seed: 12, col: 'rgba(29,31,36,.35)', smooth: false });
  if (kk > .3) label(['zoom in'], 880, by + bh + 80, R(t, s(2) + 3.2, .6), { size: 40, a: .7 });
}

// ---------- D: every electron is a teeny magnet (circle callout) ----------
function sceneD(t) { const t0 = s(3), ck = R(t, t0 - .1, .8);
  D.ink(D.circ(540, 900, 360, 60), { w: 5, prog: ck, seed: 21 });
  D.ink(D.circ(540, 820, 180, 50, .38), { w: 3, prog: R(t, t0 + .2, .8), seed: 22, col: 'rgba(29,31,36,.45)', dash: [10, 10] });
  D.dot(540, 820, 26, '#e9b949', R(t, t0 + .1, .3)); D.ink(D.circ(540, 820, 26, 18), { w: 3.5, prog: R(t, t0 + .1, .4), seed: 23 });
  const ang = .45 * Math.sin((t - t0) * 1.2); electron(700, 780, 54, -Math.PI / 2 + ang * .3, R(t, t0 + .7, .7), 24);
  const sk = R(t, t0 + 1.4, .8); if (sk > 0) { const arc = Array.from({ length: 24 }, (_, i) => { const a = Math.PI * .15 + i / 23 * Math.PI * 1.4; return [700 + Math.cos(a) * 92, 780 + Math.sin(a) * 30]; }); D.arrow(arc, { w: 4, prog: sk, seed: 25, len: 18 }); }
  const nk = R(t, t0 + 3.2, .5); if (nk > 0) { label([{ s: 'N', col: NCOL }], 700, 672, nk, { size: 54 }); label([{ s: 'S', col: C.blue }], 700, 922, nk, { size: 54 }); }
  label(['every electron'], 540, 1060, R(t, t0 + 1.8, .9), { size: 58 }); label(['is a ', { s: 'teeny magnet', col: C.blue }], 540, 1130, R(t, t0 + 2.5, .9), { size: 58 });
  label(['electron'], 330, 560, R(t, t0 + 1.0, .5), { size: 48 }); wavyArrow(380, 580, 630, 760, R(t, t0 + 1.2, .6), 26, 10);
}

// ---------- E: pairs cancel ----------
function sceneE(t) { const t0 = s(4); label(['most materials:'], 540, 430, R(t, t0, .7), { size: 62 });
  [640, 880, 1120].forEach((y, r) => { const k = R(t, t0 + .5 + r * .6, .7); electron(340, y, 56, -Math.PI / 2, k, 30 + r); electron(520, y, 56, Math.PI / 2, R(k, .2, .8), 40 + r);
    const ek = R(t, t0 + 2.4 + r * .25, .4); if (ek > 0) { label(['= 0'], 760, y + 30, ek, { size: 96 }); } });
  const hk = R(t, t0 + 3.9, .5); if (hk > 0) { D.marker(330, 1268, 420, 72, C.pinkL, hk); label(['cancels out'], 540, 1322, R(t, t0 + 3.8, .5), { size: 66 }); }
}

// ---------- F: iron lines them up ----------
const FG = Array.from({ length: 16 }, (_, n) => ({ x: 285 + (n % 4) * 170, y: 560 + Math.floor(n / 4) * 170, a0: hash(n * 3.7) * TAU }));
function sceneF(t, zoomOut = 0) { const t0 = s(5); label(['iron'], 540, 420, R(t, t0, .5), { size: 84 }); label([{ s: 'Fe', col: C.mid }], 680, 420, R(t, t0 + .3, .4), { size: 44 });
  const al = t0 + 2.6; FG.forEach((p, n) => { const k = R(t, t0 + .2 + n * .04, .5); if (k <= 0) return; D.hatch(D.circ(p.x, p.y, 52, 26), 'rgba(29,31,36,.18)', { prog: k, sp: 12 }); D.ink(D.circ(p.x, p.y, 52, 26), { w: 3.6, prog: k, seed: 50 + n });
    const u = ss(R(t, al + n * .05, .9)); let a = p.a0; const tgt = -Math.PI / 2; let da = ((tgt - a) % TAU + TAU * 1.5) % TAU - Math.PI; spinArrow(p.x, p.y, a + da * u, 74, R(k, .3, .6), { w: 5.5, seed: 60 + n, col: u > .95 ? C.blue : C.ink }); });
  const lk = R(t, al + 1.4, .8); if (lk > 0) label(['unpaired → ', { s: 'lined up', col: C.blue }], 540, 1290, lk, { size: 60 });
}

// ---------- G: domains ----------
const GC = patch(130, 470, 820, 740, 3, 3, 77);
function sceneG(t) { const t0 = s(6); drawCells(GC, R(t, t0 - .1, 1.6), cl => cl.ang, { sp: 54, al: 38 });
  const hk = R(t, t0 + .4, .5); if (hk > 0) { D.marker(380, 352, 320, 74, C.greenL, hk); label(['domains'], 540, 410, R(t, t0 + .3, .5), { size: 74 }); }
  const rk = R(t, t0 + 2.2, .7); if (rk > 0) { D.ink(D.seg(200, 1290, 880, 1290, 8), { w: 4, prog: rk, wob: .4 }); for (let i = 0; i <= 10; i++) D.ink(D.seg(200 + i * 68, 1290, 200 + i * 68, 1290 - (i % 5 ? 14 : 28), 1), { w: 3, prog: R(rk, i * .05, .3), wob: 0, smooth: false });
    label(['0.1 mm ', { s: 'to a few mm', col: C.blue }], 540, 1370, R(t, t0 + 2.6, .9), { size: 54 }); }
}

// ---------- H/I: nail ----------
const NY = 820, NX0 = 100, NX1 = 700, NT = 800, NH = 130;
const nailPts = [[NX0, NY - 110], [NX0 + 40, NY - 110], [NX0 + 40, NY - NH / 2], [NX1, NY - NH / 2], [NT, NY], [NX1, NY + NH / 2], [NX0 + 40, NY + NH / 2], [NX0 + 40, NY + 110], [NX0, NY + 110]];
const NC = patch(NX0 + 40, NY - NH / 2, NX1 - NX0 + 60, NH, 7, 2, 91);
function nail(t, alignU, dx = 0, mag = 0) { const c = lg, k = R(t, s(7) - .1, .9); c.save(); c.translate(dx, 0);
  D.crayon(nailPts, '#d9dce3', { prog: k, seed: 70, scribble: false });
  if (mag > 0) { c.save(); D.path(nailPts); c.clip(); c.globalAlpha = mag * .55; c.fillStyle = SCOL; c.fillRect(NX0, NY - 120, (NT - NX0) / 2, 240); c.fillStyle = NCOL; c.fillRect(NX0 + (NT - NX0) / 2, NY - 120, (NT - NX0) / 2, 240); c.restore(); }
  c.save(); D.path(nailPts); c.clip(); drawCells(NC, R(t, s(7) + .4, 1.4), (cl, n) => { const tgt = 0; let a = cl.ang, da = ((tgt - a) % TAU + TAU * 1.5) % TAU - Math.PI; return a + da * ss(R(alignU, (6 - cl.i) * .07, .5)); }, { sp: 26, al: 22, w: 2.4 }); c.restore();
  D.ink([...nailPts, nailPts[0]], { w: 5, prog: k, seed: 71, smooth: false });
  if (mag > .3) { label([{ s: 'S', col: C.blue }], NX0 + 90, NY - 130, mag, { size: 60 }); label([{ s: 'N', col: NCOL }], NX1 - 30, NY - 130, mag, { size: 60 }); }
  c.restore(); }
function sceneH(t) { const t0 = s(7); nail(t, 0); label(['a plain iron ', { s: 'nail', col: C.blue }], 540, 600, R(t, t0, .7), { size: 64 });
  const k = R(t, t0 + 2.2, .6); if (k > 0) { label(['every which way → cancels'], 540, 1060, k, { size: 54 }); } }
function sceneI(t) { const t0 = s(8), mx = lerp(1180, 836, ex(R(t, t0, 1.0))), snap = bo(R(t, s(9) + 1.5, .35)), click = R(t, s(9) + 1.5, .01);
  const au = R(t, t0 + 1.1, 1.8), mag = R(t, s(9) + .1, .6);
  for (let i = 0; i < 4; i++) { const r = 70 + i * 50, k = R(t, t0 + .6 + i * .15, .6) * (1 - mag * .3); if (k > 0) D.ink(Array.from({ length: 20 }, (_, j) => { const a = Math.PI * .55 + j / 19 * Math.PI * .9; return [mx + Math.cos(a) * r, NY + Math.sin(a) * r * 1.3]; }), { w: 3, dash: [10, 9], prog: k, seed: 80 + i, col: 'rgba(61,95,217,.7)' }); }
  nail(t, au, 32 * snap, mag);
  const c = lg; c.save(); c.translate(mx, 0); barMagnet(0, NY - 100, 300, 200, 1, { segs: [[SCOL, SCOL], [NCOL, NCOL]], seed: 33, letters: false }); D.text('S', 60, NY + 30, { f: 'hand', size: 96, align: 'center' }); c.restore();
  label(['magnet'], mx + 120, NY + 190, R(t, t0 + .6, .5), { size: 48 });
  if (t < s(9)) label(['domains ', { s: 'swing into line', col: C.blue }], 540, 1080, R(t, t0 + 1.3, .9), { size: 56 });
  else { label([{ s: 'now a magnet too', col: C.blue }], 540, 1080, R(t, s(9) + .2, .8), { size: 60 }); if (click > 0) label(['click!'], 820, 640, R(t, s(9) + 1.55, .3), { size: 58 }); }
}

// ---------- J: dark rolling stack + pink counter (heat) ----------
const STACK = ['Heat the iron.', '200 °C', '400 °C', '600 °C', '770 °C'];
function sceneJ(t) { const t0 = s(10), c = lg, prog = ss(R(t, t0 + .2, 4.4)), cur = prog * (STACK.length - 1), gone = R(t, t0 + 5.6, .8);
  // background arrow field: order shakes apart with temperature
  for (let y = 300; y < 1600; y += 92) for (let x = 90; x < W; x += 92) { const n = x * 7 + y * 3, jit = prog * prog * (hash(n) - .5) * TAU * 1.2 + Math.sin(t * 9 + n) * .5 * prog; c.save(); c.globalAlpha = .22 * (1 - gone * .6); D.use(c); spinArrow(x, y, -Math.PI / 2 + jit, 40, 1, { w: 3, col: '#8fa8e6', hl: 10, seed: n % 97 }); c.restore(); }
  STACK.forEach((w, i) => { const d = i - cur, y = 820 + d * 128, a = clamp(1 - Math.abs(d) * .45) * (1 - gone); if (a <= .01) return; c.save(); c.filter = `blur(${Math.min(10, Math.abs(d) * 5)}px)`; c.globalAlpha = a;
    D.text(w, 540, y, { f: i % 2 ? 'serifI' : 'sans', size: i % 2 ? 84 : 96, wt: i % 2 ? 400 : 800, col: '#f2f4fa', align: 'center', track: -2 }); c.restore(); });
  const temp = Math.round(lerp(20, 770, prog)); D.text(`${temp}°C`, 540, 1270, { f: 'sans', size: 150, wt: 800, col: C.pink, align: 'center', a: R(t, t0 + .2, .4), track: -4 });
  D.text('about 770 °C: the Curie point of iron', 540, 1350, { f: 'sans', size: 36, wt: 600, col: '#dfe5f5', align: 'center', a: R(t, t0 + 3.6, .5) });
  if (gone > 0) D.text('Magnetism: gone.', 540, 860, { f: 'sans', size: 104, wt: 800, col: '#f2f4fa', align: 'center', a: ex(gone), track: -3 });
}

// ---------- K: fridge magnet (white editor card) ----------
function sceneK(t) { const t0 = s(11), c = lg, ck = ex(R(t, t0 - .1, .6));
  c.save(); c.globalAlpha = ck; c.translate(0, (1 - ck) * 60); c.shadowColor = 'rgba(40,50,80,.18)'; c.shadowBlur = 50; c.shadowOffsetY = 18; c.fillStyle = '#fff'; c.beginPath(); c.roundRect(80, 330, 920, 1150, 32); c.fill(); c.shadowColor = 'transparent';
  c.fillStyle = '#e8eefe'; c.beginPath(); c.roundRect(130, 380, 190, 50, 25); c.fill(); D.text('DIAGRAM', 225, 415, { f: 'sans', size: 24, wt: 800, col: C.blue, align: 'center', track: 2 });
  D.text('Fridge magnet', 345, 418, { f: 'sans', size: 44, wt: 700 }); D.text('side view', 950, 416, { f: 'mono', size: 24, col: C.mid, align: 'right' });
  c.fillStyle = '#eceef3'; c.fillRect(130, 460, 820, 2); c.restore();
  // top view sketch (stripes hidden under the printed face)
  const tk = R(t, t0 + .2, .8); if (tk > 0) { const x0 = 300, y0 = 520, w0 = 480, h0 = 220; c.save(); c.globalAlpha = tk; c.fillStyle = '#fff6d9'; c.beginPath(); c.roundRect(x0, y0, w0, h0, 18); c.fill(); c.restore();
    D.ink(D.rect(x0, y0, w0, h0), { w: 4, prog: tk, smooth: false, seed: 130 }); for (let i = 1; i < 8; i++) D.ink(D.seg(x0 + i * w0 / 8, y0 + 8, x0 + i * w0 / 8, y0 + h0 - 8, 4), { w: 2, dash: [8, 8], prog: R(tk, .3, .7), col: 'rgba(61,95,217,.45)', wob: 0 });
    D.crayon(D.circ(x0 + 110, y0 + 110, 62, 26), C.sun, { prog: tk, seed: 131, dark: 'rgba(160,110,0,1)' }); D.ink(D.circ(x0 + 110, y0 + 110, 62, 26), { w: 4, prog: tk, seed: 132 });
    label(['top view'], 920, y0 + 40, R(t, t0 + .6, .5), { size: 40, align: 'right', a: .8 }); label(['hidden ', { s: 'stripes', col: C.blue }], x0 + 330, y0 + 130, R(t, t0 + 1.0, .6), { size: 46 }); }
  // fridge door
  const dk = R(t, t0, .7); D.hatch([[150, 1180], [930, 1180], [930, 1280], [150, 1280]], 'rgba(29,31,36,.25)', { prog: dk, sp: 18, fill: '#eef0f4' }); D.ink(D.seg(150, 1180, 930, 1180, 8), { w: 5, prog: dk, wob: .5 }); label(['fridge door'], 540, 1350, dk, { size: 44, a: .8 });
  // the strip: 8 stripes alternating; flips at "Flip it over", then slides off
  const fl = ss(R(t, s(12) + 1.9, .8)), off = ss(R(t, s(12) + 2.7, 1.0)), cy = lerp(1130, 1050, ss(R(t, s(12) + 1.7, .4))) + off * 0, sy = Math.cos(fl * Math.PI), sx0 = 200, sw = 680, sh = 90;
  c.save(); c.translate(540 + off * 40, cy + off * 70); c.rotate(off * .12); c.scale(1, sy); c.translate(-540, -cy);
  const segs = Array.from({ length: 8 }, (_, i) => i % 2 ? [SCOL, SCOL] : [NCOL, NCOL]); barMagnet(sx0, cy - sh / 2, sw, sh, R(t, t0 + .3, .8), { segs, seed: 90, letters: sy > .3 });
  // field loops on the grip side (below the strip)
  for (let i = 1; i < 8; i++) { const x = sx0 + i * sw / 8, k = R(t, t0 + 1.4 + i * .1, .5); if (k > 0) D.ink(Array.from({ length: 12 }, (_, j) => { const a = j / 11 * Math.PI; return [x - Math.cos(a) * sw / 16, cy + sh / 2 + Math.sin(a) * 34]; }), { w: 3, prog: k, seed: 95 + i, col: 'rgba(61,95,217,.85)', wob: .4 }); }
  for (let i = 1; i < 8; i++) { const x = sx0 + i * sw / 8, k = R(t, t0 + 2.4, .5); if (k > 0) D.ink(Array.from({ length: 8 }, (_, j) => { const a = j / 7 * Math.PI; return [x - Math.cos(a) * sw / 30, cy - sh / 2 - Math.sin(a) * 9]; }), { w: 2, prog: k, seed: 105 + i, col: 'rgba(61,95,217,.35)', wob: .2 }); }
  c.restore();
  const lk = R(t, t0 + 1.9, .7); if (lk > 0 && fl < .3) { label([{ s: 'N S N S', col: C.ink }, ' side by side'], 540, 860, lk, { size: 54 }); label(['grip side ', { s: '↓ strong', col: C.blue }], 540, 900, R(t, s(12) + .2, .8), { size: 52 }); }
  const bk = R(t, s(12) + 3.0, .6); if (bk > 0) { D.marker(340, 855, 400, 72, C.pinkL, bk); label(['barely sticks'], 540, 910, R(t, s(12) + 2.9, .5), { size: 62 }); }
}

// ---------- L: dark dot grid, huge number ----------
function sceneL(t) { const t0 = s(13), c = lg; for (let y = 230; y < 1720; y += 30) for (let x = 60; x < W - 40; x += 30) { const a = .12 + .18 * (.5 + .5 * Math.sin(x * .013 + y * .009 - t * 2.2)); c.fillStyle = `rgba(210,220,250,${a})`; c.fillRect(x, y, 3.2, 3.2); }
  const q = 1 - R(t, s(14) - .3, .4); if (q > 0) { const u = ex(R(t, t0, .6)); D.text('just one pole?', 540, 760, { f: 'sans', size: 104, wt: 800, col: '#f2f4fa', align: 'center', a: u * q, track: -3 });
    c.save(); c.globalAlpha = q; D.use(c); barMagnet(410, 900, 260, 150, R(t, t0 + .8, .7), { segs: [[NCOL, NCOL]], seed: 120, letters: false }); D.text('N', 540, 1010, { f: 'hand', size: 100, align: 'center', a: R(t, t0 + 1.3, .3) }); D.text('?', 730, 1010, { f: 'sans', size: 120, wt: 800, col: C.pink, a: R(t, t0 + 2.2, .3) }); c.restore(); }
  const n = R(t, s(14) - .2, .6); if (n > 0) { const u = ex(n); D.text('0', 540, 1060, { f: 'sans', size: 460, wt: 800, col: '#f2f4fa', align: 'center', a: u, track: -10 });
    D.text('single poles found', 540, 1170, { f: 'sans', size: 46, wt: 600, col: '#dfe5f5', align: 'center', a: R(t, s(14) + .4, .5) }); D.text('so far', 540, 1240, { f: 'sans', size: 46, wt: 800, col: C.pink, align: 'center', a: R(t, s(14) + .9, .5) }); }
}

// ---------- M: end card ----------
function sceneM(t) { const t0 = s(15) - .2, c = lg; const u = ex(R(t, t0, .7));
  c.save(); c.globalAlpha = u; D.logo(476, 700, 3.0, 1, c); c.restore();
  D.text('Follow for more of', 540, 860, { f: 'sans', size: 68, wt: 700, align: 'center', a: ex(R(t, t0 + .25, .6)), track: -1 });
  D.text('how it really works.', 540, 970, { f: 'sans', size: 92, wt: 800, align: 'center', a: ex(R(t, t0 + .5, .6)), track: -3 });
  D.text('Everyday things, explained in drawings.', 540, 1050, { f: 'sans', size: 34, wt: 500, col: C.mid, align: 'center', a: R(t, t0 + .9, .5) });
  const pk = bo(R(t, t0 + 1.1, .5)); if (pk > 0) { c.save(); c.translate(360, 1150); c.scale(pk, pk); c.fillStyle = C.blue; c.beginPath(); c.roundRect(-90, -36, 180, 72, 36); c.fill(); D.text('Follow', 0, 12, { f: 'sans', size: 32, wt: 700, col: '#fff', align: 'center' }); c.restore();
    D.text('@howitreallyworkstudio', 470, 1162, { f: 'sans', size: 34, wt: 600, a: clamp(pk) }); }
}

// ---------- compositor ----------
const SC = [[0, sceneA, 0], [s(1) - .35, sceneB, 0], [s(2) - .25, sceneC, 0], [s(3) - .3, sceneD, 0], [s(4) - .25, sceneE, 0], [s(5) - .3, sceneF, 0], [s(6) - .3, sceneG, 0],
  [s(7) - .3, sceneH, 0], [s(8) - .2, sceneI, 0], [s(10) - .3, sceneJ, 1], [s(11) - .3, sceneK, 0], [s(13) - .3, sceneL, 1], [s(15) - .35, sceneM, 0]];
const TR = .45;
function idx(t) { let i = 0; for (let k = 0; k < SC.length; k++) if (t >= SC[k][0]) i = k; return i; }
function draw(i, t) { D.clearLayer(); SC[i][1](t); }
function scene(t) { const i = idx(t), u = R(t, SC[i][0], TR), dk = i > 0 && u < 1 ? lerp(SC[i - 1][2], SC[i][2], ss(u)) : SC[i][2];
  D.ground(dk);
  if (i > 0 && u < 1) { draw(i - 1, t); if (SC[i - 1][1] === sceneI) cardBlit(t); else D.blit({ a: 1 - ss(u), z: 1 + .06 * u, blur: 14 * u }); }
  draw(i, t); if (SC[i][1] === sceneI) cardBlit(t); else D.blit({ a: i > 0 ? ss(u) : 1, z: i > 0 ? lerp(.95, 1, ex(u)) : 1, blur: i > 0 ? 12 * (1 - u) : 0 });
  const ph = PH.findLast ? PH.findLast(p => t >= p.start - .25) : null, endc = t >= s(15) - .4;
  if (!endc && ph) D.karaoke(ph, t, 1665, { dark: dk > .5, out: ph.i < PH.length - 1 ? PH[ph.i + 1].start - .2 : null });
  D.hud(t, TOT, dk);
}
function cardBlit(t) { const k = R(t, s(9) + 2.0, .8); if (k <= 0) { D.blit({}); return; } D.card(k, t / TOT, t, TOT, { cy: 860, h: 1160, src: [60, 470, 960, 1010] }); }
window.DUR = TOT;
window.seek = t => { scene(t); const f = Math.min(1, (TOT - t) / .35); if (f < 1) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1 - f; g.fillStyle = C.bg; g.fillRect(0, 0, W, H); g.restore(); } };
window.render = window.seek;
// thumbnail / cover: Distilbook "Pages. / and pages." stack + the cut magnet, HUD, no captions
window.thumb = () => { D.ground(0); D.clearLayer();
  D.marker(86, 760, 600, 44, C.pinkL, 1, .8);
  [['Cut a', C.ink], ['magnet', C.ink], ['in half?', C.blue]].forEach(([w, col], i) => D.text(w, 90, 470 + i * 168, { f: 'sans', size: 160, wt: 800, col, track: -5 })); D.text('4.1  Magnets', 94, 330, { f: 'serif', size: 50, col: C.blue });
  const y = 1080, w = 360, h = 230; barMagnet(110, y, w, h, 1, { seed: 2 }); barMagnet(610, y + 40, w, h, 1, { seed: 6 });
  D.ink(D.seg(540, y - 110, 540, y + h + 80, 8), { w: 6, dash: [22, 16], wob: 0, col: C.red }); D.text('\u2702', 540, y - 140, { f: 'sans', size: 90, align: 'center', col: C.red });
  label(['you get ', { s: 'two magnets', col: C.blue }], 540, 1520, 1, { size: 74 }); D.blit({}); D.hud(12.3, TOT, 0); };
window.seek(0); window.ready = true; window.READY = true;
