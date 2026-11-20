// The Battle for Castle Itter — 15 shots, Toon 3D + BEANMEN effects. "Wow / absurd allies".
// TONE GUARD: no Nazi symbols (SS = dark generic silhouettes), nobody is shown hit, Gangl's death said plainly over a quiet card.
import { registerShot, ease, prog, clamp, lerp, noise } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, point, shrug, tremble, nod, walk } from '/kits/toon3d/rig.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { drawInsert, dimScene } from '/kits/toon3d/insert.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import {
  at, THREE, toonStage, gi, german, gangl, shadowTrooper, statesman, rifle, AIM, holdRifle, tank, archWall, pine, alps, castle, hill,
  castleView, hall, battlement, hookCaption, stamp, tag, flash, memorial, PR, rbox, cyl, ball, box, floor, smoke, embers, fire, glow, sunnySky,
} from './_lib.js';

const hillY = (x, z) => { const u = 1 - (x / 22) ** 2 - ((z + 4) / 16) ** 2; return u > 0 ? 6 * Math.sqrt(u) - 0.5 : 0; };
const GOLD = '#ffd25a', RED = '#ff5a4a';
const HOOK = [[['on', '#ffffff'], ['the', '#ffffff'], ['SAME', GOLD]], [['side', RED]]];
const HOOK_UNTIL = 3.5;   // top caption on screen 0 -> 3.5 s (spans s01 + s02)

// ---------------------------------------------------------------- the hook window (s01 = frame 1, s15 = payoff; same framing -> loop)
function windowSet(T) {
  const st = toonStage(T, { light: 'sunny', fov: 36, shadowSize: 8, target: [0, 2, 0] });
  const sky = sunnySky(st, { clouds: 5, seed: 6 });
  st.add(floor(200, 200, '#7fa85a', 0, 0));
  const wall = archWall({ W: 14, H: 9, w: 3.8, y0: 1.5, h: 3.6 }); wall.position.set(0, 0, 0); st.add(wall);
  const inside = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.MeshBasicMaterial({ color: '#3a2c28' })); inside.position.set(0, 4, -3.2); st.add(inside);
  const plat = rbox(5, 0.5, 2.5, '#5a4436', 0, 0.25, -1.9, 0.05); st.add(plat);
  const a = gi({ seed: 9 }); a.position.set(-0.85, 0.5, -1.45); st.add(a);
  const b = german({ seed: 11 }); b.position.set(0.85, 0.5, -1.45); st.add(b);
  const ra = rifle(), rb = rifle(); st.add(ra, rb);
  const sm = smoke({ count: 6, size: 0.45, rise: 0.7, spread: 3.5, seed: 5, life: 2.5, drift: [0.6, 0], color: '#e8e4dc' }); sm.position.set(0, 3.3, 0.9); sm.visible = false; st.add(sm);   // puffs sat behind the hook caption: hidden
  for (const x of [-4.8, 4.8]) { const p = pine(1.8); p.position.set(x, 0, 3.5); st.add(p); }
  return { stage: st, sky, a, b, ra, rb, sm };
}
const WIN0 = { pos: [0.0, 2.6, 8.4], look: [0, 2.15, -1], fov: 38 }, WIN1 = { pos: [0.0, 2.6, 7.7], look: [0, 2.2, -1], fov: 37 };
function winDraw(s, t, o = {}) {
  s.sky.update(t); s.sm.update(t + 3);
  const aim = o.aim ?? 1, rec = (p) => Math.max(0, 1 - (((t + p) % 0.42) / 0.12));
  // aim slightly outward (to screen left / right), like firing out of the window at two angles
  s.a.rotation.y = lerp(0.0, -0.18, aim) + (o.turnA || 0); s.b.rotation.y = lerp(0.0, 0.18, aim) + (o.turnB || 0);
  const pa = mixPose(POSE.stand, AIM, aim), pb = mixPose(POSE.stand, AIM, aim);
  s.a.pose(addPose(pa, { ...idle(t, 3, 0.3), headTurn: o.lookA || 0 })); s.b.pose(addPose(pb, { ...idle(t, 5, 0.3), headTurn: o.lookB || 0 }));
  s.a.face(o.faceA || mixExpr(EXPR.deadpan, EXPR.angry, 0.35), t); s.b.face(o.faceB || mixExpr(EXPR.deadpan, EXPR.angry, 0.35), t);
  holdRifle(s.a, s.ra, aim, aim * rec(0)); holdRifle(s.b, s.rb, aim, aim * rec(0.21));
}
function winFlash(g, s, t, aim = 1) { if (aim < 0.9) return; flash(g, s.stage, s.ra.muzzle, t, 0.42, 0, { r: 80 }); flash(g, s.stage, s.rb.muzzle, t, 0.42, 0.21, { r: 80 }); }

// s01 — HOOK: a GI and a German army soldier side by side at a castle window, both firing outward. Already moving at frame 1.
registerShot('s01', { kind: '3d',
  init(T) { return windowSet(T); },
  draw(s, t, info) { winDraw(s, t); camMove(s.stage, t, [[0, WIN0], [info.dur, WIN1]], ease.out); },
  overlay(g, t, info, s) {
    winFlash(g, s, t); sunnyLook(g, t, { rays: { from: [-70, -60], strength: 0.5 }, tint: '#ffd49a' });
    hookCaption(g, t, HOOK, { y: 300, size: 104, pre: 1 });
  },
});
// s02 — punch-in: the two of them glance at each other mid-fight, nod, back to it.
registerShot('s02', { kind: '3d',
  init(T) { return windowSet(T); },
  draw(s, t, info) {
    const gl = ease.inOut(prog(t, 0.25, 0.55)) * (1 - ease.inOut(prog(t, 1.3, 1.6)));
    winDraw(s, t, { lookA: gl * -0.7, lookB: gl * 0.7, faceA: mixExpr(EXPR.deadpan, EXPR.suspicious, gl), faceB: mixExpr(EXPR.deadpan, EXPR.smug, gl) });
    camMove(s.stage, t, [[0, { pos: [0.0, 3.05, 7.6], look: [0, 2.5, -1.4], fov: 34 }], [info.dur, { pos: [0.0, 3.05, 7.0], look: [0, 2.55, -1.4], fov: 33 }]]);
  },
  overlay(g, t, info, s) {
    winFlash(g, s, t); sunnyLook(g, t, { rays: false, tint: '#ffd49a' });
    hookCaption(g, t, HOOK, { y: 300, size: 104, pre: 1, until: HOOK_UNTIL - info.shot.start });
    stamp(g, t, 'USA', { at: at(info, 'Americans', 0.1), x: 300, y: 1560, size: 66, color: '#ffffff', fill: '#2f5aa8', rot: -0.08 });
    stamp(g, t, 'GERMANY', { at: at(info, 'Germans', 0.5), x: 790, y: 1560, size: 66, color: '#ffffff', fill: '#5a5f55', rot: 0.08 });
  },
});

// s03 — "May fifth, 1945. Itter Castle, Austria." The castle on its hill, the Alps behind. Push-in.
registerShot('s03', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 22, target: [0, 6, -4] }); const v = castleView(st); return { stage: st, v }; },
  draw(s, t, info) { s.v.update(t); camMove(s.stage, t, [[0, { pos: [-6, 9, 40], look: [0, 9.5, -4], fov: 40 }], [info.dur, { pos: [-4, 9.5, 31], look: [0, 10, -4], fov: 38 }]]); },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: { from: [-70, -60], strength: 0.6 }, tint: '#ffd49a' });
    stamp(g, t, 'MAY 5, 1945', { at: 0.05, x: 300, y: 320, size: 72, color: '#e23b2e', fill: 'rgba(250,244,226,0.92)', rot: -0.1 });
    stamp(g, t, 'ITTER CASTLE, AUSTRIA', { at: at(info, 'Itter', 1.0) - 0.1, x: 540, y: 1460, size: 64, color: '#ffffff', fill: '#2f6a3a', rot: -0.04 });
  },
});

// s04 — "Inside: famous French prisoners, including two former prime ministers." Stone hall, VIPs in suits; tags pop on the two PMs.
registerShot('s04', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'warm', fov: 38, shadowSize: 8, target: [0, 1.5, 0] }); const set = hall(st);
    const P = [statesman({ seed: 41, suit: '#2e3446' }), statesman({ seed: 43, suit: '#3a3a3e', hair: 'swoop', hairColor: '#3a2a20', moustache: true }), statesman({ seed: 45, suit: '#4a4036', hair: 'bald' }), statesman({ seed: 47, suit: '#34404a', hair: 'curly', hairColor: '#6a6460', skin: 'light' })];
    [[-2.6, 0.6, 0.35], [-0.9, 1.2, 0.1], [0.9, 1.2, -0.1], [2.6, 0.6, -0.35]].forEach(([x, z, r], i) => { P[i].position.set(x, 0, z); P[i].rotation.y = r; st.add(P[i]); });
    return { stage: st, set, P };
  },
  draw(s, t, info) {
    const pm = at(info, 'two', 1.6) - 0.15;
    s.P.forEach((p, i) => { p.pose(addPose(i % 2 ? POSE.handsHips : POSE.relaxed, idle(t, 2 + i, 0.4))); p.face(i === 1 || i === 2 ? mixExpr(EXPR.neutral, EXPR.smug, prog(t, pm, pm + 0.3)) : EXPR.neutral, t); });
    if (t < pm) camMove(s.stage, t, [[0, { pos: [0, 3.0, 10.5], look: [0, 2.0, 0.5], fov: 40 }], [pm, { pos: [0, 2.95, 9.6], look: [0, 2.0, 0.5], fov: 40 }]]);
    else camMove(s.stage, t - pm, [[0, { pos: [0, 2.7, 8.6], look: [0, 2.3, 1.0], fov: 38 }], [info.dur - pm, { pos: [0, 2.7, 8.0], look: [0, 2.3, 1.0], fov: 37 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: { from: [200, -60], strength: 0.4 }, tint: '#ffcf8a' });
    stamp(g, t, 'INSIDE', { at: 0.0, x: 540, y: 320, size: 92, color: '#2f5aa8', fill: 'rgba(250,244,226,0.92)', rot: -0.06 });
    const pm = at(info, 'two', 1.6) - 0.15, mn = at(info, 'ministers.', 2.4) - 0.3;
    stamp(g, t, 'FRENCH VIP PRISONERS', { at: at(info, 'French', 0.5), x: 540, y: 1500, size: 58, color: '#ffffff', fill: '#2f5aa8', rot: -0.03 });
    if (t > pm) { tag(g, t, s.stage, s.P[1], 'EX-PRIME MINISTER', { at: mn - 0.1, h: 3.0, size: 30, dx: 90, dy: -60 }); tag(g, t, s.stage, s.P[2], 'EX-PRIME MINISTER', { at: mn + 0.15, h: 3.0, size: 30, dx: -90, dy: 40 }); }
  },
});

// s05 — "Outside: Waffen-SS troops, coming to attack." Dusk below the castle: dark faceless silhouettes advance through the pines.
registerShot('s05', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'dusk', fov: 40, shadowSize: 16, target: [0, 0, 2] });
    const v = castleView(st, { noSky: true, grass: '#4f6a46', hillC: '#4a6a40', maxZ: 2 });
    const tr = []; for (let i = 0; i < 9; i++) { const b = shadowTrooper({ seed: 21 + i }); b.position.set(-3.2 + (i % 5) * 1.6 + (i > 4 ? 0.8 : 0), 0, 12); b.rotation.y = Math.PI; st.add(b); const r = rifle(); r.traverse(m => { if (m.material && !m.userData.isHull) m.material = new THREE.MeshBasicMaterial({ color: '#1d1a22' }); }); st.add(r); tr.push([b, r]); }
    for (const [x, z] of [[-9, 8], [9, 9]]) { const p = pine(2.2, '#2e4a36'); p.position.set(x, 0, z); st.add(p); }
    return { stage: st, v, tr };
  },
  draw(s, t, info) {
    s.tr.forEach(([b, r], i) => { const ph = t * 1.4 + i * 0.37; b.position.z = (i > 4 ? 15 : 12.5) - t * 0.9; b.position.y = hillY(b.position.x, b.position.z); b.pose(addPose(walk(ph, { speed: 1.4, amp: 0.6 }), { armR: [0.6, 0.2, 0.4], elbowR: 1.2, armL: [0.7, 0.1, 0.3], elbowL: 1.0, lean: 0.12 })); holdRifle(b, r, 0.15); });
    camMove(s.stage, t, [[0, { pos: [1.5, 3.2, 24], look: [0, 6.5, -4], fov: 44 }], [info.dur, { pos: [1.2, 3.6, 22], look: [0, 7.0, -4], fov: 42 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#c86a5a', tintAmount: 0.25 });
    stamp(g, t, 'OUTSIDE', { at: 0.0, x: 540, y: 320, size: 92, color: '#ffffff', fill: '#b8322a', rot: -0.06 });
    stamp(g, t, 'WAFFEN-SS', { at: at(info, 'Waffen-SS', 0.5), x: 540, y: 1500, size: 70, color: '#ffffff', fill: '#26222c', rot: 0.04 });
  },
});

// s06 — "Defending the castle? A small group of American tank soldiers..." Courtyard gate, a Sherman, three GIs. "?" then the tank.
registerShot('s06', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 12, target: [0, 1, -1] }); const sky = sunnySky(st, { clouds: 5, seed: 8 });
    st.add(floor(200, 200, '#b8a888', 0, 0));
    const wall = archWall({ W: 26, H: 9, w: 5.5, y0: 0.0, h: 6.8 }); wall.position.set(0, 0, -6); st.add(wall);
    const tk = tank(); tk.position.set(0, 0, -2.6); st.add(tk);
    const G = [gi({ seed: 9 }), gi({ seed: 13, skin: 'brown' }), gi({ seed: 15, skin: 'tan' })]; [[-1.55, 2.2, 0.3], [1.55, 2.0, -0.3], [-3.2, 0.5, 0.3]].forEach(([x, z, r], i) => { G[i].position.set(x, 0, z); G[i].rotation.y = r; st.add(G[i]); });
    const rs = G.map(() => { const r = rifle(); st.add(r); return r; });
    return { stage: st, sky, tk, G, rs };
  },
  draw(s, t, info) {
    s.sky.update(t); const q = at(info, 'small', 1.2) - 0.1;
    s.G.forEach((b, i) => { b.pose(addPose(POSE.attention, idle(t, 4 + i, 0.4))); b.face(mixExpr(EXPR.neutral, EXPR.smug, prog(t, q, q + 0.3)), t); holdRifle(b, s.rs[i], 0); });
    s.tk.turret.rotation.y = Math.sin(t * 0.8) * 0.15;
    if (t < q) camMove(s.stage, t, [[0, { pos: [0, 4.2, 6.5], look: [0, 4.6, -6], fov: 42 }], [q, { pos: [0, 4.0, 6.0], look: [0, 4.3, -6], fov: 42 }]]);
    else camMove(s.stage, t - q, [[0, { pos: [0.3, 2.9, 11.5], look: [0, 1.9, 0], fov: 44 }], [info.dur - q, { pos: [0.3, 2.8, 10.6], look: [0, 1.9, 0], fov: 44 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: { from: [-70, -60], strength: 0.5 }, tint: '#ffd49a' });
    const q = at(info, 'small', 1.2) - 0.1;
    if (t < q) { dimScene(g, 3, 0.25); stamp(g, t, 'DEFENDERS?', { at: 0.05, x: 540, y: 900, size: 110, color: '#ffffff', fill: '#2a2a3a', rot: -0.05 }); }
    else { stamp(g, t, 'U.S. TANK CREW', { at: q + 0.05, x: 540, y: 330, size: 74, color: '#ffffff', fill: '#2f5aa8', rot: -0.05 }); reactions(g, t, s, [{ fx: 'sparkle', on: s.G[0], at: q + 0.2, scale: 0.7 }]); }
  },
});

// s07 — "German army soldiers who had joined the resistance..." Three German army soldiers in field grey; stamps.
registerShot('s07', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 38, shadowSize: 9, target: [0, 1.5, 0] }); const sky = sunnySky(st, { clouds: 5, seed: 9 });
    st.add(floor(200, 200, '#b8a888', 0, 0));
    const wall = archWall({ W: 26, H: 9, w: 3, y0: 2.5, h: 3 }); wall.position.set(0, 0, -3); st.add(wall);
    const G = [german({ seed: 11 }), german({ seed: 17, hair: 'bowl', hairColor: '#c9a46a' }), german({ seed: 19, skin: 'light', hairColor: '#3a2a20' })]; [[-1.2, 0.6, 0.25], [0, 1.3, 0], [1.2, 0.6, -0.25]].forEach(([x, z, r], i) => { G[i].position.set(x, 0, z); G[i].rotation.y = r; st.add(G[i]); });
    const rs = G.map(() => { const r = rifle(); st.add(r); return r; });
    return { stage: st, sky, G, rs };
  },
  draw(s, t, info) {
    s.sky.update(t); const j = at(info, 'joined', 1.0) - 0.1;
    s.G.forEach((b, i) => { b.pose(addPose(POSE.attention, { ...idle(t, 7 + i, 0.4), ...nod(t * 1.2 + i) })); b.face(mixExpr(EXPR.deadpan, EXPR.angry, 0.2 + 0.3 * prog(t, j, j + 0.3)), t); holdRifle(b, s.rs[i], 0); });
    camMove(s.stage, t, [[0, { pos: [0, 2.7, 9.6], look: [0, 1.9, 0.4], fov: 40 }], [info.dur, { pos: [0, 2.6, 8.6], look: [0, 1.9, 0.4], fov: 38 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: { from: [-70, -60], strength: 0.4 }, tint: '#ffd49a' });
    stamp(g, t, 'GERMAN ARMY', { at: 0.05, x: 540, y: 330, size: 80, color: '#ffffff', fill: '#5a5f55', rot: -0.05 });
    stamp(g, t, 'JOINED THE RESISTANCE', { at: at(info, 'joined', 1.0) - 0.05, x: 540, y: 1480, size: 60, color: '#ffffff', fill: '#b8322a', rot: 0.03 });
  },
});

// s08 — "and the French prisoners themselves, picking up rifles." The suited statesmen lift rifles out of a crate. Determined.
registerShot('s08', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'warm', fov: 36, shadowSize: 8, target: [0, 1.5, 0] }); const set = hall(st, { table: false });
    const cr = PR.crate({ s: 1.0, color: '#6a5a32' }); cr.position.set(0, 0, 0.2); st.add(cr);
    const P = [statesman({ seed: 43, suit: '#3a3a3e', hair: 'swoop', hairColor: '#3a2a20', moustache: true }), statesman({ seed: 45, suit: '#4a4036', hair: 'bald' }), statesman({ seed: 47, suit: '#34404a', hair: 'curly', hairColor: '#6a6460', skin: 'light' })];
    [[-1.15, 0.7, 0.3], [1.15, 0.7, -0.3], [0, -0.5, 0]].forEach(([x, z, r], i) => { P[i].position.set(x, 0, z); P[i].rotation.y = r; st.add(P[i]); });
    const rs = P.map(() => { const r = rifle(); st.add(r); return r; });
    return { stage: st, set, P, rs };
  },
  draw(s, t, info) {
    const pk = at(info, 'picking', 1.0) - 0.2;
    s.P.forEach((p, i) => { const k = ease.outBack(prog(t, pk + i * 0.12, pk + 0.5 + i * 0.12)); p.pose(addPose(mixPose(POSE.holdFront, AIM, k * 0.6), idle(t, 3 + i, 0.4))); p.face(mixExpr(EXPR.worried, EXPR.angry, k), t); holdRifle(p, s.rs[i], lerp(0, 0.75, k)); });
    camMove(s.stage, t, [[0, { pos: [0, 2.9, 9.0], look: [0, 1.9, 0], fov: 38 }], [info.dur, { pos: [0, 2.6, 7.8], look: [0, 2.0, 0], fov: 36 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: { from: [200, -60], strength: 0.4 }, tint: '#ffcf8a' });
    stamp(g, t, 'THE PRISONERS TOO', { at: at(info, 'French', 0.3) - 0.05, x: 540, y: 330, size: 70, color: '#ffffff', fill: '#2f5aa8', rot: -0.05 });
    reactions(g, t, s, [{ fx: 'exclaim', on: s.P[2], at: at(info, 'picking', 1.0), color: '#ff3b30', until: info.dur }]);
  },
});

// s09 — "But here's the part that sounds made up..." All three groups on one battlement, side by side, firing into the valley.
function wallSet(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 12, target: [0, 1, -1] }); const sky = sunnySky(st, { clouds: 6, seed: 2 });
  const set = battlement(st); alps(st, { seed: 5 });
  const D = [gi({ seed: 9 }), german({ seed: 11 }), statesman({ seed: 43, suit: '#3a3a3e', hair: 'swoop', hairColor: '#3a2a20', moustache: true }), gi({ seed: 13, skin: 'brown' }), german({ seed: 17, hair: 'bowl', hairColor: '#c9a46a' })];
  D.length = 4; D.forEach((b, i) => { b.position.set(-1.95 + i * 1.3, 0.75, -0.6); b.rotation.y = (i - 1.5) * -0.08; st.add(b); });
  st.add(rbox(30, 0.75, 1.4, '#bfb6a2', 0, 0.375, -0.75, 0.04));
  const rs = D.map(() => { const r = rifle(); st.add(r); return r; });
  const sm = smoke({ count: 8, size: 0.5, rise: 0.8, spread: 5, seed: 8, life: 3, drift: [0.5, 0], color: '#e8e4dc' }); sm.position.set(0, 3.4, 1.2); st.add(sm);
  return { stage: st, sky, set, D, rs, sm };
}
function wallDraw(s, t, o = {}) {
  s.sky.update(t); s.sm.update(t);
  s.D.forEach((b, i) => { const rec = Math.max(0, 1 - (((t + i * 0.17) % 0.5) / 0.12)); const aim = o.aim ?? 1; b.pose(addPose(mixPose(POSE.stand, AIM, aim), { ...idle(t, 3 + i, 0.3), ...(o.cheer ? {} : {}) })); b.face(o.face ? o.face(i) : mixExpr(EXPR.deadpan, EXPR.angry, 0.4), t); holdRifle(b, s.rs[i], aim, aim * rec); });
}
registerShot('s09', { kind: '3d',
  init(T) { return wallSet(T); },
  draw(s, t, info) {
    wallDraw(s, t);
    camMove(s.stage, t, [[0, { pos: [0, 2.9, 10.0], look: [0, 2.5, -0.5], fov: 42 }], [info.dur, { pos: [0, 2.85, 8.6], look: [0, 2.55, -0.5], fov: 40 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: 0.4, amp: 0.03, dur: 0.4 }]);
  },
  overlay(g, t, info, s) {
    s.rs.forEach((r, i) => flash(g, s.stage, r.muzzle, t, 0.5, i * 0.17, { r: 70 }));
    sunnyLook(g, t, { rays: { from: [-70, -60], strength: 0.4 }, tint: '#ffd49a' });
    stamp(g, t, 'BUT...', { at: 0.05, x: 540, y: 340, size: 120, color: '#ffffff', fill: '#b8322a', rot: -0.06 });
  },
});

// s10 — "The German commander, Major Sepp Gangl," Close on Gangl (field grey, visor cap), name card.
registerShot('s10', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'warm', fov: 32, shadowSize: 6, target: [0, 2, 0] }); const set = hall(st, { table: false });
    const gg = gangl(); gg.position.set(0, 0, 0.6); st.add(gg); return { stage: st, set, gg };
  },
  draw(s, t, info) {
    s.gg.pose(addPose(POSE.attention, idle(t, 6, 0.3))); s.gg.face(mixExpr(EXPR.neutral, EXPR.worried, 0.15), t);
    camMove(s.stage, t, [[0, { pos: [0.3, 2.5, 6.0], look: [0, 2.0, 0.6], fov: 32 }], [info.dur, { pos: [0.25, 2.45, 5.2], look: [0, 2.05, 0.6], fov: 31 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#ffcf8a' });
    stamp(g, t, 'MAJOR JOSEF "SEPP" GANGL', { at: at(info, 'Major', 0.6) - 0.1, x: 540, y: 1480, size: 54, color: '#ffffff', fill: '#5a5f55', rot: -0.03 });
    stamp(g, t, 'GERMAN COMMANDER', { at: 0.05, x: 540, y: 330, size: 70, color: '#ffffff', fill: '#26222c', rot: -0.05 });
  },
});

// s11 — "was killed by a sniper while trying to get a former French prime minister" Gangl guides the older statesman away
// from the window, an arm out to shield him. Cool, quiet tint. Nobody is shown hit.
registerShot('s11', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'warm', fov: 36, shadowSize: 8, target: [0, 1.5, 0] }); const set = hall(st, { table: false });
    const gg = gangl(); st.add(gg); const pm = statesman({ seed: 43, suit: '#3a3a3e', hair: 'swoop', hairColor: '#3a2a20', moustache: true }); st.add(pm);
    return { stage: st, set, gg, pm };
  },
  draw(s, t, info) {
    const k = ease.inOut(prog(t, 0, info.dur));
    s.pm.position.set(lerp(-2.2, 0.6, k), 0, 0.8); s.pm.rotation.y = 1.2; s.gg.position.set(lerp(-3.3, -0.5, k), 0, 1.4); s.gg.rotation.y = 1.0;
    s.pm.pose(walk(t * 0.8, { speed: 1.2, amp: 0.5 })); s.pm.face(EXPR.worried, t);
    s.gg.pose(addPose(walk(t * 0.8 + 0.3, { speed: 1.2, amp: 0.5 }), { armL: [1.2, -0.2, 0.2], elbowL: 0.4, headTurn: 0.4 })); s.gg.face(mixExpr(EXPR.worried, EXPR.deadpan, 0.4), t);
    camMove(s.stage, t, [[0, { pos: [-1.6, 2.8, 10.5], look: [-1.7, 1.9, 0.8], fov: 36 }], [info.dur, { pos: [0.0, 2.7, 9.8], look: [0.0, 1.9, 0.8], fov: 35 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: false, tint: '#9fb0c8', tintAmount: 0.35 }); },
});

// s12 — "out of the line of fire." PLAIN memorial card over the dimmed empty hall window.
registerShot('s12', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'warm', fov: 36, shadowSize: 8, target: [0, 1.5, 0] }); const set = hall(st, { table: false }); return { stage: st, set }; },
  draw(s, t, info) { camMove(s.stage, t, [[0, { pos: [-2.0, 3.0, 6.0], look: [-3.5, 3.6, -4], fov: 36 }], [info.dur, { pos: [-2.2, 3.0, 5.4], look: [-3.6, 3.7, -4], fov: 35 }]]); },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#9fb0c8', tintAmount: 0.35 }); dimScene(g, 5, 0.45);
    memorial(g, t, { lines: [['MAJOR JOSEF GANGL', 66], ['1910 - 1945', 60, '#5a4a3a'], ['killed while moving', 52, '#5a4a3a'], ['a French ex-prime minister', 52, '#5a4a3a'], ['out of the line of fire', 52, '#5a4a3a']], lh: 92 });
  },
});

// s13 — "The castle held until help arrived." Wide: relief tanks come up the road; defenders on the wall raise their arms.
registerShot('s13', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 24, target: [0, 4, 0] }); const v = castleView(st);
    const road = floor(4, 60, '#b8a888', 6, 16); road.position.y = 0.03; road.rotation.z = 0; st.add(road);
    const tk = [tank(), tank()]; tk.forEach((k, i) => { k.position.set(6, 0, 24 + i * 7); k.rotation.y = Math.PI; st.add(k); });
    const ds = [gi({ seed: 9 }), german({ seed: 11 }), statesman({ seed: 43, suit: '#3a3a3e', hair: 'swoop', hairColor: '#3a2a20', moustache: true })];
    ds.forEach((b, i) => { b.position.set(-1.6 + i * 1.6, 5.4 + 4.2 - 0.6, -4 + 1.8 + 0.2); b.scale.setScalar(0.9); st.add(b); });
    return { stage: st, v, tk, ds };
  },
  draw(s, t, info) {
    s.v.update(t); s.tk.forEach((k, i) => { k.position.z = 26 + i * 7 - t * 3.5; });
    const ch = ease.outBack(prog(t, at(info, 'held', 0.5), at(info, 'held', 0.5) + 0.4));
    s.ds.forEach((b, i) => { b.pose(addPose(mixPose(POSE.stand, POSE.armsUp, ch), { bob: Math.abs(Math.sin(t * 6 + i)) * 0.08 * ch })); b.face(mixExpr(EXPR.neutral, EXPR.grin, ch), t); });
    camMove(s.stage, t, [[0, { pos: [14, 6, 34], look: [0, 7.5, 0], fov: 42 }], [info.dur, { pos: [12, 6.5, 28], look: [0, 8, 0], fov: 40 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: { from: [-70, -60], strength: 0.7 }, tint: '#ffd49a' });
    stamp(g, t, 'THE CASTLE HELD', { at: at(info, 'held', 0.5), x: 540, y: 330, size: 80, color: '#ffffff', fill: '#2f6a3a', rot: -0.05 });
    stamp(g, t, 'HELP ARRIVES', { at: at(info, 'arrived.', 1.2) - 0.1, x: 540, y: 1480, size: 64, color: '#ffffff', fill: '#2f5aa8', rot: 0.04 });
  },
});

// s14 — "It's one of only two known times in the war" The battlement again; counter card "1 OF ONLY 2".
registerShot('s14', { kind: '3d',
  init(T) { return wallSet(T); },
  draw(s, t, info) {
    wallDraw(s, t, { aim: 0, face: () => mixExpr(EXPR.neutral, EXPR.smug, 0.6) });
    camMove(s.stage, t, [[0, { pos: [0, 2.9, 9.4], look: [0, 2.5, -0.5], fov: 42 }], [info.dur, { pos: [0, 2.85, 8.6], look: [0, 2.5, -0.5], fov: 41 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: { from: [-70, -60], strength: 0.4 }, tint: '#ffd49a' });
    const c0 = at(info, 'two', 0.5) - 0.2;
    if (t > c0) { dimScene(g, 4, 0.35); drawInsert(g, { type: 'bigtext', kicker: 'ONE OF ONLY', title: '2', lines: ['known times in WWII'], size: 260, color: GOLD }, t - c0); }
  },
});

// s15 — PAYOFF: "that Americans and Germans fought side by side." Back at the hook window, same framing as frame 1: the two
// lower their rifles, look at each other, and snap back to aim at the very end -> cuts straight into frame 1 (loop).
registerShot('s15', { kind: '3d',
  init(T) { return windowSet(T); },
  draw(s, t, info) {
    const back = ease.inOut(prog(t, info.dur - 0.55, info.dur - 0.1)), down = 1 - back;
    const gl = ease.inOut(prog(t, 0.2, 0.5)) * down;
    winDraw(s, t, { aim: lerp(0.0, 1, back), lookA: gl * -0.7, lookB: gl * 0.7, faceA: mixExpr(EXPR.deadpan, EXPR.grin, gl), faceB: mixExpr(EXPR.deadpan, EXPR.grin, gl) });
    camMove(s.stage, t, [[0, { pos: [0.0, 3.2, 5.2], look: [0, 3.1, -1], fov: 37 }], [info.dur, WIN0]], ease.inOut);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: { from: [-70, -60], strength: 0.5 }, tint: '#ffd49a' });
    const sb = at(info, 'side', 0.6) - 0.1;
    stamp(g, t, 'SIDE BY SIDE', { at: sb, x: 540, y: 330, size: 96, color: '#ffffff', fill: '#b8322a', rot: -0.05, until: info.dur - 0.15 });
    reactions(g, t, s, [{ fx: 'sparkle', on: s.a, at: 0.3, until: info.dur - 0.3, scale: 0.7 }]);
  },
});
