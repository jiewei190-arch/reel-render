// t_snowwhite.js: "Why is snow white if ice is clear?" in template #15 Distilbook (demo 83). Canvas2D 1080x1920, pure function of t.
// Demo moves reused: bold sans headline stack (A), search bar + tilted book page with depth blur and marker sweeps (B), dark navy rolling stack
// with blur (C), circle callout zoom (D), hand-drawn felt-tip diagrams with crayon fills, wavy arrows and handwritten labels (E-J), the diagram
// shrinking into the white video-player card (F), dark dot grid (L), logo end card with blue pill (M). Karaoke subtitle + HUD throughout.
// Batch N layout: captions at y ~1290, diagrams inside y 250-1130, nothing important in x > 900 below y 840, HUD kept out of the top 250 px.
import { createDB, W, H, TAU, C, clamp, lerp, ramp, ss, eo, ex, bo, hash, FONTS } from './styles/distilbook/distilbook.js';
await Promise.all(FONTS.map(f => document.fonts.load(f)));
const TL = window.TL, PH = TL.p, s = i => PH[i].start, e = i => PH[i].end, TOT = TL.total;
const D = createDB(document.getElementById('c')), g = D.g, lg = D.lg;
const R = ramp;
const ICE = '#cfe3fb', ICE2 = '#9fc3f2', SNOW = '#fbfcff', SHADE = '#dbe3f3', SUN = C.sun || '#f7df5a';
const RAINBOW = ['#e8574a', '#f29a3a', '#f2d24a', '#5fbf62', '#4f7be8', '#9a6ad6'];
const label = (segs, x, y, k, o = {}) => D.rich(segs.map(z => typeof z === 'string' ? { s: z } : z), x, y, { f: 'hand', size: o.size || 50, align: o.align || 'center', write: k, a: o.a });
const big = (segs, x, y, k, o = {}) => { const u = ex(k); if (u <= 0) return; lg.save(); lg.globalAlpha *= u; lg.translate(-(1 - u) * 60, 0); D.rich(segs.map(z => typeof z === 'string' ? { s: z } : z), x, y, { f: 'sans', wt: 800, size: o.size || 112, align: o.align || 'left' }); lg.restore(); };
function wavy(x0, y0, x1, y1, k, seed = 1, amp = 10, o = {}) { D.arrow(D.wave(x0, y0, x1, y1, amp, 2), { w: o.w || 4.5, prog: k, seed, len: 22, col: o.col }); }
function straight(x0, y0, x1, y1, k, o = {}) { D.arrow(D.seg(x0, y0, x1, y1, 6), { w: o.w || 6, prog: k, seed: o.seed || 1, len: o.len || 24, col: o.col, wob: o.wob ?? .8 }); }

// ---------- small reusable drawings ----------
function flake(x, y, r, a = 1, rot = 0) { const c = lg; c.save(); c.globalAlpha *= a; c.translate(x, y); c.rotate(rot); c.strokeStyle = 'rgba(61,95,217,.75)'; c.lineWidth = 2.6; c.lineCap = 'round';
  for (let i = 0; i < 6; i++) { const an = i * TAU / 6; const ex2 = Math.cos(an) * r, ey = Math.sin(an) * r; c.beginPath(); c.moveTo(0, 0); c.lineTo(ex2, ey); c.stroke();
    for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(ex2 * .55, ey * .55); c.lineTo(ex2 * .55 + Math.cos(an + sd * .8) * r * .32, ey * .55 + Math.sin(an + sd * .8) * r * .32); c.stroke(); } } c.restore(); }
function fallingFlakes(t, n = 16, y0 = 260, y1 = 1120, a = 1) { for (let i = 0; i < n; i++) { const sp = 40 + 50 * hash(i * 3.1), y = y0 + ((hash(i * 7.7) * (y1 - y0) + t * sp) % (y1 - y0)), x = 60 + hash(i * 5.3) * 820 + 18 * Math.sin(t * 1.2 + i);
  flake(x, y, 12 + 10 * hash(i), a * .8, t * .6 + i); } }
function hexPts(cx, cy, r, rot = 0) { return Array.from({ length: 7 }, (_, i) => { const a = rot + i * TAU / 6; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; }); }
function crystal(cx, cy, r, k, seed = 1, rot = 0, o = {}) { if (k <= 0) return; const p = hexPts(cx, cy, r, rot);
  D.crayon(p, o.col || ICE, { prog: k, seed, dark: 'rgba(40,80,170,1)', scribble: false, a: o.a ?? .85 });
  const c = lg; c.save(); c.globalAlpha *= clamp(k * 2) * .7; c.strokeStyle = 'rgba(255,255,255,.95)'; c.lineWidth = 4; c.beginPath(); c.moveTo(cx - r * .45, cy - r * .35); c.lineTo(cx - r * .1, cy - r * .62); c.stroke(); c.restore();
  D.ink(p, { w: o.w || 4, prog: k, seed: seed + 3, smooth: false, wob: .8 });
  if (o.facets) { for (let i = 0; i < 6; i += 2) D.ink([[cx, cy], p[i]], { w: 2.2, prog: R(k, .4, .6), seed: seed + i, col: 'rgba(29,31,36,.35)', wob: .4 }); } }
function mound(x0, x1, base, top, k, seed = 2, o = {}) { if (k <= 0) return; const n = 14, pts = [[x0, base]];
  for (let i = 0; i <= n; i++) { const u = i / n, h = Math.sin(Math.PI * u) ** .8 * (1 + .08 * Math.sin(u * 17 + seed)); pts.push([lerp(x0, x1, u), base - (base - top) * h]); } pts.push([x1, base]);
  D.crayon(pts, o.col || SNOW, { prog: k, seed, scribble: false }); const sh = pts.map(([x, y]) => [x, Math.max(y, lerp(base, top, .45) + (y - top) * .3)]);
  D.crayon(sh, SHADE, { prog: k, seed: seed + 1, dark: 'rgba(60,80,140,1)', a: .8 }); D.ink(pts.slice(1, -1), { w: 5, prog: k, seed: seed + 2 }); D.ink([[x0 - 30, base], [x1 + 30, base]], { w: 3, prog: k, seed: seed + 5, col: 'rgba(29,31,36,.4)' });
  return pts; }
function sparkle(x, y, r, a, col = C.blue) { if (a <= 0) return; const c = lg; c.save(); c.globalAlpha *= a; c.strokeStyle = col; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - r, y); c.lineTo(x + r, y); c.moveTo(x, y - r); c.lineTo(x, y + r); c.stroke(); c.lineWidth = 2; c.beginPath(); c.moveTo(x - r * .5, y - r * .5); c.lineTo(x + r * .5, y + r * .5); c.moveTo(x + r * .5, y - r * .5); c.lineTo(x - r * .5, y + r * .5); c.stroke(); c.restore(); }
function sun(x, y, r, k, t) { if (k <= 0) return; D.crayon(D.circ(x, y, r, 30), SUN, { prog: k, seed: 77, dark: 'rgba(170,120,0,1)' }); D.ink(D.circ(x, y, r, 30), { w: 4.5, prog: k, seed: 78 });
  for (let i = 0; i < 10; i++) { const a = i * TAU / 10 + .1 * Math.sin(t), r0 = r + 18, r1 = r + 46 + 8 * Math.sin(t * 3 + i); D.ink([[x + Math.cos(a) * r0, y + Math.sin(a) * r0], [x + Math.cos(a) * r1, y + Math.sin(a) * r1]], { w: 4, prog: R(k, .3 + i * .03, .3), seed: 80 + i, smooth: false }); } }
function iceCube(x, y, sz, k, t) { if (k <= 0) return; const c = lg, d = sz * .32; c.save(); c.translate(x + sz / 2, y + sz / 2); c.rotate(.03 * Math.sin(t * 1.3)); c.translate(-x - sz / 2, -y - sz / 2);
  // lines behind the cube stay visible through it: the "clear" proof
  for (let i = 0; i < 5; i++) D.ink(D.seg(x - 40, y + 40 + i * sz / 4.5, x + sz + d + 40, y + 40 + i * sz / 4.5, 6), { w: 3, prog: R(k, i * .05, .5), seed: 140 + i, col: 'rgba(29,31,36,.45)', wob: .6 });
  const front = [[x, y + d], [x + sz, y + d], [x + sz, y + sz + d], [x, y + sz + d], [x, y + d]], top = [[x, y + d], [x + d, y], [x + sz + d, y], [x + sz, y + d], [x, y + d]], side = [[x + sz, y + d], [x + sz + d, y], [x + sz + d, y + sz], [x + sz, y + sz + d], [x + sz, y + d]];
  [[front, ICE, .35], [top, '#e8f2ff', .5], [side, ICE2, .4]].forEach(([p, col, a], i) => { c.save(); c.globalAlpha *= clamp(k * 2) * a; D.path(p); c.fillStyle = col; c.fill(); c.restore(); D.ink(p, { w: 4.5, prog: k, seed: 150 + i, smooth: false, wob: .8 }); });
  { const gx = x - sz * .2 + ((t * .35 + .35) % 1.6) * sz * 1.1; c.save(); D.path(front); c.clip(); const gr = c.createLinearGradient(gx - 60, 0, gx + 60, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.5, `rgba(255,255,255,${.75 * clamp(k * 2)})`); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.translate(gx, y + d + sz / 2); c.rotate(-.5); c.fillRect(-60, -sz, 120, sz * 2); c.restore(); }
  c.save(); c.globalAlpha *= clamp(k * 2) * .9; c.strokeStyle = '#fff'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(x + sz * .15, y + d + sz * .2); c.lineTo(x + sz * .35, y + d + sz * .08); c.moveTo(x + sz * .15, y + d + sz * .38); c.lineTo(x + sz * .5, y + d + sz * .14); c.stroke(); c.restore();
  c.restore(); }

// ---------- A: hook: ice is clear, snow is white ----------
function sceneA(t) {
  fallingFlakes(t, 14);
  big(['Ice is ', { s: 'clear.', col: C.blue }], 90, 440, R(t, -1, .4));
  D.marker(386, 510, 360, 70, C.pinkL, R(t, .3, .5), .75); big(['Snow is ', { s: 'white?' }], 90, 568, 1);
  iceCube(80, 690, 290, R(t, -1, .4), t); mound(480, 890, 1080, 680, R(t, -1, .4), 4);
  for (let i = 0; i < 5; i++) sparkle(560 + i * 70, 800 + 40 * hash(i), 10 + 6 * Math.sin(t * 4 + i), .5 + .5 * Math.sin(t * 3 + i * 2));
  label(['ice'], 280, 1125, 1, { size: 58 }); label(['snow'], 690, 1125, 1, { size: 58 });
  const q = R(t, s(1) + .5, .5); if (q > 0) { wavy(330, 1080, 600, 1080, q, 5, 10); label([{ s: 'why?', col: C.blue }], 465, 1050, R(t, s(1) + .9, .4), { size: 46 }); }
}
// ---------- B: the search question + the book page ----------
const P = document.createElement('canvas'); P.width = 1500; P.height = 820; const pg = P.getContext('2d');
const LINES = ['A snowflake is made of ice, and', 'a block of ice is clear. Yet a', 'snowbank looks bright white. So', 'why is snow white, if ice is', 'clear? The answer is light.'];
const HL = []; {
  pg.fillStyle = C.blue; pg.font = D.font('serif', 96, 700); pg.fillText('7.2', 40, 120); const w0 = pg.measureText('7.2 ').width; pg.fillStyle = C.ink; pg.fillText('Snow', 40 + w0, 120);
  pg.font = D.font('serif', 58, 400); LINES.forEach((ln, i) => pg.fillText(ln, 40, 270 + i * 96));
  const find = (li, w, col, t0) => { const x = pg.measureText(LINES[li].slice(0, LINES[li].indexOf(w))).width + 40; HL.push({ x, y: 270 + li * 96 - 50, w: pg.measureText(w).width, h: 66, col, t0 }); };
  find(1, 'ice is clear', C.hlBlue || C.blueL, s(1) + .2); find(2, 'bright white', C.pinkL, s(1) + .9); find(3, 'why is snow white', C.greenL, s(1) + 1.6);
}
function sceneB(t) { const T = D.T, tg = D.tg; tg.setTransform(1, 0, 0, 1, 0, 0); tg.clearRect(0, 0, W, H); const u = ss(R(t, s(1) - .3, 4)), z = .9 + .06 * u, rot = -.07;
  tg.translate(80 - 20 * u, 520); tg.rotate(rot); tg.scale(z, z); D.use(tg); HL.forEach(h => D.marker(h.x, h.y, h.w, h.h, h.col, R(t, h.t0, .45))); tg.drawImage(P, 0, 0); D.use(lg);
  const band = (y0, y1, b) => { lg.save(); lg.beginPath(); lg.rect(0, y0, W, y1 - y0); lg.clip(); if (b) lg.filter = `blur(${b}px)`; lg.drawImage(T, 0, 0); lg.restore(); };
  band(0, 560, 6); band(560, 660, 2); band(660, 1000, 0); band(1000, 1080, 2); band(1080, 1140, 6);
  // the search bar (TikTok search: say and show the exact question)
  const k = ex(R(t, s(1) - .3, .5)), q = 'why is snow white if ice is clear', n = Math.floor(q.length * clamp(R(t, s(1) + 1.3, 1.8)));
  lg.save(); lg.globalAlpha = k; lg.shadowColor = 'rgba(40,50,80,.18)'; lg.shadowBlur = 30; lg.shadowOffsetY = 10; lg.fillStyle = '#fff'; lg.beginPath(); lg.roundRect(90, 350, 900, 104, 52); lg.fill(); lg.shadowColor = 'transparent';
  D.ink(D.circ(160, 400, 22, 24), { w: 4.5, seed: 200 }); D.ink([[176, 416], [194, 434]], { w: 5, wob: 0 });
  D.text(q.slice(0, n) + ((t * 2) % 1 < .5 && n < q.length ? '|' : ''), 212, 416, { f: 'sans', size: 44, wt: 600 }); lg.restore();
}
// ---------- C: dark rolling stack: there's no white in snow ----------
const STACK = ['white paint?', 'white dye?', 'white powder?', 'none at all.'];
function sceneC(t) { const t0 = s(2), c = lg, prog = ss(R(t, t0 + .2, 2.0)), cur = prog * (STACK.length - 1), gone = R(t, t0 + 2.3, .5);
  STACK.forEach((w, i) => { const d = i - cur, y = 760 + d * 130, a = clamp(1 - Math.abs(d) * .45) * (1 - gone); if (a <= .01) return; c.save(); c.filter = `blur(${Math.min(10, Math.abs(d) * 5)}px)`; c.globalAlpha = a;
    D.text(w, 540, y, { f: i % 2 ? 'serifI' : 'sans', size: i % 2 ? 88 : 100, wt: i % 2 ? 400 : 800, col: i === 3 ? C.pink : '#f2f4fa', align: 'center', track: -2 }); c.restore(); });
  D.text('0', 540, 1080, { f: 'sans', size: 200, wt: 800, col: C.pink, align: 'center', a: R(t, t0 + .3, .4) * (1 - gone), track: -6 }); D.text('white pigment in snow', 540, 1125, { f: 'sans', size: 34, wt: 600, col: '#dfe5f5', align: 'center', a: R(t, t0 + .8, .4) * (1 - gone) });
  if (gone > 0) { D.text('Just clear ice', 540, 720, { f: 'sans', size: 104, wt: 800, col: '#f2f4fa', align: 'center', a: ex(gone), track: -3 }); D.text('and air.', 540, 850, { f: 'serifI', size: 96, col: '#8fb0ff', align: 'center', a: ex(R(t, t0 + 2.5, .4)) }); }
}
// ---------- D: zoom in: mostly air + tiny crystals (circle callout) ----------
const CRY = Array.from({ length: 13 }, (_, i) => ({ x: 640 + Math.cos(i * 2.4) * (40 + 190 * Math.sqrt(hash(i * 3.3))), y: 640 + Math.sin(i * 2.4) * (40 + 190 * Math.sqrt(hash(i * 3.3))), r: 30 + 26 * hash(i * 1.9), rot: hash(i * 5.1) }));
function sceneD(t) { const t0 = s(3); mound(90, 520, 1110, 830, R(t, t0 - .4, .7), 6);
  const ck = R(t, t0 + .1, .8); D.ink(D.circ(640, 640, 290, 60), { w: 5, prog: ck, seed: 31 }); D.ink(D.circ(330, 960, 44, 24), { w: 4, prog: ck, seed: 32 }); D.ink([[364, 930], [450, 860]], { w: 4, prog: R(t, t0 + .4, .4), seed: 33 });
  lg.save(); lg.beginPath(); lg.arc(640, 640, 282, 0, TAU); lg.clip(); lg.globalAlpha = clamp(ck * 2) * .6; lg.fillStyle = '#f3f7ff'; lg.fillRect(340, 340, 600, 600); lg.restore();
  CRY.forEach((q, i) => crystal(q.x, q.y, q.r, bo(R(t, t0 + .7 + i * .08, .5)), 40 + i, q.rot, { w: 3.4 }));
  const ak = R(t, t0 + 1.6, .6); if (ak > 0) { D.marker(560, 1000, 160, 66, C.hlBlue || C.blueL, ak, .7); label(['mostly ', { s: 'air', col: C.blue }], 590, 1050, R(t, t0 + 1.5, .6), { size: 60 }); }
  label(['tiny clear ice crystals'], 600, 310, R(t, t0 + 2.6, 1.0), { size: 52 }); label(['zoom in'], 250, 760, R(t, t0, .5), { size: 42, a: .8 });
}
// ---------- E: one crystal: flat faces, bounce, bend; then crystal after crystal ----------
const CHAIN = [[220, 560, 80, .2], [430, 760, 95, .7], [300, 990, 70, 1.3], [580, 1010, 85, .4], [760, 800, 90, 1.1]];
function sceneE(t) { const t0 = s(4), chain = ss(R(t, s(6) - .4, .8));
  if (chain < 1) { const a = 1 - chain; lg.save(); lg.globalAlpha = a;
    crystal(540, 760, 250, R(t, t0 - .3, .8), 60, 0, { facets: true, w: 5 });
    const fk = R(t, t0 + .6, .6); if (fk > 0) { const p = hexPts(540, 760, 250); [[p[0], p[1]], [p[4], p[5]]].forEach(([a1, b1], j) => D.marker(Math.min(a1[0], b1[0]), Math.min(a1[1], b1[1]) - 8, Math.abs(b1[0] - a1[0]) + 10, Math.abs(b1[1] - a1[1]) + 16, j ? C.pinkL : C.greenL, R(fk, j * .3, .5), .45));
      label(['flat ', { s: 'faces', col: C.blue }], 540, 430, R(t, t0 + .9, .6), { size: 64 }); }
    // light hits the top-left face
    const st = s(5); sun(190, 440, 58, R(t, st - .2, .6), t); const hp = [400, 560];
    straight(240, 490, hp[0], hp[1], R(t, st + .1, .7), { col: '#c99a00', w: 7, seed: 70 });
    const bk = R(t, st + 1.3, .5); if (bk > 0) { straight(hp[0], hp[1], hp[0] - 120, hp[1] + 40, bk, { col: '#c99a00', w: 5, seed: 71 }); label([{ s: 'bounces off', col: C.blue }], 190, 640, R(t, st + 1.5, .5), { size: 46 }); }
    const nk = R(t, st + 2.6, .7); if (nk > 0) { straight(hp[0], hp[1], 560, 860, nk, { col: '#c99a00', w: 7, seed: 72 }); label(['goes in and ', { s: 'bends', col: C.blue }], 680, 1100, R(t, st + 3.0, .6), { size: 50 }); }
    lg.restore(); }
  if (chain > 0) { lg.save(); lg.globalAlpha = chain; CHAIN.forEach(([x, y, r, rot], i) => crystal(x, y, r, bo(R(t, s(6) - .3 + i * .1, .5)), 90 + i, rot, { w: 4 }));
    const path = [[150, 430], ...CHAIN.map(([x, y]) => [x, y]), [900, 600]], pk = R(t, s(6) + .2, 2.6); D.ink(path, { w: 6, prog: pk, col: '#c99a00', seed: 95, smooth: false, wob: .6 });
    CHAIN.forEach(([x, y], i) => { const hk = R(pk, (i + 1) / (CHAIN.length + 1), .05); if (hk > 0) { straight(x, y, x + 60 * Math.cos(i * 2.1), y + 60 * Math.sin(i * 2.1), hk, { col: '#c99a00', w: 3.5, len: 14, seed: 96 + i }); sparkle(x, y, 18, hk * (.6 + .4 * Math.sin(t * 6 + i))); } });
    sun(140, 420, 48, 1, t); label(['and the next...'], 640, 1100, R(t, s(6) + 1.5, .7), { size: 52 }); lg.restore(); }
}
// ---------- F: back out, in every direction (then the video-player card) ----------
function sceneF(t) { const t0 = s(7); mound(150, 930 - 30, 1080, 760, R(t, t0 - .4, .6), 8); sun(170, 430, 56, R(t, t0 - .3, .5), t);
  for (let i = 0; i < 6; i++) straight(220 + i * 30, 480 + i * 10, 380 + i * 70, 800, R(t, t0 + .1 + i * .06, .5), { col: '#c99a00', w: 4, len: 16, seed: 110 + i });
  for (let i = 0; i < 18; i++) { const a = -Math.PI + .15 + i / 17 * (Math.PI - .3), cx = 520 + Math.cos(a) * 140, cy = 900 + Math.sin(a) * 80, L = 130 + 60 * hash(i);
    straight(cx, cy, cx + Math.cos(a) * L, cy + Math.sin(a) * L, R(t, t0 + 1.2 + i * .05, .5), { col: C.blue, w: 4.5, len: 16, seed: 120 + i }); }
  label(['back out, in ', { s: 'every direction', col: C.blue }], 540, 1130, R(t, t0 + 1.8, .8), { size: 50 });
  label(['where does it go?'], 640, 330, R(t, t0, .7), { size: 54 }); }
// ---------- G: every color comes back = white ----------
function sceneG(t) { const t0 = s(8); mound(260, 820, 1080, 840, R(t, t0 - .4, .6), 9);
  RAINBOW.forEach((col, i) => { straight(80 + i * 26, 360 + i * 30, 420 + i * 18, 880, R(t, t0 + .2 + i * .1, .6), { col, w: 8, len: 20, seed: 130 + i }); });
  const ok = R(t, t0 + 2.0, .3); RAINBOW.forEach((col, i) => { const m = R(t, s(9) - .1, .9), x1 = lerp(870 - i * 24, 860, m), y1 = lerp(320 + i * 34, 360, m); straight(600 + i * 16, 860, x1, y1, R(ok, i * .1, .6), { col: m > .9 ? C.ink : col, w: m > .9 ? 4 : 8, len: 20, seed: 140 + i }); });
  label([{ s: 'every color', col: C.blue }, ' comes back'], 540, 1130, R(t, t0 + 2.6, .7), { size: 50 });
  const wk = R(t, s(9) + .3, .6); if (wk > 0) { lg.save(); lg.globalAlpha *= ex(wk); lg.shadowColor = 'rgba(40,50,80,.2)'; lg.shadowBlur = 40; lg.fillStyle = '#fff'; lg.beginPath(); lg.roundRect(560, 380, 340, 200, 30); lg.fill(); lg.restore();
    D.text('= white', 730, 510, { f: 'sans', size: 92, wt: 800, align: 'center', a: ex(wk), track: -3 }); D.ink(D.rect(560, 380, 340, 200), { w: 4, prog: wk, seed: 150, smooth: false }); } }
// ---------- H: dazzling in the sun ----------
function sceneH(t) { const t0 = s(10); sun(220, 470, 90, R(t, t0 - .4, .6), t); mound(-40, 560, 1110, 820, R(t, t0 - .3, .6), 11); mound(380, 900, 1110, 900, R(t, t0 - .2, .6), 12);
  for (let i = 0; i < 22; i++) { const x = 60 + hash(i * 2.2) * 800, y = 860 + hash(i * 4.4) * 220; sparkle(x, y, 8 + 10 * hash(i), R(t, t0 + i * .05, .3) * (.3 + .7 * Math.abs(Math.sin(t * 3.3 + i * 1.7))), i % 3 ? C.blue : C.pink); }
  const dk = R(t, t0 + .7, .6); if (dk > 0) { D.marker(340, 560, 400, 84, C.hlYellow || '#f7e98c', dk, .8); big(['dazzling'], 540, 630, R(t, t0 + .6, .5), { align: 'center', size: 100 }); } }
// ---------- I: the smashed windowpane (Libbrecht's comparison) ----------
const SHARDS = Array.from({ length: 22 }, (_, i) => ({ x: 300 + hash(i * 1.3) * 480, y: 380 + hash(i * 2.9) * 460, tx: 330 + hash(i * 4.7) * 420, ty: 1000 + hash(i * 6.1) * 90, r: 30 + 30 * hash(i * 8.3), rot: hash(i) * TAU }));
function sceneI(t) { const t0 = s(11), crack = R(t, t0 + .5, .5), fall = R(t, t0 + 2.4, 1.0), white = R(t, t0 + 3.3, 1.0);
  if (fall < .05) { lg.save(); lg.globalAlpha *= .4; lg.fillStyle = ICE; lg.fillRect(290, 360, 500, 500); lg.restore(); D.ink(D.rect(270, 340, 540, 540), { w: 10, prog: R(t, t0 - .3, .5), seed: 160, smooth: false, col: '#7a5a3a' });
    for (let i = 0; i < 5; i++) D.ink(D.seg(310, 400 + i * 100, 760, 400 + i * 100, 6), { w: 2.5, col: 'rgba(29,31,36,.3)', seed: 165 + i });
    lg.save(); lg.strokeStyle = '#fff'; lg.lineWidth = 8; lg.globalAlpha *= .8; lg.beginPath(); lg.moveTo(340, 440); lg.lineTo(420, 380); lg.moveTo(340, 520); lg.lineTo(480, 400); lg.stroke(); lg.restore();
    for (let i = 0; i < 9; i++) { const a = i * TAU / 9 + .3; D.ink([[560, 600], [560 + Math.cos(a) * 120, 600 + Math.sin(a) * 120], [560 + Math.cos(a + .2) * 260, 600 + Math.sin(a + .2) * 260]], { w: 3, prog: R(crack, i * .05, .5), seed: 170 + i, smooth: false }); }
    label(['clear glass'], 540, 310, R(t, t0, .5), { size: 56 }); }
  else { D.ink(D.rect(270, 340, 540, 540), { w: 10, seed: 160, smooth: false, col: '#7a5a3a', a: 1 - fall * .7 });
    SHARDS.forEach((q, i) => { const u = ss(R(fall, i * .02, .7)), x = lerp(q.x, q.tx, u), y = lerp(q.y, q.ty, u) - Math.sin(u * Math.PI) * 40, p = [0, 1, 2, 3].map(j => [x + Math.cos(q.rot + j * 1.7) * q.r * (j % 2 ? .6 : 1), y + Math.sin(q.rot + j * 1.7) * q.r * (j % 2 ? .6 : 1)]);
      lg.save(); D.path(p); lg.fillStyle = white > 0 ? `rgba(${Math.round(lerp(207, 252, white))},${Math.round(lerp(227, 253, white))},255,${lerp(.5, 1, white)})` : 'rgba(207,227,251,.5)'; lg.fill(); lg.restore(); D.ink([...p, p[0]], { w: 2.6, seed: 180 + i, smooth: false, col: 'rgba(29,31,36,.6)' }); });
    label(['the pile looks ', { s: 'white', col: C.blue }], 540, 930, R(t, t0 + 3.4, .6), { size: 56 }); }
  D.text('comparison: Caltech physicist Kenneth Libbrecht', 540, 1125, { f: 'mono', size: 22, col: C.mid, align: 'center', a: R(t, t0 + .4, .5) }); }
// ---------- J: poke a deep hole: it glows blue; red soaked up; deeper = bluer ----------
function sceneJ(t) { const t0 = s(12), c = lg; const bx = 110, bw = 780, top = 470, bot = 1110;
  c.save(); c.fillStyle = SNOW; c.fillRect(bx, top, bw, bot - top); c.restore(); D.hatch([[bx, top], [bx + bw, top], [bx + bw, bot], [bx, bot]], 'rgba(61,95,217,.12)', { sp: 22 });
  for (let i = 1; i < 6; i++) D.ink(D.wave(bx + 10, top + i * 110, bx + bw - 10, top + i * 110, 6, 3), { w: 2.4, col: 'rgba(29,31,36,.25)', seed: 190 + i });
  D.ink([[bx - 20, top], [bx + bw + 20, top]], { w: 5, seed: 196 }); label(['snow'], 230, top - 30, R(t, t0, .4), { size: 48 });
  // the stick pokes down, leaving a hole
  const pk = ss(R(t, t0 + .3, 1.4)), hd = top + (1000 - top) * pk, hx = 470;
  if (pk > 0) { const glowK = R(t, s(13) - .1, .8), hole = [[hx - 46, top], [hx + 46, top], [hx + 22, hd], [hx - 22, hd]];
    lg.save(); D.path(hole); lg.clip(); const gr = lg.createLinearGradient(0, top, 0, hd); gr.addColorStop(0, `rgba(210,228,255,${.6 + .4 * glowK})`); gr.addColorStop(1, `rgba(${Math.round(lerp(190, 40, glowK))},${Math.round(lerp(210, 110, glowK))},${Math.round(lerp(240, 235, glowK))},1)`); lg.fillStyle = gr; lg.fillRect(hx - 50, top, 100, hd - top); lg.restore();
    D.ink([...hole, hole[0]], { w: 3.5, seed: 197, smooth: false }); const so = 1 - R(t, t0 + 2.0, .5); if (so > 0) { lg.save(); lg.globalAlpha *= so; D.ink([[hx, hd - 10], [hx + 30, top - 260]], { w: 12, col: '#8a6a44', seed: 198, wob: 0 }); lg.restore(); } }
  const ek = R(t, t0 - .2, .5); if (ek > 0) { D.ink(D.circ(hx, 330, 46, 30, .5), { w: 4, prog: ek, seed: 199 }); D.dot(hx, 334, 14, C.ink, ek); label(['look inside'], 690, 340, R(t, t0 + .8, .5), { size: 48 }); }
  const bk = R(t, s(13), .4); if (bk > 0) { big([{ s: 'blue!', col: C.blue }], 590, 690, bk, { size: 110 }); }
  // light going in: red fades first, blue survives deepest and comes back
  const lk = R(t, s(14) - .1, .3); if (lk > 0) { const x0 = 680; [['#e8574a', 230], ['#5fbf62', 380], ['#4f7be8', 560]].forEach(([col, depth], i) => { const k = R(t, s(14) + i * .5, 1.0), x = x0 + i * 60, yEnd = top + depth * k;
      for (let j = 0; j < 12; j++) { const y = top + (yEnd - top) * j / 12, fade = 1 - (j / 12) * (i === 2 ? .3 : .9); if (y >= yEnd) break; D.ink([[x, y], [x, y + (yEnd - top) / 12]], { w: 7, col, a: fade * lk, seed: 210 + i * 20 + j, wob: .3, smooth: false }); } });
    const up = R(t, s(14) + 2.0, .8); if (up > 0) straight(800, top + 540, 820, top - 60, up, { col: C.blue, w: 7, seed: 240 }); label(['long path: ', { s: 'red absorbed', col: '#d94c3f' }, ', ', { s: 'blue survives', col: C.blue }], 500, 1150 - 20, R(t, s(14) + 1.6, .7), { size: 42 }); }
  const dk = R(t, s(15), .6); if (dk > 0) { D.ink([[bx - 40, top], [bx - 40, top + 560]], { w: 4, prog: dk, seed: 250 }); for (let i = 0; i <= 4; i++) D.ink([[bx - 52, top + i * 140], [bx - 28, top + i * 140]], { w: 3, prog: dk, seed: 251 + i, wob: 0 });
    lg.save(); const gr = lg.createLinearGradient(0, top, 0, top + 560); gr.addColorStop(0, 'rgba(230,240,255,1)'); gr.addColorStop(1, 'rgba(40,110,235,1)'); lg.globalAlpha = dk; lg.fillStyle = gr; lg.fillRect(bx - 34, top, 18, 560 * dk); lg.restore();
    label(['deeper = ', { s: 'bluer', col: C.blue }], 300, 1110 - 6, R(t, s(15) + .5, .6), { size: 44 }); }
}
// ---------- K: the answer, as a bold stack + the snow pile ----------
function sceneK(t) { const t0 = s(16);
  big(['clear ice'], 90, 380, R(t, t0, .5), { size: 96 }); big(['+ ', { s: 'countless faces', col: C.blue }], 90, 500, R(t, t0 + 1.0, .5), { size: 96 });
  big(['= every color back'], 90, 620, R(t, t0 + 3.2, .5), { size: 80 }); const wk = R(t, t0 + 4.6, .5); if (wk > 0) { D.marker(86, 690, 360, 80, C.pinkL, wk, .75); big(['= white.'], 90, 760, wk, { size: 108 }); }
  mound(140, 860, 1110, 880, R(t, t0 - .3, .6), 13); CRY.slice(0, 8).forEach((q, i) => crystal(300 + i * 62, 980 + 30 * Math.sin(i * 1.7), 22, R(t, t0 + 1.2 + i * .06, .4), 300 + i, q.rot, { w: 2.6 }));
  for (let i = 0; i < 9; i++) { const a = -Math.PI + .3 + i / 8 * (Math.PI - .6); straight(500 + Math.cos(a) * 160, 980 + Math.sin(a) * 60, 500 + Math.cos(a) * 300, 980 + Math.sin(a) * 160, R(t, t0 + 3.4 + i * .05, .5), { col: C.blue, w: 3.5, len: 14, seed: 320 + i }); } }
// ---------- L: dark dot grid: the question ----------
function sceneL(t) { const t0 = s(17), c = lg; for (let y = 280; y < 1140; y += 30) for (let x = 60; x < W - 40; x += 30) { const a = .12 + .18 * (.5 + .5 * Math.sin(x * .013 + y * .009 - t * 2.2)); c.fillStyle = `rgba(210,220,250,${a})`; c.fillRect(x, y, 3.2, 3.2); }
  const u = ex(R(t, t0 - .1, .6)); D.text('Snow that', 540, 560, { f: 'sans', size: 100, wt: 800, col: '#f2f4fa', align: 'center', a: u, track: -3 }); D.text('glows blue?', 540, 680, { f: 'sans', size: 100, wt: 800, col: '#8fb0ff', align: 'center', a: u, track: -3 });
  const q = bo(R(t, t0 + 1.4, .5)); if (q > 0) { c.save(); c.translate(540, 900); c.scale(q, q); D.text('Yes or no?', 0, 0, { f: 'sans', size: 120, wt: 800, col: C.pink, align: 'center', track: -4 }); c.restore(); } }
// ---------- M: standard end card ----------
function sceneM(t) { const t0 = s(18) - .2, c = lg; const u = ex(R(t, t0, .7));
  c.save(); c.globalAlpha = u; D.logo(476, 620, 3.0, 1, c); c.restore();
  D.text('Follow for more of', 540, 780, { f: 'sans', size: 68, wt: 700, align: 'center', a: ex(R(t, t0 + .2, .6)), track: -1 });
  D.text('how it really works.', 540, 890, { f: 'sans', size: 92, wt: 800, align: 'center', a: ex(R(t, t0 + .4, .6)), track: -3 });
  D.text("A new 'wait, really?' every day.", 540, 970, { f: 'sans', size: 38, wt: 600, col: C.mid, align: 'center', a: R(t, t0 + .8, .5) });
  const pk = bo(R(t, t0 + 1.0, .5)); if (pk > 0) { c.save(); c.translate(330, 1070); c.scale(pk, pk); c.fillStyle = C.blue; c.beginPath(); c.roundRect(-90, -36, 180, 72, 36); c.fill(); D.text('Follow', 0, 12, { f: 'sans', size: 32, wt: 700, col: '#fff', align: 'center' }); c.restore();
    D.text('@howitreallyworkstudio', 440, 1082, { f: 'sans', size: 34, wt: 600, a: clamp(pk) }); } }

// ---------- HUD (demo layout, moved below the top 250 px; no bottom timecode, that zone is the platform UI) ----------
function hud(t, dk) { const c = g; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.filter = 'none'; const ink = dk > .5 ? 'rgba(226,232,248,' : 'rgba(30,34,46,';
  c.strokeStyle = ink + '.5)'; c.lineWidth = 2.5; const m = 44, q = 34, yt = 210, yb = H - 500;
  [[m, yt, 1, 1], [W - m, yt, -1, 1], [m, yb, 1, -1], [W - m, yb, -1, -1]].forEach(([x, y, sx, sy]) => { c.beginPath(); c.moveTo(x, y + sy * q); c.lineTo(x, y); c.lineTo(x + sx * q, y); c.stroke(); });
  D.logo(78, 286, .55, 1, c); c.font = D.font('sans', 22, 800); c.fillStyle = ink + '.92)'; c.letterSpacing = '3px'; c.textAlign = 'left'; c.fillText('HOWITREALLYWORKS', 112, 283);
  const f = Math.floor(t * 30); c.font = D.font('mono', 20, 500); c.fillStyle = ink + '.45)'; c.fillText(`STUDIO 2026  F${String(f).padStart(4, '0')}`, 112, 310);
  const beat = 60 / 88, bar = Math.floor(t / (4 * beat)) + 1, bars = Math.ceil(TOT / (4 * beat)); c.textAlign = 'right'; c.fillStyle = ink + '.5)'; c.fillText(`BAR ${String(bar).padStart(2, '0')}/${bars}`, W - 196, 283);
  c.font = D.font('mono', 20, 700); c.fillStyle = ink + '.9)'; c.fillText('88 BPM', W - 80, 283); c.restore(); }

// ---------- lower band: faint ruled book-page texture + margin rule + pencil doodle flakes (no text; that zone is the platform UI) ----------
function pageBand(t, dk) { const c = g; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); const ink = dk > .5 ? '226,232,248' : '61,95,217';
  for (let y = 1470; y < 1880; y += 44) { c.strokeStyle = `rgba(${ink},.09)`; c.lineWidth = 2; c.beginPath(); c.moveTo(70, y); c.lineTo(W - 70, y + 2 * Math.sin(y)); c.stroke(); }
  c.strokeStyle = 'rgba(242,122,155,.22)'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(150, 1450); c.lineTo(150, 1890); c.stroke();
  for (let i = 0; i < 6; i++) { const x = 230 + i * 130 + 20 * Math.sin(i * 2.3), y = 1560 + 160 * hash(i * 3.3) + 6 * Math.sin(t * .8 + i), r = 14 + 8 * hash(i); c.strokeStyle = `rgba(${ink},.16)`; c.lineWidth = 2;
    for (let j = 0; j < 6; j++) { const a = j * TAU / 6 + t * .1; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); c.stroke(); } }
  c.restore(); }
// ---------- compositor ----------
const SC = [[0, sceneA, 0], [s(1) - .2, sceneB, 0], [s(2) - .25, sceneC, 1], [s(3) - .3, sceneD, 0], [s(4) - .3, sceneE, 0], [s(7) - .3, sceneF, 0], [s(8) - .3, sceneG, 0],
  [s(10) - .3, sceneH, 0], [s(11) - .3, sceneI, 0], [s(12) - .3, sceneJ, 0], [s(16) - .3, sceneK, 0], [s(17) - .3, sceneL, 1], [s(18) - .3, sceneM, 0]];
const TR = .45;
function idx(t) { let i = 0; for (let k = 0; k < SC.length; k++) if (t >= SC[k][0]) i = k; return i; }
function draw(i, t) { D.clearLayer(); SC[i][1](t); }
function cardBlit(t) { const k = R(t, e(7) - .6, .7); if (k <= 0) { D.blit({}); return; } D.card(k, t / TOT, t, TOT, { cy: 700, h: 900, src: [70, 260, 940, 900] }); }
function scene(t) { const i = idx(t), u = R(t, SC[i][0], TR), dk = i > 0 && u < 1 ? lerp(SC[i - 1][2], SC[i][2], ss(u)) : SC[i][2];
  D.ground(dk);
  if (i > 0 && u < 1) { draw(i - 1, t); if (SC[i - 1][1] === sceneF) cardBlit(t); else D.blit({ a: 1 - ss(u), z: 1 + .06 * u, blur: 14 * u }); }
  draw(i, t); if (SC[i][1] === sceneF) cardBlit(t); else D.blit({ a: i > 0 ? ss(u) : 1, z: i > 0 ? lerp(.95, 1, ex(u)) : 1, blur: i > 0 ? 12 * (1 - u) : 0 });
  const ph = PH.findLast(p => t >= p.start - .25), endc = t >= s(18) - .4;
  if (!endc && ph) D.karaoke(ph, t, 1290, { dark: dk > .5, out: ph.i < PH.length - 1 ? PH[ph.i + 1].start - .2 : null, maxW: 860 });
  pageBand(t, dk); hud(t, dk);
  // loop: the last 0.8 s dissolves (at most 50%) toward the frame-0 image so the replay flows on
  const lp = R(t, TOT - .5, .5); if (lp > 0) { D.clearLayer(); sceneA(0); g.save(); g.globalAlpha = .4 * ss(lp); g.drawImage(D.L, 0, 0); g.restore(); }
}
window.CUES = [['pop', .3], ['scribble', s(1) + 1.3, s(1) + 3.0], ['whoosh', s(2) - .25], ['pop', s(2) + 2.3], ['whoosh', s(3) - .3], ['scribble', s(3) + .1, s(3) + .9], ['pop', s(3) + .8], ['pop', s(3) + 1.2],
  ['whoosh', s(4) - .3], ['scribble', s(5) + .1, s(5) + .8], ['pop', s(5) + 1.3], ['scribble', s(6) + .2, s(6) + 2.8], ['whoosh', s(7) - .3], ['sparkle', s(7) + 1.2], ['pageturn', e(7) - .6], ['whoosh', s(8) - .3],
  ['sparkle', s(9) + .3], ['chime', s(9) + .3, 84], ['whoosh', s(10) - .3], ['sparkle', s(10) + .3], ['whoosh', s(11) - .3], ['thud', s(11) + .5], ['pop', s(11) + 2.4], ['whoosh', s(12) - .3], ['slide', s(12) + .3],
  ['chime', s(13), 88], ['scribble', s(14), s(14) + 2.0], ['whoosh', s(16) - .3], ['pop', s(16) + 4.6], ['whoosh', s(17) - .3], ['pop', s(17) + 1.4], ['chime', s(18), 84]];
window.DUR = TOT;
window.seek = t => scene(t);
window.render = window.seek;
window.thumb = () => { D.ground(0); D.clearLayer(); fallingFlakes(2, 12);
  D.text('Why is', 90, 520, { f: 'sans', size: 170, wt: 800, track: -6 }); D.marker(86, 600, 560, 120, C.pinkL, 1, .75); D.text('snow', 90, 700, { f: 'sans', size: 170, wt: 800, track: -6 }); D.text('white?', 90, 880, { f: 'sans', size: 170, wt: 800, col: C.blue, track: -6 });
  iceCube(110, 1050, 230, 1, 1); mound(470, 900, 1440, 1110, 1, 4); label(['ice is clear...'], 270, 1520, 1, { size: 56 }); D.blit({}); hud(12.3, 0); };
window.seek(0); window.ready = true; window.READY = true;
