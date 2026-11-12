// Sticks After Dark #7 "Snow Tracks" (60-70 s cut). Accent: cold blue moonlight on white snow.
// Sets not in the kit (cabin, snow field with perspective footprints, window seen from inside, latch close-up,
// door locks, sleeping face) live here, not in the kit.
import * as K from '/kits/sticks/sticks.js';
const { INK, stickFigure, stickHead, chalk, rect, line, ellipse, circleLine, lerp, clamp, prog, ease, rng, mix, alpha } = K;

const BLUE = '#9cc4ff';
K.setAccent(BLUE);
const CHECK1 = 27.80, CHECK2 = 28.45;   // "checked" / "twice": the latch rattles, locked
const BOLT = 44.05, CHAIN = 44.75;      // "locked every door"
const BACK = 57.61;                     // "Coming back.": the hand on the frame, jitter + sting

// ---------------------------------------------------------------- palette helpers (night 1 = moonlit, 0 = grey morning)
const SKY = n => mix('#30384a', '#060a15', n);
const SNOW = n => mix('#7f8ba0', '#1d2944', n);
const PRINT = n => mix('#3c475b', '#0b111f', n);
const LIP = n => mix('#b8c4d6', '#5d7bb0', n);

// ---------------------------------------------------------------- falling snow (global-time based, continuous across cuts)
function snowfall(g, o = {}) {
  const { n = 120, x = -40, y = -40, w = 1160, h = 2000, a = 1, speed = 1, seed = 7, size = 1, wind = 0.25 } = o; const T = K.K.now;
  g.save();
  for (let i = 0; i < n; i++) {
    const r = rng(seed * 101 + i * 7); const depth = r(), sp = (40 + 110 * depth) * speed, sz = (1.4 + 4.2 * depth) * size;
    const yy = y + ((r() * h + T * sp) % h), xx = x + ((r() * w + T * sp * wind + Math.sin(T * (0.6 + r()) + i) * 18) % w + w) % w;
    g.fillStyle = alpha('#f2f6ff', (0.35 + 0.55 * depth) * a); g.beginPath(); g.arc(xx, yy, sz, 0, Math.PI * 2); g.fill();
  }
  g.restore();
}

// ---------------------------------------------------------------- the snow field in perspective
// H = horizon y, yN = screen y of the ground at depth z = 1, cx = vanishing x. World x unit = (yN - H) px at z = 1.
const P = (F, wx, z) => [F.cx + wx * (F.yN - F.H) / z, F.H + (F.yN - F.H) / z];
// a too-long bare footprint on the ground at (wx, z). dir +1 = toes point away (toward the woods), -1 = toward the cabin.
function footprint(g, F, wx, z, dir, side, col, lip, a = 1) {
  if (a <= 0) return; const L = 0.11, Wd = 0.045;
  const pt = (u, v) => P(F, wx + u, z + v * dir);          // u lateral, v along the walking direction
  const [sx, sy] = P(F, wx, z), [ex] = P(F, wx + Wd, z), px = Math.abs(ex - sx);
  g.save(); g.globalAlpha *= a;
  // sole (heel at v=-L, ball at v=+L): narrow, too long
  const sole = []; for (let i = 0; i <= 18; i++) { const th = i / 18 * Math.PI * 2; const sw = Wd * (Math.cos(th) > 0 ? 1 : 0.78); sole.push(pt(Math.sin(th) * sw + side * 0.006 * Math.cos(th), Math.cos(th) * L)); }
  g.fillStyle = col; g.beginPath(); sole.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill();
  // toes: five, far too long, fanned
  g.strokeStyle = col; g.lineCap = 'round';
  for (let k = 0; k < 5; k++) {
    const u0 = (k - 2) * Wd * 0.42 * side * -1, len = L * (k === 0 || k === 4 ? 0.7 : 0.95) + 0.012 * (2 - Math.abs(k - 2));
    const a0 = pt(u0, L * 0.92), a1 = pt(u0 * 1.5, L + len * 0.6), a2 = pt(u0 * 1.9, L + len);
    g.lineWidth = Math.max(0.8, px * 0.32); g.beginPath(); g.moveTo(...a0); g.quadraticCurveTo(...a1, ...a2); g.stroke();
  }
  // a pale snow lip along the far edge
  if (px > 3) { g.strokeStyle = alpha(lip, 0.55); g.lineWidth = Math.max(1, px * 0.12); g.beginPath(); for (let i = 0; i <= 8; i++) { const th = -Math.PI / 2 + i / 8 * Math.PI; const [x, y] = pt(Math.sin(th) * Wd * 1.1, Math.cos(th) * L * 1.06 * dir * dir); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
  g.restore();
}
// a line of prints. dir +1 = walking away (start near), -1 = walking toward (start far). n = how many show (from the walker's start).
function trackLine(g, F, o = {}) {
  const { dir = 1, n = 99, z0 = 1.0, z1 = 15, wx0 = 0.02, wx1 = -0.3, a = 1, night = 1, step = 0.75, fresh = null } = o;
  const N = Math.floor((z1 - z0) / step); const col = PRINT(night), lip = LIP(night);
  const list = []; for (let i = 0; i <= N; i++) { const z = z0 + i * step, k = (z - z0) / (z1 - z0); list.push({ i, z, wx: lerp(wx0, wx1, k) + (i % 2 ? 0.075 : -0.075), side: i % 2 ? 1 : -1 }); }
  const order = dir > 0 ? list : [...list].reverse();       // walking order
  const shown = order.slice(0, Math.max(0, Math.min(order.length, Math.floor(n))));
  // draw far to near
  shown.sort((p, q) => q.z - p.z).forEach(p => { const fa = fresh && p === shown[shown.length - 1] ? fresh : 1; footprint(g, F, p.wx, p.z, dir, p.side, col, lip, a * fa); });
  return order.length;
}
// pine treeline at the horizon (a black mass with boiling chalk tops). hs scales the trees.
function treeline(g, F, o = {}) {
  const { hs = 1, night = 1, seed = 3 } = o; const r = rng(seed), H = F.H, tops = [];
  for (let x = -80; x <= 1160; x += 46 * hs) { const h = (110 + r() * 170) * hs; tops.push([x, H - h], [x + 23 * hs, H - h * (0.45 + r() * 0.2)]); }
  g.fillStyle = mix('#0b0e15', '#020308', night); g.beginPath(); g.moveTo(-80, H + 8); tops.forEach(p => g.lineTo(...p)); g.lineTo(1160, H + 8); g.closePath(); g.fill();
  chalk(g, tops, { w: 2.5 * Math.min(2, hs), a: 0.32, seed: seed + 10, step: 40, double: false, color: mix(INK.dim, BLUE, 0.4 * night) });
  for (let i = 0; i < 9; i++) { const x = 40 + i * 125 + r() * 40; line(g, x, H + 6, x + (r() - 0.5) * 6, H - 90 * hs, { w: 3 * Math.min(2, hs), a: 0.22, seed: seed + 30 + i, double: false }); }
  g.fillStyle = alpha(mix('#0b0e15', '#020308', night), 0.6); g.fillRect(-80, H - 4, 1240, 14);
}
// the whole outdoor view, drawn over the full canvas (clip it for a window)
function field(g, F, o = {}) {
  const night = o.night ?? 1;
  g.fillStyle = SKY(night); g.fillRect(-80, -80, 1240, F.H + 90);
  if (night > 0.3 && o.moon !== false) { const mx = o.moonX ?? 800, my = o.moonY ?? F.H - 470; K.lightPool(g, mx, my, 520, BLUE, 0.45 * night); g.fillStyle = alpha('#dfeaff', 0.85 * night); g.beginPath(); g.arc(mx, my, 44, 0, 7); g.fill(); circleLine(g, mx, my, 46, { w: 3, seed: 61, color: '#ffffff', a: night }); }
  if (night < 0.7) K.lightPool(g, 540, F.H - 200, 900, '#c8d0dc', 0.25 * (1 - night));
  g.fillStyle = SNOW(night); g.fillRect(-80, F.H, 1240, 2100);
  // moonlight on the snow + soft drifts
  K.lightPool(g, F.cx + 120, F.H + (F.yN - F.H) * 0.35, 1100, BLUE, 0.28 * night + 0.06);
  for (let i = 1; i < 7; i++) { const z = 1 + i * i * 0.45, y = F.H + (F.yN - F.H) / z, r = rng(400 + i); chalk(g, [[-60, y + 8], [300 + r() * 200, y - 6], [700 + r() * 150, y + 6], [1140, y - 4]], { w: Math.max(1.5, 4 / Math.sqrt(z)), a: 0.18, seed: 410 + i, double: false, color: LIP(night) }); }
  if (o.old) trackLine(g, F, { ...o.old, night });
  if (o.tracks) trackLine(g, F, { ...o.tracks, night });
  treeline(g, F, { hs: o.hs ?? 1, night });
  if (o.thing) { // too-tall shape at the edge of the trees: only its legs show against the snow
    K.tallFigure(g, o.thing.x, F.H + 18 * (o.hs ?? 1), o.thing.h ?? 300, { rim: o.thing.rim ?? 0.12, color: '#010103', armSwing: Math.sin(K.K.now * 1.7) * 0.05, seed: 951 });
  }
}
// the window seen from inside the cabin. W = glass rect. inside(F) draws the outdoor view.
const WIN = [170, 250, 740, 990];
function cabinWall(g, night = 1) {
  g.fillStyle = mix('#11131a', '#07080d', night); g.fillRect(-80, -80, 1240, 2100);
  for (let y = 40, i = 0; y < 1960; y += 88, i++) chalk(g, [[-60, y], [1140, y + 4]], { w: 2.5, a: 0.16, seed: 300 + i, double: false });
}
function windowInside(g, F, o = {}) {
  const [x, y, w, h] = WIN, night = o.night ?? 1;
  cabinWall(g, night);
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); field(g, F, o); if (o.snow !== false) snowfall(g, { n: o.snowN ?? 110, a: o.snowA ?? 0.9 }); if (o.inside) o.inside(g);
  // glass: faint reflection streaks
  g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = alpha('#9cc4ff', 0.035); g.beginPath(); g.moveTo(x + w * 0.1, y); g.lineTo(x + w * 0.32, y); g.lineTo(x + w * 0.02, y + h); g.lineTo(x - w * 0.2, y + h); g.fill(); g.restore();
  g.restore();
  if (o.hand) o.hand(g);
  // frame, sashes, meeting rail with the latch, sill
  const fc = mix('#191c25', '#0b0d14', night);
  g.fillStyle = fc; g.fillRect(x - 36, y - 36, w + 72, 36); g.fillRect(x - 36, y, 36, h); g.fillRect(x + w, y, 36, h); g.fillRect(x - 70, y + h, w + 140, 54);
  const my = y + h / 2; g.fillRect(x, my - 22, w, 44); g.fillRect(x + w / 2 - 10, y, 20, h);
  rect(g, x - 36, y - 36, w + 72, h + 36, { w: 5, seed: 71 }); rect(g, x, y, w, h, { w: 3, seed: 72, a: 0.8 });
  line(g, x - 70, y + h + 54, x + w + 70, y + h + 54, { w: 4, seed: 73 }); line(g, x - 70, y + h, x + w + 70, y + h, { w: 4, seed: 74 });
  rect(g, x, my - 22, w, 44, { w: 3, seed: 75, a: 0.75 }); line(g, x + w / 2, y, x + w / 2, my - 22, { w: 3, seed: 76, a: 0.7 }); line(g, x + w / 2, my + 22, x + w / 2, y + h, { w: 3, seed: 77, a: 0.7 });
  // crescent latch at the centre, locked
  g.fillStyle = '#c9cfdb'; g.fillRect(x + w / 2 - 34, my - 6, 68, 18); g.beginPath(); g.arc(x + w / 2, my - 4, 24, Math.PI, 0); g.fill();
  // moonlight spilling into the room
  if (night > 0.2) { K.beam(g, x + w / 2, y + h * 0.6, Math.PI * 0.5, 900, 0.5, BLUE, 0.22 * night); K.lightPool(g, x + w / 2, y + h / 2, 760, BLUE, 0.16 * night); }
}

// ---------------------------------------------------------------- the cabin from outside
function cabin(g, x, gy, s, o = {}) {
  const night = o.night ?? 1, w = 420 * s, h = 250 * s, x0 = x - w / 2;
  g.fillStyle = '#0a0d15'; g.fillRect(x0, gy - h, w, h);
  for (let i = 1; i < 8; i++) line(g, x0, gy - i * h / 8, x0 + w, gy - i * h / 8, { w: 2.2 * s, a: 0.4, seed: 500 + i, double: false });
  rect(g, x0, gy - h, w, h, { w: 4 * s, seed: 510 });
  // roof with a thick snow cap
  const ry = gy - h, peak = ry - 190 * s;
  g.fillStyle = '#080a10'; g.beginPath(); g.moveTo(x0 - 50 * s, ry + 10 * s); g.lineTo(x, peak); g.lineTo(x0 + w + 50 * s, ry + 10 * s); g.closePath(); g.fill();
  g.fillStyle = mix('#aeb9ca', '#9db4dc', night); g.beginPath(); g.moveTo(x0 - 56 * s, ry + 4 * s); g.lineTo(x, peak - 14 * s); g.lineTo(x0 + w + 56 * s, ry + 4 * s); g.lineTo(x0 + w + 40 * s, ry + 18 * s); g.lineTo(x, peak + 26 * s); g.lineTo(x0 - 40 * s, ry + 18 * s); g.closePath(); g.fill();
  chalk(g, [[x0 - 56 * s, ry + 4 * s], [x, peak - 14 * s], [x0 + w + 56 * s, ry + 4 * s]], { w: 4 * s, seed: 520 });
  rect(g, x + 80 * s, peak + 30 * s, 46 * s, 110 * s, { w: 3.5 * s, seed: 521 }); g.fillStyle = '#080a10'; g.fillRect(x + 80 * s, peak + 30 * s, 46 * s, 110 * s);
  // a window (dark) and the door
  const wx = x0 + 60 * s, wy = gy - h + 70 * s; g.fillStyle = '#03050a'; g.fillRect(wx, wy, 90 * s, 100 * s); rect(g, wx, wy, 90 * s, 100 * s, { w: 3 * s, seed: 530 }); line(g, wx + 45 * s, wy, wx + 45 * s, wy + 100 * s, { w: 2 * s, seed: 531, double: false }); line(g, wx, wy + 50 * s, wx + 90 * s, wy + 50 * s, { w: 2 * s, seed: 532, double: false });
  rect(g, x + 60 * s, gy - 170 * s, 80 * s, 170 * s, { w: 3 * s, seed: 533 });
  // snow drift against the wall
  g.fillStyle = SNOW(night); g.beginPath(); g.moveTo(x0 - 60 * s, gy + 4); g.quadraticCurveTo(x, gy - 30 * s, x0 + w + 60 * s, gy + 4); g.closePath(); g.fill();
}

// ---------------------------------------------------------------- my room
const ROOM = { back: [150, 470, 780, 980], win: [420, 560, 300, 360], bed: [560, 1440, 360], door: [190, 900, 160, 550] };
function miniWindow(g, r, F, o = {}) {
  const [x, y, w, h] = r, s = w / 740; g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  g.translate(x - WIN[0] * s, y - WIN[1] * s); g.scale(s, s); field(g, F, o); if (o.snow !== false) snowfall(g, { n: 90, a: 0.9, size: 1.4 }); g.restore();
  rect(g, x - 14, y - 14, w + 28, h + 28, { w: 5, seed: 610 }); line(g, x + w / 2, y, x + w / 2, y + h, { w: 3, seed: 611 }); line(g, x, y + h / 2, x + w, y + h / 2, { w: 5, seed: 612 });
  g.fillStyle = '#c9cfdb'; g.beginPath(); g.arc(x + w / 2, y + h / 2 - 3, 8, Math.PI, 0); g.fill();
  line(g, x - 30, y + h + 16, x + w + 30, y + h + 16, { w: 4, seed: 613 });
}
const MINI_NIGHT = { H: 900, yN: 1700, cx: 540 };
function meInBed(g, x, y, w, f = {}, o = {}) {
  const h = w * 0.28; K.bed(g, x, y, w);
  if (o.empty) return;
  stickHead(g, x + w * 0.14, y - h * 1.22, 26, { eyes: 'closed', mouth: 'none', ...f }, { neck: false, seed: 1401 });
  g.fillStyle = '#0d1019'; g.beginPath(); g.moveTo(x + w * 0.08, y - h * 1.05); g.quadraticCurveTo(x + w * 0.4, y - h * 1.45, x + w * 0.7, y - h * 1.2); g.quadraticCurveTo(x + w * 0.85, y - h * 1.1, x + w, y - h * 1.02); g.lineTo(x + w, y - h * 0.55); g.lineTo(x + w * 0.08, y - h * 0.55); g.closePath(); g.fill();
  chalk(g, [[x + w * 0.08, y - h * 1.05], [x + w * 0.4, y - h * 1.32], [x + w * 0.7, y - h * 1.2], [x + w, y - h * 1.02]], { w: 4, seed: 1402 });
}
function myRoom(g, t, o = {}) {
  const night = o.night ?? 1;
  const L = K.roomBox(g, { back: ROOM.back, seed: 400, wall: mix('#151821', '#0b0d14', night) });
  const [bx, by, bw, bh] = L.back;
  for (let i = 1; i < 11; i++) line(g, bx, by + i * bh / 11, bx + bw, by + i * bh / 11, { w: 2, a: 0.13, seed: 440 + i, double: false });  // log wall
  miniWindow(g, ROOM.win, o.F || MINI_NIGHT, { night, old: o.old, tracks: o.tracks, moonX: 760, moonY: 520 });
  K.door(g, ...ROOM.door, { seed: 420 });
  if (o.bed !== false) meInBed(g, ...ROOM.bed, o.face || {}, { empty: o.empty });
  const [wx, wy, ww, wh] = ROOM.win;
  K.beam(g, wx + ww / 2, wy + wh / 2, Math.PI * 0.42, 1100, 0.33, night > 0.5 ? BLUE : '#c8d0dc', 0.25);
  K.darkness(g, o.dark ?? 0.45, [{ x: wx + ww / 2, y: wy + wh / 2 + 200, r: 700, k: 0.75 }, ...(o.lights || [])]);
  return L;
}
const coldMemory = (g) => { g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgba(120,135,165,1)'; g.fillRect(-80, -80, 1240, 2100); g.restore(); };

// ---------------------------------------------------------------- close-ups
// the crescent latch where the two sashes meet. rattle = vertical shove of the lower sash (px)
function latchClose(g, t, o = {}) {
  const night = o.night ?? 0, rattle = o.rattle || 0;
  g.fillStyle = SKY(night); g.fillRect(-80, -80, 1240, 2100);
  // glass above + below: the snow field blurred behind
  g.fillStyle = mix(SNOW(night), SKY(night), 0.3); g.fillRect(-80, 1180, 1240, 900); K.lightPool(g, 700, 300, 900, night > 0.5 ? BLUE : '#c8d0dc', 0.18);
  const ry = 900;
  g.fillStyle = '#12151d'; g.fillRect(-80, ry - 190, 1240, 190);                     // upper sash bottom rail
  g.save(); g.translate(0, -rattle); g.fillStyle = '#161a23'; g.fillRect(-80, ry, 1240, 200);   // lower sash top rail (moves when shoved)
  rect(g, -60, ry, 1200, 200, { w: 4, seed: 801 });
  // latch base + lever on the lower sash
  g.fillStyle = '#b8bfcc'; g.fillRect(380, ry + 18, 300, 70); rect(g, 380, ry + 18, 300, 70, { w: 3.5, seed: 802 });
  circleLine(g, 420, ry + 53, 9, { w: 3, seed: 803 }); circleLine(g, 640, ry + 53, 9, { w: 3, seed: 804 });
  // lever (thumb tab) to the right
  g.fillStyle = '#c9cfdb'; g.beginPath(); g.moveTo(600, ry + 30); g.lineTo(760, ry + 10); g.lineTo(770, ry + 40); g.lineTo(610, ry + 70); g.closePath(); g.fill(); chalk(g, [[600, ry + 30], [760, ry + 10], [770, ry + 40], [610, ry + 70]], { w: 3, seed: 805, closed: true });
  g.restore();
  rect(g, -60, ry - 190, 1200, 190, { w: 4, seed: 806 });
  // the crescent cam, turned INTO the keeper on the upper sash (locked)
  g.fillStyle = '#d7dce6'; g.beginPath(); g.arc(530, ry + 20, 120, Math.PI * 1.05, Math.PI * 1.95); g.arc(530, ry + 50, 96, Math.PI * 1.9, Math.PI * 1.1, true); g.closePath(); g.fill();
  chalk(g, (() => { const p = []; for (let i = 0; i <= 12; i++) { const a = Math.PI * (1.05 + 0.9 * i / 12); p.push([530 + Math.cos(a) * 120, ry + 20 + Math.sin(a) * 120]); } return p; })(), { w: 3.5, seed: 807 });
  g.fillStyle = '#8f97a6'; g.fillRect(420, ry - 110, 220, 60); rect(g, 420, ry - 110, 220, 60, { w: 3, seed: 808 });
  return ry;
}
// stick arm reaching in from the bottom right to (hx, hy)
function myArm(g, hx, hy, o = {}) {
  const sx = o.sx ?? 1000, sy = o.sy ?? 2000, ex = lerp(sx, hx, 0.55) + 60, ey = lerp(sy, hy, 0.55) + 30;
  chalk(g, [[sx, sy], [ex, ey], [hx, hy]], { w: 16, seed: 820, step: 60 });
  for (let i = 0; i < 3; i++) chalk(g, [[hx, hy], [hx - 44 + i * 6, hy - 16 + i * 18]], { w: 11, seed: 830 + i, double: false });
  chalk(g, [[hx, hy], [hx - 10, hy - 40]], { w: 11, seed: 835, double: false });
}
// the front door with a deadbolt and a chain. bolt 0..1 (turned), chain 0..1 (slid in)
function doorLocks(g, t, bolt, chain) {
  g.fillStyle = '#0b0d14'; g.fillRect(-80, -80, 1240, 2100);
  g.fillStyle = '#12141c'; g.fillRect(140, -80, 640, 2100);
  for (let i = 0; i < 5; i++) line(g, 140 + i * 128, -80, 140 + i * 128, 2040, { w: 2.2, a: 0.3, seed: 700 + i, double: false });
  line(g, 140, -80, 140, 2040, { w: 5, seed: 706 }); line(g, 780, -80, 780, 2040, { w: 5, seed: 707 });
  line(g, 820, -80, 820, 2040, { w: 4, seed: 708, a: 0.7 });     // frame
  // deadbolt thumb-turn
  const cx = 660, cy = 980; circleLine(g, cx, cy, 70, { w: 4, seed: 710 }); g.save(); g.translate(cx, cy); g.rotate(ease.inOut(clamp(bolt)) * Math.PI / 2); g.fillStyle = '#c9cfdb'; g.fillRect(-14, -58, 28, 116); g.restore();
  g.fillStyle = '#c9cfdb'; g.fillRect(780 + 60 * ease.out(clamp(bolt)) - 60, cy - 18, 60, 36);  // the bolt slides into the frame
  // chain: track on the frame, chain on the door
  g.fillStyle = '#9aa3b2'; g.fillRect(840, 640, 160, 34); rect(g, 840, 640, 160, 34, { w: 3, seed: 720 });
  const k = ease.inOut(clamp(chain)), end = [lerp(700, 950, k), lerp(820, 657, k)], mid = [lerp(640, 790, k), lerp(900, 700, k)];
  const pts = []; for (let i = 0; i <= 12; i++) { const u = i / 12; pts.push([(1 - u) * (1 - u) * 600 + 2 * u * (1 - u) * mid[0] + u * u * end[0], (1 - u) * (1 - u) * 690 + 2 * u * (1 - u) * mid[1] + u * u * end[1]]); }
  g.fillStyle = '#9aa3b2'; g.fillRect(560, 660, 80, 60);
  for (const [x, y] of pts) { g.strokeStyle = '#c9cfdb'; g.lineWidth = 4; g.beginPath(); g.ellipse(x, y, 11, 7, 0.4, 0, 7); g.stroke(); }
  g.fillStyle = '#c9cfdb'; g.beginPath(); g.arc(end[0], end[1], 14, 0, 7); g.fill();
  return { cx, cy, end };
}
// long finger shadow sliding over a lit area
function fingerShadow(g, x, y, k = 1) {
  g.save(); g.globalAlpha *= k; g.fillStyle = 'rgba(2,3,6,0.85)';
  for (let i = 0; i < 4; i++) { const yy = y + i * 70; g.beginPath(); g.moveTo(x - 600, yy - 26); g.quadraticCurveTo(x - 100, yy - 30 - i * 4, x + 120 - i * 10, yy + 6); g.quadraticCurveTo(x - 100, yy + 26, x - 600, yy + 24); g.closePath(); g.fill(); }
  g.fillRect(x - 1400, y - 40, 820, 300); g.restore();
}

// ================================================================ shots
const F_LEVEL = (H = 640, yN = 1500) => ({ H, yN, cx: 540 });
const AWAY = { dir: 1, z0: 1.15, z1: 15, wx0: 0.03, wx1: -0.32 };
const TOWARD = { dir: -1, z0: 1.15, z1: 15, wx0: 0.05, wx1: 0.34 };

// 1. frame 1: snow past the window at night; something tall moving at the treeline
K.stickShot('s01_window_night', (g, t) => {
  g.save(); K.camera(g, 1.08 - 0.03 * t, 540, 760);
  windowInside(g, F_LEVEL(820, 1750), { night: 1, snowN: 150, thing: { x: lerp(290, 370, t / 2.3), h: 430, rim: 0.3 } }); g.restore();
});
// 2. the cabin alone in the snow, six miles from anything (pull back)
K.stickShot('s02_cabin_far', (g, t) => {
  g.save(); K.camera(g, 1.35 - 0.2 * ease.out(prog(t, 0, 1.5)), 540, 900);
  const F = { H: 800, yN: 2400, cx: 540 }; field(g, F, { night: 1, moonX: 820, moonY: 360 }); cabin(g, 540, 1010, 0.55, { night: 1 });
  // the nearest road: a faint line far off on the left
  chalk(g, [[-60, 850], [160, 820], [300, 808]], { w: 2, a: 0.25, seed: 950, double: false, color: BLUE });
  snowfall(g, { n: 90, a: 0.8 }); g.restore();
});
// 3. "it snowed": close on the cabin roof, heavy snow
K.stickShot('s03_snowfall', (g, t) => {
  g.save(); K.camera(g, 1.0 + 0.04 * t, 540, 1000, ...K.drift(6));
  const F = { H: 1180, yN: 2600, cx: 540 }; field(g, F, { night: 1, moonX: 860, moonY: 380 }); cabin(g, 520, 1500, 1.35, { night: 1 });
  snowfall(g, { n: 220, a: 1, speed: 1.3, size: 1.2 }); g.restore();
});
// 4. "first time this winter": me asleep, snow falling past my window
K.stickShot('s04_asleep', (g, t) => { g.save(); K.camera(g, 1.12 + 0.04 * t, 640, 1000); myRoom(g, t, { night: 1 }); g.restore(); });
// 5. "This morning, I looked out my bedroom window.": grey morning, I walk to the window
K.stickShot('s05_morning', (g, t) => {
  g.save(); K.camera(g, 1.05, 560, 1000);
  myRoom(g, t, { night: 0, empty: true, dark: 0.25, old: AWAY });
  const k = ease.inOut(prog(t, 0, 1.8)), x = lerp(840, 570, k);
  if (t < 1.8) stickFigure(g, K.walk(t * 1.1), { eyes: 'half', mouth: 'flat' }, { x, y: 1700, s: 1.55, flip: -1, seed: 31 });
  else stickFigure(g, K.posesMix('stand', 'freeze', prog(t, 1.8, 2.4)), {}, { x, y: 1700, s: 1.55, back: true, seed: 31 });
  g.restore();
});
// 6. "Footprints.": out the window, a clean white field, one line of prints
K.stickShot('s06_footprints', (g, t) => { g.save(); K.camera(g, 1.0 + 0.05 * t, 540, 900); windowInside(g, F_LEVEL(), { night: 0, snowN: 30, snowA: 0.5, tracks: AWAY }); g.restore(); });
// 7. "Bare feet.": one print, close, top-down. Toes far too long.
K.stickShot('s07_bare_feet', (g, t) => {
  g.save(); K.camera(g, 1.0 + 0.06 * t, 540, 900); g.fillStyle = SNOW(0); g.fillRect(-80, -80, 1240, 2100);
  K.lightPool(g, 600, 600, 1200, '#dfe6f0', 0.25);
  for (let i = 0; i < 26; i++) { const r = rng(900 + i); chalk(g, [[r() * 1080, r() * 1920], [r() * 1080 + 80, r() * 1920 + 10]], { w: 1.5, a: 0.12, seed: 910 + i, double: false }); }
  // drawn flat: sole + five long toes
  const foot = (cx, cy, s, rot, seed) => {
    g.save(); g.translate(cx, cy); g.rotate(rot); g.scale(s, s);
    g.fillStyle = PRINT(0); g.beginPath(); g.ellipse(0, 40, 64, 190, 0, 0, 7); g.fill();
    g.strokeStyle = PRINT(0); g.lineCap = 'round';
    [[-58, 150], [-30, 200], [0, 215], [30, 195], [56, 140]].forEach(([dx, L], i) => { g.lineWidth = 22 - Math.abs(i - 2) * 3; g.beginPath(); g.moveTo(dx * 0.6, -120); g.quadraticCurveTo(dx * 1.1, -120 - L * 0.6, dx * 1.5, -120 - L); g.stroke(); });
    chalk(g, (() => { const p = []; for (let i = 0; i <= 20; i++) { const a = Math.PI * 0.1 + i / 20 * Math.PI * 0.8; p.push([Math.cos(a) * 70, 40 + Math.sin(a) * 200]); } return p; })(), { w: 4, a: 0.6, seed, color: LIP(0), double: false });
    g.restore();
  };
  foot(500, 1020, 1.25, 0.05, 920); foot(780, 220, 1.0, 0.12, 921);
  snowfall(g, { n: 25, a: 0.4 }); g.restore();
});
// 8. "started right under my window": the cabin wall from the side, prints leaving from below the window
K.stickShot('s08_under_window', (g, t) => {
  const pan = -620 * ease.inOut(prog(t, 0.2, 2.1));
  g.save(); g.translate(pan, 0);
  g.fillStyle = SKY(0); g.fillRect(-80, -80, 2400, 1480); g.fillStyle = SNOW(0); g.fillRect(-80, 1380, 2400, 800);
  K.lightPool(g, 900, 1100, 1300, '#d8dee8', 0.2);
  // treeline far right
  const F = { H: 1380, yN: 3000, cx: 1400 }; g.save(); g.translate(900, 0); treeline(g, F, { hs: 1.6, night: 0.2, seed: 9 }); g.restore();
  // the wall: logs, my window, the sill
  g.fillStyle = '#0d1018'; g.fillRect(-80, -80, 480, 1470);
  for (let i = 0; i < 16; i++) chalk(g, [[-80, 40 + i * 88], [400, 44 + i * 88]], { w: 3, a: 0.4, seed: 1000 + i, double: false });
  chalk(g, [[400, -80], [400, 1385]], { w: 5, seed: 1020 });
  g.fillStyle = '#03050a'; g.fillRect(150, 620, 250, 360); rect(g, 150, 620, 250, 360, { w: 4, seed: 1021 }); g.fillStyle = '#1a1e28'; g.fillRect(130, 980, 300, 30); rect(g, 130, 980, 300, 30, { w: 3, seed: 1022 });
  g.fillStyle = SNOW(0); g.beginPath(); g.moveTo(-80, 1395); g.quadraticCurveTo(200, 1330, 470, 1395); g.closePath(); g.fill();
  // prints in a shallow side view: start at the wall below the window, walk right
  for (let i = 0; i < 14; i++) { const x = 440 + i * 128, y = 1470 + (i % 2 ? 26 : -10); g.save(); g.translate(x, y); g.scale(1.5, 0.5);
    g.fillStyle = PRINT(0); g.beginPath(); g.ellipse(0, 0, 50, 22, 0, 0, 7); g.fill(); g.strokeStyle = PRINT(0); g.lineCap = 'round';
    for (let k = 0; k < 5; k++) { g.lineWidth = 7; g.beginPath(); g.moveTo(40, -14 + k * 7); g.lineTo(96 + (2 - Math.abs(k - 2)) * 8, -22 + k * 11); g.stroke(); } g.restore(); }
  snowfall(g, { n: 30, a: 0.4, w: 2400 }); g.restore();
});
// 9. "and walked away into the woods": push out the window along the line to the trees
K.stickShot('s09_into_woods', (g, t) => {
  const k = ease.inOut(prog(t, 0, 2.6)); g.save(); K.camera(g, 1.0 + 0.9 * k, 540, 640 - 30 * k, -60 * k, 120 * k);
  windowInside(g, F_LEVEL(), { night: 0, snowN: 30, snowA: 0.5, tracks: AWAY }); g.restore();
});
// 10. "No tracks coming toward the cabin.": high and wide. One line. Only away.
K.stickShot('s10_one_line', (g, t) => {
  g.save(); K.camera(g, 1.06 - 0.04 * t, 540, 1100);
  const F = { H: 430, yN: 3400, cx: 540 }; field(g, F, { night: 0, tracks: { dir: 1, z0: 2.55, z1: 15, wx0: 0.0, wx1: -0.12 } });
  cabin(g, 540, 1720, 0.9, { night: 0 }); snowfall(g, { n: 30, a: 0.4 }); g.restore();
});
// 11. "Only away.": the last prints walk into the dark between the trees
K.stickShot('s11_only_away', (g, t) => {
  g.save(); K.camera(g, 1.0 + 0.08 * t, 520, 1050);
  const F = { H: 1080, yN: 2300, cx: 540 }; field(g, F, { night: 0, hs: 3.2, tracks: { dir: 1, z0: 1.1, z1: 12, wx0: -0.05, wx1: -0.05 } });
  K.darkness(g, 0.35, [{ x: 540, y: 1500, r: 900, k: 0.8 }]); snowfall(g, { n: 25, a: 0.35 }); g.restore();
});
// 12. "My window was locked.": the latch, close. Locked.
K.stickShot('s12_latch', (g, t) => { g.save(); K.camera(g, 1.0 + 0.05 * t, 540, 900); latchClose(g, t, { night: 0 }); g.restore(); });
// 13. "From the inside.": wider: the window from inside, latch locked, my hand comes up to it
K.stickShot('s13_inside', (g, t) => {
  g.save(); K.camera(g, 1.25, 540, 760);
  windowInside(g, F_LEVEL(), { night: 0, snowN: 30, snowA: 0.5, tracks: AWAY });
  const k = ease.out(prog(t, 0.2, 1.4)); myArm(g, lerp(700, 585, k), lerp(1150, 760, k), { sx: 980, sy: 1500 }); g.restore();
});
// 14. "I checked it twice.": my hand on the lever, two shoves. It doesn't move.
K.stickShot('s14_twice', (g, t) => {
  const r1 = Math.max(0, 1 - Math.abs(K.K.now - CHECK1) * 9), r2 = Math.max(0, 1 - Math.abs(K.K.now - CHECK2) * 9), rattle = 10 * (r1 + r2);
  g.save(); K.camera(g, 1.08 + 0.02 * t, 560, 900, ...K.drift(3));
  const ry = latchClose(g, t, { night: 0, rattle }); myArm(g, 740, ry + 30 - rattle, { sx: 1150, sy: 1500 }); g.restore();
});
// 15. "So whatever made them was in here with me.": the room behind me. Slow push into the dark corner.
K.stickShot('s15_room', (g, t) => {
  const k = ease.inOut(prog(t, 0, 3.1)); g.save(); K.camera(g, 1.0 + 0.45 * k, 860, 620);
  myRoom(g, t, { night: 0, empty: true, dark: 0.35 });
  K.darkness(g, 0.55 + 0.3 * k, [{ x: 420, y: 1300, r: 900, k: 0.8 }]); g.restore();
}, { vignette: 0.85 });
// 16. "In my room.": looking down at my bed from the corner, from too high up
K.stickShot('s16_from_corner', (g, t) => {
  g.save(); K.camera(g, 1.0 + 0.05 * t, 540, 1000); g.translate(540, 1000); g.rotate(-0.12); g.translate(-540, -1000);
  g.fillStyle = '#090b11'; g.fillRect(-200, -200, 1480, 2400);
  for (let i = 0; i < 14; i++) line(g, -200, 100 + i * 150, 1280, 140 + i * 150, { w: 2, a: 0.12, seed: 1100 + i, double: false }); // floorboards
  // bed from above: frame, pillow, me, blanket
  const bx = 300, by = 520, bw = 520, bh = 980; g.fillStyle = '#10131b'; g.fillRect(bx, by, bw, bh); rect(g, bx, by, bw, bh, { w: 5, seed: 1110 });
  ellipse(g, bx + bw / 2, by + 140, 170, 70, { w: 4, seed: 1111 });
  stickHead(g, bx + bw / 2, by + 150, 62, { eyes: 'closed', mouth: 'none' }, { neck: false, seed: 1112 });
  g.fillStyle = '#0d1019'; g.fillRect(bx + 20, by + 260, bw - 40, bh - 290); chalk(g, [[bx + 20, by + 270], [bx + 260, by + 240], [bx + bw - 20, by + 275]], { w: 4, seed: 1113 });
  K.beam(g, -100, 200, 0.55, 1600, 0.18, BLUE, 0.4);
  coldMemory(g);
  // its shadow, long and thin, falls across the bed from where we stand
  g.fillStyle = 'rgba(1,2,4,0.8)'; g.beginPath(); g.moveTo(-200, 2100); g.lineTo(60, 2100); g.lineTo(420 + 10 * Math.sin(t * 1.3), 760); g.lineTo(380, 700); g.closePath(); g.fill();
  g.beginPath(); g.ellipse(410, 690, 30, 40, 0.4, 0, 7); g.fill();
  g.restore();
}, { vignette: 0.85 });
// 17. "While I slept.": my sleeping face; long finger shadows slide across the pillow
K.stickShot('s17_slept', (g, t) => {
  g.save(); K.camera(g, 1.02 + 0.03 * t, 540, 820);
  g.fillStyle = '#0b0e16'; g.fillRect(-80, -80, 1240, 2100);
  g.fillStyle = '#141824'; g.beginPath(); g.ellipse(540, 760, 470, 250, -0.05, 0, 7); g.fill(); ellipse(g, 540, 760, 470, 250, { w: 4, seed: 1201 });
  stickHead(g, 520, 760, 170, { eyes: 'closed', mouth: 'none' }, { neck: false, seed: 1202 });
  g.fillStyle = '#0d1019'; g.beginPath(); g.moveTo(-80, 1000); g.quadraticCurveTo(540, 900, 1160, 1020); g.lineTo(1160, 2100); g.lineTo(-80, 2100); g.closePath(); g.fill();
  chalk(g, [[-60, 1000], [540, 915], [1140, 1015]], { w: 5, seed: 1203 });
  K.lightPool(g, 600, 700, 700, BLUE, 0.4); coldMemory(g);
  fingerShadow(g, lerp(-200, 1500, ease.inOut(prog(t, 0.15, 1.7))), 600, 1);
  g.restore();
}, { vignette: 0.85 });
// 18. "And then it left.": the window that night: prints appear one by one, walking away
K.stickShot('s18_it_left', (g, t) => {
  const n = (t - 0.35) / 0.2; g.save(); K.camera(g, 1.05 + 0.03 * t, 540, 800);
  windowInside(g, F_LEVEL(), { night: 1, snowN: 40, snowA: 0.5, tracks: { ...AWAY, n: Math.max(0, n) + 1, fresh: clamp((n % 1) * 2) } });
  coldMemory(g); g.restore();
}, { vignette: 0.85 });
// 19. "I told myself that was the good part.": me on the edge of the bed, morning
K.stickShot('s19_good_part', (g, t) => {
  g.save(); K.camera(g, 1.25 + 0.03 * t, 700, 1100);
  myRoom(g, t, { night: 0, empty: true, dark: 0.2, old: AWAY });
  stickFigure(g, 'sit', { eyes: 'half', mouth: 'flat', look: [-0.6, 0.4], blink: K.onFrames(40.9, 3) ? 1 : 0 }, { x: 760, y: 1300, s: 1.25, anchor: 'hip', seed: 41 });
  g.restore();
});
// 20. "It left.": the line, small, ending in the trees
K.stickShot('s20_it_left', (g, t) => { g.save(); K.camera(g, 1.9 + 0.05 * t, 420, 700); windowInside(g, F_LEVEL(), { night: 0, snowN: 20, snowA: 0.4, tracks: AWAY }); g.restore(); });
// 21. "I locked every door.": deadbolt, chain
K.stickShot('s21_locks', (g, t) => {
  const b = prog(K.K.now, BOLT - 0.2, BOLT + 0.2), c = prog(K.K.now, CHAIN - 0.3, CHAIN + 0.3);
  g.save(); K.camera(g, 1.0 + 0.03 * t, 660, 900);
  const L = doorLocks(g, t, b, c); if (c < 0.05) myArm(g, L.cx + 30, L.cy + 40, { sx: 1150, sy: 1700 }); else myArm(g, L.end[0] - 10, L.end[1] + 20, { sx: 1150, sy: 1700 });
  K.darkness(g, 0.3, [{ x: 700, y: 850, r: 800 }]); g.restore();
});
// 22. "I didn't sleep.": sitting up in bed, eyes on the window, night coming back
K.stickShot('s22_awake', (g, t) => {
  const n = ease.inOut(prog(t, 0.3, 2.5)); g.save(); K.camera(g, 1.2 + 0.05 * t, 620, 1050);
  myRoom(g, t, { night: n, empty: true, dark: 0.35 + 0.25 * n, F: MINI_NIGHT });
  const [x, y, w] = ROOM.bed; const h = w * 0.28;
  stickFigure(g, 'sit', { eyes: 'wide', mouth: 'flat', look: [-1, -0.3], blink: K.onFrames(47.2, 2) ? 1 : 0 }, { x: x + w * 0.2, y: y - h * 0.62, s: 1.0, anchor: 'hip', seed: 51 });
  g.fillStyle = '#0d1019'; g.fillRect(x + w * 0.24, y - h * 0.95, w * 0.74, h * 0.42); chalk(g, [[x + w * 0.24, y - h * 0.9], [x + w * 0.6, y - h * 1.0], [x + w * 0.98, y - h * 0.92]], { w: 4, seed: 1301 });
  g.restore();
});
// 23. "It snowed again tonight.": the window at night, the old prints filling in
K.stickShot('s23_snow_again', (g, t) => {
  g.save(); K.camera(g, 1.04 - 0.03 * t, 540, 760);
  windowInside(g, F_LEVEL(760, 1700), { night: 1, snowN: 170, old: { ...AWAY, a: 0.35 - 0.12 * t } }); g.restore();
});
// 24. "I just checked the window.": I walk to it in the dark
K.stickShot('s24_check', (g, t) => {
  g.save(); K.camera(g, 1.05, 560, 1000);
  myRoom(g, t, { night: 1, empty: true, dark: 0.5 });
  const k = ease.inOut(prog(t, 0, 1.2)), x = lerp(820, 570, k);
  if (t < 1.2) stickFigure(g, K.walk(t * 1.2), { eyes: 'dot', mouth: 'flat' }, { x, y: 1700, s: 1.55, flip: -1, seed: 31 });
  else stickFigure(g, 'freeze', {}, { x, y: 1700, s: 1.55, back: true, seed: 31 });
  g.restore();
});
// 25. held silent frame: out the window, level with the woods. Nothing moves but the snow.
K.stickShot('s25_held', (g, t) => { g.save(); K.camera(g, 1.0, 540, 760); windowInside(g, { H: 1120, yN: 2100, cx: 540 }, { night: 1, snowN: 120 }); g.restore(); }, { vignette: 0.85 });
// 26. "There's a new set of tracks.": tilt down. A new line, out of the woods, toward my window.
K.stickShot('s26_new_tracks', (g, t) => {
  const k = ease.inOut(prog(t, 0.15, 2.8)), F = { H: lerp(1120, 520, k), yN: lerp(2100, 1330, k), cx: 540 };
  g.save(); K.camera(g, 1.0 + 0.06 * k, 540, 900);
  windowInside(g, F, { night: 1, snowN: 110, old: { ...AWAY, a: 0.1 }, tracks: TOWARD }); g.restore();
}, { vignette: 0.85 });
// 27. "Coming back.": the last prints right under the glass. A long hand rests on the outside of the frame.
function longHand(g, k) {
  if (k <= 0) return; const [x, y, w, h] = WIN, by = y + h; g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  // fingers rise from below the sill (outside), long and thin, three knuckles each, resting flat on the glass
  const base = [[300, 0, 250, -0.10], [345, 1, 310, -0.03], [392, 2, 330, 0.03], [438, 3, 270, 0.10]];
  g.fillStyle = 'rgba(1,2,5,0.85)'; g.beginPath(); g.ellipse(370, by + 10, 120, 60, 0, Math.PI, 0); g.fill();   // the back of the hand, dark below
  for (const [fx, i, L, sp] of base) {
    const pts = []; let px = fx, py = by + 10, ang = -Math.PI / 2 + sp;
    pts.push([px, py]); for (let j = 0; j < 3; j++) { const seg = L * [0.42, 0.33, 0.25][j]; ang += [0, 0.06, 0.12][j] * (i < 2 ? -1 : 1); px += Math.cos(ang) * seg; py += Math.sin(ang) * seg; pts.push([px, py]); }
    chalk(g, pts, { w: 8, color: '#dce7f7', a: k, seed: 1500 + i, double: true, step: 26, wob: 1.0 });
    for (let j = 1; j < 3; j++) { const [kx, ky] = pts[j]; chalk(g, [[kx - 9, ky], [kx + 9, ky]], { w: 2.5, color: '#dce7f7', a: 0.6 * k, seed: 1530 + i * 3 + j, double: false, wob: 0.5 }); }
    K.lightPool(g, px, py, 50, '#ffffff', 0.18 * k);
  }
  chalk(g, [[250, by + 10], [262, by - 50], [290, by - 95]], { w: 8, color: '#dce7f7', a: k, seed: 1520 }); // thumb
  g.restore();
}
K.stickShot('s27_coming_back', (g, t, info) => {
  const F = { H: 520, yN: 1330, cx: 540 }, hk = K.K.now >= BACK ? 1 : 0;
  g.save(); K.camera(g, 1.32 + 0.04 * prog(K.K.now, BACK, BACK + 2.7), 540, 1240, 0, -250);
  windowInside(g, F, { night: 1, snowN: 110, old: { ...AWAY, a: 0.1 }, tracks: TOWARD, hand: (gg) => longHand(gg, hk) }); g.restore();
}, { vignette: 0.85, jitterAmp: 30 });
K.stickShot('s28_end', (g, t) => K.endCard(g, t), { captions: false, fx: false });
