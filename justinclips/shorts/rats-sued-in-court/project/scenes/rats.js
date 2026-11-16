// The rats who got a lawyer: 13 shots, Toon 3D + BEANMEN FX. EMOTION: LOL. Deadpan narrator; the accounts are old, so hedged.
// Tone guard: the cats only lounge and stare; nobody (rat or cat) is ever hurt or chased on screen.
import { registerShot, E } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, point, shrug, shake } from '/kits/toon3d/rig.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import {
  THREE, toonStage, rat, lawyer, official, townsperson, crier, cat, scrollProp, gavel, ratBench, lectern, courtHall, barleyField, barleyStalk, village, PR, ball, cyl, box, rbox, outline,
  at, topCaption, stamp, badge, aside, nameplate, paperCard, burst, insT, CARD_INK, clamp, lerp, ease, prog,
} from './_lib.js';

const SOFT = { rays: false, tint: '#ffe0b0' };
const RAYS = { rays: { from: [-70, -60], strength: 0.6 }, tint: '#ffd49a' };
const v3 = new THREE.Vector3();
const scr = (st, p) => { v3.set(...p).project(st.camera); return [(v3.x + 1) / 2 * E.W, (1 - v3.y) / 2 * E.H]; };
const HATS = ['#2a4a7a', null, '#a3352b', null, '#4a6a3a'];

// the courtroom with the official at the high bench, the rats' bench (rats optional) and the lawyer's lectern
function court(T, o = {}) {
  const st = toonStage(T, { light: 'warm', fov: o.fov || 40, shadowSize: 10, target: [0, 1, -0.5] }); const env = courtHall(st);
  const of = official(); of.position.set(0, 0.6, -3.3); st.add(of); const gv = gavel(); of.hand.R.add(gv); gv.position.set(0, 0.25, 0.1);
  const bn = ratBench(); bn.position.set(-2.2, 0, 0.8); bn.rotation.y = 0.5; st.add(bn);
  const rats = []; if (o.rats !== false) for (let i = 0; i < 5; i++) { const r = rat({ seed: i + 2, hat: HATS[i] }); r.position.set(-1.2 + i * 0.6, 1.06, 0); bn.add(r); rats.push(r); }
  const lc = lectern(); lc.position.set(1.4, 0, 1.4); lc.rotation.y = -0.5; st.add(lc);
  const lw = lawyer(); lw.position.set(1.0, 0, 2.0); lw.rotation.y = -0.6; st.add(lw);
  return { stage: st, env, of, gv, rats, lw, bn };
}
const offPose = (s, t, k = 0, expr = EXPR.suspicious) => { s.of.pose(addPose(POSE.stand, { armR: [lerp(0.9, 2.4, k), 0.2, 0.3], elbowR: 0.8, armL: [0.9, 0.2, 0.3], elbowL: 1.0, lean: 0.12 })); s.of.face(expr, t); };

// ---- s01 (frame 1): a row of tiny rats in tiny hats sits in the dock; their lawyer pleads passionately; the official leans in.
registerShot('s01', { kind: '3d',
  init(T) { return court(T, { fov: 44 }); },
  draw(s, t, info) {
    s.rats.forEach((r, i) => r.update(t, { lid: 0.3, look: [0.5, 0], hop: 0.4, headTurn: 0.4 }));
    s.lw.pose(addPose(point(POSE.stand, 'R', 1, { up: 0.5 + Math.sin(t * 5) * 0.15 }), { bob: Math.sin(t * 5) * 0.03, lean: 0.1 })); s.lw.face({ ...EXPR.angry, mouth: 'o' }, t);
    offPose(s, t, 0, { ...EXPR.shocked, lid: 0.2 });
    camMove(s.stage, t, [[0, { pos: [-1.2, 2.5, 7.4], look: [-1.0, 1.7, 0.2], fov: 46 }], [info.dur, { pos: [-1.1, 2.5, 6.6], look: [-1.0, 1.75, 0.2], fov: 45 }]]); },
  overlay(g, t, info, s) { topCaption(g, t, info); reactions(g, t, s, [{ fx: 'exclaim', on: 'of', at: 0.1 }]); },
});

// ---- s02: "...And they got a lawyer." the lawyer bows to his clients; the rats wave back. DEFENSE badge.
registerShot('s02', { kind: '3d',
  init(T) { return court(T, { fov: 34 }); },
  draw(s, t, info) { const k = ease.out(prog(t, 0.1, 0.4));
    s.rats.forEach((r, i) => r.update(t, { lid: 0.25, wave: i === 2 ? ease.out(prog(t, 0.3, 0.5)) : 0, look: [0.6, 0], headTurn: 0.5 }));
    s.lw.pose(addPose(POSE.stand, { lean: 0.35 * k, armR: [0.4, 0.6, 1.2], elbowR: 1.4, headNod: 0.25 * k })); s.lw.face(EXPR.happy, t); offPose(s, t);
    camMove(s.stage, t, [[0, { pos: [0.4, 2.2, 6.0], look: [-0.9, 1.6, 0.8], fov: 36 }], [info.dur, { pos: [0.3, 2.2, 5.4], look: [-0.9, 1.6, 0.8], fov: 35 }]]); },
  overlay(g, t, info, s) { topCaption(g, t, info); badge(g, t, 'THE DEFENSE', { at: at(info, 'lawyer', 0.6) - 0.05, x: E.W / 2, y: 520, w: 560, size: 76, color: '#2a4a8a', rot: -0.05 }); },
});

// ---- s03: "France, the early 1500s." a golden barley field; rats nibbling everywhere.
registerShot('s03', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'sunny', fov: 42, shadowSize: 10, target: [0, 1, 0] }); const env = barleyField(st);
    const rats = []; for (let i = 0; i < 7; i++) { const r = rat({ seed: i + 10 }); r.position.set(-3 + i * 1.0, 0, 2 - (i % 3) * 1.4); r.rotation.y = (i % 2 ? -0.4 : 0.4); st.add(r); rats.push(r); } return { stage: st, env, rats }; },
  draw(s, t, info) { s.env.update(t); s.rats.forEach((r, i) => r.update(t + i, { chew: 1, lid: 0.4 }));
    camMove(s.stage, t, [[0, { pos: [0, 2.4, 9], look: [0, 0.9, 0], fov: 42 }], [info.dur, { pos: [0.5, 2.2, 8], look: [0, 0.9, 0], fov: 41 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); badge(g, t, 'FRANCE', { at: 0.05, x: 300, y: 470, w: 360, color: '#2a4a9a' }); badge(g, t, 'early 1500s', { at: at(info, '1500s', 0.6) - 0.05, x: 740, y: 600, w: 440, size: 70 }); },
});

// ---- s04: "Rats reportedly ate the barley around Autun." close on one rat, cheeks stuffed, chewing a barley ear.
registerShot('s04', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'sunny', fov: 30, shadowSize: 4, target: [0, 0.5, 0] }); const env = barleyField(st, { n: 120 });
    const r = rat({ seed: 4 }); st.add(r); const st2 = barleyStalk(3, 0.5); r.head.add(st2); st2.position.set(0.05, -0.15, 0.3); st2.rotation.set(1.3, 0, 0.3); st2.scale.setScalar(0.7); return { stage: st, env, r }; },
  draw(s, t, info) { s.env.update(t); s.r.update(t, { chew: 1, lid: 0.45, look: [0, 0] }); s.r.head.scale.set(1 + 0.08 * Math.abs(Math.sin(t * 11)), 1, 1);
    camMove(s.stage, t, [[0, { pos: [0, 1.0, 3.0], look: [0, 0.7, 0], fov: 32 }], [info.dur, { pos: [0, 1.0, 2.6], look: [0, 0.72, 0], fov: 31 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); aside(g, t, '(reportedly)', { at: at(info, 'reportedly', 0.1), y: 1540, size: 58 });
    badge(g, t, 'AUTUN', { at: at(info, 'autun', 1.4) - 0.05, x: E.W / 2, y: 470, w: 400, size: 88, color: '#2a4a9a', rot: -0.05 }); },
});

// ---- s05: "So a court summoned the rats." the town crier reads the summons in the village street.
registerShot('s05', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'sunny', fov: 36, shadowSize: 8, target: [0, 1, 0] }); const env = village(st);
    const c = crier(); c.position.set(0, 0, 0); st.add(c); const sc = scrollProp(); c.hand.R.add(sc); sc.position.set(-0.15, 0.25, 0.2); sc.rotation.set(0.2, 0, 0);
    const bell = new THREE.Group(); bell.add(new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.25, 14), new THREE.MeshToonMaterial({ color: '#d4a73a' }))); bell.add(cyl(0.02, 0.02, 0.25, '#5a3820', 0, 0.22, 0, 6)); outline(bell, { px: 2 }); c.hand.L.add(bell); bell.position.set(0, -0.1, 0); bell.rotation.x = Math.PI;
    return { stage: st, env, c, bell }; },
  draw(s, t, info) { s.env.update(t); s.c.pose(addPose(POSE.stand, { armR: [1.5, 0.2, 0.4], elbowR: 0.4, armL: [0.8 + Math.sin(t * 14) * 0.25, 0.4, 0], elbowL: 0.2, headNod: -0.1 })); s.c.face({ ...EXPR.happy, mouth: 'o' }, t);
    camMove(s.stage, t, [[0, { pos: [0.4, 2.4, 7.5], look: [0, 2.0, 0], fov: 36 }], [info.dur, { pos: [0.3, 2.4, 6.7], look: [0, 2.05, 0], fov: 35 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); stamp(g, t - at(info, 'summoned', 0.6), 'SUMMONS', { y: 480, size: 104, w: 560, color: '#7a2a1e' }); },
});

// ---- s06: "The rats... did not show up." the rats' bench: empty. The official waits, tapping. Held beat; NO-SHOW stamp.
registerShot('s06', { kind: '3d',
  init(T) { return court(T, { fov: 40, rats: false }); },
  draw(s, t, info) { s.lw.pose(addPose(shrug(POSE.stand, ease.out(prog(t, at(info, 'show', 1.0) - 0.2, at(info, 'show', 1.0) + 0.2))), idle(t, 2))); s.lw.face(EXPR.worried, t);
    s.of.pose(addPose(POSE.stand, { armR: [0.9, 0.2, 0.3], elbowR: 1.0, armL: [0.9 + Math.abs(Math.sin(t * 6)) * 0.15, 0.2, 0.3], elbowL: 1.0, lean: 0.12 })); s.of.face(EXPR.bored, t);
    camMove(s.stage, t, [[0, { pos: [-1.0, 3.0, 8.5], look: [-1.4, 1.6, 0.2], fov: 40 }], [info.dur, { pos: [-1.0, 3.0, 7.5], look: [-1.5, 1.6, 0.4], fov: 39 }]]); },
  overlay(g, t, info, s) { const [x, y] = scr(s.stage, [-2.2, 1.6, 0.8]); g.save(); insT(g, '. . .', x, y - 80, 80, { color: '#ffffff', stroke: CARD_INK }); g.restore();
    stamp(g, t - at(info, 'show', 1.0), 'NO-SHOW', { y: 520, size: 110, w: 560 }); },
});

// ---- s07: "Their lawyer said that was unfair..." Chasseneuz argues, finger raised. Nameplate.
registerShot('s07', { kind: '3d',
  init(T) { return court(T, { fov: 32 }); },
  draw(s, t, info) { const k = ease.outBack(prog(t, 0.05, 0.35)); s.lw.pose(addPose(mixPose(POSE.stand, { ...POSE.stand, armR: [2.6, 0.1, 0], elbowR: 0.4 }, k), { ...idle(t, 3), bob: Math.sin(t * 4) * 0.02 })); s.lw.face({ ...EXPR.angry, mouth: 'o', lid: 0.2 }, t);
    s.rats.forEach(r => r.update(t, { lid: 0.3, look: [0.6, 0] })); offPose(s, t);
    camMove(s.stage, t, [[0, { pos: [0.0, 2.4, 6.8], look: [1.0, 2.1, 2.0], fov: 32 }], [info.dur, { pos: [0.1, 2.4, 6.2], look: [1.0, 2.15, 2.0], fov: 31 }]]); },
  overlay(g, t, info, s) { nameplate(g, t, 'BARTHÉLEMY DE CHASSENEUZ', 'the rats\' lawyer', { at: 0.15, y: 1640 }); stamp(g, t - at(info, 'unfair', 0.8), 'UNFAIR!', { y: 470, size: 104, w: 480 }); },
});

// ---- s08: "...his clients lived in lots of villages." a map card: villages everywhere, a rat in each. One summons can't reach them all.
registerShot('s08', { kind: '3d',
  init(T) { return court(T, { fov: 40 }); },
  draw(s, t, info) { s.rats.forEach(r => r.update(t, { lid: 0.3 })); offPose(s, t); s.lw.pose(idle(t, 3)); s.lw.face(EXPR.neutral, t);
    camMove(s.stage, t, [[0, { pos: [0, 3.0, 8.5], look: [0, 2.0, 0], fov: 40 }], [info.dur, { pos: [0, 3.0, 8.3], look: [0, 2.0, 0], fov: 40 }]]); },
  overlay(g, t, info, s) { g.save(); g.fillStyle = 'rgba(20,12,10,.55)'; g.fillRect(0, 0, E.W, E.H); g.restore();
    const k = ease.outBack(clamp(t / 0.3)); const tv = at(info, 'villages', 0.9);
    g.save(); g.translate(E.W / 2, 820); g.scale(k, k); g.rotate(0.02); g.fillStyle = '#e8dcb0'; g.strokeStyle = CARD_INK; g.lineWidth = 8; g.beginPath(); g.roundRect(-430, -420, 860, 840, 22); g.fill(); g.stroke();
    insT(g, 'Where the rats live:', 0, -350, 56, { color: '#7a2a1e', stroke: null });
    const pts = [[-280, -200], [-60, -230], [200, -180], [-320, 0], [-100, -40], [140, 10], [320, -40], [-230, 200], [20, 170], [250, 230], [-40, 320], [330, 140]];
    pts.forEach(([x, y], i) => { const a = clamp((t - i * 0.06) / 0.15); if (a <= 0) return; g.save(); g.globalAlpha = a; g.translate(x, y);
      g.fillStyle = '#f2e6c4'; g.strokeStyle = CARD_INK; g.lineWidth = 4; g.beginPath(); g.rect(-34, -10, 68, 40); g.fill(); g.stroke(); g.fillStyle = '#a8503a'; g.beginPath(); g.moveTo(-42, -10); g.lineTo(0, -44); g.lineTo(42, -10); g.closePath(); g.fill(); g.stroke();
      if (t > tv - 0.2 + i * 0.03) { g.fillStyle = '#7a7a82'; g.beginPath(); g.ellipse(46, 22, 16, 11, 0, 0, 7); g.fill(); g.beginPath(); g.arc(60, 16, 8, 0, 7); g.fill(); g.strokeStyle = '#e8a0a0'; g.lineWidth = 3; g.beginPath(); g.moveTo(30, 26); g.quadraticCurveTo(14, 36, 8, 20); g.stroke(); }
      g.restore(); });
    g.restore(); },
});

// ---- s09: "Then he said they couldn't come safely..." the lawyer, hand on heart, pleads; the official raises an eyebrow.
registerShot('s09', { kind: '3d',
  init(T) { return court(T, { fov: 36 }); },
  draw(s, t, info) { const k = ease.out(prog(t, 0.05, 0.35)); s.lw.pose(addPose(mixPose(POSE.stand, { ...POSE.stand, armL: [1.2, 0.1, 0.6], elbowL: 1.9, armR: [1.0, 0.7, 0.3], elbowR: 0.3, headTilt: 0.15 }, k), idle(t, 4))); s.lw.face(mixExpr(EXPR.neutral, EXPR.sad, k), t);
    s.rats.forEach(r => r.update(t, { lid: 0.2, look: [0.6, 0] })); offPose(s, t, 0, { ...EXPR.suspicious, browL: 0.6 });
    camMove(s.stage, t, [[0, { pos: [1.6, 3.2, 8.0], look: [0.4, 2.2, -0.6], fov: 38 }], [info.dur, { pos: [1.5, 3.2, 7.2], look: [0.4, 2.25, -0.6], fov: 37 }]]); },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'question', on: 'of', at: 0.6 }]); },
});

// ---- s10: "...because of the town's cats." three cats lounge in the street and stare; a rat peeks out from a barrel and ducks back.
registerShot('s10', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'sunny', fov: 38, shadowSize: 8, target: [0, 1, 0] }); const env = village(st);
    const cats = [['#e0954a', '#7a3aa8'], ['#4a4a52', '#c8281e'], ['#f2ede2', '#2a6ac0']].map(([fur, collar], i) => { const c = cat({ fur, collar, belly: fur === '#4a4a52' ? '#8a8a92' : '#f6e2c4', seed: i + 3, scale: 1.1 }); c.position.set(-1.6 + i * 1.6, 0, 1.2 - (i % 2) * 0.6); c.rotation.y = (i - 1) * -0.3; st.add(c); return c; });
    const br = PR.barrel(); br.position.set(2.3, 0, -1.6); st.add(br); const r = rat({ seed: 5 }); r.position.set(1.95, 0, -1.5); r.rotation.y = -0.8; st.add(r); return { stage: st, env, cats, r }; },
  draw(s, t, info) { s.env.update(t); s.cats.forEach((c, i) => c.update(t + i, { lid: 0.62, look: [0.4, 0], tail: 0.8, headTurn: 0.25 }));
    const p = Math.sin(clamp(t / info.dur) * Math.PI); s.r.position.x = 2.25 - p * 0.45; s.r.update(t, { lid: 0.0, look: [-0.6, 0] });
    camMove(s.stage, t, [[0, { pos: [0.4, 2.6, 10.8], look: [0.3, 1.1, -0.3], fov: 50 }], [info.dur, { pos: [0.5, 2.5, 10.0], look: [0.3, 1.1, -0.3], fov: 49 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); reactions(g, t, s, [{ fx: 'sweat', on: 'r', at: 0.3 }]); const tc = at(info, 'cats', 0.6); burst(g, t - tc, 'CATS', { y: 480, r: 230, size: 110, until: 2.0, color: '#7a2a8a' }); },
});

// ---- s11: "He wanted the cats kept indoors." the lawyer appeals to the townsfolk, who are each holding a cat.
function towns(T) { const st = toonStage(T, { light: 'sunny', fov: 38, shadowSize: 8, target: [0, 1, 0] }); const env = village(st);
  const lw = lawyer(); lw.position.set(-1.9, 0, 1.4); lw.rotation.y = 0.6; st.add(lw);
  const folk = [0, 1, 2].map(i => { const p = townsperson({ seed: 111 + i * 5 }); p.position.set(0.0 + i * 1.3, 0, 0.6 - (i % 2) * 0.4); p.rotation.y = -0.35; st.add(p);
    const c = cat({ fur: ['#e0954a', '#4a4a52', '#f2ede2'][i], collar: ['#7a3aa8', '#c8281e', '#2a6ac0'][i], seed: i + 3, scale: 0.55 }); p.parts.upper.add(c); c.position.set(0, 0.25, 0.42); return { p, c }; });
  return { stage: st, env, lw, folk, a: folk[1].p }; }
registerShot('s11', { kind: '3d',
  init: towns,
  draw(s, t, info) { s.env.update(t); s.lw.pose(addPose(point(POSE.stand, 'L', ease.out(prog(t, 0.05, 0.35)), { up: 0.1 }), idle(t, 3))); s.lw.face({ ...EXPR.happy, mouth: 'o' }, t);
    s.folk.forEach(({ p, c }, i) => { p.pose(addPose(POSE.holdFront, idle(t, i))); p.face(EXPR.suspicious, t + i); c.update(t + i, { lid: 0.55, tail: 0.5 }); });
    camMove(s.stage, t, [[0, { pos: [-0.2, 2.6, 8.4], look: [0, 1.8, 0.8], fov: 40 }], [info.dur, { pos: [-0.2, 2.6, 7.6], look: [0, 1.85, 0.8], fov: 39 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); paperCard(g, t, { at: at(info, 'indoors', 0.8) - 0.3, y: 480, h: 240, w: 760, rot: -0.04, top: 120, lines: [{ text: 'KEEP CATS INDOORS?', size: 66, color: '#7a2a1e' }] }); },
});

// ---- s12: "The owners said no." the townsfolk hug their cats and shake their heads. NO stamp.
registerShot('s12', { kind: '3d',
  init: towns,
  draw(s, t, info) { s.env.update(t); s.lw.pose(addPose(shrug(POSE.stand, ease.out(prog(t, 0.3, 0.6))), idle(t, 3))); s.lw.face(EXPR.worried, t);
    s.folk.forEach(({ p, c }, i) => { p.pose(addPose({ ...POSE.holdFront, armL: [0.95, 0.45, 0.6], armR: [0.95, 0.45, 0.6], elbowL: 1.4, elbowR: 1.4 }, shake(t + i * 0.1, 0.3, 2.5))); p.face({ ...EXPR.angry, mouth: 'line' }, t + i); c.update(t + i, { lid: 0.3, tail: 1.0 }); });
    camMove(s.stage, t, [[0, { pos: [0.8, 2.4, 6.8], look: [1.2, 1.9, 0.6], fov: 38 }], [info.dur, { pos: [0.8, 2.4, 6.2], look: [1.2, 1.95, 0.6], fov: 37 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); stamp(g, t - at(info, 'no', 0.5), 'NO.', { y: 470, size: 140, w: 380 }); reactions(g, t, s, [{ fx: 'hearts', on: 'a', at: 0.15 }]); },
});

// ---- s13: PAYOFF "So the case was reportedly thrown out." gavel; CASE THROWN OUT stamp; the rats cheer, the lawyer bows. Cut to s01 (loop).
registerShot('s13', { kind: '3d',
  init(T) { return court(T, { fov: 42 }); },
  draw(s, t, info) { const tt = at(info, 'thrown', 0.8); const bang = prog(t, tt - 0.3, tt - 0.05);
    s.of.pose(addPose(POSE.stand, { armR: [lerp(2.4, 0.9, ease.in(bang)), 0.2, 0.3], elbowR: 0.6, armL: [0.9, 0.2, 0.3], elbowL: 1.0, lean: 0.12 })); s.of.face(EXPR.bored, t);
    const k = ease.out(prog(t, tt, tt + 0.3)); s.rats.forEach((r, i) => r.update(t, { lid: 0.2, hop: k, wave: k }));
    s.lw.pose(addPose(POSE.stand, { lean: 0.35 * k, armR: [0.4, 0.6, 1.2], elbowR: 1.4, headNod: 0.25 * k })); s.lw.face(EXPR.grin, t);
    camMove(s.stage, t, [[0, { pos: [-0.4, 3.0, 9.4], look: [-0.3, 2.0, 0], fov: 44 }], [info.dur, { pos: [-0.3, 2.9, 8.6], look: [-0.3, 2.0, 0], fov: 43 }]]); shakeCam(s.stage, t, [{ fx: 'shake', at: tt - 0.05, amp: 0.05, dur: 0.3 }]); },
  overlay(g, t, info, s) { const tt = at(info, 'thrown', 0.8); stamp(g, t - tt, 'CASE THROWN OUT', { y: 470, size: 92, w: 820, color: '#2f8a3a' }); aside(g, t, '(reportedly)', { at: at(info, 'reportedly', 0.4), y: 1560, size: 58 }); },
});
