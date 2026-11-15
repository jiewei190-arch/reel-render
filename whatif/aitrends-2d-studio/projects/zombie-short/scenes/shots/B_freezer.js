// B_freezer.js — zombie Short batch B (s013-s024, 23.22-47.23 s): the hits on the glass -> a hundred, MISTAKE 2, the run to the back,
// the freezer door SLAM, "Cold. Dark. Silent. Safe.", MISTAKE 3, the handleless steel, the realisation face.
// Local pieces: mistakeTitle (horror.js ruleTitle copy that writes 'MISTAKE n'), frontFrame/counter (redrawn over the horde in s015),
// swingDoors + freezerSlab (s018), oldScratches (s019 / s023 — same height as his fingers), youHand (s023).
import { E, S, registerShot, layer, ease, prog, clamp, lerp, rng, noise, rr, seg, circle, poly, ring, alpha, shade, mix, glow, linGrad, radGrad, wordTime } from '/engine/core.js';
import { blendPose } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { HERO } from '../cast.js';
import { blinkFlag, exprAt, idle, walkAlong, lookToward, camMove } from '../sets/acting.js';
import { giantFace, faceAt } from '../sets/faces.js';
import { store, storeFg, breathFog, storeGround } from '../sets/store.js';
import { zombieSil, handsOnGlass, glassHorde, thudShake } from '../sets/zombies.js';
import { grain, vignette, coldGrade, breathe, flashlight, motes, interference, scrawl } from '../sets/horror.js';

const YOU = { ...HERO, head: 'hood', headColor: HERO.color };
const DOORLIGHT = '#ffe6b8', ICE = '#bfe4ff';
const shotWord = (w, st, fb) => { const g = wordTime(w, st - 0.1); return (g == null || g > st + 10 ? st + fb : g) - st; };
const finish = (g, t, o = {}) => { coldGrade(g, o.cold ?? 0.4); if (o.vig) vignette(g, o.vig); breathe(g, t, o.breathe ?? 0.3); grain(g, t, o.grain ?? 0.09); };
const toScreen = (cam, d, x, y) => { const z = 1 + ((cam.z ?? 1) - 1) * d; return [E.W / 2 + z * (x - E.W / 2 - (cam.x || 0) * d), E.H / 2 + z * (y - E.H / 2 - (cam.y || 0) * d)]; };
const zoomAt = (g, cx, cy, z, fn) => { g.save(); g.translate(cx, cy); g.scale(z, z); g.translate(-cx, -cy); fn(); g.restore(); };
const hand = (p, x, y, s, f, back = false) => [x + (back ? p.hB : p.hF)[0] * s * f, y + (back ? p.hB : p.hF)[1] * s];
const mouth = (p, x, y, s, f) => [x + (p.head[0] + 19) * s * f, y + (p.head[1] + 12) * s];

// ---------- MISTAKE card (horror.js ruleTitle, copied locally: writes 'MISTAKE n', no subtitle) ----------
const idT = (g) => { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.scale(E.PX, E.PX); };
function mistakeTitle(g, t, n, o = {}) {
  const cx = E.W / 2, cy = o.y ?? 700, r = rng(n * 7 + 1), still = o.still ?? 1e9;
  const thud = (o.thuds || []).reduce((a, h) => a + (t >= h && t < h + 0.12 ? 2 * Math.sin((t - h) * 80) : 0), 0);
  const shud = t >= still ? 0 : noise(t * 18, n) * 2 + (t < 0.15 ? (1 - t / 0.15) * 14 : 0) + thud;
  idT(g); g.fillStyle = '#05060a'; g.fillRect(0, 0, E.W, E.H); g.restore();
  g.save(); g.translate(cx + shud, cy + thud * 0.5); g.rotate(-0.02 + (t >= still ? 0.006 * Math.sin(still * 0.8) : 0.006 * Math.sin(t * 0.8)));
  const sc = lerp(1, 1.04, ease.inOut(clamp(t / (o.dur ?? 2)))); g.scale(sc, sc);
  const W = 900, H = 640; g.fillStyle = '#d8d0bc'; g.beginPath(); g.moveTo(-W / 2, -H / 2);
  for (let i = 0; i <= 20; i++) g.lineTo(-W / 2 + i * W / 20, -H / 2 + (r() - 0.5) * 22); for (let i = 0; i <= 14; i++) g.lineTo(W / 2 + (r() - 0.5) * 18, -H / 2 + i * H / 14);
  for (let i = 20; i >= 0; i--) g.lineTo(-W / 2 + i * W / 20, H / 2 + (r() - 0.5) * 22); g.closePath(); g.fill();
  g.fillStyle = radGrad(g, 0, 0, 100, W * 0.7, ['rgba(0,0,0,0)', 'rgba(40,20,10,.35)']); g.fillRect(-W / 2, -H / 2, W, H);
  const k1 = ease.out(prog(t, 0.05, 0.6));
  for (const [dx, dy, a] of [[3, 2, 0.25], [-2, 1, 0.2], [0, 0, 1]]) scrawl(g, `MISTAKE ${n}`, dx, 30 + dy, { size: 120, color: alpha('#140a0c', a), k: k1, seed: n * 3, wobble: 1.8, align: 'center' });
  for (let i = 0; i < 9; i++) { const sx = (r() - 0.5) * W * 0.9, sy = (r() - 0.5) * H * 0.9, a = clamp((t - 0.1 - i * 0.04) * 6); circle(g, sx, sy, (2 + r() * 9) * a, alpha('#140a0c', 0.75)); }
  if (o.crack != null) {                                                                      // an ink stroke that cracks off the paper edge
    const k = ease.out(prog(t, o.crack, o.crack + 0.3)), R = rng(5), pts = [[300, 70]]; for (let i = 1; i <= 7; i++) pts.push([300 + i * 40, 70 + (R() - 0.3) * 50 + i * 14]);
    if (k > 0) { const m = Math.max(2, Math.ceil(pts.length * k)); seg(g, pts.slice(0, m), 7, '#140a0c'); seg(g, pts.slice(0, m).map(([x, y]) => [x + 2, y + 4]), 3, alpha('#140a0c', 0.4)); }
  }
  g.restore();
  interference(g, t, 1 - ease.out(prog(t, 0, 0.25)));
  vignette(g, 0.85, { r0: 0.15, r1: 0.6 }); grain(g, t, 0.1);
}

// ============================== s013 HIT 1 (cut ON the hit) ==============================
registerShot('s013', { draw(g, t, info) {
  const st = info.shot.start ?? 23.22, tg = shotWord('glass', st, 0.79), sh = thudShake(t, [0], 16);
  const z = 1.04 + 0.012 * ease.inOut(clamp(t / info.dur)), tx = noise(t * 9, 3), ty = noise(t * 9, 5);
  idT(g); g.fillStyle = '#05060a'; g.fillRect(0, 0, E.W, E.H); g.restore();
  zoomAt(g, 540 + sh[0] + tx, 760 + sh[1] + ty, z, () => {
    glassHorde(g, t, { x: -60, y: -60, w: E.W + 120, h: 1500, n: 0, hands: 0, moon: 1, seed: 3, frame: false });           // the moonlit lot through the glass
    g.save(); g.filter = 'blur(3px)'; zombieSil(g, 230, 1470, 3.4, { t, arms: 'reach', rim: 0.5, seed: 4, tilt: 0.22, sway: 0.3 }); g.restore();   // the shape behind it
    seg(g, [[60, -80], [60, 1500]], 34, '#0e1016'); seg(g, [[-80, 1180], [E.W + 80, 1180]], 26, '#0e1016');                 // a mullion + the sill
    const bx = 540, by = 720;                                                                     // the flashlight bloom: the palm lands IN it
    g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = radGrad(g, bx, by, 0, 420, ['rgba(255,226,170,.34)', 'rgba(255,214,150,.12)', 'rgba(255,214,150,0)']); g.beginPath(); g.arc(bx, by, 420, 0, 7); g.fill(); g.restore();
    const curl = ease.out(prog(t, tg, tg + 0.25)), slide = 0.1 * ease.inOut(prog(t, tg, info.dur));
    handsOnGlass(g, t, 520, 700, 2.2 * (1 + 0.12 * Math.exp(-t * 14)) * (1 - 0.05 * curl), { press: 1, fog: ease.out(prog(t, 0, 1)), slide, rot: -0.08 + 0.05 * curl, seed: 3 });
    const fl = clamp(1 - t / 0.18); if (fl > 0) { g.fillStyle = `rgba(210,222,245,${0.22 * fl})`; g.fillRect(-100, -100, E.W + 200, E.H + 200); }   // thud flash
  });
  flashlight(g, 260, 2050, Math.atan2(720 - 2050, 540 - 260), { len: 1700, spread: 0.26, dark: 0.8, intensity: 0.2 });
  motes(g, t, { x: 260, y: 400, w: 560, h: 800, count: 26, color: '#ffe8c8' });
  finish(g, t, { vig: 0.8 });
} });

// ============================== s014 HIT 2 + a third shape ==============================
registerShot('s014', { draw(g, t, info) {
  const hits = [0, 1.05], sh = thudShake(t, hits, 12), z = lerp(1, 1.04, ease.inOut(clamp(t / info.dur)));
  const gy = E.H * 0.14, gh = E.H * 0.52;
  idT(g); g.fillStyle = '#05060a'; g.fillRect(0, 0, E.W, E.H); g.restore();
  zoomAt(g, 540 + sh[0], 700 + sh[1], z, () => {
    glassHorde(g, t, { x: -20, y: gy, w: E.W + 40, h: gh, n: 3, press: 0.25, hits, hands: 0, moon: 0.8, seed: 7 });
    // the third shape steps up out of the dark at 1.05
    const up = ease.out(prog(t, 0.75, 1.1)); if (up > 0) { g.save(); g.beginPath(); g.rect(-20, gy, E.W + 40, gh); g.clip(); g.globalAlpha *= up; g.filter = 'blur(2px)'; zombieSil(g, 300, gy + gh * 1.25 + 120 * (1 - up), 2.9, { t, arms: 'reach', rim: 0.6, seed: 9, tilt: 0.3 }); g.restore(); }
    const bsh = sh[0] * 1.8, bx = 600 + bsh, by = 640 + sh[1] * 1.8;
    g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = radGrad(g, bx, by, 0, 380, ['rgba(255,226,170,.3)', 'rgba(255,214,150,.1)', 'rgba(255,214,150,0)']); g.beginPath(); g.arc(bx, by, 380, 0, 7); g.fill(); g.restore();
    const drift = ease.inOut(prog(t, 0.15, 1.6));                                                  // the two hands slide toward the bloom, in sync
    handsOnGlass(g, t, 470 + 40 * drift, 820 - 30 * drift, 1.7, { press: 1, fog: 1, slide: 0.12, rot: -0.05, seed: 3 });
    handsOnGlass(g, t, 760 - 40 * drift, 520 + 30 * drift, 1.6 * (1 + 0.14 * Math.exp(-t * 14)), { press: 1, fog: ease.out(prog(t, 0, 0.9)), rot: 0.3, seed: 5 });
    if (t >= 1.05) handsOnGlass(g, t, 300, 560, 1.4 * (1 + 0.14 * Math.exp(-(t - 1.05) * 14)), { press: 1, fog: ease.out(prog(t, 1.05, 1.6)), rot: -0.3, seed: 8 });
    for (const h of hits) { const u = t - h; if (u >= 0 && u < 0.16) { g.fillStyle = `rgba(210,222,245,${0.16 * (1 - u / 0.16)})`; g.fillRect(-100, -100, E.W + 200, E.H + 200); } }
    g.fillStyle = linGrad(g, 0, gy + gh, 0, E.H, ['#0c0d12', '#05060a']); g.fillRect(-100, gy + gh + 13, E.W + 200, E.H);        // inside: the dark floor
  });
  flashlight(g, 200 + sh[0], 2000, Math.atan2(640 - 2000, 600 - 200), { len: 1800, spread: 0.3, dark: 0.72, intensity: 0.18 });
  finish(g, t, { vig: 0.8 });
} });

// ============================== s015 THEN A HUNDRED ==============================
const HITS15 = [0.22, 0.62, 0.95, 1.20, 1.40, 1.56, 1.70, 1.82, 1.93, 2.03, 2.12, 2.21, 2.30, 2.38, 2.46];
function frontFrame(g, P) {                                                                        // store.js front mullions, redrawn over the horde
  for (let i = 0; i <= 4; i++) seg(g, [[P.glassX + i * P.glassW / 4, P.glassTop], [P.glassX + i * P.glassW / 4, P.glassTop + P.glassH]], 18, '#1a1e26');
  seg(g, [[P.glassX, P.glassTop + 420], [P.glassX + P.glassW, P.glassTop + 420]], 14, '#1a1e26');
  g.strokeStyle = '#0a0c12'; g.lineWidth = 30; g.strokeRect(P.glassX - 15, P.glassTop - 15, P.glassW + 30, P.glassH + 30);
}
function counter(g, cx, GY) {                                                                      // store.js checkout counter, redrawn in front
  rr(g, cx - 220, GY - 300, 440, 300, 10); g.fillStyle = '#16181e'; g.fill(); g.fillStyle = '#0c0d10'; g.fillRect(cx - 220, GY - 312, 440, 22);
  rr(g, cx + 80, GY - 440, 120, 130, 8); g.fillStyle = '#1e2028'; g.fill(); rr(g, cx + 95, GY - 425, 90, 50, 4); g.fillStyle = '#05060a'; g.fill();
}
registerShot('s015', { draw(g, t, info) {
  let dx = 0, dy = 0; HITS15.forEach((h, i) => { const u = t - h; if (u < 0 || u > 0.6) return; const d = (5 + i * 1.1) * Math.exp(-u * 8); dx += noise(t * 40, h * 7) * d; dy += noise(t * 40, h * 11) * d; });
  const cam = camMove(t, info.dur, { z: [1.0, 1.06], y: [-40, -50], drift: 0.3 }); cam.x += dx; cam.y += dy;
  const S0 = store(g, t, cam, { view: 'front', moon: 1 }), P = S0.pos, GY = S0.GY, th = shotWord('hundred', info.shot.start ?? 26.61, 0.57);
  const press = lerp(0.3, 1, ease.inOut(prog(t, 0, 2.2))), fill = ease.out(prog(t, 0, th));
  layer(g, cam, 0.6, (g) => {
    glassHorde(g, t, { x: P.glassX, y: P.glassTop, w: P.glassW, h: P.glassH, n: 8, press, hits: [], hands: 0, moon: 1, seed: 9, back: true, frame: false });
    g.save(); g.globalAlpha *= fill; glassHorde(g, t, { x: P.glassX, y: P.glassTop - 260 * fill, w: P.glassW, h: P.glassH + 260 * fill, n: 32, press, hits: [], hands: 0, moon: 1, seed: 21, back: false, frame: false }); g.restore();
    glassHorde(g, t, { x: P.glassX, y: P.glassTop, w: P.glassW, h: P.glassH, n: 0, press, hits: HITS15, hands: 15, moon: 1, seed: 9, back: false, frame: false });
    const bow = prog(t, 2.0, 2.5); if (bow > 0) for (let i = 0; i < 4; i++) {                    // the panes bow inward: a faint curved highlight
      const x0 = P.glassX + i * P.glassW / 4, k = 0.5 + 0.5 * Math.sin(t * 30 + i); g.strokeStyle = alpha('#dfe8ff', 0.16 * bow * k); g.lineWidth = 5;
      g.beginPath(); g.moveTo(x0 + 30, P.glassTop + 460); g.quadraticCurveTo(x0 + P.glassW / 8, P.glassTop + 820 + 40 * bow, x0 + P.glassW / 4 - 30, P.glassTop + 460); g.stroke(); }
    frontFrame(g, P);
  });
  const hx = 250, hy = GY - 30, s = 1.4, pose = { ...idle({ ...blendPose('stand', 'shock', 0.5), hF: [52, -162], eF: [28, -150] }, t, 4) };
  pose.head = [pose.head[0] + noise(t * 20, 2) * 1.2, pose.head[1]];
  layer(g, cam, 1, (g) => {
    actor(g, YOU, { x: hx, y: hy, s, facing: 1, pose, expr: 'scared', blink: blinkFlag(t, 3.2, 2), look: lookToward(1, -0.5), rim: S0.rim, t });
    counter(g, P.counterX + 40, GY + 30);
  });
  const [lx, ly] = toScreen(cam, 1, ...hand(pose, hx, hy, s, 1));
  const jit = HITS15.reduce((a, h) => a + (t > h && t < h + 0.2 ? noise(t * 50, h) * 0.08 : 0), 0);
  storeFg(g, t, cam, { view: 'front', flashlight: { x: lx, y: ly, ang: -0.95 + jit + 0.04 * Math.sin(t * 3), on: 0.45, len: E.H * 0.9, spread: 0.2 } });
  finish(g, t, { cold: 0.38 });
} });

// ============================== s016 MISTAKE 2 ==============================
registerShot('s016', { draw(g, t, info) {
  mistakeTitle(g, t, 2, { dur: info.dur, thuds: [0.3, 0.8, 1.3, 1.8], crack: shotWord('two', info.shot.start ?? 29.22, 1.07) });
} });

// ============================== s017 YOU RUN TO THE BACK ==============================
function can(g, x, y, s, c, rot) { g.save(); g.translate(x, y); g.rotate(rot); rr(g, -14 * s, -36 * s, 28 * s, 36 * s, 4 * s); g.fillStyle = c; g.fill(); g.fillStyle = alpha('#fff', 0.25); g.fillRect(-14 * s, -26 * s, 28 * s, 10 * s); g.fillStyle = alpha('#000', 0.35); g.fillRect(4 * s, -36 * s, 10 * s, 36 * s); poly(g, [[-14 * s, -36 * s], [-4 * s, -30 * s], [-14 * s, -24 * s]], alpha('#000', 0.5)); g.restore(); }
registerShot('s017', { draw(g, t, info) {
  const hits = [0.15, 0.55, 0.9], hs = thudShake(t, hits, 4);
  const cam = camMove(t, info.dur, { z: [1.0, 1.04], y: [-40, -50], drift: 0.2 }); cam.x += noise(t * 14, 1) * 3; cam.y += noise(t * 14, 2) * 3;
  const S0 = store(g, t, cam, { view: 'aisle' }), GY = S0.GY, vp = S0.pos;
  layer(g, cam, 0.7, (g) => {                                                                      // the front glass at the end of the aisle: tiny, full of shapes
    const fw = 360, fh = 460, ex0 = vp.vpX - fw / 2, ey0 = vp.vpY - fh * 0.55;
    glassHorde(g, t + 3, { x: ex0 + 30, y: ey0 + 40, w: fw - 60, h: fh - 120, n: 22, press: 1, hits: hits.map(h => h + 3), hands: 6, moon: 1, seed: 9 });
    const R = rng(77); for (let i = 0; i < 7; i++) { const side = i % 2 ? 1 : -1, x = vp.vpX + side * (260 + R() * 160), y = GY - 520 - R() * 420, j = thudShake(t, hits, 2.5 + R() * 2); can(g, x + j[0], y + j[1], 1.0, ['#6a2a2a', '#2a4a6a', '#8a7a3a'][i % 3], (R() - 0.5) * 0.4 + j[0] * 0.02); }
  });
  const k = ease.in(clamp(t / info.dur)), s = lerp(2.2, 2.65, k), x = 560 + Math.sin(t * 3) * 18, y = lerp(GY + 40, GY + 230, k);
  const W = walkAlong(t * 820, s, { run: true }), pose = W.pose; pose.head = [pose.head[0] - 4, pose.head[1]];
  layer(g, cam, 1, (g) => actor(g, YOU, { x, y, s, facing: 1, pose, expr: 'scared', blink: false, look: lookToward(-1, 0.1), rim: S0.rim, t }));
  const [lx, ly] = toScreen(cam, 1, ...hand(pose, x, y, s, 1));
  const ang = -1.55 + 0.35 * Math.sin(t * Math.PI * 4);
  storeFg(g, t, cam, { view: 'aisle', flashlight: { x: lx, y: ly, ang, on: 1, len: E.H * 0.8, spread: 0.25 } });
  finish(g, t);
} });

// ============================== s018 INTO THE FREEZER ROOM, AND PULL THE DOOR ==============================
function swingDoors(g, t, sx, GY, o) {
  const sw = o.sw, head = o.head ?? 0;
  g.fillStyle = '#030406'; g.fillRect(sx - 195, GY - 760, 390, 760);                                   // the dark beyond
  for (const d of [-1, 1]) {
    const k = Math.abs(Math.cos(sw * (d < 0 ? 1 : 0.9))), hinge = sx + d * 195, w = 190 * Math.max(0.12, k), xx = d < 0 ? hinge : hinge - w;
    rr(g, xx, GY - 760, w, 760, 6); g.fillStyle = mix('#1a1d22', '#2a2e34', k); g.fill();
    const wx = d < 0 ? hinge + w / 2 + 5 * k : hinge - w / 2 - 5 * k;
    g.save(); g.translate(wx, GY - 520); g.scale(Math.max(0.12, k), 1); circle(g, 0, 0, 50, '#05060a');
    if (d < 0 && head > 0) { g.save(); g.beginPath(); g.arc(0, 0, 48, 0, 7); g.clip(); g.fillStyle = alpha('#3a4a3a', 0.25); g.fillRect(-50, -50, 100, 100); g.fillStyle = '#000'; g.beginPath(); g.ellipse(4, 70 - 64 * head, 30, 36, 0.35, 0, 7); g.fill(); seg(g, [[-20, 110], [0, 100 - 60 * head], [26, 110]], 22, '#000'); g.restore(); }
    ring(g, 0, 0, 50, 6, '#4a4e56'); g.restore();
  }
  rr(g, sx - 160, GY - 860, 320, 60, 6); g.fillStyle = '#5a1a1a'; g.fill();
}
function freezerGap(g, t, fx, fy, GY) {                                                              // the open freezer: cold blue light, strips, frost breathing out
  rr(g, fx - 200, fy, 400, GY - fy, 4); g.fillStyle = linGrad(g, 0, fy, 0, GY, ['#5a7890', '#3a5468', '#24343f']); g.fill();
  glow(g, fx - 60, fy + 120, 300, ICE, 0.35);
  for (let i = 0; i < 6; i++) { const x = fx - 190 + i * 64, sw = Math.sin(t * 2 + i) * 6; g.fillStyle = alpha('#e8f4ff', 0.18); g.beginPath(); g.moveTo(x, fy + 10); g.lineTo(x + 52, fy + 10); g.lineTo(x + 52 + sw, GY - 120); g.lineTo(x + sw, GY - 120); g.fill(); }
}
function freezerSlab(g, fx, fy, GY, open) {                                                           // the steel door swinging on its right hinge toward camera
  const hx = fx + 200, free = lerp(fx - 200, hx + 330, open), grow = 150 * open;
  g.fillStyle = linGrad(g, Math.min(free, hx), 0, Math.max(free, hx), 0, ['#58606a', '#3e464e']);
  g.beginPath(); g.moveTo(hx, fy); g.lineTo(free, fy - grow * 0.6); g.lineTo(free, GY + grow * 0.4); g.lineTo(hx, GY); g.closePath(); g.fill();
  g.strokeStyle = '#1a1c20'; g.lineWidth = 6; g.stroke();
  const hxp = lerp(hx, free, 0.85), hy = lerp(fy, fy - grow * 0.6, 0.85) + (GY - fy) * 0.5;
  if (Math.abs(free - hx) > 40) { rr(g, hxp - 16, hy - 70, 32, 140, 6); g.fillStyle = '#7a8088'; g.fill(); seg(g, [[hxp, hy - 50], [hxp, hy + 50]], 9, '#2a2e34'); }
  return [hxp, hy];
}
registerShot('s018', { draw(g, t, info) {
  const st = info.shot.start ?? 32.41, tf = shotWord('freezer', st, 0.65), tp = shotWord('pull', st, 1.57), td = shotWord('door', st, 2.07);
  const cam = camMove(t, info.dur, { z: [1.0, 1.06], x: [0, 60], y: [-40, -60], drift: 0.25 });
  const S0 = store(g, t, cam, { view: 'back' }), GY = S0.GY, P = S0.pos, fx = P.freezerX, fy = P.freezerY;
  const open = 1 - ease.inOut(prog(t, tp, info.dur + 0.02));
  layer(g, cam, 0.6, (g) => freezerGap(g, t, fx, fy, GY));
  const swU = Math.max(0, t - 0.1), sw = t < 0.1 ? 0 : 1.1 * Math.exp(-swU * 1.6) * Math.sin(swU * 7);
  layer(g, cam, 1, (g) => swingDoors(g, t, P.swingX, GY, { sw, head: ease.out(prog(t, 1.75, 2.3)) }));
  // HERO: runs across to the freezer (on 'freezer'), steps in, turns, grabs the outside handle on 'pull'
  let x, y, s, f = 1, pose, look = lookToward(1, 0);
  if (t < tf) { const k = clamp(t / tf); x = lerp(260, fx - 10, k); y = lerp(GY + 150, GY - 2, k); s = lerp(2.6, 2.3, k); pose = walkAlong(x * 1.4, s, { run: true }).pose; }
  else { const k = ease.out(prog(t, tf, tf + 0.45)); x = lerp(fx - 10, fx - 70, k); y = GY - 2 - 10 * k; s = lerp(2.3, 2.15, k);
    pose = t < tp - 0.25 ? blendPose(walkAlong((fx - 10) * 1.4, s, { run: true }).pose, 'shock', k) : blendPose('shock', { ...blendPose('reach', 'stand', 0), hF: [62, -150], eF: [34, -156] }, prog(t, tp - 0.25, tp));
    if (t > tp) { const pk = ease.out(prog(t, tp, tp + 0.3)); pose = { ...pose, head: [pose.head[0] - 8 * pk, pose.head[1]], hF: [lerp(62, 40, pk), -150] }; }
    look = t > tf + 0.3 ? lookToward(-0.6, 0) : look; }
  layer(g, cam, 1, (g) => actor(g, YOU, { x, y, s, facing: f, pose: idle(pose, t, 2), expr: t < tf ? 'scared' : exprAt(t, [[0, 'scared'], [tp, 'shocked']]), blink: blinkFlag(t, 3.2, 2), look, rim: S0.rim, t }));
  layer(g, cam, 0.6, (g) => { if (t > tf) freezerSlab(g, fx, fy, GY, open); });
  layer(g, cam, 0.6, (g) => motes(g, t, { x: fx - 260, y: fy + 200, w: 520, h: 600, count: open > 0.2 ? 30 : 10, color: '#eaf4ff' }));
  let L = null; if (t < tp) { const [lx, ly] = toScreen(cam, 1, ...hand(pose, x, y, s, f)); L = { x: lx, y: ly, ang: -0.15 + 0.12 * Math.sin(t * 13), on: 0.55 * (1 - prog(t, tp - 0.3, tp)), len: E.H * 0.7, spread: 0.24 }; }
  storeFg(g, t, cam, { view: 'back', flashlight: L });
  finish(g, t);
} });

// ============================== s019 THE SLAM ==============================
function oldScratches(g, x, y, s = 1, k = 1, a = 0.55) {                                              // four nail lines in the frost
  g.strokeStyle = alpha('#e8f2fa', a); g.lineWidth = 3 * s; g.lineCap = 'round';
  for (let i = 0; i < 4; i++) { const x0 = x + i * 16 * s, y0 = y + Math.abs(i - 1.5) * 8 * s; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 - 6 * s, y0 + 120 * s * k); g.stroke(); }
}
registerShot('s019', { draw(g, t, info) {
  const sh = thudShake(t, [0], 12), z0 = 1.55, z = z0 * (1 + 0.05 * Math.exp(-t * 14));
  const cam = { z, x: 175 + sh[0], y: 300 + sh[1], r: 0 };
  const strips = lerp(1, 0.3, ease.out(clamp(t / info.dur))) * (1 + 1.5 * Math.exp(-t * 6));
  const S0 = store(g, t, cam, { view: 'freezer', flicker: 1, frost: 1, strips }), P = S0.pos, GY = S0.GY;
  layer(g, cam, 1, (g) => oldScratches(g, P.doorX - 120, GY - 640, 1.1));
  const on = prog(t, 0.25, 0.3) * (t > 0.36 && t < 0.42 ? 0.3 : 1);
  idT(g); g.fillStyle = `rgba(0,0,0,${0.94 * (1 - on) + 0.15})`; g.fillRect(0, 0, E.W, E.H); g.restore();
  layer(g, cam, 1, (g) => { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = alpha(DOORLIGHT, 0.85); g.fillRect(P.doorX - P.doorW / 2 + 6, GY - 7, P.doorW - 12, 6); glow(g, P.doorX, GY, 260, DOORLIGHT, 0.12); g.restore(); });
  const burst = ease.out(clamp(t / 0.8)); layer(g, cam, 1, (g) => { const R = rng(19); for (let i = 0; i < 70; i++) { const a = R() * Math.PI * 2, d = 40 + R() * 420 * burst, px = P.doorX + (R() - 0.5) * P.doorW + Math.cos(a) * d * 0.6, py = P.doorTop + R() * (GY - P.doorTop) + Math.sin(a) * d * 0.3 + 60 * burst; circle(g, px, py, 1.5 + R() * 3, alpha('#eef6ff', (0.2 + R() * 0.5) * (1 - burst * 0.7))); } });
  storeFg(g, t, cam, { view: 'freezer' });
  finish(g, t, { cold: 0.42 });
} });

// ============================== s020 COLD. DARK. ==============================
function bulbEmber(g, cam, P, k) { layer(g, cam, 1, (g) => { circle(g, P.bulbX, P.bulbY, 30, mix('#1a1c22', '#6a4a30', k)); glow(g, P.bulbX, P.bulbY, 90, '#ff9a5a', 0.12 * k); }); }
function doorLine(g, cam, P, GY, a = 1) { layer(g, cam, 1, (g) => { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = alpha(DOORLIGHT, 0.8 * a); g.fillRect(P.doorX - P.doorW / 2 + 6, GY - 7, P.doorW - 12, 6); g.fillStyle = linGrad(g, 0, GY, 0, GY + 260, [alpha(DOORLIGHT, 0.16 * a), alpha(DOORLIGHT, 0)]); g.fillRect(P.doorX - P.doorW / 2 - 60, GY, P.doorW + 120, 260); g.restore(); }); }
registerShot('s020', { draw(g, t, info) {
  const st = info.shot.start ?? 35.72, tc = shotWord('cold', st, 0.15), tk = shotWord('dark', st, 1.58);
  const cam = camMove(t, info.dur, { z: [1.0, 1.05], y: [210, 200], drift: 0.2 });
  const S0 = store(g, t, cam, { view: 'freezer', frost: 1, flicker: 0.4, strips: 0.3 }), P = S0.pos, GY = S0.GY;
  const x = 400 + noise(t * 25, 4) * 1.2, y = GY + 110, s = 2.4, pose = idle(blendPose('crossArms', 'shock', 0.15), t, 3);
  pose.sh = [pose.sh[0] + noise(t * 30, 7) * 1, pose.sh[1]];
  layer(g, cam, 1, (g) => actor(g, YOU, { x, y, s, facing: 1, pose, expr: exprAt(t, [[0, 'scared'], [tk + 0.3, 'worried']]), blink: blinkFlag(t, 3.0, 1), look: lookToward(1, -0.1), rim: S0.rim, t }));
  const dk = t < tk ? 0 : ease.out(prog(t, tk, tk + 0.18)) * (t > tk + 0.06 && t < tk + 0.11 ? 0.4 : 1);
  if (dk > 0) { idT(g); g.fillStyle = `rgba(1,3,10,${0.72 * dk})`; g.fillRect(0, 0, E.W, E.H); g.restore(); bulbEmber(g, cam, P, dk); doorLine(g, cam, P, GY, dk); }
  const [mx, my] = toScreen(cam, 1, ...mouth(pose, x, y, s, 1));
  breathFog(g, t, mx, my, { rate: 1.2, s: 1.3, facing: 1 });
  if (t > tc) breathFog(g, (t - tc) % 9, mx, my, { rate: 0.12, s: 2.0, facing: 1 });                           // the big cloud on 'Cold'
  storeFg(g, t, cam, { view: 'freezer' });
  finish(g, t, { cold: 0.42 });
} });

// ============================== s021 SILENT. SAFE. ==============================
const FLOOR_SIT = { head: [6, -106], sh: [2, -74], hip: [0, -2], eF: [18, -40], hF: [34, -18], eB: [10, -40], hB: [28, -16], kF: [40, -40], fF: [74, 0], kB: [34, -36], fB: [66, 0] };
registerShot('s021', { draw(g, t, info) {
  const st = info.shot.start ?? 38.54, ts = shotWord('silent', st, 0.15), tf = shotWord('safe', st, 1.59);
  const cam = camMove(t, info.dur, { z: [1.12, 1.16], x: [-150, -160], y: [230, 220], drift: 0.15 });
  const strips = 0.3 * (1 - ease.out(prog(t, ts, ts + 0.4)));
  const S0 = store(g, t, cam, { view: 'freezer', frost: 1, flicker: 0.2, strips }), P = S0.pos, GY = S0.GY;
  layer(g, cam, 1, (g) => { const i = 5, x = P.doorX - P.doorW / 2 - 30 + i * (P.doorW + 60) / 8, sw = Math.sin(t * 1.3 + 2.1) * 10;   // the one strip that keeps swaying
    g.save(); g.globalAlpha *= 0.32; g.fillStyle = '#d8ecf8'; g.beginPath(); g.moveTo(x, P.doorTop - 60); g.lineTo(x + 52, P.doorTop - 60); g.lineTo(x + 52 + sw, GY - 140); g.lineTo(x + sw, GY - 140); g.closePath(); g.fill(); g.restore(); });
  const x = 470, y = GY + 40, s = 2.5, k = ease.inOut(prog(t, 0, 1.2)), back = ease.out(prog(t, tf, tf + 0.5));
  let pose = blendPose('stand', FLOOR_SIT, k); pose = idle(pose, t, 5); pose.head = [pose.head[0] - 7 * back, pose.head[1] - 3 * back];
  layer(g, cam, 1, (g) => actor(g, YOU, { x, y, s, facing: 1, pose, expr: exprAt(t, [[0, 'worried'], [tf, 'sleepy']]), blink: t > tf + 0.25 || blinkFlag(t, 3.2, 2), look: lookToward(0.3, -0.4), rim: S0.rim, t }));
  const [mx, my] = toScreen(cam, 1, ...mouth(pose, x, y, s, 1)), [lx, ly] = toScreen(cam, 1, ...hand(pose, x, y, s, 1));
  g.save(); g.globalAlpha *= 1 - prog(t, tf - 0.3, tf); breathFog(g, t, mx, my, { rate: 1.0, s: 1.2, facing: 1 }); g.restore();
  if (t > tf) breathFog(g, (t - tf) * 0.8, mx, my - 6, { rate: 0.3, s: 1.8, facing: 1 });
  storeFg(g, t, cam, { view: 'freezer', flashlight: { x: lx, y: ly, ang: 0.35, on: 0.45, len: 520, spread: 0.45 } });
  finish(g, t, { cold: 0.42 });
} });

// ============================== s022 MISTAKE 3 ==============================
registerShot('s022', { draw(g, t, info) {
  mistakeTitle(g, t, 3, { dur: info.dur, still: shotWord('three', info.shot.start ?? 41.34, 1.0) });
} });

// ============================== s023 THE DOOR ONLY OPENS FROM THE OUTSIDE ==============================
function youHand(g, x, y, ang, s, o = {}) {                                                            // HERO's bare hand (ink) in a mustard cuff, fingers up
  const ink = S().ink, sp = o.spread ?? 0.5, flat = o.flat ?? 0, curl = o.curl ?? 0;
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s);
  rr(g, -46, 60, 92, 900, 30); g.fillStyle = shade(HERO.color, -0.25); g.fill();                                     // sleeve
  rr(g, -50, 50, 100, 70, 22); g.fillStyle = HERO.color; g.fill();                                                    // cuff
  g.fillStyle = ink; g.beginPath(); g.ellipse(0, 10, 42, 54, 0, 0, 7); g.fill();
  const F = [[-30, -30, 70, -0.28], [-10, -40, 82, -0.09], [10, -40, 84, 0.06], [28, -32, 72, 0.22], [42, 20, 56, 1.0]];
  for (const [fx, fy, L, a] of F) { g.save(); g.translate(fx, fy); g.rotate(a * (0.6 + sp)); const LL = L * (1 - 0.35 * curl); rr(g, -9, -LL, 18, LL + 12, 9); g.fill(); g.fillStyle = alpha('#c8d4e0', 0.35 * flat); g.beginPath(); g.ellipse(0, -LL + 10, 6, 8, 0, 0, 7); g.fill(); g.fillStyle = ink; g.restore(); }
  g.restore();
}
registerShot('s023', { draw(g, t, info) {
  const st = info.shot.start ?? 43.43, to = shotWord('only', st, 0.65), tn = shotWord('opens', st, 0.92), tx = shotWord('outside', st, 1.74), tsc = tx + 0.2;
  const z = lerp(1.0, 1.08, ease.inOut(clamp(t / info.dur)));
  const cam = { z, x: lerp(40, 90, ease.inOut(clamp(t / info.dur))) + Math.sin(t * 0.6) * 4, y: 210 + Math.cos(t * 0.5) * 3, r: 0 };
  const S0 = store(g, t, cam, { view: 'door', shadow: 0, frost: 1 }), P = S0.pos;
  const sy = P.plateY + 40;                                                                              // hand height
  layer(g, cam, 1, (g) => {
    oldScratches(g, P.plateX - 190, sy - 40, 1.2, 1, 0.6);
    const nk = ease.inOut(prog(t, tsc, tsc + 0.35)); if (nk > 0) oldScratches(g, P.plateX - 120, sy - 30, 1.2, nk, 0.9);   // four NEW lines next to the old ones
    // the hand: enters from lower left, slides over the steel, finds the screw holes, presses flat, scrapes
    const k1 = ease.out(prog(t, 0, to)), k2 = ease.inOut(prog(t, to, tn)), k3 = ease.inOut(prog(t, tn, tx)), k4 = ease.inOut(prog(t, tsc, tsc + 0.35));
    let hx = lerp(80, P.plateX - 220, k1), hy = lerp(1500, sy + 40, k1);
    hx = lerp(hx, P.plateX - 30 + Math.sin(t * 9) * 10 * (1 - k3), k2); hy = lerp(hy, P.plateY - 20, k2);
    hx = lerp(hx, P.plateX - 70, k3); hy = lerp(hy, sy + 10, k3) + 120 * k4;
    youHand(g, hx, hy, lerp(-0.5, -0.12, k1) + 0.08 * k3, 1.05, { spread: lerp(0.5, 0.9, k3), flat: k3, curl: t > tsc ? 0.4 * k4 : 0.25 * k2 * (1 - k3) });
  });
  storeFg(g, t, cam, { view: 'door', flashlight: { x: -40, y: 1620, ang: Math.atan2(P.plateY - 1700, P.plateX - 40 + 80), on: 1, len: E.H * 0.95, spread: 0.22 } });
  finish(g, t, { cold: 0.36 });
} });

// ============================== s024 THE REALISATION ==============================
registerShot('s024', { draw(g, t, info) {
  const z = lerp(1.0, 1.06, ease.inOut(clamp(t / info.dur))), cx = 470, cy = 720, r = 330;
  idT(g); g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#1a2634', '#0c121a', '#06090e']); g.fillRect(0, 0, E.W, E.H); g.restore();
  zoomAt(g, cx, cy, z, () => {
    for (let x = -200; x < E.W + 200; x += 150) seg(g, [[x, -100], [x, E.H + 100]], 4, alpha('#000', 0.25));
    const R = rng(7); for (let i = 0; i < 160; i++) circle(g, R() * E.W, R() * E.H, 1 + R() * 3, alpha('#e8f4ff', 0.06 + R() * 0.12));
    glow(g, 140, -80, 900, '#d8ecff', 0.22);
    const f = faceAt(t, [[0, 'worried'], [0.35, 'shocked']]), lk = ease.inOut(prog(t, 0.35, 1.1));
    g.fillStyle = linGrad(g, 0, cy + r * 2.12, 0, E.H, [HERO.color, shade(HERO.color, -0.4)]); g.fillRect(-100, cy + r * 2.12, E.W + 200, E.H);   // the hoodie continues below frame
    giantFace(g, cx, cy, r, { who: 'HERO', f: { ...f, look: [lerp(0.8, 0, lk), lerp(0.1, 0, lk)] }, rimSide: -1, rimColor: '#a8c8ff', blink: 0, breath: Math.sin(t * 9) });
    const R2 = rng(41); for (let i = 0; i < 46; i++) { const a = Math.PI * (1.05 + R2() * 0.95), rr2 = r * (1.18 + R2() * 0.1); circle(g, cx + Math.cos(a) * rr2, cy + Math.sin(a) * rr2, 1.5 + R2() * 3.5, alpha('#eef6ff', 0.35 + R2() * 0.4)); }   // frost on the hood edge
    const tb = t < 0.9 ? t : t < 1.06 ? 0.9 : t - 0.16;                                               // the breath hangs a frame too long
    breathFog(g, tb, cx + 40, cy + r * 0.62, { rate: 1.6, s: 1.6, facing: 1 });
  });
  finish(g, t, { cold: 0.4, vig: 0.75 });
} });
