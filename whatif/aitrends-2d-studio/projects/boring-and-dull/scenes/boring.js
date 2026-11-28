// Boring & Dull — 20 shots, Toon 3D. Deadpan narrator; the jokes are the yawning signs and the very calm "celebrations".
// s01 = frame 1 (already moving: the signs mid-yawn, top caption 0-3.5 s); s20 ends on frame 1's camera + faces -> loop.
import { registerShot, ease, prog, clamp, lerp, E } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, walk } from '/kits/toon3d/rig.js';
import { shakeCam, anchor } from '/kits/toon3d/react.js';
import { insertShot } from '/kits/toon3d/insert.js';
import { at, fxr, chip, stamp, callout, THREE, toonStage, sign, SIGN, yawnK, cape, roadside, village, outback, hall, bicycle, bagpipe, person,
  topCaption, bulb, calendar, sadConfetti, heroRays, PR, rbox, cyl, ball, outline, toon, canvasTex } from './_lib.js';

const gt = (info, t) => info.shot.start + t;
// ---------------------------------------------------------------- the roadside with both signs (frame 1 / ceremony / party / league / loop)
function signScene(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 8, target: [0, 1, 0], ...(o.stage || {}) }); const set = roadside(st, { seed: 3 });
  const B = sign(SIGN.boring); B.position.set(-1.07, 0, 0); B.rotation.y = 0.08; st.add(B);
  const D = sign(SIGN.dull); D.position.set(1.07, 0, 0); D.rotation.y = -0.08; st.add(D);
  const L = sign(SIGN.bland); L.position.set(3.4, 0, -0.3); L.rotation.y = -0.15; L.visible = !!o.bland; st.add(L);
  return { stage: st, set, B, D, L };
}
// sleepy idle faces; yawns are explicit
const sleepy = (t, seed) => ({ lid: 0.5 + 0.08 * Math.sin(t * 0.9 + seed), look: [Math.sin(t * 0.4 + seed) * 0.3, 0.2] });
const F1 = { pos: [0, 1.95, 10.2], look: [0, 1.75, 0], fov: 40 }, F1b = { pos: [0, 1.9, 9.6], look: [0, 1.75, 0], fov: 40 };
// faces for frame 1 at global-ish time u: Boring mid-yawn at u=0, Dull yawns after (contagious)
const f1Faces = (s, u) => { s.B.set(u, { ...sleepy(u, 0), yawn: yawnK(u, -0.6, 1.8) }); s.D.set(u, { ...sleepy(u, 2), yawn: yawnK(u, 0.7, 1.8) }); };

// s01 "A town called Boring" — FRAME 1: Boring is mid-yawn, Dull catches it; top caption
registerShot('s01', { kind: '3d',
  init(T) { return signScene(T); },
  draw(s, t, info) { f1Faces(s, t); camMove(s.stage, t, [[0, F1], [info.dur, F1b]], ease.out); },
  overlay(g, t, info, s) { topCaption(g, gt(info, t)); },
});
// s02 "teamed up with a village called Dull." — closer on Dull, who yawns back; "TEAMED UP" handshake chip
registerShot('s02', { kind: '3d',
  init(T) { return signScene(T); },
  draw(s, t, info) { f1Faces(s, t + 1.6); camMove(s.stage, t, [[0, { pos: [0.6, 1.9, 6.6], look: [0.4, 1.8, 0], fov: 38 }], [info.dur, { pos: [0.6, 1.85, 6.0], look: [0.45, 1.8, 0], fov: 38 }]]); },
  overlay(g, t, info) { topCaption(g, gt(info, t)); chip(g, 'TEAMED UP 🤝', 540, 560, t - at(info, 'teamed', 0.1) - 0.1, { size: 62, color: '#ffffff', rot: -3 }); },
});
// s03 "These are real places. Boring is in Oregon." — INSERT map: Oregon ... Scotland
insertShot('s03', { insert: { type: 'map', title: 'REAL PLACES', lines: ['BORING, OREGON', 'DULL, SCOTLAND'], color: '#d8342c' }, bg: ['#3a6a9a', '#1a2a4a'] });
// s04 "Its motto: the most exciting place to live." — Boring's sign, the motto banner, a cricket chirps, a lone leaf blows by
registerShot('s04', { kind: '3d',
  init(T) { const s = signScene(T); const ban = canvasTex(768, 160, (c, W, H) => { c.fillStyle = '#fff6d8'; c.fillRect(0, 0, W, H); c.strokeStyle = '#d8342c'; c.lineWidth = 14; c.strokeRect(7, 7, W - 14, H - 14); c.fillStyle = '#2a1c15'; c.font = '900 50px Nunito'; c.textAlign = 'center'; c.fillText('"THE MOST EXCITING', W / 2, 70); c.fillText('PLACE TO LIVE"', W / 2, 128); });
    const b = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.54), toon('#ffffff', { map: ban })); b.position.set(-1.07, 3.05, 0.08); b.rotation.y = 0.08; s.stage.add(b); s.ban = b;
    for (const x of [-2.25, 0.1]) s.stage.add(cyl(0.04, 0.04, 3.3, '#7a5a3a', x, 1.65, 0.02, 8)); return s; },
  draw(s, t, info) { const m = at(info, 'most', 0.6); s.B.set(t, { ...sleepy(t, 0), lid: lerp(0.5, 0.75, prog(t, m + 0.4, info.dur)) }); s.D.set(t, sleepy(t, 2)); s.ban.rotation.z = Math.sin(t * 1.3) * 0.02;
    const c = m - 0.12; if (t < c) camMove(s.stage, t, [[0, { pos: [-1.0, 2.3, 6.4], look: [-1.0, 2.25, 0], fov: 38 }], [c, { pos: [-1.0, 2.25, 6.0], look: [-1.0, 2.25, 0], fov: 38 }]]);
    else camMove(s.stage, t - c, [[0, { pos: [-1.1, 2.55, 5.0], look: [-1.07, 2.5, 0], fov: 38 }], [info.dur - c, { pos: [-1.1, 2.5, 4.6], look: [-1.07, 2.45, 0], fov: 38 }]]); },
  overlay(g, t, info) { chip(g, 'MOTTO', 540, 340, t - 0.05, { size: 60, color: '#ffd23a', rot: -3 }); const m = at(info, 'exciting', 1.0);
    if (t > m) { g.save(); g.globalAlpha = clamp((t - m) / 0.3); g.font = '900 52px Nunito'; g.fillStyle = '#ffffff'; g.strokeStyle = '#2a1c15'; g.lineWidth = 10; const x = 820 + Math.sin(t * 9) * 6; for (const [dx, dy] of [[0, 0], [70, -50]]) { g.strokeText('chirp', x + dx, 890 + dy); g.fillText('chirp', x + dx, 890 + dy); } g.restore(); } },
});
// s05 "Dull is in Scotland." — the village of Dull: hills, cottages, sheep
registerShot('s05', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 10, target: [0, 1, -4] }); const set = village(st); const D = sign(SIGN.dull); D.position.set(0.9, 0, 1.2); st.add(D); return { stage: st, set, D }; },
  draw(s, t, info) { s.set.update(t); s.D.set(t, sleepy(t, 2)); camMove(s.stage, t, [[0, { pos: [-2.2, 2.6, 9.6], look: [0, 1.6, -2], fov: 40 }], [info.dur, { pos: [-1.6, 2.5, 8.8], look: [0.3, 1.7, -2], fov: 40 }]]); },
  overlay(g, t, info) { chip(g, 'SCOTLAND', 540, 340, t - at(info, 'scotland', 0.5), { size: 62, color: '#ffffff', rot: 3 }); },
});
// s06 "Population: about 84." — INSERT counter: 84 people (the village behind, blurred)
insertShot('s06', { scene: { init: (T) => { const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 10, target: [0, 1, -4] }); const set = village(st); return { stage: st, set }; }, draw: (s, t) => { s.set.update(t); camMove(s.stage, t, [[0, { pos: [0, 2.6, 9], look: [0, 1.6, -3], fov: 40 }], [3, { pos: [0, 2.5, 8.4], look: [0, 1.6, -3], fov: 40 }]]); } },
  insert: { type: 'counter', value: 84, from: 0, title: 'POPULATION OF DULL', prefix: '~', lines: ['about 84 people'], color: '#ffd23a' } });
// s07 "In 2012, a Scottish woman on a cycling holiday" — a cyclist pedals along the Oregon road
function rideScene(T) { const s = signScene(T); const bk = bicycle(); s.stage.add(bk); const R = person({ name: 'Rider', outfit: 'tee', skin: 'fair', hair: 'long', hairColor: '#b8642a', head: 'ballcap', headColor: '#d8342c', colors: { main: '#2a8a8a', legs: '#2a2f3a' }, seed: 61 }); s.stage.add(R); s.bk = bk; s.R = R; return s; }
function ride(s, x, t, pedal = 1) { s.bk.position.set(x, 0, 3.4); s.bk.spin(t * 6 * pedal); s.R.position.set(x - 0.2, 0.04, 3.4); s.R.rotation.y = Math.PI / 2;
  const c = t * 6 * pedal; s.R.pose(addPose(POSE.sit, { legL: [1.0 + Math.sin(c) * 0.5, 0.05], kneeL: 1.2 - Math.sin(c) * 0.6, legR: [1.0 - Math.sin(c) * 0.5, 0.05], kneeR: 1.2 + Math.sin(c) * 0.6, armL: [1.2, 0.1, 0], armR: [1.2, 0.1, 0], elbowL: 0.3, elbowR: 0.3, lean: 0.25 })); }
registerShot('s07', { kind: '3d',
  init(T) { return rideScene(T); },
  draw(s, t, info) { const x = lerp(-7, -0.5, t / info.dur); ride(s, x, t); s.R.face(EXPR.happy, t); f1Faces(s, t + 4);
    camMove(s.stage, t, [[0, { pos: [x - 1.5, 2.2, 11.5], look: [x, 1.9, 3.4], fov: 38 }], [info.dur, { pos: [x - 0.2, 2.2, 11.5], look: [x + 0.3, 1.9, 3.4], fov: 38 }]], (k) => k); },
  overlay(g, t, info) { stamp(g, '2012', 540, 330, t - at(info, '2012', 0.1), { size: 96, color: '#d8342c' }); chip(g, 'CYCLING HOLIDAY', 540, 1200, t - at(info, 'cycling', 0.8), { size: 56, color: '#ffffff', rot: 3 }); },
});
// s08 "rode through Boring... and had an idea." — she brakes, looks up at the yawning signs... lightbulb
registerShot('s08', { kind: '3d',
  init(T) { return rideScene(T); },
  draw(s, t, info) { const stop = prog(t, 0, 0.8), x = lerp(-0.5, 0.2, ease.out(stop)); ride(s, x, t * (1 - stop * 0.9), 1 - stop); const id = at(info, 'idea.', info.dur - 0.6);
    s.R.pose(addPose(POSE.sit, { legL: [1.0, 0.05], kneeL: 1.2, legR: [1.0, 0.05], kneeR: 1.2, armL: [1.2, 0.1, 0], armR: [1.2, 0.1, 0], elbowL: 0.3, elbowR: 0.3, headTurn: lerp(0, 1.1, ease.inOut(prog(t, 0.5, 1.1))), headNod: -0.25 }));
    s.R.face(t > id ? EXPR.grin : EXPR.neutral, t); s.B.set(t, { ...sleepy(t, 0), look: [0, 0.6] }); s.D.set(t, { ...sleepy(t, 2), yawn: yawnK(t, 0.9, 1.6), look: [0, 0.6] });
    const c = at(info, 'and', id - 0.5) - 0.1; if (t < c) camMove(s.stage, t, [[0, { pos: [3.6, 2.6, 10.6], look: [-0.4, 1.8, 0.6], fov: 40 }], [c, { pos: [3.5, 2.6, 10.2], look: [-0.4, 1.8, 0.6], fov: 40 }]]);
    else camMove(s.stage, t - c, [[0, { pos: [3.0, 3.0, 9.6], look: [-0.2, 2.0, 1.0], fov: 36 }], [info.dur - c, { pos: [2.9, 3.0, 9.2], look: [-0.2, 2.0, 1.0], fov: 36 }]]); },
  overlay(g, t, info, s) { const id = at(info, 'idea.', info.dur - 0.6); const a = anchor(s.stage, s.R); bulb(g, a.x, a.y - 120, t - id + 0.15, 0.9); },
});
// s09 "Boring's planning group voted." — the meeting: rows of seated members, very still
function hallScene(T) { const st = toonStage(T, { light: 'warm', fov: 36, shadowSize: 9, target: [0, 1, -1], exposure: 1.05 }); const set = hall(st); const M = [];
  const cols = ['#c85a3a', '#4a7aa8', '#6a9a4a', '#a8648a', '#d8a03a', '#5a5a7a', '#8a5a3a', '#3a8a8a', '#a84a4a'], hairs = ['bowl', 'curly', 'bun', 'horseshoe', 'swoop', 'bob', 'messy', 'bald', 'spiky'], skins = ['fair', 'tan', 'brown', 'light', 'olive', 'dark'];
  for (let i = 0; i < 9; i++) { const r = Math.floor(i / 3), c = i % 3; const p = person({ name: 'M' + i, skin: skins[i % 6], hair: hairs[i], hairColor: ['#3a2416', '#8a5a2a', '#1a1210', '#c8c0b0'][i % 4], colors: { main: cols[i], legs: '#3a3f4a' }, seed: 70 + i });
    const x = (c - 1) * 1.6 + (r % 2) * 0.3, z = -r * 1.5; const stl = PR.stool({ h: 0.55 }); stl.position.set(x, 0, z); st.add(stl); p.position.set(x, -0.25, z); st.add(p); M.push(p); }
  return { stage: st, set, M }; }
registerShot('s09', { kind: '3d',
  init(T) { return hallScene(T); },
  draw(s, t, info) { s.M.forEach((p, i) => { p.pose(addPose(POSE.sit, idle(t, i, 0.3))); p.face(i === 4 ? { ...EXPR.asleep } : EXPR.bored, t); });
    camMove(s.stage, t, [[0, { pos: [0, 2.7, 7.2], look: [0, 1.4, -1.5], fov: 36 }], [info.dur, { pos: [0, 2.6, 6.6], look: [0, 1.4, -1.5], fov: 36 }]]); },
  overlay(g, t, info, s) { chip(g, '38 MEMBERS', 540, 340, t - 0.1, { size: 62, color: '#ffffff', rot: -3 }); fxr(g, t, s, [{ fx: 'zzz', on: s.M[4], at: 0.2 }]); },
});
// s10 "Unanimous." — every hand goes up, slowly, in perfect boredom; the sleeper's hand too; "AYE x38"
registerShot('s10', { kind: '3d',
  init(T) { return hallScene(T); },
  draw(s, t, info) { s.M.forEach((p, i) => { const k = ease.inOut(prog(t, 0.05 + i * 0.04, 0.9 + i * 0.04)); p.pose(addPose(POSE.sit, { ...idle(t, i, 0.3), armR: [0.55 + k * 2.3, 0.12, 0], elbowR: 0.5 - k * 0.4 })); p.face(i === 4 ? EXPR.asleep : EXPR.deadpan, t); });
    camMove(s.stage, t, [[0, { pos: [0.8, 2.3, 5.6], look: [0, 1.7, -1.5], fov: 36 }], [info.dur, { pos: [0.7, 2.3, 5.2], look: [0, 1.75, -1.5], fov: 36 }]]); },
  overlay(g, t, info, s) { stamp(g, 'UNANIMOUS "AYE"', 540, 1180, t - 0.5, { size: 70, color: '#2fa84f' }); fxr(g, t, s, [{ fx: 'zzz', on: s.M[4], at: 0 }]); },
});
// s11 "Boring and Dull, a pair for the ages." — the "ceremony": the signs lean together under a banner, ONE limp kazoo, 3 confetti
registerShot('s11', { kind: '3d',
  init(T) { const s = signScene(T); const ban = canvasTex(768, 140, (c, W, H) => { c.fillStyle = '#ffd23a'; c.fillRect(0, 0, W, H); c.fillStyle = '#2a1c15'; c.font = '900 64px Nunito'; c.textAlign = 'center'; c.fillText('A PAIR FOR THE AGES', W / 2, 92); });
    const b = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 0.76), toon('#ffffff', { map: ban, side: THREE.DoubleSide })); b.position.set(0, 3.25, 0.15); s.stage.add(b); s.ban = b; for (const x of [-2.15, 2.15]) s.stage.add(cyl(0.04, 0.04, 3.6, '#7a5a3a', x, 1.8, 0.1, 8)); return s; },
  draw(s, t, info) { const p = at(info, 'pair', 0.6), lean = ease.inOut(prog(t, p - 0.2, p + 0.6)); s.B.rotation.z = -lean * 0.12; s.D.rotation.z = lean * 0.12;
    s.B.set(t, { ...sleepy(t, 0), mouth: t > p ? 'smile' : 'line', lid: 0.55 }); s.D.set(t, { ...sleepy(t, 2), mouth: t > p ? 'smile' : 'line', lid: 0.55, yawn: yawnK(t, info.dur - 1.5, 1.6) }); s.ban.rotation.z = Math.sin(t) * 0.02 - 0.01;
    camMove(s.stage, t, [[0, F1b], [info.dur, { pos: [0, 2.0, 8.8], look: [0, 2.0, 0], fov: 40 }]]); },
  overlay(g, t, info) { const p = at(info, 'pair', 0.6); sadConfetti(g, t - p, 3, { x: 540, y: 360, spread: 300 }); chip(g, 'OFFICIAL', 540, 1180, t - 0.1, { size: 56, color: '#ffffff', rot: -3 }); },
});
// s12 "But here's the part... now they throw a party." — the party: two limp balloons, party hats; the signs are thrilled (they are not)
registerShot('s12', { kind: '3d',
  init(T) { const s = signScene(T); s.bal = []; for (const [x, c] of [[-2.0, '#ff5a7a'], [2.05, '#4ac0ff']]) { const b = new THREE.Group(); const bb = ball(0.32, c, 0, 0, 0, 16); bb.scale.y = 1.2; b.add(bb); b.add(cyl(0.005, 0.005, 1.3, '#ffffff', 0, -0.95, 0, 4)); outline(b, { px: 2 }); b.position.set(x, 2.9, 0.2); s.stage.add(b); s.bal.push(b); }
    s.hats = [s.B, s.D].map((sg) => { const h = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.6, 18), toon('#a64ac8')); h.position.set(0, sg.topY + 0.32, 0); h.rotation.z = 0.25; sg.add(h); outline(h, { px: 2 }); return h; }); return s; },
  draw(s, t, info) { const pt = at(info, 'party.', info.dur - 0.8); s.bal.forEach((b, i) => { const sag = prog(t, pt, pt + 1.2); b.position.y = 2.9 - sag * 0.9 + Math.sin(t * 2 + i) * 0.03; b.rotation.z = (i ? -1 : 1) * sag * 0.6; });
    s.B.set(t, { ...sleepy(t, 0), lid: 0.6 }); s.D.set(t, { ...sleepy(t, 2), lid: 0.6, yawn: yawnK(t, pt + 0.1, 1.5) });
    camMove(s.stage, t, [[0, { pos: [0, 2.2, 8.4], look: [0, 2.0, 0], fov: 40 }], [info.dur, { pos: [0, 2.15, 7.8], look: [0, 2.0, 0], fov: 40 }]]); },
  overlay(g, t, info) { chip(g, 'PARTY! 🎉', 540, 340, t - at(info, 'party.', info.dur - 0.8), { size: 70, color: '#ff5a7a', ink: '#ffffff', rot: -4 }); },
});
// s13 "Boring and Dull Day, every August 9th." — the calendar page slaps in
registerShot('s13', {
  draw(g, t, info) { const gr = g.createLinearGradient(0, 0, 0, E.H); gr.addColorStop(0, '#2f7a4a'); gr.addColorStop(1, '#1a3a5a'); g.fillStyle = gr; g.fillRect(0, 0, E.W, E.H);
    chip(g, 'BORING & DULL DAY', 540, 380, t - 0.05, { size: 64, color: '#ffd23a', rot: -3 }); calendar(g, 540, 860, t - 0.2); },
});
// s14 "Yes. With bagpipes." — a bagpiper marches past the signs; the signs' eyes pop open... then droop again
registerShot('s14', { kind: '3d',
  init(T) { const s = signScene(T); const P = person({ name: 'Piper', outfit: 'tunic', skin: 'light', hair: 'curly', hairColor: '#c8642a', colors: { main: '#2a6a4a', trim: '#d8342c', stripe: '#d8342c', belt: '#2a1c15', legs: 'skin' }, seed: 81 });
    const bp = bagpipe(); P.hold ? P.hold('L', bp) : P.add(bp); s.stage.add(P); s.P = P; s.bp = bp; return s; },
  draw(s, t, info) { const x = lerp(-3.0, 1.2, t / info.dur); s.P.position.set(x, 0, 2.2); s.P.rotation.y = 1.25; s.P.pose(walk(t, { speed: 1.3 })); s.P.face({ ...EXPR.happy, mouth: 'o' }, t);
    s.bp.position.set(0.1, 0.25, 0.1); s.bp.rotation.set(0, -0.4, 0.2); const w = ease.outBack(prog(t, 0.15, 0.4)) * (1 - prog(t, info.dur - 0.6, info.dur));
    s.B.set(t, { lid: lerp(0.5, 0.0, w), mouth: w > 0.5 ? 'o' : 'line', brow: w, look: [-0.5, 0.5] }); s.D.set(t, { lid: lerp(0.5, 0.0, w), mouth: w > 0.5 ? 'o' : 'line', brow: w, look: [-0.6, 0.5] });
    camMove(s.stage, t, [[0, { pos: [0, 1.9, 8.6], look: [0, 1.6, 0.8], fov: 40 }], [info.dur, { pos: [0, 1.9, 8.0], look: [0, 1.6, 0.8], fov: 40 }]]); shakeCam(s.stage, t, [{ fx: 'shake', at: 0.15, amp: 0.02, dur: 0.4 }]); },
  overlay(g, t, info, s) { const r = Math.floor(t * 4); g.save(); for (let i = 0; i < 3; i++) { const a = anchor(s.stage, s.P); const k = ((t * 1.5 + i / 3) % 1); g.globalAlpha = 1 - k; g.font = '900 64px Nunito'; g.fillStyle = '#ffd23a'; g.strokeStyle = '#2a1c15'; g.lineWidth = 9; const tx = a.x + 60 + k * 120, ty = a.y - k * 220; g.strokeText('♪', tx, ty); g.fillText('♪', tx, ty); } g.restore();
    chip(g, 'BAGPIPES', 540, 340, t - at(info, 'bagpipes.', 0.5), { size: 62, color: '#ffffff', rot: 3 }); },
});
// s15 "Then, in 2013, a third town joined." — a third sign slides in from the right (whoosh), 2013
registerShot('s15', { kind: '3d',
  init(T) { return signScene(T, { bland: true }); },
  draw(s, t, info) { const j = ease.outBack(prog(t, at(info, 'third', 0.7) - 0.1, at(info, 'third', 0.7) + 0.4)); s.L.position.x = lerp(7.5, 3.2, j); f1Faces(s, t + 7); s.L.set(t, { lid: 0.5, look: [-0.6, 0.2] });
    camMove(s.stage, t, [[0, { pos: [1.0, 2.1, 11.5], look: [1.0, 1.8, 0], fov: 40 }], [info.dur, { pos: [1.1, 2.1, 12.0], look: [1.1, 1.8, 0], fov: 40 }]]); },
  overlay(g, t, info) { stamp(g, '2013', 540, 340, t - at(info, '2013', 0.3), { size: 96, color: '#d8342c' }); },
});
// s16 "Bland. As in, Bland, Australia." — Bland in the outback, yawning; "AUSTRALIA"
registerShot('s16', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'sunny', fov: 38, shadowSize: 8, target: [0, 1, 0] }); const set = outback(st); const L = sign(SIGN.bland); st.add(L); return { stage: st, set, L }; },
  draw(s, t, info) { s.L.set(t, { ...sleepy(t, 4), yawn: yawnK(t, at(info, 'australia.', 1.2) - 0.2, 1.6) });
    camMove(s.stage, t, [[0, { pos: [0.3, 2.0, 5.4], look: [0, 1.8, 0], fov: 38 }], [info.dur, { pos: [0.2, 1.95, 4.8], look: [0, 1.8, 0], fov: 38 }]]); },
  overlay(g, t, info) { chip(g, 'AUSTRALIA', 540, 340, t - at(info, 'australia.', 1.2), { size: 62, color: '#ffffff', rot: -3 }); },
});
// s17 "Together, they're the League of Extraordinary Communities." — superhero moment: capes, god rays, low hero angle, big title
function leagueScene(T) { const s = signScene(T, { bland: true, stage: { light: 'sunny' } }); s.L.position.set(3.2, 0, -0.3);
  s.capes = [s.B, s.D, s.L].map((sg) => { const c = cape({ w: 2.2, h: 2.0 }); c.position.set(0, sg.topY - 0.75, -0.22); sg.add(c); return c; }); return s; }
registerShot('s17', { kind: '3d',
  init(T) { return leagueScene(T); },
  draw(s, t, info) { s.capes.forEach((c, i) => c.update(t + i)); [s.B, s.D, s.L].forEach((sg, i) => sg.set(t, { lid: 0.15, brow: 0.6, browTilt: 0.6, mouth: 'smile', look: [0, -0.2] }));
    const c = at(info, 'extraordinary', info.dur * 0.5) - 0.1; if (t < c) camMove(s.stage, t, [[0, { pos: [1.0, 0.6, 9.8], look: [1.0, 2.2, 0], fov: 44 }], [c, { pos: [1.0, 0.55, 9.2], look: [1.0, 2.25, 0], fov: 44 }]]);
    else camMove(s.stage, t - c, [[0, { pos: [-1.6, 0.8, 7.6], look: [1.0, 2.2, 0], fov: 44 }], [info.dur - c, { pos: [-1.2, 0.7, 7.2], look: [1.0, 2.3, 0], fov: 44 }]]); shakeCam(s.stage, t, [{ fx: 'shake', at: 0.05, amp: 0.03, dur: 0.3 }]); },
  overlay(g, t, info) { heroRays(g, t, 1); const k = at(info, 'league', 0.6); const a = ease.outBack(clamp((t - k) / 0.4));
    if (a > 0) { g.save(); g.translate(540, 420); g.scale(a, a); g.rotate(-0.04); chip(g, 'THE LEAGUE OF', 0, -70, 1, { size: 56, color: '#ffffff' }); chip(g, 'EXTRAORDINARY', 0, 30, 1, { size: 74, color: '#ffd23a' }); chip(g, 'COMMUNITIES', 0, 140, 1, { size: 74, color: '#ffd23a' }); g.restore(); } },
});
// s18 "Also known as..." — the dramatic beat: capes still flapping... eyelids sinking
registerShot('s18', { kind: '3d',
  init(T) { return leagueScene(T); },
  draw(s, t, info) { const k = prog(t, 0.1, info.dur); s.capes.forEach((c, i) => c.update(t + 3 + i, 1 - k * 0.7)); [s.B, s.D, s.L].forEach((sg, i) => sg.set(t, { lid: lerp(0.15, 0.85, k), look: [0, 0.3] }));
    camMove(s.stage, t, [[0, { pos: [1.0, 1.8, 9.0], look: [1.0, 1.9, 0], fov: 42 }], [info.dur, { pos: [1.0, 1.8, 8.6], look: [1.0, 1.9, 0], fov: 42 }]]); },
  overlay(g, t) { heroRays(g, t, 1 - clamp(t / 0.8)); },
});
// s19 "the Trinity of Tedium." — PAYOFF: all three fall asleep, capes droop, snore; TRINITY OF TEDIUM stamp
registerShot('s19', { kind: '3d',
  init(T) { return leagueScene(T); },
  draw(s, t, info) { s.capes.forEach((c, i) => c.update(t + i, 0.25)); [s.B, s.D, s.L].forEach((sg, i) => sg.set(t, { lid: 1, mouth: 'o' })); [s.B, s.D, s.L].forEach((sg, i) => { sg.rotation.z = Math.sin(t * 1.2 + i) * 0.03; });
    camMove(s.stage, t, [[0, { pos: [1.0, 2.0, 10.6], look: [1.0, 1.85, 0], fov: 40 }], [info.dur, { pos: [1.0, 2.0, 11.0], look: [1.0, 1.85, 0], fov: 40 }]]); },
  overlay(g, t, info, s) { fxr(g, t, s, [{ fx: 'zzz', on: 'B', at: 0.05 }, { fx: 'zzz', on: 'D', at: 0.2 }, { fx: 'zzz', on: 'L', at: 0.35 }]); stamp(g, 'TRINITY OF TEDIUM', 540, 1160, t - at(info, 'tedium.', 0.6), { size: 72, color: '#a64ac8' }); },
});
// s20 "Subscribe for more." — closer: Boring wakes into a yawn, camera settles on frame 1's framing (Bland is just off-frame right) -> loop
registerShot('s20', { kind: '3d',
  init(T) { return signScene(T, { bland: true }); },
  draw(s, t, info) { const tl = t - info.dur; f1Faces(s, tl); s.L.set(t, { lid: 1, mouth: 'o' }); camMove(s.stage, t, [[0, { pos: [1.0, 2.0, 11.0], look: [1.0, 1.85, 0], fov: 40 }], [info.dur, F1]], ease.inOut); },
});
