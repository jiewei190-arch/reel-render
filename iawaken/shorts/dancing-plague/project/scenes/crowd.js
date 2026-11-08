// s01 + s18 (loop), s02, s08, s09, s13: the dancing crowd in the street.
import { registerShot, ease, prog, clamp, lerp } from '/engine/core.js';
import { camMove, drift } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, walk, WALK_STRIDE } from '/kits/toon3d/rig.js';
import { castMember, cat } from '/kits/toon3d/cast.js';
import { THREE, at, tag, street, LIGHTS, crowd, dance, troffea, townsfolk } from './_lib.js';
import { E, text, FONTS } from '/engine/core.js';
import * as PR from '/kits/toon3d/props.js';

const TIRED = { ...EXPR.deadpan, lid: 0.62, mouth: 'wavy', brow: 0.2, browAngle: -0.3 };
const HAPPY = { ...EXPR.grin, lid: 0.35 };
// the whole street dancing; u = shot-local time (s18 uses u = t - dur so its last frame == s01's first frame)
function crowdInit(T) {
  const s = street(T, { ...LIGHTS.noon, target: [0, 0, -2], shadowSize: 12 });
  s.tr = troffea(); s.tr.position.set(0, 0, 2.2); s.stage.add(s.tr);
  s.c = crowd(s.stage, 16, [-3.6, 3.6, -9, 1.4], 3).filter(b => Math.hypot(b.position.x, b.position.z - 2.2) > 1.1);
  s.cat = cat({ scale: 0.55 }); s.cat.position.set(-3.8, 0.9, 1.0); s.cat.rotation.y = 0.5; s.stage.add(s.cat);
  return s;
}
function crowdDraw(s, u, o = {}) {
  const T = u + 20;
  s.c.forEach((b, i) => { dance(b, T * b.spd / 2, b.ph, 1, { spin: 0.5, tired: i % 3 === 0 }); b.face(i % 3 === 0 ? TIRED : HAPPY, T + i); });
  dance(s.tr, T, 0, 1, { spin: 0 }); s.tr.rotation.y = Math.sin(T * 1.1) * 0.5; s.tr.face(o.wink ? { ...HAPPY, lidL: 0.9 } : TIRED, T);
  s.cat.update(T, { lid: 0.6, look: [0.4, 0], tail: 0.8, headTurn: Math.sin(T * 2.1 * Math.PI * 2) * 0.15 });
  const d = drift(T, 0.05, 2); s.stage.cam([0.3 + d[0], 2.5 + d[1], 9.2 + u * -0.35], [0, 1.7, -1], 44);
}
registerShot('s01', { kind: '3d', init: crowdInit, draw(s, t) { crowdDraw(s, t); } });
registerShot('s18', { kind: '3d', init: crowdInit, draw(s, t, info) { crowdDraw(s, t - info.dur, { wink: t > 0.5 }); },
  overlay(g, t) { const k = ease.outBack(prog(t, 0.05, 0.3)); if (k <= 0) return; g.save(); g.translate(E.W / 2, E.H * 0.16); g.scale(k, k); const sz = 58; g.font = `700 ${sz}px "${FONTS.title}"`; const w = g.measureText('▶ Subscribe for more').width + 80; g.fillStyle = '#d8323a'; g.beginPath(); g.roundRect(-w / 2, -46, w, 92, 46); g.fill(); text(g, '▶ Subscribe for more', 0, 2, { size: sz, color: '#ffffff', weight: 700 }); g.restore(); } });

// s02 "a whole city couldn't stop dancing." — three dancers close, smiling at first, then a tired stare at the lens
registerShot('s02', { kind: '3d',
  init(T) { const s = street(T, { ...LIGHTS.noon, target: [0, 0, 0], shadowSize: 7 }); s.b = [townsfolk(2), townsfolk(5), townsfolk(8)]; s.b.forEach((b, i) => { b.position.set((i - 1) * 1.25, 0, 1.6 - Math.abs(i - 1) * 0.5); s.stage.add(b); }); s.bg = crowd(s.stage, 8, [-3.5, 3.5, -9, -2], 9); return s; },
  draw(s, t, info) { const st = at(info, 'stop', 0.9);
    s.b.forEach((b, i) => { dance(b, t * 1.05, i * 0.33, 1, { tired: t > st }); b.rotation.y = (i - 1) * -0.25; b.face(mixExpr(HAPPY, { ...TIRED, pupil: [0, 0] }, ease.inOut(prog(t, st, st + 0.3))), t + i); });
    s.bg.forEach((b, i) => { dance(b, t * b.spd / 2, b.ph, 1); b.face(HAPPY, t + i); });
    camMove(s.stage, t, [[0, { pos: [0, 2.3, 7.2], look: [0, 1.75, 0.8], fov: 40 }], [info.dur, { pos: [0, 2.2, 6.0], look: [0, 1.8, 0.8], fov: 38 }]]); },
});

// s08 "Then dozens join her." — neighbours walk in from both sides and catch the jig; Troffea in the middle
registerShot('s08', { kind: '3d',
  init(T) { const s = street(T, { ...LIGHTS.noon, target: [0, 0, -1], shadowSize: 10 }); s.tr = troffea(); s.tr.position.set(0, 0, 0.6); s.stage.add(s.tr);
    s.j = [[-4.5, -1.5, 1.4], [4.5, -0.5, 1.2], [-4.8, 1.2, 1.0], [4.8, 1.8, 0.9], [-4.2, -4, 1.6], [4.2, -3.5, 1.5], [-4.5, -6.5, 1.3], [4.5, -6, 1.1]].map(([x, z, dx], i) => { const b = townsfolk(20 + i); b.x0 = x; b.dx = Math.sign(x) * -dx * 1.4; b.position.set(x, 0, z); b.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2; b.t0 = 0.1 + i * 0.12; s.stage.add(b); return b; }); return s; },
  draw(s, t) { dance(s.tr, t, 0, 1); s.tr.rotation.y = Math.sin(t * 1.2) * 0.4; s.tr.face({ ...EXPR.deadpan, lid: 0.55 }, t);
    s.j.forEach((b, i) => { const k = clamp((t - b.t0) / 0.8); b.position.x = b.x0 + b.dx * ease.out(k); if (k < 1) { b.pose(walk(t + i, { speed: 1.8 })); b.face(EXPR.neutral, t); } else { dance(b, t, i * 0.4, clamp((t - b.t0 - 0.8) / 0.2)); b.rotation.y = lerp(b.rotation.y, Math.sin(t + i) * 0.5, 0.15); b.face({ ...EXPR.grin }, t); } });
    camMove(s.stage, t, [[0, { pos: [0, 2.8, 9], look: [0, 1.6, -1], fov: 42 }], [1.85, { pos: [0, 3.1, 10.2], look: [0, 1.5, -1.5], fov: 44 }]]); },
});

// s09 "According to chronicles, maybe four hundred." — crane up over a packed street
registerShot('s09', { kind: '3d',
  init(T) { const s = street(T, { ...LIGHTS.noon, target: [0, 0, -6], shadowSize: 16, bunting: false }); s.c = crowd(s.stage, 34, [-3.8, 3.8, -18, 3], 5); return s; },
  draw(s, t, info) { s.c.forEach((b, i) => { dance(b, t * b.spd / 2, b.ph, 1, { spin: 0.6, tired: i % 4 === 0 }); if (i % 3 === 0) b.face(i % 2 ? TIRED : HAPPY, t + i); });
    camMove(s.stage, t, [[0, { pos: [0, 2.6, 8], look: [0, 1.8, -2], fov: 42 }], [info.dur, { pos: [0, 12, 10], look: [0, 0, -7], fov: 48 }]], ease.inOut); },
  overlay(g, t, info) { const a = at(info, 'four', 1.3); tag(g, 'UP TO 400 (CHRONICLES)', ease.out(prog(t, a - 0.1, a + 0.2))); },
});

// s13 "It made things worse." — even more dancers; DEV films it on his phone, BISCUIT judges from a barrel
registerShot('s13', { kind: '3d',
  init(T) { const s = street(T, { ...LIGHTS.noon, target: [0, 0, 0], shadowSize: 9 }); s.c = crowd(s.stage, 18, [-3.6, 3.6, -9, 0.4], 13);
    s.dev = castMember('dev'); s.dev.position.set(0.62, 0, 2.3); s.dev.rotation.y = Math.PI + 0.45; s.stage.add(s.dev);
    s.cat = cat({ scale: 0.55 }); s.cat.position.set(-0.7, 0.9, 3.4); s.cat.rotation.y = 0.15; s.stage.add(s.cat);
    s.bar = PR.barrel(); s.bar.position.set(-0.7, 0, 3.4); s.stage.add(s.bar); return s; },
  draw(s, t, info) { s.c.forEach((b, i) => { dance(b, t * b.spd / 2, b.ph, 1, { spin: 0.6 }); b.face(HAPPY, t + i); });
    s.dev.pose(addPose({ ...POSE.stand, armR: [1.45, 0.05, -0.2], elbowR: 0.6, headNod: -0.05 }, idle(t, 4))); s.dev.face({ ...EXPR.grin, lid: 0.3 }, t);
    const w = at(info, 'worse', 1.0); s.cat.update(t, { lid: t > w ? 0.72 : 0.5, look: t > w ? [0, 0] : [0.5, 0.2], tail: 0.4, headTurn: t > w ? 0 : -0.4 });
    camMove(s.stage, t, [[0, { pos: [0, 2.2, 8.4], look: [0, 1.5, 1.5], fov: 40 }], [info.dur, { pos: [-0.3, 2.0, 7.4], look: [-0.4, 1.4, 2.6], fov: 37 }]]); },
});
