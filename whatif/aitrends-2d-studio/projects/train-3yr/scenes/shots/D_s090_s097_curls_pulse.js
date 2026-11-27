// D_s090_s097_curls_pulse.js — ep 3 batch D: 700 kcal and no cereal (the box comes down), the drain weeks later, curls back
// (winter -> spring wipe), "Unchanged.", Dev almost disappointed, YEAR 3 pulse on the sofa, "It's slow. Really slow."
import { E, V, S, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, glow, alpha, rr, seg, circle, poly, text, measure, FONTS, rng, linGrad, shade, talkAmount } from '/engine/core.js';
import { POSES, headPos } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { actor, cat } from '../sets/actors.js';
import { park, parkFg } from '../sets/park.js';
import { home3, home3Fg, cerealBox, timeSkip } from '../sets/home3.js';
import { apartment, apartmentFg } from '../sets/apartment.js';
import { stopwatch } from '../sets/train.js';
import { chip } from '../sets/hud.js';
import { faceAt, FACE } from '../sets/faces.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, reaction, lookToward, camMove, atmos, EXTRA } from '../sets/acting.js';
import { shotWord, heroFace, devFace, jogPose } from './D_lib.js';

const cobweb = (g, x, y, s) => { g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = alpha('#f4f4f8', 0.75); g.lineWidth = 1.5; for (let i = 0; i < 6; i++) { const a = Math.PI * (0.5 + i * 0.1); g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * 90, Math.sin(a) * 90); g.stroke(); } for (let r = 20; r <= 80; r += 20) { g.beginPath(); for (let i = 0; i < 6; i++) { const a = Math.PI * (0.5 + i * 0.1), rr2 = r + (i % 2) * 4; i ? g.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2) : g.moveTo(Math.cos(a) * rr2, Math.sin(a) * rr2); } g.stroke(); } g.restore(); };

// s090 — "Seven hundred calories a day, and no cereal."  HERO at the table (700 kcal chip); tilt up to the cereal box on the fridge (cobwebs); MINA freezes, guilty
registerShot('s090', { draw(g, t, info) {
  const st = info.shot.start, tSev = shotWord('seven', st, 0.15), tNo = shotWord('no', st, 2.43), tilt = ease.inOut(prog(t, tNo - 0.25, tNo + 0.7));
  const base = camMove(t, info.dur, { z: [1.3, 1.33] }), cam = { ...base, x: base.x + lerp(-300, 360, tilt), y: base.y + lerp(70, -170, tilt), z: lerp(1.32, 1.4, tilt) };
  const H = home3(g, t, cam, { room: 'kitchen', mood: 'day', kcal: 1, cereal: 0 }), GY = H.GY, CX = H.CX;
  layer(g, cam, 1, (g) => {
    cerealBox(g, H.pos.cerealX + 40, H.pos.fridgeTop + 4, 0.95, -0.04); cobweb(g, H.pos.cerealX - 30, H.pos.fridgeTop - 200, 1.1); cobweb(g, H.pos.cerealX + 112, H.pos.fridgeTop - 190, -0.8);
    actor(g, 'HERO', { x: H.pos.tableX - 360, y: GY + 6, s: 1.9, facing: 1, pose: idle({ ...POSES.sit, hF: [44, -112] }, t, 2), t, rim: H.rim, expr: exprAt(t, [[0, 'neutral'], [tSev + 0.3, 'sad'], [tNo, 'suspicious']]), blink: blinkFlag(t, 3.2, 2), look: t > tNo ? lookToward(1, -0.7) : lookToward(1, 0.4) });
    actor(g, 'MINA', { x: H.pos.fridgeX - 250, y: GY + 18, s: 2.05, facing: -1, pose: idle(t > tNo + 0.3 ? reaction('sheepish', t, tNo + 0.3) : POSES.relaxed, t, 3), t, rim: H.rim, expr: exprAt(t, [[0, 'neutral'], [tNo + 0.3, 'nervous']]), blink: blinkFlag(t, 2.8, 3), look: t > tNo + 0.3 ? lookToward(-1, -0.3) : lookToward(-1, 0) });
  });
  home3Fg(g, t, cam, { room: 'kitchen' }); atmos(g, t, cam, { color: '#fff4dc', far: 14, near: 4 });
  chip(g, t, { str: '700 kcal / DAY', at: tSev, dur: tNo + 0.2, x: E.W * 0.32, y: E.H * 0.2 });
  chip(g, t, { str: 'NO CEREAL', at: tNo + 0.3, tone: 'coral', x: E.W * 0.82, y: E.H * 0.5 });
} });

// s091 — "That's you. So you eat properly again."  MINA brings the box down and plonks it on the table; a full breakfast pops in on 'eat'
function breakfast(g, x, y, k, t) { if (k <= 0) return; const p = (i) => ease.outBack(clamp(k * 4 - i * 0.6)); const items = [
    (g) => { g.fillStyle = '#f4f1ec'; g.beginPath(); g.ellipse(0, 0, 80, 22, 0, 0, Math.PI); g.fill(); g.fillStyle = '#e8a03a'; g.beginPath(); g.ellipse(0, -2, 70, 14, 0, 0, 7); g.fill(); for (let i = 0; i < 6; i++) circle(g, -40 + i * 16, -6, 7, '#c8782a'); },   // cereal bowl
    (g) => { rr(g, -40, -60, 80, 60, 10); g.fillStyle = '#e8b870'; g.fill(); rr(g, -32, -52, 64, 46, 8); g.fillStyle = '#f8e0a8'; g.fill(); },                                                                                // toast
    (g) => { circle(g, -20, -20, 22, '#d4262e'); circle(g, 16, -18, 20, '#f2c230'); seg(g, [[-20, -42], [-16, -50]], 3, '#5a3a1a'); },                                                                                       // fruit
    (g) => { rr(g, -22, -90, 44, 90, 6); g.fillStyle = alpha('#ffffff', 0.9); g.fill(); g.fillStyle = alpha('#bfe4ff', 0.6); g.fillRect(-22, -90, 44, 14); } ];                                                              // milk
  items.forEach((fn, i) => { const s = p(i); if (s <= 0.02) return; g.save(); g.translate(x + [-220, -60, 70, 190][i], y); g.scale(s, s); fn(g); g.restore(); }); }
registerShot('s091', { draw(g, t, info) {
  const st = info.shot.start, tYou = shotWord('you', st, 0.6), tEat = shotWord('eat', st, 1.85);
  const cam = camMove(t, info.dur, { z: [1.32, 1.39], x: [-160, -130], y: [60, 66] });
  const H = home3(g, t, cam, { room: 'kitchen', mood: 'dawn', plate: 0, cereal: 0, lights: 0.8 }), GY = H.GY, CX = H.CX, tx = H.pos.tableX, tt = H.pos.tableTop;
  layer(g, cam, 1, (g) => {
    const bk = ease.inOut(prog(t, 0.05, 0.75)), bx = lerp(H.pos.cerealX + 40, tx + 140, bk), by = lerp(H.pos.fridgeTop + 4, tt - 14, bk) - Math.sin(bk * Math.PI) * 160;
    const hp = t > tEat ? { ...POSES.sit, eF: [30, -150], hF: [24, -190 + Math.abs(Math.sin((t - tEat) * 5)) * 30] } : { ...POSES.sit, hF: [44, -112] };
    actor(g, 'HERO', { x: tx - 360, y: GY + 6, s: 1.9, facing: 1, pose: idle(hp, t, 2), t, rim: H.rim, expr: exprAt(t, [[0, 'sheepish'], [tEat, 'joy']]), blink: blinkFlag(t, 3.2, 2), look: t < 0.8 ? lookToward(1, -0.5) : lookToward(1, 0.4) });
    const sit = ease.inOut(prog(t, 0.9, 1.6)), mx = lerp(H.pos.fridgeX - 60, tx + 380, sit), mp = sit < 1 ? (bk < 1 ? { ...POSES.reach, eF: [26, -200], hF: [40, -240] } : POSES.stand) : { ...POSES.sit, eF: [30, -120], hF: [44 + Math.sin(t * 9) * 4, -116] };
    actor(g, 'MINA', { x: mx, y: GY + 16 + sit * 6, s: 2.05, facing: -1, pose: idle(mp, t, 3), t, rim: H.rim, expr: exprAt(t, [[0, 'determined'], [1.2, 'smile']]), blink: blinkFlag(t, 2.8, 3), look: sit >= 1 ? lookToward(-0.3, 0.7) : lookToward(-1, -0.2) });
    if (sit >= 1) { const k = 2.05 * 0.72; g.save(); g.translate(mx - 44 * k, GY + 16 - 112 * k); rr(g, -40, -10, 80, 20, 3); g.fillStyle = '#d4262e'; g.fill(); g.fillStyle = '#f8f0dc'; g.fillRect(-36, -8, 72, 14); g.restore(); }
    breakfast(g, tx - 40, tt - 14, prog(t, tEat - 0.2, tEat + 0.6), t);
    cerealBox(g, bx, by, 0.8, -0.04 + bk * 0.04);
    if (bk >= 1 && t < 1.2) for (let i = 0; i < 5; i++) circle(g, tx + 140 + (i - 2) * 30, tt - 20 - (t - 0.75) * 120 * (1 + i % 2), 6 * (1 - (t - 0.75) * 2), alpha('#f4efe6', 0.8));
  });
  home3Fg(g, t, cam, { room: 'kitchen' }); atmos(g, t, cam, { color: '#ffd8b0', far: 14, near: 4 });
} });

// s092 — DRAIN INSERT, weeks later: "Dermatologists say this shedding is usually temporary,"  only a couple of hairs, water swirling, TEMPORARY
registerShot('s092', { draw(g, t, info) {
  const st = info.shot.start, tTemp = shotWord('temporary', st, 2.49), U = S().ui;
  const cam0 = camMove(t, info.dur, { z: [5.4, 5.8] }), H0 = { x: 450, y: E.H * 0.8 - 26 - E.H / 2 };
  const cam = { ...cam0, x: H0.x + cam0.x * 0.3, y: H0.y + cam0.y * 0.3 };
  const H = home3(g, t, cam, { room: 'bathroom', mood: 'day', hair: 0, drip: false });
  layer(g, cam, 1, (g) => { const dx = H.pos.drainX, dy = H.pos.drainY;
    g.save(); g.translate(dx, dy); g.scale(1, 0.27); g.strokeStyle = alpha('#cfe8f8', 0.6); g.lineWidth = 3;                                              // swirl
    for (let i = 0; i < 4; i++) { g.beginPath(); for (let j = 0; j <= 40; j++) { const u = j / 40, a = u * 5 + t * 4 + i * 1.6, r = 30 + (1 - u) * 90; j ? g.lineTo(Math.cos(a) * r, Math.sin(a) * r) : g.moveTo(Math.cos(a) * r, Math.sin(a) * r); } g.stroke(); } g.restore();
    g.strokeStyle = '#1a1418'; g.lineWidth = 1.2; g.lineCap = 'round'; for (const [ox, a] of [[-14, 0.3], [10, -0.6]]) { g.beginPath(); g.moveTo(dx + ox, dy - 2); g.bezierCurveTo(dx + ox + 10, dy - 12 + a * 10, dx + ox + 18, dy + 6, dx + ox + 26 + Math.sin(t * 3) * 2, dy - 4); g.stroke(); }
    const sp = 0.6 + 0.4 * Math.sin(t * 3); FX.sparkle(g, dx + 18, dy - 6, 10 * sp, '#ffffff', 0.9); for (let i = 0; i < 3; i++) { const u = (t * 0.7 + i / 3) % 1; circle(g, dx - 40 + i * 30, dy - 30 + u * 20, 3, alpha('#bfe4ff', 1 - u)); } });
  atmos(g, t, { z: 1 }, { color: '#ffffff', far: 10, near: 3 });
  chip(g, t, { str: 'TEMPORARY', at: tTemp, y: E.H * 0.2 });
  chip(g, t, { str: 'WEEKS LATER', at: 0.2, dur: 1.6, tone: 'blue', x: E.W * 0.22, y: E.H * 0.2 });
} });

// s093 — "and within about six to nine months, your curls are back."  winter -> spring wipe on the river path; HERO runs, curls bounce; 6-9 MONTHS
registerShot('s093', { draw(g, t, info) {
  const st = info.shot.start, tSix = shotWord('six', st, 1.17), tCurls = shotWord('curls', st, 2.67), v = 300, U = S().ui;
  const hx = E.W / 2 + t * v, cam = { z: 0.95, x: t * v - 140 + Math.sin(t * 0.6) * 8, y: -120 + Math.cos(t * 0.5) * 4 };
  const wipe = ease.inOut(prog(t, 0.3, 1.6)), wx = lerp(-200, E.W + 200, wipe);
  park(g, t, cam, { season: 'winter', mood: 'day', snow: 0.5, km: 7 });
  g.save(); g.beginPath(); g.moveTo(-200, 0); g.lineTo(wx + 160, 0); g.lineTo(wx - 160, E.H); g.lineTo(-200, E.H); g.closePath(); g.clip(); const P = park(g, t, cam, { season: 'spring', mood: 'day', km: 7 }); g.restore();
  if (wipe > 0 && wipe < 1) { g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = alpha('#fff4dc', 0.7); g.lineWidth = 10; g.beginPath(); g.moveTo(wx + 160, 0); g.lineTo(wx - 160, E.H); g.stroke(); g.restore(); }
  layer(g, cam, 1, (g) => { const pose = jogPose(hx, 1.95), bounce = t > tCurls ? Math.abs(Math.sin((t - tCurls) * 10)) * Math.exp(-(t - tCurls) * 2) * 10 : 0, p2 = { ...pose, head: [pose.head[0], pose.head[1] - bounce] };
    actor(g, 'HERO', { x: hx, y: P.GY + 22, s: 1.95, facing: 1, pose: p2, expr: exprAt(t, [[0, 'determined'], [tSix, 'smile'], [tCurls, 'joy']]), blink: blinkFlag(t, 3.3, 3), look: lookToward(1, -0.1), rim: P.rim, t });
    if (t > tCurls) { const [x, y, r] = headPos({ x: hx, y: P.GY + 22, s: 1.95, facing: 1, pose: p2 }); for (let i = 0; i < 4; i++) { const ph = clamp((t - tCurls) * 1.5 - i * 0.15); FX.sparkle(g, x + Math.cos(i * 1.7) * r * 1.4, y - r * 0.8 + Math.sin(i * 2.3) * r * 0.6, 18 * Math.sin(ph * Math.PI), '#ffe8b0', 0.95); } } });
  parkFg(g, t, cam, { season: wipe > 0.6 ? 'spring' : 'winter', snow: wipe > 0.6 ? 0 : 0.5 }); atmos(g, t, cam, { color: '#fff4dc', far: 12, near: 4 });
  chip(g, t, { str: '6-9 MONTHS', at: tSix, x: E.W * 0.3, y: E.H * 0.2 });
} });

// s094 — HAIR LOG INSERT: "Mina writes one word in the Hair Log: "Unchanged.""  rows of 6.0 cm; MINA writes UNCHANGED., gold underline; she mouths it
registerShot('s094', { draw(g, t, info) {
  const st = info.shot.start, tUn = shotWord('unchanged', st, 2.09), U = S().ui, z = lerp(1.0, 1.05, ease.inOut(t / info.dur));
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.rotate(-0.03); g.translate(-E.W / 2, -E.H / 2);
  g.fillStyle = '#2a1c18'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  const x0 = E.W * 0.3, y0 = 60, W = E.W * 0.62, H = E.H - 120; rr(g, x0 + 12, y0 + 16, W, H, 10); g.fillStyle = 'rgba(0,0,0,.4)'; g.fill(); rr(g, x0, y0, W, H, 10); g.fillStyle = linGrad(g, 0, y0, 0, y0 + H, ['#fbf4e2', '#efe4c8']); g.fill();
  text(g, 'HAIR LOG', x0 + 60, y0 + 56, { size: 44, color: '#d4262e', font: FONTS.title, weight: 700, align: 'left', spacing: 3 });
  const rows = ['WK 1', 'WK 9', 'MO 3', 'MO 6', 'MO 9', 'YR 1', 'YR 1.5', 'YR 2', 'YR 2.5']; rows.forEach((r, i) => { const ly = y0 + 120 + i * 50; seg(g, [[x0 + 30, ly + 16], [x0 + W - 30, ly + 16]], 1.5, alpha('#8aa8d8', 0.5)); text(g, r, x0 + 60, ly, { size: 30, color: '#4a4650', font: FONTS.title, weight: 600, align: 'left' }); text(g, '6.0 cm', x0 + 260, ly, { size: 30, color: '#2a2630', font: FONTS.title, weight: 700, align: 'left' }); text(g, '✓', x0 + 440, ly, { size: 30, color: '#3f9a4a', font: FONTS.ui, weight: 900, align: 'left' }); });
  const wk = prog(t, tUn - 0.5, tUn + 0.5), wy = y0 + H - 150, ww = 760;
  g.save(); g.beginPath(); g.rect(x0 + 60, wy - 90, ww * wk, 140); g.clip(); text(g, 'UNCHANGED.', x0 + 70, wy, { size: 110, color: '#1a1420', font: FONTS.title, weight: 700, align: 'left', spacing: 2 }); g.restore();
  const uk = ease.out(prog(t, tUn + 0.4, tUn + 0.8)); if (uk > 0) { g.save(); g.strokeStyle = U.gold; g.lineWidth = 10; g.lineCap = 'round'; g.shadowColor = alpha(U.gold, 0.7); g.shadowBlur = 14; g.beginPath(); g.moveTo(x0 + 70, wy + 66); g.lineTo(x0 + 70 + 700 * uk, wy + 60); g.stroke(); g.restore(); }
  // pencil in Mina's hand at the writing point
  const px = x0 + 70 + ww * Math.min(wk, 1) + (uk > 0 ? 700 * uk - ww : 0) * 0, py = wy + (wk < 1 ? Math.sin(t * 30) * 8 : 60);
  g.save(); g.translate(px, py); g.rotate(-0.6); rr(g, 0, -9, 300, 18, 4); g.fillStyle = '#f2c230'; g.fill(); poly(g, [[0, -9], [-24, 0], [0, 9]], '#e8c89a'); g.restore(); circle(g, px + 150, py + 110, 46, S().ink);
  g.restore();
  // over-the-shoulder MINA, mouthing the word
  const talk = talkAmount(info.globalT, st + tUn - 0.05, st + tUn + 0.7);
  layer(g, { z: 1 }, 1, (g) => actor(g, 'MINA', { x: E.W * 0.12, y: E.H * 1.25, s: 4.2, facing: 1, pose: idle({ ...POSES.holdFront, head: [14, -200] }, t, 3), t, rim: { color: '#ffd8a0', dir: [0.8, -0.5] }, expr: exprAt(t, [[0, 'neutral'], [tUn, 'determined'], [tUn + 0.8, 'smile']]), talk, blink: blinkFlag(t, 2.8, 3), look: lookToward(1, 0.6), shadow: false }));
  glow(g, E.W * 0.85, E.H * 0.05, 700, '#ffcf8a', 0.25);
  FX.dust(g, t, { count: 12, color: '#fff4dc', a: 0.12, seed: 5 });
} });

// s095 — GIANT FACE DEV: "Dev looks almost disappointed."  phone lowered, the REC dot stops on 'disappointed'; neutral -> worried -> sheepish
registerShot('s095', { draw(g, t, info) {
  const st = info.shot.start, tDis = shotWord('disappointed', st, 0.77), U = S().ui;
  blurLayer(g, 16, (g) => park(g, t, { z: 1.2, x: 200, y: -60 }, { season: 'spring', mood: 'day', km: 8 }), null, 1); veil(g, '#101828', 0.2);
  const cx = E.W * 0.47, cy = E.H * 0.55, r = 320, tilt = lerp(0.02, -0.04, ease.inOut(t / info.dur));
  const f0 = faceAt(t, [[0, 'neutral'], [tDis, 'worried'], [tDis + 1.0, 'sheepish']], 0.25), f = { ...f0, w: f0.w * 0.7, smile: Math.min(f0.smile, -0.1) };
  devFace(g, cx, cy, r, { f, rimSide: 1, rimColor: '#fff1d6', glint: '#ffe8c0', blink: blinkAmt(t, 3.1, 2), breath: Math.sin(t * 1.4), tilt });
  // the phone, lowered at the bottom right; REC dot stops
  g.save(); g.translate(E.W * 0.82, E.H * 0.92); g.rotate(-0.3); rr(g, -150, -90, 300, 180, 26); g.fillStyle = '#16121c'; g.fill(); rr(g, -136, -76, 272, 152, 18); g.fillStyle = '#2a3a4a'; g.fill();
  if (t < tDis) { if (Math.floor(t * 1.6) % 2 === 0) circle(g, -100, -50, 12, '#ff3b30'); text(g, 'REC', -70, -48, { size: 22, color: '#fff', font: FONTS.ui, weight: 900, align: 'left' }); }
  else { rr(g, -112, -62, 24, 24, 4); g.fillStyle = '#a8a2b4'; g.fill(); text(g, 'STOPPED', -76, -48, { size: 22, color: '#a8a2b4', font: FONTS.ui, weight: 900, align: 'left' }); }
  g.restore();
  atmos(g, t, { z: 1 }, { color: '#ffffff', far: 10, near: 3 });
} });

// s096 — "Year three. You check your pulse on the sofa."  YEAR 2 -> YEAR 3 card; living room, snow outside; HERO on the sofa, two fingers on his neck; stopwatch; Biscuit loafs
registerShot('s096', { draw(g, t, info) {
  const st = info.shot.start, tYear = shotWord('year', st, 0.15), tPulse = shotWord('pulse', st, 2.45);
  const cam = camMove(t, info.dur, { z: [1.42, 1.5], x: [-160, -140], y: [70, 76] });
  const A = apartment(g, t, cam, { mood: 'day', power: 1 }), GY = A.GY, CX = A.CX;
  layer(g, cam, 0.55, (g) => { const wx = A.pos.windowX - 300, wy = GY - 640; g.save(); g.beginPath(); g.rect(wx, wy, 600, 400); g.clip(); g.fillStyle = alpha('#eef4ff', 0.25); g.fillRect(wx, wy, 600, 400); FX.snow(g, t, { count: 60, seed: 3 }); g.fillStyle = alpha('#ffffff', 0.85); g.fillRect(wx, wy + 370, 600, 30); g.restore(); });
  layer(g, cam, 1, (g) => {
    const sx = A.pos.sofaX, seat = GY - 112, k = 1.9, on = t > tPulse - 0.3;
    const pose = idle(on ? { ...POSES.sit, eF: [30, -150], hF: [18, -180] } : POSES.sit, t, 2);
    actor(g, 'HERO', { x: sx - 70, y: seat + 72 * k, s: k, facing: 1, pose, t, rim: A.rim, shadow: false, expr: exprAt(t, [[0, 'neutral'], [tPulse, 'squint']]), blink: blinkFlag(t, 3.4, 2), look: on ? lookToward(0.6, -0.4) : lookToward(1, 0) });
    cat(g, { x: sx + 130, y: seat + 4, s: 2.0, facing: -1, pose: 'loaf', eyes: 'auto', t, rim: A.rim });
  });
  apartmentFg(g, t, cam); atmos(g, t, cam, { color: '#fff4dc', far: 14, near: 4 });
  timeSkip(g, t, { x: E.W * 0.5, y: E.H * 0.07, s: 0.42, keys: [[-1, 'YEAR 2'], [tYear, 'YEAR 3']] });
  if (t > tPulse - 0.3) stopwatch(g, Math.max(0, t - tPulse) * 1, { x: E.W * 0.82, y: E.H * 0.34, r: 110, label: 'PULSE' });
} });

// s097 — GIANT FACE HERO: "It's slow. Really slow."  fingers on his neck; squint -> shocked -> awe; a slow ECG crawls along the bottom, the rim pulses per beat
registerShot('s097', { draw(g, t, info) {
  const st = info.shot.start, tSlow = shotWord('slow', st, 0.33), tReally = shotWord('really', st, 1.51), U = S().ui, bpm = 40;
  const cam = camMove(t, info.dur, { z: [1.0, 1.08] }), z = cam.z;
  blurLayer(g, 16, (g) => apartment(g, t, { z: 1.4, x: -200, y: 40 }, { mood: 'day', power: 1 }), null, 1); veil(g, '#1a1020', 0.25);
  const ph = (t * bpm / 60) % 1, beat = Math.exp(-ph * 10);
  const cx = E.W * 0.47, cy = E.H * 0.52, r = 330;
  g.save(); g.translate(cx, cy); g.scale(z, z); g.translate(-cx, -cy);
  glow(g, cx, cy, r * 1.6, '#ffb070', 0.12 + 0.25 * beat);
  heroFace(g, cx, cy, r, { f: faceAt(t, [[0, 'squint'], [tSlow, 'shocked'], [tReally, 'awe']], 0.2), rimSide: 1, rimColor: beat > 0.3 ? '#ffe0b0' : '#ffc68a', glint: '#ffe0b0', blink: blinkAmt(t, 3.4, 3), breath: Math.sin(t * 1.2), t });
  // two fingers on the side of his neck
  g.fillStyle = S().ink; rr(g, cx + r * 0.62, cy + r * 0.66, r * 0.42, r * 0.13, r * 0.06); g.fill(); rr(g, cx + r * 0.6, cy + r * 0.8, r * 0.46, r * 0.13, r * 0.06); g.fill(); seg(g, [[cx + r * 1.0, cy + r * 0.85], [cx + r * 1.5, cy + r * 1.6]], r * 0.3, '#3f9a4a');
  g.restore();
  // slow ECG along the bottom third: long flat gaps between beats
  g.save(); g.strokeStyle = alpha('#7fe8a0', 0.9); g.lineWidth = 5; g.shadowColor = '#7fe8a0'; g.shadowBlur = 10; g.beginPath(); const y0 = E.H * 0.84, span = E.W * 1.2;
  for (let i = 0; i <= 240; i++) { const x = i / 240 * E.W, tt = (x / span) * 2.4 - t, p = ((tt * bpm / 60) % 1 + 1) % 1, y = y0 - (p < 0.04 ? Math.sin(p / 0.04 * Math.PI) * 110 : p < 0.08 ? -Math.sin((p - 0.04) / 0.04 * Math.PI) * 30 : 0); i ? g.lineTo(x, y) : g.moveTo(x, y); }
  g.stroke(); g.restore();
  atmos(g, t, { z: 1 }, { color: '#fff4dc', far: 10, near: 3 });
} });
