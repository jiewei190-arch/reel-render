// DEMO_jump.js — H4 stage A demo shots for sets/jump.js (temporary ids, sheet-check only; not bound to the voice).
//   demo_jump_hop   medium on the dusk street: crouch > launch > rise > apex > hard landing (impact frame, shake, cracks) > knee wince; DEV reacts
//   demo_jump_big   follow cam: a 16 m jump off the top of frame, apex hang with hoodie flutter, fall with speed lines, BOING on a trampoline; height meter
//   demo_jump_land  landing variants: hop into a pool (splash), hop into a haystack (puff)
import { E, registerShot, layer, blurLayer, ease, prog, clamp, lerp, rr, seg, circle, glow, alpha, shade, linGrad, rng } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { street, streetFg } from '../sets/street.js';
import { blinkFlag, exprAt, idle, reaction, lookToward, camMove, atmos } from '../sets/acting.js';
import { jumpPose, jumper, jumpFX, impactFrame, jumpShake, jumpCam } from '../sets/jump.js';
import { heightMeter } from '../sets/devices.js';
import { chip } from '../sets/hud.js';

const RIM = { color: '#ffc68a', dir: [-0.8, -0.5] };

registerShot('demo_jump_hop', { draw(g, t, info) {
  const t0 = 1.2, H = 230, J = jumpPose(t, t0, H, { landing: 'thud', recover: 'wince' }), T = J.times;
  const cam = jumpCam(t, t0, H, { landing: 'thud', recover: 'wince', z: 1.16, x: -120, y: 20, follow: 0.8, lag: 0.05, zoomOut: 0.08, shake: 20 });
  const S = street(g, t, cam, { mood: 'dusk', power: 1 }), GY = S.GY, CX = S.CX, hx = CX - 60;
  layer(g, cam, 1, (g) => {
    const tLook = T.t0 + 0.1;
    actor(g, 'DEV', { x: CX - 460, y: GY + 10, s: 1.85, facing: 1, pose: t < T.tL + 0.1 ? idle(t < tLook ? POSES.relaxed : reaction('lookUp', t, tLook, 'relaxed'), t, 2) : reaction('shock', t, T.tL + 0.1, 'lookUp'),
      expr: exprAt(t, [[0, 'neutral'], [tLook, 'surprised'], [T.tL + 0.1, 'shocked']]), blink: blinkFlag(t, 3.1, 2), look: t > tLook - 0.15 ? lookToward(1, -0.5 * (1 - J.k * (J.phase === 'fall' ? 1 : 0))) : lookToward(1, 0), rim: RIM, t });
    jumpFX(g, t, J, { x: hx, gy: GY + 14, s: 1.95, landing: 'thud' });
    jumper(g, 'HERO', J, { x: hx, gy: GY + 14, s: 1.95, facing: -1, expr: exprAt(t, [[0, 'determined'], [T.t0, 'joy'], [T.tB, 'surprised'], [T.tL, 'worried']]), blink: blinkFlag(t, 3.4, 7), rim: RIM, t });
  });
  streetFg(g, t, cam); atmos(g, t, cam, { color: '#ffd8b0' });
  impactFrame(g, t, T.tL, { x: E.W * 0.5, y: E.H * 0.78 });
  chip(g, t, { str: 'Landing: the hard part', at: T.tL + 0.5, tone: 'coral' });
} });

// trampoline (local prop): frame, springs, mat that sags on impact
function trampoline(g, x, gy, w, sag) { seg(g, [[x - w / 2, gy - 60], [x - w / 2 + 20, gy]], 8, '#2a2632'); seg(g, [[x + w / 2, gy - 60], [x + w / 2 - 20, gy]], 8, '#2a2632');
  g.strokeStyle = '#141018'; g.lineWidth = 12; g.beginPath(); g.moveTo(x - w / 2, gy - 60); g.quadraticCurveTo(x, gy - 60 + sag * 2, x + w / 2, gy - 60); g.stroke();
  g.strokeStyle = '#2f6fd0'; g.lineWidth = 8; g.beginPath(); g.moveTo(x - w / 2, gy - 62); g.lineTo(x + w / 2, gy - 62); g.stroke(); for (let i = 0; i < 9; i++) seg(g, [[x - w / 2 + i * w / 8, gy - 66], [x - w / 2 + i * w / 8, gy - 54]], 3, '#9aa0b0'); }

registerShot('demo_jump_big', { draw(g, t, info) {
  const t0 = 1.0, H = 1500, opt = { landing: 'boing', up: 1.6, hang: 0.9, down: 1.3 }, J = jumpPose(t, t0, H, opt), T = J.times;
  const cam = jumpCam(t, t0, H, { ...opt, z: 1.08, x: -40, y: 30, follow: 0.94, lag: 0.04, zoomOut: 0.16, shake: 14 });
  const S = street(g, t, cam, { mood: 'dusk', power: 1 }), GY = S.GY - 60, CX = S.CX, hx = CX + 40;
  const sag = t >= T.tL ? 40 * Math.exp(-(t - T.tL) * 6) * Math.cos((t - T.tL) * 22) : t < T.t0 && t > T.tc ? 18 * prog(t, T.tc, T.t0) : 0;
  layer(g, cam, 1, (g) => {
    trampoline(g, hx, S.GY + 14, 380, sag);
    jumpFX(g, t, J, { x: hx, gy: GY + 14, s: 1.9, landing: 'boing', launchDust: false });
    jumper(g, 'HERO', J, { x: hx, gy: GY + 14 + sag, s: 1.9, facing: 1, expr: exprAt(t, [[0, 'determined'], [T.t0, 'joy'], [T.tA, 'awe'], [T.tB + 0.3, 'scared'], [T.tL, 'joy']]), blink: blinkFlag(t, 3.3, 4), rim: RIM, t });
  });
  streetFg(g, t, cam); atmos(g, t, cam, { color: '#ffd8b0' });
  heightMeter(g, t, { value: Math.max(0.1, 16 * J.lift / H), danger: 12, marks: [['HOOP', 3.05], ['HIGH JUMP', 2.45], ['POLE VAULT', 6.31], ['5 STOREYS', 16], ['NIAGARA', 51]] });
  impactFrame(g, t, T.tL, { x: E.W * 0.5, y: E.H * 0.7 });
} });

// pool + haystack (local props)
// above-ground pool: back rim + water surface (behind the hero), front wall (in front, hides what is under water)
const PH = 120;
function poolBack(g, x, gy, w, t) { const top = gy - PH; g.fillStyle = '#c8c4d4'; g.beginPath(); g.ellipse(x, top, w / 2 + 12, 46, 0, 0, 7); g.fill();
  g.fillStyle = linGrad(g, 0, top - 36, 0, top + 36, ['#2a6aa8', '#5ab8e8']); g.beginPath(); g.ellipse(x, top, w / 2, 36, 0, 0, 7); g.fill();
  for (let i = 0; i < 5; i++) { const xx = x - w * 0.34 + i * w * 0.17 + Math.sin(t * 2 + i) * 12; seg(g, [[xx, top - 6 + i % 2 * 12], [xx + 40, top - 6 + i % 2 * 12]], 3, alpha('#e8f6ff', 0.6)); } glow(g, x, top, w * 0.6, '#7fd0ff', 0.15); }
function pool(g, x, gy, w, t) { const top = gy - PH; g.fillStyle = linGrad(g, 0, top, 0, gy, ['#e8e4f0', '#9a96aa']); g.beginPath(); g.moveTo(x - w / 2 - 12, top); g.ellipse(x, top, w / 2 + 12, 46, 0, Math.PI, 0, true); g.lineTo(x + w / 2 + 12, gy); g.ellipse(x, gy, w / 2 + 12, 30, 0, 0, Math.PI); g.closePath(); g.fill();
  for (let i = 0; i < 7; i++) { const xx = x - w / 2 + 20 + i * (w - 20) / 7; g.fillStyle = i % 2 ? '#2f6fd0' : '#e8e4f0'; g.fillRect(xx, top + 30, (w - 20) / 7, 16); } }
function haystack(g, x, gy, s, sq) { const r = rng(5); g.fillStyle = '#c99a3a'; g.beginPath(); g.ellipse(x, gy - 70 * s * sq, 130 * s, 90 * s * sq, 0, Math.PI, 0); g.lineTo(x + 130 * s, gy); g.lineTo(x - 130 * s, gy); g.closePath(); g.fill();
  g.strokeStyle = '#e8c25a'; g.lineWidth = 3; for (let i = 0; i < 40; i++) { const a = Math.PI + r() * Math.PI, rr2 = r(), px = x + Math.cos(a) * 120 * s * rr2, py = gy - 70 * s * sq + Math.sin(a) * 80 * s * sq * rr2; g.beginPath(); g.moveTo(px, py); g.lineTo(px + 12, py - 6); g.stroke(); } }

registerShot('demo_jump_land', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.04], x: [-120, 120], y: [-50, -50] });
  const tA = 0.8, tB = 3.4, JA = jumpPose(t, tA, 260, { landing: 'splash', up: 0.55, hang: 0.25, down: 0.5 }), JB = jumpPose(t, tB, 260, { landing: 'puff', up: 0.55, hang: 0.25, down: 0.5 });
  const useB = t >= tB - 0.3, J = useB ? JB : JA, T = J.times;
  const sk = jumpShake(t, T.tL, 10); cam.x += sk[0]; cam.y += sk[1];
  const S = street(g, t, cam, { mood: 'dusk', power: 1 }), GY = S.GY + 14, CX = S.CX, xs = [CX - 700, CX - 100, CX + 560];
  const x = useB ? lerp(xs[1], xs[2], ease.inOut(prog(t, JB.times.t0, JB.times.tL))) : lerp(xs[0], xs[1], ease.inOut(prog(t, JA.times.t0, JA.times.tL)));
  const inPool = !useB && t > JA.times.tL, sq = useB && t > JB.times.tL ? 1 - 0.25 * Math.exp(-(t - JB.times.tL) * 4) : 1;
  layer(g, cam, 1, (g) => {
    poolBack(g, xs[1], GY, 560, t);
    g.save();
    const hay = useB && t > JB.times.tL ? 70 * ease.out(prog(t, JB.times.tL, JB.times.tL + 0.25)) : 0;
    const gyA = lerp(GY, GY - PH + 20, ease.inOut(prog(t, JA.times.t0, JA.times.tL))) - (t > tB - 0.3 ? 0 : 0);
    const sink = hay + (inPool ? 90 * ease.out(prog(t, JA.times.tL, JA.times.tL + 0.3)) - 90 * ease.inOut(prog(t, JA.times.tL + 0.8, tB - 0.3)) : 0);
    jumper(g, 'HERO', J, { x, gy: (useB ? lerp(GY - PH + 20, GY - 60, ease.inOut(prog(t, JB.times.t0, JB.times.tL))) : gyA) + sink, s: 1.8, facing: 1, expr: exprAt(t, [[0, 'determined'], [tA, 'joy'], [JA.times.tL, 'surprised'], [tB, 'joy'], [JB.times.tL, 'joy']]), blink: blinkFlag(t, 3.0, 5), rim: RIM, t, shadow: !inPool });
    g.restore();
    pool(g, xs[1], GY, 560, t); haystack(g, xs[2], GY + 4, 1.35, sq);
    jumpFX(g, t, J, { x, gy: useB ? GY - 60 : GY - PH + 20, s: 1.8, landing: useB ? 'puff' : 'splash', size: 1.5, launchDust: useB ? false : true });
  });
  streetFg(g, t, cam); atmos(g, t, cam, { color: '#ffd8b0' });
  chip(g, t, { str: 'A pool', at: JA.times.tL + 0.2, dur: tB - 0.2, x: E.W * 0.32, y: E.H * 0.2, tone: 'blue' });
  chip(g, t, { str: 'A very large haystack', at: JB.times.tL + 0.2, x: E.W * 0.62, y: E.H * 0.2 });
} });
