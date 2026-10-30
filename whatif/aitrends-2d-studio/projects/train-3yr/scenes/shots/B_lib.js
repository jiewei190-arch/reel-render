// B_lib.js — shared helpers for ep 3 batch B (s027-s053). Registers no shots.
//   wt(info, word, fb, after, exact)   word start in shot time (searched inside the shot only; fb = fallback seconds)
//   skipCard(g, t, info, keys, o)       the home3 timeSkip card, small in the top-left, fading out before the cut
//   tally(g, t, slots, o)               the set tally under a push-up: n slots that fill one by one (gold numbers)
//   staircase / stairY                  the hallway staircase (local prop): wall, photos, runner carpet, banister
//   bpPush(g, t, dur, f)                slow push-in for blueprint boards
//   heavyLid(f)                         bored face preset for giantFace
import { E, V, S, clamp, lerp, ease, prog, rr, seg, circle, poly, glow, alpha, shade, mix, linGrad, rng, text, FONTS } from '/engine/core.js';
import { timeSkip } from '../sets/home3.js';

const norm = (w) => w.toLowerCase().replace(/[^\w']/g, '');
export const wt = (info, m, fb, after = 0, exact = false) => {
  const st = info.shot.start, k = norm(m);
  const hit = E.words.find(x => x.start >= st + after - 0.05 && x.start < st + info.dur && (exact ? norm(x.word) === k : norm(x.word).startsWith(k)));
  return hit ? hit.start - st : fb;
};
export const toScreen = (x, y, cam) => [(x - E.W / 2 - (cam.x || 0)) * (cam.z ?? 1) + E.W / 2, (y - E.H / 2 - (cam.y || 0)) * (cam.z ?? 1) + E.H / 2];

export function skipCard(g, t, info, keys, o = {}) {
  const tEnd = o.until ?? keys[keys.length - 1][0] + 1.7, a = clamp((tEnd - t) / 0.3) * clamp((info.dur - t) / 0.25);
  if (a <= 0) return; g.save(); g.globalAlpha *= a; timeSkip(g, t, { x: o.x ?? E.W * 0.17, y: o.y ?? E.H * 0.05, s: o.s ?? 0.36, keys }); g.restore();
}
// set tally: `slots` boxes; `fill` 0..slots (fractional fills the next box); `labels` per box (gold)
export function tally(g, t, slots, fill, o = {}) {
  const ui = S().ui, x = o.x ?? E.W * 0.5, y = o.y ?? E.H * 0.9, w = o.w ?? 120, h = o.h ?? 70, gap = 18, x0 = x - (slots * w + (slots - 1) * gap) / 2;
  g.save(); g.globalAlpha *= o.alpha ?? 1;
  for (let i = 0; i < slots; i++) { const bx = x0 + i * (w + gap), k = clamp(fill - i);
    rr(g, bx, y - h / 2, w, h, 14); g.fillStyle = 'rgba(14,10,20,.8)'; g.fill(); g.strokeStyle = alpha(ui.gold, 0.6); g.lineWidth = 3; g.stroke();
    if (k > 0) { g.save(); rr(g, bx, y - h / 2, w * k, h, 14); g.clip(); g.fillStyle = alpha(ui.gold, 0.85); g.fillRect(bx, y - h / 2, w, h); g.restore(); }
    text(g, (o.labels || [])[i] ?? '', bx + w / 2, y + 2, { size: 38, color: k >= 1 ? '#1a1020' : ui.gold, font: FONTS.ui, weight: 900 }); }
  if (o.title) text(g, o.title, x, y - h / 2 - 30, { size: 28, color: ui.cream, font: FONTS.ui, weight: 900, spacing: 3, stroke: 6, strokeColor: '#140f18' });
  g.restore();
}
export function bpPush(g, t, dur, f) { const z = 1 + 0.035 * ease.inOut(t / dur); g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2 + Math.sin(t * 0.5) * 3, -E.H / 2); f(); g.restore(); }

// ---------- hallway staircase (descends left -> right) ----------
export const STAIR = { x0: -260, y0: 300, n: 10, w: 150, h: 64 };          // top step nose at (x0, y0); world units
export const stairY = (x) => { const S2 = STAIR, i = clamp(Math.floor((x - S2.x0) / S2.w), 0, S2.n); return S2.y0 + i * S2.h; };
export const floorY = () => STAIR.y0 + STAIR.n * STAIR.h;
// back wall (call on a ~0.8 layer): wallpaper stripes, family photos up the slope, a sconce, a window
export function stairWall(g, t) {
  const S2 = STAIR, fy = floorY();
  g.fillStyle = linGrad(g, 0, -800, 0, fy + 200, ['#e8d8bc', '#c8b090']); g.fillRect(-2000, -1200, 6000, fy + 1600);
  for (let x = -2000; x < 4000; x += 90) { g.fillStyle = alpha('#a88a68', 0.12); g.fillRect(x, -1200, 30, fy + 1600); }
  const r = rng(8); for (let i = 0; i < 7; i++) { const px = S2.x0 + 80 + i * 210, py = S2.y0 - 470 + i * S2.h * 1.4 + (i % 2) * 40, w = 110 + r() * 50, h = 130 + r() * 40;
    rr(g, px - w / 2 - 10, py - h / 2 - 10, w + 20, h + 20, 4); g.fillStyle = ['#3a2a22', '#c8a050', '#2a2a38'][i % 3]; g.fill();
    g.fillStyle = mix(['#8ab0d8', '#d8b890', '#a8c8a0', '#e0b0b8'][i % 4], '#ffffff', 0.2); g.fillRect(px - w / 2, py - h / 2, w, h);
    for (let j = 0; j < 1 + (i % 3); j++) { const fx = px - w * 0.25 + j * w * 0.25, fy2 = py + h * 0.3; circle(g, fx, fy2 - 34, 12, '#2a2230'); g.fillStyle = '#2a2230'; g.beginPath(); g.ellipse(fx, fy2, 16, 22, 0, Math.PI, 0); g.fill(); } }
  const sx = S2.x0 + 1500, sy = S2.y0 - 160; glow(g, sx, sy, 320, '#ffd59a', 0.35); rr(g, sx - 16, sy - 30, 32, 44, 6); g.fillStyle = '#fff0c8'; g.fill();          // sconce
  rr(g, S2.x0 - 520, S2.y0 - 640, 260, 360, 8); g.fillStyle = '#8ab0d8'; g.fill(); g.strokeStyle = '#f4efe6'; g.lineWidth = 12; g.stroke(); seg(g, [[S2.x0 - 390, S2.y0 - 640], [S2.x0 - 390, S2.y0 - 280]], 8, '#f4efe6');
  glow(g, S2.x0 - 390, S2.y0 - 460, 300, '#fff4dc', 0.25);
}
// the stairs themselves (character plane): treads, risers, the red runner, the hall floor
export function stairs(g) {
  const S2 = STAIR, fy = floorY();
  g.fillStyle = '#8a6a4a'; g.fillRect(-2000, fy, 6000, 800); g.fillStyle = alpha('#000', 0.15); for (let x = -2000; x < 4000; x += 160) g.fillRect(x, fy, 4, 800);
  g.fillStyle = '#9a7a58'; g.fillRect(-2000, S2.y0, S2.x0 + 2000, 900);                                             // landing
  for (let i = 0; i < S2.n; i++) { const x = S2.x0 + i * S2.w, y = S2.y0 + i * S2.h;
    g.fillStyle = '#7a5a3a'; g.fillRect(x, y, S2.w + 2, fy - y + 2);                                                     // stringer block
    g.fillStyle = '#b08a60'; g.fillRect(x, y - 6, S2.w + 2, 12);                                                         // tread nose
    g.fillStyle = '#b8323a'; g.fillRect(x + 24, y - 4, S2.w - 46, 10); g.fillRect(x + S2.w - 22, y, 10, S2.h);           // runner
  }
}
// banister (in front of the figure): handrail parallel to the slope + balusters + newel post at the bottom
export function banister(g, t, o = {}) {
  const S2 = STAIR, fy = floorY(), hh = o.h ?? 230, x1 = S2.x0 + S2.n * S2.w + 60;
  for (let i = 0; i <= S2.n; i++) { const x = S2.x0 + i * S2.w + 30, y = S2.y0 + Math.min(i, S2.n) * S2.h; seg(g, [[x, y], [x, y - hh + 8]], 9, '#f0ebe0'); seg(g, [[x + 70, y], [x + 70, y - hh + 8 + S2.h * 0.47]], 9, '#f0ebe0'); }
  seg(g, [[S2.x0 - 600, S2.y0 - hh], [S2.x0, S2.y0 - hh], [x1 - 60, fy - hh]], 18, '#6a4428'); seg(g, [[S2.x0 - 600, S2.y0 - hh - 5], [S2.x0, S2.y0 - hh - 5], [x1 - 60, fy - hh - 5]], 5, alpha('#c89a6a', 0.7));
  rr(g, x1 - 84, fy - hh - 70, 48, hh + 70, 6); g.fillStyle = '#6a4428'; g.fill(); circle(g, x1 - 60, fy - hh - 82, 26, '#7a5030');
}
export const railY = (x, hh = 230) => { const S2 = STAIR; if (x < S2.x0) return S2.y0 - hh; const x1 = S2.x0 + S2.n * S2.w; return lerp(S2.y0, floorY(), clamp((x - S2.x0) / (x1 - S2.x0))) - hh; };

// ---------- props ----------
export function phoneIn(g, x, y, s, rot, t, rec = true) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); rr(g, -36, -20, 72, 40, 7); g.fillStyle = '#16121c'; g.fill(); rr(g, -32, -16, 64, 32, 5); g.fillStyle = '#5a7ab8'; g.fill(); if (rec && Math.sin(t * 6) > 0) circle(g, 24, -10, 4, '#ff3a3a'); g.restore(); }
export function crisps(g, x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); poly(g, [[-22, -36], [22, -36], [26, 30], [-26, 30]], '#d4262e'); g.fillStyle = '#f2c21a'; g.fillRect(-18, -10, 36, 18); g.restore(); }
// a bulging backpack with textbooks poking out, carried/dropped (not worn)
export function bookBag(g, x, y, s, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  const books = [['MATHS', '#2f6fd0', -40, 10], ['PHYSICS', '#3aa05a', -6, 22], ['DICTIONARY', '#8a2a3a', 30, 4]];
  for (const [ttl, c, dx, h] of books) { g.save(); g.translate(dx, -78 - h); g.rotate((dx / 400)); rr(g, -16, -40, 32, 80, 3); g.fillStyle = c; g.fill(); g.save(); g.translate(0, 0); g.rotate(-Math.PI / 2); text(g, ttl, 0, 0, { size: 11, color: '#fff', font: FONTS.ui, weight: 900 }); g.restore(); g.restore(); }
  rr(g, -70, -90, 140, 150, 30); g.fillStyle = '#3b4a6b'; g.fill(); rr(g, -50, -10, 100, 56, 14); g.fillStyle = shade('#3b4a6b', -0.25); g.fill();
  seg(g, [[-44, -86], [-60, -120], [-30, -92]], 8, '#2a3450'); seg(g, [[-70, -40], [70, -40]], 5, '#f2c21a');
  g.restore();
}
// giantFace preset: heavy-lidded boredom (yawn adds open mouth)
export const BORED = { eye: 0.28, brow: -0.05, tilt: 0.1, smile: -0.15, w: 0.8, look: [0.3, 0.2] };
export const YAWN = { eye: 0.15, brow: 0.3, tilt: -0.3, open: 1.0, smile: -0.1, w: 0.55 };

// ---------- ep 3 hero giant face ----------
// faces.js still draws the HERO with the ep 2 mustard hoodie and no hair, so for the HERO we draw the ep 3 look here:
// green hoodie + hood behind, then the face (who: 'NONE' = no body), then the big dark curls and the white sweatband with a green stripe.
import { giantFace } from '../sets/faces.js';
import { HERO } from '../cast.js';
export function heroFace(g, cx, cy, r, o = {}) {
  const c = HERO.color, d = shade(c, -0.3), ink = S().ink;
  g.save(); g.translate(cx, cy + (o.breath ?? 0) * r * 0.012);
  g.fillStyle = shade(c, -0.18); g.beginPath(); g.ellipse(0, r * 0.04, r * 1.24, r * 1.2, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = alpha('#000', 0.35); g.beginPath(); g.ellipse(0, r * 0.06, r * 1.08, r * 1.06, 0, 0, Math.PI * 2); g.fill();
  const gr = g.createLinearGradient(0, r, 0, r * 2.3); gr.addColorStop(0, shade(c, 0.05)); gr.addColorStop(1, shade(c, -0.35));
  g.fillStyle = gr; g.beginPath(); g.moveTo(-r * 1.9, r * 2.3); g.quadraticCurveTo(-r * 1.7, r * 1.15, -r * 0.62, r * 0.98); g.lineTo(r * 0.62, r * 0.98); g.quadraticCurveTo(r * 1.7, r * 1.15, r * 1.9, r * 2.3); g.closePath(); g.fill();
  g.strokeStyle = d; g.lineWidth = r * 0.05; g.beginPath(); g.moveTo(-r * 0.62, r * 0.98); g.quadraticCurveTo(0, r * 1.32, r * 0.62, r * 0.98); g.stroke();
  for (const s of [-1, 1]) { g.strokeStyle = shade(c, 0.5); g.lineWidth = r * 0.05; g.beginPath(); g.moveTo(s * r * 0.2, r * 1.12); g.quadraticCurveTo(s * r * 0.26, r * 1.5, s * r * 0.22, r * 1.8); g.stroke(); circle(g, s * r * 0.22, r * 1.84, r * 0.045, shade(c, 0.5)); }
  g.restore();
  giantFace(g, cx, cy, r, { ...o, who: 'NONE' });
  g.save(); g.translate(cx, cy + (o.breath ?? 0) * r * 0.012); if (o.tilt) g.rotate(o.tilt);
  const bob = Math.sin((o.t ?? 0) * 2) * r * 0.01;
  for (let i = 0; i < 13; i++) { const a = Math.PI * (1.02 + i * 0.08), rr2 = r * (0.26 + 0.05 * Math.sin(i * 2.1)); circle(g, Math.cos(a) * r * 0.95, Math.sin(a) * r * 0.95 + bob, rr2, ink); }   // the big mop of curls
  for (let i = 0; i < 7; i++) { const a = Math.PI * (1.15 + i * 0.12); circle(g, Math.cos(a) * r * 1.16, Math.sin(a) * r * 1.12 + bob, r * 0.2, ink); }
  for (let i = 0; i < 6; i++) { const a = Math.PI * (1.12 + i * 0.15); g.strokeStyle = alpha('#5a4a6a', 0.6); g.lineWidth = r * 0.02; g.beginPath(); g.arc(Math.cos(a) * r * 1.0, Math.sin(a) * r * 1.0 + bob, r * 0.12, 0, Math.PI * 1.2); g.stroke(); }
  g.fillStyle = HERO.sweatband; g.beginPath(); g.moveTo(-r * 0.93, -r * 0.42); g.quadraticCurveTo(0, -r * 0.62, r * 0.93, -r * 0.42); g.lineTo(r * 0.88, -r * 0.62); g.quadraticCurveTo(0, -r * 0.82, -r * 0.88, -r * 0.62); g.closePath(); g.fill();
  g.strokeStyle = '#3f9a4a'; g.lineWidth = r * 0.045; g.beginPath(); g.moveTo(-r * 0.9, -r * 0.52); g.quadraticCurveTo(0, -r * 0.72, r * 0.9, -r * 0.52); g.stroke();
  g.restore();
}
