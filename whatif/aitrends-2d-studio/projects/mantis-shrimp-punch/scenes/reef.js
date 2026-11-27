// Mantis Shrimp Punch: 22 shots, Toon 3D + BEANMEN effects. s01 hook (frame 1, already punching) ... s22 closer (back to frame 1 -> loop).
// Tone guard: it only ever hits EMPTY shells and the tank glass. No fish, no snail, nobody hurt.
import { registerShot, ease, prog, clamp, lerp, E } from '/engine/core.js';
import { camMove, THREE } from '/kits/toon3d/toon.js';
import { shakeCam, anchor } from '/kits/toon3d/react.js';
import { insertShot, T as TXT, dimScene } from '/kits/toon3d/insert.js';
import { at, at2, seaStage, waterLook, mantis, shell, bubbleBurst, tank, toyBullet, pinky, strike, chip, stamp, fxr, topCaption, crack, gauge } from './_lib.js';

const V = new THREE.Vector3();
const fistP = (s) => { s.m.updateWorldMatrix(true, true); s.m.fist.getWorldPosition(V); return [V.x, V.y, V.z]; };
const SHELL_X = 2.0;
// the reef: stage + the shrimp at the origin (faces +X) + optional empty shell in front of its club + a bubble puff on the fist
function reef(T, o = {}) { const s = seaStage(T, { dark: !!o.dark, fov: o.fov || 34, seed: o.seed || 5, clear: o.clear || 4, floor: o.floor });
  s.m = mantis({ seed: o.ms || 1 }); s.stage.add(s.m);
  if (o.shell !== false) { s.sh = shell({ seed: o.shs || 4 }); s.sh.position.set(SHELL_X, 0, 0.17); s.sh.rotation.y = 0.6; s.stage.add(s.sh); }
  s.b = bubbleBurst({ seed: o.bs || 9 }); s.stage.add(s.b); return s; }
// bubbles follow the fist; k = puff size
const puff = (s, t, k, col = 0) => { const p = fistP(s); s.b.position.set(p[0] + 0.08, p[1], p[2]); s.b.update(t, k, col); };
const look = (g, t, o) => waterLook(g, t, o);
// FRAME 1 camera (3/4 front view: head + clubs + shell big, the tail receding)
const F1 = { pos: [2.5, 1.5, 5.3], look: [1.3, 0.6, 0], fov: 34 };
const F1b = { pos: [2.45, 1.45, 4.9], look: [1.32, 0.6, 0], fov: 34 };
// rapid jabs at the shell (the shell is a sturdy empty one in the hook: it just rocks)
const JABS = [0.12, 0.62, 1.12, 1.62, 2.12, 2.62];
function jabs(s, t, list = JABS) { let k = 0, last = -9; for (const a of list) { k = Math.max(k, strike(t, a, 0.08, 0.22)); if (t >= a) last = a; } return { k, age: t - last }; }
function rock(s, age) { if (!s.sh) return; s.sh.rotation.z = age < 0.4 && age >= 0 ? -Math.sin(age * 30) * 0.12 * (1 - age / 0.4) : 0; }

// s01 HOOK "This shrimp punches so fast," — frame 1: already jabbing the empty shell, bubbles fizzing, top caption
registerShot('s01', { kind: '3d',
  init(T) { return reef(T); },
  draw(s, t, info) { s.sea.update(t); const j = jabs(s, t); s.m.update(t, { punch: j.k, punch2: strike(t, 0.37, 0.08, 0.22) * 0.9, lid: 0.35, mouth: 'smile' }); s.sh.update(t); rock(s, j.age);
    puff(s, t, j.age < 0.35 ? 1 - j.age / 0.35 : 0); camMove(s.stage, t, [[0, F1], [info.dur, F1b]], ease.out); shakeCam(s.stage, t, JABS.map(a => ({ fx: 'shake', at: a, amp: 0.035, dur: 0.15 }))); },
  overlay(g, t, info, s) { look(g, t); topCaption(g, t); fxr(g, t, s, [{ fx: 'flash', at: 0.12, dur: 0.08 }, { fx: 'speedlines', at: 0.0, until: info.dur }]); },
});
// s02 "the water around it briefly BOILS." — close on the club: each jab leaves a fizz of vapour bubbles; big puff on "boils"
registerShot('s02', { kind: '3d',
  init(T) { return reef(T, { seed: 6 }); },
  draw(s, t, info) { s.sea.update(t); const bo = at(info, 'boils', 1.1); const list = [0.1, 0.55, bo]; const j = jabs(s, t, list); s.m.update(t, { punch: j.k, lid: 0.3, mouth: t > bo ? 'o' : 'smile' }); s.sh.update(t); rock(s, j.age);
    puff(s, t, t > bo ? 1.3 * (1 - clamp((t - bo - 0.6) / 0.5)) : j.age < 0.35 ? 1 - j.age / 0.35 : 0);
    camMove(s.stage, t, [[0, { pos: [1.1, 0.95, 3.4], look: [1.4, 0.6, 0.1], fov: 34 }], [info.dur, { pos: [1.15, 0.92, 3.0], look: [1.42, 0.6, 0.1], fov: 34 }]]); shakeCam(s.stage, t, [{ fx: 'shake', at: bo, amp: 0.06, dur: 0.3 }]); },
  overlay(g, t, info, s) { look(g, t); topCaption(g, t + info.shot.start, { noPop: true, until: 3.5 }); const bo = at(info, 'boils', 1.1);
    fxr(g, t, s, [{ fx: 'flash', at: bo, dur: 0.12 }, { fx: 'exclaim', on: 'm', at: bo + 0.1 }]); },
});
// s03 "Meet the PEACOCK mantis shrimp." — beauty orbit, sparkles, name chip
registerShot('s03', { kind: '3d',
  init(T) { return reef(T, { seed: 7, shell: false }); },
  draw(s, t, info) { s.sea.update(t); s.m.update(t, { lid: 0.2, mouth: 'smile', look: [0.5, 0.1] }); const a = lerp(0.55, 0.95, t / info.dur);
    s.stage.cam([0.2 + Math.cos(a) * 5.6, 1.6, Math.sin(a) * 5.6], [-0.4, 0.6, 0], 34); },
  overlay(g, t, info, s) { look(g, t); const p = at(info, 'peacock', 0.3); chip(g, 'PEACOCK', E.W / 2, E.H * 0.18, t - p, { size: 80, color: '#ffd23a', rot: -4 }); chip(g, 'mantis shrimp', E.W / 2, E.H * 0.18 + 130, t - p - 0.15, { size: 56, color: '#ffffff', rot: 3 });
    fxr(g, t, s, [{ fx: 'sparkle', on: 'm', at: p, scale: 0.9 }, { fx: 'glow', on: 'm', at: p }]); },
});
// s04 "SMALL, but it hits with" — tiny next to a big pebble; the club flexes
registerShot('s04', { kind: '3d',
  init(T) { const s = reef(T, { seed: 8, shell: false }); s.m.scale.setScalar(0.7); return s; },
  draw(s, t, info) { s.sea.update(t); const h = at(info, 'hits', 0.8); s.m.update(t, { lid: 0.35, mouth: 'smile', punch: strike(t, h, 0.15, 0.4), look: [0.6, 0] }); puff(s, t, t > h ? clamp(1 - (t - h) / 0.4) : 0);
    camMove(s.stage, t, [[0, { pos: [2.6, 2.6, 4.8], look: [0.4, 0.3, 0], fov: 34 }], [info.dur, { pos: [2.2, 1.6, 3.6], look: [0.5, 0.4, 0], fov: 34 }]]); },
  overlay(g, t, info, s) { look(g, t); chip(g, 'small...', E.W / 2, E.H * 0.2, t - at(info, 'small', 0.05), { size: 64, color: '#ffffff', rot: -3 }); fxr(g, t, s, [{ fx: 'flash', at: at(info, 'hits', 0.8), dur: 0.1 }]); },
});
const beautyScene = { init(T) { return reef(T, { seed: 9, shell: false }); }, draw(s, t) { s.sea.update(t); s.m.update(t, { lid: 0.3, punch: strike(t % 1.2, 0.3, 0.1, 0.3) }); puff(s, t, 0); s.stage.cam([3.0, 1.3, 3.6], [0.6, 0.6, 0], 34); } };
// s05 INSERT 1 "THOUSANDS of times its body weight."
insertShot('s05', { scene: beautyScene, dim: 0.45, insert: { type: 'bigtext', kicker: 'IMPACT FORCE', title: '1000s ×', lines: ['its own body weight'], color: '#ffd23a' } });
// s06 "Its club fires" — side close-up: the club snaps out with speed lines
registerShot('s06', { kind: '3d',
  init(T) { return reef(T, { seed: 10, shell: false }); },
  draw(s, t, info) { s.sea.update(t); const f = at(info, 'fires', 0.4) + 0.05; s.m.update(t, { punch: strike(t, f, 0.3, 0.4), lid: 0.4, mouth: 'smile' }); puff(s, t, t > f ? clamp(1 - (t - f) / 0.5) : 0);
    camMove(s.stage, t, [[0, { pos: [1.4, 0.8, 3.0], look: [1.4, 0.6, 0], fov: 34 }], [info.dur, { pos: [1.5, 0.8, 2.7], look: [1.5, 0.6, 0], fov: 34 }]]); shakeCam(s.stage, t, [{ fx: 'shake', at: f, amp: 0.05, dur: 0.2 }]); },
  overlay(g, t, info, s) { look(g, t); const f = at(info, 'fires', 0.4); fxr(g, t, s, [{ fx: 'speedlines', at: f - 0.05, until: f + 0.6 }, { fx: 'flash', at: f + 0.05, dur: 0.08 }]); },
});
// s07 INSERT 2 "83 kilometers per hour." — counter card over the blurred strike
insertShot('s07', { scene: beautyScene, dim: 0.45, insert: { type: 'counter', title: 'CLUB SPEED', value: 83, from: 0, suffix: ' km/h', lines: ['from a standing start'], color: '#ff6a4a' } });
// s08 "Scientists compare it to a BULLET fired from a handgun." — a toy cartridge zips past the club in a speed race
registerShot('s08', { kind: '3d',
  init(T) { const s = reef(T, { seed: 11, shell: false }); s.bu = toyBullet(); s.stage.add(s.bu); return s; },
  draw(s, t, info) { s.sea.update(t); const b = at(info, 'bullet', 1.0); const k = Math.max(strike(t, b, 0.35, 0.4), strike(t, at(info, 'handgun', 2.0), 0.3, 0.4)); s.m.update(t, { punch: k, lid: 0.35, look: [0.5, 0.2] }); puff(s, t, k * 0.7);
    const p = fistP(s); s.bu.position.set(lerp(-6, 9, prog(t, b - 0.2, b + 0.5)), p[1] + 0.55, p[2]); s.bu.visible = t > b - 0.2 && t < b + 0.5;
    const ct = at(info, 'fired', 1.2); camMove(s.stage, t, t < ct ? [[0, { pos: [1.2, 1.2, 4.2], look: [1.2, 0.8, 0], fov: 34 }], [ct, { pos: [1.3, 1.2, 3.9], look: [1.3, 0.8, 0], fov: 34 }]] : [[ct, { pos: [4.2, 0.9, 2.2], look: [1.2, 0.8, 0], fov: 34 }], [info.dur, { pos: [3.9, 0.9, 2.0], look: [1.2, 0.8, 0], fov: 34 }]]); },
  overlay(g, t, info, s) { look(g, t); const b = at(info, 'bullet', 1.0); chip(g, '≈ like a bullet', E.W / 2, E.H * 0.2, t - b, { size: 64, color: '#ffd23a', rot: -4 });
    fxr(g, t, s, [{ fx: 'speedlines', at: b - 0.2, until: b + 0.7 }, { fx: 'exclaim', on: 'm', at: b + 0.3 }]); },
});
// s09 "BUT here's the weird part." — iris; the shrimp turns its stalk eyes to us, "???"
registerShot('s09', { kind: '3d',
  init(T) { return reef(T, { seed: 12, shell: false }); },
  draw(s, t, info) { s.sea.update(t); const w = at(info, 'weird', 0.6); s.m.update(t, { lid: lerp(0.2, 0.5, prog(t, w, w + 0.2)), look: [1, 0], eyeSpin: t > w ? 0.6 : 0, mouth: t > w ? 'o' : 'smile' });
    camMove(s.stage, t, [[0, { pos: [3.0, 1.3, 1.6], look: [1.0, 0.95, 0], fov: 34 }], [info.dur, { pos: [2.6, 1.2, 1.3], look: [1.0, 0.98, 0], fov: 34 }]]); },
  overlay(g, t, info, s) { look(g, t); fxr(g, t, s, [{ fx: 'question', on: 'm', at: at(info, 'weird', 0.6) }]); },
});
// s10 "The strike is so fast, the pressure around it CRASHES." — slow-motion strike + a pressure gauge whose needle drops
registerShot('s10', { kind: '3d',
  init(T) { return reef(T, { seed: 13, shell: false }); },
  draw(s, t, info) { s.sea.update(t); const c = at(info, 'crashes', 1.6); const k = ease.inOut(prog(t, 0.2, c)); s.m.update(t * 0.3, { punch: k, lid: 0.4, sway: 0.3 }); puff(s, t, prog(t, c - 0.3, c) * 0.5);
    const ct = at(info, 'the', 1.4, 2); camMove(s.stage, t, t < ct ? [[0, { pos: [2.2, 1.0, 3.4], look: [1.3, 0.7, 0], fov: 34 }], [ct, { pos: [2.0, 1.0, 2.9], look: [1.4, 0.7, 0], fov: 34 }]] : [[ct, { pos: [-0.2, 1.3, 3.6], look: [1.2, 0.6, 0], fov: 34 }], [info.dur, { pos: [0.0, 1.25, 3.2], look: [1.3, 0.6, 0], fov: 34 }]]); },
  overlay(g, t, info, s) { look(g, t); const c = at(info, 'crashes', 1.6); gauge(g, E.W * 0.5, E.H * 0.22, prog(t, c - 0.15, c + 0.25), t - at(info, 'pressure', 0.8) + 0.2);
    TXT(g, 'SLOW-MO', E.W * 0.82, E.H * 0.62, 44, { color: '#ffffff', stroke: '#2a1c15', a: 0.85 }); fxr(g, t, s, [{ fx: 'shake', at: c, amp: 0.04, dur: 0.2 }]); },
});
// s11 "The water turns into VAPOR bubbles." — the bubble cloud blooms around the club (slow motion); CAVITATION stamp
registerShot('s11', { kind: '3d',
  init(T) { return reef(T, { seed: 14, shell: false }); },
  draw(s, t, info) { s.sea.update(t); s.m.update(t * 0.3, { punch: 1, lid: 0.45, sway: 0.3 }); const v = at(info, 'vapor', 0.6); puff(s, t * 0.25, 0.4 + ease.out(prog(t, v - 0.1, v + 0.6)) * 1.4);
    camMove(s.stage, t, [[0, { pos: [2.4, 0.9, 1.9], look: [1.75, 0.6, 0.15], fov: 34 }], [info.dur, { pos: [2.25, 0.85, 1.6], look: [1.75, 0.6, 0.15], fov: 34 }]]); },
  overlay(g, t, info, s) { look(g, t); const v = at(info, 'vapor', 0.6); stamp(g, 'CAVITATION', E.W / 2, E.H * 0.18, t - v - 0.15, { size: 90, rot: -6, color: '#1a7ae8' }); fxr(g, t, s, [{ fx: 'sparkle', on: fistP(s), at: v, scale: 0.8 }]); },
});
// s12 "Like boiling, but from PRESSURE, not heat." — HEAT ✗ / PRESSURE ✓ over the bubble cloud
registerShot('s12', { kind: '3d',
  init(T) { return reef(T, { seed: 15, shell: false }); },
  draw(s, t, info) { s.sea.update(t); s.m.update(t * 0.3, { punch: 1, lid: 0.3, sway: 0.3, mouth: 'smile' }); puff(s, (t + 3) * 0.25, 1.8 + Math.sin(t * 3) * 0.1);
    const ct = at(info, 'but', 0.9); camMove(s.stage, t, t < ct ? [[0, { pos: [2.1, 1.6, 3.3], look: [1.5, 0.8, 0], fov: 34 }], [ct, { pos: [2.0, 1.5, 3.0], look: [1.5, 0.8, 0], fov: 34 }]] : [[ct, { pos: [2.6, 0.8, 1.6], look: [1.75, 0.65, 0.15], fov: 34 }], [info.dur, { pos: [2.45, 0.8, 1.4], look: [1.75, 0.65, 0.15], fov: 34 }]]); },
  overlay(g, t, info, s) { look(g, t); chip(g, 'like boiling...', E.W / 2, E.H * 0.16, t - at(info, 'boiling', 0.2), { size: 60, color: '#ffffff' });
    chip(g, 'PRESSURE ✓', E.W * 0.5, E.H * 0.26, t - at(info, 'pressure', 1.0), { size: 70, color: '#6ad07a', rot: -3 }); chip(g, 'heat ✗', E.W * 0.5, E.H * 0.35, t - at(info, 'heat', 1.6), { size: 60, color: '#ff6a5a', rot: 4 }); },
});
// s13 "Then the bubbles COLLAPSE..." — slow motion: the cloud shrinks to nothing; held beat
registerShot('s13', { kind: '3d',
  init(T) { return reef(T, { seed: 16, shell: false }); },
  draw(s, t, info) { s.sea.update(t); s.m.update(t * 0.3, { punch: 1, lid: 0.5, sway: 0.3, mouth: 'o' }); const c = at(info, 'collapse', 0.5); puff(s, (t + 6) * 0.25, 1.4, prog(t, c, info.dur - 0.1));
    camMove(s.stage, t, [[0, { pos: [1.15, 0.85, 3.2], look: [1.45, 0.58, 0.15], fov: 34 }], [info.dur, { pos: [1.2, 0.83, 2.8], look: [1.47, 0.58, 0.15], fov: 34 }]]); },
  overlay(g, t, info, s) { look(g, t); fxr(g, t, s, [{ fx: 'sweat', on: 'm', at: at(info, 'collapse', 0.5) }]); },
});
// s14 "and hit the target a SECOND time." — real speed: HIT 1 (club), then HIT 2 (bubble collapse) on the empty shell
registerShot('s14', { kind: '3d',
  init(T) { return reef(T, { seed: 17 }); },
  draw(s, t, info) { s.sea.update(t); const h1 = at(info, 'hit', 0.3), h2 = at(info, 'second', 1.0); s.m.update(t, { punch: strike(t, h1, h2 - h1 + 0.3, 0.4), lid: 0.4 }); s.sh.update(t); rock(s, t - h2 > 0 ? t - h2 : t - h1);
    puff(s, t, t < h1 ? 0 : 1.2, prog(t, h2 - 0.15, h2)); camMove(s.stage, t, [[0, { pos: [2.1, 1.3, 3.9], look: [1.3, 0.55, 0], fov: 34 }], [info.dur, { pos: [2.05, 1.25, 3.55], look: [1.35, 0.55, 0], fov: 34 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: h1, amp: 0.05, dur: 0.2 }, { fx: 'shake', at: h2, amp: 0.08, dur: 0.3 }]); },
  overlay(g, t, info, s) { look(g, t); const h1 = at(info, 'hit', 0.3), h2 = at(info, 'second', 1.0);
    chip(g, 'HIT 1', E.W * 0.32, E.H * 0.2, t - h1, { size: 70, color: '#ffd23a', rot: -6 }); chip(g, 'HIT 2', E.W * 0.68, E.H * 0.27, t - h2, { size: 80, color: '#ff6a4a', rot: 5 });
    fxr(g, t, s, [{ fx: 'flash', at: h1, dur: 0.1 }, { fx: 'flash', at: h2, dur: 0.14 }, { fx: 'stars', on: 'sh', at: h2 + 0.05, until: info.dur }]); },
});
// s15 INSERT 3 "One punch, two hits."
insertShot('s15', { scene: { init(T) { return reef(T, { seed: 18 }); }, draw(s, t) { s.sea.update(t); s.m.update(t, { punch: 0.2, lid: 0.3 }); s.sh.update(t); puff(s, t, 0); s.stage.cam([2.1, 1.3, 3.9], [1.3, 0.6, 0], 34); } },
  dim: 0.45, insert: { type: 'bigtext', kicker: 'ONE PUNCH', title: '2 HITS', lines: ['club + collapsing bubbles'], color: '#ff6a4a' } });
// s16 "BUT it gets stranger." — dark water, spotlight, sly look
registerShot('s16', { kind: '3d',
  init(T) { return reef(T, { dark: true, seed: 19, shell: false }); },
  draw(s, t, info) { s.sea.update(t); s.m.update(t, { lid: 0.55, look: [0.8, 0.1], mouth: 'smile' }); camMove(s.stage, t, [[0, { pos: [3.4, 1.4, 2.6], look: [0.8, 0.9, 0], fov: 34 }], [info.dur, { pos: [3.0, 1.3, 2.2], look: [0.85, 0.92, 0], fov: 34 }]]); },
  overlay(g, t, info, s) { look(g, t, { k: 0.06, surf: 0.05 }); fxr(g, t, s, [{ fx: 'spotlight', on: 'm', at: 0.0 }, { fx: 'sparkle', on: 'm', at: at(info, 'stranger', 0.6), scale: 0.5 }]); },
});
// s17 "The collapsing bubbles give off a tiny FLASH of light." — dark water, slow motion: a tiny bright spark where the bubbles die
registerShot('s17', { kind: '3d',
  init(T) { const s = reef(T, { dark: true, seed: 20, shell: false }); return s; },
  draw(s, t, info) { s.sea.update(t); const f = at(info, 'flash', 1.3); s.m.update(t * 0.3, { punch: 1, lid: 0.45, sway: 0.3, mouth: t > f ? 'o' : 'smile' }); puff(s, (t + 9) * 0.25, 1.3, prog(t, f - 0.5, f));
    const ct = at(info, 'give', 1.0); camMove(s.stage, t, t < ct ? [[0, { pos: [3.4, 1.3, 3.0], look: [1.2, 0.7, 0], fov: 34 }], [ct, { pos: [3.2, 1.25, 2.8], look: [1.25, 0.7, 0], fov: 34 }]] : [[ct, { pos: [2.6, 0.9, 2.2], look: [1.75, 0.6, 0.15], fov: 34 }], [info.dur, { pos: [2.4, 0.85, 1.8], look: [1.75, 0.6, 0.15], fov: 34 }]]); },
  overlay(g, t, info, s) { look(g, t, { k: 0.05, surf: 0.04 }); const f = at(info, 'flash', 1.3); const p = anchor(s.stage, fistP(s));
    if (t > f) { const a = Math.max(0, 1 - (t - f) / 0.9); g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(p.x + 30, p.y, 0, p.x + 30, p.y, 160); gr.addColorStop(0, `rgba(255,255,240,${a})`); gr.addColorStop(0.25, `rgba(180,230,255,${a * 0.6})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(p.x - 200, p.y - 200, 460, 400); g.restore(); }
    chip(g, 'LIGHT!', E.W / 2, E.H * 0.2, t - at(info, 'light', 1.8), { size: 84, color: '#fff27a', rot: -5 }); fxr(g, t, s, [{ fx: 'sparkle', on: fistP(s), at: f, scale: 0.7 }]); },
});
// s18 "Snail shells CRACK like eggs." — an EMPTY shell shatters
registerShot('s18', { kind: '3d',
  init(T) { return reef(T, { seed: 21, shs: 7 }); },
  draw(s, t, info) { s.sea.update(t); const c = at(info, 'crack', 0.6); s.m.update(t, { punch: strike(t, c, 0.2, 0.4), lid: 0.3, mouth: 'smile' }); s.sh.update(t, { crack: t >= c ? t - c : -1 }); puff(s, t, t > c ? clamp(1 - (t - c) / 0.4) : 0);
    camMove(s.stage, t, [[0, { pos: [2.3, 1.5, 4.0], look: [1.45, 0.5, 0], fov: 34 }], [info.dur, { pos: [2.25, 1.45, 3.7], look: [1.5, 0.5, 0], fov: 34 }]]); shakeCam(s.stage, t, [{ fx: 'shake', at: c, amp: 0.07, dur: 0.3 }]); },
  overlay(g, t, info, s) { look(g, t); const c = at(info, 'crack', 0.6); chip(g, '(empty shell)', E.W / 2, E.H * 0.2, t - 0.1, { size: 48, color: '#ffffff', rot: -3 });
    fxr(g, t, s, [{ fx: 'flash', at: c, dur: 0.12 }, { fx: 'stars', on: [SHELL_X, 0.6, 0.2], at: c + 0.05 }]); },
});
// tank shots: we look through the front glass; the shrimp faces us (rotated) behind it
function tankSet(T, o = {}) { const s = reef(T, { seed: o.seed || 22, shell: false, clear: 5 }); s.m.rotation.y = -Math.PI / 2 + 0.25; s.m.position.set(0, 0, -2.2); s.tk = tank(); s.tk.position.set(0, -0.2, 0); s.stage.add(s.tk); return s; }
const GL = { pos: [0.4, 1.0, 4.6], look: [0.2, 0.8, -1.2], fov: 34 };
// s19 "And the biggest ones can even break aquarium GLASS." — it punches the glass; a crack spreads
registerShot('s19', { kind: '3d',
  init(T) { return tankSet(T); },
  draw(s, t, info) { s.sea.update(t); const gl = at(info, 'glass', 1.6); const k = strike(t, gl, 0.25, 0.4); s.m.position.z = -2.2 + k * 0.45; s.m.update(t, { punch: k, lid: 0.45, mouth: 'smile', look: [0, 0] }); puff(s, t, t > gl ? clamp(1 - (t - gl) / 0.5) : 0);
    const ct = at(info, 'can', 0.7); camMove(s.stage, t, t < ct ? [[0, { pos: [3.0, 1.6, 4.4], look: [0.0, 0.8, -1.6], fov: 34 }], [ct, { pos: [2.8, 1.55, 4.1], look: [0.0, 0.8, -1.6], fov: 34 }]] : [[ct, GL], [info.dur, { ...GL, pos: [0.35, 1.0, 4.0] }]]); shakeCam(s.stage, t, [{ fx: 'shake', at: gl, amp: 0.08, dur: 0.35 }]); },
  overlay(g, t, info, s) { look(g, t); const gl = at(info, 'glass', 1.6); const p = anchor(s.stage, [fistP(s)[0], fistP(s)[1], 0]); crack(g, p.x, p.y, ease.out(prog(t, gl, gl + 0.35)), { seed: 5 });
    fxr(g, t, s, [{ fx: 'flash', at: gl, dur: 0.12 }, { fx: 'exclaim', on: 'm', at: gl + 0.15 }]); },
});
// s20 "So whatever you do..." — a giant finger comes toward the cracked glass; the shrimp narrows its eyes
registerShot('s20', { kind: '3d',
  init(T) { const s = tankSet(T, { seed: 23 }); s.f = pinky(); s.f.scale.setScalar(0.3); s.f.rotation.y = Math.PI / 2 + 0.3; s.stage.add(s.f); return s; },
  draw(s, t, info) { s.sea.update(t); s.m.update(t, { lid: lerp(0.3, 0.62, prog(t, 0.3, 0.8)), mouth: 'frown', look: [0, 0] }); s.f.position.set(1.3, 0.75, lerp(4.5, 0.6, ease.out(prog(t, 0.1, info.dur))));
    camMove(s.stage, t, [[0, { pos: [5.2, 1.5, 2.4], look: [0.6, 0.8, -0.4], fov: 34 }], [info.dur, { pos: [4.9, 1.45, 2.2], look: [0.6, 0.8, -0.4], fov: 34 }]]); },
  overlay(g, t, info, s) { look(g, t);  fxr(g, t, s, [{ fx: 'question', on: 'm', at: 0.3, until: info.dur }]); },
});
// s21 "NEVER tap on its TANK." — the shrimp cocks its club; the finger snaps back; stamp
registerShot('s21', { kind: '3d',
  init(T) { const s = tankSet(T, { seed: 24 }); s.f = pinky(); s.f.scale.setScalar(0.3); s.f.rotation.y = Math.PI / 2 + 0.3; s.stage.add(s.f); return s; },
  draw(s, t, info) { s.sea.update(t); const n = at(info, 'never', 0.1), tk = at(info, 'tank', 1.0); const k = strike(t, tk, 0.2, 0.4) ; s.m.position.z = -2.2 + k * 0.45; s.m.update(t, { lid: 0.62, mouth: 'frown', punch: Math.max(k, 0.15 * Math.sin(t * 14) ** 2 * (t > n ? 1 : 0)) });
    s.f.position.set(1.3, 0.75, t < tk ? 0.6 : lerp(0.6, 6, ease.out(prog(t, tk, tk + 0.35)))); puff(s, t, t > tk ? clamp(1 - (t - tk) / 0.5) : 0);
    camMove(s.stage, t, [[0, { pos: [4.9, 1.45, 2.2], look: [0.6, 0.8, -0.4], fov: 34 }], [info.dur, { pos: [4.6, 1.4, 2.0], look: [0.6, 0.8, -0.4], fov: 34 }]]); shakeCam(s.stage, t, [{ fx: 'shake', at: tk, amp: 0.06, dur: 0.3 }]); },
  overlay(g, t, info, s) { look(g, t);  const tk = at(info, 'tank', 1.0);
    stamp(g, "DON'T TAP!", E.W / 2, E.H * 0.2, t - at(info, 'never', 0.1), { size: 100, rot: -6 }); fxr(g, t, s, [{ fx: 'exclaim', on: 'm', at: tk }, { fx: 'flash', at: tk, dur: 0.1 }]); },
});
// s22 "Subscribe for more." — back on the reef, pulls out to frame 1's camera, jabbing again -> hard cut loops to s01
registerShot('s22', { kind: '3d',
  init(T) { return reef(T); },
  draw(s, t, info) { const tt = t - info.dur; const j = jabs(s, tt, JABS.map(a => a - 3)); s.sea.update(t); s.m.update(t, { punch: j.k, punch2: strike(tt, 0.37 - 3, 0.08, 0.22) * 0.9, lid: 0.35, mouth: 'smile' }); s.sh.update(t); rock(s, j.age); puff(s, t, j.age < 0.35 ? 1 - j.age / 0.35 : 0);
    camMove(s.stage, t, [[0, { pos: [1.9, 1.05, 2.8], look: [1.2, 0.62, 0], fov: 34 }], [info.dur, F1]], ease.inOut); },
  overlay(g, t, info, s) { look(g, t); fxr(g, t, s, [{ fx: 'hearts', on: 'm', at: 0.1 }]); },
});
