// Dagen H: 3 Sept 1967, Sweden switches from left- to right-hand traffic. 18 shots.
import { registerShot, ease, prog, clamp, lerp, noise } from '/engine/core.js';
import { camMove, drift, rbox, box, cyl, ball, outline, canvasTex, toon } from '/kits/toon3d/toon.js';
import { bean, POSE, EXPR, addPose, mixPose, mixExpr, idle, nod, shake, tremble, point, shrug } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { insertShot } from '/kits/toon3d/insert.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import { THREE, at, tag, stage, street, addCars, moveCar, laneX, carN, keepSign, LANE, driverCam } from './_lib.js';

const DAWN = { rays: { from: [-60, -80], strength: 0.8, color: '#ffd0a0' }, tint: '#ffb58a', tintAmount: 0.2 };
const DAY = { rays: { from: [-60, -80], strength: 1 }, tint: '#ffcf8a' };
const V = 0.45;                                      // crawl speed during the changeover (units/s)
const XCARS = [{ i: 0, dir: -1, z: -1 }, { i: 1, dir: 1, z: -7.2 }, { i: 2, dir: -1, z: -13.4 }, { i: 3, dir: 1, z: -19.6 }, { i: 4, dir: -1, z: -25.8 }, { i: 5, dir: 1, z: -32 }, { i: 6, dir: -1, z: -38.2 }];
const lid = (c) => c.driver;
function xingInit(T, mode = 'dawn') { const s = stage(T, mode, { target: [0, 0, -8], shadowSize: 16 }); s.set = street(s.stage); s.cars = addCars(s.stage, XCARS); return s; }
// all cars crawl along the road; u(t) = changeover progress, toff = time offset so shots chain
function xingDraw(s, t, uFn, toff = 0, face = EXPR.shocked) { s.set.update(t); s.sky.update(t);
  s.cars.forEach((c, k) => { moveCar(c, t, (c, tt) => { const u = clamp(uFn(tt - k * 0.06)); return [laneX(c.dir, u), c.z + c.dir * V * (tt + toff)]; }); c.driver.face(face, t + k); c.driver.pose(addPose(POSE.sit, { armL: [0.8, 0.1, 0], armR: [0.8, 0.1, 0], elbowL: 0.6, elbowR: 0.6, headTurn: Math.sin(t * 2 + k) * 0.15 })); }); }

// s01 "At 5 AM, a whole country switched road sides." — FRAME 1: dawn, every car mid-swerve to the other side, clock at 5:00
const S1 = (t) => (t < 0 ? 0.28 + t * 0.72 * 3 / 2.6 : lerp(0.28, 1, ease.out(prog(t, 0, 2.6))));   // linear lead-in before 0 so frame 1 is already mid-swerve
registerShot('s01', { kind: '3d', init: (T) => xingInit(T),
  draw(s, t, info) { s.set.clock.set(5, 0); xingDraw(s, t, S1);
    camMove(s.stage, t, [[0, { pos: [0.6, 8.2, 12.5], look: [0, 0.4, -12], fov: 46 }], [info.dur, { pos: [0.3, 6.6, 9.8], look: [0, 0.6, -12], fov: 44 }]], ease.sine); },
  overlay(g, t, info, s) { sunnyLook(g, t, DAWN); reactions(g, t, s, [{ fx: 'exclaim', on: s.cars[0].driver, at: 0.5, until: 2.2 }, { fx: 'sweat', on: s.cars[1].driver, at: 0.9 }, { fx: 'speedlines', at: 0.0, until: 0.45 }]); },
});
// s02 "Every driver. Same minute." — close on one driver swerving, eyes wide; "!" on "Same"
registerShot('s02', { kind: '3d', init: (T) => { const s = xingInit(T); return s; },
  draw(s, t, info) { s.set.clock.set(5, 0); xingDraw(s, t + 1.2, S1, 0, EXPR.panic); const c = s.cars[0]; c.driver.face(mixExpr(EXPR.shocked, EXPR.panic, prog(t, 0.6, 0.9)), t);
    driverCam(s.stage, c, 24, 0.6, 4.0); shakeCam(s.stage, t, [{ fx: 'shake', at: at(info, 'Same', 0.8), amp: 0.05, dur: 0.4 }]); },
  overlay(g, t, info, s) { sunnyLook(g, t, { tint: '#ffb58a', tintAmount: 0.2 }); reactions(g, t, s, [{ fx: 'exclaim', on: s.cars[0].driver, at: at(info, 'Same', 0.8) }, { fx: 'sweat', on: s.cars[0].driver, at: 0.2 }]); },
});
// s03 "It's Sweden, 1967." — sunny street, flags, traffic on the LEFT; crane down
registerShot('s03', { kind: '3d', init: (T) => xingInit(T, 'day'),
  draw(s, t, info) { s.set.clock.set(11, 20); xingDraw(s, t, () => 0, -2, EXPR.happy); s.cars.forEach(c => { c.position.z = c.z + c.dir * 3.2 * (t - 2); });
    camMove(s.stage, t, [[0, { pos: [-3.2, 9.5, 4], look: [-4.6, 4.6, -10], fov: 44 }], [info.dur, { pos: [-1.4, 4.2, 9.5], look: [-0.6, 1.6, -8], fov: 46 }]], ease.inOut); },
  overlay(g, t, info) { sunnyLook(g, t, DAY); tag(g, 'SWEDEN  ·  1967', ease.out(prog(t, at(info, 'Sweden', 0.3), at(info, 'Sweden', 0.3) + 0.3)), 0.14); },
});
// s04 "Swedes drive on the left." — high view, cars keep LEFT, a big arrow on the left lane
registerShot('s04', { kind: '3d', init: (T) => xingInit(T, 'day'),
  draw(s, t, info) { s.set.clock.set(11, 22); xingDraw(s, t, () => 0, 0, EXPR.smug); s.cars.forEach(c => { c.position.z = c.z + c.dir * 3.2 * (t + 1); });
    camMove(s.stage, t, [[0, { pos: [0, 10, 8], look: [0, 0, -8], fov: 46 }], [info.dur, { pos: [-0.6, 9, 6.5], look: [-0.4, 0, -8], fov: 44 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, DAY); const k = ease.outBack(prog(t, at(info, 'left', 1.0) - 0.1, at(info, 'left', 1.0) + 0.25)); if (k > 0) { g.save(); g.translate(330, 560); g.scale(k, k); g.lineWidth = 14; g.strokeStyle = '#2a1c15'; g.fillStyle = '#ffd25a'; g.beginPath(); g.moveTo(-150, 0); g.lineTo(-30, -95); g.lineTo(-30, -40); g.lineTo(140, -40); g.lineTo(140, 40); g.lineTo(-30, 40); g.lineTo(-30, 95); g.closePath(); g.stroke(); g.fill(); g.restore(); tag(g, 'LEFT', k, 0.36, 60); } },
});
// s05 "Every neighbour drives on the right." — the border: a Swedish car and a Norwegian car meet nose to nose in the SAME lane. ??? on both
registerShot('s05', { kind: '3d',
  init(T) { const s = stage(T, 'day', { target: [0, 0, -4], seed: 6 }); s.set = street(s.stage, { bare: true });
    const bar = new THREE.Group(); bar.add(cyl(0.12, 0.14, 1.2, '#e8e2d2', -4.4, 0.6, -9, 10)); const arm = new THREE.Group(); arm.position.set(-4.4, 1.15, -9); for (let i = 0; i < 6; i++) arm.add(box(1.1, 0.16, 0.16, i % 2 ? '#e8e2d2' : '#c0392b', -0.55 - i * 1.1, 0, 0)); arm.rotation.z = -1.35; bar.add(arm); outline(bar, { px: 2.4 }); s.stage.add(bar);
    const sign = (txt, x, z, ry, c) => { const tx = canvasTex(320, 120, (g, W, H) => { g.fillStyle = c; g.fillRect(0, 0, W, H); g.fillStyle = '#fff'; g.font = '900 72px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, W / 2, H / 2 + 4); }); const m = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.75), toon('#fff', { map: tx, fresh: true, side: THREE.DoubleSide })); m.position.set(x, 2.6, z); m.rotation.y = ry; m.userData.noOutline = true; s.stage.add(m, cyl(0.05, 0.05, 2.3, '#9aa0a6', x, 1.15, z - 0.02, 8)); };
    sign('SVERIGE', -4.6, 1, 0.3, '#1f5fa8'); sign('NORGE', 4.8, -9, -0.3, '#b8302a');
    s.se = carN(0); s.se.dir = -1; s.no = carN(5, { color: '#2f6db0' }); s.no.dir = 1; s.stage.add(s.se, s.no); return s; },
  draw(s, t, info) { s.set.update(t); s.sky.update(t); const stop = 1.1, d = (tt) => 4.2 * Math.min(tt, stop) - 4.2 * 0.5 * Math.max(0, Math.min(tt, stop) - stop + 0.5) ** 2 / 0.5;
    moveCar(s.se, t, (c, tt) => [-LANE, 2.2 - d(tt)]); moveCar(s.no, t, (c, tt) => [-LANE, -10.4 + d(tt)]);
    const q = prog(t, stop - 0.1, stop + 0.2); [s.se, s.no].forEach((c, k) => { c.driver.pose(addPose(POSE.sit, { armL: [0.8, 0.1, 0], armR: [0.8, 0.1, 0], elbowL: 0.6, elbowR: 0.6, lean: -0.15 * q })); c.driver.face(mixExpr(EXPR.happy, { ...EXPR.shocked, pupil: [0, 0] }, q), t + k); });
    camMove(s.stage, t, [[0, { pos: [19, 6.5, -1.0], look: [-1.6, 1.6, -4.1], fov: 43 }], [info.dur, { pos: [17, 5.8, -2.0], look: [-1.6, 1.7, -4.1], fov: 38 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: stop, amp: 0.05, dur: 0.3 }]); },
  overlay(g, t, info, s) { sunnyLook(g, t, DAY); reactions(g, t, s, [{ fx: 'question', on: s.se.driver, at: 1.25 }, { fx: 'question', on: s.no.driver, at: 1.4, seed: 4 }]); tag(g, 'RIGHT', ease.outBack(prog(t, at(info, 'right', 1.6) - 0.1, at(info, 'right', 1.6) + 0.25)), 0.14, 60); },
});
// voters with "KEEP LEFT" placards
function placard(txt) { const g = new THREE.Group(); const tx = canvasTex(256, 160, (x, W, H) => { x.fillStyle = '#fbf6e8'; x.fillRect(0, 0, W, H); x.fillStyle = '#1f5fa8'; x.font = '900 64px Fredoka, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; txt.split('\n').forEach((l, i, a) => x.fillText(l, W / 2, H / 2 + (i - (a.length - 1) / 2) * 66)); });
  g.add(cyl(0.035, 0.035, 1.3, '#8a5a32', 0, 0.55, 0, 6), rbox(1.2, 0.75, 0.05, '#e8dcc0', 0, 1.45, -0.03, 0.02)); const m = new THREE.Mesh(new THREE.PlaneGeometry(1.12, 0.7), toon('#fff', { map: tx, fresh: true })); m.position.set(0, 1.45, 0.0); m.userData.noOutline = true; g.add(m); outline(g, { px: 2.4 }); return g; }
const voters = {
  init(T) { const s = stage(T, 'day', { target: [0, 0, 0], seed: 8, shadowSize: 8 }); s.set = street(s.stage); const L = [['tee', '#c0392b', 'swoop', '#5a3a22', 'fair'], ['tee', '#3f8a7a', 'bob', '#e0c070', 'light'], ['hoodie', '#7a4a8a', 'messy', '#8a5a2a', 'tan'], ['tee', '#d9a21b', 'bun', '#c9a050', 'fair']];
    s.v = L.map(([outfit, main, hair, hc, skin], i) => { const b = bean({ outfit, colors: { main }, hair, hairColor: hc, skin, seed: 80 + i, hoodDown: true }); b.position.set(-3.3 + i * 2.2, 0.16, 3.2 - Math.abs(i - 1.5) * 0.5); b.rotation.y = (1.5 - i) * 0.12; s.stage.add(b); const p = placard('KEEP\nLEFT'); s.stage.add(p); b.pl = p; return b; }); return s; },
  draw(s, t, info) { const lift = 1; s.set.update(t); s.sky.update(t); s.set.clock.set(10, 5);
    s.v.forEach((b, i) => { const sd = i % 2 ? 'L' : 'R'; const up = { ...POSE.stand, [`arm${sd}`]: [0.4, 2.7, 0], [`elbow${sd}`]: 0.25 }; b.pose(addPose(mixPose(POSE.stand, up, lift), { ...idle(t, i), ...nod(t + i * 0.3, 0.06, 1.6), bob: Math.abs(Math.sin(t * 3.2 + i)) * 0.05 })); b.face(i === 2 ? EXPR.grin : EXPR.happy, t + i); b.updateMatrixWorld(true); const hp = new THREE.Vector3(); b.hand[sd].getWorldPosition(hp); b.pl.position.set(hp.x, hp.y - 0.6, hp.z + 0.1); b.pl.rotation.set(0, b.rotation.y, 0); });
    camMove(s.stage, t, [[0, { pos: [0, 2.4, 13.5], look: [0, 2.2, 2.5], fov: 34 }], [info.dur, { pos: [0, 2.3, 12.0], look: [0, 2.2, 2.5], fov: 34 }]]); },
};
// s06 "In a vote, 83% of Swedes" — the voters blurred under an 83% counter
insertShot('s06', { scene: voters, insert: { type: 'counter', title: 'VOTED "KEEP LEFT"', value: 83, suffix: '%', lines: ['(1955 referendum)'] } });
// s07 "said: keep the left." — the voters, placards up, sparkle on "left"
registerShot('s07', { kind: '3d', init: voters.init, draw: (s, t, info) => voters.draw(s, t + 2.4, info),
  overlay(g, t, info, s) { sunnyLook(g, t, DAY); reactions(g, t, s, [{ fx: 'sparkle', on: s.v[1], at: at(info, 'left', 0.9), scale: 0.8 }, { fx: 'hearts', on: s.v[2], at: at(info, 'left', 0.9) + 0.15 }]); },
});
// s08 "The government switched anyway." — the official stamps HÖGERTRAFIK. Thud + shake on "anyway"
registerShot('s08', { kind: '3d',
  init(T) { const s = stage(T, 'day', { target: [0, 0, 0], shadowSize: 6, seed: 2 }); const st = s.stage; st.scene.background = new THREE.Color('#e9dcc4'); s.sky.group.visible = false;
    const wall = box(14, 7, 0.2, '#d9c7a4', 0, 3.5, -2.2); wall.userData.noOutline = true; wall.receiveShadow = true; st.add(wall); const fl = box(14, 0.1, 10, '#8a6a4a', 0, -0.05, 2); fl.receiveShadow = true; fl.userData.noOutline = true; st.add(fl);
    const win = canvasTex(200, 240, (x, W, H) => { x.fillStyle = '#9cd0f0'; x.fillRect(0, 0, W, H); x.fillStyle = '#fff'; x.fillRect(W / 2 - 6, 0, 12, H); x.fillRect(0, H / 2 - 6, W, 12); }); const wm = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.0), toon('#fff', { map: win, fresh: true })); wm.position.set(2.6, 3.4, -2.08); st.add(wm);
    const fl2 = (() => { const tx = canvasTex(160, 100, (x, W, H) => { x.fillStyle = '#1f5fa8'; x.fillRect(0, 0, W, H); x.fillStyle = '#f2c230'; x.fillRect(50, 0, 20, H); x.fillRect(0, 40, W, 20); }); const m = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.95), toon('#fff', { map: tx, fresh: true })); m.position.set(-2.6, 3.6, -2.08); return m; })(); st.add(fl2);
    s.desk = PR.table({ w: 2.6, d: 1.2, h: 1.05, color: '#6a4228' }).at(0, 0, 0.9); st.add(s.desk);
    const doc = canvasTex(256, 320, (x, W, H) => { x.fillStyle = '#fbfaf4'; x.fillRect(0, 0, W, H); x.fillStyle = '#20161a'; x.font = '900 34px Fredoka, sans-serif'; x.textAlign = 'center'; x.fillText('LAG', W / 2, 50); x.fillStyle = '#c8c2b4'; for (let i = 0; i < 6; i++) x.fillRect(30, 80 + i * 26, i === 5 ? 120 : 196, 10); });
    s.paper = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.8), toon('#fff', { map: doc, fresh: true })); s.paper.rotation.x = -Math.PI / 2; s.paper.position.set(-0.1, 1.12, 1.15); st.add(s.paper);
    const ink = canvasTex(300, 100, (x, W, H) => { x.clearRect(0, 0, W, H); x.strokeStyle = '#c0392b'; x.lineWidth = 10; x.strokeRect(8, 8, W - 16, H - 16); x.fillStyle = '#c0392b'; x.font = '900 46px Fredoka, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('HÖGERTRAFIK', W / 2, H / 2 + 3); });
    s.ink = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.2), toon('#fff', { map: ink, fresh: true, transparent: true })); s.ink.rotation.x = -Math.PI / 2; s.ink.position.set(-0.1, 1.125, 1.05); s.ink.rotation.z = 0.12; s.ink.visible = false; st.add(s.ink);
    s.stamp = new THREE.Group(); s.stamp.add(cyl(0.16, 0.16, 0.08, '#c0392b', 0, 0.04, 0, 16), cyl(0.05, 0.06, 0.3, '#6a4228', 0, 0.22, 0, 8), ball(0.1, '#6a4228', 0, 0.42, 0, 10)); outline(s.stamp, { px: 2.4 }); st.add(s.stamp);
    s.o = bean({ outfit: 'uniform', colors: { main: '#4a4e58', legsTop: '#3a3e48', trim: '#d8b04a' }, hair: 'horseshoe', hairColor: '#8a8a8a', glasses: true, skin: 'light', seed: 12, moustache: '#8a8a8a' }); s.o.position.set(0.15, 0, -0.35); st.add(s.o); return s; },
  draw(s, t, info) { const w = at(info, 'anyway', 1.0), k = prog(t, w - 0.35, w), up = 1 - ease.in(k) ;
    s.o.updateMatrixWorld(true); const hp = new THREE.Vector3(); s.o.hand.R.getWorldPosition(hp);
    s.o.pose(addPose(POSE.stand, { armR: [0.9 + 0.5 * up * (t < w ? 1 : 0), -0.25, 0], elbowR: 0.9 - 0.3 * (t < w ? up : 0), lean: 0.15, headNod: 0.2 })); s.o.face(t < w ? { ...EXPR.smug, pupil: [0, -0.4] } : { ...EXPR.smug, pupil: [0, 0] }, t);
    s.stamp.position.set(hp.x, Math.max(1.12, hp.y - 0.12), hp.z); s.ink.visible = t >= w;
    camMove(s.stage, t, [[0, { pos: [-0.6, 2.8, 6.6], look: [0, 1.7, 0.4], fov: 34 }], [info.dur, { pos: [-0.4, 2.6, 5.4], look: [0, 1.6, 0.6], fov: 32 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: w, amp: 0.07, dur: 0.4 }]); },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: false, tint: '#ffcf8a' }); const w = at(info, 'anyway', 1.0); reactions(g, t, s, [{ fx: 'sparkle', on: s.o, at: w + 0.1, scale: 0.8 }]); },
});
// s09 SUNDAY / SEPT 3 / 1967 card over the dawn street
insertShot('s09', { scene: { init: (T) => xingInit(T), draw: (s, t) => { s.set.clock.set(4, 49); xingDraw(s, t, () => 0, -3, EXPR.bored); s.stage.cam([0.6, 8.2, 12.5], [0, 0.4, -9], 46); } },
  insert: { type: 'bigtext', kicker: 'SUNDAY', title: 'SEPT 3', lines: ['1967'] } });
// s10 "At 4:50, every car in the country stops." — on the clock (4:50), pull back + tilt down to the traffic braking to a halt
registerShot('s10', { kind: '3d', init: (T) => xingInit(T),
  draw(s, t, info) { const st0 = at(info, 'stops', 2.2), v = (tt) => (tt < st0 - 0.6 ? 1 : Math.max(0, 1 - (tt - st0 + 0.6) / 0.8));
    s.set.clock.set(4, 50); s.set.update(t); s.sky.update(t);
    s.cars.forEach((c, k) => { const dist = (tt) => { let d = 0; const n = 30; for (let i = 0; i < n; i++) d += v((i + 0.5) / n * tt) * tt / n; return d * 3.2; }; moveCar(c, t, (c, tt) => [laneX(c.dir, 0), c.z + c.dir * (dist(tt) - dist(info.dur) - V * 0)]); c.driver.pose(addPose(POSE.sit, { armL: [0.8, 0.1, 0], armR: [0.8, 0.1, 0], elbowL: 0.6, elbowR: 0.6, lean: t > st0 - 0.2 ? -0.1 : 0 })); c.driver.face(t > st0 ? EXPR.deadpan : EXPR.bored, t + k); });
    const ck = s.set.clock; camMove(s.stage, t, [[0, { pos: [3.6, 5.1, 1.4], look: [4.3, 5.15, -3], fov: 30 }], [0.9, { pos: [3.4, 5.2, 2.0], look: [4.2, 5.0, -3], fov: 32 }], [info.dur, { pos: [0.6, 8.2, 12.5], look: [0, 0.4, -9], fov: 46 }]], ease.inOut); },
  overlay(g, t, info, s) { sunnyLook(g, t, DAWN); const st0 = at(info, 'stops', 2.2); reactions(g, t, s, [{ fx: 'exclaim', on: s.cars[2].driver, at: st0 + 0.05, until: st0 + 0.9, scale: 0.8 }]); },
});
// s11 "Wait... how do you change sides?" — close on a stopped driver: ??? + sweat, looking left, right
registerShot('s11', { kind: '3d', init: (T) => xingInit(T),
  draw(s, t, info) { s.set.clock.set(4, 52); xingDraw(s, 0, () => 0, 0, EXPR.worried); const c = s.cars[0]; const lk = Math.sin(t * 2.6);
    c.driver.pose(addPose(POSE.sit, { armL: [0.8, 0.1, 0], armR: [0.8, 0.1, 0], elbowL: 0.6, elbowR: 0.6, headTurn: lk * 0.5 })); c.driver.face({ ...EXPR.worried, pupil: [lk * 0.8, 0] }, t);
    driverCam(s.stage, c, lerp(23, 20, t / info.dur), -0.4, 4.0); },
  overlay(g, t, info, s) { sunnyLook(g, t, { tint: '#ffb58a', tintAmount: 0.2 }); reactions(g, t, s, [{ fx: 'question', on: s.cars[0].driver, at: 0.15 }, { fx: 'sweat', on: s.cars[0].driver, at: 0.9 }]); },
});
// s12 "You see, you just... carefully drive across." — high side view: every car creeps across, the clock ticks to 5:00
registerShot('s12', { kind: '3d', init: (T) => xingInit(T),
  draw(s, t, info) { const a = at(info, 'carefully', 1.2); const u = (tt) => ease.inOut(prog(tt, a - 0.2, info.dur - 0.1)); s.set.update(t); s.sky.update(t);
    s.cars.forEach((c, k) => { moveCar(c, t, (c, tt) => [laneX(c.dir, u(tt - k * 0.05)), c.z + c.dir * 0.5 * u(tt)]); c.driver.pose(addPose(POSE.sit, { armL: [0.8, 0.1, 0], armR: [0.8, 0.1, 0], elbowL: 0.6, elbowR: 0.6, ...tremble(t, 0.6) })); c.driver.face({ ...EXPR.worried, mouth: 'line', lid: 0.1 }, t + k); });
    s.set.clock.set(4, 55 + 5 * u(t));
    camMove(s.stage, t, [[0, { pos: [-9, 9, 2], look: [0, 0, -8], fov: 42 }], [info.dur, { pos: [-8, 8, 0.5], look: [0, 0, -8], fov: 40 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, DAWN); reactions(g, t, s, [{ fx: 'sweat', on: s.cars[2].driver, at: 1.2 }]); },
});
// s13 "About 350,000 road signs" — a worker flips a keep-left sign to keep-right (sparkle)
const signs = {
  init(T) { const s = stage(T, 'dawn', { target: [3, 0, 0], shadowSize: 7 }); s.set = street(s.stage); s.sg = keepSign({ a: -1, b: 1 }); s.sg.position.set(3.9, 0.16, 2.2); s.stage.add(s.sg);
    s.w = bean({ outfit: 'uniform', colors: { main: '#e07a2f', legsTop: '#3a4a6a' }, head: 'cap', headColor: '#e07a2f', hair: 'bowl', hairColor: '#e0c070', skin: 'fair', seed: 21 }); s.w.position.set(5.0, 0.16, 2.6); s.w.rotation.y = -0.9; s.stage.add(s.w); return s; },
  draw(s, t, info) { s.set.update(t); s.sky.update(t); s.set.clock.set(4, 30); const f = ease.inOut(prog(t, 0.5, 1.2)); s.sg.plate.rotation.y = Math.PI * f;
    s.w.pose(addPose(mixPose(POSE.stand, { ...POSE.stand, armR: [1.5, 0.2, 0], elbowR: 0.4, armL: [1.3, -0.2, 0], elbowL: 0.6 }, Math.sin(Math.PI * clamp(f * 1.2))), idle(t, 3))); s.w.face(f > 0.95 ? EXPR.happy : EXPR.deadpan, t);
    camMove(s.stage, t, [[0, { pos: [1.4, 2.6, 8.2], look: [4.2, 2.1, 2.2], fov: 34 }], [info.dur, { pos: [1.8, 2.5, 7.4], look: [4.2, 2.1, 2.2], fov: 33 }]]); },
};
registerShot('s13', { kind: '3d', init: signs.init, draw: signs.draw, overlay(g, t, info, s) { sunnyLook(g, t, { tint: '#ffb58a', tintAmount: 0.2 }); reactions(g, t, s, [{ fx: 'sparkle', on: [3.9, 2.6, 2.3], at: 1.15, scale: 0.9 }, { fx: 'exclaim', on: s.w, at: 0.25, until: 0.9, scale: 0.7 }]); } });
insertShot('s14', { scene: { init: signs.init, draw: (s, t, info) => signs.draw(s, t + 2.0, info) }, insert: { type: 'counter', title: 'ROAD SIGNS SWAPPED', value: 350000, lines: ['(about)'] } });
// s15 "Everyone expected chaos." — onlookers on the pavement, worried, sweat; the first cars approach on the new side
registerShot('s15', { kind: '3d',
  init(T) { const s = xingInit(T); const L = [['tee', '#3f6fa8', 'swoop', '#5a3a22', 'fair'], ['tee', '#c0392b', 'pigtails', '#e0c070', 'light'], ['hoodie', '#3f8a5a', 'messy', '#8a5a2a', 'tan'], ['uniform', '#2a3a5a', 'bowl', '#3a2618', 'fair']];
    s.p = L.map(([outfit, main, hair, hc, skin], i) => { const b = bean({ outfit, colors: { main, legsTop: '#2a3242' }, hair, hairColor: hc, skin, seed: 90 + i, hoodDown: true, ...(i === 3 ? { head: 'cap', headColor: '#1e2a44' } : {}) }); b.position.set(-4.0 - (i % 2) * 0.9, 0.16, 4.4 - i * 1.4); b.rotation.y = 1.2; s.stage.add(b); return b; }); return s; },
  draw(s, t, info) { s.set.clock.set(5, 1); xingDraw(s, t + 3, () => 1, 0, EXPR.worried);
    s.p.forEach((b, i) => { b.pose(addPose(i === 1 ? POSE.panic : POSE.stand, { ...tremble(t + i, 1), headTurn: -0.2 + Math.sin(t * 1.5 + i) * 0.15 })); b.face(i === 1 ? EXPR.panic : EXPR.worried, t + i); });
    camMove(s.stage, t, [[0, { pos: [-1.2, 1.4, 9.5], look: [-4.2, 2.0, 2.2], fov: 38 }], [info.dur, { pos: [-1.6, 1.5, 8.6], look: [-4.3, 2.0, 2.2], fov: 35 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, DAWN); reactions(g, t, s, [{ fx: 'sweat', on: s.p[0], at: 0.3 }, { fx: 'sweat', on: s.p[2], at: 0.6, seed: 3 }, { fx: 'exclaim', on: s.p[1], at: at(info, 'chaos', 1.0), scale: 0.8 }]); },
});
// s16 "Instead, accidents went down." + s17 "For a few weeks, anyway." — sunny, traffic flows on the right; the policeman beams, then the deadpan
const cop = {
  init(T) { const s = xingInit(T, 'day'); s.c = bean({ outfit: 'uniform', colors: { main: '#1e2a44', legsTop: '#1a2238', trim: '#e0c050' }, head: 'cap', headColor: '#1e2a44', hair: 'bowl', hairColor: '#3a2618', skin: 'fair', seed: 33, moustache: '#5a3a22' }); s.c.position.set(4.3, 0.16, 5.2); s.c.rotation.y = -0.5; s.stage.add(s.c); return s; },
  draw(s, t, info, mode) { s.set.clock.set(9, 15); xingDraw(s, t, () => 1, 2, EXPR.happy); s.cars.forEach(c => { c.position.z = c.z + c.dir * 3.0 * (t + 2) - c.dir * 4; });
    if (mode === 1) { s.c.pose(addPose(POSE.handsHips, { ...idle(t, 2), ...nod(t, 0.05, 1.5) })); s.c.face(EXPR.happy, t);
      camMove(s.stage, t, [[0, { pos: [1.2, 2.6, 11], look: [3.6, 2.0, 4.0], fov: 36 }], [info.dur, { pos: [1.8, 2.5, 9.6], look: [3.8, 2.0, 4.4], fov: 34 }]]); }
    else { const k = ease.inOut(prog(t, 0.15, 0.7)); s.c.pose(addPose(mixPose(POSE.handsHips, POSE.stand, k), idle(t, 2))); s.c.face(mixExpr(EXPR.happy, { ...EXPR.deadpan, pupil: [0, 0] }, k), t, { blink: false });
      s.stage.cam([2.4, 2.5, 10.6], [4.2, 2.25, 5.2], 23); } },
};
registerShot('s16', { kind: '3d', init: cop.init, draw: (s, t, info) => cop.draw(s, t, info, 1),
  overlay(g, t, info, s) { sunnyLook(g, t, DAY); const d = at(info, 'down', 1.1); reactions(g, t, s, [{ fx: 'sparkle', on: s.c, at: d, scale: 0.9 }, { fx: 'hearts', on: s.c, at: d + 0.2 }]);
    const k = ease.outBack(prog(t, d - 0.1, d + 0.25)); if (k > 0) { g.save(); g.translate(720, 470); g.scale(k, k); g.lineWidth = 14; g.strokeStyle = '#2a1c15'; g.fillStyle = '#3fbf5a'; g.beginPath(); g.moveTo(0, 150); g.lineTo(-110, 20); g.lineTo(-45, 20); g.lineTo(-45, -140); g.lineTo(45, -140); g.lineTo(45, 20); g.lineTo(110, 20); g.closePath(); g.stroke(); g.fill(); g.restore(); } },
});
registerShot('s17', { kind: '3d', init: cop.init, draw: (s, t, info) => cop.draw(s, t + 2, info, 2),
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: false, tint: '#ffcf8a' }); reactions(g, t, s, [{ fx: 'sweat', on: s.c, at: at(info, 'anyway', 0.7) }]); },
});
// s18 "Subscribe for more." — back to the frame-1 crossing; ends exactly on frame 1's composition (loop)
registerShot('s18', { kind: '3d', init: (T) => xingInit(T),
  draw(s, t, info) { const d = info.dur; s.set.clock.set(4, 59 + clamp(t / d)); xingDraw(s, t - d, (tt) => (tt < 0 ? lerp(0, 0.28, ease.in(prog(tt, -d, 0))) : S1(tt)), 0);
    camMove(s.stage, t, [[0, { pos: [1.6, 11, 17], look: [0, 0.2, -9], fov: 46 }], [d, { pos: [0.6, 8.2, 12.5], look: [0, 0.4, -12], fov: 46 }]], ease.inOut); },
  overlay(g, t, info, s) { sunnyLook(g, t, DAWN); const a = at(info, 'Subscribe', 0.1); tag(g, 'SUBSCRIBE FOR MORE', ease.out(prog(t, a - 0.05, a + 0.3)) * (1 - prog(t, info.dur - 0.35, info.dur - 0.05)), 0.2); },
});
