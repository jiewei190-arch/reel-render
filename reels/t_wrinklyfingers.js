// t_wrinklyfingers.js: "Why do your fingers wrinkle in water?" in template #15 Distilbook (demo 83). Canvas2D 1080x1920, pure function of t.
// Demo moves reused: bold stacked lines with the last line in blue ("Pages. / and pages."), tilted serif book page with depth blur and marker
// sweeps, hand-drawn felt-tip diagrams with crayon fills, hatching, circle callouts, wavy arrows and handwritten labels with one blue word,
// the diagram shrinking into the white video-player card, dark navy slide with a big pink counter, white editor card, logo end card with a pill.
// Safe zones (LESSONS 11): content between y 250 and ~1150, karaoke at y 1330, nothing important in the bottom 480 px or the right column below 840.
import { createDB, W, H, TAU, C, clamp, lerp, ramp, ss, eo, ex, bo, hash, FONTS } from './styles/distilbook/distilbook.js';
await Promise.all(FONTS.map(f => document.fonts.load(f)));
const TL = window.TL, PH = TL.p, s = i => PH[i].start, e = i => PH[i].end, TOT = TL.total;
const D = createDB(document.getElementById('c')), g = D.g, lg = D.lg, R = ramp;
const SKIN = '#f3c4a2', SKIND = 'rgba(150,70,40,1)', VES = '#ef6b7c', NERVE = C.blue;
const label = (segs, x, y, k, o = {}) => D.rich(segs.map(z => typeof z === 'string' ? { s: z } : z), x, y, { f: 'hand', size: o.size || 48, align: o.align || 'center', write: k, a: o.a });
const stack = (lines, x, y, k, o = {}) => lines.forEach(([w, col], i) => D.text(w, x, y + i * (o.lh || 150), { f: 'sans', size: o.size || 140, wt: 800, col, track: -5, a: R(k, i * .25, .3), align: o.align }));

// ---------- fingertip (palm side): outline, crayon skin, nail hint, wrinkles grow with wr ----------
function tipPts(x, y, w, h) { const r = w / 2, o = []; for (let i = 0; i <= 20; i++) { const a = Math.PI + i / 20 * Math.PI; o.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); } o.push([x + r, y + h], [x - r, y + h], [x - r, y]); return o; }
function fingertip(x, y, w, h, wr, k, o = {}) { if (k <= 0) return; const pts = tipPts(x, y, w, h);
  D.crayon(pts, o.col || SKIN, { prog: R(k, .2, .5), seed: o.seed || 3, dark: SKIND });
  D.ink(pts, { w: 6, prog: R(k, 0, .5), seed: o.seed || 3 });
  if (wr > 0) { const c = D.ctx(); c.save(); D.path(pts); c.clip(); const n = 9, seed = o.pat || 7;
    for (let i = 0; i < n; i++) { const yy = y - w * .38 + i * (h * .9 + w * .3) / n, amp = 10 + hash(seed + i) * 8, ph = hash(seed * 3 + i) * TAU, pts2 = [];
      for (let j = 0; j <= 16; j++) { const xx = x - w / 2 + j * w / 16; pts2.push([xx, yy + Math.sin(j * .9 + ph) * amp * wr + (hash(seed + i * 5 + j) - .5) * 6]); }
      D.ink(pts2, { w: 3.6, prog: R(wr, i * .05, .5), seed: seed + i, col: 'rgba(120,50,30,.75)', wob: .8 }); }
    for (let i = 0; i < 6; i++) { const xx = x - w * .3 + i * w * .12, y0 = y - w * .2 + hash(seed + i * 9) * h * .3; D.ink(D.seg(xx, y0, xx + (hash(i) - .5) * 30, y0 + h * .35, 4), { w: 3, prog: R(wr, .3 + i * .05, .4), seed: seed + 40 + i, col: 'rgba(120,50,30,.55)' }); }
    c.restore(); } }
// water line with crayon blue + bubbles
function water(y0, t, k, o = {}) { if (k <= 0) return; const pts = []; for (let i = 0; i <= 30; i++) pts.push([60 + i * 32, y0 + Math.sin(i * .7 + t * 2.4) * 10]); const body = [...pts, [1020, o.y1 || 1180], [60, o.y1 || 1180]];
  D.crayon(body, C.water, { prog: k, seed: 11, a: .55 }); D.ink(pts, { w: 5, prog: k, seed: 12, col: 'rgba(30,60,160,.9)' });
  for (let i = 0; i < 7; i++) { const ph = (t * .35 + hash(i * 3.1)) % 1, bx = 140 + hash(i * 7.7) * 800, by = lerp(o.y1 || 1150, y0 + 30, ph); D.ink(D.circ(bx, by, 9 + hash(i) * 8, 16), { w: 3, prog: k, seed: 20 + i, col: 'rgba(30,60,160,.7)' }); } }
// simple hand (palm side). fingers: [thumb, index, middle, ring, little]; wr per finger; nerve = draw median nerve
const FING = [[-250, 70, 92, 230, -.75], [-140, -330, 96, 330, -.1], [-20, -380, 100, 360, 0], [100, -340, 96, 330, .1], [205, -230, 84, 260, .22]];
function hand(x, y, sc, k, o = {}) { const c = D.ctx(); c.save(); c.translate(x, y); c.scale(sc, sc); D.use(c);
  const palm = [[-230, -40], [250, -40], [270, 240], [180, 420], [-150, 420], [-250, 200]]; D.crayon(palm, SKIN, { prog: R(k, .2, .5), seed: 31, dark: SKIND, scribble: false }); D.ink([...palm, palm[0]], { w: 6 / sc, prog: R(k, 0, .5), seed: 32 });
  FING.forEach(([fx, fy, fw, fh, rot], i) => { c.save(); c.translate(fx, fy + fh / 2); c.rotate(rot); D.use(c); fingertip(0, -fh / 2 + fw / 2, fw, fh, (o.wr || [0, 0, 0, 0, 0])[i], R(k, .1 + i * .06, .5), { seed: 40 + i, pat: 3 + i }); c.restore(); D.use(c); });
  if (o.glab) { [[-130, -320], [-10, -370], [110, -330], [210, -220], [-250, 90]].forEach(([fx, fy], i) => D.marker(fx - 40, fy - 10, 80, 60, C.greenL, R(o.glab, i * .08, .3), .7)); D.marker(-170, 60, 360, 280, C.greenL, R(o.glab, .4, .4), .45); }
  if (o.nerve) { const np = [[40, 640], [20, 420], [-20, 250], [-60, 120], [-120, -20], [-150, -200]]; D.ink(np, { w: 9 / sc, prog: o.nerve, seed: 50, col: NERVE });
    D.ink([[-40, 160], [-170, 60], [-250, 0]], { w: 7 / sc, prog: R(o.nerve, .4, .5), seed: 51, col: NERVE }); D.ink([[-30, 140], [0, -40], [-20, -260]], { w: 7 / sc, prog: R(o.nerve, .5, .5), seed: 52, col: NERVE }); }
  c.restore(); D.use(lg); }

// ---------- A: hook: fingertip in warm water, wrinkles forming ----------
function sceneA(t) { water(820, t, 1, { y1: 1160 }); const wr = .35 + .65 * ss(R(t, 0, 3.4)), bob = Math.sin(t * 1.6) * 8;
  fingertip(540, 620 + bob, 330, 560, wr, 1, { seed: 5, pat: 9 }); water(820, t + .3, 1, { y1: 1160 });
  D.ink(D.circ(700, 760 + bob, 120, 40), { w: 5, prog: R(t, 1.2, .8), seed: 60, col: C.red }); label([{ s: 'folds', col: C.blue }, ' already'], 830, 600, R(t, 1.6, .8), { size: 46 });
  stack([['Not soggy.', C.ink], ['Nerves.', C.blue]], 540, 330, t < .05 ? 1 : R(t, -.4, .3), { size: 118, lh: 130, align: 'center' }); }

// ---------- B: the book page with the search question ----------
const P = document.createElement('canvas'); P.width = 1500; P.height = 1000; const pg = P.getContext('2d');
const LINES = ['Why do your fingers wrinkle', 'in water? The skin of the', 'fingertips, palms and soles folds', 'after a warm soak. It is not just', 'soggy skin: the wrinkling needs', 'working nerves.'];
const HL = []; { pg.fillStyle = C.blue; pg.font = D.font('serif', 104, 700); pg.fillText('5.2', 40, 130); const w = pg.measureText('5.2 ').width; pg.fillStyle = C.ink; pg.fillText('Wet skin', 40 + w, 130);
  pg.font = D.font('serif', 60, 400); LINES.forEach((ln, i) => pg.fillText(ln, 40, 300 + i * 100));
  const find = (li, wd, col, t0) => { const x = pg.measureText(LINES[li].slice(0, LINES[li].indexOf(wd))).width + 40; HL.push({ x, y: 300 + li * 100 - 52, w: pg.measureText(wd).width, h: 68, col, t0 }); };
  find(0, 'Why do your fingers wrinkle', C.hlBlue, s(1) + .1); find(1, 'in water?', C.hlBlue, s(1) + .9); find(5, 'working nerves.', C.pinkL, s(1) + 1.9); }
function sceneB(t) { const T = D.T, tg = D.tg; tg.setTransform(1, 0, 0, 1, 0, 0); tg.clearRect(0, 0, W, H); const u = ss(R(t, s(1) - .3, 4)), z = 1.0 + .08 * u;
  tg.translate(40 - 20 * u, 470); tg.rotate(-.07); tg.scale(z, z); D.use(tg); HL.forEach(h => D.marker(h.x, h.y, h.w, h.h, h.col, R(t, h.t0, .45))); tg.drawImage(P, 0, 0); D.use(lg);
  const band = (y0, y1, b) => { lg.save(); lg.beginPath(); lg.rect(0, y0, W, y1 - y0); lg.clip(); if (b) lg.filter = `blur(${b}px)`; lg.drawImage(T, 0, 0); lg.restore(); };
  band(0, 480, 7); band(480, 600, 3); band(600, 1000, 0); band(1000, 1110, 3); band(1110, H, 8); }

// ---------- C: the clue: median nerve cut -> those fingers stay smooth ----------
function sceneC(t) { const t0 = s(2), cut = R(t, t0 + 1.2, .4), wrk = ss(R(t, t0 + 2.0, 1.6)), wr = [0, 0, 0, wrk, wrk];
  hand(560, 760, .9, R(t, t0 - .3, 1), { wr, nerve: R(t, t0 + .2, 1.2) });
  if (cut > 0) { D.text('✂', 600, 1110 - 60 * (1 - ex(cut)), { f: 'sans', size: 96, align: 'center', col: C.red, a: cut }); D.ink(D.seg(520, 1050, 640, 1050, 4), { w: 7, prog: cut, col: C.red, wob: 0 }); }
  label([{ s: 'median nerve', col: C.blue }], 330, 1120, R(t, t0 + .8, .8), { size: 46 });
  label(['stay ', { s: 'smooth', col: C.blue }], 250, 420, R(t, t0 + 2.6, .7), { size: 50 }); D.arrow(D.wave(250, 440, 380, 560, 10, 2), { w: 4.5, prog: R(t, t0 + 3.0, .5), seed: 70 });
  label(['wrinkle'], 860, 470, R(t, t0 + 3.2, .6), { size: 50 }); D.arrow(D.wave(850, 490, 780, 600, 8, 2), { w: 4.5, prog: R(t, t0 + 3.5, .5), seed: 71 });
  // phrase 3: editor card with the 1930s note
  const ck = ex(R(t, s(3) + .2, .6)); if (ck > 0) { const c = lg, y = lerp(300, 270, ck); c.save(); c.globalAlpha = ck; c.shadowColor = 'rgba(40,50,80,.2)'; c.shadowBlur = 30; c.fillStyle = '#fff'; c.beginPath(); c.roundRect(560, y, 430, 150, 22); c.fill(); c.restore();
    D.text('CLINICAL NOTE', 590, y + 42, { f: 'mono', size: 20, wt: 500, col: C.mid, a: ck }); D.text('1930s', 590, y + 100, { f: 'serif', size: 52, col: C.blue, a: ck, write: R(t, s(3) + .5, .5) });
    D.text('median nerve palsy', 760, y + 92, { f: 'hand', size: 34, a: ck, write: R(t, s(3) + .9, .7) }); D.text('= no wrinkling', 760, y + 128, { f: 'hand', size: 34, col: C.red, a: ck, write: R(t, s(3) + 1.6, .6) }); } }

// ---------- D: "a switch": bold stack + hand-drawn switch flipping on ----------
function sceneD(t) { const t0 = s(4); stack([['Not soggy', C.ink], ['skin.', C.ink], ['A switch.', C.blue]], 120, 470, R(t, t0 - .2, 1.6), { size: 128, lh: 140 });
  const on = ss(R(t, t0 + 2.4, .35)); D.crayon(D.rect(640, 820, 260, 300), '#e8ecf6', { prog: R(t, t0 + .4, .5), seed: 80, scribble: false }); D.ink(D.rect(640, 820, 260, 300), { w: 6, prog: R(t, t0 + .4, .6), seed: 81, smooth: false });
  const ky = lerp(1010, 900, on); D.crayon(D.rect(730, ky, 80, 110), on > .5 ? C.green : C.grey, { prog: R(t, t0 + .7, .4), seed: 82 }); D.ink(D.rect(730, ky, 80, 110), { w: 5, prog: R(t, t0 + .7, .4), seed: 83, smooth: false });
  label([{ s: on > .5 ? 'ON' : 'OFF', col: on > .5 ? C.blue : C.mid }], 770, 1170, R(t, t0 + .9, .3), { size: 52 });
  if (on > .5) for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * .35; D.ink(D.seg(770 + Math.cos(a) * 190, 960 + Math.sin(a) * 190, 770 + Math.cos(a) * 240, 960 + Math.sin(a) * 240, 2), { w: 5, prog: R(t, t0 + 2.6 + i * .05, .2), col: C.sun === undefined ? C.blue : '#e2b81d', wob: 0 }); } }

// ---------- E: skin cross-section: nerve -> vessel narrows -> skin pulled into folds ----------
function section(t, nar, fold, k, o = {}) { const x0 = 110, x1 = 970, top = 560;
  const surf = []; for (let i = 0; i <= 60; i++) { const x = lerp(x0, x1, i / 60); surf.push([x, top + Math.sin(i / 60 * TAU * 4.5) * 34 * fold + Math.max(0, Math.sin(i / 60 * TAU * 4.5)) * 18 * fold]); }
  const epi = [...surf, [x1, top + 120], [x0, top + 120]]; D.crayon(epi, SKIN, { prog: k, seed: 90, dark: SKIND }); D.ink(surf, { w: 6, prog: k, seed: 91 });
  const der = [[x0, top + 120], [x1, top + 120], [x1, 1120], [x0, 1120]]; D.crayon(der, '#f8dcc8', { prog: k, seed: 92, scribble: false }); D.hatch(der, 'rgba(170,90,60,.18)', { prog: k, sp: 22 });
  D.ink(D.seg(x0, top + 120, x1, top + 120, 12), { w: 3, prog: k, seed: 93, dash: [14, 10], col: 'rgba(120,60,40,.6)' });
  // blood vessel: a tube whose radius shrinks with nar
  const vy = 900, r = lerp(70, 26, nar), tube = []; for (let i = 0; i <= 30; i++) tube.push([lerp(x0, x1, i / 30), vy - r + Math.sin(i * .6) * 4]); for (let i = 30; i >= 0; i--) tube.push([lerp(x0, x1, i / 30), vy + r + Math.sin(i * .6) * 4]);
  D.crayon(tube, VES, { prog: R(k, .3, .5), seed: 94, dark: 'rgba(140,20,40,1)' }); D.ink(tube.slice(0, 31), { w: 5, prog: R(k, .3, .6), seed: 95 }); D.ink(tube.slice(31), { w: 5, prog: R(k, .3, .6), seed: 96 });
  for (let i = 0; i < 9; i++) { const px = x0 + ((t * 70 * (1 - nar * .6) + i * 100) % (x1 - x0)); D.dot(px, vy + Math.sin(i) * r * .4, 11 * (1 - nar * .4), '#b3263c', R(k, .5, .3)); }
  if (o.nerve) { const np = D.wave(150, 1110, 480, vy + r + 10, 14, 3); D.ink(np, { w: 7, prog: o.nerve, seed: 97, col: NERVE }); const sp = (t * .9) % 1; if (o.nerve >= 1) { const q = np[Math.floor(sp * (np.length - 1))]; D.dot(q[0], q[1], 13, C.pink); } }
  if (o.pull > 0) for (let i = 0; i < 5; i++) { const x = lerp(x0 + 90, x1 - 90, i / 4); D.arrow(D.seg(x, top + 150, x, top + 250, 3), { w: 5, prog: R(o.pull, i * .1, .4), seed: 98 + i, col: C.blue, len: 18, wob: .5 }); } }
function sceneE(t) { const t0 = s(5), nar = ss(R(t, t0 + 1.4, 2.4)), fold = ss(R(t, s(6) + .4, 2.6)), k = R(t, t0 - .3, 1.1);
  section(t, nar, fold, k, { nerve: R(t, t0 + .3, 1), pull: R(t, s(6) + .2, 1.2) });
  label(['skin'], 960, 470, R(t, t0 + .4, .5), { size: 46, align: 'right' }); label([{ s: 'blood vessel', col: C.blue }], 760, 1180, R(t, t0 + .9, .6), { size: 46 });
  label(['nerve'], 230, 1180, R(t, t0 + .5, .5), { size: 46 });
  if (t > t0 + 1.4 && t < s(6)) { label([{ s: 'narrows', col: C.red }], 540, 800, R(t, t0 + 1.6, .5), { size: 54 }); D.arrow(D.seg(540, 812, 540, 860, 2), { w: 5, prog: R(t, t0 + 2, .3), wob: 0, len: 16 }); }
  if (t > s(6)) { const k6 = R(t, s(6) + .1, .5); D.text('less volume', 540, 800, { f: 'hand', size: 56, align: 'center', col: C.red, a: k6 }); label([{ s: 'pulled into folds', col: C.blue }], 540, 460, R(t, s(6) + 2.6, .9), { size: 58 });
    D.ink(D.circ(330, 560, 110, 40), { w: 5, prog: R(t, s(6) + 3.2, .7), seed: 99, col: C.red }); } }

// ---------- F: only hairless skin (fingertips, palms, soles) ----------
function foot(x, y, sc, k, glab) { const c = D.ctx(); c.save(); c.translate(x, y); c.scale(sc, sc); D.use(c); const sole = []; for (let i = 0; i <= 30; i++) { const a = i / 30 * TAU; sole.push([Math.cos(a) * 95 * (1 - .25 * Math.max(0, Math.sin(a))), Math.sin(a) * 230]); }
  D.crayon(sole, SKIN, { prog: R(k, .2, .5), seed: 120, dark: SKIND, scribble: false }); D.ink(sole, { w: 6 / sc, prog: R(k, 0, .5), seed: 121 });
  [[-60, -250, 34], [-5, -270, 30], [40, -262, 26], [72, -240, 22], [96, -210, 19]].forEach(([tx, ty, r], i) => { D.crayon(D.circ(tx, ty, r, 16), SKIN, { prog: R(k, .3, .4), seed: 122 + i, scribble: false }); D.ink(D.circ(tx, ty, r, 16), { w: 5 / sc, prog: R(k, .3 + i * .05, .4), seed: 130 + i }); });
  D.marker(-80, -150, 160, 300, C.greenL, glab, .45); c.restore(); D.use(lg); }
function sceneF(t) { const t0 = s(7); hand(400, 820, .78, R(t, t0 - .3, .9), { glab: R(t, t0 + .4, 1.2), wr: [1, 1, 1, 1, 1].map(() => ss(R(t, t0 + 1.4, 1.2)) * .7) }); foot(860, 820, .9, R(t, t0, .9), R(t, t0 + 2.2, .6));
  label(['only ', { s: 'hairless skin', col: C.blue }], 540, 330, R(t, t0 + .1, .8), { size: 66 }); label(['fingertips · palms · soles'], 540, 1170, R(t, t0 + 1.2, 1), { size: 48 }); }

// ---------- G: bedside test: white editor card ----------
function sceneG(t) { const t0 = s(8), ck = ex(R(t, t0 - .2, .6)), c = lg; c.save(); c.globalAlpha = ck; c.shadowColor = 'rgba(40,50,80,.22)'; c.shadowBlur = 50; c.shadowOffsetY = 18; c.fillStyle = '#fff'; c.beginPath(); c.roundRect(120, 330, 840, 760, 34); c.fill(); c.restore();
  D.text('BEDSIDE TEST', 170, 410, { f: 'mono', size: 26, wt: 700, col: C.mid, a: ck, track: 4 }); D.text('Wrinkle test', 170, 500, { f: 'serif', size: 70, a: ck, write: R(t, t0 + .1, .6) });
  const rows = [['1', 'warm soak'], ['2', 'wait for the folds'], ['3', 'no folds? check the nerves']]; rows.forEach(([n, tx], i) => { const kk = R(t, t0 + .7 + i * .7, .4), y = 620 + i * 130; if (kk <= 0) return;
    c.save(); c.globalAlpha = kk; c.fillStyle = i === 2 ? C.pinkL : C.hlBlue; c.beginPath(); c.arc(200, y - 16, 34, 0, TAU); c.fill(); c.restore(); D.text(n, 200, y, { f: 'sans', size: 40, wt: 800, align: 'center', a: kk }); D.text(tx, 260, y, { f: 'hand', size: 52, write: kk }); });
  fingertip(830, 640, 120, 200, ss(R(t, t0 + 1.2, 1.5)), ck, { seed: 140, pat: 4 }); }

// ---------- H: 2025: same fingers, same pattern (dark navy slide with pink counter) ----------
function sceneH(t) { const t0 = s(9), c = lg; const k1 = R(t, t0, .8), k2 = R(t, t0 + 1.4, .8), ov = ss(R(t, t0 + 3.0, 1));
  D.text('2025 STUDY', 540, 330, { f: 'mono', size: 30, wt: 700, col: '#aab4d6', align: 'center', a: k1, track: 6 });
  const x1 = lerp(330, 540, ov), x2 = lerp(750, 540, ov);
  fingertip(x1, 560, 280, 460, 1, k1, { seed: 150, pat: 21 }); c.save(); c.globalAlpha = 1 - ov * .5; fingertip(x2, 560, 280, 460, 1, k2, { seed: 151, pat: 21 }); c.restore();
  D.text('soak 1', 330, 1150, { f: 'hand', size: 50, col: '#e8ecfa', align: 'center', a: k1 * (1 - ov) }); D.text('soak 2', 750, 1150, { f: 'hand', size: 50, col: '#e8ecfa', align: 'center', a: k2 * (1 - ov) });
  const cnt = t < t0 + 1.4 ? 1 : 2; D.text(String(cnt).padStart(2, '0'), 540, 1120, { f: 'sans', size: 120, wt: 800, col: C.pink, align: 'center', a: ov > .5 ? 0 : k1 }); D.text('/ 02 soaks', 640, 1120, { f: 'sans', size: 40, wt: 600, col: '#aab4d6', a: ov > .5 ? 0 : k1 });
  if (ov > .6 && t < s(10) - .2) label([{ s: 'same pattern', col: '#8fb0ff' }], 540, 1150, R(ov, .6, .4), { size: 64, a: 1 });
  // phrase 10: vessels drawn under the pattern
  if (t > s(10) - .2) { const vk = R(t, s(10), 1.6); for (let i = 0; i < 5; i++) { const xx = 540 - 100 + i * 50; D.ink(D.wave(xx, 400, xx + (i - 2) * 12, 1000, 10, 3), { w: 6, prog: R(vk, i * .1, .6), seed: 160 + i, col: VES }); }
    label([{ s: 'vessels', col: VES }, ' barely move'], 540, 1150, R(t, s(10) + 1.4, .8), { size: 58, a: 1 }); } }

// ---------- I: "why bother?" "Grip." ----------
function sceneI(t) { const t0 = s(11); stack([['Why bother?', C.ink], ['Grip.', C.blue]], 120, 520, R(t, t0 - .2, 1.4), { size: 132, lh: 170 });
  // tyre-tread sketch: grooves channel water away (the "rain tread" idea)
  const tk = R(t, t0 + 1.2, 1); D.crayon(D.rect(140, 800, 800, 300), '#3a3f4c', { prog: tk, seed: 170, scribble: false }); for (let i = 0; i < 8; i++) D.ink(D.seg(190 + i * 100, 800, 150 + i * 100, 1100, 3), { w: 10, prog: R(tk, i * .06, .4), col: '#e8ecf6', wob: 0 });
  label(['like a ', { s: 'rain tread', col: C.blue }, '?'], 540, 1170, R(t, t0 + 1.8, .8), { size: 54 }); }

// ---------- J: 2013 vs 2014 (two marble bowls; editor-style split card) ----------
function bowl(x, y, k, seed) { const b = []; for (let i = 0; i <= 20; i++) { const a = i / 20 * Math.PI; b.push([x + Math.cos(a) * 110, y + Math.sin(a) * 70]); } D.crayon([...b, [x - 110, y]], '#e9edf7', { prog: k, seed, scribble: false }); D.ink([...b, [x - 110, y]], { w: 5, prog: k, seed: seed + 1 }); }
function sceneJ(t) { const t0 = s(12), c = lg; const half = (x, yr, title, sub, ok, kk) => { c.save(); c.globalAlpha = kk; c.fillStyle = '#fff'; c.shadowColor = 'rgba(40,50,80,.18)'; c.shadowBlur = 36; c.beginPath(); c.roundRect(x, 330, 420, 780, 30); c.fill(); c.restore();
    D.text(yr, x + 210, 430, { f: 'serif', size: 78, col: C.blue, align: 'center', a: kk }); D.text(title, x + 210, 490, { f: 'mono', size: 22, wt: 600, col: C.mid, align: 'center', a: kk }); bowl(x + 110, 700, kk, 180 + x); bowl(x + 310, 700, kk, 190 + x);
    const pk = R(t, ok ? t0 + .8 : s(13) + .4, 1.6); for (let i = 0; i < 5; i++) { const u = ex(R(pk, i * .12, .45)); const px = lerp(x + 80 + i * 14, x + 290 + i * 10, u), py = lerp(720, 712, u) - Math.sin(u * Math.PI) * 90; D.dot(px, py, 13, ['#f06fa0', '#7f9cf0', '#86e39a', '#f7df4a', '#ef5b6e'][i], kk); }
    D.text(sub, x + 210, 900, { f: 'hand', size: 50, col: ok ? C.blue : C.red, align: 'center', write: R(t, ok ? t0 + 2.4 : s(13) + 1.6, .7) });
    D.text(ok ? '✓' : '✕', x + 210, 1040, { f: 'sans', size: 90, wt: 800, col: ok ? '#2fa24a' : C.red, align: 'center', a: R(t, ok ? t0 + 3 : s(13) + 2.2, .3) }); };
  half(80, '2013', 'NEWCASTLE', 'faster when wet', true, ex(R(t, t0 - .2, .6))); if (t > s(13) - .3) half(580, '2014', 'BERLIN', 'no benefit', false, ex(R(t, s(13) - .2, .6))); }

// ---------- K: payoff: the cross-section shrinks into the video-player card ----------
function sceneK(t) { section(t, 1, 1, 1, { nerve: 1, pull: 1 }); label([{ s: 'nerves', col: C.blue }, ' → vessels narrow → ', { s: 'folds', col: C.blue }], 540, 1170, 1, { size: 50 });
  label(['grip? ', { s: 'still open', col: C.red }], 540, 400, R(t, s(14) + 1.0, .8), { size: 60 }); }
// ---------- L: question: two pills ----------
function sceneL(t) { const t0 = s(15), c = lg; label(['Just soggy skin?'], 540, 640, R(t, t0 - .1, .7), { size: 92 });
  [['YES', 300, C.pinkL], ['NO', 780, C.hlBlue]].forEach(([w, x, col], i) => { const k = bo(R(t, t0 + .7 + i * .3, .4)); if (k <= 0) return; c.save(); c.translate(x, 900); c.scale(k, k); c.fillStyle = col; c.beginPath(); c.roundRect(-170, -70, 340, 140, 70); c.fill(); c.restore(); D.text(w, x, 930, { f: 'sans', size: 80, wt: 800, align: 'center', a: clamp(k) }); });
  fingertip(540, 1040, 110, 160, .9, R(t, t0 + .3, .5), { seed: 200, pat: 9 }); }
// ---------- M: standard end card ----------
function sceneM(t) { const t0 = s(16) - .3, u = ex(R(t, t0, .7)), c = lg; D.logo(540 - 22, 560, 1.4, u, c);
  D.text('Follow for more of', 540, 700, { f: 'sans', size: 64, wt: 800, align: 'center', a: u }); D.text('how it really works.', 540, 790, { f: 'sans', size: 72, wt: 800, align: 'center', col: C.blue, a: u });
  D.text("A new 'wait, really?' every day.", 540, 880, { f: 'sans', size: 40, wt: 600, align: 'center', col: C.mid, a: R(t, t0 + .4, .5) });
  const pk = R(t, t0 + .6, .5); c.save(); c.globalAlpha = pk; c.fillStyle = C.hlBlue; c.beginPath(); c.roundRect(300, 950, 480, 84, 42); c.fill(); c.restore(); D.text('@howitreallyworkstudio', 540, 1005, { f: 'sans', size: 34, wt: 700, align: 'center', col: C.blue, a: pk });
  // loop back toward frame 0: the fingertip rises from the water at the very end
  const lk = R(t, TOT - 1.6, 1.4); if (lk > 0) { c.save(); c.globalAlpha = lk; water(1160, t, 1, { y1: 1240 }); c.restore(); } }

// ---------- compositor ----------
const SC = [[0, sceneA, 0], [s(1) - .3, sceneB, 0], [s(2) - .3, sceneC, 0], [s(4) - .3, sceneD, 0], [s(5) - .3, sceneE, 0], [s(7) - .3, sceneF, 0], [s(8) - .3, sceneG, 0],
  [s(9) - .3, sceneH, 1], [s(11) - .3, sceneI, 0], [s(12) - .3, sceneJ, 0], [s(14) - .3, sceneK, 0], [s(15) - .3, sceneL, 0], [s(16) - .35, sceneM, 0]];
const TR = .45;
function idx(t) { let i = 0; for (let k = 0; k < SC.length; k++) if (t >= SC[k][0]) i = k; return i; }
function draw(i, t) { D.clearLayer(); SC[i][1](t); }
function blitScene(i, t, o) { if (SC[i][1] === sceneK) { const k = R(t, s(14) + .2, .8); if (k > 0) { D.card(k, t / TOT, t, TOT, { cy: 760, h: 900, src: [70, 380, 940, 860] }); return; } } D.blit(o); }
function scene(t) { const i = idx(t), u = R(t, SC[i][0], TR), dk = i > 0 && u < 1 ? lerp(SC[i - 1][2], SC[i][2], ss(u)) : SC[i][2];
  D.ground(dk);
  if (i > 0 && u < 1) { draw(i - 1, t); blitScene(i - 1, t, { a: 1 - ss(u), z: 1 + .06 * u, blur: 14 * u }); }
  draw(i, t); blitScene(i, t, { a: i > 0 ? ss(u) : 1, z: i > 0 ? lerp(.95, 1, ex(u)) : 1, blur: i > 0 ? 12 * (1 - u) : 0 });
  const ph = PH.findLast(p => t >= p.start - .25), endc = t >= s(16) - .4;
  if (!endc && ph) D.karaoke(ph, t, 1330, { dark: dk > .5, size: 50, out: ph.i < PH.length - 1 ? PH[ph.i + 1].start - .2 : null });
  chapters(t, dk); D.hud(t, TOT, dk); }
// progress device (RETENTION I): chapter strip in the bottom band, Distilbook mono labels + pills; current chapter in blue
const CH = [['clue', 2], ['switch', 4], ['vessels', 5], ['pattern', 9], ['grip', 11]];
function chapters(t, dk) { if (t >= s(16) - .4) return; const c = g; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); let cur = -1; CH.forEach(([, i], k) => { if (t >= s(i) - .3) cur = k; });
  const x0 = 150, dx = 195, y = 1560; c.globalAlpha = .9; c.strokeStyle = dk > .5 ? 'rgba(200,210,240,.35)' : 'rgba(30,34,46,.2)'; c.lineWidth = 3; c.beginPath(); c.moveTo(x0, y); c.lineTo(x0 + dx * 4, y); c.stroke();
  CH.forEach(([lab], k) => { const x = x0 + k * dx, on = k === cur, done = k < cur; c.fillStyle = on ? C.blue : done ? (dk > .5 ? '#8fb0ff' : C.blueL) : (dk > .5 ? '#3a4466' : '#dfe3ec'); c.beginPath(); c.arc(x, y, on ? 17 : 12, 0, TAU); c.fill();
    c.font = D.font('mono', 22, on ? 700 : 500); c.textAlign = 'center'; c.fillStyle = on ? (dk > .5 ? '#e8ecfa' : C.ink) : (dk > .5 ? 'rgba(200,210,240,.5)' : 'rgba(30,34,46,.4)'); c.fillText(lab.toUpperCase(), x, y + 52); }); c.restore(); }
window.DUR = TOT;
// ending: at most a 40% dim, then the loop restarts on the water/fingertip hook frame
window.seek = t => { scene(t); const f = Math.min(1, (TOT - t) / .35); if (f < 1) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = (1 - f) * .4; g.fillStyle = C.bg; g.fillRect(0, 0, W, H); g.restore(); } };
window.render = window.seek;
// thumbnail / cover: the wrinkled fingertip in water + "Why do fingers wrinkle?" Distilbook stack
window.thumb = () => { D.ground(0); D.clearLayer(); water(980, 1.2, 1, { y1: 1500 }); fingertip(540, 820, 330, 560, 1, 1, { seed: 5, pat: 9 }); water(980, 1.5, 1, { y1: 1500 });
  [['Why do', C.ink], ['fingers', C.ink], ['wrinkle?', C.blue]].forEach(([w, col], i) => D.text(w, 540, 380 + i * 140, { f: 'sans', size: 140, wt: 800, col, align: 'center', track: -5 }));
  D.blit({}); D.hud(12.3, TOT, 0); };
window.seek(0); window.ready = true; window.READY = true;
