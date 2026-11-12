// Sticks After Dark #6 "Elevator" (~66 s). Office elevator at night.
// ONE accent: sickly green-white elevator light; the floor display is amber.
import * as K from '/kits/sticks/sticks.js';
import { wordTime } from '/engine/core.js';
const { INK, stickFigure, stickHead, POSES, ease, prog, key, clamp, lerp, alpha, mix, text } = K;
K.setAccent('#cfe8b4');
const AMBER = '#ffb43a';
const LIGHT = K.K.accent;

const WT = (w, after = 0) => wordTime(w, after) ?? after;
const T_SOMEONE = WT('someone', 58);

const light = (seed = 3, extra = {}) => K.flicker({ seed, depth: 0.14, dips: 0.45, ...extra });

// ------------------------------------------------------------------ amber floor display
function digit(g, x, y, str, o = {}) {
  const { size = 90, k = 1, arrow = 'down', box = true } = o;
  if (box) { g.fillStyle = '#050506'; g.fillRect(x - size * 0.95, y - size * 0.62, size * 1.9, size * 1.24); K.rect(g, x - size * 0.95, y - size * 0.62, size * 1.9, size * 1.24, { w: Math.max(2.5, size * 0.04), seed: 901, a: 0.85 }); }
  K.lightPool(g, x, y, size * 2.4, AMBER, 0.55 * k);
  text(g, str, x + size * 0.18, y + size * 0.04, { size, font: 'Fredoka', weight: 700, color: mix('#3a2408', AMBER, k), glow: size * 0.35 * k, glowColor: alpha(AMBER, 0.8) });
  if (arrow) { const ax = x - size * 0.55, ay = y, s = size * 0.16, d = arrow === 'down' ? 1 : -1; K.fillPoly(g, [[ax - s, ay - s * 0.6 * d], [ax + s, ay - s * 0.6 * d], [ax, ay + s * 0.8 * d]], alpha(AMBER, 0.85 * k)); }
}

// ------------------------------------------------------------------ dark corridor seen through a rect R, vanishing to vp
// variant: 'corridor' | 'exit' | 'long' | 'void' | 'office' | 'lobby'
function corridor(g, R, vp, o = {}) {
  const { variant = 'corridor', spill = 0.35, seed = 1100, t = K.K.now, a = 0.55 } = o;
  const [x, y, w, h] = R, [vx, vy] = vp;
  const lobby = variant === 'lobby';
  g.fillStyle = lobby ? '#1b1e24' : '#010102'; g.fillRect(x - 2, y - 2, w + 4, h + 4);
  const Z = { corridor: 6, exit: 5, long: 26, void: 3, office: 4, lobby: 4 }[variant];
  const at = (z) => { const k = 1 / z; return [vx + (x - vx) * k, vy + (y - vy) * k, w * k, h * k]; };
  const [fx, fy, fw, fh] = at(Z);
  const la = lobby ? 0.9 : a;
  if (variant !== 'void') {
    for (const [px, py, qx, qy] of [[x, y, fx, fy], [x + w, y, fx + fw, fy], [x, y + h, fx, fy + fh], [x + w, y + h, fx + fw, fy + fh]]) K.line(g, px, py, qx, qy, { w: 3, seed: seed + px + py, a: la * 0.8 });
    K.rect(g, fx, fy, fw, fh, { w: 2.5, seed: seed + 5, a: la * 0.7 });
    if (variant !== 'office') {
      const n = variant === 'long' ? 14 : 3;
      for (let i = 0; i < n; i++) {
        const z0 = 1.25 + i * (Z - 1.4) / n, z1 = z0 + (variant === 'long' ? 0.35 : 0.5);
        for (const side of [0, 1]) {
          const A = at(z0), B = at(z1); const ax = side ? A[0] + A[2] : A[0], bx = side ? B[0] + B[2] : B[0];
          const ty = (r) => r[1] + r[3] * 0.32, by = (r) => r[1] + r[3];
          K.chalk(g, [[ax, by(A)], [ax, ty(A)], [bx, ty(B)], [bx, by(B)]], { w: Math.max(1.5, 3 / Math.sqrt(z0)), seed: seed + 20 + i * 2 + side, a: la * (0.75 - 0.5 * i / n), double: false });
        }
      }
    }
    if (variant === 'exit') {
      const E0 = at(Z * 0.8); const sx = E0[0] + E0[2] * 0.5, sy = E0[1] + E0[3] * 0.1, sw = E0[2] * 0.42, sh = E0[3] * 0.1;
      const dead = K.rng(seed + Math.floor(t * 6))() < 0.07 ? 0.5 : 0.08;   // a dead sign, one weak blink
      g.fillStyle = '#060707'; g.fillRect(sx - sw / 2, sy - sh / 2, sw, sh); K.rect(g, sx - sw / 2, sy - sh / 2, sw, sh, { w: 2.5, seed: seed + 9, a: 0.7 });
      text(g, 'EXIT', sx, sy + 1, { size: sh * 0.72, font: 'Fredoka', weight: 700, color: alpha(LIGHT, dead) });
    }
    if (variant === 'office') {   // cubicle partitions + dead monitors
      for (let i = 0; i < 5; i++) { const A = at(1.4 + i * 0.55); const yy = A[1] + A[3] * 0.62, x0 = A[0] + A[2] * 0.06, x1 = A[0] + A[2] * 0.94; K.chalk(g, [[x0, A[1] + A[3]], [x0, yy], [x1, yy], [x1, A[1] + A[3]]], { w: 2, seed: seed + 60 + i, a: la * (0.6 - i * 0.08), double: false }); K.rect(g, lerp(x0, x1, 0.3), yy - A[3] * 0.09, A[2] * 0.14, A[3] * 0.08, { w: 2, seed: seed + 70 + i, a: la * 0.5, double: false }); }
    }
    if (lobby) {
      for (let i = 1; i < 7; i++) { const A = at(1 + i * 0.5); K.line(g, A[0], A[1] + A[3], A[0] + A[2], A[1] + A[3], { w: 1.6, seed: seed + 80 + i, a: 0.35, double: false }); }
      K.lightPool(g, fx + fw / 2, fy + fh / 2, fw * 2.4, '#d9dfe6', 0.35);
    }
  } else {
    K.line(g, x, y + h * 0.98, x + w, y + h * 0.98, { w: 2.5, seed: seed + 3, a: 0.35 });
  }
  if (spill > 0) { g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); K.lightPool(g, x + w / 2, y + h, Math.max(w, h) * 0.55, LIGHT, spill); g.restore(); }
}

// ------------------------------------------------------------------ the car interior, camera at the back wall looking at the doors
// open 0..1 doors, floor = display text, outside = corridor variant, inside(g, L) draws people in the car
function car(g, t, o = {}) {
  const { open = 0, floor = '9', outside = 'corridor', on = light(), z = 1, fx = 540, fy = 980, dy = 0, inside = null, arrow = 'down', dark = 0.18, shake = 0, dispK = 1 } = o;
  g.save();
  const [jx, jy] = K.drift(4, 0.4, 5); K.camera(g, z, fx, fy, jx + (shake ? (K.rng(K.K.frame)() - 0.5) * shake : 0), jy + dy);
  const F = [150, 300, 780, 1300], [bx, by, bw, bh] = F;
  // side walls / ceiling / floor
  g.fillStyle = '#0c0f0e'; g.fillRect(-60, -60, 1200, 2040);
  K.fillPoly(g, [[bx, by + bh], [bx + bw, by + bh], [1140, 2000], [-60, 2000]], '#0a0b0b');
  K.fillPoly(g, [[bx, by], [bx + bw, by], [1140, -60], [-60, -60]], '#070808');
  g.fillStyle = '#111514'; g.fillRect(bx, by, bw, bh);
  K.rect(g, bx, by, bw, bh, { w: 4, seed: 1001 });
  K.line(g, bx, by, -60, -160, { w: 3.5, seed: 1002 }); K.line(g, bx + bw, by, 1140, -160, { w: 3.5, seed: 1003 });
  K.line(g, bx, by + bh, -60, 2100, { w: 3.5, seed: 1004 }); K.line(g, bx + bw, by + bh, 1140, 2100, { w: 3.5, seed: 1005 });
  // brushed-steel side panels + handrails
  for (const [s, sx] of [[1010, -1], [1020, 1]]) {
    const xe = sx < 0 ? bx : bx + bw, xo = sx < 0 ? -60 : 1140;
    for (let i = 1; i < 3; i++) { const u = i / 3; K.line(g, lerp(xe, xo, u), lerp(by, -160, u), lerp(xe, xo, u), lerp(by + bh, 2100, u), { w: 2, seed: s + i, a: 0.35, double: false }); }
    K.chalk(g, [[xe, by + bh * 0.62], [xo, by + bh * 0.62 + 330]], { w: 6, seed: s + 5, a: 0.8 });
  }
  // control panel on the right wall
  { const px = 1000, py = 920; K.chalk(g, [[px - 30, py - 160], [px + 40, py - 190], [px + 40, py + 260], [px - 30, py + 230]], { w: 3, seed: 1030, a: 0.7, closed: true }); for (let i = 0; i < 5; i++) K.circleLine(g, px + 4, py - 110 + i * 70, 11, { w: 2, seed: 1031 + i, a: 0.6, double: false }); }
  // doorway: the outside, then the sliding panels
  const D = [290, 560, 500, 1040], [dx0, dy0, dw, dh] = D;
  corridor(g, D, [540, 960], { variant: outside, spill: 0.4 * on * open, seed: 1100 + floor.charCodeAt(0) });
  const pw = dw / 2, off = pw * ease.inOut(clamp(open));
  g.save(); g.beginPath(); g.rect(dx0, dy0, dw, dh); g.clip();
  for (const sx of [-1, 1]) {
    const x0 = sx < 0 ? dx0 - off : dx0 + pw + off;
    g.fillStyle = '#161b19'; g.fillRect(x0, dy0, pw, dh);
    K.rect(g, x0 + 4, dy0, pw - 8, dh, { w: 3, seed: 1040 + sx, a: 0.85 });
    K.line(g, x0 + pw * 0.5, dy0 + 40, x0 + pw * 0.5 + sx * 4, dy0 + dh - 40, { w: 1.5, seed: 1044 + sx, a: 0.18, double: false });
  }
  g.restore();
  K.rect(g, dx0 - 16, dy0 - 16, dw + 32, dh + 16, { w: 5, seed: 1050 });
  // display above the doors
  digit(g, 540, 430, floor, { size: 92, k: dispK * (0.75 + 0.25 * on), arrow });
  // ceiling light panel (the accent)
  const lp = [[330, 120], [750, 120], [800, 230], [280, 230]];
  K.fillPoly(g, lp, mix('#101310', LIGHT, 0.15 + 0.8 * on)); K.chalk(g, lp, { w: 3, seed: 1060, closed: true });
  K.lightPool(g, 540, 200, 900, LIGHT, 0.55 * on); K.lightPool(g, 540, 175, 260, '#ffffff', 0.35 * on);
  const L = { F, D };
  if (inside) inside(g, L);
  K.darkness(g, dark + 0.6 * (1 - on), [{ x: 540, y: 500, r: 1500, k: 0.9 }]);
  g.restore();
  return L;
}
const me = (g, pose, o = {}) => stickFigure(g, pose, o.face || {}, { x: o.x ?? 300, y: o.y ?? 1790, s: o.s ?? 2.0, back: o.back ?? true, seed: 11, ...o });

// ------------------------------------------------------------------ POV out of the open doors: full-frame corridor framed by the door edges
function pov(g, t, variant, o = {}) {
  const { z = 1, open = 1, vy = 900 } = o;
  g.save(); K.camera(g, z, 540, vy, ...K.drift(4, 0.3, 21));
  corridor(g, [-60, -60, 1200, 2040], [540, vy], { variant, spill: 0.55, seed: 1300, a: 0.6 });
  // the door frame + panels at the edges of frame
  const pw = 520 * (1 - ease.inOut(clamp(open)));
  g.fillStyle = '#121615'; g.fillRect(-60, -60, 150 + pw, 2040); g.fillRect(990 - pw, -60, 150 + pw, 2040);
  K.line(g, 90 + pw, -60, 90 + pw, 1980, { w: 6, seed: 1310 }); K.line(g, 990 - pw, -60, 990 - pw, 1980, { w: 6, seed: 1311 });
  K.chalk(g, [[90 + pw, 1700], [990 - pw, 1700]], { w: 4, seed: 1312, a: 0.7 });
  K.darkness(g, 0.3, [{ x: 540, y: 1800, r: 900, k: 0.7 }]);
  g.restore();
}

// ------------------------------------------------------------------ the back wall + mirror. inMirror(m) draws the reflected car.
// The reflection is the same car() view (looking at the doors), shrunk into the mirror glass.
function mirrorWall(g, t, o = {}) {
  const { z = 1, on = light(7), reflect = {}, real = null, fy = 900, mz = 0.68 } = o;
  g.save(); K.camera(g, z, 540, fy, ...K.drift(3, 0.3, 31));
  g.fillStyle = '#111514'; g.fillRect(-60, -60, 1200, 2040);
  const M = [110, 170, 860, 1270];
  K.mirror(g, M, (m) => {
    m.save(); m.translate(540, 805); m.scale(mz, mz); m.translate(-540, -980);
    car(m, t, { on, dark: 0.1, ...reflect });
    m.restore();
  }, { tint: 0.12 });
  K.chalk(g, [[-60, 1560], [1140, 1560]], { w: 7, seed: 1401 }); K.chalk(g, [[-60, 1585], [1140, 1585]], { w: 3, seed: 1402, a: 0.6 });
  if (real) real(g);
  K.lightPool(g, 540, -100, 1100, LIGHT, 0.4 * on);
  K.darkness(g, 0.15 + 0.6 * (1 - on), [{ x: 540, y: 300, r: 1500, k: 0.85 }]);
  g.restore();
}

// tall bowed silhouettes packed shoulder to shoulder, seen from behind (they face the doors). never their faces.
// x = centre, y = floor, h = height. Long coat-like body, sloped shoulders, head hung forward (sunk below the shoulder line).
function bowed(g, x, y, h, o = {}) {
  const { k = 1, seed = 1, rim = 0.5, sway = 0 } = o, w = h * 0.2, sh = y - h * 0.84, hr = h * 0.06;
  const bx = x + sway * h;
  const body = [[bx - w * 0.5, sh + h * 0.05], [bx - w * 0.2, sh - h * 0.015], [bx + w * 0.2, sh - h * 0.015], [bx + w * 0.5, sh + h * 0.05], [bx + w * 0.42, y], [bx - w * 0.42, y]];
  g.save(); g.globalAlpha *= k;
  // head hung forward on a bent neck
  const hy = sh - hr * 0.55; K.chalk(g, [[bx, sh], [bx, hy]], { w: hr * 0.6, color: '#020303', seed: seed + 2, double: false });
  K.blob(g, bx, hy, hr, hr * 1.1, '#020303', { seed: seed + 3, wob: 3 });
  K.fillPoly(g, body, '#020303');
  // long arms hanging past the knees
  for (const sx of [-1, 1]) K.chalk(g, [[bx + sx * w * 0.47, sh + h * 0.06], [bx + sx * w * 0.5, sh + h * 0.62]], { w: h * 0.03, color: '#020303', seed: seed + 5 + sx, double: false, wob: 1 });
  if (rim > 0) { K.chalk(g, body.slice(0, 5), { w: Math.max(2, h * 0.006), color: LIGHT, a: rim, seed: seed + 7, double: false }); K.ellipse(g, bx, hy, hr, hr * 1.1, { w: Math.max(2, h * 0.006), color: LIGHT, a: rim * 0.8, seed: seed + 8, from: Math.PI * 1.05, to: Math.PI * 1.95, double: false }); }
  g.restore();
}
function crowd(g, L, o = {}) {
  const { k = 1, eyes = 0 } = o, T = K.K.now;
  const rows = [
    { y: 1640, h: 820, xs: [90, 230, 370, 470, 610, 750, 890, 1010] },
    { y: 1780, h: 900, xs: [30, 190, 350, 730, 890, 1050] },   // gap in the middle: the lit doorway (and me) between them
    { y: 1960, h: 1000, xs: [-30, 150, 320, 760, 930, 1110] },
  ];
  rows.forEach((r, ri) => r.xs.forEach((x, i) => bowed(g, x, r.y, r.h, { k, seed: 960 + ri * 10 + i, rim: (0.35 + 0.2 * ri) * k, sway: Math.sin(T * 0.5 + i * 1.7 + ri) * 0.004 })));
  // one of them, at the back, has turned its head toward the glass: two pale dots
  if (eyes > 0) K.eyesInDark(g, 470, 1640 - 820 * 0.84 - 820 * 0.06 * 0.55, { gap: 15, size: 6, k: eyes, color: LIGHT });
}

// ------------------------------------------------------------------ elevator shaft, outside the car
function shaft(g, t, o = {}) {
  const { carY = 900, on = light(9), groan = 0, speed = 0.3 } = o;
  g.save(); K.camera(g, o.z || 1, 540, 900, ...K.drift(3, 0.3, 41));
  g.fillStyle = '#030404'; g.fillRect(-60, -60, 1200, 2040);
  for (const x of [220, 860]) K.line(g, x, -60, x, 1980, { w: 4, seed: 1500 + x, a: 0.5 });
  // floor sills slide UP past the car (the car going down); speed = how fast
  const off = (t * speed * 700) % 640;
  for (let i = -1; i < 4; i++) { const y = 1980 - ((i * 640 + off) % 2560); K.line(g, 140, y, 940, y, { w: 3, seed: 1510 + i, a: 0.4 }); K.rect(g, 330, y - 360, 420, 360, { w: 2, seed: 1520 + i, a: 0.22, double: false }); }
  // cables
  const vib = groan * Math.sin(t * 60) * 3;
  for (const dx of [-24, 0, 24]) K.chalk(g, [[540 + dx, -60], [540 + dx + vib, carY - 330]], { w: 3, seed: 1530 + dx, a: 0.85, wob: 1 + groan * 2 });
  // car box
  const cx = 360, cw = 360, ch = 480, cy = carY - 330;
  g.fillStyle = '#0b0d0c'; g.fillRect(cx, cy, cw, ch); K.rect(g, cx, cy, cw, ch, { w: 5, seed: 1540 });
  K.chalk(g, [[cx + 40, cy], [540, cy - 60], [cx + cw - 40, cy]], { w: 4, seed: 1541 });
  K.line(g, 540, cy + 40, 540, cy + ch - 10, { w: 3, seed: 1542, a: 0.7 });
  // light leaking out of the door seam
  g.fillStyle = alpha(LIGHT, 0.85 * on); g.fillRect(537, cy + 40, 6, ch - 50);
  K.lightPool(g, 540, cy + ch / 2, 420, LIGHT, 0.5 * on);
  // counterweight
  K.rect(g, 780, 1780 - carY * 0.8, 70, 200, { w: 3, seed: 1550, a: 0.6 }); K.line(g, 815, -60, 815, 1780 - carY * 0.8, { w: 2.5, seed: 1551, a: 0.6 });
  K.darkness(g, 0.25, [{ x: 540, y: cy + 200, r: 900, k: 0.8 }]);
  g.restore();
}

// ------------------------------------------------------------------ lobby (brighter, grey)
function lobby(g, t, o = {}) {
  const { open = 1, meX = 540, mePose = 'stand', meBack = false, meS = 1.4, meY = 1700, z = 1, fx = 540, fy = 900, carOn = light(11), face = {} } = o;
  g.save(); K.camera(g, z, fx, fy, ...K.drift(3, 0.3, 51));
  g.fillStyle = '#1a1d22'; g.fillRect(-60, -60, 1200, 2040);
  const B = [120, 380, 840, 1080], [bx, by, bw, bh] = B;
  K.fillPoly(g, [[bx, by + bh], [bx + bw, by + bh], [1140, 2000], [-60, 2000]], '#14171b');
  g.fillStyle = '#20242a'; g.fillRect(bx, by, bw, bh); K.rect(g, bx, by, bw, bh, { w: 4, seed: 1601 });
  K.line(g, bx, by + bh, -60, 2100, { w: 3.5, seed: 1602 }); K.line(g, bx + bw, by + bh, 1140, 2100, { w: 3.5, seed: 1603 }); K.line(g, bx, by, -60, -160, { w: 3.5, seed: 1604 }); K.line(g, bx + bw, by, 1140, -160, { w: 3.5, seed: 1605 });
  for (let i = 1; i < 7; i++) { const yy = lerp(by + bh, 2000, (i / 7) ** 1.6); K.line(g, -60, yy, 1140, yy, { w: 1.6, seed: 1610 + i, a: 0.3, double: false }); }
  for (let i = -4; i <= 4; i++) K.line(g, 540 + i * 95, by + bh, 540 + i * 330, 2000, { w: 1.6, seed: 1620 + i, a: 0.3, double: false });
  // elevator doors in the back wall, the lit car behind them
  const D = [340, 640, 400, 820], [dx0, dy0, dw, dh] = D;
  g.fillStyle = mix('#0c100e', LIGHT, 0.4 * carOn); g.fillRect(dx0, dy0, dw, dh);
  if (o.carInside) { g.save(); g.beginPath(); g.rect(dx0, dy0, dw, dh); g.clip(); o.carInside(g, D); g.restore(); }
  K.lightPool(g, 540, dy0 + dh, 600, LIGHT, 0.45 * carOn * open);
  const pw = dw / 2, off = pw * ease.inOut(clamp(open));
  g.save(); g.beginPath(); g.rect(dx0, dy0, dw, dh); g.clip();
  for (const sx of [-1, 1]) { const x0 = sx < 0 ? dx0 - off : dx0 + pw + off; g.fillStyle = '#2a2f33'; g.fillRect(x0, dy0, pw, dh); K.rect(g, x0 + 3, dy0, pw - 6, dh, { w: 3, seed: 1630 + sx, a: 0.85 }); }
  g.restore();
  K.rect(g, dx0 - 14, dy0 - 14, dw + 28, dh + 14, { w: 5, seed: 1640 });
  digit(g, 540, 560, o.floor || 'L', { size: 64, k: 0.9, arrow: o.arrow ?? null });
  // ceiling downlights
  for (const x of [260, 540, 820]) K.lightPool(g, x, 120, 520, '#dfe4ea', 0.22);
  if (o.drawMe !== false) me(g, mePose, { x: meX, y: meY, s: meS, back: meBack, face });
  K.darkness(g, 0.12, [{ x: 540, y: 800, r: 1400, k: 0.6 }]);
  g.restore();
}

// ================================================================== shots
const P = (info) => info.p, G = (info) => info.globalT, L0 = (info) => info.globalT - info.shot.start;

// s01 frame 1: inside, light flickering, me alone, the doors already sliding shut on floor 9
K.stickShot('s01', (g, t, info) => { const T = G(info); car(g, T, { open: lerp(0.75, 0.0, ease.inOut(prog(T, 0, 1.7))), floor: '9', outside: 'office', on: light(3, { depth: 0.2, dips: 1.2 }), z: lerp(1.08, 1.02, P(info)), inside: (c) => me(c, 'idle') }); });
// s02 "Most nights, I'm the last one out." the dark office, me walking to the lit elevator at the end
K.stickShot('s02', (g, t, info) => {
  const T = G(info); g.save(); K.camera(g, lerp(1.0, 1.06, P(info)), 540, 900);
  corridor(g, [-60, -60, 1200, 2040], [540, 880], { variant: 'office', spill: 0, seed: 1700, a: 0.6 });
  // elevator at the far end, lit
  g.fillStyle = mix('#0b0d0c', LIGHT, 0.55); g.fillRect(500, 800, 80, 150); K.rect(g, 500, 800, 80, 150, { w: 3, seed: 1701 }); K.lightPool(g, 540, 880, 380, LIGHT, 0.7 * light(4));
  digit(g, 540, 780, '9', { size: 18, k: 0.9, arrow: null, box: false });
  const ph = T * 0.9; me(g, K.walk(ph), { x: lerp(560, 548, P(info)), y: lerp(1500, 1330, P(info)), s: lerp(0.95, 0.75, P(info)) });
  K.darkness(g, 0.35, [{ x: 540, y: 880, r: 700, k: 0.9 }]); g.restore();
});
// s03 "Last night, I got in the elevator" outside the car, me stepping in
K.stickShot('s03', (g, t, info) => { const T = G(info), p = P(info); lobby(g, T, { open: 1, floor: '9', arrow: null, meX: lerp(540, 540, p), meY: lerp(1820, 1480, ease.out(p)), meS: lerp(1.7, 1.1, ease.out(p)), mePose: K.walk(T * 1.0), meBack: true, z: 1.05, carOn: light(5) }); K.darkness(g, 0.45, [{ x: 540, y: 1000, r: 900, k: 0.8 }]); });
// s04 "on the ninth floor" the display, big
function displayShot(g, T, str, o = {}) {
  g.save(); K.camera(g, o.z || 1, 540, 900, ...K.drift(3, 0.3, 61));
  g.fillStyle = '#0d100f'; g.fillRect(-60, -60, 1200, 2040);
  K.chalk(g, [[-60, 1380], [1140, 1380]], { w: 5, seed: 1801 });       // top of the door frame
  for (let i = 0; i < 4; i++) K.line(g, -60, 1420 + i * 40, 1140, 1420 + i * 40, { w: 1.5, seed: 1810 + i, a: 0.2, double: false });
  if (o.panels) { const off = o.panels; g.fillStyle = '#161b19'; g.fillRect(540 - 400 - off, 1400, 400, 600); g.fillRect(540 + off, 1400, 400, 600); K.line(g, 540 - off, 1400, 540 - off, 1980, { w: 4, seed: 1820 }); K.line(g, 540 + off, 1400, 540 + off, 1980, { w: 4, seed: 1821 }); }
  digit(g, 540, 840, str, { size: 330, k: o.k ?? 1, arrow: o.arrow ?? 'down' });
  K.lightPool(g, 540, -200, 900, LIGHT, 0.3 * (o.on ?? light(6)));
  K.darkness(g, 0.2, [{ x: 540, y: 840, r: 900, k: 0.8 }]); g.restore();
}
K.stickShot('s04', (g, t, info) => displayShot(g, G(info), '9', { z: lerp(1.0, 1.06, P(info)) }));
// s05 "and pressed lobby." the button panel, a finger on L
K.stickShot('s05', (g, t, info) => {
  const T = G(info), p = P(info), press = ease.out(prog(L0(info), 0.25, 0.75)); g.save(); K.camera(g, lerp(1.04, 1.0, p), 540, 900, ...K.drift(3));
  g.fillStyle = '#101413'; g.fillRect(-60, -60, 1200, 2040);
  K.rect(g, 240, 160, 600, 1400, { w: 5, seed: 1901 });
  const labels = ['9', '8', '7', '6', '5', '4', '3', '2', '1', 'L'];
  labels.forEach((s, i) => { const col = i % 2, row = Math.floor(i / 2), x = 420 + col * 240, y = 330 + row * 230, lit = (s === 'L' && press > 0.6) || s === '9'; if (lit) { K.lightPool(g, x, y, 200, AMBER, 0.6); } K.circleLine(g, x, y, 70, { w: 4, seed: 1910 + i, color: lit ? AMBER : INK.chalk }); text(g, s, x, y + 4, { size: 64, font: 'Fredoka', weight: 700, color: lit ? AMBER : alpha(INK.chalk, 0.8) }); });
  // the finger (a chalk arm from the bottom right)
  const hx = lerp(820, 660, press), hy = lerp(1500, 1250, press); K.chalk(g, [[1140, 2000], [hx + 110, hy + 220], [hx, hy]], { w: 14, seed: 1930 });
  K.lightPool(g, 540, 0, 900, LIGHT, 0.3 * light(7)); K.darkness(g, 0.25, [{ x: 540, y: 900, r: 1100, k: 0.8 }]); g.restore();
});
// s06 "On eight, it stopped." jolt: the display reads 8
K.stickShot('s06', (g, t, info) => { const lt = L0(info), bump = Math.max(0, 1 - prog(lt, 0.6, 1.0)) * (lt > 0.6 ? 1 : 0); displayShot(g, G(info), lt < 0.25 ? '9' : '8', { z: 1.05 + bump * 0.02, k: 1 }); });
// s07 "The doors opened." onto a pitch-black corridor
K.stickShot('s07', (g, t, info) => { const T = G(info); car(g, T, { open: ease.inOut(prog(L0(info), 0.15, 1.5)), floor: '8', outside: 'corridor', inside: (c) => me(c, 'idle'), z: lerp(1.02, 1.08, P(info)) }); });
// s08 "Nobody there." POV into it
K.stickShot('s08', (g, t, info) => pov(g, G(info), 'corridor', { z: lerp(1.0, 1.1, P(info)) }));
// s09 "Just a dark hallway." creeping push, deeper
K.stickShot('s09', (g, t, info) => { pov(g, G(info), 'corridor', { z: lerp(1.15, 1.45, ease.inOut(P(info))) }); K.darkness(g, 0.3 * P(info)); });
// s10 "The doors closed." tight on the doors sliding shut
K.stickShot('s10', (g, t, info) => pov(g, G(info), 'corridor', { open: 1 - ease.inOut(prog(L0(info), 0.1, 1.4)), z: 1.0 }));
// s11 "On seven, it stopped again." wide, the car jolts, 7
K.stickShot('s11', (g, t, info) => { const lt = L0(info); car(g, G(info), { open: ease.inOut(prog(lt, 0.9, 1.9)) * 0.9, floor: lt < 0.25 ? '8' : '7', outside: 'exit', inside: (c) => me(c, 'freeze'), z: 1.04, dy: lt > 0.6 && lt < 0.8 ? 10 : 0 }); });
// s12 "Nobody." the dead exit sign
K.stickShot('s12', (g, t, info) => pov(g, G(info), 'exit', { z: lerp(1.05, 1.15, P(info)) }));
// s13 "Six." the void
K.stickShot('s13', (g, t, info) => { const lt = L0(info); car(g, G(info), { open: ease.inOut(prog(lt, 0.0, 0.6)), floor: '6', outside: 'void', inside: (c) => me(c, 'freeze'), z: 1.12, fy: 760 }); });
// s14 "Five." dark office floor
K.stickShot('s14', (g, t, info) => { pov(g, G(info), 'office', { z: lerp(1.0, 1.06, P(info)) }); digitOverlay(g, '5'); });
// s15 "Four." a hallway that is a little too long
K.stickShot('s15', (g, t, info) => { pov(g, G(info), 'long', { z: lerp(1.0, 1.12, P(info)) }); digitOverlay(g, '4'); });
function digitOverlay(g, s) { g.save(); g.fillStyle = '#0d100f'; g.fillRect(-60, -60, 1200, 300); K.chalk(g, [[-60, 240], [1140, 240]], { w: 5, seed: 1990 }); digit(g, 540, 125, s, { size: 120 }); g.restore(); }
// s16 "Every floor, the doors opened." wide, open again (3)
K.stickShot('s16', (g, t, info) => { const lt = L0(info); car(g, G(info), { open: ease.inOut(prog(lt, 0.3, 1.4)), floor: '3', outside: 'corridor', inside: (c) => me(c, 'freeze'), z: lerp(1.0, 1.05, P(info)) }); });
// s17 "Every floor, nobody got on." the mirror on the back wall: me, alone
K.stickShot('s17', (g, t, info) => { const T = G(info); mirrorWall(g, T, { z: lerp(1.0, 1.05, P(info)), reflect: { open: 0.8, floor: '3', outside: 'void', inside: (c) => me(c, 'freeze', { back: false, face: { eyes: 'dot', look: [0.3, 0.2], brows: 'worried' }, x: 540, y: 1880 }) }, real: (r) => me(r, 'freeze', { x: 540, y: 2470, s: 2.4 }) }); });
// s18 "I figured it was broken." close: me, flat and tired
K.stickShot('s18', (g, t, info) => {
  const T = G(info), on = light(8); g.save(); K.camera(g, lerp(1.0, 1.04, P(info)), 540, 860, ...K.drift(3));
  g.fillStyle = '#111514'; g.fillRect(-60, -60, 1200, 2040); for (let i = 1; i < 4; i++) K.line(g, i * 270, -60, i * 270, 1980, { w: 2, seed: 2000 + i, a: 0.25, double: false });
  stickHead(g, 520, 820, 240, { eyes: 'half', mouth: 'flat', look: [-0.3, 0], blink: (T % 3.1) < 0.12 ? 1 : 0 }, { seed: 5, tilt: -0.05 });
  K.lightPool(g, 540, -100, 1000, LIGHT, 0.5 * on); K.darkness(g, 0.2 + 0.6 * (1 - on), [{ x: 540, y: 400, r: 1300, k: 0.85 }]); g.restore();
});
// s19 "I stared at my phone" mid shot, phone glow from below, display 2 behind
K.stickShot('s19', (g, t, info) => { const T = G(info); car(g, T, { open: 0, floor: '2', z: 1.55, fx: 420, fy: 1150, inside: (c) => { const r = me(c, 'phone', { back: false, x: 420, y: 1760, s: 2.1, face: { eyes: 'dot', look: [0.2, 0.9], mouth: 'flat' } }); K.phone(c, r.hR[0] - 6, r.hR[1] - 20, { s: 1.4, glow: 0.8, color: '#e8f0ff' }); } }); });
// s20 "and tried not to look into the hallways." doors open behind me, I don't look; eyes slide, then snap back
K.stickShot('s20', (g, t, info) => { const T = G(info), lt = L0(info), glance = prog(lt, 0.9, 1.2) - prog(lt, 1.5, 1.7);
  car(g, T, { open: ease.inOut(prog(lt, 0, 0.8)), floor: '2', outside: 'long', z: 1.25, fx: 420, fy: 1150, inside: (c) => { const r = me(c, 'phone', { back: false, x: 260, y: 1760, s: 2.0, face: { eyes: 'dot', look: [lerp(0.2, 1, glance), lerp(0.9, 0, glance)], mouth: 'flat', brows: glance > 0.3 ? 'worried' : null } }); K.phone(c, r.hR[0] - 6, r.hR[1] - 20, { s: 1.3, glow: 0.8, color: '#e8f0ff' }); } }); });
// s21 "The light flickered." the ceiling panel, stuttering
K.stickShot('s21', (g, t, info) => {
  const T = G(info), on = K.flicker({ seed: 21, depth: 0.3, dips: 3.5 }); g.save(); K.camera(g, lerp(1.0, 1.05, P(info)), 540, 800, ...K.drift(3));
  g.fillStyle = '#070808'; g.fillRect(-60, -60, 1200, 2040);
  const lp = [[160, 500], [920, 500], [1010, 1000], [70, 1000]]; K.fillPoly(g, lp, mix('#0d100e', LIGHT, 0.1 + 0.85 * on)); K.chalk(g, lp, { w: 5, seed: 2101, closed: true });
  for (let i = 1; i < 6; i++) K.line(g, lerp(160, 70, 0) + i * 127, 500, lerp(70, 70, 0) + i * 157, 1000, { w: 2.5, seed: 2110 + i, a: 0.5 });
  K.lightPool(g, 540, 750, 1100, LIGHT, 0.75 * on); K.lightPool(g, 540, 750, 400, '#ffffff', 0.4 * on);
  K.darkness(g, 0.1 + 0.8 * (1 - on), [{ x: 540, y: 750, r: 1200, k: 0.8 }]); g.restore();
});
// s22 "The elevator got slower." outside: the car sinking down the black shaft, slowing
K.stickShot('s22', (g, t, info) => { const lt = L0(info); shaft(g, G(info), { carY: 900 + lt * 40, speed: lerp(0.5, 0.15, P(info)), z: 1.0 }); });
// s23 "Heavier." the camera dips, the light stutters, I look up
K.stickShot('s23', (g, t, info) => { const lt = L0(info), dip = ease.out(prog(lt, 0.05, 0.4)) * 60 - ease.inOut(prog(lt, 0.6, 1.4)) * 20;
  car(g, G(info), { open: 0, floor: '1', on: K.flicker({ seed: 23, depth: 0.35, dips: 4 }), z: 1.12, dy: dip, inside: (c) => me(c, 'freeze', { back: false, x: 540, y: 1790, s: 1.9, face: { eyes: 'wide', look: [0, -1], brows: 'worried', mouth: 'flat' } }) }); });
// s24 "The cable groaned," top of the car, the cables straining
K.stickShot('s24', (g, t, info) => { shaft(g, G(info), { carY: 1350, groan: 1, speed: 0.08, z: 1.5 }); });
// s25 "like it was carrying more than just me." the mirror again: still only me. The light sinks.
K.stickShot('s25', (g, t, info) => { const T = G(info), on = light(25) * lerp(1, 0.55, P(info));
  mirrorWall(g, T, { on, z: lerp(1.02, 1.16, ease.inOut(P(info))), fy: 820, reflect: { open: 0, floor: '1', dark: 0.25, inside: (c) => me(c, 'freeze', { back: false, x: 540, y: 1880, face: { eyes: 'dot', look: [0, -0.4], brows: 'worried' } }) }, real: (r) => me(r, 'freeze', { x: 540, y: 2470, s: 2.4 }) }); });
// s26 "Lobby." L, a soft ding, brighter
K.stickShot('s26', (g, t, info) => displayShot(g, G(info), 'L', { z: lerp(1.0, 1.04, P(info)), arrow: null, on: 1 }));
// s27 "The doors opened, and I stepped out." from the lobby: I walk out toward camera
K.stickShot('s27', (g, t, info) => { const T = G(info), lt = L0(info), open = ease.inOut(prog(lt, 0, 0.8)), walkK = ease.inOut(prog(lt, 1.0, 2.05));
  lobby(g, T, { open, floor: 'L', meX: 540, meY: lerp(1450, 1720, walkK), meS: lerp(1.05, 1.4, walkK), mePose: walkK > 0 && walkK < 1 ? K.walk(T * 1.1) : 'stand', meBack: false, face: { eyes: 'dot', mouth: 'flat' } }); });
// s28 held beat on my back: walking away across the lobby, toward the glass doors
K.stickShot('s28', (g, t, info) => { const T = G(info), p = P(info); g.save(); K.camera(g, 1.0, 540, 900, ...K.drift(3, 0.3, 71));
  corridor(g, [-60, -60, 1200, 2040], [540, 880], { variant: 'lobby', spill: 0, seed: 2800 });
  // glass entrance at the end, a streetlamp outside
  g.fillStyle = '#0a0c10'; g.fillRect(380, 640, 320, 420); K.rect(g, 380, 640, 320, 420, { w: 4, seed: 2801 }); K.line(g, 540, 640, 540, 1060, { w: 3, seed: 2802 });
  me(g, K.walk(T * 0.9), { x: 540, y: lerp(1820, 1700, p), s: lerp(1.75, 1.6, p), back: true });
  K.lightPool(g, 540, 400, 1200, LIGHT, 0.12 * light(28));   // the car's light, still on my back
  K.darkness(g, 0.2, [{ x: 540, y: 900, r: 1300, k: 0.6 }]); g.restore(); });
// s29 "Behind me, the doors started to close." the doors begin to slide, I keep walking (small, front, at the side)
K.stickShot('s29', (g, t, info) => { const T = G(info), lt = L0(info);
  lobby(g, T, { open: 1 - 0.3 * ease.inOut(prog(lt, 0.6, 2.3)), floor: 'L', meX: lerp(760, 820, P(info)), meY: 1880, meS: 1.6, mePose: K.walk(T * 0.9), meBack: true, z: 1.0, carInside: (c, D) => { /* empty car, plain */ c.fillStyle = alpha(LIGHT, 0.12); c.fillRect(D[0], D[1], D[2], D[3]); } }); });
// s30 "I glanced back" close: my head turning back over the shoulder
K.stickShot('s30', (g, t, info) => { const T = G(info), lt = L0(info), turn = ease.inOut(prog(lt, 0.15, 0.7));
  g.save(); K.camera(g, lerp(1.0, 1.05, P(info)), 540, 860, ...K.drift(3)); g.fillStyle = '#1a1d22'; g.fillRect(-60, -60, 1200, 2040);
  K.lightPool(g, 1100, 900, 900, LIGHT, 0.45 * light(30));
  stickHead(g, 520, 860, 250, { eyes: 'dot', look: [lerp(-0.2, 1, turn), 0], brows: turn > 0.5 ? 'worried' : null, mouth: 'flat' }, { seed: 5, tilt: lerp(0, 0.08, turn) });
  K.darkness(g, 0.15, [{ x: 540, y: 800, r: 1200, k: 0.7 }]); g.restore(); });
// the car seen from the lobby through the closing doors: the back-wall mirror shows the reflected car
function throughDoors(g, T, o = {}) {
  const { open = 0.6, z = 1, packed = 0, eyes = 0, on = light(33) } = o;
  g.save(); K.camera(g, z, 540, o.fy ?? 900, ...K.drift(2, 0.3, 81));
  g.fillStyle = '#1a1d22'; g.fillRect(-60, -60, 1200, 2040);
  const D = [160, 260, 760, 1500], [dx0, dy0, dw, dh] = D;
  g.save(); g.beginPath(); g.rect(dx0, dy0, dw, dh); g.clip();
  // inside of the car: back wall, floor (empty)
  g.fillStyle = '#111514'; g.fillRect(dx0, dy0, dw, dh);
  K.fillPoly(g, [[dx0, dy0 + dh], [dx0 + dw, dy0 + dh], [dx0 + dw - 110, dy0 + dh - 230], [dx0 + 110, dy0 + dh - 230]], '#0b0d0c');
  K.chalk(g, [[dx0 + 110, dy0 + dh - 230], [dx0 + dw - 110, dy0 + dh - 230]], { w: 4, seed: 3301 });
  K.chalk(g, [[dx0 + 110, dy0 + dh - 230], [dx0, dy0 + dh]], { w: 3, seed: 3302 }); K.chalk(g, [[dx0 + dw - 110, dy0 + dh - 230], [dx0 + dw, dy0 + dh]], { w: 3, seed: 3303 });
  K.chalk(g, [[dx0 + 110, dy0 + 60], [dx0 + 110, dy0 + dh - 230]], { w: 3, seed: 3304, a: 0.7 }); K.chalk(g, [[dx0 + dw - 110, dy0 + 60], [dx0 + dw - 110, dy0 + dh - 230]], { w: 3, seed: 3305, a: 0.7 });
  // the mirror on the back wall
  const M = [dx0 + 150, dy0 + 180, dw - 300, 880];
  K.mirror(g, M, (m) => {
    m.save(); m.translate(M[0] + M[2] / 2, M[1] + M[3] / 2); m.scale(0.43, 0.43); m.translate(-540, -1020);
    // the reflection looks back out through the doors at the lobby: lit doorway, me small in it
    m.fillStyle = '#0e1110'; m.fillRect(-400, -200, 1900, 2400);
    const gap = 520 * open; m.fillStyle = '#2a2f36'; m.fillRect(540 - gap, 300, gap * 2, 1560); K.rect(m, 540 - gap, 300, gap * 2, 1560, { w: 5, seed: 3310 });
    stickFigure(m, 'stand', { eyes: 'dot', mouth: 'flat' }, { x: 540, y: 1820, s: 1.3, back: false, seed: 11 });
    if (packed > 0) crowd(m, null, { k: packed, eyes });
    K.lightPool(m, 540, -100, 1400, LIGHT, 0.5 * on);
    m.restore();
  }, { tint: 0.1 });
  K.lightPool(g, 540, dy0 + 40, 1000, LIGHT, 0.55 * on); K.lightPool(g, 540, dy0 + 40, 300, '#ffffff', 0.25 * on);
  K.darkness(g, 0.1 + 0.6 * (1 - on), [{ x: 540, y: 600, r: 1200, k: 0.85 }]);
  // closing door panels
  const pw = dw / 2, off = pw * clamp(open);
  for (const sx of [-1, 1]) { const x0 = sx < 0 ? dx0 - off : dx0 + pw + off; g.fillStyle = '#2a2f33'; g.fillRect(x0, dy0, pw, dh); K.rect(g, x0 + 3, dy0, pw - 6, dh, { w: 4, seed: 3320 + sx, a: 0.9 }); }
  g.restore();
  K.rect(g, dx0 - 18, dy0 - 18, dw + 36, dh + 18, { w: 6, seed: 3330 });
  digit(g, 540, 150, o.floor || 'L', { size: 80, k: 0.9, arrow: o.arrow ?? null });
  K.darkness(g, 0.15, [{ x: 540, y: 900, r: 1300, k: 0.6 }]);
  g.restore();
}
// s31 "at the mirror on the elevator wall." the gap, the mirror inside: me, small, alone
K.stickShot('s31', (g, t, info) => { const lt = L0(info); throughDoors(g, G(info), { open: lerp(0.8, 0.68, P(info)), z: lerp(1.0, 1.1, P(info)) }); });
// s32 the held, silent beat: slower push on the mirror, the doors keep closing, nothing there
K.stickShot('s32', (g, t, info) => { throughDoors(g, G(info), { open: lerp(0.68, 0.56, P(info)), z: lerp(1.15, 1.5, ease.inOut(P(info))), fy: 880, on: light(32, { depth: 0.12, dips: 0.3 }) }); });
// s33 TWIST: the mirror is packed. jitter + sting. the doors shut. the display ticks back up.
K.stickShot('s33', (g, t, info) => { const T = G(info), lt = L0(info);
  const open = lerp(0.56, 0, ease.inOut(prog(lt, 1.5, 2.4)));
  throughDoors(g, T, { open, packed: 1, eyes: prog(lt, 0.9, 1.4), z: lerp(1.68, 1.1, ease.inOut(prog(lt, 1.4, 2.6))), fy: 880, on: K.flicker({ seed: 33, depth: 0.25, dips: 1.5 }), floor: lt > 3.0 ? '1' : 'L', arrow: lt > 3.0 ? 'up' : null });
});
// s34 end card
K.stickShot('s34', (g, t) => K.endCard(g, t), { captions: false, fx: false });
