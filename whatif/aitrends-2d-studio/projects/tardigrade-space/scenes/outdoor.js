// Sunny shots: the landing (s08), the name (s12), 0.5 mm in moss (s13), gummy bear (s14)
import { registerShot, ease, prog, clamp, lerp, E } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { smoke } from '/kits/toon3d/fx.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { T as TXT } from '/kits/toon3d/insert.js';
import { at, tardigrade, sunny, steppe, capsule, parachute, moss, gummyBear, ruler, chip , fxr } from './_lib.js';

const RAYS = { rays: { from: [-60, -80], strength: 0.9 }, tint: '#ffcf8a' };

// s08 "When the satellite came home," — the capsule drops under its parachute onto the sunny steppe, dust puff
registerShot('s08', { kind: '3d',
  init(T) { const s = sunny(T, { target: [0, 0, 0], shadowSize: 10, fov: 40 }); steppe(s.stage); s.cap = capsule(); s.stage.add(s.cap); s.ch = parachute(); s.stage.add(s.ch);
    s.dust = smoke({ count: 14, size: 1.4, rise: 0.8, life: 1.4, spread: 1.8, color: '#d8c48a', seed: 3 }); s.dust.position.set(0, 0, 0); s.dust.visible = false; s.stage.add(s.dust); return s; },
  draw(s, t, info) { s.sky.update(t); const land = 0.95; const y = t < land ? 7.5 * (1 - ease.out(prog(t, 0, land)) ) : 0; const sq = t > land ? Math.exp(-(t - land) * 8) * Math.sin((t - land) * 30) * 0.06 : 0;
    s.cap.position.set(0, y, 0); s.cap.scale.set(1 + sq, 1 - sq, 1 + sq); s.cap.rotation.z = Math.sin(t * 3) * 0.08 * (t < land ? 1 : 0);
    const fall = ease.inOut(prog(t, land, land + 0.6)); s.ch.position.set(fall * 2.2, y + 4.4 - fall * 4.0, -fall * 0.8); s.ch.rotation.z = -fall * 1.2; s.ch.scale.set(1, lerp(1, 0.35, fall), 1);
    s.dust.visible = t > land; if (t > land) s.dust.update(t - land);
    camMove(s.stage, t, [[0, { pos: [0.5, 1.5, 12.5], look: [0, 3.4, 0], fov: 42 }], [land, { pos: [0.4, 1.4, 11.2], look: [0, 2.0, 0], fov: 42 }], [info.dur, { pos: [0.3, 1.4, 10.2], look: [0, 1.8, 0], fov: 42 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: land, amp: 0.08, dur: 0.35 }]); },
  overlay(g, t) { sunnyLook(g, t, RAYS); },
});

// s12 "They're called TARDIGRADES." — the hero up close in its moss, waving; a name sticker pops on the word
registerShot('s12', { kind: '3d',
  init(T) { const s = sunny(T, { target: [0, 0, 0], shadowSize: 5, seed: 4 }); moss(s.stage, { seed: 21 }); s.tg = tardigrade({ seed: 1 }); s.stage.add(s.tg); return s; },
  draw(s, t, info) { s.sky.update(t); const n = at(info, 'tardigrades', 0.5);
    s.tg.update(t, { wave: ease.out(prog(t, 0.05, 0.3)), lid: 0.18, look: [0, 0], headTilt: Math.sin(t * 2) * 0.06 });
    camMove(s.stage, t, [[0, { pos: [0.2, 1.2, 6.0], look: [0, 0.95, 0], fov: 36 }], [info.dur, { pos: [0.1, 1.1, 5.1], look: [0, 0.95, 0], fov: 36 }]]); },
  overlay(g, t, info, s) { const n = at(info, 'tardigrades', 0.5); sunnyLook(g, t, { rays: { from: [-60, -80], strength: 0.7 }, tint: '#ffcf8a' });
    fxr(g, t, s, [{ fx: 'hearts', on: 'tg', at: 0.2, until: n }, { fx: 'sparkle', on: 'tg', at: n, scale: 0.6 }]);
    chip(g, 'TARDIGRADE', E.W / 2, E.H * 0.2, t - n, { size: 104, color: '#ffd23a', rot: -4 }); if (t > n + 0.25) TXT(g, 'a.k.a. "water bear"', E.W / 2, E.H * 0.2 + 125, 54, { color: '#ffffff', stroke: '#2a1c15', a: clamp((t - n - 0.25) / 0.2) }); },
});

// s13 "Half a millimeter long, lives in moss," — strolling through the moss forest next to a ruler; stat chips on the words
registerShot('s13', { kind: '3d',
  init(T) { const s = sunny(T, { target: [0, 0, 0], shadowSize: 6, seed: 6 }); moss(s.stage, { seed: 22, clear: 2.8, dropX: -2.8 }); s.tg = tardigrade({ seed: 1 }); s.stage.add(s.tg); s.ru = ruler(3.2); s.ru.position.set(0.2, 0, 1.0); s.stage.add(s.ru); return s; },
  draw(s, t, info) { s.sky.update(t); s.tg.position.set(-1.0 + t * 0.35, 0, 0); s.tg.rotation.y = 0.9; s.tg.update(t, { paddle: 1, lid: 0.25, look: [-0.4, 0], headTurn: -0.5 });
    camMove(s.stage, t, [[0, { pos: [1.8, 2.6, 8.2], look: [0, 0.6, 0], fov: 38 }], [info.dur, { pos: [1.3, 2.3, 7.4], look: [0.3, 0.6, 0], fov: 38 }]]); },
  overlay(g, t, info, s) { const mm = at(info, 'millimeter', 0.3), ms = at(info, 'moss', 1.8); sunnyLook(g, t, RAYS);
    chip(g, '0.5 mm', E.W * 0.32, E.H * 0.2, t - mm, { size: 92, color: '#ffd23a', rot: -5 }); chip(g, 'lives in moss', E.W * 0.62, E.H * 0.31, t - ms, { size: 72, color: '#a8e070', rot: 4 });
    fxr(g, t, s, [{ fx: 'sparkle', on: 'tg', at: mm + 0.1, scale: 0.7 }]); },
});

// s14 "looks like a gummy bear with 8 legs." — side by side with a gummy bear: ??? then hearts, "8 LEGS"
registerShot('s14', { kind: '3d',
  init(T) { const s = sunny(T, { target: [0, 0, 0], shadowSize: 5, seed: 8 }); moss(s.stage, { seed: 23, clear: 2.8 }); s.tg = tardigrade({ seed: 1 }); s.tg.position.set(-0.75, 0, 0); s.tg.rotation.y = 0.45; s.stage.add(s.tg);
    s.gb = gummyBear('#e8303a'); s.gb.scale.setScalar(0.78); s.gb.position.set(0.85, 0, -0.1); s.gb.rotation.y = -0.4; s.stage.add(s.gb); return s; },
  draw(s, t, info) { s.sky.update(t); const gm = at(info, 'gummy', 0.4), eg = at(info, '8', 1.3);
    s.tg.update(t, { lid: t > eg ? 0.15 : 0.3, look: t < eg ? [0.7, 0.1] : [0, 0], headTurn: t < eg ? 0.45 : 0.1, paddle: t > eg ? 1 : 0, bob: t > eg ? Math.abs(Math.sin(t * 8)) * 0.05 : 0 });
    s.gb.position.y = Math.abs(Math.sin(t * 3)) * 0.04; s.gb.scale.y = 0.78 * (1 + Math.sin(t * 6) * 0.02);
    camMove(s.stage, t, [[0, { pos: [0, 1.4, 8.0], look: [0, 0.95, 0], fov: 36 }], [info.dur, { pos: [0, 1.3, 7.2], look: [0, 0.95, 0], fov: 36 }]]); },
  overlay(g, t, info, s) { const gm = at(info, 'gummy', 0.4), eg = at(info, '8', 1.3); sunnyLook(g, t, RAYS);
    fxr(g, t, s, [{ fx: 'question', on: 'tg', at: gm, until: eg - 0.05, scale: 0.85 }, { fx: 'sparkle', on: 'gb', at: gm + 0.1, scale: 0.6, dy: 120 }, { fx: 'exclaim', on: 'tg', at: eg, until: eg + 0.8, scale: 0.85 }]);
    chip(g, '8 LEGS', E.W * 0.3, E.H * 0.22, t - eg, { size: 100, color: '#ffd23a', rot: -5 }); },
});
