// sets/spiderprops.js — ep 4 "What If You Had Spider Powers?" props + small scenes (16:9, 1920x1080; V() keeps vertical working).
// LEGAL: nothing from the famous web-slinging hero (no red-and-blue, no web pattern, no wrist shooters). All props cute, never gross.
//
// KITCHEN FEAST (line 28 "nine eggs and all of Dev's sandwiches"; draw on home3(g,t,cam,{room:'kitchen', plate:0}) table: pos.tableX/tableTop)
//   eggs(g, x, y, s, { eaten: 0..9 (float: the next egg shrinks away), t })   9 boiled eggs in a carton-tray, shells pile up on the side
//   sandwiches(g, x, y, s, { left: 0..6 (float), t, bite: 0..1 })   Dev's stack of triangle sandwiches on a plate, crumbs where they were
//   feast(g, t, x, y, s, { eggs, left, mess: 0..1 })   eggs + sandwiches + crumbs + an empty juice glass, centred on (x, y = table top)
// THE BURGER GAG (lines 43-45)
//   burger(g, x, y, s, { t, look: 0..1 (two googly eyes open on the top bun and stare), blink, sweat: 0..1, wobble })
//   milkshake(g, x, y, s, { t, level: 1..0, sip: 0..1 (straw bubbles + "slurp" wiggle), cherry: true })
// WATER BALLOON (line 29)
//   waterBalloon(g, x, y, s, { t, color, wobble: 0..1, rot })   a jiggly teardrop with a knot + shine
//   splash(g, t, x, y, { at, s, color, dir: -1..1 (sideways throw) })   pop at `at`: rubber shreds, a burst ring, droplets on arcs, a puddle
//   balloonArc(t, { from:[x,y], to:[x,y], at, dur, h }) -> { x, y, rot, k, done }   a lob for the balloon (pop when done)
// DEV'S PHONE FILMING UI (lines 23, 42)
//   devPhone(g, t, { x, y, s, rot, at, sec0, zoom: 1.., hearts: 0..1, tag: 'DEV CAM', focusX, focusY }, (g, w, h) => content)
//       home3 filmPhone + a zoom pill, a little "DEV CAM" sticker, hearts floating up (he's never been happier), a zoom pinch on `zoom`
// THE FENCE JUMP (lines 36, 42)
//   fence(g, x, gy, { w, h, s, t, wobble: 0..1 (shakes after the landing), boards })   a wooden garden fence section
//   fenceJump(t, { from:[x,gy], to:[x,top], at, dur, s }) -> { x, y, pose, k, landed }   crouch -> launch -> arc -> land, crouch on touch-down
//   bodyLength(g, x, gy, len, { k: 0..1 (tape pulls out), label: '1 BODY LENGTH', s, h })   Dev's tape + a stamped label
// REALITY-CHECK LAB MONTAGE (lines 54-55; facts as sources.md: 70 kg climber, 3.7 m of vertical glass, hand pads; lab silk weaker)
//   lab(g, t, cam, { mood })   a clean bright lab wall + bench (a backdrop for the montage; layer depths 0.5 / 1)
//   glassWall(g, t, x, gy, { s, h: px for 3.7 m, marks: true, climb: 0..1, climber: outfit, label })   a tall glass panel in a frame with
//       height marks (0-4 m), a climber in a harness going up with two hand pads (alternating reaches), a safety rope to the top.
//       Returns { hx, hy } (climber's head).
//   handPad(g, x, y, s, { press: 0..1, t, detail: 0..1 })   a close-up of a gecko-style pad: a grey tile with a micro-wedge texture
//       that flattens under `press`, a strap, a glint (no logos)
//   silkSpool(g, t, x, y, s, { spin, draw: 0..1 (a fibre pulled from the syringe nozzle onto the spool), label })   a lab syringe + bath +
//       a spool winding pale golden fibre
// DAY CARDS
//   dayCard(g, t, { day: 1..7, title: 'THE WALL', at, x, y, s, week: true })   a chunky paper card: "DAY 3" + the chapter title, a 7-dot
//       week strip (past days ticked, today pulsing), pops in at `at` with a little bounce
//   weekStrip(g, t, x, y, s, day)   just the 7 dots
// Deterministic (t, rng). Cast via sets/actors.js (climber = a background outfit, never a cast colour).
import { E, V, S, layer, rr, seg, circle, ring, poly, linGrad, radGrad, glow, alpha, shade, mix, rng, noise, clamp, lerp, ease, prog, text, FONTS } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { POSES, blendPose } from '/engine/rig2d.js';
import { actor } from './actors.js';
import { filmPhone } from './home3.js';

const INK = '#1a1622', CREAM = '#f4efe6', ui = () => S().ui;
const outline = (g, w = 4) => { g.strokeStyle = INK; g.lineWidth = w; g.lineJoin = 'round'; g.stroke(); };

// =====================================================================================================
// KITCHEN FEAST
// =====================================================================================================
function egg(g, x, y, s, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  g.beginPath(); g.ellipse(0, -22, 18, 24, 0, 0, 7); g.fillStyle = '#f6efe2'; g.fill(); outline(g, 3);
  g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.ellipse(-6, -32, 5, 8, -0.3, 0, 7); g.fill();
  g.restore();
}
function shell(g, x, y, s, rot) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s); g.fillStyle = '#f2e8d6'; g.beginPath(); g.moveTo(-10, 0); g.lineTo(-6, -8); g.lineTo(-1, -3); g.lineTo(4, -10); g.lineTo(10, 0); g.closePath(); g.fill(); g.strokeStyle = alpha(INK, 0.5); g.lineWidth = 1.5; g.stroke(); g.restore(); }
export function eggs(g, x, y, s = 1, o = {}) {
  const eaten = clamp(o.eaten ?? 0, 0, 9), t = o.t ?? 0;
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(0, 6, 190, 18, 0, 0, 7); g.fill();
  rr(g, -180, -24, 360, 30, 8); g.fillStyle = '#c8b494'; g.fill(); outline(g, 3);                                          // the cardboard tray
  for (let i = 0; i < 9; i++) { const ex = -160 + i * 40, k = clamp(eaten - i); seg(g, [[ex - 14, -20], [ex + 14, -20]], 4, shade('#c8b494', -0.2)); if (k >= 1) continue; egg(g, ex, -18 + noise(t * 2, i) * (k > 0 ? 3 : 0.6), 1 - 0.85 * ease.in(k), k * 0.4); }
  const R = rng(9), n = Math.floor(eaten * 4); for (let i = 0; i < n; i++) shell(g, 220 + R() * 90, -4 - R() * 18 * (1 + i / 30), 0.9 + R() * 0.5, R() * 6);   // shell pile on the right
  g.restore();
}
function sandwich(g, x, y, s, rot = 0, bite = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  const tri = () => { g.beginPath(); g.moveTo(-50, 0); g.lineTo(50, 0); g.lineTo(0, -62); g.closePath(); };
  if (bite > 0) { g.beginPath(); g.rect(-70, -80, 140, 100); g.arc(0, -62, 26 * bite, 0, 7, true); g.clip(); }
  tri(); g.fillStyle = '#e8c890'; g.fill(); outline(g, 3);
  g.save(); tri(); g.clip(); g.fillStyle = '#7ab84a'; g.fillRect(-54, -14, 108, 6); g.fillStyle = '#e86a7a'; g.fillRect(-54, -8, 108, 5); g.fillStyle = '#f6e2a0'; g.fillRect(-54, -3, 108, 4); g.restore();
  g.beginPath(); g.moveTo(-36, -6); g.lineTo(36, -6); g.lineTo(0, -50); g.closePath(); g.fillStyle = alpha('#fff4dc', 0.6); g.fill();
  g.restore();
}
export function sandwiches(g, x, y, s = 1, o = {}) {
  const left = clamp(o.left ?? 6, 0, 6), t = o.t ?? 0;
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(0, 4, 150, 16, 0, 0, 7); g.fill();
  g.beginPath(); g.ellipse(0, 0, 140, 22, 0, 0, 7); g.fillStyle = '#f4f2f6'; g.fill(); outline(g, 3); g.beginPath(); g.ellipse(0, -2, 104, 14, 0, 0, 7); g.strokeStyle = alpha('#9aa0b8', 0.6); g.lineWidth = 2; g.stroke();
  const n = Math.ceil(left), frac = left - Math.floor(left);
  for (let i = 0; i < n; i++) { const top = i === n - 1, k = top && frac > 0 ? frac : 1; sandwich(g, (i % 2 ? 18 : -18), -8 - i * 16, (0.95 + 0.05 * k) * (top ? 0.3 + 0.7 * k : 1), (i % 2 ? 0.08 : -0.06), top ? clamp(o.bite ?? (1 - k)) : 0); }
  if (left < 6) { const R = rng(3); for (let i = 0; i < Math.round((6 - left) * 6); i++) circle(g, (R() - 0.5) * 200, -6 + (R() - 0.5) * 18, 2 + R() * 3, '#d8b070'); }   // crumbs
  g.restore();
}
export function feast(g, t, x, y, s = 1, o = {}) {
  eggs(g, x - 230 * s, y, 0.8 * s, { eaten: o.eggs ?? 0, t });
  sandwiches(g, x + 170 * s, y, 0.85 * s, { left: o.left ?? 6, t });
  rr(g, x - 20 * s, y - 80 * s, 46 * s, 76 * s, 8 * s); g.fillStyle = alpha('#ffe9a8', 0.35); g.fill(); g.strokeStyle = alpha('#ffffff', 0.7); g.lineWidth = 3; g.stroke();   // an empty juice glass
  g.fillStyle = alpha('#ffb43a', 0.5); g.fillRect(x - 16 * s, y - 16 * s, 38 * s, 10 * s * (1 - clamp(o.mess ?? 0)));
  const R = rng(17), m = clamp(o.mess ?? 0); for (let i = 0; i < Math.round(28 * m); i++) circle(g, x + (R() - 0.5) * 640 * s, y - 2 - R() * 6, (2 + R() * 3) * s, ['#d8b070', '#f2e8d6', '#7ab84a'][i % 3]);
}

// =====================================================================================================
// BURGER vs MILKSHAKE
// =====================================================================================================
export function burger(g, x, y, s = 1, o = {}) {
  const t = o.t ?? 0, look = clamp(o.look ?? 0), wob = (o.wobble ?? 0) * Math.sin(t * 9) * 0.04;
  g.save(); g.translate(x, y); g.scale(s * (1 + wob), s * (1 - wob));
  g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(0, 4, 120, 14, 0, 0, 7); g.fill();
  rr(g, -104, -40, 208, 40, 18); g.fillStyle = '#d89a4a'; g.fill(); outline(g);                                            // bottom bun
  rr(g, -112, -62, 224, 26, 12); g.fillStyle = '#7a4a2a'; g.fill(); outline(g);                                             // patty
  g.fillStyle = '#f2c230'; g.beginPath(); g.moveTo(-108, -64); for (let i = 0; i <= 6; i++) g.lineTo(-108 + i * 36, -64 + (i % 2 ? 18 : 0)); g.lineTo(108, -70); g.lineTo(-108, -70); g.closePath(); g.fill();   // cheese drips
  g.fillStyle = '#6ac04a'; g.beginPath(); g.moveTo(-118, -70); for (let i = 0; i <= 12; i++) g.lineTo(-118 + i * 19.6, -70 + (i % 2 ? 9 : -2)); g.lineTo(118, -80); g.lineTo(-118, -80); g.closePath(); g.fill();   // lettuce
  g.beginPath(); g.moveTo(-112, -78); g.quadraticCurveTo(-110, -168, 0, -170); g.quadraticCurveTo(110, -168, 112, -78); g.closePath(); g.fillStyle = '#e0a050'; g.fill(); outline(g);   // top bun
  g.fillStyle = alpha('#fff', 0.25); g.beginPath(); g.ellipse(-44, -138, 34, 14, -0.3, 0, 7); g.fill();
  const R = rng(5); for (let i = 0; i < 9; i++) { g.save(); g.translate(-70 + R() * 140, -150 + R() * 54); g.rotate(R() * 3); g.fillStyle = '#fff4d8'; g.beginPath(); g.ellipse(0, 0, 5, 2.6, 0, 0, 7); g.fill(); g.restore(); }   // sesame
  if (look > 0.01) {                                                                                                      // the burger looks at you (cute googly eyes)
    const bl = o.blink ? 0.1 : 1, lx = Math.sin(t * 0.8) * 2;
    for (const ex of [-34, 34]) { g.save(); g.translate(ex, -122); g.scale(look, look); circle(g, 0, 0, 24, '#ffffff'); g.lineWidth = 3; g.strokeStyle = INK; g.beginPath(); g.arc(0, 0, 24, 0, 7); g.stroke(); g.save(); g.scale(1, bl); circle(g, lx + 3, 4, 11, INK); circle(g, lx + 7, 0, 3.5, '#fff'); g.restore(); g.restore(); }
  }
  if ((o.sweat ?? 0) > 0.02) { const k = o.sweat; g.fillStyle = alpha('#a8dcff', 0.9 * k); g.beginPath(); g.moveTo(84, -150); g.quadraticCurveTo(98, -124, 84, -116); g.quadraticCurveTo(70, -124, 84, -150); g.fill(); }
  g.restore();
}
export function milkshake(g, x, y, s = 1, o = {}) {
  const t = o.t ?? 0, lv = clamp(o.level ?? 1), sip = clamp(o.sip ?? 0), wig = sip * Math.sin(t * 22) * 2;
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(0, 4, 70, 10, 0, 0, 7); g.fill();
  const glass = () => { g.beginPath(); g.moveTo(-60, -260); g.lineTo(60, -260); g.lineTo(40, -20); g.lineTo(-40, -20); g.closePath(); };
  g.save(); glass(); g.clip(); const top = lerp(-20, -250, lv); g.fillStyle = linGrad(g, 0, top, 0, -20, ['#ffb6c8', '#f08aa8']); g.fillRect(-70, top + wig, 140, 260);
  if (sip > 0) for (let i = 0; i < 5; i++) { const u = (t * 2 + i / 5) % 1; circle(g, 12 + Math.sin(i * 3) * 8, lerp(-24, top, u), 3 + i % 2 * 2, alpha('#fff', 0.6 * (1 - u))); } g.restore();
  glass(); g.fillStyle = alpha('#ffffff', 0.18); g.fill(); outline(g); g.fillStyle = alpha('#fff', 0.35); g.fillRect(-46, -240, 8, 200);
  rr(g, -22, -20, 44, 14, 4); g.fillStyle = '#e8eaf0'; g.fill(); outline(g, 3); rr(g, -46, -8, 92, 10, 5); g.fillStyle = '#e8eaf0'; g.fill(); outline(g, 3);   // stem + foot
  if (lv > 0.85) { for (const [cx, cy, r] of [[-30, -264, 26], [4, -276, 30], [34, -262, 24], [0, -296, 22]]) { circle(g, cx, cy, r, '#fffaf2'); } g.beginPath(); g.arc(0, -276, 50, Math.PI * 1.05, Math.PI * 1.95); g.strokeStyle = alpha(INK, 0.2); g.lineWidth = 2; g.stroke(); }
  if ((o.cherry ?? true) && lv > 0.85) { circle(g, 8, -322, 16, '#d4262e'); circle(g, 3, -327, 4, alpha('#fff', 0.7)); seg(g, [[10, -336], [22, -362]], 3, '#4a7a2a'); }
  seg(g, [[26, -150], [52 + wig, -340]], 11, '#ffffff'); for (let i = 0; i < 6; i++) { const u = i / 6; seg(g, [[lerp(26, 52, u), lerp(-150, -340, u)], [lerp(26, 52, u + 0.08), lerp(-150, -340, u + 0.08)]], 11, '#e84a7a'); }   // striped straw
  if (sip > 0.3) text(g, 'slurp', 92, -330 + wig * 2, { size: 30, color: '#e84a7a', font: FONTS.title, weight: 700, alpha: (sip - 0.3) / 0.7, stroke: 5, strokeColor: CREAM });
  g.restore();
}

// =====================================================================================================
// WATER BALLOON + SPLASH
// =====================================================================================================
export function waterBalloon(g, x, y, s = 1, o = {}) {
  const t = o.t ?? 0, c = o.color || '#4ab0e8', w = (o.wobble ?? 0.5) * Math.sin(t * 11) * 0.07;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? 0); g.scale(s * (1 + w), s * (1 - w));
  g.beginPath(); g.moveTo(0, 40); g.bezierCurveTo(44, 36, 52, -30, 0, -48); g.bezierCurveTo(-52, -30, -44, 36, 0, 40); g.fillStyle = radGrad(g, -12, -16, 4, 60, [shade(c, 0.4), c, shade(c, -0.25)]); g.fill(); outline(g, 3);
  g.fillStyle = alpha('#fff', 0.65); g.beginPath(); g.ellipse(-16, -22, 7, 13, -0.4, 0, 7); g.fill();
  poly(g, [[-6, 40], [6, 40], [0, 52]], shade(c, -0.3)); seg(g, [[0, 52], [4, 60], [-2, 66]], 3, shade(c, -0.3));
  g.restore();
}
export function balloonArc(t, o = {}) {
  const [x0, y0] = o.from || [0, 0], [x1, y1] = o.to || [E.W / 2, E.H / 2], at = o.at ?? 0, dur = o.dur ?? 0.8, k = clamp((t - at) / dur);
  return { x: lerp(x0, x1, k), y: lerp(y0, y1, k) - Math.sin(k * Math.PI) * (o.h ?? 220), rot: (x1 > x0 ? 1 : -1) * k * 4, k, done: t >= at + dur };
}
export function splash(g, t, x, y, o = {}) {
  const u = t - (o.at ?? 0), s = o.s ?? 1, c = o.color || '#4ab0e8', dir = o.dir ?? 0; if (u < 0) return;
  const R = rng(o.seed ?? 21);
  // the puddle, growing then settling
  const pk = ease.out(clamp(u / 0.5)); g.fillStyle = alpha(shade(c, 0.2), 0.55 * (1 - clamp((u - 2) / 1.5) * 0.5)); g.beginPath(); g.ellipse(x + dir * 30 * s, y + 6 * s, 150 * s * pk, 24 * s * pk, 0, 0, 7); g.fill();
  g.fillStyle = alpha('#fff', 0.4 * pk); g.beginPath(); g.ellipse(x + dir * 30 * s - 50 * s, y + 2 * s, 30 * s * pk, 5 * s * pk, 0, 0, 7); g.fill();
  if (u < 0.22) { const k = u / 0.22; ring(g, x, y - 30 * s, (30 + 120 * k) * s, 10 * (1 - k) * s + 1, alpha('#ffffff', 0.85 * (1 - k))); circle(g, x, y - 30 * s, 50 * s * (1 - k), alpha(shade(c, 0.4), 0.8)); }
  for (let i = 0; i < 26; i++) {                                                                                           // droplets on arcs
    const a = -Math.PI * (0.08 + R() * 0.84) + dir * 0.3, v = (300 + R() * 520) * s, life = 0.45 + R() * 0.45; if (u > life) { R(); continue; }
    const px = x + Math.cos(a) * v * u, py = y - 30 * s + Math.sin(a) * v * u + 1400 * s * u * u, r = (4 + R() * 9) * s * (1 - u / life * 0.5);
    g.fillStyle = alpha(i % 4 ? shade(c, 0.3) : '#ffffff', 0.9); g.beginPath(); g.ellipse(px, py, r, r * 1.25, a + Math.PI / 2, 0, 7); g.fill();
  }
  for (let i = 0; i < 4; i++) { const a = -Math.PI * (0.2 + i * 0.2), v = (380 + i * 60) * s, uu = Math.min(u, 0.5); if (u > 1.2) continue;   // rubber shreds
    g.save(); g.translate(x + Math.cos(a) * v * uu, y - 30 * s + Math.sin(a) * v * uu + 900 * s * uu * uu); g.rotate(u * 14 + i); g.globalAlpha *= 1 - clamp((u - 0.8) / 0.4); poly(g, [[-10 * s, -4 * s], [12 * s, -6 * s], [6 * s, 6 * s]], shade(c, -0.15)); g.restore(); }
}

// =====================================================================================================
// DEV'S PHONE
// =====================================================================================================
export function devPhone(g, t, o = {}, content) {
  const zoom = o.zoom ?? 1, x = o.x ?? E.W / 2, y = o.y ?? E.H / 2, s = o.s ?? 1;
  filmPhone(g, t, o, content ? (g, w, h) => { g.save(); g.translate(w * (o.focusX ?? 0.5), h * (o.focusY ?? 0.5)); g.scale(zoom, zoom); g.translate(-w * (o.focusX ?? 0.5), -h * (o.focusY ?? 0.5)); content(g, w, h); g.restore(); } : null);
  g.save(); g.translate(x, y); g.rotate(o.rot ?? 0); g.scale(s, s);
  rr(g, -60, 120, 120, 40, 20); g.fillStyle = 'rgba(0,0,0,.55)'; g.fill(); text(g, `${zoom.toFixed(1)}×`, 0, 141, { size: 24, color: zoom > 1.05 ? ui().gold : '#ffffff', font: FONTS.ui, weight: 900 });
  g.save(); g.translate(-300, 150); g.rotate(-0.08); rr(g, -74, -22, 148, 44, 10); g.fillStyle = '#f08a24'; g.fill(); outline(g, 3); text(g, o.tag || 'DEV CAM', 0, 2, { size: 24, color: '#1a1020', font: FONTS.ui, weight: 900, spacing: 2 }); g.restore();
  const hk = clamp(o.hearts ?? 0); if (hk > 0) { const R = rng(41); for (let i = 0; i < Math.round(10 * hk); i++) { const u = (t * 0.6 + R()) % 1, hx = 300 + (R() - 0.5) * 80 + Math.sin(t * 2 + i) * 14, hy = 150 - u * 330, sz = 14 + R() * 12; g.save(); g.translate(hx, hy); g.globalAlpha *= (1 - u) * hk; g.fillStyle = i % 3 ? '#ff5a7a' : '#ffd23a'; g.beginPath(); g.moveTo(0, sz * 0.4); g.bezierCurveTo(-sz, -sz * 0.3, -sz * 0.4, -sz, 0, -sz * 0.4); g.bezierCurveTo(sz * 0.4, -sz, sz, -sz * 0.3, 0, sz * 0.4); g.fill(); g.restore(); } }
  g.restore();
}

// =====================================================================================================
// FENCE + JUMP + MEASURE
// =====================================================================================================
export function fence(g, x, gy, o = {}) {
  const s = o.s ?? 1, w = (o.w ?? 600) * s, h = (o.h ?? 300) * s, n = o.boards ?? Math.round(w / (64 * s)), bw = w / n, t = o.t ?? 0, wb = clamp(o.wobble ?? 0);
  const R = rng(o.seed ?? 4);
  for (const ry of [0.22, 0.72]) { rr(g, x, gy - h * ry - 12 * s, w, 22 * s, 4); g.fillStyle = '#7a5434'; g.fill(); }        // rails
  for (let i = 0; i < n; i++) { const bx = x + i * bw, bh = h * (0.96 + R() * 0.06), sh = wb * Math.sin(t * 30 + i) * 3 * s * Math.exp(-i * 0.1);
    g.beginPath(); g.moveTo(bx + 3 + sh, gy); g.lineTo(bx + 3 + sh, gy - bh + 14 * s); g.lineTo(bx + bw / 2 + sh, gy - bh); g.lineTo(bx + bw - 3 + sh, gy - bh + 14 * s); g.lineTo(bx + bw - 3 + sh, gy); g.closePath();
    g.fillStyle = mix('#b4824e', '#9a6a3e', R()); g.fill(); g.strokeStyle = alpha(INK, 0.45); g.lineWidth = 2; g.stroke();
    for (let k = 0; k < 2; k++) { const gx = bx + bw * (0.3 + R() * 0.4); seg(g, [[gx, gy - bh * (0.2 + R() * 0.3)], [gx + 2, gy - bh * (0.5 + R() * 0.3)]], 1.5, alpha('#5a3a20', 0.4)); }
    circle(g, bx + bw / 2 + sh, gy - h * 0.22, 2.5 * s, '#4a3424'); circle(g, bx + bw / 2 + sh, gy - h * 0.72, 2.5 * s, '#4a3424'); }
  return { top: gy - h, x0: x, x1: x + w };
}
export function fenceJump(t, o = {}) {
  const [x0, y0] = o.from || [0, 0], [x1, y1] = o.to || [300, -300], at = o.at ?? 0, dur = o.dur ?? 0.7;
  const u = t - at, crouchT = 0.25, k = clamp(u / dur);
  let pose, x, y, landed = false;
  if (u < 0) { x = x0; y = y0; pose = POSES.stand; }
  else if (u < crouchT) { x = x0; y = y0; pose = blendPose('stand', 'crouch', u / crouchT); }
  else if (u < crouchT + dur) { const kk = clamp((u - crouchT) / dur); x = lerp(x0, x1, ease.inOut(kk)); y = lerp(y0, y1, kk) - Math.sin(kk * Math.PI) * (o.h ?? 160); pose = kk < 0.75 ? blendPose('jump', 'crouch', clamp((kk - 0.45) / 0.3)) : POSES.crouch; }
  else { landed = true; x = x1; y = y1; pose = blendPose('crouch', 'stand', clamp((u - crouchT - dur) / 0.35)); }
  return { x, y, pose, k, landed };
}
export function bodyLength(g, x, gy, len, o = {}) {
  const s = o.s ?? 1, k = ease.out(clamp(o.k ?? 1)), h = (o.h ?? 40) * s, L = len * k;
  rr(g, x - 30 * s, gy - h - 26 * s, 56 * s, 56 * s, 10 * s); g.fillStyle = '#f2c230'; g.fill(); outline(g, 3); circle(g, x - 2 * s, gy - h + 2 * s, 12 * s, '#2a2230');
  rr(g, x + 22 * s, gy - h - 6 * s, L, 18 * s, 2); g.fillStyle = '#f6e27a'; g.fill(); g.strokeStyle = alpha(INK, 0.6); g.lineWidth = 2; g.stroke();
  for (let i = 0; i * 20 * s < L; i++) seg(g, [[x + 22 * s + i * 20 * s, gy - h - 6 * s], [x + 22 * s + i * 20 * s, gy - h - 6 * s + (i % 5 ? 6 : 12) * s]], 1.5, INK);
  const lk = ease.outBack(prog(o.k ?? 1, 0.85, 1)); if (lk > 0 && o.label !== '') { g.save(); g.translate(x + 22 * s + L / 2, gy - h - 70 * s); g.rotate(-0.05); g.scale(lk, lk); rr(g, -150 * s, -30 * s, 300 * s, 60 * s, 10 * s); g.fillStyle = CREAM; g.fill(); outline(g, 4); text(g, o.label || '1 BODY LENGTH', 0, 2 * s, { size: 30 * s, color: '#1a1020', font: FONTS.ui, weight: 900, spacing: 2 }); g.restore(); }
}

// =====================================================================================================
// REALITY-CHECK LAB
// =====================================================================================================
export const labGround = () => E.H * V(0.84, 0.74);
export function lab(g, t, cam, o = {}) {
  const GY = labGround(), CX = E.W / 2;
  layer(g, cam, 0.5, (g) => {
    g.fillStyle = linGrad(g, 0, -E.H, 0, GY, ['#dfe8ee', '#c8d4dc']); g.fillRect(-E.W, -E.H, E.W * 3, GY + E.H);
    for (let x = -E.W; x < E.W * 2; x += 240) seg(g, [[x, -E.H], [x, GY]], 3, alpha('#9aaab8', 0.4));
    for (let i = 0; i < 3; i++) { const lx = CX - 700 + i * 700; rr(g, lx - 160, 40, 320, 26, 8); g.fillStyle = '#f8fcff'; g.fill(); glow(g, lx, 60, 420, '#ffffff', 0.25); }   // ceiling light panels
    rr(g, CX + 420, GY - 640, 300, 200, 8); g.fillStyle = '#f4f6f8'; g.fill(); g.strokeStyle = '#9aaab8'; g.lineWidth = 4; g.stroke();     // a whiteboard with doodles
    g.strokeStyle = alpha('#2f6fd0', 0.6); g.lineWidth = 3; g.beginPath(); g.moveTo(CX + 450, GY - 480); g.quadraticCurveTo(CX + 520, GY - 600, CX + 600, GY - 520); g.lineTo(CX + 690, GY - 600); g.stroke();
  });
  layer(g, cam, 0.9, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, GY + 400, ['#a8b4bc', '#7a868e']); g.fillRect(-E.W, GY, E.W * 3, 600); });
  layer(g, cam, 1, (g) => {
    rr(g, CX - 900, GY - 300, 520, 26, 6); g.fillStyle = '#e8ecf0'; g.fill(); outline(g, 3); g.fillStyle = '#5a6670'; g.fillRect(CX - 880, GY - 274, 20, 274); g.fillRect(CX - 420, GY - 274, 20, 274);   // bench
    for (let i = 0; i < 3; i++) { rr(g, CX - 860 + i * 70, GY - 380, 40, 80, 6); g.fillStyle = alpha(['#7ac8f0', '#f0d27a', '#a8e0a8'][i], 0.6); g.fill(); outline(g, 3); }
  });
  return { GY, CX };
}
const CLIMBER = { top: 'tshirt', color: '#4a6a8a', legs: '#2a2a38', head: 'cap', headColor: '#e8e8e8' };
function climbPose(ph) {                                                                                                  // alternate reaches up a wall (faces +x = the glass)
  const a = Math.sin(ph), b = Math.cos(ph);
  return { head: [10, -210], sh: [6, -176], hip: [0, -100], eF: [26, -206 - a * 10], hF: [34, -250 - a * 26], eB: [20, -190 + a * 10], hB: [30, -226 + a * 26], kF: [30, -64 + b * 12], fF: [24, -10 + b * 14], kB: [22, -50 - b * 12], fB: [26, 0 - b * 14] };
}
export function glassWall(g, t, x, gy, o = {}) {
  const s = o.s ?? 1, H = o.h ?? 600, W = 260 * s, top = gy - H, climb = clamp(o.climb ?? 0.5);
  // the glass panel in a steel frame + safety rope + height marks
  rr(g, x - 14, top - 30, W + 28, H + 30, 6); g.fillStyle = '#5a6670'; g.fill();
  g.fillStyle = linGrad(g, x, 0, x + W, 0, [alpha('#d8f0ff', 0.55), alpha('#ffffff', 0.25), alpha('#c8e4f4', 0.5)]); g.fillRect(x, top, W, H);
  g.fillStyle = alpha('#ffffff', 0.35); g.beginPath(); g.moveTo(x + W * 0.15, top); g.lineTo(x + W * 0.32, top); g.lineTo(x + W * 0.05, gy); g.lineTo(x, gy); g.lineTo(x, top + H * 0.2); g.closePath(); g.fill();
  if (o.marks !== false) for (let m = 0; m <= 4; m++) { const my = gy - H * m / 3.7; if (my < top - 2) break; seg(g, [[x + W + 14, my], [x + W + 36, my]], 3, '#2a3038'); text(g, `${m} m`, x + W + 44, my, { size: 22 * s, color: '#2a3038', font: FONTS.ui, weight: 900, align: 'left' }); }
  // climber: hand pads alternate; body slides up with each pull
  const ph = climb * Math.PI * 10, py = lerp(gy - 10, top + 330 * s * H / 700, climb) - Math.max(0, Math.sin(ph)) * 8, px = x + W * 0.5 - 30 * s, pose = climbPose(ph), cs = s * 1.6 * H / 700;
  seg(g, [[px + 10 * cs, py - 120 * cs], [x + W / 2, top - 30]], 2.5, '#d4262e');                                             // safety rope
  actor(g, o.climber || CLIMBER, { x: px, y: py, s: cs, facing: 1, pose, expr: 'determined', look: [0.6, -0.8], rim: false, t });
  for (const [hx, hy] of [pose.hF, pose.hB]) { const sx = px + hx * cs, sy = py + hy * cs; rr(g, sx - 4 * cs, sy - 18 * cs, 24 * cs, 34 * cs, 4 * cs); g.fillStyle = '#7a8088'; g.fill(); outline(g, 2.5); }   // the hand pads on the glass
  if (o.label) text(g, o.label, x + W / 2, top - 70 * s, { size: 30 * s, color: '#1a1020', font: FONTS.ui, weight: 900, spacing: 2 });
  return { hx: px + pose.head[0] * cs, hy: py + pose.head[1] * cs };
}
export function handPad(g, x, y, s = 1, o = {}) {
  const pr = clamp(o.press ?? 0), d = clamp(o.detail ?? 1), t = o.t ?? 0;
  g.save(); g.translate(x, y); g.scale(s, s);
  rr(g, -220, -150, 440, 300, 30); g.fillStyle = '#4a4e58'; g.fill(); outline(g, 5);                                         // the backing plate
  rr(g, -200, -130, 400, 260, 20); g.fillStyle = '#9aa0aa'; g.fill();
  g.save(); rr(g, -200, -130, 400, 260, 20); g.clip();
  for (let r = 0; r < 13; r++) for (let c = 0; c < 22; c++) { const wx = -196 + c * 18.5, wy = -126 + r * 20, lean = lerp(0, 1, pr);   // micro-wedges, they lie flat under load
    g.fillStyle = alpha('#d8dce4', 0.7 * d); g.beginPath(); g.moveTo(wx, wy + 16); g.lineTo(wx + 6 + lean * 8, wy + 16 - 14 * (1 - lean * 0.75)); g.lineTo(wx + 10, wy + 16); g.closePath(); g.fill(); }
  g.fillStyle = alpha('#ffffff', 0.25 + 0.15 * Math.sin(t * 2)); g.beginPath(); g.moveTo(-200, -130); g.lineTo(-60, -130); g.lineTo(-180, 130); g.lineTo(-200, 130); g.closePath(); g.fill(); g.restore();
  rr(g, -80, -190, 160, 50, 12); g.fillStyle = '#2a2e38'; g.fill(); outline(g, 4); rr(g, -60, 140, 120, 60, 12); g.fillStyle = '#2a2e38'; g.fill(); outline(g, 4);   // strap
  g.restore();
}
export function silkSpool(g, t, x, y, s = 1, o = {}) {
  const dr = clamp(o.draw ?? 1), spin = (o.spin ?? 1) * t * 4;
  g.save(); g.translate(x, y); g.scale(s, s);
  // syringe pump (left), a little bath, the spool on a motor (right)
  rr(g, -420, -60, 220, 60, 10); g.fillStyle = alpha('#e8f4ff', 0.75); g.fill(); outline(g, 4); g.fillStyle = alpha('#f6e6a8', 0.8); g.fillRect(-410, -50, 160 - 40 * dr, 40);
  rr(g, -470, -48, 54, 36, 6); g.fillStyle = '#5a6670'; g.fill(); seg(g, [[-200, -30], [-160, -30]], 6, '#9aa0aa');           // plunger + nozzle
  rr(g, -150, -10, 200, 70, 12); g.fillStyle = alpha('#7ac8f0', 0.45); g.fill(); outline(g, 4); g.fillStyle = alpha('#ffffff', 0.35); g.fillRect(-140, -2, 180, 8);   // the bath
  const fx = -50 + 0, path = [[-160, -30], [-120, 18], [-20, 22], [60, -40], [200 - 10, -70]];
  const L = Math.max(2, Math.ceil(path.length * dr)); seg(g, path.slice(0, L), 3, '#f2dc9a'); seg(g, path.slice(0, L), 1.2, alpha('#ffffff', 0.8));
  g.save(); g.translate(240, -70); circle(g, 0, 0, 74, '#3a3e48'); outline(g, 4);
  circle(g, 0, 0, 60, mix('#c8a85a', '#f2dc9a', 0.5)); for (let i = 0; i < 10; i++) { g.strokeStyle = alpha('#fff4c8', 0.5); g.lineWidth = 1.5; g.beginPath(); g.arc(0, 0, 30 + i * 3, spin + i, spin + i + 2); g.stroke(); }
  circle(g, 0, 0, 22, '#2a2e38'); for (let i = 0; i < 3; i++) { const a = spin + i * 2.09; seg(g, [[0, 0], [Math.cos(a) * 18, Math.sin(a) * 18]], 4, '#9aa0aa'); } g.restore();
  rr(g, 190, 10, 100, 70, 8); g.fillStyle = '#5a6670'; g.fill(); outline(g, 3);
  if (o.label !== '') { g.save(); g.translate(-40, 120); g.rotate(-0.03); rr(g, -150, -26, 300, 52, 8); g.fillStyle = CREAM; g.fill(); outline(g, 3); text(g, o.label || 'LAB-MADE SILK', 0, 2, { size: 26, color: '#1a1020', font: FONTS.ui, weight: 900, spacing: 2 }); g.restore(); }
  g.restore();
}

// =====================================================================================================
// DAY CARDS
// =====================================================================================================
export function weekStrip(g, t, x, y, s, day) {
  for (let d = 1; d <= 7; d++) { const dx = x + (d - 4) * 46 * s, cur = d === day, past = d < day, p = cur ? 1 + 0.15 * Math.sin(t * 5) : 1;
    circle(g, dx, y, 15 * s * p, cur ? ui().gold : past ? '#7a6a8a' : '#e8e0d0'); g.lineWidth = 3; g.strokeStyle = INK; g.beginPath(); g.arc(dx, y, 15 * s * p, 0, 7); g.stroke();
    if (past) seg(g, [[dx - 7 * s, y], [dx - 2 * s, y + 6 * s], [dx + 8 * s, y - 6 * s]], 3.5 * s, CREAM); }
}
export function dayCard(g, t, o = {}) {
  const day = o.day ?? 1, x = o.x ?? E.W / 2, y = o.y ?? E.H * 0.42, s = o.s ?? 1, at = o.at ?? 0, pop = ease.outBack(prog(t, at, at + 0.45)); if (pop <= 0.01) return;
  const W = 620, H = 300, tk = ease.out(prog(t, at + 0.25, at + 0.7));
  g.save(); g.translate(x, y); g.rotate(-0.025 + 0.004 * Math.sin(t * 1.3)); g.scale(s * pop, s * pop);
  glow(g, 0, 0, 600, ui().gold, 0.12);
  rr(g, -W / 2 + 10, -H / 2 + 14, W, H, 26); g.fillStyle = 'rgba(0,0,0,.35)'; g.fill();
  rr(g, -W / 2, -H / 2, W, H, 26); g.fillStyle = linGrad(g, 0, -H / 2, 0, H / 2, ['#fbf6ea', '#ece2cc']); g.fill(); outline(g, 6);
  for (let i = 0; i < 2; i++) { g.save(); g.translate(i ? W / 2 - 60 : -W / 2 + 60, -H / 2 + 4); g.rotate(i ? 0.5 : -0.5); g.fillStyle = alpha('#f2e2a0', 0.85); g.fillRect(-46, -14, 92, 28); g.restore(); }   // tape corners
  text(g, `DAY ${day}`, 0, -40, { size: 120, color: '#1a1020', font: FONTS.title, weight: 700, spacing: 6 });
  if (o.title) text(g, o.title, 0, 50, { size: 46, color: '#7a4bb3', font: FONTS.title, weight: 700, alpha: tk, spacing: 3 });
  if (o.week !== false) weekStrip(g, t, 0, 112, 1, day);
  g.restore();
}
