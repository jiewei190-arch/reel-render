// The Octopus: 9 brains, 3 hearts, blue blood. 21 shots, Toon 3D + BEANMEN effects (Justin clips nature-fact style).
// s01 = frame 1 (already moving, 2-line top caption 0-3.5 s); s21 ends on frame 1's exact camera + pose -> seamless loop.
import { registerShot, ease, prog, clamp, lerp, E, wordTime } from '/engine/core.js';
import { camMove, THREE, ball, cyl, outline, toon, rbox } from '/kits/toon3d/toon.js';
import { shakeCam, anchor } from '/kits/toon3d/react.js';
import { insertShot } from '/kits/toon3d/insert.js';
import { at, octopus, seaStage, waterLook, fish, chip, stamp, fxr, topCaption, scubaDog, clam, testTube, holeRock, brainIcon } from './_lib.js';

// nth occurrence of a word, shot-local
const atN = (info, word, n, fb = 0) => { let tt = info.shot.start - 0.1, r = null; for (let i = 0; i < n; i++) { r = wordTime(word, tt); if (r == null) return fb; tt = r + 0.05; } return r - info.shot.start; };
const gt = (info, t) => info.shot.start + t;
const look = (g, t, o) => waterLook(g, t, o);

// ---------------------------------------------------------------- stages
function darkSea(T, o = {}) { const s = seaStage(T, { dark: true, fov: 36, seed: o.seed || 4, weeds: 14, ...o }); s.o = octopus({ seed: 1 }); s.stage.add(s.o); return s; }
function sunSea(T, o = {}) { const s = seaStage(T, { fov: 36, seed: o.seed || 5, clear: o.clear || 2.6 }); s.o = octopus({ seed: o.os || 1 }); s.stage.add(s.o); return s; }
function coldSea(T, o = {}) { const s = seaStage(T, { dark: true, fov: 36, seed: o.seed || 14, weeds: 6, stage: { bg: ['#5a8ab8', '#24507e', '#0a1e3a'], fog: [6, 26, '#2a5a8a'], ambient: 1.05, key: ['#e0f2ff', 1.8, [-4, 10, 6]], fill: ['#9ae0ff', 0.6, [6, 2, 6]] } }); s.o = octopus({ seed: 1 }); s.stage.add(s.o); return s; }

// frame 1 framing (s01 start == s21 end)
const F1 = { pos: [0, 2.0, 7.4], look: [0, 1.25, 0], fov: 36 };
const F1b = { pos: [0, 1.85, 6.4], look: [0, 1.3, 0], fov: 36 };
const heroPose = (s, t) => { s.o.position.set(Math.sin(t * 0.9) * 0.12, 0.15 + Math.sin(t * 1.7) * 0.08, 0); s.o.rotation.y = Math.sin(t * 0.7) * 0.15; };

// s01 "This animal has 9 brains," — FRAME 1: the octopus mid-swim in deep water, arms rippling, caption on top
registerShot('s01', { kind: '3d',
  init(T) { return darkSea(T); },
  draw(s, t, info) { s.sea.update(t); heroPose(s, t); const b = at(info, 'brains', 1.0);
    s.o.update(t + 2.5, { spread: 1.25, curl: 1.0, wave: 1.6, lid: 0.15, brow: 0.3 * ease.out(prog(t, b, b + 0.3)), mouth: t > b ? 'o' : 'smile' });
    camMove(s.stage, t, [[0, F1], [info.dur, F1b]], ease.out); },
  overlay(g, t, info, s) { look(g, t, { k: 0.1 }); topCaption(g, gt(info, t)); const b = at(info, 'brains', 1.0);
    fxr(g, t, s, [{ fx: 'sparkle', on: 'o', at: 0.0, scale: 0.7 }, { fx: 'exclaim', on: 'o', at: b, until: b + 0.9 }]); },
});
// s02 "3 hearts, and blue blood." — x-ray: three hearts pumping inside; blue glow on "blue"
registerShot('s02', { kind: '3d',
  init(T) { return darkSea(T, { seed: 6 }); },
  draw(s, t, info) { s.sea.update(t); heroPose(s, t + 1.5); const bl = at(info, 'blue', 0.9);
    s.o.update(t + 3, { xray: ease.out(prog(t, 0, 0.2)), hearts: ease.outBack(prog(t, 0.05, 0.35)), beat: 2.2, lid: 0.2, mouth: 'smile', spread: 1.25, curl: 1.0, wave: 1.4 });
    camMove(s.stage, t, [[0, { pos: [0.2, 2.6, 4.6], look: [0, 2.15, 0], fov: 34 }], [info.dur, { pos: [0.1, 2.55, 4.1], look: [0, 2.15, 0], fov: 34 }]]); },
  overlay(g, t, info, s) { look(g, t, { k: 0.1 }); topCaption(g, gt(info, t)); const bl = at(info, 'blue', 0.9);
    const c = anchor(s.stage, s.o.heartPos(0)); if (t > bl) { const k = ease.out(clamp((t - bl) / 0.4)); g.save(); g.globalCompositeOperation = 'screen'; const gr = g.createRadialGradient(c.x, c.y, 0, c.x, c.y, 420 * k);
      gr.addColorStop(0, 'rgba(60,150,255,0.55)'); gr.addColorStop(1, 'rgba(60,150,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, E.W, E.H); g.restore(); }
    fxr(g, t, s, [{ fx: 'hearts', on: 'o', at: 0.1 }, { fx: 'sparkle', on: s.o.heartPos(0), at: bl, scale: 0.8, color: '#7ad0ff' }]); },
});

// s03 "The octopus has around" — sunlit reef, name chip
registerShot('s03', { kind: '3d',
  init(T) { return sunSea(T); },
  draw(s, t, info) { s.sea.update(t); s.o.position.set(0, 0, 0); s.o.rotation.y = Math.sin(t * 0.8) * 0.2;
    s.o.update(t, { lid: 0.2, spread: 1.3, curl: 1.1, wave: 1.1, look: [Math.sin(t * 1.3) * 0.4, 0] });
    camMove(s.stage, t, [[0, { pos: [-1.6, 2.4, 7.6], look: [0, 1.4, 0], fov: 36 }], [info.dur, { pos: [-0.6, 2.2, 6.8], look: [0, 1.5, 0], fov: 36 }]]); },
  overlay(g, t, info, s) { look(g, t); chip(g, 'OCTOPUS', E.W / 2, E.H * 0.2, t - at(info, 'octopus', 0.1), { size: 70, color: '#ffffff', rot: -3 });
    fxr(g, t, s, [{ fx: 'sparkle', on: 'o', at: at(info, 'octopus', 0.1) + 0.05, scale: 0.6 }]); },
});
// s04 "500 million neurons," — INSERT 1: counter over the x-ray octopus (its nerve cells lit)
const neuronScene = { init(T) { return sunSea(T, { seed: 7 }); },
  draw(s, t) { s.sea.update(t); s.o.update(t, { xray: 1, neurons: 1, armNeurons: 1, brain: 1, lid: 0.2, spread: 1.3, curl: 1.1 });
    camMove(s.stage, t, [[0, { pos: [0, 2.0, 6.2], look: [0, 1.5, 0], fov: 36 }], [3, { pos: [0, 2.0, 5.6], look: [0, 1.5, 0], fov: 36 }]]); } };
insertShot('s04', { scene: neuronScene, dim: 0.5, insert: { type: 'counter', value: 500000000, from: 0, title: 'NEURONS', lines: ['nerve cells, about 500 million'], color: '#ffd23a' } });
// s05 "about as many as a dog." — a dog in a bubble helmet drifts in; brain icons over both, "≈"
registerShot('s05', { kind: '3d',
  init(T) { const s = sunSea(T, { seed: 8, clear: 4 }); s.d = scubaDog(); s.d.rotation.y = -0.5; s.stage.add(s.d); return s; },
  draw(s, t, info) { s.sea.update(t); s.o.position.set(-0.85, 0, -0.3); s.o.scale.setScalar(0.78); s.o.rotation.y = 0.45; const dg = at(info, 'dog', 1.0);
    s.o.update(t, { lid: 0.2, spread: 1.25, curl: 1.0, look: [0.7, 0], mouth: 'smile' });
    s.d.position.x = lerp(4.0, 0.95, ease.out(prog(t, 0, dg + 0.1))); s.d.position.z = 0.2; s.d.scale.setScalar(0.85); s.d.update(t, { y: 0.45, lid: 0.15, look: [-0.6, 0] });
    camMove(s.stage, t, [[0, { pos: [0.05, 2.4, 9.0], look: [0.05, 1.3, 0], fov: 36 }], [info.dur, { pos: [0.05, 2.3, 8.5], look: [0.05, 1.3, 0], fov: 36 }]]); },
  overlay(g, t, info, s) { look(g, t); const dg = at(info, 'dog', 1.0); const ao = anchor(s.stage, s.o), ad = anchor(s.stage, s.d);
    const k1 = ease.outBack(clamp(t / 0.3)), k2 = ease.outBack(clamp((t - dg) / 0.3));
    brainIcon(g, ao.x, ao.y - 110, 2.0 * k1, 1); brainIcon(g, ad.x, ad.y - 110, 2.0 * k2, k2 > 0 ? 1 : 0);
    chip(g, '≈', (ao.x + ad.x) / 2, Math.min(ao.y, ad.y) - 80, t - dg - 0.15, { size: 90, color: '#ffd23a' });
    chip(g, 'DOG', ad.x, ad.y + 400, t - dg, { size: 56, color: '#ffffff', rot: 4 });
    fxr(g, t, s, [{ fx: 'hearts', on: 'd', at: dg + 0.2 }]); },
});

// s06 "But two thirds of them aren't in its head." — x-ray: the head's neurons dim, "NOT HERE"
registerShot('s06', { kind: '3d',
  init(T) { return sunSea(T, { seed: 9 }); },
  draw(s, t, info) { s.sea.update(t); const hd = at(info, 'head', 1.6);
    s.o.update(t, { xray: 1, neurons: t < hd ? 1 : 0, armNeurons: 0, brain: t < hd ? 1 : 0.2, lid: lerp(0.2, 0.45, prog(t, hd, hd + 0.3)), mouth: t > hd ? 'o' : 'smile', spread: 1.3, curl: 1.0 });
    camMove(s.stage, t, [[0, { pos: [0.3, 2.5, 4.6], look: [0, 1.6, 0], fov: 36 }], [info.dur, { pos: [0.2, 2.45, 4.1], look: [0, 1.6, 0], fov: 36 }]]); },
  overlay(g, t, info, s) { look(g, t); const hd = at(info, 'head', 1.6), tw = at(info, 'two', 0.15);
    chip(g, '2/3 OF THEM...', E.W / 2, E.H * 0.17, t - tw, { size: 66, color: '#ffd23a', rot: -3 });
    const c = anchor(s.stage, s.o.brainPos()); stamp(g, 'NOT HERE', c.x, c.y - 230, t - hd, { size: 76, rot: -8 });
    fxr(g, t, s, [{ fx: 'question', on: 'o', at: hd + 0.2 }]); },
});
// s07 "They're in its arms." — the arms light up gold, "IN THE ARMS"
registerShot('s07', { kind: '3d',
  init(T) { return sunSea(T, { seed: 10 }); },
  draw(s, t, info) { s.sea.update(t); const ar = at(info, 'arms', 0.6);
    s.o.update(t, { xray: 1, neurons: 0, armNeurons: t > ar - 0.15 ? 1 : 0, brain: 0.2, lid: 0.15, mouth: 'smile', spread: 1.45, curl: 1.6, wave: 1.4 });
    camMove(s.stage, t, [[0, { pos: [0, 2.0, 7.4], look: [0, 1.0, 0], fov: 38 }], [info.dur, { pos: [0, 1.9, 6.8], look: [0, 1.0, 0], fov: 38 }]]); },
  overlay(g, t, info, s) { look(g, t); const ar = at(info, 'arms', 0.6);
    stamp(g, 'IN THE ARMS', E.W / 2, E.H * 0.15, t - ar, { size: 84, rot: -6, color: '#e8402a' });
    fxr(g, t, s, [0, 2, 5, 7].map((i, k) => ({ fx: 'sparkle', on: s.o.armTip(i), at: ar + k * 0.06, scale: 0.5, seed: k + 1 }))); },
});

// s08 "Each arm has its own mini brain." — 8 mini brains light up one by one; "+8 MINI BRAINS"
registerShot('s08', { kind: '3d',
  init(T) { return sunSea(T, { seed: 11 }); },
  draw(s, t, info) { s.sea.update(t); const e = at(info, 'each', 0.05), mb = at(info, 'mini', 0.9);
    const n = clamp((t - e) / Math.max(0.6, mb + 0.3 - e)) * 8;
    s.o.update(t, { ganglia: n, brain: 1, xray: 0.55, lid: 0.15, spread: 1.4, curl: 1.3, wave: 1.0, mouth: 'smile' });
    camMove(s.stage, t, [[0, { pos: [0, 3.3, 5.8], look: [0, 0.95, 0], fov: 38 }], [info.dur, { pos: [0.3, 3.1, 5.2], look: [0, 1.0, 0], fov: 38 }]]); },
  overlay(g, t, info, s) { look(g, t); const mb = at(info, 'mini', 0.9), br = at(info, 'brain', 1.2);
    chip(g, '+8 MINI BRAINS', E.W / 2, E.H * 0.16, t - mb, { size: 64, color: '#ffd23a', rot: -3 });
    chip(g, '1 + 8 = 9', E.W / 2, E.H * 0.24, t - br - 0.25, { size: 58, color: '#ffffff', rot: 3 });
    brainIcon(g, E.W / 2 - 330, E.H * 0.16, 1.2 * ease.outBack(clamp((t - mb) / 0.3)), t > mb ? 1 : 0); },
});
// s09 "It can taste, touch" — one arm tastes a clam, another taps a fish
registerShot('s09', { kind: '3d',
  init(T) { const s = sunSea(T, { seed: 12, clear: 4 }); s.c = clam(); s.c.position.set(-0.95, 0, 1.4); s.c.rotation.y = 0.6; s.stage.add(s.c); s.f = fish({ color: '#ffb23a', seed: 3 }); s.f.position.set(1.3, 1.3, 1.2); s.f.scale.setScalar(0.8); s.f.rotation.y = -1.9; s.stage.add(s.f); return s; },
  draw(s, t, info) { s.sea.update(t); const ta = at(info, 'taste', 0.4), to = at(info, 'touch', 0.9);
    const r0 = ease.inOut(prog(t, ta - 0.35, ta)), r7 = ease.inOut(prog(t, to - 0.35, to));
    s.o.update(t, { lid: 0.2, spread: 1.3, curl: 1.0, look: [t < to - 0.3 ? -0.7 : 0.7, -0.3], mouth: 'smile',
      arms: { 0: { spread: lerp(1.3, 1.65, r0), curl: lerp(1.0, -0.6, r0), wave: 0.3 }, 7: { spread: lerp(1.3, 1.9, r7), curl: lerp(1.0, 0.8, r7), wave: 0.3, lift: r7 * 1.2 } } });
    s.c.open(0.3 + 0.25 * Math.sin(t * 3)); s.f.update(t, { lid: 0.2, look: [0.4, 0] }); s.f.position.y = 1.3 + Math.sin(t * 2) * 0.05 + (t > to ? ease.out(prog(t, to, to + 0.3)) * 0.25 : 0);
    camMove(s.stage, t, [[0, { pos: [0, 2.7, 8.6], look: [0, 0.9, 0.5], fov: 38 }], [info.dur, { pos: [0, 2.6, 8.1], look: [0, 0.9, 0.5], fov: 38 }]]); },
  overlay(g, t, info, s) { look(g, t); const ta = at(info, 'taste', 0.4), to = at(info, 'touch', 0.9); const ac = anchor(s.stage, s.c, { height: 0.9 }), af = anchor(s.stage, s.f);
    chip(g, 'TASTE', Math.max(200, ac.x), ac.y - 40, t - ta, { size: 60, color: '#ffd23a', rot: -5 }); chip(g, 'TOUCH', Math.min(E.W - 200, af.x), af.y - 60, t - to, { size: 60, color: '#ffffff', rot: 5 });
    fxr(g, t, s, [{ fx: 'hearts', on: 'o', at: ta + 0.1, until: ta + 1.0 }, { fx: 'exclaim', on: 'f', at: to + 0.05 }]); },
});
// s10 "and move on its own." — one arm waves by itself; the octopus watches it, puzzled
registerShot('s10', { kind: '3d',
  init(T) { return sunSea(T, { seed: 13 }); },
  draw(s, t, info) { s.sea.update(t); const mv = at(info, 'move', 0.05); const w = ease.out(prog(t, mv, mv + 0.3));
    s.o.update(t, { lid: 0.25, spread: 1.25, curl: 0.9, wave: 0.25, look: [-0.8 * w, 0.3 * w], mouth: w > 0.5 ? 'o' : 'smile', brow: -0.3 * w,
      arms: { 1: { spread: 1.5 + Math.sin(t * 7) * 0.35 * w, curl: 1.4 + Math.sin(t * 5.3) * 1.2 * w, wave: 3.5 * w + 0.25, lift: w * (0.6 + Math.sin(t * 6) * 0.6) } } });
    camMove(s.stage, t, [[0, { pos: [-0.9, 2.3, 6.0], look: [-0.5, 1.3, 0], fov: 36 }], [info.dur, { pos: [-1.0, 2.2, 5.4], look: [-0.6, 1.3, 0], fov: 36 }]]); },
  overlay(g, t, info, s) { look(g, t); const mv = at(info, 'move', 0.05), ow = at(info, 'own', 0.8);
    chip(g, 'ON ITS OWN', E.W / 2, E.H * 0.17, t - ow, { size: 64, color: '#ffd23a', rot: -3 });
    fxr(g, t, s, [{ fx: 'question', on: 'o', at: mv + 0.3 }]); },
});

// s11 "But the main brain can still step in and take control." — a crown pops on; on "control" every arm snaps into sync
registerShot('s11', { kind: '3d',
  init(T) { return sunSea(T, { seed: 15 }); },
  draw(s, t, info) { s.sea.update(t); const mn = at(info, 'main', 0.3), ct = at(info, 'control', 2.2); const sy = ease.out(prog(t, ct - 0.1, ct + 0.15));
    s.o.update(t, { crown: prog(t, mn, mn + 0.35), brain: 1, xray: 0, lid: lerp(0.25, 0.4, sy), brow: lerp(0, 0.45, sy), mouth: t > ct ? 'smile' : 'smile', sync: sy,
      spread: lerp(1.25, 1.55, sy), curl: lerp(1.0, 2.1, sy), wave: lerp(1.2, 0.5, sy) });
    camMove(s.stage, t, [[0, { pos: [0, 2.5, 8.0], look: [0, 1.9, 0], fov: 36 }], [ct, { pos: [0, 2.5, 7.5], look: [0, 1.9, 0], fov: 36 }], [info.dur, { pos: [0, 2.4, 6.9], look: [0, 1.9, 0], fov: 36 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: ct, amp: 0.06, dur: 0.3 }]); },
  overlay(g, t, info, s) { look(g, t); const mn = at(info, 'main', 0.3), ct = at(info, 'control', 2.2);
    chip(g, 'MAIN BRAIN', E.W / 2, E.H * 0.16, t - mn, { size: 64, color: '#ff9ad0', rot: -3 });
    stamp(g, 'IN CONTROL', E.W / 2, E.H * 0.25, t - ct, { size: 76, rot: -6, color: '#e8402a' });
    fxr(g, t, s, [{ fx: 'sparkle', on: 'o', at: mn + 0.1, scale: 0.6 }, { fx: 'exclaim', on: 'o', at: ct }, { fx: 'flash', at: ct, dur: 0.12 }]); },
});

// s12 "3 hearts: two pump blood past the gills," — x-ray mantle: the two gill hearts pump
const heartsCam = [[0, { pos: [0.5, 2.9, 3.9], look: [0, 2.2, -0.2], fov: 34 }], [2.6, { pos: [0.35, 2.85, 3.5], look: [0, 2.2, -0.2], fov: 34 }]];
registerShot('s12', { kind: '3d',
  init(T) { return sunSea(T, { seed: 16 }); },
  draw(s, t, info) { s.sea.update(t); const tw = at(info, 'two', 0.8);
    s.o.update(t, { xray: 1, hearts: 1, beat: 1.6, bodyHeart: t < tw ? 1 : 0.35, gillHearts: 1, lid: 0.2, spread: 1.25, curl: 1.0 });
    if (t < tw - 0.05) camMove(s.stage, t, [[0, { pos: [0, 2.4, 5.6], look: [0, 1.8, 0], fov: 36 }], [tw, { pos: [0, 2.4, 5.2], look: [0, 1.8, 0], fov: 36 }]]);
    else camMove(s.stage, t - tw, heartsCam); },
  overlay(g, t, info, s) { look(g, t); const tw = at(info, 'two', 0.8), gi = at(info, 'gills', 1.8);
    chip(g, '3 HEARTS', E.W / 2, E.H * 0.16, t, { size: 70, color: '#ff5a4a', rot: -3 });
    [1, 2].forEach((k, i) => { const c = anchor(s.stage, s.o.heartPos(k)); chip(g, 'GILLS', c.x + (i ? 150 : -150), c.y + 120, t - gi - i * 0.08, { size: 48, color: '#ffffff', rot: i ? 6 : -6 }); });
    fxr(g, t, s, [{ fx: 'sparkle', on: s.o.heartPos(1), at: tw, scale: 0.4 }, { fx: 'sparkle', on: s.o.heartPos(2), at: tw + 0.1, scale: 0.4, seed: 3 }]); },
});
// s13 "one pumps it around the body." — the big body heart pumps; arcs of blue blood loop round
registerShot('s13', { kind: '3d',
  init(T) { return sunSea(T, { seed: 17 }); },
  draw(s, t, info) { s.sea.update(t); s.o.update(t, { xray: 1, hearts: 1, beat: 1.6, bodyHeart: 1, gillHearts: 0.4, lid: 0.2, spread: 1.3, curl: 1.1 });
    camMove(s.stage, t, [[0, { pos: [-0.4, 2.6, 5.4], look: [0, 1.8, 0], fov: 36 }], [info.dur, { pos: [-0.3, 2.5, 4.8], look: [0, 1.8, 0], fov: 36 }]]); },
  overlay(g, t, info, s) { look(g, t); const c = anchor(s.stage, s.o.heartPos(0)), bd = at(info, 'body', 1.0);
    chip(g, 'BODY HEART', c.x, c.y - 200, t - 0.05, { size: 56, color: '#ff5a4a', rot: -4 });
    // blue blood dots streaming in a loop around the body
    const R = 330, n = 14; g.save(); for (let i = 0; i < n; i++) { const a = t * 2.6 + i / n * Math.PI * 2; const x = c.x + Math.cos(a) * R * 0.75, y = c.y + 260 + Math.sin(a) * R; const k = clamp(t / 0.4);
      g.globalAlpha = k * 0.9; g.fillStyle = '#3a8cff'; g.strokeStyle = '#2a1c15'; g.lineWidth = 4; g.beginPath(); g.arc(x, y, 14, 0, Math.PI * 2); g.fill(); g.stroke(); } g.restore();
    fxr(g, t, s, [{ fx: 'sparkle', on: s.o.heartPos(0), at: bd, scale: 0.5 }]); },
});

// s14 "But when it swims," — jet swim: mantle first, arms trailing, speed lines
registerShot('s14', { kind: '3d',
  init(T) { return sunSea(T, { seed: 18 }); },
  draw(s, t, info) { s.sea.update(t); const p = ease.inOut(prog(t, 0, info.dur + 0.3));
    s.o.rotation.set(0, 0, -1.25); s.o.position.set(lerp(-3.2, 2.4, p), 1.2 + lerp(-0.2, 0.9, p), 0);
    s.o.update(t, { swim: 1, lid: 0.35, mouth: 'o', breathe: 3, look: [0.5, 0.3] });
    camMove(s.stage, t, [[0, { pos: [-1.6, 2.2, 6.4], look: [-1.0, 1.6, 0], fov: 38 }], [info.dur, { pos: [1.2, 2.5, 6.4], look: [1.4, 2.0, 0], fov: 38 }]]); },
  overlay(g, t, info, s) { look(g, t); fxr(g, t, s, [{ fx: 'speedlines', at: 0.0 }]); chip(g, 'SWIMMING', E.W / 2, E.H * 0.17, t - 0.1, { size: 64, color: '#ffffff', rot: -3 }); },
});
// s15 "that body heart goes quiet." — x-ray while swimming: the body heart greys out and stops; the gill hearts keep going
registerShot('s15', { kind: '3d',
  init(T) { return sunSea(T, { seed: 19 }); },
  draw(s, t, info) { s.sea.update(t); const q = at(info, 'quiet', 1.0); const off = ease.inOut(prog(t, q - 0.6, q));
    s.o.rotation.set(0, 0, -0.35); s.o.position.set(lerp(-0.4, 0.4, t / info.dur), 0.5, 0);
    s.o.update(t, { swim: 0.8, xray: 1, hearts: 1, beat: 1.6, bodyHeart: 1 - off, gillHearts: 1, lid: 0.3, mouth: 'smile', breathe: 2 });
    camMove(s.stage, t, [[0, { pos: [0.4, 2.8, 4.2], look: [0.1, 2.1, -0.2], fov: 34 }], [info.dur, { pos: [0.6, 2.75, 3.8], look: [0.3, 2.1, -0.2], fov: 34 }]]); },
  overlay(g, t, info, s) { look(g, t); const q = at(info, 'quiet', 1.0); const c = anchor(s.stage, s.o.heartPos(0));
    stamp(g, 'PAUSED', c.x, c.y - 210, t - q, { size: 70, rot: -8, color: '#5a6a8a' });
    fxr(g, t, s, [{ fx: 'zzz', on: s.o.heartPos(0), at: q + 0.1 }]); },
});

// s16 "And the blood is blue," — the octopus holds up a test tube of glowing blue blood
registerShot('s16', { kind: '3d',
  init(T) { const s = sunSea(T, { seed: 20 }); s.tube = testTube({ h: 0.8, r: 0.13 }); s.stage.add(s.tube); return s; },
  draw(s, t, info) { s.sea.update(t); const bl = at(info, 'blue', 1.0); const up = ease.outBack(prog(t, 0, 0.45));
    s.o.update(t, { lid: 0.15, mouth: 'smile', spread: 1.25, curl: 1.0, look: [0.4, 0.4], arms: { 7: { spread: lerp(1.3, 1.9, up), curl: lerp(1.0, 1.6, up), wave: 0.15 } } });
    const tp = s.o.armTip(7); s.tube.position.set(tp.x + 0.1, tp.y - 0.35, tp.z + 0.1); s.tube.rotation.z = -0.15 + Math.sin(t * 2) * 0.05;
    s.tube.liquid.emissiveIntensity = 0.4 + 0.5 * ease.out(prog(t, bl, bl + 0.3));
    camMove(s.stage, t, [[0, { pos: [0.5, 2.3, 7.4], look: [0.4, 1.5, 0], fov: 36 }], [info.dur, { pos: [0.5, 2.3, 6.8], look: [0.4, 1.55, 0], fov: 36 }]]); },
  overlay(g, t, info, s) { look(g, t); const bl = at(info, 'blue', 1.0); const c = anchor(s.stage, s.tube, { height: 1.2 });
    chip(g, 'BLUE BLOOD', E.W / 2, E.H * 0.17, t - bl, { size: 68, color: '#7ad0ff', rot: -3 });
    fxr(g, t, s, [{ fx: 'sparkle', on: s.tube, at: bl, scale: 0.7, color: '#7ad0ff' }]); },
});
// s17 "because it carries oxygen with copper, not iron." — INSERT 2: COPPER (not iron)
const tubeScene = { init(T) { const s = sunSea(T, { seed: 21 }); return s; },
  draw(s, t) { s.sea.update(t); s.o.update(t, { xray: 0.6, hearts: 1, lid: 0.2, spread: 1.3, curl: 1.0 }); camMove(s.stage, t, [[0, { pos: [0, 2.2, 6.0], look: [0, 1.6, 0], fov: 36 }], [3, { pos: [0, 2.2, 5.5], look: [0, 1.6, 0], fov: 36 }]]); } };
insertShot('s17', { scene: tubeScene, dim: 0.55, insert: { type: 'bigtext', kicker: 'ITS BLOOD CARRIES OXYGEN WITH', title: 'COPPER', lines: ['not iron, like ours'], color: '#ff9a4a' } });

// s18 "In cold water with little oxygen, copper actually works better." — icy deep water; COLD / LOW OXYGEN; COPPER WINS
registerShot('s18', { kind: '3d',
  init(T) { return coldSea(T); },
  draw(s, t, info) { s.sea.update(t); const cp = at(info, 'copper', 1.6), bt = at(info, 'better', 2.6); const close = t > cp - 0.05;
    s.o.position.set(0, 0.1 + Math.sin(t * 1.4) * 0.06, 0); s.o.update(t, { lid: close ? 0.35 : 0.2, brow: close ? 0.35 : 0, mouth: 'smile', spread: 1.2, curl: 1.0, wave: 0.8, look: close ? [0.2, -0.1] : [-0.4, 0.3] });
    if (!close) camMove(s.stage, t, [[0, { pos: [0, 2.6, 8.4], look: [0, 1.5, 0], fov: 38 }], [cp, { pos: [0, 2.5, 7.6], look: [0, 1.5, 0], fov: 38 }]]);
    else camMove(s.stage, t, [[cp, { pos: [0.35, 2.3, 4.6], look: [0, 1.75, 0], fov: 34 }], [info.dur, { pos: [0.25, 2.3, 4.1], look: [0, 1.75, 0], fov: 34 }]]); },
  overlay(g, t, info, s) { look(g, t, { ray: '#cfefff', k: 0.12 }); const cd = at(info, 'cold', 0.2), li = at(info, 'little', 0.7), bt = at(info, 'better', 2.6), cp = at(info, 'copper', 1.6);
    // drifting snow-like specks
    g.save(); g.fillStyle = 'rgba(235,248,255,0.8)'; for (let i = 0; i < 40; i++) { const x = (i * 137 + t * 30 * ((i % 3) + 1)) % E.W, y = (i * 263 + t * 60) % E.H; g.beginPath(); g.arc(x, y, 3 + (i % 3), 0, 7); g.fill(); } g.restore();
    if (t < cp) { chip(g, 'COLD', E.W / 2 - 200, E.H * 0.17, t - cd, { size: 64, color: '#bfe8ff', rot: -5 }); chip(g, 'LITTLE OXYGEN', E.W / 2 + 120, E.H * 0.24, t - li, { size: 56, color: '#ffffff', rot: 4 }); }
    stamp(g, 'COPPER WINS', E.W / 2, E.H * 0.2, t - bt, { size: 80, rot: -6, color: '#d8742a' });
    fxr(g, t, s, [{ fx: 'sparkle', on: 'o', at: bt, scale: 0.8 }, { fx: 'flash', at: cp, dur: 0.1 }]); },
});

// s19 "9 brains, 3 hearts, blue blood..." — recap: hard cuts on each beat, a chip per beat
registerShot('s19', { kind: '3d',
  init(T) { return sunSea(T, { seed: 22 }); },
  draw(s, t, info) { s.sea.update(t); const h = at(info, 'hearts', 0.7), b = at(info, 'blue', 1.4);
    const ph = t < h - 0.08 ? 0 : t < b - 0.08 ? 1 : 2;
    s.o.update(t, { xray: ph === 1 ? 1 : 0, hearts: ph === 1 ? 1 : 0, brain: 1, ganglia: ph === 0 ? 8 : 0, beat: 2, lid: 0.15, mouth: 'smile', spread: 1.35, curl: 1.3, wave: 1.2 });
    const C = [{ pos: [0, 3.0, 6.2], look: [0, 1.1, 0], fov: 38 }, { pos: [0.4, 2.8, 4.1], look: [0, 2.1, 0], fov: 34 }, { pos: [-0.5, 1.6, 5.4], look: [0, 1.6, 0], fov: 36 }][ph];
    const st = [0, h - 0.08, b - 0.08][ph]; camMove(s.stage, t, [[st, C], [st + 1.2, { ...C, pos: [C.pos[0], C.pos[1], C.pos[2] - 0.35] }]]); },
  overlay(g, t, info, s) { look(g, t); const n = at(info, '9', 0.05), h = at(info, 'hearts', 0.7), b = at(info, 'blue', 1.4);
    chip(g, '9 BRAINS', E.W / 2 - 170, E.H * 0.15, t - n, { size: 60, color: '#ff9ad0', rot: -5 });
    chip(g, '3 HEARTS', E.W / 2 + 170, E.H * 0.21, t - h, { size: 60, color: '#ff5a4a', rot: 4 });
    chip(g, 'BLUE BLOOD', E.W / 2, E.H * 0.27, t - b, { size: 60, color: '#7ad0ff', rot: -3 });
    if (t > b - 0.08) { const c = anchor(s.stage, s.o); g.save(); g.globalCompositeOperation = 'screen'; const gr = g.createRadialGradient(c.cx, c.cy, 0, c.cx, c.cy, 520); gr.addColorStop(0, 'rgba(60,150,255,0.45)'); gr.addColorStop(1, 'rgba(60,150,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, E.W, E.H); g.restore(); }
    fxr(g, t, s, [{ fx: 'flash', at: h - 0.08, dur: 0.08 }, { fx: 'flash', at: b - 0.08, dur: 0.08 }]); },
});
// s20 "and zero bones." — PAYOFF: it pours itself through a hole barely bigger than its beak, pops out: "0 BONES"
registerShot('s20', { kind: '3d',
  init(T) { const s = sunSea(T, { seed: 23, clear: 3 }); s.rock = holeRock({ w: 3.6, h: 3.0, hole: 0.34, holeY: 1.35 }); s.stage.add(s.rock); return s; },
  draw(s, t, info) { s.sea.update(t); const z0 = at(info, 'zero', 0.3), bn = at(info, 'bones', 0.8);
    const p1 = ease.inOut(prog(t, 0, z0 + 0.15)), p2 = ease.inOut(prog(t, z0 + 0.15, bn)), pop = ease.outBack(prog(t, bn, bn + 0.4));
    const z = t < z0 + 0.15 ? lerp(-1.3, -0.25, p1) : t < bn ? lerp(-0.25, 0.08, p2) : lerp(0.08, 0.75, ease.out(prog(t, bn, bn + 0.4)));
    const sq = t < z0 + 0.15 ? lerp(1, 0.45, p1) : t < bn ? 0.45 : lerp(0.45, 1, pop);
    s.o.rotation.set(0, 0, 0); s.o.position.set(0, 0.2, z);
    s.o.update(t, { squash: [sq, sq, 1 + (1 - sq) * 0.6], swim: t < bn ? 0.8 : 0, lid: t < bn ? 0.55 : 0.12, mouth: t < bn ? 'o' : 'smile', brow: t < bn ? -0.3 : 0.2, spread: 1.3, curl: 1.2, breathe: 2 });
    camMove(s.stage, t, [[0, { pos: [0.9, 1.7, 5.2], look: [0, 1.3, 0], fov: 36 }], [bn, { pos: [0.7, 1.7, 4.8], look: [0, 1.3, 0], fov: 36 }], [info.dur, { pos: [0.4, 2.2, 7.6], look: [0, 1.4, 0.5], fov: 36 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: bn, amp: 0.05, dur: 0.25 }]); },
  overlay(g, t, info, s) { look(g, t); const bn = at(info, 'bones', 0.8), z0 = at(info, 'zero', 0.3);
    stamp(g, '0 BONES', E.W / 2, E.H * 0.18, t - bn, { size: 100, rot: -7, color: '#e8402a' });
    fxr(g, t, s, [{ fx: 'sweat', on: 'o', at: z0 - 0.1, until: bn }, { fx: 'flash', at: bn, dur: 0.12 }, { fx: 'sparkle', on: 'o', at: bn + 0.05, scale: 0.8 }]); },
});
// s21 "Subscribe for more." — back in deep water; the camera lands on frame 1's exact framing -> loops into s01
registerShot('s21', { kind: '3d',
  init(T) { return darkSea(T); },
  draw(s, t, info) { s.sea.update(t); const T0 = t - info.dur;   // pose = s01's pose at its t = 0 at the very end
    heroPose(s, T0); s.o.update(T0 + 2.5, { spread: 1.25, curl: 1.0, wave: 1.6, lid: 0.15, mouth: 'smile' });
    camMove(s.stage, t, [[0, { pos: [0.3, 1.9, 5.6], look: [0, 1.35, 0], fov: 36 }], [info.dur, F1]], ease.inOut); },
  overlay(g, t, info, s) { look(g, t, { k: 0.1 }); },
});
