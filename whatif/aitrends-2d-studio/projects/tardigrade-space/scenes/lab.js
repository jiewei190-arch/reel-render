// Lab shots: taping (s02), tweezers + sweat (s09), microscope view (s10), egg + faint (s11)
import { registerShot, ease, prog, clamp, lerp, E } from '/engine/core.js';
import { toonStage, camMove, rbox, box, ball, toon, THREE, outline } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, shrug, tremble } from '/kits/toon3d/rig.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { at, tardigrade, lab, scientist, scientist2, satellite, tape, tweezers, scopeMask , fxr } from './_lib.js';

const labStage = (T, o = {}) => { const st = toonStage(T, { light: 'warm', fov: o.fov || 36, shadowSize: 6, target: o.target || [0, 1, -1.2] }); const L = lab(st, o); return { stage: st, lab: L }; };

// s02 "scientists strapped tiny animals to the OUTSIDE of a satellite." — taping gummy tardigrades onto the tray; Dr Ade shrugs at the lens
registerShot('s02', { kind: '3d',
  init(T) { const s = labStage(T, { micX: 2.6 });
    s.sat = satellite(); s.sat.scale.setScalar(0.42); s.sat.position.set(0, 1.85, -1.25); s.sat.rotation.y = 0; s.stage.add(s.sat);
    s.lin = scientist(); s.lin.position.set(-1.0, 0, -0.05); s.lin.rotation.y = -0.55; s.stage.add(s.lin);
    s.ade = scientist2(); s.ade.position.set(1.05, 0, 0.05); s.ade.rotation.y = 0.25; s.stage.add(s.ade);
    // the riders: 6 tiny tardigrades in a grid on the tray, each gets a strip of tape
    s.tgs = []; s.tapes = []; for (let i = 0; i < 6; i++) { const x = -0.15 + (i % 3) * 0.15, y = 1.85 + 0.08 - Math.floor(i / 3) * 0.17; const tg = tardigrade({ seed: 20 + i, scale: 0.085 }); tg.blob.visible = false; tg.position.set(x, y - 0.06, -0.7); s.stage.add(tg); s.tgs.push(tg);
      const tp = tape(0.15); tp.rotation.x = Math.PI / 2; tp.position.set(x, y - 0.0, -0.64); tp.visible = false; s.stage.add(tp); s.tapes.push(tp); }
    s.hero = s.tgs[1]; return s; },
  draw(s, t, info) { const o = at(info, 'outside', 1.7);
    s.tgs.forEach((tg, i) => { tg.update(t, { lid: 0.3, paddle: 0.4, look: [0, 0] }); s.tapes[i].visible = t > 0.25 + i * 0.22; });
    s.lin.pose(addPose(mixPose(POSE.holdFront, { ...POSE.holdFront, armR: [1.3, 0.3, 0.4], elbowR: 0.5 }, 0.5 + 0.5 * Math.sin(t * 7)), idle(t, 2))); s.lin.face(EXPR.happy, t);
    const sh = ease.outBack(prog(t, o - 0.15, o + 0.25)); s.ade.rotation.y = lerp(-0.6, 0.15, ease.inOut(prog(t, o - 0.4, o)));
    s.ade.pose(addPose(shrug(POSE.relaxed, sh), idle(t, 5))); s.ade.face(mixExpr(EXPR.neutral, { ...EXPR.deadpan, pupil: [0, 0] }, sh), t);
    camMove(s.stage, t, [[0, { pos: [0.2, 2.5, 7.4], look: [0, 1.6, -0.6], fov: 38 }], [info.dur, { pos: [0.1, 2.2, 4.0], look: [0, 1.85, -0.7], fov: 34 }]]); },
  overlay(g, t, info, s) { const o = at(info, 'outside', 1.7); fxr(g, t, s, [{ fx: 'question', on: 'hero', at: 0.6, until: 1.6, scale: 0.7 }, { fx: 'sweat', on: 'hero', at: o, scale: 0.7 }, { fx: 'exclaim', on: 'ade', at: o + 0.15, until: o + 0.9, scale: 0.8 }]); },
});

// s09 "they checked the bodies." — tweezers up, push in to an extreme close-up of a sweating face
registerShot('s09', { kind: '3d',
  init(T) { const s = labStage(T, { micX: 2.2 }); s.box = rbox(0.9, 0.3, 0.6, '#e9e6de', -0.3, 1.53, -0.9, 0.05); outline(s.box, { px: 2.2 }); s.stage.add(s.box);
    s.ade = scientist2(); s.ade.position.set(0, 0, -2.45); s.stage.add(s.ade); s.tw = tweezers(); s.ade.hold('R', s.tw); s.tw.rotation.set(0.4, 0, 0.2); return s; },
  draw(s, t, info) { const k = ease.inOut(prog(t, 0, info.dur));
    s.ade.pose(addPose({ ...POSE.stand, armR: [1.0 + 0.25 * k, 0.15, 0.2], elbowR: 1.6 - 0.4 * k, armL: [0.3, 0.2, 0], elbowL: 0.4, headNod: 0.12 - 0.12 * k }, tremble(t, 1 + k)));
    s.ade.face(mixExpr(EXPR.worried, { ...EXPR.shocked, mouth: 'wavy', pupil: [0, 0] }, ease.inOut(prog(t, 0.5, 1.1))), t);
    camMove(s.stage, t, [[0, { pos: [0, 2.45, 2.6], look: [0, 1.9, -2.4], fov: 36 }], [0.55, { pos: [0, 2.3, 1.5], look: [0, 2.05, -2.45], fov: 32 }], [info.dur, { pos: [0, 2.17, -0.55], look: [0, 2.13, -2.45], fov: 30 }]], ease.inOut); },
  overlay(g, t, info, s) { fxr(g, t, s, [{ fx: 'sweat', on: 'ade', at: 0.45 }, { fx: 'sweat', on: 'ade', at: 0.95, seed: 4, dx: -60 }]); },
});

// s10 "And the animals were ALIVE." — through the microscope: tardigrades strolling around on a bright slide
registerShot('s10', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'warm', fov: 40, bg: '#f6f0c4', shadowSize: 6, ambient: 1.4 });
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), toon('#f2ecbe')); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; st.add(fl);
    const cellM = toon('#cfe6a8', { transparent: true, opacity: 0.6, fresh: true }); for (let i = 0; i < 14; i++) { const c = new THREE.Mesh(new THREE.SphereGeometry(0.4 + (i % 4) * 0.15, 16, 10), cellM); c.scale.y = 0.25; c.position.set(Math.sin(i * 2.3) * 5, 0.05, Math.cos(i * 1.7) * 4 - 1); c.userData.noOutline = true; st.add(c); }
    const s = { stage: st, tgs: [] }; [[-1.4, 0.2, 1.4], [1.6, -1.2, -1.2], [0.3, 1.4, 2.6]].forEach(([x, z, ry], i) => { const tg = tardigrade({ seed: 30 + i, scale: 0.85 }); tg.position.set(x, 0, z); tg.rotation.y = ry; tg.ry = ry; st.add(tg); s.tgs.push(tg); });
    s.hero = s.tgs[0]; return s; },
  draw(s, t, info) { const a = at(info, 'alive', 1.05);
    s.tgs.forEach((tg, i) => { const sp = 0.45; tg.position.x += 0; const d = t * sp; tg.position.set([-1.4, 1.6, 0.3][i] + Math.sin(tg.ry) * d, Math.abs(Math.sin(t * 9 + i)) * 0.03, [0.2, -1.2, 1.4][i] + Math.cos(tg.ry) * d);
      tg.update(t, { paddle: 1, lid: i === 0 && t > a ? 0.05 : 0.3, look: i === 0 && t > a ? [0, 0.2] : [0, 0], lean: 0.25 }); });
    if (t > a) { s.hero.rotation.y = lerp(s.hero.ry, 0.35, ease.out(prog(t, a, a + 0.3))); }
    camMove(s.stage, t, [[0, { pos: [0, 5.0, 7.0], look: [0, 0.4, 0.2], fov: 42 }], [info.dur, { pos: [0, 4.6, 6.4], look: [0, 0.4, 0.3], fov: 42 }]]); },
  overlay(g, t, info, s) { const a = at(info, 'alive', 1.05); fxr(g, t, s, [{ fx: 'exclaim', on: 'hero', at: a, scale: 0.9 }, { fx: 'sparkle', on: 'hero', at: a + 0.1, scale: 0.8 }, { fx: 'flash', at: a, dur: 0.22 }]);
    scopeMask(g, E.W / 2, E.H * 0.42, E.W * 0.47); },
});

// s11 "Some even laid eggs." — an egg pops out on the slide; in the background Dr Lin faints (stars)
registerShot('s11', { kind: '3d',
  init(T) { const s = labStage(T, { micX: 3.5, target: [0, 1, -1.5] }); const sl = rbox(1.4, 0.04, 0.7, '#dff2f6', -0.3, 1.4, -0.75, 0.02); sl.material = toon('#dff2f6', { transparent: true, opacity: 0.7, fresh: true }); s.stage.add(sl);
    s.tg = tardigrade({ seed: 5, scale: 0.42 }); s.tg.position.set(-0.45, 1.42, -0.8); s.tg.rotation.y = 0.35; s.stage.add(s.tg);
    s.egg = ball(0.09, '#fbf3dc', 0, 0, 0, 16); outline(s.egg, { px: 2.2 }); s.stage.add(s.egg);
    s.lin = scientist(); s.lin.position.set(1.0, 0, -3.0); s.lin.rotation.y = -0.3; s.stage.add(s.lin); return s; },
  draw(s, t, info) { const e = at(info, 'eggs', 0.6);
    const pe = prog(t, e - 0.05, e + 0.25); s.egg.visible = t > e - 0.05; s.egg.scale.setScalar(ease.outBack(pe)); s.egg.position.set(-0.45 - 0.05 - pe * 0.28, 1.47, -0.95 + pe * 0.05);
    s.tg.update(t, { lid: t > e ? 0.45 : 0.15, look: t > e ? [0, 0] : [0.5, 0], bob: t > e - 0.1 && t < e + 0.15 ? 0.03 : 0, headTilt: t > e ? 0.12 : 0 });
    const f = ease.in(prog(t, e + 0.25, e + 0.7)); s.lin.rotation.x = -f * 1.25; s.lin.position.y = f * 0.05;
    s.lin.pose(addPose(mixPose(POSE.stand, { ...POSE.panic, armL: [0.3, 1.4, 0], armR: [0.3, 1.4, 0] }, ease.out(prog(t, e, e + 0.3))), idle(t))); s.lin.face(mixExpr(EXPR.shocked, EXPR.asleep, prog(t, e + 0.3, e + 0.5)), t);
    camMove(s.stage, t, [[0, { pos: [-0.1, 2.35, 3.6], look: [0.25, 1.8, -1.6], fov: 38 }], [info.dur, { pos: [-0.05, 2.3, 3.2], look: [0.25, 1.8, -1.6], fov: 38 }]]); },
  overlay(g, t, info, s) { const e = at(info, 'eggs', 0.6); fxr(g, t, s, [{ fx: 'sparkle', on: [-0.78, 1.5, -0.9], at: e + 0.05, scale: 0.6 }, { fx: 'hearts', on: 'tg', at: e + 0.1, scale: 0.7 }, { fx: 'stars', on: 'lin', at: e + 0.55 }]); },
});
