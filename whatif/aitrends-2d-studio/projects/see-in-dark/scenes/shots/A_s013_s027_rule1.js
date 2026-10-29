// A_s013_s027_rule1.js — batch A, Rule 1 "your eyes quit first": cones, the cinema, the cat, the photon test, thermal discovery (s013-s027).
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, key, clamp, lerp, wordTime, alpha, glow, shake, talkAmount, text, FONTS, rr, seg, circle, poly, ring, linGrad, radGrad, shade, mix, backdrop, rng } from '/engine/core.js';
import { POSES, posesAt, breathe, walkPose, blendPose, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { actor, cat } from '../sets/actors.js';
import { apartment, apartmentFg, apartmentGround } from '../sets/apartment.js';
import { cinema, cinemaFg } from '../sets/cinema.js';
import { lab, labFg } from '../sets/lab.js';
import { thermalView, heatActor, heatBlob, heatRect, heatCat } from '../sets/thermal.js';
import { chip, darkness } from '../sets/hud.js';
import * as BP from '../sets/bp.js';
import { HERO, DEV, VOLUNTEER } from '../cast.js';

const W = (word, st, fb) => (wordTime(word, st) ?? st + fb) - st;     // shot-local time of a spoken word (fallback: fb s into the shot)
const handAt = (o, which = 'hF') => { const s = (o.s ?? 1) * (o.kid ? 0.72 : 1), f = o.facing ?? 1, p = o.pose[which]; return [o.x + f * s * p[0], o.y + s * p[1]]; };
// Dev's popcorn bucket (red-and-cream stripes), drawn at a hand
function popcorn(g, x, y, s = 1, tip = 0) {
  g.save(); g.translate(x, y); g.rotate(tip); g.scale(s, s);
  poly(g, [[-22, -36], [22, -36], [16, 14], [-16, 14]], '#f2ece0');
  for (const sx of [-14, 0, 14]) poly(g, [[sx - 4, -36], [sx + 4, -36], [sx * 0.75 + 3, 14], [sx * 0.75 - 3, 14]], '#d8433a');
  for (let i = 0; i < 7; i++) circle(g, -18 + i * 6, -40 - (i % 2) * 6, 7, '#fff3c4');
  g.restore();
}
const kernel = (g, x, y, r = 7) => { circle(g, x, y, r, '#fff3c4'); circle(g, x + r * 0.4, y - r * 0.3, r * 0.6, '#ffe39a'); };

// s013 — "It also holds about six million cones."  blueprint: the retina inset swaps to cones
registerShot('s013', { draw(g, t, info) {
  const st = info.shot.start, tMil = W('million', st, 1.4), tCones = W('cones', st, 1.9), k = t / info.dur, c = 1.02 + 0.04 * k;
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(c, c); g.translate(-E.W / 2 - 30 * k, -E.H / 2);
  BP.board(g, t, { title: 'THE HUMAN EYE', fig: 'FIG 2 - RETINA, CONE CELLS' });
  BP.eye(g, t, { x: E.W * 0.2, y: E.H * 0.5, r: 170, k: 1 });
  const sw = ease.inOut(prog(t, Math.max(0.3, tCones - 0.9), tCones + 0.2));
  BP.draw(g, [[E.W * 0.2 + 160, E.H * 0.5], [E.W * 0.6 - 420, E.H * 0.5 - 100]], 1, { w: 2.5, color: 'rgba(255,212,126,.8)' });
  g.save(); g.globalAlpha *= 1 - sw * 0.85; BP.retina(g, t, { x: E.W * 0.62, y: E.H * 0.5, w: 820, h: 440, rods: true, cones: false }); g.restore();
  if (sw > 0) { g.save(); g.globalAlpha *= sw; BP.retina(g, t, { x: E.W * 0.62, y: E.H * 0.5, w: 820, h: 440, rods: true, cones: true }); g.restore(); }
  // the three cone colours pop as little tags over the inset
  ['RED', 'GREEN', 'BLUE'].forEach((s, i) => { const p = ease.outBack(prog(t, tCones + 0.1 + i * 0.18, tCones + 0.5 + i * 0.18)); if (p > 0.01) { g.save(); g.translate(E.W * 0.47 + i * 210, E.H * 0.75); g.scale(p, p); text(g, s, 0, 0, { size: 34, color: ['#ff7a6a', '#8aef9a', '#7aa8ff'][i], font: FONTS.ui, weight: 900, spacing: 3, glow: 12 }); g.restore(); } });
  BP.label(g, t, { at: [E.W * 0.62 - 140, E.H * 0.5 - 120], to: [E.W * 0.62 - 140, E.H * 0.5 - 280], str: 'CONES', start: tCones });
  g.restore();
  chip(g, t, { dur: info.dur - 0.05, str: 'About 6 million cones', at: tMil, x: E.W * 0.62, y: E.H * 0.86, tone: 'gold' });
} });

// s014 — "Cones handle colour. And at night, they clock out."  gag: cone workers punch out at a time clock, the poster drains to grey
registerShot('s014', { draw(g, t, info) {
  const st = info.shot.start, tClock = W('clock', st, 2.2), tNight = W('night', st, 1.6), k = ease.inOut(t / info.dur);
  const cam = { z: 1.06 + 0.06 * k, x: lerp(-20, 30, k), y: 0 };
  layer(g, cam, 0.6, (g) => {
    backdrop(g, ['#1a1528', '#120f1e', '#0a0812']);
    g.fillStyle = alpha('#000', 0.25); for (let x = -200; x < E.W + 200; x += 120) g.fillRect(x, 0, 8, E.H);
    glow(g, E.W * 0.5, E.H * 0.1, 900, '#8aa0ff', 0.16);
  });
  // workers leave one by one from "night"; the poster keeps the colour of those still on shift
  const n = 6, gone = (i) => prog(t, tNight - 0.1 + i * 0.32, tNight + 0.55 + i * 0.32), left = Array.from({ length: n }, (_, i) => gone(i) < 1 ? 1 : 0).reduce((a, b) => a + b, 0), sat = left / n;
  layer(g, cam, 1, (g) => {
    // the rainbow poster on the cinema wall
    const px = E.W * 0.2, py = E.H * 0.16, pw = 560, ph = 620;
    rr(g, px - 16, py - 16, pw + 32, ph + 32, 10); g.fillStyle = '#2a2236'; g.fill();
    const cols = ['#ff4d4d', '#ff9a3c', '#ffe14d', '#5ee06a', '#4da3ff', '#9a6bff'];
    cols.forEach((c, i) => { g.fillStyle = mix('#77707f', c, sat); g.beginPath(); g.arc(px + pw / 2, py + ph * 0.86, pw * 0.46 - i * 34, Math.PI, 0); g.lineTo(px + pw / 2 + pw * 0.46 - i * 34 - 34, py + ph * 0.86); g.arc(px + pw / 2, py + ph * 0.86, pw * 0.46 - (i + 1) * 34, 0, Math.PI, true); g.closePath(); g.fill(); });
    text(g, 'NOW SHOWING', px + pw / 2, py + 70, { size: 44, color: mix('#8a8494', '#ffe9b0', sat), font: FONTS.title, weight: 700, spacing: 4 });
    // the time clock on the right
    const cx = E.W * 0.78, cy = E.H * 0.42; rr(g, cx - 90, cy - 150, 180, 300, 16); g.fillStyle = '#3a3448'; g.fill(); g.strokeStyle = '#5a5468'; g.lineWidth = 4; g.stroke();
    FX.clock(g, cx, cy - 70, 56, 21 * 3600 + t * 60, { face: '#efe9dc' }); rr(g, cx - 40, cy + 20, 80, 70, 8); g.fillStyle = '#1a1622'; g.fill();
    text(g, 'CLOCK OUT', cx, cy + 120, { size: 22, color: '#c9c2d6', font: FONTS.ui, weight: 900, spacing: 2 });
    // cone workers: little coloured cones on stick legs, queued, each walks to the clock and punches out (a stamp + puff)
    const GY = E.H * 0.82; g.fillStyle = alpha('#000', 0.3); g.fillRect(-E.W, GY, E.W * 3, 200);
    for (let i = 0; i < n; i++) {
      const gp = gone(i), x0 = E.W * 0.44 + i * 62, x = lerp(x0, cx - 60, ease.inOut(gp)), out = gp >= 1 ? 1 : 0, ph = gp > 0 && gp < 1 ? t * 12 : 0;
      if (out) { const pt = t - (tNight + 0.55 + i * 0.32); if (pt < 0.4) circle(g, cx - 60, GY - 70, 30 * (1 + pt * 3), alpha('#ffffff', 0.25 * (1 - pt / 0.4))); continue; }
      const col = ['#ff6a5a', '#7adf8a', '#6a9aff'][i % 3], by = GY - 34 - Math.abs(Math.sin(ph)) * 6;
      seg(g, [[x - 8, by + 4], [x - 10 + Math.sin(ph) * 8, GY]], 4, '#1a1622'); seg(g, [[x + 8, by + 4], [x + 10 - Math.sin(ph) * 8, GY]], 4, '#1a1622');
      poly(g, [[x - 22, by + 6], [x + 22, by + 6], [x + 5, by - 66], [x - 5, by - 66]], col); circle(g, x - 6, by - 34, 3.5, '#1a1622'); circle(g, x + 6, by - 34, 3.5, '#1a1622');
      seg(g, [[x - 6, by - 22], [x + 6, by - 24]], 2.5, '#1a1622');
    }
  });
  if (Math.abs(t - tClock) < 0.5) FX.sparkle(g, E.W * 0.78, E.H * 0.42 + 55, 30, '#ffe9b0', 0.6 * (1 - Math.abs(t - tClock) / 0.5));
  FX.dust(g, t, { count: 24, color: '#d8d0ff', a: 0.18 });
} });

// s015 — "Walk from sunshine into a cinema. You are blind."  a blazing doorway shrinks; HERO and DEV step in and stop, blind
registerShot('s015', { draw(g, t, info) {
  const st = info.shot.start, tBlind = W('blind', st, 2.6), k = ease.inOut(t / info.dur);
  const cam = { z: 1.12 + 0.12 * k, x: lerp(-520, -420, k), y: 40 };
  const door = key(t, [[0, 1], [1.4, 1], [2.6, 0.12]], ease.inOut);
  const C = cinema(g, t, cam, { screen: 0.12, door });
  const walk = (x0, x1, a, b) => lerp(x0, x1, ease.out(prog(t, a, b)));
  layer(g, cam, 1, (g) => {
    const dx = C.CX - 1080, hx = walk(dx, dx + 420, 0.1, 1.9), vx = walk(dx - 120, dx + 230, 0.4, 2.3);
    const hp = t < 1.9 ? walkPose(t * Math.PI * 2 * 1.0) : posesAt(t, [[0, 'stand'], [tBlind, 'reach']], 0.4);
    const vp = t < 2.3 ? walkPose(t * Math.PI * 2 * 1.0 + 1) : posesAt(t, [[0, 'stand'], [tBlind + 0.2, 'handsOnHead']], 0.4);
    const rim = { color: '#fff4dc', dir: [-1, -0.2] };
    actor(g, 'DEV', { x: vx, y: C.GY, s: 1.5, facing: 1, pose: breathe(vp, t, 1, 1), expr: t > tBlind ? 'scared' : 'neutral', look: [Math.sin(t * 2) * 0.8, 0], rim, t });
    actor(g, 'HERO', { x: hx, y: C.GY, s: 1.5, facing: 1, pose: breathe(hp, t, 1), expr: t > tBlind ? 'worried' : 'neutral', look: [Math.sin(t * 1.4 + 1) * 0.8, 0], rim, t });
  });
  cinemaFg(g, t, cam);
  // eyes adjusting: the frame itself darkens as the door closes
  darkness(g, 0.15 + 0.35 * ease.inOut(prog(t, 1.6, 3.0)), { x: E.W * 0.42, y: E.H * 0.6, r: 900 });
  FX.dust(g, t, { count: 40, color: '#fff2d6', a: 0.25 * door + 0.08 });
} });

// s016 — "Your rods need twenty to thirty minutes to catch up."  a giant clock sweeps 20 -> 30 min over the dark hall, a rod battery refills
registerShot('s016', { draw(g, t, info) {
  const st = info.shot.start, tT = W('twenty', st, 0.9), tTh = W('thirty', st, 1.6), k = ease.inOut(t / info.dur);
  const cam = { z: 1.04 + 0.05 * k, x: 0, y: 0 };
  cinema(g, t, cam, { screen: 0.08, door: 0 }); veil(g, '#05060f', 0.55);
  const cx = E.W * 0.38, cy = E.H * 0.47, r = 300, mins = key(t, [[0, 0], [tT, 20], [tTh + 0.6, 30]], ease.inOut);
  g.save(); g.translate(cx, cy); const sc = 0.96 + 0.04 * k; g.scale(sc, sc);
  glow(g, 0, 0, r * 1.6, '#ffd47e', 0.12); circle(g, 0, 0, r, alpha('#0d1226', 0.9)); ring(g, 0, 0, r, 8, alpha('#ffd47e', 0.8));
  for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2 - Math.PI / 2, L = i % 5 ? 14 : 30; seg(g, [[Math.cos(a) * (r - 18), Math.sin(a) * (r - 18)], [Math.cos(a) * (r - 18 - L), Math.sin(a) * (r - 18 - L)]], i % 5 ? 2 : 4, alpha('#ffd47e', 0.7)); }
  // the swept wedge 0 -> mins, and the 20-30 band highlighted
  g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = alpha('#ffb04a', 0.18); g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, r - 40, -Math.PI / 2, -Math.PI / 2 + mins / 60 * Math.PI * 2); g.closePath(); g.fill(); g.restore();
  const band = ease.out(prog(t, tT, tT + 0.5)); if (band > 0) { g.strokeStyle = alpha('#ffd47e', 0.9 * band); g.lineWidth = 26; g.beginPath(); g.arc(0, 0, r - 54, -Math.PI / 2 + 20 / 60 * Math.PI * 2, -Math.PI / 2 + lerp(20, 30, band) / 60 * Math.PI * 2); g.stroke(); }
  const ha = -Math.PI / 2 + mins / 60 * Math.PI * 2; seg(g, [[0, 0], [Math.cos(ha) * (r - 60), Math.sin(ha) * (r - 60)]], 10, '#fff3dc'); circle(g, 0, 0, 16, '#fff3dc');
  text(g, `${Math.round(mins)} MIN`, 0, r * 0.42, { size: 64, color: '#fff3dc', font: FONTS.ui, weight: 900, glow: 16, glowColor: 'rgba(255,170,80,.6)' });
  g.restore();
  // the rods battery refilling
  const bx = E.W * 0.74, by = E.H * 0.47, fill = clamp(mins / 30);
  rr(g, bx - 90, by - 220, 180, 400, 26); g.fillStyle = alpha('#0d1226', 0.9); g.fill(); g.strokeStyle = alpha('#b8c8ff', 0.85); g.lineWidth = 6; g.stroke(); rr(g, bx - 40, by - 246, 80, 30, 8); g.fillStyle = '#b8c8ff'; g.fill();
  const fh = 360 * fill; rr(g, bx - 70, by + 160 - fh, 140, fh, 14); g.fillStyle = linGrad(g, 0, by + 160, 0, by - 200, ['#5a6aff', '#b8c8ff']); g.fill();
  for (let i = 0; i < 6; i++) { const rx = bx - 55 + i * 22, lit = fill > i / 6; rr(g, rx - 6, by - 150, 12, 230, 6); g.fillStyle = alpha('#ffffff', lit ? 0.5 : 0.08); g.fill(); }
  text(g, 'RODS', bx, by + 230, { size: 40, color: '#b8c8ff', font: FONTS.ui, weight: 900, spacing: 4 });
  chip(g, t, { dur: info.dur - 0.05, str: 'Rods: 20-30 minutes', at: tTh, x: E.W * 0.5, y: E.H * 0.88, tone: 'gold' });
  FX.dust(g, t, { count: 30, color: '#b8c8ff', a: 0.2 });
} });

// s017 — "Dev shuffles in beside you, orange beanie first, popcorn flying."  DEV stumbles in, popcorn arcs; HERO stands steady
registerShot('s017', { draw(g, t, info) {
  const st = info.shot.start, tBeanie = W('beanie', st, 2.2), tFly = W('flying', st, 3.2), k = ease.inOut(t / info.dur);
  const cam = { z: 1.45 + 0.08 * k, x: lerp(-260, -200, k), y: 90 };
  const C = cinema(g, t, cam, { screen: 0.22, door: 0 });
  const hx = C.CX - 60, dx = lerp(C.CX - 620, C.CX - 260, ease.out(prog(t, 0.0, 2.6))), stum = Math.max(0, Math.sin(prog(t, tFly - 0.6, tFly + 0.3) * Math.PI));
  layer(g, cam, 1, (g) => {
    const rim = { color: '#9fd0ff', dir: [0.3, -1] };
    actor(g, 'HERO', { x: hx, y: C.GY, s: 1.6, facing: -1, pose: breathe(posesAt(t, [[0, 'relaxed'], [tBeanie, 'crossArms']]), t, 1), expr: t > tFly ? 'smirk' : 'neutral', look: [-0.7, 0], rim, t });
    const base = t < 2.6 ? walkPose(t * Math.PI * 2 * 1.3, { stride: 14, lift: 6 }) : posesAt(t, [[0, 'stand'], [2.6, 'holdFront']]);
    const dp = { ...breathe(stum > 0.05 ? blendPose(base, POSES.fall, stum * 0.7) : base, t, 1, 3), hF: [26, -146], eF: [18, -128] };
    const D = { x: dx, y: C.GY, s: 1.6, facing: 1, pose: dp };
    actor(g, 'DEV', { ...D, expr: stum > 0.2 ? 'shocked' : 'confused', look: [0.4, -0.2], rim, t });
    const [px, py] = handAt(D); popcorn(g, px, py, 1.6, stum * 0.6 + Math.sin(t * 8) * 0.04);
    // kernels flying in slow arcs from the bucket
    const r = rng(17); for (let i = 0; i < 26; i++) { const t0 = tFly - 0.7 + r() * 0.5, u = t - t0; if (u < 0) continue; const vx = 160 + r() * 380, vy = -420 - r() * 300; const x = px + vx * u * 0.55, y = py - 60 + vy * u * 0.55 + 520 * u * u * 0.3; if (y < C.GY + 30) kernel(g, x, y, 7 + r() * 4); }
    if (t > tBeanie - 0.2 && t < tBeanie + 0.8) glow(g, dx + 6, C.GY - 360, 90, '#f08a24', 0.35 * Math.sin(prog(t, tBeanie - 0.2, tBeanie + 0.8) * Math.PI));
  });
  cinemaFg(g, t, cam);
  FX.dust(g, t, { count: 36, color: '#cfe6ff', a: 0.22 });
} });

// s018 — "Where is row F? he groans. You walk straight to it."  DEV squints at nothing; HERO walks straight to row F
registerShot('s018', { draw(g, t, info) {
  const st = info.shot.start, tGroan = W('groans', st, 1.6), tWalk = W('walk', st, 2.6), k = ease.inOut(t / info.dur);
  const rowX = E.W / 2 + 260,                                          // cinema pos.rowFX (row F seat end)
     cam = { z: 1.32, x: key(t, [[0, -200], [tWalk, -180], [info.dur, rowX - E.W / 2 + 40]], ease.inOut), y: 70 };
  const C = cinema(g, t, cam, { screen: 0.18, door: 0 });
  layer(g, cam, 1, (g) => {
    const rim = { color: '#9fd0ff', dir: [0.2, -1] };
    const hx = lerp(C.CX - 120, rowX - 70, ease.inOut(prog(t, tWalk, info.dur - 0.2))), walking = t > tWalk && t < info.dur - 0.25;
    actor(g, 'HERO', { x: hx, y: C.GY, s: 1.55, facing: 1, pose: breathe(walking ? walkPose(t * Math.PI * 2 * 1.1) : POSES.relaxed, t, 1), expr: t > tWalk ? 'smirk' : 'neutral', look: [0.8, 0], rim, t });
    const dxp = lerp(C.CX - 380, rowX - 360, ease.inOut(prog(t, tWalk + 0.5, info.dur))), bump = Math.max(0, Math.sin((t - tWalk) * 7)) * (t > tWalk + 0.5 ? 1 : 0);
    const dp = breathe(posesAt(t, [[0, 'holdFront'], [0.3, 'reach'], [tGroan + 0.4, 'reach']]), t, 1, 2);
    const D = { x: dxp, y: C.GY, s: 1.55, facing: 1, pose: dp };
    actor(g, 'DEV', { ...D, expr: t < tGroan + 0.8 ? 'angry' : 'confused', talk: talkAmount(info.globalT, st, st + tGroan - 0.05), look: [Math.sin(t * 2.5) * 0.9, 0.1], rim, t, rot: bump * 0.05 });
    popcorn(g, D.x - 20 * D.s, C.GY - 160, 1.4, -0.2);
  });
  // the row F sign glows in the foreground blur
  blurLayer(g, 7, (g) => { const fx = rowX - 40; rr(g, fx - 70, C.GY + 60, 140, 110, 14); g.fillStyle = '#1a1826'; g.fill(); glow(g, fx, C.GY + 115, 160, '#ffd47e', 0.55 + 0.1 * Math.sin(t * 5)); text(g, 'F', fx, C.GY + 118, { size: 84, color: '#ffe9b0', font: FONTS.title, weight: 700 }); }, cam, 1.35);
  cinemaFg(g, t, cam);
  FX.dust(g, t, { count: 36, color: '#cfe6ff', a: 0.22 });
} });

// s019 — "A cat needs roughly a sixth of the light you do."  giant close-up of Biscuit: huge pupils narrow
registerShot('s019', { draw(g, t, info) {
  const st = info.shot.start, tSix = W('sixth', st, 1.2), k = ease.inOut(t / info.dur);
  const cam = { z: 1.04 + 0.08 * k, x: 0, y: 0 };
  layer(g, cam, 0.5, (g) => { backdrop(g, ['#101532', '#0a0d20', '#06070f']); glow(g, E.W * 0.8, E.H * 0.1, 900, '#7f9cff', 0.18); });
  const cs = 15, cx = E.W * 0.56, cy = E.H * 0.5;
  layer(g, cam, 1, (g) => cat(g, { x: cx + 12 * cs, y: cy + 72 * cs, s: cs, facing: -1, pose: 'sit', eyes: t < tSix - 0.3 ? 'wide' : 'open', t, rim: { color: '#9fb6ff', dir: [0.7, -0.7] } }));
  // the pupils: big round in the dark, narrowing to slits when the light comes up a touch
  const nar = ease.inOut(prog(t, tSix - 0.3, tSix + 0.7));
  layer(g, cam, 1, (g) => { for (const ex of [-3, -14]) { const x = cx + ex * cs, y = cy - 3 * cs; g.fillStyle = '#0a0810'; g.beginPath(); g.ellipse(x, y, lerp(46, 10, nar), lerp(60, 66, nar), 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#ffffff'; g.fillRect(x - 22, y - 30, 10, 10); glow(g, x, y, 170, '#c8f07a', 0.18); } });
  chip(g, t, { dur: info.dur - 0.05, str: 'Cat: about 1/6 the light', at: tSix, x: E.W * 0.3, y: E.H * 0.84, tone: 'gold' });
  FX.dust(g, t, { count: 24, color: '#c9d4ff', a: 0.2 });
} });

// s020 — "You? None. But even a cat is blind in true darkness."  HERO calm on the sofa, a big "0"; Biscuit bonks into the wall
registerShot('s020', { draw(g, t, info) {
  const st = info.shot.start, tNone = W('none', st, 0.7), tBlind = W('blind', st, 3.2), k = ease.inOut(t / info.dur);
  const cam = { z: 1.3 + 0.06 * k, x: lerp(-260, -200, k), y: 60 };
  const A = apartment(g, t, cam, { power: 0, moon: 0.4 }), P = A.pos;
  const wallX = P.doorX + 140, catX = key(t, [[0, P.sofaX + 380], [tBlind - 0.1, wallX + 70], [tBlind + 0.4, wallX + 120]], ease.inOut), bonk = t > tBlind - 0.1 && t < tBlind + 0.5;
  layer(g, cam, 1, (g) => {
    actor(g, 'HERO', { x: P.sofaX - 20, y: A.GY - 10, s: 1.5, facing: 1, pose: breathe(POSES.sitBack, t, 0.8), expr: 'smirk', look: [-0.6 + 0.6 * Math.sin(t * 0.7), 0], rim: A.rim, t });
    g.fillStyle = '#05050a'; g.fillRect(wallX - 200, A.GY - 700, 200, 700);                                  // the wall edge Biscuit walks into
    const [sx, sy] = shake(t, bonk ? 6 : 0, 30);
    cat(g, { x: catX + sx, y: A.GY + sy, s: 1.5, facing: -1, pose: bonk ? 'sit' : 'stand', eyes: bonk ? 'blink' : 'wide', t, rim: A.rim });
    if (bonk) { for (let i = 0; i < 3; i++) { const a = t * 6 + i * 2.1; FX.sparkle(g, wallX + 70 + Math.cos(a) * 50, A.GY - 150 + Math.sin(a) * 18, 12, '#ffe9b0', 0.7); } }
  });
  apartmentFg(g, t, cam);
  darkness(g, 0.55, { x: E.W * 0.45, y: E.H * 0.6, r: 1100 });
  const zk = ease.outBack(prog(t, tNone, tNone + 0.5)) * clamp((tBlind - 0.3 - t) / 0.4);
  if (zk > 0.01) { g.save(); g.translate(E.W * 0.32, E.H * 0.3); g.scale(zk, zk); glow(g, 0, 0, 260, '#ffd47e', 0.25); text(g, '0', 0, 0, { size: 260, color: '#ffd47e', font: FONTS.title, weight: 700, glow: 40, glowColor: 'rgba(255,170,80,.8)' }); text(g, 'LIGHT NEEDED', 0, 150, { size: 34, color: '#fff3dc', font: FONTS.ui, weight: 900, spacing: 4 }); g.restore(); }
  FX.dust(g, t, { count: 22, color: '#c9d4ff', a: 0.16 });
} });

// s021 — "Humans are not hopeless, though. In a 2016 experiment,"  lab in near dark: volunteers with notepads, a glow at the far end
registerShot('s021', { draw(g, t, info) {
  const st = info.shot.start, tYear = W('2016', st, 2.6), k = ease.inOut(t / info.dur);
  const cam = { z: 1.08 + 0.1 * k, x: lerp(-80, 40, k), y: 30 };
  const L = lab(g, t, cam, { lights: 0.08, wall: (g, x, y, w, h) => { glow(g, x + w * 0.5, y + h * 0.5, 180, '#e8f0ff', 0.4 + 0.15 * Math.sin(t * 2)); for (let r = 0; r < 4; r++) text(g, ['E', 'F P', 'T O Z', 'L P E D'][r], x + w * 0.5, y + h * (0.22 + r * 0.18), { size: 54 - r * 10, color: alpha('#e8f0ff', 0.5), font: FONTS.ui, weight: 900, spacing: 6 }); } });
  layer(g, cam, 1, (g) => {
    for (let i = 0; i < 5; i++) {
      const x = L.CX - 640 + i * 300, sp = breathe(posesAt(t, [[0, 'sit'], [0.8 + i * 0.37, 'think'], [2.2 + i * 0.3, 'sit']], 0.5), t, 0.8, i);
      g.fillStyle = '#16141e'; g.fillRect(x - 40, L.GY - 76, 90, 12); seg(g, [[x - 30, L.GY - 64], [x - 30, L.GY]], 6, '#16141e'); seg(g, [[x + 40, L.GY - 64], [x + 40, L.GY]], 6, '#16141e');
      actor(g, VOLUNTEER, { x, y: L.GY - 8, s: 1.15, facing: 1, pose: sp, expr: i % 2 ? 'thinking' : 'neutral', look: [1, -0.2], rim: { color: '#cfe0ff', dir: [1, -0.3] }, t: t + i });
      const [hx, hy] = handAt({ x, y: L.GY - 8, s: 1.15, facing: 1, pose: sp }); rr(g, hx - 6, hy - 22, 30, 38, 3); g.fillStyle = '#d8d4c8'; g.fill();
    }
  });
  labFg(g, t, cam);
  chip(g, t, { dur: info.dur - 0.05, str: 'Nature Comms, 2016', at: tYear, x: E.W * 0.5, y: E.H * 0.88, tone: 'blue' });
  FX.dust(g, t, { count: 30, color: '#cfe0ff', a: 0.2 });
} });

// s022 — "volunteers spotted single photons better than chance. One photon. One."  blueprint: one photon into the eye, a ripple, a big gold 1
registerShot('s022', { draw(g, t, info) {
  const st = info.shot.start, tPh = W('photons', st, 1.2), tOne = (wordTime('one', st + 1.5) ?? st + 2.9) - st, tOne2 = (wordTime('one', st + tOne + 0.4) ?? st + 3.9) - st, k = t / info.dur, c = 1.0 + 0.05 * k;
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(c, c); g.translate(-E.W / 2, -E.H / 2);
  BP.board(g, t, { title: 'SINGLE PHOTON TEST', fig: 'FIG 3 - ONE PHOTON' });
  const ex = E.W * 0.6, ey = E.H * 0.5, r = 230; BP.eye(g, t, { x: ex, y: ey, r, k: 1, rays: false });
  const pk = ease.inOut(prog(t, 0.3, Math.max(0.8, tOne - 0.2))), from = [E.W * 0.08, ey - 20], to = [ex + r * 0.92, ey];
  if (pk < 1) { const px = lerp(from[0], to[0], pk), py = lerp(from[1], to[1], pk); glow(g, px, py, 90, '#fff3c4', 0.6); BP.photon(g, t, { from, to, k: pk }); }
  BP.draw(g, [from, [lerp(from[0], to[0], pk), lerp(from[1], to[1], pk)]], 1, { w: 2, color: 'rgba(255,240,200,.35)' });
  const hit = t - (tOne - 0.2); if (hit > 0) { for (let i = 0; i < 3; i++) { const u = (hit * 1.3 - i * 0.25); if (u > 0 && u < 1) ring(g, to[0], to[1], 20 + u * 140, 4, alpha('#ffd47e', 0.8 * (1 - u))); } glow(g, to[0], to[1], 120, '#ffd47e', 0.6 * Math.exp(-hit * 1.5) + 0.15); }
  g.restore();
  const nk = ease.outBack(prog(t, tOne - 0.1, tOne + 0.35)), pulse = 1 + 0.1 * Math.max(0, 1 - Math.abs(t - tOne2) * 4);
  if (nk > 0.01) { g.save(); g.translate(E.W * 0.24, E.H * 0.42); g.scale(nk * pulse, nk * pulse); glow(g, 0, 0, 300, '#ffd47e', 0.3); text(g, '1', 0, 0, { size: 300, color: '#ffd47e', font: FONTS.title, weight: 700, glow: 50, glowColor: 'rgba(255,170,80,.8)' }); g.restore(); }
  chip(g, t, { dur: info.dur - 0.05, str: 'Better than chance', at: tPh + 0.4, x: E.W * 0.24, y: E.H * 0.8, tone: 'blue' });
} });

// s023 — "Upside, no more stubbed toes."  insert: a bare foot slides past the coffee-table leg; checkmark sparkle + thumbs-up
registerShot('s023', { draw(g, t, info) {
  const st = info.shot.start, tToes = W('toes', st, 1.2), k = ease.inOut(t / info.dur);
  const cam = { z: 1.05 + 0.08 * k, x: lerp(-30, 30, k), y: 0 };
  layer(g, cam, 0.6, (g) => { backdrop(g, ['#0d1024', '#141a33', '#0a0b16']); glow(g, E.W * 0.15, E.H * 0.1, 800, '#7f9cff', 0.18); });
  const GY = E.H * 0.8;
  layer(g, cam, 1, (g) => {
    g.fillStyle = '#0c0e1c'; g.fillRect(-E.W, GY, E.W * 3, E.H); g.fillStyle = alpha('#9fb6ff', 0.12); g.fillRect(-E.W, GY, E.W * 3, 4);
    const lx = E.W * 0.56; rr(g, lx - 40, GY - 640, 80, 640, 10); g.fillStyle = '#3a2a2a'; g.fill(); g.fillStyle = alpha('#cfe0ff', 0.25); g.fillRect(lx - 40, GY - 640, 6, 640);   // table leg
    rr(g, lx - 380, GY - 700, 760, 70, 14); g.fillStyle = '#2a2026'; g.fill();
    const fx = key(t, [[0, E.W * 0.12], [tToes, lx - 150], [info.dur, E.W * 0.95]], ease.inOut), lift = Math.sin(prog(t, tToes - 0.5, tToes + 0.3) * Math.PI) * 26;
    g.save(); g.translate(fx, GY - lift); rr(g, -200, -150, 120, 170, 50); g.fillStyle = shade(HERO.legs, -0.2); g.fill();      // ankle (trouser hem)
    const foot = () => { g.beginPath(); g.ellipse(-60, -26, 140, 46, 0, 0, Math.PI * 2); for (let i = 0; i < 5; i++) { const tx = 74 - i * 7, ty = -52 + i * 13, tr = 18 - i * 1.8; g.moveTo(tx + tr, ty); g.arc(tx, ty, tr, 0, Math.PI * 2); } };
    g.save(); g.translate(-6, -6); g.scale(1.03, 1.06); foot(); g.fillStyle = alpha('#cfe0ff', 0.75); g.fill(); g.restore();          // moonlight rim
    foot(); g.fillStyle = S().ink; g.fill();                                                                                          // bare foot, ink like the rig
    g.restore();
    const ck = ease.outBack(prog(t, tToes - 0.05, tToes + 0.3)); if (ck > 0.01) { g.save(); g.translate(lx - 120, GY - 230); g.scale(ck, ck); glow(g, 0, 0, 120, '#ffd47e', 0.5); seg(g, [[-50, 0], [-12, 38], [60, -48]], 22, '#ffd47e'); g.restore(); FX.sparkle(g, lx - 60, GY - 300, 26, '#ffffff', 0.8 * ck); }
    // a thumbs-up pops in from the top right
    const tu = ease.outBack(prog(t, tToes + 0.3, tToes + 0.7)); if (tu > 0.01) { g.save(); g.translate(E.W * 0.8, E.H * 0.34 + (1 - tu) * 260); g.rotate(-0.12);
      const fist = (col) => { g.fillStyle = col; rr(g, -80, -40, 160, 120, 40); g.fill(); rr(g, -78, -150, 56, 140, 28); g.fill(); };   // rr starts a new path, so fill each part
      g.save(); g.translate(-7, -7); g.scale(1.03, 1.03); fist(alpha('#cfe0ff', 0.7)); g.restore(); fist(S().ink);
      for (let i = 0; i < 3; i++) seg(g, [[-10 + i * 30, -6], [-10 + i * 30, 30]], 4, alpha('#cfe0ff', 0.25));                        // finger creases
      rr(g, -90, 76, 180, 160, 22); g.fillStyle = HERO.color; g.fill(); g.fillStyle = shade(HERO.color, -0.25); g.fillRect(-90, 76, 180, 20);   // mustard cuff
      g.restore(); }
  });
  FX.dust(g, t, { count: 22, color: '#c9d4ff', a: 0.18 });
} });

// s024 — "Downside, Dev wants to know why you keep staring at him. Fair question."  DEV leans away hugging the popcorn; HERO stares
registerShot('s024', { draw(g, t, info) {
  const st = info.shot.start, tStare = W('staring', st, 2.3), tFair = W('fair', st, 4.0), k = ease.inOut(t / info.dur);
  const pushOn = ease.inOut(prog(t, tFair - 0.2, info.dur));
  const cam = { z: 1.5 + 0.35 * pushOn + 0.04 * k, x: lerp(-140, -330, pushOn), y: lerp(80, 40, pushOn) };
  const C = cinema(g, t, cam, { screen: 0.2, door: 0 });
  layer(g, cam, 1, (g) => {
    const rim = { color: '#9fd0ff', dir: [0.2, -1] }, lean = ease.inOut(prog(t, tStare - 0.4, tStare + 0.4));
    actor(g, 'HERO', { x: C.CX - 40, y: C.GY, s: 1.6, facing: -1, pose: breathe(POSES.sit, t, 0.6), expr: 'awe', look: [-1, 0], rim, t });
    const dp = breathe(blendPose(POSES.sit, { ...POSES.sitBack, hF: [12, -130], eF: [20, -112], hB: [0, -128], eB: [-14, -110] }, lean), t, 0.8, 2);
    const D = { x: C.CX - 340 - lean * 30, y: C.GY, s: 1.6, facing: 1, pose: dp };
    actor(g, 'DEV', { ...D, expr: t > tStare ? 'nervous' : 'confused', look: [0.9, 0], rim, t, rot: -0.12 * lean });
    popcorn(g, D.x + 10 * D.s - lean * 20, C.GY - 150, 1.5, -0.1 * lean);
  });
  cinemaFg(g, t, cam);
  FX.dust(g, t, { count: 30, color: '#cfe6ff', a: 0.2 });
} });

// s025 — "So how do you see where nothing shines?"  HERO alone in the dark row, head slowly turning
registerShot('s025', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.55 + 0.08 * k, x: lerp(-60, 20, k), y: 90 };
  const C = cinema(g, t, cam, { screen: 0.05, door: 0 });
  layer(g, cam, 1, (g) => actor(g, 'HERO', { x: C.CX, y: C.GY, s: 1.6, facing: Math.sin(t * 0.9) > -0.3 ? 1 : -1, pose: breathe(POSES.sit, t, 0.6), expr: 'thinking', look: [Math.sin(t * 1.1) * 0.9, -0.3], rim: { color: '#9fd0ff', dir: [0.2, -1] }, t }));
  cinemaFg(g, t, cam);
  darkness(g, 0.45, { x: E.W * 0.5, y: E.H * 0.55, r: 820 });
  FX.godRays?.(g, E.W * 0.15, -40, { count: 5, len: 1600, a: 0.05 });
  FX.dust(g, t, { count: 50, color: '#cfe6ff', a: 0.3 });
} });

// s026 — "Simple... nothing has to shine."  giant face of HERO: eyes widen in awe as a faint warm glow reflects in them
registerShot('s026', { draw(g, t, info) {
  const st = info.shot.start, tShine = W('shine', st, 1.4), k = ease.inOut(t / info.dur), z = 1 + 0.08 * k;
  backdrop(g, ['#080912', '#0b0d1a', '#05060c']);
  const warm = ease.inOut(prog(t, 0.4, tShine + 0.3));
  g.save(); g.translate(E.W / 2, E.H * 0.56); g.scale(z, z); g.translate(-E.W / 2, -E.H * 0.56);
  glow(g, E.W * 0.5, E.H * 0.5, 800, '#ff8a3a', 0.12 * warm);
  bigFace(g, E.W * 0.5, E.H * 0.52, 300, { outfit: HERO, expr: t < tShine - 0.3 ? 'neutral' : 'awe', look: [0, -0.1], blink: (t % 2.4) < 0.08 && t < tShine - 0.4, rimColor: mix('#9fd0ff', '#ffb070', warm), rimSide: 1 });
  for (const dx of [-0.34, 0.34]) { glow(g, E.W * 0.5 + dx * 300, E.H * 0.52 - 300 * 0.12, 60, '#ffb070', 0.6 * warm); circle(g, E.W * 0.5 + dx * 300 + 10, E.H * 0.52 - 300 * 0.16, 7 * warm, '#fff1dc'); }
  g.restore();
  FX.dust(g, t, { count: 30, color: '#ffd59a', a: 0.22 * warm + 0.05 });
} });

// s027 — "Everything is already glowing."  FREEZE: the whole cinema blooms into thermal colours, popcorn hanging in the air
registerShot('s027', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.35 + 0.06 * k, x: lerp(-230, -190, k), y: 80 };
  const frz = 0.15;                                     // the action is frozen; only the camera drifts
  thermalView(g, t, {
    cold: (c) => cinema(c, frz, cam, { screen: 0.1, door: 0 }),
    hot: (c) => layer(c, cam, 1, (c) => {
      const GY = E.H * V(0.8, 0.68), CX = E.W / 2;
      for (let row = 0; row < 3; row++) for (let i = 0; i < 9; i++) heatRect(c, CX - 900 + i * 220 + row * 40, GY - 130 - row * 150, 150, 70, 0.16 + 0.04 * row, 10);   // seats keep a little warmth
      heatActor(c, 'HERO', { x: CX - 60, y: GY, s: 1.6, facing: -1, pose: POSES.relaxed, t: frz });
      const dp = blendPose(POSES.stand, POSES.fall, 0.6); heatActor(c, 'DEV', { x: CX - 320, y: GY, s: 1.6, facing: 1, pose: dp, t: frz, expr: 'shocked' });
      heatRect(c, CX - 300, GY - 260, 50, 60, 0.55, 8);                                                                       // the bucket
      const r = rng(17); for (let i = 0; i < 30; i++) heatBlob(c, CX - 260 + r() * 520, GY - 520 + r() * 330, 12, 12, 0.6 + r() * 0.3, 0.6);   // kernels hanging mid-air, still warm
    }),
    hud: { label: 'THERMAL', temp: 'FROZEN  0.0 s', track: null },
  });
  FX.dust(g, 0, { count: 40, color: '#ffd59a', a: 0.25 });
} });
