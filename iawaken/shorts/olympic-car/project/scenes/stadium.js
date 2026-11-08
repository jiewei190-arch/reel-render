// stadium shots: s02 (Lorz "wins"), s03 (MINA notices), s11 (DEV: "1904 sports science"), s15 (fourth), s16 (the time + BISCUIT), s17 (HERO), s18 (Hicks finishes, +29 MIN).
import { registerShot, ease, prog, clamp, lerp, rng } from '/engine/core.js';
import { E, text } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, run, shrug, tremble } from '/kits/toon3d/rig.js';
import { THREE, at, tag, slam, clockFace, stadium, lorz, hicks, handler, cuban, castMember, cat, apple, PR } from './_lib.js';

const PI2 = Math.PI / 2;
// paper confetti (2D, deterministic)
function confetti(g, t, k = 1, seed = 3) { if (k <= 0) return; const r = rng(seed); const C = ['#ffd25a', '#c8372d', '#2f5aa8', '#f4f0e6', '#5aa04a'];
  for (let i = 0; i < 70; i++) { const x0 = r() * E.W, sp = 180 + r() * 220, ph = r() * 7, y = -60 + ((r() * E.H * 0.5 + t * sp) % (E.H * 0.9)); g.save(); g.globalAlpha = k; g.translate(x0 + Math.sin(t * 2 + ph) * 40, y); g.rotate(t * 3 + ph); g.fillStyle = C[i % 5]; g.fillRect(-10, -6, 20, 12); g.restore(); } }
// finish tape: a thin box across the track at x 0 that breaks when the runner passes
function tape(st) { const L = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, 2.8), new THREE.MeshBasicMaterial({ color: '#f4f0e6' })), R = L.clone(); L.position.set(0, 1.45, -1.4); R.position.set(0, 1.45, 1.4); st.add(L, R); return { L, R }; }

// s02 "He crossed the line first." — Lorz breaks the tape, arms up, fresh; the crowd cheers
registerShot('s02', { kind: '3d',
  init(T) { const s = stadium(T, { target: [0, 0, 0] }); s.lz = lorz(); s.lz.rotation.y = PI2; s.stage.add(s.lz); s.tp = tape(s.stage); return s; },
  draw(s, t, info) { const f = at(info, 'first', 0.8); const x = lerp(-4.2, 1.6, ease.out(prog(t, 0, f + 0.4))); s.lz.position.set(x, 0, 0);
    const up = ease.outBack(prog(t, f - 0.25, f + 0.1)); s.lz.pose(mixPose(run(t, { speed: 1.6, amp: 0.9 }), addPose(POSE.armsUp, idle(t)), up)); s.lz.face(up > 0.5 ? EXPR.grin : EXPR.happy, t);
    const br = clamp((x - 0.1) * 2); s.tp.L.rotation.x = -br * 1.2; s.tp.R.rotation.x = br * 1.2; s.tp.L.position.z = -1.4 - br * 0.2; s.tp.R.position.z = 1.4 + br * 0.2; s.tp.L.position.y = s.tp.R.position.y = 1.45 - br * 0.6;
    s.update(t, 0.4 + up * 0.8);
    camMove(s.stage, t, [[0, { pos: [3.4, 2.0, 8.6], look: [-0.6, 1.9, -0.8], fov: 42 }], [info.dur, { pos: [3.8, 1.9, 7.4], look: [0.6, 2.0, -0.8], fov: 42 }]]); },
  overlay(g, t, info) { const f = at(info, 'first', 0.8); confetti(g, t, prog(t, f - 0.2, f + 0.1)); },
});

// s03 "Then someone noticed." — MINA in the front row slowly lowers her stopwatch, eyes narrowing at the lens
registerShot('s03', { kind: '3d',
  init(T) { const s = stadium(T, { target: [0, 0, -4], clear: [0.9, 3.1] }); s.m = castMember('mina'); s.m.position.set(2.0, 0.6, -4.7); s.stage.add(s.m); return s; },
  draw(s, t, info) { const n = at(info, 'noticed', 0.4); const low = ease.inOut(prog(t, 0.1, n + 0.1));
    s.m.pose(addPose({ ...POSE.stand, armR: [lerp(1.9, 0.9, low), 0.1, 0.2], elbowR: lerp(1.2, 1.4, low), armL: [0.1, 0.1, 0] }, idle(t, 3)));
    s.m.face(mixExpr({ ...EXPR.neutral, pupil: [0, -0.3] }, { ...EXPR.suspicious, pupil: [0, 0], lid: 0.62 }, ease.inOut(prog(t, n - 0.1, n + 0.4))), t);
    s.prop = s.m.prop; s.update(t, 0.15);
    camMove(s.stage, t, [[0, { pos: [2.0, 2.4, -0.9], look: [2.0, 2.2, -4.7], fov: 36 }], [info.dur, { pos: [2.0, 2.35, -1.6], look: [2.0, 2.25, -4.7], fov: 34 }]]); },
});

// s11 "1904 sports science." — DEV looks up from his phone, slowly turns to the lens, deadpan
registerShot('s11', { kind: '3d',
  init(T) { const s = stadium(T, { target: [3, 0, -4], clear: [1.8, 4.2] }); s.d = castMember('dev'); s.d.position.set(3, 0.6, -4.7); s.stage.add(s.d); return s; },
  draw(s, t, info) { const sc = at(info, 'science', 1.2); const up = ease.inOut(prog(t, 0.25, 0.8));
    s.d.pose(addPose({ ...POSE.stand, armR: [lerp(1.3, 0.6, up), 0.05, 0.3], elbowR: lerp(1.5, 1.2, up), headNod: lerp(0.25, 0, up) }, idle(t, 2)));
    s.d.face(mixExpr({ ...EXPR.neutral, pupil: [0, -0.7] }, { ...EXPR.deadpan, lid: 0.52, pupil: [0, 0] }, up), t);
    s.update(t, 0.1);
    camMove(s.stage, t, [[0, { pos: [3.0, 2.7, 1.6], look: [3.0, 2.5, -4.7], fov: 34 }], [info.dur, { pos: [3.0, 2.7, 0.9], look: [3.0, 2.55, -4.7], fov: 34 }]]); },
  overlay(g, t, info) { const sp = at(info, 'sports', 0.4); tag(g, '1904 SPORTS SCIENCE', ease.out(prog(t, sp - 0.1, sp + 0.2))); },
});

// s15 "and still finished fourth." — the Cuban runner jogs over the line, happily chewing; gold "4th"
registerShot('s15', { kind: '3d',
  init(T) { const s = stadium(T, { target: [0, 0, 0] }); s.c = cuban(); s.c.rotation.y = PI2; s.stage.add(s.c); s.ap = apple(); s.c.hold('R', s.ap); s.ap.position.set(0, -0.05, 0.1); return s; },
  draw(s, t, info) { const x = -2.6 + t * 2.2; s.c.position.set(x, 0, 0.3); s.c.pose(addPose(run(t, { speed: 1.6, amp: 0.8 }), { armR: [1.6, 0.1, 0.4], elbowR: 1.5, headTurn: -0.5 })); s.c.face({ ...EXPR.happy, talk: 0.6, pupil: [-0.3, 0] }, t); s.update(t, 0.6);
    camMove(s.stage, t, [[0, { pos: [2.6, 1.9, 7.0], look: [-0.4, 1.6, 0], fov: 40 }], [info.dur, { pos: [3.0, 1.9, 6.6], look: [0.6, 1.6, 0], fov: 40 }]]); },
  overlay(g, t, info) { const f = at(info, 'fourth', 0.9); slam(g, '4th', prog(t, f - 0.1, f + 0.15), E.W / 2, E.H * 0.33, 260); },
});

// s16 "The winning time?" — the scoreboard; BISCUIT sits on top, heavy lids, then stares at the lens
registerShot('s16', { kind: '3d',
  init(T) { const s = stadium(T, { target: [0, 0, 1] }); s.sb = PR.scoreboard({ title: 'WINNING TIME', lines: ['3:28:53', 'T. HICKS'] }).at(-3.5, 0, 1.2); s.sb.scale.setScalar(1.5); s.stage.add(s.sb);
    s.cat = cat(); s.cat.position.set(-2.95, 3.45, 1.25); s.cat.scale.setScalar(0.9); s.stage.add(s.cat); return s; },
  draw(s, t, info) { const w = at(info, 'time', 0.3); s.update(t, 0.1);
    s.cat.update(t, { lid: lerp(0.55, 0.62, prog(t, w, w + 0.4)), look: t < w ? [0.6, -0.5] : [0, 0], tail: 1, headTurn: t < w ? 0.4 : 0 });
    camMove(s.stage, t, [[0, { pos: [-3.3, 2.6, 10.2], look: [-3.5, 2.35, 1.2], fov: 38 }], [info.dur, { pos: [-3.3, 2.6, 9.6], look: [-3.5, 2.35, 1.2], fov: 38 }]]); },
});

// s17 "The slowest in Olympic history." — the HERO by the track, jaw drop at the scoreboard
registerShot('s17', { kind: '3d',
  init(T) { const s = stadium(T, { target: [0, 0, 2] }); s.h = castMember('hero'); s.h.position.set(0, 0, 3.2); s.h.rotation.y = 0.25; s.stage.add(s.h);
    s.sb = PR.scoreboard({ title: 'WINNING TIME', lines: ['3:28:53', 'T. HICKS'] }).at(-2.4, 0, 0.6, 0.35); s.sb.scale.setScalar(1.3); s.stage.add(s.sb); return s; },
  draw(s, t, info) { const sl = at(info, 'slowest', 0.2), k = ease.out(prog(t, sl - 0.05, sl + 0.2));
    s.h.pose(addPose(mixPose(POSE.relaxed, { ...POSE.relaxed, armL: [0.6, 0.5, 0.3], armR: [0.6, 0.5, 0.3], elbowL: 0.8, elbowR: 0.8, lean: -0.1 }, k), { ...idle(t), headTurn: lerp(0.5, 0.05, k) }));
    s.h.face(mixExpr({ ...EXPR.neutral, pupil: [0.5, 0.1] }, { ...EXPR.shocked, mouth: 'scream', pupil: [0, 0] }, k), t); s.update(t, 0.15);
    camMove(s.stage, t, [[0, { pos: [0.6, 2.3, 7.6], look: [-0.3, 2.1, 2.6], fov: 36 }], [info.dur, { pos: [0.5, 2.25, 6.6], look: [-0.2, 2.1, 2.8], fov: 36 }]]); },
  overlay(g, t, info) { const sl = at(info, 'slowest', 0.2); tag(g, 'SLOWEST EVER', ease.out(prog(t, sl - 0.05, sl + 0.25))); },
});

// s18 "By almost half an hour." — Hicks finally crosses the line, a handler either side; big stopwatch spins; "+29 MIN"
registerShot('s18', { kind: '3d',
  init(T) { const s = stadium(T, { target: [0, 0, 0] }); s.h = hicks(); s.a = handler(0); s.b = handler(1); [s.h, s.a, s.b].forEach(b => { b.rotation.y = PI2; s.stage.add(b); }); s.tp = tape(s.stage); return s; },
  draw(s, t, info) { const x = -1.6 + t * 0.9; const shuffle = run(t, { speed: 1.2, amp: 0.45 }); shuffle.lean = 0.15; shuffle.headNod = 0.2;
    s.h.position.set(x, 0, 0); s.h.pose(addPose(shuffle, { side: Math.sin(t * 4) * 0.05 })); s.h.face({ ...EXPR.deadpan, lid: 0.65 }, t);
    s.a.position.set(x - 1.0, 0, 1.0); s.b.position.set(x - 0.9, 0, -1.0); s.a.pose(addPose(run(t + 0.3, { speed: 1.2, amp: 0.4 }), { armL: [0.9, -0.3, 0], elbowL: 0.3 })); s.b.pose(addPose(run(t + 0.6, { speed: 1.2, amp: 0.4 }), { armR: [0.9, -0.3, 0], elbowR: 0.3 }));
    s.a.face(EXPR.worried, t); s.b.face(EXPR.worried, t);
    const br = clamp((x - 0.1) * 2); s.tp.L.rotation.x = -br * 1.2; s.tp.R.rotation.x = br * 1.2; s.tp.L.position.y = s.tp.R.position.y = 1.45 - br * 0.6;
    s.update(t, 0.5);
    camMove(s.stage, t, [[0, { pos: [3.8, 2.5, 8.4], look: [-0.4, 1.6, 0], fov: 40 }], [info.dur, { pos: [4.0, 2.5, 7.8], look: [0.2, 1.6, 0], fov: 40 }]]); },
  overlay(g, t, info) { const h = at(info, 'hour', 1.2); clockFace(g, E.W / 2, E.H * 0.2, 120, t, ease.out(prog(t, 0, 0.25)), 3); slam(g, '+29 MIN', prog(t, h - 0.1, h + 0.15), E.W / 2, E.H * 0.38, 190); },
});
