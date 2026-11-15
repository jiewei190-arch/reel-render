// A_lib.js — shared helpers for ep 5 batch A (s001-s026). Registers no shots.
//   sw(word, st, fb)                 seconds into the shot when `word` is spoken (fallback fb)
//   hero(g, o)                       actor('HERO') + the LOCAL cyan #3FE0FF zip pull and cuff stripes on the navy jacket (STYLE.md 6)
//   handAt(o, pose, side)            world position of a hand ('F' front / 'B' back) for an actor drawn with o = { x, y, s, facing }
//   bowl(g, x, y, s)                 the cereal bowl (from DEMO_statcard), spoon(g, x, y, ang, s, bend), mug(g, x, y, t), juice(g, x, y, s, pour)
//   bags(g, x, y, s, t)              every shopping bag hooked on one hand (hand at x, y), eggBox(g, x, y, s)
//   remote(g, x, y, s, rot), sofa(g, x, y, s, rot) (the apartment sofa, lifted), ceilingLamp(g, x, y, t)
//   titleText(g, t, at, lines, y)    outlined cream title lock-up with gold accent words
// LEGAL: STYLE.md DON'T list (no series names, no System/Player/Quest words, no portals, eyes never glow, no copied HUD frame).
import { E, ease, prog, clamp, lerp, rr, seg, circle, poly, alpha, shade, glow, text, linGrad } from '/engine/core.js';
import { actor } from '../sets/actors.js';
import { POSES } from '/engine/rig2d.js';
import { PAL } from '../sets/statcard.js';

export const sw = (w, st, fb) => { const m = w.toLowerCase(); const hit = E.words.find(x => x.start >= st - 0.05 && x.word.toLowerCase().replace(/[^\w']/g, '').startsWith(m)); return (hit ? hit.start : st + fb) - st; };
export const CYAN = PAL.cyan;

export function handAt(o, pose, side = 'F') { const p = pose['h' + side], s = o.s ?? 1, f = o.facing ?? 1; return [o.x + p[0] * s * f, o.y + p[1] * s]; }
const at = (o, p) => [o.x + p[0] * (o.s ?? 1) * (o.facing ?? 1), o.y + p[1] * (o.s ?? 1)];
// the hero: classic rig + the cyan trim (zip line + pull on the chest, a stripe on each cuff)
export function hero(g, o) {
  const pose = o.pose || POSES.stand; actor(g, 'HERO', o);
  const s = o.s ?? 1, sh = at(o, pose.sh), hip = at(o, pose.hip), k = (o.glow ?? 0);
  const z0 = [lerp(sh[0], hip[0], 0.08) + 6 * s * (o.facing ?? 1), lerp(sh[1], hip[1], 0.08)], z1 = [lerp(sh[0], hip[0], 0.86) + 6 * s * (o.facing ?? 1), lerp(sh[1], hip[1], 0.86)];
  g.save(); if (o.alpha != null) g.globalAlpha *= o.alpha;
  seg(g, [z0, z1], 1.6 * s, alpha(CYAN, 0.75));
  const zp = [lerp(z0[0], z1[0], 0.22), lerp(z0[1], z1[1], 0.22)]; rr(g, zp[0] - 2.4 * s, zp[1], 4.8 * s, 9 * s, 2 * s); g.fillStyle = CYAN; g.fill();
  for (const sd of ['F', 'B']) { const e = at(o, pose['e' + sd]), h = at(o, pose['h' + sd]), c = [lerp(e[0], h[0], 0.74), lerp(e[1], h[1], 0.74)], dx = h[0] - e[0], dy = h[1] - e[1], d = Math.hypot(dx, dy) || 1, n = [-dy / d * 5.5 * s, dx / d * 5.5 * s];
    seg(g, [[c[0] - n[0], c[1] - n[1]], [c[0] + n[0], c[1] + n[1]]], 2.2 * s, CYAN); }
  if (k > 0) glow(g, zp[0], zp[1], 30 * s, CYAN, 0.5 * k);
  g.restore();
}
export function bowl(g, x, y, s = 1) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(0, 4, 120, 14, 0, 0, 7); g.fill();
  g.fillStyle = '#f2efe6'; g.beginPath(); g.moveTo(-120, -70); g.quadraticCurveTo(-110, 0, 0, 0); g.quadraticCurveTo(110, 0, 120, -70); g.closePath(); g.fill();
  g.fillStyle = '#fbf6ea'; g.beginPath(); g.ellipse(0, -70, 120, 22, 0, 0, 7); g.fill();
  for (let i = 0; i < 16; i++) circle(g, -90 + (i * 47) % 180, -72 + (i % 3) * 5, 9, i % 2 ? '#e2a64a' : '#c98a32');
  g.fillStyle = '#4a86c8'; rr(g, -100, -46, 200, 10, 5); g.fill(); g.restore();
}
export function spoon(g, x, y, ang = -0.5, s = 1, bend = 0) {
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s);
  g.strokeStyle = '#c8ccd4'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(40, -bend * 30, 80, -bend * 50); g.stroke();
  g.fillStyle = '#dfe3ea'; g.beginPath(); g.ellipse(80 + 16, -bend * 50, 18, 11, -bend * 0.6, 0, 7); g.fill(); g.restore();
}
export function mug(g, x, y, t) {
  rr(g, x - 26, y - 56, 52, 56, 8); g.fillStyle = '#d8624a'; g.fill(); g.strokeStyle = '#d8624a'; g.lineWidth = 7; g.beginPath(); g.arc(x + 30, y - 30, 14, -1.2, 1.2); g.stroke();
  for (let i = 0; i < 3; i++) { const ph = (t * 0.5 + i / 3) % 1; g.strokeStyle = alpha('#ffffff', 0.35 * Math.sin(ph * Math.PI)); g.lineWidth = 5; g.beginPath(); g.moveTo(x - 8 + i * 8, y - 60 - ph * 70); g.quadraticCurveTo(x + 6 + i * 8 + Math.sin(t * 2 + i) * 8, y - 80 - ph * 70, x - 4 + i * 8, y - 100 - ph * 70); g.stroke(); }
}
export function juice(g, x, y, s = 1, pour = 0) {
  g.save(); g.translate(x, y); g.scale(s, s); g.rotate(-pour * 1.1);
  rr(g, -20, -70, 40, 70, 6); g.fillStyle = alpha('#e8f4ff', 0.5); g.fill(); g.fillStyle = '#f2a23a'; g.fillRect(-17, -44 + pour * 10, 34, 41 - pour * 10); g.strokeStyle = alpha('#ffffff', 0.7); g.lineWidth = 3; rr(g, -20, -70, 40, 70, 6); g.stroke(); g.restore();
}
// every shopping bag hooked on ONE hand (hand at x, y): 8 bulging carrier bags, a baguette, a melon, a watermelon
export function bags(g, x, y, s = 1, t = 0) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const cols = ['#e8e4da', '#7ab0d8', '#e8c050', '#9ad07a', '#e8e4da', '#d88aa0', '#e8e4da', '#8ab0c8'];
  for (let i = 0; i < 8; i++) { const a = -0.7 + i * 0.2 + Math.sin(t * 3 + i) * 0.03, L = 70 + (i % 3) * 18, bx = Math.sin(a) * L, by = Math.cos(a) * L;
    seg(g, [[0, 0], [bx - 10, by - 12]], 3, '#bbb'); seg(g, [[0, 0], [bx + 10, by - 12]], 3, '#bbb');
    g.fillStyle = cols[i]; g.beginPath(); g.moveTo(bx - 26, by - 12); g.quadraticCurveTo(bx - 36, by + 60, bx, by + 66); g.quadraticCurveTo(bx + 36, by + 60, bx + 26, by - 12); g.closePath(); g.fill(); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 2; g.stroke();
    if (i === 2) { g.save(); g.translate(bx + 6, by - 14); g.rotate(0.4); rr(g, -8, -60, 16, 70, 8); g.fillStyle = '#d8a050'; g.fill(); g.restore(); }      // baguette
    if (i === 4) circle(g, bx, by - 10, 18, '#e8d870');                                                                                           // melon
    if (i === 6) { g.fillStyle = '#3f8a3a'; g.beginPath(); g.ellipse(bx, by - 6, 30, 22, 0, 0, 7); g.fill(); for (let k = -2; k <= 2; k++) seg(g, [[bx + k * 10, by - 26], [bx + k * 10, by + 14]], 3, '#2a6a2a'); }   // watermelon
  }
  g.restore();
}
export function eggBox(g, x, y, s = 1) { g.save(); g.translate(x, y); g.scale(s, s); rr(g, -40, -16, 80, 30, 6); g.fillStyle = '#d8c8a8'; g.fill(); for (let i = 0; i < 3; i++) circle(g, -24 + i * 24, -18, 10, '#f4ead8'); g.restore(); }
export function remote(g, x, y, s = 1, rot = 0) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); rr(g, -34, -9, 68, 18, 7); g.fillStyle = '#22242c'; g.fill(); for (let i = 0; i < 4; i++) circle(g, -18 + i * 12, 0, 3, i ? '#5a5f6c' : '#d84a4a'); g.restore(); }
export function sofa(g, x, y, s = 1, rot = 0, col = '#5a4a78') {
  const sc = shade(col, -0.35); g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  rr(g, -230, -190, 460, 170, 22); g.fillStyle = sc; g.fill(); rr(g, -260, -120, 60, 110, 18); g.fill(); rr(g, 200, -120, 60, 110, 18); g.fill();
  for (const cx of [-110, 110]) { rr(g, cx - 98, -118, 196, 82, 16); g.fillStyle = shade(sc, 0.12); g.fill(); }
  rr(g, -170, -175, 70, 60, 14); g.fillStyle = shade('#c8803a', -0.3); g.fill();
  seg(g, [[-215, -22], [-215, 0]], 8, '#0a0810'); seg(g, [[215, -22], [215, 0]], 8, '#0a0810');
  g.restore();
}
export function ceilingLamp(g, x, y, t) { seg(g, [[x, y - 400], [x, y - 40]], 4, '#2a2630'); g.fillStyle = '#e8d8b0'; g.beginPath(); g.moveTo(x - 70, y); g.lineTo(x - 36, y - 46); g.lineTo(x + 36, y - 46); g.lineTo(x + 70, y); g.closePath(); g.fill(); glow(g, x, y + 10, 300, '#ffd8a0', 0.4); }
export function titleText(g, t, at, lines, y) {
  const k = ease.outBack(prog(t, at, at + 0.5)), a = clamp((t - at) / 0.25); if (a <= 0) return;
  g.save(); g.globalAlpha *= a; g.translate(E.W / 2, y); const sc = 0.85 + 0.15 * k + 0.01 * (t - at); g.scale(sc, sc);
  glow(g, 0, 0, 900, '#ffc070', 0.14);
  lines.forEach((ln, i) => { const sz = i === lines.length - 1 ? 104 : 78, yy = (i - (lines.length - 1) / 2) * 112, col = /LEVEL UP/.test(ln) ? PAL.gold : '#fbf3dc';
    text(g, ln, 0, yy, { size: sz, color: col, spacing: 4, stroke: 14, strokeColor: '#0b0f1a' }); text(g, ln, 0, yy, { size: sz, color: col, spacing: 4, glow: 24, glowColor: alpha(PAL.gold, 0.7) }); });
  g.restore();
}
