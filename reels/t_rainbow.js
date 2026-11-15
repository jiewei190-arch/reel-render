// t_rainbow.js: "Why are rainbows curved?" in the Blueprint style (template #3, lemo-opuscar/styles/blueprint grammar, via styles/blueprint
// like lock and ovenfoil). White line work on the cyanotype sheet, drafting order with a glowing nib, centre lines, hidden-line dashes for the
// half of the circle you can't see, dimension arcs (42°, 50°), FIG numbers as transitions, a title block whose STATUS carries the verdict,
// double-ruled NOTE subtitles. The only colours are the spectrum itself (as pencil-thin bands) and ONE red stamp (CIRCLE) at the payoff.
// Batch N layout (as ovenfoil): header y 280-420, figure window y 440-1000, title block y 1010-1138, NOTE box y 1150-1425 (x 100-900);
// the bottom band carries a drawing only (a viewer with the sun behind, rain and a low bow; no text).
import { createBP, W, H, VP, DASH, C, clamp, lerp, ramp, ss, eo, bo, hash } from './styles/blueprint/blueprint.js';
await Promise.all(['700 40px "Caveat"', '600 20px "Poppins"', '800 40px "Poppins"'].map(f => document.fonts.load(f)));
const TL = window.TL, PH = TL.p, s = i => PH[i].start, e = i => PH[i].end;
const B = createBP(document.getElementById('c')), g = B.g;
// white-print sheet (main's note: not ovenfoil's cyan or fridge's sepia): off-white diazo paper, faint blue grid, deep-blue line work
Object.assign(C, { ink: '#1f3f86', paper: '#f6f4ee', blue0: '#f6f4ee', blue1: '#e9eef8' });
const WP = (() => { const c = document.createElement('canvas'); c.width = W; c.height = H; const s = c.getContext('2d');
  s.fillStyle = '#20242c'; s.fillRect(0, 0, W, H); for (let i = 0; i < 900; i++) { s.fillStyle = `rgba(255,255,255,${hash(i) * .02})`; s.fillRect(hash(i + 3) * W, hash(i + 7) * H, 1 + hash(i + 9) * 3, 1); }
  s.save(); s.shadowColor = 'rgba(0,0,0,.55)'; s.shadowBlur = 34; s.shadowOffsetY = 10; s.fillStyle = '#f4f2ea'; s.fillRect(36, 36, W - 72, H - 72); s.restore();
  s.save(); s.beginPath(); s.rect(36, 36, W - 72, H - 72); s.clip();
  const gr = s.createLinearGradient(0, 0, W, H); gr.addColorStop(0, '#f7f5ee'); gr.addColorStop(.6, '#f2efe4'); gr.addColorStop(1, '#ece6d6'); s.fillStyle = gr; s.fillRect(0, 0, W, H);
  for (let i = 0; i < 50; i++) { const x = hash(i * 1.3) * W, y = hash(i * 2.1) * H, r = 160 + hash(i * 3.7) * 360; const rg = s.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, hash(i * 5.3) > .5 ? 'rgba(120,140,190,.05)' : 'rgba(210,190,140,.07)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); s.fillStyle = rg; s.fillRect(x - r, y - r, 2 * r, 2 * r); }
  s.strokeStyle = 'rgba(60,100,180,.10)'; s.lineWidth = 1; for (let x = 36; x < W; x += 54) { s.beginPath(); s.moveTo(x, 36); s.lineTo(x, H - 36); s.stroke(); } for (let y = 36; y < H; y += 54) { s.beginPath(); s.moveTo(36, y); s.lineTo(W - 36, y); s.stroke(); }
  for (let i = 0; i < 1600; i++) { s.fillStyle = `rgba(60,80,140,${hash(i * 3.1) * .12})`; s.fillRect(hash(i * 5.1) * W, hash(i * 7.9) * H, 1.4, 1.4); }
  [[0, 640], [0, 1280], [1, 540]].forEach(([v, p]) => { s.fillStyle = 'rgba(0,0,0,.05)'; v ? s.fillRect(p - 1, 36, 2, H - 72) : s.fillRect(36, p - 1, W - 72, 2); });
  s.restore(); return c; })();
B.begin = () => { B.S.A = 1; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.setLineDash([]); g.drawImage(WP, 0, 0); };
const R = (t, t0, d) => ramp(t, t0, d), TAU = Math.PI * 2, D2R = Math.PI / 180;
VP.y = 440; VP.h = 560;
const VCY = VP.y + VP.h / 2;
const SPEC = ['#d9443b', '#e8842a', '#e0b92c', '#3fa65e', '#3584cc', '#7a5cc4'];   // red (outside) -> violet (inside)

// ---------- figure schedule ----------
const FIGS = [[0, 'FIG. 1', 'THE ARC'], [s(2) - .3, 'FIG. 2', 'ONE RAINDROP'], [s(5) - .3, 'FIG. 3', 'THE CONE'], [s(8) - .3, 'FIG. 4', 'THE HORIZON'], [s(10) - .3, 'FIG. 5', 'YOUR OWN BOW'], [s(11) - .3, 'FIG. 6', 'THE SECOND BOW'], [s(12) - .3, 'FIG. 7', 'THE ANSWER']];
const figAt = t => { let i = 0; FIGS.forEach((f, k) => { if (t >= f[0]) i = k; }); return i; };
const vis = (t, i) => (i ? R(t, FIGS[i][0], .3) : 1) * (i + 1 < FIGS.length ? 1 - R(t, FIGS[i + 1][0], .3) : 1);
function camAt(t) { const i = figAt(t), dr = .025 * Math.sin(t * .9);
  if (i === 0) { const k = ss(R(t, s(1) + .3, 1.4)); return [540 + 20 * Math.sin(t * .7), lerp(700, 760, k), lerp(1.45, .78, k) + dr]; }   // frame 0 rides the bow, then pulls back to show the whole circle
  if (i === 1) { const k = ss(R(t, s(4) - .3, 1.0)); return [lerp(540, 470, k), lerp(VCY, 780, k), lerp(1, 1.25, k) + dr]; }
  if (i === 2) return [540 + 10 * Math.sin(t * .6), VCY, 1 + dr];
  if (i === 3) { const k = ss(R(t, s(9) - .3, 1.0)); return [540, lerp(VCY, 760, k), lerp(1, .62, k) + dr]; }
  return [540, VCY, 1 + dr]; }

// ---------- helpers ----------
// spectrum bands on a circle arc (angles in canvas radians), outer radius r, band width bw; rev = colours flipped (red inside)
function bands(cx, cy, r, a0, a1, o = {}) { const { bw = 9, k = 1, rev = false, alpha = .9, dash = null } = o; if (k <= 0) return; g.save(); g.lineCap = 'butt'; if (dash) g.setLineDash(dash.map(d => d / B.S.z));
  SPEC.forEach((c, i) => { const j = rev ? SPEC.length - 1 - i : i; g.strokeStyle = SPEC[j]; g.globalAlpha = B.S.A * alpha; g.lineWidth = bw; g.beginPath(); g.arc(cx, cy, r - i * bw, a0, lerp(a0, a1, ss(k))); g.stroke(); });
  g.restore(); }
function dot(x, y, r, col, a = 1) { g.save(); g.globalAlpha = B.S.A * a; g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.restore(); }
function callout(txt, x, y, k, o = {}) { if (k <= .02) return; const size = o.size || 34, w = B.measure(txt, size) + 30, h = size * 1.3;
  B.paper([[x - w / 2, y - h / 2], [x + w / 2, y - h / 2], [x + w / 2, y + h / 2], [x - w / 2, y + h / 2]], .96); B.rect(x - w / 2, y - h / 2, w, h, { w: 1.6, nib: false, draw: clamp(k * 2) }); B.txt(txt, x, y + 2, { size, align: 'center', write: R(k, .3, .7) }); }
function angleDim(cx, cy, r, a0, a1, label, k, o = {}) { if (k <= 0) return; const P = []; for (let i = 0; i <= 30; i++) P.push([cx + Math.cos(lerp(a0, a1, i / 30)) * r, cy + Math.sin(lerp(a0, a1, i / 30)) * r]); B.poly(P, { w: 1.6, draw: k, nib: false });
  if (k > .95) { const am = (a0 + a1) / 2, lr = r + (o.lo || 46); callout(label, cx + Math.cos(am) * lr, cy + Math.sin(am) * lr, R(k, .9, .1) * 1, { size: o.size || 38 }); } }
function eye(x, y, s_ = 1, k = 1) { if (k <= 0) return; B.poly([[x - 26 * s_, y], [x, y - 14 * s_], [x + 26 * s_, y], [x, y + 14 * s_]], { w: 2, close: true, draw: k, nib: false }); dot(x, y, 6 * s_, C.ink, k); }
function person(x, y, s_ = 1, k = 1, o = {}) { if (k <= 0) return; B.circ(x, y - 64 * s_, 14 * s_, { w: 2, nib: false, draw: k }); B.poly([[x, y - 50 * s_], [x, y - 18 * s_]], { w: 2.2, nib: false, draw: k });
  B.poly([[x - 16 * s_, y - 40 * s_], [x, y - 34 * s_], [x + 16 * s_, y - 40 * s_]], { w: 2, nib: false, draw: k }); B.poly([[x - 12 * s_, y], [x, y - 18 * s_], [x + 12 * s_, y]], { w: 2.2, nib: false, draw: k }); }
function sun(x, y, r, t, k = 1) { if (k <= 0) return; B.circ(x, y, r, { w: 2.2, nib: false, draw: k }); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + t * .2; B.line(x + Math.cos(a) * (r + 8), y + Math.sin(a) * (r + 8), x + Math.cos(a) * (r + 22), y + Math.sin(a) * (r + 22), { w: 1.6, nib: false, alpha: .8 * k }); } }
function rain(x0, x1, y0, y1, t, a = .5, n = 40) { g.save(); g.strokeStyle = C.ink; g.lineWidth = 1.3; g.globalAlpha = B.S.A * a; g.beginPath(); for (let i = 0; i < n; i++) { const u = (t * .9 + hash(i * 3.7)) % 1, x = x0 + hash(i * 1.3) * (x1 - x0) - u * 20, y = y0 + u * (y1 - y0); g.moveTo(x, y); g.lineTo(x - 6, y + 22); } g.stroke(); g.restore(); }

// ---------- figures (sheet coords; window centre (540, 720)) ----------
// FIG 1: a big bow over the horizon from frame 0; then the hidden half of the circle drawn dashed; then a second viewer's circle
function fig1(t) { const a = vis(t, 0); if (a <= 0) return; B.alpha(a);
  const cx = 540, cy = 1000, r = 420, hz = 1000;
  rain(160, 940, 560, 1000, t, .35, 50);
  bands(cx, cy, r, Math.PI, TAU, { bw: 13, k: 1 });
  B.line(40, hz, 1040, hz, { w: 2.4, nib: false }); B.hatch([[40, hz], [1040, hz], [1040, hz + 500], [40, hz + 500]], { sp: 16, alpha: .35 });
  const hid = R(t, s(1) + .5, 1.6); if (hid > 0) { bands(cx, cy, r, 0, Math.PI, { bw: 13, k: hid, alpha: .35, dash: [18, 12] }); B.circ(cx, cy, r + 14, { w: 1.4, dash: DASH.hidden, draw: hid, nib: false, alpha: .8 }); }
  const c2 = R(t, s(1) + 3.2, 1.2); if (c2 > 0) { B.circ(cx + 150, cy, r - 30, { w: 1.6, dash: DASH.phantom, draw: c2, nib: false, alpha: .7 }); callout('SOMEONE ELSE’S', cx + 150, cy - r + 10, R(t, s(1) + 4.0, .5), { size: 30 }); }
  if (hid > .2) callout('THE REST OF THE CIRCLE', cx, cy + 250, R(t, s(1) + 1.6, .6), { size: 34 });
  B.alpha(1); }
// FIG 2: one raindrop: a white ray in, split into colours, reflected off the back, out at 42°
const DROP = { x: 540, y: 720, r: 210 };
function rayPath(n) { const i = Math.asin(.86), rr = Math.asin(Math.sin(i) / n), { x, y, r } = DROP;   // math coords (y up), converted to canvas
  const P = ph => [x + Math.cos(ph) * r, y - Math.sin(ph) * r], p1 = Math.PI - i, p2 = p1 - (Math.PI - 2 * rr), p3 = p2 - (Math.PI - 2 * rr), Dv = Math.PI + 2 * i - 4 * rr, dir = -Dv;
  return { P1: P(p1), P2: P(p2), P3: P(p3), out: [Math.cos(dir), -Math.sin(dir)], dev: 180 - Dv / D2R }; }
function fig2(t) { const a = vis(t, 1); if (a <= 0) return; B.alpha(a); const t0 = FIGS[1][0], { x, y, r } = DROP;
  const kd = R(t, t0 + .2, .8); B.paper(Array.from({ length: 48 }, (_, i) => [x + Math.cos(i / 48 * TAU) * r, y + Math.sin(i / 48 * TAU) * r]), .9); B.circ(x, y, r, { w: 3, draw: kd });
  B.line(x - r - 30, y, x + r + 30, y, { w: 1, dash: DASH.centre, alpha: .6, nib: false, draw: kd }); B.line(x, y - r - 30, x, y + r + 30, { w: 1, dash: DASH.centre, alpha: .6, nib: false, draw: kd });
  const red = rayPath(1.331), vio = rayPath(1.343), kin = R(t, s(2) + .3, .8), kref = R(t, s(3) + .1, 1.0), kout = R(t, s(3) + 1.4, .9);
  B.poly([[60, red.P1[1]], red.P1], { w: 3, draw: kin }); if (kin > .1) B.txt('SUNLIGHT', 70, red.P1[1] - 22, { size: 30, write: R(t, s(2) + .5, .5) });
  SPEC.map((c, j) => [rayPath(1.331 + j * .007), c]).forEach(([p, col], j) => { const k1 = R(t, s(2) + 1.1 + j * .15, .8), k2 = kref, k3 = kout;
    B.poly([p.P1, p.P2], { w: 2.4, col, draw: k1 }); B.poly([p.P2, p.P3], { w: 2.4, col, draw: k2 }); const L = 330; B.poly([p.P3, [p.P3[0] + p.out[0] * L, p.P3[1] + p.out[1] * L]], { w: 3, col, draw: k3 }); });
  if (R(t, s(2) + 1.5, .3) > 0) callout('BENDS', 300, 520, R(t, s(2) + 1.5, .5), { size: 32 });
  if (kref > .5) callout('REFLECTS', 870, 600, R(t, s(3) + .9, .5), { size: 32 });
  // the 42° dimension at the exit: a dashed line back along the sunlight, the red ray out
  const kdim = R(t, s(4) + .2, .8); if (kdim > 0) { const [px, py] = red.P3; B.line(px, py, px - 300, py, { w: 1.4, dash: DASH.hidden, draw: kdim, nib: false });
    const aRay = Math.atan2(red.out[1], red.out[0]); angleDim(px, py, 170, Math.PI, aRay < 0 ? aRay + TAU : aRay, '42°', R(t, s(4) + .6, .8), { size: 44, lo: 50 }); }
  if (t > s(4) + 2.2) callout('TO YOUR EYE', 250, 1010, R(t, s(4) + 2.2, .5), { size: 32 });
  B.alpha(1); }
// FIG 3: side elevation: sunlight from behind; the axis to the shadow of your head; drops at 42° light up; the cone; looking down it = a circle
const E3 = { x: 170, y: 720 }, A42 = 42 * D2R;
const DROPS = Array.from({ length: 110 }, (_, i) => [260 + hash(i * 2.3) * 700, 460 + hash(i * 5.1) * 520]);
function fig3(t) { const a = vis(t, 2); if (a <= 0) return; B.alpha(a); const t0 = FIGS[2][0], look = ss(R(t, s(7) - .2, 1.6));
  if (look < 1) { B.alpha(a * (1 - look));
    for (let i = 0; i < 5; i++) { const yy = 480 + i * 120, u = (t * .5 + i * .2) % 1; B.line(40 + u * 140, yy, 120 + u * 140, yy, { w: 1.8, nib: false, alpha: .7 }); B.arrowhead(120 + u * 140, yy, 0, { alpha: .7 }); }
    B.txt('SUNLIGHT', 60, 470, { size: 28, alpha: .8 });
    eye(E3.x, E3.y, 1.2, R(t, t0 + .2, .5)); B.line(E3.x, E3.y, 1000, E3.y, { w: 1.2, dash: DASH.centre, draw: R(t, t0 + .4, .8), nib: false, alpha: .8 });
    const ka = R(t, s(5) + .8, .8);
    DROPS.forEach(([dx, dy], i) => { const ang = Math.abs(Math.atan2(E3.y - dy, dx - E3.x)), near = Math.abs(ang - A42) < .035; const lit = near && ka > 0; dot(dx, dy, lit ? 9 : 5, lit ? SPEC[i % 6] : 'rgba(31,63,134,.35)', lit ? ka : .8); });
    const kc = R(t, s(6) + .2, 1.0); [-1, 1].forEach(sg => { const L = 620; B.line(E3.x, E3.y, E3.x + Math.cos(A42) * L, E3.y - sg * Math.sin(A42) * L, { w: 2, draw: kc * (1 - look), nib: false }); });
    if (kc > 0) { const bx = E3.x + Math.cos(A42) * 380, ry = Math.sin(A42) * 380; g.save(); g.globalAlpha = B.S.A; g.lineWidth = 10; SPEC.forEach((c, j) => { g.strokeStyle = c; g.beginPath(); g.ellipse(bx, E3.y, 46 - j * 2, ry - j * 10, 0, -Math.PI / 2, -Math.PI / 2 + TAU * ss(R(t, s(6) + .8, 1.2))); g.stroke(); }); g.restore();
      angleDim(E3.x, E3.y, 150, -A42, 0, '42°', R(t, s(6) + 1.2, .6), { size: 40, lo: 40 }); dot(bx, E3.y, 6, C.ink); }
    if (t > s(5) + .3 && t < s(6) + 1.0) callout('ONLY THESE DROPS', 700, 520, R(t, s(5) + 1.6, .5) * (1 - R(t, s(6) + .5, .3)), { size: 32 });
    if (t > s(6) + 2.6) callout('A CONE, TIP AT YOUR EYE', 640, 960, R(t, s(6) + 2.6, .5), { size: 32 });
    B.alpha(a); }
  if (look > 0) { const k = look, cx = 540, cy = 720, rr = 250; B.alpha(a * k); g.save(); g.translate(cx, cy); g.scale(lerp(.18, 1, k), 1); g.translate(-cx, -cy); bands(cx, cy, rr, -Math.PI / 2, -Math.PI / 2 + TAU, { bw: 14, k: 1 }); g.restore();
    dot(cx, cy, 7, C.ink); B.txt('shadow of your head', cx, cy + 46, { size: 34, align: 'center', write: R(t, s(7) + 1.0, .6) });
    B.circ(cx, cy, 30, { w: 1.4, dash: DASH.hidden, nib: false, alpha: .7 }); B.alpha(a); }
  B.alpha(1); }
// FIG 4: the ground hides the lower half (hidden lines); then the view from a plane: the full circle on the cloud deck below
function fig4(t) { const a = vis(t, 3); if (a <= 0) return; B.alpha(a); const t0 = FIGS[3][0], pl = ss(R(t, s(9) - .3, 1.0));
  if (pl < 1) { B.alpha(a * (1 - pl)); const cx = 540, cy = 760, r = 260, hz = 800;
    bands(cx, cy, r, Math.PI + .18, TAU - .18, { bw: 12 }); bands(cx, cy, r, -.18, Math.PI + .18, { bw: 12, alpha: .3, dash: [14, 10], k: R(t, t0 + .4, 1.0) });
    const gk = R(t, s(8) + 1.6, .8); B.paper([[60, hz], [1020, hz], [1020, 1100], [60, 1100]], .9 * gk); B.hatch([[60, hz], [1020, hz], [1020, 1100], [60, 1100]], { sp: 14, alpha: .45, draw: gk }); B.line(60, hz, 1020, hz, { w: 2.6, draw: gk, nib: false });
    person(160, hz, 1.3, gk); rain(620, 980, 480, hz, t, .4, 36);
    if (gk > .5) callout('NO RAIN DOWN HERE', 700, 900, R(t, s(8) + 2.6, .5), { size: 32 }); B.alpha(a); }
  if (pl > 0) { B.alpha(a * pl); const cx = 540, cy = 860, r = 300;   // camera pulled back: cloud deck + full circle + the plane above, its shadow at the centre
    for (let i = 0; i < 9; i++) { const x = 120 + i * 105, w = 90 + 30 * hash(i); B.poly(Array.from({ length: 13 }, (_, j) => [x - w / 2 + j * w / 12, cy + 230 - Math.sin(j / 12 * Math.PI) * 26 + Math.sin(t + i) * 3]), { w: 1.4, nib: false, alpha: .6 }); }
    bands(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + TAU, { bw: 14, k: R(t, s(9) + .2, 1.6) });
    const px = 540 + 30 * Math.sin(t * .8), py = 400; B.poly([[px - 70, py], [px + 70, py], [px + 80, py + 6], [px - 70, py + 10]], { w: 2.2, close: true, nib: false }); B.poly([[px - 10, py + 4], [px - 40, py + 50], [px - 20, py + 50], [px + 20, py + 4]], { w: 2, nib: false }); B.poly([[px - 60, py + 2], [px - 70, py - 24], [px - 54, py - 24], [px - 44, py + 2]], { w: 2, nib: false });
    dot(cx + (px - 540) * .3, cy, 9, C.ink, .9); B.line(px, py + 12, cx + (px - 540) * .3, cy, { w: 1.2, dash: DASH.hidden, nib: false, alpha: .6 });
    callout('THE WHOLE CIRCLE', 780, 600, R(t, s(9) + 1.4, .5), { size: 34 }); B.alpha(a); }
  B.alpha(1); }
// FIG 5: two viewers, two cones, two bows; the friend walks and their bow walks along
function fig5(t) { const a = vis(t, 4); if (a <= 0) return; B.alpha(a); const t0 = FIGS[4][0], hz = 960;
  B.line(60, hz, 1020, hz, { w: 2.4, nib: false }); B.hatch([[60, hz], [1020, hz], [1020, 1100], [60, 1100]], { sp: 14, alpha: .4 });
  const xa = 380, xb = 640 + 70 * Math.sin((t - t0) * 1.4);
  g.save(); g.beginPath(); g.rect(0, 0, W, hz); g.clip(); bands(xa, hz - 20, 300, Math.PI, TAU, { bw: 11, k: R(t, t0 + .2, 1.0) }); B.circ(xb, hz - 20, 300, { w: 2, dash: DASH.phantom, nib: false, alpha: .85, draw: R(t, t0 + 1.0, 1.0) }); g.restore();
  person(xa, hz, 1.2); person(xb, hz, 1.2); B.txt('YOU', xa, hz + 50, { size: 34, align: 'center' }); B.txt('FRIEND', xb, hz + 50, { size: 34, align: 'center', write: R(t, t0 + 1.2, .5) });
  callout('MOVES WITH YOU', 780, 540, R(t, s(10) + 2.6, .5), { size: 32 });
  B.alpha(1); }
// FIG 6: the second bow: two reflections, 50°, colours flipped (reds face each other)
function fig6(t) { const a = vis(t, 5); if (a <= 0) return; B.alpha(a); const t0 = FIGS[5][0], cx = 540, cy = 1000;
  B.line(60, cy, 1020, cy, { w: 2.4, nib: false }); dot(cx, cy, 7, C.ink);
  bands(cx, cy, 330, Math.PI, TAU, { bw: 11 }); bands(cx, cy, 440, Math.PI, TAU, { bw: 12, rev: true, alpha: .55, k: R(t, t0 + .6, 1.4) });
  const kd = R(t, s(11) + 2.0, .8); B.line(cx, cy, cx - 460 * Math.cos(.55), cy - 460 * Math.sin(.55), { w: 1.2, dash: DASH.centre, draw: kd, nib: false });
  angleDim(cx, cy, 120, Math.PI, Math.PI + .55, '42°', R(t, s(11) + 2.4, .6), { size: 36, lo: 40 });
  if (t > s(11) + 1.0) { callout('PRIMARY · RED OUTSIDE', 540, 560, R(t, s(11) + .4, .5), { size: 28 }); }
  callout('SECOND BOW ~50° · RED INSIDE', 540, 480, R(t, s(11) + 3.0, .5), { size: 30 });
  B.alpha(1); }
// FIG 7: the answer: a circle of light around your shadow; the ground hides the rest; the red stamp; then the question
function fig7(t) { const a = vis(t, 6); if (a <= 0) return; if (t > s(14) - .1) return; B.alpha(a); const t0 = FIGS[6][0], cx = 540, cy = 760, hz = 860;
  bands(cx, cy, 270, -Math.PI / 2, -Math.PI / 2 + TAU, { bw: 14, k: R(t, t0 + .2, 1.6) });
  const gk = R(t, s(12) + 3.0, .8); B.paper([[60, hz], [1020, hz], [1020, 1100], [60, 1100]], .85 * gk); B.hatch([[60, hz], [1020, hz], [1020, 1100], [60, 1100]], { sp: 14, alpha: .45, draw: gk }); B.line(60, hz, 1020, hz, { w: 2.6, draw: gk, nib: false });
  dot(cx, cy, 7, C.ink); B.txt('your shadow', cx, cy + 44, { size: 32, align: 'center', write: R(t, s(12) + 1.6, .5) });
  if (t > s(13) - .1) { [['YES', 300], ['NO', 780]].forEach(([w, x], i) => { const k = bo(R(t, s(13) + .4 + i * .4, .4)); if (k <= 0) return; callout(w, x, 560, clamp(k), { size: 60 }); }); }
  B.alpha(1); }

// ---------- sheet furniture (Batch N) ----------
function header(t) { const fi = figAt(t), f = FIGS[fi], prev = fi ? FIGS[fi - 1] : null, fk = R(t, f[0], .6);
  B.txt('HOW IT REALLY WORKS', 100, 292, { size: 22, font: 'Poppins', weight: 600, alpha: .85, ls: 3 }); B.txt('SHEET 1/1', 980, 292, { size: 22, font: 'Poppins', weight: 600, align: 'right', alpha: .85, ls: 3 });
  B.txt('THE RAINBOW', 540, 345, { size: 66, align: 'center' }); B.line(100, 376, 980, 376, { w: 1.5, nib: false, alpha: .8 });
  if (prev && fk < 1) { B.txt(prev[1] + '  ·  ' + prev[2], 98, 414, { size: 36, alpha: 1 - ss(fk * 2) }); B.line(94, 414, 94 + B.measure(prev[1] + '  ·  ' + prev[2], 36) + 8, 414, { w: 3, draw: R(fk, 0, .35), nib: false }); }
  B.txt(f[1] + '  ·  ' + f[2], 98, 414, { size: 36, write: prev ? R(fk, .35, .65) : 1 });
  g.save(); g.strokeStyle = C.ink; g.lineWidth = 3.2; g.strokeRect(60, 250, W - 120, H - 310); g.lineWidth = 1.4; g.globalAlpha = .9; g.strokeRect(VP.x + 8, VP.y, VP.w - 16, VP.h); g.restore(); }
function titleBlock(t, status) { const y0 = 1010, h = 128, x0 = 100, w = 800; g.save(); g.strokeStyle = C.ink; g.lineWidth = 2.4; g.strokeRect(x0, y0, w, h); g.lineWidth = 1.3;
  [[380, 0, 380, h], [640, 0, 640, h]].forEach(([a, b, c2, d]) => { g.beginPath(); g.moveTo(a, y0 + b); g.lineTo(c2, y0 + d); g.stroke(); }); g.beginPath(); g.moveTo(x0, y0 + 64); g.lineTo(x0 + w, y0 + 64); g.stroke(); g.restore();
  const cells = [['TITLE', 'RAINBOW', 112, 0], ['DRAWN BY', '@howitreallyworkstudio', 112, 64], ['STATUS', status, 392, 0], ['SHEET', '1 OF 1', 392, 64], ['SCALE', 'NOT TO SCALE', 652, 0], ['SOURCES', 'SEE CAPTION', 652, 64]];
  cells.forEach(([k, v, x, dy]) => { B.txt(k, x, y0 + dy + 15, { size: 16, font: 'Poppins', weight: 600, alpha: .7, ls: 2 }); B.txt(v, x, y0 + dy + 44, { size: v.length > 13 ? 26 : 32 }); }); }
function note(n, cap, tS) { const x = 100, y = 1150, w = 800, h = 275, size = 50; g.save(); g.globalAlpha = clamp(tS / .15); g.fillStyle = 'rgba(255,255,255,.82)'; g.fillRect(x, y, w, h); g.strokeStyle = C.ink; g.lineWidth = 2.2; g.strokeRect(x, y, w, h); g.lineWidth = 1; g.strokeRect(x + 8, y + 8, w - 16, h - 16); g.restore();
  B.txt('NOTE', x + 24, y + 30, { size: 16, font: 'Poppins', weight: 600, alpha: .8, ls: 3 }); B.txt(String(n).padStart(2, '0'), x + 92, y + 30, { size: 20, font: 'Poppins', weight: 600 });
  const toks = []; cap.split('**').forEach((sg, k) => sg.split(' ').filter(Boolean).forEach(wd => toks.push({ w: wd, b: k % 2 === 1 }))); const sp = B.measure(' ', size), maxW = w - 64; const lines = [[]]; let acc = 0;
  toks.forEach(tk => { const ww = B.measure(tk.w, size); if (acc + ww > maxW && lines[lines.length - 1].length) { lines.push([]); acc = 0; } lines[lines.length - 1].push({ ...tk, ww }); acc += ww + sp; });
  const lh = size * 1.12, ty = y + 58 + (h - 58 - lines.length * lh) / 2 + lh / 2; const total = toks.length; let idx = 0;
  lines.forEach((l, li) => { const lw = l.reduce((a, tk) => a + tk.ww + sp, -sp); let xx = x + w / 2 - lw / 2; l.forEach(tk => { const wk = clamp((tS - .05) / .4 * total - idx); idx++; if (wk > 0) { B.txt(tk.w, xx, ty + li * lh, { size, write: wk }); if (tk.b && wk >= 1) B.line(xx, ty + li * lh + size * .42, xx + tk.ww, ty + li * lh + size * .42, { w: 1.4, nib: false, alpha: .9 }); } xx += tk.ww + sp; }); }); }
// bottom band: drawing only (no text): a viewer with the low sun behind, their long shadow, rain and a low bow ahead
function band(t) { const hz = 1700; B.line(110, hz, 880, hz, { w: 2, nib: false, alpha: .8 }); B.hatch([[110, hz], [880, hz], [880, hz + 120], [110, hz + 120]], { sp: 12, alpha: .3 });
  sun(170, 1580, 34, t); person(330, hz, 1.1); B.line(330, hz, 520, hz + 8, { w: 4, nib: false, alpha: .6 });
  g.save(); g.beginPath(); g.rect(100, 1450, 880, hz - 1450); g.clip(); bands(660, hz + 30, 200, Math.PI, TAU, { bw: 7, alpha: .75 }); g.restore(); rain(500, 870, 1470, hz, t, .35, 30); }

function scene(t) {
  B.begin(); header(t);
  const [cx, cy, z] = camAt(t); B.camBegin(cx, cy, z); fig1(t); fig2(t); fig3(t); fig4(t); fig5(t); fig6(t); fig7(t); B.camEnd();
  if (t > s(12) + 4.2 && t < s(13) - .2) B.stamp('CIRCLE', 760, 560, R(t, s(12) + 4.2, .35), { size: 60 });
  if (t > s(14) - .1) { const k = R(t, s(14) - .1, .6); g.save(); g.globalAlpha = .7 * k; g.fillStyle = '#f4f2ea'; g.fillRect(VP.x + 9, VP.y + 1, VP.w - 18, VP.h - 2); g.restore();
    const bx = 150, by = 500, bw = 780, bh = 400; g.save(); g.globalAlpha = k; g.fillStyle = 'rgba(252,251,247,.96)'; g.fillRect(bx, by, bw, bh); g.restore(); B.rect(bx, by, bw, bh, { w: 3, draw: k, nib: false }); B.rect(bx + 9, by + 9, bw - 18, bh - 18, { w: 1.2, draw: k, nib: false });
    B.txt('Follow for more of', 540, by + 90, { size: 70, align: 'center', write: R(t, s(14) + .1, .8) }); B.txt('how it really works.', 540, by + 175, { size: 70, align: 'center', write: R(t, s(14) + .6, .8) });
    B.line(210, by + 225, 870, by + 225, { w: 2, draw: R(t, s(14) + 1.2, .5), nib: false }); B.txt("A new 'wait, really?' every day.", 540, by + 285, { size: 46, align: 'center', write: R(t, s(14) + 1.4, .7) }); B.txt('@howitreallyworkstudio', 540, by + 350, { size: 40, align: 'center', write: R(t, s(14) + 1.8, .7) }); }
  band(t);
  let ci = 0; PH.forEach((p, k) => { if (t >= p.start - .05) ci = k; }); if (ci >= 0 && ci < PH.length - 1) note(ci + 1, PH[ci].cap, ci === 0 ? 9 : t - PH[ci].start + .05);
  const status = t < s(1) + .5 ? 'AN ARC?' : t < s(12) ? 'PART OF A CIRCLE' : 'CIRCLE · HALF HIDDEN';
  titleBlock(t, status);
}
window.DUR = TL.total;
// loop: the last 0.5 s blends at most 40% of frame 0 over the end card
const LOOP = document.createElement('canvas'); LOOP.width = W; LOOP.height = H;
window.seek = t => { const Tt = TL.total, lp = clamp((t - (Tt - .5)) / .5); if (lp > 0) { scene(0); LOOP.getContext('2d').drawImage(g.canvas, 0, 0); } scene(t); if (lp > 0) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = .4 * ss(lp); g.drawImage(LOOP, 0, 0); g.restore(); } };
window.render = window.seek;
window.thumb = () => { B.begin(); header(0); B.camBegin(540, 760, .8); fig1(0); B.camEnd(); band(0);
  g.save(); g.fillStyle = 'rgba(252,251,247,.96)'; g.fillRect(120, 1100, 840, 330); g.restore(); B.rect(120, 1100, 840, 330, { w: 3, nib: false }); B.txt('WHY ARE', 540, 1215, { size: 120, align: 'center' }); B.txt('RAINBOWS CURVED?', 540, 1350, { size: 100, align: 'center' });
  B.stamp('CIRCLE', 780, 600, 1, { size: 60 }); };
window.seek(0); window.ready = true; window.READY = true;
