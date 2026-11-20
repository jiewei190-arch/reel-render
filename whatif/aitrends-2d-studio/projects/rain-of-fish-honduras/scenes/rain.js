// The Rain of Fish (Yoro, Honduras) — 12 shots, Toon 3D + BEANMEN effects. WTF, warm, curious; residents shown with respect.
// Framing: "residents say". In the present-day shots the fish are only ever ON THE GROUND, never shown falling from the sky.
import { registerShot, ease, prog, clamp, lerp } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, point, shrug, nod, walk } from '/kits/toon3d/rig.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { drawInsert, dimScene } from '/kits/toon3d/insert.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import {
  at, THREE, toonStage, fish, umbrella, holdUmbrella, UMB_POSE, resident, elder, kid, yoroStreet, scatterFish, bunting,
  hookText, stamp, rain, wash, spoutMap, undergroundBoard, legendCard, ball, cyl, rbox, PR,
} from './_lib.js';

const STORM_TINT = { rays: false, tint: '#9fb4cc', tintAmount: 0.18 };
const CLEAR = { rays: { from: [-70, -60], strength: 0.6 }, tint: '#ffd49a' };
const CARD_Y = 1920 * 0.405;
// a hard camera cut inside a shot at time `cut`: two separate moves A (before) and B (after)
function twoCam(st, t, dur, cut, A, B) { if (t < cut) camMove(st, t, [[0, A[0]], [cut, A[1]]], ease.out); else camMove(st, t - cut, [[0, B[0]], [dur - cut, B[1]]], ease.out); }

// the street crowd under umbrellas (s01 hook, s07, s12 payoff share it so the loop is seamless)
const UCOL = [['#d84a3a', '#f4efe2'], ['#2f6ab8', '#f4efe2'], ['#f2c230', '#e0533a'], ['#3aa860', '#f4efe2'], ['#7a4ab0', '#f2c230']];
function umbrellaCrowd(T, o = {}) {
  const st = toonStage(T, { light: 'day', fov: 40, shadowSize: 9, target: [0, 1, -1], exposure: 1.05 });
  const set = yoroStreet(st, { look: 'storm', water: true, seed: 5 });
  const spots = [[-2.3, 0.6, 0.35], [0.0, -0.9, 0], [2.4, 0.3, -0.35], [-1.1, -2.6, 0.2], [1.4, -2.9, -0.2]];
  const ppl = spots.map(([x, z, ry], i) => { const p = i === 3 ? kid(0) : resident(i); p.position.set(x, 0.06, z); p.rotation.y = ry; st.add(p); return p; });
  const umbs = ppl.map((p, i) => { const u = umbrella({ color: UCOL[i][0], color2: UCOL[i][1] }); st.add(u); return u; });
  const fs = o.fish === false ? [] : scatterFish(st, 16, [-3.6, 3.6, -4.5, 2.6], 4, 0.8);
  return { stage: st, set, ppl, umbs, fs };
}
function crowdPose(s, t, look) {   // look: 0 = down at the fish, 1 = up at the sky
  s.ppl.forEach((p, i) => {
    p.pose(addPose(POSE.stand, { ...UMB_POSE, ...idle(t, i + 2, 0.5), headNod: lerp(0.35, -0.45, look), headTurn: Math.sin(i * 1.7) * 0.25 }));
    p.face(mixExpr(i % 2 ? EXPR.shocked : EXPR.worried, EXPR.suspicious, look * 0.6), t);
    holdUmbrella(p, s.umbs[i], 0.1 + Math.sin(t * 1.3 + i) * 0.03);
  });
}
const HOOK_A = [{ pos: [0.4, 3.7, 9.8], look: [0, 1.3, -1], fov: 44 }, { pos: [0.2, 3.4, 8.6], look: [0, 1.2, -1], fov: 43 }];

// s01 — HOOK: a flooded street, rain, residents under umbrellas, fish scattered on the ground. Already moving at frame 1.
registerShot('s01', { kind: '3d',
  init(T) { return umbrellaCrowd(T); },
  draw(s, t, info) {
    s.set.update(t); crowdPose(s, t, 0); s.fs.forEach((f, i) => f.update(t, { flop: i % 3 ? 0.25 : 0.8 }));
    const cut = at(info, 'Every', 2.3) - 0.05;
    twoCam(s.stage, t, info.dur, cut, HOOK_A, [{ pos: [1.8, 2.3, 4.6], look: [0.0, 1.0, -0.8], fov: 40 }, { pos: [1.6, 2.2, 4.0], look: [0.0, 1.0, -0.8], fov: 40 }]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, STORM_TINT); rain(g, t, 1);
    hookText(g, t, ['THEY SAY IT RAINS FISH', 'EVERY YEAR'], { y: 290, colors: ['#ffffff', '#ffd25a'], sizes: [74, 92] });
    reactions(g, t, s, [{ fx: 'exclaim', on: s.ppl[1], at: 0.5, color: '#ff3b30', until: 1.6 }]);
  },
});

// s02 — "It's Yoro. Locals call it the Lluvia de Peces, the rain of fish." High wide street + church; title card.
registerShot('s02', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 42, shadowSize: 16, target: [0, 1, -8] });
    const set = yoroStreet(st, { look: 'clear', water: true, seed: 5 });
    const ppl = [0, 1, 2, 4].map((i, k) => { const p = resident(i); p.position.set(-3 + k * 2.1, 0.06, -6 - (k % 2) * 3); p.rotation.y = k % 2 ? Math.PI : 0.3; st.add(p); return p; });
    const fs = scatterFish(st, 14, [-4, 4, -14, 0], 9, 0.8);
    return { stage: st, set, ppl, fs };
  },
  draw(s, t, info) {
    s.set.update(t); s.fs.forEach((f, i) => f.update(t, { flop: i % 4 ? 0 : 0.5 }));
    s.ppl.forEach((p, i) => { p.pose(addPose(i % 2 ? walk(t + i, { speed: 1.2 }) : POSE.relaxed, idle(t, i, 0.5))); p.face(EXPR.neutral, t); if (i % 2) p.position.z -= 0.012; });
    camMove(s.stage, t, [[0, { pos: [0, 9, 10], look: [0, 1.5, -18], fov: 46 }], [info.dur, { pos: [0, 7.5, 6.5], look: [0, 1.6, -18], fov: 44 }]], ease.inOut);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, CLEAR);
    const c0 = at(info, 'Locals', 1.0) - 0.1;
    stamp(g, t, 'YORO, HONDURAS', { at: 0.05, until: c0, x: 540, y: 330, size: 80, color: '#ffffff', fill: '#2f6ab8', rot: -0.05 });
    if (t > c0) { dimScene(g, 6, 0.4); drawInsert(g, { type: 'bigtext', kicker: 'LOCALS CALL IT', title: 'LLUVIA DE PECES', size: 96, lines: [t > at(info, 'rain', 3.0) - 0.15 ? '"the rain of fish"' : ''], color: '#ffd25a' }, t - c0); }
  },
});

// s03 — "In the mid-year rainy season, a big storm rolls in..." Residents look up as the sky goes dark; lightning; rain starts.
registerShot('s03', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'day', fov: 40, shadowSize: 9, target: [0, 1.5, 0], exposure: 1.0 });
    const set = yoroStreet(st, { look: 'storm', seed: 7 });
    const a = resident(1); a.position.set(-0.9, 0.06, 0); a.rotation.y = 0.25; st.add(a);
    const b = elder(); b.position.set(1.0, 0.06, -0.4); b.rotation.y = -0.25; st.add(b);
    const k = kid(1); k.position.set(0.1, 0.06, 0.9); st.add(k);
    return { stage: st, set, a, b, k };
  },
  draw(s, t, info) {
    s.set.update(t);
    const up = ease.inOut(prog(t, 0.3, 0.9)), st0 = at(info, 'storm', 1.8);
    [s.a, s.b, s.k].forEach((p, i) => { p.pose(addPose(i === 2 ? mixPose(POSE.stand, POSE.armsUp, prog(t, st0 + 0.2, st0 + 0.5) * 0.4) : POSE.relaxed, { ...idle(t, i + 4, 0.4), headNod: -0.55 * up })); p.face(mixExpr(EXPR.neutral, EXPR.shocked, prog(t, st0, st0 + 0.2)), t); });
    camMove(s.stage, t, [[0, { pos: [0, 0.9, 5.0], look: [0, 3.2, -3], fov: 46 }], [info.dur, { pos: [0, 0.8, 4.2], look: [0, 3.6, -3], fov: 46 }]], ease.inOut);
    shakeCam(s.stage, t, [{ fx: 'shake', at: st0, amp: 0.04, dur: 0.4 }]);
  },
  overlay(g, t, info, s) {
    const st0 = at(info, 'storm', 1.8);
    wash(g, '#1c2638', 0.12 + 0.25 * prog(t, 0, st0));
    sunnyLook(g, t, STORM_TINT); rain(g, t, prog(t, st0, st0 + 0.6), { n: 180 });
    reactions(g, t, s, [{ fx: 'flash', at: st0, dur: 0.22, color: '#eef4ff' }, { fx: 'exclaim', on: 'k', at: st0 + 0.1, color: '#ff3b30' }]);
    stamp(g, t, 'RAINY SEASON', { at: at(info, 'rainy', 0.8) - 0.15, x: 540, y: 320, size: 74, color: '#ffffff', fill: '#3a4a66', rot: -0.06 });
  },
});

// s04 — "and when it clears, there are fish lying on the ground." Sun back, wet street; a woman + kid crouch over fish; punch-in.
registerShot('s04', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 8, target: [0, 0.5, 0] });
    const set = yoroStreet(st, { look: 'clear', water: true, seed: 8 });
    const a = resident(5); a.position.set(-1.2, 0.06, -0.8); a.rotation.y = 0.5; st.add(a);
    const k = kid(0); k.position.set(1.1, 0.06, -0.6); k.rotation.y = -0.6; st.add(k);
    const fs = scatterFish(st, 12, [-2.6, 2.6, -2.2, 0.1], 21, 0.85);
    const hero = fish({ seed: 77, scale: 1.1 }); hero.position.set(0.15, 0.08, 0.6); hero.rotation.y = 0.4; st.add(hero);
    return { stage: st, set, a, k, fs, hero };
  },
  draw(s, t, info) {
    s.set.update(t); s.fs.forEach((f, i) => f.update(t, { flop: i % 3 ? 0 : 0.6 })); s.hero.update(t, { flop: 0.9 });
    const f0 = at(info, 'fish', 1.2);
    const crouch = { lean: 0.5, kneeL: 1.1, kneeR: 1.1, bob: -0.45, headNod: 0.35 };
    s.a.pose(addPose(mixPose(POSE.relaxed, POSE.holdFront, 0.5), { ...crouch, ...idle(t, 3, 0.4) })); s.a.face(mixExpr(EXPR.neutral, EXPR.shocked, prog(t, f0, f0 + 0.2)), t);
    s.k.pose(addPose(point(POSE.stand, 'R', 1, { up: -0.6 }), { ...idle(t, 5, 0.6), headNod: 0.3 })); s.k.face(EXPR.grin, t);
    twoCam(s.stage, t, info.dur, f0 - 0.05, [{ pos: [0, 3.9, 7.8], look: [0, 0.9, -0.5], fov: 42 }, { pos: [0, 3.6, 7.0], look: [0, 0.9, -0.5], fov: 42 }],
      [{ pos: [0.5, 1.5, 3.1], look: [0.15, 0.3, 0.5], fov: 38 }, { pos: [0.45, 1.4, 2.8], look: [0.15, 0.3, 0.5], fov: 38 }]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, CLEAR);
    const f0 = at(info, 'fish', 1.2);
    reactions(g, t, s, [{ fx: 'exclaim', on: 'a', at: f0 - 0.6, until: f0 - 0.05, color: '#ff3b30' }, { fx: 'sparkle', on: 'hero', at: f0 + 0.05, scale: 0.6 }]);
    stamp(g, t, 'ON THE GROUND', { at: at(info, 'ground.', 2.0) - 0.15, x: 540, y: 330, size: 76, color: '#ffffff', fill: '#d8342c', rot: -0.05 });
  },
});

// s05 — "Residents say it's happened for over a hundred years." An older resident on the porch nods; 100+ YEARS.
registerShot('s05', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 36, shadowSize: 8, target: [-5, 1, 0] });
    const set = yoroStreet(st, { look: 'clear', seed: 5 });
    const e = elder(); e.position.set(-5.3, 0.06, 0.6); e.rotation.y = 1.35; st.add(e);
    const ch = PR.stool({ color: '#7a5032' }); ch.position.set(-6.0, 0.06, -0.6); st.add(ch);
    const w = resident(3); w.position.set(-5.6, 0.06, -1.6); w.rotation.y = 1.1; st.add(w);
    return { stage: st, set, e, w };
  },
  draw(s, t, info) {
    s.set.update(t);
    s.e.pose(addPose(POSE.relaxed, { ...idle(t, 2, 0.4), ...nod(t * 0.7, 0.12) })); s.e.face(mixExpr(EXPR.happy, EXPR.smug, 0.3), t);
    s.w.pose(addPose(POSE.handsHips, idle(t, 6, 0.4))); s.w.face(EXPR.happy, t);
    camMove(s.stage, t, [[0, { pos: [-0.4, 2.5, 4.6], look: [-5.5, 1.6, -0.4], fov: 38 }], [info.dur, { pos: [-1.0, 2.4, 3.8], look: [-5.5, 1.6, -0.4], fov: 37 }]], ease.inOut);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, CLEAR);
    const c0 = at(info, 'over', 1.0) - 0.15;
    if (t > c0) { dimScene(g, 4, 0.32); drawInsert(g, { type: 'bigtext', kicker: 'RESIDENTS SAY', title: '100+ YEARS', size: 150, color: '#ffd25a' }, t - c0); }
  },
});

// s06 — "Since 1998, there's even a yearly festival for it, with a parade." Bunting, a parade carrying a big paper fish; confetti.
registerShot('s06', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 42, shadowSize: 12, target: [0, 1.5, -3] });
    const set = yoroStreet(st, { look: 'fiesta', seed: 6 });
    [-1, -6, -11].forEach(z => bunting(st, z, { y: 5.2 + (z % 2) * 0.3 }));
    const ppl = [0, 1, 2, 4, 5, 6].map((i, k) => { const p = resident(i); p.position.set(k % 2 ? 1.2 : -1.2, 0.06, -1 - Math.floor(k / 2) * 2.4); st.add(p); return p; });
    const big = fish({ seed: 3, scale: 3.2, color: '#f2a03a' }); st.add(big);
    const poles = [0, 1].map(() => { const c = cyl(0.04, 0.04, 2.4, '#6a4a2a', 0, 0, 0, 6); st.add(c); return c; });
    const kids = [kid(0), kid(1)]; kids.forEach((k, i) => { k.position.set(i ? 3.2 : -3.2, 0.06, 0.6); k.rotation.y = i ? -0.9 : 0.9; st.add(k); });
    return { stage: st, set, ppl, big, poles, kids };
  },
  draw(s, t, info) {
    s.set.update(t);
    const adv = t * 1.0;
    s.ppl.forEach((p, i) => { const z0 = -1 - Math.floor(i / 2) * 2.4; p.position.z = z0 + adv; const wk = walk(t + i * 0.3, { speed: 1.4 }); p.pose(i < 2 ? { ...wk, armL: [0.2, 2.5, 0], armR: [0.2, 2.5, 0], elbowL: 0.2, elbowR: 0.2 } : wk); p.face(i % 2 ? EXPR.grin : EXPR.happy, t); });
    const z = s.ppl[0].position.z - 0.2; s.big.position.set(0, 3.5 + Math.sin(t * 3) * 0.12, z); s.big.rotation.y = Math.sin(t * 1.5) * 0.2; s.big.update(t, { side: 0, swim: 1 });
    s.poles.forEach((c, i) => c.position.set(i ? 1.2 : -1.2, 2.5, s.ppl[i].position.z));
    s.kids.forEach((k, i) => { k.pose(addPose(POSE.armsUp, { ...idle(t, 9 + i, 0.6), bob: Math.abs(Math.sin(t * 6 + i)) * 0.12 })); k.face(EXPR.grin, t); });
    const cut = at(info, 'parade.', 2.6) - 0.1;
    twoCam(s.stage, t, info.dur, cut, [{ pos: [0, 3.0, 12.5], look: [0, 2.6, -4], fov: 44 }, { pos: [0, 3.0, 11.4], look: [0, 2.6, -4], fov: 44 }],
      [{ pos: [3.6, 1.2, 4.2], look: [0, 3.0, 0], fov: 46 }, { pos: [3.3, 1.1, 3.8], look: [0, 3.2, 0], fov: 46 }]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, CLEAR);
    stamp(g, t, 'SINCE 1998', { at: 0.05, x: 300, y: 300, size: 74, color: '#ffffff', fill: '#d8342c', rot: -0.1 });
    stamp(g, t, 'FESTIVAL', { at: at(info, 'festival', 1.4) - 0.1, x: 760, y: 450, size: 70, color: '#ffffff', fill: '#2f8a4a', rot: 0.08 });
    // confetti
    g.save(); const cols = ['#e23b2e', '#f2c230', '#3f8ad8', '#3aa860', '#e0709a'];
    for (let i = 0; i < 60; i++) { const h = Math.sin(i * 91.3) * 999; const fx = h - Math.floor(h); const y = ((fx * 2100 + t * (280 + (i % 5) * 50)) % 2100) - 100, x = ((i * 137) % 1080) + Math.sin(t * 2 + i) * 30;
      g.fillStyle = cols[i % 5]; g.save(); g.translate(x, y); g.rotate(t * 3 + i); g.fillRect(-9, -5, 18, 10); g.restore(); }
    g.restore();
  },
});

// s07 — "But here's the strange part. The fish don't appear to fall from the sky." Everyone looks up: only rain. "?" Punch-in low.
registerShot('s07', { kind: '3d',
  init(T) { return umbrellaCrowd(T); },
  draw(s, t, info) {
    s.set.update(t); s.fs.forEach((f, i) => f.update(t, { flop: i % 4 ? 0 : 0.4 }));
    const up = ease.inOut(prog(t, at(info, 'fish', 1.4) - 0.2, at(info, 'fish', 1.4) + 0.3)); crowdPose(s, t, up);
    const cut = at(info, 'fall', 2.4) - 0.05;
    twoCam(s.stage, t, info.dur, cut, [{ pos: [0, 2.0, 5.4], look: [0, 2.0, -1], fov: 42 }, { pos: [0, 2.1, 4.8], look: [0, 2.1, -1], fov: 42 }],
      [{ pos: [0.2, 0.5, 1.4], look: [0, 6.0, -4], fov: 58 }, { pos: [0.2, 0.45, 1.2], look: [0, 6.4, -4], fov: 58 }]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, STORM_TINT); rain(g, t, 1);
    stamp(g, t, 'THE STRANGE PART', { at: 0.05, until: at(info, 'fall', 2.4) - 0.1, x: 540, y: 320, size: 74, color: '#ffffff', fill: '#7a3ab0', rot: -0.05 });
    reactions(g, t, s, [{ fx: 'question', on: s.ppl[1], at: at(info, 'appear', 1.8), until: at(info, 'fall', 2.4) - 0.05 }, { fx: 'question', on: s.ppl[0], at: at(info, 'appear', 1.8) + 0.15, until: at(info, 'fall', 2.4) - 0.05 }]);
    const c = at(info, 'fall', 2.4); if (t > c) stamp(g, t, 'NO FISH UP THERE?', { at: c + 0.1, x: 540, y: 330, size: 70, color: '#ffffff', fill: '#d8342c', rot: -0.04 });
  },
});

// boards over a dimmed rainy street (theory 1, theory 2)
function boardBg(T) { const st = toonStage(T, { light: 'day', fov: 44, shadowSize: 9, target: [0, 1, -2] }); const set = yoroStreet(st, { look: 'storm', water: true, seed: 11 }); const fs = scatterFish(st, 8, [-3, 3, -3, 1], 13, 0.8); return { stage: st, set, fs }; }
function boardDraw(s, t, info) { s.set.update(t); s.fs.forEach(f => f.update(t)); camMove(s.stage, t, [[0, { pos: [-1, 3.2, 6.5], look: [0, 1.2, -3], fov: 44 }], [info.dur, { pos: [1, 3.0, 6.0], look: [0, 1.2, -3], fov: 44 }]]); }

// s08 — "One theory is waterspouts. But the nearest ocean is about 45 miles away."
registerShot('s08', { kind: '3d',
  init: boardBg, draw: boardDraw,
  overlay(g, t, info) {
    dimScene(g, 8, 0.5); rain(g, t, 0.4);
    const cut = at(info, 'nearest', 1.8) - 0.1, z = t < cut ? 1 : 1.12;
    g.save(); g.translate(540, CARD_Y + 120); g.scale(z * 0.92, z * 0.92); g.translate(-540, -CARD_Y - 120);
    spoutMap(g, t, { y: CARD_Y, route: cut + 0.05, miles: at(info, 'miles', cut + 1.2) - 0.35 });
    g.restore();
  },
});

// s09 — "Another: river fish in underground water get washed up by the floods."
registerShot('s09', { kind: '3d',
  init: boardBg, draw: boardDraw,
  overlay(g, t, info) {
    dimScene(g, 8, 0.5); rain(g, t, 0.4);
    const cut = at(info, 'wash', 2.6) - 0.1, z = t < cut ? 1 : 1.1;
    g.save(); g.translate(540, CARD_Y + 160); g.scale(z * 0.92, z * 0.92); g.translate(-540, -CARD_Y - 160);
    undergroundBoard(g, t, { y: CARD_Y, flood: cut });
    g.restore();
  },
});

// s10 — "And a local legend says a priest prayed to feed the poor... and fish fell." Storybook LEGEND card (sepia), over a church.
registerShot('s10', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'warm', fov: 40, shadowSize: 12, target: [0, 3, -40] }); const set = yoroStreet(st, { look: 'clear', seed: 5 }); return { stage: st, set }; },
  draw(s, t, info) { s.set.update(t); camMove(s.stage, t, [[0, { pos: [0, 2.5, -24], look: [0, 6, -42], fov: 44 }], [info.dur, { pos: [0, 2.6, -27], look: [0, 6.2, -42], fov: 42 }]]); },
  overlay(g, t, info) {
    wash(g, '#3a2a10', 0.25); dimScene(g, 7, 0.4);
    const f = at(info, 'fell.', 3.0) - 0.25, z = t < f ? 1 : 1.1;
    g.save(); g.translate(540, CARD_Y + 60); g.scale(z * 0.92, z * 0.92); g.translate(-540, -CARD_Y - 60);
    legendCard(g, t, { y: CARD_Y, cloud: at(info, 'prayed', 1.2) - 0.1, fish: f + 0.1 });
    g.restore();
    stamp(g, t, 'LEGEND', { at: 0.1, x: 840, y: 250, size: 64, color: '#ffffff', fill: '#8a5a2a', rot: 0.12 });
  },
});

// s11 — "Nobody has confirmed how they get there." Back on the wet street: two residents shrug over the fish. UNCONFIRMED.
registerShot('s11', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 38, shadowSize: 8, target: [0, 1, 0] });
    const set = yoroStreet(st, { look: 'clear', water: true, seed: 8 });
    const a = elder(); a.position.set(-0.9, 0.06, 0); a.rotation.y = 0.35; st.add(a);
    const b = resident(2); b.position.set(1.0, 0.06, -0.2); b.rotation.y = -0.35; st.add(b);
    const fs = scatterFish(st, 10, [-2.5, 2.5, -1.5, 2.2], 31, 0.85);
    return { stage: st, set, a, b, fs };
  },
  draw(s, t, info) {
    s.set.update(t); s.fs.forEach((f, i) => f.update(t, { flop: i % 3 ? 0 : 0.4 }));
    const sh = ease.inOut(prog(t, 0.4, 0.8));
    [s.a, s.b].forEach((p, i) => { p.pose(addPose(shrug(POSE.stand, sh), idle(t, 3 + i, 0.4))); p.face(mixExpr(EXPR.neutral, EXPR.worried, sh), t); });
    camMove(s.stage, t, [[0, { pos: [0, 2.5, 7.4], look: [0, 1.4, 0], fov: 38 }], [info.dur, { pos: [0, 2.4, 6.6], look: [0, 1.4, 0], fov: 37 }]], ease.inOut);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, CLEAR);
    stamp(g, t, 'UNCONFIRMED', { at: at(info, 'confirmed', 0.6) - 0.1, x: 540, y: 330, size: 92, color: '#d8342c', fill: 'rgba(250,244,226,0.92)', rot: -0.1 });
    reactions(g, t, s, [{ fx: 'sweat', on: 'b', at: 0.6 }]);
  },
});

// s12 — PAYOFF: "So Yoro waits for the next storm." Same street + crowd as frame 1; they look up, clouds roll in, the rain
// starts; the camera ends on frame 1's opening framing so the cut back to s01 loops.
registerShot('s12', { kind: '3d',
  init(T) { return umbrellaCrowd(T); },
  draw(s, t, info) {
    s.set.update(t); s.fs.forEach((f, i) => f.update(t, { flop: i % 3 ? 0.2 : 0.6 }));
    const look = ease.inOut(prog(t, 0.2, 0.8)) * (1 - ease.inOut(prog(t, info.dur - 0.5, info.dur)));
    crowdPose(s, t, look);
    camMove(s.stage, t, [[0, { pos: [0.0, 4.4, 10.0], look: [0, 2.2, -3], fov: 46 }], [info.dur, HOOK_A[0]]], ease.inOut);
  },
  overlay(g, t, info, s) {
    const n = at(info, 'storm.', 1.6);
    wash(g, '#1c2638', 0.1 * prog(t, 0, n));
    sunnyLook(g, t, STORM_TINT); rain(g, t, 0.35 + 0.65 * prog(t, n - 0.3, n + 0.3));
    reactions(g, t, s, [{ fx: 'flash', at: n, dur: 0.2, color: '#eef4ff' }]);
    stamp(g, t, 'NEXT STORM...', { at: n - 0.2, x: 540, y: 320, size: 80, color: '#ffffff', fill: '#3a4a66', rot: -0.05 });
  },
});
