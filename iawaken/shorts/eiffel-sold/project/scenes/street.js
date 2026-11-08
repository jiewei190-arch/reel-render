// Paris street shots: s01 + s19 (loop), s02 (the second SOLD tag), s03 (HERO + BISCUIT react), s04 (Paris, 1925),
// s12 (Poisson too embarrassed), s16 (a dealer goes to the police), s18 (Lustig leaves the country. Again.)
import { registerShot, ease, prog, clamp, lerp } from '/engine/core.js';
import { camMove, drift } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, walk, run, point, shrug, tremble, WALK_STRIDE } from '/kits/toon3d/rig.js';
import { castMember, cat } from '/kits/toon3d/cast.js';
import { THREE, at, tag, paris, lustig, dealer, poisson, cop, tipHat, chair, cup, suitcase } from './_lib.js';

// ---------- s01 / s19: the con man strolls toward camera, the tower behind him wears a giant SOLD tag.
// s19 plays u = t - dur so its last frame == s01's first frame (seamless loop).
const SPD = 0.85;
function strollInit(T) {
  const s = paris(T, { tag: true, target: [0, 0, 0], shadowSize: 8 });
  s.tag.scale.setScalar(1.7); s.tag.position.set(0.6, 15.6, -43.8);
  s.l = lustig(); s.stage.add(s.l);
  s.cane = new THREE.Group(); s.l.hold('L', s.cane);
  s.p = [dealer(1), dealer(4)]; s.p[0].position.set(4.6, 0, -9); s.p[1].position.set(-4.4, 0, -14); s.p.forEach(b => s.stage.add(b));
  s.c = cop(); s.c.position.set(5.2, 0, -4); s.c.rotation.y = -0.4; s.stage.add(s.c);
  return s;
}
function strollDraw(s, u) {
  const z = u * SPD * WALK_STRIDE; s.l.position.set(-0.55, 0, z); s.l.rotation.y = 0.12;
  const tip = Math.sin(Math.PI * clamp(prog(u, 0.75, 1.85)));
  s.l.pose(tipHat(s.l, tip, walk(u + 10, { speed: SPD, amp: 0.8 })));
  s.l.face(mixExpr({ ...EXPR.smug, pupil: [0.1, 0] }, { ...EXPR.smug, lid: 0.35, mouth: 'grin', pupil: [0, 0] }, tip), u + 10);
  s.p[0].rotation.y = Math.PI; s.p[0].position.z = -9 - (u + 10) * 0.7; s.p[0].pose(walk(u + 10, { speed: 0.7 })); s.p[0].face(EXPR.neutral, u + 10);
  s.p[1].position.z = -24 + (u + 10) * 0.8; s.p[1].pose(walk(u + 10, { speed: 0.8 })); s.p[1].face(EXPR.happy, u + 10);
  s.c.pose(addPose(POSE.handsHips, idle(u + 10, 4))); s.c.face(EXPR.suspicious, u + 10);
  s.set?.update?.(u + 10); s.tag.swing(u + 10, 0.1);
  const d = drift(u + 10, 0.03, 3);
  s.stage.cam([0.35 + d[0], 1.25 + d[1], z * 0.85 + 7.2], [-0.15, 4.6, z - 14], 50);
}
registerShot('s01', { kind: '3d', init: strollInit, draw(s, t) { strollDraw(s, t); } });
registerShot('s19', { kind: '3d', init: strollInit, draw(s, t, info) { strollDraw(s, t - info.dur); } });

// ---------- s02 "Twice.": the tower up close; a second SOLD tag drops onto the first platform on the word
registerShot('s02', { kind: '3d',
  init(T) { const s = paris(T, { tag: 'two', target: [0, 10, -44], shadowSize: 18 }); s.tag.scale.setScalar(1.5); s.tag.position.set(0.8, 15.6, -43.6); s.tag2.scale.setScalar(1.5); s.tag2.position.set(-5.5, 7.4, -40.8); s.y0 = s.tag2.position.y; return s; },
  draw(s, t, info) { const tw = at(info, 'twice', 0.15); const k = ease.outBack(clamp(prog(t, tw - 0.05, tw + 0.3)));
    s.tag.swing(t + 3, 0.1); s.tag2.swing(t * 1.6, 0.1 + 0.25 * (1 - clamp(prog(t, tw + 0.3, tw + 1.4)))); s.tag2.position.y = s.y0 + (1 - k) * 18; s.tag2.visible = t > tw - 0.1;
    camMove(s.stage, t, [[0, { pos: [-1.0, 3.2, -18], look: [-1.2, 11.5, -44], fov: 48 }], [info.dur, { pos: [-1.0, 3.4, -21], look: [-1.3, 11.5, -44], fov: 46 }]]); },
});

// ---------- s03 "He didn't own it.": HERO at a café table, BISCUIT on the table; cup freezes, jaw drops
registerShot('s03', { kind: '3d',
  init(T) { const s = paris(T, { cafe: { pos: [8.3, 0.24, 1.0] }, target: [8.3, 0, 1], shadowSize: 5 });
    s.ch = chair('#2a2a2a', '#c8323a'); s.ch.position.set(9.05, 0.24, 0.75); s.ch.rotation.y = -0.5; s.stage.add(s.ch);
    s.h = castMember('hero', { hood: 'down' }); s.h.position.set(9.05, 0.18, 0.8); s.h.rotation.y = -0.5; s.stage.add(s.h);
    s.cup = cup(); s.cup.position.set(0, -0.12, 0.05); s.h.hold('R', s.cup);
    s.cat = cat({ scale: 0.5 }); s.cat.position.set(7.95, 1.33, 0.95); s.cat.rotation.y = 0.35; s.stage.add(s.cat); return s; },
  draw(s, t, info) { const w = at(info, 'own', 0.5); const k = ease.out(prog(t, w - 0.05, w + 0.15));
    s.h.pose(addPose(mixPose({ ...POSE.sit, armR: [1.15, 0.12, 0.4], elbowR: 1.9, headNod: 0.05 }, { ...POSE.sit, armR: [0.9, 0.2, 0.4], elbowR: 1.4, headNod: -0.08, lean: -0.08 }, k), idle(t, 2, 0.6)));
    s.h.face(mixExpr({ ...EXPR.deadpan, pupil: [0.2, 0] }, { ...EXPR.shocked, pupil: [0, 0] }, k), t);
    s.cat.update(t, { lid: 0.62, look: [0.0, 0.05], tail: 1, headTurn: k * 0.2 });
    camMove(s.stage, t, [[0, { pos: [8.1, 2.15, 5.2], look: [8.55, 1.85, 0.9], fov: 34 }], [info.dur, { pos: [8.2, 2.1, 4.4], look: [8.6, 1.95, 0.9], fov: 32 }]]); },
});

// ---------- s04 "Paris, 1925.": crane up the street, passers-by, the tower at the end
registerShot('s04', { kind: '3d',
  init(T) { const s = paris(T, { target: [0, 0, -4], shadowSize: 12 });
    s.l = lustig(); s.l.position.set(-0.6, 0, -3); s.l.rotation.y = Math.PI; s.stage.add(s.l);
    s.w = [dealer(0), dealer(2), cop()]; s.w[0].position.set(3.5, 0, -1); s.w[1].position.set(-4.6, 0, -6); s.w[2].position.set(5.0, 0, -9); s.w.forEach(b => s.stage.add(b)); return s; },
  draw(s, t, info) { s.l.position.z = -3 - t * 0.9; s.l.pose(walk(t, { speed: 0.85, amp: 0.8 })); s.l.face(EXPR.smug, t);
    s.w[0].rotation.y = Math.PI; s.w[0].position.z = -1 - t * 0.8; s.w[0].pose(walk(t + 0.3, { speed: 0.8 })); s.w[0].face(EXPR.neutral, t);
    s.w[1].position.z = -6 + t * 0.7; s.w[1].pose(walk(t, { speed: 0.7 })); s.w[1].face(EXPR.happy, t);
    s.w[2].pose(addPose(POSE.attention, idle(t, 5))); s.w[2].face(EXPR.bored, t);
    camMove(s.stage, t, [[0, { pos: [0.4, 1.6, 9.5], look: [0, 3.5, -30], fov: 50 }], [info.dur, { pos: [0.3, 4.2, 8.0], look: [0, 6.5, -40], fov: 48 }]]); },
  overlay(g, t) { tag(g, 'PARIS · 1925', ease.out(prog(t, 0.05, 0.4))); },
});

// ---------- s12 "Poisson was too embarrassed to tell anyone.": he slinks past a policeman, blushing, hat pulled low
registerShot('s12', { kind: '3d',
  init(T) { const s = paris(T, { target: [0.5, 0, 0], shadowSize: 6 }); s.p = poisson(); s.stage.add(s.p); s.c = cop(); s.c.position.set(1.9, 0, -0.6); s.c.rotation.y = -0.5; s.stage.add(s.c); return s; },
  draw(s, t, info) { const stop = info.dur - 1.0; const u = Math.min(t, stop); const z = -2.2 + u * 0.75; s.p.position.set(0.15 + u * 0.05, 0, z);
    const still = ease.inOut(prog(t, stop - 0.2, stop + 0.2));
    s.p.rotation.y = lerp(0.25, 0, still);
    const sneak = addPose(walk(t, { speed: 0.9, amp: 0.6 }), { headNod: 0.25, headTurn: -0.35, shrugY: 0.04 });
    s.p.pose(mixPose(sneak, addPose({ ...POSE.attention, headNod: 0.05 }, idle(t, 3)), still)); s.p.blush(0.4 + 0.6 * ease.out(prog(t, 0.2, 0.8)));
    s.p.face(mixExpr({ ...EXPR.worried, lid: 0.45, mouth: 'o', mouthW: 0.5, pupil: [-0.6, -0.1] }, { ...EXPR.deadpan, lid: 0.5, pupil: [0, 0] }, still), t);
    s.c.rotation.y = -0.5 + clamp(prog(t, 0.3, 1.8)) * 0.6; s.c.pose(addPose(POSE.handsHips, idle(t, 4))); s.c.face({ ...EXPR.suspicious, pupil: [0.6, 0] }, t);
    camMove(s.stage, t, [[0, { pos: [0.9, 2.1, 6.8], look: [0.6, 1.7, -0.6], fov: 34 }], [info.dur, { pos: [0.5, 2.15, 5.4], look: [0.3, 1.95, 0], fov: 30 }]]); },
});

// ---------- s16 "This time, a dealer went to the police.": a dealer runs up to the policeman and points; whistle
registerShot('s16', { kind: '3d',
  init(T) { const s = paris(T, { target: [0, 0, 0], shadowSize: 6 }); s.d = dealer(3); s.stage.add(s.d); s.c = cop(); s.c.position.set(0.9, 0, -0.3); s.c.rotation.y = -0.6; s.stage.add(s.c);
    s.wh = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.14, 8), new THREE.MeshToonMaterial({ color: '#d8c8a0' })); s.wh.rotation.x = Math.PI / 2; s.wh.position.set(0, -0.08, 0.06); s.c.hold('R', s.wh); return s; },
  draw(s, t, info) { const arrive = 1.0; const x = lerp(-3.2, -0.25, ease.out(clamp(t / arrive))); s.d.position.set(x, 0, 0.1); s.d.rotation.y = t < arrive ? Math.PI / 2 : lerp(Math.PI / 2, 0.4, ease.inOut(prog(t, arrive, arrive + 0.3)));
    const pt = ease.out(prog(t, arrive, arrive + 0.3));
    s.d.pose(t < arrive ? run(t) : addPose(point({ ...POSE.stand, lean: 0.08 }, 'L', pt, { up: 0.1, across: 0.6 }), { ...tremble(t, 0.8), headTurn: 0.5 }));
    s.d.face(t < arrive ? EXPR.panic : { ...EXPR.angry, talk: 0.8 }, t);
    const blow = ease.out(prog(t, at(info, 'police', 1.5) - 0.1, at(info, 'police', 1.5) + 0.15));
    s.c.pose(mixPose(addPose(POSE.attention, idle(t, 2)), { ...POSE.attention, armR: [1.35, 0.15, 0.5], elbowR: 2.3, headTurn: 0.25 }, blow));
    s.c.face(mixExpr({ ...EXPR.neutral, pupil: [-0.6, 0] }, { ...EXPR.shocked, mouth: 'o', mouthW: 0.5 }, blow), t);
    camMove(s.stage, t, [[0, { pos: [0.1, 2.0, 6.6], look: [0.1, 1.65, 0], fov: 36 }], [info.dur, { pos: [0.3, 2.0, 5.4], look: [0.3, 1.75, 0], fov: 34 }]]); },
});

// ---------- s18 "left the country. Again.": suitcase in hand, he strides off toward the tower, turns, tips his hat
registerShot('s18', { kind: '3d',
  init(T) { const s = paris(T, { target: [0, 0, -2], shadowSize: 8 }); s.l = lustig(); s.stage.add(s.l); s.cs = suitcase(); s.cs.position.set(0, -0.3, 0); s.l.hold('R', s.cs); return s; },
  draw(s, t, info) { const ag = at(info, 'again', 1.4); const turn = ease.inOut(prog(t, ag - 0.25, ag + 0.1)); const u = Math.min(t, ag - 0.15);
    s.l.position.set(-0.2, 0, 1.0 - u * 1.6); s.l.rotation.y = Math.PI - turn * 2.6;
    const base = t < ag - 0.15 ? walk(t, { speed: 1.5, amp: 1.0 }) : { ...POSE.stand };
    const tip = Math.sin(Math.PI * clamp(prog(t, ag, info.dur + 0.05)));
    s.l.pose(tipHat(s.l, tip, base)); s.l.face({ ...EXPR.smug, pupil: [0, 0] }, t);
    s.cs.rotation.z = Math.sin(t * 9.4) * 0.12 * (1 - turn);
    camMove(s.stage, t, [[0, { pos: [0.3, 1.6, 6.0], look: [0, 3.0, -30], fov: 48 }], [info.dur, { pos: [0.2, 1.8, 4.6], look: [-0.2, 3.0, -30], fov: 46 }]]); },
  overlay(g, t, info) { tag(g, 'NEXT STOP: AMERICA', ease.out(prog(t, 0.35, 0.7))); },
});
