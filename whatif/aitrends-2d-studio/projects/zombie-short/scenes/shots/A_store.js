// A_store.js — What If SHORT "Zombie Apocalypse With Zero Experience" (horror look), batch A (s001-s012, 0-23.22 s), vertical 9:16.
// Word beats = the times in the shot texts (seconds from shot start). Captions at y 1330: faces/hands/eyes/key action above y 1270,
// nothing important below y 1440 or right of x 900. Zombies are silhouettes only; no gore, no weapons. Flashlight off until s011.
//   s001 insert: frame 1 a palm SLAMS the glass, 'DAY ONE' scratches on in condensation, a second hand on 'apocalypse'; the fog halo breathes
//   s002 insert: "No weapons." his empty hands, palms out; two shadows behind them, one from a light that isn't there
//   s003 med:    "No plan." lost in the dead street, looks left then right; far away a silhouette stands dead still in the road
//   s004 face:   "No experience." a hard swallow, eyes dart right, hold; a tiny shape crosses the glint in his eyes
//   s005 wide:   the power dies house by house; one high window stays lit a beat longer and a silhouette steps away from it
//   s006 wide:   the whole city dark from high up, tiny drag-walkers below; the moon goes behind cloud on 'dark'; one looks UP
//   s007 med:    he slips in through the sliding doors and drops behind the counter on 'supermarket'; a car's dome light, someone in the seat
//   s008 wide:   AISLE 7, the EXIT sign stutters and dies on 'off'; a can rolls out by itself at the far end
//   s009 insert: his hand locks the doors on 'locked'; an old palm smear on the OUTSIDE of the glass
//   s010 title:  MISTAKE 1, ink on torn paper, the static tears it in (local copy of horror.js ruleTitle)
//   s011 med:    the flashlight CLICKS on on 'flashlight' and hits the glass; the bloom shows how fogged the glass is, from outside
//   s012 insert: reverse along the beam: pair after pair of eyes light up in the lot; on 'Something' every pair turns; the nearest is right at the glass, low
import { E, S, V, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, rng, noise, rr, seg, circle, ring, poly, glow, alpha, shade, mix, text, FONTS, linGrad, radGrad } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { giantFace, faceAt } from '../sets/faces.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, lookToward, walkAlong, camMove } from '../sets/acting.js';
import { street } from '../sets/street.js';
import { store, storeFg } from '../sets/store.js';
import { zombieSil, handsOnGlass, thudShake } from '../sets/zombies.js';
import { scrawl, grain, vignette, coldGrade, breathe, flicker, interference } from '../sets/horror.js';

const look = (g, t) => { coldGrade(g, 0.45); vignette(g, 0.82); breathe(g, t, 0.3); grain(g, t, 0.09); };
const blinkH = (t) => blinkFlag(t, 3.2, 2), MOON = '#9fb4e0', HOOD = { color: '#E1AD01' };

registerShot('s001', { draw(g, t, info) {
  const tDay = 0.49, tOne = 0.72, tApo = 1.74, [sx, sy] = thudShake(t, [0], 14);
  const z = lerp(1.06, 1.0, ease.inOut(t / info.dur)) + 0.03 * Math.exp(-t * 12);
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#0a0e18', '#05070c']); g.fillRect(0, 0, E.W, E.H);
  g.save(); g.translate(E.W / 2 + sx, E.H * 0.45 + sy); g.scale(z, z); g.translate(-E.W / 2, -E.H * 0.45);
  // outside, behind the glass: moonlit lot and the soft silhouette blocking the moon
  glow(g, 520, 520, 700, MOON, 0.35); circle(g, 520, 520, 60, alpha('#e8eeff', 0.7));
  blurLayer(g, 10, (g) => zombieSil(g, 540, 1180, 3.2, { t, arms: 'reach', rim: 0.6, eyes: 0, tilt: 0.5, seed: 4 }), null, 1);
  // DAY ONE scratched into the condensation, top of the glass
  const k = ease.out(prog(t, tDay, tOne + 0.2)); scrawl(g, 'DAY ONE', E.W / 2 - 40, 300, { size: 130, color: alpha('#e8e4d8', 0.75), k, seed: 5, wobble: 2.2, align: 'center' });
  // the palm, flat on frame 1, sliding down; its fog halo breathes in slow pulses
  const fog = lerp(0.3, 1, prog(t, 0, 1.2)) * (0.75 + 0.25 * Math.sin(t * 2.4));
  handsOnGlass(g, t, 560, 640, 2.0, { press: 1, slide: lerp(0, 0.5, prog(t, 0.6, 2.9)), fog, seed: 1 });
  if (t > tApo) handsOnGlass(g, t, 780, 420, 1.5, { press: ease.out(prog(t, tApo, tApo + 0.15)), seed: 2, fog: 0.6 });
  // glass mullion + streaks
  seg(g, [[900, -100], [900, E.H + 100]], 26, '#0a0c12'); g.strokeStyle = alpha('#c8d4e8', 0.06); g.lineWidth = 3; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(120 + i * 140, 0); g.lineTo(60 + i * 140, E.H); g.stroke(); }
  g.restore();
  if (t < 0.09) { g.fillStyle = alpha('#ffffff', 0.5 * (1 - t / 0.09)); g.fillRect(0, 0, E.W, E.H); }
  look(g, t);
} });

registerShot('s002', { draw(g, t, info) {
  const tW = 0.42, cam = camMove(t, info.dur, { z: [1.1, 1.15], y: [-120, -130], drift: 0.25 });
  blurLayer(g, 8, (g) => street(g, t, cam, { power: 0, mood: 'night' }), null, 1); veil(g, '#03040a', 0.35);
  const z = lerp(1.0, 1.05, ease.inOut(t / info.dur)), spread = t > tW ? ease.out(prog(t, tW, tW + 0.3)) : 0, tr = t > tW ? Math.sin(t * 40) * 2 : 0;
  g.save(); g.translate(E.W / 2, 800); g.scale(z, z); g.translate(-E.W / 2, -800);
  // the two shadows of the hands on the wall behind: one from the moon (left), one from a light that isn't there (right)
  for (const [dx, a] of [[-170, 0.35], [190, 0.22]]) for (const sd of [-1, 1]) { g.save(); g.translate(E.W / 2 + sd * 180 + dx, 640); g.globalAlpha = a; g.fillStyle = '#000'; g.beginPath(); g.ellipse(0, 0, 70, 90, 0, 0, 7); g.fill(); for (let i = 0; i < 5; i++) { g.beginPath(); g.ellipse((i - 2) * 30 * (1 + spread * 0.3), -100 - (i === 2 ? 20 : 0), 13, 46, (i - 2) * 0.15 * (1 + spread), 0, 7); g.fill(); } g.restore(); }
  // the empty hands, palms out, mustard cuffs, body soft behind
  blurLayer(g, 6, (g) => { g.fillStyle = shade(HOOD.color, -0.35); g.beginPath(); g.ellipse(E.W / 2, 1250, 340, 300, 0, Math.PI, 0); g.fill(); }, null, 1);
  for (const sd of [-1, 1]) { const hx = E.W / 2 + sd * 190 + tr, hy = 800;
    rr(g, hx - 70, hy + 90, 140, 260, 40); g.fillStyle = HOOD.color; g.fill(); rr(g, hx - 74, hy + 90, 148, 40, 18); g.fillStyle = shade(HOOD.color, -0.25); g.fill();
    g.fillStyle = '#2a1e18'; g.beginPath(); g.ellipse(hx, hy, 72, 92, 0, 0, 7); g.fill();
    for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(hx + (i - 1.5) * 30 * (1 + spread * 0.35), hy - 108 - (i === 1 || i === 2 ? 14 : 0), 14, 46, (i - 1.5) * 0.12 * (1 + spread), 0, 7); g.fill(); }
    g.beginPath(); g.ellipse(hx - sd * 82, hy + 10, 16, 42, sd * 0.8, 0, 7); g.fill();
    g.strokeStyle = alpha(MOON, 0.7); g.lineWidth = 4; g.beginPath(); g.ellipse(hx, hy, 74, 94, 0, Math.PI * 1.1, Math.PI * 1.6); g.stroke(); }
  g.restore();
  look(g, t);
} });

registerShot('s003', { draw(g, t, info) {
  const tPlan = 0.42, cam = camMove(t, info.dur, { z: [1.15, 1.2], x: [-20, 0], y: [-40, -50], drift: 0.25 });
  const St = street(g, t, cam, { power: 0, mood: 'night' });
  layer(g, cam, 0.5, (g) => zombieSil(g, St.CX + 60, St.GY - 120, 0.5, { t, sway: 0.1, rim: 0.3, seed: 3 }));
  layer(g, cam, 1, (g) => {
    // a car with its door left open (local), in the road
    const cx = St.CX + 420, cy = St.roadY + 140; rr(g, cx - 200, cy - 80, 400, 90, 30); g.fillStyle = '#101218'; g.fill(); rr(g, cx - 110, cy - 140, 220, 70, 24); g.fill(); poly(g, [[cx - 100, cy - 70], [cx - 210, cy - 140], [cx - 220, cy - 20], [cx - 110, cy - 10]], '#161a22');
    actor(g, 'HERO', { x: St.CX - 60, y: St.GY + 120, s: 2.4, facing: 1, pose: idle(poseAt(t, [[0, 'stand'], [tPlan, 'shrug']], 0.3), t, 2), expr: exprAt(t, [[0, 'worried'], [tPlan, 'scared']]), blink: blinkH(t), look: t < 0.7 ? lookToward(-1, 0) : lookToward(1, 0), rim: St.rim, t });
  });
  look(g, t);
} });

registerShot('s004', { draw(g, t, info) {
  const tExp = 0.41, cam = camMove(t, info.dur, { z: [1.2, 1.24], y: [-120, -120] });
  blurLayer(g, 10, (g) => street(g, t, cam, { power: 0, mood: 'night' }), null, 1); veil(g, '#02030a', 0.45);
  const z = lerp(1.0, 1.06, ease.inOut(t / info.dur)), cx = 470, cy = 720, swallow = t > tExp && t < tExp + 0.35 ? Math.sin((t - tExp) / 0.35 * Math.PI) * 6 : 0;
  const f = faceAt(t, [[0, 'worried'], [0.15, 'shocked'], [tExp + 0.6, 'worried']]), dart = t > tExp + 0.8;
  g.save(); g.translate(cx, cy); g.scale(z, z); g.translate(-cx, -cy);
  giantFace(g, cx, cy + swallow, 330, { who: 'HERO', f: { ...f, look: dart ? [0.8, 0] : [0.1, 0], glint: 0.6 }, rimSide: -1, rimColor: MOON, blink: dart ? 0 : blinkAmt(t, 3.2, 2), breath: dart ? 0 : Math.sin(t * 2), tilt: 0 });
  // a tiny shape crossing the glint in his eyes, left to right
  const u = prog(t, 1.2, 2.4); if (u > 0 && u < 1) for (const ex of [-1, 1]) { const px = cx + ex * 330 * 0.34 + 0.8 * 330 * 0.145 * 0.55 - 14 + u * 28, py = cy - 330 * 0.04 - 4; seg(g, [[px, py - 6], [px, py + 6]], 3, alpha('#05060a', 0.9)); }
  g.restore();
  look(g, t);
} });

registerShot('s005', { draw(g, t, info) {
  const tOut = 0.75, cam = camMove(t, info.dur, { z: [1.0, 1.04], y: [-180, -200], drift: 0.25 });
  const power = key(t, [[0.15, 1], [tOut, 0]]);
  const St = street(g, t, cam, { power, mood: 'night' });
  // one high window stays lit a beat longer; a silhouette steps away from it just before it dies
  layer(g, cam, 0.6, (g) => { const wx = St.CX + 120, wy = St.GY - 620, on = t < tOut + 0.4; if (on) { g.fillStyle = '#ffcf8a'; g.fillRect(wx, wy, 70, 66); glow(g, wx + 35, wy + 33, 120, '#ffcf8a', 0.4); const step = ease.inOut(prog(t, tOut, tOut + 0.35)); circle(g, wx + 30 + step * 50, wy + 36, 11, '#0a0910'); g.fillStyle = '#0a0910'; g.beginPath(); g.ellipse(wx + 30 + step * 50, wy + 66, 18, 24, 0, Math.PI, 0); g.fill(); } });
  look(g, t);
} });

registerShot('s006', { draw(g, t, info) {
  const tDark = 1.01, cam = camMove(t, info.dur, { z: [0.92, 0.95], y: [-520, -540], drift: 0.2 });
  const St = street(g, t, cam, { power: 0, mood: 'night' });
  layer(g, cam, 1, (g) => { [[St.CX - 600, 5, 0], [St.CX - 100, 6, 0], [St.CX + 380, 7, 1]].forEach(([x0, seed, up], i) => { const x = x0 + (up ? 0 : t * 30);
    const Z = zombieSil(g, x, St.roadY + 200 + i * 40, 0.35, { t, step: up ? null : x, sway: 0.4, seed, rim: 0.3, tilt: up ? -0.6 : 0.3 }); }); });
  const cloud = ease.inOut(prog(t, tDark, tDark + 0.6)); if (cloud > 0) veil(g, '#000', 0.2 * cloud);
  look(g, t);
} });

registerShot('s007', { draw(g, t, info) {
  const tSup = 0.99, cam = camMove(t, info.dur, { z: [1.0, 1.05], y: [-100, -120], drift: 0.25 });
  const Sv = store(g, t, cam, { view: 'front', moon: 1 }), P = Sv.pos, GY = Sv.GY, s = 2.4;
  // a car across the lot with its dome light on, someone sitting very still in the driver's seat (outside, depth 0.35)
  layer(g, cam, 0.35, (g) => { const cx = P.glassX + 260, cy = GY - 300; rr(g, cx - 130, cy - 40, 260, 60, 20); g.fillStyle = '#0a0c12'; g.fill(); rr(g, cx - 70, cy - 80, 140, 50, 16); g.fillStyle = '#e8d8a8'; g.fill(); glow(g, cx, cy - 55, 110, '#ffe0a0', 0.35); circle(g, cx - 20, cy - 62, 12, '#14100c'); g.fillStyle = '#14100c'; g.fillRect(cx - 32, cy - 50, 24, 20); });
  const k = ease.inOut(prog(t, 0.2, 1.6)), hx = lerp(P.doorX, Sv.CX - 200, k);
  layer(g, cam, 1, (g) => actor(g, 'HERO', { x: hx, y: GY - 20, s, facing: -1, pose: t < tSup ? walkAlong(hx, s, { facing: -1 }).pose : idle(POSES.crouch, t, 2), expr: exprAt(t, [[0, 'worried'], [tSup, 'scared']]), blink: blinkH(t), look: lookToward(-1, 0.1), rim: Sv.rim, t }));
  storeFg(g, t, cam, { view: 'front' }); look(g, t);
} });

registerShot('s008', { draw(g, t, info) {
  const tOff = 0.59, cam = camMove(t, info.dur, { z: [1.0, 1.07], y: [-40, -60], drift: 0.2 });
  const Sv = store(g, t, cam, { view: 'aisle', flicker: t > tOff - 0.1 && t < tOff + 0.15 ? 1 : 0 }), P = Sv.pos;
  layer(g, cam, 0.7, (g) => {
    // the red EXIT glow: on, stutters on 'off', dies
    const on = t < tOff ? 1 : t < tOff + 0.12 ? (Math.floor(t * 40) % 2) : 0; if (on) { rr(g, P.exitX - 60, P.exitY - 22, 120, 44, 6); g.fillStyle = '#3a0a0a'; g.fill(); text(g, 'EXIT', P.exitX, P.exitY, { size: 30, color: '#ff4a3a', font: FONTS.ui, weight: 900 }); glow(g, P.exitX, P.exitY, 160, '#ff3a2a', 0.45); }
    // a can rolls out from the bottom shelf at the far end, by itself, and stops
    const u = ease.out(prog(t, 0.9, info.dur)); g.save(); g.translate(P.vpX - 120 + u * 90, P.vpY + 200); g.rotate(u * 5); rr(g, -14, -18, 28, 36, 4); g.fillStyle = '#5a5a66'; g.fill(); g.fillStyle = '#8a3a2a'; g.fillRect(-14, -8, 28, 14); g.restore();
  });
  storeFg(g, t, cam, { view: 'aisle' }); look(g, t);
} });

registerShot('s009', { draw(g, t, info) {
  const tLock = 0.52, cam = camMove(t, info.dur, { z: [1.6, 1.68], x: [240, 240], y: [-280, -300], drift: 0.15 }), jolt = t > tLock && t < tLock + 0.15 ? Math.sin((t - tLock) * 60) * 2 : 0; cam.x += jolt;
  const Sv = store(g, t, cam, { view: 'front', moon: 1 }), P = Sv.pos, GY = Sv.GY;
  layer(g, cam, 1, (g) => {
    const sx = P.doorX, sy = GY - 700;
    // an old palm smear on the OUTSIDE of the glass, at head height
    handsOnGlass(g, t, sx + 90, sy - 120, 0.9, { press: 0.6, slide: 0.6, seed: 7, fog: 0.2 });
    // the seam + a thumb-turn lock; his hand (mustard cuff) twists it home on 'locked'
    seg(g, [[sx, sy - 400], [sx, sy + 500]], 10, '#1a1c22'); rr(g, sx - 30, sy - 40, 60, 90, 8); g.fillStyle = '#3a3c44'; g.fill();
    const turn = ease.out(prog(t, tLock - 0.25, tLock)); g.save(); g.translate(sx, sy + 5); g.rotate(turn * Math.PI / 2); rr(g, -8, -26, 16, 52, 6); g.fillStyle = '#9a9ca4'; g.fill(); g.restore();
    g.save(); g.translate(sx - 60, sy + 40); g.rotate(-0.3 + turn * 0.6); rr(g, -150, 30, 140, 90, 30); g.fillStyle = HOOD.color; g.fill(); g.fillStyle = '#2a1e18'; g.beginPath(); g.ellipse(0, 0, 60, 46, 0.2, 0, 7); g.fill(); g.beginPath(); g.ellipse(40, -30, 16, 30, 0.6, 0, 7); g.fill(); g.restore();
  });
  storeFg(g, t, cam, { view: 'front' }); look(g, t);
} });

// MISTAKE n: local copy of horror.js ruleTitle (ink on a torn paper strip) that scratches 'MISTAKE n' and no subtitle
function mistakeTitle(g, t, n, o = {}) {
  const cx = E.W / 2, cy = o.y ?? 700, r = rng(n * 7 + 1), shud = noise(t * 18, n) * 2 + (t < 0.15 ? (1 - t / 0.15) * 14 : 0);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.scale(E.PX, E.PX); g.fillStyle = '#05060a'; g.fillRect(0, 0, E.W, E.H); g.restore();
  g.save(); g.translate(cx + shud, cy); g.rotate(-0.02 + 0.006 * Math.sin(t * 0.8)); const sc = 1 + 0.02 * t; g.scale(sc, sc);
  const W = 900, H = 640; g.fillStyle = '#d8d0bc'; g.beginPath(); g.moveTo(-W / 2, -H / 2);
  for (let i = 0; i <= 20; i++) g.lineTo(-W / 2 + i * W / 20, -H / 2 + (r() - 0.5) * 22); for (let i = 0; i <= 14; i++) g.lineTo(W / 2 + (r() - 0.5) * 18, -H / 2 + i * H / 14);
  for (let i = 20; i >= 0; i--) g.lineTo(-W / 2 + i * W / 20, H / 2 + (r() - 0.5) * 22); g.closePath(); g.fill();
  g.fillStyle = radGrad(g, 0, 0, 100, W * 0.7, ['rgba(0,0,0,0)', 'rgba(40,20,10,.35)']); g.fillRect(-W / 2, -H / 2, W, H);
  const k1 = ease.out(prog(t, 0.05, 0.6));
  for (const [dx, dy, a] of [[3, 2, 0.25], [-2, 1, 0.2], [0, 0, 1]]) scrawl(g, `MISTAKE ${n}`, dx, dy, { size: 120, color: alpha('#140a0c', a), k: k1, seed: n * 3, wobble: 1.8, align: 'center' });
  for (let i = 0; i < 9; i++) { const sx = (r() - 0.5) * W * 0.9, sy = (r() - 0.5) * H * 0.9, a = clamp((t - 0.1 - i * 0.04) * 6); circle(g, sx, sy, (2 + r() * 9) * a, alpha('#140a0c', 0.75)); }
  if (o.bleed != null && t > o.bleed) { const u = ease.out(prog(t, o.bleed, o.bleed + 0.5)); g.fillStyle = alpha('#140a0c', 0.18 * u); g.beginPath(); g.ellipse(0, 10, 360 * u, 60 * u, 0, 0, 7); g.fill(); circle(g, 260, -150, 22 * ease.outBack(prog(t, o.bleed, o.bleed + 0.2)), alpha('#140a0c', 0.85)); }
  g.restore();
  vignette(g, 0.85, { r0: 0.15, r1: 0.6 }); grain(g, t, 0.1);
}
registerShot('s010', { draw(g, t, info) { mistakeTitle(g, t, 1, { y: 700, bleed: 1.0 }); interference(g, t, clamp(1 - t / 0.25)); } });

registerShot('s011', { draw(g, t, info) {
  const tFl = 0.89, cam = camMove(t, info.dur, { z: [1.0, 1.05], y: [-80, -100], drift: 0.25 });
  const Sv = store(g, t, cam, { view: 'front', moon: 0.8 }), P = Sv.pos, GY = Sv.GY, s = 2.4, hx = Sv.CX - 280, hy = GY - 20;
  const on = t < tFl ? 0 : clamp((t - tFl) / (2 / 24));
  const pose = idle({ ...POSES.crouch, eF: [30, -110], hF: [54, -124] }, t, 2);
  layer(g, cam, 1, (g) => {
    actor(g, 'HERO', { x: hx, y: hy, s, facing: 1, pose, expr: exprAt(t, [[0, 'worried'], [tFl, 'neutral']]), blink: blinkH(t), look: lookToward(1, -0.3), rim: Sv.rim, t });
    // the beam's bloom on the glass shows the fog on the OUTSIDE of the pane
    if (on > 0) { glow(g, 760, GY - 860, 320, '#fff6e0', 0.45 * on); const r = rng(5); for (let i = 0; i < 40; i++) circle(g, 640 + r() * 240, GY - 860 + r() * 280, 3 + r() * 5, alpha('#e8eef8', 0.25 * on)); }
  });
  const fx = (hx + 54 * s - E.W / 2 - cam.x) * cam.z + E.W / 2, fy = (hy - 124 * s - E.H / 2 - cam.y) * cam.z + E.H / 2;
  storeFg(g, t, cam, { view: 'front', flashlight: { x: fx, y: fy, ang: Math.atan2(560 - fy, 760 - fx), on, len: E.H * 0.9, spread: 0.3 } });
  look(g, t);
} });

registerShot('s012', { draw(g, t, info) {
  const tSome = 0.64, tr = Math.sin(t * 37) * 1;
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#03040a', '#06080e', '#020306']); g.fillRect(0, 0, E.W, E.H);
  g.save(); g.translate(tr, 0);
  // the dark lot; pair after pair of eyes catch the beam (near to far), all turn to the glass on 'Something'
  const Z = [[300, 1180, 1.1, 11], [760, 1000, 0.8, 12], [480, 880, 0.65, 13], [180, 820, 0.55, 14], [640, 760, 0.5, 15], [860, 840, 0.6, 16], [400, 1340, 1.2, 17]];
  Z.forEach(([x, y, s, seed], i) => { const ek = clamp((t - 0.05 - i * 0.08) / 0.12), turn = t > tSome ? 0.4 : 0;
    zombieSil(g, x, y + (i === 6 ? 0 : 0), s, { t, eyes: ek, sway: 0.2, rim: 0.12, seed, tilt: turn ? 0 : 0.4, facing: x > 540 ? -1 : 1 }); });
  // the flashlight bloom on the glass in the foreground (soft)
  blurLayer(g, 18, (g) => { glow(g, 560, 700, 520, '#fff2d8', 0.35); g.fillStyle = alpha('#e8eef8', 0.06); g.fillRect(0, 0, E.W, E.H); }, null, 1);
  g.restore();
  look(g, t);
} });
