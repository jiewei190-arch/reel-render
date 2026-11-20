// The Locust Swarm That Went Extinct — 19 shots, Toon 3D + BEANMEN effects. WTF / wow.
// Nobody is hurt. The farming cause is a THEORY ("probably"). Loop: s19 tilts up into the sky; s01 opens on that sky going black.
import { registerShot, ease, prog, clamp, lerp, noise } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, point, shrug, tremble, nod, walk } from '/kits/toon3d/rig.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { drawInsert, dimScene, voidBg } from '/kits/toon3d/insert.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import {
  at, THREE, toonStage, locust, swarm, farmer, cow, prairie, valley, glacier, iceBlock, specimenBox, wheatField,
  topCaption, stamp, specks, drawCalifornia, drawSwarmBlob, soilSection, PR, rbox, cyl, ball, insT, CARD_INK,
} from './_lib.js';

const SHIELD = { armR: [2.25, 0.25, 0.3], elbowR: 1.9, armL: [1.2, 0.5, 0], elbowL: 1.3, lean: -0.12, headNod: -0.15 };
const RAYS = { rays: { from: [-70, -60], strength: 0.6 }, tint: '#ffd49a' };

// ---- s01 HOOK: prairie sky going BLACK, farmer shields his face, wheat bending. Already moving at frame 1.
function farmScene(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: 46, shadowSize: 10, target: [0, 1, 0] });
  const env = prairie(st, { seed: 3, fieldZ: -6 });
  const f = farmer(); f.position.set(0.2, 0, 1.2); st.add(f);
  const sw = swarm(st, { count: 1800, center: [0, 12, -35], size: [70, 14, 30], s: 0.35, seed: 4 });
  return { stage: st, env, f, sw };
}
registerShot('s01', { kind: '3d',
  init(T) { return farmScene(T); },
  draw(s, t, info) {
    const k = clamp(0.35 + t / 2.2);           // sky already half dark at frame 1, fully black by ~1.4 s
    s.env.darken(k * 0.92); s.env.update(t, 0.25 + k * 0.45); s.sw.update(t, { density: k, drift: [1.5, -0.4, 4] });
    s.stage.exposure = lerp(1.02, 0.78, k);
    const sh = ease.out(clamp(0.6 + t / 0.8));
    s.f.rotation.y = lerp(0.5, 0.25, sh);
    s.f.pose(addPose(mixPose(POSE.stand, SHIELD, sh), { ...tremble(t, 0.8), side: Math.sin(t * 3) * 0.02 })); s.f.face(mixExpr(EXPR.worried, EXPR.shocked, sh), t);
    camMove(s.stage, t, [[0, { pos: [1.2, 1.4, 6.2], look: [0, 3.2, -4], fov: 50 }], [info.dur, { pos: [0.8, 1.35, 5.2], look: [0, 3.0, -4], fov: 48 }]], ease.out);
    shakeCam(s.stage, t, [{ fx: 'shake', at: 0.0, amp: 0.025, dur: info.dur }]);
  },
  overlay(g, t, info, s) {
    specks(g, t, clamp(0.4 + t / 2.0), { n: 3200, y1: 1150, seed: 11, hole: [400, 1050, 330, 520] });
    topCaption(g, t, [[['bigger', '#ffd25a'], ['than', '#ffffff']], [['CALIFORNIA', '#ff4a3a']]], { y: 300, size: 104, lead: 0.4 });
  },
});
// ---- s02 "Then it vanished." The sky clears in a blink; the swarm is gone. Farmer lowers his arm: "?"
registerShot('s02', { kind: '3d',
  init(T) { return farmScene(T); },
  draw(s, t, info) {
    const v = ease.inOut(prog(t, 0.05, 0.55)); s.env.darken((1 - v) * 0.85); s.env.update(t, 0.1); s.sw.update(t, { density: 1 - v, drift: [6, 2, -2] });
    s.stage.exposure = lerp(0.82, 1.02, v);
    s.f.rotation.y = 0.15; s.f.pose(addPose(mixPose(SHIELD, POSE.stand, ease.out(prog(t, 0.4, 0.9))), idle(t, 3, 0.4))); s.f.face(mixExpr(EXPR.shocked, { ...EXPR.suspicious, lid: 0.25, pupil: [0, 0.2] }, prog(t, 0.6, 0.9)), t);
    camMove(s.stage, t, [[0, { pos: [0.6, 1.7, 6.4], look: [0.2, 1.9, 0], fov: 40 }], [info.dur, { pos: [0.5, 1.7, 5.8], look: [0.2, 1.9, 0], fov: 40 }]]);
  },
  overlay(g, t, info, s) {
    specks(g, t + 2, clamp(0.9 - t / 0.4), { n: 3000, y1: 1100, seed: 11, dir: 3, hole: [560, 900, 330, 600] });
    topCaption(g, t + 1.0, [[['bigger', '#ffd25a'], ['than', '#ffffff']], [['CALIFORNIA', '#ff4a3a']]], { y: 300, size: 104, until: Math.max(0.01, 3.55 - info.shot.start) + 1.0, lead: 0.4 });
    reactions(g, t, s, [{ fx: 'question', on: 'f', at: 0.75, until: info.dur, scale: 0.9 }]);
    stamp(g, t, 'GONE?', { at: at(info, 'vanished', 0.5) + 0.1, x: 540, y: 1200, size: 90, color: '#ffffff', fill: '#2a1c15', rot: -0.07 });
  },
});
// ---- s03 "1875. Rocky Mountain locusts swept across the American West." Wide: a black swarm cloud rolls across the prairie.
registerShot('s03', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 50, shadowSize: 16, target: [0, 1, -8] });
    const env = prairie(st, { seed: 5, fieldZ: -8, fieldD: 18 });
    const sw = swarm(st, { count: 2600, center: [-30, 9, -30], size: [60, 12, 40], s: 0.42, seed: 9 });
    const f = farmer({ seed: 9 }); f.position.set(3, 0, 2); f.rotation.y = -2.6; f.scale.setScalar(0.9); st.add(f);
    return { stage: st, env, sw, f };
  },
  draw(s, t, info) {
    s.env.darken(0.15 + t * 0.06); s.env.update(t, 0.3); s.sw.update(t, { density: 1, drift: [9, -0.3, 2] });
    s.f.pose(addPose(point(POSE.stand, 'R', ease.out(prog(t, 0.4, 0.8)), { up: 0.4 }), idle(t, 2, 0.4))); s.f.face(EXPR.shocked, t);
    const cut = at(info, 'swept', 1.4) - 0.05;
    if (t < cut) camMove(s.stage, t, [[0, { pos: [6, 3.2, 12], look: [-6, 5, -20], fov: 52 }], [cut, { pos: [5.4, 3.0, 11], look: [-4, 5, -20], fov: 52 }]]);
    else camMove(s.stage, t - cut, [[0, { pos: [-2, 1.6, 4], look: [-8, 7, -26], fov: 48 }], [info.dur - cut, { pos: [-1.4, 1.5, 3.2], look: [-4, 7, -26], fov: 46 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#ffcf8a', tintAmount: 0.15 });
    stamp(g, t, '1875', { at: 0.05, x: 250, y: 330, size: 110, color: '#ffffff', fill: '#b8322a', rot: -0.1 });
    stamp(g, t, 'THE AMERICAN WEST', { at: at(info, 'American', 2.2) - 0.1, x: 540, y: 540, size: 66, color: '#2a1c15', fill: 'rgba(250,244,226,0.92)', rot: 0.05 });
  },
});
// ---- s04 + s05: the size card. Swarm blob grows to 198,000 SQ MI; then California drops in beside it, smaller.
function sizeCard(g, t, info, phase) {
  voidBg(g, '#2a3a52', '#101826');
  const R = 300; const grow = ease.outBack(clamp(t / 0.6));
  if (phase === 0) {
    const z = t < at(info, 'square', 2.6) - 0.05 ? 1 : 1.14; g.save(); g.translate(540, 900); g.scale(z, z); g.translate(-540, -900);
    drawSwarmBlob(g, 540, 900, R * grow, t);
    insT(g, 'ONE SWARM', 540, 380, 74, { color: '#ffffff', stroke: CARD_INK });
    const v = Math.round(198000 * ease.out(clamp((t - 0.2) / 1.2)));
    insT(g, `~${v.toLocaleString('en-US')} SQ MI`, 540, 1255, 96, { color: '#ffd25a', stroke: CARD_INK, maxW: 980 });
    g.restore();
  } else {
    // area-true: California 163,700 vs swarm 198,000 sq mi -> radius ratio sqrt(0.827) = 0.91 (California drawn by height to match area roughly)
    const drop = ease.outBack(clamp((t - 0.05) / 0.4));
    drawSwarmBlob(g, 540, 820, R * 1.0, t + 3);
    drawCalifornia(g, 540, 820 + (1 - drop) * -700, 560, { fill: 'rgba(242,194,48,0.9)' });
    insT(g, 'CALIFORNIA', 540, 820 + 360, 70, { color: '#ffd25a', stroke: CARD_INK, a: drop });
    insT(g, '163,700 SQ MI', 540, 820 + 440, 50, { color: '#ffffff', stroke: CARD_INK, a: drop });
    stamp(g, t, 'SWARM WINS', { at: at(info, 'California', 0.5) + 0.25, x: 540, y: 360, size: 92, color: '#ffffff', fill: '#d8342c', rot: -0.06 });
  }
}
registerShot('s04', { draw(g, t, info) { sizeCard(g, t, info, 0); } });
registerShot('s05', { draw(g, t, info) { sizeCard(g, t, info, 1); } });
// ---- s06 "Around twelve and a half trillion insects." Locusts fly past the camera; counter 12.5 TRILLION.
function flyScene(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: 44, shadowSize: 8, target: [0, 2, 0] });
  const env = prairie(st, { seed: 7, buildings: false, fieldZ: -10, fieldD: 30 });
  env.darken(0.45);
  const sw = swarm(st, { count: 2400, center: [0, 7, -18], size: [40, 9, 24], s: 0.3, seed: 2 });
  const L = []; for (let i = 0; i < (o.n ?? 9); i++) { const l = locust({ seed: 50 + i, scale: 1.0 + (i % 3) * 0.15, color: ['#9a8a3a', '#8a7a34', '#a8964a'][i % 3] }); st.add(l); L.push(l); }
  return { stage: st, env, sw, L };
}
function flyDraw(s, t, info, cam) {
  s.env.update(t, 0.5); s.sw.update(t, { density: 1, drift: [3, 0, 1] });
  s.L.forEach((l, i) => { const ph = i * 1.37; const x = ((i * 2.3 + t * (2.2 + (i % 3) * 0.6)) % 14) - 7, y = 1.6 + (i % 4) * 0.9 + Math.sin(t * 2 + ph) * 0.25, z = -1 - (i % 5) * 1.6;
    l.position.set(x, y, z); l.rotation.set(0, Math.PI / 2, Math.sin(t * 3 + ph) * 0.1); l.update(t, { flap: 1, spread: 1, lid: 0.25, look: [0.3, 0], ph, noShadow: true }); });
  camMove(s.stage, t, cam);
}
registerShot('s06', { kind: '3d',
  init(T) { return flyScene(T); },
  draw(s, t, info) { flyDraw(s, t, info, [[0, { pos: [0, 2.6, 6.5], look: [0, 3, -4], fov: 46 }], [info.dur, { pos: [0, 2.6, 5.6], look: [0, 3, -4], fov: 46 }]]); },
  overlay(g, t, info, s) {
    specks(g, t, 0.5, { n: 2400, y1: 900, seed: 21 });
    dimScene(g, 4, 0.35);
    drawInsert(g, { type: 'counter', title: 'AROUND', value: 12.5, from: 0, decimals: 1, suffix: '', lines: ['TRILLION INSECTS'], color: '#ffd25a' }, t);
    stamp(g, t, 'TRILLION', { at: at(info, 'trillion', 1.0) - 0.05, x: 540, y: 1180, size: 96, color: '#ffffff', fill: '#d8342c', rot: -0.05 });
  },
});
// ---- s07 "Guinness calls it the greatest concentration of animals ever recorded." The hero locust gets a medal, smug.
registerShot('s07', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 34, shadowSize: 5, target: [0, 1, 0] });
    const env = prairie(st, { seed: 8, fieldZ: -9, fieldD: 10 });
    const post = cyl(0.4, 0.45, 1.0, '#7a6448', 0, 0.5, 0, 12); st.add(post);
    const L = locust({ seed: 3, scale: 1.6, medal: true }); L.position.set(0, 1.0, 0); L.rotation.y = 0.35; st.add(L);
    return { stage: st, env, L };
  },
  draw(s, t, info) {
    s.env.update(t, 0.15);
    const puff = ease.outBack(prog(t, 0.3, 0.7));
    s.L.update(t, { puff, lid: lerp(0.2, 0.5, puff), look: [0, 0.05], headTurn: 0.25, headTilt: Math.sin(t * 2) * 0.05 });
    if (s.L.medal) s.L.medal.rotation.z = Math.sin(t * 3) * 0.15;
    const cut = at(info, 'animals', 2.0) - 0.1;
    if (t < cut) camMove(s.stage, t, [[0, { pos: [0.8, 2.0, 6.4], look: [0, 1.4, 0], fov: 34 }], [cut, { pos: [0.6, 1.95, 5.6], look: [0, 1.4, 0], fov: 34 }]]);
    else camMove(s.stage, t - cut, [[0, { pos: [0.4, 1.8, 4.2], look: [0, 1.55, 0], fov: 32 }], [info.dur - cut, { pos: [0.3, 1.8, 3.8], look: [0, 1.55, 0], fov: 32 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, RAYS);
    reactions(g, t, s, [{ fx: 'sparkle', on: 'L', at: 0.4, until: info.dur, scale: 0.55 }]);
    stamp(g, t, 'WORLD RECORD', { at: 0.05, x: 540, y: 330, size: 88, color: '#ffffff', fill: '#d8342c', rot: -0.06 });
    stamp(g, t, 'GREATEST CONCENTRATION', { at: at(info, 'greatest', 0.9) - 0.05, x: 540, y: 1250, size: 60, color: '#2a1c15', fill: 'rgba(250,244,226,0.94)', rot: 0.03 });
    stamp(g, t, 'OF ANIMALS EVER RECORDED', { at: at(info, 'animals', 1.6) - 0.05, x: 540, y: 1370, size: 52, color: '#2a1c15', fill: 'rgba(250,244,226,0.94)', rot: -0.02 });
  },
});
// ---- s08 "They ate crops, wood, leather..." Close on a fence post + a boot + wheat, locusts chewing; the wheat goes down.
registerShot('s08', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 6, target: [0, 0.6, 0] });
    const env = prairie(st, { seed: 12, wheat: false, buildings: false });
    const wf = wheatField(st, { w: 8, d: 3, z: -1.6, seed: 9, density: 14 });
    const post = cyl(0.16, 0.18, 1.5, '#8a6a48', -1.5, 0.75, 0.4, 10); st.add(post);
    const boot = new THREE.Group(); boot.add(rbox(0.36, 0.7, 0.4, '#6a3e22', 0, 0.35, 0, 0.1), rbox(0.36, 0.25, 0.75, '#6a3e22', 0, 0.12, 0.18, 0.1)); boot.position.set(1.4, 0, 0.7); boot.rotation.y = -0.5; st.add(boot);
    const L = [[-1.5, 1.1, 0.6, 0.5], [-1.5, 0.6, 0.62, -0.3], [1.4, 0.72, 0.9, 0.2], [1.6, 0.28, 1.05, -0.4], [0, 0.0, 0.6, 0], [-0.5, 0.0, 1.1, 0.6], [0.6, 0.0, 1.3, -0.5]].map(([x, y, z, ry], i) => { const l = locust({ seed: 70 + i, scale: 0.75 }); l.position.set(x, y, z); l.rotation.y = ry; st.add(l); return l; });
    return { stage: st, env, wf, L };
  },
  draw(s, t, info) {
    s.env.update(t, 0.1); s.wf.update(t, 0.1, ease.inOut(prog(t, 0.3, 1.6)) * 0.9);
    s.L.forEach((l, i) => l.update(t, { chew: 1, lid: 0.35, look: [0, -0.3], ph: i }));
    camMove(s.stage, t, [[0, { pos: [0, 1.5, 4.4], look: [0, 0.6, 0], fov: 42 }], [info.dur, { pos: [0, 1.3, 3.7], look: [0, 0.6, 0], fov: 42 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#ffcf8a' });
    stamp(g, t, 'CROPS', { at: at(info, 'crops', 0.3) - 0.05, x: 260, y: 340, size: 70, color: '#ffffff', fill: '#c98a1a', rot: -0.1 });
    stamp(g, t, 'WOOD', { at: at(info, 'wood', 0.8) - 0.05, x: 560, y: 470, size: 70, color: '#ffffff', fill: '#7a5232', rot: 0.06 });
    stamp(g, t, 'LEATHER', { at: at(info, 'leather', 1.3) - 0.05, x: 800, y: 330, size: 70, color: '#ffffff', fill: '#8a3e22', rot: -0.05 });
  },
});
// ---- s09 "even the clothes off people's backs." The farmer, deadpan; locusts all over his shirt (he's fine, the shirt isn't).
registerShot('s09', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 36, shadowSize: 6, target: [0, 1.5, 0] });
    const env = prairie(st, { seed: 3, fieldZ: -8 });
    const f = farmer({ seed: 7 }); f.position.set(0, 0, 0); st.add(f);
    const L = []; const spots = [[-0.32, 1.55, 0.36], [0.28, 1.4, 0.38], [0.0, 1.2, 0.42], [-0.2, 1.05, 0.4], [0.36, 1.75, 0.3], [-0.42, 1.8, 0.22], [0.12, 1.62, 0.42]];
    spots.forEach(([x, y, z], i) => { const l = locust({ seed: 90 + i, scale: 0.42 }); l.position.set(x, y, z); l.rotation.x = -1.3; l.rotation.z = (i % 2 ? 1 : -1) * 0.5; st.add(l); L.push(l); });
    return { stage: st, env, f, L };
  },
  draw(s, t, info) {
    s.env.update(t, 0.15);
    const look = ease.inOut(prog(t, 0.25, 0.6)), back = ease.inOut(prog(t, 1.1, 1.4));
    s.f.pose(addPose(POSE.stand, { ...idle(t, 4, 0.3), headNod: look * 0.5 * (1 - back) })); s.f.face(mixExpr(mixExpr(EXPR.neutral, EXPR.shocked, look), { ...EXPR.deadpan, lid: 0.35, pupil: [0, 0] }, back), t);
    s.L.forEach((l, i) => l.update(t, { chew: 1, lid: 0.3, ph: i, noShadow: true, legs: 0 }));
    camMove(s.stage, t, [[0, { pos: [0, 2.0, 4.4], look: [0, 1.7, 0], fov: 36 }], [info.dur, { pos: [0, 2.0, 3.7], look: [0, 1.75, 0], fov: 36 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#ffcf8a' });
    reactions(g, t, s, [{ fx: 'sweat', on: 'f', at: 1.2 }]);
    stamp(g, t, 'EVEN CLOTHES', { at: at(info, 'clothes', 0.6) - 0.05, x: 540, y: 330, size: 84, color: '#ffffff', fill: '#d8342c', rot: -0.06 });
  },
});
// ---- s10 "But less than thirty years later..." Time-lapse on the same farm: sun races, clouds fly, the field regrows.
registerShot('s10', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'sunny', fov: 46, shadowSize: 12, target: [0, 1, -6] }); const env = prairie(st, { seed: 3, fieldZ: -6 }); return { stage: st, env }; },
  draw(s, t, info) {
    s.env.update(t * 25, 0.12); s.env.sky.update(t * 60);
    camMove(s.stage, t, [[0, { pos: [0, 2.6, 9], look: [0, 3, -10], fov: 48 }], [info.dur, { pos: [0, 2.8, 8], look: [0, 3.2, -10], fov: 48 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, RAYS);
    const y = Math.round(lerp(1875, 1904, ease.inOut(clamp(t / Math.max(0.5, info.dur - 0.3)))));
    stamp(g, t, 'BUT...', { at: 0.0, x: 540, y: 320, size: 100, color: '#ffffff', fill: '#2a1c15', rot: -0.05 });
    insT(g, String(y), 540, 560, 170, { color: '#ffd25a', stroke: CARD_INK });
    stamp(g, t, '< 30 YEARS LATER', { at: at(info, 'thirty', 0.8) - 0.05, x: 540, y: 1220, size: 70, color: '#2a1c15', fill: 'rgba(250,244,226,0.94)', rot: 0.04 });
  },
});
// ---- s11 "they were gone." Empty, quiet field. A tumbleweed rolls past. Not one locust.
registerShot('s11', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 44, shadowSize: 10, target: [0, 0.6, 0] });
    const env = prairie(st, { seed: 6, fieldZ: -9 });
    const tw = new THREE.Group(); const r = (i) => (Math.sin(i * 12.9898) * 43758.5453) % 1; for (let i = 0; i < 14; i++) { const c = cyl(0.02, 0.02, 1.0, '#a8865a', 0, 0, 0, 4); c.rotation.set(i * 1.3, i * 0.7, i * 2.1); tw.add(c); }
    tw.add(ball(0.35, '#b8966a', 0, 0, 0, 8)); tw.children[tw.children.length - 1].material.transparent = true; tw.children[tw.children.length - 1].material.opacity = 0.0;
    st.add(tw); return { stage: st, env, tw };
  },
  draw(s, t, info) {
    s.env.update(t, 0.2);
    const x = lerp(-6, 6, t / info.dur); s.tw.position.set(x, 0.45 + Math.abs(Math.sin(t * 4)) * 0.3, 1.0); s.tw.rotation.z = -t * 5;
    camMove(s.stage, t, [[0, { pos: [0, 1.0, 6.5], look: [0, 1.6, -5], fov: 46 }], [info.dur, { pos: [0, 1.1, 6.0], look: [0, 1.7, -5], fov: 46 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#ffe0b0', tintAmount: 0.15 });
    stamp(g, t, 'GONE', { at: at(info, 'gone', 0.5) - 0.05, x: 540, y: 420, size: 140, color: '#d8342c', rot: -0.1 });
  },
});
// ---- s12 "The last one ever collected was found in 1904." A specimen box: one pinned locust, label 1904 · COLORADO.
registerShot('s12', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'warm', fov: 34, shadowSize: 4, target: [0, 1.6, 0], bg: ['#3a2a22', '#1a1210'] });
    const wall = rbox(10, 8, 0.2, '#4a3a30', 0, 2, -0.4, 0.02); st.add(wall);
    const box = specimenBox({ label: '1904 · COLORADO' }); box.position.set(0, 1.8, 0); st.add(box);
    return { stage: st, box };
  },
  draw(s, t, info) {
    const cut = at(info, '1904', 1.8) - 0.1;
    if (t < cut) camMove(s.stage, t, [[0, { pos: [0.2, 1.8, 5.2], look: [0, 1.75, 0], fov: 34 }], [cut, { pos: [0.1, 1.8, 4.6], look: [0, 1.75, 0], fov: 34 }]]);
    else camMove(s.stage, t - cut, [[0, { pos: [0.3, 2.2, 2.6], look: [0, 2.15, 0], fov: 32 }], [info.dur - cut, { pos: [0.25, 2.2, 2.35], look: [0, 2.15, 0], fov: 32 }]]);
  },
  overlay(g, t, info, s) {
    stamp(g, t, 'THE LAST ONE', { at: 0.05, x: 540, y: 330, size: 84, color: '#ffffff', fill: '#2a1c15', rot: -0.05 });
    stamp(g, t, '1904', { at: at(info, '1904', 1.8) + 0.05, x: 540, y: 520, size: 120, color: '#ffd25a', fill: '#2a1c15', rot: 0.05 });
  },
});
// ---- s13 "So what wiped out trillions of locusts?" The empty farm, the farmer scratches his head; a giant "?"
registerShot('s13', { kind: '3d',
  init(T) { const s = farmScene(T); return s; },
  draw(s, t, info) {
    s.env.update(t, 0.12); s.sw.update(t, { density: 0 });
    s.f.rotation.y = 0.1; s.f.pose(addPose(point(POSE.stand, 'R', 1, { up: 1.6, across: 0.4 }), { ...idle(t, 4, 0.4), elbowR: 2.2, headTilt: 0.15 + Math.sin(t * 2) * 0.05 })); s.f.face({ ...EXPR.suspicious, lid: 0.22, pupil: [0.3, 0.5] }, t);
    camMove(s.stage, t, [[0, { pos: [0, 1.8, 7.4], look: [0.2, 1.6, 0], fov: 40 }], [info.dur, { pos: [0, 1.8, 6.6], look: [0.2, 1.6, 0], fov: 40 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#ffcf8a' });
    const k = ease.outBack(clamp((t - 0.1) / 0.35)); g.save(); g.translate(540, 470); g.scale(k, k); g.rotate(Math.sin(t * 3) * 0.06); insT(g, '?', 0, 0, 380, { color: '#ffd25a', stroke: CARD_INK }); g.restore();
    stamp(g, t, 'WHAT WIPED THEM OUT?', { at: at(info, 'wiped', 0.6) - 0.1, x: 540, y: 1180, size: 62, color: '#ffffff', fill: '#d8342c', rot: -0.04 });
  },
});
// ---- s14 "One theory: farmers." Push-in on the farmer; he slowly turns to the lens. Stamp THEORY.
registerShot('s14', { kind: '3d',
  init(T) { return farmScene(T); },
  draw(s, t, info) {
    s.env.update(t, 0.1); s.sw.update(t, { density: 0 });
    const turn = ease.inOut(prog(t, at(info, 'farmers', 0.8) - 0.1, at(info, 'farmers', 0.8) + 0.35));
    s.f.rotation.y = lerp(0.9, 0.05, turn); s.f.pose(addPose(POSE.handsHips, idle(t, 4, 0.3))); s.f.face(mixExpr({ ...EXPR.neutral, lid: 0.2 }, { ...EXPR.suspicious, lid: 0.32, pupil: [0, 0] }, turn), t);
    camMove(s.stage, t, [[0, { pos: [0.2, 1.9, 6.6], look: [0.2, 1.8, 0], fov: 38 }], [info.dur, { pos: [0.1, 2.0, 4.6], look: [0.2, 1.95, 0], fov: 36 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#ffcf8a' });
    stamp(g, t, 'ONE THEORY', { at: 0.05, x: 540, y: 330, size: 84, color: '#2a1c15', fill: 'rgba(250,244,226,0.94)', rot: -0.05 });
    stamp(g, t, 'FARMERS?', { at: at(info, 'farmers', 0.8) - 0.05, x: 540, y: 1220, size: 100, color: '#ffffff', fill: '#d8342c', rot: 0.05 });
  },
});
// ---- s15 "The locusts bred near streams and rivers in the Rockies." Aerial over a river valley; sandy banks glow (breeding grounds).
registerShot('s15', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'sunny', fov: 50, shadowSize: 30, target: [0, 0, -10] }); const env = valley(st, { seed: 9 }); return { stage: st, env }; },
  draw(s, t, info) { s.env.update(t); camMove(s.stage, t, [[0, { pos: [-4, 16, 22], look: [2, 0, -12], fov: 50 }], [info.dur, { pos: [-2, 12, 16], look: [2, 0, -12], fov: 48 }]]); },
  overlay(g, t, info, s) {
    sunnyLook(g, t, RAYS);
    stamp(g, t, 'THE ROCKIES', { at: 0.05, x: 540, y: 330, size: 84, color: '#ffffff', fill: '#2f6a8a', rot: -0.05 });
    const k = clamp((t - (at(info, 'streams', 1.0) - 0.1)) / 0.4); if (k > 0) { g.save(); g.globalAlpha = k * (0.6 + 0.3 * Math.sin(t * 6)); g.strokeStyle = '#ffd25a'; g.lineWidth = 12; g.setLineDash([26, 18]); g.beginPath(); g.ellipse(560, 1060, 250, 120, -0.2, 0, 6.28); g.stroke(); g.restore();
      insT(g, 'BREEDING GROUNDS', 560, 1230, 62, { color: '#ffd25a', stroke: CARD_INK, a: k }); }
  },
});
// ---- s16 "Settlers plowed, irrigated and ran cattle on that exact land..." A settler walks a plow along the bank; cows graze; a ditch runs water.
registerShot('s16', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 44, shadowSize: 10, target: [2, 0.5, -4] });
    const env = valley(st, { seed: 9 });
    const f = farmer({ seed: 5, shirt: '#b8573a' }); st.add(f);
    const plow = new THREE.Group(); plow.add(rbox(0.12, 0.12, 1.4, '#7a5a32', 0, 0.7, -0.4, 0.03)); const blade = rbox(0.5, 0.35, 0.2, '#6a6a72', 0, 0.12, -1.05, 0.05); blade.rotation.x = 0.6; plow.add(blade); st.add(plow);
    const furrow = rbox(0.6, 0.04, 12, '#7a5a36', 0, 0.02, 0, 0.01); st.add(furrow);
    const cows = [[11.5, -4, 0.4], [13.5, -7, -0.8], [10.5, -9, 2.4]].map(([x, z, ry], i) => { const c = cow(); c.position.set(x, 0, z); c.rotation.y = ry; st.add(c); return c; });
    const ditch = rbox(0.5, 0.03, 10, '#5aa8d8', 7.4, 0.03, -4, 0.01); ditch.material = ditch.material.clone(); st.add(ditch);
    return { stage: st, env, f, plow, furrow, cows };
  },
  draw(s, t, info) {
    s.env.update(t); const z = lerp(3, -0.5, t / info.dur);
    s.f.position.set(8.6, 0, z + 1.6); s.f.rotation.y = Math.PI; s.f.pose(addPose(walk(t, { speed: 1.4 }), { armL: [1.0, 0.1, 0], armR: [1.0, 0.1, 0], elbowL: 0.3, elbowR: 0.3, lean: 0.25 })); s.f.face(EXPR.deadpan, t);
    s.plow.position.set(8.6, 0, z + 0.4); s.plow.rotation.y = 0;
    s.furrow.scale.z = 1; s.furrow.position.set(8.6, 0.02, z + 6.5);
    s.cows.forEach((c, i) => c.update(t, i));
    const cut = at(info, 'cattle', 2.0) - 0.08;
    if (t < cut) camMove(s.stage, t, [[0, { pos: [5.5, 3.6, 12.5], look: [9.5, 1.2, -1], fov: 46 }], [cut, { pos: [5.7, 3.4, 11.5], look: [9.5, 1.2, -2], fov: 46 }]]);
    else camMove(s.stage, t - cut, [[0, { pos: [11.0, 1.9, 0.6], look: [12, 1.1, -6], fov: 44 }], [info.dur - cut, { pos: [11.2, 1.85, -0.1], look: [12, 1.1, -6], fov: 44 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#ffcf8a' });
    stamp(g, t, 'PLOWED', { at: at(info, 'plowed', 0.3) - 0.05, x: 250, y: 320, size: 66, color: '#ffffff', fill: '#7a5232', rot: -0.1 });
    stamp(g, t, 'IRRIGATED', { at: at(info, 'irrigated', 0.8) - 0.05, x: 640, y: 440, size: 66, color: '#ffffff', fill: '#2f7ab8', rot: 0.05 });
    stamp(g, t, 'CATTLE', { at: at(info, 'cattle', 1.4) - 0.05, x: 820, y: 300, size: 66, color: '#ffffff', fill: '#3a7a3a', rot: -0.06 });
  },
});
// ---- s17 "...and probably destroyed the eggs." Soil cross-section: the plow passes, the egg pods break up. Stamp PROBABLY.
registerShot('s17', {
  draw(g, t, info) {
    voidBg(g, '#4a3a2a', '#1a120c');
    const e0 = at(info, 'destroyed', 0.8) - 0.5;
    soilSection(g, t, { plow: clamp((t - e0) / 1.4), title: 'EGG PODS' });
    stamp(g, t, 'PROBABLY', { at: at(info, 'probably', 0.3) - 0.05, x: 540, y: 330, size: 100, color: '#ffffff', fill: '#d8342c', rot: -0.06 });
  },
});
// ---- s18 "Today, their remains are still found..." Wide: a glacier high in the mountains. GRASSHOPPER GLACIER, MONTANA.
registerShot('s18', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'day', fov: 48, shadowSize: 30, target: [0, 0, -16] }); const env = glacier(st); return { stage: st, env }; },
  draw(s, t, info) { s.env.update(t); camMove(s.stage, t, [[0, { pos: [0, 5, 16], look: [0, 6, -40], fov: 50 }], [info.dur, { pos: [0, 4.5, 12], look: [0, 5, -40], fov: 48 }]]); },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: { from: [-70, -60], strength: 0.5 }, tint: '#d8ecff', tintAmount: 0.18 });
    stamp(g, t, 'TODAY', { at: 0.05, x: 540, y: 330, size: 90, color: '#ffffff', fill: '#2f6a8a', rot: -0.05 });
  },
});
// ---- s19 PAYOFF "frozen inside a glacier in Montana." A locust frozen in the ice; then the camera tilts up into the sky (-> s01).
registerShot('s19', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'day', fov: 36, shadowSize: 6, target: [0, 1.2, 0] });
    const env = glacier(st);
    const L = locust({ seed: 3, scale: 1.05, color: '#7a7a52' }); L.position.set(0.1, 0.6, 0.1); L.rotation.y = 0.45; L.update(0, { lid: 0.75, blink: false, noShadow: true }); st.add(L);
    const L2 = locust({ seed: 8, scale: 0.65, color: '#6a6a4a' }); L2.position.set(-0.9, 1.4, -0.3); L2.rotation.set(0.4, -0.6, 0.3); L2.update(0, { lid: 1, blink: false, noShadow: true }); st.add(L2);
    const ice = iceBlock(3.4, 2.6, 1.8); ice.position.set(0, 0, 0); st.add(ice);
    return { stage: st, env, L, ice };
  },
  draw(s, t, info) {
    s.env.update(t);
    const up = ease.inOut(prog(t, info.dur - 0.9, info.dur));
    camMove(s.stage, t, [[0, { pos: [0.8, 2.0, 7.4], look: [0, 1.3, 0], fov: 36 }], [info.dur - 0.9, { pos: [0.5, 1.8, 6.0], look: [0, 1.3, 0], fov: 36 }]]);
    if (up > 0) { const p = s.stage.camera.position; s.stage.cam([p.x, p.y + up * 0.6, p.z], [0, 1.3 + up * 30, -20 * up], lerp(36, 50, up)); }
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#d8ecff', tintAmount: 0.2 });
    const out = clamp((info.dur - 0.9 - t) / 0.2);
    stamp(g, t, 'GRASSHOPPER GLACIER', { at: at(info, 'glacier', 0.5) - 0.1, until: info.dur - 0.7, x: 540, y: 330, size: 70, color: '#ffffff', fill: '#2f6a8a', rot: -0.05 });
    stamp(g, t, 'MONTANA', { at: at(info, 'Montana', 1.2) - 0.05, until: info.dur - 0.7, x: 540, y: 470, size: 80, color: '#2a1c15', fill: 'rgba(250,244,226,0.94)', rot: 0.05 });
    reactions(g, t, s, [{ fx: 'sparkle', on: 'L', at: 0.2, until: info.dur - 0.8, scale: 0.8 }]);
  },
});
