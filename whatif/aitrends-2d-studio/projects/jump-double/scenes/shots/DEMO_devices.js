// DEMO_devices.js — H4 stage A demo shots for sets/devices.js (temporary ids, sheet-check only; not bound to the voice).
//   demo_counter   DAY split-flap flips 01 > 02 > 03 > 04 over the dimmed bedroom, the doubling graph draws on, runaway bar leaves frame
//   demo_gauges    launch 90 km/h, terminal ~200 km/h (pinned, jitter), escape 11.2 km/s (heat glow) over a sky
//   demo_phone     DEV at the left looking at his phone; phone insert: views tick to 1,000,000, FAKE comments scroll
//   demo_news      a TV in the flat: town news with the jumper over the rooftops, lower-third "THE BOY WHO WON'T STAY DOWN"
import { E, registerShot, layer, blurLayer, veil, ease, prog, clamp, lerp, glow, alpha, linGrad, rng, circle, seg } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { POSES } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { apartment } from '../sets/apartment.js';
import { street } from '../sets/street.js';
import { blinkFlag, exprAt, idle, reaction, lookToward, camMove, atmos } from '../sets/acting.js';
import { dayCounter, doublingGraph, gauge, phone, tv, newsLowerThird } from '../sets/devices.js';
import { jumpPose, jumper } from '../sets/jump.js';

registerShot('demo_counter', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.2, 1.12], x: [-200, -160] });
  blurLayer(g, 10, (g) => apartment(g, t, cam, { power: 0.8 }), null, 1); veil(g, '#0e0a16', 0.55);
  const z = lerp(1.1, 1.0, ease.inOut(t / info.dur)); g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  dayCounter(g, t, { x: E.W * 0.5, y: E.H * 0.17, s: 0.9, keys: [[0, 1], [1.2, 2], [2.4, 3], [3.6, 4]] });
  doublingGraph(g, t, { x: E.W * 0.2, y: E.H * 0.83, w: E.W * 0.6, h: E.H * 0.5, values: [0.5, 1, 2, 4], start: 0.4, per: 1.2, runaway: true, runAt: 4.8, runText: 'KEEP DOUBLING' });
  g.restore();
  atmos(g, t, cam, { color: '#ffd8b0', far: 20, near: 6 });
} });

registerShot('demo_gauges', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.05] });
  layer(g, cam, 0.2, (g) => { g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#0a1030', '#3a3a80', '#e8956b']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); FX.stars(g, t, { count: 80, area: [0, 0, E.W, E.H * 0.4] }); });
  layer(g, cam, 0.5, (g) => FX.clouds(g, { y: E.H * 0.72, count: 8, h: 160, a: 0.2, seed: 4 }));
  layer(g, cam, 0.8, (g) => FX.speedLines(g, t, { count: 40, a: 0.12, inner: 600 }));
  gauge(g, t, { preset: 'launch', x: E.W * 0.2, y: E.H * 0.52, r: 220, at: 0.3 });
  gauge(g, t - 0.6, { preset: 'terminal', x: E.W * 0.5, y: E.H * 0.52, r: 220, at: 0.3 });
  gauge(g, t - 1.2, { preset: 'escape', x: E.W * 0.8, y: E.H * 0.52, r: 220, at: 0.3, sweep: 2.2 });
  atmos(g, t, cam, { color: '#fff1dc', far: 16, near: 6 });
} });

registerShot('demo_phone', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.25, 1.3], x: [-420, -380], y: [40, 40] });
  const A = apartment(g, t, cam, { power: 0.9 });
  layer(g, cam, 1, (g) => {
    const tWow = 2.6; glow(g, A.CX - 360, A.GY - 330, 220, '#8fb8ff', 0.25);
    actor(g, 'DEV', { x: A.CX - 420, y: A.GY + 10, s: 1.9, facing: 1, pose: idle(t < tWow ? POSES.phone : reaction('shock', t, tWow, 'phone'), t, 2), expr: exprAt(t, [[0, 'smirk'], [tWow, 'shocked']]), blink: blinkFlag(t, 3.0, 2), look: lookToward(1, 0.4), rim: { color: '#9fc8ff', dir: [1, -0.4] }, prop: { type: 'phone' }, t });
  });
  phone(g, t, { x: E.W * 0.68, y: E.H * 0.5, s: 1.12, rot: 0.04 * Math.sin(t * 0.8), views: [1200, 1000000], at: 0.4, dur: 2.4 });
  atmos(g, t, cam, { color: '#c9d4ff', far: 18, near: 6 });
} });

registerShot('demo_news', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.18, 1.26], x: [60, 40] });
  blurLayer(g, 6, (g) => apartment(g, t, cam, { power: 0.3 }), null, 1); veil(g, '#0a0812', 0.5);
  const tz = lerp(1.0, 1.06, ease.inOut(t / info.dur));
  tv(g, t, { x: E.W * 0.5, y: E.H * 0.46, w: 1240 * tz }, (g, W, H) => {
    const c2 = { z: 1.15, x: Math.sin(t * 0.4) * 40, y: -40 }; const S = street(g, t * 0.8, c2, { mood: 'dusk' });
    const J = jumpPose((t % 2.2) + 0.2, 0.5, 520, { up: 0.6, hang: 0.3, down: 0.5, landing: 'soft' });
    layer(g, c2, 1, (g) => jumper(g, 'HERO', J, { x: S.CX + 120, gy: S.GY + 14, s: 1.6, facing: 1, expr: 'joy', blink: blinkFlag(t, 3, 2), t, speedLines: false }));
    newsLowerThird(g, t, { at: 0.5 });
  });
  // living-room spill from the screen
  glow(g, E.W * 0.5, E.H * 0.9, 700, '#9fc8ff', 0.18);
  atmos(g, t, cam, { color: '#c9d4ff', far: 16, near: 6 });
} });
