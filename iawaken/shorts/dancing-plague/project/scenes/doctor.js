// s03, s04, s10: the physician. Twist: the cure is more dancing. Hot blood.
import { registerShot, ease, prog, clamp, lerp } from '/engine/core.js';
import { camMove, drift } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, nod } from '/kits/toon3d/rig.js';
import { THREE, at, tag, street, LIGHTS, dance, crowd, physician, townsfolk, steam } from './_lib.js';

// s03 "The doctors' cure?" (+ beat) — the physician strokes his beard in front of the dancing crowd, then a deadpan stare at the lens
registerShot('s03', { kind: '3d',
  init(T) { const s = street(T, { ...LIGHTS.noon, target: [0, 0, 0], shadowSize: 8 }); s.p = physician(); s.p.position.set(0, 0, 2.0); s.stage.add(s.p); s.c = crowd(s.stage, 9, [-3.4, 3.4, -7, -0.5], 17); return s; },
  draw(s, t, info) { const c = at(info, 'cure', 0.57) + 0.4; const k = ease.inOut(prog(t, c, c + 0.3));
    s.c.forEach((b, i) => { dance(b, t * b.spd / 2, b.ph, 1, { spin: 0.5 }); });
    s.p.pose(addPose(mixPose(POSE.thinking, POSE.attention, k), idle(t, 5))); s.p.face(mixExpr({ ...EXPR.suspicious, pupil: [0.5, 0.2] }, { ...EXPR.deadpan, pupil: [0, 0], lid: 0.5 }, k), t);
    camMove(s.stage, t, [[0, { pos: [0, 2.2, 8.4], look: [0, 1.75, 2.0], fov: 36 }], [c, { pos: [0, 2.15, 7.7], look: [0, 1.85, 2.0], fov: 34 }], [info.dur, { pos: [0, 2.12, 7.1], look: [0, 1.95, 2.0], fov: 32 }]]); },
});
// s04 "More dancing." — he breaks into the jig himself, still totally deadpan (quick cut)
registerShot('s04', { kind: '3d',
  init(T) { const s = street(T, { ...LIGHTS.noon, target: [0, 0, 0], shadowSize: 8 }); s.p = physician(); s.p.position.set(0, 0, 2.0); s.stage.add(s.p); s.c = crowd(s.stage, 9, [-3.4, 3.4, -7, -0.5], 17); return s; },
  draw(s, t) { s.c.forEach((b, i) => dance(b, (t + 2) * b.spd / 2, b.ph, 1, { spin: 0.5 }));
    dance(s.p, t * 1.2, 0.2, 1); s.p.rotation.y = Math.sin(t * 4) * 0.3; s.p.face({ ...EXPR.deadpan, pupil: [0, 0], lid: 0.52 }, t);
    s.stage.cam([0, 2.3, 7.6], [0, 1.6, 2.0], 38); },
  overlay(g, t) { tag(g, 'PRESCRIPTION: MORE DANCING', ease.out(prog(t, 0.0, 0.2)), 0.14, { size: 46 }); },
});
// s10 "Doctors blame hot blood." — he feels a dancer's forehead; steam puffs off her coif; he yanks his hand back
registerShot('s10', { kind: '3d',
  init(T) { const s = street(T, { ...LIGHTS.noon, target: [0, 0, 0], shadowSize: 8 }); s.p = physician(); s.p.position.set(-0.75, 0, 1.8); s.p.rotation.y = 0.75; s.stage.add(s.p);
    s.d = townsfolk(7); s.d.position.set(0.7, 0, 1.6); s.d.rotation.y = -0.5; s.stage.add(s.d); s.sm = steam(6); s.sm.position.set(0.7, 2.75, 1.6); s.stage.add(s.sm); return s; },
  draw(s, t, info) { const h = at(info, 'hot', 0.72); const touch = ease.inOut(prog(t, 0.0, 0.4)) * (1 - ease.out(prog(t, h + 0.05, h + 0.25)));
    dance(s.d, t, 0.3, 1, { tired: true }); s.d.face({ ...EXPR.deadpan, lid: 0.62, mouth: 'wavy' }, t);
    s.p.pose(addPose({ ...POSE.stand, armL: [1.45 * touch + 0.05, 0.2, 0], elbowL: 0.3 + (1 - touch) * 0.5, armR: t > h ? [0.6, 0.4, 0.5] : [0.05, 0.16, 0], elbowR: t > h ? 2.0 : 0.12, lean: 0.08 * touch }, idle(t, 1)));
    s.p.face(t > h ? { ...EXPR.shocked, pupil: [0, 0] } : { ...EXPR.suspicious, pupil: [0.6, 0.1] }, t);
    s.sm.update(t, clamp((t - h + 0.1) / 0.2));
    camMove(s.stage, t, [[0, { pos: [0, 2.3, 8.6], look: [0, 1.75, 1.7], fov: 38 }], [info.dur, { pos: [0, 2.3, 8.0], look: [0, 1.8, 1.7], fov: 37 }]]); },
  overlay(g, t, info) { const h = at(info, 'hot', 0.72); tag(g, 'DIAGNOSIS: HOT BLOOD', ease.out(prog(t, h - 0.05, h + 0.2))); },
});
