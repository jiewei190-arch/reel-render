// E_punch.js — batch E part 2 (s114-s120): the pillow punch.
//   s114 by the bench: DEV grabs the pillow on 'grabs' (Biscuit already asleep on it, not called out), "Okay." lip-synced; HERO catches his breath
//   s115 giant DEV (beanie), lip-sync "One punch. Show us what three years did.", gold 1 PUNCH / 3 YEARS chips
//   s116 the wind-up: HERO foreground with a gold aura, DEV braces, MINA hands over her mouth on 'holds', petals slow to a freeze
//   s117 the punch: a long slow strike from 'punch', contact on 'Flump': the pillow just squashes (no feathers), DEV doesn't budge, Biscuit bobs
//   s118 insert: the pillow wobbles like jelly; the camera tilts up to Biscuit asleep on top, landing on 'Biscuit'
//   s119 Biscuit close-up: ears twitch, ONE eye opens on 'opens' (offended), tail flick on 'eye'
//   s120 giant HERO (curls, sweatband, green hoodie): petals blow past, the curls don't move, HAIR: 100% on 'at all'
import { E, S, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, wordTime, alpha, glow, rr, seg, circle, poly, ring, text, FONTS, rng, linGrad, shade } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { actor, cat } from '../sets/actors.js';
import { park, parkFg, bike } from '../sets/park.js';
import { punchPose, trainee, pillow } from '../sets/train.js';
import { impactFrame, jumpShake } from '../sets/jump.js';
import { giantFace, faceAt } from '../sets/faces.js';
import { chip } from '../sets/hud.js';
import { blinkFlag, blinkAmt, exprAt, idle, reaction, lookToward, camMove, atmos } from '../sets/acting.js';

const shotWord = (w, st, fb) => { const g = wordTime(w, st); return (g == null ? st + fb : g) - st; };
const GOLD = '#ffd47e', CREAM = '#fff1dc', DAWN = { season: 'spring', mood: 'dawn' }, RIMC = '#ffc68a';
const FLUMP = 366.0;                                          // global time of 'Flump' (s117 contact; s118 continues the wobble)
// lip-sync: mouth flaps only inside the spoken spans [[t0, t1], ...]
const talkAt = (t, spans) => { for (const [a, b] of spans) if (t >= a && t <= b) return 0.25 + 0.6 * Math.abs(Math.sin((t - a) * 15)) * clamp((b - t) / 0.08); return 0; };
// the squash spring of the punched pillow (no feathers: we draw train.js pillow un-hit inside our own squash transform)
const squash = (u, amp = 1, decay = 4, freq = 16) => (u < 0 ? 0 : amp * Math.exp(-u * decay) * Math.cos(u * freq));
function softPillow(g, t, x, y, s, sq, o = {}) {
  g.save(); g.translate(x, y); g.scale(1 - 0.28 * sq, 1 + 0.24 * sq); g.rotate(-0.04 * sq);
  pillow(g, t, { x: 0, y: 0, s, rim: o.rim, dir: 1 }); g.restore();
  return { top: y - 31 * s * (1 + 0.24 * sq), w: 92 * s * (1 - 0.28 * sq) };
}
// Biscuit asleep on top of the pillow (bobs with the squash)
const sleepyCat = (g, t, x, top, s, o = {}) => cat(g, { x, y: top + 6, s, facing: o.facing ?? -1, pose: 'loaf', eyes: o.eyes || 'blink', t, rim: o.rim });
// Dev holding the pillow in front of his chest: returns the pillow centre
const devPillowAt = (devX, GY, sD) => [devX - 36 * sD - 70, GY - 152 * sD + 4];

// ---------------------------------------------------------------------------------------------------
// s114 — "Dev grabs a pillow. "Okay."
// ---------------------------------------------------------------------------------------------------
registerShot('s114', { draw(g, t, info) {
  const st = info.shot.start, tG = shotWord('grabs', st, 0.37), tO = shotWord('Okay', st, 1.83);
  const cam = camMove(t, info.dur, { z: [1.12, 1.16], x: [-640, -600], y: [-40, -50] });
  const P = park(g, t, cam, { ...DAWN, fountain: false }), GY = P.GY, bx = P.pos.benchX;
  const sD = 1.9, devX = bx + 250, grab = ease.inOut(prog(t, tG - 0.05, tG + 0.55));
  const [hpx, hpy] = devPillowAt(devX, GY + 20, sD), rest = [bx + 30, GY - 118];
  const px = lerp(rest[0], hpx, grab), py = lerp(rest[1], hpy, grab) - Math.sin(grab * Math.PI) * 60;
  layer(g, cam, 1, (g) => {
    bike(g, t, { x: bx + 600, gy: GY - 6, s: 1.55, facing: -1, speed: 0, expr: exprAt(t, [[0, 'smile'], [tO, 'happy']]), blink: blinkFlag(t, 2.9, 1), look: lookToward(-1, 0), rim: P.rim, phase: 0.2 });
    const devPose = grab < 0.05 ? idle({ ...POSES.stand, eF: [24, -140], hF: [40, -112] }, t, 2) : idle(reaction('holdFront', t, tG + 0.2, 'stand'), t, 2);
    actor(g, 'DEV', { x: devX, y: GY + 20, s: sD, facing: -1, pose: devPose, expr: exprAt(t, [[0, 'smile'], [tG, 'smirk'], [tO - 0.1, 'happy']]), talk: talkAt(t, [[tO - 0.02, tO + 0.42]]), blink: blinkFlag(t, 3.1, 2), look: lookToward(-1, grab < 0.5 ? 0.6 : 0), rim: P.rim, t });
    const S1 = softPillow(g, t, px, py, 1.7, squash(t - tG - 0.5, 0.25, 6), { rim: P.rim });
    sleepyCat(g, t, px + 6, S1.top, 1.25, { rim: P.rim });
    // HERO catching his breath (hands on hips, puffs), looks at the pillow
    const hp = idle({ ...POSES.stand, eF: [30, -130], hF: [12, -106], eB: [-26, -132], hB: [-12, -106] }, t * 1.6, 4);
    trainee(g, 'HERO', { pose: hp, shadow: [0, 38] }, { x: bx - 330, y: GY + 30, s: 1.9, facing: 1, t, rim: P.rim, blink: blinkFlag(t, 3.3, 3),
      look: t > tG + 0.3 ? lookToward(1, -0.25) : lookToward(1, 0.2), expr: exprAt(t, [[0, 'happy'], [tG + 0.4, 'confused'], [tO + 0.3, 'smirk']]), sweat: 0.4, breath: 1.4 });
  });
  parkFg(g, t, cam, { season: 'spring' }); atmos(g, t, cam, { color: '#ffe0ea' });
  FX.godRays(g, E.W * 0.9, -40, { angle: 2.2, spread: 0.8, len: 1600, color: '#ffe2a8', a: 0.08, t });
} });

// ---------------------------------------------------------------------------------------------------
// s115 — "One punch. Show us what three years did."  giant DEV
// ---------------------------------------------------------------------------------------------------
// accessories giantFace has no field for: Dev's orange beanie, the hero's curls + white sweatband
function beanie(g, cx, cy, r) {
  g.save(); g.beginPath(); g.arc(cx, cy, r * 1.06, Math.PI * 1.04, Math.PI * 1.96); g.lineTo(cx + r * 1.02, cy - r * 0.42); g.lineTo(cx - r * 1.02, cy - r * 0.42); g.closePath();
  g.fillStyle = linGrad(g, 0, cy - r, 0, cy - r * 0.4, ['#ffa040', '#e07818']); g.fill();
  g.strokeStyle = alpha('#8a3a08', 0.4); g.lineWidth = r * 0.03; for (let i = -5; i <= 5; i++) { g.beginPath(); g.moveTo(cx + i * r * 0.17, cy - r * 0.48); g.lineTo(cx + i * r * 0.14, cy - r * 0.98 + Math.abs(i) * r * 0.05); g.stroke(); }
  rr(g, cx - r * 1.08, cy - r * 0.6, r * 2.16, r * 0.26, r * 0.12); g.fillStyle = '#f08a24'; g.fill(); g.fillStyle = alpha('#fff', 0.15); g.fillRect(cx - r, cy - r * 0.58, r * 2, r * 0.06);
  circle(g, cx, cy - r * 1.1, r * 0.18, '#ffb060'); g.restore();
}
function heroGiant(g, t, cx, cy, r, o) {
  const ink = S().ink || '#1a1420', c = '#3f9a4a', d = shade(c, -0.3);
  g.save(); g.translate(cx, cy + (o.breath ?? 0) * r * 0.012);
  g.fillStyle = shade(c, -0.18); g.beginPath(); g.ellipse(0, r * 0.04, r * 1.24, r * 1.2, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = alpha('#000', 0.35); g.beginPath(); g.ellipse(0, r * 0.06, r * 1.08, r * 1.06, 0, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.moveTo(-r * 1.9, r * 2.3); g.quadraticCurveTo(-r * 1.7, r * 1.15, -r * 0.62, r * 0.98); g.lineTo(r * 0.62, r * 0.98); g.quadraticCurveTo(r * 1.7, r * 1.15, r * 1.9, r * 2.3); g.closePath();
  g.fillStyle = linGrad(g, 0, r, 0, r * 2.3, [shade(c, 0.05), shade(c, -0.35)]); g.fill();
  g.strokeStyle = d; g.lineWidth = r * 0.05; g.beginPath(); g.moveTo(-r * 0.62, r * 0.98); g.quadraticCurveTo(0, r * 1.32, r * 0.62, r * 0.98); g.stroke();
  for (const s of [-1, 1]) { g.strokeStyle = shade(c, 0.5); g.lineWidth = r * 0.05; g.beginPath(); g.moveTo(s * r * 0.2, r * 1.12); g.quadraticCurveTo(s * r * 0.26, r * 1.5, s * r * 0.22, r * 1.8); g.stroke(); }
  g.restore();
  giantFace(g, cx, cy, r, { ...o, who: 'NONE' });
  // big dark curls (never thinner): two rows of curl balls over the crown + sideburn curls, each with a little highlight
  g.save(); g.translate(cx, cy + (o.breath ?? 0) * r * 0.012); if (o.tilt) g.rotate(o.tilt);
  const curl = (a, d, rr2) => { const x = Math.cos(a) * r * d, y = Math.sin(a) * r * d; circle(g, x, y, r * rr2, ink); g.strokeStyle = alpha('#ffffff', 0.12); g.lineWidth = r * 0.025; g.beginPath(); g.arc(x - r * 0.04, y - r * 0.04, r * rr2 * 0.55, Math.PI * 1.1, Math.PI * 1.7); g.stroke(); };
  for (let i = 0; i <= 10; i++) curl(Math.PI * (1.0 + i * 0.1), 1.02, 0.3);
  for (let i = 0; i <= 8; i++) curl(Math.PI * (1.08 + i * 0.105), 0.78, 0.28);
  for (let i = 0; i <= 5; i++) curl(Math.PI * (1.2 + i * 0.12), 1.25, 0.22);
  // white sweatband with a green stripe across the forehead (clipped to the head)
  g.save(); g.beginPath(); g.arc(0, 0, r * 1.02, 0, Math.PI * 2); g.clip();
  g.fillStyle = '#f4f1e8'; g.beginPath(); g.moveTo(-r * 1.1, -r * 0.5); g.quadraticCurveTo(0, -r * 0.62, r * 1.1, -r * 0.5); g.lineTo(r * 1.1, -r * 0.3); g.quadraticCurveTo(0, -r * 0.42, -r * 1.1, -r * 0.3); g.closePath(); g.fill();
  g.strokeStyle = '#3f9a4a'; g.lineWidth = r * 0.045; g.beginPath(); g.moveTo(-r * 1.1, -r * 0.4); g.quadraticCurveTo(0, -r * 0.52, r * 1.1, -r * 0.4); g.stroke();
  g.fillStyle = alpha('#000', 0.12); g.beginPath(); g.moveTo(-r * 1.1, -r * 0.32); g.quadraticCurveTo(0, -r * 0.44, r * 1.1, -r * 0.32); g.lineTo(r * 1.1, -r * 0.3); g.quadraticCurveTo(0, -r * 0.42, -r * 1.1, -r * 0.3); g.fill();
  g.restore(); g.restore();
}
function dawnBackdrop(g, t, cam) { blurLayer(g, 12, (g) => park(g, t, cam, { ...DAWN, fountain: false }), null, 1); }

registerShot('s115', { draw(g, t, info) {
  const st = info.shot.start, tOne = shotWord('One', st, 0.15), tShow = shotWord('Show', st, 1.55), tThree = shotWord('three', st, 2.05), tDid = shotWord('did', st, 2.49);
  const cam = { z: 1.2, x: -500 + t * 18, y: -200 };
  dawnBackdrop(g, t, cam); veil(g, '#1a0e1c', 0.2);
  FX.godRays(g, E.W * 0.95, -40, { angle: 2.3, spread: 0.7, len: 1500, color: '#ffe2a8', a: 0.1, t });
  const z = 1 + 0.06 * ease.inOut(t / info.dur), cx = E.W * 0.52, cy = E.H * 0.5 + 40;
  g.save(); g.translate(cx, cy); g.scale(z, z); g.translate(-cx, -cy);
  const f = faceAt(t, [[0, 'cheeky'], [1.2, 'determined'], [2.4, 'smirk']]);
  f.open = Math.max(f.open * 0.4, talkAt(t, [[tOne - 0.03, tOne + 0.75], [tShow - 0.03, tDid + 0.38]]));
  giantFace(g, cx, cy, 320, { who: 'DEV', f, rimSide: 1, rimColor: RIMC, blink: blinkAmt(t, 3.0, 0.6), breath: Math.sin(t * 2.2), tilt: Math.sin(t * 0.9) * 0.025 });
  beanie(g, cx, cy, 320);
  // the pillow edge at the bottom of frame
  g.restore();
  g.save(); g.translate(E.W * 0.5, E.H + 30); g.rotate(-0.03); pillow(g, t, { x: 0, y: 0, s: 5.2, dir: 1 }); g.restore();
  chip(g, t, { str: '1 PUNCH', at: tOne, x: E.W * 0.16, y: E.H * 0.24 });
  chip(g, t, { str: '3 YEARS', at: tThree, x: E.W * 0.84, y: E.H * 0.3, tone: 'coral' });
  atmos(g, t, cam, { color: '#ffe0ea', far: 16, near: 6 });
} });

// ---------------------------------------------------------------------------------------------------
// s116 — "You wind up. Everyone holds their breath."
// ---------------------------------------------------------------------------------------------------
const MINA_GASP = { head: [4, -206], sh: [0, -172], hip: [0, -100], eF: [22, -158], hF: [10, -190], eB: [-14, -158], hB: [2, -188], kF: [6, -50], fF: [3, 0], kB: [-6, -50], fB: [-11, 0] };
registerShot('s116', { draw(g, t, info) {
  const st = info.shot.start, tW = shotWord('wind', st, 0.39), tH = shotWord('holds', st, 2.03), tE = shotWord('Everyone', st, 1.69);
  const tp = t < tE ? t : tE + (t - tE) * 0.06;                    // the world slows to a held breath (petals hang)
  const cam = camMove(t, info.dur, { z: [1.05, 1.15], x: [-80, -40], y: [-60, -40] });
  const P = park(g, tp, cam, { ...DAWN, fountain: false, bench: false }), GY = P.GY, CX = P.CX;
  const sD = 1.9, devX = CX + 420, [px, py] = devPillowAt(devX, GY + 10, sD);
  const t0 = info.dur + 0.5, PP = punchPose(t, t0, { wind: t0 - 0.07 - tW, strike: 0.07 });
  layer(g, cam, 1, (g) => {
    // MINA on her parked bike behind, hands over her mouth on 'holds'
    bike(g, tp, { x: CX + 700, gy: GY - 30, s: 1.6, facing: -1, rider: null, phase: 0.1 });
    actor(g, 'MINA', { x: CX + 640, y: GY - 30, s: 1.6, facing: -1, pose: t < tH ? idle(POSES.stand, t, 4) : idle(reaction(MINA_GASP, t, tH, 'stand'), tp, 4), expr: exprAt(t, [[0, 'nervous'], [tH, 'worried']]), blink: blinkFlag(t, 2.9, 4), look: lookToward(-1, 0), rim: P.rim, t });
    actor(g, 'DEV', { x: devX, y: GY + 10, s: sD, facing: -1, pose: idle(POSES.holdFront, t * 1.5, 9), expr: exprAt(t, [[0, 'smirk'], [tW + 0.3, 'nervous'], [tH, 'scared']]), blink: blinkFlag(t, 3.5, 9), look: lookToward(-1, 0), rim: P.rim, t });
    const S1 = softPillow(g, t, px, py, 1.7, 0, { rim: P.rim }); sleepyCat(g, t, px + 6, S1.top, 1.2, { rim: P.rim });
    // HERO foreground, big, back three-quarter: aura + the slow wind-up
    const hx = CX - 380, s = 2.45, aura = ease.out(prog(t, tW, tW + 1.2));
    glow(g, hx + 40, GY - 230 * s * 0.5, 520, GOLD, 0.16 * aura + 0.04 * aura * Math.sin(t * 7));
    for (let i = 0; i < 3; i++) { const u = (t * 0.6 + i / 3) % 1; ring(g, hx + 40, GY - 260, 160 + u * 260, 3, alpha(GOLD, 0.35 * aura * (1 - u))); }
    trainee(g, 'HERO', { pose: PP.pose, shadow: [6, 44] }, { x: hx, y: GY + 90, s, facing: 1, t, rim: { color: '#ffd8a0', dir: [0.9, -0.4] }, blink: blinkFlag(t, 3.2, 10), look: lookToward(1, 0), expr: exprAt(t, [[0, 'determined'], [tW + 0.2, 'angry']]), breath: 0.3 });
    if (aura > 0) for (let i = 0; i < 10; i++) { const r = rng(90 + i), u = (t * (0.4 + r() * 0.3) + r()) % 1; FX.sparkle(g, hx - 120 + r() * 320, GY - 80 - u * 520, 10 + r() * 8, '#ffe8b0', 0.8 * aura * Math.sin(u * Math.PI)); }
  });
  parkFg(g, tp, cam, { season: 'spring' });
  veil(g, '#120818', 0.12 * ease.out(prog(t, tE, tE + 0.8)));
  atmos(g, tp, cam, { color: '#ffe0ea' });
} });

// ---------------------------------------------------------------------------------------------------
// s117 — "You punch. Flump."
// ---------------------------------------------------------------------------------------------------
registerShot('s117', { draw(g, t, info) {
  const st = info.shot.start, tP = shotWord('punch', st, 0.35), tF = FLUMP - st;
  let cam = camMove(t, info.dur, { z: [1.2, 1.3], x: [10, 30], y: [-120, -130] });
  const [sx, sy] = jumpShake(t, tF, 12); cam = { ...cam, x: cam.x + sx, y: cam.y + sy };
  const P = park(g, t, cam, { ...DAWN, fountain: false, bench: false }), GY = P.GY, CX = P.CX;
  const sD = 1.95, sH = 2.05, devX = CX + 330, [px, py] = devPillowAt(devX, GY, sD), pw = 92 * 1.9, heroX = px - pw / 2 - 89 * sH + 18;
  const PP = punchPose(t, tF, { wind: 0.3, strike: tF - tP - 0.05, follow: 0.4 }), striking = t > tP && t < tF;
  const u = t - tF, sq = squash(u, 0.9, 4, 16);
  layer(g, cam, 1, (g) => {
    actor(g, 'DEV', { x: devX, y: GY, s: sD, facing: -1, pose: idle(POSES.holdFront, t, 9), expr: exprAt(t, [[0, 'nervous'], [tF, 'surprised'], [tF + 0.45, 'smirk']]), blink: blinkFlag(t, 3.5, 9), look: lookToward(-1, 0), rim: P.rim, t });
    const S1 = softPillow(g, t, px, py, 1.9, sq, { rim: P.rim }); sleepyCat(g, t, px + 8, S1.top, 1.3, { rim: P.rim });
    trainee(g, 'HERO', { pose: PP.pose, shadow: [6, 44] }, { x: heroX, y: GY, s: sH, facing: 1, t, rim: P.rim, blink: blinkFlag(t, 3.2, 10), look: lookToward(1, 0),
      expr: exprAt(t, [[0, 'determined'], [tP, 'angry'], [tF + 0.35, 'confused']]) });
    // petals blown back from the impact
    if (u > 0) for (let i = 0; i < 16; i++) { const r = rng(140 + i), a = (r() - 0.5) * 1.6, d = (200 + r() * 500) * (1 - Math.exp(-u * 3)); g.fillStyle = alpha('#ffd0e0', 0.9 * (1 - prog(u, 0.4, 1))); g.beginPath(); g.ellipse(px + Math.cos(a) * d, py + Math.sin(a) * d * 0.6 + u * 40, 10, 5, u * 5 + i, 0, 7); g.fill(); }
    // a tiny puff of dust, nothing else
    if (u > 0 && u < 0.9) for (let i = 0; i < 6; i++) circle(g, px - 60 + i * 24, py + 50 - u * 50 - (i % 2) * 14, 12 + u * 26, alpha('#f4ead8', 0.35 * (1 - u / 0.9)));
  });
  parkFg(g, t, cam, { season: 'spring' }); atmos(g, t, cam, { color: '#ffe0ea' });
  if (striking) FX.speedLines(g, t, { cx: E.W * 0.6, cy: E.H * 0.45, count: 26, a: 0.16 * ease.in(prog(t, tP, tF)), inner: 360 });
  impactFrame(g, t, tF, { x: E.W * 0.55, y: E.H * 0.42 });
  // "Flump." small, soft, a bit sad
  const fk = ease.outBack(prog(u, 0, 0.3)); if (u > 0) { g.save(); g.translate(E.W * 0.6, E.H * 0.2); g.rotate(-0.06); g.scale(fk, fk); g.globalAlpha = 1 - prog(u, 0.45, 0.6); text(g, 'flump.', 0, 0, { size: 90, color: GOLD, font: FONTS.title, weight: 700, stroke: 12, strokeColor: '#2a1630', glow: 14, glowColor: alpha(GOLD, 0.5) }); g.restore(); }
} });

// ---------------------------------------------------------------------------------------------------
// s118 — "The pillow wobbles. Biscuit,"
// ---------------------------------------------------------------------------------------------------
registerShot('s118', { draw(g, t, info) {
  const st = info.shot.start, tB = shotWord('Biscuit', st, 2.07), tWob = shotWord('wobbles', st, 0.69), u = st + t - FLUMP;
  const tilt = ease.inOut(prog(t, tB - 0.75, tB + 0.05));
  const P0 = { GY: E.H * 0.8, CX: E.W / 2 }, sD = 1.95, devX = P0.CX + 330, [px, py] = devPillowAt(devX, P0.GY, sD);
  const cam = { z: 1.75 + 0.05 * t / info.dur, x: px - E.W / 2 + 40 + Math.sin(t * 0.8) * 6, y: lerp(py - E.H / 2 + 30, py - E.H / 2 - 150, tilt) };
  const P = park(g, t, cam, { ...DAWN, fountain: false, bench: false });
  const sq = squash(u, 0.75, 1.3, 11) + 0.25 * squash(t - tWob, 1, 3, 20);
  layer(g, cam, 1, (g) => {
    actor(g, 'DEV', { x: devX, y: P.GY, s: sD, facing: -1, pose: idle(POSES.holdFront, t, 9), expr: exprAt(t, [[0, 'surprised'], [tWob + 0.2, 'smirk']]), blink: blinkFlag(t, 3.5, 9), look: lookToward(-1, 0.3), rim: P.rim, t });
    const S1 = softPillow(g, t, px, py, 1.9, sq, { rim: P.rim }); sleepyCat(g, t, px + 8, S1.top, 1.3, { rim: P.rim });
    // Zz rising from the cat
    for (let i = 0; i < 3; i++) { const k = (t * 0.5 + i / 3) % 1; text(g, 'z', px + 70 + k * 50, S1.top - 60 - k * 90, { size: 24 + k * 18, color: CREAM, font: FONTS.title, weight: 700, alpha: Math.sin(k * Math.PI) * tilt, stroke: 6, strokeColor: '#2a1630' }); }
  });
  parkFg(g, t, cam, { season: 'spring' }); atmos(g, t, cam, { color: '#ffe0ea', far: 18, near: 6 });
} });

// ---------------------------------------------------------------------------------------------------
// s119 — "asleep on top of it, opens one eye."  Biscuit close-up
// ---------------------------------------------------------------------------------------------------
function catFace(g, t, cx, cy, r, o) {
  const fur = '#2a2230', rim = '#ffc68a', eye = '#c8f07a', tw = o.twitch || 0;
  // pillow fabric under the loaf
  g.fillStyle = linGrad(g, 0, cy + r * 0.7, 0, E.H, ['#f4f0fa', '#cfc6dc']); g.beginPath(); g.ellipse(cx, cy + r * 2.1, r * 3.6, r * 1.5, 0, 0, 7); g.fill();
  g.strokeStyle = alpha('#8a7aa0', 0.5); g.lineWidth = 5; g.setLineDash([16, 12]); g.beginPath(); g.ellipse(cx, cy + r * 2.1, r * 3.3, r * 1.3, 0, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); g.setLineDash([]);
  // body loaf + tail
  g.fillStyle = rim; g.beginPath(); g.ellipse(cx + r * 0.25 - 8, cy + r * 0.95 - 8, r * 1.65, r * 0.95, 0, 0, 7); g.fill();
  g.fillStyle = fur; g.beginPath(); g.ellipse(cx + r * 0.25, cy + r * 0.95, r * 1.65, r * 0.95, 0, 0, 7); g.fill();
  const tf = o.tail || 0; g.strokeStyle = fur; g.lineWidth = r * 0.24; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx + r * 1.6, cy + r * 1.3); g.quadraticCurveTo(cx + r * 2.3, cy + r * 1.6 - tf * r * 0.6, cx + r * (2.2 + tf * 0.3), cy + r * (0.9 - tf * 0.9)); g.stroke();
  // head + ears (rim light from the dawn side)
  const ear = (s, tw2) => { g.save(); g.translate(cx + s * r * 0.55, cy - r * 0.62); g.rotate(s * 0.25 + tw2); poly(g, [[-r * 0.3, r * 0.2], [0, -r * 0.62], [r * 0.3, r * 0.2]], fur); poly(g, [[-r * 0.15, r * 0.12], [0, -r * 0.4], [r * 0.15, r * 0.12]], '#6a4a5a'); g.restore(); };
  ear(-1, -tw * 0.25); ear(1, tw * 0.35);
  circle(g, cx - 8, cy - 8, r * 1.0, rim); circle(g, cx, cy, r, fur);
  // collar
  g.strokeStyle = '#9a5ad6'; g.lineWidth = r * 0.14; g.beginPath(); g.arc(cx, cy + r * 0.1, r * 0.9, Math.PI * 0.22, Math.PI * 0.78); g.stroke(); circle(g, cx, cy + r * 1.0, r * 0.1, '#ffd47e');
  // eyes: closed = happy sleeping arcs; open = green with a slit pupil and a flat, unimpressed lid
  const drawEye = (s, open) => { const ex = cx + s * r * 0.38, ey = cy - r * 0.05;
    if (open <= 0.02) { g.strokeStyle = '#e8e0f0'; g.lineWidth = r * 0.06; g.beginPath(); g.arc(ex, ey - r * 0.04, r * 0.16, Math.PI * 0.15, Math.PI * 0.85); g.stroke(); return; }
    g.save(); g.beginPath(); g.ellipse(ex, ey, r * 0.2, r * 0.15 * open, 0, 0, 7); g.clip(); g.fillStyle = eye; g.fillRect(ex - r * 0.3, ey - r * 0.3, r * 0.6, r * 0.6); g.fillStyle = '#10140a'; g.beginPath(); g.ellipse(ex + r * 0.02, ey, r * 0.035, r * 0.13, 0, 0, 7); g.fill(); circle(g, ex - r * 0.06, ey - r * 0.05, r * 0.03, '#fff'); g.restore();
    g.fillStyle = fur; g.fillRect(ex - r * 0.24, ey - r * 0.2, r * 0.48, r * 0.2 * (1 - open * 0.55)); seg(g, [[ex - r * 0.22, ey - r * 0.2 + r * 0.2 * (1 - open * 0.55)], [ex + r * 0.22, ey - r * 0.22 + r * 0.2 * (1 - open * 0.55)]], r * 0.04, '#4a3a50'); };
  drawEye(-1, 0); drawEye(1, o.open || 0);
  // nose + mouth + whiskers
  poly(g, [[cx - r * 0.07, cy + r * 0.2], [cx + r * 0.07, cy + r * 0.2], [cx, cy + r * 0.28]], '#c87a8a');
  g.strokeStyle = '#4a3a50'; g.lineWidth = r * 0.025; g.beginPath(); g.moveTo(cx, cy + r * 0.28); g.quadraticCurveTo(cx - r * 0.06, cy + r * 0.36, cx - r * 0.12, cy + r * 0.32); g.moveTo(cx, cy + r * 0.28); g.quadraticCurveTo(cx + r * 0.06, cy + r * 0.36, cx + r * 0.12, cy + r * 0.32); g.stroke();
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) seg(g, [[cx + s * r * 0.3, cy + r * (0.24 + i * 0.06)], [cx + s * r * 1.05, cy + r * (0.14 + i * 0.12) + Math.sin(t * 2 + i) * 3]], 2, alpha('#e8e0f0', 0.7));
}
registerShot('s119', { draw(g, t, info) {
  const st = info.shot.start, tO = shotWord('opens', st, 1.21), tE = shotWord('eye', st, 1.87);
  const cam = { z: 1.0, x: -300, y: -260 };
  dawnBackdrop(g, t, cam); veil(g, '#160c1a', 0.25);
  glow(g, E.W * 0.82, E.H * 0.1, 700, '#ffcf8f', 0.25);
  const z = lerp(1.25, 1.3, t / info.dur) / 1.25, cx = E.W * 0.47, cy = E.H * 0.5;
  g.save(); g.translate(cx, cy); g.scale(z, z); g.translate(-cx, -cy);
  const twitch = Math.exp(-((t - 0.4) ** 2) * 40) * Math.sin(t * 40) + Math.exp(-((t - 0.9) ** 2) * 60) * Math.sin(t * 46) * 0.7;
  const open = ease.out(prog(t, tO, tO + 0.25)), tail = Math.exp(-Math.max(0, t - tE) * 3) * Math.sin(Math.max(0, t - tE) * 14) * (t > tE ? 1 : 0);
  catFace(g, t, cx, cy, 230, { twitch, open, tail });
  g.restore();
  for (let i = 0; i < 3; i++) { const k = (t * 0.5 + i / 3) % 1; text(g, 'z', cx + 260 + k * 60, cy - 240 - k * 110, { size: 40 + k * 26, color: CREAM, font: FONTS.title, weight: 700, alpha: Math.sin(k * Math.PI) * (1 - open), stroke: 7, strokeColor: '#2a1630' }); }
  atmos(g, t, cam, { color: '#ffe0ea', far: 14, near: 5 });
} });

// ---------------------------------------------------------------------------------------------------
// s120 — "And your hair doesn't move at all."  giant HERO
// ---------------------------------------------------------------------------------------------------
registerShot('s120', { draw(g, t, info) {
  const st = info.shot.start, tAt = shotWord('at', st, 1.11), tAll = shotWord('all', st, 1.29), tHair = shotWord('hair', st, 0.37);
  const cam = { z: 1.15, x: -200 + t * 12, y: -220 };
  dawnBackdrop(g, t, cam); veil(g, '#160c1a', 0.15);
  FX.godRays(g, E.W * 0.95, -40, { angle: 2.3, spread: 0.7, len: 1500, color: '#ffe2a8', a: 0.1, t });
  const z = 1 + 0.06 * ease.inOut(t / info.dur), cx = E.W * 0.45, cy = E.H * 0.5 + 30;
  g.save(); g.translate(cx, cy); g.scale(z, z); g.translate(-cx, -cy);
  heroGiant(g, t, cx, cy, 330, { f: faceAt(t, [[0, 'determined'], [0.8, 'neutral'], [1.8, 'smirk']]), rimSide: 1, rimColor: RIMC, blink: blinkAmt(t, 3.2, 0.3), breath: Math.sin(t * 2) });
  g.restore();
  // wind: petals stream past fast (the curls stay perfectly still)
  for (let i = 0; i < 34; i++) { const r = rng(500 + i), sp = 900 + r() * 700, x = ((r() * E.W * 1.6 + (t - tHair * 0.5) * sp) % (E.W * 1.6)) - E.W * 0.3, y = r() * E.H + Math.sin(t * 3 + i) * 30; g.fillStyle = alpha(i % 3 ? '#ffd0e0' : '#fff0f6', 0.85); g.beginPath(); g.ellipse(x, y, 13, 6, t * 3 + i, 0, 7); g.fill(); }
  for (let i = 0; i < 8; i++) { const r = rng(600 + i), y = r() * E.H, x = ((t * 1400 + r() * 2400) % 2400) - 300; seg(g, [[x, y], [x - 160 - r() * 120, y]], 2, alpha('#ffffff', 0.18)); }
  // HAIR: 100% with a check on 'at all'
  const p = ease.outBack(prog(t, tAt, tAt + 0.35));
  if (p > 0) { g.save(); g.translate(E.W * 0.8, E.H * 0.26); g.scale(p, p); rr(g, -250, -56, 500, 112, 56); g.fillStyle = alpha('#0b1324', 0.92); g.fill(); g.strokeStyle = alpha(GOLD, 0.9); g.lineWidth = 4; g.stroke(); glow(g, 0, 0, 320, GOLD, 0.18);
    circle(g, -180, 0, 34, '#2fb85a'); g.strokeStyle = '#fff'; g.lineWidth = 10; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(-196, 0); g.lineTo(-184, 14); g.lineTo(-162, -12); g.stroke();
    text(g, 'HAIR: 100%', 30, 3, { size: 54, color: GOLD, font: FONTS.title, weight: 700, stroke: 8, strokeColor: '#140f1c' }); g.restore();
    if (t - tAll < 0.5 && t > tAll) FX.sparkle(g, E.W * 0.8 + 240, E.H * 0.26 - 50, 40 * (1 - (t - tAll) * 2), '#fff', 0.9); }
} });
