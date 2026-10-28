// t_darknight.js: "Why is the night sky dark if there are so many stars?" (Olbers' paradox) in template #6 shadow-puppet,
// in-house kit reels/styles/shadowpuppet. Grammar kept: the lamp behind a cloth, dyed hide puppets on rods with rivets,
// carved lace (evenodd holes glow), cut-letter plaques, storyteller's placard. The night sky is a dark hide sheet pricked with
// star holes, so the stars really are the lamp shining through. Diagrams play on the open, lit screen.
// Batch N: pictures inside y 250-1130, placard in the caption band (y ~1150-1420), nothing written right of x 900 below y 840.
import { createSP, cfg, W, H, TAU, clamp, lerp, ramp, win, hash, mixc, DYE, dye, hidePiece, at, rod, inkText, plaque, tag, circ, ring, ell, poly, star, trem, puppet, cutPlaque as cutPlaque0, rivet, hill, sun, earth, FONT } from './styles/shadowpuppet/shadowpuppet.js';
await Promise.all([document.fonts.load('italic 700 60px "Cormorant Garamond"')]);
cfg.hide = true;
// every top plaque sits 70 px lower than catpurr's so the EP badge fits the top-right band (y 260-330) above them
const cutPlaque = (gg, x, y, ...a) => cutPlaque0(gg, x, y + 70, ...a);
const canvas = document.getElementById('c'), R = createSP(canvas), g = R.g;
const TL = window.TL, PH = TL.p, T = i => PH[i].start, E = i => PH[i].end;
const r = (i, d) => T(i) + d;
const cam = (s, cx, cy) => R.cam(s, cx, cy);
const GOLD = 'rgba(255,205,110,1)', EMBER = 'rgba(255,120,50,1)', DUST = ['#6a4a34', '#3a2418'], HOT = ['#f39a4a', '#d0502a'], RED = ['#e8563a', '#a82a2a'], PALE = ['#fff2c4', '#f3d27a'];
const label = (t, ti, fn) => { const k = ramp(t, ti, ti + .45); if (k > 0) { g.save(); g.globalAlpha *= k; fn(k); g.restore(); } };

// ---------- the night sky: one dark sheet, every star is a hole the lamp shines through ----------
const STARS = Array.from({ length: 1500 }, (_, i) => ({ x: -60 + hash(i * 1.37) * 1200, y: 60 + hash(i * 2.71 + 5) * 1100, r: 2.2 + 4.2 * Math.pow(hash(i * 4.1 + 1), 3), tw: hash(i * 9.3) * 6.28 }));
function sky(t, n, o = {}) {   // n stars shown; o.open = 0..1 the whole sheet opening (sky turning bright); o.lines = sight lines 0..1
  const open = o.open ?? 0, grow = 1 + open * 9;
  dye(g, p => { p.rect(-400, -400, 1880, 1650);
    for (let i = 0; i < n; i++) { const s = STARS[i], k = clamp(n - i), rr = s.r * (.82 + .25 * Math.sin(t * 2.3 + s.tw)) * k * grow; if (rr < .4) continue;
      if (i < 26 && open < .2) star(p, rr * .45, rr * 2.4, 4, s.tw, s.x, s.y); else circ(p, s.x, s.y, rr); }
    if (o.lines > 0) { const [ex, ey] = o.eye; LINES.forEach((j, q) => { const s = STARS[j], k = clamp(o.lines * 1.4 - q * .06); if (k <= 0) return; const x1 = lerp(ex, s.x, k), y1 = lerp(ey, s.y, k), a = Math.atan2(y1 - ey, x1 - ex), w = 2.2;
      poly(p, [[ex + Math.sin(a) * w, ey - Math.cos(a) * w], [x1 + Math.sin(a) * w, y1 - Math.cos(a) * w], [x1 - Math.sin(a) * w, y1 + Math.cos(a) * w], [ex - Math.sin(a) * w, ey + Math.cos(a) * w]]); }); }
  }, DYE.ink, { edge: false, r: 900, a: 1 - .9 * open });
}
const LINES = [3, 9, 14, 21, 30, 41, 55, 70, 88, 104, 131, 160];
function watcher(t, x, y, s, o = {}) { rod(g, x + 10 * s, y - 120 * s); puppet(g, x, y, s, t, { hand: o.hand || [70, -230], hand2: o.hand2 || [-20, -70], head: o.head ?? -.35 }); }
const EYE = (x, y, s) => [x + 18 * s, y - 150 * s];
// on the dark sheet a paper tag would vanish (multiply), so labels there are cut-letter boards: the letters glow
function ctag(s, x, y, size, k) { if (k <= 0) return; g.save(); g.font = `italic 700 ${size}px ${FONT}`; if ('letterSpacing' in g) g.letterSpacing = '2px'; const w = g.measureText(s).width + 80; g.restore(); cutPlaque0(g, x, y, w, size + 50, [s], size, k, { ls: 2 }); }

// ---------- small puppets ----------
function arrow(x, y, ang, len, col = DYE.sun, a = 1) { at(g, x, y, ang, 1, () => dye(g, p => poly(p, [[-len / 2, -9], [len / 2 - 26, -9], [len / 2 - 26, -24], [len / 2, 0], [len / 2 - 26, 24], [len / 2 - 26, 9], [-len / 2, 9]]), col, { r: len / 2, a, edge: '#8a3a12' })); }
function cloud(x, y, s, t, heat) { const j = trem(x * .01 + 7, t, 1.6), cols = [mixc(DUST[0], HOT[0], heat), mixc(DUST[1], HOT[1], heat)];
  at(g, x + j[0], y + j[1], .04 * Math.sin(t * .6), s, () => hidePiece(g, p => { const pts = []; for (let i = 0; i < 48; i++) { const a = i / 48 * TAU, rr = 150 * (1 + .14 * Math.sin(3 * a + 1) + .09 * Math.sin(5 * a + 2) + .05 * Math.sin(9 * a)); pts.push([Math.cos(a) * rr * 1.5, Math.sin(a) * rr * .8]); } poly(p, pts);
    for (let i = 0; i < 9; i++) { const a = i / 9 * TAU + .3; ell(p, Math.cos(a) * 120, Math.sin(a) * 52, 14, 6, a); } circ(p, -40, 0, 8); circ(p, 40, 4, 6); }, cols, { r: 220, edge: mixc('#1a0d06', '#7a2a10', heat) })); }
function hourglass(x, y, s, t, k) { const sand = clamp((t - k) / 8);
  at(g, x, y, .03 * Math.sin(t * .7), s, () => {
    hidePiece(g, p => { poly(p, [[-110, -170], [110, -170], [110, -150], [-110, -150]]); poly(p, [[-110, 150], [110, 150], [110, 170], [-110, 170]]); }, ['#7a4a26', '#4a2a14'], { r: 120, edge: '#2a140c' });
    dye(g, p => { poly(p, [[-90, -150], [90, -150], [12, 0], [90, 150], [-90, 150], [-12, 0]]); poly(p, [[-70, -140], [70, -140], [8, -6], [-8, -6]]); poly(p, [[-8, 6], [8, 6], [70, 140], [-70, 140]]); }, ['#b8d4e8', '#8aa8c8'], { r: 120, edge: '#2d3f78', a: .8 });
    const top = lerp(1, .15, sand), bot = lerp(.2, 1, sand);
    dye(g, p => { poly(p, [[-62 * top, -6 - 120 * top], [62 * top, -6 - 120 * top], [6, -6], [-6, -6]]); poly(p, [[-66, 140], [66, 140], [66 * (1 - bot * .7), 140 - 110 * bot], [-66 * (1 - bot * .7), 140 - 110 * bot]]); poly(p, [[-2.5, -4], [2.5, -4], [2.5, 140 - 100 * bot], [-2.5, 140 - 100 * bot]]); }, DYE.sun, { r: 100, edge: '#8a3a12' });
    [[-100, -160], [100, -160], [-100, 160], [100, 160]].forEach(([a, b]) => rivet(g, a, b, 7)); }); }
function galaxy(x, y, s, t, seed, cols = PALE) { at(g, x, y, t * .15 + seed, s, () => dye(g, p => { ell(p, 0, 0, 46, 20, 0); ell(p, 0, 0, 30, 11, 0); circ(p, 0, 0, 7);
  for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; circ(p, Math.cos(a) * 38, Math.sin(a) * 15, 2.6); } }, cols, { r: 50, edge: '#8a5a12' })); }
function starPiece(x, y, rr, t, lit, seed) { const j = trem(seed, t, 1.2); at(g, x + j[0], y + j[1], seed, 1, () => dye(g, p => { star(p, rr * .42, rr, 5); circ(p, 0, 0, rr * .18); }, lit ? DYE.sun : DYE.ink, { r: rr, edge: lit ? '#8a3a12' : '#07030c' })); if (lit) R.glow(x, y, rr * 2.4, GOLD, .35 * g.globalAlpha); }
function wave(x0, y0, x1, y1, t, lam0, stretch, amp, cols0, cols1, k = 1, o = {}) {   // a light wave cut from hide, wavelength and colour changing along its run
  const L = Math.hypot(x1 - x0, y1 - y0), a = Math.atan2(y1 - y0, x1 - x0), N = 120, P = [];
  let ph = -t * 5; for (let i = 0; i <= N; i++) { const u = i / N, lam = lam0 * (1 + stretch * u); ph += (L / N) / lam * TAU; P.push([u * L, Math.sin(ph) * amp * (1 - (o.fade ?? 0) * u)]); }
  const SEG = 10; at(g, x0, y0, a, 1, () => { for (let sg = 0; sg < SEG; sg++) { const i0 = Math.floor(sg * N / SEG), i1 = Math.floor((sg + 1) * N / SEG); if (i0 / N > k) break; const Q = P.slice(i0, Math.min(i1, Math.floor(k * N)) + 1); if (Q.length < 2) continue;
    const u = (sg + .5) / SEG, cols = [mixc(cols0[0], cols1[0], u), mixc(cols0[1], cols1[1], u)], w = 9;
    dye(g, p => { p.moveTo(Q[0][0], Q[0][1] - w); Q.forEach(([x, y]) => p.lineTo(x, y - w)); for (let q = Q.length - 1; q >= 0; q--) p.lineTo(Q[q][0], Q[q][1] + w); p.closePath(); }, cols, { r: 80, lw: 2, edge: mixc('#8a3a12', '#5a1010', u) }); } }); }
function eyeIcon(x, y, s, a = 1) { at(g, x, y, 0, s, () => { dye(g, p => { p.moveTo(-80, 0); p.quadraticCurveTo(0, -70, 80, 0); p.quadraticCurveTo(0, 70, -80, 0); p.closePath(); circ(p, 0, 0, 26); circ(p, 0, 0, 10); }, DYE.card, { r: 90, edge: '#7a3a14', a }); }); }
function slash(x, y, s, a = 1) { at(g, x, y, 0, s, () => dye(g, p => poly(p, [[-90, 60], [-78, 74], [90, -60], [78, -74]]), DYE.red, { r: 90, edge: '#6a1010', a })); }

// ---------- scenes ----------
// 0-2: the hook. A watcher on a hill under the star sheet. "If space went on forever": more stars, sight lines, then the sheet opens and the sky glows.
function sceneSky(t) {
  const a = 1 - ramp(t, T(3) - .3, T(3) + .1); if (a <= 0) return; g.save(); g.globalAlpha = a;
  cam(1 + .05 * ramp(t, 0, T(3)), 540, 800);
  const many = ramp(t, r(1, .8), r(1, 4.6)), open = ramp(t, r(2, .2), r(2, 2.4)), n = lerp(170, 1500, many);
  const wx = 300, wy = 1140, s = 1.7; sky(t, n, { open, lines: ramp(t, r(1, 2.0), r(1, 4.4)) * (1 - open), eye: EYE(wx, wy, s) });
  if (open > 0) { R.glow(540, 620, 900, 'rgba(255,236,190,1)', .55 * open); sun(g, 760, 600, 150 * open, t); }
  hill(g, 1150); watcher(t, wx, wy, s, { hand: open > .4 ? [40, -268] : [70, -230], head: lerp(-.35, -.15, open) });
  const swap = ramp(t, T(1) - .15, T(1) + .25);
  if (swap < 1) { g.save(); g.globalAlpha *= 1 - swap; cutPlaque(g, 540, 420, 880, 240, ['WHY IS THE', 'NIGHT SKY DARK?'], 84, 1); g.restore(); }
  if (swap > 0 && t < r(2, 2.2)) { g.save(); g.globalAlpha *= swap * (1 - ramp(t, r(2, 1.6), r(2, 2.2))); cutPlaque(g, 540, 420, 880, 240, ['IF SPACE WENT', 'ON FOREVER...'], 80, 1); g.restore(); }
  if (open < .3) ctag('every line ends on a star', 600, 760, 42, ramp(t, r(1, 2.6), r(1, 3.1)) * (1 - ramp(t, r(2, .1), r(2, .4))));
  if (t > r(2, 2.4)) cutPlaque(g, 540, 420, 880, 240, ["OLBERS'", 'PARADOX'], 92, ramp(t, r(2, 2.6), r(2, 3.2)));
  g.restore(); }
// 3: the dust guess: a dust cloud drifts over the stars, soaks up light, heats up and glows
function sceneDust(t) {
  const a = win(t, T(3) - .3, T(4) - .05, .4); if (a <= 0) return; g.save(); g.globalAlpha = a; cam(1.02, 540, 800);
  sky(t, 420); const heat = ramp(t, r(3, 3.0), r(3, 5.4)), cx = lerp(1300, 560, ramp(t, T(3) - .3, r(3, 2.2)));
  R.glow(cx, 690, 420, 'rgba(150,110,80,1)', .22 * a); if (heat > 0) R.glow(cx, 690, 520, EMBER, .7 * heat * a);
  cloud(cx, 690, 1.25, t, heat); hill(g, 1150); watcher(t, 300, 1140, 1.7);
  cutPlaque(g, 540, 400, 700, 200, ['DUST?'], 96, ramp(t, T(3), r(3, .5)));
  ctag('soaks up light', 640, 850, 44, ramp(t, r(3, 2.4), r(3, 2.9))); ctag('heats up, glows', 600, 960, 46, ramp(t, r(3, 4.4), r(3, 4.9)));
  g.restore(); }
// 4-5: the real answer: the universe has an age; light travels at a fixed speed
function sceneAge(t) {
  const a = win(t, T(4) - .3, T(6) - .05, .4); if (a <= 0) return; g.save(); g.globalAlpha = a; cam(1 + .04 * ramp(t, T(4), T(6)), 540, 800);
  hourglass(540, 760, 1.05, t, T(4)); rod(g, 540, 940);
  cutPlaque(g, 540, 380, 900, 200, ['THE UNIVERSE', 'HAS AN AGE'], 76, ramp(t, T(4) - .1, r(4, .5)) * (1 - ramp(t, T(5) - .2, T(5) + .1)));
  if (t > T(5) - .2) cutPlaque(g, 540, 380, 900, 200, ['13.8 BILLION', 'YEARS'], 84, ramp(t, T(5) - .1, r(5, .5)));
  const lk = ramp(t, r(5, 2.2), r(5, 2.6)); if (lk > 0) { const u = ((t - r(5, 2.2)) * .28) % 1; g.save(); g.globalAlpha *= lk; for (let i = 0; i < 3; i++) { const x = 120 + ((u + i / 3) % 1) * 840; arrow(x, 1040, 0, 120, DYE.sun); R.glow(x + 40, 1040, 60, GOLD, .5 * lk * a); } g.restore(); }
  label(t, r(5, 2.8), () => tag(g, 'light: a fixed speed', 540, 1110 - 0, 42));
  g.restore(); }
// 6-7: a map: the bubble light has had time to cross; light from stars beyond it is still on its way
const MAP = Array.from({ length: 34 }, (_, i) => { const a = hash(i * 3.3) * TAU, d = 90 + hash(i * 5.7 + 2) * 520; return { x: 540 + Math.cos(a) * d * .82, y: 700 + Math.sin(a) * d * .66, d, s: 14 + hash(i * 7) * 12, seed: i }; });
function sceneMap(t) {
  const a = win(t, T(6) - .3, T(8) - .05, .4); if (a <= 0) return; g.save(); g.globalAlpha = a; cam(1 + .05 * ramp(t, T(6), T(8)), 540, 760);
  const rr = lerp(60, 300, ramp(t, r(6, .3), r(6, 2.6)));
  dye(g, p => { ell(p, 540, 700, rr * .82 + 10, rr * .66 + 10); ell(p, 540, 700, rr * .82, rr * .66); }, DYE.sun, { r: rr, edge: '#8a3a12' });
  dye(g, p => ell(p, 540, 700, rr * .82, rr * .66), ['#fff4d2', '#ffe2a0'], { edge: false, r: rr, a: .5 });
  MAP.forEach(m => { const lit = m.d < rr; starPiece(m.x, m.y, m.s, t, lit, m.seed);
    if (!lit && t > T(7) - .2) { const k = ramp(t, T(7) - .2, r(7, 1)), ang = Math.atan2(700 - m.y, 540 - m.x), prog = ((t * .25 + hash(m.seed)) % 1) * .45 + .1, ax = lerp(m.x, 540, prog), ay = lerp(m.y, 700, prog); g.save(); g.globalAlpha *= k * .9; arrow(ax, ay, ang, 54, DYE.sun); g.restore(); } });
  earth(g, 540, 700, 34, t); label(t, r(6, 1.2), () => tag(g, 'light had time to get here', 540, 400, 44));
  label(t, r(7, .9), () => tag(g, 'still on its way', 540, 1110, 46));
  g.restore(); }
// 8-10: space stretches: galaxies spread apart, a wave from a far galaxy stretches, reddens and weakens on the way to us
function sceneStretch(t) {
  const a = win(t, T(8) - .3, T(11) - .05, .4); if (a <= 0) return; g.save(); g.globalAlpha = a; cam(1, 540, 780);
  const ex = ramp(t, T(8) - .2, r(10, 3)), sc = 1 + .55 * ex;
  for (let i = 0; i < 9; i++) { const ax = (hash(i * 4.4) - .5) * 760, ay = (hash(i * 6.1) - .5) * 380; galaxy(540 + ax * sc, 520 + ay * sc, .9, t, i); }
  label(t, r(8, .4), () => { for (let i = 0; i < 4; i++) { const ang = i * TAU / 4 + .6; arrow(540 + Math.cos(ang) * 120 * sc, 520 + Math.sin(ang) * 80 * sc, ang, 90, DYE.moon); } });
  const wk = ramp(t, T(9) - .2, r(9, 1.4)), st = ramp(t, r(9, .6), r(9, 3.6)), rd = ramp(t, T(10) - .2, r(10, 2.2));
  if (wk > 0) { galaxy(140, 920, 1.3, t, 20); eyeIcon(800, 940, .7);
    wave(190, 920, 720, 940, t, 34, 3.2 * st, 40, PALE, rd > 0 ? [mixc(PALE[0], RED[0], rd), mixc(PALE[1], RED[1], rd)] : PALE, wk, { fade: .7 * rd }); }
  cutPlaque(g, 540, 330 + 40, 860, 180, ['SPACE IS EXPANDING'], 66, ramp(t, T(8), r(8, .5)) * (1 - ramp(t, T(9) - .2, T(9) + .1)));
  if (t > T(9) - .2) cutPlaque(g, 540, 370, 860, 180, [rd > .5 ? 'REDDER, WEAKER' : 'STRETCHED'], 72, ramp(t, T(9) - .1, r(9, .4)));
  label(t, r(9, 1.6), () => tag(g, 'waves get longer', 440, 1090, 42));
  g.restore(); }
// 11: the Big Bang's leftover glow, stretched into microwaves we can't see
function sceneGlow(t) {
  const a = win(t, T(11) - .3, T(12) - .05, .4); if (a <= 0) return; g.save(); g.globalAlpha = a; cam(1.02, 540, 780);
  const cool = ramp(t, r(11, 1.2), r(11, 4.4)), cols = [mixc('#ffb04a', '#3a4a6a', cool), mixc('#e2542a', '#1c2440', cool)];
  R.glow(540, 700, 460, EMBER, .55 * (1 - cool) * a);
  dye(g, p => { ring(p, 270, 310, 540, 700); for (let i = 0; i < 24; i++) { const an = i / 24 * TAU; circ(p, 540 + Math.cos(an) * 290, 700 + Math.sin(an) * 290, 6); } }, cols, { r: 380, edge: mixc('#7a2a10', '#0e1428', cool) });
  for (let i = 0; i < 6; i++) { const an = i / 6 * TAU + .3; wave(540 + Math.cos(an) * 262, 700 + Math.sin(an) * 262, 540 + Math.cos(an) * 70, 700 + Math.sin(an) * 70, t, 26, 2.5 * (.3 + cool), 18, [cols[0], cols[1]], [mixc('#ffb04a', '#56607a', cool), mixc('#e2542a', '#2a3450', cool)], 1); }
  earth(g, 540, 700, 52, t);
  cutPlaque(g, 540, 330 + 20, 860, 170, ['BIG BANG GLOW'], 66, ramp(t, T(11), r(11, .5)) * (1 - ramp(t, r(11, 3.6), r(11, 4.0))));
  if (t > r(11, 3.6)) cutPlaque(g, 540, 350, 860, 170, ['NOW: MICROWAVES'], 66, ramp(t, r(11, 3.7), r(11, 4.2)));
  label(t, r(11, 4.4), () => { eyeIcon(800, 1085, .5); slash(800, 1085, .5); tag(g, 'invisible to our eyes', 460, 1085, 42); });
  g.restore(); }
// 12: payoff: back under the night sky; a beginning; most light not here yet; the rest stretched
function scenePay(t) {
  const a = win(t, T(12) - .3, T(13) - .05, .4); if (a <= 0) return; g.save(); g.globalAlpha = a; cam(1 + .04 * ramp(t, T(12), T(13)), 540, 800);
  sky(t, 260); hill(g, 1150); watcher(t, 300, 1140, 1.7);
  cutPlaque(g, 540, 400, 900, 220, ['THE UNIVERSE HAD', 'A BEGINNING'], 70, ramp(t, T(12) + .1, r(12, .7)));
  ctag('most starlight: not here yet', 600, 700, 44, ramp(t, r(12, 3.4), r(12, 3.9))); ctag('the rest: stretched', 640, 830, 44, ramp(t, r(12, 6.4), r(12, 6.9)));
  g.restore(); }
// 13-14: the question, then the end card (eases back toward the frame-0 sky)
function sceneEnd(t) {
  const a = win(t, T(13) - .3, TL.total + 1, .4); if (a <= 0) return; g.save(); g.globalAlpha = a; cam(1, 540, 800);
  sky(t, 170); hill(g, 1150); watcher(t, 300, 1140, 1.7);
  const q = 1 - ramp(t, T(14) - .3, T(14) + .1);
  if (q > 0) { g.save(); g.globalAlpha *= q; cutPlaque(g, 540, 400, 860, 230, ['A CLUE?'], 100, ramp(t, T(13) + .1, r(13, .6))); ctag('yes', 560, 690, 60, ramp(t, r(13, 2.6), r(13, 3.0))); ctag('no', 740, 760, 60, ramp(t, r(13, 2.9), r(13, 3.3))); g.restore(); }
  const e = ramp(t, T(14), T(14) + .5); if (e > 0) {
    g.save(); g.globalAlpha *= e; cutPlaque(g, 540, 380, 900, 230, ['Follow for more of', 'how it really works.'], 66, 1, { ls: 2 }); g.restore();
    cutPlaque(g, 540, 620, 800, 160, ["A new 'wait, really?' every day.", '@howitreallyworkstudio'], 42, ramp(t, T(14) + .5, T(14) + 1.0), { ls: 1 }); }
  g.restore(); }
function scene(t) { R.dim = 0; R.hot = [540, 700]; sceneSky(t); sceneDust(t); sceneAge(t); sceneMap(t); sceneStretch(t); sceneGlow(t); scenePay(t); sceneEnd(t); }

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
const frame = t => { R.begin(t); scene(t); R.finish(); subtitle(t); };
window.DUR = TL.total;
// loop: blend frame 0 back in over the last 0.5 s (max 30%)
window.seek = t => { frame(t); const lp = ramp(t, TL.total - .5, TL.total); if (lp > 0) { const m = R.main, keep = m.getImageData(0, 0, W, H); frame(0); const f0 = m.getImageData(0, 0, W, H), k = .3 * lp, A = keep.data, B = f0.data;
  for (let i = 0; i < A.length; i += 4) { A[i] += (B[i] - A[i]) * k; A[i + 1] += (B[i + 1] - A[i + 1]) * k; A[i + 2] += (B[i + 2] - A[i + 2]) * k; } m.putImageData(keep, 0, 0); } };
window.render = window.seek;
window.thumb = () => { R.begin(2); R.dim = 0; R.hot = [540, 700]; cam(1, 540, 800); sky(2, 260); hill(g, 1150); watcher(2, 300, 1140, 1.7);
  cutPlaque(g, 540, 430, 900, 260, ['WHY IS NIGHT', 'DARK?'], 100, 1); R.finish(); };
window.seek(0); window.ready = true; window.READY = true;
