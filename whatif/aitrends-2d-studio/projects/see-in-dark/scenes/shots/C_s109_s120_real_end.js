// C_s109_s120_real_end.js — batch C, shots s109-s120: "is any of this real?", the real things (vipers, cameras, goggles, photons),
// what is not real (no human sees heat, goggles and cats are blind without light), what it would take, "not close, not yet",
// the quiet street, the comment ask on the sofa, the white spark freeze, and the end screen.
import { E, V, S, mix, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, wordTime, alpha, glow, circle, ring, rr, seg, text, FONTS, rng } from '/engine/core.js';
import { POSES, posesAt, breathe, walkPose, bigFace, drawFigure } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { actor, cat } from '../sets/actors.js';
import { lab, labFg } from '../sets/lab.js';
import { apartment, apartmentFg } from '../sets/apartment.js';
import { street, streetFg } from '../sets/street.js';
import { forest, forestFg, forestGround } from '../sets/forest.js';
import { chip, darkness } from '../sets/hud.js';
import * as BP from '../sets/bp.js';
import { HERO, MINA, DEV, LIN, TOMAS } from '../cast.js';

const wt = (w, info, fb) => (wordTime(w, info.shot.start) ?? info.shot.start + fb) - info.shot.start;
const scr = (cam, x, y) => [(x - E.W / 2 - (cam.x || 0)) * (cam.z || 1) + E.W / 2, (y - E.H / 2 - (cam.y || 0)) * (cam.z || 1) + E.H / 2];
const push = (g, k, fn, cx = E.W / 2, cy = E.H / 2) => { g.save(); g.translate(cx, cy); g.scale(k, k); g.translate(-cx, -cy); fn(); g.restore(); };

// ---- blueprint icons (light-blue line art, drawn on with k) ----
function iconViper(g, x, y, k, t) { const pts = []; for (let i = 0; i <= 30; i++) { const u = i / 30; pts.push([x - 110 + u * 200, y + 30 - Math.sin(u * 8 - t * 2) * 18 * (1 - u * 0.4) - u * u * 50]); } BP.draw(g, pts, k, { w: 6 });
  const h = pts[30]; if (k > 0.9) { ring(g, h[0] + 14, h[1] - 4, 18, 4, S().ui.blueprint); circle(g, h[0] + 24, h[1] - 6, 4, S().ui.gold); } }
function iconCamera(g, x, y, k) { BP.draw(g, [[x - 90, y - 50], [x + 70, y - 50], [x + 70, y + 50], [x - 90, y + 50]], k, { close: true, w: 5 }); if (k > 0.5) { ring(g, x - 90, y, 30 * ease.out(prog(k, 0.5, 1)), 5, S().ui.blueprint); BP.draw(g, [[x - 10, y + 50], [x - 50, y + 140]], ease.out(prog(k, 0.6, 1)), { w: 5 }); BP.draw(g, [[x - 10, y + 50], [x + 30, y + 140]], ease.out(prog(k, 0.6, 1)), { w: 5 }); } }
function iconGoggles(g, x, y, k, blank = false) { const c = S().ui.blueprint; for (const dx of [-55, 55]) { const kk = ease.out(prog(k, dx < 0 ? 0 : 0.3, dx < 0 ? 0.6 : 0.9)); if (kk <= 0) continue; g.save(); g.globalAlpha *= kk; ring(g, x + dx, y, 46, 6, c); if (blank) circle(g, x + dx, y, 40, '#02030a'); else { glow(g, x + dx, y, 50, '#7fe06a', 0.25); } g.restore(); }
  BP.draw(g, [[x - 9, y - 6], [x + 9, y - 6]], k, { w: 6 }); BP.draw(g, [[x - 101, y], [x - 150, y - 30]], k, { w: 5 }); BP.draw(g, [[x + 101, y], [x + 150, y - 30]], k, { w: 5 }); }
function iconEye(g, x, y, k, t) { BP.draw(g, [[x - 100, y], [x - 50, y - 46], [x + 50, y - 46], [x + 100, y], [x + 50, y + 46], [x - 50, y + 46], [x - 100, y]], k, { w: 5 }); if (k > 0.6) { ring(g, x, y, 34, 5, S().ui.blueprint); circle(g, x, y, 14, S().ui.gold); BP.photon(g, t, { from: [x + 260, y - 60], to: [x + 40, y], k: (t * 0.8) % 1 }); } }
function tick(g, x, y, k) { if (k <= 0) return; const ui = S().ui; g.save(); g.translate(x, y); const s = ease.outBack(clamp(k * 1.4)); g.scale(s, s); circle(g, 0, 0, 34, alpha(ui.gold, 0.18)); ring(g, 0, 0, 34, 4, ui.gold); BP.draw(g, [[-14, 0], [-3, 12], [17, -12]], clamp(k * 1.6), { w: 6, color: ui.gold }); g.restore(); }
function cross(g, x, y, k) { if (k <= 0) return; const ui = S().ui; g.save(); g.translate(x, y); const s = ease.outBack(clamp(k * 1.4)); g.scale(s, s); ring(g, 0, 0, 34, 4, ui.accent); BP.draw(g, [[-12, -12], [12, 12]], clamp(k * 2), { w: 6, color: ui.accent }); BP.draw(g, [[12, -12], [-12, 12]], clamp(k * 2 - 0.5), { w: 6, color: ui.accent }); g.restore(); }
function label(g, str, x, y, a = 1) { text(g, str, x, y, { size: 30, color: S().ui.gold, font: FONTS.ui, weight: 900, alpha: a, spacing: 2 }); }

// s109 — "So... is any of this real?"  big gold line over the lab, LIN silhouetted at the blueprint wall
registerShot('s109', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.05 + 0.06 * k, x: lerp(-60, 40, k) };
  const L = lab(g, t, cam, { lights: 0.15, wallT: t + 2 });
  layer(g, cam, 1, (g) => actor(g, 'LIN', { x: L.pos.wallX + L.pos.wallW * 0.5, y: L.GY, s: 1.15, facing: 1, pose: breathe(posesAt(t, [[0, 'think'], [1.6, 'relaxed']]), t, 1, 5), expr: 'thinking', rim: { color: S().ui.blueprint, dir: [0, -1], w: 6 }, t }));
  labFg(g, t, cam); veil(g, '#02030a', 0.45);
  UI.bigLine(g, t, { str: 'IS ANY OF THIS REAL?', dur: info.dur, y: E.H * 0.42, size: 104 });
  FX.dust(g, t, { count: 30, color: '#9fb6ff', a: 0.25 });
} });

// s110 — BLUEPRINT: "Pit vipers are. Thermal cameras are."  icons draw on, gold ticks on the words
registerShot('s110', { draw(g, t, info) {
  const tV = wt('vipers', info, 0.4), tC = wt('cameras', info, 1.4), sc = 1 + 0.04 * (t / info.dur);
  push(g, sc, () => { BP.board(g, t, { title: 'IS IT REAL?', fig: 'FIG 10 - HEAT SENSING TODAY' });
    const y = E.H * 0.48; iconViper(g, E.W * 0.3, y, ease.out(prog(t, 0, 0.9)), t); iconCamera(g, E.W * 0.7, y, ease.out(prog(t, tC - 0.6, tC + 0.3)));
    label(g, 'PIT VIPER', E.W * 0.3, y + 150, ease.out(prog(t, tV, tV + 0.3))); label(g, 'THERMAL CAMERA', E.W * 0.7, y + 190, ease.out(prog(t, tC, tC + 0.3)));
    tick(g, E.W * 0.3 + 150, y - 110, prog(t, tV + 0.3, tV + 0.8)); tick(g, E.W * 0.7 + 150, y - 110, prog(t, tC + 0.3, tC + 0.8)); });
} });

// s111 — "Night-vision goggles are. Even single photons are, barely."  four icons, the last two get ticked; chip 'Real: all four'
registerShot('s111', { draw(g, t, info) {
  const tG = wt('goggles', info, 0.6), tP = wt('photons', info, 2.8), tB = wt('barely', info, 3.6), sc = 1.02 + 0.04 * (t / info.dur);
  push(g, sc, () => { BP.board(g, t, { title: 'IS IT REAL?', fig: 'FIG 11 - FOUR REAL THINGS' });
    const y = E.H * 0.5, xs = [0.16, 0.39, 0.62, 0.85].map(v => E.W * v);
    iconViper(g, xs[0], y, 1, t); iconCamera(g, xs[1], y, 1); iconGoggles(g, xs[2], y, ease.out(prog(t, tG - 0.5, tG + 0.4))); iconEye(g, xs[3], y, ease.out(prog(t, tP - 0.6, tP + 0.3)), t);
    ['PIT VIPER', 'THERMAL CAMERA', 'NIGHT VISION', 'ONE PHOTON'].forEach((s, i) => label(g, s, xs[i], y + 190, i < 2 ? 1 : ease.out(prog(t, i === 2 ? tG : tP, (i === 2 ? tG : tP) + 0.3))));
    tick(g, xs[0] + 120, y - 110, 1); tick(g, xs[1] + 120, y - 110, 1); tick(g, xs[2] + 120, y - 110, prog(t, tG + 0.4, tG + 0.9)); tick(g, xs[3] + 120, y - 110, prog(t, tB, tB + 0.5));
    if (t > tB) text(g, 'BARELY', xs[3], y - 180, { size: 26, color: S().ui.accent, font: FONTS.ui, weight: 900, alpha: ease.out(prog(t, tB, tB + 0.3)), spacing: 3 }); });
  chip(g, t, { str: 'Real: all four', at: tB + 0.2, x: E.W * 0.5, y: E.H * 0.88, tone: 'gold' });
} });

// s112 — "But no human can see heat."  giant face of HERO looking at his own hand, no glow
registerShot('s112', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), sc = 1.02 + 0.08 * k, tHeat = wt('heat', info, 1.4);
  blurLayer(g, 16, (g) => apartment(g, t, { z: 1.2, x: -200 }, { power: 0 })); veil(g, '#02030a', 0.5);
  push(g, sc, () => {
    bigFace(g, E.W * 0.42, E.H * 0.5, 270, { outfit: HERO, expr: t < tHeat ? 'thinking' : 'confused', look: [0.7, 0.6], rimColor: '#9fb6ff', rimSide: -1 });
    // his own hand, raised into frame: plain ink, no glow at all
    const hx = E.W * 0.72, hy = E.H * 0.6 - ease.out(prog(t, 0, 0.8)) * 90 + Math.sin(t * 1.3) * 4, ink = S().ink;
    const handShape = (col, ex) => { circle(g, hx, hy, 62 + ex / 2, col); for (let i = 0; i < 4; i++) { const a = -2.0 + i * 0.32; seg(g, [[hx + Math.cos(a) * 40, hy + Math.sin(a) * 40], [hx + Math.cos(a) * 104, hy + Math.sin(a) * 104]], 26 + ex, col); } seg(g, [[hx - 30, hy + 20], [hx - 92, hy - 4]], 26 + ex, col); };
    seg(g, [[hx + 120, E.H + 60], [hx + 20, hy + 70]], 46, '#E1AD01'); handShape(alpha('#9fb6ff', 0.85), 9); handShape(ink, 0);
    g.strokeStyle = alpha('#9fb6ff', 0.6); g.lineWidth = 4; g.beginPath(); g.arc(hx, hy, 66, -2.6, -1.2); g.stroke();
  }, E.W / 2, E.H * 0.55);
  chip(g, t, { str: 'No human can see heat', at: tHeat - 0.1, x: E.W * 0.42, y: E.H * 0.78, tone: 'coral' });
} });

// night-vision goggles prop on the bench
function goggles(g, x, y, s, t, blank = true) { g.save(); g.translate(x, y); g.scale(s, s); rr(g, -120, -50, 240, 90, 30); g.fillStyle = '#1e2230'; g.fill(); g.strokeStyle = '#3a4058'; g.lineWidth = 4; g.stroke();
  for (const dx of [-60, 60]) { circle(g, dx, -5, 40, '#0c0e16'); ring(g, dx, -5, 40, 5, '#4a5070'); circle(g, dx, -5, 30, blank ? '#020305' : '#3aff6a'); if (blank) { g.fillStyle = 'rgba(255,255,255,.06)'; g.beginPath(); g.ellipse(dx - 10, -16, 12, 7, -0.5, 0, 7); g.fill(); } }
  seg(g, [[-120, -20], [-200, -60], [-230, -20]], 10, '#1a1c26'); g.restore(); }

// s113 — "Goggles are not eyes."  insert: the goggles on the bench, their screens blank
registerShot('s113', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), L0 = { benchX: E.W / 2 + 860, benchTop: E.H * 0.8 - 250 }, cam = { z: 2.1 + 0.15 * k, x: lerp(L0.benchX - E.W / 2 - 160, L0.benchX - E.W / 2 - 80, k), y: L0.benchTop - E.H / 2 - 40 };
  const L = lab(g, t, cam, { lights: 0.2 });
  layer(g, cam, 1, (g) => { goggles(g, L.pos.benchX - 120, L.pos.benchTop - 36, 0.7, t, true); glow(g, L.pos.benchX - 120, L.pos.benchTop - 60, 260, '#7fa0ff', 0.08); });
  labFg(g, t, cam);
  chip(g, t, { str: 'Goggles are not eyes', at: 0.6, x: E.W * 0.5, y: E.H * 0.86, tone: 'blue' });
} });

// s114 — BLUEPRINT: "And without any light, cats and goggles are blind."  goggles and a cat both showing blank black screens
registerShot('s114', { draw(g, t, info) {
  const tLight = wt('light', info, 1.0), tBlind = wt('blind', info, 2.6), sc = 1 + 0.04 * (t / info.dur), lightOut = ease.inOut(prog(t, tLight - 0.2, tLight + 0.5));
  push(g, sc, () => { BP.board(g, t, { title: 'NO LIGHT = NOTHING TO AMPLIFY', fig: 'FIG 12 - CATS AND GOGGLES' });
    const ui = S().ui, y = E.H * 0.46;
    for (const [x, who] of [[E.W * 0.3, 'GOGGLES'], [E.W * 0.7, 'CAT']]) {
      rr(g, x - 230, y - 170, 460, 300, 16); g.fillStyle = mix('#3a5a3a', '#02030a', lightOut); g.fill(); g.strokeStyle = alpha(ui.blueprint, 0.9); g.lineWidth = 4; g.stroke();
      if (lightOut < 0.95) { g.save(); g.globalAlpha *= 1 - lightOut; for (let i = 0; i < 6; i++) circle(g, x - 160 + i * 64, y + 40 - (i % 2) * 40, 18, '#9aff8a'); g.restore(); }
      if (who === 'GOGGLES') iconGoggles(g, x, y + 230, 1, lightOut > 0.5); else { BP.draw(g, [[x - 70, y + 270], [x - 60, y + 200], [x - 40, y + 170], [x - 50, y + 140], [x - 20, y + 165], [x + 20, y + 165], [x + 50, y + 140], [x + 40, y + 170], [x + 60, y + 200], [x + 70, y + 270]], 1, { w: 5 }); for (const dx of [-24, 24]) circle(g, x + dx, y + 200, 8, lightOut > 0.5 ? '#1a2030' : '#c8f07a'); }
      text(g, who, x, y - 200, { size: 30, color: ui.gold, font: FONTS.ui, weight: 900, spacing: 3 });
      cross(g, x + 200, y - 150, prog(t, tBlind, tBlind + 0.5)); }
    // the light source switching off
    const lx = E.W * 0.5, ly = E.H * 0.2; circle(g, lx, ly, 26, mix('#fff2c0', '#1a2030', lightOut)); glow(g, lx, ly, 220, '#fff2c0', 0.4 * (1 - lightOut)); });
  chip(g, t, { str: 'Cats and goggles are blind', at: tBlind, x: E.W * 0.5, y: E.H * 0.9, tone: 'coral' });
} });

// s115 — "Your power would need infrared sensors, and a body that doesn't glow itself."  LIN at the wall points out the sensor; HERO nods
registerShot('s115', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.12 + 0.08 * k, x: lerp(-140, -60, k), y: -30 }, tIR = wt('infrared', info, 1.2), tBody = wt('body', info, 2.8), tGlow = wt('glow', info, 3.8);
  const L = lab(g, t, cam, { lights: 0.55, wallT: 3, wall: (g, x, y, w, h) => {
    const ui = S().ui, a = ease.out(prog(t, tIR - 0.4, tIR + 0.6)), b = ease.out(prog(t, tBody - 0.3, tBody + 0.6));
    g.fillStyle = alpha(ui.bpBg, 0.94); g.fillRect(x, y, w, h);                                   // a fresh sheet over the default art
    // the infrared sensor: a chip with LWIR waves hitting it
    g.save(); g.globalAlpha *= a; rr(g, x + 130, y + 170, 200, 200, 14); g.strokeStyle = ui.blueprint; g.lineWidth = 5; g.stroke(); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.strokeRect(x + 160 + i * 38, y + 200 + j * 38, 28, 28); }
    for (let r = 0; r < 3; r++) { g.beginPath(); g.arc(x + 470, y + 270, 50 + r * 40 + ((t * 60) % 40), Math.PI * 0.8, Math.PI * 1.2); g.strokeStyle = alpha(ui.gold, 0.8 - r * 0.2); g.stroke(); }
    text(g, 'IR SENSOR', x + 230, y + 410, { size: 28, color: ui.gold, font: FONTS.ui, weight: 900, spacing: 2 }); g.restore();
    // a cool body that doesn't glow itself
    g.save(); g.globalAlpha *= b; const bx = x + 780, by = y + 120; ring(g, bx, by, 40, 5, '#7fc0ff'); seg(g, [[bx, by + 40], [bx, by + 250]], 6, '#7fc0ff'); seg(g, [[bx, by + 100], [bx - 70, by + 180]], 6, '#7fc0ff'); seg(g, [[bx, by + 100], [bx + 70, by + 180]], 6, '#7fc0ff'); seg(g, [[bx, by + 250], [bx - 50, by + 380]], 6, '#7fc0ff'); seg(g, [[bx, by + 250], [bx + 50, by + 380]], 6, '#7fc0ff');
    const heatGone = ease.inOut(prog(t, tGlow - 0.2, tGlow + 0.6)); glow(g, bx, by + 180, 220, '#ff7a30', 0.4 * (1 - heatGone));
    text(g, heatGone > 0.5 ? 'BODY: NO GLOW' : 'BODY GLOWS', bx, by + 420, { size: 28, color: ui.gold, font: FONTS.ui, weight: 900, spacing: 2 }); g.restore(); } });
  layer(g, cam, 1, (g) => {
    actor(g, 'LIN', { x: L.pos.wallX - 70, y: L.GY, s: 1.3, facing: 1, pose: posesAt(t, [[0, 'explain'], [tIR - 0.2, 'point'], [tBody, 'pointUp'], [tGlow + 0.3, 'explain']], 0.3), expr: 'happy', rim: L.rim, t });
    const nod = Math.max(0, Math.sin((t - tGlow) * 9)) * (t > tGlow && t < tGlow + 0.8 ? 1 : 0);
    actor(g, 'HERO', { x: L.pos.wallX + L.pos.wallW + 140, y: L.GY, s: 1.3, facing: -1, pose: breathe(POSES.stand, t, 1, 3), expr: t > tGlow ? 'smile' : 'thinking', look: [0, 0.4 * nod], rim: L.rim, t });
  });
  labFg(g, t, cam);
} });

// s116 — "Are we close? Not yet."  big line 'NOT CLOSE. NOT YET.' with a small progress bar stuck near the left
registerShot('s116', { draw(g, t, info) {
  const ui = S().ui, tNot = wt('not', info, 1.2), sc = 1 + 0.04 * (t / info.dur);
  g.fillStyle = '#04050d'; g.fillRect(0, 0, E.W, E.H); FX.stars(g, t, { count: 110, area: [0, 0, E.W, E.H] }); glow(g, E.W / 2, E.H * 0.5, 900, '#2a3a8a', 0.25);
  push(g, sc, () => {
    UI.bigLine(g, t, { str: 'NOT CLOSE. NOT YET.', dur: info.dur, y: E.H * 0.4, size: 110 });
    const x = E.W * 0.22, y = E.H * 0.62, w = E.W * 0.56, a = ease.out(prog(t, 0.3, 0.8)), fill = 0.06 + 0.035 * ease.out(prog(t, 0.6, tNot)) + 0.004 * Math.sin(t * 9) * (t > tNot ? 1 : 0);
    g.save(); g.globalAlpha *= a; rr(g, x, y, w, 40, 20); g.fillStyle = alpha('#ffffff', 0.08); g.fill(); g.strokeStyle = alpha(ui.cream, 0.4); g.lineWidth = 3; g.stroke();
    rr(g, x + 4, y + 4, (w - 8) * fill, 32, 16); g.fillStyle = ui.gold; g.fill(); glow(g, x + (w - 8) * fill, y + 20, 60, ui.gold, 0.5);
    text(g, 'HUMAN HEAT VISION', x, y - 30, { size: 28, color: ui.cream, font: FONTS.ui, weight: 900, align: 'left', spacing: 3 }); text(g, `${Math.round(fill * 100)}%`, x + w, y - 30, { size: 28, color: ui.gold, font: FONTS.ui, weight: 900, align: 'right' }); g.restore();
  });
} });

// s117 — "The dark was never empty. It was only quiet."  the quiet street, HERO alone, lamps off, slow pull back, stars appear
registerShot('s117', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: lerp(1.3, 1.0, k), x: lerp(60, 0, k), y: lerp(60, 0, k) }, tQuiet = wt('quiet', info, 2.2);
  const St = street(g, t, cam, { power: 0 });
  FX.stars(g, t, { count: 160, area: [0, 0, E.W, E.H * 0.42], color: alpha('#ffffff', ease.out(prog(t, 0.3, tQuiet))) });
  layer(g, cam, 1, (g) => actor(g, 'HERO', { x: St.CX + 80, y: St.GY + 18, s: 1.1, facing: -1, pose: breathe(posesAt(t, [[0, 'stand'], [tQuiet - 0.4, 'relaxed']]), t, 1, 3), expr: t > tQuiet ? 'smile' : 'neutral', look: [0.2, -0.6], rim: St.rim, t }));
  streetFg(g, t, cam);
  FX.dust(g, t, { count: 24, color: '#c9d4ff', a: 0.2 });
} });

// s118 — "So what would you do... if you could see in complete darkness? Tell us in the comments."  HERO and BISCUIT on the sofa look to camera
registerShot('s118', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.35 + 0.06 * k, x: lerp(-260, -200, k), y: 60 }, tTell = wt('tell', info, 3.8), tCom = wt('comments', info, 4.6);
  const A = apartment(g, t, cam, { power: 0 });
  layer(g, cam, 1, (g) => {
    const sx = A.pos.sofaX, sy = A.GY - 4;
    actor(g, 'HERO', { x: sx - 40, y: sy, s: 1.35, facing: 1, pose: breathe(posesAt(t, [[0, 'sit'], [tTell - 0.2, 'sitBack']]), t, 0.8, 3), expr: t > tTell ? 'happy' : 'smile', look: [0, 0], rim: A.rim, t });
    cat(g, { x: sx + 110, y: sy - 58, s: 1.2, facing: -1, pose: 'sit', eyes: t > tCom ? 'glint' : ((t % 2.4) < 0.12 ? 'blink' : 'open'), t, rim: A.rim });
  });
  apartmentFg(g, t, cam);
  const bk = ease.outBack(prog(t, tCom - 0.1, tCom + 0.35)); if (bk > 0) { g.save(); g.translate(E.W * 0.7, E.H * 0.26); g.scale(bk, bk); UI.bubble(g, 0, 0, { w: 260, h: 120, str: 'Comment!' }); g.restore(); }
  chip(g, t, { str: 'What would you do?', at: 0.4, x: E.W * 0.32, y: E.H * 0.18, tone: 'gold', dur: tTell - 0.1 });
} });

// s119 — FREEZE: "And if you would trust that tiny white spark..."  the spark glowing in the dark, HERO and MINA holding hands in silhouette
registerShot('s119', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.3 + 0.08 * k, x: 40, y: 60 }, tSpark = wt('spark', info, 2.2), GY = forestGround();
  forest(g, 0.4, cam, { view: 'camp', rain: false }); veil(g, '#01020a', 0.55);
  const hx = E.W / 2 + 10, hy = GY - 92;
  layer(g, cam, 1, (g) => {
    const ink = '#010206', rim = { color: '#ffd9a0', dir: [0.3, -1], w: 5 };
    actor(g, { ...HERO, color: ink, legs: ink }, { x: E.W / 2 - 92, y: GY, s: 1.4, facing: 1, pose: { ...POSES.stand, hF: [52, -104], eF: [28, -130] }, expr: 'smile', ink, rim, t: 0.4 });
    actor(g, { ...MINA, color: ink, legs: ink, scarf: '#3a0a10' }, { x: E.W / 2 + 104, y: GY, s: 1.4, facing: -1, pose: { ...POSES.stand, hF: [60, -94], eF: [32, -122] }, expr: 'smile', ink, rim, t: 0.4 });
  });
  const [sx, sy] = scr(cam, hx, hy), pulse = 0.85 + 0.15 * Math.sin(t * 3) + 0.3 * ease.out(prog(t, tSpark - 0.2, tSpark + 0.4));
  glow(g, sx, sy, 420 * pulse, '#ffb24a', 0.35); glow(g, sx, sy, 90 * pulse, '#ffffff', 0.9); FX.sparkle(g, sx, sy, 70 * pulse, '#ffffff', 0.95);
  // frozen drops catching the spark
  const r = rng(19); for (let i = 0; i < 70; i++) { const x = r() * E.W, y = r() * E.H, d = Math.hypot(x - sx, y - sy); g.strokeStyle = alpha('#ffe0b0', clamp(0.5 - d / 1400) + 0.08); g.lineWidth = 2; g.beginPath(); g.moveTo(x, y + t * 3); g.lineTo(x + 5, y + 26 + t * 3); g.stroke(); }
} });

// s120 — END SCREEN: "hit like, and subscribe for more What Ifs."  'WHAT WOULD YOU DO?', comment bubble, subscribe pill, whole cast
registerShot('s120', { draw(g, t, info) {
  const tLike = wt('like', info, 0.6), tSub = wt('subscribe', info, 1.4), sc = 1 + 0.03 * (t / info.dur);
  push(g, sc, () => {
    UI.endScreen(g, t, { question: 'WHAT WOULD YOU DO?', cast: [HERO, MINA, DEV, LIN, TOMAS], moodColors: ['#0b0a1c', '#1d1530', '#3a2030'], rim: '#ffb070' });
    // Biscuit at the end of the line, and Mina's spark in her hand
    const n = 5, gap = Math.min(150, E.W * 0.85 / n), y0 = E.H - 170, mx = E.W / 2 + (1 - 2) * gap;
    const ck = ease.out(prog(t, 0.8, 1.2)); cat(g, { x: E.W / 2 + 3 * gap, y: y0 + (1 - ck) * 30, s: 0.9, facing: -1, pose: 'sit', eyes: (t % 2.2) < 0.12 ? 'blink' : 'glint', t, rim: { color: '#ffb070', dir: [0, 1] } });
    const sk = ease.out(prog(t, 0.9, 1.4)); glow(g, mx + 26, y0 - 96, 120, '#ffb24a', 0.4 * sk); glow(g, mx + 26, y0 - 96, 28, '#ffffff', 0.9 * sk);
    // like thumb pops on "like", the subscribe pill pulses on "subscribe"
    const lk = ease.outBack(prog(t, tLike, tLike + 0.4)); if (lk > 0) { g.save(); g.translate(E.W / 2 - V(420, 300), V(300, 560)); g.scale(lk, lk); rr(g, -90, -34, 180, 68, 34); g.fillStyle = '#2a2a3a'; g.fill(); g.strokeStyle = '#ffd47e'; g.lineWidth = 3; g.stroke(); text(g, 'LIKE', 0, 2, { size: 34, color: '#ffd47e', font: FONTS.ui, weight: 900, spacing: 3 }); g.restore(); }
    const tIfs = wt('ifs', info, 2.6), wk = ease.outBack(prog(t, tIfs - 0.5, tIfs)); if (wk > 0) { g.save(); g.translate(E.W / 2, E.H * 0.5); g.scale(wk, wk); text(g, 'MORE WHAT IFS', 0, 0, { size: 86, color: S().ui.gold, glow: 34, glowColor: 'rgba(255,150,60,.8)', spacing: 6 }); g.restore(); }
    const sp = t > tSub ? 1 + 0.08 * Math.sin((t - tSub) * 8) * (1 - prog(t, tSub, tSub + 1.4)) : 1; if (t > tSub) glow(g, E.W / 2 + V(60, 60), V(300, 560), 260 * sp, '#e0302a', 0.25);
  });
  FX.dust(g, t, { count: 30, color: '#ffcf9a', a: 0.25 });
  const out = ease.inOut(prog(t, info.dur - 0.6, info.dur)); if (out > 0) veil(g, '#000', out * 0.9);
} });
