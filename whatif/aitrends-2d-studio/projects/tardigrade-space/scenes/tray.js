// Out on the satellite: sunbathers (s04), DAY 1 > DAY 10 (s05), radiation meter (s06) + 1,000x insert (s07)
import { registerShot, ease, prog, clamp, lerp, E } from '/engine/core.js';
import { camMove, THREE, rbox, box, outline, toon } from '/kits/toon3d/toon.js';
import { reactions, shakeCam, anchor } from '/kits/toon3d/react.js';
import { insertShot, T as TXT } from '/kits/toon3d/insert.js';
import { at, tardigrade, earth, spaceStage, trayPanel, meter, chip, crack, alarmTint , fxr } from './_lib.js';

// the magnified experiment tray in orbit (Earth glowing behind)
function trayScene(T, o = {}) { const s = spaceStage(T, { fov: 36, seed: o.seed || 5 }); s.e = earth(40); s.e.position.set(-6, -46, -22); s.stage.add(s.e);
  s.tray = trayPanel(); s.stage.add(s.tray); return s; }
const lounge = (tg, t, i, o = {}) => { tg.rotation.x = -0.7; tg.position.y = 0.3; tg.update(t, { lid: 0.55, look: [0, 0.1], headTilt: Math.sin(t + i) * 0.05, ...o }); tg.legs.forEach(L => { if (L.pi === 0) L.sh.rotation.set(-0.3, 0, L.s * 2.6); }); };

// s04 "No oxygen." — sunbathers in tiny sunglasses
registerShot('s04', { kind: '3d',
  init(T) { const s = trayScene(T); s.tgs = [[-1.35, 0.5], [0, -0.3], [1.35, 0.6]].map(([x, z], i) => { const tg = tardigrade({ seed: 40 + i, glasses: true, scale: 0.95 }); tg.position.set(x, 0, z); tg.rotation.y = (i - 1) * 0.15; s.stage.add(tg); return tg; }); s.hero = s.tgs[1]; return s; },
  draw(s, t, info) { s.stars.update(t); s.e.rotation.y = t * 0.03; s.tgs.forEach((tg, i) => lounge(tg, t, i));
    camMove(s.stage, t, [[0, { pos: [0.4, 2.9, 8.2], look: [0, 0.55, 0], fov: 38 }], [info.dur, { pos: [0.2, 2.6, 7.3], look: [0, 0.6, 0], fov: 38 }]]); },
  overlay(g, t, info, s) { fxr(g, t, s, [{ fx: 'sparkle', on: 'hero', at: 0.12, scale: 0.8, dy: 90 }, { fx: 'sparkle', on: s.tgs[2], at: 0.5, scale: 0.6, dy: 90, seed: 5 }]); },
});

// s05 "Just open space, for 10 straight days." — DAY counter flips; the hero's pose changes every flip (reading, pushups, waving, napping)
const NEWS = () => { const g = new THREE.Group(); const p = rbox(0.95, 0.65, 0.02, '#f4f0e4', 0, 0, 0, 0.01); g.add(p); for (let i = 0; i < 4; i++) { const l = box(0.75, 0.04, 0.005, '#6a6a6a', 0, 0.2 - i * 0.12, 0.015); l.userData.noOutline = true; g.add(l); } outline(g, { px: 2 }); return g; };
registerShot('s05', { kind: '3d',
  init(T) { const s = trayScene(T, { seed: 6 }); s.tg = tardigrade({ seed: 2, glasses: true }); s.stage.add(s.tg); s.news = NEWS(); s.news.position.set(0, 0.95, 0.75); s.news.rotation.x = -0.2; s.stage.add(s.news);
    s.pals = [[-2.1, -0.6], [2.2, -0.4]].map(([x, z], i) => { const p = tardigrade({ seed: 50 + i, glasses: true, scale: 0.8 }); p.position.set(x, 0, z); s.stage.add(p); return p; }); return s; },
  draw(s, t, info) { s.stars.update(t); s.e.rotation.y = t * 0.2; const t0 = 0.12, dt = 0.2; const day = clamp(Math.floor((t - t0) / dt) + 1, 1, 10), mode = day === 10 ? 2 : (day - 1) % 4;
    const tg = s.tg; tg.rotation.set(0, 0, 0); tg.position.set(0, 0, 0); s.news.visible = mode === 0;
    if (mode === 0) tg.update(t, { lid: 0.5, look: [0, -0.4] });
    if (mode === 1) { tg.rotation.x = 1.2; tg.position.y = 0.35 + Math.abs(Math.sin(t * 14)) * 0.12; tg.update(t, { lid: 0.1, look: [0, 0.6] }); tg.legs.forEach(L => { if (L.pi === 0) L.sh.rotation.set(-1.3, 0, L.s * 0.6); }); }
    if (mode === 2) tg.update(t, { wave: 1, lid: 0.2, look: [0, 0] });
    if (mode === 3) { tg.rotation.x = -1.05; tg.position.y = 0.42; tg.update(t, { lid: 1, blink: false }); }
    if (mode === 0) tg.legs.forEach(L => { if (L.pi === 0) L.sh.rotation.set(1.3, 0, L.s * 0.45); });
    s.pals.forEach((p, i) => lounge(p, t, i + 3));
    camMove(s.stage, t, [[0, { pos: [0, 2.7, 7.4], look: [0, 0.65, 0], fov: 38 }], [info.dur, { pos: [0, 2.5, 6.6], look: [0, 0.7, 0], fov: 38 }]]); },
  overlay(g, t, info, s) { const t0 = 0.12, dt = 0.2; const day = clamp(Math.floor((t - t0) / dt) + 1, 1, 10), age = t - (t0 + (day - 1) * dt);
    const k = day === 10 ? ease.outBack(clamp(age / 0.3)) * 1.12 : 1 + 0.12 * (1 - clamp(age / 0.15));
    TXT(g, 'IN OPEN SPACE', E.W / 2, E.H * 0.155, 58, { color: '#ffffff', stroke: '#2a1c15' });
    g.save(); g.translate(E.W / 2, E.H * 0.25); g.scale(k, k); g.rotate(-3 * Math.PI / 180); chip(g, `DAY ${day}`, 0, 0, 1, { size: 120, color: day === 10 ? '#ffd23a' : '#ffffff' }); g.restore();
    if ((day - 1) % 4 === 3) fxr(g, t, s, [{ fx: 'zzz', on: 'tg', at: t0 + (day - 1) * dt - 0.01, scale: 0.6, dx: 170, dy: 140 }]);
    if (day === 10) fxr(g, t, s, [{ fx: 'sparkle', on: 'tg', at: t0 + 9 * dt, scale: 0.9 }]); },
});

// s06 "The radiation out there" — the meter slams past MAX, the glass cracks, the alarm spins; the sunbather couldn't care less
const meterScene = {
  init(T) { const s = spaceStage(T, { fov: 36, seed: 8 }); s.e = earth(40); s.e.position.set(8, -44, -30); s.stage.add(s.e);
    s.panel = rbox(4.2, 4.8, 0.3, '#8a94a2', 0, 1.6, -0.35, 0.12); outline(s.panel, { px: 2.4 }); s.stage.add(s.panel);
    for (const [x, y] of [[-1.8, 3.7], [1.8, 3.7], [-1.8, -0.5], [1.8, -0.5]]) { const r = rbox(0.14, 0.14, 0.06, '#5a6470', x, y, -0.18, 0.06); s.stage.add(r); }
    s.m = meter(); s.m.position.set(0, 2.0, 0); s.stage.add(s.m);
    s.tg = tardigrade({ seed: 2, glasses: true, scale: 0.55 }); s.tg.blob.visible = false; s.tg.position.set(1.0, 0.15, 0.6); s.tg.rotation.y = -0.3; s.stage.add(s.tg); return s; },
  draw(s, t) { s.stars.update(t); const hit = 1.35; const up = ease.in(prog(t, 0.25, hit)); const needle = t < hit ? lerp(0.15, 1.0, up) + Math.sin(t * 40) * 0.02 * up : 1.1 + Math.sin(t * 50) * 0.04;
    s.m.set(needle, t > hit + 0.05 ? 1 : 0, t);
    s.tg.update(t, { lid: 0.55, float: 1, look: [-0.2, 0.2], headTilt: 0.1 }); s.tg.legs.forEach(L => { if (L.pi === 0 && L.s > 0) L.sh.rotation.set(1.2, 0, 0.5); });
    camMove(s.stage, t, [[0, { pos: [0.3, 1.9, 6.4], look: [0.2, 1.6, 0], fov: 36 }], [2.2, { pos: [0.15, 1.85, 5.4], look: [0.15, 1.65, 0], fov: 36 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: hit, amp: 0.1, dur: 0.6 }]); },
};
registerShot('s06', { kind: '3d', init: meterScene.init, draw: meterScene.draw,
  overlay(g, t, info, s) { const hit = 1.35; const c = anchor(s.stage, [0, 2.0, 0.3]);
    crack(g, c.x + 40, c.y - 30, c.s * 1.0, ease.out(prog(t, hit, hit + 0.12)));
    alarmTint(g, t, t > hit + 0.05 ? 1 : 0);
    fxr(g, t, s, [{ fx: 'flash', at: hit, dur: 0.2 }, { fx: 'exclaim', on: [0, 3.9, 0], at: hit + 0.05, scale: 1.1 }, { fx: 'sparkle', on: 'tg', at: hit + 0.45, scale: 0.7 }]); },
});
// s07 "is 1000x stronger than on Earth." — INSERT counter over the alarm (still flashing, blurred)
insertShot('s07', { scene: { init: meterScene.init, draw: (s, t) => meterScene.draw(s, t + 1.9), overlay: (g, t) => alarmTint(g, t + 1.9, 1) },
  insert: { type: 'counter', title: 'SOLAR RADIATION OUT THERE', from: 1, value: 1000, suffix: 'x', lines: ["vs. Earth's surface"], color: '#ff5a4a' } });
