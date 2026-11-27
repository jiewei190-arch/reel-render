// What if the Moon vanished tonight? — ~21 shots, Toon 3D + BEANMEN effects. A thought experiment; nothing scary.
// s01 = frame 1 (night beach, the Moon already going POOF, the tide already dropping); s20 returns to frame 1's camera
// with the Moon back, and in its last 0.3 s the poof starts again -> loops into s01.
import { registerShot, ease, prog, clamp, lerp } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, nod, tremble, shrug, point } from '/kits/toon3d/rig.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { insertShot } from '/kits/toon3d/insert.js';
import { bean } from '/kits/toon3d/rig.js';
import {
  at, THREE, toonStage, globe, spaceStage, starfield, scientist, moon, sunBall, axisPlanet, beachSet, nightStage, beetle, dungBall, beetleWalk,
  milkyWay, roundTree, hookCaption, richLine, stamp, chip, arrow, rbox, cyl, ball, floor, toon, glow, rng, starfield2D,
} from './_lib.js';

const MOONPOS = [-1.4, 8.6, -30];
const kid = () => bean({ name: 'Kid', outfit: 'hoodie', colors: { main: '#3f8a7a' }, skin: 'olive', hair: 'pigtails', hairColor: '#2a1c15', seed: 71, scale: 0.9 });
// poof(u): Moon scale for u = seconds since the vanish started (shrinks with an overshoot, gone by 0.45 s)
const poofK = (u) => (u <= 0 ? 1 : u >= 0.45 ? 0 : 1 + 0.25 * Math.sin(u / 0.45 * Math.PI) - ease.in(u / 0.45));
function poofFx(g, s, u, x = null, y = null) {
  if (u < 0 || u > 0.9) return; const p = s.mp || [540, 300]; const k = u / 0.9; const r = rng(5);
  g.save(); g.globalAlpha = 1 - k; for (let i = 0; i < 14; i++) { const a = r() * 6.28, d = (60 + r() * 160) * ease.out(k);
    g.fillStyle = i % 2 ? '#fff6d8' : '#ffffff'; g.beginPath(); g.arc(p[0] + Math.cos(a) * d, p[1] + Math.sin(a) * d, (18 + r() * 22) * (1 - k * 0.6), 0, 7); g.fill(); }
  g.restore();
}
const proj = (st, v) => { const p = new THREE.Vector3(...v).project(st.camera); return [(p.x + 1) / 2 * 1080, (1 - p.y) / 2 * 1920]; };

// ---------------------------------------------------------------- BEACH (s01, s01b, s02, s04, s11, s20)
function beachScene(T, o = {}) {
  const st = nightStage(T, { fov: 44 }); const env = beachSet(st);
  const m = moon({ r: 2.2, lit: true }); m.position.set(...MOONPOS); st.add(m);
  const k = kid(); k.position.set(-0.9, 0, 0.6); k.rotation.y = 0.35; st.add(k);
  if (o.light) { st.key.intensity = 1.6; }
  return { stage: st, env, m, k };
}
const BCAM0 = { pos: [-0.2, 1.9, 5.6], look: [-0.6, 2.9, -6], fov: 46 }, BCAM1 = { pos: [-0.15, 1.85, 5.0], look: [-0.6, 3.0, -6], fov: 45 };
// u = seconds since the vanish; tide drops over ~3 s after it; light dims a bit
function beachPlay(s, t, u, o = {}) {
  s.env.update(t); const k = poofK(u); s.m.scale.setScalar(Math.max(0.001, k)); s.m.visible = k > 0.01;
  const drop = ease.inOut(clamp((u - 0.2) / (o.dropDur ?? 3.0))); s.env.setTide(lerp(0.05, -0.62, u > 0 ? drop : 0));
  s.stage.exposure = lerp(1.0, o.dark ?? 0.82, u > 0 ? clamp(u / 0.6) : 0);
  const look = u > 0 ? clamp(u * 2) : 0;
  s.k.pose(addPose(mixPose(POSE.relaxed, { ...POSE.panic, armL: [0.3, 0.5, 0], armR: [0.3, 0.5, 0] }, look * 0.6), { ...idle(t, 4, 0.6), headNod: -0.35 }));
  s.k.face(mixExpr(EXPR.happy, EXPR.shocked, look), t);
  s.mp = proj(s.stage, MOONPOS);
}

// s01 — HOOK (frame 1): night beach, full Moon... POOF. The tide starts sliding back. Top caption 0-3.5 s.
registerShot('s01', { kind: '3d',
  init(T) { return beachScene(T); },
  draw(s, t, info) { beachPlay(s, t, t + 0.12); camMove(s.stage, t, [[0, BCAM0], [info.dur, BCAM1]], ease.out); shakeCam(s.stage, t, [{ fx: 'shake', at: 0, amp: 0.04, dur: 0.5 }]); },
  overlay(g, t, info, s) { poofFx(g, s, t + 0.12); starfield(g, t, { seed: 2 });
    hookCaption(g, t, [['if the', '#ffffff'], ['MOON', '#ffd25a']], [['VANISHED', '#ff5a4a'], ['tonight', '#ffffff']], { until: 3.5, y: 300 });
    reactions(g, t, s, [{ fx: 'exclaim', on: 'k', at: 0.25, color: '#ff3b30' }, { fx: 'question', on: 'k', at: 1.2, scale: 0.7 }]); },
});
// s01b — "...tides would shrink to about a third." The striped TIDE post: the water slides down it. Caption holds to 3.5 s.
registerShot('s01b', { kind: '3d',
  init(T) { return beachScene(T); },
  draw(s, t, info) { beachPlay(s, t, info.shot.start + 0.12 + t, { dropDur: 2.6 }); camMove(s.stage, t, [[0, { pos: [3.2, 1.6, -1.5], look: [1.6, 0.4, -9], fov: 40 }], [info.dur, { pos: [3.0, 1.5, -2.5], look: [1.6, 0.2, -9], fov: 39 }]]); },
  overlay(g, t, info, s) { hookCaption(g, t, [['if the', '#ffffff'], ['MOON', '#ffd25a']], [['VANISHED', '#ff5a4a'], ['tonight', '#ffffff']], { noPop: true, until: 3.5 - info.shot.start });
    chip(g, t, 'TIDES', 760, 860, { at: at(info, 'tides', 0.2), fill: '#4f9fe0', color: '#ffffff', size: 56 }); arrow(g, 760, 940, 240, ease.out(prog(t, at(info, 'shrink', 0.6), at(info, 'shrink', 0.6) + 0.3)), { rot: Math.PI / 2, w: 34, color: '#ff5a4a' }); },
});

// s02 — "Relax, it's a thought experiment." Pause: the moonless beach frozen, THOUGHT EXPERIMENT stamp.
registerShot('s02', { kind: '3d',
  init(T) { return beachScene(T); },
  draw(s, t, info) { beachPlay(s, 0, 1.6); s.k.face(mixExpr(EXPR.shocked, EXPR.neutral, prog(t, 0.3, 0.7)), t); camMove(s.stage, t, [[0, { pos: [-0.4, 2.0, 5.0], look: [-0.8, 2.1, 0.4], fov: 38 }], [info.dur, { pos: [-0.45, 2.0, 4.5], look: [-0.8, 2.1, 0.4], fov: 37 }]]); },
  overlay(g, t, info, s) { starfield(g, t, { seed: 3 }); g.save(); g.fillStyle = 'rgba(30,40,80,0.2)'; g.fillRect(0, 0, 1080, 1920); g.restore();
    const k = ease.outBack(clamp(t / 0.25)); g.save(); g.translate(540, 560); g.scale(k, k); g.fillStyle = 'rgba(255,255,255,0.92)'; g.strokeStyle = '#2a1c15'; g.lineWidth = 8; for (const x of [-48, 18]) { g.beginPath(); g.roundRect(x, -70, 30, 140, 10); g.fill(); g.stroke(); } g.restore();
    hookCaption(g, t, [['if the', '#ffffff'], ['MOON', '#ffd25a']], [['VANISHED', '#ff5a4a'], ['tonight', '#ffffff']], { noPop: true, until: 3.5 - info.shot.start });
    stamp(g, t, 'THOUGHT EXPERIMENT', { at: at(info, 'thought', 0.5) - 0.05, x: 540, y: 400, size: 70, color: '#ffffff', fill: '#2f6fb0', rot: -0.05 }); },
});
// s03 — "Here's what scientists say." A scientist bean at a telescope on the dunes, nodding.
registerShot('s03', { kind: '3d',
  init(T) { const s = beachScene(T); s.m.visible = false; s.k.visible = false; const sc = scientist(); sc.position.set(0.6, 0, 1.2); sc.rotation.y = -0.4; s.stage.add(sc);
    const tel = new THREE.Group(); const tube = cyl(0.14, 0.2, 1.6, '#e8e4dc', 0, 0, 0, 14); tube.rotation.z = 1.0; tube.position.set(-0.2, 1.75, 0); tel.add(tube);
    for (const a of [0, 2.1, 4.2]) { const lg = cyl(0.03, 0.03, 1.5, '#5a5a62', Math.cos(a) * 0.3, 0.7, Math.sin(a) * 0.3, 6); lg.rotation.set(Math.sin(a) * 0.25, 0, -Math.cos(a) * 0.25); tel.add(lg); }
    tel.position.set(-0.6, 0, 1.0); s.stage.add(tel); s.sc = sc; s.tel = tel; return s; },
  draw(s, t, info) { s.env.update(t); s.env.setTide(-0.62); s.stage.exposure = 0.85;
    s.sc.pose(addPose({ ...POSE.thinking }, { ...idle(t, 4, 0.6), ...nod(t, 0.12, 1.2) })); s.sc.face(mixExpr(EXPR.neutral, EXPR.smug, prog(t, 0.3, 0.6)), t);
    camMove(s.stage, t, [[0, { pos: [0.0, 2.0, 8.8], look: [0, 1.5, 0.8], fov: 38 }], [info.dur, { pos: [0.0, 1.95, 8.1], look: [0, 1.5, 0.8], fov: 37 }]]); },
  overlay(g, t, info, s) { starfield(g, t, { seed: 4 }); reactions(g, t, s, [{ fx: 'exclaim', on: 'sc', at: at(info, 'scientists', 0.5) }, { fx: 'sparkle', on: 'sc', at: 0.2, dx: -160 }]); },
});
// s04 — "First, nights get darker..." The beach dims: the kid lifts a little lantern; DARKER stamp.
registerShot('s04', { kind: '3d',
  init(T) { const s = beachScene(T); const ln = new THREE.Group(); ln.add(cyl(0.12, 0.14, 0.26, '#ffe08a', 0, 0, 0, 10)); ln.add(cyl(0.02, 0.02, 0.12, '#3a3a3a', 0, 0.18, 0, 6)); ln.add(glow(0.8, '#ffd27a', 0.5)); s.stage.add(ln); s.ln = ln; return s; },
  draw(s, t, info) { beachPlay(s, t, 3.0, { dark: lerp(0.82, 0.5, ease.inOut(prog(t, 0.1, 1.0))) }); s.stage.exposure = lerp(0.82, 0.5, ease.inOut(prog(t, 0.1, 1.0)));
    s.k.pose(addPose(POSE.relaxed, { ...idle(t, 4, 0.6), armR: [1.3, 0.2, 0.3], elbowR: 0.6 })); s.k.face(EXPR.worried, t); s.k.hand.R.getWorldPosition(s.ln.position); s.ln.position.y -= 0.2;
    camMove(s.stage, t, [[0, { pos: [-0.2, 2.0, 5.4], look: [-0.8, 1.9, 0.4], fov: 40 }], [info.dur, { pos: [-0.2, 1.95, 4.8], look: [-0.8, 1.9, 0.4], fov: 39 }]]); },
  overlay(g, t, info, s) { starfield(g, t, { seed: 5 }); stamp(g, t, 'DARKER', { at: at(info, 'darker', 0.6) - 0.05, x: 540, y: 400, size: 96, color: '#ffffff', fill: '#16245a', rot: -0.06 }); reactions(g, t, s, [{ fx: 'sweat', on: 'k', at: 0.5 }]); },
});
// s05 — "...like a new moon every night." 2D calendar strip: a row of dark new-moon discs popping in, chip "every night".
registerShot('s05', {
  draw(g, t, info) {
    const gr = g.createLinearGradient(0, 0, 0, 1920); gr.addColorStop(0, '#060a24'); gr.addColorStop(1, '#1c2a66'); g.fillStyle = gr; g.fillRect(0, 0, 1080, 1920); starfield2D(g, t, { seed: 6 });
    chip(g, t, 'NEW MOON', 540, 520, { at: 0.05, fill: '#ffd23a', size: 64 });
    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
    days.forEach((d, i) => { const x = 160 + (i % 4) * 253, y = 820 + Math.floor(i / 4) * 300 + (i >= 4 ? 0 : 0), xx = i >= 4 ? x + 126 : x; const k = ease.outBack(clamp((t - 0.2 - i * 0.1) / 0.25)); if (k <= 0) return;
      g.save(); g.translate(xx, y); g.scale(k, k); g.fillStyle = '#1a1f3a'; g.strokeStyle = '#8a92c8'; g.lineWidth = 8; g.beginPath(); g.arc(0, 0, 90, 0, 7); g.fill(); g.stroke();
      g.fillStyle = '#c8ccf0'; g.font = '900 40px Nunito, sans-serif'; g.textAlign = 'center'; g.fillText(d, 0, 150); g.restore(); });
    chip(g, t, 'every night', 540, 1500, { at: at(info, 'every', 0.9), fill: '#ffffff', size: 60 });
  },
});

// ---------------------------------------------------------------- SPACE: tides
// Earth + water bulge (a translucent blue ellipsoid stretched toward the Moon) + Moon
function tideScene(T, o = {}) {
  const st = spaceStage(T, { fov: 34 }); const e = globe({ r: 2.4 }); e.position.set(o.ex ?? -1.6, 0, 0); st.add(e);
  const bulge = new THREE.Mesh(new THREE.SphereGeometry(2.4, 48, 32), toon('#6ab8ff', { transparent: true, opacity: 0.55, fresh: true })); bulge.userData.noOutline = true; e.add(bulge);
  const m = moon({ r: 0.8, lit: true }); m.position.set(o.mx ?? 4.2, 0.4, 0); st.add(m);
  return { stage: st, e, bulge, m };
}
const bulgeTo = (s, k) => { s.bulge.scale.set(1.04 + 0.32 * k, 1.02 - 0.04 * k, 1.02 - 0.04 * k); };
const SCAM = { pos: [1.3, 1.2, 28], look: [1.3, 0, 0], fov: 34 };
// s06 — "But the tides are the big one." Earth in space with its ocean bulge; the Moon beside it.
registerShot('s06', { kind: '3d',
  init(T) { return tideScene(T); },
  draw(s, t, info) { s.e.children[0].rotation.y = t * 0.6; bulgeTo(s, 0.7 + 0.3 * Math.sin(t * 3)); camMove(s.stage, t, [[0, { pos: [1.3, 1.6, 31], look: [1.3, 0, 0], fov: 34 }], [info.dur, SCAM]]); },
  overlay(g, t, info, s) { starfield(g, t, { seed: 7 }); chip(g, t, 'OCEAN BULGE', 380, 1300, { at: 0.3, fill: '#4f9fe0', color: '#ffffff', size: 50 }); stamp(g, t, 'THE BIG ONE', { at: at(info, 'big', 0.6) - 0.05, x: 540, y: 420, size: 80, color: '#ffffff', fill: '#d8342c', rot: -0.05 }); },
});
// s07 — "The Moon does most of the pulling." Close on the Moon with cartoon pull arrows; the bulge stretches toward it.
registerShot('s07', { kind: '3d',
  init(T) { return tideScene(T); },
  draw(s, t, info) { s.e.children[0].rotation.y = 2 + t * 0.6; bulgeTo(s, 0.4 + 0.6 * ease.out(prog(t, 0.2, 0.9))); camMove(s.stage, t, [[0, { pos: [3.2, 0.8, 12], look: [2.4, 0.2, 0], fov: 34 }], [info.dur, { pos: [3.4, 0.8, 11], look: [2.6, 0.2, 0], fov: 33 }]]); },
  overlay(g, t, info, s) { starfield(g, t, { seed: 8 }); const k = ease.out(prog(t, 0.2, 0.5)); arrow(g, 360, 900, 380, k, { w: 38, color: '#ffd23a' }); arrow(g, 360, 1050, 340, ease.out(prog(t, 0.35, 0.65)), { w: 30, color: '#ffd23a' });
    chip(g, t, 'MOST OF THE PULL', 540, 460, { at: at(info, 'most', 0.6), fill: '#ffd23a', size: 56 }); reactions(g, t, s, [{ fx: 'sparkle', on: 'm', at: 0.4, height: 0.9 }]); },
});
// s08 — "The Sun makes tides too..." The Sun far off at left, small arrow; the Moon right.
registerShot('s08', { kind: '3d',
  init(T) { const s = tideScene(T, { ex: 0.4, mx: 4.2 }); const sun = sunBall({ r: 2.2 }); sun.position.set(-9, 1.5, -6); s.stage.add(sun); s.sun = sun; return s; },
  draw(s, t, info) { s.e.children[0].rotation.y = 3 + t * 0.6; bulgeTo(s, 0.8); camMove(s.stage, t, [[0, { pos: [-1.8, 1.0, 24], look: [-1.6, 0.2, -1], fov: 38 }], [info.dur, { pos: [-1.6, 1.0, 22], look: [-1.4, 0.2, -1], fov: 38 }]]); },
  overlay(g, t, info, s) { starfield(g, t, { seed: 9 }); chip(g, t, 'SUN', 200, 640, { at: 0.2, fill: '#ffd23a', size: 52 }); arrow(g, 330, 940, 180, ease.out(prog(t, 0.4, 0.7)), { w: 22, color: '#ffb03a' }); reactions(g, t, s, [{ fx: 'question', on: 'e', at: 0.5, height: 3.0, scale: 0.8 }]); },
});
// s09 — INSERT versus: "...but it pulls less than half as hard."
insertShot('s09', { scene: { init: (T) => tideScene(T), draw(s, t) { bulgeTo(s, 0.8); s.stage.cam(SCAM.pos, SCAM.look, SCAM.fov); } },
  insert: { type: 'versus', title: 'TIDE PULL', lines: ['MOON: 1', 'SUN: < 1/2'], colorL: '#5a6ab8', color: '#e0902a' } });
// s10 — INSERT bigtext: "So every tide would be roughly a third of today's."
insertShot('s10', { scene: { init: (T) => tideScene(T), draw(s, t) { s.m.visible = false; bulgeTo(s, 0.25); s.stage.cam(SCAM.pos, SCAM.look, SCAM.fov); } },
  insert: { type: 'bigtext', kicker: 'TIDES WITHOUT THE MOON', title: '~1/3', lines: ["of today's size"], color: '#5ab8ff', size: 200 } });
// s11 — "...a third of today's." The TIDE post: an old high-water line (red dashes) far above the new little ripple.
registerShot('s11', { kind: '3d',
  init(T) { return beachScene(T); },
  draw(s, t, info) { beachPlay(s, t, 4); s.env.setTide(-0.62 + Math.sin(t * 2) * 0.04); camMove(s.stage, t, [[0, { pos: [2.6, 1.2, -3.2], look: [1.6, 0.6, -9], fov: 38 }], [info.dur, { pos: [2.5, 1.15, -3.8], look: [1.6, 0.6, -9], fov: 37 }]]); s.mark = proj(s.stage, [1.6, 0.05, -9]); s.now = proj(s.stage, [1.6, -0.6, -9]); },
  overlay(g, t, info, s) { starfield(g, t, { seed: 10 }); const [x, y] = s.mark, [x2, y2] = s.now; const k = ease.out(prog(t, 0.1, 0.4));
    g.save(); g.strokeStyle = '#ff5a4a'; g.lineWidth = 10; g.setLineDash([26, 16]); g.beginPath(); g.moveTo(x - 260 * k, y); g.lineTo(x + 260 * k, y); g.stroke(); g.restore();
    chip(g, t, 'OLD HIGH TIDE', clamp(x, 260, 820), y - 80, { at: 0.2, fill: '#ff5a4a', color: '#ffffff', size: 44 }); chip(g, t, 'NOW: ~1/3', clamp(x2, 260, 820), y2 + 90, { at: 0.6, fill: '#ffffff', size: 48 }); },
});

// ---------------------------------------------------------------- ANIMALS: the dung beetle
function savanna(T, o = {}) {
  const st = nightStage(T, { fov: 36, target: [0, 0.5, 0], shadowSize: 6 }); const g = new THREE.Group(); st.add(g);
  g.add(floor(200, 200, '#8a7a4a', 0, -40)); const r = rng(3);
  for (let i = 0; i < 60; i++) { const tf = cyl(0.01, 0.05, 0.4 + r() * 0.4, i % 2 ? '#a89a5a' : '#9a8a4a', (r() - 0.5) * 16, 0.25, -r() * 14 + 3, 4); tf.userData.noOutline = true; g.add(tf); }
  for (let i = 0; i < 3; i++) { const tr = roundTree({ s: 1.2, color: '#4a5a3a', seed: 30 + i }); tr.scale.set(1.6, 0.7, 1.6); tr.position.set(-8 + i * 9, 0, -16 - i * 3); g.add(tr); }
  const sky = (o.sky !== false) ? (await_sky(st)) : null;
  const b = beetle(); b.position.set(0.9, 0, 0); b.rotation.y = -Math.PI / 2; st.add(b); const ball_ = dungBall(); ball_.position.set(-0.4, 0, 0); st.add(ball_);
  let m = null; if (o.moon) { m = moon({ r: 2, lit: true }); m.position.set(4, 9, -30); st.add(m); }
  st.exposure = o.exposure ?? 0.95;
  return { stage: st, b, ball: ball_, m, sky };
}
import { sunnySky } from '/kits/toon3d/sky.js';
function await_sky(st) { return sunnySky(st, { top: '#070b26', mid: '#16245a', horizon: '#3a4a6a', glow: 0, clouds: 2, cloudColor: '#4a5a8a', seed: 6 }); }
// beetle pushes the ball (walks backwards with its hind legs on it, as dung beetles do: here simply pushing it to -X)
function roll(s, t, speed, x0 = 0.9, wobble = 0) {
  const x = x0 - speed * t; s.b.position.x = x; s.b.position.z = Math.sin(t * 3) * wobble; s.ball.position.x = x - 1.3; s.ball.position.z = s.b.position.z;
  s.ball.children.forEach(c => {}); s.ball.rotation.z = (x0 - x) / 0.6; beetleWalk(s.b, t); s.b.rotation.y = -Math.PI / 2 + Math.cos(t * 3) * wobble * 0.8;
}
// s12 — "But animals would get confused." Moonless savanna: the beetle and its ball stop; ??? over the beetle.
registerShot('s12', { kind: '3d',
  init(T) { return savanna(T, { exposure: 1.0 }); },
  draw(s, t, info) { roll(s, Math.min(t, 0.4), 0.8, 0.9, 0); s.b.rotation.y = -Math.PI / 2 + Math.sin(t * 5) * 0.5 * clamp(t - 0.4); s.sky?.update(t);
    camMove(s.stage, t, [[0, { pos: [0.4, 1.6, 8.0], look: [0.0, 0.6, 0], fov: 36 }], [info.dur, { pos: [0.4, 1.5, 7.2], look: [0.0, 0.6, 0], fov: 35 }]]); },
  overlay(g, t, info, s) { starfield(g, t, { seed: 11 }); reactions(g, t, s, [{ fx: 'question', on: 'b', at: 0.4, height: 1.2 }, { fx: 'sweat', on: 'b', at: 0.8, height: 1.0 }]); stamp(g, t, 'CONFUSED', { at: at(info, 'confused', 0.8) - 0.05, x: 540, y: 420, size: 84, color: '#ffffff', fill: '#7a4ab8', rot: 0.05 }); },
});
// s13 — "Some dung beetles steer by moonlight." Flashback with the Moon up: the beetle rolls its ball in a dead-straight line.
registerShot('s13', { kind: '3d',
  init(T) { return savanna(T, { moon: true, exposure: 1.2 }); },
  draw(s, t, info) { roll(s, t, 1.0, 1.8); s.sky?.update(t); camMove(s.stage, t, [[0, { pos: [1.2, 3.0, 9.6], look: [0, 0.8, -0.5], fov: 38 }], [info.dur, { pos: [0.2, 2.9, 9.0], look: [-0.8, 0.8, -0.5], fov: 37 }]]); },
  overlay(g, t, info, s) { starfield(g, t, { seed: 12 }); const p0 = proj(s.stage, [1.8, 0.02, 0]), p1 = proj(s.stage, [s.ball.position.x, 0.02, 0]);
    g.save(); g.strokeStyle = 'rgba(255,240,180,0.9)'; g.lineWidth = 8; g.setLineDash([18, 14]); g.beginPath(); g.moveTo(...p0); g.lineTo(...p1); g.stroke(); g.restore();
    chip(g, t, 'steers by MOONLIGHT', 540, 1180, { at: at(info, 'moonlight', 0.8), fill: '#fff6d8', size: 52 }); reactions(g, t, s, [{ fx: 'sparkle', on: 'm', at: 0.2, height: 2 }]); },
});
// s14 — "They'd have to switch to steering..." No Moon: the beetle stops, looks up at the dark sky, ???
registerShot('s14', { kind: '3d',
  init(T) { return savanna(T, { exposure: 1.05 }); },
  draw(s, t, info) { roll(s, 0, 0); s.b.head.rotation.x = -0.4 * clamp(t * 3); s.sky?.update(t);
    camMove(s.stage, t, [[0, { pos: [1.8, 1.0, 6.6], look: [0.3, 1.1, -1], fov: 40 }], [info.dur, { pos: [1.7, 1.0, 6.0], look: [0.3, 1.2, -1], fov: 39 }]]); },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'question', on: 'b', at: 0.1, height: 1.2 }]); },
});
// s14b — "...by the Milky Way instead." Low angle: the Milky Way fades in across the sky; the beetle rolls on, happy.
registerShot('s14b', { kind: '3d',
  init(T) { return savanna(T, { exposure: 1.05 }); },
  draw(s, t, info) { roll(s, t, 0.9, 1.6); s.sky?.update(t); camMove(s.stage, t, [[0, { pos: [2.8, 0.8, 7.4], look: [0.4, 2.6, -2], fov: 46 }], [info.dur, { pos: [2.4, 0.85, 7.2], look: [0.0, 2.8, -2], fov: 46 }]]); },
  overlay(g, t, info, s) { milkyWay(g, t, ease.inOut(prog(t, 0, 0.5)), { y: 520, rot: -0.45 }); chip(g, t, 'MILKY WAY', 540, 300, { at: 0.1, fill: '#c8b8ff', size: 58 });
    reactions(g, t, s, [{ fx: 'sparkle', on: 'b', at: 0.3, height: 1.2 }, { fx: 'hearts', on: 'b', at: 0.8, height: 1.2, scale: 0.7 }]); },
});

// ---------------------------------------------------------------- TILT
function tiltScene(T, o = {}) { const st = spaceStage(T, { fov: 34 }); const p = axisPlanet({ r: 3, mars: o.mars }); st.add(p); p.tilt.rotation.z = (o.tilt ?? 23.4) * Math.PI / 180; return { stage: st, p }; }
const TCAM = { pos: [0, 0.6, 22], look: [0, 0, 0], fov: 34 };
// s15 — "But the strangest part is slow." Earth with its spin axis at today's tilt, a slow clock; stamp SLOW...
registerShot('s15', { kind: '3d',
  init(T) { return tiltScene(T); },
  draw(s, t, info) { s.p.spin.rotation.y = t * 0.8; camMove(s.stage, t, [[0, { pos: [0, 1.2, 25], look: [0, 0, 0], fov: 34 }], [info.dur, TCAM]]); },
  overlay(g, t, info, s) { starfield(g, t, { seed: 14 }); stamp(g, t, 'SLOW...', { at: at(info, 'slow', 0.8) - 0.05, x: 540, y: 420, size: 90, color: '#ffffff', fill: '#2a1c15', rot: -0.05 }); chip(g, t, 'tilt today: 23.4°', 540, 1480, { at: 0.3, fill: '#ffffff', size: 48 }); },
});
// s16 — "Over a few hundred thousand years..." Time-lapse: the globe spins in a blur, a year counter flips.
registerShot('s16', { kind: '3d',
  init(T) { return tiltScene(T); },
  draw(s, t, info) { s.p.spin.rotation.y = 2 + t * 9; s.p.tilt.rotation.z = (23.4 + Math.sin(t * 2) * 4 * prog(t, 0.5, info.dur)) * Math.PI / 180; camMove(s.stage, t, [[0, TCAM], [info.dur, { pos: [0, 0.6, 20], look: [0, 0, 0], fov: 34 }]]); },
  overlay(g, t, info, s) { const n = Math.floor(ease.in(prog(t, 0.1, info.dur)) * 300000 / 1000) * 1000;
    chip(g, t, `+${n.toLocaleString('en-US')} years`, 540, 400, { at: 0.05, fill: '#ffffff', size: 62 }); reactions(g, t, s, [{ fx: 'speedlines', at: 0 }]); },
});
// s16b — "...Earth's tilt could wobble." The axis swings, wider and wider; sweat.
registerShot('s16b', { kind: '3d',
  init(T) { return tiltScene(T); },
  draw(s, t, info) { s.p.spin.rotation.y = 2 + t * 3; const w = ease.out(prog(t, 0, info.dur * 0.8)); s.p.tilt.rotation.z = (23.4 + Math.sin(t * 5) * 25 * w) * Math.PI / 180; s.p.tilt.rotation.x = Math.cos(t * 5) * 0.2 * w;
    camMove(s.stage, t, [[0, { pos: [0, 0.6, 20], look: [0, 0, 0], fov: 34 }], [info.dur, { pos: [0, 0.6, 18.5], look: [0, 0, 0], fov: 34 }]]); },
  overlay(g, t, info, s) { chip(g, t, 'TILT', 540, 380, { at: at(info, 'tilt', 0.3), fill: '#ff5a4a', color: '#ffffff', size: 64 }); reactions(g, t, s, [{ fx: 'sweat', on: [2.6, 2.6, 0], at: 0.4, scale: 1.2 }, { fx: 'exclaim', on: [-2.6, 2.6, 0], at: at(info, 'wobble', 0.8), color: '#ff3b30' }]); },
});
// s17 — "Mars has no big moon..." Red Mars with its axis and two tiny lumpy moons; chip.
registerShot('s17', { kind: '3d',
  init(T) { const s = tiltScene(T, { mars: true, tilt: 25 }); s.mo = [0, 1].map(i => { const m = ball(0.22 + i * 0.06, '#8a7a6a', 0, 0, 0, 8); m.scale.set(1.3, 0.9, 1); s.stage.add(m); return m; }); return s; },
  draw(s, t, info) { s.p.spin.rotation.y = t * 0.8; s.mo.forEach((m, i) => { const a = t * (1.6 - i * 0.7) + i * 2; const R = 4.2 + i * 1.4; m.position.set(Math.cos(a) * R, Math.sin(a) * 0.6, Math.sin(a) * R); });
    camMove(s.stage, t, [[0, { pos: [0, 1.6, 24], look: [0, 0, 0], fov: 34 }], [info.dur, TCAM]]); },
  overlay(g, t, info, s) { starfield(g, t, { seed: 16 }); chip(g, t, 'MARS', 540, 380, { at: 0.1, fill: '#d0603a', color: '#ffffff', size: 64 }); chip(g, t, 'no big moon', 540, 1480, { at: at(info, 'big', 0.5), fill: '#ffffff', size: 52 }); },
});
// s18 — INSERT (payoff): "...and its tilt swings by up to 60 degrees." Counter over a wildly tilting Mars.
insertShot('s18', { scene: { init: (T) => tiltScene(T, { mars: true }), draw(s, t) { s.p.spin.rotation.y = t * 2; s.p.tilt.rotation.z = (30 + Math.sin(t * 4) * 30) * Math.PI / 180; s.stage.cam(TCAM.pos, TCAM.look, TCAM.fov); } },
  insert: { type: 'counter', title: 'MARS TILT SWINGS UP TO', value: 60, from: 0, suffix: '°', lines: ['over millions of years'], color: '#ff7a4a' }, dim: 0.5 });
// s18b — reaction: Earth with its Moon back, the Moon circling; hearts. (Keep the Moon.)
registerShot('s18b', { kind: '3d',
  init(T) { const st = spaceStage(T, { fov: 34 }); const e = globe({ r: 2.6 }); st.add(e); const m = moon({ r: 0.8, lit: true }); st.add(m); return { stage: st, e, m }; },
  draw(s, t, info) { s.e.spin.rotation.y = t; const a = 0.6 + t * 1.2; s.m.position.set(Math.cos(a) * 4.6, 0.8, Math.sin(a) * 4.6); camMove(s.stage, t, [[0, { pos: [0, 1.5, 19], look: [0, 0.3, 0], fov: 34 }], [info.dur, { pos: [0, 1.4, 17.5], look: [0, 0.3, 0], fov: 34 }]]); },
  overlay(g, t, info, s) { starfield(g, t, { seed: 17 }); reactions(g, t, s, [{ fx: 'hearts', on: [0, 2.6, 0], at: 0.15, scale: 1.3 }, { fx: 'sparkle', on: 'm', at: 0.3, height: 0.9 }]); chip(g, t, 'thanks, Moon', 540, 1480, { at: 0.2, fill: '#fff6d8', size: 56 }); },
});
// s20 — "Subscribe for more." Back to frame 1's beach camera, the Moon back up, tide high; last 0.12 s the poof starts -> loop.
registerShot('s20', { kind: '3d',
  init(T) { return beachScene(T); },
  draw(s, t, info) { beachPlay(s, t, t - info.dur); if (t < info.dur - 0.1) s.k.face(mixExpr(EXPR.happy, EXPR.grin, prog(t, 0.2, 0.6)), t);
    camMove(s.stage, t, [[0, { pos: [0.3, 2.6, 12], look: [-0.4, 3.4, -6], fov: 44 }], [info.dur - 0.12, BCAM0], [info.dur, BCAM0]], ease.out); },
  overlay(g, t, info, s) { starfield(g, t, { seed: 2 }); reactions(g, t, s, [{ fx: 'hearts', on: 'k', at: 0.25, until: info.dur - 0.4, scale: 0.8 }, { fx: 'sparkle', on: 'm', at: 0.1, height: 2.2 }]); },
});
