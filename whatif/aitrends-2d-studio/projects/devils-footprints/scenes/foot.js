// The Devil's Footprints — 17 shots, Toon 3D + BEANMEN effects. Mystery, deadpan. "Reported" framing kept; no scary devil.
import { registerShot } from '/engine/core.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, point, shrug, tremble, nod } from '/kits/toon3d/rig.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { drawInsert, dimScene } from '/kits/toon3d/insert.js';
import {
  at, THREE, snowStage, snowGround, cottage, stoneWall, haystack, river, drainpipe, pine, trail, roofSurf, wallSurf, stackSurf, pipeSkip,
  villager, vicar, lantern, badger, mouse, kangaroo, balloon, snowfall, stars, vignette, hookText, stamp, ruler, devonMap, newspaper,
  camMove, rbox, cyl, ball, plane, floor, toon, canvasTex, blob, outline, clamp, lerp, ease, prog, rng, noise, insT, CARD_INK,
} from './_lib.js';

// piecewise-linear keyframes [[t, v], ...]
const kf = (t, keys) => { if (t <= keys[0][0]) return keys[0][1]; for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const [t0, v0] = keys[i - 1], [t1, v1] = keys[i]; return lerp(v0, v1, (t - t0) / (t1 - t0)); } return keys[keys.length - 1][1]; };
const nightLook = (g, t, o = {}) => { stars(g, t, { n: o.stars ?? 60, h: 0.3 }); snowfall(g, t, { k: o.snow ?? 0.6, seed: o.seed || 11 }); vignette(g, o.vig ?? 0.5); };
const dawnLook = (g, t, o = {}) => { vignette(g, o.vig ?? 0.28, '40,50,90'); };

// ---------------------------------------------------------------- HERO SET: a cottage at night, the trail coming over its roof toward us.
// s01 (frame 1) and s17 (payoff) share it; s17 ends on s01's opening framing with the prints snowed over -> loop.
function heroSet(T) {
  const { st, moon } = snowStage(T, 'night', { fov: 40, shadowSize: 14, target: [0, 1, -3], moonPos: [-16, 26, -70] });
  snowGround(st, { seed: 5 });
  const h = cottage({ w: 3.8, d: 4.6, h: 2.2, thatch: '#9a7448' }); h.position.set(0, 0, -3); h.rotation.y = Math.PI / 2; st.add(h);
  const h2 = cottage({ w: 4, d: 5, h: 2.4, wall: '#e6dcc8', thatch: '#8a6a42', seed: 2 }); h2.position.set(-8, 0, -9); h2.rotation.y = 0.4; st.add(h2);
  const h3 = cottage({ w: 4, d: 4.5, h: 2.3, wall: '#f0e8d8', lit: false }); h3.position.set(8.5, 0, -11); h3.rotation.y = -0.5; st.add(h3);
  for (const [x, z, s] of [[-4.5, 1, 1.1], [5, -1, 1.3], [-6, -4, 0.9]]) { const p = pine(s); p.position.set(x, 0, z); st.add(p); }
  const tr = trail(st, { from: [0.5, -20], to: [0.5, 8], surfaces: [roofSurf(h)] });
  return { stage: st, h, tr, moon };
}
const HERO0 = { pos: [4.0, 7.0, 13.0], look: [0.2, 1.6, -3.5], fov: 54 }, HERO1 = { pos: [3.4, 6.4, 11.4], look: [0.2, 1.8, -3.5], fov: 52 };

// s01 — HOOK. Prints already appearing, walking toward us straight over the cottage roof. Top caption "1855 / ...roof".
registerShot('s01', { kind: '3d',
  init(T) { return heroSet(T); },
  draw(s, t, info) {
    s.tr.reveal(kf(t, [[0, 0.56], [info.dur, 0.9]])); s.tr.cover(0);
    const cut = at(info, 'hoofprints.', 2.4) - 0.12;
    if (t < cut) camMove(s.stage, t, [[0, HERO0], [cut, HERO1]], ease.out);
    else camMove(s.stage, t - cut, [[0, { pos: [2.6, 3.2, 8.5], look: [0.4, 0.4, 2.0], fov: 50 }], [info.dur - cut, { pos: [2.4, 3.0, 8.0], look: [0.4, 0.4, 2.5], fov: 50 }]]);
  },
  overlay(g, t, info, s) {
    nightLook(g, t, { snow: 0.35 });
    hookText(g, t, ['1855', 'it walked over the roof'], { y: 270, ys: [0, 140], sizes: [140, 74], colors: ['#ffd25a', '#ffffff'], words: { roof: '#ff5a4a' }, lead: 0.3 });
  },
});

// s02 — "Devon, England." Wide snowy village at night, snow falling.
function village(T, mode = 'night') {
  const { st, moon } = snowStage(T, mode, { fov: 42, shadowSize: 20, target: [0, 1, -8], moonPos: [12, 24, -70] });
  snowGround(st, { seed: 3, trees: 18 });
  const hs = [[-6, -6, 0.3, '#efe6d2'], [-1, -10, -0.1, '#e6dcc8'], [5, -7, -0.4, '#f0e8d8'], [10, -14, -0.2, '#efe6d2'], [-11, -14, 0.5, '#e6dcc8'], [2, -18, 0.1, '#f2ead8']].map(([x, z, r, c], i) => { const h = cottage({ w: 3.6 + (i % 2), d: 4.4, h: 2.3, wall: c, lit: mode === 'night' }); h.position.set(x, 0, z); h.rotation.y = r; st.add(h); return h; });
  const ch = rbox(1.6, 6, 1.6, '#9a948a', -4, 3, -22, 0.05); st.add(ch); const sp = new THREE.Mesh(new THREE.ConeGeometry(1.3, 3.5, 4), toon('#8a847a')); sp.position.set(-4, 7.7, -22); sp.rotation.y = Math.PI / 4; st.add(sp); outline(ch, { px: 2 }); outline(sp, { px: 2 });
  return { stage: st, hs, moon };
}
registerShot('s02', { kind: '3d',
  init(T) { return village(T, 'night'); },
  draw(s, t, info) { camMove(s.stage, t, [[0, { pos: [0, 7, 14], look: [0, 1.8, -10], fov: 44 }], [info.dur, { pos: [0, 6.2, 11.5], look: [0, 1.8, -10], fov: 44 }]]); },
  overlay(g, t, info, s) {
    nightLook(g, t, { snow: 0.9 });
    stamp(g, t, 'DEVON, ENGLAND', { at: 0.05, x: 540, y: 330, size: 78, color: '#ffffff', fill: 'rgba(30,40,80,0.85)', rot: -0.05 });
  },
});

// s03 — "One February night, after heavy snow." Close on a lit cottage window, heavy snow; FEB 1855 stamp.
registerShot('s03', { kind: '3d',
  init(T) {
    const { st } = snowStage(T, 'night', { fov: 34, shadowSize: 8, target: [0, 1.5, 0], moon: false });
    snowGround(st, { seed: 6, trees: 6 });
    const h = cottage({ w: 4.4, d: 5, h: 2.6 }); h.position.set(0, 0, -2.5); st.add(h);
    return { stage: st, h };
  },
  draw(s, t, info) { camMove(s.stage, t, [[0, { pos: [-2.4, 2.4, 5.4], look: [-0.6, 2.0, 0], fov: 36 }], [info.dur, { pos: [-2.0, 2.3, 4.4], look: [-0.6, 2.0, 0], fov: 34 }]]); },
  overlay(g, t, info, s) {
    nightLook(g, t, { snow: 2.4, stars: 0, seed: 5, vig: 0.55 });
    stamp(g, t, 'FEB 1855', { at: at(info, 'February', 0.4) - 0.1, x: 540, y: 340, size: 96, color: '#ffd25a', fill: 'rgba(30,40,80,0.85)', rot: -0.08 });
  },
});

// s04 — "By morning, hoof-like prints ran through the snow, mostly in single file." Dawn: a villager opens the door and finds
// a single-file trail passing the doorstep. Punch-in low along the trail at "single".
registerShot('s04', { kind: '3d',
  init(T) {
    const { st } = snowStage(T, 'dawn', { fov: 38, shadowSize: 10, target: [0, 1, 0] });
    snowGround(st, { seed: 8 });
    const h = cottage({ w: 4.4, d: 5, h: 2.6, lit: false }); h.position.set(-1.0, 0, -4); st.add(h);
    const v = villager({ seed: 7, coat: '#5a4a6a', scarf: '#c0392b', head: 'beanie', headColor: '#2f5a8a' }); v.position.set(-1.0, 0, -0.9); st.add(v);
    const tr = trail(st, { from: [-14, 1.4], to: [14, 1.4] });
    for (const [x, z, s2] of [[5, -6, 1.2], [-6.5, -7, 1], [7.5, -3, 0.9]]) { const p = pine(s2); p.position.set(x, 0, z); st.add(p); }
    return { stage: st, h, v, tr };
  },
  draw(s, t, info) {
    s.tr.reveal(1);
    const look = prog(t, 0.6, 1.0), shock = prog(t, at(info, 'prints', 1.3), at(info, 'prints', 1.3) + 0.25);
    s.v.pose(addPose(mixPose(POSE.stand, POSE.panic, shock * 0.6), { ...idle(t, 4, 0.4), headNod: lerp(0, 0.5, look), lean: look * 0.15 }));
    s.v.face(mixExpr(EXPR.bored, EXPR.shocked, shock), t);
    const cut = at(info, 'single', 2.6) - 0.15;
    if (t < cut) camMove(s.stage, t, [[0, { pos: [1.5, 3.2, 8.5], look: [-0.6, 1.4, -0.5], fov: 40 }], [cut, { pos: [1.2, 3.0, 7.4], look: [-0.6, 1.4, -0.5], fov: 40 }]]);
    else camMove(s.stage, t - cut, [[0, { pos: [7.5, 0.9, 1.6], look: [-2, 0.2, 1.2], fov: 40 }], [info.dur - cut, { pos: [6.8, 0.8, 1.5], look: [-2, 0.2, 1.2], fov: 38 }]]);
  },
  overlay(g, t, info, s) {
    dawnLook(g, t);
    reactions(g, t, s, [{ fx: 'exclaim', on: s.v, at: at(info, 'prints', 1.3) + 0.05, until: at(info, 'single', 2.6) - 0.15, color: '#ff3b30' }]);
    stamp(g, t, 'BY MORNING', { at: 0.05, x: 300, y: 300, size: 62, color: '#2a3a6a', fill: 'rgba(255,255,255,0.85)', rot: -0.1, until: at(info, 'single', 2.6) - 0.15 });
    if (t > at(info, 'single', 2.6) - 0.15) stamp(g, t, 'SINGLE FILE', { at: at(info, 'single', 2.6) - 0.05, x: 540, y: 420, size: 80, color: '#ffffff', fill: '#2a3a6a', rot: -0.05 });
  },
});

// s05 — "Each about 4 inches long." Macro on one print in the snow + a ruler. "ABOUT 4 IN".
registerShot('s05', { kind: '3d',
  init(T) {
    const { st } = snowStage(T, 'dawn', { fov: 30, shadowSize: 4, target: [0, 0, 0] });
    snowGround(st, { seed: 2, trees: 0 });
    const tr = trail(st, { from: [0, 6], to: [0, -6], step: 0.6, size: 0.42 }); tr.reveal(1);
    return { stage: st, tr };
  },
  draw(s, t, info) { camMove(s.stage, t, [[0, { pos: [0.0, 2.3, 1.5], look: [0.0, 0, 0], fov: 32 }], [info.dur, { pos: [0.0, 1.9, 1.2], look: [0.0, 0, 0], fov: 30 }]]); },
  overlay(g, t, info, s) {
    dawnLook(g, t, { vig: 0.35 });
    ruler(g, t, { at: 0.15, x: 260, y: 900, len: 520, rot: -0.04 });
    stamp(g, t, 'ABOUT 4 INCHES', { at: at(info, '4', 0.5) - 0.1, x: 540, y: 380, size: 80, color: '#ffffff', fill: '#2a3a6a', rot: -0.05 });
  },
});

// s06 — "Reported in more than 30 places." Devon map: Exmouth, Topsham, Dawlish, Teignmouth + dots; "30+ PLACES".
registerShot('s06', {
  draw(g, t, info) {
    const gr = g.createLinearGradient(0, 0, 0, 1920); gr.addColorStop(0, '#1b2a5c'); gr.addColorStop(1, '#0b1230'); g.fillStyle = gr; g.fillRect(0, 0, 1080, 1920);
    snowfall(g, t, { k: 0.5, seed: 9 });
    devonMap(g, t, { dotsAt: 0.25, dotsDur: Math.max(0.8, at(info, 'places.', 1.4) - 0.2), count: '30+ PLACES', countAt: at(info, '30', 1.0) - 0.1 });
  },
});

// s07 — "But here's the part..." A villager in the lane looks up... at the roof. Slow push, held beat.
registerShot('s07', { kind: '3d',
  init(T) {
    const { st } = snowStage(T, 'dawn', { fov: 36, shadowSize: 10, target: [0, 2, -2] });
    snowGround(st, { seed: 4 });
    const h = cottage({ w: 3.8, d: 4.6, h: 2.2, lit: false }); h.position.set(0, 0, -4); h.rotation.y = Math.PI / 2; st.add(h);
    const tr = trail(st, { from: [0.5, -20], to: [0.5, 7], surfaces: [roofSurf(h)] }); tr.reveal(1);
    const v = villager({ seed: 9, coat: '#6a4a3a', scarf: '#2f6a3a', head: 'cap', skin: 'light' }); v.position.set(-2.2, 0, 3.2); v.rotation.y = Math.PI * 0.9; st.add(v);
    return { stage: st, h, tr, v };
  },
  draw(s, t, info) {
    const up = ease.inOut(prog(t, 0.2, 0.8));
    s.v.pose(addPose(POSE.stand, { ...idle(t, 2, 0.3), headNod: -up * 0.55 })); s.v.face(mixExpr(EXPR.neutral, EXPR.suspicious, up), t);
    camMove(s.stage, t, [[0, { pos: [-6.0, 1.6, 11.5], look: [-0.8, 2.6, -2], fov: 50 }], [info.dur, { pos: [-5.4, 1.4, 10.2], look: [-0.6, 2.9, -2.5], fov: 48 }]]);
  },
  overlay(g, t, info, s) { dawnLook(g, t); reactions(g, t, s, [{ fx: 'question', on: s.v, at: 0.5, until: info.dur, scale: 0.9 }]); },
});

// s08 — "the trail went straight over houses, walls and haystacks." Camera tracks the trail as it walks away from us:
// over a cottage roof (on "houses"), along the top of a stone wall ("walls"), up and over a haystack ("haystacks").
registerShot('s08', { kind: '3d',
  init(T) {
    const { st } = snowStage(T, 'dawn', { fov: 42, shadowSize: 16, target: [0, 1, -10] });
    snowGround(st, { seed: 12 });
    const h = cottage({ w: 3.8, d: 4.6, h: 2.2, lit: false }); h.position.set(0, 0, -3); h.rotation.y = Math.PI / 2; st.add(h);
    const w = stoneWall({ len: 10, h: 1.1 }); w.position.set(0, 0, -11); w.rotation.y = 0; st.add(w);   // runs along Z: the trail walks along its top
    const hy = haystack({ r: 1.5, h: 1.7 }); hy.position.set(0, 0, -19.5); st.add(hy);
    const hy2 = haystack({ r: 1.2, h: 1.4 }); hy2.position.set(4, 0, -21); st.add(hy2);
    for (const [x, z, s2] of [[-5, -8, 1.2], [5, -12, 1], [-4, -18, 1.3]]) { const p = pine(s2); p.position.set(x, 0, z); st.add(p); }
    const tr = trail(st, { from: [0, 5], to: [0, -26], surfaces: [roofSurf(h), wallSurf(w), stackSurf(hy)] });
    return { stage: st, h, w, hy, tr };
  },
  draw(s, t, info) {
    const L = s.tr.len, z2k = (z) => (5 - z) / L;
    const tH = at(info, 'houses,', 1.2), tW = at(info, 'walls', 1.9), tS = at(info, 'haystacks.', 2.6);
    const k = kf(t, [[0, z2k(1.5)], [tH + 0.2, z2k(-5.5)], [tW + 0.25, z2k(-12.5)], [tS + 0.3, z2k(-21)], [info.dur, z2k(-24)]]);
    s.tr.reveal(k); const hp = s.tr.head(k);
    camMove(s.stage, 0, [[0, { pos: [4.5, 7.5, hp.z + 11.5], look: [0, 1.4, hp.z - 2.5], fov: 52 }]]);
  },
  overlay(g, t, info, s) {
    dawnLook(g, t);
    const tH = at(info, 'houses,', 1.2), tW = at(info, 'walls', 1.9), tS = at(info, 'haystacks.', 2.6);
    stamp(g, t, 'HOUSES', { at: tH - 0.05, x: 300, y: 330, size: 66, color: '#ffffff', fill: '#2a3a6a', rot: -0.08 });
    stamp(g, t, 'WALLS', { at: tW - 0.05, x: 760, y: 430, size: 66, color: '#ffffff', fill: '#2a3a6a', rot: 0.06 });
    stamp(g, t, 'HAYSTACKS', { at: tS - 0.05, x: 470, y: 540, size: 66, color: '#ffffff', fill: '#b8322a', rot: -0.04 });
  },
});

// s09 — "Over rivers." Prints run straight across a frozen river.
registerShot('s09', { kind: '3d',
  init(T) {
    const { st } = snowStage(T, 'dawn', { fov: 40, shadowSize: 12, target: [0, 0, -2] });
    snowGround(st, { seed: 14 });
    const rv = river({ w: 4, len: 80 }); rv.position.set(0, 0, -20); st.add(rv);
    const tr = trail(st, { from: [-12, 0], to: [12, 0] });
    tr.prints.forEach(p => { if (Math.abs(p.m.position.x) < 2.1) p.m.position.y = -0.0; });
    for (const [x, z, s2] of [[-6, -5, 1.2], [6, -7, 1], [7, 1.5, 0.9]]) { const p = pine(s2); p.position.set(x, 0, z); st.add(p); }
    return { stage: st, tr };
  },
  draw(s, t, info) { s.tr.reveal(kf(t, [[0, 0.25], [info.dur, 0.8]])); camMove(s.stage, t, [[0, { pos: [-1.2, 6.5, 9.5], look: [0, 0, -1.5], fov: 54 }], [info.dur, { pos: [-0.8, 6.0, 8.5], look: [0.4, 0, -1.5], fov: 52 }]]); },
  overlay(g, t, info, s) { dawnLook(g, t); stamp(g, t, 'RIVERS', { at: 0.05, x: 540, y: 340, size: 76, color: '#ffffff', fill: '#2a5a8a', rot: -0.05 }); },
});

// s10 — "Across snowy rooftops." A terrace of three cottages, the trail runs across all three roofs. High angle.
registerShot('s10', { kind: '3d',
  init(T) {
    const { st } = snowStage(T, 'dawn', { fov: 40, shadowSize: 16, target: [0, 2, -6] });
    snowGround(st, { seed: 16 });
    const hs = [0, -5.4, -10.8].map((z, i) => { const h = cottage({ w: 4.2, d: 4.6, h: 2.2 + (i % 2) * 0.3, lit: false, wall: ['#efe6d2', '#e8dccb', '#f2eadb'][i], thatch: ['#9a7448', '#8a6a42', '#a07a4a'][i] }); h.position.set(0, 0, z); h.rotation.y = Math.PI / 2; st.add(h); return h; });
    const tr = trail(st, { from: [0.4, 5], to: [0.4, -18], surfaces: hs.map(roofSurf) });
    return { stage: st, tr };
  },
  draw(s, t, info) { s.tr.reveal(kf(t, [[0, 0.2], [info.dur, 0.85]])); camMove(s.stage, t, [[0, { pos: [10, 14, 9], look: [0, 2, -5.4], fov: 54 }], [info.dur, { pos: [9, 13, 7.5], look: [0, 2, -5.6], fov: 52 }]]); },
  overlay(g, t, info, s) { dawnLook(g, t); stamp(g, t, 'ROOFTOPS', { at: at(info, 'snowy', 0.2) - 0.05, x: 540, y: 340, size: 76, color: '#ffffff', fill: '#2a3a6a', rot: -0.05 }); },
});

// s11 — "Even in and out of drainpipes." The prints walk into one end of a pipe and come out the other.
registerShot('s11', { kind: '3d',
  init(T) {
    const { st } = snowStage(T, 'dawn', { fov: 34, shadowSize: 6, target: [0, 0, 0] });
    snowGround(st, { seed: 18, trees: 5 });
    const p = drainpipe({ len: 2.4, r: 0.36 }); p.position.set(0, 0, 0); st.add(p);
    const tr = trail(st, { from: [-8, 0], to: [8, 0], skip: [pipeSkip(p, -0.2)] });
    const v = villager({ seed: 13, coat: '#4a5a3a', scarf: '#e0b040', head: 'beanie', headColor: '#8a2a2a', skin: 'tan' }); v.position.set(1.7, 0, -2.0); v.rotation.y = -0.4; st.add(v);
    return { stage: st, p, tr, v };
  },
  draw(s, t, info) {
    s.tr.reveal(kf(t, [[0, 0.3], [0.5, 0.44], [1.0, 0.44], [1.15, 0.62], [info.dur, 0.72]]));
    s.v.pose(addPose(POSE.thinking, idle(t, 3, 0.3))); s.v.face(mixExpr(EXPR.suspicious, EXPR.shocked, prog(t, 1.1, 1.3)), t);
    camMove(s.stage, t, [[0, { pos: [0.3, 4.6, 10.5], look: [0.1, 0.6, -0.6], fov: 56 }], [info.dur, { pos: [0.2, 4.2, 9.5], look: [0.1, 0.6, -0.6], fov: 54 }]]);
  },
  overlay(g, t, info, s) { dawnLook(g, t); stamp(g, t, 'DRAINPIPES', { at: at(info, 'drainpipes.', 0.6) - 0.05, x: 540, y: 340, size: 76, color: '#ffffff', fill: '#b8322a', rot: -0.05 }); reactions(g, t, s, [{ fx: 'question', on: s.v, at: 1.2, scale: 0.8 }]); },
});

// s12 — "In total: an estimated 40 to 100 miles of tracks." Map: a trail line snakes across Devon; ESTIMATED 40-100 MILES.
registerShot('s12', {
  draw(g, t, info) {
    const gr = g.createLinearGradient(0, 0, 0, 1920); gr.addColorStop(0, '#1b2a5c'); gr.addColorStop(1, '#0b1230'); g.fillStyle = gr; g.fillRect(0, 0, 1080, 1920);
    snowfall(g, t, { k: 0.5, seed: 19 });
    const m0 = at(info, '40', 1.2) - 0.15;
    devonMap(g, t, { dotsAt: -5, trail: true, trailAt: 0.05, trailDur: Math.max(1.0, m0) });
    if (t > m0) { dimScene(g, 4, 0.35); drawInsert(g, { type: 'bigtext', kicker: 'AN ESTIMATED', title: '40-100', lines: ['MILES OF TRACKS'], size: 190, color: '#ffd25a' }, t - m0); }
  },
});

// s13 — "Some people said they were the tracks of Satan himself." Night: villagers + the vicar huddle round a lantern.
// On "Satan": red flash, everyone snaps to shocked; stamp. No devil shown.
registerShot('s13', { kind: '3d',
  init(T) {
    const { st, moon } = snowStage(T, 'night', { fov: 36, shadowSize: 8, target: [0, 1.2, 0], moonPos: [8, 22, -60] });
    snowGround(st, { seed: 20 });
    const h = cottage({ w: 4.4, d: 5, h: 2.5 }); h.position.set(-3.5, 0, -7); h.rotation.y = 0.3; st.add(h);
    const vc = vicar(); vc.position.set(0, 0, -0.4); st.add(vc);
    const a = villager({ seed: 5, coat: '#6a4a3a', scarf: '#b8322a' }); a.position.set(-1.6, 0, 0.5); a.rotation.y = 0.5; st.add(a);
    const b = villager({ seed: 11, coat: '#3a4a6a', scarf: '#e0b040', head: 'beanie', headColor: '#2f6a3a', skin: 'tan', hair: 'curly' }); b.position.set(1.6, 0, 0.5); b.rotation.y = -0.5; st.add(b);
    const ln = lantern(); st.add(ln);
    return { stage: st, vc, a, b, ln, moon };
  },
  draw(s, t, info) {
    const sat = at(info, 'Satan', 1.6), sh = prog(t, sat, sat + 0.2);
    s.vc.pose(addPose(mixPose(POSE.holdFront, POSE.panic, sh * 0.7), { ...idle(t, 1, 0.3), ...tremble(t, sh * 0.6) })); s.vc.face(mixExpr(EXPR.worried, EXPR.shocked, sh), t);
    s.vc.hand.R.getWorldPosition(s.ln.position); s.ln.position.y -= 0.2;
    [s.a, s.b].forEach((v, i) => { v.pose(addPose(mixPose(POSE.stand, POSE.panic, sh), { ...idle(t, 4 + i, 0.4), ...tremble(t, sh * 0.8), lean: (1 - sh) * 0.12 })); v.face(mixExpr(EXPR.suspicious, EXPR.panic, sh), t); });
    camMove(s.stage, t, [[0, { pos: [0, 2.6, 7.4], look: [0, 1.7, 0], fov: 38 }], [sat, { pos: [0, 2.5, 6.6], look: [0, 1.75, 0], fov: 38 }], [info.dur, { pos: [0, 2.3, 5.2], look: [0, 1.85, 0], fov: 36 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: sat, amp: 0.04, dur: 0.4 }]);
  },
  overlay(g, t, info, s) {
    const sat = at(info, 'Satan', 1.6);
    nightLook(g, t, { snow: 0.5 });
    if (t > sat) { g.save(); g.fillStyle = `rgba(200,30,30,${0.18 + 0.05 * Math.sin(t * 8)})`; g.globalCompositeOperation = 'multiply'; g.fillRect(0, 0, 1080, 1920); g.restore(); }
    reactions(g, t, s, [{ fx: 'flash', at: sat, dur: 0.25, color: '#ff4030' }, { fx: 'exclaim', on: s.a, at: sat + 0.1, color: '#ff3b30' }, { fx: 'exclaim', on: s.b, at: sat + 0.15, color: '#ff3b30' }, { fx: 'sweat', on: s.vc, at: 0.3 }]);
    stamp(g, t, 'SATAN?!', { at: sat - 0.02, x: 540, y: 360, size: 120, color: '#ffffff', fill: '#b8322a', rot: -0.07 });
  },
});

// suspects lineup backdrop: height chart + numbered placards
function lineupSet(T) {
  const { st } = snowStage(T, 'dawn', { fov: 36, shadowSize: 12, target: [0, 1, -1], moon: false });
  st.scene.background = new THREE.Color('#2a3050');
  const chart = canvasTex(1024, 512, (x, w, h) => { x.fillStyle = '#d8dce6'; x.fillRect(0, 0, w, h); x.strokeStyle = '#4a5068'; x.fillStyle = '#4a5068'; x.font = '700 22px sans-serif';
    for (let i = 0; i <= 10; i++) { const y = h - i * h / 10; x.lineWidth = i % 2 ? 2 : 5; x.beginPath(); x.moveTo(0, y); x.lineTo(w, y); x.stroke(); if (i % 2 === 0 && i) { x.fillText(`${i / 2} FT`, 12, y + 26); x.fillText(`${i / 2} FT`, w - 70, y + 26); } } });
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(16, 8), toon('#ffffff', { map: chart })); wall.position.set(0, 4, -2.2); wall.receiveShadow = true; wall.userData.noOutline = true; st.add(wall);
  const fl = floor(30, 20, '#8a8e9a', 0, 0); fl.receiveShadow = true; st.add(fl);
  const sus = [badger(), mouse(), kangaroo(), balloon({})]; const xs = [-3.4, -1.4, 0.6, 3.0];
  sus.forEach((s, i) => { s.position.set(xs[i], 0, -0.6); st.add(s);
    const pc = canvasTex(128, 96, (x, w, h) => { x.fillStyle = '#1e1e22'; x.fillRect(0, 0, w, h); x.fillStyle = '#ffffff'; x.font = '900 70px "Fredoka", sans-serif'; x.textAlign = 'center'; x.fillText(String(i + 1), w / 2, 76); });
    const p = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.52), toon('#ffffff', { map: pc })); p.position.set(xs[i], 0.3, 0.6); p.rotation.x = -0.3; p.userData.noOutline = true; st.add(p); });
  sus[1].scale.setScalar(0.8); sus[0].rotation.y = 0.5; sus[1].rotation.y = 0.2; sus[2].rotation.y = -0.2;
  return { stage: st, sus, xs };
}
const pop = (t, a) => ease.outBack(clamp((t - a) / 0.3));

// s14 — "Others blamed badgers, wood mice, escaped kangaroos... even a runaway balloon." The suspects pop in on their word;
// the camera pans along the lineup; the balloon drops in last and the camera pulls back.
registerShot('s14', { kind: '3d',
  init(T) { return lineupSet(T); },
  draw(s, t, info) {
    const tb = at(info, 'badgers,', 0.6), tm = at(info, 'mice,', 1.2), tk = at(info, 'kangaroos...', 1.9), tl = at(info, 'balloon.', 3.4);
    [tb, tm, tk].forEach((a, i) => { const k = pop(t, a - 0.1); s.sus[i].visible = k > 0.01; s.sus[i].scale.setScalar((i === 1 ? 0.8 : 1) * Math.max(0.01, k)); });
    const kb = ease.out(clamp((t - tl + 0.35) / 0.6)); s.sus[3].visible = kb > 0; s.sus[3].position.y = lerp(7, 0, kb);
    s.sus[2].position.y = Math.abs(Math.sin(t * 5)) * 0.25 * (t > tk ? 1 : 0);
    if (s.sus[1].head) s.sus[1].head.rotation.z = Math.sin(t * 4) * 0.1;
    const X = kf(t, [[0, -3.4], [tm - 0.1, -3.4], [tm + 0.2, -1.4], [tk - 0.1, -1.4], [tk + 0.2, 0.6], [tl - 0.5, 1.0]]);
    const wide = ease.inOut(clamp((t - tl + 0.4) / 0.6));
    camMove(s.stage, 0, [[0, { pos: [lerp(X, 0, wide), lerp(2.0, 3.6, wide), lerp(6.5, 16, wide)], look: [lerp(X, 0, wide), lerp(1.0, 2.0, wide), -0.6], fov: lerp(42, 56, wide) }]]);
  },
  overlay(g, t, info, s) {
    vignette(g, 0.35);
    stamp(g, t, 'SUSPECTS', { at: 0.0, x: 540, y: 300, size: 80, color: '#ffffff', fill: '#2a3a6a', rot: -0.05 });
    reactions(g, t, s, [{ fx: 'question', on: s.sus[2], at: at(info, 'kangaroos...', 1.9) + 0.2, until: at(info, 'balloon.', 3.4) - 0.4, scale: 0.8 }]);
  },
});

// s15 — "But none of it has ever been confirmed." Wide lineup, all four; stamp NEVER CONFIRMED.
registerShot('s15', { kind: '3d',
  init(T) { const s = lineupSet(T); return s; },
  draw(s, t, info) {
    s.sus[2].position.y = Math.abs(Math.sin(t * 5)) * 0.2; s.sus[3].position.y = Math.sin(t * 2) * 0.1;
    s.sus.forEach((x, i) => { if (x.head) x.head.rotation.y = Math.sin(t * 2 + i) * 0.25; });
    camMove(s.stage, t, [[0, { pos: [0, 3.6, 16], look: [0, 2.0, -0.6], fov: 56 }], [info.dur, { pos: [0, 3.4, 14.5], look: [0, 2.0, -0.6], fov: 56 }]]);
  },
  overlay(g, t, info, s) { vignette(g, 0.4); stamp(g, t, 'NEVER CONFIRMED', { at: at(info, 'confirmed.', 1.0) - 0.1, x: 540, y: 420, size: 86, color: '#e23b2e', fill: 'rgba(250,244,226,0.95)', rot: -0.1 }); },
});

// s16 — "And some reports have been questioned." A generic 1855 newspaper page; parts get circled with red "?".
registerShot('s16', {
  draw(g, t, info) {
    const gr = g.createLinearGradient(0, 0, 0, 1920); gr.addColorStop(0, '#3a2a22'); gr.addColorStop(1, '#140e10'); g.fillStyle = gr; g.fillRect(0, 0, 1080, 1920);
    const q = at(info, 'questioned.', 1.2);
    newspaper(g, t, { at: 0, qs: [[-150, -60, q - 0.4], [130, 160, q - 0.15], [-120, 330, q + 0.1]] });
  },
});

// s17 — PAYOFF: "Over 170 years later, nobody knows what made the Devil's Footprints." Back at the hero cottage: the full
// trail over the roof. Fresh snow covers the prints and the camera settles on frame 1's framing -> loop.
registerShot('s17', { kind: '3d',
  init(T) { return heroSet(T); },
  draw(s, t, info) {
    s.tr.reveal(0.9); s.tr.cover(prog(t, info.dur - 0.45, info.dur) * 0.6);
    camMove(s.stage, t, [[0, { pos: [2.0, 3.4, 7.5], look: [0.3, 2.2, -3], fov: 50 }], [info.dur - 0.6, { pos: [3.8, 6.8, 12.6], look: [0.2, 1.6, -3.5], fov: 54 }], [info.dur, HERO0]], ease.inOut);
  },
  overlay(g, t, info, s) {
    nightLook(g, t, { snow: lerp(0.6, 2.2, prog(t, info.dur - 1.0, info.dur)) });
    stamp(g, t, '170+ YEARS', { at: 0.05, x: 300, y: 300, size: 64, color: '#ffffff', fill: 'rgba(30,40,80,0.85)', rot: -0.08, until: info.dur - 0.5 });
    stamp(g, t, 'STILL UNSOLVED', { at: at(info, 'nobody', 1.2) - 0.05, x: 560, y: 450, size: 84, color: '#ffffff', fill: '#b8322a', rot: -0.05, until: info.dur - 0.25 });
  },
});
