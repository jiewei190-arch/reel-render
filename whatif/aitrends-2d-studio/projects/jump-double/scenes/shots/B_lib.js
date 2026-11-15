// B_lib.js — shared helpers for batch B (s021-s044). Registers no shots.
//   wt(info, word, fb, after, exact)  word start in shot time (searches inside the shot only; fb = fallback seconds)
//   dayHud / meterHud                  the DAY counter + height meter in the batch's standard spots
//   local props: block5 (5-storey apartment block), ladder, vaultPole, markerPost (6.31 m), trampoline/poolBack/pool/haystack,
//               hoodieCloth (the ripped-off mustard hoodie), socks, painStars, notes (whistle)
import { E, V, S, clamp, lerp, ease, prog, rr, seg, circle, poly, glow, alpha, shade, mix, linGrad, rng, text, FONTS } from '/engine/core.js';
import { dayCounter, heightMeter } from '../sets/devices.js';
import { HERO } from '../cast.js';

export const U = 260;                                                   // 1 m in world units (H2 sets, figure s 1.9 = 1.75 m)
const norm = (w) => w.toLowerCase().replace(/[^\w']/g, '');
export const wt = (info, m, fb, after = 0, exact = false) => {
  const st = info.shot.start, k = norm(m);
  const hit = E.words.find(x => x.start >= st + after - 0.05 && x.start < st + info.dur && (exact ? norm(x.word) === k : norm(x.word).startsWith(k)));
  return hit ? hit.start - st : fb;
};
export const toScreen = (x, y, cam) => [(x - E.W / 2 - (cam.x || 0)) * (cam.z ?? 1) + E.W / 2, (y - E.H / 2 - (cam.y || 0)) * (cam.z ?? 1) + E.H / 2];
export const handWorld = (o, pose, hand = 'hF') => { const s = (o.s ?? 1) * (o.kid ? 0.72 : 1), f = o.facing ?? 1; return [o.x + pose[hand][0] * f * s, o.y + pose[hand][1] * s]; };
export const HERO_TEE = { ...HERO, top: 'tshirt', color: '#efe8dc' };

// the DAY counter top-left, flips from `from` to `to` at tFlip; fades out before the cut
export function dayHud(g, t, info, from, to, tFlip, o = {}) {
  const a = clamp((info.dur - t) / 0.3) * ease.out(prog(t, -0.2, 0.05));
  g.save(); g.globalAlpha *= a; dayCounter(g, t, { x: o.x ?? E.W * 0.15, y: o.y ?? E.H * 0.12, s: o.s ?? 0.5, keys: [[-1, from], [tFlip, to]] }); g.restore();
}
// the height meter: value (m) climbs from v0 to v1 over [t0, t0 + 0.45] unless `value` is given
export function meterHud(g, t, info, o = {}) {
  const v = o.value ?? lerp(o.v0, o.v1, ease.out(prog(t, o.t0, o.t0 + 0.45))), a = clamp((info.dur - t) / 0.3) * (o.alpha ?? 1);
  return heightMeter(g, t, { value: Math.max(0.1, v), danger: o.danger, marks: o.marks, alpha: a, span: o.span });
}

// ---------- 5-storey apartment block (local prop; 3.2 m storeys) ----------
export const STOREY = 3.2 * U;
export function block5(g, t, x, gy, o = {}) {
  const w = o.w ?? 1180, n = 5, h = n * STOREY, top = gy - h, r = rng(o.seed ?? 51), wall = o.wall ?? '#b88a6a', lit = o.lit ?? 0.45, P = o.light ?? '#ffd08a';
  g.fillStyle = linGrad(g, 0, top, 0, gy, [shade(wall, -0.18), shade(wall, -0.45)]); g.fillRect(x - w / 2, top, w, h);
  g.fillStyle = shade(wall, -0.6); g.fillRect(x - w / 2 - 20, top - 40, w + 40, 44);                                              // parapet
  for (const dx of [-w * 0.3, w * 0.25]) { g.fillStyle = shade(wall, -0.55); g.fillRect(x + dx, top - 150, 90, 110); seg(g, [[x + dx + 120, top - 40], [x + dx + 120, top - 260], [x + dx + 160, top - 300]], 5, '#3a3440'); }   // roof boxes + aerial
  for (let s = 0; s < n; s++) {
    const fy = gy - (s + 1) * STOREY;
    seg(g, [[x - w / 2, fy + STOREY], [x + w / 2, fy + STOREY]], 10, shade(wall, -0.62));                                         // floor band
    for (let i = 0; i < 4; i++) {
      const wx = x - w / 2 + 70 + i * (w - 140) / 4, ww = (w - 140) / 4 - 70, wy = fy + 150, wh = 330, on = r() < lit;
      rr(g, wx, wy, ww, wh, 6); g.fillStyle = on ? mix(P, '#fff6dc', 0.25) : shade(wall, -0.72); g.fill(); if (on) glow(g, wx + ww / 2, wy + wh / 2, ww * 0.9, P, 0.22);
      seg(g, [[wx + ww / 2, wy], [wx + ww / 2, wy + wh]], 5, shade(wall, -0.75)); seg(g, [[wx, wy + wh * 0.4], [wx + ww, wy + wh * 0.4]], 5, shade(wall, -0.75));
      if (on) { const cc = ['#c8503a', '#3a7aa0', '#d8a830'][Math.floor(r() * 3)]; g.fillStyle = alpha(shade(cc, -0.2), 0.55); g.fillRect(wx, wy, ww * 0.2, wh); g.fillRect(wx + ww * 0.8, wy, ww * 0.2, wh); }
      if (s > 0 && i % 2 === 1) {                                                                                                     // balcony: slab + railing + a plant / bike / laundry
        const by = wy + wh + 10; g.fillStyle = shade(wall, -0.55); g.fillRect(wx - 50, by, ww + 100, 18);
        seg(g, [[wx - 50, by - 90], [wx + ww + 50, by - 90]], 5, '#2a2630'); for (let k = 0; k <= 8; k++) seg(g, [[wx - 50 + k * (ww + 100) / 8, by - 90], [wx - 50 + k * (ww + 100) / 8, by]], 3, '#2a2630');
        const kind = Math.floor(r() * 3); if (kind === 0) { circle(g, wx - 10, by - 110, 34, shade('#3a8a5a', -0.25)); rr(g, wx - 30, by - 80, 40, 60, 4); g.fillStyle = '#a0583a'; g.fill(); }
        else if (kind === 1) { seg(g, [[wx, by - 150], [wx + ww, by - 150]], 2, '#ddd'); for (let k = 0; k < 4; k++) { const sw = Math.sin(t * 2 + k + s) * 4; rr(g, wx + 10 + k * ww / 4 + sw, by - 150, 34, 50, 4); g.fillStyle = ['#e8e2d8', '#d4262e', '#2f6fd0', '#f2c21a'][k]; g.fill(); } }
      }
    }
    // storey number plates on the left edge (gold)
    if (o.numbers !== false) { const ny = fy + STOREY / 2; rr(g, x - w / 2 - 120, ny - 44, 88, 88, 14); g.fillStyle = 'rgba(20,14,26,.85)'; g.fill(); g.strokeStyle = S().ui.gold; g.lineWidth = 4; g.stroke(); text(g, String(s + 1), x - w / 2 - 76, ny + 3, { size: 62, color: S().ui.gold, font: FONTS.ui, weight: 900 }); }
  }
  // entrance: glass door, canopy, house number, intercom, bike rack
  rr(g, x - 110, gy - 420, 220, 420, 8); g.fillStyle = mix(P, '#3a3040', 0.45); g.fill(); seg(g, [[x, gy - 420], [x, gy]], 6, '#2a2430'); glow(g, x, gy - 200, 260, P, 0.25);
  poly(g, [[x - 200, gy - 440], [x + 200, gy - 440], [x + 170, gy - 500], [x - 170, gy - 500]], shade(wall, -0.65)); text(g, '16', x + 160, gy - 330, { size: 40, color: '#fff1dc', font: FONTS.ui, weight: 900 });
  for (let k = 0; k < 4; k++) { g.strokeStyle = '#3a3440'; g.lineWidth = 6; g.beginPath(); g.arc(x + 320 + k * 60, gy - 40, 40, Math.PI, 0); g.stroke(); }
  return { top, h, w };
}

// ---------- ladder (two rails + rungs) from foot to top ----------
export function ladder(g, fx, fy, tx, ty, o = {}) {
  const w = o.w ?? 80, col = o.color ?? '#b8b8c0', dx = tx - fx, dy = ty - fy, L = Math.hypot(dx, dy), nx = -dy / L * w / 2, ny = dx / L * w / 2;
  seg(g, [[fx + nx, fy + ny], [tx + nx, ty + ny]], 12, col); seg(g, [[fx - nx, fy - ny], [tx - nx, ty - ny]], 12, col);
  const n = Math.max(3, Math.round(L / 110)); for (let k = 1; k < n; k++) { const u = k / n; seg(g, [[fx + dx * u + nx, fy + dy * u + ny], [fx + dx * u - nx, fy + dy * u - ny]], 7, shade(col, -0.15)); }
}
// pole-vault pole lying on the grass (bent fibreglass, grip tape)
export function vaultPole(g, x, gy, len = 1300) { seg(g, [[x - len / 2, gy], [x, gy - 10], [x + len / 2, gy - 2]], 12, '#2f6fd0'); seg(g, [[x + len / 2 - 160, gy - 4], [x + len / 2, gy - 2]], 13, '#20202a'); g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(x - len / 2, gy + 6, len, 6); }
// tall marker post with the gold "6.31 m" plate at the record height
export function markerPost(g, x, gy, m = 6.31, o = {}) {
  const hy = gy - m * U, ui = S().ui; seg(g, [[x, gy], [x, hy - 30]], 16, '#e8e2d8'); for (let k = 1; k < m; k++) seg(g, [[x - 14, gy - k * U], [x + 14, gy - k * U]], 5, '#d4262e');
  seg(g, [[x - 130, hy], [x + 130, hy]], 6, alpha(ui.gold, 0.9)); glow(g, x, hy, 220, ui.gold, 0.18);
  rr(g, x + 24, hy - 120, 300, 96, 16); g.fillStyle = 'rgba(20,14,26,.9)'; g.fill(); g.strokeStyle = ui.gold; g.lineWidth = 4; g.stroke();
  text(g, `${m.toFixed(2)} m`, x + 174, hy - 76, { size: 58, color: ui.gold, font: FONTS.ui, weight: 900, glow: 10, glowColor: alpha(ui.gold, 0.6) });
  if (o.sub) text(g, o.sub, x + 174, hy - 4, { size: 26, color: ui.cream, font: FONTS.ui, weight: 900, spacing: 2 });
  return hy;
}

// ---------- landing gadgets (same look as DEMO_jump) ----------
export function trampoline(g, x, gy, w, sag) { seg(g, [[x - w / 2, gy - 60], [x - w / 2 + 20, gy]], 8, '#2a2632'); seg(g, [[x + w / 2, gy - 60], [x + w / 2 - 20, gy]], 8, '#2a2632');
  g.strokeStyle = '#141018'; g.lineWidth = 12; g.beginPath(); g.moveTo(x - w / 2, gy - 60); g.quadraticCurveTo(x, gy - 60 + sag * 2, x + w / 2, gy - 60); g.stroke();
  g.strokeStyle = '#2f6fd0'; g.lineWidth = 8; g.beginPath(); g.moveTo(x - w / 2, gy - 62); g.lineTo(x + w / 2, gy - 62); g.stroke(); for (let i = 0; i < 9; i++) seg(g, [[x - w / 2 + i * w / 8, gy - 66], [x - w / 2 + i * w / 8, gy - 54]], 3, '#9aa0b0'); }
export const PH = 120;
export function poolBack(g, x, gy, w, t) { const top = gy - PH; g.fillStyle = '#c8c4d4'; g.beginPath(); g.ellipse(x, top, w / 2 + 12, 46, 0, 0, 7); g.fill();
  g.fillStyle = linGrad(g, 0, top - 36, 0, top + 36, ['#2a6aa8', '#5ab8e8']); g.beginPath(); g.ellipse(x, top, w / 2, 36, 0, 0, 7); g.fill();
  for (let i = 0; i < 5; i++) { const xx = x - w * 0.34 + i * w * 0.17 + Math.sin(t * 2 + i) * 12; seg(g, [[xx, top - 6 + i % 2 * 12], [xx + 40, top - 6 + i % 2 * 12]], 3, alpha('#e8f6ff', 0.6)); } glow(g, x, top, w * 0.6, '#7fd0ff', 0.15); }
export function pool(g, x, gy, w) { const top = gy - PH; g.fillStyle = linGrad(g, 0, top, 0, gy, ['#e8e4f0', '#9a96aa']); g.beginPath(); g.moveTo(x - w / 2 - 12, top); g.ellipse(x, top, w / 2 + 12, 46, 0, Math.PI, 0, true); g.lineTo(x + w / 2 + 12, gy); g.ellipse(x, gy, w / 2 + 12, 30, 0, 0, Math.PI); g.closePath(); g.fill();
  for (let i = 0; i < 7; i++) { const xx = x - w / 2 + 20 + i * (w - 20) / 7; g.fillStyle = i % 2 ? '#2f6fd0' : '#e8e4f0'; g.fillRect(xx, top + 30, (w - 20) / 7, 16); } }
export function haystack(g, x, gy, s, sq) { const r = rng(5); g.fillStyle = '#c99a3a'; g.beginPath(); g.ellipse(x, gy - 70 * s * sq, 130 * s, 90 * s * sq, 0, Math.PI, 0); g.lineTo(x + 130 * s, gy); g.lineTo(x - 130 * s, gy); g.closePath(); g.fill();
  g.strokeStyle = '#e8c25a'; g.lineWidth = 3; for (let i = 0; i < 40; i++) { const a = Math.PI + r() * Math.PI, rr2 = r(), px = x + Math.cos(a) * 120 * s * rr2, py = gy - 70 * s * sq + Math.sin(a) * 80 * s * sq * rr2; g.beginPath(); g.moveTo(px, py); g.lineTo(px + 12, py - 6); g.stroke(); } }

// ---------- the mustard hoodie as loose cloth (k = flap phase, rot) ----------
export function hoodieCloth(g, x, y, s, rot, t, o = {}) {
  const c = HERO.color, w = Math.sin(t * 9) * 8;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  g.fillStyle = shade(c, -0.12); g.beginPath(); g.moveTo(-40, -50); g.quadraticCurveTo(0, -62 + w * 0.3, 40, -50); g.lineTo(46 + w * 0.4, 40); g.quadraticCurveTo(0, 52 + w, -46 - w * 0.4, 40); g.closePath(); g.fill();   // body
  for (const sd of [-1, 1]) { g.strokeStyle = c; g.lineWidth = 22; g.lineCap = 'round'; g.beginPath(); g.moveTo(sd * 38, -44); g.quadraticCurveTo(sd * (74 + w), -10, sd * (70 + w * 1.5), 46 + (o.droop ?? 0)); g.stroke(); }   // sleeves
  g.fillStyle = shade(c, -0.3); g.beginPath(); g.ellipse(0, -60, 30, 20, 0, 0, 7); g.fill();                                           // hood
  g.fillStyle = shade(c, -0.3); g.fillRect(-42, 32, 84, 10); seg(g, [[-8, -46], [-6 + w * 0.3, -6]], 3, '#f4efe6'); seg(g, [[8, -46], [10 + w * 0.3, -8]], 3, '#f4efe6');
  g.restore();
}
// white socks over the figure's feet (shoes hidden by Mina)
export function socks(g, o, pose) { const s = (o.s ?? 1.9), f = o.facing ?? 1; for (const k of ['fF', 'fB']) { const x = o.x + pose[k][0] * f * s, y = o.y + pose[k][1] * s; g.fillStyle = '#ece8e0'; g.beginPath(); g.ellipse(x + 8 * f * s, y - 5 * s, 15 * s, 7 * s, 0, 0, 7); g.fill(); seg(g, [[x - 2 * f * s, y - 16 * s], [x - 2 * f * s, y - 6 * s]], 9 * s, '#ece8e0'); } }
// cartoon pain stars (screen space)
export function painStars(g, t, x, y, k = 1) { for (let i = 0; i < 5; i++) { const a = t * 3 + i * 1.256, px = x + Math.cos(a) * 140, py = y + Math.sin(a) * 40, r = 22 * k * (0.7 + 0.3 * Math.sin(t * 9 + i)); if (k <= 0.01) continue; g.save(); g.translate(px, py); g.rotate(t * 4 + i); poly(g, Array.from({ length: 10 }, (_, j) => { const rr2 = j % 2 ? r * 0.45 : r; const aa = j / 10 * Math.PI * 2; return [Math.cos(aa) * rr2, Math.sin(aa) * rr2]; }), i % 2 ? '#ffd84a' : '#fff1dc'); g.restore(); } }
// whistle notes drifting up from (x, y)
export function notes(g, t, x, y, a = 1) { for (let i = 0; i < 3; i++) { const u = (t * 0.7 + i / 3) % 1, px = x + u * 80 + Math.sin(u * 8 + i) * 14, py = y - u * 140, al = a * Math.sin(u * Math.PI); if (al <= 0.01) continue; circle(g, px, py, 9, alpha('#fff1dc', al)); seg(g, [[px + 8, py], [px + 8, py - 34], [px + 22, py - 26]], 4, alpha('#fff1dc', al)); } }
