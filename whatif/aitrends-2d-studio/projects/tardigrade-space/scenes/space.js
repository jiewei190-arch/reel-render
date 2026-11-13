// Space shots: frame 1 (s01), orbit (s03), "first animal" (s15), versus (s16/s17), trophy (s18), closer (s19 -> loops to s01)
import { registerShot, ease, prog, clamp, lerp, E } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, tremble } from '/kits/toon3d/rig.js';
import { reactions, shakeCam, anchor } from '/kits/toon3d/react.js';
import { insertShot } from '/kits/toon3d/insert.js';
import { at, tardigrade, earth, spaceStage, satellite, astronaut, trophy, hook, chip, arrow , fxr } from './_lib.js';

// the hero floating in front of the Earth (shared by s01 / s15 / s18 / s19 so the loop lands cleanly)
function hero(T, o = {}) {
  const s = spaceStage(T, { fov: 34, seed: o.seed || 4 }); s.e = earth(40); s.e.position.set(o.ex ?? 0, -44.5, -30); s.e.rotation.set(0.35, 0, 0.2); s.stage.add(s.e);
  s.tg = tardigrade({ seed: 1, helmet: o.helmet, glasses: o.glasses }); s.tg.blob.visible = false; s.stage.add(s.tg); return s;
}
const F1 = { pos: [0, 1.0, 7.6], look: [0, 0.9, 0], fov: 34 };   // frame-1 framing (s19 ends on it)

// s01 "In 2007," — FRAME 1: already moving, thumbs up, hook text huge
registerShot('s01', { kind: '3d',
  init(T) { return hero(T); },
  draw(s, t, info) { s.stars.update(t); s.e.rotation.y = 0.4 + t * 0.03;
    s.tg.update(t, { thumb: 1, float: 1, lid: 0.25, look: [0, 0], headTilt: 0.08 }); s.tg.rotation.y = -0.18 + Math.sin(t * 0.9) * 0.08;
    camMove(s.stage, t, [[0, { ...F1, pos: [0.15, 1.02, 7.1] }], [info.dur, F1]], ease.out); },
  overlay(g, t, info, s) { hook(g, ['THIS ANIMAL', 'SURVIVED SPACE.', 'NAKED.'], E.H * 0.13, t + 1, { size: 128, lh: 150 });
    fxr(g, t, s, [{ fx: 'sparkle', on: 'tg', at: 0.0, scale: 0.55 }, { fx: 'sparkle', on: 'tg', at: 1.1, scale: 0.45, dx: -120, dy: 60, seed: 4 }]); },
});

// s03 "No suits." — the satellite in orbit above the Earth
registerShot('s03', { kind: '3d',
  init(T) { const s = spaceStage(T, { fov: 40, seed: 7 }); s.e = earth(40); s.e.position.set(0, -47, -6); s.stage.add(s.e); s.sat = satellite(); s.sat.scale.setScalar(0.8); s.stage.add(s.sat); return s; },
  draw(s, t, info) { s.stars.update(t); s.e.rotation.y = t * 0.04; s.sat.rotation.set(0.15, -0.5 + t * 0.12, 0.08); s.sat.position.y = Math.sin(t) * 0.05;
    camMove(s.stage, t, [[0, { pos: [5.5, 2.4, 9.5], look: [0, -0.6, 0], fov: 42 }], [info.dur, { pos: [4.2, 1.8, 7.6], look: [0, -0.3, 0], fov: 40 }]]); },
  overlay(g, t, info, s) { fxr(g, t, s, [{ fx: 'sparkle', on: [-2.9, 0.1, 0.2], at: 0.25, scale: 0.7 }]); },
});

// s15 "And now it's the first animal in history" — proud float over the Earth, spotlight + sparkle on "first"
registerShot('s15', { kind: '3d',
  init(T) { return hero(T, { seed: 9, ex: 4 }); },
  draw(s, t, info) { s.stars.update(t); s.e.rotation.y = 1.2 + t * 0.03; const f = at(info, 'first', 1.0);
    const proud = ease.inOut(prog(t, f - 0.1, f + 0.3)); s.tg.update(t, { float: 1, lid: lerp(0.2, 0.45, proud), lower: 0, thumb: proud, look: [0, 0.1], headTilt: -0.1 * proud });
    s.tg.rotation.y = lerp(0.5, 0.1, ease.inOut(prog(t, 0, info.dur)));
    camMove(s.stage, t, [[0, { pos: [-2.8, 0.4, 9.0], look: [0, 0.9, 0], fov: 34 }], [info.dur, { pos: [-1.3, 0.55, 7.0], look: [0, 0.9, 0], fov: 33 }]]); },
  overlay(g, t, info, s) { const f = at(info, 'first', 1.0); fxr(g, t, s, [{ fx: 'spotlight', on: 'tg', at: 0.05 }, { fx: 'sparkle', on: 'tg', at: f, scale: 0.6 }]); },
});

// versus scene: astronaut (suit + oxygen) left vs the naked tardigrade right
const vs = {
  init(T) { const s = spaceStage(T, { fov: 36, seed: 12 }); s.e = earth(40); s.e.position.set(0, -45, -26); s.stage.add(s.e);
    s.a = astronaut(); s.a.position.set(-0.8, -0.2, 0); s.a.rotation.y = 0.35; s.stage.add(s.a);
    s.tg = tardigrade({ seed: 3 }); s.tg.blob.visible = false; s.tg.position.set(0.85, 0.15, 0.3); s.tg.rotation.y = -0.4; s.stage.add(s.tg); return s; },
  draw(s, t, info, o = {}) { s.stars.update(t); s.e.rotation.y = t * 0.03;
    const shock = o.shock ?? 0; s.a.pose(addPose(mixPose(POSE.relaxed, POSE.panic, shock), { ...idle(t, 3), bob: Math.sin(t * 1.4) * 0.05 })); s.a.face(mixExpr(EXPR.smug, EXPR.shocked, shock), t);
    s.a.position.y = -0.2 + Math.sin(t * 1.2) * 0.06;
    s.tg.update(t, { float: 1, lid: 0.35, thumb: o.thumb ?? 0, wave: o.wave ?? 0, look: [-0.3, 0] });
    camMove(s.stage, t, [[0, { pos: [0, 1.3, 10.2], look: [0, 1.15, 0], fov: 36 }], [info.dur, { pos: [0, 1.25, 9.6], look: [0, 1.15, 0], fov: 36 }]]);
    if (o.shake) shakeCam(s.stage, t, [{ fx: 'shake', at: o.shake, amp: 0.08, dur: 0.4 }]); },
};
// s16 "to survive outer space." — INSERT: versus card over the (dimmed) versus scene
insertShot('s16', { scene: { init: vs.init, draw: (s, t, info) => vs.draw(s, t, info) }, dim: 0.25,
  insert: { type: 'versus', title: 'IN OPEN SPACE', lines: ['SUIT + OXYGEN', 'NOTHING'], colorL: '#2a6fd6', color: '#e0703a' } });
// s17 "NAKED." — the reveal: WINNER arrow to the bear, the astronaut panics (!, sweat), shake
registerShot('s17', { kind: '3d', init: vs.init,
  draw(s, t, info) { vs.draw(s, t + 1.85, info, { shock: ease.out(prog(t, 0.05, 0.3)), thumb: ease.out(prog(t, 0.1, 0.35)), shake: 0.02 }); },
  overlay(g, t, info, s) {
    fxr(g, t, s, [{ fx: 'exclaim', on: 'a', at: 0.05 }, { fx: 'sweat', on: 'a', at: 0.2 }, { fx: 'sparkle', on: 'tg', at: 0.15, scale: 0.9 }]);
    const a = anchor(s.stage, s.a), b = anchor(s.stage, s.tg);
    chip(g, 'SUIT + OXYGEN', Math.max(230, a.cx), a.y - 110, t - 0.05, { size: 50, color: '#9fc4ff', rot: -3 });
    arrow(g, b.cx + 10, b.y - 30, -Math.PI / 2 + 0.35, t - 0.25, null, { len: 150, color: '#ffd23a' });
    chip(g, 'WINNER', Math.min(E.W - 190, b.cx + 40), b.y - 290, t - 0.3, { size: 76, color: '#ffd23a', rot: -5 }); },
});

// s18 "Which means the toughest astronaut ever." — tiny helmet + the trophy
registerShot('s18', { kind: '3d',
  init(T) { const s = hero(T, { helmet: true, seed: 15, ex: -3 }); s.tr = trophy(); s.tr.scale.setScalar(0.62); s.tg.add(s.tr); s.tr.position.set(0, 0.42, 0.62); return s; },
  draw(s, t, info) { s.stars.update(t); s.e.rotation.y = 2 + t * 0.03; const k = ease.outBack(prog(t, 0.05, 0.45));
    s.tg.update(t, { float: 1, lid: 0.4, look: [0, 0.05], wave: 0, headTilt: 0.06 }); s.tr.position.y = 0.42 + Math.sin(t * 2) * 0.03; s.tr.scale.setScalar(0.62 * k);
    s.tg.legs.forEach(L => { if (L.pi === 0) L.sh.rotation.set(1.2, 0, L.s * 0.55); });
    s.tg.rotation.y = Math.sin(t * 0.8) * 0.12;
    camMove(s.stage, t, [[0, { pos: [0.7, 0.5, 8.0], look: [0, 0.9, 0], fov: 34 }], [info.dur, { pos: [0.25, 0.8, 6.2], look: [0, 0.95, 0], fov: 33 }]]); },
  overlay(g, t, info, s) { const tt = at(info, 'toughest', 0.6), ev = at(info, 'ever', 1.5);
    fxr(g, t, s, [{ fx: 'spotlight', on: 'tg', at: 0 }, { fx: 'sparkle', on: 'tg', at: tt, scale: 0.6 }, { fx: 'sparkle', on: 'tg', at: ev, scale: 0.8, seed: 3, dy: 330, dx: 10 }]); },
});

// s19 "Is this guy. Subscribe for more." — waves at the lens, helmet pops off on "Subscribe", pulls back to the frame-1 framing
registerShot('s19', { kind: '3d',
  init(T) { return hero(T, { helmet: true }); },
  draw(s, t, info) { s.stars.update(t); const off = at(info, 'subscribe', 1.35), guy = at(info, 'guy', 0.5);
    s.e.rotation.y = 0.4 + (t - info.dur) * 0.03;   // ends where frame 1 starts
    const pk = prog(t, off, off + 0.25); s.tg.helmet.visible = pk < 1; s.tg.helmet.scale.setScalar(1 + ease.out(pk) * 0.4); s.tg.helmet.position.y = ease.in(pk) * 0.6;
    const thumb = ease.inOut(prog(t, off + 0.05, off + 0.4)), wave = (1 - thumb) * ease.out(prog(t, guy - 0.2, guy + 0.1));
    s.tg.update(t, { float: 1, wave, thumb, lid: t < off ? 0.3 : 0.25, look: [0, 0], headTilt: 0.08 * thumb });
    s.tg.rotation.y = lerp(0, -0.18 + Math.sin(t * 0.9) * 0.08, thumb);
    camMove(s.stage, t, [[0, { pos: [0, 1.05, 5.4], look: [0, 1.0, 0], fov: 33 }], [off, { pos: [0, 1.0, 5.9], look: [0, 0.95, 0], fov: 33 }], [info.dur, { ...F1, pos: [0.15, 1.02, 7.1] }]], ease.inOut); },
  overlay(g, t, info, s) { const off = at(info, 'subscribe', 1.35), guy = at(info, 'guy', 0.5); fxr(g, t, s, [{ fx: 'hearts', on: 'tg', at: guy, until: off }, { fx: 'sparkle', on: 'tg', at: off + 0.05, scale: 0.55 }]); },
});
