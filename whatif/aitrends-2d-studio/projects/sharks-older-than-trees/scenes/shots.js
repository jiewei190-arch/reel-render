// "Sharks Are Older Than Trees. Seriously." — Toon 3D + BEANMEN effects. 9:16, 24 fps. Shot timing lives in story/shots.json.
import { registerShot, E, text, FONTS, ease, prog, clamp, lerp, noise } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { reactions, shakeCam, anchor } from '/kits/toon3d/react.js';
import { sunnyLook, softTint } from '/kits/toon3d/sky.js';
import { dimScene, T as CT, INK } from '/kits/toon3d/insert.js';
import { smoke as smokeFx, glow as glowFx } from '/kits/toon3d/fx.js';
import { THREE, at, shark, sapling, dino, asteroid, glasses, newspaper, briefcase, popcorn, cake, party, bunting, rock, moss, world, tick, tag, mesh, S, shadeC } from './_lib.js';

const RAYS = { rays: { from: [-60, -80], strength: 0.9 }, tint: '#ffcf8a' };
const PI = Math.PI;

// ---------- the beach (frame 1, the "sink in" gag, the ending + loop) ----------
function beach(T, o = {}) {
  const s = world(T, { fov: 40, target: [0, 0, 0], shadowSize: 8, sand: [2.3, 0.6, 2.0, 1.6], seed: 3 });
  s.sh = shark({ seed: 2 }); s.sh.position.set(-0.6, 0.4, 0.3); s.sh.rotation.y = 0.32; s.stage.add(s.sh);
  s.tree = sapling({ seed: 4 }); s.tree.position.set(1.1, 0.3, 1.05); s.tree.rotation.y = -0.35; s.stage.add(s.tree);
  return s;
}
const BEACH_CAM = [[0, { pos: [0.3, 1.5, 7.4], look: [0.3, 1.15, 0.3], fov: 46 }], [3, { pos: [0.3, 1.4, 6.5], look: [0.3, 1.15, 0.3], fov: 46 }]];
// the frame-1 hook title: big, readable in 1 s, on screen from the first frame
function hookTitle(g, t, k = 1) {
  if (k <= 0) return; const p = 0.94 + 0.06 * ease.outBack(clamp(t / 0.35 + 0.5)); g.save(); g.translate(E.W / 2, E.H * 0.2); g.scale(p, p); g.globalAlpha = k;
  CT(g, 'SHARKS ARE', 0, -95, 128, { color: '#ffffff', stroke: INK, maxW: 980 });
  CT(g, 'OLDER THAN', 0, 35, 128, { color: '#ffd23a', stroke: INK, maxW: 980 });
  CT(g, 'TREES', 0, 168, 150, { color: '#8fe05a', stroke: INK, maxW: 980 }); g.restore();
}
// s01 "Sharks are older than trees." — the hook: big grinning shark next to a tiny sapling, already moving
registerShot('s01', { kind: '3d',
  init(T) { return beach(T); },
  draw(s, t, info) { tick(s, t); const tr = at(info, 'trees', 1.4);
    s.sh.update(t + 0.6, { swim: 0.8, lid: 0.32, lidAngle: 0.12, look: [0.35, 0.05], brow: 0.3 });
    s.tree.update(t, { tremble: t > tr ? 1 : 0.2, lid: 0.0, look: [-0.7, 0.2], smile: -1 });
    camMove(s.stage, t, BEACH_CAM); },
  overlay(g, t, info, s) { const tr = at(info, 'trees', 1.4); sunnyLook(g, t, RAYS);
    reactions(g, t, s, [{ fx: 'sparkle', on: 'sh', at: 0.05, scale: 0.55, dx: 160, dy: -40 }, { fx: 'sweat', on: 'tree', at: tr }]); hookTitle(g, t); },
});
// s02 "Let that sink in." — the shark sinks slowly under the surface, staring at the lens. The sapling: "???"
registerShot('s02', { kind: '3d',
  init(T) { return beach(T); },
  draw(s, t, info) { tick(s, t); const k = ease.inOut(prog(t, 0.35, info.dur - 0.1));
    s.sh.position.y = lerp(0.32, -0.95, k); s.sh.rotation.y = 0.35; s.sh.update(t, { swim: 0.3, lid: 0.55, lidAngle: 0.0, look: [0.1, 0] });
    s.tree.update(t, { lid: 0.0, look: [-0.8, -0.2], smile: -1 });
    camMove(s.stage, t, [[0, { pos: [0.1, 1.35, 6.2], look: [0.1, 0.75, 0.3], fov: 44 }], [info.dur, { pos: [0.1, 1.25, 5.8], look: [0.1, 0.6, 0.3], fov: 44 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: false });
    reactions(g, t, s, [{ fx: 'ripples', on: [s.sh.position.x, 0.02, s.sh.position.z + 0.6], at: 0.5 }, { fx: 'question', on: 'tree', at: 0.7 }]); },
});

// ---------- s03 insert: the bars card ("450 MILLION" vs "350-390 MILLION") over the blurred sea ----------
function barsCard(g, t, info) {
  const W = E.W, H = E.H, tr = at(info, 'Trees', 2.9); g.save();
  const p = ease.outBack(clamp(t / 0.4)); g.translate(W / 2, H * 0.44); g.scale(p, p);
  g.beginPath(); g.roundRect(-470, -520, 940, 1000, 34); g.fillStyle = '#fbfaf4'; g.fill(); g.lineWidth = 10; g.strokeStyle = INK; g.stroke();
  CT(g, 'HOW LONG', 0, -430, 64, { maxW: 820 }); CT(g, 'THEY\'VE EXISTED', 0, -360, 64, { maxW: 820 });
  const bar = (y, k, len, col, label, val) => { CT(g, label, -390, y - 70, 56, { align: 'left', maxW: 760 });
    g.beginPath(); g.roundRect(-390, y - 40, 780, 80, 20); g.fillStyle = '#e6e2d6'; g.fill();
    const w = Math.max(0.001, 780 * len * ease.out(k)); g.beginPath(); g.roundRect(-390, y - 40, w, 80, 20); g.fillStyle = col; g.fill(); g.lineWidth = 7; g.strokeStyle = INK; g.stroke();
    if (k > 0.05) CT(g, val, 0, y + 95, 66, { color: col === '#8fe05a' ? '#3f8a2a' : '#2a6fb0', stroke: null, maxW: 780, a: clamp(k * 2) }); };
  bar(-170, clamp((t - 0.35) / 0.9), 1.0, '#5aa8e8', '🦈 SHARKS', '450 MILLION YEARS');
  bar(170, clamp((t - tr + 0.1) / 0.9), 390 / 450, '#8fe05a', '🌳 TREES', '350–390 MILLION');
  g.restore();
}
registerShot('s03', { kind: '3d',
  init(T) { return beach(T); },
  draw(s, t) { tick(s, t); s.sh.update(t, { swim: 1 }); s.tree.update(t); s.stage.cam([0.4, 1.6, 7.2], [0.4, 0.9, 0.2], 42); },
  overlay(g, t, info) { dimScene(g, 9, 0.5); barsCard(g, t, info); },
});

// ---------- s04 "Only 350 to 390 million." — birthday party: tree cake (3 candles) vs shark cake (a forest of candles, smoke, alarm) ----------
registerShot('s04', { kind: '3d',
  init(T) { const s = world(T, { fov: 40, target: [0, 0, 0], shadowSize: 6, seed: 7, sea: { color: '#2f8fd0' } });
    const lawn = mesh(new THREE.CylinderGeometry(7, 7.4, 0.5, 40), '#86c25a', { shadow: false }); lawn.position.set(0, 0, -1); lawn.receiveShadow = true; lawn.userData.noOutline = true; s.stage.add(lawn);
    s.tbl = party(); s.tbl.position.set(0, 0.25, 0); s.stage.add(s.tbl); s.stage.add(bunting(7, 4.0, -1.6));
    s.ct = cake({ tiers: 1, color: '#9ad86a', frost: '#ffffff', candles: 3, label: '390', r0: 0.42, seed: 3 }); s.ct.position.set(-0.85, 1.33, 0.15); s.stage.add(s.ct);
    s.cs = cake({ tiers: 3, color: '#7ab0e0', frost: '#ffffff', candles: 30, label: '450', r0: 0.7, seed: 9 }); s.cs.position.set(0.75, 1.33, -0.05); s.stage.add(s.cs);
    s.sm = smokeFx({ count: 14, size: 0.55, rise: 0.6, spread: 0.6, color: '#8a8a90', life: 3, seed: 4 }); s.sm.position.set(0.75, 1.33 + s.cs.top + 0.3, -0.05); s.stage.add(s.sm);
    s.tree = sapling({ seed: 6, scale: 0.9 }); s.tree.position.set(-1.55, 0.25, 1.3); s.tree.rotation.y = 0.2; s.stage.add(s.tree);
    s.sh = shark({ seed: 5, scale: 0.75 }); s.sh.position.set(1.75, 2.9, 0.6); s.sh.rotation.y = -0.7; s.stage.add(s.sh);
    s.fl = glowFx(2.2, '#ffb84a', 0.55); s.fl.position.set(0.75, 1.33 + s.cs.top + 0.35, -0.05); s.stage.add(s.fl); return s; },
  draw(s, t, info) { tick(s, t); s.ct.update(t); s.cs.update(t); const al = at(info, '390', 1.1); s.sm.visible = t > al - 0.3; s.sm.update(t);
    s.tree.update(t, { bounce: 1, look: [0.6, 0], lid: 0.1 }); s.sh.update(t, { swim: 0.4, lid: t > al ? 0.1 : 0.4, look: [-0.6, -0.2], brow: t > al ? 0.6 : 0 });
    camMove(s.stage, t, [[0, { pos: [0.1, 2.4, 9.6], look: [0.1, 1.9, 0], fov: 46 }], [info.dur, { pos: [0.2, 2.35, 8.9], look: [0.2, 1.95, 0], fov: 46 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: al, amp: 0.05, dur: 0.4 }]); },
  overlay(g, t, info, s) { const al = at(info, '390', 1.1); sunnyLook(g, t, { rays: false });
    reactions(g, t, s, [{ fx: 'hearts', on: 'tree', at: 0.15, scale: 0.7 }, { fx: 'exclaim', on: 'sh', at: al }, { fx: 'sweat', on: 'sh', at: al + 0.15 }]);
    // the smoke alarm, ringing at the top of the frame
    if (t > al) { const b = Math.floor((t - al) * 6) % 2; g.save(); g.translate(E.W * 0.5, E.H * 0.075); g.beginPath(); g.ellipse(0, 0, 120, 46, 0, 0, PI * 2); g.fillStyle = '#f4f2ec'; g.fill(); g.lineWidth = 7; g.strokeStyle = INK; g.stroke();
      g.beginPath(); g.arc(0, 0, 18, 0, PI * 2); g.fillStyle = b ? '#ff3b30' : '#7a1a14'; g.fill(); g.stroke(); if (b) { CT(g, 'BEEP!', -260, 10, 70, { color: '#ff3b30', stroke: INK }); CT(g, 'BEEP!', 260, 10, 70, { color: '#ff3b30', stroke: INK }); } g.restore(); } },
});

// ---------- s05/s06 the barren land: sharks swimming, no trees anywhere (only moss) ----------
function barren(T, o = {}) {
  const s = world(T, { fov: 42, target: [0, 0, -2], shadowSize: 12, seed: 11, sky: { top: '#3a86c8', mid: '#9cc6e4', horizon: '#ead6b0' } });
  const land = mesh(new THREE.CylinderGeometry(1, 1.05, 0.7, 48), '#a8825a', { shadow: false }); land.scale.set(16, 1, 7); land.position.set(0, 0.0, -9); land.receiveShadow = true; land.userData.noOutline = true; s.stage.add(land);
  for (let i = 0; i < 9; i++) { const r = rock(0.35 + (i % 3) * 0.25, ['#8a7a6a', '#7a6a5e', '#9a8a78'][i % 3], i + 1); r.position.set(-7 + i * 1.8 + (i % 2) * 0.6, 0.38, -4.4 - (i % 3) * 1.6); s.stage.add(r); }
  { const ms = moss(40, [-9, 9, -8, -3.4], 5); ms.position.y = 0.35; s.stage.add(ms); }
  return s;
}
registerShot('s05', { kind: '3d',
  init(T) { const s = barren(T); s.sh = shark({ seed: 7 }); s.sh.rotation.y = PI / 2; s.stage.add(s.sh); return s; },
  draw(s, t, info) { tick(s, t); const x = lerp(-3.4, 1.6, t / Math.max(info.dur, 1.5)); s.sh.position.set(x, 0.3, 1.0); s.sh.rotation.y = PI / 2 - 0.35;
    s.sh.update(t, { swim: 1, lid: 0.3, look: [0.4, 0.3] });
    s.stage.cam([0.0, 1.9, 7.6], [0.0, 0.9, -2.0], 46); },
  overlay(g, t, info, s) { const six = at(info, '60', 0.6); sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'question', on: 'sh', at: six + 0.4, until: info.dur }]);
    tag(g, '60 MILLION YEARS BEFORE TREES', ease.out(prog(t, six - 0.1, six + 0.25))); },
});
// s06 "before the first tree grew on land." — the first tree pops out of the bare dirt (sparkle); the shark is not impressed
registerShot('s06', { kind: '3d',
  init(T) { const s = barren(T); s.tree = sapling({ seed: 12, scale: 1.0 }); s.tree.position.set(0.4, 0.35, -3.0); s.stage.add(s.tree);
    s.sh = shark({ seed: 8, scale: 0.7 }); s.sh.position.set(-1.2, 0.3, -0.6); s.sh.rotation.y = -0.5 + PI; s.stage.add(s.sh); return s; },
  draw(s, t, info) { tick(s, t); const gr = at(info, 'grew', 1.0); const k = ease.outBack(prog(t, gr - 0.15, gr + 0.25));
    s.tree.scale.setScalar(Math.max(0.001, k)); s.tree.update(t, { lid: 0.0, look: [-0.5, 0], bounce: t > gr ? 1 : 0 });
    s.sh.rotation.y = lerp(PI + 0.6, 0.9, ease.inOut(prog(t, gr + 0.1, gr + 0.5))); s.sh.update(t, { swim: 0.5, lid: 0.55, look: [0.5, 0] });
    camMove(s.stage, t, [[0, { pos: [-0.3, 1.5, 5.2], look: [0.1, 0.8, -2.2], fov: 42 }], [info.dur, { pos: [-0.2, 1.4, 4.6], look: [0.2, 0.8, -2.4], fov: 40 }]]); },
  overlay(g, t, info, s) { const gr = at(info, 'grew', 1.0); sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'sparkle', on: 'tree', at: gr + 0.1 }, { fx: 'stars', on: 'tree', at: gr + 0.15, scale: 0.6 }]); },
});

// ---------- s07 "They're older than dinosaurs by about 200 million years." — a dinosaur strolls by, the shark photobombs ----------
registerShot('s07', { kind: '3d',
  init(T) { const s = world(T, { fov: 40, target: [0, 0, -2], shadowSize: 10, seed: 21, sand: [0, -4.2, 10, 3.2] });
    s.d = dino({ seed: 3 }); s.d.rotation.y = PI / 2; s.stage.add(s.d);
    for (let i = 0; i < 3; i++) { const r = rock(0.4, '#9a8a78', 30 + i); r.position.set(-4 + i * 3.5, 0.32, -6.2); s.stage.add(r); }
    s.sh = shark({ seed: 9, scale: 0.75 }); s.stage.add(s.sh); return s; },
  draw(s, t, info) { tick(s, t); const o = at(info, 'older', 0.25); s.d.position.set(lerp(-3.2, 1.8, t / Math.max(info.dur, 2)), 0.3, -3.6); s.d.update(t, { walk: 1, look: [0.2, 0] });
    const up = ease.outBack(prog(t, o - 0.05, o + 0.35)); s.sh.position.set(0.9, lerp(-1.4, 0.3, up), 1.4); s.sh.rotation.y = -0.45; s.sh.rotation.z = -0.12;
    s.sh.update(t, { swim: 0.6, lid: 0.15, look: [0.15, -0.05], brow: 0.8, pec: 0.6 });
    camMove(s.stage, t, [[0, { pos: [0.0, 2.0, 9.4], look: [0.0, 1.9, -2.0], fov: 48 }], [info.dur, { pos: [0.1, 1.95, 8.8], look: [0.1, 1.9, -2.0], fov: 48 }]]); },
  overlay(g, t, info, s) { const o = at(info, 'older', 0.25), two = at(info, '200', 1.4); sunnyLook(g, t, RAYS);
    reactions(g, t, s, [{ fx: 'sparkle', on: 'sh', at: o + 0.3, scale: 0.8 }, { fx: 'flash', at: two, dur: 0.3 }, { fx: 'question', on: 'd', at: two + 0.3 }]);
    // photo viewfinder corners after the flash (the photobomb)
    if (t > two) { const k = clamp((t - two) / 0.2); g.save(); g.globalAlpha = k; g.strokeStyle = '#ffffff'; g.lineWidth = 12; const m = 70, L = 120, W = E.W, H = E.H;
      [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m - 260, 1, -1], [W - m, H - m - 260, -1, -1]].forEach(([x, y, sx, sy]) => { g.beginPath(); g.moveTo(x, y + sy * L); g.lineTo(x, y); g.lineTo(x + sx * L, y); g.stroke(); }); g.restore(); }
    tag(g, 'OLDER THAN DINOSAURS: ~200M YEARS', ease.out(prog(t, two - 0.1, two + 0.25)), 0.12, 52); },
});

// ---------- s08 "Older than the Atlantic Ocean." — Pangaea splits from above; the shark watches with popcorn ----------
function slab(points, color) { const sh = new THREE.Shape(points.map(([x, z]) => new THREE.Vector2(x, z))); const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.5, bevelEnabled: true, bevelSize: 0.12, bevelThickness: 0.1, bevelSegments: 2 }); geo.rotateX(PI / 2); geo.translate(0, 0.5, 0);
  const m = mesh(geo, color); m.receiveShadow = true; return m; }
registerShot('s08', { kind: '3d',
  init(T) { const s = world(T, { fov: 42, target: [0, 0, 0], shadowSize: 10, seed: 31, sea: { color: '#2a86c8' } });
    s.L = new THREE.Group(); s.R = new THREE.Group(); s.stage.add(s.L, s.R);
    s.L.add(slab([[-9, -9], [-0.4, -9], [0.3, -5], [-0.6, -2], [0.4, 1.5], [-0.3, 5], [0.5, 9], [-9, 9]], '#8cc05a'));
    s.R.add(slab([[9, -9], [0.4, -9], [1.0, -5], [0.1, -2], [1.2, 1.5], [0.4, 5], [1.2, 9], [9, 9]], '#c9a868'));
    for (const [gp, x, z, c] of [[s.L, -3, -3, '#6a9a4a'], [s.L, -4, 3, '#6a9a4a'], [s.R, 4, -2, '#a8885a'], [s.R, 3.5, 4, '#a8885a']]) { const h = S(c, 1.4, 0.4, 1.0, x, 0.55, z); gp.add(h); }
    s.sh = shark({ seed: 11, scale: 0.85 }); s.stage.add(s.sh); s.pc = popcorn(); s.pc.scale.setScalar(0.9); s.stage.add(s.pc); return s; },
  draw(s, t, info) { tick(s, t); const k = ease.inOut(prog(t, 0.0, info.dur)); s.L.position.x = lerp(0, -2.4, k); s.R.position.x = lerp(-0.6, 2.6, k);
    s.sh.position.set(0.2, 0.3, lerp(4.5, 1.6, ease.out(prog(t, 0, 1.0)))); s.sh.rotation.y = PI; s.sh.update(t, { swim: 0.7, lid: 0.3, look: [0, 0.3] });
    s.pc.position.set(0.95, 0.1, s.sh.position.z - 0.4);
    camMove(s.stage, t, [[0, { pos: [0.2, 9.5, 8.0], look: [0.2, 0, -0.5], fov: 44 }], [info.dur, { pos: [0.2, 10.5, 7.2], look: [0.2, 0, -1.0], fov: 46 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: false }); reactions(g, t, s, [{ fx: 'sparkle', on: 'pc', at: 0.4, scale: 0.6 }, { fx: 'hearts', on: 'sh', at: 1.0, scale: 0.6 }]);
    tag(g, 'PANGAEA SPLITS: ~180M YEARS AGO', ease.out(prog(t, 0.2, 0.5)), 0.12, 52); },
});

// ---------- s09/s10 mass extinctions as a video game ----------
function hud(g, t, n, total = 5, survived = true, big = false) {
  g.save(); const W = E.W; g.fillStyle = 'rgba(10,12,30,.82)'; g.beginPath(); g.roundRect(60, 120, W - 120, big ? 300 : 210, 24); g.fill(); g.lineWidth = 8; g.strokeStyle = '#7af0ff'; g.stroke();
  CT(g, `MASS EXTINCTION ${n}/${total}`, W / 2, 185, 66, { color: '#ffffff', stroke: INK, maxW: W - 180 });
  if (survived) CT(g, big ? 'SURVIVED ✔' : 'SURVIVED', W / 2, big ? 320 : 270, big ? 110 : 70, { color: '#7aff6a', stroke: INK, maxW: W - 180 });
  // hearts (lives) at the top
  for (let i = 0; i < 3; i++) CT(g, '♥', W / 2 - 80 + i * 80, 70, 64, { color: '#ff4a6a', stroke: INK }); g.restore();
}
function meteorScene(T, o = {}) { const s = world(T, { fov: 44, target: [0, 0, 0], shadowSize: 8, seed: o.seed || 41, light: o.light || 'sunny', sky: o.sky || {} }); s.sh = shark({ seed: 13 }); s.stage.add(s.sh); return s; }
registerShot('s09', { kind: '3d',
  init(T) { const s = meteorScene(T, { sky: { top: '#3a3a8a', mid: '#a87ab8', horizon: '#f2b47a' } }); s.m = [0, 1, 2, 3].map(i => { const a = asteroid({ size: 0.38, seed: i + 2 }); s.stage.add(a); return a; }); return s; },
  draw(s, t, info) { tick(s, t); const dodge = Math.sin(t * 5.5) * 1.1; s.sh.position.set(dodge, 0.3, 0.6); s.sh.rotation.y = 0.2 * Math.cos(t * 5.5); s.sh.rotation.z = -0.25 * Math.cos(t * 5.5);
    s.sh.update(t, { swim: 1.4, lid: 0.0, look: [0, 0.6], brow: 0.5 });
    s.m.forEach((a, i) => { const ph = ((t * 0.9 + i * 0.27) % 1); a.position.set((i % 2 ? 1 : -1) * (0.9 + i * 0.35) - dodge * 0.2, lerp(6.5, -0.4, ph), -0.6 - i * 0.5); a.rotation.z = (i % 2 ? -1 : 1) * 0.3; a.update(t + i); a.visible = ph < 0.97; });
    s.stage.cam([0, 2.1, 7.4], [0, 1.6, 0], 46); shakeCam(s.stage, t, [{ fx: 'shake', at: 0.4, amp: 0.05, dur: 0.3 }, { fx: 'shake', at: 1.1, amp: 0.05, dur: 0.3 }, { fx: 'shake', at: 1.8, amp: 0.05, dur: 0.3 }]); },
  overlay(g, t, info, s) { softTint(g, '#ff9a5a', 0.25); const n = 1 + Math.min(3, Math.floor(t / Math.max(0.5, info.dur / 4))); hud(g, t, n);
    reactions(g, t, s, [{ fx: 'sweat', on: 'sh', at: 0.2 }, { fx: 'speedlines', on: 'sh', at: 0.1 }]); },
});
// s10 "including the one that killed the dinosaurs." — a big asteroid falls far away; the shark floats past, unbothered. 5/5 SURVIVED.
registerShot('s10', { kind: '3d',
  init(T) { const s = meteorScene(T, { seed: 47, light: 'sunny', sky: { top: '#2a2a6a', mid: '#c87a8a', horizon: '#ffb86a' } });
    const land = mesh(new THREE.CylinderGeometry(1, 1.05, 0.7, 48), '#8a7a5a', { shadow: false }); land.scale.set(30, 1, 10); land.position.set(0, 0, -40); land.userData.noOutline = true; s.stage.add(land);
    s.big = asteroid({ size: 4.5, seed: 9 }); s.big.rotation.z = -0.5; s.stage.add(s.big); s.gl = glowFx(30, '#ffb04a', 0); s.gl.position.set(6, 2, -42); s.stage.add(s.gl); return s; },
  draw(s, t, info) { tick(s, t); const hit = Math.max(0.8, info.dur - 1.0); const k = clamp(t / hit); s.big.position.set(lerp(-10, 6, k), lerp(26, 2, k), -42); s.big.visible = t < hit; s.big.update(t);
    s.gl.material.opacity = t > hit ? clamp(1 - (t - hit) / 1.2) * 0.9 : 0;
    s.sh.position.set(lerp(-1.2, 0.9, t / info.dur), 0.35, 1.6); s.sh.rotation.y = 0.55; s.sh.update(t, { swim: 0.5, lid: 0.6, look: [0.4, 0] });
    s.stage.cam([0, 1.7, 7.4], [0, 2.6, -6], 50); shakeCam(s.stage, t, [{ fx: 'shake', at: hit, amp: 0.05, dur: 0.6 }]); },
  overlay(g, t, info, s) { const hit = Math.max(0.8, info.dur - 1.0); reactions(g, t, s, [{ fx: 'flash', at: hit, dur: 0.4, color: '#fff2d0' }]);
    hud(g, t, t > hit ? 5 : 4, 5, true, t > hit); if (t > hit) { const p = ease.outBack(clamp((t - hit) / 0.3)); g.save(); g.translate(E.W / 2, E.H * 0.45); g.rotate(-0.12); g.scale(p, p); CT(g, '5/5', 0, 0, 230, { color: '#ffd23a', stroke: INK }); g.restore(); } },
});

// ---------- s11 "Meaning the scariest thing in the ocean..." — low-angle close-up, moody, spotlight ----------
registerShot('s11', { kind: '3d',
  init(T) { const s = world(T, { fov: 36, target: [0, 0, 0], shadowSize: 6, seed: 51, light: 'dusk', sky: { top: '#141a40', mid: '#3a3a78', horizon: '#8a5a8a', glow: 0.2 }, sea: { color: '#1e4a7a' } });
    s.sh = shark({ seed: 15 }); s.sh.position.set(0, 0.25, 0.4); s.sh.rotation.y = 0.15; s.stage.add(s.sh); return s; },
  draw(s, t, info) { tick(s, t); s.sh.update(t, { swim: 0.35, lid: 0.5, lidAngle: 0.35, look: [0, -0.05], brow: -0.3 });
    camMove(s.stage, t, [[0, { pos: [0.4, 0.55, 6.4], look: [0.1, 0.8, 0.4], fov: 38 }], [info.dur, { pos: [0.3, 0.5, 5.4], look: [0.1, 0.82, 0.4], fov: 36 }]]); },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'spotlight', on: 'sh', at: 0, scale: 1.3 }]); },
});
// s12 "is also the most experienced thing on Earth." — reading glasses, the Ocean Times, a briefcase. Warm and cosy.
registerShot('s12', { kind: '3d',
  init(T) { const s = world(T, { fov: 38, target: [0, 0, 0], shadowSize: 6, seed: 53 });
    s.sh = shark({ seed: 17 }); s.sh.position.set(-0.1, 0.3, 0.3); s.sh.rotation.y = 0.35; s.stage.add(s.sh);
    s.gl = glasses(); s.gl.position.set(0, 0.08, 0.13); s.sh.head.add(s.gl);
    s.np = newspaper(); s.stage.add(s.np); s.bc = briefcase(); s.stage.add(s.bc); return s; },
  draw(s, t, info) { tick(s, t); const ex = at(info, 'experienced', 0.9); const turn = ease.inOut(prog(t, ex - 0.2, ex + 0.2));
    s.sh.update(t, { swim: 0.3, lid: lerp(0.45, 0.25, turn), look: lerp(0.5, 0, turn) > 0 ? [lerp(0.5, 0.05, turn), lerp(-0.4, 0, turn)] : [0, 0], brow: lerp(-0.2, 0.6, turn), pec: 0.3 });
    s.np.position.set(1.05, 1.1, 1.3); s.np.rotation.set(-0.15, -0.6 + turn * 0.25, 0.04); s.bc.position.set(-1.1, 0.35, 1.4); s.bc.rotation.y = 0.3;
    camMove(s.stage, t, [[0, { pos: [0.3, 1.3, 6.2], look: [0.1, 0.85, 0.3], fov: 42 }], [info.dur, { pos: [0.25, 1.25, 5.6], look: [0.1, 0.88, 0.3], fov: 42 }]]); },
  overlay(g, t, info, s) { const ex = at(info, 'experienced', 0.9); sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'sparkle', on: 'sh', at: ex, scale: 0.6, dy: -60 }, { fx: 'glow', on: 'sh', at: ex }]); },
});

// ---------- s13 "Trees are the new kids." — the tiny tree salutes the shark's giant shadow ----------
registerShot('s13', { kind: '3d',
  init(T) { const s = world(T, { fov: 40, target: [0, 0, 0], shadowSize: 6, seed: 61, sand: [0, 0.4, 1.6, 1.3] });
    s.tree = sapling({ seed: 4 }); s.tree.position.set(0, 0.3, 0.6); s.stage.add(s.tree);
    s.sh = shark({ seed: 19, scale: 2.4 }); s.sh.position.set(-0.4, 0.9, -6.5); s.sh.rotation.y = 0.15; s.stage.add(s.sh);
    s.shade = mesh(new THREE.CircleGeometry(1, 32), new THREE.MeshBasicMaterial({ color: '#0a1a30', transparent: true, opacity: 0, depthWrite: false }), { noOutline: true, shadow: false }); s.shade.rotation.x = -PI / 2; s.shade.scale.set(2.6, 1.4, 1); s.shade.position.set(0, 0.32, 0.5); s.stage.add(s.shade); return s; },
  draw(s, t, info) { tick(s, t); const nk = at(info, 'new', 0.6); const sal = ease.outBack(prog(t, nk - 0.2, nk + 0.15));
    s.shade.material.opacity = 0.45 * ease.out(prog(t, 0, 0.5)); s.tree.update(t, { salute: sal, lid: 0.0, look: [0, 0.8], smile: -1, tremble: 0.5 });
    s.sh.update(t, { swim: 0.4, lid: 0.45, look: [0, -0.8] });
    camMove(s.stage, t, [[0, { pos: [0.2, 0.8, 3.6], look: [0, 1.7, -2.5], fov: 50 }], [info.dur, { pos: [0.2, 0.75, 3.2], look: [0, 1.8, -2.5], fov: 50 }]]); },
  overlay(g, t, info, s) { const nk = at(info, 'new', 0.6); sunnyLook(g, t, { rays: false, tint: '#ffcf8a' }); reactions(g, t, s, [{ fx: 'sweat', on: 'tree', at: 0.2 }, { fx: 'exclaim', on: 'tree', at: nk, until: nk + 0.8 }]); },
});
// s14 "Sharks just let them stay." — the shark nods, smiles; the sapling: hearts
registerShot('s14', { kind: '3d',
  init(T) { return beach(T); },
  draw(s, t, info) { tick(s, t); const st = at(info, 'stay', 1.0); s.sh.rotation.y = 0.75; s.sh.head.rotation.x = Math.sin(clamp((t - st + 0.3) / 0.5) * PI * 2) * 0.12;
    s.sh.update(t, { swim: 0.5, lid: 0.4, look: [0.6, -0.1], brow: 0.3 }); s.tree.update(t, { lid: t > st ? 0.45 : 0.0, look: [-0.6, 0.2], bounce: t > st ? 1 : 0 });
    camMove(s.stage, t, [[0, { pos: [0.1, 1.4, 7.0], look: [0.15, 1.0, 0.4], fov: 46 }], [info.dur, { pos: [0.1, 1.35, 6.4], look: [0.15, 1.0, 0.4], fov: 46 }]]); },
  overlay(g, t, info, s) { const st = at(info, 'stay', 1.0); sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'hearts', on: 'tree', at: st }, { fx: 'heartEyes', on: 'tree', at: st }]); },
});
// s15 "Subscribe for more." — back on the frame-1 composition (loop): the shark winks; hard cut to frame 1
registerShot('s15', { kind: '3d',
  init(T) { return beach(T); },
  draw(s, t) { tick(s, t); const w = Math.sin(clamp((t - 0.3) / 0.35) * PI);
    s.sh.update(t + 0.6, { swim: 0.8, lid: 0.32, lidAngle: 0.12, look: [0.35, 0.05], brow: 0.3 }); s.sh.eyes[0].lp.rotation.x = lerp(s.sh.eyes[0].lp.rotation.x, 1.5708, w);
    s.tree.update(t, { tremble: 0.2, lid: 0.0, look: [-0.7, 0.2], smile: 1 });
    s.stage.cam([0.3, 1.5, 7.4], [0.3, 1.15, 0.3], 46); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'sparkle', on: 'sh', at: 0.3, scale: 0.55, dx: 160, dy: -40 }]); },
});
