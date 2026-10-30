// C_s069_s074_rest.js — ep 3 batch C: strength is built in the rest; walking days in the rain.
//   s069 bp: FIG 9 - REBUILD: micro-tears appear on 'during', the strength bar dips, 'WORKOUT = DAMAGE'
//   s070 med: HERO asleep at night, Biscuit on his feet; a blueprint thought-bubble knits the fibres back thicker on 'rebuilds', the bar rises past the start on 'rest'
//   s071 bp: DAMAGE vs REPAIR lines race; on 'outruns' the damage pulls ahead and the gap shades red, 'NO REST'
//   s072 med: bedroom, rain on the window: he crosses out RUN on the routine sheet and writes WALK on 'bend'; thunder flash on 'bad'
//   s073 wide: autumn dusk rain, HERO walks under an umbrella past KM 7, gold '10 km' on 'ten'
//   s074 insert: Biscuit on the inside windowsill, rain on the glass, tiny HERO walking far below; slow offended blink on 'knew'
import { E, S, V, registerShot, layer, blurLayer, veil, ease, prog, clamp, lerp, rng, rr, seg, circle, ring, poly, glow, alpha, shade, mix, text, FONTS, linGrad } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { POSES } from '/engine/rig2d.js';
import { actor, cat } from '../sets/actors.js';
import { park, parkFg } from '../sets/park.js';
import { street } from '../sets/street.js';
import { home3, home3Fg } from '../sets/home3.js';
import { runCycle, trainee } from '../sets/train.js';
import { muscle } from '../sets/body.js';
import { board, label } from '../sets/bp.js';
import { chip } from '../sets/hud.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, lookToward, camMove, atmos } from '../sets/acting.js';
import { wt, push, goldPop, umbrella, rainWindow } from './C_lib.js';

// vertical strength bar with a dashed START line (screen space)
function strengthBar(g, x, y0, y1, v, start, o = {}) {
  const U = S().ui, top = lerp(y1, y0, clamp(v)), st = lerp(y1, y0, start);
  rr(g, x - 40, y0 - 70, 80, y1 - y0 + 100, 40); g.fillStyle = 'rgba(10,16,32,.85)'; g.fill(); g.strokeStyle = alpha(U.blueprint, 0.7); g.lineWidth = 3; g.stroke();
  text(g, o.label || 'STRENGTH', x, y0 - 100, { size: 30, color: U.cream, font: FONTS.ui, weight: 900, spacing: 3 });
  rr(g, x - 18, top, 36, y1 - top, 16); g.fillStyle = linGrad(g, 0, top, 0, y1, [o.color || U.gold, shade(o.color || U.gold, -0.4)]); g.fill();
  g.save(); g.setLineDash([10, 8]); seg(g, [[x - 50, st], [x + 50, st]], 3, U.cream); g.restore(); text(g, 'START', x - 60, st, { size: 22, color: U.cream, font: FONTS.ui, weight: 900, align: 'right' });
}

registerShot('s069', { draw(g, t, info) {
  const tStr = wt(info, 'stronger', 1.13), tDur = wt(info, 'during', 1.53);
  board(g, t, { title: 'FIG 9 - REBUILD', fig: 'WORKOUT = DAMAGE' });
  const tear = ease.out(prog(t, tDur - 0.1, tDur + 0.4));
  push(g, t, info.dur, () => {
    const M = muscle(g, t, { x: E.W * 0.42, y: E.H * 0.5, w: 900, h: 380, k: ease.out(prog(t, 0.05, 1.0)), tears: tear });
    label(g, t, { at: M.tear, to: [M.tear[0] + 140, E.H * 0.2], str: 'WORKOUT = DAMAGE', start: tDur + 0.2 });
  });
  strengthBar(g, E.W * 0.86, E.H * 0.26, E.H * 0.8, lerp(0.6, 0.42, tear) + 0.01 * Math.sin(t * 6) * tear, 0.6);
  if (t > tStr && t < tDur) { const p = ease.outBack(prog(t, tStr, tStr + 0.25)); text(g, '?', E.W * 0.86, E.H * 0.2 - 40, { size: 70 * p, color: S().ui.gold, font: FONTS.title, weight: 700 }); }
  FX.dust(g, t, { count: 14, color: '#bcd4ff', a: 0.1, seed: 31 });
} });

registerShot('s070', { draw(g, t, info) {
  const tReb = wt(info, 'rebuilds', 0.35), tRest = wt(info, 'rest', 0.99), U = S().ui;
  const cam = camMove(t, info.dur, { z: [1.2, 1.26], x: [-560, -540], y: [-20, -30] });
  const H = home3(g, t, cam, { room: 'bedroom', mood: 'night', marks: 24 }), p = H.pos;
  layer(g, cam, 1, (g) => {
    const breath = Math.sin(t * 1.6) * 0.02;
    actor(g, 'HERO', { x: p.bedX + 60, y: p.bedTop + 150, s: 1.9, facing: 1, pose: POSES.lie, rot: -Math.PI / 2 + breath, expr: 'sleepy', blink: true, look: [0, 0], rim: H.rim, t, shadow: false });
    cat(g, { x: p.bedX + 340, y: p.bedTop + 2, s: 1.6, facing: -1, pose: 'loaf', eyes: 'blink', t, rim: H.rim });
    for (let i = 0; i < 3; i++) { const u = (t * 0.5 + i / 3) % 1; text(g, 'z', p.bedX - 130 + u * 60, p.bedTop - 150 - u * 120, { size: 30 + u * 20, color: alpha('#e8ecff', 0.8 * Math.sin(u * Math.PI)), font: FONTS.title, weight: 700 }); }
  });
  home3Fg(g, t, cam, { room: 'bedroom' }); atmos(g, t, cam, { color: '#a9c4ff', far: 14, near: 4 });
  // thought bubble (blueprint) with the fibres knitting back, thicker
  const bk = ease.outBack(prog(t, 0.05, 0.4)), bx = E.W * 0.6, by = E.H * 0.33, br = 250;
  if (bk > 0.01) { for (const [dx, dy, r] of [[-260, 200, 18], [-220, 150, 28]]) circle(g, bx + dx * bk, by + dy * bk, r * bk, '#0b1324');
    g.save(); g.translate(bx, by); g.scale(bk, bk); circle(g, 0, 0, br + 8, alpha(U.blueprint, 0.6)); circle(g, 0, 0, br, '#0b1324'); g.beginPath(); g.arc(0, 0, br - 4, 0, 7); g.clip();
    g.strokeStyle = alpha(U.blueprint, 0.1); g.lineWidth = 1; for (let i = -br; i < br; i += 30) { seg(g, [[i, -br], [i, br]], 1, alpha(U.blueprint, 0.1)); seg(g, [[-br, i], [br, i]], 1, alpha(U.blueprint, 0.1)); }
    g.translate(-E.W / 2, -E.H / 2); muscle(g, t, { x: E.W / 2, y: E.H / 2 - 20, w: 380, h: 220, k: 1, tears: 1, repair: ease.inOut(prog(t, tReb, tRest + 0.4)) }); g.restore(); }
  strengthBar(g, E.W * 0.88, E.H * 0.24, E.H * 0.74, lerp(0.42, 0.74, ease.inOut(prog(t, tReb, tRest + 0.3))), 0.6);
  if (t > tRest) { const pp = ease.outBack(prog(t, tRest, tRest + 0.3)); g.save(); g.translate(E.W * 0.88, E.H * 0.86); g.scale(pp, pp); rr(g, -100, -34, 200, 68, 34); g.fillStyle = 'rgba(14,10,20,.9)'; g.fill(); g.strokeStyle = U.gold; g.lineWidth = 3; g.stroke(); text(g, 'REPAIR', 0, 2, { size: 40, color: U.gold, font: FONTS.ui, weight: 900 }); g.restore(); }
} });

registerShot('s071', { draw(g, t, info) {
  const tOut = wt(info, 'outruns', 1.33), U = S().ui;
  board(g, t, { title: 'FIG 9 - REBUILD', fig: 'SKIP THE REST' });
  push(g, t, info.dur, () => {
    const x0 = E.W * 0.14, x1 = E.W * 0.86, y1 = E.H * 0.78, h = E.H * 0.5, k = ease.inOut(prog(t, 0.05, info.dur - 0.3)), N = 60;
    seg(g, [[x0, y1 - h - 20], [x0, y1], [x1 + 20, y1]], 4, U.cream);
    text(g, 'TIME  (NO REST DAYS)', x1 - 10, y1 + 40, { size: 28, color: U.cream, font: FONTS.ui, weight: 900, align: 'right', spacing: 2 });
    const dmg = (u) => y1 - h * (u * 0.5 + Math.max(0, u - tOut / info.dur * 0.9) * 0.9), rep = (u) => y1 - h * (u * 0.5 + 0.02 * Math.sin(u * 30));
    const D = [], R = []; for (let i = 0; i <= N; i++) { const u = i / N * k; D.push([lerp(x0, x1, u), dmg(u)]); R.push([lerp(x0, x1, u), rep(u)]); }
    // the gap shades red where damage runs ahead
    g.save(); g.beginPath(); D.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); for (let i = R.length - 1; i >= 0; i--) g.lineTo(R[i][0], R[i][1]); g.closePath(); g.fillStyle = alpha(U.accent, 0.28); g.fill(); g.restore();
    seg(g, R, 7, U.cream); seg(g, D, 7, U.accent);
    const [dx, dy] = D[D.length - 1], [rx, ry] = R[R.length - 1]; circle(g, dx, dy, 12, U.accent); circle(g, rx, ry, 12, U.cream);
    text(g, 'DAMAGE', dx + 20, dy - 20, { size: 32, color: U.accent, font: FONTS.ui, weight: 900, align: 'left', spacing: 2 }); text(g, 'REPAIR', rx + 20, ry + 30, { size: 32, color: U.cream, font: FONTS.ui, weight: 900, align: 'left', spacing: 2 });
    label(g, t, { at: [lerp(dx, x0, 0.2), (dmg(k * 0.8) + rep(k * 0.8)) / 2], to: [E.W * 0.42, E.H * 0.26], str: 'NO REST', start: tOut + 0.15 });
  });
  FX.dust(g, t, { count: 14, color: '#bcd4ff', a: 0.1, seed: 31 });
} });

registerShot('s072', { draw(g, t, info) {
  const tBend = wt(info, 'bend', 0.49), tBad = wt(info, 'bad', 1.99), U = S().ui;
  const cam = camMove(t, info.dur, { z: [1.25, 1.3], x: [-300, -280], y: [-140, -150] });
  const H = home3(g, t, cam, { room: 'bedroom', mood: 'dusk', marks: 26 }), p = H.pos, CX = H.CX, GY = H.GY;
  // rain on the window + a thunder flash on 'bad'
  const fl = Math.max(0, Math.exp(-(t - tBad - 0.1) * 6) * (t > tBad + 0.1 ? 1 : 0));
  layer(g, cam, 0.55, (g) => { rainWindow(g, t, CX - 860, GY - 820, 440, 320, 1); if (fl > 0) { g.fillStyle = alpha('#e8f0ff', 0.6 * fl); g.fillRect(CX - 860, GY - 820, 440, 320); } });
  if (fl > 0) veil(g, '#c8d8ff', 0.12 * fl, 'lighter');
  // the routine sheet taped to the wall by the window (character plane), RUN 10 KM crossed out, WALK written on 'bend'
  const sx = CX - 330, sy = GY - 560, w = 300, h = 360;
  layer(g, cam, 1, (g) => {
    g.save(); g.translate(sx, sy); g.rotate(-0.02); rr(g, -w / 2, 0, w, h, 6); g.fillStyle = '#fbf6ea'; g.fill(); seg(g, [[-30, -6], [30, -6]], 14, alpha('#e8e0c0', 0.8));
    text(g, 'ROUTINE', 0, 40, { size: 34, color: '#d4262e', font: FONTS.title, weight: 700 }); ['100 PUSH-UPS', '100 SIT-UPS', '100 SQUATS', 'RUN 10 KM'].forEach((l, i) => text(g, l, -w / 2 + 24, 100 + i * 60, { size: 28, color: '#1a1420', font: FONTS.ui, weight: 900, align: 'left' }));
    const ck = ease.out(prog(t, tBend - 0.15, tBend + 0.2)); if (ck > 0) seg(g, [[-w / 2 + 20, 280], [-w / 2 + 20 + 170 * ck, 280]], 6, '#d4262e');
    const wk = ease.out(prog(t, tBend + 0.15, tBend + 0.7)); if (wk > 0) { g.save(); g.beginPath(); g.rect(-w / 2, 296, w * wk, 60); g.clip(); text(g, 'WALK', 10, 326, { size: 44, color: '#2f6fd0', font: FONTS.title, weight: 700, align: 'left' }); g.restore(); }
    g.restore();
    const writing = t > tBend - 0.3 && t < tBend + 0.9, hand = writing ? { ...POSES.stand, eF: [30, -170], hF: [56, -200] } : POSES.relaxed;
    const o = { x: sx - 160, y: GY + 20, s: 1.9, facing: 1, pose: idle(hand, t, 2), expr: exprAt(t, [[0, 'worried'], [tBend, 'determined']]), blink: blinkFlag(t, 3.2, 2), look: lookToward(1, -0.3), rim: H.rim, t };
    actor(g, 'HERO', o);
    if (writing) { const mx = o.x + 56 * 1.9 + Math.sin(t * 20) * 4, my = o.y - 200 * 1.9; seg(g, [[mx, my], [mx + 16, my - 46]], 12, '#2f6fd0'); seg(g, [[mx, my], [mx - 4, my + 8]], 6, '#1a1420'); }
  });
  home3Fg(g, t, cam, { room: 'bedroom' }); atmos(g, t, cam, { color: '#c9d4ff', far: 14, near: 4 });
} });

registerShot('s073', { draw(g, t, info) {
  const tTen = wt(info, 'ten', 0.75), CX = E.W / 2, s = 1.75, hx = CX + 120 + 150 * t;
  const cam = { z: 0.92, x: hx - CX - 60 + Math.sin(t * 0.6) * 6, y: -110 };
  const P = park(g, t, cam, { season: 'autumn', mood: 'dusk', rain: 0.8, km: 7 });
  layer(g, cam, 1, (g) => {
    const R = runCycle(t, 0, { mode: 'walk', x: hx, s, facing: 1 }), pose = { ...R.pose, eF: [18, -150], hF: [30, -190] };
    trainee(g, 'HERO', { pose, shadow: [0, 40] }, { x: hx, y: P.GY + 20, s, facing: 1, t, rim: P.rim, blink: blinkFlag(t, 3.3, 2), look: lookToward(1, 0.1), expr: exprAt(t, [[0, 'neutral'], [tTen, 'smile']]) });
    umbrella(g, hx + 30 * s, P.GY + 20 - 190 * s, 1.5, t);
  });
  parkFg(g, t, cam, { season: 'autumn', rain: 0.8 }); atmos(g, t, cam, { color: P.M.key });
  chip(g, t, { str: '10 km', at: tTen, x: E.W * 0.66, y: E.H * 0.2 });
} });

registerShot('s074', { draw(g, t, info) {
  const tKnew = wt(info, 'knew', 2.45), tWin = wt(info, 'window', 1.21);
  const cam = camMove(t, info.dur, { z: [1.12, 1.18], x: [-20, 20] }), z = cam.z;
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2 - cam.x, -E.H / 2);
  // warm room wall around a big window; outside: a rainy dusk street with tiny HERO walking far below
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#5a4a6a', '#3a2e48']); g.fillRect(-200, -100, E.W + 400, E.H + 200);
  const wx = E.W * 0.36, wy = E.H * 0.08, ww = E.W * 0.56, wh = E.H * 0.66;
  g.save(); g.beginPath(); g.rect(wx, wy, ww, wh); g.clip(); g.translate(wx, wy); g.scale(ww / E.W, wh / E.H);
  const St = street(g, t, { z: 0.7, x: 0, y: -260 }, { mood: 'dusk', power: 1, rain: true });
  layer(g, { z: 0.7, x: 0, y: -260 }, 1, (g) => { const hx = E.W * 0.5 + t * 70; actor(g, 'HERO', { x: hx, y: St.GY + 20, s: 1.0, facing: 1, pose: runCycle(t, 0, { mode: 'walk', x: hx, s: 1.0 }).pose, expr: 'neutral', t, rim: St.rim }); umbrella(g, hx + 20, St.GY + 20 - 190, 0.9, t); });
  g.restore();
  rainWindow(g, t, wx, wy, ww, wh, 1.2);
  g.strokeStyle = '#2a1e2a'; g.lineWidth = 26; g.strokeRect(wx, wy, ww, wh); seg(g, [[wx + ww / 2, wy], [wx + ww / 2, wy + wh]], 16, '#2a1e2a'); seg(g, [[wx, wy + wh * 0.45], [wx + ww, wy + wh * 0.45]], 16, '#2a1e2a');
  rr(g, wx - 60, wy + wh, ww + 120, 46, 8); g.fillStyle = '#e8dcc8'; g.fill(); g.fillStyle = shade('#e8dcc8', -0.3); g.fillRect(wx - 60, wy + wh + 40, ww + 120, 14);   // windowsill
  // warm lamp on the left (key), a plant on the sill
  glow(g, E.W * 0.12, E.H * 0.3, 520, '#ffcf8f', 0.45); seg(g, [[E.W * 0.12, E.H * 0.3], [E.W * 0.12, E.H * 0.95]], 8, '#2a2030'); poly(g, [[E.W * 0.12 - 90, E.H * 0.3], [E.W * 0.12 + 90, E.H * 0.3], [E.W * 0.12 + 60, E.H * 0.18], [E.W * 0.12 - 60, E.H * 0.18]], '#f2d8a8');
  rr(g, wx + ww - 150, wy + wh - 70, 90, 74, 10); g.fillStyle = '#c86a4a'; g.fill(); for (let i = 0; i < 5; i++) { g.fillStyle = '#4a8a4a'; g.beginPath(); g.ellipse(wx + ww - 105 + (i - 2) * 22, wy + wh - 110 - (i % 2) * 20, 16, 44, (i - 2) * 0.3, 0, 7); g.fill(); }
  // Biscuit on the sill, watching; the slow offended blink + tail flick on 'knew'
  const eyes = t > tKnew && t < tKnew + 0.5 ? 'blink' : t > tKnew + 0.5 ? 'offended' : t > tWin ? 'auto' : 'auto';
  cat(g, { x: wx + ww * 0.14, y: wy + wh + 4, s: 2.2, facing: 1, pose: 'sit', eyes, t, rim: { color: '#ffcf8f', dir: [-1, -0.3] } });
  g.restore();
  atmos(g, t, cam, { color: '#ffd8b0', far: 12, near: 4 });
} });
