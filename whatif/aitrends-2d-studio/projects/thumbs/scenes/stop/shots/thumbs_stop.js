// thumbs_stop.js — Test & Compare thumbnails for "What If You Could Freeze Time for 10 Seconds?" (stop_v1..v3).
// Hero = THIS episode's design (cast.js + freeze.js heroBigFace): shaggy black hair, ONE cowlick, round tortoiseshell glasses,
// teal/cream striped long-sleeve tee. The power is only ever a finger snap (no gadget, no clock symbols ON the hero).
// Fix for the uploaded thumbnail's clutter: ONE face, ONE topic object (frozen juice splash / the snap), 2 words.
import { E, registerShot, blurLayer, rng, lerp, circle, ring, seg, rr, alpha, shade, glow, linGrad, radGrad } from '/engine/core.js';
import { FACE } from '../sets/faces.js';
import { heroBigFace, liquidArc, freezeGrade, snapBurst, stillMark, FZ } from '../sets/freeze.js';
import { morning } from '../sets/morning.js';
import { stopwatch } from '../sets/stopprops.js';
import { bigText, burst, rimFrame, fullBg, eyeShine, YEL, WHT, CYAN } from '../../thumbkit.js';

const T = 2.0, CAM = { x: 0, y: 0, z: 1 };
const AMAZE = { ...FACE.awe, eye: 1.3, pupil: 1.1, brow: 1, open: 0.9, w: 0.75, smile: 0.1, glint: 1, sweat: 0 };
const SHOCK = { ...FACE.shocked, eye: 1.3, pupil: 0.85, open: 1.05, w: 0.72, smile: -0.35, glint: 1, sweat: 0.8 };
const SMIRK = { ...FACE.smirk, eye: 0.85, glint: 1, smile: 0.55, asym: 0.9, brow: 0.35 };

// blurred, frozen kitchen backdrop (the set from the episode, pushed out of focus so the face + object pop)
function frozenKitchen(g, k = 1) {
  blurLayer(g, 6, (g) => morning(g, T, CAM, { view: 'kitchen', mood: 'morning', breakfast: true, juice: false }));
  freezeGrade(g, k);
  fullBg(g, alpha('#0a1830', 0.35));
}
// a big, close frozen splash: tipped glass + a ribbon of juice arcing out and breaking into big hanging beads
function bead(g, x, y, r) {
  glow(g, x, y, r * 2.2, '#cfeaff', 0.25);
  g.fillStyle = radGrad(g, x - r * 0.35, y - r * 0.4, r * 0.1, r * 1.1, ['#ffe08a', FZ.juice, shade(FZ.juice, -0.3)]); g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
  g.strokeStyle = alpha('#5a2a00', 0.5); g.lineWidth = Math.max(2, r * 0.1); g.beginPath(); g.arc(x, y, r, 0.3, 2.6); g.stroke();
  circle(g, x - r * 0.38, y - r * 0.4, r * 0.28, alpha('#ffffff', 0.95)); circle(g, x + r * 0.35, y + r * 0.3, r * 0.1, alpha('#ffffff', 0.7));
}
function bigSplash(g, x, y, s = 1) {
  g.save(); g.translate(x, y); g.scale(s, s);
  // ribbon: quadratic arc from the glass lip up and over to the right
  const P0 = [-330, 150], P1 = [-120, -330], P2 = [230, -120];
  const q = (u) => [(1 - u) ** 2 * P0[0] + 2 * (1 - u) * u * P1[0] + u * u * P2[0], (1 - u) ** 2 * P0[1] + 2 * (1 - u) * u * P1[1] + u * u * P2[1]];
  const pts = []; for (let u = 0; u <= 0.62; u += 0.02) pts.push(q(u));
  glow(g, -60, -150, 420, '#cfeaff', 0.25);
  seg(g, pts, 74, shade(FZ.juice, -0.3)); seg(g, pts, 60, FZ.juice); seg(g, pts.map(([a, b]) => [a - 10, b - 12]), 14, alpha('#ffe9a8', 0.9));
  // the ribbon breaks up into beads, getting smaller and spreading
  const r = rng(6);
  for (let i = 0; i < 26; i++) { const u = 0.64 + i * 0.022 + r() * 0.01, [bx, by] = q(Math.min(u, 1.05)); const sp = (u - 0.6) * 520; bead(g, bx + (r() - 0.5) * sp, by + (r() - 0.5) * sp, 40 - i * 1.0 + r() * 8); }
  for (let i = 0; i < 10; i++) bead(g, -40 + r() * 360, -330 + r() * 160, 8 + r() * 10);
  // the tipped glass (drawn over the ribbon start)
  g.save(); g.translate(-360, 200); g.rotate(-1.0);
  rr(g, -80, -190, 160, 220, 20); g.fillStyle = alpha('#e8f6ff', 0.35); g.fill(); g.strokeStyle = '#ffffff'; g.lineWidth = 12; g.stroke();
  g.beginPath(); g.rect(-72, -80, 144, 104); g.fillStyle = alpha(FZ.juice, 0.95); g.fill();
  seg(g, [[-50, -165], [-50, -10]], 12, alpha('#ffffff', 0.6));
  g.restore();
  g.restore();
}
// big black snapping hand (rig style: solid ink, rounded), striped teal cuff, fingertips at (x, y)
function snapHand(g, x, y, s = 1) {
  const ink = '#0e0b12';
  g.save(); g.translate(x, y); g.scale(s, s); g.rotate(-0.25);
  // forearm + striped sleeve
  g.save(); g.beginPath(); g.moveTo(-70, 120); g.lineTo(70, 120); g.lineTo(110, 560); g.lineTo(-120, 560); g.closePath(); g.fillStyle = '#2f8f8a'; g.fill(); g.clip();
  for (let i = 0; i < 6; i++) { g.fillStyle = '#efe3c8'; g.fillRect(-200, 170 + i * 70, 400, 26); } g.restore();
  // palm
  g.fillStyle = ink; g.beginPath(); g.ellipse(0, 50, 92, 110, 0, 0, 7); g.fill();
  // ring + pinky curled into the palm, index pointing up, middle finger pressed onto the thumb tip (the moment before the click)
  for (const [dx, dy] of [[-62, 20], [-56, 70]]) { g.beginPath(); g.ellipse(dx, dy, 44, 30, -0.2, 0, 7); g.fill(); }
  seg(g, [[-30, -30], [-40, -170], [-30, -260]], 54, ink);          // index, straight up
  seg(g, [[20, -30], [50, -150], [120, -150]], 54, ink);            // middle finger bending over
  seg(g, [[70, 60], [140, -40], [130, -130]], 58, ink);             // thumb rising to meet it
  // rim light so the black hand reads on the dark frame
  g.strokeStyle = alpha('#bfefff', 0.9); g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.ellipse(0, 50, 98, 116, 0, -2.6, -1.2); g.stroke();
  g.restore();
}

registerShot('stop_v1', { draw(g) {          // ONE face + ONE frozen juice splash + "10 SECONDS"
  frozenKitchen(g, 1);
  burst(g, 1350, 640, 900, '#cfeaff', 0.08, 18);
  bigSplash(g, 1380, 650, 1.05);
  const r = rng(2); for (let i = 0; i < 10; i++) stillMark(g, 1050 + r() * 700, 380 + r() * 450, 1.6, T, i);
  heroBigFace(g, 450, 640, 320, { f: { ...AMAZE, look: [0.8, -0.1] }, rimColor: '#bfefff', rimSide: 1, glint: '#e8faff', tilt: -0.05 });
  eyeShine(g, 450, 640, 320, '#cfefff', 0.4);
  bigText(g, '10 SECONDS', 1270, 165, { size: 220, maxW: 1150, fill: YEL, fill2: '#ffae1a' });
  rimFrame(g, CYAN, 0.12);
} });
registerShot('stop_v2', { draw(g) {          // THE SNAP: frozen ripple from the fingers, half the frame warm, half frozen
  blurLayer(g, 6, (g) => morning(g, T, CAM, { view: 'kitchen', mood: 'morning', breakfast: true, juice: true }));
  const hx = 1250, hy = 560, R = 560;
  freezeGrade(g, 1, { clip: { x: hx, y: hy, r: R } });
  g.save(); g.globalCompositeOperation = 'lighter'; ring(g, hx, hy, R, 26, alpha(CYAN, 0.35)); ring(g, hx, hy, R, 9, alpha('#ffffff', 0.95)); ring(g, hx, hy, R - 30, 4, alpha(CYAN, 0.8)); ring(g, hx, hy, R * 0.66, 5, alpha('#ffffff', 0.45)); g.restore();
  
  snapHand(g, hx, hy + 60, 1.0);
  snapBurst(g, 0.1, { x: hx + 95, y: hy - 70, t0: 0, s: 2.4 });
  heroBigFace(g, 400, 660, 310, { f: { ...SMIRK, look: [0.7, -0.2] }, rimColor: '#ffd59a', rimSide: 1, glint: '#fff0c0', tilt: -0.04 });
  eyeShine(g, 400, 660, 310, '#fff0c0', 0.35);
  bigText(g, '10 SECONDS', 1230, 140, { size: 210, maxW: 1200, fill: YEL, fill2: '#ffae1a' });
  rimFrame(g, CYAN, 0.12);
} });
registerShot('stop_v3', { draw(g) {          // shocked face + splash + different words: "TIME STOPS"
  frozenKitchen(g, 1);
  burst(g, 1350, 640, 900, '#cfeaff', 0.08, 18);
  bigSplash(g, 1420, 720, 0.95);
  heroBigFace(g, 460, 640, 320, { f: { ...SHOCK, look: [0.8, -0.15] }, rimColor: '#bfefff', rimSide: 1, glint: '#e8faff', tilt: -0.05 });
  eyeShine(g, 460, 640, 320, '#cfefff', 0.4);
  bigText(g, 'TIME', 1340, 150, { size: 230, maxW: 900, fill: WHT, fill2: '#cfeaff' });
  bigText(g, 'STOPS', 1340, 360, { size: 230, maxW: 900, fill: CYAN, fill2: '#2fb8ff' });
  rimFrame(g, CYAN, 0.12);
} });
