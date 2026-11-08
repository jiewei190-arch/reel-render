// s01, s02, s12, s20: the standoff. Frame 1 = the pig munching a potato between two glaring armies (already moving);
// s20 replays the same move with u = t - dur, so its last frame == s01's first frame (seamless loop).
import { registerShot, ease, prog, clamp, lerp } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, tremble } from '/kits/toon3d/rig.js';
import { THREE, at, stageOf, pig, usSoldier, ukSoldier, musket, holdMusket, PARADE, warship, cannon, flag } from './_lib.js';

const ROWS = [[1.25, 0.3], [1.7, -1.5], [2.15, -3.3], [2.6, -5.1], [3.05, -6.9]];
function standoffInit(T) {
  const s = stageOf(T, { target: [0, 0, -1.5], shadowSize: 10, meadow: { seaZ: -15, treeSpots: [[-7, -10], [7.5, -11], [-10, -6], [10, -7], [-4.5, -13], [4.5, -13.5]] } });
  const st = s.stage;
  s.us = ROWS.map(([x, z], i) => { const b = usSoldier(i); b.position.set(-x, 0, z); b.rotation.y = 1.05; st.add(b); b.m = musket(); st.add(b.m); return b; });
  s.uk = ROWS.map(([x, z], i) => { const b = ukSoldier(i); b.position.set(x, 0, z); b.rotation.y = -1.05; st.add(b); b.m = musket(); st.add(b.m); return b; });
  s.p = pig({ seed: 1 }); s.p.position.set(0, 0, 1.7); st.add(s.p);
  s.ships = [warship({ seed: 1 }).at(6, 0, -24, -Math.PI / 2 + 0.2), warship({ seed: 2 }).at(-9, 0, -32, -Math.PI / 2 - 0.15)]; s.ships.forEach(w => st.add(w));
  s.can = [cannon().at(-1.0, 0, -8.6, 0.9), cannon().at(1.0, 0, -8.6, -0.9)]; s.can.forEach(c => st.add(c));
  s.fl = [flag('us').at(-3.4, 0, -9.5, 0.3), flag('uk').at(3.4, 0, -9.5, -0.3 + Math.PI)]; s.fl.forEach(f => st.add(f));
  return s;
}
// glare: soldiers stand at parade, trembling slightly; heads turn to the pig by `look` (0..1)
function soldiers(s, u, o = {}) { const { look = 0.25, scared = 0 } = o;
  [...s.us, ...s.uk].forEach((b, i) => { const us = i < 5; const k = i % 5;
    b.pose(addPose(PARADE, { ...idle(u + i, i), ...tremble(u + i * 0.3, 0.6 + scared), headTurn: (us ? -1 : 1) * look * (0.35 + k * 0.12) * -1 }));
    b.face(mixExpr(k % 2 ? EXPR.angry : { ...EXPR.suspicious, pupil: [us ? 0.5 : -0.5, 0] }, EXPR.worried, scared), u + 10 + i); holdMusket(b, b.m); });
  s.ships.forEach(w => w.update(u + 10)); s.fl.forEach((f, i) => f.update(u + 10 + i)); }
function standoffDraw(s, u) {
  soldiers(s, u, { look: 0.15 });
  s.p.update(u + 10, { chew: 1, lid: 0.45, look: [0, 0.1], headTurn: Math.sin(u * 0.9) * 0.08 });
  const z = 7.9 - (u + 1.6) * 0.32;
  s.stage.cam([0.0, 1.4, z], [0, 0.5, 0.4], 40);
}
registerShot('s01', { kind: '3d', init: standoffInit, draw(s, t) { standoffDraw(s, t); } });
registerShot('s20', { kind: '3d', init: standoffInit, draw(s, t, info) { standoffDraw(s, t - info.dur); } });

// s02 "over a pig." — close on the pig, chewing; on "pig" it stops, lids drop, deadpan stare into the lens (the beat)
registerShot('s02', { kind: '3d', init: standoffInit,
  draw(s, t, info) { const p = at(info, 'pig', 0.5); const k = ease.inOut(prog(t, p, p + 0.35));
    soldiers(s, t, { look: 0.6 * k });
    s.p.update(t, { chew: 1 - k, lid: lerp(0.4, 0.58, k), look: [0, lerp(0.15, 0.05, k)], earFlop: 0.1 * k });
    camMove(s.stage, t, [[0, { pos: [0.15, 1.15, 5.2], look: [0, 0.45, 1.6], fov: 32 }], [info.dur, { pos: [0.05, 1.1, 4.6], look: [0, 0.5, 1.6], fov: 31 }]]); },
});
// s12 "All over one pig." — high wide: every soldier on both sides slowly turns to look at the tiny pig, who keeps chewing
registerShot('s12', { kind: '3d', init: standoffInit,
  draw(s, t, info) { const k = ease.inOut(prog(t, 0.1, 0.8)); soldiers(s, t, { look: 0.3 + 0.9 * k });
    s.p.update(t, { chew: 1, lid: 0.5, look: [0, 0.5] });
    camMove(s.stage, t, [[0, { pos: [0, 7.5, 9.5], look: [0, 0, -1.6], fov: 46 }], [info.dur, { pos: [0, 6.2, 7.6], look: [0, 0, -1.2], fov: 44 }]]); },
});
