// B_s027_s032_roofs.js — batch B: day 5 in the neighbourhood (8 m, the 6.31 m pole-vault mark without a pole, the neighbour's roof,
// Mina's ladder, Biscuit the roof expert). Built to QUALITY_BAR.md.
import { E, V, S, registerShot, layer, blurLayer, veil, ease, prog, clamp, lerp, alpha, glow, seg, circle, rr, poly, linGrad, shade, mix, rng } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import { actor, cat } from '../sets/actors.js';
import { roofs, roofsFg, roofsGround } from '../sets/roofs.js';
import { chip } from '../sets/hud.js';
import { blinkFlag, exprAt, poseAt, idle, reaction, walkAlong, lookToward, camMove, atmos } from '../sets/acting.js';
import { jumpPose, jumper, jumpFX, impactFrame, jumpShake, jumpCam } from '../sets/jump.js';
import { U, wt, dayHud, meterHud, ladder, vaultPole, markerPost, handWorld } from './B_lib.js';

const JH = 8 * U;                                                      // day 5: 8 m
const MARKS = [['HIGH JUMP', 2.45], ['HOOP', 3.05], ['POLE VAULT', 6.31], ['5 STOREYS', 16], ['NIAGARA', 51]];
const CX = E.W / 2, GY = () => roofsGround();
const MK = CX - 600, POLE = CX - 120;                                   // marker post + the pole on the lawn
const NEXT = () => ({ x: CX + 1240, y: GY() - 2.8 * U - 22 });          // the neighbour's flat garage roof (walking surface)
// hero sitting on a roof edge, elbows on knees, chin in hands
const chinSit = () => { const P = POSES.sit; return { ...P, eF: [P.kF[0] - 4, P.kF[1] - 14], hF: [P.head[0] + 12, P.head[1] + 30], eB: [P.kB[0] - 6, P.kB[1] - 14], hB: [P.head[0] + 6, P.head[1] + 32] }; };
// satellite dish on the neighbour's roof (spins after the landing)
function dish(g, x, y, spin) { seg(g, [[x, y], [x, y - 70]], 8, '#6a6a78'); g.save(); g.translate(x, y - 90); g.scale(Math.cos(spin), 1); g.fillStyle = '#d8d8e0'; g.beginPath(); g.ellipse(0, 0, 54, 60, 0, 0, 7); g.fill(); g.strokeStyle = '#8a8a98'; g.lineWidth = 4; g.stroke(); seg(g, [[0, 0], [40, -10]], 4, '#6a6a78'); circle(g, 42, -10, 8, '#3a3a48'); g.restore(); }

// s027 — the neighbourhood, day: the pole lies on the lawn, the 6.31 m marker post; DAY 04 -> 05, meter 8 m; he shrugs at the pole and jumps
registerShot('s027', { draw(g, t, info) {
  const tDay = wt(info, 'day', 0.15), tEight = wt(info, 'eight', 0.83), tClear = wt(info, 'clear', 2.03, 1.5), tPV = wt(info, 'pole', 2.47, 2.0);
  const t0 = tClear, J = jumpPose(t, t0, JH, { landing: 'soft' }), T = J.times;
  const tilt = ease.inOut(prog(t, t0 - 0.1, info.dur + 0.3));
  const cam = { z: lerp(0.7, 0.66, tilt), x: -300 + Math.sin(t * 0.5) * 8, y: -262 - 1050 * tilt + Math.cos(t * 0.6) * 4 };
  const R = roofs(g, t, cam, { view: 'houses', mood: 'day', ladder: 0 });
  const hx = POLE - 40;
  layer(g, cam, 1, (g) => {
    vaultPole(g, POLE + 160, R.GY - 4, 1000);
    markerPost(g, MK, R.GY + 30, 6.31, { sub: 'POLE VAULT WR' });
    actor(g, 'MINA', { x: CX - 980, y: R.GY + 24, s: 2.0, facing: 1, pose: idle(poseAt(t, [[0, 'stand'], [t0 + 0.2, 'pointUp']]), t, 1), expr: exprAt(t, [[0, 'smile'], [t0 + 0.2, 'awe']]), blink: blinkFlag(t, 2.9, 1), look: t > t0 ? lookToward(0.5, -1) : lookToward(1, 0.1), rim: R.rim, t });
    jumpFX(g, t, J, { x: hx, gy: R.GY + 24, s: 1.9, landing: 'soft', dustColor: '#c8d8a0' });
    const ground = t < T.tc, base = ground ? idle(poseAt(t, [[0, 'stand'], [tEight + 0.3, 'shrug'], [t0 - 0.6, 'stand']]), t, 3) : null;
    if (ground) actor(g, 'HERO', { x: hx, y: R.GY + 24, s: 1.9, facing: 1, pose: base, expr: exprAt(t, [[0, 'neutral'], [tEight, 'smirk'], [t0 - 0.6, 'determined']]), blink: blinkFlag(t, 3.4, 3), look: t < tEight + 0.3 ? lookToward(0.6, 0.7) : lookToward(1, -0.2), rim: R.rim, t });
    else jumper(g, 'HERO', J, { x: hx, gy: R.GY + 24, s: 1.9, facing: 1, expr: exprAt(t, [[0, 'determined'], [t0, 'joy']]), blink: blinkFlag(t, 3.4, 3), rim: R.rim, t });
  });
  roofsFg(g, t, cam, { view: 'houses' }); atmos(g, t, cam, { color: R.M.key });
  dayHud(g, t, info, 4, 5, tDay);
  meterHud(g, t, info, { v0: 4, v1: 8, t0: tEight, marks: MARKS });
  chip(g, t, { str: 'Pole vault world record', at: tPV, x: E.W * 0.34, y: E.H * 0.9, dur: info.dur - 0.05 });
} });

// s028 — SOARING past the marker: follow cam, the gold 6.31 m plate slides past on "six", chip "No pole" on "without"
registerShot('s028', { draw(g, t, info) {
  const tWith = wt(info, 'without', 1.35);
  const t0 = -0.15, J = jumpPose(t, t0, JH, {}), hx = POLE - 40;
  const cam = jumpCam(t, t0, JH, { z: 0.92, x: -380, y: -170, follow: 0.96, lag: 0.16, zoomOut: 0.08, shake: 0 });
  const R = roofs(g, t, cam, { view: 'houses', mood: 'day', ladder: 0 });
  layer(g, cam, 1, (g) => {
    vaultPole(g, POLE + 160, R.GY - 4, 1000);
    markerPost(g, MK, R.GY + 30, 6.31, { sub: 'POLE VAULT WR' });
    jumpFX(g, t, J, { x: hx, gy: R.GY + 24, s: 1.9, landing: 'soft', dustColor: '#c8d8a0' });
    jumper(g, 'HERO', J, { x: hx, gy: R.GY + 24, s: 1.9, facing: -1, expr: exprAt(t, [[0, 'joy'], [tWith, 'smirk']]), blink: blinkFlag(t, 3.2, 4), look: lookToward(-1, 0.3), rim: R.rim, t });
  });
  // birds startled off the marker line
  layer(g, cam, 1.0, (g) => { const r = rng(9); for (let i = 0; i < 4; i++) { const u = prog(t, 0.3, 2.0), bx = MK + 100 + i * 70 + u * (300 + r() * 200), by = R.GY - 6.31 * U - 80 - u * (200 + r() * 160) + Math.sin(t * 20 + i) * 6, w = Math.sin(t * 22 + i * 2) * 12; seg(g, [[bx - 18, by - w], [bx, by], [bx + 18, by - w]], 4, '#3a3040'); } });
  roofsFg(g, t, cam, { view: 'houses' }); atmos(g, t, cam, { color: R.M.key });
  meterHud(g, t, info, { value: 8 * J.lift / JH, marks: MARKS });
  chip(g, t, { str: 'No pole', at: tWith, x: E.W * 0.3, y: E.H * 0.86, dur: info.dur - 0.05, tone: 'coral' });
} });

// s029 — ROOF LANDING on the neighbour's flat garage roof on "land": thud, gravel jumps, the dish spins, he wobbles and looks down
registerShot('s029', { draw(g, t, info) {
  const tLand = wt(info, 'land', 0.43), tRoof = wt(info, 'roof', 1.49, 1.0), opt = { up: 1.64, hang: 0.3, down: 0.9, landing: 'thud', recover: 'stumble' };
  const t0 = tLand - (opt.up + opt.hang + opt.down), H = JH - 2.8 * U, J = jumpPose(t, t0, H, opt), T = J.times, N = NEXT(), hx = N.x - 90;
  const cam = jumpCam(t, t0, H, { ...opt, z: 1.0, x: N.x - CX - 120, y: N.y - 760, follow: 0.5, lag: 0.02, zoomOut: 0.04, shake: 22 });
  const R = roofs(g, t, cam, { view: 'houses', mood: 'day', ladder: 0 });
  layer(g, cam, 1, (g) => {
    dish(g, N.x + 180, N.y + 4, t > T.tL ? (t - T.tL) * 14 * Math.exp(-(t - T.tL) * 1.2) : 0);
    // a vent + a coiled hose + a deck chair on the garage roof
    rr(g, N.x - 230, N.y - 70, 60, 74, 6); g.fillStyle = '#7a7a88'; g.fill(); seg(g, [[N.x - 236, N.y - 70], [N.x - 164, N.y - 70]], 8, '#5a5a68');
    g.strokeStyle = '#2f8a4a'; g.lineWidth = 7; for (let i = 0; i < 3; i++) { g.beginPath(); g.ellipse(N.x + 60, N.y - 8, 34 - i * 8, 10 - i * 2, 0, 0, 7); g.stroke(); }
    // gravel / tile chips bounce up from the landing
    if (t > T.tL) { const r = rng(4), u = t - T.tL; for (let i = 0; i < 12; i++) { const vx = (r() - 0.5) * 700, vy = -(300 + r() * 400), px = hx + vx * u, py = N.y + vy * u + 1400 * u * u; if (py < N.y + 4) { g.save(); g.translate(px, py); g.rotate(u * 10 + i); g.fillStyle = i % 2 ? '#8a5a4a' : '#6a6a78'; g.fillRect(-9, -5, 18, 10); g.restore(); } } }
    jumpFX(g, t, J, { x: hx, gy: N.y, s: 1.9, landing: 'thud', launchDust: false, dustColor: '#b8b8c0' });
    jumper(g, 'HERO', J, { x: hx, gy: N.y, s: 1.9, facing: 1, expr: exprAt(t, [[0, 'joy'], [T.tL - 0.3, 'surprised'], [T.tL, 'shocked'], [tRoof, 'worried']]), blink: blinkFlag(t, 3.4, 7), look: t > T.tL + 0.5 ? lookToward(-0.5, 1) : lookToward(1, 0.4), rim: R.rim, t });
  });
  roofsFg(g, t, cam, { view: 'houses' }); atmos(g, t, cam, { color: R.M.key });
  impactFrame(g, t, T.tL, { x: E.W * 0.5, y: E.H * 0.72 });
  meterHud(g, t, info, { value: 2.8 + (8 - 2.8) * J.lift / H, marks: MARKS });
} });

// s030 — WIDE gag: Mina marches in with a ladder twice her size and swings it against the garage on "ladder"; he waits, chin in hands
registerShot('s030', { draw(g, t, info) {
  const tLad = wt(info, 'ladder', 0.85), N = NEXT();
  const cam = camMove(t, info.dur, { z: [0.62, 0.64], x: [N.x - CX - 520, N.x - CX - 480], y: [-300, -310] });
  const R = roofs(g, t, cam, { view: 'houses', mood: 'day', ladder: 0 });
  const edge = N.x - 250, footX = edge - 260, mx = lerp(N.x - 1300, footX - 120, ease.out(prog(t, 0, tLad)));
  layer(g, cam, 1, (g) => {
    // ladder: carried over her shoulder (bobbing), then swung up against the garage wall
    const sw = ease.outBack(prog(t, tLad, tLad + 0.35)), bob = Math.sin(t * 14) * 8 * (1 - sw);
    const carryA = [mx - 300, R.GY - 240 + bob], carryB = [mx + 420, R.GY - 300 + bob], leanA = [footX, R.GY + 30], leanB = [edge + 10, N.y + 10];
    const walking = t < tLad, wk = walkAlong(mx, 2.0, { kid: true, facing: 1 });
    const mp = walking ? { ...wk.pose, eF: [14, -150], hF: [26, -186], eB: [-8, -150], hB: [4, -188] } : idle(poseAt(t, [[0, 'handsUp'], [tLad + 0.35, 'stand']]), t, 1);
    ladder(g, lerp(carryA[0], leanA[0], sw), lerp(carryA[1], leanA[1], sw), lerp(carryB[0], leanB[0], sw), lerp(carryB[1], leanB[1], sw), { w: 90 });
    actor(g, 'MINA', { x: mx, y: R.GY + 24, s: 2.0, facing: 1, pose: mp, expr: exprAt(t, [[0, 'determined'], [tLad + 0.2, 'smile']]), blink: blinkFlag(t, 2.9, 1), look: lookToward(1, -0.4), rim: R.rim, t });
    actor(g, 'HERO', { x: edge + 40, y: N.y + 70, s: 1.9, facing: -1, pose: idle(chinSit(), t, 5), expr: exprAt(t, [[0, 'neutral'], [tLad + 0.15, 'smile']]), blink: blinkFlag(t, 3.4, 5), look: lookToward(-1, 0.5), rim: R.rim, t });
    cat(g, { x: N.x + 160, y: N.y + 2, s: 1.6, facing: -1, pose: 'loaf', t, rim: R.rim, eyes: 'auto' });
  });
  roofsFg(g, t, cam, { view: 'houses' }); atmos(g, t, cam, { color: R.M.key });
} });

// s031 — BISCUIT INSERT: the cat in the lit window, judging; offended half-lids on "unimpressed", slow blink, the hero reflected in the glass
registerShot('s031', { draw(g, t, info) {
  const tUn = wt(info, 'unimpressed', 2.17), tWin = wt(info, 'window', 1.27);
  const k = ease.inOut(t / info.dur), z = lerp(1.0, 1.08, k), px = lerp(-20, 20, k);
  const wx = E.W * 0.43, wy = E.H * 0.47, ww = 760, wh = 660;
  const scene = (d, fn) => { g.save(); g.translate(E.W / 2, E.H / 2); const zz = 1 + (z - 1) * d; g.scale(zz, zz); g.translate(-E.W / 2 - px * d, -E.H / 2); fn(); g.restore(); };
  // wall (brick-ish render), ivy, downpipe
  scene(1, () => {
    g.fillStyle = linGrad(g, 0, -200, 0, E.H + 200, [shade('#d8b890', -0.12), shade('#d8b890', -0.42)]); g.fillRect(-200, -200, E.W + 400, E.H + 400);
    const r = rng(3); for (let y = -200; y < E.H + 200; y += 46) for (let x = -200 + (Math.floor(y / 46) % 2) * 60; x < E.W + 200; x += 120) { g.strokeStyle = alpha('#5a3a2a', 0.12 + r() * 0.06); g.lineWidth = 3; g.strokeRect(x, y, 120, 46); }
    seg(g, [[E.W * 0.86, -200], [E.W * 0.86, E.H + 200]], 34, shade('#8a8a98', -0.3)); for (const y of [E.H * 0.2, E.H * 0.6]) rr(g, E.W * 0.86 - 26, y, 52, 22, 6), (g.fillStyle = shade('#8a8a98', -0.45), g.fill());
    for (let i = 0; i < 26; i++) { const a = i * 2.3, lx = E.W * 0.05 + Math.sin(a) * 50 + Math.sin(i * 0.4) * 40, ly = E.H * 0.04 + i * 38 + Math.cos(a) * 14; circle(g, lx + Math.sin(t * 1.5 + i) * 3, ly, 22 + (i * 7) % 14, shade('#3a8a5a', -0.2 - (i % 3) * 0.1)); }
  });
  // interior seen through the glass (deeper layer): warm lamp, bookshelf, curtain
  scene(0.8, () => {
    g.save(); rr(g, wx - ww / 2, wy - wh / 2, ww, wh, 10); g.clip();
    g.fillStyle = linGrad(g, 0, wy - wh / 2, 0, wy + wh / 2, ['#7a5a40', '#3a2a24']); g.fillRect(wx - ww, wy - wh, ww * 2, wh * 2);
    glow(g, wx - 220, wy - 120, 380, '#ffc878', 0.55); circle(g, wx - 220, wy - 120, 34, '#fff1d0'); seg(g, [[wx - 220, wy - 86], [wx - 220, wy + 200]], 8, '#2a1e1a');
    for (let i = 0; i < 4; i++) { g.fillStyle = '#2a1e1a'; g.fillRect(wx + 120, wy - 250 + i * 120, 260, 10); for (let b = 0; b < 7; b++) { g.fillStyle = ['#c8503a', '#3a7aa0', '#d8a830', '#6a8a5a'][(b + i) % 4]; g.fillRect(wx + 130 + b * 34, wy - 330 + i * 120 + (b % 2) * 10, 26, 80 - (b % 2) * 10); } }
    g.restore();
  });
  scene(1, () => {
    // window frame + sill + curtains
    g.fillStyle = alpha('#c8503a', 0.85); g.beginPath(); g.moveTo(wx - ww / 2, wy - wh / 2); g.quadraticCurveTo(wx - ww / 2 + 150 + Math.sin(t) * 6, wy, wx - ww / 2 + 90, wy + wh / 2); g.lineTo(wx - ww / 2, wy + wh / 2); g.fill();
    g.beginPath(); g.moveTo(wx + ww / 2, wy - wh / 2); g.quadraticCurveTo(wx + ww / 2 - 150 + Math.sin(t + 1) * 6, wy, wx + ww / 2 - 90, wy + wh / 2); g.lineTo(wx + ww / 2, wy + wh / 2); g.fill();
    // Biscuit on the inner sill: tail flick, offended half-lids on "unimpressed", a slow blink before it
    const eyes = t > tUn ? 'offended' : (t > tWin + 0.1 && t < tWin + 0.45) ? 'blink' : 'auto';
    cat(g, { x: wx - 40, y: wy + wh / 2 - 6, s: 3.3, facing: 1, pose: 'sit', t, eyes, rim: { color: '#ffc878', dir: [-0.8, -0.5] } });
    // glass: sky reflection streaks + the hero on the roof reflected
    g.save(); rr(g, wx - ww / 2, wy - wh / 2, ww, wh, 10); g.clip();
    g.fillStyle = alpha('#cfe4ff', 0.12); g.beginPath(); g.moveTo(wx - ww / 2 + 80, wy - wh / 2); g.lineTo(wx - ww / 2 + 260, wy - wh / 2); g.lineTo(wx - ww / 2 + 60, wy + wh / 2); g.lineTo(wx - ww / 2 - 120, wy + wh / 2); g.fill();
    g.globalAlpha = 0.3; actor(g, 'HERO', { x: wx + 250, y: wy - 60, s: 0.9, facing: -1, pose: idle(chinSit(), t, 5), expr: 'neutral', t }); g.globalAlpha = 1; g.restore();
    const fc = '#f0ece0'; for (const [x0, y0, x1, y1] of [[wx - ww / 2, wy - wh / 2, wx + ww / 2, wy - wh / 2], [wx - ww / 2, wy + wh / 2, wx + ww / 2, wy + wh / 2], [wx - ww / 2, wy - wh / 2, wx - ww / 2, wy + wh / 2], [wx + ww / 2, wy - wh / 2, wx + ww / 2, wy + wh / 2], [wx, wy - wh / 2, wx, wy - wh * 0.1], [wx - ww / 2, wy - wh * 0.1, wx + ww / 2, wy - wh * 0.1]]) seg(g, [[x0, y0], [x1, y1]], 26, fc);
    rr(g, wx - ww / 2 - 50, wy + wh / 2 + 6, ww + 100, 40, 6); g.fillStyle = shade(fc, -0.1); g.fill();
    rr(g, wx + ww / 2 - 170, wy + wh / 2 - 40, 80, 50, 6); g.fillStyle = '#a0583a'; g.fill(); for (let i = 0; i < 5; i++) circle(g, wx + ww / 2 - 130 + (i - 2) * 16, wy + wh / 2 - 60 - (i % 2) * 18, 20, shade('#3a8a5a', -0.1 * i));   // pot plant outside
  });
  scene(1.3, () => { for (let i = 0; i < 5; i++) circle(g, E.W * 0.95 + Math.sin(t + i) * 10, E.H * (0.1 + i * 0.22), 90, alpha(shade('#3a8a5a', -0.4), 0.85)); });   // foreground leaves
  atmos(g, t, { z, x: px, y: 0 }, { color: '#ffd8a8', far: 16, near: 6 });
  chip(g, t, { str: 'Deeply unimpressed', at: tUn + 0.15, x: E.W * 0.76, y: E.H * 0.86, dur: info.dur - 0.05, tone: 'coral' });
} });

// s032 — Biscuit shows him how it's done: one elegant bound from the window ledge to the neighbour's roof, lands silently, sits, washes a paw
registerShot('s032', { draw(g, t, info) {
  const tJump = wt(info, 'been', 0.43) + 0.16, tLand = tJump + 1.2, tWhole = wt(info, 'whole', 1.83, 1.2), N = NEXT();
  const sill = [CX + 136, GY() - 539], land = [N.x - 20, N.y + 2];
  const k = prog(t, tJump, tLand), ke = ease.inOut(k), cx = lerp(sill[0], land[0], ke), cy = lerp(sill[1], land[1], ke) - Math.sin(k * Math.PI) * 420;
  const camX = lerp(sill[0] + 200, land[0] - 180, ease.inOut(prog(t, tJump - 0.2, tLand + 0.3))) - CX, camY = lerp(sill[1] - 760, land[1] - 700, ease.inOut(prog(t, tJump - 0.2, tLand + 0.3))) - Math.sin(k * Math.PI) * 140;
  const cam = { z: 0.86, x: camX, y: camY + Math.cos(t * 0.6) * 4, r: 0.004 * Math.sin(t * 0.4) };
  const R = roofs(g, t, cam, { view: 'houses', mood: 'day', ladder: 0 });
  layer(g, cam, 1, (g) => {
    ladder(g, N.x - 510, R.GY + 30, N.x - 240, N.y + 10, { w: 90 });
    actor(g, 'HERO', { x: N.x - 210, y: N.y + 70, s: 1.9, facing: 1, pose: idle(t < tLand + 0.3 ? chinSit() : { ...POSES.sit }, t, 5), expr: exprAt(t, [[0, 'neutral'], [tLand + 0.2, 'surprised'], [tWhole, 'sheepish']]), blink: blinkFlag(t, 3.4, 5), look: t < tLand ? lookToward(-0.6, -0.4) : lookToward(1, 0.3), rim: R.rim, t });
    // the cat: sit on the sill > crouch > a stretched arc (tail as rudder) > soft landing > sit and wash
    if (t < tJump) cat(g, { x: sill[0], y: sill[1], s: 1.9, facing: 1, pose: 'sit', t, rim: R.rim });
    else if (t < tLand) { const ang = Math.atan2(Math.cos(k * Math.PI) * -1, 2.4) * 0.6; g.save(); g.translate(cx, cy); g.rotate(ang); g.scale(1 + 0.25 * Math.sin(k * Math.PI), 1 - 0.12 * Math.sin(k * Math.PI)); cat(g, { x: 0, y: 0, s: 1.9, facing: 1, pose: 'stand', walk: 0.6, t, rim: R.rim }); g.restore();
      for (let i = 1; i <= 4; i++) { const kk = clamp(k - i * 0.05), x2 = lerp(sill[0], land[0], ease.inOut(kk)), y2 = lerp(sill[1], land[1], ease.inOut(kk)) - Math.sin(kk * Math.PI) * 420; circle(g, x2, y2 - 40, 26 - i * 4, alpha('#ffffff', 0.12 - i * 0.02)); } }
    else { const wash = t > tLand + 0.5, bob = wash ? Math.sin(t * 9) * 4 : 0; g.save(); g.translate(0, bob); cat(g, { x: land[0], y: land[1] - bob, s: 1.9, facing: -1, pose: 'sit', t, eyes: wash ? 'blink' : 'auto', rim: R.rim }); g.restore(); }
  });
  roofsFg(g, t, cam, { view: 'houses' }); atmos(g, t, cam, { color: R.M.key });
  chip(g, t, { str: 'Rooftop pro since kittenhood', at: tWhole, x: E.W * 0.32, y: E.H * 0.88, dur: info.dur - 0.05 });
} });
