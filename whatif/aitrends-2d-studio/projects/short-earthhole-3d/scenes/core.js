// s008 (core vs Sun, thermometer) and s010 (weightless at the centre).
import { registerShot } from '/engine/core.js';
import { toonStage, camMove, drift, toon, ball, canvasTex } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, tremble } from '/kits/toon3d/rig.js';
import * as FX from '/kits/toon3d/fx.js';
import { THREE, at, chip, popK, screen, sweat, hero, thermometer, sun, FLOAT, ease, prog, clamp, lerp, rng } from './_lib.js';

// s008 "as the surface of the Sun." — the inner core (left) and the Sun (right), one thermometer between them, both maxed out.
// The HERO sits between them, sweating, looking from one to the other.
registerShot('s008', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'warm', fov: 40, shadow: false, bg: ['#1a0e1a', '#3a1626', '#6a2a22'] });
    const core = ball(0.7, '#ffe27a', -1.45, 4.3, -1.2, 36); core.material = toon('#ffe27a', { emissive: new THREE.Color('#ffb03a'), emissiveIntensity: 0.65, fresh: true }); st.add(core);
    const cg = FX.glow(3.4, '#ffb84a', 0.55); cg.position.copy(core.position); st.add(cg);
    const su = sun(0.62); su.position.set(1.45, 4.3, -1.2); st.add(su);
    const th = thermometer(); th.position.set(0, 3.2, -1.4); th.scale.setScalar(0.85); st.add(th);
    const h = hero({ hood: 'down' }); h.position.set(0, -0.2, 3.2); st.add(h);
    const em = FX.embers({ count: 30, area: [8, 7, 3], seed: 31 }); em.position.set(0, 0, -2); st.add(em);
    return { stage: st, core, su, th, hero: h, em }; },
  draw(s, t, info) { s.su.update(t); s.em.update(t); const k = ease.out(prog(t, at(info, 'surface', 0.3) - 0.1, at(info, 'Sun', 1.0) + 0.15)); s.th.set(0.35 + 0.6 * k);
    const look = Math.sin(t * 3.2) > 0 ? 1 : -1, sunT = at(info, 'Sun', 1.0);
    s.hero.pose(addPose(POSE.stand, { ...idle(t, 6), headTurn: t < sunT ? 0.55 * look : 0, headNod: t < sunT ? -0.3 : 0, armL: [0.2, 0.5, 0], armR: [0.2, 0.5, 0], elbowL: 0.5, elbowR: 0.5 }));
    s.hero.face(t < sunT ? { ...EXPR.worried, pupil: [look * 0.8, 0.6] } : { ...EXPR.shocked, pupil: [0, 0] }, t);
    s.core.scale.setScalar(1 + Math.sin(t * 5) * 0.02);
    camMove(s.stage, t, [[0, { pos: [0, 2.6, 11.4], look: [0, 2.7, 0], fov: 40 }], [info.dur, { pos: [0, 2.5, 10.6], look: [0, 2.6, 0], fov: 40 }]]); },
  overlay(g, t, info, s) { const [cx, cy] = screen(s.stage, new THREE.Vector3(-1.45, 5.4, -1.2)), [sx, sy] = screen(s.stage, new THREE.Vector3(1.45, 5.6, -1.2));
    chip(g, 'CORE', popK(t, 0.05), cy / 1920, { x: cx, size: 46, color: '#ffffff' }); chip(g, 'SUN', popK(t, at(info, 'Sun', 1.0) - 0.1), sy / 1920, { x: sx, size: 46, color: '#ffffff' });
    chip(g, '~5,400 °C', popK(t, at(info, 'Sun', 1.0)), 0.11, { size: 92 });
    const [hx, hy] = screen(s.stage, new THREE.Vector3(0, 2.1, 3.2)); sweat(g, hx, hy - 120, t, 1); },
});

// s010 "At the center, you're weightless," — a glowing gold chamber; he floats, slowly turning, delighted. Pebbles float with him.
function moltenTex(seed = 2) { return canvasTex(512, 256, (g, w, h) => { const r = rng(seed); g.fillStyle = '#ff9a2a'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 70; i++) { g.fillStyle = ['#ffd25a', '#ffb03a', '#ff7a1a', '#fff0b0'][i % 4]; g.globalAlpha = 0.55; g.beginPath(); g.ellipse(r() * w, r() * h, 20 + r() * 60, 8 + r() * 20, r() * 3, 0, 7); g.fill(); } }, { repeat: [2, 1] }); }
registerShot('s010', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'warm', fov: 44, shadow: false, bg: '#ffb84a' }); st.hemi.color.set('#fff2d0'); st.hemi.intensity = 1.5;
    const tex = moltenTex(); const ch = new THREE.Mesh(new THREE.SphereGeometry(9, 48, 32), toon('#ffffff', { map: tex, side: THREE.BackSide, emissive: new THREE.Color('#ff9a2a'), emissiveIntensity: 0.55 })); ch.userData.noOutline = true; st.add(ch);
    const gl = FX.glow(12, '#fff2b0', 0.55); gl.position.set(0, 0.5, -3); st.add(gl);
    const h = hero(); st.add(h);
    const r = rng(5); const peb = []; for (let i = 0; i < 9; i++) { const b = ball(0.08 + r() * 0.12, ['#8a6a4e', '#6e5a4a', '#c9a14a'][i % 3], (r() - 0.5) * 5, (r() - 0.5) * 4 + 0.5, (r() - 0.5) * 3, 10); b.userData.ph = r() * 9; st.add(b); peb.push(b); }
    const em = FX.embers({ count: 40, area: [9, 8, 6], seed: 41, color: '#fff2b0' }); em.position.y = -4; st.add(em);
    return { stage: st, ch, tex, hero: h, peb, em }; },
  draw(s, t, info) { s.tex.offset.x = t * 0.02; s.em.update(t * 0.4);
    const w0 = at(info, 'weightless', 0.9); const k = ease.inOut(prog(t, w0 - 0.2, w0 + 0.4));
    s.hero.position.set(0, -1.1 + Math.sin(t * 1.4) * 0.12, 0); s.hero.rotation.set(Math.sin(t * 0.9) * 0.15, -0.5 + t * 0.35, 0.25 * Math.sin(t * 0.7) + 0.15);
    s.hero.pose(mixPose(addPose(FLOAT(t), { headNod: -0.1 }), addPose(FLOAT(t), { armL: [0.3, 1.9, 0.3], armR: [0.3, 1.9, 0.3], headNod: -0.2 }), k));
    s.hero.face(mixExpr({ ...EXPR.shocked, pupil: [0.4, 0.2] }, { ...EXPR.grin, lid: 0.15 }, k), t);
    s.peb.forEach((b, i) => { b.position.y += Math.sin(t * 1.2 + b.userData.ph) * 0.002; b.rotation.set(t * 0.6 + i, t * 0.4, 0); });
    camMove(s.stage, t, [[0, { pos: [0.4, 1.0, 5.6], look: [0, 0.2, 0], fov: 46 }], [info.dur, { pos: [0.2, 0.7, 4.5], look: [0, 0.2, 0], fov: 46 }]], ease.sine); },
  overlay(g, t, info) { chip(g, '0 g', popK(t, at(info, 'weightless', 0.9) - 0.05), 0.15, { size: 130 }); chip(g, 'CENTER OF THE EARTH', popK(t, at(info, 'center', 0.2)), 0.25, { size: 40, color: '#ffffff' }); },
});
