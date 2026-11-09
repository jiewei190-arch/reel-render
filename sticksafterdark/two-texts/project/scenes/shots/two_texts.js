// Sticks After Dark #2 "Two Texts". Accent: red phone glow. No bulbs: the phone is the only light.
// Project-local sets (frosted front door, phone screen, side stairs, bedroom window, flat hand) live here, not in the kit.
import * as K from '/kits/sticks/sticks.js';
import { E, linGrad } from '/engine/core.js';
const { INK, fillPoly, stickFigure, stickHead, chalk, line, rect, lightPool, darkness, prog, ease, clamp, lerp, alpha, mix, rng, noise } = K;
K.setAccent('red');
const RED = K.K.accent;

// ------------------------------------------------------------------ helpers
// door knocks (global times) -> shake offset that decays fast
const DOOR_KNOCKS = [4.85, 5.11, 5.35, 8.35, 8.58, 15.05, 15.30, 16.65, 16.90, 17.72, 17.98];
const GLASS_KNOCKS = [21.88, 22.16, 24.05, 24.35];
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
  K.text(g, '11:52 PM', sx0 + 124, sy0 + 104, { size: 26, font: 'Nunito', weight: 700, color: INK.dim, align: 'left' });
  line(g, sx0 + 10, sy0 + 145, sx0 + sw - 10, sy0 + 145, { w: 2, seed: 704, a: 0.5 });
  // bubbles
  let yy = sy0 + 190; const T = K.K.now;
  msgs.forEach((m, i) => {
    if (T < m.at) return;
    const pop = ease.out(prog(T, m.at, m.at + 0.18)), lh = 50, bh = 36 + m.lines.length * lh, bw = sw - 120;
    g.save(); g.globalAlpha *= pop; g.translate(sx0 + 30, yy); g.scale(0.92 + 0.08 * pop, 0.92 + 0.08 * pop);
    g.fillStyle = mix('#050507', RED, i === msgs.length - 1 ? 0.62 : 0.34); g.beginPath(); g.roundRect(0, 0, bw, bh, 26); g.fill();
    m.lines.forEach((s, j) => K.text(g, s, 28, 18 + lh * 0.5 + j * lh, { size: 40, font: 'Nunito', weight: 800, color: '#ffffff', align: 'left' }));
    g.restore(); yy += bh + 26;
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

// ------------------------------------------------------------------ shots
// s01: pitch-dark stairwell, phone already buzzing in my hand, red glow from below on my face
K.stickShot('s01_stairwell', (g, t) => {
  const z = 1.0 + 0.04 * t; g.save(); K.camera(g, z, 520, 760);
  K.stairs(g, t);
  const [ox, oy] = buzzOffset([0.0], 3);
  const R = stickFigure(g, 'phone', { eyes: 'dot', look: [0.2, 1], brows: 'worried', blink: (t > 1.3 && t < 1.42) ? 1 : 0 }, { x: 520, y: 1520, s: 1.75 });
  const px = R.hR[0] + 6 + ox, py = R.hR[1] - 18 + oy, k = phoneLight([0.0]);
  heldPhone(g, px, py, 1.4, k);
  g.restore();
  const P = [(px - 520) * z + 520, (py - 760) * z + 760];
  darkness(g, 0.95, [{ x: P[0], y: P[1] - 120, r: 560 * k, k: 0.95 }]);
  lightPool(g, P[0], P[1] - 60, 520, RED, 0.75 * k); lightPool(g, P[0], P[1], 90, '#ffffff', 0.25 * k);
}, { vignette: 0.85 });

// s02: the first text
K.stickShot('s02_text_one', (g, t) => {
  phoneScreen(g, t, [{ at: 2.15, lines: ['Locked out.', 'Open the door.'] }], { zoom: 1.0 + 0.03 * t });
});

// s03: from the top of the stairs: the front door below, a tall shadow in the frosted glass (it knocks)
K.stickShot('s03_door_glass', (g, t) => {
  g.save(); K.camera(g, 1.0 + 0.025 * t, 540, 900);
  K.roomBox(g, { back: [250, 380, 580, 1080], seed: 610, wall: '#090b11' });
  const D = frontDoor(g, 380, 560, 320, 900, { shadow: 0.95, sx: 560 });
  // banister falling away toward the door (we're at the top)
  chalk(g, [[-40, 1050], [330, 1500], [380, 1980]], { w: 6, seed: 620 }); for (let i = 0; i < 6; i++) line(g, 30 + i * 60, 1130 + i * 70, 30 + i * 60, 1380 + i * 80, { w: 3.5, seed: 621 + i, a: 0.8 });
  g.restore();
  // my back, bottom-left foreground, phone glow
  const R = stickFigure(g, 'phone', {}, { x: 170, y: 2230, s: 1.9, back: true });
  const k = phoneLight();
  darkness(g, 0.82, [{ x: 540, y: 880, r: 560, k: 0.75 }, { x: R.hR[0], y: R.hR[1], r: 420, k: 0.9 }]);
  lightPool(g, R.hR[0] + 40, R.hR[1] - 40, 440, RED, 0.7 * k);
}, { vignette: 0.8 });

// s04: side view, walking down the stairs with the phone (glow swings)
K.stickShot('s04_downstairs', (g, t) => {
  const u = ease.inOut(prog(t, 0, 1.75));
  g.fillStyle = INK.bg; g.fillRect(0, 0, E.W, E.H);
  // steps descending left -> right
  const N = 9, x0 = 40, y0 = 760, run = 120, rise = 92;
  for (let i = 0; i < N; i++) chalk(g, [[x0 + i * run, y0 + i * rise], [x0 + (i + 1) * run, y0 + i * rise], [x0 + (i + 1) * run, y0 + (i + 1) * rise]], { w: 4, seed: 650 + i });
  chalk(g, [[x0, y0 - 300], [x0 + N * run, y0 + N * rise - 300]], { w: 4, seed: 670, a: 0.8 });   // handrail
  for (let i = 0; i < N; i += 2) line(g, x0 + i * run + 60, y0 + i * rise - 300 + 46, x0 + i * run + 60, y0 + i * rise, { w: 2.5, seed: 671 + i, a: 0.6 });
  const fx = lerp(220, 640, u), fy = y0 + ((fx - x0) / run) * rise - 6;
  const R = stickFigure(g, K.walk(t * 1.15), { eyes: 'dot', look: [1, 0.6], brows: 'worried' }, { x: fx, y: fy, s: 1.45 });
  const k = phoneLight();
  heldPhone(g, R.hR[0] + 10, R.hR[1] - 8, 1.1, k, 0.3);
  darkness(g, 0.94, [{ x: R.hR[0], y: R.hR[1] - 60, r: 520, k: 0.95 }]);
  lightPool(g, R.hR[0], R.hR[1] - 40, 460, RED, 0.7 * k);
}, { vignette: 0.85 });

// s05: close: my hand on the deadbolt, the shadow right behind the glass
K.stickShot('s05_lock', (g, t) => {
  g.save(); K.camera(g, 1.0 + 0.03 * t, 540, 900);
  const D = frontDoor(g, 120, -170, 840, 1900, { shadow: 1, sx: 520, sh: 0.8, shakeAmp: 10 });
  // my arm comes in from bottom-left, fingers on the thumb-turn
  const reach = ease.out(prog(t, 0, 0.9)), [lx, ly] = D.lock;
  const hx = lerp(lx - 260, lx - 30, reach), hy = lerp(ly + 300, ly + 6, reach);
  chalk(g, [[-60, 1780], [hx - 260, hy + 170], [hx, hy]], { w: 12, seed: 680 });
  for (let i = 0; i < 4; i++) chalk(g, [[hx, hy - 18 + i * 12], [hx + 34 + i * 2, hy - 30 + i * 16], [hx + 46, hy - 10 + i * 14]], { w: 7, seed: 681 + i, double: false, step: 14 });
  g.restore();
  const k = phoneLight();
  darkness(g, 0.8, [{ x: 520, y: 600, r: 700, k: 0.7 }, { x: lx - 40, y: ly + 120, r: 520, k: 0.95 }]);
  lightPool(g, lx - 140, ly + 330, 600, RED, 0.75 * k);
}, { vignette: 0.8 });

// s06: the phone buzzes again: face close-up lit from below
K.stickShot('s06_buzz', (g, t) => {
  const T = K.K.now, z = 1.0 + 0.05 * t; g.save(); K.camera(g, z, 500, 700);
  const wide = T > 10.75;
  const [ox, oy] = buzzOffset([10.2], 7);
  stickHead(g, 500, 560, 220, { eyes: wide ? 'wide' : 'dot', look: [0.1, wide ? 1 : 0.4], brows: 'worried', mouth: wide ? 'o' : 'flat' }, { seed: 31 });
  // phone + hand coming up from below
  chalk(g, [[760, 1700], [600 + ox, 1150 + oy]], { w: 12, seed: 690 });
  const k = phoneLight([10.2]);
  g.save(); g.translate(560 + ox, 1060 + oy); g.rotate(-0.25); g.fillStyle = mix(INK.bg, RED, 0.8 * k); g.fillRect(-60, -105, 120, 210); rect(g, -64, -109, 128, 218, { w: 4, seed: 691, double: false }); g.restore();
  g.restore();
  darkness(g, 0.9, [{ x: 540, y: 900, r: 820 * k, k: 0.95 }]);
  lightPool(g, 540, 1020, 760, RED, 0.85 * k); lightPool(g, 540, 1040, 160, '#ffffff', 0.2 * k);
}, { vignette: 0.85 });

// s07: the second text appears under the first
K.stickShot('s07_text_two', (g, t) => {
  phoneScreen(g, t, [{ at: 0, lines: ['Locked out.', 'Open the door.'] }, { at: 12.25, lines: ['Running late.', 'Home in an hour.', "Don't open the door", 'for anyone.'] }], { zoom: 1.04 + 0.05 * t, typing: 11.95, buzz: [12.2] });
});

// s08: wide from behind me at the door; the shadow is still there; my hand slowly comes off the lock
K.stickShot('s08_back_away', (g, t) => {
  g.save(); K.camera(g, 1.06 - 0.03 * t, 540, 900);
  K.roomBox(g, { back: [200, 300, 680, 1250], seed: 612, wall: '#090b11' });
  const D = frontDoor(g, 330, 420, 420, 1130, { shadow: 0.95, sx: 545 });
  const off = ease.inOut(prog(t, 0.8, 2.4));
  const pose = K.posesMix('reach', 'freeze', off);
  const R = stickFigure(g, pose, {}, { x: 380 - off * 30, y: 2290 + off * 40, s: 1.9, back: true });
  g.restore();
  const k = phoneLight();
  darkness(g, 0.86, [{ x: 545, y: 760, r: 520, k: 0.75 }, { x: 380, y: 1650, r: 520, k: 0.9 }]);
  lightPool(g, 330, 1700, 520, RED, 0.7 * k);
}, { vignette: 0.8 });

// s09: the knocking stops; the shadow slides out of the glass
K.stickShot('s09_stopped', (g, t) => {
  const T = K.K.now, go = ease.inOut(prog(T, 18.75, 19.6));
  g.save(); K.camera(g, 1.0 + 0.02 * t, 540, 760);
  const D = frontDoor(g, 200, 160, 680, 1800, { shadow: 1 - go, sx: 540 - go * 300, sh: 0.85, shakeAmp: 9 });
  g.restore();
  const k = phoneLight();
  darkness(g, 0.78, [{ x: 540, y: 600, r: 640, k: 0.75 }, { x: 160, y: 1500, r: 500, k: 0.9 }]);
  lightPool(g, 120, 1550, 560, RED, 0.55 * k);
}, { vignette: 0.8 });

// s10: held silence: the empty glass. I back away, slowly. (no captions here: nothing is spoken)
K.stickShot('s10_held', (g, t) => {
  g.save(); K.camera(g, 1.0 + 0.035 * t, 540, 760);
  K.roomBox(g, { back: [200, 260, 680, 1300], seed: 614, wall: '#090b11' });
  frontDoor(g, 330, 380, 420, 1180, { shadow: 0 });
  g.restore();
  const back = ease.out(prog(t, 0, 2.0));
  const R = stickFigure(g, 'scared', {}, { x: 560 - back * 40, y: 1900 + back * 200, s: 1.7 + back * 0.35, back: true });
  const k = phoneLight() * (0.92 + 0.08 * Math.sin(t * 13));
  darkness(g, 0.86, [{ x: 540, y: 700, r: 520, k: 0.7 }, { x: R.hR[0], y: R.hR[1], r: 520, k: 0.9 }]);
  lightPool(g, R.hR[0], R.hR[1] - 40, 540, RED, 0.7 * k);
}, { vignette: 0.85 });

// s11: hard cut upstairs: my bedroom window. Knock, knock. A long hand flat on the glass.
const WIN = [210, 300, 640, 760];
function bedroomWindow(g, t, handA, handS = 1, curl = 0) {
  const [wx, wy, ww, wh] = WIN; const [dx, dy] = shake(GLASS_KNOCKS, 4);
  g.fillStyle = '#08090e'; g.fillRect(0, 0, E.W, E.H);
  // wall corner + sill + curtain lines
  line(g, 90, -40, 90, 1980, { w: 3, seed: 860, a: 0.5 }); line(g, 990, -40, 990, 1980, { w: 3, seed: 861, a: 0.5 });
  g.save(); g.translate(dx, dy);
  g.save(); g.beginPath(); g.rect(wx, wy, ww, wh); g.clip();
  g.fillStyle = '#0b0f1c'; g.fillRect(wx, wy, ww, wh);
  // bare branches outside
  chalk(g, [[wx + ww + 40, wy + wh * 0.2], [wx + ww * 0.7, wy + wh * 0.35], [wx + ww * 0.45, wy + wh * 0.3]], { w: 4, seed: 862, a: 0.35 });
  chalk(g, [[wx + ww * 0.7, wy + wh * 0.35], [wx + ww * 0.62, wy + wh * 0.12]], { w: 3, seed: 863, a: 0.3 });
  if (handA > 0) flatHand(g, wx + ww * 0.52, wy + wh * 0.6, handS, { a: handA, curl });
  // reflection of my phone in the glass, lower left
  lightPool(g, wx + ww * 0.18, wy + wh * 0.88, 260, RED, 0.35);
  g.globalCompositeOperation = 'lighter'; g.strokeStyle = alpha('#ffffff', 0.05); g.lineWidth = 16; g.beginPath(); g.moveTo(wx + ww * 0.1, wy + wh); g.lineTo(wx + ww * 0.5, wy); g.stroke();
  g.restore();
  rect(g, wx - 14, wy - 14, ww + 28, wh + 28, { w: 5, seed: 864 }); rect(g, wx, wy, ww, wh, { w: 3, seed: 865, a: 0.7 });
  line(g, wx + ww / 2, wy, wx + ww / 2, wy + wh, { w: 4, seed: 866 });
  g.restore();
  chalk(g, [[wx - 60, wy + wh + 40], [wx + ww + 60, wy + wh + 40]], { w: 6, seed: 867 });   // sill
  chalk(g, [[wx - 60, wy + wh + 70], [wx + ww + 60, wy + wh + 70]], { w: 3, seed: 868, a: 0.7 });
}
K.stickShot('s11_window', (g, t) => {
  const T = K.K.now, handA = T >= 22.95 ? 1 : 0;
  g.save(); K.camera(g, 1.0 + (T >= 22.95 ? 0.06 * ease.out(prog(T, 22.95, 23.5)) : 0.015 * t), 530, 680);
  bedroomWindow(g, t, handA, 1.05);
  g.restore();
  const k = phoneLight();
  darkness(g, 0.72, [{ x: 530, y: 650, r: 640, k: 0.8 }, { x: 120, y: 1500, r: 500, k: 0.9 }]);
  lightPool(g, 90, 1560, 600, RED, 0.6 * k);
});

// s12: closer on the hand on the glass; the fingertips tap
K.stickShot('s12_hand', (g, t) => {
  const T = K.K.now; let curl = 0; for (const k0 of [24.05, 24.35]) if (T >= k0 - 0.08 && T < k0 + 0.1) curl = 1;
  g.save(); K.camera(g, 1.35 + 0.08 * t, 545, 720);
  bedroomWindow(g, t, 1, 1.05, curl);
  g.restore();
  darkness(g, 0.66, [{ x: 545, y: 640, r: 700, k: 0.8 }]);
  lightPool(g, 60, 1600, 620, RED, 0.55 * phoneLight());
});

// s13: hard cut to the end card
K.stickShot('s13_end', (g, t) => { K.endCard(g, t); }, { captions: false, fx: false });
