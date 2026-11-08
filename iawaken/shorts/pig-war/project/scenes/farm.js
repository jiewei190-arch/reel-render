// s06-s09: the potato patch, the farmer, the (off-screen) shot, the arrest threat.
import { registerShot, ease, prog, clamp, lerp } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, tremble, point, shake } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { THREE, at, tag, bang, stageOf, pig, farmer, ukOfficial, musket, holdMusket, potatoPatch, fir, birds } from './_lib.js';

function farmInit(T, o = {}) { const s = stageOf(T, { target: [0, 0, -1], shadowSize: 8, meadow: { sea: true, seaZ: -26, treeSpots: [[-6, -7], [5.5, -8], [-3, -11], [8, -5], [-9, -4]] } });
  s.patch = potatoPatch(s.stage, 0, -0.6, 4, 7, 3);
  s.stage.add(PR.fence({ len: 10, gap: 1.6 }).at(0, 0, -3.4));
  const cab = PR.facade({ w: 4, h: 2.6, d: 3, color: '#a8784a', trim: '#6a4a2a', windows: 1 }).at(-4.6, 0, -7, 0.35); s.stage.add(cab);
  return s; }
// s06 "A British company's pig eats" — the pig trots into the patch and starts munching, very pleased
registerShot('s06', { kind: '3d',
  init(T) { const s = farmInit(T); s.p = pig({ seed: 2 }); s.stage.add(s.p); return s; },
  draw(s, t, info) { const e = at(info, 'eats', 1.35); const walkK = 1 - prog(t, e - 0.4, e);
    const x = lerp(-3.2, 0.2, ease.out(prog(t, 0, e))); s.p.position.set(x, 0, 0.35); s.p.rotation.y = lerp(Math.PI / 2, 0.35, ease.inOut(prog(t, e - 0.6, e)));
    s.p.update(t, { walk: walkK, chew: t > e ? 1 : 0, lid: t > e ? 0.62 : 0.35, headNod: t > e ? 0.35 : 0, tail: 1.5 });
    camMove(s.stage, t, [[0, { pos: [-0.8, 1.6, 6.6], look: [-0.6, 0.3, 0.2], fov: 36 }], [info.dur, { pos: [0.2, 1.5, 5.6], look: [0.1, 0.3, 0.3], fov: 35 }]]); },
});
// s07 "an American farmer's potatoes." — the farmer behind his fence: hoe drops, jaw drops. Pig in the foreground keeps eating.
registerShot('s07', { kind: '3d',
  init(T) { const s = farmInit(T); s.p = pig({ seed: 2 }); s.p.position.set(0.55, 0, 0.6); s.p.rotation.y = Math.PI - 0.3; s.stage.add(s.p);
    s.f = farmer(); s.f.position.set(-0.4, 0, -2.6); s.stage.add(s.f); return s; },
  draw(s, t, info) { const k = ease.outBack(prog(t, at(info, 'farmer', 0.4) - 0.1, at(info, 'farmer', 0.4) + 0.2));
    s.p.update(t, { chew: 1, lid: 0.6, headNod: 0.35, tail: 1.5 });
    s.f.pose(addPose(mixPose(POSE.holdFront, { ...POSE.panic, armL: [0.5, 1.6, 0.3], armR: [0.5, 1.6, 0.3] }, k), idle(t, 3)));
    s.f.face(mixExpr(EXPR.happy, EXPR.shocked, k), t);
    camMove(s.stage, t, [[0, { pos: [1.1, 1.3, 3.2], look: [-0.3, 1.5, -2.6], fov: 34 }], [info.dur, { pos: [1.0, 1.35, 2.6], look: [-0.35, 1.7, -2.6], fov: 32 }]]); },
});
// s08 "So he shoots it." — the farmer, furious, rifle upright; on "shoots": BANG! card, birds burst out of the fir. (The pig is never shown.)
registerShot('s08', { kind: '3d',
  init(T) { const s = farmInit(T); s.f = farmer(); s.f.position.set(0, 0, 0.8); s.stage.add(s.f); s.m = musket(); s.stage.add(s.m);
    s.tree = fir(1.4, 7).at(1.6, 0, -2.5); s.stage.add(s.tree); s.b = birds(7, 4); s.b.position.set(1.6, 4.2, -2.5); s.stage.add(s.b); return s; },
  draw(s, t, info) { const sh = at(info, 'shoots', 0.36), k = prog(t, sh, sh + 0.12);
    s.f.pose(addPose({ ...POSE.stand, armR: [0.35, 0.2, 0.2], elbowR: 1.1, armL: [0.6, 0.1, 0.6], elbowL: 1.3 }, { ...idle(t, 4), ...tremble(t, k > 0 ? 3 * (1 - prog(t, sh, sh + 0.5)) : 0), lean: -0.06 * k }));
    s.f.face(t < sh ? { ...EXPR.angry, lid: 0.45 } : mixExpr(EXPR.shocked, EXPR.deadpan, prog(t, sh + 0.3, sh + 0.8)), t); holdMusket(s.f, s.m);
    s.b.update(t, sh);
    camMove(s.stage, t, [[0, { pos: [-0.4, 2.0, 6.4], look: [0.4, 2.05, 0], fov: 36 }], [info.dur, { pos: [-0.3, 2.0, 5.8], look: [0.4, 2.1, 0], fov: 35 }]]); },
  overlay(g, t, info) { const sh = at(info, 'shoots', 0.36); const k = prog(t, sh, sh + 0.25) * (1 - prog(t, sh + 0.7, sh + 0.95)); bang(g, k, 1080 * 0.5, 1920 * 0.17); },
});
// s09 "Britain threatens to arrest him." — a British official wags a finger with a scroll; the farmer sweats
registerShot('s09', { kind: '3d',
  init(T) { const s = farmInit(T); s.o = ukOfficial(); s.o.position.set(0.8, 0, 0.4); s.o.rotation.y = -0.7; s.f = farmer(); s.f.position.set(-0.75, 0, 0.6); s.f.rotation.y = 0.6; s.stage.add(s.o, s.f);
    s.sc = PR.scroll(); s.sc.scale.setScalar(1.1); s.o.hold('L', s.sc); s.sc.rotation.set(0, 0, 1.4); return s; },
  draw(s, t, info) { const a = at(info, 'arrest', 0.9);
    const wag = Math.sin(t * 14) * 0.18; s.o.pose(addPose(point({ ...POSE.stand, armL: [0.9, 0.2, 0.4], elbowL: 1.2 }, 'R', ease.out(prog(t, 0.05, 0.3)), { up: 0.45 }), { armR: [0, wag, 0], ...idle(t, 2) }));
    s.o.face(t > a ? { ...EXPR.angry, mouth: 'open' } : EXPR.angry, t);
    s.f.pose(addPose(mixPose(POSE.stand, { ...POSE.stand, shrugY: 0.05, armL: [0.3, 0.2, 0], armR: [0.3, 0.2, 0], elbowL: 1, elbowR: 1, lean: -0.08 }, ease.inOut(prog(t, a - 0.1, a + 0.3))), { ...tremble(t, 1), ...idle(t, 5) }));
    s.f.face(mixExpr(EXPR.worried, { ...EXPR.panic, mouth: 'wavy' }, prog(t, a, a + 0.3)), t);
    camMove(s.stage, t, [[0, { pos: [0.05, 1.9, 7.0], look: [0, 1.45, 0.5], fov: 36 }], [info.dur, { pos: [0.05, 1.9, 6.4], look: [0, 1.5, 0.5], fov: 35 }]]); },
});
