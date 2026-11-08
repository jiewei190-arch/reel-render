// thumbs_hoodie.js — Test & Compare thumbnails for the two HOODIE-hero videos (mustard hoodie, cast.js):
//   moon_v1..v3  "What If the Moon Disappeared Tomorrow?"   bh_v1..v3  "What If You Fell Into a Black Hole?"
// Formula (IAWAKEN_PLAYBOOK.md): one giant hero face with strong emotion + eyes catching light, one big bright topic object,
// 2-3 huge outlined words. Static stills: everything is drawn at a fixed t.
import { E, registerShot, rng, lerp, circle, ring, seg, alpha, shade, mix, glow, linGrad, radGrad, FONTS } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { giantFace, FACE } from '../sets/faces.js';
import { spaceBg, blackHole, infall, heroFloat } from '../sets/space.js';
import { POSES } from '/engine/rig2d.js';
import { bigText, burst, rimFrame, fullBg, eyeShine, YEL, WHT, RED, CYAN } from '../../thumbkit.js';

const T = 2.0;   // fixed animation clock for the sets
const SHOCK = { ...FACE.shocked, glint: 1, pupil: 0.85, open: 1.0, w: 0.7, smile: -0.35, sweat: 0.9 };
const TERROR = { ...FACE.shocked, eye: 1.3, pupil: 0.7, brow: 0.9, tilt: -0.75, open: 1.15, w: 0.72, smile: -0.5, sweat: 1, glint: 1 };
const AWE = { ...FACE.awe, glint: 1, open: 0.55, pupil: 1.2 };

// ------------------------------------------------------------------ night sky + ground (Moon)
function nightSky(g, o = {}) {
  fullBg(g, linGrad(g, 0, 0, 0, E.H, ['#060a1e', '#101a44', '#24306a', '#3a3a78']));
  FX.stars(g, T, { seed: o.seed ?? 4, count: 420, area: [0, 0, E.W, E.H * 0.85], color: '#ffffff' });
  const r = rng(91); for (let i = 0; i < 14; i++) FX.sparkle(g, r() * E.W, r() * E.H * 0.7, 10 + r() * 10, '#fff6e0', 0.7);
}
function ground(g, o = {}) {
  const gy = o.y ?? E.H * 0.86;
  g.fillStyle = '#05060f'; g.beginPath(); g.moveTo(-20, E.H + 20);
  for (let x = -20; x <= E.W + 40; x += 40) g.lineTo(x, gy + Math.sin(x * 0.004) * 30 + Math.sin(x * 0.011 + 1) * 14);
  g.lineTo(E.W + 40, E.H + 20); g.closePath(); g.fill();
  if (o.town) { const r = rng(5); for (let i = 0; i < 16; i++) { const x = 900 + i * 62 + r() * 20, h = 40 + r() * 70, y = gy + Math.sin(x * 0.004) * 30 - h + 20; g.fillStyle = '#080a18'; g.fillRect(x, y, 48, h + 30); for (let k = 0; k < 3; k++) if (r() > 0.4) { g.fillStyle = '#ffcf6a'; g.fillRect(x + 8 + (k % 2) * 20, y + 12 + Math.floor(k / 2) * 22, 10, 10); } } }
}
// the Moon: craters + terminator shading; o.crack 0..1 splits it into drifting fragments with fire-white light in the gaps
function moon(g, x, y, R, o = {}) {
  glow(g, x, y, R * 2.6, '#cfe0ff', 0.35); glow(g, x, y, R * 1.5, '#ffffff', 0.25);
  const crack = o.crack ?? 0;
  const body = (g) => {
    g.fillStyle = radGrad(g, x - R * 0.35, y - R * 0.35, R * 0.1, R * 1.1, ['#ffffff', '#e8e6de', '#b9b6ae']); g.beginPath(); g.arc(x, y, R, 0, 7); g.fill();
    const r = rng(17); for (let i = 0; i < 16; i++) { const a = r() * 6.28, d = Math.sqrt(r()) * R * 0.8, cr = R * (0.05 + r() * 0.13); circle(g, x + Math.cos(a) * d, y + Math.sin(a) * d, cr, alpha('#8f8b84', 0.5)); circle(g, x + Math.cos(a) * d - cr * 0.15, y + Math.sin(a) * d - cr * 0.15, cr * 0.8, alpha('#a9a59d', 0.6)); }
    g.fillStyle = alpha('#9a968e', 0.35); for (const [dx, dy, s] of [[-0.3, -0.1, 0.32], [0.2, 0.25, 0.26], [0.1, -0.35, 0.2]]) { g.beginPath(); g.ellipse(x + dx * R, y + dy * R, s * R, s * R * 0.75, 0.4, 0, 7); g.fill(); }
  };
  if (crack <= 0) { body(g); return; }
  // light pouring out of the cracks, behind the pieces
  glow(g, x, y, R * 1.2, '#ffd9a0', 0.9 * crack); glow(g, x, y, R * 0.7, '#ffffff', 0.9 * crack);
  const N = 6, r = rng(23), cuts = [...Array(N)].map((_, i) => (i / N) * Math.PI * 2 + (r() - 0.5) * 0.6);
  for (let i = 0; i < N; i++) {
    const a0 = cuts[i], a1 = cuts[(i + 1) % N] + (i === N - 1 ? Math.PI * 2 : 0), am = (a0 + a1) / 2, d = R * 0.22 * crack * (0.8 + r() * 0.5);
    g.save(); g.translate(Math.cos(am) * d, Math.sin(am) * d); g.rotate((r() - 0.5) * 0.08 * crack);
    g.beginPath(); g.moveTo(x, y);
    const jag = (a, k) => [x + Math.cos(a) * R * k + Math.sin(k * 23 + a * 7) * R * 0.04, y + Math.sin(a) * R * k + Math.cos(k * 19 + a * 5) * R * 0.04];
    for (let k = 0.15; k < 1; k += 0.17) g.lineTo(...jag(a0, k));
    g.arc(x, y, R, a0, a1);
    for (let k = 0.85; k > 0.1; k -= 0.17) g.lineTo(...jag(a1, k));
    g.closePath(); g.save(); g.clip(); body(g); g.restore();
    g.restore();
  }
  // a few chunks flying off
  for (let i = 0; i < 7; i++) { const a = r() * 6.28, d = R * (1.15 + r() * 0.5 * crack), s = R * (0.03 + r() * 0.06); circle(g, x + Math.cos(a) * d, y + Math.sin(a) * d, s, '#d8d4ca'); glow(g, x + Math.cos(a) * d, y + Math.sin(a) * d, s * 3, '#ffd9a0', 0.4); }
}
// ghost of a vanished Moon: dashed outline + faint afterglow
function ghostMoon(g, x, y, R) {
  glow(g, x, y, R * 1.8, '#9fb8ff', 0.18);
  g.save(); g.setLineDash([34, 26]); g.lineCap = 'round'; g.strokeStyle = alpha('#ffffff', 0.92); g.lineWidth = 14; g.beginPath(); g.arc(x, y, R, 0, 7); g.stroke(); g.restore();
  g.save(); g.setLineDash([34, 26]); g.strokeStyle = alpha('#000', 0.6); g.lineWidth = 4; g.beginPath(); g.arc(x, y, R + 10, 0, 7); g.stroke(); g.restore();
}
// Moon dissolving into a stream of dust (right side eaten away)
function dissolvingMoon(g, x, y, R) {
  glow(g, x, y, R * 2.4, '#cfe0ff', 0.3);
  const r = rng(3);
  g.save(); g.beginPath(); g.arc(x, y, R, 0, 7); g.clip();
  // keep only the left part, with a ragged right edge (the part that is crumbling away)
  g.beginPath(); g.moveTo(x - R * 1.2, y - R * 1.2); g.lineTo(x + R * 0.25, y - R * 1.2);
  for (let yy = -1.1; yy <= 1.1; yy += 0.07) g.lineTo(x + R * (0.18 + Math.abs(yy) * 0.06 + r() * 0.14), y + R * yy);
  g.lineTo(x + R * 0.25, y + R * 1.2); g.lineTo(x - R * 1.2, y + R * 1.2); g.closePath(); g.clip();
  g.fillStyle = radGrad(g, x - R * 0.35, y - R * 0.35, R * 0.1, R * 1.1, ['#ffffff', '#e8e6de', '#b9b6ae']); g.fillRect(x - R, y - R, R * 2, R * 2);
  const r0 = rng(17); for (let i = 0; i < 14; i++) { const a = r0() * 6.28, d = Math.sqrt(r0()) * R * 0.8, cr = R * (0.05 + r0() * 0.13); circle(g, x + Math.cos(a) * d, y + Math.sin(a) * d, cr, alpha('#8f8b84', 0.5)); }
  g.restore();
  // the dust stream blowing off to the right
  for (let i = 0; i < 320; i++) { const k = r(), yy = y + (r() - 0.5) * R * 1.9 * (1 - k * 0.4), xx = x + R * (0.25 + k * 2.4) + Math.sin(i) * 10, s = (1 - k) * 10 + 2; circle(g, xx, yy - k * R * 0.5, s, alpha(mix('#f2efe6', '#9fb8ff', k), 0.95 - k * 0.6)); }
}

// ------------------------------------------------------------------ MOON
registerShot('moon_v1', { draw(g) {          // cracked Moon + shocked face + "NO MOON?"
  nightSky(g); ground(g, { town: true });
  burst(g, 1380, 600, 900, '#ffe2b0', 0.07, 20);
  moon(g, 1390, 600, 270, { crack: 1 });
  giantFace(g, 470, 660, 350, { who: 'HERO', f: { ...SHOCK, look: [0.7, -0.3] }, rimColor: '#ffe2b0', rimSide: 1, glint: '#fff0c0', tilt: -0.06 });
  eyeShine(g, 470, 660, 350, '#fff0c0', 0.5);
  bigText(g, 'NO MOON?', 1330, 175, { size: 230, maxW: 1060, fill: YEL, fill2: '#ffae1a' });
  rimFrame(g, '#6f8cff', 0.12);
} });
registerShot('moon_v2', { draw(g) {          // the Moon is just GONE: empty dashed outline in the sky
  nightSky(g, { seed: 8 }); ground(g, { town: true });
  ghostMoon(g, 1400, 520, 250);
  bigText(g, '?', 1400, 530, { size: 300, fill: WHT, stroke: 50 });
  giantFace(g, 480, 660, 350, { who: 'HERO', f: { ...TERROR, look: [0.75, -0.45] }, rimColor: '#a9c4ff', rimSide: 1, glint: '#cfe0ff', tilt: -0.05 });
  eyeShine(g, 480, 660, 350, '#cfe0ff', 0.5);
  bigText(g, 'NO MOON?', 1330, 175, { size: 230, maxW: 1060, fill: YEL, fill2: '#ffae1a' });
  rimFrame(g, '#6f8cff', 0.12);
} });
registerShot('moon_v3', { draw(g) {          // face CENTRE, Moon crumbling behind the head, red text
  nightSky(g, { seed: 12 }); ground(g, { y: E.H * 0.9 });
  dissolvingMoon(g, 1250, 430, 300);
  giantFace(g, 640, 690, 350, { who: 'HERO', f: { ...SHOCK, look: [0.6, -0.4] }, rimColor: '#e8f0ff', rimSide: 1, glint: '#ffffff', tilt: -0.04 });
  eyeShine(g, 640, 690, 350, '#ffffff', 0.45);
  bigText(g, 'GONE', 1480, 790, { size: 290, maxW: 760, fill: WHT, fill2: '#cfe0ff' });
  bigText(g, 'TOMORROW?', 1480, 975, { size: 170, maxW: 760, fill: YEL, fill2: '#ffae1a' });
  rimFrame(g, '#6f8cff', 0.12);
} });

// ------------------------------------------------------------------ BLACK HOLE
function stretchedHero(g, x, y, s) {   // a tiny hero being spaghettified: long thin noodle figure aimed at the hole
  g.save(); g.translate(x, y); g.rotate(Math.PI / 2 - 0.12); g.scale(1.0, 1.7); glow(g, 0, -110 * s, 200 * s, '#ffd9a0', 0.6);
  heroFloat(g, { x: 0, y: 0, s, pose: POSES.fall || POSES.stand, expr: 'scared', t: T, rimColor: '#ffb45a', rimDir: [1, 0] });
  g.restore();
}
registerShot('bh_v1', { draw(g) {            // terrified face + black hole + noodle hero + "SPAGHETTI?"
  spaceBg(g, T, { x: 0, y: 0 }, { warm: 0.3 });
  blackHole(g, 1330, 560, 190, T, { tilt: 0.28, heat: 1.15, glowA: 0.4 });
  infall(g, T, 1330, 560, 190, { n: 50 });
  stretchedHero(g, 820, 600, 1.4);
  giantFace(g, 420, 680, 345, { who: 'HERO', f: { ...TERROR, look: [0.8, -0.1] }, rimColor: '#ffb45a', rimSide: 1, glint: '#ffcf7a', tilt: -0.05 });
  eyeShine(g, 420, 680, 345, '#ffcf7a', 0.55);
  bigText(g, 'SPAGHETTI?', 1300, 165, { size: 220, maxW: 1150, fill: YEL, fill2: '#ff9a1a' });
  rimFrame(g, '#ff9a50', 0.12);
} });
registerShot('bh_v2', { draw(g) {            // the event horizon as a line you cannot cross + "NO RETURN"
  spaceBg(g, T, { x: 0, y: 0 }, { warm: 0.15, seed: 33 });
  blackHole(g, 1350, 600, 230, T, { tilt: 0.22, heat: 1.1, glowA: 0.35 });
  g.save(); g.setLineDash([30, 22]); g.lineCap = 'round'; g.strokeStyle = alpha(RED, 0.95); g.lineWidth = 12; g.beginPath(); g.arc(1350, 600, 330, 0, 7); g.stroke(); g.restore();
  giantFace(g, 430, 680, 345, { who: 'HERO', f: { ...SHOCK, look: [0.85, 0], open: 0.6, w: 0.5 }, rimColor: '#ffb45a', rimSide: 1, glint: '#ffcf7a', tilt: -0.04 });
  eyeShine(g, 430, 680, 345, '#ffcf7a', 0.55);
  bigText(g, 'POINT OF', 1330, 120, { size: 120, maxW: 900, fill: WHT });
  bigText(g, 'NO RETURN', 1330, 250, { size: 210, maxW: 1060, fill: RED, fill2: '#ff8a3a' });
  rimFrame(g, '#ff9a50', 0.12);
} });
registerShot('bh_v3', { draw(g) {            // the FACE itself is being stretched into the hole + "SPAGHETTI?"
  spaceBg(g, T, { x: 0, y: 0 }, { warm: 0.35, seed: 44 });
  blackHole(g, 1450, 640, 200, T, { tilt: 0.3, heat: 1.2, glowA: 0.45 });
  infall(g, T, 1450, 640, 200, { n: 60 });
  // stretch the face along the line to the hole (tidal pull): scale along x around the face's left edge
  g.save(); g.translate(260, 600); g.rotate(0.02); g.scale(1.45, 0.86); g.translate(-260, -600);
  giantFace(g, 560, 600, 300, { who: 'HERO', f: { ...TERROR, look: [0.9, 0.05] }, rimColor: '#ffb45a', rimSide: 1, glint: '#ffcf7a' });
  eyeShine(g, 560, 600, 300, '#ffcf7a', 0.55);
  g.restore();
  // speed streaks pulling right
  g.save(); g.globalCompositeOperation = 'lighter'; const r = rng(7); for (let i = 0; i < 26; i++) { const y = 260 + r() * 700, x = 950 + r() * 250, L = 120 + r() * 220; seg(g, [[x, y], [x + L, lerp(y, 640, 0.25)]], 4 + r() * 4, alpha('#ffd9a0', 0.35)); } g.restore();
  bigText(g, 'SPAGHETTI?', 960, 150, { size: 230, maxW: 1500, fill: YEL, fill2: '#ff9a1a' });
  rimFrame(g, '#ff9a50', 0.12);
} });
