// B_s040_s044_launch.js — batch B: day 7 (32 m, the 90 km/h launch, the hoodie), day 8 at the falls (64 m, Mina hides the shoes).
// Built to QUALITY_BAR.md.
import { E, V, S, registerShot, layer, blurLayer, veil, ease, prog, clamp, lerp, alpha, glow, seg, circle, ring, rr, poly, linGrad, shade, mix, rng, noise, text, FONTS, backdrop, mood } from '/engine/core.js';
import { POSES, blendPose } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { actor } from '../sets/actors.js';
import { DEV } from '../cast.js';
import { street, streetFg } from '../sets/street.js';
import { roofs, roofsFg } from '../sets/roofs.js';
import { chip } from '../sets/hud.js';
import { blinkFlag, exprAt, poseAt, idle, reaction, lookToward, camMove, atmos } from '../sets/acting.js';
import { jumpPose, jumper, jumpFX, dustRing, jumpShake, jumpCam, JPOSE } from '../sets/jump.js';
import { gauge } from '../sets/devices.js';
import { U, wt, dayHud, meterHud, handWorld, HERO_TEE, hoodieCloth, socks, notes } from './B_lib.js';

const CX = E.W / 2, JH = 32 * U;
const MARKS = [['5 STOREYS', 16], ['NIAGARA', 51], ['BURJ KHALIFA', 828], ['POLE VAULT', 6.31]];
const MOOD = 'day';
// DEV with his beanie knocked off (drawn flying separately)
const DEV_BARE = { ...DEV, head: 'none' };
function beanie(g, x, y, s, rot) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); g.fillStyle = DEV.headColor; g.beginPath(); g.ellipse(0, 0, 26, 22, 0, Math.PI, 0); g.fill(); g.fillStyle = shade(DEV.headColor, -0.2); g.fillRect(-28, -2, 56, 12); circle(g, 0, -24, 8, shade(DEV.headColor, 0.2)); g.restore(); }
// a deep crouch that trembles with stored energy (k 0..1)
const coil = (t, k) => { const p = blendPose(blendPose(POSES.stand, POSES.crouch, clamp(k * 1.6)), JPOSE.coil, clamp(k * 1.6 - 0.6)), w = noise(t * 30, 2) * 2.5 * k; return { ...p, head: [p.head[0] + w, p.head[1]], sh: [p.sh[0] + w * 0.6, p.sh[1]] }; };

// s040 — STREET, daytime: DAY 06 -> 07, meter 32 m; he crouches deep in the middle of the empty street, Dev films from the kerb, Mina covers her ears
registerShot('s040', { draw(g, t, info) {
  const tDay = wt(info, 'day', 0.15), t32 = wt(info, 'thirty', 1.47);
  const cam = camMove(t, info.dur, { z: [0.94, 1.0], x: [-40, 0], y: [-70, -50] });
  const S0 = street(g, t, cam, { mood: MOOD, power: 0.6 }), hy = S0.roadY + 10, hx = CX + 40;
  const ck = ease.inOut(prog(t, 0.3, t32 + 0.3));
  layer(g, cam, 1, (g) => {
    // pressure cracks + grit trickling as the crouch deepens
    if (ck > 0.5) { g.save(); g.strokeStyle = alpha('#141018', 0.6 * (ck - 0.5) * 2); g.lineWidth = 3; const r = rng(3); for (let i = 0; i < 6; i++) { const sd = i % 2 ? 1 : -1; let x = hx + sd * 30, y = hy + 4; g.beginPath(); g.moveTo(x, y); for (let j = 0; j < 3; j++) { x += sd * (24 + r() * 30) * ck; y += (r() - 0.5) * 8; g.lineTo(x, y); } g.stroke(); } g.restore(); }
    for (let i = 0; i < 8; i++) { const u = (t * 1.3 + i / 8) % 1; circle(g, hx + (i - 3.5) * 22, hy - u * 30 * ck, 4 * (1 - u), alpha('#c8b8a8', 0.7 * ck * (1 - u))); }
    const devO = { x: CX - 560, y: S0.GY + 6, s: 1.85, facing: 1 };
    actor(g, 'DEV', { ...devO, pose: idle(POSES.phone, t, 2), expr: exprAt(t, [[0, 'smirk'], [t32, 'surprised']]), blink: blinkFlag(t, 3.0, 2), look: lookToward(1, 0.3), rim: S0.rim, prop: { type: 'phone' }, t });
    const [px, py] = handWorld(devO, POSES.phone); glow(g, px + 10, py - 10, 40, '#d4262e', 0.5 * (0.5 + 0.5 * Math.sin(t * 6)));   // REC light
    actor(g, 'MINA', { x: CX + 520, y: S0.GY + 6, s: 2.0, facing: -1, pose: idle(poseAt(t, [[0, 'stand'], [t32 - 0.4, 'handsOnHead']]), t, 1), expr: exprAt(t, [[0, 'worried'], [t32, 'scared']]), blink: blinkFlag(t, 2.9, 1), look: lookToward(-1, 0.3), rim: S0.rim, t });
    actor(g, 'HERO', { x: hx, y: hy, s: 1.95, facing: 1, pose: coil(t, ck), expr: exprAt(t, [[0, 'determined'], [t32 + 0.2, 'squint']]), blink: blinkFlag(t, 3.4, 3), look: lookToward(1, -0.4), rim: S0.rim, t });
  });
  streetFg(g, t, cam); atmos(g, t, cam, { color: '#fff1dc' });
  dayHud(g, t, info, 6, 7, tDay);
  meterHud(g, t, info, { v0: 16, v1: 32, t0: t32, marks: MARKS });
} });

// s041 — LAUNCH at 90 km/h on "leave": dust ring + a shockwave that flips Dev's beanie off and back on; the launch gauge swings to 90 on "ninety"
registerShot('s041', { draw(g, t, info) {
  const tLeave = wt(info, 'leave', 1.11), t90 = wt(info, 'ninety', 1.85, 1.3), t0 = tLeave, opt = { up: 1.5, crouch: 0.5 }, J = jumpPose(t, t0, JH, opt);
  const cam = { z: 0.96 - 0.04 * ease.out(prog(t, t0, t0 + 0.8)), x: Math.sin(t * 0.6) * 6, y: -60 - 220 * ease.out(prog(t, t0, t0 + 0.8)) + Math.cos(t * 0.5) * 4, r: 0.002 * Math.sin(t * 0.4) };
  const [sx, sy] = jumpShake(t, t0, 20); cam.x += sx; cam.y += sy;
  const S0 = street(g, t, cam, { mood: MOOD, power: 0.6 }), hy = S0.roadY + 10, hx = CX + 40, hit = t0 + 0.12;
  layer(g, cam, 1, (g) => {
    // shockwave ring
    const u = prog(t, t0, t0 + 0.5); if (u > 0 && u < 1) { g.save(); g.strokeStyle = alpha('#fff6e6', 0.7 * (1 - u)); g.lineWidth = 16 * (1 - u) + 2; g.beginPath(); g.ellipse(hx, hy, 80 + u * 1400, 20 + u * 260, 0, 0, 7); g.stroke(); g.restore(); }
    dustRing(g, t, t0, hx, hy, { s: 1.95, size: 2.2, dur: 1.4, seed: 21 });
    const devO = { x: CX - 560, y: S0.GY + 6, s: 1.85, facing: 1 }, bk = prog(t, hit, hit + 0.9), off = bk > 0 && bk < 1;
    actor(g, off ? DEV_BARE : 'DEV', { ...devO, pose: t < hit ? idle(POSES.phone, t, 2) : reaction('shock', t, hit, 'phone'), expr: exprAt(t, [[0, 'smirk'], [hit, 'shocked'], [hit + 1.0, 'awe']]), blink: blinkFlag(t, 3.0, 2), look: t < hit ? lookToward(1, 0.3) : lookToward(0.4, -1), rim: S0.rim, prop: { type: 'phone' }, t });
    if (off) { const hx2 = devO.x + POSES.phone.head[0] * 1.85, hy2 = devO.y + POSES.phone.head[1] * 1.85 - 30; beanie(g, hx2 - Math.sin(bk * Math.PI) * 60, hy2 - Math.sin(bk * Math.PI) * 300, 1.85, bk * Math.PI * 4); }
    actor(g, 'MINA', { x: CX + 520, y: S0.GY + 6, s: 2.0, facing: -1, pose: t < hit ? idle(POSES.handsOnHead, t, 1) : reaction('wince', t, hit, 'handsOnHead'), expr: exprAt(t, [[0, 'scared'], [hit, 'squint'], [hit + 0.8, 'awe']]), blink: blinkFlag(t, 2.9, 1), look: lookToward(-0.3, -1), rim: S0.rim, t });
    jumper(g, 'HERO', J, { x: hx, gy: hy, s: 1.95, facing: 1, expr: exprAt(t, [[0, 'squint'], [t0, 'joy']]), blink: blinkFlag(t, 3.4, 3), rim: S0.rim, t });
  });
  streetFg(g, t, cam);
  if (t > t0) FX.speedLines(g, t, { count: 50, a: 0.18 * clamp(1 - (t - t0) / 1.2), inner: 420, cy: E.H * 0.3 });
  atmos(g, t, cam, { color: '#fff1dc' });
  gauge(g, t - (t0 + 0.1), { preset: 'launch', x: E.W * 0.74, y: E.H * 0.36, r: 170, at: t90 - 0.4 - (t0 + 0.1), sweep: 0.45 });
  meterHud(g, t, info, { value: 32 * J.lift / JH, marks: MARKS });
} });

// s042 — THE HOODIE: high above the street the wind rips it off on "rips" (T-shirt underneath), cut down: it flutters onto Dev's head on "off"
registerShot('s042', { draw(g, t, info) {
  const tRip = wt(info, 'rips', 0.57), tYour = wt(info, 'your', 0.97, 0.6), tOff = wt(info, 'off', 1.51, 1.2), tCut = tYour + 0.05, M = mood(MOOD);
  if (t < tCut) {
    // HIGH UP: sky, clouds streaming down past him, the town tiny below
    const cam = { z: 1.0, x: Math.sin(t * 0.7) * 10, y: Math.cos(t * 0.6) * 6, r: 0.01 * Math.sin(t * 0.8) };
    layer(g, cam, 0.1, (g) => { backdrop(g, [shade(M.sky[0], -0.1), M.sky[1]]); });
    layer(g, cam, 0.3, (g) => { FX.skyline(g, { x: -E.W, y: E.H * 1.25 + t * 60, w: E.W * 3, minH: 30, maxH: 90, color: alpha('#5a6a8a', 0.6), seed: 3 }); });
    layer(g, cam, 0.6, (g) => { for (let i = 0; i < 6; i++) { const y = ((i * 260 + t * 900) % 1700) - 300; FX.clouds(g, { y, h: 160, count: 2, a: 0.35, seed: i + 3, color: '#ffffff' }); } });
    const J = jumpPose(t + 0.9, 0, JH, { up: 1.6, hang: 1.0 }), ripped = t > tRip, yF = E.H * 0.82, gy = yF + J.lift;
    layer(g, cam, 1, (g) => {
      jumper(g, ripped ? HERO_TEE : 'HERO', J, { x: E.W * 0.46, gy, s: 2.1, facing: 1, expr: exprAt(t, [[0, 'joy'], [tRip + 0.05, 'shocked']]), blink: blinkFlag(t, 3.2, 4), look: ripped ? lookToward(-0.4, 1) : lookToward(1, -0.2), rim: { color: '#fff1dc', dir: [-0.8, -0.5] }, t, speedLines: true, shadow: false });
      if (ripped) { const u = t - tRip, hx = E.W * 0.46 - 60 - u * 320, hyy = yF - 330 + u * 900 + u * u * 300; hoodieCloth(g, hx, hyy, 2.2 - u * 0.6, -0.4 - u * 5, t); }
      else { const k = prog(t, tRip - 0.3, tRip); if (k > 0) { g.save(); g.globalAlpha = k; for (let i = 0; i < 6; i++) seg(g, [[E.W * 0.46 - 120 + i * 40, yF - 520 + (i % 2) * 40], [E.W * 0.46 - 120 + i * 40, yF - 260]], 4, alpha('#ffffff', 0.4)); g.restore(); } }
    });
    FX.speedLines(g, t, { count: 40, a: 0.12, inner: 500 });
    atmos(g, t, cam, { color: '#fff1dc', far: 14, near: 5 });
    chip(g, t, { str: 'Wind: 1, hoodie: 0', at: tRip + 0.1, x: E.W * 0.74, y: E.H * 0.2, dur: tCut - 0.02, tone: 'coral' });
  } else {
    // DOWN ON THE STREET: the hoodie flutters out of the sky and lands on Dev's head
    const tt = t - tCut, cam = camMove(t, info.dur, { z: [1.25, 1.3], x: [-500, -480], y: [-150, -160] });
    const S0 = street(g, t, cam, { mood: MOOD, power: 0.6 });
    const devO = { x: CX - 560, y: S0.GY + 6, s: 1.9, facing: 1 }, head = [devO.x + POSES.stand.head[0] * 1.9, devO.y + POSES.stand.head[1] * 1.9];
    layer(g, cam, 1, (g) => {
      actor(g, 'DEV', { ...devO, pose: t < tOff ? idle(poseAt(t, [[0, 'lookUp']]), t, 2) : idle(reaction('shock', t, tOff, 'stand'), t, 2), expr: exprAt(t, [[0, 'awe'], [tOff, 'shocked'], [tOff + 0.45, 'neutral']]), blink: blinkFlag(t, 3.0, 2), look: t < tOff ? lookToward(0.2, -1) : lookToward(1, 0), rim: S0.rim, t });
      const k = prog(t, tCut, tOff), fx = lerp(head[0] + 160, head[0], ease.inOut(k)) + Math.sin(t * 7) * 40 * (1 - k), fy = lerp(head[1] - 800, head[1] + 10, k);
      hoodieCloth(g, fx, fy, 1.75, t < tOff ? Math.sin(t * 6) * 0.5 * (1 - k) : 0, t, { droop: t > tOff ? 40 : 0 });
      actor(g, 'MINA', { x: CX - 120, y: S0.GY + 6, s: 2.0, facing: -1, pose: idle(poseAt(t, [[0, 'lookUp'], [tOff + 0.15, 'delight']]), t, 1), expr: exprAt(t, [[0, 'awe'], [tOff + 0.15, 'joy']]), blink: blinkFlag(t, 2.9, 1), look: lookToward(-1, -0.3), rim: S0.rim, t });
    });
    streetFg(g, t, cam); atmos(g, t, cam, { color: '#fff1dc' });
    if (tt < 0.12) { g.fillStyle = `rgba(255,246,228,${0.5 * (1 - tt / 0.12)})`; g.fillRect(0, 0, E.W, E.H); }
  }
} });

// boost the horseshoe curtain so it reads as falling water at this framing (layer 0.3, clipped right of the cliff edge)
function fallsBoost(g, t, cam, R) {
  const GY = R.GY, lip = GY - 360, base = GY + 120, z1 = cam.z ?? 1, ex = (R.pos.edgeX + 40 - E.W / 2 - (cam.x || 0)) * z1 + E.W / 2;
  g.save(); g.beginPath(); g.rect(ex, 0, E.W, E.H); g.clip();
  layer(g, cam, 0.3, (g) => {
    for (let i = 0; i < 110; i++) { const x = -E.W + i * 40 + (i % 3) * 9, y0 = lip - 60 * Math.sin((x + E.W) / (E.W * 3) * Math.PI) + 6, u = (t * 1.8 + i * 0.29) % 1, L = base - y0;
      seg(g, [[x, y0 + u * L * 0.7], [x + 1, y0 + u * L * 0.7 + L * 0.3]], 6 + (i % 2) * 4, alpha('#ffffff', 0.35 + 0.2 * Math.sin(i))); }
    for (let i = 0; i < 12; i++) glow(g, -E.W + i * 260 + Math.sin(t + i) * 30, base - 20, 220, '#ffffff', 0.28);
    g.fillStyle = alpha('#f4fbff', 0.55); g.fillRect(-E.W * 2, base - 30, E.W * 5, 50);
  });
  g.restore();
}

// s043 — NIAGARA LOOKOUT: DAY 07 -> 08, meter 64 m (past the Niagara tick); he sizes up the falls at the railing, knees bending on "jump"
registerShot('s043', { draw(g, t, info) {
  const tDay = wt(info, 'day', 0.15), t64 = wt(info, 'sixty', 0.47), tJump = wt(info, 'jump', 2.39, 1.8), tNia = wt(info, 'niagara', 2.93, 2.2);
  const cam = camMove(t, info.dur, { z: [0.92, 1.0], x: [-200, -110], y: [-110, -130] });
  const R = roofs(g, t, cam, { view: 'falls', mood: 'day' }), hx = R.pos.edgeX - 220;
  fallsBoost(g, t, cam, R);
  layer(g, cam, 1, (g) => {
    actor(g, 'HERO', { x: hx, y: R.GY - 30, s: 1.95, facing: 1, pose: idle(poseAt(t, [[0, 'stand'], [t64 + 0.2, 'lookUp'], [tJump, 'ready']]), t, 3), expr: exprAt(t, [[0, 'awe'], [tJump, 'smirk'], [tNia + 0.3, 'determined']]), blink: blinkFlag(t, 3.4, 3), look: lookToward(1, -0.25), rim: R.rim, t });
    actor(g, 'MINA', { x: hx - 560, y: R.GY - 30, s: 2.0, facing: 1, pose: idle(poseAt(t, [[0, 'stand'], [tJump + 0.2, 'crossArms']]), t, 1), expr: exprAt(t, [[0, 'smile'], [tJump + 0.2, 'thinking']]), blink: blinkFlag(t, 2.9, 1), look: lookToward(1, 0.1), rim: R.rim, t });
  });
  roofsFg(g, t, cam, { view: 'falls' }); atmos(g, t, cam, { color: '#e8f4ff' });
  dayHud(g, t, info, 7, 8, tDay);
  meterHud(g, t, info, { v0: 32, v1: 64, t0: t64, marks: MARKS });
  chip(g, t, { str: 'Niagara Falls: about 51 m', at: tNia, x: E.W * 0.36, y: E.H * 0.88, dur: info.dur - 0.05 });
} });

// s044 — SHOES GAG: he turns in his socks, suspicious on "don't"; Mina behind him, trainers hidden behind her back, whistling, eyes darting
registerShot('s044', { draw(g, t, info) {
  const tDont = wt(info, "don't", 0.17), tMina = wt(info, 'mina', 0.77, 0.5), tShoes = wt(info, 'shoes', 1.69, 1.2);
  const cam = camMove(t, info.dur, { z: [1.0, 1.08], x: [-260, -230], y: [-120, -140] });
  const R = roofs(g, t, cam, { view: 'falls', mood: 'day' }), hx = R.pos.edgeX - 220, mx = hx - 520;
  fallsBoost(g, t, cam, R);
  layer(g, cam, 1, (g) => {
    const hf = t < tDont + 0.1 ? 1 : -1, hpose = idle(poseAt(t, [[0, 'stand'], [tDont + 0.1, 'shrug'], [tMina + 0.3, 'stand']]), t, 3), hO = { x: hx, y: R.GY - 30, s: 1.95, facing: hf };
    const lookH = t < tDont + 0.1 ? lookToward(1, 0) : t < tMina ? lookToward(0.2, 1) : lookToward(1, 0);
    actor(g, 'HERO', { ...hO, pose: hpose, expr: exprAt(t, [[0, 'neutral'], [tDont, 'thinking'], [tMina, 'confused']]), blink: blinkFlag(t, 3.4, 3), look: lookH, rim: R.rim, t });
    socks(g, hO, hpose);
    const dart = Math.sin(t * 5) > 0 ? lookToward(1, -0.2) : lookToward(-0.6, -0.6);
    const mpose = idle({ ...POSES.stand, hF: [-20, -110], eF: [-6, -130], hB: [-24, -112], eB: [-12, -134] }, t, 2), sway = Math.sin(t * 3) * 0.04;
    g.save(); g.translate(mx, R.GY - 30); g.rotate(sway); g.translate(-mx, -(R.GY - 30));
    const sx = mx - 46, sy = R.GY - 30 - 100; for (const dx of [0, 26]) { g.fillStyle = '#e8e2d8'; g.beginPath(); g.ellipse(sx - dx, sy + dx * 0.4, 32, 13, 0.3, 0, Math.PI * 2); g.fill(); g.fillStyle = '#d4262e'; g.fillRect(sx - dx - 20, sy + dx * 0.4 - 2, 26, 5); }   // his trainers
    actor(g, 'MINA', { x: mx, y: R.GY - 30, s: 2.0, facing: 1, pose: mpose, expr: exprAt(t, [[0, 'smile'], [tDont, 'nervous'], [tShoes, 'smirk']]), blink: blinkFlag(t, 2.9, 1), look: t < tShoes ? dart : lookToward(1, 0), rim: R.rim, t });
    g.restore();
    notes(g, t, mx + 40, R.GY - 30 - 300, t < tShoes + 0.4 ? 1 : 0.3);
  });
  roofsFg(g, t, cam, { view: 'falls' }); atmos(g, t, cam, { color: '#e8f4ff' });
  chip(g, t, { str: 'Shoes: confiscated', at: tShoes + 0.1, x: E.W * 0.36, y: E.H * 0.88, dur: info.dur - 0.05, tone: 'coral' });
} });
