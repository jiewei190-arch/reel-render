// The Russian Woodpecker — 11 shots, Toon 3D. WTF, deadpan. Chernobyl only as a place name; no reactor imagery.
import { registerShot, ease, prog, clamp, lerp } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, shrug, tremble, nod } from '/kits/toon3d/rig.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { drawInsert, dimScene } from '/kits/toon3d/insert.js';
import { softTint } from '/kits/toon3d/sky.js';
import {
  at, THREE, toonStage, dugaSet, pulseRings, radio, woodpecker, listener, ham, official, guard, armchair, livingRoom, hamShack, office,
  hookWords, stamp, tapBursts, signalArcs, dialCard, mapCard, horizonCard, snow, letters, PR, cyl, rbox, ball,
} from './_lib.js';

const DUSK = { light: 'dusk', bg: ['#2a2f5a', '#7a6a9a', '#e8a88a'], fog: [40, 150, '#a8a0c0'], ambient: 1.15, exposure: 1.05 };
// covering-ears pose
const EARS = { ...POSE.stand, armL: [0.2, 1.7, 0.4], elbowL: 2.3, armR: [0.2, 1.7, 0.4], elbowR: 2.3, headNod: 0.1 };

// the antenna-wall scene: frame 1 (s01), the reveal (s08) and the payoff (s11) share it so the last frame loops to frame 1
function wallScene(T, o = {}) {
  const st = toonStage(T, { ...DUSK, fov: 50, shadowSize: 16, target: [0, 2, -6] });
  const env = dugaSet(st, { rust: o.rust, wz: -50, w: 96, h: 44, front: [[-6.5, -1, 7], [7, -2, 8], [-11, -8, 9], [12, -10, 9]] });
  const stump = cyl(0.55, 0.65, 0.8, '#6a4a34', 0, 0.4, 2.2, 12); st.add(stump);
  const snowCap = cyl(0.56, 0.56, 0.08, '#f4f8ff', 0, 0.82, 2.2, 12); st.add(snowCap);
  const rd = radio({ scale: 0.8 }); rd.position.set(0, 0.84, 2.2); st.add(rd);
  const rings = { update() {} };   // pulses are drawn as 2D arcs (signalArcs)
  return { stage: st, env, rd, rings, stump };
}
const F1 = { pos: [0, 2.1, 5.4], look: [0, 6.5, -50], fov: 54 }, F1b = { pos: [0, 2.05, 5.0], look: [0, 6.8, -50], fov: 52 };

// s01 — HOOK: the antenna wall pulses; the radio on the stump hops on every tap and tips off. Already moving at frame 1.
registerShot('s01', { kind: '3d',
  init(T) { return wallScene(T); },
  draw(s, t, info) {
    s.env.update(t); s.rings.update(t, { period: 0.35 });
    const tip = prog(t, info.dur - 0.9, info.dur - 0.35);
    s.rd.update(t, { thump: 1, needle: 0.6 });
    s.rd.body.position.y += Math.max(0, Math.sin(t * Math.PI * 10)) * 0.05 * (1 - tip);
    s.rd.rotation.set(0, Math.sin(t * 31) * 0.05 * (1 - tip), -tip * 1.4); s.rd.position.set(lerp(0, 0.55, tip), 0.84 - ease.in(tip) * 0.9, 2.2);
    camMove(s.stage, t, [[0, F1], [info.dur, F1b]], ease.out);
    shakeCam(s.stage, t, [{ fx: 'shake', at: 0, amp: 0.012, dur: info.dur }]);
  },
  overlay(g, t, info, s) {
    softTint(g, '#9a8aff', 0.12); snow(g, t, { n: 70, a: 0.7 });
    signalArcs(g, t, 540, 820, { n: 5, period: 0.4, r0: 160, r1: 760, a0: Math.PI * 1.08, a1: Math.PI * 1.92, w: 14, a: 0.75 });
    tapBursts(g, t, { x: 540, y: 1640, r: 200, size: 58, on: 0.9 });
    hookWords(g, t, [[['the', '#ffffff'], ['Woodpecker', '#ffd25a']], [['hijacked', '#ffffff'], ["the world's", '#ffffff'], ['radios', '#ff5a4a']]], { y: 300, sizes: [92, 62] });
  },
});

// s02 — "July 1976. Shortwave radios suddenly started doing... this." Living room; on "this" the radio starts tapping.
function roomScene(T, o = {}) {
  const st = toonStage(T, { light: 'warm', fov: 40, shadowSize: 8, target: [0, 1.2, 0], exposure: 1.0 });
  const set = livingRoom(st, { tblX: 0.95, tblZ: 0.2, winX: 1.6 });
  const ch = armchair(); ch.position.set(-0.6, 0, 0.1); ch.rotation.y = 0.35; st.add(ch);
  const L = listener(); L.position.set(-0.57, -0.12, 0.2); L.rotation.y = 0.35; st.add(L);
  const rd = radio({ scale: 0.75 }); rd.position.set(0.95, set.tableY, 0.2); rd.rotation.y = -0.35; st.add(rd);
  return { stage: st, set, L, rd };
}
registerShot('s02', { kind: '3d',
  init(T) { return roomScene(T); },
  draw(s, t, info) {
    const on = at(info, 'this.', info.dur - 0.6) - 0.15, k = prog(t, on, on + 0.15);
    s.rd.update(t, { thump: k, needle: 0.3 + 0.1 * Math.sin(t) });
    const jolt = ease.outBack(prog(t, on + 0.1, on + 0.35));
    s.L.pose(addPose(POSE.sit, { ...idle(t, 3, 0.4), lean: -jolt * 0.25, bob: jolt * 0.12, armL: [0.55 + jolt * 0.6, 0.12 + jolt * 0.5, 0], armR: [0.55 + jolt * 0.6, 0.12 + jolt * 0.5, 0], headTurn: lerp(0.0, -0.7, jolt) }));
    s.L.face(mixExpr(EXPR.bored, EXPR.shocked, jolt), t);
    const cut = at(info, 'Shortwave', 1.0) - 0.1;
    if (t < cut) camMove(s.stage, t, [[0, { pos: [0.2, 2.9, 9.2], look: [0.2, 1.5, 0], fov: 42 }], [cut, { pos: [0.2, 2.8, 8.4], look: [0.2, 1.5, 0], fov: 42 }]]);
    else camMove(s.stage, t - cut, [[0, { pos: [0.3, 2.3, 7.0], look: [0.25, 1.45, 0], fov: 40 }], [info.dur - cut, { pos: [0.3, 2.2, 6.3], look: [0.25, 1.45, 0], fov: 40 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: on, amp: 0.04, dur: 0.4 }]);
  },
  overlay(g, t, info, s) {
    softTint(g, '#ffb070', 0.18);
    stamp(g, t, 'JULY 1976', { at: 0.05, x: 300, y: 330, size: 76, color: '#e23b2e', fill: 'rgba(250,244,226,0.92)', rot: -0.1 });
    const on = at(info, 'this.', info.dur - 0.6) - 0.15;
    if (t > on) tapBursts(g, t - on, { x: 720, y: 900, r: 220, size: 70 });
    reactions(g, t, s, [{ fx: 'exclaim', on: s.L, at: on + 0.15, color: '#ff3b30' }]);
  },
});

// s03 — "10 sharp taps a second. Over and over and over." Close-up of the thumping radio; 10 TAPS / SECOND card; punch-in.
registerShot('s03', { kind: '3d',
  init(T) { const s = roomScene(T); return s; },
  draw(s, t, info) {
    s.rd.update(t, { thump: 1, needle: 0.35 });
    s.L.pose(addPose(POSE.sit, idle(t, 3, 0.4))); s.L.face(EXPR.shocked, t);
    const cut = at(info, 'Over', 1.4) - 0.1;
    if (t < cut) camMove(s.stage, t, [[0, { pos: [1.3, 1.5, 2.4], look: [0.95, 1.1, 0.2], fov: 34 }], [cut, { pos: [1.25, 1.45, 2.1], look: [0.95, 1.1, 0.2], fov: 34 }]]);
    else camMove(s.stage, t - cut, [[0, { pos: [1.2, 1.25, 1.35], look: [0.9, 1.1, 0.2], fov: 32 }], [info.dur - cut, { pos: [1.18, 1.2, 1.15], look: [0.9, 1.1, 0.2], fov: 32 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: 0, amp: 0.01, dur: info.dur }]);
  },
  overlay(g, t, info, s) {
    softTint(g, '#ffb070', 0.15);
    const cut = at(info, 'Over', 1.4) - 0.1;
    if (t < cut) { dimScene(g, 3, 0.3); drawInsert(g, { type: 'bigtext', kicker: 'SHARP TAPS', title: '10 / SECOND', color: '#ffd25a' }, t); }
    else { tapBursts(g, t, { x: 540, y: 900, r: 360, size: 84 }); signalArcs(g, t, 540, 960, { n: 4, period: 0.4, r0: 200, r1: 420, both: true, a0: -0.7, a1: 0.7, w: 12, a: 0.6 }); }
  },
});

// s04 — "It hopped across frequencies, drowning out broadcasts, ham radio, even aviation." Dial card; then a ham covering his ears.
registerShot('s04', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'warm', fov: 38, shadowSize: 8, target: [0, 1.2, -0.5] });
    const set = hamShack(st);
    const H = ham(); H.position.set(0, 0, 0.6); H.rotation.y = 0; st.add(H);
    return { stage: st, set, H };
  },
  draw(s, t, info) {
    const cut = at(info, 'even', info.dur - 1.2) - 0.15, k = ease.out(prog(t, cut, cut + 0.25));
    s.H.pose(addPose(mixPose(POSE.stand, EARS, k), { ...idle(t, 5, 0.4), ...tremble(t, k) })); s.H.face(mixExpr(EXPR.annoyed || EXPR.angry, EXPR.panic, k), t);
    if (t < cut) camMove(s.stage, t, [[0, { pos: [0, 2.8, 6.0], look: [0, 1.8, -0.5], fov: 40 }], [cut, { pos: [0, 2.7, 5.6], look: [0, 1.8, -0.5], fov: 40 }]]);
    else camMove(s.stage, t - cut, [[0, { pos: [0.3, 2.3, 4.0], look: [0, 2.0, 0.4], fov: 36 }], [info.dur - cut, { pos: [0.3, 2.3, 3.6], look: [0, 2.0, 0.4], fov: 36 }]]);
  },
  overlay(g, t, info, s) {
    softTint(g, '#9fd0ff', 0.12);
    const cut = at(info, 'even', info.dur - 1.2) - 0.15;
    if (t < cut) { dimScene(g, 4, 0.4); dialCard(g, t, { y: 840, times: [at(info, 'broadcasts,', 0.8) - 0.1, at(info, 'ham', 1.6) - 0.1, at(info, 'aviation.', 2.4) - 0.1], foot: 'HOP, HOP, HOP' }); }
    else { tapBursts(g, t, { x: 540, y: 700, r: 330, size: 66 }); stamp(g, t, 'EVEN AVIATION', { at: cut + 0.05, x: 540, y: 330, size: 74, color: '#ffffff', fill: '#d8342c', rot: -0.05 });
      }
  },
});

// s05 — "Listeners nicknamed it the Russian Woodpecker." A cartoon woodpecker pecks the top of the radio at 10 Hz.
registerShot('s05', { kind: '3d',
  init(T) { const s = roomScene(T); s.bird = woodpecker({ scale: 1.0 }); s.bird.position.set(0.95, s.set.tableY + 0.6 * 0.75 + 0.02, 0.2); s.bird.rotation.y = -0.5; s.stage.add(s.bird); return s; },
  draw(s, t, info) {
    s.rd.update(t, { thump: 0.8 }); s.bird.update(t, { peck: 1, lid: 0.35, look: [0.2, 0] });
    s.L.pose(addPose(POSE.sit, idle(t, 3, 0.4))); s.L.face(EXPR.suspicious, t);
    camMove(s.stage, t, [[0, { pos: [0.7, 1.9, 3.2], look: [0.9, 1.55, 0.2], fov: 36 }], [info.dur, { pos: [0.6, 1.85, 2.7], look: [0.9, 1.55, 0.2], fov: 36 }]]);
  },
  overlay(g, t, info, s) {
    softTint(g, '#ffb070', 0.15);
    const k0 = at(info, 'Russian', 0.9) - 0.15;
    stamp(g, t, 'THE RUSSIAN', { at: k0, x: 540, y: 300, size: 74, color: '#ffffff', fill: '#d8342c', rot: -0.06 });
    stamp(g, t, 'WOODPECKER', { at: k0 + 0.25, x: 540, y: 440, size: 96, color: '#d8342c', fill: 'rgba(250,244,226,0.95)', rot: -0.03 });
    tapBursts(g, t, { x: 560, y: 1000, r: 300, size: 60, on: 0.8 });
  },
});

// s06 — "But here's the part... the Soviet Union never claimed it." A grey official at a desk; shrugs, looks away. UNCLAIMED.
registerShot('s06', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'warm', fov: 38, shadowSize: 8, target: [0, 1.3, 0], exposure: 0.92 });
    const set = office(st);
    const O = official(); O.position.set(0, 0, -0.6); st.add(O);
    return { stage: st, set, O };
  },
  draw(s, t, info) {
    const nv = at(info, 'never', info.dur - 1.2), sh = ease.inOut(prog(t, nv - 0.05, nv + 0.35));
    s.O.pose(addPose(shrug(POSE.stand, sh), { ...idle(t, 2, 0.4), headTurn: sh * 0.6, headTilt: sh * 0.12 })); s.O.face(mixExpr(EXPR.deadpan, { ...EXPR.smug, pupil: [0.8, 0.3] }, sh), t);
    const cut = at(info, 'the', 1.2, 1) - 0.12;
    if (t < nv - 0.12) camMove(s.stage, t, [[0, { pos: [0, 2.9, 6.6], look: [0, 1.9, 0], fov: 40 }], [nv, { pos: [0, 2.7, 5.4], look: [0, 1.9, 0], fov: 40 }]], ease.in);
    else camMove(s.stage, t - nv, [[0, { pos: [0.4, 2.5, 3.6], look: [0, 2.1, -0.6], fov: 36 }], [info.dur - nv, { pos: [0.4, 2.5, 3.3], look: [0, 2.1, -0.6], fov: 36 }]]);
  },
  overlay(g, t, info, s) {
    g.save(); g.fillStyle = 'rgba(10,12,24,0.25)'; g.fillRect(0, 0, 1080, 1920); g.restore();
    const nv = at(info, 'never', info.dur - 1.2);
    stamp(g, t, 'BUT...', { at: 0.05, until: nv - 0.1, x: 540, y: 330, size: 92, color: '#ffd25a', rot: -0.06 });
    stamp(g, t, 'UNCLAIMED', { at: at(info, 'claimed', nv + 0.4) - 0.15, x: 540, y: 340, size: 100, color: '#d8342c', fill: 'rgba(250,244,226,0.92)', rot: -0.1 });
  },
});

// s07 — "Radio hobbyists and NATO triangulated it to a spot near Chernobyl." Map card over the ham shack; bearings cross.
registerShot('s07', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'warm', fov: 38, shadowSize: 8, target: [0, 1.2, -0.5] });
    const set = hamShack(st);
    const H = ham(); H.position.set(0, 0, 0.4); H.rotation.y = Math.PI; st.add(H);
    return { stage: st, set, H };
  },
  draw(s, t, info) {
    s.H.pose(addPose(POSE.stand, idle(t, 6, 0.4))); s.H.face(EXPR.neutral, t);
    camMove(s.stage, t, [[0, { pos: [0, 2.6, 5.0], look: [0, 1.8, -0.5], fov: 40 }], [info.dur, { pos: [0, 2.6, 4.6], look: [0, 1.8, -0.5], fov: 40 }]]);
  },
  overlay(g, t, info, s) {
    dimScene(g, 5, 0.45);
    const h = at(info, 'Chernobyl.', info.dur - 0.7) - 0.15;
    mapCard(g, t, { y: 820, hit: h, title: 'TRIANGULATED', label: 'NEAR CHERNOBYL' });
    stamp(g, t, 'HOBBYISTS + NATO', { at: 0.15, x: 540, y: 250, size: 60, color: '#ffffff', fill: '#3a5a8a', rot: -0.04 });
  },
});

// s08 — "It was a giant Soviet radar, watching for missiles over the horizon, at over 10 megawatts."
// Hero tilt-up on the wall with a tiny guard for scale; then the horizon card; then the wall blasting rings.
registerShot('s08', { kind: '3d',
  init(T) { const s = wallScene(T); s.rd.visible = false; s.stump.visible = false; s.stage.scene.children.forEach(c => { if (c.geometry && c.geometry.type === 'CylinderGeometry' && c.position.z === 2.2) c.visible = false; });
    const G1 = guard(); G1.position.set(2.5, 0, -46); G1.rotation.y = -0.4; s.stage.add(G1); s.G = G1; return s; },
  draw(s, t, info) {
    s.env.update(t);
    const w = at(info, 'watching', 1.6) - 0.12, m = at(info, 'at', info.dur - 1.6, 1);
    const mw = (() => { let x = at(info, 'megawatts.', info.dur - 0.8); return x; })();
    const c2 = Math.max(w + 0.5, at(info, 'at', w + 2.0, 1) - 0.1);
    s.rings.update(t, { period: 0.3, on: t > c2 ? 1 : 0 });
    s.G.pose(addPose(POSE.attention, idle(t, 7, 0.3))); s.G.face(EXPR.neutral, t);
    if (t < w) camMove(s.stage, t, [[0, { pos: [1.5, 1.5, -39], look: [2.5, 2.5, -50], fov: 50 }], [w, { pos: [0.5, 1.2, -30], look: [1.5, 20, -50], fov: 62 }]], ease.inOut);
    else if (t < c2) camMove(s.stage, t - w, [[0, { pos: [0, 3, 0], look: [0, 10, -50], fov: 52 }], [c2 - w, { pos: [0, 3, -1], look: [0, 10, -50], fov: 52 }]]);
    else camMove(s.stage, t - c2, [[0, { pos: [14, 2.0, -12], look: [0, 18, -50], fov: 58 }], [info.dur - c2, { pos: [11, 2.0, -16], look: [0, 19, -50], fov: 60 }]]);
    if (t >= c2) shakeCam(s.stage, t, [{ fx: 'shake', at: c2, amp: 0.05, dur: info.dur - c2 }]);
  },
  overlay(g, t, info, s) {
    softTint(g, '#9a8aff', 0.12); snow(g, t, { n: 60, a: 0.6 });
    const w = at(info, 'watching', 1.6) - 0.12; const c2 = Math.max(w + 0.5, at(info, 'at', w + 2.0, 1) - 0.1);
    if (t < w) stamp(g, t, 'GIANT SOVIET RADAR', { at: at(info, 'giant', 0.3) - 0.1, x: 540, y: 330, size: 70, color: '#ffffff', fill: '#d8342c', rot: -0.05 });
    else if (t < c2) { dimScene(g, 5, 0.45); horizonCard(g, t - w, { y: 840 }); }
    else { signalArcs(g, t, 540, 620, { n: 5, period: 0.3, r0: 120, r1: 760, a0: Math.PI * 1.05, a1: Math.PI * 1.95, w: 14, a: 0.6 });
      dimScene(g, 0, 0.15); drawInsert(g, { type: 'bigtext', kicker: 'POWER', title: 'OVER 10 MW', lines: ['MEGAWATTS'], color: '#ffd25a' }, t - c2); }
  },
});

// s09 — "Thousands of complaints poured in. Some radios even came with Woodpecker Blankers, just to block it."
// Complaint letters rain over the official's office; mail sacks thump down. Then: a radio with a BLANKER button; the bird gets a cork.
registerShot('s09', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'warm', fov: 38, shadowSize: 8, target: [0, 1.2, 0] });
    const set = office(st);
    const O = official(); O.position.set(0, 0, -0.6); st.add(O);
    const sacks = [-1.6, 1.5, -0.6, 0.8].map((x, i) => { const sk = PR.sack({ color: '#c9b083', label: 'MAIL' }); sk.position.set(x, 0, 1.6 + (i % 2) * 0.5); st.add(sk); return sk; });
    // the blanker close-up lives on a second table off to the side (x = 12)
    const tb = PR.table({ w: 2.2, d: 1.2, h: 0.9, color: '#6a4228' }); tb.position.set(12, 0, 0); st.add(tb);
    const wall2 = rbox(10, 6, 0.2, '#4a6a8a', 12, 3, -1.5, 0.02); st.add(wall2);
    const rd = radio({ scale: 0.9, blanker: true, color: '#3a3e44' }); rd.position.set(12, 0.92, 0.1); st.add(rd);
    const bird = woodpecker({ scale: 1.0 }); bird.position.set(12, 0.92 + 0.72 * 0.9 + 0.02, 0.1); bird.rotation.y = -0.4; st.add(bird);
    return { stage: st, set, O, sacks, rd, bird };
  },
  draw(s, t, info) {
    const cut = at(info, 'Some', info.dur * 0.4) - 0.12, bl = at(info, 'Blankers,', cut + 1.5) - 0.05, press = prog(t, bl - 0.1, bl + 0.05);
    s.sacks.forEach((sk, i) => { const d = 0.25 + i * 0.3; const k = ease.in(prog(t, d, d + 0.35)); sk.position.y = (1 - k) * 6; sk.visible = t > d - 0.05; });
    const k = ease.out(prog(t, 0.3, 0.6));
    s.O.pose(addPose(mixPose(POSE.stand, POSE.panic, k), { ...idle(t, 2, 0.4), ...tremble(t, k * 0.6) })); s.O.face(mixExpr(EXPR.deadpan, EXPR.shocked, k), t);
    const blocked = t > bl + 0.05;
    s.rd.update(t, { thump: blocked ? 0 : 1, press, light: blocked ? 0 : 1 });
    s.bird.update(t, { peck: blocked ? 0 : 1, cork: blocked, lid: blocked ? 0.45 : 0.3, lidAngle: blocked ? 0.25 : 0, look: blocked ? [-0.4, -0.3] : [0.2, 0] });
    if (t < cut) camMove(s.stage, t, [[0, { pos: [0, 2.8, 7.0], look: [0, 1.6, 0], fov: 42 }], [cut, { pos: [0, 2.7, 6.4], look: [0, 1.6, 0], fov: 42 }]]);
    else camMove(s.stage, t - cut, [[0, { pos: [12.3, 2.3, 4.4], look: [12, 1.75, 0.1], fov: 38 }], [info.dur - cut, { pos: [12.25, 2.25, 3.9], look: [12, 1.75, 0.1], fov: 38 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: 0.55, amp: 0.04, dur: 0.3 }, { fx: 'shake', at: 1.15, amp: 0.04, dur: 0.3 }]);
  },
  overlay(g, t, info, s) {
    softTint(g, '#ffb070', 0.12);
    const cut = at(info, 'Some', info.dur * 0.4) - 0.12, bl = at(info, 'Blankers,', cut + 1.5) - 0.05;
    if (t < cut) { letters(g, t, { n: 28 }); stamp(g, t, 'THOUSANDS OF', { at: 0.1, x: 540, y: 300, size: 68, color: '#ffffff', fill: '#d8342c', rot: -0.05 }); stamp(g, t, 'COMPLAINTS', { at: 0.3, x: 540, y: 430, size: 90, color: '#d8342c', fill: 'rgba(250,244,226,0.95)', rot: -0.03 }); }
    else {
      if (t < bl) tapBursts(g, t, { x: 540, y: 820, r: 300, size: 60 });
      stamp(g, t, 'WOODPECKER', { at: bl - 0.35, x: 540, y: 300, size: 80, color: '#ffffff', fill: '#2f6a3a', rot: -0.05 });
      stamp(g, t, 'BLANKER', { at: bl - 0.15, x: 540, y: 420, size: 80, color: '#2f6a3a', fill: 'rgba(250,244,226,0.95)', rot: -0.02 });
    }
  },
});

// s10 — "In 1989, the tapping finally stopped." The living room: the radio goes quiet; the listener sinks back, zzz.
registerShot('s10', { kind: '3d',
  init(T) { return roomScene(T); },
  draw(s, t, info) {
    const st = at(info, 'stopped.', info.dur - 0.6) - 0.2, q = prog(t, st, st + 0.2);
    s.rd.update(t, { thump: 1 - q, light: q < 1 ? 1 : 0 });
    const r = ease.inOut(prog(t, st, st + 0.6));
    s.L.pose(addPose(mixPose(POSE.sit, { ...POSE.sit, lean: -0.2, headTilt: 0.25, headNod: -0.1, armL: [0.3, 0.4, 0], armR: [0.3, 0.4, 0] }, r), idle(t, 3, 0.3)));
    s.L.face(mixExpr(EXPR.worried, EXPR.asleep, r), t);
    camMove(s.stage, t, [[0, { pos: [0.2, 2.6, 8.4], look: [0.2, 1.45, 0], fov: 40 }], [info.dur, { pos: [0.2, 2.5, 7.4], look: [0.2, 1.45, 0], fov: 40 }]]);
  },
  overlay(g, t, info, s) {
    softTint(g, '#ffb070', 0.15);
    stamp(g, t, '1989', { at: at(info, '1989,', 0.1) - 0.1, x: 720, y: 300, size: 110, color: '#e23b2e', fill: 'rgba(250,244,226,0.92)', rot: -0.08 });
    const st = at(info, 'stopped.', info.dur - 0.6) - 0.2;
    if (t < st) tapBursts(g, t, { x: 760, y: 820, r: 220, size: 60, on: 0.8 });
    else stamp(g, t, 'SILENCE', { at: st + 0.05, x: 760, y: 820, size: 64, color: '#3a5a8a', fill: 'rgba(250,244,226,0.92)', rot: 0.08 });
    reactions(g, t, s, [{ fx: 'zzz', on: s.L, at: st + 0.3, scale: 0.8 }]);
  },
});

// s11 — PAYOFF: "But the giant antenna is still standing, abandoned, in the woods near Chernobyl."
// The same wall, rusty and silent, snow falling. Ends in frame 1's framing (stump + radio) → loops into frame 1.
registerShot('s11', { kind: '3d',
  init(T) { return wallScene(T, { rust: true }); },
  draw(s, t, info) {
    s.env.update(t, { lamps: 0 }); s.rings.update(t, { on: 0 });
    s.rd.update(t, { thump: 0, light: 0 });
    const ab = at(info, 'abandoned,', info.dur * 0.45);
    if (t < ab - 0.1) camMove(s.stage, t, [[0, { pos: [2, 1.6, -18], look: [0, 16, -50], fov: 60 }], [ab, { pos: [1.5, 1.6, -22], look: [0, 18, -50], fov: 60 }]]);
    else camMove(s.stage, t - ab, [[0, { pos: [0, 4.5, 14], look: [0, 7.5, -50], fov: 52 }], [info.dur - ab, F1]], ease.inOut);
  },
  overlay(g, t, info, s) {
    softTint(g, '#8a9aff', 0.15); snow(g, t, { n: 110, a: 0.85 });
    const ab = at(info, 'abandoned,', info.dur * 0.45);
    stamp(g, t, 'STILL STANDING', { at: at(info, 'still', 0.8) - 0.1, until: ab - 0.1, x: 540, y: 330, size: 80, color: '#ffffff', fill: '#2f6a3a', rot: -0.05 });
    stamp(g, t, 'ABANDONED', { at: ab - 0.05, x: 540, y: 330, size: 92, color: '#d8342c', fill: 'rgba(250,244,226,0.92)', rot: -0.07 });
  },
});
