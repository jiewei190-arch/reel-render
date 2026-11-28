// Project Pigeon: 23 shots, Toon 3D. Funny + factual: the narrator is deadpan, the jokes are the visuals.
// s01 = frame 1 (three helmeted pigeons pecking their screens inside the nose cone, already moving, 2-line top caption 0-3.5 s);
// s23 ends on frame 1's exact camera + poses -> loop. Every gag is a literal picture of a sourced fact (see sources.md).
import { registerShot, ease, prog, clamp, lerp, E } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, shrug, tremble, nod } from '/kits/toon3d/rig.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { insertShot, drawInsert, dimScene } from '/kits/toon3d/insert.js';
import { softTint } from '/kits/toon3d/sky.js';
import { sunnySky } from '/kits/toon3d/sky.js';
import {
  at, THREE, toonStage, pigeon, cockpit, noseSet, missile, scientist, officialA, officialB, navy, lab, office, eBox,
  hookWords, stamp, chip, peckBursts, calendarCard, feather, moneyBag, cyl, rbox, ball, insT, CARD_INK,
} from './_lib.js';

const gt = (info, t) => info.shot.start + t;
// frame 1 framing: from the front-right, looking down the row of three cockpits (bird 3 nearest)
const F1 = { pos: [2.9, 1.95, 3.1], look: [-0.45, 0.55, -0.1], fov: 40 };
const F1b = { pos: [2.65, 1.85, 2.8], look: [-0.45, 0.55, -0.1], fov: 40 };
const TOP = (g, t, info) => hookWords(g, gt(info, t), [[['PIGEON', '#ffd25a'], ['pilots', '#ffffff']], [['steering', '#ffffff'], ['MISSILES', '#ff5a4a']]], { y: 250, sizes: [104, 88], until: 3.5 });
// all three birds peck their screens; screen crosshair drifts onto the ship
function peckAll(s, t, o = {}) {
  s.birds.forEach((b, i) => { b.update(t + i * 0.13, { peck: o.peck ?? 1, rate: o.rate || 4.2 + i * 0.3, lid: 0.3, look: [0, -0.4], ...(o.u ? o.u(i) : {}) }); });
  s.nose.cps.forEach((c, i) => c.scr.draw({ ships: [[0.5 + Math.sin(t * 0.8 + i) * 0.05, 0.5]], cross: [0.5 + Math.sin(t * 1.7 + i) * 0.08, 0.5 + Math.cos(t * 1.3 + i) * 0.06], scroll: t, lock: 0 }));
}
function noseScene(T) { const nose = noseSet(T); return { stage: nose.stage, nose, birds: nose.birds }; }

// s01 "Pigeons steering missiles:" — FRAME 1: three pigeons in flight caps peck their screens; clouds rush past the porthole
registerShot('s01', { kind: '3d',
  init(T) { return noseScene(T); },
  draw(s, t, info) { s.nose.update(t); peckAll(s, t);
    camMove(s.stage, t, [[0, F1], [info.dur, F1b]], ease.out); shakeCam(s.stage, t, [{ fx: 'shake', at: 0, amp: 0.01, dur: info.dur }]); },
  overlay(g, t, info, s) { softTint(g, '#9fffe0', 0.1); TOP(g, t, info); peckBursts(g, t, { x: 560, y: 1250, r: 260, rate: 6, size: 58 }); },
});
// s02 "a real World War 2 plan." — outside: the glide bomb sails through clouds; "WWII" chip
function skyScene(T) { const st = toonStage(T, { light: 'sunny', fov: 38, shadow: false }); const sky = sunnySky(st, { clouds: 10, seed: 4 }); const m = missile(); st.add(m); return { stage: st, sky, m }; }
registerShot('s02', { kind: '3d',
  init(T) { return skyScene(T); },
  draw(s, t, info) { s.sky.update(t * 3); s.m.position.set(Math.sin(t * 0.8) * 0.2, 8 + Math.sin(t * 1.3) * 0.15, -t * 3.0); s.m.rotation.set(-0.1, 0.15, Math.sin(t * 1.1) * 0.08);
    const p = s.m.position; camMove(s.stage, t, [[0, { pos: [p.x + 3.6, p.y + 1.2, p.z + 4.5], look: [p.x, p.y, p.z + 0.6], fov: 40 }], [info.dur, { pos: [p.x + 3.0, p.y + 1.0, p.z + 3.8], look: [p.x, p.y, p.z + 0.6], fov: 40 }]]); },
  overlay(g, t, info, s) { TOP(g, t, info); chip(g, t - at(info, 'World', 0.3), 'WORLD WAR 2', E.W / 2, 1180, { size: 60, rot: -0.04 }); },
});

// lab scene: scientist by the chalkboard; a training cockpit on the bench
function labScene(T, o = {}) {
  const st = toonStage(T, { light: 'warm', fov: 38, shadowSize: 7, target: [0, 1.2, 0] }); const set = lab(st, { boardX: -1.4, benchX: 1.3 });
  const sc = scientist(); sc.position.set(-0.7, 0, 0.2); sc.rotation.y = 0.35; st.add(sc);
  const cp = cockpit({ seed: 4, label: '' }); cp.position.set(1.3, set.benchY, -0.55); cp.rotation.y = -0.5; cp.scale.setScalar(0.8); st.add(cp);
  return { stage: st, set, sc, cp, b: cp.bird };
}
// s03 "1943. Psychologist Skinner's plan sounded like..." — the scientist proudly points at his chalk doodle (pigeon -> missile)
registerShot('s03', { kind: '3d',
  init(T) { return labScene(T); },
  draw(s, t, info) { const pt = at(info, 'plan', 1.2);
    s.sc.pose(mixPose(addPose(POSE.stand, idle(t, 2)), { ...POSE.stand, armL: [1.4, 0.35, 0], elbowL: 0.15, headTurn: 0.5 }, ease.out(prog(t, pt - 0.3, pt))));
    s.sc.face(mixExpr(EXPR.neutral, EXPR.smug, prog(t, pt - 0.2, pt + 0.2)), t);
    s.b.update(t, { peck: 0, lid: 0.35, look: [-0.5, 0.2], headTurn: -0.4 }); s.cp.scr.draw({ scroll: t });
    camMove(s.stage, t, [[0, { pos: [0.1, 2.3, 7.6], look: [0, 1.6, -1], fov: 38 }], [info.dur, { pos: [0.0, 2.2, 6.8], look: [0, 1.6, -1], fov: 38 }]]); },
  overlay(g, t, info, s) { softTint(g, '#ffd08a', 0.15); stamp(g, t, '1943', { at: 0.05, x: 270, y: 360, size: 96, fill: 'rgba(250,244,226,0.92)' });
    chip(g, t - at(info, 'Psychologist', 0.5), 'PSYCHOLOGIST', E.W / 2 - 120, 1180, { size: 50, color: '#ffffff' }); },
});
// s04 "...this." — the beat is filled by the pecking: extreme close-up of the pigeon hammering its screen
registerShot('s04', { kind: '3d',
  init(T) { const s = labScene(T); return s; },
  draw(s, t, info) { s.b.update(t, { peck: 1, rate: 6, lid: 0.25, look: [0, -0.5] }); s.cp.scr.draw({ scroll: t, cross: [0.5 + Math.sin(t * 9) * 0.04, 0.5], dots: [[0.5, 0.5, 0.6 * ((t * 6) % 1)]] });
    const hp = s.cp.localToWorld(new THREE.Vector3(0, 0.55, 0.1));
    camMove(s.stage, t, [[0, { pos: [hp.x + 2.0, hp.y + 0.55, hp.z + 1.55], look: [hp.x, hp.y - 0.05, hp.z], fov: 34 }], [info.dur, { pos: [hp.x + 1.75, hp.y + 0.48, hp.z + 1.35], look: [hp.x, hp.y - 0.05, hp.z], fov: 34 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: 0, amp: 0.012, dur: info.dur }]); },
  overlay(g, t) { peckBursts(g, t, { x: 540, y: 820, r: 300, rate: 6, size: 80 }); },
});

// s05 "Three pigeons in tiny cockpits" — the row of cockpits from the front; numbers pop 1-2-3, bird 2 salutes
registerShot('s05', { kind: '3d',
  init(T) { return noseScene(T); },
  draw(s, t, info) { s.nose.update(t); const tc = at(info, 'tiny', 0.6);
    peckAll(s, t, { peck: 0, u: i => ({ lid: 0.2, look: [0, 0.3], salute: i === 1 ? ease.outBack(prog(t, tc, tc + 0.3)) : 0 }) });
    camMove(s.stage, t, [[0, { pos: [0, 2.6, 7.2], look: [0, 0.6, 0], fov: 40 }], [info.dur, { pos: [0, 2.4, 6.6], look: [0, 0.6, 0], fov: 40 }]]); },
  overlay(g, t, info, s) { softTint(g, '#9fffe0', 0.08); const th = at(info, 'Three', 0.05);
    chip(g, t - at(info, 'cockpits', 0.9), 'TINY COCKPITS', E.W / 2, 420, { size: 64 });
    reactions(g, t, s, [{ fx: 'sparkle', on: s.birds[0], at: th }, { fx: 'sparkle', on: s.birds[1], at: th + 0.2 }, { fx: 'sparkle', on: s.birds[2], at: th + 0.4 }]); },
});
// s06 "watched a screen of the ground ahead," — over the shoulder of bird 3: its screen shows the sea and a target ship
registerShot('s06', { kind: '3d',
  init(T) { return noseScene(T); },
  draw(s, t, info) { s.nose.update(t); peckAll(s, t, { peck: 0, u: () => ({ look: [0, -0.6], lid: 0.2 }) });
    const c = s.nose.cps[2]; c.scr.draw({ ships: [[0.5, 0.48]], cross: [0.5 + Math.sin(t * 1.4) * 0.2, 0.5 + Math.cos(t * 1.1) * 0.12], scroll: t * 2 });
    camMove(s.stage, t, [[0, { pos: [3.3, 1.75, -0.75], look: [1.1, 0.5, 0.2], fov: 40 }], [info.dur, { pos: [3.1, 1.65, -0.6], look: [1.1, 0.5, 0.2], fov: 38 }]]); },
  overlay(g, t, info) { chip(g, t - at(info, 'ground', 0.6), 'LIVE VIEW: THE GROUND', E.W / 2, 1180, { size: 50, color: '#9fffe0' }); },
});
// s07 "and pecked at the target to steer." — bird 3 pecks the ship (crosshair locks), cut on "steer": the bomb banks outside
registerShot('s07', { kind: '3d',
  init(T) { return { a: noseScene(T), b: skyScene(T), render() {} }; },   // draw() renders whichever stage is live (hard cut on "steer")
  draw(s, t, info) { const sv = at(info, 'steer', 1.2) - 0.05;
    if (t < sv) { s.a.nose.update(t); peckAll(s.a, t, { rate: 5 }); s.a.nose.cps[2].scr.draw({ ships: [[0.5, 0.48]], cross: [lerp(0.7, 0.5, ease.out(prog(t, 0, 0.8))), 0.5], lock: prog(t, 0.6, 0.7), scroll: t * 2 });
      camMove(s.a.stage, t, [[0, { pos: [3.1, 1.65, -0.6], look: [1.1, 0.5, 0.2], fov: 38 }], [sv, { pos: [2.9, 1.55, -0.45], look: [1.1, 0.5, 0.2], fov: 36 }]]); s.a.stage.render(); }
    else { const k = t - sv; s.b.sky.update(t * 3); s.b.m.position.set(-k * 1.6, 8, -k * 2.5); s.b.m.rotation.set(-0.05, -0.5 * ease.out(clamp(k / 0.6)), -0.5 * ease.out(clamp(k / 0.5)));
      s.b.m.fins.forEach(f => { f.rotation.x = -0.4 * Math.sin(k * 8); });
      const p = s.b.m.position; camMove(s.b.stage, k, [[0, { pos: [3.2, 9.0, 3.8], look: [p.x, p.y, p.z], fov: 40 }], [1, { pos: [2.6, 8.8, 2.0], look: [p.x, p.y, p.z], fov: 40 }]]); s.b.stage.render(); } },
  overlay(g, t, info, s) { const sv = at(info, 'steer', 1.2) - 0.05;
    if (t < sv) { peckBursts(g, t, { x: 600, y: 900, r: 220, rate: 5, size: 66 }); if (t > 0.7) chip(g, t - 0.7, 'LOCKED ON', E.W / 2, 1180, { size: 56, color: '#7aff8a' }); }
    else chip(g, t - sv, 'PECK = STEER', E.W / 2, 1180, { size: 60 }); },
});

// shared two-target screen
const TWO = [[0.28, 0.5], [0.72, 0.5]];
// s08 "Show them two targets," — two ships on every screen; the birds look left, right, at each other: "???"
registerShot('s08', { kind: '3d',
  init(T) { return noseScene(T); },
  draw(s, t, info) { s.nose.update(t); s.birds.forEach((b, i) => b.update(t, { peck: 0, lid: 0.1, look: [Math.sin(t * 5 + i) * 0.8, -0.3], headTurn: Math.sin(t * 4 + i * 1.3) * 0.35 }));
    s.nose.cps.forEach((c, i) => c.scr.draw({ ships: TWO, cross: [0.5, 0.5], scroll: t }));
    camMove(s.stage, t, [[0, { pos: [0.1, 2.5, 6.8], look: [0, 0.6, 0], fov: 40 }], [info.dur, { pos: [0.1, 2.35, 6.3], look: [0, 0.6, 0], fov: 40 }]]); },
  overlay(g, t, info, s) { softTint(g, '#9fffe0', 0.08); chip(g, t - at(info, 'two', 0.4), '2 TARGETS?', E.W / 2, 420, { size: 64 });
    reactions(g, t, s, [{ fx: 'question', on: s.birds[0], at: 0.3 }, { fx: 'question', on: s.birds[1], at: 0.45 }, { fx: 'question', on: s.birds[2], at: 0.6 }]); },
});
// s09 "and at least two birds would agree." — birds 1+2 peck LEFT, bird 3 pecks RIGHT ... birds 1+2 slowly turn and stare at bird 3
registerShot('s09', { kind: '3d',
  init(T) { return noseScene(T); },
  draw(s, t, info) { s.nose.update(t); const ag = at(info, 'agree', 1.2); const stare = ease.inOut(prog(t, ag - 0.1, ag + 0.5));
    s.birds.forEach((b, i) => { const odd = i === 2;
      b.update(t, { peck: odd ? 1 : 1 - stare, rate: 4.5, lid: odd ? lerp(0.3, 0.1, stare) : lerp(0.3, 0.55, stare), lidAngle: odd ? 0 : 0.25 * stare,
        headTurn: odd ? -0.1 + stare * 0.3 : stare * 1.1, look: odd ? [0.3 * stare, -0.3] : [0.9 * stare, 0] }); });
    s.nose.cps.forEach((c, i) => c.scr.draw({ ships: TWO, cross: i === 2 ? TWO[1] : TWO[0], lock: 1, scroll: t }));
    camMove(s.stage, t, [[0, { pos: [0.3, 2.3, 6.4], look: [0.1, 0.65, 0], fov: 40 }], [info.dur, { pos: [0.5, 2.1, 5.6], look: [0.25, 0.65, 0], fov: 40 }]]); },
  overlay(g, t, info, s) { softTint(g, '#9fffe0', 0.08); const ag = at(info, 'agree', 1.2);
    chip(g, t - 0.15, 'LEFT', 300, 430, { size: 54, color: '#7aff8a' }); chip(g, t - 0.35, 'LEFT', 540, 430, { size: 54, color: '#7aff8a' }); chip(g, t - 0.55, 'RIGHT', 800, 430, { size: 54, color: '#ff8a7a' });
    reactions(g, t, s, [{ fx: 'sweat', on: s.birds[2], at: ag + 0.4 }]); },
});
// s10 "Majority rules." — bird 3 sheepishly switches to LEFT; "2 : 1" stamp
registerShot('s10', { kind: '3d',
  init(T) { return noseScene(T); },
  draw(s, t, info) { s.nose.update(t); const sw = ease.inOut(prog(t, 0.25, 0.6));
    s.birds.forEach((b, i) => { const odd = i === 2; b.update(t, { peck: odd ? sw : 0, rate: 4.5, lid: odd ? 0.45 : 0.55, lidAngle: odd ? -0.25 : 0.25, headTurn: odd ? -0.5 * (1 - sw) : 1.1 * (1 - sw * 0.6), look: odd ? [-0.6, -0.4] : [0.8, 0] }); });
    s.nose.cps.forEach((c, i) => c.scr.draw({ ships: TWO, cross: i === 2 && sw < 0.5 ? TWO[1] : TWO[0], lock: 1, scroll: t }));
    camMove(s.stage, t, [[0, { pos: [2.3, 1.5, 2.6], look: [0.9, 0.75, 0], fov: 38 }], [info.dur, { pos: [2.15, 1.45, 2.35], look: [0.9, 0.75, 0], fov: 38 }]]); },
  overlay(g, t, info, s) { softTint(g, '#9fffe0', 0.08); stamp(g, t, 'MAJORITY RULES', { at: at(info, 'rules', 0.5), x: E.W / 2, y: 430, size: 74, color: '#e23b2e', fill: 'rgba(250,244,226,0.92)', rot: -0.08 });
    stamp(g, t, '2 : 1', { at: at(info, 'Majority', 0.1) + 0.1, x: E.W / 2, y: 1150, size: 90, color: '#2a1c15', fill: 'rgba(255,210,90,0.95)', rot: 0.06 }); },
});

// s11 "One bird reportedly pecked more than 10,000 times in 45 minutes." — INSERT: counter over the pecking close-up
const peckClose = { init(T) { return labScene(T); }, draw(s, t) { s.b.update(t, { peck: 1, rate: 7, lid: 0.3, look: [0, -0.5] }); s.cp.scr.draw({ scroll: t });
  const hp = s.cp.localToWorld(new THREE.Vector3(0, 0.55, 0.1)); camMove(s.stage, t, [[0, { pos: [hp.x + 1.9, hp.y + 0.5, hp.z + 1.5], look: [hp.x, hp.y, hp.z], fov: 34 }], [3, { pos: [hp.x + 1.7, hp.y + 0.45, hp.z + 1.3], look: [hp.x, hp.y, hp.z], fov: 34 }]]); } };
insertShot('s11', { scene: peckClose, dim: 0.5, insert: { type: 'counter', value: 10000, from: 0, title: 'PECKS', lines: ['in 45 minutes (reportedly)'], color: '#ffd25a' } });
// s12 "Committed." — the pecking pigeon stops dead and stares into the lens. Deadpan. Then one more peck.
registerShot('s12', { kind: '3d',
  init(T) { return labScene(T); },
  draw(s, t, info) { const st = 0.25; const stop = t > st && t < info.dur - 0.25;
    s.b.update(t, { peck: stop ? 0 : 1, rate: 7, lid: stop ? 0.5 : 0.3, look: stop ? [0.3, 0.1] : [0, -0.5], headTurn: stop ? 1.25 : 0, blink: false });
    s.cp.scr.draw({ scroll: t }); const hp = s.cp.localToWorld(new THREE.Vector3(0, 0.62, 0));
    camMove(s.stage, t, [[0, { pos: [hp.x + 1.6, hp.y + 0.3, hp.z + 1.25], look: [hp.x, hp.y + 0.12, hp.z], fov: 30 }], [info.dur, { pos: [hp.x + 1.45, hp.y + 0.28, hp.z + 1.12], look: [hp.x, hp.y + 0.12, hp.z], fov: 30 }]]); },
  overlay(g, t, info) { stamp(g, t, 'COMMITTED', { at: at(info, 'Committed', 0.1) + 0.15, x: E.W / 2, y: 300, size: 92, color: '#2a1c15', fill: 'rgba(255,210,90,0.95)', rot: -0.06 }); },
});

// office scene: two officials behind the desk, the proposal folder, a pigeon standing on the desk
function officeScene(T) {
  const st = toonStage(T, { light: 'warm', fov: 38, shadowSize: 7, target: [0, 1.4, 0] }); const set = office(st);
  const A = officialA(); A.position.set(-0.75, 0, -0.55); A.rotation.y = 0.15; st.add(A);
  const B = officialB(); B.position.set(0.8, 0, -0.55); B.rotation.y = -0.15; st.add(B);
  const p = pigeon({ seed: 7, scale: 0.85 }); p.position.set(1.0, set.tableY, 0.55); p.rotation.y = -0.5; st.add(p);
  return { stage: st, set, A, B, p };
}
const OFFCAM = [[0, { pos: [0, 2.9, 8.4], look: [0, 1.75, 0], fov: 38 }], [3, { pos: [0, 2.8, 7.8], look: [0, 1.75, 0], fov: 38 }]];
// s13 "Officials reportedly called it eccentric and impractical..." — stamp, stamp
registerShot('s13', { kind: '3d',
  init(T) { return officeScene(T); },
  draw(s, t, info) { const e1 = at(info, 'eccentric', 0.8), e2 = at(info, 'impractical', 1.6);
    const sl = (t0) => ease.outBack(prog(t, t0 - 0.25, t0)) - ease.in(prog(t, t0 + 0.05, t0 + 0.3));
    s.A.pose(addPose(POSE.stand, { ...idle(t, 4), armR: [0.9 + sl(e1) * 0.4, 0.2, 0.2], elbowR: 0.9, headNod: 0.25 })); s.A.face(EXPR.suspicious, t);
    s.B.pose(addPose(POSE.stand, { ...idle(t, 5), armL: [0.9 + sl(e2) * 0.4, 0.2, 0.2], elbowL: 0.9, headNod: 0.25 })); s.B.face(mixExpr(EXPR.bored, EXPR.suspicious, prog(t, e2 - 0.2, e2)), t);
    s.p.update(t, { lid: 0.2, look: [-0.6, 0], headTurn: Math.sin(t * 3) * 0.2 });
    camMove(s.stage, t, OFFCAM); shakeCam(s.stage, t, [{ fx: 'shake', at: e1, amp: 0.03, dur: 0.2 }, { fx: 'shake', at: e2, amp: 0.03, dur: 0.2 }]); },
  overlay(g, t, info, s) { const e1 = at(info, 'eccentric', 0.8), e2 = at(info, 'impractical', 1.6);
    stamp(g, t, 'ECCENTRIC', { at: e1, x: 420, y: 330, size: 78, rot: -0.14, fill: 'rgba(250,244,226,0.92)' }); stamp(g, t, 'IMPRACTICAL', { at: e2, x: 640, y: 470, size: 74, rot: 0.08, fill: 'rgba(250,244,226,0.92)' });
    reactions(g, t, s, [{ fx: 'sweat', on: s.p, at: e2 + 0.2 }]); },
});
// s14 "then chipped in 25,000 dollars anyway." — both officials shrug; a money bag thumps onto the desk; the pigeon gets heart eyes
registerShot('s14', { kind: '3d',
  init(T) { return officeScene(T); },
  draw(s, t, info) { const k = ease.out(prog(t, 0.05, 0.45));
    s.A.pose(shrug(addPose(POSE.stand, idle(t, 4)), k)); s.A.face(mixExpr(EXPR.suspicious, EXPR.deadpan, k), t);
    s.B.pose(shrug(addPose(POSE.stand, idle(t, 5)), k)); s.B.face(mixExpr(EXPR.bored, EXPR.deadpan, k), t);
    s.p.update(t, { lid: 0.05, look: [-0.4, -0.2], headTurn: -0.3, flap: prog(t, at(info, 'anyway', 1.5), at(info, 'anyway', 1.5) + 0.2) * 0.6 });
    camMove(s.stage, t, [[0, { pos: [0, 2.8, 7.8], look: [0, 1.75, 0], fov: 38 }], [info.dur, { pos: [0, 2.7, 7.1], look: [0, 1.75, 0], fov: 38 }]]); },
  overlay(g, t, info, s) { const d = at(info, '25,000', 0.5); moneyBag(g, t - d + 0.1, 540, 1010, '$25,000', { s: 1.1 });
    reactions(g, t, s, [{ fx: 'heartEyes', on: s.p, at: d + 0.3 }, { fx: 'hearts', on: s.p, at: d + 0.35 }]); },
});

// demo room: the demo cockpit on the bench in front; officials + scientist behind it, facing camera (watching the bird)
function demoScene(T) {
  const st = toonStage(T, { light: 'warm', fov: 38, shadowSize: 8, target: [0, 1.2, 0] }); const set = lab(st, { boardX: -3.4, benchX: 0, benchZ: 0.9 });
  const cp = cockpit({ seed: 5, label: '' }); cp.position.set(0, set.benchY, 0.9); cp.rotation.y = Math.PI * 0.85; st.add(cp);
  const A = officialA(); A.position.set(-0.65, 0, -0.5); A.rotation.y = 0.1; st.add(A);
  const B = officialB(); B.position.set(0.7, 0, -0.5); B.rotation.y = -0.1; st.add(B);
  const sc = scientist(); sc.position.set(1.6, 0, 0.3); sc.rotation.y = -0.6; sc.scale.setScalar(0.95); st.add(sc);
  return { stage: st, set, cp, b: cp.bird, A, B, sc };
}
const DEMOCAM = { pos: [0, 2.6, 7.4], look: [0, 1.55, 0], fov: 40 };
// s15 "But here's the part..." — silence. The demo is set; everybody waits. Slow push in.
registerShot('s15', { kind: '3d',
  init(T) { return demoScene(T); },
  draw(s, t, info) { s.b.update(t, { peck: 0, lid: 0.25, look: [0, -0.5] }); s.cp.scr.draw({ ships: [[0.5, 0.5]], cross: [0.75, 0.35], scroll: t });
    [s.A, s.B].forEach((p, i) => { p.pose(addPose(POSE.handsHips, idle(t, 6 + i))); p.face(EXPR.suspicious, t); }); s.sc.pose(addPose(POSE.stand, idle(t, 8))); s.sc.face(EXPR.worried, t);
    camMove(s.stage, t, [[0, { pos: [0, 3.0, 9.4], look: [0, 1.5, 0], fov: 40 }], [info.dur, DEMOCAM]], ease.inOut); },
  overlay(g) { softTint(g, '#ffd08a', 0.12); },
});
// s16 "the pigeon demo reportedly worked." — the bird pecks once: LOCKED. Officials double-take.
registerShot('s16', { kind: '3d',
  init(T) { return demoScene(T); },
  draw(s, t, info) { const w = at(info, 'worked', 1.3); const lk = prog(t, 0.2, 0.9);
    s.b.update(t, { peck: t < 0.9 ? 1 : 0, rate: 5, lid: t < 0.9 ? 0.3 : 0.45, look: t < 0.9 ? [0, -0.5] : [0.4, 0.1], headTurn: t < 0.9 ? 0 : 0.4 });
    s.cp.scr.draw({ ships: [[0.5, 0.5]], cross: [lerp(0.75, 0.5, ease.out(lk)), lerp(0.35, 0.5, ease.out(lk))], lock: prog(t, 0.85, 0.9), scroll: t });
    const dt = ease.outBack(prog(t, w - 0.1, w + 0.15));
    [s.A, s.B].forEach((p, i) => { p.pose(addPose(POSE.stand, { ...idle(t, 6 + i), lean: -0.15 * dt, bob: 0.1 * dt * Math.sin(prog(t, w - 0.1, w + 0.3) * Math.PI), armL: [0.4 * dt, 0.4 * dt, 0], armR: [0.4 * dt, 0.4 * dt, 0] })); p.face(mixExpr(EXPR.suspicious, EXPR.shocked, dt), t); });
    s.sc.pose(addPose(POSE.armsUp, idle(t, 8))); s.sc.face(mixExpr(EXPR.worried, EXPR.grin, prog(t, 0.9, 1.1)), t);
    camMove(s.stage, t, [[0, DEMOCAM], [info.dur, { pos: [0, 2.5, 6.6], look: [0, 1.6, 0], fov: 40 }]]); shakeCam(s.stage, t, [{ fx: 'shake', at: w, amp: 0.03, dur: 0.25 }]); },
  overlay(g, t, info, s) { const w = at(info, 'worked', 1.3); if (t > 0.9) stamp(g, t, 'ON TARGET', { at: 0.9, x: E.W / 2, y: 300, size: 84, color: '#2a8a3a', fill: 'rgba(240,255,240,0.92)', rot: -0.06 });
    reactions(g, t, s, [{ fx: 'exclaim', on: s.A, at: w }, { fx: 'exclaim', on: s.B, at: w + 0.08 }, { fx: 'sparkle', on: s.b, at: 0.95 }]); },
});
// s17 "Officials stayed skeptical anyway." — arms crossed, side-eye; the pigeon: "???"
registerShot('s17', { kind: '3d',
  init(T) { return officeScene(T); },
  draw(s, t, info) { const CROSS = { ...POSE.stand, armL: [0.9, 0.35, 0.9], elbowL: 1.9, armR: [0.9, 0.35, 0.9], elbowR: 1.9 };
    s.A.pose(addPose(CROSS, idle(t, 4))); s.A.face({ ...EXPR.suspicious, pupil: [0.6, 0] }, t); s.B.pose(addPose(CROSS, idle(t, 5))); s.B.face({ ...EXPR.suspicious, pupil: [0.6, 0] }, t);
    s.p.update(t, { lid: 0.05, look: [-0.6, 0.2], headTurn: -0.6 + Math.sin(t * 6) * 0.25, headTilt: 0.3 });
    camMove(s.stage, t, [[0, { pos: [0.4, 2.7, 7.0], look: [0.2, 1.75, 0], fov: 38 }], [info.dur, { pos: [0.4, 2.6, 6.4], look: [0.2, 1.75, 0], fov: 38 }]]); },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'question', on: s.p, at: at(info, 'skeptical', 0.6) }]); },
});
// s18 "In 1944, they cancelled it." — CANCELLED slams onto the folder; the pigeon's jaw drops; a single feather floats down in silence
registerShot('s18', { kind: '3d',
  init(T) { return officeScene(T); },
  draw(s, t, info) { const c = at(info, 'cancelled', 1.0); const k = ease.outBack(prog(t, c - 0.2, c));
    s.A.pose(addPose(POSE.stand, { ...idle(t, 4), armR: [0.9 + k * 0.3, 0.2, 0.2], elbowR: 0.9 })); s.A.face(EXPR.deadpan, t); s.B.pose(addPose(POSE.stand, idle(t, 5))); s.B.face(EXPR.deadpan, t);
    s.p.update(t, { lid: t > c ? 0.0 : 0.2, beakOpen: t > c ? 1 : 0, look: [-0.3, -0.5], headTurn: -0.3, blink: false });
    camMove(s.stage, t, [[0, { pos: [0.9, 1.8, 2.4], look: [0.7, 1.3, 0.5], fov: 38 }], [info.dur, { pos: [0.85, 1.75, 2.1], look: [0.7, 1.3, 0.5], fov: 38 }]]); shakeCam(s.stage, t, [{ fx: 'shake', at: c, amp: 0.05, dur: 0.25 }]); },
  overlay(g, t, info, s) { const c = at(info, 'cancelled', 1.0); stamp(g, t, '1944', { at: at(info, '1944', 0.3), x: 250, y: 360, size: 84, fill: 'rgba(250,244,226,0.92)' });
    stamp(g, t, 'CANCELLED', { at: c, x: E.W / 2, y: 1150, size: 110, rot: -0.16 }); feather(g, t - c - 0.25, 640, 560);
    reactions(g, t, s, [{ fx: 'exclaim', on: s.p, at: c + 0.05, until: c + 0.6 }]); },
});

// navy scene: the nose cone set, a Navy officer leaning in with the folder
// s19 "The Navy revived it as Project Orcon," — officer pops in, PROJECT ORCON stamp; the pigeons flap with joy
registerShot('s19', { kind: '3d',
  init(T) { const s = noseScene(T); s.n = navy(); s.n.position.set(-2.3, -0.6, 1.0); s.n.rotation.y = 0.9; s.stage.add(s.n); return s; },
  draw(s, t, info) { s.nose.update(t); const o = at(info, 'Orcon', 1.2); const joy = ease.out(prog(t, o, o + 0.3));
    s.birds.forEach((b, i) => b.update(t + i * 0.2, { peck: 0, lid: lerp(0.3, 0.05, joy), look: [-0.5, 0.3], headTurn: -0.5, flap: joy, lean: -0.1 * joy }));
    s.n.position.set(lerp(-2.6, -1.05, ease.out(prog(t, 0, 0.4))), 0, 1.5); s.n.pose(addPose(POSE.stand, { ...idle(t, 9), armR: [1.3, 0.2, 0.3], elbowR: 0.4 })); s.n.face(EXPR.happy, t);
    camMove(s.stage, t, [[0, { pos: [0.2, 2.4, 7.0], look: [-0.4, 1.2, 0.3], fov: 42 }], [info.dur, { pos: [0.1, 2.3, 6.5], look: [-0.4, 1.2, 0.3], fov: 42 }]]); },
  overlay(g, t, info, s) { const o = at(info, 'Orcon', 1.2); chip(g, t - at(info, 'Navy', 0.2), 'U.S. NAVY · 1948', E.W / 2, 1180, { size: 54, color: '#9fd0ff' });
    stamp(g, t, 'PROJECT ORCON', { at: o, x: E.W / 2, y: 420, size: 80, color: '#2a6ad8', fill: 'rgba(240,246,255,0.94)', rot: -0.06 });
    reactions(g, t, s, [{ fx: 'hearts', on: s.birds[1], at: o + 0.2 }, { fx: 'sparkle', on: s.birds[2], at: o + 0.25 }]); },
});
// s20 "until electronic guidance won in 1953." — a beeping box rolls in and bumps cockpit 3 aside; its pigeon shrugs
registerShot('s20', { kind: '3d',
  init(T) { const s = noseScene(T); s.box = eBox(); s.box.scale.setScalar(0.85); s.stage.add(s.box); return s; },
  draw(s, t, info) { s.nose.update(t); const e = at(info, 'electronic', 0.1), w = at(info, 'won', 1.0); const arrive = ease.out(prog(t, e, w));
    s.box.position.set(lerp(4.2, 1.6, arrive), 0, 0.1); s.box.update(t, { roll: arrive }); s.box.rotation.z = Math.sin(t * 20) * 0.01;
    const c3 = s.nose.cps[2]; c3.position.x = 1.15 - ease.outBack(prog(t, w - 0.2, w + 0.1)) * 0.0; c3.rotation.y = -0.25 * ease.outBack(prog(t, w - 0.15, w + 0.15)); c3.position.z = 0.35 * ease.out(prog(t, w - 0.15, w + 0.15));
    const sh = ease.out(prog(t, w + 0.15, w + 0.5));
    s.birds.forEach((b, i) => b.update(t + i * 0.2, { peck: 0, lid: 0.45, lidAngle: -0.2, look: [0.6, 0], headTurn: i === 2 ? 0.6 : 0.9, flap: i === 2 ? sh * 0.5 : 0 }));
    if (t < w - 0.25) camMove(s.stage, t, [[0, { pos: [1.2, 2.2, 5.0], look: [0.8, 0.8, 0], fov: 42 }], [w, { pos: [1.2, 2.1, 4.6], look: [0.9, 0.8, 0], fov: 42 }]]);
    else camMove(s.stage, t - w, [[0, { pos: [2.5, 1.35, 2.3], look: [1.3, 0.75, 0.2], fov: 38 }], [info.dur - w, { pos: [2.3, 1.3, 2.0], look: [1.3, 0.75, 0.2], fov: 38 }]]); },   // hard cut on "won"
  overlay(g, t, info, s) { const w = at(info, 'won', 1.0); stamp(g, t, '1953', { at: at(info, '1953', w + 0.4), x: 260, y: 360, size: 84, fill: 'rgba(250,244,226,0.92)' });
    chip(g, t - at(info, 'electronic', 0.1), 'ELECTRONIC GUIDANCE', E.W / 2, 1180, { size: 50, color: '#9fd0ff' });
    reactions(g, t, s, [{ fx: 'sweat', on: s.birds[2], at: w + 0.1 }, { fx: 'question', on: s.birds[1], at: w + 0.3 }]); },
});
// s21 "And six years later," — calendar card flips +1 ... +6 over the dimmed lab
const labBg = { init(T) { return labScene(T); }, draw(s, t) { s.b.update(t, { peck: 1, rate: 4, lid: 0.3, look: [0, -0.5] }); s.cp.scr.draw({ scroll: t }); s.sc.pose(addPose(POSE.stand, idle(t, 2))); s.sc.face(EXPR.neutral, t);
  camMove(s.stage, t, [[0, { pos: [0.1, 2.3, 7.0], look: [0.3, 1.4, -0.6], fov: 38 }], [3, { pos: [0.1, 2.2, 6.4], look: [0.3, 1.4, -0.6], fov: 38 }]]); } };
registerShot('s21', { kind: '3d',
  init(T) { return labBg.init(T); },
  draw(s, t, info) { labBg.draw(s, t, info); },
  overlay(g, t, info) { dimScene(g, 8, 0.5); calendarCard(g, t, { y: 820, flips: 6, dur: Math.max(0.6, info.dur - 0.5), title: 'YEARS LATER' }); },
});
// s22 "Skinner's pigeons were still pecking." — back in the cockpits: all three still pecking away, a bit older (tiny reading glasses on bird 2)
registerShot('s22', { kind: '3d',
  init(T) { const s = noseScene(T); return s; },
  draw(s, t, info) { s.nose.update(t); peckAll(s, t);
    camMove(s.stage, t, [[0, { pos: [0.4, 1.9, 3.6], look: [-0.1, 0.62, -0.1], fov: 40 }], [info.dur, { pos: [1.9, 1.62, 2.6], look: [-0.3, 0.62, -0.15], fov: 38 }]], ease.inOut); },
  overlay(g, t, info, s) { softTint(g, '#9fffe0', 0.1); stamp(g, t, 'STILL PECKING', { at: at(info, 'still', 0.6), x: E.W / 2, y: 420, size: 84, color: '#2a1c15', fill: 'rgba(255,210,90,0.95)', rot: -0.05 });
    peckBursts(g, t, { x: 560, y: 1250, r: 260, rate: 6, size: 58 }); },
});
// s23 "Subscribe for more." — settles exactly onto frame 1's framing (loop)
registerShot('s23', { kind: '3d',
  init(T) { return noseScene(T); },
  draw(s, t, info) { s.nose.update(t); peckAll(s, t);
    camMove(s.stage, t, [[0, { pos: [2.1, 1.6, 2.45], look: [-0.32, 0.62, -0.15], fov: 38 }], [info.dur, F1]], ease.out); shakeCam(s.stage, t, [{ fx: 'shake', at: 0, amp: 0.01, dur: info.dur }]); },
  overlay(g, t, info, s) { softTint(g, '#9fffe0', 0.1); peckBursts(g, t, { x: 560, y: 1250, r: 260, rate: 6, size: 58 }); },
});
