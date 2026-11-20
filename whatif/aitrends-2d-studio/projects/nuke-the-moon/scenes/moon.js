// Nuke the Moon (Project A119) — 16 shots, Toon 3D + BEANMEN effects. WTF, deadpan.
// TONE: the only "explosion" is a cartoon starburst flash ON THE MOON. No mushroom cloud, nothing over Earth, nobody hurt.
import { registerShot, ease, prog, clamp, lerp, noise } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { bean, POSE, EXPR, addPose, mixPose, mixExpr, idle, point, shrug, tremble, nod } from '/kits/toon3d/rig.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { drawInsert, dimScene, voidBg } from '/kits/toon3d/insert.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import {
  at, THREE, toonStage, officer, clerk, warRoom, hookText, stamp, folder, moon, stars, NIGHT_BG, rocket, lab, porch, flash2d, project,
  PR, rbox, cyl, ball, floor, plane, smoke, insT, CARD_INK,
} from './_lib.js';

const BLUE = '#3d5a8a';
const airGeneral = (o = {}) => officer({ seed: o.seed || 5, skin: o.skin, over: { colors: { main: BLUE }, headColor: BLUE, ...(o.over || {}) } });
const NIGHT_TINT = { rays: false, tint: '#9fb4ff' };
const HOOK = ['PROJECT A119', 'NUKE THE MOON'];
const HOOK_O = { y: 270, size: 82, colors: ['#ffd25a', '#ff5a4a'] };

// ---------------------------------------------------------------- the rooftop (frame 1 and the payoff: same set, same framing)
function roofSet(T) {
  const st = toonStage(T, { light: 'night', fov: 48, bg: NIGHT_BG, shadowSize: 6, target: [0, 1, 0], exposure: 1.15 });
  stars(st, { n: 700, seed: 3 });
  st.add(floor(30, 30, '#3a4058', 0, -4));
  for (let i = -5; i <= 5; i++) st.add(cyl(0.05, 0.05, 1.0, '#8a90a8', i * 0.9, 0.5, -1.6, 8));
  st.add(rbox(10, 0.1, 0.12, '#8a90a8', 0, 1.0, -1.6, 0.03));
  const m = moon({ r: 5.2 }); m.position.set(1.4, 10.2, -22); st.add(m);
  const g = airGeneral({ seed: 5 }); g.position.set(-0.75, 0, 2.2); g.rotation.y = 1.2; st.add(g);
  const stick = new THREE.Group(); const sc = cyl(0.025, 0.035, 1.9, '#7a5032', 0, 0, 0, 8); sc.rotation.x = Math.PI / 2; sc.position.z = 0.95; stick.add(sc); st.add(stick);
  return { stage: st, m, g, stick };
}
const v = new THREE.Vector3();
function aimStick(s, k) {
  s.g.updateWorldMatrix(true, true); s.g.hand.R.getWorldPosition(v); s.stick.position.copy(v);
  const tgt = new THREE.Vector3(lerp(v.x + 1.5, s.m.position.x, k), lerp(v.y - 1.0, s.m.position.y, k), lerp(v.z + 0.3, s.m.position.z, k)); s.stick.lookAt(tgt);
}
const ROOF0 = { pos: [0.1, 1.5, 7.8], look: [0.2, 4.3, -4], fov: 50 }, ROOF1 = { pos: [0.1, 1.55, 7.2], look: [0.25, 4.4, -4], fov: 49 };
const moonFlashXY = (s) => { const p = project(s.stage, [s.m.position.x - s.m.R * 0.55, s.m.position.y + s.m.R * 0.45, s.m.position.z + s.m.R * 0.7]); return p; };

// s01 — HOOK. A 1950s Air Force general jabs a pointer at a giant Moon; a cartoon flash pops on it; the Moon gasps. Moving at frame 1.
registerShot('s01', { kind: '3d',
  init(T) { return roofSet(T); },
  draw(s, t, info) {
    const k = 0.6 + 0.4 * ease.outBack(prog(t, 0, 0.35));
    s.g.pose(addPose(point(POSE.stand, 'R', k, { up: 0.75 }), { ...idle(t, 5, 0.6), headNod: -0.25, lean: -0.05 }));
    s.g.face(mixExpr(EXPR.smug, EXPR.grin, prog(t, 0.6, 1.0)), t);
    aimStick(s, 1);
    s.m.update(t, { lid: 0.05, mouth: 'o', worry: 1, look: [-0.5, -0.3] });
    camMove(s.stage, t, [[0, ROOF0], [info.dur, ROOF1]], ease.out);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, NIGHT_TINT);
    const p = moonFlashXY(s); flash2d(g, p.x, p.y, 150, ((t + 0.25) % 1.6) / 1.1, { word: 'BOOM?' });
    hookText(g, t + 0.3, HOOK, HOOK_O);
    reactions(g, t, s, [{ fx: 'sweat', on: 'm', at: 0.3, scale: 1.2 }]);
  },
});

// s02 — "A top-secret study, called Project A119." Folder over the war room.
registerShot('s02', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'warm', fov: 38, shadowSize: 9, target: [0, 1.5, 0] });
    const set = warRoom(st);
    const g1 = airGeneral({ seed: 5 }); g1.position.set(-1.6, 0, 1.4); g1.rotation.y = 2.6; st.add(g1);
    const g2 = airGeneral({ seed: 7, skin: 'tan', over: { hair: 'bald' } }); g2.position.set(1.7, 0, 1.3); g2.rotation.y = -2.6; st.add(g2);
    return { stage: st, set, gs: [g1, g2] };
  },
  draw(s, t, info) {
    s.gs.forEach((g, i) => { g.pose(addPose(POSE.holdFront, { ...idle(t, 3 + i, 0.5), ...nod(t * 0.8 + i) })); g.face(EXPR.suspicious, t); });
    camMove(s.stage, t, [[0, { pos: [0, 3.6, 5.6], look: [0, 1.6, 0], fov: 40 }], [info.dur, { pos: [0, 3.1, 4.6], look: [0, 1.5, 0], fov: 38 }]]);
  },
  overlay(g, t, info, s) {
    hookText(g, t + 2, HOOK, { ...HOOK_O, until: 0.75 + 2 });   // top caption held across the cut (>= 3.5 s total)
    dimScene(g, 6, 0.35);
    folder(g, t, { at: 0.7, y: 800, tab: 'TOP SECRET', title: 'PROJECT A119', lines: ['A Study of', 'Lunar Research Flights', 'U.S. AIR FORCE · 1958'] });
    stamp(g, t, 'TOP SECRET', { at: Math.max(0.9, at(info, 'top-secret', 0.2) + 0.1), x: 540, y: 720, size: 92, color: '#e23b2e', rot: -0.14 });
  },
});

// s03 — "The Soviet Union had taken an early lead in the Space Race." Generals with binoculars watch a tiny satellite beep past.
registerShot('s03', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'night', fov: 44, bg: NIGHT_BG, shadowSize: 6, target: [0, 1, 0], exposure: 1.2 });
    stars(st, { n: 700, seed: 8 }); st.add(floor(30, 30, '#3a4058', 0, -4));
    const gs = [airGeneral({ seed: 5 }), airGeneral({ seed: 9, skin: 'tan', over: { hair: 'bald' } })];
    gs[0].position.set(-0.9, 0, 0); gs[1].position.set(0.9, 0, 0.2); gs.forEach(g => { g.rotation.y = 0.15; st.add(g); });
    const bins = gs.map(g => { const b = new THREE.Group(); b.add(cyl(0.09, 0.09, 0.3, '#222', -0.1, 0, 0, 10), cyl(0.09, 0.09, 0.3, '#222', 0.1, 0, 0, 10)); b.children.forEach(c => { c.rotation.x = Math.PI / 2; }); st.add(b); return b; });
    const sat = new THREE.Group(); sat.add(ball(0.35, '#d8dbe0', 0, 0, 0, 20)); for (let i = 0; i < 4; i++) { const a = cyl(0.012, 0.012, 1.6, '#d8dbe0', 0, 0, 0, 5); a.rotation.z = 1.9 + i * 0.12; a.rotation.y = i * 1.4; a.position.set(Math.cos(i * 1.4) * 0.6, -0.5, Math.sin(i * 1.4) * 0.6); sat.add(a); }
    st.add(sat);
    return { stage: st, gs, bins, sat };
  },
  draw(s, t, info) {
    const k = prog(t, 0, info.dur);
    s.sat.position.set(lerp(-4, 4, k), 6.6 + Math.sin(k * 3) * 0.3, -12); s.sat.rotation.z = t;
    s.gs.forEach((g, i) => { g.pose(addPose(POSE.holdFront, { armL: [1.2, 0.1, 0], armR: [1.2, -0.1, 0], elbowL: 1.9, elbowR: 1.9, headNod: -0.55, headTurn: lerp(0.5, -0.5, k), ...idle(t, 3 + i, 0.4) }));
      g.face(mixExpr(EXPR.neutral, EXPR.worried, prog(t, 0.6, 1.1)), t);
      g.updateWorldMatrix(true, true); g.parts.head.getWorldPosition(v); s.bins[i].position.set(v.x, v.y - 0.02, v.z + 0.5); s.bins[i].rotation.x = 0.5; });
    const e = at(info, 'early', 1.7); camMove(s.stage, t, [[0, { pos: [0, 1.6, 7.6], look: [0, 3.4, -3], fov: 48 }], [e, { pos: [0, 1.6, 7.0], look: [0, 3.5, -3], fov: 48 }], [e + 0.04, { pos: [0, 1.9, 5.6], look: [0, 3.0, -3], fov: 44 }], [info.dur, { pos: [0, 1.9, 5.3], look: [0, 3.0, -3], fov: 44 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, NIGHT_TINT);
    const p = project(s.stage, s.sat.position); if (Math.floor(t * 4) % 2 === 0) insT(g, 'beep', p.x + 70, p.y - 50, 46, { color: '#ffffff', stroke: CARD_INK });
    stamp(g, t, 'SPACE RACE', { at: at(info, 'Space', 2.0) - 0.05, x: 540, y: 560, size: 84, color: '#ffffff', fill: '#b8322a', rot: -0.06 });
    stamp(g, t, 'SOVIET EARLY LEAD', { at: at(info, 'early', 1.2) - 0.05, x: 540, y: 330, size: 62, color: '#ffd25a', rot: 0.04 });
    reactions(g, t, s, [{ fx: 'sweat', on: s.gs[0], at: 0.9 }, { fx: 'exclaim', on: s.gs[1], at: 0.5, until: 1.4 }]);
  },
});

// s04 — "So the idea was a show of force, to boost morale back home." War room: general slams the table, the others cheer.
registerShot('s04', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'warm', fov: 38, shadowSize: 9, target: [0, 1.5, 0] });
    const set = warRoom(st);
    const g1 = airGeneral({ seed: 5 }); g1.position.set(0, 0, -0.9); st.add(g1);
    const g2 = airGeneral({ seed: 7, skin: 'tan', over: { hair: 'bald' } }); g2.position.set(-1.7, 0, 1.3); g2.rotation.y = 2.6; st.add(g2);
    const g3 = airGeneral({ seed: 11, skin: 'light', over: { hair: 'swoop', hairColor: '#5a3a22' } }); g3.position.set(1.7, 0, 1.3); g3.rotation.y = -2.6; st.add(g3);
    return { stage: st, set, g1, g2, g3 };
  },
  draw(s, t, info) {
    const slam = at(info, 'force,', 1.0), boost = at(info, 'boost', 1.8);
    const up = prog(t, slam - 0.4, slam - 0.1), down = prog(t, slam - 0.1, slam);
    s.g1.pose(addPose(mixPose(POSE.stand, POSE.armsUp, up * (1 - down * 0.8)), { lean: down * 0.3, ...idle(t, 5, 0.5) }));
    s.g1.face(mixExpr(EXPR.smug, EXPR.angry, prog(t, slam - 0.4, slam)), t);
    [s.g2, s.g3].forEach((g, i) => { g.pose(mixPose(POSE.holdFront, POSE.armsUp, prog(t, boost, boost + 0.25))); g.face(mixExpr(EXPR.deadpan, EXPR.grin, prog(t, boost, boost + 0.3)), t); });
    camMove(s.stage, t, [[0, { pos: [0, 3.0, 5.6], look: [0, 1.8, -0.5], fov: 40 }], [slam, { pos: [0, 2.9, 5.0], look: [0, 1.8, -0.5], fov: 40 }], [slam + 0.05, { pos: [0, 2.6, 3.8], look: [0, 2.0, -0.6], fov: 36 }], [info.dur, { pos: [0, 2.6, 3.5], look: [0, 2.0, -0.6], fov: 36 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: slam, amp: 0.08, dur: 0.3 }]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#ffcf8a' });
    stamp(g, t, 'SHOW OF FORCE', { at: at(info, 'show', 0.6) - 0.05, x: 540, y: 380, size: 86, color: '#e23b2e', fill: 'rgba(250,244,226,0.92)', rot: -0.07 });
    stamp(g, t, 'BOOST MORALE', { at: at(info, 'morale', 2.0) - 0.05, x: 540, y: 1250, size: 80, color: '#ffffff', fill: '#2f8a4f', rot: 0.06 });
    reactions(g, t, s, [{ fx: 'stars', on: 'g2', at: at(info, 'boost', 1.8), scale: 0.8 }]);
  },
});

// s05 — "Fire a small nuclear warhead at the Moon..." A cartoon rocket lifts off a desert pad at night.
registerShot('s05', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'night', fov: 46, bg: NIGHT_BG, shadowSize: 10, target: [0, 2, 0], exposure: 1.2 });
    stars(st, { n: 600, seed: 12 }); st.add(floor(120, 120, '#4a3e40', 0, -20));
    const pad = rbox(4, 0.4, 4, '#7a7a80', 0, 0.2, 0, 0.05); st.add(pad);
    const gant = new THREE.Group(); for (const x of [-0.25, 0.25]) for (const z of [-0.25, 0.25]) gant.add(cyl(0.05, 0.05, 7, '#c8352b', x, 3.5, z, 6)); for (let i = 1; i < 7; i++) gant.add(rbox(0.6, 0.06, 0.6, '#c8352b', 0, i, 0, 0.01)); gant.position.set(-1.9, 0, 0); st.add(gant);
    const r = rocket({ s: 1.2 }); r.position.set(0, 0.4, 0); st.add(r);
    const m = moon({ r: 4, face: true }); m.position.set(9, 26, -40); st.add(m);
    const sm = smoke({ count: 14, size: 0.9, rise: 0.8, spread: 2.6, color: '#d8d2c8', seed: 3 }); sm.position.set(0, 0.2, -1.4); st.add(sm);
    return { stage: st, r, m, sm };
  },
  draw(s, t, info) {
    const go = 0.35, lift = Math.max(0, t - go); s.r.position.y = 0.4 + lift * lift * 2.2; s.r.rotation.z = -lift * 0.06;
    s.r.update(t, clamp((t - 0.1) / 0.25)); s.sm.update(t); s.sm.visible = t > 0.1;
    s.m.update(t, { lid: 0.1, mouth: 'o', worry: 0.8, look: [-0.4, -0.5] });
    camMove(s.stage, t, [[0, { pos: [2.5, 2.2, 13], look: [0, 4, 0], fov: 50 }], [info.dur, { pos: [2.2, 2.4, 12], look: [0.5, 7.5, -2], fov: 52 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: 0.3, amp: 0.05, dur: 1.2 }]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, NIGHT_TINT);
    stamp(g, t, 'SMALL NUCLEAR WARHEAD', { at: at(info, 'small', 0.4) - 0.05, x: 540, y: 330, size: 62, color: '#ffd25a', fill: 'rgba(20,24,50,0.85)', rot: -0.04 });
    reactions(g, t, s, [{ fx: 'speedlines', at: 0.5, until: info.dur }]);
  },
});

// s06 — "...and set it off on impact." Space: the rocket closes in on the (nervous) Moon. Cut on "impact".
registerShot('s06', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'night', fov: 40, bg: ['#04061a', '#0b1030', '#141a44'], shadow: false, exposure: 1.25 });
    stars(st, { n: 900, seed: 4, minEl: -1.5 });
    const m = moon({ r: 5 }); m.position.set(0, 3.4, -10); st.add(m);
    const r = rocket({ s: 0.55 }); st.add(r);
    return { stage: st, m, r };
  },
  draw(s, t, info) {
    const imp = at(info, 'impact.', info.dur - 0.3), k = clamp(t / Math.max(0.3, imp));
    s.r.position.set(lerp(-3.5, -1.4, k), lerp(-4.5, 0.7, k), lerp(6, -5.6, ease.in(k))); s.r.rotation.set(-0.9, 0, -0.5); s.r.update(t, 1); s.r.visible = t < imp;
    s.m.update(t, { lid: 0, mouth: 'o', worry: 1, look: [-0.6, -0.6] });
    camMove(s.stage, t, [[0, { pos: [0, 0.5, 14], look: [0, 2.6, -10], fov: 44 }], [info.dur, { pos: [0, 0.6, 11.5], look: [0, 2.8, -10], fov: 44 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: imp, amp: 0.12, dur: 0.4 }]);
  },
  overlay(g, t, info, s) {
    const imp = at(info, 'impact.', info.dur - 0.3);
    const p = project(s.stage, [-1.6, 3.7, -5.6]); flash2d(g, p.x, p.y, 230, (t - imp) / 0.9, { word: 'KA-POW', a: 1 });
    reactions(g, t, s, [{ fx: 'sweat', on: 'm', at: 0.1, until: imp, scale: 1.3 }, { fx: 'flash', at: imp, dur: 0.18 }]);
  },
});

// s07 — "The flash would have been faintly visible..." Moon close-up with the cartoon flash at the edge of its shadow.
registerShot('s07', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'night', fov: 36, bg: ['#04061a', '#0b1030', '#141a44'], shadow: false, exposure: 1.2, key: ['#fff4e0', 1.6, [10, 3, 4]] });
    stars(st, { n: 800, seed: 6, minEl: -1.5 });
    const m = moon({ r: 4.2 }); m.position.set(0, 0, -8); st.add(m);
    return { stage: st, m };
  },
  draw(s, t, info) {
    s.m.update(t, { lid: lerp(0, 0.45, prog(t, 0.6, 1.2)), mouth: 'flat', worry: lerp(1, 0.3, prog(t, 0.6, 1.2)), look: [0.4, 0.2], spin: t * 0.05 });
    camMove(s.stage, t, [[0, { pos: [0, 0, 10], look: [0, 0.3, -8], fov: 38 }], [info.dur, { pos: [0, 0, 8.6], look: [0, 0.3, -8], fov: 38 }]]);
  },
  overlay(g, t, info, s) {
    const p = project(s.stage, [-2.6, 2.2, -5.4]); flash2d(g, p.x, p.y, 120, 0.25 + 0.15 * Math.sin(t * 6), { a: 0.9 });
    stamp(g, t, 'VISIBLE FROM EARTH', { at: at(info, 'visible', 0.8) - 0.05, x: 540, y: 330, size: 70, color: '#ffd25a', fill: 'rgba(20,24,50,0.85)', rot: -0.05 });
  },
});

// s08 — "...from Earth, with the naked eye." A family on a porch squints up at a tiny faint flash on the Moon.
registerShot('s08', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'night', fov: 44, bg: NIGHT_BG, shadowSize: 7, target: [0, 1, 0], exposure: 1.25 });
    stars(st, { n: 600, seed: 21 });
    const set = porch(st);
    const dad = bean({ outfit: 'tee', colors: { main: '#c8603a' }, skin: 'tan', hair: 'swoop', hairColor: '#3a2618', seed: 31 }); dad.position.set(-0.7, set.deckY, 0.5); dad.rotation.y = Math.PI * 0.82; st.add(dad);
    const kid = bean({ outfit: 'tee', colors: { main: '#3f8ac8' }, skin: 'tan', hair: 'bowl', hairColor: '#3a2618', scale: 0.72, seed: 32 }); kid.position.set(0.7, set.deckY, 0.7); kid.rotation.y = -Math.PI * 0.85; st.add(kid);
    const m = moon({ r: 2.2, face: false }); m.position.set(0.6, 11, -26); st.add(m);
    return { stage: st, set, dad, kid, m };
  },
  draw(s, t, info) {
    s.dad.pose(addPose(POSE.handsHips, { headNod: -0.5, ...idle(t, 31, 0.4) })); s.dad.face(mixExpr(EXPR.suspicious, EXPR.shocked, prog(t, 0.9, 1.1)), t);
    s.kid.pose(addPose(point(POSE.stand, 'L', 1, { up: 0.9 }), { headNod: -0.6, ...idle(t, 32, 0.4) })); s.kid.face(EXPR.happy, t);
    camMove(s.stage, t, [[0, { pos: [0, 1.6, 6.2], look: [0, 4.2, -6], fov: 50 }], [info.dur, { pos: [0, 1.6, 5.6], look: [0, 4.3, -6], fov: 50 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, NIGHT_TINT);
    const p = project(s.stage, [0.0, 11.7, -24.2]); flash2d(g, p.x, p.y, 40, 0.3 + 0.1 * Math.sin(t * 9), { a: 0.75 });
    stamp(g, t, 'NAKED EYE', { at: at(info, 'naked', 0.8) - 0.05, x: 540, y: 1130, size: 90, color: '#ffffff', fill: '#b8322a', rot: 0.05 });
    reactions(g, t, s, [{ fx: 'exclaim', on: 'kid', at: 0.3, until: 1.3 }]);
  },
});

// lab helpers (s09, s10): young scientist (lab coat), chalkboard redrawn per frame
function labSet(T, o = {}) {
  const st = toonStage(T, { light: 'warm', fov: 38, shadowSize: 8, target: [0, 1.5, -1] });
  const set = lab(st);
  const sci = bean({ outfit: 'labcoat', skin: 'light', hair: 'swoop', hairColor: '#2a1c14', browColor: '#2a1c14', seed: 41, colors: { main: '#f4f2ec', legs: '#3a3f4a' } });
  sci.position.set(o.x ?? -0.9, 0, o.z ?? -1.4); st.add(sci);
  return { stage: st, set, sci };
}
function drawBoard(b, t, dust) {
  const x = b.x, W = 1024, H = 600; x.fillStyle = '#2f4a3a'; x.fillRect(0, 0, W, H);
  x.strokeStyle = 'rgba(240,240,225,0.9)'; x.fillStyle = 'rgba(240,240,225,0.9)'; x.lineWidth = 6; x.lineCap = 'round';
  x.beginPath(); x.arc(330, 300, 110, 0, 7); x.stroke(); x.font = '700 40px "Fredoka", sans-serif'; x.fillText('MOON', 280, 470);
  for (let i = 0; i < 4; i++) { const r = 110 + dust * (40 + i * 45); x.globalAlpha = clamp(dust * 1.5 - i * 0.25) * 0.8; x.setLineDash([14, 14]); x.beginPath(); x.arc(330, 300, r, 0, 7); x.stroke(); }
  x.setLineDash([]); x.globalAlpha = 1;
  x.font = '700 46px "Fredoka", sans-serif'; x.font = '700 40px "Fredoka", sans-serif'; x.fillText('r(t) = ?', 520, 160); x.fillText('dust cloud', 520, 260); x.fillText('v = ...', 520, 360);
  b.tex.needsUpdate = true;
}
// s09 — "But here's the wild part... a young Carl Sagan was on the team." Scientist turns from the board to us.
registerShot('s09', { kind: '3d',
  init(T) { const s = labSet(T); drawBoard(s.set.board, 0, 0.2); return s; },
  draw(s, t, info) {
    const turn = at(info, 'young', 1.4) - 0.2, k = ease.inOut(prog(t, turn, turn + 0.4));
    s.sci.rotation.y = lerp(Math.PI * 0.92, 0.2, k);
    s.sci.pose(addPose(mixPose(point(POSE.stand, 'R', 1, { up: 0.5 }), POSE.relaxed, k), idle(t, 41, 0.5))); s.sci.face(mixExpr(EXPR.neutral, EXPR.smug, k), t);
    camMove(s.stage, t, [[0, { pos: [0, 2.8, 6.5], look: [0, 2.6, -2], fov: 40 }], [turn, { pos: [-0.2, 2.6, 5.8], look: [-0.4, 2.4, -2], fov: 40 }], [turn + 0.05, { pos: [-0.6, 2.3, 3.0], look: [-0.9, 2.1, -1.4], fov: 36 }], [info.dur, { pos: [-0.6, 2.3, 2.7], look: [-0.9, 2.1, -1.4], fov: 36 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#ffe0b0' });
    const sg = at(info, 'Carl', 2.0) - 0.05;
    stamp(g, t, 'WAIT, WHAT?', { at: 0.15, x: 540, y: 360, size: 76, color: '#ffd25a', rot: -0.06 });
    stamp(g, t, 'CARL SAGAN', { at: sg, x: 540, y: 1060, size: 96, color: '#ffffff', fill: '#2a6fd6', rot: -0.04 });
    if (t > sg + 0.2) insT(g, 'doctoral student, 1958', 540, 1185, 46, { color: '#ffffff', stroke: CARD_INK, a: clamp((t - sg - 0.2) / 0.3) });
    reactions(g, t, s, [{ fx: 'sparkle', on: 'sci', at: sg + 0.1 }]);
  },
});
// s10 — "His job: working out how the dust cloud would spread." Chalkboard: rings of dust spreading round the Moon.
registerShot('s10', { kind: '3d',
  init(T) { return labSet(T, { x: 2.6, z: -1.2 }); },
  draw(s, t, info) {
    drawBoard(s.set.board, t, prog(t, at(info, 'dust', 1.0) - 0.2, info.dur));
    s.sci.rotation.y = Math.PI * 0.85; s.sci.pose(addPose(point(POSE.stand, 'R', 1, { up: 0.4 }), idle(t, 41, 0.5))); s.sci.face(EXPR.neutral, t);
    camMove(s.stage, t, [[0, { pos: [-0.3, 3.3, 6.6], look: [-0.3, 3.4, -2.9], fov: 44 }], [info.dur, { pos: [-0.3, 3.4, 6.0], look: [-0.3, 3.5, -2.9], fov: 44 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#ffe0b0' });
    stamp(g, t, 'DUST CLOUD MATH', { at: at(info, 'dust', 1.0) - 0.05, x: 540, y: 1150, size: 80, color: '#ffffff', fill: '#b8322a', rot: 0.05 });
  },
});

// s11 — "A hydrogen bomb was too heavy," A general strains at a huge crate stencilled "H-BOMB"; it won't budge.
registerShot('s11', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'warm', fov: 40, shadowSize: 8, target: [0, 1, 0] });
    st.add(floor(40, 40, '#8a8a80', 0, -5)); st.add(plane(40, 12, '#b8b4a4', 0, 6, -5));
    const cr = PR.crate({ s: 2.6, color: '#6a7448' }); cr.position.set(0.85, 0, -0.6); st.add(cr);
    const lbl = insLabel('H-BOMB'); lbl.position.set(0.85, 1.4, 0.72); lbl.scale.setScalar(0.8); st.add(lbl);
    const g1 = airGeneral({ seed: 5 }); g1.position.set(-0.95, 0, 0.6); g1.rotation.y = 1.2; st.add(g1);
    return { stage: st, g1 };
  },
  draw(s, t, info) {
    s.g1.pose(addPose({ ...POSE.stand, armL: [1.3, 0.1, 0], armR: [1.3, -0.1, 0], elbowL: 0.4, elbowR: 0.4, lean: 0.45, legL: [0.4, 0], legR: [-0.5, 0], kneeL: 0.5 }, tremble(t, 0.03)));
    s.g1.face(mixExpr(EXPR.angry, EXPR.panic, prog(t, 0.6, 1.0)), t);
    camMove(s.stage, t, [[0, { pos: [0, 2.2, 10.5], look: [0, 1.6, 0], fov: 42 }], [info.dur, { pos: [0, 2.2, 9.6], look: [0, 1.6, 0], fov: 42 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#ffcf8a' });
    stamp(g, t, 'TOO HEAVY', { at: at(info, 'heavy,', 1.0) - 0.05, x: 540, y: 420, size: 104, color: '#e23b2e', fill: 'rgba(250,244,226,0.92)', rot: -0.1 });
    reactions(g, t, s, [{ fx: 'sweat', on: 'g1', at: 0.2 }]);
  },
});
function insLabel(txt) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 160; const x = c.getContext('2d'); x.fillStyle = 'rgba(0,0,0,0)'; x.fillRect(0, 0, 512, 160);
  x.fillStyle = '#f2e8c8'; x.font = '900 120px "Fredoka", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt, 256, 86);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.62), new THREE.MeshBasicMaterial({ map: tex, transparent: true })); m.userData.noOutline = true; return m;
}

// s12 — "so they picked a 1.7 kiloton warhead." Counter card: W25, 1.7 kilotons, small + lightweight.
registerShot('s12', {
  draw(g, t, info) {
    voidBg(g, '#1c2650', '#0a0c1c');
    drawInsert(g, { type: 'counter', title: 'W25 WARHEAD', value: 1.7, from: 0, decimals: 1, suffix: ' kt', lines: ['small · lightweight'], color: '#ffcf4a' }, t);
  },
});

// s13 — "In January 1959, the Air Force canceled it." Folder stamped CANCELED.
registerShot('s13', {
  draw(g, t, info) {
    voidBg(g, '#3a2a22', '#140e10');
    folder(g, t, { at: 0, y: 900, tab: 'TOP SECRET', title: 'PROJECT A119', lines: ['Nuclear test', 'on the Moon', 'MAY 1958 – JAN 1959'] });
    stamp(g, t, 'CANCELED', { at: at(info, 'canceled', 1.4) - 0.05, x: 540, y: 980, size: 130, color: '#e23b2e', rot: -0.2 });
    stamp(g, t, 'JAN 1959', { at: at(info, 'January', 0.3) - 0.05, x: 540, y: 330, size: 80, color: '#ffd25a', rot: 0.04 });
  },
});
// s14 — "The risks outweighed the benefits." A balance: RISKS heavy, BENEFITS light.
registerShot('s14', {
  draw(g, t, info) {
    voidBg(g, '#1c2650', '#0a0c1c');
    const tip = ease.outBack(prog(t, at(info, 'outweighed', 0.5) - 0.1, at(info, 'outweighed', 0.5) + 0.4)) * 0.32;
    g.save(); g.translate(540, 820); g.lineWidth = 12; g.strokeStyle = CARD_INK; g.lineCap = 'round';
    g.fillStyle = '#c9a14a'; g.beginPath(); g.moveTo(-60, 560); g.lineTo(60, 560); g.lineTo(18, 0); g.lineTo(-18, 0); g.closePath(); g.fill(); g.stroke();
    g.rotate(-tip); g.fillStyle = '#e8c86a'; g.beginPath(); g.roundRect(-420, -16, 840, 32, 16); g.fill(); g.stroke();
    for (const [sx, lab, col] of [[-1, 'RISKS', '#e23b2e'], [1, 'BENEFITS', '#2f8a4f']]) {
      g.save(); g.translate(sx * 380, 0); g.rotate(tip); g.beginPath(); g.moveTo(0, 0); g.lineTo(-120, 220); g.moveTo(0, 0); g.lineTo(120, 220); g.stroke();
      g.fillStyle = col; g.beginPath(); g.roundRect(-170, 220, 340, 120, 30); g.fill(); g.stroke(); insT(g, lab, 0, 280, 62, { color: '#ffffff', stroke: CARD_INK, maxW: 300 }); g.restore(); }
    g.restore();
    insT(g, 'RISKS > BENEFITS', 540, 400, 92, { color: '#ffd25a', stroke: CARD_INK, a: clamp((t - 0.2) / 0.3), maxW: 980 });
  },
});

// s15 — "The reports were destroyed in 1987..." A clerk drops the A119 reports into a shredder.
registerShot('s15', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'warm', fov: 38, shadowSize: 8, target: [0, 1, 0] });
    st.add(floor(40, 40, '#6a5440', 0, -5)); st.add(plane(40, 12, '#c8bea0', 0, 6, -3));
    const cab = new THREE.Group(); for (let i = 0; i < 3; i++) cab.add(rbox(1.2, 0.9, 1.0, '#7a8a7a', 0, 0.45 + i * 0.92, 0, 0.04)); cab.position.set(-2.4, 0, -2.2); st.add(cab);
    const sh = new THREE.Group(); sh.add(rbox(1.3, 1.1, 0.9, '#5a6070', 0, 0.55, 0, 0.05), rbox(1.36, 0.18, 0.95, '#3a3f4a', 0, 1.15, 0, 0.04)); sh.position.set(0.7, 0, 0); st.add(sh);
    const c = clerk({ seed: 13 }); c.position.set(-0.6, 0, 0.3); c.rotation.y = 0.9; st.add(c);
    const docs = []; for (let i = 0; i < 4; i++) { const d = rbox(0.5, 0.05, 0.65, '#f4f0e0', 0, 0, 0, 0.01); st.add(d); docs.push(d); }
    return { stage: st, c, sh, docs };
  },
  draw(s, t, info) {
    s.c.pose(addPose(POSE.holdFront, idle(t, 13, 0.5))); s.c.face(EXPR.deadpan, t);
    s.docs.forEach((d, i) => { const k = clamp((t - 0.25 - i * 0.35) / 0.45); const y = k < 1 ? lerp(1.5 + i * 0.07, 1.25, k) : 1.25 - (t - 0.7 - i * 0.35) * 2.5;
      d.position.set(lerp(0.0, 0.7, ease.inOut(k)), Math.max(0.6, y), lerp(0.6, 0, k)); d.rotation.set(lerp(0, 1.4, k), 0, 0); d.visible = y > 0.75; });
    s.sh.position.y = Math.sin(t * 40) * 0.01;
    camMove(s.stage, t, [[0, { pos: [0, 2.6, 8.8], look: [0, 1.4, 0], fov: 40 }], [info.dur, { pos: [0, 2.5, 8.0], look: [0.1, 1.4, 0], fov: 40 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#ffcf8a' });
    stamp(g, t, 'DESTROYED 1987', { at: at(info, 'destroyed', 0.6) - 0.05, x: 540, y: 400, size: 88, color: '#e23b2e', fill: 'rgba(250,244,226,0.92)', rot: -0.08 });
    insT(g, 'A119 REPORTS', 540, 1130, 56, { color: '#ffffff', stroke: CARD_INK, a: clamp((t - 0.2) / 0.3) });
  },
});

// s16 — PAYOFF "...and the Moon remains un-nuked." Same rooftop + framing as frame 1: the general lowers the pointer,
// the Moon smiles. Ends with the general raising the pointer again -> loops into frame 1.
registerShot('s16', { kind: '3d',
  init(T) { return roofSet(T); },
  draw(s, t, info) {
    const back = prog(t, info.dur - 0.45, info.dur);
    s.g.pose(addPose(mixPose(shrug(POSE.stand, 1), point(POSE.stand, 'R', 0.6, { up: 0.75 }), back), { ...idle(t, 5, 0.6), headNod: -0.25 }));
    s.g.face(mixExpr(EXPR.sad, EXPR.smug, back), t);
    aimStick(s, back);
    s.m.update(t, { lid: 0.25, mouth: 'smile', worry: 0, look: [0, 0] });
    camMove(s.stage, t, [[0, ROOF1], [info.dur, ROOF0]], ease.inOut);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, NIGHT_TINT);
    stamp(g, t, 'STILL UN-NUKED', { at: at(info, 'Moon', 0.2) - 0.05, x: 540, y: 330, size: 90, color: '#ffffff', fill: '#2f8a4f', rot: -0.05 });
    reactions(g, t, s, [{ fx: 'sparkle', on: 'm', at: 0.3, scale: 1.4 }]);
  },
});
