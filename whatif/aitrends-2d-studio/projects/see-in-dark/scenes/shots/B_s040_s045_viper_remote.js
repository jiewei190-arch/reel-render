// B_s040_s045_viper_remote.js — batch B: the pit viper's heat pinhole, TRPA1 (2010), the strike line, and the remote found by heat.
import { E, S, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, glow, alpha, text, FONTS, rr, seg, circle, ring, poly, shake, shade, mix } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { actor, cat, mouse, snake } from '../sets/actors.js';
import { forest, forestFg, forestGround } from '../sets/forest.js';
import { apartment, apartmentFg, apartmentGround } from '../sets/apartment.js';
import { thermalView, heatActor, heatMouse, heatSnake, heatCat, heatBlob, heatRect, heat } from '../sets/thermal.js';
import { chip } from '../sets/hud.js';
import { blinkFlag, exprAt, poseAt, idle, reaction, lookToward, camMove, atmos } from '../sets/acting.js';
import * as BP from '../sets/bp.js';
import { W, handWorld, scr, punch, remote } from './B_lib.js';

const CX = E.W / 2;
// snake head + pit positions in world space (mirrors creatures.js snake(): head = last spine point, pit at head + (32,-1))
function snakeHead(o) { const s = o.s ?? 1, f = o.facing ?? 1, st = o.strike || 0, t = o.t || 0, hx = st * 90, hy = -10 - Math.sin(9 - t * 3) * 14 * 0.6 - (42 + st * 20);
  return { head: [o.x + (hx + 16) * f * s, o.y + (hy - 2) * s], pit: [o.x + (hx + 32) * f * s, o.y + (hy - 1) * s], eye: [o.x + (hx + 21) * f * s, o.y + (hy - 8) * s] }; }
// mossy boulder the viper lies on (local helper; forest set is read-only)
function boulder(g, x, y, w, h) { g.fillStyle = '#2c2a36'; g.beginPath(); g.ellipse(x, y, w, h, 0, Math.PI, 0); g.fill(); g.fillStyle = alpha('#9ab8ff', 0.14); g.beginPath(); g.ellipse(x - w * 0.2, y - h * 0.82, w * 0.55, h * 0.16, -0.1, 0, 7); g.fill();
  g.fillStyle = '#3d5a34'; for (let i = 0; i < 9; i++) { const a = Math.PI + 0.25 + i * 0.3; g.beginPath(); g.ellipse(x + Math.cos(a) * w * 0.92, y + Math.sin(a) * h * 0.92, 34, 12, a + 1.57, 0, 7); g.fill(); } }

// s040 — "Nature found a workaround. A pit viper has a hollow pit"  insert: viper on a mossy rock, push to the face, gold ring on the pit
registerShot('s040', { draw(g, t, info) {
  const tPit = W('pit', info, 2.01), tHol = W('hollow', info, 2.99), GY = forestGround();
  const sn = { x: CX - 160, y: GY - 150, s: 2.3, facing: 1, t, len: 220 }, H = snakeHead(sn);
  const k = ease.inOut(t / info.dur), cam = camMove(t, info.dur, { z: [1.05, 1.9], x: [-120, H.head[0] - CX + 40], y: [-10, H.head[1] - E.H / 2 + 40] });
  forest(g, t, cam, { view: 'cave', rain: false });
  layer(g, cam, 1, (g) => {
    FX.pool(g, CX - 380, GY - 300, 520, 160, '#b8c8ff', 0.12);                                                    // moonlight on the rock
    boulder(g, CX - 60, GY + 10, 520, 170);
    snake(g, { ...sn, rim: { color: '#b8c8ff', dir: [-0.6, -1] } });
    const rk = ease.outBack(prog(t, tPit - 0.1, tPit + 0.3)); if (rk > 0) { const [px, py] = H.pit; ring(g, px, py, 26 * rk, 4, '#ffd47e'); glow(g, px, py, 70, '#ffd47e', 0.45 * rk); }
    if (t > tHol) { const [px, py] = H.pit; ring(g, px, py, 40 + 14 * Math.sin(t * 6), 2, alpha('#ffd47e', 0.5)); }
  });
  forestFg(g, t, cam);
  atmos(g, t, cam, { color: '#b8c8ff' }); FX.rain(g, t, { count: 50, color: '#9fb6ff', a: 0.1 });
  if (t > tPit) { const [px, py] = scr(cam, ...H.pit); text(g, 'PIT', px + 70, py - 70, { size: 46, color: S().ui.gold, font: FONTS.ui, weight: 900, glow: 14, glowColor: alpha(S().ui.gold, 0.6), stroke: 8, strokeColor: 'rgba(0,0,0,.6)', alpha: ease.out(prog(t, tPit, tPit + 0.3)) }); }
} });

// s041 — "on its face that works like a pinhole camera for heat,"  BLUEPRINT: rays from a mouse through the pit opening form an upside-down image
registerShot('s041', { draw(g, t, info) {
  const ui = S().ui, tPin = W('pinhole', info, 1.63), tHeat = W('heat', info, 2.63), z = 1 + 0.035 * ease.inOut(t / info.dur);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2 + Math.sin(t * 0.5) * 3, -E.H / 2);
  BP.board(g, t, { title: 'THE PIT ORGAN', fig: 'FIG 4 - PINHOLE CAMERA' });
  const k = ease.out(prog(t, 0.05, 1.3)), ox = E.W * 0.56, oy = E.H * 0.52, mx = E.W * 0.2, my = E.H * 0.52;
  // the pit: a cup-shaped chamber with a narrow opening on the left, membrane at the back
  BP.draw(g, [[ox - 10, oy - 170], [ox + 220, oy - 220], [ox + 300, oy], [ox + 220, oy + 220], [ox - 10, oy + 170]], k, { w: 5 });
  BP.draw(g, [[ox - 10, oy - 170], [ox - 10, oy - 18]], k, { w: 5 }); BP.draw(g, [[ox - 10, oy + 18], [ox - 10, oy + 170]], k, { w: 5 });
  BP.draw(g, [[ox + 200, oy - 190], [ox + 262, oy], [ox + 200, oy + 190]], ease.out(prog(t, 0.4, 1.4)), { w: 9, color: ui.gold });                  // membrane
  // the mouse outline (warm) on the left
  g.save(); g.globalAlpha *= k; g.strokeStyle = '#ff8a40'; g.lineWidth = 5; g.beginPath(); g.ellipse(mx, my, 90, 52, 0, 0, 7); g.stroke(); g.beginPath(); g.arc(mx + 84, my - 30, 34, 0, 7); g.stroke(); g.beginPath(); g.arc(mx + 66, my - 70, 24, 0, 7); g.stroke();
  seg(g, [[mx - 86, my + 10], [mx - 150, my + 30], [mx - 190, my - 4]], 4, '#ff8a40'); glow(g, mx, my, 160, '#ff7a30', 0.18 + 0.08 * Math.sin(t * 4)); g.restore();
  // heat rays: top of the mouse lands at the bottom of the membrane and vice versa (upside-down image)
  const rk = ease.inOut(prog(t, 0.9, 1.9));
  for (const [sy, ty] of [[my - 90, oy + 150], [my - 30, oy + 60], [my + 40, oy - 50], [my + 60, oy - 120]]) {
    const pts = [[mx + 40, sy], [ox - 10, oy], [ox + 238, ty]]; BP.draw(g, pts, rk, { w: 3, color: alpha('#ff8a40', 0.85) }); }
  const ik = ease.out(prog(t, 1.6, 2.2)); if (ik > 0) { g.save(); g.translate(ox + 232, oy); g.rotate(Math.PI); g.scale(0.5, 0.5); g.globalAlpha *= ik; g.strokeStyle = '#ffb070'; g.lineWidth = 7; g.beginPath(); g.ellipse(0, 0, 90, 52, 0, 0, 7); g.stroke(); g.beginPath(); g.arc(84, -30, 34, 0, 7); g.stroke(); glow(g, 0, 0, 120, '#ff7a30', 0.4); g.restore(); }
  BP.label(g, t, { at: [ox - 10, oy - 18], to: [ox - 160, oy - 260], str: 'NARROW OPENING', start: 0.9, size: 28 });
  BP.label(g, t, { at: [ox + 250, oy + 60], to: [ox + 420, oy + 230], str: 'HEAT IMAGE', start: 1.8, size: 28 });
  g.restore();
  chip(g, t, { str: 'PINHOLE CAMERA FOR HEAT', at: tPin, x: E.W / 2, y: E.H * 0.88, dur: info.dur - 0.12 });
} });

// s042 — "and in 2010 scientists traced its heat sensor"  BLUEPRINT zoom into the pit membrane: nerve endings light up
registerShot('s042', { draw(g, t, info) {
  const ui = S().ui, t10 = W('2010', info, 0.87), tSen = W('sensor', info, 2.93), tTr = W('traced', info, 2.09), z = 1.0 + 0.04 * ease.inOut(t / info.dur);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  BP.board(g, t, { title: 'PIT MEMBRANE, ZOOM x400', fig: 'FIG 5 - HEAT-SENSING NERVES' });
  const y0 = E.H * 0.34, k = ease.out(prog(t, 0, 1.0));
  BP.draw(g, [[E.W * 0.1, y0], [E.W * 0.9, y0]], k, { w: 6, color: ui.gold }); BP.draw(g, [[E.W * 0.1, y0 + 26], [E.W * 0.9, y0 + 26]], k, { w: 3 });   // the membrane, edge on
  // nerve endings branch up to the membrane; they light in a wave after "traced"
  for (let i = 0; i < 7; i++) { const x = E.W * (0.16 + i * 0.113), kk = ease.out(prog(t, 0.3 + i * 0.08, 1.2 + i * 0.08)), lit = ease.out(prog(t, tTr + i * 0.07, tTr + 0.3 + i * 0.07));
    const pts = [[x + 30 * Math.sin(i), E.H * 0.86], [x + 10 * Math.cos(i * 2), E.H * 0.62], [x, y0 + 30]]; BP.draw(g, pts, kk, { w: 4, color: alpha(ui.blueprint, 0.8) });
    BP.draw(g, [[x + 10 * Math.cos(i * 2), E.H * 0.62], [x - 40, y0 + 34]], kk, { w: 3, color: alpha(ui.blueprint, 0.6) }); BP.draw(g, [[x + 10 * Math.cos(i * 2), E.H * 0.62], [x + 40, y0 + 34]], kk, { w: 3, color: alpha(ui.blueprint, 0.6) });
    if (lit > 0) { glow(g, x, y0 + 32, 60, ui.gold, 0.55 * lit * (0.8 + 0.2 * Math.sin(t * 7 + i))); circle(g, x, y0 + 32, 7, alpha(ui.cream, lit)); const pp = ((t - tTr) * 0.9 + i * 0.13) % 1; glow(g, lerp(x, x + 30 * Math.sin(i), pp), lerp(y0 + 40, E.H * 0.86, pp), 30, '#ff9a50', 0.6 * lit); } }
  // heat arriving from above
  for (let i = 0; i < 5; i++) { const ph = (t * 0.8 + i / 5) % 1, x = E.W * (0.22 + i * 0.14); const pts = Array.from({ length: 10 }, (_, j) => [x + Math.sin(j * 1.2 + t * 6) * 9, E.H * 0.1 + ph * (y0 - E.H * 0.16) + j * 8]); seg(g, pts, 4, alpha('#ff8a40', 0.7 * Math.sin(ph * Math.PI))); }
  BP.label(g, t, { at: [E.W * 0.5, y0 + 32], to: [E.W * 0.62, E.H * 0.52], str: 'HEAT SENSOR', start: tSen - 0.1 });
  g.restore();
  const yk = ease.outBack(prog(t, t10 - 0.05, t10 + 0.35)); if (yk > 0) { g.save(); g.translate(E.W * 0.2, E.H * 0.6); g.scale(yk, yk); text(g, '2010', 0, 0, { size: 120, color: ui.gold, font: FONTS.title, weight: 700, glow: 30, glowColor: alpha(ui.gold, 0.6), stroke: 10, strokeColor: 'rgba(0,0,0,.5)' }); g.restore(); }
} });

// s043 — "to a protein called TRPA1."  BLUEPRINT molecule cartoon: the channel opens when the heat wave hits it, ions flow
registerShot('s043', { draw(g, t, info) {
  const ui = S().ui, tPr = W('protein', info, 0.55), tTr = W('TRPA1', info, 1.29), z = 1.02 + 0.035 * ease.inOut(t / info.dur);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2 - 10 * t, -E.H / 2);
  BP.board(g, t, { title: 'A HEAT-GATED CHANNEL', fig: 'FIG 6 - THE TRPA1 PROTEIN' });
  const my = E.H * 0.56, gx = E.W * 0.52, k = ease.out(prog(t, 0, 0.8));
  for (let x = E.W * 0.12; x < E.W * 0.9; x += 34) { if (Math.abs(x - gx) < 120) continue; for (const d of [-1, 1]) { circle(g, x, my + d * 50, 13 * k, alpha(ui.blueprint, 0.55)); seg(g, [[x, my + d * 36], [x + (d > 0 ? 0 : 0), my + d * 8]], 3, alpha(ui.blueprint, 0.4 * k)); } }   // lipid bilayer
  const wave = prog(t, tPr - 0.2, tPr + 0.6), open = ease.inOut(prog(t, tPr + 0.4, tPr + 0.9)), gap = lerp(8, 60, open);
  if (wave > 0 && wave < 1) { const yy = lerp(E.H * 0.14, my - 120, wave); const pts = Array.from({ length: 30 }, (_, j) => [gx - 260 + j * 18, yy + Math.sin(j * 0.8 - t * 10) * 16]); seg(g, pts, 6, alpha('#ff6a3a', 0.9)); }
  for (const d of [-1, 1]) { g.save(); g.translate(gx + d * (gap / 2 + 46), my); g.rotate(d * 0.25 * open); rr(g, -46, -110, 92, 220, 40); g.fillStyle = alpha(ui.bpBg, 0.95); g.fill(); g.strokeStyle = open > 0.4 ? ui.gold : ui.blueprint; g.lineWidth = 5; g.stroke();
    for (let i = 0; i < 4; i++) ring(g, 0, -70 + i * 46, 12, 3, alpha(open > 0.4 ? ui.gold : ui.blueprint, 0.6)); g.restore(); }
  if (open > 0.3) for (let i = 0; i < 10; i++) { const ph = (t * 1.4 + i / 10) % 1; circle(g, gx + Math.sin(i * 2.3 + t) * 12, lerp(my - 180, my + 200, ph), 9, alpha(ui.cream, 0.85 * open)); }
  text(g, 'HEAT', gx - 300, E.H * 0.2, { size: 34, color: '#ff8a40', font: FONTS.ui, weight: 900, spacing: 5, alpha: clamp((t - tPr + 0.2) * 3) });
  BP.label(g, t, { at: [gx + 80, my - 100], to: [gx + 300, my - 280], str: 'TRPA1', start: tTr, size: 64 });
  BP.label(g, t, { at: [gx, my + 170], to: [gx - 260, my + 280], str: 'IONS FLOW IN', start: tPr + 0.9, size: 28 });
  g.restore();
} });

// s044 — "So a snake can find a mouse in total darkness."  THERMAL forest floor: cold snake with hot pits turns to a bright mouse; crosshair locks
registerShot('s044', { draw(g, t, info) {
  const tFind = W('find', info, 1.05), tDark = W('darkness', info, 2.11), GY = forestGround();
  const cam = camMove(t, info.dur, { z: [1.32, 1.46], x: [-60, 40], y: [130, 120] });
  const turn = ease.inOut(prog(t, tFind - 0.15, tFind + 0.35)), sn = { x: CX - 300, y: GY - 6, s: 2.3, facing: 1, t, len: 220, strike: 0.15 + 0.25 * turn }, H = snakeHead(sn);
  const mx = CX + 330 + Math.sin(t * 1.7) * 18, my = GY - 4;
  const lock = t > tFind + 0.2, [hx, hy] = scr(cam, mx + 20, my - 40);
  thermalView(g, t, {
    cold: (c) => forest(c, t, cam, { view: 'cave', rain: true }),
    hot: (c) => layer(c, cam, 1, (c) => {
      heatSnake(c, { ...sn, heat: 0.3 });
      heatMouse(c, { x: mx, y: my, s: 5.2, facing: -1, t, heat: 0.5 });
    }),
    hud: { label: 'THERMAL', temp: lock ? '34 C  LOCKED' : '34 C', track: lock ? [hx, hy] : [lerp(scr(cam, ...H.pit)[0], hx, ease.inOut(prog(t, tFind - 0.2, tFind + 0.2))), lerp(scr(cam, ...H.pit)[1], hy, ease.inOut(prog(t, tFind - 0.2, tFind + 0.2)))] },
  });
  if (lock) { const lk = ease.out(prog(t, tFind + 0.2, tFind + 0.45)); g.save(); g.strokeStyle = alpha('#ffd47e', 0.9 * lk); g.lineWidth = 3; g.setLineDash([12, 10]); const [px, py] = scr(cam, ...H.pit); g.beginPath(); g.moveTo(px, py); g.lineTo(hx, hy); g.stroke(); g.restore(); }
  FX.rain(g, t, { count: 60, color: '#b88aff', a: 0.12 });
  chip(g, t, { str: 'Total darkness. Still found.', at: tDark, x: E.W / 2, y: E.H * 0.86, dur: info.dur - 0.1 });
} });

// s045 — "You can find a mouse... and, finally, the remote."  THERMAL living room: cushion up, mouse bolts, the warm remote held high
registerShot('s045', { draw(g, t, info) {
  const tMouse = W('mouse', info, 0.77), tFin = W('finally', info, 1.99), tRem = W('remote', info, 2.81), GY = apartmentGround();
  const cam = camMove(t, info.dur, { z: [1.22, 1.32], x: [-140, -70], y: [60, 50] });
  const sofaX = CX - 150, seatY = GY - 120;
  const heroPose = idle(poseAt(t, [[0, 'reach'], [tMouse - 0.3, 'shock'], [tFin - 0.2, 'reach'], [tRem - 0.25, 'delight']], 0.25), t, 2);
  const hero = { x: sofaX + 200, y: GY, s: 1.9, facing: -1 };
  const [hx, hy] = handWorld(hero, heroPose), lift = ease.inOut(prog(t, 0.1, 0.6)), cush = [lerp(sofaX + 60, hx - 20, lift), lerp(seatY, hy + 10, lift)];
  const bolt = ease.in(prog(t, tMouse - 0.1, tMouse + 1.0)), mx = lerp(sofaX + 20, sofaX - 900, bolt), my = lerp(seatY + 10, GY - 2, ease.out(prog(t, tMouse - 0.1, tMouse + 0.2)));
  const grab = ease.inOut(prog(t, tFin, tRem - 0.25)), rx = lerp(sofaX - 10, hx, grab), ry = lerp(seatY + 6, hy, grab);
  const holdCush = t < tFin;
  thermalView(g, t, {
    cold: (c) => apartment(c, t, cam, { power: 0, moon: 1.3 }),
    hot: (c) => layer(c, cam, 1, (c) => {
      heatRect(c, sofaX - 260, seatY - 20, 520, 50, 0.22, 10);                                                       // the seat, faintly warm where he sat
      if (holdCush) heatRect(c, cush[0] - 90, cush[1] - 34, 180, 60, 0.2, 18);
      heatActor(c, 'HERO', { ...hero, pose: heroPose, t, expr: exprAt(t, [[0, 'neutral'], [tMouse, 'surprised'], [tRem, 'happy']]), blink: blinkFlag(t, 3.2, 1), look: lookToward(-1, 0.4) });
      if (t > tMouse - 0.15 && bolt < 1) heatMouse(c, { x: mx, y: my, s: 4.6, facing: -1, t: t * 1.6, heat: 0.64 });
      remote(c, rx, ry, 2.6, { flat: true, fill: heat(0.5), rot: lerp(-1.4, -0.2, grab) }); heatBlob(c, rx, ry - 30, 60, 50, 0.3, 0.9);
      heatCat(c, { x: sofaX - 360, y: GY - 2, s: 1.9, facing: 1, pose: 'sit', t, heat: 0.58 });
    }),
    hud: { label: 'THERMAL', temp: t > tFin ? '31 C  REMOTE' : '34 C  MOUSE', track: t > tFin ? scr(cam, rx, ry - 30) : scr(cam, mx, my - 30) },
  });
  if (t > tRem) FX.sparkle(g, ...scr(cam, rx, ry - 60), 40 * ease.outBack(prog(t, tRem, tRem + 0.3)), '#fff3c4', 0.9);
  FX.dust(g, t, { count: 24, color: '#ffb070', a: 0.22 });
  chip(g, t, { str: 'REMOTE FOUND', at: tRem + 0.05, x: E.W * 0.32, y: E.H * 0.86, dur: info.dur - 0.08 });
} });
