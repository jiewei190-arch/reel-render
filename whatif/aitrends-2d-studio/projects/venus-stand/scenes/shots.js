// "What If You Stood on Venus?" (venus-stand): 13 shots, Toon 3D + BEANMEN FX (Venus mood light, reactions, 3 insert cards, whip/iris/flash).
// Tone guard: the HERO's suit sizzles and squeaks, he is never hurt; he gets beamed out and comes back for the loop.
import { registerShot, ease, prog, lerp, clamp, E } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, shrug, tremble } from '/kits/toon3d/rig.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { insertShot, dimScene, drawInsert } from '/kits/toon3d/insert.js';
import { sunnyLook, softTint } from '/kits/toon3d/sky.js';
import { at, tag, venus, astro, tomas, probe, ingot, sodaCan, deepSea, earth, acidSky, beam, smoke, THREE } from './_lib.js';

const HAZE = { rays: { from: [-60, -80], strength: 0.55 }, tint: '#ffd0a0' };
const WARM = { rays: false, tint: '#ffd0a0' };
function shimmer(g, t, a = 0.18) { g.save(); g.globalAlpha = a; g.strokeStyle = '#ffe0a0'; g.lineWidth = 5; for (let i = 0; i < 9; i++) { const y = E.H * (0.55 + i * 0.05) - ((t * 40) % 60); g.beginPath(); for (let x = 0; x <= E.W; x += 30) g.lineTo(x, y + Math.sin(x * 0.02 + t * 6 + i) * 8); g.stroke(); } g.restore(); }
function pressArrows(g, t, k) { if (k <= 0) return; g.save(); g.globalAlpha = k; g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = '#fff3d8'; g.lineWidth = 16;
  for (let i = 0; i < 5; i++) { const x = E.W * (0.14 + 0.18 * i), y = E.H * (0.16 + ((t * 0.5 + i * 0.29) % 1) * 0.12); g.beginPath(); g.moveTo(x, y - 110); g.lineTo(x, y); g.moveTo(x - 34, y - 38); g.lineTo(x, y); g.lineTo(x + 34, y - 38); g.stroke(); } g.restore(); }

// ---------- the HERO on the Venus plain (frame 1, s02, s03, s05, s08, s11, s13) ----------
const plain = {
  init(T, o = {}) { const s = venus(T, { target: [0, 0, 1], seed: o.seed || 3 }); s.h = astro(); s.h.position.set(0, 0, 1); s.stage.add(s.h);
    s.steam = [-0.35, 0.35].map(x => { const m = smoke({ count: 6, size: 0.25, rise: 0.35, life: 1.6, spread: 0.3, color: '#e8d8c8', seed: x > 0 ? 3 : 4 }); m.position.set(x, 0.05, 1.1); s.stage.add(m); return m; });
    s.drips = [0, 1, 2, 3].map(i => { const d = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), new THREE.MeshToonMaterial({ color: '#8ef04a', emissive: new THREE.Color('#4a9a1a'), emissiveIntensity: 0.4 })); d.scale.y = 1.4; d.visible = false; s.h.parts.head.add(d); return d; });
    s.bm = beam(); s.bm.position.set(0, 0, 1); s.stage.add(s.bm); return s; },
  // o: crush 0..1, steam bool, drip 0..1, beam 0..1, lift (units up), pose, face
  draw(s, t, info, o = {}) { s.update(t); const c = o.crush || 0; const base = o.pose || POSE.stand;
    s.h.pose(addPose(base, { ...idle(t, 1), ...(c > 0 ? tremble(t, 1.5 * c) : {}) })); s.h.face(o.face || EXPR.worried, t); s.h.scale.set(1 + c * 0.1, 1 - c * 0.12, 1 + c * 0.1);
    s.h.position.y = o.lift || 0; s.steam.forEach(m => { m.visible = !!o.steam; m.update(t); });
    s.drips.forEach((d, i) => { d.visible = (o.drip || 0) > 0.02; const a = ((t * 0.6 + i * 0.27) % 1); const ang = -1.2 + i * 0.8; d.position.set(Math.sin(ang) * 0.86, 0.75 - a * 1.1, Math.cos(ang) * 0.86 * 0.9); });
    s.bm.set(o.beam || 0, t); if (o.keys) camMove(s.stage, t, o.keys); },
};
const CU = (dz = 0) => [[0, { pos: [0.5, 2.2, 6.4 - dz], look: [0, 1.75, 1], fov: 36 }], [99, { pos: [0.4, 2.15, 5.6 - dz], look: [0, 1.8, 1], fov: 36 }]];
const K01 = [[0, { pos: [0.9, 2.3, 6.6], look: [0, 1.6, 1], fov: 40 }], [2.85, { pos: [0.6, 2.1, 5.6], look: [0, 1.7, 1], fov: 38 }]];

// s01 FRAME 1 "On Venus, you'd be crushed, cooked and dissolved." squeeze on "crushed", steam on "cooked", acid drips on "dissolved"
registerShot('s01', { kind: '3d', init: (T) => plain.init(T),
  draw(s, t, info) { const cr = at(info, 'crushed', 1.0), co = at(info, 'cooked', 1.48), di = at(info, 'dissolved', 1.92);
    plain.draw(s, t, info, { crush: 0.5 + 0.5 * ease.out(prog(t, cr, cr + 0.25)), steam: true, drip: prog(t, di, di + 0.2), face: t < cr ? EXPR.worried : EXPR.shocked, keys: K01 });
    shakeCam(s.stage, t, [{ fx: 'shake', at: cr, amp: 0.05, dur: 0.3 }]); },
  overlay(g, t, info, s) { sunnyLook(g, t, HAZE); shimmer(g, t); const cr = at(info, 'crushed', 1.0), co = at(info, 'cooked', 1.48), di = at(info, 'dissolved', 1.92);
    reactions(g, t, s, [{ fx: 'exclaim', on: 'h', at: 0.0, until: cr - 0.05 }, { fx: 'sweat', on: 'h', at: cr }, { fx: 'stars', on: 'h', at: co, scale: 0.7 }, { fx: 'flash', at: di, dur: 0.15 }]); } });

// s02 "In that order?" HERO looks at the lens, deadpan, "???"
registerShot('s02', { kind: '3d', init: (T) => plain.init(T),
  draw(s, t, info) { plain.draw(s, t, info, { crush: 0.4, steam: true, pose: shrug(POSE.stand, ease.inOut(prog(t, 0.1, 0.4))), face: { ...EXPR.suspicious, pupil: [0, 0] }, keys: CU() }); },
  overlay(g, t, info, s) { sunnyLook(g, t, WARM); shimmer(g, t, 0.12); reactions(g, t, s, [{ fx: 'question', on: 'h', at: 0.15 }]); } });

// s03 "No. All at once." everything at once: squeeze + steam + drips, "!" + sweat + shake on "once"
registerShot('s03', { kind: '3d', init: (T) => plain.init(T, { seed: 5 }),
  draw(s, t, info) { const o = at(info, 'once.', 1.3); const k = ease.out(prog(t, o - 0.1, o + 0.15));
    plain.draw(s, t, info, { crush: 0.3 + 0.7 * k, steam: true, drip: 1, pose: mixPose(POSE.stand, POSE.panic, k), face: mixExpr(EXPR.deadpan, EXPR.panic, k), keys: [[0, { pos: [0, 2.0, 7.2], look: [0, 1.6, 1], fov: 38 }], [info.dur, { pos: [0, 1.9, 6.2], look: [0, 1.7, 1], fov: 38 }]] });
    shakeCam(s.stage, t, [{ fx: 'shake', at: o, amp: 0.08, dur: 0.5 }]); },
  overlay(g, t, info, s) { const o = at(info, 'once.', 1.3); sunnyLook(g, t, HAZE); shimmer(g, t);
    reactions(g, t, s, [{ fx: 'exclaim', on: 'h', at: o }, { fx: 'sweat', on: 'h', at: o + 0.1 }, { fx: 'flash', at: o, dur: 0.2 }]); tag(g, 'ALL AT ONCE', ease.out(prog(t, o, o + 0.3)), 0.13); } });

// s04 "Wait, how?" TOMAS on sunny Earth: shrug + "???"
registerShot('s04', { kind: '3d', init(T) { const s = earth(T); s.t = tomas(); s.stage.add(s.t); return s; },
  draw(s, t, info) { s.sky.update(t); s.t.pose(shrug(POSE.stand, ease.inOut(prog(t, 0.05, 0.35)))); s.t.face({ ...EXPR.suspicious, pupil: [0, 0] }, t);
    camMove(s.stage, t, [[0, { pos: [0.2, 2.1, 4.4], look: [0, 2.0, 0], fov: 32 }], [info.dur, { pos: [0.2, 2.1, 4.0], look: [0, 2.0, 0], fov: 32 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: { from: [-60, -80], strength: 0.7 }, tint: '#ffcf8a' }); reactions(g, t, s, [{ fx: 'question', on: 't', at: 0.1 }]); } });

// s05 "You see, the air there presses down over 90 times harder than on Earth." arrows press down, the HERO's soda can crumples on "90"
registerShot('s05', { kind: '3d', init(T) { const s = plain.init(T, { seed: 7 }); s.can = sodaCan(); s.h.hold('R', s.can); s.can.position.set(0, 0.05, 0.12); return s; },
  draw(s, t, info) { const n = at(info, '90', 2.35); const k = ease.out(prog(t, n, n + 0.35)); s.can.crush(k);
    plain.draw(s, t, info, { crush: 0.25 + 0.4 * k, pose: { ...POSE.holdFront, armL: POSE.stand.armL, elbowL: POSE.stand.elbowL }, face: mixExpr(EXPR.neutral, EXPR.shocked, k), keys: [[0, { pos: [0.6, 1.9, 6.6], look: [0, 1.5, 1], fov: 38 }], [info.dur, { pos: [0.5, 1.8, 5.6], look: [0, 1.5, 1], fov: 38 }]] }); },
  overlay(g, t, info, s) { const n = at(info, '90', 2.35); sunnyLook(g, t, WARM); pressArrows(g, t, ease.out(prog(t, 0.3, 0.8))); tag(g, '90+ × EARTH\'S AIR PRESSURE', ease.out(prog(t, n, n + 0.3)), 0.33);
    reactions(g, t, s, [{ fx: 'exclaim', on: 'h', at: n + 0.1 }, { fx: 'sweat', on: 'h', at: n + 0.3 }]); } });

// s06 "Like standing 3,000 feet underwater." whip to the deep sea: the suited HERO on the sea floor, bubbles, a fish does a double take
registerShot('s06', { kind: '3d', init(T) { const s = deepSea(T); s.h = astro(); s.h.position.set(0, 0, 1); s.stage.add(s.h); return s; },
  draw(s, t, info) { s.update(t); s.h.pose(addPose(POSE.stand, { ...idle(t, 2), bob: Math.sin(t * 1.5) * 0.04 })); s.h.face({ ...EXPR.worried, pupil: [0.6, 0.2] }, t); s.h.scale.set(1.05, 0.92, 1.05);
    s.fish.position.set(3.2 - t * 1.0, 2.4 + Math.sin(t * 3) * 0.1, 2.2); s.fish.rotation.y = Math.PI + (t > 1.6 ? Math.sin(t * 20) * 0.2 : 0);
    camMove(s.stage, t, [[0, { pos: [0.4, 2.3, 7.0], look: [0, 1.8, 1], fov: 38 }], [info.dur, { pos: [0.3, 2.2, 6.2], look: [0, 1.8, 1], fov: 38 }]]); },
  overlay(g, t, info, s) { const f = at(info, '3,000', 0.6); tag(g, '≈ 3,000 FT DOWN', ease.out(prog(t, f, f + 0.3)), 0.13); reactions(g, t, s, [{ fx: 'question', on: 'fish', at: 1.4, until: 2.3 }, { fx: 'exclaim', on: 'fish', at: 2.3 }]); } });

// s07 INSERT counter 464 °C over the glowing plain (blurred)
const hotPlain = { init: (T) => plain.init(T, { seed: 9 }), draw(s, t, info) { plain.draw(s, t, info, { crush: 0.3, steam: true, face: EXPR.panic, pose: POSE.panic, keys: [[0, { pos: [0, 1.2, 8.5], look: [0, 1.0, 1], fov: 44 }], [info.dur, { pos: [0, 1.3, 7.5], look: [0, 1.0, 1], fov: 44 }]] }); } };
insertShot('s07', { scene: hotPlain, insert: { type: 'counter', title: 'GROUND TEMPERATURE', value: 464, suffix: '°C', lines: ['(867 °F)'], color: '#ff7a2a' } });

// s08 "Hot enough to melt lead." a lead ingot melts into a puddle; the HERO leans in: "???" then "!"
registerShot('s08', { kind: '3d', init(T) { const s = plain.init(T, { seed: 11 }); s.pb = ingot(); s.pb.position.set(-0.45, 0, 2.5); s.stage.add(s.pb); s.h.position.set(0.75, 0, 0.7); s.h.rotation.y = -0.45; return s; },
  draw(s, t, info) { const m = at(info, 'melt', 0.6); const k = ease.inOut(prog(t, m - 0.1, m + 0.8)); s.pb.melt(k);
    plain.draw(s, t, info, { crush: 0.3, steam: true, pose: { ...POSE.stand, lean: 0.25, headNod: 0.3 }, face: k < 0.5 ? EXPR.suspicious : EXPR.shocked, keys: [[0, { pos: [0.1, 2.0, 7.6], look: [0.1, 1.1, 1.5], fov: 40 }], [info.dur, { pos: [0.0, 1.8, 6.8], look: [0.0, 1.0, 1.5], fov: 40 }]] }); },
  overlay(g, t, info, s) { const m = at(info, 'melt', 0.6); sunnyLook(g, t, WARM); shimmer(g, t, 0.2); reactions(g, t, s, [{ fx: 'question', on: 'h', at: 0.05, until: m + 0.4 }, { fx: 'exclaim', on: 'h', at: m + 0.45 }]); tag(g, 'HOT ENOUGH TO MELT LEAD', ease.out(prog(t, m + 0.3, m + 0.6)), 0.13); } });

// s09 INSERT versus: Venus 464 °C vs Mercury 167 °C (Mercury is closer to the Sun)
insertShot('s09', { scene: { init: hotPlain.init, draw: (s, t, info) => hotPlain.draw(s, t + 3.6, info) },
  insert: { type: 'versus', title: 'AVERAGE SURFACE TEMP', lines: ['VENUS 464°C', 'MERCURY 167°C'], colorL: '#e8641a', color: '#6a7a8a' },
  after(g, t) { const k = ease.out(prog(t, 1.9, 2.3)); if (k <= 0) return; g.save(); g.globalAlpha = k; g.font = '900 52px Nunito'; g.textAlign = 'center'; g.lineWidth = 10; g.strokeStyle = '#2a1c15'; g.fillStyle = '#ffffff'; const s = '(Mercury is closer to the Sun)'; g.strokeText(s, E.W / 2, E.H * 0.215); g.fillText(s, E.W / 2, E.H * 0.215); g.restore(); } });

// s10 "And on the way down? Clouds of sulfuric acid." sinking through yellow cloud: acid drips on the helmet, sweat + "!"
registerShot('s10', { kind: '3d', init(T) { const s = acidSky(T); s.h = astro(); s.stage.add(s.h);
    s.drips = [0, 1, 2, 3, 4].map(i => { const d = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), new THREE.MeshToonMaterial({ color: '#8ef04a', emissive: new THREE.Color('#4a9a1a'), emissiveIntensity: 0.4 })); d.scale.y = 1.4; s.h.parts.head.add(d); return d; });
    s.puff = smoke({ count: 8, size: 0.2, rise: 0.4, life: 1.2, spread: 0.9, color: '#f2f2e0', seed: 6 }); s.puff.position.y = 2.7; s.h.add(s.puff); return s; },
  draw(s, t, info) { const a = at(info, 'acid.', 2.45); s.h.position.set(0, -t * 1.5, 0); s.h.pose(addPose(POSE.armsUp, { ...idle(t, 4), legL: [0.3, 0.1], legR: [-0.2, 0.1], kneeL: 0.5, kneeR: 0.3 })); s.h.face(t < a ? EXPR.worried : EXPR.panic, t);
    s.clouds.forEach((c, i) => { c.position.y += 0; }); const dk = prog(t, 1.4, 1.6); s.drips.forEach((d, i) => { d.visible = dk > 0; const q = ((t * 0.7 + i * 0.21) % 1); const ang = -1.4 + i * 0.7; d.position.set(Math.sin(ang) * 0.88, 0.8 - q * 1.2, Math.cos(ang) * 0.8); });
    s.puff.visible = t > 1.5; s.puff.update(t); const y = -t * 1.5;
    s.stage.cam([0.4, y + 2.6, 6.0], [0, y + 1.6, 0], 40); },
  overlay(g, t, info, s) { const a = at(info, 'acid.', 2.45); softTint(g, '#d8f05a', 0.18); tag(g, 'SULFURIC ACID CLOUDS', ease.out(prog(t, a - 0.3, a)), 0.13);
    reactions(g, t, s, [{ fx: 'sweat', on: 'h', at: 1.6 }, { fx: 'exclaim', on: 'h', at: a }]); } });

// s11 "Luckily, you get beamed out." a beam lifts the HERO off Venus: relieved, sparkle + hearts
registerShot('s11', { kind: '3d', init: (T) => plain.init(T, { seed: 13 }),
  draw(s, t, info) { const b = ease.out(prog(t, 0, 0.3)), up = ease.in(prog(t, 0.6, info.dur)); plain.draw(s, t, info, { crush: 0.3 * (1 - b), beam: b, lift: up * 5, pose: POSE.armsUp, face: EXPR.happy, keys: [[0, { pos: [0, 2.4, 8.0], look: [0, 2.2, 1], fov: 42 }], [info.dur, { pos: [0, 3.2, 8.4], look: [0, 3.6, 1], fov: 42 }]] }); },
  overlay(g, t, info, s) { sunnyLook(g, t, HAZE); reactions(g, t, s, [{ fx: 'sparkle', on: 'h', at: 0.15 }, { fx: 'hearts', on: 'h', at: 0.45 }]); } });

// s12 "The longest any probe has lasted there? 127 minutes." the lander on the plain, then the 127 MIN card on "127"
const lander = { init(T) { const s = venus(T, { target: [0, 0, 0], seed: 15 }); s.p = probe(); s.p.position.set(0, 0, 0); s.p.rotation.y = 0.4; s.stage.add(s.p);
    s.st = smoke({ count: 8, size: 0.3, rise: 0.4, life: 2, spread: 1.6, color: '#e8d8c8', seed: 8 }); s.stage.add(s.st); return s; },
  draw(s, t, info) { s.update(t); s.st.update(t); camMove(s.stage, t, [[0, { pos: [3.6, 2.4, 7.4], look: [0, 1.5, 0], fov: 40 }], [info.dur, { pos: [2.4, 2.1, 6.0], look: [0, 1.6, 0], fov: 40 }]]); } };
const C127 = { type: 'counter', title: 'LONGEST SURVIVAL ON VENUS', value: 127, suffix: ' MIN', lines: ['Venera 13 lander, 1982'], color: '#ffd25a' };
registerShot('s12', { kind: '3d', init: lander.init, draw: lander.draw,
  overlay(g, t, info, s) { const n = at(info, '127', 2.4); sunnyLook(g, t, HAZE); shimmer(g, t, 0.14); tag(g, 'THE TOUGHEST PROBE', ease.out(prog(t, 0.1, 0.4)), 0.13);
    reactions(g, t, s, [{ fx: 'sweat', on: 'p', at: 1.0 }]); if (t > n - 0.05) { dimScene(g, 9 * prog(t, n - 0.05, n + 0.2), 0.6 * prog(t, n - 0.05, n + 0.2)); drawInsert(g, C127, t - n + 0.05); } } });

// s13 "Subscribe for more." the beam drops the HERO back onto Venus: ends on the frame-1 framing (loop)
registerShot('s13', { kind: '3d', init: (T) => plain.init(T),
  draw(s, t, info) { const d = ease.out(prog(t, 0, 0.8)), b = 1 - ease.in(prog(t, 0.8, 1.3)); plain.draw(s, t, info, { crush: 0.5 * prog(t, 0.9, 1.4), steam: t > 0.9, beam: b, lift: (1 - d) * 4, face: t < 0.9 ? EXPR.happy : EXPR.worried,
    keys: [[0, { pos: [0.8, 2.3, 6.4], look: [0, 2.0, 1], fov: 40 }], [info.dur, { pos: [0.9, 2.3, 6.6], look: [0, 1.6, 1], fov: 40 }]] }); },
  overlay(g, t, info, s) { sunnyLook(g, t, HAZE); shimmer(g, t); reactions(g, t, s, [{ fx: 'exclaim', on: 'h', at: 1.2 }]); } });
