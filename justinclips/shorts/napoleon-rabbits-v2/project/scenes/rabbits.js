// Napoleon Was Attacked by Rabbits: all shots (LOL). Nobody hurt: the rabbits only want food.
import { registerShot, E, ease, prog, clamp, lerp, text, FONTS } from '/engine/core.js';
import { camMove, rbox, cyl, outline } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, point, run, tremble, shrug } from '/kits/toon3d/rig.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { insertShot, dimScene, drawInsert } from '/kits/toon3d/insert.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import * as PR from '/kits/toon3d/props.js';
import { THREE, at, meadow, rabbit, swarm, napoleon, officer, cage, carriage } from './_lib.js';

function tag(g, str, k, y = 0.2, col = '#ffffff') { if (k <= 0) return; g.save(); g.translate(E.W / 2, E.H * y); const s = 0.8 + 0.2 * ease.outBack(clamp(k)); g.scale(s, s); g.globalAlpha = clamp(k * 1.5);
  g.font = `900 72px "${FONTS.ui}"`; const w = g.measureText(str).width + 80; g.fillStyle = 'rgba(20,14,18,.86)'; g.beginPath(); g.roundRect(-w / 2, -60, w, 120, 30); g.fill(); text(g, str, 0, 4, { size: 72, color: col, weight: 900, font: FONTS.ui }); g.restore(); }

// ---------- s01 + s17: frame 1 = tiny Napoleon swamped by a charging wave of rabbits ----------
function swampInit(T) { const M = meadow(T, { seed: 2, target: [0, 0, 0] }); const n = napoleon(); M.stage.add(n); const sw = swarm(M.stage, 50, [-4.2, 4.2, -14, 3], 3); return { M, stage: M.stage, n, sw }; }
function swampDraw(s, u) { const T = u + 3; s.M.update(T);
  s.sw.forEach((r, i) => { const z = ((r.z0 + 14 + T * 3.2) % 17) - 14; r.position.z = z; r.position.x = r.x0 * (z > -2 ? 1.25 : 1) + Math.sin(T * 2 + i) * 0.1; r.rotation.y = 0; r.hop(T, { speed: 3.2, ph: r.ph, height: 0.45 }); });
  s.n.pose(addPose(POSE.panic, tremble(T, 2))); s.n.face(EXPR.panic, T); s.n.rotation.y = Math.sin(T * 5) * 0.25; s.n.hat.rotation.z = 0.25 + Math.sin(T * 9) * 0.1;
  s.stage.cam([0.6, 2.1, 6.2 - u * 0.2], [0, 1.4, -1], 44); }
registerShot('s01', { kind: '3d', init: swampInit, draw(s, t) { swampDraw(s, t); }, overlay(g, t, info, s) { reactions(g, t + 3, s, [{ fx: 'sweat', on: 'n', at: 0 }]); } });
registerShot('s17', { kind: '3d', init: swampInit, draw(s, t, info) { swampDraw(s, t - info.dur); }, overlay(g, t, info, s) { reactions(g, t - info.dur + 3, s, [{ fx: 'sweat', on: 'n', at: 0 }]); } });

// ---------- s02 "To rabbits." one rabbit, close, deadpan stare at the lens ----------
registerShot('s02', { kind: '3d', init(T) { const M = meadow(T, { seed: 4 }); const r = rabbit({ seed: 0 }); M.stage.add(r); return { M, stage: M.stage, r }; },
  draw(s, t) { s.M.update(t); s.r.hop(0.0); s.r.head.rotation.z = Math.sin(t * 1.5) * 0.05; s.stage.cam([0, 0.9, 2.3 - t * 0.15], [0, 0.85, 0.3], 30); },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'sparkle', on: 'r', at: 0.3 }]); } });

// ---------- s03 "After a peace treaty," Napoleon signs, 1807 tag ----------
registerShot('s03', { kind: '3d', init(T) { const M = meadow(T, { seed: 6 }); const n = napoleon(); n.position.set(0, 0, 0.4); M.stage.add(n); const tb = PR.table({ w: 2.2, d: 1.0, h: 0.9 }); tb.position.set(0, 0, 1.4); M.stage.add(tb);
    const pa = PR.papers ? PR.papers() : rbox(0.6, 0.02, 0.8, '#f4eedc', 0, 0, 0, 0.01); pa.position.set(0, 0.97, 1.4); M.stage.add(pa); return { M, stage: M.stage, n }; },
  draw(s, t) { s.M.update(t); s.n.pose(addPose({ ...POSE.holdFront, armR: [1.0, 0.1, 0.4], elbowR: 1.3 + Math.sin(t * 14) * 0.15 }, idle(t))); s.n.face(EXPR.smug, t); s.stage.cam([0.5, 2.3, 5.2], [0, 1.6, 0.8], 34); },
  overlay(g, t) { sunnyLook(g, t, { rays: false }); tag(g, '1807 · PEACE TREATY', prog(t, 0.05, 0.35), 0.2); } });

// ---------- s04 "his chief of staff threw a rabbit hunt." officer proudly presents the cages ----------
function cagesInit(T, n = 6) { const M = meadow(T, { seed: 8, shadowSize: 16 }); const cs = []; for (let i = 0; i < n; i++) { const c = cage(); c.position.set(-4 + (i % 6) * 1.6, 0, -1 - Math.floor(i / 6) * 1.3); M.stage.add(c); cs.push(c);
    const r = rabbit({ seed: i }); r.scale.setScalar(0.6); r.position.set(c.position.x, 0.12, c.position.z); M.stage.add(r); c.r = r; } return { M, stage: M.stage, cs }; }
registerShot('s04', { kind: '3d', init(T) { const S = cagesInit(T, 6); S.o = officer(0); S.o.position.set(2.6, 0, 1.6); S.stage.add(S.o); return S; },
  draw(s, t) { s.M.update(t); s.o.rotation.y = -0.5; s.o.pose(addPose(point(POSE.stand, 'R', ease.out(prog(t, 0.2, 0.6)), { up: -0.2, across: 0.3 }), idle(t))); s.o.face(EXPR.grin, t);
    s.cs.forEach((c, i) => c.r.hop(0, {})); camMove(s.stage, t, [[0, { pos: [1.5, 2.6, 8.5], look: [-0.5, 1.0, 0], fov: 38 }], [2, { pos: [1.2, 2.5, 7.6], look: [-0.5, 1.0, 0], fov: 38 }]]); },
  overlay(g, t) { sunnyLook(g, t, { rays: false }); } });

// ---------- s05 + s06: "Hundreds of rabbits. Some accounts say thousands." rows of cages, then MORE ----------
registerShot('s05', { kind: '3d', init: (T) => cagesInit(T, 30), draw(s, t) { s.M.update(t); s.stage.cam([0, 6, 9], [0, 0, -4], 40); },
  overlay(g, t) { tag(g, 'HUNDREDS', prog(t, 0.6, 0.9), 0.2, '#ffd25a'); } });
registerShot('s06', { kind: '3d', init: (T) => cagesInit(T, 60), draw(s, t) { s.M.update(t); camMove(s.stage, t, [[0, { pos: [0, 7, 9], look: [0, 0, -5], fov: 40 }], [1.8, { pos: [0, 13, 14], look: [0, 0, -8], fov: 44 }]]); },
  overlay(g, t, info) { tag(g, 'THOUSANDS?', prog(t, at(info, 'thousands', 0.8), at(info, 'thousands', 0.8) + 0.3), 0.2, '#ffd25a'); text(g, 'some accounts say', E.W / 2, E.H * 0.2 - 90, { size: 40, color: '#ffffff', weight: 900, font: FONTS.ui, stroke: 8, strokeColor: '#141014', alpha: prog(t, 0.1, 0.4) }); } });

// ---------- s07 "The cages opened..." doors swing, a held beat ----------
registerShot('s07', { kind: '3d', init: (T) => { const S = cagesInit(T, 6); S.n = napoleon(); S.n.position.set(0, 0, 5); S.n.rotation.y = Math.PI; S.stage.add(S.n); return S; },
  draw(s, t) { s.M.update(t); s.cs.forEach((c, i) => { const k = ease.out(prog(t, 0.2 + i * 0.05, 0.6 + i * 0.05)); c.door.rotation.y = -k * 1.9; c.r.hop(0); c.r.head.rotation.y = Math.sin(t * 3 + i) * 0.3 * k; });
    s.n.pose(addPose(POSE.handsHips, idle(t))); s.stage.cam([0.3, 1.6, 8.6], [-0.5, 0.8, 0], 36); } });

// ---------- s08 "and the rabbits charged." the flood, hopping straight at the lens ----------
registerShot('s08', { kind: '3d', init(T) { const M = meadow(T, { seed: 10 }); const sw = swarm(M.stage, 40, [-6, 6, -16, -2], 7); return { M, stage: M.stage, sw }; },
  draw(s, t) { s.M.update(t); s.sw.forEach((r, i) => { r.position.z = r.z0 + t * 6; r.rotation.y = 0; r.hop(t, { speed: 3.6, ph: r.ph, height: 0.5 }); });
    s.stage.cam([0, 0.7, 5.5], [0, 0.6, -4], 40); shakeCam(s.stage, t, [{ fx: 'shake', at: 0.1, amp: 0.05, dur: 1.5 }]); },
  overlay(g, t) { sunnyLook(g, t, { rays: false }); } });

// ---------- s09 "At Napoleon." his face, the exclaim ----------
registerShot('s09', { kind: '3d', init(T) { const M = meadow(T, { seed: 12 }); const n = napoleon(); M.stage.add(n); return { M, stage: M.stage, n }; },
  draw(s, t) { s.M.update(t); const k = prog(t, 0.05, 0.2); s.n.pose(addPose(mixPose(POSE.handsHips, POSE.armsUp, k), tremble(t, k))); s.n.face(mixExpr(EXPR.smug, EXPR.shocked, k), t); s.n.hat.position.y = k * 0.15 * Math.abs(Math.sin(t * 12));
    s.stage.cam([0, 2.0, 4.4], [0, 1.95, 0], 30); },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'exclaim', on: 'n', at: 0.1 }, { fx: 'flash', at: 0.1, dur: 0.15 }]); } });

// ---------- s10 "Tame farm rabbits." one rabbit, heart eyes ----------
registerShot('s10', { kind: '3d', init(T) { const M = meadow(T, { seed: 14 }); const r = rabbit({ seed: 2 }); M.stage.add(r); return { M, stage: M.stage, r }; },
  draw(s, t) { s.M.update(t); s.r.hop(t, { speed: 1.2, height: 0.08 }); s.stage.cam([0.3, 0.95, 2.5], [0, 0.85, 0.3], 30); },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'heartEyes', on: 'r', at: 0.2 }, { fx: 'hearts', on: 'r', at: 0.4 }]); } });

// ---------- s11 "They thought he had food." rabbits round his boots, looking up hopefully ----------
registerShot('s11', { kind: '3d', init(T) { const M = meadow(T, { seed: 16 }); const n = napoleon(); M.stage.add(n); const ring = []; for (let i = 0; i < 12; i++) { const r = rabbit({ seed: i }); const a = (i / 12) * Math.PI * 2; r.position.set(Math.cos(a) * 1.05, 0, Math.sin(a) * 1.05); r.rotation.y = -a - Math.PI / 2; r.scale.setScalar(0.7); M.stage.add(r); ring.push(r); } return { M, stage: M.stage, n, ring }; },
  draw(s, t) { s.M.update(t); s.ring.forEach((r, i) => { r.hop(t, { speed: 2.2, ph: i * 0.13, height: 0.15 }); r.head.rotation.x = -0.4; }); s.n.pose(addPose(shrug(POSE.stand, 1), idle(t))); s.n.face({ ...EXPR.deadpan, pupil: [0, -0.7] }, t);
    s.stage.cam([0.4, 3.4, 4.4], [0, 0.9, 0], 38); },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'question', on: 'n', at: 0.3 }]); } });

// ---------- s12 "A general wrote that..." a general with a quill; s13 the memoir quote card ----------
registerShot('s12', { kind: '3d', init(T) { const M = meadow(T, { seed: 18 }); const o = officer(1); o.position.set(0, 0, 0); M.stage.add(o); const tb = PR.table({ w: 1.6, d: 0.9, h: 0.9 }); tb.position.set(0, 0, 0.9); M.stage.add(tb); return { M, stage: M.stage, o }; },
  draw(s, t) { s.M.update(t); s.o.pose(addPose({ ...POSE.holdFront, armR: [1.0, 0.1, 0.4], elbowR: 1.3 + Math.sin(t * 16) * 0.12 }, idle(t))); s.o.face({ ...EXPR.smug, pupil: [0, -0.6] }, t); s.stage.cam([0.8, 2.2, 4.4], [0, 1.5, 0.5], 34); },
  overlay(g, t) { sunnyLook(g, t, { rays: false }); } });
insertShot('s13', { insert: { type: 'document', title: 'A GENERAL\'S MEMOIR', lines: ['the rabbits forced', '"the conqueror of', 'conquerors"', 'to retreat'], highlight: 2 } });

// ---------- s14 "retreated." Napoleon runs, the rabbits after him ----------
registerShot('s14', { kind: '3d', init(T) { const M = meadow(T, { seed: 20 }); const n = napoleon(); M.stage.add(n); const sw = swarm(M.stage, 22, [-9, -3, -2, 2], 11); return { M, stage: M.stage, n, sw }; },
  draw(s, t) { s.M.update(t); const x = -1 + t * 3.6; s.n.position.set(x, 0, 0); s.n.rotation.y = Math.PI / 2; s.n.pose(run(t * 1.4)); s.n.face(EXPR.panic, t); s.n.hat.rotation.z = 0.3;
    s.sw.forEach((r, i) => { r.position.x = r.x0 + t * 3.6; r.rotation.y = Math.PI / 2; r.hop(t, { speed: 3.6, ph: r.ph, height: 0.45 }); });
    s.stage.cam([x - 1.5, 2.0, 7.5], [x - 1.5, 1.0, 0], 40); } });

// ---------- s15 "He fled to his carriage." he dives in, door slams ----------
function carInit(T) { const M = meadow(T, { seed: 22 }); const c = carriage(); c.position.set(0, 0, -0.5); M.stage.add(c); const n = napoleon(); M.stage.add(n); return { M, stage: M.stage, c, n }; }
registerShot('s15', { kind: '3d', init: carInit,
  draw(s, t) { s.M.update(t); const k = ease.in(prog(t, 0, 0.8)); s.n.position.set(lerp(-3.5, 0.9, k), lerp(0, 1.2, prog(t, 0.6, 0.85)), lerp(1.4, 0.2, prog(t, 0.6, 0.9))); s.n.visible = t < 0.95; s.n.rotation.y = Math.PI / 2; s.n.pose(run(t * 1.6)); s.n.face(EXPR.panic, t);
    s.c.door.rotation.y = 0; s.stage.cam([0, 2.3, 9], [0, 1.6, -0.5], 38); shakeCam(s.stage, t, [{ fx: 'shake', at: 1.0, amp: 0.08, dur: 0.25 }]); } });
// ---------- s16 "Some reportedly hopped in after him." the window: Napoleon deadpan, rabbits popping up beside him ----------
registerShot('s16', { kind: '3d', init(T) { const S = carInit(T); S.n.position.set(-0.2, 1.12, 0.62); S.n.scale.setScalar(0.62); S.n.rotation.y = 0.15; const sill = rbox(1.9, 1.5, 0.12, '#2a3a6a', -0.2, 0.85, 0.95, 0.05); outline(sill, { px: 2.4 }); S.stage.add(sill);
    S.rr = [0, 1, 2, 3].map(i => { const r = rabbit({ seed: i + 1 }); r.scale.setScalar(0.55); S.stage.add(r); return r; }); return S; },
  draw(s, t) { s.M.update(t); s.n.pose(addPose(POSE.stand, idle(t))); s.n.face({ ...EXPR.deadpan, lid: 0.6, pupil: [0, 0] }, t);
    s.rr.forEach((r, i) => { const k = ease.outBack(prog(t, 0.25 + i * 0.3, 0.45 + i * 0.3)); r.position.set([-0.62, 0.32, -0.05, 0.62][i], 1.25 + k * [0.45, 0.4, 1.05, 0.95][i], 0.58 + (i > 1 ? -0.04 : 0.06)); r.visible = k > 0.01; r.hop(t, { speed: 2, ph: i * 0.3, height: 0.05 }); });
    s.stage.cam([-0.2, 2.2, 3.9], [-0.2, 2.1, 0.5], 32); },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'sweat', on: 'n', at: 1.0 }]); } });
