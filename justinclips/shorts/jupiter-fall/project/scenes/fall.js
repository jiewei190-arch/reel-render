// What If You Fell Into Jupiter: all shots. Hero always at the origin; the world streams UP past him (= falling).
import { registerShot, E, ease, prog, clamp, lerp, text, FONTS } from '/engine/core.js';
import { camMove, toon, flat, canvasTex } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, tremble } from '/kits/toon3d/rig.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { insertShot } from '/kits/toon3d/insert.js';
import { glow } from '/kits/toon3d/fx.js';
import { THREE, at, jupStage, hero, fallPose, probe, beam, streaks } from './_lib.js';

const wrapMod = (x, m) => ((x % m) + m) % m;
function setFall(J, t, speed, wallSpeed) { J.fall(t, speed, wallSpeed); J.puffs.forEach(p => { p.position.y = wrapMod(p.userData.y0 + t * speed, 60) - 30; }); }
const proj = (st, obj) => { const v = new THREE.Vector3(); obj.getWorldPosition(v); v.project(st.camera); return { x: (v.x + 1) / 2 * E.W, y: (1 - v.y) / 2 * E.H }; };

// ---------- s01 + s16: the free-fall (frame 1; s16 replays it at u = t - dur so the last frame == frame 1) ----------
function freeInit(T) { const J = jupStage(T, { zone: 0, spot: true, seed: 3, puffs: 30, fov: 42 }); J.puffs.forEach(p => { p.userData.z = Math.min(p.userData.z, -5) - 1; p.userData.x *= 1.3; }); const h = hero(); J.stage.add(h); return { J, stage: J.stage, h }; }
function freeDraw(s, u) {
  setFall(s.J, u + 5, 11, 0.008);
  s.h.rotation.set(0.35 + Math.sin(u * 1.3) * 0.06, Math.sin(u * 0.8) * 0.25, Math.sin(u * 1.1) * 0.12);
  s.h.pose(fallPose(u + 5)); s.h.face({ ...EXPR.shocked, lid: 0, brow: 1, mouth: 'open', pupil: [0, -0.25] }, u + 5);
  const sh = Math.sin((u + 5) * 23) * 0.025;
  s.stage.cam([0.4 + sh, 3.6 + sh, 6.4 - u * 0.25], [0, 1.6, 0], 42);
}
registerShot('s01', { kind: '3d', init: freeInit, draw(s, t) { freeDraw(s, t); }, overlay(g, t) { streaks(g, t + 5, 1, 1); } });
registerShot('s16', { kind: '3d', init: freeInit, draw(s, t, info) { freeDraw(s, t - info.dur); }, overlay(g, t, info) { streaks(g, t - info.dur + 5, 1, 1); } });

// ---------- s02 "You never land." looking straight DOWN past the hero: endless haze, clouds rushing at us ----------
registerShot('s02', { kind: '3d',
  init(T) { const J = jupStage(T, { zone: 0, seed: 5, puffs: 34, fov: 50, fogNear: 6, fogFar: 46 }); const h = hero(); J.stage.add(h);
    // the puffs for this shot live BELOW the hero and rise past the camera
    J.puffs.forEach((p, i) => { p.userData.x = (i % 2 ? 1 : -1) * (1.5 + (i * 0.37 % 1) * 9); p.userData.z = -6 + (i * 0.61 % 1) * 12; }); return { J, stage: J.stage, h }; },
  draw(s, t) { setFall(s.J, t, 14, 0.03); s.J.puffs.forEach(p => { p.position.y = -wrapMod(-p.userData.y0 - t * 14, 60) + 2; });
    s.h.rotation.set(-0.2, t * 0.4, 0); s.h.pose(fallPose(t)); s.h.face({ ...EXPR.shocked, pupil: [0, -0.6] }, t);
    s.stage.cam([0.01, 7.5 - t * 0.6, 0.6], [0, -30, 0], 50); },
  overlay(g, t) { streaks(g, t, 0.8, 4); },
});

// ---------- s03 "No ground." side view at the feet: legs pedal looking for a floor ----------
registerShot('s03', { kind: '3d',
  init(T) { const J = jupStage(T, { zone: 0, seed: 7, puffs: 28 }); const h = hero(); J.stage.add(h); return { J, stage: J.stage, h }; },
  draw(s, t) { setFall(s.J, t + 2, 10, 0.03); const pd = Math.sin(t * 14);
    s.h.rotation.set(0.05, 0.5, 0); s.h.pose(addPose(fallPose(t, 0.7), { legL: [0.6 * pd, 0], legR: [-0.6 * pd, 0], kneeL: 0.6 + 0.4 * pd, kneeR: 0.6 - 0.4 * pd, headNod: 0.35 }));
    s.h.face({ ...EXPR.worried, pupil: [0, -0.9] }, t);
    camMove(s.stage, t, [[0, { pos: [2.2, 0.9, 5.2], look: [0, 0.9, 0], fov: 36 }], [1.3, { pos: [2.0, 1.2, 4.6], look: [0, 1.1, 0], fov: 34 }]]); },
  overlay(g, t) { streaks(g, t + 2, 0.7, 6); },
});

// ---------- s04 "Just clouds," the hero punches through a cloud deck ----------
registerShot('s04', { kind: '3d',
  init(T) { const J = jupStage(T, { zone: 0, seed: 9, puffs: 20 }); const h = hero(); J.stage.add(h);
    const deck = new THREE.Group(); for (let i = 0; i < 46; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), toon(['#ffffff', '#f6ead2', '#efdcbc'][i % 3])); const a = i * 2.399, r = 1.2 + Math.sqrt(i) * 1.5; m.position.set(Math.cos(a) * r, (i % 3) * 0.3, Math.sin(a) * r - 2); m.scale.set(1.6, 0.9, 1.6); deck.add(m); } J.stage.add(deck);
    return { J, stage: J.stage, h, deck }; },
  draw(s, t) { setFall(s.J, t + 4, 10, 0.03); s.deck.position.y = -3.2 + t * 6.5;
    s.h.rotation.set(0.25, -0.2, 0.05); s.h.pose(fallPose(t)); s.h.face(mixExpr(EXPR.shocked, { ...EXPR.grin, lid: 0.1 }, prog(t, 0.4, 0.7)), t);
    s.stage.cam([0, 2.4, 7.8], [0, 1.1, 0], 40); },
  overlay(g, t) { streaks(g, t + 4, 0.9, 8); },
});

// ---------- s05 "then thicker gas," tan zone, fog closes in ----------
registerShot('s05', { kind: '3d',
  init(T) { const J = jupStage(T, { zone: 1, seed: 11, wallFog: true, puffs: 34, fogNear: 6, fogFar: 34 }); const h = hero(); J.stage.add(h); return { J, stage: J.stage, h }; },
  draw(s, t) { setFall(s.J, t, 9, 0.025); s.h.rotation.set(0.3, 0.35, -0.08); s.h.pose(fallPose(t)); s.h.face({ ...EXPR.suspicious, lid: 0.55, pupil: [0.4, -0.2] }, t);
    camMove(s.stage, t, [[0, { pos: [-1.4, 2.6, 6.2], look: [0, 1.5, 0], fov: 38 }], [1.2, { pos: [-1.0, 2.4, 5.4], look: [0, 1.5, 0], fov: 36 }]]); },
  overlay(g, t) { streaks(g, t, 0.6, 10, '255,230,200'); },
});

// ---------- s06 "then more gas." red-brown zone; the hero, arms crossed, deadpan ----------
registerShot('s06', { kind: '3d',
  init(T) { const J = jupStage(T, { zone: 2, seed: 13, wallFog: true, puffs: 34, fogNear: 5, fogFar: 30 }); const h = hero(); J.stage.add(h); return { J, stage: J.stage, h }; },
  draw(s, t) { setFall(s.J, t, 9, 0.025); s.h.rotation.set(0.1, 0, 0);
    s.h.pose(addPose(POSE.stand, { armL: [0.9, 0.3, 1.3], armR: [0.9, 0.3, 1.3], elbowL: 2.0, elbowR: 2.0, legL: [0.1, 0.1], legR: [-0.05, 0.1], kneeL: 0.3, headTilt: 0.1 }));
    s.h.face({ ...EXPR.deadpan, lid: 0.55, pupil: [0, 0] }, t);
    s.stage.cam([0, 2.3, 5.6 - t * 0.3], [0, 1.7, 0], 34); },
  overlay(g, t) { streaks(g, t, 0.5, 12, '255,200,170'); },
});

// ---------- s07 "The pressure keeps climbing." close-up, helmet squeezed, gauge into the red ----------
registerShot('s07', { kind: '3d',
  init(T) { const J = jupStage(T, { zone: 2, seed: 15, wallFog: true, puffs: 26, fogNear: 4, fogFar: 26 }); const h = hero(); J.stage.add(h); return { J, stage: J.stage, h }; },
  draw(s, t) { setFall(s.J, t + 3, 8, 0.02); const k = ease.in(prog(t, 0.1, 1.6));
    const sq = 1 - 0.07 * k + Math.sin(t * 30) * 0.008 * k; s.h.bubble.scale.set(1 + (1 - sq), sq, 1 + (1 - sq));
    s.h.rotation.set(0.05, 0, 0); s.h.pose(addPose(POSE.panic, tremble(t, 1 + 2 * k))); s.h.face(mixExpr(EXPR.worried, EXPR.panic, k), t);
    s.stage.cam([0, 2.0, 5.0 - k * 0.6], [0, 1.85, 0], 32); },
  overlay(g, t) { const k = ease.in(prog(t, 0.1, 1.6));
    const cx = E.W * 0.5, cy = E.H * 0.2, R = 150; g.save(); g.translate(cx, cy);
    g.fillStyle = '#f4ecdc'; g.strokeStyle = '#2a1c15'; g.lineWidth = 12; g.beginPath(); g.arc(0, 0, R, 0, Math.PI * 2); g.fill(); g.stroke();
    g.lineWidth = 26; g.strokeStyle = '#4ab060'; g.beginPath(); g.arc(0, 0, R - 34, Math.PI * 0.75, Math.PI * 1.45); g.stroke();
    g.strokeStyle = '#f0b030'; g.beginPath(); g.arc(0, 0, R - 34, Math.PI * 1.45, Math.PI * 1.85); g.stroke();
    g.strokeStyle = '#e03a2a'; g.beginPath(); g.arc(0, 0, R - 34, Math.PI * 1.85, Math.PI * 2.25); g.stroke();
    const a = Math.PI * 0.75 + (Math.PI * 1.5) * Math.min(1.02, k) + Math.sin(t * 40) * 0.03 * k; g.rotate(a); g.fillStyle = '#2a1c15'; g.beginPath(); g.moveTo(0, -10); g.lineTo(R - 30, 0); g.lineTo(0, 10); g.fill(); g.rotate(-a);
    g.beginPath(); g.arc(0, 0, 18, 0, Math.PI * 2); g.fill();
    text(g, 'PRESSURE', 0, R * 0.55, { size: 34, color: '#2a1c15', weight: 900, font: FONTS.ui }); g.restore();
    },
});

// ---------- s08 "NASA actually did this." the Galileo probe drifts down next to the hero; double take ----------
registerShot('s08', { kind: '3d',
  init(T) { const J = jupStage(T, { zone: 1, seed: 17, puffs: 26, fogNear: 10, fogFar: 50 }); const h = hero(); h.position.set(-1.1, 0, 0); J.stage.add(h); const p = probe(); p.scale.setScalar(0.85); J.stage.add(p); return { J, stage: J.stage, h, p }; },
  draw(s, t) { setFall(s.J, t, 8, 0.02); s.p.position.set(1.6, 4.5 - ease.out(prog(t, 0, 0.9)) * 4.2, -0.6); s.p.rotation.y = t * 0.6; s.p.setLamp(Math.floor(t * 3) % 2 === 0);
    const k = prog(t, 0.55, 0.75); s.h.rotation.set(0.15, 0.25 * k, 0); s.h.pose(addPose(fallPose(t, 0.8), { headTurn: 0.6 * k }));
    s.h.face(mixExpr({ ...EXPR.neutral, pupil: [0, -0.2] }, { ...EXPR.shocked, pupil: [0.8, 0.2] }, k), t);
    s.stage.cam([0.1, 2.2, 10.5], [0.1, 1.6, 0], 40); },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'exclaim', on: 'h', at: 0.7, until: 1.5 }]); },
});

// ---------- s10 (and the s09 insert behind "In 1995") wide: the probe on its parachute sinking into the bands ----------
const probeWide = {
  init(T) { const J = jupStage(T, { zone: 1, seed: 19, puffs: 22, fogNear: 14, fogFar: 70, spot: true }); const p = probe(); J.stage.add(p); return { J, stage: J.stage, p }; },
  draw(s, t) { setFall(s.J, t, 3, 0.012); s.p.position.set(0, -t * 0.4, 0); s.p.rotation.set(0, t * 0.3, Math.sin(t * 1.5) * 0.06); s.p.setLamp(Math.floor(t * 3) % 2 === 0);
    s.stage.cam([0, 2.6 - t * 0.4, 14 - t * 1.2], [0, 1.4 - t * 0.4, 0], 36); },
};
insertShot('s09', { scene: probeWide, insert: { type: 'bigtext', kicker: "NASA'S GALILEO PROBE", title: '1995', lines: ['it dropped into Jupiter'] } });
registerShot('s10', { kind: '3d', init: probeWide.init, draw(s, t) { probeWide.draw(s, t + 1.2); },
  overlay(g, t, info, s) { const p = proj(s.stage, s.p.lamp); g.save(); for (let i = 0; i < 3; i++) { const life = ((t + 1.2) * 0.9 + i / 3) % 1; g.strokeStyle = `rgba(255,240,200,${(1 - life) * 0.8})`; g.lineWidth = 6; g.beginPath(); g.arc(p.x, p.y, 30 + life * 260, -Math.PI * 0.85, -Math.PI * 0.15); g.stroke(); } g.restore(); } });

// ---------- s11 "It went silent after about an hour..." close on the probe: signal rings, then the light dies ----------
const probeClose = {
  init(T) { const J = jupStage(T, { zone: 2, seed: 21, wallFog: true, puffs: 26, fogNear: 6, fogFar: 34 }); const p = probe(); J.stage.add(p); return { J, stage: J.stage, p }; },
  draw(s, t, off = 0) { setFall(s.J, t, 4, 0.012); s.p.rotation.set(0, 0.6 + t * 0.15, Math.sin(t * 1.4) * 0.05); s.p.position.y = -t * 0.15; s.p.setLamp(s.lampOn ?? true);
    s.stage.cam([0.8, 3.4 - t * 0.15, 13 - t * 0.25], [0, 1.9 - t * 0.15, 0], 36); },
};
registerShot('s11', { kind: '3d', init: probeClose.init,
  draw(s, t, info) { const off = at(info, 'silent', 0.6) + 0.15; s.lampOn = t < off && Math.floor(t * 3) % 2 === 0; probeClose.draw(s, t); s.J.stage.exposure = lerp(1, 0.78, ease.inOut(prog(t, off, off + 0.6))); },
  overlay(g, t, info, s) { const off = at(info, 'silent', 0.6) + 0.15; const p = proj(s.stage, s.p.lamp);
    g.save(); for (let i = 0; i < 3; i++) { const life = (t * 0.9 + i / 3) % 1; if (t + 0 > off && life * 1.1 + (t - off) > 0.35) continue; g.strokeStyle = `rgba(255,240,200,${(1 - life) * 0.8})`; g.lineWidth = 7; g.beginPath(); g.arc(p.x, p.y, 30 + life * 300, -Math.PI * 0.85, -Math.PI * 0.15); g.stroke(); } g.restore();
    const k = prog(t, off, off + 0.2); if (k > 0) { g.save(); g.translate(E.W / 2, E.H * 0.22); const sc = 0.8 + 0.2 * ease.outBack(k); g.scale(sc, sc); g.globalAlpha = clamp(k * 1.5);
      g.font = `900 66px "${FONTS.ui}"`; const str = 'SIGNAL LOST'; const w = g.measureText(str).width + 80; g.fillStyle = 'rgba(20,10,10,.85)'; g.beginPath(); g.roundRect(-w / 2, -50, w, 100, 24); g.fill();
      text(g, str, 0, 4, { size: 66, color: '#ff5a4a', weight: 900, font: FONTS.ui }); g.restore(); }
    const k2 = prog(t, 0.1, 0.4); if (k2 > 0 && t < off + 0.4) { g.save(); g.globalAlpha = clamp(k2) * clamp(1 - (t - off) / 0.4); g.translate(E.W * 0.5, E.H * 0.36); g.fillStyle = 'rgba(20,10,10,.75)'; g.beginPath(); g.roundRect(-150, -46, 300, 92, 20); g.fill();
      const mm = Math.min(58, Math.floor(prog(t, 0.1, off) * 58)); text(g, `00:${String(mm).padStart(2, '0')}`, 0, 4, { size: 64, color: '#7fffa0', weight: 900, font: FONTS.ui }); g.restore(); } },
});
// ---------- s12 "about 150 kilometers down." depth counter over the dark, silent probe ----------
insertShot('s12', { scene: { init: probeClose.init, draw(s, t) { s.lampOn = false; probeClose.draw(s, t + 2.6); s.J.stage.exposure = 0.78; } },
  insert: { type: 'counter', title: 'DEPTH WHEN IT WENT SILENT', from: 0, value: 150, suffix: ' KM', lines: ['about 150 km down', 'still no ground'], color: '#ffd25a' } });

// ---------- s13 "And deep inside," camera dives past the hero into the glowing deep ----------
registerShot('s13', { kind: '3d',
  init(T) { const J = jupStage(T, { zone: 3, seed: 23, puffs: 30, fogNear: 6, fogFar: 40 }); const h = hero(); h.position.set(0.25, 0, 2.1); J.stage.add(h);
    const gl = glow(70, '#ffb04a', 0.9); gl.position.set(0, -34, -2); gl.material.fog = false; const gl2 = glow(26, '#fff0b0', 0.9); gl2.position.set(0, -30, -2); gl2.material.fog = false; gl2.userData.noOutline = true; J.stage.add(gl2); gl.userData.noOutline = true; J.stage.add(gl); return { J, stage: J.stage, h }; },
  draw(s, t) { setFall(s.J, t, 16, 0.04); const k = ease.inOut(prog(t, 0, 1.5));
    s.h.rotation.set(-0.3, t * 0.5, 0); s.h.pose(fallPose(t)); s.h.face({ ...EXPR.shocked, pupil: [0, -0.8] }, t);
    s.stage.cam([0.3, lerp(9, 5.5, k), lerp(3.5, 2.4, k)], [0, -34, -2], lerp(40, 54, k)); },
  overlay(g, t) { streaks(g, t, 1, 14, '255,170,120'); },
});

// ---------- s14 "the hydrogen acts like liquid metal." a rolling chrome ocean; the hero hovers, amazed, then the beam ----------
function metalSea() {
  const geo = new THREE.PlaneGeometry(120, 120, 90, 90); geo.rotateX(-Math.PI / 2);
  const env = canvasTex(8, 256, (g, W, H) => { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.35, '#c8d0dc'); gr.addColorStop(0.5, '#ff9a5a'); gr.addColorStop(0.7, '#6a7484'); gr.addColorStop(1, '#1a1e26'); g.fillStyle = gr; g.fillRect(0, 0, W, H); });
  env.mapping = THREE.EquirectangularReflectionMapping;
  const m = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ color: '#9aa6b8', specular: '#ffffff', shininess: 70, emissive: '#3a3440', envMap: env, reflectivity: 0.75, combine: THREE.MixOperation }));
  m.userData.noOutline = true; m.base = Float32Array.from(geo.attributes.position.array);
  m.wave = (t) => { const p = geo.attributes.position.array, b = m.base; for (let i = 0; i < p.length; i += 3) { const x = b[i], z = b[i + 2]; p[i + 1] = Math.sin(x * 0.35 + t * 1.6) * 0.35 + Math.sin(z * 0.28 - t * 1.2 + x * 0.1) * 0.45 + Math.sin((x + z) * 0.9 + t * 3) * 0.08; } geo.attributes.position.needsUpdate = true; geo.computeVertexNormals(); };
  return m;
}
function seaInit(T) { const J = jupStage(T, { zone: 3, seed: 25, puffs: 10, fogNear: 30, fogFar: 110 }); J.wall.visible = false;
  const sea = metalSea(); sea.position.y = -2.4; J.stage.add(sea); const h = hero(); J.stage.add(h);
  const gl = glow(30, '#ff9a4a', 0.5); gl.position.set(0, 2, -40); gl.userData.noOutline = true; J.stage.add(gl);
  const bm = beam(60, 1.5); bm.position.y = 30; J.stage.add(bm); J.stage.hemi.intensity = 1.4; const kl = new THREE.PointLight('#ffd0a0', 60, 40); kl.position.set(0, 6, 3); J.stage.add(kl);
  return { J, stage: J.stage, h, sea, bm }; }
const BEAM_FX = (b) => [{ fx: 'heartEyes', on: 'h', at: 0.55, until: b }, { fx: 'sparkle', on: 'h', at: 0.4, until: b + 0.3, color: '#dff6ff' }];
registerShot('s14', { kind: '3d', init: seaInit,
  draw(s, t, info) { const b = at(info, 'metal', 1.55) + 0.35; s.sea.wave(t); s.J.puffs.forEach(p => (p.visible = false));
    const lift = ease.in(prog(t, b, b + 0.8));
    s.h.position.set(0, -0.6 + Math.sin(t * 2) * 0.08 + lift * 3, 0); s.h.rotation.set(0.05, Math.sin(t * 0.7) * 0.15, 0);
    s.h.pose(mixPose(fallPose(t, 0.8), POSE.armsUp, prog(t, b, b + 0.3))); s.h.face(mixExpr({ ...EXPR.shocked, mouth: 'open', pupil: [0, -0.7] }, EXPR.grin, prog(t, b, b + 0.3)), t);
    s.bm.material.opacity = 0.75 * ease.out(prog(t, b - 0.1, b + 0.15)); s.bm.position.set(0, 30, 0);
    camMove(s.stage, t, [[0, { pos: [0, 1.6, 9.5], look: [0, 0.2, 0], fov: 44 }], [2.2, { pos: [0, 1.4, 7.6], look: [0, 0.6, 0], fov: 42 }]]); },
  overlay(g, t, info, s) { reactions(g, t, s, BEAM_FX(at(info, 'metal', 1.55) + 0.35)); },
});
// ---------- s15 beam-out: the hero zips up the beam and out of frame, flash ----------
registerShot('s15', { kind: '3d', init: seaInit,
  draw(s, t) { const T0 = 2.4 + t; s.sea.wave(T0); s.J.puffs.forEach(p => (p.visible = false)); const k = ease.in(prog(t, 0, 0.55));
    s.h.position.set(0, 2.2 + k * 14, 0); s.h.rotation.set(0, t * 6, 0); s.h.pose(POSE.armsUp); s.h.face(EXPR.grin, T0);
    s.bm.material.opacity = 0.8; s.bm.position.set(0, 30, 0);
    s.stage.cam([0, 1.4 + k * 6, 7.4], [0, 1.0 + k * 12, 0], 42); },
  overlay(g, t) { const k = prog(t, 0.35, 0.62); if (k > 0) { g.fillStyle = `rgba(235,252,255,${Math.sin(k * Math.PI) * 0.95})`; g.fillRect(0, 0, E.W, E.H); } },
});
