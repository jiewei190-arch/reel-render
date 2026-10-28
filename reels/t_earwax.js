// t_earwax.js: "What is earwax actually for?" in template #21 Storybook paint (demo t21), via styles/storybook (same module as microwavelight).
// A bedtime anatomy storybook: painted night frames with hatching, a kid under drawn constellations, the wax as a glowing golden hero, white constellation-line
// diagrams (the conveyor belt, the DNA helix, the "?"), glow halos for the important thing, handwritten labels, and the module's torn paper subtitle slip.
// Batch N layout: subtitle slip around y 1320 kept left of x 900; drawings inside y 250-1150; nothing typed in the top 250 px or the bottom 480 px.
import { createSB, W, H, TAU, clamp, lerp, seg, ss, eo, backOut, hash, mk, INK, PAL, finish, blob, circPts, paint, P2, skyBands, hill, stars, glow, rays,
  moonP, constLine, hand, arrowP, kid, parse } from './styles/storybook/storybook.js';
await document.fonts.load('700 60px Caveat');
const g = createSB(document.getElementById('c'));
const TL = window.TL, PH = TL.p, T = i => PH[i].start, r = (i, d) => T(i) + d;
const win = (t, a, b, f = .5) => ss(seg(t, a - f, a)) * (1 - ss(seg(t, b - f, b)));
const CREAM = '#f6efe0', GOLD = '#ffd86a', WAXC = '#f2b441', WAXD = '#c9822a', SKIN = '#f3c2a0', SKIND = '#d99478', PINK = '#e99aa6', WARM = '255,206,120', DRYC = '#e9d6a6';

// ---------------- baked backdrops ----------------
function bake(fn) { const c = mk(W, H), x = c.getContext('2d'); fn(x); return c; }
const NIGHT = bake(x => { skyBands(x, ['#1f2350', '#272b5e', '#30346c', '#3a3e7a', '#454a86'], 0, 1200, 12, 4); hill(x, 1120, 50, '#2f4e5a', { freq: 1.1, seed: 2, tufts: 14, tuftCol: '#203a44' }); hill(x, 1240, 34, '#25404a', { freq: .8, seed: 5, tufts: 10, tuftCol: '#1a3038' }); });
const CANAL = bake(x => { skyBands(x, ['#3a1f3a', '#4a2747', '#5a3054', '#6a3a60', '#7a456c'], 0, 1300, 10, 3);
  // the canal as a painted tunnel: upper and lower walls of skin, the eardrum at the far left, the opening glowing on the right
  paint(x, P2(p => blob(p, [[-40, 300], [1120, 300], [1120, 560], [900, 600], [600, 620], [300, 610], [-40, 590]], 3, 11)), SKIN, { hatch: .22, lw: 3 });
  paint(x, P2(p => blob(p, [[-40, 900], [300, 880], [600, 870], [900, 880], [1120, 860], [1120, 1260], [-40, 1260]], 3, 12)), SKIN, { hatch: .22, lw: 3 });
  paint(x, P2(p => blob(p, circPts(40, 745, 60, 150, 26), 2, 13)), PINK, { hatch: .2, lw: 3 });
  for (let i = 0; i < 9; i++) { x.fillStyle = 'rgba(160,80,70,.35)'; x.beginPath(); x.arc(120 + i * 110, 600 - (i % 2) * 14, 9, 0, TAU); x.fill(); x.beginPath(); x.arc(160 + i * 110, 880 + (i % 2) * 14, 9, 0, TAU); x.fill(); } });
const DIA = bake(x => { skyBands(x, ['#171b3e', '#1c2250', '#222a5e', '#29336c', '#2f3b78'], 0, H, 10, 7); hill(x, 1200, 40, '#26405a', { freq: 1.2, seed: 3, tufts: 12, tuftCol: '#1a3048' }); });

// ---------------- props ----------------
function wax(x, y, s, t, { dry = 0, face = true, glowA = 1, broom = 0 } = {}) { g.save(); g.translate(x, y + Math.sin(t * 3 + x) * 4 * s); g.scale(s, s);
  if (glowA > 0) glow(g, 0, 0, 150, WARM, .55 * glowA);
  paint(g, P2(p => blob(p, circPts(0, 0, 70, 60, 20), 3, 21 + (dry > .5 ? 4 : 0))), dry > .5 ? DRYC : WAXC, { hatch: dry > .5 ? .3 : .16, lw: 3 });
  if (dry > .5) { g.strokeStyle = 'rgba(120,90,40,.6)'; g.lineWidth = 3; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(-40 + i * 18, -20 + (i % 2) * 20); g.lineTo(-20 + i * 18, 0 + (i % 2) * 20); g.stroke(); } }
  else { g.fillStyle = 'rgba(255,255,255,.6)'; g.beginPath(); g.ellipse(-24, -24, 16, 9, -.5, 0, TAU); g.fill(); }
  if (face) { g.fillStyle = INK; g.beginPath(); g.arc(-18, -4, 6, 0, TAU); g.arc(18, -4, 6, 0, TAU); g.fill(); g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.arc(0, 8, 14, .2, Math.PI - .2); g.stroke(); }
  if (broom > 0) { g.save(); g.globalAlpha *= broom; g.rotate(.4); paint(g, P2(p => p.rect(70, -90, 12, 120)), '#b98a5c', { hatch: .1, lw: 2 }); paint(g, P2(p => blob(p, [[56, 30], [96, 30], [110, 80], [42, 80]], 2, 9)), GOLD, { hatch: .2, lw: 2 }); g.restore(); }
  g.restore(); }
function earBig(x, y, s) { g.save(); g.translate(x, y); g.scale(s, s);
  paint(g, P2(p => { p.moveTo(60, -300); p.bezierCurveTo(-260, -320, -300, 160, -40, 190); p.bezierCurveTo(30, 200, 0, 300, 90, 290); p.bezierCurveTo(260, 270, 300, -180, 60, -300); p.closePath(); }), SKIN, { hatch: .2, lw: 3.4 });
  g.strokeStyle = SKIND; g.lineWidth = 22; g.lineCap = 'round'; g.beginPath(); g.moveTo(60, -230); g.bezierCurveTo(-180, -230, -200, 80, -10, 90); g.stroke();
  paint(g, P2(p => blob(p, circPts(40, 10, 46, 52, 20), 2, 30)), '#7a3f35', { hatch: .1, lw: 3 }); g.restore(); }
function sprite(x, y, s, kind, t) { g.save(); g.translate(x, y); g.scale(s, s); if (kind === 'germ') { for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(Math.cos(a) * 28, Math.sin(a) * 28); g.lineTo(Math.cos(a) * 42, Math.sin(a) * 42); g.stroke(); }
    paint(g, P2(p => blob(p, circPts(0, 0, 30, 30, 16), 3, 41)), '#9fd38f', { hatch: .2, lw: 2.4 }); } else paint(g, P2(p => blob(p, circPts(0, 0, 34, 26, 16), 5, 43)), '#b9b2a6', { hatch: .3, lw: 2.4 });
  g.fillStyle = INK; g.beginPath(); g.arc(-9, -3, 4, 0, TAU); g.arc(9, -3, 4, 0, TAU); g.fill(); g.restore(); }
function swab(x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); paint(g, P2(p => p.roundRect(0, -12, 560, 24, 10)), '#efe6d6', { hatch: .1, lw: 2.6 }); paint(g, P2(p => blob(p, circPts(0, 0, 56, 36, 18), 3, 51)), '#ffffff', { hatch: .2, lw: 2.6 }); paint(g, P2(p => blob(p, circPts(560, 0, 56, 36, 18), 3, 52)), '#ffffff', { hatch: .2, lw: 2.6 }); g.restore(); }
function person(x, y, s, col) { g.save(); g.translate(x, y); g.scale(s, s); paint(g, P2(p => blob(p, circPts(0, -60, 22, 22, 14), 1, 61)), PAL.skin, { hatch: .1, lw: 2 }); paint(g, P2(p => blob(p, [[-26, -34], [26, -34], [32, 20], [-32, 20]], 2, 62)), col, { hatch: .2, lw: 2 }); g.restore(); }
// constellation-line helpers: a dotted white diagram over the night
function cl(pts, k, o) { constLine(g, pts, k, o); }
function helix(x, y0, y1, k, t) { const n = 30; for (let s2 = 0; s2 < 2; s2++) cl(Array.from({ length: n + 1 }, (_, i) => { const u = i / n; return [x + Math.sin(u * TAU * 1.5 + s2 * Math.PI + t * .6) * 90, lerp(y0, y1, u)]; }), k, { dot: 0, lw: 3.6 });
  for (let i = 1; i < 10; i++) { const u = i / 10, y = lerp(y0, y1, u), a = Math.sin(u * TAU * 1.5 + t * .6) * 90; if (k > u) cl([[x + a, y], [x - a, y]], 1, { dot: 5, lw: 2.4 }); } }
function letter(ch, x, y, k, col = GOLD) { if (k <= 0) return; glow(g, x, y, 70 * k, '255,230,150', .6 * k); hand(g, ch, x, y + 26, k, { size: 110, col }); }

// ---------------- scenes ----------------
const S = [];
// A (p0-1): night hill, the kid looks up at a giant painted ear rising like a moon; the wax hero glows at its opening; "?" in constellation lines; but-turn: DIRT? → CLEANER
S.push([0, T(2) - .3, t => { g.drawImage(NIGHT, 0, 0); stars(g, 26, t, { y1: 700, seed: 7 });
  const z = 1 + .04 * ss(seg(t, 0, T(2))); g.save(); g.translate(540, 700); g.scale(z, z); g.translate(-540, -700);
  earBig(640, 640, 1.0); wax(690, 650, .9, t, { broom: seg(t, r(1, .9), r(1, 1.6)) });
  kid(g, 220, 1150, 1.8, { arm: -.9, arm2: .3, look: 6, mouth: t < T(1) ? 'o' : 'smile', body: '#8fb6e0' }); g.restore();
  cl([[110, 450], [170, 410], [230, 440], [220, 510], [180, 550], [180, 600]], seg(t, -.4, 1.0), {}); cl([[180, 650], [182, 655]], seg(t, .8, 1.1), { dot: 10 });
  hand(g, 'What is earwax for?', 540, 330, seg(t, -1.4, 0), { size: 78, col: CREAM });
  if (t > T(1) - .2) { hand(g, 'dirt?', 330, 470, seg(t, r(1, .1), r(1, .5)), { size: 70, col: CREAM }); cl([[260, 450], [410, 490]], seg(t, r(1, .5), r(1, .8)), { col: 'rgba(255,120,100,.95)', dot: 0, lw: 6 }); hand(g, 'a built-in cleaner', 690, 470, seg(t, r(1, 1.0), r(1, 2.0)), { size: 64, col: GOLD }); } }]);
// B (p2-4): inside the canal, painted as a tunnel: glands drip golden wax; dust and germ sprites drift in and stick; dew sparkles; a constellation shield
S.push([T(2) - .3, T(5) - .3, t => { g.drawImage(CANAL, 0, 0); hand(g, 'eardrum', 160, 470, seg(t, r(2, .4), r(2, 1.0)), { size: 58, col: '#3a2a22' }); hand(g, 'opening', 900, 760, seg(t, r(2, .8), r(2, 1.4)), { size: 54, col: CREAM });
  for (let i = 0; i < 9; i++) { const d = ((t * .5 + i * .37) % 1) * seg(t, r(2, .6), r(2, 1.6)); glow(g, 120 + i * 110, 600 + d * 40, 30, WARM, .6 * d); g.fillStyle = WAXC; g.beginPath(); g.arc(120 + i * 110, 600 - (i % 2) * 14 + d * 40, 10 * Math.min(1, d * 3), 0, TAU); g.fill(); }
  wax(560, 760, .85, t, { glowA: .8 });
  if (t > T(3) - .2) [['dust', 0], ['germ', .5], ['dust', 1.0], ['germ', 1.5]].forEach(([k, d], j) => { const u = ss(seg(t, r(3, d), r(3, d + 1.2))); if (u <= 0) return; const x = lerp(1100, 400 + j * 110, u), y = lerp(700 + j * 30, j % 2 ? 640 : 860, u); if (u >= 1) glow(g, x, y, 60, WARM, .5); sprite(x, y, 1, k, t); });
  if (t > T(3)) hand(g, 'trapped!', 300, 1040, seg(t, r(3, 1.6), r(3, 2.2)), { size: 70, col: '#b0452e' });
  if (t > T(4) - .2) { for (let i = 0; i < 8; i++) { const u = (t * .7 + i / 8) % 1; glow(g, 160 + i * 100, 860 - u * 30, 18, '170,220,255', .7 * (1 - u)); }
    cl([[700, 980], [800, 940], [900, 980], [890, 1060], [800, 1110], [710, 1060], [700, 980]], seg(t, r(4, .8), r(4, 2.0)), {}); hand(g, 'moist', 300, 1110, seg(t, r(4, .2), r(4, .8)), { size: 64, col: '#2c5c8a' }); hand(g, 'fights bacteria', 640, 1150, seg(t, r(4, 1.6), r(4, 2.4)), { size: 58, col: '#b0452e' }); } }]);
// C (p5-8): the conveyor belt: the floor of the tunnel slides outward (constellation arrows), wax rides out, a kid chewing in a moon-bubble, flakes fall at the door
S.push([T(5) - .3, T(9) - .3, t => { g.drawImage(CANAL, 0, 0); const run = seg(t, r(5, .8), r(5, 1.4));
  for (let j = 0; j < 2; j++) for (let i = 0; i < 5; i++) { const off = ((t * 70 * run) % 220), x = 80 + i * 220 + off; if (x > 1000) continue; cl([[x, j ? 870 : 630], [x + 120, j ? 870 : 630]], run, { dot: 6 }); cl([[x + 100, (j ? 870 : 630) - 16], [x + 124, j ? 870 : 630], [x + 100, (j ? 870 : 630) + 16]], run, { dot: 0 }); }
  for (let i = 0; i < 4; i++) { const u = ((t * .08 * run + i / 4) % 1), x = lerp(160, 960, u), y = i % 2 ? 690 : 830, dry = clamp((u - .6) / .3); wax(x, y, .5, t, { dry, face: i === 1, glowA: .5 });
    if (u > .88) for (let k = 0; k < 3; k++) { glow(g, x + 30 + k * 16, y + 60 + (u - .88) * 900 + k * 20, 16, '255,230,170', .8); } }
  hand(g, 'slowly outward', 540, 1080, seg(t, r(6, .3), r(6, 1.2)), { size: 70, col: '#3a2a22' }); if (t > T(5)) hand(g, 'a conveyor belt', 540, 430, seg(t, r(5, 1.6), r(5, 2.6)), { size: 80, col: '#b0452e' });
  if (t > T(7) - .2) { const k = ss(seg(t, r(7, .2), r(7, .8))) * (1 - ss(seg(t, T(8) - .3, T(8)))); g.save(); g.globalAlpha *= k; g.fillStyle = 'rgba(30,30,70,.85)'; g.beginPath(); g.arc(220, 380, 150, 0, TAU); g.fill(); glow(g, 220, 380, 160, '255,240,200', .4);
    kid(g, 220, 500, .9, { mouth: Math.sin(t * 12) > 0 ? 'o' : 'smile', body: '#8fb6e0' }); hand(g, 'chew + talk', 220, 260, 1, { size: 50, col: CREAM }); g.restore(); }
  if (t > T(8) - .2) hand(g, 'dries · flakes · falls out', 560, 1150, seg(t, r(8, .3), r(8, 1.4)), { size: 58, col: '#b0452e' }); }]);
// D (p9-11): a cotton swab slides in and shoves the wax against the eardrum (red constellation cross), then 12 million people as stars over a night town
S.push([T(9) - .3, T(12) - .3, t => { if (t < T(11) - .2) { g.drawImage(CANAL, 0, 0); const u = ss(seg(t, r(9, .4), r(10, 1.6)));
    wax(lerp(520, 150, u), 745, .9, t, { glowA: .6 }); swab(lerp(1100, 260, u), 745, 1); if (u > .8) { glow(g, 80, 745, 160, '255,90,80', .5 * (u - .8) * 5); hand(g, 'ouch!', 250, 660, seg(t, r(10, 1.4), r(10, 2.0)), { size: 74, col: '#ff9a8a' }); }
    cl([[700, 360], [880, 500]], seg(t, r(9, .6), r(9, 1.0)), { col: 'rgba(255,120,100,.95)', dot: 0, lw: 8 }); cl([[880, 360], [700, 500]], seg(t, r(9, .9), r(9, 1.3)), { col: 'rgba(255,120,100,.95)', dot: 0, lw: 8 }); hand(g, 'skip the swabs', 400, 450, seg(t, r(9, .5), r(9, 1.4)), { size: 70, col: '#3a2a22' });
    if (t > T(10)) hand(g, 'pushes wax deeper', 540, 1110, seg(t, r(10, .4), r(10, 1.3)), { size: 64, col: '#b0452e' }); }
  else { g.drawImage(NIGHT, 0, 0); stars(g, 20, t, { y1: 600, seed: 9 }); for (let i = 0; i < 12; i++) { const k = ss(seg(t, r(11, .3 + i * .12), r(11, .6 + i * .12))); if (k <= 0) continue; const x = 150 + (i % 6) * 156, y = i < 6 ? 760 : 1000; glow(g, x, y - 60, 70, '255,230,170', .5 * k); g.save(); g.globalAlpha *= k; person(x, y, 1.3, ['#8fb6e0', '#e6a1a6', '#a9c79a', '#f1c48f'][i % 4]); g.restore(); }
    hand(g, '12 million', 540, 470, seg(t, r(11, 1.0), r(11, 1.8)), { size: 130, col: GOLD }); hand(g, 'Americans see a doctor each year', 540, 560, seg(t, r(11, 1.8), r(11, 2.8)), { size: 54, col: CREAM }); } }]);
// E (p12-15): wet vs dry (two blobs under the stars), the ABCC11 helix in constellation lines with G and A stars, AA = dry, a painted globe with East Asia lit
S.push([T(12) - .3, T(16) - .3, t => { g.drawImage(DIA, 0, 0); stars(g, 30, t, { y1: 1100, seed: 11 });
  if (t < T(13) - .2) { wax(300, 800, 1.3, t, { glowA: .8 }); wax(780, 800, 1.3, t, { dry: 1, glowA: .4 }); hand(g, 'wet + sticky', 300, 1010, seg(t, r(12, 1.2), r(12, 2.0)), { size: 62, col: GOLD }); hand(g, 'dry + flaky', 760, 1010, seg(t, r(12, 3.4), r(12, 4.2)), { size: 62, col: DRYC }); hand(g, 'wet or dry?', 540, 430, seg(t, r(12, .2), r(12, 1.0)), { size: 80, col: CREAM }); }
  else if (t < T(15) - .2) { helix(240, 360, 1100, seg(t, T(13) - .1, r(13, 1.6)), t); hand(g, 'one gene: ABCC11', 640, 420, seg(t, r(13, 1.6), r(13, 2.6)), { size: 66, col: CREAM });
    if (t < T(14) - .2) { letter('G', 560, 700, seg(t, r(13, 1.0), r(13, 1.5)), '#a9e09a'); letter('A', 800, 700, seg(t, r(13, 1.4), r(13, 1.9))); hand(g, 'one letter', 680, 870, seg(t, r(13, 2.0), r(13, 2.6)), { size: 58, col: CREAM }); }
    else { const k1 = seg(t, r(14, .2), r(14, .7)), k2 = seg(t, r(14, 2.0), r(14, 2.5)); letter('A', 500, 640, k1); letter('A', 620, 640, k1); hand(g, '= dry', 830, 666, k1, { size: 64, col: DRYC });
      letter('G', 500, 900, k2, '#a9e09a'); letter('·', 620, 880, k2, CREAM); hand(g, '= wet', 830, 926, k2, { size: 64, col: GOLD }); } }
  else { const k = ss(seg(t, T(15) - .1, r(15, .6))); g.save(); g.globalAlpha *= k; glow(g, 540, 760, 360, '150,200,255', .35);
    paint(g, P2(p => blob(p, circPts(540, 760, 280, 280, 40), 1, 71)), '#5f8fd0', { hatch: .2, lw: 3 }); paint(g, P2(p => blob(p, [[380, 640], [520, 600], [560, 700], [480, 820], [380, 780]], 3, 72)), '#8fc78a', { hatch: .2, lw: 2.6 });
    paint(g, P2(p => blob(p, [[560, 610], [760, 600], [790, 720], [700, 820], [580, 760]], 3, 73)), '#8fc78a', { hatch: .2, lw: 2.6 }); glow(g, 720, 680, 110, '255,200,120', .8 * seg(t, r(15, .8), r(15, 1.6)));
    paint(g, P2(p => blob(p, [[680, 630], [770, 630], [780, 720], [700, 740]], 2, 74)), '#f2a65a', { hatch: .2, lw: 2.6, a: seg(t, r(15, .8), r(15, 1.4)) }); g.restore();
    hand(g, 'dry wax: most common in East Asia', 540, 1110, seg(t, r(15, 1.0), r(15, 2.2)), { size: 56, col: GOLD }); } }]);
// F (p16-17): the payoff on the hill: the wax hero with broom under a constellation shield; the question with two lanterns
S.push([T(16) - .3, T(18) - .3, t => { g.drawImage(NIGHT, 0, 0); stars(g, 28, t, { y1: 700, seed: 13 });
  if (t < T(17) - .2) { cl([[540, 300], [740, 360], [720, 560], [540, 680], [360, 560], [340, 360], [540, 300]], seg(t, r(16, .2), r(16, 1.6)), {}); wax(540, 500, 1.2, t, { broom: 1 }); kid(g, 280, 1130, 1.2, { arm: -.6, arm2: .6, body: '#8fb6e0' });
    hand(g, 'self-cleaning · self-moving', 560, 820, seg(t, r(16, 1.4), r(16, 2.6)), { size: 62, col: GOLD }); }
  else { wax(320, 760, 1.3, t, {}); wax(760, 760, 1.3, t, { dry: 1, glowA: .4 }); hand(g, 'wet or dry?', 540, 430, seg(t, r(17, .1), r(17, .8)), { size: 90, col: CREAM }); hand(g, 'WET', 320, 980, seg(t, r(17, .8), r(17, 1.1)), { size: 70, col: GOLD }); hand(g, 'DRY', 760, 980, seg(t, r(17, 1.1), r(17, 1.4)), { size: 70, col: DRYC }); } }]);
// end card: the night hill, the ear moon and the wax hero, the closing lines handwritten
S.push([T(18) - .3, TL.total + 1, t => { const t0 = T(18) - .3; g.drawImage(NIGHT, 0, 0); stars(g, 26, t, { y1: 700, seed: 7 }); earBig(800, 1000, .45); wax(850, 1000, .4, t, {});
  hand(g, 'Follow for more of', 540, 520, seg(t, t0 + .2, t0 + .9), { size: 92, col: CREAM }); hand(g, 'how it really works.', 540, 640, seg(t, t0 + .6, t0 + 1.4), { size: 104, col: GOLD });
  hand(g, "A new 'wait, really?' every day.", 540, 740, seg(t, t0 + 1.2, t0 + 1.7), { size: 56, col: CREAM }); hand(g, '@howitreallyworkstudio', 540, 820, seg(t, t0 + 1.4, t0 + 1.9), { size: 50, col: '#bfe3ff' }); }]);

function scene(t) {
  g.fillStyle = PAL.night0; g.fillRect(0, 0, W, H);
  for (const [a, b, fn] of S) { const k = a <= 0 ? 1 - ss(seg(t, b - .5, b)) : win(t, a + .5, b, .5); if (k <= 0) continue; g.save(); g.globalAlpha = k; fn(t); g.restore(); }
  finish(g, { t });
}
// subtitle slip (the module's torn paper slip, re-laid for Batch N: max width 700, centred at x 500, around y 1320)
function slip(cap, a, y0 = 1320, X = 500) {
  if (a <= 0) return; const size = 58, maxW = 700; g.save(); g.font = `700 ${size}px Caveat`;
  const words = []; parse(cap).forEach(p => p.t.split(/(\s+)/).forEach(w => w && words.push({ w, b: p.b })));
  const lines = [[]]; let cw = 0;
  for (const w of words) { const m = g.measureText(w.w).width; if (cw + m > maxW && !/^\s+$/.test(w.w) && lines[lines.length - 1].length) { lines.push([]); cw = 0; } if (!(cw === 0 && /^\s+$/.test(w.w))) { lines[lines.length - 1].push(w); cw += m; } }
  const lh = 62, top = y0 - (lines.length - 1) * lh / 2, widest = Math.max(...lines.map(l => l.reduce((s, w) => s + g.measureText(w.w).width, 0)));
  g.globalAlpha = a; g.shadowColor = 'rgba(20,10,10,.35)'; g.shadowBlur = 12; g.shadowOffsetY = 6; g.fillStyle = CREAM;
  const bx = X - widest / 2 - 30, by = top - lh / 2 - 12, bw = widest + 60, bh = lines.length * lh + 24;
  g.beginPath(); g.moveTo(bx, by); for (let i = 0; i <= 12; i++) g.lineTo(bx + bw * i / 12, by + (hash(i * 3.3) - .5) * 6); g.lineTo(bx + bw, by + bh); for (let i = 12; i >= 0; i--) g.lineTo(bx + bw * i / 12, by + bh + (hash(i * 5.1) - .5) * 6); g.closePath(); g.fill();
  g.shadowColor = 'transparent'; g.textBaseline = 'middle';
  lines.forEach((ln, i) => { const tw = ln.reduce((s, w) => s + g.measureText(w.w).width, 0); let x = X - tw / 2; for (const w of ln) { g.fillStyle = w.b ? '#c4543f' : INK; g.fillText(w.w, x, top + i * lh); x += g.measureText(w.w).width; } });
  g.restore();
}
function sub(t) {
  let cur = -1; for (let i = 0; i < PH.length; i++) if (t >= PH[i].start - .05) cur = i;
  if (cur < 0 || cur === PH.length - 1) return; const p = PH[cur], nx = PH[cur + 1].start, a = (cur === 0 ? 1 : seg(t, p.start - .05, p.start + .15)) * (1 - seg(t, nx - .25, nx - .05));
  slip(p.cap, a);
}
window.DUR = TL.total;
// loop: the last 0.5 s blends 30% of frame 0 back in (the end card already shows the ear and the wax hero)
window.seek = t => { const Tt = TL.total, a = Tt - .5; scene(t); sub(t); if (t > a) { const k = .3 * ss((t - a) / .5); g.save(); g.globalAlpha = k; scene(0); sub(0); g.restore(); } };
window.thumb = () => { const t = 1.5; g.drawImage(NIGHT, 0, 0); stars(g, 26, t, { y1: 700, seed: 7 }); earBig(640, 760, 1.15); wax(700, 770, 1.1, t, {}); kid(g, 220, 1250, 1.3, { arm: -.9, look: 6, mouth: 'o', body: '#8fb6e0' });
  g.save(); g.fillStyle = 'rgba(246,239,224,.93)'; g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 20; g.beginPath(); g.roundRect(110, 1300, 860, 260, 20); g.fill(); g.restore();
  hand(g, 'WHAT IS EARWAX', 540, 1390, 1, { size: 96 }); hand(g, 'ACTUALLY FOR?', 540, 1510, 1, { size: 110, col: '#c4543f' }); finish(g, { t }); };
window.render = window.seek; window.seek(0); window.ready = true; window.READY = true;
