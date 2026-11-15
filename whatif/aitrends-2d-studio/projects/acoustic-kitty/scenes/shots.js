// acoustic-kitty: LOL. Smug spy cat -> Operation Acoustic Kitty -> x-ray gadgets -> "millions" -> park mission -> distracted, hungry
// -> the memo -> payoff: the cat knocks a glass off the table, staring at the lens (cuts back to frame 1).
import { registerShot, ease, prog, clamp, lerp, E, text, alpha } from '/engine/core.js';
import { THREE, camMove, cyl, ball, outline, rbox } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle } from '/kits/toon3d/rig.js';
import { reactions, shakeCam, anchor } from '/kits/toon3d/react.js';
import { insertShot } from '/kits/toon3d/insert.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import * as PR from '/kits/toon3d/props.js';
import { at, spyCat, guest, agent, embassy, glass, park, bench, butterfly } from './_lib.js';

const SMUG = { lid: 0.62, look: [0, 0] };
function partyRig(T, o = {}) { const s = embassy(T, { target: [0, 0, 0], shadowSize: 7, ...o }); s.g = [];
  [[-2.4, -2.2, 0.5], [-1.2, -3.6, -0.3], [1.6, -3.0, -0.6], [2.6, -1.4, -1.2], [-3.4, -0.6, 1.0]].forEach(([x, z, r], i) => { const b = guest(i); b.position.set(x, 0, z); b.rotation.y = r; s.stage.add(b); s.g.push(b); });
  s.cat = spyCat(); s.stage.add(s.cat); return s; }
function partyGuests(s, t) { s.g.forEach((b, i) => { b.pose(addPose(i % 2 ? POSE.relaxed : { ...POSE.holdFront, armL: POSE.stand.armL, elbowL: 0.1 }, idle(t, i + 1))); b.face({ ...EXPR.smug, talk: i % 3 === 0 ? 0.6 : 0 }, t); }); }

// k1 (frame 1): the smug spy cat strolling through the embassy party, earpiece in, guests oblivious
registerShot('k1', { kind: '3d',
  init(T) { return partyRig(T); },
  draw(s, t, info) { partyGuests(s, t); const x = lerp(-1.2, 0.6, t / info.dur); s.cat.position.set(x, Math.abs(Math.sin(t * 7)) * 0.06, 1.2); s.cat.rotation.set(0, 0.9 + Math.sin(t * 7) * 0.08, Math.sin(t * 7) * 0.05);
    s.cat.update(t, { ...SMUG, look: [-0.6, 0], headTurn: -0.7, tail: 1.2 });
    camMove(s.stage, t, [[0, { pos: [x + 1.2, 1.5, 6.2], look: [x - 0.3, 1.2, 0.4], fov: 40 }], [info.dur, { pos: [x + 1.2, 1.4, 5.4], look: [x - 0.2, 1.0, 0.6], fov: 40 }]]); },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'sparkle', on: 'cat', at: 0.0, scale: 0.8 }]); },
});
// k2 "In the 1960s" : title card over the party
insertShot('k2', { scene: { init(T) { return partyRig(T); }, draw(s, t) { partyGuests(s, t); s.cat.position.set(0.6, 0, 1.2); s.cat.update(t, SMUG); s.stage.cam([0, 2.2, 7], [0, 1.4, 0], 42); } },
  insert: { type: 'bigtext', kicker: 'CIA, 1960s', title: 'OPERATION', lines: ['ACOUSTIC KITTY'], size: 130 } });
// k3/k3b cartoon x-ray: blue scan, glowing outlines, labels pop on "microphone" and "antenna"
function xray(g, t, s, mic, ant) { g.save(); g.fillStyle = 'rgba(10,40,90,0.55)'; g.fillRect(0, 0, E.W, E.H);
  g.strokeStyle = 'rgba(120,220,255,0.18)'; g.lineWidth = 2; for (let y = (t * 300) % 60; y < E.H; y += 60) { g.beginPath(); g.moveTo(0, y); g.lineTo(E.W, y); g.stroke(); }
  const sy = (t * 900) % (E.H + 200) - 100; g.fillStyle = 'rgba(140,240,255,0.25)'; g.fillRect(0, sy, E.W, 18); g.restore();
  const lab = (p, txt, k, dx, dy) => { if (k <= 0) return; const c = ease.outBack(clamp(k)); g.save(); g.strokeStyle = '#7ef0ff'; g.lineWidth = 6; g.beginPath(); g.arc(p.x, p.y, 34 * c, 0, 6.283); g.stroke(); g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(p.x + dx * c, p.y + dy * c); g.stroke();
    text(g, txt, p.x + dx * c, p.y + dy * c - 40, { size: 70 * c, color: '#7ef0ff', stroke: 12, strokeColor: '#0a1830', weight: 700 }); g.restore(); };
  const v = new THREE.Vector3(); s.cat.earpiece.getWorldPosition(v); const ear = anchor(s.stage, [v.x, v.y, v.z]);
  s.cat.getWorldPosition(v); const back = anchor(s.stage, [v.x - 0.05, v.y + 0.75, v.z - 0.25]);
  lab({ x: ear.cx, y: ear.cy }, 'MIC', mic, Math.min(180, E.W - 150 - ear.cx), -300); lab({ x: back.cx, y: back.cy }, 'ANTENNA', ant, Math.max(-220, 230 - back.cx), -360);
  if (ant > 0) { g.save(); g.strokeStyle = '#7ef0ff'; g.lineWidth = 7; g.setLineDash([18, 12]); g.beginPath(); g.moveTo(ear.cx, ear.cy); g.quadraticCurveTo((ear.cx + back.cx) / 2 + 60, (ear.cy + back.cy) / 2 + 80, back.cx - 80 * clamp(ant), back.cy + 140 * clamp(ant)); g.stroke(); g.restore(); } }
const lab = { init(T) { const s = embassy(T, { target: [0, 0, 0], shadowSize: 5 }); s.cat = spyCat(); s.cat.position.set(0, 0, 1.2); s.stage.add(s.cat); return s; } };
registerShot('k3', { kind: '3d', init: lab.init,
  draw(s, t, info) { s.cat.update(t, { lid: 0.5, look: [0.3, 0] }); s.cat.rotation.y = 0.5;
    camMove(s.stage, t, [[0, { pos: [0.9, 1.15, 3.0], look: [0.1, 1.0, 1.2], fov: 34 }], [info.dur, { pos: [0.8, 1.15, 2.6], look: [0.1, 1.0, 1.2], fov: 34 }]]); },
  overlay(g, t, info, s) { xray(g, t, s, prog(t, at(info, 'microphone', 0.3) - 0.1, at(info, 'microphone', 0.3) + 0.3), 0); },
});
registerShot('k3b', { kind: '3d', init: lab.init,
  draw(s, t, info) { s.cat.update(t, { lid: 0.7, look: [0.5, 0], tail: 1.5 }); s.cat.rotation.y = 1.2;
    camMove(s.stage, t, [[0, { pos: [1.6, 1.6, 3.2], look: [0, 0.8, 1.2], fov: 36 }], [info.dur, { pos: [1.4, 1.6, 2.8], look: [0, 0.8, 1.2], fov: 36 }]]); },
  overlay(g, t, info, s) { xray(g, t, s, 1, prog(t, at(info, 'antenna', 0.2) - 0.1, at(info, 'antenna', 0.2) + 0.35)); },
});
// k4 "Reportedly, it cost millions of dollars." : big money card over the smug cat
insertShot('k4', { scene: { init: lab.init, draw(s, t) { s.cat.update(t, { lid: 0.65, look: [0, 0] }); s.cat.rotation.y = 0.2; s.stage.cam([0.3, 1.2, 3.4], [0, 1.0, 1.2], 36); } },
  insert: { type: 'bigtext', kicker: 'COST (REPORTEDLY)', title: '$ MILLIONS', lines: ['for one cat'], color: '#5fd35a' } });
// k5 "First mission:" : an agent in the bushes with headphones
registerShot('k5', { kind: '3d',
  init(T) { const s = park(T, { target: [0, 0, 0] }); s.a = agent(); s.a.position.set(0, 0, 0.5); s.stage.add(s.a); s.hp = new THREE.Group(); s.hp.add(cyl(0.03, 0.03, 1.0, '#202028', 0, 0.42, 0, 8)); s.hp.children[0].rotation.z = Math.PI / 2;
    for (const x of [-1, 1]) s.hp.add(cyl(0.14, 0.14, 0.1, '#202028', x * 0.5, 0, 0, 14)); s.hp.children.slice(1).forEach(m => m.rotation.z = Math.PI / 2); outline(s.hp, { px: 2 }); s.a.parts.head.add(s.hp);
    s.bush = new THREE.Group(); for (let k = 0; k < 5; k++) s.bush.add(ball(0.7, '#3f8a34', (k - 2) * 0.55, 0.6 + (k % 2) * 0.2, 0, 14)); outline(s.bush, { px: 2.4 }); s.bush.position.set(0, 0, 1.4); s.stage.add(s.bush); return s; },
  draw(s, t, info) { s.update(t); s.a.pose(addPose({ ...POSE.stand, armR: [1.0, 0.6, 0.6], elbowR: 2.2 }, idle(t, 3))); s.a.face({ ...EXPR.suspicious, pupil: [-0.6, 0] }, t);
    camMove(s.stage, t, [[0, { pos: [0.3, 2.2, 5.0], look: [0, 1.9, 0.5], fov: 34 }], [info.dur, { pos: [0.25, 2.2, 4.4], look: [0, 1.95, 0.5], fov: 34 }]]); },
  overlay(g, t) { sunnyLook(g, t, { rays: false }); },
});
// k6 "spy on two men in a park." : wide, two men on a bench, the cat sitting nearby looking official
function benchRig(T) { const s = park(T, { target: [0, 0, 0], shadowSize: 8 }); s.b = bench(); s.b.position.set(0, 0, -1); s.stage.add(s.b);
  s.m = [0, 1].map(i => { const m = guest(i + 5, { colors: { main: ['#5a5a62', '#3a4a5a'][i], shirt: '#f4f2ec', lanyard: '#5a5a62', legsTop: '#2a2a30' }, head: 'cap', headColor: '#3a3a40' }); m.position.set(i ? 0.6 : -0.6, 0.15, -1.0); s.stage.add(m); return m; });
  s.cat = spyCat(); s.cat.position.set(1.8, 0, 0.6); s.cat.rotation.y = -0.6; s.stage.add(s.cat); return s; }
const sitBench = (m, t, i) => { m.pose(addPose({ ...POSE.sit }, idle(t, i + 4))); m.face({ ...EXPR.neutral, talk: i ? 0 : 0.7, pupil: [i ? -0.5 : 0.5, 0] }, t); };
registerShot('k6', { kind: '3d', init: benchRig,
  draw(s, t, info) { s.update(t); s.m.forEach((m, i) => sitBench(m, t, i)); s.cat.update(t, { lid: 0.45, look: [-0.5, 0], headTurn: -0.3 });
    camMove(s.stage, t, [[0, { pos: [2.5, 2.4, 6.5], look: [0.6, 1.0, -0.2], fov: 40 }], [info.dur, { pos: [2.2, 2.2, 5.8], look: [0.8, 0.9, 0], fov: 40 }]]); },
  overlay(g, t) { sunnyLook(g, t, { rays: { from: [-60, -80], strength: 0.7 } }); },
});
// k7 "The cat had other plans..." : close on the cat; a butterfly drifts past; it turns away from the mission
registerShot('k7', { kind: '3d', init: benchRig,
  draw(s, t, info) { s.update(t); s.m.forEach((m, i) => sitBench(m, t, i)); const k = ease.inOut(prog(t, 0.6, 1.2)); s.cat.update(t, { lid: lerp(0.45, 0.05, k), look: [lerp(-0.5, 0.6, k), 0.3 * k], headTurn: lerp(-0.3, 0.6, k), headTilt: 0.2 * k, tail: 1 + k });
    camMove(s.stage, t, [[0, { pos: [1.8, 1.0, 3.4], look: [1.8, 0.85, 0.6], fov: 34 }], [info.dur, { pos: [1.8, 1.0, 3.0], look: [1.8, 0.75, 0.6], fov: 34 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: false }); const a = anchor(s.stage, s.cat); butterfly(g, a.cx + lerp(-450, 380, t / info.dur), a.cy - 300 + Math.sin(t * 4) * 70, 210, t);
    reactions(g, t, s, [{ fx: 'exclaim', on: 'cat', at: 0.7, until: 1.4 }]); },
});
// k8 "it kept getting distracted." : the cat bounds off after the butterfly, the spies keep talking
registerShot('k8', { kind: '3d', init: benchRig,
  draw(s, t, info) { s.update(t); s.m.forEach((m, i) => sitBench(m, t, i)); const x = lerp(1.8, 6, t / info.dur); s.cat.position.set(x, Math.abs(Math.sin(t * 9)) * 0.35, 0.6 + t * 0.6); s.cat.rotation.y = 1.4; s.cat.update(t, { lid: 0.05, look: [0.3, 0.4], tail: 2, earsBack: 0.4 });
    camMove(s.stage, t, [[0, { pos: [3.0, 1.6, 6.0], look: [2.6, 0.8, 0.6], fov: 40 }], [info.dur, { pos: [4.0, 1.6, 6.0], look: [4.6, 0.8, 0.9], fov: 40 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: false }); const a = anchor(s.stage, s.cat); butterfly(g, a.cx + 220 + Math.sin(t * 3) * 60, a.cy - 260 + Math.sin(t * 5) * 80, 150, t); },
});
// k9 "And hungry." : the cat face-first in a bowl of fish, very happy
registerShot('k9', { kind: '3d',
  init(T) { const s = park(T, { target: [0, 0, 0], shadowSize: 5 }); s.cat = spyCat(); s.cat.position.set(0, 0, 0.6); s.stage.add(s.cat); const b = new THREE.Group(); b.add(cyl(0.3, 0.22, 0.16, '#d8342c', 0, 0.08, 0, 20));
    for (let i = 0; i < 3; i++) { const f = ball(0.09, '#e8a87a', (i - 1) * 0.12, 0.2, 0, 10); f.scale.set(1.8, 0.8, 0.8); b.add(f); } outline(b, { px: 2.2 }); b.position.set(0, 0, 1.25); s.stage.add(b); return s; },
  draw(s, t, info) { s.update(t); s.cat.update(t, { lid: 0.85, look: [0, -0.6], headTilt: 0.1, tail: 1.6 }); s.cat.headG.rotation.x = 0.35 + Math.abs(Math.sin(t * 8)) * 0.15;
    camMove(s.stage, t, [[0, { pos: [0.4, 1.0, 3.2], look: [0, 0.6, 0.9], fov: 34 }], [info.dur, { pos: [0.35, 1.0, 2.8], look: [0, 0.6, 0.9], fov: 34 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: false }); reactions(g, t, s, [{ fx: 'hearts', on: 'cat', at: 0.1 }]); },
});
// k10 "The CIA's memo:" : an agent at a desk reads the memo, facepalm
registerShot('k10', { kind: '3d',
  init(T) { const s = embassy(T, { target: [0, 0, 0], shadowSize: 5 }); s.a = agent(); s.a.position.set(0, 0, 0.6); s.stage.add(s.a); const d = PR.table({ w: 2, d: 1, h: 1.0, color: '#6a4228' }); d.position.set(0, 0, 1.5); s.stage.add(d);
    const p = PR.papers({ n: 3, seed: 4, spread: 0.5 }); p.position.set(0, 1.02, 1.5); s.stage.add(p); return s; },
  draw(s, t, info) { const k = ease.outBack(prog(t, 0.3, 0.7)); s.a.pose(mixPose({ ...POSE.holdFront, headNod: 0.3 }, POSE.facepalm, k)); s.a.face(mixExpr({ ...EXPR.neutral, pupil: [0, -0.6] }, { ...EXPR.deadpan, lid: 0.8 }, k), t);
    camMove(s.stage, t, [[0, { pos: [0, 2.2, 4.6], look: [0, 1.7, 0.8], fov: 36 }], [info.dur, { pos: [0, 2.2, 4.1], look: [0, 1.75, 0.8], fov: 36 }]]); },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'sweat', on: 'a', at: 0.5 }]); },
});
// k11 memo document card
insertShot('k11', { insert: { type: 'document', title: 'CIA MEMO, 1967', lines: ['"Views on Trained Cats"', '...the program would', '"not lend itself"', 'to our "highly', 'specialized needs."'], highlight: 2, color: '#2b4a7a' } });
// k12 "Translation..." : back at the embassy, the cat sits on the drinks table next to a glass, staring at the lens
function tableRig(T) { const s = embassy(T, { target: [0, 0, 0], shadowSize: 5 }); const tb = PR.table({ w: 1.6, d: 0.8, h: 1.0, color: '#f4f0e6' }); tb.position.set(0, 0, 1.0); s.stage.add(tb);
  s.cat = spyCat(); s.cat.position.set(-0.25, 1.06, 1.0); s.stage.add(s.cat); s.gl = glass(0.3, 1.06, 1.3); s.gl.scale.setScalar(1.7); s.stage.add(s.gl); return s; }
registerShot('k12', { kind: '3d', init: tableRig,
  draw(s, t, info) { s.cat.update(t, { lid: 0.62, look: [0, 0], tail: 0.4 }); s.cat.paw.position.set(0.2, 0.1, 0.3);
    camMove(s.stage, t, [[0, { pos: [0.05, 1.8, 6.6], look: [0.05, 1.55, 1.0], fov: 34 }], [info.dur, { pos: [0.05, 1.8, 6.0], look: [0.05, 1.55, 1.0], fov: 34 }]]); },
});
// k13 "you can't train a cat." : the paw slowly pushes the glass... off. Staring at the lens the whole time. (glass falls out of frame; crash is sound only)
registerShot('k13', { kind: '3d', init: tableRig,
  draw(s, t, info) { const push = at(info, 'cat.', 1.25); const k = ease.inOut(prog(t, 0.1, push)); s.cat.update(t, { lid: 0.62, look: [0, 0], tail: 0.4, blink: false });
    s.cat.paw.position.set(lerp(0.2, 0.75, k), 0.1 + Math.sin(k * Math.PI) * 0.05, lerp(0.3, 0.4, k));
    const ft = Math.max(0, t - push); const gx = 0.3 + 0.35 * k + ft * 0.8; const gy = 1.06 - 4.9 * ft * ft; s.gl.position.set(gx, Math.max(-2, gy), 1.3); s.gl.rotation.z = -ft * 7;
    camMove(s.stage, t, [[0, { pos: [0.05, 1.75, 6.2], look: [0.05, 1.5, 1.0], fov: 34 }], [info.dur, { pos: [0.05, 1.75, 5.8], look: [0.05, 1.5, 1.0], fov: 34 }]]); },
});
