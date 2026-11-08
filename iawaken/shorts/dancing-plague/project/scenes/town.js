// s05, s06, s07, s17: Frau Troffea's street. s17 returns to the empty morning street for the single first step (loop).
import { registerShot, ease, prog, clamp, lerp, E } from '/engine/core.js';
import { camMove, drift } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, walk } from '/kits/toon3d/rig.js';
import { applyLight } from '/kits/toon3d/sets.js';
import { THREE, at, tag, street, LIGHTS, dance, troffea, townsfolk } from './_lib.js';

// s05 "Strasbourg, July." — establishing: the empty half-timbered street, the red sandstone spire at the end
registerShot('s05', { kind: '3d',
  init(T) { return street(T, { ...LIGHTS.morning, target: [0, 0, -8], shadowSize: 16 }); },
  draw(s, t, info) { camMove(s.stage, t, [[0, { pos: [0.6, 1.4, 10], look: [-0.6, 7.5, -30], fov: 46 }], [info.dur, { pos: [0.3, 1.9, 7.5], look: [-0.8, 7.0, -30], fov: 44 }]]); },
  overlay(g, t) { tag(g, 'STRASBOURG · JULY 1518', ease.out(prog(t, 0.05, 0.35))); },
});

// s06 "A woman named Frau Troffea starts dancing in the street." — she steps out of her door, taps a foot... and goes.
// A neighbour (with a broom) stops and stares (reaction).
registerShot('s06', { kind: '3d',
  init(T) { const s = street(T, { ...LIGHTS.morning, target: [0, 0, 0], shadowSize: 8 }); s.tr = troffea(); s.tr.position.set(-0.4, 0, 0.9); s.stage.add(s.tr);
    s.nb = townsfolk(3); s.nb.position.set(1.7, 0, 1.9); s.nb.rotation.y = -0.9; s.stage.add(s.nb); return s; },
  draw(s, t, info) { const st = at(info, 'starts', 1.66), dn = at(info, 'dancing', 1.88);
    const k = clamp((t - dn) / 0.35);
    if (t < st) { s.tr.pose(addPose(POSE.relaxed, idle(t, 2))); s.tr.face(EXPR.neutral, t); }
    else { dance(s.tr, t - st, 0, ease.out(k) * 0.9 + 0.1 * clamp((t - st) / 0.2)); s.tr.face(mixExpr(EXPR.neutral, { ...EXPR.grin, lid: 0.3 }, k), t); }
    s.tr.rotation.y = 0.15 + (t > dn ? Math.sin((t - dn) * 1.4) * 0.6 : 0);
    const r = clamp((t - dn - 0.4) / 0.25); s.nb.pose(addPose(mixPose(POSE.holdFront, POSE.panic, ease.outBack(r) * 0.6), idle(t, 3))); s.nb.face(mixExpr(EXPR.neutral, EXPR.shocked, r), t);
    camMove(s.stage, t, [[0, { pos: [0.4, 2.0, 7.6], look: [0.2, 1.6, 0.9], fov: 36 }], [info.dur, { pos: [0.3, 2.0, 6.4], look: [0.1, 1.65, 0.9], fov: 34 }]]); },
  overlay(g, t, info) { const a = at(info, 'Frau', 0.7); tag(g, 'FRAU TROFFEA', ease.out(prog(t, a - 0.05, a + 0.25))); },
});

// s07 "For days." — time-lapse: sun, dusk, night, morning... she keeps dancing; a DAY counter ticks up
const CYCLE = ['morning', 'noon', 'dusk', 'night', 'morning', 'noon', 'dusk', 'night', 'morning', 'noon', 'dusk', 'night'];
registerShot('s07', { kind: '3d',
  init(T) { const s = street(T, { ...LIGHTS.morning, target: [0, 0, 0], shadowSize: 8 }); s.tr = troffea(); s.tr.position.set(0, 0, 1.0); s.stage.add(s.tr);
    s.bgs = {}; for (const n of ['morning', 'noon', 'dusk', 'night']) { const L = n === 'night' ? { light: 'night' } : LIGHTS[n]; s.bgs[n] = L; } s.cur = ''; return s; },
  draw(s, t, info) { const i = Math.min(CYCLE.length - 1, Math.floor(t / info.dur * CYCLE.length)); const n = CYCLE[i];
    if (n !== s.cur) { applyLight(s.stage, s.bgs[n].light, s.bgs[n].bg ? { bg: s.bgs[n].bg } : {}); s.cur = n; }
    const tired = clamp(t / info.dur); dance(s.tr, t * 1.3, 0, 1, { tired: tired > 0.5 }); s.tr.rotation.y = Math.sin(t * 3) * 0.5;
    s.tr.face(mixExpr({ ...EXPR.grin, lid: 0.3 }, { ...EXPR.deadpan, lid: 0.7, mouth: 'wavy' }, tired), t);
    s.stage.cam([0, 2.1, 6.8], [0, 1.6, 1.0], 36); },
  overlay(g, t, info) { const d = 1 + Math.min(5, Math.floor(t / info.dur * 6)); tag(g, `DAY ${d}`, 1, 0.14, { size: 64 }); },
});

// s17 "And it all started with one step." — the empty morning street again; Troffea alone takes ONE step... (s18 = s01: the crowd)
registerShot('s17', { kind: '3d',
  init(T) { const s = street(T, { ...LIGHTS.morning, target: [0, 0, 2], shadowSize: 8 }); s.tr = troffea(); s.tr.position.set(0, 0, 2.2); s.stage.add(s.tr); return s; },
  draw(s, t, info) { const st = at(info, 'step', 1.29); const k = ease.inOut(prog(t, st - 0.15, st + 0.15));
    const pose = mixPose(addPose(POSE.relaxed, idle(t, 2)), { ...POSE.stand, legR: [0.55, 0.1], kneeR: 0.7, armL: [0.3, 0.9, 0.3], armR: [0.3, 0.9, 0.3], elbowL: 0.8, elbowR: 0.8, bob: 0.06 }, Math.sin(k * Math.PI));
    s.tr.pose(pose); s.tr.rotation.y = 0; s.tr.face(t > st + 0.2 ? { ...EXPR.smug, pupil: [0, 0] } : { ...EXPR.neutral, pupil: [0, -0.6] }, t);
    camMove(s.stage, t, [[0, { pos: [0.3, 2.5, 9.2], look: [0, 1.7, -1], fov: 44 }], [info.dur, { pos: [0.3, 2.3, 7.4], look: [0, 1.75, 1.0], fov: 40 }]]); },
});
