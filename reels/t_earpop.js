// t_earpop.js: "Why do your ears pop on a plane?" in template #18 handdrawn "Japan heat wave" (demo101) grammar.
// 1080x1920 Canvas2D, deterministic. Field-sketchbook pages: an ear cross-section whose eardrum, tube and pressure dots
// come from one state function; the demo's chart (flight profile), rain-gauge cylinders, measurement boxes and red seals.
import { createFB, W, H, C, clamp, lerp, ramp, ss, eo, bo, hash } from './styles/fieldbook/fieldbook.js';
await Promise.all(['400 40px "Kalam"', '700 40px "Kalam"', '400 20px "Courier Prime"', '700 20px "Courier Prime"', '500 40px "Nunito"', '700 40px "Nunito"'].map(f => document.fonts.load(f)));
const TL = window.TL, PH = TL.p, s = i => PH[i].start, e = i => PH[i].end;
const F = createFB(document.getElementById('c')), g = F.g, R = ramp;

// ---------- pages: [start, end, page no] ----------
const PG = [[0, s(2) - .1, 1], [s(2) - .1, s(4) - .1, 2], [s(4) - .1, s(6) - .1, 3], [s(6) - .1, s(8) - .1, 4], [s(8) - .1, s(10) - .1, 5], [s(10) - .1, s(12) - .1, 6], [s(12) - .1, s(13) - .1, 7], [s(13) - .1, s(15) - .1, 8], [s(15) - .1, TL.total + 1, 9]];
const pageAt = t => PG.find(p => t >= p[0] && t < p[1]) || PG[PG.length - 1];
const LBY = 300, HDY = 405, CAPY = 1235;

// ---------- the ear (local frame about 1000 x 720) ----------
const PINNA = [[150, 250], [118, 168], [70, 128], [36, 200], [44, 330], [76, 432], [118, 500], [152, 470], [140, 400], [150, 350]];
const CAN_U = [[150, 250], [300, 262], [436, 244]], CAN_L = [[150, 350], [300, 340], [436, 356]];
const CAV = [[442, 232], [468, 168], [540, 146], [612, 166], [644, 226], [646, 330], [626, 398], [592, 420], [522, 420], [470, 392], [442, 368]];
const TB = F.dense([[612, 404], [690, 478], [772, 556], [858, 630]], 8);
const NOSE = [[830, 640], [880, 600], [948, 612], [978, 676], [944, 724], [870, 716]];
const inPoly = (P, x, y) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
const DOTS_IN = [], DOTS_OUT = [];
for (let i = 0; DOTS_IN.length < 30 && i < 900; i++) { const x = 460 + hash(i * 3.1) * 180, y = 160 + hash(i * 7.3) * 255; if (inPoly(CAV, x, y) && x > 470 && DOTS_IN.every(([a, b]) => Math.hypot(a - x, b - y) > 26)) DOTS_IN.push([x, y]); }
for (let i = 0; DOTS_OUT.length < 30 && i < 900; i++) { const x = 20 + hash(i * 5.7) * 400, y = 140 + hash(i * 2.9) * 300; const inCan = x > 160 && x < 420 && y > 270 && y < 334; const outside = x < 40 || (x < 150 && !inPoly(PINNA, x, y) && (y < 120 || y > 510)); if ((inCan || outside) && DOTS_OUT.every(([a, b]) => Math.hypot(a - x, b - y) > 24)) DOTS_OUT.push([x, y]); }
const offs = (P, d) => P.map((p, i) => { const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)]; const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [p[0] - dy / l * d, p[1] + dx / l * d]; });
const tubeW = (o, u) => lerp(16, 3 + o * 15, Math.sin(u * Math.PI) ** .6);
const tubeWalls = o => { const n = TB.length; return [TB.map((p, i) => offs(TB, tubeW(o, i / (n - 1)))[i]), TB.map((p, i) => offs(TB, -tubeW(o, i / (n - 1)))[i])]; };

// st: {k draw-on, b drum bulge (+ out / - in), o tube open 0..1, pin, pout (pressure 0..1.3), bub {u 0..1 along tube from throat, a}, pop 0..1, waves 0..1, mute 0..1, t}
function ear(st) {
  const k = st.k ?? 1, t = st.t || 0, b = st.b || 0, o = st.o || 0;
  const ow = { col: C.ink, w: 2.4 };
  // bone around the middle ear (graphite hatch), then the air pocket in paper
  F.hatch([[400, 110], [780, 110], [800, 470], [700, 520], [430, 460]], 'graph', { k: ss(R(k, .2, .5)), alpha: .32 });
  g.save(); F.path(CAV); g.fillStyle = F.paperPat(); g.globalAlpha = F.S.A * ss(R(k, .3, .3)); g.fill(); g.restore();
  const [WA, WB] = tubeWalls(o);
  g.save(); F.path(WA.concat(WB.slice().reverse())); g.fillStyle = F.paperPat(); g.globalAlpha = F.S.A * ss(R(k, .45, .3)); g.fill(); g.restore();
  // pressure dots: count follows pressure (the demo's stippled density)
  const da = ss(R(k, .6, .3));
  if (da > 0) { const nin = Math.round(DOTS_IN.length * clamp((st.pin ?? .75) / 1.3)), nout = Math.round(DOTS_OUT.length * clamp((st.pout ?? .75) / 1.3));
    DOTS_IN.slice(0, nin).forEach(([x, y], i) => F.circ(x + Math.sin(t * 3.4 + i) * 9, y + Math.cos(t * 2.9 + i * 2) * 9, 5, { col: C.navy, w: 2, alpha: da * .9, wob: .3, seed: i }));
    DOTS_OUT.slice(0, nout).forEach(([x, y], i) => F.circ(x + Math.sin(t * 3.1 + i * 3) * 9, y + Math.cos(t * 2.6 + i) * 9, 5, { col: C.red, w: 2, alpha: da * .8, wob: .3, seed: 40 + i })); }
  // sound waves into the canal (muffled = they fade at the drum)
  const wv = st.waves ?? .8; if (wv > 0) for (let i = 0; i < 4; i++) { const u = (t * .7 + i / 4) % 1, x = lerp(60, 420, u), P = []; for (let j = 0; j <= 10; j++) { const a = -0.7 + j / 10 * 1.4; P.push([x + Math.cos(a) * 26, 300 + Math.sin(a) * 34]); } F.pencil(P, { col: C.graph, w: 2.4, alpha: wv * Math.sin(u * Math.PI) * (1 - (st.mute || 0) * u), wob: .3 }); }
  // line work
  F.pencil(PINNA, { ...ow, draw: ss(R(k, 0, .35)), seed: 1 });
  F.pencil(CAN_U, { ...ow, draw: ss(R(k, .05, .3)), seed: 2 }); F.pencil(CAN_L, { ...ow, draw: ss(R(k, .07, .3)), seed: 3 });
  F.pencil(CAV, { ...ow, close: true, draw: ss(R(k, .2, .35)), seed: 4 });
  F.pencil(WA, { ...ow, w: 2, draw: ss(R(k, .35, .3)), seed: 5 }); F.pencil(WB, { ...ow, w: 2, draw: ss(R(k, .37, .3)), seed: 6 });
  F.pencil(NOSE, { col: C.graph, w: 1.8, close: true, draw: ss(R(k, .45, .3)), seed: 7 });
  // eardrum: a red membrane that bulges with the pressure difference
  const D = []; for (let i = 0; i <= 16; i++) { const u = i / 16; D.push([440 - b * 46 * Math.sin(u * Math.PI), lerp(236, 364, u)]); }
  F.pencil(D, { col: C.red, w: 5, draw: ss(R(k, .25, .3)), wob: .4, seed: 8 });
  // ossicles: hammer on the drum, anvil, stirrup
  const ok = ss(R(k, .4, .3)), hx = 440 - b * 46; F.pencil([[hx + 4, 300], [500, 226]], { w: 4, draw: ok, seed: 9 }); F.circ(504, 220, 13, { w: 2.2, draw: ok, seed: 10 }); F.pencil([[515, 214], [552, 210], [566, 236]], { w: 3.4, draw: ok, seed: 11 }); F.pencil([[566, 238], [590, 252], [612, 246]], { w: 3, draw: ok, seed: 12 });
  // inner ear: semicircular loops and the cochlea spiral
  const ik = ss(R(k, .5, .4)); for (let j = 0; j < 3; j++) F.circ(690 + j * 26, 170 - j * 12, 24, { col: C.graph, w: 1.6, draw: ik, seed: 13 + j });
  const SP = []; for (let i = 0; i <= 60; i++) { const a = i / 60 * Math.PI * 5, r = 46 * (1 - i / 75); SP.push([720 + Math.cos(a) * r, 290 + Math.sin(a) * r]); } F.pencil(SP, { col: C.graph, w: 1.8, draw: ik, seed: 16 });
  // the bubble travelling along the tube
  if (st.bub && st.bub.a > 0) { const u = clamp(st.bub.u), P = TB[Math.round((1 - u) * (TB.length - 1))]; const r = 13 + (st.bub.sq || 0) * -4; g.save(); g.globalAlpha = F.S.A * st.bub.a; F.circ(P[0], P[1], r, { col: C.navy, w: 2.6, wob: .3 }); F.pencil([[P[0] - 5, P[1] - 6], [P[0] - 1, P[1] - 9]], { col: C.navy, w: 2, wob: 0 }); g.restore(); }
  if (st.pop > 0 && st.pop < 1) { const a = Math.sin(st.pop * Math.PI); for (let i = 0; i < 9; i++) { const an = i / 9 * Math.PI * 2, r0 = 22 + st.pop * 30, r1 = r0 + 26; F.pencil([[612 + Math.cos(an) * r0, 380 + Math.sin(an) * r0], [612 + Math.cos(an) * r1, 380 + Math.sin(an) * r1]], { col: C.red, w: 3.4, alpha: a, wob: .2 }); } }
}
const note = (txt, x, y, tx, ty, k, o = {}) => { if (k <= 0) return; const { col = C.ink, size = 36, align = 'left' } = o; F.pencil([[x + (align === 'left' ? -10 : 10), y - size * .3], [tx, ty]], { col: C.graph, w: 1.2, draw: ss(clamp(k * 2)), wob: .3 }); F.txt(txt, x, y, { size, f: 'hand', col, write: ss(R(k, .3, .7)), align }); };
// draws the ear at (x,y) with scale sc; returns a mapper from local to page coords for notes
const place = (x, y, sc, st) => { g.save(); g.translate(x, y); g.scale(sc, sc); ear(st); g.restore(); return (lx, ly) => [x + lx * sc, y + ly * sc]; };

// ---------- pressure story (absolute time) ----------
function press(t) {
  const st = { pin: 1, pout: 1, b: 0, o: 0, bub: null, pop: 0, t };
  // climb: cabin pressure falls (s4..s6), drum bulges out (s6), swallow lets air out (s7)
  const fall = ss(R(t, s(4) + .5, s(6) - s(4))); st.pout = lerp(1, .75, fall); st.pin = 1;
  if (t > s(7) + .4) { const r = ss(R(t, s(7) + .7, .8)); st.pin = lerp(1, .75, r); }
  // descent: cabin pressure rises back (s8..s9); inside stays low until the fix (s12)
  if (t > s(8)) { st.pout = lerp(.75, 1, ss(R(t, s(8) + .3, 2.6))); }
  if (t > s(12)) { st.pin = lerp(.75, 1, ss(R(t, s(12) + 2.6, 1.0))); }
  st.b = clamp((st.pin - st.pout) * 4, -1, 1);
  // tube openings: brief swallow pulses
  const pulse = (t0, d = 1.1) => Math.sin(Math.PI * clamp((t - t0) / d));
  st.o = Math.max(pulse(s(3) + 1.7), pulse(s(7) + .3, 1.4), pulse(s(12) + 1.6, 1.6));
  if (t > s(7) && t < s(7) + 1.9) { const u = ss(R(t, s(7) + .35, 1.3)); st.bub = { u: 1 - u, a: Math.sin(Math.PI * clamp(u * 1.05)) }; }
  if (t > s(12) + 1.5 && t < s(12) + 3.3) { const u = ss(R(t, s(12) + 1.6, 1.2)); st.bub = { u, a: 1 - ss(R(t, s(12) + 2.7, .3)) }; st.pop = R(t, s(12) + 2.7, .55); }
  if (t > s(7) + 1.6 && t < s(7) + 2.4) st.pop = R(t, s(7) + 1.6, .55);
  return st;
}
// hook loop (page 1 and the end dissolve): the bubble squeezes in and pops, every 2.6 s
const hookState = t => { const c = (t + .9) % 2.6; const u = ss(clamp(c / 1.5)); return { pin: .8 + .2 * ss(R(c, 1.5, .4)), pout: 1, b: -.6 * (1 - ss(R(c, 1.5, .4))), o: Math.sin(Math.PI * clamp(c / 1.8)), bub: { u, a: 1 - ss(R(c, 1.45, .2)) }, pop: R(c, 1.5, .55), waves: 0, t, k: 1 }; };

// ---------- shared devices ----------
function caption(t, o = {}) { if (PREV) return; let ci = -1; PH.forEach((p, k) => { if (t >= p.start - .05) ci = k; }); if (ci < 0) return; const p = pageAt(t); if (PH[ci].start < p[0] - .15) return; F.body(PH[ci].cap, 80, o.y || CAPY, 800, t - PH[ci].start + .05, { size: 48, cps: 120, ...o }); }
function chapter(t, label, head, t0) { F.label(label, 80, LBY, t - t0); F.head(head, 76, HDY, t - t0 - .35, { size: 84 }); }
// the demo's chart: altitude over a flight; plane line (graphite) and cabin line (red, dashed). maps 0..1 time, feet
const PROF = u => u < .3 ? ss(u / .3) : u < .62 ? 1 : 1 - ss((u - .62) / .33);
const CAB = u => PROF(u) * 8 / 35;
function profile(x, y, w, h, t, a, um, o = {}) {
  if (a <= 0) return; const P = [], Q = []; for (let i = 0; i <= 60; i++) { const u = i / 60; P.push([x + u * w, y + h - PROF(u) * h]); Q.push([x + u * w, y + h - CAB(u) * h]); }
  F.pencil([[x, y - 10], [x, y + h], [x + w + 10, y + h]], { w: 1.6, col: C.graph, draw: a });
  F.pencil(P, { w: 2.6, draw: a, seed: 3 }); F.pencil(Q, { col: C.red, w: 2.4, dash: [10, 7], draw: ss(R(a, .3, .7)), seed: 4 });
  if (o.hi) { const H0 = o.hi[0], H1 = o.hi[1], S = []; for (let i = 0; i <= 30; i++) { const u = lerp(H0, H1, i / 30); S.push([x + u * w, y + h - PROF(u) * h]); } F.pencil(S, { col: C.red, w: 6, draw: o.hk ?? 1, wob: .5 }); }
  if (um != null) { const u = clamp(um), px = x + u * w, py = y + h - PROF(u) * h, ang = Math.atan2(-(PROF(clamp(u + .01)) - PROF(clamp(u - .01))) * h, .02 * w); plane(px, py - 6 + Math.sin(t * 3.1) * 8, o.ps || 1, ang + Math.sin(t * 2.3) * .08); }
}
function plane(x, y, sc, ang) { g.save(); g.translate(x, y); g.rotate(ang); g.scale(sc, sc); const body = [[-34, 0], [-26, -7], [26, -7], [36, -2], [36, 3], [-30, 5]];
  F.hatch(body, 'navyL', { alpha: .7 }); F.pencil(body, { close: true, w: 2, wob: .3 }); F.pencil([[-4, -5], [10, -22], [16, -22], [8, -4]], { w: 2, wob: .3 }); F.pencil([[-2, 3], [12, 16], [18, 16], [8, 2]], { w: 2, wob: .3 }); F.pencil([[-28, -6], [-36, -20], [-30, -20], [-20, -7]], { w: 2, wob: .3 }); g.restore(); }
// bottom strip (text-free, below the captions): a tiny flight profile with the plane riding the story
const storyU = t => t < s(4) ? .0 : t < s(8) ? lerp(.02, .45, R(t, s(4), s(8) - s(4))) : t < s(13) ? lerp(.6, .95, R(t, s(8), s(13) - s(8))) : 1;
function strip(t, a) { if (a <= 0) return; F.alpha(F.S.A * a); profile(130, 1450, 760, 120, t, 1, storyU(t), { ps: .8 }); F.alpha(BASE); }

// ---------- pages ----------
function page1(t) {
  F.label('FIELD NOTES  ·  FLIGHT', 80, LBY, 9);
  const w1 = F.txt('That ', 74, 430, { size: 112, f: 'hand', rot: -.015 }); F.txt('pop', 74 + w1, 426, { size: 112, f: 'hand', col: C.red, rot: -.015 }); F.txt('is a bubble of air.', 74, 540, { size: 92, f: 'hand', rot: -.015 });
  F.line(84, 566, 800, 558, { col: C.red, w: 2.6, draw: ss(R(t, 0, .6)), wob: .6 });
  F.seal('EAR', 900, 400, ss(R(t, .3, .35)), { size: 62, round: true, f: 'mono', fs: 30 });
  // big red hatched circle (the demo's sun) behind the cross-section
  const ring = []; for (let i = 0; i <= 48; i++) { const a = i / 48 * Math.PI * 2; ring.push([560 + Math.cos(a) * 250, 860 + Math.sin(a) * 250]); } F.hatch(ring, 'red', { alpha: .45 }); F.pencil(ring, { col: C.red, w: 2, seed: 2, alpha: .7 });
  const st = hookState(t); place(70, 600, .82, st); g.save(); g.translate(880, 680); g.scale(1.4, 1.4); g.translate(-880, -680); planeWindow(880, 680, t); g.restore();
  if (t > s(1) - .2) { F.box(80, 1064, 340, 110, ss(R(t, s(1) - .2, .5))); F.txt('Why do ears pop', 106, 1110, { size: 34, f: 'hand', write: ss(R(t, s(1), .7)) }); F.txt('on a plane?', 106, 1152, { size: 34, f: 'hand', col: C.red, write: ss(R(t, s(1) + .4, .5)) }); }
  caption(t);
}
// "on a plane" cue (frame 0): an airliner window, clouds sliding past, a seatbelt sign above it
function planeWindow(x, y, t) { const w = 120, h = 168, O = []; for (let i = 0; i <= 40; i++) { const a = i / 40 * Math.PI * 2; O.push([x + Math.cos(a) * w / 2, y + Math.sin(a) * h / 2]); }
  const I = O.map(([a, b]) => [x + (a - x) * .78, y + (b - y) * .8]); F.hatch(O, 'graph', { alpha: .45 }); g.save(); F.path(I); g.fillStyle = F.paperPat(); g.globalAlpha = F.S.A; g.fill(); g.clip(); F.hatch(I, 'navyL', { alpha: .55 });
  for (let i = 0; i < 3; i++) { const cx = x + 80 - ((t * 60 + i * 70) % 220), cy = y - 30 + i * 34; F.pencil([[cx - 26, cy], [cx - 16, cy - 12], [cx, cy - 16], [cx + 14, cy - 10], [cx + 26, cy]], { w: 1.8, wob: .4 }); } g.restore();
  F.pencil(O, { close: true, w: 2.4, seed: 51 }); F.pencil(I, { close: true, w: 1.8, seed: 52 });
  F.rect(x - 52, y - 150, 104, 50, { w: 2, seed: 53 }); F.circ(x - 24, y - 125, 10, { col: C.red, w: 2 }); F.pencil([[x - 2, y - 136], [x - 2, y - 114], [x + 18, y - 114]], { col: C.red, w: 2.4, wob: .3 }); F.pencil([[x + 10, y - 132], [x + 30, y - 132], [x + 30, y - 118]], { col: C.red, w: 2.4, wob: .3 }); }
function page2(t, p) {
  chapter(t, 'NO. 01 — THE MIDDLE EAR', 'A pocket of air.', p[0]);
  const st = { ...press(t), k: ss(R(t, p[0] + .2, 2.4)), waves: ss(R(t, p[0] + .8, .6)) }; const z = 1 + .1 * ss(R(t, p[0] + 1, p[1] - p[0] - 1)); const m = place(50 - 330 * (z - 1), 440 - 280 * (z - 1), .85 * z, st);
  const lab = (txt, lx, ly, px, py, t0, o) => { const [x, y] = m(px, py), [tx, ty] = m(lx, ly); note(txt, x, y, tx, ty, R(t, t0, .8), o); };
  lab('eardrum', 440, 236, 300, 150, s(2) + 1.4, { col: C.red });
  lab('middle ear', 600, 180, 560, 70, s(2) + 2.4);
  lab('Eustachian tube', 700, 490, 300, 560, s(3) - .1, { col: C.navy });
  lab('to the nose', 900, 640, 600, 700, s(3) + .5, { size: 30 });
  // the pencil-lead comparison: a sketched pencil with its lead, beside the tube
  if (t > s(2) + 4.2) { const k = ss(R(t, s(2) + 4.2, .9)); g.save(); g.translate(110, 1080); g.rotate(-.05); const pen = [[0, -16], [300, -16], [350, 0], [300, 16], [0, 16]];
    F.hatch(pen.slice(0, 2).concat([[300, 16], [0, 16]]), 'ochre', { alpha: .8 * k }); F.pencil(pen, { close: true, w: 2.2, draw: k }); F.pencil([[300, -16], [300, 16]], { w: 1.6, draw: k }); F.hatch([[330, -6], [350, 0], [330, 6]], 'graph', { alpha: k }); F.pencil([[318, -10], [318, 10]], { w: 1, col: C.graph, draw: k });
    F.txt('≈ as wide as a pencil lead', 0, -34, { size: 34, f: 'hand', col: C.red, write: ss(R(t, s(2) + 4.8, .8)) }); g.restore(); }
  // measurement box: the tube state flips on the swallow
  if (t > s(3)) { const op = st.o > .3; F.box(560, 1064, 330, 120, ss(R(t, s(3), .6))); F.txt('TUBE', 590, 1100, { size: 22, f: 'mono', wt: 700, ls: 3, col: '#5d5d62' }); F.txt(op ? 'OPEN' : 'SHUT', 700, 1162, { size: 54, f: 'hand', col: op ? C.red : C.navy, write: ss(R(t, s(3) + .3, .4)) });
    if (t > s(3) + 1.5) F.txt('gulp', 820, 1050, { size: 36, f: 'hand', col: C.red, alpha: st.o, rot: -.1 }); }
  caption(t);
}
function page3(t, p) {
  chapter(t, 'NO. 02 — THE CABIN', 'Thinner air up high.', p[0]);
  // the demo's chart: flight profile, axis notes
  const k = ss(R(t, p[0] + .3, 1.6)); const x = 110, y = 520, w = 780, h = 300;
  profile(x, y, w, h, t, k, lerp(0, .5, ss(R(t, p[0] + .6, 4))));
  F.txt('plane  ~35,000 ft', x + 290, y - 16, { size: 30, f: 'hand', write: ss(R(t, p[0] + 1.6, .7)) });
  F.txt('cabin  6,000–8,000 ft', x + 380, y + h - 8 * h / 35 - 18, { size: 30, f: 'hand', col: C.red, write: ss(R(t, s(4) + 2.2, .7)) });
  // a mountain town sketched at the cabin line
  if (t > s(4) + 1.4) { const a = ss(R(t, s(4) + 1.4, 1)); const MT = [[110, 820], [210, 700], [250, 740], [320, 640], [420, 820]]; F.hatch(MT, 'graph', { alpha: .5 * a }); F.pencil(MT, { w: 2, draw: a });
    for (let i = 0; i < 3; i++) { const hx = 268 + i * 26, hy = 664 + i * 6; F.rect(hx, hy, 18, 14, { w: 1.6, draw: a }); F.pencil([[hx - 2, hy], [hx + 9, hy - 10], [hx + 20, hy]], { w: 1.6, draw: a }); } note('a mountain town', 160, 900, 280, 660, R(t, s(4) + 2.0, .8), { size: 32 }); }
  // the rain-gauge cylinders: ground 100% vs cabin about 75%
  const cyl = (cx, v, kind, lab, t0, col) => { const kk = ss(R(t, t0, .7)); const top = 960, base = 1150, cw = 150; F.pencil([[cx, top], [cx, base], [cx + cw, base], [cx + cw, top]], { w: 2.2, draw: kk, seed: cx });
    const f = ss(R(t, t0 + .4, 1.2)), yy = lerp(base, base - v * (base - top), f); F.hatch([[cx + 4, yy], [cx + cw - 4, yy], [cx + cw - 4, base - 3], [cx + 4, base - 3]], kind, { alpha: .85 * kk });
    F.txt(lab, cx + cw + 20, base - 6, { size: 34, f: 'hand', col, write: ss(R(t, t0 + .6, .6)) }); };
  if (t > s(5) - .4) { cyl(110, 1, 'navy', 'ground', s(5) - .4, C.navy); cyl(470, .75, 'red', 'cabin', s(5) - .1, C.red);
    F.txt('≈ ¾', 790, 1080, { size: 92, f: 'hand', col: C.red, write: ss(R(t, s(5) + .6, .6)) }); F.txt('AIR PRESSURE', 110, 940, { size: 22, f: 'mono', wt: 700, ls: 3, col: '#5d5d62', type: (t - s(5)) * 30 }); }
  caption(t);
}
function page4(t, p) {
  chapter(t, 'NO. 03 — THE CLIMB', 'It pushes out.', p[0]);
  const st = { ...press(t), k: ss(R(t, p[0] + .2, 1.2)) }; const m = place(50, 440, .85, st);
  // arrows out of the middle ear while inside > outside
  const out = ss(R(t, s(6) + .4, .6)) * (1 - ss(R(t, s(7) + 1.2, .5)));
  if (out > 0) { const [ax, ay] = m(470, 300), [bx, by] = m(330, 300); F.arrow([[ax, ay - 30], [bx, by - 30]], { draw: out, w: 3.6 }); F.arrow([[ax, ay + 30], [bx, by + 30]], { draw: out, w: 3.6 }); }
  // pressure counters (measurement boxes)
  counters(t, st, p[0] + .6);
  if (t > s(7) + 1.6) F.seal('POP', 330, 540, ss(R(t, s(7) + 1.6, .3)), { size: 74, round: true, f: 'mono', fs: 32 });
  caption(t);
}
function counters(t, st, t0) { const a = ss(R(t, t0, .6)); F.box(80, 1064, 380, 120, a); F.box(500, 1064, 380, 120, a); F.alpha(F.S.A * a);
  F.txt('CABIN', 108, 1100, { size: 22, f: 'mono', wt: 700, ls: 3, col: '#5d5d62' }); F.txt(Math.round(st.pout * 100) + '%', 260, 1166, { size: 64, f: 'hand', col: C.red });
  F.txt('MIDDLE EAR', 528, 1100, { size: 22, f: 'mono', wt: 700, ls: 3, col: '#5d5d62' }); F.txt(Math.round(st.pin * 100) + '%', 700, 1166, { size: 64, f: 'hand', col: C.navy });
  const d = st.pin - st.pout; F.txt(Math.abs(d) < .02 ? '=' : d > 0 ? '<' : '>', 480, 1144, { size: 60, f: 'hand', align: 'center', col: Math.abs(d) < .02 ? C.ink : C.red }); F.alpha(BASE); }
function page5(t, p) {
  chapter(t, 'NO. 04 — THE DESCENT', 'Now it pushes in.', p[0]);
  const st = { ...press(t), k: ss(R(t, p[0] + .2, 1.2)), waves: .6 + .4 * ss(R(t, s(9) + 1.4, .5)), mute: ss(R(t, s(9) + 2.2, .8)) }; const z = 1 + .1 * ss(R(t, p[0] + .5, p[1] - p[0] - .5)); const m = place(50 - 330 * (z - 1), 440 - 280 * (z - 1), .85 * z, st);
  const inn = ss(R(t, s(9), .6)); if (inn > 0) { const [ax, ay] = m(250, 300), [bx, by] = m(420, 300); F.arrow([[ax, ay - 34], [bx, by - 34]], { draw: inn, w: 3.6 }); F.arrow([[ax, ay + 34], [bx, by + 34]], { draw: inn, w: 3.6 }); }
  const [nx, ny] = m(440, 364); note('stretched', 110, 930, nx - 10, ny, R(t, s(9) + 1.0, .8), { col: C.red });
  const words = [['muffled', 110, 1020], ['full', 300, 1030], ['ouch', 430, 1040]]; words.forEach(([w, x, y], i) => { const k = R(t, s(9) + 2.4 + i * .8, .5); if (k > 0) F.txt(w, x, y, { size: 44, f: 'hand', col: i === 2 ? C.red : C.graph, write: ss(k), rot: -.06 + i * .05 }); });
  counters(t, st, p[0] + .4);
  caption(t);
}
function page6(t, p) {
  chapter(t, 'NO. 05 — THE CATCH', 'Air must get in.', p[0]);
  // close-up of the tube: walls squeezed shut, a bubble waiting at the throat end
  const k = ss(R(t, p[0] + .2, 1.4)); g.save(); g.translate(-690, -210); g.scale(1.75, 1.75);
  const [WA, WB] = tubeWalls(.0); F.hatch([[560, 360], [900, 360], [900, 700], [560, 700]], 'graph', { alpha: .25 * k });
  const n1 = TB.length - 1, WA2 = TB.map((q, i) => offs(TB, tubeW(0, i / n1) + 26)[i]), WB2 = TB.map((q, i) => offs(TB, -tubeW(0, i / n1) - 26)[i]);
  F.hatch(WA.concat(WA2.slice().reverse()), 'redL', { alpha: .8 * k }); F.hatch(WB.concat(WB2.slice().reverse()), 'redL', { alpha: .8 * k }); F.pencil(WA2, { w: 1.6, col: C.graph, draw: k }); F.pencil(WB2, { w: 1.6, col: C.graph, draw: k });
  g.save(); F.path(WA.concat(WB.slice().reverse())); g.fillStyle = F.paperPat(); g.globalAlpha = F.S.A * k; g.fill(); g.restore(); F.pencil(WA, { w: 2.4, draw: k, seed: 5 }); F.pencil(WB, { w: 2.4, draw: k, seed: 6 });
  const tries = (t - s(10) - 1.2); if (tries > 0) { const u = .1 + .22 * Math.abs(Math.sin(tries * 2.2)); const P = TB[Math.round((1 - u) * (TB.length - 1))]; F.circ(P[0], P[1], 15, { col: C.navy, w: 2.6, wob: .3 }); F.txt('air', P[0] + 26, P[1] + 40, { size: 26, f: 'hand', col: C.navy }); }
  if (t > s(10) + 2.4) { F.pencil([[690, 470], [740, 520]], { col: C.red, w: 4, draw: ss(R(t, s(10) + 2.4, .3)) }); F.pencil([[740, 470], [690, 520]], { col: C.red, w: 4, draw: ss(R(t, s(10) + 2.6, .3)) }); }
  g.restore();
  note('tube: shut tight', 90, 720, 540, 690, R(t, s(10) + 1.4, .8), { col: C.navy });
  // the chart again: the descent leg in red, "most trouble here"
  if (t > s(11) - .3) { const a = ss(R(t, s(11) - .3, .6)); profile(110, 1010, 760, 130, t, a, .82, { hi: [.62, .95], hk: ss(R(t, s(11) + .4, .8)), ps: .8 }); F.seal('DOWN', 840, 940, ss(R(t, s(11) + 1.2, .3)), { size: 60, round: true, f: 'mono', fs: 24 }); F.txt('most trouble', 560, 1000, { size: 36, f: 'hand', col: C.red, write: ss(R(t, s(11) + 1.0, .7)) }); }
  caption(t);
}
function page7(t, p) {
  chapter(t, 'NO. 06 — THE FIX', 'Swallow. Yawn. Chew.', p[0]);
  const st = { ...press(t), k: 1 }; place(50, 440, .85, st);
  counters(t, st, p[0] + .2);
  [['swallow', 0], ['yawn', .5], ['chew gum', 1.0]].forEach(([w, d], i) => { const t0 = s(12) + .2 + d, y = 590 + i * 80; const x = 770; F.rect(x, y - 36, 40, 40, { w: 2.2, draw: ss(R(t, t0, .4)) }); F.pencil([[x + 6, y - 18], [x + 18, y - 4], [x + 44, y - 46]], { col: C.red, w: 3.6, draw: ss(R(t, t0 + .4, .3)) }); F.txt(w, x + 56, y, { size: 36, f: 'hand', write: ss(R(t, t0 + .2, .5)) }); });
  if (t > s(12) + 2.9) F.seal('POP', 330, 540, ss(R(t, s(12) + 2.9, .3)), { size: 74, round: true, f: 'mono', fs: 32 });
  caption(t);
}
function page8(t, p) {
  chapter(t, 'NO. 07 — SMALL EARS', 'Narrower tubes.', p[0]);
  const zz = 1 + .1 * ss(R(t, p[0] + 1, p[1] - p[0] - 1)); g.save(); g.translate(540, 820); g.scale(zz, zz); g.translate(-540, -820);
  // two tubes side by side: adult and baby (narrower), drawn like the demo's paired gauges
  const tube = (x, y, hw, lab, t0, col) => { const k = ss(R(t, t0, .8)); const P = F.dense([[x, y], [x + 120, y + 110], [x + 250, y + 230]], 8); const A = offs(P, hw), B = offs(P, -hw);
    g.save(); F.path(A.concat(B.slice().reverse())); g.fillStyle = F.pat(col === C.red ? 'redL' : 'navyL'); g.globalAlpha = F.S.A * k * .7; g.fill(); g.restore(); F.pencil(A, { w: 2.4, draw: k }); F.pencil(B, { w: 2.4, draw: k });
    F.txt(lab, x, y - 34, { size: 44, f: 'hand', col, write: ss(R(t, t0 + .3, .6)) });
    for (let i = 0; i < 3; i++) { const u = (t * .4 + i / 3) % 1, Q = P[Math.round(u * (P.length - 1))]; F.circ(Q[0], Q[1], hw * .7 + 2, { col: C.navy, w: 2.2, alpha: k * Math.sin(u * Math.PI), wob: .3 }); } };
  tube(120, 560, 15, 'grown-up', p[0] + .3, C.navy); tube(560, 560, 6, 'baby', p[0] + 1.2, C.red);
  F.txt('narrower', 600, 840, { size: 36, f: 'hand', col: C.red, write: ss(R(t, s(13) + 2.4, .6)) });
  // baby face doodle + bottle, near the landing leg of the chart
  if (t > s(13) + .8) { const a = ss(R(t, s(13) + .8, .8)); const cry = t < s(14) + 2.4; const bx = 230, by = 1000;
    F.circ(bx, by, 70, { w: 2.4, draw: a, seed: 3 }); F.pencil([[bx - 30, by - 14], [bx - 14, by - 10]], { w: 2.4, draw: a }); F.pencil([[bx + 14, by - 10], [bx + 30, by - 14]], { w: 2.4, draw: a });
    if (cry) { F.circ(bx, by + 28, 16, { w: 2.4, col: C.red, draw: a }); for (let i = 0; i < 2; i++) { const u = (t * 1.3 + i * .5) % 1; F.pencil([[bx - 28 + i * 56, by - 4 + u * 40], [bx - 30 + i * 56, by + 6 + u * 40]], { col: C.navy, w: 3, alpha: a * (1 - u) }); } }
    else { F.pencil([[bx - 18, by + 26], [bx, by + 36], [bx + 18, by + 26]], { w: 2.4, draw: a }); }
    if (!cry) { const k = ss(R(t, s(14) + 2.4, .6)); g.save(); g.translate(bx + 70, by + 40); g.rotate(-.5); F.rect(0, -18, 110, 36, { w: 2.2, draw: k }); F.hatch([[4, -14], [70, -14], [70, 14], [4, 14]], 'ochre', { alpha: .7 * k }); F.pencil([[110, -8], [138, 0], [110, 8]], { w: 2.2, draw: k }); g.restore(); F.txt('swallow!', 480, 1060, { size: 44, f: 'hand', col: C.red, write: ss(R(t, s(14) + 2.8, .6)) }); }
    profile(560, 900, 320, 100, t, a, lerp(.7, .97, R(t, s(14), 3)), { hi: [.62, .95], ps: .6 }); }
  g.restore();
  caption(t);
}
function page9(t, p) {
  const t0 = s(16) - .1, q = t < t0;
  if (q) { F.label('YOUR NEXT FLIGHT', 80, LBY + 120, t - p[0]); [['swallow', 80], ['yawn', 390], ['gum', 700]].forEach(([w, x], i) => { const k = R(t, p[0] + .3 + i * .35, .5); F.box(x - 30, 560, 290, 140, k); F.rect(x - 6, 606, 40, 40, { w: 2.4, col: C.red, draw: ss(R(t, p[0] + .5 + i * .35, .4)) }); F.txt(w + '?', x + 48, 644, { size: 42, f: 'hand', col: C.red, write: ss(R(t, p[0] + .6 + i * .35, .5)) }); });
    place(150, 760, .62, { ...hookState(t), b: 0, pin: 1, pout: 1 }); caption(t); return; }
  F.txt('Follow for more of', 540, 560, { size: 92, f: 'hand', align: 'center', write: ss(R(t, t0 + .15, .6)) });
  F.txt('how it really works.', 540, 670, { size: 92, f: 'hand', align: 'center', col: C.red, write: ss(R(t, t0 + .6, .7)) });
  F.txt("A new 'wait, really?' every day.", 540, 760, { size: 44, f: 'hand', align: 'center', col: C.ink, write: ss(R(t, t0 + 1.1, .6)) });
  F.txt('@howitreallyworkstudio', 540, 830, { size: 30, f: 'mono', align: 'center', col: '#5d5d62', type: (t - t0 - 1.4) * 34 });
  F.seal('END', 860, 1000, ss(R(t, t0 + 1.4, .3)), { size: 54, round: true, f: 'mono', fs: 28 });
  place(150, 900, .62, hookState(t));
}

let BASE = 1, PREV = false;
const PAGES = { 1: page1, 2: page2, 3: page3, 4: page4, 5: page5, 6: page6, 7: page7, 8: page8, 9: page9 };
function scene(t) {
  F.begin(); const p = pageAt(t); F.footer(p[2]);
  const pi = PG.indexOf(p); if (pi > 0 && t < p[0] + .35) { const q = PG[pi - 1]; BASE = 1 - ss(R(t, p[0], .35)); F.alpha(BASE); PREV = true; PAGES[q[2]](Math.min(t, q[1] - .01), q); PREV = false; F.alpha(1); }
  BASE = pi === 0 ? 1 : ss(R(t, p[0], .35)); F.alpha(BASE); PAGES[p[2]](t, p); F.alpha(1); BASE = 1;
  // loop: the last 0.7 s dissolve back toward the frame-0 page
  const L = R(t, TL.total - .7, .7); if (L > 0) { F.alpha(ss(L) * .5); page1(0); F.alpha(1); }
}
window.DUR = TL.total;
window.seek = t => scene(t);
window.render = window.seek;
// thumbnail / cover (rule 11): hook words big inside y 300-1620, the ear with the bubble mid-pop
window.thumb = () => { F.begin(); F.footer(1);
  F.label('A FIELD SKETCHBOOK  ·  FLIGHT NOTES', 80, 330, 9);
  F.txt('Why ears', 70, 520, { size: 170, f: 'hand', rot: -.02 }); F.txt('POP', 70, 700, { size: 200, f: 'hand', col: C.red, rot: -.02 }); F.txt('on planes', 420, 690, { size: 110, f: 'hand', rot: -.02 });
  F.line(84, 730, 900, 716, { col: C.red, w: 3.5, wob: .6 }); F.seal('EAR', 930, 420, 1, { size: 70, round: true, f: 'mono', fs: 32 });
  const ring = []; for (let i = 0; i <= 48; i++) { const a = i / 48 * Math.PI * 2; ring.push([600 + Math.cos(a) * 300, 1180 + Math.sin(a) * 300]); } F.hatch(ring, 'red', { alpha: .45 }); F.pencil(ring, { col: C.red, w: 2.2 });
  place(80, 850, .95, { ...hookState(1.2), pop: .45 });
};
window.seek(0); window.ready = true; window.READY = true;
