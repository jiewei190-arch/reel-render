// Axolotl Regrows: 23 shots, Toon 3D + BEANMEN effects. s01 hook (frame 1, a leg already regrowing) ... s23 closer (back to frame 1 -> loop).
// Tone guard: no injury is shown. A leg just goes "poof" to a dotted outline and regrows. Nobody is hurt.
import { registerShot, ease, prog, clamp, lerp, E } from '/engine/core.js';
import { camMove, THREE } from '/kits/toon3d/toon.js';
import { shakeCam, anchor } from '/kits/toon3d/react.js';
import { insertShot, T as TXT, dimScene } from '/kits/toon3d/insert.js';
import { at, at2, lakeStage, waterLook, axolotl, pinky, chip, stamp, fxr, topCaption, xrayHeart, xrayBrain, xraySpine, ghostLimb, calendar, canal, wp } from './_lib.js';

function lake(T, o = {}) { const s = lakeStage(T, { dark: !!o.dark, seed: o.seed || 5 }); s.a = axolotl({ seed: o.as || 1 }); s.a.rotation.y = o.ry ?? 0.45; s.stage.add(s.a); return s; }
const look = (g, t, o) => waterLook(g, t, { ray: '#f4ffe8', ...o });
const F1 = { pos: [2.0, 1.35, 3.9], look: [0.05, 0.38, -0.35], fov: 34 };
const F1b = { pos: [1.85, 1.3, 3.55], look: [0.05, 0.38, -0.35], fov: 34 };
const SIDE = (z = 3.4) => ({ pos: [z, 0.75, -0.2], look: [0, 0.38, -0.45], fov: 34 });
// x-ray look: dims the frame blue-ish under the organ icon
const xray = (g, k) => { if (k <= 0) return; g.save(); g.globalAlpha = 0.45 * k; g.fillStyle = '#10245a'; g.fillRect(0, 0, E.W, E.H); g.restore(); };
const HEART = [0, 0.3, -0.22], BRAIN = [0, 0.55, 0.2];
const regrow = (t, a, d = 0.9) => ease.out(prog(t, a, a + d));

// s01 HOOK "This salamander regrows its legs," — frame 1: its front leg is already regrowing, sparkles, top caption
registerShot('s01', { kind: '3d',
  init(T) { return lake(T); },
  draw(s, t, info) { s.sea.update(t); s.a.update(t, { legs: [regrow(t, 0.0, 1.5), 1, 1, 1], lid: 0.2, look: [0.3, -0.3], mouth: 'smile' }); camMove(s.stage, t, [[0, F1], [info.dur, F1b]], ease.out); },
  overlay(g, t, info, s) { look(g, t); topCaption(g, t); const L = anchor(s.stage, wp(s.a.legs[0].lg, 0.12, -0.1, 0)); ghostLimb(g, L.x, L.y, 60, 1 - prog(t, 0.6, 1.2));
    fxr(g, t, s, [{ fx: 'sparkle', on: wp(s.a.legs[0].lg), at: 0.0, scale: 0.6 }, { fx: 'sparkle', on: wp(s.a.legs[0].lg), at: at(info, 'legs', 1.6), scale: 0.6, seed: 4 }]); },
});
// s02 "its HEART," — x-ray side view: the heart fills up and beats
registerShot('s02', { kind: '3d',
  init(T) { return lake(T, { seed: 6, ry: 0 }); },
  draw(s, t, info) { s.sea.update(t); s.a.update(t, { lid: 0.3 }); camMove(s.stage, t, [[0, SIDE(3.4)], [info.dur, SIDE(3.1)]]); },
  overlay(g, t, info, s) { look(g, t); xray(g, prog(t, 0, 0.15)); const p = anchor(s.stage, HEART); xrayHeart(g, p.x, p.y, ease.inOut(prog(t, 0.1, 0.75)), t, 2.2);
    topCaption(g, t + info.shot.start, { noPop: true, until: 3.5 }); },
});
// s03 "even parts of its BRAIN." — x-ray: the brain fills in; "!"
registerShot('s03', { kind: '3d',
  init(T) { return lake(T, { seed: 7, ry: 0.15 }); },
  draw(s, t, info) { s.sea.update(t); s.a.update(t, { lid: 0.25, look: [0, 0.6], mouth: 'o' }); camMove(s.stage, t, [[0, { pos: [1.5, 1.5, 3.2], look: [0, 0.5, -0.1], fov: 34 }], [info.dur, { pos: [1.35, 1.45, 2.9], look: [0, 0.5, -0.1], fov: 34 }]]); },
  overlay(g, t, info, s) { look(g, t); xray(g, 1); const p = anchor(s.stage, BRAIN); const b = at(info, 'brain', 0.7); xrayBrain(g, p.x, p.y - 20, ease.inOut(prog(t, 0.1, b + 0.2)), t, 2.4);
    topCaption(g, t + info.shot.start, { noPop: true, until: 3.5 }); fxr(g, t, s, [{ fx: 'exclaim', on: 'a', at: b + 0.1 }, { fx: 'sparkle', on: BRAIN, at: b, scale: 0.7 }]); },
});
// s04 "Meet the AXOLOTL," — beauty orbit, name chip + how to say it
registerShot('s04', { kind: '3d',
  init(T) { return lake(T, { seed: 8, ry: 0 }); },
  draw(s, t, info) { s.sea.update(t); s.a.update(t, { lid: 0.15, mouth: 'smile', swim: 0.5 }); const a = lerp(1.15, 1.75, t / info.dur); s.stage.cam([Math.cos(a) * 3.6, 1.2, Math.sin(a) * 3.6 - 0.3], [0, 0.4, -0.35], 34); },
  overlay(g, t, info, s) { look(g, t); const n = at(info, 'axolotl', 0.4); chip(g, 'AXOLOTL', E.W / 2, E.H * 0.18, t - n, { size: 88, color: '#ffd23a', rot: -4 }); chip(g, 'ACK-suh-LAH-tuhl', E.W / 2, E.H * 0.18 + 130, t - n - 0.2, { size: 52, color: '#ffffff', rot: 3 });
    fxr(g, t, s, [{ fx: 'sparkle', on: 'a', at: n, scale: 0.8 }]); },
});
// s05 "the salamander that never grows up." — a pacifier pops in; hearts
registerShot('s05', { kind: '3d',
  init(T) { return lake(T, { seed: 9, ry: 0.2 }); },
  draw(s, t, info) { s.sea.update(t); const n = at(info, 'never', 0.6); s.a.update(t, { lid: 0.15, pacifier: t > n, mouth: 'smile' }); camMove(s.stage, t, [[0, { pos: [1.0, 1.15, 3.8], look: [0, 0.42, -0.2], fov: 34 }], [info.dur, { pos: [0.9, 1.1, 3.4], look: [0, 0.42, -0.2], fov: 34 }]]); },
  overlay(g, t, info, s) { look(g, t); const n = at(info, 'never', 0.6); fxr(g, t, s, [{ fx: 'flash', at: n, dur: 0.12 }, { fx: 'hearts', on: 'a', at: n + 0.1 }]); },
});
// s06 "It keeps its LARVAL body for life," — swims by in profile; stamp
registerShot('s06', { kind: '3d',
  init(T) { return lake(T, { seed: 10, ry: Math.PI / 2 }); },
  draw(s, t, info) { s.sea.update(t); s.a.update(t, { lid: 0.2, swim: 1, mouth: 'smile' }); s.a.position.x = lerp(-1.2, 1.0, t / info.dur); s.a.position.y = 0.3;
    camMove(s.stage, t, [[0, { pos: [-0.6, 1.0, 4.2], look: [-0.4, 0.6, 0], fov: 34 }], [info.dur, { pos: [0.6, 1.0, 4.0], look: [0.6, 0.6, 0], fov: 34 }]]); },
  overlay(g, t, info, s) { look(g, t); stamp(g, 'LARVAL FOR LIFE', E.W / 2, E.H * 0.2, t - at(info, 'larval', 0.5), { size: 84, rot: -6, color: '#e8407a' }); },
});
// s07 "FRILLY GILLS and all." — close on the gills waving; label chip
registerShot('s07', { kind: '3d',
  init(T) { return lake(T, { seed: 11, ry: 0.35 }); },
  draw(s, t, info) { s.sea.update(t); s.a.update(t, { lid: 0.2, sway: 1.6, mouth: 'smile' }); camMove(s.stage, t, [[0, { pos: [-1.2, 1.6, 2.6], look: [0.1, 0.62, -0.15], fov: 34 }], [info.dur, { pos: [-1.1, 1.55, 2.35], look: [0.1, 0.62, -0.15], fov: 34 }]]); },
  overlay(g, t, info, s) { look(g, t); chip(g, 'EXTERNAL GILLS', E.W / 2, E.H * 0.2, t - at(info, 'gills', 0.2), { size: 70, color: '#ff8ab0', rot: -3 }); fxr(g, t, s, [{ fx: 'sparkle', on: 'a', at: at(info, 'gills', 0.2), scale: 0.6 }]); },
});
// s08 "Lose a LEG?" — poof: the leg is gone (dotted outline only), "???"
registerShot('s08', { kind: '3d',
  init(T) { return lake(T, { seed: 12 }); },
  draw(s, t, info) { s.sea.update(t); const l = at(info, 'leg', 0.25); s.a.update(t, { legs: [t < l ? 1 : 0, 1, 1, 1], lid: 0.2, look: [0.4, -0.5], mouth: t > l ? 'o' : 'smile' }); camMove(s.stage, t, [[0, F1b], [info.dur, { ...F1b, pos: [1.7, 1.25, 3.2] }]]); },
  overlay(g, t, info, s) { look(g, t); const l = at(info, 'leg', 0.25); const L = anchor(s.stage, wp(s.a.legs[0].lg, 0.12, -0.1, 0)); ghostLimb(g, L.x, L.y, 60, t > l ? 1 : 0);
    fxr(g, t, s, [{ fx: 'sparkle', on: wp(s.a.legs[0].lg), at: l, scale: 0.5 }, { fx: 'question', on: 'a', at: l + 0.15 }]); },
});
// s09 "A new one grows back within MONTHS." — calendar flips, the leg regrows
registerShot('s09', { kind: '3d',
  init(T) { return lake(T, { seed: 13 }); },
  draw(s, t, info) { s.sea.update(t); s.a.update(t, { legs: [regrow(t, 0.15, info.dur - 0.35), 1, 1, 1], lid: 0.2, look: [0.4, -0.4], mouth: 'smile' }); camMove(s.stage, t, [[0, { pos: [1.5, 0.9, 2.6], look: [0.25, 0.3, -0.1], fov: 34 }], [info.dur, { pos: [1.35, 0.85, 2.3], look: [0.25, 0.3, -0.1], fov: 34 }]]); },
  overlay(g, t, info, s) { look(g, t); calendar(g, E.W * 0.5, E.H * 0.2, Math.floor(prog(t, 0.2, info.dur - 0.2) * 5.99), t - 0.05); const L = anchor(s.stage, wp(s.a.legs[0].lg, 0.12, -0.1, 0)); ghostLimb(g, L.x, L.y, 70, 1 - prog(t, 0.5, 1.0));
    fxr(g, t, s, [{ fx: 'sparkle', on: wp(s.a.legs[0].lg), at: info.dur - 0.4, scale: 0.6 }]); },
});
// s10 "BUT that's just the start." — iris; a smug look, spotlight
registerShot('s10', { kind: '3d',
  init(T) { return lake(T, { seed: 14, ry: -0.3 }); },
  draw(s, t, info) { s.sea.update(t); s.a.update(t, { lid: 0.5, look: [-0.3, 0], mouth: 'smile' }); camMove(s.stage, t, [[0, { pos: [-0.8, 1.0, 2.6], look: [-0.1, 0.5, 0], fov: 34 }], [info.dur, { pos: [-0.7, 0.95, 2.2], look: [-0.1, 0.5, 0], fov: 34 }]]); },
  overlay(g, t, info, s) { look(g, t); fxr(g, t, s, [{ fx: 'spotlight', on: 'a', at: 0 }, { fx: 'sparkle', on: 'a', at: at(info, 'start', 0.6), scale: 0.5 }]); },
});
// s11 "Its TAIL, its SPINAL CORD," — the tail regrows, then the spinal cord lights up from head to tail (x-ray)
registerShot('s11', { kind: '3d',
  init(T) { return lake(T, { seed: 15, ry: 0 }); },
  draw(s, t, info) { s.sea.update(t); s.a.update(t, { tail: lerp(0.15, 1, regrow(t, 0.05, 0.6)), lid: 0.25, swim: 0.6 }); camMove(s.stage, t, [[0, { pos: [0.02, 5.6, -0.5], look: [0, 0.3, -0.55], fov: 34 }], [info.dur, { pos: [0.02, 5.2, -0.5], look: [0, 0.3, -0.55], fov: 34 }]]); },
  overlay(g, t, info, s) { look(g, t); const sp = at(info, 'spinal', 0.8); xray(g, prog(t, sp - 0.15, sp)); if (t > sp - 0.1) xraySpine(g, anchor(s.stage, [0, 0.55, 0.15]), anchor(s.stage, [0, 0.36, -1.75]), ease.inOut(prog(t, sp - 0.1, sp + 0.6)));
    fxr(g, t, s, [{ fx: 'sparkle', on: [0, 0.4, -1.5], at: 0.4, scale: 0.6 }]); },
});
// s12 "even parts of its HEART grow back, without SCARS." — heart x-ray (side) -> cut, front: NO SCARS
registerShot('s12', { kind: '3d',
  init(T) { return lake(T, { seed: 16, ry: 0 }); },
  draw(s, t, info) { s.sea.update(t); const c = at(info, 'without', 1.35); s.a.update(t, { lid: 0.2, mouth: 'smile' });
    camMove(s.stage, t, t < c ? [[0, SIDE(3.3)], [c, SIDE(3.1)]] : [[c, { pos: [0.4, 0.9, 2.6], look: [0, 0.4, -0.2], fov: 34 }], [info.dur, { pos: [0.35, 0.88, 2.3], look: [0, 0.4, -0.2], fov: 34 }]]); },
  overlay(g, t, info, s) { look(g, t); const c = at(info, 'without', 1.35); if (t < c) { xray(g, 1); const p = anchor(s.stage, HEART); xrayHeart(g, p.x, p.y, ease.inOut(prog(t, 0.2, c - 0.2)), t, 2.2); }
    chip(g, 'NO SCARS ✓', E.W / 2, E.H * 0.2, t - at(info, 'scars', 1.7), { size: 84, color: '#6ad07a', rot: -4 }); fxr(g, t, s, [{ fx: 'sparkle', on: 'a', at: at(info, 'scars', 1.7), scale: 0.7 }]); },
});
// s13 "BUT here's the WILD part." — dark water, spotlight, gills up
registerShot('s13', { kind: '3d',
  init(T) { return lake(T, { dark: true, seed: 17, ry: 0.1 }); },
  draw(s, t, info) { s.sea.update(t); s.a.update(t, { lid: 0.1, mouth: 'o', sway: 1.4 }); camMove(s.stage, t, [[0, { pos: [0.6, 1.1, 3.8], look: [0, 0.42, -0.3], fov: 34 }], [info.dur, { pos: [0.5, 1.05, 3.3], look: [0, 0.42, -0.3], fov: 34 }]]); },
  overlay(g, t, info, s) { look(g, t, { k: 0.05, surf: 0.04 }); fxr(g, t, s, [{ fx: 'spotlight', on: 'a', at: 0 }, { fx: 'exclaim', on: 'a', at: at(info, 'wild', 0.45) }]); },
});
// s14 INSERT 1 "It can rebuild parts of its BRAIN."
const brainScene = { init(T) { return lake(T, { seed: 18, ry: 0.15 }); }, draw(s, t) { s.sea.update(t); s.a.update(t, { lid: 0.2 }); s.stage.cam([1.2, 1.2, 2.4], [0, 0.5, 0], 34); } };
insertShot('s14', { scene: brainScene, dim: 0.45, insert: { type: 'bigtext', kicker: 'IT CAN REBUILD', title: 'ITS BRAIN', lines: ['(parts of it)'], color: '#ff8ab0' } });
// s15 "SCIENTISTS study it," — a big magnifying glass sweeps over it
registerShot('s15', { kind: '3d',
  init(T) { return lake(T, { seed: 19, ry: 0.3 }); },
  draw(s, t, info) { s.sea.update(t); s.a.update(t, { lid: 0.15, look: [0, 0.5], mouth: 'o' }); camMove(s.stage, t, [[0, F1b], [info.dur, { ...F1b, pos: [1.75, 1.25, 3.3] }]]); },
  overlay(g, t, info, s) { look(g, t); const p = anchor(s.stage, [0, 0.45, 0]); const x = p.x + Math.sin(t * 2.4) * 140, y = p.y + Math.cos(t * 1.7) * 60; g.save(); g.lineWidth = 30; g.strokeStyle = '#2a1c15';
    g.beginPath(); g.moveTo(x + 150, y + 150); g.lineTo(x + 300, y + 300); g.stroke(); g.lineWidth = 22; g.strokeStyle = '#8a5a32'; g.stroke(); g.fillStyle = 'rgba(220,250,255,.25)'; g.beginPath(); g.arc(x, y, 200, 0, 7); g.fill(); g.lineWidth = 24; g.strokeStyle = '#2a1c15'; g.stroke(); g.lineWidth = 14; g.strokeStyle = '#c8ccd4'; g.stroke(); g.restore();
    chip(g, 'STUDIED IN LABS', E.W / 2, E.H * 0.18, t - 0.1, { size: 70, color: '#ffffff', rot: -3 }); },
});
// s16 "hoping humans could one day HEAL like this." — a human finger next to it (unhurt); sparkles + "?"
registerShot('s16', { kind: '3d',
  init(T) { const s = lake(T, { seed: 20, ry: -0.4 }); s.f = pinky(); s.f.scale.setScalar(0.2); s.f.position.set(1.0, 0, 0.1); s.f.rotation.y = 0.6; s.stage.add(s.f); return s; },
  draw(s, t, info) { s.sea.update(t); s.a.update(t, { lid: 0.2, look: [0.6, 0], mouth: 'smile' }); camMove(s.stage, t, [[0, { pos: [0.7, 1.4, 3.6], look: [0.4, 0.35, -0.2], fov: 34 }], [info.dur, { pos: [0.65, 1.35, 3.2], look: [0.4, 0.35, -0.2], fov: 34 }]]); },
  overlay(g, t, info, s) { look(g, t); const h = at(info, 'heal', 1.0); chip(g, 'one day... humans?', E.W / 2, E.H * 0.2, t - at(info, 'humans', 0.2), { size: 62, color: '#ffd23a', rot: -3 });
    fxr(g, t, s, [{ fx: 'sparkle', on: [1.0, 0.4, 0], at: h, scale: 0.6 }, { fx: 'question', on: 'a', at: h + 0.2 }]); },
});
// s17 "BUT in the wild," — iris; above the water: a canal between green banks
registerShot('s17', { kind: '3d',
  init(T) { return canal(T, { seed: 21 }); },
  draw(s, t, info) { s.sky.update?.(t); camMove(s.stage, t, [[0, { pos: [0, 4.5, 7], look: [0, 0, -8], fov: 40 }], [info.dur, { pos: [0, 4.2, 5.8], look: [0, 0, -8], fov: 40 }]]); },
  overlay(g, t, info, s) { chip(g, 'IN THE WILD', E.W / 2, E.H * 0.2, t - at(info, 'wild', 0.5), { size: 74, color: '#ffffff', rot: -3 }); },
});
// s18 INSERT 2 "the axolotl is CRITICALLY ENDANGERED."
insertShot('s18', { scene: { init(T) { return canal(T, { seed: 22 }); }, draw(s, t) { s.stage.cam([0, 4.2, 5.8 - t * 0.3], [0, 0, -8], 40); } }, dim: 0.5,
  insert: { type: 'bigtext', kicker: 'IN THE WILD: CRITICALLY', title: 'ENDANGERED', lines: ['IUCN Red List'], color: '#ff4a5a' } });
// s19 "It's down to a few CANALS near MEXICO CITY," — canal from above -> cut, low along the water; chips
registerShot('s19', { kind: '3d',
  init(T) { return canal(T, { seed: 23, w: 2.6 }); },
  draw(s, t, info) { const c = at(info, 'near', 1.1); camMove(s.stage, t, t < c ? [[0, { pos: [0, 9, 4], look: [0, 0, -6], fov: 40 }], [c, { pos: [0, 8.6, 3], look: [0, 0, -6], fov: 40 }]] : [[c, { pos: [0.4, 1.2, 4], look: [0, 0.4, -10], fov: 40 }], [info.dur, { pos: [0.3, 1.1, 2.8], look: [0, 0.4, -10], fov: 40 }]]); },
  overlay(g, t, info, s) { chip(g, 'XOCHIMILCO canals', E.W / 2, E.H * 0.18, t - at(info, 'canals', 0.6), { size: 64, color: '#ffffff', rot: -3 }); chip(g, 'near MEXICO CITY', E.W / 2, E.H * 0.18 + 120, t - at(info, 'mexico', 1.3), { size: 64, color: '#ffd23a', rot: 3 }); },
});
// s20 INSERT 3 "with maybe 50 to 1,000 adults left."
insertShot('s20', { scene: { init(T) { return canal(T, { seed: 24, w: 2.6 }); }, draw(s, t) { s.stage.cam([0.3, 1.1, 2.8 - t * 0.2], [0, 0.4, -10], 40); } }, dim: 0.5,
  insert: { type: 'bigtext', kicker: 'LEFT IN THE WILD', title: '50 – 1,000', lines: ['adults (IUCN estimate)'], color: '#ffd23a' } });
// s20b "adults left." — one lone axolotl in murky water, looking around
registerShot('s20b', { kind: '3d',
  init(T) { return lake(T, { seed: 27, ry: -0.5, dark: true }); },
  draw(s, t, info) { s.sea.update(t); s.a.update(t, { lid: 0.4, look: [Math.sin(t * 2) * 0.8, 0], mouth: 'frown', sway: 0.6 }); camMove(s.stage, t, [[0, { pos: [0, 2.6, 4.6], look: [0, 0.3, -0.3], fov: 34 }], [info.dur, { pos: [0, 2.9, 5.4], look: [0, 0.3, -0.3], fov: 34 }]]); },
  overlay(g, t, info, s) { look(g, t, { k: 0.05, surf: 0.04 }); fxr(g, t, s, [{ fx: 'sweat', on: 'a', at: 0.3 }]); },
});
// s21 "It can regrow parts of its brain..." — back under water, alone in murky green; a little brain sparkle
registerShot('s21', { kind: '3d',
  init(T) { return lake(T, { seed: 25, ry: 0.25, dark: true }); },
  draw(s, t, info) { s.sea.update(t); s.a.update(t, { lid: 0.35, look: [0, 0.5], mouth: 'smile', sway: 0.7 }); camMove(s.stage, t, [[0, { pos: [1.2, 1.3, 3.2], look: [0, 0.45, -0.3], fov: 34 }], [info.dur, { pos: [1.0, 1.2, 2.7], look: [0, 0.45, -0.3], fov: 34 }]]); },
  overlay(g, t, info, s) { look(g, t, { k: 0.06, surf: 0.05 }); const p = anchor(s.stage, BRAIN); xrayBrain(g, p.x, p.y - 140, 1, t, 0.7); fxr(g, t, s, [{ fx: 'sparkle', on: BRAIN, at: at(info, 'brain', 1.3), scale: 0.5 }]); },
});
// s22 "but not its HOME." — PAYOFF: the canal from above, the water shrinking to a thin strip; it looks up, small
registerShot('s22', { kind: '3d',
  init(T) { return canal(T, { seed: 26, w: 2.6 }); },
  draw(s, t, info) { s.water.scale.x = lerp(1, 0.25, ease.inOut(prog(t, 0.1, info.dur - 0.1))); s.water.material.color.set('#3f8a7a').lerp(new THREE.Color('#7a7a5a'), prog(t, 0.1, info.dur));
    camMove(s.stage, t, [[0, { pos: [0, 9, 4], look: [0, 0, -6], fov: 40 }], [info.dur, { pos: [0, 10, 5], look: [0, 0, -6], fov: 40 }]]); },
  overlay(g, t, info, s) { chip(g, '...but not its home', E.W / 2, E.H * 0.2, t - at(info, 'not', 0.1), { size: 70, color: '#ffffff', rot: -3 }); },
});
// s23 "Subscribe for more." — back under water at frame 1's camera; the leg goes "poof" just before the cut -> loops to s01 (regrowing)
registerShot('s23', { kind: '3d',
  init(T) { return lake(T); },
  draw(s, t, info) { s.sea.update(t); const pf = info.dur - 0.35; s.a.update(t, { legs: [t < pf ? 1 : 0, 1, 1, 1], lid: 0.2, look: [0.3, -0.3], mouth: 'smile' });
    camMove(s.stage, t, [[0, { pos: [1.4, 1.1, 2.6], look: [0.05, 0.4, -0.3], fov: 34 }], [info.dur, F1]], ease.inOut); },
  overlay(g, t, info, s) { look(g, t); const pf = info.dur - 0.35; const L = anchor(s.stage, wp(s.a.legs[0].lg, 0.12, -0.1, 0)); ghostLimb(g, L.x, L.y, 60, t > pf ? 1 : 0);
    fxr(g, t, s, [{ fx: 'hearts', on: 'a', at: 0.1 }, { fx: 'sparkle', on: wp(s.a.legs[0].lg), at: pf, scale: 0.5 }]); },
});
