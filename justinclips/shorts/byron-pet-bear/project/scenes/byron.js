// Lord Byron's college bear: 13 shots, Toon 3D + BEANMEN FX. EMOTION: LOL. Deadpan narrator; the bear is tame and happy.
// Every timing inside a shot is relative (info.dur, or at(info, word) from the voice's word times), so a re-voice re-times it.
import { registerShot, E } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, point, shrug, walk } from '/kits/toon3d/rig.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import {
  THREE, toonStage, bear, byron, don, porter, mortarboard, sign, book, quill, desk, candle, letterPaper, quad, study, PR, ball, cyl, box, rbox, outline,
  at, topCaption, stamp, badge, aside, nameplate, paperCard, burst, noSign, insT, CARD_INK, clamp, lerp, ease, prog,
} from './_lib.js';

const RAYS = { rays: { from: [-70, -60], strength: 0.6 }, tint: '#ffd49a' };
const SOFT = { rays: false, tint: '#ffe0b0' };
const v3 = new THREE.Vector3();
const scr = (st, p) => { v3.set(...p).project(st.camera); return [(v3.x + 1) / 2 * E.W, (1 - v3.y) / 2 * E.H]; };
const ribbon = (st, a, b, col = '#c23a3a') => { const geo = new THREE.BufferGeometry(); const N = 16; geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
  const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: col, linewidth: 2 })); st.add(line);
  // a thick ribbon reads better than a 1-px line: a tube rebuilt every frame
  const tubeM = new THREE.MeshBasicMaterial({ color: col }); let tube = null;
  return (pa, pb) => { const mid = pa.clone().lerp(pb, 0.5); mid.y -= 0.35; const curve = new THREE.QuadraticBezierCurve3(pa, mid, pb);
    if (tube) { st.scene.remove(tube); tube.geometry.dispose(); } tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 16, 0.03, 6), tubeM); tube.userData.noOutline = true; st.add(tube); line.visible = false; }; };
const handPos = (b, side = 'R') => { const p = new THREE.Vector3(); b.hand[side].getWorldPosition(p); return p; };
const DOG = (g, r) => { g.fillStyle = '#2a1c15'; g.beginPath(); g.ellipse(-r * 0.05, r * 0.08, r * 0.42, r * 0.22, 0, 0, 7); g.fill(); g.beginPath(); g.arc(r * 0.38, -r * 0.12, r * 0.18, 0, 7); g.fill();
  g.beginPath(); g.ellipse(r * 0.5, -r * 0.3, r * 0.07, r * 0.14, 0.4, 0, 7); g.fill(); for (const x of [-0.35, -0.15, 0.1, 0.28]) g.fillRect(x * r, r * 0.18, r * 0.08, r * 0.3); g.fillRect(-r * 0.55, -r * 0.05, r * 0.2, r * 0.07); };

function quadStage(T, o = {}) { const st = toonStage(T, { light: 'sunny', fov: o.fov || 40, shadowSize: o.shadowSize || 14, target: o.target || [0, 1, 0] }); const env = quad(st, o); return { stage: st, env }; }
function studyStage(T, o = {}) { const st = toonStage(T, { light: 'warm', fov: o.fov || 36, shadowSize: o.shadowSize || 8, target: o.target || [0, 1, 0] }); const env = study(st, o); return { stage: st, env }; }

// ---- s01 (frame 1): a bear in a gown + mortarboard strolls down the college path on a ribbon lead, Byron beside it; NO DOGS sign
//      in the foreground; the porter's jaw drops. Already moving. Top caption from frame 1.
function strollInit(T) {
  const s = quadStage(T, { fov: 44, shadowSize: 16, target: [0, 1, 2] });
  const b = bear({ gown: true, cap: true }); b.position.set(0.9, 0, 0); s.stage.add(b);
  const by = byron(); by.position.set(-1.0, 0, 0.3); s.stage.add(by);
  const p = porter(); p.position.set(3.6, 0, 6.2); p.rotation.y = -1.2; s.stage.add(p);
  const sg = sign('NO DOGS', { w: 2.0, h: 0.9, y: 1.7 }); sg.position.set(-3.2, 0, 6.6); sg.rotation.y = 0.35; s.stage.add(sg);
  const rib = ribbon(s.stage);
  return { ...s, b, by, p, sg, rib };
}
registerShot('s01', { kind: '3d',
  init: strollInit,
  draw(s, t, info) {
    const z = -1.5 + t * 1.05; s.env.update(t);
    s.b.position.z = z; s.by.position.z = z + 0.2;
    s.b.update(t, { walk: 1, lid: 0.45, smile: 1, headTurn: -0.25 + Math.sin(t * 2) * 0.1 });
    s.by.pose(addPose(walk(t + 0.3), { armR: [0.6, 0.35, 0.3], elbowR: 0.6 })); s.by.face({ ...EXPR.smug }, t);
    s.p.pose(addPose(mixPose(POSE.stand, POSE.panic, clamp(t / 0.25)), { lean: -0.1 })); s.p.face(EXPR.shocked, t);
    s.b.updateMatrixWorld(true); s.by.updateMatrixWorld(true);
    const a = handPos(s.by, 'R'); const c = new THREE.Vector3(); s.b.head.getWorldPosition(c); c.y -= 0.45; c.z += 0.3; s.rib(a, c);
    camMove(s.stage, t, [[0, { pos: [0.6, 3.0, 9.8], look: [0.2, 2.0, 0.5], fov: 46 }], [info.dur, { pos: [0.6, 2.9, 10.8], look: [0.2, 2.0, 1.4], fov: 46 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, SOFT);
    reactions(g, t, s, [{ fx: 'exclaim', on: 'p', at: 0.05 }]);
    topCaption(g, t, info);
  },
});

// ---- s02: "...so he brought a bear." close on the porter's double take as the bear strolls past and waves.
registerShot('s02', { kind: '3d',
  init(T) { const s = quadStage(T, { fov: 34, shadowSize: 8, target: [0, 1, 3] });
    const p = porter(); p.position.set(-0.9, 0, 3.6); p.rotation.y = 0.35; s.stage.add(p);
    const b = bear({ gown: true, cap: true }); b.position.set(1.6, 0, 1.0); b.rotation.y = -0.5; s.stage.add(b); return { ...s, p, b }; },
  draw(s, t, info) {
    s.env.update(t); const k = clamp(t / 0.3);
    s.b.position.x = 1.9 - t * 1.0; s.b.update(t, { walk: 1, wave: ease.out(prog(t, 0.2, 0.5)), lid: 0.35, headTurn: 0.5 });
    s.p.pose(addPose(mixPose(POSE.stand, { ...POSE.stand, armL: [0.3, 0.3, 0], armR: [0.3, 0.3, 0], lean: -0.15 }, k), { headTurn: -0.5 })); s.p.face(mixExpr(EXPR.neutral, { ...EXPR.shocked, mouth: 'scream' }, k), t);
    camMove(s.stage, t, [[0, { pos: [0.5, 2.5, 9.6], look: [0.0, 2.0, 2.8], fov: 38 }], [info.dur, { pos: [0.5, 2.4, 8.8], look: [0.0, 2.0, 2.8], fov: 37 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); reactions(g, t, s, [{ fx: 'sweat', on: 'p', at: 0.2 }]); topCaption(g, t, info);
    const tb = at(info, 'bear', 0.5); burst(g, t - tb, 'A BEAR?!', { y: 560, r: 250, size: 104, until: 1.3 }); },
});

// ---- s03: "This is Lord Byron, the poet," the poet poses dramatically, quill raised. Nameplate.
registerShot('s03', { kind: '3d',
  init(T) { const s = quadStage(T, { fov: 30, shadowSize: 6, target: [0, 1, 3], fountain: false }); const by = byron(); by.position.set(0, 0, 3); s.stage.add(by);
    const q = quill(); by.hand.R.add(q); q.position.set(0, 0.05, 0.05); q.rotation.x = -0.3; return { ...s, by }; },
  draw(s, t, info) { s.env.update(t); const k = ease.outBack(prog(t, 0.05, 0.4));
    s.by.pose(addPose(mixPose(POSE.stand, { ...POSE.stand, armR: [2.3, 0.4, 0.2], elbowR: 0.5, armL: [0.9, 0.3, 1.1], elbowL: 1.8, headTilt: -0.12, headNod: -0.1 }, k), idle(t, 3)));
    s.by.face({ ...EXPR.smug, lid: 0.55 }, t);
    camMove(s.stage, t, [[0, { pos: [0.4, 2.3, 9.0], look: [0, 2.1, 3], fov: 30 }], [info.dur, { pos: [0.3, 2.3, 8.2], look: [0, 2.15, 3], fov: 29 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'sparkle', on: 'by', at: 0.3, scale: 0.8 }]);
    nameplate(g, t, 'LORD BYRON', 'yes, the famous poet', { at: at(info, 'byron', 0.3) - 0.1, y: 1640 }); },
});

// ---- s04: "...at Cambridge, around 1807." wide establishing shot of the college quad; c.1807 badge.
registerShot('s04', { kind: '3d',
  init(T) { const s = quadStage(T, { fov: 48, shadowSize: 18, target: [0, 1, -4] }); const by = byron(); by.position.set(-0.6, 0, 1.5); by.rotation.y = Math.PI; s.stage.add(by);
    const b = bear({ gown: true, cap: true }); b.position.set(1.0, 0, 1.3); b.rotation.y = Math.PI; s.stage.add(b); return { ...s, by, b }; },
  draw(s, t, info) { s.env.update(t); s.by.position.z = 1.5 - t * 0.9; s.b.position.z = 1.3 - t * 0.9;
    s.by.pose(walk(t)); s.by.face(EXPR.neutral, t); s.b.update(t, { walk: 1 });
    camMove(s.stage, t, [[0, { pos: [0, 5.5, 14], look: [0, 4.5, -8], fov: 52 }], [info.dur, { pos: [0, 6.2, 12.5], look: [0, 5.2, -8], fov: 50 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); badge(g, t, 'CAMBRIDGE', { at: at(info, 'cambridge', 0.1) - 0.05, x: E.W / 2, y: 470, w: 640, size: 86, color: '#2a4a8a', rot: -0.05 });
    badge(g, t, 'c. 1807', { at: at(info, '1807', 0.8) - 0.05, x: 760, y: 640, w: 330 }); },
});

// ---- s05: "His college reportedly had a rule: no dogs." the porter holds up the rulebook; a NO DOGS symbol slams in.
registerShot('s05', { kind: '3d',
  init(T) { const s = quadStage(T, { fov: 32, shadowSize: 7, target: [0, 1, 3] }); const p = porter(); p.position.set(0, 0, 3); s.stage.add(p);
    const bk = book({ color: '#7a2a1e' }); p.hand.R.add(bk); bk.position.set(0.0, 0.1, 0.15); bk.rotation.set(1.2, 0, 0); return { ...s, p, bk }; },
  draw(s, t, info) { s.env.update(t); const k = ease.outBack(prog(t, 0.05, 0.35));
    s.p.pose(addPose(mixPose(POSE.stand, { ...POSE.stand, armR: [1.35, 0.35, 0.2], elbowR: 0.5, armL: [0.2, 0.75, -1.4], elbowL: 1.9 }, k), idle(t, 4))); s.p.face({ ...EXPR.suspicious, pupil: [0, 0] }, t);
    camMove(s.stage, t, [[0, { pos: [0.5, 2.4, 9.0], look: [0, 2.2, 3], fov: 33 }], [info.dur, { pos: [0.4, 2.4, 8.3], look: [0, 2.25, 3], fov: 32 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); aside(g, t, '(reportedly)', { at: at(info, 'reportedly', 0.3), y: 1540, size: 56 }); },
});

// ---- s05b: "...no dogs." close on the NO DOGS sign at the gate; a no-dogs symbol and stamp slam in.
registerShot('s05b', { kind: '3d',
  init(T) { const s = quadStage(T, { fov: 30, shadowSize: 6, target: [0, 1, 0] }); const sg = sign('NO DOGS', { w: 2.0, h: 0.9, y: 1.7 }); sg.position.set(0, 0, 0); s.stage.add(sg); return { ...s, sg }; },
  draw(s, t, info) { s.env.update(t); camMove(s.stage, t, [[0, { pos: [0.6, 1.9, 7.6], look: [0, 1.8, 0], fov: 32 }], [info.dur, { pos: [0.5, 1.9, 6.8], look: [0, 1.8, 0], fov: 31 }]]); shakeCam(s.stage, t, [{ fx: 'shake', at: at(info, 'dogs', 0.4), amp: 0.04, dur: 0.3 }]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); const k = ease.outBack(clamp((t - at(info, 'no', 0.1) + 0.05) / 0.22));
    if (k > 0) noSign(g, E.W / 2, 470, 190, k, DOG);
    stamp(g, t - at(info, 'dogs', 0.4), 'NOPE', { y: 1640, size: 112, w: 440 }); },
});

// ---- s06: "But the rules said nothing..." Byron hunts through the rulebook with a magnifying glass. Held beat.
registerShot('s06', { kind: '3d',
  init(T) { const s = studyStage(T, { fov: 32, target: [0, 1, 1.5] }); const by = byron(); by.position.set(0, 0, 1.5); s.stage.add(by);
    const bk = book({ color: '#7a2a1e' }); by.hand.L.add(bk); bk.position.set(0, 0.08, 0.1); bk.rotation.set(1.3, 0, 0); bk.scale.setScalar(1.3);
    const mg = new THREE.Group(); const ring = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.03, 8, 24), new THREE.MeshToonMaterial({ color: '#c9a14a' })); mg.add(ring); const gl = cyl(0.18, 0.18, 0.01, '#bfe0f6', 0, 0, 0, 20); gl.rotation.x = Math.PI / 2; mg.add(gl); mg.add(cyl(0.025, 0.025, 0.35, '#5a3a22', 0, -0.36, 0, 8)); outline(mg, { px: 2 }); by.hand.R.add(mg); mg.position.set(0, 0.42, 0.05);
    return { ...s, by }; },
  draw(s, t, info) { const k = ease.out(prog(t, 0, 0.3));
    s.by.pose(addPose(mixPose(POSE.stand, { ...POSE.stand, armL: [0.75, 0.3, 0.4], elbowL: 1.3, armR: [1.3, 0.1, -0.3 + Math.sin(t * 6) * 0.25], elbowR: 1.0, headNod: 0.2, headTurn: Math.sin(t * 6) * 0.15 }, k), {}));
    s.by.face({ ...EXPR.suspicious, pupil: [Math.sin(t * 6) * 0.5, -0.4] }, t);
    camMove(s.stage, t, [[0, { pos: [0.3, 2.3, 7.2], look: [0, 1.9, 1.5], fov: 32 }], [info.dur, { pos: [0.3, 2.2, 6.3], look: [0, 1.9, 1.5], fov: 31 }]]); },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'question', on: 'by', at: 0.5 }]); },
});

// ---- s07: "...about bears." the rulebook page: Dogs: NO. Bears: (nothing). A lightbulb idea.
registerShot('s07', { kind: '3d',
  init(T) { const s = studyStage(T, { fov: 32, target: [0, 1, 1.5] }); return s; },
  draw(s, t, info) { camMove(s.stage, t, [[0, { pos: [0.3, 2.3, 7.2], look: [0, 1.9, 1.5], fov: 32 }], [info.dur, { pos: [0.3, 2.3, 7.0], look: [0, 1.9, 1.5], fov: 32 }]]); },
  overlay(g, t, info, s) {
    g.save(); g.fillStyle = 'rgba(20,12,10,.55)'; g.fillRect(0, 0, E.W, E.H); g.restore();
    const tb = at(info, 'bears', 0.3);
    paperCard(g, t, { title: 'COLLEGE RULES', y: 880, h: 820, top: 250, gap: 140, lines: [
      { text: 'Dogs: NO.', color: '#c8281e', size: 78 }, { text: 'Cats: no.', size: 58, color: '#6a5a4a' }, { text: 'Bears: ........', at: tb - 0.05, size: 78, color: '#2a4a8a' } ] });
    if (t > tb + 0.25) aside(g, t, '(nothing!)', { at: tb + 0.25, y: 1430, size: 82, color: '#ffd25a' });
  },
});

// ---- s08: "So he got a tame bear." Byron proudly presents the bear in his doorway; it waves. TAME badge.
registerShot('s08', { kind: '3d',
  init(T) { const s = studyStage(T, { fov: 36, target: [0, 1, 1.2] }); const by = byron(); by.position.set(-1.3, 0, 1.6); by.rotation.y = 0.3; s.stage.add(by);
    const b = bear({ gown: false, cap: false }); b.position.set(1.0, 0, 1.0); b.rotation.y = -0.2; s.stage.add(b); return { ...s, by, b }; },
  draw(s, t, info) { const k = ease.outBack(prog(t, 0.05, 0.4));
    s.by.pose(addPose(point(POSE.stand, 'L', k, { up: 0.1 }), idle(t, 2))); s.by.face(EXPR.grin, t);
    s.b.update(t, { wave: ease.out(prog(t, 0.3, 0.6)), lid: 0.25, smile: 1, headTilt: 0.15, bounce: 0.3 });
    camMove(s.stage, t, [[0, { pos: [0, 2.6, 9.4], look: [0, 1.9, 1.2], fov: 38 }], [info.dur, { pos: [0, 2.5, 8.4], look: [0, 1.95, 1.2], fov: 37 }]]); },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'hearts', on: 'b', at: 0.35 }, { fx: 'sparkle', on: 'by', at: 0.2, scale: 0.6 }]); badge(g, t, 'TAME', { at: at(info, 'tame', 0.4) - 0.05, x: 300, y: 520, w: 300, color: '#2f8a3a' }); },
});

// ---- s09: "He wrote to a friend..." Byron writes by candlelight; the bear peers over his shoulder.
registerShot('s09', { kind: '3d',
  init(T) { const s = studyStage(T, { fov: 34, target: [0, 1, 1] }); const d = desk({ w: 2.4, d: 1.1 }); d.position.set(0, 0, 1.6); s.stage.add(d);
    const ch = PR.stool({ h: 0.7 }); ch.position.set(-0.2, 0, 0.6); s.stage.add(ch);
    const by = byron(); by.position.set(-0.2, 0, 0.6); by.rotation.y = 0; s.stage.add(by);
    const q = quill(); by.hand.R.add(q); q.position.set(0, 0.05, 0.05); q.rotation.x = 0.6;
    const lp = letterPaper(); lp.position.set(-0.1, 1.07, 1.5); s.stage.add(lp); const c = candle(); c.position.set(0.8, 1.06, 1.7); s.stage.add(c);
    const b = bear({}); b.position.set(1.2, 0, -0.5); b.rotation.y = -0.4; s.stage.add(b); return { ...s, by, b, c }; },
  draw(s, t, info) {
    s.by.pose(addPose({ ...POSE.sit, armR: [1.25, 0.15, 0.2 + Math.sin(t * 9) * 0.06], elbowR: 0.9, armL: [1.0, 0.2, 0.3], elbowL: 1.0, headNod: 0.3, lean: 0.15 }, {})); s.by.face({ ...EXPR.happy, lid: 0.45, pupil: [0, -0.6] }, t);
    s.b.update(t, { lid: 0.3, look: [-0.4, -0.5], headTurn: 0.4, headTilt: Math.sin(t * 2) * 0.08 });
    s.c.flame.scale.y = 0.08 * (1 + Math.sin(t * 23) * 0.12);
    camMove(s.stage, t, [[0, { pos: [0.4, 3.0, 6.4], look: [0.1, 1.6, 1.0], fov: 38 }], [info.dur, { pos: [0.3, 2.8, 5.6], look: [0.1, 1.6, 1.0], fov: 36 }]]); },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'sparkle', on: 'b', at: 0.4, scale: 0.6 }]); },
});

// ---- s10: "...the finest in the world." the letter, in his words (Byron to Elizabeth Pigot, 1807).
registerShot('s10', { kind: '3d',
  init(T) { const s = studyStage(T, { fov: 34, target: [0, 1, 1] }); const b = bear({ cap: true, gown: true }); b.position.set(0, 0, 1.0); s.stage.add(b); return { ...s, b }; },
  draw(s, t, info) { s.b.update(t, { lid: 0.5, smile: 1, headTilt: -0.12, bounce: 0.0 });
    camMove(s.stage, t, [[0, { pos: [0, 2.8, 7.2], look: [0, 2.2, 1], fov: 34 }], [info.dur, { pos: [0, 2.8, 6.6], look: [0, 2.25, 1], fov: 33 }]]); },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'sparkle', on: 'b', at: 0.0, scale: 1.1 }]);
    paperCard(g, t, { y: 1020, h: 500, w: 900, rot: -0.04, title: 'Byron\'s letter, 1807:', titleSize: 54, top: 190, gap: 92, size: 58, lines: ['"I have got a new friend,', 'the finest in the world,', 'a tame bear."'] }); },
});

// ---- s11: "Asked what the bear was for..." two college dons in black gowns, baffled. Held beat.
registerShot('s11', { kind: '3d',
  init(T) { const s = quadStage(T, { fov: 34, shadowSize: 8, target: [0, 1, 3], fountain: false }); const a = don({ seed: 51, glasses: true }); a.position.set(-0.85, 0, 3.0); a.rotation.y = 0.25; s.stage.add(a);
    const b = don({ seed: 52, hair: 'bald', moustache: '#9a9590', skin: 'fair' }); b.position.set(0.85, 0, 2.8); b.rotation.y = -0.25; s.stage.add(b); mortarboard(a.parts.head); mortarboard(b.parts.head); return { ...s, a, b }; },
  draw(s, t, info) { s.env.update(t); const k = ease.out(prog(t, 0.1, 0.4));
    s.a.pose(addPose(shrug(POSE.stand, k), idle(t, 3))); s.a.face(mixExpr(EXPR.neutral, EXPR.worried, k), t);
    s.b.pose(addPose(mixPose(POSE.stand, POSE.thinking, k), idle(t, 5))); s.b.face(mixExpr(EXPR.neutral, EXPR.suspicious, k), t);
    camMove(s.stage, t, [[0, { pos: [0, 2.4, 9.4], look: [0, 2.0, 2.9], fov: 34 }], [info.dur, { pos: [0, 2.4, 8.4], look: [0, 2.05, 2.9], fov: 33 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); reactions(g, t, s, [{ fx: 'question', on: 'a', at: 0.3 }, { fx: 'question', on: 'b', at: 0.45 }]); },
});

// ---- s12: "...he said..." Byron, deadpan, presents the bear like a candidate; the bear straightens its mortarboard.
registerShot('s12', { kind: '3d',
  init(T) { const s = quadStage(T, { fov: 34, shadowSize: 8, target: [0, 1, 3], fountain: false }); const by = byron(); by.position.set(-1.0, 0, 3.0); by.rotation.y = 0.3; s.stage.add(by);
    const b = bear({ gown: true, cap: true }); b.position.set(0.9, 0, 2.6); b.rotation.y = -0.15; s.stage.add(b); return { ...s, by, b }; },
  draw(s, t, info) { s.env.update(t); const k = ease.outBack(prog(t, 0.0, 0.35));
    s.by.pose(addPose(point(POSE.stand, 'L', k, { up: 0.05 }), idle(t, 2))); s.by.face({ ...EXPR.deadpan, lid: 0.55 }, t);
    s.b.update(t, { lid: 0.4, smile: 1, armsUp: 0.0, brow: 0.6, headTilt: -0.05 });
    camMove(s.stage, t, [[0, { pos: [0, 2.6, 11.0], look: [0, 2.0, 2.8], fov: 36 }], [info.dur, { pos: [0, 2.6, 10.2], look: [0, 2.05, 2.8], fov: 35 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); reactions(g, t, s, [{ fx: 'sparkle', on: 'b', at: 0.25, scale: 0.7 }]); },
});

// ---- s13: PAYOFF "...it should sit for a fellowship." the bear sits at the college high table between two horrified dons,
//      with a FELLOW place card. Gloss: what a fellowship is. Hard cut back to s01 (loop).
registerShot('s13', { kind: '3d',
  init(T) { const s = studyStage(T, { fov: 38, target: [0, 1, 1] });
    const tb = desk({ w: 6.0, d: 1.3 }); tb.position.set(0, 0, 1.8); s.stage.add(tb);
    const cloth = box(6.1, 0.02, 1.4, '#f2ede2', 0, 1.07, 1.8); s.stage.add(cloth);
    const b = bear({ gown: true, cap: true }); b.position.set(0, 0, 0.9); s.stage.add(b);
    const a = don({ seed: 51, glasses: true }); a.position.set(-1.55, 0, 1.0); a.rotation.y = 0.35; s.stage.add(a); mortarboard(a.parts.head);
    const c = don({ seed: 52, hair: 'bald', moustache: '#9a9590', skin: 'fair' }); c.position.set(1.55, 0, 1.0); c.rotation.y = -0.35; s.stage.add(c); mortarboard(c.parts.head);
    for (const x of [-1.55, 0, 1.55]) { const pl = cyl(0.28, 0.24, 0.04, '#ffffff', x, 1.1, 2.2, 20); s.stage.add(pl); }
    const card = rbox(0.7, 0.32, 0.04, '#f6ecd2', 0, 1.25, 2.35, 0.02); s.stage.add(card);
    return { ...s, b, a, c }; },
  draw(s, t, info) { const k = ease.out(prog(t, 0.1, 0.35));
    s.b.update(t, { sit: 0.0, lid: 0.45, smile: 1, headTilt: 0.06, bounce: 0 });
    s.b.position.y = -0.25;
    for (const [d, sd] of [[s.a, 1], [s.c, 2]]) { d.pose(addPose(mixPose(POSE.stand, { ...POSE.panic, lean: -0.15 }, k), { headTurn: sd === 1 ? 0.5 : -0.5 })); d.face(mixExpr(EXPR.neutral, EXPR.shocked, k), t); }
    camMove(s.stage, t, [[0, { pos: [0, 2.8, 10.6], look: [0, 2.0, 1.2], fov: 42 }], [info.dur, { pos: [0, 2.7, 9.8], look: [0, 2.05, 1.2], fov: 41 }]]); },
  overlay(g, t, info, s) {
    const tf = at(info, 'fellowship', 0.3);
    reactions(g, t, s, [{ fx: 'sparkle', on: 'b', at: Math.max(0, tf - 0.1) }]);
    badge(g, t, 'FELLOW', { at: tf - 0.05, x: E.W / 2, y: 470, w: 520, size: 104, color: '#7a2a1e', rot: -0.06 });
    aside(g, t, '(a fellow = a college teacher)', { at: tf + 0.25, y: 640, size: 52, maxW: E.W * 0.86 });
  },
});
