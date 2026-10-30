// C_s052_s057_air.js — batch C: Rule 3 and terminal velocity.
//   s052 rule: RULE 3 "AIR FIGHTS BACK." over a dimmed bright sky with streaming cloud wisps; wind lines streak across the banner on 'air'
//   s053 med: skydive fall, belly-down in the bright blue sky, clouds below, speed lines, cirrus racing past
//   s054 insert: TERMINAL VELOCITY gauge big lower-right pins at ~200 km/h on 'two hundred', the hero falling behind it
//   s055 bp: FIG 3 - TERMINAL VELOCITY: line-art faller, GRAVITY down, DRAG grows up until they balance on 'velocity'; speed curve flattens at ~200 km/h
//   s056 med: three landings in a row on the same street spot (DAY 10 / 11 / 12), identical crater, the IMPACT bar maxes at the same mark on 'same'
//   s057 graphic: blueprint crash test: a dummy in a little car hits the wall on 'crash' (head bobbles), chip 'highway speed', then three replays pop on 'Every single time'
import { E, S, V, registerShot, layer, blurLayer, ease, prog, clamp, lerp, rng, rr, seg, circle, ring, poly, glow, alpha, shade, text, FONTS, linGrad, veil } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { POSES } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { stratosphere, skyFg } from '../sets/sky.js';
import { street, streetFg } from '../sets/street.js';
import { ruleCard, chip } from '../sets/hud.js';
import { board, draw, label } from '../sets/bp.js';
import { blinkFlag, exprAt, poseAt, idle, lookToward, camMove, atmos } from '../sets/acting.js';
import { JPOSE, jumpPose, jumper, jumpFX, jumpStreaks, impactFrame, jumpShake } from '../sets/jump.js';
import { gauge } from '../sets/devices.js';
import { wt, TEE, dayC, meter } from './C_lib.js';

registerShot('s052', { draw(g, t, info) {
  const tAir = wt(info, 'air', 2.75), cam = camMove(t, info.dur, { z: [1.0, 1.04], x: [-20, 20] });
  ruleCard(g, t, info, { n: 3, title: 'AIR FIGHTS BACK.', bg: (g, t) => {
    stratosphere(g, t, cam, { alt: 0.02 });
    layer(g, cam, 0.6, (g) => { const r = rng(5); for (let i = 0; i < 9; i++) { const x = ((r() * E.W * 2 + t * (420 + r() * 300)) % (E.W * 2.6)) - E.W * 0.8, y = r() * E.H; g.fillStyle = alpha('#ffffff', 0.25 + 0.2 * r()); g.beginPath(); g.ellipse(x, y, 320 + r() * 200, 26 + r() * 20, -0.06, 0, 7); g.fill(); } });
  } });
  // wind lines whip across the banner on 'air'
  const w = prog(t, tAir - 0.1, tAir + 1.2); if (w > 0 && w < 1) { const by = E.H * V(0.445, 0.36) + V(300, 360), r = rng(9); g.save(); g.lineCap = 'round';
    for (let i = 0; i < 14; i++) { const d = r() * 0.35, u = clamp((w - d) / 0.6), x = lerp(-300, E.W + 300, ease.inOut(u)), y = by + (r() - 0.5) * 170, L = 160 + r() * 260; if (u <= 0 || u >= 1) continue;
      g.strokeStyle = alpha('#ffffff', 0.75 * Math.sin(u * Math.PI)); g.lineWidth = 3 + r() * 4; g.beginPath(); g.moveTo(x - L, y); g.quadraticCurveTo(x - L * 0.4, y - 16 * Math.sin(u * 9 + i), x, y); g.stroke();
      if (i % 4 === 0) { g.beginPath(); g.arc(x + 20, y - 24, 22, Math.PI * 0.5, Math.PI * 2.1); g.stroke(); } }
    g.restore(); }
} });

// belly-down skydiver: the star apex pose rotated face-down, with the T-shirt rippling on the back
function skydiver(g, x, y, s, t, o = {}) {
  const pose = idle({ ...JPOSE.apex, hF: [74, -230 + Math.sin(t * 9) * 6], hB: [-70, -226 + Math.sin(t * 9 + 1) * 6], fF: [36, -34 + Math.sin(t * 8) * 5], fB: [-30, -34 + Math.sin(t * 8 + 2) * 5] }, t, 2);
  actor(g, TEE, { x, y, s, facing: 1, pose, rot: o.rot ?? 1.5, expr: o.expr, blink: o.blink, look: o.look ?? [0.4, 1], rim: o.rim, t, shadow: false });
  // shirt ripple lines (along the back, which faces up)
  g.save(); g.strokeStyle = alpha(shade(TEE.color, -0.35), 0.8); g.lineWidth = 3 * s / 1.9; g.lineCap = 'round';
  for (let i = 0; i < 3; i++) { const px = x - 40 * s / 1.9 + i * 34 * s / 1.9, py = y - 150 * s / 1.9 + Math.sin(t * 22 + i) * 5; g.beginPath(); g.moveTo(px, py); g.quadraticCurveTo(px + 10, py - 10 + Math.sin(t * 30 + i) * 6, px + 22, py); g.stroke(); } g.restore();
}

registerShot('s053', { draw(g, t, info) {
  const tCant = wt(info, "can't", 1.83), tAir = wt(info, 'air', 0.69);
  const cam = camMove(t, info.dur, { z: [1.04, 1.1], x: [-40, 40], y: [-20, 20] });
  const Y = stratosphere(g, t, cam, { alt: 0.0 });
  layer(g, cam, 0.5, (g) => { FX.clouds(g, { y: E.H * 0.86, count: 10, h: 220, a: 0.75, seed: 21 }); FX.clouds(g, { y: E.H * 1.02, count: 8, h: 260, a: 0.9, seed: 22 }); });
  layer(g, cam, 0.75, (g) => { const r = rng(3); for (let i = 0; i < 6; i++) { const x = r() * E.W, y = ((r() * E.H * 2 - t * (700 + r() * 400)) % (E.H * 1.8)) + E.H * 1.2; g.fillStyle = alpha('#ffffff', 0.5); g.beginPath(); g.ellipse(x, y, 140 + r() * 120, 50 + r() * 30, 0, 0, 7); g.fill(); } });   // puffs rushing up past him
  const hx = E.W * 0.46 + Math.sin(t * 0.9) * 20, hy = E.H * 0.6 + Math.sin(t * 1.3) * 12;
  layer(g, cam, 1, (g) => {
    jumpStreaks(g, t, hx, hy - 260, { s: 2.1, dir: -1, a: 0.55, count: 22, seed: 7 });
    skydiver(g, hx, hy, 2.1, t, { expr: exprAt(t, [[0, 'scared'], [tAir, 'surprised'], [tCant, 'determined']]), blink: blinkFlag(t, 3.2, 3), rim: Y.rim, look: t < tCant ? [0.2, 1] : [0.9, 0.3] });
  });
  skyFg(g, t * 3, cam, { alt: 0 });
  atmos(g, t, cam, { color: '#ffffff', far: 14, near: 5 });
  dayC(g, t, [[0, 11]]);
} });

registerShot('s054', { draw(g, t, info) {
  const tTwo = wt(info, 'two', 0.45), tHun = wt(info, 'hundred', 0.85), tKm = wt(info, 'kilometres', 1.25);
  const cam = camMove(t, info.dur, { z: [1.0, 1.06], x: [30, -30] });
  const Y = stratosphere(g, t, cam, { alt: 0.0 });
  layer(g, cam, 0.5, (g) => FX.clouds(g, { y: E.H * 0.9, count: 10, h: 220, a: 0.75, seed: 21 }));
  const hx = E.W * 0.3, hy = E.H * 0.56 + Math.sin(t * 1.3) * 10;
  layer(g, cam, 1, (g) => {
    jumpStreaks(g, t, hx, hy - 230, { s: 1.8, dir: -1, a: 0.5, count: 20, seed: 9 });
    skydiver(g, hx, hy, 1.8, t, { rot: 1.45, expr: exprAt(t, [[0, 'determined'], [tHun + 0.2, 'shocked']]), blink: blinkFlag(t, 3.2, 3), rim: Y.rim, look: [1, 0.4] });
  });
  skyFg(g, t * 3, cam, { alt: 0 });
  // the gauge pins at ~200 on 'two hundred' (sweep ends on 'hundred'), red-zone flash + jitter
  const sw = Math.max(0.3, tHun - tTwo + 0.25);
  gauge(g, t, { preset: 'terminal', x: E.W * 0.7, y: E.H * 0.56, r: 300, at: Math.max(0.05, tTwo - 0.2), sweep: sw });
  const pin = t > tTwo - 0.2 + sw ? Math.exp(-(t - (tTwo - 0.2 + sw)) * 3) : 0; if (pin > 0.02) glow(g, E.W * 0.7, E.H * 0.56, 520, '#ff6a3a', 0.25 * pin);
  atmos(g, t, cam, { color: '#ffffff', far: 12, near: 4 });
} });

registerShot('s055', { draw(g, t, info) {
  const tTerm = wt(info, 'terminal', 1.27), tVel = wt(info, 'velocity', 1.61), U = S().ui, z = 1 + 0.035 * ease.inOut(t / info.dur);
  board(g, t, { title: 'FIG 3 - TERMINAL VELOCITY', fig: 'DRAG = GRAVITY' });
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  const k = ease.out(prog(t, 0.1, 1.2)), cx = E.W * 0.33, cy = E.H * 0.5, bob = Math.sin(t * 2) * 6;
  // line-art faller, belly-down (head right), arms and legs spread
  g.save(); g.translate(cx, cy + bob); g.scale(1.7, 1.7);
  draw(g, [[-120, 0], [70, 0]], k, { w: 6 }); g.strokeStyle = U.blueprint; g.lineWidth = 6; if (k > 0.3) { g.beginPath(); g.arc(110, -4, 34 * clamp((k - 0.3) / 0.3), 0, 7); g.stroke(); }
  draw(g, [[40, 0], [70, -70], [120, -100]], k, { w: 5 }); draw(g, [[40, 0], [70, 60], [120, 90]], k, { w: 5 });
  draw(g, [[-120, 0], [-180, -60], [-230, -70]], k, { w: 5 }); draw(g, [[-120, 0], [-180, 50], [-230, 70]], k, { w: 5 });
  g.restore();
  // GRAVITY (down, full size from the start) vs DRAG (up, grows until it matches on 'velocity')
  const gk = ease.out(prog(t, 0.3, 0.9)), dk = ease.inOut(prog(t, 0.6, tVel)), L = 300, arrow = (x, y0, len, dir, col) => { if (len < 4) return; const y1 = y0 + dir * len; seg(g, [[x, y0], [x, y1]], 12, col); poly(g, [[x - 30, y1 - dir * 6], [x + 30, y1 - dir * 6], [x, y1 + dir * 40]], col); };
  arrow(cx - 40, cy + 90 + bob, L * gk, 1, U.gold); arrow(cx - 40, cy - 90 + bob, L * dk, -1, '#9fd8ff');
  label(g, t, { at: [cx - 10, cy + 70 + L * 0.7], to: [cx + 160, cy + 330], str: 'gravity', start: 0.6 });
  label(g, t, { at: [cx - 10, cy - 70 - L * 0.7], to: [cx + 160, cy - 330], str: 'drag', start: tTerm - 0.2 });
  // speed vs time: rises, then flattens at ~200 km/h
  const gx = E.W * 0.6, gy = E.H * 0.74, gw = E.W * 0.3, gh = E.H * 0.44, ck = ease.inOut(prog(t, 0.5, tVel + 0.4));
  draw(g, [[gx, gy - gh - 20], [gx, gy], [gx + gw + 20, gy]], ease.out(prog(t, 0.2, 0.7)), { w: 4, color: U.cream });
  const pts = []; for (let i = 0; i <= 40; i++) { const u = i / 40; pts.push([gx + u * gw, gy - gh * 0.8 * (1 - Math.exp(-u * 5))]); } draw(g, pts, ck, { w: 6, color: '#9fd8ff' });
  g.save(); g.setLineDash([14, 12]); g.globalAlpha *= ck; seg(g, [[gx, gy - gh * 0.8], [gx + gw, gy - gh * 0.8]], 3, U.gold); g.restore();
  text(g, 'SPEED', gx + 10, gy - gh - 44, { size: 30, color: U.cream, font: FONTS.ui, weight: 900, align: 'left', spacing: 3 }); text(g, 'TIME', gx + gw - 30, gy + 40, { size: 30, color: U.cream, font: FONTS.ui, weight: 900, spacing: 3 });
  label(g, t, { at: [gx + gw * 0.85, gy - gh * 0.8], to: [gx + gw * 0.62, gy - gh * 1.02], str: '~200 km/h', start: tVel + 0.1 });
  g.restore();
} });

registerShot('s056', { draw(g, t, info) {
  const tSame = wt(info, 'same', 2.59), hits = [1.31, 1.83, 2.59], U = S().ui;
  // which landing is on screen: 1 (from 0), 2 (from 1.5), 3 (from 2.1); each cut opens with a white flash
  const seg2 = t < 1.5 ? 0 : t < 2.1 ? 1 : 2, tL = hits[seg2], opt = { up: 0.45, hang: 0.1, down: 0.45, landing: 'thud' }, t0 = tL - 1.0, J = jumpPose(t, t0, 900, opt), T = J.times;
  const cam = camMove(t, info.dur, { z: [1.12, 1.16], x: [-40, -20], y: [30, 30] }); const [sx, sy] = jumpShake(t, tL, 20); cam.x += sx; cam.y += sy;
  const St = street(g, t, cam, { mood: 'day', power: 0.2 }); veil(g, '#fff0d8', 0.16, 'screen');
  const hx = St.CX + 60, gy = St.GY + 30;
  layer(g, cam, 1, (g) => {
    // the crater: the same size every time
    if (t > hits[0]) { const k = ease.out(prog(t, hits[0], hits[0] + 0.1)); g.fillStyle = alpha('#2a2430', 0.55); g.beginPath(); g.ellipse(hx, gy + 4, 150 * k, 22 * k, 0, 0, 7); g.fill(); g.strokeStyle = alpha('#140f18', 0.7); g.lineWidth = 3;
      for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; g.beginPath(); g.moveTo(hx + Math.cos(a) * 110 * k, gy + 4 + Math.sin(a) * 16 * k); g.lineTo(hx + Math.cos(a) * 190 * k, gy + 4 + Math.sin(a) * 28 * k); g.stroke(); } }
    jumpFX(g, t, J, { x: hx, gy, s: 1.9, landing: 'thud', launchDust: seg2 === 0, dustColor: '#d8d4cc' });
    jumper(g, TEE, J, { x: hx, gy, s: 1.9, facing: 1, expr: exprAt(t, [[0, 'determined'], [hits[0], 'worried'], [hits[1], 'worried'], [tSame, 'sheepish']]), blink: blinkFlag(t, 3.0, 2), rim: { color: '#fff2d8', dir: [0.8, -0.6] }, t });
  });
  streetFg(g, t, cam);
  atmos(g, t, cam, { color: '#fff2d8' });
  impactFrame(g, t, tL, { x: E.W * 0.5, y: E.H * 0.8 });
  const fl = seg2 > 0 ? clamp(1 - (t - [0, 1.5, 2.1][seg2]) / 0.12) : 0; if (fl > 0) { g.fillStyle = alpha('#ffffff', 0.7 * fl); g.fillRect(0, 0, E.W, E.H); }
  // day tags pop on each landing
  ['DAY 10', 'DAY 11', 'DAY 12'].forEach((s, i) => chip(g, t, { str: s, at: hits[i], dur: i < 2 ? [1.5, 2.1][i] : 99, x: E.W * 0.5, y: E.H * 0.16 }));
  // the IMPACT bar on the left: fills to the same mark every time, the mark is labelled on 'same'
  const bx = 130, by0 = E.H * 0.24, by1 = E.H * 0.82, mark = lerp(by1, by0, 0.86), fill = t > tL ? Math.exp(-(t - tL) * 1.4) * 0.3 + 0.7 : 0, f2 = t > tL ? ease.out(clamp((t - tL) / 0.1)) : 0;
  rr(g, bx - 40, by0 - 70, 80, by1 - by0 + 110, 40); g.fillStyle = 'rgba(14,10,20,.78)'; g.fill(); g.strokeStyle = alpha(U.gold, 0.6); g.lineWidth = 3; g.stroke();
  text(g, 'IMPACT', bx + 6, by0 - 98, { size: 30, color: U.gold, font: FONTS.ui, weight: 900, spacing: 3, stroke: 6, strokeColor: '#140f18' });
  const top = lerp(by1, mark, f2 * (fill > 0 ? 1 : 0)); rr(g, bx - 16, top, 32, by1 - top, 14); g.fillStyle = linGrad(g, 0, mark, 0, by1, ['#ff5a3a', U.gold]); g.fill();
  seg(g, [[bx - 34, mark], [bx + 34, mark]], 5, '#ffffff');
  const lp = ease.outBack(prog(t, tSame, tSame + 0.3)); if (lp > 0.01) { g.save(); g.translate(bx + 70, mark); g.scale(lp, lp); rr(g, 0, -32, 180, 64, 32); g.fillStyle = 'rgba(14,10,20,.92)'; g.fill(); g.strokeStyle = U.gold; g.lineWidth = 3; g.stroke(); text(g, 'SAME', 90, 2, { size: 40, color: U.gold, font: FONTS.ui, weight: 900 }); g.restore(); }
  meter(g, t, t < hits[0] ? 128 : [256, 500, 1000][seg2], { text: ['256 m', '500 m', '1 km'][seg2] });
} });

// blueprint crash-test clip: track, a little car with a dummy, the wall. u = clip time (s). Drawn at (x, y) scale s.
function crashClip(g, u, x, y, s, U) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const hitT = 0.7, k = clamp(u / hitT), cx = lerp(-520, 200, k * k * 0.3 + k * 0.7), after = Math.max(0, u - hitT), crush = ease.out(clamp(after / 0.12));
  seg(g, [[-640, 80], [520, 80]], 4, alpha(U.blueprint, 0.8)); for (let i = -620; i < 500; i += 60) seg(g, [[i, 80], [i - 20, 100]], 2, alpha(U.blueprint, 0.5));
  g.strokeStyle = U.blueprint; g.lineWidth = 5; g.strokeRect(390, -260, 70, 340); for (let j = 0; j < 6; j++) seg(g, [[390, -260 + j * 57], [460, -260 + j * 57]], 2, alpha(U.blueprint, 0.6));      // the wall
  const ox = cx - crush * 30; g.save(); g.translate(ox, 0); const squash = 1 - 0.18 * crush;
  g.strokeStyle = U.cream; g.lineWidth = 5; g.lineJoin = 'round'; g.beginPath(); g.moveTo(-170, 40); g.lineTo(-170, -20); g.lineTo(-90, -30); g.lineTo(-40, -90); g.lineTo(80, -90); g.lineTo(140 * squash + 40 * (1 - squash), -30); g.lineTo(190 * squash, -20); g.lineTo(190 * squash, 40); g.closePath(); g.stroke();
  for (const wx of [-110, 120 * squash]) { ring(g, wx, 50, 30, 5, U.cream); circle(g, wx, 50, 6, U.cream); }
  // dummy: yellow-black target disc on the head; the head bobbles after the hit
  const bob = after > 0 ? Math.sin(after * 22) * Math.exp(-after * 3) * 0.6 : 0, lean = ease.out(clamp(after / 0.15)) * 0.5 - (after > 0.15 ? ease.inOut(clamp((after - 0.15) / 0.4)) * 0.35 : 0);
  g.save(); g.translate(-10, -30); g.rotate(lean); seg(g, [[0, 0], [10, -60]], 8, U.gold); g.translate(10, -60); g.rotate(bob); seg(g, [[0, 0], [0, -14]], 5, U.gold); circle(g, 0, -36, 26, U.gold); circle(g, 0, -36, 12, '#141018'); poly(g, [[0, -62], [26, -36], [0, -36]], '#141018'); poly(g, [[0, -10], [-26, -36], [0, -36]], '#141018'); g.restore();
  seg(g, [[0, -60 + 0], [40, -40]], 6, U.gold);
  g.restore();
  if (after > 0 && after < 0.6) { const p = ease.outBack(clamp(after / 0.12)), a = 1 - after / 0.6; g.save(); g.translate(390, -60); g.scale(p, p); g.globalAlpha *= a; const pts = []; for (let i = 0; i < 16; i++) { const r = i % 2 ? 60 : 130, an = i / 16 * Math.PI * 2; pts.push([Math.cos(an) * r, Math.sin(an) * r]); } poly(g, pts, U.gold); text(g, 'BANG', 0, 4, { size: 44, color: '#141018', font: FONTS.title, weight: 700 }); g.restore(); }
  g.restore();
}

registerShot('s057', { draw(g, t, info) {
  const tCrash = wt(info, 'crash', 0.85), tHw = wt(info, 'highway', 1.45), U = S().ui;
  const tE = wt(info, 'Every', 2.37), tS = wt(info, 'single', 3.01), tT = wt(info, 'time', 3.39), z = 1 + 0.03 * ease.inOut(t / info.dur);
  board(g, t, { title: 'CRASH TEST', fig: 'SAME HIT. EVERY TIME.' });
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  // the main clip shrinks up to make room for the three replays
  const shrink = ease.inOut(prog(t, tE - 0.35, tE + 0.1)), ms = lerp(1.45, 0.85, shrink), my = lerp(E.H * 0.54, E.H * 0.37, shrink);
  const cs = Math.max(0, (t - (tCrash - 0.7))); crashClip(g, cs, E.W * 0.5, my, ms, U);
  if (t > tCrash) { const sh = Math.exp(-(t - tCrash) * 8) * 10; g.translate(Math.sin(t * 70) * sh, 0); }
  chip(g, t, { str: 'highway speed', at: tHw, dur: tE - 0.2, x: E.W * 0.5, y: E.H * 0.84 });
  [tE, tS, tT].forEach((tp, i) => { const p = ease.outBack(prog(t, tp, tp + 0.3)); if (p <= 0.01) return; const px = E.W * (0.2 + i * 0.3), py = E.H * 0.76;
    g.save(); g.translate(px, py); g.scale(p, p); rr(g, -250, -130, 500, 260, 18); g.fillStyle = alpha(U.bpBg || '#0b2a4a', 0.95); g.fill(); g.strokeStyle = alpha(U.gold, 0.9); g.lineWidth = 4; g.stroke();
    g.save(); rr(g, -246, -126, 492, 252, 16); g.clip(); crashClip(g, ((t - tp) * 1.3) % 1.6, 0, 50, 0.36, U); g.restore();
    text(g, `#${i + 1}`, -210, -96, { size: 36, color: U.gold, font: FONTS.ui, weight: 900, align: 'left' }); g.restore(); });
  g.restore();
} });
