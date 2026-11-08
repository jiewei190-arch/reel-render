// micro world: s001-s002 (shrink + grass forest), s011-s016 (pavement landing, the raindrop, the closer)
import { registerShot, ease, prog, clamp, lerp } from '/engine/core.js';
import { POSE, EXPR, idle, addPose, mixPose, mixExpr, walk, shrug, point, tremble, shake, WALK_STRIDE } from '/kits/toon3d/rig.js';
import { camMove, drift } from '/kits/toon3d/toon.js';
import * as FX from '/kits/toon3d/fx.js';
import { THREE, at, screen, tag, bigNum, hero, XP, grassField, soilTex, sneaker, waterDrop, tearDrop, streaks, pavement, bottleCap, leaf, dustPuff, splash,
  toon, flat, floor, ball, blob, toonStage, E } from './_lib.js';

const sky = ['#8cc4ee', '#cfe8f6', '#eef6f0'];
const awePose = (t) => addPose(mixPose(POSE.relaxed, POSE.armsUp, 0.25), { headNod: -0.38, ...idle(t, 4) });

// ---------------- s001 HOOK "What if you shrank to the size of an ant?" ----------------
// frame 1 is already mid-shrink: the lawn and a red sneaker balloon up around the spinning hero, gold rings contract.
registerShot('s001', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'day', fov: 34, bg: sky, fog: [26, 90, '#d6ecdc'], target: [0, 0, 0], shadowSize: 6 });
    const world = new THREE.Group(); st.add(world);
    const f = floor(8, 8, toon('#ffffff', { map: soilTex(), fresh: true })); world.add(f);
    world.add(grassField({ n: 260, rMin: 0.09, rMax: 2.6, h: [0.1, 0.3], w: 0.011, seed: 5, avoid: [[0.22, -0.42, 0.24], [0, 0.25, 0.12], [0, 0.55, 0.16], [0, 0.95, 0.22], [0, 1.5, 0.3], [0, 2.2, 0.4]], px: 2.0 }));
    const sn = sneaker(); sn.scale.setScalar(0.105); sn.position.set(0.22, 0, -0.42); sn.rotation.y = 1.25; world.add(sn);
    const h = hero(); st.add(h);
    const rings = [0, 1, 2].map(i => { const m = new THREE.Mesh(new THREE.TorusGeometry(1, 0.03, 8, 48), flat('#ffe08a', { transparent: true, opacity: 0.9, depthWrite: false })); m.rotation.x = Math.PI / 2; m.userData.noOutline = true; st.add(m); return m; });
    return { stage: st, world, h, rings };
  },
  draw(s, t, info) {
    const tAnt = at(info, 'ant', 1.46), tShr = at(info, 'shrank', 0.46);
    const S = Math.exp(lerp(Math.log(1.25), Math.log(26), ease.sine(prog(t, -0.25, 2.05)))); s.world.scale.setScalar(S);
    s.world.children[1].update(t, 1);
    const spin = (1 - ease.out(prog(t, 0, 1.25))) * Math.PI * 2.3; s.h.rotation.y = spin; s.h.position.y = Math.sin(Math.PI * prog(t, 0, 1.3)) * 0.25;
    const k = ease.inOut(prog(t, tAnt - 0.15, tAnt + 0.35));
    s.h.pose(mixPose(addPose(POSE.panic, tremble(t, 1.5)), awePose(t), k));
    s.h.face(t < tShr ? XP.surprised : mixExpr(EXPR.shocked, XP.awe, k), t);
    s.rings.forEach((r, i) => { const u = ((t * 1.6 + i / 3) % 1); const fade = 1 - prog(t, 1.1, 1.6); r.scale.setScalar(lerp(2.2, 0.35, u)); r.position.y = 1.3 + lerp(0.6, -0.6, u); r.material.opacity = 0.85 * Math.sin(Math.PI * u) * fade; r.visible = fade > 0; });
    camMove(s.stage, t, [[0, { pos: [0.2, 1.75, 6.6], look: [0, 1.4, 0], fov: 34 }], [info.dur, { pos: [0.9, 0.85, 7.4], look: [0, 2.3, -1], fov: 42 }]], ease.inOut);
  },
  overlay(g, t, info) { const a = at(info, 'ant', 1.46); tag(g, 'ANT-SIZED YOU', prog(t, a, a + 0.25)); },
});

// ---------------- s002 "Grass becomes a forest." ----------------
function forest(T, o = {}) {
  const st = toonStage(T, { light: 'day', fov: 50, bg: sky, fog: [14, 70, '#cde6d2'], target: [0, 0, -2], shadowSize: 12 });
  const f = floor(140, 140, toon('#ffffff', { map: soilTex('#7a9446'), fresh: true })); f.material.map.repeat.set(8, 8); st.add(f);
  const gr = grassField({ n: 90, rMin: 1.4, rMax: 30, h: [7, 17], w: 0.34, seed: 12, avoid: [[0.8, 6, 2.6], [-2.6, -3.5, 1.9], [0, 0, 1.5]], px: 2.4 }); st.add(gr);
  const dew = waterDrop(1.55, { inkW: 0.14 }); dew.position.set(-2.6, 1.4, -3.6); dew.body.scale.y = 0.9; st.add(dew); const db = blob(1.7, 0.3); db.position.set(-2.6, 0.01, -3.6); st.add(db);
  const glint = FX.glow(1.6, '#ffffff', 0); glint.position.set(-3.1, 2.3, -2.4); st.add(glint);
  const h = hero(); st.add(h);
  return { stage: st, gr, dew, glint, h };
}
registerShot('s002', { kind: '3d',
  init(T) { return forest(T); },
  draw(s, t, info) {
    const tf = at(info, 'forest', 0.69); s.gr.update(t, 1.2);
    const k = ease.inOut(prog(t, tf - 0.25, tf + 0.25));
    s.h.rotation.y = lerp(0.5, 0.15, ease.inOut(prog(t, 0, 1.2)));
    s.h.pose(mixPose(addPose(POSE.relaxed, { headTurn: Math.sin(t * 2.2) * 0.35, headNod: -0.2, ...idle(t, 3) }), awePose(t), k));
    s.h.face(mixExpr({ ...EXPR.neutral, pupil: [Math.sin(t * 2.2) * 0.5, 0.4] }, XP.awe, k), t);
    s.glint.material.opacity = 0.9 * Math.sin(Math.PI * prog(t, tf - 0.05, tf + 0.5)); s.glint.scale.setScalar(1 + 1.4 * prog(t, tf - 0.05, tf + 0.5));
    camMove(s.stage, t, [[0, { pos: [1.0, 0.6, 6.4], look: [0, 3.4, -2], fov: 50 }], [info.dur, { pos: [0.75, 0.5, 5.5], look: [0, 3.9, -2], fov: 50 }]]);
  },
});

// ---------------- pavement world (s011-s016) ----------------
function street(T, o = {}) {
  const st = toonStage(T, { light: o.light || 'warm', fov: 32, bg: o.bg || ['#a9c4dc', '#dfe6ea'], fog: [22, 80, o.fogC || '#dad6ce'], target: [0, 0, 0], shadowSize: 8 });
  const pv = pavement(st, { size: 140, rep: 9 });
  const cap = bottleCap(2.2); cap.position.set(-5.5, 0, -7); cap.rotation.y = 0.3; st.add(cap);
  const lf = leaf(3.2, '#d9a03a'); lf.position.set(4.6, 0.05, -5); lf.rotation.y = 0.7; st.add(lf);
  const h = hero(); st.add(h);
  return { stage: st, pv, cap, h };
}
const rain = (o = {}) => streaks({ count: o.count || 60, len: 1.1, thick: 0.03, color: '#d8ecff', opacity: 0.65, seed: o.seed || 9, path: (u, p) => [lerp(-9, 9, p.a), lerp(15, -0.5, u), lerp(-10, 4.5, p.b)] });

// s011 "You land at walking speed, and walk away."
registerShot('s011', { kind: '3d',
  init(T) { const s = street(T); s.puff = dustPuff({ count: 12 }); s.stage.add(s.puff); s.lf2 = leaf(1.4, '#9cc24a'); s.stage.add(s.lf2); return s; },
  draw(s, t, info) {
    const tl = at(info, 'land', 0.33), tw = at(info, 'walk', 1.57);
    const y = 3.2 * (1 - ease.out(prog(t, -0.55, tl))); const land = prog(t, tl, tl + 0.45), squash = Math.sin(Math.PI * land) * (t > tl ? 1 : 0);
    s.puff.update(t - tl);
    const walking = t > tw; const wt = Math.max(0, t - tw);
    s.h.position.set(walking ? wt * 1.5 * WALK_STRIDE : 0, y, 0); s.h.rotation.y = lerp(0, Math.PI / 2 - 0.25, ease.inOut(prog(t, tw - 0.2, tw + 0.25)));
    const air = { ...POSE.armsUp, armL: [0.2, 1.3, 0], armR: [0.2, 1.3, 0], legL: [0.25, 0.12], legR: [-0.1, 0.12], kneeL: 0.4, kneeR: 0.2 };
    let p = t < tl ? addPose(air, { headNod: 0.15 }) : mixPose(addPose(POSE.stand, { bob: -0.18 * squash, kneeL: 0.6 * squash, kneeR: 0.6 * squash, lean: 0.15 * squash }), POSE.relaxed, prog(t, tl + 0.4, tl + 0.8));
    if (t > tl + 0.55 && !walking) p = addPose(p, { armL: [0.5, 0, 0], elbowL: 1.2, armR: [0.5, 0, 0], elbowR: 1.2 * Math.abs(Math.sin(t * 9)) });   // dusts off
    if (walking) p = walk(wt, { speed: 1.5, amp: 1.1 });
    s.h.pose(addPose(p, idle(t, 6)));
    s.h.face(t < tl ? { ...EXPR.worried, pupil: [0, -0.5] } : t < tl + 0.5 ? XP.surprised : XP.delight, t);
    s.lf2.position.set(-1.6 + t * 0.3, 2.6 - t * 0.9 + Math.sin(t * 3) * 0.2, 0.6); s.lf2.rotation.set(Math.sin(t * 2.5) * 0.5, t * 0.8, Math.cos(t * 2) * 0.4); s.lf2.visible = s.lf2.position.y > 0.05;
    const fx = walking ? wt * 1.5 * WALK_STRIDE * 0.6 : 0;
    camMove(s.stage, t, [[0, { pos: [0.3, 2.3, 8.0], look: [0, 1.7, 0], fov: 33 }], [tl + 0.4, { pos: [0.2, 1.9, 7.4], look: [0, 1.35, 0], fov: 32 }], [info.dur, { pos: [0.5, 1.9, 7.6], look: [0.5, 1.35, 0], fov: 33 }]]);
    if (walking) { const c = s.stage.camera; c.position.x += fx; c.lookAt(0.5 + fx, 1.35, 0); }
  },
  overlay(g, t, info) { const w = at(info, 'walking', 0.65); bigNum(g, '~7 km/h', E.W / 2, E.H * 0.16, prog(t, w, w + 0.25), 118); },
});
// s012 "Then one raindrop" — a round shadow grows round the walking hero; they stop and look up
registerShot('s012', { kind: '3d',
  init(T) { const s = street(T, { light: 'day', bg: ['#7d8fa6', '#c4ccd4'], fogC: '#c8ccd0' }); s.sh = blob(1, 0.6); s.stage.add(s.sh); s.drop = tearDrop(1.7); s.stage.add(s.drop); return s; },
  draw(s, t, info) {
    const tr = at(info, 'raindrop', 0.53); const stop = ease.out(prog(t, tr - 0.2, tr + 0.1));
    const x = -0.9 + Math.min(t, tr) * 1.4; s.h.position.set(x, 0, 0); s.h.rotation.y = lerp(Math.PI / 2 - 0.3, 0.1, stop);
    s.h.pose(mixPose(walk(t, { speed: 1.5 }), addPose(POSE.stand, { headNod: -0.6, armL: [0.1, 0.3, 0], armR: [0.1, 0.3, 0], ...tremble(t, 0.8) }), stop));
    s.h.face(mixExpr(XP.delight, { ...EXPR.shocked, pupil: [0, 0.9] }, stop), t);
    const g = ease.in(prog(t, 0, info.dur)); s.sh.position.set(x + 0.1, 0.012, 0.1); s.sh.scale.setScalar(0.5 + g * 2.6); s.sh.material.opacity = 0.25 + g * 0.45;
    s.drop.position.set(x + 0.1, lerp(14, 6.2, ease.in(prog(t, 0.1, info.dur))), 0.1);
    camMove(s.stage, t, [[0, { pos: [-0.2, 1.1, 8.2], look: [0, 2.6, 0], fov: 42 }], [info.dur, { pos: [0.1, 1.0, 7.6], look: [0.3, 3.0, 0], fov: 44 }]]);
  },
});
// the drop the hero is stuck in (s013-s015)
function inDrop(T, o = {}) {
  const s = street(T, { light: 'day', bg: ['#7d8fa6', '#c4ccd4'], fogC: '#c8ccd0' });
  s.drop = waterDrop(2.05, { inkW: 0.12, alpha: 0.2 }); s.drop.position.set(0, 1.8, 0.2); s.drop.body.scale.y = 0.88; s.stage.add(s.drop);
  const db = blob(2.3, 0.28); db.position.set(0, 0.012, 0.2); s.stage.add(db);
  s.h.position.set(0, 0, 0.55);
  return s;
}
// s013 "grabs you, and won't let go." — SPLASH, the hero shoves the wall, it bulges and snaps back
registerShot('s013', { kind: '3d',
  init(T) { const s = inDrop(T); s.sp = splash({ r0: 1.9, count: 18, up: 3 }); s.sp.position.set(0, 0, 0.2); s.stage.add(s.sp); return s; },
  draw(s, t, info) {
    const tw = at(info, "won't", 1.03), tg = at(info, 'grabs', 0.15); s.sp.update(t - 0.02);
    const push = ease.inOut(prog(t, 0.45, tw - 0.05)) * (1 - ease.outElastic(prog(t, tw - 0.05, tw + 0.7)));
    const land = 1 - ease.outElastic(prog(t, 0, 0.6)); s.drop.body.scale.set(1 + 0.12 * land - 0.05 * push, 0.88 - 0.25 * land, 1 + 0.32 * push);
    s.drop.position.z = 0.2 + 0.35 * push;
    s.h.position.z = 0.55 + 0.75 * push - 0.2 * prog(t, tw, tw + 0.3) * (1 - prog(t, tw + 0.3, tw + 0.9));
    const pushPose = { ...POSE.stand, armL: [1.45, 0.25, 0], armR: [1.45, 0.25, 0], elbowL: 0.15, elbowR: 0.15, lean: 0.3, legL: [-0.35, 0.08], legR: [0.25, 0.08], kneeL: 0.1, kneeR: 0.3 };
    const kp = ease.inOut(prog(t, 0.35, 0.6)) * (1 - ease.inOut(prog(t, tw + 0.15, tw + 0.5)));
    s.h.pose(addPose(mixPose(addPose(POSE.panic, { headNod: -0.1 }), pushPose, kp), { ...tremble(t, kp > 0.5 ? 2 : 0.6), ...idle(t, 2) }));
    const after = prog(t, tw + 0.3, tw + 0.6);
    s.h.face(t < tg ? XP.surprised : kp > 0.5 ? XP.wince : mixExpr(EXPR.shocked, { ...EXPR.worried, pupil: [0, 0] }, after), t);
    camMove(s.stage, t, [[0, { pos: [1.2, 2.4, 9.6], look: [0, 1.75, 0], fov: 34 }], [info.dur, { pos: [0.9, 2.2, 8.6], look: [0, 1.8, 0], fov: 33 }]]);
    const sh = Math.max(0, 1 - t * 4) * 0.08; s.stage.camera.position.x += Math.sin(t * 70) * sh;
  },
  overlay(g, t, info) { const w = at(info, "won't", 1.03); tag(g, 'SURFACE TENSION', prog(t, w, w + 0.25)); },
});
// s014 "For you, water is scarier than gravity." — face inside the drop, cheeks puffed, bubbles; shocked on "scarier"
registerShot('s014', { kind: '3d',
  init(T) {
    const s = inDrop(T); s.h.position.z = 1.0;
    s.bub = [...Array(9)].map((_, i) => { const b = waterDrop(0.07 + (i % 3) * 0.03, { inkW: 0.3, alpha: 0.35 }); s.stage.add(b); return b; });
    return s;
  },
  draw(s, t, info) {
    const ts = at(info, 'scarier', 0.93); const k = ease.out(prog(t, ts - 0.05, ts + 0.15));
    s.h.pose(addPose(POSE.stand, { armL: [0.6, 0.4, 0], armR: [0.6, 0.4, 0], elbowL: 1.4, elbowR: 1.4, headNod: -0.04, ...tremble(t, 0.4 + k), ...idle(t, 5) }));
    s.h.face(mixExpr(XP.puffed, { ...EXPR.shocked, mouth: 'scream', pupilSize: 0.55 }, k), t);
    s.bub.forEach((b, i) => { const u = (((t - ts) * 0.9 + i / 9) % 1 + 1) % 1; const on = t > ts - 0.1 ? 1 : (i % 3 === 0 ? 0.6 : 0); b.position.set((i % 2 ? 0.62 : -0.62) + Math.sin(i * 2.1 + t * 3) * 0.1, 1.6 + u * 1.6, 1.3 + (i % 3) * 0.04); b.scale.setScalar(on ? 0.4 + u * 0.8 : 0.0001); });
    camMove(s.stage, t, [[0, { pos: [0.15, 2.18, 5.6], look: [0, 2.1, 1.0], fov: 22 }], [info.dur, { pos: [0.05, 2.15, 4.9], look: [0, 2.1, 1.0], fov: 21 }]]);
  },
  overlay(g, t, info) { const gv = at(info, 'gravity', 1.51); tag(g, 'WATER > GRAVITY', prog(t, gv, gv + 0.25)); },
});
// s015 "Would you risk it?" — pull back, rain all around, a cheeky look into the lens on "risk"
function rainRings(st, n = 10, seed = 3) { const R = []; for (let i = 0; i < n; i++) { const m = new THREE.Mesh(new THREE.TorusGeometry(1, 0.03, 6, 36), flat('#e8f4ff', { transparent: true, opacity: 0.7, depthWrite: false })); m.rotation.x = Math.PI / 2; m.userData.noOutline = true; st.add(m); R.push({ m, x: Math.sin(i * 12.9 + seed) * 7, z: -6 + ((i * 7.3) % 9), ph: (i * 0.37) % 1 }); } return (t) => R.forEach(r => { const u = (t * 1.3 + r.ph) % 1; r.m.position.set(r.x, 0.03, r.z); r.m.scale.setScalar(0.1 + u * 1.1); r.m.material.opacity = 0.7 * (1 - u); }); }
registerShot('s015', { kind: '3d',
  init(T) { const s = inDrop(T); s.rain = rain(); s.stage.add(s.rain); s.rings = rainRings(s.stage); return s; },
  draw(s, t, info) {
    const tr = at(info, 'risk', 0.45); s.rain.update(t, 1.4); s.rings(t);
    const k = ease.inOut(prog(t, tr - 0.15, tr + 0.25));
    s.h.pose(addPose(mixPose(POSE.handsHips, shrug(POSE.stand, 1), Math.sin(Math.PI * prog(t, tr - 0.1, tr + 0.8)) * 0.7), { headTilt: 0.12 * k, ...idle(t, 7) }));
    s.h.face(mixExpr({ ...EXPR.deadpan, pupil: [0.4, 0] }, XP.cheeky, k), t);
    camMove(s.stage, t, [[0, { pos: [0.4, 2.3, 7.2], look: [0, 1.9, 0], fov: 30 }], [info.dur, { pos: [1.4, 3.2, 12.5], look: [0, 1.8, 0], fov: 34 }]], ease.inOut);
  },
});
// s016 CLOSER "Subscribe for more." — the drop pops, the soaked hero shakes off and points at the lens
registerShot('s016', { kind: '3d',
  init(T) { const s = inDrop(T); s.h.position.z = 0.4; s.rain = rain({ count: 40 }); s.stage.add(s.rain); s.rings = rainRings(s.stage); s.sp = splash({ r0: 0.8, count: 22, up: 4, seed: 11 }); s.sp.position.set(0, 1.0, 0.3); s.stage.add(s.sp);
    s.drips = [...Array(5)].map((_, i) => { const d = waterDrop(0.06, { inkW: 0.3, alpha: 0.45 }); s.stage.add(d); return d; }); return s; },
  draw(s, t, info) {
    s.rain.update(t + 3, 1.4); s.rings(t + 1); s.sp.update(t - 0.05);
    const pop = prog(t, 0, 0.12); s.drop.visible = pop < 1; s.drop.body.scale.setScalar(1 + pop * 0.25); s.drop.body.scale.y = 0.88 + pop * 0.2;
    const sh = Math.sin(Math.PI * prog(t, 0.12, 0.6)); const pk = ease.outBack(prog(t, 0.55, 0.85));
    s.h.pose(addPose(point(addPose(POSE.stand, { ...shake(t, 0.45 * sh, 7), side: Math.sin(t * 44) * 0.05 * sh }), 'R', pk, { up: -0.15, across: -0.25 }), { ...idle(t, 8), headTilt: 0.1 * pk }));
    s.h.face(t < 0.12 ? XP.surprised : t < 0.6 ? { ...EXPR.deadpan, lid: 0.7, mouth: 'wavy' } : XP.delight, t);
    s.drips.forEach((d, i) => { const u = ((t * 1.2 + i / 5) % 1); d.position.set(-0.45 + i * 0.22, 2.4 - u * 2.3, 0.75); d.scale.setScalar(t > 0.1 ? 1 : 0.0001); });
    camMove(s.stage, t, [[0, { pos: [0.6, 2.2, 8.4], look: [0, 1.7, 0], fov: 32 }], [info.dur, { pos: [0.2, 2.1, 7.0], look: [0, 1.7, 0], fov: 31 }]]);
  },
  overlay(g, t, info) { const s0 = at(info, 'Subscribe', 0.1); tag(g, 'SUBSCRIBE', prog(t, s0, s0 + 0.2), 0.14, { bg: '#e0352a', color: '#ffffff', size: 60 }); },
});
