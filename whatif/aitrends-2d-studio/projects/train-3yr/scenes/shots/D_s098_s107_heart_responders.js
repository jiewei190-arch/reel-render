// D_s098_s107_heart_responders.js — ep 3 batch D: RULE 5 (a fit heart does less work), BPM 60-100 (FIG 14), the watch at 41,
// the trained heart (FIG 15), people improve by different amounts (three-shot), the 700+ adults study (FIG 16), the 20-week program,
// some hugely / some barely, "You're a good responder.", Biscuit: zero days.
import { E, V, S, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, glow, alpha, rr, seg, circle, poly, text, FONTS, rng, shade } from '/engine/core.js';
import { POSES, headPos } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { actor, cat } from '../sets/actors.js';
import { board, label } from '../sets/bp.js';
import { heart, bpmMonitor } from '../sets/body.js';
import { park, parkFg } from '../sets/park.js';
import { apartment, apartmentFg } from '../sets/apartment.js';
import { breathPuff } from '../sets/train.js';
import { ruleCard, chip } from '../sets/hud.js';
import { faceAt } from '../sets/faces.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, reaction, lookToward, camMove, atmos, EXTRA } from '../sets/acting.js';
import { shotWord, push, heroFace, jogPose, EXTRAS, smartwatch, fitBar } from './D_lib.js';

const air = (g, t) => FX.dust(g, t, { count: 16, color: '#bcd4ff', a: 0.1, seed: 31 });
const pop = (g, t, at, x, y, str, size = 64) => { const p = ease.outBack(prog(t, at, at + 0.4)); if (p <= 0.02) return; const U = S().ui; g.save(); g.translate(x, y); g.scale(p, p); text(g, str, 0, 0, { size, color: U.gold, font: FONTS.ui, weight: 900, stroke: 8, strokeColor: '#0b1324', glow: 12, glowColor: alpha(U.gold, 0.5) }); g.restore(); };
const ecg = (g, t, y0, bpm, amp, a, col = '#7fe8a0') => { g.save(); g.strokeStyle = alpha(col, a); g.lineWidth = 4; g.beginPath(); for (let i = 0; i <= 240; i++) { const x = i / 240 * E.W, tt = x / E.W * 2.2 - t, p = ((tt * bpm / 60) % 1 + 1) % 1, y = y0 - (p < 0.04 ? Math.sin(p / 0.04 * Math.PI) * amp : p < 0.08 ? -Math.sin((p - 0.04) / 0.04 * Math.PI) * amp * 0.3 : 0); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); g.restore(); };

// s098 — RULE 5 CARD: "Endurance training lowers your resting heart rate."  over the dimmed living room; a faint ECG along the bottom
registerShot('s098', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.2, 1.24], x: [-200, -180], y: [40, 40] });
  ruleCard(g, t, info, { n: 5, title: 'A FIT HEART DOES LESS WORK.', bg: (g, t) => { blurLayer(g, 10, (g) => apartment(g, t, cam, { mood: 'day', power: 1 }), null, 1); veil(g, '#0a0812', 0.3); } });
  ecg(g, t, E.H * 0.95, 50, 50, 0.45 * ease.out(prog(t, 0.3, 1.0)));
} });

// s099 — FIG 14 BPM: "For most adults, normal is sixty to a hundred beats a minute."  monitor draws on, NORMAL band, gold 60 + 100, needle wanders inside
registerShot('s099', { draw(g, t, info) {
  const st = info.shot.start, tNorm = shotWord('normal', st, 0.95), t60 = shotWord('sixty', st, 1.61), t100 = shotWord('hundred', st, 2.45);
  board(g, t, { title: 'FIG 14 - RESTING HEART RATE', fig: 'BEATS PER MINUTE' });
  push(g, t, info.dur, () => {
    const bpm = 76 + 9 * Math.sin(t * 0.9) + 4 * Math.sin(t * 2.3);
    bpmMonitor(g, t, { x: E.W * 0.5, y: E.H * 0.52, w: 1240, h: 560, k: ease.out(prog(t, 0.05, 1.0)), bpm, band: ease.out(prog(t, tNorm - 0.2, tNorm + 0.4)), athlete: 0 });
    pop(g, t, t60, E.W * 0.22, E.H * 0.86, '60'); pop(g, t, t100, E.W * 0.78, E.H * 0.86, '100');
    const k = ease.out(prog(t, t100 + 0.2, t100 + 0.6)); if (k > 0) { const U = S().ui; seg(g, [[E.W * 0.26, E.H * 0.86], [E.W * 0.26 + (E.W * 0.48) * k, E.H * 0.86]], 4, alpha(U.gold, 0.7)); text(g, 'NORMAL', E.W * 0.5, E.H * 0.9, { size: 34, color: U.gold, font: FONTS.ui, weight: 900, spacing: 4, alpha: k }); }
  });
  air(g, t);
} });

// s100 — WATCH INSERT: "A well-trained athlete can be closer to forty."  HERO's wrist on the sofa arm; BPM ticks down to a gold 41; ATHLETE ~40 chip; Biscuit's paw
registerShot('s100', { draw(g, t, info) {
  const st = info.shot.start, t40 = shotWord('forty', st, 2.25), z = lerp(1.2, 1.25, ease.inOut(t / info.dur));
  blurLayer(g, 14, (g) => apartment(g, t, { z: 2.2, x: -170, y: 220 }, { mood: 'day', power: 1 }), null, 1); veil(g, '#1a1020', 0.2);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  rr(g, -100, E.H * 0.62, E.W + 200, 500, 120); g.fillStyle = shade('#5a4a78', -0.35); g.fill(); rr(g, -100, E.H * 0.62, E.W + 200, 40, 20); g.fillStyle = shade('#5a4a78', -0.15); g.fill();   // sofa arm
  rr(g, -200, E.H * 0.44, E.W * 0.62, 200, 100); g.fillStyle = '#3f9a4a'; g.fill(); g.fillStyle = shade('#3f9a4a', -0.2); g.fillRect(E.W * 0.36, E.H * 0.44, 60, 200);   // green sleeve
  rr(g, E.W * 0.38, E.H * 0.47, 380, 150, 70); g.fillStyle = S().ink; g.fill(); for (let i = 0; i < 4; i++) { rr(g, E.W * 0.38 + 330, E.H * 0.47 + 10 + i * 34, 120, 30, 15); g.fill(); }   // hand
  const bpm = t < t40 ? lerp(58, 42, ease.inOut(prog(t, 0.2, t40))) : 41;
  smartwatch(g, E.W * 0.47, E.H * 0.54, 1.1, bpm, t, { gold: t >= t40, rot: -0.05 });
  if (t >= t40) { const p = Math.exp(-(t - t40) * 4); glow(g, E.W * 0.47, E.H * 0.54, 300, S().ui.gold, 0.35 * p); }
  g.fillStyle = '#2a2230'; g.beginPath(); g.ellipse(E.W * 0.95, E.H * 0.95, 140, 80, -0.4, 0, 7); g.fill(); for (let i = 0; i < 3; i++) circle(g, E.W * 0.9 + i * 44, E.H * 0.86 - (i % 2) * 10, 22, '#2a2230');   // Biscuit's paw
  g.restore();
  atmos(g, t, { z: 1 }, { color: '#fff4dc', far: 10, near: 3 });
  chip(g, t, { str: 'ATHLETE ~40', at: t40 + 0.2, x: E.W * 0.76, y: E.H * 0.2 });
} });

// s101 — FIG 15 HEART: "A trained heart pumps more blood per beat, so it beats less often."  bigger pulse fills a gold cup; the metronome swings slower
registerShot('s101', { draw(g, t, info) {
  const st = info.shot.start, tMore = shotWord('more', st, 1.33), tLess = shotWord('less', st, 3.11), U = S().ui;
  board(g, t, { title: 'FIG 15 - A TRAINED HEART', fig: 'MORE PER BEAT, FEWER BEATS' });
  const fit = ease.inOut(prog(t, tMore - 0.2, tMore + 0.8)), bpm = lerp(70, 45, ease.inOut(prog(t, tLess - 0.3, tLess + 0.6)));
  push(g, t, info.dur, () => {
    const H = heart(g, t, { x: E.W * 0.3, y: E.H * 0.55, r: 210, k: ease.out(prog(t, 0.05, 1.1)), bpm, stroke: fit });
    // gold measuring cup filling per beat
    const cx = E.W * 0.58, cy = E.H * 0.72, ph = (t * bpm / 60) % 1, lvl = (0.35 + 0.45 * fit) * (0.8 + 0.2 * Math.exp(-ph * 6));
    g.strokeStyle = U.blueprint; g.lineWidth = 4; g.beginPath(); g.moveTo(cx - 80, cy - 200); g.lineTo(cx - 64, cy); g.lineTo(cx + 64, cy); g.lineTo(cx + 80, cy - 200); g.stroke();
    g.fillStyle = alpha(U.gold, 0.85); g.beginPath(); const ly = cy - 200 * lvl; g.moveTo(cx - 64 - 16 * lvl, ly); g.lineTo(cx - 64, cy); g.lineTo(cx + 64, cy); g.lineTo(cx + 64 + 16 * lvl, ly); g.closePath(); g.fill();
    for (let i = 1; i < 4; i++) seg(g, [[cx + 50, cy - i * 50], [cx + 76, cy - i * 50]], 2, alpha(U.cream, 0.7));
    if (H?.out) seg(g, [H.out, [cx, cy - 220]], 3, alpha(U.accent, 0.6));
    label(g, t, { at: [cx, cy - 200 * lvl], to: [cx + 40, E.H * 0.3], str: 'PER BEAT +', start: tMore + 0.2 });
    // metronome: the swing slows on 'less often'
    const mx = E.W * 0.82, my = E.H * 0.78, per = 60 / bpm * 2, sw = Math.sin(t * Math.PI * 2 / per) * 0.5;
    poly(g, [[mx - 90, my], [mx + 90, my], [mx + 36, my - 320], [mx - 36, my - 320]], alpha(U.blueprint, 0.25)); g.strokeStyle = U.blueprint; g.lineWidth = 3; g.stroke();
    g.save(); g.translate(mx, my - 40); g.rotate(sw); seg(g, [[0, 0], [0, -280]], 5, U.cream); rr(g, -22, -200, 44, 34, 6); g.fillStyle = U.gold; g.fill(); g.restore();
    const lk = ease.out(prog(t, tLess, tLess + 0.4)); if (lk > 0) text(g, 'less often', mx, my + 50, { size: 34, color: U.gold, font: FONTS.ui, weight: 900, alpha: lk });
  });
  air(g, t);
} });

// s102 — "But people improve by different amounts."  three-shot after a winter lap: HERO barely puffed, DEV bent over gasping, MINA in between; three gold bars
const BENT = { head: [40, -150], sh: [24, -130], hip: [0, -104], eF: [34, -100], hF: [30, -62], eB: [22, -96], hB: [18, -60], kF: [12, -52], fF: [8, 0], kB: [-8, -52], fB: [-14, 0] };
registerShot('s102', { draw(g, t, info) {
  const st = info.shot.start, tDiff = shotWord('different', st, 1.43);
  const cam = camMove(t, info.dur, { z: [1.12, 1.16], x: [-60, 0], y: [-30, -30] });
  const P = park(g, t, cam, { season: 'winter', mood: 'day', snow: 0.5, km: 10 }), GY = P.GY, CX = P.CX;
  const who = [['HERO', CX - 420, 1.9, idle(POSES.relaxed, t, 2), 'smile', 1.0, 0.4], ['MINA', CX - 40, 2.05, idle({ ...POSES.relaxed, head: [10, -196] }, t * 1.4, 3), 'happy', 0.6, 1.0], ['DEV', CX + 360, 1.9, idle(BENT, t * 2.2, 4), 'scared', 0.25, 1.8]];
  layer(g, cam, 1, (g) => who.forEach(([w, x, s, pose, ex, lvl, puff], i) => {
    const o = { x, y: GY + 20, s, facing: i === 2 ? -1 : 1, pose };
    actor(g, w, { ...o, t, rim: P.rim, expr: exprAt(t, [[0, i === 2 ? 'worried' : 'neutral'], [tDiff - 0.2 + i * 0.1, ex]]), blink: blinkFlag(t, 2.9 + i * 0.4, i), look: lookToward(i === 2 ? -1 : 1, i === 2 ? 0.5 : 0) });
    const [hx, hy, hr] = headPos(o); breathPuff(g, t + i, [hx + (i === 2 ? -1 : 1) * hr, hy + hr * 0.4], { rate: puff, facing: i === 2 ? -1 : 1, s: 0.8 + 0.4 * (i === 2), cold: true });
    const k = ease.outBack(prog(t, tDiff + i * 0.15, tDiff + 0.6 + i * 0.15)); if (k > 0) fitBar(g, hx, hy - hr * 2.2, 260 * lvl, k, { w: 40, color: S().ui.gold });
  }));
  parkFg(g, t, cam, { season: 'winter', snow: 0.5 }); atmos(g, t, cam, { color: '#f4f8ff', far: 12, near: 4 });
} });

// FIG 16 grid of tiny people (shared by s103 and s105): 6 rows x 14
const GRID = { cols: 12, rows: 4, x0: E.W * 0.15, y0: E.H * 0.34, dx: E.W * 0.063, dy: E.H * 0.15 };
function grid(g, t, k, o = {}) {
  const U = S().ui, r = rng(77), n = GRID.cols * GRID.rows;
  for (let i = 0; i < n; i++) { const c = i % GRID.cols, rw = Math.floor(i / GRID.cols), x = GRID.x0 + c * GRID.dx, y = GRID.y0 + rw * GRID.dy + 60, resp = r(), kk = clamp(k * n * 0.12 - i * 0.12);
    if (kk <= 0) continue;
    UI.lineFigure(g, { x, y, s: 0.5 * ease.outBack(kk), pose: POSES.stand, color: alpha(U.blueprint, 0.95) });
    if (o.bars) { const big = resp > 0.62, low = resp < 0.25, h = big ? lerp(20, 70 + resp * 40, o.huge) : low ? 8 : lerp(14, 30 + resp * 20, (o.huge + o.barely) / 2); fitBar(g, x, y - 132, 70, h / 70, { w: 14, color: big ? U.gold : alpha(U.cream, 0.75) }); if (big && o.huge > 0.5 && (i % 5 === 0)) FX.sparkle(g, x, y - 132 - h, 8 * Math.sin((t * 2 + i) % Math.PI), U.gold, 0.9); } }
}
// s103 — FIG 16: "In one big study, over seven hundred inactive adults"  the grid fills row by row; gold 700+; INACTIVE ADULTS
registerShot('s103', { draw(g, t, info) {
  const st = info.shot.start, tBig = shotWord('big', st, 0.63), t700 = shotWord('seven', st, 1.77), tIn = shotWord('inactive', st, 2.39);
  board(g, t, { title: 'FIG 16 - ONE BIG STUDY', fig: 'SAME PROGRAM, EVERYONE' });
  push(g, t, info.dur, () => {
    grid(g, t, prog(t, tBig - 0.3, tBig + 1.2));
    pop(g, t, t700, E.W * 0.5, E.H * 0.22, '700+', 96);
    label(g, t, { at: [GRID.x0 + GRID.dx * 10, GRID.y0 + GRID.dy * 2], to: [E.W * 0.78, E.H * 0.22], str: 'INACTIVE ADULTS', start: tIn, size: 38 });
  });
  air(g, t);
} });

// s104 — "did the same twenty-week program."  spring park: a crowd of beginner joggers sets off under a gold 20 WEEKS banner; HERO among them
registerShot('s104', { draw(g, t, info) {
  const st = info.shot.start, t20 = shotWord('twenty', st, 0.81), go = 0.5;
  const cam = camMove(t, info.dur, { z: [0.86, 0.88], x: [-160, 120], y: [-140, -140] });
  const P = park(g, t, cam, { season: 'spring', mood: 'day', km: 1 }), GY = P.GY, CX = P.CX, U = S().ui;
  layer(g, cam, 1, (g) => {
    const bx = CX - 260; for (const px of [bx - 420, bx + 420]) { g.fillStyle = '#5a4a3a'; g.fillRect(px - 8, GY - 520, 16, 520); }
    const bk = ease.outBack(prog(t, t20, t20 + 0.4)); g.fillStyle = '#16233e'; rr(g, bx - 400, GY - 520, 800, 120, 14); g.fill(); g.strokeStyle = U.gold; g.lineWidth = 5; g.stroke();
    if (bk > 0.02) { g.save(); g.translate(bx, GY - 460); g.scale(bk, bk); text(g, '20 WEEKS', 0, 0, { size: 76, color: U.gold, font: FONTS.ui, weight: 900, spacing: 4, glow: 12, glowColor: alpha(U.gold, 0.5) }); g.restore(); }
    const run = (t0x, i, s, who) => { const x = t0x + Math.max(0, t - go - (i % 3) * 0.08) * (220 + (i % 4) * 20); return [x, s, who]; };
    const crowd = [...EXTRAS.map((ex, i) => run(bx - 640 + (i % 4) * 200 - Math.floor(i / 4) * 110, i, 1.6 + (i % 3) * 0.05, ex)), run(bx + 60, 9, 1.7, 'HERO')].sort((a, b) => a[1] - b[1]);
    crowd.forEach(([x, s, who], i) => { const moving = t > go; actor(g, who, { x, y: GY + 10 + (who === 'HERO' ? 40 : (i % 2) * 30), s, facing: 1, pose: moving ? jogPose(x, s) : idle(POSES.ready, t, i), t, rim: P.rim, expr: who === 'HERO' ? exprAt(t, [[0, 'determined'], [t20, 'smile']]) : exprAt(t, [[0, 'nervous'], [go + 0.2, i % 2 ? 'determined' : 'worried']]), blink: blinkFlag(t, 3 + (i % 4) * 0.3, i), look: lookToward(1, 0) }); });
  });
  parkFg(g, t, cam, { season: 'spring' }); atmos(g, t, cam, { color: '#fff4dc', far: 12, near: 4 });
} });

// s105 — FIG 16: "Some boosted their fitness hugely. Some barely changed."  bars grow: some shoot UP (HUGE), others stay stubby (BARELY); a bell curve draws over
registerShot('s105', { draw(g, t, info) {
  const st = info.shot.start, tHuge = shotWord('hugely', st, 1.23), tBare = shotWord('barely', st, 2.67), U = S().ui;
  board(g, t, { title: 'FIG 16 - ONE BIG STUDY', fig: 'SAME PROGRAM, DIFFERENT RESULTS' });
  push(g, t, info.dur, () => {
    const huge = ease.outBack(prog(t, tHuge - 0.2, tHuge + 0.5)), barely = prog(t, tBare - 0.2, tBare + 0.4);
    grid(g, t, 1, { bars: true, huge, barely });
    const ck = ease.inOut(prog(t, 0.3, 1.8)); if (ck > 0) { g.strokeStyle = alpha(U.cream, 0.8); g.lineWidth = 4; g.beginPath(); for (let i = 0; i <= 60 * ck; i++) { const u = i / 60, x = lerp(E.W * 0.12, E.W * 0.86, u), y = E.H * 0.26 - Math.exp(-((u - 0.5) ** 2) / 0.03) * 110; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
    label(g, t, { at: [GRID.x0 + GRID.dx * 11, GRID.y0 + 20], to: [E.W * 0.84, E.H * 0.18], str: 'HUGE', start: tHuge, size: 44 });
    label(g, t, { at: [GRID.x0 + GRID.dx * 2, GRID.y0 + GRID.dy * 3 + 20], to: [E.W * 0.12, E.H * 0.18], str: 'BARELY', start: tBare, size: 44 });
  });
  air(g, t);
} });

// s106 — GIANT FACE HERO, proud: "You're a good responder."  neutral -> determined -> smirk; GOOD RESPONDER chip + star sparkle
registerShot('s106', { draw(g, t, info) {
  const st = info.shot.start, tGood = shotWord('good', st, 0.43), cam = camMove(t, info.dur, { z: [1.0, 1.06] });
  blurLayer(g, 16, (g) => apartment(g, t, { z: 1.4, x: -60, y: 40 }, { mood: 'day', power: 1 }), null, 1); veil(g, '#1a1020', 0.2);
  const cx = E.W * 0.5, cy = E.H * 0.56, r = 330;
  g.save(); g.translate(cx, cy); g.scale(cam.z, cam.z); g.translate(-cx, -cy);
  glow(g, E.W * 0.15, E.H * 0.2, 800, '#fff1d6', 0.25);
  heroFace(g, cx, cy, r, { f: faceAt(t, [[0, 'neutral'], [tGood, 'determined'], [tGood + 0.8, 'smirk']], 0.15), rimSide: -1, rimColor: '#ffe0b0', glint: '#ffe8c0', blink: blinkAmt(t, 3.3, 5), breath: Math.sin(t * 1.4), tilt: lerp(0, -0.04, ease.inOut(t / info.dur)), t });
  g.restore();
  const sp = prog(t, tGood, tGood + 0.9); if (sp > 0) for (let i = 0; i < 4; i++) FX.sparkle(g, E.W * 0.5 + (i - 1.5) * 260, E.H * 0.14 + Math.sin(i * 2) * 30, 22 * Math.sin(clamp(sp * 1.3 - i * 0.1) * Math.PI), S().ui.gold, 0.95);
  atmos(g, t, { z: 1 }, { color: '#fff4dc', far: 10, near: 3 });
  chip(g, t, { str: '★ GOOD RESPONDER', at: tGood, y: E.H * 0.88 });
} });

// s107 — BISCUIT GAG: "Biscuit, who has trained for zero days, is not."  loafing on the cushion; a flat '0 DAYS' bar; on 'not' she rolls onto her back, offended
registerShot('s107', { draw(g, t, info) {
  const st = info.shot.start, tZero = shotWord('zero', st, 1.25), tNot = shotWord('not', st, 2.21), U = S().ui;
  const cam = camMove(t, info.dur, { z: [2.2, 2.3], x: [-60, -40], y: [200, 204] });
  const A = apartment(g, t, cam, { mood: 'day', power: 1 }), GY = A.GY, sx = A.pos.sofaX, seat = GY - 112;
  layer(g, cam, 1, (g) => {
    const roll = ease.inOut(prog(t, tNot, tNot + 0.5));                                   // she flops over a little onto her side, offended slow blink
    cat(g, { x: sx + 40 - 20 * roll, y: seat + 30 - 10 * roll, s: 2.2, facing: 1, pose: 'loaf', tilt: -0.3 * roll, eyes: t > tNot + 0.6 ? (Math.sin(t * 2) > 0.4 ? 'blink' : 'offended') : t > tZero ? 'offended' : 'auto', t, rim: A.rim });
    const k = ease.out(prog(t, tZero - 0.2, tZero + 0.3)); if (k > 0) { g.save(); g.globalAlpha *= k; rr(g, sx - 120, seat - 120, 320, 34, 17); g.strokeStyle = U.blueprint; g.lineWidth = 3; g.stroke(); rr(g, sx - 116, seat - 116, 8, 26, 4); g.fillStyle = U.gold; g.fill();
      text(g, '0 DAYS', sx + 40, seat - 162, { size: 46, color: U.gold, font: FONTS.ui, weight: 900, stroke: 8, strokeColor: '#140f18', glow: 10, glowColor: alpha(U.gold, 0.5) }); text(g, 'FITNESS', sx - 134, seat - 102, { size: 22, color: U.cream, font: FONTS.ui, weight: 900, spacing: 3, align: 'right' }); g.restore(); }
  });
  apartmentFg(g, t, cam); atmos(g, t, cam, { color: '#fff4dc', far: 12, near: 4 });
} });
