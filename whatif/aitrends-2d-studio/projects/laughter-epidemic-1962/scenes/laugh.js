// The Laughter Epidemic of 1962 — 18 shots, Toon 3D + BEANMEN effects. WTF that it SPREAD; distress shown honestly
// (laughing with worried brows and tears, crying, a friend comforting, a doctor). Nobody is mocked.
import { registerShot } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { point } from '/kits/toon3d/rig.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { drawInsert, dimScene } from '/kits/toon3d/insert.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import {
  at, THREE, toonStage, student, teacher, villager, doctor, LAUGH, LAUGH_CRY, laughPose, SIT, HOLD_BELLY,
  classroom, schoolBlock, schoolYard, dorm, village, suitcase, hookWords, stamp, calendar, clock, lakeMap,
  EXPR, POSE, addPose, mixExpr, mixPose, idle, clamp, lerp, ease, prog, insT, CARD_INK, rbox, cyl,
} from './_lib.js';

const RAYS = { rays: { from: [-70, -60], strength: 0.6 }, tint: '#ffd49a' };
const soft = { rays: { from: [-70, -60], strength: 0.4 }, tint: '#ffe0b0' };
const HOOK = [[['nobody', '#ffd25a'], ['could', '#ffffff']], [['stop', '#ff4a3a'], ['it', '#ffffff']]];
const HOOK_END = 3.5;   // global seconds: the top caption is held 0 - 3.5 s, across the first cut

// ---------------------------------------------------------------- the classroom (s01 frame 1, s04-s06, s18 payoff/loop)
function classSet(T, o = {}) {
  const st = toonStage(T, { light: 'warm', fov: 46, shadowSize: 10, target: [0, 1, 0], exposure: 1.05 });
  const set = classroom(st, { rows: o.rows || 3, cols: 3 });
  const kids = set.seats.map(([x, z], i) => { const s = student(i); s.position.set(x, 0.02, z); st.add(s); return s; });
  const tch = teacher(); tch.position.set(-1.4, 0, 3.3); tch.rotation.y = 1.25; st.add(tch);
  const chalk = cyl(0.045, 0.045, 0.26, '#fbfaf2', 0, 0, 0, 8); st.add(chalk);
  return { stage: st, set, kids, tch, chalk };
}
const TRIO = [3, 2, 4];   // the three girls in the front row (seat indices: row 0 = 0..5)
const HERO0 = { pos: [0.2, 3.0, 8.6], look: [-0.7, 1.9, 0.6], fov: 50 }, HERO1 = { pos: [0.0, 2.8, 7.6], look: [-0.6, 1.95, 0.7], fov: 48 };
// draw the class: laugh(i) -> 0..1 per kid, look(i) -> headTurn for non-laughers
function drawClass(s, t, o) {
  s.kids.forEach((k, i) => { const L = o.laugh ? o.laugh(i) : 0;
    const base = L > 0.5 ? mixPose(SIT, HOLD_BELLY, (Math.sin(t * 1.3 + i) + 1) / 2 * 0.7) : SIT;
    k.pose(laughPose(addPose(base, { ...idle(t, i + 2, 0.3), headTurn: (1 - L) * (o.look ? o.look(i) : 0) }), t, L, i + 1));
    const calm = o.calm ? o.calm(i) : (L > 0 ? EXPR.worried : EXPR.neutral);
    k.face(L > 0 ? mixExpr(calm, o.cry && o.cry(i) ? LAUGH_CRY : LAUGH, clamp(L * 1.6)) : calm, t);
    k.tears(o.cry ? o.cry(i) : 0, t); k.laughMouth(L, t + i); });
}
function drawTeacher(s, t, o) {
  const raise = o.raise ?? 1;
  s.tch.pose(addPose(point(POSE.stand, 'R', raise, { up: 0.7 }), { ...idle(t, 4, 0.3), headTurn: o.headTurn ?? -0.5 }));
  s.tch.face(o.face || EXPR.shocked, t); s.tch.tears(0, t);
  const hp = new THREE.Vector3(); s.tch.hand.R.getWorldPosition(hp);
  if (o.drop == null || t < o.drop) { s.chalk.position.copy(hp); s.chalk.rotation.set(0.3, 0, 0.6); }
  else { const d = t - o.drop, y0 = hp.y; const y = Math.max(0.04, y0 - 4.9 * d * d * 1.4); s.chalk.position.set(hp.x + d * 0.3, y, hp.z + d * 0.25); s.chalk.rotation.set(0.3 + d * 9, 0, y <= 0.05 ? Math.PI / 2 : 0.6 + d * 7); }
}

// s01 — HOOK. "In 1962, laughing shut down 14 schools." Three girls in the front row are laughing and can't stop; the teacher
// freezes mid-sentence, chalk raised, and the chalk drops. Already moving at frame 1.
registerShot('s01', { kind: '3d',
  init(T) { return classSet(T); },
  draw(s, t, info) {
    drawClass(s, t, { laugh: i => (TRIO.includes(i) ? clamp(0.75 + t * 0.4) : 0), look: i => (i < 2 ? -0.7 : i === 5 ? 0.7 : (i >= 6 ? (i % 2 ? 0.4 : -0.4) : 0)), calm: i => (i >= 6 || i < 2 || i === 5 ? EXPR.shocked : EXPR.worried), cry: i => (i === 2 ? clamp(t - 0.8) : 0) });
    drawTeacher(s, t, { drop: 0.45, face: EXPR.shocked, headTurn: -0.75 });
    const cut = at(info, '14', 2.3) - 0.08;   // hard punch-in on "14 schools"
    if (t < cut) camMove(s.stage, t, [[0, HERO0], [cut, HERO1]], ease.out);
    else camMove(s.stage, t - cut, [[0, { pos: [0.5, 2.5, 5.6], look: [0.3, 1.95, 1.0], fov: 42 }], [info.dur - cut, { pos: [0.5, 2.45, 5.2], look: [0.3, 1.95, 1.0], fov: 41 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, RAYS);
    hookWords(g, t, HOOK, { y: 270, size: 92 });
    reactions(g, t, s, [{ fx: 'exclaim', on: s.tch, at: 0.3, color: '#ff3b30' }]);
    stamp(g, t, '1962', { at: 0.05, x: 880, y: 560, size: 64, color: '#e23b2e', fill: 'rgba(250,244,226,0.92)', rot: 0.1 });
  },
});

// s02 — "January thirtieth. A girls' boarding school" The school: whitewashed block, tin roof, red earth; calendar page.
function yardSet(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: 44, shadowSize: 16, target: [0, 1, 0] });
  const env = schoolYard(st, { seed: 3 });
  const sch = schoolBlock(); sch.position.set(0, 0, -6); st.add(sch);
  const girls = [0, 1, 2, 3].map(i => { const g = student(i + (o.seed || 0)); st.add(g); return g; });
  return { stage: st, env, sch, girls };
}
registerShot('s02', { kind: '3d',
  init(T) { return yardSet(T); },
  draw(s, t, info) {
    s.env.update(t);
    s.girls.forEach((g, i) => { const x = -4 + i * 1.3 + t * 0.9, z = -1.2 + (i % 2) * 0.6; g.position.set(x, 0, z); g.rotation.y = Math.PI / 2;
      g.pose(addPose(mixPose(POSE.stand, { ...POSE.stand, legL: [0.35 * Math.sin(t * 8 + i), 0.04], legR: [-0.35 * Math.sin(t * 8 + i), 0.04], armL: [-0.3 * Math.sin(t * 8 + i), 0.12, 0], armR: [0.3 * Math.sin(t * 8 + i), 0.12, 0] }, 1), { bob: Math.abs(Math.sin(t * 8 + i)) * 0.04 }));
      g.face(EXPR.happy, t); g.tears(0, t); });
    camMove(s.stage, t, [[0, { pos: [0, 3.2, 15], look: [0, 2.6, -4], fov: 46 }], [info.dur, { pos: [0, 2.9, 12.5], look: [0, 2.5, -4], fov: 46 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, RAYS);
    hookWords(g, t + info.shot.start, HOOK, { y: 270, size: 92, until: HOOK_END });
    const out = at(info, 'boarding', 1.2) - 0.1;
    if (t < out + 0.3) { g.save(); const fly = clamp((t - out) / 0.3); g.translate(fly * 900, -fly * 200); g.rotate(fly * 0.5); calendar(g, t, { at: 0.05, y: 820, scale: 0.9 }); g.restore(); }
  },
});

// s03 — "in Kashasha, in what is now Tanzania." Parchment map: the western shore of Lake Victoria, a pin.
registerShot('s03', { kind: '3d',
  init(T) { return yardSet(T, { seed: 2 }); },
  draw(s, t, info) {
    s.env.update(t); s.girls.forEach(g => { g.visible = false; });
    camMove(s.stage, t, [[0, { pos: [0, 2.6, 11], look: [0, 2.4, -4], fov: 46 }], [info.dur, { pos: [0, 2.6, 10], look: [0, 2.4, -4], fov: 46 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, soft); dimScene(g, 7, 0.45);
    lakeMap(g, t, { at: 0, y: 900, now: at(info, 'Tanzania.', 1.2) - 0.1, pins: [{ x: -40, y: 80, label: 'KASHASHA', at: at(info, 'Kashasha,', 0.2) - 0.1, lx: -150, ly: 40 }] });
  },
});

// s04 — "Three students started laughing..." Medium on the front row: one giggles, then two more. Neighbours puzzled.
registerShot('s04', { kind: '3d',
  init(T) { return classSet(T); },
  draw(s, t, info) {
    const t1 = at(info, 'started', 0.4), t2 = at(info, 'laughing...', 0.9);
    const st = { 3: t1 - 0.1, 2: t2 - 0.1, 4: t2 + 0.25 };
    drawClass(s, t, { laugh: i => (st[i] != null ? clamp((t - st[i]) / 0.5) * 0.8 : 0), look: i => (i === 1 ? -0.6 : i === 5 ? 0.6 : 0), calm: i => (st[i] != null ? EXPR.happy : EXPR.suspicious) });
    drawTeacher(s, t, { raise: 0.2, face: EXPR.neutral, headTurn: 0 }); s.tch.visible = false; s.chalk.visible = false;
    camMove(s.stage, t, [[0, { pos: [0.6, 2.4, 5.6], look: [0.6, 1.95, 1.0], fov: 40 }], [info.dur, { pos: [0.6, 2.35, 5.0], look: [0.6, 1.95, 1.0], fov: 40 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, soft);
    const t2 = at(info, 'laughing...', 0.9);
    stamp(g, t, '3 GIRLS', { at: at(info, 'Three', 0.1), x: 540, y: 400, size: 72, color: '#ffffff', fill: '#b8322a', rot: -0.05 });
    reactions(g, t, s, [{ fx: 'question', on: s.kids[1], at: t2, scale: 0.7 }, { fx: 'question', on: s.kids[5], at: t2 + 0.2, scale: 0.7 }]);
  },
});

// s05 — "and couldn't stop." Punch-in: the middle girl laughing with tears, brows up, she can't stop; the teacher behind, worried.
registerShot('s05', { kind: '3d',
  init(T) { return classSet(T); },
  draw(s, t, info) {
    drawClass(s, t, { laugh: i => (TRIO.includes(i) ? 1 : 0), look: i => (i === 1 ? -0.6 : 0), calm: () => EXPR.worried, cry: i => (TRIO.includes(i) ? clamp(t / 0.6) : 0) });
    s.tch.position.set(-1.6, 0, -0.2); s.tch.rotation.y = 0.4;
    drawTeacher(s, t, { raise: 0, face: EXPR.worried, headTurn: 0.3 }); s.chalk.visible = false;
    camMove(s.stage, t, [[0, { pos: [0.3, 2.1, 4.6], look: [0.3, 1.85, 1.0], fov: 38 }], [info.dur, { pos: [0.3, 2.1, 4.2], look: [0.3, 1.85, 1.0], fov: 37 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: 0, amp: 0.02, dur: 0.4 }]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#ffd0a0', tintAmount: 0.18 });
    reactions(g, t, s, [{ fx: 'sweat', on: s.tch, at: 0.3 }]);
  },
});

// s06 — "It spread to 95 of the school's 159 students." Wide, high: the laughing spreads row by row; 95 / 159.
registerShot('s06', { kind: '3d',
  init(T) { return classSet(T, { rows: 4 }); },
  draw(s, t, info) {
    const go = at(info, 'spread', 0.3);
    drawClass(s, t, { laugh: i => { const r = Math.floor(i / 6), c = i % 6; const d = r * 0.45 + Math.abs(c - 2.5) * 0.15; return (i % 5 === 4) ? 0 : clamp((t - go - d) / 0.4); },
      look: i => (i % 2 ? 0.5 : -0.5), calm: () => EXPR.worried, cry: i => (i % 3 === 0 ? clamp(t - go - 1) : 0) });
    s.tch.position.set(-3.6, 0, 2.6); s.tch.rotation.y = 2.0;
    drawTeacher(s, t, { raise: 0, face: EXPR.panic, headTurn: -0.2 }); s.chalk.visible = false;
    camMove(s.stage, t, [[0, { pos: [0.4, 7.2, 10.5], look: [0.0, 1.4, -1.6], fov: 50 }], [info.dur, { pos: [0.4, 6.6, 9.4], look: [0.0, 1.4, -1.6], fov: 50 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, soft);
    const n0 = at(info, '95', 0.6) - 0.1, d0 = at(info, '159', 1.4);
    if (t > n0) { const k = ease.outBack(clamp((t - n0) / 0.3)), v = Math.round(3 + 92 * ease.out(clamp((t - n0) / 0.7)));
      g.save(); g.translate(540, 420); g.scale(k, k); insT(g, String(v), 0, 0, 220, { color: '#ffd25a', stroke: CARD_INK }); g.restore();
      if (t > d0) insT(g, 'OF 159 STUDENTS', 540, 570, 70, { color: '#ffffff', stroke: CARD_INK, a: clamp((t - d0) / 0.2) }); }
  },
});

// s07 — "Some attacks lasted hours. Some lasted days." Dormitory: a girl on her bed laughing and crying; a friend holds her shoulder.
function dormSet(T) {
  const st = toonStage(T, { light: 'warm', fov: 40, shadowSize: 8, target: [0, 1, -2] });
  const set = dorm(st);
  const a = student(2); a.position.set(-0.55, 0.25, -1.5); st.add(a);
  const b = student(5); b.position.set(0.6, 0.25, -1.2); b.rotation.y = -0.6; st.add(b);
  return { stage: st, set, a, b };
}
function drawDorm(s, t, o = {}) {
  s.a.pose(laughPose(addPose(HOLD_BELLY, idle(t, 3, 0.3)), t, o.laugh ?? 0.8, 3)); s.a.face(mixExpr(EXPR.sad, LAUGH_CRY, o.laugh ?? 0.8), t); s.a.tears(o.tears ?? 1, t); s.a.laughMouth(o.laugh ?? 0.8, t); s.b.laughMouth(0, t);
  s.b.pose(addPose({ ...POSE.sit, armR: [1.0, -0.35, 0.2], elbowR: 0.5 }, idle(t, 5, 0.3))); s.b.face(EXPR.worried, t); s.b.tears(0, t);
}
registerShot('s07', { kind: '3d',
  init(T) { return dormSet(T); },
  draw(s, t, info) {
    drawDorm(s, t);
    camMove(s.stage, t, [[0, { pos: [0.3, 2.4, 4.6], look: [0.1, 1.9, -1.3], fov: 40 }], [info.dur, { pos: [0.2, 2.3, 3.9], look: [0.1, 1.9, -1.3], fov: 40 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#ffd8a8', tintAmount: 0.15 });
    clock(g, t, { at: 0.05, x: 840, y: 430, r: 130, speed: 10 });
    const h = at(info, 'hours.', 0.9) - 0.1, d = at(info, 'days.', 2.0) - 0.1;
    stamp(g, t, 'HOURS', { at: h, until: d, x: 330, y: 430, size: 80, color: '#ffffff', fill: '#b8322a', rot: -0.08 });
    stamp(g, t, 'UP TO 16 DAYS', { at: d, x: 400, y: 430, size: 66, color: '#ffffff', fill: '#b8322a', rot: -0.06 });
  },
});

// s08 — "In March, the school had to close." Girls walk out with suitcases; CLOSED stamp; MARCH 18, 1962.
registerShot('s08', { kind: '3d',
  init(T) { const s = yardSet(T, { seed: 1 }); s.cases = s.girls.map((g, i) => { const c = suitcase(['#7a4a2a', '#2f5f8f', '#8a3a2a', '#5a6a3a'][i]); s.stage.add(c); return c; }); return s; },
  draw(s, t, info) {
    s.env.update(t);
    s.girls.forEach((g, i) => { const z = 1.0 + t * 0.9 - i * 0.9, x = (i - 1.5) * 1.2; g.position.set(x, 0, z); g.rotation.y = 0;
      const w = Math.sin(t * 7 + i * 1.3); g.pose(addPose(POSE.stand, { legL: [0.35 * w, 0.04], legR: [-0.35 * w, 0.04], armL: [-0.3 * w, 0.12, 0], armR: [0.05, 0.28, 0], elbowR: 0.1, bob: Math.abs(w) * 0.04, headNod: 0.15 }));
      g.face(EXPR.sad, t); g.tears(0, t); const hp = new THREE.Vector3(); g.hand.R.getWorldPosition(hp); s.cases[i].position.set(hp.x - 0.05, hp.y - 0.25, hp.z); });
    camMove(s.stage, t, [[0, { pos: [0, 3.0, 12], look: [0, 2.2, -2], fov: 46 }], [info.dur, { pos: [0, 3.2, 13], look: [0, 2.4, -2], fov: 46 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#d8c8b0', tintAmount: 0.2 });
    stamp(g, t, 'MARCH 1962', { at: at(info, 'March,', 0.3) - 0.05, x: 540, y: 330, size: 66, color: '#e23b2e', fill: 'rgba(250,244,226,0.92)', rot: -0.06 });
    stamp(g, t, 'CLOSED', { at: at(info, 'close.', 1.3) - 0.1, x: 540, y: 760, size: 150, color: '#d8342c', rot: -0.16 });
  },
});

// s09 — "But it didn't stop there..." The red dirt road: two girls with suitcases walk away; one stops and looks back at us.
registerShot('s09', { kind: '3d',
  init(T) { const s = yardSet(T, { seed: 4 }); s.sch.visible = false; s.cases = s.girls.map((g, i) => { const c = suitcase(i % 2 ? '#2f5f8f' : '#7a4a2a'); s.stage.add(c); return c; }); return s; },
  draw(s, t, info) {
    s.env.update(t);
    const stop = at(info, 'stop', 0.9);
    s.girls.forEach((g, i) => { g.visible = i < 2; if (!g.visible) { s.cases[i].visible = false; return; }
      const walking = i === 1 || t < stop; const zt = i === 1 ? t : Math.min(t, stop);
      g.position.set((i - 0.5) * 1.4, 0, 2 - zt * 1.0); g.rotation.y = Math.PI;
      const w = walking ? Math.sin(t * 7 + i * 1.3) : 0; const back = i === 0 ? ease.inOut(prog(t, stop, stop + 0.5)) : 0;
      g.pose(addPose(POSE.stand, { legL: [0.35 * w, 0.04], legR: [-0.35 * w, 0.04], armL: [-0.3 * w, 0.12, 0], armR: [0.05, 0.28, 0], elbowR: 0.1, bob: Math.abs(w) * 0.04, twist: back * 0.6, headTurn: back * 1.1 }));
      g.face(mixExpr(EXPR.sad, EXPR.worried, back), t); g.tears(0, t); const hp = new THREE.Vector3(); g.hand.R.getWorldPosition(hp); s.cases[i].position.set(hp.x, hp.y - 0.25, hp.z); });
    camMove(s.stage, t, [[0, { pos: [0, 2.6, 9.5], look: [0, 1.8, -2], fov: 44 }], [info.dur, { pos: [0, 2.3, 7.8], look: [0, 1.9, -2], fov: 42 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#c8a888', tintAmount: 0.25 });
  },
});

// s10 — "It spread to a village where several of the girls lived." Round huts; a girl home with her suitcase; family greets her.
function villageSet(T, n = 5) {
  const st = toonStage(T, { light: 'sunny', fov: 44, shadowSize: 14, target: [0, 1, -2] });
  const env = village(st, { seed: 4 });
  const vs = []; for (let i = 0; i < n; i++) { const v = villager(i); st.add(v); vs.push(v); }
  return { stage: st, env, vs };
}
registerShot('s10', { kind: '3d',
  init(T) { const s = villageSet(T, 3); s.girl = student(1); s.stage.add(s.girl); s.case = suitcase(); s.stage.add(s.case); return s; },
  draw(s, t, info) {
    s.env.update(t);
    const w = Math.sin(t * 7); s.girl.position.set(1.4 - t * 0.5, 0, 0.8); s.girl.rotation.y = -1.3;
    s.girl.pose(addPose(POSE.stand, { legL: [0.3 * w, 0.04], legR: [-0.3 * w, 0.04], armR: [0.05, 0.28, 0], bob: Math.abs(w) * 0.04 })); s.girl.face(EXPR.happy, t); s.girl.tears(0, t);
    const hp = new THREE.Vector3(); s.girl.hand.R.getWorldPosition(hp); s.case.position.set(hp.x, hp.y - 0.25, hp.z);
    [[-1.6, -0.2, 1.1], [-2.6, -1.4, 0.8], [0.2, -2.6, 0.2]].forEach(([x, z, ry], i) => { const v = s.vs[i]; v.position.set(x, 0, z); v.rotation.y = ry;
      v.pose(addPose(i === 0 ? { ...POSE.stand, armL: [0.9, 0.5, 0], armR: [0.9, 0.5, 0], elbowL: 0.4, elbowR: 0.4 } : POSE.relaxed, idle(t, i + 3, 0.5))); v.face(EXPR.happy, t); v.tears(0, t); });
    camMove(s.stage, t, [[0, { pos: [0.6, 3.0, 9.5], look: [-0.4, 2.0, -2], fov: 46 }], [info.dur, { pos: [0.4, 2.8, 8.4], look: [-0.4, 2.0, -2], fov: 46 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, RAYS);
    stamp(g, t, 'HER HOME VILLAGE', { at: at(info, 'village', 0.8) - 0.1, x: 540, y: 330, size: 60, color: '#ffffff', fill: '#2f6a3a', rot: -0.05 });
  },
});

// s11 — "217 people were affected." The village: young villagers laughing and crying; an elder comforts one. Counter 217.
registerShot('s11', { kind: '3d',
  init(T) { return villageSet(T, 6); },
  draw(s, t, info) {
    s.env.update(t);
    const P = [[-2.2, 0.4, 0.4], [-0.7, -0.6, 0.1], [0.8, 0.3, -0.2], [2.2, -0.5, -0.4], [-1.5, -2.4, 0.2], [1.6, -2.6, -0.2]];
    s.vs.forEach((v, i) => { const [x, z, ry] = P[i]; v.position.set(x, 0, z); v.rotation.y = ry; const L = i === 4 ? 0 : clamp((t - i * 0.12) / 0.4);
      v.pose(laughPose(addPose(i === 4 ? { ...POSE.stand, armR: [1.1, -0.2, 0], elbowR: 0.3 } : mixPose(POSE.stand, POSE.facepalm, i % 2 ? 0.5 : 0), idle(t, i + 1, 0.4)), t, L, i + 2));
      v.face(i === 4 ? EXPR.worried : mixExpr(EXPR.worried, i % 2 ? LAUGH_CRY : LAUGH, L), t); v.tears(i % 2 && i !== 4 ? L : 0, t); v.laughMouth(L, t + i); });
    camMove(s.stage, t, [[0, { pos: [0, 3.1, 8.6], look: [0, 1.9, -1], fov: 46 }], [info.dur, { pos: [0, 3.0, 7.6], look: [0, 1.9, -1], fov: 46 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, soft);
    const n0 = at(info, '217', 0.1) - 0.1;
    if (t > n0) { const k = ease.outBack(clamp((t - n0) / 0.3)), v = Math.round(217 * ease.out(clamp((t - n0) / 0.8)));
      g.save(); g.translate(540, 400); g.scale(k, k); insT(g, String(v), 0, 0, 220, { color: '#ffd25a', stroke: CARD_INK }); insT(g, 'PEOPLE', 0, 150, 70, { color: '#ffffff', stroke: CARD_INK }); g.restore(); }
  },
});

// s12 — "Then more villages. More schools." The map again: red markers pop up around the lake shore.
registerShot('s12', { kind: '3d',
  init(T) { const s = villageSet(T, 0); return s; },
  draw(s, t, info) { s.env.update(t); camMove(s.stage, t, [[0, { pos: [0, 3, 9], look: [0, 2.4, -3], fov: 46 }], [info.dur, { pos: [0, 3, 8.4], look: [0, 2.4, -3], fov: 46 }]]); },
  overlay(g, t, info, s) {
    sunnyLook(g, t, soft); dimScene(g, 7, 0.45);
    const v = at(info, 'villages.', 0.5) - 0.3, sc = at(info, 'schools.', 1.2) - 0.3;
    const dots = [[-40, 80, 0], [-260, 60, v], [-180, 220, v + 0.15], [-320, -120, v + 0.3], [-120, -160, sc], [-240, 380, sc + 0.12], [-60, 330, sc + 0.24], [-380, 230, sc + 0.36]];
    lakeMap(g, t, { at: 0, y: 900, country: 'TANGANYIKA', dots, title: '1962 - 1963' });
  },
});

// s13 — "About 1,000 people in total. 14 schools shut down." Big numbers over the dimmed school.
registerShot('s13', { kind: '3d',
  init(T) { const s = yardSet(T, { seed: 5 }); s.girls.forEach(g => { g.visible = false; }); return s; },
  draw(s, t, info) { s.env.update(t); camMove(s.stage, t, [[0, { pos: [0, 3.0, 13], look: [0, 2.4, -5], fov: 46 }], [info.dur, { pos: [0, 3.0, 11.5], look: [0, 2.4, -5], fov: 46 }]]); },
  overlay(g, t, info, s) {
    sunnyLook(g, t, soft);
    const c0 = at(info, '1,000', 0.4) - 0.2, s0 = at(info, '14', 1.6) - 0.15;
    dimScene(g, 6, 0.5);
    if (t < s0) drawInsert(g, { type: 'counter', title: 'ABOUT', value: 1000, from: 0, lines: ['PEOPLE'], color: '#ffd25a' }, t - c0);
    else drawInsert(g, { type: 'bigtext', title: '14 SCHOOLS', lines: ['SHUT DOWN'], size: 150, color: '#ff5a4a' }, t - s0);
  },
});

// s14 — "It wasn't funny." Close: a girl laughing with tears running, eyes pleading; her friend's hand on her shoulder. Cool tint.
registerShot('s14', { kind: '3d',
  init(T) { return dormSet(T); },
  draw(s, t, info) {
    drawDorm(s, t, { laugh: 0.3, tears: 1 }); s.a.face(mixExpr(EXPR.sad, LAUGH_CRY, 0.2), t);
    camMove(s.stage, t, [[0, { pos: [-0.5, 2.2, 2.4], look: [-0.5, 2.0, -1.5], fov: 34 }], [info.dur, { pos: [-0.5, 2.15, 2.0], look: [-0.5, 2.0, -1.5], fov: 33 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: false, tint: '#a8b8d0', tintAmount: 0.22 }); },
});

// s15 — "The laughing came with crying, fainting and pain." A checklist over the dimmed dorm.
registerShot('s15', { kind: '3d',
  init(T) { return dormSet(T); },
  draw(s, t, info) { drawDorm(s, t, { laugh: 0.4, tears: 1 }); camMove(s.stage, t, [[0, { pos: [0.3, 2.4, 4.6], look: [0.1, 1.9, -1.3], fov: 40 }], [info.dur, { pos: [0.3, 2.4, 4.2], look: [0.1, 1.9, -1.3], fov: 40 }]]); },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#a8b8d0', tintAmount: 0.2 }); dimScene(g, 8, 0.5);
    const words = [['laughing', 'LAUGHING'], ['crying,', 'CRYING'], ['fainting', 'FAINTING'], ['pain.', 'PAIN']];
    const k = ease.outBack(clamp(t / 0.35));
    g.save(); g.translate(540, 820); g.scale(k, k); g.fillStyle = '#fbfaf4'; g.strokeStyle = CARD_INK; g.lineWidth = 9; g.beginPath(); g.roundRect(-400, -420, 800, 840, 26); g.fill(); g.stroke();
    insT(g, 'SYMPTOMS', 0, -330, 64, { color: CARD_INK });
    words.forEach(([w, L], i) => { const a = clamp((t - (at(info, w, 0.3 + i * 0.4) - 0.15)) / 0.2); if (a <= 0) return; const y = -180 + i * 150;
      g.save(); g.globalAlpha = a; g.fillStyle = i === 0 ? '#ffd25a' : '#ff8a7a'; g.beginPath(); g.arc(-280, y, 30, 0, 7); g.fill(); g.lineWidth = 5; g.stroke();
      insT(g, L, -210, y, 64, { color: CARD_INK, align: 'left', maxW: 560 }); g.restore(); });
    g.restore();
  },
});

// s16 — "Doctors called it mass hysteria." A doctor with a clipboard beside a girl resting on a bed; stamp.
registerShot('s16', { kind: '3d',
  init(T) { const s = dormSet(T); s.doc = doctor(); s.doc.position.set(1.7, 0, -0.3); s.doc.rotation.y = -0.7; s.stage.add(s.doc); s.board = rbox(0.45, 0.6, 0.04, '#c9a46a', 0, 0, 0, 0.02); s.stage.add(s.board); s.b.visible = false; return s; },
  draw(s, t, info) {
    s.a.pose(addPose({ ...POSE.sit, armL: [0.4, 0.2, 0.4], armR: [0.4, 0.2, 0.4], elbowL: 0.6, elbowR: 0.6 }, idle(t, 2, 0.3))); s.a.face(EXPR.sad, t); s.a.tears(0.5, t);
    s.doc.pose(addPose(POSE.holdFront, { ...idle(t, 6, 0.3), headNod: 0.25 })); s.doc.face(mixExpr(EXPR.neutral, EXPR.worried, 0.5), t);
    const hp = new THREE.Vector3(); s.doc.hand.R.getWorldPosition(hp); s.board.position.set(hp.x - 0.2, hp.y + 0.1, hp.z + 0.1); s.board.rotation.set(-0.6, -0.7, 0);
    camMove(s.stage, t, [[0, { pos: [0.8, 2.6, 5.4], look: [0.7, 2.0, -1.0], fov: 42 }], [info.dur, { pos: [0.8, 2.5, 4.8], look: [0.7, 2.0, -1.0], fov: 41 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#c9d0da', tintAmount: 0.18 });
    const m = at(info, 'mass', 1.0) - 0.1;
    stamp(g, t, 'MASS HYSTERIA', { at: m, x: 540, y: 380, size: 84, color: '#ffffff', fill: '#2f5f8f', rot: -0.06 });
    if (t > m + 0.4) insT(g, '(mass psychogenic illness)', 540, 520, 56, { color: '#ffffff', stroke: CARD_INK, a: clamp((t - m - 0.4) / 0.25) });
  },
});

// s17 — "It took about 18 months" Calendar pages flip from Jan 1962 to Jul 1963.
const MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
registerShot('s17', { kind: '3d',
  init(T) { const s = yardSet(T, { seed: 6 }); s.girls.forEach(g => { g.visible = false; }); return s; },
  draw(s, t, info) { s.env.update(t); camMove(s.stage, t, [[0, { pos: [0, 3.0, 13], look: [0, 2.4, -5], fov: 46 }], [info.dur, { pos: [0, 3.0, 12], look: [0, 2.4, -5], fov: 46 }]]); },
  overlay(g, t, info, s) {
    sunnyLook(g, t, RAYS); dimScene(g, 6, 0.4);
    const n = Math.min(18, Math.floor(ease.inOut(clamp(t / Math.max(0.6, info.dur - 0.3))) * 18)), m = n % 12, y = 1962 + Math.floor(n / 12);
    calendar(g, t, { at: 0, y: 900, month: MONTHS[m].slice(0, 3) + ' ' + y, day: String(n), daySize: 260, year: n === 1 ? 'MONTH' : 'MONTHS', scale: 0.95, rot: Math.sin(n * 1.7) * 0.03 });
    stamp(g, t, '18 MONTHS', { at: at(info, '18', 0.5) + 0.2, x: 540, y: 400, size: 84, color: '#ffffff', fill: '#2f6a3a', rot: -0.05 });
  },
});

// s18 — PAYOFF "to finally fade away." The classroom again, calm: lessons go on, chalk in the teacher's raised hand. The camera
// settles into frame 1's exact framing, so the loop cuts straight into the hook.
registerShot('s18', { kind: '3d',
  init(T) { return classSet(T); },
  draw(s, t, info) {
    drawClass(s, t, { laugh: () => 0, look: () => 0, calm: i => (i % 3 ? EXPR.neutral : EXPR.happy) });
    const turn = prog(t, info.dur - 0.7, info.dur);
    drawTeacher(s, t, { raise: 1, face: mixExpr(EXPR.happy, EXPR.neutral, turn), headTurn: lerp(0.2, -0.75, ease.inOut(turn)) });
    camMove(s.stage, t, [[0, { pos: [0.6, 3.6, 10.5], look: [-0.7, 2.0, 0.6], fov: 50 }], [info.dur, HERO0]], ease.inOut);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, RAYS);
    stamp(g, t, 'IT FADED AWAY', { at: at(info, 'fade', 0.4) - 0.1, until: info.dur - 0.2, x: 540, y: 380, size: 70, color: '#ffffff', fill: '#2f6a3a', rot: -0.05 });
  },
});
