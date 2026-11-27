// E_end.js — batch E, the ending (s107-s112): loop to DAY 01, reality-check blueprint, montage up / montage down, the question, the end screen.
//   s107 LOOP: sunny bedroom, big DAY counter spins back 25 > 01 and lands on 'doubles'; HERO stretching in bed
//   s108 REALITY CHECK blueprint: line-art athlete leaps, gold bar "~1.5 m" on 'metre and a half', tiny hoop for scale, check on 'plenty'
//   s109 MONTAGE UP: 5 framed mini-panels (court, stadium, Burj, Everest, space) slide up, freeze on "wouldn't be going up"
//   s110 MONTAGE DOWN: 6 landing panels pop on every / single / time / down with impact flashes + shake
//   s111 QUESTION lock-up over a dimmed doubling graph, DAY counter cycling, comment bubble on 'comments'
//   s112 END SCREEN: cast + Biscuit on the sunrise lawn, DAY 01, subscribe pill + like + bubble, fade out
import { E, V, S, registerShot, layer, veil, ease, prog, key, clamp, lerp, wordTime, alpha, glow, rr, seg, circle, poly, ring, text, FONTS, rng, linGrad, radGrad, shade, mix, backdrop } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { actor, cat } from '../sets/actors.js';
import { apartment } from '../sets/apartment.js';
import { roofs, roofsFg } from '../sets/roofs.js';
import { dayCounter, doublingGraph } from '../sets/devices.js';
import { impactFrame, jumpShake } from '../sets/jump.js';
import { blinkFlag, exprAt, poseAt, idle, reaction, lookToward, camMove, atmos } from '../sets/acting.js';
import * as BP from '../sets/bp.js';

const shotWord = (w, st, fb) => { const g = wordTime(w, st); return (g == null ? st + fb : g) - st; };
const RIM = { color: '#ffc68a', dir: [-0.8, -0.5] };
const GOLD = '#ffd47e', CREAM = '#fff1dc';
const hero = (g, x, y, s, pose, expr, t, seed = 1, facing = 1) => actor(g, 'HERO', { x, y, s, facing, pose, expr, blink: blinkFlag(t, 3.4, seed), rim: RIM, t });

// ---------------------------------------------------------------------------------------------------
// s107 — LOOP back to DAY 01
// ---------------------------------------------------------------------------------------------------
registerShot('s107', { draw(g, t, info) {
  const st = info.shot.start, tD = shotWord('doubles', st, 2.29), tN = shotWord("nobody's", st, 1.37);
  const cam = camMove(t, info.dur, { z: [1.5, 1.34], x: [-420, -360], y: [-70, -40] });
  const A = apartment(g, t, cam, { mood: 'day', power: 0.9 }), GY = A.GY, CX = A.CX;
  const bx = CX - 470;
  layer(g, cam, 1, (g) => {
    FX.bed(g, { x: bx, y: GY + 4, w: 560, color: '#4f7fc0', frame: '#6a4a38', pillow: '#fff7ea' });
    const stretch = 0.5 + 0.5 * Math.sin(t * 1.7);
    const base = t < tN ? poseAt(t, [[0, 'stand'], [0.9, 'handsUp']], 0.6) : poseAt(t, [[0, 'handsUp'], [1, 'stand']], 0.5);
    const pose = idle(t < tD - 0.1 ? { ...base, hF: [lerp(base.hF[0], 48, stretch * 0.5), lerp(base.hF[1], -196, stretch * 0.4)] } : reaction('delight', t, tD, 'handsUp'), t, 3);
    hero(g, bx + 220, GY - 20, 1.9, pose, exprAt(t, [[0, 'sleepy'], [tN, 'neutral'], [tD, 'smile']]), t, 3);
    // blanket mound over the lap, drawn after the hero
    g.fillStyle = '#4f7fc0'; rr(g, bx + 30, GY - 178, 420, 100, 46); g.fill(); g.fillStyle = alpha('#fff', 0.14); rr(g, bx + 56, GY - 172, 368, 18, 9); g.fill();
    g.strokeStyle = alpha('#16305a', 0.5); g.lineWidth = 4; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(bx + 90 + i * 90, GY - 160); g.quadraticCurveTo(bx + 120 + i * 90, GY - 125, bx + 100 + i * 90, GY - 90); g.stroke(); }
  });
  veil(g, '#0e0a16', 0.22);
  // sun beam from the window
  FX.godRays(g, A.pos.windowX + 40 - cam.x * 0.5, GY - 560, { angle: 1.15, spread: 0.7, len: 1500, color: '#ffe2a8', a: 0.1, t });
  atmos(g, t, cam, { color: '#fff1dc', far: 26, near: 8 });
  // the big counter spins BACK 25 > 02 and lands on 01 with a tick on 'doubles'
  const keys = [[0, 25]], n = 24, t0 = 0.2;
  for (let i = 1; i <= n; i++) keys.push([t0 + (tD - t0) * ease.inOut(i / n) * 0.985 + (tD - t0) * 0.015 * (i / n), 25 - i]);
  keys[n][0] = tD;
  const land = Math.max(0, t - tD), pop = 1 + 0.07 * Math.exp(-land * 8) * Math.cos(land * 24);
  g.save(); g.translate(1360, 300); g.scale(pop, pop); g.translate(-1360, -300);
  dayCounter(g, t, { x: 1580, y: 230, s: 1.0, keys, flip: 0.07 });
  g.restore();
  if (land > 0 && land < 0.5) { glow(g, 1360, 300, 520, GOLD, 0.35 * (1 - land / 0.5)); FX.sparkle(g, 1130, 220, 40 * (1 - land * 2), '#fff', 0.9); FX.sparkle(g, 1600, 380, 34 * (1 - land * 2), '#fff', 0.9); }
} });

// ---------------------------------------------------------------------------------------------------
// s108 — REALITY CHECK blueprint (FIG 6)
// ---------------------------------------------------------------------------------------------------
registerShot('s108', { draw(g, t, info) {
  const st = info.shot.start, ui = S().ui;
  const tLeap = shotWord('leap', st, 0.83), tMetre = shotWord('metre', st, 1.71), tPlenty = shotWord('plenty', st, 3.07), tBest = shotWord('best', st, 0.25), tHuman = shotWord('human', st, 0.49);
  BP.board(g, t, { title: 'REALITY CHECK', fig: 'FIG 6 - REAL LIFE' });
  const z = 1 + 0.035 * (t / info.dur); g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2 + Math.sin(t * 0.5) * 3, -E.H / 2);
  const GYB = 900, PPM = 200, ax = 660;
  BP.draw(g, [[120, GYB], [E.W - 120, GYB]], ease.out(prog(t, 0, 0.8)), { w: 5 });
  // ruler with gold ticks
  const rx = 960;
  BP.draw(g, [[rx, GYB], [rx, GYB - 3.6 * PPM]], ease.out(prog(t, 0.1, 0.9)), { w: 4 });
  for (let m = 0.5; m <= 3.5; m += 0.5) { const yy = GYB - m * PPM, k = ease.out(prog(t, 0.3 + m * 0.1, 0.7 + m * 0.1)); seg(g, [[rx, yy], [rx + 28 * k, yy]], 4, alpha(ui.blueprint, 0.9)); if (k > 0.5) text(g, m.toFixed(1), rx - 24, yy, { size: 30, color: GOLD, font: FONTS.ui, weight: 900, align: 'right', alpha: k }); }
  // athlete: crouch > leap on 'leap' > hang at the top > come down
  const lift = key(t, [[tLeap - 0.1, 0], [tLeap + 0.8, 1.5 * PPM], [tPlenty + 0.3, 1.5 * PPM], [info.dur - 0.1, 0]], ease.inOut);
  const pose = poseAt(t, [[0, 'stand'], [tBest, 'crouch'], [tLeap, 'jump'], [tPlenty + 0.3, 'stand']], 0.18);
  const sq = t > tBest && t < tLeap ? 0.06 : 0;
  const footUp = -Math.min(0, pose.fF[1], pose.fB[1]) * 1.5;   // tucked jump feet sit above the pose origin: keep the FEET at the true lift (apex = 1.5 m line)
  UI.lineFigure(g, { x: ax, y: GYB - lift + footUp, s: 1.5, pose, color: '#e8f0ff', facing: 1 });
  // feet-height marker: dashed line from the feet at the apex to the bar
  const ap = ease.out(prog(t, tLeap + 0.5, tLeap + 1.1));
  g.save(); g.setLineDash([14, 12]); g.strokeStyle = alpha(GOLD, 0.8); g.lineWidth = 3; g.beginPath(); g.moveTo(ax - 120, GYB - 1.5 * PPM); g.lineTo(lerp(ax - 120, rx + 150, ap), GYB - 1.5 * PPM); g.stroke(); g.restore();
  // gold bar grows on 'metre and a half'
  const bk = ease.outBack(prog(t, tMetre - 0.1, tMetre + 0.8)), bh = 1.5 * PPM * bk, bx = rx + 70;
  if (bk > 0) { g.fillStyle = linGrad(g, 0, GYB - bh, 0, GYB, [GOLD, '#c98a2a']); rr(g, bx, GYB - bh, 110, bh, 10); g.fill(); g.strokeStyle = '#fff1dc'; g.lineWidth = 3; g.stroke(); glow(g, bx + 55, GYB - bh, 220, GOLD, 0.2); }
  const val = clamp((t - tMetre) / 0.7) * 1.5;
  if (bk > 0.02) text(g, '~' + val.toFixed(1) + ' m', bx + 55, GYB - bh - 54, { size: 76, color: GOLD, font: FONTS.title, weight: 700, stroke: 9, strokeColor: '#0b1324', glow: 18, glowColor: alpha(GOLD, 0.6) });
  // tiny hoop for scale (3.05 m)
  const hx = 1560, hk = ease.out(prog(t, 0.6, 1.4)), hy = GYB - 3.05 * PPM;
  g.globalAlpha *= 1; BP.draw(g, [[hx, GYB], [hx, hy - 60]], hk, { w: 5 }); BP.draw(g, [[hx - 70, hy - 90], [hx - 70, hy + 20], [hx - 6, hy + 20], [hx - 6, hy - 90], [hx - 70, hy - 90]], hk, { w: 5 }); BP.draw(g, [[hx - 70, hy - 4], [hx - 150, hy - 4]], hk, { w: 5 });
  if (hk > 0.6) { g.strokeStyle = alpha(ui.blueprint, 0.9); g.lineWidth = 3; g.beginPath(); g.moveTo(hx - 150, hy - 4); g.lineTo(hx - 140, hy + 30); g.lineTo(hx - 110, hy + 30); g.lineTo(hx - 100, hy - 4); g.stroke(); text(g, 'RIM 3.05 m', hx - 90, hy - 140, { size: 34, color: GOLD, font: FONTS.ui, weight: 900, alpha: hk }); }
  BP.label(g, t, { at: [ax + 40, GYB - lift + footUp - 330], to: [ax - 40, 300], str: 'BEST HUMAN LEAP', start: tHuman });
  // check mark pops on 'plenty'
  const ck = ease.outBack(prog(t, tPlenty, tPlenty + 0.4));
  if (ck > 0) { g.save(); g.translate(1180, 360); g.scale(ck, ck); glow(g, 0, 0, 200, ui.good, 0.35); circle(g, 0, 0, 78, '#0b1324'); ring(g, 0, 0, 78, 8, ui.good); g.strokeStyle = ui.good; g.lineWidth = 16; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(-34, 2); g.lineTo(-8, 30); g.lineTo(38, -28); g.stroke(); g.restore(); if (t - tPlenty < 0.5) FX.sparkle(g, 1230, 310, 36, '#fff', 0.9); }
  g.restore();
} });

// ---------------------------------------------------------------------------------------------------
// mini panels (cheap, local): framed, clipped, no blur
// ---------------------------------------------------------------------------------------------------
function framed(g, x, y, w, h, o, fn) {
  const { rot = 0, sc = 1, tag = '', flash = 0, tone = '#fff1dc' } = o;
  g.save(); g.translate(x + w / 2, y + h / 2); g.rotate(rot); g.scale(sc, sc); g.translate(-w / 2, -h / 2);
  rr(g, 10, 14, w, h, 22); g.fillStyle = 'rgba(0,0,0,.4)'; g.fill();
  g.save(); rr(g, 0, 0, w, h, 22); g.clip(); fn(g); if (flash > 0) { g.fillStyle = `rgba(255,246,228,${0.9 * flash})`; g.fillRect(0, 0, w, h); } g.restore();
  rr(g, 0, 0, w, h, 22); g.strokeStyle = tone; g.lineWidth = 8; g.stroke(); g.strokeStyle = 'rgba(20,14,30,.55)'; g.lineWidth = 2; g.stroke();
  if (tag) { const tw = 150; rr(g, 18, 18, tw, 46, 23); g.fillStyle = 'rgba(11,19,36,.92)'; g.fill(); text(g, tag, 18 + tw / 2, 42, { size: 28, color: GOLD, font: FONTS.ui, weight: 900, spacing: 1 }); }
  g.restore();
}
const skyG = (g, w, h, cols) => { g.fillStyle = linGrad(g, 0, 0, 0, h, cols); g.fillRect(0, 0, w, h); };

// RISES: kind 0 court, 1 stadium, 2 Burj, 3 Everest, 4 space
function riseScene(g, kind, w, h, t, expr) {
  const gy = h * 0.84, sw = Math.sin(t * 2.2 + kind), s = 0.85;
  if (kind === 0) {
    skyG(g, w, h, ['#f09a6a', '#ffd9a0', '#ffe9c8']); g.fillStyle = '#d98a52'; g.fillRect(0, gy, w, h - gy); seg(g, [[0, gy], [w, gy]], 4, '#fff1dc');
    seg(g, [[w * 0.82, gy], [w * 0.82, h * 0.2]], 10, '#556'); rr(g, w * 0.66, h * 0.1, w * 0.3, h * 0.22, 6); g.fillStyle = '#f4f4f4'; g.fill(); g.strokeStyle = '#d4262e'; g.lineWidth = 5; g.stroke(); seg(g, [[w * 0.66, h * 0.31], [w * 0.5, h * 0.31]], 8, '#f0701a');
    for (let i = 0; i < 4; i++) seg(g, [[w * 0.5 + i * 8, h * 0.31], [w * 0.52 + i * 7, h * 0.4]], 3, '#fff');
    hero(g, w * 0.4, gy - 250 - 18 * sw, s, POSES.jump, expr, t, 1);
    circle(g, w * 0.5, h * 0.27 + sw * 3, 16, '#f0701a');
  } else if (kind === 1) {
    skyG(g, w, h, ['#5aa0e8', '#a8d0f4', '#e8f2fa']); g.fillStyle = '#c4452e'; g.fillRect(0, gy, w, h - gy); for (let i = 0; i < 5; i++) seg(g, [[0, gy + 12 + i * 22], [w, gy + 12 + i * 22]], 3, '#f0d8c8');
    g.fillStyle = '#3a4a6a'; g.fillRect(0, h * 0.5, w, 40); for (let i = 0; i < 40; i++) circle(g, (i * 37) % w, h * 0.5 + 8 + (i * 13) % 26, 8, ['#d4262e', '#f2c21a', '#2f6fd0', '#e8e4d8'][i % 4]);
    seg(g, [[w * 0.22, gy], [w * 0.22, gy - 270]], 8, '#ddd'); seg(g, [[w * 0.78, gy], [w * 0.78, gy - 270]], 8, '#ddd'); seg(g, [[w * 0.22, gy - 270], [w * 0.78, gy - 270]], 8, '#f2c21a');
    hero(g, w * 0.5, gy - 200 - 14 * sw, s, POSES.jump, expr, t, 2);
  } else if (kind === 2) {
    skyG(g, w, h, ['#3a5fb0', '#7fb0e0', '#f4c8a0']); for (let i = 0; i < 6; i++) { g.fillStyle = shade('#4a5a8a', -0.05 * i); g.fillRect(i * w / 6 - 10, h * 0.62 - (i % 3) * 40, w / 6 + 10, h); }
    poly(g, [[w * 0.72, gy], [w * 0.75, h * 0.18], [w * 0.755, h * 0.04], [w * 0.765, h * 0.18], [w * 0.8, gy]], '#cfe0f4'); poly(g, [[w * 0.755, gy], [w * 0.755, h * 0.04], [w * 0.8, gy]], '#8aa4c8');
    g.fillStyle = '#2a6aa8'; g.fillRect(0, gy, w, h - gy); glow(g, w * 0.3, gy, 160, '#ffd9a0', 0.3);
    hero(g, w * 0.4, h * 0.58 - 16 * sw, s, POSES.jump, expr, t, 3);
    text(g, '828 m', w * 0.5, h * 0.93, { size: 46, color: GOLD, font: FONTS.title, weight: 700, stroke: 8, strokeColor: '#0b1324' });
  } else if (kind === 3) {
    skyG(g, w, h, ['#2a3f8a', '#7a8fd0', '#f0b898']); poly(g, [[-20, gy], [w * 0.3, h * 0.5], [w * 0.5, gy]], '#6a7aa8'); poly(g, [[w * 0.2, gy], [w * 0.62, h * 0.12], [w * 1.1, gy]], '#e8eef8'); poly(g, [[w * 0.62, h * 0.12], [w * 1.1, gy], [w * 0.7, gy]], '#8a9ac0');
    seg(g, [[w * 0.62, h * 0.12], [w * 0.62, h * 0.04]], 5, '#ddd'); poly(g, [[w * 0.62, h * 0.04], [w * 0.74, h * 0.07], [w * 0.62, h * 0.1]], '#e0302a');
    g.fillStyle = alpha('#fff', 0.8); for (let i = 0; i < 6; i++) { g.beginPath(); g.ellipse(((i * 90 + t * 14) % (w + 120)) - 60, gy - 20 + (i % 2) * 24, 80, 22, 0, 0, 7); g.fill(); }
    hero(g, w * 0.4, h * 0.34 - 14 * sw, s, POSES.jump, expr, t, 4);
    text(g, '8,849 m', w * 0.5, h * 0.93, { size: 44, color: GOLD, font: FONTS.title, weight: 700, stroke: 8, strokeColor: '#0b1324' });
  } else {
    skyG(g, w, h, ['#02030a', '#0a1030', '#10204a']); FX.stars(g, t * 0.2, { area: [0, 0, w, h * 0.8], count: 70, seed: 3 });
    g.fillStyle = linGrad(g, 0, h * 0.78, 0, h, ['#5ab0ff', '#1a3a8a']); g.beginPath(); g.ellipse(w * 0.5, h * 1.5, w * 1.1, h * 0.76, 0, 0, 7); g.fill(); glow(g, w * 0.5, h * 0.76, 300, '#7fd0ff', 0.25);
    rr(g, w * 0.7, h * 0.22, 54, 14, 3); g.fillStyle = '#e8e8f0'; g.fill(); rr(g, w * 0.7 - 20, h * 0.2, 12, 40, 2); g.fillStyle = '#4a7ad0'; g.fill(); rr(g, w * 0.7 + 62, h * 0.2, 12, 40, 2); g.fill();
    hero(g, w * 0.4, h * 0.6 - 12 * sw, s, { ...POSES.jump }, expr, t, 5);
    text(g, '131 km', w * 0.5, h * 0.93, { size: 44, color: GOLD, font: FONTS.title, weight: 700, stroke: 8, strokeColor: '#0b1324' });
  }
  FX.dust(g, t * 0.7 + kind, { count: 10, color: '#fff1dc', a: 0.25, seed: 4 + kind });
}

// LANDINGS: kind 0 ceiling, 1 track, 2 roof, 3 pond, 4 lake, 5 street. k = seconds since the panel popped
function landScene(g, kind, w, h, t, k) {
  const gy = h * 0.8, s = 0.9, fall = ease.in(prog(k, 0, 0.12)), hit = k > 0.12, kk = Math.max(0, k - 0.12), wob = hit ? Math.exp(-kk * 7) * Math.cos(kk * 30) : 0;
  const hp = hit ? POSES.crouch : POSES.jump, ex = hit ? 'scared' : 'surprised';
  const word = ['BONK', 'CRUNCH', 'OOF', 'SPLASH', 'SPLOSH', 'THUD'][kind];
  const burst = (x, y, r) => { if (!hit) return; const a = Math.exp(-kk * 4); for (let i = 0; i < 12; i++) { const an = i / 12 * Math.PI * 2 + 0.2, d = r * (0.5 + kk * 3); seg(g, [[x + Math.cos(an) * d, y + Math.sin(an) * d * 0.6], [x + Math.cos(an) * (d + 26), y + Math.sin(an) * (d + 26) * 0.6]], 6, alpha('#fff1dc', a)); } };
  const label = () => { if (!hit) return; const p = ease.outBack(prog(kk, 0, 0.22)); g.save(); g.translate(w * 0.5, h * 0.2); g.rotate(-0.06); g.scale(p, p); text(g, word, 0, 0, { size: 84, color: GOLD, font: FONTS.title, weight: 700, stroke: 14, strokeColor: '#1a1020', glow: 18, glowColor: alpha('#ff9a40', 0.6) }); g.restore(); };
  if (kind === 0) {
    skyG(g, w, h, ['#d8c8b8', '#efe3d2']); g.fillStyle = '#b4a494'; g.fillRect(0, 0, w, h * 0.12); g.fillStyle = '#8a6a50'; g.fillRect(0, gy, w, h - gy);
    g.strokeStyle = '#4a3a3a'; g.lineWidth = 4; if (hit) { g.beginPath(); g.moveTo(w * 0.5, h * 0.12); g.lineTo(w * 0.46, h * 0.2); g.lineTo(w * 0.52, h * 0.26); g.lineTo(w * 0.47, h * 0.33); g.stroke(); }
    circle(g, w * 0.5, h * 0.07, 14, alpha('#fff4c0', 0.9)); const hy2 = lerp(h * 0.34, gy, hit ? ease.in(prog(kk, 0.1, 0.5)) : 0);
    hero(g, w * 0.5 + wob * 4, hit && kk < 0.1 ? h * 0.36 : hy2, s, hit && kk > 0.45 ? POSES.crouch : POSES.jump, 'scared', t, 1);
    if (hit) for (let i = 0; i < 5; i++) { const px = w * (0.34 + i * 0.08), py = h * 0.2 + ((kk * 160 + i * 40) % 160); circle(g, px, py, 4, alpha('#f4efe6', Math.exp(-kk * 2))); }
    burst(w * 0.5, h * 0.16, 30);
  } else if (kind === 1) {
    skyG(g, w, h, ['#5aa0e8', '#a8d0f4']); g.fillStyle = '#c4452e'; g.fillRect(0, gy, w, h - gy); for (let i = 0; i < 4; i++) seg(g, [[0, gy + 18 + i * 22], [w, gy + 18 + i * 22]], 3, '#f0d8c8');
    const bx = w * 0.7; seg(g, [[bx - 90, gy], [bx - 90, gy - 150]], 7, '#ddd'); seg(g, [[bx + 90, gy], [bx + 90, gy - 150]], 7, '#ddd');
    if (!hit) seg(g, [[bx - 90, gy - 150], [bx + 90, gy - 150]], 7, '#f2c21a'); else seg(g, [[bx - 90 + kk * 80, gy - 150 + 100 * ease.in(prog(kk, 0, 0.3))], [bx + 90 + kk * 80, gy - 40 + 0 * kk]], 7, '#f2c21a');
    hero(g, w * 0.4 + wob * 5, lerp(h * 0.25, gy + 6, fall) + (hit ? 6 : 0), s, hp, ex, t, 2);
    burst(w * 0.4, gy, 24);
  } else if (kind === 2) {
    skyG(g, w, h, ['#f09a6a', '#ffd9a0']); poly(g, [[-20, gy + 30], [w * 0.5, h * 0.42], [w + 20, gy + 30]], '#8a3a2a'); g.fillStyle = '#6a2a22'; g.fillRect(0, gy + 28, w, h);
    for (let i = 0; i < 6; i++) seg(g, [[w * 0.1 + i * w * 0.14, gy + 30], [w * 0.3 + i * w * 0.08, h * 0.5]], 3, alpha('#2a1018', 0.5));
    hero(g, w * 0.5 + wob * 5, lerp(h * 0.2, h * 0.5 + 6, fall), s, hp, ex, t, 3);
    if (hit) { g.strokeStyle = '#2a1018'; g.lineWidth = 4; g.beginPath(); g.moveTo(w * 0.5, h * 0.52); g.lineTo(w * 0.42, h * 0.6); g.lineTo(w * 0.46, h * 0.66); g.stroke(); }
    burst(w * 0.5, h * 0.52, 26);
  } else if (kind === 3) {
    skyG(g, w, h, ['#7fb8e0', '#cfe8f0']); g.fillStyle = '#3a9a6a'; g.fillRect(0, h * 0.55, w, h * 0.1); g.fillStyle = linGrad(g, 0, h * 0.62, 0, h, ['#4aa0d8', '#1f6a9a']); g.fillRect(0, h * 0.62, w, h);
    for (let i = 0; i < 3; i++) { const dx = w * (0.2 + i * 0.3) + Math.sin(t + i) * 6, dy = h * 0.66 + i % 2 * 12 - (hit ? 60 * ease.out(prog(kk, 0, 0.3)) * (1 - prog(kk, 0.5, 1.2)) : 0); g.fillStyle = '#f4f0e0'; g.beginPath(); g.ellipse(dx, dy, 30, 16, 0, 0, 7); g.fill(); circle(g, dx + 26, dy - 16, 11, '#2f7a4a'); poly(g, [[dx + 34, dy - 17], [dx + 48, dy - 13], [dx + 34, dy - 9]], '#f2a020'); }
    const sy = h * 0.66; hero(g, w * 0.5, lerp(h * 0.2, sy + 20 + kk * 0, fall), s, hp, ex, t, 4);
    if (hit) { const a = Math.exp(-kk * 2.4); for (let i = 0; i < 14; i++) { const an = Math.PI + (i / 13) * Math.PI, d = 40 + kk * 200 * (0.6 + (i % 3) * 0.2); circle(g, w * 0.5 + Math.cos(an) * d, sy + Math.sin(an) * d * 1.1 + kk * kk * 280 * 0.4, 9 - (i % 3) * 2, alpha('#e8f6ff', a)); } ring(g, w * 0.5, sy + 12, 60 + kk * 220, 5, alpha('#e8f6ff', a)); }
  } else if (kind === 4) {
    skyG(g, w, h, ['#4a60b0', '#e8a888']); for (let i = 0; i < 8; i++) { g.fillStyle = '#2a3560'; g.fillRect(i * w / 8, h * 0.4 - (i * 37 % 90), w / 8 - 6, h); } g.fillStyle = linGrad(g, 0, h * 0.58, 0, h, ['#3a6ab0', '#1a3a70']); g.fillRect(0, h * 0.58, w, h);
    for (let i = 0; i < 6; i++) seg(g, [[w * 0.1 + i * 90, h * 0.66 + (i % 3) * 28], [w * 0.1 + i * 90 + 50, h * 0.66 + (i % 3) * 28]], 3, alpha('#fff', 0.35));
    const sy = h * 0.66; hero(g, w * 0.5, lerp(h * 0.2, sy + 24, fall), s, hp, ex, t, 5);
    if (hit) { const a = Math.exp(-kk * 2); for (let r = 0; r < 3; r++) ring(g, w * 0.5, sy + 14, 50 + kk * 240 - r * 40, 5, alpha('#e8f6ff', a)); for (let i = 0; i < 10; i++) { const an = Math.PI * (0.1 + i * 0.09), d = 50 + kk * 220; circle(g, w * 0.5 + Math.cos(an) * d, sy - Math.sin(an) * d * 0.9 + kk * kk * 180, 8, alpha('#e8f6ff', a)); } }
  } else {
    skyG(g, w, h, ['#e0905a', '#f4c898']); g.fillStyle = '#4a4252'; g.fillRect(0, gy, w, h - gy); seg(g, [[0, gy], [w, gy]], 6, '#7a7284'); for (let i = 0; i < 6; i++) seg(g, [[w * (0.05 + i * 0.18), gy + 40], [w * (0.05 + i * 0.18) + 60, gy + 40]], 6, alpha('#f2c21a', 0.6));
    g.fillStyle = '#3a3050'; g.fillRect(w * 0.05, h * 0.28, w * 0.2, gy - h * 0.28); g.fillRect(w * 0.7, h * 0.18, w * 0.25, gy - h * 0.18);
    hero(g, w * 0.5 + wob * 5, lerp(h * 0.22, gy + 12, fall), s, hp, ex, t, 6);
    if (hit) { g.strokeStyle = '#1a1420'; g.lineWidth = 5; for (const a of [-0.6, -0.2, 0.3, 0.7]) { g.beginPath(); g.moveTo(w * 0.5, gy + 14); g.lineTo(w * 0.5 + Math.sin(a) * 150, gy + 14 + Math.cos(a) * 28 + 6); g.stroke(); } for (let i = 0; i < 8; i++) { const d = 30 + kk * 160; circle(g, w * 0.5 + (i - 3.5) * d * 0.28, gy - Math.sin(i + kk * 6) * 16 - kk * 20, 12 - kk * 5 + (i % 2) * 3, alpha('#d8cfc0', Math.exp(-kk * 2.4) * 0.8)); } }
    burst(w * 0.5, gy + 10, 30);
  }
  label();
}

// ---------------------------------------------------------------------------------------------------
// s109 — MONTAGE UP
// ---------------------------------------------------------------------------------------------------
registerShot('s109', { draw(g, t, info) {
  const st = info.shot.start, tFreeze = shotWord("wouldn't", st, 2.03), tGoing = shotWord('going', st, 2.47);
  const z = lerp(1.0, 1.06, ease.inOut(t / info.dur)); const cold = ease.out(prog(t, tFreeze, tFreeze + 0.8));
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, [mix('#3d3360', '#10162c', cold), mix('#e8956b', '#2a2c50', cold), mix('#f7cf98', '#3a3050', cold)]); g.fillRect(0, 0, E.W, E.H);
  FX.godRays(g, E.W / 2, E.H + 100, { angle: -Math.PI / 2, spread: 1.2, len: 1700, color: '#ffe2a8', a: 0.1 * (1 - cold), t, count: 9 });
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2 + Math.sin(t * 0.6) * 5, -E.H / 2);
  const pw = 316, ph = 580, gap = 36, x0 = (E.W - (5 * pw + 4 * gap)) / 2, tags = ['DAY 2', 'DAY 4', 'DAY 12', 'DAY 15', 'DAY 19'];
  for (let i = 0; i < 5; i++) {
    const m = ease.out(prog(t, 0.0 + i * 0.07, tFreeze - 0.05 * (4 - i))), off = (1 - m) * (620 + i * 150), by = 250 + Math.sin(t * 1.3 + i) * (t < tFreeze ? 4 : 0);
    const sway = (1 - m) * (i % 2 ? 0.08 : -0.08) + (i % 2 ? 0.02 : -0.025);
    const expr = t > tGoing ? 'worried' : 'joy';
    framed(g, x0 + i * (pw + gap), by + off, pw, ph, { rot: sway, sc: 1 + 0.03 * ease.out(prog(t, tFreeze, tFreeze + 0.3)), tag: tags[i] }, (g) => riseScene(g, i, pw, ph, t, expr));
  }
  g.restore();
  veil(g, '#0a0f24', 0.3 * cold);
  atmos(g, t, { x: 0, y: 0, z: 1 }, { color: '#fff1dc', far: 24, near: 8 });
  // up-streaks while they climb
  if (t < tFreeze) FX.speedLines(g, t, { cx: E.W / 2, cy: E.H + 600, count: 24, a: 0.08 * (1 - ease.in(prog(t, tFreeze - 0.5, tFreeze))), inner: 900 });
} });

// ---------------------------------------------------------------------------------------------------
// s110 — MONTAGE DOWN
// ---------------------------------------------------------------------------------------------------
registerShot('s110', { draw(g, t, info) {
  const st = info.shot.start;
  const W = [shotWord('It', st, 0.1), shotWord('every', st, 0.55), shotWord('single', st, 0.89), shotWord('time', st, 1.27), shotWord('came', st, 1.93), shotWord('down', st, 2.15)];
  const pops = [W[0] + 0.05, W[1], W[2], W[3], W[4], W[5]], big = [1, 2, 3, 5];       // impact flashes on every / single / time / down
  let sx = 0, sy = 0; for (let i = 0; i < 6; i++) { const [a, b] = jumpShake(t, pops[i] + 0.12, big.includes(i) ? 24 : 12); sx += a; sy += b; }
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#1a1030', '#3a1c3a', '#5a2a30']); g.fillRect(0, 0, E.W, E.H);
  const lastHit = Math.max(...pops.filter(p => p < t), -9), pulse = Math.exp(-(t - lastHit) * 5);
  glow(g, E.W / 2, E.H * 0.5, 1100, '#ff7a4a', 0.12 + 0.14 * pulse);
  const z = 1.0 + 0.03 * ease.inOut(t / info.dur) + 0.02 * pulse; g.save(); g.translate(E.W / 2 + sx, E.H / 2 + sy); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  const pw = 540, ph = 400, gap = 40, x0 = (E.W - (3 * pw + 2 * gap)) / 2, y0 = (E.H - (2 * ph + gap)) / 2 + 6;
  const tags = ['DAY 1', 'DAY 4', 'DAY 5', 'DAY 9', 'DAY 12', 'DAY 6'];
  for (let i = 0; i < 6; i++) {
    const px = x0 + (i % 3) * (pw + gap), py = y0 + Math.floor(i / 3) * (ph + gap), k = t - pops[i];
    if (k < 0) { rr(g, px, py, pw, ph, 22); g.strokeStyle = 'rgba(255,241,220,.3)'; g.lineWidth = 4; g.setLineDash([16, 14]); g.stroke(); g.setLineDash([]); continue; }
    const p = ease.outBack(prog(k, 0, 0.18)), fl = Math.exp(-k * 14);
    framed(g, px, py, pw, ph, { rot: (i % 2 ? 0.012 : -0.012) * (1 - p), sc: 0.55 + 0.45 * p + 0.04 * Math.exp(-k * 8), tag: tags[i], flash: fl, tone: big.includes(i) ? '#ffe2a8' : '#fff1dc' }, (g) => landScene(g, i, pw, ph, t, k));
    if (k < 0.3) glow(g, px + pw / 2, py + ph / 2, 420, '#ffcf8f', 0.4 * (1 - k / 0.3));
  }
  g.restore();
  atmos(g, t, { x: 0, y: 0, z: 1 }, { color: '#ffd8b0', far: 18, near: 6 });
  for (const i of big) impactFrame(g, t, pops[i], { x: x0 + (i % 3) * (pw + gap) + pw / 2, y: y0 + Math.floor(i / 3) * (ph + gap) + ph * 0.75, seed: 5 + i });
  veil(g, '#1a0610', 0.22);
} });

// ---------------------------------------------------------------------------------------------------
// s111 — QUESTION lock-up
// ---------------------------------------------------------------------------------------------------
registerShot('s111', { draw(g, t, info) {
  const st = info.shot.start, ui = S().ui, cam = camMove(t, info.dur, { z: [1.0, 1.06], x: [-20, 20] });
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#14102c', '#2c1c40', '#4a2a3a']); g.fillRect(0, 0, E.W, E.H);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(cam.z, cam.z); g.translate(-E.W / 2 + cam.x, -E.H / 2);
  g.globalAlpha = 0.5;
  doublingGraph(g, t, { x: E.W * 0.12, y: E.H * 0.9, w: E.W * 0.76, h: E.H * 0.62, values: [0.5, 1, 2, 4, 8, 16, 32], labels: ['1', '2', '3', '4', '5', '6', '7'].map((s) => 'DAY ' + s), start: 0.1, per: 0.25, title: 'JUMP HEIGHT' });
  g.globalAlpha = 1; veil(g, '#120a24', 0.45);
  glow(g, E.W / 2, E.H * 0.38, 900, '#ff9a5a', 0.16);
  // title: words pop on the spoken words
  const lines = [[['WHAT', 'what'], ['DAY', 'day']], [['WOULD', 'would'], ['YOU', 'you'], ['STOP?', 'stop']]], ys = [E.H * 0.2, E.H * 0.38], size = 150;
  lines.forEach((ln, li) => {
    const ws = ln.map(([s]) => { g.save(); g.font = `700 ${size}px "${FONTS.title}"`; const w = g.measureText(s).width; g.restore(); return w; }), gp = 36, tot = ws.reduce((a, b) => a + b, 0) + gp * (ln.length - 1); let x = E.W / 2 - tot / 2;
    ln.forEach(([s, w], wi) => {
      const tw = shotWord(w, st, 0.4 + li * 0.5 + wi * 0.2), p = ease.outBack(prog(t, tw, tw + 0.3)), cx = x + ws[wi] / 2; x += ws[wi] + gp;
      if (p <= 0) return;
      g.save(); g.translate(cx, ys[li] + (1 - p) * 40); g.scale(p, p); g.rotate((wi - 1) * 0.015);
      text(g, s, 0, 0, { size, color: CREAM, font: FONTS.title, weight: 700, stroke: 26, strokeColor: '#1a0f26', glow: 30, glowColor: alpha('#ff9a40', 0.7) }); g.restore();
    });
  });
  // the counter cycles 01..25 as if asking
  const keys = [[0, 1]]; for (let i = 1; i < 25; i++) keys.push([0.15 + (info.dur - 0.9) * (i / 24) * (0.55 + 0.45 * (i / 24)), 1 + i]);
  const sway = Math.sin(t * 1.2) * 0.01; g.save(); g.translate(E.W / 2, E.H * 0.66); g.rotate(sway); g.translate(-E.W / 2, -E.H * 0.66);
  dayCounter(g, t, { x: E.W / 2, y: E.H * 0.66, s: 1.15, keys, flip: 0.1 }); g.restore();
  // comment bubble pops on 'comments'
  const tc = shotWord('comments', st, 2.37), bp = ease.outBack(prog(t, tc, tc + 0.35));
  if (bp > 0) { g.save(); g.translate(E.W * 0.82, E.H * 0.8 + Math.sin(t * 3) * 4); g.scale(bp, bp); g.rotate(-0.08); glow(g, 0, 0, 240, ui.gold, 0.25); UI.bubble(g, 0, 0, { w: 240, h: 140, color: '#f4efe6' }); g.restore(); if (t - tc < 0.5) { FX.sparkle(g, E.W * 0.82 + 120, E.H * 0.8 - 80, 40, '#fff', 0.9); FX.sparkle(g, E.W * 0.82 - 130, E.H * 0.8 - 60, 28, '#ffd47e', 0.9); } }
  g.restore();
  atmos(g, t, cam, { color: '#ffd8b0', far: 26, near: 8 });
  for (let i = 0; i < 14; i++) { const r = rng(40 + i), px = r() * E.W, py = (r() * E.H + t * (20 + r() * 20)) % E.H; FX.sparkle(g, px, py, 8 + r() * 6, '#ffe2a8', 0.35 + 0.3 * Math.sin(t * 2 + i)); }
} });

// ---------------------------------------------------------------------------------------------------
// s112 — END SCREEN
// ---------------------------------------------------------------------------------------------------
registerShot('s112', { draw(g, t, info) {
  const st = info.shot.start, ui = S().ui, tSub = shotWord('subscribe', st, 0.37), tMore = shotWord('more', st, 0.9), tIfs = shotWord('Ifs', st, 1.21);
  const cam = camMove(t, info.dur, { z: [1.0, 1.07], x: [30, -10], y: [20, 0] });
  const R = roofs(g, t, cam, { view: 'houses', mood: 'golden', ladder: 0, kite: 0 }), GY = R.GY, CX = R.CX;
  layer(g, cam, 1, (g) => {
    const Y = GY + 38, fl = { rim: { color: '#ffc68a', dir: [1, -0.5] }, t };
    const hp = t < tSub ? idle(POSES.relaxed, t, 1) : idle(poseAt(t, [[tSub, 'relaxed'], [tSub + 0.2, 'wave']], 0.2), t, 1);
    actor(g, 'HERO', { ...fl, x: CX - 330, y: Y, s: 2.4, facing: 1, pose: hp, expr: exprAt(t, [[0, 'smile'], [tSub, 'joy']]), blink: blinkFlag(t, 3.4, 1), look: lookToward(1, -0.1) });
    actor(g, 'MINA', { ...fl, x: CX - 640, y: Y + 14, s: 2.4, facing: 1, pose: idle(t < tIfs ? POSES.relaxed : reaction('delight', t, tIfs, 'relaxed'), t, 2), expr: exprAt(t, [[0, 'smile'], [tIfs, 'joy']]), blink: blinkFlag(t, 2.9, 2), look: lookToward(1, -0.1) });
    actor(g, 'DEV', { ...fl, x: CX - 90, y: Y + 6, s: 2.4, facing: 1, pose: idle(t < tMore ? POSES.relaxed : poseAt(t, [[tMore, 'relaxed'], [tMore + 0.25, 'pointUp']], 0.2), t, 3), expr: exprAt(t, [[0, 'smile'], [tMore, 'smirk']]), blink: blinkFlag(t, 3.1, 3), look: lookToward(1, -0.1) });
    cat(g, { x: CX - 490, y: Y + 28, s: 2.2, facing: 1, pose: 'sit', t, rim: fl.rim, eyes: t > tIfs ? 'glint' : 'auto' });
  });
  roofsFg(g, t, cam, { view: 'houses' });
  // sunrise bloom + rays
  glow(g, CX + 820, GY - 380, 700, '#ffcf8f', 0.28); FX.godRays(g, CX + 820, GY - 380, { angle: 2.4, spread: 0.9, len: 1700, color: '#ffe2a8', a: 0.09, t });
  atmos(g, t, cam, { color: '#ffe8c0', far: 26, near: 8 });
  // DAY 01 above the cast (the loop)
  const dp = ease.outBack(prog(t, 0.1, 0.6)); g.save(); g.translate(CX - 300, 190); g.scale(dp, dp); g.translate(-(CX - 300), -190);
  dayCounter(g, t, { x: CX - 300, y: 190, s: 0.85, day: 1 }); g.restore();
  // question + subscribe pill + like + comment bubble
  const qa = ease.out(prog(t, 0.15, 0.7)); text(g, 'WHAT DAY WOULD YOU STOP?', CX + 470, 236, { size: 60, color: CREAM, font: FONTS.title, weight: 700, stroke: 12, strokeColor: '#1a0f26', glow: 18, glowColor: alpha('#ff9a40', 0.6), alpha: qa });
  const sp = ease.outBack(prog(t, tSub - 0.05, tSub + 0.45)), px = CX + 450, py = 590;
  if (sp > 0) { g.save(); g.translate(px, py); g.scale(sp, sp); const bump = 1 + 0.03 * Math.sin(t * 6); g.scale(bump, bump); rr(g, -230, -58, 460, 116, 58); g.fillStyle = '#e0302a'; g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 4; g.stroke();
    g.fillStyle = '#fff'; g.beginPath(); g.moveTo(-168, 16); g.quadraticCurveTo(-168, -26, -148, -26); g.quadraticCurveTo(-128, -26, -128, 16); g.closePath(); g.fill(); circle(g, -148, 26, 7, '#fff'); text(g, 'Subscribe', 30, 3, { size: 54, color: '#fff', font: FONTS.ui, weight: 900 }); g.restore(); }
  const bp = ease.outBack(prog(t, tMore, tMore + 0.4)); if (bp > 0) { g.save(); g.translate(px - 120, py + 130); g.scale(bp, bp); UI.bubble(g, 0, 0, { w: 150, h: 84 }); g.restore(); }
  const lp = ease.outBack(prog(t, tMore + 0.15, tMore + 0.6)); if (lp > 0) { g.save(); g.translate(px + 110, py + 130); g.scale(lp, lp); g.fillStyle = '#fff1dc'; rr(g, -70, -8, 34, 52, 8); g.fill(); g.beginPath(); g.moveTo(-26, 44); g.lineTo(-26, -6); g.lineTo(-2, -44); g.quadraticCurveTo(14, -52, 16, -34); g.lineTo(8, -8); g.lineTo(58, -8); g.quadraticCurveTo(76, -6, 70, 12); g.lineTo(60, 38); g.quadraticCurveTo(56, 46, 46, 46); g.closePath(); g.fill(); g.restore(); if (t - tMore < 0.9) FX.sparkle(g, px + 160, py + 80, 34 * (1 - (t - tMore) / 0.9), '#fff', 0.9); }
  const fade = prog(t, info.dur - 0.7, info.dur); if (fade > 0) veil(g, '#0a0612', fade);
} });
