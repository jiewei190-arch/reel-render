// War of the Bucket (1325): 12 shots, Toon 3D. EMOTION: LOL. Slapstick armies, nobody hurt; the bucket is the star.
// Timing: every shot's start comes from lines.json + the voice's word timings (build_short.py); inside a shot, beats sync to words with at().
import { registerShot } from '/engine/core.js';
import {
  at, E, THREE, toonStage, camMove, meadow, tree, soldier, general, bucket, well, town, museumCase, hall, dust, MOD, BOL,
  POSE, EXPR, addPose, mixPose, mixExpr, idle, walk, run, point, shrug, nod, reactions, shakeCam, sunnyLook,
  topCaption, stamp, yearStamp, burst, label, counter, flashFill, insT, CARD_INK, voidBg, PR, FX, rng, clamp, lerp, ease, prog, cyl, rbox, ball, toon, outline, handPos,
} from './_lib.js';

const SOFT = { rays: false, tint: '#ffe0b0' };
const RAYS = { rays: { from: [-70, -60], strength: 0.7 }, tint: '#ffd49a' };
const TOP = ['Italy, 1325:', 'about 39,000 soldiers showed up'];
const TOP_UNTIL = 3.4;

// a block of soldiers: n beans in rows, facing +X (s=1) or -X (s=-1)
function army(st, side, n, x0, z0, dir, seed = 1) {
  const r = rng(seed); const L = [];
  for (let i = 0; i < n; i++) { const b = soldier(side, { seed: seed * 10 + i, skin: ['fair', 'light', 'olive', 'tan'][i % 4], moustache: i % 3 === 0 ? '#3a2416' : false });
    const row = Math.floor(i / 4), col = i % 4; b.home = [x0 - dir * row * 1.3 + (r() - 0.5) * 0.4, z0 + col * 1.3 - 2 + (row % 2) * 0.5]; b.ph = r(); b.rotation.y = dir * Math.PI / 2; st.add(b); L.push(b); }
  return L;
}
function charge(L, t, dir, speed = 3.2, k = 1) { L.forEach((b, i) => { b.position.set(b.home[0] + dir * speed * t * k, 0, b.home[1]); b.pose(k > 0 ? run(t + b.ph, { speed: 2.4 }) : addPose(POSE.stand, idle(t, i))); b.face(i % 2 ? EXPR.angry : { ...EXPR.angry, mouth: 'scream' }, t); }); }

// ---- s01 (frame 1): two armies already charging at each other across a meadow; the bucket sits in the middle on a little rock.
function fieldInit(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: 44, shadowSize: 16, target: [0, 1, 0] });
  const env = meadow(st, { seed: o.seed || 3, trees: 5 });
  const rock = rbox(1.4, 0.5, 1.0, '#a8a090', 0, 0.25, 0, 0.2); outline(rock, { px: 2.4 }); st.add(rock);
  const bk = bucket(1.4); bk.position.set(0, 0.5, 0); st.add(bk);
  return { stage: st, env, bk };
}
registerShot('s01', { kind: '3d',
  init(T) { const s = fieldInit(T); const mk = (side, n, z0, dir, seed) => { const r = rng(seed); return [...Array(n)].map((_, i) => { const b = soldier(side, { seed: seed * 10 + i, skin: ['fair', 'light', 'olive', 'tan'][i % 4], moustache: i % 3 === 0 ? '#3a2416' : false });
      b.home = [((i % 5) - 2) * 1.05 + (r() - 0.5) * 0.3, z0 - dir * Math.floor(i / 5) * 1.4]; b.ph = r(); b.rotation.y = dir > 0 ? 0 : Math.PI; s.stage.add(b); return b; }); };
    s.red = mk(BOL, 15, -7, 1, 5); s.blue = mk(MOD, 2, 4.5, -1, 2); s.blue[0].home = [-1.9, 4.2]; s.blue[1].home = [1.9, 4.6]; s.d2 = dust({ spread: 5, seed: 6 }); s.stage.add(s.d2); return s; },
  draw(s, t, info) {
    const T0 = t + 0.4; s.env.update(T0);
    const go = (L, dir, sp) => L.forEach((b, i) => { b.position.set(b.home[0], 0, b.home[1] + dir * sp * T0); b.pose(run(T0 + b.ph, { speed: 2.4 })); b.face(i % 2 ? EXPR.angry : { ...EXPR.angry, mouth: 'scream' }, T0); });
    go(s.red, 1, 1.6); go(s.blue, -1, 1.0); s.d2.position.set(0, 0, -10 + 2.2 * T0); s.d2.update(T0 + 1);
    s.bk.rotation.y = t * 1.5; s.bk.position.y = 0.5 + Math.abs(Math.sin(t * 9)) * 0.12;
    camMove(s.stage, t, [[0, { pos: [0.2, 3.6, 10.5], look: [0, 1.2, -2.5], fov: 48 }], [info.dur, { pos: [0.2, 3.2, 9.2], look: [0, 1.2, -2.5], fov: 46 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: 0, amp: 0.05, dur: 3 }]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); reactions(g, t, s, [{ fx: 'sparkle', on: 'bk', at: 0, scale: 0.8 }]); topCaption(g, t, info, TOP, TOP_UNTIL); },
});
// ---- s02: "...over a bucket." both armies freeze nose to nose over the bucket; generals point at it. Question marks.
registerShot('s02', { kind: '3d',
  init(T) { const s = fieldInit(T, { seed: 4 }); s.a = general(MOD); s.a.position.set(-1.05, 0, 1.0); s.a.rotation.y = 0.9; s.b = general(BOL, { seed: 11, skin: 'tan' }); s.b.position.set(1.05, 0, 1.0); s.b.rotation.y = -0.9; s.stage.add(s.a, s.b);
    s.blue = army(s.stage, MOD, 4, -3.4, -2, 1, 7); s.red = army(s.stage, BOL, 4, 3.4, -2, -1, 8); return s; },
  draw(s, t, info) {
    s.env.update(t); charge(s.blue, t, 1, 0, 0); charge(s.red, t, -1, 0, 0);
    const k = ease.outBack(prog(t, 0.1, 0.4));
    s.a.pose(point(addPose(POSE.stand, idle(t, 2)), 'R', k, { up: -0.3 })); s.a.face(EXPR.angry, t);
    s.b.pose(point(addPose(POSE.stand, idle(t, 3)), 'L', k, { up: -0.3 })); s.b.face(EXPR.angry, t);
    s.bk.rotation.y = 0.3; s.bk.position.y = 0.5 + Math.max(0, 1.6 - t * 6) * ease.out(clamp(1 - t * 3));
    camMove(s.stage, t, [[0, { pos: [0, 2.0, 8.4], look: [0, 1.5, 0], fov: 40 }], [info.dur, { pos: [0, 1.9, 7.6], look: [0, 1.4, 0], fov: 39 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'question', on: 'bk', at: 0.3, scale: 0.9 }]); topCaption(g, t, info, TOP, TOP_UNTIL); },
});
// ---- s03: "The truth is pettier." record scratch: freeze frame goes sepia, a LEGEND stamp gets a big red NOT QUITE.
registerShot('s03', { kind: '3d',
  init(T) { const s = fieldInit(T, { seed: 4 }); s.a = general(MOD); s.a.position.set(-0.2, 0, 2.2); s.a.rotation.y = 0.2; s.bk.position.x = 1.6; s.bk.parent.children.forEach(c => { if (c !== s.bk && c.geometry && c.position.y === 0.25) c.position.x = 1.6; }); s.stage.add(s.a); return s; },
  draw(s, t, info) {
    s.env.update(t); s.a.pose(addPose(shrug(POSE.stand, ease.out(prog(t, 0.2, 0.5))), idle(t, 2))); s.a.face(mixExpr(EXPR.neutral, EXPR.smug, prog(t, 0.2, 0.5)), t);
    camMove(s.stage, t, [[0, { pos: [0.5, 2.2, 8.4], look: [0.5, 1.6, 1.2], fov: 36 }], [info.dur, { pos: [0.5, 2.2, 7.6], look: [0.5, 1.7, 1.2], fov: 35 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, SOFT); g.save(); g.globalCompositeOperation = 'color'; g.globalAlpha = 0.55; g.fillStyle = '#b08850'; g.fillRect(0, 0, E.W, E.H); g.restore();
    stamp(g, t - 0.05, 'LEGEND', { y: 470, color: '#7a5a3a', size: 110 });
    stamp(g, t - at(info, 'pettier', 0.5), 'PETTIER', { y: 640, rot: 0.1, size: 120 });
  },
});
// ---- s04: "In 1325, Bologna sent about 32,000 soldiers..." a huge red army pours out of Bologna's gate. Counter.
function bolInit(T) {
    const st = toonStage(T, { light: 'sunny', fov: 46, shadowSize: 18, target: [0, 1, 2] }); const env = meadow(st, { seed: 6, trees: 3 });
    const gt = PR.gate({ w: 4, h: 5, wallW: 26, wallH: 7.5 }); gt.position.set(0, 0, -6); gt.doors[0].rotation.y = -1.6; gt.doors[1].rotation.y = 1.6; st.add(gt);
    const tw = town({ houses: 0, towers: [[-7, 16], [-3.5, 19], [4, 17], [8, 21], [11, 15]] }); tw.position.z = -9; st.add(tw);
    for (const x of [-3, 3]) { const bn = PR.banner({ color: BOL.main, txt: 'BO', w: 1.2, h: 2 }); bn.position.set(x, 4.6, -5.9); st.add(bn); }
    const red = []; const r = rng(9); for (let i = 0; i < 16; i++) { const b = soldier(BOL, { seed: 40 + i, skin: ['fair', 'light', 'olive'][i % 3] }); b.home = [(i % 4 - 1.5) * 1.3 + (r() - 0.5) * 0.3, -6 + Math.floor(i / 4) * -1.4]; b.ph = r(); st.add(b); red.push(b); }
    return { stage: st, env, red };
}
const marchRed = (s, t) => s.red.forEach((b) => { b.position.set(b.home[0], 0, b.home[1] + 2.4 * t + 3.5); b.pose(walk(t + b.ph, { speed: 1.9 })); b.face(EXPR.angry, t); });
registerShot('s04', { kind: '3d',
  init: bolInit,
  draw(s, t, info) {
    s.env.update(t); marchRed(s, t);
    camMove(s.stage, t, [[0, { pos: [5, 3.0, 13], look: [0, 2.2, -2], fov: 48 }], [info.dur, { pos: [3.5, 3.4, 12], look: [0, 2.4, -2], fov: 46 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, RAYS); yearStamp(g, t, 1325, { at: at(info, '1325', 0.1), x: 820, y: 420 });
    label(g, t, at(info, 'bologna', 0.4), 'BOLOGNA', E.W / 2, 1180, 70, { box: '#c23b2e', color: '#ffffff' });
  },
});
// ---- s04b: "...32,000 soldiers..." low angle in front of the marching column; the counter spins up.
registerShot('s04b', { kind: '3d',
  init: bolInit,
  draw(s, t, info) {
    const T0 = t + 1.6; s.env.update(T0); marchRed(s, T0);
    camMove(s.stage, t, [[0, { pos: [1.2, 0.9, 7.5], look: [0, 2.2, 0], fov: 46 }], [info.dur, { pos: [1.0, 0.9, 8.6], look: [0, 2.2, 0], fov: 46 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: 0, amp: 0.025, dur: 3 }]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); counter(g, t, 0.0, 0.6, 0, 32000, E.W / 2, 520, { prefix: '≈ ', size: 120 }); },
});
// ---- s05: "...after little Modena." a tiny hill town, three blue soldiers on its wall gulp.
registerShot('s05', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 38, shadowSize: 12, target: [0, 1, 0] }); const env = meadow(st, { seed: 8, trees: 4 });
    const tw = town({ houses: 5, towers: [[-1.5, 11]] }); tw.position.set(1.5, 0, -2); tw.scale.setScalar(0.8); st.add(tw);
    const bn = PR.banner({ color: MOD.main, txt: 'MO', w: 1, h: 1.6 }); bn.position.set(-3.5, 1.2, 1.2); st.add(bn);
    const g = [0, 1, 2].map(i => { const b = soldier(MOD, { seed: 60 + i, skin: ['light', 'olive', 'fair'][i] }); b.position.set(-1.6 + i * 1.6, 0, 2.2); st.add(b); return b; });
    return { stage: st, env, g };
  },
  draw(s, t, info) {
    s.env.update(t); s.g.forEach((b, i) => { b.pose(addPose(POSE.stand, idle(t, i))); b.face(mixExpr(EXPR.neutral, EXPR.worried, prog(t, 0.15 + i * 0.08, 0.4)), t); b.rotation.y = lerp(0, 0.4, prog(t, 0.3, 0.6)); });
    camMove(s.stage, t, [[0, { pos: [0, 2.6, 10], look: [0, 2.2, 0], fov: 40 }], [info.dur, { pos: [0, 2.4, 8.6], look: [0, 2.0, 0], fov: 38 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); label(g, t, 0.1, 'little MODENA', E.W / 2, 560, 76, { box: MOD.main, color: '#ffd25a' }); reactions(g, t, s, [{ fx: 'sweat', on: s.g[1], at: 0.4 }]); },
});
// ---- s06: "Modena had about 7,000..." versus card: 32,000 vs 7,000, held beat.
registerShot('s06', {
  draw(g, t, info) {
    voidBg(g, '#2a3a5a', '#101626');
    const k = ease.outBack(clamp(t / 0.25));
    const col = (x, n, name, c, tt) => { const kk = ease.outBack(clamp((t - tt) / 0.25)); if (kk <= 0) return; g.save(); g.translate(x, 900); g.scale(kk, kk);
      g.fillStyle = c; g.strokeStyle = CARD_INK; g.lineWidth = 10; g.beginPath(); g.roundRect(-230, -330, 460, 660, 40); g.fill(); g.stroke();
      insT(g, name, 0, -230, 64, { color: '#ffffff', stroke: CARD_INK }); insT(g, n, 0, -60, 104, { color: '#ffd25a', stroke: CARD_INK, maxW: 420 }); insT(g, 'soldiers', 0, 50, 54, { color: '#ffffff', stroke: CARD_INK });
      const dots = name === 'BOLOGNA' ? 32 : 7; for (let i = 0; i < dots; i++) { g.fillStyle = '#ffffff'; g.beginPath(); g.arc(-150 + (i % 8) * 43, 150 + Math.floor(i / 8) * 40, 14, 0, 7); g.fill(); }
      g.restore(); };
    col(290, '≈32,000', 'BOLOGNA', '#c23b2e', 0); col(790, '≈7,000', 'MODENA', '#2f63b8', at(info, '7,000', 0.4) - 0.08);
    g.save(); g.translate(E.W / 2, 900); g.scale(k, k); insT(g, 'VS', 0, 0, 96, { color: '#ffffff', stroke: CARD_INK }); g.restore();
  },
});
// ---- s07: "...and won." Modena cheers; the red army runs off in a dust cloud (unhurt, slapstick).
registerShot('s07', { kind: '3d',
  init(T) { const s = fieldInit(T, { seed: 5 }); s.bk.visible = false; s.blue = army(s.stage, MOD, 4, -0.2, 3.2, 1, 12); s.blue.forEach((b, i) => { b.home = [(i - 1.5) * 1.0, 3.2 + (i % 2) * 0.4]; }); s.red = army(s.stage, BOL, 8, -1, -4, 1, 13); s.d = dust({ spread: 3, seed: 8, size: 1.6 }); s.stage.add(s.d); return s; },
  draw(s, t, info) {
    s.env.update(t);
    s.blue.forEach((b, i) => { b.position.set(b.home[0], Math.abs(Math.sin(t * 7 + i)) * 0.25, b.home[1]); b.rotation.y = 0.6; b.pose(addPose(POSE.armsUp, { armL: [0, Math.sin(t * 9 + i) * 0.3, 0] })); b.face(EXPR.grin, t); });
    s.red.forEach((b, i) => { b.position.set(b.home[0] + 5 * t, 0, b.home[1] - 2 * t); b.rotation.y = Math.PI * 0.62; b.pose(addPose(run(t + b.ph, { speed: 3 }), { armL: [2.4, 0.3, 0], armR: [2.4, -0.3, 0] })); b.face(EXPR.panic, t); });
    s.d.position.set(-1 + 5 * t, 0, -5 - 2 * t); s.d.update(t + 0.5);
    camMove(s.stage, t, [[0, { pos: [0, 2.6, 11], look: [0.3, 1.4, 0], fov: 46 }], [info.dur, { pos: [0.3, 2.5, 10], look: [0.6, 1.4, 0], fov: 45 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); stamp(g, t - 0.05, 'MODENA WON', { y: 470, color: '#2f63b8', size: 104, w: 700 }); reactions(g, t, s, [{ fx: 'sparkle', on: s.blue[1], at: 0.1 }]); },
});
// ---- s08: "Then they reportedly marched to Bologna's gates..." blue soldiers tiptoe up to the closed gate.
function gateInit(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 14, target: [0, 1, -1] }); const env = meadow(st, { seed: 9, trees: 2 });
  const gt = PR.gate({ w: 4, h: 5, wallW: 30, wallH: 7.5 }); gt.position.set(0, 0, -6); st.add(gt);
  for (const x of [-3, 3]) { const bn = PR.banner({ color: BOL.main, txt: 'BO', w: 1.2, h: 2 }); bn.position.set(x, 4.6, -5.9); st.add(bn); }
  const guard = soldier(BOL, { seed: 77, skin: 'tan', moustache: '#2a1a10' }); guard.position.set(2.5, 7.5, -6.6); st.add(guard);
  const w = well(); w.position.set(-4.2, 0, -1.5); st.add(w);
  return { stage: st, env, gt, guard, w };
}
registerShot('s08', { kind: '3d',
  init(T) { const s = gateInit(T); s.blue = [0, 1, 2, 3].map(i => { const b = soldier(MOD, { seed: 80 + i, skin: ['light', 'olive', 'fair', 'tan'][i] }); b.home = [-9 - i * 1.3, 2.5 - (i % 2) * 1.2]; b.ph = i * 0.3; s.stage.add(b); return b; }); return s; },
  draw(s, t, info) {
    s.env.update(t);
    s.blue.forEach((b) => { b.position.set(b.home[0] + 3.4 * t, 0, b.home[1]); b.rotation.y = Math.PI / 2; b.pose(walk(t + b.ph, { speed: 2.2 })); b.face(EXPR.smug, t); });
    s.guard.pose(addPose(POSE.lean, idle(t, 4))); s.guard.face(EXPR.asleep, t);
    camMove(s.stage, t, [[0, { pos: [-8.5, 2.2, 11], look: [-6.5, 1.5, 1.5], fov: 42 }], [info.dur, { pos: [-5.0, 2.2, 11], look: [-3.5, 1.5, 1.5], fov: 42 }]], (k) => k);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); label(g, t, 0.15, '(reportedly)', E.W / 2, 1010, 56, {}); },
});
registerShot('s08b', { kind: '3d',
  init: gateInit,
  draw(s, t, info) {
    s.env.update(t); s.guard.pose(addPose(POSE.lean, idle(t, 4))); s.guard.face(EXPR.asleep, t);
    camMove(s.stage, t, [[0, { pos: [0.5, 3.0, 9], look: [1.5, 5.0, -6], fov: 42 }], [info.dur, { pos: [0.6, 3.2, 8], look: [1.8, 5.4, -6], fov: 40 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); label(g, t, 0.05, "BOLOGNA'S GATE", E.W / 2, 1180, 64, { box: '#c23b2e' }); reactions(g, t, s, [{ fx: 'zzz', on: 'guard', at: 0.1 }]); },
});
// ---- s09: "...and took a bucket from a well," a blue soldier hauls the bucket up out of the well, very pleased.
registerShot('s09', { kind: '3d',
  init(T) { const s = gateInit(T); s.thief = soldier(MOD, { seed: 81, skin: 'olive', spear: false }); s.thief.position.set(-3.4, 0, 0.1); s.thief.rotation.y = 0.35; s.stage.add(s.thief); s.bk = bucket(0.9); s.stage.add(s.bk); return s; },
  draw(s, t, info) {
    s.env.update(t); s.guard.pose(addPose(POSE.lean, idle(t, 4))); s.guard.face(EXPR.asleep, t);
    const tb = at(info, 'bucket', 0.4); const k = ease.out(prog(t, tb - 0.2, tb + 0.4));
    s.thief.pose(addPose(mixPose({ ...POSE.stand, armL: [1.2, 0.1, 0], armR: [1.2, 0.1, 0], elbowL: 0.4, elbowR: 0.4, lean: 0.3 }, { ...POSE.holdFront }, k), idle(t, 5)));
    s.thief.face(mixExpr(EXPR.suspicious, EXPR.grin, k), t);
    const hp = handPos(s.thief, 'R'); const hl = handPos(s.thief, 'L'); s.bk.position.set((hp.x + hl.x) / 2, lerp(-0.4, (hp.y + hl.y) / 2 - 0.75, k), (hp.z + hl.z) / 2 + 0.25); s.bk.position.y = Math.max(s.bk.position.y, k > 0.05 ? 0 : -2);
    camMove(s.stage, t, [[0, { pos: [-2.2, 2.3, 7.2], look: [-3.7, 1.9, -0.6], fov: 38 }], [info.dur, { pos: [-2.4, 2.3, 6.4], look: [-3.7, 2.0, -0.6], fov: 37 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); const tb = at(info, 'bucket', 0.4); reactions(g, t, s, [{ fx: 'sparkle', on: 'bk', at: tb + 0.15, scale: 0.8 }]); },
});
// ---- s10: "...as a trophy." the parade home: the bucket held high on a spear-pole, confetti, TROPHY stamp.
registerShot('s10', { kind: '3d',
  init(T) { const s = fieldInit(T, { seed: 7 }); s.bk.visible = false; s.blue = army(s.stage, MOD, 6, 2, 0.5, -1, 21);
    s.hero = soldier(MOD, { seed: 99, skin: 'olive', spear: false }); s.hero.position.set(0, 0, 2.4); s.stage.add(s.hero); s.top = bucket(1.0); s.stage.add(s.top); return s; },
  draw(s, t, info) {
    s.env.update(t);
    s.blue.forEach((b, i) => { b.position.set(b.home[0] - 0.8 * t, Math.abs(Math.sin(t * 6 + i)) * 0.15, b.home[1]); b.rotation.y = 0.4; b.pose(addPose(POSE.armsUp, { armR: [0, Math.sin(t * 8 + i) * 0.3, 0] })); b.face(EXPR.grin, t); });
    s.hero.pose(addPose(POSE.armsUp, idle(t, 9))); s.hero.face(EXPR.grin, t); s.hero.position.y = Math.abs(Math.sin(t * 5)) * 0.2;
    const hp = handPos(s.hero, 'R'), hl = handPos(s.hero, 'L'); s.top.position.set((hp.x + hl.x) / 2, (hp.y + hl.y) / 2 + 0.1, (hp.z + hl.z) / 2); s.top.rotation.y = t * 2;
    camMove(s.stage, t, [[0, { pos: [0, 1.4, 8.5], look: [0, 2.6, 1.6], fov: 42 }], [info.dur, { pos: [0, 1.4, 7.6], look: [0, 2.8, 1.6], fov: 40 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, RAYS); stamp(g, t - at(info, 'trophy', 0.35), 'TROPHY', { y: 470, color: '#d8a21b', size: 124 });
    for (let i = 0; i < 40; i++) { const x = (i * 97 + t * 60 * (i % 3 + 1)) % E.W, y = ((i * 211) % 800 + t * 500 * (0.6 + (i % 5) * 0.15)) % E.H; g.save(); g.translate(x, y); g.rotate(t * 5 + i); g.fillStyle = ['#2f63b8', '#f2c94a', '#ffffff'][i % 3]; g.fillRect(-10, -5, 20, 10); g.restore(); }
  },
});
// ---- s11: "Modena still has the bucket..." the bucket in a glass case in the town hall; a tourist leans in. Spotlight.
function hallInit(T) {
  const st = toonStage(T, { light: 'warm', fov: 36, shadowSize: 8, target: [0, 1, 0] }); hall(st);
  const mc = museumCase(); st.add(mc); const bk = bucket(1.0); bk.position.set(0, 1.12, 0); bk.rotation.y = 0.4; st.add(bk);
  const plaque = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.35), toon('#ffffff', { map: C_plaque() })); plaque.position.set(0, 0.75, 0.81); plaque.userData.noOutline = true; st.add(plaque);
  const tour = C_tourist(); tour.position.set(1.6, 0, 0.9); tour.rotation.y = -0.9; st.add(tour);
  return { stage: st, mc, bk, tour };
}
import { canvasTex, bean } from './_lib.js';
function C_plaque() { return canvasTex(512, 150, (x, w, h) => { x.fillStyle = '#d8b04a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#7a5a1a'; x.lineWidth = 10; x.strokeRect(5, 5, w - 10, h - 10); x.fillStyle = '#3a2a10'; x.font = '900 52px "Nunito", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('THE BUCKET · 1325', w / 2, h / 2 + 3); }); }
function C_tourist() { return bean({ name: 'Tourist', outfit: 'tee', colors: { main: '#e86a4a', trim: '#ffffff', print: '#ffd25a' }, skin: 'brown', hair: 'curly', hairColor: '#2a1a10', head: 'ballcap', headColor: '#2f63b8', seed: 51 }); }
registerShot('s11', { kind: '3d',
  init: hallInit,
  draw(s, t, info) {
    s.bk.rotation.y = 0.4 + t * 0.4; s.tour.pose(addPose({ ...POSE.stand, lean: 0.3, armR: [0.4, 0.1, 0.4], elbowR: 1.5 }, idle(t, 3))); s.tour.face(mixExpr(EXPR.neutral, EXPR.shocked, prog(t, 0.3, 0.5)), t);
    camMove(s.stage, t, [[0, { pos: [0.4, 2.4, 6.8], look: [0.3, 1.5, 0], fov: 38 }], [info.dur, { pos: [0.3, 2.2, 5.6], look: [0.3, 1.5, 0], fov: 36 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: { from: [540, -200], strength: 0.8 }, tint: '#ffd49a' }); reactions(g, t, s, [{ fx: 'sparkle', on: 'bk', at: 0.1, scale: 0.9 }, { fx: 'exclaim', on: 'tour', at: 0.45, scale: 0.7 }]); label(g, t, 0.15, 'MODENA TOWN HALL', E.W / 2, 400, 60, { box: '#2f63b8' }); },
});
// ---- s12: PAYOFF "...about 700 years later." close on the case; ≈700 YEARS stamp -> hard cut back to s01 (loop).
registerShot('s12', { kind: '3d',
  init: hallInit,
  draw(s, t, info) {
    s.bk.rotation.y = 0.9 + t * 0.3; s.tour.pose(addPose({ ...POSE.stand, lean: 0.3 }, idle(t, 3))); s.tour.face(EXPR.shocked, t);
    camMove(s.stage, t, [[0, { pos: [0.2, 1.9, 4.2], look: [0, 1.5, 0], fov: 34 }], [info.dur, { pos: [0.2, 1.9, 3.7], look: [0, 1.5, 0], fov: 33 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: { from: [540, -200], strength: 0.9 }, tint: '#ffd49a' }); stamp(g, t - 0.12, '≈700 YEARS', { y: 520, color: '#2f63b8', size: 112, w: 680 }); reactions(g, t, s, [{ fx: 'sparkle', on: 'bk', at: 0, scale: 1.1 }]); },
});
