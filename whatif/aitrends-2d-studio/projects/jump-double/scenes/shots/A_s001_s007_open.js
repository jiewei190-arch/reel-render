// A_s001_s007_open.js — batch A (H1), the cold open: s001 ceiling bonk, s002 dazed giant face, s003 the DAY counter is born,
// s004 the half-metre hop, s005-s006 the doubling graph (and the runaway bar), s007 the title over the rooftops and the moon.
// Built to QUALITY_BAR.md (S_showcase.js level): moving camera, word-synced expressions, blink + idle, parallax, atmosphere, rim light.
import { E, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, wordTime, alpha, glow, shake, text, FONTS, rr, seg, circle, poly, linGrad, shade, mix, backdrop, rng } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { actor } from '../sets/actors.js';
import { apartment, apartmentFg } from '../sets/apartment.js';
import { roofs, roofsFg, M2U } from '../sets/roofs.js';
import { chip } from '../sets/hud.js';
import { giantFace, faceAt } from '../sets/faces.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, reaction, lookToward, camMove, atmos } from '../sets/acting.js';
import { jumpPose, jumper, jumpFX, impactFrame, jumpShake } from '../sets/jump.js';
import { dayCounter, heightMeter, doublingGraph } from '../sets/devices.js';

// shot-local seconds of a spoken word (fallback if the transcript missed it)
const sw = (w, st, fb) => { const m = w.toLowerCase(); const hit = E.words.find(x => x.start >= st - 0.05 && x.word.toLowerCase().replace(/[^\w']/g, '').startsWith(m)); return (hit ? hit.start : st + fb) - st; };
const SUN = { color: '#ffd59a', dir: [-0.9, -0.35] };            // sunrise rim: the big window is on the left

// ---------- local bedroom props (the flat is re-dressed as the bedroom: bed, nightstand, alarm clock, ceiling) ----------
const BED_W = 620, MATT = 150;                                    // the mattress top sits MATT units above the floor
function bed(g, x, gy, t) {
  rr(g, x - BED_W / 2 - 40, gy - 330, 34, 330, 10); g.fillStyle = '#6a4a3a'; g.fill();                              // headboard post
  rr(g, x - BED_W / 2 - 40, gy - 330, 160, 190, 18); g.fillStyle = linGrad(g, 0, gy - 330, 0, gy - 140, ['#8a5e46', '#5e3e30']); g.fill();
  rr(g, x - BED_W / 2, gy - 70, BED_W, 70, 10); g.fillStyle = '#4e3428'; g.fill();                                  // frame
  rr(g, x - BED_W / 2 - 6, gy - MATT, BED_W + 12, 86, 26); g.fillStyle = linGrad(g, 0, gy - MATT, 0, gy - 64, ['#f2eee6', '#cfc8bc']); g.fill();   // mattress
  rr(g, x - BED_W / 2 + 10, gy - MATT - 34, 150, 56, 26); g.fillStyle = '#e8e4f4'; g.fill();                       // pillow
  // duvet thrown back in a heap toward the foot (blue with a star print)
  g.fillStyle = linGrad(g, 0, gy - MATT - 40, 0, gy - 40, ['#3f6ac8', '#2a4690']); g.beginPath(); g.moveTo(x - 40, gy - MATT + 4); g.quadraticCurveTo(x + 60, gy - MATT - 60, x + BED_W / 2 + 10, gy - MATT - 20);
  g.lineTo(x + BED_W / 2 + 24, gy - 40); g.quadraticCurveTo(x + 120, gy - 20, x - 40, gy - MATT + 60); g.closePath(); g.fill();
  const r = rng(7); for (let i = 0; i < 9; i++) FX.sparkle(g, x + 20 + r() * (BED_W / 2 - 40), gy - MATT - 20 + r() * 70, 7, '#f2c21a', 0.7);
}
function nightstand(g, x, gy, t, rattle) {
  rr(g, x - 70, gy - 170, 140, 170, 10); g.fillStyle = linGrad(g, 0, gy - 170, 0, gy, ['#7a5440', '#4e3428']); g.fill();
  seg(g, [[x - 50, gy - 100], [x + 50, gy - 100]], 3, '#3a2620'); circle(g, x, gy - 128, 6, '#d8b878');
  const jx = rattle ? Math.sin(t * 90) * 6 * rattle : 0, jy = rattle ? -Math.abs(Math.sin(t * 60)) * 6 * rattle : 0;
  g.save(); g.translate(jx, jy); circle(g, x - 30, gy - 238, 16, '#c8c0b0'); circle(g, x + 30, gy - 238, 16, '#c8c0b0');   // twin bells
  FX.clock(g, x, gy - 210, 46, 6.25 + t * 0.02, { face: '#f2efe8' }); g.restore();
  if (rattle > 0.05) for (let k = 0; k < 3; k++) seg(g, [[x + 64 + k * 14, gy - 250 + k * 18], [x + 82 + k * 14, gy - 262 + k * 18]], 4, alpha('#fff1c8', rattle));
  // a cup and a book: floor items on the character plane
  rr(g, x - 52, gy - 186, 54, 16, 3); g.fillStyle = '#c84a3a'; g.fill(); rr(g, x + 20, gy - 196, 30, 26, 6); g.fillStyle = '#e8e4d8'; g.fill();
}
// the ceiling with a crown moulding and a pendant lamp; `hit` 0..1 = the head-shaped hole and cracks
function ceiling(g, cy, hx, hit, t, tHit) {
  g.fillStyle = linGrad(g, 0, cy - 600, 0, cy, ['#d8cbb8', '#efe4d2']); g.fillRect(-E.W, cy - 600, E.W * 3, 600);
  rr(g, -E.W, cy - 6, E.W * 3, 26, 4); g.fillStyle = '#f6efe2'; g.fill(); seg(g, [[-E.W, cy + 20], [E.W * 2, cy + 20]], 3, alpha('#8a7a64', 0.6));
  seg(g, [[hx + 520, cy], [hx + 520, cy + 120]], 3, '#3a3040'); poly(g, [[hx + 480, cy + 120], [hx + 560, cy + 120], [hx + 540, cy + 160], [hx + 500, cy + 160]], '#f2c21a'); glow(g, hx + 520, cy + 170, 120, '#ffd59a', 0.4);
  if (hit <= 0) return;
  const r = rng(13); g.strokeStyle = alpha('#5a4a3a', 0.9); g.lineWidth = 4;
  for (let i = 0; i < 9; i++) { const a = Math.PI * (0.1 + 0.8 * i / 8), L = (90 + r() * 140) * ease.out(hit); g.beginPath(); let px = hx, py = cy; g.moveTo(px, py);
    for (let s = 0; s < 3; s++) { px += Math.cos(-a + (r() - 0.5) * 0.6) * L / 3; py += -Math.sin(-a) * 0 + (r() - 0.3) * 18; g.lineTo(px, py); } g.stroke(); }
  // plaster chunks + dust falling from the hole
  const u = Math.max(0, t - tHit); for (let i = 0; i < 14; i++) { const vx = (r() - 0.5) * 260, vy = 60 + r() * 120, x = hx + vx * u, y = cy + 20 + vy * u + 900 * u * u, s = 6 + r() * 12;
    g.save(); g.translate(x, y); g.rotate(u * (r() * 8 - 4)); g.fillStyle = r() > 0.5 ? '#f2ead8' : '#d8ccb8'; g.fillRect(-s / 2, -s / 2, s, s * 0.7); g.restore(); }
  glow(g, hx, cy + 30, 220 * ease.out(prog(u, 0, 0.3)), '#fff6e6', 0.5 * (1 - prog(u, 0.2, 1.2)));
}

// ===================================================================================================
// s001 — "You wake up, stretch, and jump off your bed. You hit the ceiling."
// Bedroom at sunrise: the alarm rattles, HERO sits up, stretches on "stretch", crouches on the mattress and hops on "jump" — and rockets
// into the ceiling on "ceiling" (head through the plaster, impact frame, shake, chunks). Follow cam tilts up with him.
registerShot('s001', { draw(g, t, info) {
  const st = info.shot.start, tS = sw('stretch', st, 1.14), tJ = sw('jump', st, 1.58) + 0.05, tC = sw('ceiling', st, 3.22);
  const H = 380, J = jumpPose(t, tJ, H, { up: tC - tJ, hang: 4, crouch: 0.22, landing: 'soft' }), T = J.times;
  const hitK = t >= tC ? 1 : 0, sk = t >= tC ? shake(t * 4, 26 * Math.exp(-(t - tC) * 5), 4, 2) : [0, 0];
  const lift = J.lift * 0.82;
  const cam = camMove(t, info.dur, { z: [1.16, 1.2], x: [-60, -40], y: [40, 40] }); cam.y -= lift; cam.x += sk[0]; cam.y += sk[1];
  if (t >= tC) cam.z += 0.06 * Math.exp(-(t - tC) * 6);
  const A = apartment(g, t, cam, { mood: 'day', power: 1 }), GY = A.GY, CX = A.CX, bx = CX - 80, gyM = GY - MATT + 24, CEIL = GY - 1010;
  layer(g, cam, 0.9, (g) => FX.godRays(g, CX - 760, GY - 760, { count: 7, len: 1500, spread: 0.7, angle: 0.55, color: '#ffe2a8', a: 0.1 }));
  layer(g, cam, 1, (g) => {
    ceiling(g, CEIL, bx, hitK, t, tC);
    bed(g, bx, GY + 10, t); nightstand(g, bx - BED_W / 2 - 170, GY + 10, t, 1 - prog(t, 0.35, 0.6));
    const expr = exprAt(t, [[0, 'sleepy'], [tS, 'happy'], [T.tc, 'determined'], [T.t0, 'joy'], [tC, 'shocked']]);
    if (t < T.tc) { const pose = idle(poseAt(t, [[0, 'sit'], [tS - 0.25, 'cheer'], [T.tc - 0.12, 'stand']], 0.28), t, 3);
      actor(g, 'HERO', { x: bx + 40, y: gyM, s: 1.95, facing: 1, pose, expr, blink: t < tS - 0.3 ? true : blinkFlag(t, 3.4, 7), look: t > tS ? lookToward(0.4, -0.6) : [0, 0.6], rim: SUN, t }); }
    else { jumpFX(g, t, J, { x: bx + 40, gy: gyM, s: 1.95, landing: 'soft', launchDust: false });
      jumper(g, 'HERO', J, { x: bx + 40, gy: gyM, s: 1.95, facing: 1, expr, blink: blinkFlag(t, 3.4, 7), look: lookToward(0.2, -1), rim: SUN, t }); }
    if (t >= tC) for (let i = 0; i < 3; i++) { const a = t * 6 + i * 2.1; FX.sparkle(g, bx + 40 + Math.cos(a) * 110, CEIL + 160 + Math.sin(a) * 30, 16, '#fff1c8', 0.9); }
  });
  apartmentFg(g, t, cam);
  atmos(g, t, cam, { color: '#ffe2b8', far: 34, near: 12 });
  glow(g, E.W * 0.08, E.H * 0.35, 700, '#ffcf8a', 0.18);
  impactFrame(g, t, tC, { x: E.W * 0.5, y: E.H * 0.16 });
} });

// ===================================================================================================
// s002 — "Hard. Nobody knows why, but the rule is simple:"   GIANT FACE: dazed HERO, plaster dust, a crack halo, cartoon stars circling;
// eyes uncross on "rule" (squint -> suspicious). Punch-in on the cut, warm sunrise rim from the window side.
registerShot('s002', { draw(g, t, info) {
  const st = info.shot.start, tWhy = sw('why', st, 1.95), tRule = sw('rule', st, 2.83);
  const punch = Math.exp(-t * 6), cam = camMove(t, info.dur, { z: [1.0, 1.08] }); cam.z += 0.05 * punch; { const k = shake(t * 3, 16 * punch, 4, 3); cam.x += k[0]; cam.y += k[1]; }
  blurLayer(g, 16, (c) => apartment(c, t, cam, { mood: 'day', power: 1 }), null, 1); veil(g, '#1a0f08', 0.35);
  glow(g, E.W * 0.1, E.H * 0.3, 900, '#ffcf8a', 0.35);
  const f = faceAt(t, [[0, 'shocked'], [0.6, { eye: 0.6, pupil: 0.8, brow: -0.1, tilt: -0.3, open: 0.25, smile: -0.2, w: 0.7, look: [0.5, -0.4] }], [tWhy, 'squint'], [tRule, 'suspicious'], [tRule + 0.7, 'smirk']], 0.16);
  const bl = blinkAmt(t, 2.6, 2), br = Math.sin(t * 2.2);
  layer(g, cam, 1, (g) => {
    const cx = E.W * 0.52 + Math.sin(t * 2.4) * 10 * (1 - prog(t, tRule - 0.4, tRule)), cy = E.H * 0.58;
    // jagged crack halo behind the head
    const ck = ease.out(prog(t, 0, 0.3)) * (1 - prog(t, 2.4, 3.4)); if (ck > 0) { g.save(); g.globalAlpha = ck; g.strokeStyle = '#f6efe2'; g.lineWidth = 10; const r = rng(4); g.beginPath();
      for (let i = 0; i <= 24; i++) { const a = Math.PI * (1.05 + 0.9 * i / 24), R = 400 + (i % 2 ? 40 : -10) + r() * 20; const px = cx + Math.cos(a) * R, py = cy - 40 + Math.sin(a) * R * 0.9; i ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke(); g.restore(); }
    giantFace(g, cx, cy, 330, { who: 'HERO', f, rimSide: -1, rimColor: '#ffc68a', breath: br, blink: bl, tilt: lerp(0.06, -0.02, ease.inOut(t / info.dur)) + Math.sin(t * 3) * 0.02 * (1 - prog(t, 1.5, 3)) });
    // plaster dust on his hair, and a few flakes still falling
    const r = rng(9); for (let i = 0; i < 26; i++) { const a = Math.PI * (1.1 + r() * 0.8), R = 300 + r() * 50; circle(g, cx + Math.cos(a) * R, cy - 40 + Math.sin(a) * R, 5 + r() * 7, alpha('#f6efe2', 0.9)); }
    for (let i = 0; i < 10; i++) { const x = cx - 300 + r() * 600, y = ((r() * 600 + t * 160) % 800) + cy - 640; FX.sparkle(g, x, y, 6, '#f6efe2', 0.5); }
    // cartoon stars circling the head (fade by "rule")
    const sa = 1 - prog(t, tRule - 0.6, tRule); for (let i = 0; i < 5; i++) { const a = t * 3.2 + i * 1.26; FX.sparkle(g, cx + Math.cos(a) * 360, cy - 360 + Math.sin(a) * 70, 26, i % 2 ? '#ffd84a' : '#ffffff', 0.95 * sa); }
  });
  atmos(g, t, cam, { color: '#ffe2b8', far: 22, near: 8 });
} });

// ===================================================================================================
// s003 — "every day, your jump doubles."  INSERT: the DAY counter is born on the bedroom wall: 00 -> DAY 01 on "every" (tick), a gold x2 stamp on "doubles".
registerShot('s003', { draw(g, t, info) {
  const st = info.shot.start, tEv = sw('every', st, 0.15), tDb = sw('doubles', st, 1.19);
  const cam = camMove(t, info.dur, { z: [1.04, 1.1], x: [-140, -110] });
  blurLayer(g, 9, (c) => apartment(c, t, cam, { mood: 'day', power: 1 }), null, 1); veil(g, '#120a14', 0.5);
  glow(g, E.W * 0.1, E.H * 0.3, 900, '#ffcf8a', 0.22);
  const z = lerp(1.0, 1.06, ease.inOut(t / info.dur)); g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  const DC = dayCounter(g, t, { x: E.W * 0.56, y: E.H * 0.47, s: 1.45, keys: [[0, 0], [tEv, 1]] });
  const p = ease.outBack(prog(t, tDb, tDb + 0.35)); if (p > 0.01) { g.save(); g.translate(E.W * 0.83, E.H * 0.25); g.rotate(-0.18); g.scale(p, p);
    circle(g, 0, 0, 120, alpha('#1a1020', 0.85)); g.strokeStyle = '#f2c21a'; g.lineWidth = 10; g.beginPath(); g.arc(0, 0, 108, 0, Math.PI * 2); g.stroke();
    text(g, 'x2', 0, 6, { size: 120, color: '#f2c21a', font: FONTS.title, weight: 700, stroke: 10, strokeColor: '#1a1020', glow: 24, glowColor: alpha('#f2c21a', 0.7) }); g.restore();
    for (let i = 0; i < 6; i++) { const a = i * 1.05 + t; FX.sparkle(g, E.W * 0.83 + Math.cos(a) * 170, E.H * 0.25 + Math.sin(a) * 150, 16, '#ffe9a8', 0.8 * (1 - prog(t, tDb + 0.4, tDb + 1.4))); } }
  g.restore();
  atmos(g, t, cam, { color: '#ffe2b8', far: 26, near: 8 });
} });

// ===================================================================================================
// s004 — "Today, you jump like a normal person. About half a metre."  Bedroom medium: a normal little hop on "jump", MINA in the doorway yawning;
// the height meter is born and reads 0.5 m on "half"; HERO neutral -> smirk on "person".
registerShot('s004', { draw(g, t, info) {
  const st = info.shot.start, tJ = sw('jump', st, 0.67) + 0.1, tP = sw('person', st, 1.71), tH = sw('half', st, 2.73);
  const H = 0.5 * M2U, J = jumpPose(t, tJ, H, { landing: 'soft' }), T = J.times;
  const cam = camMove(t, info.dur, { z: [1.12, 1.16], x: [-220, -140], y: [60, 50] }); { const k = jumpShake(t, T.tL, 8); cam.x += k[0]; cam.y += k[1]; }
  const A = apartment(g, t, cam, { mood: 'day', power: 1 }), GY = A.GY, CX = A.CX, hx = CX - 160;
  layer(g, cam, 0.9, (g) => FX.godRays(g, CX - 760, GY - 760, { count: 6, len: 1400, spread: 0.6, angle: 0.55, color: '#ffe2a8', a: 0.08 }));
  layer(g, cam, 1, (g) => {
    bed(g, CX + 420, GY + 10, t); nightstand(g, CX + 420 - BED_W / 2 - 170, GY + 10, t, 0);
    const yawn = prog(t, 0.6, 1.0) * (1 - prog(t, 1.9, 2.3));
    actor(g, 'MINA', { x: A.pos.doorX + 40, y: GY + 18, s: 2.0, facing: 1, pose: idle(poseAt(t, [[0, 'relaxed'], [0.6, 'cheer'], [2.1, 'relaxed'], [tH, 'think']]), t, 2),
      expr: exprAt(t, [[0, 'sleepy'], [0.6, 'surprised'], [2.1, 'sleepy'], [tH, 'smirk']]), blink: yawn > 0.2 ? true : blinkFlag(t, 2.9, 1), look: lookToward(1, 0.1), rim: SUN, t });
    jumpFX(g, t, J, { x: hx, gy: GY + 14, s: 1.95, landing: 'soft' });
    const expr = exprAt(t, [[0, 'neutral'], [T.t0, 'happy'], [tP, 'smirk']]);
    if (t < T.tc || t > T.tEnd) actor(g, 'HERO', { x: hx, y: GY + 14, s: 1.95, facing: -1, pose: idle(t < T.tc ? POSES.stand : poseAt(t, [[T.tEnd, 'stand'], [tH, 'shrug']]), t, 5), expr, blink: blinkFlag(t, 3.4, 5), look: lookToward(-1, 0.1), rim: SUN, t });
    else jumper(g, 'HERO', J, { x: hx, gy: GY + 14, s: 1.95, facing: -1, expr, blink: blinkFlag(t, 3.4, 5), rim: SUN, t });
  });
  apartmentFg(g, t, cam);
  atmos(g, t, cam, { color: '#ffe2b8', far: 30, near: 10 });
  const mk = ease.out(prog(t, 0.2, 0.6)); heightMeter(g, t, { value: Math.max(0.06, 0.5 * (t < T.t0 ? 0.12 : t > T.tL ? 1 : Math.max(0.12, J.lift / H))), alpha: mk, marks: [['HALF A METRE', 0.5], ['HOOP', 3.05], ['HIGH JUMP', 2.45]] });
  chip(g, t, { str: '0.5 m', at: tH, x: E.W * 0.36, y: E.H * 0.2, dur: info.dur - 0.05 });
} });

// ===================================================================================================
// s005 — "Tomorrow, one metre. Then two. Then four."  GRAPHIC: the doubling bars grow on "one", "two", "four" (gold numbers, x2 hops),
// a little HERO stands on the newest bar. Navy blueprint board, slow pull back.
const BOARD = (g, t) => { backdrop(g, ['#0d1430', '#18224a', '#232a58']); g.strokeStyle = alpha('#9fc8ff', 0.08); g.lineWidth = 2;
  for (let x = -60 + (t * 8) % 60; x < E.W; x += 60) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, E.H); g.stroke(); } for (let y = 0; y < E.H; y += 60) { g.beginPath(); g.moveTo(0, y); g.lineTo(E.W, y); g.stroke(); }
  glow(g, E.W * 0.75, E.H * 0.2, 800, '#ffcf8a', 0.12); };
function barTop(o, i) { const vals = o.values, n = vals.length + (o.runaway ? 1 : 0), gap = o.w / n, bw = gap * 0.56, max = (o.max ?? vals[vals.length - 1]) * 1.18; return [o.x + gap * i + gap / 2 - 0 * bw, o.y - (vals[i] / max) * o.h]; }
registerShot('s005', { draw(g, t, info) {
  const st = info.shot.start, tOne = sw('one', st, 0.43), tTwo = sw('two', st, 1.59), tFour = sw('four', st, 2.33);
  BOARD(g, t);
  const z = lerp(1.1, 1.0, ease.inOut(t / info.dur)), dx = Math.sin(t * 0.6) * 10; g.save(); g.translate(E.W / 2 + dx, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  const per = (tFour - tOne) / 2, o = { x: E.W * 0.16, y: E.H * 0.84, w: E.W * 0.62, h: E.H * 0.6, values: [0.5, 1, 2, 4], start: tOne - per, per, unit: 'm' };
  doublingGraph(g, t, o);
  const idx = t < tOne ? 0 : t < tTwo ? 1 : t < tFour ? 2 : 3, tIdx = [0, tOne, tTwo, tFour][idx], pop = ease.outBack(prog(t, tIdx + 0.15, tIdx + 0.45));
  const [bx, by] = barTop(o, idx);
  if (idx === 0 || pop > 0.05) actor(g, 'HERO', { x: bx, y: by - 4, s: 0.55 * (idx === 0 ? 1 : pop), facing: 1, pose: idle(idx === 3 ? POSES.cheer : POSES.stand, t, 2), expr: idx === 3 ? 'joy' : 'smirk', blink: blinkFlag(t, 3.2, 2), rim: { color: '#ffd59a', dir: [0.6, -0.8] }, t });
  g.restore();
  FX.dust(g, t * 0.5, { count: 24, color: '#9fc8ff', a: 0.18, seed: 4 });
} });

// ===================================================================================================
// s006 — "That doesn't sound like much. Until you keep doubling."  The camera keeps pulling back (8, 16, 32 ... the bars squeeze), then on
// "doubling" one RUNAWAY bar shoots off the top of the frame with a gold streak, carrying the little HERO; the height meter flicks off its scale.
registerShot('s006', { draw(g, t, info) {
  const st = info.shot.start, tUn = sw('until', st, 1.65), tDb = sw('doubling', st, 2.53);
  BOARD(g, t);
  const z = lerp(1.0, 0.86, ease.inOut(prog(t, 0, tDb))), sk = t > tDb ? shake(t * 4, 10 * Math.exp(-(t - tDb) * 4), 4, 5) : [0, 0];
  g.save(); g.translate(E.W / 2 + sk[0], E.H / 2 + sk[1]); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  const vals = [0.5, 1, 2, 4, 8, 16, 32], o = { x: E.W * 0.1, y: E.H * 0.88, w: E.W * 0.74, h: E.H * 0.62, values: vals, start: -0.3 - 3 * 0.25, per: 0.25, unit: 'm', runaway: true, runAt: tDb, runText: 'KEEP DOUBLING' };
  doublingGraph(g, t, o);
  // the little HERO rides the runaway bar out of frame (it sits after the last bar)
  const gap = o.w / (vals.length + 1), rx = o.x + gap * vals.length + gap / 2, up = ease.in(prog(t, tDb, tDb + 0.9)), ry = lerp(o.y - o.h * 0.9, -900, up);
  if (t < tDb + 0.9) actor(g, 'HERO', { x: rx, y: t < tDb ? o.y - 4 : ry, s: 0.5, facing: -1, pose: idle(t < tDb ? (t > tUn ? POSES.ready : POSES.stand) : POSES.cheer, t, 4), expr: t < tUn ? 'neutral' : t < tDb ? 'surprised' : 'joy', blink: blinkFlag(t, 3, 3), rim: { color: '#ffd59a', dir: [0.6, -0.8] }, t });
  if (t > tDb) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = linGrad(g, 0, ry, 0, ry + 900, [alpha('#ffd84a', 0.6), alpha('#ffd84a', 0)]); g.fillRect(rx - 40, ry, 80, 900); g.restore(); }
  g.restore();
  const mk = ease.out(prog(t, 0.2, 0.6)); heightMeter(g, t, { value: t < tDb ? lerp(4, 32, ease.inOut(prog(t, 0.2, tDb))) : lerp(32, 9000, ease.in(prog(t, tDb, tDb + 0.9))), alpha: mk, span: 2.4 });
  FX.dust(g, t * 0.5, { count: 24, color: '#9fc8ff', a: 0.18, seed: 4 }); if (t > tDb) FX.speedLines(g, t, { count: 40, a: 0.16 * (1 - prog(t, tDb + 0.8, tDb + 1.2)), inner: 500 });
} });

// ===================================================================================================
// s007 — "Let's see how far you get. And whether you make it back down."  TITLE: the rooftops at dusk, a huge rising moon,
// HERO silhouetted mid-jump against it (apex hang, hoodie flutter, slow spin); the title pops on "see", the DAY counter small under it.
registerShot('s007', { draw(g, t, info) {
  const st = info.shot.start, tSee = sw('see', st, 0.45), tBack = sw('back', st, 2.63);
  const cam = camMove(t, info.dur, { z: [0.66, 0.72], x: [-80, 20], y: [-520, -560] });
  const R = roofs(g, t, cam, { view: 'houses', mood: 'dusk', moon: 1 }), GY = R.GY, CX = R.CX;
  // the hero mid-jump against the moon (screen space, over the moon disc): an apex hang that never ends (hoodie flutter), a slow spin
  const J = jumpPose(t + 2, 0.4, 260, { up: 0.6, hang: 99 }), mx = E.W * 0.6, my = E.H * 0.33 - t * 5;
  glow(g, mx, my - 120, 420, '#fff1d8', 0.25);
  g.save(); g.translate(mx, my); g.rotate(Math.sin(t * 0.6) * 0.14); g.translate(-mx, -my);
  jumper(g, 'HERO', J, { x: mx, gy: my + J.lift * 0.95 + 60, s: 0.95, facing: 1, expr: exprAt(t, [[0, 'joy'], [tBack, 'worried']]), blink: blinkFlag(t, 3.4, 4), rim: { color: '#fff1d8', dir: [0, -1] }, t, speedLines: false });
  g.restore();
  roofsFg(g, t, cam, { view: 'houses' });
  // fireflies over the lawns
  const r = rng(21); for (let i = 0; i < 22; i++) { const x = r() * E.W, y = E.H * (0.55 + r() * 0.4) + Math.sin(t * 1.3 + i) * 14; glow(g, x + Math.sin(t * 0.7 + i) * 20, y, 16, '#ffe48a', 0.4 + 0.4 * Math.sin(t * 3 + i * 2)); }
  veil(g, '#0a0614', 0.18);
  g.fillStyle = linGrad(g, 0, E.H * 0.5, 0, E.H, ['rgba(10,6,20,0)', 'rgba(10,6,20,.62)']); g.fillRect(0, E.H * 0.5, E.W, E.H * 0.5);
  UI.titleCard(g, t - tSee, { lines: ['WHAT IF EVERY DAY,', 'YOUR JUMP DOUBLED?'], dur: info.dur - tSee + 0.4, y: E.H * 0.66 });
  const dk = ease.outBack(prog(t, tSee + 0.5, tSee + 0.9)); if (dk > 0.02) { g.save(); g.globalAlpha = clamp(dk); dayCounter(g, t, { x: E.W * 0.5, y: E.H * 0.86, s: 0.5 * dk, keys: [[0, 1]] }); g.restore(); }
  atmos(g, t, cam, { color: '#ffd8b0', far: 20, near: 8 });
} });
