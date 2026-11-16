// Kentucky Meat Shower (1876): 13 shots, Toon 3D. EMOTION: LOL. Cartoon chunks only, no gore.
// Timing: every shot's start comes from lines.json + the voice's word timings (build_short.py); inside a shot, beats sync to words with at().
import { registerShot } from '/engine/core.js';
import {
  at, E, THREE, toonStage, camMove, chunk, shower, woman, man, kettle, barn, farm, microscope, bird, tree,
  POSE, EXPR, addPose, mixPose, mixExpr, idle, walk, point, shrug, nod, reactions, shakeCam, sunnyLook,
  topCaption, stamp, yearStamp, burst, label, flashFill, insT, CARD_INK, voidBg, PR, FX, rng, clamp, lerp, ease, prog, cyl, rbox, ball, toon, outline, handPos,
} from './_lib.js';

const SOFT = { rays: false, tint: '#ffe0b0' };
const RAYS = { rays: { from: [-70, -60], strength: 0.7 }, tint: '#ffd49a' };
const TOP = ['Kentucky, 1876:', 'chunks about 2 inches wide'];
const TOP_UNTIL = 3.2;

// ---- s01 (frame 1): meat chunks already raining over the farmyard under a clear sky; chickens of chunks bounce.
function yardInit(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: 46, shadowSize: 14, target: [0, 1, 0] }); const env = farm(st, { seed: o.seed || 3 });
  const sh = shower({ area: [12, 10], n: o.n || 44, h: 14, seed: o.seed || 3 }); sh.position.z = -1; st.add(sh);
  return { stage: st, env, sh };
}
registerShot('s01', { kind: '3d',
  init: yardInit,
  draw(s, t, info) { const T0 = t + 1.2; s.env.update(T0); s.sh.update(T0);
    camMove(s.stage, t, [[0, { pos: [0, 2.0, 11], look: [0, 3.2, -2], fov: 50 }], [info.dur, { pos: [0, 1.8, 9.5], look: [0, 2.8, -2], fov: 48 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); yearStamp(g, t, 1876, { at: at(info, '1876', 0.2) - 0.05, x: 830, y: 460 }); topCaption(g, t, info, TOP, TOP_UNTIL); },
});
// ---- s02: "...meat in Kentucky." close on the ground: chunks plop down and bounce, PLOP.
registerShot('s02', { kind: '3d',
  init(T) { const s = yardInit(T, { n: 20, seed: 5 }); s.big = chunk(9, 2.2); s.stage.add(s.big); return s; },
  draw(s, t, info) { s.env.update(t); s.sh.update(t + 0.4);
    const tm = at(info, 'meat', 0.1); const k = clamp((t - tm + 0.35) / 0.35); s.big.position.set(0, lerp(6, 0.25, ease.in(k)) + (k >= 1 ? Math.max(0, Math.sin((t - tm) * 9) * 0.25 * Math.exp(-(t - tm) * 3)) : 0), 2); s.big.rotation.set(0.2, t * 0.6, k < 1 ? t * 5 : 0.1);
    camMove(s.stage, t, [[0, { pos: [0.4, 1.0, 6], look: [0, 0.6, 1.5], fov: 40 }], [info.dur, { pos: [0.3, 0.9, 5.3], look: [0, 0.6, 1.5], fov: 38 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); burst(g, t - at(info, 'meat', 0.1), { text: 'PLOP!', y: 640, r: 230, until: 0.8, size: 120, color: '#c8322a' }); topCaption(g, t, info, TOP, TOP_UNTIL);
    label(g, t, at(info, 'kentucky', 0.7), 'KENTUCKY', E.W / 2, 1180, 72, { box: '#2f6a9a' }); },
});
// ---- s03: "Chunks fell from a clear blue sky..." look straight up: blue sky, a smiling sun, chunks tumbling down at the lens.
registerShot('s03', { kind: '3d',
  init(T) { const s = yardInit(T, { n: 50, seed: 7 }); return s; },
  draw(s, t, info) { s.env.update(t); s.sh.update(t + 0.6);
    camMove(s.stage, t, [[0, { pos: [0, 0.6, 3], look: [0.3, 12, -3], fov: 60 }], [info.dur, { pos: [0, 0.6, 3], look: [-0.3, 12, -3.4], fov: 58 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: { from: [800, -100], strength: 0.9 }, tint: '#ffe0b0' }); label(g, t, at(info, 'clear', 0.8) - 0.05, 'NOT A CLOUD IN SIGHT', E.W / 2, 1240, 62, { box: '#2b7fd0' }); },
});
// ---- s04: "...onto a farm." wide: chunks bounce off the barn roof and land around the fence.
registerShot('s04', { kind: '3d',
  init(T) { return yardInit(T, { n: 50, seed: 9 }); },
  draw(s, t, info) { s.env.update(t); s.sh.update(t + 1.5);
    camMove(s.stage, t, [[0, { pos: [4, 4.2, 14], look: [-1, 2.2, -4], fov: 46 }], [info.dur, { pos: [3.2, 4.0, 13], look: [-1, 2.2, -4], fov: 45 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); label(g, t, 0.15, 'BATH COUNTY', E.W / 2, 520, 64, { box: '#2f6a9a' }); },
});
// ---- s05: "A woman making soap outside..." she stirs a big kettle over a fire in the yard, calm.
function soapInit(T) {
  const st = toonStage(T, { light: 'sunny', fov: 38, shadowSize: 10, target: [0, 1, 0] }); const env = farm(st, { seed: 11, barnX: 3, barnZ: -8 });
  const k = kettle(); k.position.set(0.9, 0, 0.5); st.add(k);
  const w = woman(); w.position.set(-0.6, 0, 0.6); w.rotation.y = 0.6; st.add(w);
  const paddle = cyl(0.04, 0.04, 1.5, '#8a5a32', 0, 0, 0, 8); outline(paddle, { px: 2 }); st.add(paddle);
  const c = chunk(4, 1.4); st.add(c);
  return { stage: st, env, k, w, paddle, c };
}
function stir(s, t) { s.k.fire.update(t); const h = handPos(s.w, 'R'); s.paddle.position.set(lerp(h.x, 0.9, 0.5), h.y - 0.3, lerp(h.z, 0.5, 0.5)); s.paddle.rotation.set(0.2 * Math.sin(t * 4), 0, -0.6 + 0.15 * Math.cos(t * 4)); }
registerShot('s05', { kind: '3d',
  init: soapInit,
  draw(s, t, info) { s.env.update(t); s.c.visible = false;
    s.w.pose(addPose({ ...POSE.stand, armR: [1.0 + Math.sin(t * 4) * 0.15, -0.3, 0], elbowR: 0.9, armL: [0.9, -0.2, 0], elbowL: 1.2 }, idle(t, 2))); s.w.face({ ...EXPR.neutral, mouth: 'smile' }, t); stir(s, t);
    camMove(s.stage, t, [[0, { pos: [0.2, 2.1, 6.8], look: [0.2, 1.4, 0.5], fov: 38 }], [info.dur, { pos: [0.2, 2.0, 6.0], look: [0.2, 1.4, 0.5], fov: 37 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); label(g, t, at(info, 'soap', 0.8) - 0.05, 'SOAP DAY', E.W / 2, 520, 64, { box: '#6a7ab8' }); },
});
// ---- s06: "...watched it land." a chunk drops into frame and lands right by the kettle. She stares, deadpan. Then at us.
registerShot('s06', { kind: '3d',
  init: soapInit,
  draw(s, t, info) { s.env.update(t);
    const tl = at(info, 'land', 0.6); const k = clamp((t - tl + 0.4) / 0.4); s.c.position.set(0.0, lerp(6, 0.2, ease.in(k)), 1.6); s.c.rotation.set(k < 1 ? t * 4 : 0, 0.5, k < 1 ? t * 3 : 0);
    const look = k < 1 ? [0.3, lerp(1, -0.6, k)] : [0, -0.6 + clamp((t - tl - 0.5) / 0.3) * 0.6];
    s.w.pose(addPose({ ...POSE.stand, armR: [1.0, -0.3, 0], elbowR: 0.9, headNod: k * 0.25 - clamp((t - tl - 0.5) / 0.3) * 0.25 }, idle(t, 2))); s.w.face({ ...EXPR.deadpan, pupil: look }, t); stir(s, 0);
    camMove(s.stage, t, [[0, { pos: [-0.2, 2.0, 4.6], look: [-0.3, 1.6, 0.8], fov: 36 }], [info.dur, { pos: [-0.2, 2.0, 4.2], look: [-0.3, 1.7, 0.8], fov: 35 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); const tl = at(info, 'land', 0.6); reactions(g, t, s, [{ fx: 'exclaim', on: 'c', at: tl + 0.02, scale: 0.6 }]); },
});
// ---- s07: "Two men reportedly tasted it..." two farmers each holding up a chunk, sniffing it.
function menInit(T) {
  const st = toonStage(T, { light: 'sunny', fov: 36, shadowSize: 10, target: [0, 1, 0] }); const env = farm(st, { seed: 13 });
  const a = man({ seed: 23 }); a.position.set(-0.85, 0, 0.6); a.rotation.y = 0.35; st.add(a);
  const b = man({ seed: 24, main: '#5a7a5a', hair: '#9a9a9a', hat: '#2a2a30', skin: 'tan' }); b.position.set(0.85, 0, 0.6); b.rotation.y = -0.35; st.add(b);
  const ca = chunk(2, 1.0), cb = chunk(3, 1.0); st.add(ca, cb);
  return { stage: st, env, a, b, ca, cb };
}
function hold(s, t, chew) {
  for (const [m, c, sd] of [[s.a, s.ca, 1], [s.b, s.cb, 2]]) { const k = chew ? 1 : ease.out(prog(t, 0.1, 0.4));
    m.pose(addPose({ ...POSE.stand, armR: [lerp(0.3, 2.2, k), -0.1, 0], elbowR: lerp(0.2, 1.6, k), headNod: chew ? Math.sin(t * 10 + sd) * 0.05 : 0 }, idle(t, sd)));
    const h = handPos(m, 'R'); c.position.set(h.x, h.y + 0.12, h.z + 0.1); c.visible = !chew || sd === 2 || t < 0.2; }
}
registerShot('s07', { kind: '3d',
  init: menInit,
  draw(s, t, info) { s.env.update(t); hold(s, t, false); s.a.face(EXPR.suspicious, t); s.b.face({ ...EXPR.suspicious, pupil: [-0.4, -0.2] }, t);
    camMove(s.stage, t, [[0, { pos: [0, 2.1, 6.4], look: [0, 1.8, 0.5], fov: 36 }], [info.dur, { pos: [0, 2.1, 5.7], look: [0, 1.9, 0.5], fov: 35 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); label(g, t, at(info, 'reportedly', 0.5), '(reportedly)', E.W / 2, 1010, 56, {}); reactions(g, t, s, [{ fx: 'sweat', on: 'b', at: 0.6 }]); },
});
// ---- s08: "...and guessed mutton. Or venison." they chew, thinking; MUTTON? then VENISON? signs pop over each head.
registerShot('s08', { kind: '3d',
  init: menInit,
  draw(s, t, info) { s.env.update(t); hold(s, t, true); s.a.face({ ...EXPR.neutral, lid: 0.45, talk: 0.6, pupil: [0.3, 0.6] }, t); s.b.face({ ...EXPR.neutral, lid: 0.45, talk: 0.6, pupil: [-0.3, 0.6] }, t);
    s.a.pose(addPose(POSE.thinking, idle(t, 1))); s.b.pose(addPose({ ...POSE.thinking, armR: [0.9, 0.05, 0.2] }, idle(t, 2)));
    camMove(s.stage, t, [[0, { pos: [0, 2.1, 5.8], look: [0, 1.9, 0.5], fov: 36 }], [info.dur, { pos: [0, 2.1, 5.3], look: [0, 2.0, 0.5], fov: 35 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS);
    label(g, t, at(info, 'mutton', 0.4) - 0.05, 'MUTTON?', 300, 560, 74, { box: '#f4ecd8', color: '#5a3a1a', rot: -0.08 });
    label(g, t, at(info, 'venison', 1.0) - 0.05, 'VENISON?', 780, 520, 74, { box: '#f4ecd8', color: '#5a3a1a', rot: 0.06 }); },
});
// ---- s09: "Lab tests later found lung, muscle and cartilage." 2D lab card: microscope + a checklist that ticks on each word.
registerShot('s09', {
  draw(g, t, info) {
    voidBg(g, '#2a4a5a', '#0e1a22');
    const k = ease.outBack(clamp(t / 0.25)); g.save(); g.translate(E.W / 2, 900); g.scale(k, k);
    g.fillStyle = '#f4f1e6'; g.strokeStyle = CARD_INK; g.lineWidth = 12; g.beginPath(); g.roundRect(-430, -470, 860, 940, 50); g.fill(); g.stroke();
    insT(g, 'LAB REPORT', 0, -380, 76, { color: '#2a5a7a' }); insT(g, 'samples from the 1876 shower', 0, -300, 40, { color: '#6a6a6a' });
    ['lung', 'muscle', 'cartilage'].forEach((w, i) => { const tt = at(info, w, 0.6 + i * 0.4) - 0.05; const y = -150 + i * 170;
      g.strokeStyle = CARD_INK; g.lineWidth = 8; g.strokeRect(-330, y - 50, 100, 100);
      insT(g, w.toUpperCase(), 40, y, 76, { color: t > tt ? '#2a1c15' : 'rgba(42,28,21,.25)' });
      if (t > tt) { const kk = clamp((t - tt) / 0.15); g.strokeStyle = '#2f8a3a'; g.lineWidth = 18; g.lineCap = 'round'; g.beginPath(); g.moveTo(-315, y); g.lineTo(-290, y + 30 * kk); if (kk >= 1) g.lineTo(-240, y - 45); g.stroke(); } });
    insT(g, '(species: unclear)', 0, 390, 46, { color: '#8a5a3a' });
    g.restore();
  },
});
// ---- s10: "The most popular explanation?" the two men + the woman look up at the sky, puzzled. A shadow passes.
registerShot('s10', { kind: '3d',
  init(T) { const s = menInit(T); s.w = woman(); s.w.position.set(0, 0, -0.4); s.stage.add(s.w); s.ca.visible = s.cb.visible = false; return s; },
  draw(s, t, info) { s.env.update(t);
    for (const [m, sd] of [[s.a, 1], [s.b, 2], [s.w, 3]]) { m.pose(addPose(shrug(POSE.stand, ease.out(prog(t, 0.2, 0.5))), { headNod: -0.35, ...idle(t, sd) })); m.face({ ...EXPR.worried, pupil: [0, 0.9] }, t); }
    camMove(s.stage, t, [[0, { pos: [0, 1.0, 6.4], look: [0, 2.3, 0.2], fov: 40 }], [info.dur, { pos: [0, 1.0, 5.8], look: [0, 2.4, 0.2], fov: 39 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'question', on: 'w', at: 0.3, scale: 0.8 }]);
    const sx = lerp(-300, E.W + 300, clamp(t / 1.4)); g.save(); g.globalAlpha = 0.25; g.fillStyle = '#000'; g.beginPath(); g.ellipse(sx, 1500, 260, 40, 0, 0, 7); g.fill(); g.restore(); },
});
// ---- s11: "Vultures." a flock of vultures circles high over the farm, low angle.
function skyInit(T) {
  const s = yardInit(T, { n: 1, seed: 15 }); s.sh.visible = false;
  s.vs = [...Array(5)].map((_, i) => { const b = bird({ seed: i, scale: 1.1 }); s.stage.add(b); return b; });
  s.fall = [...Array(10)].map((_, i) => { const c = chunk(30 + i, 1); s.stage.add(c); return c; });
  return s;
}
function circle(s, t) { s.vs.forEach((b, i) => { const a = t * 0.6 + i * 1.256; b.position.set(Math.cos(a) * 3.2, 9 + (i % 2) * 0.8, -2 + Math.sin(a) * 2); b.rotation.y = -a; b.rotation.z = 0.25; b.update(t, { flap: 0.35, rate: 4, lid: 0.45 }); }); }
registerShot('s11', { kind: '3d',
  init: skyInit,
  draw(s, t, info) { s.env.update(t); circle(s, t + 0.5); s.fall.forEach(c => { c.visible = false; });
    camMove(s.stage, t, [[0, { pos: [0, 1.4, 7], look: [0, 8.5, -2], fov: 50 }], [info.dur, { pos: [0, 1.4, 6.4], look: [0, 8.8, -2], fov: 48 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: { from: [800, -100], strength: 0.8 }, tint: '#ffe0b0' }); stamp(g, t - 0.05, 'VULTURES', { y: 1260, color: '#3a2a3a', size: 120, w: 640 }); },
});
// ---- s12: PAYOFF "Throwing up mid-flight." close on one vulture: cheeks puff, BLEH!, a stream of cartoon chunks falls toward
//      the farm -> hard cut back to the meat shower in s01 (loop).
registerShot('s12', { kind: '3d',
  init: skyInit,
  draw(s, t, info) { s.env.update(t); circle(s, t + 2);
    const v = s.vs[0]; const tu = at(info, 'up', 0.4); const k = prog(t, tu - 0.2, tu); v.position.set(0, 9, -1); v.rotation.set(0.25, 0.3, 0); v.update(t, { flap: 0.5, rate: 5, lid: k > 0 ? 0.0 : 0.5, beakOpen: k * 0.6, headNod: 0.4 * k });
    v.scale.setScalar(1 + 0.15 * Math.sin(Math.min(1, k) * Math.PI));
    const h = new THREE.Vector3(); v.head.getWorldPosition(h);
    s.fall.forEach((c, i) => { const tt = t - tu - i * 0.06; c.visible = tt > 0; if (tt > 0) { c.position.set(h.x + Math.sin(i * 2.1) * 0.3, h.y - 0.3 - 4.9 * tt * tt - tt * 1.5, h.z + 0.4 + tt * 0.6); c.rotation.set(tt * 5, i, tt * 4); } });
    camMove(s.stage, t, [[0, { pos: [0.4, 8.0, 3.6], look: [0, 8.6, -1], fov: 44 }], [info.dur, { pos: [0.4, 7.8, 3.2], look: [0, 8.2, -1], fov: 44 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); const tu = at(info, 'up', 0.4); burst(g, t - tu, { text: 'BLEH!', y: 560, r: 240, until: 1.4, size: 130, c1: '#9ad04a', c2: '#e8f6a0', color: '#3a6a1a' }); },
});
