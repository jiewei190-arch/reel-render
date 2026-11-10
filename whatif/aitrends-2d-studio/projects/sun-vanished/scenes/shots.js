// sun-vanished: "What If the Sun Disappeared?" (Justin clips Short #13). 17 shots, Toon 3D + BEANMEN FX.
import { registerShot, ease, prog, clamp, lerp, E } from '/engine/core.js';
import { THREE, camMove, toonStage, rbox, cyl, ball, flat, outline } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, tremble, point } from '/kits/toon3d/rig.js';
import { castMember } from '/kits/toon3d/cast.js';
import { reactions, shakeCam, project } from '/kits/toon3d/react.js';
import { insertShot } from '/kits/toon3d/insert.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import { at, space, park, chalkboard, readout, stars } from './_lib.js';

const RAYS = { rays: { from: [-40, -60], strength: 1 }, tint: '#ffcf8a' };
const SOFT = { rays: false, tint: '#ffcf8a' };
const SIT = { ...POSE.sit, legL: [1.5, 0.15], legR: [1.5, 0.15], kneeL: 0.1, kneeR: 0.1 };
const sitDown = (b) => { b.position.y = -0.62; };

// ---------- space: b01 / b17 (the Sun pops out of existence; Earth, far off, has no idea) ----------
const vanishShot = {
  init(T) { const s = space(T, { sunR: 1.5, orbitR: 6, earthR: 0.6 }); s.placeEarth(1.35); s.earth.rotation.y = 0; return s; },
  draw(s, t, info, vt) { s.sun.pulse(t); const k = vt == null ? 0 : clamp((t - vt) / 0.55); s.sun.vanish(k); s.ghost.material.opacity = k >= 1 ? 0.35 : 0;
    s.earth.update(t, { lid: 0.45, look: [-0.5, 0.1] });
    camMove(s.stage, t, [[-2, { pos: [0.3, 4.6, 18.5], look: [0.3, 0.3, 3.2], fov: 40 }], [2, { pos: [0.3, 4.4, 16.8], look: [0.3, 0.3, 3.2], fov: 40 }]], ease.inOut); },
};
registerShot('b01', { kind: '3d', init: vanishShot.init,
  draw(s, t, info) { vanishShot.draw(s, t, info, at(info, 'vanished', 1.0) - 0.05); },
  overlay(g, t, info, s) { const v = at(info, 'vanished', 1.0); reactions(g, t, s, [{ fx: 'flash', at: v + 0.35, dur: 0.22 }, { fx: 'sparkle', on: [0, 0, 0], at: v + 0.3, scale: 2.4 }, { fx: 'sparkle', on: [1.5, 1.2, 0], at: v + 0.38, scale: 1.4 }]); } });
registerShot('b17', { kind: '3d', init: vanishShot.init, draw(s, t, info) { vanishShot.draw(s, t - info.dur, info, null); } });

// ---------- park helpers ----------
function castPose(s, t, o = {}) {
  sitDown(s.hero); s.hero.pose(addPose(o.heroPose || { ...SIT, armR: [0.9, 0.2, 0.3], elbowR: 1.9 }, { headNod: o.heroNod ?? 0.05, headTurn: o.heroTurn ?? 0 })); s.hero.face(o.heroFace || { ...EXPR.happy, talk: o.chew ? 0.5 + 0.5 * Math.sin(t * 12) : 0 }, t);
  s.dev.pose(addPose(o.devPose || { ...POSE.stand, armR: [1.2, 0.1, 0.2], elbowR: 1.2 }, idle(t, 2))); s.dev.face(o.devFace || EXPR.grin, t);
  s.mina.pose(addPose(o.minaPose || { ...POSE.stand, armR: [1.0, 0.1, 0.3], elbowR: 1.4 }, idle(t, 3))); s.mina.face(o.minaFace || EXPR.deadpan, t); s.mina.prop.tick?.(o.watch ?? t);
  s.cat.update(t, o.cat || { lid: 0.75, tail: 0.4 });
}
const heroSandwich = (s) => { const sw = s.sand.clone(); sw.position.set(0, 0.05, 0.12); sw.rotation.x = 1.2; s.hero.hold('R', sw); s.sand.visible = false; return sw; };

// b02 "You wouldn't know for 8 minutes." picnic in full sun, the Sun still in their sky; Mina starts her stopwatch
registerShot('b02', { kind: '3d',
  init(T) { const s = park(T, {}); heroSandwich(s); return s; },
  draw(s, t) { s.update(t); castPose(s, t, { chew: true });
    camMove(s.stage, t, [[0, { pos: [0.2, 1.5, 7.6], look: [-0.4, 2.8, 0], fov: 50 }], [2.1, { pos: [0.2, 1.55, 6.9], look: [-0.4, 2.8, 0], fov: 50 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); const m = at(info, 'minutes', 0.9); reactions(g, t, s, [{ fx: 'sparkle', on: s.mina.prop, at: m, scale: 0.6 }]); if (t > m) readout(g, s.stage, s.mina.prop, t - m, { scale: 0.7, pos: [E.W * 0.3, E.H * 0.47] }); } });

// ---------- space after the vanish: ghost outline, Earth still orbiting ----------
const after = {
  init(T) { const s = space(T, { sunR: 1.5, orbitR: 6, earthR: 0.6 }); s.sun.visible = false; s.ghost.material.opacity = 0.35; return s; },
};
// b03 "Even gravity takes 8 minutes to get the news." a ripple + a tiny envelope race from the empty spot to Earth
function envelope(g, x, y, s = 1) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#fbf8f2'; g.strokeStyle = '#2a1c15'; g.lineWidth = 6; g.lineJoin = 'round'; g.beginPath(); g.roundRect(-46, -30, 92, 60, 8); g.fill(); g.stroke(); g.beginPath(); g.moveTo(-46, -30); g.lineTo(0, 6); g.lineTo(46, -30); g.stroke(); g.fillStyle = '#d63a3a'; g.beginPath(); g.arc(0, 6, 9, 0, 7); g.fill(); g.restore(); }
const b03draw = (s, t, info) => { const a = 1.0 + t * 0.04; s.placeEarth(a); s.earth.rotation.y = -0.2; s.earth.update(t, { lid: 0.45, look: [-0.3, 0] }); s.ripple(t, 0.2, at(info, 'news', 2.2) - 0.2);
  camMove(s.stage, t, [[0, { pos: [0.6, 12, 18], look: [0.8, -0.4, 2.2], fov: 42 }], [3, { pos: [0.6, 11.4, 17], look: [0.8, -0.4, 2.2], fov: 42 }]]); };
registerShot('b03', { kind: '3d', init: after.init, draw: b03draw,
  overlay(g, t, info, s) { const n = at(info, 'news', 2.2); const k = ease.inOut(prog(t, 0.2, n)); const p0 = project(s.stage, [0, 0, 0]), p1 = project(s.stage, s.earth.position);
    if (t < n + 0.1) envelope(g, lerp(p0.x, p1.x, k), lerp(p0.y, p1.y, k) - 30 - Math.sin(k * Math.PI) * 120, 1.2);
    reactions(g, t, s, [{ fx: 'exclaim', on: 'earth', at: n }, { fx: 'ripples', on: 'earth', at: n, atFeet: false }]); } });

// b04 INSERT: SUNLIGHT TRAVEL TIME  8 MIN 20 S
insertShot('b04', { scene: { init: after.init, draw: (s, t, info) => b03draw(s, t + 3, { ...info, shot: { start: 3.95 } }) },
  insert: { type: 'bigtext', kicker: 'SUNLIGHT TRAVEL TIME', title: '8 MIN 20 S', lines: ['Sun to Earth (average)'] } });

// b05 "So the sky still looks totally normal." everyone happy in the sun; Biscuit sunbathes (hearts)
registerShot('b05', { kind: '3d',
  init(T) { const s = park(T, { seed: 5 }); heroSandwich(s); return s; },
  draw(s, t) { s.update(t); castPose(s, t, { chew: true, devPose: { ...POSE.stand, armR: [2.2, 0.2, 0], elbowR: 0.6 }, devFace: EXPR.happy, cat: { lid: 0.85, tail: 0.2, headTilt: 0.2 } });
    camMove(s.stage, t, [[0, { pos: [1.3, 1.4, 5.8], look: [0.4, 1.4, 1.5], fov: 44 }], [2.3, { pos: [1.2, 1.4, 5.3], look: [0.4, 1.4, 1.5], fov: 44 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); const n = at(info, 'normal', 1.4); reactions(g, t, s, [{ fx: 'hearts', on: 'cat', at: 0.4, scale: 0.8 }, { fx: 'sparkle', on: 'hero', at: n, scale: 0.8 }]); } });

// b06 "And Earth keeps circling... nothing." top-down-ish: Earth goes round an empty spot, "???"
registerShot('b06', { kind: '3d', init: after.init,
  draw(s, t, info) { const a = 1.2 + t * 0.55; s.placeEarth(a); s.earth.rotation.y = -a + Math.PI / 2 + 0.6; const n = at(info, 'nothing', 1.4);
    s.earth.update(t, { lid: t > n ? 0.1 : 0.4, look: t > n ? [-0.6, 0] : [0, 0], pupil: t > n ? 0.7 : 1 });
    camMove(s.stage, t, [[0, { pos: [0, 21, 11], look: [0, -0.6, 0.6], fov: 50 }], [2.2, { pos: [0, 20, 10], look: [0, -0.6, 0.6], fov: 50 }]]); },
  overlay(g, t, info, s) { const n = at(info, 'nothing', 1.4); reactions(g, t, s, [{ fx: 'question', on: 'earth', at: n }, { fx: 'spotlight', at: n, until: info.dur + 1, on: [0, 0, 0] }]); } });

// b07 "Wait, how?" HERO close-up, squint, ???
registerShot('b07', { kind: '3d',
  init(T) { const s = park(T, { seed: 7 }); heroSandwich(s); return s; },
  draw(s, t) { s.update(t); castPose(s, t, { heroFace: { ...EXPR.suspicious, lid: 0.3, browL: 0.7 }, heroTurn: 0.1, heroNod: -0.05, heroPose: { ...SIT, armR: [0.6, 0.2, 0.3], elbowR: 1.6, headTilt: 0.15 } });
    camMove(s.stage, t, [[0, { pos: [-0.1, 1.5, 3.9], look: [-0.2, 1.4, 1.1], fov: 38 }], [1.0, { pos: [-0.1, 1.5, 3.6], look: [-0.2, 1.4, 1.1], fov: 38 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); reactions(g, t, s, [{ fx: 'question', on: 'hero', at: 0.12 }]); } });

// b08 "You see, gravity is not instant either." DR LIN at a chalkboard in the park
registerShot('b08', { kind: '3d',
  init(T) { const s = park(T, { cast: false, seed: 8, target: [0, 0, 0] }); s.board = chalkboard(); s.board.scale.setScalar(0.72); s.board.position.set(0.75, 0, 0.2); s.stage.add(s.board);
    s.lin = castMember('lin'); s.lin.position.set(-1.05, 0, 1.0); s.lin.rotation.y = 0.35; s.stage.add(s.lin); return s; },
  draw(s, t, info) { s.update(t); const n = at(info, 'not', 0.9); const pk = ease.inOut(prog(t, 0.2, 0.6));
    s.lin.pose(addPose(point({ ...POSE.stand, ...idle(t, 4) }, 'L', pk, { up: 0.3 }), { headTurn: t > n ? -0.6 : 0.3 })); s.lin.face(t > n ? { ...EXPR.deadpan, talk: 0 } : EXPR.neutral, t);
    camMove(s.stage, t, [[0, { pos: [0.1, 1.9, 9.6], look: [0.1, 1.7, 0.5], fov: 44 }], [info.dur, { pos: [0.1, 1.9, 8.8], look: [0.1, 1.7, 0.5], fov: 44 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); const n = at(info, 'not', 0.9); reactions(g, t, s, [{ fx: 'exclaim', on: 'lin', at: n, until: n + 0.9 }, { fx: 'sparkle', on: [0.75, 1.6, 0.3], at: at(info, 'either', 1.5), scale: 1.2 }]); } });

// b09 "It travels at the speed of light." space: gravity ripples racing outward, Earth braces (sweat)
registerShot('b09', { kind: '3d', init: after.init,
  draw(s, t, info) { const a = 1.0; s.placeEarth(a); s.earth.rotation.y = -0.2; s.earth.update(t, { lid: 0.15, look: [-0.4, 0], pupil: 0.8 }); s.ripple(t, 0.0, 1.2); s.rings.forEach((m, i) => (m.material.color.set(i % 2 ? '#ffe28a' : '#c8e0ff')));
    camMove(s.stage, t, [[0, { pos: [0.6, 12, 18], look: [0.8, -0.4, 2.2], fov: 42 }], [info.dur, { pos: [0.6, 10.5, 16], look: [0.8, -0.4, 2.2], fov: 42 }]]); },
  overlay(g, t, info, s) { const l = at(info, 'light', 1.2); reactions(g, t, s, [{ fx: 'speedlines', at: 0.1, until: info.dur + 1 }, { fx: 'sweat', on: 'earth', at: 0.3 }, { fx: 'flash', at: l, dur: 0.2 }]); } });

// b10 "Then, at minute 8..." Mina's stopwatch close: 8:19 -> 8:20 on "8"
registerShot('b10', { kind: '3d',
  init(T) { const s = park(T, { seed: 10 }); return s; },
  draw(s, t, info) { s.update(t); castPose(s, t, { minaPose: { ...POSE.stand, armR: [1.35, 0.05, 0.4], elbowR: 1.5 }, minaFace: { ...EXPR.worried, pupil: [0.3, -0.5] }, watch: 500 + t });
    camMove(s.stage, t, [[0, { pos: [-1.2, 1.55, 4.0], look: [-1.6, 1.4, 1.4], fov: 34 }], [info.dur, { pos: [-1.25, 1.5, 3.5], look: [-1.6, 1.4, 1.4], fov: 34 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); const e = at(info, '8', 0.65); readout(g, s.stage, s.mina.prop, t < e ? 499 : 500, { scale: 1.1, pos: [E.W * 0.5, E.H * 0.2], color: t < e ? '#2a1c15' : '#d63a3a' });
    reactions(g, t, s, [{ fx: 'sweat', on: 'mina', at: 0.2 }]); } });

// b11 "lights out." hard cut to black: the same picnic in starlight, wide white eyes, "!"
const darkPark = (T, o = {}) => { const s = park(T, { dark: true, light: 'night', ground: o.ground || '#3a5a3a', leaf: o.leaf, hill: o.hill || '#1e2a24', seed: 11, ...o }); s.stage.scene.background = new THREE.Color('#05060c'); s.stage.add(stars(1100, 170, 6)); s.stage.exposure = o.exposure ?? 0.75; return s; };
registerShot('b11', { kind: '3d',
  init(T) { const s = darkPark(T); heroSandwich(s); return s; },
  draw(s, t) { castPose(s, t, { heroFace: EXPR.shocked, devFace: EXPR.shocked, minaFace: EXPR.shocked, heroPose: { ...SIT, armR: [0.9, 0.2, 0.3], elbowR: 1.9, armL: [0.4, 0.8, 0] }, devPose: POSE.panic, cat: { lid: 0, earsBack: 1, tail: 1 } });
    camMove(s.stage, t, [[0, { pos: [0.2, 1.5, 7.2], look: [-0.2, 1.7, 0.8], fov: 46 }], [1.1, { pos: [0.2, 1.5, 6.8], look: [-0.2, 1.7, 0.8], fov: 46 }]]); shakeCam(s.stage, t, [{ fx: 'shake', at: 0.1, amp: 0.08, dur: 0.4 }]); },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'exclaim', on: 'hero', at: 0.12 }, { fx: 'exclaim', on: 'dev', at: 0.2 }, { fx: 'exclaim', on: 'mina', at: 0.28 }]); } });

// b12 "The Moon goes dark too. Only the stars are left." looking up: the Moon fades out, stars stay
registerShot('b12', { kind: '3d',
  init(T) { const s = darkPark(T, { exposure: 0.8 }); const mm = new THREE.MeshBasicMaterial({ color: '#e8e6dc' }); s.moon = new THREE.Mesh(new THREE.SphereGeometry(6, 32, 20), mm); s.moon.position.set(12, 52, -110); s.moonM = mm; s.stage.add(s.moon);
    const craters = [[-1.5, 1.6, 1.2], [2.0, -0.8, 1.5], [-0.5, -2.4, 0.9]].map(([x, y, r]) => { const c = new THREE.Mesh(new THREE.CircleGeometry(r, 20), new THREE.MeshBasicMaterial({ color: '#c8c4b8' })); c.position.set(x, y, 6.01); s.moon.add(c); return c; }); s.craters = craters; s.moon.lookAt(0, 1.5, 6); return s; },
  draw(s, t, info) { const d = at(info, 'dark', 0.6); const k = ease.inOut(prog(t, d - 0.1, d + 0.6)); s.moonM.color.set('#e8e6dc').lerp(new THREE.Color('#0d0f18'), k); s.craters.forEach(c => c.material.color.set('#c8c4b8').lerp(new THREE.Color('#0b0d16'), k));
    castPose(s, t, { heroFace: { ...EXPR.worried, pupil: [0.3, 1] }, devFace: { ...EXPR.worried, pupil: [0.2, 1] }, minaFace: { ...EXPR.deadpan, pupil: [0.3, 1] }, heroNod: -0.5, devPose: { ...POSE.stand, headNod: -0.5 }, minaPose: { ...POSE.stand, headNod: -0.5 } });
    camMove(s.stage, t, [[0, { pos: [-0.4, 0.9, 6.5], look: [1.6, 7.5, -10], fov: 52 }], [info.dur, { pos: [-0.4, 0.9, 6.0], look: [1.8, 8.5, -10], fov: 52 }]]); },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'question', on: 'dev', at: at(info, 'stars', 2.1) }, { fx: 'sparkle', on: [-14, 40, -100], at: at(info, 'stars', 2.1), scale: 1.4 }, { fx: 'sparkle', on: [20, 30, -100], at: at(info, 'stars', 2.1) + 0.2, scale: 1.2 }]); } });

// b13 "Earth flies off in a straight line, into space." Earth leaves its orbit along the tangent
registerShot('b13', { kind: '3d', init: after.init,
  draw(s, t, info) { const a0 = 1.0, f = at(info, 'flies', 0.2); const R = s.R; const p0 = [Math.cos(a0) * R, 0, Math.sin(a0) * R]; const tg = [-Math.sin(a0), 0, Math.cos(a0)];
    const d = Math.max(0, t - f); const dist = d * 1.4 + d * d * 1.0; s.earth.position.set(p0[0] + tg[0] * dist, 0, p0[2] + tg[2] * dist); s.earth.rotation.y = 0.2; s.earth.update(t, { lid: 0, look: [0, 0], pupil: 0.65, spin: 1.2 });
    camMove(s.stage, t, [[0, { pos: [0.6, 12, 18], look: [0.8, -0.4, 2.2], fov: 42 }], [info.dur, { pos: [-0.4, 11, 21], look: [-0.8, -0.4, 5.0], fov: 46 }]]); },
  overlay(g, t, info, s) { const f = at(info, 'flies', 0.2); reactions(g, t, s, [{ fx: 'exclaim', on: 'earth', at: f, until: f + 1.2 }, { fx: 'sweat', on: 'earth', at: f + 0.2 }, { fx: 'speedlines', at: f + 0.3, until: info.dur + 1 }]); } });

// b14 "In a few weeks, the whole planet freezes." the park, dark, frosted white, snow falling, everyone shivering
registerShot('b14', { kind: '3d',
  init(T) { const s = darkPark(T, { ground: '#cfdcea', leaf: ['#dfe9f2', '#c9d8e6', '#eef4f8'], hill: '#9fb0c4', exposure: 0.95 }); s.stage.hemi.color.set('#9fb8ff'); s.stage.hemi.intensity = 1.0;
    const n = 500, p = new Float32Array(n * 3), base = []; for (let i = 0; i < n; i++) { const x = (Math.sin(i * 12.9) * 0.5 + 0.5) * 14 - 7, y = (Math.sin(i * 78.2) * 0.5 + 0.5) * 8, z = (Math.sin(i * 37.7) * 0.5 + 0.5) * 10 - 4; base.push([x, y, z]); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(p, 3)); s.snow = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#ffffff', size: 5, sizeAttenuation: false })); s.snow.userData.noOutline = true; s.snow.frustumCulled = false; s.stage.add(s.snow); s.snowBase = base;
    for (const b of [s.hero, s.dev, s.mina]) { const cap = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 8, 0, Math.PI * 2, 0, 0.9), new THREE.MeshToonMaterial({ color: '#f4f8fc' })); cap.position.y = 0.06; b.parts.head.add(cap); } return s; },
  draw(s, t, info) { const pos = s.snow.geometry.attributes.position; s.snowBase.forEach(([x, y, z], i) => { pos.setXYZ(i, x + Math.sin(t + i) * 0.2, ((y - t * 1.1) % 8 + 8) % 8, z); }); pos.needsUpdate = true;
    castPose(s, t, { heroFace: { ...EXPR.worried, mouth: 'wavy' }, devFace: { ...EXPR.worried, mouth: 'wavy' }, minaFace: { ...EXPR.deadpan, mouth: 'wavy' }, heroPose: addPose({ ...SIT, armL: [0.9, -0.3, 0], armR: [0.9, -0.3, 0], elbowL: 1.8, elbowR: 1.8 }, tremble(t, 3)), devPose: addPose({ ...POSE.stand, armL: [0.9, -0.3, 0], armR: [0.9, -0.3, 0], elbowL: 1.8, elbowR: 1.8 }, tremble(t, 3)), minaPose: addPose(POSE.stand, tremble(t, 2.5)), cat: { lid: 0.7, earsBack: 1, tail: 0 } });
    camMove(s.stage, t, [[0, { pos: [0.2, 1.6, 7.6], look: [-0.2, 1.6, 0.8], fov: 46 }], [info.dur, { pos: [0.2, 1.6, 6.8], look: [-0.2, 1.6, 0.8], fov: 46 }]]); },
  overlay(g, t, info, s) { g.save(); g.globalCompositeOperation = 'soft-light'; g.fillStyle = 'rgba(120,170,255,0.35)'; g.fillRect(0, 0, E.W, E.H); g.restore(); const f = at(info, 'freezes', 1.4);
    reactions(g, t, s, [{ fx: 'sweat', on: 'hero', at: 0.3, color: '#bfe4ff' }, { fx: 'exclaim', on: 'dev', at: f }, { fx: 'shake', at: f, amp: 0.05, dur: 0.4 }]); } });

// b15 "So that last bit of sunshine you saw..." flashback (iris open): HERO in golden light, looking up at the Sun
registerShot('b15', { kind: '3d',
  init(T) { const s = park(T, { seed: 15 }); heroSandwich(s); return s; },
  draw(s, t, info) { s.update(t); castPose(s, t, { heroFace: { ...EXPR.happy, lid: 0.45, pupil: [-0.3, 0.8] }, heroNod: -0.45, heroTurn: 0.25 });
    camMove(s.stage, t, [[0, { pos: [0.9, 1.0, 4.2], look: [-0.5, 2.0, 0.6], fov: 42 }], [info.dur, { pos: [0.7, 1.05, 3.4], look: [-0.5, 1.9, 0.8], fov: 42 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: { from: [-60, -80], strength: 1.4 }, tint: '#ffc070', tintAmount: 0.32 }); reactions(g, t, s, [{ fx: 'glow', on: 'hero', at: 0.2 }]); } });

// b16 "was already 8 minutes old." Mina holds up the stopwatch: 8:20, deadpan stare at the lens
registerShot('b16', { kind: '3d',
  init(T) { const s = park(T, { seed: 16 }); return s; },
  draw(s, t) { s.update(t); castPose(s, t, { minaPose: { ...POSE.stand, armR: [1.45, 0.1, 0.5], elbowR: 1.2 }, minaFace: { ...EXPR.deadpan, lid: 0.55, pupil: [0, 0] }, watch: 500 });
    camMove(s.stage, t, [[0, { pos: [-1.3, 1.5, 3.9], look: [-1.6, 1.35, 1.4], fov: 36 }], [1.9, { pos: [-1.35, 1.48, 3.5], look: [-1.6, 1.35, 1.4], fov: 36 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); const o = at(info, 'old', 1.1); readout(g, s.stage, s.mina.prop, 500, { scale: 1.1, pos: [E.W * 0.5, E.H * 0.2], color: '#d63a3a' }); reactions(g, t, s, [{ fx: 'stars', on: 'mina', at: o }, { fx: 'sparkle', on: s.mina.prop, at: o, scale: 0.7 }]); } });
