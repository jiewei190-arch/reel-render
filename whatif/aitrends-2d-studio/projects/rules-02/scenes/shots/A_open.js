// A_open.js — THE RULES #2 "The Night Shift", batch A (s001-s010, 0-27.06 s), vertical 9:16. Word beats = the times in the shot texts
// (seconds from shot start). Captions burn in at y 1330: faces, hands and key action stay above y 1270, nothing below y 1440 / right of x 900.
//   s001 wide: the QUIK STOP alone off the highway; tiny HERO walks behind the counter on 'shift'; a pump-2 canopy tube stutters on 'station', the moths freeze
//   s002 med: counter, she sets down her coffee, notices the note on 'manager', peels it on 'note'; the pay window reflects one tube too many
//   s003 insert: the note in her fingers, numbers only; the glue strip is on the wrong side
//   s004 insert: rule 1 writes on on 'Rule'; the marker bleeds as if just written
//   s005 med: the front door + deadbolt, the neon buzzes on 'two', a glint along the bolt on 'lock'; a greasy handprint far too high
//   s006 wide: the night pay window, the drawer rattles on 'window'; fingertip streaks through the condensation on the OUTSIDE
//   s007 insert: rule 2 writes on; rule 1 above it is smudged by a finger
//   s008 med: she reads the note, uneasy half-laugh on 'usual', glances at the pay window on 'out'; its TALK light comes on by itself
//   s009 insert: rule 3 in shakier marker, underlined twice on 'three'; the underline tears the paper
//   s010 insert: the CCTV grid at 01:58:40; CAM 4 flickers on 'camera', its REC dot blinks out of rhythm; a dark smear behind the tiny clerk
import { E, S, V, registerShot, layer, blurLayer, veil, ease, prog, clamp, lerp, rng, rr, seg, circle, ring, poly, glow, alpha, shade, mix, text, FONTS, linGrad, noise } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { blinkFlag, exprAt, poseAt, idle, lookToward, walkAlong, camMove } from '../sets/acting.js';
import { gas, gasFg } from '../sets/gas.js';
import { stickyNote, cctv, stamp } from '../sets/rules2.js';
import { scrawl, grain, vignette, coldGrade, breathe } from '../sets/horror.js';

const look = (g, t) => { coldGrade(g, 0.4); vignette(g, 0.78); breathe(g, t, 0.25); grain(g, t, 0.08); };
const blinkH = (t) => blinkFlag(t, 3.3, 7), INK = '#1a2240', AMBER = '#ffb85a', TUBE = '#d8f0e4';

registerShot('s001', { draw(g, t, info) {
  const tShift = 1.29, tSt = 2.16, stut = t > tSt && t < tSt + 0.32;
  const cam = camMove(t, info.dur, { z: [1.0, 1.07], y: [-170, -200], drift: 0.45 });
  const G = gas(g, t, cam, { view: 'exterior', lights: { canopy: stut ? 0.35 : 1, sign: 1, tubes: 1 }, flicker: stut ? 1 : 0.15 }), p = G.pos, GY = G.GY;
  layer(g, cam, 1, (g) => {
    // tiny HERO in the shop window: walks in behind the counter on 'shift'
    const k = ease.out(prog(t, tShift - 0.5, tShift + 0.8)), hx = lerp(p.doorX - 260, p.doorX - 120, k);
    actor(g, 'HERO', { x: hx, y: GY - 120, s: 0.8, facing: 1, pose: k < 1 ? walkAlong(hx, 0.8, { facing: 1 }).pose : idle(POSES.stand, t, 7), expr: 'neutral', t, shadow: false, alpha: 0.85 });
    // moths around the canopy tubes; they freeze mid-air while the pump-2 tube stutters
    const r = rng(9), tt = stut ? tSt : t; for (let i = 0; i < 14; i++) { const cx = (i % 2 ? p.pumpXs[1] : p.pumpXs[0]) + (r() - 0.5) * 300, cy = p.canopyY + 80 + r() * 120, a = tt * (2 + r() * 3) + i;
      const mx = cx + Math.cos(a) * (30 + r() * 50), my = cy + Math.sin(a * 1.3) * (20 + r() * 30); g.fillStyle = alpha('#e8e4d8', 0.85); g.beginPath(); g.ellipse(mx - 4, my, 6, 3 + 2 * Math.abs(Math.sin(tt * 30 + i)), 0.4, 0, 7); g.ellipse(mx + 4, my, 6, 3 + 2 * Math.abs(Math.sin(tt * 30 + i)), -0.4, 0, 7); g.fill(); }
  });
  gasFg(g, t, cam, { view: 'exterior' }); look(g, t);
} });

// a paper coffee cup (local prop)
function cup(g, x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); poly(g, [[-22, -64], [22, -64], [17, 0], [-17, 0]], '#e8e2d6'); g.fillStyle = '#7a4a2a'; g.fillRect(-21, -46, 42, 18); rr(g, -26, -74, 52, 12, 4); g.fillStyle = '#3a3a40'; g.fill(); g.restore(); }
// the soft-focus pay window upper-left: pure black glass with the store's tubes reflected (one more than the store has); optional TALK light
function softWindow(g, t, x, y, w, h, o = {}) {
  blurLayer(g, 5, (g) => { rr(g, x - 16, y - 16, w + 32, h + 32, 8); g.fillStyle = '#4a5058'; g.fill(); g.fillStyle = '#020306'; g.fillRect(x, y, w, h);
    for (let i = 0; i < (o.tubes ?? 4); i++) { g.fillStyle = alpha(TUBE, 0.35); g.fillRect(x + 30 + i * (w - 60) / 4, y + 40 + i * 6, (w - 60) / 4 - 24, 8); }
    circle(g, x + w - 40, y + h + 2, 10, o.talk ? '#4aff6a' : '#14301c'); if (o.talk) glow(g, x + w - 40, y + h + 2, 90, '#4aff6a', 0.6); }, null, 1);
}

registerShot('s002', { draw(g, t, info) {
  const tMan = 0.21, tNote = 1.19, cam = camMove(t, info.dur, { z: [1.3, 1.36], x: [-110, -100], y: [-30, -40], drift: 0.4 });
  const G = gas(g, t, cam, { view: 'counter', lights: { tubes: 1 }, flicker: 0.1, clock: '2:00' }), p = G.pos, GY = G.GY, s = 3.0;
  softWindow(g, t, 60, 150, 300, 380, { tubes: 4 });
  const peel = ease.inOut(prog(t, tNote, tNote + 0.6)), hx = p.clerkX - 200;
  layer(g, cam, 0.98, (g) => {
    const o = { x: hx, y: GY - 60, s, facing: 1, pose: idle(poseAt(t, [[0, 'holdFront'], [0.35, 'stand'], [tNote - 0.1, 'reach'], [tNote + 0.5, 'holdFront']], 0.3), t, 7), expr: exprAt(t, [[0, 'neutral'], [tMan, 'thinking'], [tNote + 0.2, 'confused']]), blink: blinkH(t), look: t > tMan - 0.15 ? lookToward(1, 0.4) : lookToward(1, 0), rim: G.rim, t };
    actor(g, 'HERO', o);
  });
  G.pos.front(g);
  layer(g, cam, 1, (g) => {
    cup(g, p.clerkX - 30, p.counterTop + 2, 1.4); glow(g, p.registerX, p.noteY, 220, AMBER, 0.3);
    const nx = lerp(p.noteX, hx + 90, peel), ny = lerp(p.noteY, GY - 60 - 150 * s, peel); stickyNote(g, nx, ny, 0.22, { t, rules: 0, rot: lerp(0.06, -0.2, peel) });
  });
  gasFg(g, t, cam, { view: 'counter' }); look(g, t);
} });

// sticky-note macro: blurred register behind, the note held in her fingertips (or stuck to the counter), number overlay for unwritten rules
function noteMacro(g, t, info, o) {
  const z = lerp(o.z[0], o.z[1], ease.inOut(t / info.dur)), x = 500, y = 700, s = 1.25, tr = (o.tremble ?? 1) * (Math.sin(t * 23) * 1.0 + Math.sin(t * 31) * 0.6);
  blurLayer(g, 12, (g) => { const G = gas(g, t, { z: 1.5, x: -200, y: 100 }, { view: 'counter', lights: { tubes: 1 }, clock: '2:00' }); G.pos.front(g); }, null, 1); veil(g, '#04060a', 0.45);
  glow(g, E.W * 0.5, E.H * 0.85, 800, AMBER, 0.3); glow(g, E.W * 0.5, 0, 900, TUBE, 0.12);
  g.save(); g.translate(x, y); g.scale(z, z); g.translate(-x + tr, -y + tr * 0.6);
  if (o.stuck) { g.fillStyle = '#3a3026'; g.fillRect(-200, y + 360, E.W + 400, 600); g.fillStyle = '#5a4a3a'; g.fillRect(-200, y + 340, E.W + 400, 26); }
  const N = stickyNote(g, x, y, s, { t, rules: o.rules, hl: o.hl, rot: 0.04 });
  g.save(); g.translate(x, y); g.rotate(0.04); g.scale(s, s);
  const loc = N.lines.map(([lx, ly]) => [(lx - x) / s, (ly - y) / s]), W = 640, H = 700;
  if ((o.rules ?? 0) < 0.01) scrawl(g, 'NIGHT SHIFT', -W / 2 + 50, -H / 2 + 80, { size: 46, seed: 2, color: INK, k: clamp(o.numbers * 3) });
  loc.forEach(([lx, ly], i) => { const k = clamp(o.numbers * 4 - i * 0.35); if (k > 0 && (o.rules ?? 0) <= i) scrawl(g, `${i + 1}.`, lx - 4, ly, { size: 46, seed: 10 + i, k, color: INK }); });
  o.extra?.(g, loc, W, H);
  g.restore();
  if (!o.stuck) for (const sd of [-1, 1]) { const hx = x + sd * 420, hy = y + 240; g.save(); g.translate(hx, hy); g.scale(sd, 1); rr(g, -10, 60, 140, 340, 40); g.fillStyle = '#2f5a43'; g.fill(); rr(g, -10, 60, 140, 40, 16); g.fillStyle = shade('#2f5a43', -0.3); g.fill(); g.fillStyle = '#3a2a26'; g.beginPath(); g.ellipse(-12, 20, 30, 50, -0.3, 0, 7); g.fill(); g.fillStyle = '#4a3630'; g.beginPath(); g.ellipse(-20, -26, 16, 30, -0.2, 0, 7); g.fill(); g.restore(); }
  g.restore();
  look(g, t);
}

registerShot('s003', { draw(g, t, info) { noteMacro(g, t, info, { z: [1.0, 1.08], rules: 0, numbers: ease.out(prog(t, 0.1, 0.6)), tremble: t > 0.54 ? 1.6 : 0.6,
  extra: (g, loc, W, H) => { g.save(); g.globalAlpha *= 0.55; g.strokeStyle = alpha('#8a6a10', 0.6); g.setLineDash([10, 8]); g.lineWidth = 3; g.strokeRect(-W / 2 + 8, H / 2 - 78, W - 120, 66); g.restore(); } }); } });

registerShot('s004', { draw(g, t, info) { const k = ease.out(prog(t, 0.15, info.dur - 0.05)); noteMacro(g, t, info, { z: [1.08, 1.12], rules: k, numbers: 1,
  extra: (g, loc) => { if (k > 0.3) { const [lx, ly] = loc[0]; for (let i = 0; i < 4; i++) { const xx = lx + 70 + i * 120, len = 10 + (i * 13) % 26; seg(g, [[xx, ly + 66], [xx, ly + 66 + len * clamp((k - 0.3) * 2)]], 4, alpha(INK, 0.6)); circle(g, xx, ly + 66 + len * clamp((k - 0.3) * 2), 4, alpha(INK, 0.6)); } } } }); } });

registerShot('s007', { draw(g, t, info) { noteMacro(g, t, info, { z: [1.04, 1.1], rules: 1 + ease.out(prog(t, 0.15, info.dur - 0.05)), numbers: 1, stuck: true, tremble: 0.3,
  extra: (g, loc) => { const [lx, ly] = loc[0]; g.strokeStyle = alpha(INK, 0.28); g.lineWidth = 26; g.lineCap = 'round'; g.beginPath(); g.moveTo(lx + 110, ly - 10); g.quadraticCurveTo(lx + 260, ly + 30, lx + 430, ly + 70); g.stroke(); } }); } });

registerShot('s009', { draw(g, t, info) { const tThree = 0.52, u1 = ease.out(prog(t, tThree, tThree + 0.18)), u2 = ease.out(prog(t, tThree + 0.25, tThree + 0.43));
  noteMacro(g, t, info, { z: [1.06, 1.14], rules: 2 + ease.out(prog(t, 0.15, 0.5)), numbers: 1, stuck: true, tremble: 2,
  extra: (g, loc) => { const [lx, ly] = loc[2], uy = ly + 54 + 22, x0 = lx + 50, x1 = lx + 230;
    if (u1 > 0) seg(g, [[x0, uy], [lerp(x0, x1, u1), uy + 4]], 6, alpha('#b02020', 0.9)); if (u2 > 0) seg(g, [[x0 + 10, uy + 16], [lerp(x0 + 10, x1 + 20, u2), uy + 22]], 7, alpha('#b02020', 0.9));
    if (u2 >= 1) { g.fillStyle = '#050407'; g.beginPath(); g.moveTo(x1 - 60, uy + 12); for (let i = 0; i <= 6; i++) g.lineTo(x1 - 60 + i * 16, uy + 12 + (i % 2 ? 14 : -4)); g.lineTo(x1 + 36, uy + 30); for (let i = 6; i >= 0; i--) g.lineTo(x1 - 60 + i * 16, uy + 30 + (i % 2 ? 4 : 16)); g.closePath(); g.fill(); } } }); } });

registerShot('s005', { draw(g, t, info) {
  const tTwo = 0.36, tLock = 0.82, cam = camMove(t, info.dur, { z: [1.0, 1.1], x: [-40, -90], y: [-40, -60], drift: 0.35 });
  const buzz = t > tTwo && t < tTwo + 0.25 ? 0.55 + 0.45 * Math.abs(Math.sin(t * 60)) : 1;
  const G = gas(g, t, cam, { view: 'door', locked: 0, lights: { sign: buzz, tubes: 1 } }), p = G.pos;
  layer(g, cam, 1, (g) => {
    // the glint along the deadbolt on 'lock'
    const gk = prog(t, tLock, tLock + 0.45); if (gk > 0 && gk < 1) { const gx = p.deadboltX - 40 + gk * 80; glow(g, gx, p.deadboltY, 60, '#fff6d8', 0.8 * Math.sin(gk * Math.PI)); seg(g, [[gx - 14, p.deadboltY], [gx + 14, p.deadboltY]], 3, alpha('#ffffff', 0.9 * Math.sin(gk * Math.PI))); }
    // a greasy handprint high on the outside of the glass, fingers too long
    const hx = p.doorX + 40, hy = p.doorTop + 200; g.fillStyle = alpha('#c8d0d8', 0.3); g.beginPath(); g.ellipse(hx, hy + 60, 52, 62, 0, 0, 7); g.fill();
    for (let i = 0; i < 5; i++) { const a = -2.4 + i * 0.32 + (i === 0 ? -0.5 : 0), L = i === 0 ? 90 : 160 + (i % 2) * 30; g.save(); g.translate(hx + Math.cos(a) * 40, hy + 30 + Math.sin(a) * 40); g.rotate(a + Math.PI / 2); g.beginPath(); g.ellipse(0, -L / 2, 13, L / 2, 0, 0, 7); g.fill(); g.restore(); }
  });
  gasFg(g, t, cam, { view: 'door' }); look(g, t);
} });

registerShot('s006', { draw(g, t, info) {
  const tWin = 1.42, cam = camMove(t, info.dur, { z: [1.0, 1.06], x: [20, 60], y: [-40, -50], drift: 0.3 });
  const rat = t > tWin && t < tWin + 0.4 ? Math.sin((t - tWin) * 50) * 0.03 * (1 - (t - tWin) / 0.4) : 0;
  const G = gas(g, t, cam, { view: 'window', drawer: Math.abs(rat), lights: { tubes: 1 } }), p = G.pos;
  layer(g, cam, 1, (g) => {
    g.save(); g.beginPath(); g.rect(p.glassX, p.glassY, p.glassW, p.glassH); g.clip();
    // her faint reflection on the left of the glass
    actor(g, 'HERO', { x: p.glassX + 130, y: p.glassY + p.glassH + 200, s: 2.2, facing: 1, pose: idle(POSES.stand, t, 7), expr: t > tWin ? 'worried' : 'neutral', blink: blinkH(t), t, shadow: false, alpha: 0.12 });
    // condensation on the OUTSIDE with two long fingertip streaks dragged down through it
    const r = rng(14); g.fillStyle = alpha('#c8d4e0', 0.12); g.fillRect(p.glassX, p.glassY + p.glassH * 0.45, p.glassW, p.glassH * 0.55);
    for (let i = 0; i < 70; i++) circle(g, p.glassX + r() * p.glassW, p.glassY + p.glassH * 0.45 + r() * p.glassH * 0.55, 2 + r() * 3, alpha('#e8f0f8', 0.22));
    for (const dx of [0.52, 0.6]) { const sx = p.glassX + p.glassW * dx; g.fillStyle = '#04060a'; g.fillRect(sx, p.glassY + p.glassH * 0.47, 12, p.glassH * 0.4); circle(g, sx + 6, p.glassY + p.glassH * 0.87, 8, alpha('#e8f0f8', 0.4)); }
    g.restore();
  });
  gasFg(g, t, cam, { view: 'window' }); look(g, t);
} });

registerShot('s008', { draw(g, t, info) {
  const tUs = 1.31, tOut = 2.41, cam = camMove(t, info.dur, { z: [1.3, 1.37], x: [-60, -50], y: [-30, -40], drift: 0.35 });
  const G = gas(g, t, cam, { view: 'counter', lights: { tubes: 1 }, flicker: 0.2, clock: '2:00' }), p = G.pos, GY = G.GY, s = 3.0;
  softWindow(g, t, 60, 150, 300, 380, { tubes: 3, talk: t > tUs && t < tUs + 1.0 });
  layer(g, cam, 0.98, (g) => {
    const read = { ...POSES.stand, eF: [24, -150], hF: [40, -178], eB: [12, -150], hB: [30, -176] };
    actor(g, 'HERO', { x: p.clerkX - 120, y: GY - 60, s, facing: 1, pose: idle(read, t, 7), expr: exprAt(t, [[0, 'thinking'], [tUs, 'worried'], [tUs + 0.4, 'smile'], [tUs + 0.9, 'worried'], [tOut, 'nervous']]), blink: blinkH(t), look: t > tOut ? lookToward(-1, -0.6) : lookToward(1, 0.3), rim: G.rim, t });
    stickyNote(g, p.clerkX - 120 + 40 * s + 30, GY - 60 - 178 * s - 10, 0.16, { t, rules: 2, rot: -0.1 });
  });
  G.pos.front(g);
  gasFg(g, t, cam, { view: 'counter' }); look(g, t);
} });

registerShot('s010', { draw(g, t, info) {
  const tCam = 0.88, tFour = 1.22, z = lerp(1.0, 1.12, ease.inOut(t / info.dur)), x = 150, y = 380, w = 720, h = 720;
  // under the counter: dark wood, the monitor's glow on the counter edge
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#0a0c10', '#141218']); g.fillRect(0, 0, E.W, E.H); g.fillStyle = '#2a241e'; g.fillRect(0, 0, E.W, 180); g.fillStyle = '#4a3e30'; g.fillRect(0, 170, E.W, 20);
  const fx = x + w * 0.78, fy = y + h * 0.78;
  g.save(); g.translate(fx, fy); g.scale(z, z); g.translate(-fx, -fy);
  cctv(g, x, y, w, h, { t, focus: 0, static: 0.05, time: stamp(1, 58, 40 + t), behind: 0.14 });
  // CAM 4 (bottom-right tile): a flicker of static on 'camera', its REC dot blinking out of rhythm on 'four'
  const cw = (w - 8) / 2, ch = (h - 8) / 2, tx = x + cw + 8, ty = y + ch + 8;
  if (t > tCam && t < tCam + 0.16) { const r = rng(Math.floor(t * 48)); g.save(); g.beginPath(); g.rect(tx, ty, cw, ch); g.clip(); g.fillStyle = 'rgba(200,210,200,.5)'; for (let k = 0; k < 60; k++) g.fillRect(tx, ty + r() * ch, cw, 1 + r() * 4); g.restore(); }
  if (t > tFour) { const on = Math.sin(t * 13.7 + Math.sin(t * 3.1) * 2) > 0.3; g.fillStyle = '#05070a'; g.fillRect(tx + cw - 40, ty + 10, 30, 28); if (on) circle(g, tx + cw - 24, ty + 24, 8, '#ff3a3a'); }
  g.restore();
  glow(g, E.W * 0.5, 190, 600, '#9ad8b0', 0.25); glow(g, E.W * 0.5, y + h / 2, 900, '#9ad8b0', 0.08);
  look(g, t);
} });
