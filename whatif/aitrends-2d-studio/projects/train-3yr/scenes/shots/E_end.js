// E_end.js — batch E part 3 (s121-s131): the real-life ending, the question, the end screen.
//   s121 triptych of the park path: YEAR 1 summer / YEAR 2 winter / YEAR 3 spring, the hero a little stronger each time; 3 YEARS on 'three'
//   s122 gold heart on 'heart', 10 km runner on 'endurance', cut to the bathroom laundry MOUNTAIN on 'laundry' (Biscuit on top)
//   s123 blueprint FIG 17: running-total bars for the week, dashed 150 MIN / WEEK line on 'hundred'
//   s124 the YOU bar (line-art runner on top) blows past the line and off the top: ~7 HOURS, check on the line
//   s125 reality gag: a hop over the brook lands a metre short in the water on 'superhuman'; MINA laughs on the bench
//   s126 bedroom callback: DEV slides one more textbook into the backpack on 'harder', MINA points at the bed on 'rest'
//   s127 the push-up collapses on 'back', Biscuit steps straight onto him
//   s128 hallway photo wall: Grandpa, Dad, Uncle, YOU, all big curls; gold family tree on 'family tree'; HAIR LOG pinned: UNCHANGED.
//   s129 WOULD YOU TAKE THE CHALLENGE? over the X-filled calendar, words pop on the voice
//   s130 the routine checklist: + slot on 'add', sit-ups wobble and cross out on 'drop', comment bubble on 'comments'
//   s131 END SCREEN at the dawn finish line, the card flips back to DAY 1, subscribe / like / comment, fade out
import { E, S, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, wordTime, alpha, glow, rr, seg, circle, poly, ring, text, measure, FONTS, rng, linGrad, shade } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { actor, cat } from '../sets/actors.js';
import { park, parkFg, bike, finishLine } from '../sets/park.js';
import { home3, home3Fg, hairLog, calendar, timeSkip, HAIR_ROWS } from '../sets/home3.js';
import { runCycle, pushUp, sitUp, squat, trainee, pillow } from '../sets/train.js';
import { jumpPose, jumper, jumpFX, jumpShake } from '../sets/jump.js';
import { chip } from '../sets/hud.js';
import { blinkFlag, exprAt, poseAt, idle, reaction, lookToward, camMove, atmos } from '../sets/acting.js';
import * as BP from '../sets/bp.js';

const shotWord = (w, st, fb) => { const g = wordTime(w, st); return (g == null ? st + fb : g) - st; };
const GOLD = '#ffd47e', CREAM = '#fff1dc';
const popIn = (t, a, d = 0.35) => ease.outBack(prog(t, a, a + d));
function goldWord(g, str, x, y, size, k, o = {}) {
  if (k <= 0) return; g.save(); g.translate(x, y); g.scale(k, k); g.rotate(o.rot ?? -0.03);
  for (let i = 5; i >= 1; i--) text(g, str, i * 1.4, i * 1.8, { size, color: shade(GOLD, -0.55), font: FONTS.title, weight: 700 });
  text(g, str, 0, 0, { size, color: GOLD, font: FONTS.title, weight: 700, stroke: 12, strokeColor: '#140f1c', glow: 18, glowColor: alpha(GOLD, 0.6) }); g.restore();
}
// HERO jogging in place at world x (foot phase from t)
const jogger = (g, t, x, gy, s, o = {}) => trainee(g, 'HERO', { pose: runCycle(t, o.speed ?? 1.5, { mode: o.mode || 'jog' }).pose, shadow: [0, 38] }, { x, y: gy, s, facing: 1, t, rim: o.rim, blink: blinkFlag(t, 3.3, o.seed ?? 3), look: lookToward(1, 0), expr: o.expr || 'determined', sweat: o.sweat ?? 0, breath: o.breath ?? 0 });
// framed panel with its own clip (scene drawn at full-frame coords, scaled to the panel height)
function panel(g, x, y, w, h, o, fn) {
  const sc = h / E.H; g.save(); g.translate(x, y); if (o.rot) { g.translate(w / 2, h / 2); g.rotate(o.rot); g.translate(-w / 2, -h / 2); }
  rr(g, 10, 14, w, h, 22); g.fillStyle = 'rgba(0,0,0,.4)'; g.fill();
  g.save(); rr(g, 0, 0, w, h, 22); g.clip(); g.translate(w / 2 - E.W * sc / 2, 0); g.scale(sc, sc); fn(g); g.restore();
  rr(g, 0, 0, w, h, 22); g.strokeStyle = CREAM; g.lineWidth = 8; g.stroke();
  if (o.tag) { const tw = measure(g, o.tag, 30, FONTS.ui, 900) + 40; rr(g, 18, 18, tw, 50, 25); g.fillStyle = 'rgba(11,19,36,.92)'; g.fill(); text(g, o.tag, 18 + tw / 2, 44, { size: 30, color: GOLD, font: FONTS.ui, weight: 900, spacing: 1 }); }
  g.restore();
}

// ---------------------------------------------------------------------------------------------------
// s121 — "In real life, three years of this would change you a lot."
// ---------------------------------------------------------------------------------------------------
registerShot('s121', { draw(g, t, info) {
  const st = info.shot.start, tR = shotWord('real', st, 0.22), tThree = shotWord('three', st, 1.19), tLot = shotWord('lot', st, 2.81);
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#2a1c3a', '#4a2a44', '#6a3a40']); g.fillRect(0, 0, E.W, E.H);
  const pan = camMove(t, info.dur, { x: [40, -40] }), pw = 560, ph = 660, gap = 34, x0 = (E.W - (3 * pw + 2 * gap)) / 2 + pan.x, y0 = 250;
  const P3 = [{ season: 'summer', mood: 'day', tag: 'YEAR 1', s: 1.85, mode: 'jog', expr: 'determined', sp: 1.5 }, { season: 'winter', mood: 'day', tag: 'YEAR 2', s: 1.9, mode: 'run', expr: 'squint', sp: 1.6 }, { season: 'spring', mood: 'dawn', tag: 'YEAR 3', s: 1.97, mode: 'run', expr: 'smile', sp: 1.7 }];
  P3.forEach((q, i) => {
    const k = ease.out(prog(t, 0.05 + i * 0.12, 0.6 + i * 0.12)), lift = (1 - k) * 500;
    if (k <= 0) return;
    panel(g, x0 + i * (pw + gap), y0 + lift, pw, ph, { tag: q.tag, rot: (i - 1) * 0.012 }, (g) => {
      const cam = { z: 1.25, x: t * 260 + i * 900, y: -40 };
      const P = park(g, t, cam, { season: q.season, mood: q.mood, km: 3 + i * 3 });
      layer(g, cam, 1, (g) => jogger(g, t + i * 0.3, P.CX + cam.x, P.GY + 20, q.s, { mode: q.mode, speed: q.sp, rim: P.rim, expr: q.expr, seed: i, breath: q.season === 'winter' ? 1 : 0.4, sweat: q.season === 'summer' ? 0.6 : 0 }));
      parkFg(g, t, cam, { season: q.season, snow: q.season === 'winter' ? 0.6 : 0 });
    });
  });
  // arrows between panels (getting stronger)
  for (let i = 0; i < 2; i++) { const a = popIn(t, tR + i * 0.3), ax = x0 + (i + 1) * (pw + gap) - gap / 2, ay = y0 + ph / 2; if (a > 0) { g.save(); g.translate(ax, ay); g.scale(a, a); circle(g, 0, 0, 30, '#0b1324'); ring(g, 0, 0, 30, 4, GOLD); poly(g, [[-10, -14], [14, 0], [-10, 14]], GOLD); g.restore(); } }
  goldWord(g, '3 YEARS', E.W / 2, 150, 110, popIn(t, tThree));
  const lk = popIn(t, tLot); if (lk > 0) { g.save(); g.translate(E.W / 2, E.H - 70); g.scale(lk, lk); text(g, 'STRONGER  /  LEANER  /  FASTER', 0, 0, { size: 40, color: CREAM, font: FONTS.ui, weight: 900, spacing: 3, stroke: 8, strokeColor: '#140f1c' }); g.restore(); }
  atmos(g, t, { x: 0, y: 0, z: 1 }, { color: '#ffe0ea', far: 18, near: 6 });
} });

// ---------------------------------------------------------------------------------------------------
// s122 — "A stronger heart, serious endurance, and a lot of laundry."
// ---------------------------------------------------------------------------------------------------
function heartIcon(g, x, y, r, beat) {
  const s = 1 + 0.14 * beat; g.save(); g.translate(x, y); g.scale(s, s); glow(g, 0, 0, r * 2.4, '#ff6a6a', 0.25 + 0.3 * beat);
  g.beginPath(); g.moveTo(0, r * 0.95); g.bezierCurveTo(-r * 1.4, -r * 0.1, -r * 0.7, -r * 1.05, 0, -r * 0.45); g.bezierCurveTo(r * 0.7, -r * 1.05, r * 1.4, -r * 0.1, 0, r * 0.95); g.closePath();
  g.fillStyle = linGrad(g, 0, -r, 0, r, ['#ff8a7a', '#d4262e']); g.fill(); g.strokeStyle = '#140f1c'; g.lineWidth = 10; g.stroke(); g.fillStyle = alpha('#fff', 0.35); g.beginPath(); g.ellipse(-r * 0.42, -r * 0.42, r * 0.2, r * 0.12, -0.6, 0, 7); g.fill(); g.restore();
}
// a hoodie lying in a heap (local laundry prop)
function hoodieBlob(g, x, y, s, rot, col) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  g.fillStyle = shade(col, -0.3); g.beginPath(); g.ellipse(-52, 8, 34, 16, 0.5, 0, 7); g.ellipse(52, 10, 34, 16, -0.4, 0, 7); g.fill();
  rr(g, -46, -30, 92, 66, 20); g.fillStyle = col; g.fill(); g.fillStyle = shade(col, -0.25); g.beginPath(); g.ellipse(0, -30, 28, 14, 0, 0, Math.PI); g.fill();
  seg(g, [[-8, -18], [-10, 4]], 3, shade(col, 0.45)); seg(g, [[8, -18], [10, 4]], 3, shade(col, 0.45)); g.restore();
}
function sweatband(g, x, y, s, rot) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s * 0.55); ring(g, 0, 0, 30, 14, '#f4f1e8'); ring(g, 0, 0, 30, 4, '#3f9a4a'); g.restore(); }
registerShot('s122', { draw(g, t, info) {
  const st = info.shot.start, tH = shotWord('heart', st, 0.6), tEn = shotWord('endurance', st, 1.4), tL = shotWord('laundry', st, 3.01), cut = tL - 0.12;
  if (t < cut) {
    const cam = { z: 1.1, x: -300 + t * 30, y: -150 };
    blurLayer(g, 12, (g) => park(g, t, cam, { season: 'spring', mood: 'day', fountain: false }), null, 1); veil(g, '#120a1c', 0.5);
    const hk = popIn(t, tH - 0.1), bt = t - tH - 0.25, beat = bt > 0 ? Math.max(Math.exp(-((bt % 1.2) * 9)), 0.6 * Math.exp(-(((bt + 0.25) % 1.2) * 12))) : 0;
    if (hk > 0) { g.save(); g.translate(E.W * 0.3, E.H * 0.45); g.scale(hk, hk); heartIcon(g, 0, 0, 130, beat); text(g, 'STRONGER HEART', 0, 220, { size: 44, color: CREAM, font: FONTS.ui, weight: 900, spacing: 2, stroke: 8, strokeColor: '#140f1c' }); g.restore(); }
    const ek = popIn(t, tEn - 0.1);
    if (ek > 0) { g.save(); g.translate(E.W * 0.7, E.H * 0.45); g.scale(ek, ek); circle(g, 0, 0, 170, alpha('#0b1324', 0.85)); ring(g, 0, 0, 170, 8, GOLD); glow(g, 0, 0, 300, GOLD, 0.2);
      UI.lineFigure(g, { x: 0, y: 60, s: 0.8, pose: runCycle(t, 1.8, { mode: 'run' }).pose, color: GOLD }); goldWord(g, '10 km', 0, -110, 64, 1, { rot: 0 }); text(g, 'SERIOUS ENDURANCE', 0, 220, { size: 44, color: CREAM, font: FONTS.ui, weight: 900, spacing: 2, stroke: 8, strokeColor: '#140f1c' }); g.restore(); }
    atmos(g, t, cam, { color: '#ffe0ea', far: 16, near: 6 });
    return;
  }
  // the laundry mountain
  const u = t - cut, [sx, sy] = jumpShake(t, tL, 8);
  const cam = camMove(t, info.dur, { z: [1.1, 1.15], x: [80, 100], y: [40, 30] }); cam.x += sx; cam.y += sy;
  const H = home3(g, t, cam, { room: 'bathroom', mood: 'day' }), GY = H.GY, bx = H.CX + 120, grow = ease.outBack(prog(u, 0.05, 0.4));
  layer(g, cam, 1, (g) => {
    // wicker basket
    rr(g, bx - 170, GY - 190, 340, 190, 20); g.fillStyle = '#c99a5a'; g.fill(); for (let i = 0; i < 6; i++) seg(g, [[bx - 170, GY - 170 + i * 30], [bx + 170, GY - 170 + i * 30]], 4, '#a8783a');
    g.save(); g.translate(bx, GY - 150); g.scale(1, grow); g.translate(-bx, -(GY - 150));
    const R = rng(77); for (let i = 0; i < 26; i++) { const row = Math.floor(i / 6), px = bx + (R() - 0.5) * (520 - row * 100), py = GY - 170 - row * 85 - R() * 30; if (i % 4 === 3) sweatband(g, px, py, 1.2 + R() * 0.4, R() * 2); else hoodieBlob(g, px, py, 1.0 + R() * 0.35, (R() - 0.5) * 1.4, i % 5 === 1 ? '#4aa856' : '#3f9a4a'); }
    // spills on the floor
    hoodieBlob(g, bx - 330, GY - 12, 1.1, 0.3, '#3f9a4a'); sweatband(g, bx + 300, GY - 8, 1.4, 0.2); sweatband(g, bx + 380, GY - 4, 1.2, 1.1); hoodieBlob(g, bx + 260, GY - 30, 0.9, -0.5, '#4aa856');
    g.restore();
    const topY = GY - 170 - 4 * 85 - 20; if (grow > 0.8) cat(g, { x: bx + 10, y: topY + 20 + Math.sin(t * 2) * 2, s: 1.7, facing: -1, pose: 'sit', eyes: u > 0.6 ? 'offended' : 'auto', t, rim: H.rim });
    // a sock-launch poof on landing
    if (u < 0.8) for (let i = 0; i < 8; i++) { const a = Math.PI + (i / 7) * Math.PI, d = 140 + u * 260; circle(g, bx + Math.cos(a) * d, GY - 300 + Math.sin(a) * d * 0.6, 16 * (1 - u), alpha('#ffffff', 0.5 * (1 - u))); }
  });
  home3Fg(g, t, cam, { room: 'bathroom' }); atmos(g, t, cam, { color: '#fff4dc', far: 12, near: 4 });
  goldWord(g, 'SO. MUCH. LAUNDRY.', E.W * 0.78, E.H * 0.16, 76, popIn(t, tL + 0.1));
} });

// ---------------------------------------------------------------------------------------------------
// s123 + s124 — the guideline blueprint (shared chart)
// ---------------------------------------------------------------------------------------------------
const CH = { x0: 300, base: 900, pxMin: 2.3, colW: 120, gap: 36 }, DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
function guideChart(g, t, o) {
  const ui = S().ui, { draw = 1, line = 1, you = 0, check = 0 } = o, L = CH.base - 150 * CH.pxMin;
  BP.draw(g, [[CH.x0 - 40, CH.base], [CH.x0 + 8 * (CH.colW + CH.gap) + 40, CH.base]], draw, { w: 5 });
  BP.draw(g, [[CH.x0 - 40, CH.base], [CH.x0 - 40, CH.base - 420]], draw, { w: 4 });
  text(g, 'MINUTES OF ACTIVITY, RUNNING TOTAL', CH.x0 - 40, CH.base - 450, { size: 26, color: alpha(ui.blueprint, 0.9 * draw), font: FONTS.ui, weight: 900, align: 'left', spacing: 2 });
  DAYS.forEach((d, i) => { const k = ease.out(prog(draw, 0.15 + i * 0.1, 0.5 + i * 0.07)), x = CH.x0 + i * (CH.colW + CH.gap), h = (150 * (i + 1) / 7) * CH.pxMin * k;
    if (k > 0) { g.strokeStyle = CREAM; g.lineWidth = 4; g.strokeRect(x, CH.base - h, CH.colW, h); g.fillStyle = alpha(ui.blueprint, 0.16); g.fillRect(x, CH.base - h, CH.colW, h); for (let yy = CH.base - 18; yy > CH.base - h; yy -= 18) seg(g, [[x + 6, yy], [x + CH.colW - 6, yy - 10]], 1.5, alpha(ui.blueprint, 0.35)); }
    text(g, d, x + CH.colW / 2, CH.base + 34, { size: 26, color: alpha(CREAM, draw), font: FONTS.ui, weight: 900 }); });
  // the dashed 150-minute line + label
  if (line > 0) { g.save(); g.setLineDash([18, 14]); g.strokeStyle = GOLD; g.lineWidth = 5; g.beginPath(); g.moveTo(CH.x0 - 60, L); g.lineTo(lerp(CH.x0 - 60, CH.x0 + 8 * (CH.colW + CH.gap) + 60, ease.out(line)), L); g.stroke(); g.restore();
    const lk = ease.outBack(clamp((line - 0.4) / 0.6)); if (lk > 0) { g.save(); g.translate(CH.x0 + 3 * (CH.colW + CH.gap), L - 60); g.scale(lk, lk); rr(g, -190, -34, 380, 68, 34); g.fillStyle = alpha('#0b1324', 0.92); g.fill(); g.strokeStyle = GOLD; g.lineWidth = 3; g.stroke(); text(g, '150 MIN / WEEK', 0, 2, { size: 40, color: GOLD, font: FONTS.ui, weight: 900, spacing: 2 }); g.restore(); } }
  // YOU: the gold bar that blows past
  const yx = CH.x0 + 7 * (CH.colW + CH.gap) + 30, yh = you * 420 * CH.pxMin;
  if (you > 0) { g.fillStyle = linGrad(g, 0, CH.base - yh, 0, CH.base, [GOLD, '#c98a2a']); rr(g, yx, CH.base - yh, CH.colW + 20, yh, 10); g.fill(); g.strokeStyle = CREAM; g.lineWidth = 4; g.stroke(); glow(g, yx + 70, CH.base - yh, 240, GOLD, 0.3);
    UI.lineFigure(g, { x: yx + 70, y: CH.base - yh - 4, s: 0.55, pose: runCycle(t, 2, { mode: 'run' }).pose, color: '#ffffff' }); }
  text(g, 'YOU', yx + 80, CH.base + 34, { size: 30, color: alpha(GOLD, draw), font: FONTS.ui, weight: 900 });
  if (check > 0) { g.save(); g.translate(CH.x0 + 8 * (CH.colW + CH.gap) + 110, L); g.scale(check, check); circle(g, 0, 0, 46, '#0b1324'); ring(g, 0, 0, 46, 6, ui.good); g.strokeStyle = ui.good; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.moveTo(-20, 2); g.lineTo(-4, 18); g.lineTo(22, -16); g.stroke(); g.restore(); }
}
const chartZoom = (g, t, dur, z0, z1) => { const z = lerp(z0, z1, ease.inOut(t / dur)); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2 + Math.sin(t * 0.5) * 3, -E.H / 2); };
registerShot('s123', { draw(g, t, info) {
  const st = info.shot.start, tHun = shotWord('hundred', st, 2.59), tAd = shotWord('adults', st, 1.29);
  BP.board(g, t, { title: 'THE GUIDELINE', fig: 'FIG 17 - THE GUIDELINE' });
  g.save(); chartZoom(g, t, info.dur, 1.0, 1.03);
  guideChart(g, t, { draw: ease.out(prog(t, 0, 1.5)), line: prog(t, tHun - 0.2, tHun + 0.6) });
  g.restore();
  // adults icon pops on 'adults'
  const ak = popIn(t, tAd); if (ak > 0) { g.save(); g.translate(1640, 330); g.scale(ak, ak); for (let i = 0; i < 3; i++) UI.lineFigure(g, { x: -70 + i * 70, y: 60, s: 0.45, pose: idle(POSES.stand, t, i), color: CREAM }); text(g, 'ADULTS', 0, 110, { size: 30, color: GOLD, font: FONTS.ui, weight: 900, spacing: 2 }); g.restore(); }
} });
registerShot('s124', { draw(g, t, info) {
  const st = info.shot.start, tMod = shotWord('moderate', st, 0.35), tBl = shotWord('blows', st, 2.91), tThat = shotWord('that', st, 3.51);
  BP.board(g, t, { title: 'THE GUIDELINE', fig: 'FIG 17 - THE GUIDELINE' });
  const you = ease.in(prog(t, tBl - 0.3, tBl + 0.9)), push = Math.max(0, you * 420 * CH.pxMin - 700);
  g.save(); chartZoom(g, t, info.dur, 1.03, 1.06); g.translate(0, push * 0.25);
  guideChart(g, t, { draw: 1, line: 1, you, check: popIn(t, tThat) });
  g.restore();
  const mk = popIn(t, tMod); if (mk > 0) { g.save(); g.translate(E.W / 2 - 80, 140); g.scale(mk, mk); text(g, '"MODERATE" = brisk walk, easy bike ride', 0, 0, { size: 34, color: CREAM, font: FONTS.ui, weight: 900, spacing: 1 }); g.restore(); }
  goldWord(g, '~7 HOURS', 1500, 300, 96, popIn(t, tBl + 0.4));
  if (t > tBl) FX.speedLines(g, t, { cx: 1450, cy: -400, count: 18, a: 0.1 * (1 - prog(t, tBl + 1, tBl + 1.6)), inner: 500 });
} });

// ---------------------------------------------------------------------------------------------------
// s125 — "But it won't make you superhuman."  the brook hop
// ---------------------------------------------------------------------------------------------------
registerShot('s125', { draw(g, t, info) {
  const st = info.shot.start, tSup = shotWord('superhuman', st, 1.01), H0 = 150, opt = { landing: 'splash', up: 0.32, hang: 0.08, down: 0.28 };
  const off = jumpPose(0, 0, H0, opt).times.tL, t0 = tSup - off, J = jumpPose(t, t0, H0, opt), T = J.times;
  const [sx, sy] = jumpShake(t, T.tL, 8), cam = camMove(t, info.dur, { z: [1.12, 1.16], x: [-140, -80], y: [-30, -36] }); cam.x += sx; cam.y += sy;
  const P = park(g, t, cam, { season: 'spring', mood: 'day', fountain: false }), GY = P.GY, bx = P.CX + 60, bw = 360, bench = P.pos.benchX;
  const hx = lerp(bx - bw / 2 - 120, bx - 20, ease.inOut(prog(t, T.t0, T.tL))), inW = t > T.tL;
  layer(g, cam, 1, (g) => {
    // the brook across the path
    g.fillStyle = '#6a5a3a'; rr(g, bx - bw / 2 - 18, GY - 30, bw + 36, 120, 30); g.fill();
    g.fillStyle = linGrad(g, 0, GY - 20, 0, GY + 80, ['#5ab8e8', '#2a6aa8']); rr(g, bx - bw / 2, GY - 20, bw, 100, 24); g.fill();
    for (let i = 0; i < 6; i++) { const xx = bx - bw / 2 + 30 + ((i * 70 + t * 60) % (bw - 60)); seg(g, [[xx, GY + 10 + (i % 3) * 20], [xx + 40, GY + 10 + (i % 3) * 20]], 3, alpha('#e8f6ff', 0.6)); }
    text(g, '1 m', bx, GY - 70, { size: 34, color: GOLD, font: FONTS.ui, weight: 900, alpha: 1 - prog(t, T.t0, T.t0 + 0.3) });
    // MINA laughing on the bench
    actor(g, 'MINA', { x: bench + 40, y: GY - 20, s: 1.9, facing: 1, pose: idle(t > T.tL ? poseAt(t, [[T.tL, 'sit'], [T.tL + 0.2, { ...POSES.sit, eF: [24, -120], hF: [16, -130] }]]) : POSES.sit, t * (t > T.tL ? 3 : 1), 4),
      expr: exprAt(t, [[0, 'smile'], [T.tL + 0.1, 'joy']]), talk: t > T.tL + 0.15 ? 0.3 + 0.5 * Math.abs(Math.sin(t * 14)) : 0, blink: blinkFlag(t, 2.9, 4), look: lookToward(1, 0.1), rim: P.rim, t });
    jumper(g, 'HERO', J, { x: hx, gy: GY + 14 + (inW ? 34 : 0), s: 1.9, facing: 1, expr: exprAt(t, [[0, 'determined'], [T.t0, 'joy'], [T.tL - 0.15, 'shocked'], [T.tL + 0.35, 'sheepish']]), blink: blinkFlag(t, 3.3, 4), rim: P.rim, t, shadow: !inW });
    jumpFX(g, t, J, { x: hx, gy: GY + 40, s: 1.9, landing: 'splash', size: 1.2 });
    if (inW) { g.fillStyle = alpha('#2a6aa8', 0.85); rr(g, hx - 70, GY + 30, 140, 40, 16); g.fill(); seg(g, [[hx - 60, GY + 34], [hx + 60, GY + 34]], 3, alpha('#e8f6ff', 0.7)); }
  });
  parkFg(g, t, cam, { season: 'spring' }); atmos(g, t, cam, { color: '#ffe0ea' });
  chip(g, t, { str: 'NOT SUPERHUMAN', at: tSup + 0.15, tone: 'coral' });
} });

// ---------------------------------------------------------------------------------------------------
// s126 — "You'd stall unless you made it harder, and without rest,"
// ---------------------------------------------------------------------------------------------------
registerShot('s126', { draw(g, t, info) {
  const st = info.shot.start, tSt = shotWord('stall', st, 0.45), tHd = shotWord('harder', st, 1.71), tRe = shotWord('rest', st, 2.63);
  const cam = camMove(t, info.dur, { z: [1.05, 1.1], x: [-40, 0], y: [10, 10] });
  const H = home3(g, t, cam, { room: 'bedroom', mood: 'day', marks: 31, month: 'MARCH' }), GY = H.GY, hx = H.CX + 40;
  const book = ease.inOut(prog(t, tHd - 0.6, tHd)), devX = hx - 420, minaX = hx + 380;
  layer(g, cam, 1, (g) => {
    actor(g, 'DEV', { x: devX, y: GY + 20, s: 1.9, facing: 1, pose: idle(poseAt(t, [[0, 'stand'], [tHd - 0.7, 'holdFront'], [tHd, { ...POSES.point, hF: [52, -150] }], [tHd + 0.5, 'stand']], 0.25), t, 2), expr: exprAt(t, [[0, 'smirk'], [tHd, 'cheeky']]), blink: blinkFlag(t, 3.1, 2), look: lookToward(1, 0.1), rim: H.rim, t });
    const Hh = trainee(g, 'HERO', { pose: idle(t < tSt ? POSES.stand : POSES.shrug, t, 3), shadow: [0, 38] }, { x: hx, y: GY + 20, s: 1.9, facing: t < tRe - 0.2 ? -1 : 1, t, rim: H.rim, blink: blinkFlag(t, 3.3, 3), backpack: 1,
      look: t < tRe - 0.2 ? lookToward(1, 0) : lookToward(1, 0), expr: exprAt(t, [[0, 'neutral'], [tSt, 'confused'], [tHd + 0.1, 'worried'], [tRe, 'sheepish']]) });
    // one more textbook flies from Dev's hand into the backpack
    if (book < 1) { const [bx2, by2] = Hh.back, sx2 = devX + 70, sy2 = GY - 270, x = lerp(sx2, bx2, book), y = lerp(sy2, by2 - 30, book) - Math.sin(book * Math.PI) * 120; g.save(); g.translate(x, y); g.rotate(book * 3); rr(g, -34, -24, 68, 48, 4); g.fillStyle = '#2f6fd0'; g.fill(); g.fillStyle = '#f4f1e8'; g.fillRect(-30, 16, 60, 6); g.restore(); }
    actor(g, 'MINA', { x: minaX, y: GY + 20, s: 2.0, facing: 1, pose: idle(t < tRe - 0.1 ? POSES.stand : reaction('point', t, tRe - 0.1, 'stand'), t, 4), expr: exprAt(t, [[0, 'neutral'], [tRe - 0.1, 'angry']]), blink: blinkFlag(t, 2.9, 4), look: lookToward(1, 0.3), rim: H.rim, t });
  });
  home3Fg(g, t, cam, { room: 'bedroom' }); atmos(g, t, cam, { color: '#fff4dc', far: 14, near: 4 });
  const ak = popIn(t, tHd); if (ak > 0) { g.save(); g.translate(E.W * 0.22, E.H * 0.2); g.scale(ak, ak); poly(g, [[-26, 30], [0, -10], [26, 30]], GOLD); g.fillStyle = GOLD; g.fillRect(-10, 26, 20, 40); g.restore(); }
  chip(g, t, { str: 'ADD DIFFICULTY', at: tHd, x: E.W * 0.22, y: E.H * 0.33 });
  chip(g, t, { str: 'REST DAY', at: tRe, x: E.W * 0.8, y: E.H * 0.22, tone: 'blue' });
} });

// ---------------------------------------------------------------------------------------------------
// s127 — "your body pushes back."
// ---------------------------------------------------------------------------------------------------
registerShot('s127', { draw(g, t, info) {
  const st = info.shot.start, tBk = shotWord('back', st, 1.17), tCol = tBk - 0.12, fat = clamp(t / tCol);
  const R = pushUp(t, 1.1, { from: 63, fatigue: fat, tremble: fat, sag: fat * 0.6, collapse: tCol });
  let cam = camMove(t, info.dur, { z: [1.3, 1.36], x: [120, 140], y: [150, 160] });
  const [sx, sy] = jumpShake(t, tCol + 0.15, 4); cam = { ...cam, x: cam.x + sx, y: cam.y + sy };
  const H = home3(g, t, cam, { room: 'bedroom', mood: 'dawn', marks: 31 }), hx = H.CX - 60, s = 2.1, tJ = tBk + 0.02, tOn = tJ + 0.4;
  layer(g, cam, 1, (g) => {
    const onBack = t >= tOn;
    const Hh = trainee(g, 'HERO', R, { x: hx, y: H.GY + 30, s, facing: 1, t, rim: H.rim, blink: blinkFlag(t, 3.2, 1), look: lookToward(1, 0.4),
      expr: exprAt(t, [[0, 'determined'], [tCol, 'shocked'], [tBk + 0.25, 'sheepish']]), sweat: 0.4 + fat * 0.6, breath: 1.2, cat: onBack ? { pose: 'loaf', eyes: 'offended', s: 0.74, facing: -1 } : null });
    if (!onBack) { const k = prog(t, tJ, tOn), x0 = hx + 520, y0 = H.GY + 30, [x1, y1] = Hh.back;
      const x = lerp(x0, x1, ease.inOut(k)), y = lerp(y0, y1, k) - Math.sin(k * Math.PI) * 140;
      cat(g, { x, y, s: s * 0.74, facing: -1, pose: k > 0 && k < 1 ? 'stand' : 'sit', walk: k * 6, t, rim: H.rim }); }
  });
  home3Fg(g, t, cam, { room: 'bedroom' }); atmos(g, t, cam, { color: '#ffd8b0', far: 14, near: 4 });
  chip(g, t, { str: 'NO REST = PUSHBACK', at: tBk + 0.1, tone: 'coral', y: E.H * 0.16 });
} });

// ---------------------------------------------------------------------------------------------------
// s128 — "As for your hair? That was always up to your family tree."  hallway photo wall
// ---------------------------------------------------------------------------------------------------
const FAMILY = [
  { name: 'GRANDPA', x: 960, y: 190, of: { top: 'tracksuit', color: '#7a5a3e', color2: '#7a5a3e', legs: '#3a3030', head: 'curly', face: 'glasses' }, bg: '#c8a878', sepia: 0.45 },
  { name: 'DAD', x: 700, y: 510, of: { top: 'tshirt', color: '#2f6fd0', legs: '#2a2a3a', head: 'curly' }, bg: '#a8c8e0', sepia: 0.15 },
  { name: 'UNCLE', x: 1220, y: 510, of: { top: 'hoodie', color: '#a04040', legs: '#2a2a3a', head: 'curly' }, bg: '#e0b0a0', sepia: 0.15 },
  { name: 'YOU', x: 700, y: 830, of: 'HERO', bg: '#b8e0b0', sepia: 0 },
];
registerShot('s128', { draw(g, t, info) {
  const st = info.shot.start, tHair = shotWord('hair', st, 0.65), tFam = shotWord('family', st, 2.85), tTree = shotWord('tree', st, 3.13);
  const cam = camMove(t, info.dur, { z: [1.0, 1.05], x: [-60, 60], y: [-10, -24] });
  layer(g, { ...cam, x: cam.x * 0.4 }, 0.6, (g) => {
    g.fillStyle = linGrad(g, 0, -200, 0, E.H + 200, ['#d8a878', '#c08858', '#9a6a48']); g.fillRect(-400, -400, E.W + 800, E.H + 800);
    for (let i = -6; i < 30; i++) { g.fillStyle = alpha('#ffffff', 0.05); g.fillRect(i * 90, -400, 40, E.H + 800); }
  });
  layer(g, cam, 1, (g) => {
    glow(g, 160, 260, 600, '#ffd8a0', 0.35); rr(g, 130, 300, 60, 80, 10); g.fillStyle = '#f8e8c0'; g.fill(); seg(g, [[160, 380], [160, 440]], 6, '#6a4a30');            // wall lamp
    g.fillStyle = '#7a4a30'; g.fillRect(-400, 1050, E.W + 800, 400); g.fillStyle = '#e8d8c0'; g.fillRect(-400, 1030, E.W + 800, 24);
    // gold family tree draws on at 'family tree'
    const tk = ease.out(prog(t, tFam - 0.25, tTree + 0.25)), [G, D, U, Y] = FAMILY;
    if (tk > 0) { const MY = (G.y + D.y) / 2, lines = [[[G.x, G.y + 130], [G.x, MY], [D.x, MY], [D.x, D.y - 130]], [[G.x, MY], [U.x, MY], [U.x, U.y - 130]], [[D.x, D.y + 160], [D.x, Y.y - 130]]];
      for (const L of lines) BP.draw(g, L, tk, { w: 12, color: GOLD }); glow(g, G.x, MY, 260, GOLD, 0.25 * tk); for (const [lx, ly] of [[G.x, MY], [D.x, MY], [U.x, MY]]) circle(g, lx, ly, 10 * tk, GOLD); }
    FAMILY.forEach((m, i) => {
      const w = 190, h = 230, sway = Math.sin(t * 0.8 + i) * 0.006;
      g.save(); g.translate(m.x, m.y); g.rotate((i % 2 ? 0.02 : -0.02) + sway);
      rr(g, -w / 2 + 10, -h / 2 + 14, w, h, 8); g.fillStyle = 'rgba(0,0,0,.35)'; g.fill();
      rr(g, -w / 2 - 18, -h / 2 - 18, w + 36, h + 36, 10); g.fillStyle = i === 0 ? '#8a6a3a' : '#5a3a2a'; g.fill();
      g.save(); rr(g, -w / 2, -h / 2, w, h, 4); g.clip(); g.fillStyle = m.bg; g.fillRect(-w / 2, -h / 2, w, h);
      actor(g, m.of, { x: 0, y: h * 1.05, s: 1.2, facing: 1, pose: idle(POSES.stand, t * 0.4, i), expr: 'smile', blink: blinkFlag(t, 3.6, i * 2), look: lookToward(0.2, 0), t });
      if (m.sepia) { g.fillStyle = alpha('#a0703a', m.sepia); g.fillRect(-w / 2, -h / 2, w, h); }
      g.fillStyle = alpha('#ffffff', 0.12); g.beginPath(); g.moveTo(-w / 2, -h / 2); g.lineTo(-w / 2 + 80, -h / 2); g.lineTo(-w / 2, -h / 2 + 120); g.fill();
      g.restore();
      rr(g, -70, h / 2 + 26, 140, 36, 6); g.fillStyle = '#e8d8b0'; g.fill(); text(g, m.name, 0, h / 2 + 45, { size: 22, color: '#3a2a1a', font: FONTS.ui, weight: 900, spacing: 2 });
      const hk = prog(t, tHair + i * 0.12, tHair + i * 0.12 + 0.6); if (hk > 0 && hk < 1) FX.sparkle(g, 30, -h * 0.22, 30 * Math.sin(hk * Math.PI), '#ffe8b0', 0.9);
      g.restore();
    });
    // HAIR LOG pinned beside them, open on UNCHANGED.
    const rows = [...HAIR_ROWS.slice(0, 4), ['DAY 1,095', 'UNCHANGED.']];
    hairLog(g, t, { x: 1580, y: 720, s: 0.46, rot: 0.05, reveal: 1, rows }); circle(g, 1580, 572, 12, '#d4262e'); circle(g, 1576, 568, 4, '#fff');
  });
  atmos(g, t, cam, { color: '#ffe8c0', far: 14, near: 4 });
  const tk2 = popIn(t, tTree); if (tk2 > 0) { g.save(); g.translate(E.W * 0.82, E.H * 0.2); g.scale(tk2, tk2); rr(g, -200, -40, 400, 80, 40); g.fillStyle = alpha('#0b1324', 0.9); g.fill(); g.strokeStyle = GOLD; g.lineWidth = 3; g.stroke(); text(g, 'IT\'S GENETIC', 0, 2, { size: 40, color: GOLD, font: FONTS.ui, weight: 900, spacing: 2 }); g.restore(); }
} });

// ---------------------------------------------------------------------------------------------------
// s129 + s130 — the question
// ---------------------------------------------------------------------------------------------------
function questionBg(g, t, info, z0, z1) {
  const cam = camMove(t, info.dur, { z: [z0, z1], x: [-120, -100], y: [-170, -180] });
  blurLayer(g, 6, (g) => home3(g, t, cam, { room: 'bedroom', mood: 'night', marks: 31, month: 'MARCH' }), null, 1);
  veil(g, '#0e0818', 0.55); glow(g, E.W / 2, E.H * 0.36, 900, '#ff9a5a', 0.14);
  return cam;
}
function wordLine(g, t, st, words, y, size, fbBase) {
  const ws = words.map(([s]) => measure(g, s, size, FONTS.title, 700)), gp = size * 0.24, tot = ws.reduce((a, b) => a + b, 0) + gp * (words.length - 1); let x = E.W / 2 - tot / 2;
  words.forEach(([s, w], wi) => { const tw = shotWord(w, st, fbBase + wi * 0.15), p = popIn(t, tw, 0.3), cx = x + ws[wi] / 2; x += ws[wi] + gp; if (p <= 0) return;
    g.save(); g.translate(cx, y + (1 - p) * 40); g.scale(p, p); g.rotate((wi - 1) * 0.012); text(g, s, 0, 0, { size, color: CREAM, font: FONTS.title, weight: 700, stroke: size * 0.17, strokeColor: '#1a0f26', glow: 30, glowColor: alpha('#ff9a40', 0.7) }); g.restore(); });
}
registerShot('s129', { draw(g, t, info) {
  const st = info.shot.start, cam = questionBg(g, t, info, 1.6, 1.68);
  wordLine(g, t, st, [['WOULD', 'would'], ['YOU', 'you'], ['TAKE', 'take']], E.H * 0.36, 150, 0.35);
  wordLine(g, t, st, [['THE', 'the'], ['CHALLENGE?', 'challenge']], E.H * 0.56, 150, 0.8);
  atmos(g, t, cam, { color: '#ffd8b0', far: 22, near: 8 });
  for (let i = 0; i < 12; i++) { const r = rng(40 + i), px = r() * E.W, py = (r() * E.H + t * (20 + r() * 20)) % E.H; FX.sparkle(g, px, py, 8 + r() * 6, '#ffe2a8', 0.35 + 0.3 * Math.sin(t * 2 + i)); }
} });
const ROUTINE = [['PUSH-UPS', 'push'], ['SIT-UPS', 'sit'], ['SQUATS', 'squat'], ['10 km RUN', 'run']];
const iconPose = (kind, t) => kind === 'push' ? pushUp(t, 1.0).pose : kind === 'sit' ? sitUp(t, 0.8).pose : kind === 'squat' ? squat(t, 0.6).pose : runCycle(t, 1.6, { mode: 'run' }).pose;
registerShot('s130', { draw(g, t, info) {
  const st = info.shot.start, ui = S().ui, tAdd = shotWord('add', st, 0.59), tDrop = shotWord('drop', st, 1.07), tCom = shotWord('comments', st, 2.63);
  const cam = questionBg(g, t, info, 1.68, 1.74);
  text(g, 'WOULD YOU TAKE THE CHALLENGE?', E.W / 2, 150, { size: 76, color: CREAM, font: FONTS.title, weight: 700, stroke: 13, strokeColor: '#1a0f26', glow: 20, glowColor: alpha('#ff9a40', 0.6) });
  const cw = 300, ch = 360, gap = 40, slide = ease.out(prog(t, tAdd - 0.1, tAdd + 0.4)), n = 4 + slide, x0 = E.W / 2 - (n * cw + (n - 1) * gap) / 2, y = E.H * 0.52;
  ROUTINE.forEach(([label, kind], i) => {
    const pk = popIn(t, 0.05 + i * 0.08), x = x0 + i * (cw + gap) + cw / 2, drop = i === 1, wob = drop ? Math.sin(Math.max(0, t - tDrop) * 30) * Math.exp(-Math.max(0, t - tDrop) * 4) * 0.12 * (t > tDrop ? 1 : 0) : 0;
    if (pk <= 0) return; g.save(); g.translate(x, y + Math.sin(t * 1.4 + i) * 5); g.rotate(wob); g.scale(pk, pk);
    rr(g, -cw / 2, -ch / 2, cw, ch, 26); g.fillStyle = alpha('#0b1324', 0.9); g.fill(); g.strokeStyle = alpha(CREAM, 0.7); g.lineWidth = 4; g.stroke();
    UI.lineFigure(g, { x: kind === 'run' || kind === 'squat' ? 0 : -60, y: 60, s: 0.6, pose: iconPose(kind, t + i * 0.4), color: GOLD });
    text(g, label, 0, ch / 2 - 50, { size: 36, color: CREAM, font: FONTS.ui, weight: 900, spacing: 1 });
    if (drop && t > tDrop) { const k = ease.out(prog(t, tDrop + 0.1, tDrop + 0.4)); g.fillStyle = alpha('#0b0610', 0.45 * k); rr(g, -cw / 2, -ch / 2, cw, ch, 26); g.fill(); g.strokeStyle = ui.accent || '#ff5a4a'; g.lineWidth = 14; g.lineCap = 'round'; g.beginPath(); g.moveTo(-cw * 0.38, -ch * 0.38); g.lineTo(lerp(-cw * 0.38, cw * 0.38, k), lerp(-ch * 0.38, ch * 0.38, k)); g.stroke(); }
    g.restore();
  });
  if (slide > 0) { const x = x0 + 4 * (cw + gap) + cw / 2, pk = popIn(t, tAdd + 0.1); g.save(); g.translate(x, y); g.scale(pk, pk); rr(g, -cw / 2, -ch / 2, cw, ch, 26); g.fillStyle = alpha('#2a1c0a', 0.85); g.fill(); g.save(); g.setLineDash([16, 12]); g.strokeStyle = GOLD; g.lineWidth = 5; rr(g, -cw / 2, -ch / 2, cw, ch, 26); g.stroke(); g.restore(); glow(g, 0, 0, 260, GOLD, 0.25); goldWord(g, '+', 0, -20, 170, 1, { rot: 0 }); text(g, 'YOUR IDEA', 0, ch / 2 - 50, { size: 34, color: GOLD, font: FONTS.ui, weight: 900, spacing: 1 }); g.restore(); }
  const bp = popIn(t, tCom); if (bp > 0) { g.save(); g.translate(E.W * 0.86, E.H * 0.86 + Math.sin(t * 3) * 4); g.scale(bp, bp); g.rotate(-0.08); glow(g, 0, 0, 240, ui.gold, 0.25); UI.bubble(g, 0, 0, { w: 220, h: 130, color: '#f4efe6' }); g.restore(); if (t - tCom < 0.5) FX.sparkle(g, E.W * 0.86 + 120, E.H * 0.86 - 80, 40, '#fff', 0.9); }
  atmos(g, t, cam, { color: '#ffd8b0', far: 22, near: 8 });
} });

// ---------------------------------------------------------------------------------------------------
// s131 — END SCREEN at the dawn finish line
// ---------------------------------------------------------------------------------------------------
registerShot('s131', { draw(g, t, info) {
  const st = info.shot.start, tSub = shotWord('subscribe', st, 0.23), tMore = shotWord('more', st, 0.89), tIfs = shotWord('Ifs', st, 1.25);
  const cam = camMove(t, info.dur, { z: [1.0, 1.06], x: [30, -10], y: [-40, -50] });
  const P = park(g, t, cam, { season: 'spring', mood: 'dawn', fountain: false, bench: false }), GY = P.GY, CX = P.CX, Y = GY + 40, rim = P.rim;
  layer(g, cam, 1, (g) => {
    for (const dx of [-760, 120]) { seg(g, [[CX + dx, GY + 40], [CX + dx, GY - 220]], 12, '#c8a070'); circle(g, CX + dx, GY - 224, 9, '#d8b080'); }
    bike(g, t, { x: CX - 560, gy: Y + 20, s: 2.2, facing: 1, rider: 'MINA', phase: 0.2, expr: exprAt(t, [[0, 'smile'], [tIfs, 'joy']]), blink: blinkFlag(t, 2.9, 2), look: lookToward(1, -0.1), rim, wave: t > tIfs && t < tIfs + 0.8 });
    const hp = t < tSub ? idle(POSES.relaxed, t, 1) : idle(poseAt(t, [[tSub, 'relaxed'], [tSub + 0.2, 'wave']], 0.2), t, 1);
    actor(g, 'HERO', { x: CX - 260, y: Y, s: 2.4, facing: 1, pose: hp, expr: exprAt(t, [[0, 'smile'], [tSub, 'joy']]), blink: blinkFlag(t, 3.4, 1), look: lookToward(1, -0.1), rim, t });
    const dP = idle(t < tMore ? { ...POSES.stand, eF: [26, -176], hF: [48, -196] } : poseAt(t, [[tMore, { ...POSES.stand, eF: [26, -176], hF: [48, -196] }], [tMore + 0.25, 'pointUp']], 0.2), t, 3);
    actor(g, 'DEV', { x: CX - 20, y: Y + 6, s: 2.4, facing: -1, pose: dP, expr: exprAt(t, [[0, 'smile'], [tMore, 'smirk']]), blink: blinkFlag(t, 3.1, 3), look: lookToward(-1, -0.1), rim, t });
    finishLine(g, t, { a: [CX - 760, GY - 200], b: [CX + 120, GY - 200], tape: 0.3, sag: 30 });
    { const rx = CX - 20 - 48 * 2.4 + Math.sin(t * 2) * 3, ry = Y + 6 - 200 * 2.4; g.fillStyle = '#f4f1ea'; g.beginPath(); g.ellipse(rx, ry, 30, 34, 0, 0, 7); g.fill(); g.fillStyle = '#c8b090'; g.beginPath(); g.ellipse(rx, ry, 10, 12, 0, 0, 7); g.fill(); g.fillStyle = '#fbfaf6'; g.beginPath(); g.moveTo(rx - 20, ry + 20); g.quadraticCurveTo(rx - 40 + Math.sin(t * 4) * 10, ry + 120, rx - 10, ry + 200); g.lineTo(rx + 14, ry + 196); g.quadraticCurveTo(rx - 14 + Math.sin(t * 4) * 10, ry + 120, rx + 8, ry + 24); g.closePath(); g.fill(); }
    pillow(g, t, { x: CX + 230, y: Y - 40, s: 1.6, rim }); cat(g, { x: CX + 236, y: Y - 88, s: 1.7, facing: -1, pose: 'sit', t, rim, eyes: t > tIfs ? 'glint' : 'auto' });
  });
  parkFg(g, t, cam, { season: 'spring' });
  glow(g, E.W * 0.9, E.H * 0.1, 700, '#ffcf8f', 0.26); FX.godRays(g, E.W * 0.9, E.H * 0.06, { angle: 2.4, spread: 0.9, len: 1700, color: '#ffe2a8', a: 0.09, t });
  atmos(g, t, cam, { color: '#ffe8c0', far: 26, near: 8 });
  // the card flips back to DAY 1 (the loop)
  timeSkip(g, t, { x: 330, y: 90, s: 0.46, keys: [[0, 'DAY 1,095', 'THREE YEARS'], [0.25, 'DAY 1', 'AGAIN?']] });
  const qa = ease.out(prog(t, 0.15, 0.7)); text(g, 'WOULD YOU TAKE THE CHALLENGE?', E.W * 0.7, 150, { size: 54, color: CREAM, font: FONTS.title, weight: 700, stroke: 11, strokeColor: '#1a0f26', glow: 18, glowColor: alpha('#ff9a40', 0.6), alpha: qa });
  const sp = ease.outBack(prog(t, tSub - 0.05, tSub + 0.45)), px = E.W * 0.74, py = 420;
  if (sp > 0) { g.save(); g.translate(px, py); g.scale(sp, sp); const bump = 1 + 0.03 * Math.sin(t * 6); g.scale(bump, bump); rr(g, -230, -58, 460, 116, 58); g.fillStyle = '#e0302a'; g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 4; g.stroke();
    g.fillStyle = '#fff'; g.beginPath(); g.moveTo(-168, 16); g.quadraticCurveTo(-168, -26, -148, -26); g.quadraticCurveTo(-128, -26, -128, 16); g.closePath(); g.fill(); circle(g, -148, 26, 7, '#fff'); text(g, 'Subscribe', 30, 3, { size: 54, color: '#fff', font: FONTS.ui, weight: 900 }); g.restore(); }
  const bp = popIn(t, tMore, 0.4); if (bp > 0) { g.save(); g.translate(px - 120, py + 130); g.scale(bp, bp); UI.bubble(g, 0, 0, { w: 150, h: 84 }); g.restore(); }
  const lp = popIn(t, tMore + 0.15, 0.45); if (lp > 0) { g.save(); g.translate(px + 110, py + 130); g.scale(lp, lp); g.fillStyle = '#fff1dc'; rr(g, -70, -8, 34, 52, 8); g.fill(); g.beginPath(); g.moveTo(-26, 44); g.lineTo(-26, -6); g.lineTo(-2, -44); g.quadraticCurveTo(14, -52, 16, -34); g.lineTo(8, -8); g.lineTo(58, -8); g.quadraticCurveTo(76, -6, 70, 12); g.lineTo(60, 38); g.quadraticCurveTo(56, 46, 46, 46); g.closePath(); g.fill(); g.restore(); if (t - tMore < 0.9) FX.sparkle(g, px + 160, py + 80, 34 * (1 - (t - tMore) / 0.9), '#fff', 0.9); }
  const fade = prog(t, info.dur - 0.7, info.dur); if (fade > 0) veil(g, '#0a0612', fade);
} });
