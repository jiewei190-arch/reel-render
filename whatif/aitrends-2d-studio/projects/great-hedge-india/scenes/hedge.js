// The Great Hedge of India — 17 shots, Toon 3D + BEANMEN effects. WTF at the scale and the forgetting; respectful to the
// people who lived along it and worked on it (no jokes about guards or villagers, no caricature).
import { registerShot, ease, prog, clamp, lerp, noise } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, walk, point } from '/kits/toon3d/rig.js';
import { reactions, shakeCam, project } from '/kits/toon3d/react.js';
import { drawInsert, dimScene } from '/kits/toon3d/insert.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import {
  at, THREE, toonStage, hedge, plains, officer, customsMan, villager, conservator, horse, mount, saltSack, saltPile, customsPost,
  library, hookText, stamp, indiaMap, historyBook, tripsCard, PR, rbox, cyl, ball, toon, insT, CARD_INK, rng,
} from './_lib.js';

const RAYS = { rays: { from: [-80, -60], strength: 0.7 }, tint: '#ffd49a' };
const soft = { rays: { from: [-80, -60], strength: 0.4 }, tint: '#ffe0b0' };
const HOOK = [[['a', '#ffffff'], ['2,500-mile', '#ffd25a'], ['barrier', '#ffffff']], [['then', '#ffffff'], ['FORGOTTEN', '#ff5a4a']]];

// ---------------------------------------------------------------- the hero flyover (s01 = frame 1, s17 = the loop)
// hedge along x = 0 into -Z, road at x = 3.6. Camera starts high on the road side, flying down the line.
const FLY0 = { pos: [8.5, 6.2, 16], look: [-1.0, 1.6, -40], fov: 46 }, FLY1 = { pos: [7.2, 5.4, 4], look: [-1.0, 1.6, -52], fov: 44 };
function flySet(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: 46, shadowSize: 16, target: [2, 0, -6] });
  const env = plains(st, { seed: 3, fogNear: 50, fogFar: 300 });
  const hg = hedge({ state: o.state || 'live', seed: 5, z0: o.z0 ?? 40, z1: o.z1 ?? -420, near: 45 }); st.add(hg);
  return { stage: st, env, hg };
}

// s01 — HOOK. The endless thorn hedge to the horizon, a British officer on horseback tiny beside it, camera flying along.
registerShot('s01', { kind: '3d',
  init(T) { const s = flySet(T); const h = horse(); h.position.set(3.6, 0, -2); h.rotation.y = Math.PI; s.stage.add(h); const rd = mount(h, officer({ seed: 5 })); return { ...s, h, rd }; },
  draw(s, t, info) {
    s.env.update(t);
    s.h.position.z = -2 - t * 1.6; s.h.update(t, { walk: 1, speed: 1.4 }); s.rd.ridePose(t, { headTurn: lerp(0, -0.9, ease.inOut(prog(t, 1.2, 1.8))) });
    s.rd.face(EXPR.neutral, t);
    const cut = at(info, 'Then', 3.2) - 0.05;   // hard punch-in on "Then forgot it"
    if (t < cut) camMove(s.stage, t, [[0, FLY0], [info.dur, FLY1]], ease.linear);
    else { const zr = -2 - t * 1.6; s.stage.cam([7.4 - (t - cut) * 0.3, 3.1, zr - 5.6], [1.2, 2.9, zr + 3], 40); }
  },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); hookText(g, t, HOOK, { y: 300, size: 84, lh: 112, until: 3.5 }); },
});

// s02 — "British-ruled India, the 1800s." A wide plain, a whitewashed customs post, a customs man at the barrier.
function postSet(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 10, target: [0, 0, 0] });
  const env = plains(st, { seed: 7, road: false, trees: 18 });
  const rd = PR.fence ? null : null;
  const road = new THREE.Mesh(new THREE.PlaneGeometry(4, 400), toon('#c9a466')); road.rotation.x = -Math.PI / 2; road.position.set(2.8, 0.012, -150); st.add(road);
  const post = customsPost({ label: 'CUSTOMS' }); post.position.set(-1.6, 0, -2); st.add(post);
  return { stage: st, env, post };
}
registerShot('s02', { kind: '3d',
  init(T) { const s = postSet(T); const cm = customsMan({ seed: 9 }); cm.position.set(2.0, 0, 0.6); cm.rotation.y = -0.3; s.stage.add(cm); return { ...s, cm }; },
  draw(s, t, info) {
    s.env.update(t); s.cm.pose(addPose(POSE.attention, idle(t, 3, 0.5))); s.cm.face(EXPR.neutral, t);
    camMove(s.stage, t, [[0, { pos: [3.0, 3.4, 11], look: [0, 1.8, -2], fov: 44 }], [info.dur, { pos: [2.4, 3.0, 9.2], look: [0, 1.8, -2], fov: 42 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, RAYS);
    stamp(g, t, 'BRITISH INDIA', { at: 0.05, x: 330, y: 560, size: 62, color: '#ffffff', fill: '#2f4a6a', rot: -0.08 });
    stamp(g, t, '1800s', { at: at(info, '1800s', 0.9) - 0.1, x: 760, y: 680, size: 84, color: '#e23b2e', fill: 'rgba(250,244,226,0.92)', rot: 0.1 });
  },
});

// s03 — "The goal? Taxing salt." Salt sacks and a pile of white salt; a TAX tag slaps on.
registerShot('s03', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 32, shadowSize: 5, target: [0, 0.6, 0] }); const env = plains(st, { seed: 9, road: false, trees: 10, fogNear: 30, fogFar: 160 });
    const sacks = [[-1.1, 0, 0.2, 'SALT'], [0.1, 0, -0.5, ''], [1.25, 0, 0.1, 'SALT']].map(([x, y, z, l], i) => { const sk = saltSack({ label: l }); sk.position.set(x, y, z); sk.rotation.y = -(x) * 0.12; st.add(sk); return sk; });
    const pile = saltPile({ r: 0.75, h: 0.7 }); pile.position.set(0.1, 0, 1.0); st.add(pile);
    return { stage: st, env, sacks, pile };
  },
  draw(s, t, info) { s.env.update(t); camMove(s.stage, t, [[0, { pos: [0.4, 2.8, 9.4], look: [0, 0.9, 0], fov: 38 }], [info.dur, { pos: [0.3, 2.6, 8.2], look: [0, 0.9, 0], fov: 37 }]]); },
  overlay(g, t, info, s) {
    sunnyLook(g, t, soft);
    const q = at(info, 'goal', 0.0); reactions(g, t, s, [{ fx: 'question', on: [0.1, 1.5, 0.8], at: q, until: at(info, 'Taxing', 0.8) - 0.05, scale: 1.0 }]);
    stamp(g, t, 'SALT TAX', { at: at(info, 'Taxing', 0.8) - 0.05, x: 540, y: 560, size: 120, color: '#ffffff', fill: '#b8322a', rot: -0.08 });
  },
});

// s04 — "To stop salt smugglers," The barrier pole drops in front of a bullock-less hand cart of sacks; a customs man checks it.
registerShot('s04', { kind: '3d',
  init(T) {
    const s = postSet(T); const cm = customsMan({ seed: 11, skin: 'tan' }); cm.position.set(3.4, 0, 3.0); cm.rotation.y = -1.2; s.stage.add(cm);
    const vg = villager({ seed: 21, skin: 'brown', color: '#e6d6b4' }); vg.position.set(3.0, 0, 6.2); vg.rotation.y = Math.PI; s.stage.add(vg);
    const crt = PR.cart(); crt.position.set(3.0, 0, 7.6); crt.rotation.y = Math.PI; s.stage.add(crt);
    const sk = saltSack({}); sk.scale.setScalar(0.7); sk.position.set(3.0, 1.0, 8.0); s.stage.add(sk);
    return { ...s, cm, vg, crt };
  },
  draw(s, t, info) {
    s.env.update(t); const drop = ease.outBack(prog(t, 0.15, 0.5)); s.post.pole.rotation.z = lerp(1.35, 0, drop);
    s.cm.pose(addPose(point(POSE.stand, 'R', ease.out(prog(t, 0.4, 0.8)), { up: 0.1 }), idle(t, 4, 0.4))); s.cm.face(EXPR.neutral, t);
    s.vg.pose(addPose(POSE.relaxed, idle(t, 6, 0.4))); s.vg.face(mixExpr(EXPR.neutral, EXPR.worried, 0.4), t);
    camMove(s.stage, t, [[0, { pos: [10.5, 3.4, 12.5], look: [2.0, 1.4, 3.5], fov: 42 }], [info.dur, { pos: [9.8, 3.2, 11.2], look: [2.0, 1.4, 3.5], fov: 40 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, soft); stamp(g, t, 'STOP', { at: 0.35, x: 300, y: 540, size: 96, color: '#ffffff', fill: '#c0392b', rot: -0.1 }); },
});

// s05 — "they built a customs line about 2,500 miles long." Parchment map: the line draws itself across India; ~2,500 MILES.
registerShot('s05', { kind: '3d',
  init(T) { const s = flySet(T); return s; },
  draw(s, t, info) { s.env.update(t); camMove(s.stage, t, [[0, { pos: [0, 40, 30], look: [0, 0, -40], fov: 50 }], [info.dur, { pos: [0, 38, 22], look: [0, 0, -50], fov: 50 }]], ease.linear); },
  overlay(g, t, info, s) {
    dimScene(g, 6, 0.45);
    indiaMap(g, t, { y: 720, W: 720, H: 780, drawAt: 0.15, drawDur: Math.max(1.0, at(info, '2,500', 1.6) - 0.1), title: 'THE CUSTOMS LINE', foot: '≈ 2,500 MILES', footAt: at(info, '2,500', 1.6) - 0.05 });
  },
});

// s06 — "Hundreds of miles of it was a living hedge of thorny bushes," The hedge grows up out of the bank, thorns and all.
registerShot('s06', { kind: '3d',
  init(T) { const s = flySet(T); return s; },
  draw(s, t, info) {
    s.env.update(t); const gr = ease.outBack(prog(t, 0.1, 1.1)); s.hg.scale.y = lerp(0.08, 1, gr);
    camMove(s.stage, t, [[0, { pos: [5.5, 1.2, 6], look: [0, 2.2, -10], fov: 50 }], [info.dur, { pos: [5.0, 1.4, 3.2], look: [0, 2.6, -10], fov: 48 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, RAYS);
    stamp(g, t, 'A LIVING HEDGE', { at: at(info, 'living', 0.9) - 0.1, x: 540, y: 470, size: 78, color: '#ffffff', fill: '#3f6b34', rot: -0.06 });
    reactions(g, t, s, [{ fx: 'sparkle', on: [0.0, 3.6, -2.0], at: 1.0, scale: 1.4 }]);
  },
});

// s07 — "up to 12 feet high." A customs man next to the hedge; a 12 FT ruler snaps up beside it (low angle).
registerShot('s07', { kind: '3d',
  init(T) { const s = flySet(T); const cm = customsMan({ seed: 13, skin: 'brown' }); cm.position.set(2.2, 0, 0); cm.rotation.y = -0.5; s.stage.add(cm); s.hg.scale.y = 4.9 / 4.4; return { ...s, cm }; },
  draw(s, t, info) {
    s.env.update(t); s.cm.pose(addPose(POSE.attention, idle(t, 2, 0.4))); s.cm.face(mixExpr(EXPR.neutral, EXPR.suspicious, 0.2), t);
    camMove(s.stage, t, [[0, { pos: [6.6, 1.1, 7.2], look: [0.6, 2.6, -1], fov: 46 }], [info.dur, { pos: [6.0, 1.0, 6.2], look: [0.6, 2.7, -1], fov: 46 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, soft);
    const k = ease.outBack(prog(t, at(info, '12', 0.3) - 0.15, at(info, '12', 0.3) + 0.2)); if (k <= 0) return;
    const a = project(s.stage, [1.0, 0, 1.6]), b = project(s.stage, [1.0, 4.9, 1.6]); const top = lerp(a.y, b.y, k);
    g.save(); g.strokeStyle = CARD_INK; g.lineWidth = 26; g.lineCap = 'round'; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(a.x, top); g.stroke();
    g.strokeStyle = '#ffd25a'; g.lineWidth = 14; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(a.x, top); g.stroke();
    for (let i = 1; i <= 12; i++) { const y = lerp(a.y, b.y, i / 12); if (y < top) continue; g.strokeStyle = CARD_INK; g.lineWidth = 6; g.beginPath(); g.moveTo(a.x - (i % 3 ? 18 : 34), y); g.lineTo(a.x + (i % 3 ? 18 : 34), y); g.stroke(); }
    g.restore(); insT(g, '12 FT', a.x + 150, top + 10, 92, { color: '#ffd25a', stroke: CARD_INK, a: clamp(k) });
  },
});

// s08 — "People compared it to the Great Wall of China." VERSUS card over the blurred hedge from above.
registerShot('s08', { kind: '3d',
  init(T) { const s = flySet(T); return s; },
  draw(s, t, info) { s.env.update(t); camMove(s.stage, t, [[0, { pos: [10, 14, 10], look: [0, 2, -30], fov: 46 }], [info.dur, { pos: [9, 13, 4], look: [0, 2, -36], fov: 46 }]], ease.linear); },
  overlay(g, t, info, s) { sunnyLook(g, t, soft); const c = at(info, 'Great', 0.8) - 0.15; if (t > c) { dimScene(g, 6, 0.25); drawInsert(g, { type: 'versus', title: 'COMPARED TO...', lines: ['GREAT HEDGE', 'GREAT WALL'], colorL: '#3f7a3a', color: '#b8322a' }, t - c); } },
});

// s09 — "At its peak, in 1872, more than 14,000 men guarded it." Customs men posted along the hedge to the horizon. 14,000+.
registerShot('s09', { kind: '3d',
  init(T) {
    const s = flySet(T); const skins = ['brown', 'tan', 'dark', 'olive', 'brown', 'tan'];
    const men = skins.map((sk, i) => { const m = customsMan({ seed: 40 + i, skin: sk, moustache: i % 2 === 0 }); m.position.set(2.2, 0, 2 - i * 5.5); m.rotation.y = -1.25; s.stage.add(m); return m; });
    // far: simple toon figures every 6 units to the haze
    const far = new THREE.Group(); s.stage.add(far); const bodyM = toon('#b59a68'), headM = toon('#7a4e32');
    for (let i = 0; i < 40; i++) { const z = -32 - i * 6; const f = new THREE.Group(); const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.9, 4, 8), bodyM); b.position.y = 0.95; const h = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 8), headM); h.position.y = 1.95; f.add(b, h); f.position.set(2.2, 0, z); far.add(f); }
    return { ...s, men };
  },
  draw(s, t, info) {
    s.env.update(t); s.men.forEach((m, i) => { m.pose(addPose(POSE.attention, idle(t, 7 + i, 0.4))); m.face(EXPR.neutral, t); });
    camMove(s.stage, t, [[0, { pos: [6.5, 3.0, 8.5], look: [0.5, 1.6, -18], fov: 42 }], [info.dur, { pos: [6.0, 2.8, 6.0], look: [0.5, 1.6, -20], fov: 40 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, soft);
    stamp(g, t, 'PEAK: 1872', { at: at(info, '1872,', 0.6) - 0.1, x: 540, y: 330, size: 72, color: '#e23b2e', fill: 'rgba(250,244,226,0.92)', rot: -0.07 });
    const c = at(info, '14,000', 1.4) - 0.15; if (t > c) { dimScene(g, 3, 0.2); drawInsert(g, { type: 'counter', title: 'MORE THAN', value: 14000, from: 0, suffix: '+', lines: ['MEN ON THE LINE'], color: '#ffcf4a' }, t - c); }
  },
});

// s10 — "But here's the twist..." Close on the officer on horseback: he stops and turns to us. The light starts to drop.
registerShot('s10', { kind: '3d',
  init(T) { const s = flySet(T); const h = horse(); h.position.set(3.6, 0, 0); h.rotation.y = Math.PI * 0.85; s.stage.add(h); const rd = mount(h, officer({ seed: 5 })); return { ...s, h, rd }; },
  draw(s, t, info) {
    s.env.update(t); const stop = ease.out(prog(t, 0, 0.5)); s.h.update(t, { walk: 1 - stop, speed: 1.4, headUp: stop });
    const turn = ease.inOut(prog(t, 0.25, 0.7)); s.rd.ridePose(t, { headTurn: lerp(0, -0.9, turn), twist: -turn * 0.35 }); s.rd.face(mixExpr(EXPR.neutral, EXPR.suspicious, turn), t);
    camMove(s.stage, t, [[0, { pos: [10.0, 4.6, -4.2], look: [3.6, 3.3, 0], fov: 34 }], [info.dur, { pos: [9.2, 4.5, -3.8], look: [3.6, 3.4, 0], fov: 31 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#ffa860', tintAmount: lerp(0.15, 0.4, prog(t, 0, info.dur)) });
    g.save(); g.fillStyle = `rgba(20,10,30,${0.25 * prog(t, 0.2, info.dur)})`; g.fillRect(0, 0, 1080, 1920); g.restore();
    stamp(g, t, 'BUT...', { at: 0.05, x: 540, y: 420, size: 120, color: '#ffffff', fill: '#b8322a', rot: -0.06 });
  },
});

// s11 — "In 1879, it was abandoned." The same stretch at dusk: hedge gone brown, the post empty, the barrier pole up.
registerShot('s11', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'dusk', fov: 44, shadowSize: 14, target: [0, 0, -4] }); const env = plains(st, { seed: 3, sky: { top: '#4a4a7a', mid: '#c98a72', horizon: '#f2b07a' }, fogC: '#d8a080', fogNear: 40, fogFar: 260 });
    const hg = hedge({ state: 'brown', seed: 5, z0: 40, z1: -420, near: 45 }); st.add(hg);
    const post = customsPost({ label: 'CUSTOMS' }); post.position.set(-4.5, 0, -3); post.rotation.y = 0.0; st.add(post); post.pole.rotation.z = 1.35;
    return { stage: st, env, hg, post };
  },
  draw(s, t, info) { s.env.update(t); camMove(s.stage, t, [[0, { pos: [8.0, 4.2, 9.0], look: [-1.0, 1.5, -14], fov: 46 }], [info.dur, { pos: [7.5, 4.0, 7.2], look: [-1.0, 1.5, -15], fov: 44 }]]); },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#c07a8a', tintAmount: 0.18 });
    stamp(g, t, 'ABANDONED', { at: at(info, 'abandoned.', 0.6) - 0.1, x: 540, y: 470, size: 100, color: '#ffffff', fill: '#5a4a6a', rot: -0.07 });
    stamp(g, t, '1879', { at: 0.05, x: 250, y: 300, size: 82, color: '#ffd25a', fill: 'rgba(30,20,40,0.6)', rot: -0.12 });
  },
});

// s12 — "And it was forgotten so completely, standard histories skipped it." A history book: the chapter list has a gap.
registerShot('s12', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'warm', fov: 40, shadowSize: 8, target: [0, 1.5, 0] }); const lib = library(st); return { stage: st, lib }; },
  draw(s, t, info) { camMove(s.stage, t, [[0, { pos: [0, 3.2, 7.5], look: [0, 3.0, -2], fov: 44 }], [info.dur, { pos: [0, 3.1, 6.6], look: [0, 3.0, -2], fov: 42 }]]); },
  overlay(g, t, info, s) {
    dimScene(g, 7, 0.45);
    const sk = at(info, 'skipped', 2.4); const zoom = t < sk - 0.1 ? 1 : 1.1;   // punch-in on "skipped"
    g.save(); g.translate(540, 900); g.scale(zoom, zoom); g.translate(-540, -900);
    historyBook(g, t, { y: 900, gapShow: at(info, 'standard', 1.6) - 0.1 }); g.restore();
    stamp(g, t, 'FORGOTTEN', { at: at(info, 'forgotten', 0.5) - 0.1, x: 540, y: 340, size: 96, color: '#e23b2e', fill: 'rgba(250,244,226,0.95)', rot: -0.06 });
  },
});

// s13 — "In the 1990s, a London library conservator" — the library: a conservator with glasses finds a mention in an old book.
registerShot('s13', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'warm', fov: 36, shadowSize: 8, target: [0, 1.5, 0] }); const lib = library(st);
    const c = conservator(); c.position.set(0, 0, 2.0); c.rotation.y = Math.PI; st.add(c);
    const bk = rbox(0.7, 0.05, 0.5, '#7a2a22', 0, 0, 0, 0.02); st.add(bk); return { stage: st, lib, c, bk };
  },
  draw(s, t, info) {
    const look = ease.inOut(prog(t, 0.9, 1.3));
    s.c.rotation.y = lerp(Math.PI, Math.PI * 0.8, look); s.c.pose(addPose(POSE.holdFront, { ...idle(t, 4, 0.4), headNod: lerp(0.35, 0.05, look) })); s.c.face(mixExpr(EXPR.neutral, EXPR.shocked, look), t);
    s.c.hand.R.getWorldPosition(s.bk.position); s.bk.position.x += 0.25; s.bk.rotation.set(-0.7, 0, 0);
    camMove(s.stage, t, [[0, { pos: [1.2, 3.0, -2.6], look: [0, 2.4, 2.0], fov: 38 }], [info.dur, { pos: [1.0, 2.9, -1.8], look: [0, 2.4, 2.0], fov: 36 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#ffcf8a' });
    stamp(g, t, '1990s', { at: 0.05, x: 250, y: 330, size: 84, color: '#e23b2e', fill: 'rgba(250,244,226,0.92)', rot: -0.1 });
    stamp(g, t, 'LONDON', { at: at(info, 'London', 0.6) - 0.1, x: 780, y: 460, size: 64, color: '#ffffff', fill: '#2f4a6a', rot: 0.08 });
    reactions(g, t, s, [{ fx: 'exclaim', on: 'c', at: 1.0, until: info.dur, color: '#ff3b30' }]);
  },
});

// s14 — "made three trips to India just to find it." On the dusty plain with a map: TRIP 1, 2, 3.
function searchSet(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 12, target: [0, 0, 0] }); const env = plains(st, { seed: 12, road: false, trees: 20 });
  const c = conservator(); st.add(c); const mp = rbox(0.7, 0.5, 0.02, '#efe0bc', 0, 0, 0, 0.01); st.add(mp); return { stage: st, env, c, mp };
}
registerShot('s14', { kind: '3d',
  init(T) { const s = searchSet(T); s.c.position.set(0, 0, 0); return s; },
  draw(s, t, info) {
    s.env.update(t); s.c.position.z = -t * 0.9; s.c.pose(addPose(walk(t, { speed: 1.5, amp: 0.7 }), { armR: [1.1, 0.2, 0.3], elbowR: 1.2, headTurn: Math.sin(t * 1.6) * 0.6 })); s.c.face(mixExpr(EXPR.neutral, EXPR.suspicious, 0.4), t);
    s.c.hand.R.getWorldPosition(s.mp.position); s.mp.position.y += 0.15; s.mp.rotation.set(-0.3, 0, 0);
    camMove(s.stage, t, [[0, { pos: [2.2, 2.6, 6.0], look: [0, 1.8, -1], fov: 40 }], [info.dur, { pos: [2.0, 2.5, 2.4], look: [0, 1.8, -4], fov: 40 }]], ease.linear);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); tripsCard(g, t, { y: 470, at0: Math.max(0.1, at(info, 'three', 0.3) - 0.1), gap: 0.42 }); },
});

// s15 — "What he found:" — the camera rises over the plain to reveal a single long low bank of earth in the grass.
function moundSet(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: 46, shadowSize: 16, target: [2, 0, -6] }); const env = plains(st, { seed: 3, fogNear: 50, fogFar: 300 });
  const m = hedge({ state: 'mound', seed: 5, z0: 9, z1: -22 }); st.add(m); return { stage: st, env, m };
}
registerShot('s15', { kind: '3d',
  init(T) { const s = moundSet(T); s.c = conservator(); s.c.position.set(0.3, 0.95, 2); s.c.rotation.y = 0.4; s.stage.add(s.c); return s; },
  draw(s, t, info) {
    s.env.update(t); s.c.pose(addPose(POSE.stand, idle(t, 3, 0.4))); s.c.face(mixExpr(EXPR.neutral, EXPR.sad, 0.25), t);
    camMove(s.stage, t, [[0, { pos: [3.5, 1.4, 7.5], look: [0.3, 1.6, 2], fov: 40 }], [info.dur, { pos: [6.5, 5.0, 11], look: [0.3, 0.8, -2], fov: 44 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, soft);
    stamp(g, t, 'ONE SMALL EMBANKMENT', { at: at(info, 'embankment.', 1.2) - 0.25, x: 540, y: 400, size: 64, color: '#ffffff', fill: '#7a5a34', rot: -0.05 });
  },
});

// s16 — "It may be all that's left." PAYOFF + LOOP: the same flyover as frame 1, but there is only the low embankment.
// Ends on frame 1's exact camera, so the cut back to s01 brings the whole hedge back.
registerShot('s16', { kind: '3d',
  init(T) { const s = flySet(T, { state: 'mound', z0: 9, z1: -22 }); return s; },
  draw(s, t, info) { s.env.update(t); camMove(s.stage, t, [[0, { pos: [6.2, 3.0, 2], look: [-1.0, 0.6, -30], fov: 44 }], [info.dur, FLY0]], ease.inOut); },
  overlay(g, t, info, s) {
    sunnyLook(g, t, RAYS);
    stamp(g, t, "ALL THAT'S LEFT?", { at: at(info, 'all', 0.4) - 0.1, x: 540, y: 420, size: 86, color: '#ffffff', fill: '#b8322a', rot: -0.05, until: info.dur - 0.15 });
  },
});
