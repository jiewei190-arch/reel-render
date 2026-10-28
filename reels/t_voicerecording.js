// t_voicerecording.js: "Why does your voice sound weird on recordings?" in template #15 Distilbook (demo 83). Canvas2D 1080x1920, pure function of t.
// Demo moves reused: bold stacked lines with the last line in blue, tilted serif book page with depth blur and marker sweeps, hand-drawn felt-tip
// diagrams with crayon fills, hatching, circle callouts, wavy arrows and handwritten labels with one blue word, a dark navy slide, a white editor
// card, and the payoff diagram shrinking into the white video-player card; logo end card with a pill.
// Batch N layout: our own HUD (logo + label at y 300, corner brackets at y 260 and H-500, top-right corner left empty for the EP badge),
// content between y 300 and ~1150, karaoke centred at y 1290, a chapter strip at y 1395-1440, nothing written in the right column below y 840.
import { createDB, W, H, TAU, C, clamp, lerp, ramp, ss, eo, ex, bo, hash, FONTS } from './styles/distilbook/distilbook.js';
await Promise.all(FONTS.map(f => document.fonts.load(f)));
const TL = window.TL, PH = TL.p, s = i => PH[i].start, e = i => PH[i].end, TOT = TL.total;
const D = createDB(document.getElementById('c')), g = D.g, lg = D.lg, R = ramp;
const SKIN = '#f3c4a2', SKIND = 'rgba(150,70,40,1)', AIR = C.blue, BONE = C.pink;
const label = (segs, x, y, k, o = {}) => D.rich(segs.map(z => typeof z === 'string' ? { s: z } : z), x, y, { f: 'hand', size: o.size || 48, align: o.align || 'center', write: k, a: o.a, col: o.col });
const stack = (lines, x, y, k, o = {}) => lines.forEach(([w, col], i) => D.text(w, x, y + i * (o.lh || 150), { f: 'sans', size: o.size || 140, wt: 800, col, track: -5, a: R(k, i * .25, .3), align: o.align }));

// ---------- the head in profile (facing right), local units ~ 540 x 690, origin near the ear ----------
const PROF = [[-240, 0], [-235, -150], [-150, -290], [0, -320], [150, -270], [225, -160], [240, -70], [255, -10], [300, 30], [262, 60], [270, 100], [252, 118], [268, 145], [240, 200], [170, 235], [120, 252], [112, 320]];
const BACK = [[-100, 320], [-120, 230], [-205, 130], [-240, 0]];
const MOUTH = [262, 118], EAR = [-20, 20], COCH = [-34, 34], FOLDS = [118, 300];
const AIRPTS = [[300, 118], [400, 70], [440, -120], [380, -330], [180, -450], [-110, -440], [-260, -300], [-200, -110], [-70, 0]];
const BONEPTS = [[118, 300], [110, 230], [60, 180], [20, 120], [-10, 70], [-30, 40]];
function at(x, y, sc, f) { const c = D.ctx(); c.save(); c.translate(x, y); c.scale(sc, sc); D.use(c); f(c); c.restore(); D.use(lg); }
// a point along a polyline at u (0..1), for travelling dots
function along(pts, u) { let tot = 0; const L = []; for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(l); tot += l; }
  let d = tot * clamp(u); for (let i = 1; i < pts.length; i++) { if (d <= L[i - 1]) { const v = d / L[i - 1]; return [lerp(pts[i - 1][0], pts[i][0], v), lerp(pts[i - 1][1], pts[i][1], v)]; } d -= L[i - 1]; } return pts[pts.length - 1]; }
// o: k (draw-in), air 0..1, bone 0..1, airA/boneA (alpha), skull 0..1 (hatched skull band), cochlea 0..1, ripples 0..1, t, eyes
function head(x, y, sc, o = {}) { const k = o.k ?? 1; if (k <= 0) return; const t = o.t || 0;
  at(x, y, sc, c => { const body = [...PROF, ...BACK];
    D.crayon(body, SKIN, { prog: R(k, .2, .5), seed: 3, dark: SKIND, scribble: false });
    if (o.skull > 0) { const sk = [[-215, 0], [-205, -140], [-135, -262], [0, -290], [135, -245], [200, -150], [215, -60], [205, 40], [150, 120], [60, 150], [-60, 140], [-170, 80]];
      D.hatch(sk, 'rgba(170,90,60,.35)', { prog: o.skull, sp: 18 }); D.ink([...sk, sk[0]], { w: 4 / sc, prog: o.skull, seed: 9, col: 'rgba(120,60,40,.7)', dash: [12, 9] }); }
    D.ink(PROF, { w: 6 / sc, prog: R(k, 0, .6), seed: 4 }); D.ink(BACK, { w: 6 / sc, prog: R(k, .1, .6), seed: 5 });
    D.ink([[150, -120], [185, -112]], { w: 5 / sc, prog: R(k, .4, .3), seed: 6, wob: 0 });   // closed eye
    D.ink(D.circ(EAR[0], EAR[1], 44, 30, 1.4), { w: 5 / sc, prog: R(k, .3, .5), seed: 7 });   // ear
    D.ink([[236, 120], [262, 118]], { w: 5 / sc, prog: R(k, .4, .3), seed: 8, wob: 0 });     // lips
    if (o.cochlea > 0) { const sp = []; for (let i = 0; i <= 50; i++) { const a = i / 50 * TAU * 2.4, r = 30 - i * .5; sp.push([COCH[0] + Math.cos(a) * r, COCH[1] + Math.sin(a) * r * .8]); }
      D.ink(sp, { w: 4.5 / sc, prog: o.cochlea, seed: 10, col: C.ink }); }
    if (o.folds > 0) { D.ink([[FOLDS[0] - 22, FOLDS[1] - 6], [FOLDS[0], FOLDS[1] + 4], [FOLDS[0] + 22, FOLDS[1] - 6]], { w: 5 / sc, prog: o.folds, seed: 11, col: C.red }); }
    if (o.air > 0) { D.arrow(AIRPTS, { w: 7 / sc, prog: o.air, seed: 12, col: AIR, a: o.airA ?? 1, len: 30 / sc });
      if (o.air >= 1 && (o.airA ?? 1) > .5) for (let i = 0; i < 3; i++) { const p = along(AIRPTS, ((t * .35) + i / 3) % 1); D.dot(p[0], p[1], 11 / sc, AIR, o.airA ?? 1); } }
    if (o.bone > 0) { D.arrow(BONEPTS, { w: 9 / sc, prog: o.bone, seed: 13, col: BONE, a: o.boneA ?? 1, len: 26 / sc });
      if (o.bone >= 1 && (o.boneA ?? 1) > .5) for (let i = 0; i < 3; i++) { const p = along(BONEPTS, ((t * .6) + i / 3) % 1); D.dot(p[0], p[1], 12 / sc, BONE, o.boneA ?? 1); } }
    if (o.ripples > 0) for (let i = 0; i < 4; i++) { const ph = ((t * .7) + i / 4) % 1, r = 40 + ph * 260; c.save(); c.beginPath(); D.path([...PROF, ...BACK]); c.clip();
      D.ink(D.circ(FOLDS[0], FOLDS[1], r, 48), { w: 4 / sc, col: BONE, a: o.ripples * (1 - ph) * .8, seed: 14 + i, wob: .6 }); c.restore(); }
    if (o.voice > 0) for (let i = 0; i < 3; i++) { const ph = ((t * .9) + i / 3) % 1; D.ink(D.wave(300 + ph * 40, 80, 330 + ph * 90, 150, 6, 1), { w: 4 / sc, col: AIR, a: o.voice * (1 - ph), seed: 20 + i }); }
  }); }
// microphone doodle
function mic(x, y, sc, k) { if (k <= 0) return; at(x, y, sc, c => { const capsule = D.circ(0, -90, 70, 40, 1.25); D.crayon(capsule, '#d9dee8', { prog: k, seed: 30, scribble: false }); D.ink(capsule, { w: 6 / sc, prog: k, seed: 31 });
  for (let i = -2; i <= 2; i++) D.ink(D.seg(-50, -90 + i * 22, 50, -90 + i * 22, 3), { w: 3 / sc, prog: R(k, .3, .5), seed: 32 + i, col: C.mid, wob: .3 });
  D.ink([[0, 0], [0, 150]], { w: 8 / sc, prog: R(k, .2, .5), seed: 38, wob: 0 }); D.ink([[-70, 150], [70, 150]], { w: 8 / sc, prog: R(k, .4, .5), seed: 39, wob: 0 });
  D.ink([[-90, -90], [-90, -20], [0, 20], [90, -20], [90, -90]], { w: 5 / sc, prog: R(k, .3, .5), seed: 40 }); }); }
// a wave line with a given thickness, amplitude and wavelength (the voice "shape")
function vwave(x0, x1, y, amp, wl, t, o = {}) { const pts = []; for (let x = x0; x <= x1; x += 6) { const env = Math.sin(clamp((x - x0) / (x1 - x0)) * Math.PI); pts.push([x, y + Math.sin(x / wl * TAU - t * (o.sp || 3)) * amp * env]); }
  D.ink(pts, { w: o.w || 6, prog: o.prog ?? 1, col: o.col || C.ink, wob: 0, a: o.a }); }
function friend(x, y, sc, k, seed, col) { if (k <= 0) return; at(x, y, sc, c => { const hd = D.circ(0, 0, 70, 30); D.crayon(hd, col, { prog: k, seed, scribble: false }); D.ink(hd, { w: 5 / sc, prog: k, seed: seed + 1 });
  D.ink([[-20, -8], [-12, -4]], { w: 5 / sc, prog: k, seed: seed + 2, wob: 0 }); D.ink([[12, -4], [20, -8]], { w: 5 / sc, prog: k, seed: seed + 3, wob: 0 }); D.ink([[-18, 24], [0, 32], [18, 24]], { w: 4 / sc, prog: k, seed: seed + 4 });
  const bd = [[-80, 90], [-60, 160], [60, 160], [80, 90], [0, 72]]; D.crayon(bd, col, { prog: R(k, .2, .5), seed: seed + 5, scribble: false }); D.ink([...bd, bd[0]], { w: 5 / sc, prog: k, seed: seed + 6 }); }); }

// ---------- A: hook ----------
function sceneA(t) { head(560, 950, .72, { t, air: 1, bone: 1, cochlea: 1, folds: 1, voice: 1, ripples: .6 });
  stack([['Nobody else', C.ink], ['hears this.', C.blue]], 540, 420, t < .05 ? 1 : R(t, -.4, .3), { size: 108, lh: 122, align: 'center' });
  label([{ s: 'air', col: AIR }], 280, 760, 1, { size: 50 }); label([{ s: 'bone', col: BONE }], 780, 1180, 1, { size: 50 }); }

// ---------- B: the book page with the search question ----------
const P = document.createElement('canvas'); P.width = 1500; P.height = 1000; const pg = P.getContext('2d');
const LINES = ['Why does your voice sound weird', 'on recordings? When you speak,', 'sound reaches your inner ear by', 'two paths: through the air, and', 'through the bones of your skull.', 'A microphone hears only the air.'];
const HL = []; { pg.fillStyle = C.blue; pg.font = D.font('serif', 104, 700); pg.fillText('3.4', 40, 130); const w = pg.measureText('3.4 ').width; pg.fillStyle = C.ink; pg.fillText('Your own voice', 40 + w, 130);
  pg.font = D.font('serif', 60, 400); LINES.forEach((ln, i) => pg.fillText(ln, 40, 300 + i * 100));
  const find = (li, wd, col, t0) => { const x = pg.measureText(LINES[li].slice(0, LINES[li].indexOf(wd))).width + 40; HL.push({ x, y: 300 + li * 100 - 52, w: pg.measureText(wd).width, h: 68, col, t0 }); };
  find(0, 'Why does your voice sound weird', C.hlBlue, s(1) + .1); find(1, 'on recordings?', C.hlBlue, s(1) + .9); find(3, 'two paths', C.greenL, s(1) + 1.8); find(5, 'only the air.', C.pinkL, s(1) + 2.3); }
function sceneB(t) { const T = D.T, tg = D.tg; tg.setTransform(1, 0, 0, 1, 0, 0); tg.clearRect(0, 0, W, H); const u = ss(R(t, s(1) - .3, 4)), z = 1.0 + .08 * u;
  tg.translate(40 - 20 * u, 470); tg.rotate(-.07); tg.scale(z, z); D.use(tg); HL.forEach(h => D.marker(h.x, h.y, h.w, h.h, h.col, R(t, h.t0, .45))); tg.drawImage(P, 0, 0); D.use(lg);
  const band = (y0, y1, b) => { lg.save(); lg.beginPath(); lg.rect(0, y0, W, y1 - y0); lg.clip(); if (b) lg.filter = `blur(${b}px)`; lg.drawImage(T, 0, 0); lg.restore(); };
  band(0, 480, 7); band(480, 600, 3); band(600, 1000, 0); band(1000, 1110, 3); band(1110, H, 8); }

// ---------- C: two paths; the air path ----------
function sceneC(t) { const t0 = s(2), airOn = t > s(3) - .2;
  head(560, 870, .82, { t, k: R(t, t0 - .3, 1), air: R(t, t0 + .8, 1.2), bone: R(t, t0 + 1.6, 1), boneA: airOn ? .25 : 1, cochlea: 1, folds: 1, voice: airOn ? 1 : 0 });
  D.text('two paths', 540, 372, { f: 'sans', size: 96, wt: 800, align: 'center', track: -3, a: R(t, t0, .4) });
  label([{ s: '1 ', col: C.mid }, { s: 'air', col: AIR }], 230, 650, R(t, t0 + 1.2, .5), { size: 56 }); label([{ s: '2 ', col: C.mid }, { s: 'bone', col: BONE }], 790, 1150, R(t, t0 + 2.0, .5), { size: 56, a: airOn ? .35 : 1 });
  if (airOn) { label(['out of your ', { s: 'mouth', col: AIR }, ', round to your ', { s: 'ears', col: AIR }], 540, 448, R(t, s(3) + .3, .9), { size: 46 });
    D.ink(D.circ(560 + MOUTH[0] * .82, 870 + MOUTH[1] * .82, 52, 36), { w: 5, prog: R(t, s(3) + .6, .6), seed: 50, col: C.red }); } }

// ---------- D: inside: bone conduction (zoomed skull section) + the low-tone boost ----------
function eq(x, y, k, boost) { if (k <= 0) return; const c = lg; c.save(); c.globalAlpha = k; c.shadowColor = 'rgba(40,50,80,.18)'; c.shadowBlur = 30; c.fillStyle = '#fff'; c.beginPath(); c.roundRect(x, y, 380, 250, 24); c.fill(); c.restore();
  D.text('TONES REACHING YOUR EAR', x + 24, y + 40, { f: 'mono', size: 17, wt: 600, col: C.mid, a: k });
  for (let i = 0; i < 8; i++) { const base = 70 + 20 * Math.sin(i * 1.3), extra = i < 3 ? (3 - i) * 32 * boost : 0, h = base + extra, bx = x + 30 + i * 42; c.save(); c.globalAlpha = k; c.fillStyle = i < 3 ? BONE : C.blueL; c.beginPath(); c.roundRect(bx, y + 210 - h, 28, h, 6); c.fill(); c.restore(); }
  D.text('low', x + 30, y + 238, { f: 'hand', size: 30, col: BONE, a: k }); D.text('high', x + 310, y + 238, { f: 'hand', size: 30, col: C.mid, a: k }); }
function sceneD(t) { const t0 = s(4), z = lerp(1.0, 1.1, ss(R(t, t0, s(6) - t0)));
  head(640, 800, z, { t, k: R(t, t0 - .3, .9), skull: R(t, t0 + .2, 1.2), cochlea: R(t, t0 + .4, 1), folds: 1, bone: R(t, t0 + 1.0, 1.2), ripples: R(t, t0 + 1.4, .8), air: 1, airA: .15 });
  if (t < s(5) - .2) label(['your ', { s: 'skull', col: BONE }, ' carries it'], 300, 380, R(t, t0 + .9, .8), { size: 52 });
  label([{ s: 'inner ear', col: C.blue }], 200, 980, R(t, t0 + 2.6, .6), { size: 46 }); D.arrow(D.wave(280, 945, 560, 855, 8, 1), { w: 4.5, prog: R(t, t0 + 3.0, .5), seed: 60 });
  if (t > s(5) - .2) { D.text('bone conduction', 60, 390, { f: 'sans', size: 72, wt: 800, align: 'left', col: BONE, track: -2, a: R(t, s(5) - .1, .4) });
    eq(60, 840, R(t, s(5) + 1.0, .5), ss(R(t, s(5) + 2.2, 1.2))); } }

// ---------- E: navy slide: to you, deeper + fuller ----------
function sceneE(t) { const t0 = s(6), c = lg;
  D.text('TO YOU', 540, 400, { f: 'mono', size: 30, wt: 700, col: '#aab4d6', align: 'center', track: 8, a: R(t, t0, .4) });
  [['deeper', '#f2f4fa', 1.0], ['+ fuller', C.pink, 2.0]].forEach(([w, col, d], i) => { const k = ex(R(t, t0 + d, .5)); D.text(w, 540, 560 + i * 150 + 30 * (1 - k), { f: 'sans', size: 140, wt: 800, col, align: 'center', track: -5, a: k }); });
  c.save(); c.globalAlpha = R(t, t0 + .4, .6); vwave(140, 940, 1000, 90, 320, t, { w: 14, col: '#8fb0ff', sp: 2 }); vwave(140, 940, 1000, 60, 320, t + .3, { w: 6, col: C.pink, sp: 2 }); c.restore(); }

// ---------- F: the microphone hears only the air path ----------
function sceneF(t) { const t0 = s(7), xk = R(t, s(8) + .3, .5), comp = R(t, s(9) - .3, .6);
  if (comp < 1) { lg.save(); lg.globalAlpha = 1 - comp;
    head(330, 790, .62, { t, k: R(t, t0 - .3, .8), air: 0, bone: 1, boneA: lerp(1, .3, xk), cochlea: 1, folds: 1, voice: 1 });
    mic(820, 760, .9, R(t, t0, .7));
    D.arrow(D.wave(520, 860, 780, 700, 16, 3), { w: 7, prog: R(t, t0 + .8, .8), seed: 70, col: AIR });
    for (let i = 0; i < 3; i++) { const ph = ((t * .5) + i / 3) % 1; if (t > t0 + 1.6) D.dot(lerp(520, 760, ph), lerp(860, 720, ph) + Math.sin(ph * 18) * 10, 11, AIR); }
    label(['only the ', { s: 'air', col: AIR }, ' path'], 540, 420, R(t, t0 + 1.0, .8), { size: 60 });
    if (xk > 0) { const cx = 330 + 50 * .62, cy = 790 + 170 * .62; D.ink([[cx - 70, cy - 70], [cx + 70, cy + 70]], { w: 10, prog: xk, col: C.red, wob: 0 }); D.ink([[cx + 70, cy - 70], [cx - 70, cy + 70]], { w: 10, prog: R(t, s(8) + .5, .4), col: C.red, wob: 0 });
      label([{ s: 'no skull, no bass', col: C.red }], 330, 1150, R(t, s(8) + .8, .7), { size: 50 }); }
    lg.restore(); }
  if (comp > 0) { lg.save(); lg.globalAlpha = comp;
    D.text('IN YOUR HEAD', 90, 450, { f: 'mono', size: 26, wt: 700, col: C.mid, track: 5 }); vwave(90, 990, 590, 110, 300, t, { w: 16, col: BONE, sp: 2.5 }); vwave(90, 990, 590, 80, 300, t + .2, { w: 7, col: AIR, sp: 2.5 });
    const rk = R(t, s(9) + .8, .6); D.text('THE RECORDING', 90, 820, { f: 'mono', size: 26, wt: 700, col: C.mid, track: 5, a: rk }); vwave(90, 990, 960, 70, 120, t, { w: 5, col: AIR, sp: 6, prog: rk });
    label([{ s: 'thinner', col: AIR }, ' + ', { s: 'higher', col: AIR }], 540, 1140, R(t, s(9) + 1.6, .7), { size: 58 }); lg.restore(); } }

// ---------- G: everyone else hears the air voice; to you it sounds like a stranger ----------
function phone(x, y, k, t) { if (k <= 0) return; const c = lg; c.save(); c.globalAlpha = k; c.shadowColor = 'rgba(40,50,80,.2)'; c.shadowBlur = 30; c.fillStyle = '#fff'; c.beginPath(); c.roundRect(x - 120, y - 210, 240, 420, 34); c.fill(); c.restore();
  D.ink(D.rect(x - 120, y - 210, 240, 420), { w: 5, prog: k, seed: 80, smooth: false }); vwave(x - 90, x + 90, y - 30, 40, 40, t, { w: 5, col: AIR, sp: 6, a: k });
  const c2 = lg; c2.save(); c2.globalAlpha = k; c2.fillStyle = C.blue; c2.beginPath(); c2.moveTo(x - 22, y + 90); c2.lineTo(x + 28, y + 120); c2.lineTo(x - 22, y + 150); c2.closePath(); c2.fill(); c2.restore(); }
function sceneG(t) { const t0 = s(10), str = t > s(11) - .2;
  if (!str) { head(280, 820, .6, { t, k: R(t, t0 - .3, .8), air: 0, cochlea: 1, folds: 1, voice: 1 });
    [[880, 580, '#cfe0ff', 300], [880, 920, '#ffe1ea', 310], [660, 760, '#d9f5df', 320]].forEach(([x, y, col, sd], i) => { friend(x, y, .9, R(t, t0 + .2 + i * .25, .6), sd, col);
      D.arrow(D.wave(450, 895, x - 90, y + 20, 8, 2), { w: 5, prog: R(t, t0 + .8 + i * .2, .6), seed: 90 + i, col: AIR, len: 20 }); });
    label(['what ', { s: 'everyone else', col: AIR }, ' hears'], 540, 400, R(t, t0 + .3, .8), { size: 58 }); }
  else { const k = R(t, s(11) - .2, .6); phone(720, 760, k, t); head(330, 820, .62, { t, k: 1, cochlea: 1, air: 0 });
    label(['from the ', { s: 'outside', col: AIR }], 540, 400, R(t, s(11) + .2, .7), { size: 58 });
    const q = R(t, s(11) + 2.0, .5); if (q > 0) { D.text('who is that?', 430, 520, { f: 'hand', size: 60, col: C.red, a: q }); D.text('?', 520, 640, { f: 'sans', size: 120, wt: 800, col: C.red, a: q }); } } }

// ---------- H: 2023 study: editor card + bone-conduction headphones ----------
function sceneH(t) { const t0 = s(12), ck = ex(R(t, t0 - .2, .6)), c = lg; c.save(); c.globalAlpha = ck; c.shadowColor = 'rgba(40,50,80,.22)'; c.shadowBlur = 50; c.shadowOffsetY = 18; c.fillStyle = '#fff'; c.beginPath(); c.roundRect(110, 330, 860, 800, 34); c.fill(); c.restore();
  D.text('2023 STUDY · EPFL, GENEVA', 160, 410, { f: 'mono', size: 24, wt: 700, col: C.mid, a: ck, track: 4 }); D.text('Me, or someone else?', 160, 500, { f: 'serif', size: 62, a: ck, write: R(t, t0 + .1, .7) });
  const rows = [['voice clips blending you', 'and a stranger'], ['played through the air', 'or through the bone']]; rows.forEach(([a1, a2], i) => { const kk = R(t, t0 + .9 + i * 1.0, .5), y = 610 + i * 150; if (kk <= 0) return;
    c.save(); c.globalAlpha = kk; c.fillStyle = i ? C.pinkL : C.hlBlue; c.beginPath(); c.arc(190, y + 4, 32, 0, TAU); c.fill(); c.restore(); D.text(String(i + 1), 190, y + 18, { f: 'sans', size: 38, wt: 800, align: 'center', a: kk });
    D.text(a1, 245, y, { f: 'hand', size: 46, write: kk }); D.text(a2, 245, y + 48, { f: 'hand', size: 46, col: C.mid, write: R(kk, .3, .7) }); });
  // bone-conduction headphones: a band whose pad sits on the cheekbone, in front of the ear
  head(800, 1000, .36, { t, k: ck, cochlea: 1, bone: R(t, t0 + 2.6, .6), boneA: 1 });
  at(800, 1000, .36, () => { D.ink([[60, -10], [40, -200], [-160, -260], [-220, -120]], { w: 18, prog: R(t, t0 + 2.2, .6), seed: 100, col: C.ink }); D.crayon(D.circ(60, 0, 40, 20), C.ink, { prog: R(t, t0 + 2.4, .4), seed: 101, scribble: false }); });
  const rk = R(t, t0 + 3.6, .6); if (rk > 0) { D.marker(160, 930, 440, 70, C.greenL, rk); D.text('bone: easier to', 175, 975, { f: 'hand', size: 50, a: rk }); D.text('spot your own voice', 175, 1035, { f: 'hand', size: 50, col: C.blue, a: R(rk, .3, .7) }); }
  if (t > s(13) - .2) { const k2 = R(t, s(13), .6); D.ink(D.circ(380, 1000, 250, 50, .38), { w: 6, prog: k2, seed: 102, col: C.red }); label([{ s: 'the voice they knew', col: C.red }], 540, 1170, R(t, s(13) + .9, .7), { size: 50 }); } }

// ---------- I: payoff: you minus the bone (shrinks into the video-player card) ----------
function sceneI(t) { const t0 = s(14), mk = ss(R(t, t0 + 1.6, 1.2));
  head(560, 800, .8, { t, air: 1, bone: 1, boneA: 1 - mk * .85, cochlea: 1, folds: 1, voice: 1 });
  label([{ s: 'you', col: C.ink }, ' − ', { s: 'bone', col: BONE }, ' = ', { s: 'recording', col: AIR }], 540, 420, R(t, t0 + 1.2, .9), { size: 62 }); }
// ---------- J: question ----------
function sceneJ(t) { const t0 = s(15), c = lg; label(['Like your recorded voice?'], 540, 560, R(t, t0 - .1, .7), { size: 76 });
  [['YES', 300, C.pinkL], ['NO', 780, C.hlBlue]].forEach(([w, x, col], i) => { const k = bo(R(t, t0 + .6 + i * .3, .4)); if (k <= 0) return; c.save(); c.translate(x, 800); c.scale(k, k); c.fillStyle = col; c.beginPath(); c.roundRect(-170, -70, 340, 140, 70); c.fill(); c.restore(); D.text(w, x, 830, { f: 'sans', size: 80, wt: 800, align: 'center', a: clamp(k) }); });
  mic(540, 1000, .5, R(t, t0 + .3, .6)); }
// ---------- K: standard end card ----------
function sceneK(t) { const t0 = s(16) - .3, u = ex(R(t, t0, .7)), c = lg; D.logo(540 - 22, 520, 1.4, u, c);
  D.text('Follow for more of', 540, 660, { f: 'sans', size: 64, wt: 800, align: 'center', a: u }); D.text('how it really works.', 540, 750, { f: 'sans', size: 72, wt: 800, align: 'center', col: C.blue, a: u });
  D.text("A new 'wait, really?' every day.", 540, 840, { f: 'sans', size: 40, wt: 600, align: 'center', col: C.mid, a: R(t, t0 + .4, .5) });
  const pk = R(t, t0 + .6, .5); c.save(); c.globalAlpha = pk; c.fillStyle = C.hlBlue; c.beginPath(); c.roundRect(300, 910, 480, 84, 42); c.fill(); c.restore(); D.text('@howitreallyworkstudio', 540, 965, { f: 'sans', size: 34, wt: 700, align: 'center', col: C.blue, a: pk });
  // loop toward frame 0: the two paths start drawing again
  const lk = R(t, TOT - 1.4, 1.2); if (lk > 0) head(560, 1090, .3, { t, k: lk, air: lk, bone: lk, cochlea: 1 }); }

// ---------- HUD (Batch N: nothing in the top 250 px, nothing written below y 1440, top-right corner free for the badge) ----------
function hud(t, dk) { const c = g; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.filter = 'none'; const ink = dk > .5 ? 'rgba(226,232,248,' : 'rgba(30,34,46,'; c.strokeStyle = ink + '.5)'; c.lineWidth = 2.5;
  const m = 44, q = 34; [[m, 262, 1, 1], [m, H - 500, 1, -1], [W - m, H - 500, -1, -1]].forEach(([x, y, sx, sy]) => { c.beginPath(); c.moveTo(x, y + sy * q); c.lineTo(x, y); c.lineTo(x + sx * q, y); c.stroke(); });
  D.logo(80, 312, .5, 1, c); c.font = D.font('sans', 20, 800); c.fillStyle = ink + '.85)'; c.letterSpacing = '3px'; c.fillText('HOWITREALLYWORKS', 112, 304); c.restore(); }
const CH = [['two paths', 2], ['bone', 4], ['mic', 7], ['others', 10], ['study', 12]];
function chapters(t, dk) { if (t >= s(16) - .4) return; const c = g; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); let cur = -1; CH.forEach(([, i], k) => { if (t >= s(i) - .3) cur = k; });
  const x0 = 150, dx = 195, y = 1402; c.strokeStyle = dk > .5 ? 'rgba(200,210,240,.35)' : 'rgba(30,34,46,.2)'; c.lineWidth = 3; c.beginPath(); c.moveTo(x0, y); c.lineTo(x0 + dx * 4, y); c.stroke();
  CH.forEach(([lab], k) => { const x = x0 + k * dx, on = k === cur, done = k < cur; c.fillStyle = on ? C.blue : done ? (dk > .5 ? '#8fb0ff' : C.blueL) : (dk > .5 ? '#3a4466' : '#dfe3ec'); c.beginPath(); c.arc(x, y, on ? 13 : 9, 0, TAU); c.fill();
    c.font = D.font('mono', 17, on ? 700 : 500); c.textAlign = 'center'; c.letterSpacing = '2px'; c.fillStyle = on ? (dk > .5 ? '#e8ecfa' : C.ink) : (dk > .5 ? 'rgba(200,210,240,.5)' : 'rgba(30,34,46,.4)'); c.fillText(lab.toUpperCase(), x, y + 34); }); c.restore(); }

// ---------- compositor ----------
const SC = [[0, sceneA, 0], [s(1) - .3, sceneB, 0], [s(2) - .3, sceneC, 0], [s(4) - .3, sceneD, 0], [s(6) - .3, sceneE, 1], [s(7) - .3, sceneF, 0], [s(10) - .3, sceneG, 0],
  [s(12) - .3, sceneH, 0], [s(14) - .3, sceneI, 0], [s(15) - .3, sceneJ, 0], [s(16) - .35, sceneK, 0]];
const TR = .45;
function idx(t) { let i = 0; for (let k = 0; k < SC.length; k++) if (t >= SC[k][0]) i = k; return i; }
function draw(i, t) { D.clearLayer(); SC[i][1](t); }
function blitScene(i, t, o) { if (SC[i][1] === sceneI) { const k = R(t, s(14) + 2.9, .8); if (k > 0) { D.card(k, t / TOT, t, TOT, { cy: 760, h: 860, src: [60, 330, 960, 860] }); return; } } D.blit(o); }
function scene(t) { const i = idx(t), u = R(t, SC[i][0], TR), dk = i > 0 && u < 1 ? lerp(SC[i - 1][2], SC[i][2], ss(u)) : SC[i][2];
  D.ground(dk);
  if (i > 0 && u < 1) { draw(i - 1, t); blitScene(i - 1, t, { a: 1 - ss(u), z: 1 + .06 * u, blur: 14 * u }); }
  draw(i, t); blitScene(i, t, { a: i > 0 ? ss(u) : 1, z: (i > 0 ? lerp(.95, 1, ex(u)) : 1) * (1 + .012 * Math.sin(t * .9)), dy: 8 * Math.sin(t * .6), blur: i > 0 ? 12 * (1 - u) : 0 });
  const ph = PH.findLast(p => t >= p.start - .25), endc = t >= s(16) - .4;
  if (!endc && ph) D.karaoke(ph, t, 1280, { dark: dk > .5, size: 48, maxW: 820, out: ph.i < PH.length - 1 ? PH[ph.i + 1].start - .2 : null });
  chapters(t, dk); hud(t, dk); }
window.DUR = TOT;
// ending: at most a 40% dim, then the loop restarts on the head with both paths
window.seek = t => { scene(t); const f = Math.min(1, (TOT - t) / .35); if (f < 1) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = (1 - f) * .4; g.fillStyle = C.bg; g.fillRect(0, 0, W, H); g.restore(); } };
window.render = window.seek;
// thumbnail / cover
window.thumb = () => { D.ground(0); D.clearLayer(); head(560, 1060, .9, { t: 1.2, air: 1, bone: 1, cochlea: 1, folds: 1, voice: 1, ripples: .6 });
  [['Why do I', C.ink], ['sound weird', C.ink], ['on recordings?', C.blue]].forEach(([w, col], i) => D.text(w, 540, 360 + i * 120, { f: 'sans', size: 106, wt: 800, col, align: 'center', track: -4 }));
  D.blit({}); hud(1, 0); };
window.seek(0); window.ready = true; window.READY = true;
