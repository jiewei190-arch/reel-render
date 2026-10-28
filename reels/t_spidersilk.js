// t_spidersilk.js: "Why spider silk is so strong for its weight" in template #3 blueprint (lemo-opuscar/styles/blueprint grammar, same module as lock).
// 1080x1920 Canvas2D, deterministic, pure function of t. Cyanotype sheet, white line work drafted on with a glowing nib, FIG labels struck through
// and rewritten, NOTE boxes, callouts with leaders, dimension lines, hatching, parts list, title block whose STATUS carries the story, one red stamp.
import { createBP, W, H, VP, DASH, C, clamp, lerp, ramp, ss, eo, bo, hash } from './styles/blueprint/blueprint.js';
await Promise.all(['700 40px "Caveat"', '600 20px "Poppins"', '800 40px "Poppins"'].map(f => document.fonts.load(f)));
const TL = window.TL, PH = TL.p, s = i => PH[i].start, e = i => PH[i].end;
const B = createBP(document.getElementById('c')), g = B.g, R = ramp, TAU = Math.PI * 2;
const tint = (pts, a) => { g.save(); g.globalAlpha = B.S.A * a; g.fillStyle = '#E7F0F9'; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill(); g.restore(); };
const circPts = (cx, cy, rx, ry = rx, n = 48, a0 = 0, a1 = TAU) => Array.from({ length: n + 1 }, (_, i) => { const a = lerp(a0, a1, i / n); return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
function callout(txt, x, y, tx, ty, k, o = {}) { if (k <= .02) return; const size = o.size || 34, w = B.measure(txt, size) + 30, h = size * 1.3, lk = ss(clamp(k * 1.5)), by = y + (ty > y ? h / 2 : -h / 2);
  B.line(x, by, lerp(x, tx, lk), lerp(by, ty, lk), { w: 1.4, nib: false }); if (lk >= 1) { g.save(); g.globalAlpha = B.S.A; g.fillStyle = C.ink; g.beginPath(); g.arc(tx, ty, 4.5 * B.S.k, 0, 7); g.fill(); g.restore(); }
  B.paper([[x - w / 2, y - h / 2], [x + w / 2, y - h / 2], [x + w / 2, y + h / 2], [x - w / 2, y + h / 2]], .96); B.rect(x - w / 2, y - h / 2, w, h, { w: 1.6, nib: false, draw: clamp(k * 2) }); B.txt(txt, x, y + 2, { size, align: 'center', write: R(k, .3, .7), font: 'Poppins', weight: 600 }); }

// ---------- the orb web (front view). disp(x,y) -> [dx,dy] lets an impact dent it ----------
const WC = [540, 760], NR = 24, RR = 400;
function web(t, o = {}) { const [cx, cy] = o.c || WC, rr = o.r || RR, d = o.disp || (() => [0, 0]), dr = o.draw ?? 1, P = (x, y) => { const [a, b] = d(x, y); return [x + a, y + b]; };
  const rad = []; for (let i = 0; i < NR; i++) { const a = i / NR * TAU + .07, L = rr * (.86 + .14 * hash(i * 3.1)); const pts = []; for (let k = 0; k <= 12; k++) pts.push(P(cx + Math.cos(a) * L * k / 12, cy + Math.sin(a) * L * k / 12)); rad.push({ a, L, pts }); }
  rad.forEach((r, i) => B.poly(r.pts, { w: (o.radW || 1.8), draw: R(dr, i / NR * .4, .5), nib: i % 6 === 0, alpha: o.radA ?? 1 }));
  // frame threads between spoke tips
  const tips = rad.map(r => r.pts[12]); B.poly(tips, { w: 2.4, close: true, draw: R(dr, .2, .5), nib: false, alpha: .9 });
  // capture spiral: a continuous spiral from the outside in
  const sp = []; const turns = 15, rIn = 60; for (let k = 0; k <= turns * NR; k++) { const ri = k / NR, a = rad[k % NR].a, L = rad[k % NR].L * (1 - ri / turns * (1 - rIn / rr)); sp.push(P(cx + Math.cos(a) * L * .94, cy + Math.sin(a) * L * .94)); }
  B.poly(sp, { w: o.spW || 1.2, draw: R(dr, .45, .55), nib: true, alpha: o.spA ?? .85 });
  if (o.glue) for (let k = 0; k < sp.length - 1; k += 3) { const [x, y] = sp[k]; g.save(); g.globalAlpha = B.S.A * o.glue; g.fillStyle = C.ink; g.beginPath(); g.arc(x, y, 3.2, 0, TAU); g.fill(); g.restore(); }
  B.circ(cx, cy, 34, { w: 1.6, draw: R(dr, .6, .3), nib: false }); return { rad, sp }; }
// impact dent: gaussian bump around the hit point, pushed down-right (oblique view of the out-of-plane deflection)
const dent = (hx, hy, A) => (x, y) => { const f = Math.exp(-((x - hx) ** 2 + (y - hy) ** 2) / (2 * 150 * 150)) * A; return [f * .35, f]; };
// a fly in technical line work
function fly(x, y, sc, t, o = {}) { g.save(); g.translate(x, y); g.rotate(o.rot || 0); g.scale(sc, sc); const fl = Math.sin(t * 60) * .3, dr = o.draw ?? 1;
  const body = circPts(0, 0, 46, 22, 30); B.paper(body, .95); tint(body, .14); B.poly(body, { w: 2.4, close: true, draw: dr, nib: false }); B.hatch(body, { sp: 9, alpha: .35, draw: dr });
  const head = circPts(52, 0, 18, 18, 24); B.paper(head, .95); B.poly(head, { w: 2.4, close: true, draw: dr, nib: false }); B.circ(58, -6, 6, { w: 1.6, nib: false, draw: dr });
  for (const sd of [-1, 1]) { const wg = circPts(-6, sd * 34, 40, 15, 24).map(([a, b]) => [a, b * (o.still ? 1 : 1 + fl * sd)]); B.poly(wg, { w: 1.6, close: true, draw: dr, nib: false, alpha: .9, dash: DASH.hidden }); }
  for (let i = 0; i < 3; i++) B.poly([[10 - i * 16, 14], [4 - i * 20, 36], [-6 - i * 20, 44]], { w: 1.4, draw: dr, nib: false }); g.restore(); }
// orb weaver in section (FIG 3): abdomen with silk gland, duct and spinneret spigot
function spiderSection(t, t0) { const k1 = R(t, t0, 1.4), k2 = R(t, t0 + 1.2, 1.2), k3 = R(t, t0 + 2.2, 1.2);
  const ab = circPts(560, 720, 300, 240, 60), ce = circPts(170, 640, 120, 100, 40); B.paper(ab, .9); B.paper(ce, .9);
  B.hatch(ab, { sp: 16, alpha: .2, draw: k1, holes: [circPts(520, 700, 150, 95, 40)] }); B.poly(ab, { w: 3, close: true, draw: k1 }); B.poly(ce, { w: 3, close: true, draw: k1 });
  [-1.9, -2.5, 2.5, 1.9].forEach((a, i) => { const bx = 170 + Math.cos(a) * 110, by = 640 + Math.sin(a) * 92, kx = bx + Math.cos(a) * 150, ky = by + Math.sin(a) * 120 - 110, fx = kx + Math.cos(a) * 70, fy = ky + 260; B.poly([[bx, by], [kx, ky], [fx, fy]], { w: 2.6, draw: k1, nib: false }); B.poly([[bx + 12, by + 6], [kx + 10, ky + 10], [fx + 8, fy]], { w: 1.2, draw: k1, nib: false, alpha: .5 }); });
  B.poly([[0, 780], [920, 780]], { w: 1.1, dash: DASH.centre, draw: k1, nib: false, alpha: .6 });
  // gland (liquid): dashed fill lines = fluid, duct tapering to the spigot at the rear
  const gl = circPts(520, 700, 150, 95, 40); B.poly(gl, { w: 2.6, close: true, draw: k2 }); for (let i = 0; i < 6; i++) B.poly([[400 + i * 8, 650 + i * 22], [640 - i * 8, 650 + i * 22]], { w: 1.2, dash: [8, 10], draw: k2, nib: false, alpha: .6 });
  B.poly([[660, 720], [760, 760], [820, 840], [850, 900]], { w: 2.4, draw: k3 }); B.poly([[650, 690], [770, 735], [840, 830], [862, 896]], { w: 2.4, draw: k3, nib: false });
  const sp = [[830, 890], [880, 890], [872, 940], [838, 940]]; B.paper(sp, .95); B.poly(sp, { w: 2.6, close: true, draw: k3 });
  const fk = R(t, s(5) + .6, 2.2); if (fk > 0) B.poly([[855, 940], [855, lerp(940, 1300, fk)]], { w: 3, draw: 1 }); }
// tensile test rig (FIG 2)
function tensile(t, t0) { const k = R(t, t0, 1.2); B.rect(150, 300, 780, 40, { w: 2.6, draw: k }); B.hatch([[150, 300], [930, 300], [930, 340], [150, 340]], { draw: k, alpha: .45 });
  const lab = [['STEEL WIRE', 330], ['SILK THREAD', 750]]; lab.forEach(([l, x], i) => { const kk = R(t, t0 + .3 + i * .3, 1); B.poly([[x, 340], [x, 900]], { w: i ? 2 : 4, draw: kk });
    const wt = [[x - 70, 900], [x + 70, 900], [x + 90, 1060], [x - 90, 1060]]; B.paper(wt, .95); tint(wt, .1); B.hatch(wt, { draw: kk, alpha: .35, sp: 11 }); B.poly(wt, { w: 2.6, close: true, draw: kk });
    B.txt('LOAD', x, 1000, { size: 34, align: 'center', font: 'Poppins', weight: 600, write: R(kk, .6, .4) }); B.txt(l, x, 1130, { size: 44, align: 'center', write: R(t, t0 + .8 + i * .3, .6) }); });
  B.dim(430, 340, 430, 900, 'SAME THICKNESS', { off: 120, draw: R(t, t0 + 1.4, .8), size: 28 });
  const g1 = R(t, t0 + 2.0, .8); B.txt('~1 GPa', 330, 640, { size: 56, align: 'center', write: g1 }); B.txt('~1 GPa', 750, 640, { size: 56, align: 'center', write: R(t, t0 + 2.4, .8) });
  B.txt('(mid-range steel: 0.2 to 2 GPa)', 540, 1220, { size: 36, align: 'center', write: R(t, t0 + 2.9, .8), alpha: .85 }); }
function scale(t, t0) { const k = R(t, t0, .8), tilt = .22 * ss(R(t, t0 + .6, 1)); const cx = 540, cy = 520; B.poly([[cx, cy], [cx, 1120]], { w: 3, draw: k }); B.rect(cx - 140, 1120, 280, 30, { w: 2.4, draw: k });
  const ax = Math.cos(tilt) * 330, ay = Math.sin(tilt) * 330; B.poly([[cx - ax, cy - ay], [cx + ax, cy + ay]], { w: 3.4, draw: k }); B.circ(cx, cy, 14, { w: 2, draw: k, nib: false });
  [[-1, cx - ax, cy - ay, 'SILK', 1], [1, cx + ax, cy + ay, 'STEEL', 6]].forEach(([sd, px, py, l, n]) => { B.poly([[px, py], [px - 100, py + 200]], { w: 1.4, draw: k, nib: false }); B.poly([[px, py], [px + 100, py + 200]], { w: 1.4, draw: k, nib: false });
    B.poly([[px - 130, py + 200], [px + 130, py + 200]], { w: 3, draw: k }); for (let i = 0; i < n; i++) { const bx = px - 100 + (i % 3) * 70, by = py + 160 - Math.floor(i / 3) * 40; const bk = [[bx, by], [bx + 60, by], [bx + 60, by + 38], [bx, by + 38]]; B.paper(bk, .95); B.hatch(bk, { sp: 9, alpha: .4, draw: k }); B.poly(bk, { w: 2, close: true, draw: k, nib: false }); }
    B.txt(l, px, py + 270, { size: 46, align: 'center', write: R(t, t0 + .5, .5) }); });
  B.txt('SAME LENGTH, SAME STRENGTH', 540, 380, { size: 40, align: 'center', write: R(t, t0 + .3, .8), font: 'Poppins', weight: 600 }); B.txt('×6 HEAVIER', 820, 1060, { size: 54, align: 'center', write: R(t, t0 + 1.2, .6) }); }
// stress-strain (FIG 4b)
function curves(t, t0) { const ox = 180, oy = 1150, w = 760, h = 760, k = R(t, t0, .8); B.alpha(1 - .8 * R(t, s(10) - .2, .5)); B.poly([[ox, oy - h], [ox, oy], [ox + w, oy]], { w: 2.6, draw: k }); B.arrowhead(ox, oy - h, -Math.PI / 2); B.arrowhead(ox + w, oy, 0);
  B.txt('FORCE', ox - 20, oy - h - 30, { size: 34, font: 'Poppins', weight: 600, write: k }); B.txt('STRETCH', ox + w - 20, oy + 60, { size: 34, font: 'Poppins', weight: 600, align: 'right', write: k });
  const st = [[ox, oy], [ox + 40, oy - 560], [ox + 60, oy - 600]]; B.poly(st, { w: 2.4, draw: R(t, t0 + .4, .6), dash: DASH.hidden }); B.txt('steel', ox + 80, oy - 610, { size: 40, write: R(t, t0 + .8, .4) });
  const sk = []; for (let i = 0; i <= 30; i++) { const u = i / 30; sk.push([ox + u * 620, oy - (u < .1 ? u * 4200 : 420 + (u - .1) * 280)]); } const kk = R(t, t0 + .8, 1.2); B.poly(sk, { w: 3.4, draw: kk });
  if (kk >= 1) { const area = [[ox, oy], ...sk, [ox + 620, oy]]; B.hatch(area, { sp: 14, alpha: .5, draw: R(t, t0 + 1.9, .8) }); B.txt('silk', ox + 640, oy - 600, { size: 44, write: R(t, t0 + 1.9, .4) }); }
  callout('ENERGY SOAKED UP', 600, oy - 260, 520, oy - 140, R(t, t0 + 2.4, .5), { size: 32 }); B.alpha(1);
  const kv = R(t, s(10), .8); if (kv > 0) { B.txt('TOUGHNESS, PER WEIGHT', 540, 470, { size: 34, font: 'Poppins', weight: 600, align: 'center', write: kv }); [['KEVLAR', .62], ['SOME SPIDER SILKS', .9]].forEach(([l, v], i) => { const y = 560 + i * 120; B.txt(l, 120, y + 30, { size: 36, write: kv }); const bw = 420 * v * ss(R(t, s(10) + .4 + i * .3, .8)); const r = [[520, y], [520 + bw, y], [520 + bw, y + 40], [520, y + 40]]; if (bw > 2) { B.paper(r, .9); B.hatch(r, { sp: 9, alpha: .55 }); B.poly(r, { w: 2, close: true, nib: false }); } }); } }

// ---------- figure schedule ----------
const FIGS = [[0, 'FIG. 1', 'IMPACT TEST'], [s(2) - .2, 'FIG. 2', 'TENSILE TEST'], [s(3) - .2, 'FIG. 2', 'PER WEIGHT'], [s(4) - .2, 'FIG. 3', 'SPINNING, SECTION'], [s(6) - .2, 'FIG. 3', 'SILK GLANDS'],
  [s(7) - .2, 'FIG. 4', 'IMPACT'], [s(9) - .2, 'FIG. 4', 'FORCE vs STRETCH'], [s(11) - .2, 'FIG. 5', 'ENERGY BUDGET'], [s(14) - .2, 'FIG. 6', 'FIELD NOTE'], [s(15) - .2, 'SPEC', 'SUMMARY']];
function figLabel(t) { let i = 0; FIGS.forEach((f, k) => { if (t >= f[0]) i = k; }); const f = FIGS[i], old = i > 0 ? FIGS[i - 1] : null; return { fig: f[1], figSub: f[2], figK: old ? R(t, f[0], .9) : 1, figOld: old ? old[1] + (old[2] ? '  ·  ' + old[2] : '') : '' }; }
const segOf = t => { let i = 0; FIGS.forEach((f, k) => { if (t >= f[0]) i = k; }); return i; };

function figure(t) { const i = segOf(t);
  if (i === 0) { // impact test: web already drafted at frame 0, fly hits at ~1.1 s, silk soaks it up (no bounce)
    const hit = 1.15, u = t - hit, A = u > 0 ? 120 * (1 - Math.exp(-u * 9)) * Math.exp(-u * .9) + 30 * (u > 0 ? 1 - Math.exp(-u * 2) : 0) : 0; const hx = 640, hy = 700;
    B.camBegin(540, 760, 1.05 + .04 * ss(R(t, 0, 7))); web(t, { disp: dent(hx, hy, A), glue: R(t, s(1), .8) });
    const fx = u < 0 ? lerp(180, hx, ss(clamp(t / hit)) ** .8) : hx + A * .35, fy = u < 0 ? lerp(470, hy, clamp(t / hit)) : hy + A; if (u < 0) B.poly([[60, 430], [fx - 60, fy - 20]], { w: 1.6, dash: DASH.hidden, nib: false, alpha: .7 });
    fly(fx, fy, 1.6, t, { rot: .35, still: u > 0 }); B.camEnd();
    if (t < s(1)) { B.txt('STOPS A', 540, 340, { size: 96, align: 'center', font: 'Poppins', weight: 800 }); B.txt('FLYING BUG', 540, 450, { size: 96, align: 'center', font: 'Poppins', weight: 800 }); }
    else { B.txt('STRONGER THAN STEEL?', 540, 330, { size: 60, align: 'center', font: 'Poppins', weight: 800, write: R(t, s(1) - .1, .6) }); B.line(150, 312, lerp(150, 930, R(t, s(1) + 1.2, .5)), 312, { w: 6, nib: false }); B.txt('MYTH (SORT OF)', 540, 420, { size: 60, align: 'center', write: R(t, s(1) + 1.6, .6) }); }
    return; }
  if (i === 1) { B.camBegin(540, 760, 1); tensile(t, s(2) - .2); B.camEnd(); return; }
  if (i === 2) { B.camBegin(540, 760, 1); scale(t, s(3) - .2); const k = R(t, s(3) + 2.2, .6); if (k > 0) { B.txt('STRENGTH ÷ WEIGHT', 540, 1240, { size: 44, align: 'center', font: 'Poppins', weight: 600, write: k }); } B.camEnd(); return; }
  if (i === 3) { B.camBegin(lerp(420, 560, ss(R(t, s(5), 2))), lerp(760, 840, ss(R(t, s(5), 2))), lerp(1, 1.15, ss(R(t, s(5), 2)))); spiderSection(t, s(4) - .2);
    callout('SILK GLAND: LIQUID PROTEIN', 520, 470, 520, 640, R(t, s(4) + 1.6, .5), { size: 30 }); callout('SPIGOT ON A SPINNERET', 700, 1180, 856, 920, R(t, s(5) + .4, .5), { size: 30 }); callout('SOLID FIBRE', 420, 1220, 855, 1200, R(t, s(5) + 2.4, .5), { size: 30 }); B.camEnd(); return; }
  if (i === 4) { B.camBegin(540, 760, 1); const rows = [['MAJOR AMPULLATE', 'draglines, spokes'], ['MINOR AMPULLATE', 'temporary spiral'], ['FLAGELLIFORM', 'capture spiral'], ['AGGREGATE', 'sticky glue'], ['ACINIFORM', 'wrapping prey'], ['TUBULIFORM', 'egg case'], ['PIRIFORM', 'anchors']];
    B.txt('SILK GLANDS, ORB WEAVER (UP TO 7)', 540, 330, { size: 36, font: 'Poppins', weight: 600, align: 'center', write: R(t, s(6) - .2, .6) }); B.line(120, 360, 960, 360, { w: 1.6, draw: R(t, s(6) - .2, .6), nib: false });
    rows.forEach(([a, b], k) => { const kk = R(t, s(6) + k * .28, .4), y = 450 + k * 118; B.txt(String(k + 1), 150, y, { size: 44, font: 'Poppins', weight: 600, align: 'center', write: kk }); B.txt(a, 200, y, { size: 46, write: kk }); B.txt(b, 640, y, { size: 40, write: kk, alpha: .85 }); B.line(120, y + 30, 960, y + 30, { w: 1, nib: false, alpha: .45, draw: kk }); }); B.camEnd(); return; }
  if (i === 5) { // a bug hits: first a springy net (phantom) flings it back out
    B.camBegin(540, 760, 1); const tr = t >= s(8) - .2, net = []; for (let k = 0; k <= 12; k++) net.push([180 + k * 60, 760]);
    if (!tr) { web(t, { radA: .9 }); const u = R(t, s(7) - .2, 2.4); fly(lerp(-60, 400, u), lerp(400, 640, u), 1.4, t, { rot: .4 }); B.txt('?', 760, 520, { size: 160, align: 'center', write: R(t, s(7) + 1.2, .3) }); }
    else { const u = t - s(8), bump = u < .7 ? Math.sin(clamp(u / .7) * Math.PI) * 160 : 0; const pts = net.map(([x, y]) => [x, y + bump * Math.sin((x - 180) / 720 * Math.PI)]); B.poly(pts, { w: 3, dash: DASH.phantom });
      B.poly([[180, 760], [180, 900]], { w: 2, nib: false }); B.poly([[900, 760], [900, 900]], { w: 2, nib: false }); for (let k = 0; k < 6; k++) B.spring(180 + k * 144, 900, 1000, { coils: 5, wd: 12, w: 1.6 });
      const fy = u < .7 ? 560 + bump : 560 + 160 * 0 - (u - .7) * 700, fx = 540 + (u > .7 ? (u - .7) * 260 : 0); fly(fx, Math.max(-100, fy), 1.4, t, { rot: u > .7 ? -1.2 : 1.57 });
      if (u > .7) B.poly([[540, 700], [fx, fy + 60]], { w: 1.6, dash: DASH.hidden, nib: false }); callout('FLUNG BACK OUT', 760, 1180, 560, 920, R(t, s(8) + 1.2, .5), { size: 32 }); B.txt('SPRINGY NET (NOT SILK)', 540, 330, { size: 40, align: 'center', font: 'Poppins', weight: 600, write: R(t, s(8), .6) }); }
    B.camEnd(); return; }
  if (i === 6) { B.camBegin(540, 760, 1); curves(t, s(9) - .2); B.camEnd(); return; }
  if (i === 7) { // energy budget: spokes take the hit, energy -> heat, then the sticky spiral holds it
    const hx = 600, hy = 700, u = t - (s(11) - .2), A = 110 * (1 - Math.exp(-u * 6)) * Math.exp(-u * .6) + 25; B.camBegin(540, 760, 1.05);
    const sp13 = t > s(13) - .1; web(t, { disp: dent(hx, hy, A), radW: t < s(13) - .1 ? 3.6 : 1.6, spW: sp13 ? 2.6 : 1.1, glue: sp13 ? 1 : .3 }); fly(hx + A * .35, hy + A, 1.5, t, { rot: .4, still: true });
    if (t < s(13) - .1) callout('SPOKES: MOST OF THE ENERGY', 540, 300, 470, 560, R(t, s(11), .5), { size: 30 });
    const hk = R(t, s(12) + .3, .8) * (1 - R(t, s(13) - .2, .3)); for (let k = 0; k < 5; k++) { const x0 = 440 + k * 60, wv = []; for (let j = 0; j <= 14; j++) wv.push([x0 + Math.sin(j * .9 + t * 6 + k) * 12, 640 - j * 22 - ((t * 60) % 22)]); if (hk > 0) B.poly(wv, { w: 2, alpha: hk, nib: false }); }
    if (hk > 0) B.txt('→ HEAT', 760, 380, { size: 64, write: hk });
    if (sp13) { callout('STICKY SPIRAL HOLDS IT', 540, 300, hx + 60, hy + 40, R(t, s(13), .5), { size: 30 }); B.dim(260, 1120, 820, 1120, 'UP TO ×10 STRETCHIER', { off: 60, draw: R(t, s(13) + 1.4, .8), size: 28 }); }
    B.camEnd(); return; }
  if (i === 8) { // Halloween field note: a web across a doorway, a pumpkin on the step
    B.camBegin(540, 760, 1); const k = R(t, s(14) - .2, 1.2); B.poly([[200, 1250], [200, 300], [880, 300], [880, 1250]], { w: 4, draw: k }); B.hatch([[160, 260], [920, 260], [920, 300], [160, 300]], { draw: k, alpha: .4 });
    web(t, { c: [540, 720], r: 330, draw: R(t, s(14), 1.4), glue: .6 }); const pk = R(t, s(14) + .8, 1); const pc = circPts(760, 1180, 90, 70, 36); B.paper(pc, .95); B.poly(pc, { w: 2.6, close: true, draw: pk });
    [-.5, 0, .5].forEach(o => B.poly(circPts(760 + o * 60, 1180, 30, 68, 20, -Math.PI / 2, Math.PI / 2), { w: 1.4, draw: pk, nib: false }));
    B.poly([[740, 1112], [750, 1080], [770, 1078]], { w: 2.4, draw: pk, nib: false }); callout('WHY IT CLINGS: GLUE + STRETCH', 470, 1180, 470, 820, R(t, s(14) + 1.6, .5), { size: 28 }); B.camEnd(); return; }
  // summary spec table + the one red stamp
  B.camBegin(540, 760, 1); const rows = [['STRONGER THAN STEEL, THREAD FOR THREAD', '✗'], ['STRONG FOR ITS WEIGHT', '✓'], ['TOUGH (SOAKS UP ENERGY)', '✓'], ['BUILT TO CATCH', '✓']];
  B.txt('SPECIFICATION', 540, 340, { size: 40, font: 'Poppins', weight: 600, align: 'center', write: R(t, s(15) - .2, .5) }); rows.forEach(([a, b], k) => { const kk = R(t, s(15) + .2 + k * .55, .5), y = 470 + k * 140; B.txt(a, 130, y, { size: a.length > 30 ? 40 : 50, write: kk }); B.txt(b, 930, y, { size: 70, align: 'center', write: kk }); B.line(120, y + 40, 960, y + 40, { w: 1, nib: false, alpha: .5, draw: kk }); });
  web(t, { c: [540, 1100], r: 170, glue: 1, radA: .7, spA: .6 }); B.stamp('BUILT TO CATCH', 540, 1180, R(t, s(15) + 2.8, .45), { size: 62, rot: -.12 }); B.camEnd(); }

// ---------- frame ----------
function scene(t) { B.begin(); const fl = figLabel(t); B.frame({ ...fl, title: 'SPIDER SILK', sheetN: '1 / 1' }); figure(t);
  if (t > s(16) - .1) { const k = R(t, s(16) - .1, .6); g.save(); g.globalAlpha = .55 * k; g.fillStyle = '#18336B'; g.fillRect(VP.x + 9, VP.y + 1, VP.w - 18, VP.h - 2); g.restore();
    const bx = 150, by = 520, bw = 780, bh = 300; g.save(); g.globalAlpha = k; g.fillStyle = 'rgba(14,34,82,.92)'; g.fillRect(bx, by, bw, bh); g.restore(); B.rect(bx, by, bw, bh, { w: 3, draw: k, nib: false }); B.rect(bx + 9, by + 9, bw - 18, bh - 18, { w: 1.3, draw: k, nib: false });
    B.txt('HOW IT REALLY WORKS', 540, by + 118, { size: 84, align: 'center', write: R(t, s(16) + .15, .9) }); B.line(210, by + 178, 870, by + 178, { w: 2, draw: R(t, s(16) + .9, .5), nib: false }); B.txt('@howitreallyworkstudio', 540, by + 232, { size: 34, font: 'Poppins', weight: 600, align: 'center', ls: 2, write: R(t, s(16) + 1.1, .6) }); }
  let ci = -1; PH.forEach((p, k) => { if (t >= p.start - .1) ci = k; }); if (ci >= 0) B.note(ci + 1, PH[ci].cap, t - PH[ci].start + .1);
  const status = t < s(1) ? 'TESTING' : t < s(3) ? 'MYTH?' : t < s(7) ? 'WINS PER WEIGHT' : t < s(12) ? 'IMPACT TEST' : t < s(15) ? 'BUG CAUGHT' : 'BUILT TO CATCH';
  B.titleBlock({ status, title: 'ORB-WEB SILK', write: 1 }); }
window.DUR = TL.total;
window.seek = t => { scene(t); const fade = Math.min(1, (TL.total - t) / .4); if (fade < 1) { g.save(); g.globalAlpha = (1 - fade) * .45; g.fillStyle = '#0D1116'; g.fillRect(0, 0, W, H); g.restore(); } };
window.render = window.seek;
// thumbnail: the web with the caught fly + "STRONGER THAN STEEL?" struck, "NOT QUITE" lettered
window.thumb = () => { B.begin(); B.frame({ fig: 'FIG. 1', figSub: 'IMPACT TEST', title: 'SPIDER SILK' }); B.camBegin(540, 820, 1.1); web(3, { disp: dent(640, 700, 60), glue: 1 }); fly(661, 760, 1.6, 3, { rot: .35, still: true }); B.camEnd();
  g.save(); g.fillStyle = 'rgba(14,34,82,.85)'; g.fillRect(90, 300, 900, 330); g.restore(); B.txt('STRONGER', 540, 420, { size: 120, align: 'center', font: 'Poppins', weight: 800 }); B.txt('THAN STEEL?', 540, 560, { size: 120, align: 'center', font: 'Poppins', weight: 800 });
  B.stamp('NOT QUITE', 700, 1300, 1, { size: 90, rot: -.12 }); B.titleBlock({ status: 'MYTH?', title: 'ORB-WEB SILK' }); };
window.seek(0); window.ready = true; window.READY = true;
