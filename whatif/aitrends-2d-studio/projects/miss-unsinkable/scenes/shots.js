// Miss Unsinkable — 13 shots, Toon 3D + BEANMEN effects. Emotion: WOW. TONE GUARD: real deaths; no comedy on the sinkings,
// no bodies, nobody shown hurt; propeller shots show only water + propeller. Trombone gag on the transfer papers only (s05).
import { registerShot, ease, prog, clamp, lerp, noise } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle } from '/kits/toon3d/rig.js';
import { reactions, shakeCam, project } from '/kits/toon3d/react.js';
import { drawInsert, dimScene, voidBg } from '/kits/toon3d/insert.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import {
  at, THREE, toonStage, sea, liner, cruiser, lifeboat, propeller, splash, plume, violet, officer, baby, teacup, saloon, hill, sunnySky,
  hookText, yearStamp, tag, checkStamp, ball, cyl, rbox, box, plane, toon, flat, outline, rng, alpha, insT, CARD_INK, canvasTex,
} from './_lib.js';

const softRays = { rays: { from: [-70, -60], strength: 0.5 }, tint: '#ffe0b0' };
const ARMS_CROSSED = { armL: [1.3, 0.5, -1.2], elbowL: 2.2, armR: [1.2, 0.5, -1.2], elbowR: 2.2 };
const SIP = { armR: [1.05, 0.05, 0.9], elbowR: 2.25, armL: [0.75, 0.1, 0.6], elbowL: 1.5 };
// hook caption: on screen from frame 1 to HOOK_END (absolute seconds), across s01 + s02
const HOOK_END = 4.25;
const hook = (g, t, info) => { const T = info.shot.start + t; if (T > HOOK_END) return; hookText(g, T, ['they called her', 'MISS UNSINKABLE'], { y: 300, gap: 98, sizes: [60, 92], until: HOOK_END }); };
const tagOver = (g, st, p, text, k, o) => { const q = project(st, p); tag(g, q.x, q.y, text, k, o); };

// ---------------------------------------------------------------- s01 — FRAME 1: calm Violet, arms crossed, on the railing as the sea rises
function deckScene(T, o = {}) {
  const st = toonStage(T, { light: 'dusk', fov: 34, shadowSize: 10, target: [0, 1, 0], exposure: 1.2 });
  const ship = new THREE.Group(); st.add(ship);
  ship.add(box(30, 12, 2, '#1e1c22', 0, -6, 0.6));                       // the black hull side, deck edge at y = 0
  ship.add(box(30, 0.5, 2.05, '#f0e8d8', 0, -0.6, 0.6));                 // white sheer strake
  ship.add(box(30, 0.2, 6, '#c8a878', 0, -0.1, -2.4));                    // deck planks
  const rail = new THREE.Group(); for (let i = 0; i < 16; i++) rail.add(cyl(0.04, 0.04, 1.1, '#f4f0e6', -7.5 + i, 0.55, 1.4, 6)); rail.add(rbox(16, 0.08, 0.08, '#f4f0e6', 0, 1.1, 1.4, 0.03)); rail.add(rbox(16, 0.05, 0.05, '#f4f0e6', 0, 0.6, 1.4, 0.02)); outline(rail, { px: 2.2 }); ship.add(rail);
  // a buff funnel and a lifeboat davit behind her for ship identity
  const fun = cyl(1.3, 1.4, 7, '#d9a24a', -3.2, 6, -6, 22); const top = cyl(1.32, 1.32, 1.3, '#1a1a1e', -3.2, 9.6, -6, 22); outline(fun, { px: 2.2 }); outline(top, { px: 2.2 }); ship.add(fun, top);
  if (o.wall) { const wall = rbox(30, 2.6, 0.4, '#f6f3ea', 0, 1.3, -3.4, 0.05); ship.add(wall); } const win = canvasTex(1024, 64, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#ffd88a'; for (let i = 0; i < 40; i++) x.fillRect(12 + i * 25.4, 14, 14, 36); });
  const wp = new THREE.Mesh(new THREE.PlaneGeometry(30, 1.0), toon('#ffffff', { map: win, transparent: true, emissive: new THREE.Color('#ffc870'), emissiveIntensity: 0.4 })); wp.position.set(0, 1.5, -3.18); wp.userData.noOutline = true; if (o.wall) ship.add(wp);
  const v = violet(); v.position.set(0.3, 0, 0.75); st.add(v); ship.add(v);
  const s = sea(st, { color: '#3a6a9a', deep: '#22486e', y: -3.2, foam: 18, rep: 22 });
  const ph = canvasTex(1024, 64, (x, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = '#ffd88a'; for (let i = 0; i < 44; i++) { x.beginPath(); x.arc(12 + i * 23.2, h / 2, 9, 0, 7); x.fill(); } });
  for (const y of [-1.2, -2.4]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(30, 0.9), toon('#ffffff', { map: ph, transparent: true, emissive: new THREE.Color('#ffc870'), emissiveIntensity: 0.5 })); p.position.set(0, y, 1.61); p.userData.noOutline = true; ship.add(p); }
  const foam = splash({ count: 16, spread: 3, h: 0.25, seed: 2 }); foam.position.set(-1, -3.2, 1.7); st.add(foam);
  return { stage: st, ship, v, sea: s, foam };
}
function deckDraw(s, t, info, o = {}) {
  const rise = o.rise ?? ease.out(clamp(t / 3.0));
  const lvl = lerp(-2.5, -0.7, rise); s.sea.setLevel(lvl); s.sea.update(t); s.foam.position.y = lvl; s.foam.update(t, 0.35);
  s.ship.rotation.z = lerp(0, 0.045, rise) + Math.sin(t * 0.9) * 0.004; s.ship.position.y = Math.sin(t * 0.7) * 0.03;
  s.v.pose(addPose({ ..._crossed() }, idle(t, 5, 0.5))); s.v.face(mixExpr(EXPR.deadpan, EXPR.smug, 0.35), t);
  camMove(s.stage, t, [[0, { pos: [2.0, 1.0, 12.0], look: [0.3, 0.9, 0.6], fov: 40 }], [info.dur, { pos: [1.6, 1.0, 10.4], look: [0.3, 1.0, 0.6], fov: 40 }]]);
}
function _crossed() { return { ...POSE.stand, ...ARMS_CROSSED }; }
registerShot('s01', { kind: '3d',
  init(T) { return deckScene(T); },
  draw(s, t, info) { deckDraw(s, t, info); },
  overlay(g, t, info, s) { hook(g, t, info); },
});

// ---------------------------------------------------------------- the three sister ships (s02, s12)
function threeShips(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 40, target: [0, 0, -10] });
  sunnySky(st, { clouds: 8, seed: 6 }); const s = sea(st, { foam: 30 });
  const ships = ['olympic', 'titanic', 'britannic'].map((k, i) => { const sh = liner({ kind: k, len: 20 }); sh.position.set(-4 + i * 4, 0, 6 - i * 15); sh.rotation.y = -0.62; st.add(sh); return sh; });
  return { stage: st, sea: s, ships };
}
function threeDraw(s, t, info, cam) {
  s.sea.update(t); s.ships.forEach((sh, i) => { sh.position.y = Math.sin(t * 0.8 + i) * 0.06; sh.rotation.z = Math.sin(t * 0.6 + i * 2) * 0.008; });
  camMove(s.stage, t, cam || [[0, { pos: [5, 22, 46], look: [0, -1, -10], fov: 44 }], [info.dur, { pos: [4, 20, 42], look: [0, -0.5, -10], fov: 44 }]]);
}
const SHIP_NAMES = ['OLYMPIC', 'TITANIC', 'BRITANNIC'];
const shipTop = (sh) => [sh.position.x, sh.H * 4.2, sh.position.z];
registerShot('s02', { kind: '3d',
  init(T) { return threeShips(T); },
  draw(s, t, info) { threeDraw(s, t, info); },
  overlay(g, t, info, s) {
    sunnyLook(g, t, softRays); hook(g, t, info);
    const c0 = at(info, 'sister', 0.3); s.ships.forEach((sh, i) => tagOver(g, s.stage, shipTop(sh), SHIP_NAMES[i], ease.outBack(clamp((t - c0 + 0.2 - i * 0.18) / 0.3)), { size: 46 }));
  },
});

// ---------------------------------------------------------------- s03 — "Violet Jessop was a stewardess." The dining saloon, a teacup.
function saloonScene(T) {
  const st = toonStage(T, { light: 'warm', fov: 32, shadowSize: 8, target: [0, 1, 0] });
  const set = saloon(st); const v = violet(); v.position.set(0.2, 0, -1.3); st.add(v);
  const cup = teacup(); st.add(cup);
  const cups = [-2.2, 2.4].map(x => { const c = teacup(); c.position.set(x, set.tableY, 0.2); st.add(c); return c; });
  return { stage: st, set, v, cup, cups };
}
function saloonDraw(s, t, info) {
  s.v.pose(addPose({ ...POSE.stand, armR: [0.95, 0.15, 0.5], elbowR: 1.4, armL: [0.2, 0.12, 0], elbowL: 0.3 }, idle(t, 5, 0.6)));
  s.v.face(mixExpr(EXPR.neutral, EXPR.happy, 0.6), t);
  s.v.updateWorldMatrix(true, true); const hp = new THREE.Vector3(); s.v.hand.R.getWorldPosition(hp); s.cup.position.set(hp.x, hp.y + 0.03, hp.z + 0.05);
  camMove(s.stage, t, [[0, { pos: [0.6, 2.3, 6.4], look: [0.2, 1.8, -1.2], fov: 34 }], [info.dur, { pos: [0.4, 2.2, 5.2], look: [0.2, 1.9, -1.2], fov: 32 }]]);
}
const SALOON = { init: saloonScene, draw: saloonDraw };
registerShot('s03', { kind: '3d', ...SALOON,
  overlay(g, t, info, s) { const a = project(s.stage, [0.2, 3.25, -1.3]); tag(g, a.x, a.y, 'VIOLET JESSOP', ease.outBack(clamp((t - at(info, 'violet', 0.9) + 0.1) / 0.3)), { size: 52, fill: '#ffd25a' }); yearStamp(g, t, 1911, { at: 0.05 }); },
});

// ---------------------------------------------------------------- s04 — "1911: her ship, the Olympic, hit a warship." (no deaths: a scrape, nobody hurt)
registerShot('s04', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 30, target: [0, 0, -4] });
    sunnySky(st, { clouds: 9, seed: 2 }); const s = sea(st, { foam: 24 });
    const oly = liner({ kind: 'olympic', len: 22 }); oly.rotation.y = -0.15; st.add(oly);
    const hawke = cruiser({ len: 13 }); st.add(hawke);
    const sp = splash({ count: 26, spread: 1.4, h: 1.8, seed: 5 }); st.add(sp);
    return { stage: st, sea: s, oly, hawke, sp };
  },
  draw(s, t, info) {
    s.sea.update(t); const hit = at(info, 'hit', 1.4);
    s.oly.position.set(lerp(-1, 2, t / info.dur), Math.sin(t) * 0.05, -6);
    // the cruiser closes in from the lower right, its bow meets the liner's side near the stern on "hit", then glances off
    const k = clamp(t / hit), back = clamp((t - hit) / 0.8);
    s.hawke.position.set(lerp(9, -3.4, ease.in(k)) + back * 0.8, Math.sin(t * 1.2) * 0.05, lerp(8, -2.6, ease.in(k)) + back * 1.2); s.hawke.rotation.y = 2.2 + back * 0.25;
    s.sp.position.set(s.hawke.position.x - 1.2, 0, -3.4); s.sp.update(t, t > hit ? clamp(1 - (t - hit) / 1.2) : 0);
    camMove(s.stage, t, [[0, { pos: [8, 14, 32], look: [0, 0, -3], fov: 42 }], [info.dur, { pos: [7, 13, 29], look: [0, 0, -3], fov: 42 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: hit, amp: 0.12, dur: 0.5 }]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, softRays); yearStamp(g, t, 1911, { at: 0.05 });
    const ko = at(info, 'olympic', 0.6); tagOver(g, s.stage, [s.oly.position.x + 2, 9.5, -6], 'OLYMPIC', ease.outBack(clamp((t - ko + 0.1) / 0.3)), { size: 46 });
    const hit = at(info, 'hit', 1.4); tagOver(g, s.stage, [s.hawke.position.x, 4.2, s.hawke.position.z], 'HMS HAWKE', ease.outBack(clamp((t - hit + 0.4) / 0.3)), { size: 42, fill: '#cfd6dc' });
    reactions(g, t, s, [{ fx: 'flash', at: hit, dur: 0.16, color: '#ffffff' }]);
  },
});

// ---------------------------------------------------------------- s05 — "Her next ship... the Titanic." Transfer papers (the one trombone gag)
registerShot('s05', { kind: '3d', ...SALOON,
  overlay(g, t, info, s) {
    dimScene(g, 9, 0.5);
    drawInsert(g, { type: 'document', title: 'TRANSFER ORDER', lines: ['Stewardess: V. Jessop', 'From: OLYMPIC', 'To:'], color: '#ffd25a' }, t);
    const kt = at(info, 'titanic', 1.3); const k = clamp((t - kt + 0.05) / 0.22);
    if (k > 0) { const p = 1 + (1 - ease.out(k)) * 1.6; g.save(); g.translate(540 + 120, 1920 * 0.44 + 2 * 110 - 300 + 40); g.rotate(-0.12); g.scale(p, p); g.globalAlpha = clamp(k * 1.5);
      g.strokeStyle = '#d8342c'; g.lineWidth = 10; g.beginPath(); g.roundRect(-210, -62, 420, 124, 14); g.stroke(); insT(g, 'TITANIC', 0, 4, 92, { color: '#d8342c', stroke: null }); g.restore(); }
  },
});

// ---------------------------------------------------------------- night lifeboat (s06, s07)
function nightBoat(T, o = {}) {
  const st = toonStage(T, { light: 'night', fov: 34, shadowSize: 8, target: [0, 0.5, 0], bg: ['#070b1e', '#121a3e', '#26305a'] });
  const s = sea(st, { night: true, foam: 10, rep: 24 });
  const stars = new THREE.Group(); const r = rng(7); for (let i = 0; i < 90; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.06 + r() * 0.08, 6, 4), flat('#fff6d8')); b.position.set((r() - 0.5) * 120, 8 + r() * 40, -60 - r() * 10); b.userData.noOutline = true; stars.add(b); } st.add(stars);
  const boat = lifeboat({ num: 16 }); st.add(boat);
  const v = violet(); boat.add(v); v.position.set(0.1, -0.55, 0); v.rotation.y = 0.15;
  const others = [-0.9, 0.95].map((x, i) => { const p = violet({ cap: false, seed: 40 + i }); boat.add(p); p.position.set(x, -0.55, 0); p.rotation.y = i ? -0.3 : 0.3; p.scale.setScalar(0.95); return p; });
  others.forEach(p => p.traverse(m => { if (m.isMesh && !m.userData.isHull && m.material?.color) { m.material = m.material.clone(); m.material.color.multiplyScalar(0.55); } }));
  const lantern = new THREE.PointLight('#ffc070', 6, 6, 1.6); lantern.position.set(1.4, 1.0, 0.3); boat.add(lantern); const lg = ball(0.1, '#ffd88a', 1.4, 0.8, 0.3); lg.material = flat('#ffd88a'); boat.add(lg);
  return { stage: st, sea: s, boat, v, others };
}
function boatBob(s, t) { s.sea.update(t); s.boat.position.y = Math.sin(t * 1.3) * 0.05; s.boat.rotation.z = Math.sin(t * 1.1) * 0.03; s.boat.rotation.x = Math.sin(t * 0.9) * 0.02; }
const SITBOAT = { ...POSE.sit, armL: [0.6, 0.12, 0.3], elbowL: 1.2, armR: [0.6, 0.12, 0.3], elbowR: 1.2 };
registerShot('s06', { kind: '3d',
  init(T) { return nightBoat(T); },
  draw(s, t, info) {
    boatBob(s, t); s.v.pose(addPose(SITBOAT, idle(t, 5, 0.4))); s.v.face(mixExpr(EXPR.worried, EXPR.neutral, 0.4), t);
    s.others.forEach((p, i) => { p.pose(addPose(SITBOAT, idle(t, 9 + i, 0.4))); p.face(EXPR.worried, t); });
    camMove(s.stage, t, [[0, { pos: [2.8, 2.6, 8.5], look: [0, 0.9, 0], fov: 34 }], [info.dur, { pos: [2.0, 2.1, 7.0], look: [0, 1.0, 0], fov: 32 }]]);
  },
  overlay(g, t, info, s) { yearStamp(g, t, 1912, { at: 0.05, color: '#ffd25a' }); },
});
registerShot('s07', { kind: '3d',
  init(T) {
    const n = nightBoat(T); const off = officer(); n.stage.add(off); off.position.set(-2.3, 0.35, 0.8); off.rotation.y = 0.9;
    const deck = new THREE.Group(); deck.add(box(4, 0.25, 3, '#8a6a4a', -3.2, 0.22, 0.5)); deck.add(box(4, 8, 0.2, '#1e1c22', -3.2, -3.8, 2.0)); deck.add(box(0.2, 8, 3, '#1e1c22', -1.2, -3.8, 0.5)); outline(deck, { px: 2.2 }); n.stage.add(deck);
    const b = baby(); n.stage.add(b); return { ...n, off, b };
  },
  draw(s, t, info) {
    boatBob(s, t);
    const hand = clamp((t - 0.25) / 0.9); const he = ease.inOut(hand);
    s.off.pose(addPose({ ...POSE.stand, armL: [1.2 - he * 0.2, 0.15, 0.3], elbowL: 0.6, armR: [1.2 - he * 0.2, 0.15, 0.3], elbowR: 0.6, lean: 0.25 }, idle(t, 21, 0.4))); s.off.face(EXPR.worried, t);
    s.v.pose(addPose({ ...POSE.sit, armL: [1.0 + he * 0.2, 0.2, 0.4], elbowL: 1.0 + he * 0.4, armR: [1.0 + he * 0.2, 0.2, 0.4], elbowR: 1.0 + he * 0.4 }, idle(t, 5, 0.4)));
    s.v.face(mixExpr(EXPR.worried, { ...EXPR.shocked, mouth: 'line' }, 0.5 * clamp((t - 1.0) / 0.25)), t);
    s.others.forEach((p, i) => { p.pose(addPose(SITBOAT, idle(t, 9 + i, 0.4))); p.face(EXPR.worried, t); });
    s.stage.scene.updateMatrixWorld(true); const a = new THREE.Vector3(), b = new THREE.Vector3(), a2 = new THREE.Vector3(), b2 = new THREE.Vector3();
    s.off.hand.L.getWorldPosition(a); s.off.hand.R.getWorldPosition(a2); a.add(a2).multiplyScalar(0.5); s.v.hand.L.getWorldPosition(b); s.v.hand.R.getWorldPosition(b2); b.add(b2).multiplyScalar(0.5);
    s.b.position.lerpVectors(a, b, he); s.b.position.y += 0.05; s.b.rotation.y = lerp(0.6, -0.4, he);
    camMove(s.stage, t, [[0, { pos: [0.4, 2.6, 8.0], look: [-1.2, 1.5, 0.3], fov: 36 }], [info.dur, { pos: [0.2, 2.4, 7.0], look: [-1.1, 1.5, 0.3], fov: 35 }]]);
  },
  overlay(g, t, info, s) {
    const kr = at(info, 'reportedly', 0.4); const k = ease.outBack(clamp((t - kr) / 0.3));
    if (k > 0) { g.save(); g.translate(540, 520); g.rotate(-0.05); g.scale(k, k); g.fillStyle = alpha('#fbf6ea', 0.92); g.strokeStyle = CARD_INK; g.lineWidth = 7; g.beginPath(); g.roundRect(-230, -50, 460, 100, 20); g.fill(); g.stroke(); insT(g, '"reportedly"', 0, 2, 56, { color: CARD_INK, stroke: null }); g.restore(); }
  },
});

// ---------------------------------------------------------------- Britannic (s08, s09)
function britScene(T) {
  const st = toonStage(T, { light: 'sunny', fov: 38, shadowSize: 30, target: [0, 0, -4] });
  sunnySky(st, { clouds: 7, seed: 9 }); const s = sea(st, { foam: 24, color: '#2a8ab8' });
  // Aegean islands on the horizon
  const isl = new THREE.Group(); for (const [x, z, sx] of [[-30, -70, 22], [26, -80, 30], [60, -60, 14]]) { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon('#a89a6a')); m.scale.set(sx, 5, 8); m.position.set(x, 0, z); m.userData.noOutline = true; isl.add(m); } st.add(isl);
  const ship = liner({ kind: 'britannic', len: 22 }); ship.rotation.y = -0.35; ship.position.set(0, 0, -4); st.add(ship);
  const pl = plume({ h: 8 }); st.add(pl);
  return { stage: st, sea: s, ship, pl };
}
registerShot('s08', { kind: '3d',
  init(T) { return britScene(T); },
  draw(s, t, info) {
    s.sea.update(t); const km = at(info, 'mine', 1.0);
    s.ship.position.set(lerp(-1, 1, t / info.dur), Math.sin(t) * 0.04, -4);
    s.pl.position.set(s.ship.position.x + 8.2, 0, -4 - 2.6 + 1.2); s.pl.update(clamp((t - km) / 1.6));
    camMove(s.stage, t, [[0, { pos: [5, 7, 24], look: [1, 2, -4], fov: 40 }], [info.dur, { pos: [4, 6.5, 21], look: [1.5, 2, -4], fov: 40 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: km, amp: 0.14, dur: 0.6 }]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, softRays); yearStamp(g, t, 1916, { at: 0.05 });
    tagOver(g, s.stage, [s.ship.position.x - 1, 10, -4], 'BRITANNIC', ease.outBack(clamp((t - 0.35) / 0.3)), { size: 46 });
    const km = at(info, 'mine', 1.0); reactions(g, t, s, [{ fx: 'flash', at: km, dur: 0.14, color: '#ffffff' }]);
  },
});
registerShot('s09', { kind: '3d',
  init(T) { return britScene(T); },
  draw(s, t, info) {
    s.sea.update(t); const k = clamp(t / info.dur);
    s.ship.position.set(0.5, -k * 0.8, -4); s.ship.rotation.z = -0.03 - k * 0.07; s.ship.rotation.x = k * 0.04; s.pl.update(0);
    camMove(s.stage, t, [[0, { pos: [7, 5, 26], look: [0, 2, -4], fov: 40 }], [info.dur, { pos: [6, 4.5, 24], look: [0, 2, -4], fov: 40 }]]);
  },
  overlay(g, t, info, s) {
    dimScene(g, 6, 0.4);
    const k55 = at(info, '55', 0.3); if (t > k55 - 0.1) drawInsert(g, { type: 'bigtext', kicker: 'SANK IN', title: '55 MINUTES', color: '#ffd25a' }, t - k55 + 0.1);
  },
});

// ---------------------------------------------------------------- s10 — "The propellers were still turning." Only water + propeller.
registerShot('s10', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 36, shadowSize: 10, target: [0, 1, 0] });
    sunnySky(st, { clouds: 6, seed: 4 }); const s = sea(st, { foam: 16, color: '#2a8ab8', rep: 30 });
    const stern = new THREE.Group(); const hull = rbox(6, 14, 5, '#f4f2ea', -6.2, 3, 0, 0.6); stern.add(hull); stern.add(box(6.02, 0.8, 5.02, '#3f9a52', -6.2, 0.6, 0)); outline(stern, { px: 2.2 }); stern.rotation.z = 0.22; st.add(stern);
    const pr = propeller({ r: 2.2 }); pr.position.set(-1.6, 1.2, 0.3); pr.rotation.z = 0.22; st.add(pr);
    const sp = splash({ count: 34, spread: 2.2, h: 1.6, seed: 8 }); sp.position.set(-1.4, 0, 0.3); st.add(sp);
    return { stage: st, sea: s, pr, sp };
  },
  draw(s, t, info) {
    s.sea.update(t); s.pr.update(t, 1); s.sp.update(t, 1);
    camMove(s.stage, t, [[0, { pos: [5, 2.2, 10], look: [-1.4, 1.4, 0], fov: 38 }], [info.dur, { pos: [3.8, 1.9, 8], look: [-1.4, 1.4, 0], fov: 36 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: 0, amp: 0.025, dur: info.dur }]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: false, tint: '#ffe0b0' }); },
});

// ---------------------------------------------------------------- s11 — "She jumped clear." Violet leaps from the lifeboat into open water, away from danger.
registerShot('s11', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 36, shadowSize: 12, target: [0, 0.5, 0] });
    sunnySky(st, { clouds: 7, seed: 11 }); const s = sea(st, { foam: 18, color: '#2a8ab8', rep: 26 });
    const boat = lifeboat({}); boat.position.set(2.2, 0, 0); boat.rotation.y = 0.3; st.add(boat);
    const v = violet({ cap: false }); st.add(v);
    const sp = splash({ count: 30, spread: 1.0, h: 1.6, seed: 3 }); sp.position.set(-2.4, 0, 0.6); st.add(sp);
    return { stage: st, sea: s, boat, v, sp };
  },
  draw(s, t, info) {
    s.sea.update(t); s.boat.position.y = Math.sin(t * 1.4) * 0.05; const kj = at(info, 'jumped', 0.2); const j = clamp((t - kj) / 0.75);
    // arc from the boat's edge to the water at x = -2.4
    const x = lerp(1.6, -2.4, j), y = 0.3 + Math.sin(j * Math.PI) * 0.9 - j * 1.4;
    s.v.position.set(x, y, 0.6); s.v.visible = j < 0.82; s.v.rotation.set(0, -1.15, 0);
    s.v.pose(mixPose({ ...POSE.stand, armL: [0.4, 0.2, 0], armR: [0.4, 0.2, 0], kneeL: 0.6, kneeR: 0.6, lean: 0.3 }, { ...POSE.armsUp, legL: [-0.3, 0.04], legR: [-0.3, 0.04] }, ease.out(clamp(j * 2))));
    s.v.face(EXPR.shocked, t);
    s.sp.update(t, j >= 0.8 ? clamp(1.2 - (t - kj - 0.6) / 1.0) : 0);
    camMove(s.stage, t, [[0, { pos: [0.4, 2.4, 12], look: [-0.2, 1.2, 0], fov: 40 }], [info.dur, { pos: [-0.4, 2.2, 11], look: [-1.0, 1.0, 0], fov: 40 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: false, tint: '#ffe0b0' }); const kj = at(info, 'clear', 0.6); reactions(g, t, s, [{ fx: 'speedlines', at: at(info, 'jumped', 0.2), until: kj + 0.4 }]); },
});

// ---------------------------------------------------------------- s12 — "Three ships. Three disasters." Three checkmarks.
registerShot('s12', { kind: '3d',
  init(T) { return threeShips(T); },
  draw(s, t, info) { threeDraw(s, t, info, [[0, { pos: [4, 20, 42], look: [0, -1.5, -10], fov: 44 }], [info.dur, { pos: [3, 19, 39], look: [0, -1.5, -10], fov: 44 }]]); },
  overlay(g, t, info, s) {
    sunnyLook(g, t, softRays);
    const cues = [at(info, 'three', 0.1, 1), at(info, 'three', 0.8, 2), at(info, 'disasters', 1.4)];
    s.ships.forEach((sh, i) => { const q = project(s.stage, shipTop(sh)); tag(g, q.x, q.y - 40, SHIP_NAMES[i], 1, { size: 40 }); checkStamp(g, q.x + 150, q.y + 40, clamp((t - cues[i]) / 0.25), { s: 0.8 }); });
  },
});

// ---------------------------------------------------------------- s13 — payoff: "They called her Miss Unsinkable." Tea on dry land. (+ "Subscribe for more." < 1 s)
registerShot('s13', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 34, shadowSize: 10, target: [0, 1, -1] });
    const env = hill(st, { seed: 5 }); const v = violet(); v.position.set(0, 0, -1); st.add(v); const cup = teacup(); st.add(cup);
    return { stage: st, env, v, cup };
  },
  draw(s, t, info) {
    s.env.update(t); const sip = 0.5 + 0.5 * Math.sin(clamp((t - 0.3) / 1.4) * Math.PI - Math.PI / 2);
    s.v.pose(addPose(mixPose({ ...POSE.stand, armR: [0.9, 0.1, 0.7], elbowR: 1.7, armL: [0.75, 0.1, 0.6], elbowL: 1.5 }, { ...POSE.stand, ...SIP, headNod: -0.12 }, sip), idle(t, 5, 0.5)));
    s.v.face(mixExpr(EXPR.happy, { ...EXPR.happy, lid: 0.85 }, sip), t);
    s.stage.scene.updateMatrixWorld(true); const hp = new THREE.Vector3(); s.v.hand.R.getWorldPosition(hp); s.cup.position.set(hp.x, hp.y + 0.02, hp.z + 0.05); s.cup.rotation.z = sip * 0.5;
    camMove(s.stage, t, [[0, { pos: [0.6, 2.4, 5.8], look: [0, 1.9, -1], fov: 34 }], [info.dur, { pos: [0.4, 2.3, 4.8], look: [0, 1.95, -1], fov: 33 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: { from: [-70, -60], strength: 0.8 }, tint: '#ffd49a' });
    const ku = at(info, 'miss', 0.7); if (t > ku - 0.05) { const k = ease.outBack(clamp((t - ku + 0.05) / 0.35)); g.save(); g.translate(540, 360); g.scale(k, k); g.rotate(-0.03);
      insT(g, 'MISS', 0, -70, 110, { color: '#ffffff', stroke: CARD_INK }); insT(g, 'UNSINKABLE', 0, 60, 140, { color: '#ffd25a', stroke: CARD_INK, maxW: 980 }); g.restore(); }
    reactions(g, t, s, [{ fx: 'sparkle', on: 'v', at: ku + 0.1 }]);
  },
});
