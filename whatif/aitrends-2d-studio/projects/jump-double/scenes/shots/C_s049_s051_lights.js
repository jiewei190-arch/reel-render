// C_s049_s051_lights.js — batch C: day 11 at the crossroads, timing the jumps with the traffic lights.
//   s049 wide: daytime junction, LOCAL traffic light, DAY 10 -> 11, meter 500 m on 'Five'; HERO in a sprinter's crouch at the kerb among pedestrians
//   s050 insert: split frame: a tiny HERO dot rises and falls past the traffic-light pole | a gold stopwatch 0 -> 10 s UP, 10 -> 0 DOWN
//   s051 med: RED on 'start', HERO launches straight up, pedestrians cross under; GREEN on 'lights', he lands on the zebra, thumbs up
import { E, S, registerShot, layer, blurLayer, ease, prog, clamp, lerp, rng, rr, seg, circle, ring, poly, glow, alpha, shade, mix, text, FONTS, linGrad, veil } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { POSES } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { VOLUNTEER } from '../cast.js';
import { street, streetFg } from '../sets/street.js';
import { blinkFlag, exprAt, poseAt, idle, reaction, lookToward, walkAlong, camMove, atmos } from '../sets/acting.js';
import { jumpPose, jumper, jumpFX, impactFrame, jumpCam } from '../sets/jump.js';
import { wt, TEE, dayC, meter, PEDS, trafficLight } from './C_lib.js';

const ped = (i, head) => ({ ...VOLUNTEER, color: PEDS[i % PEDS.length], head: head || ['cap', 'none', 'bun', 'beanie'][i % 4], headColor: shade(PEDS[(i + 2) % PEDS.length], -0.1) });
const RIM = { color: '#fff2d8', dir: [0.8, -0.6] };

// zebra crossing on the road band + a stop line
function zebra(g, x, S, w = 420) { const y0 = S.GY + 80, y1 = E.H * 1.3; for (let i = 0; i < 6; i++) { const yy = y0 + i * 70; rr(g, x - w / 2 - i * 14, yy, w + i * 28, 40, 4); g.fillStyle = alpha('#f2efe6', 0.8); g.fill(); } }
// a little hatchback (local prop), faces +x
function car(g, x, y, s, col, t, moving) { g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(0, 4, 200, 16, 0, 0, 7); g.fill();
  rr(g, -190, -90, 380, 76, 26); g.fillStyle = col; g.fill(); poly(g, [[-120, -88], [-80, -160], [80, -160], [140, -88]], shade(col, -0.08));
  poly(g, [[-104, -92], [-72, -148], [-6, -148], [-6, -92]], '#9ab8d8'); poly(g, [[6, -92], [6, -148], [72, -148], [118, -92]], '#9ab8d8');
  g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(-60, -144, 16, 48); rr(g, 170, -70, 22, 16, 5); g.fillStyle = '#fff2c8'; g.fill(); glow(g, 186, -62, 70, '#fff2c8', 0.4); rr(g, -194, -70, 14, 16, 4); g.fillStyle = '#e03a2a'; g.fill();
  for (const wx of [-110, 110]) { circle(g, wx, -10, 40, '#16141c'); circle(g, wx, -10, 18, '#8a8a98'); if (moving) seg(g, [[wx - 14, -10], [wx + 14, -10]], 4, '#5a5a68'); }
  g.restore(); }

registerShot('s049', { draw(g, t, info) {
  const tDay = wt(info, 'Day', 0.15), tEl = wt(info, 'eleven', 0.99), tFive = wt(info, 'Five', 1.56);
  const cam = camMove(t, info.dur, { z: [0.92, 0.98], x: [-60, 0], y: [60, 50] });
  const St = street(g, t, cam, { mood: 'day', power: 0.2 }), GY = St.GY, CX = St.CX, lx = CX - 520; veil(g, '#fff0d8', 0.16, 'screen');
  layer(g, cam, 1, (g) => {
    zebra(g, CX - 40, St);
    // a car passes on the green
    const cx = lerp(-E.W * 0.9, E.W * 1.9, prog(t, 0.4, 2.2)); car(g, cx, St.roadY + 120, 1.15, '#3a6ab8', t, true);
    trafficLight(g, lx, GY + 40, t, 'green', { h: 330 });
    // pedestrians waiting (signature colours), phones, glances at him
    [[CX - 900, 1, 0], [CX - 330, -1, 1], [CX + 360, -1, 2], [CX + 620, -1, 3], [CX + 900, 1, 4]].forEach(([x, f, i]) => {
      const look = t > tFive + 0.2 * i ? lookToward(x > CX ? -1 : 1, 0.15) : lookToward(f, 0);
      actor(g, ped(i), { x, y: GY + 20 + (i % 2) * 10, s: 1.7, facing: f, pose: idle(i % 2 ? POSES.phone : POSES.relaxed, t, i + 3), expr: t > tFive + 0.2 * i ? 'surprised' : 'neutral', blink: blinkFlag(t, 2.7 + i * 0.3, i), look, rim: RIM, t, prop: i % 2 ? { type: 'phone' } : null }); });
    // the hero: sprinter's crouch at the kerb, a bounce on 'eleven', smirk on 'Five'
    const crouch = ease.out(prog(t, tEl - 0.2, tEl + 0.2)), base = { ...POSES.crouch, hF: [34, -6], hB: [-6, -4] };
    actor(g, TEE, { x: CX + 40, y: GY + 24, s: 1.9, facing: -1, pose: idle(crouch > 0.5 ? base : POSES.ready, t, 2), expr: exprAt(t, [[0, 'neutral'], [tEl, 'determined'], [tFive, 'smirk']]), blink: blinkFlag(t, 3.4, 6), look: lookToward(-1, -0.6), rim: RIM, t });
  });
  streetFg(g, t, cam);
  atmos(g, t, cam, { color: '#fff2d8' });
  dayC(g, t, [[0, 10], [tDay, 11]]);
  meter(g, t, 500, { at: tFive });
} });

// gold stopwatch (local device): face, crown, sweep hand, digital readout + UP/DOWN tag
function stopwatch(g, x, y, r, t, secs, tag, tagCol) { const U = S().ui;
  glow(g, x, y, r * 1.8, U.gold, 0.14); seg(g, [[x, y - r - 10], [x, y - r - 48]], 26, shade(U.gold, -0.2)); rr(g, x - 34, y - r - 74, 68, 30, 8); g.fillStyle = U.gold; g.fill();
  seg(g, [[x + r * 0.7, y - r * 0.7], [x + r * 0.86, y - r * 0.86]], 20, shade(U.gold, -0.25));
  circle(g, x + 6, y + 10, r + 22, 'rgba(0,0,0,.4)'); circle(g, x, y, r + 22, linGrad(g, 0, y - r, 0, y + r, ['#ffe9a8', U.gold, shade(U.gold, -0.4)])); circle(g, x, y, r, '#fbf6ea');
  for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2 - Math.PI / 2, big = i % 5 === 0; seg(g, [[x + Math.cos(a) * r * (big ? 0.82 : 0.9), y + Math.sin(a) * r * (big ? 0.82 : 0.9)], [x + Math.cos(a) * r * 0.96, y + Math.sin(a) * r * 0.96]], big ? 5 : 2, '#2a2230'); }
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 - Math.PI / 2; text(g, String(i * 5 || 60), x + Math.cos(a) * r * 0.68, y + Math.sin(a) * r * 0.68, { size: r * 0.12, color: '#2a2230', font: FONTS.ui, weight: 900 }); }
  // the 10-second arc: gold wedge filled up to the current time
  g.fillStyle = alpha(U.gold, 0.35); g.beginPath(); g.moveTo(x, y); g.arc(x, y, r * 0.8, -Math.PI / 2, -Math.PI / 2 + secs / 60 * Math.PI * 2); g.closePath(); g.fill();
  const a = -Math.PI / 2 + secs / 60 * Math.PI * 2; seg(g, [[x - Math.cos(a) * r * 0.14, y - Math.sin(a) * r * 0.14], [x + Math.cos(a) * r * 0.86, y + Math.sin(a) * r * 0.86]], 7, '#d4262e'); circle(g, x, y, 14, '#2a2230');
  rr(g, x - r * 0.42, y + r * 0.2, r * 0.84, r * 0.3, 12); g.fillStyle = '#141018'; g.fill(); text(g, `${secs.toFixed(1)} s`, x, y + r * 0.36, { size: r * 0.2, color: U.gold, font: FONTS.ui, weight: 900, glow: 10, glowColor: alpha(U.gold, 0.6) });
  if (tag) { const w = 240; rr(g, x - w / 2, y + r + 60, w, 76, 38); g.fillStyle = 'rgba(14,10,20,.9)'; g.fill(); g.strokeStyle = tagCol; g.lineWidth = 4; g.stroke(); text(g, tag, x, y + r + 100, { size: 50, color: tagCol, font: FONTS.title, weight: 700, spacing: 4 }); }
}

registerShot('s050', { draw(g, t, info) {
  const tTen1 = wt(info, 'ten', 0.97), tUp = wt(info, 'up', 1.73), tTen2 = wt(info, 'ten', 2.23, tUp + 0.1), tDown = wt(info, 'down', 2.91), U = S().ui;
  const up = ease.inOut(prog(t, tTen1 - 0.4, tUp + 0.1)), dn = ease.in(prog(t, tTen2 - 0.1, tDown + 0.2)), h = up * (1 - dn);
  const goingDown = t > tTen2 - 0.1, secs = goingDown ? 10 * (1 - prog(t, tTen2 - 0.1, tDown + 0.2)) : 10 * prog(t, tTen1 - 0.4, tUp + 0.1);
  // left panel: looking up the pole into the sky, the hero a tiny dot with a trail
  const cam = camMove(t, info.dur, { z: [1.0, 1.04], x: [-10, 10] }), PW = E.W * 0.5;
  g.save(); g.beginPath(); g.rect(0, 0, PW, E.H); g.clip();
  layer(g, cam, 0.1, (g) => { g.fillStyle = linGrad(g, 0, -200, 0, E.H, ['#2f7fe0', '#8cc4ff', '#e8f3ff']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); FX.clouds(g, { y: E.H * 0.25, count: 5, h: 120, a: 0.35, seed: 12 }); FX.sun(g, PW * 0.85, 140, 40); });
  layer(g, cam, 0.5, (g) => { g.fillStyle = alpha('#7a8aa8', 0.6); for (let i = 0; i < 6; i++) { const bx = -40 + i * 120, bh = 160 + (i * 73) % 160; g.fillRect(bx, E.H - bh, 100, bh); } });
  layer(g, cam, 1, (g) => {
    trafficLight(g, PW * 0.28, E.H + 140, t, goingDown && t > tDown ? 'green' : up > 0.02 ? 'red' : 'amber', { h: 560, s: 0.9 });
    const dx = PW * 0.62, dy = lerp(E.H - 90, 90, h);
    for (let i = 1; i < 9; i++) { const yy = dy + (goingDown ? -1 : 1) * i * 22; circle(g, dx, yy, 14 - i * 1.2, alpha('#fff6e0', 0.5 - i * 0.05)); }
    actor(g, TEE, { x: dx, y: dy + 48, s: 0.42, facing: 1, pose: goingDown ? POSES.fall : POSES.jump, expr: goingDown ? 'scared' : 'joy', t, shadow: false, rim: RIM });
    // bracket around the dot + live altitude
    const bs = 46; g.strokeStyle = alpha(U.gold, 0.9); g.lineWidth = 4; for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { g.beginPath(); g.moveTo(dx + sx * bs, dy + sy * (bs - 18)); g.lineTo(dx + sx * bs, dy + sy * bs); g.lineTo(dx + sx * (bs - 18), dy + sy * bs); g.stroke(); }
    text(g, `${Math.round(500 * h)} m`, dx + 70, dy, { size: 40, color: U.gold, font: FONTS.ui, weight: 900, align: 'left', stroke: 8, strokeColor: '#140f18' });
  });
  g.restore();
  // right panel: dark card with the stopwatch
  g.fillStyle = linGrad(g, PW, 0, E.W, E.H, ['#1a1426', '#0c0a14']); g.fillRect(PW, 0, E.W - PW, E.H);
  for (let i = 0; i < 6; i++) { const ph = (t * 0.6 + i * 0.4) % 1; FX.sparkle(g, PW + 80 + ((i * 271) % (E.W - PW - 160)), 120 + ((i * 397) % (E.H - 240)), 10 * Math.sin(ph * Math.PI), U.gold, 0.6); }
  seg(g, [[PW, 0], [PW, E.H]], 8, U.gold);
  const tag = up < 0.02 ? null : goingDown ? 'DOWN' : 'UP', tagCol = goingDown ? '#7fc8ff' : U.gold, pop = 1 + 0.08 * Math.exp(-Math.max(0, t - (goingDown ? tTen2 : tTen1)) * 6);
  g.save(); g.translate(PW + (E.W - PW) / 2, E.H * 0.43); g.scale(pop, pop); stopwatch(g, 0, 0, 250, t, clamp(secs, 0, 10), tag, tagCol); g.restore();
  atmos(g, t, cam, { color: '#fff6e0', far: 12, near: 4 });
} });

registerShot('s051', { draw(g, t, info) {
  const tStart = wt(info, 'start', 0.21), tTim = wt(info, 'timing', 0.49), tLights = wt(info, 'lights', 2.17);
  const t0 = Math.max(tStart + 0.28, tTim), H = 1500, opt = { up: 0.85, hang: 0.12, down: tLights - t0 - 0.97, landing: 'thud' }, J = jumpPose(t, t0, H, opt), T = J.times;
  const cam = jumpCam(t, t0, H, { ...opt, z: 1.12, x: -60, y: 40, follow: 0.14, lag: 0.08, zoomOut: 0.06, shake: 20 });
  const St = street(g, t, cam, { mood: 'day', power: 0.2 }), GY = St.GY, CX = St.CX, hx = CX + 40, gy = St.GY + 150, lx = CX - 470;
  veil(g, '#fff0d8', 0.16, 'screen'); const state = t < tStart ? 'amber' : t < T.tL ? 'red' : 'green';
  layer(g, cam, 1, (g) => {
    zebra(g, hx, St, 460);
    car(g, CX - 1200, St.roadY + 120, 1.15, '#d4262e', t, false);                              // cars stopped at the red
    trafficLight(g, lx, GY + 40, t, state, { h: 330 });
    // pedestrians cross under him while he is up (walk locked to x), then step onto the far kerb
    [[0, 1, 0.0], [1, -1, 0.25], [2, 1, 0.55], [3, -1, 0.8]].forEach(([i, f, d]) => {
      const k = prog(t, tStart + 0.2 + d * 0.5, T.tL - 0.05), x = f > 0 ? lerp(CX - 760, CX + 760, k) : lerp(CX + 820, CX - 700, k), y = gy + 30 + (i % 2) * 40;
      if (k <= 0 || k >= 1) return; const looking = J.phase === 'apex' || J.phase === 'fall';
      actor(g, ped(i + 1), { x, y, s: 1.75, facing: f, pose: walkAlong(x, 1.75, { facing: f }).pose, expr: looking ? 'surprised' : 'neutral', blink: blinkFlag(t, 2.9 + i * 0.4, i), look: looking ? lookToward(f * 0.3, -1) : lookToward(f, 0), rim: RIM, t }); });
    jumpFX(g, t, J, { x: hx, gy, s: 1.9, landing: 'thud', dustColor: '#d8d4cc' });
    const pose = J.landed && t > T.tL + 0.45 ? idle({ ...POSES.stand, eF: [30, -150], hF: [40, -190] }, t, 3) : J.pose;            // thumbs up
    jumper(g, TEE, { ...J, pose }, { x: hx, gy, s: 1.9, facing: -1, expr: exprAt(t, [[0, 'determined'], [T.t0, 'joy'], [T.tB, 'surprised'], [T.tL, 'determined'], [T.tL + 0.45, 'smirk']]), blink: blinkFlag(t, 3.4, 6), look: J.phase === 'ground' ? lookToward(-1, -0.4) : [0, 1], rim: RIM, t });
    if (t > T.tL + 0.45) { const tx = hx - 76, ty = gy - 380; circle(g, tx, ty, 14, '#2a1e18'); seg(g, [[tx, ty], [tx - 2, ty - 26]], 9, '#2a1e18'); FX.sparkle(g, tx - 10, ty - 40, 22 * ease.outBack(prog(t, T.tL + 0.45, T.tL + 0.7)), '#fff6e0', 0.9); }
  });
  streetFg(g, t, cam);
  atmos(g, t, cam, { color: '#fff2d8' });
  impactFrame(g, t, T.tL, { x: E.W * 0.5, y: E.H * 0.78 });
  dayC(g, t, [[0, 11]]);
  meter(g, t, Math.max(0.5, 500 * J.lift / H), { text: J.phase === 'ground' || J.phase === 'crouch' ? '0 m' : null });
} });
