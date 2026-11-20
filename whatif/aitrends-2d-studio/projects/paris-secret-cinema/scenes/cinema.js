// The Secret Cinema Under Paris — 16 shots, Toon 3D. WTF, deadpan. No gore; UX members only as silhouettes.
import { registerShot } from '/engine/core.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { drawInsert, dimScene } from '/kits/toon3d/insert.js';
import {
  at, THREE, toonStage, camMove, tunnel, cinema, cop, torchPose, filmTins, rollingTin, phoneSet, speaker, noteTex,
  torchDark, vignette, hook2, stamp, mapCard, noteCard, PR, rbox, cyl, ball, plane, glow, bean, POSE, EXPR, addPose, mixPose, mixExpr, idle, point, tremble,
  clamp, lerp, ease, prog, noise, project, insT, CARD_INK,
} from './_lib.js';

const GOLD = '#ffd25a', RED = '#ff4a3a', W = '#ffffff';
const CAVE = { light: 'warm', fov: 40, shadowSize: 12, target: [0, 1, -1], exposure: 0.95, bg: '#120e10' };
// frame-1 / last-frame camera in the cinema (same framing so the loop is seamless)
const HOOK0 = { pos: [0.6, 2.4, 7.6], look: [0, 2.2, -3], fov: 46 }, HOOK1 = { pos: [0.4, 2.3, 6.6], look: [0, 2.2, -3], fov: 44 };
// beam origins (bottom corners, as if held by two officers just behind the camera)
const SRC = [{ x: 150, y: 1960 }, { x: 960, y: 1980 }];
const wob = (t, s) => [noise(t * 1.3, s) * 0.25, noise(t * 1.1, s + 4) * 0.15, 0];

// s01 — HOOK. Pitch-dark cave; two torch beams sweep in and land on red seats, the screen and the bar. Already moving.
registerShot('s01', { kind: '3d',
  init(T) { const st = toonStage(T, CAVE); const set = cinema(st, { noProj: true }); return { stage: st, set }; },
  draw(s, t, info) { camMove(s.stage, t, [[0, HOOK0], [info.dur, HOOK1]], ease.out); if (s.set.reels) s.set.reels.forEach(r => (r.rotation.x = t * 3)); },
  overlay(g, t, info, s) {
    const a = ease.inOut(prog(t, 0, 1.1)), b = ease.inOut(prog(t, 0.15, 1.3));
    const w1 = wob(t, 1), w2 = wob(t, 7);
    torchDark(g, s.stage, [
      { p: [lerp(-6.5, -1.0, a) + w1[0], lerp(4.5, 1.0, a) + w1[1], -1.8], r: 400, from: SRC[0] },
      { p: [lerp(5.5, 0.4, b) + w2[0], lerp(1.0, 3.5, b) + w2[1], -7.2], r: 430, from: SRC[1] },
    ], { dark: 0.84, extra: [{ x: 300, y: 1050, r: 260, a: 0.4 * a }] });
    hook2(g, t, [[['2004', GOLD]], [['a', W], ['secret', W], ['CINEMA', GOLD], ['under', W], ['PARIS', RED]]], { y: 270, sizes: [104, 70], gap: 118, lead: 0.3 });
  },
});

// s02 — two officers in the tunnel, torches up; jaws drop.
registerShot('s02', { kind: '3d',
  init(T) {
    const st = toonStage(T, { ...CAVE, target: [0, 1, 0] }); const set = tunnel(st, { seed: 2 });
    const c1 = cop({ seed: 5 }); c1.position.set(-0.8, 0, 0.3); c1.rotation.y = Math.PI + 0.25; st.add(c1); c1.place(st);
    const c2 = cop({ seed: 9, skin: 'tan', hair: 'curly', moustache: true }); c2.position.set(0.85, 0, 0.6); c2.rotation.y = Math.PI - 0.3; st.add(c2); c2.place(st);
    return { stage: st, set, c1, c2 };
  },
  draw(s, t, info) {
    const sh = prog(t, 0.35, 0.6);
    [s.c1, s.c2].forEach((c, i) => { c.pose(addPose(torchPose(t, 3 + i, 0.25), { headNod: -0.1, ...tremble(t, sh * 0.6) })); c.face(mixExpr(EXPR.neutral, EXPR.shocked, sh), t); c.syncTorch(); });
    camMove(s.stage, t, [[0, { pos: [0.2, 2.2, -6.4], look: [0, 1.6, 0.4], fov: 44 }], [info.dur, { pos: [0.1, 2.15, -5.7], look: [0, 1.65, 0.4], fov: 42 }]]);
  },
  overlay(g, t, info, s) {
    const lp = (c) => project(s.stage, c.lens.getWorldPosition(new THREE.Vector3()));
    const l1 = lp(s.c1), l2 = lp(s.c2);
    torchDark(g, s.stage, [], { dark: 0.72, extra: [{ x: E2(l1.x), y: l1.y - 260, r: 520, a: 0.95 }, { x: E2(l2.x), y: l2.y - 260, r: 520, a: 0.95 }, { x: 540, y: 1000, r: 700, a: 0.5 }] });
    hook2(g, t, [[['2004', GOLD]], [['a', W], ['secret', W], ['CINEMA', GOLD], ['under', W], ['PARIS', RED]]], { y: 270, sizes: [104, 70], gap: 118, until: Math.max(0.2, 3.5 - info.shot.start), lead: 1 });
    reactions(g, t, s, [{ fx: 'exclaim', on: 'c1', at: 0.4, color: '#ff3b30' }, { fx: 'exclaim', on: 'c2', at: 0.5, color: '#ff3b30' }]);
  },
});
const E2 = (x) => x;

// s03 — "Deep in the catacombs, beneath the Trocadéro." map card over the dark tunnel
registerShot('s03', { kind: '3d',
  init(T) { const st = toonStage(T, CAVE); const set = tunnel(st, {}); return { stage: st, set }; },
  draw(s, t, info) { camMove(s.stage, t, [[0, { pos: [0, 1.7, 4], look: [0, 1.6, -10], fov: 50 }], [info.dur, { pos: [0, 1.7, 2.5], look: [0, 1.6, -10], fov: 50 }]]); },
  overlay(g, t, info, s) { torchDark(g, s.stage, [{ p: [0, 1.4, -6], r: 300 }], { dark: 0.85 }); dimScene(g, 6, 0.3); mapCard(g, t, {}); },
});

// s04 — the vaulted tunnel, push down the passage, a torch beam ahead
registerShot('s04', { kind: '3d',
  init(T) { const st = toonStage(T, { ...CAVE, target: [0, 1, -6] }); const set = tunnel(st, { seed: 5 }); return { stage: st, set }; },
  draw(s, t, info) { camMove(s.stage, t, [[0, { pos: [0.3, 1.9, 5], look: [0, 1.7, -10], fov: 48 }], [info.dur, { pos: [0.1, 1.85, 1.5], look: [0, 1.65, -10], fov: 46 }]], ease.inOut); },
  overlay(g, t, info, s) {
    const w = wob(t, 3); torchDark(g, s.stage, [{ p: [w[0] + Math.sin(t * 1.2) * 0.6, 1.5 + w[1], -7], r: 420, from: SRC[1] }], { dark: 0.78, extra: [{ x: 540, y: 1300, r: 600, a: 0.5 }] });
    stamp(g, t, 'THE CATACOMBS', { at: 0.2, x: 540, y: 330, size: 84, color: W, fill: '#2a2f45', border: GOLD, rot: -0.05 });
  },
});

// s05 — the ossuary wall (tidy toon bones), slow pan; counter 6,000,000+
registerShot('s05', { kind: '3d',
  init(T) { const st = toonStage(T, { ...CAVE, target: [0, 1, -4] }); const set = tunnel(st, { bones: true, seed: 7 }); return { stage: st, set }; },
  draw(s, t, info) { camMove(s.stage, t, [[0, { pos: [1.2, 1.4, 2], look: [-1.95, 1.1, -2.5], fov: 44 }], [info.dur, { pos: [1.2, 1.4, 0.4], look: [-1.95, 1.1, -4.2], fov: 44 }]]); },
  overlay(g, t, info, s) {
    torchDark(g, s.stage, [{ p: [-1.95, 1.1 + Math.sin(t) * 0.15, -3 - t * 0.5], r: 560, from: SRC[1] }], { dark: 0.68 });
    const c0 = Math.max(0.15, at(info, 'six', 0.6) - 0.25); if (t > c0) { dimScene(g, 2, 0.15); drawInsert(g, { type: 'counter', title: 'REMAINS OF', value: 6000000, from: 0, suffix: '+', lines: ['PEOPLE'], color: GOLD }, t - c0); }
  },
});

// s06 — the cinema, lit: big screen glowing, rows of red seats. "GIANT SCREEN"
registerShot('s06', { kind: '3d',
  init(T) { const st = toonStage(T, { ...CAVE, exposure: 1.05 }); const set = cinema(st, { noProj: true }); return { stage: st, set }; },
  draw(s, t, info) { camMove(s.stage, t, [[0, { pos: [0, 3.2, 8.5], look: [0, 3.0, -6], fov: 48 }], [info.dur, { pos: [0, 2.9, 6.5], look: [0, 3.1, -6], fov: 46 }]]); if (s.set.reels) s.set.reels.forEach(r => (r.rotation.x = t * 3)); },
  overlay(g, t, info, s) {
    vignette(g, 0.6);
    stamp(g, t, 'GIANT SCREEN', { at: at(info, 'screen', 0.5) - 0.2, x: 540, y: 330, size: 80, color: W, fill: '#b8322a', rot: -0.05 });
  },
});

// s06b — "seats for an audience": low dolly along the rows of red velvet seats, screen glowing beyond
registerShot('s06b', { kind: '3d',
  init(T) { const st = toonStage(T, { ...CAVE, target: [0, 1, -1] }); const set = cinema(st); return { stage: st, set }; },
  draw(s, t, info) { camMove(s.stage, t, [[0, { pos: [-5.2, 3.4, 5.4], look: [0, 1.0, -1.6], fov: 44 }], [info.dur, { pos: [-4.4, 3.2, 4.8], look: [0.3, 1.0, -1.8], fov: 42 }]]); },
  overlay(g, t, info, s) { vignette(g, 0.55); stamp(g, t, 'SEATS', { at: at(info, 'seats', 0.9) - 0.15, x: 540, y: 330, size: 84, color: W, fill: '#b8322a', rot: -0.05 }); },
});

// s07 — the projector, light beam through dust. "PROJECTOR"
registerShot('s07', { kind: '3d',
  init(T) { const st = toonStage(T, { ...CAVE, target: [0, 2, 3] }); const set = cinema(st); return { stage: st, set }; },
  draw(s, t, info) { camMove(s.stage, t, [[0, { pos: [4.6, 3.4, 8.6], look: [0, 2.0, 2.6], fov: 44 }], [info.dur, { pos: [4.0, 3.2, 8.0], look: [0, 2.0, 2.4], fov: 42 }]]); if (s.set.reels) s.set.reels.forEach(r => (r.rotation.x = t * 4)); },
  overlay(g, t, info, s) { vignette(g, 0.55); stamp(g, t, 'PROJECTOR', { at: 0.15, x: 540, y: 330, size: 80, color: W, fill: '#2a2f45', border: GOLD, rot: -0.05 }); },
});

// s08 — film tins: thrillers and film noir; one rolls toward camera
registerShot('s08', { kind: '3d',
  init(T) {
    const st = toonStage(T, { ...CAVE, target: [0, 0.5, 0], shadowSize: 5 }); const set = cinema(st, { empty: true });
    const tb = PR.table({ w: 2.6, d: 1.4, h: 1.0, color: '#5a3a24' }); st.add(tb);
    const stack = filmTins(); stack.position.set(-0.5, 1.06, -0.1); st.add(stack);
    const stack2 = filmTins(); stack2.position.set(0.55, 1.06, -0.2); stack2.scale.y = 0.75; st.add(stack2);
    const roll = rollingTin(); st.add(roll);
    return { stage: st, set, roll };
  },
  draw(s, t, info) {
    const r0 = at(info, 'noir', 1.2) - 0.3, k = clamp((t - r0) / 0.9);
    s.roll.position.set(lerp(1.2, 0.9, k), 1.06 + 0.7, lerp(-0.4, 0.5, k)); s.roll.scale.setScalar(0.8); s.roll.rotation.set(0, 0, Math.PI / 2); s.roll.rotateY(0); s.roll.children.forEach(() => {}); s.roll.rotation.x = -k * 3;
    s.roll.visible = true; if (k >= 1) { s.roll.position.y = 1.06 + 0.7 - (t - r0 - 0.9) * 0; }
    camMove(s.stage, t, [[0, { pos: [0, 3.6, 5.6], look: [0, 1.3, 0], fov: 40 }], [info.dur, { pos: [0, 3.3, 5.0], look: [0, 1.3, 0], fov: 38 }]]);
  },
  overlay(g, t, info, s) {
    vignette(g, 0.6);
    stamp(g, t, 'THRILLERS', { at: at(info, 'thrillers', 0.6) - 0.15, x: 330, y: 330, size: 70, color: W, fill: '#b8322a', rot: -0.08 });
    stamp(g, t, 'FILM NOIR', { at: at(info, 'noir', 1.2) - 0.2, x: 720, y: 470, size: 70, color: W, fill: '#1e1e24', border: W, rot: 0.06 });
  },
});

// s09 — "But here's the part that gets weirder..." the officer turns slowly to the lens; punch-in
registerShot('s09', { kind: '3d',
  init(T) {
    const st = toonStage(T, { ...CAVE, target: [0, 1.5, 0] }); const set = cinema(st);
    const c = cop({ seed: 9, skin: 'tan', hair: 'curly', moustache: true }); c.position.set(0.0, 0, 4.6); c.rotation.y = Math.PI; st.add(c); c.place(st);
    return { stage: st, set, c };
  },
  draw(s, t, info) {
    const turn = ease.inOut(prog(t, 0.3, 1.0));
    s.c.rotation.y = lerp(Math.PI, 0.05, turn);
    s.c.pose(addPose(mixPose(torchPose(t, 4, 0.0), POSE.stand, turn * 0.6), { headTurn: 0 })); s.c.face(mixExpr(EXPR.neutral, { ...EXPR.suspicious, lid: 0.3, lower: 0.15 }, turn), t); s.c.syncTorch();
    const cut = Math.min(info.dur - 0.45, 1.15);
    if (t < cut) camMove(s.stage, t, [[0, { pos: [0, 2.6, 9.4], look: [0, 2.0, 4.6], fov: 40 }], [cut, { pos: [0, 2.5, 8.8], look: [0, 2.0, 4.6], fov: 40 }]]);
    else camMove(s.stage, t - cut, [[0, { pos: [0, 2.2, 7.6], look: [0, 2.05, 4.6], fov: 36 }], [info.dur - cut, { pos: [0, 2.2, 7.4], look: [0, 2.05, 4.6], fov: 35 }]]);
  },
  overlay(g, t, info, s) { vignette(g, 0.7); reactions(g, t, s, [{ fx: 'question', on: 'c', at: 0.9, scale: 0.9 }]); stamp(g, t, 'BUT...', { at: 0.1, x: 540, y: 1150, size: 96, color: GOLD, fill: 'rgba(20,16,20,0.85)', rot: -0.06 }); },
});

// s10 — the bar: counter, bottles, string lights. "FULLY STOCKED BAR"
registerShot('s10', { kind: '3d',
  init(T) { const st = toonStage(T, { ...CAVE, target: [-7, 1, 1] }); const set = cinema(st); return { stage: st, set }; },
  draw(s, t, info) { camMove(s.stage, t, [[0, { pos: [-3.2, 2.5, 4.6], look: [-7.6, 1.8, 0.6], fov: 42 }], [info.dur, { pos: [-3.8, 2.4, 3.8], look: [-7.6, 1.8, 0.8], fov: 40 }]]); },
  overlay(g, t, info, s) { vignette(g, 0.5); stamp(g, t, 'FULLY STOCKED BAR', { at: at(info, 'bar.', 0.4) - 0.2, x: 540, y: 330, size: 76, color: W, fill: '#7a3a1e', rot: -0.05 }); reactions(g, t, s, [{ fx: 'sparkle', on: [-7.6, 2.4, 0.4], at: 0.3, scale: 0.8 }]); },
});

// s11 — the restaurant: tables, cloths, candles, chairs. "+ A RESTAURANT"
registerShot('s11', { kind: '3d',
  init(T) { const st = toonStage(T, { ...CAVE, target: [6.6, 1, 0.8] }); const set = cinema(st); return { stage: st, set }; },
  draw(s, t, info) { camMove(s.stage, t, [[0, { pos: [2.6, 3.0, 5.6], look: [6.6, 1.1, 0.4], fov: 44 }], [info.dur, { pos: [3.2, 2.8, 4.9], look: [6.6, 1.1, 0.4], fov: 42 }]]); },
  overlay(g, t, info, s) { vignette(g, 0.5); stamp(g, t, '+ A RESTAURANT', { at: 0.1, x: 540, y: 330, size: 80, color: W, fill: '#2f6a3a', rot: -0.05 }); },
});

// s12 — power cable + phone line snaking off into the dark. "SOURCE: ???"
registerShot('s12', { kind: '3d',
  init(T) { const st = toonStage(T, { ...CAVE, target: [0, 0.5, -2] }); const set = tunnel(st, { seed: 9 }); const ph = phoneSet(st); ph.group.position.set(0.6, 0, 1.2); return { stage: st, set, ph }; },
  draw(s, t, info) {
    s.ph.handset.position.y = 1.32 + (Math.sin(t * 40) > 0.6 && t % 1 < 0.5 ? 0.03 : 0);
    camMove(s.stage, t, [[0, { pos: [1.4, 1.9, 4.6], look: [0.6, 0.8, 0.6], fov: 42 }], [info.dur, { pos: [1.0, 1.6, 4.0], look: [0.3, 0.4, -6], fov: 44 }]]);
  },
  overlay(g, t, info, s) {
    torchDark(g, s.stage, [{ p: [lerp(0.8, 0.6, prog(t, 0, info.dur)), lerp(1.0, 0.1, prog(t, 0.5, info.dur)), lerp(1.2, -6, prog(t, 0.6, info.dur))], r: 360, from: SRC[0] }], { dark: 0.86 });
    stamp(g, t, 'POWER + PHONE', { at: 0.1, x: 540, y: 330, size: 72, color: W, fill: '#2a2f45', border: GOLD, rot: -0.05 });
    stamp(g, t, 'SOURCE: ???', { at: at(info, 'unknown', 1.5) - 0.1, x: 560, y: 1130, size: 76, color: GOLD, fill: 'rgba(20,16,20,0.85)', rot: 0.07 });
  },
});

// s13 — the "guard dogs": a speaker on a crate plays WOOF WOOF; the officer jumps.
registerShot('s13', { kind: '3d',
  init(T) {
    const st = toonStage(T, { ...CAVE, target: [0, 1, 0] }); const set = tunnel(st, { seed: 11 });
    const sp = speaker(); sp.position.set(-0.9, 0, -0.6); sp.rotation.y = 0.35; st.add(sp);
    const c = cop({ seed: 5 }); c.position.set(1.5, 0, 0.9); c.rotation.y = -0.9; st.add(c); c.place(st);
    return { stage: st, set, sp, c };
  },
  draw(s, t, info) {
    const w0 = at(info, 'barking', 1.0) - 0.25, jump = clamp((t - w0) / 0.25), land = ease.out(clamp((t - w0 - 0.3) / 0.4));
    s.c.position.y = Math.sin(clamp((t - w0) / 0.5) * Math.PI) * 0.45;
    s.c.pose(addPose(mixPose(torchPose(t, 6, 0.1), POSE.panic, jump * (1 - land * 0.5)), tremble(t, jump))); s.c.face(mixExpr(EXPR.suspicious, EXPR.panic, jump), t); s.c.syncTorch();
    const pulse = t > w0 ? Math.abs(Math.sin((t - w0) * 14)) : 0; s.sp.cone.scale.set(1 + pulse * 0.15, 1, 1 + pulse * 0.15);
    const pc = at(info, 'recording', 1.8) - 0.1;
    if (t < pc) camMove(s.stage, t, [[0, { pos: [0.2, 2.2, 6.2], look: [0.1, 1.3, -0.2], fov: 44 }], [pc, { pos: [0.1, 2.15, 5.6], look: [0.1, 1.3, -0.2], fov: 43 }]]);
    else camMove(s.stage, t - pc, [[0, { pos: [-0.3, 1.8, 3.4], look: [-0.8, 1.3, -0.6], fov: 44 }], [info.dur - pc, { pos: [-0.3, 1.8, 3.1], look: [-0.8, 1.3, -0.6], fov: 44 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: w0, amp: 0.05, dur: 0.5 }]);
  },
  overlay(g, t, info, s) {
    torchDark(g, s.stage, [{ p: [-0.9, 1.3, -0.6], r: 420, from: SRC[1] }, { p: [1.5, 1.6, 0.9], r: 360 }], { dark: 0.7 });
    const w0 = at(info, 'barking', 1.0) - 0.25, sp = project(s.stage, [-0.9, 1.4, -0.2]);
    if (t > w0) { for (let i = 0; i < 3; i++) { const age = ((t - w0) * 1.6 + i / 3) % 1; g.save(); g.strokeStyle = `rgba(255,220,120,${1 - age})`; g.lineWidth = 9; g.beginPath(); g.arc(sp.x, sp.y, 60 + age * 260, -0.9, 0.9); g.stroke(); g.restore(); }
      const k1 = ease.outBack(clamp((t - w0) / 0.25)), k2 = ease.outBack(clamp((t - w0 - 0.35) / 0.25));
      g.save(); g.translate(sp.x + 250, sp.y - 260); g.scale(k1, k1); g.rotate(-0.12); insT(g, 'WOOF!', 0, 0, 104, { color: GOLD, stroke: CARD_INK }); g.restore();
      g.save(); g.translate(sp.x + 120, sp.y - 420); g.scale(k2, k2); g.rotate(0.1); insT(g, 'WOOF!', 0, 0, 84, { color: W, stroke: CARD_INK }); g.restore(); }
    stamp(g, t, 'SECURITY SYSTEM', { at: 0.05, x: 540, y: 330, size: 72, color: W, fill: '#2a2f45', border: GOLD, rot: -0.05 });
    stamp(g, t, 'RECORDING', { at: at(info, 'recording', 0.9) - 0.1, x: 300, y: 1130, size: 64, color: RED, fill: 'rgba(250,244,226,0.92)', rot: -0.1 });
  },
});

// s14 — "A secretive group called the U.X. took responsibility." silhouettes at the tunnel end, backlit
registerShot('s14', { kind: '3d',
  init(T) {
    const st = toonStage(T, { ...CAVE, target: [0, 1, -6] }); const set = tunnel(st, { seed: 13 });
    const fig = [-1.2, -0.4, 0.4, 1.2].map((x, i) => { const b = bean({ outfit: 'uniform', head: i % 2 ? 'beanie' : 'hood', silhouette: true, seed: 30 + i, scale: 0.95 + (i % 3) * 0.04 }); b.position.set(x, 0, -7 - (i % 2) * 0.5); st.add(b); return b; });
    const gl = glow(10, '#ffcf8a', 0.55); gl.position.set(0, 1.8, -9.5); st.add(gl);
    return { stage: st, set, fig };
  },
  draw(s, t, info) {
    s.fig.forEach((b, i) => { b.pose(addPose(i === 1 ? POSE.handsHips : POSE.stand, idle(t, 10 + i, 0.6))); b.face(EXPR.neutral, t); });
    camMove(s.stage, t, [[0, { pos: [0, 1.7, 1.5], look: [0, 1.5, -7], fov: 40 }], [info.dur, { pos: [0, 1.7, -0.3], look: [0, 1.5, -7], fov: 40 }]]);
  },
  overlay(g, t, info, s) {
    torchDark(g, s.stage, [{ p: [0, 1.6, -8.5], r: 520, a: 0.95 }], { dark: 0.86, color: '#0a0606' });
    stamp(g, t, 'LES UX', { at: at(info, 'U.X.', 0.9) - 0.2, x: 540, y: 340, size: 110, color: GOLD, fill: 'rgba(20,16,20,0.88)', rot: -0.06 });
    stamp(g, t, 'TOOK RESPONSIBILITY', { at: at(info, 'responsibility.', 1.6) - 0.3, x: 540, y: 1150, size: 60, color: W, fill: '#b8322a', rot: 0.04 });
  },
});

// s15 — "When police came back to investigate, it had all been dismantled." same cave, empty, cut wires
registerShot('s15', { kind: '3d',
  init(T) {
    const st = toonStage(T, CAVE); const set = cinema(st, { empty: true });
    const c1 = cop({ seed: 5 }); c1.position.set(-1.2, 0, 2.2); c1.rotation.y = Math.PI + 0.2; st.add(c1); c1.place(st);
    const c2 = cop({ seed: 9, skin: 'tan', hair: 'curly', moustache: true }); c2.position.set(1.3, 0, 2.6); c2.rotation.y = Math.PI - 0.25; st.add(c2); c2.place(st);
    return { stage: st, set, c1, c2 };
  },
  draw(s, t, info) {
    const d0 = at(info, 'dismantled.', 1.6) - 0.3, sh = prog(t, d0, d0 + 0.3);
    [s.c1, s.c2].forEach((c, i) => { c.pose(addPose(mixPose(torchPose(t, 7 + i, 0.2), POSE.handsHips, sh * 0.0), { headTurn: Math.sin(t * 1.5 + i * 2) * 0.35 * (1 - sh) })); c.face(mixExpr(EXPR.suspicious, EXPR.shocked, sh), t); c.syncTorch(); });
    if (t < d0) camMove(s.stage, t, [[0, { pos: [0.4, 3.0, 8.4], look: [0, 2.0, -3], fov: 46 }], [d0, { pos: [0.3, 2.9, 7.8], look: [0, 2.0, -3], fov: 45 }]]);
    else camMove(s.stage, t - d0, [[0, { pos: [0.3, 2.9, 6.6], look: [0, 1.9, -4], fov: 46 }], [info.dur - d0, { pos: [0.3, 2.85, 6.2], look: [0, 1.9, -4], fov: 45 }]]);
  },
  overlay(g, t, info, s) {
    const lp = (c) => project(s.stage, c.lens.getWorldPosition(new THREE.Vector3()));
    const sw = (k) => Math.sin(t * 1.4 + k) * 2.2;
    torchDark(g, s.stage, [{ p: [sw(0), 0.2, -2.5], r: 300, from: lp(s.c1) }, { p: [sw(2) * 0.8, 3.4, -7.6], r: 320, from: lp(s.c2) }, { p: [0, 1.6, 2.4], r: 620, a: 0.8 }, { p: [0, 4.5, -7.8], r: 480, a: 0.7 }], { dark: 0.68 });
    stamp(g, t, 'GONE', { at: at(info, 'dismantled.', 1.6) - 0.15, x: 540, y: 340, size: 110, color: RED, fill: 'rgba(250,244,226,0.92)', rot: -0.08 });
    reactions(g, t, s, [{ fx: 'sweat', on: 'c2', at: at(info, 'dismantled.', 1.6) }]);
  },
});

// s16 — PAYOFF: same dark cave + camera as frame 1; both beams find a note on the bare floor. "NE CHERCHEZ PAS" -> loop.
registerShot('s16', { kind: '3d',
  init(T) {
    const st = toonStage(T, CAVE); const set = cinema(st, { empty: true, noProj: true });
    const note = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.92), new THREE.MeshToonMaterial({ map: noteTex() })); note.rotation.x = -Math.PI / 2; note.rotation.z = 0.15; note.position.set(0, 0.02, -2.0); note.receiveShadow = true; st.add(note);
    return { stage: st, set, note };
  },
  draw(s, t, info) { camMove(s.stage, t, [[0, HOOK1], [info.dur, HOOK0]], ease.inOut); },
  overlay(g, t, info, s) {
    const n0 = at(info, 'note...', 0.5), k = ease.inOut(prog(t, 0, n0));
    torchDark(g, s.stage, [
      { p: [lerp(-4, -0.05, k), 0.05, lerp(-5, -2.0, k)], r: lerp(300, 280, k), from: SRC[0] },
      { p: [lerp(4, 0.08, k), 1.5 - 1.45 * k, lerp(-7, -2.05, k)], r: lerp(320, 280, k), from: SRC[1] },
    ], { dark: 0.9 });
    const d0 = at(info, 'search."', n0 + 0.6, 1), c0 = n0 + 0.05;
    if (t > c0) noteCard(g, t - c0, { y: E_H * 0.42, en: d0 - c0 - 0.1 });
  },
});
const E_H = 1920;
