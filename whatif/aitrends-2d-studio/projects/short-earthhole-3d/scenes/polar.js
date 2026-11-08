// s001, s018, s019 at the NORTH POLE (Arctic day, NORTH POLE sign) and s014-s016 at the SOUTH POLE (twilight, penguins).
import { registerShot, E, text } from '/engine/core.js';
import { camMove, drift } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, point, shrug, tremble, nod } from '/kits/toon3d/rig.js';
import { THREE, at, chip, popK, screen, northPole, southPole, FALL, TUCK, ease, prog, clamp, lerp } from './_lib.js';

// jump arc over the hole at the North Pole: g(t) = height of the feet, from the hop until he drops into the shaft
const jumpY = (t) => 2.0 + 2.4 * t - 7.2 * t * t;

// s001 "What if you jumped into a hole" — frame 1 = already mid-air over the glowing hole; camera tilts down with him
registerShot('s001', { kind: '3d',
  init(T) { return northPole(T); },
  draw(s, t, info) { s.flakes.update(t); const y = jumpY(t), x = lerp(-0.9, 0, clamp(t / 0.9));
    s.hero.position.set(x, y, 0.1); s.hero.rotation.set(0.15 * clamp(t * 2), 0.2, -0.12 + t * 0.1);
    const fall = ease.inOut(prog(t, 0.3, 0.6)); s.hero.pose(mixPose(addPose(TUCK, { armL: [1.0, 1.4, 0], armR: [1.0, 1.4, 0] }), FALL(t), fall));
    s.hero.face(t < 0.35 ? { ...EXPR.grin, lid: 0.15, brow: 0.5 } : { ...EXPR.shocked, pupil: [0, -0.8] }, t);
    camMove(s.stage, t, [[0, { pos: [0.6, 4.4, 8.6], look: [-0.6, 1.9, -0.4], fov: 48 }], [info.dur, { pos: [0.3, 5.6, 5.0], look: [0, -1.8, 0], fov: 50 }]], ease.inOut); },
  overlay(g, t) { chip(g, 'POLE TO POLE · NO AIR', popK(t, 0.0, 0.01), 0.075, { size: 46, color: '#ffffff' }); },
});

// --- SOUTH POLE ---
const penIdle = (s, t, o = {}) => s.pens.forEach((p, i) => p.update(t + i, typeof o === 'function' ? o(i) : o));
// s014 "you pop out on the other side." — he shoots up out of the hole; the penguins jump
registerShot('s014', { kind: '3d',
  init(T) { return southPole(T); },
  draw(s, t, info) { const p0 = at(info, 'pop', 0.45) - 0.15, k = prog(t, p0, p0 + 1.0), y = lerp(-4, 2.4, ease.out(k));
    s.hero.position.set(0, y, 0); s.hero.rotation.set(0, Math.sin(t * 2) * 0.1, 0);
    s.hero.pose(mixPose(POSE.armsUp, addPose(POSE.armsUp, { legL: [0.2, 0.3], legR: [-0.1, 0.3] }), ease.out(k))); s.hero.face(t < p0 + 0.6 ? { ...EXPR.shocked, mouth: 'open' } : { ...EXPR.grin, lid: 0.12 }, t);
    const sh = clamp((t - p0) * 4) * (1 - prog(t, p0 + 0.2, p0 + 0.7));
    penIdle(s, t, (i) => ({ shock: t > p0 ? 1 : 0, hop: Math.sin(Math.PI * sh) * 0.35, flap: t > p0 ? 1 - prog(t, p0 + 0.4, p0 + 1.0) : 0, look: [i === 2 ? -0.6 : 0.6, t > p0 ? 0.6 : 0] }));
    camMove(s.stage, t, [[0, { pos: [0, 2.6, 10.5], look: [0, 1.2, 0], fov: 46 }], [info.dur, { pos: [0, 2.8, 9.6], look: [0, 2.0, 0], fov: 46 }]]); },
  overlay(g, t) { chip(g, 'SOUTH POLE', popK(t, 0.1), 0.12, { size: 56, color: '#ffffff' }); },
});
// s015 "With no air to stop you," — he hangs at the top, waves awkwardly at a penguin. The penguin stares. Beat.
registerShot('s015', { kind: '3d',
  init(T) { return southPole(T); },
  draw(s, t, info) { s.hero.position.set(0, 2.4 + Math.sin(t * 2.4) * 0.03, 0); s.hero.rotation.set(0, -0.35, 0);
    const wave = Math.sin(t * 10) * 0.25; const st0 = at(info, 'stop', 1.0);
    s.hero.pose(t < st0 ? addPose(point(POSE.stand, 'R', 1, { up: 0.9 }), { armR: [0, wave, 0], legL: [0.15, 0.1], legR: [-0.1, 0.1], headTurn: -0.2, headNod: 0.25 }) : addPose(POSE.stand, { headNod: 0.5, armL: [0.2, 0.5, 0], armR: [0.2, 0.5, 0], legL: [0.1, 0.1] }));
    s.hero.face(t < st0 ? { ...EXPR.grin, lid: 0.35, lower: 0.45, pupil: [0.6, -0.3] } : { ...EXPR.worried, pupil: [0, -0.9], mouth: 'wavy' }, t);
    penIdle(s, t, (i) => ({ look: [i === 2 ? -0.5 : 0.5, 0.5], shock: 0 }));
    camMove(s.stage, t, [[0, { pos: [-1.6, 1.5, 7.4], look: [-0.6, 2.6, 0], fov: 46 }], [info.dur, { pos: [-1.5, 1.6, 6.8], look: [-0.5, 2.8, 0], fov: 45 }]]); },
  overlay(g, t, info) { chip(g, 'NO AIR = NO BRAKES', popK(t, at(info, 'air', 0.5)), 0.12, { size: 58 }); },
});
// s016 "you fall back." — gravity wins: he drops back into the hole. One penguin waves a flipper goodbye.
registerShot('s016', { kind: '3d',
  init(T) { return southPole(T); },
  draw(s, t, info) { const k = ease.in(prog(t, 0.08, 0.75)); s.hero.position.set(0, lerp(2.4, -5.5, k), 0); s.hero.rotation.set(0, 0, 0);
    s.hero.pose(addPose(POSE.armsUp, tremble(t, 2))); s.hero.face({ ...EXPR.panic, pupil: [0, 0.3] }, t);
    penIdle(s, t, (i) => ({ look: [i === 2 ? -0.5 : 0.5, lerp(0.5, -0.6, k)], lean: 0.25 * k, flap: i === 0 && t > 0.7 ? 0.35 : 0 }));
    camMove(s.stage, t, [[0, { pos: [0, 4.2, 8.2], look: [0, 1.0, 0], fov: 46 }], [info.dur, { pos: [0, 5.2, 6.6], look: [0, -0.2, 0], fov: 46 }]]); },
});

// --- back at the NORTH POLE ---
// s018 "Would you jump?" — he stands at the edge of the hole, looks into the lens, one eyebrow up, thumb at the hole
registerShot('s018', { kind: '3d',
  init(T) { return northPole(T); },
  draw(s, t, info) { s.flakes.update(t + 4); s.hero.position.set(-1.0, 0, 1.9); s.hero.rotation.set(0, 0.25, 0);
    const j = at(info, 'jump', 0.38), k = ease.inOut(prog(t, j - 0.15, j + 0.25));
    s.hero.pose(addPose(mixPose(POSE.stand, point(POSE.stand, 'L', 1, { up: -0.6, across: 0.3 }), k), { ...idle(t, 2), headTilt: 0.18 * k }));
    s.hero.face(mixExpr({ ...EXPR.neutral, pupil: [0, 0] }, { ...EXPR.smug, pupil: [0, 0] }, k), t);
    camMove(s.stage, t, [[0, { pos: [-0.7, 2.4, 6.6], look: [-0.7, 1.9, 1.4], fov: 38 }], [info.dur, { pos: [-0.75, 2.3, 5.6], look: [-0.75, 1.95, 1.6], fov: 36 }]]); },
});
// s019 "Subscribe for more." — he points at the viewer, grins... and hops into the hole (the loop back to frame 1)
registerShot('s019', { kind: '3d',
  init(T) { return northPole(T); },
  draw(s, t, info) { s.flakes.update(t + 5); const hop0 = at(info, 'more', 0.7) + 0.35, hk = prog(t, hop0, hop0 + 0.6);
    const x = lerp(-1.0, -0.4, ease.out(hk)), z = lerp(1.9, 0.6, ease.out(hk)), y = hk > 0 ? Math.max(0, 2.6 * Math.sin(Math.PI * Math.min(1, hk * 0.75))) : 0;
    s.hero.position.set(x, y, z); s.hero.rotation.set(0, lerp(0.25, -0.2, hk), 0);
    const pk = ease.outBack(prog(t, 0.05, 0.3));
    s.hero.pose(hk > 0 ? mixPose(point(POSE.stand, 'R', 1, { up: 0.1 }), addPose(TUCK, { armL: [1.0, 1.4, 0], armR: [1.0, 1.4, 0] }), ease.out(prog(hk, 0, 0.4))) : addPose(point(POSE.stand, 'R', pk, { up: 0.1, across: -0.15 }), { ...idle(t, 2), ...nod(t, 0.05, 2) }));
    s.hero.face(hk > 0 ? { ...EXPR.grin, lid: 0.15, brow: 0.5 } : { ...EXPR.grin, lid: 0.3, lower: 0.5, browL: 0.3, pupil: [0, 0] }, t);
    camMove(s.stage, t, [[0, { pos: [-0.75, 2.3, 5.6], look: [-0.75, 1.95, 1.6], fov: 36 }], [info.dur, { pos: [-0.4, 3.6, 7.8], look: [-0.4, 1.8, 0.6], fov: 44 }]], ease.inOut); },
  overlay(g, t, info) { const k = popK(t, at(info, 'Subscribe', 0.04) - 0.04);
    if (k <= 0) return; g.save(); const s = 0.75 + 0.25 * ease.outBack(clamp(k)); g.translate(E.W / 2, E.H * 0.13); g.scale(s, s); g.globalAlpha = clamp(k * 1.6);
    g.fillStyle = '#e03a2e'; g.beginPath(); g.roundRect(-300, -62, 600, 124, 62); g.fill(); g.lineWidth = 8; g.strokeStyle = '#20161a'; g.stroke();
    text(g, 'SUBSCRIBE FOR MORE', 0, 4, { size: 56, color: '#ffffff', weight: 700 }); g.restore(); },
});
