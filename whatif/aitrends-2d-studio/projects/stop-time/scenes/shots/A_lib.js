// A_lib.js — shared helpers for stop-time batch A (s001-s035, H1). Registers no shots. Classic What If style.
//   kitchen(g, ft, cam, o)      morning.js breakfast kitchen (mood 'morning'), returns { ...M, P } ; ft = motion clock (stops when frozen)
//   kitchenFg(g, ft, cam)       its blurred foreground
//   hero(g, o)                  freeze.js heroST with batch defaults (s 1.9, blink, rim)
//   mina(g, o) / dev(g, o)      actor + defaults (Mina carries her stopwatch on a cord: LOCAL)
//   readout(g, t, sec, o)       the 10-second read-out: stopprops STOPWATCH as a small HUD dial top-right + big gold digits
//   SEAT                        seated poses for the breakfast table
//   FROZEN_TUE(t)               the frozen Tuesday state (glass + juice arc mid-fall)  -> drawn by tueSpill(g, t, P, tt, frozen)
import { E, S, clamp, lerp, ease, prog, rng, seg, circle, ring, rr, poly, alpha, shade, glow, text, FONTS } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { idle, blinkFlag } from '../sets/acting.js';
import { morning, morningFg } from '../sets/morning.js';
import { stopwatch, juiceGlass } from '../sets/stopprops.js';
import { heroST, liquidArc, stillMark } from '../sets/freeze.js';

export const GOLD = '#FFC93C', CREAM = '#f3ead2', CORAL = '#FF6B5B';
export const KOPT = { view: 'kitchen', mood: 'morning', breakfast: true, juice: false, butter: true, ovenTime: '07:42', steam: 0.5 };
export function kitchen(g, ft, cam, o = {}) { const M = morning(g, ft, cam, { ...KOPT, ...o }); return { ...M, P: M.pos }; }
export const kitchenFg = (g, ft, cam) => morningFg(g, ft, cam, { view: 'kitchen', mood: 'morning' });

export const SIT_EAT = { head: [10, -178], sh: [4, -146], hip: [0, -72], eF: [24, -112], hF: [52, -128], eB: [12, -112], hB: [36, -100], kF: [44, -74], fF: [46, 0], kB: [40, -72], fB: [38, 0] };
export const SIT_REACH = { head: [14, -180], sh: [8, -148], hip: [0, -72], eF: [40, -140], hF: [76, -136], eB: [12, -112], hB: [30, -96], kF: [44, -74], fF: [46, 0], kB: [40, -72], fB: [38, 0] };
export const ARMS_OUT = { head: [3, -210], sh: [0, -175], hip: [0, -100], eF: [34, -160], hF: [66, -150], eB: [-30, -160], hB: [-62, -150], kF: [10, -50], fF: [14, 0], kB: [-10, -50], fB: [-18, 0] };
export const SCRATCH = { head: [4, -206], sh: [1, -173], hip: [0, -100], eF: [30, -192], hF: [10, -226], eB: [-7, -136], hB: [-9, -100], kF: [6, -50], fF: [3, 0], kB: [-6, -50], fB: [-11, 0] };
export const CROUCH = { head: [22, -150], sh: [12, -120], hip: [0, -62], eF: [30, -96], hF: [40, -72], eB: [16, -94], hB: [24, -66], kF: [36, -56], fF: [24, 0], kB: [20, -50], fB: [-10, 0] };

const RIM = { color: '#ffe2b8', dir: [-0.8, -0.5] };
export function hero(g, o = {}) {
  const t = o.t ?? 0;
  heroST(g, { s: 1.9, facing: -1, blink: o.frozen ? false : blinkFlag(t, 3.4, 1), rim: RIM, ...o, pose: o.pose || idle(POSES.stand, t, 1) });
}
export function mina(g, o = {}) {
  const t = o.t ?? 0, fr = o.frozen;
  actor(g, 'MINA', { s: 2.0, facing: 1, blink: fr ? false : blinkFlag(t, 2.9, 4), rim: RIM, ...o, pose: o.pose || (fr ? POSES.stand : idle(POSES.stand, t, 4)) });
  if (o.watch !== false) { // her stopwatch on a cord, at the chest
    const p = o.pose || POSES.stand, s = (o.s ?? 2.0) * 0.72, f = o.facing ?? 1, sx = o.x + p.sh[0] * s * f, sy = o.y + p.sh[1] * s;
    seg(g, [[sx - 6 * s * f, sy - 4 * s], [sx + 2 * s * f, sy + 22 * s], [sx + 10 * s * f, sy - 4 * s]], 1.6 * s, '#2a2230');
    circle(g, sx + 2 * s * f, sy + 30 * s, 8 * s, '#c8ccd4'); circle(g, sx + 2 * s * f, sy + 30 * s, 5.5 * s, '#f8f6ee'); rr(g, sx - 1.5 * s * f - 1.5 * s, sy + 18 * s, 4 * s, 4 * s, 1); g.fillStyle = '#d4262e'; g.fill();
  }
}
export function dev(g, o = {}) {
  const t = o.t ?? 0, fr = o.frozen;
  actor(g, 'DEV', { s: 1.9, facing: 1, blink: fr ? false : blinkFlag(t, 3.2, 7), rim: RIM, prop: { type: 'phone', glow: '#9fd8ff' }, ...o, pose: o.pose || (fr ? POSES.phone : idle(POSES.phone, t, 7)) });
}

// the 10-second read-out: small stopwatch dial (top-right) + big gold digits under it
export function readout(g, t, sec, o = {}) {
  const k = o.k ?? 1; if (k <= 0.01) return;
  const x = o.x ?? E.W - 150, y = o.y ?? 170, s = (o.s ?? 0.55) * ease.outBack(clamp(k)), big = o.big;
  g.save(); g.globalAlpha *= clamp(k * 1.5);
  glow(g, x, y, 170 * s / 0.55, GOLD, 0.12);
  stopwatch(g, t, { x, y, s, sec: Math.min(sec, 10), running: o.running ?? true });
  const str = (Math.min(sec, 10) < 10 ? '0' : '') + Math.min(sec, 10).toFixed(1);
  text(g, str, x, y + 205 * s, { size: (big ? 120 : 64) * s / 0.55 * (big ? 0.5 : 1), color: GOLD, font: FONTS.ui, weight: 900, glow: 14, glowColor: alpha(GOLD, 0.6) });
  g.restore();
}

// the Tuesday spill on the breakfast table: glass at Mina's elbow, tips + falls off the front-left edge; tt = spill clock (s since the knock)
export function tueSpill(g, t, P, tt, frozen = 0, o = {}) {
  const x0 = P.juiceX, y0 = P.juiceY, s = o.s ?? 0.62;
  if (tt <= 0) { juiceGlass(g, x0, y0, s, { fill: 0.75 }); return { x: x0, y: y0 }; }
  const u = tt, rot = -1.9 * ease.out(prog(u, 0, 0.45)), gx = x0 - 120 * u, gy = y0 + 0.5 * 1500 * Math.max(0, u - 0.3) ** 2;
  liquidArc(g, t, { x0: x0 - 30, y0: y0 - 70 * s, vx: -330, vy: -120, tt: Math.max(0, u - 0.08), kind: 'juice', n: 26, seed: 6, floor: P.floorY - 4, frozen, s: 1.1, spread: 0.55 });
  juiceGlass(g, gx, gy, s, { rot, fill: Math.max(0.12, 0.75 - u * 0.8) });
  if (frozen > 0.5) stillMark(g, gx - 30, gy - 90 * s, 0.9, t, 2);
  return { x: gx, y: gy };
}
// how far into the Tuesday spill the world froze (glass mid-air, juice arc out)
export const TUE_TT = 0.62;

export function photonDust(g, t, o = {}) {        // frozen sunbeam as hanging gold photon dots (LOCAL, s023/s024)
  const { x0, y0, x1, y1, w = 160, n = 260, k = 1, seed = 4, flow = 0 } = o, r = rng(seed);
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    let u = r(), off = (r() - 0.5) * w; if (flow) u = (u + t * 0.6 * flow) % 1;
    const x = lerp(x0, x1, u) + off * 0.6, y = lerp(y0, y1, u) + off, sz = 1.2 + r() * 2.6, tw = 0.6 + 0.4 * Math.sin(t * 2 + i);
    circle(g, x, y, sz * 2.4, alpha(GOLD, 0.08 * k)); circle(g, x, y, sz, alpha('#fff2c0', 0.75 * k * tw));
  }
  g.restore();
}
export function sunbeam(g, x0, y0, x1, y1, w0, w1, a = 0.22) {
  g.save(); g.globalCompositeOperation = 'lighter';
  const nx = -(y1 - y0), ny = x1 - x0, d = Math.hypot(nx, ny) || 1, ux = nx / d, uy = ny / d;
  const grd = g.createLinearGradient(x0, y0, x1, y1); grd.addColorStop(0, alpha('#ffe6a8', a)); grd.addColorStop(1, alpha('#ffe6a8', 0));
  g.fillStyle = grd; g.beginPath(); g.moveTo(x0 + ux * w0, y0 + uy * w0); g.lineTo(x1 + ux * w1, y1 + uy * w1); g.lineTo(x1 - ux * w1, y1 - uy * w1); g.lineTo(x0 - ux * w0, y0 - uy * w0); g.closePath(); g.fill();
  g.restore();
}
export function chipText(g, t, str, at, x, y, o = {}) {      // gold pill chip (hud-chip look) with outBack pop
  const k = ease.outBack(prog(t, at, at + 0.35)); if (k <= 0.01) return; const size = o.size ?? 40, col = o.color ?? GOLD;
  g.save(); g.translate(x, y); g.scale(k, k); g.font = `900 ${size}px "${FONTS.ui}"`; const w = g.measureText(str).width + 60, h = size + 30;
  rr(g, -w / 2, -h / 2, w, h, h / 2); g.fillStyle = 'rgba(11,19,36,.92)'; g.fill(); g.strokeStyle = alpha(col, 0.9); g.lineWidth = 4; g.stroke();
  text(g, str, 0, 2, { size, color: col, font: FONTS.ui, weight: 900, glow: 10, glowColor: alpha(col, 0.5) }); g.restore();
}
