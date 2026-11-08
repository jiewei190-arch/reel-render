// coast.js — s008 "Neither do the oceans." and s014 "to bedrock flies east." (cutaway: only the bedrock stays).
import { registerShot, ease, prog, clamp, lerp, E, text } from '/engine/core.js';
import { EXPR, addPose, idle } from '/kits/toon3d/rig.js';
import { cat } from '/kits/toon3d/cast.js';
import { toonStage, camMove, drift } from '/kits/toon3d/toon.js';
import { THREE, at, tag, speedLines, coast, cutaway, house, tree, car, bench, coffee, heroWithCoffee, flyPose, rng, HOLDCUP } from './_lib.js';

// s008 — the sea keeps going east: a toon wave sweeps right along the sea wall, spray over the rail. BISCUIT the cat on the wall: unimpressed.
registerShot('s008', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'day', fov: 40, shadowSize: 12, target: [0, 0, -4], bg: ['#6fb0ea', '#a9d2f2', '#e6f2f8'] }); const set = coast(st);
    const biscuit = cat({ scale: 1.0 }); biscuit.position.set(2.9, 1.6, -0.75); st.add(biscuit);
    const r = rng(4); const sprayM = new THREE.MeshToonMaterial({ color: '#ffffff', emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.3 });
    const spray = [...Array(30)].map(() => { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), sprayM); m.userData = { dx: r() * 3, vy: 2 + r() * 4, s: 0.15 + r() * 0.3, dz: r() * 1.5, d: r() * 0.4 }; st.add(m); return m; });
    return { stage: st, set, biscuit, spray }; },
  draw(s, t, info) { const o = at(info, 'oceans', 0.5); const wx = lerp(-11, 9, prog(t, 0, info.dur)); s.set.wave.position.set(wx, 0.4, -11.6); s.set.wave.scale.set(1.7, 1.7, 1); s.set.update(t, 0);
    s.spray.forEach(m => { const u = m.userData; const L = ((t * 1.3 + u.d) % 0.9); m.position.set(wx + 1.5 - u.dx - L * 3, 2.0 + u.vy * L - 6 * L * L, -1.5 + u.dz); m.scale.setScalar(u.s * (1 - L)); m.visible = Math.abs(wx) < 26; });
    const near = clamp(1 - Math.abs(wx - 2.9) / 6); s.biscuit.update(t, { lid: lerp(0.62, 0.75, near), look: [-0.2, 0.1], earsBack: near * 0.6, tail: 0.4, headTurn: 0.25 });
    const d = drift(t, 0.05, 5); camMove(s.stage, t, [[0, { pos: [1.2 + d[0], 3.3 + d[1], 8.6], look: [0.6, 2.9, -6], fov: 44 }], [info.dur, { pos: [1.8, 3.2, 7.6], look: [1.5, 2.9, -6], fov: 42 }]]); },
  overlay(g, t, info) { const o = at(info, 'oceans', 0.5); tag(g, 'THE OCEANS TOO', prog(t, o, o + 0.25), 0.12); },
});
// s014 — cutaway of the ground: house, tree, car, bench and the hero slide off east; the BEDROCK layer stays (and is labelled)
registerShot('s014', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'day', fov: 38, shadowSize: 11, target: [0, 0, 0], bg: ['#6fb0ea', '#a9d2f2', '#e6f2f8'] }); const cut = cutaway(st);
    const items = [[house({ c: '#9fc4d8' }), -5.2, -1.2], [tree({ seed: 3, h: 2.6 }), -1.8, -1.5], [car({ c: '#d84a3a' }), 1.6, 1.0], [bench(), 4.8, -1.0], [heroWithCoffee(), 0, 1.6]].map(([o, x, z], i) => { o.position.set(x, 0, z); st.add(o); return { o, x, z, i }; });
    return { stage: st, cut, items }; },
  draw(s, t, info) { const f = at(info, 'flies', 0.4);
    s.items.forEach(({ o, x, z, i }) => { const L = Math.max(0, t - f + 0.25 - i * 0.04); o.position.set(x + L * L * 2.6 + L * 1.0, Math.min(L * 3, 2.5) + Math.sin(i + t * 3) * 0.05 * (L > 0), z); o.rotation.z = -L * (0.6 + i * 0.1); if (o.face) { o.pose(L > 0 ? flyPose(t) : addPose(HOLDCUP, idle(t, 3))); o.face(L > 0 ? EXPR.panic : EXPR.worried, t); } });
    const sh = Math.sin(t * 50) * 0.02 * (t < f); s.stage.cam([-3 + sh, 4.5, 24], [0.8, -0.8, 0], 40); },
  overlay(g, t, info) { const b = at(info, 'bedrock', 0.1), f = at(info, 'flies', 0.4); tag(g, 'ONLY BEDROCK STAYS', prog(t, b, b + 0.25), 0.12); speedLines(g, t, prog(t, f, f + 0.3) * 0.7, { dir: 1, n: 12, y0: E.H * 0.25, y1: E.H * 0.5 }); },
});
