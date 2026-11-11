// "Penny Off the Empire State Building" (penny-drop): 13 shots, Toon 3D + BEANMEN FX (sunny sky, reactions, 2 insert cards, whip/iris/flash)
import { registerShot, ease, prog, lerp, clamp, E, text, FONTS } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, shake, shrug } from '/kits/toon3d/rig.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { insertShot } from '/kits/toon3d/insert.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import { at, tag, deck, street, penny, leaf, hero, tomas, lin, local, THREE } from './_lib.js';

const RAYS = { rays: { from: [-60, -80], strength: 0.8 }, tint: '#ffcf8a' };
const SOFT = { rays: false, tint: '#ffcf8a' };
const V = new THREE.Vector3();
const REACH = { ...POSE.stand, armR: [1.55, -0.15, 0], elbowR: 0.15, lean: 0.18, headNod: 0.35 };

// ---------- the deck: HERO leans over the parapet, flicks a penny; the camera tilts down after it (frame 1 + the loop ending) ----------
const deckShot = {
  init(T) { const s = deck(T, { target: [0, 0, 1.5] }); s.h = hero(); s.h.position.set(0.1, 0, 1.45); s.stage.add(s.h);
    s.p = penny({ scale: 0.3 }); s.stage.add(s.p); return s; },
  // o.drop: seconds since the flick (null = still in hand)
  draw(s, t, info, o = {}) { s.sky.update(t); const h = s.h; h.pose(addPose(REACH, idle(t, 1, 0.5))); h.face(o.face || mixExpr(EXPR.neutral, EXPR.shocked, ease.inOut(prog(t, 0.3, 0.7))), t);
    h.updateMatrixWorld(true); h.hand.R.getWorldPosition(V); const d = o.drop;
    if (d == null || d < 0) { s.p.position.set(V.x, V.y + 0.12, V.z + 0.05); s.p.coin.rotation.set(1.2, 0, 0.2); }
    else { s.p.position.set(V.x + d * 0.3, V.y + 0.12 + d * 1.5 - 7 * d * d, V.z + 0.05 + d * 2.6); s.p.flutter(d * 1.4, 0.5); }
    if (o.follow) { const k = 0.4 + 0.6 * ease.inOut(prog(t, 0, 1.1)), q = s.p.position; const lk = [lerp(-0.25, q.x, k), lerp(1.65, q.y, k), lerp(2.1, q.z, k)];
      s.stage.cam([lerp(0.9, 0.9, k), lerp(2.3, 3.2, k), lerp(5.4, q.z + 3.5, k)], lk, lerp(40, 44, k)); }
    else camMove(s.stage, t, o.keys); },
};
const K01 = (d) => [[0, { pos: [1.5, 2.3, 5.4], look: [0.2, 1.7, 2.1], fov: 40 }], [0.9, { pos: [1.5, 2.3, 5.4], look: [0.3, 0.6, 2.6], fov: 40 }], [d, { pos: [1.2, 1.0, 6.2], look: [0.4, -60, 40], fov: 46 }]];
registerShot('s01', { kind: '3d', init: deckShot.init,
  draw: (s, t, i) => deckShot.draw(s, t, i, { drop: t + 0.25, follow: true }),
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'sparkle', on: 'p', at: 0.05, scale: 0.7 }, { fx: 'exclaim', on: 'h', at: 0.45, until: 1.4 }]); } });
// s13 loop: back on the deck, a new penny already in hand; the camera settles on the frame-1 framing
registerShot('s13', { kind: '3d', init: deckShot.init,
  draw: (s, t, i) => deckShot.draw(s, t, i, { drop: null, face: EXPR.smug, keys: [[0, { pos: [1.8, 2.6, 6.6], look: [-0.2, 1.8, 2.1], fov: 40 }], [i.dur, { pos: [0.9, 2.3, 5.4], look: [-0.25, 1.65, 2.1], fov: 40 }]] }),
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'sparkle', on: 'p', at: 0.4, scale: 0.6 }]); } });

// ---------- the street at the foot of the tower ----------
const crowd = {
  init(T) { const s = street(T, { target: [0, 0, 2.5] }); s.t = tomas(); s.t.position.set(0.3, 0, 2.6); s.stage.add(s.t);
    s.l = [0, 1, 2].map(i => { const b = local(i); b.position.set([-1.6, 1.9, -0.6][i], 0, [2.0, 1.8, 0.9][i]); b.rotation.y = [0.35, -0.4, 0.15][i]; s.stage.add(b); return b; }); return s; },
};
// s02 "Everyone says it would kill someone." everyone looks up in panic: "!" + sweat + shake on "kill"
registerShot('s02', { kind: '3d', init: crowd.init,
  draw(s, t, info) { s.sky.update(t); const k = at(info, 'kill', 1.0); const p = ease.inOut(prog(t, k - 0.15, k + 0.2));
    [s.t, ...s.l].forEach((b, i) => { b.pose(addPose(mixPose(POSE.stand, POSE.panic, p), { ...idle(t, i + 2), headNod: -0.45 })); b.face(mixExpr({ ...EXPR.worried, pupil: [0, 0.8] }, { ...EXPR.panic, pupil: [0, 0.9] }, p), t); });
    camMove(s.stage, t, [[0, { pos: [0.2, 0.9, 9.5], look: [0, 3.6, 0], fov: 46 }], [info.dur, { pos: [0.2, 0.8, 8.4], look: [0, 3.9, 0], fov: 46 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: k, amp: 0.06, dur: 0.4 }]); },
  overlay(g, t, info, s) { const k = at(info, 'kill', 1.0); sunnyLook(g, t, RAYS); tag(g, 'THE MYTH', ease.out(prog(t, 0.1, 0.4)), 0.13);
    reactions(g, t, s, [{ fx: 'exclaim', on: 't', at: k }, { fx: 'sweat', on: 'l', at: k + 0.1 }, { fx: 'sweat', on: 't', at: k + 0.2 }, { fx: 'question', on: s.l[2], at: 0.3, until: k - 0.1 }]); } });

// s03 "It won't." DR LIN on the deck, deadpan head shake; MYTH: BUSTED
registerShot('s03', { kind: '3d',
  init(T) { const s = deck(T, { target: [-1.2, 0, 1.4], seed: 7 }); s.d = lin(); s.d.position.set(-1.3, 0, 1.5); s.d.rotation.y = 0.15; s.stage.add(s.d); return s; },
  draw(s, t, info) { s.sky.update(t); s.d.pose(addPose(POSE.handsHips, { ...idle(t, 4), ...shake(t) })); s.d.face({ ...EXPR.deadpan, pupil: [0, 0] }, t);
    camMove(s.stage, t, [[0, { pos: [-0.9, 2.2, 5.0], look: [-1.3, 2.0, 1.5], fov: 34 }], [info.dur, { pos: [-0.95, 2.2, 4.5], look: [-1.3, 2.05, 1.5], fov: 34 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); const w = at(info, "won't", 0.25); reactions(g, t, s, [{ fx: 'sparkle', on: 'd', at: w, scale: 0.8 }]); tag(g, 'MYTH: BUSTED', ease.out(prog(t, w, w + 0.3)), 0.13); } });

// s04 "Wait, how?" TOMAS on the street: shrug + "???"
registerShot('s04', { kind: '3d', init: crowd.init,
  draw(s, t, info) { s.sky.update(t); s.t.pose(shrug(POSE.stand, ease.inOut(prog(t, 0.05, 0.35)))); s.t.face({ ...EXPR.suspicious, pupil: [0, 0] }, t); s.l.forEach((b, i) => { b.pose(addPose(POSE.stand, idle(t, i))); b.face(EXPR.neutral, t); });
    camMove(s.stage, t, [[0, { pos: [0.5, 2.1, 6.2], look: [0.3, 2.05, 2.6], fov: 32 }], [info.dur, { pos: [0.5, 2.1, 5.7], look: [0.3, 2.05, 2.6], fov: 32 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); reactions(g, t, s, [{ fx: 'question', on: 't', at: 0.1 }]); } });

// s05 "You see, a penny is flat and light, so it flutters, like a leaf." midair: penny + leaf flutter side by side over the city
const air = {
  init(T) { const s = deck(T, { target: [0, -40, 22], seed: 9 }); s.p = penny({ scale: 0.75 }); s.lf = leaf({ scale: 1.0 }); s.stage.add(s.p, s.lf); return s; },
  draw(s, t, info) { s.sky.update(t); const y = -40 - t * 0.5; const a = s.p.flutter(t, 1), b = s.lf.flutter(t, 0.6);
    s.p.position.set(-0.55 + a * 0.2, y + 0.5, 24); s.lf.position.set(0.6 + b * 0.2, y - 0.6, 24.2);
    camMove(s.stage, t, [[0, { pos: [0, y + 4.2, 18.2], look: [0, y - 0.3, 24], fov: 38 }], [info.dur, { pos: [0, y + 4.0, 18.8], look: [0, y - 0.3, 24], fov: 38 }]], ease.linear); },
};
registerShot('s05', { kind: '3d', init: air.init, draw: air.draw,
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); const f = at(info, 'flat', 1.0), l = at(info, 'leaf', 2.9);
    reactions(g, t, s, [{ fx: 'sparkle', on: 'p', at: f, scale: 0.8 }, { fx: 'hearts', on: 'lf', at: l }]); tag(g, 'FLAT + LIGHT', ease.out(prog(t, f, f + 0.3)), 0.13); } });

// s06 "The air pushes back. After about 50 feet, it stops speeding up." tracking the penny down the facade: air arrows + a speedometer
const vAt = (t, ts) => 18 * Math.min(1, t / ts);                    // units/s, levels off at ts
const yAt = (t, ts) => -8 - (t < ts ? 9 * t * t / ts : 9 * ts + 18 * (t - ts));
const fall = {
  init(T) { const s = deck(T, { target: [0, -30, 5], seed: 11 }); s.p = penny({ scale: 0.5 }); s.stage.add(s.p); return s; },
  draw(s, t, info, ts = 2.9) { s.sky.update(t); const y = yAt(t, ts); s.p.position.set(0, y, 5.2); s.p.flutter(t, 0.7);
    s.stage.cam([3.4, y + 0.9, 9.2], [0.2, y - 0.2, 5.2], 38); },
};
function airArrows(g, t, k) { if (k <= 0) return; g.save(); g.globalAlpha = k; g.lineCap = 'round'; g.lineJoin = 'round';
  for (let i = 0; i < 6; i++) { const x = E.W * (0.2 + 0.12 * i), y = E.H * (0.72 - ((t * 0.35 + i * 0.37) % 1) * 0.45); g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 12; g.beginPath(); g.moveTo(x, y + 90); g.lineTo(x, y); g.moveTo(x - 26, y + 30); g.lineTo(x, y); g.lineTo(x + 26, y + 30); g.stroke(); }
  g.restore(); }
function gauge(g, v, label, k = 1) { if (k <= 0) return; const cx = E.W * 0.24, cy = E.H * 0.25, r = 135; g.save(); g.globalAlpha = k; g.translate(cx, cy); g.scale(0.8 + 0.2 * ease.outBack(k), 0.8 + 0.2 * ease.outBack(k));
  g.fillStyle = 'rgba(20,14,18,.85)'; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill(); g.lineWidth = 10; g.strokeStyle = '#ffd25a'; g.stroke();
  for (let i = 0; i <= 5; i++) { const a = Math.PI * (0.8 + 1.4 * i / 5); g.strokeStyle = '#fff'; g.lineWidth = 6; g.beginPath(); g.moveTo(Math.cos(a) * r * 0.78, Math.sin(a) * r * 0.78); g.lineTo(Math.cos(a) * r * 0.92, Math.sin(a) * r * 0.92); g.stroke(); }
  const a = Math.PI * (0.8 + 1.4 * clamp(v / 50)); g.strokeStyle = '#ff5a4a'; g.lineWidth = 10; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * r * 0.75, Math.sin(a) * r * 0.75); g.stroke();
  text(g, label, 0, r * 0.5, { size: 46, color: '#ffd25a', weight: 700 }); g.restore(); }
registerShot('s06', { kind: '3d', init: fall.init, draw: (s, t, info) => fall.draw(s, t, info, at(info, 'stops', 2.95)),
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); const st = at(info, 'stops', 2.95), f = at(info, '50', 2.1);
    airArrows(g, t, ease.out(prog(t, 0.2, 0.6))); gauge(g, 25 * Math.min(1, t / st), 'MPH', ease.out(prog(t, 0.6, 1.0)));
    tag(g, '~50 FT DOWN', ease.out(prog(t, f, f + 0.3)), 0.13); reactions(g, t, s, [{ fx: 'stars', on: 'p', at: st, scale: 0.7 }]); } });

// s07 INSERT counter "Top speed? About 25 miles an hour." over the falling penny (still playing, blurred)
insertShot('s07', { scene: { init: fall.init, draw: (s, t, info) => fall.draw(s, t + 4.3, info, 2.95) },
  insert: { type: 'counter', title: 'PENNY TOP SPEED', value: 25, prefix: '~', suffix: ' MPH', lines: ['(40 km/h)'], color: '#ffd25a' } });
// s08 INSERT versus "With no air at all, it would hit 208." over the midair sky shot
insertShot('s08', { scene: { init: air.init, draw: (s, t, info) => air.draw(s, t + 3.6, info) },
  insert: { type: 'versus', title: 'TOP SPEED (MPH)', lines: ['NO AIR: 208', 'AIR: 25'], colorL: '#d8342c', color: '#2f8a5a' } });

// s09 "Luckily, we have air." TOMAS relaxes, a breeze blows a leaf past: happy + sparkle
registerShot('s09', { kind: '3d',
  init(T) { const s = crowd.init(T); s.lf = leaf({ scale: 0.7 }); s.stage.add(s.lf); return s; },
  draw(s, t, info) { s.sky.update(t); const r = ease.inOut(prog(t, 0.1, 0.6)); s.t.pose(addPose(mixPose(POSE.panic, POSE.relaxed, r), idle(t, 3))); s.t.face(mixExpr(EXPR.worried, EXPR.happy, r), t);
    s.l.forEach((b, i) => { b.pose(addPose(POSE.relaxed, idle(t, i))); b.face(EXPR.happy, t); }); s.lf.position.set(-3 + t * 3.2, 2.6 - t * 0.4, 3.4); s.lf.flutter(t * 1.5);
    camMove(s.stage, t, [[0, { pos: [0.5, 2.0, 7.4], look: [0.3, 1.9, 2.6], fov: 36 }], [info.dur, { pos: [0.5, 2.0, 6.8], look: [0.3, 1.9, 2.6], fov: 36 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'sparkle', on: 't', at: 0.6, scale: 0.8 }]); } });

// s10 "One physicist says it would feel like a flick on the forehead." the penny lands on TOMAS's forehead on "flick": ! + stars + flash + shake
registerShot('s10', { kind: '3d',
  init(T) { const s = crowd.init(T); s.p = penny({ scale: 0.22 }); s.stage.add(s.p); return s; },
  draw(s, t, info) { s.sky.update(t); const f = at(info, 'flick', 2.15); const hit = ease.out(prog(t, f, f + 0.25));
    s.t.pose(addPose(mixPose(POSE.stand, { ...POSE.stand, lean: -0.15, headNod: -0.25 }, hit), idle(t, 3))); s.t.face(t < f ? EXPR.neutral : mixExpr(EXPR.shocked, EXPR.deadpan, prog(t, f + 0.5, f + 1.2)), t);
    s.l.forEach((b, i) => { b.pose(addPose(POSE.stand, idle(t, i))); b.face(t < f ? EXPR.neutral : EXPR.shocked, t); });
    s.t.updateMatrixWorld(true); s.t.parts.head.getWorldPosition(V); const d = t - f;
    if (d < 0) { s.p.position.set(V.x, V.y + 0.45 - d * 6, V.z + 0.5); s.p.flutter(t * 1.6, 0.6); }
    else { s.p.position.set(V.x + d * 1.4, Math.max(0.05, V.y + 0.45 + d * 2.5 - 9 * d * d), V.z + 0.5 + d * 0.8); s.p.coin.rotation.x += d * 20; }
    camMove(s.stage, t, [[0, { pos: [0.3, 2.3, 7.0], look: [0.3, 2.2, 2.6], fov: 34 }], [info.dur, { pos: [0.3, 2.3, 6.2], look: [0.3, 2.2, 2.6], fov: 34 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: f, amp: 0.05, dur: 0.35 }]); },
  overlay(g, t, info, s) { const f = at(info, 'flick', 2.15); sunnyLook(g, t, RAYS); tag(g, 'ONE PHYSICIST SAYS', ease.out(prog(t, 0.05, 0.35)), 0.13);
    reactions(g, t, s, [{ fx: 'flash', at: f, dur: 0.2 }, { fx: 'exclaim', on: 't', at: f }, { fx: 'stars', on: 't', at: f + 0.1 }]); } });

// s11 "And not even a hard one." close on TOMAS, deadpan, rubs his forehead, sweat drop
registerShot('s11', { kind: '3d', init: crowd.init,
  draw(s, t, info) { s.sky.update(t); s.t.pose(addPose(POSE.facepalm, idle(t, 3))); s.t.face({ ...EXPR.deadpan, pupil: [0, 0] }, t); s.l.forEach(b => b.pose(POSE.stand));
    camMove(s.stage, t, [[0, { pos: [0.4, 2.15, 6.0], look: [0.3, 2.0, 2.6], fov: 32 }], [info.dur, { pos: [0.4, 2.15, 5.6], look: [0.3, 2.1, 2.6], fov: 32 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); reactions(g, t, s, [{ fx: 'sweat', on: 't', at: 0.5 }]); } });

// s12 "Please don't test this on Tomas." high angle from the deck POV: TOMAS glares up, angry, "!"
registerShot('s12', { kind: '3d', init: crowd.init,
  draw(s, t, info) { s.sky.update(t); s.t.pose(addPose(POSE.handsHips, { ...idle(t, 3), headNod: -0.5 })); s.t.face({ ...EXPR.angry, pupil: [0, 0.9] }, t); s.l.forEach((b, i) => { b.pose(addPose(POSE.stand, { headNod: -0.4 })); b.face({ ...EXPR.suspicious, pupil: [0, 0.8] }, t); });
    camMove(s.stage, t, [[0, { pos: [0.3, 9.5, 5.4], look: [0.3, 1.6, 2.6], fov: 36 }], [info.dur, { pos: [0.3, 8.5, 5.0], look: [0.3, 1.6, 2.6], fov: 36 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); const tm = at(info, 'tomas', 1.1); reactions(g, t, s, [{ fx: 'exclaim', on: 't', at: tm }, { fx: 'shake', at: tm, amp: 0.04, dur: 0.3 }]); } });
