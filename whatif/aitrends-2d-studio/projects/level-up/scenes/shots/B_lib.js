// B_lib.js — shared helpers for ep 5 batch B (s027-s051). Registers no shots. Classic What If style.
// LEGAL (STYLE.md DON'T list): only our rounded Stat Card; no "System/Player/Quest" words, no brackets; hero eyes never glow.
//   W(o, p)                              world point of a pose point for actor opts o
//   heroTrim(g, o, pose)                 the LOCAL cyan zip pull + cuff stripes on the hero's navy jacket
//   hero(g, o)                           actor('HERO') + heroTrim
//   bowl(g, x, y, s, o)                  cereal bowl (+ spoon unless o.spoon === false)
//   kitchenPop(g, t, P, o)               morningPop with a formatter (1,613) and STR landing time control; returns { shake, card }
//   goldTag(g, t, t0, str, x, y, o)      a gold pill tag that pops
//   creamCard(g, x, y, w, h, o)          a small cream inset card
//   barbell(g, x, y, s, k)               a cream line-art barbell with stacked plates (k = draw-on)
//   car(g, x, y, len, o)                 a small teal-grey family hatchback, ground at y; o.lift tilts the back up; o.dash = blueprint outline only
//   football(g, x, y, r)                 a white football with black patches
//   CREAM, GOLD, CORAL, CYAN
import { E, S, clamp, lerp, ease, prog, seg, circle, rr, poly, alpha, shade, glow, text, FONTS } from '/engine/core.js';
import { actor } from '../sets/actors.js';
import { zip, zipOpen, statCard, xpFill, levelSpin, levelUp, levelShake } from '../sets/statcard.js';
import { draw } from '../sets/bp.js';

export const CREAM = '#f3ead2', GOLD = '#FFC93C', CORAL = '#FF6B5B', CYAN = '#3FE0FF';
export const W = (o, p) => { const s = o.s ?? 1.9, f = o.facing ?? 1; return [o.x + p[0] * f * s, o.y + p[1] * s]; };
export const fmtK = q => Math.round(q).toLocaleString('en-US');

export function heroTrim(g, o, pose) {
  const s = o.s ?? 1.9, [sx, sy] = W(o, pose.sh), [hx, hy] = W(o, pose.hip);
  const zx = lerp(sx, hx, 0.3), zy = lerp(sy, hy, 0.3);
  g.save(); g.fillStyle = CYAN; g.shadowColor = CYAN; g.shadowBlur = 6; rr(g, zx - 2.2 * s, zy, 4.4 * s, 9 * s, 2 * s); g.fill(); g.restore();
  for (const [e, h] of [['eF', 'hF'], ['eB', 'hB']]) { const [ex, ey] = W(o, pose[e]), [wx, wy] = W(o, pose[h]); const cx = lerp(ex, wx, 0.82), cy = lerp(ey, wy, 0.82), a = Math.atan2(wy - ey, wx - ex) + Math.PI / 2;
    seg(g, [[cx - Math.cos(a) * 4 * s, cy - Math.sin(a) * 4 * s], [cx + Math.cos(a) * 4 * s, cy + Math.sin(a) * 4 * s]], 1.6 * s, CYAN); }
}
export function hero(g, o) { actor(g, 'HERO', o); if (o.pose) heroTrim(g, o, o.pose); }

export function bowl(g, x, y, s = 1, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(0, 4, 120, 14, 0, 0, 7); g.fill();
  g.fillStyle = '#f2efe6'; g.beginPath(); g.moveTo(-120, -70); g.quadraticCurveTo(-110, 0, 0, 0); g.quadraticCurveTo(110, 0, 120, -70); g.closePath(); g.fill();
  g.fillStyle = '#fbf6ea'; g.beginPath(); g.ellipse(0, -70, 120, 22, 0, 0, 7); g.fill();
  for (let i = 0; i < 16; i++) circle(g, -90 + (i * 47) % 180, -72 + (i % 3) * 5, 9, i % 2 ? '#e2a64a' : '#c98a32');
  g.fillStyle = '#4a86c8'; rr(g, -100, -46, 200, 10, 5); g.fill();
  if (o.spoon !== false) { const d = o.spoonDrop ?? 0; g.save(); g.translate(60, -80 + d * 30); g.rotate(-0.7 + d * 0.5); rr(g, -6, -110, 12, 110, 6); g.fillStyle = '#c8ccd4'; g.fill(); g.beginPath(); g.ellipse(0, -118, 16, 24, 0, 0, 7); g.fill(); g.restore(); }
  g.restore();
}

// the morning pop (STYLE §5), as morningPop but with a number formatter and an STR landing time; returns the camera shake
export function kitchenPop(g, t, P, o = {}) {
  const at = o.at ?? 0.05, tCard = at + 0.3, tSnap = at + 0.85, tSpin = at + 0.95, tPop = at + 1.15, s = o.s ?? 1;
  const zx = P.tableX, zy = P.tableTop - 140, cx = P.tableX + 330, cy = P.tableTop - 310;
  const zo = zipOpen(t, at, { dur: 0.32 }), Z = zip(g, t, zx, zy, { w: 280 * s, open: zo, seam: clamp(zo * 4) });
  const uf = ease.out(prog(t, tCard, tCard + 0.55)), X = xpFill(t, { from: 0.55, to: 1, at0: tCard + 0.3, at1: tSnap, snap: tSnap + 0.05 }), sp = levelSpin(t, tSpin, 0.45);
  const strLand = o.strLand ?? tSpin + 0.9, str = lerp(o.str[0], o.str[1], ease.out(prog(t, tSpin, strLand)));
  const card = statCard(g, t, { x: cx, y: cy, s: 0.9 * s, from: Z.mouth, unfold: uf, lv: sp >= 0.5 ? o.lv[1] : o.lv[0], lvPrev: o.lv[0], spin: sp > 0 && sp < 1 ? sp : 0, str, fmt: fmtK, xp: X.xp, xpSnap: X.xpSnap });
  levelUp(g, t, tPop, { x: P.tableX - 400, y: P.tableTop - 380, s: (o.popS ?? 0.75) * s });
  return { shake: levelShake(t, tPop, o.shake ?? 3), card, tPop };
}

export function goldTag(g, t, t0, str, x, y, o = {}) {
  const k = ease.outBack(prog(t, t0, t0 + 0.35)); if (k <= 0.01) return; const sz = o.size ?? 44, col = o.color ?? GOLD;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? 0); g.scale(k, k); g.font = `900 ${sz}px "${FONTS.ui}"`; const w = g.measureText(str).width + 50; rr(g, -w / 2, -sz * 0.7, w, sz * 1.4, sz * 0.7); g.fillStyle = 'rgba(14,10,20,.88)'; g.fill(); g.strokeStyle = alpha(col, 0.9); g.lineWidth = 4; g.stroke();
  text(g, str, 0, 2, { size: sz, color: col, font: FONTS.ui, weight: 900, glow: 10, glowColor: alpha(col, 0.5) }); g.restore();
}
export function creamCard(g, x, y, w, h, o = {}) { g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.03); g.fillStyle = 'rgba(0,0,0,.25)'; rr(g, -w / 2 + 8, -h / 2 + 10, w, h, 14); g.fill(); rr(g, -w / 2, -h / 2, w, h, 14); g.fillStyle = CREAM; g.fill(); g.strokeStyle = '#3a3020'; g.lineWidth = 4; g.stroke(); g.restore(); }

export function barbell(g, x, y, s = 1, k = 1, col = CREAM) {
  g.save(); g.translate(x, y); g.scale(s, s);
  draw(g, [[-420, 0], [420, 0]], k * 1.6, { w: 10, color: col });
  const kk = clamp(k * 1.6 - 0.6);
  for (const sd of [-1, 1]) for (let i = 0; i < 4; i++) { const px = sd * (250 + i * 34), h = 230 - i * 20; draw(g, [[px - 14, -h / 2], [px + 14, -h / 2], [px + 14, h / 2], [px - 14, h / 2]], clamp(kk * 4 - i), { w: 5, color: col, close: true }); }
  for (const sd of [-1, 1]) draw(g, [[sd * 200, -24], [sd * 200, 24]], kk, { w: 8, color: col });
  g.restore();
}

export function car(g, x, y, len, o = {}) {
  const s = len / 1000, body = o.color ?? '#6f8c94';
  g.save(); g.translate(x, y); if (o.rot) g.rotate(o.rot); g.scale(s * (o.facing ?? 1), s);
  if (o.dash) { g.setLineDash([22, 16]); g.strokeStyle = o.dash; g.lineWidth = 6 / s * 0.6; }
  const shell = () => { g.beginPath(); g.moveTo(-500, -90); g.quadraticCurveTo(-505, -190, -440, -210); g.lineTo(-300, -220); g.quadraticCurveTo(-200, -360, -60, -370); g.lineTo(220, -370); g.quadraticCurveTo(330, -365, 400, -240); g.lineTo(470, -220); g.quadraticCurveTo(510, -200, 505, -90); g.closePath(); };
  if (o.dash) { shell(); g.stroke(); for (const wx of [-300, 300]) { g.beginPath(); g.arc(wx, -70, 80, 0, 7); g.stroke(); } g.restore(); return; }
  if (!o.noShadow) { g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(0, 4, 520, 26, 0, 0, 7); g.fill(); }
  shell(); g.fillStyle = body; g.fill(); g.strokeStyle = '#1e2a30'; g.lineWidth = 8; g.stroke();
  g.fillStyle = shade(body, 0.18); rr(g, -480, -200, 960, 30, 12); g.fill();                                           // shoulder light line
  g.fillStyle = '#bcd6e2'; g.beginPath(); g.moveTo(-260, -225); g.quadraticCurveTo(-180, -340, -70, -345); g.lineTo(60, -345); g.lineTo(60, -225); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(90, -225); g.lineTo(90, -345); g.lineTo(210, -345); g.quadraticCurveTo(310, -340, 360, -240); g.lineTo(360, -225); g.closePath(); g.fill();
  g.strokeStyle = '#1e2a30'; g.lineWidth = 6; seg(g, [[75, -350], [75, -100]], 6, '#1e2a30'); seg(g, [[-260, -225], [-260, -100]], 4, alpha('#1e2a30', 0.5));
  g.fillStyle = '#d7dde2'; rr(g, -515, -120, 70, 34, 10); g.fill(); rr(g, 445, -120, 70, 34, 10); g.fill();                // chrome bumpers
  g.fillStyle = '#ffe7a0'; rr(g, 470, -190, 30, 26, 8); g.fill(); g.fillStyle = '#e0503a'; rr(g, -500, -190, 26, 30, 8); g.fill();
  rr(g, -20, -205, 50, 10, 5); g.fillStyle = '#2a363c'; g.fill();
  for (const wx of [-300, 300]) { circle(g, wx, -70, 84, '#15191c'); circle(g, wx, -70, 46, '#8a9298'); circle(g, wx, -70, 14, '#3a4246'); }
  g.restore();
}
export function football(g, x, y, r) {
  circle(g, x, y, r, '#f6f6f2'); g.strokeStyle = '#1e1e22'; g.lineWidth = Math.max(2, r * 0.08); g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke();
  const pent = (cx, cy, rr2) => { const pts = []; for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / 5; pts.push([cx + Math.cos(a) * rr2, cy + Math.sin(a) * rr2]); } poly(g, pts, '#1e1e22'); };
  pent(x, y, r * 0.32); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * 2 * Math.PI / 5; pent(x + Math.cos(a) * r * 0.78, y + Math.sin(a) * r * 0.78, r * 0.2); }
}
