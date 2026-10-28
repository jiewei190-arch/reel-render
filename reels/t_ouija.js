// t_ouija.js: "Why a Ouija pointer moves" in the shadow-puppet style (template #6), 1080x1920.
// Grammar from the lemo shadow-puppet demo via styles/shadowpuppet: warm flickering lamp behind a woven screen, dyed
// translucent hide pieces (multiply) with carved holes that glow, puppets on rods with hand tremor, jointed sitters with
// rivets, cut-letter plaques that drop in blurred and snap sharp, the storyteller's lacquer placard, the theatre frame.
import { createSP, cfg, W, H, TAU, clamp, lerp, ramp, win, hash, DYE, dye, hidePiece, at, rod, inkText, plaque, tag, moon, circ, ring, ell, poly, star, trem, placard, puppet, cutPlaque, stage, rivet } from './styles/shadowpuppet/shadowpuppet.js';
await Promise.all([document.fonts.load('italic 700 60px "Cormorant Garamond"')]);
cfg.hide = true;
const canvas = document.getElementById('c'), R = createSP(canvas), g = R.g;
const TL = window.TL, PH = TL.p, T = i => PH[i].start, E = i => PH[i].end;
const r = (i, d) => T(i) + d, ease = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const cam = (s, cx, cy) => R.cam(s, cx, cy);
const CANDLE = 'rgba(255,190,90,1)';
const WOOD = ['#d9a35a', '#9a5a26'], DARKW = ['#6a3a1c', '#2e160a'], SKIN = ['#f1c58a', '#d9994f'], GHOST = ['#f4ecdc', '#cfc3ad'];
const label = (t, ti, fn) => { const k = ramp(t, ti, ti + .45); if (k > 0) { g.save(); g.globalAlpha *= k; fn(k); g.restore(); } };
// act window: fades in just before its first phrase, holds until the next act has faded in (overlapping crossfades)
const act = (t, i0, i1, f = .45) => win(t, (i0 === 0 ? -1 : T(i0) - .35), (i1 + 1 < PH.length ? T(i1 + 1) + .35 : TL.total + 1), f);

// ---------------------------------------------------------------- pieces
// Ouija board: arched letter rows, YES / NO, numbers, GOOD BYE, sun and moon cut-outs. local coords, 840 x 520
const ROW1 = 'ABCDEFGHIJKLM', ROW2 = 'NOPQRSTUVWXYZ', NUMS = '1234567890';
function letterPos(ch) {
  let i = ROW1.indexOf(ch); if (i >= 0) { const x = -330 + i * 55; return [x, -100 + (x / 330) ** 2 * 70]; }
  i = ROW2.indexOf(ch); if (i >= 0) { const x = -330 + i * 55; return [x, 0 + (x / 330) ** 2 * 70]; }
  if (ch === 'Y') return [-300, -215]; if (ch === 'N') return [300, -215]; if (ch === 'G') return [0, 200];
  return [0, 0];
}
function board(x, y, s, t, o = {}) {
  const j = trem(x * .013, t, 1.1), garble = o.garble || 0;
  at(g, x + j[0], y + j[1], o.rot || 0, s, () => {
    hidePiece(g, p => { p.roundRect(-420, -270, 840, 540, 70); p.roundRect(-400, -250, 800, 500, 56);
      // carved corner suns and moons (holes glow)
      star(p, 18, 34, 10, 0, -350, -200); circ(p, -350, -200, 12);
      p.moveTo(380, -200); p.arc(350, -200, 30, 0, TAU); p.moveTo(362, -200); p.arc(340, -205, 26, 0, TAU);
      for (let k = 0; k < 9; k++) circ(p, -320 + k * 80, 232, 5);
    }, WOOD, { r: 420, lw: 3, edge: '#5a2e10' });
    const col = '#2a120a';
    [...ROW1, ...ROW2].forEach((ch, k) => {
      const [lx, ly] = letterPos(ch), jx = garble * (hash(k * 7.7 + Math.floor(t * 6)) - .5) * 26;
      inkText(g, ch, lx + jx, ly, 50, col, { ls: 0 });
    });
    NUMS.split('').forEach((ch, k) => inkText(g, ch, -250 + k * 55, 120, 40, col, { ls: 0 }));
    inkText(g, 'YES', -300, -215, 54, col, { ls: 4 }); inkText(g, 'NO', 300, -215, 54, col, { ls: 4 });
    inkText(g, 'GOOD BYE', 0, 200, 48, col, { ls: 6 });
  });
}
// planchette: heart-shaped pointer with a round window (the hole glows)
function planchette(x, y, s, t, rot = 0) {
  at(g, x, y, rot, s, () => {
    hidePiece(g, p => { p.moveTo(0, -120); p.bezierCurveTo(70, -110, 120, -10, 0, 90); p.bezierCurveTo(-120, -10, -70, -110, 0, -120); p.closePath(); circ(p, 0, -50, 30);
      for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; circ(p, Math.cos(a) * 48, -50 + Math.sin(a) * 48, 5); } }, DARKW, { r: 120, lw: 3, edge: '#1a0a04' });
    rivet(g, -50, 30, 7); rivet(g, 50, 30, 7); rivet(g, 0, 70, 7);
  });
}
// a hand on a rod: palm + four fingers + thumb, sleeve running off-stage. ang = direction the fingers point
function hand(x, y, ang, s, t, o = {}) {
  const j = trem(x * .02 + y * .01, t, 1.8);
  at(g, x + j[0], y + j[1], ang + Math.PI / 2, s, () => {
    hidePiece(g, p => { poly(p, [[-34, 70], [34, 70], [42, 600], [-42, 600]]); for (let k = 0; k < 4; k++) poly(p, [[-20, 120 + k * 90], [20, 120 + k * 90], [0, 150 + k * 90]]); }, o.sleeve || DYE.plum, { r: 80, lw: 2, edge: '#40122e' });
    hidePiece(g, p => { ell(p, 0, 20, 40, 52, 0); [-27, -9, 9, 27].forEach((fx, k) => p.roundRect(fx - 8, -70 - (k === 1 || k === 2 ? 10 : 0), 16, 70, 8)); p.roundRect(32, 0, 14, 50, 7); ell(p, 0, 20, 10, 6, 0); }, SKIN, { r: 60, lw: 2, edge: '#6a3a14' });
    rivet(g, 0, 70, 7);
  });
}
function candle(x, y, s, t, k = 0) {
  const fl = 1 + .08 * Math.sin(t * 13 + k * 2) + .05 * Math.sin(t * 29 + k);
  at(g, x, y, 0, s, () => {
    hidePiece(g, p => { p.roundRect(-22, -120, 44, 160, 6); p.roundRect(-46, 40, 92, 18, 6); for (let q = 0; q < 3; q++) circ(p, 0, -80 + q * 40, 4); }, ['#f2e3c0', '#d8bf8a'], { r: 80, lw: 2, edge: '#7a5a2a' });
    dye(g, p => { p.moveTo(0, -200 * fl); p.quadraticCurveTo(22, -150, 0, -122); p.quadraticCurveTo(-22, -150, 0, -200 * fl); }, DYE.sun, { r: 40, edge: '#a04a10', hide: false });
    rod(g, 0, 58, .7);
  });
  R.glow(x, y - 150 * s, 170 * s, CANDLE, .35);
}
function ghost(x, y, s, t, o = {}) {
  const bob = Math.sin(t * 2.2) * 14, j = trem(x * .01, t, 1.4);
  at(g, x + j[0], y + bob + j[1], .06 * Math.sin(t * 1.3), s, () => {
    hidePiece(g, p => { p.moveTo(0, -150); p.bezierCurveTo(95, -150, 110, -40, 105, 120); for (let k = 0; k < 4; k++) { const x0 = 105 - k * 52.5; p.quadraticCurveTo(x0 - 26, 90, x0 - 52.5, 125); }
      p.bezierCurveTo(-110, -40, -95, -150, 0, -150); p.closePath(); ell(p, -34, -50, 15, 22, 0); ell(p, 34, -50, 15, 22, 0); ell(p, 0, 10, 16, 20, 0);
      if (o.wave) { poly(p, [[95, -10], [160, -70 + Math.sin(t * 6) * 20], [175, -50 + Math.sin(t * 6) * 20], [100, 20]]); } }, GHOST, { r: 140, lw: 3, edge: '#7a6a50' });
    rivet(g, 0, 120, 7);
  });
  rod(g, x + j[0], y + bob + 125 * s, .8);
}
function table(x, y, s, t, o = {}) { // séance table, side view: top, pedestal, three feet, carved lattice
  const j = trem(x * .01 + 3, t, 1.2);
  at(g, x + j[0], y + j[1], o.rot || 0, s, () => {
    hidePiece(g, p => { ell(p, 0, 0, 380, 64, 0); ell(p, 0, -4, 340, 44, 0); for (let k = 0; k < 10; k++) { const a = k / 10 * TAU + (o.spin || 0); const cx = Math.cos(a) * 300, cy = Math.sin(a) * 30; if (Math.sin(a) > -.2) circ(p, cx, cy, 7); } }, WOOD, { r: 380, lw: 3, edge: '#5a2e10' });
    hidePiece(g, p => { poly(p, [[-30, 50], [30, 50], [40, 330], [-40, 330]]); for (let k = 0; k < 4; k++) poly(p, [[0, 90 + k * 60], [12, 110 + k * 60], [0, 130 + k * 60], [-12, 110 + k * 60]]); poly(p, [[-30, 320], [-190, 380], [-180, 396], [0, 350], [180, 396], [190, 380], [30, 320]]); }, DARKW, { r: 200, lw: 2, edge: '#1a0a04' });
  });
}
// Faraday's indicator: two boards stacked, a light lever pivoted on the table, its long arm the index
function indicator(x, y, s, push, t) {
  at(g, x, y, 0, s, () => {
    hidePiece(g, p => p.roundRect(-220, -20, 440, 40, 8), DARKW, { r: 220, lw: 2, edge: '#1a0a04' });
    hidePiece(g, p => { p.roundRect(-220 + push * 40, -64, 440, 40, 8); for (let k = 0; k < 5; k++) circ(p, -170 + push * 40 + k * 85, -44, 6); }, ['#e8c07a', '#c28a3e'], { r: 220, lw: 2, edge: '#5a2e10' });
    const a = -Math.PI / 2 - push * .9; // index swings the opposite way, amplified
    hidePiece(g, p => { p.moveTo(250, -10); p.lineTo(250 + Math.cos(a) * 330 + 6, -10 + Math.sin(a) * 330); p.lineTo(250 + Math.cos(a) * 330 - 6, -10 + Math.sin(a) * 330); p.lineTo(244, -10); p.closePath(); }, DYE.red, { r: 100, lw: 2, edge: '#7a1c1c', hide: false });
    dye(g, p => { p.moveTo(250, -10); p.lineTo(180 + push * 40, -44); p.lineTo(184 + push * 40, -38); p.lineTo(250, -4); p.closePath(); }, ['#3a1608'], { edge: false });
    rivet(g, 250, -10, 9);
    // scale marks behind the index tip
    for (let k = -3; k <= 3; k++) { const b = -Math.PI / 2 + k * .22; dye(g, p => circ(p, 250 + Math.cos(b) * 360, -10 + Math.sin(b) * 360, 6), ['#3a1608'], { edge: false }); }
  });
}
function arrowPiece(x0, y0, x1, y1, w, cols = DYE.red, a = 1) {
  const ang = Math.atan2(y1 - y0, x1 - x0), L = Math.hypot(x1 - x0, y1 - y0);
  at(g, x0, y0, ang, 1, () => dye(g, p => poly(p, [[0, -w / 2], [L - w * 1.6, -w / 2], [L - w * 1.6, -w * 1.3], [L, 0], [L - w * 1.6, w * 1.3], [L - w * 1.6, w / 2], [0, w / 2]]), cols, { r: L, edge: '#7a1c1c', a, hide: false }));
}
function mirror(x, fn) { g.save(); g.translate(x, 0); g.scale(-1, 1); g.translate(-x, 0); fn(); g.restore(); }
const SITTER = { robe: ['#4a5f9a', '#2a3a6a'], sleeve: ['#5f78b8', '#34508a'] };
const SITTER2 = { robe: DYE.plum, sleeve: DYE.red };
const FARADAY = { robe: ['#3a3446', '#1e1a28'], sleeve: ['#4a4458', '#2a2436'] };

// ---------------------------------------------------------------- acts
// A: p0-p1 hook. Frame 0: the board, the planchette already gliding, two hands on it, candles; the theatre frame
function actHook(t) {
  const a = act(t, 0, 1); if (a <= 0) return; g.save(); g.globalAlpha = a;
  cam(1 + .06 * ramp(t, 0, E(1)), 540, 860);
  candle(200, 600, 1.0, t, 0); candle(880, 600, 1.0, t, 1);
  board(540, 960, 1.04, t);
  const path = ['Y', 'B', 'O', 'O', 'N'], seg = (t + 1.2) / 1.5, i0 = Math.floor(seg) % path.length, i1 = (i0 + 1) % path.length, u = ease(seg - Math.floor(seg));
  const P0 = letterPos(path[i0]), P1 = letterPos(path[i1]), px = 540 + lerp(P0[0], P1[0], u) * 1.04, py = 960 + lerp(P0[1], P1[1], u) * 1.04 + 50;
  planchette(px, py, .95, t, .12 * Math.sin(t * 1.4));
  R.glow(px, py - 48, 70, 'rgba(255,230,160,1)', .5);
  hand(px - 70, py + 40, -Math.PI / 2 + .35, .95, t); hand(px + 70, py + 40, -Math.PI / 2 - .35, .95, t, { sleeve: SITTER.sleeve });
  const gk = ramp(t, r(1, .2), r(1, .9));
  if (gk > 0) { g.save(); g.globalAlpha *= gk; ghost(870, 380 + (1 - gk) * 60, .8, t); tag(g, '?', 720, 300, 64); g.restore(); }
  cutPlaque(g, 540, 300, 760, 150, ['WHO MOVES IT?'], 80, t < r(1, 1.6) ? 1 : 0);
  g.restore();
}
// B: p2 Faraday, 1853
function actFaraday(t) {
  const a = act(t, 2, 2); if (a <= 0) return; g.save(); g.globalAlpha = a;
  cam(1, 540, 800);
  candle(860, 1150, 1.1, t, 3);
  const w = ramp(t, T(2), r(2, 1.6));
  puppet(g, lerp(160, 400, ease(w)), 1480, 3.6, t, { ...FARADAY, hand: [lerp(40, 70, w), lerp(-150, -250, ramp(t, r(2, 2), r(2, 3)))], head: -.08 });
  cutPlaque(g, 680, 420, 520, 170, ['1853'], 110, ramp(t, T(2) + .1, T(2) + .6));
  label(t, r(2, 1.2), () => tag(g, 'Michael Faraday', 640, 640, 48));
  label(t, r(2, 2.6), () => { inkText(g, '?', 700, 860, 160, '#3a1608'); });
  g.restore();
}
// C: p3-p7 the séance table, Faraday's indicator, the table stops
function actTable(t) {
  const a = act(t, 3, 7); if (a <= 0) return; g.save(); g.globalAlpha = a;
  const zin = ramp(t, T(4) - .2, r(4, 1.2)) * (1 - ramp(t, T(7), r(7, 1)));
  cam(lerp(1, 1.55, ease(zin)), 540, lerp(820, 860, zin));
  const turning = t < T(4) ? 1 : 0, spin = (t - T(3)) * 1.6 * (t < T(7) + 1 ? 1 : 0) * (1 - ramp(t, r(7, .8), r(7, 1.6)));
  const sway = turning * .05 * Math.sin(t * 2.6);
  candle(540, 560, .9, t, 4);
  table(540, 1000, .8, t, { rot: sway, spin });
  // indicator on the tabletop (from p4)
  const ik = ramp(t, T(4) + .3, r(4, 1.2));
  const push = (t > T(5) && t < r(7, .8)) ? (.5 + .5 * Math.sin((t - T(5)) * 2.4)) * (t < T(6) ? .9 : .5) : 0;
  if (ik > 0) { g.save(); g.globalAlpha *= ik; indicator(520, 960 - (1 - ik) * 60, .62, push, t); g.restore(); }
  // sitters: hands resting on the table (and on the indicator), heads turn to watch it in p7
  const look = ramp(t, T(7), r(7, .8));
  puppet(g, 110, 1420, 3.2, t, { ...SITTER, hand: [lerp(62, 70, push), -131 + Math.sin(t * 2.6) * 4 * turning], hand2: [40, -110], head: .25 * look });
  mirror(970, () => puppet(g, 970, 1420, 3.2, t, { ...SITTER2, hand: [62, -131 + Math.sin(t * 2.6 + 1) * 4 * turning], hand2: [40, -110], head: .25 * look }));
  cam(1, 540, 800);
  // labels
  label(t, r(3, .4), () => turning && cutPlaque(g, 540, 330, 820, 150, ['TABLE-TURNING'], 76, ramp(t, r(3, .4), r(3, 1))));
  if (t > T(3) && t < T(4)) for (let k = 0; k < 2; k++) { const an = -2.6 + k * 2.2 + t * 2; arrowPiece(540 + Math.cos(an) * 420, 1000 + Math.sin(an) * 90, 540 + Math.cos(an + .5) * 420, 1000 + Math.sin(an + .5) * 90, 16, DYE.card, .8); }
  label(t, r(4, 1.0), () => t < T(5) && cutPlaque(g, 540, 1400, 640, 110, ["Faraday's pointer"], 54, 1));
  label(t, r(5, .3), () => t < T(6) && plaque(g, 540, 330, 860, 200, ['table moves hands?', 'or hands move table?'], 54));
  label(t, r(6, .2), () => t < T(7) && cutPlaque(g, 540, 330, 760, 150, ['THE HANDS'], 84, 1));
  label(t, r(6, 1.4), () => t < T(7) && cutPlaque(g, 540, 1400, 640, 110, ['ever so slightly'], 54, 1));
  label(t, r(7, 1.2), () => cutPlaque(g, 540, 330, 860, 150, ['THE TABLE STOPS'], 76, 1));
  g.restore();
}
// D: p8-p9 Carpenter names it: idea -> movement. A big profile watcher; a dotted signal runs from head to hand
function actIdeo(t) {
  const a = act(t, 8, 9); if (a <= 0) return; g.save(); g.globalAlpha = a;
  cam(1, 540, 800);
  const sig = ((t - T(8)) * .55) % 1;
  const twitch = .5 + .5 * Math.sin(t * 9);
  puppet(g, 330, 1500, 5.2, t, { robe: DYE.green, sleeve: DYE.red, hand: [110 + 6 * twitch, -150], hand2: [-24, -62], head: -.05 });
  // idea: a lamp glow at the head
  R.glow(370, 690, 160, 'rgba(255,220,140,1)', .55 + .2 * Math.sin(t * 3));
  dye(g, p => star(p, 26, 54, 8, t * .5, 370, 700), DYE.sun, { r: 60, edge: '#a04a10', hide: false });
  // dotted nerve path head -> shoulder -> hand
  const pts = [[380, 760], [360, 860], [380, 960], [440, 1030], [520, 1060], [590, 1050], [700, 1050]];
  for (let k = 0; k < 28; k++) { const u = k / 27, seg = u * (pts.length - 1), q = Math.floor(seg), f = seg - q, P0 = pts[Math.min(q, pts.length - 1)], P1 = pts[Math.min(q + 1, pts.length - 1)];
    const x = lerp(P0[0], P1[0], f), y = lerp(P0[1], P1[1], f), on = Math.abs(u - sig) < .08 ? 1 : .35; dye(g, p => circ(p, x, y, on > .5 ? 9 : 5), on > .5 ? DYE.sun : ['#3a1608'], { edge: false, a: on, hide: false }); }
  cutPlaque(g, 540, 330, 900, 160, ['IDEOMOTOR EFFECT'], 76, ramp(t, r(8, 1.6), r(8, 2.3)));
  label(t, r(8, .2), () => t < r(8, 1.8) && tag(g, 'William Carpenter, 1852', 540, 330, 44));
  label(t, T(9) + .3, () => { tag(g, 'idea', 640, 600, 44); tag(g, 'movement', 840, 940, 44); });
  label(t, r(9, 2.2), () => { dye(g, p => { ring(p, 70, 84, 800, 1180); poly(p, [[850, 1240], [866, 1226], [960, 1330], [944, 1344]]); }, DARKW, { r: 120, edge: '#1a0a04' }); arrowPiece(770, 1180, 770 + 30 * twitch + 10, 1180, 10, DYE.red); tag(g, 'too small to notice', 760, 1380, 42); });
  g.restore();
}
// E: p10-p11 back to the board: tiny nudges from four hands add up; the answer plaque
function actNudge(t) {
  const a = act(t, 10, 11); if (a <= 0) return; g.save(); g.globalAlpha = a;
  cam(1.05, 540, 860);
  candle(170, 520, .9, t, 5); candle(910, 520, .9, t, 6);
  board(540, 900, 1.05, t);
  const path = ['Y', 'E', 'S', 'Y'], seg = (t - T(10)) / 1.6, i0 = clamp(Math.floor(seg), 0, 2), u = ease(seg - i0);
  const P0 = letterPos(path[i0]), P1 = letterPos(path[i0 + 1]), px = 540 + lerp(P0[0], P1[0], u) * 1.05, py = 900 + lerp(P0[1], P1[1], u) * 1.05 + 50;
  planchette(px, py, .95, t, .1 * Math.sin(t));
  R.glow(px, py - 48, 70, 'rgba(255,230,160,1)', .5);
  [[-80, 50, -Math.PI / 2 + .45, SITTER.sleeve], [80, 50, -Math.PI / 2 - .45, SITTER2.sleeve], [-40, 90, -Math.PI / 2 + .15, DYE.plum], [40, 90, -Math.PI / 2 - .15, DYE.green]].forEach(([dx, dy, an, sl], k) => hand(px + dx, py + dy, an, .8, t + k, { sleeve: sl }));
  if (t < T(11)) { // little nudge arrows, each a different direction, summing to the motion
    const dirx = P1[0] - P0[0], diry = P1[1] - P0[1], L = Math.hypot(dirx, diry) || 1;
    for (let k = 0; k < 4; k++) { const an = Math.atan2(diry, dirx) + (k - 1.5) * .5, ax = px + (k - 1.5) * 60, ay = py - 170; arrowPiece(ax, ay, ax + Math.cos(an) * 50, ay + Math.sin(an) * 50, 8, DYE.card, .9); }
    label(t, r(10, .8), () => cutPlaque(g, 540, 1420, 560, 110, ['tiny nudges'], 56, 1));
  }
  label(t, T(11) + .3, () => cutPlaque(g, 540, 320, 900, 160, ['YOUR OWN HANDS'], 80, ramp(t, T(11) + .3, T(11) + .9)));
  g.restore();
}
// F: p12 blindfold test: blindfolded sitters, the planchette wanders, letters scramble
function actBlind(t) {
  const a = act(t, 12, 12); if (a <= 0) return; g.save(); g.globalAlpha = a;
  cam(1, 540, 860);
  board(540, 1000, .9, t, { garble: ramp(t, r(12, 1.6), r(12, 2.6)) });
  const wx = 540 + 220 * Math.sin(t * 1.7) * Math.cos(t * .6), wy = 1020 + 80 * Math.sin(t * 2.3);
  planchette(wx, wy, .8, t, .6 * Math.sin(t * 1.1));
  for (const [x, opts, mir] of [[150, SITTER, false], [930, SITTER2, true]]) {
    const draw = () => { puppet(g, x, 1500, 3.0, t, { ...opts, hand: [130, -150], hand2: [60, -110], head: .1 });
      at(g, x + 22 * 3.0, 1500 - 152 * 3.0, 0, 3.0, () => dye(g, p => p.roundRect(-30, -12, 60, 22, 8), ['#241338', '#120a20'], { r: 40, edge: '#07030c', hide: false })); };
    mir ? mirror(x, draw) : draw();
  }
  cutPlaque(g, 540, 330, 760, 150, ['BLINDFOLDED'], 84, ramp(t, T(12) + .1, T(12) + .6));
  label(t, r(12, 2.6), () => tag(g, 'the board stops working', 540, 560, 46));
  g.restore();
}
// G: p13 the 2012 study: two carved bars, guessing aloud 50% vs the board 65%
function actStudy(t) {
  const a = act(t, 13, 13); if (a <= 0) return; g.save(); g.globalAlpha = a;
  cam(1, 540, 820);
  cutPlaque(g, 540, 330, 760, 150, ['A 2012 STUDY'], 84, ramp(t, T(13) + .1, T(13) + .6));
  const base = 1300, k1 = ease(ramp(t, r(13, 3.6), r(13, 5.0))), k2 = ease(ramp(t, r(13, 1.2), r(13, 2.8)));
  [[340, 500 * k1, ['#a9bbe4', '#5f78b8'], '50%', 'guessing'], [740, 650 * k2, DYE.sun, '65%', 'with the board']].forEach(([x, h, cols, pct, lab], k) => {
    if (h > 2) hidePiece(g, p => { p.roundRect(x - 110, base - h, 220, h, 14); for (let q = 0; q < Math.floor(h / 70); q++) circ(p, x, base - 40 - q * 70, 10); }, cols, { r: 300, lw: 3, edge: '#3a2a10' });
    rod(g, x, base, .8);
    if (h > 40) inkText(g, pct, x, base - h - 50, 64, '#2a120a', { ls: 2 });
    tag(g, lab, x, base + 70, 40);
  });
  g.restore();
}
// H: p14-p15 the ghost waves goodbye; end card
function actEnd(t) {
  const a = act(t, 14, 15); if (a <= 0) return; g.save(); g.globalAlpha = a;
  cam(1, 540, 800);
  candle(180, 1200, 1.0, t, 7); candle(900, 1200, 1.0, t, 8);
  const gx = lerp(540, 820, ramp(t, r(14, 1.2), r(14, 2.2)));
  ghost(gx, 760, 1.15, t, { wave: true });
  if (t < T(15)) { const xk = ramp(t, r(14, .6), r(14, 1.2)); if (xk > 0) dye(g, p => { poly(p, [[gx - 150, 600], [gx - 120, 580], [gx + 150, 940], [gx + 120, 960]]); poly(p, [[gx + 120, 580], [gx + 150, 600], [gx - 120, 960], [gx - 150, 940]]); }, DYE.red, { r: 150, edge: '#7a1c1c', a: xk * .85, hide: false });
    label(t, r(14, .2), () => cutPlaque(g, 540, 330, 760, 150, ['NO GHOSTS'], 90, 1)); }
  else {
    board(330, 1010, .4, t);
    cutPlaque(g, 540, 360, 900, 270, ['Follow for more of', 'how it really works.'], 68, ramp(t, T(15) + .05, T(15) + .7), { ls: 3 });
  }
  g.restore();
}

const kStage = t => 1 - ramp(t, E(1) - .2, E(1) + .6);
function scene(t) { R.dim = 0; R.hot = [540, 860]; actHook(t); actFaraday(t); actTable(t); actIdeo(t); actNudge(t); actBlind(t); actStudy(t); actEnd(t); }
function subtitle(t) {
  let cur = 0; for (let i = 0; i < PH.length; i++) if (t >= PH[i].start - .05) cur = i;
  const p = PH[cur], nx = cur + 1 < PH.length ? PH[cur + 1].start : TL.total + 1;
  const a = (cur === 0 ? 1 : ramp(t, p.start - .05, p.start + .2)) * (1 - ramp(t, nx - .2, nx - .05));
  placard(R.main, p.cap, a);
}
window.DUR = TL.total;
window.seek = t => { R.begin(t); scene(t); R.finish(); stage(R.main, kStage(t), t); subtitle(t); };
// cover: the board with the glowing planchette, two hands, candles, the ghost; 3 words in a cut plaque
window.thumb = () => {
  const t = 2.0; R.begin(t); R.dim = 0; R.hot = [540, 900];
  cam(1, 540, 800);
  candle(200, 790, 1.0, t, 0); candle(880, 790, 1.0, t, 1);
  board(540, 1080, 1.0, t);
  const [lx, ly] = letterPos('B'); const px = 540 + lx, py = 1080 + ly + 50;
  planchette(px, py, 1.05, t, .1); R.glow(px, py - 50, 90, 'rgba(255,230,160,1)', .6);
  hand(px - 75, py + 45, -Math.PI / 2 + .35, 1.0, t); hand(px + 75, py + 45, -Math.PI / 2 - .35, 1.0, t, { sleeve: SITTER.sleeve });
  ghost(800, 1530, .62, t);
  cutPlaque(g, 540, 430, 900, 260, ['WHO MOVES', 'THE POINTER?'], 92, 1);
  R.finish(); stage(R.main, 1, t);
};
window.render = window.seek; window.seek(0); window.ready = true;
