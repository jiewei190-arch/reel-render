// Pando: this forest is ONE tree — Toon 3D + BEANMEN effects. Nature fact; the age is hedged (estimates vary widely).
// Loop: s20 rises back into s01's aerial camera, so the last frame is frame 1.
import { registerShot, ease, prog, clamp, lerp, E } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, point, shrug, walk, nod, shake } from '/kits/toon3d/rig.js';
import { reactions, shakeCam, project } from '/kits/toon3d/react.js';
import { insertShot } from '/kits/toon3d/insert.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import {
  at, THREE, meadow, forest, aspen, sprout, hero, scientist, deer, fence, rootSlab, globe, GOLDS,
  topCaption, richLine, stamp, chip, arrow, newspaper, insT, CARD_INK, ball, cyl, rbox, toon, flat, outline, glow, floor,
} from './_lib.js';

const RAYS = { rays: { from: [-70, -60], strength: 0.6 }, tint: '#ffd49a' }, SOFT = { rays: false, tint: '#ffe0b0' };
const HOOK = (g, t, info) => topCaption(g, t + info.shot.start, [['this whole', '#ffffff'], ['FOREST', '#ffd25a']], [['is', '#ffffff'], ['ONE TREE', '#ff5a4a']], { until: 3.5, still: info.shot.start > 0 });

// ---------------------------------------------------------------- the aerial set (frame 1 + the loop)
function aerial(T, o = {}) { const s = meadow(T, { seed: o.seed || 3, shadowSize: 40, target: [0, 0, -20], fov: 42 }); s.f = forest(s.stage, { n: o.n || 520, w: 70, d: 70, z: -24, seed: 4, slope: 0.08 }); return s; }
const A0 = (u) => ({ pos: [-12 + u * 1.4, 17 - u * 0.3, 26 - u * 1.3], look: [0 + u * 1.0, 3, -32], fov: 46 });
const aerialCam = (s, u) => { const v = A0(u); s.stage.cam(v.pos, v.look, v.fov); };

// s01 — FRAME 1 / HOOK: already gliding over a golden aspen forest; top caption on frame 1.
registerShot('s01', { kind: '3d',
  init(T) { return aerial(T); },
  draw(s, t) { s.update(t); aerialCam(s, t); },
  overlay(g, t, info) { sunnyLook(g, t, RAYS); HOOK(g, t, info); },
});
// s02 — "...Every single TRUNK." Down among the trunks: the hero pats one; every trunk lights up as "the same tree".
function grove(T, o = {}) { const s = meadow(T, { seed: o.seed || 5, shadowSize: 10, target: [0, 0, -3] }); s.trees = [];
  const r = [[-2.6, -1.5], [-0.9, -3.5], [1.2, -1.2], [2.8, -3.0], [-3.8, -5.5], [0.4, -6.5], [3.6, -6.8], [-1.8, -8.8], [2.0, -9.5], [-4.6, -2.8], [4.8, -1.8]];
  r.forEach(([x, z], i) => { const a = aspen({ seed: i + 1, h: 5.5 + (i % 3) * 0.8 }); a.position.set(x, 0, z); s.stage.add(a); s.trees.push(a); });
  if (o.back !== false) forest(s.stage, { n: 160, w: 50, d: 30, z: -26, seed: 8 });
  return s; }
registerShot('s02', { kind: '3d',
  init(T) { const s = grove(T); s.h = hero(); s.h.position.set(0.4, 0, -0.4); s.h.rotation.y = 0.6; s.stage.add(s.h); return s; },
  draw(s, t, info) { s.update(t); s.trees.forEach((a, i) => a.quake(t, 1)); const p = ease.out(prog(t, 0.05, 0.3));
    s.h.pose(addPose(point(POSE.stand, 'R', p, { up: 0.2 }), idle(t, 2, 0.6))); s.h.face(mixExpr(EXPR.neutral, EXPR.shocked, p), t);
    camMove(s.stage, t, [[0, { pos: [1.4, 2.0, 5.0], look: [0, 2.2, -2], fov: 46 }], [info.dur, { pos: [0.9, 1.9, 4.2], look: [0, 2.4, -2], fov: 46 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); HOOK(g, t, info);
    s.trees.forEach((a, i) => { const p = project(s.stage, [a.position.x, 1.6, a.position.z]); if (p.behind || p.y > 1700) return; const k = ease.outBack(prog(t, 0.15 + i * 0.05, 0.4 + i * 0.05));
      if (k > 0 && p.x > 40 && p.x < 1040) { g.save(); g.translate(p.x, p.y); g.scale(k, k); g.fillStyle = '#ffd25a'; g.strokeStyle = CARD_INK; g.lineWidth = 6; g.beginPath(); g.arc(0, 0, 26, 0, 6.283); g.fill(); g.stroke(); insT(g, '1', 0, 2, 34, { color: CARD_INK, stroke: null }); g.restore(); } });
    reactions(g, t, s, [{ fx: 'exclaim', on: 'h', at: 0.25, color: '#ff3b30' }]); },
});

// s03 — "It's called PANDO, a quaking aspen in Utah,..." Close on the canopy: the golden leaves tremble. Stamp + chip.
registerShot('s03', { kind: '3d',
  init(T) { return grove(T, { seed: 6 }); },
  draw(s, t, info) { s.update(t); s.trees.forEach((a) => a.quake(t, 2.5)); const c = at(info, 'quaking', 99) - 0.08;
    if (t < c) camMove(s.stage, t, [[0, { pos: [0.5, 3.0, 3.2], look: [0.3, 6.2, -2.5], fov: 50 }], [c, { pos: [0.5, 3.1, 3.0], look: [0.2, 6.3, -2.5], fov: 50 }]]);
    else camMove(s.stage, t, [[c, { pos: [-1.5, 1.6, 6.5], look: [0.5, 3.6, -3], fov: 50 }], [info.dur, { pos: [-1.3, 1.6, 5.9], look: [0.5, 3.7, -3], fov: 50 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); stamp(g, t, 'PANDO', { at: at(info, 'pando', 0.4) - 0.05, x: 540, y: 520, size: 130, color: '#ffffff', fill: '#2f8a5a', rot: -0.06 });
    chip(g, t, 'QUAKING ASPEN', 'Fishlake National Forest, Utah', { at: at(info, 'quaking', 1.0) - 0.05, y: 1110, w: 820, size: 66, color: '#c07a1a' }); },
});
// s04 — "...every trunk grows from ONE SHARED ROOT SYSTEM." X-ray cutaway: glowing roots link every trunk underground.
registerShot('s04', { kind: '3d',
  init(T) { const s = meadow(T, { seed: 7, shadowSize: 10, target: [0, 0, 0] }); s.trees = [];
    const xs = [-4.2, -2.4, -0.6, 1.2, 3.0, 4.6]; xs.forEach((x, i) => { const a = aspen({ seed: i + 3, h: 4.6 + (i % 2) * 0.8, s: 0.85 }); a.position.set(x, 2.6, 0); s.stage.add(a); s.trees.push(a); });
    const soil = rbox(13, 2.6, 3, '#6a4a32', 0, 1.3, 0, 0.08); s.stage.add(soil); const turf = rbox(13.1, 0.2, 3.1, '#8fb85a', 0, 2.55, 0, 0.06); s.stage.add(turf); outline(soil, { px: 2.4 }); outline(turf, { px: 2.4 });
    s.slab = rootSlab(xs, { w: 13 }); s.slab.position.set(0, 2.6, 1.4); s.stage.add(s.slab); forest(s.stage, { n: 120, w: 50, d: 20, z: -18, seed: 9 }); return s; },
  draw(s, t, info) { s.update(t); s.trees.forEach(a => a.quake(t, 1)); const r = at(info, 'root', 1.0); s.slab.glowM.color.set(t > r ? (Math.sin(t * 6) > 0 ? '#ffd27a' : '#ffb84a') : '#c08a4a');
    const c = r - 0.08; if (t < c) camMove(s.stage, t, [[0, { pos: [0, 3.6, 14.5], look: [0, 3.2, 0], fov: 46 }], [c, { pos: [0, 3.55, 14.0], look: [0, 3.15, 0], fov: 46 }]]);
    else camMove(s.stage, t, [[c, { pos: [-1.2, 2.4, 9.0], look: [0, 2.2, 0], fov: 46 }], [info.dur, { pos: [-1.1, 2.4, 8.4], look: [0, 2.2, 0], fov: 46 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); const r = at(info, 'root', 1.0);
    stamp(g, t, 'ONE ROOT SYSTEM', { at: r - 0.05, x: 540, y: 420, size: 80, color: '#ffffff', fill: '#c0601a', rot: -0.05 });
    chip(g, t, 'X-RAY VIEW', null, { at: 0.1, x: 780, y: 590, w: 380, size: 50, color: '#2f6ad0', rot: 0.03 }); },
});

// s05 — INSERT: "about 47,000 trunks" (counter over the aerial forest)
const S01 = { init(T) { return aerial(T, { seed: 4 }); }, draw(s, t) { s.update(t); aerialCam(s, t + 6); } };
insertShot('s05', { scene: S01, insert: { type: 'counter', title: 'ABOUT', value: 47000, from: 0, suffix: '', lines: ['trunks · all one tree'], color: '#ffd25a' } });
// s06 — "...all GENETICALLY IDENTICAL." A row of trunks, each tagged with the same DNA barcode; the scientist checks with a clipboard.
registerShot('s06', { kind: '3d',
  init(T) { const s = grove(T, { seed: 8 }); s.sc = scientist(); s.sc.position.set(-0.4, 0, 0.2); s.sc.rotation.y = 0.5; s.stage.add(s.sc); return s; },
  draw(s, t, info) { s.update(t); s.trees.forEach(a => a.quake(t, 1)); s.sc.pose(addPose(POSE.holdFront, { ...idle(t, 3, 0.6), ...nod(t) })); s.sc.face(mixExpr(EXPR.neutral, EXPR.happy, 0.5), t);
    camMove(s.stage, t, [[0, { pos: [0.6, 2.2, 6.2], look: [0, 1.8, -3], fov: 46 }], [info.dur, { pos: [0.4, 2.1, 5.6], look: [0, 1.8, -3], fov: 46 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); const id = at(info, 'identical', 0.9);
    s.trees.slice(0, 5).forEach((a, i) => { const p = project(s.stage, [a.position.x, 2.0, a.position.z]); if (p.behind) return; const k = ease.outBack(prog(t, 0.1 + i * 0.08, 0.35 + i * 0.08)); if (k <= 0) return;
      g.save(); g.translate(p.x, p.y); g.scale(k * 0.8, k * 0.8); g.fillStyle = '#ffffff'; g.strokeStyle = CARD_INK; g.lineWidth = 5; g.beginPath(); g.roundRect(-70, -34, 140, 68, 10); g.fill(); g.stroke();
      g.fillStyle = CARD_INK; [3, 7, 4, 9, 2, 6, 8, 3, 5].forEach((w, j) => g.fillRect(-52 + j * 12, -20, Math.max(3, w * 0.9), 40)); g.restore(); });
    stamp(g, t, 'IDENTICAL', { at: id - 0.05, x: 540, y: 430, size: 96, color: '#ffffff', fill: '#6a3ad0', rot: -0.05 });
    reactions(g, t, s, [{ fx: 'sparkle', on: 'sc', at: id }]); },
});

// s07 — "BUT here's the WILD part..." Whip: the hero's jaw drops in the grove.
registerShot('s07', { kind: '3d',
  init(T) { const s = grove(T, { seed: 9 }); s.h = hero(); s.h.position.set(0, 0, 0.4); s.stage.add(s.h); return s; },
  draw(s, t, info) { s.update(t); s.trees.forEach(a => a.quake(t, 1)); const w = at(info, 'wild', 0.5), k = ease.outBack(prog(t, w - 0.1, w + 0.2));
    s.h.pose(addPose(mixPose(POSE.stand, POSE.armsUp, k), idle(t, 4, 0.6))); s.h.face(mixExpr(EXPR.neutral, EXPR.shocked, k), t);
    camMove(s.stage, t, [[0, { pos: [0, 2.2, 4.2], look: [0, 2.0, 0], fov: 42 }], [info.dur, { pos: [0, 2.15, 3.4], look: [0, 2.05, 0], fov: 42 }]]); shakeCam(s.stage, t, [{ fx: 'shake', at: w, amp: 0.04, dur: 0.25 }]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); const w = at(info, 'wild', 0.5); reactions(g, t, s, [{ fx: 'exclaim', on: 'h', at: w, color: '#ff3b30' }, { fx: 'flash', at: w - 0.05, dur: 0.15 }]);
    stamp(g, t, 'THE WILD PART', { at: w, x: 540, y: 430, size: 84, color: '#ffffff', fill: '#e8413a', rot: -0.06 }); },
});
// s08 — INSERT: "it weighs about 6,000 tonnes"
const S07g = { init(T) { return grove(T, { seed: 10 }); }, draw(s, t) { s.update(t); s.trees.forEach(a => a.quake(t, 1)); s.stage.cam([0, 2.6, 7], [0, 3.4, -3], 48); } };
insertShot('s08', { scene: S07g, insert: { type: 'bigtext', kicker: 'IT WEIGHS ABOUT', title: '6,000 TONNES', lines: ['≈ 13 million pounds'], color: '#ffd25a' } });
// s09 — "That MAY make it the HEAVIEST living thing on Earth." A cartoon globe spins; a pin on Utah gets a trophy with a question mark.
registerShot('s09', { kind: '3d',
  init(T) { const s = meadow(T, { seed: 11 }); s.stage.scene.background = new THREE.Color('#14204a'); s.gl = globe({ r: 2.2 }); s.gl.position.set(0, 2.4, 0); s.stage.add(s.gl);
    s.tr = new THREE.Group(); s.tr.add(cyl(0.3, 0.45, 0.25, '#e8b030', 0, 0, 0, 16), cyl(0.08, 0.08, 0.4, '#e8b030', 0, 0.3, 0, 8)); const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.25, 0.6, 20), toon('#f2c230')); cup.position.y = 0.75; s.tr.add(cup); outline(s.tr, { px: 2.6 }); s.tr.position.set(1.0, 4.4, 1.2); s.stage.add(s.tr);
    s.ground = null; return s; },
  draw(s, t, info) { s.gl.ball.rotation.y = 2.2 + t * 0.35; s.tr.rotation.y = t * 1.2; s.tr.position.y = 4.4 + Math.sin(t * 2) * 0.08;
    camMove(s.stage, t, [[0, { pos: [0, 3.0, 9.0], look: [0, 2.9, 0], fov: 44 }], [info.dur, { pos: [0, 3.0, 8.4], look: [0, 2.9, 0], fov: 44 }]]); },
  overlay(g, t, info, s) { const h = at(info, 'heaviest', 0.6); stamp(g, t, 'HEAVIEST LIVING THING?', { at: h - 0.05, x: 540, y: 1180, size: 66, color: '#ffffff', fill: '#c0601a', rot: -0.04 });
    reactions(g, t, s, [{ fx: 'sparkle', on: s.tr, at: h, scale: 1.0 }, { fx: 'question', on: s.tr, at: at(info, 'may', 0.2), scale: 0.8 }]);
    chip(g, t, 'PANDO', 'maybe #1 by weight', { at: 0.1, y: 420, w: 560, size: 66, color: '#2f8a5a' }); },
});

// s10 — "Its AGE? Many articles said 80,000 years." The hero reads a newspaper with a huge 80,000 headline.
registerShot('s10', { kind: '3d',
  init(T) { const s = grove(T, { seed: 12 }); s.h = hero(); s.h.position.set(0, 0, 0.4); s.stage.add(s.h); return s; },
  draw(s, t, info) { s.update(t); s.trees.forEach(a => a.quake(t, 1)); s.h.pose(addPose(POSE.holdFront, idle(t, 5, 0.6))); s.h.face({ ...mixExpr(EXPR.neutral, EXPR.suspicious, prog(t, 0.6, 1.0)), pupil: [0, -0.4] }, t);
    const c = at(info, 'many', 99) - 0.08; if (t < c) camMove(s.stage, t, [[0, { pos: [0, 2.4, 5.2], look: [0, 1.9, 0], fov: 44 }], [c, { pos: [0, 2.4, 4.9], look: [0, 1.9, 0], fov: 44 }]]);
    else camMove(s.stage, t, [[c, { pos: [0.8, 1.6, 3.8], look: [0, 1.9, 0], fov: 46 }], [info.dur, { pos: [0.7, 1.6, 3.4], look: [0, 1.9, 0], fov: 46 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); const a = at(info, 'age', 0.1);
    stamp(g, t, 'AGE?', { at: a - 0.05, x: 540, y: 380, size: 110, color: '#ffffff', fill: '#2f6ad0', rot: -0.05 });
    newspaper(g, t, '80,000 YEARS OLD!', { at: at(info, 'many', 0.7) - 0.05, x: 540, y: 1000, w: 700, h: 480, size: 70, mast: 'THE FOREST TIMES' });
    reactions(g, t, s, [{ fx: 'question', on: 'h', at: at(info, 'many', 0.7) + 0.5, scale: 0.7 }]); },
});
// s11 — "That's now considered WAY TOO OLD." The scientist shakes her head; a red ✗ slams over 80,000.
registerShot('s11', { kind: '3d',
  init(T) { const s = grove(T, { seed: 13 }); s.sc = scientist(); s.sc.position.set(0, 0, 0.4); s.stage.add(s.sc); return s; },
  draw(s, t, info) { s.update(t); s.trees.forEach(a => a.quake(t, 1)); s.sc.pose(addPose(POSE.handsHips, { ...idle(t, 6, 0.6), ...shake(t) })); s.sc.face(mixExpr(EXPR.neutral, EXPR.deadpan, 0.7), t);
    camMove(s.stage, t, [[0, { pos: [0.4, 2.3, 4.6], look: [0, 2.0, 0], fov: 42 }], [info.dur, { pos: [0.4, 2.3, 4.1], look: [0, 2.0, 0], fov: 42 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); const w = at(info, 'way', 1.0);
    g.save(); g.globalAlpha = clamp(t / 0.15); insT(g, '80,000 YEARS', 540, 430, 110, { color: '#ffffff', stroke: CARD_INK }); g.restore();
    const k = ease.out(prog(t, w - 0.05, w + 0.15)); if (k > 0) { g.save(); g.strokeStyle = '#e8413a'; g.lineWidth = 34; g.lineCap = 'round'; g.beginPath(); g.moveTo(170, 330); g.lineTo(lerp(170, 910, k), lerp(330, 530, k)); g.stroke(); g.beginPath(); g.moveTo(910, 330); g.lineTo(lerp(910, 170, k), lerp(330, 530, k)); g.stroke(); g.restore(); }
    stamp(g, t, 'TOO OLD', { at: w + 0.1, x: 560, y: 1180, size: 90, color: '#ffffff', fill: '#e8413a', rot: 0.05 }); },
});
// s12 — "NEWER ESTIMATES say thousands of years,..." The scientist kneels by an old stump with a magnifier: AGE ???
registerShot('s12', { kind: '3d',
  init(T) { const s = grove(T, { seed: 14 }); s.sc = scientist(); s.sc.position.set(-0.3, 0, 0.5); s.sc.rotation.y = 0.7; s.stage.add(s.sc);
    s.stump = cyl(0.42, 0.5, 0.5, '#efe9dc', 0.7, 0.25, 0.4, 20); outline(s.stump, { px: 2.6 }); s.stage.add(s.stump); s.top = new THREE.Mesh(new THREE.CircleGeometry(0.42, 24), flat('#e8c88a')); s.top.rotation.x = -Math.PI / 2; s.top.position.set(0.7, 0.51, 0.4); s.stage.add(s.top); return s; },
  draw(s, t, info) { s.update(t); s.trees.forEach(a => a.quake(t, 1)); s.sc.pose(addPose({ ...POSE.stand, lean: 0.45, kneeL: 0.7, kneeR: 0.7, armR: [1.2, 0.2, 0], elbowR: 0.4 }, idle(t, 7, 0.5))); s.sc.position.y = -0.25; s.sc.face({ ...EXPR.suspicious, pupil: [0.5, -0.7] }, t);
    const c = at(info, 'thousands', 99) - 0.08; if (t < c) camMove(s.stage, t, [[0, { pos: [0.3, 2.0, 5.4], look: [0.1, 1.3, 0], fov: 46 }], [c, { pos: [0.3, 1.97, 5.1], look: [0.1, 1.3, 0], fov: 46 }]]);
    else camMove(s.stage, t, [[c, { pos: [1.6, 1.0, 3.4], look: [0.3, 0.9, 0.3], fov: 48 }], [info.dur, { pos: [1.5, 1.0, 3.1], look: [0.3, 0.9, 0.3], fov: 48 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); chip(g, t, 'NEWER ESTIMATES', 'from climate + ice-age clues', { at: 0.05, y: 420, w: 820, size: 66, color: '#2f6ad0' });
    stamp(g, t, 'THOUSANDS OF YEARS', { at: at(info, 'thousands', 0.9) - 0.05, x: 540, y: 1160, size: 64, color: '#ffffff', fill: '#2f8a5a', rot: -0.03 }); },
});
// s13 — INSERT: "maybe 9,000 to 16,000"
insertShot('s13', { scene: S07g, insert: { type: 'bigtext', kicker: 'MAYBE', title: '9,000–16,000', lines: ['years old · nobody knows exactly'], color: '#7fe0a0' } });

// s14 — "BUT Pando is in TROUBLE. It's SHRINKING." Aerial again, cooler light: bare patches spread; down arrow.
function aerialGaps(T) { const s = meadow(T, { seed: 15, shadowSize: 40, target: [0, 0, -20], fov: 42 }); s.f = forest(s.stage, { n: 380, w: 70, d: 70, z: -24, seed: 4, slope: 0.08, hole: [2, -20, 12] });
  s.stumps = []; for (let i = 0; i < 30; i++) { const a = i * 2.4, rr = 3 + (i % 5) * 1.8; const st = cyl(0.25, 0.3, 0.4, '#e8e2d4', 2 + Math.cos(a) * rr, 0.2, -20 + Math.sin(a) * rr, 8); s.stage.add(st); s.stumps.push(st); } return s; }
registerShot('s14', { kind: '3d',
  init(T) { return aerialGaps(T); },
  draw(s, t, info) { s.update(t); const c = at(info, 'shrinking', 99) - 0.08; if (t < c) camMove(s.stage, t, [[0, { pos: [-8, 26, 14], look: [2, 0, -20], fov: 44 }], [c, { pos: [-7, 24, 12], look: [2, 0, -20], fov: 44 }]]);
    else camMove(s.stage, t, [[c, { pos: [10, 9, -4], look: [2, 0, -20], fov: 48 }], [info.dur, { pos: [9, 8.5, -6], look: [2, 0, -20], fov: 48 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: false, tint: '#9ab0d0', tintAmount: 0.25 }); const tr = at(info, 'trouble', 0.6), sh = at(info, 'shrinking', 1.4);
    stamp(g, t, 'IN TROUBLE', { at: tr - 0.05, x: 540, y: 400, size: 96, color: '#ffffff', fill: '#a01a3a', rot: -0.05 });
    stamp(g, t, 'SHRINKING', { at: sh - 0.05, x: 540, y: 1160, size: 96, color: '#ffffff', fill: '#e8413a', rot: 0.04 }); arrow(g, 900, 980, 900, 1220, { k: ease.out(prog(t, sh, sh + 0.25)), w: 44, color: '#e8413a' });
    reactions(g, t, s, [{ fx: 'shake', at: sh, amp: 0.03, dur: 0.25 }]); },
});
// s15 — "DEER and ELK eat the YOUNG SHOOTS before they can grow,..." A mule deer + an elk munch a patch of sprouts; sprouts vanish one by one.
function browse(T, o = {}) { const s = grove(T, { seed: o.seed || 16 }); s.sp = []; for (let i = 0; i < 9; i++) { const p = sprout(); p.position.set(-1.4 + (i % 3) * 1.0 + (i > 5 ? 0.3 : 0), 0, 0.8 - Math.floor(i / 3) * 0.9); s.stage.add(p); s.sp.push(p); }
  s.d = deer(); s.d.position.set(-1.0, 0, -0.6); s.d.rotation.y = 0.9; s.stage.add(s.d); s.e = deer({ elk: true, antlers: true, color: '#8a5a32', s: 1.15 }); s.e.position.set(1.8, 0, -1.6); s.e.rotation.y = -0.7; s.stage.add(s.e); return s; }
registerShot('s15', { kind: '3d',
  init(T) { return browse(T); },
  draw(s, t, info) { s.update(t); s.trees.forEach(a => a.quake(t, 1)); s.d.update(t, { graze: 0.9, chew: true }); s.e.update(t + 1, { graze: 0.8, chew: true });
    const y = at(info, 'young', 1.0); s.sp.forEach((p, i) => { const k = ease.in(prog(t, y + i * 0.12, y + i * 0.12 + 0.2)); p.scale.setScalar(Math.max(0.001, 1 - k)); });
    camMove(s.stage, t, [[0, { pos: [0.4, 1.9, 5.6], look: [0.2, 0.9, -0.4], fov: 44 }], [info.dur, { pos: [0.4, 1.8, 5.0], look: [0.2, 0.9, -0.4], fov: 44 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); const y = at(info, 'young', 1.0);
    chip(g, t, 'MULE DEER', null, { at: at(info, 'deer', 0.05), x: 300, y: 430, w: 440, size: 54, color: '#a0602a', rot: -0.05 }); chip(g, t, 'ELK', null, { at: at(info, 'elk', 0.4), x: 820, y: 520, w: 260, size: 54, color: '#a0602a', rot: 0.05 });
    stamp(g, t, 'YOUNG SHOOTS', { at: y - 0.05, x: 540, y: 1180, size: 70, color: '#ffffff', fill: '#2f8a5a', rot: -0.03 });
    reactions(g, t, s, [{ fx: 'hearts', on: 'd', at: y + 0.3, scale: 0.7 }, { fx: 'hearts', on: 'e', at: y + 0.6, scale: 0.7 }]); },
});
// s16 — "...so OLD TRUNKS die with NOTHING to replace them." Old aspens tip over softly and fade; the ground stays empty.
registerShot('s16', { kind: '3d',
  init(T) { return grove(T, { seed: 17, back: true }); },
  draw(s, t, info) { s.update(t); const o = at(info, 'old', 0.1); s.trees.forEach((a, i) => { const k = ease.in(prog(t, o + 0.15 + i * 0.12, o + 0.65 + i * 0.12)); a.rotation.z = (i % 2 ? 1 : -1) * k * 1.4; a.visible = k < 0.98; a.quake(t, 1 - k); });
    camMove(s.stage, t, [[0, { pos: [0, 2.6, 7.2], look: [0, 2.6, -3], fov: 48 }], [info.dur, { pos: [0, 2.6, 6.6], look: [0, 2.4, -3], fov: 48 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: false, tint: '#b0b8c8', tintAmount: 0.22 }); const n = at(info, 'nothing', 1.2);
    chip(g, t, 'NO YOUNG TREES', 'to replace the old ones', { at: n - 0.05, y: 1140, w: 760, size: 62, color: '#a01a3a' }); },
});

// s17 — "FENCES now protect most of it..." A tall wildlife fence in front of the grove; the hero gives a thumbs-up.
function fenced(T, o = {}) { const s = grove(T, { seed: o.seed || 18 }); s.fn = fence({ x0: -10, x1: 10, z: -0.2, h: 3.4 }); s.stage.add(s.fn); s.sp = []; for (let i = 0; i < 6; i++) { const p = sprout(); p.position.set(-2.5 + i, 0, -1.4 - (i % 2) * 0.6); s.stage.add(p); s.sp.push(p); } return s; }
registerShot('s17', { kind: '3d',
  init(T) { const s = fenced(T); s.h = hero(); s.h.position.set(0.9, 0, 1.8); s.h.rotation.y = -0.4; s.stage.add(s.h); return s; },
  draw(s, t, info) { s.update(t); s.trees.forEach(a => a.quake(t, 1)); const k = ease.outBack(prog(t, 0.1, 0.4)); s.h.pose(addPose(mixPose(POSE.stand, { ...POSE.stand, armR: [0.6, 0.4, 0], elbowR: 1.8 }, k), idle(t, 8, 0.6))); s.h.face(EXPR.happy, t);
    camMove(s.stage, t, [[0, { pos: [-0.6, 2.2, 8.0], look: [0, 1.8, 0], fov: 44 }], [info.dur, { pos: [-0.5, 2.2, 7.4], look: [0, 1.8, 0], fov: 44 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); chip(g, t, '8-FOOT FENCES', 'around most of Pando', { at: at(info, 'fences', 0.05), y: 420, w: 760, size: 66, color: '#2f6ad0' }); reactions(g, t, s, [{ fx: 'sparkle', on: 'h', at: 0.3 }]); },
});
// s18 — PAYOFF: "...but some deer just JUMP OVER." Slow-mo: a mule deer sails over the fence, smug; the hero's jaw drops.
registerShot('s18', { kind: '3d',
  init(T) { const s = fenced(T, { seed: 19 }); s.d = deer(); s.d.rotation.y = Math.PI; s.stage.add(s.d); s.h = hero(); s.h.position.set(0.0, 0, -3.2); s.h.rotation.y = 0.9; s.stage.add(s.h); return s; },
  draw(s, t, info) { s.update(t); s.trees.forEach(a => a.quake(t, 1)); const j = at(info, 'jump', 0.6) - 0.15, k = clamp((t - j) / 1.1);
    const z = lerp(2.6, -2.2, k), y = Math.sin(k * Math.PI) * 2.6; s.d.position.set(-0.8, Math.max(0, y), t < j ? 2.6 + (j - t) * 3 : z); s.d.rotation.x = (k - 0.5) * -0.5 * (k > 0 && k < 1 ? 1 : 0);
    s.d.update(t, { walk: k <= 0 ? 1 : 0, jump: k > 0 && k < 1 ? Math.sin(k * Math.PI) : 0, look: 0 });
    const r = ease.outBack(prog(t, j + 0.3, j + 0.6)); s.h.pose(addPose(mixPose(POSE.stand, POSE.facepalm, prog(t, j + 1.0, j + 1.3) > 0 ? 1 : 0), idle(t, 9, 0.6))); s.h.face(mixExpr(EXPR.happy, EXPR.shocked, r), t);
    camMove(s.stage, t, [[0, { pos: [7.5, 2.6, 8.0], look: [-0.8, 2.0, -0.6], fov: 48 }], [info.dur, { pos: [7.1, 2.6, 7.6], look: [-0.8, 2.0, -0.6], fov: 48 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); const j = at(info, 'jump', 0.6);
    stamp(g, t, 'BOING!', { at: j, x: 330, y: 430, size: 100, color: '#ffffff', fill: '#e8413a', rot: -0.1 });
    reactions(g, t, s, [{ fx: 'speedlines', at: j - 0.1, until: j + 0.9 }, { fx: 'exclaim', on: 'h', at: j + 0.3, color: '#ff3b30' }, { fx: 'sparkle', on: 'd', at: j + 0.5 }]); },
});
// s19 — "Subscribe for more." Rise out of the grove back into frame 1's aerial camera (loop).
registerShot('s19', { kind: '3d',
  init(T) { return aerial(T); },
  draw(s, t, info) { const u = t - info.dur; s.update(u);  const _u = u, k = ease.out(clamp((t) / info.dur)); const v = A0(u), a = A0(0);
    s.stage.cam([lerp(-6, a.pos[0], k), lerp(9, a.pos[1], k), lerp(14, a.pos[2], k)], [a.look[0] + u * 1.0, lerp(4, 3, k), -32], 46); },
  overlay(g, t, info) { sunnyLook(g, t, RAYS); },
});
