// DR LIN's corner (cast cameo): s007 the blueprint "Full size, you'd hit at around", s008 the gauge "two hundred kilometres an hour."
import { registerShot, ease, prog, clamp, lerp } from '/engine/core.js';
import { POSE, EXPR, idle, addPose, mixPose, mixExpr, point, tremble } from '/kits/toon3d/rig.js';
import { camMove } from '/kits/toon3d/toon.js';
import { castMember } from '/kits/toon3d/cast.js';
import * as PR from '/kits/toon3d/props.js';
import { THREE, at, tag, bigNum, XP, blueprintBoard, gauge, toon, floor, plane, toonStage, E } from './_lib.js';

function lab(T) {
  const st = toonStage(T, { light: 'warm', fov: 44, target: [0, 1, 0], shadowSize: 7 });
  const f = new THREE.Mesh(new THREE.PlaneGeometry(30, 20), PR.texMat(PR.TEX.planks('#8a6040', [6, 4]))); f.rotation.x = -Math.PI / 2; f.receiveShadow = true; f.userData.noOutline = true; st.add(f);
  const w = plane(30, 12, PR.texMat(PR.TEX.plaster('#d8e2e6', [3, 1.2]))); w.position.set(0, 6, -3.2); st.add(w);
  st.add(PR.shelf({ w: 2.4, h: 2.6, color: '#6a4a36' }).at(-2.6, 0, -2.9));
  st.add(PR.plant().at(2.8, 0, -2.4));
  const lin = castMember('lin'); st.add(lin);
  return { stage: st, lin };
}
registerShot('s007', { kind: '3d',
  init(T) { const s = lab(T); s.board = blueprintBoard({ w: 2.4, h: 3.3 }); s.board.position.set(0.9, 0, -0.4); s.board.rotation.y = -0.18; s.stage.add(s.board); s.lin.position.set(-0.85, 0, 0.5); s.lin.rotation.y = 0.35; return s; },
  draw(s, t, info) {
    const tf = at(info, 'Full', 0.15), th = at(info, 'hit', 1.13);
    s.board.draw(prog(t, tf + 0.1, th + 0.25), t);
    const pk = ease.outBack(prog(t, 0.05, 0.4));
    s.lin.pose(addPose(point(POSE.stand, 'L', pk, { up: 0.15, across: -0.1 }), { headTurn: lerp(0.5, 0.0, ease.inOut(prog(t, 0.6, 1.0))), ...idle(t, 4) }));
    s.lin.face(t < 0.8 ? { ...EXPR.deadpan, pupil: [0.7, 0.1] } : { ...EXPR.bored, pupil: [0, 0] }, t);
    camMove(s.stage, t, [[0, { pos: [0.15, 2.5, 8.2], look: [0.05, 2.35, 0], fov: 44 }], [info.dur, { pos: [0.2, 2.45, 7.4], look: [0.1, 2.35, 0], fov: 44 }]]);
  },
});
registerShot('s008', { kind: '3d',
  init(T) { const s = lab(T); s.g = gauge({ r: 0.62 }); s.g.position.set(0.2, 3.38, 1.5); s.g.rotation.x = 0.06; s.stage.add(s.g); s.lin.position.set(-0.5, 0, -0.4); s.lin.rotation.y = 0.3; return s; },
  draw(s, t, info) {
    const tw = at(info, 'two', 0.15); const v = 200 * ease.outElastic(prog(t, tw, tw + 1.1)) + (t > tw + 0.6 ? Math.sin(t * 40) * 1.5 : 0); s.g.set(v);
    const imp = prog(t, 1.5, 1.6) * (1 - prog(t, 1.6, 1.9)); s.g.position.x = 0.2 + Math.sin(t * 80) * 0.04 * imp;
    const k = ease.out(prog(t, tw + 0.2, tw + 0.5));
    s.lin.pose(addPose(mixPose(POSE.stand, POSE.panic, k * 0.35), { ...(t > 1.5 ? tremble(t, 1.5) : {}), ...idle(t, 5) }));
    s.lin.face(t < tw + 0.2 ? { ...EXPR.bored, pupil: [0.5, 0.3] } : t < 1.5 ? { ...EXPR.shocked, pupil: [0.5, 0.25] } : XP.wince, t);
    camMove(s.stage, t, [[0, { pos: [0.1, 2.5, 6.6], look: [0, 2.3, 0], fov: 38 }], [info.dur, { pos: [0.1, 2.55, 5.8], look: [0.05, 2.4, 0], fov: 38 }]]);
  },
  overlay(g, t, info) { const tw = at(info, 'two', 0.15); bigNum(g, '~200 km/h', E.W / 2, E.H * 0.385, prog(t, tw + 0.25, tw + 0.5), 96); },
});
