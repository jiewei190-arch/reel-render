// kits/cozy/room.js — the shared loft apartment and its props (all original designs).
//   loft(g, t, o) draws the whole room (stage 1080x1920) and returns anchors + the light list for night().
import { PAL, C, shape, oval, dot, rbox, wline, tube, curve, heart, sparkle, at, starPts, warmGlow, cone } from './base.js';
import { E, clamp, lerp, rng, noise, alpha, mix, text, linGrad, radGrad } from '/engine/core.js';

// slanted ceiling line of the wide loft: y at x
export const ceilY = (x) => 700 - 0.42 * x;
export const FLOOR_Y = 1240;

export function skyWindow(g, pts, t, o = {}) {
  const { moon = [0.62, 0.4], stars = 9, seed = 3, frame = PAL.woodLt } = o;
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  g.save(); g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip();
  g.fillStyle = linGrad(g, 0, y0, 0, y1, ['#123744', '#1f5562', '#2f6d78']); g.fillRect(x0 - 10, y0 - 10, x1 - x0 + 20, y1 - y0 + 20);
  const r = rng(seed); for (let i = 0; i < stars; i++) { const sx = lerp(x0, x1, r()), sy = lerp(y0, y1, r() * 0.9), tw = 0.5 + 0.5 * Math.sin(t * 2 + i * 1.7); sparkle(g, sx, sy, 6 + 7 * tw, '#fff6dc', { line: false }); }
  const mx = lerp(x0, x1, moon[0]), my = lerp(y0, y1, moon[1]), mr = Math.min(x1 - x0, y1 - y0) * 0.2;
  warmGlow(g, mx, my, mr * 3.2, PAL.moon, 0.35);
  oval(g, mx, my, mr, mr, { fill: PAL.moon, line: false, seed: 7 }); oval(g, mx + mr * 0.45, my - mr * 0.25, mr * 0.85, mr * 0.85, { fill: '#235c69', line: false, seed: 8 });
  // a little cloud
  const cx = lerp(x0, x1, 0.28) + noise(t * 0.1, 3) * 20, cy = lerp(y0, y1, 0.72);
  for (const [dx, dy, rr] of [[0, 0, 30], [32, -12, 34], [66, 2, 26]]) oval(g, cx + dx, cy + dy, rr, rr * 0.8, { fill: 'rgba(230,240,235,.55)', line: false, seed: 9 + dx });
  g.restore();
  shape(g, pts, { fill: null, w: 16, line: frame, seed: 11 }); shape(g, pts, { fill: null, w: C.lw, seed: 12 });
  const m0 = [(pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2], m1 = [(pts[3][0] + pts[2][0]) / 2, (pts[3][1] + pts[2][1]) / 2];
  tube(g, [m0, m1], 10, frame, { seed: 13 });
  return { moon: [mx, my], center: [(x0 + x1) / 2, (y0 + y1) / 2] };
}

// string lights along a sagging curve; returns bulb positions [[x,y],...]
export function stringLights(g, x0, y0, x1, y1, o = {}) {
  const { sag = 70, n = 14, t = C.now, on = 1, seed = 2 } = o; const P = [], B = [];
  for (let i = 0; i <= 30; i++) { const u = i / 30; P.push([lerp(x0, x1, u), lerp(y0, y1, u) + Math.sin(u * Math.PI) * sag]); }
  wline(g, P, { w: 4, seed });
  const cols = [PAL.lamp, '#ffb38a', PAL.lampHot, '#ffd9a0'];
  for (let i = 0; i < n; i++) { const u = (i + 0.5) / n, x = lerp(x0, x1, u), y = lerp(y0, y1, u) + Math.sin(u * Math.PI) * sag; const tw = 0.85 + 0.15 * Math.sin(t * 1.3 + i * 2.1);
    const c = cols[i % cols.length]; if (on > 0) warmGlow(g, x, y + 22, 70, c, 0.5 * on * tw);
    rbox(g, x - 7, y - 4, 14, 12, 3, { fill: '#8a6a55', w: 3, seed: 20 + i });
    oval(g, x, y + 22, 13, 17, { fill: on > 0.3 ? mix('#f2e2c4', c, on) : '#e9dcc4', w: 3.5, seed: 30 + i }); B.push([x, y + 22, c]); }
  return B;
}
// mini fridge with stickers. x,y = top-left, w,h. open 0..1 swings the door (hinge left). Returns {inside:[x,y,w,h], light:[x,y]}
export function miniFridge(g, x, y, w, h, o = {}) {
  const { open = 0, t = C.now, items = true, body = '#bfe0cf', seed = 5 } = o;
  rbox(g, x, y, w, h, 26, { fill: body, seed });
  const ix = x + 16, iy = y + 22, iw = w - 32, ih = h - 44;
  if (open > 0) {
    rbox(g, ix, iy, iw, ih, 14, { fill: PAL.fridgeLight, seed: seed + 1 });
    g.save(); g.globalAlpha = 0.5; g.fillStyle = radGrad(g, ix + iw / 2, iy + ih * 0.3, 10, ih, ['#ffffff', 'rgba(255,240,200,0)']); g.fillRect(ix, iy, iw, ih); g.restore();
    for (const k of [0.36, 0.68]) wline(g, [[ix + 8, iy + ih * k], [ix + iw - 8, iy + ih * k]], { w: 5, line: '#c9b49a', seed: seed + 2 + k * 10 });
    if (items) fridgeItems(g, ix, iy, iw, ih);
    // door panel swings toward camera-left
    const dw = w * Math.cos(open * Math.PI * 0.46), sk = 40 * Math.sin(open * Math.PI * 0.5);
    shape(g, [[x - (w - dw) * 0.05, y - sk * 0.4], [x - (w - dw) * 0.05 - (w - dw) * 0.95 - 10, y - sk], [x - (w - dw) - 10, y + h + sk], [x, y + h]], { fill: mix(body, '#ffffff', 0.15), step: 50, seed: seed + 3 });
  } else {
    wline(g, [[x + 14, y + h * 0.3], [x + w - 14, y + h * 0.3]], { w: 4, seed: seed + 4 });
    rbox(g, x + w - 34, y + h * 0.36, 14, 70, 7, { fill: '#f6efe2', w: 4, seed: seed + 5 });
    // stickers
    heart(g, x + w * 0.3, y + h * 0.55, 24, PAL.heart, { w: 4, seed: 60 });
    shape(g, starPts(x + w * 0.62, y + h * 0.7, 24, 0.5, 5), { fill: PAL.lamp, w: 4, step: 1e9, seed: 61 });
    oval(g, x + w * 0.36, y + h * 0.8, 22, 16, { fill: PAL.apricot, w: 4, seed: 62 }); shape(g, [[x + w * 0.36 + 18, y + h * 0.8], [x + w * 0.36 + 36, y + h * 0.8 - 12], [x + w * 0.36 + 36, y + h * 0.8 + 12]], { fill: PAL.apricot, w: 4, step: 1e9, seed: 63 }); // fish
    oval(g, x + w * 0.3, y + h * 0.14, 18, 18, { fill: '#fff6e0', w: 4, seed: 64 }); dot(g, x + w * 0.3, y + h * 0.14, 7, PAL.lamp); // flower
    for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; oval(g, x + w * 0.3 + Math.cos(a) * 20, y + h * 0.14 + Math.sin(a) * 20, 9, 9, { fill: '#ffd0d8', w: 3, seed: 65 + i }); }
  }
  oval(g, x + 30, y + h + 4, 12, 8, { fill: PAL.line, line: false }); oval(g, x + w - 30, y + h + 4, 12, 8, { fill: PAL.line, line: false });
  return { inside: [ix, iy, iw, ih], light: [ix + iw / 2, iy + ih * 0.4] };
}
export function fridgeItems(g, ix, iy, iw, ih) {
  const s1 = iy + ih * 0.36, s2 = iy + ih * 0.68, s3 = iy + ih - 6;
  // top shelf: rice tub + egg carton
  riceTub(g, ix + iw * 0.3, s1, iw * 0.0045);
  rbox(g, ix + iw * 0.56, s1 - 34, iw * 0.38, 34, 8, { fill: '#e9d7b8', w: 4, seed: 70 }); for (let i = 0; i < 3; i++) oval(g, ix + iw * (0.62 + i * 0.12), s1 - 40, 15, 19, { fill: PAL.egg, w: 3.5, seed: 71 + i });
  // middle: cheese slices + ham + butter
  for (let i = 0; i < 3; i++) rbox(g, ix + iw * 0.08 + i * 5, s2 - 46 + i * 5, iw * 0.3, 40, 5, { fill: PAL.cheese, w: 3.5, seed: 74 + i });
  oval(g, ix + iw * 0.56, s2 - 20, iw * 0.11, 20, { fill: PAL.ham, w: 4, seed: 77 }); oval(g, ix + iw * 0.56, s2 - 20, iw * 0.05, 9, { fill: '#fbd0d4', line: false });
  rbox(g, ix + iw * 0.72, s2 - 30, iw * 0.2, 28, 6, { fill: '#fff3b8', w: 3.5, seed: 78 });
  // bottom: milk carton + scallions + soy sauce
  milkCarton(g, ix + iw * 0.22, s3, iw * 0.004);
  for (let i = 0; i < 3; i++) tube(g, [[ix + iw * 0.45 + i * 10, s3 - 4], [ix + iw * 0.5 + i * 12, s3 - ih * 0.25]], 8, PAL.scallion, { lw: 3, seed: 79 + i });
  soyBottle(g, ix + iw * 0.8, s3, iw * 0.004);
}
export function riceTub(g, x, y, s = 1) { at(g, x, y, s, (g) => { rbox(g, -50, -60, 100, 60, 10, { fill: 'rgba(240,250,250,.9)', seed: 80 }); rbox(g, -46, -38, 92, 34, 8, { fill: PAL.rice, line: false, seed: 81 }); const r = rng(5); for (let i = 0; i < 14; i++) oval(g, -38 + r() * 76, -34 + r() * 26, 6, 3.5, { fill: '#fff', w: 1.5, rot: r() * 3, seed: 82 + i }); rbox(g, -54, -70, 108, 14, 6, { fill: PAL.sage, seed: 83 }); }); }
export function milkCarton(g, x, y, s = 1) { at(g, x, y, s, (g) => { shape(g, [[-34, 0], [34, 0], [34, -90], [0, -120], [-34, -90]], { fill: '#fdfcf6', step: 30, seed: 84 }); rbox(g, -34, -64, 68, 38, 4, { fill: '#9fd3ee', line: false, seed: 85 }); text(g, 'MILK', 0, -44, { size: 20, font: 'Fredoka', weight: 700, color: '#ffffff' }); heart(g, 0, -100, 10, PAL.heart, { w: 2.5 }); wline(g, [[-34, -90], [34, -90]], { w: 4, seed: 86 }); }); }
export function soyBottle(g, x, y, s = 1, rot = 0) { at(g, x, y, s, (g) => { shape(g, [[-26, 0], [26, 0], [26, -70], [10, -100], [10, -128], [-10, -128], [-10, -100], [-26, -70]], { fill: '#5a2f1a', step: 24, seed: 87 }); rbox(g, -14, -146, 28, 22, 5, { fill: PAL.red, seed: 88 }); rbox(g, -22, -58, 44, 30, 5, { fill: PAL.cream, w: 3.5, seed: 89 }); text(g, 'soy', 0, -42, { size: 18, font: 'Fredoka', weight: 700, color: PAL.line }); }, { rot }); }

export function plant(g, x, y, s = 1, o = {}) {
  const t = o.t ?? C.now;
  at(g, x, y, s, (g) => {
    const L = [[-0.9, 150], [-0.45, 190], [0, 210], [0.45, 185], [0.85, 150], [-0.2, 160], [0.25, 170]];
    L.forEach(([a, l], i) => { const sw = Math.sin(t * 0.9 + i) * 0.04, ang = a + sw, tx = Math.sin(ang) * l, ty = -80 - Math.cos(ang) * l;
      wline(g, [[0, -80], [tx * 0.5, -80 + (ty + 80) * 0.55], [tx, ty]], { w: 5, line: PAL.sageDk, seed: 90 + i });
      oval(g, tx, ty, 26, 46, { fill: i % 2 ? PAL.sage : PAL.sageDk, rot: ang, seed: 100 + i }); wline(g, [[tx - Math.sin(ang) * 30, ty + Math.cos(ang) * 30], [tx + Math.sin(ang) * 30, ty - Math.cos(ang) * 30]], { w: 3, line: 'rgba(60,90,60,.5)', seed: 110 + i }); });
    shape(g, [[-70, -96], [70, -96], [52, 0], [-52, 0]], { fill: o.pot || '#e8a27c', step: 30, seed: 120 }); wline(g, [[-66, -74], [66, -74]], { w: 4, seed: 121 });
  });
}
export function hangingPlant(g, x, y, len = 160, s = 1, o = {}) {
  const t = o.t ?? C.now, sw = Math.sin(t * 0.8) * 6;
  wline(g, [[x, y], [x + sw, y + len]], { w: 3, seed: 130 });
  at(g, x + sw, y + len, s, (g) => {
    for (let i = 0; i < 5; i++) { const dx = (i - 2) * 26; const P = curve([[dx * 0.4, 10], [dx, 60], [dx * 1.3 + Math.sin(t + i) * 6, 130 + (i % 2) * 40]], 6); wline(g, P, { w: 4, line: PAL.sageDk, seed: 131 + i }); for (let k = 2; k < P.length; k += 4) oval(g, P[k][0] + 10, P[k][1], 12, 8, { fill: PAL.sage, rot: 0.6, w: 3, seed: 140 + i * 10 + k }); }
    shape(g, [[-46, -10], [46, -10], [34, 40], [-34, 40]], { fill: PAL.cream2, step: 30, seed: 150 });
  });
}
export function wallClock(g, x, y, r = 50, o = {}) {
  const { h = 2, m = 0 } = o; oval(g, x, y, r, r, { fill: PAL.cream, w: 6, seed: 160 }); oval(g, x, y, r * 0.84, r * 0.84, { fill: null, w: 2.5, line: 'rgba(91,58,41,.4)', seed: 161 });
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; dot(g, x + Math.sin(a) * r * 0.7, y - Math.cos(a) * r * 0.7, i % 3 ? 2.5 : 4.5, PAL.line); }
  const ha = (h % 12 + m / 60) / 12 * Math.PI * 2, ma = m / 60 * Math.PI * 2;
  wline(g, [[x, y], [x + Math.sin(ha) * r * 0.45, y - Math.cos(ha) * r * 0.45]], { w: 6, seed: 162 }); wline(g, [[x, y], [x + Math.sin(ma) * r * 0.68, y - Math.cos(ma) * r * 0.68]], { w: 4, seed: 163 }); dot(g, x, y, 5, PAL.orangeDk);
  oval(g, x - r * 0.7, y - r * 0.85, r * 0.28, r * 0.28, { fill: PAL.orange, seed: 164 }); oval(g, x + r * 0.7, y - r * 0.85, r * 0.28, r * 0.28, { fill: PAL.orange, seed: 165 }); // little bells
}
export function futon(g, x, y, w, h, o = {}) {
  const { color = '#f4e6cf', pillow = '#fff7ea', px = 0.2 } = o;
  rbox(g, x, y, w, h, 22, { fill: color, seed: 170 }); wline(g, [[x + 16, y + h * 0.55], [x + w - 16, y + h * 0.55]], { w: 3, line: 'rgba(91,58,41,.3)', seed: 171 });
  rbox(g, x + w * px - 70, y - 26, 140, 70, 30, { fill: pillow, seed: 172 });
  return { pillow: [x + w * px, y + 6] };
}
export function cushion(g, x, y, rx = 170, o = {}) { const { color = '#f7c6a8' } = o; oval(g, x, y, rx, rx * 0.36, { fill: mix(color, '#7a4a30', 0.15), seed: 175 }); oval(g, x, y - 12, rx * 0.86, rx * 0.26, { fill: color, seed: 176 }); }
export function rug(g, x, y, rx = 420, ry = 130) { oval(g, x, y, rx, ry, { fill: '#cfe0c0', seed: 180 }); oval(g, x, y, rx * 0.8, ry * 0.74, { fill: null, w: 5, line: '#f6efe2', seed: 181 }); oval(g, x, y, rx * 0.55, ry * 0.5, { fill: null, w: 5, line: '#f6efe2', seed: 182 }); }
// low wooden table in 3/4 view. x = centre, y = top surface centre, w = width. Returns top surface y
export function lowTable(g, x, y, w = 420, o = {}) {
  const d = o.depth ?? w * 0.32, leg = o.leg ?? w * 0.2;
  for (const sx of [-1, 1]) rbox(g, x + sx * (w / 2 - 34) - 14, y + 10, 28, leg + d * 0.25, 8, { fill: PAL.woodDk, seed: 185 + sx });
  rbox(g, x - w / 2, y - d / 2, w, d, 26, { fill: PAL.wood, seed: 187 }); rbox(g, x - w / 2, y + d / 2 - 22, w, 30, 14, { fill: PAL.woodDk, seed: 188 });
  for (let i = 1; i < 3; i++) wline(g, [[x - w / 2 + 30, y - d / 2 + i * d / 3], [x + w / 2 - 30, y - d / 2 + i * d / 3 + 4]], { w: 3, line: 'rgba(91,58,41,.3)', seed: 189 + i });
  return y;
}
// tiny single-burner hot plate (3/4). on 0..1 glows the coil
export function hotPlate(g, x, y, s = 1, o = {}) {
  const on = o.on ?? 1; at(g, x, y, s, (g) => {
    rbox(g, -120, -20, 240, 70, 20, { fill: '#f4efe6', seed: 190 }); rbox(g, -120, 30, 240, 24, 10, { fill: '#d9cfc0', seed: 191 });
    oval(g, 0, 4, 84, 22, { fill: mix('#5b4a42', '#ff7a3a', on * 0.7), seed: 192 }); oval(g, 0, 4, 54, 13, { fill: null, w: 4, line: mix('#3b2c26', '#ffb36a', on), seed: 193 });
    oval(g, 92, 36, 12, 12, { fill: PAL.orangeDk, w: 3, seed: 194 }); dot(g, -96, 36, 5, on > 0.5 ? '#ff6a3a' : '#a89a8a');
  }); if (on > 0) warmGlow(g, x, y, 130 * s, '#ff9a50', 0.35 * on);
}
// small pan, 3/4 view. contents(g) is drawn clipped inside the pan's ellipse (local coords: centre 0,0, rx 130 ry 40)
export function panSide(g, x, y, s = 1, contents = null, o = {}) {
  at(g, x, y, s, (g) => {
    tube(g, [[110, 0], [270, 34]], 26, '#4a3a34', { seed: 196 });
    shape(g, [[-140, -6], [140, -6], [124, 40], [-124, 40]], { fill: '#5a4840', step: 30, seed: 197 });
    oval(g, 0, -6, 140, 42, { fill: '#3e302a', seed: 198 });
    if (contents) { g.save(); g.beginPath(); g.ellipse(0, -6, 128, 36, 0, 0, Math.PI * 2); g.clip(); contents(g); g.restore(); }
    oval(g, 0, -6, 140, 42, { fill: null, w: 5, line: '#8a7268', seed: 199 }); oval(g, 0, -6, 140, 42, { fill: null, seed: 200 });
  });
}

// the whole loft (wide). o: {fridgeOpen, futons:true, cushion:true, table:[x,y,w], lightsOn:1, clock:true}
export function loft(g, t, o = {}) {
  const { fridgeOpen = 0, futons = true, cushionAt = [520, 1430], table = [640, 1290, 300], lightsOn = 1 } = o;
  g.fillStyle = PAL.wall; g.fillRect(0, 0, E.W, FLOOR_Y + 20);
  // slanted ceiling
  shape(g, [[-20, -20], [1100, -20], [1100, ceilY(1100)], [-20, ceilY(-20)]], { fill: PAL.wallDk, step: 60, seed: 210 });
  for (let i = 1; i < 4; i++) wline(g, [[-10, ceilY(-10) * i / 4], [1090, ceilY(1090) * i / 4]], { w: 3, line: 'rgba(91,58,41,.25)', seed: 211 + i });
  const wx0 = 150, wx1 = 480, W = [[wx0, ceilY(wx0) - 300], [wx1, ceilY(wx1) - 300], [wx1, ceilY(wx1) - 60], [wx0, ceilY(wx0) - 60]];
  const win = skyWindow(g, W, t, {});
  // wainscot + floor
  rbox(g, -20, FLOOR_Y - 90, 1120, 20, 6, { fill: PAL.cream2, seed: 215 });
  g.fillStyle = PAL.floor; g.fillRect(0, FLOOR_Y, E.W, E.H - FLOOR_Y); wline(g, [[-10, FLOOR_Y], [1090, FLOOR_Y]], { w: 6, seed: 216 });
  for (let i = 1; i < 9; i++) { const y = FLOOR_Y + Math.pow(i / 9, 1.5) * (E.H - FLOOR_Y); wline(g, [[-10, y], [1090, y]], { w: 3, line: 'rgba(91,58,41,.22)', seed: 217 + i }); }
  // wall decor
  wallClock(g, 650, 820, 52, { h: 2, m: 0 });
  rbox(g, 390, 760, 150, 120, 10, { fill: PAL.cream, w: 6, seed: 230 }); oval(g, 450, 820, 42, 26, { fill: PAL.apricot, w: 4, seed: 231 }); shape(g, [[488, 820], [516, 800], [516, 840]], { fill: PAL.apricot, w: 4, step: 1e9, seed: 232 }); dot(g, 435, 814, 5, PAL.line); // fish poster
  const bulbs = stringLights(g, 20, ceilY(20) + 40, 1060, ceilY(1060) + 40, { sag: 90, n: 15, t, on: lightsOn });
  hangingPlant(g, 900, ceilY(900), 120, 0.8, { t });
  plant(g, 110, FLOOR_Y + 70, 1.0, { t });
  const fr = miniFridge(g, 800, 930, 220, 360, { open: fridgeOpen, t });
  rug(g, 540, 1560, 470, 150);
  let tb = null; if (table) { lowTable(g, table[0], table[1], table[2]); tb = [table[0], table[1]]; }
  let fl = null, frr = null; if (futons) { fl = futon(g, 30, 1360, 420, 120, { color: '#f4e6cf' }).pillow; frr = futon(g, 600, 1460, 440, 130, { color: '#f9dccb', px: 0.22 }).pillow; }
  if (o.cushion !== false) cushion(g, cushionAt[0], cushionAt[1], 150);
  const lights = [...bulbs.map(([x, y, c]) => ({ x, y, r: 150, k: 0.75 * lightsOn, color: c, glow: 0.12 * lightsOn, gr: 90 })), { x: win.moon[0], y: win.moon[1], r: 260, k: 0.6 }];
  if (fridgeOpen > 0) lights.push({ x: fr.light[0], y: fr.light[1], r: 520 * fridgeOpen, k: 0.95 * fridgeOpen, color: PAL.fridgeLight, glow: 0.3 * fridgeOpen, gr: 300 });
  return { bulbs, window: win, fridge: fr, table: tb, futonL: fl, futonR: frr, cushion: cushionAt, lights, floorY: FLOOR_Y };
}
