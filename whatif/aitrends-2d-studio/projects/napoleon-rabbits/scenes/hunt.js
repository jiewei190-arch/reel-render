// "Napoleon Was Defeated by Rabbits" — all shots. Sunny meadow, July 1807 (legend: General Thiébault's memoir).
// Nobody is hurt: no shots fired, the whips crack in the air, the rabbits only swarm.
import { registerShot, ease, prog, clamp, lerp } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, idle, addPose, mixPose, mixExpr, point, shrug, tremble, run, walk } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { insertShot } from '/kits/toon3d/insert.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import { THREE, at, tag, meadow, napoleon, berthier, coachman, crop, rabbit, warren, charge, cage, bicorne } from './_lib.js';

const SUN = { rays: { from: [-60, -80], strength: 0.9 }, tint: '#ffcf8a' };
const look = (g, t, rays = true) => sunnyLook(g, t, rays ? SUN : { rays: false, tint: '#ffcf8a' });
const swat = (t, k = 1) => ({ armR: [0.5 + Math.sin(t * 13) * 0.5 * k, 1.5, 0], elbowR: 0.3, armL: [0.6, 1.4, 0], elbowL: 0.5 });
const withCrop = (b) => { const c = crop(); c.rotation.x = Math.PI - 0.5; b.hand.R.add(c); b.crop = c; return c; };
// rabbits circling Napoleon's feet (swarm), each on its own little orbit, hopping
const swarm = (list, t, c = [0, 0], rad = [0.6, 1.5]) => list.forEach((b, i) => { const a = i * 2.39 + t * (0.6 + (i % 3) * 0.15) * (i % 2 ? 1 : -1); const r = rad[0] + ((i * 0.37) % 1) * (rad[1] - rad[0]);
  b.position.set(c[0] + Math.cos(a) * r, 0, c[1] + Math.sin(a) * r * 0.8); b.rotation.y = Math.atan2(c[0] - b.position.x, c[1] - b.position.z); b.update(t, { hop: 1, speed: 3 + (i % 4) * 0.3, look: [0, 0.6], lid: 0.05 }); });

// s01 "According to one general, rabbits attacked Napoleon." — frame 1: Napoleon in the middle of a rabbit swarm, swatting
registerShot('s01', { kind: '3d',
  init(T) { const s = meadow(T, { carriage: [3.6, 0, -3.2] }); s.n = napoleon(); s.stage.add(s.n); withCrop(s.n); s.r = warren(s.stage, 22, [-2, 2, -2, 2], 3); return s; },
  draw(s, t, info) { s.update(t); swarm(s.r, t); s.n.pose(addPose({ ...POSE.panic, ...swat(t) }, tremble(t, 2))); s.n.face(EXPR.panic, t);
    camMove(s.stage, t, [[0, { pos: [0.3, 2.3, 6.2], look: [0, 1.4, 0], fov: 46 }], [info.dur, { pos: [0.2, 2.1, 5.0], look: [0, 1.5, 0], fov: 46 }]], ease.sine); },
  overlay(g, t, info, s) { look(g, t); const n = at(info, 'Napoleon', 2.2); reactions(g, t, s, [{ fx: 'sweat', on: 'n', at: 0.05 }, { fx: 'exclaim', on: 'n', at: n, until: n + 1 }]); },
});
// s02 "Hundreds of them." — wide: the meadow full of hopping rabbits closing in on him
registerShot('s02', { kind: '3d',
  init(T) { const s = meadow(T, { carriage: [4.5, 0, -6], shadowSize: 16 }); s.n = napoleon(); s.n.position.set(0, 0, -2); s.stage.add(s.n); s.r = warren(s.stage, 44, [-7, 7, -9, 4], 7); return s; },
  draw(s, t, info) { s.update(t); charge(s.r, t, [0, -2], 0.25 + t * 0.18, { spread: 1.6 }); s.n.pose(addPose(POSE.panic, tremble(t, 2))); s.n.face(EXPR.shocked, t);
    camMove(s.stage, t, [[0, { pos: [0, 6.5, 10], look: [0, 0.5, -2], fov: 50 }], [info.dur, { pos: [0, 7.5, 12], look: [0, 0.5, -2], fov: 52 }]]); },
  overlay(g, t, info, s) { look(g, t); },
});
// s03 "And they won." — Napoleon sits in the grass; a rabbit wears his hat (sparkle)
registerShot('s03', { kind: '3d',
  init(T) { const s = meadow(T, { carriage: [3.6, 0, -3.2] }); s.n = napoleon(); s.n.hat.visible = false; s.n.position.set(-0.4, -0.55, 0); s.stage.add(s.n);
    s.b = rabbit({ seed: 4, fur: 0, scale: 1.2 }); s.b.position.set(0.55, 0, 0.3); s.b.rotation.y = -0.3; s.stage.add(s.b); const h = bicorne(); h.scale.setScalar(0.42); h.position.set(0, 0.38, 0.02); s.b.head.add(h); s.r = warren(s.stage, 6, [-2.5, 2.5, -2, -0.8], 9); return s; },
  draw(s, t, info) { s.update(t); s.r.forEach(b => b.update(t, { hop: 0 })); s.n.pose({ ...POSE.sit, armL: [0.3, 0.3, 0], armR: [0.3, 0.3, 0], headNod: 0.15 }); s.n.face({ ...EXPR.sad, pupil: [0.6, 0] }, t);
    s.b.update(t, { lid: 0.6, look: [0, 0] });
    camMove(s.stage, t, [[0, { pos: [0.1, 1.5, 3.4], look: [0.1, 1.0, 0], fov: 42 }], [info.dur, { pos: [0.1, 1.45, 3.0], look: [0.1, 1.0, 0], fov: 42 }]]); },
  overlay(g, t, info, s) { look(g, t, false); const w = at(info, 'won', 0.4); reactions(g, t, s, [{ fx: 'sparkle', on: 'b', at: w, scale: 0.7 }, { fx: 'sweat', on: 'n', at: 0.1 }]); },
});
// s04 "It's 1807." — insert over the camp (tent + flags)
const camp = { init(T) { return meadow(T, {}); }, draw(s, t) { s.update(t); camMove(s.stage, t, [[0, { pos: [-3, 2.2, 3], look: [-5.5, 2.2, -7], fov: 46 }], [3, { pos: [-3.2, 2.2, 2.4], look: [-5.5, 2.2, -7], fov: 46 }]]); } };
insertShot('s04', { scene: camp, insert: { type: 'bigtext', kicker: 'JULY', title: '1807', lines: ['Treaties of Tilsit'] } });
// s05 "Napoleon just signed a peace treaty." — Napoleon signs at a field desk, smug
registerShot('s05', { kind: '3d',
  init(T) { const s = meadow(T, {}); s.n = napoleon(); s.n.position.set(0, 0, 0.4); s.stage.add(s.n); s.desk = PR.fieldDesk().at(0, 0, 1.2, Math.PI); s.stage.add(s.desk);
    s.doc = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.45), new THREE.MeshToonMaterial({ map: PR.TEX.label('TREATY', '#f3e6c4', '#5a3a1a') })); s.doc.rotation.x = -Math.PI / 2; s.doc.position.set(0, 1.0, 1.2); s.stage.add(s.doc); return s; },
  draw(s, t, info) { s.update(t); const sg = at(info, 'signed', 0.8); const w = t < sg + 0.6 ? Math.sin(t * 14) * 0.15 : 0;
    s.n.pose(addPose({ ...POSE.stand, armR: [1.0 + w, 0.15, 0.2], elbowR: 0.6, lean: 0.12 }, idle(t, 2))); s.n.face(t < sg + 0.6 ? { ...EXPR.deadpan, pupil: [0, -0.6] } : { ...EXPR.smug, pupil: [0, 0] }, t);
    camMove(s.stage, t, [[0, { pos: [0.2, 2.6, 4.8], look: [0, 1.55, 0.6], fov: 42 }], [info.dur, { pos: [0.2, 2.4, 4.0], look: [0, 1.65, 0.6], fov: 42 }]], ease.sine); },
  overlay(g, t, info, s) { look(g, t); tag(g, 'NAPOLEON', ease.out(prog(t, 0.0, 0.3)), 0.16); const tr = at(info, 'treaty', 1.4); reactions(g, t, s, [{ fx: 'sparkle', on: 'n', at: tr, scale: 0.8 }]); },
});
// s06 "To celebrate, his chief of staff sets up a rabbit hunt." — Berthier proudly unveils a row of cages
const cageRow = (st) => { const cs = [-2.2, -0.75, 0.75, 2.2].map((x, i) => { const c = cage(); c.position.set(x, 0, -1.2); c.rotation.y = 0; st.add(c); c.bun = [0, 1].map(j => { const b = rabbit({ seed: 30 + i * 2 + j, scale: 0.85 }); b.position.set(x - 0.25 + j * 0.5, 0.1, -1.25); st.add(b); return b; }); return c; }); return cs; };
registerShot('s06', { kind: '3d',
  init(T) { const s = meadow(T, {}); s.b = berthier(); s.b.position.set(-0.6, 0, 0.6); s.b.rotation.y = 0.25; s.stage.add(s.b); s.cs = cageRow(s.stage); return s; },
  draw(s, t, info) { s.update(t); const h = at(info, 'hunt', 2.6); s.cs.forEach(c => c.bun.forEach(b => b.update(t, { look: [0, 0.2] })));
    s.b.pose(addPose(mixPose(POSE.handsHips, point(POSE.stand, 'L', 1, { up: 0.1 }), ease.outBack(prog(t, h - 0.2, h + 0.2))), idle(t, 4))); s.b.face({ ...EXPR.grin, pupil: [0, 0] }, t);
    camMove(s.stage, t, [[0, { pos: [-0.2, 2.2, 4.6], look: [-0.1, 1.4, -0.4], fov: 46 }], [info.dur, { pos: [-0.2, 2.1, 4.0], look: [-0.1, 1.45, -0.4], fov: 46 }]], ease.sine); },
  overlay(g, t, info, s) { look(g, t); tag(g, 'CHIEF OF STAFF', ease.out(prog(t, 0.6, 0.9)), 0.16); const h = at(info, 'hunt', 2.6); reactions(g, t, s, [{ fx: 'stars', on: 'b', at: h, scale: 0.7 }]); },
});
// s07 "Hundreds of rabbits. Some say 3,000." — counter over the cages
insertShot('s07', { scene: { init(T) { const s = meadow(T, {}); s.cs = cageRow(s.stage); return s; }, draw(s, t) { s.update(t); s.cs.forEach(c => c.bun.forEach(b => b.update(t, {}))); camMove(s.stage, t, [[0, { pos: [0, 2.0, 3.6], look: [0, 0.8, -1.2], fov: 46 }], [3.2, { pos: [0, 2.0, 3.1], look: [0, 0.8, -1.2], fov: 46 }]]); } },
  insert: { type: 'counter', title: 'RABBITS', from: 100, value: 3000, lines: ['(some say)'], color: '#ffd25a' } });
// s08 "The cages open..." — the doors drop; beat; the rabbits stare at the lens
registerShot('s08', { kind: '3d',
  init(T) { const s = meadow(T, {}); s.cs = cageRow(s.stage); return s; },
  draw(s, t, info) { s.update(t); const o = at(info, 'open', 0.5); s.cs.forEach((c, i) => { c.open(ease.outBack(prog(t, o + i * 0.08, o + i * 0.08 + 0.35))); c.bun.forEach(b => b.update(t, { lid: t > o + 0.8 ? 0.6 : 0.05, look: [0, 0] })); });
    camMove(s.stage, t, [[0, { pos: [0, 1.2, 3.4], look: [0, 0.6, -1.2], fov: 46 }], [info.dur, { pos: [0, 1.0, 2.6], look: [0, 0.55, -1.2], fov: 46 }]]); },
  overlay(g, t, info, s) { look(g, t, false); },
});
// s09 "and the rabbits charge. Straight at Napoleon." — a stream of rabbits toward him; "!" + shake + flash
registerShot('s09', { kind: '3d',
  init(T) { const s = meadow(T, { carriage: [4.0, 0, -1] }); s.n = napoleon(); s.n.position.set(0, 0, 2.2); s.n.rotation.y = Math.PI; s.stage.add(s.n); s.r = warren(s.stage, 30, [-4, 4, -10, -4], 11); return s; },
  draw(s, t, info) { s.update(t); const c = at(info, 'charge', 0.6), n = at(info, 'Napoleon', 2.1); charge(s.r, t, [0, 2.2], ease.inOut(prog(t, c - 0.3, info.dur + 0.6)), { spread: 1.4 });
    const turn = ease.outBack(prog(t, n - 0.1, n + 0.25)); s.n.rotation.y = lerp(Math.PI, 0.2, turn); s.n.pose(addPose(mixPose(POSE.handsHips, POSE.panic, turn), tremble(t, turn * 2))); s.n.face(turn > 0.5 ? EXPR.panic : EXPR.smug, t);
    camMove(s.stage, t, [[0, { pos: [1.4, 1.6, 6.0], look: [0, 0.9, -1], fov: 46 }], [info.dur, { pos: [1.0, 1.7, 5.4], look: [0, 1.1, 0], fov: 46 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: n, amp: 0.07, dur: 0.5 }]); },
  overlay(g, t, info, s) { look(g, t); const n = at(info, 'Napoleon', 2.1); reactions(g, t, s, [{ fx: 'speedlines', at: 0.4, until: info.dur }, { fx: 'exclaim', on: 'n', at: n }, { fx: 'flash', at: n, dur: 0.2 }]); },
});
// s10 "Wait, why would rabbits charge?" — Berthier "???"
registerShot('s10', { kind: '3d',
  init(T) { const s = meadow(T, {}); s.b = berthier(); s.stage.add(s.b); s.r = warren(s.stage, 8, [-3, 3, -4, -1.2], 13); return s; },
  draw(s, t, info) { s.update(t); swarm(s.r, t, [0, -2.5], [1.0, 2.5]); s.b.pose(addPose(POSE.thinking, idle(t, 4))); s.b.face({ ...EXPR.suspicious, pupil: [0.4, 0.2] }, t);
    camMove(s.stage, t, [[0, { pos: [0, 2.15, 3.0], look: [0, 1.9, 0], fov: 42 }], [info.dur, { pos: [0, 2.15, 2.6], look: [0, 1.95, 0], fov: 42 }]]); },
  overlay(g, t, info, s) { look(g, t, false); reactions(g, t, s, [{ fx: 'question', on: 'b', at: 0.15 }]); },
});
// s11 "You see, they were tame farm rabbits. They thought he was bringing dinner." — close on a bunny: heart eyes on "dinner"
registerShot('s11', { kind: '3d',
  init(T) { const s = meadow(T, {}); s.b = rabbit({ seed: 2, fur: 3, scale: 1.3 }); s.stage.add(s.b); s.r = warren(s.stage, 5, [-2, 2, -3, -1], 17); s.n = napoleon(); s.n.position.set(0.3, 0, 2.2); s.n.rotation.y = Math.PI; s.stage.add(s.n); return s; },
  draw(s, t, info) { s.update(t); const d = at(info, 'dinner', 3.0); s.b.update(t, { lid: t > d ? 0.05 : 0.6, look: [0, 0.8], hop: t > d ? 0.5 : 0 }); s.r.forEach(b => b.update(t, { look: [0, 0.6] }));
    s.n.pose(addPose(POSE.stand, idle(t))); s.n.face(EXPR.neutral, t);
    camMove(s.stage, t, [[0, { pos: [0.1, 1.9, 1.6], look: [0, 0.5, 0], fov: 44 }], [info.dur, { pos: [0.1, 1.7, 1.25], look: [0, 0.55, 0], fov: 44 }]], ease.sine); },
  overlay(g, t, info, s) { look(g, t); const d = at(info, 'dinner', 3.0), tm = at(info, 'tame', 0.6); tag(g, 'TAME FARM RABBITS', ease.out(prog(t, tm, tm + 0.3)), 0.16);
    reactions(g, t, s, [{ fx: 'heartEyes', on: 'b', at: d }, { fx: 'hearts', on: 'b', at: d + 0.05 }]); },
});
// s12 "He swats them with his riding crop." — the crop flails, the rabbits keep coming; sweat
registerShot('s12', { kind: '3d',
  init(T) { const s = meadow(T, { carriage: [3.6, 0, -3.2] }); s.n = napoleon(); s.stage.add(s.n); withCrop(s.n); s.r = warren(s.stage, 16, [-2, 2, -2, 2], 19); return s; },
  draw(s, t, info) { s.update(t); swarm(s.r, t, [0, 0], [0.55, 1.3]); s.n.pose(addPose({ ...POSE.stand, ...swat(t), lean: 0.1 }, tremble(t))); s.n.face(EXPR.angry, t);
    camMove(s.stage, t, [[0, { pos: [-1.2, 1.9, 4.0], look: [0, 1.2, 0], fov: 46 }], [info.dur, { pos: [-0.8, 1.8, 3.4], look: [0, 1.3, 0], fov: 46 }]], ease.sine); },
  overlay(g, t, info, s) { look(g, t); reactions(g, t, s, [{ fx: 'sweat', on: 'n', at: 0.4 }]); },
});
// s13 "The coachmen crack their whips." — a coachman cracks a whip in the air; the rabbits do not care (deadpan)
registerShot('s13', { kind: '3d',
  init(T) { const s = meadow(T, { carriage: [1.6, 0, -2.2], carRot: -0.15 }); s.c = coachman(0); s.c.position.set(-0.9, 0, 0); s.c.rotation.y = 0.5; s.stage.add(s.c); const w = withCrop(s.c); w.scale.set(1, 1.6, 1); s.r = warren(s.stage, 9, [-1.5, 2.5, 0.6, 2.2], 23); return s; },
  draw(s, t, info) { s.update(t); const cr = at(info, 'crack', 0.6); const k = ease.outBack(prog(t, cr - 0.2, cr + 0.1)) - ease.inOut(prog(t, cr + 0.3, cr + 0.8));
    s.c.pose(addPose({ ...POSE.stand, armR: [lerp(0.4, 2.8, k), 0.3, 0], elbowR: 0.2 }, idle(t, 5))); s.c.face(t > cr ? EXPR.shocked : EXPR.angry, t);
    s.r.forEach(b => { b.rotation.y = Math.atan2(-0.9 - b.position.x, 0 - b.position.z); b.update(t, { lid: 0.6, look: [0, 0.4] }); });
    camMove(s.stage, t, [[0, { pos: [0.5, 1.9, 5.6], look: [0, 1.3, 0.3], fov: 46 }], [info.dur, { pos: [0.4, 1.8, 5.0], look: [0, 1.3, 0.3], fov: 46 }]]); },
  overlay(g, t, info, s) { look(g, t); const cr = at(info, 'crack', 0.6); reactions(g, t, s, [{ fx: 'exclaim', on: 'c', at: cr }, { fx: 'flash', at: cr + 0.05, dur: 0.15 }, { fx: 'sweat', on: 'c', at: cr + 0.5 }]); },
});
// s14 "More rabbits." — wide high: the meadow fills, rabbits pouring in from every side
registerShot('s14', { kind: '3d',
  init(T) { const s = meadow(T, { carriage: [3.6, 0, -3.2], shadowSize: 16 }); s.n = napoleon(); s.stage.add(s.n); s.r = warren(s.stage, 50, [-9, 9, -10, 6], 29); return s; },
  draw(s, t, info) { s.update(t); charge(s.r, t, [0, 0], 0.15 + t * 0.35, { spread: 2.0 }); s.n.pose(addPose(POSE.panic, tremble(t, 2))); s.n.face(EXPR.panic, t);
    camMove(s.stage, t, [[0, { pos: [0, 9, 9], look: [0, 0, -1], fov: 50 }], [info.dur, { pos: [0, 10.5, 10], look: [0, 0, -1], fov: 52 }]]); },
  overlay(g, t, info, s) { look(g, t); reactions(g, t, s, [{ fx: 'exclaim', on: 'n', at: 0.1 }]); },
});
// s15 "Napoleon runs for his carriage. Reportedly, some jump in after him." — he runs and climbs in; rabbits hop in through the window
registerShot('s15', { kind: '3d',
  init(T) { const s = meadow(T, { carriage: [1.4, 0, -1.6], carRot: 0 }); s.n = napoleon(); s.stage.add(s.n); s.r = warren(s.stage, 14, [-4, 1, 0.5, 3], 31); s.j = [0, 1, 2].map(i => { const b = rabbit({ seed: 60 + i }); s.stage.add(b); return b; }); return s; },
  draw(s, t, info) { s.update(t); const sm = at(info, 'some', 2.75); const run1 = prog(t, 0, 1.6);
    const nx = lerp(-2.6, 1.55, ease.inOut(run1)), nz = lerp(1.6, -0.7, ease.inOut(run1)); s.n.visible = run1 < 1; s.n.position.set(nx, run1 > 0.9 ? (run1 - 0.9) * 6 : 0, nz); s.n.rotation.y = Math.atan2(1.55 + 2.6, -0.7 - 1.6); s.n.pose(run(t)); s.n.face(EXPR.panic, t);
    charge(s.r, t, [nx, nz + 0.4], ease.inOut(prog(t, 0, 2.0)) * 0.9, { spread: 1.0 });
    s.j.forEach((b, i) => { const k = prog(t, sm + i * 0.35, sm + i * 0.35 + 0.6); const x0 = -1.0 + i * 0.6, z0 = 1.4; b.visible = k < 1; b.position.set(lerp(x0, 1.55, k), Math.sin(Math.PI * k) * 2.3 + k * 0.9, lerp(z0, -0.9, k)); b.rotation.y = Math.atan2(1.55 - x0, -0.9 - z0); b.update(t, { hop: k > 0 ? 0 : 1 }); });
    s.car.position.y = t > 1.6 ? Math.abs(Math.sin(t * 9)) * 0.04 : 0;
    camMove(s.stage, t, [[0, { pos: [-0.8, 2.4, 7.2], look: [0, 1.3, -0.5], fov: 46 }], [info.dur, { pos: [-0.2, 2.3, 6.2], look: [0.6, 1.5, -1.0], fov: 46 }]], ease.sine); },
  overlay(g, t, info, s) { look(g, t); const sm = at(info, 'some', 2.75); reactions(g, t, s, [{ fx: 'sweat', on: 'n', at: 0.1, until: 1.5 }, { fx: 'question', on: s.car, at: sm + 1.3, scale: 0.9 }]); },
});
// s16 "The man who conquered Europe..." — beat: Napoleon hides on the carriage roof, hugging his knees; rabbits wait below
registerShot('s16', { kind: '3d',
  init(T) { const s = meadow(T, { carriage: [0, 0, 0], carRot: 0 }); s.n = napoleon(); s.n.position.set(0.1, 2.48 - 0.8, 0); s.stage.add(s.n);
    s.roof = [0, 1].map(i => { const b = rabbit({ seed: 70 + i }); b.position.set(i ? 0.8 : -0.7, 2.48, 0.25); s.stage.add(b); return b; }); s.r = warren(s.stage, 12, [-2.5, 2.5, 0.9, 2.4], 37); return s; },
  draw(s, t, info) { s.update(t); s.n.pose(addPose({ ...POSE.sit, armL: [1.0, 0.1, 0.6], armR: [1.0, 0.1, 0.6], elbowL: 1.2, elbowR: 1.2, headNod: 0.1 }, tremble(t))); s.n.face({ ...EXPR.sad, pupil: [0, 0] }, t);
    s.roof.forEach(b => { b.rotation.y = 0; b.update(t, { lid: 0.6, look: [0, 0] }); }); s.r.forEach(b => { b.rotation.y = Math.PI; b.update(t, { look: [0, 1] }); });
    camMove(s.stage, t, [[0, { pos: [0.1, 3.5, 5.8], look: [0.1, 2.9, 0], fov: 44 }], [info.dur, { pos: [0.1, 3.45, 5.1], look: [0.1, 2.95, 0], fov: 44 }]]); },
  overlay(g, t, info, s) { look(g, t, false); reactions(g, t, s, [{ fx: 'sweat', on: 'n', at: 0.4 }]); },
});
// s17 "defeated by bunnies." — FINAL SCORE card over the carriage scene
insertShot('s17', { scene: { init(T) { const s = meadow(T, { carriage: [0, 0, 0], carRot: 0 }); s.r = warren(s.stage, 12, [-2.5, 2.5, 0.9, 2.2], 37); return s; }, draw(s, t) { s.update(t); s.r.forEach(b => b.update(t, {})); camMove(s.stage, t, [[0, { pos: [0.1, 3.45, 5.1], look: [0.1, 2.95, 0], fov: 44 }]]); } },
  insert: { type: 'versus', title: 'FINAL SCORE', lines: ['BUNNIES  1', 'NAPOLEON  0'], colorL: '#f2a0b8', color: '#2a4a9a' } });
// s18 "Subscribe for more." — the hat-wearing bunny on the roof, sparkle; the camera drifts down into the swarm (loop to frame 1)
registerShot('s18', { kind: '3d',
  init(T) { const s = meadow(T, { carriage: [3.6, 0, -3.2] }); s.b = rabbit({ seed: 4, fur: 0, scale: 1.2 }); s.b.position.set(0, 0, 0.6); s.stage.add(s.b); const h = bicorne(); h.scale.setScalar(0.42); h.position.set(0, 0.38, 0.02); s.b.head.add(h);
    s.r = warren(s.stage, 18, [-2, 2, -2, 0.2], 3); return s; },
  draw(s, t, info) { s.update(t); s.b.update(t, { lid: 0.6, look: [0, 0] }); s.r.forEach(b => b.update(t, { hop: 1, speed: 2.5 }));
    camMove(s.stage, t, [[0, { pos: [0.1, 1.3, 2.6], look: [0, 0.8, 0.6], fov: 42 }], [info.dur, { pos: [0.3, 2.3, 6.2], look: [0, 1.4, 0], fov: 46 }]], ease.inOut); },
  overlay(g, t, info, s) { look(g, t); reactions(g, t, s, [{ fx: 'sparkle', on: 'b', at: 0.1, scale: 0.7 }]); },
});
