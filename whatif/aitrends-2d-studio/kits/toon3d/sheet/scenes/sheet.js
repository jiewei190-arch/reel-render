// Style sheet for the toon3d kit (kits/toon3d/README.md). Render: node render.mjs --project kits/toon3d/sheet --stills 0.5,1.5,2.5,3.5,4.5
import { registerShot, E, text } from '/engine/core.js';
import { THREE } from '/kits/toon3d/toon.js';
const label = (g, st, obj, y, str) => { const v = new THREE.Vector3(obj.position.x, y, obj.position.z).project(st.camera); const x = (v.x * 0.5 + 0.5) * E.W, yy = (-v.y * 0.5 + 0.5) * E.H; g.font = '700 34px Fredoka'; const w = g.measureText(str).width + 36; g.fillStyle = 'rgba(32,22,26,.85)'; g.beginPath(); g.roundRect(x - w / 2, yy - 26, w, 52, 26); g.fill(); text(g, str, x, yy, { size: 34, color: '#fff6e6', weight: 700 }); };
import { toonStage, floor, toon } from '/kits/toon3d/toon.js';
import { bean, CAST, POSE, EXPR, idle, addPose, point, shrug, mixPose } from '/kits/toon3d/rig.js';
import { SETS, applyLight } from '/kits/toon3d/sets.js';
import * as PR from '/kits/toon3d/props.js';

export const EXPR_SHOW = ['bored', 'shocked', 'angry', 'smug', 'panic', 'sad'];
registerShot('expr', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'warm', bg: ['#efe3d2', '#e4d2ba'], shadowSize: 8, target: [0, 1, 0] });
    st.add(floor(40, 40, '#d9c7ad'));
    const looks = [CAST.guard, CAST.senator, CAST.citizen, CAST.emperor, CAST.prisoner, { ...CAST.citizen, hair: 'bun', hairColor: '#7a3a1a', skin: 'brown', colors: { main: '#3f7a6a' }, seed: 21 }];
    const cs = EXPR_SHOW.map((n, i) => { const b = bean({ ...looks[i], seed: 40 + i }); b.position.set((i - 2.5) * 1.32, 0, 0); st.add(b); return b; });
    return { stage: st, cs }; },
  draw(s) { s.cs.forEach((b, i) => { const n = EXPR_SHOW[i]; b.pose(n === 'panic' ? POSE.panic : n === 'angry' ? POSE.handsHips : n === 'sad' ? addPose(POSE.stand, { headNod: 0.15 }) : n === 'smug' ? addPose(POSE.stand, { headTilt: 0.12 }) : POSE.stand); b.face(EXPR[n]); });
    s.stage.cam([0, 2.0, 12.2], [0, 1.95, 0], 22); },
  overlay(g, t, info, s) { s.cs.forEach((b, i) => label(g, s.stage, b, 0.95, EXPR_SHOW[i])); },
});
registerShot('cast', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'warm', bg: ['#efe3d2', '#e4d2ba'], shadowSize: 8, target: [0, 1, 0] });
    st.add(floor(40, 40, '#d9c7ad'));
    const names = ['guard', 'senator', 'citizen', 'prisoner', 'emperor', 'goth'];
    const cs = names.map((n, i) => { const b = bean(CAST[n]); b.position.set((i - 2.5) * 1.45, 0, 0); st.add(b); return b; });
    return { stage: st, cs }; },
  draw(s, t) { const ex = [EXPR.bored, EXPR.worried, EXPR.happy, EXPR.deadpan, EXPR.smug, EXPR.suspicious];
    const ps = [POSE.spearRest, shrug(POSE.stand, 1), point(POSE.stand, 'R', 1), POSE.relaxed, POSE.handsHips, POSE.stand];
    s.cs.forEach((b, i) => { b.pose(ps[i]); b.face(ex[i]); });
    s.stage.cam([0, 1.7, 13.5], [0, 1.35, 0], 24); },
  overlay(g, t, info, s) { const L = ['armour+helmet', 'toga', 'tunic', 'striped', 'robe+laurel', 'rags+cone']; s.cs.forEach((b, i) => label(g, s.stage, b, -0.25, L[i])); },
});
registerShot('street', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'day', shadowSize: 12, target: [0, 0, -2] }); const set = SETS.romanStreet(st, {});
    const a = bean(CAST.senator); a.position.set(-0.9, 0, 0.6); a.rotation.y = 0.35; const b = bean(CAST.citizen); b.position.set(1.0, 0, -0.4); b.rotation.y = -0.5; st.add(a, b);
    a.pose(shrug(POSE.stand, 1)); a.face(EXPR.worried); b.pose(POSE.handsHips); b.face(EXPR.suspicious);
    return { stage: st, set }; },
  draw(s, t) { s.set.update(t); const c = s.set.cams.wide; s.stage.cam([0, 2.6, 9.5], [0, 1.9, -4], 40); },
});
registerShot('house', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'warm', shadowSize: 8, target: [0, 0, -1] }); const set = SETS.romanHouse(st, { papers: true });
    const a = bean(CAST.senator); a.position.set(-0.6, 0, 0.4); a.rotation.y = 0.2; st.add(a); a.pose(POSE.panic); a.face(EXPR.panic);
    const sk = PR.sack({ label: 'PIPER' }).at(1.2, 0, 0.8, -0.3); st.add(sk);
    return { stage: st, set }; },
  draw(s, t) { s.set.update(t); s.stage.cam([0, 2.5, 8.5], [0, 1.6, -1.2], 40); },
});
registerShot('gate', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'night', shadowSize: 12, target: [0, 0, 0] }); const set = SETS.cityGate(st, { night: true, fireBeyond: true, open: 0.55 });
    const a = bean(CAST.guard); a.position.set(-2.4, 0, 1.8); a.rotation.y = 0.3; st.add(a); a.pose(POSE.spearRest); a.face(EXPR.shocked);
    a.hold('R', PR.spear()).position.set(0, 0.1, 0);
    return { stage: st, set }; },
  draw(s, t) { s.set.update(t); s.stage.cam([0, 2.8, 13], [0, 2.9, 0], 42); },
});
