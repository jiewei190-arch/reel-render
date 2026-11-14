// Immortal Jellyfish: the sea shots. s01 hook (dark water, halo) ... s19 closer (back to the frame-1 framing -> loop)
import { registerShot, ease, prog, clamp, lerp, E } from '/engine/core.js';
import { camMove, THREE, rbox, box, cyl, ball, outline, toon, flat } from '/kits/toon3d/toon.js';
import { shakeCam, anchor } from '/kits/toon3d/react.js';
import { insertShot, T as TXT, dimScene } from '/kits/toon3d/insert.js';
import { at, jelly, polyp, seaStage, waterLook, fish, turtle, resetButton, lunchSign, scanner, pinky, chip, hook, stamp, arcArrow, fxr } from './_lib.js';

// ---------- the hero in dark water (s01 / s02 / s19 share it so the loop lands cleanly) ----------
function dark(T, o = {}) { const s = seaStage(T, { dark: true, fov: 34, seed: o.seed || 4, floor: false }); s.j = jelly({ seed: 1, halo: true }); s.stage.add(s.j); return s; }
const F1 = { pos: [0, 1.35, 7.2], look: [0, 1.25, 0], fov: 34 };
const heroUpd = (s, t, u = {}) => { s.sea.update(t); s.j.update(t, { glow: 0.55, halo: 1, lid: 0.28, look: [0, 0], ...u }); s.j.rotation.y = Math.sin(t * 0.8) * 0.15; };

// s01 "There's a jellyfish that refuses to die of OLD AGE." — FRAME 1: glowing jelly with a halo, already swimming; hook text huge
registerShot('s01', { kind: '3d',
  init(T) { return dark(T); },
  draw(s, t, info) { heroUpd(s, t, { lid: lerp(0.28, 0.45, ease.inOut(prog(t, at(info, 'refuses', 1.0), at(info, 'refuses', 1.0) + 0.3))) });
    camMove(s.stage, t, [[0, { ...F1, pos: [0.2, 1.38, 6.6] }], [info.dur, { pos: [0, 1.3, 6.0], look: [0, 1.25, 0], fov: 34 }]], ease.out); },
  overlay(g, t, info, s) { hook(g, ['THE JELLYFISH', "THAT CAN'T DIE", 'OF OLD AGE'], E.H * 0.11, t + 1, { size: 124, lh: 140 });
    fxr(g, t, s, [{ fx: 'sparkle', on: 'j', at: 0.0, scale: 0.6 }, { fx: 'sparkle', on: 'j', at: at(info, 'old', 2.2), scale: 0.6, seed: 4 }]); },
});
// s02 "EVER." — close-up, smug wink, flash on the word
registerShot('s02', { kind: '3d',
  init(T) { return dark(T, { seed: 6 }); },
  draw(s, t, info) { const w = ease.inOut(prog(t, 0.05, 0.2)) * (1 - ease.inOut(prog(t, 0.6, 0.75))); heroUpd(s, t, { lid: 0.4, lidR: Math.max(0.4, w), mouth: 'smile' });
    camMove(s.stage, t, [[0, { pos: [0.3, 1.55, 3.6], look: [0, 1.5, 0], fov: 32 }], [info.dur, { pos: [0.15, 1.55, 3.2], look: [0, 1.5, 0], fov: 32 }]]); },
  overlay(g, t, info, s) { fxr(g, t, s, [{ fx: 'flash', at: 0, dur: 0.18 }, { fx: 'sparkle', on: 'j', at: 0.05, scale: 0.9 }]); },
});

// ---------- sunlit sea ----------
function sea(T, o = {}) { const s = seaStage(T, { fov: 36, seed: o.seed || 5, clear: o.clear }); s.j = jelly({ seed: o.js || 2 }); s.j.position.set(...(o.jp || [0, 0.9, 0])); s.stage.add(s.j); return s; }
const look = (g, t) => waterLook(g, t);

// s03 "When the immortal jellyfish gets INJURED," — name card, then a falling pebble bonks it (stars, shake)
registerShot('s03', { kind: '3d',
  init(T) { const s = sea(T); s.rock = ball(0.32, '#8a8f9a', 0, 8, 0, 12); outline(s.rock, { px: 2.4 }); s.stage.add(s.rock); return s; },
  draw(s, t, info) { s.sea.update(t); const hit = at(info, 'injured', 1.6) + 0.05; const fall = ease.in(prog(t, hit - 0.45, hit));
    s.rock.position.set(0.05, t < hit ? lerp(7, 3.2, fall) : 3.2 + (t - hit) * 2.5 - (t - hit) * (t - hit) * 6, t < hit ? 0 : (t - hit) * 1.4); s.rock.position.x = t < hit ? 0.05 : 0.05 + (t - hit) * 2.2;
    const dz = t > hit ? ease.out(prog(t, hit, hit + 0.2)) * (1 - prog(t, hit + 0.2, hit + 1.2)) : 0;
    s.j.update(t, { lid: lerp(0.2, 0.7, dz), mouth: t > hit ? 'o' : 'smile', look: t < hit ? [0, 0.6 * fall] : [0, 0], bob: -dz * 0.25 });
    camMove(s.stage, t, [[0, { pos: [0, 1.9, 7.8], look: [0, 1.85, 0], fov: 36 }], [info.dur, { pos: [0, 1.9, 7.2], look: [0, 1.9, 0], fov: 36 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: hit, amp: 0.08, dur: 0.35 }]); },
  overlay(g, t, info, s) { look(g, t); const hit = at(info, 'injured', 1.6) + 0.05; const a = anchor(s.stage, s.j);
    chip(g, 'Turritopsis dohrnii', E.W / 2, E.H * 0.17, t - at(info, 'immortal', 0.3), { size: 60, color: '#ffffff', rot: -3 });
    fxr(g, t, s, [{ fx: 'stars', on: 'j', at: hit + 0.05, until: hit + 1.4 }, { fx: 'flash', at: hit, dur: 0.12 }]); },
});
// s04 "or starts STARVING," — an empty plate, the gut light dims, sweat
registerShot('s04', { kind: '3d',
  init(T) { const s = sea(T, { seed: 7 }); s.plate = new THREE.Group(); s.plate.add(cyl(0.7, 0.55, 0.08, '#f4f2ec', 0, 0.04, 0, 28)); s.plate.add(cyl(0.5, 0.5, 0.02, '#e2ded4', 0, 0.09, 0, 28)); s.plate.add(ball(0.04, '#c08040', 0.2, 0.11, 0.1, 6));
    const fork = rbox(0.06, 0.02, 0.7, '#c8ccd4', 0.9, 0.02, 0.1, 0.01); s.plate.add(fork); outline(s.plate, { px: 2.2 }); s.plate.position.set(0, 0, 0.6); s.stage.add(s.plate); return s; },
  draw(s, t, info) { s.sea.update(t); s.j.update(t, { lid: 0.5, mouth: 'frown', look: [0, -0.7], pulse: 0.4 }); s.j.position.y = 0.8;
    camMove(s.stage, t, [[0, { pos: [0.6, 3.0, 7.6], look: [0, 1.3, 0], fov: 36 }], [info.dur, { pos: [0.4, 2.9, 7.0], look: [0, 1.35, 0], fov: 36 }]]); },
  overlay(g, t, info, s) { look(g, t); const st = at(info, 'starving', 0.4); fxr(g, t, s, [{ fx: 'sweat', on: 'j', at: st }, { fx: 'question', on: 'j', at: st + 0.35 }]); },
});
// s05 "it doesn't die. It hits the RESET BUTTON." — wink on "die", then it bonks a big red RESET button
registerShot('s05', { kind: '3d',
  init(T) { const s = sea(T, { seed: 8, jp: [0, 1.1, 0] }); s.btn = resetButton(); s.btn.position.set(0, 0, 0.2); s.stage.add(s.btn); return s; },
  draw(s, t, info) { s.sea.update(t); const die = at(info, 'die', 0.4), hit = at(info, 'reset', 1.6);
    const wink = ease.inOut(prog(t, die + 0.1, die + 0.25)) * (1 - ease.inOut(prog(t, die + 0.7, die + 0.85)));
    const dive = ease.in(prog(t, hit - 0.35, hit)), up = ease.out(prog(t, hit + 0.15, hit + 0.6));
    s.j.position.y = lerp(1.6, 0.0, dive) + up * 0.7; s.btn.press(t > hit ? 1 - prog(t, hit + 0.3, hit + 0.6) : 0);
    s.j.update(t, { lid: 0.25, lidR: Math.max(0.25, wink), mouth: t > hit ? 'o' : 'smile', look: [0, t > hit - 0.5 && t < hit ? -0.6 : 0], pulse: 1 });
    camMove(s.stage, t, [[0, { pos: [0, 2.4, 8.6], look: [0, 1.6, 0], fov: 36 }], [hit - 0.3, { pos: [0, 2.2, 7.8], look: [0, 1.3, 0], fov: 36 }], [info.dur, { pos: [0, 2.1, 7.4], look: [0, 1.3, 0], fov: 36 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: hit, amp: 0.1, dur: 0.4 }]); },
  overlay(g, t, info, s) { look(g, t); const hit = at(info, 'reset', 1.6), die = at(info, 'die', 0.4);
    fxr(g, t, s, [{ fx: 'sparkle', on: 'j', at: die + 0.15, scale: 0.5 }, { fx: 'flash', at: hit, dur: 0.22 }, { fx: 'exclaim', on: 'j', at: hit + 0.05 }, { fx: 'ripples', on: 'btn', at: hit, atFeet: true }]); },
});
// s06 "It melts into a blob, sinks to the seafloor," — melts, then sinks in slow motion and settles
registerShot('s06', { kind: '3d',
  init(T) { return sea(T, { seed: 9, jp: [0, 2.2, 0] }); },
  draw(s, t, info) { s.sea.update(t); const m0 = at(info, 'melts', 0.2), sk = at(info, 'sinks', 1.4); const melt = ease.inOut(prog(t, m0, m0 + 0.9)); const sink = ease.inOut(prog(t, sk - 0.1, info.dur - 0.2));
    s.j.position.y = lerp(2.2, -0.65, sink); s.j.update(t, { melt, lid: lerp(0.3, 0.75, melt), mouth: melt > 0.5 ? 'o' : 'frown', pulse: 1 - melt, sway: 1 - melt * 0.7 });
    camMove(s.stage, t, [[0, { pos: [0, 3.3, 8.2], look: [0, 3.0, 0], fov: 36 }], [sk, { pos: [0, 3.2, 7.6], look: [0, 2.8, 0], fov: 36 }], [info.dur, { pos: [0, 1.4, 5.4], look: [0, 0.6, 0], fov: 36 }]]); },
  overlay(g, t, info, s) { look(g, t); const m0 = at(info, 'melts', 0.2); fxr(g, t, s, [{ fx: 'sweat', on: 'j', at: m0 + 0.1, until: m0 + 1.0 }, { fx: 'ripples', on: 'j', at: info.dur - 0.25, atFeet: true }]); },
});
// s07 "and transforms back into a BABY." — poof: the blob becomes a polyp with a pacifier
registerShot('s07', { kind: '3d',
  init(T) { const s = sea(T, { seed: 10, jp: [0, -0.65, 0] }); s.p = polyp(); s.p.position.set(0, 0, 0); s.stage.add(s.p); return s; },
  draw(s, t, info) { s.sea.update(t); const tr = at(info, 'transforms', 0.2) + 0.15, bb = at(info, 'baby', 1.2); const k = prog(t, tr, tr + 0.08);
    s.j.visible = k < 1; s.j.update(t, { melt: 1, lid: 0.75, pulse: 0 }); s.p.visible = k >= 1; s.p.update(t, { grow: ease.outBack(prog(t, tr, tr + 0.5)) * 0.75 + 0.25 * ease.inOut(prog(t, bb, bb + 0.3)), lid: 0.12 });
    camMove(s.stage, t, [[0, { pos: [0, 1.2, 4.6], look: [0, 0.6, 0], fov: 36 }], [info.dur, { pos: [0, 1.5, 4.6], look: [0, 1.1, 0], fov: 36 }]]); },
  overlay(g, t, info, s) { look(g, t); const tr = at(info, 'transforms', 0.2) + 0.15, bb = at(info, 'baby', 1.2);
    fxr(g, t, s, [{ fx: 'flash', at: tr, dur: 0.18, color: '#ffffff' }, { fx: 'sparkle', on: [0, 0.8, 0], at: tr, scale: 1.0 }, { fx: 'hearts', on: 'p', at: bb + 0.05 }]); },
});
// s08 "Then it grows up again. And again. And again." — mini jellies bud off the polyp, one per "again"
registerShot('s08', { kind: '3d',
  init(T) { const s = sea(T, { seed: 11, jp: [0, -5, 0] }); s.p = polyp(); s.stage.add(s.p); s.kids = [0, 1, 2].map(i => { const k = jelly({ seed: 20 + i, scale: 0.4 }); k.visible = false; s.stage.add(k); return k; }); return s; },
  draw(s, t, info) { s.sea.update(t); const A = [at(info, 'grows', 0.3), at(info, 'and', 1.4), wordAfter(info, 'again', 2)];
    s.p.update(t, { grow: 1, lid: 0.12, pacifier: false, bud: A.reduce((b, a) => b + (t > a - 0.35 && t < a ? prog(t, a - 0.35, a) : 0), 0) });
    s.kids.forEach((k, i) => { const a = A[i]; k.visible = t >= a; if (!k.visible) return; const u = t - a; const sc = 0.4 + ease.out(clamp(u / 0.8)) * 0.25;
      k.scale.setScalar(ease.outBack(clamp(u / 0.25))); k.position.set(0.3 + (i - 1) * 1.15 * clamp(u / 0.8) + Math.sin(u * 2 + i) * 0.08, 1.4 + u * 0.9, 0.2); k.children[0].scale.setScalar(sc / 0.4 * 0.4); k.update(t, { lid: 0.2, mouth: 'smile' }); });
    camMove(s.stage, t, [[0, { pos: [0, 2.0, 7.4], look: [0, 1.7, 0], fov: 36 }], [info.dur, { pos: [0, 2.9, 8.6], look: [0, 2.6, 0], fov: 36 }]]); },
  overlay(g, t, info, s) { look(g, t); const A = [at(info, 'grows', 0.3), at(info, 'and', 1.4), wordAfter(info, 'again', 2)];
    fxr(g, t, s, A.map((a, i) => ({ fx: 'sparkle', on: s.kids[i], at: a, scale: 0.5, seed: i + 2 })));
    A.forEach((a, i) => { if (t > a) { const c = anchor(s.stage, s.kids[i]); chip(g, `x${i + 1}`, c.cx + 110, c.cy - 40, t - a, { size: 52, color: '#ffd23a', rot: -6 }); } }); },
});
// nth occurrence helper for repeated words ("again", "again")
import { wordTime } from '/engine/core.js';
function wordAfter(info, word, n) { let tt = info.shot.start - 0.1, r = null; for (let i = 0; i < n; i++) { r = wordTime(word, tt); if (r == null) return null; tt = r + 0.05; } return r - info.shot.start; }

// s09 "It's called TRANSDIFFERENTIATION." — the life-cycle wheel spins faster and faster: adult > blob > baby > adult; stamp
registerShot('s09', { kind: '3d',
  init(T) { const s = seaStage(T, { fov: 36, seed: 12 }); s.wheel = new THREE.Group(); s.wheel.position.set(0, 1.8, 0); s.stage.add(s.wheel);
    s.a = jelly({ seed: 3, scale: 0.6 }); s.b = jelly({ seed: 4, scale: 0.6 }); s.c = polyp({ scale: 0.75 });
    [s.a, s.b, s.c].forEach((m, i) => { const pv = new THREE.Group(); pv.add(m); s.wheel.add(pv); m.pv = pv; }); return s; },
  draw(s, t, info) { s.sea.update(t); const spin = t * 1.2 + t * t * 0.55; const R = 1.2;
    [s.a, s.b, s.c].forEach((m, i) => { const a = -Math.PI / 2 + i * (Math.PI * 2 / 3) - spin; m.pv.position.set(Math.cos(a) * R, -Math.sin(a) * R, 0); m.position.y = -0.55; });
    s.a.update(t, { lid: 0.2 }); s.b.update(t, { melt: 1, lid: 0.7, pulse: 0 }); s.c.update(t, { grow: 1, lid: 0.12 });
    camMove(s.stage, t, [[0, { pos: [0, 1.9, 12.0], look: [0, 1.7, 0], fov: 36 }], [info.dur, { pos: [0, 1.85, 11.2], look: [0, 1.7, 0], fov: 36 }]]); },
  overlay(g, t, info, s) { look(g, t); const c = anchor(s.stage, [0, 1.8, 0]); const R = c.s * 1.75; const spin = t * 1.2 + t * t * 0.55;
    for (let i = 0; i < 3; i++) { const a0 = -Math.PI / 2 + i * (Math.PI * 2 / 3) + 0.42 - spin * 0, a1 = a0 + Math.PI * 2 / 3 - 0.84; g.save(); g.translate(c.x, c.y); g.rotate(spin); arcArrow(g, 0, 0, R, a0, a1, { w: 20 }); g.restore(); }
    const tw = at(info, 'transdifferentiation', 0.5); stamp(g, 'TRANSDIFFERENTIATION', E.W / 2, E.H * 0.17, t - tw, { size: 74, rot: -6, color: '#e8402a' });
    fxr(g, t, s, [{ fx: 'speedlines', at: 0.6 }]); },
});

// s11 "It's smaller than your pinky nail," — a giant pinky on the sand, the jelly hovering next to the nail: 4.5 mm
registerShot('s11', { kind: '3d',
  init(T) { const s = sea(T, { seed: 13, js: 5, clear: 4 }); s.f = pinky(); s.f.position.set(-2.55, 0, 0); s.stage.add(s.f); s.j.scale.setScalar(0.4); s.j.position.set(0.05, 1.55, 0.25); return s; },
  draw(s, t, info) { s.sea.update(t); s.j.update(t, { lid: 0.25, look: [-0.6, -0.2], mouth: 'o' });
    camMove(s.stage, t, [[0, { pos: [-0.6, 3.0, 6.4], look: [-0.4, 1.4, 0], fov: 36 }], [info.dur, { pos: [-0.3, 2.8, 5.4], look: [-0.2, 1.5, 0], fov: 36 }]]); },
  overlay(g, t, info, s) { look(g, t); const n = at(info, 'nail', 1.2); const c = anchor(s.stage, s.j);
    chip(g, '≈ 4.5 mm', c.cx, c.y - 120, t - n + 0.1, { size: 74, color: '#ffd23a', rot: -5 }); fxr(g, t, s, [{ fx: 'sparkle', on: 'j', at: n, scale: 0.5 }]); },
});
// s12 "and in theory, it can do this FOREVER." — jellies swimming an infinity loop; "in theory..." then FOREVER
registerShot('s12', { kind: '3d',
  init(T) { const s = seaStage(T, { dark: true, fov: 36, seed: 14, floor: false }); s.js = []; for (let i = 0; i < 12; i++) { const j = jelly({ seed: 30 + i, scale: 0.36, tentacles: 8 }); s.stage.add(j); s.js.push(j); } return s; },
  draw(s, t, info) { s.sea.update(t); s.js.forEach((j, i) => { const u = (i / s.js.length) * Math.PI * 2 + t * 0.9; const d = 1 + Math.sin(u) ** 2; j.position.set(2.4 * Math.cos(u) / d, 1.2 + 2.4 * Math.sin(u) * Math.cos(u) / d, 0); j.update(t, { lid: 0.2, glow: 0.35, ph: i * 3 }); });
    camMove(s.stage, t, [[0, { pos: [0, 1.6, 9.0], look: [0, 1.6, 0], fov: 36 }], [info.dur, { pos: [0, 1.6, 8.2], look: [0, 1.6, 0], fov: 36 }]]); },
  overlay(g, t, info, s) { const th = at(info, 'theory', 0.5), fv = at(info, 'forever', 1.6);
    if (t > th) TXT(g, 'in theory...', E.W / 2, E.H * 0.2, 80, { color: '#ffffff', stroke: '#2a1c15', a: clamp((t - th) / 0.2) });
    if (t > fv) { const k = ease.outBack(clamp((t - fv) / 0.3)); g.save(); g.translate(E.W / 2, E.H * 0.29); g.scale(k, k); TXT(g, 'FOREVER ∞', 0, 0, 140, { color: '#ffd23a', stroke: '#2a1c15' }); g.restore(); }
    fxr(g, t, s, [{ fx: 'sparkle', on: [0, 1.6, 0], at: fv, scale: 1.4 }, { fx: 'glow', on: [0, 1.6, 0], at: fv }]); },
});

// s13 "The catch?" — content jelly with its halo... then "???", slow push-in
registerShot('s13', { kind: '3d',
  init(T) { const s = sea(T, { seed: 15 }); s.j.halo.visible = true; return s; },
  draw(s, t, info) { s.sea.update(t); s.j.update(t, { lid: lerp(0.45, 0.1, ease.out(prog(t, 0.35, 0.5))), mouth: t > 0.4 ? 'o' : 'smile', halo: 1, look: [0, 0] });
    camMove(s.stage, t, [[0, { pos: [0, 2.0, 6.0], look: [0, 1.9, 0], fov: 36 }], [info.dur, { pos: [0, 2.0, 4.6], look: [0, 1.95, 0], fov: 36 }]]); },
  overlay(g, t, info, s) { look(g, t); fxr(g, t, s, [{ fx: 'question', on: 'j', at: 0.3 }]); },
});
// queue scene: a fish and a turtle in bibs line up at a LUNCH sign; the jelly sweats (nobody gets eaten)
const queue = {
  init(T) { const s = sea(T, { seed: 16, js: 6, jp: [0.8, 3.0, 0.9], clear: 5 }); s.sign = lunchSign(); s.sign.position.set(-0.3, 0, -1.6); s.sign.rotation.y = 0.1; s.stage.add(s.sign);
    s.f = fish({ color: '#ffa23a', bib: true, seed: 2 }); s.f.position.set(-0.1, 1.3, 0.9); s.f.rotation.y = 1.0; s.stage.add(s.f);
    s.f2 = fish({ color: '#5ab0ff', bib: true, seed: 5 }); s.f2.position.set(-1.7, 2.2, -0.2); s.f2.rotation.y = 1.0; s.f2.scale.setScalar(1.1); s.stage.add(s.f2);
    s.tu = turtle({ bib: true }); s.tu.position.set(-1.3, 0.5, 1.8); s.tu.rotation.y = 0.9; s.tu.scale.setScalar(0.9); s.stage.add(s.tu); return s; },
  draw(s, t, info) { s.sea.update(t); s.f.update(t, { lid: 0.15, look: [0.5, 0] }); s.f2.update(t, { lid: 0.3, look: [0.4, 0] }); s.tu.update(t, { lid: 0.3, look: [0.5, 0] });
    s.f.position.y = 1.3 + Math.sin(t * 2) * 0.06; s.f2.position.y = 2.2 + Math.sin(t * 2 + 1) * 0.06; s.tu.position.y = 0.5 + Math.sin(t * 1.6) * 0.05;
    s.j.update(t, { lid: 0.05, mouth: 'o', look: [-0.6, 0], pulse: 1.4 }); s.j.position.x = 0.8 + Math.sin(t * 13) * 0.02;
    camMove(s.stage, t, [[0, { pos: [-0.2, 2.8, 10.2], look: [-0.2, 2.1, 0], fov: 38 }], [info.dur, { pos: [-0.1, 2.7, 9.6], look: [-0.1, 2.1, 0], fov: 38 }]]); },
};
// s14 "Fish and turtles eat it."
registerShot('s14', { kind: '3d', init: queue.init, draw: queue.draw,
  overlay(g, t, info, s) { look(g, t); const e = at(info, 'eat', 1.0); fxr(g, t, s, [{ fx: 'hearts', on: 'f', at: at(info, 'fish', 0.1), until: e }, { fx: 'sweat', on: 'j', at: e }, { fx: 'exclaim', on: 'j', at: e + 0.05 }, { fx: 'shake', at: e, amp: 0.04, dur: 0.25 }]); },
});
// s15 "Immortal, but also..." — the jelly poses with its halo, spotlight, sparkles... (the queue waits behind, out of focus)
registerShot('s15', { kind: '3d', init: queue.init,
  draw(s, t, info) { queue.draw(s, t + 1.3, info); s.j.update(t, { lid: 0.45, look: [0, 0], mouth: 'smile', halo: ease.outBack(prog(t, 0.05, 0.35)), glow: 0.3 }); s.j.position.x = 0.8;
    camMove(s.stage, t, [[0, { pos: [0.7, 4.0, 7.2], look: [0.8, 3.7, 0.9], fov: 34 }], [info.dur, { pos: [0.75, 3.95, 6.6], look: [0.8, 3.7, 0.9], fov: 34 }]]); },
  overlay(g, t, info, s) { look(g, t); const b = at(info, 'but', 0.8); fxr(g, t, s, [{ fx: 'spotlight', on: 'j', at: 0.0, until: b + 0.4 }, { fx: 'sparkle', on: 'j', at: 0.05, scale: 0.7 }]);
    chip(g, 'IMMORTAL', E.W / 2, E.H * 0.18, t - 0.1, { size: 92, color: '#ffd23a', rot: -4 }); },
});
// s16 "LUNCH." — INSERT over the (blurred) queue, on the punchline
insertShot('s16', { scene: { init: queue.init, draw: (s, t, info) => queue.draw(s, t + 3.4, info) }, dim: 0.45,
  insert: { type: 'bigtext', kicker: 'BUT ALSO...', title: 'LUNCH.', lines: ['for fish and turtles'], color: '#ff6a4a' } });

// s16 "It cheats old age..." — halo back on, sly look; OLD AGE crossed out
registerShot('s17', { kind: '3d',
  init(T) { const s = sea(T, { seed: 17, js: 7 }); return s; },
  draw(s, t, info) { s.sea.update(t); s.j.update(t, { lid: 0.45, lidR: 0.6, look: [0.5, 0.1], mouth: 'smile', halo: ease.outBack(prog(t, 0.1, 0.4)) });
    camMove(s.stage, t, [[0, { pos: [-0.6, 1.9, 7.4], look: [0, 1.75, 0], fov: 36 }], [info.dur, { pos: [-0.3, 1.9, 6.8], look: [0, 1.75, 0], fov: 36 }]]); },
  overlay(g, t, info, s) { look(g, t); const c = at(info, 'cheats', 0.1); stamp(g, 'OLD AGE ✗', E.W / 2, E.H * 0.2, t - at(info, 'age', 0.7), { size: 96, rot: -7 });
    fxr(g, t, s, [{ fx: 'sparkle', on: 'j', at: c, scale: 0.6 }]); },
});
// s17 "and it doesn't even have a brain." — the brain scanner: NO BRAIN FOUND; it shrugs
registerShot('s18', { kind: '3d',
  init(T) { const s = sea(T, { seed: 18, js: 8, jp: [0, 0.6, 0], clear: 5 }); s.sc = scanner(); s.sc.scale.setScalar(0.85); s.sc.position.y = 0.05; s.stage.add(s.sc); return s; },
  draw(s, t, info) { s.sea.update(t); const br = at(info, 'brain', 1.4); const sh = ease.inOut(prog(t, br + 0.1, br + 0.4)) * (1 - ease.inOut(prog(t, br + 1.1, br + 1.4)));
    s.sc.scan.position.y = 1.6 + Math.sin(t * 5) * 1.0; s.sc.scan.visible = t < br; s.sc.screen.visible = t > br - 0.1;
    s.j.update(t, { lid: lerp(0.3, 0.5, sh), shrug: sh, look: [sh * 0.5, 0], mouth: sh > 0.5 ? 'smile' : 'o', pulse: 1 - sh });
    camMove(s.stage, t, [[0, { pos: [1.0, 2.4, 10.6], look: [1.0, 1.7, 0], fov: 38 }], [info.dur, { pos: [1.0, 2.3, 9.8], look: [1.0, 1.7, 0], fov: 38 }]]); },
  overlay(g, t, info, s) { look(g, t); const br = at(info, 'brain', 1.4); fxr(g, t, s, [{ fx: 'question', on: 'j', at: br + 0.1, until: br + 1.2 }, { fx: 'flash', at: br - 0.1, dur: 0.12 }]); },
});
// s18 "Subscribe for more." — back in the dark water, pulls out to the frame-1 framing (hard cut -> loops to s01)
registerShot('s19', { kind: '3d',
  init(T) { return dark(T); },
  draw(s, t, info) { heroUpd(s, t - info.dur, {}); camMove(s.stage, t, [[0, { pos: [0, 1.5, 4.6], look: [0, 1.4, 0], fov: 34 }], [info.dur, { ...F1, pos: [0.2, 1.38, 6.6] }]], ease.inOut); },
  overlay(g, t, info, s) { fxr(g, t, s, [{ fx: 'hearts', on: 'j', at: 0.1 }]); },
});
