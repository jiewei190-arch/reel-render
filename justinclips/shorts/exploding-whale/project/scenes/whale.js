// Oregon's Exploding Whale — 14 shots, Toon 3D + BEANMEN FX. EMOTION: LOL. Deadpan narrator, nobody hurt, the car is empty.
import { registerShot, E, ease, prog, clamp, lerp } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, point, shrug, walk, run } from '/kits/toon3d/rig.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { voidBg } from '/kits/toon3d/insert.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import {
  at, THREE, toonStage, worker, veteran, reporter, local, whale, scorch, explosion, stickBundle, crate, tvCamera, car, chunk, gull, beach,
  topCaption, stamp, yearStamp, kaboom, rewindBadge, newsBar, stink, insT, CARD_INK, PR, FX, ball, cyl, rbox, box, floor, toon, flat, outline, canvasTex, rng,
} from './_lib.js';

const RAYS = { rays: { from: [-70, -60], strength: 0.7 }, tint: '#ffd49a' };
const SOFT = { rays: false, tint: '#ffe0b0' };
const v3 = new THREE.Vector3();
const WZ = -3;            // whale position on the beach
const scr = (st, p) => { v3.set(...p).project(st.camera); return [(v3.x + 1) / 2 * E.W, (1 - v3.y) / 2 * E.H]; };
const NOSE = { armR: [2.5, -0.15, 0.2], elbowR: 2.2, armL: [0.3, 0.2, 0], elbowL: 0.3 };
const HOLDUP = { armR: [2.9, 0.1, 0], elbowR: 0.35 };

function beachWhale(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: o.fov || 44, shadowSize: o.shadowSize || 16, target: o.target || [0, 1, WZ] });
  const env = beach(st, { seed: o.seed || 3 });
  const w = whale(); w.scale.setScalar(1.3); w.position.set(0, 0, WZ); w.rotation.y = o.whaleRot ?? 0.12; st.add(w);
  return { stage: st, env, w };
}

// ---- s01 (frame 1): KA-BOOM already going off; two hard-hats duck behind a dune in the foreground. Top caption from frame 1.
function boomInit(T) {
  const s = beachWhale(T, { fov: 48, shadowSize: 20 });
  const ex = explosion({ size: 3.4, chunks: 60, seed: 11 }); ex.position.set(0.5, 0, WZ + 0.5); s.stage.add(ex);
  
  const a = worker({ seed: 7 }); a.position.set(-7.4, 0, 4.4); a.rotation.y = Math.PI - 0.25; s.stage.add(a);
  const b = worker({ seed: 8, main: '#e8742a', skin: 'light', moustache: '#3a2416' }); b.position.set(-8.6, 0, 4.0); b.rotation.y = Math.PI + 0.2; s.stage.add(b);
  return { ...s, ex, a, b };
}
function boomDraw(s, t, info, t0) {
  const T = t + t0; s.env.update(T); s.ex.update(T);
  s.w.visible = true;
  for (const [c, sd] of [[s.a, 1], [s.b, 2]]) { c.pose(addPose(mixPose(POSE.stand, { ...POSE.panic, armL: [2.8, 0.4, 0], armR: [2.8, -0.4, 0], elbowL: 1.9, elbowR: 1.9, lean: 0.35 }, clamp(T / 0.2)), { bob: -0.25 - 0.03 * Math.sin(T * 20 + sd) })); c.face(EXPR.shocked, T); }
  camMove(s.stage, t, [[0, { pos: [1.2, 4.2, 17.5], look: [0.0, 3.4, WZ], fov: 52 }], [info.dur, { pos: [1.1, 4.0, 16.3], look: [0.0, 3.6, WZ], fov: 52 }]]);
}
registerShot('s01', { kind: '3d',
  init: boomInit,
  draw(s, t, info) { boomDraw(s, t, info, 0.3); shakeCam(s.stage, t, [{ fx: 'shake', at: 0, amp: 0.09, dur: 1.4 }]); },
  overlay(g, t, info, s) {
    sunnyLook(g, t, SOFT);
    if (t < 0.12) { g.save(); g.globalAlpha = 0.18 * (1 - t / 0.12); g.fillStyle = '#fff6d0'; g.fillRect(0, 0, E.W, E.H); g.restore(); }
    kaboom(g, t + 0.3, { y: 820, r: 360, until: 1.5 });
    yearStamp(g, t, 1970, { at: at(info, '1970', 0.3) - 0.05, x: 830, y: 470 });
    topCaption(g, t, info);
  },
});

// ---- s02: rewind -> the dead whale on the sand, stink lines, gulls circling, two crew members holding their noses.
registerShot('s02', { kind: '3d',
  init(T) {
    const s = beachWhale(T, { fov: 42 });
    const a = worker({ seed: 7 }); a.position.set(-1.9, 0, 4.2); a.rotation.y = 0.35; s.stage.add(a);
    const b = worker({ seed: 8, main: '#e8742a', skin: 'light', moustache: '#3a2416' }); b.position.set(2.2, 0, 3.8); b.rotation.y = -0.4; s.stage.add(b);
    const gulls = [0, 1, 2].map(i => { const q = gull(); s.stage.add(q); return q; });
    return { ...s, a, b, gulls };
  },
  draw(s, t, info) {
    s.env.update(t);
    s.gulls.forEach((q, i) => { const a = t * 0.9 + i * 2.1; q.position.set(Math.cos(a) * 4.5, 7 + i * 0.6 + Math.sin(t * 2 + i) * 0.2, WZ + Math.sin(a) * 2); q.rotation.y = -a; q.flap(t + i); });
    const k = ease.out(prog(t, 0.25, 0.5));
    for (const [c, sd] of [[s.a, 3], [s.b, 4]]) { c.pose(addPose(mixPose(POSE.stand, { ...POSE.stand, ...NOSE }, k), idle(t, sd))); c.face(mixExpr(EXPR.neutral, { ...EXPR.worried, mouth: 'wavy', lid: 0.55 }, k), t); }
    camMove(s.stage, t, [[0, { pos: [0.5, 3.4, 16], look: [0.5, 1.9, WZ], fov: 44 }], [info.dur, { pos: [0.4, 3.0, 13.6], look: [0.5, 1.8, WZ], fov: 42 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, RAYS);
    const [x, y] = scr(s.stage, [0, 3.6, WZ]); stink(g, x, y, t);
    reactions(g, t, s, [{ fx: 'sweat', on: 'a', at: 0.45 }, { fx: 'sweat', on: 'b', at: 0.5 }]);
    if (t > 0.35) { const k = ease.outBack(clamp((t - 0.35) / 0.2)); g.save(); g.translate(E.W / 2, 1010); g.rotate(-0.05); g.scale(k, k); insT(g, '(it was already dead)', 0, 0, 66, { color: '#ffffff', stroke: CARD_INK }); g.restore(); }
    topCaption(g, t, info);
    rewindBadge(g, t, { until: 0.4 });
  },
});

// ---- s03: the explosives veteran holds up a small bundle: "20 sticks would do it."
registerShot('s03', { kind: '3d',
  init(T) {
    const s = beachWhale(T, { fov: 34, shadowSize: 10, target: [0, 1, 3] });
    const v = veteran(); v.position.set(-0.4, 0, 3.2); v.rotation.y = 0.25; s.stage.add(v);
    const bun = stickBundle(6); s.stage.add(bun);
    return { ...s, v, bun };
  },
  draw(s, t, info) {
    s.env.update(t);
    const k = ease.outBack(prog(t, 0.15, 0.5));
    s.v.pose(addPose(mixPose(POSE.stand, { ...POSE.stand, ...HOLDUP, armL: [0.9, 0.5, 0], elbowL: 1.2 }, k), idle(t, 5)));
    s.v.face(mixExpr(EXPR.neutral, { ...EXPR.deadpan, mouth: 'smirk' }, k), t);
    v3.set(0, 0, 0); s.v.hand.R.getWorldPosition(v3); s.bun.position.set(v3.x, v3.y + 0.28, v3.z + 0.05); s.bun.rotation.set(0, t * 0.6, 0.1);
    camMove(s.stage, t, [[0, { pos: [0.6, 2.4, 9.4], look: [-0.3, 2.3, 3.2], fov: 36 }], [info.dur, { pos: [0.5, 2.4, 8.4], look: [-0.3, 2.4, 3.2], fov: 35 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, SOFT);
    const t20 = at(info, '20', 1.0);
    stamp(g, t - t20, '20 STICKS', { y: 520, size: 104, color: '#2f8a3a', rot: -0.08 });
    reactions(g, t, s, [{ fx: 'sparkle', on: 'bun', at: 0.45, scale: 0.7 }]);
  },
});

// ---- s04: "They used..." the crew, beaming, wheel in a crate. Held beat.
registerShot('s04', { kind: '3d',
  init(T) {
    const s = beachWhale(T, { fov: 34, shadowSize: 10, target: [0, 1, 3] });
    const a = worker({ seed: 7 }); a.position.set(-0.9, 0, 3.4); a.rotation.y = 0.15; s.stage.add(a);
    const b = worker({ seed: 8, main: '#e8742a', skin: 'light', moustache: '#3a2416' }); b.position.set(0.9, 0, 3.0); b.rotation.y = -0.2; s.stage.add(b);
    const c1 = crate(0.9); c1.position.set(0, 0, 4.0); s.stage.add(c1);
    return { ...s, a, b, c1 };
  },
  draw(s, t, info) {
    s.env.update(t);
    for (const [c, sd] of [[s.a, 3], [s.b, 4]]) { c.pose(addPose({ ...POSE.handsHips }, idle(t, sd))); c.face(EXPR.grin, t); }
    camMove(s.stage, t, [[0, { pos: [0, 2.2, 10.5], look: [0, 1.9, 3.2], fov: 36 }], [info.dur, { pos: [0, 2.2, 9.2], look: [0, 2.0, 3.2], fov: 34 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); reactions(g, t, s, [{ fx: 'sparkle', on: 'a', at: 0.2, scale: 0.6 }]); },
});

// ---- s05: "...20 cases." crates rain down and stack into a tower beside the whale. 20 CASES stamp + half a ton.
registerShot('s05', { kind: '3d',
  init(T) {
    const s = beachWhale(T, { fov: 44, shadowSize: 16 });
    const cr = []; for (let i = 0; i < 20; i++) { const c = crate(1.0); s.stage.add(c); cr.push(c); }
    const v = veteran(); v.position.set(-2.9, 0, 5.6); v.rotation.y = 0.5; s.stage.add(v);
    return { ...s, cr, v };
  },
  draw(s, t, info) {
    s.env.update(t);
    const tc = at(info, 'cases', 0.2) - 0.25;
    s.cr.forEach((c, i) => { const row = Math.floor(i / 4), col = i % 4; const td = tc + i * 0.035; const k = clamp((t - td) / 0.22);
      const yy = row * 0.72; c.position.set(-1.2 + col * 1.04 + (row % 2) * 0.2, lerp(yy + 9, yy, ease.in(k)), WZ + 4.2); c.rotation.y = (i * 0.37) % 0.3 - 0.15; c.visible = t > td - 0.3; });
    const shock = prog(t, tc + 0.4, tc + 0.6);
    s.v.pose(addPose(mixPose(POSE.stand, POSE.facepalm, shock), idle(t, 9))); s.v.face(mixExpr(EXPR.deadpan, EXPR.shocked, shock), t);
    camMove(s.stage, t, [[0, { pos: [-1.5, 3.2, 14], look: [0, 2.2, WZ + 2], fov: 46 }], [info.dur, { pos: [-1.4, 3.0, 12.4], look: [0, 2.4, WZ + 2], fov: 44 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: tc + 0.25, amp: 0.06, dur: 0.6 }]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, SOFT);
    const tc = at(info, 'cases', 0.2);
    stamp(g, t - tc, '20 CASES', { y: 470, size: 118 });
    if (t > tc + 0.35) { const k = ease.outBack(clamp((t - tc - 0.35) / 0.25)); g.save(); g.translate(E.W / 2, 640); g.scale(k, k); insT(g, '(about half a ton)', 0, 0, 58, { color: '#ffffff', stroke: CARD_INK }); g.restore(); }
  },
});

// ---- s06: "The news said..." a 1970 TV reporter with a mic in front of a tripod news camera. Lower-third bar.
registerShot('s06', { kind: '3d',
  init(T) {
    const s = beachWhale(T, { fov: 34, shadowSize: 10, target: [0, 1, 4] });
    const r = reporter(); r.position.set(0.3, 0, 4.4); r.rotation.y = 0.05; s.stage.add(r);
    const cam = tvCamera(); cam.position.set(-1.9, 0, 6.6); cam.rotation.y = 2.5; s.stage.add(cam);
    return { ...s, r, cam };
  },
  draw(s, t, info) {
    s.env.update(t);
    s.r.pose(addPose({ ...POSE.stand, armR: [1.35, -0.25, 0.1], elbowR: 1.3 }, idle(t, 6))); s.r.face({ ...EXPR.deadpan, talk: 1 }, t);
    s.cam.rec.visible = Math.sin(t * 8) > 0;
    camMove(s.stage, t, [[0, { pos: [0.5, 2.2, 10.6], look: [0.1, 2.0, 4.0], fov: 32 }], [info.dur, { pos: [0.5, 2.25, 9.6], look: [0.1, 2.1, 4.0], fov: 31 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); newsBar(g, t); },
});

// ---- s07: "...blasted blubber beyond all believable bounds." the blast seen from the dunes; chunks rain; the reporter ducks (unhurt).
registerShot('s07', { kind: '3d',
  init(T) {
    const s = beachWhale(T, { fov: 50, shadowSize: 22 });
    const ex = explosion({ size: 3.6, chunks: 70, seed: 17, spreadX: 1.3 }); ex.position.set(0.5, 0, WZ + 0.5); s.stage.add(ex);
    const r = reporter(); r.position.set(2.6, 0, 11.4); r.rotation.y = 2.8; s.stage.add(r);
    const cam = tvCamera(); cam.position.set(1.0, 0, 12.2); cam.rotation.y = Math.PI; s.stage.add(cam);
    return { ...s, ex, r, cam };
  },
  draw(s, t, info) {
    s.env.update(t); s.ex.update(t - 0.05);
    const duck = ease.out(prog(t, 0.3, 0.55));
    s.r.pose(addPose(mixPose(POSE.stand, { ...POSE.panic, armL: [2.8, 0.4, 0], armR: [2.8, -0.4, 0], elbowL: 1.9, elbowR: 1.9, lean: 0.4 }, duck), { bob: -0.3 * duck }));
    s.r.face(mixExpr(EXPR.neutral, EXPR.shocked, duck), t);
    camMove(s.stage, t, [[0, { pos: [3.2, 2.0, 17], look: [0.5, 4.2, WZ], fov: 54 }], [info.dur, { pos: [3.0, 2.2, 16], look: [0.5, 4.6, WZ], fov: 52 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: 0.05, amp: 0.08, dur: 1.0 }]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, SOFT);
    if (t > 0.05 && t < 0.2) { g.save(); g.globalAlpha = 0.7 * (1 - (t - 0.05) / 0.15); g.fillStyle = '#fff6d0'; g.fillRect(0, 0, E.W, E.H); g.restore(); }
    reactions(g, t, s, [{ fx: 'exclaim', on: 'r', at: 0.35, scale: 0.8 }]);
  },
});

// ---- s08: "One chunk reportedly flew a quarter mile..." a single slab sails across the sky; distance meter counts up.
registerShot('s08', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 40, shadow: false });
    const env = beach(st, { seed: 6, dunes: false });
    const ch = chunk(3, 1.1); st.add(ch);
    const trail = []; for (let i = 0; i < 14; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), flat('#ffffff', { transparent: true, opacity: 0.9 })); d.userData.noOutline = true; st.add(d); trail.push(d); }
    return { stage: st, env, ch, trail };
  },
  draw(s, t, info) {
    s.env.update(t);
    const X = (tt) => tt * 9, Y = (tt) => 9 + Math.sin(tt * 0.9) * 1.2;
    s.ch.position.set(X(t), Y(t), -4); s.ch.rotation.set(t * 3, t * 2, t * 4);
    s.trail.forEach((d, i) => { const tt = t - (i + 1) * 0.07; d.visible = tt > 0; d.position.set(X(tt), Y(tt), -4); });
    camMove(s.stage, t, [[0, { pos: [X(t) - 1.5, 7.5, 8], look: [X(t), 8.6, -4], fov: 42 }], [info.dur, { pos: [X(t) - 1.5, 7.5, 8], look: [X(t), 8.6, -4], fov: 42 }]], (k) => k);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, RAYS);
    const k = clamp(t / Math.max(0.5, info.dur - 0.2)); const ft = Math.round(k * 1320);
    g.save(); g.translate(E.W / 2, 560); g.fillStyle = 'rgba(255,248,236,.92)'; g.strokeStyle = CARD_INK; g.lineWidth = 8; g.beginPath(); g.roundRect(-300, -70, 600, 140, 26); g.fill(); g.stroke();
    insT(g, `${ft.toLocaleString('en-US')} FT`, 0, 6, 92, { color: '#2a5aa8', stroke: null }); g.restore();
    if (k > 0.98) { g.save(); g.translate(E.W / 2, 700); insT(g, '≈ ¼ MILE', 0, 0, 70, { color: '#ffd25a', stroke: CARD_INK }); g.restore(); }
  },
});

// ---- s09: "...and crushed a brand new car." a shiny NEW sedan in the lot; the slab lands on the roof. Nobody inside.
registerShot('s09', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 36, shadowSize: 8, target: [0, 1, 0] });
    const env = beach(st, { seed: 7, seaZ: -30, duneZ: -10 });
    const lot = floor(30, 16, '#8a8a88', 0, 0); lot.position.y = 0.02; st.add(lot);
    for (let i = -2; i <= 2; i++) { const l = floor(0.12, 3, '#f4f0e0', i * 5 + 2.5, 0); l.position.y = 0.03; st.add(l); }
    const c = car(); c.rotation.y = 0.35; st.add(c);
    const ch = chunk(3, 1.1); st.add(ch);
    return { stage: st, env, c, ch };
  },
  draw(s, t, info) {
    s.env.update(t);
    const th = at(info, 'crushed', 0.5) + 0.05; const k = clamp((t - th + 0.3) / 0.3);
    s.ch.position.set(lerp(-6, -0.3, k), lerp(9, 1.85, ease.in(k)) - (t > th ? 0.55 * clamp((t - th) / 0.12) : 0), lerp(-2, 0, k)); s.ch.rotation.set(t < th ? t * 4 : 0.2, 0.35, t < th ? t * 3 : 0.05);
    s.c.crush(clamp((t - th) / 0.12));
    camMove(s.stage, t, [[0, { pos: [3.2, 3.4, 13.5], look: [0, 1.6, 0], fov: 40 }], [info.dur, { pos: [3.0, 3.2, 12.4], look: [0, 1.6, 0], fov: 39 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: th, amp: 0.12, dur: 0.4 }]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, SOFT);
    const th = at(info, 'crushed', 0.5) + 0.05;
    reactions(g, t, s, [{ fx: 'flash', at: th, dur: 0.12, color: '#ffffff' }, { fx: 'stars', on: [0, 2.0, 0], at: th + 0.05, until: th + 0.9 }]);
    kaboom(g, t - th, { text: 'CRUNCH!', y: 560, r: 250, until: 0.9 });
  },
});

// ---- s10: "And most of the whale..." smoke hangs over the beach; the crew peers into it.
function afterInit(T) {
  const s = beachWhale(T, { fov: 42 });
  const sc = scorch({ n: 22 }); sc.position.set(0, 0, WZ); s.stage.add(sc);
  const sm = FX.smoke({ count: 22, size: 1.8, rise: 0.3, spread: 11, color: '#efe8e2', life: 6, seed: 9, drift: [0.15, 0] }); sm.position.set(0, 0, WZ); s.stage.add(sm);
  const a = worker({ seed: 7 }); a.position.set(-2.3, 0, 7.6); a.rotation.y = Math.PI - 0.1; s.stage.add(a);
  const b = worker({ seed: 8, main: '#e8742a', skin: 'light', moustache: '#3a2416' }); b.position.set(0.0, 0, 8.2); b.rotation.y = Math.PI + 0.15; s.stage.add(b);
  const v = veteran(); v.position.set(2.3, 0, 7.6); v.rotation.y = Math.PI + 0.3; s.stage.add(v);
  return { ...s, sc, sm, a, b, v };
}
registerShot('s10', { kind: '3d',
  init: afterInit,
  draw(s, t, info) {
    s.env.update(t); s.sm.update(t + 2); s.sm.scale.setScalar(1);
    for (const [c, sd] of [[s.a, 3], [s.b, 4], [s.v, 5]]) { c.pose(addPose({ ...POSE.stand, lean: 0.2 }, idle(t, sd))); c.face(EXPR.neutral, t); }
    camMove(s.stage, t, [[0, { pos: [0.4, 5.2, 15.5], look: [0.3, 1.6, WZ], fov: 46 }], [info.dur, { pos: [0.4, 5.0, 14.5], look: [0.3, 1.6, WZ], fov: 45 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); g.save(); g.globalAlpha = 0.35 * (1 - t / info.dur); g.fillStyle = '#d8d0d4'; g.fillRect(0, 0, E.W, E.H); g.restore(); },
});

// ---- s11: "...was still there." the smoke clears: the whale, basically intact. The crew turns to us, deadpan. A hard hat slides off.
registerShot('s11', { kind: '3d',
  init(T) { const s = afterInit(T); s.sm.visible = false; return s; },
  draw(s, t, info) {
    s.env.update(t);
    const turn = ease.inOut(prog(t, 0.45, 0.75));
    for (const [c, sd, r0] of [[s.a, 3, Math.PI - 0.1], [s.b, 4, Math.PI + 0.15], [s.v, 5, Math.PI + 0.3]]) { c.rotation.y = lerp(r0, 0.1 * (sd - 4), turn); c.pose(addPose(POSE.stand, idle(t, sd))); c.face(EXPR.deadpan, t); }
    const hk = clamp((t - 0.9) / 0.45); s.b.hat.position.set(0.2 * hk, -0.9 * ease.in(hk), 0.35 * hk); s.b.hat.rotation.z = -1.4 * hk;
    camMove(s.stage, t, [[0, { pos: [0.3, 5.6, 16.5], look: [0.3, 1.4, WZ + 1.5], fov: 50 }], [info.dur, { pos: [0.3, 5.3, 15.5], look: [0.3, 1.4, WZ + 1.5], fov: 49 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, RAYS);
    const [x, y] = scr(s.stage, [0, 3.8, WZ]); stink(g, x, y, t);
    reactions(g, t, s, [{ fx: 'question', on: 'v', at: 0.8, scale: 0.8 }, { fx: 'sweat', on: 'a', at: 0.9 }]);
  },
});

// ---- s12: "Oregon now buries whales." a sand mound with flukes sticking out; a crew member pats it down with a shovel.
registerShot('s12', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 38, shadowSize: 10, target: [0, 1, 0] });
    const env = beach(st, { seed: 8 });
    const mound = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 16), toon('#e2c78e')); mound.scale.set(3.4, 1.3, 2.0); mound.castShadow = true; mound.receiveShadow = true; st.add(mound);
    const w = new THREE.Group(); const dk = toon('#46546a'); const stk = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), toon('#5d6d86')); stk.scale.set(0.42, 1.0, 0.42); stk.position.y = 1.4; stk.castShadow = true; w.add(stk);
    for (const sd of [-1, 1]) { const f = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), dk); f.scale.set(0.9, 0.32, 0.12); f.position.set(sd * 0.75, 2.45, 0); f.rotation.z = sd * 0.35; f.castShadow = true; w.add(f); }
    outline(w, { px: 2.8 }); w.position.set(-1.2, 0, 0); st.add(w);   // only the flukes poke out of the mound
    const a = worker({ seed: 7 }); a.position.set(1.6, 0, 1.9); a.rotation.y = -0.7; st.add(a);
    const sh = new THREE.Group(); sh.add(cyl(0.04, 0.04, 1.6, '#8a5a32', 0, 0, 0, 8)); const bl = rbox(0.36, 0.42, 0.05, '#9aa4ac', 0, -0.9, 0, 0.04); sh.add(bl); outline(sh, { px: 2.4 }); st.add(sh);
    outline(mound, { px: 2.4 });
    return { stage: st, env, w, a, sh };
  },
  draw(s, t, info) {
    s.env.update(t);
    const pat = Math.max(0, Math.sin(t * 7));
    s.a.pose(addPose({ ...POSE.stand, armR: [1.2 + pat * 0.6, 0.0, 0], elbowR: 0.4, armL: [1.0 + pat * 0.5, -0.2, 0], elbowL: 0.6, lean: 0.25 }, idle(t, 4))); s.a.face(EXPR.smug, t);
    v3.set(0, 0, 0); s.a.hand.R.getWorldPosition(v3); s.sh.position.set(v3.x, v3.y - 0.2, v3.z); s.sh.rotation.set(0.5, 0, 0.9 + pat * 0.3);
    camMove(s.stage, t, [[0, { pos: [0.2, 3.0, 12.5], look: [0.0, 1.6, 0], fov: 40 }], [info.dur, { pos: [0.2, 2.9, 11.4], look: [0.0, 1.6, 0], fov: 39 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'sparkle', on: 'a', at: 0.5, scale: 0.6 }]); },
});

// ---- park set: riverside lawn, trees, picnic tables, a wooden sign with the park's real name
const SIGN = ['EXPLODING WHALE', 'MEMORIAL PARK'];
function parkInit(T) {
  const st = toonStage(T, { light: 'sunny', fov: 38, shadowSize: 12, target: [0, 1, 0] });
  const env = beach(st, { seed: 9, seaZ: -12, dunes: false });
  const lawn = floor(80, 30, '#86b85a', 0, 8); lawn.position.y = 0.02; st.add(lawn);
  for (const [x, z] of [[-7, -3], [-4.5, -5], [6, -4], [8.5, -2], [-9, 1]]) { const tr = new THREE.Group(); tr.add(cyl(0.18, 0.24, 1.6, '#7a5032', 0, 0.8, 0, 10)); const c1 = new THREE.Mesh(new THREE.ConeGeometry(1.3, 2.6, 12), toon('#3f7a3a')); c1.position.y = 2.6; c1.castShadow = true; tr.add(c1); const c2 = new THREE.Mesh(new THREE.ConeGeometry(1.0, 2.0, 12), toon('#4f8f44')); c2.position.y = 3.7; c2.castShadow = true; tr.add(c2); outline(tr, { px: 2.2 }); tr.position.set(x, 0, z); st.add(tr); }
  const pt = PR.table({ w: 2.2, d: 1.0, h: 0.8, color: '#9a6a3a' }); pt.position.set(4.2, 0, 1.4); st.add(pt);
  const fam = [local({ seed: 41, main: '#e86a6a' }), local({ seed: 42, main: '#4aa0d8', hair: 'bun', hairColor: '#2a1a10', skin: 'brown' }), local({ seed: 43, main: '#f2c84a', scale: 0.7, hair: 'pigtails' })];
  fam.forEach((f, i) => { f.position.set([1.9, 2.9, 2.3][i], 0, [-1.6, -1.2, 0.4][i]); f.rotation.y = -0.5; st.add(f); });
  const sign = new THREE.Group(); const tex = canvasTex(1024, 420, (x, w, h) => { x.fillStyle = '#7a4a26'; x.fillRect(0, 0, w, h); x.strokeStyle = '#4a2a14'; x.lineWidth = 22; x.strokeRect(11, 11, w - 22, h - 22); x.fillStyle = '#f6e7c4'; x.font = '900 96px "Nunito", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(SIGN[0], w / 2, 135, w - 80); x.fillText(SIGN[1], w / 2, 280, w - 80);
    x.fillStyle = '#f6e7c4'; x.beginPath(); x.ellipse(w / 2, 372, 70, 20, 0, 0, 7); x.fill(); });
  const board = new THREE.Mesh(new THREE.BoxGeometry(3.8, 1.56, 0.18), [toon('#7a4a26'), toon('#7a4a26'), toon('#7a4a26'), toon('#7a4a26'), toon('#ffffff', { map: tex }), toon('#7a4a26')]); board.position.y = 2.3; board.castShadow = true; sign.add(board);
  for (const x of [-1.6, 1.6]) sign.add(cyl(0.12, 0.12, 2.2, '#5a3a1e', x, 1.1, -0.12, 8));
  outline(sign, { px: 2.6 }); sign.position.set(-0.6, 0, 0); sign.rotation.y = 0.12; st.add(sign);
  return { stage: st, env, fam, sign };
}
function parkDraw(s, t) {
  s.env.update(t);
  s.fam.forEach((f, i) => { f.pose(addPose(i === 2 ? { ...POSE.armsUp } : POSE.stand, idle(t, 11 + i))); f.face(EXPR.happy, t); });
}
// ---- s13: "And it named a park after this one..." the camera rises from the river toward the sign.
registerShot('s13', { kind: '3d',
  init: parkInit,
  draw(s, t, info) { parkDraw(s, t); s.sign.position.y = lerp(-2.8, 0, ease.outBack(prog(t, 0.2, 0.75)));
    camMove(s.stage, t, [[0, { pos: [0.8, 1.4, 15.5], look: [-0.3, 2.4, 0], fov: 44 }], [info.dur, { pos: [0.4, 2.0, 13.5], look: [-0.4, 2.2, 0], fov: 42 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'hearts', on: s.fam[1], at: 0.6 }]); },
});
// ---- s14: PAYOFF "Exploding Whale Memorial Park." close on the sign, family cheers -> hard cut to s01 (loop).
registerShot('s14', { kind: '3d',
  init: parkInit,
  draw(s, t, info) { parkDraw(s, t);
    camMove(s.stage, t, [[0, { pos: [0.3, 2.4, 12.0], look: [0.0, 2.1, 0], fov: 40 }], [info.dur, { pos: [0.3, 2.4, 11.0], look: [0.0, 2.1, 0], fov: 40 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'sparkle', on: [-0.6, 3.4, 0], at: 0.1, scale: 1.2 }, { fx: 'hearts', on: s.fam[2], at: 0.5 }]); },
});

// ---- q07: "...beyond all believable bounds." the real 1970 news line as a retro TV card; every B pops gold.
registerShot('q07', {
  draw(g, t, info) {
    voidBg(g, '#2a3a5a', '#101626');
    const k = ease.outBack(clamp(t / 0.25));
    g.save(); g.translate(E.W / 2, 860); g.scale(k, k);
    g.fillStyle = '#7a4a26'; g.strokeStyle = CARD_INK; g.lineWidth = 12; g.beginPath(); g.roundRect(-470, -380, 940, 760, 60); g.fill(); g.stroke();
    g.fillStyle = '#cfe6d8'; g.beginPath(); g.roundRect(-400, -320, 680, 560, 80); g.fill(); g.lineWidth = 8; g.stroke();
    for (let i = 0; i < 2; i++) { g.fillStyle = '#d8b46a'; g.beginPath(); g.arc(370, -180 + i * 160, 42, 0, 7); g.fill(); g.stroke(); }
    for (let i = 0; i < 12; i++) { g.fillStyle = 'rgba(30,60,50,.07)'; g.fillRect(-400, -320 + ((t * 300 + i * 48) % 560), 680, 10); }
    insT(g, '1970 NEWS:', -60, -230, 52, { color: '#2a5a4a', stroke: null });
    const L = [['"...the blast', 'blast'], ['blasted blubber', 'blasted'], ['beyond all', 'beyond'], ['believable', 'believable'], ['bounds."', 'bounds']];
    L.forEach(([w, cue], i) => { const t0 = i < 3 ? 0.05 + i * 0.12 : at(info, cue, 0.3 + i * 0.3) - 0.1; const kk = ease.outBack(clamp((t - t0) / 0.2)); if (kk <= 0) return;
      g.save(); g.translate(-60, -130 + i * 92); g.scale(kk, kk); insT(g, w, 0, 0, 76, { color: /bl|bo|be/.test(w) ? '#ffd25a' : '#ffffff', stroke: CARD_INK, maxW: 640 }); g.restore(); });
    g.restore();
  },
});
