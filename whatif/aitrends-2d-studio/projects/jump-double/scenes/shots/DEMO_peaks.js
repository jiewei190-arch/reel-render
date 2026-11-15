// DEMO_peaks.js — sheet check for sets/peaks.js (temporary id 'demo_peaks').
// The hero bursts up through a cloud deck (ice crystals), rises beside Everest and stalls just BELOW the summit flag: his meter reads 8,192 m vs 8,849 m.
import { E, S, registerShot, layer, ease, prog, clamp, lerp, glow, rr, alpha, text, FONTS } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { actor } from '../sets/actors.js';
import { peaks, peaksFg, cloudLayer, peaksGround } from '../sets/peaks.js';
import { blinkFlag, exprAt, poseAt, idle, camMove, atmos } from '../sets/acting.js';

registerShot('demo_peaks', { draw(g, t, info) {
  const GY = peaksGround(), burst = ease.out(prog(t, 0.2, 1.1)), stall = ease.out(prog(t, 0.6, 2.6));
  const cam = camMove(t, info.dur, { z: [1.04, 1.1], x: [-120, -60], y: [40, -40] });
  const P = peaks(g, t, cam, { label: clamp((t - 1.8) * 3) });
  const [sx, sy] = P.pos.summitScreen(cam);
  const hx = sx - 380, apexY = sy + 400, hy = lerp(GY + 400, apexY, stall) + Math.sin(t * 2.2) * 6 * stall;      // stalls just below the summit's screen height
  layer(g, { z: 1, x: 0, y: 0 }, 1, (g) => actor(g, 'HERO', { x: hx, y: hy, s: 1.9, facing: 1, pose: idle(poseAt(t, [[0, 'jump'], [2.3, 'reachHigh']], 0.3), t, 3), t, rim: P.rim, shadow: false,
    expr: exprAt(t, [[0, 'determined'], [1.3, 'awe'], [2.6, 'worried']]), blink: blinkFlag(t, 3.2, 1), look: [0.8, -0.4] }));
  if (t < 1.4) cloudLayer(g, t, { z: 1, x: 0, y: 0 }, { y: E.H * 0.78, burst, burstX: hx, crystals: 1 - burst * 0.6 });
  peaksFg(g, t, cam);
  atmos(g, t, cam, { color: '#e8f0ff' });
  // the hero's own height readout (stand-in for H4's meter): 8,192 m, short of 8,849 m
  const rk = ease.out(prog(t, 1.2, 1.6)); if (rk > 0) { const v = Math.round(lerp(6000, 8192, ease.out(prog(t, 1.2, 2.6)))); g.save(); g.globalAlpha *= rk; rr(g, hx + 120, hy - 380, 220, 66, 14); g.fillStyle = alpha('#0b1324', 0.85); g.fill(); g.strokeStyle = S().ui.gold; g.lineWidth = 3; g.stroke();
    text(g, v.toLocaleString('en-US') + ' m', hx + 230, hy - 347, { size: 38, color: S().ui.gold, font: FONTS.ui, weight: 900 }); g.restore(); }
} });
