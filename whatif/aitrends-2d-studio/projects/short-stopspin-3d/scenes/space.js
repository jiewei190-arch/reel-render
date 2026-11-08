// space.js — s001 the hook (the hero on a tiny spinning Earth), s004 the globe stops, s010 the equator.
import { registerShot, ease, prog, clamp, lerp, E } from '/engine/core.js';
import { EXPR, idle, addPose, mixExpr, tremble } from '/kits/toon3d/rig.js';
import { toonStage, canvasTex, camMove, drift, flat, cyl, ball, outline } from '/kits/toon3d/toon.js';
import { THREE, at, screen, tag, slam, burst, speedLines, globe, tinyPlanet, heroWithCoffee, SIP, HOLDCUP, cloud, rng } from './_lib.js';

let _bg = null;
const spaceBg = () => (_bg ||= canvasTex(512, 1024, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0b1030'); gr.addColorStop(0.6, '#1d2560'); gr.addColorStop(1, '#3a3a7a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  const r = rng(21); for (let i = 0; i < 160; i++) { const s = r() < 0.1 ? 3.2 : 1.4 + r(); g.fillStyle = `rgba(255,${230 + r() * 25},${200 + r() * 55},${0.5 + r() * 0.5})`; g.beginPath(); g.arc(r() * w, r() * h, s, 0, 7); g.fill(); } }));
function spaceStage(T, o = {}) { const st = toonStage(T, { light: 'day', fov: 36, shadowSize: 7, key: ['#fff1dc', 2.8, [-8, 8, 10]], fill: ['#9fb0ff', 0.6, [8, 2, 6]], ambient: 1.0, ...o }); st.scene.background = spaceBg(); return st; }

// s001 "What if the Earth stopped spinning for one second?" — frame 1 already moving: the hero stands on top of a tiny Earth that
// rolls east under his feet (houses, trees, lamps pass by), sipping coffee. On "one second" an eyebrow goes up, eyes to the lens.
registerShot('s001', { kind: '3d',
  init(T) { const st = spaceStage(T, { target: [0, 0, 0] }); const pl = tinyPlanet({ r: 4 }); pl.position.y = -4; st.add(pl);
    const hero = heroWithCoffee(); st.add(hero); const sun = new THREE.Mesh(new THREE.SphereGeometry(2.2, 24, 16), flat('#fff1b0')); sun.position.set(-14, 9, -30); st.add(sun);
    return { stage: st, pl, hero }; },
  draw(s, t, info) { s.pl.spin.rotation.z = -0.25 - t * 0.55; const o = at(info, 'one', 1.6), k = ease.inOut(prog(t, o - 0.1, o + 0.3));
    const sip = Math.sin(Math.PI * prog(t, 0.1, 1.2)) ** 0.6;
    s.hero.pose(addPose(SIP(sip * (1 - k), HOLDCUP), { ...idle(t, 1), headTilt: -0.12 * k }));
    s.hero.face(mixExpr({ ...EXPR.happy, lid: 0.6, lower: 0.45, pupil: [0.4, 0.3] }, { ...EXPR.suspicious, browL: 0.6, browR: -0.1, pupil: [0, 0], lid: 0.42 }, k), t);
    camMove(s.stage, t, [[0, { pos: [-1.6, 3.0, 15.5], look: [0, 0.2, 0], fov: 42 }], [info.dur, { pos: [0.3, 2.6, 8.5], look: [0, 1.3, 0], fov: 38 }]], ease.sine); },
  overlay(g, t) { tag(g, 'WHAT IF...', prog(t, 0.0, 0.25) * (1 - prog(t, 2.3, 2.6)), 0.12); },
});
// s004 "Then it stops." — the globe spins fast with motion streaks, then FREEZES on "stops": white ring, shake, red STOPPED chip
registerShot('s004', { kind: '3d',
  init(T) { const st = spaceStage(T, { target: [0, 0, 0] }); const gl = globe({ r: 3 }); st.add(gl); return { stage: st, gl }; },
  draw(s, t, info) { const st0 = at(info, 'stops', 0.42); const tt = Math.min(t, st0); s.gl.spin.rotation.y = tt * 4.5 + tt * tt * 2;
    const sh = t > st0 ? Math.max(0, 1 - (t - st0) * 3) * 0.12 : 0; s.stage.cam([Math.sin(t * 75) * sh, 0.3 + Math.cos(t * 66) * sh, lerp(18.5, 17, prog(t, 0, info.dur))], [0, 0, 0], 38); },
  overlay(g, t, info) { const st0 = at(info, 'stops', 0.42); if (t < st0) speedLines(g, t, 0.45, { dir: 1, n: 10, y0: E.H * 0.38, y1: E.H * 0.62, color: 'rgba(255,255,255,.5)' });
    burst(g, E.W / 2, E.H * 0.5, prog(t, st0, st0 + 0.45)); tag(g, 'STOPPED', prog(t, st0, st0 + 0.2), 0.16, { bg: 'rgba(200,40,40,.92)', color: '#ffffff', size: 70 }); },
});
// s010 "At the equator, about sixteen hundred" — the globe turns slowly; the equator lights up gold on "equator", a pin, counter climbs
registerShot('s010', { kind: '3d',
  init(T) { const st = spaceStage(T, { target: [0, 0, 0] }); const gl = globe({ r: 3 }); st.add(gl);
    const pin = new THREE.Group(); pin.add(cyl(0.03, 0.03, 0.6, '#f2efe8', 0, 0.3, 0, 6), ball(0.14, '#d63a3a', 0, 0.62, 0)); outline(pin, { px: 2 }); pin.position.set(0, 0, 3.0); pin.rotation.x = Math.PI / 2; gl.spin.add(pin);
    return { stage: st, gl, pin }; },
  draw(s, t, info) { s.gl.spin.rotation.y = -0.9 + t * 0.35; const e = at(info, 'equator', 0.35); s.gl.eq.visible = t >= e; s.gl.eq.scale.setScalar(1 + Math.max(0, 1 - (t - e) * 4) * 0.08);
    s.pin.scale.setScalar(ease.outBack(prog(t, e + 0.1, e + 0.45)) + 0.001);
    camMove(s.stage, t, [[0, { pos: [0, 1.5, 18], look: [0, 0.2, 0], fov: 38 }], [info.dur, { pos: [0.8, 0.4, 12.5], look: [0, -0.3, 0], fov: 36 }]]); },
  overlay(g, t, info) { const e = at(info, 'equator', 0.35), s16 = at(info, 'sixteen', 0.95); tag(g, 'AT THE EQUATOR', prog(t, e, e + 0.25), 0.12);
    const k = ease.out(prog(t, s16 - 0.1, info.dur)); if (t > s16 - 0.1) slam(g, `${Math.round(k * 1600).toLocaleString('en-US')}`, E.W / 2, E.H * 0.24, 1, { size: 150, from: 1 }); },
});
