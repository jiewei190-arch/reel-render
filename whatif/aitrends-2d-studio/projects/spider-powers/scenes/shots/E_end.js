// E_end.js — batch E part 3 (s112-s121): the reality check, the question, the end screen.
//   s112 the lab wide: gecko terrarium, silk spool, the glass wall; a worker carries a hand pad across, PIP rides the clipboard
//   s113 hand pad close-up: the micro-wedges flatten under pressure on 'pads', GECKO-INSPIRED / STANFORD tags
//   s114 the climber goes up the glass wall on two hand pads: 70 kg, height marks, NEARLY 4 m at the 3.7 m mark
//   s115 lab silk drawn through the bath onto the spinning spool, LABS tag, PIP watching
//   s116 FIG 7 - LAB SILK: REAL SILK vs LAB SILK bars, the lab bar stops short on 'weaker', a PIP outline on top
//   s117 FIG 2 reprise: the square-cube cube doubles, SIZE stamp
//   s118 split screen: PIP walks up the wall next to a raisin | HERO slides down the drainpipe into the flower bed
//   s119 WHICH POWER WOULD YOU KEEP? over the dimmed sunset garden
//   s120 three panels: STICKY HANDS / THE SILK / THE HAIRS THAT HEAR, PIP hops panel to panel
//   s121 END SCREEN in the sunny garden: comment bubble on 'Tell', subscribe + like on 'subscribe', the cast waving
// LEGAL: original hero only. No red-and-blue, no mask/bodysuit, no web logo or web pattern, no wrist shooters (silk only from the back
// end), no building swinging, no "spider sense" text or graphic. Titles and chips cream/gold.
import { E, registerShot, layer, blurLayer, veil, ease, prog, clamp, lerp, alpha, shade, glow, rr, seg, circle, ring, poly, text, measure, FONTS, linGrad } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { actor, cat, gecko } from '../sets/actors.js';
import { HERO, VOLUNTEER } from '../cast.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, walkAlong, lookToward, camMove, atmos } from '../sets/acting.js';
import { garden, gardenFg } from '../sets/garden.js';
import { pip, wallCling, stickMarks, silkLine, silkPuff, airHairs, gloves } from '../sets/spider.js';
import { lab, glassWall, handPad, silkSpool } from '../sets/spiderprops.js';
import { squareCube } from '../sets/spiderbp.js';
import { board } from '../sets/bp.js';
import { chip } from '../sets/hud.js';

const GOLD = '#ffd47e', CREAM = '#fff1dc', INK = '#140f1c', S = 1.9;
const CLIMBER = { top: 'tshirt', color: '#5a7a4a', legs: '#2a2a38', head: 'cap', headColor: '#e8e8e8' };   // a lab volunteer (never a cast colour)
const popIn = (t, a, d = 0.35) => ease.outBack(prog(t, a, a + d));
const push = (g, z, fn) => { g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2); fn(); g.restore(); };
function goldWord(g, str, x, y, size, k, rot = -0.03) {
  if (k <= 0) return; g.save(); g.translate(x, y); g.scale(k, k); g.rotate(rot);
  for (let i = 5; i >= 1; i--) text(g, str, i * 1.4, i * 1.8, { size, color: shade(GOLD, -0.55), font: FONTS.title, weight: 700 });
  text(g, str, 0, 0, { size, color: GOLD, font: FONTS.title, weight: 700, stroke: 12, strokeColor: INK, glow: 18, glowColor: alpha(GOLD, 0.6) }); g.restore();
}
function tag(g, str, x, y, k, rot = -0.03) {                                                            // a cream paper tag
  if (k <= 0) return; const w = measure(g, str, 34, FONTS.ui, 900) + 50; g.save(); g.translate(x, y); g.scale(k, k); g.rotate(rot);
  rr(g, -w / 2 + 6, -24, w, 56, 10); g.fillStyle = 'rgba(0,0,0,.3)'; g.fill(); rr(g, -w / 2, -30, w, 56, 10); g.fillStyle = CREAM; g.fill(); g.strokeStyle = INK; g.lineWidth = 4; g.stroke();
  text(g, str, 0, -1, { size: 34, color: INK, font: FONTS.ui, weight: 900, spacing: 2 }); g.restore();
}
const labBg = (g, t, amt = 8) => blurLayer(g, amt, (g) => lab(g, t, { z: 1.2, x: 0, y: -40, r: 0 }, {}));

// ---------------------------------------------------------------- s112 people are borrowing the tricks
registerShot('s112', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.05], x: [-30, 30], drift: 0.4 });
  const L = lab(g, t, cam, {}), GY = L.GY, CX = L.CX;
  layer(g, cam, 1, (g) => {
    // terrarium with a gecko on the glass (the bench, left)
    const tx = CX - 700, ty = GY - 300; rr(g, tx - 120, ty - 200, 240, 200, 10); g.fillStyle = alpha('#c8f0e8', 0.35); g.fill(); g.strokeStyle = '#5a6670'; g.lineWidth = 5; g.stroke();
    g.fillStyle = '#8a6a4a'; g.fillRect(tx - 116, ty - 40, 232, 38); gecko(g, { x: tx + 30, y: ty - 130, s: 0.8, rot: -1.3, t });
    silkSpool(g, t, CX - 480, ty - 70, 0.35, { label: '' });
    glassWall(g, t, CX + 60, GY, { s: 1, h: 640, climb: 0, climber: CLIMBER });
    // the worker carries a hand pad across; PIP rides on the clipboard
    const u = ease.inOut(prog(t, 0.5, info.dur + 0.4)), wx = lerp(CX - 760, CX - 160, u), W = walkAlong(wx, S);
    const pose = { ...W.pose, eF: [24, -138], hF: [40, -150], eB: [18, -140], hB: [34, -152] };
    actor(g, VOLUNTEER, { x: wx, y: GY, s: S, facing: 1, pose, expr: 'smile', blink: blinkFlag(t, 3.1, 2), look: lookToward(1, 0), t });
    const hx = wx + 38 * S, hy = GY - 150 * S; rr(g, hx - 10, hy - 70, 110, 140, 8); g.fillStyle = '#c89a5a'; g.fill(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke(); rr(g, hx, hy - 58, 90, 116, 4); g.fillStyle = '#f4f1e8'; g.fill();
    for (let i = 0; i < 4; i++) seg(g, [[hx + 12, hy - 36 + i * 20], [hx + 76, hy - 36 + i * 20]], 3, alpha('#5a6670', 0.5));
    pip(g, hx + 46, hy - 74, 0.9, { t, look: [1, -0.1], tilt: Math.sin(t * 1.5) * 0.4 });
    g.save(); g.translate(hx + 20, hy + 80); g.scale(0.22, 0.22); handPad(g, 0, 0, 1, { t }); g.restore();
  });
  atmos(g, t, cam, { color: '#f4fbff', far: 10, near: 3 });
} });

// ---------------------------------------------------------------- s113 gecko-inspired hand pads from Stanford
registerShot('s113', { draw(g, t, info) {
  labBg(g, t, 10); veil(g, '#0b1324', 0.25);
  push(g, lerp(1.0, 1.06, ease.inOut(clamp(t / info.dur))), () => {
    const press = ease.inOut(prog(t, 1.6, 2.0)); handPad(g, E.W * 0.5, E.H * 0.53 + press * 6, 1.55, { press, t, detail: 1 });
    if (t > 1.75) { const u = prog(t, 1.75, 2.4); glow(g, lerp(E.W * 0.3, E.W * 0.7, u), E.H * 0.4, 140, '#ffffff', 0.6 * Math.sin(u * Math.PI)); }   // the glint as it grips
  });
  tag(g, 'GECKO-INSPIRED', E.W * 0.22, E.H * 0.16, popIn(t, 0.33));
  tag(g, 'STANFORD', E.W * 0.8, E.H * 0.86, popIn(t, 2.45), 0.03);
} });

// ---------------------------------------------------------------- s114 70 kg up nearly 4 m of glass
registerShot('s114', { draw(g, t, info) {
  const climb = ease.inOut(prog(t, 1.15, 3.3)), cam = camMove(t, info.dur, { z: [1.0, 1.08], x: [-20, -10], y: [40, -60], drift: 0.4 });
  const L = lab(g, t, cam, {}), GY = L.GY, x = L.CX - 130, H = 760;
  let head;
  layer(g, cam, 1, (g) => {
    head = glassWall(g, t, x, GY, { s: 1.1, h: H, climb, climber: CLIMBER });
    const my = GY - H; seg(g, [[x + 286 + 14, my], [x + 286 + 60, my]], 6, GOLD);                       // the 3.7 m mark in gold
    goldWord(g, '3.7 m', x + 286 + 150, my, 46, popIn(t, 2.6));
  });
  goldWord(g, '70 kg', E.W * 0.22, E.H * 0.42, 110, popIn(t, 0.21));
  chip(g, t, { str: 'NEARLY 4 m', at: 3.11, x: E.W * 0.8, y: E.H * 0.42 });
} });

// ---------------------------------------------------------------- s115 labs spin artificial spider silk, too
registerShot('s115', { draw(g, t, info) {
  labBg(g, t, 9); veil(g, '#0b1324', 0.2);
  push(g, lerp(1.0, 1.05, ease.inOut(clamp(t / info.dur))), () => {
    silkSpool(g, t, E.W * 0.55, E.H * 0.5, 1.5, { draw: ease.out(prog(t, 0.35, 1.63)), spin: t > 0.35 ? 1 : 0, label: 'ARTIFICIAL SILK' });
    rr(g, -40, E.H * 0.86, E.W * 0.4, 200, 0); g.fillStyle = '#e8ecf0'; g.fill(); seg(g, [[-40, E.H * 0.86], [E.W * 0.4, E.H * 0.86]], 5, INK);   // bench edge
    pip(g, E.W * 0.2, E.H * 0.86, 2.2, { t, look: [0.9, -0.2], tilt: 0.6 + Math.sin(t * 1.2) * 0.2, blink: blinkAmt(t, 2.6, 0) });
  });
  tag(g, 'LABS', E.W * 0.16, E.H * 0.16, popIn(t, 0.15));
} });

// ---------------------------------------------------------------- s116 FIG 7: so far, weaker than the real thing
function pipOutline(g, x, y, s, k) {
  if (k <= 0) return; g.save(); g.translate(x, y); g.scale(s * k, s * k); g.strokeStyle = CREAM; g.lineWidth = 4; g.lineCap = 'round';
  for (const sd of [-1, 1]) for (let i = 0; i < 4; i++) { const a = -0.6 + i * 0.45; g.beginPath(); g.moveTo(sd * 20, -20); g.lineTo(sd * (34 + i * 4), -38 + i * 10); g.lineTo(sd * (48 + i * 6), -2); g.stroke(); }
  g.beginPath(); g.ellipse(0, -34, 26, 22, 0, 0, 7); g.stroke(); g.beginPath(); g.ellipse(-2, -6 - 30, 30, 0.1, 0, 0, 7); g.stroke();
  for (const ex of [-9, 9]) { g.beginPath(); g.arc(ex, -38, 8, 0, 7); g.stroke(); }
  g.beginPath(); g.ellipse(0, -74, 22, 18, 0, 0, 7); g.stroke(); g.restore();
}
registerShot('s116', { draw(g, t, info) {
  board(g, t, { title: 'FIG 7 - LAB SILK', fig: 'SO FAR' });
  push(g, lerp(1.0, 1.035, ease.inOut(clamp(t / info.dur))), () => {
    const base = E.H * 0.8, bw = 220, xs = [E.W * 0.38, E.W * 0.62], hs = [560 * ease.out(prog(t, 0.1, 0.8)), 330 * ease.out(prog(t, 0.4, 1.11))];
    ['REAL SILK', 'LAB SILK'].forEach((name, i) => {
      rr(g, xs[i] - bw / 2, base - hs[i], bw, hs[i], 10); g.fillStyle = alpha(GOLD, i ? 0.55 : 0.9); g.fill(); g.strokeStyle = GOLD; g.lineWidth = 4; g.stroke();
      text(g, name, xs[i], base + 50, { size: 40, color: CREAM, font: FONTS.ui, weight: 900, spacing: 2 });
    });
    seg(g, [[E.W * 0.24, base], [E.W * 0.76, base]], 4, alpha(CREAM, 0.7));
    const st = popIn(t, 1.11); if (st > 0) { g.save(); g.translate(xs[1] + 190, base - 330); g.scale(st, st); g.rotate(-0.1); rr(g, -110, -36, 220, 72, 10); g.strokeStyle = GOLD; g.lineWidth = 6; g.stroke(); text(g, 'WEAKER', 0, 2, { size: 44, color: GOLD, font: FONTS.ui, weight: 900, spacing: 3 }); g.restore(); }
    pipOutline(g, xs[0], base - hs[0] - 4, 1.4, popIn(t, 1.83));
    text(g, 'results vary by lab', E.W * 0.5, E.H * 0.2, { size: 30, color: alpha(CREAM, 0.7), font: FONTS.ui, weight: 900, spacing: 2, alpha: ease.out(prog(t, 0.6, 1.0)) });
  });
} });

// ---------------------------------------------------------------- s117 the catch is always size
registerShot('s117', { draw(g, t, info) {
  board(g, t, { title: 'FIG 2 - THE SIZE PROBLEM', fig: 'SQUARE-CUBE LAW' });
  push(g, lerp(1.0, 1.04, ease.inOut(clamp(t / info.dur))), () => squareCube(g, t, { x: E.W * 0.5, y: E.H * 0.45, s: 1.2, k: 1, grow: ease.inOut(prog(t, 0.27, 0.95)) }));
  const k = popIn(t, 0.95, 0.25); if (k > 0) { g.save(); g.translate(E.W * 0.78, E.H * 0.74); g.scale(lerp(1.6, 1, k), lerp(1.6, 1, k)); g.rotate(-0.12); g.globalAlpha *= clamp(k * 2);
    rr(g, -170, -60, 340, 120, 14); g.strokeStyle = GOLD; g.lineWidth = 9; g.stroke(); text(g, 'SIZE', 0, 4, { size: 96, color: GOLD, font: FONTS.title, weight: 700, spacing: 8, glow: 18, glowColor: alpha(GOLD, 0.5) }); g.restore(); }
} });

// ---------------------------------------------------------------- s118 raisin size works | your size falls apart
function raisin(g, x, y, s) {
  g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#5a2a3a'; g.beginPath(); g.ellipse(0, 0, 30, 24, 0.3, 0, 7); g.fill();
  g.strokeStyle = alpha('#2a0a1a', 0.7); g.lineWidth = 3; for (const [a, b, c] of [[-20, -6, 14], [-12, 8, 18], [-4, -14, 10], [6, 4, 16]]) { g.beginPath(); g.arc(a, b, c, 0.3, 1.8); g.stroke(); }
  circle(g, -10, -10, 5, alpha('#ffffff', 0.25)); g.restore();
}
registerShot('s118', { draw(g, t, info) {
  const half = E.W / 2;
  // LEFT: Pip walks up a wall beside a raisin
  g.save(); g.beginPath(); g.rect(0, 0, half, E.H); g.clip();
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#e8dcc4', '#cbb898']); g.fillRect(0, 0, half, E.H);
  for (let y = 0; y < E.H; y += 70) for (let x = (y / 70) % 2 ? 0 : 60; x < half; x += 120) { rr(g, x, y, 116, 66, 4); g.fillStyle = alpha('#b8a07a', 0.25); g.fill(); }
  const z = lerp(1.0, 1.05, clamp(t / info.dur)), climb = ease.inOut(prog(t, 0.6, 3.6)), px = half * 0.56, py = lerp(E.H * 0.8, E.H * 0.3, climb);
  raisin(g, half * 0.36, E.H * 0.52, 2.2);
  const marks = []; for (let i = 0; i < 6; i++) { const yy = lerp(E.H * 0.8, E.H * 0.3, climb * i / 5); if (climb > i / 6) marks.push([px - 30 + (i % 2) * 60, yy + 40]); }
  stickMarks(g, t, marks, { alpha: 0.4 });
  g.save(); g.translate(px, py); g.rotate(-Math.PI / 2); pip(g, 0, 0, 2.4 * z, { t, facing: 1, tilt: Math.sin(t * 3) * 0.2, blink: blinkAmt(t, 2.8, 0) }); g.restore();
  text(g, 'RAISIN SIZE', half * 0.5, 80, { size: 44, color: GOLD, font: FONTS.ui, weight: 900, spacing: 3, stroke: 8, strokeColor: INK, alpha: ease.out(prog(t, 0.2, 0.6)) });
  g.restore();
  // RIGHT: the hero slides down the drainpipe into the flower bed
  g.save(); g.beginPath(); g.rect(half, 0, half, E.H); g.clip();
  const zc = lerp(0.95, 1.0, clamp(t / info.dur)), pipeX = E.W / 2 + 160;                               // garden.js wall view: pos.pipeX = CX + 160
  g.save(); g.translate(half / 2, 0);
  const cam = { z: zc, x: pipeX - E.W / 2 - 40 + Math.sin(t * 0.6) * 4, y: -150 + Math.cos(t * 0.5) * 3, r: 0 };
  const G = garden(g, t, cam, { view: 'wall', mood: 'day' }), slide = ease.inOut(prog(t, 1.91, 3.4)), land = t > 3.4;
  const pX = G.pos.pipeX ?? pipeX;
  layer(g, cam, 1, (g) => {
    const R = wallCling(t, { climb: 0, slide, slideDist: 300 }), o = { x: pX - 44 * S, y: G.GY - 300 + R.dy, s: S, facing: 1 };
    if (!land) { actor(g, 'HERO', { ...o, pose: R.pose, expr: exprAt(t, [[0, 'determined'], [1.91, 'worried']]), blink: blinkFlag(t, 3.2, 1), look: lookToward(0.3, -0.6), rim: G.rim, t }); gloves(g, o, R.pose, { t, slip: prog(t, 2.1, 2.4) + (t > 2.4 ? 1 : 0), tSlip: 2.4 }); }
    else { const o2 = { x: pX - 60, y: G.GY + 20, s: S, facing: -1 }, pose = POSES.sitBack; actor(g, 'HERO', { ...o2, pose, expr: exprAt(t, [[3.4, 'shocked'], [3.63, 'sheepish']]), blink: blinkFlag(t, 3.2, 1), look: lookToward(0, 0.1), rim: G.rim, t }); gloves(g, o2, pose, { t, slip: 1, tSlip: 2.4 }); }
    for (let i = 0; i < 6; i++) { const fx = pX - 220 + i * 70; seg(g, [[fx, G.GY + 30], [fx, G.GY - 30]], 4, '#3a6a3a'); circle(g, fx, G.GY - 36, 18, ['#d84a6a', '#f2c230', '#9a5ad6'][i % 3]); }   // the flower bed
    if (land) { const k = prog(t, 3.4, 3.9); for (let i = 0; i < 8; i++) { const a = -Math.PI + i * 0.45; circle(g, pX - 60 + Math.cos(a) * 140 * k, G.GY - 30 + Math.sin(a) * 90 * k + 160 * k * k, 9 * (1 - k), alpha(['#d84a6a', '#f2c230', '#9a5ad6'][i % 3], 1 - k)); } }   // petals fly
  });
  g.restore();
  text(g, 'YOUR SIZE', half * 1.5, 80, { size: 44, color: GOLD, font: FONTS.ui, weight: 900, spacing: 3, stroke: 8, strokeColor: INK, alpha: ease.out(prog(t, 1.6, 2.0)) });
  g.restore();
  seg(g, [[half, 0], [half, E.H]], 8, CREAM); seg(g, [[half, 0], [half, E.H]], 2, alpha(INK, 0.4));
} });

// ---------------------------------------------------------------- s119 + s120 the question
const sunset = (g, t, blur = 7) => { blurLayer(g, blur, (g) => { garden(g, t, { z: 1.0, x: 0, y: -120, r: 0 }, { view: 'garden', mood: 'dusk', storm: 0 }); }); veil(g, '#140f1c', 0.42); glow(g, E.W / 2, E.H * 0.45, 900, '#ff9a40', 0.15); };
function question(g, t, at, y = E.H * 0.42, size = 108) {
  const words = ['WHICH', 'POWER', 'WOULD', 'YOU', 'KEEP?'], k = popIn(t, at, 0.45); if (k <= 0) return;
  g.save(); g.translate(E.W / 2, y); g.scale(k, k); g.rotate(-0.015);
  text(g, words.join(' '), 0, 0, { size, color: CREAM, font: FONTS.title, weight: 700, stroke: size * 0.16, strokeColor: '#1a0f26', glow: 30, glowColor: alpha('#ff9a40', 0.65) }); g.restore();
}
registerShot('s119', { draw(g, t, info) {
  push(g, lerp(1.0, 1.04, ease.inOut(clamp(t / info.dur))), () => sunset(g, t));
  question(g, t, 0.37);
  pip(g, E.W * 0.5, E.H * 0.66, 2.0, { t, hop: prog(t, 0.6, 1.0), tilt: Math.sin(t * 2) * 0.5, blink: blinkAmt(t, 2.6, 1) });
} });
registerShot('s120', { draw(g, t, info) {
  push(g, lerp(1.04, 1.07, ease.inOut(clamp(t / info.dur))), () => sunset(g, t + 1.82));
  question(g, t, -1, E.H * 0.13, 64);
  const at = [0.15, 0.93, 1.63], names = ['STICKY HANDS', 'THE SILK', 'THE HAIRS THAT HEAR'], pw = 500, ph = 470, gap = 60, x0 = E.W / 2 - pw * 1.5 - gap, y0 = E.H * 0.24;
  const cur = t >= at[2] ? 2 : t >= at[1] ? 1 : 0;
  names.forEach((nm, i) => {
    const k = ease.outBack(prog(t, at[i], at[i] + 0.4)); if (k <= 0) return; const x = x0 + i * (pw + gap), cx = x + pw / 2, cy = y0 + ph / 2;
    g.save(); g.translate(cx, cy + (1 - k) * 120); g.globalAlpha *= clamp(k * 1.5); g.translate(-cx, -cy);
    rr(g, x + 10, y0 + 14, pw, ph, 26); g.fillStyle = 'rgba(0,0,0,.4)'; g.fill(); rr(g, x, y0, pw, ph, 26); g.fillStyle = alpha('#2a2036', 0.92); g.fill(); g.strokeStyle = CREAM; g.lineWidth = 6; g.stroke();
    g.save(); rr(g, x, y0, pw, ph, 26); g.clip();
    if (i === 0) { const hx = cx, hy = cy + 10; g.fillStyle = '#c8956a'; g.beginPath(); g.ellipse(hx, hy + 40, 90, 100, 0, 0, 7); g.fill();          // an open palm with suction rings
      for (let f = 0; f < 4; f++) { rr(g, hx - 86 + f * 44, hy - 130 + Math.abs(f - 1.5) * 16, 38, 120, 19); g.fill(); } g.save(); g.translate(hx + 92, hy + 10); g.rotate(-0.6); rr(g, -20, -70, 40, 100, 20); g.fill(); g.restore();
      stickMarks(g, t, [[hx - 66, hy - 110], [hx - 22, hy - 120], [hx + 22, hy - 118], [hx + 66, hy - 104], [hx, hy + 40]], { alpha: 0.7 }); }
    if (i === 1) { silkLine(g, [x + 40, y0 + 60], [x + pw - 60, y0 + ph - 120], { t, sag: 30, w: 4 }); silkPuff(g, (t - at[1]) % 1.4, 0, cx - 40, cy + 60, { dir: -1 }); }
    if (i === 2) { const ax = cx, ay = cy + 30; g.save(); g.translate(ax, ay); g.rotate(-0.4); rr(g, -190, -45, 380, 90, 45); g.fillStyle = '#c8956a'; g.fill(); g.restore();   // a forearm
      airHairs(g, t, ax, ay - 40, 1); for (let r = 0; r < 3; r++) { const u = ((t * 0.8 + r / 3) % 1); g.strokeStyle = alpha(GOLD, 0.6 * (1 - u)); g.lineWidth = 4; g.beginPath(); g.arc(ax + 150, ay - 120, 30 + u * 120, -2.4, -0.6); g.stroke(); } }
    g.restore();
    goldWord(g, String(i + 1), x + 50, y0 + 50, 76, 1, 0);
    text(g, nm, cx, y0 + ph - 50, { size: 38, color: CREAM, font: FONTS.ui, weight: 900, spacing: 2, stroke: 6, strokeColor: INK });
    g.restore();
  });
  // PIP hops from panel to panel on each word, sitting on the top edge of the current one
  const xAt = (i) => x0 + i * (pw + gap) + pw - 90, hop = [prog(t, at[1] - 0.05, at[1] + 0.3), prog(t, at[2] - 0.05, at[2] + 0.3)];
  const from = cur === 0 ? 0 : cur - 1, hk = cur === 0 ? 0 : hop[cur - 1], px = lerp(xAt(from), xAt(cur), ease.inOut(hk));
  if (t > at[0] + 0.25) pip(g, px, y0 - 2, 1.5, { t, hop: hk < 1 ? hk : 0, look: [0.3, 0.3], blink: blinkAmt(t, 2.6, 2) });
} });

// ---------------------------------------------------------------- s121 END SCREEN
registerShot('s121', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.12, 1.15], x: [-200, -190], y: [-60, -66], drift: 0.4 });
  const G = garden(g, t, cam, { view: 'garden', mood: 'day' }), GY = G.GY, CX = G.CX;
  layer(g, cam, 1, (g) => {
    const hx = CX - 520, ho = { x: hx, y: GY + 30, s: S, facing: 1 }, hp = idle(poseAt(t, [[0, 'wave'], [0.6, { ...POSES.wave, hF: [44, -246] }]]), t, 2);
    actor(g, 'HERO', { ...ho, pose: { ...hp, hF: [hp.hF[0] + Math.sin(t * 7) * 10, hp.hF[1]] }, expr: 'joy', blink: blinkFlag(t, 3.3, 2), look: lookToward(0.2, 0.2), rim: G.rim, t });
    gloves(g, { ...ho }, { ...hp, hF: [hp.hF[0] + Math.sin(t * 7) * 10, hp.hF[1]] }, { t });
    const sh = [hx + hp.sh[0] * S - 10, GY + 30 + hp.sh[1] * S - 4];
    pip(g, sh[0], sh[1], 1.0, { t, wave: 0.5 + 0.5 * Math.sin(t * 6), look: [0.3, 0.2] });
    const mx = CX - 220, mp = { ...POSES.holdFront, hF: [30, -140], hB: [24, -142] };
    actor(g, 'MINA', { x: mx, y: GY + 40, s: 2.0, facing: 1, pose: idle(mp, t, 4), expr: 'happy', blink: blinkFlag(t, 2.9, 4), look: lookToward(0.3, 0.2), rim: G.rim, t });
    cat(g, { x: mx + 30 * 1.44, y: GY + 40 - 120 * 1.44, s: 1.2, facing: -1, pose: 'loaf', eyes: 'offended', t });
    actor(g, 'DEV', { x: CX + 60, y: GY + 30, s: S, facing: -1, pose: idle(POSES.phone, t, 6), expr: 'smile', blink: blinkFlag(t, 3.0, 6), look: lookToward(-0.3, 0.1), rim: G.rim, t });
  });
  gardenFg(g, t, cam, { view: 'garden' });
  // comment bubble on 'Tell', subscribe pill + like on 'subscribe'
  const bk = popIn(t, 0.15); if (bk > 0) { g.save(); g.translate(E.W * 0.7, E.H * 0.28); g.scale(bk, bk); UI.bubble(g, 0, 0, { w: 200, h: 120 }); g.restore();
    text(g, 'Tell us in the comments', E.W * 0.7, E.H * 0.42, { size: 44, color: CREAM, font: FONTS.ui, weight: 900, stroke: 8, strokeColor: INK, alpha: clamp(bk) }); }
  const sk = popIn(t, 1.99, 0.4); if (sk > 0) { g.save(); g.translate(E.W * 0.7, E.H * 0.6); g.scale(sk, sk);
    rr(g, -230, -55, 460, 110, 55); g.fillStyle = '#e0302a'; g.fill(); text(g, 'Subscribe', 20, 3, { size: 54, color: '#fff', font: FONTS.ui, weight: 900 });
    g.fillStyle = '#fff'; g.beginPath(); g.moveTo(-168, 16); g.quadraticCurveTo(-168, -26, -148, -26); g.quadraticCurveTo(-128, -26, -128, 16); g.closePath(); g.fill(); circle(g, -148, 26, 7, '#fff');
    g.translate(330, 0); circle(g, 0, 0, 56, alpha('#140f1c', 0.85)); g.fillStyle = CREAM; rr(g, -26, -6, 16, 36, 4); g.fill(); g.beginPath(); g.moveTo(-6, -6); g.lineTo(6, -34); g.quadraticCurveTo(18, -34, 16, -18); g.lineTo(14, -6); g.lineTo(28, -6); g.quadraticCurveTo(34, 10, 24, 30); g.lineTo(-6, 30); g.closePath(); g.fill();   // like (thumb)
    g.restore();
    text(g, 'for more What Ifs', E.W * 0.7, E.H * 0.73, { size: 40, color: CREAM, font: FONTS.ui, weight: 900, stroke: 8, strokeColor: INK, alpha: clamp(sk) }); }
} });
