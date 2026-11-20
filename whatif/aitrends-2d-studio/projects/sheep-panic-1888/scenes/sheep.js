// The Great Sheep Panic of 1888 — 18 shots, Toon 3D. WTF / mystery, deadpan.
// TONE GUARD: cause UNCONFIRMED. Nothing is shown in the dark (no creature, no ghost, no light in the sky but the moon and,
// only in the "explanation" shots s16, lightning). Sheep are frightened, never hurt. Nature's note = "an explanation".
import { registerShot, ease, prog, clamp, lerp, noise } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, shrug, tremble } from '/kits/toon3d/rig.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { drawInsert, dimScene } from '/kits/toon3d/insert.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import {
  at, THREE, sheep, flock, farmer, railFence, hedge, nightField, nightStage, toonStage, hookRows, stamp, calendar, clockFace,
  countyMap, newspaper, journal, bolt, flashK, nightLook, rbox, cyl, canvasTex, toon, outline, rng, insT, CARD_INK,
} from './_lib.js';

// ---------------------------------------------------------------- the stampede (frame 1 + the loop shot share this)
// A flock of 24 runs toward the camera (+Z); a rail fence across the field at z = -1 gives way as they hit it.
const SPEED = 2.4, FENCE_Z = -1;
const HERO0 = { pos: [0.5, 0.9, 3.4], look: [0, 1.25, -4], fov: 50 };   // frame 1 == last frame of s18 (loop)
function stampedeSet(T) {
  const st = nightStage(T, { fov: 44, target: [0, 0.5, -3], shadowSize: 12 });
  const env = nightField(st, { seed: 3, hedgeZ: -16, hedgeLen: 50, fenceZ: FENCE_Z, fenceLen: 14, house: [9, -26, -0.4], trees: [[-9, -20, 1.3], [12, -34, 1.5]], moonAt: [-20, 40, -110] });
  const fl = flock(st, { n: 24, cx: 0, cz: -8.5, w: 7, d: 8, seed: 3, scale: 1 });
  return { stage: st, env, fl };
}
// tau = seconds of running since the bolt started; run = 0..1 gait
function stampede(s, t, tau, run, o = {}) {
  s.env.update(t);
  s.fl.forEach((f, i) => { const sp = SPEED * (0.85 + f.k * 0.3); const z = f.z + sp * tau, x = f.x + Math.sin(f.ph * 9 + tau * 0.6) * 0.15 * run;
    f.s.position.set(x, 0, z); f.s.rotation.y = (f.ph - 0.5) * 0.25 * (1 - run * 0.5);
    f.s.update(t, { run, speed: 3.0 + f.k * 0.6, ph: f.ph * 3, lid: o.lid ?? lerp(0.35, 0.0, run), headUp: o.headUp ?? 0.4, shine: o.shine ?? 1, look: [0, 0.1], blink: run < 0.5 && !o.noBlink }); });
  // fence: a segment tips over (+Z, toward camera) once a sheep in front of it passes the fence line
  const seg = s.env.fence.segs; seg.forEach((sg, j) => { const x0 = sg.g.position.x + s.env.fence.position.x; let hit = 99;
    s.fl.forEach(f => { if (Math.abs(f.s.position.x - (x0 + 1)) < 1.2) { const sp = SPEED * (0.85 + f.k * 0.3); hit = Math.min(hit, (FENCE_Z - 0.6 - f.z) / sp); } });
    const k = ease.out(clamp((tau - hit) / 0.35)); sg.g.rotation.x = k * 1.45; sg.g.position.y = 0; });
}

// s01 — HOOK. "One night in 1888, tens of thousands of sheep lost their minds." Already moving at frame 1.
registerShot('s01', { kind: '3d',
  init(T) { return stampedeSet(T); },
  draw(s, t, info) {
    stampede(s, t, 0.6 + t, 1);
    const cut = at(info, 'tens', 2.0) - 0.08;   // hard punch-in: the front row charging at the lens
    if (t < cut) camMove(s.stage, t, [[0, HERO0], [cut, { pos: [0.4, 0.85, 4.6], look: [0, 1.2, -3], fov: 50 }]]);
    else camMove(s.stage, t - cut, [[0, { pos: [0.2, 0.7, 6.2], look: [0, 1.0, -1], fov: 40 }], [info.dur - cut + 0.01, { pos: [0.1, 0.75, 9.6], look: [0, 1.0, 1], fov: 42 }]], ease.out);
    shakeCam(s.stage, t, [{ fx: 'shake', at: 0.0, amp: 0.035, dur: info.dur }]);
  },
  overlay(g, t, info, s) {
    nightLook(g, t);
    hookRows(g, t, [[['no one', '#ffd25a'], [' knows', '#ffffff']], [['why', '#ff4a3a']]], { y: 300, size: 104, until: 3.6 });
    stamp(g, t, '1888', { at: at(info, '1888,', 0.8) - 0.1, x: 840, y: 560, size: 70, color: '#ffffff', fill: '#b8322a', rot: 0.08 });
  },
});

// s02 — "November third. Oxfordshire, England." Calm before: the flock asleep in the moonlit field, farmhouse lit.
registerShot('s02', { kind: '3d',
  init(T) {
    const st = nightStage(T, { fov: 40, target: [0, 0.5, -4] });
    const env = nightField(st, { seed: 4, hedgeZ: -12, fenceZ: 1.5, fenceLen: 18, house: [5, -20, -0.3], trees: [[-8, -16, 1.3]] });
    const fl = flock(st, { n: 12, cx: -0.5, cz: -5, w: 7, d: 5, seed: 7 });
    return { stage: st, env, fl };
  },
  draw(s, t, info) {
    s.env.update(t);
    s.fl.forEach((f, i) => f.s.update(t, { lid: 0.92, headUp: -0.6, blink: false, ph: f.ph }));
    camMove(s.stage, t, [[0, { pos: [-1.5, 3.4, 7.5], look: [0, 0.8, -5], fov: 40 }], [info.dur, { pos: [-1.0, 3.0, 6.3], look: [0, 0.8, -5], fov: 40 }]]);
  },
  overlay(g, t, info, s) {
    nightLook(g, t);
    reactions(g, t, s, [{ fx: 'zzz', on: s.fl[4].s, at: 0.2, scale: 0.8, height: 1.2 }]);
    calendar(g, t, { at: 0.0, x: 540, y: 640, rot: -0.05 });
    stamp(g, t, 'OXFORDSHIRE, ENGLAND', { at: at(info, 'Oxfordshire,', 1.0) - 0.1, x: 540, y: 1010, size: 62, color: '#ffffff', fill: '#2a4a6a', rot: 0.04 });
  },
});

// s03 — "Around eight at night." One sheep dozing by the fence. A clock: about 8 PM. On the last beat its eyes snap open.
registerShot('s03', { kind: '3d',
  init(T) {
    const st = nightStage(T, { fov: 32, target: [0, 0.6, 0], shadowSize: 5 });
    const env = nightField(st, { seed: 5, fenceZ: -1.4, fenceLen: 12, hedgeZ: -9, trees: [[6, -14, 1.2]] });
    const sh = sheep({ seed: 11, scale: 1.15 }); sh.position.set(0, 0, 0); sh.rotation.y = 0.5; st.add(sh);
    return { stage: st, env, sh };
  },
  draw(s, t, info) {
    s.env.update(t);
    const snap = info.dur - 0.45, k = clamp((t - snap) / 0.08);
    s.sh.update(t, { lid: lerp(0.85, 0.0, k), headUp: lerp(-0.3, 0.5, ease.out(k)), blink: false, shine: k, look: [lerp(0, -0.4, k), 0.2], squash: k * 0.3 * (1 - clamp((t - snap - 0.1) / 0.2)) });
    camMove(s.stage, t, [[0, { pos: [2.2, 1.5, 5.6], look: [0, 0.7, 0], fov: 32 }], [info.dur, { pos: [1.9, 1.4, 4.9], look: [0, 0.75, 0], fov: 32 }]]);
  },
  overlay(g, t, info, s) {
    nightLook(g, t);
    clockFace(g, t, { at: 0.0, x: 250, y: 330, r: 120, h: 8, m: 0, label: '~8 PM' });
    reactions(g, t, s, [{ fx: 'exclaim', on: 'sh', at: info.dur - 0.4, color: '#ff3b30', height: 1.4 }]);
  },
});

// s04 — "Across about two hundred square miles," a stylised map (not to scale): Oxfordshire, a spreading ring.
registerShot('s04', { kind: '3d',
  init(T) { const s = stampedeSet(T); return s; },
  draw(s, t, info) { stampede(s, t, 0.4 + t * 0.6, 1); camMove(s.stage, t, [[0, { pos: [0, 4.5, 10], look: [0, 0.6, -5], fov: 46 }], [info.dur, { pos: [0, 5, 11], look: [0, 0.6, -5], fov: 46 }]]); },
  overlay(g, t, info, s) {
    nightLook(g, t); dimScene(g, 6, 0.5);
    g.save(); g.translate(540, 0); g.scale(0.88, 0.88); g.translate(-540, 0); countyMap(g, t, { y: 860, ring: at(info, 'two', 0.4) - 0.1, footAt: at(info, 'square', 0.9) - 0.1 }); g.restore();
  },
});

// s05 — "flocks panicked at the same moment." Three flocks in three hedged fields: every head snaps up at once.
registerShot('s05', { kind: '3d',
  init(T) {
    const st = nightStage(T, { fov: 40, target: [0, 0.5, -8], shadowSize: 18 });
    const env = nightField(st, { seed: 6, house: [14, -34, -0.5], trees: [[-16, -30, 1.4], [3, -40, 1.6]] });
    const h1 = hedge({ len: 40, seed: 3 }); h1.position.set(0, 0, -7.5); st.add(h1);
    const h2 = hedge({ len: 12, seed: 4 }); h2.position.set(-2.5, 0, -1.5); h2.rotation.y = Math.PI / 2; st.add(h2);
    const h3 = hedge({ len: 30, seed: 8 }); h3.position.set(1, 0, -16); st.add(h3);
    const flocks = [flock(st, { n: 7, cx: -6, cz: -3.5, w: 5, d: 4, seed: 11 }), flock(st, { n: 7, cx: 2, cz: -3.5, w: 5, d: 4, seed: 12 }), flock(st, { n: 8, cx: -1, cz: -12, w: 8, d: 5, seed: 13 })];
    return { stage: st, env, flocks, all: flocks.flat() };
  },
  draw(s, t, info) {
    s.env.update(t);
    const go = at(info, 'panicked', 0.5) - 0.05, run0 = at(info, 'same', 1.1);
    s.all.forEach((f, i) => { const up = ease.outBack(clamp((t - go - f.k * 0.05) / 0.2)); const rk = clamp((t - run0 - f.k * 0.2) / 0.4); const dir = (i % 3) - 1;
      f.s.position.set(f.x + dir * rk * (t - run0) * 1.5, 0, f.z + rk * (t - run0) * 2.2); f.s.rotation.y = rk * dir * 0.6;
      f.s.update(t, { lid: lerp(0.8, 0.0, up), headUp: lerp(-0.6, 0.6, up), shine: up, blink: false, run: rk, ph: f.ph, squash: up * (1 - clamp((t - go - 0.2) / 0.2)) * 0.4 }); });
    camMove(s.stage, t, [[0, { pos: [0, 9, 9], look: [-1, 0, -7], fov: 42 }], [info.dur, { pos: [0, 7.8, 7.6], look: [-1, 0, -6], fov: 42 }]]);
  },
  overlay(g, t, info, s) {
    nightLook(g, t);
    const go = at(info, 'panicked', 0.5) - 0.05;
    reactions(g, t, s, [{ fx: 'exclaim', on: s.flocks[0][2].s, at: go, color: '#ff3b30', height: 1.4 }, { fx: 'exclaim', on: s.flocks[1][3].s, at: go + 0.03, color: '#ff3b30', height: 1.4 }, { fx: 'exclaim', on: s.flocks[2][4].s, at: go + 0.06, color: '#ff3b30', height: 1.4 }]);
    stamp(g, t, 'SAME MOMENT', { at: at(info, 'same', 1.0) - 0.1, x: 540, y: 420, size: 70, color: '#ffffff', fill: '#b8322a', rot: -0.05 });
  },
});

// s06 — "They broke out of their fields" Low shot: the flock smashes through a rail fence, rails tumble.
registerShot('s06', { kind: '3d',
  init(T) {
    const st = nightStage(T, { fov: 46, target: [0, 0.5, 0], shadowSize: 8 });
    const env = nightField(st, { seed: 8, hedgeZ: -12, fenceZ: 0, fenceLen: 10, trees: [[-7, -16, 1.4]] });
    const fl = flock(st, { n: 10, cx: 0, cz: -5, w: 5, d: 4, seed: 21 });
    return { stage: st, env, fl };
  },
  draw(s, t, info) {
    s.env.update(t);
    const tau = t + 1.0;
    s.fl.forEach(f => { const sp = 3.2 * (0.85 + f.k * 0.3); f.s.position.set(f.x, 0, f.z + sp * tau); f.s.rotation.y = (f.ph - 0.5) * 0.4;
      f.s.update(t, { run: 1, speed: 3.4, ph: f.ph * 3, lid: 0, headUp: 0.3, shine: 1, blink: false }); });
    s.env.fence.segs.forEach((sg, j) => { const k = ease.out(clamp((t - 0.35 - j * 0.06) / 0.3)); sg.g.rotation.x = k * 1.5; sg.g.children.forEach((c, ci) => { if (ci) { c.position.z = 0.06 + k * (1 + ci) * 0.6; c.position.y = [0.55, 1.0][ci - 1] + Math.sin(k * Math.PI) * 0.8; c.rotation.y = k * (j % 2 ? 0.8 : -0.8); } }); });
    camMove(s.stage, t, [[0, { pos: [0.8, 0.5, 4.2], look: [0, 1.1, -2], fov: 50 }], [info.dur, { pos: [0.9, 0.45, 5.6], look: [0, 1.0, -1], fov: 52 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: 0.35, amp: 0.08, dur: 0.6 }]);
  },
  overlay(g, t, info, s) {
    nightLook(g, t);
    reactions(g, t, s, [{ fx: 'speedlines', at: 0.25, until: info.dur }]);
  },
});

// s07 — "and scattered for miles in the dark." High wide: sheep fan out across the dark fields and vanish into it.
registerShot('s07', { kind: '3d',
  init(T) {
    const st = nightStage(T, { fov: 44, target: [0, 0.5, -10], shadowSize: 22, fog: [10, 60, '#0c1230'] });
    const env = nightField(st, { seed: 9, house: [-12, -40, 0.4], trees: [[10, -26, 1.5], [-18, -22, 1.3]] });
    const h = hedge({ len: 50, seed: 9 }); h.position.set(0, 0, -20); st.add(h);
    const fl = flock(st, { n: 18, cx: 0, cz: 2, w: 5, d: 4, seed: 31 });
    return { stage: st, env, fl };
  },
  draw(s, t, info) {
    s.env.update(t);
    s.fl.forEach((f, i) => { const a = (i / s.fl.length - 0.5) * 2.6 + Math.PI; const d = (2 + f.k * 1.5) * (t + 0.5);
      f.s.position.set(f.x + Math.sin(a) * d, 0, f.z + Math.cos(a) * d); f.s.rotation.y = a; f.s.update(t, { run: 1, speed: 3.2, ph: f.ph * 3, lid: 0, shine: 0.6, blink: false, headUp: 0.2 }); });
    camMove(s.stage, t, [[0, { pos: [0, 7, 9], look: [0, 0, -4], fov: 44 }], [info.dur, { pos: [0, 9, 11], look: [0, 0, -6], fov: 44 }]]);
  },
  overlay(g, t, info, s) {
    nightLook(g, t, { vig: 0.7 });
    stamp(g, t, 'FOR MILES', { at: at(info, 'miles', 0.8) - 0.1, x: 540, y: 420, size: 80, color: '#ffffff', fill: '#2a4a6a', rot: -0.06 });
  },
});

// s08 — "But here's the strange part..." One sheep alone in the dark stops, turns its head to us. Slow push-in.
registerShot('s08', { kind: '3d',
  init(T) {
    const st = nightStage(T, { fov: 34, target: [0, 0.6, 0], shadowSize: 5, exposure: 1.2 });
    const env = nightField(st, { seed: 10, hedgeZ: -10, trees: [[-5, -14, 1.3]] });
    const sh = sheep({ seed: 4, scale: 1.2 }); sh.rotation.y = Math.PI / 2; st.add(sh);
    return { stage: st, env, sh };
  },
  draw(s, t, info) {
    s.env.update(t);
    const turn = ease.inOut(prog(t, 0.35, 0.8));
    s.sh.update(t, { headTurn: lerp(0, -1.2, turn), lid: lerp(0.1, 0.0, turn), look: [lerp(0, -0.2, turn), 0], shine: 1, headUp: 0.4, blink: false });
    camMove(s.stage, t, [[0, { pos: [1.4, 1.4, 6.0], look: [0.4, 0.9, 0], fov: 34 }], [info.dur, { pos: [1.1, 1.3, 4.2], look: [0.6, 1.0, 0], fov: 32 }]]);
  },
  overlay(g, t, info, s) { nightLook(g, t, { vig: 0.8 }); },
});

// dawn stage: pink-gold morning, cool shadows
function dawnStage(T, o = {}) { return toonStage(T, { light: 'dusk', fov: o.fov || 40, shadowSize: o.shadowSize || 10, target: o.target || [0, 0.5, 0], bg: ['#5a6aa8', '#e8a088', '#ffd8a0'], key: ['#ffc890', 2.2, [-9, 6, 6]], exposure: 1.05, fog: [25, 120, '#e8b8a0'] }); }
function dawnField(st, o = {}) { const env = nightField(st, { ...o, grass: '#4f6e48', moon: false }); env.sky.stars.visible = false; return env; }

// s09 — "The next morning, sheep were found crowded into corners of fields," Dawn. A tight huddle in a fence corner; farmer puzzled.
registerShot('s09', { kind: '3d',
  init(T) {
    const st = dawnStage(T, { target: [0, 0.5, -2] });
    const env = dawnField(st, { seed: 12, house: [9, -24, -0.5], trees: [[-10, -20, 1.4]] });
    const f1 = railFence({ len: 8 }); f1.position.set(-1, 0, -4); st.add(f1);
    const f2 = railFence({ len: 8 }); f2.position.set(-5, 0, 0); f2.rotation.y = Math.PI / 2; st.add(f2);
    const huddle = []; const r = rng(5); for (let i = 0; i < 11; i++) { const sh = sheep({ seed: 50 + i, scale: 0.95 }); const row = Math.floor(i / 4), c = i % 4;
      sh.position.set(-4.3 + c * 0.75 + row * 0.35 + (r() - 0.5) * 0.2, 0, -3.3 + row * 0.95 + (r() - 0.5) * 0.2); sh.rotation.y = Math.PI + 0.6 + (r() - 0.5) * 0.6; st.add(sh); huddle.push({ sh, ph: r() }); }
    const fm = farmer({ seed: 7 }); fm.position.set(1.4, 0, 0.6); fm.rotation.y = -0.9; st.add(fm);
    return { stage: st, env, huddle, fm };
  },
  draw(s, t, info) {
    s.env.update(t);
    s.huddle.forEach(h => h.sh.update(t, { lid: 0.1, tremble: 0.6, pant: 0.4, headUp: 0.1, look: [0.3, 0], ph: h.ph }));
    s.fm.pose(addPose(POSE.handsHips, idle(t, 4, 0.5))); s.fm.face(mixExpr(EXPR.neutral, EXPR.suspicious, prog(t, 0.6, 1.0)), t);
    const cut = at(info, 'corners', 1.4) - 0.1;
    if (t < cut) camMove(s.stage, t, [[0, { pos: [2.5, 3.2, 6.5], look: [-1.5, 0.8, -2], fov: 40 }], [cut, { pos: [2.3, 3.0, 6.0], look: [-1.5, 0.8, -2], fov: 40 }]]);
    else camMove(s.stage, t - cut, [[0, { pos: [-0.2, 1.6, 2.6], look: [-3.2, 0.8, -2.6], fov: 38 }], [info.dur - cut + 0.01, { pos: [-0.4, 1.55, 2.3], look: [-3.2, 0.8, -2.6], fov: 38 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: { from: [-60, 300], strength: 0.4 }, tint: '#ffb890', tintAmount: 0.15 });
    stamp(g, t, 'NEXT MORNING', { at: 0.05, x: 300, y: 330, size: 62, color: '#ffffff', fill: '#c0702a', rot: -0.08 });
    reactions(g, t, s, [{ fx: 'question', on: 'fm', at: 0.7, until: at(info, 'corners', 1.4) - 0.1 }]);
  },
});

// s10 — "some panting with terror under hedges." Close: two sheep pressed under a hedge, panting, trembling.
registerShot('s10', { kind: '3d',
  init(T) {
    const st = dawnStage(T, { fov: 32, target: [0, 0.5, 0], shadowSize: 5 });
    const env = dawnField(st, { seed: 13, trees: [[6, -18, 1.4]] });
    const h = hedge({ len: 10, h: 2.2, seed: 6, color: '#2f5034' }); h.position.set(0, 0, -0.8); st.add(h);
    const a = sheep({ seed: 61, scale: 1.1 }); a.position.set(-0.45, 0, 0.0); a.rotation.y = 0.25; st.add(a);
    const b = sheep({ seed: 62, scale: 1.0 }); b.position.set(0.85, 0, -0.25); b.rotation.y = -0.35; st.add(b);
    return { stage: st, env, a, b };
  },
  draw(s, t, info) {
    s.env.update(t);
    s.a.update(t, { pant: 1, tremble: 1, lid: 0.0, look: [0.4, 0], headUp: 0.1, lidAngle: -0.3 });
    s.b.update(t, { pant: 0.8, tremble: 0.8, lid: 0.05, look: [-0.5, 0.1], headUp: 0.0, lidAngle: -0.3, ph: 1.3 });
    camMove(s.stage, t, [[0, { pos: [0.3, 1.3, 5.6], look: [0.2, 0.8, 0], fov: 32 }], [info.dur, { pos: [0.2, 1.25, 4.8], look: [0.2, 0.85, 0], fov: 32 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#ffb890', tintAmount: 0.12 });
    reactions(g, t, s, [{ fx: 'sweat', on: 'a', at: 0.2, height: 1.3 }, { fx: 'sweat', on: 'b', at: 0.5, height: 1.3 }]);
    stamp(g, t, 'PANTING WITH TERROR', { at: at(info, 'panting', 0.3) - 0.1, x: 540, y: 380, size: 60, color: '#ffffff', fill: '#b8322a', rot: -0.04 });
  },
});

// s11 — "The Times wrote that a thousand men" Newspaper, 20 Nov 1888, the quote highlighted.
registerShot('s11', { kind: '3d',
  init(T) { const st = dawnStage(T, { target: [0, 0.5, -2] }); const env = dawnField(st, { seed: 14, house: [3, -14, -0.2], fenceZ: -3, trees: [[-7, -18, 1.4]] }); return { stage: st, env }; },
  draw(s, t, info) { s.env.update(t); camMove(s.stage, t, [[0, { pos: [0, 2.2, 7], look: [0, 1.5, -10], fov: 40 }], [info.dur, { pos: [0, 2.2, 6.5], look: [0, 1.5, -10], fov: 40 }]]); },
  overlay(g, t, info, s) {
    dimScene(g, 6, 0.45);
    const z = 1 + ease.inOut(prog(t, at(info, 'thousand', 1.2) - 0.1, at(info, 'thousand', 1.2) + 0.5)) * 0.12;
    newspaper(g, t, { at: 0, y: 780, zoom: z * 0.88, hl: at(info, 'thousand', 1.0) - 0.1, lines: ['"A THOUSAND MEN', 'COULD NOT HAVE', 'FRIGHTENED AND RELEASED', 'ALL THESE SHEEP."'] });
  },
});

// s12 — "could not have frightened and released all these sheep." A line of farmers at dawn shrug at the empty field.
registerShot('s12', { kind: '3d',
  init(T) {
    const st = dawnStage(T, { fov: 40, target: [0, 1, 0], shadowSize: 9 });
    const env = dawnField(st, { seed: 15, fenceZ: -3, fenceLen: 20, trees: [[-8, -16, 1.4], [9, -20, 1.5]] });
    const fms = [-3, -1.5, 0, 1.5, 3].map((x, i) => { const f = farmer({ seed: 20 + i, skin: ['fair', 'light', 'tan', 'fair', 'olive'][i], beard: i % 2 === 0, coat: ['#6a5a3e', '#4a5a6a', '#7a4a32', '#5a6a4a', '#6a4a5a'][i] }); f.position.set(x, 0, Math.abs(x) * -0.25); f.rotation.y = -x * 0.08; st.add(f); return f; });
    return { stage: st, env, fms };
  },
  draw(s, t, info) {
    s.env.update(t);
    const sh0 = at(info, 'released', 1.4) - 0.2;
    s.fms.forEach((f, i) => { const k = ease.inOut(clamp((t - sh0 - i * 0.05) / 0.3)); f.pose(addPose(shrug(POSE.stand, k), idle(t, 3 + i, 0.4))); f.face(mixExpr(EXPR.deadpan, EXPR.worried, k), t); });
    camMove(s.stage, t, [[0, { pos: [0, 2.6, 8.5], look: [0, 1.7, 0], fov: 40 }], [info.dur, { pos: [0, 2.5, 7.6], look: [0, 1.7, 0], fov: 40 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: { from: [-60, 300], strength: 0.4 }, tint: '#ffb890', tintAmount: 0.15 });
    stamp(g, t, '1,000 MEN?', { at: 0.05, x: 540, y: 340, size: 76, color: '#ffffff', fill: '#2a4a6a', rot: -0.05 });
    stamp(g, t, 'COULD NOT', { at: at(info, 'not', 0.3) - 0.05, x: 560, y: 500, size: 82, color: '#e23b2e', fill: 'rgba(250,244,226,0.92)', rot: 0.08 });
  },
});

// s13 — "And a year later..." a big year card over a dark empty field
registerShot('s13', { kind: '3d',
  init(T) { const st = nightStage(T, { fov: 40 }); const env = nightField(st, { seed: 16, hedgeZ: -10, fenceZ: -2, trees: [[-6, -16, 1.4]] }); return { stage: st, env }; },
  draw(s, t, info) { s.env.update(t); camMove(s.stage, t, [[0, { pos: [0, 1.6, 6], look: [0, 1.2, -8], fov: 40 }], [info.dur, { pos: [0, 1.6, 5.4], look: [0, 1.2, -8], fov: 40 }]]); },
  overlay(g, t, info, s) {
    nightLook(g, t); dimScene(g, 3, 0.35);
    drawInsert(g, { type: 'bigtext', kicker: 'A YEAR LATER', title: '1889', size: 230, color: '#ffd25a' }, t);
  },
});

// s14 — "it happened again. In Berkshire." Another field, a signpost "BERKSHIRE", another flock bolting past.
registerShot('s14', { kind: '3d',
  init(T) {
    const st = nightStage(T, { fov: 42, target: [0, 0.5, -2], shadowSize: 12 });
    const env = nightField(st, { seed: 17, hedgeZ: -9, hedgeLen: 40, house: [-8, -22, 0.5], trees: [[8, -18, 1.4]] });
    const post = new THREE.Group(); post.add(cyl(0.08, 0.1, 2.6, '#6a5440', 0, 1.3, 0, 8));
    const tex = canvasTex(512, 128, (x, W, H) => { x.fillStyle = '#efe6cf'; x.fillRect(0, 0, W, H); x.strokeStyle = '#2a1c15'; x.lineWidth = 10; x.strokeRect(5, 5, W - 10, H - 10); x.fillStyle = '#2a1c15'; x.font = '900 70px "Nunito"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('BERKSHIRE', W / 2, H / 2 + 4); });
    const sign = rbox(1.9, 0.48, 0.08, '#efe6cf', 0.75, 2.25, 0, 0.03); post.add(sign);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(1.84, 0.44), toon('#ffffff', { map: tex, emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.25, emissiveMap: tex })); face.position.set(0.75, 2.25, 0.045); face.userData.noOutline = true; post.add(face);
    outline(post, { px: 2.4 }); post.position.set(-0.6, 0, 1.6); post.rotation.y = 0.1; st.add(post);
    const fl = flock(st, { n: 12, cx: -6, cz: -2.5, w: 5, d: 3.5, seed: 41 });
    return { stage: st, env, fl, post };
  },
  draw(s, t, info) {
    s.env.update(t);
    s.fl.forEach(f => { const sp = 3.6 * (0.85 + f.k * 0.3); f.s.position.set(f.x + sp * (t + 0.2) * 0.75, 0, f.z); f.s.rotation.y = Math.PI / 2 + (f.ph - 0.5) * 0.3; f.s.update(t, { run: 1, speed: 3.3, ph: f.ph * 3, lid: 0, shine: 1, blink: false, headUp: 0.3 }); });
    camMove(s.stage, t, [[0, { pos: [0.2, 1.8, 9.0], look: [-0.6, 1.2, -2], fov: 44 }], [info.dur, { pos: [0.6, 1.8, 8.4], look: [0.2, 1.2, -2], fov: 44 }]]);
  },
  overlay(g, t, info, s) {
    nightLook(g, t);
    stamp(g, t, 'AGAIN', { at: at(info, 'again.', 0.7) - 0.1, x: 540, y: 380, size: 96, color: '#ffffff', fill: '#b8322a', rot: -0.07 });
  },
});

// s15 — "The best explanation ever published?" Nature, 27 Jan 1921 — "an explanation", shown as a journal card.
registerShot('s15', { kind: '3d',
  init(T) { const st = nightStage(T, { fov: 40 }); const env = nightField(st, { seed: 18, hedgeZ: -10, fenceZ: -2.5, trees: [[5, -15, 1.4]] }); return { stage: st, env }; },
  draw(s, t, info) { s.env.update(t); camMove(s.stage, t, [[0, { pos: [0, 1.6, 6], look: [0, 1.4, -8], fov: 40 }], [info.dur, { pos: [0, 1.6, 5.2], look: [0, 1.4, -8], fov: 40 }]]); },
  overlay(g, t, info, s) {
    nightLook(g, t); dimScene(g, 5, 0.45);
    journal(g, t, { at: 0, y: 900 });
    stamp(g, t, 'ONE EXPLANATION', { at: at(info, 'explanation', 0.6) - 0.1, x: 540, y: 330, size: 66, color: '#ffffff', fill: '#2a4a6a', rot: -0.05 });
  },
});

// s16 — "An intensely dark night, with occasional flashes of lightning." Pitch-dark field; two lightning flashes light the flock.
registerShot('s16', { kind: '3d',
  init(T) {
    const st = nightStage(T, { fov: 44, target: [0, 0.5, -4], exposure: 0.9, keyI: 0.6, bg: ['#020308', '#060a18', '#0e1428'] });
    const env = nightField(st, { seed: 19, hedgeZ: -12, fenceZ: 1, fenceLen: 16, trees: [[-8, -18, 1.4], [9, -24, 1.6]], moon: false });
    const fl = flock(st, { n: 14, cx: 0, cz: -5, w: 8, d: 5, seed: 51 });
    return { stage: st, env, fl };
  },
  draw(s, t, info) {
    s.env.update(t);
    const f1 = at(info, 'flashes', 1.8) - 0.05, f2 = at(info, 'lightning.', 2.4) - 0.05, fk = flashK(t, [f1, f2]);
    s.stage.exposure = 0.9 + fk * 2.2; if (s.stage.scene) s.stage.scene.traverse && 0;
    const jump = ease.outBack(clamp((t - f1) / 0.15));
    s.fl.forEach(f => f.s.update(t, { lid: lerp(0.5, 0, jump), headUp: lerp(-0.4, 0.6, jump), shine: 0.7, squash: jump * 0.2 * (1 - clamp((t - f1 - 0.2) / 0.3)), tremble: jump, blink: false, ph: f.ph }));
    camMove(s.stage, t, [[0, { pos: [0, 2.6, 7], look: [0, 1.6, -6], fov: 44 }], [info.dur, { pos: [0, 2.4, 6.0], look: [0, 1.6, -6], fov: 44 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: f1, amp: 0.05, dur: 0.3 }, { fx: 'shake', at: f2, amp: 0.05, dur: 0.3 }]);
  },
  overlay(g, t, info, s) {
    nightLook(g, t, { vig: 0.85 });
    const f1 = at(info, 'flashes', 1.8) - 0.05, f2 = at(info, 'lightning.', 2.4) - 0.05, fk = flashK(t, [f1, f2]);
    if (fk > 0) { bolt(g, t - f2 >= 0 ? 760 : 300, 120, 520, t - f2 >= 0 ? 7 : 3, fk); g.save(); g.fillStyle = `rgba(200,215,255,${fk * 0.55})`; g.fillRect(0, 0, 1080, 1920); g.restore(); }
    stamp(g, t, 'INTENSELY DARK', { at: at(info, 'intensely', 0.2) - 0.1, until: f1 - 0.05, x: 540, y: 360, size: 74, color: '#ffffff', fill: '#141a30', rot: -0.04 });
  },
});

// s17 — "And sheep are notoriously timid." Close: one sheep, wide eyes, trembling, sweat.
registerShot('s17', { kind: '3d',
  init(T) {
    const st = nightStage(T, { fov: 30, target: [0, 0.6, 0], shadowSize: 5 });
    const env = nightField(st, { seed: 20, hedgeZ: -6, trees: [[4, -12, 1.2]] });
    const sh = sheep({ seed: 9, scale: 1.25 }); sh.rotation.y = 0.3; st.add(sh);
    return { stage: st, env, sh };
  },
  draw(s, t, info) {
    s.env.update(t);
    s.sh.update(t, { lid: 0.0, tremble: 1, look: [Math.sin(t * 5) > 0 ? 0.5 : -0.5, 0.1], headTurn: Math.sin(t * 4) * 0.25, shine: 0.15, lidAngle: -0.35, blink: false, headUp: 0.3 });
    camMove(s.stage, t, [[0, { pos: [0.9, 1.25, 4.6], look: [0.3, 1.05, 0], fov: 30 }], [info.dur, { pos: [0.8, 1.25, 3.9], look: [0.35, 1.1, 0], fov: 30 }]]);
  },
  overlay(g, t, info, s) {
    nightLook(g, t);
    reactions(g, t, s, [{ fx: 'sweat', on: 'sh', at: 0.15, height: 1.4 }]);
    stamp(g, t, 'NOTORIOUSLY TIMID', { at: at(info, 'notoriously', 0.4) - 0.1, x: 540, y: 380, size: 66, color: '#ffffff', fill: '#6a4a8a', rot: -0.05 });
  },
});

// s18 — PAYOFF + LOOP. "To this day, nobody knows what really set them off." Frame 1's field and framing: the flock stands
// frozen, eyes shining, staring into the dark... then bolts — cut back to frame 1, where it is already running.
registerShot('s18', { kind: '3d',
  init(T) { return stampedeSet(T); },
  draw(s, t, info) {
    const go = info.dur - 0.6 - 1 / 24, k = clamp((t - go) / 0.6), tau = 0.6 * k * k;   // eases into the bolt (tau 0.6 at the cut = frame 1)
    stampede(s, t, tau, k, { lid: lerp(0.05, 0, k), headUp: 0.4, shine: 1, noBlink: true });
    const cut = at(info, 'nobody', 1.3) - 0.1;   // close on the front row's shining eyes, then the frame-1 wide for the loop
    if (t < cut) camMove(s.stage, t, [[0, { pos: [0.2, 1.9, -0.4], look: [0.1, 0.9, -7], fov: 36 }], [cut, { pos: [0.2, 1.8, -1.0], look: [0.1, 0.9, -7], fov: 36 }]]);
    else camMove(s.stage, t - cut, [[0, { pos: [0.9, 1.4, 5.2], look: [0, 1.15, -5], fov: 46 }], [info.dur - cut, HERO0]], ease.inOut);
  },
  overlay(g, t, info, s) {
    nightLook(g, t);
    stamp(g, t, 'UNSOLVED', { at: at(info, 'nobody', 0.6) - 0.1, until: info.dur - 0.3, x: 540, y: 400, size: 96, color: '#ffffff', fill: '#b8322a', rot: -0.06 });
  },
});
