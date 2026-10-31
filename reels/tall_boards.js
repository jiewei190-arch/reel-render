// tall_boards.js: the sketchbook pages for "Why you're taller in the morning" (Short = t_tall.js, long-form = t_tallyt.js).
// Every board is drawn in a 1000x1000 space. b(D, T, K, o): T = seconds since the board run started; K(k, d) = 0..1 ramp
// for stage k (stage start times come from the spec's "stages" list, so the drawing lands on the narration).
import { C, clamp, lerp, R, ss, eo, bo, hash, TAU } from './styles/distilbook/distilbook.js';

// a vertical stack of vertebrae + discs with a gentle S-curve. sq squashes discs (1 = full, <1 flatter)
function spine(D, cx, y0, n, o = {}) {
  const { vw = 150, vh = 46, dh = 22, sq = 1, kV = 1, kD = 1, curve = 26, discCol = C.water, seed = 0, drops = 0, T = 0, plump = 0 } = o;
  let y = y0; const out = [];
  for (let i = 0; i < n; i++) {
    const off = Math.sin(i / Math.max(1, n - 1) * Math.PI * 1.6 - .4) * curve, x = cx + off;
    const kv = R(kV, i / n * .7, .3);
    if (kv > 0) { const P = D.rrPts(x - vw / 2, y, vw, vh, 14); D.hatch(P, C.bone, { k: kv, seed: seed + i, gap: 8, alpha: .9, wash: .5 }); D.poly(P, { w: 3, draw: kv, seed: seed + i * 3 });
      const Q = [[x + vw / 2 - 2, y + vh * .25], [x + vw / 2 + vw * .2, y + vh * .5], [x + vw / 2 + vw * .18, y + vh * .95], [x + vw / 2 - 2, y + vh * .8]]; D.hatch(Q, C.bone, { k: kv, seed: seed + i + 9, gap: 8, wash: .5 }); D.poly(Q, { w: 3, draw: kv, seed: seed + i * 5 }); }
    y += vh;
    if (i < n - 1) { const h = dh * sq * (1 + plump * .25); const kd = R(kD, i / n * .7, .3);
      if (kd > 0) { const P = D.ellPts(x + off * 0, y + h / 2 + 2, vw / 2 - 8, h / 2 * ss(kd) + .5); D.hatch(P, discCol, { k: kd, seed: seed + 40 + i, gap: 5, alpha: .9, wash: .4 }); D.poly(P, { w: 2.6, seed: seed + 60 + i, draw: kd });
        if (drops > 0) for (let s = -1; s <= 1; s += 2) { const ph = ((T * .7 + hash(i * 7 + s) ) % 1); const dx = x + s * (vw / 2 + 10 + ph * 70), dy = y + h / 2 + ph * 10; D.drop(dx, dy, 6 * (1 - ph * .4), { alpha: drops * (1 - ph) }); }
        out.push([x, y + h / 2]); }
      y += h + 4; }
  }
  return { bottom: y, discs: out };
}

// ---------- 0: hook — door frame with morning / evening pencil marks ----------
export function hook(D, T, K, o = {}) {
  const fx = 380, top = 120, floor = 900; const tonight = o.tryit;
  // floor and door frame
  D.line(80, floor, 920, floor, { w: 3, draw: K(0, .6), seed: 1 });
  D.poly([[fx, floor], [fx, top]], { w: 3.4, draw: K(0, .7), seed: 2 }); D.poly([[fx + 30, floor], [fx + 30, top + 20], [fx + 330, top + 20], [fx + 330, floor]], { w: 3, draw: K(0, .9), seed: 3, alpha: .7 });
  D.hatch([[fx, top], [fx + 30, top + 20], [fx + 30, floor], [fx, floor]], C.org, { k: K(0, 1), gap: 9, seed: 4, alpha: .5 });
  // person: shrinks a little in the evening stage
  const shrink = ss(K(1, 1.2)); const sq = 1 - .1 * shrink;
  D.person(fx + 120, floor - 72 * sq, 1.85, { k: K(0, .8), sq, face: K(3, .1) > 0 ? 'worried' : K(1, .1) > 0 && !tonight ? 'o' : 'smile', arm: K(3, .1) > 0 ? 'hips' : 'down', seed: 7 });
  const headTop = sq0 => floor - 72 * sq0 - 162 * 1.85 * sq0;
  const yM = headTop(1), yE = headTop(1 - .1);
  // morning mark
  const kM = K(0, .6, .6); if (kM > 0) { D.line(fx - 60, yM, fx + 4, yM, { w: 4, draw: kM, seed: 11 }); D.txt(tonight ? 'morning' : '7:00 AM', fx - 70, yM - 2, { size: 40, align: 'right', write: kM }); D.sun(170, 160, 42, K(0, .8, .4), T); }
  const kE = K(1, .6, .8); if (kE > 0) { D.line(fx - 60, yE, fx + 4, yE, { w: 4, draw: kE, seed: 12 }); D.txt(tonight ? 'tonight' : '10:00 PM', fx - 70, yE + 14, { size: 40, align: 'right', write: kE });
    D.moon(830, 170, 40, K(1, .6, .4)); }
  // gap bracket + amount
  const kG = K(2, .8); if (kG > 0) { D.bracket(fx + 12, yM, yE, { side: 1, draw: kG }); D.arrow(fx + 250, 330, fx + 60, (yM + yE) / 2, { bend: -40, draw: kG, seed: 13 });
    D.txt(o.gapText || 'almost **2 cm**', fx + 200, 380, { size: 50, write: R(kG, .4, .6) }); D.txt(o.gapSub || 'every single day', fx + 210, 430, { size: 36, col: C.soft, write: R(kG, .6, .5) }); }
  // question
  const kQ = K(3, .7); if (kQ > 0) { D.txt('?', 800, 620, { size: 240 * bo(kQ), col: C.blue, align: 'center' }); D.txt('where does it go?', 760, 790, { size: 44, align: 'center', write: R(kQ, .3, .6) }); }
}

// ---------- 1: the spine — vertebrae and discs ----------
export function spineBoard(D, T, K, o = {}) {
  const n = 11; const sp = spine(D, 470, 110, n, { kV: K(0, 1.6), kD: K(1, 1.2), seed: 3 });
  const kL = K(0, .8, 1.0); if (kL > 0) { D.arrow(260, 230, 380, 200, { draw: kL, bend: 20, seed: 4 }); D.lines(['vertebrae', '(bone)'], 120, 250, { size: 42, write: kL }); }
  const kD = K(1, .8, .8); if (kD > 0) { D.arrow(260, 470, 395, sp.discs[4][1], { draw: kD, bend: -20, seed: 5 }); D.lines(['**discs**', '(soft cushions)'], 100, 490, { size: 42, write: kD }); }
  const kB = K(2, .9); if (kB > 0) { D.bracket(620, 110, sp.bottom, { draw: kB }); D.txt('discs =', 690, 420, { size: 44, write: R(kB, .3, .5) }); D.txt('**¼ – ⅓**', 690, 480, { size: 62, write: R(kB, .45, .5) }); D.txt('of spine length', 690, 540, { size: 38, write: R(kB, .6, .5) }); }
  if (o.count) { const kc = K(o.count, .8); if (kc > 0) D.note(290, 690, 100, ['around', '**two dozen**', 'discs'], { k: kc, size: 36, sx: 1.1 }); }
  if (o.hard) { const kh = K(o.hard, .8); if (kh > 0) { D.txt('bone = **hard**', 130, 850, { size: 42, write: kh }); D.check(95, 850, 16, kh); }
    const ks = K(o.hard + 1, .8); if (ks > 0) { D.txt('disc = **soft**', 130, 915, { size: 42, write: ks }); D.poly(Array.from({ length: 9 }, (_, i) => [75 + i * 5, 915 + Math.sin(i * 1.6) * 8]), { col: C.blue, w: 3, draw: ks }); } }
  D.person(870, 900, 1.1, { k: K(0, .8), arm: 'pointL', face: K(2, .1) > 0 ? 'o' : 'smile', seed: 81 });
}

// ---------- 2: inside one disc ----------
export function discBoard(D, T, K, o = {}) {
  const cx = 420, cy = 470; const kR = K(0, 1.4);
  for (let i = 0; i < 6; i++) { const r = 330 - i * 30; const k = R(kR, i * .1, .5); if (k > 0) D.poly(D.ellPts(cx, cy, r, r * .78, 0, -1.2 + i), { w: 2.8, draw: k, seed: 20 + i, col: i % 2 ? C.ink : '#5a5a60' }); }
  D.hatch(D.ellPts(cx, cy, 330, 330 * .78), C.bone, { k: kR, gap: 10, alpha: .5, seed: 2, wash: .25 });
  const kN = K(1, 1.0); if (kN > 0) { const P = []; for (let i = 0; i <= 40; i++) { const a = i / 40 * TAU; const r = 140 * (1 + .08 * Math.sin(a * 3 + T * 1.5)); P.push([cx + Math.cos(a) * r * ss(kN), cy + Math.sin(a) * r * .8 * ss(kN)]); }
    D.wash(P, C.card, 1); D.hatch(P, C.water, { k: kN, gap: 6, seed: 9, wash: .35 }); D.poly(P, { w: 3, seed: 10 }); }
  const kL1 = K(0, .8, 1.0); if (kL1 > 0) { D.arrow(560, 120, 660, 210, { draw: kL1, bend: 20, seed: 11 }); D.lines(['tough **fiber rings**', '(like an onion)'], 380, 95, { size: 38, write: kL1 }); }
  const kL2 = K(1, .8, .9); if (kL2 > 0) { D.arrow(560, 820, 470, 560, { draw: kL2, bend: -30, seed: 12 }); D.lines(['**jelly-like core**', 'nucleus pulposus'], 470, 860, { size: 38, write: kL2 }); }
  const kW = K(2, 1); if (kW > 0) { for (let i = 0; i < 6; i++) { const k = R(kW, i * .08, .4); if (k > 0) D.drop(cx - 70 + (i % 3) * 70, cy - 30 + Math.floor(i / 3) * 70 + Math.sin(T * 2 + i) * 4, 16 * bo(k)); }
    D.note(830, 470, 125, o.waterNote || ['mostly', '**water**'], { k: R(kW, .3, .7), size: 38, sx: 1.05 }); }
  if (o.tower) { const kt = K(o.tower, .9); if (kt > 0) { D.txt('a tower of bones on', 800, 800, { size: 34, align: 'center', write: kt }); D.txt('little **water cushions**', 800, 845, { size: 38, align: 'center', write: R(kt, .3, .6) }); } }
  D.person(130, 905, 1.05, { k: K(0, .8), arm: K(1, .1) > 0 ? 'point' : 'down', face: K(2, .1) > 0 ? 'happy' : 'smile', seed: 82 });
}

// ---------- 3: the daily squeeze ----------
export function squeeze(D, T, K, o = {}) {
  const kS = K(0, .8); D.person(150, 810, 1.25, { k: kS, seed: 2, face: K(2, .1) > 0 ? 'worried' : 'smile', arm: K(1, .1) > 0 ? 'up' : 'down' }); D.sun(150, 330, 36, kS, T);
  const kP = K(1, .8); for (let i = 0; i < 3; i++) { const x = 400 + i * 120; D.arrow(x, 90, x, 200 + Math.sin(T * 4 + i) * 6, { draw: R(kP, i * .15, .5), seed: 30 + i, w: 4.5, head: 22 }); }
  if (kP > 0) D.txt('body weight + gravity', 520, 60, { size: 40, align: 'center', write: R(kP, .2, .6) });
  const sq = 1 - .42 * ss(K(2, 2.4)); const sp = spine(D, 520, 240, 4, { vw: 230, vh: 80, dh: 54, sq, seed: 5, curve: 0, drops: K(2, .5) * (o.dropsOff ? 1 - K(o.dropsOff, .6) : 1), T });
  const k2 = K(2, .8, 1.2); if (k2 > 0) { D.arrow(820, 330, 690, sp.discs[0][1], { draw: k2, bend: 30, seed: 40 }); D.lines(['fluid **seeps out**', 'disc gets **thinner**'], 720, 280, { size: 38, write: k2 }); }
  if (o.lab) { const kl = K(o.lab, .9); if (kl > 0) D.note(820, 620, 120, ['lab study:', '**~18%**', 'of disc fluid'], { k: kl, size: 34, sx: 1.12 }); }
  if (o.mri) { const km = K(o.mri, .9); if (km > 0) D.txt('MRI: lower-back discs lose', 560, 915, { size: 34, align: 'center', write: km });  if (km > 0) D.txt('**~5–10%** of their water over a day', 560, 958, { size: 34, align: 'center', write: R(km, .3, .6) }); }
  if (o.add) { const ka = K(o.add, .9); if (ka > 0) { const y = o.lab ? 790 : 700; D.txt('a **sliver** per disc', 820, y, { size: 40, align: 'center', write: ka }); }
    const kb = K(o.add + 1, .9); if (kb > 0) { const y = o.lab ? 845 : 770; D.txt('× ~24 discs = **1–2 cm**', 820, y, { size: 42, align: 'center', write: kb }); } }
}

// ---------- 10 / 4: the measuring study graph (height over 24 h) ----------
export function graph(D, T, K, o = {}) {
  const x0 = 130, x1 = 900, yT = 290, yB = 690; const night = o.night !== false;
  const h = u => { // height curve: u 0..1 over the shown window. day = first 16/24 if night shown
    const dayEnd = night ? 16 / 24 : 1; if (u <= dayEnd) { const d = u / dayEnd; return d < 1 / 16 ? .54 * d * 16 : .54 + .46 * (d - 1 / 16) / (15 / 16); }
    const n = (u - dayEnd) / (1 - dayEnd); return 1 - (n < .5 ? .7 * n * 2 : .7 + .3 * (n - .5) * 2); };
  const yOf = v => lerp(yT, yB, v);
  const kA = K(0, .9); D.line(x0, yT - 40, x0, yB + 20, { w: 3, draw: kA, seed: 1 }); D.arrow(x0, yB + 20, x1 + 30, yB + 20, { draw: kA, seed: 2 });
  if (kA > 0) { D.txt('height', x0 - 20, yT - 70, { size: 36, write: kA }); D.txt(night ? 'get up      ·      day      ·      bed      ·    night' : 'get up             ·            day            ·            bed', x0 + 20, yB + 60, { size: 30, col: C.soft, write: kA }); }
  if (o.intro) { const ki = K(0, 1, .3); if (ki > 0) { D.rr(560, 80, 360, 150, 14, { draw: ki, seed: 70, fill: C.yel, fk: ki, fa: .35 }); D.lines(['**1985 study**', '8 young adults · to 1 mm'], 585, 125, { size: 34, write: R(ki, .3, .6) }); } }
  const kC = K(1, 2.2); if (kC > 0) { const P = []; const n = 120; for (let i = 0; i <= n; i++) { const u = i / n; P.push([lerp(x0, x1, u), yOf(h(u))]); } D.poly(P, { col: C.blue, w: 5, draw: kC, seed: 3 }); }
  const dayEnd = night ? 16 / 24 : 1; const xd = lerp(x0, x1, dayEnd);
  const kL = K(2, .8); if (kL > 0) { D.line(xd, yT, xd, yB, { dash: [8, 10], draw: kL, seed: 4, col: C.soft }); D.bracket(xd + 6, yT, yB, { draw: kL }); if (night) D.txt(o.lossText || '**−19 mm** (~1%)', xd + 50, yT + 30, { size: 40, write: R(kL, .3, .6) }); else D.txt(o.lossText || '**−19 mm** (~1%)', xd - 20, yB + 120, { size: 40, align: 'right', write: R(kL, .3, .6) }); }
  const kH = K(3, .9); if (kH > 0) { const xh = lerp(x0, x1, dayEnd / 16); D.hatch([[x0, yT - 10], [xh, yT - 10], [xh, yB + 10], [x0, yB + 10]], C.yel, { k: kH, gap: 7, seed: 6, alpha: .7 });
    D.arrow(x0 + 170, yB - 120, xh - 6, yOf(.45), { draw: kH, bend: 30, seed: 7 }); D.lines(['**54%** of the loss', 'in the **first hour**'], x0 + 120, yB - 80, { size: 38, write: R(kH, .3, .6) }); }
  if (night) { const kN = K(4, 1); if (kN > 0) { const xm = lerp(xd, x1, .5); D.hatch([[xd, yT - 10], [xm, yT - 10], [xm, yB + 10], [xd, yB + 10]], C.blueL, { k: kN, gap: 7, seed: 8, alpha: .5 }); D.moon(xm + 120, yT - 20, 26, kN);
      D.lines(['**~70%** back in', 'first half of night'], xd + 20, yB - 90, { size: 32, write: R(kN, .3, .6) }); } }
  if (o.later) { const k5 = K(5, .9); if (k5 > 0) D.note(760, 860, 90, ['2010 study:', '**same pattern**'], { k: k5, size: 30, sx: 1.6 }); const k6 = K(6, .9); if (k6 > 0) D.txt('1st hour: **31%** and **45%** of the loss', 330, 860, { size: 34, align: 'center', write: k6 }); }
  if (o.down) { const k7 = K(7, .8); if (k7 > 0) { D.txt('down by day,', 250, 160, { size: 52, write: k7 }); D.txt('**up by night**', 250, 215, { size: 52, write: R(k7, .3, .6) }); } }
}

// ---------- 5: the overnight refill ----------
export function night(D, T, K, o = {}) {
  const kB = K(0, 1); // bed
  D.rr(140, 560, 720, 60, 16, { draw: kB, seed: 2, fill: C.blueL, fk: kB, fa: .5 }); D.line(150, 620, 150, 700, { draw: kB, seed: 3 }); D.line(850, 620, 850, 700, { draw: kB, seed: 4 });
  D.rr(150, 505, 110, 52, 24, { draw: kB, seed: 5, fill: C.card });
  D.person(380, 520, 1.35, { pose: 'lie', k: kB, face: 'sleep', seed: 5 });
  D.moon(800, 140, 46, K(0, .8)); for (let i = 0; i < 5; i++) D.star(120 + i * 140 + (i % 2) * 40, 110 + (i % 3) * 50, 12, R(K(0, 1.4), i * .12, .4));
  const zz = K(0, 1); if (zz > 0) for (let i = 0; i < 3; i++) { const ph = (T * .35 + i / 3) % 1; D.txt('z', 300 + ph * 80 + i * 6, 440 - ph * 120, { size: 30 + i * 8, alpha: zz * (1 - ph), col: C.soft }); }
  // horizontal spine inside the sleeper, discs plump back up
  const plump = ss(K(2, 3)); const kSp = K(1, .8);
  if (kSp > 0) { const n = 5; for (let i = 0; i < n; i++) { const x = 420 + i * 80; const P = D.rrPts(x, 380, 50, 70, 12); D.hatch(P, C.bone, { k: kSp, seed: i, gap: 7, wash: .5 }); D.poly(P, { w: 2.6, draw: kSp, seed: i + 20 });
      if (i < n - 1) { const w = 12 + 16 * plump; const Q = D.ellPts(x + 65, 415, w / 2 + 2, 30); D.hatch(Q, C.water, { k: kSp, seed: i + 40, gap: 4, wash: .5 }); D.poly(Q, { w: 2.4, seed: i + 50, draw: kSp }); } }
    D.txt('pressure **off**', 590, 330, { size: 40, align: 'center', write: R(kSp, .3, .6) }); }
  const kD = K(2, .6); if (kD > 0) for (let i = 0; i < 8; i++) { const ph = (T * .5 + i / 8) % 1; const x = 440 + (i % 4) * 80 + 25, y = 300 + (1 - ph) * -60 + 60 + ph * 50; D.drop(x + (i > 3 ? 0 : 0), 230 + ph * 140, 7, { alpha: kD * Math.sin(ph * Math.PI) }); }
  if (o.sponge) { const ks = K(o.sponge, .9); if (ks > 0) D.note(200, 230, 95, ['core pulls', '**water in**', 'like a sponge'], { k: ks, size: 28, sx: 1.25 }); }
  if (o.morning) { const km = K(o.morning, .9); if (km > 0) { D.sun(860, 800, 40, km, T); D.txt('morning: **full height**', 610, 800, { size: 42, align: 'center', write: km }); D.check(400, 800, 18, km); } }
  if (o.half) { const kh = K(o.half, .9); if (kh > 0) D.txt('most comes back in the **first half of the night**', 500, 800, { size: 38, align: 'center', write: kh }); }
}

// ---------- 12: reclined rest vs standing ----------
export function recline(D, T, K) {
  const k0 = K(0, .9); D.poly([[160, 640], [440, 640], [440, 560], [300, 600], [160, 640]], { draw: k0, seed: 3 });
  D.person(300, 580, 1.4, { pose: 'recline', k: k0, seed: 2 }); D.person(700, 570, 1.3, { k: k0, seed: 9, face: 'worried' }); D.line(100, 650, 900, 650, { draw: k0, seed: 1 });
  const k1 = K(0, .9, .8); if (k1 > 0) { D.txt('reclined, knees up', 300, 740, { size: 40, align: 'center', write: k1 }); D.txt('standing', 700, 740, { size: 40, align: 'center', write: k1 }); D.txt('height came back **faster**', 300, 800, { size: 38, align: 'center', write: R(k1, .4, .6) }); D.check(300, 860, 22, R(k1, .7, .3)); }
  D.txt('1985 study', 500, 160, { size: 46, align: 'center', write: k0 });
}

// ---------- 11: nutrients + ageing ----------
export function feed(D, T, K, o = {}) {
  const cx = 500, cy = 400; const k0 = K(0, 1);
  D.ell(cx, cy, 240, 120, { draw: k0, seed: 2, fill: C.bone, fk: k0 }); const N = D.ellPts(cx, cy, 110, 55); D.hatch(N, C.water, { k: k0, seed: 3, wash: .4 }); D.poly(N, { draw: k0, seed: 4 });
  for (let s = -1; s <= 1; s += 2) { const P = Array.from({ length: 30 }, (_, i) => [cx + s * (280 + Math.sin(i * .7) * 14), 150 + i * 17]); D.poly(P, { col: C.red, w: 5, draw: k0, seed: 10 + s }); }
  if (k0 > 0) D.txt('blood vessels', 500, 110, { size: 38, align: 'center', col: C.red, write: k0 });
  const k1 = K(1, .8); if (k1 > 0) { for (let i = 0; i < 10; i++) { const ph = (T * .35 + i / 10) % 1, s = i % 2 ? 1 : -1; const x = cx + s * lerp(270, 120, ph), y = 300 + (i * 37) % 200; g(D, x, y, k1 * Math.sin(ph * Math.PI)); }
    D.txt('fluid flow carries **nutrients** in', 500, 630, { size: 40, align: 'center', write: k1 }); }
  if (o.age) { const ka = K(o.age, 1); if (ka > 0) { const ox = 500, oy = 820; D.ell(ox - 200, oy, 120, 50, { seed: 30, fill: C.bone, draw: ka }); D.ell(ox - 200, oy, 60, 25, { seed: 31, fill: C.water, draw: ka });
      D.arrow(ox - 50, oy, ox + 50, oy, { draw: ka, seed: 32 }); D.ell(ox + 200, oy + 10, 120, 36, { seed: 33, fill: C.bone, draw: ka }); D.ell(ox + 200, oy + 10, 40, 14, { seed: 34, fill: C.water, draw: ka, fa: .4 });
      D.txt('young', ox - 200, oy - 80, { size: 34, align: 'center', write: ka }); D.txt('older: less **water-pulling** stuff', ox + 200, oy - 80, { size: 34, align: 'center', write: ka }); } }
  D.person(915, 915, .95, { k: K(0, .8), arm: 'pointL', face: o.age && K(o.age, .1) > 0 ? 'worried' : 'smile', seed: 83 });
}
function g(D, x, y, a) { if (a <= 0) return; D.g.save(); D.g.globalAlpha = D.A() * a; D.g.fillStyle = C.grn; D.g.beginPath(); D.g.arc(x, y, 7, 0, TAU); D.g.fill(); D.g.restore(); }

// ---------- 6: astronauts in orbit ----------
export function space(D, T, K, o = {}) {
  const k0 = K(0, 1.2);
  D.poly(D.ellPts(500, 1450, 900, 600, 60, 0, .6, .9), { draw: k0, seed: 2 }); D.hatch(D.ellPts(500, 1450, 900, 600), C.blueL, { k: k0, seed: 3, alpha: .5 });
  for (let i = 0; i < 9; i++) D.star(80 + hash(i) * 840, 70 + hash(i + 9) * 380, 9, R(k0, i * .06, .3));
  // station
  const ks = K(0, .8, .6); if (ks > 0) { D.rr(700, 120, 120, 50, 10, { draw: ks, seed: 5, fill: C.faint, fk: ks }); D.rr(620, 128, 70, 34, 4, { draw: ks, seed: 6, fill: C.blue, fk: ks, fa: .5 }); D.rr(830, 128, 70, 34, 4, { draw: ks, seed: 7, fill: C.blue, fk: ks, fa: .5 }); }
  const grow = ss(K(2, 1.4)); const bob = Math.sin(T * 1.2) * 10;
  D.person(380, 560 + bob, 1.6, { pose: 'float', sq: 1 + .03 * grow, k: K(1, .8), seed: 1, face: 'happy', arm: 'up' });
  const k2 = K(2, .9); if (k2 > 0) { D.txt('up to **3% taller**', 640, 420, { size: 52, write: k2 }); D.txt('(NASA scientists)', 650, 475, { size: 32, col: C.soft, write: R(k2, .4, .5) });
    for (let i = 0; i < 2; i++) D.arrow(380, 300 - i * 0 + bob, 380, 250 + bob - grow * 20, { draw: k2, seed: 40, head: 12 }); }
  if (o.stretch) { const kx = K(o.stretch, .9) * (o.cm ? 1 - K(o.cm, .5) : 1); if (kx > 0) D.note(760, 640, 120, ['no weight', 'pressing down:', 'spine **stretches**'], { k: kx, size: 30, sx: 1.2 }); }
  if (o.ultra) { const ku = K(o.ultra, .9); if (ku > 0) { D.rr(650, 760, 160, 110, 12, { draw: ku, seed: 50, fill: C.faint, fk: ku }); D.poly(Array.from({ length: 12 }, (_, i) => [665 + i * 11, 830 - Math.abs(Math.sin(i * 1.3)) * 40]), { col: C.grn, w: 3, draw: ku });
      D.txt('ultrasound on board', 730, 900, { size: 32, align: 'center', write: ku }); } }
  if (o.cm) { const kc = K(o.cm, .9); if (kc > 0) D.note(780, 650, 120, ['1.8 m person:', '**up to 5 cm**', '(~2 inches)'], { k: kc, size: 32, sx: 1.15 }); }
}

// ---------- 7: back on Earth ----------
export function earth(D, T, K, o = {}) {
  const k0 = K(0, .9); D.line(80, 860, 920, 860, { draw: k0, seed: 1 });
  const sh = ss(K(0, 3, .4)); D.person(330, 780, 2, { k: k0, sq: 1.03 - .03 * sh, seed: 3, face: sh > .5 ? 'worried' : 'happy' });
  D.line(470, 450, 520, 450, { draw: k0, seed: 4, dash: [6, 8] }); D.arrow(500, 380, 500, 440, { draw: K(0, 1, .4), seed: 5 });
  // calendar
  const kc = K(0, .9, .6); if (kc > 0) { D.rr(600, 260, 260, 240, 14, { draw: kc, seed: 6 }); D.hatch(D.rrPts(600, 260, 260, 60, 14), C.red, { k: kc, seed: 7 }); for (let i = 0; i < 9; i++) { const kk = R(kc, .3 + i * .06, .1); if (kk > 0) D.poly([[625 + (i % 3) * 80, 340 + Math.floor(i / 3) * 50], [665 + (i % 3) * 80, 370 + Math.floor(i / 3) * 50]], { draw: kk, seed: 8 + i }); }
    D.txt('back to normal', 730, 560, { size: 44, align: 'center', write: R(kc, .4, .5) }); D.txt('in **a few months**', 730, 615, { size: 44, align: 'center', write: R(kc, .5, .5) }); }
}

// ---------- 8: when are you tallest? ----------
export function tallest(D, T, K, o = {}) {
  const k0 = K(0, 1); const x = 180; D.poly([[x, 900], [x, 120]], { draw: k0, seed: 1 }); D.poly([[x + 70, 900], [x + 70, 120]], { draw: k0, seed: 2 }); D.hatch([[x, 120], [x + 70, 120], [x + 70, 900], [x, 900]], C.yel, { k: k0, seed: 3, alpha: .55 });
  for (let i = 0; i < 26; i++) { const y = 880 - i * 30; const kk = R(k0, i / 26 * .8, .2); if (kk > 0) D.line(x, y, x + (i % 5 === 0 ? 40 : 22), y, { draw: kk, seed: 10 + i, w: 2.4 }); }
  const k1 = K(1, .9); if (k1 > 0) { D.txt('same **time of day**', 600, 230, { size: 48, align: 'center', write: k1 }); D.ell(600, 340, 60, 60, { draw: k1, seed: 20 }); const a = T * 1.2; D.line(600, 340, 600 + Math.cos(a) * 40, 340 + Math.sin(a) * 40, { draw: k1 }); D.line(600, 340, 600, 300, { draw: k1, seed: 21 }); }
  const k2 = K(2, .9); if (k2 > 0) { D.txt('your **tallest**?', 600, 500, { size: 60, align: 'center', write: k2 }); D.txt('?', 840, 520, { size: 140 * bo(k2), col: C.blue, align: 'center' }); }
  const k3 = K(3, .9); if (k3 > 0) { D.sun(470, 680, 44, k3, T); D.txt('first thing in the **morning**', 620, 790, { size: 46, align: 'center', write: k3 }); D.check(800, 680, 28, R(k3, .5, .4)); }
  if (o.choice) { const kc = K(o.choice, .9); if (kc > 0) { D.sun(470, 700, 44, kc, T); D.txt('morning?', 470, 820, { size: 46, align: 'center', write: kc }); D.txt('or', 620, 705, { size: 44, col: C.soft, align: 'center', write: R(kc, .3, .4) });
    D.moon(770, 700, 44, R(kc, .4, .5)); D.txt('night?', 770, 820, { size: 46, align: 'center', write: R(kc, .5, .5) }); } }
  const k4 = K(4, .9); if (k4 > 0) D.txt('tell us in the comments ✎', 620, 880, { size: 40, align: 'center', col: C.blue, write: k4 });
  D.person(300, 830, 1.25, { k: K(0, .8), arm: 'pointL', face: K(3, .1) > 0 || (o.choice && K(o.choice, .1) > 0) ? 'happy' : K(2, .1) > 0 ? 'o' : 'smile', seed: 84 });
}

// ---------- 13: contents page ----------
export function contents(D, T, K) {
  const items = ['A famous measuring study', "What's inside your spine", 'The daily squeeze', 'The overnight refill', 'Astronauts: the extreme version'];
  D.txt('In this video', 160, 160, { size: 64, write: K(0, .8) }); D.line(160, 205, 560, 205, { draw: K(0, .8, .4), col: C.blue, w: 4 });
  items.forEach((s, i) => { const k = K(i < 2 ? 0 : 1, .6, .6 + (i % 3) * .55); if (k <= 0) return; D.rr(170, 280 + i * 120, 44, 44, 8, { draw: k, seed: i }); D.check(192, 300 + i * 120, 16, R(k, .5, .4), C.blue); D.txt(s, 250, 302 + i * 120, { size: 46, write: k }); });
  D.person(860, 880, 1, { k: K(0, .8), arm: 'wave', face: 'happy', seed: 85 });
}

// ---------- 15: recap ----------
export function recap(D, T, K) {
  D.txt('Quick recap', 500, 110, { size: 64, align: 'center', write: K(0, .8) });
  const k0 = K(0, .9, .3); if (k0 > 0) { spine(D, 200, 220, 5, { vw: 110, vh: 34, dh: 18, kV: k0, kD: k0, curve: 8 }); D.txt('bones on', 200, 600, { size: 36, align: 'center', write: k0 }); D.txt('**water discs**', 200, 645, { size: 36, align: 'center', write: k0 }); }
  const k1 = K(1, .9); if (k1 > 0) { D.sun(500, 280, 40, k1, T); D.arrow(500, 380, 500, 520, { draw: k1, w: 5, head: 24 }); D.txt('day: squeeze,', 500, 600, { size: 36, align: 'center', write: k1 }); D.txt('you **shrink**', 500, 645, { size: 36, align: 'center', write: k1 }); }
  const k2 = K(2, .9); if (k2 > 0) { D.moon(800, 280, 40, k2); D.arrow(800, 520, 800, 380, { draw: k2, w: 5, head: 24 }); D.txt('night: refill,', 800, 600, { size: 36, align: 'center', write: k2 }); D.txt('you **grow back**', 800, 645, { size: 36, align: 'center', write: k2 }); }
  [[350, 0], [650, 1]].forEach(([x, i]) => D.line(x, 230, x, 680, { draw: K(i + 1, .6), dash: [6, 10], col: C.faint }));
  D.person(500, 900, 1.05, { k: K(2, .8), arm: 'up', face: 'happy', seed: 86 });
}

// ---------- 9: end card ----------
export function endcard(D, T, K, o = {}) {
  const k = K(0, 1.2); spine(D, 330, 140, 6, { vw: 120, vh: 36, dh: 18, kV: k, kD: k, curve: 10, plump: Math.sin(T * 2) * .5 + .5 });
  D.person(640, 470, 1.2, { k, arm: 'wave', face: 'happy', seed: 87 });
  D.txt('Thanks for watching!', 500, 680, { size: 66, align: 'center', write: K(0, .8, .2) });
  D.txt(o.cta || '**Follow for more**', 500, 775, { size: 84, align: 'center', write: K(0, .9, .7) });
  D.line(230, 835, 770, 835, { draw: K(0, .6, 1.4), col: C.blue, w: 5 });
}

export const BOARDS = { 0: hook, 1: spineBoard, 2: discBoard, 3: squeeze, 4: graph, 5: night, 6: space, 7: earth, 8: tallest, 9: endcard, 10: graph, 11: feed, 12: recline, 13: contents, 14: hook, 15: recap };
