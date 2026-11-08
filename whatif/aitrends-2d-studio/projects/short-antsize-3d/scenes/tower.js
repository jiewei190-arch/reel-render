// the skyscraper: s003 rooftop ledge + gust, s004 off the edge, s005 falling past the glass, s006 wind-blasted face,
// s009 tiny bodies barely fall (airflow), s010 the air holds you (lounging on the updraft)
import { registerShot, ease, prog, clamp, lerp } from '/engine/core.js';
import { POSE, EXPR, idle, addPose, mixPose, mixExpr, tremble, shake } from '/kits/toon3d/rig.js';
import { camMove, drift } from '/kits/toon3d/toon.js';
import { THREE, at, tag, bigNum, hero, XP, facade, towers, streaks, pavementTex, leaf, toon, floor, plane, rbox, toonStage, E } from './_lib.js';

const DUSK = ['#5a5a8a', '#c98a86', '#f6c38c'];
const far = (st, f = 1400) => { st.camera.far = f; st.camera.updateProjectionMatrix(); };
// the city far below (shared by every tower shot); base = street level
function city(st, base = -420, o = {}) {
  st.add(towers({ n: 46, area: [-420, 420, -760, -90], h: [140, 400], base, seed: 8, ...o }));
  const g = floor(3000, 3000, toon('#a49ea4')); g.position.y = base; st.add(g);
  for (let i = 0; i < 8; i++) { const r = plane(14, 3000, toon('#7a7480')); r.rotation.x = -Math.PI / 2; r.position.set(-300 + i * 90, base + 0.3, 0); st.add(r); }
}
const flail = (t, amp = 1) => ({ ...POSE.panic, armL: [0.4 + Math.sin(t * 13) * 0.5 * amp, 2.0 + Math.sin(t * 11) * 0.4 * amp, 0.3], armR: [0.4 + Math.sin(t * 12 + 1) * 0.5 * amp, 2.0 + Math.sin(t * 10 + 2) * 0.4 * amp, 0.3], legL: [0.3 + Math.sin(t * 9) * 0.4 * amp, 0.25], legR: [-0.2 + Math.sin(t * 9 + 2) * 0.4 * amp, 0.25], kneeL: 0.5, kneeR: 0.4 });
const spread = (t) => ({ ...POSE.stand, armL: [0.25, 1.35 + Math.sin(t * 1.7) * 0.08, 0], armR: [0.25, 1.35 + Math.sin(t * 1.5 + 1) * 0.08, 0], elbowL: 0.35, elbowR: 0.35, legL: [0.15, 0.28], legR: [-0.1, 0.28], kneeL: 0.35, kneeR: 0.3 });

// ---------------- s003 "Then a gust throws you off a" — the ant-scale rooftop ledge at golden hour ----------------
function ledge(T, o = {}) {
  const st = toonStage(T, { light: 'dusk', fov: 36, bg: DUSK, fog: [80, 900, '#e0a890'], target: [0, 0, 1], shadowSize: 7 }); far(st);
  const t = pavementTex(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 1.2);
  const top = rbox(60, 1.2, 14, toon('#ffffff', { map: t }), 0, -0.6, 5.8, 0.12); top.material = toon('#ffffff', { map: t }); top.receiveShadow = true; top.userData.noOutline = true; st.add(top);
  const band = rbox(60, 0.5, 0.3, '#8a8e96', 0, -0.25, -1.1, 0.08); band.userData.noOutline = true; st.add(band);
  const wall = facade(60, 440, { rep: [6, 44] }); wall.rotation.y = Math.PI; wall.position.set(0, -1.2 - 220, -1.25); st.add(wall);
  city(st);
  const h = hero(); st.add(h);
  const gust = streaks({ count: 26, len: 1.4, thick: 0.03, opacity: 0.85, seed: 3, path: (u, p) => [lerp(-3.5, 3.5, p.a) + Math.sin(u * 9 + p.c * 6) * 0.25, 0.3 + p.b * 3.4 + Math.sin(u * 7) * 0.2, lerp(9, -10, u)] }); st.add(gust);
  return { stage: st, h, gust, wall };
}
registerShot('s003', { kind: '3d',
  init(T) { return ledge(T); },
  draw(s, t, info) {
    const tg = at(info, 'gust', 0.39), tt = at(info, 'throws', 0.55); const g = prog(t, tg - 0.15, tg + 0.15);
    s.gust.update(t, 1.6, g);
    const slide = ease.in(prog(t, tt - 0.05, info.dur)); s.h.position.set(0, Math.max(0, slide - 0.85) * -6, 0.3 - slide * 1.75);
    s.h.rotation.set(-ease.in(prog(t, tt + 0.25, info.dur + 0.15)) * 0.9, 0, 0);
    const lean = addPose(POSE.stand, { lean: -0.25, armL: [0.9, 0.3, 0], armR: [0.9, 0.3, 0], elbowL: 0.8, elbowR: 0.8, headNod: 0.1 });
    s.h.pose(t < tg ? addPose(POSE.relaxed, { headTurn: -0.25, ...idle(t, 4) }) : t < tt ? addPose(lean, tremble(t, 2)) : addPose(flail(t), tremble(t, 2)));
    s.h.face(t < tg ? { ...EXPR.happy, pupil: [-0.4, 0] } : t < tt ? { ...EXPR.worried, pupil: [0, 0] } : EXPR.panic, t);
    camMove(s.stage, t, [[0, { pos: [1.7, 1.8, 7.6], look: [0, 1.15, -1.0], fov: 36 }], [info.dur, { pos: [1.4, 1.6, 6.4], look: [0, 0.9, -1.4], fov: 36 }]]);
  },
});
// ---------------- s004 "skyscraper." — looking straight down the facade, the hero tumbles away toward the street ----------------
registerShot('s004', { kind: '3d',
  init(T) { const s = ledge(T); s.stage.camera.up.set(0, 0, -1); return s; },
  draw(s, t, info) {
    s.gust.visible = false;
    const fall = 0.4 + t; const y = -0.3 - 7.5 * fall * fall; s.h.position.set(Math.sin(t * 2) * 0.3, y, -2.4 - fall * 1.2);
    s.h.rotation.set(-1.0 - t * 3.2, t * 1.4, 0.3 * Math.sin(t * 3));
    s.h.pose(addPose(flail(t, 1.2), tremble(t, 2))); s.h.face(EXPR.panic, t);
    camMove(s.stage, t, [[0, { pos: [0.8, 3.2, -3.4], look: [0.2, -12, -2.6], fov: 52 }], [info.dur, { pos: [0.6, 1.6, -3.6], look: [0.1, -16, -2.9], fov: 54 }]], ease.out);
  },
});
// ---------------- falling beside the glass (s005, s006, s009, s010): facade at z = -5 facing camera, scrolls up ----------------
function fallStage(T, o = {}) {
  const st = toonStage(T, { light: 'dusk', fov: 34, bg: DUSK, fog: [40, 700, '#e0a890'], target: [0, 1, 0], shadowSize: 6, ...(o.stage || {}) }); far(st);
  const wall = facade(140, 160, { rep: [16, 18] }); wall.position.set(0, -60, -5); st.add(wall);
  const h = hero(); st.add(h);
  return { stage: st, wall, h };
}
const windUp = (o = {}) => streaks({ count: o.count || 34, len: o.len || 2.2, thick: 0.03, opacity: 0.8, seed: o.seed || 5, path: (u, p) => [lerp(-3.2, 3.2, p.a), lerp(-5, 7, u), lerp(-3, 3.2, p.b)] });
// s005 "A hundred floors." — floor counter ticking down, the glass racing up
registerShot('s005', { kind: '3d',
  init(T) { const s = fallStage(T); s.w = windUp(); s.stage.add(s.w); return s; },
  draw(s, t, info) {
    s.wall.tex.offset.y = -(t + 0.4) * 1.5; s.w.update(t, 2.2);
    const tf = at(info, 'floors', 0.53);
    s.h.position.set(0, 1.0 + Math.sin(t * 3) * 0.08, 0); s.h.rotation.set(0.15 * Math.sin(t * 2.3), Math.sin(t * 1.3) * 0.4, 0.25 * Math.sin(t * 1.7));
    s.h.pose(addPose(flail(t), tremble(t, 2.5))); s.h.face(t < tf ? XP.surprised : EXPR.shocked, t);
    const d = drift(t, 0.06, 4); camMove(s.stage, t, [[0, { pos: [0.6 + d[0], 2.3, 7.0], look: [0, 2.2, 0], fov: 34 }], [info.dur, { pos: [0.4, 2.0, 6.2], look: [0, 2.1, 0], fov: 34 }]]);
    s.stage.camera.position.x += Math.sin(t * 50) * 0.02;
  },
  overlay(g, t, info) { const k = prog(t, 0.25, 0.45); const n = Math.max(1, 100 - Math.floor(Math.max(0, t - 0.25) * 9)); tag(g, `FLOOR ${n}`, k, 0.14, { size: 64 }); },
});
// s006 "No parachute." — giant face, wind-blasted; checks over the shoulder for a parachute, then worried at the lens
registerShot('s006', { kind: '3d',
  init(T) { const s = fallStage(T); s.w = windUp({ count: 30, len: 2.6 }); s.stage.add(s.w); return s; },
  draw(s, t, info) {
    s.wall.tex.offset.y = -(t + 2.2) * 1.5; s.w.update(t, 2.6);
    const tp = at(info, 'parachute', 0.37); const look = Math.sin(Math.PI * prog(t, 0.05, tp + 0.15));
    s.h.position.set(0, 0, 0); s.h.rotation.set(0, 0, 0);
    s.h.pose(addPose(POSE.panic, { headTurn: 1.15 * look, headNod: 0.1 * look, armL: [-0.6 * look, 0, 0], ...tremble(t, 3.5) }));
    s.h.face(t < tp ? { ...EXPR.shocked, pupil: [0.9 * look, -0.2] } : mixExpr({ ...EXPR.worried, pupil: [0, 0] }, { ...EXPR.worried, mouth: 'wavy', pupil: [0, 0], brow: 0.7 }, prog(t, tp, tp + 0.5)), t);
    camMove(s.stage, t, [[0, { pos: [0.1, 2.2, 3.4], look: [0, 2.08, 0], fov: 30 }], [info.dur, { pos: [0.05, 2.18, 2.9], look: [0, 2.08, 0], fov: 30 }]]);
    s.stage.camera.position.x += Math.sin(t * 57) * 0.015; s.stage.camera.position.y += Math.sin(t * 43) * 0.012;
  },
});
// ---------------- s009 "But tiny bodies barely fall." — slow drift, air streamlines curl round the tiny hero ----------------
const airflow = (o = {}) => streaks({ count: o.count || 44, len: 0.55, thick: 0.022, opacity: 0.75, seed: o.seed || 7, path: (u, p) => {
  const y = lerp(-3.5, 6, u), th = p.a * Math.PI * 2 + u * 0.8; const r = 0.55 + p.b * 1.9 + 1.1 * Math.exp(-((y - 1.3) ** 2) / 1.6); return [Math.cos(th) * r, y, Math.sin(th) * r * 0.7]; } });
registerShot('s009', { kind: '3d',
  init(T) { const s = fallStage(T); s.air = airflow(); s.stage.add(s.air); return s; },
  draw(s, t, info) {
    s.wall.tex.offset.y = -t * 0.06; s.air.update(t, 0.35);
    const tb = at(info, 'barely', 0.97), tf = at(info, 'fall', 1.25);
    s.h.position.set(0, 0.4 + Math.sin(t * 1.6) * 0.12, 0); s.h.rotation.set(0.1, 0.25 + Math.sin(t * 0.8) * 0.15, Math.sin(t * 1.1) * 0.1);
    const k = ease.inOut(prog(t, 0, 0.6));
    s.h.pose(addPose(mixPose(addPose(POSE.panic, tremble(t, 1.2)), spread(t), k), idle(t, 3)));
    s.h.face(t < tb ? mixExpr(EXPR.worried, { ...EXPR.worried, pupil: [-0.5, -0.3] }, prog(t, 0.3, 0.8)) : t < tf ? XP.surprised : XP.delight, t);
    camMove(s.stage, t, [[0, { pos: [0.8, 2.0, 7.4], look: [0, 1.5, 0], fov: 34 }], [info.dur, { pos: [0.5, 1.9, 6.6], look: [0, 1.5, 0], fov: 34 }]], ease.sine);
  },
  overlay(g, t, info) { const b = at(info, 'barely', 0.97); tag(g, 'TINY = SLOW FALL', prog(t, b, b + 0.25)); },
});
// ---------------- s010 "The air holds you." — lounging on the updraft like a hammock, a leaf floating by ----------------
registerShot('s010', { kind: '3d',
  init(T) { const s = fallStage(T); s.air = airflow({ count: 36, seed: 9 }); s.stage.add(s.air); s.lf = leaf(1.1, '#e0a53a'); s.stage.add(s.lf); return s; },
  draw(s, t, info) {
    s.wall.tex.offset.y = -(t + 2) * 0.06; s.air.update(t + 2, 0.32);
    const th = at(info, 'holds', 0.49);
    s.h.position.set(0, 1.3 + Math.sin(t * 1.5) * 0.08, 0); s.h.rotation.set(-1.2, 0.55, 0);
    s.h.pose({ ...POSE.stand, armL: [0.2, 2.45, 0.2], armR: [0.2, 2.45, 0.2], elbowL: 2.3, elbowR: 2.3, legL: [0.95, 0.06], kneeL: 1.35, legR: [0.35, 0.04], kneeR: 0.15, headNod: 0.75, headTilt: -0.12 + Math.sin(t) * 0.03 });
    s.h.face(t < th ? { ...EXPR.happy, lid: 0.45, pupil: [0, -0.3] } : XP.cheeky, t);
    s.lf.position.set(-0.75 + t * 0.12, 2.9 + Math.sin(t * 1.8) * 0.2, -0.9); s.lf.rotation.set(0.5 + Math.sin(t * 2.2) * 0.4, t * 0.6, Math.cos(t * 1.7) * 0.4);
    camMove(s.stage, t, [[0, { pos: [1.7, 2.3, 5.6], look: [0, 1.8, 0], fov: 33 }], [info.dur, { pos: [1.3, 2.2, 4.9], look: [0, 1.8, 0], fov: 33 }]], ease.sine);
  },
});
