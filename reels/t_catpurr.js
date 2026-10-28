import { createSP, cfg, W, H, TAU, clamp, lerp, ramp, win, hash, mixc, DYE, dye, hidePiece, at, rod, inkText, plaque, tag, circ, ring, ell, poly, trem, puppet, cutPlaque, rivet, FONT } from './styles/shadowpuppet/shadowpuppet.js';
await Promise.all([document.fonts.load('italic 700 60px "Cormorant Garamond"')]);
cfg.hide = true;
const canvas = document.getElementById('c'), R = createSP(canvas), g = R.g;
const TL = window.TL, PH = TL.p, T = i => PH[i].start, E = i => PH[i].end;
const r = (i, d) => T(i) + d, ease = x => 1 - Math.pow(1 - clamp(x), 3);
const cam = (s, cx, cy) => R.cam(s, cx, cy);
const GOLD = 'rgba(255,205,110,1)', TABBY = ['#f2b25e', '#cf6e2c'], PINK = ['#f4a3a0', '#c8566a'], FOLD = ['#f6b8b0', '#d77a84'];
const fr = x => x - Math.floor(x);
const label = (t, ti, fn) => { const k = ramp(t, ti, ti + .45); if (k > 0) { g.save(); g.globalAlpha *= k; fn(k); g.restore(); } };
const sq = (t, f) => .5 + .5 * Math.tanh(4 * Math.sin(TAU * f * t));   // on/off twitch, shown slowed down

// ---------- the cat puppet (profile, facing right; origin = feet centre, ~330 px tall at s = 1) ----------
function cat(x, y, s, t, o = {}) {
  const pk = o.purr ?? 1, j = trem(x * .017 + 3, t, 1.6), buzz = pk * 1.4 * Math.sin(t * 157), tail = .18 * Math.sin(t * 1.3 + x) + (o.tail || 0);
  at(g, x + j[0], y + j[1] + buzz, o.tilt || 0, s, () => {
    // tail (behind), jointed at the haunch
    at(g, -92, -26, tail, 1, () => {
      hidePiece(g, p => { const L = [], Rr = []; for (let i = 0; i <= 14; i++) { const u = i / 14, a = -2.6 + 1.9 * u, rr = 60 + 70 * u, cx = -30 + Math.cos(a) * rr * .8, cy = -10 + Math.sin(a) * rr * .9 - 40 * u * u, w = 15 - 8 * u, n = a + Math.PI / 2;
        L.push([cx + Math.cos(n) * w, cy + Math.sin(n) * w]); Rr.push([cx - Math.cos(n) * w, cy - Math.sin(n) * w]); }
        poly(p, L.concat(Rr.reverse())); for (let i = 0; i < 4; i++) { const u = .2 + i * .19, a = -2.6 + 1.9 * u, rr = 60 + 70 * u; ell(p, -30 + Math.cos(a) * rr * .8, -10 + Math.sin(a) * rr * .9 - 40 * u * u, 6, 2.4, a); } }, TABBY, { r: 90, lw: 2, edge: '#6a2c0c' });
    });
    // body with carved stripes + haunch ring (o.breath: the chest swells on the in-breath)
    const br = o.breath || 0; g.save(); g.scale(1 + .025 * br, 1 + .07 * br);
    hidePiece(g, p => { p.moveTo(-104, 0); p.bezierCurveTo(-136, -92, -92, -188, -8, -202); p.bezierCurveTo(52, -208, 82, -172, 86, -122); p.bezierCurveTo(92, -62, 82, -22, 74, 0); p.closePath();
      ring(p, 40, 47, -50, -62); for (let i = 0; i < 5; i++) { const a = -2.5 + i * .3; ell(p, -10 + Math.cos(a) * 150, -40 + Math.sin(a) * 150, 15, 3.6, a + Math.PI / 2); }
      for (let i = 0; i < 4; i++) circ(p, 30 + (i % 2) * 14, -150 + i * 22, 4); }, TABBY, { r: 140, lw: 3, edge: '#6a2c0c' });
    // front leg + paw
    hidePiece(g, p => { poly(p, [[36, -116], [70, -116], [80, -4], [42, -4]]); ell(p, 64, -4, 26, 10, 0); for (let i = 0; i < 3; i++) ell(p, 58, -92 + i * 26, 9, 2.5, 0); }, TABBY, { r: 70, lw: 2, edge: '#6a2c0c' });
    rivet(g, 52, -112, 6); rivet(g, -92, -26, 6);
    // head on a neck rivet, slight nod
    at(g, 58, -196, (o.head || 0) + .05 * Math.sin(t * .9), 1, () => {
      hidePiece(g, p => { circ(p, 22, -46, 60); poly(p, [[-26, -78], [-10, -146], [18, -98]]); poly(p, [[22, -104], [56, -146], [66, -80]]);
        poly(p, [[-14, -92], [-8, -122], [6, -100]]); poly(p, [[34, -102], [52, -126], [56, -92]]);
        if (o.eyes === 'open') { ell(p, 46, -56, 14, 7, -.15); ell(p, 47, -56, 2.5, 6, 0); } else { p.moveTo(32, -56); p.quadraticCurveTo(46, -46, 60, -58); p.quadraticCurveTo(46, -51, 32, -56); }
        poly(p, [[76, -40], [86, -40], [81, -32]]); p.moveTo(70, -22); p.quadraticCurveTo(78, -16, 82, -24); p.quadraticCurveTo(78, -19, 70, -22);
        [-.12, .06, .22].forEach(a => ell(p, 66 + Math.cos(a) * 18, -28 + Math.sin(a) * 18, 18, 1.6, a)); }, TABBY, { r: 90, lw: 3, edge: '#6a2c0c' });
      rivet(g, -4, -10, 6);
    });
    g.restore();
  });
}
const THROAT = [70, -178];   // local throat point (for rings / the voice box)
function rings(x, y, t, k, o = {}) {   // purr rumble: gold arcs pulsing out of the throat
  if (k <= 0) return; const n = o.n || 4, sp = o.sp || 1.1, span = o.span || 230, a0 = o.dir ?? 0, w = o.w ?? .75;
  for (let i = 0; i < n; i++) { const f = fr(t * sp + i / n), rr = (o.r0 || 36) + f * span, th = 6 - 3 * f;
    dye(g, p => { p.moveTo(x + Math.cos(a0 - w) * (rr + th), y + Math.sin(a0 - w) * (rr + th)); p.arc(x, y, rr + th, a0 - w, a0 + w); p.arc(x, y, rr - th, a0 + w, a0 - w, true); p.closePath(); }, DYE.sun, { edge: false, a: k * (1 - f) * .95, hide: false }); }
  R.glow(x, y, span * .9, GOLD, .22 * k * g.globalAlpha);
}
function catWithRings(x, y, s, t, k, o = {}) { cat(x, y, s, t, o); rings(x + THROAT[0] * s + 30 * s, y + THROAT[1] * s, t, k, { span: 260 * s, ...o.rings }); }
function floor(y) { dye(g, p => { p.moveTo(-300, 2400); p.lineTo(-300, y); p.quadraticCurveTo(540, y - 40, 1400, y); p.lineTo(1400, 2400); p.closePath(); for (let i = 0; i < 24; i++) circ(p, -20 + i * 48, y + 70 + (i % 3) * 34, 7); }, DYE.ink, { r: 600, edge: '#07030c' }); }

// ---------- voice box pieces ----------
function folds(x, y, s, open, o = {}) {   // top view: two folds, a bright slit of light between them when open
  at(g, x, y, 0, s, () => {
    const w = 6 + 64 * open, h = 150;
    dye(g, p => { ell(p, 0, 0, 210, 200, 0); ell(p, 0, 0, 188, 178, 0); }, ['#7a2a34', '#4a121c'], { r: 210, edge: '#2a0810' });
    hidePiece(g, p => { p.moveTo(0, -h); p.quadraticCurveTo(-w * 1.15, 0, -w, h); p.lineTo(-170, h - 40); p.quadraticCurveTo(-200, 0, -150, -h + 10); p.closePath(); if (o.pads) ell(p, -70 - w * .3, 10, 34, 70, .06); }, FOLD, { r: 200, lw: 3, edge: '#7a2a3a' });
    hidePiece(g, p => { p.moveTo(0, -h); p.quadraticCurveTo(w * 1.15, 0, w, h); p.lineTo(170, h - 40); p.quadraticCurveTo(200, 0, 150, -h + 10); p.closePath(); if (o.pads) ell(p, 70 + w * .3, 10, 34, 70, -.06); }, FOLD, { r: 200, lw: 3, edge: '#7a2a3a' });
    if (o.pads) { [-1, 1].forEach(sd => dye(g, p => ell(p, sd * (70 + w * .3), 10, 34, 70, -sd * .06), ['#ff8fa0', '#e0506e'], { r: 70, edge: '#8a1a34', a: .9 })); }
    dye(g, p => { p.moveTo(-200, h + 40); p.lineTo(200, h + 40); p.lineTo(200, 260); p.lineTo(-200, 260); p.closePath(); p.moveTo(-210, -h - 40); p.lineTo(210, -h - 40); p.lineTo(210, -260); p.lineTo(-210, -260); p.closePath(); }, ['#4a121c'], { edge: false, a: 0 });
    R.glow(0, 0, 70 + 120 * open, 'rgba(255,236,190,1)', .35 * open * g.globalAlpha);
  });
}
function voicebox(x, y, s, t, o = {}) {   // side view: shield cartilage, window on the folds, windpipe rings, side muscles
  at(g, x, y, 0, s, () => {
    for (let i = 0; i < 5; i++) hidePiece(g, p => { p.roundRect(-56, 86 + i * 38, 112, 26, 12); ell(p, 0, 99 + i * 38, 30, 5, 0); }, ['#e9d6b0', '#c8a874'], { r: 70, lw: 2, edge: '#6a4a24' });
    if (o.muscle !== undefined) { const m = o.muscle; [-1, 1].forEach(sd => at(g, sd * 112, 0, 0, 1, () => hidePiece(g, p => { ell(p, 0, 0, 24 - 5 * m, 92 * (1 - .14 * m), 0); for (let i = 0; i < 5; i++) ell(p, 0, -60 + i * 30, 12, 2.4, 0); }, DYE.red, { r: 90, lw: 2, edge: '#6a1010' }))); }
    hidePiece(g, p => { poly(p, [[-104, -96], [-26, -96], [0, -70], [26, -96], [104, -96], [86, 30], [0, 76], [-86, 30]]); p.roundRect(-50, -52, 100, 74, 22);
      for (let i = 0; i < 6; i++) circ(p, -70 + i * 28, 50 - Math.abs(i - 2.5) * 8, 4.5); }, ['#ecd9b4', '#c9a26c'], { r: 110, lw: 3, edge: '#6a4a24' });
    const op = o.open ?? 0; [-1, 1].forEach(sd => dye(g, p => { p.moveTo(0, -46); p.quadraticCurveTo(sd * (4 + 18 * op), -14, sd * (3 + 16 * op), 18); p.lineTo(sd * 46, 18); p.lineTo(sd * 46, -46); p.closePath(); }, FOLD, { r: 60, edge: '#7a2a3a' }));
    if (o.pads) [-1, 1].forEach(sd => dye(g, p => ell(p, sd * (26 + 8 * op), -14, 9, 20, 0), ['#ff8fa0', '#e0506e'], { r: 30, edge: '#8a1a34' }));
    R.glow(0, -14, 40 + 60 * op, 'rgba(255,236,190,1)', .3 * op * g.globalAlpha);
  });
}
function arrow(x, y, ang, len, col = DYE.moon, a = 1) { at(g, x, y, ang, 1, () => dye(g, p => poly(p, [[-len / 2, -9], [len / 2 - 26, -9], [len / 2 - 26, -24], [len / 2, 0], [len / 2 - 26, 24], [len / 2 - 26, 9], [-len / 2, 9]]), col, { r: len / 2, a, edge: shadeEdge(col) })); }
const shadeEdge = c => c === DYE.moon ? '#2d3f78' : '#6a1010';
function xmark(x, y, s, a = 1) { at(g, x, y, 0, s, () => dye(g, p => { poly(p, [[-60, -48], [-44, -62], [60, 48], [44, 62]]); poly(p, [[44, -62], [60, -48], [-44, 62], [-60, 48]]); }, DYE.red, { r: 70, edge: '#6a1010', a })); }
function nerve(x, y, s) { at(g, x, y, 0, s, () => dye(g, p => { poly(p, [[-6, 60], [6, 60], [4, -10], [-4, -10]]); [[-1, -40], [1, -46], [-.4, -64], [.5, -24]].forEach(([dx, yy], i) => { const ex = dx * 54, ey = yy - 10; poly(p, [[-3, -6 - i * 6], [3, -6 - i * 6], [ex + 3, ey], [ex - 3, ey]]); circ(p, ex, ey, 8); }); circ(p, 0, 66, 16); }, ['#f0d67a', '#c99a3a'], { r: 80, edge: '#6a4a14' })); }
function muscleIcon(x, y, s) { at(g, x, y, 0, s, () => hidePiece(g, p => { ell(p, 0, 0, 34, 76, 0); for (let i = 0; i < 6; i++) ell(p, 0, -50 + i * 20, 18, 2.6, 0); }, DYE.red, { r: 80, lw: 2, edge: '#6a1010' })); }
function heart(x, y, s, a = 1) { at(g, x, y, 0, s, () => dye(g, p => { p.moveTo(0, 30); p.bezierCurveTo(-60, -10, -40, -60, 0, -30); p.bezierCurveTo(40, -60, 60, -10, 0, 30); p.closePath(); circ(p, -14, -22, 5); circ(p, 14, -22, 5); }, DYE.red, { r: 50, edge: '#6a1010', a })); }

// ---------- p0-p1 hook: a purring cat; the claim, then the search question ----------
function sceneHook(t) {
  const a = 1 - ramp(t, E(1) + .05, E(1) + .5); if (a <= 0) return; g.save(); g.globalAlpha = a;
  cam(1 + .06 * ramp(t, 0, E(1)), 540, 860);
  floor(1180); rod(g, 470, 1000); rod(g, 640, 860);
  const bw = win(t, r(1, .5), E(1) + .5, .3), ph = fr((t - r(1, .5)) / 1.8), br = -Math.cos(TAU * ph) * bw;
  catWithRings(470, 1150, 1.45, t, 1, { breath: br });
  const swap = ramp(t, T(1) - .15, T(1) + .25), k1 = 1 - swap, k2 = swap;
  if (k1 > 0) { g.save(); g.globalAlpha *= k1; cutPlaque(g, 540, 420, 860, 230, ['SCIENTISTS', 'STILL ARGUE'], 82, 1); g.restore(); }
  if (k2 > 0) { g.save(); g.globalAlpha *= k2; cutPlaque(g, 540, 420, 860, 230, ['HOW DO', 'CATS PURR?'], 88, 1); g.restore(); }
  // breathing in / out: blue arrows at the nose
  if (bw > 0) { g.save(); g.globalAlpha *= bw; const inn = ph < .5, u = fr(ph * 2), fa = Math.sin(Math.PI * u);
    if (inn) arrow(880 - 60 * u, 735, Math.PI, 150, DYE.moon, fa); else arrow(800 + 60 * u, 765, 0, 150, DYE.moon, fa);
    tag(g, inn ? 'breathing in' : 'breathing out', 790, 600, 46); g.restore(); }
  g.restore();
}
// ---------- p2 larynx: twitching muscles ----------
function sceneLarynx(t) {
  const a = win(t, T(2) - .35, E(2) + .3, .45); if (a <= 0) return; g.save(); g.globalAlpha = a;
  const z = ease(ramp(t, T(2) - .35, r(2, 1.6)));
  if (z < 1) { g.save(); g.globalAlpha *= 1 - z; cam(lerp(1.45, 3.4, z), lerp(540, 600, z), lerp(860, 900, z)); catWithRings(470, 1150, 1.45, t, 1); g.restore(); }
  g.save(); g.globalAlpha *= z; cam(1, 540, 800);
  const m = sq(t, 2.2) * ramp(t, r(2, 3.8), r(2, 4.1));
  voicebox(540, 640, 1.9, t, { muscle: m, open: 1 - m }); rod(g, 540, 1100);
  label(t, r(2, .5), () => { tag(g, "one side: the brain's rhythm", 540, 280, 44); for (let i = 0; i < 9; i++) { const x = 230 + i * 70 - 70 * fr(t * 2.2), up = (i % 2) ? 1 : 0; if (x < 200 || x > 880) continue; dye(g, p => poly(p, [[x - 4, 400], [x + 4, 400], [x + 4, 400 - 40 * up - 6], [x - 4, 400 - 40 * up - 6]]), DYE.red, { edge: false }); } dye(g, p => poly(p, [[200, 398], [880, 398], [880, 404], [200, 404]]), ['#6a1010'], { edge: false }); });
  label(t, r(2, 2.4), () => { if (t < r(2, 3.9)) { g.save(); g.globalAlpha *= 1 - ramp(t, r(2, 3.6), r(2, 3.9)); tag(g, 'larynx = voice box', 540, 1060, 44); g.restore(); } });
  label(t, r(2, 3.9), () => { tag(g, 'muscles', 230, 1060, 42); tag(g, 'twitch', 830, 1060, 42); });
  g.restore(); g.restore();
}
// ---------- p3 folds open + snap shut (shown slowed) ----------
function sceneFolds(t) {
  const a = win(t, T(3) - .3, E(3) + .25, .45); if (a <= 0) return; g.save(); g.globalAlpha = a; cam(1 + .04 * ramp(t, T(3), E(3)), 540, 760);
  const op = sq(t, 1.6);
  folds(540, 640, 1.55, op);
  cutPlaque(g, 540, 1040, 700, 150, ['20–30 × a second'], 70, ramp(t, T(3) + .2, T(3) + .8));
  label(t, r(3, 1.2), () => inkText(g, 'top view, slowed way down', 540, 270, 40, '#3a1608', { ls: 2 }));
  label(t, r(3, 2.6), () => { tag(g, op > .5 ? 'open' : 'shut', 540, 640 - 330, 44); });
  g.restore();
}
// ---------- p4 air chopped into a rumble, both ways ----------
function sceneChop(t) {
  const a = win(t, T(4) - .25, E(4) + .3, .4); if (a <= 0) return; g.save(); g.globalAlpha = a; cam(1, 540, 800);
  const Y = 700, gx = 540, dir = t < r(4, 1.5) ? 1 : -1, op = sq(t, 1.8);
  dye(g, p => { p.roundRect(110, Y - 90, 860, 180, 40); p.roundRect(126, Y - 74, 828, 148, 30); }, ['#e9d6b0', '#c8a874'], { r: 300, edge: '#6a4a24' });
  // upstream: even stream; downstream: puffs
  for (let i = 0; i < 9; i++) { const u = fr(t * .9 + i / 9), x = dir > 0 ? lerp(140, gx - 40, u) : lerp(940, gx + 40, u); dye(g, p => circ(p, x, Y + 34 * Math.sin(i * 2.1), 8), DYE.moon, { edge: false, hide: false }); }
  for (let k = 0; k < 4; k++) { const u = fr(t * .55 + k / 4), cx = dir > 0 ? lerp(gx + 60, 930, u) : lerp(gx - 60, 150, u);
    for (let q = 0; q < 6; q++) dye(g, p => circ(p, cx + 14 * Math.cos(q * 1.1 + k), Y + 26 * Math.sin(q * 1.7 + k), 8), DYE.sun, { edge: false, hide: false, a: 1 - u * .4 }); }
  [-1, 1].forEach(sd => dye(g, p => poly(p, [[gx - 14, Y + sd * 74], [gx + 14, Y + sd * 74], [gx + 14, Y + sd * (74 - 64 * (1 - op))], [gx - 14, Y + sd * (74 - 64 * (1 - op))]]), FOLD, { r: 60, edge: '#7a2a3a' }));
  arrow(540, Y - 200, dir > 0 ? 0 : Math.PI, 260, DYE.moon, 1);
  label(t, T(4), () => tag(g, dir > 0 ? 'breathing out' : 'breathing in', 540, Y - 330, 44));
  label(t, r(4, .5), () => cutPlaque(g, 540, 1030, 520, 140, ['RUMBLE'], 84, 1));
  rings(gx, Y, t, .5 * a, { dir: dir > 0 ? 0 : Math.PI, span: 380, r0: 60, w: .5 });
  g.restore();
}
// ---------- p5 2023: a twist ----------
function sceneTwist(t) {
  const a = win(t, T(5) - .25, E(5) + .35, .45); if (a <= 0) return; g.save(); g.globalAlpha = a;
  cam(1 + .05 * ramp(t, T(5), E(5)), 540, 800);
  cutPlaque(g, 540, 420, 620, 200, ['2023'], 140, ramp(t, T(5) + .1, T(5) + .7));
  floor(1150); puppet(g, 380, 1130, 2.6, t, { hand: [lerp(40, 70, ramp(t, r(5, 1.6), r(5, 2.2))), lerp(-80, -230, ramp(t, r(5, 1.6), r(5, 2.2)))], hand2: [-20, -60], head: -.2 * ramp(t, r(5, 1.6), r(5, 2.2)) });
  const q = ramp(t, r(5, 2.0), r(5, 2.5)); if (q > 0) { g.save(); g.globalAlpha *= q; tag(g, 'a lab test', 720, 760, 50); g.restore(); }
  g.restore();
}
// ---------- p6-p7 the lab rig: no nerves, no muscles, still purrs ----------
function sceneLab(t) {
  const a = win(t, T(6) - .3, E(7) + .3, .5); if (a <= 0) return; g.save(); g.globalAlpha = a;
  R.cam(lerp(1.08, 1.14, ramp(t, T(6), E(7))), 590, 640, 640);
  const Y = 640, bel = .5 + .5 * Math.sin(t * 3);
  // bellows on the left, tube to the clamped voice box
  hidePiece(g, p => { poly(p, [[120, Y - 70 - 20 * bel], [280, Y - 30], [280, Y + 30], [120, Y + 70 + 20 * bel]]); for (let i = 0; i < 4; i++) ell(p, 160 + i * 30, Y, 4, 40 - i * 6, 0); }, DYE.card, { r: 120, lw: 2, edge: '#7a3a14' });
  dye(g, p => { p.roundRect(280, Y - 18, 210, 36, 14); p.roundRect(290, Y - 8, 190, 16, 8); }, ['#d6ece6', '#9fd0c8'], { r: 120, edge: '#2a5a54' });
  for (let i = 0; i < 6; i++) { const u = fr(t * 1.3 + i / 6); dye(g, p => circ(p, lerp(300, 470, u), Y, 6), DYE.moon, { edge: false, hide: false }); }
  dye(g, p => { poly(p, [[790, Y + 100], [810, Y + 100], [810, Y + 260], [790, Y + 260]]); p.roundRect(710, Y + 250, 180, 24, 10); }, ['#4a2c1a'], { r: 200, edge: false });
  const still = ramp(t, T(7), r(7, .5)), op = still > 0 ? sq(t, 1.6) : .3;
  at(g, 800, Y, Math.PI / 2, 1, () => voicebox(0, 0, 1.15, t, { open: op }));
  if (still > 0) rings(920, Y, t, still, { span: 260, r0: 60 });
  cam(1, 540, 800);
  // what is NOT working
  const k1 = ramp(t, r(6, 3.0), r(6, 3.5)), k2 = ramp(t, r(6, 3.6), r(6, 4.1));
  if (k1 > 0) { g.save(); g.globalAlpha *= k1; nerve(300, 900, 1.1); xmark(300, 900, 1.1 * k1 + .3 * (1 - k1)); tag(g, 'no nerves', 300, 1030, 40); g.restore(); }
  if (k2 > 0) { g.save(); g.globalAlpha *= k2; muscleIcon(600, 900, 1.0); xmark(600, 900, 1.1); tag(g, 'no muscles', 600, 1030, 40); g.restore(); }
  label(t, r(6, .6), () => tag(g, 'cat voice box, in a lab', 540, 300, 44));
  if (still > 0) { g.save(); g.globalAlpha *= still; cutPlaque(g, 540, 300, 760, 150, ['STILL PURRED'], 84, ramp(t, T(7), r(7, .6))); g.restore(); }
  label(t, r(7, 1.6), () => tag(g, '25–30 × a second', 540, 470, 42));
  g.restore();
}
// ---------- p8 pads: heavy folds swing slowly ----------
function scenePads(t) {
  const a = win(t, T(8) - .3, E(8) + .3, .45); if (a <= 0) return; g.save(); g.globalAlpha = a; cam(1, 540, 800);
  const p1 = ramp(t, r(8, .4), r(8, 1.6));
  if (t < r(8, 2.6)) { g.save(); g.globalAlpha *= 1 - ramp(t, r(8, 2.2), r(8, 2.6)); folds(540, 640, 1.5, sq(t, 1.0), { pads: p1 > .2 });
    label(t, r(8, .9), () => tag(g, 'soft pads', 540, 270, 48)); g.restore(); }
  // two strings: light = fast, padded = slow
  const k = ramp(t, r(8, 2.3), r(8, 2.9)); if (k > 0) {
    g.save(); g.globalAlpha *= k;
    [[300, 9, 'light: fast', 0], [780, 2.2, 'padded: slow', 1]].forEach(([x, f, s, pad]) => {
      dye(g, p => { poly(p, [[x - 110, 380], [x + 110, 380], [x + 110, 400], [x - 110, 400]]); }, ['#4a2c1a'], { edge: false });
      const sw = Math.sin(t * TAU * f * .25) * (pad ? 70 : 18);
      dye(g, p => { const L = [], Q = []; for (let i = 0; i <= 20; i++) { const u = i / 20, xx = x + sw * Math.sin(u * Math.PI), yy = 400 + u * 480; L.push([xx - 7, yy]); Q.push([xx + 7, yy]); } poly(p, L.concat(Q.reverse())); }, FOLD, { r: 200, edge: '#7a2a3a' });
      if (pad) hidePiece(g, p => { ell(p, x + sw, 640, 70, 96, 0); ell(p, x + sw, 640, 22, 30, 0); }, ['#ff8fa0', '#e0506e'], { r: 90, lw: 3, edge: '#8a1a34' });
      tag(g, s, x, 990, 44);
    });
    g.restore();
  }
  g.restore();
}
// ---------- p9 small cat, deep sound ----------
function sceneDeep(t) {
  const a = win(t, T(9) - .3, E(9) + .3, .45); if (a <= 0) return; g.save(); g.globalAlpha = a; cam(1, 540, 800);
  floor(1150); rod(g, 230, 1000); catWithRings(230, 1130, .8, t, 1);
  const pts = []; for (let i = 0; i <= 60; i++) { const u = i / 60, x = lerp(400, 930, u), y = 700 + 150 * Math.sin(u * TAU * 1.5 - t * 4) * ramp(t, T(9), T(9) + .8); pts.push([x, y]); }
  dye(g, p => { pts.forEach(([x, y], i) => i ? p.lineTo(x, y - 7) : p.moveTo(x, y - 7)); pts.slice().reverse().forEach(([x, y]) => p.lineTo(x, y + 7)); p.closePath(); }, DYE.sun, { edge: '#8a3a12', r: 300 });
  label(t, r(9, .9), () => cutPlaque(g, 640, 360, 520, 150, ['DEEP'], 96, 1));
  label(t, r(9, 1.4), () => tag(g, 'small cat', 230, 1070, 40));
  g.restore();
}
// ---------- p10 muscles or pads? a balance ----------
function sceneScale(t) {
  const a = win(t, T(10) - .3, E(10) + .3, .45); if (a <= 0) return; g.save(); g.globalAlpha = a; cam(1, 540, 800);
  const tilt = .16 * Math.sin(t * 2.2) * (1 - ramp(t, r(10, 1.9), r(10, 2.6)));
  dye(g, p => { poly(p, [[530, 520], [550, 520], [560, 1060], [520, 1060]]); p.roundRect(420, 1050, 240, 34, 12); }, ['#4a2c1a', '#2a1408'], { r: 300, edge: false });
  at(g, 540, 520, tilt, 1, () => {
    hidePiece(g, p => { p.roundRect(-380, -14, 760, 28, 12); for (let i = 0; i < 9; i++) circ(p, -320 + i * 80, 0, 5); }, DYE.card, { r: 380, lw: 2, edge: '#7a3a14' });
    rivet(g, 0, 0, 10);
    [-1, 1].forEach(sd => { const px = sd * 330; at(g, px, 0, -tilt, 1, () => {
      dye(g, p => { poly(p, [[-2, 0], [2, 0], [-88, 200], [-92, 200]]); poly(p, [[-2, 0], [2, 0], [92, 200], [88, 200]]); }, ['#4a2c1a'], { edge: false });
      hidePiece(g, p => { p.moveTo(-120, 200); p.quadraticCurveTo(0, 270, 120, 200); p.closePath(); }, DYE.card, { r: 120, lw: 2, edge: '#7a3a14' });
      if (sd < 0) { muscleIcon(0, 130, .8); } else { hidePiece(g, p => { ell(p, -26, 150, 30, 44, -.1); ell(p, 26, 150, 30, 44, .1); }, ['#ff8fa0', '#e0506e'], { r: 50, lw: 2, edge: '#8a1a34' }); }
    }); });
  });
  tag(g, 'muscles', 220, 900, 46); tag(g, 'pads', 860 - 40, 900, 46);
  const b = ramp(t, r(10, 1.9), r(10, 2.5)); if (b > 0) cutPlaque(g, 540, 330, 620, 160, ['BOTH?'], 100, b);
  label(t, r(10, 3.0), () => tag(g, 'debate: still open', 540, 1060 + 0 * b, 46));
  g.restore();
}
// ---------- p11 not only happy ----------
function sceneHappy(t) {
  const a = win(t, T(11) - .3, E(11) + .3, .45); if (a <= 0) return; g.save(); g.globalAlpha = a; cam(1, 540, 800);
  floor(1150); rod(g, 470, 1000); catWithRings(470, 1130, 1.3, t, 1);
  for (let i = 0; i < 3; i++) { const u = fr(t * .5 + i / 3); heart(760 + 40 * Math.sin(i * 2 + t), 640 - u * 320, .9, (1 - u) * ramp(t, T(11), T(11) + .5)); }
  cutPlaque(g, 540, 330, 780, 150, ['NOT ONLY HAPPY'], 76, ramp(t, r(11, .8), r(11, 1.4)));
  g.restore();
}
// ---------- p12 at the vet, or hurt ----------
function sceneVet(t) {
  const a = win(t, T(12) - .3, E(12) + .3, .45); if (a <= 0) return; g.save(); g.globalAlpha = a; cam(1, 540, 800);
  hidePiece(g, p => { p.roundRect(160, 1000, 760, 40, 10); poly(p, [[200, 1040], [230, 1040], [230, 1150], [200, 1150]]); poly(p, [[850, 1040], [880, 1040], [880, 1150], [850, 1150]]); }, ['#d6ece6', '#9fd0c8'], { r: 400, lw: 2, edge: '#2a5a54' });
  floor(1150);
  rod(g, 470, 880); catWithRings(470, 1000, 1.1, t, 1, { eyes: 'open', tilt: -.03 });
  hidePiece(g, p => { poly(p, [[-60, -20], [-20, -20], [-20, -60], [20, -60], [20, -20], [60, -20], [60, 20], [20, 20], [20, 60], [-20, 60], [-20, 20], [-60, 20]].map(([x, y]) => [x + 200, y + 400])); }, DYE.red, { r: 80, lw: 2, edge: '#6a1010' });
  label(t, r(12, .5), () => tag(g, 'at the vet', 640, 330, 46));
  const k = ramp(t, r(12, 1.3), r(12, 1.8)); if (k > 0) { g.save(); g.globalAlpha *= k; dye(g, p => { p.roundRect(525, 900, 60, 26, 8); circ(p, 540, 913, 3); circ(p, 570, 913, 3); }, ['#f4ead2', '#d8c49a'], { r: 40, edge: '#6a4a24' }); tag(g, 'or hurt', 800, 520, 44); g.restore(); }
  label(t, r(12, 2.4), () => tag(g, 'may help them cope', 540, 1080, 44));
  g.restore();
}
// ---------- p13 kittens nursing; the hidden cry ----------
function sceneKittens(t) {
  const a1 = win(t, T(13) - .3, r(13, 2.6), .45), a2 = win(t, r(13, 2.3), E(13) + .3, .45);
  if (a1 > 0) { g.save(); g.globalAlpha = a1; cam(1, 540, 800); floor(1150);
    hidePiece(g, p => { ell(p, 520, 1020, 280, 110, 0); circ(p, 820, 950, 70); poly(p, [[780, 900], [790, 840], [820, 890]]); poly(p, [[840, 890], [870, 840], [880, 910]]); p.moveTo(800, 950); p.quadraticCurveTo(815, 960, 830, 948); p.quadraticCurveTo(815, 955, 800, 950);
      for (let i = 0; i < 5; i++) ell(p, 360 + i * 60, 960, 18, 3.6, 1.3); ring(p, 50, 57, 330, 1040); }, TABBY, { r: 300, lw: 3, edge: '#6a2c0c' });
    [[470, 1125], [600, 1120]].forEach(([x, y], i) => { const b = 3 * Math.sin(t * 6 + i); hidePiece(g, p => { ell(p, x, y + b, 56, 30, 0); circ(p, x - 50, y - 8 + b, 26); poly(p, [[x - 66, y - 26 + b], [x - 62, y - 50 + b], [x - 50, y - 30 + b]]); poly(p, [[x - 44, y - 30 + b], [x - 34, y - 50 + b], [x - 30, y - 24 + b]]); ell(p, x + 10, y + b, 10, 2.4, 0); }, ['#e8c9a0', '#b48a5a'], { r: 70, lw: 2, edge: '#5a3a1a' }); });
    rings(520, 1000, t, ramp(t, T(13), T(13) + .5), { dir: -Math.PI / 2, span: 300, w: 1.0 });
    label(t, r(13, .4), () => tag(g, 'mother cats purr while nursing', 540, 330, 46));
    g.restore(); }
  if (a2 > 0) { g.save(); g.globalAlpha = a2; cam(1, 540, 800);
    // a low purr wave with a high cry riding inside it
    const pts = [], cry = ramp(t, r(13, 3.0), r(13, 3.6)); for (let i = 0; i <= 120; i++) { const u = i / 120, x = lerp(140, 940, u), bump = Math.exp(-((u - .55) ** 2) / .012) * cry; pts.push([x, 560 + 70 * Math.sin(u * TAU * 3 - t * 3) + 40 * bump * Math.sin(u * TAU * 40)]); }
    dye(g, p => { pts.forEach(([x, y], i) => i ? p.lineTo(x, y - 6) : p.moveTo(x, y - 6)); pts.slice().reverse().forEach(([x, y]) => p.lineTo(x, y + 6)); p.closePath(); }, DYE.sun, { edge: '#8a3a12', r: 400 });
    if (cry > 0) { g.save(); g.globalAlpha *= cry; tag(g, 'hidden cry', 580, 400, 44); g.restore(); }
    // food bowl
    hidePiece(g, p => { p.moveTo(380, 860); p.lineTo(700, 860); p.quadraticCurveTo(680, 990, 540, 990); p.quadraticCurveTo(400, 990, 380, 860); p.closePath(); for (let i = 0; i < 5; i++) circ(p, 440 + i * 50, 920, 8); }, DYE.red, { r: 200, lw: 3, edge: '#6a1010' });
    for (let i = 0; i < 6; i++) dye(g, p => ell(p, 430 + i * 46, 852 - (i % 2) * 10, 22, 12, i), ['#a86a3a', '#7a4a24'], { r: 30, edge: '#4a2a10' });
    label(t, r(13, 3.6), () => tag(g, 'feed me!', 540, 1070, 48));
    g.restore(); }
}
// ---------- p14 echo: a purr is a vibrating voice box ----------
function sceneEcho(t) {
  const a = win(t, T(14) - .3, E(14) + .3, .45); if (a <= 0) return; g.save(); g.globalAlpha = a; cam(1, 540, 860);
  floor(1180); rod(g, 470, 1000); catWithRings(470, 1150, 1.45, t, 1);
  const k = ramp(t, r(14, .6), r(14, 1.4)); if (k > 0) { g.save(); g.globalAlpha *= k; const tx = 470 + THROAT[0] * 1.45, ty = 1150 + THROAT[1] * 1.45; R.glow(tx, ty + 40, 220, GOLD, .5 * k * a); voicebox(tx - 20, ty + 30, .62, t, { open: sq(t, 1.6), pads: true }); tag(g, 'voice box', 840, 760, 44); g.restore(); }
  cutPlaque(g, 540, 400, 860, 230, ['STILL WORKING', 'OUT EXACTLY HOW'], 70, ramp(t, r(14, 2.4), r(14, 3.0)));
  g.restore();
}
// ---------- p15 question; p16 end card (eases back toward frame 0) ----------
function sceneEnd(t) {
  const a = win(t, T(15) - .3, TL.total + 1, .45); if (a <= 0) return; g.save(); g.globalAlpha = a; cam(1, 540, 860);
  const cs = lerp(1.45, 1.2, ramp(t, T(16) - .3, T(16) + .3)) ; floor(1180); rod(g, 470, 1000); catWithRings(470, 1150, cs, t, 1);
  const q = 1 - ramp(t, T(16) - .3, T(16) + .1);
  if (q > 0) { g.save(); g.globalAlpha *= q; cutPlaque(g, 540, 400, 860, 230, ['LOUD PURRER?'], 88, ramp(t, T(15) + .1, T(15) + .6)); label(t, r(15, 1.3), () => { tag(g, 'yes', 690, 700, 56); tag(g, 'no', 850, 760, 56); }); g.restore(); }
  const e = ramp(t, T(16), T(16) + .5); if (e > 0) {
    g.save(); g.globalAlpha *= e; cutPlaque(g, 540, 380, 900, 230, ['Follow for more of', 'how it really works.'], 66, 1, { ls: 2 }); g.restore();
    label(t, T(16) + .5, () => plaque(g, 540, 600, 800, 150, ["A new 'wait, really?' every day.", '@howitreallyworkstudio'], 44));
  }
  g.restore();
}
function scene(t) { R.dim = 0; R.hot = [540, 760]; sceneHook(t); sceneLarynx(t); sceneFolds(t); sceneChop(t); sceneTwist(t); sceneLab(t); scenePads(t); sceneDeep(t); sceneScale(t); sceneHappy(t); sceneVet(t); sceneKittens(t); sceneEcho(t); sceneEnd(t); }

// storyteller's caption placard, inside the caption band (y 1150-1420) and clear of the right UI column
function placard(m, cap, a = 1, size = 52) {
  if (!cap || a <= 0) return;
  const words = []; cap.split('**').forEach((s, i) => s.split(/(\s+)/).forEach(w => { if (w) words.push([w, i % 2 === 1]); }));
  m.save(); m.setTransform(1, 0, 0, 1, 0, 0); m.globalAlpha = a; m.font = `italic 700 ${size}px ${FONT}`; m.textBaseline = 'middle'; if ('letterSpacing' in m) m.letterSpacing = '0px';
  const maxW = 680, lines = [[]]; let lw = 0;
  words.forEach(([w, b]) => { const ww = m.measureText(w).width; if (lw + ww > maxW && !/^\s+$/.test(w) && lines[lines.length - 1].length) { lines.push([]); lw = 0; } if (!(lines[lines.length - 1].length === 0 && /^\s+$/.test(w))) { lines[lines.length - 1].push([w, b, ww]); lw += ww; } });
  lines.forEach(l => { while (l.length && /^\s+$/.test(l[l.length - 1][0])) l.pop(); });
  const lh = size * 1.18, ph = lines.length * lh + 48, cy = 1290, y0 = cy - ph / 2;
  m.fillStyle = 'rgba(20,10,6,.93)'; m.beginPath(); m.roundRect(150, y0, 780, ph, 22); m.fill();
  m.strokeStyle = '#d9a441'; m.lineWidth = 3; m.beginPath(); m.roundRect(150, y0, 780, ph, 22); m.stroke();
  m.strokeStyle = 'rgba(217,164,65,.55)'; m.lineWidth = 1.5; m.beginPath(); m.roundRect(162, y0 + 12, 756, ph - 24, 14); m.stroke();
  lines.forEach((ln, i) => { const tw = ln.reduce((s, w) => s + w[2], 0); let x = 540 - tw / 2; const y = y0 + 24 + lh * (i + .5);
    ln.forEach(([w, b, ww]) => { m.fillStyle = b ? '#ffc65a' : '#f6e6c6'; m.fillText(w, x, y); x += ww; }); });
  m.restore();
}
function subtitle(t) {
  let cur = -1; for (let i = 0; i < PH.length; i++) if (t >= PH[i].start - .05) cur = i;
  if (cur < 0) cur = 0; if (cur === PH.length - 1) return;
  const p = PH[cur], hold = Math.max(1.8, (p.end - p.start) + .5), a = (cur === 0 ? 1 : ramp(t, p.start - .05, p.start + .2)) * (1 - ramp(t, p.start + hold - .15, p.start + hold));
  placard(R.main, p.cap, a);
}
window.DUR = TL.total;
window.seek = t => { R.begin(t); scene(t); R.finish(); subtitle(t);
  const f = Math.min(1, (TL.total - t) / .35); if (f < 1) { const m = R.main; m.save(); m.setTransform(1, 0, 0, 1, 0, 0); m.globalAlpha = (1 - f) * .35; m.fillStyle = '#1a0d06'; m.fillRect(0, 0, W, H); m.restore(); } };
window.render = window.seek;
window.thumb = () => { R.begin(2); R.dim = 0; R.hot = [540, 760]; cam(1, 540, 860); floor(1180); rod(g, 470, 1000); catWithRings(470, 1150, 1.45, 2.3, 1);
  cutPlaque(g, 540, 430, 900, 260, ['HOW DO', 'CATS PURR?'], 104, 1); R.finish(); };
window.seek(0); window.ready = true; window.READY = true;
