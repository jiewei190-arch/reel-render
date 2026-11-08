// s15, s16: the payoff. Stress: famine, sickness, fear... spreading person to person (eerie dusk, no one hurt).
import { registerShot, ease, prog, clamp, lerp } from '/engine/core.js';
import { camMove, drift } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { THREE, at, tag, street, LIGHTS, dance, townsfolk, basket } from './_lib.js';

const WORRY = { ...EXPR.worried, lid: 0.35 };
// s15 "Historians think it was stress: famine," — dusk market: an empty bread basket on a stall, hungry worried townsfolk
registerShot('s15', { kind: '3d',
  init(T) { const s = street(T, { ...LIGHTS.eerie, target: [0, 0, 0], shadowSize: 8, bunting: false, fog: [8, 40, '#6a4a6a'] });
    s.tb = PR.table({ w: 1.8, d: 0.9 }); s.tb.position.set(0, 0, 1.4); s.stage.add(s.tb); s.bk = basket({ crumbs: true }); s.bk.position.set(0, 1.06, 1.4); s.stage.add(s.bk);
    s.f = [townsfolk(1), townsfolk(4), townsfolk(10)]; s.f.forEach((b, i) => { b.position.set((i - 1) * 1.3, 0, 0.3 - Math.abs(i - 1) * 0.3); b.rotation.y = (i - 1) * -0.3; s.stage.add(b); }); return s; },
  draw(s, t, info) { const f = at(info, 'famine', 1.47);
    s.f.forEach((b, i) => { b.pose(addPose({ ...POSE.stand, headNod: t > f ? 0.35 : 0.1, shrugY: -0.03 }, idle(t, i + 1))); b.face(t > f ? { ...EXPR.sad, pupil: [0, -0.6] } : { ...WORRY, pupil: [0, 0] }, t + i); });
    camMove(s.stage, t, [[0, { pos: [0, 2.6, 8.8], look: [0, 1.7, 0.6], fov: 36 }], [info.dur, { pos: [0, 2.4, 7.6], look: [0, 1.6, 0.8], fov: 34 }]]); },
  overlay(g, t, info) { const s = at(info, 'stress', 1.17), f = at(info, 'famine', 1.47); tag(g, 'STRESS', ease.out(prog(t, s - 0.05, s + 0.2)), 0.12); tag(g, 'FAMINE', ease.out(prog(t, f - 0.05, f + 0.2)), 0.2, { size: 46, color: '#ffffff' }); },
});
// s16 "sickness and fear, spreading person to person." — a row of townsfolk at dusk; the jig jumps from one to the next
registerShot('s16', { kind: '3d',
  init(T) { const s = street(T, { ...LIGHTS.eerie, target: [0, 0, 0], shadowSize: 10, bunting: false, fog: [8, 40, '#6a4a6a'] });
    s.r = [0, 1, 2, 3, 4, 5].map(i => { const b = townsfolk(40 + i); b.position.set(-3.0 + i * 1.2, 0, 1.2 - Math.abs(i - 2.5) * 0.25); b.rotation.y = 0; s.stage.add(b); return b; }); return s; },
  draw(s, t, info) { const p = at(info, 'spreading', 1.17);
    s.r.forEach((b, i) => { const on = p - 0.2 + i * 0.32; const k = clamp((t - on) / 0.3);
      if (k <= 0) { b.pose(addPose({ ...POSE.stand, headTurn: i > 0 && t > on - 0.4 ? 0.5 : 0 }, idle(t, i))); b.face({ ...WORRY, pupil: [i > 0 && t > on - 0.4 ? 0.7 : 0, 0] }, t + i); }
      else { dance(b, t - on, 0, ease.out(k), { tired: true }); b.face({ ...EXPR.deadpan, lid: 0.6, mouth: 'wavy', pupil: [0, 0] }, t + i); } });
    camMove(s.stage, t, [[0, { pos: [-2.2, 2.2, 7.4], look: [-1.6, 1.6, 1.0], fov: 38 }], [info.dur, { pos: [2.0, 2.2, 7.4], look: [1.6, 1.6, 1.0], fov: 38 }]]); },
  overlay(g, t, info) { const s = at(info, 'sickness', 0.13), f = at(info, 'fear', 0.79); tag(g, 'SICKNESS', ease.out(prog(t, s - 0.05, s + 0.2)), 0.12, { size: 46, color: '#ffffff' }); tag(g, 'FEAR', ease.out(prog(t, f - 0.05, f + 0.2)), 0.2, { size: 46, color: '#ffffff' }); },
});
