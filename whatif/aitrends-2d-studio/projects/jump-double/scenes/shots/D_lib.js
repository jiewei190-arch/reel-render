// D_lib.js — batch D (s067-s088) shared helpers. Registers no shots; imported by the D_*.js shot files.
//   shotWord(w, st, fb [, after])   shot-local seconds of a spoken word (fallback fb when the word is missing)
//   gearBack / gearFront(g, o, pose, { tank, mask, helmet })   the day-16 gear on a figure: diving tank (behind), mask on the forehead, DEV's helmet
//   faceGear(g, cx, cy, r, { mask, helmet, tilt })   the same gear on a giantFace
//   riseJ(t, v, o)   a jumper() state for a figure drifting up (v 0..1 speed) / floating (v 0) without a ground to take off from
//   dayHUD(g, t, keys) / meterHUD(g, t, metres, o)   the DAY counter (top-left) and the height meter (right edge), placed the same in every shot
//   weatherBalloon(g, x, y, s, t)   a small latex weather balloon with a radiosonde box
//   plasma(g, x, y, s, t, k, dir)   re-entry heat aura: white core, orange/red sheath, a streaming tail opposite to `dir`
//   bulletIcon(g, x, y, s)          a brass rifle-bullet icon (for 'faster than a rifle bullet')
//   notebook(g, t, o)               the lamp-lit notebook page with the doubling table (reveal 0..1, circle 0..1, escape 0..1)
import { E, clamp, lerp, ease, prog, rr, seg, circle, poly, alpha, shade, glow, text, FONTS, wordTime, rng, linGrad, radGrad, S } from '/engine/core.js';
import { POSES, breathe } from '/engine/rig2d.js';
import { dayCounter, heightMeter } from '../sets/devices.js';
import { JPOSE } from '../sets/jump.js';

export const shotWord = (w, st, fb, after = 0) => { const g = wordTime(w, st + after); return (g == null || g > st + 30 ? st + fb : g) - st; };

// ---------- gear on a full figure (same local transform as actor()/drawFigure) ----------
function local(g, o, pose) { const s = (o.s ?? 1) * (o.kid ? 0.72 : 1), f = o.facing ?? 1; g.translate(o.x, o.y); g.scale(f * s, s); if (o.rot) { g.translate(pose.hip[0], pose.hip[1]); g.rotate(o.rot); g.translate(-pose.hip[0], -pose.hip[1]); } return f; }
export function gearBack(g, o, pose, gear = {}) {
  if (!gear.tank) return; g.save(); local(g, o, pose); const [sx, sy] = pose.sh, [hx, hy] = pose.hip, a = Math.atan2(hy - sy, hx - sx) - Math.PI / 2, sag = gear.sag ?? 0;
  g.translate(sx, sy + 4 + sag * 6); g.rotate(a);
  rr(g, -34, -6, 26, 86, 12); g.fillStyle = linGrad(g, -34, 0, -8, 0, ['#5a7a8c', '#b8d4e2', '#6a8a9c']); g.fill(); g.strokeStyle = '#1a2430'; g.lineWidth = 2.5; g.stroke();
  g.fillStyle = '#d4262e'; g.fillRect(-34, 24, 26, 7); rr(g, -26, -16, 10, 12, 3); g.fillStyle = '#3a3a44'; g.fill(); circle(g, -21, -18, 5, '#8a8a94');
  seg(g, [[-21, -18], [-2, -30], [10, -24]], 3, '#1a1a22');                                   // hose to the mask
  g.restore();
}
export function gearFront(g, o, pose, gear = {}) {
  g.save(); const f = local(g, o, pose), [hx, hy] = pose.head, [sx, sy] = pose.sh;
  if (gear.tank) { seg(g, [[sx - 6, sy - 2], [sx + 8, sy + 26], [sx + 2, sy + 56]], 5, '#20262e'); }                          // harness strap
  if (gear.helmet) {
    g.fillStyle = '#f4f1e8'; g.beginPath(); g.arc(hx - 1, hy - 3, 31, Math.PI * 1.03, Math.PI * 1.97); g.closePath(); g.fill();
    g.strokeStyle = '#c8c0b0'; g.lineWidth = 2; for (const dx of [-12, 0, 12]) { g.beginPath(); g.moveTo(hx - 1 + dx, hy - 32); g.lineTo(hx - 1 + dx * 1.15, hy - 14); g.stroke(); }
    seg(g, [[hx - 31, hy - 4], [hx + 29, hy - 4]], 4, '#2a2632'); seg(g, [[hx - 22, hy - 2], [hx - 14, hy + 20], [hx + 10, hy + 22]], 2, '#2a2632');
    g.save(); g.translate(hx + 4, hy - 17); g.scale(f, 1); text(g, 'DEV', 0, 0, { size: 14, color: '#f08a24', font: FONTS.title, weight: 700, spacing: 1 }); g.restore();
  }
  if (gear.mask) { const my = gear.helmet ? hy - 6 : hy - 16;
    seg(g, [[hx - 26, my + 2], [hx + 4, my + 4]], 3, '#1a1a22');
    rr(g, hx + 2, my - 7, 26, 16, 7); g.fillStyle = '#20262e'; g.fill(); rr(g, hx + 5, my - 4, 20, 10, 5); g.fillStyle = alpha('#9fe8ff', 0.85); g.fill(); g.fillStyle = alpha('#fff', 0.7); g.fillRect(hx + 8, my - 3, 5, 3); }
  g.restore();
}
// gear on a giant face (head = circle r at cx, cy)
export function faceGear(g, cx, cy, r, o = {}) {
  g.save(); g.translate(cx, cy); if (o.tilt) g.rotate(o.tilt);
  if (o.helmet) {
    const hy = -r * 0.3, R = r * 1.06, a0 = Math.PI * 1.1, a1 = Math.PI * 1.9;
    g.fillStyle = linGrad(g, 0, hy - R, 0, hy, ['#ffffff', '#e4ded2']); g.beginPath(); g.arc(0, hy, R, a0, a1); g.closePath(); g.fill();
    g.strokeStyle = '#c8c0b0'; g.lineWidth = r * 0.025; for (const dx of [-0.42, 0, 0.42]) { g.beginPath(); g.moveTo(dx * r, hy - R * 0.92); g.quadraticCurveTo(dx * r * 1.15, hy - R * 0.5, dx * r * 1.25, hy - R * 0.33); g.stroke(); }
    g.strokeStyle = '#2a2632'; g.lineWidth = r * 0.05; g.beginPath(); g.moveTo(Math.cos(a0) * R, hy + Math.sin(a0) * R); g.lineTo(Math.cos(a1) * R, hy + Math.sin(a1) * R); g.stroke();
    text(g, 'DEV', 0, hy - R * 0.62, { size: r * 0.3, color: '#f08a24', font: FONTS.title, weight: 700, stroke: r * 0.02, strokeColor: '#a04a10' });
  }
  if (o.mask) { const my = o.helmet ? -r * 0.64 : -r * 0.66, w = r * 0.86, h = r * 0.3;
    seg(g, [[-r * 0.98, my + h * 0.1], [r * 0.98, my + h * 0.1]], r * 0.05, '#1a1a22');
    rr(g, -w / 2, my - h / 2, w, h, h * 0.45); g.fillStyle = '#20262e'; g.fill(); rr(g, -w / 2 + r * 0.04, my - h / 2 + r * 0.04, w - r * 0.08, h - r * 0.08, h * 0.35); g.fillStyle = alpha('#9fe8ff', 0.8); g.fill();
    g.fillStyle = alpha('#ffffff', 0.7); g.beginPath(); g.ellipse(-w * 0.25, my - h * 0.12, w * 0.1, h * 0.12, -0.3, 0, 7); g.fill(); }
  g.restore();
}

// ---------- a figure moving up / floating with no take-off ----------
export function riseJ(t, v = 0, o = {}) {
  const k = clamp(v), base = o.pose || (k > 0.2 ? JPOSE.rise : JPOSE.apex), p = breathe(base, t * 0.7, 0.8, o.seed ?? 3);
  return { pose: p, lift: 0, sx: 1 - 0.04 * k, sy: 1 + 0.08 * k, phase: o.phase || (k > 0.05 ? 'rise' : 'apex'), k: 0.5, v: k, dir: o.dir ?? 1, flutter: o.flutter ?? (0.4 + 0.6 * k), times: { tL: 1e9 }, landed: false };
}

// ---------- devices, placed the same way in every shot ----------
export function dayHUD(g, t, keys, o = {}) { dayCounter(g, t, { x: o.x ?? 300, y: o.y ?? 190, s: o.s ?? 0.62, keys }); }
export function meterHUD(g, t, m, o = {}) { heightMeter(g, t, { value: m, span: 2.4, y0: E.H * 0.24, y1: E.H * 0.82, ...o }); }

// ---------- props ----------
export function weatherBalloon(g, x, y, s, t) {
  g.save(); g.translate(x, y + Math.sin(t * 0.9) * 6 * s); g.scale(s, s); g.rotate(Math.sin(t * 0.7) * 0.04);
  glow(g, -20, -30, 120, '#ffffff', 0.2);
  g.fillStyle = linGrad(g, -70, 0, 70, 0, ['#ffffff', '#e8eef8', '#b8c4d8']); g.beginPath(); g.ellipse(0, 0, 70, 82, 0, 0, 7); g.fill();
  poly(g, [[-8, 78], [8, 78], [0, 92]], '#c8d0e0'); seg(g, [[0, 92], [3, 200]], 1.6, '#c8d0e0');
  rr(g, -12, 200, 24, 18, 3); g.fillStyle = '#f08a24'; g.fill(); g.fillStyle = '#fff'; g.fillRect(-8, 205, 16, 3);
  g.fillStyle = alpha('#ffffff', 0.6); g.beginPath(); g.ellipse(-26, -34, 16, 26, -0.5, 0, 7); g.fill();
  g.restore();
}
export function plasma(g, x, y, s, t, k, dir = [0, 1]) {
  if (k <= 0.01) return; const r = rng(7), [dx, dy] = dir, ang = Math.atan2(dy, dx);
  g.save(); g.globalCompositeOperation = 'lighter';
  // streaming tail opposite to the motion
  g.translate(x, y); g.rotate(ang);
  for (let i = 0; i < 26; i++) { const u = i / 26, L = (220 + 900 * k) * s * 0.55, px = -u * L - ((t * 900 + i * 37) % 80), w = (60 + 50 * (1 - u)) * s * 0.5 * (0.5 + k * 0.5);
    g.fillStyle = alpha(u < 0.2 ? '#fff4d0' : u < 0.5 ? '#ffb040' : '#ff5a2a', 0.22 * k * (1 - u)); g.beginPath(); g.ellipse(px, Math.sin(t * 20 + i) * 6, w * 1.4, w * (1 - u * 0.6), 0, 0, 7); g.fill(); }
  // bow shock: a bright cap ahead of the body
  g.fillStyle = radGrad(g, 70 * s * 0.5, 0, 0, 160 * s * 0.55, [alpha('#ffffff', 0.85 * k), alpha('#ffc060', 0.5 * k), alpha('#ff4a20', 0)]); g.beginPath(); g.ellipse(40 * s * 0.5, 0, 170 * s * 0.55, 150 * s * 0.55, 0, 0, 7); g.fill();
  g.strokeStyle = alpha('#fff0c0', 0.8 * k); g.lineWidth = 6; g.beginPath(); g.arc(-40 * s * 0.5, 0, 150 * s * 0.55, -1.0, 1.0); g.stroke();
  for (let i = 0; i < 14; i++) { const u = (t * 1.6 + r()) % 1, px = -u * 700 * s * 0.5, py = (r() - 0.5) * 200 * s * 0.5 * (1 + u); circle(g, px, py, (2 + r() * 4) * (1 - u), alpha('#ffd080', k * (1 - u))); }
  g.restore();
}
export function bulletIcon(g, x, y, s = 1) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = linGrad(g, 0, -14, 0, 14, ['#f2c86a', '#b8862a', '#e8b850']); g.beginPath(); g.moveTo(-50, -14); g.lineTo(10, -14); g.quadraticCurveTo(50, -12, 62, 0); g.quadraticCurveTo(50, 12, 10, 14); g.lineTo(-50, 14); g.closePath(); g.fill();
  g.fillStyle = '#8a5a1a'; g.fillRect(-50, -14, 8, 28); g.fillStyle = alpha('#fff', 0.5); g.fillRect(-40, -10, 44, 4);
  for (let i = 0; i < 3; i++) seg(g, [[-70 - i * 26, -8 + i * 8], [-110 - i * 26, -8 + i * 8]], 3, alpha('#fff1dc', 0.7 - i * 0.2));
  g.restore();
}

// ---------- the notebook page ----------
export const NOTE_ROWS = [['DAY 1', '0.5 m'], ['DAY 2', '1 m'], ['DAY 3', '2 m'], ['DAY 4', '4 m'], ['...', ''], ['DAY 19', '131 km'], ['DAY 21', '524 km'], ['DAY 25', '8,000 km ?']];
export function notebook(g, t, o = {}) {
  const ui = S().ui, x = o.x ?? E.W * 0.5, y = o.y ?? E.H * 0.5, W = o.w ?? 1240, H = o.h ?? 900, reveal = o.reveal ?? 1, lamp = o.lamp ?? 1, x0 = x - W / 2, y0 = y - H / 2;
  // desk + page + spine shadow
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#2a1c18', '#1a100e']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  for (let i = 0; i < 9; i++) seg(g, [[-E.W, i * 140 + 30], [E.W * 2, i * 140 + 60]], 2, alpha('#3a2620', 0.6));
  rr(g, x0 + 16, y0 + 20, W, H, 10); g.fillStyle = 'rgba(0,0,0,.45)'; g.fill();
  rr(g, x0, y0, W, H, 10); g.fillStyle = linGrad(g, x0, 0, x0 + W, 0, ['#d8ccb4', '#f4ead4', '#efe4cc']); g.fill();
  g.fillStyle = linGrad(g, x0, 0, x0 + 70, 0, ['rgba(0,0,0,.25)', 'rgba(0,0,0,0)']); g.fillRect(x0, y0, 70, H);
  for (let i = 0; i < 14; i++) { const ly = y0 + 120 + i * 56; seg(g, [[x0 + 30, ly], [x0 + W - 30, ly]], 2, alpha('#8aa8d8', 0.45)); } seg(g, [[x0 + 170, y0 + 20], [x0 + 170, y0 + H - 20]], 2.5, alpha('#e07a7a', 0.6));
  for (let i = 0; i < 9; i++) circle(g, x0 + 34, y0 + 90 + i * 92, 12, '#1a100e');
  // handwriting: row i reveals over [i/n, (i+1)/n] of `reveal` (clip wipe), pencil grey; numbers ink
  const n = NOTE_ROWS.length, pen = '#4a4650', rows = [];
  NOTE_ROWS.forEach(([a, b], i) => { const k = clamp(reveal * n - i), ly = y0 + 110 + i * 92; rows.push(ly); if (k <= 0) return; const wob = Math.sin(i * 2.3) * 4;
    g.save(); g.beginPath(); g.rect(x0 + 180, ly - 50, (W - 220) * k, 90); g.clip(); g.translate(0, wob); g.rotate(-0.008 * (i % 3));
    text(g, a, x0 + 210, ly, { size: 54, color: pen, font: FONTS.title, weight: 600, align: 'left' });
    if (b) text(g, b, x0 + 560, ly, { size: 54, color: i === n - 1 ? shade(ui.gold, -0.35) : '#2a2630', font: FONTS.title, weight: 700, align: 'left' });
    if (i > 0 && i < 4) text(g, '×2', x0 + 880, ly - 40, { size: 34, color: alpha('#7a7680', 0.9), font: FONTS.title, weight: 600, align: 'left' });
    g.restore(); });
  // gold arrow down the page toward the last row
  const ak = clamp((reveal - 0.9) * 10); if (ak > 0) { const ax = x0 + W - 150, a0 = rows[0] + 10, a1 = lerp(a0, rows[n - 1] - 30, ease.out(ak)); seg(g, [[ax, a0], [ax + Math.sin(a1 * 0.01) * 6, a1]], 7, ui.gold); poly(g, [[ax - 20, a1 - 8], [ax + 20, a1 - 8], [ax, a1 + 24]], ui.gold); }
  // the circle around DAY 25 and 'escape?' (s088)
  const ck = clamp(o.circle ?? 0); if (ck > 0) { const cy = rows[n - 1]; g.save(); g.strokeStyle = ui.gold; g.lineWidth = 8; g.lineCap = 'round'; g.shadowColor = alpha(ui.gold, 0.7); g.shadowBlur = 16; g.beginPath();
    for (let j = 0; j <= 60 * ck; j++) { const a = -2.6 + (j / 60) * Math.PI * 2.15, rx = 190 + Math.sin(j * 0.4) * 4, ry = 58; const px = x0 + 330 + Math.cos(a) * rx, py = cy + Math.sin(a) * ry + j * 0.15; j ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke(); g.restore(); }
  const ek = clamp(o.escape ?? 0); if (ek > 0) { g.save(); g.beginPath(); g.rect(x0 + 200, rows[n - 1] + 50, 480 * ek, 110); g.clip(); text(g, 'escape?', x0 + 240, rows[n - 1] + 108, { size: 62, color: ui.gold, font: FONTS.serif, weight: 900, italic: true, align: 'left', glow: 10, glowColor: alpha(ui.gold, 0.5) }); g.restore(); }
  // the lamp: warm pool from the upper right + falloff
  g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = radGrad(g, x0 + W * 0.75, y0 - 80, 80, W * 1.1, ['rgba(255,255,255,1)', `rgba(${Math.round(150 + 60 * lamp)},${Math.round(110 + 40 * lamp)},${Math.round(80 + 20 * lamp)},1)`, 'rgba(40,24,20,1)']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); g.restore();
  glow(g, x0 + W * 0.78, y0 - 40, 600, '#ffcf8a', 0.22 * lamp);
  return { rows, x0, y0 };
}

// jumper() + gear in one call (gear follows the same squash/stretch as the body)
import { jumper } from '../sets/jump.js';
export function flyer(g, who, J, o = {}, gear = null) {
  const x = o.x, y = (o.gy ?? 0) - (J.lift || 0), fo = { x, y, s: o.s ?? 1.9, facing: o.facing ?? 1 };
  const sq = (fn) => { g.save(); g.translate(x, y); g.scale(J.sx, J.sy); g.translate(-x, -y); fn(); g.restore(); };
  if (gear) sq(() => gearBack(g, fo, J.pose, gear));
  const r = jumper(g, who, J, o);
  if (gear) sq(() => gearFront(g, fo, J.pose, gear));
  return r;
}
