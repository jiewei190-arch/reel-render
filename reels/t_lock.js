// t_lock.js: "How a pin tumbler lock really works" in the Blueprint style (lemo-opuscar/styles/blueprint grammar).
// 1080x1920 Canvas2D, deterministic, pure function of t. Pins really ride the key's top edge, so lift/alignment are computed, not keyed.
import { createBP, W, H, VP, DASH, C, clamp, lerp, ramp, ss, eo, bo, hash } from './styles/blueprint/blueprint.js';
await Promise.all(['700 40px "Caveat"', '600 20px "Poppins"', '800 40px "Poppins"'].map(f => document.fonts.load(f)));
const TL = window.TL, PH = TL.p, s = i => PH[i].start, e = i => PH[i].end;
const B = createBP(document.getElementById('c')), g = B.g;
const R = (t, t0, d) => ramp(t, t0, d);

// ---------- lock geometry (sheet units) ----------
const X = [290, 410, 530, 650, 770], YS = 650, CT = 470, KC = 770, KF = 880, CH = 34, PW = 25, DL = 130;
const L = [90, 60, 120, 75, 105];                 // key pin lengths
const ER = [740, 710, 770, 725, 755];             // right key: top-edge height at each pin (edge = YS + L)
const EW = [715, 725, 745, 700, 760];             // wrong key
const UF = [570, 450, 330, 210, 90];              // key-local distance from tip to each pin when fully inserted
const TIP0 = 150, TIP1 = 860, VAL = 806;
const tipX = ins => lerp(TIP0, TIP1, ins);
function keyPts(ed) {                              // key top edge as (u,y) from the tip
  const p = [[0, 846]];
  for (let k = 4; k >= 0; k--) { const u = UF[k], y = ed[k]; p.push([u - 12 - (VAL - y) * .26, VAL]); p.push([u - 12, y]); p.push([u + 12, y]); p.push([u + 36, VAL]); }
  p.splice(1, 1); p.push([UF[0] + 70, 770]); p.push([740, 770]); return p;
}
const profAt = (pts, u) => { if (u < 0 || u > pts[pts.length - 1][0]) return 1e9; for (let i = 1; i < pts.length; i++) if (u <= pts[i][0]) { const a = pts[i - 1], b = pts[i], k = (u - a[0]) / ((b[0] - a[0]) || 1); return lerp(a[1], b[1], k); } return 1e9; };

// ---------- key schedule ----------
const MIDX = 1;                                    // cut index changed in the "change one cut" beat
function keyState(t) {
  const hid = -.5;
  if (t < s(1) + .1) return { ty: 'R', ins: 1 };
  if (t < s(1) + 1.3) return { ty: 'R', ins: lerp(1, hid, ss(R(t, s(1) + .1, 1.1))) };
  if (t < s(6) + .3) return { ty: 'R', ins: hid };
  if (t < s(10)) return { ty: 'R', ins: lerp(hid, 1, ss(R(t, s(6) + .3, e(7) + .3 - s(6) - .3))) };
  if (t < s(10) + 1.0) return { ty: 'R', ins: lerp(1, hid, ss(R(t, s(10), 1.0))) };
  if (t < s(12)) return { ty: 'W', ins: lerp(hid, 1, ss(R(t, s(10) + 1.0, e(10) + .2 - s(10) - 1.0))) };
  if (t < s(12) + .9) return { ty: 'W', ins: lerp(1, hid, ss(R(t, s(12), .9))) };
  return { ty: 'R', ins: lerp(hid, 1, ss(R(t, s(12) + .9, 1.5))) };
}
function edges(t, ty) {
  if (ty === 'W') return EW; const ed = ER.slice();
  if (t > s(12) + 2.4 && t < s(15) + .1) ed[MIDX] = lerp(ER[MIDX], ER[MIDX] + 25, ss(R(t, s(12) + 2.4, .8)));
  return ed;
}
const keyPts0 = {};
function pins(t) {                                  // computed pin state
  const ks = keyState(t), ed = edges(t, ks.ty), kp = keyPts(ed), tx = tipX(ks.ins);
  const lift = t < s(6) ? 20 * (1 - bo(R(t, s(5) + .1, .65))) * (t > s(5) ? 1 : 0) : 0;
  return { ks, ed, kp, tx, pin: X.map((x, i) => { let m = 1e9; for (let d = -PW; d <= PW; d += 5) m = Math.min(m, profAt(kp, tx - (x + d))); const yb = Math.min(KC, m) - (t < s(6) ? lift : 0); const joint = yb - L[i]; return { x, yb, joint, ok: Math.abs(joint - YS) < 1.6 }; }) };
}

// ---------- camera ----------
const CAM = [[540, 790, 1], [540, 775, 1], [540, 700, 1.45], [540, 700, 1.45], [540, 700, 1.4], [540, 710, 1.45], [500, 760, 1.1], [540, 760, 1.5], [540, 740, 1.7], [540, 1130, 1.02], [540, 760, 1.3], [540, 740, 1.7], [540, 760, 1.35], [540, 775, 1], [540, 775, 1], [540, 775, 1], [540, 775, 1]];
function camAt(t) { let i = 0; for (let k = 0; k < PH.length; k++) if (t >= PH[k].start - .05) i = k; const a = CAM[Math.max(0, i - 1)], b = CAM[i], u = ss(R(t, s(i) - .05, 1.0)); return [lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)]; }

// ---------- parts ----------
const tint = (pts, a) => { g.save(); g.globalAlpha = B.S.A * a; g.fillStyle = '#E7F0F9'; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill(); g.restore(); };
const circPts = (cx, cy, r, n = 48) => Array.from({ length: n }, (_, i) => [cx + Math.cos(i / n * Math.PI * 2) * r, cy + Math.sin(i / n * Math.PI * 2) * r]);
const chambers = [].concat(X.map(x => [[x - CH, CT], [x + CH, CT], [x + CH, YS], [x - CH, YS]]), X.map(x => [[x - CH, YS], [x + CH, YS], [x + CH, KC], [x - CH, KC]]));
function callout(txt, x, y, tx, ty, k, o = {}) {                         // text tag with leader (drawn in sheet space)
  if (k <= .02) return; const size = o.size || 36, w = B.measure(txt, size) + 30, h = size * 1.3; const lk = ss(clamp(k * 1.5));
  const bx = x, by = y + (ty > y ? h / 2 : -h / 2); B.line(bx, by, lerp(bx, tx, lk), lerp(by, ty, lk), { w: 1.4, nib: false }); if (lk >= 1) { g.save(); g.globalAlpha = B.S.A; g.fillStyle = C.ink; g.beginPath(); g.arc(tx, ty, 4.5 * B.S.k, 0, 7); g.fill(); g.restore(); }
  B.paper([[x - w / 2, y - h / 2], [x + w / 2, y - h / 2], [x + w / 2, y + h / 2], [x - w / 2, y + h / 2]], .96); B.rect(x - w / 2, y - h / 2, w, h, { w: 1.6, nib: false, draw: clamp(k * 2) }); B.txt(txt, x, y + 2, { size, align: 'center', write: R(k, .3, .7), font: 'Poppins', weight: 600 }); }
function keyDraw(P, t, show) {
  const { tx, kp, ks } = P; const poly = kp.map(([u, y]) => [tx - u, y]); poly.push([tx - 800, 860], [tx - 0, 860]); // blade body
  const bow = circPts(tx - 830, 810, 62);
  const dr = show;
  B.paper(poly, .93); tint(poly, .1); B.hatch(poly, { ang: -Math.PI / 4, sp: 18, alpha: .18, draw: 1 });
  B.poly(poly, { w: 2.4, close: true, draw: dr }); B.poly(bow, { w: 2.4, close: true, draw: dr }); B.circ(tx - 830, 810, 20, { w: 2, draw: dr });
  B.poly([[tx - 770, 770], [tx - 770, 860]], { w: 1.2, draw: dr, nib: false, alpha: .8 });
}
function lockStatic(t) {
  const T = (a, d) => R(t, a, d); const h1 = T(s(1) + .3, 1.6), h2 = T(s(1) + 1.2, 1.4), h3 = T(s(1) + 2.0, 1.3);
  // centre lines first (drafting order)
  X.forEach((x, i) => B.poly([[x, 410], [x, 1000]], { w: 1.2, dash: DASH.centre, draw: T(s(1) + .1 + i * .08, .9), alpha: .75, nib: false }));
  B.poly([[130, 780], [960, 780]], { w: 1.2, dash: DASH.centre, draw: T(s(1) + .1, 1.2), alpha: .7, nib: false });
  // hatching + outlines
  const hs = [[[170, 440], [910, 440], [910, 650], [170, 650]], [[170, 910], [910, 910], [910, 975], [170, 975]], [[880, 650], [910, 650], [910, 910], [880, 910]]];
  const hole = X.map(x => [[x - CH, CT], [x + CH, CT], [x + CH, YS], [x - CH, YS]]);
  const hp = [[190, 650], [880, 650], [880, 910], [190, 910], [190, 880], [870, 880], [870, 770], [190, 770]];
  const holeP = X.map(x => [[x - CH, YS], [x + CH, YS], [x + CH, KC], [x - CH, KC]]);
  B.hatch(hs[0], { draw: T(s(1) + 1.6, 1.6), holes: hole, alpha: .5 }); B.hatch(hs[1], { draw: T(s(1) + 1.8, 1.4) }); B.hatch(hs[2], { draw: T(s(1) + 1.8, 1.4) });
  B.hatch(hp, { ang: -Math.PI / 4, sp: 11, alpha: .4, draw: T(s(1) + 2.4, 1.6), holes: holeP });
  B.poly(hs[0], { w: 3, close: true, draw: h1 }); B.poly(hs[1], { w: 3, close: true, draw: h1 }); B.poly(hs[2], { w: 3, close: true, draw: h1 });
  B.poly(hp, { w: 3, close: true, draw: h2 });
  B.poly([[190, 880], [190, 910]], { w: 1.4, nib: false, draw: h2 });
  // shear line (phantom)
  const sh = T(s(2) + .3, 1.3); B.poly([[150, YS], [930, YS]], { w: 2.4, dash: DASH.phantom, draw: sh, alpha: 1 });
  if (sh >= 1) { const pu = .5 + .5 * Math.sin(t * 5); if (t > s(2) && t < e(2) + .6) B.poly([[150, YS], [930, YS]], { w: 7, alpha: .16 + .1 * pu, nib: false }); }
  // chambers (double lines + caps)
  X.forEach((x, i) => { const d = T(s(3) + .2 + i * .22, .7); B.poly([[x - CH, YS], [x - CH, CT], [x + CH, CT], [x + CH, YS]], { w: 2.2, draw: d }); B.poly([[x - CH, YS], [x - CH, KC]], { w: 2.2, draw: d, nib: false }); B.poly([[x + CH, YS], [x + CH, KC]], { w: 2.2, draw: d, nib: false }); });
}
function pinStacks(t, P) {
  const tS = s(4) + .2, tD = s(4) + 1.1, tK = s(4) + 2.0; const rp = (i, t0, d) => R(t, t0 + i * .12, d);
  P.pin.forEach((p, i) => {
    const jt = p.joint, dt = jt - DL, ky = p.yb;
    const sp = rp(i, tS, .8), dv = rp(i, tD, .8), kv = rp(i, tK, .8);
    if (sp > 0) B.spring(p.x, CT, dt, { coils: 7, wd: 15, w: 2.2, draw: sp });
    if (dv > 0) { const dp = [[p.x - PW, dt], [p.x + PW, dt], [p.x + PW, jt], [p.x - PW, jt]]; if (dv > .99) tint(dp, .14); B.poly(dp, { w: 2.4, close: true, draw: dv }); }
    if (kv > 0) { const kp = [[p.x - PW, jt], [p.x + PW, jt], [p.x + PW, ky - 16], [p.x, ky], [p.x - PW, ky - 16]]; if (kv > .99) tint(kp, .26); B.poly(kp, { w: 2.4, close: true, draw: kv }); }
  });
}
function endView(t) {                                         // FIG. 3: rear view, plug turns, cam retracts the bolt
  const t0 = s(9) - .3, cx = 330, cy = 1160; const d = R(t, t0, 1.6); if (d <= 0) return;
  const th = (Math.PI / 2) * ss(R(t, s(9) + 1.6, 1.6)) * (t < s(10) ? 1 : 0) + (t >= s(10) ? (Math.PI / 2) * (1 - ss(R(t, s(10) + .2, .8))) : 0);
  const ring = circPts(cx, cy, 150), hole = circPts(cx, cy, 104);
  B.hatch(ring, { holes: [hole], draw: d, alpha: .45 }); B.poly(ring, { w: 3, close: true, draw: d }); B.poly(hole, { w: 2.4, close: true, draw: d });
  B.poly([[cx - 190, cy], [cx + 190, cy]], { w: 1.1, dash: DASH.centre, draw: d, nib: false, alpha: .7 }); B.poly([[cx, cy - 190], [cx, cy + 190]], { w: 1.1, dash: DASH.centre, draw: d, nib: false, alpha: .7 });
  const pc = circPts(cx, cy, 100); B.paper(pc, .96); B.hatch(pc, { ang: -Math.PI / 4, sp: 12, alpha: .3, draw: d }); B.poly(pc, { w: 2.4, close: true, draw: d });
  g.save(); g.translate(cx, cy); g.rotate(th); const kw = [[-14, -62], [14, -62], [14, 26], [-14, 26]]; g.translate(-cx, -cy); const kwp = kw.map(([x, y]) => [cx + x, cy + y]); B.paper(kwp, .98); B.poly(kwp, { w: 2.2, close: true, draw: d }); g.restore();
  // cam + bolt (cam rides the plug: at angle th the tip is cx+90cos(th))
  const tipx = cx + 90 * Math.cos(th), tipy = cy + 90 * Math.sin(th), bl = tipx + 26; const bd = R(t, t0 + 1.0, .9);
  if (bd > 0) { B.poly([[cx, cy], [tipx, tipy]], { w: 3.4, draw: bd, nib: false }); B.circ(tipx, tipy, 12, { w: 2.4, draw: bd }); const bolt = [[bl, cy - 32], [bl + 190, cy - 32], [bl + 190, cy + 32], [bl, cy + 32]]; B.paper(bolt, .9); tint(bolt, .12); B.poly(bolt, { w: 2.6, close: true, draw: bd }); B.poly([[tipx + 12, tipy], [bl, cy]], { w: 1.2, dash: DASH.hidden, draw: bd, nib: false }); }
  callout('PLUG', 330, 1355, 330 - 52, 1230, R(t, s(9) + .8, .5), { size: 30 }); callout('CAM', 470, 1010, tipx + 6, tipy - 12, R(t, s(9) + 1.1, .5), { size: 30 }); callout('BOLT', 640, 1010, bl + 120, cy - 34, R(t, s(9) + 1.3, .5), { size: 30 });
  B.dim(cx + 90, cy + 180, cx + 90 * Math.cos(th) + 0, cy + 180, null, { off: 0, draw: 0 });
  const st = R(t, s(9) + 3.3, .45); if (t < s(10)) B.stamp('OPEN', 560, 1450, st, { size: 74, rot: -.12 });
  // parts list
  const rows = ['HOUSING', 'PLUG', 'SPRING', 'DRIVER PIN', 'KEY PIN', 'KEY', 'SHEAR LINE', 'CAM', 'BOLT'];
  B.txt('PARTS', 700, 1060, { size: 24, font: 'Poppins', weight: 600, ls: 3, write: R(t, t0 + .4, .4) }); B.line(700, 1078, 1010, 1078, { w: 1.4, draw: R(t, t0 + .4, .8), nib: false });
  rows.forEach((r, i) => { const k = R(t, t0 + .6 + i * .1, .35); B.txt(String(i + 1), 712, 1112 + i * 34, { size: 28, font: 'Poppins', weight: 600, align: 'center', write: k }); B.txt(r, 750, 1112 + i * 34, { size: 32, write: k }); });
}
function table(t) {                                           // revision table = history (title block as story)
  const t0 = s(13), d = R(t, t0 - .1, .6); if (d <= 0 || t > s(15) + .1) return; const fade = 1 - R(t, s(15) - .6, .6); B.alpha(fade);
  const x = 110, y = 420, w = 860, h = 430; B.paper([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], .97); B.rect(x, y, w, h, { w: 2.8, draw: d }); B.rect(x + 8, y + 8, w - 16, h - 16, { w: 1.2, draw: d, nib: false });
  B.txt('REVISIONS', x + 30, y + 46, { size: 30, font: 'Poppins', weight: 600, ls: 3, write: R(t, t0, .4) });
  [x + 130, x + 600].forEach((cx, i) => B.line(cx, y + 76, cx, y + h - 20, { w: 1.3, draw: R(t, t0 + .2, .8), nib: false })); B.line(x + 12, y + 76, x + w - 12, y + 76, { w: 1.6, draw: R(t, t0 + .2, .8), nib: false });
  B.txt('REV', x + 40, y + 108, { size: 22, font: 'Poppins', weight: 600, write: R(t, t0 + .6, .3), alpha: .75 }); B.txt('DESCRIPTION', x + 150, y + 108, { size: 22, font: 'Poppins', weight: 600, write: R(t, t0 + .6, .3), alpha: .75 }); B.txt('WHEN', x + 620, y + 108, { size: 22, font: 'Poppins', weight: 600, write: R(t, t0 + .6, .3), alpha: .75 });
  const rows = [['A', 'WOODEN PIN TUMBLER', 'ANCIENT', s(13) + .6], ['B', 'METAL CYLINDER, L. YALE JR.', '1860s', s(14) + .3]];
  rows.forEach(([a, b, c, ts], i) => { const yy = y + 170 + i * 120; B.line(x + 12, yy + 62, x + w - 12, yy + 62, { w: 1, nib: false, alpha: .6, draw: R(t, ts, .6) }); B.txt(a, x + 62, yy, { size: 58, align: 'center', write: R(t, ts, .3) }); B.txt(b, x + 150, yy - 10, { size: 40, write: R(t, ts + .15, .7) }); B.txt(c, x + 620, yy, { size: 32, write: R(t, ts + .3, .6) }); });
  // tiny wooden-bolt sketch for REV A, cylinder cross-section sketch for REV B
  B.rect(x + 150, y + 330, 150, 30, { w: 2, draw: R(t, s(13) + 1.4, .6), nib: false }); [0, 1, 2].forEach(i => B.line(x + 180 + i * 40, y + 330, x + 180 + i * 40, y + 300, { w: 2, draw: R(t, s(13) + 1.6 + i * .12, .4), nib: false }));
  B.alpha(1);
}
function keyDims(P, t) {                                      // cut depth codes (illustrative)
  if (!(t > s(0) + 1.2 && t < s(1) + .4) && !(t > s(12) + 1.8 && t < s(13) + .3)) return;
  const kp = t < s(1) ? 1 : R(t, s(12) + 2.0, .5); const ed = P.ed;
  X.forEach((x, i) => { const dp = Math.round((ed[i] - 700) / 10 + (i === 3 ? .5 : 0)), k = t < s(1) ? R(t, s(0) + 1.4 + (4 - i) * .18, .4) : kp; const xx = P.tx - UF[i]; if (k > 0) B.txt(String(Math.floor((ed[i] - 700) / 10)), xx, ed[i] - 46, { size: 42, align: 'center', write: k, font: 'Poppins', weight: 600 }); });
}

// ---------- fig labels ----------
const FIGS = [[0, 'FIG. 1', 'THE KEY'], [s(1) + 1.2, 'FIG. 1', 'LOCK, SIDE SECTION'], [s(6), 'FIG. 2', 'RIGHT KEY'], [s(9) - .3, 'FIG. 3', 'REAR VIEW'], [s(10), 'FIG. 4', 'WRONG KEY'], [s(12), 'FIG. 5', 'THE CODE'], [s(13), 'REVISIONS', ''], [s(15), 'FIG. 2', 'EVERY PIN ALIGNED']];
function figLabel(t) { let i = 0; FIGS.forEach((f, k) => { if (t >= f[0]) i = k; }); const f = FIGS[i], old = i > 0 ? FIGS[i - 1] : null; return { fig: f[1], figSub: f[2], figK: old ? R(t, f[0], .9) : 1, figOld: old ? old[1] + (old[2] ? '  ·  ' + old[2] : '') : '' }; }

// ---------- frame ----------
function scene(t) {
  B.begin(); const P = pins(t); const fl = figLabel(t);
  B.frame({ ...fl, title: 'PIN TUMBLER LOCK', sheetN: '1 / 1' });
  const [cx, cy, z] = camAt(t); B.camBegin(cx, cy, z);
  const figA = (t > s(13) - .1 && t < s(15) + .1) ? 1 - .78 * ss(R(t, s(13) - .1, .5)) * (1 - R(t, s(15) - .5, .6)) : 1; B.alpha(figA);
  // key at the very start is drawn alone; the lock is drafted around it afterwards
  if (t >= s(1) + .3) lockStatic(t);
  if (t >= s(4) + .2) pinStacks(t, P);
  const showK = t < s(1) + 1.3 || (P.ks.ins > -.45 && t > s(6));
  if (showK) keyDraw(P, t, t < s(0) + 1.3 ? R(t, .3, 1.1) : 1);
  keyDims(P, t);
  // callouts
  const co = (txt, x, y, tx, ty, t0, t1, o) => { const k = R(t, t0, .45) * (1 - R(t, t1, .3)); callout(txt, x, y, tx, ty, k, o); };
  co('KEY', 330, 600, 330, 750, s(0) + 1.0, s(1) + .3, {});
  co('HOUSING', 360, 340, 340, 450, s(1) + 2.3, s(2) + .1, {}); co('PLUG', 700, 1020, 700, 900, s(1) + 3.0, s(2) + .1, {});
  co('SHEAR LINE', 540, 340, 540, YS, s(2) + .9, s(3) - .1, {});
  co('5 HOLES (OFTEN 5 OR 6)', 540, 360, 540, 440, s(3) + .1, s(4) - .2, { size: 32 });
  co('SPRING', 410, 340, 410, 520, s(4) + .6, s(5) + 3.8, {}); co('DRIVER PIN', 650, 340, 660, 590, s(4) + 1.5, s(5) + 3.8, {}); co('KEY PIN', 530, 1010, 540, 730, s(4) + 2.4, s(5) + 3.8, {});
  // phase 5: show that driver pins straddle the shear line
  if (t > s(5) + 1.1 && t < s(6) + .2) X.forEach((x, i) => { const k = R(t, s(5) + 1.1 + i * .12, .4); if (k > 0) { B.circ(x, YS + 18, 20 * ss(k), { w: 1.6, dash: DASH.hidden, nib: false }); } });
  callout('BLOCKED', 540, 1005, 540, 676, R(t, s(5) + 1.4, .5) * (1 - R(t, s(6) + .2, .4)), { size: 34 });
  // phase 8: alignment ticks at the shear line
  if (t > s(8) && t < s(9) + .3 || t > s(15) && t < s(16) + .3) { const k = t < s(9) + .3 ? R(t, s(8) + .3, .8) * (1 - R(t, s(9) - .1, .4)) : R(t, s(15) + .5, .8); X.forEach((x, i) => { if (P.pin[i].ok) { B.line(x - 44, YS, x + 44, YS, { w: 5, alpha: .5 * k, nib: false }); const r = 6 + 5 * Math.sin(t * 6 + i); g.save(); g.globalAlpha = B.S.A * k; g.fillStyle = '#fff'; g.beginPath(); g.arc(x, YS, r * B.S.k, 0, 7); g.fill(); g.restore(); } }); }
  if (t > s(8) + 1.2 && t < s(9) + .2) callout('JOINTS ON THE LINE', 540, 1010, 540, YS + 30, R(t, s(8) + 1.2, .5) * (1 - R(t, s(9) - .1, .3)), { size: 32 });
  // phase 10/11: straddling pins
  if (t > s(11) - .2 && t < s(12) + .1) { const k = R(t, s(11) + .1, .5) * (1 - R(t, s(12) - .1, .3)); P.pin.forEach((p, i) => { if (!p.ok && k > 0) { B.circ(p.x, p.joint, 26 * ss(k), { w: 1.8, dash: DASH.hidden, nib: false }); } }); callout('PIN STRADDLES THE LINE', 540, 1010, P.pin.find(p => !p.ok).x, P.pin.find(p => !p.ok).joint + 26, k, { size: 32 }); }
  // phase 12: one cut changed
  if (t > s(12) + 2.9 && t < s(15) + .1) { const k = R(t, s(12) + 3.0, .5) * (1 - R(t, s(15) - .4, .4)); callout('ONE CUT CHANGED', 410, 1010, 410, edges(t, 'R')[MIDX] + 30, k, { size: 32 }); const p = P.pin[MIDX]; if (!p.ok && k > 0) B.circ(p.x, p.joint, 26 * ss(k), { w: 1.8, dash: DASH.hidden, nib: false }); }
  const eA = clamp(1 - ss(R(t, s(10), .4)) + ss(R(t, s(13) - .3, .5))); B.alpha(figA * eA); endView(t); B.alpha(figA); table(t);
  B.alpha(1); B.camEnd();
  // live gauge (screen space, right of the fig label)
  if (t > s(6) + 1.2 && t < s(13) - .2 || t > s(15) - .2 && t < s(16) + .3) { const n = P.pin.filter(p => p.ok).length; const ga = R(t, s(6) + 1.2, .4) * (t < s(13) ? 1 : R(t, s(15) - .2, .4)) * (t > s(16) ? 1 - R(t, s(16), .3) : 1); B.txt('ALIGNED', 640, 226, { size: 21, font: 'Poppins', weight: 600, ls: 2, alpha: .85 * ga }); B.txt(n + '/5', 770, 228, { size: 40, font: 'Poppins', weight: 600, alpha: ga }); for (let i = 0; i < 5; i++) { g.save(); g.globalAlpha = ga; g.strokeStyle = C.ink; g.lineWidth = 2; g.beginPath(); g.arc(868 + i * 30, 230, 10, 0, 7); if (P.pin[i].ok) { g.fillStyle = C.ink; g.fill(); } g.stroke(); g.restore(); } }
  // end card: framed title lettered on over the faded drawing
  if (t > s(16) - .1) { const k = R(t, s(16) - .1, .6); g.save(); g.globalAlpha = .55 * k; g.fillStyle = '#18336B'; g.fillRect(VP.x + 9, VP.y + 1, VP.w - 18, VP.h - 2); g.restore();
    const bx = 150, by = 520, bw = 780, bh = 300; g.save(); g.globalAlpha = k; g.fillStyle = 'rgba(14,34,82,.92)'; g.fillRect(bx, by, bw, bh); g.restore(); B.rect(bx, by, bw, bh, { w: 3, draw: k, nib: false }); B.rect(bx + 9, by + 9, bw - 18, bh - 18, { w: 1.3, draw: k, nib: false });
    B.txt('HOW IT REALLY WORKS', 540, by + 118, { size: 84, align: 'center', write: R(t, s(16) + .15, .9) }); B.line(210, by + 178, 870, by + 178, { w: 2, draw: R(t, s(16) + .9, .5), nib: false }); B.txt('@howitreallyworkstudio', 540, by + 232, { size: 34, font: 'Poppins', weight: 600, align: 'center', ls: 2, write: R(t, s(16) + 1.0, .6) }); }
  // subtitle note (double-ruled, lettered on)
  let ci = -1; PH.forEach((p, k) => { if (t >= p.start) ci = k; }); if (ci >= 0 && !(ci === PH.length - 1 && t > e(ci) + 1.0 && false)) B.note(ci + 1, PH[ci].cap, t - PH[ci].start);
  // title block: status carries the verdict
  const unlocked = (t > s(9) + 1.6 && t < s(10) + .3) || t > s(15) + .6; const status = t < s(8) + .3 ? 'LOCKED' : (t >= s(8) + .3 && t < s(10)) ? 'PINS ALIGNED' : t < s(15) + .6 ? 'LOCKED' : 'UNLOCKED';
  B.titleBlock({ status: unlocked && t > s(9) + 1.6 && t < s(10) ? 'UNLOCKED' : status, write: R(t, .6, 1.4) });
}
window.DUR = TL.total;
window.seek = t => { scene(t); const fade = Math.min(1, t / .5) * Math.min(1, (TL.total - t) / .4); if (fade < 1) { g.save(); g.globalAlpha = 1 - fade; g.fillStyle = '#0D1116'; g.fillRect(0, 0, W, H); g.restore(); } };
window.render = window.seek;
window.seek(0); window.ready = true; window.READY = true;
