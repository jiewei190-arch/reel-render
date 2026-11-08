// s03 (casualty board), s04/s05/s17 (the island), s16 (the emperor settles it), s18/s19 (the bronze pig statue + cast cameo).
import { registerShot, ease, prog, clamp, lerp } from '/engine/core.js';
import { camMove, toonStage, toon, rbox, cyl, ball } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, tremble, point, shrug, nod } from '/kits/toon3d/rig.js';
import { castMember, cat } from '/kits/toon3d/cast.js';
import { glow } from '/kits/toon3d/fx.js';
import * as PR from '/kits/toon3d/props.js';
import { THREE, at, tag, stageOf, islandScene, flag, kaiser, statue, potato } from './_lib.js';

// s03 "The pig was the only casualty." — a chalk board on the meadow; HERO gasps, DEV films it, BISCUIT on top of the board
registerShot('s03', { kind: '3d',
  init(T) { const s = stageOf(T, { target: [0, 0, 0], shadowSize: 7, meadow: { seaZ: -20 } });
    s.sb = PR.scoreboard({ title: 'CASUALTIES', lines: ['PIGS  1', 'HUMANS  0'], w: 1.8, h: 1.2 }).at(0, 0, -0.3); s.stage.add(s.sb);
    s.h = castMember('hero', { hoodDown: true }); s.h.position.set(-1.25, 0, 0.7); s.h.rotation.y = 0.45; s.d = castMember('dev'); s.d.position.set(1.3, 0, 0.6); s.d.rotation.y = -0.5; s.stage.add(s.h, s.d);
    s.cat = cat({ scale: 0.5 }); s.cat.position.set(0.55, 2.27, -0.3); s.stage.add(s.cat); return s; },
  draw(s, t, info) { const c = at(info, 'casualty', 0.85), k = ease.outBack(prog(t, c - 0.1, c + 0.2));
    s.h.pose(addPose(mixPose(POSE.stand, { ...POSE.stand, armL: [1.2, 0.2, 0.3], elbowL: 2.2, armR: [1.2, 0.2, 0.3], elbowR: 2.2, lean: -0.08 }, k), idle(t, 1))); s.h.face(mixExpr(EXPR.neutral, EXPR.shocked, k), t);
    s.d.pose(addPose({ ...POSE.stand, armR: [1.5, 0.15, 0.2], elbowR: 1.4 }, idle(t, 2))); s.d.face(t > c ? { ...EXPR.suspicious, pupil: [0, 0] } : EXPR.neutral, t);
    s.cat.update(t, { lid: 0.6, look: [0, 0], tail: 0.6, headTurn: t > c ? 0 : -0.4 });
    camMove(s.stage, t, [[0, { pos: [0, 1.85, 6.2], look: [0, 1.5, -0.2], fov: 38 }], [info.dur, { pos: [0, 1.85, 5.5], look: [0, 1.55, -0.2], fov: 37 }]]); },
});
// s04 "It's 1859." — the island from the air, in the strait, mountains behind
registerShot('s04', { kind: '3d', init(T) { return islandScene(T); },
  draw(s, t, info) { camMove(s.stage, t, [[0, { pos: [-14, 24, 30], look: [0, 0, -2], fov: 40 }], [info.dur, { pos: [-6, 19, 27], look: [0, 0, -2], fov: 38 }]]); },
  overlay(g, t) { tag(g, 'SAN JUAN ISLAND, 1859', ease.out(prog(t, 0.1, 0.4))); },
});
// s05 "Both countries claim one island." — two giant flags pop up on it and wave at each other
registerShot('s05', { kind: '3d',
  init(T) { const s = islandScene(T); s.fl = [flag('us', { h: 7, w: 3.4 }).at(-5, 0.4, 0, 0), flag('uk', { h: 7, w: 3.4 }).at(5, 0.4, 0, Math.PI)]; s.fl.forEach(f => s.island.add(f)); return s; },
  draw(s, t, info) { const a = at(info, 'claim', 0.55); s.fl.forEach((f, i) => { const k = ease.outBack(prog(t, (i ? a : 0.05), (i ? a : 0.05) + 0.3)); f.scale.set(1, Math.max(0.001, k), 1); f.update(t + i * 0.7); });
    camMove(s.stage, t, [[0, { pos: [-3, 14, 30], look: [0, 3.5, 0], fov: 40 }], [info.dur, { pos: [0, 12, 27], look: [0, 4, 0], fov: 39 }]]); },
});
// s17 "The US gets the island." — the British flag sinks, the US flag stays, waving proudly
registerShot('s17', { kind: '3d',
  init(T) { const s = islandScene(T); s.fl = [flag('us', { h: 7, w: 3.4 }).at(-5, 0.4, 0, 0), flag('uk', { h: 7, w: 3.4 }).at(5, 0.4, 0, Math.PI)]; s.fl.forEach(f => s.island.add(f)); return s; },
  draw(s, t, info) { const u = at(info, 'US', 0.15), k = ease.inOut(prog(t, u, u + 0.7));
    s.fl[0].update(t); s.fl[0].scale.setScalar(1 + 0.25 * ease.outBack(prog(t, u + 0.1, u + 0.5))); s.fl[1].update(t + 0.7, 1 - k * 0.6); s.fl[1].position.y = 0.4 - k * 7.6; s.fl[0].position.x = -5 + 3 * ease.inOut(prog(t, u, u + 0.8));
    camMove(s.stage, t, [[0, { pos: [0, 12, 27], look: [0, 4, 0], fov: 39 }], [info.dur, { pos: [-1, 10, 22], look: [-1, 4.5, 0], fov: 37 }]]); },
  overlay(g, t, info) { const u = at(info, 'island', 0.8); tag(g, 'SAN JUAN ISLAND: USA', ease.out(prog(t, u, u + 0.3))); },
});
// s16 "Then Germany's emperor settles it." — the emperor at his desk with the map; bang of the gavel on "settles"
registerShot('s16', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'warm', fov: 34, shadowSize: 5, target: [0, 0, 0] });
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(14, 7), PR.texMat(PR.TEX.plaster('#d8c8a8', [2, 1]))); wall.position.set(0, 3.5, -2.2); wall.receiveShadow = true; wall.userData.noOutline = true; st.add(wall);
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(14, 8), PR.texMat(PR.TEX.planks('#7a5032', [3, 2], 10))); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; fl.userData.noOutline = true; st.add(fl);
    st.add(PR.curtain({ color: '#7a2a3a' }).at(-2.4, 0, -2.0), PR.curtain({ color: '#7a2a3a' }).at(2.4, 0, -2.0), PR.rug({ w: 4, d: 3, color: '#7a2a3a' }).at(0, 0.01, 0.2));
    const k = kaiser(); k.position.set(0, 0, -0.6); st.add(k);
    const desk = PR.table({ w: 2.2, d: 1.0, h: 1.05, color: '#5a3a22' }).at(0, 0, 0.35); st.add(desk);
    const map = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.6), toon('#ffffff', { map: PR.TEX.label('SAN JUAN', '#efe3c4', '#5a3a1a') })); map.rotation.x = -Math.PI / 2; map.position.set(-0.45, 1.12, 0.45); map.userData.noOutline = true; st.add(map);
    const gav = PR.propGroup(cyl(0.02, 0.02, 0.4, '#5a3a22', 0, -0.15, 0, 6), cyl(0.07, 0.07, 0.24, '#7a5032', 0, -0.35, 0, 10).rotateZ(Math.PI / 2)); k.hold('R', gav);
    const block = PR.propGroup(cyl(0.12, 0.12, 0.06, '#7a5032', 0, 0.03, 0, 14)).at(0.55, 1.11, 0.55); st.add(block); return { stage: st, k }; },
  draw(s, t, info) { const se = at(info, 'settles', 1.0), hit = prog(t, se - 0.25, se) - prog(t, se, se + 0.35);
    s.k.pose(addPose({ ...POSE.stand, armR: [1.0 + hit * 1.3, 0.25, 0], elbowR: 1.0 - hit * 0.6, armL: [0.6, 0.15, 0.5], elbowL: 1.1 }, idle(t, 1)));
    s.k.face(t > se ? { ...EXPR.smug, mouth: 'line' } : { ...EXPR.deadpan, pupil: [0, -0.4] }, t);
    camMove(s.stage, t, [[0, { pos: [0, 2.2, 5.0], look: [0, 1.8, -0.4], fov: 34 }], [info.dur, { pos: [0, 2.15, 4.3], look: [0, 1.9, -0.4], fov: 33 }]]); },
  overlay(g, t) { tag(g, '1872', ease.out(prog(t, 0.1, 0.35))); },
});
// the statue plaza (s18, s19): bronze boar with a potato in its mouth on a plinth; HERO, DEV (filming), MINA, BISCUIT
function plazaInit(T) { const s = stageOf(T, { target: [0, 0, 0], shadowSize: 7, meadow: { seaZ: -24, treeSpots: [[-5, -6], [5, -7], [-8, -3], [8, -3.5], [-2.5, -10], [3, -11]] } });
  const path = new THREE.Mesh(new THREE.CircleGeometry(3.2, 32), PR.texMat(PR.TEX.cobble('#b8ad9a', [3, 3]))); path.rotation.x = -Math.PI / 2; path.position.y = 0.01; path.receiveShadow = true; path.userData.noOutline = true; s.stage.add(path);
  s.st = statue(); s.st.position.set(0, 0, -0.4); s.stage.add(s.st);
  s.glint = glow(0.9, '#fff2c8', 0.0); s.glint.position.set(0.12, 2.0, 0.6); s.stage.add(s.glint);
  s.h = castMember('hero', { hoodDown: true }); s.h.position.set(-1.6, 0, 1.0); s.h.rotation.y = 0.55;
  s.d = castMember('dev'); s.d.position.set(1.65, 0, 1.2); s.d.rotation.y = -0.6;
  s.m = castMember('mina', { prop: false }); s.m.position.set(-0.85, 0, 1.75); s.m.rotation.y = 0.2; s.stage.add(s.h, s.d, s.m);
  s.cat = cat({ scale: 0.55 }); s.cat.position.set(1.0, 0, 0.55); s.cat.rotation.y = -0.3; s.stage.add(s.cat); return s; }
// s18 "And the pig gets a bronze statue." — reveal: crane up from the plaque to the statue; the cast admires it
registerShot('s18', { kind: '3d', init: plazaInit,
  draw(s, t, info) { const b = at(info, 'bronze', 0.8), k = ease.out(prog(t, b, b + 0.3));
    s.h.pose(addPose(point(POSE.stand, 'L', k, { up: 0.3 }), idle(t, 1))); s.h.face(mixExpr(EXPR.neutral, EXPR.grin, k), t);
    s.d.pose(addPose({ ...POSE.stand, armR: [1.55, 0.15, 0.2], elbowR: 1.3 }, idle(t, 2))); s.d.face(EXPR.happy, t);
    s.m.pose(addPose(POSE.handsHips, idle(t, 3))); s.m.face({ ...EXPR.deadpan, pupil: [0, 0.2] }, t);
    s.cat.update(t, { lid: 0.55, look: [-0.3, 0.6], tail: 0.6, headTurn: 0.4 });
    s.glint.material.opacity = 0.7 * Math.max(0, Math.sin(Math.PI * prog(t, b, b + 0.5)));
    camMove(s.stage, t, [[0, { pos: [0, 1.2, 7.4], look: [0, 0.6, -0.4], fov: 40 }], [info.dur, { pos: [0, 2.2, 8.2], look: [0, 0.8, -0.4], fov: 40 }]]); },
});
// s19 "With a potato in its mouth." — close on the bronze snout + potato; glint; then HERO leans in, grinning
registerShot('s19', { kind: '3d', init: plazaInit,
  draw(s, t, info) { const p = at(info, 'potato', 0.7);
    s.h.pose(addPose(POSE.stand, idle(t, 1))); s.h.face(EXPR.grin, t); s.d.pose(addPose({ ...POSE.stand, armR: [1.55, 0.15, 0.2], elbowR: 1.3 }, idle(t, 2))); s.d.face(EXPR.happy, t);
    s.m.pose(POSE.handsHips); s.m.face(EXPR.deadpan, t); s.cat.update(t, { lid: 0.6 });
    s.glint.position.set(0.1, 1.93, 0.9); s.glint.material.opacity = 0.85 * Math.max(0, Math.sin(Math.PI * prog(t, p, p + 0.6)));
    camMove(s.stage, t, [[0, { pos: [0.7, 2.0, 4.3], look: [0, 1.3, 0.0], fov: 30 }], [info.dur, { pos: [0.4, 1.9, 3.6], look: [0, 1.35, 0.1], fov: 29 }]]); },
});
