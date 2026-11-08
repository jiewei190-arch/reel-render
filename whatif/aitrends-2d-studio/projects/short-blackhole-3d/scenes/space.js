// s001-s008, s010-s015: the HERO (mustard hoodie) falling into black holes. s009 (Dr Lin's chalkboard) is in lab.js.
import { registerShot, E } from '/engine/core.js';
import { camMove, drift } from '/kits/toon3d/toon.js';
import { POSE, EXPR, idle, addPose, mixPose, mixExpr, shrug, tremble } from '/kits/toon3d/rig.js';
import * as FX from '/kits/toon3d/fx.js';
import { THREE, at, screen, Vc, FP, flailAnim, floater, spaceStage, blackHole, sun, dashLine, tag, arrow, label, tint, vignette, ease, prog, clamp, lerp } from './_lib.js';

const D2R = Math.PI / 180;
// common: a stage + hero pivot + one black hole
function scene(T, o = {}) {
  const st = spaceStage(T, o.stage || {});
  const bh = blackHole(o.hole || {}); bh.position.set(...(o.holeAt || [0, -10, -20])); st.add(bh);
  const hero = floater(o.hero || {}); st.add(hero);
  return { stage: st, bh, hero };
}
const upd = (s, t, vel = [0, 2.5, 0], c = [0, 0, 0]) => { s.bh.update(t); s.stage.dust?.update(t, vel, c); };

// s001 "What if you fell into a black hole?" — HOOK. Frame 1: the hero already tumbling, flailing, the glowing hole huge behind him.
registerShot('s001', { kind: '3d',
  init(T) { return scene(T, { holeAt: [0.6, -9.5, -22], hole: { r: 2.6, disk: 3.4, tilt: 0.32, spin: 0.9 } }); },
  draw(s, t, info) { upd(s, t, [0, 4, 1.5]);
    const h = s.hero; h.position.set(0.1, 0.9 - t * 0.35, -t * 0.6); h.rotation.set(0.25 + Math.sin(t * 1.7) * 0.25, Math.sin(t * 1.1) * 0.4, 0.5 * Math.sin(t * 1.4) - 0.15 + t * 0.25);
    h.hero.pose(addPose(FP.flail, flailAnim(t)));
    const bh = at(info, 'black', 0.92); h.hero.face(mixExpr(EXPR.panic, { ...EXPR.shocked, pupil: [0, -0.6] }, ease.inOut(prog(t, bh, bh + 0.2))), t);
    camMove(s.stage, t, [[0, { pos: [0, 1.6, 6.6], look: [0, -0.9, -2], fov: 46 }], [info.dur, { pos: [0, 1.2, 5.6], look: [0, -1.1, -2.4], fov: 44 }]], ease.sine); },
  overlay(g) { vignette(g, 0.45); },
});
// s002 "At first, nothing." — medium: calm drift, deadpan, shrug on "nothing"
registerShot('s002', { kind: '3d',
  init(T) { return scene(T, { holeAt: [3.5, -9, -16], hole: { r: 2.0, tilt: 0.35 } }); },
  draw(s, t, info) { upd(s, t, [0, 1.2, 0]); const n = at(info, 'nothing', 0.36), k = ease.inOut(prog(t, n - 0.1, n + 0.25));
    const h = s.hero; h.position.set(0, Math.sin(t * 1.3) * 0.05, 0); h.rotation.set(0.05, -0.15, 0.12 + Math.sin(t * 0.9) * 0.04);
    h.hero.pose(shrug(addPose(FP.float, idle(t, 4)), k)); h.hero.face(mixExpr({ ...EXPR.neutral, pupil: [0.3, 0.1] }, { ...EXPR.deadpan, lid: 0.45, pupil: [0, 0] }, k), t);
    const d = drift(t, 0.04, 2); camMove(s.stage, t, [[0, { pos: [0.3 + d[0], 1.1 + d[1], 6.0], look: [0, 0.35, 0], fov: 36 }], [info.dur, { pos: [0.2, 1.0, 5.3], look: [0, 0.4, 0], fov: 35 }]]); },
});
// s003 "You just fall." — wide from above: tiny hero lying back on nothing, sliding down toward the huge disk
registerShot('s003', { kind: '3d',
  init(T) { return scene(T, { holeAt: [0, -26, -6], hole: { r: 4.2, disk: 3.4, tilt: 0.0, spin: 0.5, glowSize: 7 }, stage: { key: ['#ffc07a', 2.3, [2, -8, 3]], fill: ['#9ab4ff', 0.9, [-4, 8, 4]] } }); },
  draw(s, t, info) { upd(s, t, [0, 3, 0]);
    const h = s.hero; h.position.set(0, -t * 1.2, 0); h.rotation.set(-Math.PI / 2 + 0.25, 0, 0.4 + t * 0.12);
    h.hero.pose(addPose(FP.chill, idle(t, 7))); h.hero.face({ ...EXPR.happy, lid: 0.45, pupil: [0, 0.2] }, t);
    camMove(s.stage, t, [[0, { pos: [2.2, 6.5, 3.2], look: [0, -1.5, -0.8], fov: 50 }], [info.dur, { pos: [2.0, 5.2, 2.6], look: [0, -2.8, -0.8], fov: 50 }]], ease.sine); },
});
// feet-first framing used by s004 + s005: hero vertical, the hole straight below him
function feetScene(T) { const s = scene(T, { holeAt: [0, -9.5, -9], hole: { r: 1.5, disk: 3.3, tilt: 0.45, spin: 0.9 }, stage: { key: ['#ffc07a', 2.5, [3, -7, 5]] } });
  s.shoe = [FX.glow(0.9, '#ffd25a', 0), FX.glow(0.9, '#ffd25a', 0)]; s.shoe.forEach(x => s.stage.add(x)); return s; }
const _v = new THREE.Vector3();
function shoeGlow(s, k) { s.hero.updateMatrixWorld(true); const legs = s.hero.hero.parts.legs; s.shoe.forEach((gl, i) => { legs[i ? 'R' : 'L'].foot.getWorldPosition(_v); gl.position.set(_v.x, _v.y, _v.z + 0.15); gl.material.opacity = 0.85 * k; gl.scale.setScalar(0.7 + 0.3 * k); }); }
// s004 "But gravity pulls" — hero feet-first, eyes SNAP down to his feet on "pulls", a gold glow grabs his shoes
registerShot('s004', { kind: '3d',
  init(T) { return feetScene(T); },
  draw(s, t, info) { upd(s, t, [0, 3.5, 0]); const p = at(info, 'pulls', 0.71), k = t >= p ? 1 : 0, g = ease.out(prog(t, p, p + 0.3));
    const h = s.hero; h.position.set(0, -t * 0.2, 0); h.rotation.set(0.12, -0.2, 0.05 * Math.sin(t * 2)); h.stretch(1 + 0.08 * g);
    h.hero.pose(mixPose(addPose(FP.float, idle(t, 2)), addPose(FP.straight, { headNod: 0.45, armL: [0.1, 0.5, 0], armR: [0.1, 0.5, 0] }), g));
    h.hero.face(k ? { ...EXPR.shocked, pupil: [0, -1], lid: 0.05 } : { ...EXPR.neutral, pupil: [0.2, 0.2] }, t, { blink: !k });
    shoeGlow(s, g);
    const d = drift(t, 0.03, 5); camMove(s.stage, t, [[0, { pos: [0.4 + d[0], 1.0 + d[1], 8.0], look: [0, -0.9, 0], fov: 40 }], [info.dur, { pos: [0.4, 0.9, 7.4], look: [0, -1.0, 0], fov: 40 }]]); },
});
// s005 "your feet harder than your head." — same set, wider: a LONG gold arrow at the feet on "feet", a short one at the head on "head"
registerShot('s005', { kind: '3d',
  init(T) { return feetScene(T); },
  draw(s, t, info) { upd(s, t, [0, 3.5, 0]); const h = s.hero; h.position.set(0, 0.2 - t * 0.15, 0); h.rotation.set(0.12, -0.25, 0); h.stretch(1.12 + 0.05 * Math.sin(t * 6) * prog(t, 0.2, 0.6));
    h.hero.pose(addPose(FP.straight, { ...tremble(t, 0.6), headNod: 0.15, armL: [0.1, 0.55, 0], armR: [0.1, 0.55, 0], elbowL: 0.4, elbowR: 0.4 }));
    const hd = at(info, 'head', 1.13); h.hero.face(mixExpr({ ...EXPR.worried, pupil: [0, -0.8] }, { ...EXPR.worried, pupil: [0, 0.7], brow: 0.8 }, ease.inOut(prog(t, hd - 0.05, hd + 0.2))), t);
    shoeGlow(s, 1);
    camMove(s.stage, t, [[0, { pos: [0.5, 1.2, 9.4], look: [0, -1.1, 0], fov: 42 }], [info.dur, { pos: [0.5, 1.1, 9.0], look: [0, -1.1, 0], fov: 42 }]]); },
  overlay(g, t, info, s) { const f = at(info, 'feet', 0.13), hd = at(info, 'head', 1.13); const st = s.stage, h = s.hero;
    const [fx, fy] = screen(st, Vc(h.position.x + 0.65, h.position.y - 1.25, 0.3)), [hx, hy] = screen(st, Vc(h.position.x + 0.85, h.position.y + 1.1, 0.3));
    arrow(g, fx + 40, fy - 60, fx + 40, fy + 230, prog(t, f, f + 0.35), 34); label(g, 'BIG PULL', fx + 150, fy + 150, prog(t, f + 0.1, f + 0.4), 52, '#ffd25a');
    arrow(g, hx + 40, hy - 60, hx + 40, hy + 40, prog(t, hd, hd + 0.3), 22); label(g, 'small pull', hx + 40, hy - 105, prog(t, hd + 0.05, hd + 0.35), 40); },
});
// s006 "And it gets worse." — GIANT FACE: worried, then SHOCKED on "worse"; red-orange light floods in, the camera jolts
registerShot('s006', { kind: '3d',
  init(T) { return scene(T, { holeAt: [0, -9, -14], hole: { r: 2.4 }, stage: { key: ['#ffc07a', 2.2, [2, -2, 8]], fov: 26 } }); },
  draw(s, t, info) { upd(s, t, [0, 2, 0]); const w = at(info, 'worse', 0.57), k = t >= w ? 1 : 0, fl = ease.out(prog(t, w, w + 0.35));
    s.stage.key.color.set(k ? '#ffa070' : '#ffd2a0'); s.stage.key.intensity = 2.0 + fl * 0.6; s.stage.hemi.intensity = 1.0 + fl * 0.3;
    const h = s.hero; h.position.set(0, 0, 0); h.rotation.set(0, 0, 0); h.hero.pose(addPose(FP.float, { ...idle(t, 3), ...(k ? tremble(t, 1.4) : {}), headNod: -0.05 }));
    h.hero.face(k ? { ...EXPR.shocked, pupilSize: 0.55, mouth: 'scream', mouthW: 0.8 } : { ...EXPR.worried, pupil: [0, -0.3] }, t, { blink: !k });
    const sh = k ? Math.max(0, 1 - (t - w) * 4) * 0.05 : 0; const z = lerp(4.3, 3.3, ease.inOut(prog(t, 0, info.dur)));
    s.stage.cam([Math.sin(t * 70) * sh, 0.85 + Math.cos(t * 63) * sh, z], [0, 0.82, 0], 26); },
  overlay(g, t, info) { const w = at(info, 'worse', 0.57); tint(g, '#ff3a1a', 0.12 * ease.out(prog(t, w, w + 0.3))); vignette(g, 0.55, '60,0,0'); },
});
// s007 "Near a small black hole," — a small, fierce, fast-spinning hole; chip SMALL: ~10 SUNS; the hero eyes it, wary
registerShot('s007', { kind: '3d',
  init(T) { return scene(T, { holeAt: [-1.0, -3.6, -1.5], hole: { r: 0.75, disk: 3.4, tilt: 0.42, hot: true, spin: 2.6, glowSize: 7, glowColor: '#ff5a7a' }, stage: { key: ['#ffb0a0', 2.3, [-3, -4, 6]] } }); },
  draw(s, t, info) { upd(s, t, [0.8, 1.5, 0]); const h = s.hero; h.position.set(0.6, 0.6 - t * 0.25, 0); h.rotation.set(0.1, -0.35, 0.35);
    h.hero.pose(addPose(FP.float, { ...idle(t, 6), lean: -0.15, headNod: 0.2, armL: [0.6, 0.6, 0], elbowL: 1.4 }));
    const sm = at(info, 'small', 0.45); h.hero.face(mixExpr({ ...EXPR.neutral, pupil: [-0.5, -0.5] }, { ...EXPR.suspicious, pupil: [-0.7, -0.7] }, ease.inOut(prog(t, sm, sm + 0.25))), t);
    camMove(s.stage, t, [[0, { pos: [0.4, 0.6, 9.0], look: [0, -0.4, 0], fov: 40 }], [info.dur, { pos: [0.3, 0.5, 8.2], look: [0, -0.5, 0], fov: 40 }]], ease.sine); },
  overlay(g, t, info) { const sm = at(info, 'small', 0.45); tag(g, 'SMALL: ~10 SUNS', ease.out(prog(t, sm, sm + 0.2))); },
});
// s008 "that pull stretches you thin like spaghetti." — cartoon rubber-band STRETCH on "stretches" (boing), a noodle wiggle on
// "spaghetti", and the noodle hero turns a deadpan stare to the lens. Comic, no injury.
registerShot('s008', { kind: '3d',
  init(T) { return scene(T, { holeAt: [0, -5.6, -1.5], hole: { r: 0.85, disk: 3.4, tilt: 0.5, hot: true, spin: 2.8, glowSize: 7, glowColor: '#ff5a7a' }, stage: { key: ['#ffb0a0', 2.3, [2, -5, 6]] } }); },
  draw(s, t, info) { upd(s, t, [0, 3, 0]); const st0 = at(info, 'stretches', 0.53), sp = at(info, 'spaghetti', 1.69);
    const k = prog(t, st0 - 0.05, st0 + 0.55); const boing = k <= 0 ? 0 : 1 - Math.exp(-k * 4) * Math.cos(k * 11);   // overshoot spring
    const S = 1 + 1.75 * boing; const wig = t > sp ? Math.sin((t - sp) * 16) * 0.14 * Math.max(0, 1 - (t - sp) * 0.6) : 0;
    const h = s.hero; h.position.set(0, 0.6, 0); h.rotation.set(0.05, -0.15, wig * 0.6); h.stretch(S, wig);
    h.hero.pose(addPose(mixPose(FP.float, FP.straight, clamp(boing)), { side: wig * 1.5, twist: wig, headTilt: -wig * 2 }));
    const dead = ease.inOut(prog(t, sp + 0.1, sp + 0.45));
    h.hero.face(k <= 0 ? { ...EXPR.worried, pupil: [0, -0.7] } : mixExpr({ ...EXPR.panic, pupilSize: 0.55 }, { ...EXPR.deadpan, lid: 0.55, pupil: [0, 0], mouth: 'line' }, dead), t, { blink: dead > 0.9 });
    const back = ease.inOut(prog(t, st0, st0 + 0.6)); camMove(s.stage, t, [[0, { pos: [0.2, 1.0, 6.6 + back * 6.4], look: [0, 0.75 + back * 0.2, 0], fov: 40 }]]); },
});
// s010 "But fall into a giant one," — REVEAL (flash): an enormous hole fills the frame; the hero, normal size again, tiny in front. Awe on "giant".
registerShot('s010', { kind: '3d',
  init(T) { return scene(T, { holeAt: [0, -3, -48], hole: { r: 9, disk: 3.3, tilt: 0.22, spin: 0.25, glowSize: 8 }, stage: { key: ['#ffc07a', 2.3, [0, 1, -8]], fill: ['#9ab4ff', 1.0, [-4, 5, 8]] } }); },
  draw(s, t, info) { upd(s, t, [0, 0.6, 0]); const gi = at(info, 'giant', 1.09), k = ease.out(prog(t, gi - 0.05, gi + 0.25));
    const h = s.hero; h.position.set(0, 0.3, 0); h.rotation.set(0, Math.PI * 0.85 - k * 0.65, 0);
    h.hero.pose(addPose(mixPose(FP.float, { ...FP.float, armL: [0.3, 1.7, 0], armR: [0.3, 1.7, 0], headNod: -0.25 }, k), idle(t, 9)));
    h.hero.face(mixExpr({ ...EXPR.neutral }, { ...EXPR.shocked, pupilSize: 0.8, mouth: 'o', pupil: [0, 0.4] }, k), t);
    camMove(s.stage, t, [[0, { pos: [0.6, 1.3, 4.0], look: [0, 0.6, -6], fov: 42 }], [info.dur, { pos: [1.4, 2.0, 9.5], look: [0, 0.2, -10], fov: 46 }]], ease.inOut); },
});
// s011 "millions of suns heavy," — tiny cartoon suns spiral into the giant hole; gold counter 4,300,000 SUNS on "millions"
registerShot('s011', { kind: '3d',
  init(T) { const s = scene(T, { holeAt: [0, -2.5, -30], hole: { r: 5.2, disk: 3.3, tilt: 0.28, spin: 0.35 } }); s.hero.visible = false;
    s.suns = Array.from({ length: 14 }, (_, i) => { const u = sun(0.55); s.stage.add(u); u.userData.ph = i / 14; return u; }); return s; },
  draw(s, t, info) { upd(s, t, [0, 0.3, 0]);
    s.suns.forEach((u, i) => { const ph = (u.userData.ph + t * 0.28) % 1; const a = i * 2.4 + ph * 5.5, R = lerp(26, 5.5, ph); const c = s.bh.position;
      u.position.set(c.x + Math.cos(a) * R, c.y + Math.sin(a) * R * 0.32 + (1 - ph) * 3, c.z + Math.sin(a) * R * 0.5); u.scale.setScalar(ph > 0.85 ? (1 - ph) / 0.15 : 1); });
    camMove(s.stage, t, [[0, { pos: [0, 1.0, 14], look: [0, -1.5, -30], fov: 44 }], [info.dur, { pos: [0, 0.8, 11], look: [0, -1.6, -30], fov: 44 }]]); },
  overlay(g, t, info) { const m = at(info, 'millions', 0.15), k = ease.out(prog(t, m, m + 1.1)); if (t < m - 0.02) return;
    const n = Math.round(4300000 * k / 1000) * 1000; tag(g, `${n.toLocaleString('en-US')} SUNS`, prog(t, m - 0.02, m + 0.15), 0.16, { size: 78 });
    label(g, "LIKE OUR GALAXY'S CENTRE", E.W / 2, E.H * 0.235, prog(t, m + 0.5, m + 0.8), 40); },
});
// s012 "and you'd cross the point of no return" — the dashed gold EVENT HORIZON line; the hero floats calmly through it on "cross" and waves
registerShot('s012', { kind: '3d',
  init(T) { const s = scene(T, { holeAt: [0, -30, -26], hole: { r: 22, disk: 2.6, tilt: 0.15, spin: 0.2, glowSize: 5 }, stage: { key: ['#ffc07a', 2.4, [3, -6, 6]] } });
    s.line = dashLine(24, 0, 0, 30); s.stage.add(s.line); s.flash = FX.glow(4, '#ffe08a', 0); s.stage.add(s.flash); return s; },
  draw(s, t, info) { upd(s, t, [0, 2.2, 0]); const c = at(info, 'cross', 0.53), tc = c + 0.25;
    const h = s.hero; const y = 1.9 * (1 - t / tc) * (t < tc ? 1 : 1) - (t > tc ? (t - tc) * 1.1 : 0); h.position.set(0.1, t < tc ? lerp(2.0, 0, t / tc) : -(t - tc) * 1.0, 0); h.rotation.set(0.05, -0.2, 0.08);
    const wv = Math.sin(t * 9) * 0.35; h.hero.pose(addPose(FP.wave, { armR: [0, wv, 0], elbowR: wv * 0.5, ...idle(t, 5) })); h.hero.face({ ...EXPR.happy, pupil: [0, 0] }, t);
    const f = Math.max(0, 1 - Math.abs(t - tc) * 3); s.flash.material.opacity = 0.5 * f; s.flash.scale.setScalar(1.2 + 2.2 * f); s.flash.position.set(0.1, 0, 0.2);
    camMove(s.stage, t, [[0, { pos: [0.6, 0.9, 7.6], look: [0, 0.3, 0], fov: 42 }], [info.dur, { pos: [0.5, 0.3, 7.6], look: [0, -0.4, 0], fov: 42 }]], ease.sine); },
  overlay(g, t, info, s) { tag(g, 'EVENT HORIZON', ease.out(prog(t, 0.05, 0.3)), 0.12); label(g, '= point of no return', E.W / 2, E.H * 0.185, prog(t, 0.35, 0.6), 40); },
});
// s013 "without even noticing." — inside now: the hero lies back, arms behind his head, cheeky grin + wink on "noticing";
// chip FELT NOTHING... (YET). Then his eyes slide sideways (the comedy beat).
registerShot('s013', { kind: '3d',
  init(T) { return scene(T, { holeAt: [0, -30, -26], hole: { r: 22, disk: 2.6, tilt: 0.15, spin: 0.2, glowSize: 5 }, stage: { bg: ['#0a0208', '#2a0818', '#5a1428', '#7a2a2a'], key: ['#ff9a6a', 2.4, [3, -4, 7]], starCount: 300 } }); },
  draw(s, t, info) { upd(s, t, [0, 1.6, 0]); const n = at(info, 'noticing', 1.0), k = ease.inOut(prog(t, n - 0.05, n + 0.2)), side = ease.inOut(prog(t, 1.55, 1.75));
    const h = s.hero; h.position.set(0, Math.sin(t * 1.2) * 0.05, 0); h.rotation.set(-0.3, -0.15, -0.85 + Math.sin(t * 0.8) * 0.03);
    h.hero.pose(addPose(FP.chill, idle(t, 8))); const wink = Math.sin(Math.PI * prog(t, n + 0.05, n + 0.45));
    h.hero.face(mixExpr(mixExpr({ ...EXPR.happy, lid: 0.4 }, { ...EXPR.grin, lidR: wink * 0.9 }, k), { ...EXPR.worried, mouth: 'line', pupil: [0.9, 0.1], lid: 0.25 }, side), t, { blink: false });
    camMove(s.stage, t, [[0, { pos: [0.3, 0.7, 8.4], look: [0.1, 0.1, 0], fov: 36 }], [info.dur, { pos: [0.2, 0.65, 7.6], look: [0.1, 0.1, 0], fov: 36 }]]); },
  overlay(g, t, info) { const n = at(info, 'noticing', 1.0); tag(g, 'FELT NOTHING...', ease.out(prog(t, n + 0.2, n + 0.4))); label(g, '(YET)', E.W / 2, E.H * 0.215, prog(t, 1.5, 1.65), 48, '#ff8a6a'); vignette(g, 0.5, '40,0,10'); },
});
// s014 "Which one would you pick?" — SMALL (left) vs GIANT (right), the hero between them looks left, right, then shrugs at us on "pick"
registerShot('s014', { kind: '3d',
  init(T) { const s = scene(T, { holeAt: [-2.5, -1.4, -4.5], hole: { r: 0.55, disk: 3.4, tilt: 0.45, hot: true, spin: 2.6, glowSize: 6, glowColor: '#ff5a7a' } });
    const big = blackHole({ r: 7, disk: 3.2, tilt: 0.25, spin: 0.3 }); big.position.set(14, -3, -34); s.stage.add(big); s.big = big; return s; },
  draw(s, t, info) { upd(s, t, [0, 1.2, 0]); s.big.update(t); const o = at(info, 'one', 0.16), wd = at(info, 'would', 0.44), p = at(info, 'pick', 0.66);
    const look = t < wd ? -1 : t < p ? 1 : 0; const lk = ease.inOut(prog(t, p - 0.05, p + 0.15));
    const h = s.hero; h.position.set(0, 0.5, 0); h.rotation.set(0, 0, 0.04);
    h.hero.pose(shrug(addPose(FP.float, { ...idle(t, 1), headTurn: look * -0.45 * (1 - lk) }), lk));
    h.hero.face(lk > 0.5 ? { ...EXPR.deadpan, browL: 0.4, mouth: 'smirk', pupil: [0, 0] } : { ...EXPR.neutral, brow: 0.3, pupil: [look * -0.9, -0.1] }, t);
    camMove(s.stage, t, [[0, { pos: [0, 1.1, 7.4], look: [0, 0.2, 0], fov: 46 }], [info.dur, { pos: [0, 1.0, 6.4], look: [0, 0.3, 0], fov: 44 }]]); },
  overlay(g, t) { label(g, 'SMALL', E.W * 0.22, E.H * 0.585, prog(t, 0.0, 0.2), 48, '#ff9ab0'); label(g, 'GIANT', E.W * 0.78, E.H * 0.585, prog(t, 0.1, 0.3), 48, '#ffd25a'); },
});
// s015 "Subscribe for more." — closer: the hero grins and waves, a gold SUBSCRIBE FOR MORE pill pops; then the hole yanks him away (loops to frame 1)
registerShot('s015', { kind: '3d',
  init(T) { return scene(T, { holeAt: [0.6, -9.5, -22], hole: { r: 2.6, disk: 3.4, tilt: 0.32, spin: 0.9 } }); },
  draw(s, t, info) { upd(s, t, [0, 1.5, 0]); const y0 = 1.3, yank = ease.in(prog(t, y0, info.dur));
    const h = s.hero; h.position.set(0, 0.5 - yank * 4.5, -yank * 6); h.rotation.set(yank * 0.8, 0, yank * 1.6);
    const wv = Math.sin(t * 10) * 0.35; h.hero.pose(yank > 0 ? addPose(FP.flail, flailAnim(t, yank)) : addPose(FP.wave, { armR: [0, wv, 0], elbowR: wv * 0.4, ...idle(t, 3) }));
    h.hero.face(t < y0 ? { ...EXPR.grin, pupil: [0, 0] } : { ...EXPR.shocked, pupil: [0, -0.5] }, t);
    camMove(s.stage, t, [[0, { pos: [0, 1.4, 5.6], look: [0, 0.2, -2], fov: 42 }], [info.dur, { pos: [0, 1.3, 5.4], look: [0, -0.4, -2], fov: 44 }]]); },
  overlay(g, t, info) { const k = ease.out(prog(t, 0.04, 0.25)); tag(g, 'SUBSCRIBE FOR MORE', k, 0.15, { size: 64, bg: 'rgba(217,162,27,.95)', color: '#20161a' }); vignette(g, 0.4); },
});
