// sets/micro.js — the ANT-SCALE world for "What If You Shrank to the Size of an Ant?" (9:16, bright classic I.Awaken look).
//   grassWorld(g, t, cam, { sun, sneaker, dew, sway })   giant grass forest at golden hour: sky + bokeh (0.08), far blades (0.3),
//        mid blades + daisy + crumb boulder + bottle cap (0.6), soil + pebbles + dew drop (0.9). Returns { GY, CX, M, rim }
//   grassFg(g, t, cam)                                     blurred near blades (1.6) after characters
//   rooftop(g, t, cam, { gust })                            ant-scale parapet top over the golden city. Returns { GY, CX, EDGE, M, rim }
//   facadeFall(g, t, cam, { speed, y0 })                    falling beside a glass tower; windows scroll up at `speed` px/s
//   lookDown(g, t, cam)                                     perspective down the facade to the street far below
//   pavement(g, t, cam, { rain, shadow, grey })             ant-scale sidewalk: crack canyon, pebbles, gum, leaf, bottle cap, giant shoe
//   waterDrop(g, x, y, r, t, { grounded, wob, a })          clear water sphere with refraction, rim, speculars
//   chip(g, t, t0, str, { y, color, size })                 gold pop-in label (outBack) for on-screen numbers / short chips
//   airLines(g, t, cx, cy, { a, w, h })                     curving air streamlines flowing up around a point
//   gust(g, t, { a, y, h })                                 horizontal wind streaks + flying specks
import { E, V, mood, layer, blurLayer, rr, seg, circle, ring, poly, linGrad, radGrad, glow, alpha, shade, mix, rng, clamp, lerp, ease, prog, text, measure, FONTS, S } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const GROUND = () => E.H * V(0.8, 0.65);
const SKY_GOLD = ['#5f8fd0', '#9cc0e6', '#f3d7a4', '#ffc98a'];

// a single grass blade: base (x,y), height h, base width w, tip bend dx
export function blade(g, x, y, h, w, dx, col, rib = null) {
  g.fillStyle = col; g.beginPath(); g.moveTo(x - w / 2, y);
  g.quadraticCurveTo(x - w * 0.42 + dx * 0.25, y - h * 0.55, x + dx, y - h);
  g.quadraticCurveTo(x + w * 0.42 + dx * 0.3, y - h * 0.5, x + w / 2, y); g.closePath(); g.fill();
  if (rib) { g.strokeStyle = rib; g.lineWidth = Math.max(1.5, w * 0.06); g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + dx * 0.25, y - h * 0.55, x + dx * 0.97, y - h * 0.97); g.stroke(); }
}
function field(g, t, o) {
  const r = rng(o.seed), sway = o.sway ?? 1;
  for (let i = 0; i < o.n; i++) {
    const x = o.x0 + r() * o.w, h = o.hMin + r() * (o.hMax - o.hMin), w = o.wMin + r() * (o.wMax - o.wMin), lean = (r() - 0.5) * o.lean;
    const dx = lean + Math.sin(t * (0.9 + r() * 0.6) + i) * h * 0.02 * sway + (o.wind || 0) * h * 0.12;
    blade(g, x, o.y + r() * 30, h, w, dx, mix(o.col, o.col2, r()), o.rib ? alpha(o.rib, 0.35) : null);
  }
}
function sky(g, t, cam, o = {}) {
  layer(g, cam, 0.06, (g) => {
    g.fillStyle = linGrad(g, 0, -E.H * 0.6, 0, E.H * 1.1, o.colors || SKY_GOLD); g.fillRect(-E.W * 2, -E.H * 2, E.W * 5, E.H * 5);
    const sx = E.W * 0.8, sy = E.H * 0.22; glow(g, sx, sy, 900, '#ffd08a', 0.5 * (o.sun ?? 1)); glow(g, sx, sy, 260, '#fff2d0', 0.75 * (o.sun ?? 1)); circle(g, sx, sy, 70, alpha('#fff6e2', o.sun ?? 1));
    FX.clouds(g, { seed: 14, count: 6, y: E.H * 0.1, h: 260, color: '#fff2e0', a: 0.22 });
  });
}
function bokeh(g, t, cam, depth, seed, n, col) {
  layer(g, cam, depth, (g) => { const r = rng(seed); g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) { const x = r() * E.W * 1.6 - E.W * 0.3, y = r() * E.H * 0.7, rad = 30 + r() * 70, a = 0.06 + 0.08 * (0.5 + 0.5 * Math.sin(t * 0.8 + i));
      circle(g, x, y, rad, alpha(col, a)); ring(g, x, y, rad, 2, alpha(col, a * 1.4)); } g.restore(); });
}
// giant daisy (stem + head) at world x, ground y, height h
function daisy(g, x, y, h, t) {
  const sw = Math.sin(t * 0.8) * 10; seg(g, [[x, y], [x + sw * 0.5, y - h * 0.5], [x + sw, y - h]], 26, '#3c7a3e');
  const cx = x + sw, cy = y - h; for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2 + t * 0.05; g.save(); g.translate(cx, cy); g.rotate(a); g.fillStyle = i % 2 ? '#fff8ec' : '#f4ead8'; g.beginPath(); g.ellipse(0, -105, 34, 92, 0, 0, Math.PI * 2); g.fill(); g.restore(); }
  circle(g, cx, cy, 62, '#f2b51c'); circle(g, cx - 14, cy - 14, 26, alpha('#ffe68a', 0.7));
}
export function bottleCap(g, x, y, s, col = '#d4262e') {
  g.fillStyle = shade(col, -0.35); rr(g, x - 170 * s, y - 120 * s, 340 * s, 120 * s, 18 * s); g.fill();
  for (let i = 0; i < 14; i++) { g.fillStyle = alpha(shade(col, 0.15), 0.9); g.fillRect(x - 160 * s + i * 23 * s, y - 112 * s, 12 * s, 108 * s); }
  g.fillStyle = shade(col, 0.1); g.beginPath(); g.ellipse(x, y - 120 * s, 170 * s, 34 * s, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = alpha('#ffffff', 0.25); g.beginPath(); g.ellipse(x - 50 * s, y - 126 * s, 70 * s, 10 * s, 0, 0, Math.PI * 2); g.fill();
}
function pebble(g, x, y, rx, ry, col, light) {
  g.fillStyle = col; g.beginPath(); g.ellipse(x, y - ry * 0.8, rx, ry, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = alpha(light, 0.35); g.beginPath(); g.ellipse(x + rx * 0.25, y - ry * 1.2, rx * 0.55, ry * 0.4, -0.3, 0, Math.PI * 2); g.fill();
}
function crumb(g, x, y, s) {
  g.fillStyle = '#c98a3a'; g.beginPath(); g.moveTo(x - 120 * s, y); g.lineTo(x - 140 * s, y - 70 * s); g.lineTo(x - 60 * s, y - 150 * s); g.lineTo(x + 70 * s, y - 130 * s); g.lineTo(x + 140 * s, y - 40 * s); g.lineTo(x + 120 * s, y); g.closePath(); g.fill();
  g.fillStyle = '#f1d49a'; g.beginPath(); g.moveTo(x - 60 * s, y - 120 * s); g.lineTo(x + 50 * s, y - 108 * s); g.lineTo(x + 90 * s, y - 50 * s); g.lineTo(x - 40 * s, y - 40 * s); g.closePath(); g.fill();
  const r = rng(7); for (let i = 0; i < 9; i++) circle(g, x - 40 * s + r() * 110 * s, y - 50 * s - r() * 60 * s, (5 + r() * 7) * s, '#d9ae6a');
}
export function sneaker(g, x, y, s, col = '#3a7ad0') {   // a GIANT shoe (sole + toe cap) seen from ground level
  g.fillStyle = '#f4f1e8'; rr(g, x - 520 * s, y - 120 * s, 1040 * s, 120 * s, 50 * s); g.fill();
  g.fillStyle = '#cfcabc'; for (let i = 0; i < 12; i++) g.fillRect(x - 480 * s + i * 82 * s, y - 40 * s, 40 * s, 40 * s);
  g.fillStyle = col; g.beginPath(); g.moveTo(x - 500 * s, y - 120 * s); g.quadraticCurveTo(x - 480 * s, y - 520 * s, x + 40 * s, y - 640 * s); g.quadraticCurveTo(x + 420 * s, y - 640 * s, x + 500 * s, y - 120 * s); g.closePath(); g.fill();
  g.fillStyle = shade(col, 0.25); g.beginPath(); g.ellipse(x - 120 * s, y - 380 * s, 220 * s, 90 * s, -0.5, 0, Math.PI * 2); g.fill();
  for (let i = 0; i < 4; i++) seg(g, [[x - 40 * s + i * 70 * s, y - 520 * s + i * 50 * s], [x + 120 * s + i * 70 * s, y - 560 * s + i * 50 * s]], 16 * s, '#fff8ec');
}
export function grassWorld(g, t, cam, o = {}) {
  const M = mood('golden'), GY = o.GY ?? GROUND(), CX = E.W / 2, wind = o.wind || 0;
  sky(g, t, cam, o);
  bokeh(g, t, cam, 0.12, 21, 12, '#fff0c8');
  layer(g, cam, 0.3, (g) => {
    field(g, t, { seed: 3, n: 46, x0: -E.W, w: E.W * 3, y: GY - 160, hMin: 700, hMax: 1300, wMin: 40, wMax: 80, lean: 200, col: '#8fb58a', col2: '#a9c49a', wind });
    FX.fog(g, GY - 700, 700, '#f6dcae', 0.45);
  });
  layer(g, cam, 0.6, (g) => {
    if (o.daisy !== false) daisy(g, CX + 330, GY - 40, 1250, t);
    field(g, t, { seed: 8, n: 26, x0: -E.W * 0.8, w: E.W * 2.6, y: GY - 60, hMin: 900, hMax: 1700, wMin: 70, wMax: 130, lean: 260, col: '#4f8f4e', col2: '#6aa45a', rib: '#d8f0a0', wind });
    if (o.sneaker) sneaker(g, CX - 520, GY - 30, 0.9);
    FX.fog(g, GY - 260, 300, '#f3d2a0', 0.3);
  });
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = linGrad(g, 0, GY - 20, 0, GY + 900, ['#6b4a32', '#4a3224', '#2e1f18']); g.fillRect(-E.W * 2, GY - 20, E.W * 5, E.H * 2);
    const r = rng(12); for (let i = 0; i < 40; i++) pebble(g, -E.W + r() * E.W * 3, GY + r() * 500, 16 + r() * 40, 10 + r() * 22, mix('#8a7462', '#b09a84', r()), '#ffe6c0');
    field(g, t, { seed: 15, n: 18, x0: -E.W, w: E.W * 3, y: GY + 10, hMin: 1000, hMax: 1900, wMin: 110, wMax: 190, lean: 300, col: '#2f6a38', col2: '#3f7d40', rib: '#bfe890', wind });
    crumb(g, CX - 330, GY + 40, 1.0); pebble(g, CX + 380, GY + 60, 120, 70, '#9c8a78', '#ffe6c0');
    if (o.cap) bottleCap(g, CX + 360, GY + 140, 0.9);
    if (o.dew !== false) waterDrop(g, CX + 120, GY - 470, 115, t, { grounded: false });
  });
  return { GY, CX, M, rim: { color: '#ffd9a0', dir: [0.7, -0.7] } };
}
export function grassFg(g, t, cam, o = {}) {
  blurLayer(g, 9, (g) => {
    blade(g, -60, E.H + 40, 1500, 240, 160 + Math.sin(t) * 20, '#1d3a22'); blade(g, E.W + 70, E.H + 60, 1300, 220, -200 + Math.sin(t * 1.2) * 20, '#1a3420');
    if (o.mid) blade(g, E.W * 0.7, E.H + 80, 900, 160, -60, '#20402a');
  }, cam, 1.6);
}
// wind streaks
export function gust(g, t, o = {}) {
  const { a = 0.5, y = 0, h = E.H, seed = 4, n = 40 } = o, r = rng(seed); g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
  for (let i = 0; i < n; i++) { const yy = y + r() * h, L = 120 + r() * 340, sp = 1400 + r() * 1400, x = ((r() * E.W * 2 + t * sp) % (E.W * 2)) - E.W * 0.5;
    g.strokeStyle = alpha('#fff6e6', a * (0.3 + r() * 0.7)); g.lineWidth = 2 + r() * 4; g.beginPath(); g.moveTo(x, yy); g.quadraticCurveTo(x + L * 0.5, yy - 12, x + L, yy + Math.sin(t * 3 + i) * 10); g.stroke(); }
  g.restore();
}
export function airLines(g, t, cx, cy, o = {}) {
  const { a = 0.45, w = 520, n = 9, speed = 1 } = o; g.save(); g.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const off = (i - (n - 1) / 2) / ((n - 1) / 2), x0 = cx + off * w * 0.6, ph = ((t * 0.9 * speed + i * 0.37) % 1);
    g.strokeStyle = alpha('#eaf6ff', a * Math.sin(ph * Math.PI)); g.lineWidth = 4;
    g.setLineDash([60, 40]); g.lineDashOffset = -t * 260 * speed;
    g.beginPath(); g.moveTo(x0, cy + 700); g.bezierCurveTo(x0, cy + 220, cx + off * w * 1.1, cy + 60, cx + off * w * 1.0, cy - 160); g.bezierCurveTo(cx + off * w * 0.9, cy - 360, x0 * 0.5 + cx * 0.5, cy - 500, x0, cy - 800); g.stroke();
  }
  g.setLineDash([]); g.restore();
}
// ---------- rooftop at ant scale ----------
export function rooftop(g, t, cam, o = {}) {
  const GY = GROUND() - 80, CX = E.W / 2, EDGE = E.W * 0.78, M = mood('golden');
  sky(g, t, cam, { colors: ['#4f6fb8', '#8aa6d8', '#f2c08a', '#ff9f6a'] });
  layer(g, cam, 0.2, (g) => {     // the city far BELOW the roof: skyline tops seen from above
    FX.skyline(g, { x: -E.W, y: GY + 520, w: E.W * 3, minH: 200, maxH: 520, color: '#6d5a8a', windowColor: alpha('#ffe2a8', 0.6), lit: 0.25, seed: 51 });
    FX.fog(g, GY + 80, 500, '#f4c08e', 0.55);
    FX.skyline(g, { x: -E.W, y: GY + 760, w: E.W * 3, minH: 260, maxH: 640, color: '#4a3c66', windowColor: alpha('#ffe2a8', 0.7), lit: 0.3, seed: 57 });
  });
  layer(g, cam, 0.45, (g) => {    // an antenna mast with a blinking red light on a nearer roof
    seg(g, [[CX - 300, GY + 300], [CX - 300, GY - 700]], 10, '#3a2f4a'); for (let i = 0; i < 6; i++) seg(g, [[CX - 330, GY + 200 - i * 150], [CX - 270, GY + 140 - i * 150]], 4, '#3a2f4a');
    const bl = Math.sin(t * 5) > 0 ? 1 : 0.2; glow(g, CX - 300, GY - 710, 70, '#ff4040', 0.6 * bl); circle(g, CX - 300, GY - 710, 10, alpha('#ff6060', bl));
  });
  layer(g, cam, 0.9, (g) => {     // parapet top: concrete slab, gravel boulders, a bottle cap, a dry leaf, the edge drop
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 700, ['#b9a28c', '#8c7764', '#5d4c40']); g.fillRect(-E.W * 2, GY, EDGE + E.W * 2, E.H * 2);
    g.fillStyle = '#4a3a33'; g.fillRect(EDGE, GY, 40, E.H * 2); g.fillStyle = alpha('#ffe0b0', 0.6); g.fillRect(-E.W * 2, GY - 4, EDGE + E.W * 2, 8);
    const r = rng(33); for (let i = 0; i < 30; i++) pebble(g, -E.W + r() * (EDGE + E.W - 40), GY + 20 + r() * 520, 14 + r() * 30, 9 + r() * 18, mix('#a08c78', '#cdb8a0', r()), '#fff0d8');
    bottleCap(g, CX - 330, GY + 6, 0.8, '#2f6fd0');
    g.save(); g.translate(CX - 40, GY + 4); g.rotate(-0.1); g.fillStyle = '#c2702a'; g.beginPath(); g.ellipse(0, -30, 200, 46, 0, 0, Math.PI * 2); g.fill(); seg(g, [[-200, -30], [200, -30]], 5, '#8a4a1a'); g.restore();
  });
  return { GY, CX, EDGE, M, rim: { color: '#ffd09a', dir: [0.7, -0.6] } };
}
// ---------- falling beside a glass tower ----------
export function facadeFall(g, t, cam, o = {}) {
  const speed = o.speed ?? 1800, scroll = (o.y0 || 0) + t * speed;
  sky(g, t, cam, { colors: ['#4f6fb8', '#86a4d8', '#f0c08c', '#ff9e6a'], sun: 0.8 });
  layer(g, cam, 0.25, (g) => { FX.skyline(g, { x: -E.W, y: E.H * 1.25, w: E.W * 3, minH: 300, maxH: 900, color: '#5a4a78', windowColor: alpha('#ffe2a8', 0.6), lit: 0.3, seed: 61 }); FX.fog(g, E.H * 0.7, 700, '#f6c896', 0.4); });
  layer(g, cam, 0.8, (g) => {     // the tower face on the left: glass panels scrolling UP past the faller
    const x0 = -40, w = E.W * 0.42, ph = 260; g.fillStyle = '#2e3a5c'; g.fillRect(x0, -E.H, w, E.H * 3);
    for (let k = -2; k < 14; k++) { const y = ((k * ph - scroll) % (ph * 12) + ph * 12) % (ph * 12) - ph * 2 - 200;
      for (let c = 0; c < 3; c++) { const px = x0 + 20 + c * (w / 3), pw = w / 3 - 24;
        g.fillStyle = linGrad(g, px, y, px + pw, y + ph - 30, ['#9cc4f0', '#f6c89a', '#5a6ea0']); g.fillRect(px, y, pw, ph - 30);
        g.fillStyle = alpha('#ffffff', 0.25); g.beginPath(); g.moveTo(px + pw * 0.2, y); g.lineTo(px + pw * 0.45, y); g.lineTo(px + pw * 0.15, y + ph - 30); g.lineTo(px - pw * 0.05 + 6, y + ph - 30); g.closePath(); g.fill(); }
      g.fillStyle = '#c7cede'; g.fillRect(x0, y + ph - 30, w, 12); }
    g.fillStyle = alpha('#ffe0b0', 0.7); g.fillRect(x0 + w - 6, -E.H, 8, E.H * 3);
  });
  if (o.streaks) { g.save(); g.globalCompositeOperation = 'lighter'; const r = rng(9); for (let i = 0; i < 26; i++) { const x = r() * E.W, L = 200 + r() * 500, y = ((r() * E.H * 2 - t * speed * 1.4) % (E.H * 2) + E.H * 2) % (E.H * 2) - E.H * 0.3; seg(g, [[x, y], [x, y + L]], 2 + r() * 3, alpha('#fff4e2', o.streaks * (0.2 + r() * 0.3))); } g.restore(); }
}
// ---------- perspective: looking DOWN the facade ----------
export function lookDown(g, t, cam) {
  layer(g, cam, 0.7, (g) => {
    const vx = E.W * 0.5, vy = E.H * 1.02, top = -200;
    g.fillStyle = linGrad(g, 0, top, 0, vy, ['#f2c49a', '#c48a7a', '#6a5a7a']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);   // haze between towers
    // street far below: tiny cars + crosswalk around the vanishing point
    g.fillStyle = '#3a3448'; g.fillRect(vx - 180, vy - 60, 360, 120); for (let i = 0; i < 6; i++) g.fillRect(vx - 150 + i * 55, vy - 8, 30, 6);
    const r = rng(5); for (let i = 0; i < 7; i++) { g.fillStyle = ['#d4262e', '#f0c020', '#e0e0d0', '#2f6fd0'][i % 4]; g.fillRect(vx - 160 + r() * 300 + ((t * 30 * (i % 2 ? 1 : -1)) % 60), vy - 50 + r() * 90, 14, 7); }
    // two facades converging (left + right), with window rows shrinking toward the vanishing point
    for (const side of [-1, 1]) {
      const ox = side < 0 ? -80 : E.W + 80, ix = vx + side * 170;
      g.fillStyle = side < 0 ? '#5a6a9a' : '#4a5584'; g.beginPath(); g.moveTo(ox, top); g.lineTo(ox + side * -40, top); g.lineTo(ix, vy - 60); g.lineTo(ix, vy + 60); g.lineTo(ox, E.H * 1.4); g.closePath(); g.fill();
      for (let k = 1; k < 26; k++) { const u = 1 - 1 / (1 + k * 0.28), y = lerp(top, vy, u), x = lerp(ox, ix, u);
        seg(g, [[x, y], [lerp(ox, ix, u), y + 4]], 3, alpha('#ffe6c0', 0.4 * (1 - u)));
        g.fillStyle = alpha(k % 3 ? '#9cc4f0' : '#ffd59a', 0.55 * (1 - u)); const wx = side < 0 ? lerp(-80, ix, u) : x - lerp(160, 20, u); g.fillRect(Math.min(wx, x), y + 6, Math.abs(x - wx) * 0.9, lerp(60, 4, u)); }
    }
    // our tower's edge at the top of frame (where the hero fell from)
    g.fillStyle = '#8c7764'; g.fillRect(-E.W, top - 400, E.W * 3, 460); g.fillStyle = alpha('#ffe0b0', 0.8); g.fillRect(-E.W, top + 52, E.W * 3, 8);
  });
}
// ---------- the sidewalk at ant scale ----------
export function pavement(g, t, cam, o = {}) {
  const GY = o.GY ?? GROUND(), CX = E.W / 2, grey = o.grey || 0;
  sky(g, t, cam, { colors: [mix('#6a8ed0', '#5a6478', grey), mix('#a8c4e6', '#8a94a6', grey), mix('#f4d6a6', '#b8b4b0', grey), mix('#ffc890', '#a8a4a8', grey)], sun: 1 - grey });
  layer(g, cam, 0.25, (g) => {     // the street world, blurred far: a giant parked bike wheel, curb, lamp post
    ring(g, CX - 380, GY - 520, 520, 40, alpha('#2a2438', 0.55)); ring(g, CX - 380, GY - 520, 470, 8, alpha('#2a2438', 0.4));
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; seg(g, [[CX - 380, GY - 520], [CX - 380 + Math.cos(a) * 470, GY - 520 + Math.sin(a) * 470]], 4, alpha('#2a2438', 0.35)); }
    FX.fog(g, GY - 600, 600, mix('#f6d2a0', '#c0c0c8', grey), 0.5);
  });
  layer(g, cam, 0.55, (g) => {     // a giant shoe parked on the sidewalk + a dropped wrapper
    sneaker(g, CX + 520, GY - 40, 0.75, '#d4262e');
    g.fillStyle = '#f0c020'; g.save(); g.translate(CX - 520, GY - 30); g.rotate(-0.05); rr(g, -260, -140, 520, 140, 20); g.fill(); text(g, 'CHIPS', 0, -70, { size: 70, color: '#d4262e', weight: 900 }); g.restore();
    FX.fog(g, GY - 200, 240, mix('#f3d2a0', '#c8c8cc', grey), 0.25);
  });
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = linGrad(g, 0, GY - 10, 0, GY + 900, [mix('#c2b4a4', '#9a98a0', grey), mix('#9a8c80', '#7a7882', grey), mix('#5e544e', '#4a4a52', grey)]); g.fillRect(-E.W * 2, GY - 10, E.W * 5, E.H * 2);
    const r = rng(77); for (let i = 0; i < 150; i++) circle(g, -E.W + r() * E.W * 3, GY + r() * 600, 2 + r() * 5, alpha(r() > 0.5 ? '#ffffff' : '#3a3030', 0.18));
    // the crack canyon
    g.fillStyle = '#2a2224'; g.beginPath(); g.moveTo(-E.W, GY + 260); for (let i = 0; i <= 20; i++) g.lineTo(-E.W + i * E.W * 0.15, GY + 250 + Math.sin(i * 1.7) * 30 + (i % 2) * 22); for (let i = 20; i >= 0; i--) g.lineTo(-E.W + i * E.W * 0.15, GY + 290 + Math.sin(i * 1.3) * 26); g.closePath(); g.fill();
    for (let i = 0; i < 16; i++) pebble(g, -E.W + r() * E.W * 3, GY + 10 + r() * 200, 20 + r() * 50, 12 + r() * 26, mix('#8c8078', '#b8aca0', r()), '#fff0d8');
    g.fillStyle = '#e88aa8'; g.beginPath(); g.ellipse(CX - 380, GY + 70, 150, 50, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = alpha('#ffffff', 0.35); g.beginPath(); g.ellipse(CX - 410, GY + 50, 60, 14, 0, 0, Math.PI * 2); g.fill();   // pink gum
    g.save(); g.translate(CX + 340, GY + 80); g.rotate(0.15); g.fillStyle = '#e09030'; g.beginPath(); g.ellipse(0, 0, 230, 60, 0, 0, Math.PI * 2); g.fill(); seg(g, [[-230, 0], [230, 0]], 6, '#a05a1a'); for (let i = -3; i <= 3; i++) seg(g, [[i * 60, 0], [i * 60 + 40, -44]], 3, '#a05a1a'); g.restore();
    if (o.shadow) { g.fillStyle = alpha('#1a1830', 0.35 * o.shadow.a); g.beginPath(); g.ellipse(o.shadow.x, GY + 4, o.shadow.r, o.shadow.r * 0.22, 0, 0, Math.PI * 2); g.fill(); }
  });
  return { GY, CX, rim: { color: grey > 0.5 ? '#dfe8ff' : '#ffd9a0', dir: [0.7, -0.7] } };
}
// splash crowns where raindrops hit the ground (ant scale: each one is a car-sized burst)
export function splashes(g, t, GY, o = {}) {
  const r = rng(o.seed || 3), n = o.n || 5;
  for (let i = 0; i < n; i++) { const x = r() * E.W, per = 0.7 + r() * 0.6, u = ((t + r() * per) % per) / per, y = GY + 20 + r() * 260;
    if (u < 0.15) { const k = u / 0.15; seg(g, [[x, y - 900 * (1 - k)], [x, y - 900 * (1 - k) - 160]], 36, alpha('#dff0ff', 0.5)); }
    else { const k = (u - 0.15) / 0.85; g.strokeStyle = alpha('#e8f6ff', 0.6 * (1 - k)); g.lineWidth = 6; g.beginPath(); g.ellipse(x, y, 40 + k * 220, 10 + k * 50, 0, 0, Math.PI * 2); g.stroke();
      for (let j = 0; j < 7; j++) { const a = Math.PI + j / 6 * Math.PI, d = 60 + k * 200; circle(g, x + Math.cos(a) * d, y + Math.sin(a) * d * 0.9 - k * (1 - k) * 260, 12 * (1 - k), alpha('#e8f6ff', 0.7 * (1 - k))); } }
  }
}
// ---------- a clear water drop ----------
export function waterDrop(g, x, y, r, t, o = {}) {
  const wob = o.wob ?? 0.02, ky = o.grounded ? 0.86 : 1, sx = 1 + Math.sin(t * 7.5) * wob, sy = ky * (1 - Math.sin(t * 7.5) * wob), a = o.a ?? 1;
  g.save(); g.translate(x, y); g.scale(sx, sy); g.globalAlpha *= a;
  if (o.grounded) { g.fillStyle = alpha('#20304a', 0.25); g.beginPath(); g.ellipse(0, r * 0.98, r * 1.05, r * 0.16, 0, 0, Math.PI * 2); g.fill(); }
  g.save(); g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.clip();
  g.fillStyle = radGrad(g, 0, 0, 0, r, [alpha('#e8f6ff', 0.1), alpha('#bfe2ff', 0.22), alpha('#7fb8e8', 0.55)]); g.fillRect(-r, -r, r * 2, r * 2);
  g.fillStyle = linGrad(g, 0, -r, 0, r, [alpha('#3f7d40', 0.25), alpha('#3f7d40', 0.05), alpha('#fff2d0', 0.3), alpha('#9cc0e6', 0.45)]); g.fillRect(-r, r * 0.05, r * 2, r);   // refracted, upside-down world
  glow(g, r * 0.1, r * 0.62, r * 0.55, '#fff4d0', 0.45);
  g.restore();
  ring(g, 0, 0, r, Math.max(2, r * 0.035), alpha('#f4fbff', 0.75));
  g.fillStyle = alpha('#ffffff', 0.85); g.beginPath(); g.ellipse(-r * 0.38, -r * 0.48, r * 0.26, r * 0.12, -0.7, 0, Math.PI * 2); g.fill();
  circle(g, -r * 0.62, -r * 0.18, r * 0.05, alpha('#ffffff', 0.9)); circle(g, r * 0.5, r * 0.52, r * 0.06, alpha('#ffffff', 0.5));
  g.restore();
}
// gold chip that pops on a word (outBack), centred at y; <= 6 words
export function chip(g, t, t0, str, o = {}) {
  const k = ease.outBack(prog(t, t0, t0 + 0.35)); if (k <= 0) return;
  const size = o.size || 64, y = o.y ?? V(200, 330), col = o.color || S().ui.gold, w = measure(g, str, size) + size * 1.1, h = size * 1.5, x = o.x ?? E.W / 2;
  g.save(); g.translate(x, y); g.scale(k, k); g.rotate(o.rot ?? -0.03);
  rr(g, -w / 2, -h / 2, w, h, h / 2); g.fillStyle = 'rgba(20,16,34,.86)'; g.fill(); g.lineWidth = 5; g.strokeStyle = alpha(col, 0.9); g.stroke();
  text(g, str, 0, 4, { size, color: col, weight: 900, glow: 16, glowColor: alpha(col, 0.55), stroke: 0 });
  g.restore();
}
