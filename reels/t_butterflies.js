// t_butterflies.js: "Why do you get butterflies in your stomach?" in template #21 Storybook paint (demo t21), same kit as catseyes.
// The demo's grammar: soft coloured-pencil paintings (flat muted fill + pencil hatching + wobbly ink outline) on paper grain, a
// round-headed kid, night skies with stars, warm glow halos with soft rays, white "constellation" line diagrams, and the sketchbook
// page on the wooden desk with the yellow pencil at the start of the question and at the end. Here the kid waits backstage before a
// school play; adrenaline is a warm glow, blood flow is red pencil arrows, and the gut's nerves and the vagus nerve are constellation
// lines over a night-sky body diagram.
// Batch N layout: paintings and diagrams in y 300-1150, the kit's torn-paper subtitle centred at y 1300, nothing written in the top
// 250 px, the bottom 480 px, or the right column (x>900) below y 840. Pure function of t.
import { createSB, W, H, TAU, clamp, lerp, seg, ss, eo, backOut, hash, mk, INK, PAL, finish, blob, circPts, paint, P2, skyBands, hill, stars, glow, rays,
  constLine, hand, arrowP, kid, PAGE, book, pencil, subtitle } from './styles/storybook/storybook.js';
await document.fonts.load('700 60px Caveat');
const g = createSB(document.getElementById('c'));
const TL = window.TL, PH = TL.p, T = i => PH[i].start, r = (i, d) => T(i) + d, TOT = TL.total;
const win = (t, a, b, f = .45) => ss(seg(t, a - f, a)) * (1 - ss(seg(t, b - f, b)));
const RED = '#c4543f', GOLD = '255,214,140', CREAM = '#f6efe0';

// ---------- baked backdrops ----------
function bake(fn) { const c = mk(W, H), x = c.getContext('2d'); fn(x); return c; }
const NIGHT = ['#1b2046', '#20275a', '#283068', '#303a76', '#394585'];
const STAGE = bake(x => { skyBands(x, ['#2a1c2e', '#33213a', '#3b2642', '#442b49'], 0, 1180, 8, 4);
  // floorboards
  paint(x, P2(p => p.rect(-20, 1010, W + 40, 300)), '#8a5a3c', { hatch: .2 }); x.strokeStyle = 'rgba(40,20,10,.5)'; x.lineWidth = 2; for (let i = 0; i < 6; i++) { x.beginPath(); x.moveTo(0, 1040 + i * 26); x.lineTo(W, 1040 + i * 26); x.stroke(); } });
const SKY = bake(x => { skyBands(x, NIGHT, 0, 1250, 10, 7); hill(x, 1120, 30, '#26405a', { freq: 1.2, seed: 3, tufts: 10, tuftCol: '#1a3048' }); });
const HILLS = bake(x => { skyBands(x, NIGHT, 0, 1100, 12, 2); hill(x, 1000, 50, '#3d5a66', { freq: 1.4, ph: .4, seed: 2, tufts: 0 }); hill(x, 1090, 30, '#30505a', { freq: 2, ph: 1, seed: 5, tufts: 14, tuftCol: '#203a3a' }); });

// ---------- props ----------
function curtain(side, open, t) { const x0 = side < 0 ? -40 : W + 40, w = lerp(470, 200, ss(open)); const xe = x0 - side * w;
  const p = P2(p => { p.moveTo(x0, 280); p.lineTo(xe + side * 0, 280); for (let y = 280; y <= 1060; y += 40) p.lineTo(xe + side * (18 * Math.sin(y * .02 + t * .8)) + side * (y - 280) * .06, y); p.lineTo(x0, 1060); p.closePath(); });
  paint(g, p, '#b4483e', { hatch: .22 }); g.save(); g.strokeStyle = 'rgba(60,20,20,.45)'; g.lineWidth = 3; for (let i = 1; i < 5; i++) { const fx = lerp(x0, xe, i / 5); g.beginPath(); g.moveTo(fx, 290); g.quadraticCurveTo(fx + side * 10, 700, fx + side * 26, 1050); g.stroke(); } g.restore(); }
function butterfly(x, y, s, t, col = '#f2c35b', a = 1, seed = 0) { if (a <= 0) return; const f = Math.abs(Math.sin(t * 9 + seed * 3)); g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(s, s);
  glow(g, 0, 0, 60, GOLD, .35); for (const sd of [-1, 1]) { g.save(); g.scale(sd * (.3 + .7 * f), 1); paint(g, P2(p => blob(p, [[0, -4], [26, -30], [44, -18], [36, 6], [8, 6]], 2, seed + 1)), col, { hatch: .15, lw: 2 });
    paint(g, P2(p => blob(p, [[0, 4], [30, 10], [30, 32], [8, 22]], 2, seed + 2)), col, { hatch: .15, lw: 2 }); g.restore(); }
  g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(0, -12); g.lineTo(0, 16); g.stroke(); g.restore(); }
function flock(t, cx, cy, n, rad, k = 1, s = 1) { for (let i = 0; i < n; i++) { const a = t * (.6 + hash(i) * .5) + i * 2.1; butterfly(cx + Math.cos(a) * rad * (.6 + .4 * hash(i * 3)), cy + Math.sin(a * 1.3) * rad * .5, s * (.6 + .4 * hash(i * 5)), t, ['#f2c35b', '#e9a7a0', '#9fc6e6'][i % 3], k * clamp((k * n - i)), i); } }
// stomach + intestines painting (col dims as blood leaves)
function gut(x, y, s, dim = 0, a = 1) { g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(s, s); const c1 = dim ? `rgb(${lerp(233, 196, dim)},${lerp(160, 170, dim)},${lerp(160, 175, dim)})` : '#e9a0a0';
  paint(g, P2(p => blob(p, [[-70, -60], [-10, -80], [40, -60], [60, -20], [30, 20], [-30, 10], [-60, -10]], 3, 11)), c1, { hatch: .2 });
  paint(g, P2(p => { p.moveTo(-80, 40); p.bezierCurveTo(-90, 120, 90, 130, 80, 40); p.bezierCurveTo(70, 160, -70, 160, -80, 40); p.closePath(); }), dim ? '#d8b7a8' : '#e8b089', { hatch: .2 });
  g.strokeStyle = 'rgba(80,40,40,.5)'; g.lineWidth = 3; g.beginPath(); for (let i = 0; i < 4; i++) { g.moveTo(-60 + i * 10, 60 + i * 14); g.bezierCurveTo(-20, 50 + i * 14, 20, 80 + i * 14, 60 - i * 10, 60 + i * 14); } g.stroke(); g.restore(); }
// a kid-shaped constellation (body diagram); cx,cy = chest, s = scale
function bodyPts(cx, cy, s) { const P = (x, y) => [cx + x * s, cy + y * s]; return { head: circPts(cx, cy - 150 * s, 58 * s, 60 * s, 14).concat([P(58 * Math.cos(0), -150)]),
  torso: [P(-60, -80), P(60, -80), P(80, 150), P(-80, 150), P(-60, -80)], armL: [P(-60, -70), P(-130, 40), P(-150, 140)], armR: [P(60, -70), P(130, 40), P(150, 140)], legL: [P(-40, 150), P(-50, 300), P(-60, 400)], legR: [P(40, 150), P(50, 300), P(60, 400)] }; }
function bodyDiagram(t, cx, cy, s, k = 1, o = {}) { const B = bodyPts(cx, cy, s); const col = o.col || 'rgba(255,250,235,.85)';
  ['head', 'torso', 'armL', 'armR', 'legL', 'legR'].forEach((n, i) => constLine(g, B[n], seg(k, i * .1, .5 + i * .1), { col, lw: 3, dot: 5 })); return B; }
function brainP(x, y, s, a = 1) { g.save(); g.globalAlpha *= a; paint(g, P2(p => blob(p, circPts(x, y, 70 * s, 52 * s, 16), 6 * s, 21)), '#e9a7c0', { hatch: .2 }); g.strokeStyle = 'rgba(80,40,60,.5)'; g.lineWidth = 2.5;
  for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(x - 30 * s + i * 20 * s, y + (i % 2 ? 6 : -8) * s, 16 * s, .3, 2.6); g.stroke(); } g.restore(); }
function bloodArrows(t, pts, k, col = RED) { pts.forEach(([x0, y0, x1, y1], i) => { const kk = seg(k, i * .12, .6 + i * .12); arrowP(g, x0, y0, x1, y1, kk, col, 6);
  const u = (t * .8 + i * .3) % 1; if (kk >= 1) { g.save(); g.fillStyle = col; g.beginPath(); g.arc(lerp(x0, x1, u), lerp(y0, y1, u), 7, 0, TAU); g.fill(); g.restore(); } }); }
const label = (s, x, y, k, o = {}) => hand(g, s, x, y, k, { size: o.size || 58, col: o.col || CREAM, ...o });

// ---------- scenes: [start, end, fn] ----------
const S = [];
// 0 hook: backstage, the kid in the wings with a glowing flutter at the tummy; red arrows: blood to the muscles
S.push([0, T(1), t => { g.drawImage(STAGE, 0, 0); stars(g, 20, t, { y1: 280 }); glow(g, 760, 600, 420, '255,230,170', .35); rays(g, 760, 520, 600, t, '255,236,190', .25);
  curtain(-1, 0, t); kid(g, 540, 1130, 3.3, { body: '#7fa6d6', arm: .5, arm2: -.5, look: Math.sin(t * 1.3) * 3, blink: (t % 3.2) < .12 ? 1 : 0, mouth: 'o' });
  glow(g, 540, 870, 170, GOLD, .5 + .2 * Math.sin(t * 5)); flock(t, 540, 860, 5, 150, 1, 1.25);
  const k = seg(t, 1.6, 2.4); bloodArrows(t, [[540, 860, 330, 930], [540, 860, 750, 930], [515, 900, 490, 1080], [565, 900, 590, 1080]], k);
  label('to the muscles', 540, 380, seg(t, 2.2, 2.8), { size: 64 }); }]);
// 1 the question on the sketchbook page
S.push([T(1), T(2), t => { book(g); pencil(g, 700, 1180, -.75, 1.2); const k = seg(t, T(1), r(1, 1.2));
  g.save(); g.beginPath(); g.rect(PAGE.x, PAGE.y, PAGE.w, PAGE.h); g.clip(); hand(g, 'why the butterflies?', 540, 420, k, { size: 92, col: INK }); kid(g, 420, 1100, 2.3, { body: '#7fa6d6', mouth: 'o', blink: (t % 3) < .1 ? 1 : 0 });
  flock(t, 430, 900, 4, 90, seg(t, r(1, .6), r(1, 1.4)), .8); g.restore(); }]);
// 2 the big moment: curtain, audience, spotlight; brain decides "big deal"
S.push([T(2), T(3), t => { g.drawImage(STAGE, 0, 0); const op = seg(t, T(2), r(2, 2.0)); glow(g, 540, 700, 500, '255,230,170', .3 * op); rays(g, 540, 360, 800, t, '255,236,190', .2 * op);
  curtain(-1, op, t); curtain(1, op, t);
  for (let i = 0; i < 9; i++) paint(g, P2(p => blob(p, circPts(80 + i * 115, 1110 + (i % 2) * 18, 46, 50, 12), 3, i)), '#1d1520', { hatch: .05, lw: 1.5 });
  kid(g, 300 + 60 * ss(seg(t, r(2, .5), r(2, 2.5))), 990, 1.7, { body: '#7fa6d6', mouth: 'o', look: 4 });
  const bk = seg(t, r(2, 2.6), r(2, 3.2)); if (bk > 0) { g.save(); g.globalAlpha = bk; paint(g, P2(p => blob(p, circPts(620, 560, 230, 120, 18), 6, 31)), CREAM, { hatch: .1 }); g.restore(); brainP(480, 560, .8, bk); hand(g, 'big deal!', 680, 560, bk, { size: 66, col: RED }); } }]);
// 3 fight-or-flight: adrenaline floods the body (warm glow spreading through the body diagram)
S.push([T(3), T(4), t => { g.drawImage(SKY, 0, 0); stars(g, 60, t, { y1: 1000 }); const B = bodyDiagram(t, 540, 620, 1.35, seg(t, T(3) - .2, r(3, 1.0)));
  const ak = seg(t, r(3, 1.6), r(3, 3.2)); glow(g, 540, 700, 140 + 300 * ak, GOLD, .55 * ak); for (let i = 0; i < 26; i++) { const a = hash(i) * TAU, d = 60 + 280 * ak * hash(i * 3); g.save(); g.globalAlpha = ak * .9; g.fillStyle = '#f2c35b'; g.beginPath(); g.arc(540 + Math.cos(a) * d * .6, 700 + Math.sin(a) * d, 6, 0, TAU); g.fill(); g.restore(); }
  label('fight-or-flight', 540, 330, seg(t, T(3) + .2, r(3, .8)), { size: 66 }); label('adrenaline', 760, 820, seg(t, r(3, 1.8), r(3, 2.4)), { col: '#f2c35b' }); }]);
// 4 heart speeds up; blood sent to the muscles
S.push([T(4), T(5), t => { g.drawImage(SKY, 0, 0); stars(g, 60, t, { y1: 1000 }); bodyDiagram(t, 540, 620, 1.35, 1); const beat = 1 + .25 * Math.max(0, Math.sin(t * 9));
  paint(g, P2(p => { const x = 560, y = 560, s = 34 * beat; p.moveTo(x, y + s * .9); p.bezierCurveTo(x - s * 1.6, y - s * .2, x - s * .6, y - s * 1.3, x, y - s * .4); p.bezierCurveTo(x + s * .6, y - s * 1.3, x + s * 1.6, y - s * .2, x, y + s * .9); }), RED, { hatch: .2 });
  glow(g, 560, 560, 80 * beat, '255,120,100', .5);
  bloodArrows(t, [[560, 600, 380, 730], [560, 600, 700, 730], [540, 700, 480, 1000], [560, 700, 610, 1000]], seg(t, r(4, 1.2), r(4, 2.8)));
  label('heart speeds up', 540, 330, seg(t, T(4) + .2, r(4, .8)), { size: 62 }); label('muscles', 830, 760, seg(t, r(4, 2.2), r(4, 2.7)), { col: '#f0a090' }); }]);
// 5 adrenaline shunts blood away from the gut; digestion slows
S.push([T(5), T(6), t => { g.drawImage(SKY, 0, 0); stars(g, 60, t, { y1: 1000 }); bodyDiagram(t, 540, 620, 1.35, 1); const dim = ss(seg(t, r(5, .6), r(5, 2.2))); gut(540, 760, 1.1, dim);
  bloodArrows(t, [[520, 760, 300, 640], [560, 760, 780, 640], [540, 820, 540, 1020]], seg(t, r(5, .4), r(5, 1.6)));
  label('less blood here', 540, 330, seg(t, r(5, 1.2), r(5, 1.8)), { size: 62, col: '#f0a090' });
  const sk = seg(t, r(5, 2.6), r(5, 3.0)); if (sk > 0) { const sx = 470 + 40 * seg(t, r(5, 2.6), T(6)); g.save(); g.globalAlpha = sk; paint(g, P2(p => blob(p, circPts(sx, 905, 22, 18, 12), 2, 41)), '#c9a46a', { hatch: .2 }); paint(g, P2(p => p.ellipse(sx - 22, 920, 30, 9, 0, 0, TAU)), '#9aa58a', { hatch: .1 }); g.restore(); }
  label('digestion slows', 540, 1110, sk, { size: 54 }); }]);
// 6 the stomach's own nerves notice the shortage: that's the flutter
S.push([T(6), T(7), t => { g.drawImage(SKY, 0, 0); stars(g, 50, t, { y1: 1000 }); const z = 1.9 + .2 * seg(t, T(6), T(7)); gut(540, 760, z, .8);
  const nk = seg(t, r(6, .4), r(6, 1.6)); for (let i = 0; i < 7; i++) { const a = i / 7 * TAU; constLine(g, [[540 + Math.cos(a) * 60, 700 + Math.sin(a) * 40], [540 + Math.cos(a) * 170, 700 + Math.sin(a) * 120]], nk, { lw: 2.5, dot: 4 }); }
  for (let i = 0; i < 7; i++) { const a = i / 7 * TAU, tw = .5 + .5 * Math.sin(t * 8 + i); glow(g, 540 + Math.cos(a) * 170, 700 + Math.sin(a) * 120, 30, '255,250,230', nk * tw * .7); }
  label('nerves notice', 540, 330, seg(t, r(6, .8), r(6, 1.4)), { size: 64 }); const fk = seg(t, r(6, 2.6), r(6, 3.4)); flock(t, 540, 720, 6, 220, fk, 1.1); label('the flutter', 540, 1110, fk, { size: 64, col: '#f2c35b' }); }]);
// 7-8 the gut's own nervous system: the "second brain"
S.push([T(7), T(9), t => { g.drawImage(SKY, 0, 0); stars(g, 60, t, { y1: 1000 }); gut(540, 760, 2.0, .3); const k = seg(t, r(7, .6), r(8, 1.6));
  for (let i = 0; i < 30; i++) { const a = hash(i) * TAU, rr = 40 + 170 * hash(i * 3), b = hash(i * 7) * TAU, x = 540 + Math.cos(a) * rr, y = 760 + Math.sin(a) * rr * .8; constLine(g, [[x, y], [x + Math.cos(b) * 60, y + Math.sin(b) * 50]], seg(k, i / 40, i / 40 + .3), { lw: 2.2, dot: 4 }); }
  label('lots of nerves', 540, 330, seg(t, T(7) + .2, r(7, .8)) * (1 - seg(t, T(8) - .1, T(8) + .2)), { size: 62 });
  label('the "second brain"', 540, 330, seg(t, r(8, 1.6), r(8, 2.2)), { size: 70, col: '#f2c35b' }); label('enteric nervous system', 540, 1110, seg(t, r(8, .4), r(8, 1.0)), { size: 46 }); }]);
// 9 the vagus nerve links brain and gut
S.push([T(9), T(10), t => { g.drawImage(SKY, 0, 0); stars(g, 60, t, { y1: 1000 }); bodyDiagram(t, 540, 640, 1.3, 1, { col: 'rgba(255,250,235,.45)' }); brainP(540, 440, .9); gut(540, 800, .9, .2);
  const vk = seg(t, r(9, .4), r(9, 2.0)); const V = [[540, 490], [530, 560], [552, 620], [528, 690], [545, 740]]; constLine(g, V, vk, { col: 'rgba(242,195,91,.95)', lw: 5, dot: 7 });
  if (vk >= 1) for (let i = 0; i < 3; i++) { const u = (t * .6 + i / 3) % 1, d = i % 2 ? u : 1 - u, y = lerp(490, 740, d); glow(g, 540, y, 40, GOLD, .9); }
  label('vagus nerve', 780, 600, seg(t, r(9, 1.2), r(9, 1.8)), { size: 58, col: '#f2c35b' }); label('brain ⇄ gut', 540, 330, seg(t, r(9, 2.4), r(9, 3.0)), { size: 64 }); }]);
// 10 immense crosstalk: messages both ways
S.push([T(10), T(11), t => { g.drawImage(SKY, 0, 0); stars(g, 70, t, { y1: 1000 }); brainP(540, 470, 1.4); gut(540, 900, 1.1, .1);
  constLine(g, [[540, 540], [540, 780]], 1, { col: 'rgba(242,195,91,.6)', lw: 4, dot: 0 });
  const down = seg(t, r(10, 2.2), r(10, 4.0)), up = seg(t, r(10, 4.6), r(10, 6.4)); for (let i = 0; i < 3; i++) { const u = (t * .9 + i / 3) % 1; if (down > 0) glow(g, 510, lerp(540, 780, u), 34, '255,140,110', .9 * down); if (up > 0) glow(g, 570, lerp(780, 540, u), 34, '160,220,255', .9 * up); }
  arrowP(g, 470, 560, 470, 760, down, '#f0a090', 5); arrowP(g, 610, 760, 610, 560, up, '#9fc6e6', 5);
  label('"immense crosstalk"', 540, 330, seg(t, r(10, .3), r(10, 1.1)), { size: 66, col: '#f2c35b' }); label('Braden Kuo, Harvard', 540, 1100, seg(t, r(10, .8), r(10, 1.3)), { size: 40 });
  label('stress', 300, 660, down, { size: 48, col: '#f0a090' }); label('signals back', 800, 660, up, { size: 48, col: '#9fc6e6' }); }]);
// 11 stress shows up in the gut: three little paintings
S.push([T(11), T(12), t => { g.drawImage(HILLS, 0, 0); stars(g, 40, t, { y1: 700 }); [['nausea', 0], ['cramps', 1], ['butterflies', 2]].forEach(([nm, i]) => { const k = seg(t, r(11, .3 + i * .9), r(11, .8 + i * .9)); if (k <= 0) return; const x = 200 + i * 340, y = 700;
    g.save(); g.globalAlpha = k; g.translate(x, y + (1 - backOut(k)) * 40); paint(g, P2(p => p.rect(-140, -230, 280, 360)), PAL.paper, { hatch: 0, lw: 3 }); g.restore();
    g.save(); g.globalAlpha = k; g.translate(0, (1 - backOut(k)) * 40); kid(g, x, y + 100, 1.0, { body: '#7fa6d6', mouth: i === 2 ? 'smile' : 'o', arm: 1.2, arm2: -1.2 });
    if (i === 0) for (let j = 0; j < 3; j++) { g.strokeStyle = '#7fae5a'; g.lineWidth = 4; g.beginPath(); g.arc(x - 60 + j * 60, y - 160, 12, 0, Math.PI * 1.6); g.stroke(); }
    if (i === 1) { g.strokeStyle = RED; g.lineWidth = 4; for (let j = 0; j < 3; j++) { g.beginPath(); g.moveTo(x - 40 + j * 40, y - 30); g.lineTo(x - 30 + j * 40, y - 10); g.lineTo(x - 40 + j * 40, y + 10); g.stroke(); } }
    if (i === 2) flock(t, x, y - 40, 3, 60, 1, .55); g.restore(); hand(g, nm, x, y + 170, k, { size: 46, col: CREAM }); }); }]);
// 12 nothing's fluttering: the body getting ready for action (the kid in the spotlight)
S.push([T(12), T(13), t => { g.drawImage(STAGE, 0, 0); glow(g, 540, 620, 520, '255,230,170', .45); rays(g, 540, 330, 900, t, '255,236,190', .35); curtain(-1, 1, t); curtain(1, 1, t);
  const jump = Math.max(0, Math.sin((t - T(12)) * 4)) * 30 * seg(t, r(12, 1.6), r(12, 2.0)); kid(g, 540, 1130 - jump, 3.1, { body: '#7fa6d6', arm: 2.6, arm2: -2.6, mouth: 'smile' });
  label('ready for action!', 540, 340, seg(t, r(12, 1.8), r(12, 2.4)), { size: 70, col: '#f2c35b' }); }]);
// 13 rest-and-digest: the moment passes, the flutter settles (butterflies drift off into the stars)
S.push([T(13), T(14), t => { g.drawImage(HILLS, 0, 0); stars(g, 70, t, { y1: 900 }); glow(g, 830, 380, 120, '255,245,210', .4);
  paint(g, P2(p => blob(p, circPts(830, 380, 60, 60, 16), 1.5, 4)), '#efe6c4', { hatch: .2, lw: 2 });
  kid(g, 420, 1120, 2.4, { body: '#7fa6d6', arm: .2, arm2: -.2, mouth: 'smile', blink: (t % 2.6) < .3 ? 1 : 0 }); glow(g, 420, 930, 110, '255,200,160', .4 * seg(t, r(13, 2.0), r(13, 3.0)));
  const away = seg(t, r(13, 1.6), T(14)); for (let i = 0; i < 5; i++) butterfly(lerp(420, 300 + i * 140, away), lerp(900, 360 + hash(i) * 200, away), .8, t, ['#f2c35b', '#e9a7a0', '#9fc6e6'][i % 3], 1 - away * .6, i);
  label('rest-and-digest', 540, 330, seg(t, r(13, .8), r(13, 1.4)), { size: 66 }); }]);
// 14 yes or no
S.push([T(14), T(15), t => { g.drawImage(STAGE, 0, 0); glow(g, 540, 700, 420, '255,230,170', .3); curtain(-1, .3, t); curtain(1, .3, t); kid(g, 540, 1130, 3.1, { body: '#7fa6d6', mouth: 'o', look: Math.sin(t * 2) * 4 }); flock(t, 540, 880, 4, 140, 1, 1.15);
  hand(g, 'yes', 300, 420, seg(t, r(14, 2.2), r(14, 2.6)), { size: 90, col: '#f2c35b' }); hand(g, 'no', 780, 420, seg(t, r(14, 2.5), r(14, 2.9)), { size: 90, col: '#9fc6e6' }); }]);
// 15 end card on the sketchbook page
S.push([T(15) - .05, TOT + 1, t => { book(g); pencil(g, 720, 1160, -.75, 1.2); g.save(); g.beginPath(); g.rect(PAGE.x, PAGE.y, PAGE.w, PAGE.h); g.clip();
  const k = seg(t, T(15) - .05, r(15, .5)); hand(g, 'Follow for more of', 540, 430, k, { size: 72, col: INK }); hand(g, 'how it really works.', 540, 520, seg(t, r(15, .2), r(15, .8)), { size: 72, col: RED });
  hand(g, "A new 'wait, really?' every day.", 540, 610, seg(t, r(15, .5), r(15, 1.1)), { size: 52, col: INK }); hand(g, '@howitreallyworkstudio', 540, 690, seg(t, r(15, .8), r(15, 1.3)), { size: 46, col: RED });
  kid(g, 420, 1060, 1.6, { body: '#7fa6d6', arm: 2.4, mouth: 'smile' }); flock(t, 560, 880, 3, 80, seg(t, r(15, .4), r(15, 1.0)), .7); g.restore(); }]);

function scene(t) { g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = PAL.night0; g.fillRect(0, 0, W, H);
  for (const [a, b, fn] of S) { const k = a <= 0 ? 1 - ss(seg(t, b - .45, b)) : win(t, a + .45, b, .45); if (k <= 0) continue; g.save(); g.globalAlpha = k; fn(t); g.restore(); }
  finish(g, { t }); }
function sub(t) { let cur = -1; for (let i = 0; i < PH.length; i++) if (t >= PH[i].start - .05) cur = i; if (cur < 0 || cur === PH.length - 1) return;
  const p = PH[cur], nx = PH[cur + 1].start, a = (cur === 0 ? 1 : seg(t, p.start - .05, p.start + .15)) * (1 - seg(t, nx - .25, nx - .05)); subtitle(g, p.cap, a, 1300); }
window.DUR = TOT;
window.seek = t => { scene(t); sub(t); const f = Math.min(1, (TOT - t) / .35); if (f < 1) { g.save(); g.globalAlpha = (1 - f) * .4; g.fillStyle = '#1b1020'; g.fillRect(0, 0, W, H); g.restore(); } };
window.render = window.seek;
window.thumb = () => { const t = 1.2; g.drawImage(STAGE, 0, 0); glow(g, 760, 600, 420, '255,230,170', .35); curtain(-1, 0, t); kid(g, 540, 1120, 2.6, { body: '#7fa6d6', mouth: 'o' }); glow(g, 540, 930, 140, GOLD, .6); flock(t, 540, 920, 5, 120, 1, 1);
  g.save(); g.fillStyle = 'rgba(246,239,224,.92)'; g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 20; g.beginPath(); g.roundRect(110, 300, 860, 300, 20); g.fill(); g.restore();
  hand(g, 'WHY THE', 540, 380, 1, { size: 110, col: INK }); hand(g, 'BUTTERFLIES?', 540, 510, 1, { size: 120, col: RED }); finish(g, { t }); };
window.seek(0); window.ready = true; window.READY = true;
