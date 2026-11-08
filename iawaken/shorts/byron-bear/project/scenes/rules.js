// s03, s04, s07, s08: the rule book, the porter's blank stare, "Dogs? Not allowed." / "Bears? Apparently fine."
import { registerShot, ease, prog, clamp, lerp, E } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, shrug, shake, point } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { THREE, at, tag, iconBadge, court, porter, theBear } from './_lib.js';

// s03 "According to legend, the rules said" — the college rule book: dogs, dogs, dogs... the camera reads down, then across
registerShot('s03', { kind: '3d',
  init(T) { const s = court(T, { target: [5, 0, 4], shadowSize: 4 }); s.tb = PR.table({ w: 2.2, d: 1.4, h: 1.0, color: '#6a3e24' }).at(5, 0, 4); s.stage.add(s.tb);
    s.bk = PR.book({ title: 'COLLEGE RULES', left: ['*1. No dogs.', '2. No dogs in Hall.', '3. No dogs in Chapel.', '4. No dogs. At all.', '5. Seriously.'], right: ['6. Gowns at dinner.', '7. No noise after ten.', '8. No dogs (again).', '~ . . .', '~ . . .', '~ . . .'] }).at(5, 1.06, 4.0); s.stage.add(s.bk);
    s.stage.add(PR.candle().at(4.05, 1.06, 3.6), PR.inkpot().at(6.0, 1.06, 3.55)); return s; },
  draw(s, t, info) { s.set.update(t); const L = 5 - 0.42, R = 5 + 0.42;
    camMove(s.stage, t, [[0, { pos: [L, 3.0, 5.7], look: [L, 1.1, 3.95], fov: 34 }], [info.dur * 0.55, { pos: [L, 2.9, 5.8], look: [L, 1.1, 4.15], fov: 34 }], [info.dur, { pos: [R, 2.95, 5.75], look: [R, 1.1, 4.05], fov: 34 }]]); },
  overlay(g, t, info) { tag(g, 'ACCORDING TO LEGEND', ease.out(prog(t, 0.05, 0.35)), 0.14); },
});
// s04 "nothing about bears." — the porter looks up from the book, straight into the lens. The bear leans into frame and waves.
registerShot('s04', { kind: '3d',
  init(T) { const s = court(T, { target: [5, 0, 3.4], shadowSize: 5 }); s.tb = PR.table({ w: 2.2, d: 1.4, h: 1.0, color: '#6a3e24' }).at(5, 0, 4); s.stage.add(s.tb); s.stage.add(PR.book({ title: 'COLLEGE RULES' }).at(5, 1.06, 4.0));
    s.po = porter(); s.po.position.set(5, 0, 2.95); s.stage.add(s.po); s.be = theBear({ scale: 1.08 }); s.be.position.set(6.55, 0, 3.4); s.be.rotation.y = -0.35; s.stage.add(s.be); return s; },
  draw(s, t, info) { s.set.update(t); const b = at(info, 'bears.', 0.8); const up = ease.inOut(prog(t, b - 0.35, b));
    s.po.pose(addPose({ ...POSE.holdFront, lean: 0.35 * (1 - up), headNod: 0.55 * (1 - up) }, idle(t, 3))); s.po.face(mixExpr({ ...EXPR.neutral, pupil: [0, -0.8], lid: 0.45 }, { ...EXPR.deadpan, pupil: [0, 0], lid: 0.5 }, up), t);
    const lean = ease.outBack(prog(t, b + 0.15, b + 0.45)); s.be.position.x = lerp(7.4, 6.45, clamp(lean)); s.be.update(t, { lid: 0.3, look: [-0.4, 0], headTilt: -0.25 * lean, wave: clamp(lean), smile: 1 });
    camMove(s.stage, t, [[0, { pos: [5.45, 2.3, 10.2], look: [5.45, 1.8, 3.6], fov: 30 }], [info.dur, { pos: [5.45, 2.25, 9.6], look: [5.45, 1.8, 3.6], fov: 30 }]]); },
  overlay(g, t, info) { const b = at(info, 'bears.', 0.8); tag(g, 'BEARS: NOT MENTIONED', ease.out(prog(t, b, b + 0.3)), 0.14); },
});
// s07 "Dogs? Not allowed." — the porter by the NO DOGS sign wags a finger; banned-dog badge pops
registerShot('s07', { kind: '3d',
  init(T) { const s = court(T, { target: [2, 0, 1.5], shadowSize: 5 }); s.po = porter(); s.po.position.set(1.25, 0, 1.9); s.po.rotation.y = 0.25; s.stage.add(s.po); return s; },
  draw(s, t, info) { s.set.update(t); const n = at(info, 'Not', 1.15);
    const wag = ease.out(prog(t, n - 0.2, n + 0.05)); const base = point({ ...POSE.attention }, 'L', wag, { up: 0.9 });
    s.po.pose(addPose(base, { ...idle(t, 3), ...(t > n ? shake(t, 0.18, 2.5) : {}) })); s.po.face(mixExpr(EXPR.neutral, { ...EXPR.suspicious, browAngle: 0.5 }, wag), t);
    camMove(s.stage, t, [[0, { pos: [1.95, 2.1, 8.6], look: [1.95, 1.9, 1.3], fov: 33 }], [info.dur, { pos: [1.95, 2.1, 8.0], look: [1.95, 1.9, 1.3], fov: 33 }]]); },
  overlay(g, t, info) { iconBadge(g, 'dog', false, prog(t, 0.08, 0.35), E.W * 0.5, E.H * 0.2, 110); },
});
// s08 "Bears? Apparently fine." — the bear waves at the porter; the porter shrugs, deadpan; approved-bear badge
registerShot('s08', { kind: '3d',
  init(T) { const s = court(T, { target: [1.6, 0, 1.8], shadowSize: 6 }); s.po = porter(); s.po.position.set(1.95, 0, 1.75); s.po.rotation.y = -0.45; s.stage.add(s.po);
    s.be = theBear({ scale: 1.08 }); s.be.position.set(0.15, 0, 2.3); s.be.rotation.y = 0.65; s.stage.add(s.be); return s; },
  draw(s, t, info) { s.set.update(t); const f = at(info, 'fine.', 1.6);
    s.be.update(t, { lid: 0.3, look: [0.2, 0], wave: ease.out(prog(t, 0.1, 0.4)), smile: 1, headTilt: 0.12 });
    const sh = ease.inOut(prog(t, f - 0.3, f + 0.1)); s.po.pose(addPose(shrug(POSE.attention, sh), idle(t, 3))); s.po.face({ ...EXPR.deadpan, lid: lerp(0.4, 0.62, sh), pupil: [sh > 0.5 ? 0 : 0.6, 0] }, t);
    camMove(s.stage, t, [[0, { pos: [1.1, 2.1, 10.0], look: [1.05, 1.85, 1.9], fov: 32 }], [info.dur, { pos: [1.1, 2.1, 9.4], look: [1.05, 1.85, 1.9], fov: 32 }]]); },
  overlay(g, t, info) { iconBadge(g, 'bear', true, prog(t, 0.08, 0.35), E.W * 0.5, E.H * 0.2, 110); },
});
