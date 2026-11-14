// s10 "Imagine a butterfly turning back into a caterpillar every time life got hard." — sunny meadow (kit sunny preset):
// a butterfly in a party hat on a flower; poof on "caterpillar" -> a caterpillar in the same hat; a tiny rain cloud on "life got hard"
import { registerShot, ease, prog, clamp, lerp, E } from '/engine/core.js';
import { camMove, THREE, ball, cyl, outline, toon } from '/kits/toon3d/toon.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import { at, meadow, butterfly, caterpillar, chip, fxr } from './_lib.js';

registerShot('s10', { kind: '3d',
  init(T) { const s = meadow(T); s.b = butterfly(); s.b.position.set(0, 1.4, 0.3); s.stage.add(s.b); s.c = caterpillar(); s.c.position.set(0, 0, 1.0); s.c.rotation.y = 0.3; s.stage.add(s.c);
    s.cloud = new THREE.Group(); const cm = toon('#9aa4b4', { fresh: true }); for (const [x, y, r] of [[0, 0, 0.45], [0.45, -0.08, 0.35], [-0.45, -0.08, 0.35], [0.2, 0.22, 0.32]]) { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), cm); m.position.set(x, y, 0); s.cloud.add(m); }
    outline(s.cloud, { px: 2.2 }); s.drops = []; for (let i = 0; i < 7; i++) { const d = cyl(0.015, 0.015, 0.16, '#5ab0ff', 0, 0, 0, 5); d.userData.noOutline = true; s.cloud.add(d); s.drops.push(d); } s.stage.add(s.cloud); return s; },
  draw(s, t, info) { s.sky.update(t); const cat = at(info, 'caterpillar', 2.0), hard = at(info, 'life', 3.2);
    const k = prog(t, cat, cat + 0.06); s.b.visible = k < 1; s.c.visible = k >= 1;
    s.b.position.y = 1.4 + Math.sin(t * 2) * 0.12; s.b.rotation.y = Math.sin(t * 0.8) * 0.3; s.b.update(t, { lid: 0.2 });
    s.c.scale.setScalar(ease.outBack(prog(t, cat, cat + 0.35))); s.c.update(t, { lid: t > hard ? 0.6 : 0.2 });
    const cl = ease.outBack(prog(t, hard - 0.1, hard + 0.25)); s.cloud.visible = cl > 0.01; s.cloud.scale.setScalar(Math.max(0.001, cl)); s.cloud.position.set(0, 2.3 + Math.sin(t * 2) * 0.05, 1.0);
    s.drops.forEach((d, i) => { const u = ((t * 1.6 + i * 0.37) % 1); d.position.set(-0.45 + i * 0.15, -0.4 - u * 1.4, 0); });
    camMove(s.stage, t, [[0, { pos: [0, 2.0, 6.2], look: [0, 1.25, 0], fov: 36 }], [info.dur, { pos: [0, 1.8, 5.0], look: [0, 1.1, 0.5], fov: 36 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: { from: [-60, -80] }, tint: '#ffcf8a' }); const cat = at(info, 'caterpillar', 2.0), hard = at(info, 'life', 3.2), b = at(info, 'butterfly', 0.4);
    chip(g, 'BUTTERFLY  ⇄  CATERPILLAR', E.W / 2, E.H * 0.18, t - b, { size: 58, color: '#ffffff', rot: -3 });
    fxr(g, t, s, [{ fx: 'sparkle', on: 'b', at: b, scale: 0.5 }, { fx: 'flash', at: cat, dur: 0.16 }, { fx: 'sparkle', on: 'c', at: cat, scale: 0.8, seed: 5 }, { fx: 'sweat', on: 'c', at: hard + 0.1 }]); },
});
