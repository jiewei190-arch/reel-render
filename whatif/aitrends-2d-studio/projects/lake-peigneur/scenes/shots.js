// lake-peigneur: "Lake Peigneur Disaster: The Drill Hole That Swallowed a Lake" (Toon 3D + BEANMEN FX, 9:16).
// TONE GUARD: every person got out alive. Nobody is shown hurt or trapped (crew + miners only run, wave and escape); the
// 3 dogs reported killed are never shown or joked about. No blame beyond "the drill punched into the mine".
import { registerShot, ease, clamp, lerp, E } from '/engine/core.js';
import { THREE, camMove, outline, rbox, box, cyl } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, idle, run } from '/kits/toon3d/rig.js';
import { reactions, shakeCam, anchor, project } from '/kits/toon3d/react.js';
import { dimScene, drawInsert, T, INK } from '/kits/toon3d/insert.js';
import { sunnyLook, softTint } from '/kits/toon3d/sky.js';
import { at, lake, section, crater, whirlpool, onFunnel, barge, tug, skiff, duck, oak, roughneck, miner, fisherman, SALT } from './_lib.js';
import { hookText, stamp, vignette } from './_ui.js';

const RAYS = { rays: { from: [-60, -80], strength: 0.75 }, tint: '#ffcf8a' };
const back = (x) => ease.outBack(clamp(x));

// place an object on the funnel: outer group turns to angle a (local +X = outward), inner leans inward by `lean`
function floater(obj) { const o = new THREE.Group(), i = new THREE.Group(); o.add(i); i.add(obj); o.obj = obj;
  o.put = (wp, r, a, lean = 0, sink = 0) => { const p = onFunnel(wp, r, a); o.position.set(p.x + wp.position.x, p.y + wp.position.y - sink, p.z + wp.position.z); o.rotation.set(0, -a, 0); i.rotation.set(0, 0, lean); };
  return o; }
// small rounded label chip (top of screen)
function chip(g, text, a = 1, o = {}) { if (a <= 0) return; const y = o.y ?? E.H * 0.1, size = o.size ?? 56; g.save(); g.globalAlpha = a; g.font = `900 ${size}px "Nunito"`; const w = Math.min(g.measureText(text).width, 900) + 70;
  g.beginPath(); g.roundRect(E.W / 2 - w / 2, y - size * 0.75, w, size * 1.5, size * 0.75); g.fillStyle = o.fill || 'rgba(255,250,240,.94)'; g.fill(); g.lineWidth = 7; g.strokeStyle = INK; g.stroke();
  T(g, text, E.W / 2, y + 2, size, { color: o.color || INK, maxW: 880 }); g.restore(); }
const fade = (t, dur, a = 0.25) => clamp(t / a) * clamp((dur - t) / a);

// ===================== the whirlpool set (s01/s02 hero, s08 rig, s09 barges, s10 land, s16 closer) =====================
function vortexSet(T3, o = {}) {
  const s = lake(T3, { rig: false, target: [0, 0, 0], shadowSize: 24, seed: 4 });
  s.wp = whirlpool(); s.group.add(s.wp); s.wp.set(o.R || 14, o.D || 8); s.water.setHole(o.R || 14);
  return s;
}
const spin = (s, t, R, D, sp = 1) => { s.wp.set(R, D); s.water.setHole(R); s.wp.update(t, sp); s.update(t); };

// ---------- s01 FRAME 1 + s16 CLOSER: the whirlpool, the rig tipping on its rim, barges circling (one continuous move) ----------
const hero = {
  init(T3) { const s = vortexSet(T3, { R: 15, D: 9 });
    s.rg = floater(PR_rig()); s.group.add(s.rg);
    s.bs = [0, 1, 2].map(i => { const f = floater(barge({ seed: i + 2, color: ['#8a4a2a', '#7a5a3a', '#9a5a2a'][i] })); f.obj.rotation.y = Math.PI / 2; s.group.add(f); return f; });
    return s; },
  draw(s, u) { const k = clamp((u + 1.4) / 5.4);
    spin(s, u + 10, 15, 9, 1.2);
    const ra = 0.9 + u * 0.32; s.rg.put(s.wp, lerp(11.5, 10.2, k), ra, 0.32 + Math.sin(u * 2.2) * 0.04, 0.2);
    s.bs.forEach((b, i) => b.put(s.wp, 13.5 - i * 1.6, 2.7 + i * 1.9 + u * (0.45 + i * 0.08), 0.18 + i * 0.05, 0.1));
    s.stage.cam([lerp(8, 6, ease.inOut(k)), lerp(30, 27, k), lerp(30, 26, ease.inOut(k))], [1.5, -3, 1], 50); },
};
function PR_rig() { const r = rigWithPipe(); return r; }
import { rig as rigBase } from './_lib.js';
function rigWithPipe() { const r = rigBase(); const p = cyl(0.14, 0.14, 6, '#8a8a92', 0, -2.2, 0, 8); p.userData.noOutline = true; r.add(p); r.pipe = p; return r; }

registerShot('s01', { kind: '3d', init: hero.init, draw(s, t) { hero.draw(s, t); },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: { from: [-60, -80], strength: 0.55 }, tint: '#ffcf8a' });
    reactions(g, t, s, [{ fx: 'exclaim', on: s.rg, at: 0.3, scale: 0.9 }, { fx: 'sweat', on: s.rg, at: 0.9 }]);
    hookText(g, t, ['A DRILLING MISTAKE', 'SWALLOWED AN ENTIRE LAKE']); },
});
registerShot('s16', { kind: '3d', init: hero.init, draw(s, t, info) { hero.draw(s, t - info.dur); },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: { from: [-60, -80], strength: 0.55 }, tint: '#ffcf8a' }); },
});

// ---------- s02 "swallowed an entire lake": punch-in, straight down the drain ----------
registerShot('s02', { kind: '3d', init: (T3) => vortexSet(T3, { R: 15, D: 9 }),
  draw(s, t, info) { spin(s, t + 13, 15, 9, 1.6);
    camMove(s.stage, t, [[0, { pos: [0, 30, 9], look: [0, -6, 0], fov: 48 }], [info.dur, { pos: [0, 18, 5], look: [0, -8, 0], fov: 40 }]], ease.in);
    s.stage.camera.rotateZ(t * 0.25); },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'shake', at: 0.05, amp: 0.05, dur: 0.3 }]); vignette(g, 0.5, '6,20,40'); },
});

// ---------- s03 calm before: the rig drilling on a sunny Lake Peigneur ----------
registerShot('s03', { kind: '3d',
  init(T3) { const s = lake(T3, { rig: false, target: [0, 0, 2], shadowSize: 14, seed: 6 }); s.rg = rigWithPipe(); s.group.add(s.rg);
    s.crew = roughneck(3); s.crew.scale.setScalar(0.62); s.crew.position.set(1.4, 0.84, 1.5); s.rg.body.add(s.crew); return s; },
  draw(s, t, info) { s.update(t); s.rg.pipe.rotation.y = t * 6; s.rg.position.y = Math.sin(t * 1.4) * 0.05;
    const wave = clamp((t - 0.6) / 0.3) * (Math.sin(t * 10) * 0.35); s.crew.pose(addPose(POSE.stand, { armR: [0.3, 2.6 + wave, 0], elbowR: 0.3, ...idle(t, 3) })); s.crew.face({ ...EXPR.happy }, t);
    camMove(s.stage, t, [[0, { pos: [10, 3.0, 17], look: [0, 4.5, 0], fov: 46 }], [info.dur, { pos: [7.5, 3.4, 14], look: [0, 5, 0], fov: 44 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'sparkle', on: s.crew, at: 0.5, scale: 0.9 }]);
    const a = fade(t, info.dur, 0.3); chip(g, 'LAKE PEIGNEUR, LOUISIANA', a, { y: E.H * 0.09, size: 54 }); chip(g, 'NOV 20, 1980', a, { y: E.H * 0.155, size: 46, fill: 'rgba(255,214,90,.95)' }); },
});

// ---------- s04-s06 cross-section: the salt mine below, the drill punches in, the lake drains ----------
const secInit = (T3) => { const s = section(T3); s.miners = [0, 1, 2].map(i => { const m = miner(i + 1); m.scale.setScalar(0.42); m.position.set(-3 + i * 2.2, s.mineY - 0.65, s.F + 0.25); s.group.add(m); return m; }); return s; };
const minersIdle = (s, t) => s.miners.forEach((m, i) => { m.pose(addPose(POSE.relaxed, idle(t, i + 2))); m.face(EXPR.neutral, t); });
registerShot('s04', { kind: '3d', init: secInit,
  draw(s, t, info) { s.update(t); s.setDrill(lerp(-1.5, -4.5, clamp(t / info.dur))); s.rig.body.children.forEach(() => {}); minersIdle(s, t);
    camMove(s.stage, t, [[0, { pos: [0, 3.5, 15], look: [0, 3, 0], fov: 44 }], [info.dur * 0.75, { pos: [0, -4.5, 26], look: [0, -5.5, 0], fov: 46 }], [info.dur, { pos: [0, -5, 26.5], look: [0, -5.8, 0], fov: 46 }]], ease.inOut); },
  overlay(g, t, info, s) { const a = clamp((t - info.dur * 0.55) / 0.25); if (a > 0) { const p = project(s.stage, [0, s.mineY + 1.6, s.F]); chip(g, 'SALT MINE', a, { y: p.y - 30, size: 58, fill: 'rgba(255,255,255,.95)' }); }
    reactions(g, t, s, [{ fx: 'sparkle', on: [0, s.mineY, s.F + 0.3], at: info.dur * 0.6, scale: 1.2 }]); },
});
registerShot('s05', { kind: '3d', init: secInit,
  draw(s, t, info) { s.update(t); const tp = at(info, 'punched', info.dur * 0.6); const ceil = s.mineY + 0.65;
    const y = t < tp ? lerp(-5, ceil + 0.15, ease.inOut(clamp(t / tp))) : lerp(ceil + 0.15, ceil - 0.45, ease.out(clamp((t - tp) / 0.25))); s.setDrill(y);
    s.miners.forEach((m, i) => { const sh = t > tp + 0.1; m.pose(sh ? addPose(POSE.panic, idle(t * 2, i)) : addPose(POSE.relaxed, idle(t, i + 2))); m.face(sh ? EXPR.shocked : EXPR.neutral, t); m.rotation.y = sh ? -0.5 + i * 0.5 : 0; });
    camMove(s.stage, t, [[0, { pos: [0, -4.5, 26], look: [0, -5.5, 0], fov: 46 }], [info.dur, { pos: [0.5, -6.5, 20], look: [0, -6.8, 0], fov: 44 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: tp, amp: 0.09, dur: 0.45 }]); },
  overlay(g, t, info, s) { const tp = at(info, 'punched', info.dur * 0.6);
    // depth dimension line: surface -> mine ceiling
    const p0 = project(s.stage, [-4.6, s.WD, s.F]), p1 = project(s.stage, [-4.6, s.mineY + 0.65, s.F]); const k = clamp(t / 0.6);
    g.save(); g.globalAlpha = k; g.lineWidth = 9; g.strokeStyle = INK; g.lineCap = 'round'; g.beginPath(); g.moveTo(p0.x, p0.y); g.lineTo(p0.x, lerp(p0.y, p1.y, k)); g.stroke(); g.lineWidth = 5; g.strokeStyle = '#ffd25a'; g.stroke();
    for (const p of [p0, p1]) { g.lineWidth = 9; g.strokeStyle = INK; g.beginPath(); g.moveTo(p.x - 30, p.y); g.lineTo(p.x + 30, p.y); g.stroke(); } g.restore();
    const lbl = Math.round(lerp(0, 1230, ease.out(clamp(t / Math.max(0.5, tp - 0.1))))); const b = back(t / 0.35);
    g.save(); g.translate(Math.max(p0.x + 210, 260), (p0.y + p1.y) / 2); g.scale(b, b); T(g, `~${lbl.toLocaleString('en-US')} FT`, 0, 0, 78, { color: '#ffd25a', stroke: INK }); T(g, 'DOWN', 0, 72, 46, { color: '#fff', stroke: INK }); g.restore();
    reactions(g, t, s, [{ fx: 'flash', at: tp, dur: 0.22 }, ...s.miners.map((m, i) => ({ fx: 'exclaim', on: m, at: tp + 0.1 + i * 0.06, scale: 0.9 }))]); },
});
registerShot('s06', { kind: '3d', init: secInit,
  draw(s, t, info) { s.update(t); s.setDrill(s.mineY + 0.2); const k = ease.inOut(clamp(t / (info.dur + 0.3))); s.drain(k);
    s.miners.forEach((m, i) => { const x = -3 + i * 2.2 + t * 3.2; m.position.x = Math.min(x, 7.6); m.rotation.y = Math.PI / 2; m.pose(run(t + i * 0.2)); m.face(EXPR.panic, t); m.visible = x < 7.4; });
    camMove(s.stage, t, [[0, { pos: [0.5, -3.5, 25], look: [0, -4.5, 0], fov: 46 }], [info.dur, { pos: [0, -3, 28], look: [0, -4, 0], fov: 46 }]]); },
  overlay(g, t, info, s) { reactions(g, t, s, s.miners.map((m, i) => ({ fx: 'sweat', on: m, at: 0.1 + i * 0.1, until: 1.4 + i * 0.15 }))); },
});

// ---------- s07 "like a bathtub": top-down, the lake spirals into a drain ----------
registerShot('s07', { kind: '3d', init: (T3) => { const s = vortexSet(T3, { R: 2, D: 2 }); s.rg = floater(rigWithPipe()); s.group.add(s.rg); return s; },
  draw(s, t, info) { const k = ease.out(clamp(t / info.dur)); const R = lerp(3, 12, k); spin(s, t, R, lerp(2, 7, k), 1.4);
    s.rg.put(s.wp, Math.min(R * 0.85, lerp(3.5, 9, k)), 0.6 + t * 0.6, 0.15 + k * 0.2, 0.1);
    camMove(s.stage, t, [[0, { pos: [0, 44, 4], look: [0, 0, 0], fov: 44 }], [info.dur, { pos: [0, 38, 3], look: [0, 0, 0], fov: 44 }]]); s.stage.camera.rotateZ(-t * 0.2); },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: false, tint: '#ffcf8a' }); reactions(g, t, s, [{ fx: 'question', on: s.rg, at: 0.2, until: info.dur - 0.1, scale: 1.1 }]); },
});

// ---------- s08 the rig goes down; the crew is already speeding away in a skiff ----------
registerShot('s08', { kind: '3d',
  init(T3) { const s = vortexSet(T3, { R: 14, D: 9 }); s.rg = floater(rigWithPipe()); s.group.add(s.rg);
    s.boat = skiff(); s.boat.scale.setScalar(1.3); s.group.add(s.boat); s.crew = [0, 1, 2].map(i => { const c = roughneck(i + 1, ['#2f6fb0', '#3a8a5a', '#2f6fb0'][i]); c.scale.setScalar(0.5); c.position.set(0, 0.4, -0.6 + i * 0.6); s.boat.add(c); return c; }); return s; },
  draw(s, t, info) { spin(s, t + 4, 14, 9, 1.3); const k = clamp(t / info.dur);
    s.rg.put(s.wp, lerp(9.5, 2.5, ease.in(k)), 1.2 + t * 0.9, lerp(0.3, 0.9, k), ease.in(k) * 7);
    s.boat.position.set(lerp(-8, -13, ease.out(k)), 0.05 + Math.sin(t * 8) * 0.05, lerp(12, 19, ease.out(k))); s.boat.rotation.y = -2.4;
    s.crew.forEach((c, i) => { c.pose(addPose(POSE.panic, idle(t * 3, i))); c.face(EXPR.shocked, t); c.rotation.y = Math.PI; });
    camMove(s.stage, t, [[0, { pos: [-13, 10, 35], look: [-4, -1, 6], fov: 48 }], [info.dur, { pos: [-14, 11, 37], look: [-5, -1, 8], fov: 48 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, [...s.crew.map((c, i) => ({ fx: 'sweat', on: c, at: 0.1 + i * 0.1 })), { fx: 'exclaim', on: s.rg, at: 0.15, scale: 1.1, until: info.dur * 0.7 }]); },
});

// ---------- s09 eleven barges + a tugboat, slurped one by one (counter chip) ----------
registerShot('s09', { kind: '3d',
  init(T3) { const s = vortexSet(T3, { R: 15, D: 10 });
    s.bs = Array.from({ length: 11 }, (_, i) => { const f = floater(barge({ seed: i + 1, color: ['#8a4a2a', '#7a5a3a', '#9a5a2a', '#6a4a3a'][i % 4], cargo: ['#6a6a72', '#7a6a52'][i % 2] })); f.obj.rotation.y = Math.PI / 2; s.group.add(f); return f; });
    s.tg = floater(tug()); s.tg.obj.rotation.y = Math.PI / 2; s.group.add(s.tg); return s; },
  draw(s, t, info) { spin(s, t + 7, 15, 10, 1.4); const tt = at(info, 'tugboat', info.dur * 0.7); const span = Math.max(0.8, tt - 0.2);
    s.gone = 0; const one = (f, t0, a0, sink0) => { const age = t - t0; const r = age < 0 ? 14.2 - sink0 : Math.max(0, 14.2 - sink0 - age * 16); f.put(s.wp, Math.max(r, 0.5), a0 + t * 0.7 + (age > 0 ? age * 2.5 : 0), age > 0 ? 0.25 + clamp(age) * 1.0 : 0.2, age > 0.75 ? (age - 0.75) * 30 : 0); f.visible = age < 1.1; return age > 0.8; };
    s.bs.forEach((b, i) => { if (one(b, 0.05 + (i / 11) * span, i * 0.57, (i % 3) * 0.7)) s.gone++; });
    s.tgGone = one(s.tg, tt + 0.1, 4.2, 0.4);
    camMove(s.stage, t, [[0, { pos: [5, 31, 27], look: [0, -3, 0], fov: 48 }], [info.dur, { pos: [3, 27, 23], look: [0, -4, 0], fov: 48 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: false, tint: '#ffcf8a' }); const tt = at(info, 'tugboat', info.dur * 0.7);
    const n = s.gone; const pop = n ? back(((t * 20) % 1) * 0 + 1) : 0;
    chip(g, `BARGES: ${n}`, clamp(t / 0.2), { y: E.H * 0.11, size: 74, fill: 'rgba(255,214,90,.96)' });
    if (t > tt) chip(g, '+ 1 TUGBOAT', clamp((t - tt) / 0.2), { y: E.H * 0.19, size: 58 });
    reactions(g, t, s, [{ fx: 'stars', on: [0, -6, 0], at: tt + 0.6, scale: 1.4 }]); },
});

// ---------- s10 ...and 65 acres of land: a wedge of shore with oaks slides into the drain (stamp) ----------
registerShot('s10', { kind: '3d',
  init(T3) { const s = vortexSet(T3, { R: 15, D: 10 });
    s.land = new THREE.Group(); const slab = rbox(9, 1.6, 6, '#7cb84e', 0, -0.2, 0, 0.3); const dirt = rbox(9, 2.2, 6, '#8a6a48', 0, -1.9, 0, 0.3); s.land.add(dirt, slab); outline(s.land, { px: 2.2 });
    [[-2.5, -1], [1, 1.2], [3, -1.4], [-0.5, -2]].forEach(([x, z], i) => { const o = oak({ s: 0.95, seed: i + 50 }); o.position.set(x, 0.6, z); s.land.add(o); });
    s.lf = floater(s.land); s.land.rotation.y = Math.PI / 2; s.group.add(s.lf); return s; },
  draw(s, t, info) { spin(s, t + 9, 15, 10, 1.3); const t0 = Math.max(0.1, at(info, '65', 0.4) - 0.2); const age = Math.max(0, t - t0);
    s.lf.put(s.wp, Math.max(1, 13.5 - age * age * 6), 0.4 + age * 0.9, Math.min(1.1, age * 0.9), age > 1.4 ? (age - 1.4) * 12 : 0);
    camMove(s.stage, t, [[0, { pos: [24, 13, 16], look: [6, -2, 1], fov: 46 }], [info.dur, { pos: [22, 15, 14], look: [3, -4, 0], fov: 46 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); const t65 = at(info, 'acres', 0.9);
    stamp(g, '65 ACRES', t - t65 + 0.1, { y: E.H * 0.24, size: 140, rot: -0.12, color: '#d8342c', sub: 'OF LAND, GONE' }); reactions(g, t, s, [{ fx: 'shake', at: t65, amp: 0.05, dur: 0.3 }]); },
});

// ---------- s11 "Then the canal reversed": the drained bed from above, flow arrows flip ----------
function arrowMesh() { const sh = new THREE.Shape(); sh.moveTo(-1.6, 0.5); sh.lineTo(0.4, 0.5); sh.lineTo(0.4, 1.2); sh.lineTo(1.8, 0); sh.lineTo(0.4, -1.2); sh.lineTo(0.4, -0.5); sh.lineTo(-1.6, -0.5); sh.closePath();
  const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshBasicMaterial({ color: '#ffffff' })); m.rotation.x = -Math.PI / 2; const g = new THREE.Group(); g.add(m); return g; }
registerShot('s11', { kind: '3d',
  init(T3) { const s = crater(T3); s.arrows = [36, 46, 56, 66].map(x => { const a = arrowMesh(); a.position.set(x, 0.6, 0); a.scale.setScalar(1.3); s.group.add(a); return a; }); return s; },
  draw(s, t, info) { const tr = at(info, 'reversed', info.dur * 0.5); const k = ease.outBack(clamp((t - tr) / 0.35));
    s.update(t * (t < tr ? -0.6 : 1)); s.arrows.forEach((a, i) => { a.rotation.y = Math.PI * k; a.position.x = [36, 46, 56, 66][i] + ((t < tr ? t : -(t - tr)) * 4 % 10); });
    camMove(s.stage, t, [[0, { pos: [20, 88, 44], look: [20, -6, 0], fov: 50 }], [info.dur, { pos: [18, 82, 40], look: [18, -6, 0], fov: 50 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: tr, amp: 0.06, dur: 0.3 }]); },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: false, tint: '#ffcf8a' }); const tr = at(info, 'reversed', info.dur * 0.5);
    const pg = project(s.stage, [88, 0, 0]); const pl = project(s.stage, [0, 0, 0]);
    T(g, 'TO THE GULF', Math.min(pg.x, E.W - 200), pg.y - 80, 52, { color: '#fff', stroke: INK }); T(g, 'THE LAKE', pl.x + 40, pl.y - 40, 52, { color: '#fff', stroke: INK });
    chip(g, t < tr ? 'DELCAMBRE CANAL' : 'CANAL: REVERSED!', 1, { y: E.H * 0.11, size: 62, fill: t < tr ? 'rgba(255,250,240,.94)' : 'rgba(255,214,90,.96)' });
    reactions(g, t, s, [{ fx: 'flash', at: tr, dur: 0.2 }, { fx: 'exclaim', on: [46, 2, 0], at: tr + 0.05, scale: 1.4 }]); },
});

// ---------- s12 the Gulf pours in: the waterfall into the empty lake bed, geysers from the mine; insert card on "tallest" ----------
registerShot('s12', { kind: '3d', init: (T3) => crater(T3),
  draw(s, t, info) { const tg = at(info, 'creating', 1.6); s.update(t, { geyser: ease.out(clamp((t - tg + 0.8) / 0.8)) });
    camMove(s.stage, t, [[0, { pos: [-6, -13, 20], look: [30, -6, -2], fov: 54 }], [info.dur, { pos: [2, -12.5, 15], look: [30, -5, -2], fov: 50 }]]); },
  overlay(g, t, info, s) { const ti = at(info, 'tallest', info.dur * 0.6) - 0.15; sunnyLook(g, t, RAYS);
    if (t < ti) { reactions(g, t, s, [{ fx: 'ripples', on: [24, -20, 0], at: 0.2, scale: 1.4 }]); return; }
    dimScene(g, 8, 0.45); drawInsert(g, { type: 'bigtext', kicker: "LOUISIANA'S TALLEST WATERFALL", title: '164 FT', lines: ['(for a few days)'], color: '#5ec8ff' }, t - ti); },
});

// ---------- s13 days later: nine barges pop back up like bath toys (+ a rubber duck) ----------
registerShot('s13', { kind: '3d',
  init(T3) { const s = lake(T3, { rig: false, target: [0, 0, 0], shadowSize: 18, seed: 8, waterColor: SALT });
    s.bs = Array.from({ length: 9 }, (_, i) => { const b = barge({ seed: i + 30, color: ['#8a4a2a', '#7a5a3a', '#9a5a2a'][i % 3] }); const a = (i / 9) * 6.28 + 0.4, r = 6 + (i % 3) * 3.2; b.position.set(Math.cos(a) * r, 0, Math.sin(a) * r - 2); b.rotation.y = a * 1.7; s.group.add(b); return b; });
    s.dk = duck(); s.dk.position.set(1.5, 0, 9.5); s.dk.scale.setScalar(1.3); s.group.add(s.dk); return s; },
  draw(s, t, info) { s.update(t); const tu = at(info, 'popped', 0.9) - 0.15; const tb = at(info, 'bath', info.dur * 0.75) - 0.1;
    s.bs.forEach((b, i) => { const a = t - tu - i * 0.09; const y = a < 0 ? -4 : (a < 0.25 ? lerp(-4, 1.3, a / 0.25) : 0.15 + Math.sin(a * 9) * Math.exp(-a * 2.6) * 1.1); b.position.y = y; b.rotation.z = a > 0 ? Math.sin(a * 7 + i) * 0.15 * Math.exp(-a) : 0; });
    const da = t - tb; s.dk.position.y = da < 0 ? -4 : (da < 0.22 ? lerp(-4, 1, da / 0.22) : Math.sin(da * 8) * Math.exp(-da * 2.5) * 0.6); s.dk.rotation.y = -0.5 + Math.sin(t * 2) * 0.2;
    camMove(s.stage, t, [[0, { pos: [0, 9, 26], look: [0, 0.5, 0], fov: 44 }], [info.dur, { pos: [0, 8, 23], look: [0, 0.8, 1], fov: 44 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); const tu = at(info, 'popped', 0.9) - 0.15, tb = at(info, 'bath', info.dur * 0.75) - 0.1;
    chip(g, 'DAYS LATER', fade(t, info.dur + 1, 0.25), { y: E.H * 0.1, size: 54 });
    reactions(g, t, s, [{ fx: 'question', on: s.bs[4], at: tu + 0.3, until: tb, scale: 1.0 }, { fx: 'sparkle', on: s.dk, at: tb + 0.15, scale: 1.2 }, { fx: 'hearts', on: s.dk, at: tb + 0.3, scale: 0.9 }]);
    if (t > tu) { const n = Math.min(9, Math.floor((t - tu) / 0.09) + 1); chip(g, `${n} OF 11 BACK`, 1, { y: E.H * 0.17, size: 50, fill: 'rgba(255,214,90,.96)' }); } },
});

// ---------- s14 every person got out alive: miners, rig crew and the fisherman safe on the shore ----------
registerShot('s14', { kind: '3d',
  init(T3) { const s = lake(T3, { rig: false, target: [0, 0.6, 36], shadowSize: 10, seed: 12, clearFront: true });
    const ppl = [miner(1), roughneck(2), fisherman(), miner(3), roughneck(5, '#3a8a5a')]; ppl.forEach((p, i) => { p.position.set(-2.6 + i * 1.3, 0.6, 37 - (i % 2) * 1.0); p.rotation.y = 0; s.group.add(p); }); s.ppl = ppl; return s; },
  draw(s, t, info) { s.update(t); s.ppl.forEach((p, i) => { const up = clamp((t - 0.25 - i * 0.08) / 0.3); p.pose(mixPose(addPose(POSE.relaxed, idle(t, i)), addPose(POSE.armsUp || POSE.panic, { bob: Math.abs(Math.sin(t * 6 + i)) * 0.15 }), up)); p.face(up > 0.5 ? EXPR.grin : EXPR.happy, t); });
    camMove(s.stage, t, [[0, { pos: [0, 3.4, 53.5], look: [0, 2.0, 36], fov: 46 }], [info.dur, { pos: [0, 3.3, 52.5], look: [0, 2.0, 36], fov: 46 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, [...s.ppl.map((p, i) => ({ fx: 'sparkle', on: p, at: 0.3 + i * 0.08, scale: 0.8 }))]);
    stamp(g, 'NO ONE DIED', t - 0.45, { y: E.H * 0.2, size: 110, rot: -0.08, color: '#2fa84f' }); },
});

// ---------- s15 the lake today: depth card flips 10 FT FRESHWATER -> 200 FT SALT WATER ----------
function depthCard(g, t, flipAt) { const cx = E.W / 2, cy = E.H * 0.42; const b = back(t / 0.3); const f = clamp((t - flipAt) / 0.3); const sy = Math.abs(Math.cos(f * Math.PI)); const after = f >= 0.5;
  g.save(); g.translate(cx, cy); g.scale(b, b * Math.max(0.02, sy)); const w = 820, h = 640;
  g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, 40); g.fillStyle = after ? '#1f6f78' : '#3f9bd6'; g.fill(); g.lineWidth = 12; g.strokeStyle = INK; g.stroke();
  // little depth ruler with a water fill
  g.beginPath(); g.roundRect(-w / 2 + 60, -h / 2 + 70, 90, h - 140, 20); g.fillStyle = '#fbf6ea'; g.fill(); g.lineWidth = 7; g.stroke();
  const fill = after ? 1 : 0.05; g.fillStyle = after ? '#2fbfbf' : '#7ad0ff'; g.fillRect(-w / 2 + 64, -h / 2 + 74, 82, (h - 148) * fill);
  T(g, 'LAKE DEPTH', 60, -h / 2 + 95, 54, { color: '#fff', stroke: INK }); T(g, after ? '200 FT' : '10 FT', 60, -10, 190, { color: '#ffd25a', stroke: INK, maxW: 560 }); T(g, after ? 'SALT WATER' : 'FRESHWATER', 60, 150, 76, { color: '#fff', stroke: INK, maxW: 560 });
  g.restore(); }
registerShot('s15', { kind: '3d', init: (T3) => lake(T3, { rig: false, target: [0, 0, 0], seed: 14, waterColor: SALT }),
  draw(s, t, info) { s.update(t); camMove(s.stage, t, [[0, { pos: [-6, 12, 30], look: [0, 0, 0], fov: 44 }], [info.dur, { pos: [-4, 11, 27], look: [0, 0, 0], fov: 44 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: false, tint: '#ffcf8a' }); dimScene(g, 7, 0.35); const fl = at(info, '200', info.dur * 0.6) - 0.2; depthCard(g, t, fl);
    reactions(g, t, s, [{ fx: 'shake', at: fl + 0.15, amp: 0.04, dur: 0.25 }]); },
});
