// no-mosquitoes: WTF (debate). Swarm vanishes -> good news (malaria) -> bad news (Arctic birds) -> another scientist disagrees
// -> chocolate is safe (midges) -> the verdict (Nature / CDC) -> one mosquito comes back (loop).
import { registerShot, ease, prog, clamp, lerp } from '/engine/core.js';
import { THREE, camMove, rbox, outline } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, tremble, shrug } from '/kits/toon3d/rig.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { insertShot } from '/kits/toon3d/insert.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import { at, camper, camp, bird, tundra, cacaoTree, swarm, mosquito, anchor } from './_lib.js';

const WARM = { rays: { from: [-60, -80], strength: 0.9 }, tint: '#ffb87a' };
const SIT = { ...POSE.sit };
function campRig(T, o = {}) { const s = camp(T, { target: [0, 0, 0], shadowSize: 7, ...o }); s.c = camper(); s.c.position.set(0, 0, 0.35); s.stage.add(s.c); return s; }
const sitPose = (base, extra = {}) => addPose(base, extra);   // (he stands by the fire)

// b1 (frame 1, loop target): a giant swarm around the camper, already swirling, blinking out mosquito by mosquito
registerShot('b1', { kind: '3d',
  init(T) { return campRig(T); },
  draw(s, t, info) { s.update(t); const calm = prog(t, 1.7, 2.0);
    s.c.pose(sitPose(mixPose({ ...POSE.panic, armL: [0.6, 2.0 + Math.sin(t * 13) * 0.5, 0.3], armR: [0.6, 2.0 + Math.cos(t * 11) * 0.5, 0.3] }, POSE.stand, calm), { ...tremble(t, 2 * (1 - calm)), headTurn: Math.sin(t * 9) * 0.3 * (1 - calm) }));
    s.c.face(mixExpr(EXPR.panic, { ...EXPR.shocked, pupil: [0.3, 0.6] }, calm), t);
    camMove(s.stage, t, [[0, { pos: [0.3, 1.9, 5.6], look: [0, 1.95, 0.35], fov: 44 }], [info.dur, { pos: [0.2, 1.9, 4.6], look: [0, 1.95, 0.35], fov: 42 }]], ease.out); },
  overlay(g, t, info, s) { sunnyLook(g, t, WARM); const a = anchor(s.stage, s.c);
    swarm(g, t, { x: a.cx, y: a.cy - a.s * 0.4 }, { n: 95, rx: 520, ry: 560, seed: 4, size: 1.6, vanish: (i, r) => 0.45 + r * 1.35 });
    reactions(g, t, s, [{ fx: 'question', on: 'c', at: 1.95 }]); },
});
// b2 "Good news" : the camper throws his arms up, free
registerShot('b2', { kind: '3d',
  init(T) { return campRig(T, { seed: 22 }); },
  draw(s, t, info) { s.update(t + 2); s.c.pose(sitPose(POSE.armsUp, idle(t, 2))); s.c.face(EXPR.grin, t);
    camMove(s.stage, t, [[0, { pos: [-0.6, 1.7, 4.2], look: [0, 1.9, 0.35], fov: 40 }], [info.dur, { pos: [-0.5, 1.75, 3.8], look: [0, 1.95, 0.35], fov: 40 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, WARM); reactions(g, t, s, [{ fx: 'sparkle', on: 'c', at: 0.1 }, { fx: 'stars', on: 'c', at: 0.2 }]); },
});
// b3 malaria card (no VO number: the card carries the WHO figure)
insertShot('b3', { scene: { init(T) { return campRig(T, { seed: 23 }); }, draw(s, t) { s.update(t); s.c.pose(sitPose(POSE.relaxed)); s.c.face(EXPR.happy, t); s.stage.cam([0, 1.8, 5], [0, 1.6, 0.3], 42); } },
  insert: { type: 'counter', title: 'MALARIA CASES IN 2024', value: 282, suffix: ' MILLION', lines: ['WHO estimate, spread by mosquitoes'], color: '#ff5a4a' } });
// tundra birds
function flock(st, n, seed) { const out = []; for (let i = 0; i < n; i++) { const b = bird({ seed: seed + i, scale: 0.9 + (i % 3) * 0.1, color: ['#b48a5a', '#9a7a52', '#c09868'][i % 3] }); const a = i * 2.39; b.position.set(Math.cos(a) * (1.2 + i * 0.35), 0, Math.sin(a) * (1.0 + i * 0.3) - 1); b.rotation.y = (i % 2 ? -0.5 : 0.5) + 0.2 * Math.sin(i); st.add(b); out.push(b); } return out; }
// b4 "Bad news? One scientist says" : the tundra, birds look up at an empty sky
registerShot('b4', { kind: '3d',
  init(T) { const s = tundra(T); s.f = flock(s.stage, 9, 40); s.b = s.f[0]; return s; },
  draw(s, t, info) { s.update(t); s.f.forEach((b, i) => b.update(t, { look: Math.sin(t * 2 + i) * 0.5, ph: i * 0.4, hop: i % 3 === 0 ? 0.6 : 0 }));
    camMove(s.stage, t, [[0, { pos: [0, 1.6, 7.5], look: [0, 0.8, -1], fov: 40 }], [info.dur, { pos: [0, 1.4, 6.3], look: [0, 0.8, -1], fov: 40 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: false, tint: '#cfe4ff' }); reactions(g, t, s, [{ fx: 'question', on: 'b', at: 0.2 }]); },
});
// b5 close: one bird, worried, sweating, "could drop by half"
registerShot('b5', { kind: '3d',
  init(T) { const s = tundra(T); s.b = bird({ seed: 3, scale: 1 }); s.b.rotation.y = 0.35; s.stage.add(s.b); s.b2 = bird({ seed: 4, color: '#9a7a52' }); s.b2.position.set(-0.9, 0, -0.8); s.b2.rotation.y = 0.8; s.stage.add(s.b2); return s; },
  draw(s, t, info) { s.update(t); s.b.update(t, { look: Math.sin(t * 3) * 0.6 }); s.b2.update(t, { look: -0.4 });
    camMove(s.stage, t, [[0, { pos: [0.5, 1.0, 2.6], look: [0, 0.75, 0], fov: 34 }], [info.dur, { pos: [0.4, 1.0, 2.2], look: [0, 0.75, 0], fov: 34 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: false, tint: '#cfe4ff' }); reactions(g, t, s, [{ fx: 'sweat', on: 'b', at: 0.3 }, { fx: 'exclaim', on: 'b', at: at(info, 'half', 1.4) }]); },
});
// b6 card: -50% (one scientist's estimate)
insertShot('b6', { scene: { init(T) { const s = tundra(T); s.f = flock(s.stage, 9, 40); return s; }, draw(s, t) { s.update(t); s.f.forEach((b, i) => b.update(t, { ph: i })); s.stage.cam([0, 1.5, 7], [0, 0.8, -1], 40); } },
  insert: { type: 'counter', title: 'TUNDRA NESTING BIRDS', value: 50, prefix: '-', suffix: '%', lines: ["one scientist's estimate"], color: '#ff5a4a' } });
// b7 "Another says those birds eat more midges anyway" : the bird snapping happily at a cloud of midges
registerShot('b7', { kind: '3d',
  init(T) { const s = tundra(T); s.b = bird({ seed: 3 }); s.b.rotation.y = 0.5; s.stage.add(s.b); return s; },
  draw(s, t, info) { s.update(t); s.b.update(t, { peck: 0.6, hop: 1 }); s.b.head.rotation.x -= 0.5;
    camMove(s.stage, t, [[0, { pos: [0.6, 1.0, 2.8], look: [0.1, 0.95, 0], fov: 36 }], [info.dur, { pos: [0.5, 1.0, 2.4], look: [0.1, 0.95, 0], fov: 36 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: false, tint: '#cfe4ff' }); const a = anchor(s.stage, s.b); swarm(g, t, { x: a.cx + 60, y: a.cy - 200 }, { n: 26, rx: 200, ry: 120, seed: 9, size: 0.45 });
    reactions(g, t, s, [{ fx: 'heartEyes', on: 'b', at: at(info, 'midges', 0.8) }, { fx: 'hearts', on: 'b', at: at(info, 'midges', 0.8) }]); },
});
// b8 versus card: the debate
insertShot('b8', { insert: { type: 'versus', title: 'SCIENTISTS DISAGREE', lines: ['BIRDS -50%', 'MIDGES! FINE'], colorL: '#d8342c', color: '#3f9a2e' } });
// b9 "Chocolate? Safe." : the camper hugging a chocolate bar, panic -> relief
function bar() { const g = new THREE.Group(); g.add(rbox(0.55, 0.09, 0.3, '#5a3220', 0, 0, 0, 0.02)); g.add(rbox(0.3, 0.1, 0.32, '#c9c4bc', 0.14, 0, 0, 0.02)); g.add(rbox(0.12, 0.105, 0.325, '#d8342c', 0.14, 0, 0, 0.01)); outline(g, { px: 2.2 }); return g; }
registerShot('b9', { kind: '3d',
  init(T) { const s = campRig(T, { seed: 24 }); s.bar = bar(); s.bar.position.set(0, -0.15, 0.1); s.bar.rotation.set(1.3, 0, 0.3); s.c.hold('R', s.bar); return s; },
  draw(s, t, info) { s.update(t); const safe = at(info, 'safe.', 0.6); const k = ease.out(prog(t, safe - 0.05, safe + 0.25));
    s.c.pose(sitPose(mixPose({ ...POSE.holdFront, armR: [1.0, 0.1, 0.4], elbowR: 1.6 }, { ...POSE.holdFront, armR: [1.2, 0.1, 0.4], elbowR: 2.1, headTilt: 0.15 }, k), tremble(t, 1.5 * (1 - k))));
    s.c.face(mixExpr(EXPR.worried, EXPR.happy, k), t);
    camMove(s.stage, t, [[0, { pos: [0.2, 1.9, 4.6], look: [0, 1.75, 0.35], fov: 36 }], [info.dur, { pos: [0.15, 1.9, 4.1], look: [0, 1.8, 0.35], fov: 36 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, WARM); reactions(g, t, s, [{ fx: 'sweat', on: 'c', at: 0.05, until: at(info, 'safe.', 0.6) }, { fx: 'sparkle', on: 'c', at: at(info, 'safe.', 0.6) }]); },
});
// b10 "Midges pollinate it, not mosquitoes." : a cacao tree, tiny midges dancing round a pod
registerShot('b10', { kind: '3d',
  init(T) { const s = camp(T, { target: [0, 0, 0], seed: 25 }); s.tree = cacaoTree(); s.tree.position.set(0.6, 0, -0.8); s.stage.add(s.tree); return s; },
  draw(s, t, info) { s.update(t); camMove(s.stage, t, [[0, { pos: [0.9, 1.5, 6.4], look: [0.5, 1.6, -0.8], fov: 34 }], [info.dur, { pos: [0.8, 1.45, 5.0], look: [0.5, 1.5, -0.8], fov: 32 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, WARM); const p = new THREE.Vector3(); s.tree.pods[0].getWorldPosition(p); const a = anchor(s.stage, [p.x, p.y, p.z]);
    swarm(g, t, { x: a.cx, y: a.cy }, { n: 14, rx: 150, ry: 130, seed: 12, size: 0.4 }); reactions(g, t, s, [{ fx: 'sparkle', on: [p.x, p.y, p.z], at: 0.2 }]); },
});
// b11 "The verdict?" : the camper by the fire, suspicious look at the lens
registerShot('b11', { kind: '3d',
  init(T) { return campRig(T, { seed: 26 }); },
  draw(s, t, info) { s.update(t); s.c.pose(sitPose(POSE.thinking, idle(t, 4))); s.c.face({ ...EXPR.suspicious, pupil: [0, 0] }, t);
    camMove(s.stage, t, [[0, { pos: [1.2, 1.9, 4.2], look: [0.3, 1.8, 0.35], fov: 38 }], [info.dur, { pos: [1.0, 1.9, 3.7], look: [0.3, 1.85, 0.35], fov: 38 }]]); },
  overlay(g, t) { sunnyLook(g, t, WARM); },
});
// b12 Nature document card
insertShot('b12', { scene: { init(T) { return campRig(T, { seed: 27 }); }, draw(s, t) { s.update(t); s.c.pose(sitPose(POSE.thinking)); s.c.face(EXPR.suspicious, t); s.stage.cam([0, 1.8, 5], [0, 1.6, 0.3], 42); } },
  insert: { type: 'document', title: 'NATURE, 2010', lines: ['"A world without', 'mosquitoes"', '', 'Verdict, from a', 'CDC entomologist:'], highlight: 4, color: '#d8342c' } });
// b13 quote part 1 "It's a complicated business," : big shrug
registerShot('b13', { kind: '3d',
  init(T) { return campRig(T, { seed: 28 }); },
  draw(s, t, info) { s.update(t); s.c.pose(sitPose(shrug(POSE.stand, ease.outBack(prog(t, 0.1, 0.5))), idle(t, 5))); s.c.face({ ...EXPR.deadpan, browL: 0.4, mouth: 'smirk' }, t);
    camMove(s.stage, t, [[0, { pos: [0, 1.85, 4.6], look: [0, 1.8, 0.35], fov: 40 }], [info.dur, { pos: [0, 1.85, 4.2], look: [0, 1.85, 0.35], fov: 40 }]]); },
  overlay(g, t) { sunnyLook(g, t, WARM); },
});
// b14 "...and that's why we still have mosquitoes." : ONE mosquito flies back in and lands on his nose (cuts back to the swarm = loop)
registerShot('b14', { kind: '3d',
  init(T) { return campRig(T, { seed: 29 }); },
  draw(s, t, info) { s.update(t); const land = at(info, 'mosquitoes."', 0.95); const k = prog(t, land, land + 0.2);
    s.c.pose(sitPose(POSE.stand, { ...idle(t, 6), headNod: -0.05 })); s.c.face(mixExpr({ ...EXPR.bored, pupil: [0.5, 0.3] }, { ...EXPR.shocked, pupil: [0, -0.6], pupilSize: 0.6 }, k), t);
    camMove(s.stage, t, [[0, { pos: [0, 2.05, 3.4], look: [0, 2.05, 0.35], fov: 34 }], [info.dur, { pos: [0, 2.08, 2.7], look: [0, 2.08, 0.35], fov: 34 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: land, amp: 0.04, dur: 0.3 }]); },
  overlay(g, t, info, s) { sunnyLook(g, t, WARM); const land = at(info, 'mosquitoes."', 0.95); const a = anchor(s.stage, s.c); const nose = { x: a.cx, y: a.cy + a.s * 0.15 };
    const k = ease.inOut(prog(t, 0, land)); const x = lerp(nose.x + 600, nose.x + 30, k) + Math.sin(t * 9) * 40 * (1 - k), y = lerp(nose.y - 500, nose.y - 10, k) + Math.cos(t * 7) * 50 * (1 - k);
    mosquito(g, x, y, 46, Math.sin(t * 60), -1); reactions(g, t, s, [{ fx: 'exclaim', on: 'c', at: land }]); },
});
