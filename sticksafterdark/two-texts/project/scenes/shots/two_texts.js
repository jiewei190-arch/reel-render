// Sticks After Dark #2 "Two Texts". Accent: red phone glow. No bulbs: the phone is the only light.
// Project-local sets (frosted front door, phone screen, side stairs, bedroom window, flat hand) live here, not in the kit.
import * as K from '/kits/sticks/sticks.js';
import { E, linGrad } from '/engine/core.js';
const { INK, fillPoly, stickFigure, stickHead, chalk, line, rect, lightPool, darkness, prog, ease, clamp, lerp, alpha, mix, rng, noise } = K;
K.setAccent('red');
const RED = K.K.accent;

// ------------------------------------------------------------------ helpers
// door knocks (global times) -> shake offset that decays fast
// extended cut: three slow knocks, the knocking again (slow, patient), one at the lock, sparse ones in the standoff, last two before it stops
const DOOR_KNOCKS = [16.85, 17.75, 18.65, 31.55, 32.25, 32.95, 34.20, 35.55, 36.55, 45.60, 47.30, 51.75, 52.30];
const GLASS_KNOCKS = [61.00, 61.30, 63.00, 63.30];
function shake(times, amp = 7) { const T = K.K.now; let s = 0; for (const k of times) { const d = T - k; if (d >= 0 && d < 0.16) s = Math.max(s, 1 - d / 0.16); } const r = rng(K.K.frame * 5 + 1); return [(r() - 0.5) * 2 * amp * s, (r() - 0.5) * amp * s, s]; }
// phone light: steady red with a slight breathing + buzz bursts
function phoneLight(buzzAt = []) { const T = K.K.now; let b = 0; for (const a of buzzAt) if (T >= a && T < a + 1.3) b = Math.max(b, 0.5 + 0.5 * Math.sin((T - a) * 60)); return 0.82 + 0.08 * noise(T * 1.7, 3) + 0.18 * b; }
function buzzOffset(buzzAt = [], amp = 6) { const T = K.K.now; for (const a of buzzAt) if (T >= a && T < a + 1.2 && ((T - a) % 0.4) < 0.28) { const r = rng(K.K.frame * 9 + 2); return [(r() - 0.5) * amp * 2, (r() - 0.5) * amp]; } return [0, 0]; }
// a phone held in a hand at (x,y): small glowing screen, light pooled around it
function heldPhone(g, x, y, s, k, rot = -0.2) {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.fillStyle = mix(INK.bg, RED, 0.75 * k); g.fillRect(-20 * s, -36 * s, 40 * s, 72 * s);
  rect(g, -22 * s, -38 * s, 44 * s, 76 * s, { w: 3, seed: 71, double: false });
  g.restore();
}

// frosted glass panel with an optional blurred tall shadow behind it
function frostedGlass(g, gx, gy, gw, gh, o = {}) {
  const { shadow = 0, sx = gx + gw / 2, sh = 1.0, seed = 600, lit = 1 } = o;
  g.save(); g.beginPath(); g.rect(gx, gy, gw, gh); g.clip();
  // faint cold light from outside (no colour: the accent stays red)
  g.fillStyle = linGrad(g, gx, gy, gx, gy + gh, [mix(INK.bg, '#3a3f4c', 0.55 * lit), mix(INK.bg, '#2a2e38', 0.45 * lit)]); g.fillRect(gx, gy, gw, gh);
  if (shadow > 0) {
    // a too-tall stick silhouette pressed close to the glass: small head right at the TOP of the panel
    // (higher than any person), thin neck, narrow sloped shoulders, one over-long arm that rises on each knock.
    g.save(); g.filter = `blur(${Math.round(gw * 0.022 * E.PX)}px)`; g.globalAlpha *= shadow;
    const sway = Math.sin(K.K.now * 0.6) * gw * 0.015, hx = sx + sway, hr = gw * 0.13 * sh, hy = gy + gh * 0.17;
    const col = '#020203';
    K.blob(g, hx, hy, hr * 0.9, hr * 1.12, col, { seed: 611, wob: 0.5 });
    g.strokeStyle = col; g.lineCap = 'round'; g.lineWidth = gw * 0.05 * sh;
    g.beginPath(); g.moveTo(hx, hy + hr); g.lineTo(hx + sway * 0.5, gy + gh * 1.1); g.stroke();                                  // neck/body
    g.lineWidth = gw * 0.045 * sh; const shY = hy + hr * 2.3;
    g.beginPath(); g.moveTo(hx - gw * 0.3, gy + gh * 0.62); g.quadraticCurveTo(hx - gw * 0.12, shY - hr * 0.2, hx, shY); g.quadraticCurveTo(hx + gw * 0.12, shY - hr * 0.2, hx + gw * 0.26, gy + gh * 0.58); g.stroke();
    const [, , kn] = shake(DOOR_KNOCKS, 1); const up = Math.max(kn, o.armUp || 0);
    if (up > 0.01) { const ex = hx + gw * 0.3, ey = lerp(gy + gh * 1.05, gy + gh * 0.55, up), fx = lerp(ex, hx + gw * 0.18, up), fy = lerp(ey + gh * 0.2, gy + gh * 0.42, up);
      g.lineWidth = gw * 0.04 * sh; g.beginPath(); g.moveTo(hx + gw * 0.26, gy + gh * 0.58); g.lineTo(ex, ey); g.lineTo(fx, fy); g.stroke(); K.blob(g, fx, fy, gw * 0.045, gw * 0.05, col, { seed: 612 }); }
    g.filter = 'none'; g.restore();
  }
  // frost: fixed mottled specks (static, not per frame)
  const r = rng(seed); for (let i = 0; i < 260; i++) { g.fillStyle = alpha(r() < 0.5 ? '#ffffff' : '#000000', 0.035 + r() * 0.04); g.beginPath(); g.arc(gx + r() * gw, gy + r() * gh, 3 + r() * 9, 0, Math.PI * 2); g.fill(); }
  g.restore();
  rect(g, gx, gy, gw, gh, { w: 4, seed: seed + 1 });
  // leaded grid
  line(g, gx + gw / 2, gy, gx + gw / 2, gy + gh, { w: 2.5, seed: seed + 2, a: 0.7 }); line(g, gx, gy + gh / 2, gx + gw, gy + gh / 2, { w: 2.5, seed: seed + 3, a: 0.7 });
}
// the front door: frame, frosted glass upper panel, deadbolt + handle
function frontDoor(g, x, y, w, h, o = {}) {
  const [dx, dy] = shake(DOOR_KNOCKS, o.shakeAmp ?? 6);
  g.save(); g.translate(dx, dy);
  g.fillStyle = '#0b0d13'; g.fillRect(x, y, w, h);
  rect(g, x - 18, y - 18, w + 36, h + 18, { w: 4, seed: 640, a: 0.8 });
  rect(g, x, y, w, h, { w: 5, seed: 641 });
  const G = [x + w * 0.2, y + h * 0.07, w * 0.6, h * 0.4];
  frostedGlass(g, ...G, o);
  rect(g, x + w * 0.2, y + h * 0.56, w * 0.6, h * 0.36, { w: 3, seed: 642, a: 0.6 });   // lower panel
  const lx = x + w * 0.84, ly = y + h * 0.5; K.circleLine(g, lx, ly, w * 0.035, { w: 3.5, seed: 643 }); line(g, lx - w * 0.02, ly, lx + w * 0.02, ly, { w: 3, seed: 644 });  // deadbolt
  chalk(g, [[lx - w * 0.01, ly + h * 0.06], [lx - w * 0.09, ly + h * 0.06]], { w: 5, seed: 645 });                                                                     // handle
  g.restore();
  return { glass: G, lock: [lx + dx, ly + dy] };
}

// phone close-up: chat with MOM. msgs: [{at, lines}]  typing: global time when "..." starts for the next one
function phoneScreen(g, t, msgs, o = {}) {
  const cx = 540, cy = 640, w = 600, h = 1020, z = o.zoom || 1;
  const [bx, by] = buzzOffset(o.buzz || [], 5);
  g.save(); K.camera(g, z, cx, cy, bx, by);
  // room behind: nothing but black; glow from the screen
  lightPool(g, cx, cy, 900, RED, 0.55 * phoneLight(o.buzz));
  // body
  g.fillStyle = '#050507'; g.fillRect(cx - w / 2, cy - h / 2, w, h);
  const sx0 = cx - w / 2 + 26, sy0 = cy - h / 2 + 70, sw = w - 52, shh = h - 150;
  g.fillStyle = mix('#050507', RED, 0.16); g.fillRect(sx0, sy0, sw, shh);
  rect(g, cx - w / 2, cy - h / 2, w, h, { w: 5, seed: 700 }); rect(g, sx0, sy0, sw, shh, { w: 2.5, seed: 701, a: 0.6 });
  line(g, cx - 50, cy - h / 2 + 36, cx + 50, cy - h / 2 + 36, { w: 4, seed: 702, a: 0.7 });
  // header
  K.circleLine(g, sx0 + 70, sy0 + 70, 34, { w: 3, seed: 703 });
  K.text(g, 'Mom', sx0 + 124, sy0 + 62, { size: 46, font: 'Nunito', weight: 800, color: INK.chalk, align: 'left' });
  K.text(g, 'mobile', sx0 + 124, sy0 + 104, { size: 26, font: 'Nunito', weight: 700, color: INK.dim, align: 'left' });
  line(g, sx0 + 10, sy0 + 145, sx0 + sw - 10, sy0 + 145, { w: 2, seed: 704, a: 0.5 });
  // bubbles
  let yy = sy0 + 190; const T = K.K.now;
  msgs.forEach((m, i) => {
    if (T < m.at) return;
    const pop = ease.out(prog(T, m.at, m.at + 0.18)), lh = 50, bh = 36 + m.lines.length * lh, bw = sw - 120;
    g.save(); g.globalAlpha *= pop; g.translate(sx0 + 30, yy); g.scale(0.92 + 0.08 * pop, 0.92 + 0.08 * pop);
    g.fillStyle = mix('#050507', RED, i === msgs.length - 1 ? 0.62 : 0.34); g.beginPath(); g.roundRect(0, 0, bw, bh, 26); g.fill();
    m.lines.forEach((s, j) => K.text(g, s, 28, 18 + lh * 0.5 + j * lh, { size: 40, font: 'Nunito', weight: 800, color: '#ffffff', align: 'left' }));
    g.restore();
    if (m.time) K.text(g, m.time, sx0 + 40, yy + bh + 22, { size: 24, font: 'Nunito', weight: 700, color: INK.dim, align: 'left', alpha: pop });
    yy += bh + (m.time ? 60 : 26);
  });
  if (o.typing != null && T >= o.typing && T < (msgs[msgs.length - 1].at)) {
    g.fillStyle = mix('#050507', RED, 0.34); g.beginPath(); g.roundRect(sx0 + 30, yy, 130, 64, 26); g.fill();
    for (let i = 0; i < 3; i++) { g.fillStyle = alpha('#ffffff', 0.4 + 0.6 * (Math.floor(T * 6) % 3 === i)); g.beginPath(); g.arc(sx0 + 64 + i * 32, yy + 32, 8, 0, Math.PI * 2); g.fill(); }
  }
  // my thumb over the lower right edge
  chalk(g, [[cx + w / 2 + 120, cy + h / 2 + 260], [cx + w / 2 - 10, cy + h / 2 - 40], [cx + w / 2 - 70, cy + h / 2 - 120]], { w: 12, seed: 705 });
  chalk(g, [[cx - w / 2 - 140, cy + h / 2 + 200], [cx - w / 2 + 6, cy + h / 2 - 160]], { w: 12, seed: 706, a: 0.85 });
  g.restore();
  darkness(g, 0.55, [{ x: cx, y: cy, r: 1000 }]);
}

// a long flat hand pressed on glass from outside (palm + too-long fingers). Never a face.
function flatHand(g, x, y, s, o = {}) {
  const { a = 1, curl = 0, seed = 880 } = o;
  g.save(); g.globalAlpha *= a;
  const dark = '#020203', rim = alpha(INK.chalk, 0.55);
  // palm: wider than tall, squared, wrist narrowing into a long thin arm that runs down out of frame
  const pw = 150 * s, ph = 130 * s, top = y - ph / 2;
  const palm = [[x - pw * 0.5, top + 10 * s], [x + pw * 0.5, top], [x + pw * 0.46, y + ph * 0.45], [x + pw * 0.16, y + ph * 0.62], [x + 30 * s, y + ph * 0.62 + 700 * s], [x - 20 * s, y + ph * 0.62 + 700 * s], [x - pw * 0.2, y + ph * 0.6], [x - pw * 0.48, y + ph * 0.4]];
  const fingers = [[-0.62, 0.92, -0.10], [-0.2, 1.1, -0.03], [0.2, 1.06, 0.03], [0.58, 0.86, 0.11]].map(([u, L, ang], i) => {
    const bx = x + u * pw * 0.5, by = top + (Math.abs(u) > 0.5 ? 14 : 4) * s, len = 230 * s * L, c = curl * 26 * s;
    return [[bx, by + 20 * s], [bx + Math.sin(ang) * len * 0.5, by - len * 0.5], [bx + Math.sin(ang) * len * 0.82, by - len * 0.82 + c * 0.4], [bx + Math.sin(ang) * len, by - len + c]];
  });
  const thumb = [[x - pw * 0.45, y + ph * 0.2], [x - pw * 0.8, y - ph * 0.05], [x - pw * 1.12, y - ph * 0.45]];
  const drawAll = (col, extra) => {
    fillPoly(g, palm, col);
    fingers.forEach((f, i) => chalk(g, f, { w: 30 * s + extra, color: col, seed: seed + 10 + i, double: false, step: 22, wob: 0.8 }));
    chalk(g, thumb, { w: 32 * s + extra, color: col, seed: seed + 20, double: false, step: 22, wob: 0.8 });
  };
  drawAll(rim, 7 * s); drawAll(dark, 0);                     // thin pale outline where it presses the glass, dark hand
  fingers.forEach(f => { const p = f[3]; g.fillStyle = alpha(INK.chalk, 0.22); g.beginPath(); g.ellipse(p[0], p[1] + 10 * s, 10 * s, 13 * s, 0, 0, Math.PI * 2); g.fill(); });  // pressed fingertips
  // knuckle creases
  fingers.forEach((f, i) => line(g, f[1][0] - 9 * s, f[1][1], f[1][0] + 9 * s, f[1][1], { w: 2, color: alpha(INK.chalk, 0.4), seed: seed + 40 + i, double: false }));
  g.restore();
}

// ------------------------------------------------------------------ shared shot pieces
const TEXT1 = { lines: ['Locked out.', 'Open the door.'], time: '11:50 PM' };
const TEXT2 = { lines: ['Running late.', 'Home in an hour.', "Don't open the door", 'for anyone.'], time: '11:53 PM' };
// my face, close, lit from below by the phone
function glowFace(g, t, f, o = {}) {
  const { x = 500, y = 560, r = 220, z0 = 1.0, zs = 0.05, buzz = [], phoneOn = true, hand = null } = o;
  const z = z0 + zs * t; g.save(); K.camera(g, z, x, y + 140);
  const [ox, oy] = buzzOffset(buzz, 7);
  stickHead(g, x, y, r, f, { seed: 31 });
  if (hand) hand(g);
  const k = phoneLight(buzz);
  if (phoneOn) { chalk(g, [[x + 260, 1700], [x + 100 + ox, 1150 + oy]], { w: 12, seed: 690 });
    g.save(); g.translate(x + 60 + ox, 1060 + oy); g.rotate(-0.25); g.fillStyle = mix(INK.bg, RED, 0.8 * k); g.fillRect(-60, -105, 120, 210); rect(g, -64, -109, 128, 218, { w: 4, seed: 691, double: false }); g.restore(); }
  g.restore();
  darkness(g, 0.9, [{ x: x + 40, y: 900, r: 820 * k, k: 0.95 }]);
  lightPool(g, x + 40, 1020, 760, RED, 0.85 * k); lightPool(g, x + 40, 1040, 160, '#ffffff', 0.2 * k);
}
// the front door seen from the hall (wide), optional me standing in front
function doorWide(g, t, o = {}) {
  const { shadow = 0, z0 = 1.0, zs = 0.025, me = null } = o;
  g.save(); K.camera(g, z0 + zs * t, 540, 900);
  K.roomBox(g, { back: [200, 300, 680, 1250], seed: 612, wall: '#090b11' });
  frontDoor(g, 330, 420, 420, 1130, { shadow, sx: 545, armUp: o.armUp || 0 });
  let R = null; if (me) R = me(g);
  g.restore(); return R;
}
// bedroom window close (from inside), with the hand on the glass when handA > 0
const WIN = [210, 300, 640, 760];
function bedroomWindow(g, t, handA, handS = 1, curl = 0) {
  const [wx, wy, ww, wh] = WIN; const [dx, dy] = shake(GLASS_KNOCKS, 4);
  g.fillStyle = '#08090e'; g.fillRect(0, 0, E.W, E.H);
  line(g, 90, -40, 90, 1980, { w: 3, seed: 860, a: 0.5 }); line(g, 990, -40, 990, 1980, { w: 3, seed: 861, a: 0.5 });
  g.save(); g.translate(dx, dy);
  g.save(); g.beginPath(); g.rect(wx, wy, ww, wh); g.clip();
  g.fillStyle = '#0b0f1c'; g.fillRect(wx, wy, ww, wh);
  chalk(g, [[wx + ww + 40, wy + wh * 0.2], [wx + ww * 0.7, wy + wh * 0.35], [wx + ww * 0.45, wy + wh * 0.3]], { w: 4, seed: 862, a: 0.35 });
  chalk(g, [[wx + ww * 0.7, wy + wh * 0.35], [wx + ww * 0.62, wy + wh * 0.12]], { w: 3, seed: 863, a: 0.3 });
  if (handA > 0) flatHand(g, wx + ww * 0.52, wy + wh * 0.6, handS, { a: handA, curl });
  lightPool(g, wx + ww * 0.18, wy + wh * 0.88, 260, RED, 0.35);
  g.globalCompositeOperation = 'lighter'; g.strokeStyle = alpha('#ffffff', 0.05); g.lineWidth = 16; g.beginPath(); g.moveTo(wx + ww * 0.1, wy + wh); g.lineTo(wx + ww * 0.5, wy); g.stroke();
  g.restore();
  rect(g, wx - 14, wy - 14, ww + 28, wh + 28, { w: 5, seed: 864 }); rect(g, wx, wy, ww, wh, { w: 3, seed: 865, a: 0.7 });
  line(g, wx + ww / 2, wy, wx + ww / 2, wy + wh, { w: 4, seed: 866 });
  g.restore();
  chalk(g, [[wx - 60, wy + wh + 40], [wx + ww + 60, wy + wh + 40]], { w: 6, seed: 867 });
  chalk(g, [[wx - 60, wy + wh + 70], [wx + ww + 60, wy + wh + 70]], { w: 3, seed: 868, a: 0.7 });
}
// side-view staircase (descending left -> right). Returns a function giving the floor y at x.
function sideStairs(g) {
  g.fillStyle = INK.bg; g.fillRect(0, 0, E.W, E.H);
  const N = 9, x0 = 40, y0 = 760, run = 120, rise = 92;
  for (let i = 0; i < N; i++) chalk(g, [[x0 + i * run, y0 + i * rise], [x0 + (i + 1) * run, y0 + i * rise], [x0 + (i + 1) * run, y0 + (i + 1) * rise]], { w: 4, seed: 650 + i });
  chalk(g, [[x0, y0 - 300], [x0 + N * run, y0 + N * rise - 300]], { w: 4, seed: 670, a: 0.8 });
  for (let i = 0; i < N; i += 2) line(g, x0 + i * run + 60, y0 + i * rise - 300 + 46, x0 + i * run + 60, y0 + i * rise, { w: 2.5, seed: 671 + i, a: 0.6 });
  return (x) => y0 + ((x - x0) / run) * rise - 6;
}

// ------------------------------------------------------------------ shots (extended cut, 66.85 s)
// s01 0.0: the house at night, my parents' car pulling away (tail lights), one upstairs window lit red by my phone
K.stickShot('s01_house', (g, t) => {
  g.save(); K.camera(g, 1.0 + 0.03 * t, 540, 1100);
  const L = K.outside(g, t, { litWindow: true, moonColor: INK.dim });
  const gy = L.groundY, cx = lerp(480, 1180, ease.in(prog(t, 0, 2.5)));
  chalk(g, [[cx - 150, gy - 10], [cx - 150, gy - 70], [cx - 90, gy - 120], [cx + 70, gy - 120], [cx + 130, gy - 70], [cx + 150, gy - 70], [cx + 150, gy - 10]], { w: 4, seed: 30 });
  K.circleLine(g, cx - 90, gy - 6, 26, { w: 4, seed: 31 }); K.circleLine(g, cx + 90, gy - 6, 26, { w: 4, seed: 32 });
  lightPool(g, cx - 150, gy - 60, 120, RED, 0.8); g.fillStyle = RED; g.fillRect(cx - 158, gy - 72, 12, 18);
  g.restore();
  darkness(g, 0.45, [{ x: 360, y: 1000, r: 500, k: 0.6 }]);
}, { vignette: 0.85 });
// s02 2.5: me alone on the couch in the dark, phone in my lap
K.stickShot('s02_alone', (g, t) => {
  g.save(); K.camera(g, 1.15 + 0.03 * t, 540, 1100, 0, -330);
  const L = K.livingRoom(g, t, { tv: 0, moon: false });
  const R = stickFigure(g, { ...K.POSES.sit, tilt: 0.3, aR: K.POSES.phone.aR }, { eyes: 'dot', look: [0, 1], blink: (t > 1.4 && t < 1.52) ? 1 : 0 }, { x: 540, y: L.couchY + 10, s: 1, anchor: 'hip' });
  heldPhone(g, R.hR[0] + 4, R.hR[1] - 10, 0.9, 0.7);
  g.restore();
  darkness(g, 0.9, [{ x: 560, y: 760, r: 560, k: 0.85 }]);
  lightPool(g, 570, 820, 420, RED, 0.5);
}, { vignette: 0.85 });
// s03 4.8: the lock screen lights up: 11:50, then the notification from Mom
K.stickShot('s03_lockscreen', (g, t) => {
  const T = K.K.now, on = ease.out(prog(T, 4.9, 5.2)), cx = 540, cy = 640, w = 600, h = 1020;
  g.save(); K.camera(g, 1.0 + 0.03 * t, cx, cy);
  lightPool(g, cx, cy, 900, RED, 0.55 * on);
  g.fillStyle = '#050507'; g.fillRect(cx - w / 2, cy - h / 2, w, h);
  g.fillStyle = mix('#050507', RED, 0.16 * on); g.fillRect(cx - w / 2 + 26, cy - h / 2 + 70, w - 52, h - 150);
  rect(g, cx - w / 2, cy - h / 2, w, h, { w: 5, seed: 700 });
  if (on > 0) {
    K.text(g, '11:50', cx, cy - 300, { size: 150, font: 'Nunito', weight: 800, color: INK.chalk, alpha: on });
    K.text(g, 'Saturday', cx, cy - 195, { size: 34, font: 'Nunito', weight: 700, color: INK.dim, alpha: on });
    const n = ease.out(prog(T, 6.55, 6.8));
    if (n > 0) { g.save(); g.globalAlpha *= n; g.translate(0, (1 - n) * -40); g.fillStyle = mix('#050507', RED, 0.55); g.beginPath(); g.roundRect(cx - 250, cy - 60, 500, 150, 26); g.fill();
      K.text(g, 'Mom', cx - 220, cy - 18, { size: 34, font: 'Nunito', weight: 800, color: '#ffffff', align: 'left' });
      K.text(g, 'Locked out. Open the door.', cx - 220, cy + 36, { size: 32, font: 'Nunito', weight: 700, color: '#ffffff', align: 'left' }); g.restore(); }
  }
  g.restore();
  darkness(g, 0.55, [{ x: cx, y: cy, r: 1000, k: on }]);
});
// s04 6.9: the chat: "Mom." ... the bubble arrives
K.stickShot('s04_text_one', (g, t) => { phoneScreen(g, t, [{ at: 8.85, ...TEXT1 }], { zoom: 1.0 + 0.03 * t, typing: 7.6 }); });
// s05 9.8: my face reading it
K.stickShot('s05_reading', (g, t) => { glowFace(g, t, { eyes: 'dot', look: [Math.sin(t * 3) * 0.6, 1], brows: 'flat', mouth: 'flat' }); });
// s06 12.0: "That was weird."
K.stickShot('s06_weird', (g, t) => { glowFace(g, t, { eyes: 'dot', look: [-0.8, 0.2], brows: 'raised', mouth: 'frown' }, { x: 470, z0: 1.08 }); });
// s07 13.5: the key rack by the door: DAD and MOM hooks empty (she has her keys), mine hanging
K.stickShot('s07_keys', (g, t) => {
  g.save(); K.camera(g, 1.0 + 0.05 * t, 540, 760);
  g.fillStyle = '#090b11'; g.fillRect(0, 0, E.W, E.H);
  chalk(g, [[180, 560], [900, 560]], { w: 6, seed: 800 }); chalk(g, [[180, 620], [900, 620]], { w: 3, seed: 801, a: 0.7 });
  const H = [[300, 'DAD'], [540, 'MOM'], [780, 'ME']];
  H.forEach(([x, lab], i) => { chalk(g, [[x, 600], [x, 660], [x + 18, 676]], { w: 5, seed: 810 + i }); K.text(g, lab, x, 740, { size: 42, font: 'Nunito', weight: 800, color: INK.dim }); });
  const sw = Math.sin(t * 2.2) * 0.12; g.save(); g.translate(780, 672); g.rotate(sw); K.circleLine(g, 0, 26, 24, { w: 4, seed: 820 });
  chalk(g, [[0, 50], [-10, 160]], { w: 7, seed: 821 }); chalk(g, [[-10, 130], [-36, 128]], { w: 5, seed: 822 }); chalk(g, [[10, 46], [44, 140]], { w: 6, seed: 823 }); g.restore();
  g.restore();
  // my phone light sweeps across the empty MOM hook
  const lx = lerp(260, 700, ease.inOut(prog(t, 0, 2.0)));
  darkness(g, 0.9, [{ x: lx, y: 700, r: 460, k: 0.95 }]);
  lightPool(g, lx, 760, 420, RED, 0.5);
}, { vignette: 0.85 });
// s08 15.6: "Then I heard it." (first knock lands at 16.85)
K.stickShot('s08_heard', (g, t) => {
  const T = K.K.now, hit = T >= 16.85;
  glowFace(g, t, { eyes: hit ? 'wide' : 'dot', look: hit ? [-1, -0.4] : [0, 1], brows: 'worried', mouth: hit ? 'o' : 'flat' }, { x: 520, z0: 1.12, zs: 0.02 });
}, { jitter: [16.85], jitterAmp: 8 });
// s09 17.2: three slow knocks: the front door below, seen from the top of the stairs
K.stickShot('s09_three_knocks', (g, t) => {
  g.save(); K.camera(g, 1.0 + 0.025 * t, 540, 900);
  K.roomBox(g, { back: [250, 380, 580, 1080], seed: 610, wall: '#090b11' });
  frontDoor(g, 380, 560, 320, 900, { shadow: 0 });
  chalk(g, [[-40, 1050], [330, 1500], [380, 1980]], { w: 6, seed: 620 }); for (let i = 0; i < 6; i++) line(g, 30 + i * 60, 1130 + i * 70, 30 + i * 60, 1380 + i * 80, { w: 3.5, seed: 621 + i, a: 0.8 });
  g.restore();
  const R = stickFigure(g, 'phone', {}, { x: 170, y: 2230, s: 1.9, back: true }), k = phoneLight();
  darkness(g, 0.82, [{ x: 540, y: 880, r: 560, k: 0.75 }, { x: R.hR[0], y: R.hR[1], r: 420, k: 0.9 }]);
  lightPool(g, R.hR[0] + 40, R.hR[1] - 40, 440, RED, 0.7 * k);
}, { vignette: 0.8 });
// s10 19.8: down the stairs in the dark, phone in my hand
K.stickShot('s10_downstairs', (g, t) => {
  const fyAt = sideStairs(g), u = ease.inOut(prog(t, 0, 3.0)), fx = lerp(200, 700, u);
  const R = stickFigure(g, K.walk(t * 1.0), { eyes: 'dot', look: [1, 0.6], brows: 'worried' }, { x: fx, y: fyAt(fx), s: 1.45 }), k = phoneLight();
  heldPhone(g, R.hR[0] + 10, R.hR[1] - 8, 1.1, k, 0.3);
  darkness(g, 0.94, [{ x: R.hR[0], y: R.hR[1] - 60, r: 520, k: 0.95 }]);
  lightPool(g, R.hR[0], R.hR[1] - 40, 460, RED, 0.7 * k);
}, { vignette: 0.85 });
// s11 22.8: "Through the frosted glass," the shape fades in as I reach the bottom
K.stickShot('s11_glass', (g, t) => {
  const sh = ease.inOut(prog(K.K.now, 23.6, 24.8));
  doorWide(g, t, { shadow: sh, z0: 1.0, zs: 0.04, me: (g) => stickFigure(g, 'phone', {}, { x: 380, y: 2290, s: 1.9, back: true }) });
  const k = phoneLight();
  darkness(g, 0.86, [{ x: 545, y: 760, r: 520, k: 0.75 }, { x: 380, y: 1650, r: 520, k: 0.9 }]);
  lightPool(g, 360, 1700, 520, RED, 0.7 * k);
}, { vignette: 0.8 });
// s12 25.0: "someone was standing there." closer on the glass
K.stickShot('s12_standing', (g, t) => {
  g.save(); K.camera(g, 1.0 + 0.03 * t, 540, 760);
  frontDoor(g, 200, 160, 680, 1800, { shadow: 1, sx: 540, sh: 0.85 });
  g.restore();
  darkness(g, 0.78, [{ x: 540, y: 600, r: 640, k: 0.75 }, { x: 160, y: 1500, r: 500, k: 0.9 }]);
  lightPool(g, 120, 1550, 560, RED, 0.55 * phoneLight());
}, { vignette: 0.8 });
// s13 26.8: "Tall." me beside the door: its head sits far above mine
K.stickShot('s13_tall', (g, t) => {
  g.save(); K.camera(g, 1.0 - 0.02 * t, 540, 800);
  K.roomBox(g, { back: [120, 160, 840, 1420], seed: 616, wall: '#090b11' });
  frontDoor(g, 420, 260, 420, 1300, { shadow: 1, sx: 630 });
  const R = stickFigure(g, 'freeze', { eyes: 'wide', look: [1, -1], brows: 'worried', mouth: 'flat' }, { x: 200, y: 1560, s: 1.15 });
  g.restore();
  const k = phoneLight();
  darkness(g, 0.82, [{ x: 630, y: 560, r: 420, k: 0.7 }, { x: 200, y: 1250, r: 460, k: 0.9 }]);
  lightPool(g, 230, 1330, 420, RED, 0.6 * k);
}, { vignette: 0.8 });
// s14 28.0: "Very still." extreme close on the head in the glass (no sway, no breath)
K.stickShot('s14_still', (g, t) => {
  g.save(); K.camera(g, 1.0 + 0.04 * t, 540, 600);
  frontDoor(g, -500, -40, 2080, 4400, { shadow: 1, sx: 520, sh: 0.9, shakeAmp: 0 });
  g.restore();
  darkness(g, 0.6, [{ x: 540, y: 600, r: 800, k: 0.7 }]);
  lightPool(g, 80, 1700, 600, RED, 0.45 * phoneLight());
}, { vignette: 0.85 });
// s15 29.5: '"Mom?" I said.'  my face at the door edge, the shape blurred beyond
K.stickShot('s15_mom', (g, t) => {
  g.fillStyle = INK.bg; g.fillRect(0, 0, E.W, E.H);
  frostedGlass(g, 560, 120, 560, 1000, { shadow: 1, sx: 820, sh: 1.2 });
  const T = K.K.now, speak = T > 29.6 && T < 30.1;
  stickHead(g, 330, 720, 200, { eyes: 'dot', look: [1, -0.6], brows: 'worried', mouth: speak ? 'o' : 'flat' }, { seed: 33 });
  const k = phoneLight();
  darkness(g, 0.85, [{ x: 330, y: 900, r: 640, k: 0.95 }, { x: 840, y: 500, r: 520, k: 0.6 }]);
  lightPool(g, 330, 1080, 620, RED, 0.75 * k);
}, { vignette: 0.8 });
// s16 31.3: the knocking starts again; the long arm rises behind the glass
K.stickShot('s16_again', (g, t) => {
  g.save(); K.camera(g, 1.0 + 0.02 * t, 540, 760);
  frontDoor(g, 200, 160, 680, 1800, { shadow: 1, sx: 540, sh: 0.85, shakeAmp: 9 });
  g.restore();
  darkness(g, 0.78, [{ x: 540, y: 600, r: 640, k: 0.75 }, { x: 160, y: 1500, r: 500, k: 0.9 }]);
  lightPool(g, 120, 1550, 560, RED, 0.55 * phoneLight());
}, { vignette: 0.8 });
// s17 33.3: "Slow. Patient." very close on the glass and the knocking arm
K.stickShot('s17_patient', (g, t) => {
  g.save(); K.camera(g, 1.05 + 0.03 * t, 540, 700);
  frontDoor(g, -300, -20, 1680, 3600, { shadow: 1, sx: 440, sh: 0.9, shakeAmp: 12 });
  g.restore();
  darkness(g, 0.65, [{ x: 540, y: 700, r: 800, k: 0.7 }]);
  lightPool(g, 80, 1700, 600, RED, 0.45 * phoneLight());
}, { vignette: 0.85 });
// s18 35.9: my hand on the lock, the shape right behind the glass
K.stickShot('s18_lock', (g, t) => {
  g.save(); K.camera(g, 1.0 + 0.03 * t, 540, 900);
  const D = frontDoor(g, 120, -170, 840, 1900, { shadow: 1, sx: 520, sh: 0.8, shakeAmp: 10 });
  const reach = ease.out(prog(t, 0, 0.9)), [lx, ly] = D.lock;
  const hx = lerp(lx - 260, lx - 30, reach), hy = lerp(ly + 300, ly + 6, reach);
  chalk(g, [[-60, 1780], [hx - 260, hy + 170], [hx, hy]], { w: 12, seed: 680 });
  for (let i = 0; i < 4; i++) chalk(g, [[hx, hy - 18 + i * 12], [hx + 34 + i * 2, hy - 30 + i * 16], [hx + 46, hy - 10 + i * 14]], { w: 7, seed: 681 + i, double: false, step: 14 });
  g.restore();
  const k = phoneLight();
  darkness(g, 0.8, [{ x: 520, y: 600, r: 700, k: 0.7 }, { x: lx - 40, y: ly + 120, r: 520, k: 0.95 }]);
  lightPool(g, lx - 140, ly + 330, 600, RED, 0.75 * k);
}, { vignette: 0.8 });
// s19 37.8: the phone buzzes again
K.stickShot('s19_buzz', (g, t) => {
  const wide = K.K.now > 38.4;
  glowFace(g, t, { eyes: wide ? 'wide' : 'dot', look: [0.1, wide ? 1 : 0.4], brows: 'worried', mouth: wide ? 'o' : 'flat' }, { buzz: [37.85] });
}, { vignette: 0.85 });
// s20 39.7: the second text under the first
K.stickShot('s20_text_two', (g, t) => { phoneScreen(g, t, [{ at: 0, ...TEXT1 }, { at: 40.05, ...TEXT2 }], { zoom: 1.04 + 0.04 * t, typing: 39.7, buzz: [40.0] }); });
// s21 42.6: "Don't open the door for anyone." my hand slowly comes off the lock
K.stickShot('s21_dont', (g, t) => {
  const off = ease.inOut(prog(t, 0.5, 2.2));
  doorWide(g, t, { shadow: 1, z0: 1.06, zs: -0.02, me: (g) => stickFigure(g, K.posesMix('reach', 'freeze', off), {}, { x: 380 - off * 30, y: 2290 + off * 40, s: 1.9, back: true }) });
  const k = phoneLight();
  darkness(g, 0.86, [{ x: 545, y: 760, r: 520, k: 0.75 }, { x: 380, y: 1650, r: 520, k: 0.9 }]);
  lightPool(g, 330, 1700, 520, RED, 0.7 * k);
}, { vignette: 0.8 });
// s22 45.2: "I didn't move." frozen face, no blink, glow trembling
K.stickShot('s22_frozen', (g, t) => { glowFace(g, t, { eyes: 'wide', look: [0, -0.5], brows: 'worried', mouth: 'flat' }, { z0: 1.15, zs: 0.03, phoneOn: true }); }, { vignette: 0.9 });
// s23 47.6: "I didn't breathe." my hand over my mouth
K.stickShot('s23_breathe', (g, t) => {
  glowFace(g, t, { eyes: 'wide', look: [0, -0.4], brows: 'worried', mouth: 'none' }, { z0: 1.25, zs: 0.02, phoneOn: false, hand: (g) => {
    chalk(g, [[760, 1600], [620, 760]], { w: 14, seed: 840 });                                   // forearm from below
    K.blob(g, 560, 690, 120, 70, INK.head, { seed: 845, wob: 3 });                               // palm over the mouth
    K.ellipse(g, 560, 690, 124, 74, { w: 6, color: INK.feature, seed: 847, double: false });
    for (let i = 0; i < 4; i++) chalk(g, [[620, 650 + i * 26], [440 - i * 6, 640 + i * 28]], { w: 9, color: INK.feature, seed: 841 + i, double: false });
    chalk(g, [[680, 640], [600, 700], [480, 740], [440, 700]], { w: 8, color: INK.chalk, seed: 846, double: false });
  } });
}, { vignette: 0.9 });
// s24 49.4: two-shot: me and the shape in the glass, both still
K.stickShot('s24_standoff', (g, t) => {
  g.save(); K.camera(g, 1.0 + 0.02 * t, 540, 900);
  K.roomBox(g, { back: [120, 220, 840, 1300], seed: 618, wall: '#090b11' });
  frontDoor(g, 470, 320, 400, 1200, { shadow: 1, sx: 670 });
  const R = stickFigure(g, 'freeze', { eyes: 'wide', look: [1, -0.6], brows: 'worried' }, { x: 230, y: 2280, s: 1.9 });
  g.restore();
  const k = phoneLight();
  darkness(g, 0.84, [{ x: 670, y: 650, r: 420, k: 0.7 }, { x: 240, y: 1560, r: 520, k: 0.9 }]);
  lightPool(g, 260, 1640, 480, RED, 0.6 * k);
}, { vignette: 0.8 });
// s25 52.4: "Then the knocking stopped." (the last knock fell at 52.3)
K.stickShot('s25_stopped', (g, t) => {
  g.save(); K.camera(g, 1.0 + 0.02 * t, 540, 760);
  frontDoor(g, 200, 160, 680, 1800, { shadow: 1, sx: 540, sh: 0.85, shakeAmp: 9 });
  g.restore();
  darkness(g, 0.78, [{ x: 540, y: 600, r: 640, k: 0.75 }, { x: 160, y: 1500, r: 500, k: 0.9 }]);
  lightPool(g, 120, 1550, 560, RED, 0.55 * phoneLight());
}, { vignette: 0.8 });
// s26 54.7: "The shape was gone." it slides out of the glass
K.stickShot('s26_gone', (g, t) => {
  const go = ease.inOut(prog(K.K.now, 54.8, 55.7));
  g.save(); K.camera(g, 1.04 + 0.02 * t, 540, 760);
  frontDoor(g, 200, 160, 680, 1800, { shadow: 1 - go, sx: 540 - go * 300, sh: 0.85 });
  g.restore();
  darkness(g, 0.78, [{ x: 540, y: 600, r: 640, k: 0.75 }, { x: 160, y: 1500, r: 500, k: 0.9 }]);
  lightPool(g, 120, 1550, 560, RED, 0.55 * phoneLight());
}, { vignette: 0.8 });
// s27 56.6: I run back upstairs (right -> left, up)
K.stickShot('s27_run', (g, t) => {
  const fyAt = sideStairs(g), u = ease.inOut(prog(t, 0, 2.0)), fx = lerp(980, 260, u);
  const R = stickFigure(g, K.walk(t * 2.4, { stride: 0.55 }), { eyes: 'wide', look: [-1, -0.3], brows: 'worried', mouth: 'o' }, { x: fx, y: fyAt(fx), s: 1.45, flip: -1 }), k = phoneLight();
  heldPhone(g, R.hR[0] - 10, R.hR[1] - 8, 1.1, k, -0.3);
  darkness(g, 0.94, [{ x: R.hR[0], y: R.hR[1] - 60, r: 520, k: 0.95 }]);
  lightPool(g, R.hR[0], R.hR[1] - 40, 460, RED, 0.7 * k);
}, { vignette: 0.85 });
// s28 58.6: held silence in my room: on the bed, the window dark and empty behind me
K.stickShot('s28_held', (g, t) => {
  g.save(); K.camera(g, 1.0 + 0.05 * t, 360, 760);
  const L = K.bedroom(g, t, { moon: false, doorOpen: 0 });
  const R = stickFigure(g, 'phone', { eyes: 'wide', look: [0.6, 0.4], brows: 'worried' }, { x: 620, y: L.floorY - 150, s: 1.0, anchor: 'hip' });
  heldPhone(g, R.hR[0] + 4, R.hR[1] - 10, 0.9, 0.85);
  g.restore();
  darkness(g, 0.88, [{ x: 640, y: 1100, r: 520, k: 0.85 }, { x: 330, y: 760, r: 380, k: 0.5 }]);
  lightPool(g, 650, 1150, 460, RED, 0.5);
}, { vignette: 0.85 });
// s29 60.91: hard cut to the window. Knock, knock. The hand at "window".
K.stickShot('s29_window', (g, t) => {
  const T = K.K.now, handA = T >= 62.03 ? 1 : 0;
  g.save(); K.camera(g, 1.0 + (T >= 62.03 ? 0.06 * ease.out(prog(T, 62.03, 62.45)) : 0.015 * t), 530, 680);
  bedroomWindow(g, t, handA, 1.05);
  g.restore();
  darkness(g, 0.72, [{ x: 530, y: 650, r: 640, k: 0.8 }, { x: 120, y: 1500, r: 500, k: 0.9 }]);
  lightPool(g, 90, 1560, 600, RED, 0.6 * phoneLight());
});
// s30 62.45: closer on the hand; the fingertips tap
K.stickShot('s30_hand', (g, t) => {
  const T = K.K.now; let curl = 0; for (const k0 of [63.0, 63.3]) if (T >= k0 - 0.08 && T < k0 + 0.1) curl = 1;
  g.save(); K.camera(g, 1.35 + 0.08 * t, 545, 720);
  bedroomWindow(g, t, 1, 1.05, curl);
  g.restore();
  darkness(g, 0.66, [{ x: 545, y: 640, r: 700, k: 0.8 }]);
  lightPool(g, 60, 1600, 620, RED, 0.55 * phoneLight());
});
// s31 64.1: hard cut to the end card
K.stickShot('s31_end', (g, t) => { K.endCard(g, t); }, { captions: false, fx: false });
