// The 1970 exploding whale (Florence, Oregon). 24 shots, Toon 3D + BEANMEN effects (Justin clips funny-factual style).
// s01 = frame 1 (already moving: a fuse fizzing toward the whale, a gull in a napkin bib, ticking), 2-line top caption 0-3.5 s.
// s24 ends on frame 1's exact camera with a fresh fuse fizzing -> seamless loop.
import { registerShot, ease, prog, clamp, lerp, E, wordTime } from '/engine/core.js';
import { camMove, THREE, ball, cyl, outline, toon, rbox } from '/kits/toon3d/toon.js';
import { POSE, EXPR, mixPose, mixExpr, addPose, idle, run, shrug, point, tremble } from '/kits/toon3d/rig.js';
import { shakeCam, anchor } from '/kits/toon3d/react.js';
import { insertShot } from '/kits/toon3d/insert.js';
import { at, beachStage, whale, gull, person, worker, dynamiteCrate, plunger, cone, signPost, parkSign, sedan, blubber, blobRain, boomCloud,
  chip, stamp, fxr, topCaption, boomText, beachLook, TXT } from './_lib.js';

const atN = (info, word, n, fb = 0) => { let tt = info.shot.start - 0.1, r = null; for (let i = 0; i < n; i++) { r = wordTime(word, tt); if (r == null) return fb; tt = r + 0.05; } return r - info.shot.start; };
const gt = (info, t) => info.shot.start + t;
const look = (g, t, o) => beachLook(g, t, o);
const W2 = E.W / 2;

// ---------------------------------------------------------------- stages
// the whale lies on the sand, head to the right, angled a little toward camera
function whaleBeach(T, o = {}) { const s = beachStage(T, { seed: o.seed || 4, clear: 8, target: [0, 0, 0], shadowSize: 11 });
  s.w = whale(); s.w.position.set(0, 0, 0); s.w.rotation.y = -1.0; s.stage.add(s.w);
  if (o.gull !== false) { s.g = gull({ bib: true }); s.g.position.set(-1.04, 2.95, -0.88); s.g.rotation.y = 0.2; s.stage.add(s.g); }
  if (o.fuse) { s.fuse = fuse(s.stage, o.fuse); }
  return s; }
// a fuse line on the sand running from the foreground to the whale, with a fizzing spark at fraction k
function fuse(st, o = {}) { const pts = [new THREE.Vector3(2.2, 0.06, 11.5), new THREE.Vector3(0.6, 0.06, 8.6), new THREE.Vector3(1.2, 0.06, 5.8), new THREE.Vector3(-0.6, 0.06, 3.6), new THREE.Vector3(-1.45, 0.6, 2.25)];
  const curve = new THREE.CatmullRomCurve3(pts); const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 60, 0.035, 6), toon('#5a3a22')); tube.userData.noOutline = true; st.add(tube);
  const spark = new THREE.Group(); const core = ball(0.1, '#fff4a0', 0, 0, 0, 10); core.material = toon('#fff4a0', { emissive: new THREE.Color('#ffcc33'), emissiveIntensity: 1, fresh: true }); spark.add(core);
  const rays = []; for (let i = 0; i < 8; i++) { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.32, 4).translate(0, 0.16, 0), toon('#ffd23a', { emissive: new THREE.Color('#ffaa22'), emissiveIntensity: 1, fresh: true })); r.userData.noOutline = true; spark.add(r); rays.push(r); }
  st.add(spark); const crate = dynamiteCrate({ sticks: true }); crate.position.set(-1.6, 0, 1.75); crate.rotation.y = -0.5; crate.scale.setScalar(0.9); st.add(crate);
  return { tube, spark, crate, set(k, t) { const kk = clamp(k); spark.position.copy(curve.getPoint(kk)); spark.visible = kk < 0.999; rays.forEach((r, i) => { r.rotation.set(Math.sin(t * 40 + i * 2) * 1.4, i, Math.cos(t * 37 + i) * 1.4); r.scale.y = 0.5 + 0.5 * Math.abs(Math.sin(t * 50 + i)); }); } }; }
// a crowd on the beach (facing camera = facing the whale behind the camera)
function crowdBeach(T, o = {}) { const s = beachStage(T, { seed: o.seed || 6, clear: 4, target: [0, 0, 2] }); s.ppl = [];
  const spots = o.spots || [[-2.2, 0.4], [-0.75, 0.9], [0.75, 0.6], [2.2, 0.2], [-1.5, -1.0], [0.1, -1.2], [1.6, -1.1], [-3.0, -1.4], [3.0, -1.6]];
  spots.forEach(([x, z], i) => { const p = person(i); p.position.set(x, 0, z); p.rotation.y = -x * 0.06; s.stage.add(p); s.ppl.push(p); });
  return s; }

// frame-1 framing (s01 start == s24 end)
const F1 = { pos: [1.6, 5.2, 18.5], look: [0.5, 1.3, 0.6], fov: 40 };
const F1b = { pos: [1.5, 5.0, 17.4], look: [0.5, 1.3, 0.6], fov: 40 };
const gullIdle = (s, t, u = {}) => s.g?.update(t, { look: [Math.sin(t * 1.3) * 0.5, 0.1], beak: Math.max(0, Math.sin(t * 5)) * 0.4, ...u });
const CAP = [[['1970:', '#ffffff'], ['a', '#ffffff'], ['DEAD', '#ffffff'], ['WHALE', '#ffd23a']], [['vs.', '#ffffff'], ['DYNAMITE', '#ff5a4a']]];

// s01 "In 1970, Oregon removed" — FRAME 1: fuse fizzing toward the whale, gull in a bib waiting, ticking
registerShot('s01', { kind: '3d',
  init(T) { return whaleBeach(T, { fuse: {} }); },
  draw(s, t, info) { s.beach.update(t); s.w.update(t); gullIdle(s, t); s.fuse.set(0.08 + t / (info.dur + 3.2) * 0.8, t); camMove(s.stage, t, [[0, F1], [info.dur, F1b]], ease.out); },
  overlay(g, t, info, s) { look(g, t); topCaption(g, gt(info, t), CAP);
    fxr(g, t, s, [{ fx: 'sparkle', on: s.fuse.spark.position.clone(), at: 0, until: info.dur, scale: 0.6 }, { fx: 'question', on: 'g', at: 0.5, until: info.dur, scale: 0.8 }]); },
});
// s02 "a dead whale..." — push in on the whale's closed eye; stink lines; gull licks its beak (sweat drop: it's waiting)
registerShot('s02', { kind: '3d',
  init(T) { return whaleBeach(T, { fuse: {} }); },
  draw(s, t, info) { s.beach.update(t); s.w.update(t, { stink: 1.4 }); gullIdle(s, t, { look: [-0.6, 0.2], beak: 0.6 + Math.sin(t * 9) * 0.3 }); s.fuse.set(0.55 + t * 0.05, t);
    camMove(s.stage, t, [[0, { pos: [5.0, 3.2, 12.0], look: [0.8, 1.9, 2.6], fov: 38 }], [info.dur, { pos: [4.6, 3.1, 10.8], look: [0.8, 1.9, 2.8], fov: 38 }]]); },
  overlay(g, t, info, s) { look(g, t); topCaption(g, gt(info, t), CAP); const dw = at(info, 'dead', 0.1);
    chip(g, 'DEAD', W2 + 230, E.H * 0.55, t - dw - 0.1, { size: 60, color: '#ffffff', rot: 6 });
    fxr(g, t, s, [{ fx: 'hearts', on: 'g', at: 0.3, scale: 0.8 }]); },
});
// s03 "with dynamite." — the crate slams into frame, spark hits it: a tiny BOOM teaser + flash (the signature gag, seen at ~2 s)
registerShot('s03', { kind: '3d',
  init(T) { return whaleBeach(T, { fuse: {} }); },
  draw(s, t, info) { s.beach.update(t); s.w.update(t); const dy = at(info, 'dynamite', 0.15); const kb = prog(t, dy + 0.35, dy + 0.45);
    gullIdle(s, t, { look: [-0.2, -0.3], lid: 0, flap: kb > 0 ? 1 : 0 }); if (s.g && kb > 0) s.g.position.y = 2.95 + ease.out(prog(t, dy + 0.4, dy + 0.9)) * 1.5;
    s.fuse.set(lerp(0.85, 1, prog(t, 0, dy + 0.4)), t);
    camMove(s.stage, t, [[0, { pos: [0.2, 1.7, 6.0], look: [-1.5, 0.7, 1.75], fov: 38 }], [info.dur, { pos: [0.0, 1.6, 5.3], look: [-1.5, 0.7, 1.75], fov: 38 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: dy + 0.4, amp: 0.12, dur: 0.4 }]); },
  overlay(g, t, info, s) { look(g, t); topCaption(g, gt(info, t), CAP); const dy = at(info, 'dynamite', 0.15);
    fxr(g, t, s, [{ fx: 'flash', at: dy + 0.4, dur: 0.22 }]); boomText(g, W2, E.H * 0.42, t - dy - 0.4, { s: 0.75, dur: 1.0 }); },
});

// s04 "A 45-foot sperm whale had washed up" — wide beach: a ruler card along the whale, tiny bean for scale
registerShot('s04', { kind: '3d',
  init(T) { const s = whaleBeach(T, { gull: false }); s.p = person(2); s.p.position.set(2.6, 0, 7.6); s.p.rotation.y = -0.4; s.stage.add(s.p); return s; },
  draw(s, t, info) { s.beach.update(t); s.w.update(t); const ft = at(info, '45', 0.2);
    s.p.pose(mixPose(POSE.stand, point(POSE.stand, 'R', 1, { up: 0.1 }), ease.out(prog(t, ft, ft + 0.3)))); s.p.face(t > ft ? EXPR.shocked : EXPR.neutral, t);
    camMove(s.stage, t, [[0, { pos: [2.4, 6.0, 25], look: [0.4, 1.6, 1.0], fov: 40 }], [info.dur, { pos: [2.2, 5.8, 23.5], look: [0.4, 1.6, 1.0], fov: 40 }]]); },
  overlay(g, t, info, s) { look(g, t); const ft = at(info, '45', 0.2); const a = anchor(s.stage, [-3.0, 3.7, -4.7]), b = anchor(s.stage, [3.2, 3.7, 4.9]);
    const k = ease.out(prog(t, ft - 0.1, ft + 0.45)); if (k > 0) { g.save(); g.lineCap = 'round'; const x2 = lerp(a.x, b.x, k), y2 = lerp(a.y, b.y, k);
      g.strokeStyle = '#2a1c15'; g.lineWidth = 26; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(x2, y2); g.stroke(); g.strokeStyle = '#ffd23a'; g.lineWidth = 14; g.stroke();
      for (let i = 0; i <= 9; i++) { const u = i / 9; if (u > k) break; const x = lerp(a.x, b.x, u), y = lerp(a.y, b.y, u); g.strokeStyle = '#2a1c15'; g.lineWidth = 6; g.beginPath(); g.moveTo(x, y - 16); g.lineTo(x, y + 16); g.stroke(); } g.restore(); }
    chip(g, '45 FT', (a.x + b.x) / 2, Math.min(a.y, b.y) - 90, t - ft - 0.3, { size: 76, color: '#ffd23a', rot: -4 });
    chip(g, 'SPERM WHALE', W2, E.H * 0.2, t - at(info, 'sperm', 0.7), { size: 60, color: '#ffffff', rot: 3 });
    fxr(g, t, s, [{ fx: 'exclaim', on: 'p', at: ft + 0.1 }]); },
});
// s05 "on the beach in Florence, Oregon." — the beach sign + a beachgoer pinching his nose (sweat)
registerShot('s05', { kind: '3d',
  init(T) { const s = whaleBeach(T, { gull: false }); s.sign = signPost('FLORENCE, OR', { w: 2.4, bg: '#3a7a4a', fg: '#ffffff' }); s.sign.position.set(-4.2, 0, 4.6); s.sign.rotation.y = 0.4; s.stage.add(s.sign);
    s.p = person(1); s.p.position.set(-2.4, 0, 5.2); s.p.rotation.y = 0.2; s.stage.add(s.p); return s; },
  draw(s, t, info) { s.beach.update(t); s.w.update(t, { stink: 1.5 }); s.p.pose(addPose(mixPose(POSE.stand, POSE.facepalm, 0.85), tremble(t, 0.6))); s.p.face(mixExpr(EXPR.worried, EXPR.sad, 0.4), t);
    camMove(s.stage, t, [[0, { pos: [-5.5, 2.6, 11.5], look: [-2.0, 1.8, 2.5], fov: 38 }], [info.dur, { pos: [-5.0, 2.5, 10.6], look: [-2.0, 1.8, 2.5], fov: 38 }]]); },
  overlay(g, t, info, s) { look(g, t); chip(g, 'FLORENCE, OREGON', W2, E.H * 0.18, t - at(info, 'florence', 0.6), { size: 62, color: '#ffd23a', rot: -3 });
    fxr(g, t, s, [{ fx: 'sweat', on: 'p', at: 0.2, until: info.dur }]); },
});

// s06 "8 tons," — INSERT 1: big "8 TONS" over the whale, which sags on the sand
const tonsScene = { init(T) { return whaleBeach(T, { gull: false }); },
  draw(s, t) { s.beach.update(t); s.w.update(t, { squash: 0.5 + Math.sin(t * 3) * 0.2 }); camMove(s.stage, t, [[0, { pos: [1.6, 4.4, 16], look: [0, 1.4, 0.5], fov: 40 }], [2.5, { pos: [1.5, 4.2, 15], look: [0, 1.4, 0.5], fov: 40 }]]); } };
insertShot('s06', { scene: tonsScene, dim: 0.45, insert: { type: 'bigtext', kicker: 'WEIGHT', title: '8 TONS', lines: ['of dead whale'], color: '#ffd23a' } });
// s07 "rotting," — close on the stink: green wavy lines; a gull holds its nose with a wing
registerShot('s07', { kind: '3d',
  init(T) { return whaleBeach(T, {}); },
  draw(s, t, info) { s.beach.update(t); s.w.update(t, { stink: 2.0 }); gullIdle(s, t, { look: [0.3, -0.2], lid: 0.55 }); if (s.g) s.g.rotation.y = 0.5 + Math.sin(t * 8) * 0.08;
    camMove(s.stage, t, [[0, { pos: [0.4, 3.9, 3.6], look: [-1.0, 3.3, -0.8], fov: 38 }], [info.dur, { pos: [0.3, 3.85, 3.1], look: [-1.0, 3.35, -0.8], fov: 38 }]]); },
  overlay(g, t, info, s) { look(g, t); chip(g, 'ROTTING', W2, E.H * 0.2, t - 0.05, { size: 70, color: '#9acb5a', rot: -4 }); fxr(g, t, s, [{ fx: 'sweat', on: 'g', at: 0.15, until: info.dur, scale: 0.9 }]); },
});
// s08 "and the state highway department got the job." — the highway worker arrives: road cones around a whale, ROAD WORK sign; double take
registerShot('s08', { kind: '3d',
  init(T) { const s = whaleBeach(T, { gull: false }); s.wk = worker(); s.wk.position.set(4.4, 0, 6.6); s.wk.rotation.y = -0.9; s.stage.add(s.wk);
    s.cones = [[-4.1, -2.2], [-2.9, 0.2], [-1.6, 2.2], [-0.2, 4.4]].map(([x, z]) => { const c = cone(1.2); c.position.set(x, 0, z); s.stage.add(c); return c; });
    s.sign = signPost('ROAD WORK', { w: 2.0, bg: '#f07a1a', fg: '#20161a' }); s.sign.position.set(6.6, 0, 3.6); s.sign.rotation.y = -0.6; s.stage.add(s.sign); return s; },
  draw(s, t, info) { s.beach.update(t); s.w.update(t); const hw = at(info, 'highway', 0.5), jb = at(info, 'job', 1.6);
    s.cones.forEach((c, i) => { const k = ease.outBack(prog(t, hw + i * 0.12, hw + i * 0.12 + 0.25)); c.scale.setScalar(Math.max(0.001, k)); });
    const turn = ease.inOut(prog(t, jb - 0.1, jb + 0.15)); s.wk.parts.head && (s.wk.rotation.y = lerp(-0.4, -0.95, turn));
    s.wk.pose(addPose(mixPose(POSE.handsHips, POSE.stand, turn), { headTurn: t > jb ? Math.sin((t - jb) * 18) * 0.12 * Math.exp(-(t - jb) * 4) : 0 })); s.wk.face(t > jb ? EXPR.shocked : EXPR.deadpan, t);
    camMove(s.stage, t, [[0, { pos: [7.0, 4.0, 17.0], look: [1.6, 1.6, 3.0], fov: 40 }], [info.dur, { pos: [6.8, 3.8, 15.8], look: [2.0, 1.7, 3.4], fov: 40 }]]); },
  overlay(g, t, info, s) { look(g, t); const hw = at(info, 'highway', 0.5), jb = at(info, 'job', 1.6);
    chip(g, 'STATE HIGHWAY DEPT.', W2, E.H * 0.17, t - hw, { size: 58, color: '#f07a1a', rot: -3 });
    fxr(g, t, s, [{ fx: 'exclaim', on: 'wk', at: jb + 0.05, until: info.dur }, { fx: 'sweat', on: 'wk', at: jb + 0.25, until: info.dur }]); },
});

// s09 "The plan: blow it to bits," — the worker unrolls a plan: chalk doodle of the whale -> little pieces
registerShot('s09', { kind: '3d',
  init(T) { const s = whaleBeach(T, { gull: false }); s.wk = worker(); s.wk.position.set(3.6, 0, 7.4); s.wk.rotation.y = -0.2; s.stage.add(s.wk); return s; },
  draw(s, t, info) { s.beach.update(t); s.w.update(t); s.wk.pose(addPose(point(POSE.stand, 'L', 1, { up: 0.3 }), idle(t, 3))); s.wk.face(EXPR.smug, t);
    camMove(s.stage, t, [[0, { pos: [4.8, 2.6, 12.6], look: [3.4, 2.0, 6.6], fov: 36 }], [info.dur, { pos: [4.6, 2.5, 11.8], look: [3.4, 2.0, 6.6], fov: 36 }]]); },
  overlay(g, t, info, s) { look(g, t); const pl = at(info, 'plan', 0.1), bl = at(info, 'blow', 0.6), bi = at(info, 'bits', 1.0);
    const k = ease.outBack(clamp((t - pl) / 0.3)); if (k > 0) { g.save(); g.translate(W2, E.H * 0.19); g.scale(k * 0.85, k * 0.85); g.rotate(-0.03);
      g.fillStyle = '#2f5a3a'; g.strokeStyle = '#6a4228'; g.lineWidth = 22; g.beginPath(); g.roundRect(-420, -230, 840, 460, 20); g.fill(); g.stroke();
      TXT(g, 'THE PLAN', 0, -170, 64, { color: '#fbf6e8' });
      g.strokeStyle = '#fbf6e8'; g.lineWidth = 7; g.lineCap = 'round'; g.lineJoin = 'round';
      const p = clamp((t - bl) / 0.5); const wx = lerp(-200, -230, p);
      if (t < bi) { g.beginPath(); g.ellipse(wx, 30, 150, 60, 0, 0, 7); g.stroke(); g.beginPath(); g.moveTo(wx - 150, 30); g.lineTo(wx - 210, -10); g.lineTo(wx - 210, 70); g.closePath(); g.stroke(); }
      else { for (let i = 0; i < 9; i++) { const a = i * 0.7, d = 40 + (t - bi) * 260; g.beginPath(); g.arc(wx + Math.cos(a) * d, 30 + Math.sin(a) * d * 0.6, 14, 0, 7); g.stroke(); } }
      // arrow -> stars
      g.beginPath(); g.moveTo(-10, 30); g.lineTo(120, 30); g.moveTo(95, 10); g.lineTo(120, 30); g.lineTo(95, 50); g.stroke();
      TXT(g, t > bi ? 'BITS!' : '???', 260, 30, 72, { color: '#ffd23a' }); g.restore(); }
    fxr(g, t, s, [{ fx: 'sparkle', on: 'wk', at: bi, scale: 0.8 }]); },
});
// s10 "and let the seagulls clean up." — three gulls in bibs with forks, licking their beaks; hearts
registerShot('s10', { kind: '3d',
  init(T) { const s = beachStage(T, { seed: 8, target: [0, 0, 0] }); s.gs = [-1.3, 0, 1.3].map((x, i) => { const g = gull({ bib: true, scale: 1.25 }); g.position.set(x, 0, i === 1 ? 0.4 : 0); g.rotation.y = -x * 0.25; s.stage.add(g); return g; }); return s; },
  draw(s, t, info) { s.beach.update(t); s.gs.forEach((g, i) => g.update(t + i, { look: [Math.sin(t * 2 + i) * 0.3, 0.2], beak: 0.5 + Math.sin(t * 10 + i * 2) * 0.4, bob: Math.abs(Math.sin(t * 6 + i)) * 0.06 }));
    camMove(s.stage, t, [[0, { pos: [0, 1.4, 5.4], look: [0, 0.85, 0], fov: 36 }], [info.dur, { pos: [0, 1.35, 4.8], look: [0, 0.85, 0], fov: 36 }]]); },
  overlay(g, t, info, s) { look(g, t); const sg = at(info, 'seagulls', 0.3);
    chip(g, 'CLEANUP CREW', W2, E.H * 0.2, t - sg, { size: 64, color: '#ffffff', rot: -3 });
    fxr(g, t, s, s.gs.map((gg, i) => ({ fx: 'hearts', on: gg, at: sg + 0.1 + i * 0.12, scale: 0.8 }))); },
});

// s11 "So they used half a ton of dynamite." — INSERT 2: "½ TON" over a stack of dynamite crates by the whale
const crateScene = { init(T) { const s = whaleBeach(T, { gull: false }); s.crates = []; for (let i = 0; i < 20; i++) { const c = dynamiteCrate(); c.position.set(-2.6 + (i % 5) * 1.25, Math.floor(i / 5) * 0.72, 6.5 + (i % 2) * 0.1); c.rotation.y = (i % 3 - 1) * 0.05; s.stage.add(c); s.crates.push(c); } return s; },
  draw(s, t) { s.beach.update(t); s.w.update(t); camMove(s.stage, t, [[0, { pos: [0.5, 2.6, 15], look: [0, 1.6, 5.5], fov: 40 }], [2.6, { pos: [0.4, 2.5, 14], look: [0, 1.6, 5.5], fov: 40 }]]); } };
insertShot('s11', { scene: crateScene, dim: 0.42, insert: { type: 'bigtext', kicker: 'DYNAMITE', title: 'HALF A TON', lines: ['20 cases'], color: '#ff5a4a' } });
// s12 "A crowd gathered to watch." — the crowd on the dunes, grinning, one with a camera; speech sparkle
registerShot('s12', { kind: '3d',
  init(T) { const s = crowdBeach(T, {}); return s; },
  draw(s, t, info) { s.beach.update(t); s.ppl.forEach((p, i) => { p.pose(addPose(i % 3 === 0 ? POSE.handsHips : POSE.relaxed, idle(t, i + 1))); p.face(i % 2 ? EXPR.grin : EXPR.happy, t + i); });
    camMove(s.stage, t, [[0, { pos: [0, 2.3, 9.5], look: [0, 1.6, 0], fov: 40 }], [info.dur, { pos: [0, 2.25, 8.6], look: [0, 1.65, 0], fov: 40 }]]); },
  overlay(g, t, info, s) { look(g, t); chip(g, 'A CROWD', W2, E.H * 0.18, t - at(info, 'crowd', 0.2), { size: 70, color: '#ffd23a', rot: -3 });
    fxr(g, t, s, [{ fx: 'sparkle', on: s.ppl[1], at: 0.3, scale: 0.7 }, { fx: 'sparkle', on: s.ppl[2], at: 0.6, scale: 0.7 }]); },
});

// s13 "3... 2... 1..." — countdown: hard punch-ins per number (plunger / crowd / gull), giant digits
registerShot('s13', { kind: '3d',
  init(T) { const s = whaleBeach(T, {}); s.wk = worker(); s.wk.position.set(5.0, 0, 8.6); s.wk.rotation.y = -0.5; s.stage.add(s.wk); s.pl = plunger(); s.pl.position.set(4.4, 0, 9.4); s.pl.rotation.y = -0.4; s.stage.add(s.pl); return s; },
  draw(s, t, info) { s.beach.update(t); s.w.update(t); const n2 = atN(info, '2', 1, 0.7), n1 = atN(info, '1', 1, 1.4);
    gullIdle(s, t, { look: [0.6, 0.1], lid: 0 }); s.wk.pose(addPose(mixPose(POSE.holdFront, { ...POSE.holdFront, lean: 0.35 }, prog(t, n1, n1 + 0.2)), tremble(t, 0.6))); s.wk.face(EXPR.worried, t);
    s.pl.push(ease.in(prog(t, n1 + 0.15, n1 + 0.45)));
    const cams = [{ pos: [8.4, 3.2, 15.2], look: [4.6, 1.5, 9.0], fov: 34 }, { pos: [0.3, 3.7, 2.9], look: [-1.0, 3.2, -0.8], fov: 34 }, { pos: [6.9, 2.3, 13.0], look: [4.5, 1.2, 9.2], fov: 32 }];
    const c = t < n2 - 0.06 ? cams[0] : t < n1 - 0.06 ? cams[1] : cams[2]; const tc = t - (t < n2 - 0.06 ? 0 : t < n1 - 0.06 ? n2 : n1);
    s.stage.cam([c.pos[0], c.pos[1], c.pos[2] - tc * 0.5], c.look, c.fov); },
  overlay(g, t, info, s) { look(g, t); const n3 = atN(info, '3', 1, 0.05), n2 = atN(info, '2', 1, 0.7), n1 = atN(info, '1', 1, 1.4);
    const num = t < n2 - 0.06 ? ['3', n3] : t < n1 - 0.06 ? ['2', n2] : ['1', n1]; const k = ease.outBack(clamp((t - num[1]) / 0.2));
    if (k > 0) { g.save(); g.translate(W2, E.H * 0.2); g.scale(k, k); TXT(g, num[0], 0, 0, 330, { color: num[0] === '1' ? '#ff5a4a' : '#ffffff', stroke: '#2a1c15' }); g.restore(); }
    fxr(g, t, s, [{ fx: 'sweat', on: 'wk', at: 0.1, until: n2 }, { fx: 'sweat', on: 'g', at: n2, until: n1 }, { fx: 'speedlines', at: n1, until: info.dur }]); },
});
// s14 (beat after "1") — BOOM: huge puffy cloud swallows the whale, white flash, camera shake; then a beat of silence
registerShot('s14', { kind: '3d',
  init(T) { const s = whaleBeach(T, { gull: false }); s.boom = boomCloud(); s.boom.position.set(0, 0.5, 0.3); s.boom.scale.setScalar(1.7); s.stage.add(s.boom); return s; },
  draw(s, t, info) { s.beach.update(t); s.w.update(t); const k = clamp(t / 0.9); s.boom.update(ease.out(k)); s.w.visible = t < 0.25;
    camMove(s.stage, t, [[0, { pos: [2.0, 4.0, 24], look: [0, 3.2, 0], fov: 42 }], [info.dur, { pos: [1.9, 4.6, 23], look: [0, 4.2, 0], fov: 42 }]], ease.out);
    shakeCam(s.stage, t, [{ fx: 'shake', at: 0.0, amp: 0.25, dur: 0.7 }]); },
  overlay(g, t, info, s) { fxr(g, t, s, [{ fx: 'flash', at: 0.0, dur: 0.3 }]); boomText(g, W2, E.H * 0.3, t - 0.05, { s: 1.15, dur: info.dur }); },
});

// s15 "But here's the part..." — the crowd, cheering... then looking up; pupils shrink
registerShot('s15', { kind: '3d',
  init(T) { return crowdBeach(T, { seed: 9 }); },
  draw(s, t, info) { s.beach.update(t); const pa = at(info, 'part', 0.6); s.ppl.forEach((p, i) => { const up = ease.inOut(prog(t, pa + i * 0.05, pa + 0.4 + i * 0.05));
    p.pose(addPose(mixPose(POSE.armsUp, POSE.stand, up), { headNod: -0.5 * up })); p.face(mixExpr(EXPR.grin, { ...EXPR.shocked, pupil: [0, 0.8] }, up), t + i); });
    camMove(s.stage, t, [[0, { pos: [0, 2.0, 8.2], look: [0, 1.9, 0], fov: 40 }], [info.dur, { pos: [0, 1.8, 7.0], look: [0, 2.2, 0], fov: 40 }]]); },
  overlay(g, t, info, s) { look(g, t); const pa = at(info, 'part', 0.6); fxr(g, t, s, [{ fx: 'question', on: s.ppl[1], at: pa + 0.5, until: info.dur }, { fx: 'sweat', on: s.ppl[2], at: pa + 0.6, until: info.dur }]); },
});
// s16 "the whale came back down." — low angle up at the sky: dozens of blobs tumbling down out of the smoke
registerShot('s16', { kind: '3d',
  init(T) { const s = beachStage(T, { seed: 10, target: [0, 0, 0] }); s.rain = blobRain(s.stage, { n: 30, area: [16, 10], center: [0, 0, -2], h: 22, t0: 0.1, span: 2.6, seed: 4 });
    s.cloud = boomCloud({ seed: 9 }); s.cloud.position.set(0, 14, -10); s.cloud.scale.setScalar(2.4); s.cloud.update(0.95); s.stage.add(s.cloud); return s; },
  draw(s, t, info) { s.beach.update(t); s.rain.update(t + 1.2);
    camMove(s.stage, t, [[0, { pos: [0, 1.2, 9], look: [0, 9, -4], fov: 50 }], [info.dur, { pos: [0, 1.2, 8.5], look: [0, 7, -4], fov: 50 }]]); },
  overlay(g, t, info, s) { look(g, t); chip(g, 'INCOMING', W2, E.H * 0.8, t - at(info, 'back', 0.6), { size: 72, color: '#ff5a4a', rot: -4, ink: '#ffffff' }); },
});
// s17 "Chunks of blubber rained on the crowd." — the crowd scatters with jackets over their heads, blobs plop around them (nobody hit)
registerShot('s17', { kind: '3d',
  init(T) { const s = crowdBeach(T, { seed: 11, spots: [[-2.4, 0.6], [-0.8, 1.0], [0.8, 0.5], [2.4, 0.3], [-1.6, -1.2], [1.4, -1.0]] });
    s.rain = blobRain(s.stage, { n: 22, area: [9, 5], center: [0, 0, -0.2], h: 12, t0: 0, span: 2.4, seed: 7, scale: 0.9 });
    // keep blobs off the people: push any blob within 0.7 of a person sideways
    s.rain.items.forEach(it => { s.ppl.forEach(p => { const dx = it.x - p.position.x, dz = it.z - p.position.z; if (Math.hypot(dx, dz) < 0.8) { it.x += Math.sign(dx || 1) * 0.9; } }); }); return s; },
  draw(s, t, info) { s.beach.update(t); s.rain.update(t); s.ppl.forEach((p, i) => { const r = run(t * 1.1 + i * 0.3); const cover = { ...r, armL: [2.6, 0.6, 0], armR: [2.6, 0.6, 0], elbowL: 1.6, elbowR: 1.6 };
    p.pose(cover); p.face(EXPR.panic, t + i); p.position.x += Math.sin(i * 2.1) * 0.012; p.rotation.y = Math.sin(t * 2 + i) * 0.6; });
    camMove(s.stage, t, [[0, { pos: [0, 3.2, 10.5], look: [0, 1.4, 0], fov: 40 }], [info.dur, { pos: [0, 3.0, 9.6], look: [0, 1.4, 0], fov: 40 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: 0.6, amp: 0.05, dur: 0.25 }, { fx: 'shake', at: 1.3, amp: 0.05, dur: 0.25 }]); },
  overlay(g, t, info, s) { look(g, t); chip(g, 'BLUBBER', W2, E.H * 0.17, t - at(info, 'blubber', 0.4), { size: 72, color: '#d8b0b0', rot: -3 });
    fxr(g, t, s, [{ fx: 'sweat', on: s.ppl[0], at: 0.2, until: info.dur }, { fx: 'exclaim', on: s.ppl[2], at: 0.4, until: info.dur }, { fx: 'sweat', on: s.ppl[3], at: 0.5, until: info.dur }]); },
});
// s18 "One crushed a brand-new car." — a shiny new car with a NEW! tag; a big blob drops; the car goes pancake
registerShot('s18', { kind: '3d',
  init(T) { const s = beachStage(T, { seed: 12, target: [0, 0, 0] }); s.car = sedan(); s.car.rotation.y = 0.5; s.stage.add(s.car); s.b = blubber(3, 1.9); s.stage.add(s.b); return s; },
  draw(s, t, info) { s.beach.update(t); const cr = at(info, 'crushed', 0.4); const fall = prog(t, cr - 0.45, cr - 0.05); s.b.position.set(0, lerp(9, 1.4, ease.in(fall)) - (t > cr ? 0.75 : 0), 0); s.b.visible = fall > 0;
    if (t > cr) s.b.wob(t - cr); s.car.flatten(ease.outBack(prog(t, cr - 0.05, cr + 0.12)), t);
    camMove(s.stage, t, [[0, { pos: [5.0, 3.0, 11.0], look: [0, 1.0, 0], fov: 38 }], [info.dur, { pos: [4.7, 2.9, 10.2], look: [0, 1.0, 0], fov: 38 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: cr, amp: 0.12, dur: 0.35 }]); },
  overlay(g, t, info, s) { look(g, t); const cr = at(info, 'crushed', 0.4), nw = at(info, 'brand', 1.0);
    chip(g, 'BRAND-NEW!', W2, E.H * 0.18, t - nw, { size: 70, color: '#ffd23a', rot: 4 }); stamp(g, 'CRUSHED', W2, E.H * 0.62, t - cr - 0.1, { size: 90, rot: -7 });
    fxr(g, t, s, [{ fx: 'stars', on: s.car, at: cr + 0.1, until: info.dur, scale: 1.2 }]); },
});

// s19 "Nobody was seriously hurt." — the crowd peeks out from under jackets, sticky but fine; thumbs/shrug
registerShot('s19', { kind: '3d',
  init(T) { const s = crowdBeach(T, { seed: 13, spots: [[-1.6, 0.4], [0, 0.8], [1.6, 0.3]] }); [[-2.6, 1.8], [2.7, 1.5], [-0.8, 2.6], [1.0, 2.4]].forEach(([x, z], i) => { const b = blubber(i + 20, 0.8); b.position.set(x, 0.18, z); s.stage.add(b); }); return s; },
  draw(s, t, info) { s.beach.update(t); s.ppl.forEach((p, i) => { const k = ease.out(prog(t, 0.15 + i * 0.12, 0.6 + i * 0.12)); p.pose(addPose(mixPose({ ...POSE.armsUp, lean: 0.3 }, shrug(POSE.stand, 1), k), idle(t, i))); p.face(mixExpr(EXPR.worried, EXPR.deadpan, k), t + i); });
    camMove(s.stage, t, [[0, { pos: [0, 2.2, 7.2], look: [0, 1.7, 0.5], fov: 40 }], [info.dur, { pos: [0, 2.15, 6.6], look: [0, 1.75, 0.5], fov: 40 }]]); },
  overlay(g, t, info, s) { look(g, t); stamp(g, 'NOBODY SERIOUSLY HURT', W2, E.H * 0.17, t - at(info, 'hurt', 0.9), { size: 62, rot: -4, color: '#2f9a4a' });
    fxr(g, t, s, [{ fx: 'sweat', on: s.ppl[0], at: 0.4, until: info.dur }, { fx: 'stars', on: s.ppl[2], at: 0.5, until: info.dur, scale: 0.7 }]); },
});
// s20 "The seagulls? Scared off." — the cleanup crew flees: bibs fly off, speedlines, sweat
registerShot('s20', { kind: '3d',
  init(T) { const s = beachStage(T, { seed: 14, target: [0, 0, 0] }); s.gs = [-1.2, 0, 1.2].map((x, i) => { const g = gull({ bib: true, scale: 1.2 }); g.position.set(x, 0, 0); s.stage.add(g); return g; }); return s; },
  draw(s, t, info) { s.beach.update(t); const sc = at(info, 'scared', 0.9);
    s.gs.forEach((g, i) => { const go = prog(t, sc + i * 0.08, sc + 1.2 + i * 0.08); g.update(t + i, { flap: go > 0 ? 1 : 0, lid: 0, look: [0, t < sc ? 0.3 : -0.2], beak: t > sc - 0.3 ? 1 : 0, bib: go < 0.15 });
      g.position.set(-1.2 + i * 1.2 + go * (i - 1) * 3, ease.in(go) * 5, -go * 4); g.rotation.y = go > 0 ? Math.PI * 0.85 : (1 - i) * 0.25; });
    camMove(s.stage, t, [[0, { pos: [0, 1.5, 5.6], look: [0, 1.0, 0], fov: 38 }], [info.dur, { pos: [0, 1.7, 6.2], look: [0, 1.4, 0], fov: 38 }]]); },
  overlay(g, t, info, s) { look(g, t); const sg = at(info, 'seagulls', 0.1), sc = at(info, 'scared', 0.9);
    fxr(g, t, s, [...s.gs.map((gg, i) => ({ fx: 'question', on: gg, at: sg + 0.2 + i * 0.1, until: sc })), ...s.gs.map((gg, i) => ({ fx: 'sweat', on: gg, at: sc, until: info.dur })), { fx: 'speedlines', at: sc + 0.1, until: info.dur }]);
    stamp(g, 'SCARED OFF', W2, E.H * 0.2, t - sc - 0.1, { size: 84, rot: 5 }); },
});
// s21 "And most of the whale... was still there." — the smoke clears: the whale is mostly still on the beach (a dent); the worker shrugs
registerShot('s21', { kind: '3d',
  init(T) { const s = whaleBeach(T, { gull: false }); s.wk = worker(); s.wk.position.set(3.0, 0, 8.6); s.wk.rotation.y = -0.5; s.stage.add(s.wk);
    s.smoke = boomCloud({ seed: 3 }); s.smoke.position.set(0, 0.4, 0.3); s.smoke.scale.setScalar(1.6); s.stage.add(s.smoke); return s; },
  draw(s, t, info) { s.beach.update(t); s.w.update(t, { bite: 1, stink: 1.2 }); const st = at(info, 'still', 1.4);
    const clr = ease.inOut(prog(t, 0, st)); s.smoke.update(lerp(0.95, 0.0, clr)); s.smoke.position.y = 0.4 + clr * 3; s.smoke.visible = clr < 0.98;
    s.wk.pose(mixPose(POSE.stand, shrug(POSE.stand, 1), ease.out(prog(t, st, st + 0.3)))); s.wk.face(t > st ? EXPR.deadpan : EXPR.worried, t);
    camMove(s.stage, t, [[0, { pos: [5.5, 4.4, 20], look: [1.0, 1.6, 2.0], fov: 40 }], [info.dur, { pos: [5.2, 4.2, 19], look: [1.0, 1.6, 2.0], fov: 40 }]]); },
  overlay(g, t, info, s) { look(g, t); const st = at(info, 'still', 1.4);
    stamp(g, 'STILL THERE', W2, E.H * 0.18, t - st - 0.1, { size: 88, rot: -6 }); fxr(g, t, s, [{ fx: 'question', on: 'wk', at: st + 0.15, until: info.dur }, { fx: 'sweat', on: 'wk', at: st + 0.3, until: info.dur }]); },
});

// s22 "50 years later," — INSERT 3: 50 YEARS LATER over the (now empty) beach
const laterScene = { init(T) { return beachStage(T, { seed: 15 }); }, draw(s, t) { s.beach.update(t); camMove(s.stage, t, [[0, { pos: [0, 3.0, 12], look: [0, 2.0, 0], fov: 40 }], [2, { pos: [0, 3.2, 11], look: [0, 2.4, 0], fov: 40 }]]); } };
insertShot('s22', { scene: laterScene, dim: 0.4, insert: { type: 'bigtext', kicker: 'FLORENCE, 2020', title: '50 YEARS LATER', lines: ['the town voted on a name'], color: '#ffd23a' } });
// s22b "the town named a park after it:" — a grassy riverside park, a sign under a sheet... revealed next shot
registerShot('s22b', { kind: '3d',
  init(T) { const s = beachStage(T, { seed: 15, target: [0, 0, 0] }); const grass = new THREE.Mesh(new THREE.CircleGeometry(14, 40), toon('#8acb5a')); grass.rotation.x = -Math.PI / 2; grass.position.y = 0.04; grass.receiveShadow = true; s.stage.add(grass);
    s.sign = parkSign(); s.stage.add(s.sign); s.ppl = [person(3), person(5)]; s.ppl[0].position.set(-2.6, 0, 1.6); s.ppl[1].position.set(2.6, 0, 1.4); s.ppl.forEach(p => s.stage.add(p));
    s.sheet = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 2.2), toon('#e8e2d8', { side: THREE.DoubleSide })); s.sheet.position.set(0, 2.3, 0.3); s.stage.add(s.sheet); return s; },
  draw(s, t, info) { s.beach.update(t); s.ppl.forEach((p, i) => { p.pose(addPose(POSE.relaxed, idle(t, i))); p.face(EXPR.happy, t + i); }); s.sheet.rotation.x = Math.sin(t * 2) * 0.03;
    camMove(s.stage, t, [[0, { pos: [0, 2.8, 17], look: [0, 2.0, 0], fov: 40 }], [info.dur, { pos: [0, 2.7, 15.5], look: [0, 2.1, 0], fov: 40 }]]); },
  overlay(g, t, info, s) { look(g, t); chip(g, 'A NEW PARK', W2, E.H * 0.18, t - at(info, 'park', 0.8), { size: 66, color: '#ffd23a', rot: -3 }); fxr(g, t, s, [{ fx: 'sparkle', on: s.ppl[0], at: 0.5, scale: 0.7 }]); },
});
// s23 "Exploding Whale Memorial Park." — PAYOFF: the sheet whips off, the sign; a gull in a bib perched on top; confetti sparkle
registerShot('s23', { kind: '3d',
  init(T) { const s = beachStage(T, { seed: 15, target: [0, 0, 0] }); const grass = new THREE.Mesh(new THREE.CircleGeometry(14, 40), toon('#8acb5a')); grass.rotation.x = -Math.PI / 2; grass.position.y = 0.04; grass.receiveShadow = true; s.stage.add(grass);
    s.sign = parkSign(); s.stage.add(s.sign); s.g = gull({ bib: true }); s.g.position.set(1.4, 3.22, 0); s.stage.add(s.g); return s; },
  draw(s, t, info) { s.beach.update(t); gullIdle(s, t, { look: [-0.3, 0.1] });
    camMove(s.stage, t, [[0, { pos: [0, 2.6, 13.5], look: [0, 2.6, 0], fov: 40 }], [info.dur, { pos: [0, 2.6, 12.6], look: [0, 2.65, 0], fov: 40 }]]); },
  overlay(g, t, info, s) { look(g, t); fxr(g, t, s, [{ fx: 'sparkle', on: [0, 3.4, 0.3], at: 0.05, scale: 1.4 }, { fx: 'hearts', on: 'g', at: 0.4, scale: 0.8 }]);
    stamp(g, 'REAL PARK', W2, E.H * 0.24, t - at(info, 'park', 1.2) - 0.1, { size: 84, rot: -6, color: '#2f9a4a' }); },
});
// s24 "Subscribe for more." — back to frame 1: the whale on the beach, gull in its bib, and a fresh fuse fizzing -> loop
registerShot('s24', { kind: '3d',
  init(T) { return whaleBeach(T, { fuse: {} }); },
  draw(s, t, info) { s.beach.update(t); s.w.update(t); gullIdle(s, t); s.fuse.set(lerp(0.0, 0.08, t / info.dur), t);
    camMove(s.stage, t, [[0, { pos: [1.9, 6.0, 21.5], look: [0.5, 1.3, 0.6], fov: 40 }], [info.dur, F1]], ease.out); },
  overlay(g, t, info, s) { look(g, t); fxr(g, t, s, [{ fx: 'sparkle', on: s.fuse.spark.position.clone(), at: 0, until: info.dur, scale: 0.6 }]); },
});
