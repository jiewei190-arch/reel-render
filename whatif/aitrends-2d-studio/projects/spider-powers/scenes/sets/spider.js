// sets/spider.js — What If ep 4 "What If You Had Spider Powers?": PIP the jumping spider + the hero's spider-power rigs.
// LEGAL (HANDOFF): original hero only. No red-and-blue, no suit/mask, no web logo or web pattern, NO wrist shooters (silk comes from the
// back end, like a real spider, played for comedy), no skyscraper swinging, no "spider sense" text.
//   pip(g, x, y, s, { t, tilt: -1..1 (head tilt), hop: 0..1 (a hop arc; lift returned), wave: 0..1 (front leg up, waving), look: [x, y],
//                     blink: 0..1, facing: 1|-1 })   cute grey-and-cream jumping spider, 3/4 front: 8 fuzzy legs, two huge shiny front
//       eyes + two small side eyes, cream palps, a striped fuzzy abdomen. s = 1 is thumb-sized (~70 px). Returns { eyes: [x, y], lift }.
//   pipFace(g, cx, cy, r, { t, look, blink, tilt, wave })   the giant close-up: fuzzy face filling the frame, the two huge glossy eyes
//       reflect a window, palps twitch.
//   HERO RIGS (pure functions of t that return a pose for actor(); local rig space, feet at y = 0, facing +x):
//   wallCling(t, o) -> { pose, dy, hold }   climbing a wall on the hero's +x side: o: { climb: 0..1 (rate of the hand-over-hand cycle),
//       slide: 0..1 (slow "wet sticker" slide down: returns dy in world units * s), t0 }. Hands + soles flat on the wall.
//   stickMarks(g, t, pts, o)   little suction rings where the hands/socks touch the wall (world points), fading
//   ceilingPose(t, o) + drawCeiling(g, who, { t, x, ceilY, s, peel: 0..1, expr, blink, rim })   spread flat on the ceiling, drawn
//       upside down from ceilY; peel lets the limbs come away and the body drop (returns the drop so the shot can land it on the bed)
//   silkLine(g, from, to, { t, sag, k: draw-on 0..1, w })   a fine glinting dragline (catenary sag, a glint running along it)
//   silkPuff(g, t, t0, x, y, o)   the comedy puff from the back end: a little cloud of silk strands + "pfft" lines + a sparkle
//   silkAnchor(o, pose)   world point of the hero's back end (where the silk comes out) for actor opts o + pose
//   dodge(t, t0, o) -> { pose, dx, look }   steps aside without looking (smug, eyes closed) at t0; o: { side: 1|-1, base }
//   airHairs(g, t, x, y, k)   tiny hairs on the forearms/neck bristling and wavy air lines around the head (feeling the air; no text)
//   gloves(g, o, pose, { t, slip: 0..1, tSlip })   the oversized purple gardening gloves drawn over the hands; slip lets the front glove
//       slide off and fall (the gag: they never help). Returns { fallen: [x, y] | null }.
import { E, S, clamp, lerp, ease, prog, rng, noise, rr, seg, circle, ring, poly, alpha, shade, mix, glow, text, FONTS, linGrad, radGrad } from '/engine/core.js';
import { POSES, blendPose, breathe } from '/engine/rig2d.js';
import { actor, outfitOf } from './actors.js';

const GREY = '#7a7480', CREAM = '#efe4cc', DARK = '#3a3440';

// ---------- fuzz helper ----------
function fuzz(g, cx, cy, rx, ry, n, col, len, seed, t = 0) { const r = rng(seed); g.strokeStyle = col; g.lineWidth = Math.max(1, len * 0.18); g.lineCap = 'round'; g.beginPath(); for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + r() * 0.2, l = len * (0.6 + r() * 0.6), w = Math.sin(t * 3 + i) * 0.08; const px = cx + Math.cos(a) * rx, py = cy + Math.sin(a) * ry; g.moveTo(px, py); g.lineTo(px + Math.cos(a + w) * l, py + Math.sin(a + w) * l); } g.stroke(); }

// ---------- PIP ----------
export function pip(g, x, y, s = 1, o = {}) {
  const t = o.t ?? 0, f = o.facing ?? 1, hop = clamp(o.hop ?? 0), lift = Math.sin(hop * Math.PI) * 60, tilt = (o.tilt ?? 0) * 0.35, wave = clamp(o.wave ?? 0), look = o.look || [0, 0.1], bl = clamp(o.blink ?? 0);
  const squash = hop > 0 && hop < 0.15 ? 1 - hop * 2 : 1;
  g.save(); g.translate(x, y); g.scale(s * f, s);
  g.fillStyle = `rgba(0,0,0,${0.25 / (1 + lift / 30)})`; g.beginPath(); g.ellipse(0, 2, 34, 6, 0, 0, 7); g.fill();
  g.translate(0, -lift); g.scale(1 / squash, squash);
  // legs: 4 per side, two-segment, fuzzy; front pair thicker; front-right can wave
  const legs = [[-1, 0], [-1, 1], [-1, 2], [-1, 3], [1, 0], [1, 1], [1, 2], [1, 3]];
  for (const [sd, i] of legs) {
    const bx = sd * (6 + i * 2), by = -16 + i * 3, kneeX = sd * (22 + i * 6), kneeY = -30 + i * 6 - Math.sin(t * 6 + i) * hop * 6, footX = sd * (30 + i * 9), footY = -2;
    let k = [kneeX, kneeY], ft = [footX, footY];
    if (sd === 1 && i === 0 && wave > 0) { const wv = Math.sin(t * 10) * 6; k = [lerp(kneeX, 24, wave), lerp(kneeY, -48, wave)]; ft = [lerp(footX, 34 + wv, wave), lerp(footY, -70, wave)]; }
    const w = i === 0 ? 5.5 : 4; seg(g, [[bx, by], k, ft], w, DARK); seg(g, [[bx, by], k], w * 0.45, alpha(CREAM, 0.5));
    for (let h = 0; h < 4; h++) { const u = (h + 0.5) / 4, px = lerp(k[0], ft[0], u), py = lerp(k[1], ft[1], u); seg(g, [[px, py], [px + sd * 2, py - 3]], 1, alpha(GREY, 0.8)); }
  }
  // abdomen (behind, fuzzy stripes)
  g.fillStyle = GREY; g.beginPath(); g.ellipse(-4, -18, 20, 15, -0.2, 0, 7); g.fill(); fuzz(g, -4, -18, 20, 15, 30, alpha(GREY, 0.9), 4, 3, t);
  for (let i = 0; i < 3; i++) seg(g, [[-16 + i * 9, -26 + i], [-10 + i * 9, -12 + i]], 3, alpha(CREAM, 0.7));
  // cephalothorax / head
  g.save(); g.translate(8, -26); g.rotate(tilt);
  g.fillStyle = '#8a8490'; g.beginPath(); g.ellipse(0, 0, 22, 18, 0, 0, 7); g.fill(); fuzz(g, 0, 0, 22, 18, 40, alpha('#8a8490', 0.95), 4.5, 7, t);
  g.fillStyle = CREAM; g.beginPath(); g.ellipse(0, -10, 14, 6, 0, 0, 7); g.fill();                                 // cream "eyebrow" band
  // palps
  for (const sd of [-1, 1]) { const tw = Math.sin(t * 7 + sd) * 1.5; circle(g, sd * 7, 12 + tw, 4.5, CREAM); fuzz(g, sd * 7, 12 + tw, 4.5, 4.5, 10, alpha(CREAM, 0.9), 2, 11 + sd, t); }
  // eyes: two huge front + two small side
  for (const sd of [-1, 1]) {
    const ex = sd * 8, ey = 2, er = 7.5;
    circle(g, ex, ey, er + 1.2, '#2a2430'); circle(g, ex, ey, er, '#0c0a10');
    g.fillStyle = radGrad(g, ex + look[0] * 2, ey + look[1] * 2, 0.5, er, ['#3a3448', '#0c0a10']); g.beginPath(); g.arc(ex, ey, er, 0, 7); g.fill();
    circle(g, ex - 2.6 + look[0] * 1.2, ey - 2.8 + look[1] * 1.2, 2.4, '#ffffff'); circle(g, ex + 2.4, ey + 2.6, 1, alpha('#ffffff', 0.7));
    if (bl > 0) { g.fillStyle = '#8a8490'; g.beginPath(); g.ellipse(ex, ey - er + er * bl, er + 1, er * bl, 0, 0, 7); g.fill(); }
    circle(g, sd * 18, -3, 2.6, '#0c0a10'); circle(g, sd * 18 - 0.8, -3.8, 0.8, '#ffffff');
  }
  g.restore();
  g.restore();
  return { eyes: [x + 8 * s * f, y - (26 + lift) * s], lift: lift * s };
}

export function pipFace(g, cx, cy, r, o = {}) {
  const t = o.t ?? 0, look = o.look || [0, 0], bl = clamp(o.blink ?? 0), tilt = (o.tilt ?? 0) * 0.25;
  g.save(); g.translate(cx, cy); g.rotate(tilt);
  // front legs framing the face
  for (const sd of [-1, 1]) { seg(g, [[sd * r * 0.7, r * 0.6], [sd * r * 1.2, r * 0.1], [sd * r * 1.5, r * 1.3]], r * 0.16, DARK); for (let i = 0; i < 12; i++) { const u = i / 12, px = lerp(sd * r * 1.2, sd * r * 1.5, u), py = lerp(r * 0.1, r * 1.3, u); seg(g, [[px, py], [px + sd * r * 0.06, py - r * 0.05]], r * 0.012, alpha(GREY, 0.9)); } }
  g.fillStyle = '#8a8490'; g.beginPath(); g.ellipse(0, 0, r * 1.05, r * 0.9, 0, 0, 7); g.fill(); fuzz(g, 0, 0, r * 1.05, r * 0.9, 160, alpha('#8a8490', 0.95), r * 0.12, 5, t);
  for (let i = 0; i < 260; i++) { const a = i * 2.39996, rr2 = Math.sqrt(i / 260) * r * 0.95, px = Math.cos(a) * rr2, py = Math.sin(a) * rr2 * 0.85; seg(g, [[px, py], [px + Math.cos(a) * r * 0.03, py + Math.sin(a) * r * 0.03]], r * 0.008, alpha(i % 3 ? '#a8a2ae' : CREAM, 0.5)); }   // fuzz texture
  for (const sd of [-1, 1]) { g.fillStyle = CREAM; g.beginPath(); g.ellipse(sd * r * 0.36, -r * 0.36, r * 0.3, r * 0.08, sd * 0.15, 0, 7); g.fill(); fuzz(g, sd * r * 0.36, -r * 0.36, r * 0.3, r * 0.08, 30, alpha(CREAM, 0.9), r * 0.05, 9 + sd, t); }   // cream fuzzy brows over the eyes
  for (const sd of [-1, 1]) {                                                                                      // the two huge eyes
    const ex = sd * r * 0.36, ey = r * 0.05, er = r * 0.32;
    circle(g, ex, ey, er * 1.08, '#2a2430'); g.fillStyle = radGrad(g, ex + look[0] * er * 0.2, ey + look[1] * er * 0.2, er * 0.05, er, ['#4a3e5a', '#1a1622', '#06050a']); g.beginPath(); g.arc(ex, ey, er, 0, 7); g.fill();
    g.save(); g.beginPath(); g.arc(ex, ey, er, 0, 7); g.clip(); g.fillStyle = alpha('#dfe8ff', 0.85); g.fillRect(ex - er * 0.62, ey - er * 0.7, er * 0.32, er * 0.4); g.fillRect(ex - er * 0.24, ey - er * 0.7, er * 0.32, er * 0.4); g.fillRect(ex - er * 0.62, ey - er * 0.24, er * 0.32, er * 0.34); g.fillRect(ex - er * 0.24, ey - er * 0.24, er * 0.32, er * 0.34); g.restore();   // window reflection
    circle(g, ex + er * 0.42, ey + er * 0.45, er * 0.08, alpha('#ffffff', 0.6));
    if (bl > 0) { g.fillStyle = '#8a8490'; g.beginPath(); g.ellipse(ex, ey - er + er * bl, er * 1.1, er * bl, 0, 0, 7); g.fill(); }
    circle(g, sd * r * 0.8, -r * 0.12, r * 0.09, '#0c0a10'); circle(g, sd * r * 0.8 - r * 0.03, -r * 0.15, r * 0.025, '#fff');
  }
  for (const sd of [-1, 1]) { const tw = Math.sin(t * 6 + sd) * r * 0.02; circle(g, sd * r * 0.18, r * 0.62 + tw, r * 0.13, CREAM); fuzz(g, sd * r * 0.18, r * 0.62 + tw, r * 0.13, r * 0.13, 30, alpha(CREAM, 0.95), r * 0.04, 13 + sd, t); }   // palps
  g.restore();
}

// ---------- hero rigs ----------
const P = (o) => ({ ...o });
export function wallCling(t, o = {}) {
  const tt = t - (o.t0 ?? 0), rate = o.climb ?? 0, ph = tt * rate * Math.PI * 1.6, a = Math.sin(ph), b = Math.sin(ph + Math.PI);
  const pose = P({ head: [24, -206], sh: [16, -174], hip: [10, -100],
    eF: [30, -200 + a * 12], hF: [44, -232 + a * 22], eB: [32, -170 + b * 10], hB: [44, -196 + b * 22],
    kF: [36, -70 + b * 14], fF: [44, -30 + b * 18], kB: [34, -40 + a * 14], fB: [44, -2 + a * 12] });
  const sl = clamp(o.slide ?? 0), dy = sl * (o.slideDist ?? 260);
  return { pose, dy, hold: [pose.hF, pose.hB, pose.fF, pose.fB] };
}
export function stickMarks(g, t, pts, o = {}) { const a = o.alpha ?? 0.5; for (const [x, y] of pts) { ring(g, x, y, 10, 2, alpha('#e8f0ff', a)); ring(g, x, y, 18, 1.5, alpha('#e8f0ff', a * 0.5)); } }
export function ceilingPose(t, o = {}) {                                                      // lying flat, spread out (local: body along x, back at y = 0)
  const w = Math.sin(t * 1.5) * 4;
  return P({ head: [96, -22], sh: [62, -20], hip: [-14, -18], eF: [70 + w, -64], hF: [96 + w, -96], eB: [80 - w, 22], hB: [104 - w, 48], kF: [-52, -44], fF: [-92, -62], kB: [-54, 8], fB: [-96, 24] });
}
export function drawCeiling(g, who, o = {}) {
  const t = o.t ?? 0, s = o.s ?? 1.9, x = o.x ?? E.W / 2, ceilY = o.ceilY ?? 120, peel = clamp(o.peel ?? 0), drop = ease.in(clamp((peel - 0.35) / 0.65)) * (o.dropTo ?? 600);
  const base = ceilingPose(t, o), sag = clamp(peel / 0.35);
  const p = { ...base, hF: [base.hF[0], base.hF[1] - 30 * sag], hB: [base.hB[0], base.hB[1] + 30 * sag], fF: [base.fF[0], base.fF[1] - 20 * sag], fB: [base.fB[0], base.fB[1] + 20 * sag], head: [base.head[0], base.head[1] - 8 * sag] };
  // the figure is drawn lying with its back against the ceiling: local y = 0 is the ceiling plane, the body hangs below it (screen +y)
  g.save(); g.translate(x, ceilY + 46 * s * 0.5 + drop); g.rotate(drop > 0 ? Math.min(0.5, drop / 1200) : 0); g.scale(1, -1);
  actor(g, who, { x: 0, y: 0, s, facing: 1, pose: p, expr: o.expr || 'surprised', blink: o.blink, rim: o.rim, t, shadow: false });
  g.restore();
  if (peel < 0.35) stickMarks(g, t, [[x + 96 * s, ceilY + 8], [x - 92 * s, ceilY + 8], [x + 30 * s, ceilY + 8]], { alpha: 0.4 * (1 - sag) });
  return { drop };
}
export function silkLine(g, from, to, o = {}) {
  const t = o.t ?? 0, k = clamp(o.k ?? 1), sag = o.sag ?? 40, n = 30, w = o.w ?? 2;
  const pts = []; for (let i = 0; i <= n; i++) { const u = (i / n) * k; pts.push([lerp(from[0], to[0], u), lerp(from[1], to[1], u) + Math.sin(u * Math.PI) * sag]); }
  g.save(); g.strokeStyle = alpha('#f4f6ff', 0.85); g.lineWidth = w; g.beginPath(); pts.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py))); g.stroke();
  const gi = Math.floor(((t * 0.6) % 1) * n * k); if (pts[gi]) glow(g, pts[gi][0], pts[gi][1], 18, '#ffffff', 0.7);
  g.restore();
}
export function silkPuff(g, t, t0, x, y, o = {}) {
  const u = t - t0; if (u < 0 || u > 1.4) return; const r = rng(o.seed ?? 4), k = ease.out(clamp(u / 0.35)), fade = clamp(1.4 - u), dir = o.dir ?? -1;
  g.save(); g.globalAlpha *= fade;
  for (let i = 0; i < 14; i++) { const a = Math.PI + (r() - 0.5) * 1.6, L = (20 + r() * 50) * k; g.strokeStyle = alpha('#f4f6ff', 0.7); g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + dir * Math.cos(a) * -L * 0.5 + Math.sin(u * 9 + i) * 6, y + Math.sin(a) * L * 0.5, x + dir * -Math.cos(a) * L, y + Math.sin(a) * L); g.stroke(); }
  for (let i = 0; i < 5; i++) circle(g, x + dir * (14 + i * 9) * k, y + (r() - 0.5) * 30 * k, (8 + r() * 10) * k, alpha('#ffffff', 0.35));
  for (let i = 0; i < 3; i++) seg(g, [[x + dir * (40 + i * 10) * k, y - 30 + i * 22], [x + dir * (64 + i * 12) * k, y - 36 + i * 22]], 3, alpha('#fff1dc', 0.8));   // "pfft" lines
  glow(g, x, y, 30, '#ffffff', 0.5 * (1 - k));
  g.restore();
}
export const silkAnchor = (o, pose) => { const s = (o.s ?? 1.9), f = o.facing ?? 1; return [o.x + (pose.hip[0] - 14) * f * s, o.y + (pose.hip[1] + 6) * s]; };

export function dodge(t, t0, o = {}) {                                              // leans the upper body away (a limbo-ish sway) without looking
  const side = o.side ?? 1, base = o.base || POSES.crossArms || POSES.stand, k = ease.inOut(clamp((t - t0) / 0.22)), back = ease.inOut(clamp((t - t0 - 0.8) / 0.4)), lean = k * (1 - back);
  const a = -side * 0.75 * lean, hip = base.hip, p = { ...base };
  for (const key of ['head', 'sh', 'eF', 'hF', 'eB', 'hB']) { const dx = base[key][0] - hip[0], dy = base[key][1] - hip[1]; p[key] = [hip[0] + dx * Math.cos(a) - dy * Math.sin(a), hip[1] + dx * Math.sin(a) + dy * Math.cos(a)]; }
  p.kF = [base.kF[0] - side * 14 * lean, base.kF[1] + 6 * lean]; p.kB = [base.kB[0] - side * 10 * lean, base.kB[1] + 6 * lean];
  return { pose: p, dx: side * 30 * lean, look: [0, 0] };
}
export function airHairs(g, t, x, y, k = 1) {
  if (k <= 0) return; g.save(); g.globalAlpha *= k;
  for (let i = 0; i < 3; i++) { const rr2 = 50 + i * 26 + Math.sin(t * 3 + i) * 4; g.strokeStyle = alpha('#e8f4ff', 0.35 - i * 0.08); g.lineWidth = 2.5; g.beginPath(); for (let a = -2.6; a <= -0.5; a += 0.1) { const wv = Math.sin(a * 9 + t * 8 + i) * 3; const px = x + Math.cos(a) * (rr2 + wv), py = y + Math.sin(a) * (rr2 + wv); a <= -2.59 ? g.moveTo(px, py) : g.lineTo(px, py); } g.stroke(); }
  for (let i = 0; i < 8; i++) { const a = -Math.PI / 2 + (i - 3.5) * 0.25, wv = Math.sin(t * 20 + i) * 0.1; seg(g, [[x + Math.cos(a) * 32, y + Math.sin(a) * 32], [x + Math.cos(a + wv) * 42, y + Math.sin(a + wv) * 42]], 1.5, alpha('#fff1dc', 0.6)); }
  g.restore();
}

// ---------- the purple gardening gloves ----------
function glove(g, x, y, s, rot, col) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  rr(g, -12, 4, 24, 16, 5); g.fillStyle = shade(col, -0.25); g.fill();                                              // cuff
  g.fillStyle = col; g.beginPath(); g.ellipse(0, -6, 14, 13, 0, 0, 7); g.fill();
  for (let i = 0; i < 4; i++) { rr(g, -12 + i * 6.5, -30 + Math.abs(i - 1.5) * 2, 6, 18, 3); g.fill(); }              // floppy fingers (too long)
  rr(g, 10, -14, 12, 7, 3.5); g.fill(); seg(g, [[-10, -2], [10, -2]], 1.5, alpha('#000', 0.15));
  g.restore();
}
export function gloves(g, o, pose, opt = {}) {
  const s = (o.s ?? 1.9) * (outfitOf(o.who || 'HERO')?.kid ? 0.72 : 1), f = o.facing ?? 1, col = outfitOf('HERO')?.gloves || '#7b4bb3', t = opt.t ?? 0, slip = clamp(opt.slip ?? 0);
  const W = (p) => [o.x + p[0] * f * s, o.y + p[1] * s];
  const [bx, by] = W(pose.hB); glove(g, bx, by, s * 0.95, f * 0.2, shade(col, -0.12));
  const [fx, fy] = W(pose.hF);
  if (slip <= 0) { glove(g, fx, fy, s, f * 0.2, col); return { fallen: null }; }
  const u = t - (opt.tSlip ?? 0), drop = slip < 1 ? slip * 10 * s : 10 * s + Math.max(0, u) ** 2 * 600 * (slip >= 1 ? 1 : 0), spin = slip >= 1 ? u * 6 : slip * 0.4;
  glove(g, fx + f * slip * 8 * s, fy + drop, s, f * (0.2 + spin), col);
  return { fallen: [fx, fy + drop] };
}
