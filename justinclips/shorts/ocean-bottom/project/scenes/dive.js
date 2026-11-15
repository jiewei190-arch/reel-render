// What If You Dove to the Bottom of the Ocean: all shots.
import { registerShot, E, ease, prog, clamp, lerp, text, FONTS } from '/engine/core.js';
import { camMove, toon, flat, canvasTex, rbox, cyl, lathe, outline } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, tremble } from '/kits/toon3d/rig.js';
import { castMember } from '/kits/toon3d/cast.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { insertShot } from '/kits/toon3d/insert.js';
import { glow } from '/kits/toon3d/fx.js';
import { THREE, at, seaStage, sub, bubbles, depthCounter, ZONE } from './_lib.js';

// global depth reading (metres) from global time T: spinning from frame 1, lands on 10,935 m (NOAA) at ~18.4 s
export const DEPTH = (T) => 10935 * Math.pow(clamp((T + 0.6) / 19.0), 1.25);
const G = (info, t) => info.shot.start + t;

// ---------- s01 + s13: the plunge (frame 1; s13 replays it so the last frame == frame 1) ----------
function plungeInit(T) { const W = seaStage(T, { zone: 2, seed: 3, snow: 220, fogNear: 6, fogFar: 30 }); const s = sub(); W.stage.add(s); s.setLights(1); return { W, stage: W.stage, s }; }
function plungeDraw(s, u) {
  s.W.sink(u + 4, 7); s.s.tick(u + 4);
  s.s.rotation.set(0.95 + Math.sin(u * 1.7) * 0.04, 0.5 + Math.sin(u * 0.9) * 0.05, Math.sin(u * 1.3) * 0.06);
  s.s.hero.pose(addPose(POSE.panic, tremble(u + 4, 1.5))); s.s.hero.face({ ...EXPR.shocked, pupil: [0, -0.5] }, u + 4);
  const sh = Math.sin((u + 4) * 21) * 0.03; s.stage.cam([3.2 + sh, -1.6 + sh, 6.8 - u * 0.3], [0, -0.6, 0], 44);
}
const plungeOverlay = (T) => (g, t) => { bubbles(g, t + 4, 0.9, 2, E.W * 0.45, 600); depthCounter(g, DEPTH(T)); };
registerShot('s01', { kind: '3d', init: plungeInit, draw(s, t) { plungeDraw(s, t); }, overlay(g, t, info) { bubbles(g, t + 4, 0.9, 2, E.W * 0.45, 600); depthCounter(g, DEPTH(G(info, t))); } });
registerShot('s13', { kind: '3d', init: plungeInit, draw(s, t, info) { plungeDraw(s, t - info.dur); }, overlay(g, t, info) { bubbles(g, t - info.dur + 4, 0.9, 2, E.W * 0.45, 600); depthCounter(g, DEPTH(t - info.dur)); } });

// pressure arrows pressing in on a point (screen space)
function squeeze(g, cx, cy, R, t, k = 1) { if (k <= 0) return; g.save();
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + 0.2, pul = Math.sin(t * 6 + i) * 14; const r0 = R + 150 + pul, r1 = R + 20 + pul;
    g.save(); g.translate(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); g.rotate(a + Math.PI); g.globalAlpha = 0.9 * k;
    g.fillStyle = '#4ae0ff'; g.strokeStyle = '#04101e'; g.lineWidth = 6; g.beginPath(); g.moveTo(-(r0 - r1), -12); g.lineTo(-30, -12); g.lineTo(-30, -30); g.lineTo(10, 0); g.lineTo(-30, 30); g.lineTo(-30, 12); g.lineTo(-(r0 - r1), 12); g.closePath(); g.fill(); g.stroke(); g.restore(); }
  g.restore(); }
const proj = (st, obj, off = [0, 0, 0]) => { const v = new THREE.Vector3(); obj.getWorldPosition(v); v.x += off[0]; v.y += off[1]; v.z += off[2]; v.project(st.camera); return { x: (v.x + 1) / 2 * E.W, y: (1 - v.y) / 2 * E.H }; };

// ---------- s02 "the water weighs tons." side view, arrows crushing in, hull creaks ----------
registerShot('s02', { kind: '3d',
  init(T) { const W = seaStage(T, { zone: 2, seed: 5, snow: 180, fogNear: 6, fogFar: 30 }); const s = sub(); W.stage.add(s); s.setLights(1); return { W, stage: W.stage, s }; },
  draw(s, t) { s.W.sink(t, 5); s.s.tick(t); const k = ease.out(prog(t, 0.3, 0.9));
    s.s.rotation.set(0.35, Math.PI / 2 - 0.25, Math.sin(t * 40) * 0.01 * k); s.s.hero.pose(addPose(POSE.panic, tremble(t, 2))); s.s.hero.face(EXPR.worried, t);
    s.stage.cam([0.4, 0.9, 8.8 - t * 0.4], [0, 0.1, 0], 40); },
  overlay(g, t, info, s) { const p = proj(s.stage, s.s); squeeze(g, p.x, p.y, 330, t, ease.out(prog(t, 0.3, 0.7))); depthCounter(g, DEPTH(G(info, t))); },
});

// ---------- s03 insert "Challenger Deep ... about 11 km down." over a far wide of the sinking sub ----------
const wideSink = {
  init(T) { const W = seaStage(T, { zone: 2, seed: 7, snow: 240, fogNear: 10, fogFar: 46 }); const s = sub(); W.stage.add(s); s.setLights(1); return { W, stage: W.stage, s }; },
  draw(s, t) { s.W.sink(t, 3); s.s.tick(t); s.s.rotation.set(1.2, 0.3, 0); s.s.position.y = -t * 0.6; s.stage.cam([0, 6 - t * 0.6, 14], [0, -3 - t * 0.6, 0], 48); },
};
insertShot('s03', { scene: wideSink, insert: { type: 'bigtext', kicker: 'CHALLENGER DEEP', title: '~11 KM', lines: ['deepest known spot on Earth'], color: '#4ae0ff' } });
// ---------- s04 "down." the tiny sub falls away into the black, two beams ----------
registerShot('s04', { kind: '3d', init: wideSink.init, draw(s, t) { wideSink.draw(s, t + 1.3); s.stage.cam([0, 8, 6], [0, -12, -1], 52); },
  overlay(g, t, info) { depthCounter(g, DEPTH(G(info, t))); } });

// ---------- s05 "The light dies fast." blue -> black, the headlights snap on ----------
registerShot('s05', { kind: '3d',
  init(T) { const W = seaStage(T, { zone: 0, seed: 9, snow: 160, fogNear: 8, fogFar: 36 }); const s = sub(); W.stage.add(s); s.setLights(0); W.stage.scene.background = new THREE.Color(ZONE[0].fog); return { W, stage: W.stage, s }; },
  draw(s, t, info) { const k = ease.inOut(prog(t, 0.1, 1.0)); const c = new THREE.Color('#2a7ab8').lerp(new THREE.Color('#01040c'), k);
    s.stage.scene.background.copy(c); s.stage.scene.fog.color.copy(c); s.stage.hemi.intensity = lerp(1.3, 0.45, k); s.stage.key.intensity = lerp(2.2, 0.7, k);
    const on = at(info, 'fast', 0.6) + 0.15; s.s.setLights(t > on ? 1 : 0); s.W.sink(t, 5); s.s.tick(t);
    s.s.rotation.set(0.25, 0.6, 0); s.s.hero.pose(POSE.stand); s.s.hero.face(t > on ? EXPR.shocked : { ...EXPR.worried, pupil: [-0.6, 0.4] }, t);
    s.stage.cam([-2.2, 1.2, 7.2], [0, 0.1, 0], 38); },
  overlay(g, t, info) { depthCounter(g, DEPTH(G(info, t))); },
});

// ---------- s06 "Down there, over 8 tons..." cockpit close, hero sweats, hull creaks ----------
const cockpit = {
  init(T) { const W = seaStage(T, { zone: 2, seed: 11, snow: 120, fogNear: 4, fogFar: 22 }); const s = sub(); W.stage.add(s); s.setLights(1); return { W, stage: W.stage, s }; },
  draw(s, t) { s.W.sink(t, 2); s.s.tick(t); s.s.rotation.set(0.05, 0, Math.sin(t * 37) * 0.006); s.s.hero.pose(addPose(POSE.panic, tremble(t, 1.5))); s.s.hero.face({ ...EXPR.worried, pupil: [-0.3, 0.5] }, t);
    s.stage.cam([0.5, 1.2, 5.6 - t * 0.2], [0, 0.6, 1.5], 32); },
};
registerShot('s06', { kind: '3d', init: cockpit.init, draw: cockpit.draw,
  overlay(g, t, info, s) { const p = proj(s.stage, s.s, [0, 0.7, 1.5]); squeeze(g, p.x, p.y, 300, t, ease.out(prog(t, 0.2, 0.6))); reactions(g, t, s, [{ fx: 'sweat', on: s.s.hero, at: 0.3 }]); } });
// ---------- s07 insert "8+ TONS on every square inch" ----------
insertShot('s07', { scene: { init: cockpit.init, draw(s, t) { cockpit.draw(s, t + 1.4); } }, insert: { type: 'bigtext', kicker: 'ON EVERY SQUARE INCH', title: '8+ TONS', lines: ['about 1,000x the pressure up here'], color: '#ffd25a' } });

// ---------- s08 "That's like stacking cars on your thumbnail." ----------
function car(col, seed) { const g = new THREE.Group(); g.add(rbox(1.6, 0.42, 0.8, col, 0, 0.32, 0, 0.12)); g.add(rbox(0.9, 0.36, 0.74, col, -0.1, 0.68, 0, 0.12));
  const win = rbox(0.82, 0.24, 0.76, '#bfe8ff', -0.1, 0.7, 0, 0.08); g.add(win);
  [[-0.5, 0.36], [0.5, 0.36], [-0.5, -0.36], [0.5, -0.36]].forEach(([x, z]) => { const w = cyl(0.17, 0.17, 0.12, '#222', x, 0.14, z, 14); w.rotation.x = Math.PI / 2; g.add(w); });
  outline(g, { px: 2.4 }); return g; }
registerShot('s08', { kind: '3d',
  init(T) { const W = seaStage(T, { zone: 1, seed: 13, snow: 90, fogNear: 10, fogFar: 40 }); const h = castMember('hero', { hood: 'down' }); W.stage.add(h);
    const sp = glow(9, '#6ab8ff', 0.35); sp.position.set(0, 2.5, -2); sp.userData.noOutline = true; W.stage.add(sp);
    const cars = ['#e04a3a', '#3a8ae0', '#4ac06a', '#f0c030', '#b05ad0'].map((c, i) => { const k = car(c, i); k.scale.setScalar(0.42); W.stage.add(k); return k; });
    return { W, stage: W.stage, h, cars }; },
  draw(s, t) { s.W.sink(t, 0.6);
    s.h.pose(addPose(POSE.stand, { armR: [0.1, 1.45, 0], elbowR: 0.05, armL: [0.3, 0.5, 0], elbowL: 0.6, ...tremble(t, 1 + prog(t, 0.2, 1.6) * 2), side: -0.05 }));
    s.h.face(mixExpr({ ...EXPR.grin, pupil: [0, 0.8] }, { ...EXPR.worried, pupil: [0, 0.9] }, prog(t, 0.8, 1.6)), t);
    s.h.updateWorldMatrix(true, true); const hp = new THREE.Vector3(); s.h.hand.R.getWorldPosition(hp);
    s.cars.forEach((c, i) => { const land = 0.15 + i * 0.28; const drop = 1 - ease.out(prog(t, land, land + 0.22)); const wob = Math.sin(t * 5 + i) * 0.04 * i * prog(t, 1.4, 2);
      c.position.set(hp.x + wob * (i + 1), hp.y + 0.1 + i * 0.36 + drop * 6, hp.z); c.rotation.set(0, 0.3 + i * 0.5, wob); c.visible = t > land - 0.3; });
    camMove(s.stage, t, [[0, { pos: [-0.4, 2.3, 8.2], look: [-0.6, 2.5, 0], fov: 38 }], [2.6, { pos: [-0.5, 2.7, 7.4], look: [-0.7, 3.0, 0], fov: 38 }]]); },
});

// ---------- s09/s10 Everest in the trench, cross-section (1 unit = 1 km): floor y=0, surface y=10.935, peak 8.849 ----------
function trenchInit(T) { const W = seaStage(T, { zone: 1, seed: 15, snow: 140, fogNear: 30, fogFar: 90, bg: ['#5ab0e8', '#0c3a70', '#020814'] });
  W.stage.hemi.intensity = 1.6; W.stage.key.intensity = 2.0;
  const rockL = rbox(14, 12, 10, '#3a4252', -10.5, 5, -2, 0.6), rockR = rbox(14, 12, 10, '#3a4252', 10.5, 5, -2, 0.6), fl = rbox(30, 1, 10, '#1e222c', 0, -0.5, -2, 0.3);
  const rocks = new THREE.Group(); rocks.add(rockL, rockR, fl); outline(rocks, { px: 2.2 }); W.stage.add(rocks);
  const ev = new THREE.Group(); ev.add(lathe([[0, 0], [3.4, 0], [2.6, 2.2], [1.6, 5], [0.7, 7.4], [0, 8.85]], '#a8988a', 7));
  const cap = lathe([[0.95, 6.9], [0.7, 7.4], [0, 8.85], [0.001, 8.85]], '#f4f8ff', 7); cap.scale.set(1.04, 1, 1.04); ev.add(cap); outline(ev, { px: 2.6 }); W.stage.add(ev);
  const surf = new THREE.Mesh(new THREE.PlaneGeometry(60, 0.12), flat('#bfeaff')); surf.position.set(0, 10.935, -1); surf.userData.noOutline = true; W.stage.add(surf);
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(60, 6), flat('#9ad4ff')); sky.position.set(0, 13.97, -1.1); sky.userData.noOutline = true; W.stage.add(sky);
  return { W, stage: W.stage, ev }; }
registerShot('s09', { kind: '3d', init: trenchInit,
  draw(s, t) { s.W.sink(t, 0.5); const k = ease.out(prog(t, 0.0, 1.0)); s.ev.position.y = lerp(13, 0, k); s.ev.rotation.y = t * 0.2;
    s.stage.cam([0, 5.4, 17.5], [0, 5.2, 0], 48); shakeCam(s.stage, t, [{ fx: 'shake', at: 1.0, amp: 0.15, dur: 0.35 }]); },
  overlay(g, t) { text(g, 'MT EVEREST', E.W * 0.5, E.H * 0.9, { size: 46, color: '#ffffff', weight: 900, font: FONTS.ui, stroke: 8, strokeColor: '#04101e', alpha: clamp(t * 3) }); },
});
registerShot('s10', { kind: '3d', init: trenchInit,
  draw(s, t) { s.W.sink(t + 2, 0.5); s.ev.position.y = 0; s.ev.rotation.y = (t + 2) * 0.2;
    camMove(s.stage, t, [[0, { pos: [2, 8.2, 6], look: [0, 8.6, 0], fov: 40 }], [1.3, { pos: [1.5, 9.6, 7], look: [0, 9.9, 0], fov: 40 }]]); },
  overlay(g, t, info, s) { const a = proj(s.stage, s.ev, [0, 8.85, 0]), b = { x: a.x, y: proj(s.stage, s.ev, [0, 10.935, 0]).y }; const k = ease.out(prog(t, 0.6, 1.0));
    if (k <= 0) return; g.save(); g.globalAlpha = k; const x = E.W * 0.72; g.strokeStyle = '#ffd25a'; g.lineWidth = 8; g.beginPath(); g.moveTo(x - 30, a.y); g.lineTo(x, a.y); g.lineTo(x, b.y); g.lineTo(x - 30, b.y); g.stroke();
    g.fillStyle = 'rgba(4,14,26,.85)'; g.beginPath(); g.roundRect(x - 210, (a.y + b.y) / 2 - 64, 280, 128, 22); g.fill();
    text(g, '1+ MILE', x - 70, (a.y + b.y) / 2 - 16, { size: 58, color: '#ffd25a', weight: 900, font: FONTS.ui }); text(g, 'of water on top', x - 70, (a.y + b.y) / 2 + 34, { size: 32, color: '#ffffff', weight: 900, font: FONTS.ui }); g.restore(); },
});

// ---------- s11 the sub lands on the seafloor: silt puff ----------
function floorInit(T) { const W = seaStage(T, { zone: 2, seed: 17, snow: 120, fogNear: 6, fogFar: 26 });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), toon('#4a5060')); fl.rotation.x = -Math.PI / 2; fl.position.y = -1.3; fl.userData.noOutline = true; W.stage.add(fl);
  const rocks = new THREE.Group(); for (let i = 0; i < 9; i++) { const r = new THREE.Mesh(new THREE.DodecahedronGeometry(0.4 + (i % 3) * 0.3), toon('#3a3f4c')); r.position.set(-7 + i * 1.8, -1.2, -3 - (i % 4) * 1.5); rocks.add(r); } outline(rocks, { px: 2 }); W.stage.add(rocks);
  const silt = []; for (let i = 0; i < 12; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), new THREE.MeshToonMaterial({ color: '#8a8a90', transparent: true, opacity: 0.6 })); m.userData.noOutline = true; W.stage.add(m); silt.push(m); }
  const s = sub(); W.stage.add(s); s.setLights(1); return { W, stage: W.stage, s, silt }; }
function floorDraw(s, t, land) { s.W.sink(t, 0.4); s.s.tick(t); const k = ease.out(prog(t, 0, land)); s.s.position.y = lerp(3.5, -0.05, k); s.s.rotation.set(lerp(0.5, 0, k), 0.4, 0);
  s.silt.forEach((m, i) => { const a = (i / 12) * Math.PI * 2, age = t - land; const r = age > 0 ? 1.6 + age * 2.2 : 0; m.position.set(Math.cos(a) * r, -1.1 + Math.max(0, age) * 0.3, Math.sin(a) * r * 0.7); m.scale.setScalar(age > 0 ? 0.4 + age * 0.6 : 0.001); m.material.opacity = clamp(0.6 - age * 0.3); }); }
registerShot('s11', { kind: '3d', init: floorInit,
  draw(s, t) { floorDraw(s, t, 0.9); s.s.hero.pose(POSE.stand); s.s.hero.face(EXPR.shocked, t); s.stage.cam([4.5, 1.2, 8], [0, -0.2, 0], 40); shakeCam(s.stage, t, [{ fx: 'shake', at: 0.9, amp: 0.1, dur: 0.3 }]); },
  overlay(g, t, info) { depthCounter(g, DEPTH(G(info, t))); },
});
// ---------- s12 "...have ever been down there." cockpit: the hero waves, grinning, lights on the seafloor ----------
registerShot('s12', { kind: '3d', init: floorInit,
  draw(s, t) { floorDraw(s, t + 3, 0.9); const w = Math.sin(t * 9);
    s.s.hero.pose(addPose(POSE.stand, { armR: [0.3, 2.7, 0], elbowR: 0.5 + 0.35 * w, headTilt: 0.12 })); s.s.hero.face({ ...EXPR.grin, pupil: [0, 0] }, t);
    camMove(s.stage, t, [[0, { pos: [0.9, 1.1, 7.2], look: [0, 0.5, 1.3], fov: 34 }], [2, { pos: [0.8, 1.0, 6.4], look: [0, 0.55, 1.3], fov: 34 }]]); },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'sparkle', on: s.s.hero, at: 0.2 }]); depthCounter(g, 10935); },
});
