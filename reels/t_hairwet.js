// t_hairwet.js: "Why does wet hair look darker?" in template #15 Distilbook (demo 83), the shiver/wrinklyfingers kit and grammar: bold stacks with a blue
// last line, the tilted book page with marker sweeps, felt-tip ray diagrams with crayon fills, circle callouts, wavy arrows, editor cards, the navy slide
// with a pink counter, the diagram shrinking into the video card, the chapter strip and the logo end card. Batch N: content y 370-1150, karaoke y 1330.
import { createDB, W, H, TAU, C, clamp, lerp, ramp, ss, eo, ex, bo, hash, FONTS } from './styles/distilbook/distilbook.js';
await Promise.all(FONTS.map(f => document.fonts.load(f)));
const TL = window.TL, PH = TL.p, s = i => PH[i].start, e = i => PH[i].end, TOT = TL.total;
const D = createDB(document.getElementById('c')), g = D.g, lg = D.lg, R = ramp;
const SKIN = '#f3c4a2', SKIND = 'rgba(150,70,40,1)', MUS = '#e8746e', MUSD = 'rgba(140,30,30,1)', HEAT = '#f59a3c', COLDB = '#8fb0f0';
const label = (segs, x, y, k, o = {}) => D.rich(segs.map(z => typeof z === 'string' ? { s: z } : z), x, y, { f: 'hand', size: o.size || 48, align: o.align || 'center', write: k, a: o.a });
const stack = (lines, x, y, k, o = {}) => lines.forEach(([w, col], i) => D.text(w, x, y + i * (o.lh || 150), { f: 'sans', size: o.size || 140, wt: 800, col, track: -5, a: R(k, i * .25, .3), align: o.align }));
// ---------- hairwet pieces ----------
const HAIR = '#a8743e', HAIRD = 'rgba(90,50,20,1)', WET = '#2e1a0c', WATERC = '#7fb0f0', RAY = '#f0b41d';
// a head (felt tip) with hair; wet 0..1 per side (left, right)
function head(x, y, sc, t, k, wl, wr) { const c = D.ctx(); c.save(); c.translate(x, y); c.scale(sc, sc); D.use(c);
  D.crayon(D.circ(0, 0, 150, 40), SKIN, { prog: R(k, .1, .4), seed: 900, dark: SKIND, scribble: false }); D.ink(D.circ(0, 0, 150, 40), { w: 6 / sc, prog: R(k, 0, .4), seed: 901 });
  for (const [sd, w] of [[-1, wl], [1, wr]]) { const pts = [[0, -170], [sd * 120, -150], [sd * 190, -40], [sd * 200, 140], [sd * 230, 330], [sd * 140, 340], [sd * 150, 120], [sd * 110, -60], [0, -110]];
    D.crayon(pts, w > .5 ? WET : HAIR, { prog: R(k, .2, .5), seed: 902 + sd, dark: HAIRD }); D.ink([...pts, pts[0]], { w: 6 / sc, prog: R(k, .1, .5), seed: 904 + sd });
    for (let i = 0; i < 5; i++) D.ink(D.seg(sd * (40 + i * 30), -140 + i * 10, sd * (90 + i * 30), 300, 6), { w: 3 / sc, prog: R(k, .3, .5), seed: 906 + i + sd * 10, col: w > .5 ? 'rgba(20,10,0,.6)' : 'rgba(120,70,30,.55)' });
    if (w > .5) { for (let i = 0; i < 3; i++) D.ink(D.seg(sd * (120 + i * 30), 0 + i * 60, sd * (110 + i * 30), 60 + i * 60, 2), { w: 6 / sc, col: '#ffffff', prog: R(k, .5, .3), seed: 920 + i + sd }); const u = (t * .7 + (sd > 0 ? .5 : 0)) % 1; D.crayon(D.circ(sd * 200, 350 + u * 120, 14, 16), WATERC, { prog: 1, seed: 930 + sd, a: 1 - u }); } }
  D.ink([[-50, -10], [-20, -10]], { w: 6 / sc, wob: 0 }); D.ink([[20, -10], [50, -10]], { w: 6 / sc, wob: 0 }); D.ink([[-30, 60], [0, 75], [30, 60]], { w: 5 / sc, seed: 940 });
  c.restore(); D.use(lg); }
// a strand (cylinder seen from the side) with a rough cuticle edge; film 0..1 water coat
function strand(x0, x1, y, h, t, k, film = 0) { const top = [], bot = []; for (let i = 0; i <= 40; i++) { const x = lerp(x0, x1, i / 40), sc = (i % 4 < 2 ? 1 : 0) * 10; top.push([x, y - h / 2 - sc]); bot.push([x, y + h / 2 + sc * .4]); }
  if (film > 0) { const fw = 34 * film, F = [[x0, y - h / 2 - fw], [x1, y - h / 2 - fw], [x1, y + h / 2 + fw], [x0, y + h / 2 + fw]]; D.crayon(F, WATERC, { prog: 1, seed: 950, a: .55 }); D.ink([[x0, y - h / 2 - fw], [x1, y - h / 2 - fw]], { w: 4, col: 'rgba(30,60,160,.9)', prog: film, seed: 951 }); D.ink([[x0, y + h / 2 + fw], [x1, y + h / 2 + fw]], { w: 4, col: 'rgba(30,60,160,.9)', prog: film, seed: 952 }); }
  const body = [...top, ...bot.slice().reverse()]; D.crayon(body, film > .5 ? WET : HAIR, { prog: R(k, .2, .5), seed: 953, dark: HAIRD }); D.ink(top, { w: 5, prog: R(k, 0, .5), seed: 954 }); D.ink(bot, { w: 5, prog: R(k, 0, .5), seed: 955 }); }
const ray = (pts, k, o = {}) => D.arrow(pts, { w: o.w || 6, prog: k, col: o.col || RAY, seed: o.seed || 960, len: 22, wob: .6 });
function eye(x, y, k, open = 1) { D.crayon(D.circ(x, y, 40, 30, .6), '#ffffff', { prog: k, seed: 970, scribble: false }); D.ink(D.circ(x, y, 40, 30, .6), { w: 5, prog: k, seed: 971 }); D.dot(x, y, 12 * open, C.ink, k); }
function bar(x, y, w, h, v, col, lab, k) { D.ink(D.rect(x, y - h, w, h), { w: 5, prog: k, seed: 980 + x, smooth: false }); D.crayon(D.rect(x, y - h * v, w, h * v), col, { prog: k, seed: 981 + x }); label([lab], x + w / 2, y + 50, k, { size: 44 }); }

// ---------- scenes ----------
// A: hook: half dry, half wet; "Not dye. / Trapped light."
function sceneA(t) { head(540, 760, 1.05, t, 1, 1, 0); stack([['Not dye.', C.ink], ['Trapped light.', C.blue]], 540, 430, t < .05 ? 1 : R(t, -.4, .3), { size: 104, lh: 116, align: 'center' });
  label([{ s: 'wet', col: C.blue }], 220, 1080, R(t, .8, .5), { size: 56 }); label(['dry'], 860, 1080, R(t, 1.1, .5), { size: 56 });
  for (let i = 0; i < 4; i++) { const u = ((t * .6 + i / 4) % 1); D.dot(lerp(900, 760, u), lerp(420, 600, u), 9, RAY, Math.sin(u * Math.PI)); } }
// B: book page
const BP = document.createElement('canvas'); BP.width = 1500; BP.height = 1000; const bpg = BP.getContext('2d');
const BL = ['Why does wet hair look darker?', 'The water does not dye it. A', 'thin film changes where the', 'light goes: less of it comes', 'back to your eyes.'];
const BHL = []; { bpg.fillStyle = C.blue; bpg.font = D.font('serif', 104, 700); bpg.fillText('3.1', 40, 130); const w = bpg.measureText('3.1 ').width; bpg.fillStyle = C.ink; bpg.fillText('Wet surfaces', 40 + w, 130);
  bpg.font = D.font('serif', 60, 400); BL.forEach((ln, i) => bpg.fillText(ln, 40, 300 + i * 100));
  const find = (li, wd, col, t0) => { const x = bpg.measureText(BL[li].slice(0, BL[li].indexOf(wd))).width + 40; BHL.push({ x, y: 300 + li * 100 - 52, w: bpg.measureText(wd).width, h: 68, col, t0 }); };
  find(0, 'Why does wet hair look darker?', C.hlBlue, s(1) + .1); find(3, 'light goes:', C.pinkL, s(1) + 2.0); find(3, 'less of it comes', C.pinkL, s(1) + 2.4); }
function sceneB(t) { const T = D.T, tg = D.tg; tg.setTransform(1, 0, 0, 1, 0, 0); tg.clearRect(0, 0, W, H); const u = ss(R(t, s(1) - .3, 4)), z = 1.0 + .08 * u;
  tg.translate(40 - 20 * u, 470); tg.rotate(-.07); tg.scale(z, z); D.use(tg); BHL.forEach(h => D.marker(h.x, h.y, h.w, h.h, h.col, R(t, h.t0, .45))); tg.drawImage(BP, 0, 0); D.use(lg);
  const band = (y0, y1, b) => { lg.save(); lg.beginPath(); lg.rect(0, y0, W, y1 - y0); lg.clip(); if (b) lg.filter = `blur(${b}px)`; lg.drawImage(T, 0, 0); lg.restore(); };
  band(0, 480, 7); band(480, 600, 3); band(600, 1000, 0); band(1000, 1110, 3); band(1110, H, 8); }
// C: dry strand: rays scatter every way, plenty back to the eye
function sceneC(t) { const t0 = s(2); strand(120, 960, 820, 90, t, R(t, t0 - .3, .9)); label([{ s: 'rough', col: C.red }, ' cuticle'], 300, 700, R(t, t0 + .6, .6), { size: 48 }); label(['one hair, ', { s: 'up close', col: C.blue }], 700, 1010, R(t, t0 + .2, .6), { size: 46 });
  ray(D.seg(220, 420, 420, 760, 6), R(t, t0 + 1.0, .5)); [[-1.9, 1.4], [-1.2, 1.7], [-2.4, 1.6], [-.6, 1.8]].forEach(([a, d], i) => ray(D.seg(430, 760, 430 + Math.cos(a) * 260, 760 + Math.sin(a) * 260, 6), R(t, t0 + d, .4), { seed: 961 + i }));
  eye(840, 470, R(t, t0 + 1.8, .4)); ray(D.wave(560, 560, 790, 480, 6, 1), R(t, t0 + 2.6, .5), { seed: 965 }); label(['plenty comes back'], 760, 380, R(t, t0 + 3.0, .7), { size: 46 }); }
// D: water film coats the strand
function sceneD(t) { const t0 = s(3), f = ss(R(t, t0 + .3, 1.6)); strand(120, 960, 820, 90, t, 1, f); for (let i = 0; i < 6; i++) { const u = clamp((t - t0 - .2 - i * .15) / 1); D.crayon(D.circ(200 + i * 130, lerp(500, 760, u * u), 18, 16), WATERC, { prog: 1, seed: 990 + i, a: 1 - u }); }
  label([{ s: 'thin water film', col: C.blue }], 540, 620, R(t, t0 + 1.4, .7), { size: 54 }); }
// E: total internal reflection: steep rays bounce back inside the film
function sceneE(t) { const t0 = s(4); strand(120, 960, 860, 90, t, 1, 1); const top = 860 - 45 - 34;
  ray(D.seg(400, 815, 520, top + 2, 4), R(t, t0 + .4, .4), { seed: 1000 }); ray(D.seg(520, top + 2, 640, 815, 4), R(t, t0 + .8, .4), { col: C.red, seed: 1001 });
  ray(D.seg(380, 815, 360, 500, 4), R(t, t0 + .4, .4), { seed: 1002 }); label(['steep: ', { s: 'bounces back inside', col: C.red }], 560, 640, R(t, t0 + 1.4, .8), { size: 46 }); label(['shallow: escapes'], 300, 460, R(t, t0 + 2.4, .7), { size: 40 });
  D.ink(D.circ(520, top, 70, 30), { w: 5, prog: R(t, t0 + 1.0, .6), seed: 1003, col: C.red }); }
// F: re-hook: each bounce, a little more absorbed (counter)
function sceneF(t) { const t0 = s(5); strand(120, 960, 860, 90, t, 1, 1); const top = 860 - 45 - 34, n = Math.min(5, Math.floor((t - t0 - .4) / .9) + 1);
  for (let i = 0; i < n; i++) { const x = 200 + i * 140, a = 1 - i * .18; ray(D.seg(x, 815, x + 70, top + 2, 3), 1, { col: `rgba(240,180,29,${a})`, seed: 1010 + i }); ray(D.seg(x + 70, top + 2, x + 140, 815, 3), 1, { col: `rgba(240,180,29,${a - .09})`, seed: 1020 + i }); D.dot(x + 140, 815, 12, HAIRD, 1); }
  D.text(String(Math.max(0, n)).padStart(2, '0'), 540, 620, { f: 'sans', size: 150, wt: 800, col: C.pink, align: 'center', a: R(t, t0 + .4, .3) }); D.text('chances to be absorbed', 540, 680, { f: 'mono', size: 26, wt: 600, col: C.mid, align: 'center', a: R(t, t0 + .4, .3) }); }
// G: water and hair bend light more alike: two boundary panels
function sceneG(t) { const t0 = s(6); const pan = (x, lab, refl, k) => { D.crayon(D.rect(x, 520, 400, 260), lab === 'air' ? '#f4f5f8' : WATERC, { prog: k, seed: 1030 + x, scribble: false, a: .6 }); D.crayon(D.rect(x, 780, 400, 260), HAIR, { prog: k, seed: 1031 + x, dark: HAIRD });
    D.ink(D.seg(x, 780, x + 400, 780, 6), { w: 5, prog: k, seed: 1032 + x }); ray(D.seg(x + 60, 560, x + 200, 776, 4), R(k, .2, .3), { seed: 1033 + x }); ray(D.seg(x + 200, 776, x + 340, 560, 4), R(k, .5, .3), { w: 2 + 10 * refl, seed: 1034 + x }); ray(D.seg(x + 200, 784, x + 260, 1000, 4), R(k, .5, .3), { w: 2 + 10 * (1 - refl), col: C.red, seed: 1035 + x });
    label([lab + ' → hair'], x + 200, 480, k, { size: 44 }); };
  pan(90, 'air', .8, R(t, t0, .8)); pan(590, 'water', .2, R(t, t0 + 1.2, .8)); label(['more light gets ', { s: 'in', col: C.red }], 540, 1120, R(t, t0 + 3.0, .7), { size: 52 }); }
// H: less light back: two eye meters
function sceneH(t) { const t0 = s(7); eye(300, 520, R(t, t0, .4)); eye(780, 520, R(t, t0 + .3, .4)); bar(220, 1000, 160, 360, ss(R(t, t0 + .6, .8)) * .9, RAY, 'dry', R(t, t0 + .4, .5)); bar(700, 1000, 160, 360, ss(R(t, t0 + 1.0, .8)) * .45, RAY, 'wet', R(t, t0 + .8, .5)); label([{ s: 'darker', col: C.blue }], 780, 400, R(t, t0 + 2, .6), { size: 60 }); }
// I: wet sand measurement: the navy slide with the pink counter (albedo 0.18 -> 0.09)
function sceneI(t) { const t0 = s(8), k1 = R(t, t0, .8); D.text('SAND · REFLECTED LIGHT', 540, 430, { f: 'mono', size: 30, wt: 700, col: '#aab4d6', align: 'center', a: k1, track: 5 });
  const u = ss(R(t, t0 + 1.0, 2)), v = lerp(18, 9, u); D.text(Math.round(v) + '%', 540, 760, { f: 'sans', size: 230, wt: 800, col: C.pink, align: 'center', a: k1 }); D.text(u < .5 ? 'dry sand' : 'wet sand', 540, 850, { f: 'hand', size: 54, col: '#e8ecfa', align: 'center', a: k1 });
  label([{ s: 'about half', col: '#8fb0ff' }], 540, 1010, R(t, t0 + 3.2, .6), { size: 64, a: 1 }); D.text('Lekner & Dorf, 1988', 540, 1100, { f: 'mono', size: 24, col: '#aab4d6', align: 'center', a: R(t, t0 + .6, .5) }); }
// J: shine: the smooth film reflects like a tiny mirror (a lamp reflected)
function sceneJ(t) { const t0 = s(9); strand(120, 960, 900, 90, t, 1, 1); const lk = R(t, t0 + .2, .6); D.crayon(D.circ(540, 450, 70, 30), C.sun, { prog: lk, seed: 1040 }); D.ink(D.circ(540, 450, 70, 30), { w: 5, prog: lk, seed: 1041 });
  ray(D.seg(500, 530, 440, 820, 4), R(t, t0 + .8, .4), { seed: 1042 }); ray(D.seg(440, 820, 320, 560, 4), R(t, t0 + 1.2, .4), { w: 10, seed: 1043 }); for (let i = 0; i < 3; i++) D.ink(D.seg(380 + i * 60, 812, 410 + i * 60, 812, 2), { w: 8, col: '#ffffff', prog: R(t, t0 + 1.6, .3), seed: 1044 + i, wob: 0 });
  label(['smooth film = ', { s: 'tiny mirror', col: C.blue }], 540, 640, R(t, t0 + 2.0, .8), { size: 52 }); }
// K: the same trick: three wet/dry cards (sand, concrete, jeans)
function sceneK(t) { const t0 = s(10), c = lg; [['sand', '#e8c88c', '#a8834c', 110], ['concrete', '#c4c4c4', '#7a7a7a', 400], ['jeans', '#7f9cf0', '#34488a', 690]].forEach(([lab, dry, wet, x], i) => { const k = ex(R(t, t0 + i * .5, .5)); if (k <= 0) return;
    c.save(); c.globalAlpha = k; c.fillStyle = '#fff'; c.shadowColor = 'rgba(40,50,80,.18)'; c.shadowBlur = 30; c.beginPath(); c.roundRect(x, 470, 280, 560, 26); c.fill(); c.restore();
    D.crayon(D.rect(x + 20, 520, 240, 200), dry, { prog: k, seed: 1050 + i }); D.crayon(D.rect(x + 20, 740, 240, 200), wet, { prog: k, seed: 1060 + i }); D.text('dry', x + 140, 630, { f: 'hand', size: 44, align: 'center', a: k }); D.text('wet', x + 140, 850, { f: 'hand', size: 44, align: 'center', col: '#ffffff', a: k }); D.text(lab, x + 140, 1000, { f: 'sans', size: 40, wt: 800, align: 'center', a: k }); }); }
// L: drying: droplets lift off, the hair lightens again
function sceneL(t) { const t0 = s(11), dry = ss(R(t, t0 + .4, 2.6)); head(540, 780, .95, t, 1, dry < .5 ? 1 : 0, 0); for (let i = 0; i < 6; i++) { const u = ((t - t0) * .5 + i / 6) % 1; D.ink(D.wave(220 + i * 40, 700 - u * 200, 230 + i * 40, 620 - u * 200, 8, 1), { w: 4, col: WATERC, a: (1 - u) * (1 - dry * .5), prog: 1, seed: 1070 + i }); }
  label([{ s: 'color comes back', col: C.blue }], 540, 400, R(t, t0 + 1.6, .8), { size: 58 }); }
// M: payoff chain -> shrinks into the video card
function chain(t, k) { strand(120, 960, 700, 70, t, k, 1); ray(D.seg(300, 400, 420, 660, 4), R(k, .2, .3), { seed: 1080 }); ray(D.seg(420, 660, 520, 631, 4), R(k, .35, .3), { col: C.red, seed: 1081 }); ray(D.seg(520, 631, 620, 660, 4), R(k, .5, .3), { col: C.red, seed: 1082 });
  label([{ s: 'trapped', col: C.red }, ' → absorbed → ', { s: 'darker', col: C.blue }], 540, 920, R(k, .6, .3), { size: 50 }); eye(800, 430, R(k, .3, .3), .5); }
function sceneM(t) { chain(t, R(t, s(12) - .3, 2.4)); }
// N: question pills
function sceneN(t) { const t0 = s(13), c = lg; label(['Noticed it on wet sand?'], 540, 560, R(t, t0 - .1, .7), { size: 80 });
  [['YES', 300, C.pinkL], ['NO', 780, C.hlBlue]].forEach(([w, x, col], i) => { const k = bo(R(t, t0 + .7 + i * .3, .4)); if (k <= 0) return; c.save(); c.translate(x, 820); c.scale(k, k); c.fillStyle = col; c.beginPath(); c.roundRect(-170, -70, 340, 140, 70); c.fill(); c.restore(); D.text(w, x, 850, { f: 'sans', size: 80, wt: 800, align: 'center', a: clamp(k) }); });
  D.crayon(D.rect(380, 980, 160, 90), '#e8c88c', { prog: 1, seed: 1090 }); D.crayon(D.rect(540, 980, 160, 90), '#a8834c', { prog: 1, seed: 1091 }); }
// O: end card
function sceneO(t) { const t0 = s(14) - .3, u = ex(R(t, t0, .7)), c = lg; D.logo(540 - 22, 560, 1.4, u, c);
  D.text('Follow for more of', 540, 700, { f: 'sans', size: 64, wt: 800, align: 'center', a: u }); D.text('how it really works.', 540, 790, { f: 'sans', size: 72, wt: 800, align: 'center', col: C.blue, a: u });
  D.text("A new 'wait, really?' every day.", 540, 880, { f: 'sans', size: 40, wt: 600, align: 'center', col: C.mid, a: R(t, t0 + .4, .5) });
  const pk = R(t, t0 + .6, .5); c.save(); c.globalAlpha = pk; c.fillStyle = C.hlBlue; c.beginPath(); c.roundRect(300, 950, 480, 84, 42); c.fill(); c.restore(); D.text('@howitreallyworkstudio', 540, 1005, { f: 'sans', size: 34, wt: 700, align: 'center', col: C.blue, a: pk }); }

// ---------- compositor ----------
const SC = [[0, sceneA, 0], [s(1) - .3, sceneB, 0], [s(2) - .3, sceneC, 0], [s(3) - .3, sceneD, 0], [s(4) - .3, sceneE, 0], [s(5) - .3, sceneF, 0], [s(6) - .3, sceneG, 0], [s(7) - .3, sceneH, 0],
  [s(8) - .3, sceneI, 1], [s(9) - .3, sceneJ, 0], [s(10) - .3, sceneK, 0], [s(11) - .3, sceneL, 0], [s(12) - .3, sceneM, 0], [s(13) - .3, sceneN, 0], [s(14) - .35, sceneO, 0]];
const TR = .45;
function idx(t) { let i = 0; for (let k = 0; k < SC.length; k++) if (t >= SC[k][0]) i = k; return i; }
function draw(i, t) { D.clearLayer(); SC[i][1](t); }
function blitScene(i, t, o) { if (SC[i][1] === sceneM) { const k = R(t, s(12) + 3.0, .8); if (k > 0) { D.card(k, t / TOT, t, TOT, { cy: 760, h: 900, src: [70, 330, 940, 910] }); return; } } D.blit(o); }
function scene(t) { const i = idx(t), u = R(t, SC[i][0], TR), dk = i > 0 && u < 1 ? lerp(SC[i - 1][2], SC[i][2], ss(u)) : SC[i][2];
  D.ground(dk);
  if (i > 0 && u < 1) { draw(i - 1, t); blitScene(i - 1, t, { a: 1 - ss(u), z: 1 + .06 * u, blur: 14 * u }); }
  draw(i, t); blitScene(i, t, { a: i > 0 ? ss(u) : 1, z: (i > 0 ? lerp(.95, 1, ex(u)) : 1) * (1 + .012 * Math.sin(t * .9)), dy: 8 * Math.sin(t * .6), blur: i > 0 ? 12 * (1 - u) : 0 });
  const ph = PH.findLast(p => t >= p.start - .25), endc = t >= s(14) - .4;
  if (!endc && ph) D.karaoke(ph, t, 1330, { dark: dk > .5, size: 50, out: ph.i < PH.length - 1 ? PH[ph.i + 1].start - .2 : null });
  chapters(t, dk); D.hud(t, TOT, dk); }
const CH = [['scatter', 2], ['film', 3], ['trapped', 4], ['absorbed', 5], ['shine', 9]];
function chapters(t, dk) { if (t >= s(14) - .4) return; const c = g; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); let cur = -1; CH.forEach(([, i], k) => { if (t >= s(i) - .3) cur = k; });
  const x0 = 150, dx = 195, y = 1560; c.globalAlpha = .9; c.strokeStyle = dk > .5 ? 'rgba(200,210,240,.35)' : 'rgba(30,34,46,.2)'; c.lineWidth = 3; c.beginPath(); c.moveTo(x0, y); c.lineTo(x0 + dx * 4, y); c.stroke();
  CH.forEach(([lab], k) => { const x = x0 + k * dx, on = k === cur, done = k < cur; c.fillStyle = on ? C.blue : done ? (dk > .5 ? '#8fb0ff' : C.blueL) : (dk > .5 ? '#3a4466' : '#dfe3ec'); c.beginPath(); c.arc(x, y, on ? 17 : 12, 0, TAU); c.fill();
    c.font = D.font('mono', 22, on ? 700 : 500); c.textAlign = 'center'; c.fillStyle = on ? (dk > .5 ? '#e8ecfa' : C.ink) : (dk > .5 ? 'rgba(200,210,240,.5)' : 'rgba(30,34,46,.4)'); c.fillText(lab.toUpperCase(), x, y + 52); }); c.restore(); }
window.DUR = TOT;
window.seek = t => { scene(t); const L = R(t, TOT - .6, .6); if (L > 0) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = ss(L) * .4; g.fillStyle = C.bg; g.fillRect(0, 0, W, H); g.restore(); } };
window.render = window.seek;
window.thumb = () => { D.ground(0); D.clearLayer(); head(540, 1060, 1.15, 1.3, 1, 1, 0);
  [['Why wet', C.ink], ['hair looks', C.ink], ['darker', C.blue]].forEach(([w, col], i) => D.text(w, 540, 400 + i * 140, { f: 'sans', size: 130, wt: 800, col, align: 'center', track: -5 }));
  D.blit({}); D.hud(12.3, TOT, 0); };
window.seek(0); window.ready = true; window.READY = true;
