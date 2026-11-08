// s002, s007, s013, s017: the cutaway Earth as a 3D prop. Tunnel pole to pole, the HERO as a tiny glowing mustard dot.
import { registerShot } from '/engine/core.js';
import { camMove, drift } from '/kits/toon3d/toon.js';
import { castMember } from '/kits/toon3d/cast.js';
import { POSE, EXPR, addPose, idle } from '/kits/toon3d/rig.js';
import { THREE, at, chip, popK, screen, globe, ease, prog, clamp, lerp } from './_lib.js';

const tunnelGrow = (s, k) => { const T = s.G.children.find(c => c.geometry?.type === 'CylinderGeometry' && c.geometry.parameters.radiusTop === 0.07); const H = s.R + 0.15; T.scale.y = Math.max(0.001, k); T.position.y = H - k * H; };

// s002 "straight through the Earth?" — the globe, cut open; the tunnel draws itself from the North Pole down to the South Pole
registerShot('s002', { kind: '3d',
  init(T) { return globe(T); },
  draw(s, t, info) { const k = ease.inOut(prog(t, 0.15, at(info, 'Earth', 0.9) + 0.25)); tunnelGrow(s, k);
    s.update(t, 1 - 0.06 * ease.in(prog(t, 1.1, info.dur)), t * 0.02);
    camMove(s.stage, t, [[0, { pos: [0, 5.0, 21.5], look: [0, 0.2, 0], fov: 34 }], [info.dur, { pos: [0, 4.0, 18.5], look: [0, 0.0, 0], fov: 34 }]], ease.out); },
  overlay(g, t, info, s) { chip(g, 'POLE TO POLE · NO AIR', popK(t, 0.05), 0.12, { size: 46, color: '#ffffff' });
    const [nx, ny] = screen(s.stage, new THREE.Vector3(0, 3.75, 0)); chip(g, 'N', popK(t, 0.2), ny / 1920 - 0.02, { x: nx, size: 40, color: '#ffffff' });
    const [sx, sy] = screen(s.stage, new THREE.Vector3(0, -3.75, 0)); chip(g, 'S', popK(t, 0.9), sy / 1920 + 0.02, { x: sx, size: 40, color: '#ffffff' }); },
});
// s007 "Near the core, it's about as hot" — push into the cut toward the glowing inner core; the dot is almost there
registerShot('s007', { kind: '3d',
  init(T) { const s = globe(T); tunnelGrow(s, 1); return s; },
  draw(s, t, info) { s.update(t, lerp(0.55, 0.22, ease.inOut(prog(t, 0, info.dur))), 0.05 + t * 0.02, 1, 1);
    camMove(s.stage, t, [[0, { pos: [0, 3.5, 17.0], look: [0, 0.2, 0], fov: 34 }], [info.dur, { pos: [0.1, 1.2, 8.0], look: [0, 0.0, 0], fov: 34 }]], ease.inOut); },
  overlay(g, t, info, s) { const [x, y] = screen(s.stage, new THREE.Vector3(0, -0.2, 0.6)); chip(g, 'INNER CORE', popK(t, at(info, 'core', 0.4)), y / 1920 + 0.07, { x, size: 48, color: '#ffffff' }); },
});
// s013 "about thirty-eight minutes later," — the dot glides up to the South Pole; MINA (cast cameo) times it, deadpan
registerShot('s013', { kind: '3d',
  init(T) { const s = globe(T); tunnelGrow(s, 1); const m = castMember('mina'); m.position.set(2.5, -3.6, 5.5); m.rotation.y = -0.35; m.scale.multiplyScalar(1.15); s.stage.add(m); s.mina = m;
    s.stage.key.castShadow = false; return s; },
  draw(s, t, info) { const k = ease.inOut(prog(t, 0, info.dur - 0.15)); s.update(t, -k, 0.1 + t * 0.03, 1, 1);
    s.mina.pose(addPose(POSE.stand, { ...idle(t, 4), armR: [1.2, 0.1, 0.2], elbowR: 1.1, headNod: 0.25 })); s.mina.prop.tick(t * 3);
    const c = at(info, 'thirty', 0.3); s.mina.face(t < c + 0.4 ? { ...EXPR.deadpan, pupil: [0.3, -0.6] } : { ...EXPR.smug, pupil: [-0.2, 0] }, t);
    camMove(s.stage, t, [[0, { pos: [0.5, 2.2, 19.5], look: [0.5, -0.8, 0], fov: 36 }], [info.dur, { pos: [0.7, 1.0, 18.0], look: [0.5, -1.2, 0], fov: 36 }]], ease.inOut); },
  overlay(g, t, info) { chip(g, '38 MIN', popK(t, at(info, 'thirty', 0.3)), 0.14, { size: 110 }); },
});
// s017 "Forever." — the dot zips back and forth, pole to pole, leaving a trail; camera drifts out
registerShot('s017', { kind: '3d',
  init(T) { const s = globe(T); tunnelGrow(s, 1); return s; },
  draw(s, t, info) { const w = Math.PI * 2 * 1.4; const y = -Math.cos(w * t), vy = -Math.sin(w * t); s.update(t, y, 0.2 + t * 0.05, 1, vy);
    camMove(s.stage, t, [[0, { pos: [0, 3.0, 16.0], look: [0, 0, 0], fov: 34 }], [info.dur, { pos: [0, 4.2, 20.0], look: [0, 0.2, 0], fov: 34 }]], ease.out); },
  overlay(g, t, info) { chip(g, 'FOREVER ∞', popK(t, at(info, 'Forever', 0.15) - 0.05), 0.14, { size: 92 }); },
});
