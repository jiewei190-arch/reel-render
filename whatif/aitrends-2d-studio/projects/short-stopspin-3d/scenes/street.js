// street.js — the sunny street: s002 racing east, s003 can't feel it, s005 giant face, s006 you keep going, s007 the air, s013 everything flies.
// EAST = +X = screen right. The HERO (mustard hoodie, hood up) stands at the origin facing the camera with a takeaway coffee.
import { registerShot, ease, prog, clamp, lerp, text, E, FONTS } from '/engine/core.js';
import { POSE, EXPR, idle, addPose, mixPose, mixExpr, tremble } from '/kits/toon3d/rig.js';
import { castMember } from '/kits/toon3d/cast.js';
import { camMove, drift } from '/kits/toon3d/toon.js';
import { THREE, at, screen, tag, speedLines, streetStage, heroWithCoffee, coffee, SIP, HOLDCUP, flyPose, bird, rng, noise } from './_lib.js';

const _v = new THREE.Vector3();
function scene(T, o = {}) { const s = streetStage(T, o); s.hero = heroWithCoffee(); s.stage.add(s.hero); return s; }
// sip cycle: lift the cup over [a, b] (k 0..1..0)
const sipK = (t, a, b) => Math.sin(Math.PI * prog(t, a, b)) ** 0.6;
// chunky 2D arrow with a label (EAST ->)
function arrow(g, x, y, k, label = 'EAST') {
  if (k <= 0) return; g.save(); g.translate(x, y); const s = 0.6 + 0.4 * ease.outBack(clamp(k * 1.5)); g.scale(s, s); g.globalAlpha = clamp(k * 3);
  g.lineJoin = 'round'; g.beginPath(); g.moveTo(-230, -48); g.lineTo(90, -48); g.lineTo(90, -105); g.lineTo(240, 0); g.lineTo(90, 105); g.lineTo(90, 48); g.lineTo(-230, 48); g.closePath();
  g.fillStyle = '#ffd25a'; g.strokeStyle = '#20161a'; g.lineWidth = 18; g.stroke(); g.fill();
  text(g, label, -60, 4, { size: 72, color: '#20161a', weight: 700 }); g.restore();
}

// s002 "Right now, the ground under you is racing east," — wide-medium: the hero sipping on a sunny street; a gold EAST arrow
// streaks across on "racing" (the whole street is moving with you, so nothing looks like it moves: that's the joke).
registerShot('s002', { kind: '3d',
  init(T) { return scene(T); },
  draw(s, t, info) {
    const k = sipK(t, 0.3, 1.4); s.hero.pose(addPose(SIP(k, HOLDCUP), idle(t, 2))); s.hero.face(mixExpr(EXPR.happy, { ...EXPR.happy, lid: 0.7, lower: 0.5 }, k), t);
    const d = drift(t, 0.04, 3); camMove(s.stage, t, [[0, { pos: [3.2 + d[0], 2.4 + d[1], 11.5], look: [0.4, 2.0, -1], fov: 40 }], [info.dur, { pos: [2.4, 2.3, 10.2], look: [0.3, 1.9, -1], fov: 38 }]]);
  },
  overlay(g, t, info, s) { const r = at(info, 'racing', 1.0); tag(g, 'EARTH SPIN: ON', prog(t, 0.05, 0.35), 0.12); const k = prog(t, r - 0.1, r + 1.2);
    if (k > 0 && k < 1) { speedLines(g, t, Math.sin(Math.PI * k) * 0.8, { dir: 1, y0: E.H * 0.42, y1: E.H * 0.6, n: 10, color: 'rgba(255,210,90,.9)' }); arrow(g, lerp(-300, E.W + 300, ease.inOut(k)), E.H * 0.53, Math.sin(Math.PI * k) * 2); } },
});
// s003 "and you can't feel it." — medium-close: lowers the cup, content "ahh", then a deadpan look into the lens on "feel"
registerShot('s003', { kind: '3d',
  init(T) { return scene(T); },
  draw(s, t, info) { const f = at(info, 'feel', 0.9); const k = sipK(t, -0.4, 0.5), look = ease.inOut(prog(t, f - 0.1, f + 0.25));
    s.hero.pose(addPose(SIP(k, HOLDCUP), { ...idle(t, 4), headTilt: 0.12 * (1 - look), headNod: -0.05 * look }));
    s.hero.face(mixExpr({ ...EXPR.happy, lid: 0.55, lower: 0.5, pupil: [0.3, 0.2] }, { ...EXPR.smug, pupil: [0, 0], browL: 0.5 }, look), t);
    camMove(s.stage, t, [[0, { pos: [0.9, 2.15, 5.6], look: [0.1, 1.85, 0], fov: 34 }], [info.dur, { pos: [0.6, 2.15, 4.6], look: [0.05, 1.9, 0], fov: 33 }]]); },
});
// s005 "Instantly." — giant face: calm sip -> eyes SNAP wide on "Instantly", tremble, slow push
registerShot('s005', { kind: '3d',
  init(T) { return scene(T); },
  draw(s, t, info) { const w = at(info, 'Instantly', 0.11); const snap = t >= w ? 1 : 0;
    s.hero.pose(addPose(snap ? addPose(HOLDCUP, { shrugY: 0.06, headNod: -0.08 }) : SIP(0.15, HOLDCUP), snap ? tremble(t, 1.6) : idle(t, 4)));
    s.hero.face(snap ? mixExpr(EXPR.shocked, { ...EXPR.shocked, pupilSize: 0.55, mouth: 'scream', mouthW: 0.7 }, prog(t, w + 0.4, w + 0.8)) : { ...EXPR.happy, lid: 0.55 }, t, { blink: !snap });
    const sh = snap ? Math.max(0, 1 - (t - w) * 4) * 0.035 : 0; const z = lerp(3.0, 2.55, ease.out(prog(t, w, w + 0.25)) * snap + prog(t, 0, info.dur) * 0.1);
    s.stage.cam([0.05 + Math.sin(t * 70) * sh, 2.16 + Math.cos(t * 63) * sh, z], [0, 2.08, 0], 30); },
});
// s006 "But you don't." — the street jolts to a stop; on "don't" the hero keeps going: launched east, coffee flies, birds scatter
registerShot('s006', { kind: '3d',
  init(T) { const s = scene(T); s.cup2 = coffee(); s.cup2.visible = false; s.stage.add(s.cup2);
    s.drops = [...Array(9)].map((_, i) => { const d = new THREE.Mesh(new THREE.SphereGeometry(0.06 + (i % 3) * 0.02, 8, 6), new THREE.MeshToonMaterial({ color: '#6a3a1e' })); d.visible = false; s.stage.add(d); return d; });
    s.birds = [[-2.4, 3.96, 2.3], [3.6, 4.2, 2.3], [3.9, 4.2, 2.3]].map(([x, y, z], i) => { const b = bird(); b.position.set(x, y + 0.16, z); b.rotation.y = i ? Math.PI : 0; s.stage.add(b); b.userData.p0 = [x, y + 0.16, z]; return b; });
    return s; },
  draw(s, t, info) { const d0 = at(info, "don't", 0.36), L = Math.max(0, t - d0 + 0.08);
    const flyK = ease.in(clamp(L / 0.9)); const x = L * L * 5 + L * 2.5, y = Math.min(L * 3.2, 1.6) + Math.sin(L * 2) * 0.3;
    s.hero.position.set(x, y, 0); s.hero.rotation.z = -lerp(0, 1.25, ease.out(clamp(L * 2.5)));
    s.hero.pose(L > 0 ? flyPose(t, 1) : addPose(HOLDCUP, tremble(t, 0.6))); s.hero.face(L > 0 ? EXPR.panic : mixExpr(EXPR.neutral, EXPR.worried, prog(t, 0, 0.3)), t);
    // the cup leaves the hand at launch + 0.12 s
    const rel = 0.12; s.hero.cup.visible = L < rel; s.cup2.visible = L >= rel;
    if (L >= rel) { const Lc = L - rel; s.cup2.position.set(0.55 + Lc * 6.5, 1.3 + Lc * 4 - Lc * Lc * 2, 0.3); s.cup2.rotation.z = -Lc * 9;
      s.drops.forEach((d, i) => { d.visible = true; const a = (i / 9) * 1.2 - 0.3; d.position.set(0.6 + Lc * (5 + i * 0.4), 1.5 + Lc * (3 + a * 3) - Lc * Lc * 3, 0.3 + (i % 3 - 1) * 0.1); }); }
    else s.drops.forEach(d => (d.visible = false));
    s.birds.forEach((b, i) => { const [bx, by, bz] = b.userData.p0; const k = Math.max(0, t - d0 - 0.05 * i); b.position.set(bx + k * k * 8 + k * 2, by + k * 2.2, bz); b.wing.rotation.x = k > 0 ? Math.sin(t * 40 + i) * 0.9 : 0; b.rotation.z = -k * 0.6; });
    const jolt = Math.max(0, 1 - t * 5) * 0.08; const pan = ease.inOut(prog(t, d0 + 0.2, info.dur)) * 2.2;
    s.stage.cam([0.4 + pan + Math.sin(t * 80) * jolt, 2.2 + Math.cos(t * 70) * jolt, 9.2], [0.3 + pan * 1.3, 1.9, 0], 40); },
  overlay(g, t, info) { const d0 = at(info, "don't", 0.36); speedLines(g, t, prog(t, d0, d0 + 0.2) * 0.6, { dir: 1, n: 14 }); },
});
// s007 "Neither does the air." — the wind keeps going east: trees bend, leaves + papers fly, TOMAS hangs on to a lamp post, cap gone
registerShot('s007', { kind: '3d',
  init(T) { const s = scene(T); s.hero.visible = false; s.tomas = castMember('tomas'); s.stage.add(s.tomas);
    s.cap = new THREE.Group(); { const c = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 10, 0, Math.PI * 2, 0, 1.2), new THREE.MeshToonMaterial({ color: '#2f6fc0' })); s.cap.add(c); } s.stage.add(s.cap);
    const r = rng(12); s.junk = [...Array(26)].map((_, i) => { const leaf = i % 3; const m = new THREE.Mesh(leaf ? new THREE.PlaneGeometry(0.28, 0.18) : new THREE.PlaneGeometry(0.42, 0.55), new THREE.MeshToonMaterial({ color: leaf ? (i % 2 ? '#6fbf4a' : '#e0a02a') : '#fbf8f2', side: THREE.DoubleSide })); s.stage.add(m); m.userData = { y: 0.5 + r() * 5, z: -2 + r() * 5, ph: r(), sp: 9 + r() * 6 }; return m; });
    return s; },
  draw(s, t, info) { const gust = 0.75 + 0.25 * Math.sin(t * 7);
    s.set.props.trees.forEach((tr, i) => { tr.canopy.rotation.z = -0.35 * gust - 0.06 * Math.sin(t * 13 + i); tr.canopy.position.x = 0.5 * gust; });
    const P = 3.2; s.tomas.position.set(P + 2.15, 2.75 + Math.sin(t * 11) * 0.1, 2.3); s.tomas.rotation.z = Math.PI / 2 + Math.sin(t * 9) * 0.08;
    s.tomas.pose(addPose(POSE.armsUp, { armL: [0, -0.35, 0], armR: [0, -0.35, 0], elbowL: 0.5, elbowR: 0.5, legL: [Math.sin(t * 17) * 0.4, 0.1], legR: [-Math.sin(t * 17) * 0.4, 0.1], kneeL: 0.3, kneeR: 0.3, headTurn: 0.5, headNod: 0.25 }));
    s.tomas.face({ ...EXPR.panic, pupil: [0.6, 0.1] }, t);
    s.tomas.parts.head.children.forEach(c => { if (c.material?.color?.getHexString?.() === '2f6fc0') c.visible = false; });
    const cl = t + 0.3; s.cap.position.set(P + 4.6 + cl * 7, 3.6 + Math.sin(cl * 5) * 0.4, 2.3); s.cap.rotation.set(cl * 5, cl * 3, cl * 7);
    s.junk.forEach((m, i) => { const u = m.userData; const x = -14 + ((t * u.sp + u.ph * 30) % 30); m.position.set(x, u.y + Math.sin(t * 4 + i) * 0.4, u.z); m.rotation.set(t * 6 + i, t * 4 + i, t * 5); });
    const d = drift(t, 0.05, 6); camMove(s.stage, t, [[0, { pos: [4.6 + d[0], 3.0 + d[1], 11.5], look: [4.4, 2.5, 0], fov: 42 }], [info.dur, { pos: [4.4, 3.0, 10.4], look: [4.6, 2.6, 0], fov: 40 }]]); },
  overlay(g, t) { speedLines(g, t, 0.75, { dir: 1, n: 18, color: 'rgba(255,255,255,.75)' }); },
});
// s013 "Everything not bolted" — high wide: the car, bench, bin, café table and trees lift off and drift east
registerShot('s013', { kind: '3d',
  init(T) { const s = scene(T, { shadowSize: 14 }); s.hero.visible = false; const P = s.set.props;
    P.car.position.set(-3.5, 0, 4.2); P.car2.position.set(5.5, 0, 4.6); P.bench.position.set(2.2, 0, -2.4); P.bin.position.set(0.8, 0, 1.8); P.table.position.set(-1.8, 0, -2.0); P.trees[1].position.x = -4.5; P.trees[2].position.x = 4.0; P.lamps[1].position.x = 1.8;
    s.loose = [P.car, P.car2, P.bench, P.bin, P.table, ...P.trees, ...P.lamps].map((o, i) => ({ o, p: o.position.clone(), ph: i * 0.37, w: 0.5 + (i % 4) * 0.25 })); return s; },
  draw(s, t, info) { const b = at(info, 'bolted', 0.7);
    s.loose.forEach(({ o, p, ph, w }, i) => { const L = Math.max(0, t - 0.1 - (i % 5) * 0.08) * 0.75; const shake = L > 0 ? 0 : Math.sin(t * 50 + i) * 0.04; o.position.set(p.x + L * L * 3 * w + L * 1.5 + shake, p.y + Math.min(L * 2.6 * w, 3) + Math.sin(L * 3 + ph) * 0.2 * (L > 0), p.z); o.rotation.z = -L * 0.8 * w; o.rotation.x = L * 0.3 * Math.sin(ph); });
    s.set.buildings.forEach((bd, i) => { bd.position.x += 0; bd.rotation.z = Math.sin(t * 40 + i) * 0.004; });
    const d = drift(t, 0.04, 9); camMove(s.stage, t, [[0, { pos: [-3 + d[0], 9.5 + d[1], 21], look: [1, 1.8, 0], fov: 42 }], [info.dur, { pos: [-1.5, 8.5, 18.5], look: [3, 2.2, 0], fov: 42 }]]); },
  overlay(g, t, info) { speedLines(g, t, 0.55, { dir: 1, n: 14, color: 'rgba(255,255,255,.7)', y0: E.H * 0.05, y1: E.H * 0.55 }); tag(g, 'NOT BOLTED DOWN?', prog(t, at(info, 'bolted', 0.7) - 0.1, at(info, 'bolted', 0.7) + 0.2), 0.12); },
});
