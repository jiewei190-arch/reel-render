// BH_shots.js — all 14 shots of the I.Awaken short "What If You Fell Into a Black Hole?" (9:16, 24.3 s).
// Classic bright I.Awaken look. Captions at y 1330: faces/hands/key action stay above y 1270; nothing important below y 1440 or right of x 900.
// Original designs only. The "spaghetti" stretch is a cartoon rubber-band stretch (no injury shown).
import { E, registerShot, layer, blurLayer, ease, prog, clamp, lerp, rng, seg, circle, ring, rr, poly, alpha, shade, mix, glow, linGrad, text, FONTS, shake, wordTime } from '/engine/core.js';
import { POSES, blendPose } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { idle, blinkFlag, blinkAmt, exprAt, poseAt, camMove, lookToward, atmos, pointAndLook, reaction, EXTRA } from '../sets/acting.js';
import { giantFace, faceAt } from '../sets/faces.js';
import * as BP from '../sets/bp.js';
import { spaceBg, blackHole, infall, debrisFg, heroFloat, chip, goldNum, GOLD, CREAM, DISKRIM, TEAL } from '../sets/space.js';

const W = () => E.W, H = () => E.H;
const wt = (w, info, after) => { const v = wordTime(w, after ?? info.shot.start - 0.1); return v == null ? 0 : v - info.shot.start; };
const FLAIL_A = { ...POSES.fall }, FLAIL_B = { ...EXTRA.handsUp, kF: [16, -46], fF: [30, -8], kB: [-14, -54], fB: [-30, -14] };
const flail = (t, rate = 3.2) => blendPose(FLAIL_A, FLAIL_B, 0.5 + 0.5 * Math.sin(t * rate * Math.PI));
const FLOAT = { ...POSES.relaxed, kF: [10, -48], fF: [18, -4], kB: [-6, -52], fB: [-4, -2], eF: [20, -146], hF: [34, -126], eB: [-20, -144], hB: [-32, -124] };
const LIEBACK = { head: [-30, -196], sh: [-22, -166], hip: [0, -100], eF: [-44, -196], hF: [-30, -224], eB: [-50, -186], hB: [-38, -214], kF: [36, -70], fF: [70, -40], kB: [24, -60], fB: [52, -20] };
function speedLines(g, t, cx, cy, o = {}) {           // streaks rushing toward (cx, cy)
  const r = rng(o.seed ?? 5), n = o.n ?? 26; g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const a = r() * 6.283, ph = (t * (o.speed ?? 1.4) + r()) % 1, d0 = lerp(1100, 260, ph), len = 140 + r() * 160;
    const x0 = cx + Math.cos(a) * d0, y0 = cy + Math.sin(a) * d0, x1 = cx + Math.cos(a) * (d0 - len), y1 = cy + Math.sin(a) * (d0 - len);
    g.strokeStyle = alpha(o.color ?? '#ffe6c0', 0.35 * Math.sin(ph * Math.PI)); g.lineWidth = 3; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
  }
  g.restore();
}
function arrow(g, x, y0, y1, k, col = GOLD, w = 14) {    // vertical arrow growing from y0 toward y1
  if (k <= 0.01) return; const y = lerp(y0, y1, k), dir = Math.sign(y1 - y0);
  seg(g, [[x, y0], [x, y - dir * w * 1.6]], w, col);
  poly(g, [[x - w * 1.7, y - dir * w * 2.2], [x + w * 1.7, y - dir * w * 2.2], [x, y + dir * w * 0.6]], col);
  glow(g, x, y, w * 4, col, 0.35);
}

// ===================================================================== s001 HOOK: tumbling toward the hole, title lock-up from frame 0
registerShot('s001', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.12], y: [0, 40] }), tB = wt('black', info);
  spaceBg(g, t, cam);
  layer(g, cam, 0.55, (g) => { blackHole(g, 560, 1120, 170, t, { spin: 1.4 }); infall(g, t, 560, 1120, 170, { n: 36 }); });
  layer(g, cam, 1, (g) => {
    speedLines(g, t, 560, 1120, { n: 30 });
    const sh = shake(t, 6, 3), rot = -0.5 + t * 1.25;
    heroFloat(g, { x: 520 + sh[0] + Math.sin(t * 2) * 20, y: 1000 + sh[1] + t * 30, s: 2.15, rot, pose: flail(t), expr: exprAt(t, [[0, 'shocked'], [tB, 'scared']]),
      blink: blinkFlag(t, 3.1, 1), look: lookToward(0.3, 1), t, trail: { count: 3, dx: -8, dy: -46, a: 0.25 } });
  });
  debrisFg(g, t, cam, { n: 3 });
  const k = 0.9 + 0.1 * ease.outBack(prog(t, 0, 0.35));
  g.save(); g.translate(540, 270); g.scale(k, k);
  text(g, 'WHAT IF YOU FELL', 0, -60, { size: 92, color: CREAM, weight: 700, stroke: 14, strokeColor: '#1a0c24', glow: 18, glowColor: 'rgba(255,170,80,.6)' });
  text(g, 'INTO A BLACK HOLE?', 0, 50, { size: 98, color: GOLD, weight: 700, stroke: 14, strokeColor: '#1a0c24', glow: 22, glowColor: 'rgba(255,170,80,.8)' });
  g.restore();
}});

// ===================================================================== s002 At first, nothing.
registerShot('s002', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.04, 1.0], x: [-20, 20] }), tN = wt('nothing', info);
  spaceBg(g, t, cam);
  layer(g, cam, 0.3, (g) => { blackHole(g, 800, 1560, 80, t, { spin: 1 }); });
  layer(g, cam, 1, (g) => {
    atmos(g, t, cam, { color: '#ffe0c0', far: 26, near: 10 });
    const bob = Math.sin(t * 1.8) * 14;
    heroFloat(g, { x: 520, y: 1180 + bob, s: 2.3, rot: Math.sin(t * 0.9) * 0.08, pose: poseAt(t, [[0, idle(FLOAT, t, 2)], [tN, idle(POSES.shrug, t, 2)]], 0.25),
      expr: exprAt(t, [[0, 'neutral'], [tN, 'confused']]), blink: blinkFlag(t + 0.6, 2.8, 2), look: lookToward(exprAt(t, [[0, 0.6], [tN, -0.2]]), 0.2), t, rimDir: [0.4, 0.9] });
  });
  debrisFg(g, t, cam, { seed: 33, n: 4 });
}});

// ===================================================================== s003 You just fall. (over the shoulder, the disk below)
registerShot('s003', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.1], y: [0, 50] }), tF = wt('fall', info);
  spaceBg(g, t, cam, { warm: 0.2 });
  layer(g, cam, 0.7, (g) => { blackHole(g, 560, 1130, 250, t, { spin: 1.2, outer: 3.2 }); infall(g, t, 560, 1130, 250, { n: 50, seed: 4 }); });
  layer(g, cam, 1, (g) => {
    speedLines(g, t, 560, 1130, { n: 18, speed: 0.9, seed: 8 });
    heroFloat(g, { x: 400, y: 790 + t * 70, s: 1.35, rot: 0.25 + t * 0.2, pose: flail(t, 1.6), facing: 1, expr: exprAt(t, [[0, 'neutral'], [tF, 'surprised']]),
      blink: blinkFlag(t, 3.3, 3), look: lookToward(0.4, 1), t });
  });
  debrisFg(g, t, cam, { seed: 35, n: 3 });
}});

// ===================================================================== s004 But gravity pulls — feet first, eyes snap down
registerShot('s004', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.07] }), tP = wt('pulls', info), tG = wt('gravity', info);
  spaceBg(g, t, cam, { warm: 0.3 });
  layer(g, cam, 0.5, (g) => { glow(g, 540, 2050, 900, '#ff9a3c', 0.55); glow(g, 540, 2000, 500, '#ffe0a0', 0.4); });
  layer(g, cam, 1, (g) => {
    const pull = ease.out(prog(t, tG, tP + 0.3)), X = 540, Y = 1200;
    for (let i = 0; i < 6; i++) { const ph = (t * 1.6 + i / 6) % 1; seg(g, [[X - 60 + i * 24, Y + 10 + ph * 220], [X - 60 + i * 24, Y + 60 + ph * 220]], 6, alpha(GOLD, 0.7 * pull * Math.sin(ph * Math.PI))); }
    glow(g, X + 10, Y - 6, 120, GOLD, 0.6 * pull);
    heroFloat(g, { x: X, y: Y + pull * 10, s: 2.3, pose: idle(poseAt(t, [[0, FLOAT], [tP, EXTRA.handsUp]], 0.3), t, 4), expr: exprAt(t, [[0, 'neutral'], [tP, 'worried']]),
      blink: blinkFlag(t + 1.1, 3.0, 4), look: tP > 0 && t > tP - 0.15 ? lookToward(0.15, 1) : lookToward(0.6, 0), t, rimDir: [0, 1] });
    atmos(g, t, cam, { color: '#ffd7a0', far: 20, near: 8 });
  });
  debrisFg(g, t, cam, { seed: 37, n: 3 });
}});

// ===================================================================== s005 BLUEPRINT: your feet harder than your head
registerShot('s005', { draw(g, t, info) {
  const tF = wt('feet', info), tH = wt('head', info), z = 1 + t * 0.02;
  BP.board(g, t, { title: 'TIDAL STRETCH', fig: 'FIG 1 - FEET-FIRST FALL' });
  g.save(); g.translate(540, 900); g.scale(z, z); g.translate(-540, -900);
  const k = prog(t, 0, 0.6), st = 1 + 0.07 * ease.inOut(prog(t, tH + 0.2, tH + 0.6)), X = 380, top = 440, Y = (y) => top + (y - top) * st, c = '#bfe4ff';
  const head = [X, Y(500)], neck = [X, Y(560)], hip = [X, Y(800)], fl = [X - 40, Y(1060)], fr = [X + 40, Y(1060)];
  BP.draw(g, Array.from({ length: 41 }, (_, i) => [head[0] + Math.cos(i / 40 * 6.283) * 55, head[1] + Math.sin(i / 40 * 6.283) * 55]), k, { w: 5, color: c });
  BP.draw(g, [neck, hip], k, { w: 5, color: c }); BP.draw(g, [hip, [X - 20, Y(930)], fl], k, { w: 5, color: c }); BP.draw(g, [hip, [X + 20, Y(930)], fr], k, { w: 5, color: c });
  BP.draw(g, [[X, Y(600)], [X - 90, Y(700)], [X - 110, Y(800)]], k, { w: 5, color: c }); BP.draw(g, [[X, Y(600)], [X + 90, Y(700)], [X + 110, Y(800)]], k, { w: 5, color: c });
  // gravity arrows (down = toward the black hole, below the frame)
  arrow(g, X + 230, Y(1000), Y(1000) + 230, ease.out(prog(t, tF, tF + 0.4)), GOLD, 16);
  arrow(g, X + 230, Y(470), Y(470) + 70, ease.out(prog(t, tH, tH + 0.3)), GOLD, 9);
  BP.label(g, t, { at: [X + 250, Y(1100)], to: [X + 330, Y(1100)], str: 'STRONG PULL', start: tF + 0.1 });
  BP.label(g, t, { at: [X + 250, Y(500)], to: [X + 330, Y(500)], str: 'WEAK PULL', start: tH + 0.05 });
  if (st > 1.005) text(g, 'STRETCH', X - 200, Y(780), { size: 34, color: GOLD, font: FONTS.ui, weight: 900, alpha: prog(t, tH + 0.2, tH + 0.5), spacing: 3 });
  g.restore();
}});

// ===================================================================== s006 GIANT FACE: And it gets worse.
registerShot('s006', { draw(g, t, info) {
  const tW = wt('worse', info), hit = prog(t, tW, tW + 0.12), sh = t > tW ? shake(t, 10 * Math.max(0, 1 - (t - tW) * 2), 4) : [0, 0];
  const cam = { ...camMove(t, info.dur, { z: [1.0, 1.04] }), z: 1.0 + t * 0.03 + 0.06 * ease.out(hit) };
  spaceBg(g, t, cam, { warm: 0.4 + 0.5 * hit });
  layer(g, cam, 0.4, (g) => { glow(g, 540, 1900, 1100, '#ff5a3a', 0.25 + 0.4 * hit); glow(g, 540, 1800, 600, '#ffb055', 0.3 + 0.3 * hit); });
  layer(g, { ...cam, x: (cam.x || 0) + sh[0], y: (cam.y || 0) + sh[1] }, 1, (g) => {
    giantFace(g, 540, 780, 320, { who: 'HERO', f: faceAt(t, [[0, 'worried'], [tW, 'shocked']]), rimColor: mix('#ffc68a', '#ff6a3a', hit), rimSide: 1, blink: blinkAmt(t + 2.9, 3.2, 0), breath: Math.sin(t * 2.4), glint: '#ffb055' });
  });
  atmos(g, t, cam, { color: '#ffcf9a', far: 18, near: 6 });
}});

// ===================================================================== s007 Near a small black hole,
registerShot('s007', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.08], x: [0, 30] }), tS = wt('small', info), tHo = wt('hole', info);
  spaceBg(g, t, cam, { warm: 0.3 });
  layer(g, cam, 0.8, (g) => { blackHole(g, 690, 760, 62, t, { spin: 3, outer: 3.4, heat: 1.2, glowA: 0.45 }); infall(g, t, 690, 760, 62, { n: 40, seed: 12 }); });
  chip(g, t, 'SMALL: ~10 SUNS', tS, 600, 520);
  layer(g, cam, 1, (g) => {
    heroFloat(g, { x: 280, y: 1230, s: 2.05, facing: 1, pose: idle(poseAt(t, [[0, FLOAT], [tHo, reaction('wince', t, tHo, FLOAT)]], 0.2), t, 5),
      expr: exprAt(t, [[0, 'worried'], [tHo, 'scared']]), blink: blinkFlag(t, 2.9, 5), look: lookToward(1, -0.8), t, rimDir: [0.8, -0.6] });
    atmos(g, t, cam, { color: '#ffd7a0', far: 20, near: 8 });
  });
  debrisFg(g, t, cam, { seed: 39, n: 3 });
}});

// ===================================================================== s008 that pull stretches you thin like spaghetti (cartoon stretch)
registerShot('s008', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.06] }), tSt = wt('stretches', info), tSp = wt('spaghetti', info);
  spaceBg(g, t, cam, { warm: 0.45 });
  layer(g, cam, 0.85, (g) => { blackHole(g, 120, 820, 52, t, { spin: 3.4, outer: 3.4, heat: 1.25, glowA: 0.5 }); infall(g, t, 120, 820, 52, { n: 30, seed: 14 }); });
  layer(g, cam, 1, (g) => {
    const k = ease.inOut(prog(t, tSt - 0.1, tSt + 0.9)), wig = prog(t, tSp - 0.1, tSp + 0.2), HX = 470, HY = 820, s = 1.45;
    for (let i = 0; i < 9; i++) { const ph = (t * 2.2 + i / 9) % 1, y = HY - 160 + i * 40; seg(g, [[HX + 380 - ph * 700, y], [HX + 260 - ph * 700, y]], 4, alpha('#ffe6c0', 0.45 * k * Math.sin(ph * Math.PI))); }
    g.save(); g.translate(HX, HY); g.scale(1 + 0.75 * k, 1 - 0.42 * k); g.transform(1, 0.12 * wig * Math.sin(t * 16), 0, 1, 0, 0); g.translate(-HX, -HY);
    heroFloat(g, { x: HX, y: HY + 100 * s, s, rot: Math.PI / 2, pose: idle(FLAIL_B, t, 6), expr: exprAt(t, [[0, 'worried'], [tSt, 'shocked'], [tSp, 'nervous']]),
      blink: blinkFlag(t, 3.4, 6), look: lookToward(0, 1), t, rimDir: [0, 1] });
    g.restore();
    if (k > 0.3) for (const sgn of [-1, 1]) { const a = 0.6 * prog(t, tSt + 0.3, tSt + 0.6); seg(g, [[HX + sgn * 20, HY - 130], [HX + sgn * 36, HY - 175]], 5, alpha(CREAM, a)); }
  });
}});

// ===================================================================== s009 Scientists really call it spaghettification. (observatory)
function observatory(g, t, cam) {
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#3a2a5a', '#4a3466', '#5a3a62']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  layer(g, cam, 0.6, (g) => {
    // round window onto space with a black hole
    g.save(); g.beginPath(); g.arc(780, 500, 230, 0, Math.PI * 2); g.clip(); spaceBg(g, t, { x: 0, y: 0, z: 1 }); blackHole(g, 800, 520, 50, t, { spin: 2.4, outer: 3.2 }); g.restore();
    ring(g, 780, 500, 236, 22, '#2a1e3a'); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.4; seg(g, [[780 + Math.cos(a) * 60, 500 + Math.sin(a) * 60], [780 + Math.cos(a) * 230, 500 + Math.sin(a) * 230]], 8, '#2a1e3a'); }
    glow(g, 780, 500, 420, '#ffb055', 0.18);
    // chalkboard
    rr(g, 50, 330, 520, 420, 14); g.fillStyle = '#6a4a32'; g.fill(); rr(g, 66, 346, 488, 388, 8); g.fillStyle = '#1f3a34'; g.fill();
    const ch = alpha('#eef4ea', 0.85);
    text(g, 'TIDAL  ∝  M / r³', 310, 420, { size: 44, color: ch, font: FONTS.ui, weight: 800 });
    seg(g, [[120, 520], [170, 560], [230, 520], [290, 560], [350, 520], [410, 560], [470, 520]], 6, ch);   // the noodle doodle
    circle(g, 100, 520, 18, ch); circle(g, 500, 600, 34, '#0a0a10'); ring(g, 500, 600, 40, 5, ch);
    seg(g, [[300, 650], [450, 650]], 4, ch); poly(g, [[450, 640], [470, 650], [450, 660]], ch);
    seg(g, [[60, 750], [560, 750]], 10, '#5a3e2a');
    // poster, shelf, books, plant
    rr(g, 640, 800, 150, 190, 6); g.fillStyle = '#20183a'; g.fill(); circle(g, 715, 880, 34, '#e8b060'); g.save(); g.translate(715, 880); g.scale(1, 0.3); ring(g, 0, 0, 62, 8, '#f2d090'); g.restore();
  });
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = '#2e2240'; g.fillRect(-200, 1240, E.W + 400, 900);                        // floor
    rr(g, 30, 1040, 420, 30, 6); g.fillStyle = '#5a3e2a'; g.fill(); seg(g, [[60, 1070], [60, 1240]], 12, '#4a3222'); seg(g, [[420, 1070], [420, 1240]], 12, '#4a3222');  // desk
    const books = ['#d4262e', '#2f6fd0', '#f08a24', '#3aa05a']; books.forEach((c, i) => { rr(g, 60 + i * 34, 940, 28, 100, 4); g.fillStyle = c; g.fill(); });
    rr(g, 240, 990, 50, 50, 8); g.fillStyle = '#f2efe8'; g.fill(); seg(g, [[290, 1000], [306, 1015], [290, 1030]], 6, '#f2efe8');   // mug
    seg(g, [[370, 1040], [370, 940], [330, 900]], 6, '#20182a'); circle(g, 330, 896, 20, '#ffd59a'); glow(g, 330, 910, 140, '#ffd59a', 0.4);  // desk lamp
    seg(g, [[920, 1240], [880, 1000]], 10, '#20182a'); seg(g, [[960, 1240], [880, 1000]], 10, '#20182a'); rr(g, 790, 930, 200, 56, 20); g.fillStyle = '#c8c8d8'; g.fill(); // telescope
    rr(g, 140, 1170, 70, 70, 8); g.fillStyle = '#7a4a3a'; g.fill(); for (let i = 0; i < 5; i++) { const a = -2.6 + i * 0.5; seg(g, [[175, 1170], [175 + Math.cos(a) * 70, 1170 + Math.sin(a) * 70]], 10, '#3aa05a'); } // plant
  });
}
registerShot('s009', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.05], x: [10, -10] }), tC = wt('call', info), tSp = wt('spaghettification', info);
  observatory(g, t, cam);
  layer(g, cam, 1, (g) => {
    const pl = pointAndLook(t, tC, [-1, -0.5], { base: 'stand' });
    actor(g, 'LIN', { x: 720, y: 1250, s: 2.0, facing: -1, pose: idle(t < tC ? POSES.stand : pl.pose, t, 7), look: t < tC ? lookToward(-1, 0) : pl.look,
      expr: exprAt(t, [[0, 'smile'], [tSp, 'happy']]), blink: blinkFlag(t, 3.6, 7), t, rim: { color: '#ffc68a', dir: [0.6, -0.8] } });
    g.save(); g.translate(330, 1250); g.scale(0.62, 1.35); g.translate(-330, -1250);
    actor(g, 'HERO', { x: 330, y: 1250, s: 1.55, facing: 1, pose: idle(POSES.sheepish ?? EXTRA.sheepish, t, 8), expr: exprAt(t, [[0, 'nervous'], [tSp, 'smirk']]), blink: blinkFlag(t + 0.8, 2.9, 8), look: lookToward(1, -0.2), t, rim: { color: '#ffc68a', dir: [0.6, -0.8] } });
    g.restore();
    atmos(g, t, cam, { color: '#ffe0c0', far: 18, near: 6 });
  });
  chip(g, t, 'SPAGHETTIFICATION', tSp, 520, 230, { size: 56 });
}});

// ===================================================================== s010 REVEAL: But fall into a giant one,
registerShot('s010', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.16, 1.0], y: [-30, 0] }), tG = wt('giant', info);
  spaceBg(g, t, cam);
  layer(g, cam, 0.7, (g) => { blackHole(g, 540, 1020, 330, t, { spin: 0.6, outer: 3.0, tilt: 0.22, glowA: 0.4 }); infall(g, t, 540, 1020, 330, { n: 60, seed: 16 }); });
  layer(g, cam, 1, (g) => {
    heroFloat(g, { x: 300, y: 600 + Math.sin(t * 1.4) * 10, s: 1.4, facing: 1, pose: idle(poseAt(t, [[0, FLOAT], [tG, EXTRA.lookUp]], 0.3), t, 9),
      expr: exprAt(t, [[0, 'surprised'], [tG, 'awe']]), blink: blinkFlag(t, 3.2, 9), look: lookToward(0.6, 0.8), t, rimDir: [0.3, 1] });
  });
  debrisFg(g, t, cam, { seed: 43, n: 4 });
  chip(g, t, 'SUPERMASSIVE', tG, 540, 260);
}});

// ===================================================================== s011 millions of suns heavy, (graphic: suns pour in, gold counter)
function sunDot(g, x, y, r) { glow(g, x, y, r * 4, '#ffcf6a', 0.5); circle(g, x, y, r, '#fff1c0'); circle(g, x - r * 0.25, y - r * 0.25, r * 0.4, '#ffffff'); }
registerShot('s011', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.06] }), tM = wt('millions', info), tH = wt('heavy', info);
  spaceBg(g, t, cam, { warm: 0.15 });
  layer(g, cam, 0.7, (g) => { blackHole(g, 540, 1080, 260, t, { spin: 0.7, outer: 3.0, tilt: 0.22 }); });
  layer(g, cam, 1, (g) => {
    const r = rng(51);
    for (let i = 0; i < 70; i++) {
      const delay = r() * 1.2, ph = clamp((t - delay + 0.6) / 1.1), a = r() * 1.2 - 0.6; if (ph <= 0 || ph >= 1) continue;
      const sx = 540 + Math.sin(a) * 900, sy = 200 + r() * 300, ex = 540 + Math.sin(a) * 60, ey = 1080;
      const e = ease.in(ph), x = lerp(sx, ex, e) + Math.sin(ph * 3 + i) * 40 * (1 - e), y = lerp(sy, ey, e);
      sunDot(g, x, y, 14 * (1 - e * 0.7));
    }
  });
  const n = Math.round(4300000 * ease.out(prog(t, tM, tM + 0.8)));
  goldNum(g, t, n.toLocaleString('en-US'), tM, 540, 420, { size: 130, sub: 'SUNS OF MASS' });
  chip(g, t, 'LIKE OUR GALAXY’S CENTER', tH, 540, 700, { size: 38, color: CREAM });
}});

// ===================================================================== s012 and you'd cross the point of no return (oblivious, on the phone)
registerShot('s012', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.05] }), tC = wt('cross', info), tP = wt('point', info), tR = wt('return', info);
  spaceBg(g, t, cam, { warm: 0.25 });
  layer(g, cam, 0.5, (g) => { glow(g, 540, 2100, 1200, '#ff9a3c', 0.45); });
  const hy = lerp(1480, 300, ease.inOut(prog(t, tC - 0.3, tR + 0.3)));          // the horizon line sweeps up past the hero
  layer(g, cam, 0.95, (g) => {
    const R = 2200, cy = hy + R;
    g.save(); g.beginPath(); g.arc(540, cy, R, 0, Math.PI * 2); g.fillStyle = 'rgba(10,4,20,.38)'; g.fill(); g.restore();
    g.save(); g.setLineDash([34, 22]); g.lineDashOffset = -t * 60; g.strokeStyle = GOLD; g.lineWidth = 9; g.beginPath(); g.arc(540, cy, R, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); g.restore();
    glow(g, 540, hy, 300, GOLD, 0.25);
    if (hy < 1250) text(g, 'EVENT HORIZON', 300, hy - 36, { size: 36, color: GOLD, font: FONTS.ui, weight: 900, spacing: 3, stroke: 8, strokeColor: '#1a0c24' });
  });
  layer(g, cam, 1, (g) => {
    heroFloat(g, { x: 520, y: 1200 + Math.sin(t * 1.5) * 10, s: 2.2, facing: 1, pose: idle(POSES.phone, t, 10), prop: { type: 'phone', glow: '#9fe8ff' },
      expr: exprAt(t, [[0, 'smile'], [tC, 'happy']]), blink: blinkFlag(t, 3.0, 10), look: lookToward(0.5, 0.6), t, rimDir: [0, 1] });
    atmos(g, t, cam, { color: '#ffe0c0', far: 22, near: 8 });
  });
  chip(g, t, 'POINT OF NO RETURN', tP, 540, 480);
}});

// ===================================================================== s013 without even noticing. (lying back, cheeky)
registerShot('s013', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.04, 1.0], x: [-15, 15] }), tE = wt('even', info), tN = wt('noticing', info);
  spaceBg(g, t, cam, { warm: 0.55 });
  layer(g, cam, 0.3, (g) => { glow(g, 540, 140, 520, '#cfe0ff', 0.35); ring(g, 540, 140, 200, 10, alpha('#fff4dc', 0.5)); });   // the outside universe, squeezed into a bright ring above
  layer(g, cam, 1, (g) => {
    heroFloat(g, { x: 560, y: 1170 + Math.sin(t * 1.6) * 12, s: 2.2, facing: 1, rot: -0.12, pose: idle(poseAt(t, [[0, LIEBACK], [tE, POSES.shrug], [tN, LIEBACK]], 0.25), t, 11),
      expr: exprAt(t, [[0, 'smirk'], [tN, 'happy']]), blink: blinkFlag(t + 0.5, 3.1, 11), look: lookToward(-0.6, -0.4), t, rimDir: [0, -1], rimColor: '#ffd6a0' });
    atmos(g, t, cam, { color: '#ffd7b0', far: 24, near: 8 });
  });
  debrisFg(g, t, cam, { seed: 45, n: 3 });
  chip(g, t, 'FELT NOTHING... YET', tN, 520, 380);
}});

// ===================================================================== s014 Which one would you pick? (small vs giant, hard cut)
registerShot('s014', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.05] }), tO = wt('one', info), tP = wt('pick', info);
  spaceBg(g, t, cam);
  layer(g, cam, 0.7, (g) => { blackHole(g, 240, 640, 52, t, { spin: 3.2, outer: 3.2, heat: 1.2, glowA: 0.45 }); blackHole(g, 770, 700, 140, t, { spin: 0.8, outer: 2.6 }); });
  g.save(); g.setLineDash([22, 18]); seg(g, [[520, 380], [520, 1180]], 4, alpha(GOLD, 0.6)); g.restore();
  text(g, 'VS', 520, 330, { size: 70, color: GOLD, weight: 700, stroke: 10, strokeColor: '#1a0c24', glow: 16, glowColor: 'rgba(255,170,80,.7)' });
  chip(g, t, 'SMALL', 0, 240, 430, { size: 40 }); chip(g, t, 'GIANT', 0.1, 770, 430, { size: 40 });
  layer(g, cam, 1, (g) => {
    const lx = t < tO ? -1 : t < tP ? 1 : 0.2;
    heroFloat(g, { x: 520, y: 1230, s: 2.0, facing: lx < 0 ? -1 : 1, pose: idle(poseAt(t, [[0, FLOAT], [tP, POSES.think]], 0.2), t, 12),
      expr: exprAt(t, [[0, 'thinking'], [tP, 'smirk']]), blink: blinkFlag(t, 2.7, 12), look: lookToward(Math.abs(lx), -0.5), t, rimDir: [0, -1] });
  });
}});
